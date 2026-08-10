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
<meta name="description" content="Unikátne vintage kúsky vybrané ručne — bundy, hoodies, sweatshirty a tričká. Každý kus je originál, keď je preč, je preč.">
<link rel="canonical" href="https://refitvintage.sk/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="REFIT">
<meta property="og:title" content="REFIT — Vintage Streetwear">
<meta property="og:description" content="Unikátne vintage kúsky vybrané ručne — bundy, hoodies, sweatshirty a tričká. Každý kus je originál, keď je preč, je preč.">
<meta property="og:url" content="https://refitvintage.sk/">
<meta property="og:image" content="https://refitvintage.sk/refit_logo.svg">
<meta property="og:locale" content="sk_SK">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="REFIT — Vintage Streetwear">
<meta name="twitter:description" content="Unikátne vintage kúsky vybrané ručne — bundy, hoodies, sweatshirty a tričká. Každý kus je originál, keď je preč, je preč.">
<meta name="twitter:image" content="https://refitvintage.sk/refit_logo.svg">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root { --black: #0a0a0a; --white: #f0ece4; --red: #e63222; --gray: #1a1a1a; --mid: #2a2a2a; --text-muted: #666; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--black); color: var(--white); font-family: 'Space Mono', monospace; overflow-x: hidden; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(10,10,10,0.97); backdrop-filter: blur(4px); border-bottom: 1px solid var(--mid); }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.15em; color: var(--white); text-decoration: none; }
  .logo span { color: var(--red); }
  .nav-links { display: flex; gap: 24px; list-style: none; }
  .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; transition: color 0.2s; }
  .nav-links a:hover { color: var(--white); }
  .nav-right { display: flex; align-items: center; gap: 8px; }
  .menu-btn { display: none; background: none; border: 1px solid var(--mid); color: var(--white); width: 42px; height: 42px; font-size: 1.2rem; cursor: pointer; align-items: center; justify-content: center; }
  @media (max-width: 480px) {
    .menu-btn { display: flex; }
    .nav-links { display: none; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; gap: 0; background: rgba(10,10,10,0.98); border-bottom: 1px solid var(--mid); }
    .nav-links.open { display: flex; }
    .nav-links a { display: block; padding: 18px 20px; border-bottom: 1px solid var(--mid); font-size: 0.75rem; }
  }
  .cart-btn { background: none; border: 1px solid var(--mid); color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.15em; padding: 10px 16px; cursor: pointer; transition: all 0.2s; position: relative; }
  .cart-btn:hover { background: var(--white); color: var(--black); }
  .cart-count { position: absolute; top: -8px; right: -8px; background: var(--red); color: var(--white); width: 18px; height: 18px; border-radius: 50%; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; }
  .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 0 20px 80px; position: relative; overflow: hidden; }
  @media (min-width: 768px) { .hero { padding: 0 40px 80px; } }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 40%, rgba(230,50,34,0.08) 0%, transparent 60%), var(--black); }
  .hero-label { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--red); text-transform: uppercase; margin-bottom: 12px; opacity: 0; animation: fadeUp 0.8s 0.2s forwards; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(4rem, 18vw, 14rem); line-height: 0.9; letter-spacing: -0.02em; position: relative; z-index: 1; opacity: 0; animation: fadeUp 0.8s 0.4s forwards; }
  .hero-title .outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
  .hero-sub { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; opacity: 0; animation: fadeUp 0.8s 0.6s forwards; }
  @media (min-width: 600px) { .hero-sub { flex-direction: row; justify-content: space-between; align-items: flex-end; } }
  .hero-desc { font-size: 0.7rem; color: var(--text-muted); line-height: 1.8; max-width: 320px; }
  .hero-cta { background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.2em; padding: 16px 40px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; text-align: center; }
  .hero-cta:hover { background: var(--white); color: var(--black); }
  .hero-ticker { position: absolute; bottom: 0; left: 0; right: 0; background: var(--red); padding: 10px 0; overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; animation: ticker 20s linear infinite; }
  .ticker-inner span { font-family: 'Bebas Neue', sans-serif; font-size: 0.85rem; letter-spacing: 0.3em; padding: 0 32px; color: var(--white); }
  .shop-section { padding: 80px 16px 40px; }
  @media (min-width: 768px) { .shop-section { padding: 100px 40px 40px; } }
  .section-toggle { display: flex; gap: 12px; margin-bottom: 48px; }
  .toggle-btn { flex: 1; padding: 20px 16px; border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 0.2em; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
  @media (min-width: 600px) { .toggle-btn { font-size: 1.6rem; padding: 24px 32px; } }
  .toggle-drops { background: var(--mid); color: var(--text-muted); border: 1px solid var(--mid); }
  .toggle-drops.active { background: var(--white); color: var(--black); border-color: var(--white); }
  .toggle-premium { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #aaa; border: 1px solid #333; }
  .toggle-premium.active { background: linear-gradient(135deg, #b8860b, #daa520, #ffd700, #c0a060, #8b7536); color: var(--black); border-color: #ffd700; box-shadow: 0 0 20px rgba(218,165,32,0.4); }
  .toggle-premium.active::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%); animation: shimmer 2s infinite; }
  @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
  .shop-panel { display: none; }
  .shop-panel.active { display: block; }
  .section-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--mid); padding-bottom: 20px; }
  @media (min-width: 600px) { .section-header { flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; } }
  .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.1em; }
  .filters { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-btn { background: none; border: 1px solid var(--mid); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; padding: 8px 12px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; position: relative; overflow: hidden; }
  .filter-btn:hover, .filter-btn.active { background: var(--white); color: var(--black); border-color: var(--white); }
  #premiumPanel .filter-btn { background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #aaa; border-color: #333; }
  #premiumPanel .filter-btn:hover, #premiumPanel .filter-btn.active { background: linear-gradient(135deg, #b8860b, #daa520, #ffd700, #c0a060, #8b7536); color: var(--black); border-color: #ffd700; box-shadow: 0 0 14px rgba(218,165,32,0.4); }
  #premiumPanel .filter-btn.active::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%); animation: shimmer 2s infinite; }
  #premiumPanel .product-price { background: linear-gradient(135deg, #b8860b, #ffd700, #daa520); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
  @media (min-width: 600px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
  .product-card { background: var(--gray); position: relative; overflow: hidden; cursor: pointer; }
  .product-img { width: 100%; aspect-ratio: 3/4; background: var(--mid); position: relative; overflow: hidden; }
  .product-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .product-card:hover .product-img img { transform: scale(1.05); }
  .product-overlay { position: absolute; inset: 0; background: rgba(10,10,10,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.3s ease; }
  .product-card:hover .product-overlay { opacity: 1; }
  @media (pointer: coarse) {
    .product-overlay { opacity: 1; background: linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 50%); justify-content: flex-end; padding-bottom: 12px; }
  }
  .quick-add { background: var(--white); color: var(--black); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 0.85rem; letter-spacing: 0.15em; padding: 12px 20px; cursor: pointer; transition: all 0.2s; width: 85%; }
  .quick-add:hover { background: var(--red); color: var(--white); }
  .quick-detail { background: none; color: var(--white); border: 1px solid rgba(255,255,255,0.5); font-family: 'Bebas Neue', sans-serif; font-size: 0.75rem; letter-spacing: 0.15em; padding: 8px 20px; cursor: pointer; transition: all 0.2s; width: 85%; }
  .quick-detail:hover { background: var(--white); color: var(--black); }
  @media (pointer: coarse) { .quick-detail { display: none; } }
  .product-info { padding: 10px 12px; }
  @media (min-width: 768px) { .product-info { padding: 16px; } }
  .product-category { font-size: 0.55rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
  .product-name { font-family: 'Bebas Neue', sans-serif; font-size: 0.95rem; letter-spacing: 0.08em; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (min-width: 768px) { .product-name { font-size: 1.1rem; } }
  .product-bottom { display: flex; justify-content: space-between; align-items: center; }
  .product-price { font-size: 0.8rem; font-weight: 700; }
  .product-sizes { display: flex; gap: 3px; flex-wrap: wrap; }
  .size-tag { font-size: 0.5rem; border: 1px solid var(--mid); padding: 2px 5px; color: var(--text-muted); }
  .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 800; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(4px); }
  .cart-overlay.open { opacity: 1; pointer-events: all; }
  .cart-sidebar { position: fixed; top: 0; right: 0; width: 100%; max-width: 420px; height: 100vh; background: var(--gray); z-index: 900; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; border-left: 1px solid var(--mid); }
  .cart-sidebar.open { transform: translateX(0); }
  .cart-header { padding: 20px 24px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; }
  .cart-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.15em; }
  .close-btn { background: none; border: none; color: var(--white); font-size: 1.5rem; cursor: pointer; padding: 10px 14px; transition: color 0.2s; }
  .close-btn:hover { color: var(--red); }
  .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: var(--text-muted); }
  .cart-empty-icon { font-size: 3rem; opacity: 0.3; }
  .cart-empty p { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; }
  .cart-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--mid); }
  .cart-item-img { width: 60px; height: 80px; background: var(--mid); flex-shrink: 0; overflow: hidden; }
  .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .cart-item-details { flex: 1; min-width: 0; }
  .cart-item-name { font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; letter-spacing: 0.08em; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-meta { font-size: 0.55rem; color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 10px; }
  .cart-item-controls { display: flex; align-items: center; gap: 10px; }
  .qty-btn { background: var(--mid); border: none; color: var(--white); width: 28px; height: 28px; font-family: 'Space Mono', monospace; font-size: 0.9rem; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: var(--red); }
  .qty-value { font-size: 0.75rem; min-width: 16px; text-align: center; }
  .remove-btn { background: none; border: none; color: var(--text-muted); font-size: 0.55rem; letter-spacing: 0.1em; cursor: pointer; text-transform: uppercase; margin-left: auto; transition: color 0.2s; padding: 12px 8px; margin-right: -8px; }
  .remove-btn:hover { color: var(--red); }
  .cart-item-price { font-size: 0.85rem; font-weight: 700; align-self: flex-start; margin-top: 4px; white-space: nowrap; }
  .cart-footer { padding: 20px 24px; border-top: 1px solid var(--mid); }
  .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .cart-total-label { font-size: 0.7rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
  .cart-total-amount { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.1em; }
  .checkout-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.2em; padding: 16px; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
  .checkout-btn:hover { background: var(--white); color: var(--black); }
  .continue-btn { width: 100%; background: none; border: 1px solid var(--mid); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.6rem; letter-spacing: 0.15em; padding: 12px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .continue-btn:hover { border-color: var(--white); color: var(--white); }
  .checkout-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(8px); overflow-y: auto; padding: 20px 0; }
  @media (min-width: 600px) { .checkout-modal { align-items: center; padding: 0; } }
  .checkout-modal.open { opacity: 1; pointer-events: all; }
  .checkout-box { background: var(--gray); border: 1px solid var(--mid); width: 95%; max-width: 600px; transform: translateY(20px); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .checkout-modal.open .checkout-box { transform: translateY(0); }
  .checkout-header { padding: 20px 24px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; }
  .checkout-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.15em; }
  .checkout-body { padding: 24px; }
  .form-section { margin-bottom: 24px; }
  .form-section-title { font-size: 0.6rem; letter-spacing: 0.2em; color: var(--red); text-transform: uppercase; margin-bottom: 16px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .form-row.full { grid-template-columns: 1fr; }
  @media (max-width: 400px) { .form-row { grid-template-columns: 1fr; } }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 0.55rem; letter-spacing: 0.15em; color: var(--text-muted); text-transform: uppercase; }
  .form-input { background: var(--mid); border: 1px solid transparent; color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.8rem; padding: 12px 14px; transition: border-color 0.2s; outline: none; cursor: text; -webkit-appearance: none; border-radius: 0; }
  @media (max-width: 480px) { .form-input { font-size: 16px; } }
  .form-input:focus { border-color: var(--red); }
  .form-input::placeholder { color: var(--text-muted); font-size: 0.7rem; }
  .order-summary { background: var(--black); border: 1px solid var(--mid); padding: 20px; margin-bottom: 20px; }
  .order-summary-title { font-size: 0.55rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
  .summary-line { display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 8px; }
  .summary-line.total { border-top: 1px solid var(--mid); padding-top: 12px; margin-top: 12px; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em; }
  .place-order-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.2em; padding: 18px; cursor: pointer; transition: all 0.2s; }
  .place-order-btn:hover { background: var(--white); color: var(--black); }
  .success-screen { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; text-align: center; gap: 20px; }
  .success-screen.show { display: flex; }
  .checkout-form.hide { display: none; }
  .success-icon { width: 80px; height: 80px; border: 2px solid var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
  .success-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.15em; }
  .success-text { font-size: 0.7rem; color: var(--text-muted); line-height: 1.8; max-width: 320px; }
  .detail-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000; display: none; align-items: flex-start; justify-content: center; backdrop-filter: blur(8px); overflow-y: auto; padding: 0; }
  @media (min-width: 600px) { .detail-modal { align-items: center; padding: 20px; } }
  .detail-modal.open { display: flex; }
  .detail-box { background: var(--gray); border: none; width: 100%; min-height: 100%; max-width: 100%; animation: fadeUp 0.3s ease; }
  @media (min-width: 600px) { .detail-box { border: 1px solid var(--mid); width: 95%; min-height: 0; max-width: 960px; } }
  .detail-carousel { position: relative; overflow: hidden; background: var(--mid); }
  .detail-carousel-track { display: flex; transition: transform 0.35s ease; }
  .detail-carousel-track img { min-width: 100%; width: 100%; aspect-ratio: 3/4; object-fit: cover; flex-shrink: 0; }
  .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(10,10,10,0.7); border: 1px solid rgba(255,255,255,0.2); color: var(--white); font-size: 1.2rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: background 0.2s; }
  .carousel-btn:hover { background: var(--red); }
  .carousel-prev { left: 8px; }
  .carousel-next { right: 8px; }
  .carousel-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
  .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: background 0.2s; }
  .carousel-dot.active { background: var(--white); }
  .detail-info { padding: 20px 24px; }
  @media (min-width: 768px) { .detail-info { padding: 32px 40px; } }
  .detail-category { font-size: 0.55rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
  .detail-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.08em; margin-bottom: 12px; line-height: 1.1; }
  @media (min-width: 768px) { .detail-name { font-size: 2.5rem; } }
  .detail-price { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
  .detail-sizes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .detail-size-tag { font-size: 0.65rem; border: 1px solid var(--mid); padding: 8px 14px; color: var(--text-muted); letter-spacing: 0.1em; }
  .detail-add-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.2em; padding: 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
  .detail-add-btn:hover { background: var(--white); color: var(--black); }
  .detail-close { position: fixed; top: 16px; right: 16px; background: var(--gray); border: 1px solid var(--mid); color: var(--white); font-size: 1.5rem; cursor: pointer; z-index: 2001; transition: color 0.2s; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .detail-close:hover { color: var(--red); }
  footer { margin-top: 80px; border-top: 1px solid var(--mid); padding: 40px 20px; }
  @media (min-width: 600px) { footer { padding: 60px 40px; display: flex; justify-content: space-between; align-items: flex-end; } }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.1em; line-height: 1; -webkit-text-stroke: 1px var(--mid); color: transparent; margin-bottom: 20px; }
  @media (min-width: 600px) { .footer-logo { font-size: 4rem; margin-bottom: 0; } }
  .footer-info { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.15em; line-height: 2; }
  @media (min-width: 600px) { .footer-info { text-align: right; } }
  .footer-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
  @media (min-width: 600px) { .footer-links { justify-content: flex-end; } }
  .footer-links a { color: #555; text-decoration: none; font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; }
  .footer-links a:hover { color: var(--white); }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
</head>
<body>
<nav>
  <a href="#"><img src="/refit_logo.svg" alt="REFIT" style="height:48px;"></a>
  <ul class="nav-links" id="navLinks">
    <li><a href="#shop" onclick="closeMenu()">Shop</a></li>
    <li><a href="#about" onclick="closeMenu()">O nás</a></li>
  </ul>
  <div class="nav-right">
    <button class="menu-btn" onclick="toggleMenu()" aria-label="Menu">☰</button>
    <button class="cart-btn" onclick="toggleCart()">KOŠÍK <span class="cart-count" id="cartCount">0</span></button>
  </div>
</nav>
<section class="hero">
  <div class="hero-bg"></div>
  <p class="hero-label">Vintage · Streetwear · Resell</p>
  <h1 class="hero-title">RE<span class="outline">FIT</span></h1>
  <div class="hero-sub">
    <p class="hero-desc">Unikátne vintage kúsky vybrané ručne. Každý kus je originál — keď je preč, je preč.<br><br><span style="font-size:0.6rem;color:#555;letter-spacing:0.1em;">Všetky kúsky sú použité vintage oblečenie. Môžu obsahovať drobné znaky nosenia zodpovedajúce ich veku a charakteru.</span></p>
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
    </button>
    <button class="toggle-btn toggle-premium" onclick="switchSection('premium')">
      ✦ PREMIUM
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
    <p style="margin-top:8px;color:#444;">© 2025 REFIT</p>
    <div class="footer-links">
      <a href="/obchodne-podmienky.html">Obchodné podmienky</a>
      <a href="/gdpr.html">Ochrana údajov</a>
      <a href="/vratenie-tovaru.html">Vrátenie tovaru</a>
    </div>
  </div>
</footer>
<div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>
<div class="cart-sidebar" id="cartSidebar">
  <div class="cart-header"><span class="cart-title">KOŠÍK</span><button class="close-btn" onclick="toggleCart()">×</button></div>
  <div class="cart-items" id="cartItems">
    <div class="cart-empty" id="cartEmpty"><div class="cart-empty-icon">◻</div><p>Košík je prázdny</p></div>
  </div>
  <div class="cart-footer">
    <div class="cart-total-row"><span class="cart-total-label">Celkom</span><span class="cart-total-amount" id="cartTotal">0 €</span></div>
    <button class="checkout-btn" onclick="openCheckout()">Pokračovať k platbe</button>
    <button class="continue-btn" onclick="toggleCart()">Pokračovať v nákupe</button>
  </div>
</div>
<div class="checkout-modal" id="checkoutModal">
  <div class="checkout-box">
    <div class="checkout-header"><span class="checkout-title">OBJEDNÁVKA</span><button class="close-btn" onclick="closeCheckout()">×</button></div>
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
<script>
const PRODUCTS = ${JSON.stringify(productData)};
const SERVER_URL = 'https://glorious-optimism-production-0039.up.railway.app';
let cart=JSON.parse(localStorage.getItem('refit_cart')||'[]');
function getCategoryName(cat){return{jacket:'Bunda',hoodie:'Hoodie',sweatshirt:'Sweatshirt',tee:'Tričko',other:'Oblečenie'}[cat]||'Oblečenie';}
const DROPS = PRODUCTS.filter(p => p.price <= 110);
const PREMIUM = PRODUCTS.filter(p => p.price > 110);
function renderProducts(filter, section){
  const products = section === 'drops' ? DROPS : PREMIUM;
  const gridId = section === 'drops' ? 'dropsGrid' : 'premiumGrid';
  const grid = document.getElementById(gridId);
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
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
          <div class="product-sizes">\${(p.sizes||[]).slice(0,4).map(s=>\`<span class="size-tag">\${s}</span>\`).join('')}</div>
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
  const prefix = section === 'drops' ? 'drops' : 'premium';
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
        \${imgs.slice(0,3).map(src=>\`<img src="\${src}" alt="\${p.name}" onerror="this.style.display='none'">\`).join('')}
      </div>
      \${imgs.length > 1 ? \`
        <button class="carousel-btn carousel-prev" onclick="slideCarousel(-1)">&#8249;</button>
        <button class="carousel-btn carousel-next" onclick="slideCarousel(1)">&#8250;</button>
        <div class="carousel-dots">
          \${imgs.slice(0,3).map((_,i)=>\`<div class="carousel-dot \${i===0?'active':''}" onclick="goToSlide(\${i})"></div>\`).join('')}
        </div>
      \` : ''}
    </div>
    <div class="detail-info">
      <p class="detail-category">\${getCategoryName(p.category)}</p>
      <h2 class="detail-name">\${p.name}</h2>
      <p class="detail-price">\${p.price} €</p>
<p style="font-size:0.6rem;color:#555;letter-spacing:0.1em;margin-bottom:16px;"> vintage kus — môže obsahovať drobné znaky nosenia.</p>
      <div class="detail-sizes">\${(p.sizes||[]).map(s=>\`<span class="detail-size-tag">\${s}</span>\`).join('')}</div>
      <button class="detail-add-btn" onclick="addToCart(\${p.id});closeDetail()">PRIDAŤ DO KOŠÍKA</button>
    </div>
  \`;
  window.slideCarousel = function(dir) {
    const total = Math.min(imgs.length, 3);
    currentSlide = (currentSlide + dir + total) % total;
    document.getElementById('carouselTrack').style.transform = \`translateX(-\${currentSlide * 100}%)\`;
    document.querySelectorAll('.carousel-dot').forEach((d,i) => d.classList.toggle('active', i === currentSlide));
  };
  window.goToSlide = function(i) {
    currentSlide = i;
    document.getElementById('carouselTrack').style.transform = \`translateX(-\${currentSlide * 100}%)\`;
    document.querySelectorAll('.carousel-dot').forEach((d,j) => d.classList.toggle('active', j === currentSlide));
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
  const ex=cart.find(x=>x.id===id);
  if(ex){ alert('Tento kus je už v košíku. Každý vintage kus je unikátny.'); return; } cart.push({...p,qty:1});
  updateCart();
  if(!document.getElementById('cartSidebar').classList.contains('open'))toggleCart();
}
function updateCart(){
  localStorage.setItem('refit_cart',JSON.stringify(cart));
  const count=cart.reduce((a,i)=>a+i.qty,0);
  const total=cart.reduce((a,i)=>a+i.price*i.qty,0);
  document.getElementById('cartCount').textContent=count;
  document.getElementById('cartTotal').textContent=total+' €';
  const el=document.getElementById('cartItems');
  el.querySelectorAll('.cart-item').forEach(e=>e.remove());
  document.getElementById('cartEmpty').style.display=cart.length?'none':'flex';
  cart.forEach(item=>{
    const d=document.createElement('div');
    d.className='cart-item';
    d.innerHTML=\`
      <div class="cart-item-img"><img src="\${item.image}" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="cart-item-details">
        <p class="cart-item-name">\${item.name}</p>
        <p class="cart-item-meta">\${getCategoryName(item.category)}</p>
        <div class="cart-item-controls">
          <span style="font-size:0.6rem;color:#666;letter-spacing:0.1em;">1× UNIKÁTNY KUS</span>
          <button class="remove-btn" onclick="removeItem(\${item.id})">Odstrániť</button>
        </div>
      </div>
      <span class="cart-item-price">\${item.price*item.qty} €</span>
    \`;
    el.appendChild(d);
  });
}
function changeQty(id,d){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);updateCart();}
function removeItem(id){cart=cart.filter(x=>x.id!==id);updateCart();}
function toggleCart(){document.getElementById('cartSidebar').classList.toggle('open');document.getElementById('cartOverlay').classList.toggle('open');}
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open');}
function closeMenu(){document.getElementById('navLinks').classList.remove('open');}
function openCheckout(){
  if(!cart.length)return;
  const total=cart.reduce((a,i)=>a+i.price*i.qty,0);
  document.getElementById('orderSummary').innerHTML=\`
    <p class="order-summary-title">Zhrnutie objednávky</p>
    \${cart.map(i=>\`<div class="summary-line"><span>\${i.name} ×\${i.qty}</span><span>\${i.price*i.qty} €</span></div>\`).join('')}
    <div class="summary-line"><span>Doprava</span><span>3.50 €</span></div>
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
  if(empty){document.getElementById(empty).focus();document.getElementById(empty).style.borderColor='#e63222';setTimeout(()=>document.getElementById(empty).style.borderColor='',2000);return;}
  const total=cart.reduce((a,i)=>a+i.price*i.qty,0);
  const order={
    customer:{firstName:document.getElementById('firstName').value,lastName:document.getElementById('lastName').value,email:document.getElementById('email').value,phone:document.getElementById('phone').value,street:document.getElementById('street').value,city:document.getElementById('city').value,zip:document.getElementById('zip').value},
    items:cart.map(i=>({name:i.name,price:i.price,qty:i.qty,size:i.sizes?.[0]||'N/A',url:i.url})),
    total:(total+3.5).toFixed(2)
  };
  fetch(SERVER_URL+'/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)})
    .then(()=>{document.getElementById('checkoutForm').classList.add('hide');document.getElementById('successScreen').classList.add('show');cart=[];updateCart();})
    .catch(()=>alert('Chyba pri odoslaní. Skúste znova.'));
}
document.addEventListener('DOMContentLoaded',()=>{
  renderProducts('all', 'drops');
  renderProducts('all', 'premium');
  updateCart();
  const cn=document.getElementById('cardNum');
  if(cn)cn.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim();});
  const ce=document.getElementById('cardExp');
  if(ce)ce.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,4);if(v.length>=2)v=v.slice(0,2)+'/'+v.slice(2);e.target.value=v;});
});
</script>
<div id="cookieBanner" style="position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;border-top:1px solid #2a2a2a;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;z-index:3000;gap:16px">
  <p style="font-size:0.6rem;color:#999;letter-spacing:0.1em;line-height:1.6;">Táto stránka používa nevyhnutné cookies. <a href="/gdpr.html" style="color:#e63222;">Viac info</a></p>
  <button onclick="document.getElementById('cookieBanner').style.display='none';localStorage.setItem('cookies','1')" style="background:#e63222;color:#fff;border:none;font-family:'Bebas Neue',sans-serif;font-size:0.85rem;letter-spacing:0.15em;padding:10px 20px;cursor:pointer;white-space:nowrap;flex-shrink:0">SÚHLASÍM</button>
</div>
<script>if(localStorage.getItem('cookies'))document.getElementById('cookieBanner').style.display='none';</script>
</body>
</html>`;
fs.writeFileSync('index.html', html);
console.log('✅ index.html vygenerovaný s reálnymi produktmi!');
console.log('📁 Nahraj index.html do GitHub repozitára REFIT-shop');