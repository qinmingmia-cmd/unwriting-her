/* The Reading Room catalogue.
   Each entry is one volume. An entry with `story` set opens that registered story;
   entries without one are shown as sealed, with a note on why the woman belongs here.
   To open a sealed volume, write a story file (see stories/bertha.js) and set `story`. */
UH.registerShelf([
  {
    id: 'bertha',
    story: 'bertha',
    name: 'Bertha Antoinetta Mason',
    spine: 'Bertha Mason',
    work: 'Jane Eyre',
    author: 'Charlotte Brontë',
    year: '1847',
    blurb: 'The woman on the third storey of Thornfield Hall. Every character in the novel describes her. None of them asks her anything.'
  },
  {
    id: 'yellow-wallpaper',
    name: 'The narrator',
    work: '“The Yellow Wall-Paper”',
    author: 'Charlotte Perkins Gilman',
    year: '1892',
    blurb: 'Prescribed rest by a physician who is also her husband, and forbidden to write, she writes in secret. The story never securely gives her a name.'
  },
  {
    id: 'ophelia',
    name: 'Ophelia',
    work: 'Hamlet',
    author: 'William Shakespeare',
    year: 'c. 1600',
    blurb: 'Her madness comes out in fragments of song that the court sets about interpreting. Her death is narrated in detail by a queen who never says how she knows it.'
  },
  {
    id: 'lady-audley',
    name: 'Lady Audley',
    work: 'Lady Audley’s Secret',
    author: 'Mary Elizabeth Braddon',
    year: '1862',
    blurb: 'After a physician is consulted, she is shut away in a Belgian asylum under an assumed name. Madness serves her husband’s family as an alternative to a trial.'
  },
  {
    id: 'moon-orchid',
    story: 'moon-orchid',
    name: 'Moon Orchid',
    work: 'The Woman Warrior',
    author: 'Maxine Hong Kingston',
    year: '1976',
    blurb: 'Brought to California to confront a husband who has remarried, she comes apart and is committed to a state asylum. Her niece tells the story, and later admits she was not there.'
  },
  {
    id: 'xianglin',
    name: 'Xianglin’s Wife · 祥林嫂',
    spine: 'Xianglin’s Wife',
    work: '“The New Year’s Sacrifice” · 祝福',
    author: 'Lu Xun',
    year: '1924',
    blurb: 'She tells the story of her lost son until the village knows it by heart and mocks her for it. Her grief, repeated, is heard as noise. She is known only by her husband’s name.'
  }
]);
