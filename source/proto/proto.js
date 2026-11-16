/* Unwriting Her: tactile prototype.
   Three scenes (the threshold, the hearing, the room upstairs) built from the same story data as the game.
   Every quotation and note comes from stories/bertha.js; this file only decides how you handle them. */
window.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const S = window.UH.story;
  const app = document.getElementById('app');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ state */
  const fresh = () => ({ scene: 'threshold', role: null, heard: [], visited: [], opened: [], readings: {}, flags: [], erased: [], examined: [],
    struck: [], record: [], reflections: [], crossx: {}, checks: {}, finding: null, name: null, cited: [], decided: {},
    voice: { mode: null, text: '', tiles: [] }, marks: {} });
  let s = fresh();
  const KEY = 'unwriting-her:proto1';
  try { const raw = localStorage.getItem(KEY); if (raw) s = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage blocked */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } };
  const helpers = {
    hear: id => { if (!s.heard.includes(id)) s.heard.push(id); },
    flag: f => { if (!s.flags.includes(f)) s.flags.push(f); },
    erase: k => { if (!s.erased.includes(k)) s.erased.push(k); }
  };

  /* ------------------------------------------------------------ small helpers */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style') n.setAttribute('style', v);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => { if (c == null || c === false) return; n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  }
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CLUE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const strip = t => String(t).replace(CLUE, '$1');
  const interp = t => { const v = S.vars(s); return String(t).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)); };
  const inline = t => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  function rich(t, live) {
    return interp(t).split(/\n\n/).map(par => {
      let out = '', last = 0, m; CLUE.lastIndex = 0;
      while ((m = CLUE.exec(par))) {
        out += inline(par.slice(last, m.index));
        out += live ? `<span class="clue${s.opened.includes(m[2]) ? ' seen' : ''}" role="button" tabindex="0" data-clue="${esc(m[2])}">${inline(m[1])}</span>` : inline(m[1]);
        last = CLUE.lastIndex;
      }
      return '<p>' + out + inline(par.slice(last)) + '</p>';
    }).join('');
  }
  const TIER = { text: 'Verbatim', annotation: 'Annotation', context: 'Outside the novel', criticism: 'Criticism', conjecture: 'Conjecture · not in the novel', margin: 'Your hand' };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const tilt = () => rnd(-1.2, 1.4).toFixed(2) + 'deg';
  let toastT;
  const toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  document.body.append(toastEl);
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600); }

  let hud, hintEl;
  function frame(left, right) {
    app.innerHTML = '';
    hud = el('div', { class: 'hud' }, el('span', { class: 'hud-l', text: left }), el('span', { class: 'hud-r' },
      el('span', { class: 'hud-count', text: right || '' }),
      el('button', { type: 'button', class: 'hud-btn', onclick: restart }, 'Start over')));
    hintEl = el('p', { class: 'hint', 'aria-live': 'polite' });
    return { hud, hintEl };
  }
  function hint(t) { if (!hintEl) return; hintEl.textContent = t; hintEl.classList.remove('fresh'); void hintEl.offsetWidth; hintEl.classList.add('fresh'); }
  function count(t) { const c = hud && hud.querySelector('.hud-count'); if (c) c.textContent = t; }
  function restart() { s = fresh(); save(); closeOverlay(true); showThreshold(); }

  function titleCard(k, t, c, then) {
    if (reduce) { then(); return; }
    const tc = el('div', { class: 'titlecard', 'aria-hidden': 'true' }, el('p', { class: 'k', text: k }), el('p', { class: 't', text: t }), c ? el('p', { class: 'c', text: c }) : null);
    let done = false;
    const end = () => { if (done) return; done = true; tc.classList.add('out'); setTimeout(() => tc.remove(), 700); then(); };
    tc.addEventListener('click', end);
    document.body.append(tc);
    setTimeout(end, 1700);
  }

  /* ============================================================ BLOCKS ON PAPER */
  function addRecord(id, b) { if (!s.record.some(r => r.id === id)) s.record.push({ id, who: b.who, cite: b.cite, text: strip(b.text) }); }
  function renderGlass(r) {
    return el('div', { class: 'glass' },
      el('p', { class: 'glass-cap' }, el('span', { text: 'In the glass' }), el('span', { text: r.cite || '' })),
      el('div', { class: 'panes' },
        el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Her' }), el('span', { class: 'pane-t', html: inline(r.her) })),
        el('i', { 'aria-hidden': 'true' }),
        el('div', { class: 'pane' }, el('span', { class: 'pane-k', text: r.who }), el('span', { class: 'pane-t', html: inline(r.other) }))));
  }
  function slip(tier, by, text, extra) {
    return el('aside', { class: 'slip', 'data-tier': tier, style: `--sr:${tilt()}` },
      el('p', { class: 'slip-cap' }, el('span', { class: 'tier', 'data-tier': tier, text: tier === 'margin' && extra ? extra : TIER[tier] }), by ? el('span', { text: by }) : null),
      el('div', { class: 'slip-body', html: rich(text, false) }));
  }
  function block(raw, rid) {
    const b = typeof raw === 'function' ? raw(s) : raw;
    if (!b) return null;
    switch (b.t) {
      case 'p': return el('div', { class: 'nar', html: rich(b.text, true) });
      case 'h': return el('h4', { class: 'subh', text: b.text });
      case 'q': {
        addRecord(rid, b);
        return el('figure', { class: 'q' + (b.doc ? ' doc' : '') },
          el('figcaption', { class: 'cap' }, el('span', { class: 't', text: 'Verbatim' }), el('span', { text: b.cite }), el('span', { text: b.who })),
          el('blockquote', { html: rich(b.text, true) }));
      }
      case 'mirror': {
        addRecord(rid, b);
        const fig = el('figure', { class: 'q mirror' },
          el('figcaption', { class: 'cap' }, el('span', { class: 't', text: 'Verbatim' }), el('span', { text: b.cite }), el('span', { text: b.who + ' · tap to turn it round' })),
          el('blockquote', {}, el('span', { class: 'mir', html: inline(b.text) })));
        fig.querySelector('blockquote').addEventListener('click', () => fig.classList.toggle('turned'));
        return fig;
      }
      case 'note': return slip(b.tier, b.by, b.text);
      case 'reflect': { const r = S.reflections[b.id]; if (!r) return null; if (!s.reflections.includes(b.id)) s.reflections.push(b.id); return renderGlass(r); }
      case 'list': return el('ul', { class: 'plain' }, b.items.map(x => el('li', { html: inline(x) })));
      case 'check': return checkCard(b);
      case 'crossx': return crossCard(b.w);
      case 'gate': return null;
      default: return null;
    }
  }
  function blocksInto(body, blocks, prefix) {
    blocks.forEach((raw, j) => {
      const node = block(raw, `${prefix}.${j}`);
      if (!node) return;
      const wrap = el('div', { class: 'blk' }, node);
      if (node.querySelector && node.querySelector('.clue')) wrap.append(el('div', { class: 'slips' }));
      body.append(wrap);
    });
  }

  /* notes behind the dotted underlines open as typed slips clipped to the page */
  document.addEventListener('click', e => {
    const x = e.target.closest('.slip-x');
    if (x) { const sl = x.closest('.slip'); const id = sl.dataset.clue; sl.remove(); document.querySelectorAll(`.clue[data-clue="${id}"]`).forEach(c => c.classList.remove('on')); return; }
    const c = e.target.closest('.clue');
    if (c) toggleClue(c);
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('clue')) { e.preventDefault(); toggleClue(e.target); } });
  function toggleClue(c) {
    const id = c.dataset.clue, note = S.clues[id];
    const holder = c.closest('.blk') && c.closest('.blk').querySelector('.slips');
    if (!note || !holder) return;
    const open = holder.querySelector(`.slip[data-clue="${id}"]`);
    if (open) { open.remove(); c.classList.remove('on'); return; }
    if (!s.opened.includes(id)) s.opened.push(id);
    c.classList.add('on', 'seen');
    const sl = slip(note.tier, note.by, note.text);
    sl.dataset.clue = id;
    sl.append(el('button', { type: 'button', class: 'slip-x', 'aria-label': 'Unclip this note' }, '×'));
    if (note.reflect && S.reflections[note.reflect]) {
      if (!s.reflections.includes(note.reflect)) { s.reflections.push(note.reflect); toast('Something appeared in the glass.'); }
      sl.append(el('div', { style: 'margin-top:.7rem' }, renderGlass(S.reflections[note.reflect])));
    }
    holder.append(sl);
    save();
  }

  /* reader: is it in the text, or in you? */
  function checkCard(b) {
    const card = el('div', { class: 'check' }, el('p', { class: 'check-k', text: 'A reader’s check' }), el('p', { class: 'check-c', text: b.claim }));
    const show = () => {
      const ok = s.checks[b.id];
      card.append(el('span', { class: 'imprint blue', style: `left:84%;top:16%;--ir:${rnd(-10, 6).toFixed(1)}deg`, text: ok ? 'Read rightly' : (b.answer === 'reading' ? 'Your reading' : 'In the text') }),
        el('div', { class: 'slip-body', style: 'font-size:.97rem', html: rich(b.note, false) }));
    };
    if (b.id in s.checks) { show(); return card; }
    const row = el('div', { class: 'check-row' },
      el('button', { type: 'button', class: 'mini', onclick: () => pick('text') }, 'In the text'),
      el('button', { type: 'button', class: 'mini', onclick: () => pick('reading') }, 'My reading'));
    function pick(a) { s.checks[b.id] = a === b.answer; save(); row.remove(); show(); }
    card.append(row);
    return card;
  }
  /* judge: one question, answered only from the record */
  function crossCard(w) {
    const qs = S.crossx[w];
    if (!qs) return null;
    const box = el('div', { class: 'reading' }, el('p', { class: 'reading-q', text: 'Put one question to this witness.' }));
    const answer = i => {
      const q = qs[i];
      box.append(el('p', { class: 'nar', html: `<p>You ask: <em>${esc(q.q)}</em></p>` }));
      if (q.a) { const n = block(q.a, `cross.${w}`); if (n) box.append(n); }
      else box.append(el('p', { class: 'nar', html: '<p>No answer. The record holds nothing this witness could say.</p>' }));
    };
    if (s.crossx[w] !== undefined) { answer(s.crossx[w]); return box; }
    const cards = el('div', { class: 'cards' }, qs.map((q, i) => el('button', { type: 'button', class: 'card', style: `--cr:${tilt()}`, onclick: () => { s.crossx[w] = i; save(); cards.remove(); answer(i); } }, el('span', { class: 'cl', text: q.q }))));
    box.append(cards);
    return box;
  }

  /* ============================================================ THE SHEET YOU HOLD */
  let overlay = null, rail = null, sheetEl = null;
  function openOverlay() {
    closeOverlay(true);
    overlay = el('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' });
    const desk = el('div', { class: 'desk' });
    rail = el('div', { class: 'rail' });
    desk.append(el('div', { style: 'display:contents' }), rail);
    overlay.append(desk);
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target === desk) closeOverlay(); });
    document.body.append(overlay);
    return desk;
  }
  let onClose = null;
  function closeOverlay(silent) {
    if (!overlay) return;
    const o = overlay; overlay = null; sheetEl = null;
    if (silent) o.remove(); else { o.classList.add('closing'); setTimeout(() => o.remove(), 300); }
    const f = onClose; onClose = null;
    if (!silent && f) f();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay) closeOverlay(); });
  function newSheet(desk, opts) {
    const old = desk.querySelector('.sheet');
    const sh = el('article', { class: 'sheet paper' });
    sh.append(el('button', { type: 'button', class: 'sheet-close', onclick: () => closeOverlay() }, opts.closeLabel || 'Put it down ×'));
    const head = el('header', { class: 'sheet-head' },
      el('p', { class: 'sheet-kicker', text: opts.kicker || '' }),
      el('h2', { class: 'sheet-title', text: opts.title || '' }),
      opts.cite ? el('p', { class: 'sheet-cite', text: opts.cite }) : null,
      opts.staged ? el('p', { class: 'staged', text: opts.staged }) : null);
    const body = el('div', { class: 'sheet-body' });
    const foot = el('footer', { class: 'sheet-foot' });
    sh.append(head, body, foot);
    if (old) { old.classList.add('turn-out'); setTimeout(() => { old.replaceWith(sh); afterSheet(sh); }, reduce ? 0 : 420); }
    else { desk.prepend(sh); afterSheet(sh); }
    sheetEl = sh;
    overlay.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    return { sh, body, foot };
  }
  function afterSheet(sh) { if (s.role === 'reader' && sh.dataset.key) attachMarks(sh); }

  /* ------------------------------------------------ rubber stamps */
  function stampRack(label, options, onPick) {
    rail.innerHTML = '';
    rail.append(el('p', { class: 'rail-label', text: label }));
    options.forEach(o => {
      const st = el('button', { type: 'button', class: 'stamp', 'aria-label': 'Stamp: ' + o.label },
        el('span', { class: 'handle' }), el('span', { class: 'base' }, el('b', { text: o.label })));
      draggable(st, (x, y, onSheet) => onPick(o, onSheet ? { x, y } : null));
      rail.append(st);
    });
  }
  function draggable(node, drop) {
    let start = null, ghost = null;
    node.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY };
      node.setPointerCapture(e.pointerId);
    });
    node.addEventListener('pointermove', e => {
      if (!start) return;
      if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) {
        ghost = node.cloneNode(true); ghost.classList.add('ghost-stamp'); document.body.append(ghost);
      }
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
    });
    const end = e => {
      if (!start) return;
      const wasDrag = !!ghost;
      if (ghost) ghost.remove(); ghost = null; start = null;
      if (e.type === 'pointercancel') return;
      if (wasDrag) {
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const sh = hit && hit.closest('.sheet');
        if (sh) { const r = sh.getBoundingClientRect(); drop(e.clientX - r.left, e.clientY - r.top, true); }
      } else drop(0, 0, false);
    };
    node.addEventListener('pointerup', end);
    node.addEventListener('pointercancel', end);
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(0, 0, false); } });
  }
  function imprint(sh, text, at, anchor) {
    let x, y;
    if (at) { x = at.x; y = at.y; }
    else { const r = sh.getBoundingClientRect(), a = anchor.getBoundingClientRect(); x = a.left - r.left + a.width * 0.7; y = a.top - r.top + 22; }
    const im = el('span', { class: 'imprint', style: `left:${x}px;top:${y}px;--ir:${rnd(-12, 8).toFixed(1)}deg`, text });
    sh.append(im);
    return im;
  }

  /* ------------------------------------------------ the reader's red pencil */
  function attachMarks(sh) {
    if (sh.querySelector('canvas.marks')) return;
    const cv = el('canvas', { class: 'marks', 'aria-hidden': 'true' });
    sh.append(cv);
    const key = sh.dataset.key;
    const ctx = cv.getContext('2d');
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = sh.offsetWidth * dpr; cv.height = sh.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(176, 52, 40, 0.82)'; ctx.lineWidth = 2.2;
      (s.marks[key] || []).forEach(st => { ctx.beginPath(); st.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); });
    };
    let cur = null;
    cv.addEventListener('pointerdown', e => { const r = sh.getBoundingClientRect(); cur = [[e.clientX - r.left, e.clientY - r.top]]; (s.marks[key] = s.marks[key] || []).push(cur); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!cur) return; const r = sh.getBoundingClientRect(); cur.push([e.clientX - r.left, e.clientY - r.top]); draw(); });
    const up = () => { if (cur) { cur = null; save(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    new ResizeObserver(draw).observe(sh);
    requestAnimationFrame(draw);
  }
  function pencilTool() {
    if (s.role !== 'reader') return null;
    const b = el('button', { type: 'button', class: 'pencil-tool', 'aria-pressed': 'false', title: 'Mark the page with the red pencil' }, el('i'));
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (sheetEl) sheetEl.classList.toggle('drawing', on);
      toast(on ? 'The pencil is in your hand. Underline, circle, write.' : 'Pencil down.');
    });
    return el('div', { style: 'display:grid;justify-items:center;gap:.3rem' }, b, el('p', { class: 'rail-label', style: 'font-size:1.1rem', text: 'red pencil' }));
  }

  /* ============================================================ SCENE 01 · THE THRESHOLD */
  const TOOLS = {
    reader: `<svg viewBox="0 0 200 160"><circle cx="78" cy="70" r="46" fill="rgba(170,195,219,.12)" stroke="#b9a27a" stroke-width="9"/><circle cx="78" cy="70" r="46" fill="none" stroke="#6e5c47" stroke-width="2"/><path d="M62,48 C70,40 84,38 94,44" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M112,104 L168,148" stroke="#3a2a1c" stroke-width="16" stroke-linecap="round"/><path d="M112,104 L124,114" stroke="#b9a27a" stroke-width="18"/></svg>`,
    judge: `<svg viewBox="0 0 200 160"><path d="M86,20 Q100,10 114,20 L118,92 L82,92Z" fill="#5a4029"/><path d="M90,26 Q100,20 110,26" stroke="#8a6a48" stroke-width="3" fill="none"/><rect x="66" y="92" width="68" height="16" rx="3" fill="#8d7a5a"/><ellipse cx="100" cy="128" rx="40" ry="16" fill="#8e2a22"/><ellipse cx="100" cy="124" rx="34" ry="12" fill="#b8473a"/><text x="100" y="129" text-anchor="middle" font-family="IM Fell English, serif" font-size="16" fill="#5a1712">J</text></svg>`,
    rescuer: `<svg viewBox="0 0 200 160"><circle cx="58" cy="80" r="30" fill="none" stroke="#b9a27a" stroke-width="10"/><circle cx="58" cy="80" r="12" fill="none" stroke="#6e5c47" stroke-width="3"/><rect x="86" y="74" width="96" height="12" rx="3" fill="#b9a27a"/><rect x="150" y="86" width="10" height="22" fill="#b9a27a"/><rect x="166" y="86" width="10" height="16" fill="#b9a27a"/></svg>`
  };
  function showThreshold() {
    s.scene = 'threshold'; save();
    frame('Scene 01 — The Threshold', 'Prototype · 3 scenes');
    const top = el('div', { class: 'tabletop' });
    const intro = el('div', { class: 'obj paper', style: '--x:50%;--y:27%;--r:-1deg;--px:50%;--py:33%;width:min(560px,86vw);padding:1.2rem 1.4rem;font-size:.95em;box-shadow:0 20px 30px -12px rgba(0,0,0,.8)' });
    const th = S.scenes.threshold.beats[0].blocks;
    blocksInto(intro, th.filter(b => b.t === 'p' && !b.small).slice(0, 3), 'threshold');
    top.append(intro);
    const spots = { reader: ['26%', '72%', '-8deg', '24%', '70%'], judge: ['50%', '74%', '3deg', '50%', '80%'], rescuer: ['74%', '70%', '10deg', '76%', '70%'] };
    const label = { reader: 'a reading glass', judge: 'a seal', rescuer: 'a key' };
    ['reader', 'judge', 'rescuer'].forEach(r => {
      const [x, y, rot, px, py] = spots[r];
      const t = el('button', { type: 'button', class: 'obj tool live' + (s.role === r ? ' chosen' : s.role ? ' unchosen' : ''), style: `--x:${x};--y:${y};--r:${rot};--px:${px};--py:${py};border:0;background:none;padding:0`, 'aria-label': `Pick up ${label[r]}: ${r}`, html: TOOLS[r] },
        el('span', { class: 'tag', text: label[r] }));
      t.addEventListener('click', () => pickRole(r));
      top.append(t);
    });
    app.append(top, hud, hintEl);
    hint('pick one up');
  }
  function pickRole(r) {
    s.role = r; save();
    const desk = openOverlay();
    const choice = S.scenes.threshold.beats[0].choices.find(c => c.label.toLowerCase().includes(r));
    const { body, foot } = newSheet(desk, { kicker: 'Scene 01 — The Threshold', title: choice ? choice.label : r, cite: choice ? choice.sub : '' });
    blocksInto(body, S.scenes.threshold.beats[1].blocks.slice(0, 3), 'threshold.1');
    body.append(el('p', { class: 'nar', html: '<p>In this prototype you go straight to the hearing. The corridor and the roof, the last night and the endings are in the full game.</p>' }));
    foot.append(el('button', { type: 'button', class: 'turn', onclick: () => closeOverlay(true) || showThreshold() }, '← choose again'),
      el('button', { type: 'button', class: 'turn', onclick: () => { closeOverlay(true); titleCard('Scene 03 — after Chapter XXVI', 'The Hearing', 'Thornfield Hall', showHearing); } }, 'go down to the hall →'));
    onClose = showThreshold;
  }

  /* ============================================================ SCENE 03 · THE HEARING */
  const ENV = {
    rochester: { x: '21%', y: '33%', r: '-7deg', px: '28%', py: '17%', pr: '-5deg', name: 'Mr. Rochester', seal: 'R', rel: 'her husband' },
    mason: { x: '39%', y: '23%', r: '4deg', px: '72%', py: '16%', pr: '4deg', name: 'Mr. Mason', seal: 'M', rel: 'her brother' },
    grace: { x: '59%', y: '25%', r: '-3deg', px: '28%', py: '33%', pr: '3deg', name: 'Grace Poole', seal: 'P', rel: 'her keeper' },
    jane: { x: '74%', y: '35%', r: '7deg', px: '72%', py: '32%', pr: '-4deg', name: 'Miss Eyre', seal: 'E', rel: 'the other bride' },
    register: { x: '28%', y: '63%', r: '5deg', px: '28%', py: '49%', pr: '-3deg', name: 'The register', seal: '§', rel: 'a document' },
    host: { x: '50%', y: '60%', r: '-6deg', px: '72%', py: '48%', pr: '5deg', name: 'The landlord', seal: 'A', rel: 'a neighbour' },
    author: { x: '71%', y: '64%', r: '3deg', px: '28%', py: '65%', pr: '4deg', name: 'Currer Bell', seal: 'B', rel: 'her author' }
  };
  const witness = id => S.witnesses.find(w => w.id === id);
  const limit = () => (S.witnessLimit ? S.witnessLimit(s) : null);
  const isNight = w => s.role === 'rescuer' && w.rescue && !s.decided[w.id];
  function showHearing() {
    s.scene = 'hearing'; save();
    frame('Scene 03 — The Hearing', '');
    const top = el('div', { class: 'tabletop' });
    S.witnesses.forEach(w => top.append(envelope(w)));
    // her portrait, covered
    const por = el('button', { type: 'button', class: 'obj portrait live', style: '--x:91%;--y:45%;--r:3deg;--px:85%;--py:77%;border:0;background:none;padding:0', 'aria-label': 'A covered portrait: ' + S.missingWitness.name },
      el('span', { class: 'frame' }), el('span', { class: 'cloth' }), el('span', { class: 'tag', text: 'not called' }));
    por.addEventListener('click', () => { por.classList.remove('shiver'); void por.offsetWidth; por.classList.add('shiver'); paperNote(S.missingWitness.name, S.missingWitness.rel, S.missingWitness.text); });
    top.append(por);
    // the summons: Rochester's demand
    const summons = el('button', { type: 'button', class: 'obj summons paper live', style: '--x:11%;--y:62%;--r:-4deg;--px:72%;--py:66%;--pr:3deg;border:0;text-align:left', 'aria-label': 'Rochester’s demand' },
      el('b', { text: 'Ch. XXVI · Rochester' }), '“Compare these clear eyes with the red balls yonder…”');
    summons.addEventListener('click', openSummons);
    top.append(summons);
    // the ledger
    const led = el('button', { type: 'button', class: 'obj ledger', style: '--x:89%;--y:76%;--r:-4deg;--px:52%;--py:78%;border:0;padding:0', 'aria-label': 'The finding ledger' }, el('span', { text: 'FINDING' }));
    led.addEventListener('click', () => { if (s.heard.length < 2) toast('Hear at least two witnesses first.'); else openFinding(); });
    top.append(led);
    // role objects
    if (s.role === 'judge') {
      const left = Math.max(0, 4 - s.heard.length);
      top.append(el('div', { class: 'obj candle' + (left ? '' : ' out'), style: `--x:9%;--y:28%;--px:15%;--py:79%;--h:${(left / 4).toFixed(2)}`, 'aria-label': `The court’s candle: ${left} witnesses left` },
        el('span', { class: 'halo' }), el('span', { class: 'stick' }), el('span', { class: 'flame' }), el('span', { class: 'smoke' }), el('span', { class: 'dish' }), el('span', { class: 'tag', text: left ? `${left} left` : 'out' })));
    }
    if (s.role === 'reader') top.append(el('div', { class: 'obj pencil-obj', style: '--x:12%;--y:86%;--r:-14deg;--px:14%;--py:88%;--pr:-30deg', 'aria-hidden': 'true' }));
    if (s.role === 'rescuer') top.append(el('div', { class: 'obj key-obj', style: '--x:10%;--y:30%;--r:-20deg;--px:15%;--py:77%;--pr:-40deg', html: TOOLS.rescuer.replace('viewBox="0 0 200 160"', 'viewBox="20 40 170 80"'), 'aria-hidden': 'true' }));
    app.append(top, hud, hintEl);
    refreshHearing();
    if (!s.flags.includes('summoned')) { s.flags.push('summoned'); save(); setTimeout(openSummons, reduce ? 0 : 500); }
  }
  function envelope(w) {
    const p = ENV[w.id];
    const env = el('button', { type: 'button', class: 'obj env', 'data-w': w.id, style: `--x:${p.x};--y:${p.y};--r:${p.r};--px:${p.px};--py:${p.py};--pr:${p.pr};border:0;background:none;padding:0`, 'aria-label': `${w.name}, ${w.rel}` },
      el('span', { class: 'env-body paper' }, el('span', { class: 'env-peek paper' })),
      el('span', { class: 'env-flap' }),
      el('span', { class: 'env-front' }, el('span', { class: 'env-name', text: p.name }), el('span', { class: 'env-rel', text: p.rel })),
      el('span', { class: 'seal', text: p.seal }));
    env.addEventListener('click', () => openEnvelope(w, env));
    return env;
  }
  function refreshHearing() {
    const L = limit();
    document.querySelectorAll('.env').forEach(env => {
      const w = witness(env.dataset.w);
      const heard = s.heard.includes(w.id);
      env.classList.toggle('open', heard);
      env.classList.toggle('night', isNight(w));
      const closed = L && !heard && s.heard.length >= L;
      env.classList.toggle('dead', !!closed);
      env.classList.toggle('live', !closed);
      env.querySelectorAll('.env-stamp, .env-note').forEach(n => n.remove());
      const prevented = (w.id === 'mason' && s.erased.includes('bite')) || (w.id === 'grace' && s.erased.includes('bedfire')) || (w.id === 'jane' && s.erased.includes('veil'));
      if (prevented) env.append(el('span', { class: 'env-stamp', text: 'PREVENTED' }));
      else if (isNight(w)) env.append(el('span', { class: 'env-note', text: 'tonight' }));
    });
    const led = document.querySelector('.ledger');
    if (led) { led.classList.toggle('live', s.heard.length >= 2); led.classList.toggle('beckon', s.heard.length >= 2 && !s.finding); led.classList.toggle('dead', s.heard.length < 2); }
    if (s.role === 'judge') count(`${s.heard.length} of 4 heard · candle ${Math.max(0, 4 - s.heard.length)}`);
    else if (s.role === 'rescuer') count(`${s.heard.length} of 7 heard · ${s.erased.length} prevented`);
    else count(`${s.heard.length} of 7 heard`);
    if (s.heard.length === 0) hint(s.role === 'rescuer' ? 'break a seal · the black ones haven’t happened yet' : 'break a seal to hear a witness');
    else if (s.heard.length < 2) hint('hear one more, then open the ledger');
    else hint(s.role === 'judge' && s.heard.length >= 4 ? 'the candle is out · open the ledger' : 'hear more, or open the ledger and rule');
  }
  function paperNote(title, kicker, text) {
    const desk = openOverlay();
    const { body } = newSheet(desk, { kicker, title });
    body.append(el('div', { class: 'nar', html: rich(text, false) }));
    onClose = null;
  }
  function openSummons() {
    const desk = openOverlay();
    const sc = S.scenes.hearing;
    const { body, foot } = newSheet(desk, { kicker: 'Scene 03 — ' + sc.cite, title: sc.title, staged: sc.staged });
    blocksInto(body, sc.beats[0].blocks.filter(b => !(b && b.t === 'witnesses')), 'hearing');
    foot.append(el('span', { class: 'pg', text: 'Rochester’s demand' }), el('button', { type: 'button', class: 'turn', onclick: () => closeOverlay() }, 'set it down →'));
    onClose = refreshHearing;
  }

  function openEnvelope(w, env) {
    const L = limit();
    if (!s.heard.includes(w.id) && L && s.heard.length >= L) { toast('The candle is out. The court can hear no one else.'); return; }
    env.classList.add('open');
    setTimeout(() => {
      if (isNight(w)) return openNight(w);
      openLetter(w.scene, w.id);
    }, reduce ? 0 : 650);
  }
  function openNight(w) {
    const x = S.scenes[w.rescue];
    const desk = openOverlay();
    const { body } = newSheet(desk, { kicker: x.place, title: x.title, cite: x.cite, staged: x.staged });
    blocksInto(body, x.beats[0].blocks, w.rescue);
    const cards = el('div', { class: 'cards' }, x.beats[0].choices.map(c => {
      const b = el('button', { type: 'button', class: 'card', style: `--cr:${tilt()}` }, el('span', { class: 'cl', text: c.label }), el('span', { class: 'cs', text: c.sub || '' }));
      b.addEventListener('click', () => {
        s.decided[w.id] = true;
        if (c.set) c.set(s, helpers);
        helpers.hear(w.id); save();
        if (c.to === w.scene) openLetter(w.scene, w.id, true);
        else openRescued(c.to, w);
      });
      return b;
    }));
    body.append(cards);
    onClose = () => { refreshHearing(); };
  }
  function openRescued(id, w) {
    const r = S.scenes[id];
    const desk = overlay ? overlay.querySelector('.desk') : openOverlay();
    rail.innerHTML = '';
    const { body, foot } = newSheet(desk, { kicker: r.place, title: r.title, cite: r.cite, staged: r.staged });
    blocksInto(body, r.beats[0].blocks, id);
    foot.append(el('span', { class: 'pg', text: 'prevented' }), el('button', { type: 'button', class: 'turn', onclick: () => closeOverlay() }, 'fold it away →'));
    toast('You stopped it. Something left the record.');
    onClose = refreshHearing;
  }

  /* a witness's letter: one page per part of the testimony */
  function openLetter(sceneId, wid, keepDesk) {
    const sc = S.scenes[sceneId];
    if (!s.visited.includes(sceneId)) s.visited.push(sceneId);
    if (sc.onEnter) sc.onEnter(s, helpers);
    helpers.hear(wid); save();
    const desk = keepDesk && overlay ? overlay.querySelector('.desk') : openOverlay();
    let i = 0;
    const pages = sc.beats;
    const page = () => {
      const b = pages[i];
      const { sh, body, foot } = newSheet(desk, { kicker: 'Testimony · ' + (witness(wid) || {}).rel, title: sc.title, cite: sc.cite, staged: i === 0 ? sc.staged : null });
      sh.dataset.key = `${sceneId}.${i}`;
      if (s.role === 'reader') afterSheet(sh);
      blocksInto(body, b.blocks, `${sceneId}.${i}`);
      rail.innerHTML = '';
      const pen = pencilTool();
      let waiting = false;
      if (b.reading) {
        const r = b.reading, labels = r.labels || S.readLabels;
        const box = el('section', { class: 'reading' }, el('p', { class: 'reading-q', text: r.prompt }));
        body.append(box);
        const done = (o, at) => {
          s.readings[r.id] = o.k; save();
          imprint(sh, labels[o.k], at, box.querySelector('.reading-q'));
          box.querySelector('.legend') && box.querySelector('.legend').remove();
          box.append(slip(o.tier || 'annotation', o.by, o.text));
          rail.innerHTML = ''; if (pen) rail.append(pen);
          turnBtn.disabled = false; ear.disabled = i >= pages.length - 1;
          if (waitEl) waitEl.remove();
        };
        if (s.readings[r.id]) {
          const o = r.options.find(x => x.k === s.readings[r.id]);
          requestAnimationFrame(() => imprint(sh, labels[o.k], null, box.querySelector('.reading-q')));
          box.append(slip(o.tier || 'annotation', o.by, o.text));
        } else {
          waiting = true;
          box.append(el('ul', { class: 'legend' }, r.options.map(o => el('li', {}, el('button', { type: 'button', onclick: () => done(o, null) }, el('span', { class: 'lk', text: labels[o.k] }), el('span', { class: 'ls', text: o.sub }))))));
          stampRack('press a stamp onto the page', r.options.map(o => ({ k: o.k, label: labels[o.k], o })), (st, at) => done(st.o, at));
        }
      }
      if (pen && !waiting) rail.append(pen);
      else if (pen) rail.append(pen);
      const last = i >= pages.length - 1;
      const turnBtn = el('button', { type: 'button', class: 'turn', disabled: waiting, onclick: () => { if (last) closeOverlay(); else { i++; page(); } } }, last ? 'fold it away →' : 'turn the page →');
      const back = el('button', { type: 'button', class: 'turn', disabled: i === 0, onclick: () => { i--; page(); } }, '←');
      const waitEl = waiting ? el('p', { class: 'wait', text: 'stamp it to go on' }) : null;
      foot.append(back, el('span', { class: 'pg', text: `page ${i + 1} of ${pages.length}` }), waitEl || turnBtn);
      if (waitEl) waitEl.after(turnBtn), turnBtn.hidden = false;
      const ear = el('button', { type: 'button', class: 'dogear', disabled: waiting || last, 'aria-label': 'Lift the corner and turn the page', onclick: () => { i++; page(); } });
      sh.append(ear);
      if (waiting) { turnBtn.disabled = true; }
    };
    page();
    onClose = refreshHearing;
  }

  /* the ledger: cite, then rule */
  function openFinding() {
    const sc = S.scenes.finding;
    const desk = openOverlay();
    const { sh, body, foot } = newSheet(desk, { kicker: 'The ledger', title: sc.title, cite: sc.cite, staged: sc.staged });
    blocksInto(body, sc.beats[0].blocks.filter(b => !(b && b.t === 'cite')).slice(0, 3), 'finding');
    const quotes = s.record.filter(r => r.who);
    const need = s.role === 'judge' ? 2 : 0;
    const citeBox = el('section', { class: 'reading' }, el('p', { class: 'reading-q', text: need ? 'Clip two passages to the ledger as your evidence.' : 'Clip evidence to the ledger, if you like.' }));
    const list = el('div', { class: 'cite-list' });
    const drawCites = () => {
      list.innerHTML = '';
      quotes.forEach(r => {
        const on = s.cited.includes(r.id);
        list.append(el('button', { type: 'button', class: 'cite' + (on ? ' on' : ''), 'aria-pressed': String(on), onclick: () => {
          if (on) s.cited = s.cited.filter(x => x !== r.id); else if (s.cited.length < 2) s.cited.push(r.id); else { toast('Two is enough. Unclip one first.'); return; }
          save(); drawCites(); drawRack();
        } }, el('small', { text: `${r.who} · ${r.cite}` }), el('span', { text: r.text.length > 150 ? r.text.slice(0, 148) + '…' : r.text })));
      });
    };
    citeBox.append(list); body.append(citeBox); drawCites();
    const findings = sc.beats[0].choices;
    const drawRack = () => {
      rail.innerHTML = '';
      if (s.cited.length < need) { rail.append(el('p', { class: 'rail-label', text: `clip ${need - s.cited.length} more` })); return; }
      stampRack('stamp your finding', findings.map(c => ({ label: c.label.length > 22 ? 'Not competent' : c.label, c })), (st, at) => {
        st.c.set(s, helpers); save();
        imprint(sh, st.label, at, citeBox.querySelector('.reading-q'));
        rail.innerHTML = '';
        foot.innerHTML = '';
        foot.append(el('span', { class: 'pg', text: 'entered' }), el('button', { type: 'button', class: 'turn', onclick: openStair }, 'climb the stairs →'));
      });
    };
    drawRack();
    foot.append(el('span', { class: 'pg', text: 'the finding' }));
    onClose = refreshHearing;
  }
  function openStair() {
    const sc = S.scenes.stair;
    const desk = overlay.querySelector('.desk');
    rail.innerHTML = '';
    const { body, foot } = newSheet(desk, { kicker: sc.place, title: sc.title, cite: sc.cite, staged: sc.staged });
    blocksInto(body, sc.beats[0].blocks, 'stair');
    foot.append(el('span', { class: 'pg', text: '' }), el('button', { type: 'button', class: 'turn', onclick: () => { onClose = null; closeOverlay(true); titleCard('Scene 06 — after Chapter XXVI', 'A Room Without a Window', 'The third storey', showRoom); } }, 'go in →'));
    onClose = null;
  }

  /* ============================================================ SCENE 06 · THE ROOM */
  const SIL = `<g class="silhouette" pointer-events="none">
    <filter id="sketch"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
    <path d="M556,792 C590,770 650,770 694,792 L700,800 L548,800Z" fill="#060505"/>
    <path d="M588,606 C566,626 560,700 572,776 L672,776 C684,700 678,626 656,606Z" fill="#070606"/>
    <path d="M572,724 C574,668 608,652 622,672 C636,652 676,664 678,724Z" fill="#090808"/>
    <path d="M596,514 C590,480 652,480 648,516 C658,560 662,612 652,660 L592,662 C580,612 584,560 596,514Z" fill="#040303"/>
    <g fill="none" stroke="#9c907e" stroke-linecap="round" filter="url(#sketch)" opacity=".55">
      <path d="M596,514 C590,480 652,480 648,516 C658,560 662,612 652,660" stroke-width="1.6"/>
      <path d="M598,520 C592,488 650,486 646,518 C654,566 658,610 650,656" stroke-width="1" opacity=".6"/>
      <path d="M596,514 C584,560 580,612 592,662" stroke-width="1.6"/>
      <path d="M610,520 C606,570 604,610 612,660 M626,516 C626,566 630,612 628,664 M640,520 C644,566 646,610 640,660" stroke-width=".8" opacity=".55"/>
      <path d="M588,606 C566,626 560,700 572,776 M656,606 C678,626 684,700 672,776" stroke-width="1.4"/>
      <path d="M572,724 C574,668 608,652 622,672 C636,652 676,664 678,724" stroke-width="1.4"/>
      <path d="M582,700 C600,690 650,690 668,702" stroke-width="1" opacity=".7"/>
      <path d="M556,792 C590,770 650,770 694,792" stroke-width="1.2"/>
    </g>
  </g>`;
  /* where each thing sits in the room drawing (its own 1000-unit coordinates) */
  const ZONES = { fire: [70, 450, 290, 330], lamp: [470, 0, 100, 340], tapestry: [690, 180, 245, 580], window: [420, 380, 150, 190], pocket: [320, 650, 200, 250], her: [500, 480, 250, 320] };
  let dwellT = null;
  let roomEl, dark, ctx, light = { x: 0, y: 0 }, hots = [], dwell = { id: null, t: 0 }, raf = null, foundEl = null, trayEl = null, actsEl = null;
  function showRoom() {
    s.scene = 'room'; if (!s.visited.includes('room')) s.visited.push('room'); save();
    frame('Scene 06 — A Room Without a Window', '');
    const sc = S.scenes.room;
    roomEl = el('div', { class: 'room' });
    const art = el('div', { class: 'art', html: window.UH.art.room(s, 0) });
    const svg = art.querySelector('svg');
    const her = svg.querySelector('[data-ex="her"]');
    if (her) { her.insertAdjacentHTML('beforeend', SIL); her.querySelectorAll('ellipse').forEach(e => e.setAttribute('opacity', '.5')); }
    dark = el('canvas', { class: 'dark', 'aria-hidden': 'true' });
    const cand = el('div', { class: 'hand-candle', 'aria-hidden': 'true' }, el('span', { class: 'stick' }), el('span', { class: 'flame' }));
    const glow = el('div', { class: 'warm', 'aria-hidden': 'true' });
    trayEl = el('div', { class: 'tray', 'aria-label': 'Things you have found' });
    actsEl = el('div', { class: 'room-acts' });
    roomEl.append(art, dark, glow, cand, trayEl, actsEl);
    app.append(roomEl, hud, hintEl);
    ctx = dark.getContext('2d');
    const rect = () => roomEl.getBoundingClientRect();
    const measure = () => {
      const R = rect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      dark.width = R.width * dpr; dark.height = R.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const m = svg.getScreenCTM();
      const pt = (x, y) => { x = 500 + (x - 500) * 0.82; y = 600 + (y - 600) * 0.82; return [m.a * x + m.c * y + m.e - R.left, m.b * x + m.d * y + m.f - R.top]; };
      hots = Object.entries(ZONES).map(([id, [x, y, w, h]]) => { const [x0, y0] = pt(x, y), [x1, y1] = pt(x + w, y + h); return { id, x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; });
    };
    const fire = () => hots.find(h => h.id === 'fire');
    const paint = () => {
      raf = null;
      const R = rect();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, R.width, R.height);
      ctx.fillStyle = 'rgba(3, 2, 2, 0.9)'; ctx.fillRect(0, 0, R.width, R.height);
      ctx.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.6, `rgba(0,0,0,${a * 0.85})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
      const f = fire(); if (f) hole(f.cx, f.cy + f.h * 0.3, Math.max(110, f.w * 0.6), 0.8);
      const h = hots.find(x => x.id === 'her');
      let r = Math.max(170, Math.min(R.width, R.height) * 0.34);
      if (h && Math.hypot(light.x - h.cx, light.y - h.cy) < Math.max(h.w, h.h) * 0.7) r *= 0.55;
      hole(light.x, light.y, r, 1);
      cand.style.left = light.x + 'px'; cand.style.top = light.y + 'px';
      glow.style.left = light.x + 'px'; glow.style.top = light.y + 'px'; glow.style.width = glow.style.height = (r * 2.2) + 'px';
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const at = (x, y) => hots.find(hh => x >= hh.x && x <= hh.x + hh.w && y >= hh.y && y <= hh.y + hh.h && hh.id !== 'her') || hots.find(hh => hh.id === 'her' && x >= hh.x && x <= hh.x + hh.w && y >= hh.y && y <= hh.y + hh.h);
    roomEl.addEventListener('pointermove', e => {
      const R = rect(); light.x = e.clientX - R.left; light.y = e.clientY - R.top; queue();
      const h = at(light.x, light.y);
      if (!h) { dwell = { id: null, t: 0 }; clearTimeout(dwellT); return; }
      if (dwell.id !== h.id) {
        dwell = { id: h.id, t: performance.now() };
        clearTimeout(dwellT);
        if (!s.examined.includes(h.id)) dwellT = setTimeout(() => { if (dwell.id === h.id && document.body.contains(roomEl)) reveal(h.id); }, 1000);
      }
    });
    roomEl.addEventListener('click', e => {
      if (e.target.closest('.found, .tray, .room-acts')) return;
      const R = rect(); light.x = e.clientX - R.left; light.y = e.clientY - R.top; queue();
      const h = at(light.x, light.y);
      if (h) reveal(h.id); else if (foundEl) { foundEl.remove(); foundEl = null; }
    });
    const onResize = () => { measure(); queue(); };
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => { measure(); const R = rect(); light = { x: R.width * 0.32, y: R.height * 0.62 }; paint(); drawTray(); drawActs(); });
    hint('carry the light · hold it still to look');
    count(`0 of ${sc.beats[0].examine.length} seen`);
  }
  function reveal(id) {
    const ex = S.scenes.room.beats[0].examine.find(x => x.id === id);
    if (!ex) return;
    if (!s.examined.includes(id)) { s.examined.push(id); if (ex.flag) helpers.flag(ex.flag); save(); }
    if (foundEl) foundEl.remove();
    const h = hots.find(x => x.id === id);
    foundEl = el('div', { class: 'found paper', style: `--fr:${rnd(-2, 2).toFixed(1)}deg` });
    foundEl.append(el('button', { type: 'button', class: 'sheet-close', onclick: () => { foundEl.remove(); foundEl = null; } }, '×'), el('p', { class: 'sheet-kicker', text: ex.label }));
    const body = el('div', { class: 'sheet-body' });
    blocksInto(body, ex.blocks, 'room.' + id);
    foundEl.append(body);
    roomEl.append(foundEl);
    const R = roomEl.getBoundingClientRect(), fw = foundEl.offsetWidth, fh = foundEl.offsetHeight;
    const right = !h || h.cx < R.width / 2;
    let x = h ? (right ? h.x + h.w + 24 : h.x - fw - 24) : R.width / 2 - fw / 2, y = h ? h.cy - fh / 2 : R.height / 3;
    if (x + fw > R.width - 16 || x < 16) x = right ? R.width - fw - 16 : 16;
    foundEl.style.left = Math.max(16, Math.min(x, R.width - fw - 16)) + 'px';
    foundEl.style.top = Math.max(56, Math.min(y, R.height - fh - 70)) + 'px';
    drawTray(); drawActs();
  }
  function drawTray() {
    const ex = S.scenes.room.beats[0].examine;
    trayEl.innerHTML = '';
    s.examined.forEach(id => { const x = ex.find(e => e.id === id); if (x) trayEl.append(el('button', { type: 'button', onclick: () => reveal(id) }, x.label)); });
    count(`${s.examined.length} of ${ex.length} seen`);
  }
  function drawActs() {
    actsEl.innerHTML = '';
    if (s.examined.length < 2) return;
    if (s.finding === 'mad') actsEl.append(el('p', { class: 'locked-note', text: 'You found her mad. In your court, her testimony is inadmissible.' }));
    else actsEl.append(el('button', { type: 'button', class: 'blank-sheet paper', onclick: openName }, 'speak to her'));
    actsEl.append(el('button', { type: 'button', class: 'leave', onclick: () => { s.voice.mode = 'unasked'; save(); endCard(); } }, 'leave without speaking →'));
    hint(s.finding === 'mad' ? 'you can only leave' : 'lay the blank sheet before her, or leave');
  }

  /* her name, then her testimony */
  function openName() {
    const sc = S.scenes.name;
    const desk = openOverlay();
    const { body } = newSheet(desk, { kicker: sc.place, title: sc.title, staged: sc.staged });
    blocksInto(body, sc.beats[0].blocks, 'name');
    body.append(el('p', { class: 'wait', text: 'write one at the top of the sheet' }));
    body.append(el('div', { class: 'cards' }, sc.beats[0].choices.map(c => {
      const why = c.locked ? c.locked(s) : null;
      const b = el('button', { type: 'button', class: 'card' + (why ? ' locked' : ''), style: `--cr:${tilt()}`, 'aria-disabled': why ? 'true' : null }, el('span', { class: 'cl', text: c.label }), el('span', { class: 'cs', text: why || c.sub }));
      b.addEventListener('click', () => { if (why) { toast(why); return; } c.set(s, helpers); save(); openVoice(); });
      return b;
    })));
    onClose = null;
  }
  const PEN = `<svg viewBox="0 0 48 48"><path d="M10,40 L14,30 L34,8 L40,14 L18,36Z" fill="#3d5a78"/><path d="M10,40 L14,30 L18,36Z" fill="#d8bf95"/></svg>`;
  const SCISSORS = `<svg viewBox="0 0 48 48"><circle cx="13" cy="35" r="6" fill="none" stroke="#2a211a" stroke-width="3"/><circle cx="31" cy="37" r="6" fill="none" stroke="#2a211a" stroke-width="3"/><path d="M17,31 L36,6 M27,33 L14,8" stroke="#6b5d48" stroke-width="3" stroke-linecap="round"/></svg>`;
  const BLANK = `<svg viewBox="0 0 48 48"><rect x="12" y="6" width="24" height="34" fill="#f5efe1" stroke="#8a7a62"/><path d="M8,42 L40,42" stroke="#8a7a62" stroke-dasharray="2 3"/></svg>`;
  function openVoice() {
    const sc = S.scenes.voice;
    const desk = overlay.querySelector('.desk');
    rail.innerHTML = '';
    const { body } = newSheet(desk, { kicker: S.vars(s).name, title: sc.title, staged: sc.staged });
    blocksInto(body, sc.beats[0].blocks, 'voice');
    const icons = [SCISSORS, PEN, BLANK];
    body.append(el('div', { class: 'tools3' }, sc.beats[0].choices.map((c, k) => {
      const b = el('button', { type: 'button', class: 'card', style: `--cr:${tilt()}` }, el('span', { html: icons[k] }), el('span', { class: 'cl', text: c.label }), el('span', { class: 'cs', text: c.sub }));
      b.addEventListener('click', () => ({ v_tiles: openCollage, v_write: openWrite, v_silence: openBlank })[c.to]());
      return b;
    })));
  }

  /* cut words out of the record and paste them down */
  const FACE = by => {
    const b = by.toLowerCase();
    if (b.includes('her, reported')) return ['var(--f-display)', '#dfe7ee', '#3d5a78', 'italic'];
    if (b.includes('hope')) return ['var(--f-text)', '#e3d9c4', '#2a211a', 'italic'];
    if (b.includes('rochester')) return ['var(--f-text)', '#efe6d2', '#2a211a', 'normal'];
    if (b.includes('jane')) return ['var(--f-display)', '#f2ead8', '#2a211a', 'normal'];
    if (b.includes('mason')) return ['var(--f-voice)', '#e9dfc9', '#3a2e22', 'italic'];
    if (b.includes('grace')) return ['var(--f-voice)', '#e2d6bd', '#3a2e22', 'normal'];
    if (b.includes('briggs') || b.includes('register')) return ['var(--f-label)', '#f4f0e6', '#2a211a', 'normal'];
    if (b.includes('landlord')) return ['var(--f-voice)', '#d9cdb2', '#3a2e22', 'normal'];
    if (b.includes('brontë')) return ['var(--f-hand)', '#efe8d6', '#2a211a', 'normal'];
    return ['var(--f-voice)', '#f5efe1', '#6b5d48', 'normal'];
  };
  function cutNode(t, placed) {
    const [ff, bg, fg, st] = FACE(t.by);
    const big = ff === 'var(--f-hand)' ? '1.45rem' : '1.05rem';
    return el('span', { class: 'cut', title: 'Said by ' + t.by, style: `font-family:${ff};background:${bg};color:${fg};font-style:${st};font-size:${big};--cr:${placed ? rnd(-5, 5).toFixed(1) : rnd(-2, 2).toFixed(1)}deg` }, t.w);
  }
  function openCollage() {
    const desk = overlay.querySelector('.desk');
    const sc = S.scenes.v_tiles;
    const { body, foot } = newSheet(desk, { kicker: S.vars(s).name, title: 'Her Testimony', staged: sc.staged });
    blocksInto(body, [sc.beats[0].blocks[0]], 'v_tiles');
    const sheet = el('div', { class: 'collage' }, el('div', { class: 'collage-empty', text: 'paste the words here · drag to arrange · tap one to take it back' }));
    const placed = [];
    const drag = (node, item) => {
      let st = null, moved = false;
      node.addEventListener('pointerdown', e => { st = { x: e.clientX, y: e.clientY, l: parseFloat(node.style.left), t: parseFloat(node.style.top) }; moved = false; node.setPointerCapture(e.pointerId); node.classList.add('dragging'); });
      node.addEventListener('pointermove', e => { if (!st) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (Math.hypot(dx, dy) > 4) moved = true; const W = sheet.clientWidth, H = sheet.clientHeight; item.x = Math.max(0, Math.min(W - node.offsetWidth, st.l + dx)); item.y = Math.max(0, Math.min(H - node.offsetHeight, st.t + dy)); node.style.left = item.x + 'px'; node.style.top = item.y + 'px'; });
      node.addEventListener('pointerup', () => { if (!st) return; st = null; node.classList.remove('dragging'); if (!moved) { placed.splice(placed.indexOf(item), 1); node.remove(); sync(); } });
    };
    let cx = 14, cy = 14;
    const place = t => {
      if (placed.length >= 18) { toast('The sheet is full.'); return; }
      const item = { t, x: 0, y: 0 };
      const node = cutNode(t, true);
      sheet.append(node);
      const W = sheet.clientWidth;
      if (cx + node.offsetWidth > W - 14) { cx = 14; cy += 46; }
      item.x = cx + rnd(-4, 4); item.y = cy + rnd(-5, 5); cx += node.offsetWidth + rnd(8, 18);
      node.style.left = item.x + 'px'; node.style.top = item.y + 'px';
      if (cy + 60 > sheet.clientHeight) sheet.style.minHeight = (cy + 80) + 'px';
      placed.push(item); drag(node, item); sync();
    };
    const bank = S.tiles(s);
    const groups = {};
    bank.forEach(t => { (groups[t.by] = groups[t.by] || []).push(t); });
    const scraps = el('div', { class: 'scraps' }, Object.keys(groups).map(by => el('div', { class: 'src' },
      el('span', { class: 'src-k', text: by === 'anyone’s' ? 'anyone’s words' : 'cut from ' + by }),
      el('div', { class: 'src-row' }, groups[by].map(t => { const n = cutNode(t, false); n.setAttribute('role', 'button'); n.tabIndex = 0; n.addEventListener('click', () => place(t)); n.addEventListener('keydown', e => { if (e.key === 'Enter') place(t); }); return n; })))));
    const paste = el('button', { type: 'button', class: 'btn', disabled: true }, 'Paste it down');
    const sync = () => { sheet.querySelector('.collage-empty').hidden = placed.length > 0; paste.disabled = !placed.length; };
    paste.addEventListener('click', () => {
      const ordered = placed.slice().sort((a, b) => (Math.abs(a.y - b.y) < 22 ? a.x - b.x : a.y - b.y));
      s.voice = { mode: 'tiles', tiles: ordered.map(p => p.t), text: ordered.map(p => p.t.w).join(' ') }; save();
      scraps.remove(); paste.remove();
      sheet.querySelectorAll('.cut').forEach(n => { n.style.pointerEvents = 'none'; });
      body.append(el('div', { class: 'statement' }, s.voice.tiles.map(t => el('span', { class: 'sw' }, cutNode(t, false), el('small', { text: t.by })))));
      afterVoice('v_tiles', body, foot);
    });
    body.append(el('div', { class: 'collage-wrap' }, sheet, el('div', { style: 'display:flex;justify-content:flex-end' }, paste), scraps));
  }
  function openWrite() {
    const desk = overlay.querySelector('.desk');
    const sc = S.scenes.v_write;
    const { body, foot } = newSheet(desk, { kicker: S.vars(s).name, title: 'Her Testimony', staged: sc.staged });
    blocksInto(body, [sc.beats[0].blocks[0]], 'v_write');
    const ta = el('textarea', { id: 'her-words', class: 'handwrite', maxlength: '600', 'aria-label': 'Her words, in your hand', placeholder: 'write in her voice…' });
    const go = el('button', { type: 'button', class: 'btn', disabled: true }, 'Sign it into the record');
    ta.addEventListener('input', () => { go.disabled = ta.value.trim().length < 2; });
    go.addEventListener('click', () => {
      s.voice = { mode: 'write', text: ta.value.trim(), tiles: [] }; save();
      ta.replaceWith(el('p', { class: 'her-hand', text: s.voice.text })); go.remove();
      afterVoice('v_write', body, foot);
    });
    body.append(ta, el('div', { style: 'display:flex;justify-content:flex-end' }, go));
    ta.focus();
  }
  function openBlank() {
    const desk = overlay.querySelector('.desk');
    const sc = S.scenes.v_silence;
    const { body, foot } = newSheet(desk, { kicker: S.vars(s).name, title: 'Her Testimony', staged: sc.staged });
    const page = el('div', { class: 'blankpage' });
    const w = el('button', { type: 'button', class: 'btn' }, 'Wait');
    body.append(el('p', { class: 'nar', html: rich(S.silenceOpen, false) }), page, el('div', { style: 'display:flex;justify-content:flex-end' }, w));
    w.addEventListener('click', () => {
      w.disabled = true; w.textContent = '…';
      setTimeout(() => {
        s.voice = { mode: 'silence', text: '', tiles: [] }; save(); w.remove();
        body.append(el('p', { class: 'cap' }, el('span', { class: 't', text: 'Everything the novel lets her do' })),
          el('ol', { class: 'acts' }, S.acts.map(a => el('li', {}, el('span', { class: 'ch', text: a.ch }), el('span', { class: s.erased.includes(a.k) ? 'gone' : '', html: inline(a.t) })))),
          el('div', { class: 'nar', html: rich(S.silenceClose, false) }));
        foot.append(el('span', { class: 'pg', text: '' }), el('button', { type: 'button', class: 'turn', onclick: endCard }, 'end of the prototype →'));
      }, reduce ? 0 : 1800);
    });
  }
  function afterVoice(id, body, foot) {
    S.scenes[id].beats[0].blocks.forEach(raw => { const b = typeof raw === 'function' ? raw(s) : raw; if (b && b.t === 'note') body.append(slip(b.tier, b.by, b.text)); });
    foot.append(el('span', { class: 'pg', text: '' }), el('button', { type: 'button', class: 'turn', onclick: endCard }, 'end of the prototype →'));
  }

  function endCard() {
    const desk = overlay ? overlay.querySelector('.desk') : openOverlay();
    if (rail) rail.innerHTML = '';
    const { body, foot } = newSheet(desk, { kicker: 'End of the prototype', title: 'What comes next', closeLabel: 'Close ×' });
    const role = { reader: 'a reader', judge: 'a judge', rescuer: 'a rescuer' }[s.role] || 'no one in particular';
    body.append(el('div', { class: 'nar', html: rich(`You came as ${role}, heard ${s.heard.length} of seven witnesses${s.finding ? ', and entered a finding' : ''}. In the full game the night follows: the keys, the roof, the endings, and the essay.\n\nThis preview is only to test the feel: picking things up, stamping, cutting words out, carrying a light. Tell me what works and what doesn’t.`, false) }));
    foot.append(el('button', { type: 'button', class: 'turn', onclick: () => { closeOverlay(true); showHearing(); } }, '← back to the table'), el('button', { type: 'button', class: 'turn', onclick: restart }, 'start over →'));
    onClose = null;
  }

  /* ------------------------------------------------------------ start */
  window.UH._proto = { get state() { return s; }, showRoom, showHearing };
  if (s.scene === 'room') showRoom(); else if (s.scene === 'hearing' && s.role) showHearing(); else showThreshold();
});
