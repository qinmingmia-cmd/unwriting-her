/* Before She Answers: the chapter's own engine.
   It shares the site's shelf, router and wordmark. Retold passages, notes, readings and the account are its own.
   State is namespaced and versioned in localStorage; a corrupt or missing save simply starts fresh.
   Every rendered beat is stored with its evaluated text, so resuming shows exactly what was shown. */
(function () {
  'use strict';
  const UH = window.UH;
  const KEY = 'unwriting-her:moon-orchid:v3', V = 3;
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fresh = () => ({ v: V, scene: 'entry', trail: [], account: {}, said: [], wishes: {}, readings: {}, seenIds: [], opened: [], done: [], tags: {}, focus: null, order: [] });
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
    started: () => load().scene !== 'entry',
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
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ital = t => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const CLUE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const plain = t => String(t).replace(CLUE, '$1');
  function rich(t) {
    return String(t).split(/\n\n/).map(par => {
      let out = '', last = 0, m; CLUE.lastIndex = 0;
      while ((m = CLUE.exec(par))) {
        out += ital(par.slice(last, m.index));
        out += `<button type="button" class="mo-clue${s.opened.includes(m[2]) ? ' seen' : ''}" data-clue="${esc(m[2])}" aria-expanded="false">${ital(m[1])}</button>`;
        last = CLUE.lastIndex;
      }
      return '<p>' + out + ital(par.slice(last)) + '</p>';
    }).join('');
  }

  let C, A, host, root, artBox, attnEl, accountEl, flowEl, ctlEl, drawer, drawerBtn, menu, menuBtn, sceneHead;
  const who = id => (C.who[id] && C.who[id].name) || id;
  const scene = () => C.scenes[s.scene];
  const beatOf = id => scene().beats[id];
  const TIER = { annotation: 'Annotation', context: 'Context', criticism: 'Criticism', conjecture: 'Conjecture', retold: 'Retold' };

  /* ============================================================ MOUNT */
  function mount(app, h) {
    C = UH.MO; A = UH.MOart; host = h;
    s = load();
    app.className = 'view-mo';
    app.innerHTML = '';
    root = el('div', { class: 'mo' });
    app.append(root);
    root.addEventListener('click', onClue);
    if (s.scene === 'entry') renderEntry(); else renderStage(true);
  }

  /* ============================================================ ENTRY */
  function renderEntry() {
    root.innerHTML = '';
    root.className = 'mo mo-at-entry';
    const started = s.scene !== 'entry' || s.trail.length > 0;
    const flap = el('div', { class: 'mo-flaps', 'aria-hidden': 'true' });
    [...'BEFORE SHE ANSWERS'].forEach((ch, i) => flap.append(el('span', { class: 'mo-flap' + (ch === ' ' ? ' sp' : ''), style: `--i:${i}` }, el('b', { text: ch === ' ' ? '' : ch }))));
    const note = el('details', { class: 'mo-note' }, el('summary', {}, 'Content note'), el('p', { text: C.contentNote }));
    const how = el('details', { class: 'mo-note', open: true }, el('summary', {}, 'How to read this chapter'), ...C.howTo.map(t => el('p', { text: t })), keyRow());
    const confirm = el('div', { class: 'mo-confirm', hidden: true },
      el('p', { text: 'Start this chapter again from the airport? Your other chapters are not affected.' }),
      el('div', { class: 'mo-row' },
        el('button', { type: 'button', class: 'mo-btn', onclick: () => { chapter.reset(); begin(); } }, 'Start again'),
        el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => { confirm.hidden = true; } }, 'Keep my place')));
    const actions = el('div', { class: 'mo-row' },
      started ? el('button', { type: 'button', class: 'mo-btn', onclick: () => renderStage(true) }, 'Continue') : el('button', { type: 'button', class: 'mo-btn', onclick: begin }, 'Begin'),
      started ? el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => { confirm.hidden = false; } }, 'Start again') : null,
      el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => host.navigate('reading-room') }, 'Back to the Reading Room'));
    root.append(bar(false),
      el('main', { class: 'mo-entry', id: 'mo-main' },
        el('div', { class: 'mo-entry-art', html: luggage() }), flap,
        el('h1', { class: 'mo-title', text: C.title }),
        el('p', { class: 'mo-sub', text: C.sub }),
        el('p', { class: 'mo-notice', text: C.notice }),
        how, note, actions, confirm));
    if (!reduce()) requestAnimationFrame(() => flap.classList.add('go')); else flap.classList.add('go', 'still');
  }
  function keyRow() {
    return el('div', { class: 'mo-key' }, ['retold', 'annotation', 'context', 'criticism'].map(t => el('span', { class: 'mo-tier', 'data-tier': t, text: TIER[t] })));
  }
  function luggage() {
    return `<svg viewBox="0 0 520 170" aria-hidden="true"><ellipse cx="260" cy="160" rx="250" ry="10" fill="rgba(70,48,28,.14)"/>
      <rect x="40" y="40" width="160" height="116" rx="10" fill="#8e6f4c"/><path d="M95,40 C95,14 145,14 145,40" stroke="#5c3d25" stroke-width="8" fill="none"/><rect x="74" y="40" width="9" height="116" fill="#000" opacity=".13"/><rect x="158" y="40" width="9" height="116" fill="#000" opacity=".13"/>
      <rect x="214" y="70" width="130" height="86" rx="8" fill="#6b8a7b"/><path d="M256,70 C256,52 302,52 302,70" stroke="#4c7563" stroke-width="7" fill="none"/>
      <rect x="360" y="88" width="120" height="68" fill="#c9a874"/><path d="M360,88 L480,88 L470,76 L370,76Z" fill="#d9bb88"/><path d="M420,76 L420,156 M360,122 L480,122" stroke="#6e5536" stroke-width="3"/><path d="M410,66 C416,76 424,76 430,66" stroke="#6e5536" stroke-width="3" fill="none"/></svg>`;
  }
  function begin() { s = fresh(); save(); goScene(C.start, true); }

  /* ============================================================ CHROME */
  function bar(inStory) {
    const b = el('header', { class: 'mo-bar' },
      el('button', { type: 'button', class: 'mo-word', onclick: () => host.navigate('reading-room'), title: 'Back to the Reading Room' }, 'Unwriting Her'),
      el('span', { class: 'mo-bar-place' }, inStory ? sceneLabel() : 'Moon Orchid'));
    if (!inStory) return b;
    drawerBtn = el('button', { type: 'button', class: 'mo-bar-btn', 'aria-expanded': 'false', 'aria-controls': 'mo-said', onclick: () => openDrawer() }, 'The record');
    menuBtn = el('button', { type: 'button', class: 'mo-bar-btn', 'aria-expanded': 'false', 'aria-controls': 'mo-menu' }, 'Menu');
    const confirm = el('div', { class: 'mo-confirm', hidden: true },
      el('p', { text: 'Start this chapter again? Your readings in it will be cleared. Other chapters are not affected.' }),
      el('div', { class: 'mo-row' },
        el('button', { type: 'button', class: 'mo-btn small', onclick: () => { closeMenu(); chapter.reset(); renderEntry(); } }, 'Start again'),
        el('button', { type: 'button', class: 'mo-btn small quiet', onclick: () => { confirm.hidden = true; } }, 'Keep my place')));
    menu = el('div', { class: 'mo-menu', id: 'mo-menu', hidden: true },
      el('button', { type: 'button', class: 'mo-menu-item', onclick: () => { closeMenu(); renderEntry(); } }, 'Title page and how to read'),
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
  function sceneLabel() { const sc = scene(); return !sc ? '' : sc.essay ? 'The closing thesis' : `${C.movements[sc.mv].n} · ${C.movements[sc.mv].title}`; }

  /* ============================================================ STAGE */
  function renderStage(resuming) {
    if (scene().essay) return renderEssay();
    root.innerHTML = '';
    root.className = 'mo mo-in';
    const sc = scene();
    artBox = el('div', { class: 'mo-art-in' });
    attnEl = el('figcaption', { class: 'mo-attn', 'aria-live': 'polite' });
    accountEl = el('div', { class: 'mo-account', role: 'status', 'aria-live': 'polite' });
    sceneHead = el('header', { class: 'mo-scene-head' },
      el('p', { class: 'mo-kicker', text: `Movement ${C.movements[sc.mv].n} · ${C.movements[sc.mv].title}` }),
      el('h2', { class: 'mo-scene-title', text: sc.title, tabindex: '-1' }),
      el('p', { class: 'mo-place', text: sc.place }),
      soFar());
    flowEl = el('div', { class: 'mo-flow' });
    ctlEl = el('div', { class: 'mo-ctl' });
    drawer = el('aside', { class: 'mo-drawer', id: 'mo-said', 'aria-label': 'The record', hidden: true, tabindex: '-1' });
    const left = el('div', { class: 'mo-left' }, el('figure', { class: 'mo-art' }, artBox, attnEl));
    const col = el('section', { class: 'mo-col', 'aria-label': 'The chapter' }, sceneHead, flowEl, ctlEl);
    root.append(bar(true), el('main', { class: 'mo-stage', id: 'mo-main', 'data-mv': sc.mv }, left, col), drawer);
    const narrow = window.matchMedia('(max-width: 900px)');
    const place = () => { if (narrow.matches) col.prepend(accountEl); else left.append(accountEl); };
    place();
    if (narrow.addEventListener) narrow.addEventListener('change', place);
    artBox.innerHTML = A[sc.art]();
    s.trail.forEach(item => flowEl.append(renderItem(item, false)));
    applyArt(); drawAccount(false); drawControls();
    if (resuming) { const last = flowEl.lastElementChild; if (last) last.scrollIntoView({ block: 'start' }); } else window.scrollTo(0, 0);
  }

  /* ---------- the closing thesis */
  function renderEssay() {
    root.innerHTML = '';
    root.className = 'mo mo-in mo-at-essay';
    const T = C.thesis;
    drawer = el('aside', { class: 'mo-drawer', id: 'mo-said', 'aria-label': 'The record', hidden: true, tabindex: '-1' });
    const art = el('figure', { class: 'mo-essay-art', 'aria-hidden': 'true', html: A.house() });
    const body = el('div', { class: 'mo-essay-body' });
    T.body.forEach(x => {
      if (x.h) body.append(el('h3', { class: 'mo-essay-h', text: x.h }));
      else if (x.p) body.append(el('p', { html: ital(x.p) }));
      else if (x.seen) {
        const ids = s.seenIds.filter(id => C.seen[id]);
        body.append(el('p', { class: 'mo-essay-note', text: `You collected ${ids.length} of ${Object.keys(C.seen).length} so far. Each sets how she was seen against what the text shows.` }));
        ids.forEach(id => body.append(stepNode({ t: 'seen', id })));
      } else if (x.wishes) {
        const ws = Object.values(s.wishes), got = ws.filter(w => w.granted).length;
        if (ws.length) {
          body.append(el('p', { class: 'mo-essay-note', text: `She asked for ${ws.length} ${ws.length === 1 ? 'thing' : 'things'} in the course of the chapter. ${got === 0 ? 'None was granted.' : got === 1 ? 'One was granted: after the car, to stay at her daughter’s home.' : got + ' were granted.'}` }));
          body.append(el('ul', { class: 'mo-plans' }, ws.map(w => el('li', { class: w.granted ? 'granted' : 'refused' }, el('p', { class: 'mo-plan-t', text: w.text }), el('p', { class: 'mo-plan-s', text: w.status })))));
        }
      } else if (x.count) {
        const all = Object.values(s.account), hers = all.filter(a => a.who === 'mo').length;
        body.append(el('p', { class: 'mo-essay-note', text: !all.length ? 'No moment in your reading has been put into words yet.'
          : hers ? `Of the ${all.length} moments put into words in your reading, ${hers} ${hers === 1 ? 'was' : 'were'} kept in her terms, and only because you chose to keep ${hers === 1 ? 'it' : 'them'}. The household kept none.`
          : `Of the ${all.length} moments put into words in your reading, none was kept in her terms.` }));
      }
    });
    const foot = el('div', { class: 'mo-row mo-essay-foot' },
      el('button', { type: 'button', class: 'mo-btn', onclick: () => host.navigate('reading-room') }, 'Back to the Reading Room'),
      el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => openDrawer() }, 'Open the record'));
    root.append(bar(true), el('main', { class: 'mo-essay', id: 'mo-main' }, art,
      el('article', { class: 'mo-essay-col' },
        el('p', { class: 'mo-kicker', text: T.kicker }),
        el('h1', { class: 'mo-essay-t', text: T.title, tabindex: '-1' }),
        el('p', { class: 'mo-essay-sub', text: T.sub }), body, foot)), drawer);
    window.scrollTo(0, 0);
    const h = root.querySelector('.mo-essay-t'); if (h) h.focus({ preventScroll: true });
  }

  /* ---------- the thread between scenes: how the last scene is being told */
  function soFar() {
    const i = s.order.indexOf(s.scene);
    for (let j = i - 1; j >= 0; j--) {
      const prev = s.order[j], a = s.account[prev];
      if (!a || !C.scenes[prev]) continue;
      return el('div', { class: 'mo-sofar' },
        el('p', { class: 'mo-sofar-k', text: 'Carried from ' + C.scenes[prev].title }),
        el('p', { class: 'mo-sofar-t', text: a.who === 'none' ? a.text : '“' + a.text + '”' }),
        el('p', { class: 'mo-sofar-by', text: termsOf(a.who) }));
    }
    return null;
  }
  const termsOf = w => w === 'none' ? 'In no one’s words' : w === 'mo' ? 'Kept in her terms' : who(w) + '’s terms';

  /* ---------- art */
  function applyArt() {
    const svg = artBox.querySelector('svg');
    if (!svg) return;
    const tags = new Set(s.tags[s.scene] || []);
    svg.querySelectorAll('[data-on]').forEach(n => { n.classList.add('mo-tag'); n.classList.toggle('mo-vis', n.dataset.on.split(/\s+/).some(t => tags.has(t))); });
    svg.querySelectorAll('[data-off]').forEach(n => n.classList.toggle('mo-gone', n.dataset.off.split(/\s+/).some(t => tags.has(t))));
    svg.querySelectorAll('.fig').forEach(n => n.classList.toggle('lit', n.dataset.who === s.focus));
    attnEl.innerHTML = s.focus && C.who[s.focus] ? `In this passage: <b>${esc(who(s.focus))}</b>` : '';
  }
  function tag(list) { if (!list) return; const t = s.tags[s.scene] = s.tags[s.scene] || []; list.forEach(x => { if (!t.includes(x)) t.push(x); }); }

  /* ---------- the account */
  function drawAccount(animate) {
    const a = s.account[s.scene];
    accountEl.innerHTML = '';
    accountEl.append(el('p', { class: 'mo-account-k', text: 'As it will be told' }));
    if (!a) { accountEl.append(el('p', { class: 'mo-account-t empty', text: 'Nothing here has been put into words yet.' })); return; }
    accountEl.append(
      el('p', { class: 'mo-account-t' + (animate && !reduce() ? ' arriving' : ''), 'data-who': a.who, text: a.who === 'none' ? a.text : '“' + a.text + '”' }),
      el('p', { class: 'mo-account-by', text: termsOf(a.who) }));
    const was = s.said.filter(x => x.k === 'account' && x.sc === s.scene).slice(0, -1);
    if (was.length) accountEl.append(el('div', { class: 'mo-account-was' }, el('p', { class: 'mo-account-k', text: 'Replaced' }),
      ...was.reverse().map(x => el('p', {}, el('s', { text: '“' + x.text + '”' }), el('span', { text: x.who === 'mo' ? ' · her terms' : ' · ' + who(x.who) })))));
  }
  function setAccount(a) {
    if (!a) return;
    s.account[s.scene] = { who: a.who, text: a.text };
    s.said.push({ k: 'account', sc: s.scene, who: a.who, text: a.text });
  }

  /* ---------- blocks */
  function stepNode(st) {
    if (st.t === 'n') return el('div', { class: 'mo-narr', html: rich(st.text) });
    if (st.t === 'r') return el('figure', { class: 'mo-retold' },
      el('figcaption', {}, el('span', { class: 'mo-tier', 'data-tier': 'retold', text: 'Retold' }), el('span', { class: 'mo-cite', text: st.cite })),
      el('div', { class: 'mo-retold-t', html: rich(st.text) }));
    if (st.t === 'seen') {
      const p = C.seen[st.id];
      return el('div', { class: 'mo-seen', role: 'group', 'aria-label': 'Seen as' },
        el('p', { class: 'mo-seen-cap' }, el('span', { text: 'Seen as' }), el('span', { text: p.cite })),
        el('div', { class: 'mo-seen-panes' },
          el('div', { class: 'mo-pane as' }, el('span', { class: 'mo-pane-k', text: 'By ' + p.by }), el('span', { class: 'mo-pane-t', text: p.as })),
          el('div', { class: 'mo-pane text' }, el('span', { class: 'mo-pane-k', text: 'In the text' }), el('span', { class: 'mo-pane-t', text: p.text }))));
    }
    return null;
  }
  function blk(node) { const w = el('div', { class: 'mo-blk' }, node); if (node.querySelector && node.querySelector('.mo-clue')) w.append(el('div', { class: 'mo-slips' })); return w; }
  function renderItem(item, fresh) {
    const bt = beatOf(item.b);
    const wrap = el('div', { class: 'mo-beat', 'data-beat': item.b });
    item.r.forEach(st => { const n = stepNode(st); if (n) wrap.append(blk(n)); });
    (bt.margin || []).forEach(id => wrap.append(marginNode(id)));
    const q = bt.reading || bt.word;
    if (q && item.o) wrap.append(readingDone(q, item.o, !!bt.word, fresh));
    return wrap;
  }
  function slip(n, id) {
    return el('aside', { class: 'mo-slip', 'data-tier': n.tier, 'data-clue': id || '' },
      el('p', { class: 'mo-slip-cap' }, el('span', { class: 'mo-tier', 'data-tier': n.tier, text: TIER[n.tier] }), n.by ? el('span', { class: 'mo-slip-by', text: n.by }) : null),
      el('div', { class: 'mo-slip-t', html: rich(n.text) }));
  }
  function marginNode(id) {
    const n = C.clues[id];
    const body = el('div', { class: 'mo-margin-body', id: 'mo-m-' + id, hidden: true }, slip(n, id));
    const btn = el('button', { type: 'button', class: 'mo-margin-btn', 'aria-expanded': 'false', 'aria-controls': 'mo-m-' + id },
      el('span', { class: 'mo-tier', 'data-tier': n.tier, text: TIER[n.tier] }), n.by ? el('span', { class: 'mo-margin-by', text: n.by }) : null, el('span', { class: 'mo-margin-more', text: 'In the margin' }));
    btn.addEventListener('click', () => { const open = body.hidden; body.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && !s.opened.includes(id)) { s.opened.push(id); save(); } });
    return el('div', { class: 'mo-margin' }, btn, body);
  }
  function onClue(e) {
    const x = e.target.closest('.mo-slip-x');
    if (x) { const sl = x.closest('.mo-slip'); root.querySelectorAll(`.mo-clue[data-clue="${sl.dataset.clue}"]`).forEach(c => { c.classList.remove('on'); c.setAttribute('aria-expanded', 'false'); }); sl.remove(); return; }
    const c = e.target.closest('.mo-clue');
    if (!c) return;
    const id = c.dataset.clue, n = C.clues[id];
    const holder = c.closest('.mo-blk') && c.closest('.mo-blk').querySelector(':scope > .mo-slips');
    if (!n || !holder) return;
    const open = holder.querySelector(`.mo-slip[data-clue="${id}"]`);
    if (open) { open.remove(); c.classList.remove('on'); c.setAttribute('aria-expanded', 'false'); return; }
    if (!s.opened.includes(id)) { s.opened.push(id); save(); }
    c.classList.add('on', 'seen'); c.setAttribute('aria-expanded', 'true');
    const sl = slip(n, id);
    sl.append(el('button', { type: 'button', class: 'mo-slip-x', 'aria-label': 'Close this note' }, '×'));
    if (n.reflect && C.seen[n.reflect] && !s.seenIds.includes(n.reflect)) { s.seenIds.push(n.reflect); save(); }
    holder.append(sl);
    sl.setAttribute('tabindex', '-1'); sl.focus({ preventScroll: true });
  }

  /* ---------- readings and words */
  function readingDone(q, k, isWord, fresh) {
    const o = q.options.find(x => x.k === k);
    const box = el('section', { class: 'mo-reading done' + (isWord ? ' is-word' : '') },
      el('p', { class: 'mo-reading-k', text: isWord ? 'Whose word stands' : 'Your reading' }),
      el('p', { class: 'mo-reading-q', text: q.prompt }),
      el('p', { class: 'mo-reading-pick' }, el('span', { class: 'mo-stamp' + (fresh && !reduce() ? ' thump' : ''), text: o.label }), o.sub ? el('span', { class: 'mo-reading-sub', text: o.sub }) : null),
      slip({ tier: o.tier || 'annotation', by: o.by, text: o.text }));
    const others = q.options.filter(x => x.k !== k);
    const more = el('details', { class: 'mo-others' }, el('summary', {}, isWord ? 'The other word, and what it would have meant' : 'The other readings'),
      ...others.map(x => el('div', { class: 'mo-other' }, el('p', { class: 'mo-other-h' }, el('b', { text: x.label }), x.sub ? ' · ' + x.sub : ''), slip({ tier: x.tier || 'annotation', by: x.by, text: x.text }))));
    box.append(more);
    return box;
  }
  function drawControls() {
    ctlEl.innerHTML = '';
    const sc = scene();
    const item = s.trail[s.trail.length - 1];
    if (!item) return;
    const bt = beatOf(item.b);
    const q = bt.reading || bt.word;
    if (q && !item.o) {
      const box = el('section', { class: 'mo-reading' + (bt.word ? ' is-word' : '') },
        el('p', { class: 'mo-reading-k', text: bt.word ? 'Whose word stands' : 'Choose a reading' }),
        el('p', { class: 'mo-reading-q', text: q.prompt }));
      const list = el('div', { class: 'mo-choices', role: 'group', 'aria-label': q.prompt });
      q.options.forEach(o => list.append(el('button', { type: 'button', class: 'mo-choice', onclick: () => pick(q, o, !!bt.word) },
        el('span', { class: 'mo-choice-l', text: o.label }), o.sub ? el('span', { class: 'mo-choice-s', text: o.sub }) : null)));
      box.append(list);
      ctlEl.append(box);
      return;
    }
    if (sc.end && !bt.next) {
      ctlEl.append(el('div', { class: 'mo-end' },
        el('p', { class: 'mo-end-k', text: 'End of the preview' }),
        el('div', { class: 'mo-row' },
          C.scenes.thesis ? el('button', { type: 'button', class: 'mo-btn', onclick: () => goScene('thesis') }, 'Read the closing thesis') : null,
          el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => openDrawer() }, 'Open the record'),
          el('button', { type: 'button', class: 'mo-btn quiet', onclick: () => host.navigate('reading-room') }, 'Back to the Reading Room'))));
      return;
    }
    ctlEl.append(el('button', { type: 'button', class: 'mo-continue', onclick: advance }, 'Continue'));
  }

  /* ============================================================ MOVING THROUGH THE CHAPTER */
  const evalSteps = list => (list || []).map(st => typeof st === 'function' ? st(s) : st).filter(Boolean).map(x => Object.assign({}, x));
  function enterBeat(id) {
    const bt = beatOf(id);
    const item = { b: id, r: evalSteps(bt.steps) };
    s.trail.push(item);
    item.r.forEach(st => {
      if (st.show) tag(st.show);
      if (st.wish && !s.wishes[st.wish]) s.wishes[st.wish] = { text: st.wishText, status: st.wishStatus, granted: !!st.granted, sc: s.scene };
      if (st.t === 'seen' && !s.seenIds.includes(st.id)) s.seenIds.push(st.id);
      if (st.t === 'r') s.said.push({ k: 'event', sc: s.scene, text: plain(st.text) });
    });
    if (bt.account) setAccount(bt.account);
    tag(bt.show);
    if (bt.focus) s.focus = bt.focus;
    save();
    const node = renderItem(item, true);
    flowEl.append(node);
    applyArt(); drawAccount(!!bt.account); drawControls();
    focusNew(node);
  }
  function pick(q, o, isWord) {
    const item = s.trail[s.trail.length - 1];
    item.o = o.k;
    s.readings[q.id] = o.k;
    s.said.push({ k: isWord ? 'word' : 'reading', sc: s.scene, q: q.prompt, label: o.label });
    if (o.account) setAccount(o.account);
    save();
    const old = flowEl.lastElementChild;
    const node = renderItem(item, true);
    flowEl.replaceChild(node, old);
    applyArt(); drawAccount(!!o.account); drawControls();
    focusNew(node.querySelector('.mo-reading') || node);
  }
  function advance() {
    const item = s.trail[s.trail.length - 1];
    let n = beatOf(item.b).next;
    if (typeof n === 'function') n = n(s);
    if (!n) return;
    if (typeof n === 'object' && n.scene) return goScene(n.scene);
    enterBeat(n);
  }
  function goScene(id, first) {
    const prev = s.scene;
    if (!first && prev && C.scenes[prev] && !s.done.includes(prev)) s.done.push(prev);
    const prevMv = prev && C.scenes[prev] ? C.scenes[prev].mv : null;
    s.scene = id; s.trail = []; s.focus = null;
    s.tags[id] = [].concat(C.scenes[id].show || []);
    if (!s.order.includes(id)) s.order.push(id);
    save();
    const go = () => { renderStage(false); enterBeat(C.scenes[id].first); const t = sceneHead.querySelector('.mo-scene-title'); if (t) t.focus({ preventScroll: true }); };
    if (C.scenes[id].essay) { renderEssay(); return; }
    if (C.scenes[id].mv !== prevMv) titleCard(C.movements[C.scenes[id].mv], go); else go();
  }
  function focusNew(node) {
    if (!node) return;
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
    node.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
  }
  function titleCard(m, then) {
    if (reduce()) { then(); return; }
    const card = el('div', { class: 'mo-card', role: 'presentation' }, el('p', { class: 'mo-card-k', text: 'Movement ' + m.n }), el('p', { class: 'mo-card-t', text: m.title }));
    let done = false;
    const key = e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') end(); };
    const end = () => { if (done) return; done = true; document.removeEventListener('keydown', key); card.classList.add('out'); setTimeout(() => card.remove(), 600); then(); };
    card.addEventListener('click', end);
    document.addEventListener('keydown', key);
    document.body.append(card);
    setTimeout(end, 1700);
  }

  /* ============================================================ THE RECORD */
  function openDrawer() {
    if (!drawer) return;
    drawer.innerHTML = '';
    const esc_ = e => { if (e.key === 'Escape') close(); };
    const close = () => { drawer.hidden = true; drawerBtn.setAttribute('aria-expanded', 'false'); drawerBtn.focus(); document.removeEventListener('keydown', esc_); };
    drawer.append(el('header', { class: 'mo-drawer-head' }, el('h2', { text: 'The record' }), el('button', { type: 'button', class: 'mo-bar-btn', onclick: close }, 'Close')),
      el('p', { class: 'mo-drawer-lede', text: 'How she has been seen so far, how each moment is being told, and what you chose. Reading this changes nothing.' }));
    const seenIds = s.seenIds.filter(id => C.seen[id]);
    if (seenIds.length) {
      drawer.append(el('h3', { class: 'mo-drawer-sc', text: 'Seen as' }));
      seenIds.forEach(id => drawer.append(stepNode({ t: 'seen', id })));
    }
    const wishes = Object.values(s.wishes);
    if (wishes.length) {
      drawer.append(el('h3', { class: 'mo-drawer-sc', text: 'What she asked for' }));
      drawer.append(el('ul', { class: 'mo-plans' }, wishes.map(w => el('li', { class: w.granted ? 'granted' : 'refused' }, el('p', { class: 'mo-plan-t', text: w.text }), el('p', { class: 'mo-plan-s', text: w.status })))));
    }
    const groups = [];
    s.said.forEach(x => { if (x.k === 'event') return; let g = groups.find(g => g.sc === x.sc); if (!g) groups.push(g = { sc: x.sc, items: [] }); g.items.push(x); });
    if (groups.length) drawer.append(el('h3', { class: 'mo-drawer-sc', text: 'The account, and your choices' }));
    groups.forEach(g => {
      const sc = C.scenes[g.sc];
      drawer.append(el('p', { class: 'mo-drawer-scene', text: sc.title + ' · ' + sc.place }));
      const ol = el('ol', { class: 'mo-said' });
      g.items.forEach(x => {
        if (x.k === 'account') ol.append(el('li', { class: 'said-account', 'data-who': x.who }, el('span', { class: 'said-who', text: 'The account became · ' + termsOf(x.who) }), el('span', { class: 'said-t', text: x.text })));
        if (x.k === 'reading' || x.k === 'word') ol.append(el('li', { class: 'said-you' }, el('span', { class: 'said-who', text: x.k === 'word' ? 'You kept the word' : 'Your reading' }), el('span', { class: 'said-t', text: x.label + ' · ' + x.q })));
      });
      drawer.append(ol);
    });
    if (!seenIds.length && !groups.length) drawer.append(el('p', { class: 'mo-empty', text: 'Nothing yet.' }));
    drawer.hidden = false;
    drawerBtn.setAttribute('aria-expanded', 'true');
    drawer.focus();
    document.addEventListener('keydown', esc_);
  }
})();
