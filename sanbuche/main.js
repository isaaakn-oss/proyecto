(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* -----------------------------------------------------------
     El sándwich: cada capa es un trozo de SVG dibujado a mano
     con bordes orgánicos (semilla fija, así siempre sale igual).
     ----------------------------------------------------------- */
  const CX = 200, LINE = "#123b26", SW = 3;
  const f = n => Math.round(n * 10) / 10;

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function curve(pts) {
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += " C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) +
        " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) +
        " " + f(p2[0]) + " " + f(p2[1]);
    }
    return d;
  }
  function edge(x0, x1, y, amp, n, r) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const end = i === 0 || i === n;
      pts.push([x0 + (x1 - x0) * i / n, y + (end ? 0 : (r() * 2 - 1) * amp)]);
    }
    return pts;
  }
  function slabPath(w, h, ampT, ampB, seed, n) {
    const r = rng(seed), x0 = CX - w / 2, x1 = CX + w / 2, rd = Math.min(h / 2, 14);
    const top = edge(x0 + rd, x1 - rd, 0, ampT, n || 10, r);
    const bot = edge(x1 - rd, x0 + rd, h, ampB, n || 10, r);
    return "M" + f(top[0][0]) + " 0" + curve(top) +
      " Q" + f(x1) + " 0 " + f(x1) + " " + f(h / 2) + " Q" + f(x1) + " " + f(h) + " " + f(bot[0][0]) + " " + f(h) +
      curve(bot) + " Q" + f(x0) + " " + f(h) + " " + f(x0) + " " + f(h / 2) + " Q" + f(x0) + " 0 " + f(top[0][0]) + " 0Z";
  }
  const P = (d, fill, extra) => '<path d="' + d + '" fill="' + fill + '" stroke="' + LINE + '" stroke-width="' + SW + '" stroke-linejoin="round" ' + (extra || "") + "/>";
  const dots = (w, h, count, color, seed, size) => {
    const r = rng(seed); let s = "";
    for (let i = 0; i < count; i++) {
      const x = CX - w / 2 + 14 + r() * (w - 28), y = 6 + r() * (h - 12);
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f((size || 2) + r() * 1.6) + '" fill="' + color + '"/>';
    }
    return s;
  };
  function drips(w, h, count, fill, seed, maxLen) {
    const r = rng(seed); let s = "";
    for (let i = 0; i < count; i++) {
      const x = CX - w / 2 + 30 + r() * (w - 60), len = 8 + r() * (maxLen || 16), dw = 6 + r() * 5;
      s += P("M" + f(x - dw) + " " + f(h - 4) + " L" + f(x - dw) + " " + f(h + len - dw) + " A" + f(dw) + " " + f(dw) + " 0 0 0 " + f(x + dw) + " " + f(h + len - dw) + " L" + f(x + dw) + " " + f(h - 4) + "Z", fill);
    }
    return s;
  }
  function crispy(fill, crumb, seed) {
    const w = 318, h = 34;
    return { h: h, ov: 4, svg: P(slabPath(w, h, 4, 4, seed, 14), fill) + dots(w, h, 34, crumb, seed + 1) + dots(w, h, 12, "#f3cf8c", seed + 2, 1.2) };
  }
  function sauce(fill, seed) {
    const w = 296, h = 8;
    return { h: h, ov: 4, svg: drips(w, h, 2, fill, seed, 8) + P(slabPath(w, h, 1.5, 2, seed), fill) };
  }

  const LAYERS = {
    pan: () => ({
      h: 46, ov: 0,
      svg: P("M58 0 H342 Q352 0 352 12 V24 Q352 46 322 46 H78 Q48 46 48 24 V12 Q48 0 58 0Z", "#e3a457") +
        '<path d="M52 4 H348 V13 H52Z" fill="#f6dba6"/>' +
        '<path d="M48 14 H352" stroke="' + LINE + '" stroke-width="2" opacity=".5"/>'
    }),
    panTop: () => ({
      h: 112, ov: 4,
      svg: P("M46 100 C46 34 104 2 200 2 C296 2 354 34 354 100 Q354 112 340 112 H60 Q46 112 46 100Z", "#e7a752") +
        '<path d="M50 98 H350" stroke="#f6dba6" stroke-width="7" stroke-linecap="round"/>' +
        '<ellipse cx="128" cy="38" rx="38" ry="11" transform="rotate(-18 128 38)" fill="#fff4dc" opacity=".55"/>' +
        '<ellipse cx="172" cy="22" rx="8" ry="4" fill="#fff4dc" opacity=".55"/>'
    }),
    pollo: () => crispy("#e6a44e", "#b8742c", 11),
    carne: () => crispy("#c57b36", "#8c4f1f", 23),
    girgola: () => crispy("#d39a58", "#94652f", 37),
    mozzarella: () => ({ h: 15, ov: 3, svg: drips(306, 15, 4, "#fff8e8", 5, 18) + P(slabPath(306, 15, 2, 3, 5), "#fff8e8") }),
    provoleta: () => ({
      h: 18, ov: 3,
      svg: drips(304, 18, 3, "#f5cf72", 9, 14) + P(slabPath(304, 18, 2, 3, 9), "#f5cf72") +
        '<path d="M110 5 l14 9 M160 5 l14 9 M210 5 l14 9 M260 5 l14 9" stroke="#b9852f" stroke-width="3" stroke-linecap="round"/>'
    }),
    tomate: () => {
      let s = "";
      [118, 200, 282].forEach((x, i) => {
        s += '<ellipse cx="' + x + '" cy="8" rx="56" ry="9" fill="#e2552d" stroke="' + LINE + '" stroke-width="' + SW + '"/>' +
          '<ellipse cx="' + x + '" cy="8" rx="42" ry="5" fill="#f27c55"/>' +
          '<path d="M' + (x - 22) + ' 8 h8 M' + (x - 4) + ' 7 h8 M' + (x + 14) + ' 8 h8" stroke="#ffd2b8" stroke-width="2.4" stroke-linecap="round"/>';
        if (i === 0) s = s;
      });
      return { h: 16, ov: 3, svg: s };
    },
    lechuga: () => {
      const r = rng(41), x0 = 30, x1 = 370, top = [], bot = [];
      for (let i = 0; i <= 24; i++) top.push([x0 + (x1 - x0) * i / 24, (i % 2 ? -5 : 4) + (r() * 2 - 1) * 2]);
      for (let i = 24; i >= 0; i--) bot.push([x0 + (x1 - x0) * i / 24, 16 + (i % 2 ? 6 : -1) + r() * 3]);
      const d = "M" + f(top[0][0]) + " " + f(top[0][1]) + curve(top) + " L" + f(bot[0][0]) + " " + f(bot[0][1]) + curve(bot) + "Z";
      return {
        h: 18, ov: 3,
        svg: P(d, "#74b347") + '<path d="M70 9 q30 -6 60 0 M170 10 q30 -6 60 0 M270 9 q30 -6 60 0" fill="none" stroke="#b9e08c" stroke-width="2.5" stroke-linecap="round"/>'
      };
    },
    rucula: () => {
      let s = ""; const r = rng(77);
      for (let i = 0; i < 9; i++) {
        const x = 70 + i * 32 + r() * 8, rot = (r() * 2 - 1) * 25;
        s += '<path transform="rotate(' + f(rot) + " " + f(x) + ' 8)" d="M' + f(x - 26) + " 8 Q" + f(x - 18) + " -4 " + f(x - 8) + " 4 Q" + f(x) + " -6 " + f(x + 8) + " 4 Q" + f(x + 18) + " -4 " + f(x + 26) + " 8 Q" + f(x) + " 20 " + f(x - 26) + ' 8Z" fill="#3f8a3a" stroke="' + LINE + '" stroke-width="2.5" stroke-linejoin="round"/>';
      }
      return { h: 16, ov: 3, svg: s };
    },
    desmenuzada: () => {
      const w = 314, h = 42, r = rng(53);
      let s = P(slabPath(w, h, 7, 6, 53, 18), "#7d3f22");
      for (let i = 0; i < 34; i++) {
        const x = 64 + r() * 270, y = 8 + r() * 26, l = 10 + r() * 18;
        s += '<path d="M' + f(x) + " " + f(y) + " q" + f(l / 2) + " " + f((r() * 2 - 1) * 5) + " " + f(l) + " " + f((r() * 2 - 1) * 3) + '" fill="none" stroke="' + (i % 3 ? "#5a2914" : "#a85e35") + '" stroke-width="2.6" stroke-linecap="round"/>';
      }
      return { h: h, ov: 4, svg: s };
    },
    porchetta: () => {
      const w = 320, h = 32;
      return {
        h: h, ov: 4,
        svg: P(slabPath(w, h, 3, 3, 61), "#dc9a80") +
          '<path d="M52 8 Q200 0 348 8" fill="none" stroke="#f6dccb" stroke-width="6" stroke-linecap="round"/>' +
          '<path d="M110 20 q14 -10 28 0 q14 10 28 0 M210 21 q14 -10 28 0 q14 10 28 0" fill="none" stroke="#b56a52" stroke-width="2.6" stroke-linecap="round"/>'
      };
    },
    cebolla: () => {
      let s = "";
      [[96, 7], [158, 9], [222, 6], [290, 8]].forEach(p => {
        s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="40" ry="8" fill="#ecd3e3" stroke="' + LINE + '" stroke-width="' + SW + '"/>' +
          '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="27" ry="4" fill="none" stroke="#a96a95" stroke-width="2.4"/>';
      });
      return { h: 16, ov: 3, svg: s };
    },
    panceta: () => {
      const strip = (y, seed) => {
        const r = rng(seed), top = [], bot = [];
        for (let i = 0; i <= 8; i++) top.push([56 + i * 36, y + (i % 2 ? -4 : 3) + r() * 2]);
        for (let i = 8; i >= 0; i--) bot.push([56 + i * 36, y + 11 + (i % 2 ? -4 : 3) + r() * 2]);
        return P("M" + top[0][0] + " " + f(top[0][1]) + curve(top) + " L" + bot[0][0] + " " + f(bot[0][1]) + curve(bot) + "Z", "#c9524a") +
          '<path d="M60 ' + (y + 5) + curve(top.map(p => [p[0], p[1] + 5])).replace(/^ /, " ") + '" fill="none" stroke="#f3b8a6" stroke-width="3" stroke-linecap="round"/>';
      };
      return { h: 18, ov: 3, svg: strip(4, 3) };
    },
    morron: () => {
      let s = ""; const r = rng(88);
      for (let i = 0; i < 6; i++) {
        const x = 78 + i * 46 + r() * 6, rot = (r() * 2 - 1) * 8;
        s += '<rect x="' + f(x - 22) + '" y="1" width="44" height="12" rx="6" transform="rotate(' + f(rot) + " " + f(x) + ' 7)" fill="#cf3326" stroke="' + LINE + '" stroke-width="2.6"/>';
      }
      return { h: 14, ov: 3, svg: s };
    },
    pesto: () => sauce("#4f8d37", 14),
    mayo: () => sauce("#fbe7a6", 15),
    mayoAjo: () => sauce("#fff1c9", 16),
    lactonesa: () => sauce("#fff6e2", 17),
    barbacoa: () => sauce("#6e2418", 18),
    mostaza: () => sauce("#e9b234", 19)
  };

  const FACE =
    '<g class="sw-face">' +
    '<g class="sw-eyes">' +
    '<ellipse cx="166" cy="54" rx="15" ry="19" fill="#fffaf0" stroke="' + LINE + '" stroke-width="3"/>' +
    '<ellipse cx="234" cy="54" rx="15" ry="19" fill="#fffaf0" stroke="' + LINE + '" stroke-width="3"/>' +
    '<circle class="sw-pupil" cx="171" cy="50" r="6" fill="' + LINE + '"/>' +
    '<circle class="sw-pupil" cx="239" cy="50" r="6" fill="' + LINE + '"/>' +
    "</g>" +
    '<path d="M180 84 Q200 98 220 84" fill="none" stroke="' + LINE + '" stroke-width="3.2" stroke-linecap="round"/>' +
    "</g>";

  function rays() {
    let s = '<g class="sw-rays">';
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2, r1 = 150 + (i % 2) * 14, r2 = 205 + (i % 3) * 10;
      s += '<line x1="' + f(CX + Math.cos(a) * r1) + '" y1="' + f(250 + Math.sin(a) * r1) + '" x2="' + f(CX + Math.cos(a) * r2) + '" y2="' + f(250 + Math.sin(a) * r2) + '"/>';
    }
    return s + "</g>";
  }

  // Devuelve el SVG del sándwich completo. Las capas quedan en .sw-ly con --i (orden de caída).
  function sandwichSVG(layers, opts) {
    const parts = layers.map(l => (LAYERS[l[0]] || LAYERS.mayo)());
    let H = 0;
    parts.forEach((p, i) => { H += p.h - (i ? p.ov : 0); });
    const bottom = 262 + H / 2;
    let y = bottom, out = "";
    const placed = parts.map((p, i) => {
      y = (i === 0 ? bottom : y + p.ov) - p.h;
      return y;
    });
    const mid = (parts.length - 1) / 2;
    parts.forEach((p, i) => {
      const isTop = i === parts.length - 1;
      out += '<g class="sw-ly" data-k="' + i + '" style="--i:' + i + ";--off:" + f((i - mid) * 13) + '">' +
        '<g class="sw-in"><g transform="translate(0 ' + f(placed[i]) + ')">' + p.svg + (isTop && opts.face ? FACE : "") + "</g></g></g>";
    });
    const topY = placed[placed.length - 1];
    const halo = '<g class="sw-halo" style="--i:' + parts.length + '"><g transform="translate(0 ' + f(topY - 26) + ')"><g class="sw-float">' +
      '<ellipse cx="200" cy="0" rx="74" ry="14" fill="none" stroke="#f0b93f" stroke-width="12" opacity=".28"/>' +
      '<ellipse cx="200" cy="0" rx="74" ry="14" fill="none" stroke="#e8a92c" stroke-width="5"/>' +
      "</g></g></g>";
    return '<svg viewBox="' + (opts.rays ? "0 0 400 500" : "10 60 380 400") + '" role="img" aria-label="' + escHTML(opts.label || "Sándwich") + '" class="sw-svg">' +
      (opts.rays ? rays() : "") +
      '<ellipse class="sw-shadow" cx="200" cy="' + f(bottom + 10) + '" rx="150" ry="12" fill="#123b26" opacity=".14"/>' +
      out + halo + "</svg>";
  }

  function build(stage, key, opts) {
    const santo = (data.santos || {})[key];
    if (!stage || !santo) return;
    stage.innerHTML = sandwichSVG(santo.layers, Object.assign({ label: santo.name + ": " + santo.layers.map(l => l[1]).join(", ") }, opts));
    stage.classList.remove("is-built");
    if (reduced) { stage.classList.add("is-built"); return; }
    void stage.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("is-built")));
  }

  /* -------------------- Inits -------------------- */

  function initHeroSandwich() {
    const stage = $("[data-hero-stage]");
    if (!stage) return;
    build(stage, stage.dataset.santo || "san-phillypo", { face: true, rays: true });
    stage.classList.add("is-live");

    // Al bajar, el sándwich se "abre" capa por capa (vista explotada).
    const hero = $(".hero");
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = hero.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.7)));
      stage.style.setProperty("--spread", p.toFixed(3));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    // Las pupilas siguen al puntero (sólo con mouse).
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      addEventListener("pointermove", e => {
        const svg = $("svg", stage);
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 500));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.3)) / 400));
        stage.style.setProperty("--lx", (dx * 6).toFixed(2) + "px");
        stage.style.setProperty("--ly", (dy * 6).toFixed(2) + "px");
      }, { passive: true });
    }
  }

  function initAltar() {
    const root = $("[data-altar]");
    if (!root) return;
    const stage = $("[data-altar-stage]", root);
    const legend = $("[data-altar-legend]", root);
    const title = $("[data-altar-title]", root);
    const order = $("[data-altar-order]", root);
    const buttons = $$("[data-santo]", root);
    let current = null, busy = 0;

    function legendHTML(santo) {
      return santo.layers.map((l, i) => ({ l: l, i: i })).reverse().map(o =>
        '<li style="--i:' + o.i + '" data-k="' + o.i + '"><span class="altar-n">' + String(o.i + 1).padStart(2, "0") + "</span>" + escHTML(o.l[1]) + "</li>").join("");
    }

    function select(key, instant) {
      if (key === current) return;
      const santo = data.santos[key];
      if (!santo) return;
      current = key;
      buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.santo === key)));
      if (title) title.textContent = santo.name;
      if (order) {
        order.href = "https://wa.me/" + data.whatsapp + "?text=" + encodeURIComponent("¡Hola San Buche! Quiero pedir " + (/^Santa/.test(santo.name) ? "una " : "un ") + santo.name + " con papas 🙏");
        order.textContent = "Pedí tu " + santo.name;
      }
      const go = () => {
        build(stage, key, { face: true });
        legend.innerHTML = legendHTML(santo);
        legend.classList.remove("is-built");
        requestAnimationFrame(() => requestAnimationFrame(() => legend.classList.add("is-built")));
      };
      clearTimeout(busy);
      if (instant || reduced || !stage.querySelector("svg")) go();
      else { stage.classList.add("is-leaving"); busy = setTimeout(() => { stage.classList.remove("is-leaving"); go(); }, 380); }
    }

    buttons.forEach(b => b.addEventListener("click", () => select(b.dataset.santo)));

    // Pasar por una capa de la lista la resalta en el dibujo.
    const focus = k => {
      stage.classList.toggle("has-focus", k != null);
      $$(".sw-ly", stage).forEach(g => g.classList.toggle("is-focus", g.dataset.k === k));
    };
    legend.addEventListener("mouseover", e => { const li = e.target.closest("li"); if (li) focus(li.dataset.k); });
    legend.addEventListener("mouseout", e => { if (!legend.contains(e.relatedTarget)) focus(null); });

    // Se arma por primera vez cuando entra en pantalla.
    const first = (buttons[0] && buttons[0].dataset.santo) || "santa-suprema";
    let started = false;
    const start = () => { if (started) return; started = true; select(first); };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { start(); io.disconnect(); } }, { threshold: 0.05 });
      io.observe(stage);
      setTimeout(() => { if (stage.getBoundingClientRect().top < innerHeight) start(); }, 4000);
    } else start();
  }

  function initOpenStatus() {
    const els = $$("[data-open-status]");
    if (!els.length || !data.hours) return;
    let now;
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      const get = t => (parts.find(p => p.type === t) || {}).value;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      now = { day: day, t: (+get("hour") % 24) + (+get("minute")) / 60 };
    } catch (e) { return; }
    const fmt = h => String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");
    const today = data.hours[now.day] || [];
    const open = today.find(s => now.t >= s[0] && now.t < s[1]);
    let text, isOpen = false;
    if (open) { isOpen = true; text = "Abierto ahora · cierra a las " + fmt(open[1]); }
    else {
      const next = today.find(s => now.t < s[0]);
      if (next) text = "Cerrado ahora · abrimos a las " + fmt(next[0]);
      else {
        let d = (now.day + 1) % 7, n = 1;
        while (!(data.hours[d] || []).length && n < 7) { d = (d + 1) % 7; n++; }
        const names = ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"];
        text = "Cerrado ahora · abrimos " + (n === 1 ? "mañana" : names[d]) + " a las " + fmt(data.hours[d][0][0]);
      }
    }
    els.forEach(el => { el.textContent = text; el.classList.toggle("is-open", isOpen); el.classList.add("is-known"); });
    const row = $('[data-day="' + now.day + '"]');
    if (row) row.classList.add("is-today");
  }

  function initNav() {
    const nav = $(".nav");
    const btn = $(".nav-toggle");
    const menu = $("#menu");
    const onScroll = () => nav && nav.classList.toggle("is-scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (!btn || !menu) return;
    const set = open => {
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  }

  function initReveals() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in"); }), 900);
    setTimeout(() => els.forEach(el => el.classList.add("is-in")), 4000);
  }

  function initFaq() {
    const items = $$(".faq details");
    items.forEach(d => d.addEventListener("toggle", () => {
      if (d.open) items.forEach(o => { if (o !== d) o.open = false; });
    }));
  }

  function initYear() {
    $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initHeroSandwich, "initHeroSandwich");
    safe(initAltar, "initAltar");
    safe(initOpenStatus, "initOpenStatus");
    safe(initReveals, "initReveals");
    safe(initFaq, "initFaq");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
