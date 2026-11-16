/* Before She Answers: the Moon Orchid chapter. Authored content only.

   The Woman Warrior (1976) is in copyright, so nothing here quotes Kingston. Every passage marked "Retold" is a
   close paraphrase of an event in "At the Western Palace", in this game's words, with no invented events or speech.
   Where the book reports what someone said, the paraphrase reports it; it does not script it.

   Markup: [[visible words|clueId]] opens a note; *words* is italic.
   Steps:  R(text)   a retold passage from the chapter
           N(text)   the game's own connecting line (kept short, never adds events)
           SEEN(id)  a "Seen as" pair: how she is seen, set against what the text shows
   A beat may carry a reading (choose an interpretation; the analysis follows) or a word (whose word the account keeps). */
(function () {
  'use strict';
  const CH = 'Ch. 4 · At the Western Palace';
  const R = (text, o) => Object.assign({ t: 'r', text, cite: CH }, o || {});
  const N = text => ({ t: 'n', text });
  const SEEN = id => ({ t: 'seen', id });

  const WHO = {
    mo: { name: 'Moon Orchid' }, bo: { name: 'Brave Orchid' }, niece: { name: 'Moon Orchid’s daughter' },
    children: { name: 'Brave Orchid’s children' }, none: { name: 'No one' }
  };
  const MOVEMENTS = { I: { n: 'I', title: 'Arrivals' }, II: { n: 'II', title: 'A Place in the Household' }, III: { n: 'III', title: 'The Rehearsal' } };

  /* ------------------------------------------------------------------ notes */
  const clues = {
    c_noI: { tier: 'annotation', text: 'Every other chapter of *The Woman Warrior* has an “I” in it. This one does not. The narrator who tells the rest of the book disappears, and the chapter is told in the third person, like a story heard rather than lived.\n\nIn the next chapter she admits it: she was not there for the confrontation in Los Angeles. Her brother told the story to her sister, and her sister told her. The account of Moon Orchid reaches us third-hand.' },
    c_versions: { tier: 'criticism', by: 'Boardman, 1991', text: 'Kathleen Boardman points out that the meeting between Moon Orchid and her husband exists in two versions, the one told in this chapter and the brother’s plainer one in the next, and that Kingston declines to choose between them. The book’s point is not which version is true but that every account of Moon Orchid has passed through someone else.' },
    c_aloft: { tier: 'annotation', text: 'Brave Orchid believes her attention holds the plane up. It is magical thinking, and also an exact description of how this family works: people stay aloft because someone concentrates on them.\n\nKeep the idea in mind. The chapter that follows is about what happens to a woman when the attention holding her up is withdrawn.' },
    c_shaman: { tier: 'criticism', by: 'VanSpanckeren, 1991', text: 'In the previous chapter, “Shaman,” Brave Orchid is a heroine: a doctor trained in China who sits up all night in a haunted room and talks a ghost away. Kathryn VanSpanckeren reads “At the Western Palace” as a cautionary sequel to that chapter. The same force of will that defeated a ghost in China is about to be turned on her sister in America.' },
    c_ship: { tier: 'context', text: 'Her son is serving in the war in Vietnam. Brave Orchid adds his ship to the plane she is already holding up, and gets a headache. The war is the book’s background in this chapter; it is also another son of the household whom no one can see.' },
    c_niece: { tier: 'context', text: 'Brave Orchid brought her niece to America too, by arranging her marriage to a Chinese American. That marriage is what let Moon Orchid follow. Moon Orchid’s journey was planned in advance by her sister, using her daughter’s marriage as the route.' },
    c_young: { tier: 'annotation', reflect: 'young', text: 'Brave Orchid is looking for the sister she remembers. The woman she claims is young and wears Western clothes, which is to say she fits the picture, not the person. It takes the niece to correct her: her mother will look much older.\n\nThe first thing that happens to Moon Orchid in America is that she is not recognized.' },
    c_old: { tier: 'annotation', text: 'The sisters have not seen each other for decades, and each is shocked by the other’s age. In the car to Stockton they keep returning to it, as if the shock has to be repeated to be believed.\n\nAge matters to the argument of this chapter. A woman in her sixties, arriving to reclaim a marriage, is arriving into a country and a family that have already decided what her future can hold.' },
    c_famulan: { tier: 'annotation', text: 'Fa Mu Lan is the woman warrior of the book’s second chapter, the heroine the narrator imagines becoming: trained in the mountains, avenging her village, the words of her family’s grievances carved into her back.\n\nHere she arrives as a paper cutout, a present from Hong Kong for children who handle it at once. The warrior of the book’s title enters this chapter flat, decorative and given away, and in this chapter no one will fight.' },
    c_chin: { tier: 'criticism', by: 'Chin, 1991', text: 'Frank Chin attacked Kingston’s Fa Mu Lan as a fake: in “Come All Ye Asian American Writers of the Real and the Fake” he objected that she had grafted onto the heroine the tattooed back that belongs to the male general Yue Fei, and had served white readers a feminized, invented China. The quarrel is about who is entitled to retell a story, and how faithfully: the same question this chapter asks about Moon Orchid.' },
    c_gods: { tier: 'annotation', text: 'Brave Orchid judges the gifts by an economy of luck. Too much generosity attracts envy, from gods as well as people. Extravagance is not just wasteful to her; it is dangerous.' },
    c_wong: { tier: 'criticism', by: 'Wong, 1993', text: 'Sau-ling Cynthia Wong reads Asian American writing through a tension she calls Necessity and Extravagance. Necessity is survival, thrift and use; Extravagance is play, pleasure and expression that serve no purpose.\n\nThe two sisters divide almost exactly along this line. Moon Orchid has lived for thirty years on money sent from America and has never had to work. Brave Orchid runs a laundry. Each sister’s idea of what a person is for comes from the life she has had.' },
    c_useful: { tier: 'annotation', text: 'Brave Orchid puts the useful presents away in the back bedroom, which is where Moon Orchid will sleep until a permanent plan has been made for her. The guest’s gifts are sorted by use, and so, in effect, is the guest.' },
    c_bracelets: { tier: 'annotation', text: 'Jade bracelets for the girls, forbidden by their mother: they are too young, and would break them playing baseball. The gift is refused on the grounds of the American life the girls actually lead, which Moon Orchid has not seen.' },
    c_sweet: { tier: 'context', text: 'In the welcoming ritual Brave Orchid insists on, the children are fed candy because a beginning must be sweet. They do not want it. The ceremony that is supposed to bless Moon Orchid’s arrival is performed on children who do not believe in it.' },
    c_letters: { tier: 'annotation', text: 'Moon Orchid knows these young people from her sister’s letters, and checks the people against what she has read. It is what Brave Orchid did at the airport: matching a person to an account. Here, for once, Moon Orchid is the one holding the account.' },
    c_narrate: { tier: 'annotation', reflect: 'narrate', text: 'She says aloud what they are doing, as they do it. They find it unbearable.\n\nIn a book about who gets to tell whose story, this is the one scene where Moon Orchid narrates other people to their faces. The discomfort it causes is the discomfort of being described by someone who has not asked.' },
    c_milk: { tier: 'context', text: 'They look adults in the eye, accept compliments without denying them, eat meat half-cooked and smell of milk. To Moon Orchid these are signs of something animal. In the custom she grew up with, milk was for infants.\n\nIn this family, white Americans are “ghosts.” Moon Orchid, newly arrived, finds something unhuman in her own nieces and nephews. The book keeps turning the question of who counts as fully human around.' },
    c_babies: { tier: 'context', text: 'Brave Orchid’s first two children died in China, before she emigrated; the book tells this in “Shaman.” Moon Orchid measures the living children against those two dead ones, and finds the dead ones sweeter. Her standard is the past.' },
    c_defends: { tier: 'annotation', text: 'When Brave Orchid scolds the children for their manners and their clothes, it is Moon Orchid who takes their side. She is not only a critic of them, and she is not passive: in this scene she argues with her sister on someone else’s behalf.' },
    c_laundry: { tier: 'context', text: 'For Chinese immigrants in the exclusion era, hand laundries were one of the few trades open to them, and laundry work became one of the most common Chinese American livelihoods. Brave Orchid was a doctor in China. In America she irons shirts from six in the morning.' },
    c_americans: { tier: 'annotation', text: 'Moon Orchid calls the Chinese people she sees in Chinatown “Americans.” Brave Orchid finds this silly: they are overseas Chinese.\n\nIt is a disagreement about who belongs to which country, and the one with the authority to settle it is the sister who has lived here for decades.' },
    c_chua: { tier: 'criticism', by: 'Chua, 1991', text: 'Cheng Lok Chua reads *ghost* in *The Woman Warrior* as a word with many referents: the dead, the uncanny, and, in the family’s speech, white Americans. In his reading, being a ghost can also be a chosen and productive estrangement, not only a loss of self.\n\nThe sisters’ quarrel over the word *Americans* is a quarrel over that map: who is solid, who is foreign, and who is the ghost.' },
    c_scorch: { tier: 'annotation', text: 'At the iron she scorches a shirt and is sent to rest. Nothing in the book suggests she cannot learn. It is the heat, the speed and the fact that she has never worked.' },
    c_crate: { tier: 'annotation', reflect: 'crate', text: 'She asks for company back to Chinatown. Her sister keeps working and sets out a crate for her to sit on. Moon Orchid’s request is answered with a seat beside the work.' },
    c_mahjong: { tier: 'annotation', text: 'In Chinatown, Brave Orchid’s friends joke about blackmailing the husband, or beating him. Moon Orchid takes it as a joke and plays mahjong. The community has already turned her marriage into a story with a plot. She declines the plot and plays a game.' },
    c_towels: { tier: 'annotation', text: 'Late in the afternoons, when the laundry has cooled, she folds towels. It is the one work she does here, and she can do it only once the room is bearable.' },
    c_ready: { tier: 'annotation', text: 'The same question every day, and the same answer: not yet. Only one of the two is treated as information. The question is repeated until the answer stops mattering.' },
    c_bigamy: { tier: 'annotation', text: 'Moon Orchid has read that an American man may not have two wives. She is right, and the husband will make exactly this argument in Los Angeles. Brave Orchid waves the law aside.\n\nThe one piece of knowledge Moon Orchid brings to the plan is accurate, and it is dismissed.' },
    c_fricker: { tier: 'criticism', by: 'Fricker, 2007', text: 'Miranda Fricker writes that testimonial injustice “occurs when prejudice causes a hearer to give a deflated level of credibility to a speaker’s word.”\n\nWhether the word *prejudice* fits a loving sister is a fair question. But the pattern is visible: Moon Orchid says something true about the country she has just arrived in, and it carries no weight with the person making the plan.' },
    c_glenn: { tier: 'context', by: 'Glenn, 1983', text: 'For about thirty years the husband has lived in America and sent money to his wife in Hong Kong, without ever asking her to join him. The sociologist Evelyn Nakano Glenn called this pattern the “split household”: for generations, exclusion laws kept Chinese wives out while their husbands worked in the United States, and families were held together by remittances across the Pacific.\n\nThe book makes this husband’s silence his own choice. But Moon Orchid has lived her whole married life inside the old shape of it.' }
  };

  /* ------------------------------------------------------------------ seen as */
  const seen = {
    young: { cite: 'The airport', as: 'A young woman in Western clothes, the sister Brave Orchid remembers.', by: 'Brave Orchid', text: 'A small, thin woman with grey hair in a knot, in a grey wool suit and pearls.' },
    narrate: { cite: 'The house', as: 'An aunt who will not stop describing them.', by: 'Brave Orchid’s children', text: 'A newcomer learning a family she knew only from letters, out loud.' },
    crate: { cite: 'The laundry', as: 'Someone to be given a seat while the work goes on.', by: 'Brave Orchid', text: 'A woman asking for company to go back to Chinatown.' }
  };

  /* ------------------------------------------------------------------ scenes */
  const scenes = {};

  scenes.arrivals = {
    mv: 'I', title: 'Arrivals', place: 'San Francisco International Airport', art: 'airport', first: 'a1',
    beats: {
      a1: { focus: 'bo',
        steps: [
          N('[[This chapter is told without an “I”.|c_noI]] What follows is [[one version of it|c_versions]].'),
          R('Brave Orchid is sixty-eight. She has taken a day off from the laundry and has been at the San Francisco airport for more than nine hours, waiting for the plane from Hong Kong that is bringing her younger sister. She has been awake since before it took off. All that time she has been [[keeping the plane in the air|c_aloft]] by concentrating on it.'),
          R('Her grown children could drive, so they came, but they cannot sit still; they wander the terminal. Moon Orchid’s daughter, [[whom Brave Orchid also brought to America|c_niece]], sits quietly beside her.')
        ],
        margin: ['c_shaman'],
        next: 'a2' },
      a2: { focus: 'bo',
        steps: [
          R('Soldiers and sailors pass through the terminal, and Brave Orchid thinks of her son, who is serving in Vietnam. Now [[she holds up his ship as well as the plane|c_ship]], and her head begins to ache.'),
          R('When the passengers start to come through, she sees a young woman in Western clothes and decides that this is her sister. Her niece corrects her: her mother [[will look much older|c_young]].'),
          R('Then a small, thin woman comes through, with grey hair in a knot, a grey wool suit and pearls. Brave Orchid is startled. Each sister is shocked at [[how old the other has become|c_old]], and all the way to Stockton in the car they keep exclaiming over it.', { show: ['arrived', 'bags'] }),
          SEEN('young')
        ],
        account: { who: 'niece', text: 'Her mother would look much older than that.' },
        reading: {
          id: 'young', prompt: 'Brave Orchid claims a young stranger as her sister. What does the mistake tell you?',
          options: [
            { k: 'time', label: 'Time', sub: 'Decades have passed; anyone would misremember.', text: 'True as far as it goes, and the book gives both sisters the same shock. But only one of them claimed a stranger. Brave Orchid was not just unsure; she was certain, and wrong, and needed her niece to correct her. The error has a direction: toward the sister who fits the picture.' },
            { k: 'plan', label: 'A plan', sub: 'She is looking for a sister young enough for what she has planned.', text: 'Brave Orchid has already arranged the marriage that brought Moon Orchid over and will spend the chapter preparing her to reclaim a husband. A young woman in Western clothes looks like someone who could do that. The text does not say she reasoned like this; that link is yours. But the chapter supports it: from here on, Brave Orchid keeps seeing the sister the plan requires.' },
            { k: 'unseen', label: 'Not seen', sub: 'The first thing America does to her is fail to recognize her.', text: 'This is the reading the chapter builds toward. At the airport her own sister does not know her; in Los Angeles her husband will not recognize her either. Notice who supplies the correction here: her daughter, the one person present who knows her as she now is. Notice, too, that it is a correction, not a recognition. Brave Orchid has to be told.', tier: 'annotation' },
            { k: 'open', label: 'Cannot be said', sub: 'One glance at an airport proves nothing.', text: 'A fair caution. One misidentification in a crowd is a small thing. The chapter does not make much of it either; it moves straight on. It is the pattern that follows that will give it weight, which is why this game has started a list called *Seen as*.' }
          ]
        },
        next: { scene: 'gifts' } }
    }
  };

  scenes.gifts = {
    mv: 'II', title: 'Presents', place: 'Stockton · Brave Orchid’s house', art: 'living', first: 'g1', show: ['gifts'],
    beats: {
      g1: { focus: 'mo',
        steps: [
          R('At the house, Brave Orchid wants to begin with a ceremony for luck. Moon Orchid wants to begin with her presents, and has everyone open them first. Among them are paper cutouts of [[Fa Mu Lan|c_famulan]], the woman warrior. The children start playing with theirs at once, in front of the giver, which their mother privately thinks greedy.'),
          R('For her sister Moon Orchid has brought a silk dress lined with wool, which Brave Orchid thinks impractical. For the girls, [[jade bracelets, which their mother forbids|c_bracelets]]. Brave Orchid finds the whole display frivolous and extravagant, and worries that so much giving will draw the envy of [[jealous gods|c_gods]].')
        ],
        margin: ['c_chin'],
        next: 'g2' },
      g2: { focus: 'bo',
        steps: [
          R('The luck ceremony happens anyway. The children are fed candy, because [[a beginning must be sweet|c_sweet]], and they do not want to eat it.'),
          R('Afterwards Brave Orchid takes the presents she considers [[useful|c_useful]] and stores them in the back bedroom. That is where Moon Orchid will stay, until a permanent plan has been made for her.')
        ],
        margin: ['c_wong'],
        word: {
          id: 'gifts', prompt: 'How will the household remember what Moon Orchid brought?',
          options: [
            { k: 'bo', label: '“Extravagant things nobody needed.”', sub: 'Brave Orchid’s judgment', account: { who: 'bo', text: 'Frivolous presents, too many of them, and nothing useful.' },
              text: 'This is the version the house actually adopts: the useful items go into storage, and the rest are judged frivolous. Keep in mind who is doing the sorting. A guest’s gifts are her way of arriving with something to offer. Brave Orchid’s categories, useful and useless, are about to be applied to the guest herself.' },
            { k: 'mo', label: '“A present for each person.”', sub: 'What the gifts were to her', account: { who: 'mo', text: 'She had chosen something for each of us.' },
              text: 'This keeps her intention in the account. Notice that the book never gives Moon Orchid a sentence explaining her gifts. Her meaning has to be inferred from what she did: she insisted on giving before anything else happened. If you keep this version, you are reading her through her actions, because the household recorded only its verdict.' }
          ]
        },
        next: { scene: 'children' } }
    }
  };

  scenes.children = {
    mv: 'II', title: 'The Children', place: 'Stockton · Brave Orchid’s house', art: 'living', first: 'c1',
    beats: {
      c1: { focus: 'mo',
        steps: [
          R('Moon Orchid studies her sister’s grown children closely, recalling what she knows of their habits [[from her sister’s letters|c_letters]]. She follows them about and [[says aloud what each of them is doing, as they do it|c_narrate]]. They find it maddening.'),
          R('She watches them study, and cook with machines she has never used. She notices that they look adults straight in the eye, accept compliments, eat meat half-raw and [[smell of milk|c_milk]], and privately thinks them savage. Next to [[the two babies her sister lost in China|c_babies]], these living children seem sullen to her.'),
          SEEN('narrate')
        ],
        account: { who: 'children', text: 'Aunt would not stop describing us.' },
        next: 'c2' },
      c2: { focus: 'mo',
        steps: [
          R('And yet, when Brave Orchid scolds the children for their manners and their clothes, [[it is Moon Orchid who defends them|c_defends]].')
        ],
        reading: {
          id: 'narrate', prompt: 'Moon Orchid narrates the children to their faces. What is she doing?',
          options: [
            { k: 'symptom', label: 'An early sign', sub: 'Odd behavior that foreshadows her breakdown.', text: 'This is the family’s retrospective way of reading her, and the danger of it is that everything she did becomes evidence once the ending is known. Nothing in the text marks this as illness. It marks it as irritating. If you read it as a symptom, you are reading the first half of the chapter from the asylum backwards.' },
            { k: 'learning', label: 'Learning them', sub: 'A newcomer making sense of strangers out loud.', text: 'The text supports this. She is checking the young people against her sister’s letters, the only account of them she has. Speaking what she sees is how she fixes it. It looks odd because she does in public what everyone else does privately.' },
            { k: 'gaze', label: 'Looking back', sub: 'For once she is the one describing, not the one described.', text: 'This is the only scene in the chapter in which Moon Orchid holds the narrative and other people are its objects. Robert G. Lee (1991) reads the climax of the chapter as a matter of looking: her husband’s American way of seeing her is what silences her. Here, early, the direction is reversed, and the people being looked at do not like it.', tier: 'criticism', by: 'Lee, 1991' },
            { k: 'open', label: 'Cannot be said', sub: 'The book gives the habit, not the reason.', text: 'Fair. Kingston reports the behavior and the irritation and never explains the motive. Notice that the irritation is recorded and the motive is not. The account of this scene, as the family would tell it, is the account of how she annoyed them.' }
          ]
        },
        next: { scene: 'laundry' } }
    }
  };

  scenes.laundry = {
    mv: 'II', title: 'The Laundry', place: 'Stockton · the family laundry, and Chinatown', art: 'laundry', first: 'l1',
    beats: {
      l1: { focus: 'bo',
        steps: [
          R('Brave Orchid and her husband open [[the laundry|c_laundry]] at six in the morning. She also walks her sister and her niece through Chinatown.'),
          R('Moon Orchid looks at the Chinese people in the street and [[calls them Americans|c_americans]]. Brave Orchid thinks this is silly. They are overseas Chinese.')
        ],
        margin: ['c_chua'],
        word: {
          id: 'americans', prompt: 'Which word does the account keep for the people in Chinatown?',
          options: [
            { k: 'mo', label: '“Americans”', sub: 'Moon Orchid’s word', account: { who: 'mo', text: 'In Chinatown, she called the Chinese people Americans.' },
              text: 'Her word describes what she sees: people at home in this country, in a way she is not. From Hong Kong, the diaspora looks American. It is also, from the woman who will soon be told she cannot belong here, an accurate observation about who belongs.' },
            { k: 'bo', label: '“Overseas Chinese”', sub: 'Brave Orchid’s word', account: { who: 'bo', text: 'They are overseas Chinese, whatever she called them.' },
              text: 'Her word insists that being Chinese survives emigration, and it is the word of someone who has spent decades here holding on to that. It is also the word with authority in this house. Notice which sister gets to settle what the people in the street are: the one who has lived here long enough to own the definitions.' }
          ]
        },
        next: 'l2' },
      l2: { focus: 'mo', show: ['ironing'],
        steps: [
          R('In the laundry, Moon Orchid tries the ironing and [[scorches a shirt|c_scorch]]. She is sent to rest.', { show: ['burned'] }),
          R('She would like someone to take her back to Chinatown. Brave Orchid keeps working, and [[sets out a crate for her to sit on|c_crate]].', { wish: 'chinatown', wishText: 'Company back to Chinatown.', wishStatus: 'Not given. Her sister went on working and set out a crate.' }),
          SEEN('crate')
        ],
        next: 'l3' },
      l3: { focus: 'mo', show: ['crate', 'towels'],
        steps: [
          R('Later Brave Orchid does take her to Chinatown, where her friends joke about blackmailing the husband, or beating him up. Moon Orchid treats it as a joke, and [[plays mahjong|c_mahjong]].'),
          R('After that, in the late afternoons, when the laundry has cooled, [[she folds towels|c_towels]]. Brave Orchid finds her slow.')
        ],
        reading: {
          id: 'laundry', prompt: 'Brave Orchid finds her sister slow. What is the laundry measuring?',
          options: [
            { k: 'use', label: 'Usefulness', sub: 'A person is worth what she can do.', tier: 'criticism', by: 'Wong, 1993', text: 'This is Sau-ling Cynthia Wong’s Necessity at work. The laundry was built for survival, and the household values everyone in it by output. By that measure Moon Orchid fails, and the chapter lets you feel how quickly failing at a job slides into being a kind of person.' },
            { k: 'class', label: 'A different life', sub: 'She has never worked; her sister always has.', text: 'The text supports this plainly. Moon Orchid has lived for thirty years on her husband’s remittances in Hong Kong. Brave Orchid trained as a doctor and now irons from six in the morning. The laundry measures the gap between two lives the same family produced, and treats the result as a fact about Moon Orchid’s nature.' },
            { k: 'age', label: 'Age', sub: 'She is past the age of learning a hard trade.', text: 'Possible, but notice that her sister is older and works the presses all day. Age alone does not explain it. If you reach for age, ask why it is her age, and not Brave Orchid’s, that the scene seems to count.' },
            { k: 'open', label: 'Cannot be said', sub: 'The book records the verdict, not a measure.', text: 'Fair. The book gives you the scorched shirt, the crate, the towels and the judgment that she is slow. What the judgment leaves out is the folded towels themselves: the work she did manage, on the terms she could manage it.' }
          ]
        },
        next: { scene: 'evenings' } }
    }
  };

  scenes.evenings = {
    mv: 'II', title: 'Not Yet', place: 'Stockton · the weeks after', art: 'kitchen', first: 'e1',
    beats: {
      e1: { focus: 'bo',
        steps: [
          R('Every day [[Brave Orchid asks her sister whether she is ready|c_ready]] to go to her husband, and every day Moon Orchid says no.', { wish: 'notyet', wishText: 'Not yet.', wishStatus: 'Said every day. It held until her daughter had to go home.' }),
          R('For [[about thirty years|c_glenn]] the husband has sent Moon Orchid money, and never once asked her to come to him.')
        ],
        next: 'e2' },
      e2: { focus: 'bo',
        steps: [
          R('Then Moon Orchid’s daughter has to go back to Los Angeles, and Brave Orchid decides they will all go with her.'),
          R('Moon Orchid has read that it is [[against the law|c_bigamy]] for an American man to have more than one wife. Brave Orchid says the law does not matter.')
        ],
        margin: ['c_fricker'],
        word: {
          id: 'law', prompt: 'Moon Orchid has the law right. What goes into the account of that evening?',
          options: [
            { k: 'bo', label: '“The law doesn’t matter.”', sub: 'Brave Orchid’s ruling', account: { who: 'bo', text: 'The law did not matter; she was his wife.' },
              text: 'This is what happens in the book: the ruling stands and the trip goes ahead. Mark the moment. In Los Angeles the husband will use exactly the argument Moon Orchid raised here, and it will be decisive. Her knowledge was right, and it was not allowed to count.' },
            { k: 'mo', label: '“She knew it was against the law.”', sub: 'What Moon Orchid knew', account: { who: 'mo', text: 'She knew, before anyone left, that the law was on his side.' },
              text: 'Keeping her knowledge in the account changes what the trip to Los Angeles looks like: not a frightened woman pushed into a confrontation she did not understand, but a woman who understood it better than the person pushing her. The book gives you the evidence for this version. The household did not keep it.' }
          ]
        },
        next: { scene: 'previewEnd' } }
    }
  };

  scenes.previewEnd = {
    mv: 'III', title: 'The Rehearsal', place: 'Next', art: 'kitchen', first: 'p1', end: true,
    beats: {
      p1: { focus: 'bo',
        steps: [
          R('After dinner, Brave Orchid begins to coach her sister in what she must say to her husband.'),
          N('The first preview ends here. Movement III follows the coaching as the book gives it: the claim to be first wife, the advice to dye her hair and take a job, and Moon Orchid’s own suggestion that the second wife could stay and help with the housework. Then the drive to Los Angeles.')
        ] }
    }
  };

  UH.MO = {
    who: WHO, movements: MOVEMENTS, scenes, clues, seen, start: 'arrivals',
    title: 'Before She Answers',
    sub: 'Moon Orchid · from Maxine Hong Kingston’s The Woman Warrior (1976)',
    notice: 'A close reading of “At the Western Palace.” Events are retold from the book; nothing is invented.',
    contentNote: 'This chapter includes abandonment, psychological distress, institutionalization and death.',
    howTo: [
      'Each passage marked Retold is an event from the book, put in this game’s words. The Woman Warrior is still in copyright, so Kingston’s sentences are not quoted; speech is reported, never invented.',
      'Underlined phrases open notes, marked by kind: annotation (this game’s reading), context (history outside the book), criticism (a named critic, paraphrased).',
      'At key moments you choose a reading, or choose whose word the account keeps. The analysis follows your choice. Under the picture is the account: how each moment is being told. “Seen as” collects how she is seen, set against what the text shows.'
    ]
  };
})();
