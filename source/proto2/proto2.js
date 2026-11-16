/* Unwriting Her · prototype 2: rooms you explore.
   A house plan, three rooms (Jane's bedroom, Grace Poole's room, the third-storey corridor), a satchel,
   and three small tasks: developing a print, picking a pocket, turning a lock.
   All quotations and notes come from stories/bertha.js; this file decides how you reach them. */
window.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const S = window.UH.story;
  const app = document.getElementById('app');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ state */
  const fresh = () => ({ role: null, room: 'plan', inv: ['candle'], armed: null, flags: [], readings: {}, opened: [], record: [], reflections: [],
    checks: {}, erased: [], prints: [], exhibits: [], seen: {}, doors: {}, intro: {} });
  let s = fresh();
  const KEY = 'unwriting-her:proto2';
  try { const raw = localStorage.getItem(KEY); if (raw) s = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage blocked */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } };
  const has = f => s.flags.includes(f);
  const flag = f => { if (!has(f)) s.flags.push(f); save(); };
  const seen = (room, id) => (s.seen[room] || []).includes(id);
  const see = (room, id) => { s.seen[room] = s.seen[room] || []; if (!s.seen[room].includes(id)) s.seen[room].push(id); save(); };

  /* ------------------------------------------------------------ text helpers (shared with the game) */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => { if (c == null || c === false) return; n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  }
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const CLUE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const strip = t => String(t).replace(CLUE, '$1');
  const inline = t => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  function rich(t, live) {
    return String(t).split(/\n\n/).map(par => {
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
  const tilt = () => rnd(-1.1, 1.3).toFixed(2) + 'deg';

  /* find a block in the story by a few words of it, so every quotation stays the game's own */
  function find(sceneId, words) {
    const sc = S.scenes[sceneId];
    for (const b of sc.beats) {
      for (const raw of b.blocks) { const x = typeof raw === 'function' ? raw(s) : raw; if (x && x.text && strip(x.text).includes(words)) return x; }
      for (const e of b.examine || []) for (const x of e.blocks) if (x && x.text && strip(x.text).includes(words)) return x;
    }
    console.warn('missing passage', sceneId, words);
    return null;
  }
  const Q = (who, cite, text) => ({ t: 'q', who, cite, text });
  const reading = sceneId => S.scenes[sceneId].beats.map(b => b.reading).find(Boolean);

  function renderGlass(r) {
    return el('div', { class: 'glass' },
      el('p', { class: 'glass-cap' }, el('span', { text: 'In the glass' }), el('span', { text: r.cite || '' })),
      el('div', { class: 'panes' },
        el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Her' }), el('span', { class: 'pane-t', html: inline(r.her) })),
        el('i', { 'aria-hidden': 'true' }),
        el('div', { class: 'pane' }, el('span', { class: 'pane-k', text: r.who }), el('span', { class: 'pane-t', html: inline(r.other) }))));
  }
  function slip(tier, by, text) {
    return el('aside', { class: 'slip', 'data-tier': tier, style: `--sr:${tilt()}` },
      el('p', { class: 'slip-cap' }, el('span', { class: 'tier', 'data-tier': tier, text: TIER[tier] }), by ? el('span', { text: by }) : null),
      el('div', { class: 'slip-body', html: rich(text, false) }));
  }
  function block(b) {
    if (typeof b === 'function') b = b(s);
    if (!b) return null;
    switch (b.t) {
      case 'p': return el('div', { class: 'nar', html: rich(b.text, true) });
      case 'h': return el('h4', { class: 'subh', text: b.text });
      case 'q':
        if (!s.record.some(r => r.text === strip(b.text))) s.record.push({ who: b.who, cite: b.cite, text: strip(b.text) });
        return el('figure', { class: 'q' + (b.doc ? ' doc' : '') },
          el('figcaption', { class: 'cap' }, el('span', { class: 't', text: 'Verbatim' }), el('span', { text: b.cite }), el('span', { text: b.who })),
          el('blockquote', { html: rich(b.text, true) }));
      case 'mirror': {
        const fig = el('figure', { class: 'q mirror' },
          el('figcaption', { class: 'cap' }, el('span', { class: 't', text: 'Verbatim' }), el('span', { text: b.cite }), el('span', { text: b.who + ' · in the glass, tap to turn it round' })),
          el('blockquote', {}, el('span', { class: 'mir', html: inline(b.text) })));
        fig.querySelector('blockquote').addEventListener('click', () => fig.classList.toggle('turned'));
        return fig;
      }
      case 'note': return slip(b.tier, b.by, b.text);
      case 'reflect': { const r = S.reflections[b.id]; if (!r) return null; if (!s.reflections.includes(b.id)) { s.reflections.push(b.id); toast('Something appeared in the glass.'); } return renderGlass(r); }
      case 'list': return el('ul', { class: 'plain' }, b.items.map(x => el('li', { html: inline(x) })));
      case 'check': return s.role === 'reader' ? checkCard(b) : null;
      default: return null;
    }
  }
  function blocksInto(body, blocks) {
    blocks.forEach(raw => {
      const node = block(raw);
      if (!node) return;
      const wrap = el('div', { class: 'blk' }, node);
      if (node.querySelector && node.querySelector('.clue')) wrap.append(el('div', { class: 'slips' }));
      body.append(wrap);
    });
  }
  document.addEventListener('click', e => {
    const x = e.target.closest('.slip-x');
    if (x) { const sl = x.closest('.slip'); document.querySelectorAll(`.clue[data-clue="${sl.dataset.clue}"]`).forEach(c => c.classList.remove('on')); sl.remove(); return; }
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

  /* ------------------------------------------------------------ chrome */
  const toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  document.body.append(toastEl);
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2800); }
  let hintEl, satchelEl, hudEl;
  const ROLE_NAME = { reader: 'Reader', judge: 'Judge', rescuer: 'Rescuer' };
  function frame(place) {
    app.innerHTML = '';
    hudEl = el('div', { class: 'hud' },
      el('span', { class: 'hud-l' }, s.room !== 'plan' ? el('button', { type: 'button', class: 'back', onclick: () => goRoom('plan') }, '← The house') : null, s.room !== 'plan' ? '  ·  ' : '', place),
      el('span', { class: 'hud-r' }, s.role ? el('span', { class: 'hud-role', text: ROLE_NAME[s.role] + (s.role === 'judge' ? ` · ${s.exhibits.length} exhibits` : s.role === 'rescuer' ? ` · ${s.erased.length} prevented` : '') }) : null,
        el('button', { type: 'button', class: 'hud-btn', onclick: restart }, 'Start over')));
    hintEl = el('p', { class: 'hint', 'aria-live': 'polite' });
    satchelEl = el('div', { class: 'satchel', 'aria-label': 'Your satchel' });
    return { hud: hudEl, hint: hintEl, satchel: satchelEl };
  }
  function hint(t) { if (!hintEl) return; hintEl.textContent = t; hintEl.classList.remove('fresh'); void hintEl.offsetWidth; hintEl.classList.add('fresh'); }
  function restart() { s = fresh(); save(); closeAll(); start(); }
  function titleCard(k, t, c, then) {
    if (reduce) { then(); return; }
    const tc = el('div', { class: 'titlecard', 'aria-hidden': 'true' }, el('p', { class: 'k', text: k }), el('p', { class: 't', text: t }), c ? el('p', { class: 'c', text: c }) : null);
    let done = false;
    const end = () => { if (done) return; done = true; tc.classList.add('out'); setTimeout(() => tc.remove(), 700); then(); };
    tc.addEventListener('click', end); document.body.append(tc); setTimeout(end, 1500);
  }

  /* ------------------------------------------------------------ the satchel */
  const ICON = {
    candle: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42" rx="12" ry="3" fill="#6e5c47"/><rect x="19" y="16" width="10" height="26" rx="2" fill="#e6dcc6"/><path d="M24,4 C28,9 28,13 24,15 C20,13 20,9 24,4Z" fill="#f6c56f"/></svg>`,
    lens: `<svg viewBox="0 0 48 48"><circle cx="20" cy="20" r="11" fill="rgba(170,195,219,.15)" stroke="#b9a27a" stroke-width="3"/><path d="M28,28 L42,42" stroke="#5a4029" stroke-width="5" stroke-linecap="round"/></svg>`,
    bag: `<svg viewBox="0 0 48 48"><path d="M10,18 L38,18 L35,42 L13,42Z" fill="#5a4029" stroke="#8a6a48"/><path d="M17,18 C17,9 31,9 31,18" fill="none" stroke="#8a6a48" stroke-width="2"/><rect x="20" y="26" width="8" height="6" fill="#b8473a"/></svg>`,
    keys: `<svg viewBox="0 0 48 48"><circle cx="14" cy="16" r="8" fill="none" stroke="#b9a27a" stroke-width="2.5"/><path d="M19,21 L38,40 M33,35 L37,31 M29,31 L32,28" stroke="#b9a27a" stroke-width="3" stroke-linecap="round"/><path d="M12,24 L14,42 M12,36 L17,36" stroke="#8a7a62" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    card: `<svg viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="22" rx="2" fill="#efe6d2" transform="rotate(-8 24 25)"/><circle cx="12" cy="26" r="2" fill="#120e0b"/><path d="M17,24 C22,20 28,28 36,22" stroke="#2a211a" fill="none" stroke-width="1.4"/></svg>`,
    bottle: `<svg viewBox="0 0 48 48"><path d="M20,4 L28,4 L28,14 C34,17 35,22 35,28 L35,44 L13,44 L13,28 C13,22 14,17 20,14Z" fill="#22301f" stroke="#6e5c47"/><rect x="16" y="28" width="16" height="9" fill="#d8ccb2" opacity=".7"/></svg>`,
    prints: `<svg viewBox="0 0 48 48"><rect x="8" y="10" width="24" height="30" fill="#e8dfca" transform="rotate(-8 20 25)"/><rect x="16" y="8" width="24" height="30" fill="#efe6d2" transform="rotate(6 28 23)"/><path d="M26,30 C24,22 30,16 32,24 C33,28 31,32 26,30Z" fill="#2a211a" transform="rotate(6 28 23)"/></svg>`
  };
  const ITEM_NAME = { candle: 'Candle', lens: 'Reading glass', bag: 'Evidence bag', keys: 'Grace Poole’s keys', card: 'Luggage card', bottle: 'The bottle', prints: 'Prints' };
  function drawSatchel() {
    if (!satchelEl) return;
    satchelEl.innerHTML = '';
    satchelEl.append(el('span', { class: 'satchel-k', text: 'Satchel' }));
    s.inv.forEach(id => {
      const b = el('button', { type: 'button', class: 'slot' + (s.armed === id ? ' armed' : '') + (s.fresh === id ? ' new' : ''), title: ITEM_NAME[id], 'aria-label': ITEM_NAME[id], html: ICON[id] });
      if (s.role === 'judge' && s.exhibits.includes(id)) b.append(el('span', { class: 'ex', text: 'EX' }));
      b.addEventListener('click', () => useItem(id));
      satchelEl.append(b);
    });
    for (let i = s.inv.length; i < 6; i++) satchelEl.append(el('span', { class: 'slot empty', 'aria-hidden': 'true' }));
    s.fresh = null;
  }
  function give(id, msg) {
    if (!s.inv.includes(id)) s.inv.push(id);
    s.fresh = id;
    if (s.role === 'judge' && !['candle', 'bag', 'lens'].includes(id) && !s.exhibits.includes(id)) { s.exhibits.push(id); msg = (msg ? msg + ' ' : '') + 'Bagged as an exhibit.'; }
    save(); drawSatchel(); refreshHud();
    if (msg) toast(msg);
  }
  function refreshHud() { const r = hudEl && hudEl.querySelector('.hud-role'); if (r) r.textContent = ROLE_NAME[s.role] + (s.role === 'judge' ? ` · ${s.exhibits.length} exhibits` : s.role === 'rescuer' ? ` · ${s.erased.length} prevented` : ''); }
  function useItem(id) {
    if (id === 'lens') { s.armed = s.armed === 'lens' ? null : 'lens'; save(); drawSatchel(); toast(s.armed ? 'The reading glass is in your hand. Look closely at things.' : 'You put the glass away.'); return; }
    if (id === 'candle') { toast('Your candle. In the rooms, it lights what you look at.'); return; }
    if (id === 'card') return sheetOf('Luggage card', 'In your satchel', body => {
      const c = el('div', { class: 'luggage', role: 'button', tabindex: '0', 'aria-label': 'Turn the card over' },
        el('div', { class: 'luggage-in' },
          el('div', { class: 'luggage-face' }, el('div', {}, el('span', { class: 'script', text: 'Mrs. Rochester,' }), el('br'), el('span', { class: 'script', text: '—— Hotel, London' }), el('small', { text: 'in Mr. Rochester’s hand · tap to turn it over' }))),
          el('div', { class: 'luggage-face back' }, el('div', {}, el('small', { text: 'the back of the card is blank' })))));
      c.addEventListener('click', () => c.classList.toggle('flipped'));
      body.append(c);
      blocksInto(body, [find('w_jane', 'She did not exist')]);
    });
    if (id === 'keys') return sheetOf('Grace Poole’s keys', 'In your satchel', body => blocksInto(body, [find('room', 'twice to possess herself'), find('w_host', 'cunning as a witch')]));
    if (id === 'bottle') return sheetOf('The bottle', 'In your satchel', body => blocksInto(body, [find('w_grace', 'private bottle of gin')]));
    if (id === 'prints') return sheetOf('Prints from the glass', 'In your satchel', body => {
      body.append(el('p', { class: 'nar', html: '<p>Three accounts of the same night, developed from the same glass.</p>' }));
      const row = el('div', { class: 'prints' });
      s.prints.forEach(k => { const a = ACCOUNTS.find(x => x.k === k); row.append(printNode(a, () => openPrint(a))); });
      body.append(row);
    });
    if (id === 'bag') return sheetOf('Evidence bag', 'Exhibits for the hearing', body => {
      body.append(el('p', { class: 'nar', html: `<p>${s.exhibits.length ? 'Everything you have picked up goes in the bag as an exhibit. At the hearing, only exhibits can be entered as evidence.' : 'Nothing in the bag yet. Things you pick up in the house become exhibits.'}</p>` }));
      body.append(el('ul', { class: 'plain' }, s.exhibits.map(x => el('li', { text: ITEM_NAME[x] }))));
    });
  }

  /* ------------------------------------------------------------ paper sheets, captions, stamps */
  let overlay = null, rail = null;
  function closeAll() { if (overlay) { overlay.remove(); overlay = null; } document.querySelectorAll('.panel, .caption').forEach(n => n.remove()); }
  function sheetOf(title, kicker, fill, opts) {
    if (overlay) overlay.remove();
    overlay = el('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' });
    const desk = el('div', { class: 'desk' });
    rail = el('div', { class: 'rail' });
    const sh = el('article', { class: 'sheet paper' });
    const close = () => { if (!overlay) return; const o = overlay; overlay = null; o.classList.add('closing'); setTimeout(() => o.remove(), 300); if (opts && opts.onClose) opts.onClose(); };
    sh.append(el('button', { type: 'button', class: 'sheet-close', onclick: close }, 'Put it down ×'),
      el('header', { class: 'sheet-head' }, el('p', { class: 'sheet-kicker', text: kicker }), el('h2', { class: 'sheet-title', text: title }), opts && opts.cite ? el('p', { class: 'sheet-cite', text: opts.cite }) : null, opts && opts.staged ? el('p', { class: 'staged', text: opts.staged }) : null));
    const body = el('div', { class: 'sheet-body' });
    const foot = el('footer', { class: 'sheet-foot' });
    sh.append(body, foot);
    desk.append(sh, rail);
    overlay.append(desk);
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target === desk) close(); });
    document.body.append(overlay);
    fill(body, foot, sh, close);
    if (!foot.children.length) foot.append(el('span', { class: 'pg', text: '' }), el('button', { type: 'button', class: 'turn', onclick: close }, 'Put it down →'));
    return { close, sh, body, foot };
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay) { const b = overlay.querySelector('.sheet-close'); if (b) b.click(); } });

  /* a sequence of passages laid over the scene, one at a time */
  function caption(seq, done) {
    document.querySelectorAll('.caption').forEach(n => n.remove());
    let i = 0;
    const box = el('div', { class: 'caption', role: 'region', 'aria-label': 'From the novel' });
    const show = () => {
      box.innerHTML = '';
      const step = seq[i];
      if (step.before) step.before();
      blocksInto(box, step.blocks || [step]);
      const last = i >= seq.length - 1;
      box.append(el('div', { class: 'caption-foot' }, el('span', { class: 'pg', text: seq.length > 1 ? `${i + 1} / ${seq.length}` : '' }),
        el('button', { type: 'button', class: 'turn', onclick: () => { if (last) { box.remove(); if (done) done(); } else { i++; show(); } } }, last ? 'Continue →' : 'Go on →')));
      box.scrollTop = 0;
    };
    app.append(box);
    show();
  }

  /* stamp a reading onto the page; the critics' analysis clips on beneath */
  function stampReading(r, title, kicker, introBlocks, after) {
    const labels = r.labels || S.readLabels;
    sheetOf(title, kicker, (body, foot, sh, close) => {
      if (introBlocks) blocksInto(body, introBlocks);
      const box = el('section', { class: 'reading' }, el('p', { class: 'reading-q', text: r.prompt }));
      body.append(box);
      const done = (o, at) => {
        s.readings[r.id] = o.k; save();
        let x, y;
        if (at) ({ x, y } = at); else { const R = sh.getBoundingClientRect(), A = box.querySelector('.reading-q').getBoundingClientRect(); x = A.left - R.left + A.width * 0.75; y = A.top - R.top + 20; }
        sh.append(el('span', { class: 'imprint', style: `left:${x}px;top:${y}px;--ir:${rnd(-12, 8).toFixed(1)}deg`, text: labels[o.k] }));
        const lg = box.querySelector('.legend'); if (lg) lg.remove();
        box.append(slip(o.tier || 'annotation', o.by, o.text));
        rail.innerHTML = '';
        if (after) after();
      };
      if (s.readings[r.id]) {
        const o = r.options.find(x => x.k === s.readings[r.id]);
        box.append(el('p', { class: 'cap' }, el('span', { class: 't', text: 'Your reading · ' + labels[o.k] })));
        box.append(slip(o.tier || 'annotation', o.by, o.text));
        return;
      }
      box.append(el('ul', { class: 'legend' }, r.options.map(o => el('li', {}, el('button', { type: 'button', onclick: () => done(o, null) }, el('span', { class: 'lk', text: labels[o.k] }), el('span', { class: 'ls', text: o.sub }))))));
      rail.append(el('p', { class: 'rail-label', text: 'Press a stamp onto the page' }));
      r.options.forEach(o => {
        const st = el('button', { type: 'button', class: 'stamp', 'aria-label': 'Stamp: ' + labels[o.k] }, el('span', { class: 'handle' }), el('span', { class: 'base' }, el('b', { text: labels[o.k] })));
        draggable(st, at => done(o, at));
        rail.append(st);
      });
    });
  }
  function draggable(node, drop) {
    let st = null, ghost = null;
    node.addEventListener('pointerdown', e => { if (e.button !== 0) return; st = { x: e.clientX, y: e.clientY }; node.setPointerCapture(e.pointerId); });
    node.addEventListener('pointermove', e => {
      if (!st) return;
      if (!ghost && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 6) { ghost = node.cloneNode(true); ghost.classList.add('ghost-stamp'); document.body.append(ghost); }
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
    });
    const end = e => {
      if (!st) return;
      const was = !!ghost; if (ghost) ghost.remove(); ghost = null; st = null;
      if (e.type === 'pointercancel') return;
      if (was) { const hit = document.elementFromPoint(e.clientX, e.clientY); const sh = hit && hit.closest('.sheet'); if (sh) { const R = sh.getBoundingClientRect(); drop({ x: e.clientX - R.left, y: e.clientY - R.top }); } }
      else drop(null);
    };
    node.addEventListener('pointerup', end); node.addEventListener('pointercancel', end);
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(null); } });
  }

  /* the reader's glass: faint pencil marginalia on things */
  const MARGINALIA = { mirror: 'c_mirror', grace: 'c_guessed', pocket: 'c_witch', pan: 'c_were', d4: 'c_perhaps', d1: 'c_directions' };
  function lensLook(id) {
    if (s.armed !== 'lens' || !MARGINALIA[id]) return false;
    const n = S.clues[MARGINALIA[id]];
    sheetOf('Pencilled in the margin', 'Through the reading glass', body => { body.append(el('p', { class: 'nar', html: '<p>Under the glass, faint pencil in someone else’s hand.</p>' })); body.append(slip(n.tier, n.by, n.text)); });
    return true;
  }

  /* ============================================================ DRAWING */
  const INK = '#6e5c47', FAINT = '#3a3028', TALLOW = '#dcae67', GLASS = '#aac3db';
  const DEFS = `<defs>
    <radialGradient id="gc" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${TALLOW}" stop-opacity=".5"/><stop offset=".4" stop-color="${TALLOW}" stop-opacity=".14"/><stop offset="1" stop-color="${TALLOW}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gf" cx="50%" cy="60%" r="55%"><stop offset="0" stop-color="#f0b45e" stop-opacity=".8"/><stop offset=".35" stop-color="#b8473a" stop-opacity=".4"/><stop offset="1" stop-color="#b8473a" stop-opacity="0"/></radialGradient>
    <radialGradient id="gm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${GLASS}" stop-opacity=".35"/><stop offset="1" stop-color="${GLASS}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gv" cx="50%" cy="46%" r="75%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c232b"/><stop offset=".45" stop-color="#0d1014"/><stop offset=".55" stop-color="#151b22"/><stop offset="1" stop-color="#090b0e"/></linearGradient>
    <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1510"/><stop offset="1" stop-color="#120e0b"/></linearGradient>
    <pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#16110d"/><path d="M0,6 L6,0" stroke="#1d1712" stroke-width="1"/></pattern>
    <filter id="sk"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .9 0 0 0 0 .8 0 0 0 0 .65 0 0 0 .04 0"/></filter>
  </defs>`;
  const wrapSvg = (inner, label) => `<svg class="room-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${DEFS}${inner}<rect width="1600" height="1000" fill="url(#gv)" pointer-events="none"/><rect width="1600" height="1000" filter="url(#grain)" pointer-events="none"/></svg>`;
  const glow = (x, y, r, id = 'gc', cls = '') => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="url(#${id})" pointer-events="none"/>`;
  const candle = (x, y, sc = 1, id = '') => `<g ${id ? `id="${id}"` : ''} transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="0" cy="74" rx="28" ry="7" fill="#4a3d2c"/><rect x="-9" y="0" width="18" height="72" rx="2" fill="#e6dcc6"/><g class="flame flicker"><path d="M0,-30 C9,-17 9,-6 0,0 C-9,-6 -9,-17 0,-30Z" fill="#f6c56f"/><path d="M0,-19 C4,-12 4,-5 0,-2 C-4,-5 -4,-12 0,-19Z" fill="#fff3d6"/></g></g>`;
  const floor = (y, c = '#0f0c09') => { let b = `<rect y="${y}" width="1600" height="${1000 - y}" fill="${c}"/><line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="${INK}" stroke-width="1.5"/>`; for (let i = -9; i <= 9; i++) b += `<line x1="${800 + i * 70}" y1="${y}" x2="${800 + i * 260}" y2="1000" stroke="${FAINT}"/>`; return b; };
  const wall = h => `<rect width="1600" height="${h}" fill="url(#gw)"/><rect width="1600" height="${h}" fill="url(#paper)" opacity=".5"/>`;
  /* a standing woman, seen from behind, pencil-sketched. Never a face. */
  function figure(veil, sc = 1) {
    const body = `<path d="M-62,0 C-56,-120 -46,-220 -38,-262 L38,-262 C46,-220 56,-120 62,0Z" fill="#e9e1d0" opacity=".16"/>
      <path d="M-38,-262 C-50,-300 -44,-334 -30,-348 L30,-348 C44,-334 50,-300 38,-262Z" fill="#0a0807"/>
      <path d="M-24,-348 C-32,-424 32,-424 24,-348 C32,-300 36,-250 30,-200 L-30,-200 C-36,-250 -32,-300 -24,-348Z" fill="#050404"/>`;
    const lines = `<g fill="none" stroke="#a89a82" stroke-linecap="round" filter="url(#sk)" opacity=".6">
      <path d="M-62,0 C-56,-120 -46,-220 -38,-262 M62,0 C56,-120 46,-220 38,-262" stroke-width="1.4"/>
      <path d="M-24,-348 C-32,-424 32,-424 24,-348 C32,-300 36,-250 30,-200 M-24,-348 C-32,-300 -36,-250 -30,-200" stroke-width="1.5"/>
      <path d="M-12,-400 C-14,-330 -16,-270 -12,-210 M8,-402 C10,-330 14,-270 12,-210" stroke-width=".8" opacity=".6"/>
      <path d="M-40,-60 C-20,-50 20,-50 40,-60" stroke-width=".8" opacity=".5"/></g>`;
    const v = veil ? `<path d="M-36,-404 C-10,-436 10,-436 36,-404 C52,-330 60,-250 54,-180 L-54,-180 C-60,-250 -52,-330 -36,-404Z" fill="#f2ece0" opacity=".42"/><path d="M-30,-396 C-40,-320 -46,-250 -44,-186 M30,-396 C40,-320 46,-250 44,-186" stroke="#f2ece0" stroke-width="1" fill="none" opacity=".5"/>` : '';
    return `<g transform="scale(${sc})">${body}${lines}${v}</g>`;
  }

  /* ============================================================ START: choose what you are */
  const ROLE_ICON = {
    reader: `<svg viewBox="0 0 200 160"><circle cx="78" cy="70" r="46" fill="rgba(170,195,219,.12)" stroke="#b9a27a" stroke-width="9"/><path d="M112,104 L168,148" stroke="#3a2a1c" stroke-width="16" stroke-linecap="round"/><path d="M112,104 L124,114" stroke="#b9a27a" stroke-width="18"/></svg>`,
    judge: `<svg viewBox="0 0 200 160"><path d="M86,20 Q100,10 114,20 L118,92 L82,92Z" fill="#5a4029"/><rect x="66" y="92" width="68" height="16" rx="3" fill="#8d7a5a"/><ellipse cx="100" cy="128" rx="40" ry="16" fill="#8e2a22"/><ellipse cx="100" cy="124" rx="34" ry="12" fill="#b8473a"/></svg>`,
    rescuer: `<svg viewBox="0 0 200 160"><circle cx="58" cy="80" r="30" fill="none" stroke="#b9a27a" stroke-width="10"/><rect x="86" y="74" width="96" height="12" rx="3" fill="#b9a27a"/><rect x="150" y="86" width="10" height="22" fill="#b9a27a"/><rect x="166" y="86" width="10" height="16" fill="#b9a27a"/></svg>`
  };
  function start() {
    if (!s.role) return chooseRole();
    goRoom(s.room || 'plan', true);
  }
  function chooseRole() {
    s.room = 'plan';
    frame('Thornfield Hall');
    app.append(el('div', { class: 'plan' }), hudEl);
    const th = S.scenes.threshold;
    const p = el('div', { class: 'panel' });
    const box = el('div', { class: 'panel-box' },
      el('p', { class: 'panel-k', text: 'Outside the text' }), el('h2', { class: 'panel-t', text: 'Before you go in, decide what you are.' }));
    const body = el('div', { class: 'sheet-body', style: 'margin:.6rem 0 1rem' });
    th.beats[0].blocks.filter(b => b.t === 'p' && !b.small).slice(0, 3).forEach(b => body.append(el('div', { class: 'nar', style: 'color:var(--faded)', html: rich(b.text, false) })));
    const intro = { reader: 'The reading glass finds faint pencil in the margins of things.', judge: 'An evidence bag: whatever you pick up becomes an exhibit.', rescuer: 'You can reach some nights before they happen, and stop them.' };
    const row = el('div', { class: 'role-pick' }, th.beats[0].choices.map((c, k) => {
      const r = ['reader', 'judge', 'rescuer'][k];
      const b = el('button', { type: 'button', class: 'pick' }, el('span', { html: ROLE_ICON[r] }), el('span', { class: 'rp-t', text: c.label }), el('span', { class: 'rp-s', text: c.sub + ' ' + intro[r] }));
      b.addEventListener('click', () => {
        s.role = r;
        if (r === 'reader') s.inv.push('lens');
        if (r === 'judge') s.inv.push('bag');
        save(); p.remove();
        titleCard('Thornfield Hall', 'The house', 'Prototype · three rooms', () => goRoom('plan'));
      });
      return b;
    }));
    box.append(body, row);
    p.append(box);
    document.body.append(p);
  }

  /* ============================================================ THE HOUSE PLAN */
  const ROOMS = {
    jane: { name: 'Jane’s room', floor: 'Second floor', place: 'Jane’s room · two nights before the wedding', total: 6 },
    rochester: { name: 'Mr. Rochester’s room', floor: 'Second floor', locked: 'Next to be built' },
    corridor: { name: 'The corridor', floor: 'Third storey', place: 'The third storey · Chapter XI', total: 5 },
    grace: { name: 'Grace Poole’s room', floor: 'Third storey', place: 'The third storey · Grace Poole’s room', total: 6 },
    inner: { name: 'The inner room', floor: 'Third storey', locked: 'Behind a locked door' },
    church: { name: 'The church', floor: 'Grounds', locked: 'Next to be built' },
    leads: { name: 'The leads', floor: 'Roof', locked: 'Next to be built' }
  };
  function goRoom(id, noCard) {
    closeAll();
    s.room = id; save();
    const draw = { plan: drawPlan, jane: drawJane, grace: drawGrace, corridor: drawCorridor }[id];
    if (id === 'plan' || noCard || reduce) draw();
    else titleCard(ROOMS[id].floor, ROOMS[id].name, null, draw);
  }
  function drawPlan() {
    frame('Thornfield Hall · the house');
    const sheet = el('div', { class: 'plan-sheet' }, el('h1', { class: 'plan-title', text: 'Thornfield Hall' }), el('p', { class: 'plan-sub', text: 'Choose a room. Things you pick up go in your satchel and open things elsewhere.' }));
    ['Roof', 'Third storey', 'Second floor', 'Grounds'].forEach(fl => {
      const rooms = Object.entries(ROOMS).filter(([, r]) => r.floor === fl);
      sheet.append(el('div', { class: 'floor' }, el('p', { class: 'floor-k', text: fl }), el('div', { class: 'floor-row' }, rooms.map(([k, r]) => {
        let locked = r.locked;
        if (k === 'inner' && s.doors.d4) locked = 'The door is open · next to be built';
        const n = (s.seen[k] || []).length;
        const b = el('button', { type: 'button', class: 'plan-room' + (locked ? ' locked' : '') + (r.total && n >= r.total ? ' done' : ''), 'aria-disabled': locked ? 'true' : null },
          el('span', { class: 'pr-name', text: r.name }), el('span', { class: 'pr-k', text: locked || (n ? `${Math.min(n, r.total)} of ${r.total} found` : 'Unexplored') }), el('span', { class: 'door-mark', 'aria-hidden': 'true' }));
        b.addEventListener('click', () => { if (locked) toast(locked + '.'); else goRoom(k); });
        return b;
      }))));
    });
    sheet.append(el('p', { class: 'plan-note', text: 'Prototype: three rooms are open. The rest of the house, the hearing and the endings come next.' }));
    app.append(el('div', { class: 'plan' }, sheet), hudEl, satchelEl);
    drawSatchel();
  }

  /* shared scene mount */
  let svgEl = null;
  function mount(place, inner, label, onAct) {
    frame(place);
    const wrap = el('div', { class: 'scene-wrap' });
    const box = el('div', { class: 'stagebox' });
    box.innerHTML = wrapSvg(inner, label);
    wrap.append(box);
    app.append(wrap, hudEl, hintEl, satchelEl);
    svgEl = box.querySelector('svg');
    svgEl.querySelectorAll('[data-act]').forEach(g => { g.classList.add('act'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); });
    const go = e => { const g = e.target.closest('[data-act]'); if (!g || g.classList.contains('hidden')) return; if (lensLook(g.dataset.act)) return; onAct(g.dataset.act, g); };
    svgEl.addEventListener('click', go);
    svgEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(e); } });
    requestAnimationFrame(() => {
      wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
      if (wrap.scrollWidth - wrap.clientWidth < wrap.clientWidth * 0.15) return;
      const L = el('button', { type: 'button', class: 'pan l', 'aria-label': 'Look left' }, '‹'), R = el('button', { type: 'button', class: 'pan r', 'aria-label': 'Look right' }, '›');
      L.addEventListener('click', () => wrap.scrollBy({ left: -wrap.clientWidth * 0.6, behavior: 'smooth' }));
      R.addEventListener('click', () => wrap.scrollBy({ left: wrap.clientWidth * 0.6, behavior: 'smooth' }));
      const upd = () => { L.hidden = wrap.scrollLeft < 8; R.hidden = wrap.scrollLeft > wrap.scrollWidth - wrap.clientWidth - 8; };
      wrap.addEventListener('scroll', upd, { passive: true }); upd();
      app.append(L, R);
      if (!s.intro.pan) { s.intro.pan = 1; save(); toast('Swipe sideways to look around the room.'); }
    });
    drawSatchel();
    return svgEl;
  }
  const $ = id => svgEl.getElementById ? svgEl.getElementById(id) : svgEl.querySelector('#' + id);
  const cls = (id, c, on) => { const n = $(id); if (n) n.classList.toggle(c, on); };
  const beckon = ids => svgEl.querySelectorAll('[data-act]').forEach(g => g.classList.toggle('beckon', ids.includes(g.dataset.act)));

  /* ============================================================ JANE'S ROOM */
  function drawJane() {
    let b = wall(770) + floor(770);
    b += `<rect x="960" y="190" width="80" height="250" fill="#1b2330" stroke="${INK}" stroke-width="3"/><line x1="1000" y1="190" x2="1000" y2="440" stroke="${INK}" stroke-width="3"/><line x1="960" y1="315" x2="1040" y2="315" stroke="${INK}" stroke-width="3"/>` + glow(1000, 315, 160, 'gm');
    // wardrobe
    b += `<g id="wardrobe" data-act="wardrobe"><rect x="105" y="208" width="350" height="28" fill="#2c2017" stroke="${INK}"/><rect x="120" y="236" width="320" height="540" fill="#0b0806" stroke="${INK}" stroke-width="2"/>
      <path d="M220,262 L220,284 M180,300 L260,300 M220,284 L180,300 M220,284 L260,300" stroke="#8a7a62" stroke-width="3" fill="none"/>
      <path d="M190,300 C176,420 162,560 152,720 L292,720 C282,560 266,420 252,300Z" fill="#d9cfbb" opacity=".8"/><path d="M200,300 C196,340 244,340 242,300" fill="none" stroke="#b9ab8c"/>
      <circle cx="370" cy="280" r="5" fill="#8a7a62"/><g id="veil" data-act="veil"><path d="M336,284 C326,400 320,520 334,650 L408,650 C420,520 414,400 404,284Z" fill="#f2ece0" opacity=".55"/><path d="M344,300 C338,420 336,520 344,640 M372,290 L372,646 M398,300 C404,420 404,520 398,640" stroke="#f2ece0" stroke-width="1" opacity=".5" fill="none"/></g>
      <g class="hinge l" id="wd-l"><rect x="120" y="236" width="160" height="540" fill="#3a2a1c" stroke="${INK}" stroke-width="2"/><rect x="140" y="262" width="120" height="220" fill="none" stroke="#4a3826"/><rect x="140" y="510" width="120" height="236" fill="none" stroke="#4a3826"/><circle cx="268" cy="500" r="5" fill="#b9a27a"/></g>
      <g class="hinge r" id="wd-r"><rect x="280" y="236" width="160" height="540" fill="#36271a" stroke="${INK}" stroke-width="2"/><rect x="300" y="262" width="120" height="220" fill="none" stroke="#4a3826"/><rect x="300" y="510" width="120" height="236" fill="none" stroke="#4a3826"/><circle cx="292" cy="500" r="5" fill="#b9a27a"/></g>
      <rect x="128" y="776" width="20" height="16" fill="#2c2017"/><rect x="412" y="776" width="20" height="16" fill="#2c2017"/></g>`;
    // mirror
    b += `<g id="mirror" data-act="mirror"><rect x="616" y="130" width="248" height="390" rx="6" fill="#0a0807" stroke="${INK}" stroke-width="6"/><rect x="634" y="148" width="212" height="354" fill="url(#gg)" stroke="#4a3d30"/><path d="M660,176 L716,300" stroke="${GLASS}" stroke-width="2" opacity=".22"/><path d="M672,170 L700,240" stroke="${GLASS}" stroke-width="1" opacity=".3"/><g id="ghost" class="fade" opacity="0"><ellipse cx="740" cy="330" rx="60" ry="120" fill="#e6dccb" opacity=".08" filter="url(#soft)"/></g></g>`;
    // dresser and drawer
    b += `<rect x="545" y="548" width="390" height="18" fill="#2c2017" stroke="${INK}"/><rect x="560" y="566" width="360" height="206" fill="#2a1d14" stroke="${INK}" stroke-width="2"/><rect x="590" y="690" width="300" height="56" fill="#2f2117" stroke="#4a3826"/>
      <g id="cards" class="hidden fade" data-act="cards">${[0, 1, 2, 3].map(i => `<rect x="${640 + i * 52}" y="${636}" width="44" height="28" rx="2" fill="#efe6d2" transform="rotate(${(i - 1.5) * 6} ${662 + i * 52} 650)"/>`).join('')}</g>
      <g id="drawer" class="slide" data-act="drawer"><rect x="590" y="600" width="300" height="64" fill="#36271a" stroke="${INK}" stroke-width="2"/><rect x="718" y="626" width="44" height="10" rx="4" fill="#b9a27a"/></g>`;
    // the candle on the dresser
    b += `<g id="candle" data-act="candle">${glow(880, 470, 230, 'gc', 'flicker')}${candle(880, 476, 0.9)}</g>`;
    // bed
    b += `<g><line x1="1080" y1="300" x2="1080" y2="800" stroke="${INK}" stroke-width="10"/><line x1="1510" y1="300" x2="1510" y2="800" stroke="${INK}" stroke-width="10"/><rect x="1060" y="286" width="470" height="24" fill="#2c2017"/>
      <path d="M1086,310 C1110,420 1092,560 1112,700 L1140,700 C1124,560 1144,420 1120,310Z" fill="#3a2a1f"/><path d="M1504,310 C1480,420 1498,560 1478,700 L1450,700 C1466,560 1446,420 1470,310Z" fill="#3a2a1f"/>
      <rect x="1100" y="610" width="400" height="120" fill="#cfc4ad" opacity=".55"/><rect x="1100" y="590" width="120" height="44" rx="10" fill="#e6dccb" opacity=".6"/><rect x="1086" y="730" width="428" height="50" fill="#2a1d14" stroke="${INK}"/></g>`;
    // the night: darkness, a figure, a torn veil
    b += `<rect id="night" class="fade" width="1600" height="1000" fill="#020101" opacity="0" pointer-events="none"/>
      <g id="visitor" class="fade" opacity="0" pointer-events="none"><g id="visitor-pos" style="transition:transform 2.4s ease" transform="translate(300 790)"><g id="v-veil-on" class="fade" opacity="0">${figure(true, 1)}</g><g id="v-plain">${figure(false, 1)}</g><g transform="translate(70 -250)">${glow(0, 0, 200)}${candle(0, 0, 0.6)}</g></g></g>
      <g id="torn" class="hidden fade" data-act="torn"><path d="M560,860 C610,830 680,850 720,842 C710,886 650,914 580,906 C566,896 552,882 560,860Z" fill="#f2ece0" opacity=".55"/><path d="M760,850 C810,826 890,842 930,862 C910,902 850,916 790,902 C770,888 756,872 760,850Z" fill="#f2ece0" opacity=".5"/><path d="M716,846 L730,838 L722,858 L738,854" stroke="#f2ece0" fill="none" opacity=".6"/></g>`;
    mount(ROOMS.jane.place, b, 'Jane’s bedroom: a wardrobe, a dresser with a drawer, a tall dark mirror, a candle and a curtained bed', janeAct);
    syncJane();
    if (!s.intro.jane) {
      s.intro.jane = 1; save();
      caption([find('w_jane', 'The trunks are packed')], () => syncJane());
    }
  }
  function syncJane() {
    cls('wardrobe', 'open', has('wd-open'));
    cls('drawer', 'pulled', has('drawer-open'));
    cls('cards', 'hidden', !has('drawer-open') || has('card-taken'));
    cls('veil', 'hidden', has('veil-hidden') || has('night-done'));
    cls('torn', 'hidden', !(has('night-done') && !has('veil-hidden')));
    const n = $('night'); if (n) n.setAttribute('opacity', has('night-done') ? '0.18' : '0');
    const c = $('candle'); if (c) c.style.opacity = has('night-done') ? '0.45' : '1';
    const ready = has('wd-open') && has('card-taken');
    let next;
    if (!has('wd-open') && !has('drawer-open')) { next = ['wardrobe', 'drawer']; hint('Open the wardrobe. Pull out the drawer.'); }
    else if (!ready) { next = [has('wd-open') ? '' : 'wardrobe', has('card-taken') ? '' : (has('drawer-open') ? 'cards' : 'drawer')]; hint(has('drawer-open') && !has('card-taken') ? 'Something is in the drawer.' : 'There is more in this room.'); }
    else if (!has('night-done')) { next = ['candle']; hint(s.role === 'rescuer' && !has('veil-hidden') ? 'Before you blow out the candle, you could hide the veil.' : 'Blow out the candle. Let the night come.'); }
    else if (!s.readings.veil && !has('veil-hidden')) { next = ['torn', 'mirror']; hint('Morning. The veil is on the floor. The glass remembers.'); }
    else { next = ['mirror']; hint(s.prints.length < 3 && !has('veil-hidden') ? 'Develop what the glass saw.' : 'Back to the house when you are ready.'); }
    beckon(next.filter(Boolean));
  }
  function janeAct(id) {
    if (id === 'wardrobe') {
      flag(has('wd-open') ? 'x' : 'wd-open');
      if (s.flags.includes('x')) { s.flags = s.flags.filter(f => f !== 'x' && f !== 'wd-open'); save(); }
      else see('jane', 'wardrobe');
      return syncJane();
    }
    if (id === 'drawer') {
      if (has('drawer-open')) s.flags = s.flags.filter(f => f !== 'drawer-open'); else { flag('drawer-open'); see('jane', 'drawer'); }
      save(); return syncJane();
    }
    if (id === 'cards') {
      flag('card-taken'); see('jane', 'cards'); give('card', 'You took a luggage card.');
      caption([Q(JANE_N, 'Ch. XXV', 'The cards of address alone remained to nail on: they lay, four little squares, in the drawer.'), { blocks: [find('w_jane', 'She did not exist'), { t: 'reflect', id: 'exist' }] }], syncJane);
      return syncJane();
    }
    if (id === 'veil') {
      if (has('night-done')) return;
      if (s.role !== 'rescuer') { toast('The veil for the wedding, on its hook.'); return; }
      return sheetOf('Before the night', 'You could arrive before it happens', (body, foot, sh, close) => {
        blocksInto(body, S.scenes.x_jane.beats[0].blocks);
        const row = el('div', { class: 'cards' }, S.scenes.x_jane.beats[0].choices.map(c => {
          const bt = el('button', { type: 'button', class: 'card', style: `--cr:${tilt()}` }, el('span', { class: 'cl', text: c.label }), el('span', { class: 'cs', text: c.sub }));
          bt.addEventListener('click', () => { if (c.to === 'r_jane') { flag('veil-hidden'); if (!s.erased.includes('veil')) s.erased.push('veil'); save(); refreshHud(); toast('You fold the veil away at the back of the wardrobe.'); } close(); syncJane(); });
          return bt;
        }));
        body.append(row);
      }, { staged: S.scenes.x_jane.staged });
    }
    if (id === 'candle') {
      if (has('night-done')) { toast('The candle is burned low.'); return; }
      if (!(has('wd-open') && has('card-taken'))) { toast('Not yet. Look around the room first.'); return; }
      return night();
    }
    if (id === 'torn') { see('jane', 'torn'); return stampReading(reading('w_jane'), 'The Veil', 'Chapter XXV · the morning after', [find('w_jane', 'removed my veil'), find('w_jane', 'turned to the mirror'), ...(s.role === 'reader' ? [S.scenes.w_jane.beats[0].blocks.find(x => typeof x === 'function' && x(s) && x(s).t === 'check')] : [])], syncJane); }
    if (id === 'mirror') {
      if (!has('night-done')) { toast('The glass shows only the room.'); return; }
      see('jane', 'mirror');
      return darkroom();
    }
  }
  const JANE_N = 'Jane Eyre, narrating';
  function night() {
    const pos = $('visitor-pos'), vis = $('visitor'), veilOn = $('v-veil-on'), plain = $('v-plain'), nightR = $('night'), cand = $('candle');
    hint(''); beckon([]);
    nightR.setAttribute('opacity', '0.86');
    cand.style.opacity = '0.12';
    const hid = has('veil-hidden');
    const seq = [
      { before: () => {}, blocks: [find('w_jane', 'That night Jane wakes')] },
      { before: () => { vis.setAttribute('opacity', '1'); pos.setAttribute('transform', 'translate(300 790)'); }, blocks: [find('w_jane', 'tall and large')] }
    ];
    if (hid) {
      seq.push({ before: () => { pos.setAttribute('transform', 'translate(560 790)'); }, blocks: S.scenes.r_jane.beats[0].blocks });
    } else {
      seq.push({ before: () => { cls('veil', 'hidden', true); veilOn.setAttribute('opacity', '1'); plain.setAttribute('opacity', '0'); pos.setAttribute('transform', 'translate(740 790)'); $('ghost').setAttribute('opacity', '1'); }, blocks: [find('w_jane', 'turned to the mirror')] });
      seq.push({ before: () => {}, blocks: [S.scenes.w_jane.beats[0].blocks.find(x => x && x.t === 'mirror')] });
      seq.push({ before: () => { veilOn.setAttribute('opacity', '0'); plain.setAttribute('opacity', '1'); cls('torn', 'hidden', false); $('ghost').setAttribute('opacity', '0'); }, blocks: [find('w_jane', 'removed my veil')] });
      seq.push({ before: () => { pos.setAttribute('transform', 'translate(1080 790)'); }, blocks: [find('w_jane', 'extinguished it under my eyes')] });
    }
    caption(seq, () => {
      vis.setAttribute('opacity', '0');
      flag('night-done'); see('jane', 'night');
      syncJane();
      toast(hid ? 'Morning. Nothing in the room has been touched.' : 'Morning.');
    });
  }

  /* the darkroom: three accounts of one night, developed from the same glass */
  const ACCOUNTS = [
    { k: 'a', label: 'Jane, that night', sub: 'Ch. XXV · what she saw', blocks: () => [find('w_jane', 'discoloured face'), find('w_jane', 'Vampyre')] },
    { k: 'b', label: 'Jane, the next evening', sub: 'Ch. XXV · what she told him', blocks: () => [find('w_jane', 'tall and large'), find('w_jane', 'turned to the mirror')] },
    { k: 'c', label: 'Rochester’s explanation', sub: 'Ch. XXV · what he told her', blocks: () => [find('w_jane', 'over-stimulated brain'), find('w_jane', 'half dream, half reality')] }
  ];
  const IMG = {
    a: `<rect width="300" height="380" fill="#f4eee2"/><g transform="translate(150 360)"><path d="M-110,0 C-104,-120 -80,-200 -60,-236 L60,-236 C80,-200 104,-120 110,0Z" fill="#1a1412"/><path d="M-56,-236 C-80,-300 -60,-344 -40,-356 L40,-356 C60,-344 80,-300 56,-236Z" fill="#100b0a"/><path d="M-44,-350 C-60,-450 60,-450 44,-350 C66,-280 72,-200 62,-140 L-62,-140 C-72,-200 -66,-280 -44,-350Z" fill="#0a0606"/></g><text x="150" y="30" text-anchor="middle" font-family="Courier Prime, monospace" font-size="12" letter-spacing="2" fill="#6b5d48">A SAVAGE FACE</text>`,
    b: `<rect width="300" height="380" fill="#f4eee2"/><rect x="186" y="40" width="88" height="200" fill="#2a2f36" opacity=".6"/><g transform="translate(130 370) scale(.78)"><path d="M-62,0 C-56,-120 -46,-220 -38,-262 L38,-262 C46,-220 56,-120 62,0Z" fill="#c9bfae"/><path d="M-38,-262 C-50,-300 -44,-334 -30,-348 L30,-348 C44,-334 50,-300 38,-262Z" fill="#3a302a"/><path d="M-24,-348 C-32,-424 32,-424 24,-348 C32,-300 36,-250 30,-200 L-30,-200 C-36,-250 -32,-300 -24,-348Z" fill="#1d1714"/><path d="M-36,-404 C-10,-436 10,-436 36,-404 C52,-330 60,-250 54,-180 L-54,-180 C-60,-250 -52,-330 -36,-404Z" fill="#fff" opacity=".5"/></g><text x="150" y="30" text-anchor="middle" font-family="Courier Prime, monospace" font-size="12" letter-spacing="2" fill="#6b5d48">TALL AND LARGE</text>`,
    c: `<rect width="300" height="380" fill="#f4eee2"/><g filter="url(#soft)" opacity=".55"><g transform="translate(150 360) scale(.55)"><path d="M-62,0 C-56,-120 -46,-220 -38,-262 L38,-262 C46,-220 56,-120 62,0Z" fill="#8a8072"/><path d="M-38,-262 C-50,-300 -44,-334 -30,-348 L30,-348 C44,-334 50,-300 38,-262Z" fill="#5a524a"/><path d="M-30,-350 C-36,-410 36,-410 30,-350Z" fill="#6a6258"/><path d="M-40,-392 C-20,-412 20,-412 40,-392 L36,-380 L-36,-380Z" fill="#e8e2d6"/></g></g><text x="150" y="30" text-anchor="middle" font-family="Courier Prime, monospace" font-size="12" letter-spacing="2" fill="#6b5d48">HALF DREAM</text>`
  };
  const printNode = (a, on) => el('button', { type: 'button', class: 'print', style: `--pr:${rnd(-4, 4).toFixed(1)}deg`, onclick: on, html: `<svg viewBox="0 0 300 380"><defs><filter id="soft"><feGaussianBlur stdDeviation="3"/></filter></defs>${IMG[a.k]}</svg>` }, el('span', { text: a.label }));
  function openPrint(a) { sheetOf(a.label, 'A print from the glass', body => blocksInto(body, a.blocks()), { cite: a.sub }); }
  function darkroom() {
    if (has('veil-hidden')) { toast('Nothing happened at this glass. There is nothing to develop.'); return; }
    const p = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' });
    const box = el('div', { class: 'panel-box' });
    const close = () => { p.remove(); syncJane(); };
    box.append(el('button', { type: 'button', class: 'panel-x', onclick: close }, 'Close ×'),
      el('p', { class: 'panel-k', text: 'The dark oblong glass' }), el('h2', { class: 'panel-t', text: 'Develop what the glass saw' }),
      el('p', { class: 'panel-s', text: 'Choose whose account to develop it in. Then rock the tray until the picture comes up.' }));
    const svgNS = 'http://www.w3.org/2000/svg';
    const task = el('div');
    task.innerHTML = `<svg class="task" viewBox="0 0 800 420" aria-label="A developing tray"><defs><filter id="soft"><feGaussianBlur stdDeviation="3"/></filter><linearGradient id="liq" x1="0" x2="1"><stop offset="0" stop-color="#2a1d14"/><stop offset=".5" stop-color="#3a2a1c"/><stop offset="1" stop-color="#2a1d14"/></linearGradient></defs>
      <g id="tray"><rect x="140" y="40" width="520" height="340" rx="18" fill="#3a3a38" stroke="#6e6b64" stroke-width="4"/><rect x="160" y="58" width="480" height="304" rx="10" fill="url(#liq)"/>
      <g id="sheet" opacity="0"><g transform="translate(325 72) scale(.5)"><g id="img" opacity="0"></g><rect width="300" height="380" fill="#f4eee2" id="blank"/></g></g>
      <path id="wave" d="M160,200 C260,186 340,214 440,200 C540,186 600,214 640,200" stroke="#5a4532" stroke-width="3" fill="none" opacity=".6"/></g></svg>`;
    const tsvg = task.firstChild;
    const pickRow = el('div', { class: 'choices-row' });
    const meter = el('div', { class: 'meter' }, el('i'));
    const status = el('p', { class: 'status', text: '' });
    const lift = el('button', { type: 'button', class: 'hold', hidden: true }, 'Lift it out');
    const prints = el('div', { class: 'prints' });
    box.append(task, pickRow, meter, status, lift, prints);
    p.append(box); document.body.append(p);
    let cur = null, prog = 0, lastX = null, dir = 0;
    const drawPrints = () => { prints.innerHTML = ''; s.prints.forEach(k => { const a = ACCOUNTS.find(x => x.k === k); prints.append(printNode(a, () => openPrint(a))); }); prints.hidden = !s.prints.length; };
    const drawPicks = () => {
      pickRow.innerHTML = '';
      ACCOUNTS.forEach(a => {
        const done = s.prints.includes(a.k);
        pickRow.append(el('button', { type: 'button', class: 'pick' + (cur === a ? ' on' : ''), disabled: done, onclick: () => choose(a) }, el('small', { text: done ? 'developed' : a.sub }), a.label));
      });
    };
    const choose = a => {
      cur = a; prog = 0; drawPicks();
      tsvg.querySelector('#img').innerHTML = IMG[a.k];
      tsvg.querySelector('#sheet').setAttribute('opacity', '1');
      tsvg.querySelector('#img').setAttribute('opacity', '0');
      tsvg.querySelector('#blank').setAttribute('opacity', '1');
      lift.hidden = true;
      status.textContent = 'Rock the tray: drag it side to side.';
      meter.firstChild.style.width = '0%';
    };
    const advance = d => {
      if (!cur || prog >= 1) return;
      prog = Math.min(1, prog + d);
      tsvg.querySelector('#img').setAttribute('opacity', String(prog));
      tsvg.querySelector('#blank').setAttribute('opacity', String(Math.max(0, 1 - prog * 1.4)));
      meter.firstChild.style.width = (prog * 100) + '%';
      if (prog >= 1) { status.textContent = 'It has come up.'; lift.hidden = false; }
      else if (prog > 0.5) status.textContent = 'Something is coming up.';
    };
    tsvg.addEventListener('pointerdown', e => { lastX = e.clientX; tsvg.setPointerCapture(e.pointerId); });
    tsvg.addEventListener('pointermove', e => {
      if (lastX === null) return;
      const dx = e.clientX - lastX;
      if (Math.abs(dx) > 6) {
        const nd = Math.sign(dx);
        if (nd !== dir) { dir = nd; advance(0.085); }
        const t = tsvg.querySelector('#tray'); t.setAttribute('transform', `rotate(${nd * 2.5} 400 210)`);
        tsvg.querySelector('#wave').setAttribute('d', nd > 0 ? 'M160,200 C260,214 340,186 440,200 C540,214 600,186 640,200' : 'M160,200 C260,186 340,214 440,200 C540,186 600,214 640,200');
        lastX = e.clientX;
      }
    });
    const up = () => { lastX = null; tsvg.querySelector('#tray').setAttribute('transform', ''); };
    tsvg.addEventListener('pointerup', up); tsvg.addEventListener('pointercancel', up);
    tsvg.setAttribute('tabindex', '0');
    tsvg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); advance(0.085); } });
    lift.addEventListener('click', () => {
      if (!s.prints.includes(cur.k)) s.prints.push(cur.k);
      save(); give('prints', 'The print is drying. It is in your satchel.');
      const a = cur; cur = null; drawPicks(); drawPrints(); lift.hidden = true; status.textContent = s.prints.length < 3 ? 'Develop another account of the same night.' : 'Three pictures of one night. None of them is her face.';
      tsvg.querySelector('#sheet').setAttribute('opacity', '0'); meter.firstChild.style.width = '0%';
      openPrint(a);
    });
    drawPicks(); drawPrints();
    status.textContent = 'Choose an account.';
  }

  /* ============================================================ GRACE POOLE'S ROOM */
  function drawGrace() {
    let b = wall(770) + floor(770);
    b += `<rect x="60" y="250" width="170" height="520" fill="#0b0908" stroke="#4a3d30" stroke-width="2"/><rect x="80" y="270" width="130" height="480" fill="none" stroke="${FAINT}"/>`;
    // fireplace, hob, saucepan, candle stub
    b += `<rect x="600" y="390" width="420" height="380" fill="#0c0a08" stroke="${INK}" stroke-width="2"/><rect x="570" y="362" width="480" height="30" fill="#1a1511" stroke="${INK}"/><path d="M660,770 L660,520 Q810,450 960,520 L960,770Z" fill="#060504"/>
      ${glow(810, 730, 260, 'gf', 'flicker')}<path class="flicker" d="M760,770 C770,712 800,700 795,654 C838,690 856,726 876,770Z" fill="#e39a4f" opacity=".75"/>
      <rect x="840" y="660" width="130" height="12" fill="${INK}"/>`;
    b += `<g id="pan" data-act="pan"><path d="M852,660 L862,600 L950,600 L960,660Z" fill="#2a231c" stroke="${INK}" stroke-width="2"/><line x1="960" y1="620" x2="1010" y2="612" stroke="${INK}" stroke-width="5"/><g id="lid" class="slide"><ellipse cx="906" cy="598" rx="50" ry="9" fill="#3a3028" stroke="${INK}"/><rect x="900" y="584" width="12" height="10" rx="3" fill="${INK}"/></g><g id="steam" opacity="0"><path class="steam" d="M890,580 C880,550 900,530 890,500" stroke="#a89a82" stroke-width="3" fill="none"/><path class="steam" style="animation-delay:.8s" d="M920,580 C930,550 912,530 924,496" stroke="#a89a82" stroke-width="3" fill="none"/></g></g>`;
    b += `<g id="stub" data-act="stub"><ellipse cx="990" cy="362" rx="24" ry="6" fill="#4a3d2c"/><path d="M978,362 L978,334 C984,328 996,328 1002,334 L1002,362Z" fill="#cfc2a6"/><path d="M980,336 C982,344 978,350 980,358" stroke="#a89a82" fill="none"/><path d="M990,330 L990,320" stroke="#111" stroke-width="3"/><path d="M984,334 C990,330 996,330 1000,334" stroke="#2a211a" stroke-width="3" fill="none"/></g>`;
    // Grace in her chair, asleep
    b += `<g id="chair"><path d="M250,930 L250,640 Q250,590 300,590 L470,590 Q520,590 520,640 L520,760 L540,760 L540,930" fill="none" stroke="${INK}" stroke-width="7"/><line x1="230" y1="760" x2="560" y2="760" stroke="${INK}" stroke-width="7"/></g>
      <g id="grace" data-act="grace"><g class="breathe"><path d="M300,760 C290,690 300,640 330,610 L440,610 C470,640 480,690 470,760Z" fill="#2e2620"/><path d="M330,610 C330,560 360,540 386,540 C412,540 440,560 440,610Z" fill="#241e19"/><path d="M350,548 C350,520 424,520 424,548 C424,560 350,560 350,548Z" fill="#e6dccb" opacity=".7"/><path d="M300,760 C300,800 470,800 470,760 L478,880 L292,880Z" fill="#2a221c"/>
        <g fill="none" stroke="#a89a82" filter="url(#sk)" opacity=".5" stroke-linecap="round"><path d="M300,760 C290,690 300,640 330,610 M470,760 C480,690 470,640 440,610" stroke-width="1.3"/><path d="M350,548 C350,520 424,520 424,548" stroke-width="1.2"/><path d="M292,880 L300,760 M478,880 L470,760" stroke-width="1"/></g></g>
        <path id="hand" d="M332,704 C350,696 374,696 390,706 C394,712 386,716 378,712 C364,706 346,708 336,712Z" fill="#8f826d" opacity=".75"/></g>
      <g id="pocket" data-act="pocket"><rect x="392" y="712" width="60" height="54" rx="4" fill="#d8ccb2" opacity=".45" stroke="#8a7a62"/><g id="keyglint"><circle cx="422" cy="716" r="9" fill="none" stroke="${TALLOW}" stroke-width="2.5"/><path d="M428,722 L440,706" stroke="${TALLOW}" stroke-width="2.5"/></g></g>`;
    // table and sewing box
    b += `<rect x="1100" y="610" width="380" height="20" fill="#2c2017" stroke="${INK}"/><line x1="1130" y1="630" x2="1130" y2="900" stroke="${INK}" stroke-width="8"/><line x1="1450" y1="630" x2="1450" y2="900" stroke="${INK}" stroke-width="8"/>
      <g id="box" data-act="box"><g id="bottle" class="hidden fade" data-act="bottle"><path d="M1272,470 L1290,470 L1290,494 C1302,500 1306,512 1306,524 L1306,580 L1256,580 L1256,524 C1256,512 1260,500 1272,494Z" fill="#22301f" stroke="${INK}"/></g>
        <rect x="1200" y="548" width="190" height="64" fill="#3a2a1c" stroke="${INK}" stroke-width="2"/><g id="threads" class="slide"><rect x="1210" y="540" width="170" height="14" fill="#2a1d14"/><circle cx="1240" cy="536" r="9" fill="#8e2a22"/><circle cx="1270" cy="536" r="9" fill="#3d5a78"/><circle cx="1300" cy="536" r="9" fill="#d8ccb2"/></g>
        <g id="boxlid" class="lid-hinge"><rect x="1196" y="526" width="198" height="24" fill="#4a3826" stroke="${INK}" stroke-width="2"/></g></g>`;
    b += glow(380, 640, 300, 'gc');
    mount(ROOMS.grace.place, b, 'Grace Poole’s room: a hearth with a saucepan, a candle stub on the mantel, Grace asleep in her chair, a sewing box on a table', graceAct);
    syncGrace();
    startStir();
    if (!s.intro.grace) { s.intro.grace = 1; save(); caption([find('w_grace', 'set, square-made figure')], syncGrace); }
  }
  function syncGrace() {
    cls('keyglint', 'hidden', s.inv.includes('keys'));
    cls('lid', 'lifted', has('pan-open'));
    const st = $('steam'); if (st) st.setAttribute('opacity', has('pan-open') ? '1' : '0');
    cls('box', 'open', has('box-open'));
    cls('threads', 'lifted', has('tray-out'));
    cls('bottle', 'hidden', !has('tray-out') || s.inv.includes('bottle'));
    const left = ['grace', 'pan', 'stub', 'box', 'pocket'].filter(k => !seen('grace', k));
    beckon(s.inv.includes('keys') ? left.filter(k => k !== 'pocket') : left.includes('pocket') ? ['pocket', ...left] : left);
    if (!s.inv.includes('keys')) hint('She is asleep. Her keys are in her apron pocket.');
    else if (left.length) hint('The keys are yours. There is more in this room.');
    else hint('You have seen this room. The corridor’s doors are locked; you have the keys.');
  }
  let stirT = null;
  function startStir() {
    clearTimeout(stirT);
    const tick = () => { const h = $('hand'); if (h && document.body.contains(h)) { h.classList.remove('twitch'); void h.getBoundingClientRect(); h.classList.add('twitch'); stirT = setTimeout(tick, rnd(5000, 9000)); } };
    stirT = setTimeout(tick, 4000);
  }
  function graceAct(id) {
    if (id === 'grace') { see('grace', 'grace'); return caption([{ blocks: [find('w_grace', 'set, square-made figure'), find('w_grace', 'household’s explanation')] }, { blocks: [find('w_grace', 'must have been—Grace Poole'), find('w_grace', 'Three times the household')] }], syncGrace); }
    if (id === 'pan') {
      if (has('pan-open')) { s.flags = s.flags.filter(f => f !== 'pan-open'); save(); return syncGrace(); }
      flag('pan-open'); see('grace', 'pan'); syncGrace();
      return caption([find('w_grace', 'Good-morrow, Mrs. Poole'), find('w_grace', 'tolerable')], syncGrace);
    }
    if (id === 'stub') {
      see('grace', 'stub');
      return caption([find('w_grace', 'demoniac laugh'), find('w_grace', 'Tongues of flame'), find('w_grace', 'you have guessed it')], () => stampReading(reading('w_grace'), 'The Fire', 'Chapter XV · her husband’s bed', null, syncGrace));
    }
    if (id === 'box') {
      if (!has('box-open')) { flag('box-open'); toast('Threads, needles, a pincushion.'); return syncGrace(); }
      if (!has('tray-out')) { flag('tray-out'); toast('The tray of threads lifts out. Something is underneath.'); return syncGrace(); }
      return;
    }
    if (id === 'bottle') {
      see('grace', 'box'); give('bottle', 'You took the bottle.');
      syncGrace();
      return caption([find('w_grace', 'private bottle of gin'), S.scenes.w_grace.beats[2].blocks.find(x => x && x.t === 'note')], syncGrace);
    }
    if (id === 'pocket') { if (s.inv.includes('keys')) { toast('The pocket is empty now.'); return; } return pickpocket(); }
  }

  /* reach into the pocket while she breathes out; freeze when she stirs */
  function pickpocket() {
    const p = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' });
    const box = el('div', { class: 'panel-box' });
    let raf = null, alive = true;
    const close = () => { alive = false; cancelAnimationFrame(raf); p.remove(); syncGrace(); };
    box.append(el('button', { type: 'button', class: 'panel-x', onclick: close }, 'Close ×'),
      el('p', { class: 'panel-k', text: 'Grace Poole’s apron' }), el('h2', { class: 'panel-t', text: 'Take the keys' }),
      el('p', { class: 'panel-s', text: 'Hold to reach in while she breathes out. When she breathes in, keep still. If her hand moves, let go.' }));
    const wrap = el('div');
    wrap.innerHTML = `<svg class="task" viewBox="0 0 800 380" aria-hidden="true">
      <rect width="800" height="380" fill="#120e0b"/>
      <g id="apron"><path d="M120,0 C110,140 120,260 140,380 L660,380 C680,260 690,140 680,0Z" fill="#2e2620"/><path d="M220,40 C214,170 220,270 234,380 L566,380 C580,270 586,170 580,40Z" fill="#cfc4ad" opacity=".85"/>
      <rect x="330" y="170" width="150" height="130" rx="10" fill="#bfb398" stroke="#8a7a62" stroke-width="2"/><path d="M330,186 L480,186" stroke="#8a7a62" stroke-dasharray="4 5"/>
      <g id="rk"><circle cx="402" cy="196" r="20" fill="none" stroke="${TALLOW}" stroke-width="5"/><path d="M414,210 L440,250 M430,236 L440,230" stroke="${TALLOW}" stroke-width="5" stroke-linecap="round"/></g></g>
      <g id="gh"><path d="M120,170 C150,150 210,150 240,174 L230,200 C200,186 160,186 130,200Z" fill="#cbbfa9"/></g>
      <g id="yh" transform="translate(0 0)"><path d="M800,330 L620,330 C590,330 570,318 560,300 L520,250 C512,240 520,226 534,232 L600,270 L800,270Z" fill="#9c8f78"/><path d="M520,250 C512,240 520,226 534,232" stroke="#6b5d48" fill="none"/></g>
      <g transform="translate(40 30)"><text font-family="Courier Prime, monospace" font-size="13" letter-spacing="2" fill="#7d725f">BREATH</text><path id="bw" d="" stroke="#5a4532" stroke-width="2" fill="none"/><circle id="bd" r="6" fill="${TALLOW}"/></g></svg>`;
    const sv = wrap.firstChild;
    const holdB = el('button', { type: 'button', class: 'hold' }, 'Hold to reach in');
    const meter = el('div', { class: 'meter' }, el('i'));
    const status = el('p', { class: 'status', text: 'She is breathing slowly.' });
    box.append(wrap, meter, status, holdB);
    p.append(box); document.body.append(p);
    // the breath wave
    let d = ''; for (let x = 0; x <= 200; x += 4) d += (x ? 'L' : 'M') + (x) + ',' + (40 + Math.sin(x / 200 * Math.PI * 2) * 14).toFixed(1); sv.querySelector('#bw').setAttribute('d', d.replace(/^M/, 'M').replace(/(\d+),/g, (m, n) => (+n) + ','));
    sv.querySelector('#bw').setAttribute('transform', 'translate(0 10)');
    let holding = false, prog = 0, t0 = performance.now(), last = t0, stirAt = t0 + rnd(3500, 6000), stirState = 0, cool = 0;
    const press = e => { e.preventDefault(); holding = true; holdB.classList.add('down'); };
    const release = () => { holding = false; holdB.classList.remove('down'); };
    holdB.addEventListener('pointerdown', press); holdB.addEventListener('pointerup', release); holdB.addEventListener('pointerleave', release); holdB.addEventListener('pointercancel', release);
    holdB.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); holding = true; holdB.classList.add('down'); } });
    holdB.addEventListener('keyup', release);
    const loop = now => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const ph = ((now - t0) / 4000) % 1;           // one breath every four seconds
      const out = ph >= 0.5;                       // the second half is the out-breath
      sv.querySelector('#apron').setAttribute('transform', `translate(0 ${(-Math.sin(ph * Math.PI * 2) * 6).toFixed(2)})`);
      sv.querySelector('#bd').setAttribute('cx', String(ph * 200)); sv.querySelector('#bd').setAttribute('cy', String(50 + Math.sin(ph * Math.PI * 2) * 14));
      if (now > stirAt && stirState === 0) { stirState = 1; stirAt = now + 700; status.textContent = 'Her fingers twitch…'; status.classList.add('bad'); }
      else if (stirState === 1 && now > stirAt) { stirState = 2; stirAt = now + 1300; sv.querySelector('#gh').setAttribute('transform', 'translate(30 -20) rotate(-6 180 180)'); }
      else if (stirState === 2 && now > stirAt) { stirState = 0; stirAt = now + rnd(4000, 7000); sv.querySelector('#gh').setAttribute('transform', ''); status.classList.remove('bad'); status.textContent = 'She settles again.'; }
      if (holding && cool <= 0) {
        if (stirState === 2) { prog = 0; cool = 1.2; release(); status.textContent = 'She stirs. You pull your hand back.'; status.classList.add('bad'); }
        else if (out) { prog = Math.min(1, prog + dt * 0.3); if (stirState === 0) { status.classList.remove('bad'); status.textContent = 'She breathes out. Reach.'; } }
        else { prog = Math.max(0, prog - dt * 0.18); if (stirState === 0) status.textContent = 'She breathes in. Keep still.'; }
      }
      cool -= dt;
      sv.querySelector('#yh').setAttribute('transform', `translate(${(-prog * 150).toFixed(1)} ${(-prog * 40).toFixed(1)})`);
      sv.querySelector('#rk').setAttribute('transform', prog > 0.85 ? `translate(${((prog - 0.85) * 900).toFixed(1)} ${(-(prog - 0.85) * 300).toFixed(1)})` : '');
      meter.firstChild.style.width = (prog * 100) + '%';
      if (prog >= 1) {
        alive = false; status.classList.remove('bad'); status.textContent = 'You have the keys.';
        setTimeout(() => {
          p.remove(); see('grace', 'pocket'); give('keys', 'Grace Poole’s keys are in your satchel.'); syncGrace();
          caption([find('room', 'twice to possess herself'), find('w_host', 'cunning as a witch')], syncGrace);
        }, 700);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  /* ============================================================ THE CORRIDOR */
  const P3 = (X, Y, Z) => [800 + 600 * X / Z, 470 - 600 * Y / Z];
  const poly = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const DOORS = { d1: { X: -1, z: 1.45, key: null, label: 'the door ajar' }, d2: { X: 1, z: 1.45, key: 1, label: 'a door on the right' }, d3: { X: -1, z: 3.0, key: 2, label: 'a far door on the left' }, d4: { X: 1, z: 3.0, key: 3, label: 'a far door on the right' } };
  function drawCorridor() {
    let b = `<rect width="1600" height="1000" fill="#110d0a"/>`;
    const near = 0.75, far = 7;
    [[-1, -1], [1, -1], [-1, 1.15], [1, 1.15]].forEach(([X, Y]) => { const a = P3(X, Y, near), c = P3(X, Y, far); b += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${INK}" stroke-width="1.5"/>`; });
    b += `<polygon points="${poly([P3(-1, -1, near), P3(1, -1, near), P3(1, -1, far), P3(-1, -1, far)])}" fill="#0d0a08"/>`;
    [-0.6, -0.2, 0.2, 0.6].forEach(X => { const a = P3(X, -1, near), c = P3(X, -1, far); b += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${FAINT}"/>`; });
    b += `<polygon points="${poly([P3(-1, -1, far), P3(1, -1, far), P3(1, 1.15, far), P3(-1, 1.15, far)])}" fill="#0c0a08" stroke="${INK}"/>`;
    b += glow(800, 440, 150, 'gm') + `<polygon points="${poly([P3(-0.26, 0, far), P3(0.26, 0, far), P3(0.26, 0.78, far), P3(-0.26, 0.78, far)])}" fill="#24303c" stroke="${GLASS}" opacity=".9"/>`;
    Object.entries(DOORS).forEach(([id, d]) => {
      const w = 0.5, top = 0.6;
      const pts = [P3(d.X, -1, d.z), P3(d.X, -1, d.z + w), P3(d.X, top, d.z + w), P3(d.X, top, d.z)];
      const open = s.doors[id] || id === 'd1';
      let g = `<polygon points="${poly(pts)}" fill="${open ? '#3a2a1a' : '#070605'}" stroke="#4a3d30" stroke-width="2"/>`;
      if (open) { const o = [P3(d.X, -1, d.z), P3(d.X * 0.62, -1, d.z + 0.08), P3(d.X * 0.62, top, d.z + 0.08), P3(d.X, top, d.z)]; g += `<polygon points="${poly(pts)}" fill="${TALLOW}" opacity="${id === 'd1' ? 0.22 : 0.08}"/><polygon points="${poly(o)}" fill="#0a0807" stroke="#4a3d30" stroke-width="2"/>`; }
      const kn = P3(d.X, -0.2, d.z + (d.X < 0 ? 0.42 : 0.08)); g += `<circle cx="${kn[0]}" cy="${kn[1]}" r="${(16 / d.z).toFixed(1)}" fill="#8a7a62"/>`;
      const sill = [P3(d.X, -0.985, d.z), P3(d.X, -0.985, d.z + w)];
      if (id === 'd4' && !open) g += `<line x1="${sill[0][0]}" y1="${sill[0][1]}" x2="${sill[1][0]}" y2="${sill[1][1]}" stroke="${TALLOW}" stroke-width="3" class="flicker"/>`;
      b += `<g id="${id}" data-act="${id}">${g}</g>`;
    });
    b += glow(800, 1000, 520);
    mount(ROOMS.corridor.place, b, 'The third-storey corridor: four small black doors, one ajar, and a little window at the far end', corridorAct);
    syncCorridor();
    if (!s.intro.corridor) { s.intro.corridor = 1; save(); caption([{ blocks: S.scenes.corridor.beats[0].blocks }], syncCorridor); }
  }
  function syncCorridor() {
    const next = [];
    if (!has('laugh-heard')) { next.push('d1', 'd2', 'd3', 'd4'); hint('Listen at the doors. One of them is not quiet.'); }
    else if (!s.inv.includes('keys')) { next.push('d1'); hint('Every door is locked except the one ajar. Someone sews in there.'); }
    else if (!s.doors.d4) { next.push('d4', 'd2', 'd3'); hint('You have Grace Poole’s keys. Try the locks.'); }
    else hint('The far door is open. What is behind it comes next.');
    beckon(next);
  }
  function corridorAct(id) {
    see('corridor', id);
    const d = DOORS[id];
    const p = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' });
    const box = el('div', { class: 'panel-box', style: 'width:min(560px,100%)' });
    const close = () => { p.remove(); syncCorridor(); };
    box.append(el('button', { type: 'button', class: 'panel-x', onclick: close }, 'Close ×'), el('p', { class: 'panel-k', text: 'The third storey' }), el('h2', { class: 'panel-t', text: d.label.charAt(0).toUpperCase() + d.label.slice(1) }));
    const status = el('p', { class: 'status' });
    const meter = el('div', { class: 'meter' }, el('i'));
    const listen = el('button', { type: 'button', class: 'hold' }, 'Hold to listen');
    let lt = null, lstart = 0;
    const stopL = () => { cancelAnimationFrame(lt); lt = null; listen.classList.remove('down'); meter.firstChild.style.width = '0%'; };
    const heard = () => {
      stopL();
      if (id === 'd4') {
        p.remove(); flag('laugh-heard');
        caption([{ blocks: S.scenes.corridor.beats[1].blocks }, { blocks: S.scenes.corridor.beats[2].blocks.slice(0, 2) }], () => stampReading(S.scenes.corridor.beats[2].reading, 'A Curious Laugh', 'Chapter XI · through a shut door', null, syncCorridor));
      } else if (id === 'd1') {
        status.classList.remove('bad'); status.innerHTML = '';
        box.append(el('div', { class: 'sheet-body', style: 'margin-top:.6rem' }));
        blocksInto(box.lastChild, [Q('Mrs. Fairfax', 'Ch. XI', '“Yes, plainly: I often hear her: she sews in one of these rooms.”')]);
        box.lastChild.querySelectorAll('blockquote').forEach(q => { q.style.color = 'var(--vellum)'; });
      } else { status.textContent = 'Silence.'; }
    };
    listen.addEventListener('pointerdown', e => { e.preventDefault(); listen.classList.add('down'); lstart = performance.now(); status.textContent = 'You put your ear to the door…'; status.classList.remove('bad');
      const step = now => { const k = Math.min(1, (now - lstart) / 1300); meter.firstChild.style.width = (k * 100) + '%'; if (k >= 1) heard(); else lt = requestAnimationFrame(step); }; lt = requestAnimationFrame(step); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => listen.addEventListener(ev, () => { if (lt) { stopL(); status.textContent = 'You straightened up too soon.'; } }));
    listen.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heard(); } });
    const tryB = el('button', { type: 'button', class: 'hold', style: 'margin-top:.5rem' }, id === 'd1' ? 'Go in' : s.doors[id] ? 'Look inside' : 'Try the door');
    tryB.addEventListener('click', () => {
      if (id === 'd1') { p.remove(); return goRoom('grace'); }
      if (s.doors[id]) { status.textContent = id === 'd4' ? 'A hanging covers the far wall. Behind it, the inner room: the next part to build.' : 'An empty room. Furniture under dust sheets.'; return; }
      if (!s.inv.includes('keys')) { status.classList.add('bad'); status.textContent = 'Locked.'; return; }
      p.remove(); lockPick(id);
    });
    box.append(listen, meter, status, tryB);
    p.append(box); document.body.append(p);
  }

  /* the lock: choose a key from the ring, then turn it */
  function lockPick(id) {
    const d = DOORS[id];
    const p = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' });
    const box = el('div', { class: 'panel-box', style: 'width:min(640px,100%)' });
    const close = () => { p.remove(); syncCorridor(); };
    box.append(el('button', { type: 'button', class: 'panel-x', onclick: close }, 'Close ×'), el('p', { class: 'panel-k', text: 'Grace Poole’s keys' }), el('h2', { class: 'panel-t', text: 'The lock' }), el('p', { class: 'panel-s', text: 'Choose a key. Then drag it round, clockwise, to turn it.' }));
    const wrap = el('div');
    wrap.innerHTML = `<svg class="task" viewBox="0 0 600 360" aria-hidden="true"><rect width="600" height="360" fill="#120e0b"/>
      <rect x="170" y="30" width="260" height="300" rx="18" fill="#6b5536" stroke="#b9a27a" stroke-width="3"/><rect x="186" y="46" width="228" height="268" rx="12" fill="none" stroke="#8a6a48"/>
      <circle cx="160" cy="0" r="0"/><circle cx="300" cy="150" r="70" fill="#5a4630" stroke="#3a2a1a" stroke-width="2"/>
      <g id="kh"><path d="M300,120 a20,20 0 1 1 0.1,0 M290,150 L310,150 L316,200 L284,200Z" fill="#080605"/></g>
      <g id="kk" style="transition:transform .15s" transform="rotate(0 300 150)" opacity="0"><rect x="294" y="70" width="12" height="90" fill="#d6c08f"/><circle cx="300" cy="62" r="22" fill="none" stroke="#d6c08f" stroke-width="9"/><g id="bit"></g></g>
      <g id="pins">${[0, 1, 2].map(i => `<rect x="${262 + i * 26}" y="236" width="14" height="40" fill="#3a2a1a" stroke="#8a6a48"/>`).join('')}</g></svg>`;
    const sv = wrap.firstChild;
    const BITS = ['M306,150 L322,150 L322,160 L306,160Z', 'M306,146 L318,146 L318,166 L306,166Z', 'M306,150 L330,150 L330,156 L320,156 L320,164 L306,164Z', 'M306,148 L314,148 L314,156 L326,156 L326,166 L306,166Z'];
    const row = el('div', { class: 'choices-row' });
    const status = el('p', { class: 'status', text: 'Four keys on the ring.' });
    box.append(wrap, row, status);
    p.append(box); document.body.append(p);
    let chosen = null, ang = 0, dragging = false, cx = 0, cy = 0;
    ['the long key', 'the plain key', 'the notched key', 'the black key'].forEach((nm, i) => row.append(el('button', { type: 'button', class: 'pick', onclick: e => {
      chosen = i; ang = 0; row.querySelectorAll('.pick').forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on');
      sv.querySelector('#bit').innerHTML = `<path d="${BITS[i]}" fill="#d6c08f"/>`;
      const k = sv.querySelector('#kk'); k.setAttribute('opacity', '1'); k.setAttribute('transform', 'rotate(0 300 150)');
      status.classList.remove('bad'); status.textContent = 'The key slides in. Turn it.';
    } }, el('small', { text: `key ${i + 1}` }), nm)));
    const angle = e => { const R = sv.getBoundingClientRect(); cx = R.left + R.width * 0.5; cy = R.top + R.height * (150 / 360); return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI; };
    let a0 = 0, start = 0;
    sv.addEventListener('pointerdown', e => { if (chosen === null) { status.textContent = 'Choose a key first.'; return; } dragging = true; a0 = angle(e); start = ang; sv.setPointerCapture(e.pointerId); });
    sv.addEventListener('pointermove', e => {
      if (!dragging) return;
      let da = angle(e) - a0; if (da < -180) da += 360; if (da > 180) da -= 360;
      const right = chosen === d.key;
      const max = right ? 90 : 16;
      ang = Math.max(0, Math.min(max, start + da));
      sv.querySelector('#kk').setAttribute('transform', `rotate(${ang.toFixed(1)} 300 150)`);
      [...sv.querySelectorAll('#pins rect')].forEach((r, i) => r.setAttribute('y', String(236 - (right ? Math.min(1, ang / (30 + i * 25)) * 18 : 0))));
      if (!right && ang >= 15) { status.classList.add('bad'); status.textContent = 'It won’t turn.'; }
      if (right && ang >= 89) {
        dragging = false; status.classList.remove('bad'); status.textContent = 'The lock gives.';
        s.doors[id] = true; save();
        setTimeout(() => {
          p.remove(); drawCorridor();
          if (id === 'd4') sheetOf('Behind the far door', 'The third storey', body => {
            blocksInto(body, [find('room', 'lifted the hangings'), find('room', 'In a room without a window')]);
            body.append(el('p', { class: 'nar', html: '<p>The inner room is the next part of the house to build. In the full game you go in with your candle; the cut-out testimony is there.</p>' }));
          });
        }, 600);
      }
    });
    const up = () => { dragging = false; if (chosen !== d.key && ang > 0) { ang = 0; sv.querySelector('#kk').setAttribute('transform', 'rotate(0 300 150)'); } };
    sv.addEventListener('pointerup', up); sv.addEventListener('pointercancel', up);
  }

  window.UH._p2 = { get state() { return s; }, goRoom, restart };
  start();
});
