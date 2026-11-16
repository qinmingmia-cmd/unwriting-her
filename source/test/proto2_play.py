"""Play prototype 2 for each role: rooms, the three tasks, and screenshots."""
import pathlib, sys
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).parent.parent / 'dist/proto2-standalone.html').resolve().as_uri()
SH = pathlib.Path(__file__).parent / 'shots2'; SH.mkdir(exist_ok=True)
errors = []

def run(role, w=1280, h=820, tag=None):
    tag = tag or role
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: errors.append(f'[{tag}] {e}'))
        pg.on('console', lambda m: (m.type in ('error', 'warning')) and 'fonts.g' not in m.text and 'ERR_' not in m.text and errors.append(f'[{tag}] {m.type}: {m.text}'))
        pg.goto(URL); pg.wait_for_timeout(600)
        shot = lambda n: pg.screenshot(path=str(SH / f'{tag}-{n}.png'))
        def card(): 
            pg.wait_for_timeout(150)
            while pg.locator('.titlecard').count(): pg.locator('.titlecard').first.click(); pg.wait_for_timeout(800)
        def caps(name=None):
            k = 0
            while pg.locator('.caption').count():
                if name and k == 1: shot(name)
                pg.locator('.caption .turn').click(); pg.wait_for_timeout(250); k += 1
        def act(a): pg.locator(f'[data-act="{a}"]').first.dispatch_event('click'); pg.wait_for_timeout(300)
        def stamp():
            pg.locator('.overlay .legend button').nth(1).click(); pg.wait_for_timeout(300)
            pg.locator('.overlay .sheet-close').click(); pg.wait_for_timeout(450)
        shot('roles')
        pg.locator('.role-pick .pick').nth(['reader', 'judge', 'rescuer'].index(role)).click(); card()
        shot('plan')
        # Jane's room
        pg.locator('.plan-room', has_text='Jane').click(); card(); caps()
        shot('jane')
        act('wardrobe'); act('drawer'); shot('jane-open'); act('cards'); caps('cards')
        if role == 'rescuer':
            act('veil'); pg.locator('.overlay .card').first.click(); pg.wait_for_timeout(400)
        act('candle'); caps('night')
        if role != 'rescuer':
            act('torn'); shot('veil-reading'); stamp()
            act('mirror'); pg.wait_for_timeout(300)
            for i in range(3):
                pg.locator('.panel .choices-row .pick:not([disabled])').first.click()
                if i == 0: shot('darkroom')
                t = pg.locator('.panel svg.task')
                for _ in range(14): t.press('ArrowLeft')
                pg.locator('.panel .hold').click(); pg.wait_for_timeout(400)
                if i == 0: shot('print')
                pg.locator('.overlay .sheet-close').click(); pg.wait_for_timeout(450)
            shot('darkroom-done')
            pg.locator('.panel .panel-x').click()
        if role == 'reader':
            pg.locator('.satchel .slot[title="Reading glass"]').click(); act('mirror'); shot('lens'); pg.locator('.overlay .sheet-close').click(); pg.wait_for_timeout(450)
            pg.locator('.satchel .slot[title="Reading glass"]').click()
        pg.locator('.satchel .slot[title="Luggage card"]').click(); pg.wait_for_timeout(300); pg.locator('.luggage').click(); pg.wait_for_timeout(900); shot('luggage')
        pg.locator('.luggage').click(); pg.wait_for_timeout(700); shot('luggage-front'); pg.locator('.overlay .sheet-close').click(); pg.wait_for_timeout(450)
        # corridor
        pg.locator('.back').click(); pg.wait_for_timeout(300)
        pg.locator('.plan-room', has_text='corridor').click(); card(); caps()
        shot('corridor')
        act('d4'); pg.locator('.panel .hold').first.focus(); pg.keyboard.press('Enter'); pg.wait_for_timeout(300); caps('laugh'); stamp()
        act('d2'); pg.locator('.panel .hold', has_text='Try').click(); pg.wait_for_timeout(200); shot('locked'); pg.locator('.panel .panel-x').click()
        act('d1'); pg.locator('.panel .hold', has_text='Go in').click(); card(); caps()
        # Grace's room
        shot('grace')
        act('grace'); caps(); act('pan'); caps('pan'); act('stub'); caps(); stamp()
        act('box'); act('box'); shot('box'); act('bottle'); caps()
        act('pocket'); pg.wait_for_timeout(300); shot('pocket')
        hold = pg.locator('.panel .hold'); box = hold.bounding_box(); x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        down = False
        for i in range(400):
            if not pg.locator('.panel .hold').count(): break
            st = pg.locator('.panel .status').text_content() or ''
            want = not ('twitch' in st or 'stirs' in st)
            if want and not down: pg.mouse.move(x, y); pg.mouse.down(); down = True
            if not want and down: pg.mouse.up(); down = False
            if i == 30: shot('pocket-reach')
            pg.wait_for_timeout(100)
        if down: pg.mouse.up()
        pg.wait_for_timeout(1000); caps()
        if 'keys' not in pg.evaluate('UH._p2.state.inv'): errors.append(f'[{tag}] no keys')
        # back to the corridor, the lock
        pg.locator('.back').click(); pg.wait_for_timeout(300); pg.locator('.plan-room', has_text='corridor').click(); card()
        act('d4'); pg.locator('.panel .hold', has_text='Try').click(); pg.wait_for_timeout(300)
        pg.locator('.panel .choices-row .pick').nth(3).click(); pg.wait_for_timeout(200)
        sv = pg.locator('.panel svg.task').bounding_box(); cx, cy = sv['x'] + sv['width'] / 2, sv['y'] + sv['height'] * 150 / 360
        shot('lock')
        import math
        pg.mouse.move(cx, cy - 80); pg.mouse.down()
        for a in range(0, 100, 5):
            r = math.radians(-90 + a); pg.mouse.move(cx + 80 * math.cos(r), cy + 80 * math.sin(r)); pg.wait_for_timeout(20)
        pg.mouse.up(); pg.wait_for_timeout(900); shot('inner')
        if pg.locator('.overlay .sheet-close').count(): pg.locator('.overlay .sheet-close').click(); pg.wait_for_timeout(450)
        pg.locator('.back').click(); pg.wait_for_timeout(300); shot('plan-end')
        st = pg.evaluate('JSON.stringify({inv: UH._p2.state.inv, ex: UH._p2.state.exhibits, er: UH._p2.state.erased, prints: UH._p2.state.prints, doors: UH._p2.state.doors, readings: UH._p2.state.readings, seen: UH._p2.state.seen})')
        print(tag, st)
        ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        if ow > 0: errors.append(f'[{tag}] horizontal overflow {ow}')
        b.close()

roles = sys.argv[1:] or ['reader', 'judge', 'rescuer']
for r in roles:
    if r == 'rescuer-phone': run('rescuer', 390, 844, 'rescuer-phone')
    elif r == 'reader-phone': run('reader', 390, 844, 'reader-phone')
    else: run(r)
print('\n'.join(errors) if errors else 'no errors')
