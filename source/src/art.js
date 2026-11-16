/* Unwriting Her: scene art.
   Each entry returns an SVG drawn like an etching in candlelight. Elements with
   data-ex="<id>" are objects the player can examine; data-go="<scene>" are doors to other scenes.
   Art reacts to state through classes the engine sets on the stage (beat-N, flags). */
(function () {
  const UH = window.UH;
  const INK = '#6e5c47', FAINT = '#3a3028', DEEP = '#0b0907', TALLOW = '#dcae67', GLASS = '#aac3db', WAX = '#c55c4c';
  const f = n => (Math.round(n * 10) / 10).toString();
  const poly = pts => pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
  function rng(seed) { let x = seed; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }
  // one-point perspective
  const P = (X, Y, Z, fl = 520, cx = 500, cy = 470) => [cx + fl * X / Z, cy - fl * Y / Z];

  const DEFS = `<defs>
    <radialGradient id="g-candle" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${TALLOW}" stop-opacity=".55"/><stop offset=".35" stop-color="${TALLOW}" stop-opacity=".16"/><stop offset="1" stop-color="${TALLOW}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-moon" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${GLASS}" stop-opacity=".5"/><stop offset=".4" stop-color="${GLASS}" stop-opacity=".12"/><stop offset="1" stop-color="${GLASS}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-fire" cx="50%" cy="60%" r="55%"><stop offset="0" stop-color="#f0b45e" stop-opacity=".85"/><stop offset=".3" stop-color="${WAX}" stop-opacity=".45"/><stop offset="1" stop-color="${WAX}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-vig" cx="50%" cy="48%" r="72%"><stop offset=".45" stop-color="${DEEP}" stop-opacity="0"/><stop offset="1" stop-color="${DEEP}" stop-opacity=".92"/></radialGradient>
    <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c232b"/><stop offset=".45" stop-color="#0d1014"/><stop offset=".55" stop-color="#151b22"/><stop offset="1" stop-color="#090b0e"/></linearGradient>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0e13"/><stop offset=".7" stop-color="#16161a"/><stop offset="1" stop-color="#1d1915"/></linearGradient>
    <linearGradient id="g-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101318"/><stop offset=".55" stop-color="#2a2420"/><stop offset=".7" stop-color="#5a3f2c"/><stop offset="1" stop-color="#14100d"/></linearGradient>
    <radialGradient id="g-dark" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#030202" stop-opacity=".98"/><stop offset=".6" stop-color="#050404" stop-opacity=".8"/><stop offset="1" stop-color="#050404" stop-opacity="0"/></radialGradient>
    <linearGradient id="g-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${DEEP}" stop-opacity="0"/><stop offset="1" stop-color="${DEEP}" stop-opacity=".95"/></linearGradient>
    <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="f-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .9  0 0 0 0 .8  0 0 0 0 .65  0 0 0 .035 0"/></filter>
  </defs>`;
  const svg = (body, label, fit) => `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${DEFS}<rect width="1000" height="1000" fill="#110e0b"/>${fit ? `<g transform="translate(500 600) scale(${fit}) translate(-500 -600)">${body}</g>` : body}<rect width="1000" height="1000" fill="url(#g-vig)" pointer-events="none"/><rect width="1000" height="1000" filter="url(#f-grain)" pointer-events="none"/></svg>`;
  const glow = (cx, cy, r, id = 'g-candle', cls = '') => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" pointer-events="none"/>`;
  const flame = (x, y, s = 1) => `<g class="flame" transform="translate(${x} ${y}) scale(${s})"><path d="M0,-34 C9,-20 10,-8 0,0 C-10,-8 -9,-20 0,-34Z" fill="${TALLOW}" opacity=".95"/><path d="M0,-22 C4,-14 4,-6 0,-2 C-4,-6 -4,-14 0,-22Z" fill="#fff3d6" opacity=".8"/></g>`;
  const candle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="0" width="18" height="70" fill="#cfc2a6" opacity=".75"/><path d="M-26,72 h52 l-6,10 h-40z" fill="none" stroke="${INK}" stroke-width="2"/><line x1="0" y1="0" x2="0" y2="-6" stroke="#222" stroke-width="2"/>${flame(0, -4)}</g>`;
  const seenX = (s, id) => !!(s && s.explored && (s.explored[s.scene] || []).includes(id));
  const obj = (s, id, inner) => hot(id, `<g class="obj${seenX(s, id) ? ' seen' : ''}">${inner}</g>`);
  const hot = (id, inner, kind = 'ex') => kind === 'none' ? `<g>${inner}</g>` : `<g class="hot" data-${kind}="${id}" tabindex="0" role="button" aria-label="${id}">${inner}</g>`;

  /* -------------------------------------------------- corridor */
  function corridor(s, beat, opts = {}) {
    const near = 0.62, far = 7;
    let b = '';
    // walls, floor, ceiling edges
    [[-1, -1], [1, -1], [-1, 1.25], [1, 1.25]].forEach(([X, Y]) => { const a = P(X, Y, near), c = P(X, Y, far); b += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(c[0])}" y2="${f(c[1])}" stroke="${INK}" stroke-width="1.4"/>`; });
    const fw = [P(-1, -1, far), P(1, -1, far), P(1, 1.25, far), P(-1, 1.25, far)];
    b += `<polygon points="${poly(fw)}" fill="#0e0c0a" stroke="${INK}" stroke-width="1.2"/>`;
    const win = [P(-0.26, 0, far), P(0.26, 0, far), P(0.26, 0.78, far), P(-0.26, 0.78, far)];
    b += glow(500, 440, 120, 'g-moon') + (opts.open ? `<polygon points="${poly(win)}" fill="#24303c" stroke="${GLASS}" stroke-width="1" opacity=".9"/>` : obj(s, 'window', `<polygon points="${poly(win)}" fill="#24303c" stroke="${GLASS}" stroke-width="1" opacity=".9"/>`));
    b += `<line x1="500" y1="${f(win[0][1])}" x2="500" y2="${f(win[2][1])}" stroke="#0e0c0a" stroke-width="1.5"/>`;
    // floorboards
    [-0.6, -0.2, 0.2, 0.6].forEach(X => { const a = P(X, -1, near), c = P(X, -1, far); b += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(c[0])}" y2="${f(c[1])}" stroke="${FAINT}" stroke-width="1"/>`; });
    // moonlight on floor
    b += `<polygon points="${poly([P(-0.26, -1, far), P(0.26, -1, far), P(0.5, -1, 2.2), P(-0.5, -1, 2.2)])}" fill="${GLASS}" opacity=".05"/>`;
    // doors
    const zs = [1.35, 2.35, 3.35, 4.35, 5.35];
    [-1, 1].forEach(X => zs.forEach((z, k) => {
      const d = [P(X, -1, z), P(X, -1, z + 0.45), P(X, 0.55, z + 0.45), P(X, 0.55, z)];
      const isLaugh = X === 1 && k === 2;
      const shape = `<polygon points="${poly(d)}" fill="#070605" stroke="#4a3d30" stroke-width="1.3"/>`;
      if (isLaugh) {
        const s1 = P(X, -0.985, z), s2 = P(X, -0.985, z + 0.45);
        const seam = `<line class="seam" x1="${f(s1[0])}" y1="${f(s1[1])}" x2="${f(s2[0])}" y2="${f(s2[1])}" stroke="${TALLOW}" stroke-width="3"/><line class="seam seam-glow" x1="${f(s1[0])}" y1="${f(s1[1])}" x2="${f(s2[0])}" y2="${f(s2[1])}" stroke="${TALLOW}" stroke-width="10" filter="url(#f-glow)"/>`;
        if (opts.open) {
          const o = [P(X, -1, z), P(X - 0.42, -1, z + 0.05), P(X - 0.42, 0.55, z + 0.05), P(X, 0.55, z)];
          b += `<polygon points="${poly(d)}" fill="${TALLOW}" opacity=".35"/><polygon points="${poly([P(X, -1, z), P(X, -1, z + 0.45), P(0.1, -1, z + 0.2), P(0.2, -1, z - 0.4)])}" fill="${TALLOW}" opacity=".12"/><polygon points="${poly(o)}" fill="#0a0807" stroke="#4a3d30" stroke-width="1.3"/>`;
        } else b += obj(s, 'door', shape + seam);
      } else if (X === -1 && k === 0 && !opts.open) b += obj(s, 'doors', shape);
      else b += shape;
      const kn = P(X, -0.2, z + (X < 0 ? 0.36 : 0.36));
      b += `<circle cx="${f(kn[0])}" cy="${f(kn[1])}" r="${f(18 / z)}" fill="#3a3028"/>`;
    }));
    if (opts.keys) b += `<g transform="translate(470 900)"><circle r="16" fill="none" stroke="${TALLOW}" stroke-width="2.5"/><line x1="12" y1="10" x2="60" y2="34" stroke="${TALLOW}" stroke-width="3"/><line x1="44" y1="26" x2="40" y2="40" stroke="${TALLOW}" stroke-width="3"/></g>`;
    b += glow(500, 980, 420);
    return svg(b, 'A long, low corridor of small black doors with one little window at the far end');
  }

  /* -------------------------------------------------- roof */
  function leads(s, beat, opts = {}) {
    const r = rng(7);
    let b = `<rect width="1000" height="1000" fill="url(#g-sky)"/>`;
    for (let i = 0; i < 70; i++) b += `<circle cx="${f(r() * 1000)}" cy="${f(r() * 520)}" r="${f(r() * 1.6 + 0.4)}" fill="#d9d3c4" opacity="${f(r() * 0.5 + 0.15)}"/>`;
    b += glow(760, 170, 160, 'g-moon') + `<circle cx="760" cy="170" r="34" fill="#cfd8df" opacity=".75"/>`;
    const hills = `<path d="M0,610 C120,580 220,600 330,585 C450,568 560,600 680,590 C800,578 900,596 1000,585 L1000,700 L0,700Z" fill="#14130f"/>`;
    b += opts.fire ? hills : obj(s, 'horizon', hills);
    b += `<path d="M0,640 C150,625 260,648 400,636 C560,622 700,650 1000,632 L1000,720 L0,720Z" fill="#100f0c"/>`;
    for (let i = 0; i < 9; i++) b += `<path d="M${f(-50 + i * 130)},${f(660 + i % 3 * 6)} Q${f(30 + i * 130)},${f(650 + i % 2 * 8)} ${f(110 + i * 130)},${f(668)}" stroke="${FAINT}" fill="none"/>`;
    // battlements
    let cren = 'M0,1000 L0,770 ';
    for (let x = 0; x < 1000; x += 120) cren += `L${x},770 L${x},720 L${x + 70},720 L${x + 70},770 `;
    cren += 'L1000,770 L1000,1000Z';
    b += `<path d="${cren}" fill="#0c0a08" stroke="${INK}" stroke-width="1.4"/>`;
    for (let y = 800; y < 1000; y += 34) b += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="${FAINT}" stroke-width=".8"/>`;
    if (opts.fire) {
      b += glow(500, 1000, 700, 'g-fire', 'fireglow') + `<path d="M0,1000 L0,770 L1000,770 L1000,1000Z" fill="${WAX}" opacity=".1"/>`;
      b += `<path class="smoke" d="M300,720 C320,600 260,520 330,420 C380,350 340,260 400,180" stroke="#5a4d40" stroke-width="40" fill="none" opacity=".18" filter="url(#f-soft)"/>`;
    } else {
      b += obj(s, 'trapdoor', `<polygon points="440,880 560,880 590,960 410,960" fill="#060504" stroke="${INK}" stroke-width="1.2"/><polygon class="trap-glow" points="440,880 560,880 590,960 410,960" fill="${TALLOW}" opacity="0"/>`);
    }
    return svg(b, opts.fire ? 'The battlements against a sky lit by fire' : 'The flat lead roof at night, with battlements, fields and a dim sky-line');
  }

  /* -------------------------------------------------- the gallery of witnesses */
  function gallery(s) {
    const order = ['rochester', 'mason', 'grace', 'jane', 'register', 'host', 'author', 'bertha'];
    const names = { rochester: 'ROCHESTER', mason: 'MASON', grace: 'POOLE', jane: 'EYRE', register: 'THE REGISTER', host: 'THE LANDLORD', author: 'BRONTË', bertha: '' };
    const story = UH.stories.bertha;
    let b = `<rect x="0" y="0" width="1000" height="1000" fill="#120f0c"/><line x1="0" y1="935" x2="1000" y2="935" stroke="${INK}"/>`;
    for (let x = 0; x < 1000; x += 90) b += `<line x1="${x}" y1="935" x2="${x}" y2="1000" stroke="${FAINT}"/>`;
    order.forEach((id, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const w = 168, h = 196, x = 205 + col * 210 + (row === 2 ? 105 : 0), y = 110 + row * 285;
      const heard = s.heard.includes(id);
      const w0 = story && story.witnesses.find(w => w.id === id);
      let fr = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0a0807" stroke="${INK}" stroke-width="3"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="url(#g-glass)" stroke="#4a3d30" stroke-width="1.2" opacity=".9"/>`;
      fr += `<line x1="${x + 30}" y1="${y + 30}" x2="${x + 70}" y2="${y + 80}" stroke="${GLASS}" stroke-width="1" opacity=".18"/>`;
      if (id === 'bertha') {
        fr = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6"/><path d="M${x - 6},${y - 4} C${x + 40},${y + 30} ${x + 140},${y + 20} ${x + w + 6},${y - 4} L${x + w - 4},${y + h + 10} C${x + 120},${y + h - 10} ${x + 60},${y + h + 16} ${x + 4},${y + h + 6}Z" fill="#2a231c" stroke="#4a3d30"/><path d="M${x + 40},${y + 20} C${x + 60},${y + 110} ${x + 50},${y + 170} ${x + 70},${y + h}" stroke="#1d1813" fill="none" stroke-width="3"/><path d="M${x + 120},${y + 14} C${x + 110},${y + 100} ${x + 130},${y + 160} ${x + 118},${y + h}" stroke="#1d1813" fill="none" stroke-width="3"/>`;
        b += `<g class="covered">${fr}<text x="${x + w / 2}" y="${y + h + 40}" text-anchor="middle" font-family="Courier Prime, monospace" font-size="15" letter-spacing="2" fill="#7d725f">NOT CALLED</text></g>`;
        return;
      }
      fr += `<rect x="${x + w / 2 - 70}" y="${y + h + 18}" width="140" height="28" fill="#1d1813" stroke="#4a3d30"/><text x="${x + w / 2}" y="${y + h + 37}" text-anchor="middle" font-family="Courier Prime, monospace" font-size="13" letter-spacing="1.5" fill="${heard ? TALLOW : '#ab9f88'}">${names[id]}</text>`;
      if (heard) fr += `<rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="${TALLOW}" opacity=".08"/>`;
      b += hot(w0 ? w0.scene : '', `<g class="frame${heard ? ' heard' : ''}">${fr}</g>`, 'go');
    });
    [[150, 300], [850, 300]].forEach(([x, y]) => { b += glow(x, y, 170) + candle(x, y + 10, 0.6); });
    return svg(b, 'A wall of empty portrait frames, one for each witness, and one covered with a cloth');
  }

  /* -------------------------------------------------- the room without a window */
  function room(s, beat, opts = {}) {
    const seen = id => opts.inspect ? s.examined.includes(id) : seenX(s, id);
    let b = `<rect width="1000" height="760" fill="#14100d"/><polygon points="0,760 1000,760 1000,1000 0,1000" fill="#0f0c0a"/>`;
    for (let i = -6; i <= 6; i++) b += `<line x1="${500 + i * 40}" y1="760" x2="${500 + i * 220}" y2="1000" stroke="${FAINT}" stroke-width=".9"/>`;
    b += `<line x1="0" y1="760" x2="1000" y2="760" stroke="${INK}" stroke-width="1.3"/>`;
    // the fire, fenced
    let fire = `<rect x="90" y="470" width="250" height="290" fill="#0c0a08" stroke="${INK}" stroke-width="2"/><rect x="70" y="450" width="290" height="22" fill="#1a1511" stroke="${INK}" stroke-width="1.5"/><path d="M130,760 L130,570 Q215,520 300,570 L300,760Z" fill="#060504"/>`;
    fire += glow(215, 720, 160, 'g-fire', 'fireglow') + `<path class="fire-tongue" d="M175,760 C180,710 205,700 200,660 C230,690 240,720 255,760Z" fill="#e39a4f" opacity=".75"/>`;
    let fender = `<line x1="105" y1="640" x2="325" y2="640" stroke="${INK}" stroke-width="4"/>`;
    for (let x = 110; x <= 320; x += 15) fender += `<line x1="${x}" y1="640" x2="${x}" y2="770" stroke="${INK}" stroke-width="3"/>`;
    b += hot('fire', `<g class="obj${seen('fire') ? ' seen' : ''}">${fire}${fender}</g>`);
    // the lamp on its chain
    let lamp = `<line x1="520" y1="0" x2="520" y2="250" stroke="${INK}" stroke-width="2" stroke-dasharray="7 4"/><path d="M490,250 L550,250 L540,320 L500,320Z" fill="#2a231c" stroke="${INK}" stroke-width="1.5"/>`;
    lamp += glow(520, 300, 230) + `<ellipse cx="520" cy="300" rx="12" ry="16" fill="${TALLOW}" opacity=".8"/>`;
    b += hot('lamp', `<g class="obj${seen('lamp') ? ' seen' : ''}">${lamp}</g>`);
    // the tapestry, drawn back from a second door
    let tap = `<rect x="760" y="330" width="130" height="430" fill="#070605" stroke="#4a3d30" stroke-width="1.5"/><rect x="780" y="350" width="90" height="390" fill="none" stroke="${FAINT}"/>`;
    tap += `<path d="M700,180 L930,180 L930,190 C900,330 940,520 905,760 L870,760 C890,560 860,360 880,200 L760,200 C740,380 720,560 705,760 L690,760 C700,560 690,380 700,180Z" fill="#2b221a" stroke="#4a3d30"/>`;
    for (let x = 712; x < 760; x += 12) tap += `<path d="M${x},200 C${x - 4},400 ${x + 6},560 ${x - 2},760" stroke="#1d1813" fill="none" stroke-width="2"/>`;
    b += hot('tapestry', `<g class="obj${seen('tapestry') ? ' seen' : ''}">${tap}</g>`);
    if (opts.inspect) {
      // the window that isn't there
      b += hot('window', `<g class="obj ghost${seen('window') ? ' seen' : ''}"><rect x="420" y="380" width="150" height="190" fill="#14100d" stroke="${GLASS}" stroke-width="1.5" stroke-dasharray="8 8" opacity=".55"/><line x1="495" y1="380" x2="495" y2="570" stroke="${GLASS}" stroke-dasharray="8 8" opacity=".35"/><line x1="420" y1="475" x2="570" y2="475" stroke="${GLASS}" stroke-dasharray="8 8" opacity=".35"/></g>`);
      // Grace Poole's chair, and the keys
      const chair = `<path d="M330,900 L330,700 Q330,660 370,660 L450,660 Q480,660 480,700 L480,800 L500,800 L500,900" fill="none" stroke="${INK}" stroke-width="5"/><path d="M335,690 C380,720 430,700 470,730 L470,800 L340,800Z" fill="#2a2119" opacity=".9"/><line x1="320" y1="800" x2="510" y2="800" stroke="${INK}" stroke-width="5"/>`;
      const keys = `<g class="keys" transform="translate(470 832)"><circle r="12" fill="none" stroke="${TALLOW}" stroke-width="2.5"/><line x1="9" y1="7" x2="44" y2="24" stroke="${TALLOW}" stroke-width="2.5"/><line x1="33" y1="19" x2="30" y2="30" stroke="${TALLOW}" stroke-width="2.5"/></g>`;
      b += hot('pocket', `<g class="obj${seen('pocket') ? ' seen' : ''}">${chair}${keys}</g>`);
      // her: the deep shade at the far end
      b += hot('her', `<g class="obj her${seen('her') ? ' seen' : ''}"><ellipse cx="620" cy="680" rx="130" ry="190" fill="url(#g-dark)"/><path class="rim" d="M575,560 C560,620 565,700 590,790" stroke="${GLASS}" stroke-width="1.6" fill="none" opacity="0"/></g>`);
    } else {
      b += `<rect x="560" y="420" width="440" height="340" fill="url(#g-shade)"/>`;
    }
    return svg(b, 'A room without a window: a fire behind a high fender, a lamp on a chain, a tapestry drawn back from a door', 0.82);
  }
  function roomInspect(s, beat) {
    // same room, but every object can be looked at
    return room(s, beat, { inspect: true });
  }

  /* -------------------------------------------------- other interiors */
  function bedside(s) {
    let b = `<rect width="1000" height="740" fill="#13100d"/><rect y="740" width="1000" height="260" fill="#0e0b09"/><line x1="0" y1="740" x2="1000" y2="740" stroke="${INK}"/>`;
    b += obj(s, 'innerdoor', `<rect x="640" y="230" width="190" height="510" fill="#070605" stroke="#4a3d30" stroke-width="1.5"/><path d="M600,200 L870,200 C850,400 880,600 860,740 L835,740 C850,560 830,380 845,220 L640,220 C620,400 615,600 610,740 L595,740 C605,560 595,380 600,200Z" fill="#2b221a" stroke="#4a3d30"/>`);
    b += `<path d="M180,960 L180,700 Q180,640 240,640 L330,640 Q380,640 380,700 L380,800 L410,800 L410,960" fill="none" stroke="${INK}" stroke-width="6"/><line x1="160" y1="800" x2="420" y2="800" stroke="${INK}" stroke-width="6"/>`;
    b += `<rect x="440" y="700" width="170" height="14" fill="#1d1813" stroke="${INK}"/><line x1="455" y1="714" x2="455" y2="960" stroke="${INK}" stroke-width="5"/><line x1="595" y1="714" x2="595" y2="960" stroke="${INK}" stroke-width="5"/>`;
    b += obj(s, 'basin', `<path d="M465,700 Q525,650 585,700Z" fill="#cfc2a6" opacity=".35" stroke="${INK}"/><ellipse cx="525" cy="684" rx="40" ry="8" fill="#5a1f19" opacity=".55"/><path d="M550,700 L556,620 Q575,600 590,620 L585,700" fill="none" stroke="${INK}" stroke-width="3"/>`);
    b += glow(500, 600, 340) + candle(505, 560, 0.75);
    return svg(b, 'A chair beside a small table with a basin and a candle, and a door behind a tapestry', 0.86);
  }
  function hearth(s) {
    let b = `<rect width="1000" height="760" fill="#14100d"/><rect y="760" width="1000" height="240" fill="#0f0c0a"/><line x1="0" y1="760" x2="1000" y2="760" stroke="${INK}"/>`;
    b += `<rect x="260" y="380" width="480" height="380" fill="#0c0a08" stroke="${INK}" stroke-width="2"/><rect x="230" y="355" width="540" height="28" fill="#1a1511" stroke="${INK}" stroke-width="1.5"/><path d="M320,760 L320,520 Q500,440 680,520 L680,760Z" fill="#060504"/>`;
    b += glow(500, 720, 280, 'g-fire', 'fireglow') + `<path class="fire-tongue" d="M430,760 C440,700 470,690 465,640 C510,680 530,720 560,760Z" fill="#e39a4f" opacity=".75"/>`;
    b += obj(s, 'saucepan', `<rect x="560" y="610" width="90" height="12" fill="${INK}"/><path d="M570,610 L578,560 L632,560 L640,610Z" fill="#2a231c" stroke="${INK}" stroke-width="2"/><line x1="640" y1="580" x2="700" y2="570" stroke="${INK}" stroke-width="4"/><path d="M590,550 C585,520 600,505 595,480" stroke="#7d725f" fill="none" opacity=".4"/>`);
    b += obj(s, 'bottle', `<path d="M640,355 L640,300 Q640,290 650,285 L650,250 L666,250 L666,285 Q676,290 676,300 L676,355Z" fill="#22301f" stroke="${INK}" opacity=".85"/>`);
    b += `<path d="M90,960 L90,720 Q90,680 130,680 L200,680 Q230,680 230,720 L230,820 L250,820 L250,960" fill="none" stroke="${INK}" stroke-width="5"/><line x1="80" y1="820" x2="260" y2="820" stroke="${INK}" stroke-width="5"/>`;
    b += obj(s, 'keys', `<g transform="translate(120 640)"><circle r="16" fill="#0e0b09" stroke="${TALLOW}" stroke-width="2.5"/><line x1="12" y1="9" x2="48" y2="26" stroke="${TALLOW}" stroke-width="2.5"/><line x1="38" y1="21" x2="34" y2="32" stroke="${TALLOW}" stroke-width="2.5"/></g>`);
    return svg(b, 'A hearth with a saucepan on the hob, a bottle on the mantel, an empty chair and a ring of keys');
  }
  function bedroom(s) {
    const flipped = s.flags.includes('mirror-turned');
    let b = `<rect width="1000" height="780" fill="#13100d"/><rect y="780" width="1000" height="220" fill="#0e0b09"/><line x1="0" y1="780" x2="1000" y2="780" stroke="${INK}"/>`;
    b += `<path d="M640,160 L960,160 L960,780 L640,780" fill="#0d0a08" stroke="${INK}" stroke-width="2"/><path d="M640,160 C700,260 680,500 700,780" stroke="#2b221a" stroke-width="40" fill="none" opacity=".8"/><path d="M960,160 C900,260 930,520 910,780" stroke="#2b221a" stroke-width="40" fill="none" opacity=".8"/>`;
    // the dark oblong glass
    let m = `<rect x="250" y="150" width="250" height="560" rx="4" fill="#0a0807" stroke="${INK}" stroke-width="5"/><rect x="268" y="168" width="214" height="524" fill="url(#g-glass)" stroke="#4a3d30"/>`;
    m += `<path d="M290,190 L340,320" stroke="${GLASS}" stroke-width="2" opacity=".22"/><path d="M300,200 L330,280" stroke="${GLASS}" stroke-width="1" opacity=".3"/>`;
    m += `<ellipse class="reflection" cx="375" cy="400" rx="${flipped ? 70 : 0}" ry="${flipped ? 110 : 0}" fill="${GLASS}" opacity=".07" filter="url(#f-soft)"/>`;
    m += `<path d="M300,330 C330,300 420,300 450,330 C470,420 460,560 450,640 L300,640 C290,560 285,420 300,330Z" fill="#e6dccb" opacity=".06"/>`;
    b += obj(s, 'mirror', m);
    b += `<rect x="230" y="700" width="290" height="16" fill="#1d1813" stroke="${INK}"/>`;
    b += obj(s, 'cards', [0, 1, 2, 3].map(i => `<rect x="${262 + i * 30}" y="684" width="22" height="16" fill="#d8ccb2" opacity=".8" transform="rotate(${(i - 1.5) * 4} ${273 + i * 30} 692)"/>`).join(''));
    // the veil, rent in two parts, on the floor
    b += obj(s, 'veil', `<path d="M280,880 C330,850 390,870 430,860 C420,900 370,930 300,925 C285,915 270,900 280,880Z" fill="#e8e1d2" opacity=".55"/><path d="M470,870 C520,845 600,860 640,880 C620,920 560,935 500,920 C480,905 465,890 470,870Z" fill="#e8e1d2" opacity=".5"/><path d="M425,868 L440,860 L432,880 L448,876" stroke="#e8e1d2" fill="none" opacity=".5"/>`);
    // a candle, put out
    b += `<g transform="translate(150 640) scale(.75)"><rect x="-9" y="0" width="18" height="70" fill="#cfc2a6" opacity=".6"/><path d="M-26,72 h52 l-6,10 h-40z" fill="none" stroke="${INK}" stroke-width="2"/><path class="smoke" d="M0,-4 C10,-30 -12,-55 4,-90 C14,-110 -2,-130 6,-160" stroke="#9c907e" stroke-width="3" fill="none" opacity=".35"/></g>`;
    b += glow(380, 420, 380, 'g-moon');
    return svg(b, 'A tall dark mirror, a curtained bed, a snuffed candle, and a veil torn in two on the floor', 0.84);
  }
  function church(s) {
    let b = `<rect width="1000" height="1000" fill="#110e0b"/>`;
    const L = (X, Y, Z) => P(X, Y, Z, 480, 500, 430);
    [[-1.6, -1], [1.6, -1], [-1.6, 2], [1.6, 2]].forEach(([X, Y]) => { const a = L(X, Y, 0.7), c = L(X, Y, 8); b += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(c[0])}" y2="${f(c[1])}" stroke="${INK}" stroke-width="1.3"/>`; });
    const fw = [L(-1.6, -1, 8), L(1.6, -1, 8), L(1.6, 2, 8), L(-1.6, 2, 8)];
    b += `<polygon points="${poly(fw)}" fill="#0d0b09" stroke="${INK}"/>`;
    const w0 = L(-0.25, 0.1, 8), w1 = L(0.25, 1.5, 8);
    b += glow(500, 360, 160, 'g-moon') + `<path d="M${f(w0[0])},${f(w0[1])} L${f(w0[0])},${f(w1[1] + 20)} Q500,${f(w1[1] - 18)} ${f(w1[0])},${f(w1[1] + 20)} L${f(w1[0])},${f(w0[1])}Z" fill="#24303c" stroke="${GLASS}" opacity=".85"/>`;
    for (let z = 1.4; z < 7.5; z += 0.8) [[-1.5, -0.25], [0.25, 1.5]].forEach(([x0, x1]) => {
      const p = [L(x0, -0.45, z), L(x1, -0.45, z), L(x1, -1, z), L(x0, -1, z)];
      b += `<polygon points="${poly(p)}" fill="#1a1511" stroke="#4a3d30" stroke-width="1"/>`;
    });
    b += obj(s, 'paper', `<g transform="translate(500 720)"><line x1="0" y1="0" x2="0" y2="200" stroke="${INK}" stroke-width="6"/><path d="M-70,0 L70,0 L55,-30 L-55,-30Z" fill="#1d1813" stroke="${INK}"/><rect x="-46" y="-56" width="92" height="40" fill="#d8ccb2" opacity=".8" transform="rotate(-6)"/></g>`);
    b += glow(500, 680, 260);
    return svg(b, 'A church aisle between rows of pews, a lancet window, and a paper on the lectern');
  }
  function inn(s) {
    let b = `<rect width="1000" height="1000" fill="url(#g-sky)"/>`;
    let ruin = `<path d="M380,560 L380,420 L420,420 L420,390 L450,390 L450,420 L520,420 L520,380 L560,380 L560,420 L640,420 L640,395 L670,395 L670,420 L700,420 L700,560Z" fill="#0b0908" stroke="${INK}"/>`;
    for (let x = 400; x < 690; x += 40) ruin += `<rect x="${x}" y="460" width="14" height="26" fill="#1e1915"/><rect x="${x}" y="505" width="14" height="26" fill="#1e1915"/>`;
    b += obj(s, 'ruin', ruin);
    b += `<path d="M330,560 C420,540 600,545 760,560 L1000,600 L1000,1000 L0,1000 L0,620Z" fill="#100e0b"/><path d="M520,560 C540,700 420,820 380,1000 L620,1000 C600,820 560,700 540,560Z" fill="#17130f"/>`;
    b += `<line x1="120" y1="80" x2="120" y2="900" stroke="${INK}" stroke-width="8"/><line x1="120" y1="140" x2="330" y2="140" stroke="${INK}" stroke-width="6"/><line x1="170" y1="140" x2="170" y2="180" stroke="${INK}" stroke-width="2"/><line x1="290" y1="140" x2="290" y2="180" stroke="${INK}" stroke-width="2"/>`;
    b += obj(s, 'sign', `<g class="sign"><rect x="150" y="180" width="160" height="110" fill="#1d1813" stroke="${INK}" stroke-width="2"/><text x="230" y="225" text-anchor="middle" font-family="IM Fell English, serif" font-size="20" fill="#ab9f88">The</text><text x="230" y="252" text-anchor="middle" font-family="IM Fell English, serif" font-size="20" fill="#ab9f88">Rochester</text><text x="230" y="276" text-anchor="middle" font-family="IM Fell English, serif" font-size="20" fill="#ab9f88">Arms</text></g>`);
    b += glow(860, 860, 260) + `<rect x="800" y="740" width="110" height="150" fill="${TALLOW}" opacity=".12" stroke="${INK}"/>`;
    return svg(b, 'An inn sign on a post, and on the hill beyond, the blackened shell of a house', 0.82);
  }
  function desk(s) {
    let b = `<rect width="1000" height="1000" fill="#13100d"/>` + obj(s, 'window', `<rect x="620" y="120" width="260" height="330" fill="#1b2027" stroke="${INK}" stroke-width="3"/><path d="M620,380 C700,360 760,370 880,350 L880,450 L620,450Z" fill="#141714"/><line x1="750" y1="120" x2="750" y2="450" stroke="${INK}" stroke-width="3"/>`);
    b += `<polygon points="60,620 940,620 1000,1000 0,1000" fill="#1a1410" stroke="${INK}"/><line x1="60" y1="620" x2="940" y2="620" stroke="${INK}" stroke-width="2"/>`;
    let letter = `<g transform="translate(330 760) rotate(-4)"><rect x="-150" y="-110" width="300" height="220" fill="#d8ccb2" opacity=".85"/>`;
    for (let y = -80; y < 90; y += 18) letter += `<line x1="-120" y1="${y}" x2="${y > 60 ? 20 : 120}" y2="${y}" stroke="#4a3d30" stroke-width="2" stroke-dasharray="${(y * 7) % 23 + 14} 6" opacity=".7"/>`;
    b += obj(s, 'letter', letter + `</g>`) + `<path d="M620,720 L700,520" stroke="#cfc2a6" stroke-width="3"/><path d="M700,520 C720,500 740,470 730,440 C710,470 700,490 690,515Z" fill="#cfc2a6" opacity=".7"/><rect x="600" y="715" width="44" height="34" rx="6" fill="#0b0908" stroke="${INK}"/>`;
    b += glow(820, 600, 300) + candle(830, 560, 0.75);
    return svg(b, 'A writing desk by a window over the moor, a letter, an inkwell and a quill');
  }
  function stairs() {
    let b = `<rect width="1000" height="1000" fill="#110e0b"/>`;
    let x = 140, y = 920;
    for (let flight = 0; flight < 3; flight++) {
      const dir = flight % 2 === 0 ? 1 : -1;
      for (let i = 0; i < 7; i++) { b += `<path d="M${x},${y} l${dir * 40},0 l0,-34" fill="none" stroke="${INK}" stroke-width="2"/>`; x += dir * 40; y -= 34; }
      b += `<line x1="${x}" y1="${y}" x2="${x + dir * 80}" y2="${y}" stroke="${INK}" stroke-width="2"/>`; x += dir * 80;
    }
    b += `<rect x="${x - 50}" y="${y - 200}" width="100" height="200" fill="#070605" stroke="#4a3d30" stroke-width="2"/><line x1="${x - 48}" y1="${y - 1}" x2="${x + 48}" y2="${y - 1}" stroke="${TALLOW}" stroke-width="3"/>` + glow(x, y, 120);
    return svg(b, 'Three flights of stairs rising to a door with light beneath it');
  }
  function margin(s) {
    let b = `<rect width="1000" height="1000" fill="#110e0b"/><g transform="translate(500 520) rotate(-2)"><path d="M-420,-300 Q-210,-330 0,-300 L0,320 Q-210,290 -420,320Z" fill="#cdbf9f" opacity=".85"/><path d="M0,-300 Q210,-330 420,-300 L420,320 Q210,290 0,320Z" fill="#d8ccb2" opacity=".88"/><line x1="0" y1="-300" x2="0" y2="320" stroke="#4a3d30" stroke-width="3"/>`;
    for (let y = -250; y < 280; y += 26) b += `<line x1="-380" y1="${y}" x2="${-60 - (y * 13) % 70}" y2="${y}" stroke="#4a3d30" stroke-width="3" stroke-dasharray="${(y * 7) % 31 + 18} 7" opacity=".55"/>`;
    b += `<rect x="40" y="-260" width="340" height="540" fill="none" stroke="${GLASS}" stroke-dasharray="6 8" opacity=".55"/></g>`;
    b += glow(620, 520, 420, 'g-moon');
    return svg(b, 'An open book: a page of print, and a blank page facing it');
  }
  function night() {
    let b = `<rect width="1000" height="1000" fill="url(#g-sky)"/>` + glow(820, 150, 150, 'g-moon') + `<circle cx="820" cy="150" r="30" fill="#cfd8df" opacity=".7"/>`;
    b += `<path d="M120,820 L120,420 L170,420 L170,380 L210,380 L210,420 L300,420 L300,300 L340,300 L340,270 L380,270 L380,300 L420,300 L420,420 L600,420 L600,390 L640,390 L640,420 L760,420 L760,340 L800,340 L800,310 L840,310 L840,340 L880,340 L880,820Z" fill="#0b0908" stroke="${INK}" stroke-width="1.5"/>`;
    for (let row = 0; row < 3; row++) for (let x = 160; x < 860; x += 70) { if (row === 0 && x > 430 && x < 600) continue; b += `<rect x="${x}" y="${470 + row * 110}" width="26" height="54" fill="${row === 2 && x === 650 ? TALLOW : '#17130f'}" opacity="${row === 2 && x === 650 ? 0.5 : 1}"/>`; }
    b += `<rect x="440" y="440" width="150" height="40" fill="none" stroke="${FAINT}" stroke-dasharray="5 6"/>`;
    b += `<path d="M0,820 L1000,820 L1000,1000 L0,1000Z" fill="#0d0b09"/>`;
    return svg(b, 'Thornfield Hall at night, its rows of windows dark, the third storey blind', 0.86);
  }
  function lock() {
    let b = `<rect width="1000" height="1000" fill="#110e0b"/><rect x="330" y="120" width="340" height="760" fill="#0b0908" stroke="#4a3d30" stroke-width="3"/><rect x="360" y="150" width="280" height="330" fill="none" stroke="${FAINT}" stroke-width="2"/><rect x="360" y="520" width="280" height="330" fill="none" stroke="${FAINT}" stroke-width="2"/>`;
    b += `<rect x="560" y="470" width="80" height="110" fill="#2a231c" stroke="${INK}" stroke-width="2"/><path d="M595,500 a8,8 0 1 1 10,0 l4,30 h-18z" fill="#050404"/><g transform="translate(600 520)"><line x1="0" y1="0" x2="-60" y2="40" stroke="${TALLOW}" stroke-width="4"/><circle cx="-70" cy="48" r="14" fill="none" stroke="${TALLOW}" stroke-width="3"/></g>`;
    b += glow(250, 760, 260) + candle(250, 720, 0.7);
    return svg(b, 'A locked door with the key turned in it, and a candle');
  }
  function voidCandle(s) {
    let b = `<rect width="1000" height="1000" fill="#0b0907"/>` + glow(500, 520, 360) + candle(500, 520, 1.1);
    return svg(b, 'A single candle in the dark');
  }
  function shore() {
    let b = `<rect width="1000" height="1000" fill="url(#g-dawn)"/>` + glow(560, 640, 300, 'g-candle');
    b += `<rect y="640" width="1000" height="360" fill="#0f0d0b"/>`;
    for (let y = 660; y < 1000; y += 22) b += `<path d="M0,${y} Q250,${y - 6} 500,${y} T1000,${y}" stroke="#3a3028" fill="none" opacity="${f(0.9 - (y - 660) / 500)}"/>`;
    b += `<path d="M120,640 L120,560 L150,560 L150,500 L162,480 L174,500 L174,560 L240,560 L240,640Z" fill="#0b0908" stroke="${INK}"/><text x="180" y="610" text-anchor="middle" font-family="IM Fell English, serif" font-size="30" fill="#ab9f88">——</text>`;
    b += `<path d="M820,640 C818,590 826,560 834,520" stroke="#0b0908" stroke-width="6" fill="none"/><path d="M834,520 C800,505 780,512 765,525 M834,520 C860,500 885,505 900,522 M834,520 C830,490 812,478 800,476 M834,520 C850,494 870,488 884,490" stroke="#0b0908" stroke-width="5" fill="none"/>`;
    return svg(b, 'A dawn sea, and on the shore a small church whose name is a dash');
  }
  function book() {
    let b = `<rect width="1000" height="1000" fill="#110e0b"/><polygon points="80,660 920,660 1000,1000 0,1000" fill="#1a1410" stroke="${INK}"/>`;
    b += `<g transform="translate(500 640) rotate(-3)"><rect x="-230" y="-60" width="460" height="70" fill="#2a1f17" stroke="${INK}" stroke-width="2"/><rect x="-224" y="-48" width="448" height="12" fill="#d8ccb2" opacity=".5"/><rect x="-224" y="-30" width="448" height="12" fill="#d8ccb2" opacity=".4"/><path d="M120,10 L120,90 L134,78 L148,90 L148,10" fill="${WAX}" opacity=".7"/></g>`;
    b += glow(780, 560, 260) + candle(790, 520, 0.7);
    return svg(b, 'A closed book on a table, with a ribbon marking a page');
  }
  function glass() {
    let b = `<rect width="1000" height="1000" fill="#0c0a08"/><rect x="300" y="60" width="400" height="880" rx="6" fill="#0a0807" stroke="${INK}" stroke-width="6"/><rect x="322" y="82" width="356" height="836" fill="url(#g-glass)" stroke="#4a3d30"/>`;
    b += `<path d="M350,120 L450,360" stroke="${GLASS}" stroke-width="2" opacity=".16"/><path d="M360,140 L420,290" stroke="${GLASS}" stroke-width="1" opacity=".24"/>`;
    b += glow(500, 520, 420, 'g-moon') + glow(170, 820, 220) + candle(170, 780, 0.7);
    return svg(b, 'A tall dark oblong glass in a heavy frame');
  }
  function threshold() {
    let b = `<rect width="1000" height="1000" fill="#0c0a08"/><rect x="390" y="180" width="220" height="560" fill="#0f0c0a" stroke="#3b3229" stroke-width="2"/><rect x="404" y="194" width="192" height="532" fill="none" stroke="#2c241d"/><circle cx="570" cy="470" r="6" fill="#4a3e31"/>`;
    b += `<line class="seam" x1="392" y1="741" x2="608" y2="741" stroke="${TALLOW}" stroke-width="4"/><line class="seam seam-glow" x1="392" y1="745" x2="608" y2="745" stroke="${TALLOW}" stroke-width="14" filter="url(#f-glow)"/>`;
    b += `<polygon points="392,745 608,745 760,1000 240,1000" fill="${TALLOW}" opacity=".06"/>`;
    return svg(b, 'A closed door with light beneath it');
  }

  UH.art = {
    threshold, corridor, leads, gallery, attic: (s, b) => room(s, b), room: roomInspect,
    bedside, hearth, bedroom, church, inn, desk, stairs, margin, night,
    door: (s, b) => corridor(s, b, { open: true }), keeper: lock, roof: (s, b) => leads(s, b, { fire: true }),
    void: voidCandle, shore, book, glass
  };
})();
