/* Before She Answers: the Moon Orchid chapter. Authored content only.

   The Woman Warrior (1976) is in copyright, so nothing here quotes Kingston. Every passage marked "Retold" is a
   paraphrase of an event in "At the Western Palace" (and, in Movement V, "A Song for a Barbarian Reed Pipe"),
   with no invented events or speech. The analysis follows the author's essay, "Hauntology in the Asian American
   Imagination: Gendered Futurity and Ghosts" (2026), and the critics named in each note.

   Markup: [[visible words|clueId]] opens a note; *words* is italic.
   Steps:  R(text, o)  a retold passage. o.show adds art tags; o.wish records something she asked for.
           N(text)     a short line in the game's own voice (never adds events)
           SEEN(id)    a "Seen as" pair
   A beat may carry a reading (an interpretation) or a word (whose version the account keeps). */
(function () {
  'use strict';
  const CH4 = 'Ch. 4 · At the Western Palace', CH5 = 'Ch. 5 · A Song for a Barbarian Reed Pipe';
  const R = (text, o) => Object.assign({ t: 'r', text, cite: CH4 }, o || {});
  const R5 = (text, o) => Object.assign({ t: 'r', text, cite: CH5 }, o || {});
  const N = text => ({ t: 'n', text });
  const SEEN = id => ({ t: 'seen', id });

  const WHO = {
    mo: { name: 'Moon Orchid' }, bo: { name: 'Brave Orchid' }, niece: { name: 'Moon Orchid’s daughter' },
    children: { name: 'Brave Orchid’s children' }, son: { name: 'Brave Orchid’s son' }, husband: { name: 'Her husband' },
    narrator: { name: 'The narrator' }, none: { name: 'No one' }
  };
  const MOVEMENTS = {
    I: { n: 'I', title: 'Arrivals' }, II: { n: 'II', title: 'The Household' }, III: { n: 'III', title: 'The Western Palace' },
    IV: { n: 'IV', title: 'Afterward' }, V: { n: 'V', title: 'The Telling' }
  };

  /* ================================================================== notes */
  const clues = {
    /* I · the airport */
    c_noI: { tier: 'annotation', text: 'Every other chapter of *The Woman Warrior* is narrated with an “I.” This one is not. The narrator steps out of her own book and tells Moon Orchid’s story in the third person, almost as if it were a story heard rather than lived, which is exactly what it is: in the next chapter she admits that she was never in Los Angeles, and that her brother told the story to her sister, who then told her.\n\nWhat we receive of Moon Orchid has therefore already passed through several people before it reaches us, and the game you are playing is one more retelling on top of these.' },
    c_versions: { tier: 'criticism', by: 'Boardman, 1991', text: 'Kathleen Boardman notes that the confrontation between Moon Orchid and her husband survives in two versions, this chapter’s and the brother’s much plainer one at the start of the next, and that Kingston refuses to settle on one. The question the book raises is not which version is true but how every account of Moon Orchid has been shaped by someone other than her.' },
    c_aloft: { tier: 'annotation', text: 'Brave Orchid believes that her concentration is what keeps the plane in the air. It is magical thinking, but it is also an accurate picture of how this family operates: people stay aloft because someone is paying attention to them.\n\nThe rest of the chapter can be read as what happens to a woman when that attention is withdrawn, first by a husband and eventually by everyone around her.' },
    c_shaman: { tier: 'criticism', by: 'VanSpanckeren, 1991', text: 'In the chapter before this one, “Shaman,” Brave Orchid is a heroine: a doctor trained in China who sits up through the night in a haunted room and talks a ghost away. Kathryn VanSpanckeren reads “At the Western Palace” as a cautionary sequel to that chapter. The same force of will that once defeated a ghost in China is now turned onto her sister in America, and it does not work the same way.' },
    c_ship: { tier: 'context', text: 'Her son is serving in the Navy during the war in Vietnam, and Brave Orchid now holds up his ship as well as the plane until her head aches. Like Moon Orchid, he is a family member who is absent and cannot be seen, kept present only by the effort of someone thinking about him.' },
    c_niece: { tier: 'context', text: 'Brave Orchid brought her niece to America as well, by arranging her marriage to a Chinese American, and it is that marriage that allowed Moon Orchid to follow. Before Moon Orchid ever boards the plane, her journey has already been planned by her sister, using her daughter’s marriage as the route.' },
    c_young: { tier: 'annotation', reflect: 'young', text: 'Brave Orchid is looking for the sister she remembers, and the woman she claims is young and dressed in Western clothes. In other words, she recognizes a picture from the past rather than the person in front of her, and it takes the niece to tell her that her mother will look much older.\n\nThe very first thing that happens to Moon Orchid in America is that she is not recognized. Keep this in mind for Los Angeles, where it happens again, and where it is final.' },
    c_old: { tier: 'annotation', text: 'Both sisters are shocked at how much the other has aged, and in the car to Stockton they keep returning to it, as if the shock has to be repeated before it can be believed.\n\nAge is central to what follows. Moon Orchid arrives in her sixties to reclaim a marriage from thirty years before, into a country and a family that have already decided what kind of future someone her age can have.' },
    /* II · the household */
    c_famulan: { tier: 'annotation', text: 'Fa Mu Lan is the woman warrior of the book’s second chapter, the heroine the narrator imagines becoming: trained in the mountains, avenging her village, with her family’s grievances carved into her back.\n\nHere she arrives flattened into a paper cutout, a souvenir from Hong Kong handed to children who play with it immediately. The warrior of the book’s title enters this chapter as a decoration, and in this chapter the woman who is supposed to fight will not be able to.' },
    c_chin: { tier: 'criticism', by: 'Chin, 1991', text: 'Frank Chin famously attacked Kingston’s Fa Mu Lan as a fake. In “Come All Ye Asian American Writers of the Real and the Fake,” he argues that she grafted onto the heroine the tattooed back that belongs to the male general Yue Fei, and gave white readers a feminized, invented China.\n\nThe quarrel is about who has the right to retell a story and how faithfully, which is also the question this chapter raises about Moon Orchid herself.' },
    c_gods: { tier: 'annotation', text: 'Brave Orchid judges the gifts through an economy of luck, in which too much generosity attracts envy from gods as well as from people. To her, extravagance is not only wasteful but dangerous.' },
    c_wong: { tier: 'criticism', by: 'Wong, 1993', text: 'Sau-ling Cynthia Wong reads Asian American literature through a tension she calls Necessity and Extravagance: on one side survival, thrift and usefulness, and on the other play, pleasure and expression that serve no practical end.\n\nThe two sisters fall almost exactly along this line. Moon Orchid has lived for thirty years on money sent from America and has never had to work, while Brave Orchid runs a laundry. Each sister’s sense of what a person is *for* comes from the life she has been given.' },
    c_useful: { tier: 'annotation', text: 'Brave Orchid puts the useful presents away in the back bedroom, which is also where Moon Orchid will sleep until a permanent plan has been made for her. The guest’s gifts are sorted by their usefulness, and in a way the guest herself is stored alongside them.' },
    c_bracelets: { tier: 'annotation', text: 'The jade bracelets are forbidden because the girls are too young and would break them playing baseball. The gift is refused on the grounds of an American childhood that Moon Orchid has never seen and cannot picture.' },
    c_sweet: { tier: 'context', text: 'In the welcoming ritual Brave Orchid insists on, the children are fed candy because a beginning must be sweet, and they do not want to eat it. The ceremony meant to bless Moon Orchid’s arrival is performed on American children who do not believe in it.' },
    c_thirty: { tier: 'context', by: 'Glenn, 1983', text: 'For about thirty years the husband has lived in America and sent money to his wife in Hong Kong without ever asking her to join him. The sociologist Evelyn Nakano Glenn called this pattern the “split household”: for generations, exclusion laws kept Chinese wives out of the United States while their husbands worked there, and families were held together by remittances across the Pacific.\n\nThe book makes this husband’s silence his own choice. Still, Moon Orchid has lived her entire married life inside the old shape of this arrangement.' },
    c_twoclocks: { tier: 'annotation', text: 'Whilst the marriage is still ongoing and very much alive in Moon Orchid’s life, it is essentially nonexistent in her husband’s. He has built another life in the meantime, with a new wife, a new profession and a new language in a new place.\n\nThis is the temporal split the whole chapter turns on. Everyone around her has moved forward in time, while she is still living in the year he left.' },
    c_firstwife: { tier: 'annotation', text: 'Brave Orchid’s plan is a plan for restoration. Moon Orchid is to walk back into the position she held thirty years ago, as if the decades in between could be undone by the right speech. The script assumes that the past is still waiting for her, which is exactly the assumption Los Angeles will break.' },
    c_dye: { tier: 'annotation', text: 'Dyeing her grey hair black is the clearest instruction in the plan, and the most revealing. To reclaim her place she has to look younger, as if her age, the visible sign of the thirty years she was left alone, were the problem to be hidden.' },
    c_maid: { tier: 'criticism', by: 'Peeren, 2014', text: 'Brave Orchid tells her sister to take a job as a hotel maid to prove her worth. Esther Peeren’s *The Spectral Metaphor* names servants and domestic workers among the figures a society treats as “living ghosts,” valued precisely for being unobtrusive and present only through their labor.\n\nThe plan to make Moon Orchid visible to her husband begins by proposing that she take up one of the least visible positions America offers.' },
    c_share: { tier: 'annotation', reflect: 'share', text: 'Moon Orchid’s own idea is completely different from her sister’s. She would let the second wife stay, and the second wife could help with the housework. Brave Orchid thinks this is foolish.\n\nIt is easy to read this as passivity, but it is also the only plan in the chapter that Moon Orchid proposes herself, and it imagines a household in which nobody has to be thrown out. It is set aside without discussion.' },
    c_useless: { tier: 'annotation', text: 'The niece, who is unhappy in the marriage Brave Orchid arranged for her, sits through the whole lecture. Brave Orchid privately dismisses her as decorative and useless. The household’s measure of a person, usefulness, is applied to the daughter in the same breath as to the mother.' },
    c_letters: { tier: 'annotation', text: 'Moon Orchid knows these young people only through her sister’s letters, and checks the people in front of her against what she has read. It is the same thing Brave Orchid did at the airport, matching a person to an earlier account, except that this time Moon Orchid is the one holding the account.\n\nThe letters matter later. After Los Angeles, Moon Orchid stops writing hers.' },
    c_narrate: { tier: 'annotation', reflect: 'narrate', text: 'She says out loud what each of them is doing, as they do it, and they find it unbearable.\n\nIn a book so concerned with who gets to tell whose story, this is the one scene in which Moon Orchid narrates other people to their faces. The discomfort it produces is the discomfort of being described by someone who has not asked, which is the condition she herself lives in for the rest of the chapter.' },
    c_haunt: { tier: 'criticism', by: 'Szmańko, 2021', text: 'Klara Szmańko points out that this is a narration within a narration: in a chapter told in the third person, Moon Orchid sets up her own running third-person account of the household. In Szmańko’s reading she haunts the children, with a harmless curiosity that turns into attachment.\n\nIn this house, for now, the newcomer is the one doing the haunting. It is a reversal of where the chapter is going.' },
    c_milk: { tier: 'context', text: 'The children look adults straight in the eye, accept compliments, eat meat half-raw and smell of milk, which in the custom Moon Orchid grew up with was only for infants. To her these are signs of something animal.\n\nIn this family the white Americans are “ghosts,” and here the newly arrived aunt finds something not quite human in her own nieces and nephews. The book keeps turning the question of who counts as fully human around.' },
    c_babies: { tier: 'context', text: 'Brave Orchid’s first two children died in China before she emigrated, which the book tells in “Shaman.” Moon Orchid measures the living children against those two dead babies and finds the dead ones sweeter. Her standard is the past.' },
    c_defends: { tier: 'annotation', text: 'When Brave Orchid scolds the children for their manners and their clothes, it is Moon Orchid who takes their side. She is not only their critic, and she is not simply passive: in this scene she argues against her sister on someone else’s behalf.' },
    c_laundry: { tier: 'context', text: 'For Chinese immigrants in the exclusion era, hand laundries were one of the few trades left open to them, and laundry work became one of the most common Chinese American livelihoods. Brave Orchid was a doctor in China; in America she irons shirts from six in the morning.' },
    c_americans: { tier: 'annotation', text: 'Moon Orchid calls the Chinese people she sees in Chinatown “Americans,” and Brave Orchid finds this silly, since to her they are overseas Chinese.\n\nIt is a disagreement about who belongs to which country, and the person with the authority to settle it is the sister who has lived here for decades. Remember the word when we reach Los Angeles: the husband, as the sisters see him, looks and even smells like an American.' },
    c_chua: { tier: 'criticism', by: 'Chua, 1991', text: 'Cheng Lok Chua reads *ghost* in *The Woman Warrior* as a word with many meanings: the dead, the uncanny, and, in the family’s speech, white Americans. In his reading, being a ghost can also be a chosen and productive kind of estrangement rather than only a loss of self.\n\nThe sisters’ disagreement over the word *Americans* is a disagreement over this map, over who is solid, who is foreign, and who is the ghost.' },
    c_scorch: { tier: 'annotation', text: 'At the ironing board she scorches a shirt and is sent to rest. Nothing in the book suggests that she is unable to learn. What defeats her is the heat, the speed, and the fact that she has never had to work.' },
    c_crate: { tier: 'annotation', reflect: 'crate', text: 'She asks for someone to take her back to Chinatown. Her sister keeps working and sets out a crate for her to sit on, so that her request is answered with a seat next to the work.' },
    c_peeren: { tier: 'criticism', by: 'Peeren, 2014', text: 'Peeren’s living ghosts include servants and domestic workers, whose ghostliness lies in being unobtrusive, present only through the work they do. The laundry offers Moon Orchid that kind of place, and she cannot take it: since she cannot do the work, she cannot disappear into it either. Instead she is set aside, on a crate by the door, neither part of the work nor free of it.' },
    c_mahjong: { tier: 'annotation', text: 'In Chinatown, Brave Orchid’s friends joke about blackmailing the husband, or beating him up. Moon Orchid takes it as a joke and plays mahjong. The community has already turned her marriage into a story with a plot, and she declines the plot and plays a game.' },
    c_towels: { tier: 'annotation', text: 'In the late afternoons, once the laundry has cooled, she folds towels. It is the one task she manages here, and she can only do it once the room becomes bearable.' },
    c_ready: { tier: 'annotation', text: 'The same question every day, and the same answer: not yet. Only one of the two is treated as information, and the question is repeated until the answer stops mattering.\n\n*Not yet* is also the one claim on time that Moon Orchid makes in this part of the book. It defers a future that others have already scheduled for her. It holds for weeks, and then her daughter’s travel plans decide it instead.' },
    c_bigamy: { tier: 'annotation', text: 'Moon Orchid has read that an American man may not have two wives. She is right, and in Los Angeles the husband will make exactly this argument, decisively. Brave Orchid waves the law aside.\n\nThe one piece of knowledge Moon Orchid brings to the plan is accurate, and it is dismissed.' },
    c_fricker: { tier: 'criticism', by: 'Fricker, 2007', text: 'Miranda Fricker writes that testimonial injustice “occurs when prejudice causes a hearer to give a deflated level of credibility to a speaker’s word.” Whether *prejudice* is the right word for a loving sister is a fair question. The pattern itself is visible, though: Moon Orchid says something true about the country she has just arrived in, and it carries no weight with the person making the plan.' },
    /* III · Los Angeles */
    c_empress: { tier: 'annotation', text: 'Brave Orchid tells the story of an emperor with four wives at the four points of the compass. In her telling she is the good Empress of the East, the true wife married in China, and Moon Orchid has to free the emperor from the Empress of the West who has taken him.\n\nThe tale gives the confrontation a shape: a rightful wife, a usurper, a captive husband, a heroic rescue. What it cannot do is account for a husband who is not captive at all.' },
    c_casting: { tier: 'annotation', text: 'Notably, Brave Orchid casts herself as the Empress of the East, and Moon Orchid becomes the one sent to the Western Palace. The heroine of the story is the sister telling it. It is the same move the family keeps making: someone else’s version of Moon Orchid’s life, with someone else in the leading role.' },
    c_liu: { tier: 'context', by: 'Liu, 1996', text: 'The phrase that gives this chapter its title, the Western Palace, comes from Chinese stories about imperial households with several wives. Critics such as Toming Jun Liu have read Kingston’s handling of it as cultural translation, an old form carried into a country where its rules no longer apply. In California, as Moon Orchid has already read, the law recognizes one wife.' },
    c_turnback: { tier: 'annotation', text: 'She asks her nephew to turn the car around, and then asks to see her grandchildren first. Both requests are about time: not now, or something else first. Both are overruled.' },
    c_window: { tier: 'annotation', text: 'Brave Orchid even suggests that they might have to climb in through a window and simply act as if Moon Orchid belongs in the house. Moon Orchid plays along for a moment and then says she cannot do it.\n\nThe image says a great deal about the plan: the way back into her own marriage is imagined as breaking in.' },
    c_tower: { tier: 'criticism', by: 'Szmańko, 2021', text: 'The husband practices in a tall downtown building of glass and chrome. Klara Szmańko reads this clinic as a figure for the United States itself, a polished surface laid over hard immigrant lives.\n\nMoon Orchid is too frightened to go up. Brave Orchid goes in alone.' },
    c_dropin: { tier: 'annotation', text: 'The receptionist tells Brave Orchid that the doctor is a brain surgeon and does not see patients who simply walk in. In this building there is no category for Moon Orchid at all: she is not a patient, not an appointment, not someone the front desk has a word for.' },
    c_lure: { tier: 'annotation', text: 'To get him downstairs, Brave Orchid sends her son up to say that someone has been hurt in an accident. The only way to bring the husband to his wife is through a story that is not true, which is fitting in a chapter where every approach to Moon Orchid goes through a story.' },
    c_slap: { tier: 'annotation', text: 'While they wait, Moon Orchid cries at the thought of seeing him, and Brave Orchid slaps and pinches her cheeks to bring back some color. Even her face is being prepared for him by someone else.' },
    c_youth: { tier: 'annotation', text: 'As the sisters see him, he has black hair and no wrinkles, and he looks and smells like an American. In this country, they think, a man can somehow keep his youth.\n\nHis youth is the visible form of his access to the future. He has moved forward in time with America, while the two women in the back seat have aged in the past he left behind. We see him only through their eyes, so how he achieved this remains as closed to us as it is to them.' },
    c_notknow: { tier: 'annotation', reflect: 'car', text: 'He does not recognize her. He takes the two old women in the back of his car for strangers, and addresses them as grandmothers.\n\nAt the airport her sister failed to recognize her and had to be corrected. Here there is no one to correct him, and when he is finally told who she is, recognition still does not follow.' },
    c_seat: { tier: 'annotation', text: 'He sits in the front of the car, and the front seat stands between him and the two women behind. Moon Orchid has crossed an ocean to reach him and is now within arm’s length of him, and still the distance has not closed. She is visible enough to be spoken to and yet transparent enough to be refused.' },
    c_hardness: { tier: 'annotation', reflect: 'hardness', text: 'He tells her she cannot belong here, that she does not have the *hardness* this country requires.\n\nHardness is the quality of his own successful assimilation, and it is coded as masculine. The deferential, dependent femininity that made Moon Orchid a proper wife in the life she was given is exactly what disqualifies her in the life he chose. The terms for belonging in America are terms she was raised never to meet.' },
    c_lee: { tier: 'criticism', by: 'Lee, 1991', text: 'Robert G. Lee reads this moment as a matter of looking. The husband regards Moon Orchid with an American way of seeing, and it is this gaze that silences her. Lee also points out that her arrival threatens his professional standing, and that neither of them escapes the racial order they live in.' },
    c_ellison: { tier: 'criticism', by: 'Szmańko, 2021', text: 'Szmańko borrows Ralph Ellison’s idea of “looking through” from *Invisible Man* to describe the husband’s gaze: he looks at people without seeing beneath their surface. In her reading, the cramped car and his scrutinizing stare are what silence Moon Orchid, and the husband who stares like this has himself become partly a ghost.' },
    c_arrest: { tier: 'annotation', text: 'He will not send her back to China, and he will not let her live in his house, because he lives as an American now and could be arrested for having two wives. It is the law Moon Orchid had read about in Stockton, the argument Brave Orchid said did not matter. In the end it is the only argument anyone needs.' },
    c_book: { tier: 'annotation', text: 'He explains that he stopped writing because he became a different person, and that his Chinese family has come to seem like people in a book he read long ago.\n\nIt is the clearest statement of Moon Orchid’s condition in the chapter. To him she is no longer a living wife but a character from the past, fixed in a story he has finished reading. Peeren’s phrase for such a figure is a living ghost.' },
    c_peerenbars: { tier: 'criticism', by: 'Peeren, 2014', text: 'Peeren argues that living ghosts are “incapable of engineering their own recognition”: they can be called into being only by others, and only on terms that make sense to the wider society.\n\nMoon Orchid fails both conditions in this car. The one person whose recognition would restore her place withholds it, and the terms on which the wider society would accept her (English, work, *hardness*) are terms she cannot satisfy.' },
    c_lunch: { tier: 'annotation', text: 'He buys them lunch. It is a courteous, almost businesslike gesture, the kind one makes for visitors, and it marks how completely she has become a visitor in her own marriage.' },
    c_silent: { tier: 'annotation', text: 'Through the whole encounter Moon Orchid hardly speaks, and on the drive away she is silent. The confrontation she was coached for at the kitchen table never happens. None of the lines prepared for her are spoken, by her or by anyone.' },
    /* IV · afterward */
    c_stoppedletters: { tier: 'annotation', text: 'In Hong Kong she wrote letters every other week. Now she stops. The woman who arrived knowing the children from letters, and who narrated everything around her out loud, withdraws from the one form of communication she had always kept up.' },
    c_listening: { tier: 'annotation', reflect: 'watched', text: 'When Brave Orchid telephones, Moon Orchid whispers that people are listening and hangs up.\n\nThis is the reversal at the center of the chapter. The woman nobody would see now believes she is seen and heard everywhere. Recognition returns, but only in the form of surveillance, and it coexists with her invisibility, since she is no more understood than before. Either way she is denied a secure place in the present.' },
    c_mexican: { tier: 'context', text: 'Her daughter reports that Moon Orchid believes Mexican ghosts are plotting against her. Los Angeles is full of people she cannot speak to, in English or in Spanish, and her fear attaches to them.\n\nThe book uses the family’s word, *ghosts*, for the people she fears. This game does not draw them, because they are not there: they belong to her fear, not to the street.' },
    c_disguise: { tier: 'annotation', text: 'Back in Stockton, Moon Orchid tells her sister she is in disguise. A woman who has been looked through by her husband now feels she must hide from everyone, which is a kind of self-erasure that completes what was done to her.' },
    c_chant: { tier: 'annotation', text: 'Brave Orchid decides that her sister has lost her spirit, and chants her name and her new address to call it home. In Chinese folk belief a frightened spirit can wander away from the body and be called back.\n\nThe ritual is striking in this context: it tries to re-register a self at the right location, as if what Moon Orchid lost were simply her place in the world.' },
    c_onestory: { tier: 'annotation', text: 'Brave Orchid tells her children that sane people can vary the stories they tell, while the insane have only one story and repeat it.\n\nIt is essentially a theory of sanity as the freedom to revise, to move on in time. Read against the rest of the chapter, it describes what has been done to Moon Orchid as much as what is wrong with her: she has been held to one story, the wife from long ago, while everyone around her revised theirs.' },
    c_boorima: { tier: 'context', text: 'The same pattern appears in Jhumpa Lahiri’s “A Real Durwan,” where Boori Ma, a refugee sweeper in Calcutta, recites the story of her lost prosperity twice a day until the building that is renovating itself into the future throws her out. Like Moon Orchid, she is physically present and yet denied any room in the present, and her repeated story is what everyone around her hears as madness.' },
    c_curse: { tier: 'annotation', text: 'When Moon Orchid begins to curse the children she once followed around and defended, Brave Orchid gives up. The household that took her in has reached the limit of what it can hold.' },
    c_committed: { tier: 'context', text: 'It is her daughter who has her committed to a California state hospital. The book says nothing about diagnosis, doctors or treatment. The institution appears only as the place she goes and does not leave.' },
    c_content: { tier: 'annotation', reflect: 'asylum', text: 'In the asylum, by Brave Orchid’s account, Moon Orchid is content: nobody there ever leaves, and everyone speaks the same language. She even has a new story.\n\nIt is the one place in America where she is understood, and it is outside time. The new story is worth noticing too. In her sister’s own terms, a person with a new story is no longer held to the old one.' },
    c_johnk: { tier: 'criticism', by: 'Johnk, 2023', text: 'Lzz Johnk reads the madwomen of *The Woman Warrior* through what they call a Mad Asian American modality, one that blurs the lines between human and ghost, past and present. Johnk cautions against whitestream readings of madness that ignore race and gender, and also against treating madness simply as tragedy or simply as rebellion.' },
    /* V · the telling */
    c_brother: { tier: 'annotation', text: 'The narrator now admits she was never in Los Angeles. Her brother drove the car; he told one of her sisters; her sister told her. His own account, she says, was short and bare, and it is she who has given the story its shape.\n\nThe whole of the previous chapter, then, is a retelling of a retelling, and the narrator suspects the plain version might be the truer one.' },
    c_crazy: { tier: 'annotation', text: 'She wonders whether every household has its own crazy woman, and fears that in hers it will be her. Crazy Mary next door, Pee-Ah-Nah the “witchwoman,” and Moon Orchid all appear in this chapter as the women she is afraid of becoming.\n\nMoon Orchid has become what the No Name aunt was in the first chapter: a story passed from mother to daughter as a warning. What happened to her could happen to you.' },
    c_resolve: { tier: 'annotation', text: 'Brave Orchid warns her children never to let their father take another wife, and doubts that she could bear it any better than her sister did. Her daughters decide never to let men be unfaithful to them, and turn to science and mathematics.\n\nThe lesson the daughters inherit is about men and fidelity. What happened to Moon Orchid as an immigrant woman in America, the language, the age, the law, the invisibility, is not part of the lesson.' }
  };

  /* ================================================================== seen as */
  const seen = {
    young: { cite: 'The airport', as: 'The sister she last saw decades ago: a young woman in Western clothes.', by: 'Brave Orchid', text: 'A small, thin woman with grey hair in a knot, in a grey wool suit and pearls.' },
    share: { cite: 'The kitchen table', as: 'A first wife who must storm back into her rightful place.', by: 'Brave Orchid', text: 'A woman who suggests the second wife could stay and help with the housework.' },
    narrate: { cite: 'The house', as: 'An aunt who will not stop describing them.', by: 'Brave Orchid’s children', text: 'A newcomer learning a family she knew only from letters, out loud.' },
    crate: { cite: 'The laundry', as: 'Someone to be given a seat while the work goes on.', by: 'Brave Orchid', text: 'A woman asking for company back to Chinatown.' },
    car: { cite: 'The car', as: 'Grandmothers. Strangers in the back seat.', by: 'Her husband', text: 'His wife of more than thirty years, an arm’s length away.' },
    hardness: { cite: 'The car', as: 'Someone without the hardness this country requires.', by: 'Her husband', text: 'A woman whose whole life was arranged around a marriage he had already left.' },
    watched: { cite: 'Los Angeles', as: 'Watched, listened to and plotted against.', by: 'Moon Orchid herself', text: 'A woman alone in her daughter’s apartment, whom no one in America has been willing to see.' },
    asylum: { cite: 'The state hospital', as: 'Insane: a woman with only one story.', by: 'Brave Orchid', text: 'Content, among women who all speak the same language, with a new story of her own.' }
  };

  /* ================================================================== scenes */
  const scenes = {};

  /* ---------------- I · Arrivals */
  scenes.arrivals = {
    mv: 'I', title: 'Arrivals', place: 'San Francisco International Airport', art: 'airport', first: 'a1',
    beats: {
      a1: { focus: 'bo',
        steps: [
          N('[[This chapter is told without an “I”.|c_noI]] What follows is [[one version of it|c_versions]].'),
          R('Brave Orchid is sixty-eight. She has taken a day off from the laundry and has been at the San Francisco airport for more than nine hours, waiting for the plane from Hong Kong that is bringing her younger sister. She has been awake since before it took off, and all that time she has been [[keeping the plane in the air|c_aloft]] by concentrating on it.'),
          R('Her grown children could drive, so they came, but they cannot sit still and keep wandering off through the terminal. Moon Orchid’s daughter, [[whom Brave Orchid also brought to America|c_niece]], sits quietly beside her.')
        ],
        margin: ['c_shaman'],
        next: 'a2' },
      a2: { focus: 'bo',
        steps: [
          R('Soldiers and sailors pass through the terminal, and Brave Orchid thinks of her son, who is serving in Vietnam. Now [[she holds up his ship as well as the plane|c_ship]], and her head begins to ache.'),
          R('When the passengers start to come through, she sees a young woman in Western clothes and decides that this is her sister. Her niece corrects her: her mother [[will look much older|c_young]].'),
          R('Then a small, thin woman comes through, with grey hair pulled into a knot, a grey wool suit and pearls. Brave Orchid is startled. Each sister is shocked at [[how old the other has become|c_old]], and all the way to Stockton in the car they keep exclaiming over it.', { show: ['arrived', 'bags'] }),
          SEEN('young')
        ],
        account: { who: 'niece', text: 'Her mother would look much older than that.' },
        reading: {
          id: 'young', prompt: 'Brave Orchid claims a young stranger as her sister. What does the mistake tell us?',
          options: [
            { k: 'time', label: 'Time', sub: 'Decades have passed, and anyone would misremember.', text: 'This is true as far as it goes, and the book gives both sisters the same shock at each other’s age. But only one of them claimed a stranger. Brave Orchid was not uncertain; she was certain and wrong, and needed her niece to correct her. The mistake has a direction, toward the sister who fits the picture she has kept.' },
            { k: 'plan', label: 'A plan', sub: 'She is looking for a sister young enough for what she has planned.', text: 'Brave Orchid has already arranged the marriage that brought Moon Orchid over, and she will spend the next weeks preparing her to reclaim a husband. A young woman in Western clothes looks like someone who could do that. The text never says Brave Orchid reasoned this way, so the connection is ours, but the chapter supports it: from here on Brave Orchid keeps seeing the sister her plan requires.' },
            { k: 'unseen', label: 'Not seen', sub: 'The first thing America does to her is fail to recognize her.', text: 'This is the reading the whole chapter builds toward. At the airport her own sister does not know her, and in Los Angeles her husband will not recognize her either. It is worth noticing who supplies the correction here: her daughter, the one person present who knows her as she is now. And it is a correction rather than a recognition, since Brave Orchid has to be told.' },
            { k: 'open', label: 'Cannot be said', sub: 'One glance in a crowd proves nothing.', text: 'A reasonable caution, since one mistake in an airport crowd is a small thing and the chapter does not dwell on it. It is the pattern that follows that gives it weight, which is why this game keeps a list called *Seen as*. By the end of the chapter it will have grown considerably.' }
          ]
        },
        next: { scene: 'gifts' } }
    }
  };

  /* ---------------- II · The Household */
  scenes.gifts = {
    mv: 'II', title: 'Presents', place: 'Stockton · Brave Orchid’s house', art: 'living', first: 'g1', show: ['gifts'],
    beats: {
      g1: { focus: 'mo',
        steps: [
          R('At the house, Brave Orchid wants to begin with a ceremony for luck. Moon Orchid wants to begin with her presents, and has everyone open them first. Among them are paper cutouts of [[Fa Mu Lan|c_famulan]], the woman warrior. The children start playing with theirs at once, in front of the giver, which their mother privately thinks is greedy.'),
          R('For her sister Moon Orchid has brought a silk dress lined with wool, which Brave Orchid thinks impractical. For the girls she has brought [[jade bracelets, which their mother forbids|c_bracelets]]. Brave Orchid finds the whole display frivolous and extravagant, and worries that so much giving will draw the envy of [[jealous gods|c_gods]].')
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
            { k: 'bo', label: 'Extravagant things nobody needed', sub: 'Brave Orchid’s judgment', account: { who: 'bo', text: 'Frivolous presents, too many of them, and nothing useful.' },
              text: 'This is the version the house actually adopts: the useful items go into storage and the rest are judged frivolous. It matters who is doing the sorting. A guest’s gifts are her way of arriving with something to offer, and Brave Orchid’s categories, useful and useless, are about to be applied to the guest herself.' },
            { k: 'mo', label: 'A present chosen for each person', sub: 'What the gifts were to her', account: { who: 'mo', text: 'She had chosen something for each of us.' },
              text: 'This keeps her intention in the account. The book never gives Moon Orchid a sentence explaining her gifts, so her meaning has to be inferred from what she did, which was to insist on giving before anything else could happen. If you keep this version, you are reading her through her actions, because the household recorded only its verdict on them.' }
          ]
        },
        next: { scene: 'plan' } }
    }
  };

  scenes.plan = {
    mv: 'II', title: 'The Plan', place: 'Stockton · the kitchen table, after dinner', art: 'dinner', first: 'p1',
    beats: {
      p1: { focus: 'bo',
        steps: [
          N('The presents are put away, and Brave Orchid turns to the reason her sister is here.'),
          R('For [[about thirty years|c_thirty]] Moon Orchid’s husband has sent her money from America, and he has [[never once asked her to come to him|c_twoclocks]]. Brave Orchid got her sister here anyway, through her niece’s marriage. Now, after dinner, she explains what Moon Orchid has to do.'),
          R('She is to go to her husband, make him feel his guilt, and [[take her place as his first wife|c_firstwife]]. She should throw out the second wife’s belongings. She should [[dye her grey hair black|c_dye]], and [[take a job as a hotel maid|c_maid]] to show that she can be useful.')
        ],
        next: 'p2' },
      p2: { focus: 'mo',
        steps: [
          R('Moon Orchid, who has never worked, listens and says very little. When she does make a suggestion, it is that the second wife could [[stay on and help with the housework|c_share]]. Brave Orchid thinks this is foolish.'),
          R('Moon Orchid’s daughter, unhappy in the marriage her aunt arranged for her, sits through all of it. Brave Orchid privately [[dismisses her as decorative and useless|c_useless]].'),
          SEEN('share')
        ],
        word: {
          id: 'plan', prompt: 'Two plans have been spoken at this table. Which one does the account carry forward?',
          options: [
            { k: 'bo', label: 'Reclaim the place of first wife', sub: 'Brave Orchid’s script', account: { who: 'bo', text: 'She was going to reclaim her place as his first wife.' },
              text: 'This is the plan that is carried forward in the book, all the way to Los Angeles. It is a plan for restoration, in which thirty years can be undone by the right speech, and it is spoken entirely by someone other than the woman who has to carry it out. Keep track of how much of it is ever actually said.' },
            { k: 'mo', label: 'Let the second wife stay', sub: 'Moon Orchid’s own idea', account: { who: 'mo', text: 'She would have let the second wife stay.' },
              text: 'Keeping this version records the only plan Moon Orchid proposes herself. It is not heroic, and Brave Orchid finds it foolish, but it imagines a household in which nobody has to be removed, and it does not require her to become someone else first. The book records the idea and drops it, and the trip goes ahead on her sister’s terms.' }
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
          N('The plan is set aside for now. In the days that follow, Moon Orchid tries to learn the household.'),
          R('She studies her sister’s grown children closely, recalling what she knows of their habits [[from her sister’s letters|c_letters]]. She follows them around and [[says out loud what each of them is doing, as they do it|c_narrate]]. [[They find it maddening.|c_haunt]]'),
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
            { k: 'symptom', label: 'An early sign', sub: 'Odd behavior that foreshadows her breakdown.', text: 'This is the family’s retrospective way of reading her, and its danger is that once the ending is known, everything she did becomes evidence. Nothing in the text marks this as illness; it marks it as irritating. Reading it as a symptom means reading the first half of the chapter backwards from the asylum.' },
            { k: 'learning', label: 'Learning them', sub: 'A newcomer making sense of strangers out loud.', text: 'The text supports this. She is checking the young people against her sister’s letters, which are the only account of them she has, and saying what she sees is how she fixes it in place. It looks strange because she does in public what everyone else does privately.' },
            { k: 'gaze', label: 'Looking back', sub: 'For once she is the one describing.', tier: 'criticism', by: 'Lee, 1991', text: 'This is the only scene in the chapter in which Moon Orchid holds the narrative and other people are its objects. Robert G. Lee reads the climax of the chapter as a matter of looking, since it is her husband’s American gaze that silences her. Here, early on, the direction is reversed, and the people being looked at do not like it.' },
            { k: 'haunt', label: 'Haunting them', sub: 'Present, insistent, and not quite part of their world.', tier: 'criticism', by: 'Szmańko, 2021', text: 'In this family’s speech, strangers are ghosts, and here the roles turn: the newcomer drifts through the house attaching commentary to everyone, unsettling them without being part of what she describes. Klara Szmańko reads her as haunting the children with a curiosity that becomes attachment. The image is worth holding on to, because the chapter is about to make her a ghost in a far less harmless sense.' },
            { k: 'open', label: 'Cannot be said', sub: 'The book gives the habit, not the reason.', text: 'A fair caution. Kingston reports the behavior and the irritation and never explains the motive. It is telling, though, that the irritation is recorded and the motive is not, because the account of this scene, as the family would tell it, is the account of how she annoyed them.' }
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
          N('Everyone in this household works, and Moon Orchid is expected to find her place in the work too.'),
          R('Brave Orchid and her husband open [[the laundry|c_laundry]] at six in the morning. She also walks her sister and her niece through Chinatown.'),
          R('Moon Orchid looks at the Chinese people in the street and [[calls them Americans|c_americans]]. Brave Orchid thinks this is silly. They are overseas Chinese.')
        ],
        margin: ['c_chua'],
        word: {
          id: 'americans', prompt: 'Which word does the account keep for the people in Chinatown?',
          options: [
            { k: 'mo', label: 'Americans', sub: 'Moon Orchid’s word', account: { who: 'mo', text: 'In Chinatown, she called the Chinese people Americans.' },
              text: 'Her word describes what she sees: people at home in this country in a way that she is not. From Hong Kong, the diaspora looks American. Coming from the woman who will soon be told that she cannot belong here, it is also an accurate observation about who belongs.' },
            { k: 'bo', label: 'Overseas Chinese', sub: 'Brave Orchid’s word', account: { who: 'bo', text: 'They are overseas Chinese, whatever she called them.' },
              text: 'Her word insists that being Chinese survives emigration, and it comes from someone who has spent decades here holding on to exactly that. It is also the word with authority in this house. The sister who has lived here longest is the one who gets to decide what the people in the street are.' }
          ]
        },
        next: 'l2' },
      l2: { focus: 'mo', show: ['ironing'],
        steps: [
          R('In the laundry, Moon Orchid tries the ironing and [[scorches a shirt|c_scorch]]. She is sent to rest.', { show: ['burned'] }),
          R('She would like someone to take her back to Chinatown. Brave Orchid keeps working, and [[sets out a crate for her to sit on|c_crate]].', { wish: 'chinatown', wishText: 'Someone to take her back to Chinatown.', wishStatus: 'Not given. Her sister went on working and set out a crate.', granted: false }),
          SEEN('crate')
        ],
        margin: ['c_peeren'],
        next: 'l3' },
      l3: { focus: 'mo', show: ['crate', 'towels'],
        steps: [
          R('Later Brave Orchid does take her to Chinatown, where her friends joke about blackmailing the husband, or beating him up. Moon Orchid treats it as a joke, and [[plays mahjong|c_mahjong]].'),
          R('After that, in the late afternoons, when the laundry has cooled, [[she folds towels|c_towels]]. Brave Orchid finds her slow.')
        ],
        reading: {
          id: 'laundry', prompt: 'Brave Orchid finds her sister slow. What is the laundry really measuring?',
          options: [
            { k: 'use', label: 'Usefulness', sub: 'A person is worth what she can do.', tier: 'criticism', by: 'Wong, 1993', text: 'This is Wong’s Necessity at work. The laundry was built for survival, and the household values everyone in it by output. By that measure Moon Orchid fails, and the chapter lets us see how quickly failing at a task slides into being a certain kind of person.' },
            { k: 'class', label: 'A different life', sub: 'She has never worked; her sister always has.', text: 'The text supports this plainly. Moon Orchid has lived for thirty years on her husband’s remittances in Hong Kong, while Brave Orchid trained as a doctor and now irons from six in the morning. The laundry measures the gap between two lives produced by the same family, and then treats the result as a fact about Moon Orchid’s nature.' },
            { k: 'age', label: 'Age', sub: 'She is past the age of learning a hard trade.', text: 'Possible, but her sister is older and works the presses all day, so age alone does not explain it. If we reach for age, we should ask why it is Moon Orchid’s age, and not Brave Orchid’s, that the scene seems to count. Her husband will ask the same question of her, and answer it for her.' },
            { k: 'open', label: 'Cannot be said', sub: 'The book records the verdict, not the measure.', text: 'A fair point. The book gives us the scorched shirt, the crate, the towels and the judgment that she is slow. What the judgment leaves out is the towels themselves: the work she did manage, on the only terms she could manage it.' }
          ]
        },
        next: { scene: 'notyet' } }
    }
  };

  scenes.notyet = {
    mv: 'II', title: 'Not Yet', place: 'Stockton · the weeks after', art: 'kitchen', first: 'e1',
    beats: {
      e1: { focus: 'bo',
        steps: [
          N('Meanwhile the plan from the kitchen table has not gone away.'),
          R('Every day [[Brave Orchid asks her sister whether she is ready|c_ready]] to go to her husband, and every day Moon Orchid says no.', { wish: 'notyet', wishText: 'Not yet.', wishStatus: 'Said every day for weeks. It held until her daughter had to go home.', granted: false }),
          R('Then Moon Orchid’s daughter has to go back to Los Angeles, and Brave Orchid decides they will all go with her.'),
          R('Moon Orchid has read that it is [[against the law|c_bigamy]] for an American man to have more than one wife. Brave Orchid says the law does not matter.')
        ],
        margin: ['c_fricker'],
        word: {
          id: 'law', prompt: 'Moon Orchid has the law right. What goes into the account of that evening?',
          options: [
            { k: 'bo', label: 'The law doesn’t matter', sub: 'Brave Orchid’s ruling', account: { who: 'bo', text: 'The law did not matter; she was his wife.' },
              text: 'This is what happens in the book: the ruling stands and the trip goes ahead. It is worth marking the moment, because in Los Angeles the husband will use exactly the argument Moon Orchid raised here, and it will be decisive. Her knowledge was right, and it was not allowed to count.' },
            { k: 'mo', label: 'She knew it was against the law', sub: 'What Moon Orchid knew', account: { who: 'mo', text: 'She knew, before anyone left, that the law was on his side.' },
              text: 'Keeping her knowledge in the account changes how the trip to Los Angeles looks. She is no longer a frightened woman pushed into a confrontation she did not understand, but a woman who understood it better than the person pushing her. The book gives us the evidence for this version; the household did not keep it.' }
          ]
        },
        next: { scene: 'drive' } }
    }
  };

  /* ---------------- III · The Western Palace */
  scenes.drive = {
    mv: 'III', title: 'The Empress of the East', place: 'The road south to Los Angeles', art: 'road', first: 'd1',
    beats: {
      d1: { focus: 'bo',
        steps: [
          N('The plan from the kitchen table is now a car on the road south.'),
          R('Brave Orchid’s eldest son drives. On the way, Brave Orchid tells a story about an emperor with four wives, one at each point of the compass. She is [[the good Empress of the East|c_empress]], the true wife married in China, and Moon Orchid must go to the Western Palace and win back her husband from the wife who has taken him.'),
          N('[[Brave Orchid has cast herself as the heroine.|c_casting]]')
        ],
        margin: ['c_liu'],
        account: { who: 'bo', text: 'She was the Empress of the East, going to take back what was hers.' },
        reading: {
          id: 'empress', prompt: 'Whose story is the Empress of the East?',
          options: [
            { k: 'bo', label: 'Brave Orchid’s', sub: 'She is the heroine, and her sister carries out the plot.', text: 'The casting gives this away: Brave Orchid is the Empress of the East, and Moon Orchid is the one sent into the palace. This is consistent with everything so far, from the airport to the kitchen table, where someone else’s version of Moon Orchid’s life has a leading role for someone else.' },
            { k: 'script', label: 'A script for Moon Orchid', sub: 'A shape that makes the confrontation possible.', text: 'Brave Orchid gives her sister a story with a rightful wife, a usurper and a rescue, because a story can make an impossible act feel possible. That is the real kindness in it. The trouble is that it is a story about a captive husband, and the husband in Los Angeles is not captive at all.' },
            { k: 'old', label: 'An old form', sub: 'A tale from one world carried into another.', tier: 'context', by: 'Liu, 1996', text: 'The imperial household with several wives belongs to Chinese stories and Chinese law. In California, as Moon Orchid read for herself, a man may have one wife. The tale prepares her for a world whose rules no longer apply, which makes it, in a way, another version of the past she is being asked to live in.' },
            { k: 'chin', label: 'A retelling', sub: 'And retellings are what this book argues about.', tier: 'criticism', by: 'Chin, 1991', text: 'Frank Chin accused Kingston of faking Chinese stories, and here a Chinese story is reshaped by a character to serve her purpose. Whatever we make of Chin’s charge, the book is clearly interested in how stories are bent by whoever tells them. The Empress of the East is one more account of Moon Orchid that she did not write.' }
          ]
        },
        next: 'd2' },
      d2: { focus: 'mo',
        steps: [
          R('Moon Orchid is afraid her husband will throw her out. Brave Orchid suggests they might have to [[climb in through a window|c_window]] and behave as if Moon Orchid belongs in the house. Moon Orchid goes along with it for a moment, then says she cannot.'),
          R('She asks her nephew to [[turn the car around|c_turnback]]. She asks to see her grandchildren first. Her daughter insists on being dropped off at home before anything else. Brave Orchid insists on the husband.', { wish: 'turnback', wishText: 'Turn the car around, or see her grandchildren first.', wishStatus: 'Overruled. Brave Orchid insisted on the husband.', granted: false })
        ],
        next: { scene: 'tower' } }
    }
  };

  scenes.tower = {
    mv: 'III', title: 'The Building', place: 'Downtown Los Angeles', art: 'tower', first: 't1',
    beats: {
      t1: { focus: 'bo',
        steps: [
          R('The son drives to a tall building downtown. The address Brave Orchid has is not the husband’s house but his [[office, in a building of glass and chrome|c_tower]]. Moon Orchid is too frightened to go up, so Brave Orchid goes in alone.'),
          R('In a doctor’s office she finds a receptionist in a pink and white uniform, who tells her that the doctor is a brain surgeon and [[does not see people who simply walk in|c_dropin]].')
        ],
        next: 't2' },
      t2: { focus: 'mo',
        steps: [
          R('Brave Orchid comes back down with a new plan. She sends her son upstairs to tell the doctor that [[someone has been hurt in an accident|c_lure]]. Her son thinks this is absurd, and goes.'),
          R('In the car, Moon Orchid cries at the thought of seeing her husband, and [[Brave Orchid slaps and pinches her cheeks|c_slap]] to bring the color back into them.')
        ],
        account: { who: 'bo', text: 'We got him to come down to the car.' },
        next: { scene: 'car' } }
    }
  };

  scenes.car = {
    mv: 'III', title: 'The Car', place: 'Downtown Los Angeles · at the curb', art: 'curb', first: 'k1',
    beats: {
      k1: { focus: 'husband', show: ['husband'],
        steps: [
          N('Everything the chapter has been building toward happens in a parked car.'),
          R('The son comes back with a man in a dark Western suit, who gets into the front of the car. As the two women see him, he has black hair and no wrinkles, and he [[looks and smells like an American|c_youth]]. In this country, they think, a man can somehow keep his youth.'),
          R('There has been no accident. He looks at the two old women in the back seat and [[does not know who they are|c_notknow]]. He calls them grandmothers.'),
          SEEN('car')
        ],
        margin: ['c_lee'],
        next: 'k2' },
      k2: { focus: 'husband', show: ['husband'],
        steps: [
          R('When he understands who she is, he tells her that she does not belong here. [[She does not have the hardness this country requires.|c_hardness]] He [[sits in the front seat|c_seat]] and speaks to her across it.'),
          R('He will not send her back to China, but she cannot live in his house: he lives as an American now, and [[could be arrested for having two wives|c_arrest]]. He did not write, he says, because he became a different person, and his Chinese family seem to him now like [[people in a book he read long ago|c_book]].'),
          SEEN('hardness')
        ],
        margin: ['c_peerenbars', 'c_ellison'],
        next: 'k3' },
      k3: { focus: 'mo', show: ['husband'],
        steps: [
          R('He [[buys them lunch|c_lunch]]. Then the son drives Moon Orchid back to her daughter’s home, where she chooses to stay. She never sees her husband again. In the car, [[she says nothing at all|c_silent]].', { wish: 'stay', wishText: 'To stay at her daughter’s home.', wishStatus: 'Granted. The one thing she chose for herself after the car.', granted: true })
        ],
        word: {
          id: 'car', prompt: 'How will the car be told? Moon Orchid has hardly spoken, so her words are not among the choices.',
          options: [
            { k: 'husband', label: 'She can’t belong here', sub: 'His version', account: { who: 'husband', text: 'She could not belong here; she lacked the hardness this country needs.' },
              text: 'This is the version with the force of the situation behind it: his profession, his English, his new wife, and the law Moon Orchid herself had read about. It becomes the account because it is the only complete sentence anyone speaks in that car. That is exactly how erasure works here: the person who is refused does not get to describe the refusal.' },
            { k: 'bo', label: 'He is a barbarian', sub: 'Brave Orchid’s version', account: { who: 'bo', text: 'He was a barbarian who had abandoned his wife.' },
              text: 'Brave Orchid’s outrage is real and, morally, not wrong. But it also turns the event into her story, the story of a villain, and the empress who failed to storm the palace remains the heroine of her own version. Moon Orchid is again the object of the sentence.' },
            { k: 'blank', label: 'Leave it blank', sub: 'Record that she said nothing', account: { who: 'none', text: 'She said almost nothing, and no one wrote down what she might have said.' },
              text: 'Leaving the account blank refuses to fill her silence with anyone else’s words, including ours. It is the most honest version and also the emptiest one. The silence is not consent and not resistance; it is what remains when the speech prepared for her at the kitchen table never comes, and nothing of her own replaces it.' }
          ]
        },
        next: { scene: 'apartment' } }
    }
  };

  /* ---------------- IV · Afterward */
  scenes.apartment = {
    mv: 'IV', title: 'Watched', place: 'Los Angeles · her daughter’s apartment', art: 'apartment', first: 'w1',
    beats: {
      w1: { focus: 'mo',
        steps: [
          N('After the car, the woman no one would see begins to feel seen by everyone.'),
          R('In Hong Kong, Moon Orchid wrote letters every other week. Now [[she stops writing|c_stoppedletters]].'),
          R('When Brave Orchid telephones from Stockton, Moon Orchid [[whispers that people are listening|c_listening]] and hangs up. Her daughter reports that her mother believes [[Mexican ghosts are plotting against her|c_mexican]].'),
          SEEN('watched')
        ],
        account: { who: 'niece', text: 'Mother believes people are plotting against her.' },
        reading: {
          id: 'watched', prompt: 'She believes she is being watched and listened to. How should we read this?',
          options: [
            { k: 'illness', label: 'Illness', sub: 'Paranoia, a symptom of a mind breaking down.', text: 'The book clearly presents this as a breakdown, and we should not pretend otherwise. But naming it as a symptom is where the family’s account stops, and the chapter gives us more than that: the timing, directly after the car, and the content, being looked at by people who will not recognize her. The illness has a shape, and the shape repeats what happened to her.' },
            { k: 'reversal', label: 'A reversal', sub: 'Invisibility turned inside out into surveillance.', text: 'This is the turn the whole chapter has prepared. The woman nobody would see now believes she is seen everywhere. Recognition returns, but only as surveillance, and it does not end her invisibility, since she is no more understood than before. She is noticed everywhere and known nowhere, and either way she is denied a secure place in the present.' },
            { k: 'language', label: 'Language', sub: 'Surrounded by people she cannot speak to.', tier: 'criticism', by: 'Szmańko, 2021', text: 'Klara Szmańko notes that Moon Orchid speaks neither English nor Spanish, and reads the fear as the product of a mind under strain in a city where she can talk to almost no one. The people she fears are the people she cannot address, which is the condition the chapter has kept her in since the airport.' },
            { k: 'open', label: 'Cannot be said', sub: 'We only have her daughter’s report of it.', text: 'True, and important: everything we know here comes through her daughter’s letters and Brave Orchid’s telephone calls, so even her fear reaches us secondhand. The one thing she says directly, that people are listening, is whispered and cut off.' }
          ]
        },
        next: { scene: 'stockton' } }
    }
  };

  scenes.stockton = {
    mv: 'IV', title: 'One Story', place: 'Stockton · the house at night', art: 'night', first: 's1',
    beats: {
      s1: { focus: 'bo',
        steps: [
          N('Brave Orchid brings her sister back to the house where the chapter began.'),
          R('Moon Orchid tells her sister that she is [[in disguise|c_disguise]]. Brave Orchid decides that her sister’s spirit has wandered off, and [[chants her name and her new address|c_chant]] to call it home.'),
          R('It does not help. Moon Orchid says that she has been followed. She turns off the lights in the house, as if for an air raid, and she is afraid for the children, so that Brave Orchid makes them come straight home.')
        ],
        next: 's2' },
      s2: { focus: 'bo',
        steps: [
          R('Brave Orchid decides it is hopeless, because her sister has only one story left. She explains to her children that [[sane people can vary the stories they tell, while the insane have only one, and repeat it|c_onestory]].'),
          R('When Moon Orchid begins [[to curse the children|c_curse]], Brave Orchid gives up.')
        ],
        margin: ['c_boorima'],
        account: { who: 'bo', text: 'She had only one story left.' },
        reading: {
          id: 'onestory', prompt: 'Sane people vary their stories; the mad have only one. What does Brave Orchid’s theory describe?',
          options: [
            { k: 'mind', label: 'Her sister’s mind', sub: 'A practical observation about madness.', text: 'Taken literally, it is a doctor’s observation, and Brave Orchid trained as one. But a theory of sanity is never only clinical. This one locates the problem entirely inside Moon Orchid, which is exactly what the family needs if no one around her is to blame.' },
            { k: 'time', label: 'Being held in time', sub: 'Sanity as the freedom to revise and move on.', text: 'This is the reading the chapter supports most strongly. Everyone around Moon Orchid has revised their story: the husband became a different person, Brave Orchid made a life in a laundry, the children became American. Moon Orchid was held to one story, the wife from long ago, and was sent to Los Angeles to act it out. By her sister’s own measure, the one story was handed to her.' },
            { k: 'teller', label: 'The teller', sub: 'Brave Orchid is the one who tells stories in this family.', text: 'Brave Orchid is the book’s great talker of stories, and this theory makes the storyteller the measure of sanity. It also quietly excuses the Empress of the East, the story she told in the car, which failed. The theory belongs to the person whose story did not work.' },
            { k: 'open', label: 'Cannot be said', sub: 'One remark, reported years later.', text: 'Fair. It is one remark, reported by a narrator who heard most of this secondhand. But the narrator chose to keep it, and to put it near the end, which suggests she thought it explained something.' }
          ]
        },
        next: { scene: 'asylum' } }
    }
  };

  scenes.asylum = {
    mv: 'IV', title: 'The Same Language', place: 'A California state hospital', art: 'asylum', first: 'h1',
    beats: {
      h1: { focus: 'mo',
        steps: [
          R('[[Her daughter has her committed|c_committed]] to a state asylum.'),
          R('There, by Brave Orchid’s account, Moon Orchid is [[content|c_content]]. Nobody leaves, and the women there all speak the same language. She has a new story.'),
          R('She dies there soon afterward.'),
          SEEN('asylum')
        ],
        account: { who: 'bo', text: 'She was happy there, with people who understood her.' },
        margin: ['c_johnk'],
        reading: {
          id: 'asylum', prompt: 'She is content in the asylum. What does that mean?',
          options: [
            { k: 'peace', label: 'Peace', sub: 'Care at last, and an end to struggle.', text: 'It is a comfort to read it this way, and the text allows it: she is content, she has company, she has a new story. But we should notice what the peace costs. It is only available in a place that nobody leaves, and soon after it, she dies.' },
            { k: 'understood', label: 'Understood', sub: 'The one place where everyone speaks her language.', text: 'This is the sharpest reading. Since the airport, Moon Orchid has been unable to make herself understood by her sister, her husband, the children, the receptionist and the city. In the asylum, among women who speak the same language and never leave, she finally is. America has a place where she is recognized, and it is outside time.' },
            { k: 'report', label: 'A report', sub: 'Content according to whom?', text: 'Everything here reaches us through Brave Orchid, who visited, and then through the narrator, who did not. It is possible that “content” is the account the family needs in order to live with the ending. The book does not let us hear Moon Orchid say it herself.' },
            { k: 'romance', label: 'Freedom in madness', sub: 'She has escaped a world that refused her.', tier: 'criticism', by: 'Johnk, 2023', text: 'This is the reading to be most careful with. Treating madness as a hidden freedom or a form of resistance can turn a woman’s suffering into an argument, which is what the household did to her from the beginning. Johnk asks for readings that keep both her personhood and her suffering in view, and both are here: a new story, and a death soon after.' }
          ]
        },
        next: { scene: 'telling' } }
    }
  };

  /* ---------------- V · The Telling */
  scenes.telling = {
    mv: 'V', title: 'Who Told It', place: 'The next chapter', art: 'telling', first: 'n1',
    beats: {
      n1: { focus: 'narrator',
        steps: [
          N('And then the narrator returns, and admits how she came to know any of this.'),
          R5('At the start of the next chapter the narrator confesses that [[she was not there|c_brother]]. Her brother drove to Los Angeles; he told one of her sisters; that sister told her. What her brother actually said was short and plain, and she has given it a shape of her own.'),
          R5('Later she wonders whether every household has its crazy woman, and whether in hers [[it will be her|c_crazy]].'),
          R('Brave Orchid tells her children never to let their father take another wife. Her daughters decide that [[they will never let men be unfaithful to them|c_resolve]].')
        ],
        account: { who: 'narrator', text: 'My brother told it plainly. I am the one who gave it a shape.' },
        reading: {
          id: 'version', prompt: 'You have the plain version and the shaped one. Which do you trust?',
          options: [
            { k: 'plain', label: 'The brother’s', sub: 'Short, plain, and from someone who was there.', text: 'The narrator herself suspects it is truer, because it has not been shaped into a design. But the brother was the driver and the messenger who lured the husband downstairs, so his version has an interest of its own. Even the plain account comes from someone with a part in the story.' },
            { k: 'shaped', label: 'The narrator’s', sub: 'The chapter we have just read.', text: 'The shaped version gives Moon Orchid scenes, gifts, the laundry and the children, which the bare report would not. It is through the narrator’s shaping that she has a life before the car at all. That is the paradox of retelling: it is both how she is erased and the only way she survives.' },
            { k: 'neither', label: 'Neither', sub: 'Moon Orchid never told it.', text: 'This is where the chapter leaves us. Every account of Moon Orchid, her sister’s, her husband’s, her brother’s, the narrator’s, and this game’s, is an account she never gave. The story of her invisibility is itself told entirely by other people.' }
          ]
        },
        next: { scene: 'thesis' } }
    }
  };

  /* ================================================================== the closing thesis
     The author's own argument (Gu, 2026); Kingston paraphrased, never quoted. */
  const H = h => ({ h }), Pp = p => ({ p });
  const thesis = {
    title: 'A Living Ghost', kicker: 'The thesis this chapter has been arguing', sub: 'Invisibility, erasure, and who gets a future',
    body: [
      Pp('You watched a woman arrive in America. The question this page asks is why, once she had arrived, no one could see her.'),
      H('Ghosts in the living'),
      Pp('*The Woman Warrior* is subtitled *Memoirs of a Girlhood Among Ghosts*, and its ghosts come in two kinds. Some are the dead who will not stay dead, like the narrator’s unnamed aunt, who is struck out of the family record and yet kept alive by the very story that is forbidden to be told. Others are living. In the family’s speech the white Americans around them are ghosts, but the book’s most unsettling ghost is a living Chinese woman whom the country she arrives in, and in the end her own family, cannot see.'),
      Pp('Jacques Derrida’s *Specters of Marx* (1993) gives us the term hauntology for this condition: the ghost is neither fully present nor fully absent, “never present as such,” and yet it keeps shaping the present because it has not been laid to rest. Avery Gordon’s *Ghostly Matters* (1997) carries the idea into social history, reading haunting as the way an unresolved social violence makes itself known, “the endings that are not over.” Under this framework there are two cases. In the first, the past keeps transmitting into the present, as the No Name aunt does through every retelling. In the second, the living are left behind as society moves forward without them, and become socially invisible, living ghosts. Moon Orchid is the second case.'),
      H('Stranded in time'),
      Pp('Moon Orchid arrives in the United States with a system of old beliefs and an identity bound up in an old marriage. Her husband, on the other hand, has already built another life, with a new family, a new profession and a new language in a new place. Whilst the marriage is still ongoing in Moon Orchid’s life, it is already nonexistent in his. She is stranded in a version of life that froze when he left, while time, and everyone else, has moved on without her.'),
      Pp('The chapter shows this from the first scene. Her sister looks for the young woman she remembers and claims a stranger. Her husband, when he finally faces her, does not recognize her at all, calls the two sisters grandmothers, and says that his Chinese family have come to seem like people in a book he read long ago. In the women’s eyes he has kept his youth in America, with his black hair and no wrinkles, while they arrive already old. His youth is the visible form of his access to the future, and their age is the visible form of their exclusion from it. Moon Orchid is told, in effect, that she has arrived too late for her own marriage.'),
      H('Recognition'),
      Pp('Esther Peeren argues that living ghosts are “incapable of engineering their own recognition”: they can be conjured only by others, on terms that must make sense to the wider society. Moon Orchid fails both conditions. The one person who could conjure her back into her place, her husband, refuses to. And the only terms on which the wider society would accept her, English, work, and what he calls the *hardness* this country requires, are terms she cannot meet. *Hardness* is a gendered qualification. It names the masculine traits of his own successful assimilation, and it excludes the deferential femininity that made Moon Orchid a proper wife in the life she was given. The same qualities that granted her belonging in her old timeline disqualify her in the new one.'),
      Pp('The chapter rehearses this failure long before Los Angeles. Each time she is seen, she is seen as something else:'),
      { seen: true },
      H('Erasure, kindly meant'),
      Pp('Erasure in this chapter is not only the husband’s doing. It happens at the airport, at the kitchen table, and in the laundry, inside a household that loves her. Her gifts are sorted by their use. Her own plan for her marriage is called foolish. Her word for the people of Chinatown is corrected. Her knowledge of American law is waved aside. Her request for company is answered with a crate. Each correction is small, and most are kindly meant, but together they produce an account of Moon Orchid in which she is the object of every sentence and the subject of none.'),
      { count: true },
      { wishes: true },
      Pp('Lisa Lowe’s *Immigrant Acts* (1996) describes the Asian immigrant in the national imagination as a “foreigner-within,” folded into the nation’s labor yet kept outside its sense of itself. Moon Orchid is a foreigner even within her own family’s story.'),
      H('The reversal'),
      Pp('After the car, her relationship to visibility reverses. She stops writing her letters, withdraws from her family, and becomes convinced that she is being watched and plotted against. This imagined, overwhelming attention brings her to the opposite pole of recognition, and it gives her no more belonging than before, since everything around her now registers as a threat. Recognition in the form of surveillance can coexist with invisibility, because she is still not truly understood or included. Either way, she is denied a secure place in her community and kept from living a stable present.'),
      Pp('Brave Orchid’s own theory makes the point without meaning to. Sane people, she tells her children, can vary their stories, while the mad have only one. Sanity, by this measure, is the freedom to revise, to move forward in time, and that is exactly the freedom Moon Orchid was denied: she was held to one story, the wife from long ago, while everyone around her revised theirs. In the state hospital where she dies she is, by her sister’s report, content, among women who all speak the same language and never leave. It is the one place in America where she is understood, and it lies outside time.'),
      H('The thesis'),
      Pp('Behind Moon Orchid’s “maddening” stands not a diagnosis but a structure: the systemic erasure and invisibility of an immigrant woman. The history of exclusion split her marriage across an ocean. Assimilation gave the future to her husband and left her the past. Language took the authority out of everything she knew. A household measured her by her usefulness. And the story itself reached the page third-hand, through a brother, a sister, and a narrator who admits she was not there. Her madness is what that structure looks like from the inside. She is a living ghost: physically present, and refused any place in the present.'),
      Pp('This is also where she differs from Bertha Mason. Bertha’s madness is placed beside other people’s sanity so that their sanity can be seen. Moon Orchid’s madness is the name her family gives to a woman whose time has been taken away from her.'),
      H('Where the thesis strains'),
      Pp('The book does not let this argument become simple. The husband is no stage villain: he supported her for thirty years, and he did not ask for the confrontation Brave Orchid staged in a parked car. Cheng Lok Chua holds both the husband and Brave Orchid responsible for her collapse, and the erasure this chapter traces comes from love as well as from rejection. Invisibility should not be romanticized either. To read her madness as resistance or hidden wisdom would make her suffering serve an argument, which is what the household did to her; Lzz Johnk asks instead for readings that keep a madwoman’s personhood and her suffering in view at the same time. And every word of her story is a retelling. The narrator herself suspects that her brother’s bare account may be truer than the shaped one, so any thesis about Moon Orchid stands on an account she never gave.'),
      H('What is inherited'),
      Pp('In the next chapter the narrator wonders whether every household has its crazy woman, and whether in hers it will be her. Moon Orchid has become what the No Name aunt was in the first chapter: a story handed from mother to daughter as a warning, what happened to her could happen to you. The daughters take from it a lesson about unfaithful men. What the chapter actually shows is larger than that, and it is the question this game leaves with you: who is granted access to the future, who is not, and why.')
    ]
  };
  scenes.thesis = { essay: true, mv: 'V', title: 'A Living Ghost', place: 'The closing thesis', art: 'house', first: 't1', beats: { t1: { steps: [] } } };

  UH.MO = {
    who: WHO, movements: MOVEMENTS, scenes, clues, seen, thesis, start: 'arrivals',
    title: 'Before She Answers',
    sub: 'Moon Orchid · from Maxine Hong Kingston’s The Woman Warrior (1976)',
    notice: 'A close reading of “At the Western Palace.”',
    contentNote: 'This chapter includes abandonment, psychological distress, institutionalization and death.',
    howTo: [
      'Each passage marked Retold is an event from the book, put in this game’s words. The Woman Warrior is still in copyright, so Kingston’s sentences are not quoted.',
      'Underlined phrases open notes, marked by kind: annotation (this game’s reading), context (history outside the book), criticism (a named critic, paraphrased).',
      'At key moments you choose a reading, or choose whose version the account keeps, and the analysis follows your choice. Under the picture is the account: how each moment is being told. Each new scene opens with how the last one was told, so you can follow the story as the family passes it on.',
      'Two threads run through the whole chapter and come together at the end. “Seen as” collects each time she is seen as something she is not. “What she asked for” keeps the few things she asked for, and what happened to each.'
    ]
  };
})();
