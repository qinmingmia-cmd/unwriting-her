import pathlib, re, sys
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).parent.parent / 'dist/proto-standalone.html').resolve().as_uri()
S = pathlib.Path('/tmp/claude-0/-home-claude/63dfcc76-cd15-54d7-983b-9dfd906a1cd1/scratchpad/proto'); S.mkdir(exist_ok=True)
errs = []
def run(role, w, h, tag, mode):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: errs.append(f'[{tag}] {e}'))
        pg.on('console', lambda m: m.type == 'error' and 'ERR_TUNNEL' not in m.text and errs.append(f'[{tag}] {m.text}'))
        pg.goto(URL); pg.wait_for_timeout(800)
        sh = lambda n: pg.screenshot(path=str(S / f'{tag}-{n}.png'))
        sh('01-threshold')
        pg.locator('.tool').nth({'reader': 0, 'judge': 1, 'rescuer': 2}[role]).click(); pg.wait_for_timeout(900); sh('02-role')
        pg.get_by_role('button', name='go down to the hall →').click(); pg.wait_for_timeout(2600); pg.wait_for_timeout(800); sh('03-summons')
        pg.get_by_role('button', name='set it down →').click(); pg.wait_for_timeout(700); sh('04-table')
        order = {'judge': ['mason', 'rochester', 'register', 'jane', 'grace'], 'reader': ['jane', 'register'], 'rescuer': ['mason', 'grace']}[role]
        for k, wid in enumerate(order):
            pg.locator(f'.env[data-w="{wid}"]').click(); pg.wait_for_timeout(1300)
            if role == 'judge' and k == 4:
                sh('05-candle-out'); break
            if pg.locator('.overlay .card').count() and role == 'rescuer':
                pg.locator('.overlay .card').first.click(); pg.wait_for_timeout(900); sh(f'06-{wid}-rescued')
                pg.get_by_role('button', name='fold it away →').click(); pg.wait_for_timeout(600); continue
            for step in range(12):
                if pg.locator('.overlay .clue:not(.on)').count() and step < 2:
                    pg.locator('.overlay .clue:not(.on)').first.click(); pg.wait_for_timeout(300)
                if pg.locator('.rail .stamp').count() and pg.locator('.rail-label', has_text='stamp').count():
                    st = pg.locator('.rail .stamp').nth(1); sb = st.bounding_box(); shb = pg.locator('.sheet').bounding_box()
                    pg.mouse.move(sb['x'] + 30, sb['y'] + 20); pg.mouse.down(); pg.mouse.move(shb['x'] + shb['width'] * 0.6, shb['y'] + 200, steps=8); pg.mouse.up()
                    pg.wait_for_timeout(500); sh(f'07-{wid}-stamped')
                if pg.locator('.overlay .mini').count(): pg.locator('.overlay .mini').first.click(); pg.wait_for_timeout(300)
                if pg.locator('.overlay .card').count() and role == 'judge': pg.locator('.overlay .card').first.click(); pg.wait_for_timeout(300); sh(f'08-{wid}-cross')
                if role == 'reader' and step == 0 and pg.locator('.pencil-tool').count():
                    pg.locator('.pencil-tool').click(); bb = pg.locator('.sheet').bounding_box()
                    pg.mouse.move(bb['x'] + 80, bb['y'] + 260); pg.mouse.down()
                    for a in range(0, 30): pg.mouse.move(bb['x'] + 80 + a * 8, bb['y'] + 262 + (a % 5))
                    pg.mouse.up(); pg.locator('.pencil-tool').click(); pg.wait_for_timeout(200); sh(f'09-{wid}-pencil')
                fold = pg.get_by_role('button', name='fold it away →')
                if fold.count() and fold.is_enabled(): 
                    if step == 0: sh(f'10-{wid}-letter')
                    fold.click(); pg.wait_for_timeout(700); break
                t = pg.get_by_role('button', name='turn the page →')
                if t.count() and t.is_enabled(): t.click(); pg.wait_for_timeout(700)
        if pg.locator('.overlay').count(): pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
        sh('11-table-after')
        pg.locator('.ledger').click(); pg.wait_for_timeout(900)
        for _ in range(2):
            if pg.locator('.cite:not(.on)').count(): pg.locator('.cite:not(.on)').first.dispatch_event('click'); pg.wait_for_timeout(150)
        sh('12-ledger')
        pg.locator('.rail .stamp').nth(3 if role != 'rescuer' else 1).click(); pg.wait_for_timeout(700)
        pg.get_by_role('button', name='climb the stairs →').click(); pg.wait_for_timeout(800)
        pg.get_by_role('button', name='go in →').click(); pg.wait_for_timeout(2800)
        sh('13-room')
        R = pg.locator('.room').bounding_box()
        pg.mouse.move(R['x'] + R['width'] * 0.5, R['y'] + R['height'] * 0.75); pg.wait_for_timeout(300); sh('14-room-light')
        for zx, zy, n in [(0.62, 0.66, 'her'), (0.2, 0.72, 'fire'), (0.42, 0.5, 'window')]:
            pg.mouse.move(R['x'] + R['width'] * zx, R['y'] + R['height'] * zy); pg.wait_for_timeout(1300)
            if n == 'her': sh('15-her')
            if pg.locator('.found .sheet-close').count(): pg.locator('.found .sheet-close').dispatch_event('click'); pg.wait_for_timeout(200)
        sh('16-room-found')
        if mode == 'mad': sh('17-mad'); b.close(); return
        pg.locator('.blank-sheet').click(); pg.wait_for_timeout(700)
        pg.locator('.overlay .card:not(.locked)').first.click(); pg.wait_for_timeout(800); sh('18-voice')
        pg.locator('.tools3 .card').nth({'collage': 0, 'write': 1, 'blank': 2}[mode]).click(); pg.wait_for_timeout(800)
        if mode == 'collage':
            for wd in ['I', 'am', 'not', 'your', 'charge', 'drain my heart']:
                loc = pg.locator('.scraps .cut').filter(has_text=re.compile('^' + wd + '$'))
                if loc.count(): loc.first.click(); pg.wait_for_timeout(120)
            sh('19-collage')
            pg.get_by_role('button', name='Paste it down').click(); pg.wait_for_timeout(700)
        elif mode == 'write':
            pg.fill('#her-words', 'Ask me. Not him, not Grace. Me.'); pg.get_by_role('button', name='Sign it into the record').click(); pg.wait_for_timeout(600)
        else:
            pg.get_by_role('button', name='Wait').click(); pg.wait_for_timeout(2400)
        sh('20-entered')
        pg.get_by_role('button', name='end of the prototype →').click(); pg.wait_for_timeout(700); sh('21-end')
        ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        if ow > 0: errs.append(f'[{tag}] overflow {ow}')
        b.close()
run('judge', 1280, 820, 'judge', 'collage')
run('reader', 1280, 820, 'reader', 'write')
run('rescuer', 390, 844, 'rescuer-phone', 'blank')
print('\n'.join(errs) if errs else 'no errors')
