/* Before She Answers: scene art. Flat mid-century gouache: hard sun, cast shadows, a narrow palette, grain.
   People are drawn without faces, all of them alike in that, and told apart by posture, clothes and what they carry.
   Elements with data-on="tag" appear only when the scene has that tag; data-off="tag" hides them.
   Every person is a <g class="fig" data-who="…">, so the chapter can light whoever holds the room's attention. */
(function () {
  'use strict';
  const P = {
    paper: '#f3eee3', cream: '#efe6d2', wall: '#e8dcc4', wall2: '#dccfb3', ink: '#2a2420', tob: '#7a5232', tob2: '#5c3d25',
    jade: '#7fa892', jade2: '#5d8a76', jadeL: '#b7d0c1', green: '#c9d8c3', glass: '#c3d7e2', sky: '#cfe0e8', sky2: '#e9eef0',
    sun: '#f1d58a', sunL: '#f7e7b8', gray: '#8d8a84', gray2: '#6f6c67', navy: '#2f3b4a', skin: '#c99d78', skin2: '#b48963',
    hair: '#2b2622', hairG: '#9a958e', shadow: 'rgba(70,48,28,.16)', mustard: '#c9a24a', rust: '#b5654a', steel: '#b9bcbc', chrome: '#d5d8d6'
  };
  const DEFS = `<defs>
    <filter id="mo-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .18  0 0 0 .09 0"/></filter>
    <filter id="mo-brush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
    <filter id="mo-soft"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="mo-steam"><feGaussianBlur stdDeviation="9"/></filter>
    <linearGradient id="mo-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>
    <linearGradient id="mo-valley" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3c98a"/><stop offset="1" stop-color="#cfa95e"/></linearGradient>
    <radialGradient id="mo-pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${P.sunL}" stop-opacity=".95"/><stop offset="1" stop-color="${P.sunL}" stop-opacity="0"/></radialGradient>
    <radialGradient id="mo-tube" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f4fbf2" stop-opacity=".9"/><stop offset="1" stop-color="#f4fbf2" stop-opacity="0"/></radialGradient>
    <pattern id="mo-terrazzo" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#e9e1cf"/><circle cx="8" cy="12" r="2" fill="#cdbfa3"/><circle cx="31" cy="40" r="1.6" fill="#a9b8ae"/><circle cx="48" cy="18" r="2.2" fill="#d6c7ab"/><circle cx="20" cy="52" r="1.3" fill="#b9a487"/><circle cx="52" cy="50" r="1.5" fill="#c9d3c9"/></pattern>
    <pattern id="mo-tile" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${P.jadeL}"/><rect x="1.5" y="1.5" width="37" height="37" fill="#c3dacb"/><path d="M4,6 L14,6" stroke="#e3efe6" stroke-width="2" opacity=".7"/></pattern>
    <pattern id="mo-floortile" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#efe3c9"/><rect width="30" height="30" fill="#e2cfaa"/><rect x="30" y="30" width="30" height="30" fill="#e2cfaa"/></pattern>
    <pattern id="mo-check" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#f2ead8"/><rect width="18" height="18" fill="#b9d2c3"/><rect x="18" y="18" width="18" height="18" fill="#b9d2c3"/></pattern>
    <pattern id="mo-lino" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#e6dac0"/><rect width="40" height="40" fill="#ddd0b2"/><rect x="40" y="40" width="40" height="40" fill="#ddd0b2"/></pattern>
    <pattern id="mo-carpet" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#b8a383"/><path d="M0,10 L10,0" stroke="#ad9877" stroke-width="2"/></pattern>
    <pattern id="mo-siding" width="34" height="200" patternUnits="userSpaceOnUse"><rect width="34" height="200" fill="#e8cf8c"/><rect x="0" width="4" height="200" fill="#d9bd73"/></pattern>
  </defs>`;
  const wrap = (inner, label) => `<svg class="mo-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${DEFS}${inner}<rect width="1600" height="1000" filter="url(#mo-grain)" pointer-events="none"/></svg>`;
  const R = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
  const shadowE = (x, y, rx, ry = 10) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;

  /* ------------------------------------------------------------ people
     Feet at (0,0), about 330 units tall at scale 1, facing right unless flip. */
  const LOOK = {
    mo: { coat: P.gray, coat2: P.gray2, skirt: '#7b7872', hair: P.hairG, legs: '#c8b8a2', bun: true, pearls: true, bag: P.tob, slim: 0.86, h: 0.92 },
    bo: { coat: P.navy, coat2: '#243040', skirt: '#2a3442', hair: P.hair, legs: '#8e7a66', curls: true, slim: 1.12, h: 0.98, paper: true },
    niece: { coat: P.jade2, coat2: '#4c7563', skirt: P.jade2, hair: P.hair, legs: '#c8b8a2', bob: true, slim: 0.92, h: 1, dress: true },
    daughter: { coat: '#c9b48a', coat2: '#a8925f', skirt: '#4a4a55', hair: P.hair, legs: '#c8b8a2', long: true, slim: 0.9, h: 1 },
    son: { coat: '#e9e4d8', coat2: '#cfc8b8', skirt: '#4a5260', hair: P.hair, legs: '#4a5260', man: true, slim: 1, h: 1.08 },
    father: { coat: '#f1eee6', coat2: '#d6d1c4', skirt: '#5a5650', hair: '#4a4540', legs: '#5a5650', man: true, slim: 1, h: 1.02, apron: true },
    coat: { coat: '#d9c6a0', coat2: '#bfa97e', skirt: '#d9c6a0', hair: '#7a5232', legs: '#c8b8a2', bob: true, slim: 0.92, h: 1.06, dress: true },
    trav: { coat: '#cbbf9f', coat2: '#b3a684', skirt: '#9a8f78', hair: '#5a4a3a', legs: '#9a8f78', man: true, slim: 1, h: 1.02 }
  };
  function head(L, x = 0) {
    let h = `<rect x="${x - 6}" y="-292" width="12" height="18" fill="${P.skin2}"/><ellipse cx="${x + 2}" cy="-310" rx="17" ry="21" fill="${P.skin}"/>`;
    if (L.bun) h += `<path d="M${x - 16},-312 C${x - 18},-336 ${x + 16},-338 ${x + 19},-316 C${x + 10},-326 ${x - 4},-326 ${x - 16},-312Z" fill="${L.hair}"/><circle cx="${x - 17}" cy="-318" r="10" fill="${L.hair}"/><path d="M${x - 15},-312 C${x - 16},-300 ${x - 13},-294 ${x - 9},-290" stroke="${L.hair}" stroke-width="6" fill="none"/>`;
    if (L.curls) h += `<path d="M${x - 19},-304 C${x - 26},-340 ${x + 20},-346 ${x + 21},-314 C${x + 16},-322 ${x + 8},-324 ${x + 2},-322 C${x - 4},-316 ${x - 12},-312 ${x - 19},-304Z" fill="${L.hair}"/><circle cx="${x - 16}" cy="-326" r="9" fill="${L.hair}"/><circle cx="${x + 2}" cy="-334" r="10" fill="${L.hair}"/><circle cx="${x - 19}" cy="-308" r="7" fill="${L.hair}"/>`;
    if (L.bob) h += `<path d="M${x - 20},-292 C${x - 26},-338 ${x + 22},-344 ${x + 21},-308 C${x + 12},-322 ${x},-324 ${x - 8},-318 C${x - 12},-306 ${x - 12},-296 ${x - 20},-292Z" fill="${L.hair}"/>`;
    if (L.long) h += `<path d="M${x - 18},-262 C${x - 30},-330 ${x + 20},-348 ${x + 20},-312 C${x + 10},-324 ${x - 2},-322 ${x - 8},-314 C${x - 10},-296 ${x - 8},-276 ${x - 18},-262Z" fill="${L.hair}"/>`;
    if (L.man) h += `<path d="M${x - 17},-306 C${x - 20},-334 ${x + 18},-338 ${x + 19},-316 C${x + 10},-324 ${x - 2},-326 ${x - 10},-318 C${x - 13},-312 ${x - 14},-308 ${x - 17},-306Z" fill="${L.hair}"/>`;
    return h;
  }
  function person(who, x, y, o = {}) {
    const L = Object.assign({}, LOOK[o.look || who]);
    const s = (o.s || 1) * L.h, w = L.slim;
    const flip = o.flip ? -1 : 1;
    const pose = o.pose || 'stand';
    let b = '';
    if (pose === 'stand') {
      b += shadowE(0, 0, 54 * w, 9);
      b += `<path d="M${-14 * w},-118 L${-12 * w},-6 L${-3 * w},-6 L${-2 * w},-118Z" fill="${L.legs}"/><path d="M${3 * w},-118 L${4 * w},-6 L${13 * w},-6 L${15 * w},-118Z" fill="${L.legs}"/>`;
      b += `<ellipse cx="${-8 * w}" cy="-4" rx="${11 * w}" ry="5" fill="${P.ink}"/><ellipse cx="${10 * w}" cy="-4" rx="${11 * w}" ry="5" fill="${P.ink}"/>`;
      if (L.man) b += `<path d="M${-22 * w},-170 L${-17 * w},-8 L${-3 * w},-8 L0,-120 L${3 * w},-8 L${17 * w},-8 L${22 * w},-170Z" fill="${L.skirt}"/>`;
      else b += `<path d="M${-30 * w},-196 L${-38 * w},-112 L${38 * w},-112 L${30 * w},-196Z" fill="${L.skirt}"/>`;
      const top = L.dress ? -112 : (L.man ? -168 : -190);
      b += `<path d="M${-30 * w},${top} C${-36 * w},-232 ${-34 * w},-262 ${-24 * w},-274 L${24 * w},-274 C${34 * w},-262 ${36 * w},-232 ${30 * w},${top}Z" fill="${L.coat}"/>`;
      b += `<path d="M${8 * w},${top} C${20 * w},-232 ${22 * w},-260 ${18 * w},-272 L${24 * w},-274 C${34 * w},-262 ${36 * w},-232 ${30 * w},${top}Z" fill="#fff" opacity=".14"/>`;
      b += `<path d="M${-30 * w},${top} C${-36 * w},-232 ${-34 * w},-262 ${-24 * w},-274 L${-14 * w},-274 C${-22 * w},-250 ${-22 * w},-220 ${-16 * w},${top}Z" fill="#000" opacity=".1"/>`;
      if (L.apron) b += `<path d="M${-20 * w},-240 L${20 * w},-240 L${26 * w},-120 L${-26 * w},-120Z" fill="#f7f4ec" opacity=".9"/>`;
      // arms
      const arm = o.arm || (L.bag && !o.noBag ? 'bag' : 'down');
      if (arm === 'bag') {
        b += `<path d="M${-24 * w},-266 C${-32 * w},-232 ${-26 * w},-200 ${-6},-186 M${24 * w},-266 C${32 * w},-232 ${26 * w},-200 ${6},-186" stroke="${L.coat2}" stroke-width="${13 * w}" stroke-linecap="round" fill="none"/>`;
        b += `<path d="M-14,-206 C-14,-222 14,-222 14,-206" stroke="${P.tob2}" stroke-width="3" fill="none"/><rect x="-23" y="-206" width="46" height="34" rx="6" fill="${L.bag}"/><rect x="-23" y="-206" width="46" height="8" rx="4" fill="#000" opacity=".12"/><circle cx="0" cy="-200" r="2.4" fill="${P.sun}"/>`;
        b += `<circle cx="-6" cy="-186" r="6" fill="${P.skin}"/><circle cx="6" cy="-186" r="6" fill="${P.skin}"/>`;
      } else if (arm === 'point') {
        b += `<path d="M${-24 * w},-266 C${-32 * w},-226 ${-30 * w},-196 ${-28 * w},-170" stroke="${L.coat2}" stroke-width="${14 * w}" stroke-linecap="round" fill="none"/><path d="M${24 * w},-266 C${44 * w},-252 ${62 * w},-244 ${82 * w},-246" stroke="${L.coat2}" stroke-width="${14 * w}" stroke-linecap="round" fill="none"/><circle cx="${86 * w}" cy="-246" r="6.5" fill="${P.skin}"/>`;
        if (L.paper) b += `<path d="M${-44 * w},-176 L${-12 * w},-176 L${-15 * w},-120 L${-41 * w},-120Z" fill="#d8bf8f"/><path d="M${-44 * w},-176 L${-12 * w},-176 L${-14 * w},-168 L${-42 * w},-168Z" fill="#c7aa76"/>`;
        b += `<circle cx="${-28 * w}" cy="-168" r="6.5" fill="${P.skin}"/>`;
      } else if (arm === 'hold') {
        b += `<path d="M${-24 * w},-266 C${-28 * w},-230 ${-12 * w},-214 ${10 * w},-212 M${24 * w},-266 C${30 * w},-236 ${26 * w},-218 ${14 * w},-212" stroke="${L.coat2}" stroke-width="${13 * w}" stroke-linecap="round" fill="none"/><circle cx="${14 * w}" cy="-212" r="6" fill="${P.skin}"/>`;
        if (o.cup) b += `<path d="M${8 * w},-232 L${24 * w},-232 L${22 * w},-212 L${10 * w},-212Z" fill="${o.cup === 'sun' ? '#f2e3b3' : '#fbfaf6'}" stroke="${o.cup === 'sun' ? P.mustard : P.glass}" stroke-width="2"/>`;
        if (o.book) b += `<rect x="${2 * w}" y="-234" width="${30 * w}" height="22" fill="${o.book}"/>`;
      } else {
        b += `<path d="M${-24 * w},-266 C${-32 * w},-226 ${-30 * w},-196 ${-28 * w},-168 M${24 * w},-266 C${32 * w},-226 ${30 * w},-196 ${28 * w},-168" stroke="${L.coat2}" stroke-width="${13 * w}" stroke-linecap="round" fill="none"/><circle cx="${-28 * w}" cy="-166" r="6" fill="${P.skin}"/><circle cx="${28 * w}" cy="-166" r="6" fill="${P.skin}"/>`;
        if (L.paper && o.bagged) b += `<path d="M${16 * w},-172 L${46 * w},-172 L${43 * w},-116 L${19 * w},-116Z" fill="#d8bf8f"/>`;
      }
      if (L.pearls) for (let i = -3; i <= 3; i++) b += `<circle cx="${i * 4.4}" cy="${-274 + Math.abs(i) * -1.2 + 6}" r="2.6" fill="#f6f1e6"/>`;
      if (!L.man && !L.dress && !L.apron) b += `<path d="M-5,-274 L0,-246 L5,-274" fill="none" stroke="${L.coat2}" stroke-width="2"/>`;
      b += head(L);
    } else if (pose === 'sit') {
      // seated, facing right, on whatever is at y; the seat is at 0, feet at +110
      b += `<path d="M${-6 * w},10 L${60 * w},10 L${62 * w},104 L${50 * w},104 L${48 * w},26 L${-6 * w},26Z" fill="${L.man ? L.skirt : L.legs}"/>`;
      if (!L.man) b += `<path d="M${-34 * w},-6 L${56 * w},-6 L${60 * w},30 L${-30 * w},30Z" fill="${L.skirt}"/>`;
      else b += `<path d="M${-30 * w},-6 L${60 * w},-6 L${62 * w},26 L${-30 * w},26Z" fill="${L.skirt}"/>`;
      b += `<ellipse cx="${62 * w}" cy="106" rx="13" ry="5" fill="${P.ink}"/>`;
      b += `<path d="M${-30 * w},0 C${-38 * w},-50 ${-34 * w},-84 ${-22 * w},-96 L${22 * w},-96 C${32 * w},-84 ${36 * w},-50 ${28 * w},0Z" fill="${L.coat}"/>`;
      b += `<path d="M${10 * w},0 C${22 * w},-50 ${22 * w},-80 ${18 * w},-94 L${22 * w},-96 C${32 * w},-84 ${36 * w},-50 ${28 * w},0Z" fill="#fff" opacity=".14"/>`;
      b += `<path d="M${18 * w},-88 C${34 * w},-60 ${46 * w},-44 ${64 * w},-36" stroke="${L.coat2}" stroke-width="${13 * w}" stroke-linecap="round" fill="none"/><circle cx="${68 * w}" cy="-36" r="6" fill="${P.skin}"/>`;
      if (o.book) b += `<rect x="${58 * w}" y="-50" width="${40 * w}" height="16" fill="${o.book}"/>`;
      b += `<g transform="translate(0 178)">${head(L)}</g>`;
    } else if (pose === 'back') {
      // seen from behind, head and shoulders, for the car
      b += `<path d="M-74,0 C-74,-40 -60,-70 -30,-78 L30,-78 C60,-70 74,-40 74,0Z" fill="${L.coat}"/><path d="M-74,0 C-74,-40 -60,-70 -30,-78 L-20,-78 C-44,-64 -54,-36 -54,0Z" fill="#000" opacity=".12"/>`;
      b += `<rect x="-11" y="-98" width="22" height="24" fill="${P.skin2}"/><ellipse cx="0" cy="-122" rx="27" ry="32" fill="${L.hair}"/>`;
      if (L.bun) b += `<circle cx="0" cy="-118" r="13" fill="#857f78"/>`;
      if (L.curls) b += `<circle cx="-16" cy="-140" r="13" fill="${L.hair}"/><circle cx="14" cy="-146" r="14" fill="${L.hair}"/><circle cx="-22" cy="-118" r="11" fill="${L.hair}"/><circle cx="22" cy="-120" r="11" fill="${L.hair}"/>`;
      if (o.turned) b += `<ellipse cx="${o.turned * 18}" cy="-118" rx="14" ry="22" fill="${P.skin}"/>`;
    }
    const tf = `translate(${x} ${y}) scale(${s * flip} ${s})`;
    return `<g class="fig" data-who="${o.who || who}" ${o.on ? `data-on="${o.on}"` : ''} ${o.off ? `data-off="${o.off}"` : ''}><ellipse class="fig-light" cx="${x}" cy="${y}" rx="${90 * s}" ry="${22 * s}" fill="url(#mo-pool)"/><g transform="${tf}">${b}</g></g>`;
  }

  /* ------------------------------------------------------------ props */
  function chair(x, y, c, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4,0 L-10,62 M54,0 L60,62 M-10,62 L60,62" stroke="${P.chrome}" stroke-width="4" fill="none"/><path d="M0,-6 C-4,-46 -2,-70 6,-84 C20,-90 40,-90 52,-84 C58,-60 58,-30 54,-6 C40,4 12,4 0,-6Z" fill="${c}"/><path d="M-8,-4 C10,6 44,6 62,-4 L60,8 C44,16 8,16 -6,8Z" fill="${c}"/><path d="M6,-84 C12,-60 12,-30 8,-6" stroke="#fff" stroke-width="5" opacity=".18" fill="none"/></g>`;
  }
  function suitcase(x, y, w, h, c, strap = true) {
    return `<g transform="translate(${x} ${y})">${shadowE(w / 2, 0, w * 0.6, 6)}<rect x="0" y="${-h}" width="${w}" height="${h}" rx="7" fill="${c}"/><rect x="0" y="${-h}" width="${w}" height="${h * 0.18}" rx="6" fill="#fff" opacity=".12"/><path d="M${w / 2 - 14},${-h} C${w / 2 - 14},${-h - 16} ${w / 2 + 14},${-h - 16} ${w / 2 + 14},${-h}" stroke="${P.tob2}" stroke-width="5" fill="none"/>${strap ? `<rect x="${w * 0.22}" y="${-h}" width="6" height="${h}" fill="#000" opacity=".14"/><rect x="${w * 0.72}" y="${-h}" width="6" height="${h}" fill="#000" opacity=".14"/>` : ''}</g>`;
  }
  function box(x, y, w, h) {
    return `<g transform="translate(${x} ${y})">${shadowE(w / 2, 0, w * 0.6, 6)}<rect x="0" y="${-h}" width="${w}" height="${h}" fill="#c9a874"/><path d="M0,${-h} L${w},${-h} L${w - 8},${-h - 10} L8,${-h - 10}Z" fill="#d9bb88"/><path d="M${w / 2},${-h - 10} L${w / 2},0 M0,${-h / 2} L${w},${-h / 2}" stroke="#6e5536" stroke-width="2.4"/><path d="M${w / 2 - 10},${-h - 18} C${w / 2 - 4},${-h - 8} ${w / 2 + 4},${-h - 8} ${w / 2 + 10},${-h - 18}" stroke="#6e5536" stroke-width="2.4" fill="none"/></g>`;
  }
  function flap(x, y, text, cw = 22, ch = 32, fill = '#2b2723', ink = '#f3eee3') {
    let g = '';
    [...text].forEach((c, i) => {
      g += `<rect x="${x + i * (cw + 3)}" y="${y}" width="${cw}" height="${ch}" rx="2" fill="${fill}"/><line x1="${x + i * (cw + 3)}" y1="${y + ch / 2}" x2="${x + i * (cw + 3) + cw}" y2="${y + ch / 2}" stroke="#000" stroke-width="1.4" opacity=".7"/>`;
      if (c !== ' ') g += `<text x="${x + i * (cw + 3) + cw / 2}" y="${y + ch * 0.74}" text-anchor="middle" font-family="'Work Sans', 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="${ch * 0.66}" fill="${ink}">${c}</text>`;
    });
    return g;
  }

  /* ============================================================ AIRPORT */
  function airport() {
    let b = '';
    b += R(0, 0, 1600, 1000, P.cream);
    // the glass wall
    b += R(0, 110, 1600, 520, 'url(#mo-sky)');
    b += `<path d="M0,470 C200,430 380,450 560,420 C760,388 980,430 1180,404 C1340,384 1480,410 1600,396 L1600,560 L0,560Z" fill="#b9c9cc" opacity=".55"/>`;
    b += `<path d="M0,500 C240,470 520,490 820,462 C1100,440 1360,470 1600,452 L1600,560 L0,560Z" fill="#a9bcbc" opacity=".6"/>`;
    b += R(0, 540, 1600, 90, '#d3d2c8');
    b += R(0, 560, 1600, 6, '#e8e6dc');
    // an airliner at the gate
    b += `<g transform="translate(1010 470)"><path d="M-520,58 C-520,30 -480,18 -420,18 L230,18 C300,18 330,36 340,58 C330,80 300,92 230,92 L-420,92 C-480,92 -520,80 -520,58Z" fill="#f6f5f0"/><path d="M-520,66 L340,66" stroke="${P.jade2}" stroke-width="9"/><path d="M200,18 L290,-108 L340,-108 L300,18Z" fill="#f6f5f0"/><path d="M262,-60 L322,-60" stroke="${P.jade2}" stroke-width="10"/><path d="M-120,70 L-20,140 L60,140 L20,70Z" fill="#e5e3db"/>${[...Array(18)].map((_, i) => `<rect x="${-440 + i * 34}" y="38" width="14" height="12" rx="3" fill="#8aa0aa"/>`).join('')}</g>`;
    b += R(940, 548, 30, 40, '#9a9b94') + R(1180, 548, 30, 40, '#9a9b94');
    // mullions and transom
    for (let x = 0; x <= 1600; x += 178) b += R(x - 5, 110, 10, 520, '#4e4a42');
    b += R(0, 300, 1600, 8, '#4e4a42');
    b += R(0, 104, 1600, 14, '#4e4a42');
    // ceiling
    b += R(0, 0, 1600, 104, '#efe8d8');
    for (let x = 60; x < 1600; x += 140) b += `<rect x="${x}" y="40" width="60" height="10" rx="4" fill="#fffbee"/><ellipse cx="${x + 30}" cy="56" rx="60" ry="16" fill="#fffbee" opacity=".35"/>`;
    // floor and the sun laid across it
    b += R(0, 630, 1600, 370, 'url(#mo-terrazzo)');
    b += R(0, 626, 1600, 8, '#bfb6a2');
    for (let x = -300; x <= 1600; x += 178) b += `<path d="M${x + 10},634 L${x + 168},634 L${x + 420},1000 L${x + 230},1000Z" fill="${P.sunL}" opacity=".55"/>`;
    // the customs doors at the back
    b += `<g><rect x="1250" y="380" width="250" height="250" fill="#ddd6c4"/><rect x="1270" y="420" width="100" height="210" fill="#e9eef0" opacity=".9"/><rect x="1380" y="420" width="100" height="210" fill="#e9eef0" opacity=".9"/><rect x="1250" y="372" width="250" height="40" fill="${P.jade2}"/><text x="1375" y="399" text-anchor="middle" font-family="'Work Sans', Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="3" fill="#f3eee3">INTERNATIONAL ARRIVALS</text></g>`;
    // rope barrier
    b += `<path d="M1040,700 C1100,722 1180,722 1240,700 C1300,722 1380,722 1440,700" stroke="${P.jade2}" stroke-width="7" fill="none"/>${[1040, 1240, 1440].map(x => `<rect x="${x - 5}" y="660" width="10" height="70" fill="${P.chrome}"/><ellipse cx="${x}" cy="732" rx="20" ry="6" fill="${P.steel}"/><circle cx="${x}" cy="658" r="9" fill="${P.chrome}"/>`).join('')}`;
    // the pillar
    b += `<rect x="1060" y="110" width="90" height="760" fill="#e4dac6"/><rect x="1120" y="110" width="30" height="760" fill="#d2c6ae"/><rect x="1052" y="860" width="106" height="14" fill="#c9bea8"/>`;
    // the arrivals board, hung from the ceiling
    b += `<g><path d="M200,0 L200,128 M640,0 L640,128" stroke="#4e4a42" stroke-width="5"/><rect x="150" y="128" width="540" height="300" rx="6" fill="#3a3530"/><rect x="164" y="142" width="512" height="44" fill="#4a443e"/><text x="186" y="173" font-family="'Work Sans', Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="6" fill="${P.sun}">ARRIVALS</text>
      ${flap(186, 202, 'HONOLULU  ON TIME')}${flap(186, 244, 'TOKYO     DELAYED')}${flap(186, 286, 'HONG KONG LANDED')}${flap(186, 328, 'MANILA    ON TIME')}${flap(186, 370, 'SYDNEY    1925   ')}</g>`;
    // seats
    b += `<g>${[0, 1, 2, 3, 4].map(i => chair(70 + i * 74, 830, i % 2 ? P.tob : P.jade)).join('')}<rect x="54" y="890" width="380" height="8" fill="${P.chrome}"/></g>`;
    b += `<g transform="translate(222 820)"><path d="M0,0 L40,0 L36,-56 L4,-56Z" fill="#d8bf8f"/><path d="M50,0 L86,0 L83,-44 L52,-44Z" fill="#cfb27e"/><path d="M-60,6 C-50,-14 -10,-14 0,6Z" fill="#b7d0c1"/></g>`;
    // travellers in the distance
    const far = [[620, 690, 0.42, 'trav', false], [760, 700, 0.45, 'coat', true], [880, 684, 0.4, 'trav', true], [1320, 690, 0.42, 'trav', false], [1400, 700, 0.44, 'trav', true], [520, 676, 0.38, 'trav', true]];
    far.forEach(([x, y, s, l, f]) => { b += `<g opacity=".8">${person('x', x, y, { look: l, s, flip: f, who: 'crowd' })}</g>`; });
    // the woman in the smart coat
    b += person('coat', 930, 860, { s: 0.98, flip: true, look: 'coat', on: 'coat' });
    // the family
    b += person('daughter', 292, 836, { pose: 'sit', s: 0.82, book: '#b5654a' });
    b += person('son', 470, 930, { s: 0.9, flip: false });
    b += person('bo', 640, 950, { arm: 'point', s: 1.02 });
    b += person('niece', 790, 950, { s: 0.98 });
    // Moon Orchid by the pillar
    b += person('mo', 1180, 900, { flip: true, s: 0.94, on: 'arrived' });
    b += `<g data-on="bags">${suitcase(1210, 930, 92, 66, '#8e6f4c')}${suitcase(1300, 932, 78, 56, '#6b8a7b')}${suitcase(1360, 934, 100, 72, '#9a7a56')}${box(1240, 966, 74, 44)}</g>`;
    return wrap(b, 'The arrivals hall at San Francisco airport: a glass wall onto the runway, an arrivals board, molded chairs, a rope barrier and a pillar; a family waiting');
  }

  /* ============================================================ CAR */
  function car() {
    let b = '';
    b += R(0, 0, 1600, 1000, '#2f2a25');
    // the windscreen: valley, poles, road
    b += `<g><path d="M150,170 C400,130 1200,130 1450,170 L1490,560 L110,560Z" fill="url(#mo-sky)"/>
      <clipPath id="mo-ws"><path d="M150,170 C400,130 1200,130 1450,170 L1490,560 L110,560Z"/></clipPath>
      <g clip-path="url(#mo-ws)"><path d="M0,400 C300,392 600,398 900,394 C1200,390 1400,396 1600,392 L1600,600 L0,600Z" fill="url(#mo-valley)"/>
        <path d="M0,404 L1600,398" stroke="#b9c3a2" stroke-width="5" opacity=".6"/>${[...Array(14)].map((_, i) => `<path d="M${-40 + i * 130},560 L${700 + i * 14},400" stroke="#c49a4f" stroke-width="2" opacity=".55"/>`).join('')}
        <path d="M760,400 L840,400 L1180,560 L420,560Z" fill="#8a877e"/><path d="M800,400 L800,404 M800,420 L800,430 M800,452 L798,470 M796,500 L794,530" stroke="#f3eee3" stroke-width="5"/>
        ${[[300, 300], [520, 340], [660, 372], [1060, 360], [1220, 320], [1420, 270]].map(([x, t]) => `<path d="M${x},${t} L${x},400" stroke="#6b5a45" stroke-width="5"/><path d="M${x - 22},${t + 10} L${x + 22},${t + 10}" stroke="#6b5a45" stroke-width="4"/>`).join('')}
        <path d="M0,330 C140,320 300,328 520,316" stroke="#6b5a45" stroke-width="1.5" fill="none"/>
        <path d="M110,560 L1490,560 L1450,170 C1300,150 1100,140 880,140 C1150,240 1300,400 1490,560Z" fill="#fff" opacity=".15"/>
        <ellipse cx="1200" cy="220" rx="170" ry="46" fill="#fff" opacity=".45" filter="url(#mo-soft)"/></g>
      <path d="M150,170 C400,130 1200,130 1450,170 L1490,560 L110,560Z" fill="none" stroke="#1f1b17" stroke-width="22"/></g>`;
    // roof lining, mirror, visors
    b += `<path d="M0,0 L1600,0 L1600,190 C1300,140 300,140 0,190Z" fill="#cdbfa6"/><path d="M0,190 C300,140 1300,140 1600,190" stroke="#b8a98d" stroke-width="10" fill="none"/>`;
    b += `<rect x="740" y="160" width="130" height="40" rx="10" fill="#1f1b17"/><rect x="750" y="166" width="110" height="28" rx="7" fill="#9fb3bd"/><rect x="800" y="120" width="10" height="44" fill="#1f1b17"/>`;
    // dashboard
    b += `<path d="M60,560 C300,520 1300,520 1540,560 L1600,700 L0,700Z" fill="${P.tob2}"/><path d="M60,560 C300,520 1300,520 1540,560" stroke="#8a6646" stroke-width="10" fill="none"/>`;
    b += `<g transform="translate(330 640)"><ellipse cx="0" cy="0" rx="170" ry="60" fill="none" stroke="#2b2723" stroke-width="16"/><circle r="16" fill="#2b2723"/></g>`;
    // the people, from behind
    b += person('son', 360, 770, { pose: 'back', look: 'son', s: 1.7 });
    b += person('bo', 1160, 770, { pose: 'back', look: 'bo', s: 1.7, turned: -1 });
    // the back seat: Moon Orchid and her daughter, the box on her lap
    b += `<path d="M0,820 L1600,820 L1600,1000 L0,1000Z" fill="#8a6a4a"/><path d="M0,820 L1600,820" stroke="#6e5236" stroke-width="10"/>`;
    b += `<g class="fig" data-who="mo"><ellipse class="fig-light" cx="1240" cy="1000" rx="260" ry="60" fill="url(#mo-pool)"/><path d="M1080,1000 C1080,930 1120,880 1180,870 L1300,870 C1360,880 1400,930 1400,1000Z" fill="${P.gray}"/><g transform="translate(1180 1000)">${box(0, -10, 150, 70)}</g><circle cx="1210" cy="964" r="10" fill="${P.skin}"/><circle cx="1320" cy="964" r="10" fill="${P.skin}"/></g>`;
    b += `<g class="fig" data-who="niece"><ellipse class="fig-light" cx="360" cy="1000" rx="240" ry="60" fill="url(#mo-pool)"/><path d="M220,1000 C220,936 256,892 312,884 L420,884 C476,892 510,936 510,1000Z" fill="${P.jade2}"/></g>`;
    return wrap(b, 'Inside a sedan on the valley road: through the windscreen, flat gold fields and telephone poles; the driver and Brave Orchid from behind, and in the back seat a gray-suited lap holding a cardboard box');
  }

  /* ============================================================ KITCHEN */
  function kitchen() {
    let b = '';
    b += R(0, 0, 1600, 1000, '#ece2cc');
    b += R(0, 0, 1600, 640, '#efe5cf');
    // window over the sink, with the blind's stripes of sun
    b += `<rect x="620" y="150" width="420" height="300" fill="url(#mo-sky)"/><path d="M620,380 C760,360 900,372 1040,356 L1040,450 L620,450Z" fill="#9fbf8a"/><circle cx="700" cy="330" r="60" fill="#8aae78"/><rect x="610" y="140" width="440" height="320" fill="none" stroke="#f7f2e6" stroke-width="20"/><rect x="826" y="140" width="10" height="320" fill="#f7f2e6"/>
      ${[...Array(9)].map((_, i) => `<rect x="620" y="${160 + i * 22}" width="420" height="7" fill="#f7f2e6" opacity=".85"/>`).join('')}`;
    // the sun the window throws across the room
    b += `${[...Array(6)].map((_, i) => `<path d="M${360 + i * 22},${640 + i * 26} L${820 + i * 22},${640 + i * 26} L${860 + i * 22},${652 + i * 26} L${400 + i * 22},${652 + i * 26}Z" fill="${P.sunL}" opacity=".7"/>`).join('')}`;
    // counter and sink, cabinets
    b += `<rect x="430" y="470" width="800" height="24" fill="#e3e6e0"/><rect x="440" y="494" width="780" height="146" fill="${P.jade}"/>${[0, 1, 2, 3].map(i => `<rect x="${454 + i * 192}" y="508" width="176" height="118" fill="none" stroke="${P.jade2}" stroke-width="3"/><rect x="${530 + i * 192}" y="520" width="24" height="5" rx="2" fill="${P.chrome}"/>`).join('')}`;
    b += `<path d="M760,470 L900,470 L890,500 L770,500Z" fill="#c9cdc8"/><path d="M828,470 L828,420 C828,404 852,404 852,420" stroke="${P.chrome}" stroke-width="7" fill="none"/>`;
    b += `<g transform="translate(1000 470)"><path d="M0,0 L44,0 L40,-78 L6,-78Z" fill="${P.chrome}"/><path d="M14,-78 L30,-78 L28,-92 L16,-92Z" fill="#9a9c98"/><path d="M44,-30 C62,-30 62,-58 44,-58" stroke="#9a9c98" stroke-width="6" fill="none"/></g>`;
    // the open cupboard, left
    b += `<g><rect x="60" y="110" width="320" height="380" fill="#f1ead9" stroke="#d6c8aa" stroke-width="4"/><rect x="74" y="124" width="292" height="352" fill="#e2d6bc"/>
      <rect x="74" y="250" width="292" height="8" fill="#cbbb9a"/><rect x="74" y="370" width="292" height="8" fill="#cbbb9a"/>
      <g>${[0, 1, 2, 3, 4].map(i => `<path d="M${96 + i * 52},248 L${130 + i * 52},248 L${126 + i * 52},214 L${100 + i * 52},214Z" fill="${['#f4f1e8', '#d9e6df', '#efd9a8', '#f4f1e8', '#cfdce4'][i]}"/>`).join('')}</g>
      <g>${[0, 1, 2].map(i => `<rect x="${96 + i * 70}" y="330" width="44" height="38" rx="5" fill="${['#e9e4da', '#c9d6cf', '#e9e4da'][i]}"/><path d="M${140 + i * 70},338 C${156 + i * 70},338 ${156 + i * 70},360 ${140 + i * 70},360" stroke="${['#e9e4da', '#c9d6cf', '#e9e4da'][i]}" stroke-width="6" fill="none"/>`).join('')}</g>
      <g data-off="cup-sun"><rect x="308" y="328" width="40" height="40" rx="5" fill="#f2e3b3"/><circle cx="328" cy="346" r="9" fill="${P.mustard}"/><path d="M322,349 C326,353 330,353 334,349" stroke="${P.tob2}" stroke-width="1.6" fill="none"/></g>
      <g data-off="cup-white"><path d="M330,468 L352,468 L350,446 L332,446Z" fill="#fbfaf6"/><path d="M332,449 L350,449" stroke="#6f93ad" stroke-width="2.4"/></g>
      <path d="M380,110 L440,138 L440,470 L380,490Z" fill="#e7dcc4" stroke="#d6c8aa" stroke-width="4"/><circle cx="426" cy="300" r="5" fill="${P.chrome}"/></g>`;
    // wall telephone and calendar
    b += `<g transform="translate(1320 260)"><rect x="0" y="0" width="70" height="120" rx="10" fill="${P.mustard}"/><rect x="-6" y="-14" width="82" height="30" rx="14" fill="#b38d3c"/><circle cx="35" cy="66" r="24" fill="#e9dcb4"/><path d="M35,120 C35,170 10,170 10,230" stroke="#3a3530" stroke-width="3" fill="none"/></g>`;
    b += `<g transform="translate(1160 200)"><rect x="0" y="0" width="120" height="150" fill="#fbf8f0"/><rect x="0" y="0" width="120" height="34" fill="${P.rust}"/>${[...Array(20)].map((_, i) => `<rect x="${8 + (i % 5) * 22}" y="${44 + Math.floor(i / 5) * 24}" width="18" height="18" fill="#efe8d8"/>`).join('')}</g>`;
    // floor and table
    b += R(0, 640, 1600, 360, 'url(#mo-lino)');
    b += `<g transform="translate(300 760)">${shadowE(380, 230, 420, 26)}<path d="M0,0 L760,0 L800,60 L-40,60Z" fill="url(#mo-check)"/><path d="M-40,60 L800,60 L800,80 L-40,80Z" fill="#a9c4b5"/><path d="M20,80 L30,230 M740,80 L730,230" stroke="${P.chrome}" stroke-width="10"/></g>`;
    // the people
    b += person('son', 1180, 900, { s: 1.04, flip: true, arm: 'down' });
    b += person('mo', 260, 920, { s: 1.06, arm: 'hold', noBag: true, cup: null, on: '', who: 'mo' }).replace('data-who="mo"', 'data-who="mo" data-off="cup-sun cup-white"');
    b += person('mo', 260, 920, { s: 1.06, arm: 'hold', noBag: true, cup: 'sun', on: 'cup-sun' });
    b += person('mo', 260, 920, { s: 1.06, arm: 'hold', noBag: true, cup: 'white', on: 'cup-white' });
    return wrap(b, 'A sunny kitchen: an open cupboard of mismatched cups, a window over the sink with its blind, a checked tablecloth, a wall telephone and calendar');
  }

  /* ============================================================ HOUSE (exterior) */
  function house() {
    let b = '';
    b += R(0, 0, 1600, 1000, 'url(#mo-sky)');
    b += `<path d="M0,520 C200,470 420,500 640,460 C860,420 1100,470 1340,440 C1460,426 1540,436 1600,430 L1600,640 L0,640Z" fill="#7d9a6e"/><path d="M0,560 C260,520 520,546 760,520 C1000,494 1300,526 1600,500 L1600,640 L0,640Z" fill="#6b8a5d"/>`;
    b += R(0, 640, 1600, 360, '#9ab07a');
    b += `<path d="M0,760 L1600,720 L1600,1000 L0,1000Z" fill="#8ea56d"/>`;
    // the ranch house
    b += `<g transform="translate(160 330)">
      <path d="M-60,140 L520,40 L1300,40 L1400,140Z" fill="#e9e3d6"/><path d="M-60,140 L1400,140 L1400,156 L-60,156Z" fill="#d1c8b4"/>
      <rect x="760" y="-20" width="70" height="90" fill="#b9ad98"/><rect x="752" y="-30" width="86" height="16" fill="#a39783"/>
      <rect x="0" y="156" width="1300" height="300" fill="url(#mo-siding)"/>
      <rect x="0" y="156" width="420" height="300" fill="#e8cf8c"/>
      <rect x="40" y="230" width="330" height="226" fill="${P.tob}"/>${[0, 1, 2, 3].map(i => `<rect x="40" y="${284 + i * 50}" width="330" height="4" fill="${P.tob2}"/>`).join('')}
      <rect x="500" y="220" width="300" height="130" fill="#2e3b42"/><rect x="500" y="220" width="300" height="130" fill="#c3d7e2" opacity=".55"/><rect x="646" y="220" width="8" height="130" fill="#f7f2e6"/><rect x="494" y="214" width="312" height="142" fill="none" stroke="#f7f2e6" stroke-width="10"/>
      <rect x="860" y="196" width="88" height="260" fill="${P.jade2}"/><circle cx="932" cy="330" r="6" fill="${P.sun}"/>
      <rect x="1000" y="230" width="230" height="120" fill="#2e3b42"/><rect x="1000" y="230" width="230" height="120" fill="#c3d7e2" opacity=".55"/><rect x="994" y="224" width="242" height="132" fill="none" stroke="#f7f2e6" stroke-width="10"/>
      <path d="M0,456 L1300,456 L1300,470 L0,470Z" fill="#c9bfa8"/>
      <path d="M420,156 L1300,156 L1300,200 L420,232Z" fill="#000" opacity=".1"/></g>`;
    // the long afternoon shadow of the eave and a birch
    b += `<path d="M160,800 L1460,800 L1600,860 L240,880Z" fill="#000" opacity=".1"/>`;
    b += `<g transform="translate(1440 820)"><path d="M0,0 C-10,-180 10,-340 -6,-560" stroke="#efece4" stroke-width="22" fill="none"/>${[[-30, -200], [10, -300], [-20, -420], [16, -480]].map(([x, y]) => `<path d="M${x},${y} l8,0" stroke="#3a3530" stroke-width="4"/>`).join('')}
      ${[[-120, -560, 120], [40, -620, 110], [-60, -700, 90], [90, -480, 90], [-150, -440, 80]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#b6cf8f" opacity=".85"/><circle cx="${x + 20}" cy="${y + 20}" r="${r * 0.7}" fill="#9dbb76" opacity=".8"/>`).join('')}</g>`;
    b += `<path d="M120,860 C240,830 360,860 480,840" stroke="#6d8a55" stroke-width="40" stroke-linecap="round" fill="none"/>`;
    b += `<g data-on="evening"><rect width="1600" height="1000" fill="#3a3460" opacity=".28"/><rect x="660" y="550" width="300" height="130" fill="${P.sun}" opacity=".85"/><rect x="1160" y="560" width="230" height="120" fill="${P.sun}" opacity=".7"/></g>`;
    b += person('mo', 1040, 800, { s: 0.6, on: 'porch' });
    return wrap(b, 'A long, low ranch house in Stockton in the sun: yellow siding, a garage door, a picture window, a birch on the lawn');
  }

  /* ============================================================ LIVING ROOM */
  function living() {
    let b = '';
    b += R(0, 0, 1600, 1000, '#ead9b4');
    b += R(0, 0, 1600, 640, '#efe2c4');
    // picture window with venetian blind
    b += `<rect x="560" y="120" width="560" height="340" fill="url(#mo-sky)"/><path d="M560,380 L1120,360 L1120,460 L560,460Z" fill="#9ab07a"/><rect x="550" y="110" width="580" height="360" fill="none" stroke="#f7f2e6" stroke-width="18"/>${[...Array(12)].map((_, i) => `<rect x="560" y="${126 + i * 22}" width="560" height="8" fill="#f7f2e6" opacity=".9"/>`).join('')}`;
    b += `${[...Array(8)].map((_, i) => `<path d="M${520 + i * 10},${660 + i * 30} L${1080 + i * 10},${660 + i * 30} L${1110 + i * 10},${672 + i * 30} L${550 + i * 10},${672 + i * 30}Z" fill="${P.sunL}" opacity=".6"/>`).join('')}`;
    // photographs on the wall: the grandparents, faceless
    b += `${[[200, 170], [320, 200], [1240, 180]].map(([x, y]) => `<rect x="${x}" y="${y}" width="80" height="104" fill="#5c4630"/><rect x="${x + 8}" y="${y + 8}" width="64" height="88" fill="#d8ccb2"/><ellipse cx="${x + 40}" cy="${y + 40}" rx="14" ry="17" fill="#b8a688"/><path d="M${x + 18},${y + 96} C${x + 20},${y + 66} ${x + 60},${y + 66} ${x + 62},${y + 96}Z" fill="#8f7c5e"/>`).join('')}`;
    // the doorway to the kitchen, right
    b += `<rect x="1330" y="200" width="220" height="440" fill="#e3d2ad"/><rect x="1340" y="210" width="200" height="430" fill="#f2e6cb"/><rect x="1390" y="330" width="120" height="16" fill="${P.jade}"/>`;
    // floor, carpet
    b += R(0, 640, 1600, 360, '#c9b28b');
    b += `<path d="M120,700 L1320,700 L1460,980 L-20,980Z" fill="url(#mo-carpet)"/>`;
    // the console television, rabbit ears
    b += `<g transform="translate(120 520)"><rect x="0" y="0" width="300" height="180" fill="${P.tob}"/><rect x="24" y="22" width="170" height="130" rx="18" fill="#3a3f3b"/><rect x="34" y="32" width="150" height="110" rx="14" fill="#5a625c"/><rect x="214" y="30" width="62" height="120" fill="${P.tob2}"/><circle cx="245" cy="60" r="12" fill="#d9c9a5"/><circle cx="245" cy="104" r="12" fill="#d9c9a5"/><path d="M100,0 L60,-90 M120,0 L170,-100" stroke="#3a3530" stroke-width="4"/><path d="M20,180 L10,220 M290,180 L300,220" stroke="${P.tob2}" stroke-width="10"/></g>`;
    // dining table where the eldest daughter studies
    b += `<g transform="translate(560 690)">${shadowE(220, 170, 260, 18)}<path d="M0,0 L440,0 L470,40 L-30,40Z" fill="#a37b52"/><path d="M10,40 L20,170 M430,40 L420,170" stroke="${P.tob2}" stroke-width="10"/>
      <rect x="160" y="-20" width="90" height="20" fill="#f3eee3"/><rect x="170" y="-34" width="70" height="14" fill="${P.rust}"/><rect x="290" y="-12" width="60" height="12" fill="${P.jade2}"/></g>`;
    // the presents from Hong Kong: paper, a folded silk dress, green paper cutouts of a warrior
    b += `<g data-on="gifts" transform="translate(560 690)"><path d="M40,-6 L120,-6 L126,-30 L46,-30Z" fill="#d6e4dc"/><path d="M52,-30 L114,-30" stroke="#9dbfae" stroke-width="3"/>
      ${[0, 1, 2].map(i => `<g transform="translate(${300 + i * 34} -6)"><path d="M0,0 L4,-30 L-2,-38 L6,-48 L12,-40 L10,-30 L20,-34 L14,-22 L16,0Z" fill="#5d8a76"/><circle cx="7" cy="-52" r="6" fill="#5d8a76"/><path d="M12,-46 L30,-64" stroke="#5d8a76" stroke-width="2.5"/></g>`).join('')}
      <rect x="400" y="-24" width="40" height="18" fill="#b5654a"/><path d="M420,-24 L420,-6" stroke="#f1d58a" stroke-width="3"/></g>`;
    b += chair(500, 830, '#b08a5e', 1.1);
    b += person('daughter', 540, 820, { pose: 'sit', s: 0.9, book: '#f3eee3', on: '', who: 'daughter' });
    // the eldest son in the kitchen doorway with his sandwich
    b += person('son', 1440, 880, { s: 1.0, flip: true, arm: 'hold' });
    // Moon Orchid, standing, handbag in both hands
    b += person('mo', 1150, 900, { s: 1.02, flip: true });
    return wrap(b, 'A 1960s living room: a picture window with a blind, a console television, framed family photographs, a dining table with books');
  }

  /* ============================================================ LAUNDRY */
  function laundry() {
    let b = '';
    b += R(0, 0, 1600, 1000, '#efe7d2');
    b += R(0, 0, 1600, 360, '#f1ead7');
    b += R(0, 360, 1600, 300, 'url(#mo-tile)');
    b += R(0, 352, 1600, 12, '#8fb3a0');
    // the shop window, the street outside, the word painted backwards
    b += `<rect x="1130" y="120" width="420" height="420" fill="#f2e2b0"/><rect x="1130" y="380" width="420" height="160" fill="#d9c9a0"/><rect x="1180" y="190" width="120" height="190" fill="#c7a77a"/><rect x="1330" y="160" width="180" height="220" fill="#d7c29a"/>
      <rect x="1120" y="110" width="440" height="440" fill="none" stroke="#5d8a76" stroke-width="16"/><rect x="1340" y="110" width="10" height="440" fill="#5d8a76"/>
      <text x="1340" y="300" text-anchor="middle" font-family="'Work Sans', Arial, sans-serif" font-weight="600" font-size="58" letter-spacing="6" fill="${P.rust}" transform="scale(-1 1) translate(-2680 0)">LAUNDRY</text>`;
    // shelves of finished bundles, back wall
    b += `<g>${[0, 1, 2].map(r => `<rect x="60" y="${120 + r * 110}" width="980" height="10" fill="#9c7a52"/>` + [...Array(11)].map((_, i) => { const w = 70 + ((i * 37 + r * 13) % 24); return `<g transform="translate(${80 + i * 86} ${120 + r * 110})"><rect x="0" y="-62" width="${w}" height="62" rx="4" fill="${(i + r) % 3 ? '#c9a46e' : '#d7b986'}"/><path d="M${w / 2},-62 L${w / 2},0 M0,-31 L${w},-31" stroke="#6e5536" stroke-width="2"/><rect x="${w / 2 + 4}" y="-26" width="18" height="14" fill="#fbf8f0"/></g>`; }).join('')).join('')}</g>`;
    // fluorescent tubes
    b += `${[260, 700, 1140].map(x => `<ellipse cx="${x}" cy="40" rx="260" ry="60" fill="url(#mo-tube)"/><rect x="${x - 170}" y="26" width="340" height="16" rx="8" fill="#fbfff6"/><rect x="${x - 180}" y="22" width="360" height="6" fill="#c9c6bb"/>`).join('')}`;
    // floor
    b += R(0, 660, 1600, 340, 'url(#mo-floortile)');
    b += `<path d="M0,660 L1600,660" stroke="#b9a684" stroke-width="6"/>`;
    // the steam press: base, padded buck, the jaw
    function press(x, y, open) {
      return `<g transform="translate(${x} ${y})">${shadowE(130, 0, 170, 14)}<rect x="20" y="-250" width="220" height="250" fill="#7b8a86"/><rect x="20" y="-250" width="220" height="30" fill="#8e9d98"/><rect x="0" y="-300" width="270" height="56" rx="26" fill="#e9e4da"/><rect x="0" y="-300" width="270" height="14" rx="7" fill="#fff" opacity=".4"/>
        <g transform="rotate(${open ? -16 : 0} 250 -320)"><rect x="-6" y="-350" width="282" height="48" rx="22" fill="#9aa8a4"/><rect x="200" y="-382" width="70" height="40" fill="#7b8a86"/></g>
        <rect x="246" y="-240" width="14" height="210" fill="#5c6a66"/><circle cx="253" cy="-220" r="13" fill="${P.rust}"/></g>`;
    }
    b += press(80, 900, true) + press(400, 900, false);
    // steam
    b += `<g class="mo-steam" filter="url(#mo-steam)" opacity=".8">${[[200, 520], [260, 490], [520, 540], [580, 500]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="44" ry="26" fill="#fff"/>`).join('')}</g>`;
    // the folding / ironing table, centre
    b += `<g transform="translate(760 780)">${shadowE(190, 140, 230, 14)}<rect x="0" y="0" width="380" height="24" fill="#d8ccb0"/><path d="M20,24 L30,140 M360,24 L350,140" stroke="#8a6a48" stroke-width="10"/>
      <path d="M40,-10 L170,-10 L176,0 L34,0Z" fill="#fbfaf6"/><path d="M70,-24 L150,-24 L160,-10 L60,-10Z" fill="#f3f2ee"/>
      <g data-on="ironing burned"><path d="M190,-20 L250,-20 C262,-20 268,-12 268,-4 L190,-4Z" fill="#5c6a66"/><path d="M206,-36 C206,-46 236,-46 236,-36" stroke="#2b2723" stroke-width="5" fill="none"/></g>
      <g data-on="burned"><path d="M96,-16 L126,-16 C132,-16 134,-12 134,-10 L96,-10Z" fill="#7a5232" opacity=".8"/></g>
      <g data-on="towels">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${250}" y="${-16 - i * 12}" width="100" height="12" fill="${i % 2 ? '#f6f1e2' : '#e9f0ea'}"/>`).join('')}</g>
      <g data-on="tickets"><rect x="250" y="-34" width="90" height="34" fill="${P.tob}"/>${[0, 1, 2, 3].map(i => `<rect x="${258 + i * 20}" y="-46" width="14" height="22" fill="#fbf8f0"/>`).join('')}</g></g>`;
    // the counter with its bell and ticket box, front right
    b += `<g transform="translate(1080 700)"><rect x="0" y="0" width="420" height="30" fill="#9c7a52"/><rect x="10" y="30" width="400" height="260" fill="${P.jade2}"/><rect x="30" y="54" width="360" height="210" fill="none" stroke="#4c7563" stroke-width="3"/><path d="M340,0 C340,-24 380,-24 380,0Z" fill="${P.chrome}"/><circle cx="360" cy="-26" r="4" fill="${P.chrome}"/><rect x="40" y="-34" width="90" height="34" fill="${P.tob}"/></g>`;
    // the crate by the door
    b += `<g data-on="crate" transform="translate(1000 940)">${shadowE(50, 0, 70, 8)}<rect x="0" y="-70" width="100" height="70" fill="#c9a46e"/><path d="M0,-46 L100,-46 M0,-22 L100,-22" stroke="#8a6a48" stroke-width="4"/></g>`;
    // the people
    b += person('father', 640, 930, { s: 0.96, flip: true });
    b += person('bo', 360, 960, { s: 1.04, arm: 'point' });
    b += person('mo', 980, 960, { s: 1.02, flip: true, off: 'crate' });
    b += person('mo', 1020, 872, { pose: 'sit', s: 0.8, on: 'crate', look: 'mo' });
    return wrap(b, 'The family laundry: two steam presses, shelves of finished bundles in brown paper with tickets, jade tile, fluorescent tubes, and a shop window with LAUNDRY painted backwards');
  }

  UH.MOart = { airport, car, kitchen, house, living, laundry };
})();
