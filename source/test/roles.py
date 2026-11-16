"""Play one full path per role in Chromium, exercising the new mechanics, and screenshot key moments."""
import pathlib, re, sys
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).parent.parent / 'dist/standalone/index.html').resolve().as_uri()
SHOTS = pathlib.Path(__file__).parent / 'shots'; SHOTS.mkdir(exist_ok=True)
errors = []

def run(role, plan, w=1280, h=860, tag=None, shots=()):
    tag = tag or role
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: errors.append(f'[{tag}] {e}'))
        pg.on('console', lambda m: m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'fonts.g' not in m.text and errors.append(f'[{tag}] {m.text}'))
        pg.goto(URL + '#bertha'); pg.wait_for_timeout(700)
        def settle():
            pg.wait_for_timeout(200)
            if pg.locator('.titlecard').count(): pg.wait_for_timeout(2400)
        def shot(name, full=True): pg.screenshot(path=str(SHOTS / f'{tag}-{name}.png'), full_page=full)
        steps = 0; plan = list(plan)
        while steps < 400:
            steps += 1
            scene = pg.evaluate('UH._debug.state.scene')
            if scene in shots and not (SHOTS / f'{tag}-{scene}.png').exists(): shot(scene)
            if pg.locator('.afterword').count():
                shot('afterword'); break
            # the page unfolds
            if pg.locator('.page .gate-btn').count():
                g = pg.locator('.page .gate-btn').first.get_attribute('data-gate')
                art = pg.locator(f'.art .hot.beckon[data-ex="{g}"]')
                if art.count() and steps % 2 == 0: art.first.dispatch_event('click')
                else: pg.locator('.page .gate-btn').first.click()
                pg.wait_for_timeout(120); continue
            if pg.locator('.page .reveal-next').count():
                if steps % 3 == 0: pg.locator('.page .blk.narr').last.click() if pg.locator('.page .blk.narr').count() else pg.locator('.page .reveal-next').click()
                else: pg.locator('.page .reveal-next').click()
                pg.wait_for_timeout(100); continue
            # puzzles and tools on the page
            if pg.locator('.page .glass-opt:not([disabled])').count():
                pg.locator('.page .glass-opt:not([disabled])').first.click(); pg.wait_for_timeout(150); continue
            if pg.locator('.page .check .check-row button').count():
                pg.locator('.page .check .check-row button').first.click(); pg.wait_for_timeout(150); continue
            if pg.locator('.page .crossx .reading-opt').count():
                pg.locator('.page .crossx .reading-opt').first.click(); pg.wait_for_timeout(150); continue
            if pg.locator('.page .reading-grid .reading-opt').count():
                pg.locator('.page .reading-grid .reading-opt').nth(1).click(); pg.wait_for_timeout(150); continue
            if pg.locator('.page .silence .btn', has_text='Wait').count():
                pg.locator('.page .silence .btn', has_text='Wait').click(); pg.wait_for_timeout(2300); continue
            if pg.locator('.page .burn .skip').count():
                pg.locator('.page .burn .skip').click(); pg.wait_for_timeout(300); continue
            if pg.locator('#margin-note').count() and not pg.evaluate("UH._debug.state.flags.includes('margin-written')"):
                pg.fill('#margin-note', 'Not Grace. Ask who is behind the door.'); pg.get_by_role('button', name='Write it in the margin').click(); pg.wait_for_timeout(200); continue
            if pg.locator('.page .tiles .bank').count():
                for wd in ['I', 'am', 'not', 'your', 'charge']:
                    loc = pg.locator('.page .bank .tile').filter(has_text=re.compile('^' + wd + '$'))
                    if loc.count(): loc.first.click(); pg.wait_for_timeout(60)
                pg.get_by_role('button', name='Enter it into the record').click(); pg.wait_for_timeout(200); continue
            if pg.locator('.page .cite').count() and role == 'judge' and pg.evaluate('UH._debug.state.cited.length') < 2:
                while pg.evaluate('UH._debug.state.cited.length') < 2:
                    vis = pg.locator('.page .cite-card:visible:not(.on)')
                    if not vis.count():
                        pg.locator('.page .cite-more summary').click(); pg.wait_for_timeout(150); continue
                    vis.first.click(); pg.wait_for_timeout(150)
                shot('finding'); continue
            # plan: explore items, art hotspots, examine, witnesses, choices, pins, close reading
            if plan:
                kind, val = plan[0]
                done = False
                if kind == 'hot' and pg.locator(f'.art [data-ex="{val}"]').count():
                    pg.locator(f'.art [data-ex="{val}"]').first.click(force=True); done = True
                elif kind == 'look' and pg.locator('.explore .ex-btn', has_text=val).count():
                    pg.locator('.explore .ex-btn', has_text=val).first.click(); done = True
                elif kind == 'examine' and pg.locator('.page .ex-btn', has_text=val).count():
                    pg.locator('.page .ex-btn', has_text=val).first.click(); done = True
                elif kind == 'witness' and pg.locator('.wcard', has_text=val).count():
                    pg.locator('.wcard', has_text=val).first.click(); settle(); done = True
                elif kind == 'choose' and pg.locator('.page .choice:not(.locked)', has_text=val).count():
                    pg.locator('.page .choice:not(.locked)', has_text=val).first.click(); settle(); done = True
                elif kind == 'pin_disabled' and False:
                    pg.locator('.page .pin-btn:not(.on)').first.click(); done = True
                elif kind == 'close' and pg.locator('.page .close-btn').count():
                    pg.locator('.page .close-btn').first.click(); pg.wait_for_timeout(150); shot('close-reading', False); done = True
                elif kind == 'shot':
                    shot(val, False); done = True
                elif kind == 'casebook':
                    pg.get_by_role('button', name=re.compile('^Record')).click(); pg.wait_for_timeout(400)
                    cards = pg.locator('.drawer .case-card')
                    if cards.count() >= 1:
                        cards.nth(0).get_by_role('button', name='Said of her').click(); pg.wait_for_timeout(100)
                        pg.locator('.drawer .case-card').nth(0).get_by_role('button', name='Beside her').click(); pg.wait_for_timeout(100)
                        pg.get_by_role('button', name='Hold them to the glass').click(); pg.wait_for_timeout(300)
                    shot('casebook', False)
                    pg.keyboard.press('Escape'); pg.wait_for_timeout(400); done = True
                if done:
                    plan.pop(0); pg.wait_for_timeout(200); continue
            if pg.locator('.page .continue').count():
                pg.locator('.page .continue').click(); pg.wait_for_timeout(250); continue
            # fall back to the first available choice
            ch = pg.locator('.page .choice:not(.locked)')
            if ch.count():
                ch.first.click(); settle(); continue
            errors.append(f'[{tag}] stuck at {scene}'); shot('stuck'); break
        st = pg.evaluate('JSON.stringify({e: UH._debug.state.ending, r: UH._debug.state.role, heard: UH._debug.state.heard, erased: UH._debug.state.erased, pins: UH._debug.state.pinned.length, pairs: UH._debug.state.pairs.length, refl: UH._debug.state.reflections.length, flags: UH._debug.state.flags})')
        print(tag, st)
        ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        if ow > 0: errors.append(f'[{tag}] horizontal overflow {ow}px')
        b.close()

reader = [('choose', 'A reader'), ('shot', 'role'), ('choose', 'Go in'), 
          ('choose', 'Weeks later'), ('choose', 'Go down'), 
          ('witness', 'Edward Fairfax'), ('shot', 'rochester'), ('choose', 'Return'), ('witness', 'The register'), ('choose', 'Return'),
          ('witness', 'Grace Poole'), ('choose', 'Return'), ('casebook', ''),
          ('choose', 'Close the hearing'), ('choose', 'Not proven'), ('choose', 'Go in'), ('examine', 'Grace Poole’s pocket'), ('examine', 'Her'),
          ('choose', 'Speak to her'), ('choose', 'Antoinetta'), ('choose', 'Give her words'), ('choose', 'Go on'), ('choose', 'Write in the margin')]
judge = [('choose', 'A judge'), ('choose', 'Go in'), ('choose', 'Weeks later'), ('choose', 'Go down'),
         ('witness', 'Edward Fairfax'), ('choose', 'Return'), ('witness', 'Richard Mason'), ('shot', 'cross'), ('choose', 'Return'), ('witness', 'Charlotte'), ('choose', 'Return'),
         ('witness', 'The landlord'), ('choose', 'Return'), ('shot', 'limit'), ('choose', 'Close the hearing'), ('choose', 'Adjourn'), ('choose', 'Go in'),
         ('examine', 'The window'), ('examine', 'The lamp'), ('choose', 'Speak to her'), ('choose', 'Bertha'), ('choose', 'Leave the page blank'), ('choose', 'Go on'), ('choose', 'Declare a mistrial')]
rescuer = [('choose', 'A rescuer'), ('choose', 'Go in'), ('choose', 'Weeks later'), ('choose', 'Go down'),
           ('witness', 'Richard Mason'), ('shot', 'x_mason'), ('choose', 'Stop him'), ('shot', 'r_mason'), ('choose', 'Return'),
           ('witness', 'Jane Eyre'), ('choose', 'Hide the veil'), ('choose', 'Return'),
           ('witness', 'Grace Poole'), ('choose', 'Let the night happen'), ('choose', 'Return'),
           ('choose', 'Close the hearing'), ('choose', 'Mad'), ('choose', 'Go in'), ('examine', 'The fire'), ('examine', 'The tapestry'), ('shot', 'inadmissible'),
           ('choose', 'Leave without speaking'), ('choose', 'Keep her safe')]

run('reader', reader, shots=('corridor', 'hearing', 'w_rochester', 'e_margin'))
run('judge', judge, shots=('hearing', 'finding', 'e_mistrial'))
run('rescuer', rescuer, w=390, h=844, tag='rescuer-phone', shots=('hearing', 'w_grace', 'e_safe'))
print('\n'.join(errors) if errors else 'no errors')
