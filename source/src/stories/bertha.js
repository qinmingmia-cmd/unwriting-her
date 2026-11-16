/* Unwriting Her: the Bertha Mason storyline.
   Narrative content only. The engine (engine.js) reads this object; nothing here touches the DOM.

   Markup inside text:
     [[visible words|clueId]]   a clickable phrase that opens the note clues[clueId]
     *words*                    italics
     {name} {Name}              the name the player chooses for her (lower / sentence case)
   Tiers: text (the novel, verbatim) · context (history outside the novel) · criticism (a named
   critic, paraphrased) · annotation (this game's reading of the text) · conjecture (invented here)
   · margin (the player's own words).
   Quotations from Jane Eyre and from Brontë's 1848 letter are verbatim; ellipses mark omissions. */
(function () {
  const Q = (who, cite, text, o) => Object.assign({ t: 'q', who, cite, text }, o || {});
  const P = (text, o) => Object.assign({ t: 'p', text }, o || {});
  const N = (tier, text, by) => ({ t: 'note', tier, text, by });
  const R = id => ({ t: 'reflect', id });
  const H = text => ({ t: 'h', text });
  const GO = (hot, prompt, flag) => ({ t: 'gate', hot, prompt, flag });
  const CHECK = (id, claim, answer, note) => s => s.role === 'reader' ? { t: 'check', id, claim, answer, note } : null;
  const CROSS = w => s => s.role === 'judge' ? { t: 'crossx', w } : null;
  const ROLE = (role, text) => s => s.role === role ? P(text) : null;

  const JANE = 'Jane Eyre, narrating';
  const ROCH = 'Edward Rochester';

  /* ---------------------------------------------------------------- notes */
  const clues = {
    c_bluebeard: { tier: 'context', by: 'Perrault, 1697', text: `In Charles Perrault’s tale, a rich husband gives his new wife the keys to every room in the house and forbids her one. Inside it she finds the bodies of the wives who came before her.\n\nJane names the genre of the house in her first hour on the third storey, long before she knows its secret. The comparison fits more closely than she can know. Behind one of these doors is a wife who came before her, and this one is alive.` },
    c_formal: { tier: 'annotation', text: `*Distinct* and *formal* describe something controlled; *mirthless* rules out amusement. Jane describes the sound carefully before anyone explains it to her.` },
    c_door: { tier: 'annotation', text: `Jane can place the sound exactly. The household’s answer is about whose laugh it is, not where it came from.` },
    c_perhaps: { tier: 'annotation', text: `The first explanation of the laugh names the wrong woman, and hedges: *very likely*, *perhaps*. Rochester later says Mrs. Fairfax “may indeed have suspected something, but she could have gained no precise knowledge as to facts” (Ch. XXVII).

Miranda Fricker (2007) writes that testimonial injustice “occurs when prejudice causes a hearer to give a deflated level of credibility to a speaker’s word.” Here the laugh is not disbelieved so much as assigned to someone else.` },
    c_directions: { tier: 'annotation', text: `The first rule the household is shown enforcing about the woman upstairs is a rule about noise.` },
    c_leads: { tier: 'annotation', text: `*The leads*: the flat lead roof of the hall. Jane comes here to look at the horizon. In Chapter XXXVI the woman from the third storey stands on this roof on the last night of her life.` },
    c_silent: { tier: 'annotation', text: `Jane’s argument for women’s inner lives is made on the same storey as a confined woman whose inner life the novel never records.` },
    c_laughat: { tier: 'annotation', text: `Jane objects to women being laughed at. The next sentence is a laugh.` },
    c_murmurs: { tier: 'annotation', text: `Jane hears this speech often enough to call it characteristic, records none of it, and still attributes it to Grace Poole.` },
    c_judgeme: { tier: 'annotation', text: `Rochester takes the wedding party up to the third storey, shows them his wife, and asks to be judged by comparing her with Jane. She is in the room. No one asks her anything.` },
    c_beast: { tier: 'annotation', text: `The pronoun shifts within the scene: *it* while the figure grovels and growls, *she* when she looks back at her visitors, *its* again a sentence later.` },
    c_gazed: { tier: 'annotation', text: `The one moment in the scene when she is described looking rather than being looked at. Grace Poole’s warning follows at once: “Ah! sir, she sees you!”` },
    c_mywife: { tier: 'annotation', text: `An hour earlier he was marrying Jane. Here he claims her as *my wife*. In Chapter XXVII he reports a voice telling him the opposite: she “is not your wife.”` },
    c_madfamily: { tier: 'criticism', by: 'Thomas, 1999', text: `Rochester presents madness as inherited down the female line from a “Creole” mother. Sue Thomas (1999) connects this kind of description to period writing about the white Creole planter class as morally degenerate, with intemperance among its “stock markers.” The novel never says what “Creole” means for this family.` },
    c_human: { tier: 'annotation', reflect: 'human', text: `Rochester asks the witnesses to compare the two women: one *a being*, the other *something at least human*.` },
    c_money: { tier: 'context', by: 'Coverture', text: `Under English common law a wife’s money and movable property passed to her husband on marriage unless a settlement protected it. William Blackstone’s *Commentaries* (1765) put the doctrine plainly: “By marriage, the husband and wife are one person in law: that is, the very being or legal existence of the woman is suspended during the marriage.” The Married Women’s Property Acts of 1870 and 1882 began to undo it.` },
    c_dark: { tier: 'annotation', text: `The same three words describe Blanche Ingram, the heiress Rochester courts at Thornfield. Here *dark* is a compliment about colouring. How to read the later descriptions (*discoloured*, *swelled black face*) is disputed; see the note on *discoloured*.` },
    c_race: { tier: 'annotation', reflect: 'race', text: `*Race* here means family line. Rochester describes a match between an old English family and a colonial fortune.` },
    c_30k: { tier: 'context', text: `Thirty thousand pounds was a very large fortune; Jane’s own windfall at the end of the novel is twenty thousand. Rochester was a younger son with no inheritance coming, and by his account his father arranged the match for the money. Under coverture the fortune became her husband’s. The novel never mentions it again, and never says how much of the household that confines her runs on what she brought.` },
    c_infamous: { tier: 'annotation', text: `Her mother is named once in the novel, in the statement read in church: Antoinetta. Here she is only *infamous*.` },
    c_unchaste: { tier: 'annotation', reflect: 'unchaste', text: `Both charges concern appetite, for drink and for sex. In the next sentence Rochester presents them as the cause of her madness.

Within the chapter, the woman listening to him will refuse to stay as his mistress.` },
    c_partofme: { tier: 'context', by: 'Coverture', text: `Rochester complains that the law calls her a part of him. Under coverture the fiction ran the other way. It was the wife whose legal existence was absorbed into the husband’s, along with her fortune.` },
    c_doctors: { tier: 'context', text: `No doctor is named. No examination is described, no certificate shown. The diagnosis arrives in a subordinate clause, as the reason he could not divorce her.\n\nBefore the Matrimonial Causes Act of 1857, an English divorce that allowed remarriage took a private Act of Parliament: rare, costly, and in practice granted almost only for a wife’s adultery. Rochester has just called her *unchaste*. In his own account, the finding of madness is what closes the legal way out and makes the marriage permanent.` },
    c_excesses: { tier: 'context', by: 'Prichard, 1835', text: `Moral judgment, turned into diagnosis. James Cowles Prichard’s *Treatise on Insanity* (1835) gave English medicine a category, *moral insanity*, in which disordered feeling and conduct could amount to madness while the intellect stayed intact. Brontë used nearly that phrase about Bertha in a letter of January 1848. Hear the author’s testimony.` },
    c_europe: { tier: 'criticism', by: 'Spivak, 1985', reflect: 'europe', text: `The passage sets the West Indies (sulphur, a red moon like a cannon-ball) against a wind from Europe. Gayatri Chakravorty Spivak (1985) reads *Jane Eyre* as a novel in which empire supplies the terms of English selfhood. Here Europe is the cure, and the cure is for him.` },
    c_confine: { tier: 'annotation', text: `In Rochester’s account, the plan to confine her at Thornfield was made in Jamaica, as the condition of his starting again.` },
    c_notwife: { tier: 'annotation', reflect: 'notwife', text: `At the attic door he called her *my wife*. Here a voice tells him she is not, which leaves him free to form “what new tie you like.”` },
    c_oblivion: { tier: 'annotation', text: `The plan is to bury her identity. Her full name, and her mother’s, appear once in the novel, read aloud by a solicitor.` },
    c_ravings: { tier: 'annotation', text: `Rochester says her *ravings* would *betray* his secret, which means what she said was intelligible enough to reveal it. The attendant is chosen for *fidelity*, not for medical skill.

Fricker’s testimonial injustice concerns a hearer who discounts a speaker. Here the arrangement ensures she has no hearers.` },
    c_lucid: { tier: 'annotation', text: `By his account she used her clear periods to accuse him. The accusations are not recorded.` },
    c_cannothelp: { tier: 'annotation', text: `Jane is the only character who rebukes Rochester for how he speaks of his wife. Her defence still accepts the diagnosis.` },
    c_ifyou: { tier: 'annotation', reflect: 'ifmad', text: `He imagines Jane mad, and says he would love her anyway.` },
    c_tigress: { tier: 'annotation', text: `Her brother, too, describes her as an animal.` },
    c_interview: { tier: 'annotation', text: `Rochester’s word for a brother visiting his sister. An interview has two speakers.` },
    c_good: { tier: 'annotation', text: `Mason went up alone, at night, without Rochester. The novel does not record what he meant to say, or what she said before she attacked him; only that “she looked so quiet at first.”` },
    c_drain: { tier: 'annotation', text: `The only words in the novel attributed to her. They reach you through her brother’s report, narrated by Jane, who has been told to keep quiet.` },
    c_gibberish: { tier: 'annotation', reflect: 'fool', text: `A threat is a sentence with a meaning. Rochester calls it *gibberish*.

Compare his praise of Jane after the fire in Chapter XV: “You are no talking fool.”` },
    c_dontrepeat: { tier: 'annotation', text: `He calls her words meaningless and forbids them to be repeated in the same breath.` },
    c_dead: { tier: 'annotation', text: `The advice Rochester gave himself in Jamaica, “buried in oblivion,” is passed on to her brother. Spanish Town is where she was married.` },
    c_grains: { tier: 'annotation', text: `Mason is the reason the bigamous wedding stops, and he weeps for his sister. Rochester’s portrait of him is contemptuous and predicts he will go mad too. The account of the Mason family you have is Rochester’s.` },
    c_charge: { tier: 'annotation', text: `*Charge*: a ward, a responsibility, a cost.` },
    c_were: { tier: 'annotation', text: `Grace answers for both of them, in the first person plural.` },
    c_guessed: { tier: 'annotation', text: `Jane offers the name. Rochester accepts it rather than correct her.` },
    c_saynothing: { tier: 'annotation', reflect: 'fool', text: `The order to keep quiet goes to Jane, who obeys and is praised for it.` },
    c_mirror: { tier: 'annotation', text: `Before tearing the veil she puts it on and looks at herself. Rochester later reads the act as memory of “her own bridal days” (Ch. XXVII). What she felt is not in the text.` },
    c_discoloured: { tier: 'criticism', by: 'Meyer, 1990 · Thomas, 1999', text: `Disputed. Susan Meyer (1990) argues that Bertha, apparently white in Rochester’s retrospective account, is darkened in the scenes where she appears, as part of the novel’s figurative use of race and slavery. Sue Thomas (1999) disagrees, reading Bertha through period stereotypes of the white Creole planter class rather than of the rebel slave. Others read the words as describing illness or drink. The novel never states her race.` },
    c_vampyre: { tier: 'annotation', text: `Jane names her with a figure from German folklore. The Gothic supplies the words available to her.` },
    c_extinguished: { tier: 'annotation', text: `In the only meeting between the two women, she looks at Jane by candlelight and does her no harm.` },
    c_creature: { tier: 'annotation', reflect: 'nerves', text: `Rochester explains Jane’s account away as nerves and fever, though he knows who was in her room. He praises Jane’s delicacy. In the attic, Jane reports, the other woman “showed virile force in the contest” (Ch. XXVI).` },
    c_real: { tier: 'annotation', text: `Jane holds her ground, and the next morning proves her right. Her account is confirmed by the plot, which is hers.` },
    c_madcat: { tier: 'criticism', by: 'Gilbert & Gubar, 1979', reflect: 'madcat', text: `Jane is the first woman in the novel called mad and locked in a room for it. Sandra Gilbert and Susan Gubar (1979) read Bertha as Jane’s dark double, acting out the rebellion and rage that first appear in this red-room scene.` },
    c_rebelslave: { tier: 'criticism', by: 'Meyer, 1990', text: `Jane uses the enslaved rebel as a figure for an English child’s anger. Susan Meyer (1990) argues that the novel repeatedly uses slavery as a metaphor for English women’s subordination, while the people of the colonies stay at its margins.` },
    c_fullname: { tier: 'annotation', text: `Her full name appears once in the novel, read aloud in a church. Until now she has been a laugh, a fire, and Grace Poole.` },
    c_jonas: { tier: 'context', text: `Rochester calls him “a West India planter and merchant” (Ch. XXVII). Spanish Town was the capital of colonial Jamaica. In the 1790s Jamaican planter wealth rested on the labour of enslaved Africans; Britain abolished slavery in its colonies only in 1834, and forced “apprenticeship” lasted until 1838. The novel never mentions slavery in connection with the Masons. That silence is part of the record too.\n\nOn dating: in Chapter XXXII Jane is given Scott’s *Marmion* (1808) as “a new publication.” If that clue is trusted, Jane’s story falls around 1808 and this wedding, fifteen years earlier, in the early 1790s. Brontë’s chronology is loose, so treat this as an estimate.` },
    c_antoinetta: { tier: 'context', by: 'Rhys, 1966', text: `Her middle name is her mother’s: the one place in the novel where a line of descent runs through women.

Jean Rhys took the name for Antoinette Cosway, the heroine of *Wide Sargasso Sea* (1966), and made “Bertha” the name her English husband imposes. In a letter Rhys wrote: “The Creole is of course the important one, the others explain her.”` },
    c_creole: { tier: 'context', text: `In this period *Creole* could describe a person of European descent born in the Caribbean, as well as people of African or mixed descent born there. The word marks her mother as colonial-born. It does not settle her race, and the novel never does.` },
    c_dashes: { tier: 'annotation', text: `Brontë leaves the year, county, shire and church blank, a common convention of discretion in fiction of the period.` },
    c_existence: { tier: 'annotation', text: `The first sentence in the novel to treat her as a person with legal standing. It is spoken to stop another woman’s wedding.` },
    c_funchal: { tier: 'criticism', by: 'Spivak 1985 · Valint 2017', text: `Jane’s uncle, John Eyre, is a merchant in Madeira who works for the Masons’ trading house. The commercial network that produced the first Mrs. Rochester’s dowry is the one that stops the second wedding. When John Eyre dies it also makes Jane an heiress, with twenty thousand pounds.\n\nCritics disagree about what this implicates. Readers following Spivak see Jane’s independence funded by colonial trade. Alexandra Valint argues that Jane’s uneasy handling of the legacy, which she divides with her cousins, keeps her at a distance from it.` },
    c_witch: { tier: 'annotation', text: `The landlord’s word for her planning.` },
    c_knew: { tier: 'annotation', text: `He supposes she knew what had passed between her husband and the governess. No one in the novel tells her.` },
    c_dontknow: { tier: 'annotation', text: `The landlord marks his own story as hearsay.` },
    c_mile: { tier: 'annotation', text: `Heard a mile away. No witness repeats a word of it.` },
    c_heardhim: { tier: 'annotation', text: `His words are reported exactly: her name. Hers are reported only as volume. The landlord is also clear that Rochester got the servants out and went up to reach her.` },
    c_moral: { tier: 'context', by: 'Prichard, 1835', text: `The phrase is close to J. C. Prichard’s *moral insanity* (1835): madness of feeling and conduct, with the intellect intact. A diagnosis of this kind can be made from behaviour alone, and from behaviour judged by moral standards.` },
    c_fiend: { tier: 'annotation', reflect: 'fiend', text: `Brontë’s letter has the human disappearing and a “fiend-nature” taking its place, and names the right audience for it: “the truly good,” who pity.` },
    c_erred: { tier: 'annotation', text: `Brontë concedes too much horror and too little pity. She does not revise the diagnosis.` },
    c_sin: { tier: 'annotation', text: `In Rochester’s account her excesses caused her madness. In Brontë’s letter sin is itself a kind of madness. Both accounts join moral judgment to diagnosis.` }
  };

  /* ---------------------------------------------------------- the glass */
  /* Each reflection sets what is said of her beside what it lets someone else become. */
  const reflections = {
    eyes: { her: 'the red balls yonder · that mask · that bulk', other: 'these clear eyes · this face · this form', who: 'Jane', cite: 'Ch. XXVI', match: { her: 'red balls', other: 'clear eyes' } },
    demon: { her: 'a demon at its gambols · that fierce ragout', other: 'this young girl, grave and quiet · a change', who: 'Jane', cite: 'Ch. XXVI', match: { her: 'gambols of a demon', other: 'this young girl' } },
    human: { her: 'what sort of a being', other: 'something at least human', who: 'Jane', cite: 'Ch. XXVI', match: { her: 'what sort of a being', other: 'at least human' } },
    protest: { her: 'a laugh · eccentric murmurs', other: 'an argument for what women feel', who: 'Jane', cite: 'Ch. XII', match: { her: 'grace poole’s laugh', other: 'women feel just as men feel' } },
    unchaste: { her: 'intemperate and unchaste', other: 'the governess who leaves rather than be his mistress', who: 'Jane', cite: 'Ch. XXVII' },
    ifmad: { her: 'hated', other: 'loved, even if she were mad', who: 'Jane', cite: 'Ch. XXVII', match: { her: 'not because she is mad i hate her', other: 'if you were mad' } },
    notwife: { her: 'not your wife', other: 'what new tie you like', who: 'the next wife', cite: 'Ch. XXVII', match: { her: 'is not your wife', other: 'what new tie you like' } },
    exist: { her: 'Mrs. Rochester, upstairs', other: 'Mrs. Rochester, who “did not exist” yet', who: 'Jane', cite: 'Ch. XXV', match: { her: 'she is now living at thornfield', other: 'she did not exist' } },
    nerves: { her: 'virile force · almost throttled him', other: 'nerves not made for rough handling', who: 'Jane', cite: 'Chs. XXV–XXVI', match: { her: 'clothed hyena', other: 'nerves like yours' } },
    madcat: { her: 'the madwoman upstairs', other: 'the “mad cat” of the red-room, grown into a narrator', who: 'Jane', cite: 'Ch. II', match: { her: 'bertha mason is mad', other: 'mad cat' } },
    fool: { her: 'gibberish', other: 'no talking fool', who: 'Jane', cite: 'Chs. XV, XX', match: { her: 'gibberish', other: 'no talking fool' } },
    europe: { her: 'sulphur-steams · a moon like a hot cannon-ball', other: 'a wind fresh from Europe', who: 'England', cite: 'Ch. XXVII', match: { her: 'sulphur-steams', other: 'fresh from europe' } },
    race: { her: 'her mother, the Creole', other: 'a good race', who: 'Rochester', cite: 'Ch. XXVII', match: { her: 'her mother, the creole', other: 'good race' } },
    fiend: { her: 'a fiend-nature', other: 'the truly good, who pity', who: 'the reader', cite: 'Letter, 1848', match: { her: 'fiend-nature', other: 'truly good' } },
    married: { her: 'dead as the stones', other: 'Reader, I married him.', who: 'Jane', cite: 'Chs. XXXVI, XXXVIII', match: { her: 'dead as the stones', other: 'reader, i married him' } }
  };

  /* --------------------------------------------------- words used of her */
  /* Shown in the Record. A struck word is drawn struck through wherever it appears afterwards. */
  const lexicon = [
    { w: 'maniac', by: 'Jane; Rochester’s “Hope”', in: ['w_rochester'] },
    { w: 'mad', by: 'Rochester; Jane; Bessie', in: ['w_rochester', 'w_jane'] },
    { w: 'lunatic', by: 'Rochester', in: ['room'] },
    { w: 'hyena', by: 'Jane', in: ['w_rochester'] },
    { w: 'beast', by: 'Jane; Rochester', in: ['w_rochester', 'room'] },
    { w: 'demon', by: 'Rochester', in: ['w_rochester'] },
    { w: 'Vampyre', by: 'Jane', in: ['w_jane'] },
    { w: 'savage', by: 'Jane', in: ['w_jane'] },
    { w: 'tigress', by: 'Mason', in: ['w_mason'] },
    { w: 'gibberish', by: 'Rochester', in: ['w_mason'] },
    { w: 'ravings', by: 'Rochester', in: ['w_rochester'] },
    { w: 'charge', by: 'Rochester', in: ['w_grace'] },
    { w: 'burden', by: 'Rochester’s “Hope”', in: ['w_rochester'] },
    { w: 'goblin', by: 'Rochester', in: ['room'] },
    { w: 'cunning', by: 'Rochester; the landlord', in: ['room', 'w_host'] },
    { w: 'witch', by: 'the landlord', in: ['w_host'] },
    { w: 'fiend-nature', by: 'Charlotte Brontë', in: ['w_author'] },
    { w: 'Creole', by: 'Rochester; the register', in: ['w_rochester', 'w_register'], identity: 'her mother’s origin, and so part of hers' },
    { w: 'wife', by: 'Rochester; the solicitor', in: ['w_rochester', 'w_register'], identity: 'her legal standing, the one thing that stopped the second wedding' },
    { w: 'sister', by: 'Mason; the register', in: ['w_mason', 'w_register'], identity: 'her family' },
    { w: 'Bertha', by: 'everyone', in: ['w_rochester', 'w_register', 'w_host'], identity: 'the name the novel uses for her' }
  ];

  /* ---------------------------------------------------- the witnesses */
  const witnesses = [
    { id: 'rochester', scene: 'w_rochester', name: 'Edward Fairfax Rochester', rel: 'Her husband', access: 'Four years with her in Jamaica, by his account. Ten years with her upstairs, through a keeper.', stake: 'If she is mad, he is blameless and cannot divorce. If she is not, the room is a prison.' },
    { id: 'mason', scene: 'w_mason', rescue: 'x_mason', name: 'Richard Mason', rel: 'Her brother', access: 'Visits from Jamaica. Saw her last April, and on one night in Chapter XX.', stake: 'A sister, a family name, and a trading house with business on both sides of the Atlantic.' },
    { id: 'grace', scene: 'w_grace', rescue: 'x_grace', name: 'Grace Poole', rel: 'Her keeper', access: 'Ten years in the same room.', stake: 'Her wages, and her own reputation, which the household spends as an alibi.' },
    { id: 'jane', scene: 'w_jane', rescue: 'x_jane', name: 'Jane Eyre', rel: 'The other bride; the narrator', access: 'One meeting by candlelight, one viewing in the attic, and sounds through walls.', stake: 'The novel is her autobiography.' },
    { id: 'register', scene: 'w_register', name: 'The register', rel: 'A document, read aloud by a solicitor', access: 'None. It records one day: a wedding in Spanish Town.', stake: 'The law’s interest in which marriage is valid.' },
    { id: 'host', scene: 'w_host', name: 'The landlord of the Rochester Arms', rel: 'A neighbour', access: 'Watched the last night from the lawn. Repeats what others say.', stake: 'A good story for a stranger.' },
    { id: 'author', scene: 'w_author', name: 'Charlotte Brontë', rel: 'Her author', access: 'Total. She wrote every other account you will hear.', stake: 'The novel, its reception, and her own explanation of it.' }
  ];
  const missingWitness = {
    name: 'Bertha Antoinetta Mason',
    rel: 'Not called',
    text: `She was present at the hearing in Chapter XXVI and fought her husband in front of the witnesses. She was the exhibit, never a witness. In the scenes the novel shows, nobody puts a question to her. The nearest is Rochester’s on the wedding morning, “how is your charge to-day?”, and he asks it of her keeper.`
  };

  /* ------------------------------------------------------- the readings */
  const READ_LABELS = { madness: 'Madness', resistance: 'Resistance', suffering: 'Suffering', open: 'Cannot be determined' };
  const ACTS = { laugh: 'The laugh (Ch. XI)', bedfire: 'The fire in her husband’s bed (Ch. XV)', bite: 'The attack on her brother (Ch. XX)', veil: 'The veil (Ch. XXV)' };
  const PLACEMENT = { interruption: 'An interruption', echo: 'An echo', reply: 'A reply', none: 'Only a sound' };

  /* -------------------------------------------------------- helpers */
  const nameOf = s => ({ bertha: 'Bertha', mrs: 'Mrs. Rochester', antoinetta: 'Antoinetta', none: 'the woman' })[s.name] || 'Bertha';
  const heardCount = s => s.heard.length;
  const needCite = s => s.role === 'judge' && (s.cited || []).length < 2 ? 'Cite two pieces of evidence first.' : null;

  /* ------------------------------------------------------------ scenes */
  const scenes = {

    threshold: {
      art: 'threshold', motes: 'dust', place: 'Outside the text', title: 'The Threshold', cite: 'Jane Eyre, 1847',
      beats: [{
        blocks: [
          P(`There is a door in *Jane Eyre* that the novel describes many times and opens once.`),
          P(`On one side of it: a governess, a master, a fortune, a marriage. On the other: a woman whom every character in the book describes, and none of them asks anything.`),
          P(`You are outside the book. You can go anywhere in it, and nobody inside can see you. One thing to watch for, though no one in the novel will point it out: who is standing next to her whenever she is described.`),
          P(`Phrases with a dotted underline open notes. Everything you read is kept in the Record.`, { small: true }),
          P(`Before you go in, decide what you are.`)
        ],
        choices: [
          { label: 'A reader', sub: 'I’ve come to read her more carefully than anyone has.', set: s => { s.role = 'reader'; }, next: true },
          { label: 'A judge', sub: 'Someone should weigh what was said about her.', set: s => { s.role = 'judge'; }, next: true },
          { label: 'A rescuer', sub: 'I’ve come to get her out.', set: s => { s.role = 'rescuer'; }, next: true }
        ]
      }, {
        blocks: [
          ROLE('reader', `You are a reader. You may go anywhere and hear everyone. Now and then you will be asked whether a claim is in the text or in you: close readers are the ones most tempted to over-read.`),
          ROLE('judge', `You are a judge. The court sits for as long as one candle burns: you may hear *four* of the seven witnesses, and put *one question* to each. To enter a finding you must cite two pieces of evidence. Your finding will bind what happens upstairs.`),
          ROLE('rescuer', `You are a rescuer. On three nights in the novel you can step in before she acts, and stop her. Each rescue works. Each also takes something she did out of the record, and you will see what goes with it.`),
          P(`Whatever you are, the house responds to you. When something in the picture glows, reach for it.`)
        ],
        choices: [
          { label: 'Go in', to: 'corridor' },
          { label: 'Choose again', set: s => { s.role = null; }, to: 'threshold' }
        ]
      }]
    },

    corridor: {
      art: 'corridor', motes: 'dust', place: 'Thornfield Hall · the third storey', title: 'A Curious Laugh', cite: 'Chapter XI',
      beats: [
        { blocks: [
          P(`Jane Eyre has just arrived as governess. Mrs. Fairfax, the housekeeper, is showing her the house from the top down.`),
          GO('doors', 'Walk down the corridor'),
          Q(JANE, 'Ch. XI', `…narrow, low, and dim, with only one little window at the far end, and looking, with its two rows of small black doors all shut, like a corridor in some [[Bluebeard’s castle|c_bluebeard]].`)
        ] },
        { blocks: [
          Q(JANE, 'Ch. XI', `…a laugh, struck my ear. It was a curious laugh; distinct, [[formal|c_formal]], mirthless. … It passed off in a clamorous peal that seemed to wake an echo in every lonely chamber; though it originated but in one, and [[I could have pointed out the door whence the accents issued|c_door]].`),
          GO('door', 'Find the door it came from')
        ] },
        { blocks: [
          Q('Mrs. Fairfax', 'Ch. XI', `“Some of the servants, very likely,” she answered: “[[perhaps Grace Poole|c_perhaps]].”`),
          Q('Mrs. Fairfax', 'Ch. XI', `“Too much noise, Grace,” said Mrs. Fairfax. “[[Remember directions!|c_directions]]”`)
        ],
        reading: {
          id: 'laugh', prompt: 'A laugh, through a shut door. What is it evidence of?',
          options: [
            { k: 'madness', sub: 'An uncontrolled sound from a disordered mind.', text: `If so, it is an oddly governed madness. Jane hears the laugh begin low, stop, and begin again louder, and calls it *formal*. A sound that can be started, stopped and modulated is at least partly controlled. Nobody in the corridor is alarmed by it, either. It has been heard before.` },
            { k: 'resistance', sub: 'A refusal to be quiet in a house that requires it.', text: `The house has a rule about her noise (“Remember directions!”), and the laugh breaks it. That much is in the text. Whether she means it as defiance is not, and you have supplied the intention. You are now doing what Mrs. Fairfax did: deciding what the sound is for.` },
            { k: 'suffering', sub: 'The sound of someone in distress.', text: `Possible, and the conditions upstairs would justify it. But Jane’s description contains no pain. The laugh is *distinct, formal, mirthless*, never anguished. The distress is your inference from what you know about the room, which the novel has not shown you yet.` },
            { k: 'open', sub: 'The sound tells us nothing about its meaning.', text: `That is fair to the evidence. But notice why the evidence is thin. Jane is standing at the door and could knock. The novel gives sound without content because nobody in the house is trying to learn what the sound means.` }
          ]
        },
        choices: [{ label: 'Weeks later, the roof', to: 'leads' }] }
      ]
    },

    leads: {
      art: 'leads', motes: 'none', place: 'Thornfield Hall · the leads', title: 'Who Blames Me?', cite: 'Chapter XII',
      beats: [
        { blocks: [
          P(`Some weeks later. Jane is restless in the quiet house.`),
          GO('trapdoor', 'Climb the stairs and raise the trap-door'),
          Q(JANE, 'Ch. XII', `Who blames me? Many, no doubt; and I shall be called discontented.`),
          Q(JANE, 'Ch. XII', `…I climbed the three staircases, raised the trap-door of the attic, and having reached [[the leads|c_leads]], looked out afar over sequestered field and hill, and along dim sky-line—that then I longed for a power of vision which might overpass that limit…`)
        ] },
        { blocks: [
          GO('horizon', 'Look out past the sky-line'),
          Q(JANE, 'Ch. XII', `It is in vain to say human beings ought to be satisfied with tranquillity: they must have action… Millions are condemned to a stiller doom than mine, and millions are in [[silent revolt|c_silent]] against their lot.`),
          Q(JANE, 'Ch. XII', `Women are supposed to be very calm generally: but women feel just as men feel; they need exercise for their faculties, and a field for their efforts, as much as their brothers do; they suffer from too rigid a restraint, too absolute a stagnation, precisely as men would suffer… It is thoughtless to condemn them, or [[laugh at them|c_laughat]], if they seek to do more or learn more than custom has pronounced necessary for their sex.`)
        ] },
        { blocks: [
          Q(JANE, 'Ch. XII', `When thus alone, I not unfrequently heard Grace Poole’s laugh: the same peal, the same low, slow ha! ha! which, when first heard, had thrilled me: I heard, too, her [[eccentric murmurs|c_murmurs]]; stranger than her laugh.`, { interrupt: true }),
          R('protest'),
          CHECK('heard', 'She heard Jane’s speech about women, and laughed in answer to it.', 'reading', `Nothing in the text says she heard Jane, or that the laugh answered anything. The placement is Brontë’s. The motive would be yours.`)
        ],
        reading: {
          id: 'placement', prompt: 'Brontë puts the laugh directly after Jane’s protest. How do you read the placement?', labels: PLACEMENT,
          options: [
            { k: 'interruption', sub: 'The novel loses its composure.', tier: 'criticism', by: 'Woolf, 1929', text: `Virginia Woolf quoted this passage in *A Room of One’s Own* and stopped at the laugh. She thought the break showed Brontë’s anger at her own constraints forcing its way into the novel and damaging it.\n\nA complication: in Woolf’s reading the laugh belongs to Charlotte Brontë’s temperament. It still does not belong to the woman laughing.` },
            { k: 'echo', sub: 'She voices what Jane cannot.', tier: 'criticism', by: 'Gilbert & Gubar, 1979', text: `Sandra Gilbert and Susan Gubar, in *The Madwoman in the Attic*, read Bertha as Jane’s dark double, the self that acts out the rage a governess cannot show. This adjacency is one of their strongest pieces of evidence.\n\nA complication: a double exists for the sake of the original. Spivak (1985) objected that this reading, for all its power, still treats the woman from Jamaica as an instrument of the Englishwoman’s self-discovery.` },
            { k: 'reply', sub: 'One woman answering another.', tier: 'margin', text: `This reading is yours; no critic is cited because it is yours to defend. If it is a reply, it is the only exchange between these two women in the novel, and neither knows the other is there. Jane hears the laugh and gives it to Grace Poole.\n\nA complication: a reply implies the laugher heard the protest. Nothing says she did. You have given her a motive in order to give her a voice.` },
            { k: 'none', sub: 'A noise in a house, nothing more.', text: `She may have laughed for any reason, or none. But the *placement* is not hers. Brontë decided which sentence the laugh would follow. Whatever else is uncertain, the arrangement is evidence of an author’s design, and you cannot read it as an accident.\n\nLook at what the arrangement does. Jane’s anger is articulate, reasoned, quotable. The anger above her arrives as noise. Each makes the other easier to read.` }
          ]
        },
        choices: [{ label: 'Go down to the hall', to: 'hearing' }] }
      ]
    },

    hearing: {
      art: 'gallery', motes: 'dust', place: 'Thornfield Hall · the hearing', title: 'The Hearing', cite: 'after Chapter XXVI',
      staged: 'The hearing is staged here. The testimony is the novel’s.',
      beats: [{
        blocks: [
          Q(ROCH, 'Ch. XXVI', `“Compare these clear eyes with the red balls yonder—this face with that mask—this form with that bulk; then [[judge me, priest of the gospel and man of the law|c_judgeme]], and remember with what judgment ye judge ye shall be judged!”`),
          R('eyes'),
          s => P(({
            judge: `You came as a judge. Rochester has asked for one, and has told you how to decide: by comparison.`,
            reader: `You came to read. In this chapter, reading means hearing evidence, and the first piece of evidence is a comparison.`,
            rescuer: `You came to rescue her. First you will have to hear what was said about her, by people who had reasons for saying it.`
          })[s.role] || ''),
          s => s.role === 'judge'
            ? P(`Seven accounts survive: six in the novel, one in a letter from its author. The court sits for one candle: you may hear four, and put one question to each. When you have heard at least two, you may close the hearing.`)
            : P(`Seven accounts survive: six in the novel, one in a letter from its author. Hear as many as you like. When you have heard at least two, you may close the hearing.`),
          ROLE('rescuer', `Three of these witnesses were in the house on nights you could change: her brother, her keeper and the other bride. Call one of them, and you will arrive before it happens.`),
          { t: 'witnesses' }
        ],
        choices: [
          { label: 'Close the hearing and enter a finding', to: 'finding', locked: s => heardCount(s) < 2 ? 'Hear at least two witnesses first.' : null }
        ]
      }]
    },

    w_rochester: {
      art: 'attic', motes: 'dust', place: 'The third storey · the wedding morning', title: 'Her Husband', cite: 'Chapters XXVI–XXVII', witness: 'rochester',
      beats: [
        { blocks: [
          P(`Rochester leads the witnesses up from the church. He lifts the tapestry from the wall and opens a second door.`),
          GO('tapestry', 'Follow him through the second door'),
          Q(JANE, 'Ch. XXVI', `In a room without a window, there burnt a fire guarded by a high and strong fender, and a lamp suspended from the ceiling by a chain.`),
          Q(JANE, 'Ch. XXVI', `In the deep shade, at the farther end of the room, a figure ran backwards and forwards. What it was, whether [[beast or human being|c_beast]], one could not, at first sight, tell: it grovelled, seemingly, on all fours; it snatched and growled like some strange wild animal: but it was covered with clothing, and a quantity of dark, grizzled hair, wild as a mane, hid its head and face.`),
          Q(JANE, 'Ch. XXVI', `The maniac bellowed: [[she parted her shaggy locks from her visage, and gazed wildly at her visitors|c_gazed]].`),
          Q(JANE, 'Ch. XXVI', `A fierce cry seemed to give the lie to her favourable report: the clothed hyena rose up, and stood tall on its hind-feet.`)
        ] },
        { blocks: [
          Q(ROCH, 'Ch. XXVI', `“That is [[my wife|c_mywife]],” said he. “Such is the sole conjugal embrace I am ever to know…”`),
          Q(ROCH, 'Ch. XXVI', `“And *this* is what I wished to have” (laying his hand on my shoulder): “this young girl, who stands so grave and quiet at the mouth of hell, looking collectedly at the gambols of a demon. I wanted her just as a change after that fierce ragout.”`),
          R('demon'),
          Q(ROCH, 'Ch. XXVI', `“You shall see what sort of a being I was cheated into espousing, and judge whether or not I had a right to break the compact, and [[seek sympathy with something at least human|c_human]].”`),
          Q(ROCH, 'Ch. XXVI', `“[[Bertha Mason is mad; and she came of a mad family|c_madfamily]]; idiots and maniacs through three generations! Her mother, the Creole, was both a madwoman and a drunkard!… Bertha, like a dutiful child, copied her parent in both points.”`)
        ] },
        { blocks: [
          P(`The next day, alone with Jane, he tells the history.`),
          Q(ROCH, 'Ch. XXVII', `“My father said nothing about [[her money|c_money]]; but he told me Miss Mason was the boast of Spanish Town for her beauty: and this was no lie. I found her a fine woman, in the style of Blanche Ingram: [[tall, dark, and majestic|c_dark]]. Her family wished to secure me because I was of a [[good race|c_race]]; and so did she.”`),
          Q(ROCH, 'Ch. XXVII', `“My father and my brother Rowland knew all this; but they thought only of [[the thirty thousand pounds|c_30k]], and joined in the plot against me.”`)
        ] },
        { blocks: [
          Q(ROCH, 'Ch. XXVII', `“[[Bertha Mason, the true daughter of an infamous mother|c_infamous]], dragged me through all the hideous and degrading agonies which must attend a man bound to a wife at once [[intemperate and unchaste|c_unchaste]].”`),
          Q(ROCH, 'Ch. XXVII', `“I was rich enough now—yet poor to hideous indigence: a nature the most gross, impure, depraved I ever saw, was associated with mine, and [[called by the law and by society a part of me|c_partofme]]. And I could not rid myself of it by any legal proceedings: for [[the doctors now discovered|c_doctors]] that my wife was mad—[[her excesses|c_excesses]] had prematurely developed the germs of insanity.”`)
        ] },
        { blocks: [
          P(`He describes a night in Jamaica, four years into the marriage.`),
          Q(ROCH, 'Ch. XXVII', `“The air was like sulphur-steams—I could find no refreshment anywhere… the moon was setting in the waves, broad and red, like a hot cannon-ball… I have a right to deliver myself from it if I can.”`),
          Q(ROCH, 'Ch. XXVII', `“[[A wind fresh from Europe|c_europe]] blew over the ocean and rushed through the open casement…”`),
          Q(ROCH, 'Ch. XXVII', `“‘Go,’ said Hope, ‘and live again in Europe: there it is not known what a sullied name you bear, nor what a filthy burden is bound to you. You may take the maniac with you to England; [[confine her with due attendance and precautions at Thornfield|c_confine]]: then travel yourself to what clime you will, and form what new tie you like. That woman, who has so abused your long-suffering, so sullied your name, so outraged your honour, so blighted your youth, [[is not your wife|c_notwife]], nor are you her husband… Let her identity, her connection with yourself, be [[buried in oblivion|c_oblivion]]…’”`)
        ] },
        { blocks: [
          Q(ROCH, 'Ch. XXVII', `“I had some trouble in finding an attendant for her, as it was necessary to select one on whose fidelity dependence could be placed; for [[her ravings would inevitably betray my secret|c_ravings]]: besides, she had [[lucid intervals|c_lucid]] of days—sometimes weeks—which she filled up with abuse of me.”`),
          CHECK('betray', 'Rochester himself says that what she said would give his secret away.', 'text', `In the text: “her ravings would inevitably betray my secret.” His own sentence concedes that her speech carried information.`)
        ] },
        { blocks: [
          Q('Jane Eyre', 'Ch. XXVII', `“Sir,” I interrupted him, “you are inexorable for that unfortunate lady: you speak of her with hate—with vindictive antipathy. It is cruel—[[she cannot help being mad|c_cannothelp]].”`),
          Q(ROCH, 'Ch. XXVII', `“…it is not because she is mad I hate her. [[If you were mad, do you think I should hate you?|c_ifyou]]”`),
          CROSS('rochester')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('rochester') }] }
      ]
    },

    w_mason: {
      art: 'bedside', motes: 'dust', place: 'The third storey · before dawn', title: 'Her Brother', cite: 'Chapters XX, XXVI–XXVII', witness: 'mason',
      beats: [
        { blocks: [
          P(`Chapter XX. A cry wakes the house. Rochester tells his guests a servant has had a nightmare, then fetches Jane and leaves her upstairs to sit with a wounded man until the surgeon comes. Richard Mason has been stabbed and bitten.`),
          GO('basin', 'Take the basin and sit with him'),
          Q('Richard Mason', 'Ch. XX', `“She bit me,” he murmured. “She worried me like a [[tigress|c_tigress]], when Rochester got the knife from her.”`),
          Q(ROCH, 'Ch. XX', `“I warned you,” was his friend’s answer; “I said—be on your guard when you go near her. Besides, you might have waited till to-morrow, and had me with you: it was mere folly to attempt [[the interview|c_interview]] to-night, and alone.”`),
          Q('Richard Mason', 'Ch. XX', `“[[I thought I could have done some good.|c_good]]” … “she looked so quiet at first.”`)
        ] },
        { blocks: [
          Q('Richard Mason', 'Ch. XX', `“She sucked the blood: [[she said she’d drain my heart|c_drain]],” said Mason.`),
          Q(JANE, 'Ch. XX', `I saw Mr. Rochester shudder: a singularly marked expression of disgust, horror, hatred, warped his countenance almost to distortion; but he only said—`),
          Q(ROCH, 'Ch. XX', `“Come, be silent, Richard, and never mind her [[gibberish|c_gibberish]]: [[don’t repeat it|c_dontrepeat]].”`)
        ],
        reading: {
          id: 'bite', prompt: 'She attacked the one visitor she had. What is the act?',
          options: [
            { k: 'madness', sub: 'Violence without reason.', text: `There may be no reason the text can show. But the act has a structure. Rochester says she took advantage of her keeper’s lapses “to secrete the knife with which she stabbed her brother”: she hid a weapon beforehand, waited, and told her brother what she meant to do. Planning and intention are what the word *madness* is usually used to deny.` },
            { k: 'resistance', sub: 'An answer to the family that sent her away.', text: `Rochester says the two families “joined in the plot” to arrange the marriage. If she blamed her brother, the novel never says so. Resistance against confinement might aim at the keeper or the key; she aimed at her brother’s heart. You may be right, but you have supplied a grievance the text does not record.` },
            { k: 'suffering', sub: 'Pain turned outward.', text: `The weeping in this scene belongs to Mason. Leaving at dawn, he begs, “Let her be taken care of; let her be treated as tenderly as may be: let her—” and breaks off in tears. The novel lets the brother’s grief be seen and heard. Hers, if it is grief, reaches us as teeth.` },
            { k: 'open', sub: 'We don’t know what passed between them.', text: `True, and the reason is in front of you: her words were reported once and then forbidden. The uncertainty here was enforced. Choosing it is accurate. It also accepts the result of Rochester’s instruction.` }
          ]
        } },
        { blocks: [
          Q(ROCH, 'Ch. XX', `“…when you get back to Spanish Town, you may think of her as [[dead and buried|c_dead]]—or rather, you need not think of her at all.”`),
          Q('Richard Mason', 'Ch. XX', `“Let her be taken care of; let her be treated as tenderly as may be: let her—” he stopped and burst into tears.`),
          Q(ROCH, 'Ch. XX', `“I do my best; and have done it, and will do it,” was the answer.`)
        ] },
        { blocks: [
          P(`Months later he stands up in the church at Thornfield.`),
          Q('Richard Mason', 'Ch. XXVI', `“She is now living at Thornfield Hall… I saw her there last April. I am her brother.”`),
          Q(ROCH, 'Ch. XXVII', `“…whom I cannot hate, whilst I abhor all his kindred, because he has [[some grains of affection in his feeble mind|c_grains]], shown in the continued interest he takes in his wretched sister…”`)
,
          CROSS('mason')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('mason') }] }
      ]
    },

    w_grace: {
      art: 'hearth', motes: 'embers', place: 'The third storey', title: 'Her Keeper', cite: 'Chapters XI, XV, XXV, XXVI, XXXVI', witness: 'grace',
      beats: [
        { blocks: [
          Q(JANE, 'Ch. XI', `…a set, square-made figure, red-haired, and with a hard, plain face…`),
          Q(ROCH, 'Ch. XXVI', `“Good-morrow, Mrs. Poole!” said Mr. Rochester. “How are you? and how is [[your charge|c_charge]] to-day?”`),
          GO('saucepan', 'Watch Grace at the hob'),
          Q('Grace Poole', 'Ch. XXVI', `“[[We’re|c_were]] tolerable, sir, I thank you,” replied Grace, lifting the boiling mess carefully on to the hob: “rather snappish, but not ’rageous.”`),
          P(`Grace is also the household’s explanation. Watch how often her name is used.`)
        ] },
        { blocks: [
          GO('keys', 'Notice where the keys are kept', 'keys'),
          H('The laugh · Chapter XI'),
          Q('Mrs. Fairfax', 'Ch. XI', `“Some of the servants, very likely,” she answered: “perhaps Grace Poole.”`),
          H('The fire · Chapter XV'),
          Q(JANE, 'Ch. XV', `This was a demoniac laugh—low, suppressed, and deep—uttered, as it seemed, at the very keyhole of my chamber door.`),
          Q(JANE, 'Ch. XV', `Tongues of flame darted round the bed: the curtains were on fire. … In the midst of blaze and vapour, Mr. Rochester lay stretched motionless, in deep sleep.`),
          Q('Jane and Rochester', 'Ch. XV', `“…there is a woman who sews here, called Grace Poole—she laughs in that way.”\n\n“Just so. [[Grace Poole—you have guessed it.|c_guessed]]” … “You are no talking fool: [[say nothing about it|c_saynothing]].”`)
        ],
        reading: {
          id: 'bedfire', prompt: 'She set fire to the curtains of her husband’s bed while he slept. What is the act?',
          options: [
            { k: 'madness', sub: 'Fire-raising, without sense.', text: `It has sense of one kind. Of every bed in Thornfield she chose her husband’s. She came at night, after slipping her keeper, and left before she was seen. The act is dangerous and possibly murderous. It is not random.` },
            { k: 'resistance', sub: 'An attack on the man who confined her.', text: `The target fits, and many critics have read Thornfield’s fires as rebellion against its master. Keep the cost in view too: this was an attempt on a sleeping man’s life. Calling it resistance does not make it less violent. It says you think the violence had a cause.` },
            { k: 'suffering', sub: 'Desperation, not design.', text: `Possible. But the novel gives her a laugh at Jane’s keyhole on the way: “low, suppressed, and deep.” Whatever she felt, the text records something nearer satisfaction than despair, and you have to set that detail aside.` },
            { k: 'open', sub: 'We can’t know what she intended.', text: `The evidence is unusually concrete here: a chosen bed, a night, an escape, a laugh. What cannot be determined is her intention. Notice that the household made no attempt to find out. It assigned the act to Grace Poole.` }
          ]
        } },
        { blocks: [
          H('The veil · Chapter XXV'),
          Q(ROCH, 'Ch. XXV', `“…A woman did, I doubt not, enter your room: and that woman was—must have been—Grace Poole.”`),
          P(`Three times the household explains her by naming another woman. Grace absorbs it: the strange servant who laughs, drinks and sets fires. One woman is employed partly to be the other’s cover story.`),
          GO('bottle', 'Look at the bottle on the mantel'),
          Q('The landlord', 'Ch. XXXVI', `“…she kept a private bottle of gin by her, and now and then took a drop over-much.”`),
          N('annotation', `The last account of Grace comes from the man at the inn, and it is about her drinking. Her lapses are how the woman upstairs got the keys.`)
,
          CROSS('grace')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('grace') }] }
      ]
    },

    w_jane: {
      art: 'bedroom', motes: 'dust', place: 'Jane’s room · two nights before the wedding', title: 'The Other Bride', cite: 'Chapters II, XXV', witness: 'jane',
      beats: [
        { blocks: [
          P(`Chapter XXV. The trunks are packed. Rochester has addressed the luggage cards himself.`),
          GO('cards', 'Open the drawer'),
          Q(JANE, 'Ch. XXV', `Mrs. Rochester! She did not exist: she would not be born till to-morrow, some time after eight o’clock a.m.;`),
          R('exist'),
          P(`That night Jane wakes to find a stranger in her room with a candle, looking at her wedding clothes. The next evening she tells Rochester.`),
          Q('Jane Eyre', 'Ch. XXV', `“It seemed, sir, a woman, tall and large, with thick and dark hair hanging long down her back. … it was white and straight; but whether gown, sheet, or shroud, I cannot tell.”`),
          Q('Jane Eyre', 'Ch. XXV', `“…she held it up, gazed at it long, and then she threw it over her own head, and [[turned to the mirror|c_mirror]].”`),
          GO('mirror', 'Look into the glass'),
          { t: 'mirror', who: 'Jane Eyre', cite: 'Ch. XXV', text: `At that moment I saw the reflection of the visage and features quite distinctly in the dark oblong glass.` },
          CHECK('mirror', 'Before she tore the veil, she put it on and looked at herself in the mirror.', 'text', `In the text: she “threw it over her own head, and turned to the mirror.” What she felt as she looked is not in the text.`)
        ] },
        { blocks: [
          Q('Jane Eyre', 'Ch. XXV', `“It was a [[discoloured face—it was a savage face|c_discoloured]]. I wish I could forget the roll of the red eyes and the fearful blackened inflation of the lineaments!”`),
          Q('Jane Eyre', 'Ch. XXV', `“…Of the foul German spectre—[[the Vampyre|c_vampyre]].”`),
          GO('veil', 'Pick up the veil'),
          Q('Jane Eyre', 'Ch. XXV', `“…it removed my veil from its gaunt head, rent it in two parts, and flinging both on the floor, trampled on them.”`),
          Q('Jane Eyre', 'Ch. XXV', `“…she thrust up her candle close to my face, and [[extinguished it under my eyes|c_extinguished]]. I was aware her lurid visage flamed over mine, and I lost consciousness…”`)
        ],
        reading: {
          id: 'veil', prompt: 'She tried on the bride’s veil, looked at herself, and tore it in two. What is the act?',
          options: [
            { k: 'madness', sub: 'Confused, destructive, delusional.', text: `Even Rochester, the novel’s chief witness for her madness, reads the act as memory: the veil “perhaps brought back vague reminiscences of her own bridal days.” Memory requires a past self, a bride with a name in a church in Spanish Town.` },
            { k: 'resistance', sub: 'She destroyed the instrument of a bigamous wedding.', text: `She chose the right object: the veil of a marriage that would be illegal, two days before it happens. The act stops nothing, though. The wedding is stopped by a solicitor and a brother. Gilbert and Gubar read her as doing what Jane cannot admit to wanting; Spivak answers that this makes Bertha useful to Jane’s story rather than to her own.` },
            { k: 'suffering', sub: 'Grief for her own marriage.', text: `Before she tore it, she put it on and looked in the glass. That sequence is in the text. What she felt while she looked is not, and grief is the most sympathetic way to fill the gap.` },
            { k: 'open', sub: 'The text gives us acts, not feelings.', text: `Accurate. Now watch what Rochester does with Jane’s account of the same night.` }
          ]
        } },
        { blocks: [
          Q(ROCH, 'Ch. XXV', `“[[The creature of an over-stimulated brain|c_creature]]; that is certain.” … “I must be careful of you, my treasure: nerves like yours were not made for rough handling.”`),
          Q('Jane Eyre', 'Ch. XXV', `“Sir, depend on it, my nerves were not in fault; [[the thing was real|c_real]]: the transaction actually took place.”`),
          Q(ROCH, 'Ch. XXV', `“It was half dream, half reality. A woman did, I doubt not, enter your room: and that woman was—must have been—Grace Poole. … the long dishevelled hair, the swelled black face, the exaggerated stature, were figments of imagination…”`)
        ] },
        { blocks: [
          P(`Chapter II. Jane is ten. She has struck her cousin John Reed, and the servants are dragging her to the red-room.`),
          Q('Bessie', 'Ch. II', `“Hold her arms, Miss Abbot: [[she’s like a mad cat|c_madcat]].”`),
          Q('Bessie', 'Ch. II', `“If you don’t sit still, you must be tied down,” said Bessie. “Miss Abbot, lend me your garters; she would break mine directly.”`),
          Q(JANE, 'Ch. II', `The fact is, I was a trifle beside myself; or rather *out* of myself, as the French would say… and, [[like any other rebel slave|c_rebelslave]], I felt resolved, in my desperation, to go all lengths.`)
,
          CROSS('jane')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('jane') }] }
      ]
    },

    w_register: {
      art: 'church', motes: 'dust', place: 'The church at Thornfield · the wedding morning', title: 'The Register', cite: 'Chapter XXVI', witness: 'register',
      onEnter: (s, h) => h.flag('register'),
      beats: [
        { blocks: [
          P(`The clergyman has asked whether anyone knows an impediment. A stranger answers: Mr. Briggs, a solicitor from London. He reads a statement made by Richard Mason.`),
          GO('paper', 'Look at the paper in his hand'),
          Q('Mr. Briggs, reading Mason’s statement', 'Ch. XXVI', `“I affirm and can prove that on the 20th of October A.D. —— (a date of fifteen years back), Edward Fairfax Rochester, of Thornfield Hall, in the county of ——, and of Ferndean Manor, in ——shire, England, was married to my sister, [[Bertha Antoinetta Mason|c_fullname]], daughter of [[Jonas Mason, merchant|c_jonas]], and of [[Antoinetta his wife|c_antoinetta]], [[a Creole|c_creole]], at [[—— church|c_dashes]], Spanish Town, Jamaica.”`, { doc: true }),
          CHECK('creole', 'The novel makes clear that she was Black.', 'reading', `Not in the text. The statement calls her mother “a Creole,” a word that in this period could describe white people born in the Caribbean as well as people of African or mixed descent. The novel never settles her race.`)
        ] },
        { blocks: [
          Q('Mr. Briggs', 'Ch. XXVI', `“I would remind you of [[your lady’s existence, sir, which the law recognises|c_existence]], if you do not.”`),
          P(`Jane asks how a stranger came to know about her wedding at all.`),
          Q('Mr. Briggs', 'Ch. XXVI', `“Mr. Mason does. Mr. Eyre has been [[the Funchal correspondent of his house|c_funchal]] for some years. When your uncle received your letter intimating the contemplated union between yourself and Mr. Rochester, Mr. Mason, who was staying at Madeira to recruit his health, on his way back to Jamaica, happened to be with him.”`)
,
          CROSS('register')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('register') }] }
      ]
    },

    w_host: {
      art: 'inn', motes: 'none', place: 'The Rochester Arms · months later', title: 'The Last Account', cite: 'Chapter XXXVI', witness: 'host',
      beats: [
        { blocks: [
          GO('ruin', 'Look up at the house on the hill'),
          P(`Chapter XXXVI. Jane, who left Thornfield after the failed wedding, has come back and found it a ruin. At the inn she asks what happened, without saying who she is. The landlord tells her.`),
          GO('sign', 'Go in under the sign'),
          Q('The landlord', 'Ch. XXXVI', `“…[[who was as cunning as a witch|c_witch]], would take the keys out of her pocket…”`),
          Q('The landlord', 'Ch. XXXVI', `“…she set fire first to the hangings of the room next her own…”`),
          P(`Then, he says, she went down to the room the governess had slept in and set the bed alight.`),
          Q('The landlord', 'Ch. XXXVI', `“…but there was nobody sleeping in it, fortunately.” … “(she was like as if [[she knew somehow how matters had gone on|c_knew]], and had a spite at her)”`),
          Q('The landlord', 'Ch. XXXVI', `“They say she had nearly burnt her husband in his bed once: [[but I don’t know about that|c_dontknow]].”`)
        ] },
        { blocks: [
          Q('The landlord', 'Ch. XXXVI', `“…they called out to him that she was on the roof, where she was standing, [[waving her arms, above the battlements, and shouting out till they could hear her a mile off|c_mile]].”`),
          Q('The landlord', 'Ch. XXXVI', `“I witnessed, and several more witnessed, Mr. Rochester ascend through the sky-light on to the roof; [[we heard him call ‘Bertha!’|c_heardhim]] … she yelled and gave a spring, and the next minute she lay smashed on the pavement.”`),
          Q('The landlord', 'Ch. XXXVI', `“She was a big woman, and had long black hair: we could see it streaming against the flames as she stood.”`),
          Q('The landlord', 'Ch. XXXVI', `“Dead! Ay, dead as the stones on which her brains and blood were scattered.”`),
          P(`Two chapters later the novel’s last chapter opens with four words.`),
          Q(JANE, 'Ch. XXXVIII', `Reader, I married him.`),
          R('married')
,
          CROSS('host')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('host') }] }
      ]
    },

    w_author: {
      art: 'desk', motes: 'dust', place: 'Haworth Parsonage, Yorkshire', title: 'Her Author', cite: 'Letter to W. S. Williams, 4 January 1848', witness: 'author',
      beats: [
        { blocks: [
          P(`Three months after the novel came out, Charlotte Brontë, still writing as Currer Bell, answers readers who found Bertha’s character shocking. She writes to William Smith Williams, a reader at her publishers.`),
          GO('letter', 'Read over her shoulder'),
          Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“There is a phase of insanity which may be called [[moral madness|c_moral]], in which all that is good or even human seems to disappear from the mind and a [[fiend-nature|c_fiend]] replaces it.”`, { doc: true }),
          Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“…I agree with them that the character is shocking… profound pity ought to be the only sentiment elicited by the view of such degradation… [[I have erred in making horror too predominant|c_erred]].”`, { doc: true }),
          Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“Mrs. Rochester indeed lived a sinful life before she was insane, but [[sin is itself a species of insanity|c_sin]]… the truly good behold and compassionate it as such.”`, { doc: true }),
          P(`The author is also a witness, and the most powerful one. Everything else you have heard, she wrote.`)
,
          CROSS('author')
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('author') }] }
      ]
    },

    finding: {
      art: 'gallery', motes: 'dust', place: 'Thornfield Hall · the hearing', title: 'The Finding', cite: 'after Chapter XXVI', staged: 'The hearing is staged here.',
      beats: [{
        blocks: [
          s => P(`Rochester asked for a verdict. You have heard ${heardCount(s)} of seven witnesses.` + (heardCount(s) < 7 ? ` You did not hear ${witnesses.filter(w => !s.heard.includes(w.id)).map(w => w.name).join(', ')}.` : ` You did not hear her.`)),
          P(`The hearing must enter a finding.`),
          s => s.role === 'judge' ? P(`A judge rules on evidence. Cite two fragments from the record before you rule.`) : P(`You may cite evidence from the record if you like. A finding stands either way.`),
          { t: 'cite' }
        ],
        choices: [
          { label: 'Mad', sub: 'The testimony agrees. Her own testimony will be inadmissible.', set: s => { s.finding = 'mad'; }, to: 'stair', locked: s => needCite(s) },
          { label: 'Not proven', sub: 'The evidence fails.', set: s => { s.finding = 'notproven'; }, to: 'stair', locked: s => needCite(s) },
          { label: 'This court is not competent to judge her', sub: 'Refuse the bench.', set: s => { s.finding = 'incompetent'; }, to: 'stair', locked: s => needCite(s) },
          { label: 'Adjourn', sub: 'Call the missing witness.', set: s => { s.finding = 'adjourn'; }, to: 'stair', locked: s => needCite(s) }
        ]
      }]
    },

    stair: {
      art: 'stairs', motes: 'dust', place: 'Thornfield Hall · the stairs', title: 'Upstairs', cite: 'after Chapter XXVI', staged: 'This passage is staged.',
      beats: [{
        blocks: [
          s => P(({
            mad: `You find her mad. Every witness who said so either had something to lose if she were not, or never spoke with her. That does not make the finding wrong. It makes it interested, and now it is yours. It also has a consequence: a court that has found a witness mad does not take her testimony.`,
            notproven: `Not proven: the Scottish verdict for a case where the evidence fails. Notice what it leaves in place. Nothing has been proved against her, and the door is still locked.`,
            incompetent: `You refuse the bench Rochester offered. But someone will decide what happens to her, and declining to judge does not take you out of the house.`,
            adjourn: `The hearing adjourns. If she is to be heard, it will have to be where she is.`
          })[s.finding] || ''),
          P(`Whatever you found, she is still upstairs. You climb the three staircases Jane climbed on her way to the roof. The tapestry has been drawn back. The door is unlocked, for you.`)
        ],
        choices: [{ label: 'Go in', to: 'room' }]
      }]
    },

    room: {
      art: 'room', motes: 'dust', place: 'The third storey · the inner room', title: 'A Room Without a Window', cite: 'after Chapter XXVI', measure: 'narrow',
      staged: 'This scene is staged. The room is the novel’s; your presence in it is not.',
      beats: [{
        blocks: [
          Q(JANE, 'Ch. XXVI', `In a room without a window, there burnt a fire guarded by a high and strong fender, and a lamp suspended from the ceiling by a chain.`),
          P(`There are no visitors now. Grace Poole is asleep in her chair. At the far end of the room a woman sits on the floor with her back to the wall. You can look at anything here.`)
        ],
        examineLabel: 'Look at',
        examine: [
          { id: 'window', label: 'The window that isn’t there', blocks: [
            Q(ROCH, 'Ch. XXVII', `“…saw her safely lodged in that third-storey room, of whose secret inner cabinet she has now for ten years made a wild beast’s den—a goblin’s cell.”`),
            N('annotation', `Ten years without a window, by his count. Jane climbed to the leads to look at the horizon, and the novel gives that longing to her. The woman in this room reaches the roof once.`)
          ] },
          { id: 'fire', label: 'The fire behind the fender', blocks: [
            N('annotation', `Fire is the one thing in this room she could use, and it is fenced. Her fires in the novel: her husband’s bed curtains (Chapter XV); then, on the last night, the hangings of the room next to hers, the governess’s empty bed, and the house (Chapter XXXVI).`)
          ] },
          { id: 'lamp', label: 'The lamp on its chain', blocks: [
            N('conjecture', `Even the light is chained. That is an image, not evidence. A hanging lamp on a chain is ordinary, and in this room it is there for safety. Safety is the word every confinement in this story uses.`)
          ] },
          { id: 'tapestry', label: 'The tapestry over the door', blocks: [
            Q(JANE, 'Ch. XXVI', `He lifted the hangings from the wall, uncovering the second door: this, too, he opened.`),
            N('annotation', `A door hidden behind a picture of something else. From the corridor, this room does not exist.`)
          ] },
          { id: 'pocket', label: 'Grace Poole’s pocket', flag: 'keys', blocks: [
            Q(ROCH, 'Ch. XXVII', `“The lunatic is both cunning and malignant; she has never failed to take advantage of her guardian’s temporary lapses; once to secrete the knife with which she stabbed her brother, and twice to possess herself of the key of her cell, and issue therefrom in the night-time.”`),
            N('annotation', `Waiting for a lapse, hiding a knife, taking a key, choosing the night: these are plans. The novel’s word for her planning is *cunning*, which is what intelligence gets called when it belongs to someone who must not be trusted.`)
          ] },
          { id: 'her', label: 'Her', blocks: [
            N('conjecture', `You have read five descriptions of this face: *discoloured*, *savage*, *purple*, *the swelled black face*, and, fifteen years ago, *a fine woman… tall, dark, and majestic*. Each came from someone who needed it to prove something.\n\nThis game will not describe her. She is looking at you. Everyone in the novel who came into this room came to look at her, and each left with a clearer idea of themselves.`)
          ] }
        ],
        choices: [
          { label: 'Speak to her', to: 'name', when: s => s.examined.length >= 2, locked: s => s.finding === 'mad' ? 'You found her mad. In your court, her testimony is inadmissible.' : null },
          { label: 'Leave without speaking', set: s => { s.voice.mode = 'unasked'; }, to: 'night', when: s => s.examined.length >= 2 }
        ],
        waitNote: s => s.examined.length < 2 ? 'Look at two or more things before you decide what to do.' : null
      }]
    },

    name: {
      art: 'margin', motes: 'dust', place: 'The inner room', title: 'A Name for the Record', staged: 'This scene is staged.', measure: 'narrow',
      beats: [{
        blocks: [
          P(`Before her testimony can be entered, the record needs a name for her. Every name she has was given to her by someone.`)
        ],
        choices: [
          { label: 'Bertha', sub: 'The name the novel uses.', set: s => { s.name = 'bertha'; }, to: 'voice' },
          { label: 'Mrs. Rochester', sub: 'The name the marriage gave her.', set: s => { s.name = 'mrs'; }, to: 'voice' },
          { label: 'Antoinetta', sub: 'Her mother’s name, and part of her own.', set: s => { s.name = 'antoinetta'; }, to: 'voice', locked: s => s.flags.includes('register') ? null : 'You haven’t read the document in which this name appears.' },
          { label: 'No name', sub: 'Let the record call her nothing she did not choose.', set: s => { s.name = 'none'; }, to: 'voice' }
        ]
      }]
    },

    voice: {
      art: 'margin', motes: 'dust', place: 'The margin', title: 'Her Testimony', staged: 'This scene is staged.', measure: 'wide',
      beats: [{
        blocks: [
          s => s.name === 'mrs' ? Q(JANE, 'Ch. XXV', `Mrs. Rochester! She did not exist: she would not be born till to-morrow, some time after eight o’clock a.m.;`) : null,
          s => P(({
            bertha: `Bertha: the name the household uses, and the one Jean Rhys’s heroine says was forced on her. It is the only name the novel’s readers know her by.`,
            mrs: `Jane thought this on the night before her wedding, looking at the luggage cards. Mrs. Rochester did exist. She was upstairs. The title passes to Jane in the last chapters, and you have given it back.`,
            antoinetta: `Antoinetta: her mother’s name, read once in a church. You have preferred the name that runs through women to the one that came with marriage. Rhys made a similar choice in 1966. Neither of you heard her choose it.`,
            none: `No name. The record will call her *the woman*, as the novel’s chapters mostly do. Refusing to name her can protect her from other people’s words. It can also leave her as anonymous as the attic did.`
          })[s.name] || ''),
          s => P(`${s.name === 'none' ? 'She' : nameOf(s)} has been called as a witness. The page is hers. How will her testimony be entered?`)
        ],
        choices: [
          { label: 'Give her words from the record', sub: 'Compose her statement from words already written about her.', to: 'v_tiles' },
          { label: 'Write in her voice', sub: 'Your own words, in your own hand.', to: 'v_write' },
          { label: 'Leave the page blank', sub: 'Wait, and do not speak for her.', to: 'v_silence' }
        ]
      }]
    },

    v_tiles: {
      art: 'margin', motes: 'dust', place: 'The margin', title: 'Her Testimony', staged: 'This scene is staged.', measure: 'wide',
      beats: [{
        blocks: [
          P(`These are the words the record holds. Each was said by someone. Compose her statement.`),
          { t: 'tiles' },
          s => s.voice.mode === 'tiles' ? N('annotation', `Every word you gave her was first said about her, by a husband, a brother, a keeper, a narrator, a landlord or an author. The few that were hers in any sense (*drain my heart*) reached you through her brother and were forbidden to be repeated.\n\nMiranda Fricker calls this hermeneutical injustice: a gap in the shared resources for making sense of experience, which leaves some people unable to put what happens to them into words others will understand. You could not give her a sentence of her own because the novel never gave her a vocabulary.` + (s.struck.length ? `\n\nThe words you struck from the record were not available to her either.` : '')) : null
        ],
        choices: [{ label: 'Go on', to: 'night', when: s => s.voice.mode === 'tiles' }]
      }]
    },

    v_write: {
      art: 'margin', motes: 'dust', place: 'The margin', title: 'Her Testimony', staged: 'This scene is staged.', measure: 'wide',
      beats: [{
        blocks: [
          s => P(`Write what ${s.name === 'none' ? 'she' : nameOf(s)} says. Nobody will correct you.`),
          { t: 'write' },
          s => s.voice.mode === 'write' ? N('criticism', `These are your words. You may have given her a grievance, a history, a tenderness. Jean Rhys did this at the length of a novel in *Wide Sargasso Sea* (1966): a childhood in Jamaica after emancipation, a mother, a name, a reason. Rhys’s book ends with her heroine waking from a dream of fire and going down the dark passage with a candle. Even Rhys did not change what happens next.\n\nGayatri Chakravorty Spivak’s essay “Can the Subaltern Speak?” (1988) warns about this move. When a sympathetic writer claims to let the silenced speak, the writer’s own part in the speaking tends to drop out of view. What you wrote is in your hand, and the margin will keep it that way.`, 'Rhys 1966 · Spivak 1988') : null
        ],
        choices: [{ label: 'Go on', to: 'night', when: s => s.voice.mode === 'write' }]
      }]
    },

    v_silence: {
      art: 'margin', motes: 'dust', place: 'The margin', title: 'Her Testimony', staged: 'This scene is staged.', measure: 'wide',
      beats: [{
        blocks: [{ t: 'silence' }],
        choices: [{ label: 'Go on', to: 'night', when: s => s.voice.mode === 'silence' }]
      }]
    },

    night: {
      art: 'night', motes: 'none', place: 'Thornfield Hall · the last night', title: 'The Last Night', cite: 'staged from Chapter XXXVI',
      staged: 'The novel narrates this night only at third hand, months afterwards. Here you are present for it.',
      beats: [{
        blocks: [
          P(`Jane has gone. After she left, Rochester shut himself up at Thornfield and would not cross the threshold except at night. The novel does not show this night. A landlord will tell it to Jane, months later, in the past tense.`),
          P(`Tonight Grace Poole has had a drop over-much. She is asleep in her chair, and the keys are in her pocket.`),
          s => P(`${s.name === 'none' ? 'The woman' : nameOf(s)} is awake.`),
          P(`You can see everything in this house. You can touch one thing.`)
        ],
        choices: [
          { label: 'Take the keys and open the door for her', to: 'e_door', locked: s => s.flags.includes('keys') ? null : 'You never looked for the keys, and in the dark you cannot find them.' },
          { label: 'Wake Grace Poole', to: 'e_keeper' },
          { label: 'Do nothing. Follow her, and witness', to: 'e_roof' },
          { label: 'Step back, and let her choose', to: 'e_unwritten', locked: s => s.voice.mode === 'silence' ? null : (s.voice.mode === 'unasked' ? 'You never asked her anything.' : 'You have already spoken for her.') },
          { label: 'Follow the register back to Spanish Town', to: 'e_shore', locked: s => s.flags.includes('register') ? null : 'You never read the register, so you don’t know where to go.' },
          { label: 'Close the book', to: 'e_close' },
          { label: 'Write in the margin of Chapter XI', sub: 'The one mark a reader can leave in a book.', to: 'e_margin', when: s => s.role === 'reader' },
          { label: 'Declare a mistrial', sub: 'Rule that no hearing in this house could judge her.', to: 'e_mistrial', when: s => s.role === 'judge', locked: s => s.finding === 'mad' ? 'You have already found her mad.' : null },
          { label: 'Keep her safe: lock the door and stay with her', sub: 'Prevent this night too.', to: 'e_safe', when: s => s.role === 'rescuer', locked: s => (s.erased || []).length >= 2 ? null : 'You have not prevented enough of what she does to keep her from this.' }
        ]
      }]
    },

    /* ------------------------------------------------- the rescuer's nights */
    x_mason: {
      art: 'bedside', motes: 'dust', place: 'Thornfield Hall · a night in Chapter XX', title: 'Before Her Brother Goes Up', cite: 'staged from Chapter XX', witness: 'mason',
      staged: 'You have arrived before the novel’s events. What happens if you act is invented.',
      beats: [{
        blocks: [
          P(`Richard Mason is a guest at Thornfield. Tonight, after the house is asleep, he will go up to the third storey alone to see his sister.`),
          Q('Richard Mason', 'Ch. XX', `“I thought I could have done some good.”`),
          P(`You are at the foot of the stairs. You could stop him.`)
        ],
        choices: [
          { label: 'Stop him on the stairs', sub: 'No one will be hurt tonight.', set: (s, h) => { h.erase('bite'); h.flag('rescue-mason'); }, to: 'r_mason' },
          { label: 'Let the night happen', sub: 'Hear what her brother has to say about it.', set: (s, h) => h.flag('rescue-mason'), to: 'w_mason' }
        ]
      }]
    },
    r_mason: {
      art: 'bedside', motes: 'dust', place: 'Thornfield Hall · a night in Chapter XX', title: 'A Quiet Night', cite: 'Ending of a rescue', staged: 'This scene is invented. It does not occur in the novel.',
      beats: [{
        blocks: [
          P(`You stop him. Mason goes back to his room. Upstairs, nothing happens, and nobody is hurt.`),
          P(`Because of you, these are no longer in the record:`),
          { t: 'list', items: [
            'the knife she hid, and her brother’s wounds;',
            'the only words the novel attributes to her: “she said she’d drain my heart”;',
            'Rochester calling them “gibberish,” and ordering that they not be repeated;',
            'Mason’s tears, and his plea that she be treated “as tenderly as may be.”'
          ] },
          P(`You have kept her from a violent act and from her only recorded sentence at the same moment. The novel gives her nothing else to say.`)
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('mason') }]
      }]
    },
    x_grace: {
      art: 'hearth', motes: 'embers', place: 'Thornfield Hall · a night in Chapter XV', title: 'Before the Fire', cite: 'staged from Chapter XV', witness: 'grace',
      staged: 'You have arrived before the novel’s events. What happens if you act is invented.',
      beats: [{
        blocks: [
          P(`Some weeks after Jane meets her master. Grace Poole is asleep, and tonight the woman upstairs will take the key, go down through the house and set fire to the curtains of her husband’s bed while he sleeps.`),
          P(`You are on the stairs with her. You could take the candle out of her hand.`)
        ],
        choices: [
          { label: 'Take the candle from her', sub: 'No fire tonight.', set: (s, h) => { h.erase('bedfire'); h.flag('rescue-grace'); }, to: 'r_grace' },
          { label: 'Let the night happen', sub: 'Hear what her keeper is blamed for.', set: (s, h) => h.flag('rescue-grace'), to: 'w_grace' }
        ]
      }]
    },
    r_grace: {
      art: 'hearth', motes: 'dust', place: 'Thornfield Hall · a night in Chapter XV', title: 'No Fire', cite: 'Ending of a rescue', staged: 'This scene is invented. It does not occur in the novel.',
      beats: [{
        blocks: [
          P(`You take the candle. She goes back up the stairs. Rochester sleeps through the night in an unburnt bed.`),
          P(`Because of you, these are no longer in the record:`),
          { t: 'list', items: [
            'the low laugh at Jane’s keyhole;',
            'the fire in her husband’s bed curtains;',
            'Jane putting out the fire and waking him: the night she saves his life, one of the turning points of their romance;',
            'Rochester’s “Grace Poole—you have guessed it,” and his order to Jane to say nothing.'
          ] },
          P(`In stopping her you also stopped a scene that draws Jane and Rochester together. Her acts are woven into the other woman’s plot, and the novel cannot lose one without losing part of the other.`)
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('grace') }]
      }]
    },
    x_jane: {
      art: 'bedroom', motes: 'dust', place: 'Jane’s room · two nights before the wedding', title: 'Before the Veil', cite: 'staged from Chapter XXV', witness: 'jane',
      staged: 'You have arrived before the novel’s events. What happens if you act is invented.',
      beats: [{
        blocks: [
          P(`The wedding clothes are laid out. Tonight a stranger with a candle will come into this room, find the veil, put it on, look at herself in the glass, and tear it in two.`),
          P(`You could take the veil out of the room before she comes.`)
        ],
        choices: [
          { label: 'Hide the veil', sub: 'Nothing for her to find.', set: (s, h) => { h.erase('veil'); h.flag('rescue-jane'); }, to: 'r_jane' },
          { label: 'Let the night happen', sub: 'Hear the other bride’s account of it.', set: (s, h) => h.flag('rescue-jane'), to: 'w_jane' }
        ]
      }]
    },
    r_jane: {
      art: 'bedroom', motes: 'dust', place: 'Jane’s room · two nights before the wedding', title: 'Nothing Torn', cite: 'Ending of a rescue', staged: 'This scene is invented. It does not occur in the novel.',
      beats: [{
        blocks: [
          P(`You hide the veil. Whether or not she comes, she finds nothing to try on. In the morning Jane’s wedding things are untouched.`),
          P(`Because of you, these are no longer in the record:`),
          { t: 'list', items: [
            'the veil over her head, and her face in the dark oblong glass;',
            'the face Jane saw by candlelight, and the night Jane could not explain away;',
            'Rochester’s concession that she spent her fury on the veil because it “perhaps brought back vague reminiscences of her own bridal days.”'
          ] },
          P(`The veil is the one act in the novel that even her husband reads as memory. Taking it away kept the wedding things safe and took from her the only scene in which she remembers being a bride.`)
        ],
        choices: [{ label: 'Return to the hearing', to: 'hearing', set: (s, h) => h.hear('jane') }]
      }]
    },

    /* --------------------------------------------------------- role endings */
    e_margin: {
      art: 'margin', motes: 'dust', place: 'Chapter XI, again', title: 'The Margin', cite: 'Ending · for readers', ending: 'margin', staged: 'This ending is invented. The quotation is the novel’s; the note is yours.',
      beats: [
        { blocks: [
          P(`You go back to the beginning, to the corridor of small black doors, and find the sentence where the woman upstairs was first explained away.`),
          Q('Mrs. Fairfax', 'Ch. XI', `“Some of the servants, very likely,” she answered: “perhaps Grace Poole.”`),
          P(`A reader cannot change a sentence. A reader can write beside it.`),
          { t: 'marginwrite' }
        ], wait: 'margin-written' },
        { blocks: [
          { t: 'marginshow' },
          P(`The novel will say *perhaps Grace Poole* every time it is opened. Your note does not change that. It changes what the next reader sees beside it.`),
          P(`Every reading you met in this game, Woolf’s, Gilbert and Gubar’s, Spivak’s, Rhys’s, is a note written beside this book by someone who could not change it. You never opened her door. You changed how the door is read.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },
    e_mistrial: {
      art: 'gallery', motes: 'dust', place: 'Thornfield Hall · the hearing', title: 'Mistrial', cite: 'Ending · for judges', ending: 'mistrial', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You reconvene the hearing at midnight and rule that it cannot go on. You give your reasons.`),
          s => ({ t: 'list', items: [
            'The accused was never called. In the scenes the novel shows, no one puts a question to her.',
            'No doctor is named and no examination is described. The diagnosis arrives in her husband’s subordinate clause.',
            'Every witness who calls her mad had something at stake: a marriage, a fortune, a wage, a heroine, a novel.',
            'One witness is a document. One repeats what “they say.”',
            'Her only recorded sentence was ordered not to be repeated, and called gibberish.',
            `This court heard ${s.heard.length} of seven accounts before its candle burned down.`
          ] })
        ] },
        { blocks: [
          P(`A mistrial ends a proceeding without a verdict. Nothing has been decided about her, and nothing can be, because every court that could hear her is made of the same witnesses.`),
          P(`She stays where she is. Rochester’s demand, “judge me,” goes unanswered. So does the question nobody asked her to put.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },
    e_safe: {
      art: 'keeper', motes: 'dust', place: 'Thornfield Hall · the inner room', title: 'Safekeeping', cite: 'Ending · for rescuers', ending: 'safe', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You take the keys from Grace Poole’s pocket, lock the door from the inside, and sit down by the fender. Nothing happens tonight. Nothing will happen on any night.`),
          P(`Here is what the record now says she did:`),
          { t: 'acts' }
        ] },
        { blocks: [
          P(`She is safe and nobody is hurt. Thornfield stands; Rochester keeps his sight and his hand.`),
          P(`You came to free her. You have kept her in the room she was kept in, and taken away the few things she did there. Rescue, done thoroughly, has become a second keeper.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    /* ------------------------------------------------------------ endings */
    e_door: {
      art: 'door', motes: 'dust', place: 'Thornfield Hall · the corridor', title: 'The Door', cite: 'Ending', ending: 'door', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You take the keys from Grace Poole’s pocket. The lock turns easily. It was never a complicated lock.`),
          s => P(`${s.name === 'none' ? 'She' : nameOf(s)} stands in the doorway for a long time, looking down the corridor of small black doors. Then she goes.`),
          s => (s.opened.includes('c_money') || s.opened.includes('c_30k') || s.opened.includes('c_partofme') || s.opened.includes('c_doctors'))
            ? P(`Beyond the corridor is an England in which her fortune belongs in law to her husband, her marriage cannot be dissolved, and the diagnosis that made it permanent travels with her. You opened a door. You did not open the law, and the law was the larger room.`)
            : P(`Beyond the corridor is a country you did not look into. What waited outside for a married woman with a madwoman’s reputation and no money in her own name, the record could have told you. You didn’t open those pages.`),
          P(`Where she goes is not in any text. For the first time, nobody is narrating her, including you.`),
          P(`Without the fire, Thornfield stands and Rochester keeps his eye and his hand. The obstacle to Jane’s marriage is somewhere on the roads of England, still his wife, and the novel has no last chapter.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    e_keeper: {
      art: 'keeper', motes: 'dust', place: 'Thornfield Hall · the inner room', title: 'The Keeper', cite: 'Ending', ending: 'keeper', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You shake Grace Poole awake. She sits up, feels for the keys, finds them, and checks the lock. Nothing burns tonight.`),
          P(`Thornfield stands. Rochester keeps his sight and his hand. Jane, wherever she is, has no reason to come back: the obstacle to her marriage is alive upstairs and will stay there.`),
          P(`You have prevented a death. You have also carried out the instruction Rochester heard from Hope fifteen years ago, on a Jamaican night:`),
          Q(ROCH, 'Ch. XXVII', `“…Place her in safety and comfort: shelter her degradation with secrecy, and leave her.”`),
          P(`Safety is the word every confinement in this story has used.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    e_roof: {
      art: 'roof', motes: 'embers', place: 'Thornfield Hall · the leads', title: 'The Witness', cite: 'Ending · after Chapter XXXVI', ending: 'roof', staged: 'Staged from the landlord’s account. Your presence is invented.',
      beats: [
        { blocks: [
          P(`You do nothing. You follow her.`),
          P(`She takes the keys. She sets fire to the hangings of the room next to hers. She goes down to the bed Jane slept in, empty now, and sets that alight. Then she climbs.`),
          P(`On the roof she stands above the battlements, waving her arms and shouting. The landlord will say they could hear her a mile off. You are close enough to hear the words.`),
          s => s.voice.mode === 'write' ? { t: 'margin', faded: true } : null,
          s => P(({
            write: `These are the words you wrote for her. They are not what she is shouting.`,
            tiles: `You gave her a sentence made of other people’s words. She is not using it.`,
            silence: `You never spoke for her, and you will not start now.`,
            unasked: `You never asked her anything. She is not speaking to you.`
          })[s.voice.mode] || ''),
          P(`This page will not write what she says.`),
          P(`Rochester comes up through the skylight. He calls her name. He comes toward her, and she springs.`),
          P(`In a few months the landlord will tell all this to Jane, who will not say who she is. Within two chapters Jane will be married. Spivak’s argument is that the novel needed this night: the woman from Jamaica has to burn the house and kill herself so that the Englishwoman can become the heroine of her own story.`),
          R('married'),
          P(`You let the text stand. You were the only witness who heard her, and you are the only one who cannot repeat what she said.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    e_unwritten: {
      art: 'void', motes: 'embers', place: 'Nowhere in the text', title: 'Unwritten', cite: 'Ending', ending: 'unwritten', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You step back and stop narrating.`),
          P(`She takes the candle from the table.`),
          { t: 'burn', phrases: [
            'a figure ran backwards and forwards',
            'whether beast or human being',
            'The maniac bellowed',
            'the clothed hyena',
            'Bertha Mason is mad',
            'idiots and maniacs through three generations',
            'a nature the most gross, impure, depraved',
            'a filthy burden',
            'buried in oblivion',
            'a wild beast’s den—a goblin’s cell',
            'never mind her gibberish',
            'a discoloured face—it was a savage face',
            'the Vampyre',
            'a fiend-nature replaces it',
            'as cunning as a witch',
            'this young girl, who stands so grave and quiet',
            'Reader, I married him.'
          ] }
        ], wait: 'burned' },
        { blocks: [
          P(`Everything written about her has gone, and she has gone with it. No account is left that calls her mad, and none that says who she was.`),
          P(`The comparisons went too. With no madwoman upstairs, the grave and quiet girl has nothing to be measured against, and Jane’s last line burned with the rest. Her ending needed that fire. Without the account of it, the novel has no road to Ferndean.`),
          P(`So: freedom, or erasure? On this page the two meanings of *unwriting her* have become one. The page is blank. It was blank before anyone wrote her, too.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    e_shore: {
      art: 'shore', motes: 'none', place: 'Spanish Town, Jamaica · fifteen years before', title: 'The Other Shore', cite: 'Ending', ending: 'shore', staged: 'This ending is invented. It does not occur in the novel.',
      beats: [
        { blocks: [
          P(`You follow the register back across the Atlantic: the 20th of October, fifteen years before; —— church, Spanish Town, Jamaica.`),
          P(`The church has no name. Brontë put a dash where it should be.`),
          P(`There is almost nothing here. The novel’s Jamaica exists only in Rochester’s memory: a beauty who was “the boast of Spanish Town,” a family eager for “a good race,” a night of sulphur and a red moon. Her childhood, her mother’s face, what she thought of the Englishman her father found for her, the enslaved people whose labour paid for her thirty thousand pounds: the novel wrote none of it.`),
          P(`You could invent it. You would not be the first. In 1966 Jean Rhys, who was born in Dominica, wrote *Wide Sargasso Sea* and gave this woman a childhood, a burned house in Jamaica, a mother, and a name. Rhys’s book is an answer to this blank. It is a novel, and it is open about being invented.`)
        ],
        choices: [
          { label: 'Invent her childhood', set: (s, h) => h.flag('shore-invent'), next: true },
          { label: 'Leave the blank', set: (s, h) => h.flag('shore-blank'), next: true }
        ] },
        { blocks: [
          s => s.flags.includes('shore-invent')
            ? P(`You begin. The page marks every line you write as conjecture. After a while you notice you are writing a heroine: brave, wronged, eloquent. You have made her into someone a reader can admire, and admiration is also a use.`)
            : P(`You leave the dash where Brontë put it and write one line in the margin of the register: *Here there should be a life.* The archive of a colony was mostly kept by its colonizers. Sometimes the accurate thing to do with a gap is to mark it as one.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    e_close: {
      art: 'book', motes: 'dust', place: 'Outside the text', title: 'The Reader Leaves', cite: 'Ending', ending: 'close',
      beats: [
        { blocks: [
          P(`You close the book.`),
          P(`Somewhere in Chapter XI a governess is walking down a corridor like one in Bluebeard’s castle, and a laugh is about to strike her ear. It will happen every time anyone opens the book: distinct, formal, mirthless. Every time, someone will say *perhaps Grace Poole*.`),
          P(`You did not rescue her and you did not judge her. You turned down the god’s position this game offered you. A reader is not a rescuer, and the woman in the attic was never waiting for you.`),
          P(`Or else she has been waiting a long time, and you left.`)
        ] },
        { blocks: [{ t: 'after' }], choices: 'END' }
      ]
    },

    /* -------------------------------------------------------- the thesis */
    thesis: {
      place: 'The Reading Room', title: 'Playing in the Attic', cite: 'A thesis, after Toni Morrison', measure: 'wide', essay: true,
      beats: [
        { blocks: [
          { t: 'essayhead', kicker: 'The thesis this game has been arguing', sub: 'Sanity and the literary imagination' },
          P(`You were asked to look at a woman. This page asks what she was *for*.`),
          H('Morrison’s turn'),
          P(`In *Playing in the Dark: Whiteness and the Literary Imagination* (1992), first given as lectures at Harvard in 1990, Toni Morrison read classic American fiction for its black characters, who are so often minor, silent or decorative, and found them doing structural work. Through them white writers imagined what it meant to be free, innocent, rational, and white. Freedom is easiest to picture standing next to someone who is not free. Morrison asked critics to turn their attention from the people described to the people doing the describing. As she put it, “the subject of the dream is the dreamer.”`),
          H('The thesis'),
          P(`The madwoman of the canon does the same kind of work for sanity. She is rarely the subject of her own book. She is placed beside a heroine, a husband, a household and a reader, and by contrast she makes their normality visible: their reason, their restraint, their believable speech, their lawful desire, their right to marry and to narrate. Madness in these novels is less a condition the text observes than a backdrop the text needs. There is no sane heroine without her.`),
          P(`Sanity here works like the whiteness Morrison describes: an unmarked category that defines itself by what it marks. The woman in the attic is marked so that the woman in the drawing room does not have to be.`),
          H('The evidence in the glass'),
          s => P(`You gathered ${s.reflections.length} of ${Object.keys(reflections).length} reflections. Each sets something said about her beside what it lets someone else become.`),
          { t: 'glasslist' },
          P(`The plainest is Rochester’s own. On the wedding morning he shows the witnesses his wife, then puts his hand on Jane’s shoulder:`),
          Q(ROCH, 'Ch. XXVI', `“…this young girl, who stands so grave and quiet at the mouth of hell, looking collectedly at the gambols of a demon. I wanted her just as a change after that fierce ragout.”`),
          P(`He values Jane as *a change*, as the opposite of something. The novel makes the comparison out loud and asks the room to judge by it. And read as a whole, *Jane Eyre* is the story of where madness lives. At ten it lives in Jane, the “mad cat” locked in the red-room. By the end it has been moved upstairs into another woman’s body, and the girl who was once restrained with garters has grown into the one who narrates.`)
        ], cont: 'Read on' },
        { blocks: [
          H('Credibility is relational'),
          P(`The comparison also decides whose words count. Jane is praised as “no talking fool” for keeping quiet; the only sentence the other woman is recorded saying is “gibberish.” When Rochester calls Jane’s account of the veil night a dream, the plot vindicates her the next morning, because the plot is hers. Miranda Fricker calls it testimonial injustice when prejudice makes a hearer discount a speaker. In these novels the discount is shared out between women. One woman’s credibility is built from another’s lack of it, and the standard of a valid witness is set against someone who can never meet it.`),
          H('Two kinds of dark'),
          P(`Morrison’s argument is about race, and in Bertha’s case the comparison stops being only a comparison. The woman made to stand for madness is also the novel’s colonial woman: a Creole mother, a Spanish Town wedding, a West Indian night of sulphur set against a wind fresh from Europe, a fortune that came from planters. Her madness and her colonial origin are described in the same breath, and the novel rarely separates them. The attic holds both of the shadows that English sanity and English whiteness are defined against.`),
          H('The dreamer in the glass'),
          P(`This game gave you the god’s position and asked you to read, to judge or to rescue. Whatever you did, she reflected it back.`),
          { t: 'youglass' },
          P(`Sympathetic readings use her as well. The rebel, the victim, the double, the voice recovered: each makes her a mirror for a reader’s politics. Morrison’s point applies to readers as much as to writers. What a reader dreams about the madwoman is evidence about the reader.`)
        ], cont: 'Read on' },
        { blocks: [
          H('Where the thesis strains'),
          P(`This argument has limits, and it should name them. Morrison writes about a specific history, American slavery and the people it made into property, and about how that history shaped a national literature. Madness is not a people in that sense, and an analogy that moves too quickly from race to madness risks treating her argument as a general method and losing what it was about. The thesis is strongest where the two meet, as they do in Bertha, and it should be tested before it is assumed elsewhere.`),
          P(`It also joins a conversation already under way. Michel Foucault’s *History of Madness* (1961) argued that the age of reason defined itself by confining unreason. Elaine Showalter’s *The Female Malady* (1985) traced how English culture made madness into a woman’s condition. Gilbert and Gubar (1979) read the madwoman as the heroine’s double; Spivak (1985) showed that the double was also a colonial subject sacrificed for the heroine. What Morrison adds is a direction of attention: away from what the madwoman is, and toward what the people around her need her to be.`),
          H('The other volumes'),
          P(`The rest of the Reading Room is still sealed. Each volume holds a woman who stands beside someone her book calls normal: a wife beside a physician husband, a daughter beside a prince, a lady beside the family that needs a scandal kept quiet, an aunt beside the sister who managed America, a widow beside a village that has heard her story too often. The thesis becomes a question to take to each of them. Who is made sane by her?`)
        ], choices: 'THESIS-END' }
      ]
    }
  };

  /* ----------------------------------------------- tiles for her statement */
  function tiles(s) {
    const seen = sc => s.visited.includes(sc);
    const out = [];
    const add = (w, by, ok) => { if (ok && !s.struck.includes(w)) out.push({ w, by }); };
    ['I', 'am', 'was', 'not', 'no', 'my', 'me', 'you', 'your', 'the', 'a', 'and', 'her', 'she', 'name', 'is', 'they', 'of'].forEach(w => out.push({ w, by: 'anyone’s' }));
    add('laugh', 'Jane', true);
    add('murmurs', 'Jane', seen('leads'));
    add('Bertha', 'Rochester', seen('w_rochester') || seen('w_register'));
    add('wife', 'Rochester', seen('w_rochester') || seen('w_register'));
    add('mad', 'Rochester', seen('w_rochester') || seen('w_jane'));
    add('maniac', 'Jane', seen('w_rochester'));
    add('hyena', 'Jane', seen('w_rochester'));
    add('demon', 'Rochester', seen('w_rochester'));
    add('Creole', 'Rochester', seen('w_rochester') || seen('w_register'));
    add('fine', 'Rochester', seen('w_rochester'));
    add('dark', 'Rochester', seen('w_rochester'));
    add('majestic', 'Rochester', seen('w_rochester'));
    add('thirty thousand pounds', 'Rochester', seen('w_rochester'));
    add('ravings', 'Rochester', seen('w_rochester'));
    add('lucid', 'Rochester', seen('w_rochester'));
    add('burden', 'Rochester’s “Hope”', seen('w_rochester'));
    add('buried', 'Rochester’s “Hope”', seen('w_rochester'));
    add('unfortunate', 'Jane', seen('w_rochester'));
    add('sister', 'Mason', seen('w_mason') || seen('w_register'));
    add('tigress', 'Mason', seen('w_mason'));
    add('gibberish', 'Rochester', seen('w_mason'));
    add('drain my heart', 'her, reported by Mason', seen('w_mason'));
    add('charge', 'Rochester', seen('w_grace'));
    add('tolerable', 'Grace Poole', seen('w_grace'));
    add('snappish', 'Grace Poole', seen('w_grace'));
    add('savage', 'Jane', seen('w_jane'));
    add('Vampyre', 'Jane', seen('w_jane'));
    add('veil', 'Jane', seen('w_jane'));
    add('existence', 'Mr. Briggs', seen('w_register'));
    add('Antoinetta', 'the register', seen('w_register'));
    add('Spanish Town', 'the register', seen('w_register'));
    add('witch', 'the landlord', seen('w_host'));
    add('fire', 'the landlord', true);
    add('fiend-nature', 'Charlotte Brontë', seen('w_author'));
    add('pity', 'Charlotte Brontë', seen('w_author'));
    add('lunatic', 'Rochester', seen('room'));
    add('cunning', 'Rochester', seen('room') || seen('w_host'));
    return out;
  }

  /* ------------------------------------------------- the acts (for silence) */
  const acts = [
    { k: 'laugh', ch: 'Chapter XI', t: 'She laughs: “distinct, formal, mirthless.”' },
    { k: 'murmur', ch: 'Chapter XII', t: 'She murmurs, too low to be written down.' },
    { k: 'bedfire', ch: 'Chapter XV', t: 'She takes a key, sets fire to her husband’s bed curtains, and laughs at Jane’s keyhole on the way.' },
    { k: 'bite', ch: 'Chapter XX', t: 'She stabs and bites her brother, and tells him she will drain his heart.' },
    { k: 'veil', ch: 'Chapter XXV', t: 'She tries on a bride’s veil, looks at herself, tears it in two, and looks the bride in the face without harming her.' },
    { k: 'fight', ch: 'Chapter XXVI', t: 'She fights her husband in front of witnesses. “More than once she almost throttled him.”' },
    { k: 'roof', ch: 'Chapter XXXVI', t: 'She takes the keys again, burns the house, stands on the roof shouting loud enough to be heard a mile away, and, when her husband comes toward her, jumps.' }
  ];

  /* ------------------------------------------------ the judge's questions */
  const crossx = {
    rochester: [
      { q: 'Did you ever ask her anything?', a: Q(ROCH, 'Ch. XXVI', `“Good-morrow, Mrs. Poole!… How are you? and how is your charge to-day?”`) },
      { q: 'What does she say to you?', a: Q(ROCH, 'Ch. XXVII', `“…she had lucid intervals of days—sometimes weeks—which she filled up with abuse of me.”`) },
      { q: 'Why is she upstairs?', a: Q(ROCH, 'Ch. XXVII', `“…confine her with due attendance and precautions at Thornfield: then travel yourself to what clime you will, and form what new tie you like.”`) }
    ],
    mason: [
      { q: 'Why did you go to her?', a: Q('Richard Mason', 'Ch. XX', `“I thought I could have done some good.”`) },
      { q: 'What did she say?', a: Q('Richard Mason', 'Ch. XX', `“She sucked the blood: she said she’d drain my heart.”`) },
      { q: 'What should be done with her?', a: Q('Richard Mason', 'Ch. XX', `“Let her be taken care of; let her be treated as tenderly as may be: let her—”`) }
    ],
    grace: [
      { q: 'How is she?', a: Q('Grace Poole', 'Ch. XXVI', `“We’re tolerable, sir, I thank you… rather snappish, but not ’rageous.”`) },
      { q: 'What does she talk about?', a: null },
      { q: 'Why do you stay?', a: null }
    ],
    jane: [
      { q: 'Did you ever speak to her?', a: Q('Jane Eyre', 'Ch. XXV', `“…she thrust up her candle close to my face, and extinguished it under my eyes.”`) },
      { q: 'What did she say?', a: Q(JANE, 'Ch. XII', `…I heard, too, her eccentric murmurs; stranger than her laugh.`) },
      { q: 'Why is she upstairs?', a: Q('Jane Eyre', 'Ch. XXVII', `“It is cruel—she cannot help being mad.”`) }
    ],
    register: [
      { q: 'Who is she?', a: Q('Mr. Briggs, reading Mason’s statement', 'Ch. XXVI', `“…my sister, Bertha Antoinetta Mason, daughter of Jonas Mason, merchant, and of Antoinetta his wife, a Creole…”`) },
      { q: 'Is she mad?', a: null },
      { q: 'Where is she?', a: Q('Richard Mason', 'Ch. XXVI', `“She is now living at Thornfield Hall… I saw her there last April. I am her brother.”`) }
    ],
    host: [
      { q: 'Did you ever see her?', a: Q('The landlord', 'Ch. XXXVI', `“She was a big woman, and had long black hair: we could see it streaming against the flames as she stood.”`) },
      { q: 'What did she shout?', a: Q('The landlord', 'Ch. XXXVI', `“…shouting out till they could hear her a mile off.”`) },
      { q: 'How do you know all this?', a: Q('The landlord', 'Ch. XXXVI', `“They say she had nearly burnt her husband in his bed once: but I don’t know about that.”`) }
    ],
    author: [
      { q: 'Who is she?', a: Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“…all that is good or even human seems to disappear from the mind and a fiend-nature replaces it.”`) },
      { q: 'What should a reader feel?', a: Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“…profound pity ought to be the only sentiment elicited by the view of such degradation…”`) },
      { q: 'Would you write her differently?', a: Q('Charlotte Brontë', 'Letter, 4 Jan. 1848', `“…I have erred in making horror too predominant.”`) }
    ]
  };

  /* ------------------------------------------------------- afterword */
  const ENDINGS = { door: 'The Door', keeper: 'The Keeper', roof: 'The Witness', unwritten: 'Unwritten', shore: 'The Other Shore', close: 'The Reader Leaves', margin: 'The Margin', mistrial: 'Mistrial', safe: 'Safekeeping' };
  const ROLE_LINE = {
    reader: { door: 'You came only to read, and you ended by turning a key.', keeper: 'You came to read, and you ended by keeping the house in order.', roof: 'You came to read, and you read to the end, including the part the novel only reports.', unwritten: 'You came to read, and you ended by removing the text.', shore: 'You came to read, and you followed the text to the place where it stops.', close: 'You came to read, and you stopped.', margin: 'You came to read, and you ended by writing: the one change a reader can make to a book.' },
    judge: { door: 'You came to judge. You acted on your own verdict, and she was not consulted about the sentence.', keeper: 'You came to judge, and your last act enforced the existing order.', roof: 'You came to judge, and in the end you only witnessed. That may be the more honest role.', unwritten: 'You came to judge, and you ended by giving up the bench entirely.', shore: 'You came to judge, and you went looking for evidence the court never had.', close: 'You came to judge, and you adjourned indefinitely.', mistrial: 'You came to judge, and you ruled that judging her was impossible in this house.' },
    rescuer: { door: 'You came to rescue her, and you did: you chose the moment and the means. She did not ask you to.', keeper: 'You came to rescue her, and you ended by securing her door.', roof: 'You came to rescue her, and you watched. This rescue may never have been yours to make.', unwritten: 'You came to rescue her, and in the end you let her act without you. It is the only ending in which you are not the hero.', shore: 'You came to rescue her and went back to before she needed rescuing, and found almost nothing there.', close: 'You came to rescue her, and you left her where you found her.', safe: 'You came to rescue her, and you kept her: safe, unharmed, and with fewer acts to her name.' }
  };
  const FINDING = { mad: 'You found her mad.', notproven: 'Not proven.', incompetent: 'You declined to judge her.', adjourn: 'You adjourned the hearing to hear her.' };
  const NAMES = { bertha: 'Bertha', mrs: 'Mrs. Rochester', antoinetta: 'Antoinetta', none: 'No name' };

  function readingPattern(s) {
    const ks = Object.keys(ACTS).filter(k => s.readings[k]).map(k => s.readings[k]);
    if (!ks.length) return 'You recorded no reading of her acts.';
    const all = v => ks.every(x => x === v);
    if (ks.length >= 2 && all('madness')) return 'Each time, you took the household’s word. That is the reading the novel was built to produce, and most of its first readers produced it.';
    if (ks.length >= 2 && all('resistance')) return 'You read every act as rebellion. It is a more generous story than Rochester’s, and it is still a story told about her, with motives she never states.';
    if (ks.length >= 2 && all('suffering')) return 'You read her as a victim each time. Pity is the feeling Brontë said she had underwritten. It still leaves you deciding what she felt.';
    if (ks.length >= 2 && all('open')) return 'You withheld judgment every time. That is faithful to the evidence. It is also the condition the household relied on: a woman about whom nothing can be decided can be kept indefinitely.';
    if (ks.length === 1) return 'You recorded one reading. One act is not yet a pattern.';
    return 'Your readings shifted from act to act. With a record this partial, inconsistency may be the most accurate response available.';
  }

  function afterword(s) {
    const rows = [];
    rows.push({ label: 'You came as', text: ({ reader: 'A reader', judge: 'A judge', rescuer: 'A rescuer' })[s.role] || '—', note: (ROLE_LINE[s.role] || {})[s.ending] || '' });
    rows.push({ label: 'Your finding', text: FINDING[s.finding] || 'You did not close the hearing.' });
    rows.push({ label: 'Her name in your record', text: s.voice.mode === 'unasked' ? 'You did not name her.' : (NAMES[s.name] || '—') });
    rows.push({ label: 'Her testimony', voice: true, text: ({ unasked: 'You did not call her as a witness.', silence: 'You left the page blank.', tiles: 'A statement assembled from the record:', write: 'Written in your hand:' })[s.voice.mode] || 'Not entered.' });
    rows.push({ label: 'Your readings', readings: Object.keys(ACTS).filter(k => s.readings[k]).map(k => [ACTS[k], READ_LABELS[s.readings[k]]]).concat(s.readings.placement ? [['The laugh’s placement (Ch. XII)', PLACEMENT[s.readings.placement]]] : []), note: readingPattern(s) });
    const notHeard = witnesses.filter(w => !s.heard.includes(w.id)).map(w => w.name);
    rows.push({ label: 'Witnesses heard', text: `${s.heard.length} of 7.` + (notHeard.length ? ` Not heard: ${notHeard.join('; ')}.` : ' You heard every account the record holds, except hers.') });
    if (s.role === 'reader') {
      const ks = Object.keys(s.checks || {});
      const right = ks.filter(k => s.checks[k]).length;
      rows.push({ label: 'Text or reading', text: ks.length ? `You told the text from your own reading ${right} of ${ks.length} times.` : 'You answered none of the reader’s checks.', note: ks.length && right < ks.length ? 'Over-reading is a close reader’s particular temptation: the more carefully you look, the more you find, including what you brought.' : '' });
    }
    if (s.role === 'judge') {
      const asked = Object.keys(s.crossx || {});
      rows.push({ label: 'Your questions', text: asked.length ? `You cross-examined ${asked.length} ${asked.length === 1 ? 'witness' : 'witnesses'}. Every answer came from that witness’s own words, or from silence.` : 'You put no questions to the witnesses.' });
    }
    if (s.role === 'rescuer') {
      const gone = acts.filter(a => (s.erased || []).includes(a.k)).map(a => a.ch);
      rows.push({ label: 'What you prevented', text: gone.length ? `Her acts in ${gone.join(', ')}.` : 'Nothing. You let every night happen.', note: gone.length ? 'Each rescue worked, and each removed something she did from the record.' : '' });
    }
    const ident = s.struck.filter(w => lexicon.find(l => l.w === w && l.identity));
    rows.push({ label: 'Words you struck', text: s.struck.length ? s.struck.join(', ') + '.' : 'None.', note: s.struck.length ? 'The novel still says them. Striking a word records an objection; it does not recover what should have been said instead.' + (ident.length ? ` You also struck words that said who she was (${ident.join(', ')}), not only what she was called.` : '') : 'You can strike words from the Record, under “Words for her.”' });
    return rows;
  }

  /* the player's own reflections, for the thesis */
  function youGlass(s) {
    const out = [];
    const role = { reader: ['a text to be read closely', 'the careful reader'], judge: ['the accused', 'the judge'], rescuer: ['the one who needs rescuing', 'the rescuer'] }[s.role];
    if (role) out.push(role);
    const f = { mad: ['mad', 'the sane court that found her so'], notproven: ['not proven', 'the court that withheld a verdict, and the key'], incompetent: ['beyond judgment', 'the one who declined to judge'], adjourn: ['a witness, at last', 'the court that called her'] }[s.finding];
    if (f) out.push(f);
    const v = { tiles: ['a sentence made of others’ words', 'the one who arranged them'], write: ['words in your hand', 'her author'], silence: ['a blank page', 'the one who left it blank'], unasked: ['unasked', 'the one who left without asking'] }[s.voice.mode];
    if (v) out.push(v);
    const counts = {};
    Object.keys(ACTS).forEach(k => { if (s.readings[k]) counts[s.readings[k]] = (counts[s.readings[k]] || 0) + 1; });
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const r = { resistance: ['a rebel', 'a reader who admires rebels'], madness: ['mad', 'a reader who can tell'], suffering: ['a victim', 'a reader who pities'], open: ['undecidable', 'a reader who keeps an open mind'] }[top];
    if (r) out.push(r);
    const e = { door: ['freed', 'the liberator'], keeper: ['kept safe', 'the keeper'], roof: ['the subject of a witness', 'the witness'], unwritten: ['erased, or free', 'the one who stepped back'], shore: ['a blank in the archive', 'the archivist'], close: ['left where she was', 'the reader who left'], margin: ['a sentence in a book', 'the note beside it'], mistrial: ['undecided', 'the court that could not try her'], safe: ['safe, and silent', 'her second keeper'] }[s.ending];
    if (e) out.push(e);
    return out.map(([her, other]) => ({ her, other, who: 'you' }));
  }

  const sources = [
    'Charlotte Brontë, *Jane Eyre: An Autobiography* (1847).',
    'Charlotte Brontë, letter to W. S. Williams, 4 January 1848.',
    'William Blackstone, *Commentaries on the Laws of England*, Book I, ch. 15 (1765).',
    'James Cowles Prichard, *A Treatise on Insanity and Other Disorders Affecting the Mind* (1835).',
    'Virginia Woolf, *A Room of One’s Own* (1929).',
    'Michel Foucault, *Histoire de la folie à l’âge classique* (1961); English as *History of Madness*.',
    'Jean Rhys, *Wide Sargasso Sea* (1966).',
    'Sandra M. Gilbert and Susan Gubar, *The Madwoman in the Attic* (1979).',
    'Gayatri Chakravorty Spivak, “Three Women’s Texts and a Critique of Imperialism,” *Critical Inquiry* 12.1 (1985); “Can the Subaltern Speak?” (1988).',
    'Elaine Showalter, *The Female Malady: Women, Madness and English Culture, 1830–1980* (1985).',
    'Susan L. Meyer, “Colonialism and the Figurative Strategy of *Jane Eyre*,” *Victorian Studies* 33.2 (1990).',
    'Toni Morrison, *Playing in the Dark: Whiteness and the Literary Imagination* (1992).',
    'Miranda Fricker, *Epistemic Injustice: Power and the Ethics of Knowing* (2007).',
    'Alexandra Valint, “Madeira and *Jane Eyre*’s Colonial Inheritance,” *Victorian Literature and Culture* 45.2 (2017).'
  ];

  UH.registerStory({
    id: 'bertha',
    title: 'The Third Storey',
    heroine: 'Bertha Antoinetta Mason',
    start: 'threshold',
    clues, reflections, lexicon, witnesses, missingWitness, scenes, tiles, acts, crossx,
    witnessLimit: s => s.role === 'judge' ? 4 : null,
    enterWitness: (s, w) => s.role === 'rescuer' && w.rescue && !s.flags.includes('rescue-' + w.id) ? w.rescue : w.scene,
    roleChip: s => ({ reader: 'Reader', judge: `Judge · ${Math.min(s.heard.length, 4)}/4`, rescuer: `Rescuer · ${(s.erased || []).length}/3` })[s.role] || null,
    silenceOpen: 'The page is hers. Nothing is written on it.',
    silenceClose: `This is everything the novel lets her do. Read as a sentence, it is not nothing. You have not put words in her mouth, and whatever she does next she will do without your dialogue.`,
    endings: ENDINGS,
    readLabels: READ_LABELS,
    afterword, youGlass, sources,
    sourceNote: 'Quotations from the novel and from the 1848 letter are verbatim; ellipses mark omissions. Critical positions are paraphrased and attributed. Scenes marked as staged or invented are this game’s, not Brontë’s.',
    vars: s => ({ name: nameOf(s), Name: nameOf(s).charAt(0).toUpperCase() + nameOf(s).slice(1) })
  });
})();
