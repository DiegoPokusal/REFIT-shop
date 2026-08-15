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

// --- Create Checkout Session ---
// Body: { items: [{ id, name, price, image, url, sizes, category }] }
app.post('/create-checkout-session', express.json(), async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Košík je prázdny.' });
    }

    const line_items = items.map(item => ({
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
    items,
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

  console.log(`✅ Objednávka odoslaná pre session ${session.id}`);
}

app.get('/', (req, res) => res.send('REFIT checkout server beží.'));

app.listen(PORT, () => console.log(`🚀 REFIT checkout server beží na porte ${PORT}`));
