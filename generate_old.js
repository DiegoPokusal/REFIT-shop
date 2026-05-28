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
  if (all.includes('trouser') || all.includes('jean') || all.includes('pant') || all.includes('denim')) return 'pants';
  if (all.includes('shirt') || all.includes('blouse')) return 'shirt';
  return 'other';
}

function getCategoryName(cat) {
  return { jacket:'Bunda', hoodie:'Hoodie', sweatshirt:'Sweatshirt', tee:'Tričko', pants:'Nohavice', shirt:'Košeľa', other:'Oblečenie' }[cat] || 'Oblečenie';
}

const jackets = available.filter(p => getCategory(p) === 'jacket').slice(0, 20);
const hoodies = available.filter(p => getCategory(p) === 'hoodie').slice(0, 20);
const sweatshirts = available.filter(p => getCategory(p) === 'sweatshirt').slice(0, 20);
const tees = available.filter(p => getCategory(p) === 'tee').slice(0, 20);
const pants = available.filter(p => getCategory(p) === 'pants').slice(0, 20);
const shirts = available.filter(p => getCategory(p) === 'shirt').slice(0, 20);
const display = [...jackets, ...hoodies, ...sweatshirts, ...tees, ...pants, ...shirts];

console.log(`👕 Bundy: ${jackets.length} | Hoodies: ${hoodies.length} | Sweatshirts: ${sweatshirts.length} | Tričká: ${tees.length} | Nohavice: ${pants.length} | Košele: ${shirts.length}`);

const productData = display.map(p => ({
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
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
  :root { --black: #0a0a0a; --white: #f0ece4; --red: #e63222; --gray: #1a1a1a; --mid: #2a2a2a; --text-muted: #666; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--black); color: var(--white); font-family: 'Space Mono', monospace; cursor: none; overflow-x: hidden; }
  .cursor { width: 12px; height: 12px; background: var(--red); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999; mix-blend-mode: difference; }
  .cursor-ring { width: 36px; height: 36px; border: 1px solid var(--white); border-radius: 50%; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998; transition: all 0.08s ease; mix-blend-mode: difference; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 500; display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: linear-gradient(to bottom, rgba(10,10,10,0.95), transparent); backdrop-filter: blur(2px); }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.15em; color: var(--white); text-decoration: none; }
  .logo span { color: var(--red); }
  .nav-links { display: flex; gap: 32px; list-style: none; }
  .nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; transition: color 0.2s; }
  .nav-links a:hover { color: var(--white); }
  .cart-btn { background: none; border: 1px solid var(--mid); color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.15em; padding: 10px 20px; cursor: none; transition: all 0.2s; position: relative; }
  .cart-btn:hover { background: var(--white); color: var(--black); }
  .cart-count { position: absolute; top: -8px; right: -8px; background: var(--red); color: var(--white); width: 18px; height: 18px; border-radius: 50%; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; }
  .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 40px 80px; position: relative; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 40%, rgba(230,50,34,0.08) 0%, transparent 60%), var(--black); }
  .hero-label { font-size: 0.65rem; letter-spacing: 0.3em; color: var(--red); text-transform: uppercase; margin-bottom: 16px; opacity: 0; animation: fadeUp 0.8s 0.2s forwards; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(5rem, 15vw, 14rem); line-height: 0.9; letter-spacing: -0.02em; position: relative; z-index: 1; opacity: 0; animation: fadeUp 0.8s 0.4s forwards; }
  .hero-title .outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
  .hero-sub { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; opacity: 0; animation: fadeUp 0.8s 0.6s forwards; }
  .hero-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.8; max-width: 320px; }
  .hero-cta { background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.2em; padding: 18px 48px; cursor: none; transition: all 0.2s; text-decoration: none; display: inline-block; }
  .hero-cta:hover { background: var(--white); color: var(--black); }
  .hero-ticker { position: absolute; bottom: 0; left: 0; right: 0; background: var(--red); padding: 10px 0; overflow: hidden; white-space: nowrap; }
  .ticker-inner { display: inline-flex; animation: ticker 20s linear infinite; }
  .ticker-inner span { font-family: 'Bebas Neue', sans-serif; font-size: 0.9rem; letter-spacing: 0.3em; padding: 0 40px; color: var(--white); }
  .shop-section { padding: 100px 40px 40px; }
  .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid var(--mid); padding-bottom: 24px; }
  .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.1em; }
  .filters { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-btn { background: none; border: 1px solid var(--mid); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; padding: 8px 16px; cursor: none; transition: all 0.2s; text-transform: uppercase; }
  .filter-btn:hover, .filter-btn.active { background: var(--white); color: var(--black); border-color: var(--white); }
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2px; }
  .product-card { background: var(--gray); position: relative; overflow: hidden; cursor: none; }
  .product-img { width: 100%; aspect-ratio: 3/4; background: var(--mid); position: relative; overflow: hidden; }
  .product-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .product-card:hover .product-img img { transform: scale(1.05); }
  .product-overlay { position: absolute; inset: 0; background: rgba(10,10,10,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; opacity: 0; transition: opacity 0.3s ease; }
  .product-card:hover .product-overlay { opacity: 1; }
  .quick-add { background: var(--white); color: var(--black); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.2em; padding: 14px 32px; cursor: none; transition: all 0.2s; width: 80%; }
  .quick-add:hover { background: var(--red); color: var(--white); }
  .quick-detail { background: none; color: var(--white); border: 1px solid var(--white); font-family: 'Bebas Neue', sans-serif; font-size: 0.85rem; letter-spacing: 0.2em; padding: 10px 32px; cursor: none; transition: all 0.2s; width: 80%; }
  .quick-detail:hover { background: var(--white); color: var(--black); }
  .product-info { padding: 16px; }
  .product-category { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
  .product-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .product-bottom { display: flex; justify-content: space-between; align-items: center; }
  .product-price { font-size: 0.85rem; font-weight: 700; }
  .product-sizes { display: flex; gap: 4px; flex-wrap: wrap; }
  .size-tag { font-size: 0.55rem; border: 1px solid var(--mid); padding: 2px 6px; color: var(--text-muted); }
  .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 800; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(4px); }
  .cart-overlay.open { opacity: 1; pointer-events: all; }
  .cart-sidebar { position: fixed; top: 0; right: 0; width: 420px; height: 100vh; background: var(--gray); z-index: 900; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; border-left: 1px solid var(--mid); }
  .cart-sidebar.open { transform: translateX(0); }
  .cart-header { padding: 32px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; }
  .cart-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.15em; }
  .close-btn { background: none; border: none; color: var(--white); font-size: 1.5rem; cursor: none; padding: 4px; transition: color 0.2s; }
  .close-btn:hover { color: var(--red); }
  .cart-items { flex: 1; overflow-y: auto; padding: 24px 32px; }
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px; color: var(--text-muted); }
  .cart-empty-icon { font-size: 3rem; opacity: 0.3; }
  .cart-empty p { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; }
  .cart-item { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--mid); animation: fadeIn 0.3s ease; }
  .cart-item-img { width: 70px; height: 90px; background: var(--mid); flex-shrink: 0; overflow: hidden; }
  .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .cart-item-details { flex: 1; }
  .cart-item-name { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 4px; }
  .cart-item-meta { font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.15em; margin-bottom: 12px; }
  .cart-item-controls { display: flex; align-items: center; gap: 12px; }
  .qty-btn { background: var(--mid); border: none; color: var(--white); width: 24px; height: 24px; font-family: 'Space Mono', monospace; font-size: 0.8rem; cursor: none; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: var(--red); }
  .qty-value { font-size: 0.75rem; min-width: 16px; text-align: center; }
  .remove-btn { background: none; border: none; color: var(--text-muted); font-size: 0.6rem; letter-spacing: 0.15em; cursor: none; text-transform: uppercase; margin-left: auto; transition: color 0.2s; }
  .remove-btn:hover { color: var(--red); }
  .cart-item-price { font-size: 0.85rem; font-weight: 700; align-self: flex-start; margin-top: 4px; }
  .cart-footer { padding: 32px; border-top: 1px solid var(--mid); }
  .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .cart-total-label { font-size: 0.7rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
  .cart-total-amount { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 0.1em; }
  .checkout-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.25em; padding: 18px; cursor: none; transition: all 0.2s; margin-bottom: 12px; }
  .checkout-btn:hover { background: var(--white); color: var(--black); }
  .continue-btn { width: 100%; background: none; border: 1px solid var(--mid); color: var(--text-muted); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.2em; padding: 14px; cursor: none; transition: all 0.2s; text-transform: uppercase; }
  .continue-btn:hover { border-color: var(--white); color: var(--white); }
  .checkout-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; backdrop-filter: blur(8px); }
  .checkout-modal.open { opacity: 1; pointer-events: all; }
  .checkout-box { background: var(--gray); border: 1px solid var(--mid); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; transform: translateY(20px); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  .checkout-modal.open .checkout-box { transform: translateY(0); }
  .checkout-header { padding: 32px 40px; border-bottom: 1px solid var(--mid); display: flex; justify-content: space-between; align-items: center; }
  .checkout-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.15em; }
  .checkout-body { padding: 40px; }
  .form-section { margin-bottom: 32px; }
  .form-section-title { font-size: 0.65rem; letter-spacing: 0.25em; color: var(--red); text-transform: uppercase; margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-row.full { grid-template-columns: 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 0.6rem; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
  .form-input { background: var(--mid); border: 1px solid transparent; color: var(--white); font-family: 'Space Mono', monospace; font-size: 0.8rem; padding: 12px 16px; transition: border-color 0.2s; outline: none; cursor: none; }
  .form-input:focus { border-color: var(--red); }
  .form-input::placeholder { color: var(--text-muted); font-size: 0.7rem; }
  .order-summary { background: var(--black); border: 1px solid var(--mid); padding: 24px; margin-bottom: 24px; }
  .order-summary-title { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
  .summary-line { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 8px; }
  .summary-line.total { border-top: 1px solid var(--mid); padding-top: 12px; margin-top: 12px; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.1em; }
  .place-order-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.25em; padding: 20px; cursor: none; transition: all 0.2s; }
  .place-order-btn:hover { background: var(--white); color: var(--black); }
  .success-screen { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; gap: 20px; }
  .success-screen.show { display: flex; }
  .checkout-form.hide { display: none; }
  .success-icon { width: 80px; height: 80px; border: 2px solid var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  .success-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.15em; }
  .success-text { font-size: 0.75rem; color: var(--text-muted); line-height: 1.8; max-width: 320px; }
  /* DETAIL MODAL */
  .detail-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
  .detail-modal.open { display: flex; }
  .detail-box { background: var(--gray); border: 1px solid var(--mid); width: 100%; max-width: 960px; max-height: 90vh; overflow-y: auto; animation: fadeUp 0.3s ease; }
  .detail-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .detail-photos img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
  .detail-info { padding: 32px 40px; }
  .detail-category { font-size: 0.6rem; letter-spacing: 0.25em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
  .detail-name { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 0.1em; margin-bottom: 16px; line-height: 1; }
  .detail-price { font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; }
  .detail-sizes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
  .detail-size-tag { font-size: 0.7rem; border: 1px solid var(--mid); padding: 8px 16px; color: var(--text-muted); letter-spacing: 0.1em; }
  .detail-add-btn { width: 100%; background: var(--red); color: var(--white); border: none; font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; letter-spacing: 0.25em; padding: 20px; cursor: none; transition: all 0.2s; margin-bottom: 12px; }
  .detail-add-btn:hover { background: var(--white); color: var(--black); }
  .detail-close { position: absolute; top: 24px; right: 24px; background: none; border: none; color: var(--white); font-size: 2rem; cursor: none; z-index: 2001; transition: color 0.2s; }
  .detail-close:hover { color: var(--red); }
  footer { margin-top: 100px; border-top: 1px solid var(--mid); padding: 60px 40px; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 0.1em; line-height: 1; -webkit-text-stroke: 1px var(--mid); color: transparent; }
  .footer-info { font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.15em; line-height: 2; text-align: right; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<nav>
  <a href="#" class="logo">RE<span>FIT</span></a>
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
    <p class="hero-desc">Unikátne vintage kúsky vybrané ručne. Každý kus je originál — keď je preč, je preč.</p>
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
  <div class="section-header">
    <h2 class="section-title">KOLEKCIA</h2>
    <div class="filters">
      <button class="filter-btn active" onclick="filterProducts('all', this)">Všetko</button>
      <button class="filter-btn" onclick="filterProducts('jacket', this)">Bundy</button>
      <button class="filter-btn" onclick="filterProducts('hoodie', this)">Hoodies</button>
      <button class="filter-btn" onclick="filterProducts('sweatshirt', this)">Sweatshirts</button>
      <button class="filter-btn" onclick="filterProducts('tee', this)">Tričká</button>
      <button class="filter-btn" onclick="filterProducts('pants', this)">Nohavice</button>
      <button class="filter-btn" onclick="filterProducts('shirt', this)">Košele</button>
    </div>
  </div>
  <div class="product-grid" id="productGrid"></div>
</section>

<footer id="about">
  <div class="footer-logo">REFIT</div>
  <div class="footer-info">
    <p>Vintage Streetwear</p>
    <p>Každý kus ručne vybraný</p>
    <p style="margin-top:16px;color:#444;">© 2025 REFIT</p>
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
          <div class="form-group"><label class="form-label">Meno</label><input type="text" class="form-input" placeholder="Ján" id="firstName"></div>
          <div class="form-group"><label class="form-label">Priezvisko</label><input type="text" class="form-input" placeholder="Novák" id="lastName"></div>
        </div>
        <div class="form-row full"><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" placeholder="jan@email.sk" id="email"></div></div>
        <div class="form-row full"><div class="form-group"><label class="form-label">Telefón</label><input type="text" class="form-input" placeholder="+421 9XX XXX XXX" id="phone"></div></div>
      </div>
      <div class="form-section">
        <p class="form-section-title">Doručovacia adresa</p>
        <div class="form-row full"><div class="form-group"><label class="form-label">Ulica a číslo</label><input type="text" class="form-input" placeholder="Hlavná 12" id="street"></div></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Mesto</label><input type="text" class="form-input" placeholder="Bratislava" id="city"></div>
          <div class="form-group"><label class="form-label">PSČ</label><input type="text" class="form-input" placeholder="811 01" id="zip"></div>
        </div>
      </div>
      <div class="form-section">
        <p class="form-section-title">Platba</p>
        <div class="form-row full"><div class="form-group"><label class="form-label">Číslo karty</label><input type="text" class="form-input" placeholder="1234 5678 9012 3456" id="cardNum" maxlength="19"></div></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Platnosť</label><input type="text" class="form-input" placeholder="MM/RR" id="cardExp" maxlength="5"></div>
          <div class="form-group"><label class="form-label">CVV</label><input type="text" class="form-input" placeholder="123" id="cardCvv" maxlength="3"></div>
        </div>
      </div>
      <button class="place-order-btn" onclick="placeOrder()">DOKONČIŤ OBJEDNÁVKU →</button>
    </div>
    <div class="success-screen" id="successScreen">
      <div class="success-icon">✓</div>
      <h2 class="success-title">OBJEDNÁVKA PRIJATÁ</h2>
      <p class="success-text">Ďakujeme za tvoju objednávku. Potvrdenie sme ti poslali na email. Tovar odošleme do 2–3 pracovných dní.</p>
      <button class="checkout-btn" style="width:auto;padding:16px 40px;" onclick="closeCheckout()">Späť do shopu</button>
    </div>
  </div>
</div>

<!-- DETAIL MODAL -->
<div class="detail-modal" id="detailModal">
  <button class="detail-close" onclick="closeDetail()">×</button>
  <div class="detail-box" id="detailBox"></div>
</div>

<script>
const PRODUCTS = ${JSON.stringify(productData)};
const SERVER_URL = 'https://glorious-optimism-production-0039.up.railway.app';

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx-6+'px';cursor.style.top=my-6+'px';});
function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx-18+'px';ring.style.top=ry-18+'px';requestAnimationFrame(animRing);}
animRing();

let cart=[];

function getCategoryName(cat){return{jacket:'Bunda',hoodie:'Hoodie',sweatshirt:'Sweatshirt',tee:'Tričko',pants:'Nohavice',shirt:'Košeľa',other:'Oblečenie'}[cat]||'Oblečenie';}

function renderProducts(filter){
  const grid=document.getElementById('productGrid');
  const filtered=filter==='all'?PRODUCTS:PRODUCTS.filter(p=>p.category===filter);
  grid.innerHTML=filtered.map(p=>\`
    <div class="product-card">
      <div class="product-img">
        <img src="\${p.image}" alt="\${p.name}" loading="lazy" onerror="this.style.display='none'">
        <div class="product-overlay">
          <button class="quick-detail" onclick="openDetail(\${p.id})">ZOBRAZIŤ DETAIL</button>
          <button class="quick-add" onclick="addToCart(\${p.id})">PRIDAŤ DO KOŠÍKA</button>
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

function filterProducts(filter,btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter);
}

function openDetail(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  const imgs=(p.images||[]).filter(Boolean);
  if(!imgs.length && p.image) imgs.push(p.image);
  document.getElementById('detailBox').innerHTML=\`
    <div class="detail-photos">
      \${imgs.slice(0,3).map(src=>\`<img src="\${src}" alt="\${p.name}" onerror="this.style.display='none'">\`).join('')}
    </div>
    <div class="detail-info">
      <p class="detail-category">\${getCategoryName(p.category)}</p>
      <h2 class="detail-name">\${p.name}</h2>
      <p class="detail-price">\${p.price} €</p>
      <div class="detail-sizes">
        \${(p.sizes||[]).map(s=>\`<span class="detail-size-tag">\${s}</span>\`).join('')}
      </div>
      <button class="detail-add-btn" onclick="addToCart(\${p.id});closeDetail()">PRIDAŤ DO KOŠÍKA</button>
    </div>
  \`;
  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeDetail(){
  document.getElementById('detailModal').classList.remove('open');
  document.body.style.overflow='';
}

document.getElementById('detailModal').addEventListener('click', function(e){
  if(e.target === this) closeDetail();
});

function addToCart(id){
  const p=PRODUCTS.find(x=>x.id===id);
  const ex=cart.find(x=>x.id===id);
  if(ex)ex.qty++;else cart.push({...p,qty:1});
  updateCart();
  if(!document.getElementById('cartSidebar').classList.contains('open'))toggleCart();
}

function updateCart(){
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
      <div class="cart-item-img"><img src="\${item.image}" alt="\${item.name}" style="width:100%;height:100%;object-fit:cover"></div>
      <div class="cart-item-details">
        <p class="cart-item-name">\${item.name}</p>
        <p class="cart-item-meta">\${getCategoryName(item.category)}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(\${item.id},-1)">−</button>
          <span class="qty-value">\${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(\${item.id},1)">+</button>
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
    .catch(()=>alert('Chyba. Skúste znova.'));
}

document.addEventListener('DOMContentLoaded',()=>{
  renderProducts('all');
  const cn=document.getElementById('cardNum');
  if(cn)cn.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim();});
  const ce=document.getElementById('cardExp');
  if(ce)ce.addEventListener('input',e=>{let v=e.target.value.replace(/\\D/g,'').substring(0,4);if(v.length>=2)v=v.slice(0,2)+'/'+v.slice(2);e.target.value=v;});
});
</script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('✅ index.html vygenerovaný s reálnymi produktmi!');
console.log('📁 Nahraj index.html do GitHub repozitára REFIT-shop');