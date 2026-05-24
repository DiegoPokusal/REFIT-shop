const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

const EMAIL = process.env.THRIFTED_EMAIL;
const PASSWORD = process.env.THRIFTED_PASSWORD;
const ORDERS_FILE = 'orders.json';

// Nacitaj cakajuce objednavky
function loadOrders() {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

async function orderProduct(productUrl) {
  console.log(`🛒 Objednávam: ${productUrl}`);
  
  const browser = await puppeteer.launch({
    headless: false, // headless: true pre produkciu
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  try {
    // Prihlasenie
    console.log('🔐 Prihlasovanie...');
    await page.goto('https://www.thrifted.com/account/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', EMAIL, { delay: 50 });
    await page.type('input[type="password"]', PASSWORD, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Prihlásený');

    // Otvor produkt
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-form__submit', { timeout: 10000 });
    
    // Pridaj do kosika
    console.log('🛍️ Pridávam do košíka...');
    await page.click('.product-form__submit');
    await new Promise(r => setTimeout(r, 2000));

    // Prejdi na checkout
    await page.goto('https://www.thrifted.com/checkout', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));

    // Pokracuj na platbu (pouzije ulozenu adresu a kartu)
    const continueBtn = await page.$('button[data-trekkie-id="continue_to_shipping_method"]') ||
                        await page.$('button#continue_button') ||
                        await page.$('button[type="submit"]');
    
    if (continueBtn) {
      await continueBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }

    // Dokoncit objednavku
    const payBtn = await page.$('button#complete_order_button') ||
                   await page.$('button[data-trekkie-id="complete_order"]') ||
                   await page.$('#complete_order_button');
    
    if (payBtn) {
      console.log('💳 Dokončujem objednávku...');
      await payBtn.click();
      await new Promise(r => setTimeout(r, 5000));
      console.log('✅ Objednávka dokončená!');
    } else {
      console.log('⚠️ Potrebný manuálny zásah - skontroluj prehliadač');
      await new Promise(r => setTimeout(r, 30000)); // Nechaj okno otvorene 30s
    }

  } catch (err) {
    console.error('❌ Chyba:', err.message);
  } finally {
    await browser.close();
  }
}

async function processOrders() {
  const orders = loadOrders();
  const pending = orders.filter(o => o.status === 'pending');
  
  if (pending.length === 0) {
    console.log('📭 Žiadne nové objednávky');
    return;
  }

  console.log(`📬 Spracovávam ${pending.length} objednávok...`);

  for (const order of pending) {
    for (const item of order.items) {
      if (item.url) {
        await orderProduct(item.url);
        item.ordered = true;
      }
    }
    order.status = 'processed';
    order.processedAt = new Date().toISOString();
    saveOrders(orders);
    console.log(`✅ Objednávka #${order.id} spracovaná`);
  }
}

processOrders();