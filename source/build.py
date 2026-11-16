"""Build the site from the version that is live on unwritingher.com (src/live/index.html), unchanged,
plus the Moon Orchid chapter. Bertha's chapter, the shelf and the engine are the live code; the only
changes to them are the small hooks a chapter with its own engine needs (listed below).

   dist/standalone/index.html   the full site, for review before anything goes live
   dist/mo-preview.html         the same page, opening straight onto the Moon Orchid chapter"""
import pathlib, re
root = pathlib.Path(__file__).parent
src = root / 'src'
page = (src / 'live/index.html').read_text()

def patch_block(page, name, fn):
    pat = re.compile(r'(/\* ---- ' + re.escape(name) + r' ---- \*/\n)(.*?)(\n</script>)', re.S)
    m = pat.search(page); assert m, name
    return page[:m.start(2)] + fn(m.group(2)) + page[m.end(2):]

def sub(text, old, new):
    assert old in text, old[:60]
    return text.replace(old, new, 1)

def engine(t):
    # 1. a story may bring its own engine: hand it the page
    t = sub(t, """    if (!story) return showHub();
    view = 'story';""", """    if (!story) return showHub();
    if (story.mount) {            // a chapter with its own engine (chapters/)
      view = 'chapter'; cur = null; stopMotes();
      app.innerHTML = '';
      story.mount(app, { navigate });
      window.scrollTo(0, 0);
      return;
    }
    view = 'story';""")
    # 2. the shelf asks such a chapter for its own progress, and resets it itself
    t = sub(t, "const started = run && (run.scene !== story.start || run.beat > 0);", "const started = story.mount ? story.started() : run && (run.scene !== story.start || run.beat > 0);")
    t = sub(t, "const ends = (store.endings[story.id] || []).map(e => story.endings[e]).filter(Boolean);", "const ends = story.mount ? story.endingsReached() : (store.endings[story.id] || []).map(e => story.endings[e]).filter(Boolean);")
    t = sub(t, "onclick: () => { store.runs[story.id] = fresh(story); persist(); navigate(story.id); } }, 'Begin again'));", "onclick: () => { if (story.mount) story.reset(); else { store.runs[story.id] = fresh(story); persist(); } navigate(story.id); } }, 'Begin again'));")
    # 3. the shelf's sentence about lit candles counts them
    t = sub(t, "One volume has a candle lit beside it; the others are sealed until their stories are written.", "' + (UH.shelf.filter(e => e.story && UH.stories[e.story]).length > 1 ? 'The volumes with a candle lit beside them can be opened' : 'One volume has a candle lit beside it') + '; the others are sealed until their stories are written.")
    return t

page = patch_block(page, 'engine.js', engine)
page = patch_block(page, 'stories/shelf.js', lambda t: sub(t, "    id: 'moon-orchid',\n", "    id: 'moon-orchid',\n    story: 'moon-orchid',\n"))
chap = ['chapters/moon-orchid/content.js', 'chapters/moon-orchid/art.js', 'chapters/moon-orchid/chapter.js']
extra = '\n'.join(f'<script>\n/* ---- {n} ---- */\n{(src / n).read_text()}\n</script>' for n in chap)
m = re.search(r'/\* ---- stories/bertha.js ---- \*/.*?</script>', page, re.S)
page = page[:m.end()] + '\n' + extra + page[m.end():]
page = sub(page, '</style>', (src / 'chapters/moon-orchid/style.css').read_text() + '\n</style>')
page = sub(page, 'family=Spectral:ital,wght@0,300;0,400;1,300;1,400&display=swap', 'family=Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Work+Sans:wght@400;500;600&display=swap')
out = root / 'dist'; (out / 'standalone').mkdir(parents=True, exist_ok=True)
(out / 'standalone/index.html').write_text(page)
(out / 'mo-preview.html').write_text(sub(page, '<script>', '<script>if (!location.hash) history.replaceState(null, "", "#moon-orchid");</script>\n<script>'))
print('built', len(page), 'bytes from the live site')
