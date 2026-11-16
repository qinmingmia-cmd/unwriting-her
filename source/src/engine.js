/* Unwriting Her: engine and interface.
   Stories register themselves with UH.registerStory(); the shelf with UH.registerShelf().
   Nothing in this file knows about any particular novel. */
(function () {
  'use strict';
  const UH = window.UH = window.UH || { stories: {}, shelf: [] };
  UH.registerStory = s => { UH.stories[s.id] = s; };
  UH.registerShelf = list => { UH.shelf.push(...list); };
})();

window.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const UH = window.UH;
  const app = document.getElementById('app');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ storage */
  const KEY = 'unwriting-her:v1';
  let store = { runs: {}, endings: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };

  function fresh(story) {
    return { scene: story.start, beat: 0, visited: [story.start], heard: [], opened: [], expanded: [], examined: [],
      readings: {}, role: null, finding: null, name: null, voice: { mode: null, text: '', tiles: [], draft: '' },
      struck: [], record: [], reflections: [], flags: [], ending: null,
      pinned: [], pairs: [], cited: [], explored: {}, crossx: {}, checks: {}, erased: [], closeOpen: [], glassTried: {}, marginNote: '', revealed: {} };
  }
  function normalise(s, story) {
    const f = fresh(story);
    Object.keys(f).forEach(k => { if (s[k] === undefined) s[k] = f[k]; });
    if (!story.scenes[s.scene]) return f;
    if (s.beat >= story.scenes[s.scene].beats.length) s.beat = 0;
    return s;
  }

  /* ------------------------------------------------------------ helpers */
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
  const CLUE_RE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const stripClues = t => String(t).replace(CLUE_RE, '$1');
  const reEsc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function strike(html, words) {
    for (const w of words) {
      const re = new RegExp('(^|[^\\p{L}\\p{N}\\-])(' + reEsc(esc(w)) + ')(?=$|[^\\p{L}\\p{N}\\-])', 'giu');
      html = html.replace(re, '$1<s class="struck">$2</s>');
    }
    return html;
  }
  function inline(t, s) {
    let x = esc(t);
    if (s && s.struck.length) x = strike(x, s.struck);
    return x.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }
  function interp(t, s, story) {
    if (!story || !story.vars || !s) return t;
    const v = story.vars(s);
    return t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  }
  function clueify(par, s, live) {
    let out = '', last = 0, m;
    CLUE_RE.lastIndex = 0;
    while ((m = CLUE_RE.exec(par))) {
      out += inline(par.slice(last, m.index), s);
      const id = m[2];
      if (live) {
        const open = s.expanded.includes(id);
        out += `<span role="button" tabindex="0" class="clue${s.opened.includes(id) ? ' seen' : ''}" data-clue="${esc(id)}" aria-expanded="${open}">${inline(m[1], s)}</span>`;
      } else out += inline(m[1], s);
      last = CLUE_RE.lastIndex;
    }
    return out + inline(par.slice(last), s);
  }
  function rich(t, s, story, live) {
    t = interp(String(t), s, story);
    return t.split(/\n\n/).map(p => '<p>' + clueify(p, s, live) + '</p>').join('');
  }
  const clueIds = t => { const ids = []; let m; CLUE_RE.lastIndex = 0; while ((m = CLUE_RE.exec(String(t)))) ids.push(m[2]); return ids; };

  /* ------------------------------------------------------------ chrome */
  const TIER = { text: 'Verbatim', annotation: 'Annotation', context: 'Outside the novel', criticism: 'Criticism', conjecture: 'Conjecture · not in the novel', margin: 'Your hand' };

  const toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  document.body.append(toast);

  let cur = null;         // { story, s }
  let view = null;        // 'landing' | 'hub' | 'story'
  let composing = [];     // tiles being arranged

  function save() { if (cur) { store.runs[cur.story.id] = cur.s; } persist(); }
  const helpers = {
    hear: id => { if (!cur.s.heard.includes(id)) cur.s.heard.push(id); },
    flag: f => { if (!cur.s.flags.includes(f)) cur.s.flags.push(f); },
    erase: k => { if (!cur.s.erased.includes(k)) cur.s.erased.push(k); }
  };

  /* ------------------------------------------------------------ record */
  function addRecord(entry) {
    const s = cur.s;
    if (s.record.some(r => r.id === entry.id)) return false;
    s.record.push(entry);
    const c = document.querySelector('.rec-count');
    if (c) { c.textContent = s.record.length; c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); }
    return true;
  }
  function addReflection(id) {
    const s = cur.s;
    if (!cur.story.reflections[id] || s.reflections.includes(id)) return;
    s.reflections.push(id);
    showToast(s.reflections.length === 1 ? 'Something appeared in the glass. It is kept in the Record.' : 'Another reflection appeared in the glass.');
    save();
  }

  /* ============================================================ LANDING */
  function showLanding() {
    view = 'landing'; cur = null; stopMotes();
    document.title = 'Unwriting Her';
    app.className = 'view-landing';
    app.innerHTML = '';
    app.append(el('main', { class: 'landing' },
      el('button', { class: 'door', type: 'button', 'aria-label': 'Open the door: enter the Reading Room', onclick: () => navigate('reading-room') }, el('span', { class: 'door-light' })),
      el('div', { class: 'land-text' },
        el('p', { class: 'kicker', text: 'An investigation in the margins of the canon' }),
        el('h1', { class: 'land-title', text: 'Unwriting Her' }),
        el('p', { class: 'claim' }, el('span', { class: 'struckline', text: 'She was mad.' })),
        el('p', { class: 'ask hand', text: 'Who wrote that, and who needed it written?' }),
        el('p', { class: 'lede', text: 'Some women in literature are known only through what other people said about them: husbands, brothers, servants, narrators, authors. Go into their books. Hear the testimony. Decide what you are allowed to do with it.' }),
        el('div', { class: 'land-actions' }, el('button', { class: 'btn primary', type: 'button', onclick: () => navigate('reading-room') }, 'Enter the Reading Room')),
        el('p', { class: 'foot', text: 'One reading takes about thirty minutes. Six endings, and an essay at the end of each. Your progress stays in this browser.' })
      )
    ));
    window.scrollTo(0, 0);
  }

  /* ============================================================ HUB: the Reading Room */
  let hubSel = null;
  function showHub() {
    view = 'hub'; cur = null; stopMotes();
    app.className = 'view-hub';
    app.innerHTML = '';
    if (!hubSel) hubSel = (UH.shelf.find(e => e.story) || UH.shelf[0]).id;
    const shelf = el('div', { class: 'shelf', role: 'list' });
    const slipBox = el('section', { class: 'catalogue', 'aria-live': 'polite' });
    UH.shelf.forEach((entry, i) => {
      const story = entry.story && UH.stories[entry.story];
      const spine = el('button', { type: 'button', role: 'listitem', class: 'spine' + (story ? ' live' : ' sealed') + (entry.id === hubSel ? ' sel' : ''), 'aria-pressed': String(entry.id === hubSel), 'aria-label': `${entry.name}, ${entry.work}${story ? '' : ', sealed'}`,
        style: `--h:${[100, 94, 97, 92, 96, 93][i % 6]}%`,
        onclick: () => { hubSel = entry.id; showHub(); const c = document.querySelector('.catalogue'); if (c && window.innerWidth < 900) c.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); } },
        el('span', { class: 'spine-band' }),
        el('span', { class: 'spine-name', text: entry.spine || entry.name }),
        el('span', { class: 'spine-year', text: entry.year }),
        story ? el('span', { class: 'spine-flame', 'aria-hidden': 'true' }) : el('span', { class: 'spine-seal', 'aria-hidden': 'true' }));
      shelf.append(spine);
    });
    const entry = UH.shelf.find(e => e.id === hubSel);
    const story = entry.story && UH.stories[entry.story];
    slipBox.append(
      el('p', { class: 'slip-meta' }, el('span', { text: entry.author }), el('span', { text: entry.year })),
      el('h2', { class: 'slip-name', text: entry.name }),
      el('p', { class: 'slip-work', text: entry.work }),
      el('p', { class: 'slip-blurb', text: entry.blurb }));
    if (story) {
      const run = store.runs[story.id];
      const started = run && (run.scene !== story.start || run.beat > 0);
      const ends = (store.endings[story.id] || []).map(e => story.endings[e]).filter(Boolean);
      const actions = el('div', { class: 'slip-actions' });
      if (started) actions.append(
        el('button', { class: 'btn primary', type: 'button', onclick: () => navigate(story.id) }, 'Continue reading'),
        el('button', { class: 'btn quiet', type: 'button', onclick: () => { store.runs[story.id] = fresh(story); persist(); navigate(story.id); } }, 'Begin again'));
      else actions.append(el('button', { class: 'btn primary', type: 'button', onclick: () => navigate(story.id) }, 'Open the volume'));
      slipBox.append(actions);
      if (ends.length) slipBox.append(el('p', { class: 'slip-ends', text: 'Endings reached: ' + ends.join(' · ') }));
    } else {
      slipBox.append(el('p', { class: 'seal', text: 'Sealed · not yet unwritten' }));
    }
    app.append(
      el('header', { class: 'hub-bar' }, el('button', { class: 'wordmark', type: 'button', onclick: () => navigate('') }, 'Unwriting Her')),
      el('main', { class: 'hub' },
        el('header', { class: 'hub-head' },
          el('p', { class: 'kicker', text: 'Catalogue of the confined' }),
          el('h1', { text: 'The Reading Room' }),
          el('p', { class: 'hub-lede', text: 'Women written as mad, silenced, or kept. Each of them stands beside someone her book calls normal. One volume has a candle lit beside it; the others are sealed until their stories are written. Take a book down from the shelf.' })),
        el('div', { class: 'room' },
          el('div', { class: 'case' }, el('div', { class: 'case-glow', 'aria-hidden': 'true' }), shelf, el('div', { class: 'plank', 'aria-hidden': 'true' })),
          slipBox)));
    window.scrollTo(0, 0);
  }

  /* ============================================================ STORY */
  let storyRoot, main, placeEl, roleEl, recBtn, menuEl, drawer, scrim, exploreEl = null;
  let stageEl = null, artEl = null, canvasEl = null, panelEl = null, pagerEl = null;
  let viewI = 0;            // which page of the current scene is on screen
  const isEssay = () => !!cur.story.scenes[cur.s.scene].essay;

  function openStory(id) {
    const story = UH.stories[id];
    if (!story) return showHub();
    view = 'story';
    const s = normalise(store.runs[id] || fresh(story), story);
    store.runs[id] = s;
    cur = { story, s };
    composing = [];
    viewI = s.beat;
    app.className = 'view-story';
    app.innerHTML = '';
    buildChrome();
    renderStory();
    window.scrollTo(0, 0);
  }

  function buildChrome() {
    placeEl = el('span', { class: 'bar-place' });
    roleEl = el('span', { class: 'role-chip', hidden: true });
    recBtn = el('button', { class: 'bar-btn', type: 'button', 'aria-controls': 'record', 'aria-expanded': 'false', onclick: () => toggleDrawer(true) },
      'Record ', el('span', { class: 'rec-count', text: String(cur.s.record.length) }));
    const menuBtn = el('button', { class: 'bar-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'story-menu' }, 'Menu');
    const confirmRow = el('div', { class: 'menu-confirm', hidden: true },
      el('p', { text: 'Clear your readings and start again from the threshold?' }),
      el('div', { class: 'menu-row' },
        el('button', { class: 'btn primary small', type: 'button', onclick: () => { closeMenu(); restartStory(); } }, 'Begin again'),
        el('button', { class: 'btn quiet small', type: 'button', onclick: () => { confirmRow.hidden = true; } }, 'Keep reading')
      ));
    menuEl = el('div', { class: 'menu', id: 'story-menu', hidden: true },
      el('button', { class: 'menu-item', type: 'button', onclick: () => { closeMenu(); navigate('reading-room'); } }, 'Return to the Reading Room'),
      el('button', { class: 'menu-item', type: 'button', onclick: () => { closeMenu(); toggleDrawer(true, 'key'); } }, 'How to read the marks'),
      el('button', { class: 'menu-item', type: 'button', onclick: () => { confirmRow.hidden = false; } }, 'Begin this story again'),
      confirmRow);
    function closeMenu() { menuEl.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); confirmRow.hidden = true; }
    menuBtn.addEventListener('click', e => { e.stopPropagation(); const open = menuEl.hidden; menuEl.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); if (!open) confirmRow.hidden = true; });
    document.addEventListener('click', e => { if (menuEl && !menuEl.hidden && !menuEl.contains(e.target) && e.target !== menuBtn) closeMenu(); });

    const bar = el('header', { class: 'bar' },
      el('button', { class: 'wordmark', type: 'button', onclick: () => navigate('reading-room'), title: 'Return to the Reading Room' }, 'Unwriting Her'),
      placeEl, roleEl,
      el('div', { class: 'bar-actions' }, recBtn, el('div', { class: 'menu-wrap' }, menuBtn, menuEl))
    );
    storyRoot = el('div', { class: 'story-root' });
    scrim = el('div', { class: 'scrim', hidden: true, onclick: () => toggleDrawer(false) });
    drawer = el('aside', { class: 'drawer', id: 'record', 'aria-label': 'The Record', tabindex: '-1' });
    app.append(bar, storyRoot, scrim, drawer);
    storyRoot.addEventListener('click', onStoryClick);
    storyRoot.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target;
      if (t.classList && (t.classList.contains('clue') || t.classList.contains('hot'))) { e.preventDefault(); onStoryClick(e); }
    });
  }

  function restartStory() {
    const story = cur.story;
    store.runs[story.id] = fresh(story);
    persist();
    openStory(story.id);
  }

  function sceneHead(sc) {
    return el('header', { class: 'scene-head' },
      el('p', { class: 'place', text: sc.place || '' }),
      el('h1', { class: 'scene-title', tabindex: '-1', text: sc.title }),
      sc.cite ? el('p', { class: 'scene-cite', text: sc.cite }) : null,
      sc.staged ? el('p', { class: 'staged', text: sc.staged }) : null);
  }

  function renderStory() {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    document.title = 'Unwriting Her · ' + sc.title;
    placeEl.textContent = sc.place || '';
    storyRoot.innerHTML = '';
    stopMotes();
    if (sc.essay) {
      // the thesis keeps its own page: one long column that grows as you read on
      stageEl = artEl = canvasEl = panelEl = pagerEl = exploreEl = null;
      main = el('main', { class: 'story essay', id: 'story', 'data-measure': sc.measure || 'normal' });
      storyRoot.append(main);
      for (let i = 0; i <= s.beat; i++) main.append(renderBeat(sc, i, i === s.beat));
    } else {
      artEl = el('div', { class: 'art' });
      canvasEl = el('canvas', { class: 'motes', 'aria-hidden': 'true' });
      const artWrap = el('div', { class: 'art-wrap' }, artEl, canvasEl);
      main = el('div', { class: 'page' });
      pagerEl = el('nav', { class: 'pager', 'aria-label': 'Pages' });
      exploreEl = el('section', { class: 'explore', 'aria-label': 'In this room' });
      panelEl = el('main', { class: 'panel', id: 'story', 'data-measure': sc.measure || 'normal' }, sceneHead(sc), main, exploreEl, pagerEl);
      stageEl = el('div', { class: 'stage', 'data-scene': s.scene }, artWrap, panelEl);
      storyRoot.append(stageEl);
      renderPage();
      renderArt();
      renderExplore();
      startMotes(sc.motes || 'dust');
    }
    updateRecCount();
  }
  function updateRecCount() {
    const c = document.querySelector('.rec-count'); if (c) c.textContent = cur.s.record.length;
    if (roleEl) { const txt = cur.story.roleChip ? cur.story.roleChip(cur.s) : null; roleEl.hidden = !txt; roleEl.textContent = txt || ''; }
  }

  function renderArt() {
    if (!artEl) return;
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    const draw = UH.art && sc.art && UH.art[sc.art];
    artEl.innerHTML = draw ? draw(s, s.beat) : '';
    const b = sc.beats[s.beat];
    const live = new Set();
    if (pendingGate && viewI === s.beat) live.add(pendingGate);
    const fullyShown = !main.querySelector('.reveal-next, .gate-btn');
    if (fullyShown && viewI === s.beat) (b.examine || []).forEach(x => live.add(x.id));
    const witnessesHere = fullyShown && b.blocks.some(x => x && x.t === 'witnesses');
    artEl.querySelectorAll('.hot').forEach(h => {
      const ok = h.dataset.go ? witnessesHere : live.has(h.dataset.ex);
      if (!ok) { h.classList.remove('hot'); h.removeAttribute('tabindex'); h.removeAttribute('role'); }
      else if (h.dataset.ex === pendingGate || (h.dataset.ex && !s.examined.includes(h.dataset.ex))) h.classList.add('beckon');
    });
    stageEl.dataset.beat = String(viewI);
    stageEl.dataset.art = sc.art || '';
  }

  function renderPage(turn) {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    main.innerHTML = '';
    pendingGate = null;
    if (viewI < s.beat) {
      main.append(el('p', { class: 'reread' }, 'You are rereading an earlier page. ',
        el('button', { type: 'button', class: 'linkish', onclick: () => { viewI = s.beat; renderPage(true); renderArt(); } }, 'Back to where you were →')));
    }
    const b = renderBeat(sc, viewI, viewI === s.beat);
    if (turn && !reduceMotion) b.classList.add('turn');
    main.append(b);
    renderPager();
  }

  function renderPager() {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    pagerEl.innerHTML = '';
    if (sc.beats.length < 2) return;
    pagerEl.append(
      el('button', { type: 'button', class: 'pg-btn', disabled: viewI === 0, onclick: () => turnTo(viewI - 1) }, '← Previous page'),
      el('span', { class: 'pg-count', text: `Page ${viewI + 1} of ${sc.beats.length}` }),
      viewI < s.beat ? el('button', { type: 'button', class: 'pg-btn', onclick: () => turnTo(viewI + 1) }, 'Next page →') : el('span', { class: 'pg-spacer' }));
  }
  function turnTo(i) {
    const { s } = cur;
    viewI = Math.max(0, Math.min(i, s.beat));
    renderPage(true); renderArt();
    scrollToPanel();
  }
  function scrollToPanel() {
    if (!panelEl) return window.scrollTo(0, 0);
    const y = panelEl.getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function go(id) {
    const { story, s } = cur;
    const sc = story.scenes[id];
    if (!sc) { console.warn('Missing scene', id); return; }
    const firstVisit = !s.visited.includes(id);
    s.scene = id; s.beat = 0; s.expanded = []; viewI = 0;
    if (firstVisit) s.visited.push(id);
    if (sc.onEnter) sc.onEnter(s, helpers);
    if (sc.ending) {
      s.ending = sc.ending;
      store.endings[story.id] = store.endings[story.id] || [];
      if (!store.endings[story.id].includes(sc.ending)) store.endings[story.id].push(sc.ending);
    }
    save();
    if (firstVisit) titleCard(sc);
    renderStory();
    window.scrollTo(0, 0);
    const t = document.querySelector('.scene-title, .essay-title');
    if (t) t.focus({ preventScroll: true });
  }

  function titleCard(sc) {
    if (reduceMotion) return;
    const tc = el('div', { class: 'titlecard', 'aria-hidden': 'true' },
      el('p', { class: 'tc-place', text: sc.place || '' }),
      el('p', { class: 'tc-title', text: sc.title }),
      sc.cite ? el('p', { class: 'tc-cite', text: sc.cite }) : null);
    const end = () => { tc.classList.add('out'); setTimeout(() => tc.remove(), 700); };
    tc.addEventListener('click', end);
    document.body.append(tc);
    setTimeout(end, 1500);
  }

  function nextBeat() {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    if (s.beat >= sc.beats.length - 1) return;
    if (sc.essay) {
      const old = main.querySelector(`.beat[data-i="${s.beat}"]`);
      s.beat++; save();
      if (old) old.replaceWith(renderBeat(sc, s.beat - 1, false));
      const nb = renderBeat(sc, s.beat, true);
      if (!reduceMotion) nb.classList.add('enter');
      main.append(nb);
      nb.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    s.beat++; viewI = s.beat; save();
    renderPage(true); renderArt();
    scrollToPanel();
  }

  function revealNext(gate) {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    if (!sc || sc.essay || viewI !== s.beat) return;
    const key = revealKey(s.beat);
    const items = sc.beats[s.beat].blocks.map(raw => typeof raw === 'function' ? raw(s) : raw).filter(Boolean);
    const at = s.revealed[key] || 0;
    if (at >= items.length) return;
    const next = items[at];
    if (next.t === 'gate' && !gate) return;
    if (next.t === 'gate') {
      const ex = (s.explored[s.scene] = s.explored[s.scene] || []);
      if (!ex.includes(next.hot)) ex.push(next.hot);
      if (next.flag) helpers.flag(next.flag);
      if (next.flag === 'keys') showToast('You know where the keys are kept.');
    }
    s.revealed[key] = at + 1;
    save();
    pendingGate = null;
    const nb = refreshBeat();
    updateRecCount();
    const blocks = nb.querySelectorAll(':scope > .blk');
    const last = blocks[blocks.length - 1];
    if (last && !reduceMotion) last.classList.add('unfold');
    const cue = nb.querySelector('.reveal-next, .gate-btn') || nb.querySelector('.choices, .reading, .examine');
    (cue || last || nb).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function refreshBeat() {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    const old = main.querySelector(`.beat[data-i="${s.beat}"]`);
    pendingGate = null;
    const nb = renderBeat(sc, s.beat, true);
    if (old) old.replaceWith(nb); else main.append(nb);
    if (!sc.essay) { renderArt(); renderPager(); }
    return nb;
  }

  function act(c) {
    const { s } = cur;
    if (c.set) c.set(s, helpers);
    save();
    if (c.next) return nextBeat();
    if (c.to) return go(c.to);
  }

  /* things to look at in a room: listed under the page, and clickable in the picture */
  const exploredHere = () => (cur.s.explored[cur.s.scene] = cur.s.explored[cur.s.scene] || []);
  function renderExplore() {
    if (!exploreEl) return;
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    exploreEl.innerHTML = '';
    const items = (sc.explore || []).filter(x => !x.when || x.when(s));
    exploreEl.hidden = !items.length;
    if (!items.length) return;
    const done = exploredHere();
    const left = items.filter(x => !done.includes(x.id));
    exploreEl.append(el('div', { class: 'explore-head' },
      el('p', { class: 'ex-label', text: 'In this room' }),
      el('p', { class: 'explore-count', text: `${done.length} of ${items.length} looked at` })));
    if (left.length) exploreEl.append(el('div', { class: 'ex-list' }, left.map(x => el('button', { type: 'button', class: 'ex-btn', onclick: () => doExplore(x) }, x.label))));
    else exploreEl.append(el('p', { class: 'explore-done', text: 'You have looked at everything in this room.' }));
    const reveals = el('div', { class: 'ex-reveals' });
    done.forEach(id => {
      const x = items.find(e => e.id === id);
      if (!x) return;
      const r = el('div', { class: 'ex-reveal', 'data-ex-reveal': x.id }, el('h3', { class: 'ex-title', text: x.label }));
      x.blocks.forEach((blk, k) => { const nd = renderBlock(blk, `${s.scene}.room.${x.id}.${k}`, true); if (nd) r.append(nd); });
      reveals.append(r);
    });
    exploreEl.append(reveals);
  }
  function doExplore(x) {
    const { s } = cur;
    const done = exploredHere();
    if (!done.includes(x.id)) {
      done.push(x.id);
      if (x.flag) helpers.flag(x.flag);
      save();
      renderExplore(); renderArt(); updateRecCount();
      if (x.flag === 'keys') showToast('You know where the keys are kept.');
    }
    const r = exploreEl && exploreEl.querySelector(`[data-ex-reveal="${x.id}"]`);
    if (r) { if (!reduceMotion) { r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); } r.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); }
  }

  /* hotspots in the art */
  function handleHot(h) {
    const { story, s } = cur;
    const sc = story.scenes[s.scene];
    const b = sc.beats[s.beat];
    if (h.dataset.ex && h.dataset.ex === pendingGate) return revealNext(true);
    const room = h.dataset.ex && (sc.explore || []).find(x => x.id === h.dataset.ex && (!x.when || x.when(s)));
    if (room) return doExplore(room);
    if (h.dataset.ex) {
      const x = b.examine && b.examine.find(e => e.id === h.dataset.ex);
      if (!x) { showToast('Nothing more to find there tonight.'); return; }
      if (viewI !== s.beat) return;
      if (!s.examined.includes(x.id)) doExamine(x);
      else { const r = main.querySelector(`[data-ex-reveal="${x.id}"]`); if (r) { r.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); r.classList.remove('flash'); void r.offsetWidth; r.classList.add('flash'); } }
      return;
    }
    if (h.dataset.go) {
      const hasWitnesses = b.blocks.some(x => x && x.t === 'witnesses');
      const w = story.witnesses.find(x => x.scene === h.dataset.go);
      if (hasWitnesses && w) callWitness(w);
      return;
    }
  }

  /* drifting motes in the candlelight, or embers near fire */
  let motesRAF = null;
  function stopMotes() { if (motesRAF) cancelAnimationFrame(motesRAF); motesRAF = null; }
  function startMotes(kind) {
    stopMotes();
    if (reduceMotion || kind === 'none' || !canvasEl) return;
    const c = canvasEl, ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, Hh = 0;
    const size = () => { const r = c.getBoundingClientRect(); W = r.width; Hh = r.height; c.width = Math.max(1, W * dpr); c.height = Math.max(1, Hh * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ember = kind === 'embers';
    const n = ember ? 34 : 42;
    const ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * Hh, r: Math.random() * (ember ? 1.8 : 1.4) + 0.4, vx: (Math.random() - 0.5) * (ember ? 0.35 : 0.12), vy: ember ? -(Math.random() * 0.6 + 0.25) : (Math.random() - 0.5) * 0.08, a: Math.random() * 0.35 + 0.05, t: Math.random() * 6 }));
    let last = 0;
    const tick = ts => {
      if (!canvasEl || !document.body.contains(c)) return stopMotes();
      if (ts - last > 33) {
        last = ts;
        if (Math.abs(c.getBoundingClientRect().width - W) > 2) size();
        ctx.clearRect(0, 0, W, Hh);
        ps.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.t += 0.03;
          if (ember && p.y < -10) { p.y = Hh + 10; p.x = Math.random() * W; }
          if (!ember) { if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = Hh + 5; if (p.y > Hh + 5) p.y = -5; }
          const alpha = ember ? p.a * Math.max(0, Math.min(1, p.y / Hh * 1.4)) + 0.05 : p.a * (0.6 + 0.4 * Math.sin(p.t));
          ctx.fillStyle = ember ? `rgba(232,140,80,${alpha.toFixed(3)})` : `rgba(220,190,140,${alpha.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      }
      motesRAF = requestAnimationFrame(tick);
    };
    motesRAF = requestAnimationFrame(tick);
  }

  document.addEventListener('keydown', e => {
    if (view !== 'story' || !cur || isEssay() || (drawer && drawer.classList.contains('open'))) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') return;
    if (e.key === 'ArrowLeft' && viewI > 0) turnTo(viewI - 1);
    if (e.key === 'ArrowRight' || (e.key === ' ' && (tag === 'body' || tag === 'main'))) {
      if (main && main.querySelector('.reveal-next')) { e.preventDefault(); revealNext(false); return; }
      if (e.key === ' ') return;
      if (viewI < cur.s.beat) turnTo(viewI + 1);
      else { const btn = main && main.querySelector('.continue'); if (btn) btn.click(); }
    }
  });

  /* ------------------------------------------------------------ beats */
  let pendingGate = null;
  const revealKey = i => `${cur.s.scene}.${i}`;
  function renderBeat(sc, i, current) {
    const { s } = cur;
    const b = sc.beats[i];
    const sec = el('section', { class: 'beat', 'data-i': i });
    let k = 0;
    const items = b.blocks.map((raw, j) => ({ blk: typeof raw === 'function' ? raw(s) : raw, j })).filter(x => x.blk);
    let shown = items.length;
    if (current && !sc.essay) {
      const key = revealKey(i);
      if (s.revealed[key] === undefined) s.revealed[key] = items.length && items[0].blk.t === 'gate' ? 0 : 1;
      shown = Math.min(items.length, s.revealed[key]);
    }
    items.slice(0, shown).forEach(({ blk, j }) => {
      const node = renderBlock(blk, `${s.scene}.${i}.${j}`, current);
      if (!node) return;
      node.style.setProperty('--k', k++);
      sec.append(node);
      const ids = blk.text ? clueIds(typeof blk.text === 'string' ? blk.text : '') : [];
      if (ids.length) {
        const holder = el('div', { class: 'glosses', 'data-for': `${s.scene}.${i}.${j}` });
        ids.forEach(id => { if (s.expanded.includes(id)) holder.append(renderGloss(id)); });
        sec.append(holder);
      }
    });
    if (shown < items.length) {
      const next = items[shown].blk;
      if (next.t === 'gate') {
        pendingGate = next.hot;
        sec.append(el('button', { type: 'button', class: 'gate-btn', 'data-gate': next.hot }, el('span', { class: 'gate-glyph', 'aria-hidden': 'true' }), next.prompt));
      } else {
        sec.append(el('button', { type: 'button', class: 'reveal-next', 'aria-label': 'Continue reading' }, el('span', { 'aria-hidden': 'true', text: '· · ·' })));
      }
      return sec;
    }
    if (b.examine) sec.append(renderExamine(b, current, `${s.scene}.${i}`));
    if (b.reading) sec.append(renderReading(b.reading, current));
    if (current) { const c = renderControls(sc, b, i); if (c) sec.append(c); }
    return sec;
  }

  function capFor(who, cite, tier) {
    return el('figcaption', { class: 'cap' },
      el('span', { class: 'cap-tier', 'data-tier': tier, text: TIER[tier] || tier }),
      cite ? el('span', { text: cite }) : null,
      who ? el('span', { class: 'cap-who', text: who }) : null);
  }

  function renderBlock(b, rid, live) {
    const { story, s } = cur;
    switch (b.t) {
      case 'p':
        return el('div', { class: 'blk narr' + (b.small ? ' small' : ''), html: rich(b.text, s, story, true) });
      case 'h':
        return el('h3', { class: 'blk sub', text: interp(b.text, s, story) });
      case 'q': {
        addRecord({ id: rid, k: 'q', who: b.who, cite: b.cite, text: stripClues(b.text) });
        const essay = story.scenes[s.scene] && story.scenes[s.scene].essay;
        const closeOn = b.close && s.role === 'reader' && !essay;
        const open = closeOn && s.closeOpen.includes(rid);
        let html = rich(b.text, s, story, true);
        if (open) html = markClose(html, b.close);
        const cap = capFor(b.who, b.cite, 'text');
        if (closeOn) cap.append(el('button', { type: 'button', class: 'close-btn', 'data-close-read': rid, 'aria-pressed': String(open) }, open ? 'Close reading on' : 'Read closely'));
        const fig = el('figure', { class: 'blk quote' + (b.doc ? ' doc' : '') + (b.interrupt ? ' interrupt' : '') + (open ? ' close-open' : '') }, cap, el('blockquote', { html }));
        if (open) fig.append(el('ul', { class: 'close-notes' }, b.close.map(c => el('li', {}, el('mark', { class: 'close', text: c.w }), el('span', { html: inline(c.n, s) })))));
        return fig;
      }
      case 'note': {
        addRecord({ id: rid, k: 'g', tier: b.tier, by: b.by, text: b.text });
        return el('aside', { class: 'blk gloss inline', 'data-tier': b.tier },
          el('p', { class: 'gloss-cap' }, el('span', { class: 'cap-tier', 'data-tier': b.tier, text: TIER[b.tier] }), b.by ? el('span', { text: b.by }) : null),
          el('div', { class: 'gloss-body', html: rich(b.text, s, story, false) }));
      }
      case 'reflect': return renderGlassPuzzle(b.id, 'blk');
      case 'gate': return el('p', { class: 'blk stage-dir', text: b.prompt + '.' });
      case 'list': return el('ul', { class: 'blk plain-list' }, b.items.map(x => el('li', { html: inline(x, s) })));
      case 'acts': return renderActs('blk');
      case 'check': return renderCheck(b);
      case 'crossx': return renderCross(b.w);
      case 'cite': return renderCite();
      case 'marginwrite': return renderMarginWrite();
      case 'marginshow': return el('div', { class: 'blk margin-pair' },
        el('figure', { class: 'quote' }, capFor('Mrs. Fairfax', 'Ch. XI', 'text'), el('blockquote', { html: inline('“Some of the servants, very likely,” she answered: “perhaps Grace Poole.”', s) })),
        el('div', { class: 'margin-note' }, el('span', { class: 'cap-tier', 'data-tier': 'margin', text: 'Your hand, in the margin' }), el('p', { class: 'hand', text: s.marginNote })));
      case 'mirror': {
        addRecord({ id: rid, k: 'q', who: b.who, cite: b.cite, text: b.text });
        const line = el('button', { type: 'button', class: 'mirror-line', 'aria-label': b.text + ' (shown reversed, as in a mirror; press to turn it round)' },
          el('span', { class: 'mirror-inner', html: inline(b.text, s) }));
        line.addEventListener('click', () => line.classList.toggle('flipped'));
        const mcap = capFor(b.who, b.cite, 'text');
        return el('figure', { class: 'blk quote mirror' }, mcap,
          el('blockquote', {}, line), el('p', { class: 'mirror-hint', text: 'In the glass. Press the line to turn it round.' }));
      }
      case 'witnesses': return renderWitnesses();
      case 'tiles': return renderTiles();
      case 'write': return renderWrite();
      case 'silence': return renderSilence();
      case 'burn': return renderBurn(b);
      case 'after': return renderAfterword();
      case 'margin': return s.voice.text ? el('div', { class: 'blk margin-text hand' + (b.faded ? ' faded' : ''), text: s.voice.text }) : null;
      case 'essayhead': return el('header', { class: 'blk essay-head' },
        el('p', { class: 'kicker', text: b.kicker }),
        el('h1', { class: 'essay-title', tabindex: '-1', text: story.scenes[s.scene].title }),
        el('p', { class: 'essay-sub', text: b.sub }));
      case 'glasslist': return renderGlassList();
      case 'youglass': return el('div', { class: 'blk glass-list you' }, story.youGlass(s).map(r => renderGlass(r)));
      default: return null;
    }
  }

  /* ------------------------------------------------------------ reader's tools */
  function markClose(html, words) {
    return html.split(/(<[^>]+>)/).map(seg => {
      if (seg.startsWith('<')) return seg;
      words.forEach(c => {
        const re = new RegExp('(^|[^\\p{L}])(' + reEsc(esc(c.w)) + ')(?=$|[^\\p{L}])', 'gu');
        seg = seg.replace(re, '$1<mark class="close">$2</mark>');
      });
      return seg;
    }).join('');
  }
  function renderCheck(b) {
    const { story, s } = cur;
    const done = b.id in s.checks;
    const wrap = el('div', { class: 'blk check' }, el('p', { class: 'check-k', text: 'A reader’s check' }), el('p', { class: 'check-claim', text: b.claim }));
    if (!done) {
      const pick = ans => { s.checks[b.id] = ans === b.answer; save(); const nw = renderCheck(b); if (!reduceMotion) nw.classList.add('enter'); wrap.replaceWith(nw); };
      wrap.append(el('div', { class: 'check-row' },
        el('button', { type: 'button', class: 'btn', onclick: () => pick('text') }, 'It is in the text'),
        el('button', { type: 'button', class: 'btn', onclick: () => pick('reading') }, 'It is my reading')));
    } else {
      const ok = s.checks[b.id];
      wrap.append(el('p', { class: 'check-verdict ' + (ok ? 'ok' : 'miss'), text: ok ? 'You told the text from the reading.' : (b.answer === 'reading' ? 'That is a reading, not the text.' : 'That one is in the text.') }),
        el('div', { class: 'gloss-body', html: rich(b.note, s, story, false) }));
    }
    return wrap;
  }

  /* ------------------------------------------------------------ judge's tools */
  function renderCross(w) {
    const { story, s } = cur;
    const qs = (story.crossx || {})[w];
    if (!qs) return null;
    const wrap = el('div', { class: 'blk crossx' }, el('p', { class: 'check-k', text: 'Cross-examination · one question' }));
    const asked = s.crossx[w];
    if (asked === undefined) {
      wrap.append(el('p', { class: 'check-claim', text: 'You may put one question to this witness. The witness can only answer in words the record already holds.' }));
      wrap.append(el('div', { class: 'cross-qs' }, qs.map((q, i) => el('button', { type: 'button', class: 'reading-opt', onclick: () => {
        s.crossx[w] = i; save(); const nw = renderCross(w); if (!reduceMotion) nw.classList.add('enter'); wrap.replaceWith(nw);
      } }, el('span', { class: 'r-label', text: q.q })))));
    } else {
      const q = qs[asked];
      wrap.append(el('p', { class: 'your-reading' }, el('span', { class: 'cap-tier', 'data-tier': 'margin', text: 'You asked' }), el('span', { class: 'hand', text: q.q })));
      if (q.a) wrap.append(renderBlock(q.a, `cross.${w}`, true));
      else wrap.append(el('p', { class: 'cross-silence', text: 'No answer. The record holds nothing this witness could say.' }));
      if (q.n) wrap.append(el('aside', { class: 'gloss', 'data-tier': 'annotation' }, el('p', { class: 'gloss-cap' }, el('span', { class: 'cap-tier', 'data-tier': 'annotation', text: TIER.annotation })), el('div', { class: 'gloss-body', html: rich(q.n, s, story, false) })));
    }
    return wrap;
  }
  function renderCite() {
    const { s } = cur;
    const wrap = el('div', { class: 'blk cite' });
    const quotes = s.record.filter(r => r.k === 'q');
    const pinned = [];
    const rest = quotes;
    const need = s.role === 'judge' ? 2 : 0;
    wrap.append(el('p', { class: 'check-k', text: `Evidence cited: ${s.cited.length} of 2` + (need ? '' : ' (optional)') }));
    const card = r => {
      const on = s.cited.includes(r.id);
      return el('button', { type: 'button', class: 'cite-card' + (on ? ' on' : ''), 'aria-pressed': String(on), onclick: () => {
        if (on) s.cited = s.cited.filter(x => x !== r.id);
        else if (s.cited.length < 2) s.cited.push(r.id);
        else { showToast('You can cite two fragments. Remove one first.'); return; }
        save(); refreshBeat();
      } }, el('span', { class: 'cite-who', text: r.who + ' · ' + r.cite }), el('span', { class: 'cite-text', text: trimText(r.text, 160) }));
    };
    const chosen = rest.filter(r => s.cited.includes(r.id));
    if (chosen.length) wrap.append(el('div', { class: 'cite-list' }, chosen.map(card)));
    const more = el('details', { class: 'cite-more' }, el('summary', { text: `Choose from the record (${rest.length} passages you have read)` }), el('div', { class: 'cite-list' }, rest.filter(r => !s.cited.includes(r.id)).map(card)));
    if (s.role === 'judge' && s.cited.length < 2) more.open = true;
    wrap.append(more);
    return wrap;
  }
  const trimText = (t, n) => { t = String(t).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };

  /* ------------------------------------------------------------ rescuer's tools: what she did */
  function renderActs(extra) {
    const { story, s } = cur;
    const list = el('ol', { class: 'acts' + (extra ? ' ' + extra : '') }, story.acts.map(a => {
      const gone = s.erased.includes(a.k);
      return el('li', { class: gone ? 'erased' : '' }, el('span', { class: 'act-ch', text: a.ch }),
        el('span', { class: 'act-t' }, el('span', { html: inline(a.t, s) }), gone ? el('span', { class: 'act-gone', text: 'Prevented by you' }) : null));
    }));
    return list;
  }

  /* ------------------------------------------------------------ the margin (reader's ending) */
  function renderMarginWrite() {
    const { s } = cur;
    const wrap = el('div', { class: 'blk write' });
    const ta = el('textarea', { id: 'margin-note', class: 'hand-input', rows: '4', maxlength: '300', 'aria-label': 'Your note in the margin', placeholder: 'Write beside “perhaps Grace Poole”…' });
    ta.value = s.marginNote || '';
    const submit = el('button', { type: 'button', class: 'btn primary' }, 'Write it in the margin');
    const sync = () => { submit.disabled = ta.value.trim().length < 2; };
    ta.addEventListener('input', () => { s.marginNote = ta.value; sync(); save(); });
    submit.addEventListener('click', () => {
      if (ta.value.trim().length < 2) return;
      s.marginNote = ta.value.trim(); helpers.flag('margin-written');
      addRecord({ id: 'margin:ch11', k: 'g', tier: 'margin', text: s.marginNote });
      save(); refreshBeat();
      const c = main.querySelector('.continue'); if (c) c.focus();
    });
    sync();
    wrap.append(ta, el('div', { class: 'tile-actions' }, submit));
    return wrap;
  }

  /* ------------------------------------------------------------ the glass puzzle */
  function renderGlassPuzzle(id, extra) {
    const { story, s } = cur;
    const r = story.reflections[id];
    if (!r) return null;
    if (s.reflections.includes(id)) return renderGlass(r, extra);
    const tried = s.glassTried[id] || [];
    const others = Object.keys(story.reflections).filter(k => k !== id);
    const h = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const decoys = [others[h % others.length], others[(h * 7 + 3) % others.length]].filter((v, i, a) => v && a.indexOf(v) === i && v !== id).slice(0, 2);
    const opts = [id, ...decoys].sort((a, b) => ((h + a.length * 13) % 5) - ((h + b.length * 13) % 5));
    const wrap = el('div', { class: 'glass glass-puzzle' + (extra ? ' ' + extra : '') },
      el('p', { class: 'glass-cap' }, el('span', { text: 'In the glass · something is standing beside her' }), r.cite ? el('span', { text: r.cite }) : null),
      el('div', { class: 'glass-panes' },
        el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Her' }), el('span', { class: 'pane-t', html: inline(r.her, s) })),
        el('div', { class: 'glass-line', 'aria-hidden': 'true' }),
        el('div', { class: 'pane other fog' }, el('span', { class: 'pane-k', text: 'Beside her' }), el('span', { class: 'pane-t', text: 'Who does this description make visible?' }))),
      el('div', { class: 'glass-opts' }, opts.map(k => {
        const bad = tried.includes(k);
        return el('button', { type: 'button', class: 'glass-opt' + (bad ? ' wrong' : ''), disabled: bad, onclick: () => {
          if (k === id) { addReflection(id); save(); const g = renderGlass(r, extra); if (!reduceMotion) g.classList.add('enter', 'clear'); wrap.replaceWith(g); }
          else { s.glassTried[id] = tried.concat(k); save(); const nw = renderGlassPuzzle(id, extra); wrap.replaceWith(nw); showToast('That stands beside her elsewhere in the novel. Look again at this passage.'); }
        } }, el('span', { class: 'hand', html: inline(story.reflections[k].other, s) }));
      })));
    return wrap;
  }

  function renderGlass(r, extra) {
    if (!r) return null;
    return el('div', { class: 'glass' + (extra ? ' ' + extra : '') },
      el('p', { class: 'glass-cap' }, el('span', { text: 'In the glass' }), r.cite ? el('span', { text: r.cite }) : null),
      el('div', { class: 'glass-panes' },
        el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Her' }), el('span', { class: 'pane-t', html: inline(r.her, cur.s) })),
        el('div', { class: 'glass-line', 'aria-hidden': 'true' }),
        el('div', { class: 'pane other' }, el('span', { class: 'pane-k', text: r.who }), el('span', { class: 'pane-t', html: inline(r.other, cur.s) }))));
  }
  function renderGlassList() {
    const { story, s } = cur;
    const wrap = el('div', { class: 'blk glass-list' });
    if (!s.reflections.length) wrap.append(el('p', { class: 'empty', text: 'The glass is empty. You opened none of the notes where the comparisons are made.' }));
    s.reflections.forEach(id => wrap.append(renderGlass(story.reflections[id])));
    const missing = Object.keys(story.reflections).length - s.reflections.length;
    if (missing > 0) wrap.append(el('p', { class: 'glass-missing', text: `${missing} more ${missing === 1 ? 'reflection was' : 'reflections were'} in passages you did not read or notes you did not open.` }));
    return wrap;
  }

  /* ------------------------------------------------------------ glosses */
  function renderGloss(id) {
    const { story, s } = cur;
    const c = story.clues[id];
    if (!c) return el('aside', { class: 'gloss', text: 'Missing note: ' + id });
    const g = el('aside', { class: 'gloss', 'data-tier': c.tier, 'data-gloss': id },
      el('p', { class: 'gloss-cap' },
        el('span', { class: 'cap-tier', 'data-tier': c.tier, text: TIER[c.tier] }),
        c.by ? el('span', { text: c.by }) : null,
        el('button', { type: 'button', class: 'gloss-close', 'aria-label': 'Close note', 'data-close': id }, '×')),
      el('div', { class: 'gloss-body', html: rich(c.text, s, story, false) }));
    if (c.reflect) { addReflection(c.reflect); g.append(renderGlass(story.reflections[c.reflect])); }
    return g;
  }

  function pinBtn(rid) {
    const on = cur.s.pinned.includes(rid);
    return el('button', { type: 'button', class: 'pin-btn' + (on ? ' on' : ''), 'data-pin': rid, 'aria-pressed': String(on), title: on ? 'Unpin from your casebook' : 'Pin to your casebook' }, on ? 'Pinned' : 'Pin');
  }
  function onStoryClick(e) {
    const h = e.target.closest && e.target.closest('.hot');
    if (h) return handleHot(h);
    if (e.target.closest('.gate-btn')) return revealNext(true);
    if (e.target.closest('.reveal-next')) return revealNext(false);
    const pin = e.target.closest('[data-pin]');
    if (pin) {
      const s = cur.s, id = pin.dataset.pin;
      const on = s.pinned.includes(id);
      s.pinned = on ? s.pinned.filter(x => x !== id) : s.pinned.concat(id);
      save();
      storyRoot.querySelectorAll(`[data-pin="${CSS.escape(id)}"]`).forEach(b => b.replaceWith(pinBtn(id)));
      showToast(on ? 'Removed from your casebook.' : `Pinned. Your casebook holds ${s.pinned.length} ${s.pinned.length === 1 ? 'fragment' : 'fragments'}.`);
      return;
    }
    const cr = e.target.closest('[data-close-read]');
    if (cr) {
      const s = cur.s, id = cr.dataset.closeRead;
      s.closeOpen = s.closeOpen.includes(id) ? s.closeOpen.filter(x => x !== id) : s.closeOpen.concat(id);
      save();
      const fig = cr.closest('figure.blk');
      const sc = cur.story.scenes[s.scene];
      const blk = findBlock(sc, id);
      if (fig && blk) { const nf = renderBlock(blk, id, true); nf.style.animation = 'none'; fig.replaceWith(nf); }
      return;
    }
    const close = e.target.closest('[data-close]');
    const clue = close ? storyRoot.querySelector(`.clue[data-clue="${close.dataset.close}"]`) : e.target.closest('.clue');
    if (!clue) {
      const quiet = e.target.closest('.page') && !e.target.closest('button, a, input, textarea, summary, details, .gloss, .clue');
      if (quiet && main.querySelector('.reveal-next')) revealNext(false);
      return;
    }
    const { story, s } = cur;
    const id = clue.dataset.clue;
    const beat = clue.closest('.beat');
    const holder = clue.closest('.blk') && clue.closest('.blk').nextElementSibling;
    if (s.expanded.includes(id)) {
      s.expanded = s.expanded.filter(x => x !== id);
      const g = beat && beat.querySelector(`[data-gloss="${id}"]`);
      if (g) g.remove();
      clue.setAttribute('aria-expanded', 'false');
      if (close) clue.focus();
    } else {
      s.expanded.push(id);
      const first = !s.opened.includes(id);
      if (first) s.opened.push(id);
      const c = story.clues[id];
      if (c) addRecord({ id: 'g:' + id, k: 'g', tier: c.tier, by: c.by, text: c.text });
      clue.setAttribute('aria-expanded', 'true');
      clue.classList.add('seen');
      if (holder && holder.classList.contains('glosses')) {
        const g = renderGloss(id);
        holder.append(g);
        if (!reduceMotion) g.classList.add('enter');
      }
    }
    save();
  }

  function findBlock(sc, rid) {
    const parts = rid.split('.');
    const i = +parts[1], j = +parts[2];
    if (parts.length === 3 && sc.beats[i]) { const raw = sc.beats[i].blocks[j]; return typeof raw === 'function' ? raw(cur.s) : raw; }
    if (parts[1] === 'room') { const x = (sc.explore || []).find(e => e.id === parts[2]); return x && x.blocks[+parts[3]]; }
    return null;
  }

  /* ------------------------------------------------------------ examine */
  function renderExamine(b, current, rid) {
    const { s } = cur;
    const wrap = el('div', { class: 'examine' });
    const left = b.examine.filter(x => !s.examined.includes(x.id));
    if (current && left.length) {
      wrap.append(el('p', { class: 'ex-label', text: b.examineLabel || 'Look at' }));
      const list = el('div', { class: 'ex-list' });
      left.forEach(x => list.append(el('button', { type: 'button', class: 'ex-btn', onclick: () => doExamine(x) }, x.label)));
      wrap.append(list);
    }
    const reveals = el('div', { class: 'ex-reveals' });
    s.examined.forEach(id => {
      const x = b.examine.find(e => e.id === id);
      if (!x) return;
      const r = el('div', { class: 'ex-reveal', 'data-ex-reveal': x.id }, el('h3', { class: 'ex-title', text: x.label }));
      x.blocks.forEach((blk, k) => { const n = renderBlock(blk, `${rid}.x.${x.id}.${k}`, current); if (n) r.append(n); });
      reveals.append(r);
    });
    wrap.append(reveals);
    return wrap;
  }

  function doExamine(x) {
    const { s } = cur;
    if (s.examined.includes(x.id)) return;
    s.examined.push(x.id);
    if (x.flag) helpers.flag(x.flag);
    save();
    const nb = refreshBeat();
    const r = nb.querySelector(`[data-ex-reveal="${x.id}"]`);
    if (r) { if (!reduceMotion) r.classList.add('enter'); r.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); }
  }

  /* ------------------------------------------------------------ readings */
  function renderReading(r, current) {
    const { story, s } = cur;
    const labels = r.labels || story.readLabels;
    const wrap = el('div', { class: 'reading' }, el('p', { class: 'reading-q', text: r.prompt }));
    const chosen = s.readings[r.id];
    if (chosen) {
      const opt = r.options.find(o => o.k === chosen);
      wrap.append(el('p', { class: 'your-reading' }, el('span', { class: 'cap-tier', 'data-tier': 'margin', text: 'Your reading' }), el('span', { class: 'hand', text: labels[chosen] })));
      const tier = opt.tier || 'annotation';
      wrap.append(el('aside', { class: 'gloss', 'data-tier': tier },
        el('p', { class: 'gloss-cap' }, el('span', { class: 'cap-tier', 'data-tier': tier, text: tier === 'margin' ? 'A complication' : TIER[tier] }), opt.by ? el('span', { text: opt.by }) : null),
        el('div', { class: 'gloss-body', html: rich(opt.text, s, story, false) })));
    } else if (current) {
      const grid = el('div', { class: 'reading-grid' });
      r.options.forEach(o => grid.append(el('button', { type: 'button', class: 'reading-opt', onclick: () => {
        s.readings[r.id] = o.k; save();
        const nb = refreshBeat();
        const g = nb.querySelector('.reading .gloss');
        if (g && !reduceMotion) g.classList.add('enter');
      } }, el('span', { class: 'r-label', text: labels[o.k] }), el('span', { class: 'r-sub', text: o.sub }))));
      wrap.append(grid);
    }
    return wrap;
  }

  /* ------------------------------------------------------------ controls */
  function renderControls(sc, b, i) {
    const { story, s } = cur;
    if (b.reading && !s.readings[b.reading.id]) return el('p', { class: 'wait-note', text: 'Record a reading to go on. None of them is the right answer.' });
    if (b.wait && !s.flags.includes(b.wait)) return null;
    const box = el('nav', { class: 'choices', 'aria-label': 'What you do next' });
    if (b.choices === 'END') {
      box.append(
        choiceBtn({ label: 'Turn the page', sub: 'The thesis this game has been arguing.' }, () => go('thesis'), 'primary-choice'),
        choiceBtn({ label: 'Begin again from the threshold', sub: 'Other choices lead to other endings.' }, restartStory),
        choiceBtn({ label: 'Return to the Reading Room' }, () => navigate('reading-room')));
      return box;
    }
    if (b.choices === 'THESIS-END') {
      box.append(renderSources(),
        choiceBtn({ label: 'Begin again from the threshold', sub: 'Other choices lead to other endings, and other reflections.' }, restartStory),
        choiceBtn({ label: 'Return to the Reading Room' }, () => navigate('reading-room')));
      return box;
    }
    if (Array.isArray(b.choices)) {
      const visible = b.choices.filter(c => !c.when || c.when(s));
      if (!visible.length) {
        const note = sc.beats[i].waitNote ? sc.beats[i].waitNote(s) : null;
        return note ? el('p', { class: 'wait-note', text: note }) : null;
      }
      visible.forEach(c => {
        const reason = c.locked ? c.locked(s) : null;
        if (reason) box.append(el('div', { class: 'choice locked', 'aria-disabled': 'true' },
          el('span', { class: 'c-label', text: c.label }), el('span', { class: 'c-sub', text: reason })));
        else box.append(choiceBtn(c, () => act(c)));
      });
      const note = b.waitNote ? b.waitNote(s) : null;
      if (note) box.append(el('p', { class: 'wait-note', text: note }));
      return box;
    }
    if (i < sc.beats.length - 1) {
      box.classList.add('cont');
      box.append(el('button', { type: 'button', class: 'continue', onclick: nextBeat }, b.cont || 'Continue', el('span', { class: 'arrow', 'aria-hidden': 'true', text: ' ↓' })));
      return box;
    }
    return null;
  }
  function choiceBtn(c, fn, extra) {
    return el('button', { type: 'button', class: 'choice' + (extra ? ' ' + extra : ''), onclick: fn },
      el('span', { class: 'c-label', text: c.label }), c.sub ? el('span', { class: 'c-sub', text: c.sub }) : null);
  }
  function renderSources() {
    const { story } = cur;
    return el('section', { class: 'sources' },
      el('h3', { class: 'sub', text: 'Sources' }),
      el('ul', {}, story.sources.map(x => el('li', { html: inline(x, null) }))),
      el('p', { class: 'source-note', text: story.sourceNote }));
  }

  /* ------------------------------------------------------------ witnesses */
  function renderWitnesses() {
    const { story, s } = cur;
    const grid = el('div', { class: 'blk witnesses' });
    const limit = story.witnessLimit ? story.witnessLimit(s) : null;
    if (limit) grid.append(el('p', { class: 'w-limit' }, el('span', { class: 'candle-dot', 'aria-hidden': 'true' }), `The candle allows ${Math.max(0, limit - s.heard.length)} more ${limit - s.heard.length === 1 ? 'witness' : 'witnesses'}.`));
    story.witnesses.forEach(w => {
      const heard = s.heard.includes(w.id);
      const closed = limit && !heard && s.heard.length >= limit;
      const night = !heard && story.enterWitness && story.enterWitness(s, w) !== w.scene;
      if (closed) {
        grid.append(el('div', { class: 'wcard closed', 'aria-disabled': 'true' },
          el('span', { class: 'w-rel', text: w.rel }), el('span', { class: 'w-name', text: w.name }),
          el('span', { class: 'w-status', text: 'The candle has burned down. Not heard.' })));
        return;
      }
      grid.append(el('button', { type: 'button', class: 'wcard' + (heard ? ' heard' : '') + (night ? ' night' : ''), onclick: () => callWitness(w) },
        el('span', { class: 'w-rel', text: w.rel }),
        el('span', { class: 'w-name', text: w.name }),
        el('span', { class: 'w-row' }, el('span', { class: 'w-k', text: 'Access' }), el('span', { text: w.access })),
        el('span', { class: 'w-row' }, el('span', { class: 'w-k', text: 'Stake' }), el('span', { text: w.stake })),
        el('span', { class: 'w-status', text: heard ? 'Heard' : (night ? 'You can arrive before it happens' : 'Not yet heard') })));
    });
    const mw = story.missingWitness;
    const txt = el('p', { class: 'w-missing-text', hidden: true, text: mw.text });
    const why = el('button', { type: 'button', class: 'btn quiet small', 'aria-expanded': 'false', onclick: () => { txt.hidden = !txt.hidden; why.setAttribute('aria-expanded', String(!txt.hidden)); why.textContent = txt.hidden ? 'Why is she not called?' : 'Close'; } }, 'Why is she not called?');
    grid.append(el('div', { class: 'wcard missing' },
      el('span', { class: 'w-rel', text: mw.rel }),
      el('span', { class: 'w-name', text: mw.name }), why, txt));
    return grid;
  }

  function callWitness(w) {
    const { story, s } = cur;
    const limit = story.witnessLimit ? story.witnessLimit(s) : null;
    if (limit && !s.heard.includes(w.id) && s.heard.length >= limit) { showToast('The candle has burned down. The court can hear no one else.'); return; }
    go(story.enterWitness ? story.enterWitness(s, w) : w.scene);
  }

  /* ------------------------------------------------------------ voice: tiles */
  function renderTiles() {
    const { story, s } = cur;
    const wrap = el('div', { class: 'blk tiles' });
    if (s.voice.mode === 'tiles') {
      wrap.append(statement(s.voice.tiles));
      return wrap;
    }
    const bank = story.tiles(s);
    const line = el('div', { class: 'compose', 'aria-live': 'polite' });
    const submit = el('button', { type: 'button', class: 'btn primary', onclick: () => {
      if (!composing.length) return;
      s.voice = { mode: 'tiles', tiles: composing.slice(), text: composing.map(t => t.w).join(' '), draft: '' };
      addRecord({ id: 'margin:voice', k: 'g', tier: 'margin', text: s.voice.text });
      composing = []; save(); refreshBeat();
    } }, 'Enter it into the record');
    const clear = el('button', { type: 'button', class: 'btn quiet', onclick: () => { composing = []; drawLine(); } }, 'Clear');
    function drawLine() {
      line.innerHTML = '';
      if (!composing.length) line.append(el('span', { class: 'compose-empty', text: 'Choose words below. Press a word here to take it back.' }));
      composing.forEach((t, k) => line.append(el('button', { type: 'button', class: 'tile placed', title: 'Said by ' + t.by, onclick: () => { composing.splice(k, 1); drawLine(); } }, t.w)));
      submit.disabled = !composing.length;
    }
    const bankEl = el('div', { class: 'bank' });
    bank.forEach(t => bankEl.append(el('button', { type: 'button', class: 'tile' + (t.by === 'anyone’s' ? ' common' : ''), title: 'Said by ' + t.by, onclick: () => { if (composing.length < 18) { composing.push(t); drawLine(); } } }, t.w)));
    drawLine();
    wrap.append(line, el('div', { class: 'tile-actions' }, clear, submit), el('p', { class: 'bank-label', text: 'The record’s words. Hover or long-press to see who said each one.' }), bankEl);
    return wrap;
  }
  function statement(tiles) {
    return el('div', { class: 'statement' }, tiles.map(t => el('span', { class: 'tw' }, el('span', { class: 'tw-w hand', text: t.w }), el('span', { class: 'tw-by', text: t.by }))));
  }

  /* ------------------------------------------------------------ voice: write */
  function renderWrite() {
    const { s } = cur;
    const wrap = el('div', { class: 'blk write' });
    if (s.voice.mode === 'write') {
      wrap.append(el('p', { class: 'cap' }, el('span', { class: 'cap-tier', 'data-tier': 'margin', text: 'Your hand' })), el('div', { class: 'margin-text hand', text: s.voice.text }));
      return wrap;
    }
    const ta = el('textarea', { id: 'her-words', class: 'hand-input', rows: '6', maxlength: '600', 'aria-label': 'Her words, in your hand', placeholder: 'Write in her voice…' });
    ta.value = s.voice.draft || '';
    const count = el('span', { class: 'count-note' });
    const submit = el('button', { type: 'button', class: 'btn primary' }, 'Enter it into the record');
    const sync = () => { const n = ta.value.trim().length; submit.disabled = n < 2; count.textContent = `${ta.value.length} / 600`; };
    ta.addEventListener('input', () => { s.voice.draft = ta.value; sync(); save(); });
    submit.addEventListener('click', () => {
      const text = ta.value.trim();
      if (text.length < 2) return;
      s.voice = { mode: 'write', text, tiles: [], draft: '' };
      addRecord({ id: 'margin:voice', k: 'g', tier: 'margin', text });
      save(); refreshBeat();
    });
    sync();
    wrap.append(ta, el('div', { class: 'tile-actions' }, count, submit));
    return wrap;
  }

  /* ------------------------------------------------------------ voice: silence */
  function renderSilence() {
    const { story, s } = cur;
    const wrap = el('div', { class: 'blk silence' });
    if (s.voice.mode === 'silence') {
      const list = renderActs();
      wrap.append(el('p', { class: 'cap' }, el('span', { class: 'cap-tier', 'data-tier': 'text', text: 'Everything the novel lets her do' })), list, el('div', { class: 'narr', html: rich(story.silenceClose, s, story, false) }));
      return wrap;
    }
    const page = el('div', { class: 'blank-page' }, el('p', { class: 'blank-text', text: story.silenceOpen }));
    const btn = el('button', { type: 'button', class: 'btn quiet', onclick: () => {
      btn.disabled = true; btn.textContent = '…';
      setTimeout(() => {
        s.voice = { mode: 'silence', text: '', tiles: [], draft: '' }; save();
        const nb = refreshBeat();
        const a = nb.querySelector('.acts');
        if (a && !reduceMotion) a.classList.add('enter');
      }, reduceMotion ? 0 : 1800);
    } }, 'Wait');
    wrap.append(page, el('div', { class: 'tile-actions' }, btn));
    return wrap;
  }

  /* ------------------------------------------------------------ burn */
  function renderBurn(b) {
    const { s } = cur;
    if (s.flags.includes('burned')) return el('div', { class: 'blk burned', 'aria-hidden': 'true' });
    const wrap = el('div', { class: 'blk burn', 'aria-label': 'The passages written about her are burning.' });
    const phrases = b.phrases.map(p => el('p', { class: 'bphrase' + (p.startsWith('Reader') ? ' last' : '') },
      [...p].map(ch => el('span', { class: 'bch', text: ch }))));
    const skip = el('button', { type: 'button', class: 'btn quiet small skip', onclick: finish }, 'Skip');
    wrap.append(...phrases, skip);
    let done = false, timers = [];
    function finish() {
      if (done) return; done = true;
      timers.forEach(clearTimeout);
      helpers.flag('burned'); save();
      refreshBeat();
    }
    if (reduceMotion) { setTimeout(finish, 0); return wrap; }
    phrases.forEach((p, k) => {
      const start = 900 + k * 650 + (p.classList.contains('last') ? 1400 : 0);
      [...p.children].forEach(ch => ch.style.setProperty('--d', Math.round(Math.random() * 700) + 'ms'));
      timers.push(setTimeout(() => p.classList.add('burning'), start));
    });
    timers.push(setTimeout(finish, 900 + phrases.length * 650 + 1400 + 2600));
    return wrap;
  }

  /* ------------------------------------------------------------ afterword */
  function renderAfterword() {
    const { story, s } = cur;
    const rows = story.afterword(s);
    const dl = el('dl', { class: 'after-dl' });
    rows.forEach(r => {
      const dd = el('dd', {});
      if (r.text) dd.append(el('p', { html: inline(r.text, s) }));
      if (r.voice) {
        if (s.voice.mode === 'tiles') dd.append(statement(s.voice.tiles));
        if (s.voice.mode === 'write') dd.append(el('div', { class: 'margin-text hand', text: s.voice.text }));
      }
      if (r.readings) {
        if (r.readings.length) dd.append(el('ul', { class: 'readings-list' }, r.readings.map(([a, v]) => el('li', {}, el('span', { text: a }), el('span', { class: 'hand', text: v })))));
      }
      if (r.note) dd.append(el('p', { class: 'after-note', html: inline(r.note, s) }));
      dl.append(el('dt', { text: r.label }), dd);
    });
    const ends = (store.endings[story.id] || []).map(e => story.endings[e]);
    return el('section', { class: 'blk afterword' },
      el('p', { class: 'kicker', text: 'Ending · ' + (story.endings[s.ending] || '') }),
      el('h2', { class: 'after-title', text: 'What you made of her' }),
      dl,
      el('p', { class: 'after-ends', text: `Endings you have reached: ${ends.join(' · ')}. There are ${Object.keys(story.endings).length}.` }));
  }

  /* ============================================================ RECORD */
  let drawerTab = 'testimony';
  let pairSel = { her: null, other: null };
  function renderCasebook(body) {
    const { story, s } = cur;
    const quotes = s.record.filter(r => r.k === 'q');
    const pinned = s.pinned.map(id => quotes.find(r => r.id === id)).filter(Boolean);
    body.append(el('p', { class: 'drawer-lede', text: 'Fragments you pinned. To make a reading of your own, choose one that describes her and one that shows who stands beside her, and hold them up to the glass. A fragment can go on both sides.' }));
    if (!pinned.length) { body.append(el('p', { class: 'empty', text: 'Nothing pinned yet. Use the Pin mark beside any quotation.' })); }
    pinned.forEach(r => {
      const isH = pairSel.her === r.id, isO = pairSel.other === r.id;
      body.append(el('div', { class: 'case-card' + (isH || isO ? ' sel' : '') },
        el('p', { class: 'cap' }, el('span', { text: r.cite }), el('span', { class: 'cap-who', text: r.who })),
        el('p', { class: 'case-text', text: trimText(r.text, 220) }),
        el('div', { class: 'case-row' },
          el('button', { type: 'button', class: 'btn small' + (isH ? ' primary' : ' quiet'), 'aria-pressed': String(isH), onclick: () => { pairSel.her = isH ? null : r.id; renderDrawer(); } }, 'Said of her'),
          el('button', { type: 'button', class: 'btn small' + (isO ? ' primary' : ' quiet'), 'aria-pressed': String(isO), onclick: () => { pairSel.other = isO ? null : r.id; renderDrawer(); } }, 'Beside her'),
          el('button', { type: 'button', class: 'btn small quiet', onclick: () => { s.pinned = s.pinned.filter(x => x !== r.id); if (pairSel.her === r.id) pairSel.her = null; if (pairSel.other === r.id) pairSel.other = null; save(); renderDrawer(); const y = window.scrollY; renderStory(); window.scrollTo(0, y); } }, 'Unpin'))));
    });
    const H = pairSel.her && quotes.find(r => r.id === pairSel.her), O = pairSel.other && quotes.find(r => r.id === pairSel.other);
    const note = el('textarea', { id: 'pair-note', class: 'hand-input small', rows: '2', maxlength: '240', placeholder: 'Optional: what does one make of the other?', 'aria-label': 'Your note on this pair' });
    const hold = el('button', { type: 'button', class: 'btn primary', disabled: !(H && O), onclick: () => {
      const hs = H.text.toLowerCase(), os = O.text.toLowerCase();
      const found = Object.keys(story.reflections).find(k => { const m = story.reflections[k].match; return m && hs.includes(m.her) && os.includes(m.other); });
      const reversed = !found && Object.keys(story.reflections).find(k => { const m = story.reflections[k].match; return m && os.includes(m.her) && hs.includes(m.other); });
      s.pairs.push({ her: H.id, other: O.id, note: note.value.trim(), ref: found || null });
      if (found) { const had = s.reflections.includes(found); addReflection(found); showToast(had ? 'The novel makes this comparison too. It is already in your glass.' : 'The novel makes this comparison too. A reflection appeared in the glass.'); }
      else if (reversed) showToast('Saved as your reading. Try it the other way round as well.');
      else showToast('Saved to your casebook as your own reading.');
      pairSel = { her: null, other: null }; save(); renderDrawer();
    } }, 'Hold them to the glass');
    body.append(el('div', { class: 'pair-builder' },
      el('p', { class: 'ex-label', text: 'The glass' }),
      el('div', { class: 'glass-panes' },
        el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Said of her' }), el('span', { class: 'pane-t', text: H ? trimText(H.text, 90) : 'Choose a fragment' })),
        el('div', { class: 'glass-line', 'aria-hidden': 'true' }),
        el('div', { class: 'pane other' }, el('span', { class: 'pane-k', text: 'Beside her' }), el('span', { class: 'pane-t', text: O ? trimText(O.text, 90) : 'Choose a fragment' }))),
      note, el('div', { class: 'tile-actions' }, hold)));
    if (s.pairs.length) {
      body.append(el('h3', { class: 'rec-who', text: 'Your pairs' }));
      s.pairs.slice().reverse().forEach(pr => {
        const a = quotes.find(r => r.id === pr.her), b = quotes.find(r => r.id === pr.other);
        if (!a || !b) return;
        body.append(el('div', { class: 'glass' + (pr.ref ? ' found' : '') },
          el('p', { class: 'glass-cap' }, el('span', { text: pr.ref ? 'Found in the novel' : 'Your reading' }), el('span', { text: a.cite === b.cite ? a.cite : a.cite + ' · ' + b.cite })),
          el('div', { class: 'glass-panes' },
            el('div', { class: 'pane her' }, el('span', { class: 'pane-k', text: 'Her' }), el('span', { class: 'pane-t', text: trimText(a.text, 110) })),
            el('div', { class: 'glass-line', 'aria-hidden': 'true' }),
            el('div', { class: 'pane other' }, el('span', { class: 'pane-k', text: 'Beside her' }), el('span', { class: 'pane-t', text: trimText(b.text, 110) }))),
          pr.note ? el('p', { class: 'hand pair-note', text: pr.note }) : null));
      });
    }
  }
  function toggleDrawer(open, tab) {
    if (tab) drawerTab = tab;
    if (open) { renderDrawer(); drawer.classList.add('open'); scrim.hidden = false; recBtn.setAttribute('aria-expanded', 'true'); drawer.focus({ preventScroll: true }); }
    else { drawer.classList.remove('open'); scrim.hidden = true; recBtn.setAttribute('aria-expanded', 'false'); recBtn.focus({ preventScroll: true }); }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) toggleDrawer(false); });

  function renderDrawer() {
    const { story, s } = cur;
    drawer.innerHTML = '';
    const tabs = [['testimony', 'Testimony'], ['notes', 'Notes'], ['glass', 'Glass'], ['words', 'Words'], ['margin', 'Margin'], ['key', 'Key']];
    const tabRow = el('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, label]) => el('button', { type: 'button', role: 'tab', class: 'tab', 'aria-selected': String(drawerTab === k), onclick: () => { drawerTab = k; renderDrawer(); } }, label)));
    const body = el('div', { class: 'drawer-body', role: 'tabpanel' });
    drawer.append(
      el('div', { class: 'drawer-head' }, el('h2', { text: 'The Record' }), el('button', { type: 'button', class: 'btn quiet small', onclick: () => toggleDrawer(false) }, 'Close')),
      tabRow, body);

    if (drawerTab === 'casebook') renderCasebook(body);
    if (drawerTab === 'testimony') {
      const qs = s.record.filter(r => r.k === 'q');
      body.append(el('p', { class: 'drawer-lede', text: 'Every passage from the novel you have read, grouped by who is speaking.' }));
      if (!qs.length) body.append(el('p', { class: 'empty', text: 'Nothing yet.' }));
      const groups = {};
      qs.forEach(r => { (groups[r.who || 'Unattributed'] = groups[r.who || 'Unattributed'] || []).push(r); });
      Object.keys(groups).forEach(who => {
        body.append(el('h3', { class: 'rec-who', text: who }));
        groups[who].forEach(r => body.append(el('figure', { class: 'rec-q' }, el('figcaption', { class: 'cap' }, el('span', { text: r.cite })), el('blockquote', { html: rich(r.text, s, story, false) }))));
      });
    }
    if (drawerTab === 'notes') {
      const gs = s.record.filter(r => r.k === 'g' && r.tier !== 'margin');
      body.append(el('p', { class: 'drawer-lede', text: 'Notes you opened and notes the story set down, marked by kind.' }));
      if (!gs.length) body.append(el('p', { class: 'empty', text: 'Nothing yet. Open a phrase with a dotted underline.' }));
      gs.forEach(r => body.append(el('aside', { class: 'gloss', 'data-tier': r.tier },
        el('p', { class: 'gloss-cap' }, el('span', { class: 'cap-tier', 'data-tier': r.tier, text: TIER[r.tier] }), r.by ? el('span', { text: r.by }) : null),
        el('div', { class: 'gloss-body', html: rich(r.text, s, story, false) }))));
    }
    if (drawerTab === 'glass') {
      body.append(el('p', { class: 'drawer-lede', text: 'Each time she is described, someone else is standing beside her. These are the pairs you have found: what is said of her, and what it lets someone else become.' }));
      if (!s.reflections.length) body.append(el('p', { class: 'empty', text: 'The glass is empty so far.' }));
      s.reflections.forEach(id => body.append(renderGlass(story.reflections[id])));
    }
    if (drawerTab === 'words') {
      body.append(el('p', { class: 'drawer-lede', text: 'Words used of her in the passages you have read. Strike one and it will be drawn struck through wherever it appears from now on. The novel will still say it.' }));
      const avail = story.lexicon.filter(l => l.in.some(sc => s.visited.includes(sc)));
      if (!avail.length) body.append(el('p', { class: 'empty', text: 'None yet.' }));
      avail.forEach(l => {
        const on = s.struck.includes(l.w);
        const row = el('div', { class: 'word-row' + (on ? ' on' : '') },
          el('span', { class: 'word', html: on ? `<s class="struck">${esc(l.w)}</s>` : esc(l.w) }),
          el('span', { class: 'word-by', text: l.by }),
          el('button', { type: 'button', class: 'btn quiet small', 'aria-pressed': String(on), onclick: () => {
            s.struck = on ? s.struck.filter(x => x !== l.w) : s.struck.concat(l.w);
            save(); const y = window.scrollY; renderStory(); window.scrollTo(0, y); renderDrawer();
          } }, on ? 'Restore' : 'Strike'));
        body.append(row);
        if (on && l.identity) body.append(el('p', { class: 'word-warn', text: `This word is not an insult. It names ${l.identity}. Striking it removes something true about her along with the way she was described.` }));
      });
    }
    if (drawerTab === 'margin') {
      const labels = story.readLabels;
      body.append(el('p', { class: 'drawer-lede', text: 'What you have written into the record so far, in your own hand.' }));
      const rows = [];
      if (s.role) rows.push(['You came as', ({ reader: 'a reader', judge: 'a judge', rescuer: 'a rescuer' })[s.role]]);
      Object.keys(s.readings).forEach(k => rows.push(['Reading · ' + k, (labels[s.readings[k]] || s.readings[k])]));
      if (s.finding) rows.push(['Finding', s.finding]);
      if (s.name) rows.push(['Her name', ({ bertha: 'Bertha', mrs: 'Mrs. Rochester', antoinetta: 'Antoinetta', none: 'no name' })[s.name]]);
      if (s.voice.mode === 'tiles' || s.voice.mode === 'write') rows.push(['Her testimony', s.voice.text]);
      if (s.voice.mode === 'silence') rows.push(['Her testimony', 'left blank']);
      if (!rows.length) body.append(el('p', { class: 'empty', text: 'Nothing yet.' }));
      body.append(el('dl', { class: 'margin-dl' }, rows.map(([a, b]) => [el('dt', { text: a }), el('dd', { class: 'hand', text: b })])));
    }
    if (drawerTab === 'key') {
      body.append(el('p', { class: 'drawer-lede', text: 'Every passage and note is marked by where it comes from, so you can tell the novel from what has been said about it, and both from what this game invents.' }));
      const key = [
        ['text', 'Quoted word for word from the novel, or from Brontë’s 1848 letter. Ellipses mark cuts.'],
        ['annotation', 'This game’s reading of the passage. An argument, not a fact; test it against the text.'],
        ['context', 'History outside the novel: law, medicine, empire.'],
        ['criticism', 'A named critic’s argument, paraphrased in a sentence or two.'],
        ['conjecture', 'Invented here. Not in the novel and not claimed to be.'],
        ['margin', 'Your own words and choices.']
      ];
      key.forEach(([t, d]) => body.append(el('div', { class: 'key-row' }, el('span', { class: 'cap-tier', 'data-tier': t, text: TIER[t] }), el('p', { text: d }))));
      body.append(el('p', { class: 'key-extra' }, 'Phrases with a ', el('span', { class: 'clue demo', text: 'dotted underline' }), ' open notes. ', el('span', { class: 'struck', text: 'Struck' }), ' words are ones you have objected to under “Words.” Pairs marked “In the glass” are collected under “Glass.”'));
    }
  }

  /* ============================================================ ROUTING */
  function navigate(hash) {
    const target = hash ? '#' + hash : '';
    if (location.hash === target || (target === '' && !location.hash)) route();
    else location.hash = target;
  }
  function route() {
    const h = location.hash.replace(/^#/, '');
    if (h === 'reading-room') showHub();
    else if (UH.stories[h]) openStory(h);
    else showLanding();
  }
  window.addEventListener('hashchange', route);
  UH._debug = { get state() { return cur && cur.s; }, go: id => go(id), store: () => store };
  route();
});
