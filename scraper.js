const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://www.thrifted.com';
const OUTPUT_FILE = 'products.json';

// Kategorie ktore chceme stiahnut
const COLLECTIONS = [
  'mens-vintage-homepage',
  'womens-vintage-homepage',
  'vintage-sweatshirts',
  'vintage-jackets',
  'vintage-t-shirts',
  'vintage-hoodies',
  'vintage-trousers-jeans',
];

async function fetchProducts(collection, page = 1) {
  try {
    const url = `${BASE_URL}/collections/${collection}/products.json?limit=50&page=${page}`;
    console.log(`Sťahujem: ${url}`);
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });
    return res.data.products || [];
  } catch (err) {
    console.log(`Chyba pri ${collection} strana ${page}: ${err.message}`);
    return [];
  }
}

function mapProduct(p) {
  const variant = p.variants?.[0] || {};
  const image = p.images?.[0]?.src || '';
  const sizes = p.variants
    ?.map(v => v.option1)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    id: p.id,
    name: p.title,
    price: parseFloat(variant.price) || 0,
    compare_price: parseFloat(variant.compare_at_price) || 0,
    image: image,
    sizes: sizes,
    category: p.product_type || '',
    tags: p.tags || [],
    url: `${BASE_URL}/products/${p.handle}`,
    available: variant.available || false,
  };
}

async function scrapeAll() {
  console.log('🔄 Spúšťam REFIT scraper...\n');
  let allProducts = [];
  const seen = new Set();

  for (const collection of COLLECTIONS) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const products = await fetchProducts(collection, page);
      if (products.length === 0) {
        hasMore = false;
      } else {
        for (const p of products) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            allProducts.push(mapProduct(p));
          }
        }
        console.log(`✅ ${collection} strana ${page}: ${products.length} produktov`);
        page++;
        if (products.length < 50) hasMore = false;
        // Pauza aby sme nezahlcili server
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }

  // Uloz do JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
  console.log(`\n✅ Hotovo! Stiahnutých ${allProducts.length} produktov → ${OUTPUT_FILE}`);
}

scrapeAll();