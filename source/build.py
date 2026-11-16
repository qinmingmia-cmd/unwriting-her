"""Bundle src/ into one self-contained page.
   dist/unwriting-her.html  - page body for the claude.ai artifact (no doctype; the host adds one)
   dist/standalone/index.html - the same page with a full HTML skeleton, for hosting anywhere."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
order = ['engine.js', 'art.js', 'stories/shelf.js', 'stories/bertha.js']   # add new story files here
scripts = '\n'.join(f'<script>\n/* ---- {name} ---- */\n{(src / name).read_text()}\n</script>' for name in order)
page = (src / 'page.html').read_text().replace('<!--SCRIPTS-->', scripts)
out = root / 'dist'; (out / 'standalone').mkdir(parents=True, exist_ok=True)
(out / 'unwriting-her.html').write_text(page)
head, rest = page.split('<style>', 1)
style, body = rest.split('</style>', 1)
(out / 'standalone' / 'index.html').write_text(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head + '<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\nbody{margin:0}\n[hidden]{display:none!important}\n' + style + '</style>\n</head>\n<body>\n' + body + '</body>\n</html>\n')
print('built', len(page), 'bytes')
