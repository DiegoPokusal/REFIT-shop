const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  SITE_URL = 'https://refitvintage.sk',
  ORDER_SERVER_URL, // existing Railway server that already handles /api/order + notifications
  ALLOWED_ORIGIN = 'https://refitvintage.sk',
  PORT = 4000,
  SHIPPING_PRICE_CENTS = 350,
  ALLOWED_SHIPPING_COUNTRIES = 'SK,CZ',
  STOCK_JSON_URL = 'https://raw.githubusercontent.com/DiegoPokusal/REFIT-shop/main/stock.json',
  // DATA_DIR should point at a mounted Railway Volume so state.json (views +
  // sold events) survives across deploys/restarts — without a volume,
  // Railway's container filesystem resets on every deploy. Same caveat as
  // the order server's orders.json.
  DATA_DIR = '.',
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Chýba STRIPE_SECRET_KEY v premenných prostredia.');
  process.exit(1);
}
if (!ORDER_SERVER_URL) {
  console.error('❌ Chýba ORDER_SERVER_URL (adresa existujúceho servera na /api/order).');
  process.exit(1);
}

const stripe = Stripe(STRIPE_SECRET_KEY);
const app = express();

app.use(cors({ origin: ALLOWED_ORIGIN }));

// --- Local state: view counts + sold events, read by smartupdate.js ---
const STATE_FILE = `${DATA_DIR}/state.json`;
const MAX_SOLD_EVENTS = 200;

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { views: {}, soldEvents: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return { views: raw.views || {}, soldEvents: raw.soldEvents || [] };
  } catch {
    return { views: {}, soldEvents: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Canonical stock, fetched from the repo so we never trust the client's
// cart data for price/availability (short in-memory cache to avoid hammering
// GitHub on every detail view / checkout click) ---
let stockCache = { data: null, fetchedAt: 0 };
const STOCK_CACHE_MS = 60 * 1000;

function flattenStock(raw) {
  if (Array.isArray(raw?.products)) return raw.products;
  // Legacy category-keyed shape ({jacket:[],hoodie:[],...})
  const products = [];
  for (const key of Object.keys(raw || {})) {
    if (Array.isArray(raw[key])) products.push(...raw[key]);
  }
  return products;
}

async function fetchCanonicalStock() {
  const now = Date.now();
  if (stockCache.data && now - stockCache.fetchedAt < STOCK_CACHE_MS) {
    return stockCache.data;
  }
  const res = await fetch(STOCK_JSON_URL, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`stock.json fetch zlyhalo (${res.status})`);
  const raw = await res.json();
  const products = flattenStock(raw);
  stockCache = { data: products, fetchedAt: now };
  return products;
}

// --- Create Checkout Session ---
// Body: { items: [{ id, name, price, image, url, sizes, category }] }
app.post('/create-checkout-session', express.json(), async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Košík je prázdny.' });
    }

    let stock;
    try {
      stock = await fetchCanonicalStock();
    } catch (err) {
      console.error('❌ Nepodarilo sa overiť sklad:', err.message);
      return res.status(503).json({ error: 'Nepodarilo sa overiť dostupnosť. Skús to znova.' });
    }

    const byId = new Map(stock.map(p => [String(p.id), p]));
    const unavailable = [];
    const resolvedItems = [];

    for (const item of items) {
      const product = byId.get(String(item.id));
      if (!product) {
        unavailable.push({ id: item.id, name: item.name, reason: 'not_found' });
        continue;
      }
      if (product.status && product.status !== 'available') {
        unavailable.push({ id: item.id, name: product.name, reason: product.status });
        continue;
      }
      // Use the canonical price from stock.json, never the client's — this
      // also closes off price tampering regardless of whether it matches.
      resolvedItems.push({ ...item, name: product.name, price: product.price, image: product.image });
    }

    if (unavailable.length) {
      return res.status(409).json({
        error: 'Niektoré kusy v košíku už nie sú dostupné.',
        unavailable,
      });
    }

    const line_items = resolvedItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: String(item.name).slice(0, 250),
          images: item.image ? [item.image] : undefined,
          metadata: {
            productId: String(item.id),
            size: (item.sizes && item.sizes[0]) || 'N/A',
            url: item.url || '',
            category: item.category || '',
          },
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: {
        allowed_countries: ALLOWED_SHIPPING_COUNTRIES.split(','),
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Number(SHIPPING_PRICE_CENTS), currency: 'eur' },
            display_name: 'Doprava (Packeta)',
          },
        },
      ],
      phone_number_collection: { enabled: true },
      success_url: `${SITE_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Chyba pri vytváraní Checkout Session:', err.message);
    res.status(500).json({ error: 'Nepodarilo sa vytvoriť platbu.' });
  }
});

// --- View tracking (product detail opens) ---
app.post('/api/track-view', express.json(), (req, res) => {
  const productId = req.body?.productId;
  if (!productId) return res.status(400).json({ error: 'Chýba productId.' });

  const state = loadState();
  const key = String(productId);
  state.views[key] = (state.views[key] || 0) + 1;
  saveState(state);
  res.json({ ok: true });
});

// --- State read, polled by smartupdate.js every 30 min ---
app.get('/api/state', (req, res) => {
  const state = loadState();
  res.json(state);
});

// --- Stripe webhook ---
// Must use the raw body for signature verification, so this route is
// registered BEFORE any global express.json() middleware would touch it.
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Neplatný webhook podpis:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await handleCompletedCheckout(event.data.object.id);
    } catch (err) {
      console.error('❌ Chyba pri spracovaní objednávky:', err.message);
      // Still 200 the webhook so Stripe doesn't retry forever on our bug;
      // the payment itself already succeeded on Stripe's side regardless.
    }
  }

  res.json({ received: true });
});

async function handleCompletedCheckout(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  const lineItems = session.line_items?.data || [];
  const shipping = session.shipping_details || session.customer_details;
  const fullName = shipping?.name || '';
  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ');
  const addr = shipping?.address || {};

  const items = lineItems
    .filter(li => li.price?.product?.metadata?.productId) // skip the shipping line item
    .map(li => ({
      productId: li.price.product.metadata.productId,
      name: li.price.product.name,
      price: li.price.unit_amount / 100,
      qty: li.quantity,
      size: li.price.product.metadata.size || 'N/A',
      url: li.price.product.metadata.url || '',
    }));

  const order = {
    customer: {
      firstName: firstName || '',
      lastName: lastName || '',
      email: session.customer_details?.email || '',
      phone: session.customer_details?.phone || '',
      street: addr.line1 ? `${addr.line1}${addr.line2 ? ' ' + addr.line2 : ''}` : '',
      city: addr.city || '',
      zip: addr.postal_code || '',
    },
    items: items.map(({ productId, ...rest }) => rest), // order server doesn't need productId
    total: (session.amount_total / 100).toFixed(2),
    stripeSessionId: session.id,
    paymentStatus: session.payment_status,
  };

  const res = await fetch(`${ORDER_SERVER_URL}/api/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    throw new Error(`Order server odpovedal ${res.status}`);
  }

  // Record sold items so smartupdate.js can mark them status:'sold' on its
  // next run — this server doesn't know tier/score, it just reports what sold.
  const state = loadState();
  const soldAt = new Date().toISOString();
  for (const item of items) {
    state.soldEvents.push({ productId: item.productId, price: item.price, soldAt });
  }
  if (state.soldEvents.length > MAX_SOLD_EVENTS) {
    state.soldEvents = state.soldEvents.slice(-MAX_SOLD_EVENTS);
  }
  saveState(state);

  console.log(`✅ Objednávka odoslaná pre session ${session.id}`);
}

app.get('/', (req, res) => res.send('REFIT checkout server beží.'));

app.listen(PORT, () => console.log(`🚀 REFIT checkout server beží na porte ${PORT}`));
