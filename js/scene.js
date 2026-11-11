/* ==========================================================================
   Effervescence — paper-cut scene generators
   Every painted plane of the hero is generated here as plain SVG so that
   each one can move independently (true parallax, no baked-in images).
   Edit colours in PALETTE; edit shapes by changing the numbers passed in.
   ========================================================================== */
(function () {
  const PALETTE = {
    night: '#101a4a', royal: '#1d2c78', indigo: '#2a3a8f',
    gold: '#e8b45a', goldDeep: '#b67a2c', goldLight: '#ffd98c',
    crimson: '#9c2a2a', crimsonDeep: '#6e1a1d', rose: '#d4475b',
    paper: '#f6e7c9', cream: '#f1d3a2', peach: '#e9b98a',
    lavender: '#a596e0', lilac: '#7f71c8', dusk: '#3a3f93',
    leaf: '#1f3b4d', leafLight: '#2f5a63', trunk: '#3a2a22'
  };

  // Deterministic random so the scene looks identical on every load.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = (n) => Math.round(n * 10) / 10;

  /* ---------- shared defs (gradients, filters, patterns) ---------- */
  const DEFS = `
  <defs>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffdf9a"/><stop offset=".55" stop-color="#f0b45e"/><stop offset="1" stop-color="#c47a35"/>
    </linearGradient>
    <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e3a256"/><stop offset="1" stop-color="#9d5a26"/>
    </linearGradient>
    <linearGradient id="domeG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5d86e0"/><stop offset=".5" stop-color="#2c4aa3"/><stop offset="1" stop-color="#16246a"/>
    </linearGradient>
    <radialGradient id="palGlow" cx=".5" cy=".55" r=".5">
      <stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="winG" cx=".5" cy=".7" r=".7">
      <stop offset="0" stop-color="#fff6cf"/><stop offset=".6" stop-color="#ffc85e"/><stop offset="1" stop-color="#e98a2a"/>
    </radialGradient>
    <linearGradient id="cloudCream" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbe6c2"/><stop offset=".5" stop-color="#efc893"/><stop offset="1" stop-color="#d79f6c"/>
    </linearGradient>
    <linearGradient id="cloudLav" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9bdf2"/><stop offset=".6" stop-color="#9284d6"/><stop offset="1" stop-color="#5c51a8"/>
    </linearGradient>
    <linearGradient id="cloudNavy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a52a8"/><stop offset="1" stop-color="#1e2566"/>
    </linearGradient>
    <linearGradient id="hillG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2d3a86"/><stop offset="1" stop-color="#141c4d"/>
    </linearGradient>
    <filter id="cutShadow" x="-10%" y="-20%" width="120%" height="140%">
      <feDropShadow dx="0" dy="-6" stdDeviation="7" flood-color="#0a0f33" flood-opacity=".45"/>
    </filter>
    <filter id="cutShadowDown" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#0a0f33" flood-opacity=".5"/>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="frameFill" width="56" height="56" patternUnits="userSpaceOnUse">
      <rect width="56" height="56" fill="${PALETTE.crimson}"/>
      <path d="M28 6 C34 18 38 22 50 28 C38 34 34 38 28 50 C22 38 18 34 6 28 C18 22 22 18 28 6Z" fill="none" stroke="${PALETTE.gold}" stroke-width="1.6" opacity=".75"/>
      <circle cx="28" cy="28" r="3.2" fill="${PALETTE.gold}"/>
      <circle cx="0" cy="0" r="2.4" fill="${PALETTE.goldLight}" opacity=".8"/><circle cx="56" cy="0" r="2.4" fill="${PALETTE.goldLight}" opacity=".8"/>
      <circle cx="0" cy="56" r="2.4" fill="${PALETTE.goldLight}" opacity=".8"/><circle cx="56" cy="56" r="2.4" fill="${PALETTE.goldLight}" opacity=".8"/>
    </pattern>
    <pattern id="frameNavy" width="44" height="44" patternUnits="userSpaceOnUse">
      <rect width="44" height="44" fill="#15205a"/>
      <path d="M22 4 L26 18 L40 22 L26 26 L22 40 L18 26 L4 22 L18 18Z" fill="${PALETTE.gold}" opacity=".55"/>
    </pattern>
  </defs>`;

  /* ---------- primitives ---------- */
  // Onion dome sitting on (cx, base), width w, height h.
  function dome(cx, base, w, h) {
    const x0 = cx - w / 2, x1 = cx + w / 2;
    return `M${f(x0)} ${f(base)} C${f(x0 - w * .16)} ${f(base - h * .42)} ${f(cx - w * .08)} ${f(base - h * .72)} ${f(cx)} ${f(base - h)} C${f(cx + w * .08)} ${f(base - h * .72)} ${f(x1 + w * .16)} ${f(base - h * .42)} ${f(x1)} ${f(base)}Z`;
  }
  function domeLines(cx, base, w, h) {
    let s = '';
    for (let i = 1; i < 6; i++) {
      const bx = cx - w / 2 + (w * i) / 6;
      const ctrl = cx + (bx - cx) * 1.5;
      s += `<path d="M${f(bx)} ${f(base)} Q${f(ctrl)} ${f(base - h * .55)} ${f(cx)} ${f(base - h)}" fill="none" stroke="${PALETTE.gold}" stroke-width="1.4" opacity=".55"/>`;
    }
    s += `<path d="M${f(cx - w / 2 - 2)} ${f(base - 3)} H${f(cx + w / 2 + 2)}" stroke="${PALETTE.gold}" stroke-width="5"/>`;
    // finial with crescent
    s += `<path d="M${f(cx)} ${f(base - h)} v-${f(h * .22)}" stroke="${PALETTE.gold}" stroke-width="3"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(base - h - h * .26)}" r="${f(Math.max(4, w * .045))}" fill="${PALETTE.gold}"/>`;
    return s;
  }
  // Pointed (Mughal) arch, top-left corner (x,y)
  function arch(x, y, w, h) {
    return `M${f(x)} ${f(y + h)} V${f(y + w * .55)} Q${f(x)} ${f(y + w * .08)} ${f(x + w / 2)} ${f(y)} Q${f(x + w)} ${f(y + w * .08)} ${f(x + w)} ${f(y + w * .55)} V${f(y + h)}Z`;
  }
  function windowRow(x0, x1, y, w, h, gap, cls = 'lit') {
    let s = '';
    for (let x = x0; x + w <= x1; x += w + gap) {
      s += `<path class="${cls}" d="${arch(x, y, w, h)}" fill="url(#winG)"/>`;
    }
    return s;
  }
  function crenels(x0, x1, y, size, fill) {
    let d = `M${x0} ${y}`;
    for (let x = x0; x < x1; x += size * 2) {
      d += ` L${f(x + size * .2)} ${y} Q${f(x + size * .5)} ${f(y - size * 1.3)} ${f(x + size * .8)} ${y} L${f(x + size * 2)} ${y}`;
    }
    d += ` V${y + 4} H${x0}Z`;
    return `<path d="${d}" fill="${fill}"/>`;
  }
  function minaret(x, base, top, w) {
    let s = '';
    const shaftTop = top + 34;
    s += `<rect x="${f(x - w / 2)}" y="${f(shaftTop)}" width="${w}" height="${f(base - shaftTop)}" fill="url(#wallG)"/>`;
    s += `<rect x="${f(x - w / 2)}" y="${f(shaftTop)}" width="${f(w * .32)}" height="${f(base - shaftTop)}" fill="#000" opacity=".08"/>`;
    const steps = [0.18, 0.45, 0.72];
    steps.forEach((t) => {
      const y = shaftTop + (base - shaftTop) * t;
      s += `<rect x="${f(x - w * .85)}" y="${f(y)}" width="${f(w * 1.7)}" height="7" rx="2" fill="${PALETTE.gold}"/>`;
      s += `<path d="M${f(x - w * .8)} ${f(y + 7)} L${f(x - w * .5)} ${f(y + 16)} H${f(x + w * .5)} L${f(x + w * .8)} ${f(y + 7)}Z" fill="${PALETTE.goldDeep}"/>`;
      s += `<path class="lit" d="${arch(x - w * .22, y - 30, w * .44, 22)}" fill="url(#winG)"/>`;
    });
    s += `<rect x="${f(x - w * .7)}" y="${f(shaftTop - 6)}" width="${f(w * 1.4)}" height="8" fill="${PALETTE.gold}"/>`;
    s += `<path d="${dome(x, shaftTop - 4, w * 1.25, 38)}" fill="url(#domeG)"/>`;
    s += domeLines(x, shaftTop - 4, w * 1.25, 38);
    return s;
  }

  /* ---------- palace ---------- */
  function palace() {
    let s = `<ellipse cx="800" cy="520" rx="470" ry="250" fill="url(#palGlow)"/>`;
    // back minarets
    s += minaret(520, 650, 300, 24) + minaret(1080, 650, 300, 24);
    s += minaret(625, 560, 360, 18) + minaret(975, 560, 360, 18);
    // side wings
    s += `<rect x="455" y="520" width="140" height="130" fill="url(#wallShade)"/>`;
    s += `<rect x="1005" y="520" width="140" height="130" fill="url(#wallShade)"/>`;
    s += windowRow(470, 590, 560, 20, 40, 14) + windowRow(1020, 1140, 560, 20, 40, 14);
    s += `<path d="${dome(525, 522, 74, 62)}" fill="url(#domeG)"/>` + domeLines(525, 522, 74, 62);
    s += `<path d="${dome(1075, 522, 74, 62)}" fill="url(#domeG)"/>` + domeLines(1075, 522, 74, 62);
    // main body
    s += `<rect x="580" y="470" width="440" height="180" fill="url(#wallG)"/>`;
    s += crenels(580, 1020, 470, 10, PALETTE.gold);
    s += `<rect x="580" y="486" width="440" height="6" fill="${PALETTE.goldDeep}" opacity=".7"/>`;
    s += windowRow(598, 730, 505, 22, 46, 14) + windowRow(872, 1004, 505, 22, 46, 14);
    s += windowRow(598, 730, 575, 22, 50, 14) + windowRow(872, 1004, 575, 22, 50, 14);
    // central iwan
    s += `<path d="${arch(722, 470, 156, 180)}" fill="#7a3a17"/>`;
    s += `<path d="${arch(734, 484, 132, 166)}" fill="#3d1a0b"/>`;
    s += `<path class="lit lit--slow" d="${arch(752, 506, 96, 144)}" fill="url(#winG)"/>`;
    s += `<path d="${arch(722, 470, 156, 180)}" fill="none" stroke="${PALETTE.gold}" stroke-width="4"/>`;
    // side domes + drum + great dome
    s += `<path d="${dome(645, 472, 104, 86)}" fill="url(#domeG)"/>` + domeLines(645, 472, 104, 86);
    s += `<path d="${dome(955, 472, 104, 86)}" fill="url(#domeG)"/>` + domeLines(955, 472, 104, 86);
    s += `<rect x="712" y="418" width="176" height="56" fill="url(#wallG)"/>`;
    s += windowRow(724, 880, 430, 14, 30, 12);
    s += `<path d="${dome(800, 420, 232, 186)}" fill="url(#domeG)"/>` + domeLines(800, 420, 232, 186);
    s += `<path d="M720 400 Q770 300 800 236" fill="none" stroke="#9ec0ff" stroke-width="6" opacity=".25" stroke-linecap="round"/>`;
    // front terrace with arcade
    s += `<rect x="410" y="640" width="780" height="90" fill="url(#wallShade)"/>`;
    s += crenels(410, 1190, 640, 9, PALETTE.goldDeep);
    for (let x = 424; x < 1176; x += 38) {
      s += `<path class="${(x / 38) % 3 < 1 ? 'lit lit--slow' : 'lit'}" d="${arch(x, 664, 22, 50)}" fill="url(#winG)" opacity=".9"/>`;
    }
    s += `<rect x="410" y="654" width="780" height="4" fill="${PALETTE.gold}" opacity=".8"/>`;
    return s;
  }

  /* ---------- distant hill citadel ---------- */
  function hills() {
    const r = rng(7);
    let s = `<path d="M-60 900 L-60 560 C40 520 120 470 230 440 C330 420 380 470 470 520 C520 560 560 600 600 900Z" fill="url(#hillG)"/>`;
    s += `<path d="M1150 900 C1220 600 1300 560 1400 545 C1500 530 1580 560 1680 600 V900Z" fill="url(#hillG)" opacity=".85"/>`;
    // citadel on the left hill
    let g = '';
    g += `<path d="M110 470 H380 V500 H110Z" fill="#c98845"/>`;
    for (let i = 0; i < 12; i++) {
      const w = 12 + r() * 10, x = 116 + i * 22 + r() * 4, h = 26 + r() * 40 - Math.abs(i - 6) * 3, y = 472 - h;
      g += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${i % 2 ? '#e9ad62' : '#d9964f'}"/>`;
      g += `<rect class="lit" x="${f(x + w / 2 - 1.5)}" y="${f(y + 8)}" width="3" height="6" rx="1.5" fill="#fff0b8"/>`;
      if (r() > .4) g += `<path d="${dome(x + w / 2, y, w * .95, w * .9)}" fill="#3a59b5"/>`;
    }
    s += `<g opacity=".92">${g}</g>`;
    return s;
  }

  /* ---------- clouds ---------- */
  function cloudBank({ y, minR = 40, maxR = 90, jitter = 24, seed = 1, fill = 'url(#cloudCream)', rim = PALETTE.gold, rimW = 3, swirls = true, w = 1600, base = 960, step = 1.5, shadow = true }) {
    const r = rng(seed);
    let x = -maxR * 1.5;
    let d = `M${f(x)} ${base} L${f(x)} ${y}`;
    const bumps = [];
    let cy = y;
    while (x < w + maxR) {
      const rad = minR + r() * (maxR - minR);
      const ny = y + (r() - .5) * jitter * 2;
      const nx = x + rad * step;
      d += ` A${f(rad)} ${f(rad)} 0 1 1 ${f(nx)} ${f(ny)}`;
      bumps.push({ mx: (x + nx) / 2, cy: (cy + ny) / 2 - rad * .66, r: rad });
      x = nx; cy = ny;
    }
    d += ` L${f(x)} ${base}Z`;
    let s = `<path d="${d}" fill="${fill}" stroke="${rim}" stroke-width="${rimW}" ${shadow ? 'filter="url(#cutShadow)"' : ''}/>`;
    if (swirls) {
      let sw = '';
      bumps.forEach((b, i) => {
        if (i % 3 === 1) return;
        const R = b.r * .72, P = (deg) => [b.mx + R * Math.cos(deg * Math.PI / 180), b.cy + R * Math.sin(deg * Math.PI / 180)];
        const [x0, y0] = P(205), [x1, y1] = P(285);
        sw += `<path d="M${f(x0)} ${f(y0)} A${f(R)} ${f(R)} 0 0 1 ${f(x1)} ${f(y1)}"/>`;
      });
      s += `<g fill="none" stroke="${rim}" stroke-width="${rimW * .6}" stroke-linecap="round" opacity=".4">${sw}</g>`;
    }
    return s;
  }
  // a single floating cloud wisp (for the sky)
  function wisp(x, y, w, seed, fill) {
    const r = rng(seed); const h = w * .18;
    let d = `M${x} ${y}`;
    let cx = x; const n = 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const rad = w / n * (.5 + r() * .5); const nx = cx + w / n;
      d += ` A${f(rad)} ${f(rad)} 0 0 1 ${f(nx)} ${f(y - (i % 2 ? 2 : 0))}`; cx = nx;
    }
    d += ` Q${f(cx + h)} ${f(y + h * .6)} ${f(cx - w * .1)} ${f(y + h * .7)} H${f(x + w * .1)} Q${f(x - h)} ${f(y + h * .6)} ${x} ${y}Z`;
    return `<path d="${d}" fill="${fill}" stroke="${PALETTE.gold}" stroke-width="1.5" opacity=".95"/>`;
  }

  /* ---------- palms ---------- */
  function palm(x, base, height, lean, scale = 1, color = PALETTE.leaf) {
    const tx = x + lean, ty = base - height;
    let s = `<path d="M${x} ${base} Q${f(x + lean * .2)} ${f(base - height * .55)} ${f(tx)} ${f(ty)}" fill="none" stroke="${PALETTE.trunk}" stroke-width="${f(16 * scale)}" stroke-linecap="round"/>`;
    s += `<path d="M${x} ${base} Q${f(x + lean * .2)} ${f(base - height * .55)} ${f(tx)} ${f(ty)}" fill="none" stroke="#6b4a32" stroke-width="${f(12 * scale)}" stroke-dasharray="${f(5 * scale)} ${f(9 * scale)}"/>`;
    const fronds = [-170, -145, -120, -95, -70, -45, -20, 5, 200, 165];
    fronds.forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const L = (110 + (i % 3) * 18) * scale;
      const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .7 + L * .35;
      const mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .5 - 10 * scale;
      const nx = -Math.sin(a) * 18 * scale, ny = Math.cos(a) * 18 * scale;
      s += `<path d="M${f(tx)} ${f(ty)} Q${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)} Q${f(mx - nx)} ${f(my - ny)} ${f(tx)} ${f(ty)}Z" fill="${i % 2 ? color : PALETTE.leafLight}"/>`;
      s += `<path d="M${f(tx)} ${f(ty)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}" fill="none" stroke="${PALETTE.gold}" stroke-width="${f(1.4 * scale)}" opacity=".6"/>`;
    });
    return `<g class="palm" style="transform-origin:${tx}px ${ty}px">${s}</g>`;
  }

  /* ---------- foreground multifoil arch ---------- */
  function archOpening() {
    // cubic from left spring point to apex; lobes drawn as arcs between samples
    const P0 = [150, 380], C1 = [150, 140], C2 = [560, 120], P3 = [800, 64];
    const bez = (t) => {
      const u = 1 - t;
      return [
        u * u * u * P0[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t * t * t * P3[0],
        u * u * u * P0[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t * t * t * P3[1]
      ];
    };
    const n = 6, pts = [];
    for (let i = 0; i <= n; i++) pts.push(bez(i / n));
    let right = '';
    for (let i = n - 1; i >= 0; i--) {
      const a = pts[i + 1], b = pts[i];
      const chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
      right += ` A${f(chord * .58)} ${f(chord * .58)} 0 0 0 ${f(1600 - b[0])} ${f(b[1])}`;
    }
    let left = `M150 960 V${P0[1]}`;
    for (let i = 1; i <= n; i++) {
      const a = pts[i - 1], b = pts[i];
      const chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
      left += ` A${f(chord * .58)} ${f(chord * .58)} 0 0 0 ${f(b[0])} ${f(b[1])}`;
    }
    return { d: `${left}${right} V960Z`, pts };
  }
  function scroll(cx, cy, r, flip = 1) {
    // little arabesque curl
    return `<path d="M${cx} ${cy} c${f(r * flip)} ${-r} ${f(r * 2 * flip)} 0 ${f(r * flip)} ${f(r * .8)} c${f(-r * .6 * flip)} ${f(r * .5)} ${f(-r * 1.2 * flip)} 0 ${f(-r * .7 * flip)} ${f(-r * .4)}" fill="none" stroke="${PALETTE.gold}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  function frame() {
    const { d } = archOpening();
    let s = `<path d="M-20 -20 H1620 V980 H-20Z ${d}" fill="url(#frameFill)" fill-rule="evenodd" filter="url(#cutShadowDown)"/>`;
    // navy band hugging the opening
    s +=`<path d="${d}" fill="none" stroke="#15205a" stroke-width="58"/>`;
    s += `<path d="${d}" fill="none" stroke="url(#frameNavy)" stroke-width="50"/>`;
    s += `<path d="${d}" fill="none" stroke="${PALETTE.gold}" stroke-width="12"/>`;
    s += `<path d="${d}" fill="none" stroke="${PALETTE.goldLight}" stroke-width="3" transform="translate(0 -2)" opacity=".7"/>`;
    s += `<path d="${d}" fill="none" stroke="${PALETTE.crimsonDeep}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" transform="translate(0 0)"/>`;
    // corner arabesques
    let orn = '';
    for (let i = 0; i < 5; i++) {
      orn += scroll(40 + i * 60, 30 + (i % 2) * 26, 16, 1);
      orn += scroll(1560 - i * 60, 30 + (i % 2) * 26, 16, -1);
    }
    s += `<g opacity=".9">${orn}</g>`;
    s += `<circle cx="800" cy="26" r="16" fill="${PALETTE.gold}"/><circle cx="800" cy="26" r="8" fill="${PALETTE.crimsonDeep}"/>`;
    return s;
  }

  /* ---------- blossom branch (about / wish sections) ---------- */
  function blossom(seed, w = 600, h = 400, dir = 1) {
    const r = rng(seed);
    let s = '';
    const ox = dir > 0 ? 0 : w;
    const branches = [
      [ox, h * .2, w * .45, h * .35, w * .9, h * .25],
      [w * .3 * dir + ox * (dir < 0 ? 1 : 0) - (dir < 0 ? w * .3 : 0), h * .3, w * .45, h * .6, w * .7, h * .75]
    ];
    let br = '';
    branches.forEach(([x0, y0, cx, cy, x1, y1]) => {
      const X = (v) => (dir > 0 ? v : w - v);
      br += `<path d="M${f(X(x0))} ${f(y0)} Q${f(X(cx))} ${f(cy)} ${f(X(x1))} ${f(y1)}" fill="none" stroke="#3b2418" stroke-width="10" stroke-linecap="round"/>`;
    });
    s += br;
    for (let i = 0; i < 26; i++) {
      const t = r();
      const x = dir > 0 ? t * w * .95 : w - t * w * .95;
      const y = h * .12 + r() * h * .7;
      const R = 9 + r() * 12;
      const col = r() > .5 ? PALETTE.rose : '#b8283c';
      let pet = '';
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + r();
        pet += `<ellipse cx="${f(x + Math.cos(a) * R * .55)}" cy="${f(y + Math.sin(a) * R * .55)}" rx="${f(R * .55)}" ry="${f(R * .38)}" transform="rotate(${f((a * 180) / Math.PI)} ${f(x + Math.cos(a) * R * .55)} ${f(y + Math.sin(a) * R * .55)})" fill="${col}"/>`;
      }
      s += `<g class="bloom">${pet}<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * .22)}" fill="${PALETTE.goldLight}"/></g>`;
      if (r() > .55) {
        const lx = x + (r() - .5) * 40, ly = y + 14 + r() * 10;
        s += `<path d="M${f(lx)} ${f(ly)} q12 -14 26 -2 q-12 14 -26 2z" fill="${PALETTE.leafLight}"/>`;
      }
    }
    return s;
  }

  /* ---------- pavilion (about window) ---------- */
  function pavilion() {
    let s = `<ellipse cx="300" cy="360" rx="260" ry="150" fill="url(#palGlow)"/>`;
    s += `<rect x="110" y="300" width="380" height="20" fill="${PALETTE.gold}"/>`;
    s += `<path d="${dome(300, 300, 220, 150)}" fill="url(#domeG)"/>` + domeLines(300, 300, 220, 150);
    s += `<rect x="120" y="320" width="360" height="160" fill="url(#wallG)"/>`;
    for (let i = 0; i < 3; i++) {
      const x = 140 + i * 112;
      s += `<path d="${arch(x, 335, 96, 145)}" fill="#3d1a0b"/>`;
      s += `<path class="lit lit--slow" d="${arch(x + 8, 345, 80, 135)}" fill="url(#winG)"/>`;
    }
    // musician silhouettes
    s += `<g fill="#3a1a0e">
      <circle cx="200" cy="420" r="11"/><path d="M182 480 Q186 432 200 432 Q216 432 220 480Z"/>
      <path d="M214 446 L250 420 L254 426 L220 452Z"/><ellipse cx="252" cy="420" rx="8" ry="12"/>
      <circle cx="310" cy="412" r="12"/><path d="M290 480 Q292 426 310 426 Q330 426 332 480Z"/>
      <path d="M326 440 q20 -30 6 -50" stroke="#3a1a0e" stroke-width="5" fill="none"/>
      <circle cx="408" cy="422" r="10"/><path d="M392 480 Q394 434 408 434 Q424 434 426 480Z"/>
      <ellipse cx="380" cy="470" rx="14" ry="10"/><ellipse cx="398" cy="472" rx="12" ry="9"/>
    </g>`;
    s += `<rect x="100" y="480" width="400" height="26" fill="url(#wallShade)"/>`;
    s += crenels(120, 480, 320, 7, PALETTE.gold);
    return s;
  }

  /* ---------- flying carpet ---------- */
  function carpet() {
    return `<svg viewBox="0 0 360 200" class="carpet-svg" aria-hidden="true">
      <defs>
        <linearGradient id="cpG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b3262c"/><stop offset=".5" stop-color="#d23a33"/><stop offset="1" stop-color="#8e1d24"/></linearGradient>
        <pattern id="cpP" width="28" height="18" patternUnits="userSpaceOnUse"><rect width="28" height="18" fill="url(#cpG)"/><path d="M14 2 L22 9 L14 16 L6 9Z" fill="#f1b24a"/><circle cx="14" cy="9" r="2.4" fill="#1e2a6e"/></pattern>
      </defs>
      <!-- rider -->
      <g class="rider">
        <path class="scarf" d="M178 72 C210 62 236 74 268 58 C252 76 230 84 196 86Z" fill="#e2453a">
          <animate attributeName="d" dur="1.6s" repeatCount="indefinite" values="M178 72 C210 62 236 74 268 58 C252 76 230 84 196 86Z;M178 72 C212 70 240 58 272 70 C252 82 230 86 196 86Z;M178 72 C210 62 236 74 268 58 C252 76 230 84 196 86Z"/>
        </path>
        <path d="M150 128 Q150 86 172 80 Q196 84 198 128Z" fill="#2c6e74"/>
        <path d="M156 128 Q160 100 176 96 Q190 100 192 128Z" fill="#f0c063"/>
        <circle cx="172" cy="66" r="14" fill="#c98b5a"/>
        <path d="M156 62 Q158 42 174 42 Q192 44 190 62 Q174 54 156 62Z" fill="#f2a63a"/>
        <circle cx="174" cy="40" r="4" fill="#e2453a"/>
        <path d="M138 128 Q160 118 210 126 L206 136 L140 136Z" fill="#f3e1b8"/>
      </g>
      <!-- carpet body with wave -->
      <path d="M40 130 C100 118 160 146 220 132 C260 124 300 136 330 128 L340 152 C300 162 262 150 222 158 C162 172 100 146 46 158Z" fill="url(#cpP)" stroke="#f1b24a" stroke-width="4">
        <animate attributeName="d" dur="2.2s" repeatCount="indefinite" values="
          M40 130 C100 118 160 146 220 132 C260 124 300 136 330 128 L340 152 C300 162 262 150 222 158 C162 172 100 146 46 158Z;
          M40 136 C100 146 160 120 220 136 C260 144 300 124 330 134 L340 158 C300 150 262 168 222 162 C162 148 100 172 46 164Z;
          M40 130 C100 118 160 146 220 132 C260 124 300 136 330 128 L340 152 C300 162 262 150 222 158 C162 172 100 146 46 158Z"/>
      </path>
      <g fill="#f1b24a"><path d="M40 132 l-22 -6 l4 10z"/><path d="M46 158 l-24 6 l6 -10z"/><path d="M332 128 l24 -8 l-4 12z"/><path d="M340 152 l24 6 l-8 -12z"/></g>
    </svg>`;
  }

  /* ---------- hanging lantern (HTML element content) ---------- */
  function lantern(glow = true) {
    return `<svg viewBox="0 0 60 120" aria-hidden="true">
      <line x1="30" y1="0" x2="30" y2="22" stroke="${PALETTE.gold}" stroke-width="2"/>
      <path d="M22 22 h16 l4 8 h-24z" fill="${PALETTE.gold}"/>
      <path d="M16 30 h28 l6 18 v30 l-6 14 h-28 l-6 -14 v-30z" fill="${glow ? '#ffcc66' : '#c58a3a'}" stroke="${PALETTE.goldDeep}" stroke-width="2"/>
      <path d="M22 34 v52 M30 32 v56 M38 34 v52" stroke="${PALETTE.goldDeep}" stroke-width="1.6" opacity=".8"/>
      <path d="M18 92 h24 l-4 8 h-16z" fill="${PALETTE.gold}"/>
      <path d="M30 100 v8" stroke="${PALETTE.crimson}" stroke-width="3"/><path d="M26 108 h8 l-2 12 h-4z" fill="${PALETTE.crimson}"/>
    </svg>`;
  }

  /* ---------- builder ---------- */
  function svg(content, cls = '', vb = '0 0 1600 900', par = 'xMidYMax slice') {
    return `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="${par}" aria-hidden="true" focusable="false">${DEFS}${content}</svg>`;
  }

  window.EffeScene = {
    PALETTE, rng, svg, palace, hills, cloudBank, wisp, palm, frame, blossom, pavilion, carpet, lantern, arch, dome, domeLines,
    // Assemble the hero planes. Each key matches [data-scene] in index.html.
    planes: {
      farclouds: () => svg(
        wisp(160, 250, 260, 3, '#2d3a8a') + wisp(1180, 200, 300, 4, '#33409a') + wisp(560, 160, 200, 5, '#2a3584') +
        cloudBank({ y: 640, minR: 50, maxR: 110, seed: 11, fill: 'url(#cloudNavy)', rim: '#6c74c9', rimW: 2, swirls: false, shadow: false })
      ),
      hills: () => svg(hills()),
      palace: () => svg(`<g class="palace">${palace()}</g>`),
      midclouds: () => svg(
        cloudBank({ y: 720, minR: 42, maxR: 96, seed: 21, fill: 'url(#cloudLav)', rim: PALETTE.gold, rimW: 2.5 })
      ),
      frontclouds: () => svg(
        cloudBank({ y: 820, minR: 56, maxR: 112, seed: 33, fill: 'url(#cloudCream)', rim: PALETTE.gold, rimW: 3.5, jitter: 40 }) +
        cloudBank({ y: 880, minR: 40, maxR: 90, seed: 34, fill: 'url(#cloudLav)', rim: PALETTE.gold, rimW: 3, jitter: 20 })
      ),
      palms: () => svg(
        palm(120, 960, 330, 30, 1.25) + palm(250, 980, 250, -20, .95) +
        palm(1480, 960, 340, -40, 1.3) + palm(1360, 990, 240, 24, .9)
      ),
      frame: () => svg(frame())
    }
  };
})();
