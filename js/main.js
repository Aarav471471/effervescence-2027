/* ==========================================================================
   Effervescence 2027 — interactions
   No build step, no framework. Lenis (optional) only smooths the wheel.
   ========================================================================== */
(function () {
  const S = window.EffeScene;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const reduced = document.documentElement.classList.contains('rm');
  const finePointer = matchMedia('(pointer: fine)').matches;
  let vw = innerWidth, vh = innerHeight;

  /* ------------------------------------------------------------------
     CONTENT — edit events and places here
     ------------------------------------------------------------------ */
  const EVENTS = [
    { cat: 'music', name: 'Spark', kind: 'Mega Musical Night', desc: 'Bands, beats and a sea of phone-lights on the final night.' },
    { cat: 'music', name: 'Aalap', kind: 'Classical & Fusion', desc: 'Ragas meet riffs in an evening of classical and fusion music.' },
    { cat: 'music', name: 'Battle of Bands', kind: 'Competition', desc: 'Original sets, loud amps, one trophy.' },
    { cat: 'dance', name: 'Mudra', kind: 'Group & Solo Dance', desc: 'Classical grace to street flair — every style takes the stage.' },
    { cat: 'dance', name: 'Step Up', kind: 'Street Battle', desc: 'One-on-one cyphers judged live by the crowd.' },
    { cat: 'drama', name: 'Nukkad', kind: 'Street Play', desc: 'Sharp, loud, open-air theatre with something to say.' },
    { cat: 'drama', name: 'Rangmanch', kind: 'Stage Play', desc: 'Full productions under the proscenium lights.' },
    { cat: 'lit', name: 'Kavyanjali', kind: 'Poetry Slam', desc: 'Hindi, Urdu and English verse, read by lantern light.' },
    { cat: 'lit', name: 'Vaad', kind: 'Debate', desc: 'Parliamentary-style debate on questions that matter.' },
    { cat: 'arts', name: 'Rangoli', kind: 'Floor Art', desc: 'Colour, chalk and patience — judged at dusk.' },
    { cat: 'arts', name: 'Canvas', kind: 'Live Painting', desc: 'Three hours, one prompt, a blank canvas.' }
  ];
  const CAT = {
    music: { mask: 'icon-music-note', label: 'Music', c1: '#a8322d', c2: '#f1c46a', icon: '<path d="M18 36a6 6 0 1 1-3-5.2V10l20-5v24a6 6 0 1 1-3-5.2V13.5l-14 3.5z"/>' },
    dance: { label: 'Dance', c1: '#2c4aa3', c2: '#f1c46a', icon: '<path d="M6 14c12-7 24-7 36 0" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="13" cy="25" r="6"/><circle cx="24" cy="30" r="6"/><circle cx="35" cy="25" r="6"/><path d="M13 13v6M24 12v12M35 13v6" stroke="currentColor" stroke-width="2"/>' },
    drama: { mask: 'icon-theatre-masks', label: 'Dramatics', c1: '#6e1a1d', c2: '#e8b45a', icon: '<path fill-rule="evenodd" d="M8 8h32v12c0 11-7 20-16 20S8 31 8 20zm7 8a3.5 2.5 0 1 0 7 0 3.5 2.5 0 1 0-7 0zm11 0a3.5 2.5 0 1 0 7 0 3.5 2.5 0 1 0-7 0zm-9 12q7 7 14 0q-7 3-14 0z"/>' },
    lit: { mask: 'icon-quill-literature', label: 'Literature', c1: '#2c6e74', c2: '#f1c46a', icon: '<path d="M42 5C27 7 15 19 10 37l4 2c2-5 5-10 9-14l7 2-3-6c5-5 10-10 15-16z"/><path d="M6 43h22" stroke="currentColor" stroke-width="3"/>' },
    arts: { mask: 'icon-palette-fine-arts', label: 'Fine Arts', c1: '#7b3fa0', c2: '#f1c46a', icon: '<path fill-rule="evenodd" d="M24 5C12 5 4 13 4 24s8 19 17 19c4 0 5-4 3-6s0-6 4-6h6c8 0 12-4 12-10C46 11 37 5 24 5zm-11 18a3 3 0 1 0 0 .1zm7-8a3 3 0 1 0 0 .1zm10 0a3 3 0 1 0 0 .1zm7 8a3 3 0 1 0 0 .1z"/>' }
  };
  const SEED_WISHES = [
    'A wish for endless music and memories.',
    'Success for all the performers!',
    'May our band finally play the encore.',
    'Front row at the headliner, please.',
    'One more night like this.',
    'That the rain stays away for three nights.',
    'For every first-year to find their people here.'
  ];

  /* ------------------------------------------------------------------
     1. Build the paper-cut scenes
     ------------------------------------------------------------------ */
  const sceneCache = {};
  $$('[data-scene]').forEach((el) => {
    const k = el.dataset.scene;
    el.innerHTML = sceneCache[k] || (sceneCache[k] = S.planes[k]());
  });
  const inline = {
    pavilion: () => S.svg(S.pavilion(), '', '0 0 600 520', 'xMidYMax meet'),
    blossom: () => S.svg(S.blossom(3, 600, 360, -1), '', '0 0 600 360', 'xMidYMin slice'),
    'blossom-wide': () => S.svg(S.blossom(9, 720, 480, -1), '', '0 0 720 480', 'xMaxYMin meet')
  };
  $$('[data-scene-inline]').forEach((el) => { el.innerHTML = inline[el.dataset.sceneInline](); });
  const clouds = {
    cream: () => S.svg(
      S.cloudBank({ y: 150, minR: 34, maxR: 64, seed: 51, base: 320, fill: 'url(#cloudLav)', rimW: 2.5, jitter: 16, shadow: false }) +
      S.cloudBank({ y: 205, minR: 30, maxR: 58, seed: 52, base: 320, fill: '#f6e7c9', rimW: 3, jitter: 14 }),
      '', '0 0 1600 300', 'xMidYMax slice'),
    'lav-small': () => S.svg(
      S.cloudBank({ y: 120, minR: 26, maxR: 52, seed: 61, w: 600, base: 240, fill: 'url(#cloudCream)', rimW: 2, jitter: 10 }),
      '', '0 0 600 220', 'xMidYMax slice')
  };
  $$('[data-clouds]').forEach((el) => { el.innerHTML = clouds[el.dataset.clouds](); });
  // painted assets (assets/*.webp) — the SVG generators remain as fallbacks for the smaller scenes
  const img = (src, cls = '', lazy = true) => `<img src="assets/${src}" alt="" class="${cls}" ${lazy ? 'loading="lazy"' : ''} decoding="async" />`;
  $$('.hero .lantern').forEach((el, i) => { el.innerHTML = img(i % 3 ? 'lantern-b.webp' : 'lantern-a.webp', '', false); });
  $('.journey__far').innerHTML = img('citadel.webp', 'jf jf--citadel') + img('palace.webp', 'jf jf--palace') + img('citadel.webp', 'jf jf--citadel2');
  $('.journey__near').innerHTML = img('cloudbank.webp', 'jn') + img('cloudbank.webp', 'jn jn--flip') + img('cloudbank.webp', 'jn');
  $('.carpet').innerHTML = img('carpet.webp', '', false);
  $$('.journey__carpet, .finale__carpet').forEach((el) => { el.innerHTML = img('carpet.webp'); });

  /* ------------------------------------------------------------------
     2. Smooth scroll (optional) + anchor links
     ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: .075, wheelMultiplier: .9, smoothWheel: true });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && $(id);
    if (!t) return;
    e.preventDefault();
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
    // #about sits under the hero's sticky stage; land just past the fly-in
    if (lenis) lenis.scrollTo(t, { offset: id === '#top' ? 0 : -10, duration: 1.6 });
    else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ------------------------------------------------------------------
     3. Nav
     ------------------------------------------------------------------ */
  const nav = $('#nav'), burger = $('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------
     4. Reveal-on-scroll + counters + curtains + map unroll
     ------------------------------------------------------------------ */
  $$('.split').forEach((el) => {
    let i = 0;
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ');
  });
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
      $$('[data-count]', en.target).forEach(countUp);
    });
  }, { threshold: .18 });
  $$('.reveal, .split').forEach((el) => revealIO.observe(el));
  function countUp(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    (function step(t) {
      const k = easeOut(clamp((t - t0) / 1400));
      el.textContent = Math.round(end * k) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ------------------------------------------------------------------
     5. Events
     ------------------------------------------------------------------ */
  const cardsEl = $('#cards');
  function renderCards(cat) {
    const list = EVENTS.filter((e) => cat === 'all' || e.cat === cat);
    cardsEl.innerHTML = list.map((e, i) => {
      const c = CAT[e.cat];
      return `<article class="card" style="--i:${i};--c1:${c.c1};--c2:${c.c2}">
        <div class="card__canopy" aria-hidden="true"></div>
        <div class="card__body">
          ${c.mask ? `<span class="card__icon card__icon--mask" style="--m:url(../assets/icons/${c.mask}.svg)" aria-hidden="true"></span>` : `<svg class="card__icon" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">${c.icon}</svg>`}
          <h3 class="card__name">${e.name}</h3>
          <p class="card__kind">${e.kind}</p>
          <p class="card__desc">${e.desc}</p>
          <a href="#register" class="btn btn--sm">Event details</a>
        </div>
        <div class="card__glow" aria-hidden="true"></div>
      </article>`;
    }).join('');
    $$('a[href="#register"]', cardsEl).forEach((a) => a.addEventListener('click', (ev) => {
      ev.preventDefault(); lenis ? lenis.scrollTo('#register', { duration: 1.6 }) : $('#register').scrollIntoView({ behavior: 'smooth' });
    }));
  }
  renderCards('all');
  const tabs = $$('.tabs [role="tab"]');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const nxt = tabs[(i + d + tabs.length) % tabs.length];
      nxt.focus(); select(nxt);
    });
  });
  function select(tab) {
    tabs.forEach((t) => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    renderCards(tab.dataset.cat);
  }
  if (finePointer && !reduced) {
    cardsEl.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.card'); if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - .5) * 14}deg) rotateX(${(.5 - py) * 12}deg) translateY(-6px)`;
      card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%');
    });
    cardsEl.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.card');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  }

  /* ------------------------------------------------------------------
     6. Campus map — the map app lives in map/ and loads in an iframe
        as its scroll unrolls. A cover stops it from trapping page scroll
        until the visitor chooses to explore.
     ------------------------------------------------------------------ */
  (function campusMap() {
    const box = $('#scrollmap'), paper = $('.scrollmap__paper'), frame = $('#mapFrame');
    const cover = $('#mapCover'), lock = $('#mapLock');
    const setH = () => box.style.setProperty('--h', paper.offsetHeight + 'px');
    setH(); addEventListener('resize', setH);

    let loaded = false, ready = false, pending = null;
    const load = () => { if (loaded) return; loaded = true; frame.src = frame.dataset.src; };
    const send = (id) => frame.contentWindow.postMessage({ type: 'effe:place', id }, location.origin);
    frame.addEventListener('load', () => {
      // let the map finish inking itself before the carpet sets off
      setTimeout(() => { ready = true; if (pending) { send(pending); pending = null; } }, 1400);
    });
    const near = new IntersectionObserver((en) => {
      if (en.some((e) => e.isIntersecting)) { load(); near.disconnect(); }
    }, { rootMargin: '80% 0px' });
    near.observe(box);

    const unlock = () => { box.classList.add('is-live'); cover.hidden = true; lock.hidden = false; };
    const relock = () => { box.classList.remove('is-live'); cover.hidden = false; lock.hidden = true; };
    cover.addEventListener('click', () => { load(); unlock(); frame.focus(); });
    lock.addEventListener('click', () => { relock(); cover.focus(); });
    new IntersectionObserver((en) => en.forEach((e) => { if (!e.isIntersecting) relock(); })).observe(box);

    $$('#jumps [data-place]').forEach((btn) => btn.addEventListener('click', () => {
      $$('#jumps [data-place]').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
      load(); unlock();
      if (ready) send(btn.dataset.place); else pending = btn.dataset.place;
      const r = box.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) {
        if (lenis) lenis.scrollTo(box, { offset: -90, duration: 1.2 });
        else box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
    }));
  })();

  /* ------------------------------------------------------------------
     7. Wishes — paper lanterns released into the sky
     ------------------------------------------------------------------ */
  const WISH_KEY = 'effe-wishes';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } },
    set(v) { try { localStorage.setItem(WISH_KEY, JSON.stringify(v.slice(-40))); } catch { /* storage unavailable */ } }
  };
  const wishSec = $('#wish'), lanternBox = $('#wishLanterns'), reader = $('#wishReader');
  let readerTimer;
  function slot(i) {
    const rr = S.rng(1000 + i * 17);
    return { x: 4 + rr() * 92, y: 9 + rr() * 34, w: 16 + rr() * 16, t: 5 + rr() * 4, dl: -rr() * 6 };
  }
  function addLantern(text, i, rising = false) {
    const p = slot(i);
    const b = document.createElement('button');
    b.className = 'sky-lantern';
    b.type = 'button';
    b.setAttribute('aria-label', 'Read wish: ' + text);
    b.style.cssText = `--x:${p.x}%;--y:${p.y}%;--w:${p.w}px;--t:${p.t}s;--dl:${p.dl}s`;
    b.addEventListener('click', () => {
      reader.textContent = '“' + text + '”';
      reader.classList.add('show');
      clearTimeout(readerTimer); readerTimer = setTimeout(() => reader.classList.remove('show'), 4200);
    });
    if (rising && !reduced) {
      const sec = wishSec.getBoundingClientRect(), form = $('#wishForm').getBoundingClientRect();
      const sx = ((form.left + form.width / 2 - sec.left) / sec.width) * 100;
      const sy = ((form.top - sec.top) / sec.height) * 100;
      b.style.setProperty('--x', sx + '%'); b.style.setProperty('--y', sy + '%');
      b.style.setProperty('--dx', ((p.x - sx) / 100) * sec.width + 'px');
      b.style.setProperty('--dy', ((p.y - sy) / 100) * sec.height + 'px');
      b.classList.add('is-rising');
      b.addEventListener('animationend', () => {
        b.classList.remove('is-rising');
        b.style.setProperty('--x', p.x + '%'); b.style.setProperty('--y', p.y + '%');
      }, { once: true });
    }
    lanternBox.appendChild(b);
  }
  const allWishes = () => SEED_WISHES.concat(store.get());
  allWishes().forEach((w, i) => addLantern(w, i));
  const wishText = $('#wishText'), wishCount = $('#wishCount');
  wishText.addEventListener('input', () => { wishCount.textContent = `${wishText.value.length} / 150`; });
  $('#wishForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = wishText.value.trim();
    if (!text) return;
    const mine = store.get(); mine.push(text); store.set(mine);
    addLantern(text, allWishes().length - 1, true);
    wishText.value = ''; wishCount.textContent = '0 / 150';
    reader.textContent = 'Your lantern is on its way ✦';
    reader.classList.add('show');
    clearTimeout(readerTimer); readerTimer = setTimeout(() => reader.classList.remove('show'), 3000);
  });

  // notify form — wire to your mailing list / backend here
  $('#notifyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#notifyMsg').textContent = 'You’re on the list. Watch the sky for the date reveal ✦';
    e.target.reset();
  });

  /* ------------------------------------------------------------------
     8. Canvases: hero sky (stars, shooting stars, fireworks), dust, wish sky
     ------------------------------------------------------------------ */
  function fitCanvas(c) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }
  const sky = { el: $('.plane--sky') };
  const dust = { el: $('.plane--dust') };
  const wishSky = { el: $('.wish__sky') };
  function initCanvases() {
    Object.assign(sky, fitCanvas(sky.el));
    const rr = S.rng(5);
    sky.stars = Array.from({ length: Math.round((sky.w * sky.h) / 4200) }, () => ({
      x: rr() * sky.w, y: rr() * sky.h * .75, r: rr() * 1.4 + .3, p: rr() * 6.28, s: .5 + rr() * 1.5, gold: rr() > .85
    }));
    sky.bursts = sky.bursts || []; sky.shoot = null;
    Object.assign(dust, fitCanvas(dust.el));
    dust.motes = Array.from({ length: vw < 700 ? 26 : 60 }, () => ({ x: Math.random() * dust.w, y: Math.random() * dust.h, r: Math.random() * 2 + .6, v: Math.random() * .3 + .1, p: Math.random() * 6.28 }));
    Object.assign(wishSky, fitCanvas(wishSky.el));
    const r2 = S.rng(9);
    wishSky.stars = Array.from({ length: Math.round((wishSky.w * wishSky.h) / 5000) }, () => ({ x: r2() * wishSky.w, y: r2() * wishSky.h, r: r2() * 1.3 + .3, p: r2() * 6.28 }));
  }
  initCanvases();
  const FW_COLORS = ['#ffd98c', '#ff9a6b', '#f4a3c8', '#c9bdf2', '#fff3c4'];
  function drawSky(t) {
    const { ctx, w, h } = sky;
    ctx.clearRect(0, 0, w, h);
    for (const s of sky.stars) {
      const a = .45 + .55 * Math.sin(t * .001 * s.s + s.p);
      ctx.globalAlpha = a; ctx.fillStyle = s.gold ? '#ffe2a0' : '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      if (s.r > 1.45) { ctx.globalAlpha = a * .5; ctx.fillRect(s.x - s.r * 3, s.y - .3, s.r * 6, .6); ctx.fillRect(s.x - .3, s.y - s.r * 3, .6, s.r * 6); }
    }
    ctx.globalAlpha = 1;
    // shooting star
    if (!sky.shoot && Math.random() < .003) sky.shoot = { x: w * (.2 + Math.random() * .6), y: h * Math.random() * .3, l: 0 };
    if (sky.shoot) {
      const s = sky.shoot; s.l += 14;
      const g = ctx.createLinearGradient(s.x, s.y, s.x - 120, s.y - 40);
      g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(s.x + s.l, s.y + s.l * .33); ctx.lineTo(s.x + s.l - 120, s.y + s.l * .33 - 40); ctx.stroke();
      if (s.l > w * .4) sky.shoot = null;
    }
    // fireworks over the palace
    if (Math.random() < .012 && sky.bursts.length < 3) {
      const col = FW_COLORS[(Math.random() * FW_COLORS.length) | 0];
      const bx = w * (.3 + Math.random() * .4), by = h * (.12 + Math.random() * .22);
      const n = 38;
      sky.bursts.push({ col, parts: Array.from({ length: n }, (_, i) => { const a = (i / n) * 6.283; const sp = 1.6 + Math.random() * 1.6; return { x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 }; }) });
    }
    sky.bursts = sky.bursts.filter((b) => {
      let alive = false;
      ctx.fillStyle = b.col;
      for (const p of b.parts) {
        p.x += p.vx; p.y += p.vy; p.vy += .025; p.vx *= .985; p.vy *= .985; p.life -= .012;
        if (p.life > 0) { alive = true; ctx.globalAlpha = p.life; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      return alive;
    });
  }
  function drawDust(t) {
    const { ctx, w, h } = dust;
    ctx.clearRect(0, 0, w, h);
    for (const m of dust.motes) {
      m.y -= m.v; m.x += Math.sin(t * .0006 + m.p) * .25;
      if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
      const a = .35 + .35 * Math.sin(t * .002 + m.p);
      ctx.fillStyle = `rgba(255,214,140,${a})`;
      ctx.shadowColor = 'rgba(255,200,110,.9)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  function drawWishSky(t) {
    const { ctx, w, h } = wishSky;
    ctx.clearRect(0, 0, w, h);
    for (const s of wishSky.stars) {
      ctx.globalAlpha = .4 + .5 * Math.sin(t * .0012 + s.p);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------
     9. The frame loop: hero diorama, generic [data-speed] parallax, journey
     ------------------------------------------------------------------ */
  const hero = $('.hero'), planes = $$('.hero .plane[data-depth]'), plaque = $('#plaque'), cue = $('.scroll-cue');
  const heroCarpet = $('.hero .carpet');
  const speedEls = $$('[data-speed]');
  const jFar = $('.journey__far'), jNear = $('.journey__near');
  const journey = $('#journey'), track = $('.journey__track'), jCarpet = $('.journey__carpet'), trail = $('#flightTrail'), jBar = $('.journey__progress i');
  const flight = $('#flightPath');
  const flightLen = flight.getTotalLength();
  trail.style.strokeDasharray = flightLen; trail.style.strokeDashoffset = flightLen;
  // pre-sample the flight path: x → (length, point)
  const samples = [];
  for (let i = 0; i <= 400; i++) { const l = (flightLen * i) / 400; const pt = flight.getPointAtLength(l); samples.push({ l, x: pt.x, y: pt.y }); }
  function sampleAtX(x) {
    let lo = 0, hi = samples.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (samples[mid].x < x) lo = mid; else hi = mid; }
    return samples[lo];
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer && !reduced) {
    addEventListener('pointermove', (e) => { mouse.tx = e.clientX / vw - .5; mouse.ty = e.clientY / vh - .5; }, { passive: true });
  }
  const aboutSec = $('#about'), pieces = $$('#about .pc');
  // About pieces fade and rise into place as each one scrolls into view (CSS transition), then drift with scroll
  const pieceIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); pieceIO.unobserve(en.target);
  }), { rootMargin: '0px 0px -10% 0px', threshold: .12 });
  pieces.forEach((el) => {
    const [fx, fy] = (el.dataset.from || '0,0').split(',').map(Number);
    el.style.setProperty('--fx', fx + 'vw'); el.style.setProperty('--fy', fy + 'vh');
    if (reduced) el.classList.add('in'); else pieceIO.observe(el);
  });
  const visible = new Set();
  const visIO = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target))), { rootMargin: '20% 0px' });
  [hero, journey, wishSec, aboutSec].forEach((el) => visIO.observe(el));
  const speedParents = new Map(speedEls.map((el) => [el, el.parentElement]));
  speedEls.forEach((el) => visIO.observe(el.parentElement));

  /* Load-in: the scene assembles one piece at a time, like the reference.
     [selector, start ms, duration ms, motion]. Scrolling or a key press fast-forwards it. */
  const INTRO = [
    ['.plane--sky', 0, 800, 'fade'],
    ['.lyr--stars', 250, 1200, 'fade'],
    ['.lyr--cloud-mid', 750, 1400, 'rise'],
    ['.lyr--cloud-front', 1000, 1400, 'rise'],
    ['.lyr--palms-l', 2000, 1300, 'left'],
    ['.lyr--palms-r', 2000, 1300, 'right'],
    ['.lyr--arch', 3000, 1200, 'drop'],
    ['.lyr--palace', 3600, 1500, 'grow'],
    ['#plaque', 4800, 1200, 'plaque'],
    ['.hero .carpet', 5700, 1800, 'carpet'],
    ['.lyr--wisp-l', 6700, 1200, 'left'],
    ['.lyr--wisp-r', 6800, 1200, 'right'],
    ['.lyr--citadel', 7200, 1100, 'fadeL'],
    ['.lyr--moon', 7700, 1200, 'moon'],
    ['.hero .lantern', 8300, 1000, 'drop'],
    ['.plane--dust', 8400, 1400, 'fade'],
    ['.scroll-cue', 9000, 900, 'fade']
  ];
  const introEls = [];
  INTRO.forEach(([sel, start, dur, kind]) => $$(sel).forEach((el, i) => {
    introEls.push({ el, start: start + i * 140, dur, kind, op: parseFloat(getComputedStyle(el).opacity) || 1 });
  }));
  const INTRO_END = Math.max(...introEls.map((o) => o.start + o.dur));
  const introK = {}; // eased progress per special element, read by the hero loop
  let introT = reduced ? INTRO_END : 0, introSpeed = 1, introOn = false, introDone = reduced, lastFrameT = 0;
  const hurry = () => { if (introT < INTRO_END) introSpeed = 7; };
  ['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, hurry, { passive: true }));
  Promise.race([
    Promise.all($$('.hero img').map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()))),
    new Promise((r) => setTimeout(r, 2500))
  ]).then(() => { introOn = true; });
  function applyIntro() {
    introEls.forEach((o) => {
      const k = easeOut(clamp((introT - o.start) / o.dur));
      const u = 1 - k, st = o.el.style;
      switch (o.kind) {
        case 'plaque': introK.plaque = k; return;
        case 'carpet': introK.carpet = k; return;
        case 'rise': st.translate = `0 ${(u * 38).toFixed(2)}vh`; break;
        case 'left': st.translate = `${(-u * 42).toFixed(2)}vw 0`; break;
        case 'right': st.translate = `${(u * 42).toFixed(2)}vw 0`; break;
        case 'drop': st.translate = `0 ${(-u * 48).toFixed(2)}vh`; break;
        case 'grow': st.translate = `0 ${(u * 7).toFixed(2)}vh`; st.scale = (.84 + .16 * k).toFixed(4); break;
        case 'moon': st.scale = (.45 + .55 * k).toFixed(4); break;
        case 'fadeL': st.translate = `${(-u * 7).toFixed(2)}vw 0`; break;
      }
      st.opacity = (Math.min(1, k * 1.3) * o.op).toFixed(3);
    });
  }
  let lastY = -1, first = true;

  function frame(t) {
    if (lenis) lenis.raf(t);
    mouse.x = lerp(mouse.x, mouse.tx, .06); mouse.y = lerp(mouse.y, mouse.ty, .06);
    const y = scrollY;

    // nav state
    if (y !== lastY) {
      nav.classList.toggle('is-scrolled', $('#about').getBoundingClientRect().top < 80);
      lastY = y;
    }

    // --- intro clock ---
    const dt = lastFrameT ? Math.min(64, t - lastFrameT) : 16; lastFrameT = t;
    if (!introDone && introOn) {
      introT += dt * introSpeed;
      applyIntro();
      if (introT >= INTRO_END) { introDone = true; introT = INTRO_END; applyIntro(); }
    } else if (!introOn && !reduced) applyIntro();

    // --- hero: scrolls with the page; far layers lag, near layers race ahead ---
    if (visible.has(hero)) {
      const hy = reduced ? 0 : clamp(-hero.getBoundingClientRect().top, 0, vh);
      planes.forEach((el) => {
        const d = +el.dataset.depth;
        const tx = -mouse.x * d * 40;
        const ty = hy * (.46 - d * .76) - mouse.y * d * 22;
        el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
      });
      const pk = reduced ? 1 : (introK.plaque || 0);
      plaque.style.transform = `translate(-50%,-50%) translate3d(${(-mouse.x * 12).toFixed(2)}px,${(-mouse.y * 8 + hy * .1 + (1 - pk) * 36).toFixed(2)}px,0) scale(${(.9 + .1 * pk).toFixed(4)})`;
      plaque.style.opacity = pk.toFixed(3);
      // carpet: flies in from the right edge, then hovers beside the palace
      const ck = reduced ? 1 : (introK.carpet || 0);
      const ts = t * .001;
      const bx = vw * (.72 + .025 * Math.sin(ts * .35)) + (1 - ck) * vw * .48;
      const by = vh * (.25 + .018 * Math.sin(ts * .6)) - (1 - ck) * vh * .1 + hy * .2;
      heroCarpet.style.transform = `translate3d(${(bx - mouse.x * 26).toFixed(1)}px,${(by - mouse.y * 14).toFixed(1)}px,0) rotate(${(Math.sin(ts * .9) * 2.5 - (1 - ck) * 8).toFixed(2)}deg)`;
      heroCarpet.style.opacity = Math.min(1, ck * 1.6).toFixed(3);
      drawSky(t); drawDust(t);
    }

    // --- about diorama: pieces drift with scroll and mouse (their entrance is a CSS transition) ---
    if (visible.has(aboutSec) && !reduced) {
      const r = aboutSec.getBoundingClientRect();
      const off = r.top + Math.min(r.height, vh) / 2 - vh / 2;
      pieces.forEach((el) => {
        const d = +el.dataset.drift;
        el.style.transform = `translate3d(${(-mouse.x * d * 220).toFixed(1)}px,${(off * d - mouse.y * d * 100).toFixed(1)}px,0)`;
      });
    }

    // --- generic parallax ---
    if (!reduced) {
      speedEls.forEach((el) => {
        const parent = speedParents.get(el);
        if (!visible.has(parent)) return;
        const pr = parent.getBoundingClientRect();
        const off = pr.top + pr.height / 2 - vh / 2;
        el.style.transform = `translate3d(0,${(off * +el.dataset.speed).toFixed(2)}px,0)`;
      });
    }

    // --- journey (horizontal) ---
    if (visible.has(journey) && !reduced) {
      const r = journey.getBoundingClientRect();
      const q = clamp(-r.top / (r.height - vh));
      const trackW = track.scrollWidth;
      const shift = q * (trackW - vw);
      track.style.transform = `translate3d(${-shift}px,0,0)`;
      jFar.style.transform = `translate3d(${-shift * .18}px,0,0)`;
      jNear.style.transform = `translate3d(${-shift * .55}px,0,0)`;
      // carpet stays ~38% across the screen, riding the path
      const svgX = ((shift + vw * .38) / trackW) * 4000;
      const s = sampleAtX(svgX);
      const s2 = sampleAtX(svgX + 20);
      const pathTop = vh * .1, pathH = vh * .8;
      const px = (s.x / 4000) * trackW, py = pathTop + (s.y / 600) * pathH;
      const ang = Math.atan2(((s2.y - s.y) / 600) * pathH, ((s2.x - s.x) / 4000) * trackW || 1) * 180 / Math.PI;
      const cw = jCarpet.offsetWidth;
      jCarpet.style.transform = `translate3d(${(px - cw * .5).toFixed(1)}px,${(py - cw * .45 + Math.sin(t * .003) * 4).toFixed(1)}px,0) rotate(${(ang * .6).toFixed(2)}deg)`;
      trail.style.strokeDashoffset = (flightLen - s.l).toFixed(1);
      jBar.style.transform = `scaleX(${q.toFixed(4)})`;
    }

    if (visible.has(wishSec)) drawWishSky(t);
    if (first) { first = false; requestAnimationFrame(() => document.documentElement.classList.remove('is-loading')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { vw = innerWidth; vh = innerHeight; initCanvases(); }, 150);
  });
})();
