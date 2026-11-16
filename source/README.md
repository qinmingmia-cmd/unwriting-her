# Unwriting Her

An interactive literary investigation into women written as mad. The first volume, *The Third Storey*, follows Bertha Antoinetta Mason through *Jane Eyre* (1847) and ends with an essay, "Playing in the Attic," that argues the game's thesis after Toni Morrison's *Playing in the Dark*.

## Run it

Open `dist/standalone/index.html` in any browser. No server, account or install. Progress is saved in the browser (localStorage).

To host it, upload `dist/standalone/index.html` anywhere (GitHub Pages, Netlify, a school site). It is a single file.

## How it is built

```
src/
  page.html            styles and page shell
  engine.js            the game engine and interface; knows nothing about any novel
  stories/shelf.js     the Reading Room catalogue (open and sealed volumes)
  stories/bertha.js    the Bertha Mason storyline: all text, notes, choices, endings, the essay
build.py               bundles src/ into dist/
test/graph.js          checks every link and note, and simulates 4,000 playthroughs
test/play.py           plays three full paths in a headless browser and takes screenshots
```

Rebuild after any edit: `python3 build.py`.

## Adding a volume

1. Copy `src/stories/bertha.js` to a new file and change `id`, `start`, and the content.
2. In `src/stories/shelf.js`, add `story: '<your id>'` to that volume's entry.
3. Add the file to the `order` list in `build.py`, then run `python3 build.py`.

A story is plain data:

- `scenes` — each has `title`, `place`, `cite`, optional `staged` (a visible note that the scene is invented), and `beats`.
- a beat has `blocks` (passages), and optionally `reading` (a question with four readings), `examine` (objects to look at), and `choices` (`label`, `sub`, `to`, `set`, `when`, `locked`).
- block types: `q` (verbatim quotation with speaker and chapter), `p` (narration), `note` (an annotation with a tier), `reflect` (a pair for the glass), `h` (subheading), plus the special interactive blocks used in the voice and ending scenes.
- `clues` — notes opened from `[[underlined phrases|clueId]]` in any text. Each has a `tier`: `text`, `annotation`, `context`, `criticism`, `conjecture`, or `margin`.
- `reflections` — the mirror pairs (what is said of her, and what it lets someone else become) gathered into the Record and the closing essay.

## Sources and accuracy

Quotations from *Jane Eyre* and from Brontë's letter to W. S. Williams (4 January 1848) were checked word for word against online editions of the text; ellipses mark omissions. Critical positions (Woolf, Gilbert and Gubar, Spivak, Meyer, Fricker, Foucault, Showalter, Morrison, Valint) are paraphrased and attributed, with one short quotation from Morrison. Every passage in the game is labelled by where it comes from, and invented scenes say so on screen.
