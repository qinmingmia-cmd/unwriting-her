"""Bundle the prototype: shared story data and room art, plus the prototype's own page and script."""
import pathlib
root = pathlib.Path(__file__).parent.parent
prelude = "window.UH = { stories: {}, registerStory(s) { this.story = s; this.stories[s.id] = s; }, registerShelf() {} };"
parts = [('prelude', prelude), ('bertha.js', (root / 'src/stories/bertha.js').read_text()), ("proto2.js", (root / 'proto2/proto2.js').read_text())]
scripts = '\n'.join(f'<script>\n/* ---- {n} ---- */\n{c}\n</script>' for n, c in parts)
page = (root / 'proto2/page.html').read_text().replace('<!--SCRIPTS-->', scripts)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/proto2.html').write_text(page)
head, rest = page.split('<style>', 1)
style, body = rest.split('</style>', 1)
(root / 'dist/proto2-standalone.html').write_text('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head + '<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\n[hidden]{display:none!important}\n' + style + '</style>\n</head>\n<body>\n' + body + '</body>\n</html>\n')
print('built', len(page))
