import sys, pathlib, re
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).parent.parent / 'dist/standalone/index.html').resolve().as_uri()
SHOTS = pathlib.Path(__file__).parent / 'shots'
errors = []
def run(width, height, tag, path):
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': width, 'height': height})
        pg.on('console', lambda m: m.type in ('error', 'warning') and errors.append(f'[{tag}] {m.type}: {m.text}'))
        pg.on('pageerror', lambda e: errors.append(f'[{tag}] pageerror: {e}'))
        pg.goto(URL); pg.wait_for_timeout(1800)
        pg.screenshot(path=str(SHOTS / f'{tag}-01-landing.png'))
        pg.get_by_role('button', name='Enter the Reading Room', exact=True).click(); pg.wait_for_timeout(300)
        pg.screenshot(path=str(SHOTS / f'{tag}-02-hub.png'), full_page=True)
        pg.screenshot(path=str(SHOTS / f'{tag}-02-hub.png'))
        pg.get_by_role('button', name='Open the volume').click(); pg.wait_for_timeout(300)
        def settle():
            pg.wait_for_timeout(250)
            if pg.locator('.titlecard').count():
                pg.wait_for_timeout(1300); pg.locator('.titlecard').first.click(force=True) if pg.locator('.titlecard').count() else None; pg.wait_for_timeout(800)
        def choose(label): pg.locator('.choice', has_text=label).first.click(); settle()
        def cont(): pg.locator('.continue').last.click(); pg.wait_for_timeout(250)
        def read(label): pg.locator('.reading-opt', has_text=label).first.click(); pg.wait_for_timeout(250)
        def clue(text): pg.locator('.clue', has_text=text).first.click(); pg.wait_for_timeout(250)
        choose(path['role'])
        clue('Bluebeard'); cont(); clue('formal'); cont(); clue('perhaps Grace Poole'); read(path['laugh'])
        pg.screenshot(path=str(SHOTS / f'{tag}-03-corridor.png'), full_page=True)
        choose('Weeks later'); cont(); cont(); pg.wait_for_timeout(2600); read(path['placement'])
        pg.screenshot(path=str(SHOTS / f'{tag}-04-leads.png'), full_page=True)
        choose('Go down to the hall')
        pg.screenshot(path=str(SHOTS / f'{tag}-05-hearing.png'), full_page=True)
        for w in path['witnesses']:
            pg.locator('.wcard', has_text=w).first.click(); settle()
            for _ in range(12):
                if pg.locator('.reading-opt').count(): read('Cannot be determined')
                for t in path.get('clues', []):
                    if pg.locator('.clue', has_text=t).count() and pg.locator(f'.clue[aria-expanded="false"]', has_text=t).count(): clue(t)
                if pg.locator('.choice', has_text='Return to the hearing').count():
                    if w == path['witnesses'][0]: pg.screenshot(path=str(SHOTS / f'{tag}-06-witness.png'), full_page=True)
                    choose('Return to the hearing'); break
                cont()
        # strike a word from the Record
        pg.get_by_role('button', name='Record').first.click(); pg.wait_for_timeout(400)
        pg.get_by_role('tab', name='Words').click(); pg.wait_for_timeout(200)
        pg.locator('.word-row').first.get_by_role('button', name='Strike').click(); pg.wait_for_timeout(200)
        pg.screenshot(path=str(SHOTS / f'{tag}-07-record.png'))
        pg.get_by_role('tab', name='Glass').click(); pg.wait_for_timeout(200)
        pg.screenshot(path=str(SHOTS / f'{tag}-07b-glass.png'))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
        choose('Close the hearing'); choose(path['finding']); choose('Go in')
        for o in ['The window', 'Grace Poole’s pocket', 'Her']:
            pg.locator('.ex-btn', has_text=o).first.click(); pg.wait_for_timeout(250)
        pg.screenshot(path=str(SHOTS / f'{tag}-08-room.png'), full_page=True)
        choose('Speak to her'); choose(path['name']); choose(path['voice'])
        if path['voice'].startswith('Give'):
            for w in ['I', 'am', 'not', 'your', 'sister', 'fire']:
                pg.locator('.bank .tile').filter(has_text=re.compile('^' + w + '$')).first.click(); pg.wait_for_timeout(80)
            pg.get_by_role('button', name='Enter it into the record').click(); pg.wait_for_timeout(300)
        elif path['voice'].startswith('Write'):
            pg.fill('#her-words', 'You kept the window from me for ten years, and called the dark my nature.')
            pg.get_by_role('button', name='Enter it into the record').click(); pg.wait_for_timeout(300)
        else:
            pg.get_by_role('button', name='Wait').click(); pg.wait_for_timeout(2300)
        pg.screenshot(path=str(SHOTS / f'{tag}-09-voice.png'), full_page=True)
        choose('Go on')
        pg.screenshot(path=str(SHOTS / f'{tag}-10-night.png'), full_page=True)
        choose(path['ending'])
        if pg.locator('.burn').count():
            pg.wait_for_timeout(5000); pg.screenshot(path=str(SHOTS / f'{tag}-11-burning.png'))
            pg.locator('.burn .skip').click(); pg.wait_for_timeout(300)
        if pg.locator('.choice', has_text='Leave the blank').count(): choose('Leave the blank')
        for _ in range(4):
            if pg.locator('.afterword').count(): break
            cont()
        pg.screenshot(path=str(SHOTS / f'{tag}-12-afterword.png'), full_page=True)
        choose('Turn the page'); cont(); cont()
        pg.screenshot(path=str(SHOTS / f'{tag}-13-thesis.png'), full_page=True)
        choose('Return to the Reading Room')
        pg.screenshot(path=str(SHOTS / f'{tag}-14-hub-after.png'), full_page=True)
        # horizontal overflow check
        ow = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        if ow > 0: errors.append(f'[{tag}] horizontal overflow {ow}px on hub')
        b.close()

A = dict(role='A judge', laugh='Resistance', placement='An echo', witnesses=['Edward Fairfax', 'The register', 'Jane Eyre'], clues=['judge me', 'ravings would', 'my wife', 'good race', 'If you were mad', 'mad cat', 'creature of an'], finding='Adjourn', name='Antoinetta', voice='Leave the page blank', ending='Step back')
B = dict(role='A rescuer', laugh='Madness', placement='A reply', witnesses=['Richard Mason', 'Grace Poole', 'Charlotte Brontë'], clues=['gibberish', 'say nothing', 'fiend-nature'], finding='Mad', name='Bertha', voice='Write in her voice', ending='Do nothing')
C = dict(role='A reader', laugh='Suffering', placement='Only a sound', witnesses=['The landlord', 'The register'], clues=[], finding='Not proven', name='No name', voice='Give her words', ending='Follow the register')
run(1280, 860, 'desk', A)
run(390, 844, 'mob', B)
run(1280, 860, 'deskC', C)
print('\n'.join(errors) if errors else 'no console errors')
