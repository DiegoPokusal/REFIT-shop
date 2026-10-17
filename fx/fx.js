/* Desktop-only visual effects. Loaded after the main script (needs PRODUCTS and
   openDetail). Does nothing on phones/tablets or with reduced motion. Every
   piece is wrapped so a failure disables only that effect, never the shop. */
(function () {
  var mm = window.matchMedia;
  if (!mm || !mm('(min-width:1025px) and (hover:hover) and (pointer:fine)').matches) return;
  if (mm('(prefers-reduced-motion:reduce)').matches) return;
  document.documentElement.classList.add('fx');

  var LBL = ['Pred', 'Zad', 'Štítok'];
  var isLive = function (p) { return !p.status || p.status === 'available'; };

  /* ---------- product cards: tilt + glare + photo scrub ---------- */
  try {
    var st = null;
    var idOf = function (card) {
      var m = /openDetail\((\d+)\)/.exec(card.getAttribute('onclick') || '');
      return m ? Number(m[1]) : null;
    };
    var leave = function () {
      if (!st) return;
      var c = st.card;
      c.classList.remove('fx-hot');
      c.style.transform = '';
      st.layers.forEach(function (im, i) { im.classList.toggle('on', i === 0); });
      st.segs.forEach(function (s, i) { s.classList.toggle('on', i === 0); });
      st.lbl.textContent = LBL[0];
      st = null;
    };
    var enter = function (card) {
      var id = idOf(card);
      var p = PRODUCTS.find(function (x) { return x.id === id; });
      var box = card.querySelector('.product-img');
      if (!p || !box) return;
      var first = box.querySelector('img:not(.fx-l-extra)');
      if (!first) return;
      first.classList.add('fx-l');
      var layers = [first];
      var urls = (p.images || []).filter(Boolean).slice(0, 3);
      if (isLive(p) && urls.length > 1) {
        if (!card._fxExtra) {
          card._fxExtra = urls.slice(1).map(function (u) {
            var im = document.createElement('img');
            im.className = 'fx-l fx-l-extra'; im.src = u; im.alt = ''; im.decoding = 'async';
            box.insertBefore(im, box.querySelector('.product-overlay'));
            return im;
          });
        }
        layers = layers.concat(card._fxExtra);
      }
      if (!card._fxUi) {
        var glare = document.createElement('div'); glare.className = 'fx-glare';
        var seg = document.createElement('div'); seg.className = 'fx-seg';
        seg.innerHTML = layers.length > 1 ? layers.map(function () { return '<i></i>'; }).join('') : '';
        var lbl = document.createElement('div'); lbl.className = 'fx-lbl'; lbl.textContent = LBL[0];
        box.appendChild(glare); box.appendChild(seg); box.appendChild(lbl);
        card._fxUi = { glare: glare, seg: seg, lbl: lbl };
      }
      var ui = card._fxUi;
      if (layers.length < 2) ui.lbl.style.display = 'none'; else ui.lbl.style.display = '';
      first.classList.add('on');
      var segs = Array.prototype.slice.call(ui.seg.children);
      if (segs[0]) segs[0].classList.add('on');
      card.classList.add('fx-hot');
      st = { card: card, box: box, layers: layers, segs: segs, lbl: ui.lbl, glare: ui.glare, k: 0, rect: null };
    };
    var move = function (e) {
      if (!st) return;
      if (!st.rect) st.rect = st.card.getBoundingClientRect();
      var r = st.rect;
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      x = Math.max(0, Math.min(1, x)); y = Math.max(0, Math.min(1, y));
      st.card.style.transform = 'rotateY(' + ((x - 0.5) * 12) + 'deg) rotateX(' + ((0.5 - y) * 12) + 'deg) scale(1.03)';
      st.glare.style.setProperty('--gx', (x * 100) + '%');
      st.glare.style.setProperty('--gy', (y * 100) + '%');
      var n = st.layers.length;
      if (n > 1) {
        var k = Math.min(n - 1, Math.floor(x * n));
        if (k !== st.k) {
          st.k = k;
          st.layers.forEach(function (im, i) { im.classList.toggle('on', i === k); });
          st.segs.forEach(function (s, i) { s.classList.toggle('on', i === k); });
          st.lbl.textContent = LBL[k];
        }
      }
    };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var t = e.target;
      var card = t && t.closest ? t.closest('.product-card') : null;
      if (!card) { leave(); return; }
      if (st && st.card !== card) leave();
      if (!st) enter(card);
      move(e);
    }, { passive: true });
    /* warm the cache with the back/label photos of cards near the viewport,
       so scrubbing on hover shows them instantly instead of flashing empty */
    var warmT = null;
    var warm = function () {
      warmT = null;
      var lim = window.innerHeight + 700;
      Array.prototype.forEach.call(document.querySelectorAll('.product-card'), function (c) {
        if (c._fxWarm) return;
        var r = c.getBoundingClientRect();
        if (r.bottom < -300 || r.top > lim || !c.offsetParent) return;
        c._fxWarm = true;
        var id = idOf(c), p = PRODUCTS.find(function (x) { return x.id === id; });
        if (p && isLive(p)) (p.images || []).slice(1, 3).forEach(function (u) { if (u) { var im = new Image(); im.src = u; } });
      });
    };
    var warmSoon = function () { if (!warmT) warmT = setTimeout(warm, 250); };
    window.addEventListener('scroll', warmSoon, { passive: true });
    window.addEventListener('load', warmSoon);
    document.addEventListener('click', warmSoon);
    setTimeout(warmSoon, 800);
    document.addEventListener('mouseleave', leave);
    window.addEventListener('scroll', function () { if (st) st.rect = null; }, { passive: true });
    window.addEventListener('resize', function () { if (st) st.rect = null; });
  } catch (err) { /* cards keep working without the effect */ }

  /* ---------- detail modal: loupe ---------- */
  window.REFIT_FX = window.REFIT_FX || {};
  window.REFIT_FX.detail = function () {
    try {
      var car = document.querySelector('#detailBox .detail-carousel');
      if (!car) return;
      var Z = 2.6, loupe = document.createElement('div');
      loupe.className = 'fx-loupe';
      car.appendChild(loupe);
      car.addEventListener('pointermove', function (e) {
        if (e.target.closest('.carousel-btn, .carousel-dots')) { loupe.style.display = 'none'; return; }
        var imgs = car.querySelectorAll('.detail-carousel-track img');
        var dots = car.querySelectorAll('.carousel-dot');
        var idx = 0;
        dots.forEach(function (d, i) { if (d.classList.contains('active')) idx = i; });
        var im = imgs[idx];
        if (!im || !im.naturalWidth) return;
        var r = im.getBoundingClientRect(), cr = car.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        if (x < 0 || y < 0 || x > r.width || y > r.height) { loupe.style.display = 'none'; return; }
        var L = loupe.offsetWidth || 210;
        var s = Math.max(r.width / im.naturalWidth, r.height / im.naturalHeight); /* object-fit: cover */
        var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
        var ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
        loupe.style.display = 'block';
        loupe.style.left = (e.clientX - cr.left - L / 2) + 'px';
        loupe.style.top = (e.clientY - cr.top - L / 2) + 'px';
        loupe.style.backgroundImage = 'url("' + (im.currentSrc || im.src) + '")';
        loupe.style.backgroundSize = (dw * Z) + 'px ' + (dh * Z) + 'px';
        loupe.style.backgroundPosition = (-((x - ox) * Z - L / 2)) + 'px ' + (-((y - oy) * Z - L / 2)) + 'px';
      });
      car.addEventListener('pointerleave', function () { loupe.style.display = 'none'; });
    } catch (err) { /* modal works without the loupe */ }
  };

  /* ---------- hero: halftone with a live lens ---------- */
  try {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var list = PRODUCTS.filter(function (p) { return p.tier === 'drops' && isLive(p) && p.image; });
    if (list.length > 6) {
      var step = list.length / 6, pick = [];
      for (var q = 0; q < 6; q++) pick.push(list[Math.floor(q * step)]);
      list = pick;
    }
    if (list.length < 2) return;

    var cv = document.createElement('canvas'); cv.className = 'fx-hero-canvas';
    var cap = document.createElement('div'); cap.className = 'fx-hero-cap';
    cap.innerHTML = '<div class="b"></div> <div class="p"></div><div class="m"></div>';
    var dotsEl = document.createElement('div'); dotsEl.className = 'fx-hero-dots';
    list.forEach(function () { dotsEl.appendChild(document.createElement('i')); });
    var hint = document.createElement('div'); hint.className = 'fx-hero-hint'; hint.textContent = 'Pohni myšou — kus ožije';
    var bg = hero.querySelector('.hero-bg');
    hero.insertBefore(cv, bg ? bg.nextSibling : hero.firstChild);
    hero.appendChild(cap); hero.appendChild(dotsEl); hero.appendChild(hint);
    var ctx = cv.getContext('2d');

    var CELL = 12, cream = [240, 236, 228];
    var W = 0, H = 0, cols = 0, rows = 0, imgs = [], grids = [], rects = [];
    var cur = 0, prev = 0, tStart = -10, TR = 1.5, lastSwitch = 0;
    var mx = 0, my = 0, lx = 0, ly = 0, lastMove = -99, have = false;
    var running = false, started = false, dead = false;

    var caption = function () {
      var p = list[cur];
      cap.style.opacity = 0;
      setTimeout(function () {
        cap.querySelector('.b').textContent = (p.brand || p.name.split(' ')[0]).toUpperCase();
        cap.querySelector('.p').textContent = p.price + ' €';
        cap.querySelector('.m').textContent = p.name;
        cap.style.opacity = 1;
        Array.prototype.forEach.call(dotsEl.children, function (d, k) { d.className = k === cur ? 'on' : ''; });
      }, 250);
    };
    var layout = function () {
      var DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return false;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
      var off = document.createElement('canvas'); off.width = W; off.height = H;
      var o = off.getContext('2d', { willReadFrequently: true });
      grids = imgs.map(function (im, i) {
        var maxH = H * 0.62, maxW = W * 0.34;
        var s = Math.min(maxH / im.naturalHeight, maxW / im.naturalWidth);
        var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
        var dx = W * 0.7 - dw / 2, dy = H * 0.44 - dh / 2;
        rects[i] = { dx: dx, dy: dy, dw: dw, dh: dh };
        o.fillStyle = '#fff'; o.fillRect(0, 0, W, H); o.drawImage(im, dx, dy, dw, dh);
        var d = o.getImageData(0, 0, W, H).data;
        var R = new Float32Array(cols * rows), C = new Array(cols * rows);
        for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
          var px = Math.min(W - 1, Math.floor(x * CELL + CELL / 2)), py = Math.min(H - 1, Math.floor(y * CELL + CELL / 2));
          var k = (py * W + px) * 4, r = d[k], g = d[k + 1], b = d[k + 2], idx = y * cols + x;
          if (r > 236 && g > 236 && b > 236) { R[idx] = 0; C[idx] = [0, 0, 0]; continue; }
          var L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          R[idx] = 0.42 + 0.58 * (1 - L / 255);
          if (L < 120) { var m = (120 - L) / 120 * 0.8; r = r * (1 - m) + cream[0] * m; g = g * (1 - m) + cream[1] * m; b = b * (1 - m) + cream[2] * m; }
          C[idx] = [r, g, b];
        }
        return { R: R, C: C };
      });
      return true;
    };
    var next = function () { prev = cur; cur = (cur + 1) % imgs.length; tStart = performance.now() / 1000; lastSwitch = tStart; caption(); };
    var ease = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); };

    var frame = function (ts) {
      if (dead) return;
      if (!running || document.hidden) { started = false; return; }
      var t = ts / 1000;
      if (t - lastSwitch > 5) next();
      if (t - lastMove > 2.5) {
        var a = t * 0.6, rc = rects[cur];
        mx = rc.dx + rc.dw * (0.5 + Math.cos(a) * 0.3); my = rc.dy + rc.dh * (0.5 + Math.sin(a * 1.4) * 0.28); have = true;
      }
      lx += (mx - lx) * 0.1; ly += (my - ly) * 0.1;
      ctx.clearRect(0, 0, W, H);
      var p = Math.min(1, (t - tStart) / TR), G = grids[cur], P = grids[prev], LR = 150;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var i = y * cols + x, r, c;
        if (p < 1) {
          var d = (x / cols) * 0.45 + ((x * 7 + y * 13) % 10) / 100, qq = ease((p - d) / 0.5);
          r = P.R[i] + (G.R[i] - P.R[i]) * qq;
          var ca = P.C[i], cb = G.C[i];
          c = [ca[0] + (cb[0] - ca[0]) * qq, ca[1] + (cb[1] - ca[1]) * qq, ca[2] + (cb[2] - ca[2]) * qq];
        } else { r = G.R[i]; c = G.C[i]; }
        var rad = r * CELL * 0.5;
        if (rad < 0.4) continue;
        var cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2;
        var dd = Math.hypot(cx - lx, cy - ly);
        if (dd < LR * 2.1) rad *= 1 + (1 - dd / (LR * 2.1)) * 0.5;
        ctx.fillStyle = 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.283); ctx.fill();
      }
      if (have) {
        var k = p < 0.5 ? prev : cur, rr = rects[k];
        ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, LR, 0, 6.283); ctx.clip();
        ctx.fillStyle = '#f0ece4'; ctx.fillRect(lx - LR, ly - LR, LR * 2, LR * 2);
        ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(imgs[k], rr.dx, rr.dy, rr.dw, rr.dh); ctx.restore();
        ctx.strokeStyle = '#e63222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lx, ly, LR + 6, 0, 6.283); ctx.stroke();
      }
      requestAnimationFrame(frame);
    };
    var kick = function () { if (!started && running && !document.hidden && imgs.length) { started = true; requestAnimationFrame(frame); } };

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var b = cv.getBoundingClientRect();
      mx = e.clientX - b.left; my = e.clientY - b.top; lastMove = performance.now() / 1000;
      if (!have) { lx = mx; ly = my; have = true; }
    }, { passive: true });
    hero.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var b = cv.getBoundingClientRect();
      if (Math.hypot(e.clientX - b.left - lx, e.clientY - b.top - ly) <= 156) openDetail(list[cur].id);
    });
    document.addEventListener('visibilitychange', kick);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; kick(); }, { threshold: 0.05 }).observe(hero);
    } else { running = true; }
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (imgs.length) layout(); }, 200);
    });

    Promise.all(list.map(function (p) {
      return new Promise(function (res, rej) {
        var im = new Image(); im.crossOrigin = 'anonymous';
        im.onload = function () { res(im); }; im.onerror = rej; im.src = p.image;
      });
    })).then(function (a) {
      imgs = a;
      (function init(tries) {
        if (cv.clientWidth && cv.clientHeight) {
          try { layout(); } catch (e) { cv.remove(); cap.remove(); dotsEl.remove(); hint.remove(); dead = true; return; }
          hero.classList.add('fx-hero-live');
          lastSwitch = performance.now() / 1000; caption(); running = running || !('IntersectionObserver' in window); kick();
        } else if (tries < 60) requestAnimationFrame(function () { init(tries + 1); });
      })(0);
    }).catch(function () { cv.remove(); cap.remove(); dotsEl.remove(); hint.remove(); dead = true; });
  } catch (err) { /* hero keeps its normal look */ }
})();
