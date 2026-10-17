/* ============================================================
   AÉRA — website prototype behaviour
   Shared header/footer, product data, cart (saved in the browser),
   and the interactive bits of each page.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const A = (f) => "assets/" + f;
  const money = (n) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-AU", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const page = document.body.dataset.page;

  // Browser storage can be blocked (private mode, file:// in some browsers) — fall back to memory.
  const memory = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aera:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return k in memory ? memory[k] : d; } },
    set(k, v) { memory[k] = v; try { localStorage.setItem("aera:" + k, JSON.stringify(v)); } catch (e) { /* memory only */ } },
  };

  // Hide images that have not been added to /assets yet, so the layout still reads.
  document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") e.target.classList.add("is-missing"); }, true);

  /* ---------- Product data ----------
     fit = how the photo sits in its image well, copied from the Figma frames:
     a = aspect of the image box, h = height % of the well, t = top offset %. */
  const COLORS = { blue: "Baby Blue", brown: "Dark Brown" };
  const SIZES = ["X-Small", "Small", "Medium", "Large", "X-Large"];
  const PRODUCTS = {
    tank: {
      name: "Sculpting Tank Top", price: 49, rating: 4, category: "Tank Tops", styles: ["fitness", "loungewear"],
      desc: "Crafted from certified organic cotton with a built-in bra for seamless support from studio to street. Naturally breathable, PFAS-free and designed to move with your body. Wear it alone or layered under our long sleeve cover up.",
      fabric: "75% TENCEL™ Lyocell, 25% Elastane",
      features: ["Soft and breathable", "Four-way stretch", "Moisture-wicking", "Supportive built-in bra"],
      variants: {
        blue: { img: "p-tank-blue.webp", fit: { a: 196 / 298 }, gallery: [
          { src: "p-tank-blue.webp", w: 112, h: 171 }, { src: "p-tank-blue-model1.webp", w: 112, h: 177 }, { src: "p-tank-blue-model2.webp", w: 151, h: 180 }] },
        brown: { img: "p-tank-brown.webp", fit: { a: 231 / 298 }, gallery: [
          { src: "p-tank-brown.webp", w: 112, h: 171 }, { src: "p-tank-brown-model1.webp", w: 112, h: 177 }, { src: "p-tank-brown-model2.webp", w: 151, h: 180 }] },
      },
    },
    longsleeve: {
      name: "Long Sleeve Cover Up", price: 65, rating: 4.5, category: "Long Sleeve Tops", styles: ["loungewear"],
      desc: "A flowy boat-neck long sleeve in TENCEL™ Lyocell with a soft, fluid drape. Light enough for warm-up walks, relaxed enough for slow Sundays, and cut to layer over our sculpting tank.",
      fabric: "95% TENCEL™ Lyocell, 5% Elastane",
      features: ["Lightweight and breathable", "Soft, fluid drape", "Stretch for comfort", "Easy layering"],
      variants: { blue: { img: "p-longsleeve-blue.webp", fit: { a: 251 / 298 } }, brown: { img: "p-longsleeve-brown.webp", fit: { a: 1 } } },
    },
    leggings: {
      name: "High-Waisted Leggings", price: 79, rating: 4.5, category: "Leggings", styles: ["fitness", "loungewear"],
      desc: "Sculpting, high-rise leggings made from recycled nylon that diverts plastic waste from landfill. Durable and compressive with four-way stretch, so they hold their shape from reformer to the long way home.",
      fabric: "75% Recycled Nylon, 25% Elastane",
      features: ["Durable and compressive", "Four-way stretch", "Shape retention", "Moisture-wicking"],
      variants: { blue: { img: "p-leggings-blue.webp", fit: { a: 136 / 297.151, h: 99.71 } }, brown: { img: "p-leggings-brown.webp", fit: { a: 156 / 298 } } },
    },
    headband: {
      name: "Sweat Headband", price: 18, rating: 3, category: "Accessories", styles: ["fitness"],
      desc: "A twist-front sweat headband cut from the same recycled nylon as our leggings, so offcuts become something useful. Soft, stretchy and made to match.",
      fabric: "75% Recycled Nylon, 25% Elastane",
      features: ["Stretch and recovery", "Moisture-wicking", "Soft and lightweight", "Matches leggings fabric"],
      variants: { blue: { img: "p-headband-blue.webp", fit: { a: 251 / 199, h: 66.78, t: 11.07 } }, brown: { img: "p-headband-brown.webp", fit: { a: 258 / 298 } } },
    },
  };
  // Shop All order, exactly as in the Figma grid
  const LISTING = [["tank", "blue"], ["longsleeve", "blue"], ["leggings", "blue"], ["tank", "brown"], ["longsleeve", "brown"], ["leggings", "brown"], ["headband", "blue"], ["headband", "brown"]];

  const url = (id, color) => `product.html?id=${id}&color=${color}`;
  const fitStyle = (fit, over) => {
    const f = Object.assign({ h: 100, t: 0 }, fit, over || {});
    return `style="--h:${f.h}%;--top:${f.t}%;aspect-ratio:${f.a}"`;
  };

  /* ---------- Stars (exported from the Figma file) ---------- */
  function starsImg(rating, kind) {
    const sets = {
      card: { 4: ["stars-4.svg", 89.896], 4.5: ["stars-4-5.svg", 104], 3: ["stars-3.svg", 66.094], h: 18.49 },
      review: { 5: ["review-stars-5.svg", 138.842], 4: ["review-stars-4.svg", 109.776], h: 22.579 },
      large: { 4: ["stars-4-lg.svg", 120.149], h: 24.712 },
    }[kind];
    const hit = sets[rating];
    if (hit) return `<img src="${A(hit[0])}" width="${hit[0 + 1]}" height="${sets.h}" alt="${rating} out of 5 stars">`;
    const full = Math.round(rating);
    return `<span class="stars-text" aria-label="${rating} out of 5 stars">${"★".repeat(full)}<span style="color:#e3dad7">${"★".repeat(5 - full)}</span></span>`;
  }
  const ratingText = (r) => `${r}/<em>5</em>`;

  function productCard(id, color, opts = {}) {
    const p = PRODUCTS[id], v = p.variants[color];
    const fit = id === "longsleeve" && color === "brown" && opts.home ? { a: 268 / 298 } : v.fit;
    if (opts.home) {
      return `<a class="p-card" href="${url(id, color)}">
        <div class="p-media"><img src="${A(v.img)}" alt="${esc(p.name)} in ${COLORS[color]}" loading="lazy" ${fitStyle(fit)}></div>
        <div class="p-meta"><p class="p-name">${esc(p.name)}</p><p class="p-price">${money(p.price)}</p></div></a>`;
    }
    return `<a class="p-card" href="${url(id, color)}">
      <div class="p-media"><img src="${A(v.img)}" alt="${esc(p.name)} in ${COLORS[color]}" loading="lazy" ${fitStyle(fit)}></div>
      <p class="p-name">${esc(p.name)}</p>
      <div class="p-rating">${starsImg(p.rating, "card")}<span>${ratingText(p.rating)}</span></div>
      <p class="p-price">${money(p.price)}</p></a>`;
  }

  /* ---------- Cart ---------- */
  const DEMO_CART = [
    { id: "tank", color: "blue", size: "Large", qty: 1 },
    { id: "tank", color: "brown", size: "Large", qty: 1 },
    { id: "leggings", color: "blue", size: "Large", qty: 1 },
  ];
  if (!store.get("seeded", false)) { store.set("cart", DEMO_CART); store.set("seeded", true); }
  const cart = {
    items: () => store.get("cart", []),
    save(items) { store.set("cart", items); updateCount(); },
    add(line) {
      const items = cart.items();
      const hit = items.find((i) => i.id === line.id && i.color === line.color && i.size === line.size);
      if (hit) hit.qty = Math.min(99, hit.qty + line.qty); else items.push(line);
      cart.save(items);
    },
    count: () => cart.items().reduce((n, i) => n + i.qty, 0),
  };
  function updateCount() {
    const n = cart.count();
    $$(".cart-count").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }

  /* ---------- Toast + modal ---------- */
  let toastTimer;
  function toast(html) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = html;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3200);
  }
  function modal(html, onReady) {
    const m = document.createElement("div");
    m.className = "modal";
    m.innerHTML = `<div class="modal-scrim" data-close></div><div class="modal-card" role="dialog" aria-modal="true"><button class="modal-close" data-close aria-label="Close">×</button>${html}</div>`;
    document.body.appendChild(m);
    const lastFocus = document.activeElement;
    const close = () => { m.classList.remove("is-open"); document.removeEventListener("keydown", onKey); setTimeout(() => m.remove(), 250); if (lastFocus) lastFocus.focus(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => { m.classList.add("is-open"); const f = $("input, textarea, button:not(.modal-close)", m); if (f) f.focus(); });
    if (onReady) onReady(m, close);
    return close;
  }
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  function openJoin() {
    const member = store.get("member", null);
    if (member) {
      modal(`<h3>You're a member</h3><p class="lede">Free express shipping is applied to your first order.</p>
        <div class="form"><a class="btn btn-dark" href="shop.html">Start shopping</a><button class="btn btn-light" data-signout>Sign out</button></div>`,
      (m, close) => $("[data-signout]", m).addEventListener("click", () => { store.set("member", null); close(); toast("Signed out"); }));
      return;
    }
    modal(`<h3>Join AÉRA</h3><p class="lede">Members get <b>FREE</b> express shipping on their first order, early access to new drops and the occasional studio invite.</p>
      <form class="form" novalidate>
        <label class="field">Full name<input name="name" autocomplete="name" required></label>
        <label class="field">Email address<input name="email" type="email" autocomplete="email" required></label>
        <p class="form-note" aria-live="polite"></p>
        <button class="btn btn-dark" type="submit">Join Now</button>
      </form>`, (m, close) => {
      $("form", m).addEventListener("submit", (e) => {
        e.preventDefault();
        const name = e.target.name.value.trim(), email = e.target.email.value;
        const note = $(".form-note", m);
        if (!name) { note.textContent = "Please add your name."; note.className = "form-note err"; return; }
        if (!validEmail(email)) { note.textContent = "That email doesn't look quite right."; note.className = "form-note err"; return; }
        store.set("member", true);   // remember membership only — no name or email is stored
        close();
        toast(`Welcome, ${esc(name.split(" ")[0])} — free express shipping is on us.`);
        if (page === "cart") renderCart();
      });
    });
  }

  /* ---------- Shared header ---------- */
  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    const cur = (p) => (page === p ? ' aria-current="page"' : "");
    const hidden = store.get("announceHidden", false);
    host.outerHTML = `
      <div class="announce${hidden ? " is-hidden" : ""}" id="announce">
        <p>All New Members Receive <b>FREE</b> Express Shipping On Their First Order.&nbsp; <a href="#" data-join>Sign Up Now!</a></p>
        <button class="announce-close" aria-label="Dismiss announcement"><img src="${A("icon-close.svg")}" width="20" height="20" alt=""></button>
      </div>
      <header class="site-header">
        <div class="wrap wrap-header header-row">
          <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M4 8h20M4 14h20M4 20h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </button>
          <a class="logo" href="index.html" aria-label="AÉRA home">AÉRA</a>
          <nav class="main-nav" aria-label="Main">
            <div class="nav-shop">
              <button aria-expanded="false" aria-haspopup="true"><span>Shop</span><img src="${A("icon-chevron-down.svg")}" width="16" height="16" alt=""></button>
              <div class="nav-dropdown" role="menu">
                <a href="shop.html" role="menuitem">Shop All</a>
                <a href="shop.html?style=fitness" role="menuitem">Fitness</a>
                <a href="shop.html?style=loungewear" role="menuitem">Lounge</a>
              </div>
            </div>
            <a href="about.html"${cur("about")}>About Us</a>
            <a href="sustainability.html"${cur("sustainability")}>Sustainability</a>
            <a href="inspiration.html"${cur("inspiration")}>Inspiration</a>
          </nav>
          <form class="search" role="search" action="shop.html">
            <img src="${A("icon-search.svg")}" width="24" height="24" alt="">
            <label class="sr-only" for="q">Search products</label>
            <input id="q" name="q" type="search" placeholder="What are you looking for?" autocomplete="off">
          </form>
          <div class="header-icons">
            <a href="cart.html" aria-label="Cart"><img src="${A("icon-cart.svg")}" width="24" height="24" alt=""><span class="cart-count" hidden>0</span></a>
            <button data-join aria-label="Account"><img src="${A("icon-user.svg")}" width="24" height="24" alt=""></button>
          </div>
        </div>
      </header>
      <div class="drawer" aria-hidden="true">
        <div class="drawer-scrim"></div>
        <div class="drawer-panel">
          <div class="drawer-head"><a class="logo" href="index.html">AÉRA</a><button class="modal-close" style="position:static" aria-label="Close menu">×</button></div>
          <form class="search" role="search" action="shop.html"><img src="${A("icon-search.svg")}" width="24" height="24" alt=""><input name="q" type="search" placeholder="What are you looking for?" aria-label="Search products"></form>
          <nav class="drawer-links" aria-label="Mobile">
            <a href="shop.html">Shop All</a>
            <a class="sub" href="shop.html?style=fitness">Fitness</a>
            <a class="sub" href="shop.html?style=loungewear">Lounge</a>
            <a href="about.html">About Us</a>
            <a href="sustainability.html">Sustainability</a>
            <a href="inspiration.html">Inspiration</a>
            <a href="cart.html">Cart</a>
          </nav>
        </div>
      </div>`;

    const q = new URLSearchParams(location.search).get("q");
    if (q) $$(".search input").forEach((i) => (i.value = q));

    $(".announce-close").addEventListener("click", () => { $("#announce").classList.add("is-hidden"); store.set("announceHidden", true); });

    const shop = $(".nav-shop"), shopBtn = $("button", shop);
    let hoverTimer;
    const setShop = (open) => { shop.classList.toggle("is-open", open); shopBtn.setAttribute("aria-expanded", open); };
    shopBtn.addEventListener("click", (e) => { e.stopPropagation(); setShop(!shop.classList.contains("is-open")); });
    shop.addEventListener("mouseenter", () => { clearTimeout(hoverTimer); if (matchMedia("(hover:hover)").matches) setShop(true); });
    shop.addEventListener("mouseleave", () => { hoverTimer = setTimeout(() => setShop(false), 150); });
    document.addEventListener("click", (e) => { if (!shop.contains(e.target)) setShop(false); });

    const drawer = $(".drawer"), toggle = $(".menu-toggle");
    const setDrawer = (open) => { drawer.classList.toggle("is-open", open); drawer.setAttribute("aria-hidden", !open); toggle.setAttribute("aria-expanded", open); document.body.style.overflow = open ? "hidden" : ""; };
    toggle.addEventListener("click", () => setDrawer(true));
    $(".drawer-scrim").addEventListener("click", () => setDrawer(false));
    $(".drawer .modal-close").addEventListener("click", () => setDrawer(false));
  }

  /* ---------- Shared footer (membership perks + footer) ---------- */
  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.outerHTML = `
      <div class="footer-area">
        <section class="perks" aria-label="Membership perks">
          <div class="perks-left">
            <p>Join Today &amp; Get FREE Express Shipping On Your First Order!</p>
            <button data-join>JOIN NOW</button>
          </div>
          <div class="perks-right">
            <div class="crop perks-logo"><img src="${A("logo-cloud-white.webp")}" alt="AÉRA"></div>
            <p>Membership Perks</p>
          </div>
        </section>
        <footer class="site-footer">
          <div class="wrap footer-wrap">
            <div class="footer-top">
              <div class="footer-brand">
                <a class="logo" href="index.html">AÉRA</a>
                <p>We Care, You Wear</p>
                <div class="social">
                  <a href="#" aria-label="X (Twitter)"><img class="bg" src="${A("social-twitter.svg")}" width="28" height="28" alt=""></a>
                  <a href="#" aria-label="Instagram"><img class="bg" src="${A("social-instagram.svg")}" width="28" height="28" alt=""></a>
                  <a href="#" aria-label="TikTok"><img class="bg" src="${A("social-bg.svg")}" width="28" height="28" alt=""><img src="${A("social-tiktok.webp")}" width="16" height="16" style="left:6px;top:6px" alt=""></a>
                  <a href="#" aria-label="Facebook"><img class="bg" src="${A("social-bg.svg")}" width="28" height="28" alt=""><img src="${A("social-facebook.webp")}" width="16" height="16" style="left:6px;top:6px" alt=""></a>
                </div>
              </div>
              <div class="footer-cols">
                <div class="footer-col company"><h4>Company</h4><ul><li><a href="about.html">About Us</a></li><li><a href="sustainability.html">Sustainability</a></li></ul></div>
                <div class="footer-col"><h4>Help</h4><ul><li><a href="#" data-info="Customer Support">Customer Support</a></li><li><a href="#" data-info="Delivery Details">Delivery Details</a></li><li><a href="#" data-info="Terms &amp; Conditions">Terms &amp; Conditions</a></li><li><a href="#" data-info="Privacy Policy">Privacy Policy</a></li></ul></div>
                <div class="footer-col"><h4>FAQ</h4><ul><li><a href="#" data-info="Account">Account</a></li><li><a href="#" data-info="Manage Deliveries">Manage Deliveries</a></li><li><a href="#" data-info="Orders">Orders</a></li><li><a href="#" data-info="Payments">Payments</a></li></ul></div>
              </div>
            </div>
            <div class="footer-bottom">
              <p>AÉRA © 2026. All Rights Reserved.</p>
              <div class="badges" aria-label="Accepted payments">
                ${["visa", "mastercard", "paypal", "applepay", "gpay"].map((b) => `<span class="badge"><img src="${A("badge-" + b + ".svg")}" width="46.84" height="30.25" alt="${b}"></span>`).join("")}
              </div>
            </div>
          </div>
        </footer>
      </div>`;
    $$("[data-info]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast(`${a.dataset.info} isn't part of this prototype yet`); }));
    $$(".social a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toast("Social links will go live with the real site"); }));
  }

  /* ============================================================
     HOME
     ============================================================ */
  const HOME_REVIEWS = [
    { name: "Sarah M.", stars: 5, text: "\"I'm blown away by the quality and style of the pieces I received from AÉRA. From reformer classes to weekend coffee runs, every piece I've bought has exceeded my expectations.”" },
    { name: "Sarah M.", stars: 5, text: "\"I've been searching for activewear I actually feel good about wearing, not just stylistically but knowing exactly what it's made from. AÉRA ticks every box.\"" },
    { name: "Alex K.", stars: 5, text: "\"Finally a brand that doesn't sacrifice style for sustainability. I wear AÉRA to reformer pilates three times a week and get compliments every time. Worth every cent.\"" },
    { name: "James L.", stars: 5, text: "“I was sceptical about buying activewear online but the product descriptions were so detailed and honest that I felt completely confident. Everything arrived beautifully packaged and fits perfectly.”" },
    { name: "Mooen", stars: 5, text: "\"As someone who's always on the lookout for unique activewear, I'm thrilled to have stumbled upon AÉRA. Every piece is not only beautifully made but also on-point with the latest trends.”" },
  ];

  function reviewCard(r, opts = {}) {
    return `<article class="review">
      <div class="review-top">
        <div class="review-body">
          ${starsImg(r.stars, "review")}
          <div class="review-who">${esc(r.name)} <img src="${A("review-verified.svg")}" width="24" height="24" alt="Verified buyer"></div>
          <p class="review-text">${esc(r.text)}</p>
        </div>
        ${opts.menu ? `<div class="review-more"><button aria-label="Review options"><img src="${A("icon-more.svg")}" width="24" height="24" alt=""></button>
          <div class="review-menu"><button data-act="helpful">Mark as helpful</button><button data-act="report">Report review</button></div></div>` : ""}
      </div>
      ${r.date ? `<p class="review-date">Posted on ${esc(r.date)}</p>` : ""}
    </article>`;
  }

  function initHome() {
    $("#arrivals").innerHTML = [["tank", "blue"], ["longsleeve", "brown"], ["leggings", "blue"], ["headband", "brown"]]
      .map(([id, c]) => productCard(id, c, { home: true })).join("");

    // Customer reviews carousel — centre three sharp, neighbours blurred (as in the design)
    const track = $("#home-reviews"), vp = $(".reviews-viewport");
    track.innerHTML = HOME_REVIEWS.map((r) => reviewCard(r)).join("");
    const cards = $$(".review", track);
    let idx = 1;
    const perView = () => (innerWidth <= 680 ? 1 : innerWidth <= 1024 ? 2 : 3);
    function place() {
      const gap = 20, w = cards[0].offsetWidth, n = perView();
      idx = Math.max(0, Math.min(idx, cards.length - n));
      const visible = n * w + (n - 1) * gap;
      const offset = (vp.clientWidth - visible) / 2 - idx * (w + gap);
      track.style.transform = `translateX(${offset}px)`;
      cards.forEach((c, i) => c.classList.toggle("is-blur", i < idx || i >= idx + n));
      $("#rev-prev").disabled = idx === 0;
      $("#rev-next").disabled = idx >= cards.length - n;
    }
    $("#rev-prev").addEventListener("click", () => { idx--; place(); });
    $("#rev-next").addEventListener("click", () => { idx++; place(); });
    cards.forEach((c, i) => c.addEventListener("click", () => { if (c.classList.contains("is-blur")) { idx = i < idx ? i : i - perView() + 1; place(); } }));
    let sx = null;
    vp.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    vp.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { idx += dx < 0 ? 1 : -1; place(); } sx = null; });
    addEventListener("resize", place);
    place();

    // Newsletter
    $("#newsletter").addEventListener("submit", (e) => {
      e.preventDefault();
      const note = $(".form-note", e.target), v = e.target.email.value;
      if (!validEmail(v)) { note.textContent = "Please enter a valid email address."; note.className = "form-note err"; note.style.color = "#f2c3c3"; return; }
      note.textContent = "You're subscribed — look out for our next letter."; note.className = "form-note ok"; note.style.color = "#fff";
      e.target.reset();
    });
  }

  /* ============================================================
     SHOP
     ============================================================ */
  function initShop() {
    const params = new URLSearchParams(location.search);
    const state = {
      q: (params.get("q") || "").trim().toLowerCase(),
      style: params.get("style") || "",
      category: params.get("category") || "",
      min: 50, max: 200, colors: [], sizes: ["Large"],   // the design's pre-selected values
      applied: { price: false, colors: false, sizes: false },
    };

    const grid = $("#shop-grid"), count = $("#shop-count"), chips = $("#shop-chips");
    const titleFor = () => state.style === "fitness" ? "Fitness" : state.style === "loungewear" ? "Lounge" : state.category || "Shop All";

    function results() {
      return LISTING.filter(([id, color]) => {
        const p = PRODUCTS[id];
        if (state.q && !(p.name + " " + COLORS[color] + " " + p.category).toLowerCase().includes(state.q)) return false;
        if (state.style && !p.styles.includes(state.style)) return false;
        if (state.category && p.category !== state.category) return false;
        if (state.applied.price && (p.price < state.min || p.price > state.max)) return false;
        if (state.applied.colors && state.colors.length && !state.colors.includes(color)) return false;
        if (state.applied.sizes && state.sizes.length && id === "headband") return false; // headband is one size
        return true;
      });
    }
    function render() {
      const list = results();
      $("#shop-title").textContent = titleFor();
      $("#crumb-current").textContent = titleFor();
      count.textContent = `Showing ${list.length} Product${list.length === 1 ? "" : "s"}`;
      grid.innerHTML = list.length ? list.map(([id, c]) => productCard(id, c)).join("")
        : `<div class="shop-empty"><p>Nothing matches those filters yet.</p><button class="btn btn-light" data-reset>Clear filters</button></div>`;
      const chipList = [];
      if (state.q) chipList.push(["q", `“${state.q}”`]);
      if (state.style) chipList.push(["style", titleFor()]);
      if (state.category) chipList.push(["category", state.category]);
      if (state.applied.price) chipList.push(["price", `${money(state.min)}–${money(state.max)}`]);
      if (state.applied.colors && state.colors.length) chipList.push(["colors", state.colors.map((c) => COLORS[c]).join(", ")]);
      if (state.applied.sizes && state.sizes.length) chipList.push(["sizes", state.sizes.join(", ")]);
      chips.innerHTML = chipList.map(([k, label]) => `<span class="chip">${esc(label)}<button data-chip="${k}" aria-label="Remove ${esc(label)}">×</button></span>`).join("");
      chips.hidden = !chipList.length;
      $$(".f-list button[data-category]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.category === state.category));
      $$(".f-list button[data-style]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.style === state.style));
    }
    function reset() {
      Object.assign(state, { q: "", style: "", category: "", min: 50, max: 200, colors: [], sizes: ["Large"], applied: { price: false, colors: false, sizes: false } });
      syncControls(); history.replaceState(null, "", "shop.html"); $$(".search input").forEach((i) => (i.value = "")); render();
    }

    // Category + dress style rows filter immediately
    $$(".f-list button[data-category]").forEach((b) => b.addEventListener("click", () => { state.category = state.category === b.dataset.category ? "" : b.dataset.category; render(); }));
    $$(".f-list button[data-style]").forEach((b) => b.addEventListener("click", () => { state.style = state.style === b.dataset.style ? "" : b.dataset.style; render(); }));

    // Collapsible groups
    $$(".f-group-head").forEach((h) => h.addEventListener("click", () => {
      const g = h.closest(".f-group"); g.classList.toggle("is-collapsed"); h.setAttribute("aria-expanded", !g.classList.contains("is-collapsed"));
    }));

    // Price range ($0–$250 scale so the design's $50/$200 handles sit where they do in Figma)
    const rMin = $("#price-min"), rMax = $("#price-max"), fill = $(".range-fill"), lMin = $("#label-min"), lMax = $("#label-max");
    function syncRange(e) {
      let a = +rMin.value, b = +rMax.value;
      if (a > b - 10) { if (e && e.target === rMin) a = b - 10; else b = a + 10; rMin.value = a; rMax.value = b; }
      state.min = a; state.max = b;
      const pct = (v) => (v / 250) * 100;
      fill.style.left = `calc(10px + (100% - 20px) * ${pct(a) / 100})`;
      fill.style.width = `calc((100% - 20px) * ${(pct(b) - pct(a)) / 100})`;
      lMin.style.left = `calc(10px + (100% - 20px) * ${pct(a) / 100})`; lMin.textContent = money(a);
      lMax.style.left = `calc(10px + (100% - 20px) * ${pct(b) / 100})`; lMax.textContent = money(b);
    }
    rMin.addEventListener("input", syncRange); rMax.addEventListener("input", syncRange);

    $$("#filter-colors .swatch").forEach((s) => s.addEventListener("click", () => {
      const c = s.dataset.color, on = s.getAttribute("aria-pressed") !== "true";
      s.setAttribute("aria-pressed", on);
      state.colors = on ? [...state.colors, c] : state.colors.filter((x) => x !== c);
    }));
    $$("#filter-sizes .pill").forEach((p) => p.addEventListener("click", () => {
      const s = p.textContent.trim(), on = p.getAttribute("aria-pressed") !== "true";
      p.setAttribute("aria-pressed", on);
      state.sizes = on ? [...state.sizes, s] : state.sizes.filter((x) => x !== s);
    }));
    function syncControls() {
      rMin.value = state.min; rMax.value = state.max; syncRange();
      $$("#filter-colors .swatch").forEach((s) => s.setAttribute("aria-pressed", state.colors.includes(s.dataset.color)));
      $$("#filter-sizes .pill").forEach((p) => p.setAttribute("aria-pressed", state.sizes.includes(p.textContent.trim())));
    }

    const panel = $(".filters");
    $("#apply-filter").addEventListener("click", () => {
      state.applied = { price: true, colors: true, sizes: true };
      render(); panel.classList.remove("is-open");
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#reset-filter").addEventListener("click", reset);
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-reset]")) reset();
      const chip = e.target.closest("[data-chip]");
      if (chip) {
        const k = chip.dataset.chip;
        if (k === "q") { state.q = ""; $$(".search input").forEach((i) => (i.value = "")); }
        else if (k === "style" || k === "category") state[k] = "";
        else { state.applied[k] = false; }
        render();
      }
    });
    $(".filters-mobile-toggle").addEventListener("click", () => panel.classList.add("is-open"));
    document.addEventListener("click", (e) => { if (panel.classList.contains("is-open") && !panel.contains(e.target) && !e.target.closest(".filters-mobile-toggle")) panel.classList.remove("is-open"); });

    syncControls();
    render();
  }

  /* ============================================================
     PRODUCT
     ============================================================ */
  const TANK_REVIEWS = [
    { name: "Mia T.", stars: 5, date: "October 14, 2026", text: "“This tank has become my most worn piece. The built-in bra gives just the right amount of support for pilates without feeling restrictive and the cotton feels so soft against the skin. Love that I don’t have to think twice about what I’m putting on my body”" },
    { name: "Sophie R.", stars: 4, date: "October 20, 2026", text: "“The fit on this is incredible. It’s sculpting without being too tight and the built-in bra actually stays in place during a full workout. I’ve been wearing it layered under my zip-up for morning walks too. Such a versatile piece.”" },
    { name: "Jess L.", stars: 4, date: "October 10, 2026", text: "“Really impressed with the quality. The fabric is breathable and doesn’t cling uncomfortably when I sweat. The built-in bra is supportive enough for low impact classes which is all I needed. Only wish it came in more colours but the baby blue is gorgeous.”" },
    { name: "Alex M.", stars: 5, date: "October 5, 2026", text: "“Honestly the most comfortable tank I own. It moves with you, doesn’t ride up and the built-in bra means one less layer to think about. You can tell the fabric is actually quality, nothing scratchy or synthetic feeling. Worth every cent.”" },
    // PLACEHOLDER: two extra reviews so "Load More Reviews" has something to load
    { name: "Priya S.", stars: 5, date: "September 28, 2026", text: "“Bought the dark brown after loving the blue. Washes beautifully and hasn’t lost its shape at all.”" },
    { name: "Hannah W.", stars: 4, date: "September 21, 2026", text: "“Lovely soft fabric and a flattering cut. I sized up for a little more room in the bra and it’s perfect.”" },
  ];
  const parseDate = (s) => new Date(s).getTime() || 0;

  function initProduct() {
    const params = new URLSearchParams(location.search);
    const id = PRODUCTS[params.get("id")] ? params.get("id") : "tank";
    const p = PRODUCTS[id];
    let color = p.variants[params.get("color")] ? params.get("color") : "blue";
    let size = id === "headband" ? "One Size" : "Large", qty = 1;

    document.title = `${p.name} — AÉRA`;
    $("#crumb-current").textContent = p.name;
    $("#pdp-name").textContent = p.name;
    $("#pdp-rating").innerHTML = `${starsImg(p.rating, "large")}<span>${ratingText(p.rating)}</span>`;
    $("#pdp-price").textContent = money(p.price);
    $("#pdp-desc").textContent = p.desc;

    // Gallery
    const thumbs = $("#thumbs"), main = $("#main-img");
    function gallery() {
      const v = p.variants[color];
      const g = v.gallery || [{ src: v.img, fit: v.fit }];
      thumbs.innerHTML = g.map((it, i) => `<button class="thumb${it.w > 140 ? " wide" : ""}" aria-pressed="${i === 0}" data-src="${it.src}" aria-label="View image ${i + 1}">
        <img src="${A(it.src)}" alt="" ${it.w ? `style="width:${(it.w / 152) * 100}%;height:auto;aspect-ratio:${it.w}/${it.h}"` : ""}></button>`).join("");
      thumbs.hidden = g.length < 2;
      setMain(g[0].src);
      $$(".thumb", thumbs).forEach((t) => t.addEventListener("click", () => {
        $$(".thumb", thumbs).forEach((x) => x.setAttribute("aria-pressed", x === t));
        setMain(t.dataset.src);
      }));
    }
    function setMain(src) {
      const img = $("img", main);
      img.style.opacity = 0;
      setTimeout(() => { img.src = A(src); img.alt = `${p.name} in ${COLORS[color]}`; img.style.opacity = 1; }, 120);
      main.classList.remove("is-zoom");
    }
    main.addEventListener("click", (e) => {
      const r = main.getBoundingClientRect();
      $("img", main).style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      main.classList.toggle("is-zoom");
    });

    // Colour + size
    const sw = $("#pdp-colors");
    sw.innerHTML = Object.keys(p.variants).map((c) => `<button class="swatch" data-color="${c}" aria-pressed="${c === color}" aria-label="${COLORS[c]}"></button>`).join("");
    const colorName = $("#pdp-color-name");
    $$(".swatch", sw).forEach((b) => b.addEventListener("click", () => {
      color = b.dataset.color;
      $$(".swatch", sw).forEach((x) => x.setAttribute("aria-pressed", x === b));
      colorName.textContent = COLORS[color];
      history.replaceState(null, "", url(id, color));
      gallery();
    }));
    colorName.textContent = COLORS[color];
    const sizes = id === "headband" ? ["One Size"] : SIZES;
    $("#pdp-sizes").innerHTML = sizes.map((s) => `<button class="pill" aria-pressed="${s === size}">${s}</button>`).join("");
    $$("#pdp-sizes .pill").forEach((b) => b.addEventListener("click", () => {
      size = b.textContent; $$("#pdp-sizes .pill").forEach((x) => x.setAttribute("aria-pressed", x === b));
    }));

    // Quantity + add to cart
    const out = $("#qty");
    $("#qty-minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); out.textContent = qty; });
    $("#qty-plus").addEventListener("click", () => { qty = Math.min(99, qty + 1); out.textContent = qty; });
    $("#add-to-cart").addEventListener("click", (e) => {
      cart.add({ id, color, size, qty });
      const b = e.currentTarget; b.textContent = "Added ✓";
      setTimeout(() => (b.textContent = "Add to Cart"), 1400);
      toast(`${esc(p.name)} (${COLORS[color]}, ${esc(size)}) × ${qty} added. <a href="cart.html">View cart</a>`);
    });

    // Tabs
    const tabs = $$(".tab");
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-selected", x === t));
      $$(".tab-panel").forEach((pn) => (pn.hidden = pn.id !== t.getAttribute("aria-controls")));
    }));
    $("#tab-details-body").innerHTML = `
      <h3>About this piece</h3><p>${esc(p.desc)}</p>
      <h3>Fabric &amp; features</h3>
      <table class="spec-table"><tr><td>Composition</td><td>${esc(p.fabric)}</td></tr>
        <tr><td>Key properties</td><td>${p.features.map(esc).join(" · ")}</td></tr>
        <tr><td>Certifications</td><td>OEKO-TEX® STANDARD 100 or equivalent · PFAS-free</td></tr>
        <tr><td>Care</td><td>Cold gentle wash, hang to dry, do not tumble dry or iron the print</td></tr></table>
      <h3>Sizing</h3><p>True to size with a sculpting fit. Between sizes? Size up for a relaxed feel.</p>`;

    // Reviews (only the tank has reviews in the design; others reuse them)
    let reviews = TANK_REVIEWS.slice();
    let shown = 4, sort = "latest", minStars = 0;
    const grid = $("#rv-grid"), more = $("#rv-more");
    function renderReviews() {
      let list = reviews.filter((r) => (minStars === 0 ? true : minStars === 3 ? r.stars <= 3 : r.stars === minStars));
      list.sort((a, b) => sort === "latest" ? parseDate(b.date) - parseDate(a.date) : sort === "oldest" ? parseDate(a.date) - parseDate(b.date)
        : sort === "highest" ? b.stars - a.stars : a.stars - b.stars);
      // Keep the Figma order on first load
      if (sort === "design") list = reviews.slice();
      grid.innerHTML = list.slice(0, shown).map((r) => reviewCard(r, { menu: true })).join("") || `<p class="review-text">No reviews match that filter.</p>`;
      $("#rv-count").textContent = `(${reviews.length})`;
      more.hidden = shown >= list.length;
    }
    sort = "design";
    $("#rv-sort").addEventListener("change", (e) => { sort = e.target.value; renderReviews(); });
    $("#rv-more-btn").addEventListener("click", () => { shown += 2; renderReviews(); });
    const fMenu = $(".rv-filter-menu");
    $("#rv-filter").addEventListener("click", (e) => { e.stopPropagation(); fMenu.classList.toggle("is-open"); });
    $$("button", fMenu).forEach((b) => b.addEventListener("click", () => {
      minStars = +b.dataset.stars; $$("button", fMenu).forEach((x) => x.setAttribute("aria-pressed", x === b)); fMenu.classList.remove("is-open"); renderReviews();
    }));
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".rv-filter-menu")) fMenu.classList.remove("is-open");
      const moreBtn = e.target.closest(".review-more > button");
      $$(".review-menu.is-open").forEach((m) => { if (!moreBtn || m !== moreBtn.nextElementSibling) m.classList.remove("is-open"); });
      if (moreBtn) moreBtn.nextElementSibling.classList.toggle("is-open");
      const act = e.target.closest(".review-menu [data-act]");
      if (act) { act.closest(".review-menu").classList.remove("is-open"); toast(act.dataset.act === "helpful" ? "Thanks — marked as helpful" : "Thanks — our team will take a look"); }
    });
    $("#write-review").addEventListener("click", () => {
      modal(`<h3>Write a review</h3><p class="lede">${esc(p.name)} · ${COLORS[color]}</p>
        <form class="form" novalidate>
          <div class="field">Your rating<div class="star-input" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div></div>
          <label class="field">Name<input name="name" required></label>
          <label class="field">Your review<textarea name="text" required placeholder="How does it fit, feel and wear?"></textarea></label>
          <p class="form-note" aria-live="polite"></p>
          <button class="btn btn-dark" type="submit">Post Review</button>
        </form>`, (m, close) => {
        let stars = 0;
        const btns = $$(".star-input button", m);
        const paint = (n) => btns.forEach((b) => b.classList.toggle("on", +b.dataset.n <= n));
        btns.forEach((b) => { b.addEventListener("click", () => { stars = +b.dataset.n; paint(stars); }); b.addEventListener("mouseenter", () => paint(+b.dataset.n)); });
        $(".star-input", m).addEventListener("mouseleave", () => paint(stars));
        $("form", m).addEventListener("submit", (e) => {
          e.preventDefault();
          const note = $(".form-note", m), name = e.target.name.value.trim(), text = e.target.text.value.trim();
          if (!stars) { note.textContent = "Tap a star to rate it."; note.className = "form-note err"; return; }
          if (!name || text.length < 10) { note.textContent = "Add your name and a few words about it."; note.className = "form-note err"; return; }
          const d = new Date();
          reviews.unshift({ name: name.length > 18 ? name.slice(0, 18) : name, stars, text: `“${text}”`, date: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) });
          sort = "design"; $("#rv-sort").value = "latest"; shown = Math.max(shown, 4);
          renderReviews(); close(); toast("Thanks — your review is live");
        });
      });
    });

    // You might also like
    const recs = [["tank", "brown"], ["longsleeve", "blue"], ["leggings", "blue"], ["headband", "blue"]].filter(([i, c]) => !(i === id && c === color));
    if (recs.length > 4) recs.length = 4;
    if (recs.length < 4) recs.push(["leggings", "brown"]);
    $("#recs").innerHTML = recs.map(([i, c]) => productCard(i, c)).join("");

    gallery();
    renderReviews();
  }

  /* ============================================================
     CART
     ============================================================ */
  const PROMOS = { AERA10: 0.1, WELCOME15: 0.15 };   // PLACEHOLDER codes for the prototype
  function renderCart() {
    const list = $("#cart-list");
    if (!list) return;
    const items = cart.items();
    if (!items.length) {
      list.innerHTML = `<div class="cart-empty"><p>Your cart is empty.</p><a class="btn btn-dark" href="shop.html">Shop All</a></div>`;
    } else {
      list.innerHTML = items.map((it, i) => {
        const p = PRODUCTS[it.id], v = p.variants[it.color];
        return `<div class="cart-line" data-i="${i}">
          <a class="cart-thumb" href="${url(it.id, it.color)}"><img src="${A(v.img)}" alt="" ${fitStyle(v.fit, { t: 0 })}></a>
          <div class="cart-line-main">
            <div class="cart-line-info">
              <div><h3>${esc(p.name)}</h3><p>Size: <em>${esc(it.size)}</em></p><p>Colour: <em>${COLORS[it.color]}</em></p></div>
              <p class="price">${money(p.price * it.qty)}</p>
            </div>
            <div class="cart-line-actions">
              <button class="trash" data-remove aria-label="Remove ${esc(p.name)}"><img src="${A("icon-trash.svg")}" width="24" height="24" alt=""></button>
              <div class="qty-sm">
                <button data-dec aria-label="Decrease quantity"><img src="${A("icon-minus-sm.svg")}" width="20" height="20" alt=""></button>
                <output>${it.qty}</output>
                <button data-inc aria-label="Increase quantity"><img src="${A("icon-plus-sm.svg")}" width="20" height="20" alt=""></button>
              </div>
            </div>
          </div>
        </div>`;
      }).join("");
    }
    const subtotal = items.reduce((s, it) => s + PRODUCTS[it.id].price * it.qty, 0);
    const code = store.get("promo", "");
    const discount = PROMOS[code] ? subtotal * PROMOS[code] : 0;
    const member = !!store.get("member", null);
    $("#sum-subtotal").textContent = money(subtotal);
    $("#sum-discount-row").hidden = !discount;
    $("#sum-discount-label").textContent = `Promo (${code})`;
    $("#sum-discount").textContent = "-" + money(discount);
    $("#sum-delivery-label").textContent = member || true ? "Delivery Fee (New Member Discount)" : "Delivery Fee";
    $("#sum-delivery").textContent = "$0";
    $("#sum-total").textContent = money(subtotal - discount);
    $("#checkout").toggleAttribute("disabled", !items.length);
    $("#checkout").style.opacity = items.length ? 1 : .5;
  }
  function initCart() {
    const list = $("#cart-list");
    list.addEventListener("click", (e) => {
      const line = e.target.closest(".cart-line");
      if (!line) return;
      const i = +line.dataset.i, items = cart.items();
      if (e.target.closest("[data-inc]")) { items[i].qty = Math.min(99, items[i].qty + 1); cart.save(items); renderCart(); }
      else if (e.target.closest("[data-dec]")) {
        if (items[i].qty > 1) { items[i].qty--; cart.save(items); renderCart(); }
        else removeLine(line, i);
      } else if (e.target.closest("[data-remove]")) removeLine(line, i);
    });
    function removeLine(line, i) {
      const items = cart.items(), [gone] = items.splice(i, 1);
      line.classList.add("is-leaving");
      setTimeout(() => { cart.save(items); renderCart(); }, 230);
      toast(`${esc(PRODUCTS[gone.id].name)} removed. <a href="#" data-undo>Undo</a>`);
      const t = $(".toast");
      $("[data-undo]", t).addEventListener("click", (e) => { e.preventDefault(); const now = cart.items(); now.splice(i, 0, gone); cart.save(now); renderCart(); t.classList.remove("is-on"); }, { once: true });
    }

    // Mini recs with quick add
    const mini = [["headband", "blue", 172.213, 173.964, { a: 146.446 / 116.235, h: 66.82, t: 11.07 }], ["longsleeve", "blue", 180.105, 181.937, { a: 153.443 / 181.699, h: 99.87, t: 0 }]];
    $("#mini-row").innerHTML = mini.map(([id, c, w, h, fit]) => {
      const p = PRODUCTS[id];
      return `<div class="mini-card" style="width:${w}px">
        <a href="${url(id, c)}" class="p-media" style="height:${h}px"><img src="${A(p.variants[c].img)}" alt="${esc(p.name)}" ${fitStyle(fit)}></a>
        <h3>${esc(p.name)}</h3><p class="price">${money(p.price)}</p>
        <button class="mini-add" data-id="${id}" data-color="${c}" aria-label="Add ${esc(p.name)} to cart"><img src="${A("icon-add-white.svg")}" width="18.419" height="18.419" alt=""></button>
      </div>`;
    }).join("");
    $$(".mini-add").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id;
      cart.add({ id, color: b.dataset.color, size: id === "headband" ? "One Size" : "Medium", qty: 1 });
      renderCart(); toast(`${esc(PRODUCTS[id].name)} added`);
    }));
    $(".mini-recs-head").addEventListener("click", (e) => {
      const box = e.currentTarget.closest(".mini-recs"); box.classList.toggle("is-collapsed");
      e.currentTarget.setAttribute("aria-expanded", !box.classList.contains("is-collapsed"));
    });

    // Promo
    const promoForm = $("#promo"), note = $("#promo-note");
    const saved = store.get("promo", "");
    if (saved) { promoForm.code.value = saved; }
    promoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = promoForm.code.value.trim().toUpperCase();
      if (!code) { store.set("promo", ""); note.textContent = ""; renderCart(); return; }
      if (PROMOS[code]) { store.set("promo", code); note.textContent = `${code} applied — ${PROMOS[code] * 100}% off.`; note.className = "form-note promo-note ok"; }
      else { note.textContent = "That code isn't valid. Try AERA10."; note.className = "form-note promo-note err"; }
      renderCart();
    });
    $("#checkout").addEventListener("click", () => {
      if (!cart.items().length) return;
      modal(`<h3>Almost there</h3><p class="lede">Checkout isn't designed yet, so this is where the prototype ends. Your total is <b>${$("#sum-total").textContent}</b> with free express delivery.</p>
        <div class="form"><button class="btn btn-dark" data-close>Back to cart</button><a class="btn btn-light" href="shop.html">Keep shopping</a></div>`);
    });
    renderCart();
  }

  /* ---------- Every button or link that opens a page lands at the top ----------
     Browsers, and the embedded claude.ai viewer, can carry the previous scroll position
     over to the next page. Mark internal navigations, then pin the new page to the top
     until it has settled (or until the visitor scrolls themselves). */
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) { /* ignore */ }
  const toTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0; document.body.scrollTop = 0;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.defaultPrevented) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    try { sessionStorage.setItem("aera:toTop", "1"); } catch (err) { /* ignore */ }
  });
  document.addEventListener("submit", () => { try { sessionStorage.setItem("aera:toTop", "1"); } catch (err) { /* ignore */ } });
  (function pinTop() {
    let pinned = true;
    const stop = () => { pinned = false; };
    ["wheel", "touchstart", "keydown", "mousedown"].forEach((ev) => addEventListener(ev, stop, { once: true, passive: true }));
    try { sessionStorage.removeItem("aera:toTop"); } catch (err) { /* ignore */ }
    toTop();
    [0, 60, 200, 450, 900, 1500].forEach((ms) => setTimeout(() => { if (pinned) toTop(); }, ms));
    addEventListener("load", () => { if (pinned) { toTop(); try { document.documentElement.scrollIntoView({ block: "start" }); } catch (err) { /* ignore */ } } });
    addEventListener("pageshow", () => { if (pinned) toTop(); });
    setTimeout(stop, 2000);
  })();
  if (typeof store.get("member", null) === "string") store.set("member", true); // drop any email saved by an earlier version

  /* ---------- Boot ---------- */
  renderHeader();
  renderFooter();
  document.addEventListener("click", (e) => { const j = e.target.closest("[data-join]"); if (j) { e.preventDefault(); openJoin(); } });
  updateCount();
  ({ home: initHome, shop: initShop, product: initProduct, cart: initCart }[page] || (() => {}))();
})();
