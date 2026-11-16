// Static checks on the story graph, plus random playthroughs (all three roles) to confirm every ending is reachable.
global.UH = { registerStory: s => (global.STORY = s), registerShelf: () => {} };
require('../src/stories/bertha.js');
const S = global.STORY, problems = [];
const CLUE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
const used = new Set();
function fresh() { return { scene: S.start, beat: 0, visited: [S.start], heard: [], opened: [], expanded: [], examined: [], readings: {}, role: null, finding: null, name: null, voice: { mode: null, text: '', tiles: [], draft: '' }, struck: [], record: [], reflections: [], flags: [], ending: null, pinned: [], pairs: [], cited: [], explored: {}, crossx: {}, checks: {}, erased: [], closeOpen: [], glassTried: {}, marginNote: '' }; }
const H = s => ({ hear: id => { if (!s.heard.includes(id)) s.heard.push(id); }, flag: f => { if (!s.flags.includes(f)) s.flags.push(f); }, erase: k => { if (!s.erased.includes(k)) s.erased.push(k); } });
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---- static: every clue exists and is used, every target exists
const scanText = (t, where) => { let m; CLUE.lastIndex = 0; while ((m = CLUE.exec(t))) { used.add(m[2]); if (!S.clues[m[2]]) problems.push(`missing clue ${m[2]} in ${where}`); } };
const scanBlocks = (blocks, where, probe) => blocks.forEach(blk => { const x = typeof blk === 'function' ? blk(probe) : blk; if (x && typeof x.text === 'string') scanText(x.text, where); if (x && x.t === 'reflect' && !S.reflections[x.id]) problems.push('missing reflection ' + x.id); });
for (const role of ['reader', 'judge', 'rescuer']) {
  for (const [id, sc] of Object.entries(S.scenes)) {
    const probe = fresh(); probe.role = role; probe.name = 'mrs'; probe.voice.mode = 'tiles'; probe.finding = 'mad';
    sc.beats.forEach((b, i) => {
      scanBlocks(b.blocks, `${id}.${i}`, probe);
      (b.examine || []).forEach(e => scanBlocks(e.blocks, `${id}.ex.${e.id}`, probe));
      if (Array.isArray(b.choices)) b.choices.forEach(c => { if (c.to && !S.scenes[c.to]) problems.push(`bad target ${c.to} from ${id}`); });
    });
    (sc.explore || []).forEach(e => scanBlocks(e.blocks, `${id}.room.${e.id}`, probe));
  }
}
S.witnesses.forEach(w => { if (!S.scenes[w.scene]) problems.push('bad witness scene ' + w.scene); if (w.rescue && !S.scenes[w.rescue]) problems.push('bad rescue ' + w.rescue); if (!S.crossx[w.id]) problems.push('no cross-exam for ' + w.id); });
Object.entries(S.clues).forEach(([k, c]) => { if (!used.has(k)) problems.push('unused clue ' + k); if (c.reflect && !S.reflections[c.reflect]) problems.push('bad reflect ' + c.reflect); });
Object.keys(S.endings).forEach(e => { if (!Object.values(S.scenes).some(sc => sc.ending === e)) problems.push('ending without scene ' + e); });

// ---- random walks
const endings = {}, byRole = { reader: {}, judge: {}, rescuer: {} };
const go = (s, id) => { s.scene = id; s.beat = 0; if (!s.visited.includes(id)) s.visited.push(id); const sc = S.scenes[id]; if (sc.onEnter) sc.onEnter(s, H(s)); };
for (let run = 0; run < 9000; run++) {
  const s = fresh(); let steps = 0;
  while (steps++ < 600) {
    const sc = S.scenes[s.scene]; const b = sc.beats[s.beat];
    if (sc.ending) { endings[sc.ending] = (endings[sc.ending] || 0) + 1; if (s.role) byRole[s.role][sc.ending] = (byRole[s.role][sc.ending] || 0) + 1; break; }
    // passing through a page passes its gates (this is one way the keys are found)
    b.blocks.forEach(raw => { const x = typeof raw === 'function' ? raw(s) : raw; if (x && x.t === 'gate' && x.flag) H(s).flag(x.flag); });
    if (b.reading && !s.readings[b.reading.id]) { s.readings[b.reading.id] = pick(b.reading.options).k; continue; }
    if (b.examine) { const left = b.examine.filter(x => !s.examined.includes(x.id)); if (left.length && (s.examined.length < 2 || Math.random() < 0.4)) { const x = pick(left); s.examined.push(x.id); if (x.flag) H(s).flag(x.flag); continue; } }
    if (s.scene === 'v_tiles' || s.scene === 'v_write' || s.scene === 'v_silence') { s.voice.mode = { v_tiles: 'tiles', v_write: 'write', v_silence: 'silence' }[s.scene]; if (s.voice.mode === 'tiles') S.tiles(s); }
    if (s.scene === 'e_margin' && !s.flags.includes('margin-written')) { s.marginNote = 'note'; H(s).flag('margin-written'); }
    if (s.scene === 'e_unwritten') H(s).flag('burned');
    if (s.scene === 'finding' && s.role === 'judge' && s.cited.length < 2) { s.cited = ['a', 'b']; }
    if (s.scene === 'hearing') {
      const limit = S.witnessLimit(s);
      const unheard = S.witnesses.filter(w => !s.heard.includes(w.id));
      const room = !limit || s.heard.length < limit;
      if (room && unheard.length && (s.heard.length < 2 || Math.random() < 0.6)) { go(s, S.enterWitness(s, pick(unheard))); continue; }
    }
    if (b.wait && !s.flags.includes(b.wait)) { problems.push(`waiting forever at ${s.scene}.${s.beat}`); break; }
    const choices = Array.isArray(b.choices) ? b.choices.filter(c => (!c.when || c.when(s)) && !(c.locked && c.locked(s))) : null;
    if (!choices && s.beat < sc.beats.length - 1) { s.beat++; continue; }
    if (!choices || !choices.length) { problems.push(`stuck at ${s.scene}.${s.beat} (${s.role})`); break; }
    const c = pick(choices.filter(c => !(s.scene === 'threshold' && c.label === 'Choose again')).length ? choices.filter(c => !(s.scene === 'threshold' && c.label === 'Choose again')) : choices);
    if (c.set) c.set(s, H(s));
    if (c.next) { s.beat++; continue; }
    if (c.to) go(s, c.to);
  }
  if (s.ending) { S.afterword(s); S.youGlass(s); }
}
console.log('endings reached:', endings);
console.log('by role:', JSON.stringify(byRole));
console.log(problems.length ? [...new Set(problems)].join('\n') : 'no problems');
