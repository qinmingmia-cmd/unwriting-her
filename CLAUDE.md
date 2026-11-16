# Unwriting Her

An interactive literary game, in the browser, about women whom literature writes as "mad". Bertha Mason (*Jane Eyre*) is the first playable chapter. It is live at **unwritingher.com**.

The author is an English literature student. The game is a creative-critical project: feminist, postcolonial and epistemic-injustice readings (Fricker), with a clear line between textual evidence and invention.

## The thesis (the author's own)
After Toni Morrison's *Playing in the Dark*: the madwoman serves as a mirror of "insanity". Through her, the other characters' sanity and validity become legible. The game hints at this throughout and states it at the end.

## Rules that must not be broken
- **The final Morrison/thesis essay at the end of Bertha's chapter stays exactly as written.** Do not edit a word. It is in `source/src/stories/bertha.js` (the closing thesis scene).
- **Nothing goes live without the author's consent.** Netlify deploys the `main` branch, and the live site is `index.html` on `main`. Always build a preview first, show it, and wait for an explicit yes before changing `main`.
- **Keep the original amount of annotations.** Do not add notes to every object to make things feel interactive. "Interactive" means immersive actions, not more notes.
- **Critics, not opinions.** Analyses should cite verified critics (e.g. Gilbert & Gubar 1979; Spivak 1985; Rhys's letters; Thomas 1999; Meyer 1990; Fricker 2007), in a moderate, toned-down voice. Do not invent quotations; verify them.
- **Never force an interpretation** that isn't really in the text.
- **Keep the multiple-choice readings** with critics' analyses popping up after each choice. The author loves these.
- **Keep the colour-coded key:** your hand, conjecture, criticism, struck words, verbatim/annotation/context tiers.

## Look and feel
- Dark and gold, candlelit, with textures. The fonts are IM Fell English, Old Standard TT, Spectral and Courier Prime. Subtle colour in the imagery is fine.
- Professional, not childish. No handwriting font in the UI. A script hand (Pinyon Script) is used only for objects that are genuinely handwritten, such as letters, notes and cards.
- Women are drawn as sketched silhouettes with no face. No public-domain portraits or photos.
- **Art direction going forward:** the prototypes' drawings were kept deliberately simple while the interactions were being tested. Future scenes should be far more detailed: layered shading, paper, ink and plaster textures, light falloff, period-accurate furniture and fabric, more objects per room, and consistent perspective. The author will send reference photos; use them for mood, period detail and composition, but don't trace or copy someone else's artwork.
- Previous rejections: a colourful "kindergarten" bookshelf, Reenie Beanie, and the style of a reference video.

## Layout of this branch (`drafts`)
- `index.html`: the live build, the same as `main`.
- `source/`: the full source. **Build from `source/src/live/index.html`**, the exact page live on unwritingher.com; `build.py` adds only the chapter hooks and the Moon Orchid chapter. `source/src/unapproved-v4/` holds Bertha revisions the author never approved; never ship them.
  - `src/engine.js` is the game engine. `src/art.js` is the SVG scene art. `src/page.html` is the page shell.
  - `src/stories/bertha.js` holds all of Bertha's content: clues, reflections, witnesses, scenes, readings, endings and the essay. `src/stories/shelf.js` is the bookshelf catalogue.
  - `build.py` builds `dist/unwriting-her.html` (artifact preview) and `dist/standalone/index.html` (the site file).
  - `proto/` is prototype 1 (hearing table, stamps). `proto2/` is prototype 2 (explorable Thornfield rooms). Both are **shelved drafts, not live**.
  - `test/graph.js` (`node test/graph.js`) runs random playthroughs and checks that all endings are reachable and no clues are missing. `test/roles.py`, `test/proto_play.py` and `test/proto2_play.py` are Playwright (Python) playthroughs.
- `drafts/`: bundled, playable copies of both prototypes.

## Going live, after consent only
1. `cd source && python3 build.py && node test/graph.js && python3 test/roles.py`
2. Copy `source/dist/standalone/index.html` to `index.html` at the root of `main`, then commit and push to `main`. Netlify deploys automatically.

## Roadmap
- **Next: the Moon Orchid chapter** (*The Woman Warrior*, Maxine Hong Kingston, 1976, "At the Western Palace"). Nothing has been built yet. The author wants to discuss it before any code.
- **Important:** *The Woman Warrior* is in copyright. Unlike Bertha's chapter, Moon Orchid's cannot carry long verbatim passages. Its format (paraphrase with page references, retelling as the mechanic, and so on) must be decided with the author first.
- Other sealed volumes on the shelf: "The Yellow Wall-Paper", Ophelia, Lady Audley, Xianglin's Wife (祥林嫂).
- Possibly later: convert the whole game to the explorable-rooms style of `proto2`, if the author returns to that idea.
