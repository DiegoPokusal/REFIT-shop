const fs = require('fs');
const stockData = JSON.parse(fs.readFileSync('stock.json', 'utf8'));
const products = Object.values(stockData).flat();
const available = products.filter(p => p.available && p.price > 0 && p.price <= 145);
console.log(`📦 Dostupných produktov: ${available.length} z ${products.length}`);
function getCategory(p) {
  const type = (p.category || '').toLowerCase();
  const tags = (p.tags || []).join(' ').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const all = type + ' ' + tags + ' ' + name;
  if (all.includes('jacket') || all.includes('coat') || all.includes('bunda')) return 'jacket';
  if (all.includes('hoodie') || all.includes('hooded')) return 'hoodie';
  if (all.includes('sweatshirt') || all.includes('crewneck') || all.includes('sweater')) return 'sweatshirt';
  if (all.includes('t-shirt') || all.includes('tshirt') || all.includes('tee')) return 'tee';
  return 'other';
}
function getCategoryName(cat) {
  return { jacket:'Bunda', hoodie:'Hoodie', sweatshirt:'Sweatshirt', tee:'Tričko', other:'Oblečenie' }[cat] || 'Oblečenie';
}
const jackets = available.filter(p => getCategory(p) === 'jacket').slice(0, 40);
const hoodies = available.filter(p => getCategory(p) === 'hoodie').slice(0, 40);
const sweatshirts = available.filter(p => getCategory(p) === 'sweatshirt').slice(0, 40);
const tees = available.filter(p => getCategory(p) === 'tee').slice(0, 40);
const allProducts = [...jackets, ...hoodies, ...sweatshirts, ...tees];
const dropsProducts = allProducts.filter(p => p.price <= 116);
const premiumProducts = allProducts.filter(p => p.price > 116 && p.price <= 145);
console.log(`👕 DROPS: ${dropsProducts.length} | PREMIUM: ${premiumProducts.length}`);
const productData = allProducts.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image: p.image,
  images: p.images || [p.image],
  sizes: p.sizes || [],
  category: getCategory(p),
  url: p.url,
}));
const html = `<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>REFIT — Vintage Streetwear</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #0a0a0a;
    --white: #f0ece4;
    --red: #e63222;
    --gray: #1a1a1a;
    --mid: #2a2a2a;
    --mid2: #333;
    --text-muted: #666;
    --text-dim: #444;
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 40px;
    --space-2xl: 64px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--black); color: var(--white); font-family: 'Space Mono', monospace; overflow-x: hidden; line-height: 1.6; }
  @media (pointer: fine) { body { cursor: none; } }

  /* CURSOR */
  .cursor { width: 10px; height: 10px; background: var(--red); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999; mix-blend-mode: difference; transition: transform 0.15s ease; }
  .cursor-ring { width: 32px; height: 32px; border: 1px solid rgba(240,236,228,0.5); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998; transition: all 0.1s ease; }
  @media (pointer: coarse) { .cursor, .cursor-ring { display: none; } }

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(10,10,10,0.98); backdrop-filter: blur(8px); border-bottom: 1px solid var(--mid); }
  @media (min-width: 768px) { nav { padding: 16px 40px; } }
  .logo-link { display: flex; align-items: center; text-decoration: none; }
  .logo-svg { height: 40px; width: auto; }
  @media (min-width: 768px) { .logo-svg { height: 48px; } }
  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; transition: color 0.2s; }
  .nav-links a:hover { color: var(--white); }
  @media (max-width: 520px) { .nav-links { display: none; } }
  .cart-btn { background: none; border: 1px solid var(--mid2); color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.2em; padding: 10px 18px; cursor: pointer; transition: all 0.2s; position: relative; }
  .cart-btn:hover, .cart-btn:focus { background: var(--white); color: var(--black); outline: none; }
  .cart-count { position: absolute; top: -7px; right: -7px; background: var(--red); color: var(--white); width: 18px; height: 18px; border-radius: 50%; font-size: 0.55rem; display: flex; align-items: center; justify-content: center; font-weight: 700; }

  /* HERO */
  .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 20px 100px; position: relative; overflow: hidden; }
  @media (min-width: 768px) { .hero { padding: 0 40px 100px; } }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 65% 35%, rgba(230,50,34,0.06) 0%, transparent 55%), var(--black); }
  .hero-label { font-size: 0.58rem; letter-spacing: 0.35em; color: var(--red); text-transform: uppercase; margin-bottom: 16px; opacity: 0; animation: fadeUp 0.8s 0.2s forwards; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(4.5rem, 18vw, 14rem); line-height: 0.88; letter-spacing: -0.02em; position: relative; z-index: 1; opacity: 0; animation: fadeUp 0.8s 0.4s forwards; }
  .hero-title .outline { -webkit-text-stroke: 1.5px var(--white); color: transparent; }
  .hero-sub { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; opacity: 0; animation: fadeUp 0.8s 0.6s forwards; }
  @media (min-width: 640px) { .hero-sub { flex-direction: row; justify-content: space-between; align-items: flex-end; } }
  .hero-desc { font-size: 0.68rem; color: var(--text-muted); line-height: 1.9; max-width: 300px; }
  .hero-desc-note { font-size: 0.56rem; color: var(--text-dim); letter-spacing: 0.08em; line-height: 1.7; display: block; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--mid); }
  .hero-cta { background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.25em; padding: 18px 48px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; text-align: center; flex-shrink: 0; }
  .hero-cta:hover { background: var(--white); color: var(--black); transform: translateY(-1px); }
  .hero-ticker { position: absolute; bottom: 0; left: 0; right: 0; background: var(--red); padding: 9px 0; overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; animation: ticker 22s linear infinite; }
  .ticker-inner span { font-family: 'Bebas Neue', sans-serif; font-size: 0.8rem; letter-spacing: 0.35em; padding: 0 36px; color: var(--white); }

  /* SHOP */
  .shop-section { padding: 72px 16px 40px; }
  @media (min-width: 768px) { .shop-section { padding: 88px 40px 60px; } }
  .section-toggle { display: flex; gap: 10px; margin-bottom: 48px; }
  @media (min-width: 600px) { .section-toggle { gap: 16px; } }
  .toggle-btn { flex: 1; padding: 18px 12px; border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.2em; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
  @media (min-width: 480px) { .toggle-btn { font-size: 1.5rem; padding: 22px 24px; } }
  @media (min-width: 768px) { .toggle-btn { font-size: 1.8rem; padding: 26px 40px; } }
  .toggle-drops { background: var(--mid); color: var(--text-muted); border: 1px solid var(--mid2); }
  .toggle-drops.active { background: var(--white); color: var(--black); border-color: var(--white); }
  .toggle-premium { background: #111118; color: #888; border: 1px solid #2a2a3a; }
  .toggle-premium.active { background: linear-gradient(135deg, #8b6914 0%, #c9922a 30%, #f0c040 50%, #c9922a 70%, #8b6914 100%); color: #1a1000; border-color: #c9922a; box-shadow: 0 0 24px rgba(201,146,42,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
  .toggle-premium.active::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%); animation: shimmer 2.5s ease-in-out infinite; pointer-events: none; }
  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  .toggle-label { font-size: 0.5rem; letter-spacing: 0.18em; display: block; margin-top: 5px; opacity: 0.7; }
  .shop-panel { display: none; }
  .shop-panel.active { display: block; }
  .section-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--mid); padding-bottom: 20px; }
  @media (min-width: 600px) { .section-header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; } }
  .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: 0.12em; }
  @media (min-width: 768px) { .section-title { font-size: 2.8rem; } }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-btn { background: none; border: 1px solid var(--mid2); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.58rem; letter-spacing: 0.12em; padding: 7px 12px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
  .filter-btn:hover { border-color: var(--white); color: var(--white); }
  .filter-btn.active { background: var(--white); color: var(--black); border-color: var(--white); }

  /* PRODUCT GRID */
  .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
  @media (min-width: 540px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 900px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1200px) { .product-grid { grid-template-columns: repeat(5, 1fr); } }
  .product-card { background: var(--gray); position: relative; overflow: hidden; cursor: pointer; transition: background 0.2s; }
  .product-card:hover { background: #222; }
  .product-img { width: 100%; aspect-ratio: 3/4; background: var(--mid); position: relative; overflow: hidden; }
  .product-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
  .product-card:hover .product-img img { transform: scale(1.04); }
  .product-badge { position: absolute; top: 8px; left: 8px; background: var(--red); color: var(--white); font-family: 'Bebas Neue', sans-serif; font-size: 0.6rem; letter-spacing: 0.2em; padding: 3px 8px; z-index: 2; }
  .product-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.25s ease; background: rgba(10,10,10,0.82); }
  .product-card:hover .product-overlay { opacity: 1; }
  @media (pointer: coarse) {
    .product-overlay { opacity: 1; background: linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.2) 45%, transparent 70%); justify-content: flex-end; padding-bottom: 14px; }
  }
  .quick-add { background: var(--white); color: var(--black); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 0.82rem; letter-spacing: 0.18em; padding: 12px 20px; cursor: pointer; transition: all 0.2s; width: 82%; }
  .quick-add:hover { background: var(--red); color: var(--white); }
  .quick-detail { background: transparent; color: var(--white); border: 1px solid rgba(240,236,228,0.35); font-family: 'Bebas Neue', sans-serif; font-size: 0.72rem; letter-spacing: 0.15em; padding: 9px 20px; cursor: pointer; transition: all 0.2s; width: 82%; }
  .quick-detail:hover { background: rgba(240,236,228,0.1); border-color: var(--white); }
  @media (pointer: coarse) { .quick-detail { display: none; } }
  .product-info { padding: 10px 12px 12px; border-top: 1px solid var(--mid); }
  @media (min-width: 768px) { .product-info { padding: 12px 16px 16px; } }
  .product-category { font-size: 0.5rem; letter-spacing: 0.25em; color: var(--text-dim); text-transform: uppercase; margin-bottom: 5px; }
  .product-name { font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; letter-spacing: 0.06em; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
  @media (min-width: 768px) { .product-name { font-size: 1.05rem; } }
  .product-bottom { display: flex; justify-content: space-between; align-items: center; gap: 4px; }
  .product-price { font-size: 0.82rem; font-weight: 700; color: var(--white); letter-spacing: 0.05em; }
  .product-sizes { display: flex; gap: 3px; flex-wrap: wrap; }
  .size-tag { font-size: 0.48rem; border: 1px solid var(--mid2); padding: 2px 5px; color: var(--text-muted); letter-spacing: 0.05em; }

  /* CART */
  .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 800; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(3px); }
  .cart-overlay.open { opacity: 1; pointer-events: all; }
  .cart-sidebar { position: fixed; top: 0; right: 0; width: 100%; max-width: 400px; height: 100vh; height: 100dvh; background: var(--gray); z-index: 900; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; border-left: 1px solid var(--mid); }
  .cart-sidebar.open { transform: translateX(0); }
  .cart-header { padding: 20px 24px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .cart-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: 0.18em; }
  .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.6rem; cursor: pointer; padding: 4px; transition: color 0.2s; line-height: 1; }
  .close-btn:hover { color: var(--red); }
  .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .cart-items::-webkit-scrollbar { width: 2px; }
  .cart-items::-webkit-scrollbar-thumb { background: var(--mid2); }
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; color: var(--text-muted); }
  .cart-empty-icon { font-size: 2.5rem; opacity: 0.2; }
  .cart-empty p { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; }
  .cart-item { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--mid); }
  .cart-item-img { width: 58px; height: 76px; background: var(--mid); flex-shrink: 0; overflow: hidden; }
  .cart-item-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cart-item-details { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
  .cart-item-name { font-family: 'Bebas Neue', sans-serif; font-size: 0.88rem; letter-spacing: 0.06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-meta { font-size: 0.52rem; color: var(--text-muted); letter-spacing: 0.12em; margin-top: 4px; }
  .cart-item-controls { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  .cart-unique-label { font-size: 0.5rem; color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; }
  .remove-btn { background: none; border: none; color: var(--text-dim); font-size: 0.52rem; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; transition: color 0.2s; padding: 0; }
  .remove-btn:hover { color: var(--red); }
  .cart-item-price { font-size: 0.88rem; font-weight: 700; align-self: flex-start; margin-top: 2px; white-space: nowrap; flex-shrink: 0; }
  .cart-footer { padding: 20px 24px; border-top: 1px solid var(--mid); flex-shrink: 0; }
  .cart-total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  .cart-total-label { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--text-muted); text-transform: uppercase; }
  .cart-total-amount { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.08em; }
  .checkout-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.25em; padding: 16px; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
  .checkout-btn:hover { background: var(--white); color: var(--black); }
  .continue-btn { width: 100%; background: none; border: 1px solid var(--mid2); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.58rem; letter-spacing: 0.18em; padding: 12px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .continue-btn:hover { border-color: var(--white); color: var(--white); }

  /* CHECKOUT */
  .checkout-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.25s; backdrop-filter: blur(6px); overflow-y: auto; padding: 20px 0 40px; }
  @media (min-width: 640px) { .checkout-modal { align-items: center; padding: 24px; } }
  .checkout-modal.open { opacity: 1; pointer-events: all; }
  .checkout-box { background: var(--gray); border: 1px solid var(--mid2); width: 96%; max-width: 560px; transform: translateY(16px); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
  .checkout-modal.open .checkout-box { transform: translateY(0); }
  .checkout-header { padding: 20px 24px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; }
  .checkout-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.18em; }
  .checkout-body { padding: 24px; }
  .form-section { margin-bottom: 28px; }
  .form-section-title { font-size: 0.56rem; letter-spacing: 0.28em; color: var(--red); text-transform: uppercase; margin-bottom: 16px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .form-row.full { grid-template-columns: 1fr; }
  @media (max-width: 380px) { .form-row { grid-template-columns: 1fr; } }
  .form-group { display: flex; flex-direction: column; gap: 7px; }
  .form-label { font-size: 0.52rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
  .form-input { background: #222; border: 1px solid var(--mid2); color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.78rem; padding: 13px 14px; transition: border-color 0.2s; outline: none; cursor: text; -webkit-appearance: none; border-radius: 0; }
  .form-input:focus { border-color: var(--red); background: #1e1e1e; }
  .form-input::placeholder { color: var(--text-dim); font-size: 0.68rem; }
  .order-summary { background: var(--black); border: 1px solid var(--mid); padding: 20px; margin-bottom: 20px; }
  .order-summary-title { font-size: 0.52rem; letter-spacing: 0.25em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; }
  .summary-line { display: flex; justify-content: space-between; font-size: 0.68rem; margin-bottom: 9px; color: #ccc; }
  .summary-line.total { border-top: 1px solid var(--mid); padding-top: 14px; margin-top: 14px; font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: 0.1em; color: var(--white); }
  .place-order-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.05rem; letter-spacing: 0.25em; padding: 18px; cursor: pointer; transition: all 0.2s; }
  .place-order-btn:hover { background: var(--white); color: var(--black); }
  .success-screen { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; text-align: center; gap: 20px; }
  .success-screen.show { display: flex; }
  .checkout-form.hide { display: none; }
  .success-icon { width: 72px; height: 72px; border: 2px solid var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
  .success-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.9rem; letter-spacing: 0.15em; }
  .success-text { font-size: 0.68rem; color: var(--text-muted); line-height: 1.9; max-width: 300px; }

  /* DETAIL */
  .detail-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000; display: none; align-items: flex-start; justify-content: center; backdrop-filter: blur(8px); overflow-y: auto; padding: 16px 0 40px; }
  @media (min-width: 600px) { .detail-modal { align-items: center; padding: 24px; } }
  .detail-modal.open { display: flex; }
  .detail-box { background: var(--gray); border: 1px solid var(--mid2); width: 96%; max-width: 880px; animation: fadeUp 0.3s ease; }
  .detail-carousel { position: relative; overflow: hidden; background: var(--mid); }
  .detail-carousel-track { display: flex; transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
  .detail-carousel-track img { min-width: 100%; width: 100%; aspect-ratio: 3/4; object-fit: cover; flex-shrink: 0; display: block; }
  @media (min-width: 600px) { .detail-carousel-track img { aspect-ratio: 4/5; } }
  .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(10,10,10,0.6); border: 1px solid rgba(255,255,255,0.15); color: var(--white); font-size: 1.3rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.2s; }
  .carousel-btn:hover { background: var(--red); border-color: var(--red); }
  .carousel-prev { left: 10px; }
  .carousel-next { right: 10px; }
  .carousel-dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; }
  .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.2s; }
  .carousel-dot.active { background: var(--white); transform: scale(1.3); }
  .detail-info { padding: 24px; }
  @media (min-width: 768px) { .detail-info { padding: 36px 40px; } }
  .detail-category { font-size: 0.52rem; letter-spacing: 0.28em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
  .detail-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.06em; margin-bottom: 14px; line-height: 1.05; }
  @media (min-width: 600px) { .detail-name { font-size: 2.2rem; } }
  .detail-price { font-size: 1.4rem; font-weight: 700; margin-bottom: 6px; }
  .detail-vintage-note { font-size: 0.55rem; color: var(--text-dim); letter-spacing: 0.1em; margin-bottom: 20px; padding: 10px 14px; border-left: 2px solid var(--mid2); }
  .detail-sizes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .detail-size-tag { font-size: 0.62rem; border: 1px solid var(--mid2); padding: 8px 16px; color: var(--text-muted); letter-spacing: 0.1em; transition: all 0.15s; }
  .detail-size-tag:hover { border-color: var(--white); color: var(--white); }
  .detail-add-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.05rem; letter-spacing: 0.25em; padding: 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
  .detail-add-btn:hover { background: var(--white); color: var(--black); }
  .detail-close { position: fixed; top: 14px; right: 14px; background: rgba(26,26,26,0.9); border: 1px solid var(--mid2); color: var(--white); font-size: 1.4rem; cursor: pointer; z-index: 2001; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .detail-close:hover { background: var(--red); border-color: var(--red); }

  /* FOOTER */
  footer { margin-top: 100px; border-top: 1px solid var(--mid); padding: 48px 20px; }
  @media (min-width: 640px) { footer { padding: 60px 40px; display: flex; justify-content: space-between; align-items: flex-end; } }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; letter-spacing: 0.08em; line-height: 1; -webkit-text-stroke: 1px #2a2a2a; color: transparent; margin-bottom: 24px; }
  @media (min-width: 640px) { .footer-logo { font-size: 5rem; margin-bottom: 0; } }
  .footer-info { font-size: 0.58rem; color: var(--text-muted); letter-spacing: 0.15em; line-height: 2.2; }
  @media (min-width: 640px) { .footer-info { text-align: right; } }
  .footer-copy { color: var(--text-dim); margin-top: 6px; }
  .footer-links { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 16px; }
  @media (min-width: 640px) { .footer-links { justify-content: flex-end; } }
  .footer-links a { color: #444; text-decoration: none; font-size: 0.52rem; letter-spacing: 0.12em; text-transform: uppercase; transition: color 0.2s; }
  .footer-links a:hover { color: var(--white); }

  /* COOKIE */
  .cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(26,26,26,0.98); border-top: 1px solid var(--mid2); padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 3000; gap: 16px; backdrop-filter: blur(4px); }
  .cookie-text { font-size: 0.58rem; color: #888; letter-spacing: 0.08em; line-height: 1.7; }
  .cookie-text a { color: var(--red); }
  .cookie-accept { background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 0.82rem; letter-spacing: 0.2em; padding: 10px 22px; cursor: pointer; flex-shrink: 0; transition: background 0.2s; }
  .cookie-accept:hover { background: var(--white); color: var(--black); }

  /* ANIMATIONS */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<nav>
  <a href="#" class="logo-link">
    <svg class="logo-svg" viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="600" height="240" fill="none" stroke="#e63222" stroke-width="2.5"/>
      <text x="340" y="192" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="900" font-size="138" fill="#f0ece4" letter-spacing="-3">REFIT</text>
      <rect x="40" y="200" width="600" height="4" fill="#e63222"/>
      <text x="340" y="236" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#e63222" letter-spacing="10">VINTAGE</text>
    </svg>
  </a>
  <ul class="nav-links">
    <li><a href="#shop">Shop</a></li>
    <li><a href="#about">O nás</a></li>
  </ul>
  <button class="cart-btn" onclick="toggleCart()">KOŠÍK <span class="cart-count" id="cartCount">0</span></button>
</nav>

<section class="hero">
  <div class="hero-bg"></div>
  <p class="hero-label">Vintage · Streetwear · Resell</p>
  <h1 class="hero-title">RE<span class="outline">FIT</span></h1>
  <div class="hero-sub">
    <p class="hero-desc">
      Unikátne vintage kúsky vybrané ručne. Každý kus je originál — keď je preč, je preč.
      <span class="hero-desc-note">Všetky kúsky sú použité vintage oblečenie. Môžu obsahovať drobné znaky nosenia zodpovedajúce ich veku a charakteru.</span>
    </p>
    <a href="#shop" class="hero-cta">Prezrieť kolekciu</a>
  </div>
  <div class="hero-ticker">
    <div class="ticker-inner">
      <span>VINTAGE DROP</span><span>·</span><span>REFIT ORIGINALS</span><span>·</span><span>STREETWEAR</span><span>·</span><span>LIMITED PIECES</span><span>·</span><span>HANDPICKED</span><span>·</span>
      <span>VINTAGE DROP</span><span>·</span><span>REFIT ORIGINALS</span><span>·</span><span>STREETWEAR</span><span>·</span><span>LIMITED PIECES</span><span>·</span><span>HANDPICKED</span><span>·</span>
    </div>
  </div>
</section>

<section class="shop-section" id="shop">
  <div class="section-toggle">
    <button class="toggle-btn toggle-drops active" onclick="switchSection('drops')">
      DROPS
      <span class="toggle-label">Do 116€ · Každodenný štýl</span>
    </button>
    <button class="toggle-btn toggle-premium" onclick="switchSection('premium')">
      ✦ PREMIUM
      <span class="toggle-label">116–145€ · Značkové kúsky</span>
    </button>
  </div>

  <div class="shop-panel active" id="dropsPanel">
    <div class="section-header">
      <h2 class="section-title">DROPS</h2>
      <div class="filters">
        <button class="filter-btn active" onclick="filterProducts('all', this, 'drops')">Všetko</button>
        <button class="filter-btn" onclick="filterProducts('jacket', this, 'drops')">Bundy</button>
        <button class="filter-btn" onclick="filterProducts('hoodie', this, 'drops')">Hoodies</button>
        <button class="filter-btn" onclick="filterProducts('sweatshirt', this, 'drops')">Sweatshirts</button>
        <button class="filter-btn" onclick="filterProducts('tee', this, 'drops')">Tričká</button>
      </div>
    </div>
    <div class="product-grid" id="dropsGrid"></div>
  </div>

  <div class="shop-panel" id="premiumPanel">
    <div class="section-header">
      <h2 class="section-title">✦ PREMIUM</h2>
      <div class="filters">
        <button class="filter-btn active" onclick="filterProducts('all', this, 'premium')">Všetko</button>
        <button class="filter-btn" onclick="filterProducts('jacket', this, 'premium')">Bundy</button>
        <button class="filter-btn" onclick="filterProducts('hoodie', this, 'premium')">Hoodies</button>
        <button class="filter-btn" onclick="filterProducts('sweatshirt', this, 'premium')">Sweatshirts</button>
        <button class="filter-btn" onclick="filterProducts('tee', this, 'premium')">Tričká</button>
      </div>
    </div>
    <div class="product-grid" id="premiumGrid"></div>
  </div>
</section>

<footer id="about">
  <div class="footer-logo">REFIT</div>
  <div class="footer-info">
    <p>Vintage Streetwear</p>
    <p>Každý kus ručne vybraný</p>
    <p class="footer-copy">© 2025 REFIT</p>
    <div class="footer-links">
      <a href="/obchodne-podmienky.html">Obchodné podmienky</a>
      <a href="/gdpr.html">Ochrana údajov</a>
      <a href="/vratenie-tovaru.html">Vrátenie tovaru</a>
    </div>
  </div>
</footer>

<div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>
<div class="cart-sidebar" id="cartSidebar">
  <div class="cart-header">
    <span class="cart-title">KOŠÍK</span>
    <button class="close-btn" onclick="toggleCart()">×</button>
  </div>
  <div class="cart-items" id="cartItems">
    <div class="cart-empty" id="cartEmpty">
      <div class="cart-empty-icon">◻</div>
      <p>Košík je prázdny</p>
    </div>
  </div>
  <div class="cart-footer">
    <div class="cart-total-row">
      <span class="cart-total-label">Celkom</span>
      <span class="cart-total-amount" id="cartTotal">0 €</span>
    </div>
    <button class="checkout-btn" onclick="openCheckout()">Pokračovať k platbe</button>
    <button class="continue-btn" onclick="toggleCart()">Pokračovať v nákupe</button>
  </div>
</div>

<div class="checkout-modal" id="checkoutModal">
  <div class="checkout-box">
    <div class="checkout-header">
      <span class="checkout-title">OBJEDNÁVKA</span>
      <button class="close-btn" onclick="closeCheckout()">×</button>
    </div>
    <div class="checkout-form checkout-body" id="checkoutForm">
      <div class="order-summary" id="orderSummary"></div>
      <div class="form-section">
        <p class="form-section-title">Kontaktné údaje</p>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Meno</label><input type="text" class="form-input" placeholder="Ján" id="firstName" autocomplete="given-name"></div>
          <div class="form-group"><label class="form-label">Priezvisko</label><input type="text" class="form-input" placeholder="Novák" id="lastName" autocomplete="family-name"></div>
        </div>
        <div class="form-row full"><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" placeholder="jan@email.sk" id="email" autocomplete="email" inputmode="email"></div></div>
        <div class="form-row full"><div class="form-group"><label class="form-label">Telefón</label><input type="tel" class="form-input" placeholder="+421 9XX XXX XXX" id="phone" autocomplete="tel" inputmode="tel"></div></div>
      </div>
      <div class="form-section">
        <p class="form-section-title">Doručovacia adresa</p>
        <div class="form-row full"><div class="form-group"><label class="form-label">Ulica a číslo</label><input type="text" class="form-input" placeholder="Hlavná 12" id="street" autocomplete="street-address"></div></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Mesto</label><input type="text" class="form-input" placeholder="Bratislava" id="city" autocomplete="address-level2"></div>
          <div class="form-group"><label class="form-label">PSČ</label><input type="text" class="form-input" placeholder="811 01" id="zip" autocomplete="postal-code" inputmode="numeric"></div>
        </div>
      </div>
      <div class="form-section">
        <p class="form-section-title">Platba</p>
        <div class="form-row full"><div class="form-group"><label class="form-label">Číslo karty</label><input type="text" class="form-input" placeholder="1234 5678 9012 3456" id="cardNum" maxlength="19" inputmode="numeric" autocomplete="cc-number"></div></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Platnosť</label><input type="text" class="form-input" placeholder="MM/RR" id="cardExp" maxlength="5" inputmode="numeric" autocomplete="cc-exp"></div>
          <div class="form-group"><label class="form-label">CVV</label><input type="text" class="form-input" placeholder="123" id="cardCvv" maxlength="3" inputmode="numeric" autocomplete="cc-csc"></div>
        </div>
      </div>
      <button class="place-order-btn" onclick="placeOrder()">DOKONČIŤ OBJEDNÁVKU →</button>
    </div>
    <div class="success-screen" id="successScreen">
      <div class="success-icon">✓</div>
      <h2 class="success-title">OBJEDNÁVKA PRIJATÁ</h2>
      <p class="success-text">Ďakujeme za tvoju objednávku. Potvrdenie sme ti poslali na email. Tovar odošleme do 10–14 pracovných dní.</p>
      <button class="checkout-btn" style="width:auto;padding:16px 40px;" onclick="closeCheckout()">Späť do shopu</button>
    </div>
  </div>
</div>

<div class="detail-modal" id="detailModal">
  <button class="detail-close" onclick="closeDetail()">×</button>
  <div class="detail-box" id="detailBox"></div>
</div>

<div class="cookie-banner" id="cookieBanner">
  <p class="cookie-text">Táto stránka používa nevyhnutné cookies. <a href="/gdpr.html">Viac info</a></p>
  <button class="cookie-accept" onclick="document.getElementById('cookieBanner').style.display='none';localStorage.setItem('cookies','1')">SÚHLASÍM</button>
</div>

<script>
const PRODUCTS = ${JSON.stringify(productData)};
const SERVER_URL = 'https://glorious-optimism-production-0039.up.railway.app';

if(localStorage.getItem('cookies')) document.getElementById('cookieBanner').style.display='none';

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  cursor.style.left=mx-5+'px'; cursor.style.top=my-5+'px';
});
function animRing(){
  rx+=(mx-rx)*0.1; ry+=(my-ry)*0.1;
  ring.style.left=rx-16+'px'; ring.style.top=ry-16+'px';
  requestAnimationFrame(animRing);
}
animRing();

let cart=[];
function getCategoryName(cat){return{jacket:'Bunda',hoodie:'Hoodie',sweatshirt:'Sweatshirt',tee:'Tričko',other:'Oblečenie'}[cat]||'Oblečenie';}

const DROPS = PRODUCTS.filter(p => p.price <= 116);
const PREMIUM = PRODUCTS.filter(p => p.price > 116);

function renderProducts(filter, section){
  const items = section === 'drops' ? DROPS : PREMIUM;
  const grid = document.getElementById(section === 'drops' ? 'dropsGrid' : 'premiumGrid');
  const filtered = filter === 'all' ? items : items.filter(p => p.category === filter);
  if(!filtered.length){
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.65rem;letter-spacing:0.15em;padding:40px 0;grid-column:1/-1;">Žiadne produkty v tejto kategórii.</p>';
    return;
  }
  grid.innerHTML = filtered.map(p=>\`
    <div class="product-card" onclick="openDetail(\${p.id})">
      <div class="product-img">
        <img src="\${p.image}" alt="\${p.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="product-overlay">
          <button class="quick-detail" onclick="event.stopPropagation();openDetail(\${p.id})">ZOBRAZIŤ DETAIL</button>
          <button class="quick-add" onclick="event.stopPropagation();addToCart(\${p.id})">PRIDAŤ DO KOŠÍKA</button>
        </div>
      </div>
      <div class="product-info">
        <p class="product-category">\${getCategoryName(p.category)}</p>
        <p class="product-name">\${p.name}</p>
        <div class="product-bottom">
          <span class="product-price">\${p.price} €</span>
          <div class="product-sizes">\${(p.sizes||[]).slice(0,3).map(s=>\`<span class="size-tag">\${s}</span>\`).join('')}</div>
        </div>
      </div>
    </div>
  \`).join('');
}

function switchSection(section){
  document.querySelectorAll('.shop-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(section+'Panel').classList.add('active');
  document.querySelector('.toggle-'+section).classList.add('active');
}

function filterProducts(filter, btn, section){
  btn.closest('.section-header').querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter, section);
}

function openDetail(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  const imgs=(p.images||[]).filter(Boolean);
  if(!imgs.length && p.image) imgs.push(p.image);
  let currentSlide=0;
  document.getElementById('detailBox').innerHTML=\`
    <div class="detail-carousel">
      <div class="detail-carousel-track" id="carouselTrack">
        \${imgs.slice(0,3).map(src=>\`<img src="\${src}" alt="\${p.name}" onerror="this.parentElement.style.display='none'">\`).join('')}
      </div>
      \${imgs.length>1?\`
        <button class="carousel-btn carousel-prev" onclick="slideCarousel(-1)">&#8249;</button>
        <button class="carousel-btn carousel-next" onclick="slideCarousel(1)">&#8250;</button>
        <div class="carousel-dots">
          \${imgs.slice(0,3).map((_,i)=>\`<div class="carousel-dot \${i===0?'active':''}" onclick="goToSlide(\${i})"></div>\`).join('')}
        </div>
      \`:''}
    </div>
    <div class="detail-info">
      <p class="detail-category">\${getCategoryName(p.category)}</p>
      <h2 class="detail-name">\${p.name}</h2>
      <p class="detail-price">\${p.price} €</p>
      <p class="detail-vintage-note">Použitý vintage kus — môže obsahovať drobné znaky nosenia zodpovedajúce veku a charakteru oblečenia.</p>
      <div class="detail-sizes">\${(p.sizes||[]).map(s=>\`<span class="detail-size-tag">\${s}</span>\`).join('')}</div>
      <button class="detail-add-btn" onclick="addToCart(\${p.id});closeDetail()">PRIDAŤ DO KOŠÍKA</button>
    </div>
  \`;
  window.slideCarousel=function(dir){
    const total=Math.min(imgs.length,3);
    currentSlide=(currentSlide+dir+total)%total;
    document.getElementById('carouselTrack').style.transform=\`translateX(-\${currentSlide*100}%)\`;
    document.querySelectorAll('.carousel-dot').forEach((d,i)=>d.classList.toggle('active',i===currentSlide));
  };
  window.goToSlide=function(i){
    currentSlide=i;
    document.getElementById('carouselTrack').style.transform=\`translateX(-\${i*100}%)\`;
    document.querySelectorAll('.carousel-dot').forEach((d,j)=>d.classList.toggle('active',j===i));
  };
  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeDetail(){
  document.getElementById('detailModal').classList.remove('open');
  document.body.style.overflow='';
}
document.getElementById('detailModal').addEventListener('click',function(e){if(e.target===this)closeDetail();});

function addToCart(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(cart.find(x=>x.id===id)){
    alert('Tento kus je už v košíku. Každý vintage kus je unikátny.');
    return;
  }
  cart.push({...p,qty:1});
  updateCart();
  if(!document.getElementById('cartSidebar').classList.contains('open'))toggleCart();
}

function updateCart(){
  const count=cart.length;
  const total=cart.reduce((a,i)=>a+i.price,0);
  document.getElementById('cartCount').textContent=count;
  document.getElementById('cartTotal').textContent=total+' €';
  const el=document.getElementById('cartItems');
  el.querySelectorAll('.cart-item').forEach(e=>e.remove());
  document.getElementById('cartEmpty').style.display=cart.length?'none':'flex';
  cart.forEach(item=>{
    const d=document.createElement('div');
    d.className='cart-item';
    d.innerHTML=\`
      <div class="cart-item-img"><img src="\${item.image}" alt="\${item.name}" style="width:100%;height:100%;object-fit:cover;display:block"></div>
      <div class="cart-item-details">
        <div>
          <p class="cart-item-name">\${item.name}</p>
          <p class="cart-item-meta">\${getCategoryName(item.category)} · \${item.sizes?.[0]||'One size'}</p>
        </div>
        <div class="cart-item-controls">
          <span class="cart-unique-label">1× Unikátny kus</span>
          <button class="remove-btn" onclick="removeItem(\${item.id})">Odstrániť</button>
        </div>
      </div>
      <span class="cart-item-price">\${item.price} €</span>
    \`;
    el.appendChild(d);
  });
}

function removeItem(id){cart=cart.filter(x=>x.id!==id);updateCart();}
function toggleCart(){document.getElementById('cartSidebar').classList.toggle('open');document.getElementById('cartOverlay').classList.toggle('open');}

function openCheckout(){
  if(!cart.length)return;
  const total=cart.reduce((a,i)=>a+i.price,0);
  document.getElementById('orderSummary').innerHTML=\`
    <p class="order-summary-title">Zhrnutie objednávky</p>
    \${cart.map(i=>\`<div class="summary-line"><span>\${i.name}</span><span>\${i.price} €</span></div>\`).join('')}
    <div class="summary-line"><span>Doprava (Packeta)</span><span>3.50 €</span></div>
    <div class="summary-line total"><span>CELKOM</span><span>\${(total+3.5).toFixed(2)} €</span></div>
  \`;
  toggleCart();
  document.getElementById('checkoutModal').classList.add('open');
}

function closeCheckout(){
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutForm').classList.remove('hide');
  document.getElementById('successScreen').classList.remove('show');
}

function placeOrder(){
  const fields=['firstName','lastName','email','phone','street','city','zip','cardNum','cardExp','cardCvv'];
  const empty=fields.find(f=>!document.getElementById(f).value.trim());
  if(empty){
    document.getElementById(empty).focus();
    document.getElementById(empty).style.borderColor='#e63222';
    setTimeout(()=>document.getElementById(empty).style.borderColor='var(--mid2)',2000);
    return;
  }
  const total=cart.reduce((a,i)=>a+i.price,0);
  const order={
    customer:{
      firstName:document.getElementById('firstName').value,
      lastName:document.getElementById('lastName').value,
      email:document.getElementById('email').value,
      phone:document.getElementById('phone').value,
      street:document.getElementById('street').value,
      city:document.getElementById('city').value,
      zip:document.getElementById('zip').value
    },
    items:cart.map(i=>({name:i.name,price:i.price,qty:1,size:i.sizes?.[0]||'N/A',url:i.url})),
    total:(total+3.5).toFixed(2)
  };
  fetch(SERVER_URL+'/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)})
    .then(r=>{
      if(!r.ok)throw new Error();
      document.getElementById('checkoutForm').classList.add('hide');
      document.getElementById('successScreen').classList.add('show');
      cart=[];updateCart();
    })
    .catch(()=>alert('Chyba pri odoslaní. Skúste znova.'));
}

document.addEventListener('DOMContentLoaded',()=>{
  renderProducts('all','drops');
  renderProducts('all','premium');
  const cn=document.getElementById('cardNum');
  if(cn)cn.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim();});
  const ce=document.getElementById('cardExp');
  if(ce)ce.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,4);if(v.length>=2)v=v.slice(0,2)+'/'+v.slice(2);e.target.value=v;});
});
</script>
</body>
</html>`;
fs.writeFileSync('index.html', html);
console.log('✅ index.html vygenerovaný!');