/* Before She Answers: the Moon Orchid chapter. Authored content only.
   Nothing here quotes Maxine Hong Kingston. Events from The Woman Warrior ("At the Western Palace") are retold;
   every line of dialogue is written for this game. Rules and presentation live in chapter.js and art.js.

   A scene is a set of beats. A beat shows its steps, may set the account (the version of events that will be
   told), may displace one of Moon Orchid's lines with someone else's version, and ends with choices or Continue.
   Steps: N(text) narration · L(who, text, opts) a spoken line. Either can be a function of state returning null. */
(function () {
  'use strict';
  const N = text => ({ t: 'n', text });
  const L = (who, text, o) => Object.assign({ t: 'l', who, text }, o || {});
  const EN = { en: true };   // spoken in English; everything else between the sisters is in Chinese

  const WHO = {
    mo: { name: 'Moon Orchid' },
    bo: { name: 'Brave Orchid' },
    niece: { name: 'Her daughter', long: 'Moon Orchid’s daughter' },
    daughter: { name: 'The eldest daughter', long: 'Brave Orchid’s eldest daughter' },
    son: { name: 'The eldest son', long: 'Brave Orchid’s eldest son' },
    father: { name: 'Brave Orchid’s husband' },
    none: { name: 'No one' },
    you: { name: 'You' }
  };

  const MOVEMENTS = {
    I: { n: 'I', title: 'Arrivals' },
    II: { n: 'II', title: 'A Place in the Household' },
    III: { n: 'III', title: 'The Rehearsal' }
  };

  const scenes = {};

  /* ============================================================ I · ARRIVALS */
  scenes.arrivals = {
    mv: 'I', title: 'Arrivals', place: 'San Francisco · the international arrivals hall', art: 'airport', first: 'a1',
    beats: {
      a1: {
        focus: 'bo',
        steps: [
          N('The board above the barrier turns its letters over with a sound like someone shuffling cards. HONG KONG, it says, and then, a long while later, LANDED.'),
          N('Brave Orchid has been here since morning: nine hours in the molded chairs, then more hours at the rope while the passengers come through customs one at a time. She has brought food for everyone in paper bags. Her grown children have walked the terminal so many times they know which drinking fountain is cold.'),
          N('Beside her stands her sister’s daughter, who lives in Los Angeles and has not seen her mother in years.')
        ],
        next: 'a2'
      },
      a2: {
        focus: 'bo', show: ['coat'],
        steps: [
          N('Brave Orchid knows exactly what she is looking for: a young woman, slim, the sister she left behind. When a woman in a smart Western coat comes through the doors, she starts forward.'),
          L('bo', 'There. That one.'),
          L('niece', 'Mother is the small one. By the pillar. In gray.')
        ],
        hint: 'Where you look is one of the few things you control in this story. The picture follows your attention.',
        choices: [
          { id: 'coat', label: 'Look at the woman in the smart coat', focus: 'coat', log: 'Looked where Brave Orchid was looking.',
            reply: [N('The woman in the coat walks past them into someone else’s arms. Brave Orchid follows her with her eyes a moment longer than she needs to, as if the mistake might still correct itself.')] },
          { id: 'pillar', label: 'Look at the small woman by the pillar', focus: 'mo', show: ['arrived'], log: 'Looked at the small woman by the pillar.',
            reply: [N('She is thin, with gray hair in a knot, a gray wool suit and a string of pearls. She holds her handbag in front of her with both hands, the way people hold a ticket they have been told not to lose. She is looking up at the ceiling, which is very high, and her lips are moving, as if she is counting the lights.')] }
        ],
        next: 'a3'
      },
      a3: {
        focus: 'mo', show: ['arrived'],
        steps: [
          N('Then the sisters are in front of each other, and for a moment neither of them says anything at all.'),
          L('bo', 'You’re old. When did you get so old?'),
          L('mo', 'You have Mother’s face now. Exactly hers. I nearly called you Mother.'),
          L('bo', 'Nonsense. I look the same as ever.'),
          N('They hold each other by the forearms, at arm’s length, the better to inspect the damage. Moon Orchid’s daughter laughs and cries at the same time and then apologizes for doing both.')
        ],
        next: 'a4'
      },
      a4: {
        focus: 'mo', show: ['arrived', 'bags'],
        steps: [
          N('Moon Orchid turns to take in the hall: the glass, the silver chair legs, the strangers in pale raincoats crossing it in every direction at once.')
        ],
        displace: {
          line: L('mo', 'Everyone here walks as if they’ve been told the building is about to—'),
          over: L('bo', 'Your bags. Which ones are yours? The car is outside, it’s two hours to Stockton, and she hasn’t eaten.'),
          account: { who: 'bo', text: 'She arrived tired, so we took her straight home.' },
          explain: 'Brave Orchid’s version has gone to the top of the page. That is how this moment will be told. Moon Orchid’s sentence is still here, unfinished, and “What was said” keeps both.'
        },
        choices: [
          { id: 'finish', label: 'Ask Moon Orchid how everyone walks', focus: 'mo', log: 'Asked her to finish her sentence.',
            reply: [L('mo', '…as if the building is about to leave without them.'),
              N('Her daughter laughs. Even Brave Orchid makes a short sound through her nose, which in her counts as laughter, before she goes back to counting suitcases.')],
            account: { who: 'mo', text: 'Everyone here walks as if the building is about to leave without them.' },
            set: s => { s.f.joke = 'finished'; } },
          { id: 'bags', label: 'Help find her bags', focus: 'bo', log: 'Helped with the bags while her sentence went unfinished.',
            reply: [N('There are four suitcases and a cardboard box tied with string, all of them hers. By the time the last one is found, the sentence she began has gone, and nobody remembers she was about to say anything.')],
            set: s => { s.f.joke = 'dropped'; } },
          { id: 'wait', kind: 'wait', label: 'Wait', focus: 'mo', log: 'Waited. She finished the sentence to herself.',
            reply: [N('No one asks. Moon Orchid watches a man run for a gate with his coat flying out behind him, and finishes the sentence anyway, quietly, mostly to herself.'),
              L('mo', '…about to leave without them.'),
              N('Nobody hears it but you. It does not get into the version of the day that the family will tell.')],
            set: s => { s.f.joke = 'to-you'; } }
        ],
        next: { scene: 'drive' }
      }
    }
  };

  scenes.drive = {
    mv: 'I', title: 'The Drive', place: 'The valley road to Stockton', art: 'car', first: 'd1',
    beats: {
      d1: {
        focus: 'mo',
        steps: [
          N('Brave Orchid’s eldest son drives. The valley is flat and gold and goes on longer than seems reasonable. Moon Orchid keeps the cardboard box on her lap, though there is room in the trunk, because the presents are in it.'),
          L('mo', 'In Hong Kong my window looked at the harbor. Here the whole window is sky.'),
          L('bo', 'Wait until you see the laundry. No windows at all. Very sensible.'),
          N('Her daughter, in the back seat beside her, translates the road signs that nobody asked her to translate, out of nerves.')
        ],
        next: 'd2'
      },
      d2: {
        focus: 'bo',
        steps: [
          N('Brave Orchid turns all the way round in the front seat, so that she can see her sister properly.'),
          L('bo', 'Your husband lives in Los Angeles. A big house, I hear. A doctor. You will go to him and tell him who you are.')
        ],
        displace: {
          line: L('mo', 'I have only just arrived.'),
          over: L('bo', 'She needs a little rest. Then we go.'),
          account: { who: 'bo', text: 'She would rest a few days, and then we would go to Los Angeles.' }
        },
        margin: [
          { tier: 'context', by: 'Evelyn Nakano Glenn, 1983', text: 'Moon Orchid and her husband have lived apart for about thirty years: he in America, she in Hong Kong, kept by the money he sends. The sociologist Evelyn Nakano Glenn called this arrangement the “split household.” For generations, exclusion laws let Chinese men work in the United States while making it very hard for their wives to follow, and families were held together by remittances across an ocean. The book makes this husband’s silence his own choice. But it is an old shape, and Moon Orchid has lived her whole adult life inside it.' }
        ],
        choices: [
          { id: 'when', label: 'Ask when they mean to leave', focus: 'bo', log: 'Asked when they would leave. It became a date.',
            reply: [L('bo', 'When her daughter goes back to Los Angeles, we go with her. Next week. The week after.'),
              N('It sounds like a date now. Moon Orchid looks out at a field of something low and green, and does not correct it.')],
            account: { who: 'bo', text: 'It was agreed: when her daughter went back to Los Angeles, we would all go together.' },
            set: s => { s.f.plan = 'dated'; } },
          { id: 'want', label: 'Ask Moon Orchid whether she wants to go', focus: 'mo', log: 'Asked her whether she wanted to go. Her answer was taken as a yes.',
            reply: [N('Everyone in the car waits for her answer, which is a lot of people waiting for one answer.'),
              L('mo', 'I want to see your house first. The children’s rooms. Where you buy your vegetables.', { wish: 'market' }),
              L('bo', 'Of course you’ll see the house. Then Los Angeles.'),
              N('It is not a yes. It is not quite a no. Brave Orchid hears a yes.')],
            account: { who: 'bo', text: 'She said she would go, once she had seen the house.' },
            set: s => { s.f.plan = 'asked'; } },
          { id: 'box', label: 'Ask what is in the box', focus: 'mo', log: 'Turned the talk to the presents. Los Angeles was left for later.',
            reply: [L('mo', 'Something for each of you. A dress for your mother—for you. I keep forgetting you are not Mother.'),
              N('She lifts the lid an inch to make sure nothing has escaped. Brave Orchid says the trunk would have been perfectly safe. The question of Los Angeles stays folded in the front seat, like something that will be taken out again later.')],
            account: { who: 'none', text: 'Nothing was settled in the car.' },
            set: s => { s.f.plan = 'open'; } }
        ],
        next: { scene: 'morning' }
      }
    }
  };

  /* ============================================================ II · A PLACE IN THE HOUSEHOLD */
  scenes.morning = {
    mv: 'II', title: 'The Cupboard', place: 'Stockton · the kitchen, first morning', art: 'kitchen', first: 'm1',
    beats: {
      m1: {
        focus: 'mo',
        steps: [
          N('The house is low and long, with a lawn that someone waters every evening whether it needs it or not. Brave Orchid and her husband leave for the laundry at six. By the time Moon Orchid comes into the kitchen in her suit and pearls, the coffee is cold and the house belongs to the grown children, who are not sure what to do with an aunt.'),
          N('She opens the cupboard. Cups with handles and cups without; a cup from a gas station with a cartoon sun on it, grinning; and at the back, a thin white one with a blue rim and a chip so small you would have to know it was there.')
        ],
        choices: [
          { id: 'sun', label: 'Hand her the gas-station cup', focus: 'mo', show: ['cup-sun'], log: 'Handed her the cup with the grinning sun.',
            reply: [N('She turns it round to see the sun from every side.'),
              L('mo', 'He looks very pleased with himself.'),
              N('She drinks her tea from it with great seriousness, and from then on it is hers.')],
            set: s => { s.f.cup = 'sun'; } },
          { id: 'wait', kind: 'wait', label: 'Wait while she chooses', focus: 'mo', show: ['cup-white'], log: 'Waited while she chose a cup.',
            reply: [N('She takes down the thin white cup from the back, the one nobody uses, and holds it to the window to see the light come through the rim. Then she rinses it, though it is clean, and sets it by the sink as if it has been assigned to her.')],
            set: s => { s.f.cup = 'white'; } },
          { id: 'good', label: 'Find her the good teacups', focus: 'son', show: ['cup-white'], log: 'Offered her the guest cups.',
            reply: [L('son', 'Mom keeps the good ones in the dining room. For guests.', EN),
              N('Moon Orchid looks at the guest cups in their glass cabinet and decides not to be a guest. She goes back to the cupboard and takes down the thin white cup from the very back.')],
            set: s => { s.f.cup = 'white'; s.f.guestCups = true; } }
        ],
        next: { scene: 'household' }
      }
    }
  };

  scenes.household = {
    mv: 'II', title: 'A Place in the Household', place: 'Stockton', art: 'house', first: 'h1', hub: true,
    beats: {
      h1: {
        focus: 'mo',
        steps: [
          s => N(!s.done.length
            ? 'The days fall into a shape quickly, the way days do in a house with a business attached. Brave Orchid is at the laundry from six. Her grown children come and go. Moon Orchid has to find a place in it, or be given one.'
            : 'Later that week.')
        ],
        choices: [
          { id: 'children', label: 'Stay at the house with the children', when: s => !s.done.includes('children'), next: { scene: 'children' }, log: 'Stayed at the house with the children.' },
          { id: 'laundry', label: 'Go with her to the laundry', when: s => !s.done.includes('laundry'), next: { scene: 'laundry' }, log: 'Went with her to the laundry.' },
          { id: 'evenings', label: 'The evenings', when: s => s.done.includes('children') && s.done.includes('laundry'), next: { scene: 'evenings' }, log: 'Stayed for the evenings.' }
        ]
      }
    }
  };

  scenes.children = {
    mv: 'II', title: 'The Children', place: 'Stockton · the living room', art: 'living', first: 'c1', returnTo: 'household',
    beats: {
      c1: {
        focus: 'mo',
        steps: [
          N('Moon Orchid has decided that the way to learn her sister’s children is to watch them closely and say what she sees. Out loud. As it happens.'),
          L('mo', 'Now she is reading. A thick book with no pictures. Now she turns the page. She reads very fast. Now she is frowning at me.'),
          L('daughter', 'She’s doing it again.', EN),
          L('son', 'Just let her. She’s jet-lagged.', EN),
          N('The eldest daughter is home from college, studying at the dining table. The eldest son is making a sandwich with an energy that suggests he would like to be somewhere else.')
        ],
        next: 'c2'
      },
      c2: {
        focus: 'mo',
        steps: [
          L('mo', 'In your mother’s letters you were the one who hid under the bed when visitors came. You still sit with your back to the wall.'),
          N('The eldest daughter, who does sit with her back to the wall, closes her book.')
        ],
        displace: {
          line: L('mo', 'Your mother wrote that you keep a notebook and won’t show anyone. Is it—'),
          over: L('daughter', 'She’s bored. Somebody should take her to the laundry so she has something to do.', EN),
          account: { who: 'daughter', text: 'Aunt was bored, so we found her something to do.' }
        },
        choices: [
          { id: 'letters', label: 'Ask Moon Orchid what else the letters said', focus: 'mo', log: 'Asked her what else the letters said.',
            reply: [L('mo', 'That you were too thin. That you wrote things down and hid them. That your mother is proud of you and would never say so to your face.'),
              N('The eldest daughter is quiet for a moment. Then she takes out the notebook she has been pretending not to have and turns it so her aunt can see a page, though Moon Orchid cannot read English.'),
              L('mo', 'Such small writing. You must have a great deal to say.')],
            account: { who: 'mo', text: 'Aunt knew things about us from Mother’s letters that we didn’t know she knew.' },
            set: s => { s.f.knows = 'daughter'; } },
          { id: 'drive', label: 'Offer to drive her to the laundry', focus: 'son', log: 'Offered to take her to the laundry. The morning was solved.',
            reply: [N('It is a kind offer, and it solves the problem of the morning. Moon Orchid puts on her coat. In the car she says the streets here are very wide and that no one is walking on them, and asks where everyone is.'),
              L('son', 'At work.', EN),
              N('It answers the question without answering it.')],
            set: s => { s.f.knows = 'son'; } },
          { id: 'wait', kind: 'wait', label: 'Let her continue', focus: 'mo', log: 'Let her continue. She kept narrating until they laughed.',
            reply: [L('mo', 'Now she is putting her book away. Now she is pretending to look for something. Now she is smiling, a little, though she would rather not.'),
              L('daughter', 'I’m not smiling.', EN),
              L('mo', 'Now she says she is not smiling.'),
              N('Nobody translates this, and nobody needs to. The eldest son laughs so hard he has to put the sandwich down.')],
            account: { who: 'mo', text: 'Aunt narrated us until we laughed.' },
            set: s => { s.f.knows = 'both'; s.f.laughed = true; } }
        ],
        next: 'c3'
      },
      c3: {
        focus: 'mo',
        steps: [
          N('Later, while the eldest son washes up, Moon Orchid stands in the kitchen doorway holding her handbag, though she is not going anywhere.'),
          L('mo', 'Your mother says there is a Chinatown here. On Saturday, will someone take me? I want to see what they sell, and who is selling it.', { wish: 'saturday' }),
          N('The question is addressed to the room. The room is mostly occupied with a frying pan.')
        ],
        choices: [
          { id: 'daughter', label: 'Let the eldest daughter answer', when: s => s.f.knows === 'daughter' || s.f.knows === 'both', focus: 'daughter',
            log: 'Left room for the eldest daughter to answer.',
            reply: [L('daughter', 'Saturday morning. I’ll take you. We’ll go before it gets hot.'),
              N('She writes it on the calendar by the telephone, in English, under a dentist’s appointment.')],
            wish: { id: 'saturday', status: 'Promised by the eldest daughter, and written on the calendar.' },
            set: s => { s.f.helper = 'daughter'; } },
          { id: 'son', label: 'Ask the eldest son to take her', focus: 'son', log: 'Asked the eldest son to take her.',
            reply: [L('son', 'Saturday? Sure. I mean, probably. If Mom doesn’t need the car.', EN),
              N('Moon Orchid thanks him as if he has said yes.')],
            wish: { id: 'saturday', status: 'Half-promised by the eldest son, if the car is free.' },
            set: s => { s.f.helper = 'son'; } },
          { id: 'mother', label: 'Say that Brave Orchid will take her', focus: 'son', log: 'Passed her request on to Brave Orchid.',
            reply: [L('son', 'Mom’ll take you. She goes all the time.', EN),
              N('This is true, and it means the request now belongs to Brave Orchid, who is at the laundry and has not heard it.')],
            wish: { id: 'saturday', status: 'Passed on to Brave Orchid, who was not there to hear it.' },
            set: s => { s.f.helper = 'none'; } }
        ],
        next: { scene: 'household' }
      }
    }
  };

  scenes.laundry = {
    mv: 'II', title: 'The Laundry', place: 'Stockton · the family laundry', art: 'laundry', first: 'l1', returnTo: 'household',
    beats: {
      l1: {
        focus: 'bo',
        steps: [
          N('The laundry is one long room: steam presses like great padded jaws, a sorting table, and shelves of finished bundles in brown paper, each tied with string and tagged with a paper ticket. The tubes overhead buzz. The heat rises from the machines and stays.'),
          N('Brave Orchid has been here since six. She hands her sister a shirt and shows her the iron.'),
          L('bo', 'Collar first. Then cuffs. Then the back, then the front. Then the next one.')
        ],
        next: 'l2'
      },
      l2: {
        focus: 'mo', show: ['ironing'],
        steps: [
          N('Moon Orchid irons the collar with great care and great slowness, telling the shirt about its owner as she goes: a tall man, careful with money, who has had this shirt since before he married. She stops to tell her sister so. The iron stays where it is.'),
          N('There is a smell, and then a brown iron-shaped mark on a white back.'),
          L('bo', 'Aiya. Give it here.')
        ],
        next: 'l3'
      },
      l3: {
        focus: 'mo', show: ['burned'],
        steps: [],
        displace: {
          line: L('mo', 'The heat gets into my head. Let me fold instead. I am good at folding. In Hong Kong I folded everything my—'),
          over: L('bo', 'She can’t manage the iron. She can sit. She’ll learn tomorrow.'),
          account: { who: 'bo', text: 'She couldn’t manage the iron, so she sat on a crate and watched.' }
        },
        margin: [
          { tier: 'criticism', by: 'Sau-ling Cynthia Wong, 1993', text: 'Sau-ling Cynthia Wong reads Asian American writing through a tension she calls Necessity and Extravagance: on one side survival, thrift and use; on the other, play, pleasure and expression that serve no purpose. The laundry is a room built by Necessity, and the household measures everyone in it by use. Moon Orchid’s talk, her stories about the owners of shirts, belong to the other column. In this house that makes her look useless, not unwell.' }
        ],
        choices: [
          { id: 'towels', label: 'Bring her the stack of clean towels', focus: 'mo', show: ['towels'], log: 'Brought her the towels she asked for.',
            reply: [N('Moon Orchid folds the towels in thirds and then in half, smoothing each one twice, and builds a pile so square it might have been cut with a knife. It is not fast. It is very good.'),
              L('bo', 'Too slow.'),
              L('father', 'Look at that pile.'),
              N('Brave Orchid looks, and says nothing, which is as close as she comes to agreeing.')],
            account: { who: 'mo', text: 'She asked to fold, and she folded the towels better than any of us.' },
            set: s => { s.f.task = 'towels'; } },
          { id: 'crate', label: 'Set out a crate in the shade by the door', focus: 'mo', show: ['crate'], log: 'Set out the crate. She sat and watched.',
            reply: [N('It is the coolest place in the room. Moon Orchid sits with her handbag on her knees and watches the street through the window, where LAUNDRY is painted in letters that read backwards from inside. She reads it from the wrong side, slowly, the way you read a word in a country you are only visiting.')],
            set: s => { s.f.task = 'crate'; } },
          { id: 'wait', kind: 'wait', label: 'Wait', focus: 'mo', show: ['tickets'], log: 'Waited. She found her own work.',
            reply: [L('mo', 'I could do the tickets. Numbers I can read. Numbers are the same in every country.'),
              N('Brave Orchid considers this for the length of one shirt. Then she pushes the box of tickets across the table.')],
            account: { who: 'mo', text: 'She offered to sort the tickets, and the tickets got sorted.' },
            set: s => { s.f.task = 'tickets'; } }
        ],
        next: 'l4'
      },
      l4: {
        focus: 'mo',
        steps: [
          N('In the late afternoon the presses hiss less often. A customer comes in for his bundle, and while Brave Orchid finds it, Moon Orchid studies him openly: his hat, his shoes, the way he counts his change twice.'),
          L('mo', 'That ghost does his own mending. Look at his cuff.'),
          N('When he has gone, Brave Orchid admits that he does do his own mending, very badly, and the two sisters laugh: the same laugh, which neither of them has heard in thirty years.'),
          s => L('mo', s.f.task === 'crate' ? 'Tomorrow I will come again. I will bring my own crate.' : 'Tomorrow I will come again and do the ' + (s.f.task === 'tickets' ? 'tickets' : 'towels') + '. And the day after.', { wish: 'tomorrow' })
        ],
        margin: [
          { tier: 'annotation', by: '', text: 'In this family’s speech, the non-Chinese Americans around them are “ghosts”: the mail ghost, the taxi ghost, the man who does his own mending. Moon Orchid, newly arrived, reverses the map; the book has her call the Chinese people in Chinatown “Americans.” Who looks fully real depends on who is looking, and the person in this room who is hardest to see is the one doing the looking.' }
        ],
        choices: [
          { id: 'yes', label: 'Tell her it will be waiting', focus: 'bo', log: 'Told her the work would be waiting.',
            reply: [L('bo', 'Come at three. Not earlier. Earlier is too hot for you.'),
              N('It is an arrangement. It is small, and it is hers, and it has a time.')],
            wish: { id: 'tomorrow', status: 'Taken up: three o’clock, every afternoon.' },
            set: s => { s.f.three = true; } },
          { id: 'wait', kind: 'wait', label: 'Wait', focus: 'bo', log: 'Waited. Brave Orchid went on with the tickets.',
            reply: [N('Brave Orchid is already writing up the day’s tickets. The plan hangs in the steam for a while and settles nowhere.')],
            wish: { id: 'tomorrow', status: 'Said aloud. No one answered.' } }
        ],
        next: { scene: 'household' }
      }
    }
  };

  scenes.evenings = {
    mv: 'II', title: 'Evenings', place: 'Stockton · the dinner table', art: 'house', first: 'e1',
    beats: {
      e1: {
        focus: 'bo',
        steps: [
          N('Every evening, over the rice, Brave Orchid asks her sister whether she is ready. Every evening Moon Orchid says not yet.'),
          s => s.f.plan === 'dated'
            ? N('“The trip we agreed on,” Brave Orchid calls it now, at dinner, in front of everyone. Nobody at the table can remember agreeing to anything, but the phrase has been said so often that it has become a fact about the family. (In “What was said” you can find the car, and the question that made it a date.)')
            : s.f.plan === 'asked'
              ? N('“After she has seen the house,” Brave Orchid reminds everyone. Moon Orchid has seen the house. She has seen every room in it twice.')
              : N('Nothing was settled in the car, so it is settled at dinner instead, a little more each night, by the person who talks the most.'),
          s => s.wishes.saturday && s.f.helper === 'daughter'
            ? N('On Saturday morning the eldest daughter takes her aunt to Chinatown before it gets hot. It is the first thing in America that has happened exactly when Moon Orchid was told it would.')
            : s.wishes.saturday && s.f.helper === 'son'
              ? N('On Saturday Brave Orchid needs the car.')
              : s.wishes.saturday ? N('Saturday comes and goes. No one remembers that anyone asked.') : null,
          s => s.wishes.market && !s.wishes.saturday ? N('She has still not seen where her sister buys vegetables.') : null
        ],
        next: { scene: 'previewEnd' }
      }
    }
  };

  /* end of the first preview; Movement III will replace this */
  scenes.previewEnd = {
    mv: 'III', title: 'The Rehearsal', place: 'Preview ends here', art: 'house', first: 'p1', end: true,
    beats: {
      p1: {
        focus: 'mo',
        steps: [
          N('Then Moon Orchid’s daughter says she has to go back to Los Angeles, and Brave Orchid says, Good, we will all go, and pulls a chair up to the kitchen table to explain to her sister exactly what she will say to her husband.'),
          N('This is where the first preview stops. Movement III, the rehearsal, comes next.')
        ]
      }
    }
  };

  UH.MO = {
    who: WHO, movements: MOVEMENTS, scenes, start: 'arrivals',
    title: 'Before She Answers',
    sub: 'Moon Orchid · from Maxine Hong Kingston’s The Woman Warrior (1976)',
    notice: 'An interpretive adaptation. Some paths depart from the book.',
    contentNote: 'This chapter includes abandonment, psychological distress, institutionalization and death. Distress is shown with restraint, never as a puzzle or a twist.',
    howTo: [
      'You are listening to a family story, told and retold. You cannot change what anyone feels. You can choose where you look, ask, wait, or help.',
      'At the top of the page is the account: how each moment will be told afterwards. Sometimes someone else’s version takes the place of Moon Orchid’s words.',
      '“What was said” keeps every line in order, including the ones that were set aside, and what you did.'
    ],
    sourceNote: 'Events are retold in this game’s own words. No sentence of Kingston’s is quoted, and every line of dialogue is written for this chapter.'
  };
})();
