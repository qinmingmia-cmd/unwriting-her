/* Before She Answers: the chapter's own engine.
   It shares the site's shelf, router and wordmark, and nothing else: no roles, no hearing, no Record.
   State is namespaced and versioned in localStorage; a corrupt or missing save simply starts fresh.
   Every rendered beat is stored with its evaluated text, so resuming shows exactly what was shown. */
(function () {
  'use strict';
  const UH = window.UH;
  const KEY = 'unwriting-her:moon-orchid:v1', V = 1;
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fresh = () => ({ v: V, scene: 'entry', trail: [], f: {}, account: {}, said: [], wishes: {}, log: [], done: [], tags: {}, focus: null, explained: false, hinted: [], order: [] });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const s = JSON.parse(raw);
      const C = UH.MO;
      if (!s || s.v !== V || (s.scene !== 'entry' && !C.scenes[s.scene])) return fresh();
      const out = Object.assign(fresh(), s);
      if (out.scene !== 'entry' && out.trail.some(t => !C.scenes[out.scene].beats[t.b])) return fresh();
      return out;
    } catch (e) { return fresh(); }
  }
  let s = null;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: the run still works */ } };

  const chapter = {
    id: 'moon-orchid', start: 'arrivals', endings: {}, scenes: {},
    mount,
    started: () => { const x = load(); return x.scene !== 'entry'; },
    reset: () => { s = fresh(); save(); },
    endingsReached: () => []
  };
  UH.registerStory(chapter);
  UH._mo = { get state() { return s; }, reset: () => chapter.reset() };

  /* ------------------------------------------------------------ dom helpers */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => { if (c == null || c === false) return; n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  }
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ital = t => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');

  let C, A, host, root, artBox, attnEl, accountEl, flowEl, ctlEl, drawer, drawerBtn, menu, menuBtn, sceneHead;
  const who = id => (C.who[id] && C.who[id].name) || (id === 'coat' ? 'A stranger in a smart coat' : id);
  const scene = () => C.scenes[s.scene];
  const beatOf = id => scene().beats[id];

  /* ============================================================ MOUNT */
  function mount(app, h) {
    C = UH.MO; A = UH.MOart; host = h;
    s = load();
    app.className = 'view-mo';
    app.innerHTML = '';
    root = el('div', { class: 'mo' });
    app.append(root);
    if (s.scene === 'entry') renderEntry(); else renderStage(true);
  }

  /* ============================================================ ENTRY */
  function renderEntry() {
    root.innerHTML = '';
    root.className = 'mo mo-at-entry';
    const started = s.trail.length > 0 || s.said.length > 0;
    const flap = el('div', { class: 'mo-flaps', 'aria-hidden': 'true' });
    const word = 'BEFORE SHE ANSWERS';
    [...word].forEach((ch, i) => flap.append(el('span', { class: 'mo-flap' + (ch === ' ' ? ' sp' : ''), style: `--i:${i}`, 'data-ch': ch }, el('b', { text: ch === ' ' ? '' : ch }))));
    const note = el('details', { class: 'mo-note' }, el('summary', {}, 'Content note'), el('p', { text: C.contentNote }));
    const how = el('details', { class: 'mo-note' }, el('summary', {}, 'How this chapter works'), ...C.howTo.map(t => el('p', { text: t })), el('p', { text: C.sourceNote }));
    const confirm = el('div', { class: 'mo-confirm', hidden: true },
      el('p', { text: 'Start this chapter again from the airport? Your other chapters are not affected.' }),
      el('div', { class: 'mo-row' },
        el('button', { type: 'button', class: 'mo-btn', onclick: () => { chapter.reset(); begin(); } }, 'Start again'),
        el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => { confirm.hidden = true; } }, 'Keep my place')));
    const actions = el('div', { class: 'mo-row' },
      started ? el('button', { type: 'button', class: 'mo-btn', onclick: () => { s.scene = s.order.length ? s.scene : 'arrivals'; resume(); } }, 'Continue') : el('button', { type: 'button', class: 'mo-btn', onclick: begin }, 'Begin'),
      started ? el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => { confirm.hidden = false; } }, 'Start again') : null,
      el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => host.navigate('reading-room') }, 'Back to the Reading Room'));
    root.append(
      bar(false),
      el('main', { class: 'mo-entry', id: 'mo-main' },
        el('div', { class: 'mo-entry-art', html: luggage() }),
        flap,
        el('h1', { class: 'mo-title', text: C.title }),
        el('p', { class: 'mo-sub', text: C.sub }),
        el('p', { class: 'mo-notice', text: C.notice }),
        note, how, actions, confirm));
    if (!reduce()) requestAnimationFrame(() => flap.classList.add('go')); else flap.classList.add('go', 'still');
  }
  function luggage() {
    return `<svg viewBox="0 0 520 170" aria-hidden="true"><ellipse cx="260" cy="160" rx="250" ry="10" fill="rgba(70,48,28,.14)"/>
      <rect x="40" y="40" width="160" height="116" rx="10" fill="#8e6f4c"/><path d="M95,40 C95,14 145,14 145,40" stroke="#5c3d25" stroke-width="8" fill="none"/><rect x="74" y="40" width="9" height="116" fill="#000" opacity=".13"/><rect x="158" y="40" width="9" height="116" fill="#000" opacity=".13"/>
      <rect x="214" y="70" width="130" height="86" rx="8" fill="#6b8a7b"/><path d="M256,70 C256,52 302,52 302,70" stroke="#4c7563" stroke-width="7" fill="none"/>
      <rect x="360" y="88" width="120" height="68" fill="#c9a874"/><path d="M360,88 L480,88 L470,76 L370,76Z" fill="#d9bb88"/><path d="M420,76 L420,156 M360,122 L480,122" stroke="#6e5536" stroke-width="3"/><path d="M410,66 C416,76 424,76 430,66" stroke="#6e5536" stroke-width="3" fill="none"/></svg>`;
  }
  function begin() { s = fresh(); s.scene = C.start; save(); goScene(C.start, true); }
  function resume() { renderStage(true); }

  /* ============================================================ CHROME */
  function bar(inStory) {
    const b = el('header', { class: 'mo-bar' },
      el('button', { type: 'button', class: 'mo-word', onclick: () => host.navigate('reading-room'), title: 'Back to the Reading Room' }, 'Unwriting Her'),
      el('span', { class: 'mo-bar-place' }, inStory ? sceneLabel() : 'Moon Orchid'));
    if (!inStory) return b;
    drawerBtn = el('button', { type: 'button', class: 'mo-bar-btn', 'aria-expanded': 'false', 'aria-controls': 'mo-said', onclick: () => openDrawer() }, 'What was said');
    menuBtn = el('button', { type: 'button', class: 'mo-bar-btn', 'aria-expanded': 'false', 'aria-controls': 'mo-menu' }, 'Menu');
    const confirm = el('div', { class: 'mo-confirm', hidden: true },
      el('p', { text: 'Start this chapter again? Everything you have done in it will be cleared. Other chapters are not affected.' }),
      el('div', { class: 'mo-row' },
        el('button', { type: 'button', class: 'mo-btn small', onclick: () => { closeMenu(); chapter.reset(); renderEntry(); } }, 'Start again'),
        el('button', { type: 'button', class: 'mo-btn small quiet', onclick: () => { confirm.hidden = true; } }, 'Keep my place')));
    menu = el('div', { class: 'mo-menu', id: 'mo-menu', hidden: true },
      el('button', { type: 'button', class: 'mo-menu-item', onclick: () => { closeMenu(); renderEntry(); } }, 'Title page and notes'),
      el('button', { type: 'button', class: 'mo-menu-item', onclick: () => { closeMenu(); host.navigate('reading-room'); } }, 'Back to the Reading Room'),
      el('button', { type: 'button', class: 'mo-menu-item', onclick: () => { confirm.hidden = false; } }, 'Start this chapter again'),
      confirm);
    function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); confirm.hidden = true; }
    menuBtn.addEventListener('click', e => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('button').focus(); });
    document.addEventListener('click', e => { if (menu && !menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
    b.append(el('div', { class: 'mo-bar-r' }, drawerBtn, el('div', { class: 'mo-menu-wrap' }, menuBtn, menu)));
    return b;
  }
  function sceneLabel() { const sc = scene(); return sc ? `${C.movements[sc.mv].n} · ${C.movements[sc.mv].title}` : ''; }

  /* ============================================================ STAGE */
  function renderStage(resuming) {
    root.innerHTML = '';
    root.className = 'mo mo-in';
    const sc = scene();
    artBox = el('div', { class: 'mo-art-in' });
    attnEl = el('figcaption', { class: 'mo-attn', 'aria-live': 'polite' });
    accountEl = el('div', { class: 'mo-account', role: 'status', 'aria-live': 'polite' });
    sceneHead = el('header', { class: 'mo-scene-head' },
      el('p', { class: 'mo-kicker', text: `Movement ${C.movements[sc.mv].n} · ${C.movements[sc.mv].title}` }),
      el('h2', { class: 'mo-scene-title', text: sc.title, tabindex: '-1' }),
      el('p', { class: 'mo-place', text: sc.place }));
    flowEl = el('div', { class: 'mo-flow' });
    ctlEl = el('div', { class: 'mo-ctl' });
    drawer = el('aside', { class: 'mo-drawer', id: 'mo-said', 'aria-label': 'What was said', hidden: true, tabindex: '-1' });
    const left = el('div', { class: 'mo-left' }, el('figure', { class: 'mo-art' }, artBox, attnEl));
    const col = el('section', { class: 'mo-col', 'aria-label': 'The story' }, sceneHead, flowEl, ctlEl);
    root.append(bar(true), el('main', { class: 'mo-stage', id: 'mo-main', 'data-mv': sc.mv }, left, col), drawer);
    // the account captions the picture on wide screens, and rides at the top of the text on narrow ones
    const narrow = window.matchMedia('(max-width: 900px)');
    const place = () => { if (narrow.matches) col.prepend(accountEl); else left.append(accountEl); };
    place();
    if (narrow.addEventListener) narrow.addEventListener('change', place);
    artBox.innerHTML = A[sc.art]();
    s.trail.forEach((item, i) => flowEl.append(renderItem(item, false)));
    applyArt(); drawAccount(false); drawControls();
    window.scrollTo(0, resuming ? Math.max(0, document.documentElement.scrollHeight) : 0);
    if (resuming) { const last = flowEl.lastElementChild; if (last) last.scrollIntoView({ block: 'end' }); }
  }

  /* ---------- art: tags and attention */
  function applyArt() {
    const svg = artBox.querySelector('svg');
    if (!svg) return;
    const tags = new Set(s.tags[s.scene] || []);
    svg.querySelectorAll('[data-on]').forEach(n => n.classList.toggle('mo-vis', n.dataset.on.split(/\s+/).some(t => tags.has(t))));
    svg.querySelectorAll('[data-on]').forEach(n => n.classList.add('mo-tag'));
    svg.querySelectorAll('[data-off]').forEach(n => n.classList.toggle('mo-gone', n.dataset.off.split(/\s+/).some(t => tags.has(t))));
    svg.querySelectorAll('.fig').forEach(n => n.classList.toggle('lit', n.dataset.who === s.focus));
    attnEl.innerHTML = s.focus && s.focus !== 'none' ? `The room is turned toward <b>${esc(who(s.focus))}</b>` : '';
  }
  function tag(list) { if (!list) return; const t = s.tags[s.scene] = s.tags[s.scene] || []; list.forEach(x => { if (!t.includes(x)) t.push(x); }); }

  /* ---------- the account at the top of the page */
  function drawAccount(animate) {
    const a = s.account[s.scene];
    accountEl.innerHTML = '';
    accountEl.append(el('p', { class: 'mo-account-k', text: 'As it will be told' }));
    if (!a) { accountEl.append(el('p', { class: 'mo-account-t empty', text: 'Nothing here has been put into words yet.' })); return; }
    const q = el('p', { class: 'mo-account-t' + (animate && !reduce() ? ' arriving' : ''), 'data-who': a.who, text: a.who === 'none' ? a.text : '“' + a.text + '”' });
    accountEl.append(q, el('p', { class: 'mo-account-by', text: a.who === 'none' ? 'No one’s version' : a.who === 'mo' ? 'In her words' : who(a.who) + '’s version' }));
    // the versions this one replaced stay visible, struck through, so the change itself can be seen
    const was = s.said.filter(x => x.k === 'account' && x.sc === s.scene).slice(0, -1);
    if (was.length) accountEl.append(el('div', { class: 'mo-account-was' }, el('p', { class: 'mo-account-k', text: 'Replaced' }),
      ...was.reverse().map(x => el('p', {}, el('s', { text: x.who === 'none' ? x.text : '“' + x.text + '”' }), el('span', { text: x.who === 'none' ? '' : x.who === 'mo' ? ' · her words' : ' · ' + who(x.who) })))));
  }
  function setAccount(a, via) {
    if (!a) return;
    const prev = s.account[s.scene];
    if (prev && prev.text === a.text && prev.who === a.who) return;
    s.account[s.scene] = { who: a.who, text: a.text };
    s.said.push({ k: 'account', sc: s.scene, who: a.who, text: a.text, via: via || null });
  }

  /* ---------- rendering an item of the trail */
  function lineNode(l, extra) {
    const n = el('div', { class: 'mo-line' + (extra ? ' ' + extra : ''), 'data-who': l.who },
      el('p', { class: 'mo-who' }, el('span', { text: who(l.who) }), l.en ? el('span', { class: 'mo-lang', text: 'in English' }) : null, l.wish ? el('span', { class: 'mo-wish', text: 'a plan of hers' }) : null),
      el('p', { class: 'mo-words', html: ital(l.text) }));
    return n;
  }
  function stepNode(st) {
    if (st.t === 'n') return el('p', { class: 'mo-narr', html: ital(st.text) });
    if (st.t === 'l') return lineNode(st);
    return null;
  }
  function renderItem(item, fresh) {
    const bt = beatOf(item.b);
    const wrap = el('div', { class: 'mo-beat', 'data-beat': item.b });
    if (item.diverge) wrap.append(el('p', { class: 'mo-diverge', text: 'Imagined divergence' }));
    item.r.forEach(st => { const n = stepNode(st); if (n) wrap.append(n); });
    if (bt.displace) {
      const d = bt.displace;
      const restored = item.o && s.account[s.scene] && item.restored;
      const hers = lineNode(d.line, 'mo-displaced' + (restored ? ' restored' : ''));
      hers.append(el('p', { class: 'mo-tagline', text: restored ? 'Back in the account, in her words.' : 'Set aside before she finished.' }));
      const over = lineNode(d.over, 'mo-over');
      over.append(el('p', { class: 'mo-tagline', text: 'Taken up as the account.' }));
      wrap.append(hers, over);
      if (fresh && !reduce()) { over.classList.add('arriving'); hers.classList.add('waiting'); setTimeout(() => hers.classList.remove('waiting'), 900); }
      if (d.explain && item.explain) wrap.append(el('p', { class: 'mo-explain', text: d.explain }));
    }
    if (bt.margin) bt.margin.forEach((m, i) => wrap.append(marginNode(m, item.b + i)));
    if (item.o) {
      const o = bt.choices.find(x => x.id === item.o);
      wrap.append(el('p', { class: 'mo-you' }, el('span', { class: 'mo-you-k', text: 'You' }), el('span', { text: o.log })));
      (item.rr || []).forEach(st => { const n = stepNode(st); if (n) wrap.append(n); });
    }
    return wrap;
  }
  const TIER = { context: 'Context', criticism: 'Criticism', annotation: 'Annotation', conjecture: 'Conjecture' };
  function marginNode(m, key) {
    const id = 'mo-m-' + key;
    const body = el('div', { class: 'mo-margin-body', id, hidden: true }, el('p', { class: 'mo-margin-by', text: [TIER[m.tier], m.by].filter(Boolean).join(' · ') }), el('p', { html: ital(m.text) }));
    const btn = el('button', { type: 'button', class: 'mo-margin-btn', 'aria-expanded': 'false', 'aria-controls': id, 'data-tier': m.tier },
      el('span', { class: 'mo-margin-dot', 'aria-hidden': 'true' }), 'In the margin · ' + TIER[m.tier]);
    btn.addEventListener('click', () => { const open = body.hidden; body.hidden = !open; btn.setAttribute('aria-expanded', String(open)); });
    return el('div', { class: 'mo-margin', 'data-tier': m.tier }, btn, body);
  }

  /* ---------- controls: choices, Wait, Continue */
  function drawControls() {
    ctlEl.innerHTML = '';
    const sc = scene();
    const item = s.trail[s.trail.length - 1];
    if (!item) return;
    const bt = beatOf(item.b);
    if (sc.end && !bt.choices) {
      ctlEl.append(el('div', { class: 'mo-end' },
        el('p', { class: 'mo-end-k', text: 'End of the preview' }),
        el('div', { class: 'mo-row' },
          el('button', { type: 'button', class: 'mo-btn', onclick: () => openDrawer() }, 'Read what was said'),
          el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => host.navigate('reading-room') }, 'Back to the Reading Room'))));
      return;
    }
    if (bt.choices && !item.o) {
      const opts = bt.choices.filter(o => !o.when || o.when(s));
      if (bt.hint && !s.hinted.includes(item.b)) ctlEl.append(el('p', { class: 'mo-hint', text: bt.hint }));
      const list = el('div', { class: 'mo-choices', role: 'group', 'aria-label': 'What you do' });
      opts.forEach(o => list.append(el('button', { type: 'button', class: 'mo-choice' + (o.kind === 'wait' ? ' wait' : ''), onclick: () => choose(o) }, o.label)));
      ctlEl.append(list);
      return;
    }
    ctlEl.append(el('button', { type: 'button', class: 'mo-continue', onclick: advance }, 'Continue'));
  }

  /* ============================================================ MOVING THROUGH THE STORY */
  const evalSteps = list => (list || []).map(st => typeof st === 'function' ? st(s) : st).filter(Boolean).map(x => Object.assign({}, x));
  function enterBeat(id) {
    const bt = beatOf(id);
    const item = { b: id, r: evalSteps(bt.steps) };
    if (bt.diverge && !s.f['div_' + s.scene]) { item.diverge = true; s.f['div_' + s.scene] = true; }
    if (bt.displace && bt.displace.explain && !s.explained) { item.explain = true; s.explained = true; }
    s.trail.push(item);
    // record what was said, in order
    item.r.forEach(st => { if (st.t === 'l') recordLine(st); });
    if (bt.displace) {
      recordLine(bt.displace.line, { set: true });
      recordLine(bt.displace.over);
      setAccount(bt.displace.account);
    }
    if (bt.account) setAccount(bt.account);
    tag(bt.show);
    if (bt.focus) s.focus = bt.focus;
    save();
    const node = renderItem(item, true);
    flowEl.append(node);
    applyArt(); drawAccount(!!(bt.displace || bt.account)); drawControls();
    focusNew(node);
  }
  function recordLine(l, o) {
    s.said.push({ k: 'line', sc: s.scene, who: l.who, text: l.text, en: !!l.en, wish: l.wish || null, setAside: !!(o && o.set) });
    if (l.wish && !s.wishes[l.wish]) s.wishes[l.wish] = { text: l.text, sc: s.scene, status: 'Said aloud.' };
  }
  function choose(o) {
    const item = s.trail[s.trail.length - 1];
    const bt = beatOf(item.b);
    if (bt.hint && !s.hinted.includes(item.b)) s.hinted.push(item.b);
    item.o = o.id;
    s.log.push({ sc: s.scene, b: item.b, o: o.id, text: o.log });
    s.said.push({ k: 'you', sc: s.scene, text: o.log, wait: o.kind === 'wait' });
    if (o.set) o.set(s);
    item.rr = evalSteps(o.reply);
    item.rr.forEach(st => { if (st.t === 'l') recordLine(st); });
    if (o.account) { setAccount(o.account, o.log); if (o.account.who === 'mo') { item.restored = true; markRestored(); } }
    if (o.wish) { const w = s.wishes[o.wish.id]; if (w) w.status = o.wish.status; }
    tag(o.show);
    if (o.focus) s.focus = o.focus;
    item.next = o.next || null;
    save();
    const old = flowEl.lastElementChild;
    const node = renderItem(item, false);
    flowEl.replaceChild(node, old);
    applyArt(); drawAccount(!!o.account); drawControls();
    const you = node.querySelector('.mo-you');
    focusNew(you || node);
    if (o.next && !(o.reply && o.reply.length)) advance();
  }
  function markRestored() {
    for (let i = s.said.length - 1; i >= 0; i--) { const x = s.said[i]; if (x.sc === s.scene && x.setAside) { x.restored = true; break; } }
  }
  function advance() {
    const item = s.trail[s.trail.length - 1];
    const bt = beatOf(item.b);
    let n = item.next || bt.next;
    if (typeof n === 'function') n = n(s);
    if (!n) return;
    if (typeof n === 'object' && n.scene) return goScene(n.scene);
    enterBeat(n);
  }
  function goScene(id, first) {
    const prev = s.scene;
    if (!first && prev && prev !== 'entry' && !C.scenes[prev].hub && !s.done.includes(prev)) s.done.push(prev);
    const prevMv = prev && C.scenes[prev] ? C.scenes[prev].mv : null;
    s.scene = id; s.trail = []; s.focus = null;
    s.tags[id] = [];
    if (!s.order.includes(id)) s.order.push(id);
    save();
    const go = () => { renderStage(false); enterBeat(C.scenes[id].first); const t = sceneHead.querySelector('.mo-scene-title'); if (t) t.focus({ preventScroll: true }); };
    if (C.scenes[id].mv !== prevMv) titleCard(C.movements[C.scenes[id].mv], go); else go();
  }
  function focusNew(node) {
    if (!node) return;
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
    node.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'nearest' });
  }
  function titleCard(m, then) {
    if (reduce()) { then(); return; }
    const card = el('div', { class: 'mo-card', role: 'presentation' }, el('p', { class: 'mo-card-k', text: 'Movement ' + m.n }), el('p', { class: 'mo-card-t', text: m.title }));
    let done = false;
    const end = () => { if (done) return; done = true; card.classList.add('out'); setTimeout(() => card.remove(), 600); then(); };
    card.addEventListener('click', end);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { document.removeEventListener('keydown', k); end(); } });
    document.body.append(card);
    setTimeout(end, 1700);
  }

  /* ============================================================ WHAT WAS SAID */
  function openDrawer() {
    if (!drawer) return;
    drawer.innerHTML = '';
    const close = () => { drawer.hidden = true; drawerBtn.setAttribute('aria-expanded', 'false'); drawerBtn.focus(); document.removeEventListener('keydown', esc_); };
    const esc_ = e => { if (e.key === 'Escape') close(); };
    drawer.append(el('header', { class: 'mo-drawer-head' },
      el('h2', { text: 'What was said' }),
      el('button', { type: 'button', class: 'mo-bar-btn', onclick: close }, 'Close')),
      el('p', { class: 'mo-drawer-lede', text: 'Every line in the order it was spoken, including the ones that were set aside, and every account as it changed. What you did is marked too. Reading this changes nothing.' }));
    const wishes = Object.entries(s.wishes);
    if (wishes.length) {
      drawer.append(el('h3', { class: 'mo-drawer-sc', text: 'Her plans' }));
      drawer.append(el('ul', { class: 'mo-plans' }, wishes.map(([, w]) => el('li', {}, el('p', { class: 'mo-plan-t', text: '“' + w.text + '”' }), el('p', { class: 'mo-plan-s', text: w.status })))));
    }
    const byScene = [];
    s.said.forEach(x => { let g = byScene.find(g => g.sc === x.sc); if (!g) byScene.push(g = { sc: x.sc, items: [] }); g.items.push(x); });
    if (!byScene.length) drawer.append(el('p', { class: 'mo-empty', text: 'Nothing yet.' }));
    byScene.forEach(g => {
      const sc = C.scenes[g.sc];
      drawer.append(el('h3', { class: 'mo-drawer-sc', text: `${sc.title} · ${sc.place}` }));
      const ol = el('ol', { class: 'mo-said' });
      g.items.forEach(x => {
        if (x.k === 'line') ol.append(el('li', { class: 'said-line' + (x.setAside ? ' aside' : ''), 'data-who': x.who },
          el('span', { class: 'said-who', text: who(x.who) + (x.en ? ' · in English' : '') }),
          el('span', { class: 'said-t', text: x.text }),
          x.setAside ? el('span', { class: 'said-note', text: x.restored ? 'Set aside, then returned to the account.' : 'Set aside. It did not reach the account.' }) : null));
        if (x.k === 'account') ol.append(el('li', { class: 'said-account' },
          el('span', { class: 'said-who', text: 'The account became' + (x.who === 'none' ? '' : x.who === 'mo' ? ', in her words' : ', in ' + who(x.who) + '’s version') }),
          el('span', { class: 'said-t', text: x.text })));
        if (x.k === 'you') ol.append(el('li', { class: 'said-you' }, el('span', { class: 'said-who', text: 'You' }), el('span', { class: 'said-t', text: x.text })));
      });
      drawer.append(ol);
    });
    drawer.hidden = false;
    drawerBtn.setAttribute('aria-expanded', 'true');
    drawer.focus();
    document.addEventListener('keydown', esc_);
  }
})();
