"""Play the Moon Orchid chapter in Chromium: every choice path through the preview, resume, the record, other chapters intact."""
import pathlib, sys, json
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).parent.parent / 'dist/standalone/index.html').resolve().as_uri()
SH = pathlib.Path(__file__).parent / 'shots-mo'; SH.mkdir(exist_ok=True)
errors = []

def run(tag, picks, w=1440, h=900, shots=True, reduced=False):
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion='reduce' if reduced else 'no-preference')
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'[{tag}] {e}'))
        pg.on('console', lambda m: m.type == 'error' and 'fonts.g' not in m.text and 'ERR_' not in m.text and errors.append(f'[{tag}] {m.text}'))
        pg.goto(URL + '#moon-orchid'); pg.wait_for_timeout(900)
        shot = lambda n, full=False: shots and pg.screenshot(path=str(SH / f'{tag}-{n}.png'), full_page=full)
        shot('entry')
        pg.locator('.mo-note summary').first.click(); pg.wait_for_timeout(100)
        pg.get_by_role('button', name='Begin').click(); pg.wait_for_timeout(300)
        def settle():
            pg.wait_for_timeout(150)
            while pg.locator('.mo-card').count():
                pg.locator('.mo-card').first.click(); pg.wait_for_timeout(700)
        settle()
        picks = list(picks); steps = 0; n = 0
        while steps < 120:
            steps += 1
            sc = pg.evaluate('UH._mo.state.scene')
            if pg.locator('.mo-end').count(): shot('end'); break
            ch = pg.locator('.mo-choice')
            if ch.count():
                labels = [ch.nth(i).inner_text() for i in range(ch.count())]
                want = None
                for i, l in enumerate(labels):
                    if picks and picks[0].lower() in l.lower(): want = i; break
                if want is None:
                    errors.append(f'[{tag}] at {sc}: wanted {picks[0] if picks else None!r}, had {labels}'); want = 0
                if picks: picks.pop(0)
                n += 1
                if n in (2, 4, 6, 9): shot(f'{n:02d}-{sc}')
                ch.nth(want).click(); pg.wait_for_timeout(250); settle()
                if pg.locator('.mo-margin-btn').count() and n == 5:
                    pg.locator('.mo-margin-btn').first.click(); pg.wait_for_timeout(150); shot('margin')
                continue
            if pg.locator('.mo-continue').count():
                pg.locator('.mo-continue').click(); pg.wait_for_timeout(250); settle(); continue
            errors.append(f'[{tag}] stuck at {sc}'); shot('stuck'); break
        st = pg.evaluate('JSON.stringify({f: UH._mo.state.f, wishes: UH._mo.state.wishes, account: UH._mo.state.account, done: UH._mo.state.done})')
        print(tag, st)
        # the record
        pg.get_by_role('button', name='What was said').first.click(); pg.wait_for_timeout(400); shot('said')
        before = pg.evaluate('JSON.stringify(UH._mo.state)')
        pg.locator('.mo-drawer .mo-bar-btn').click(); pg.wait_for_timeout(200)
        if pg.evaluate('JSON.stringify(UH._mo.state)') != before: errors.append(f'[{tag}] reading the record changed state')
        # refresh and resume
        pg.reload(); pg.wait_for_timeout(800)
        if not pg.locator('.mo-end').count(): errors.append(f'[{tag}] did not resume at the end')
        ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        if ow > 0: errors.append(f'[{tag}] horizontal overflow {ow}px')
        # other chapters still load
        pg.goto(URL + '#reading-room'); pg.wait_for_timeout(500); shot('shelf')
        pg.goto(URL + '#bertha'); pg.wait_for_timeout(600)
        if not pg.locator('.view-story').count(): errors.append(f'[{tag}] bertha did not open')
        b.close()

A = ['pillar', 'how everyone walks', 'when they mean', 'gas-station', 'children', 'what else the letters', 'eldest daughter answer', 'laundry', 'towels', 'waiting', 'evenings']
B = ['smart coat', 'bags', 'whether she wants', 'wait while', 'laundry', 'wait', 'wait', 'children', 'let her continue', 'eldest daughter answer', 'evenings']
Cc = ['pillar', 'wait', 'what is in the box', 'good teacups', 'children', 'drive her', 'eldest son', 'laundry', 'crate', 'wait', 'evenings']
which = sys.argv[1:] or ['a', 'b', 'c', 'phone']
if 'a' in which: run('a', A)
if 'b' in which: run('b', B, shots=True)
if 'c' in which: run('c', Cc, shots=False, reduced=True)
if 'phone' in which: run('phone', B, w=390, h=844)
print('\n'.join(errors) if errors else 'no errors')
