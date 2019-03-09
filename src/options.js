export const options = [
  { name: 'P.T. Anderson', imdb: 'nm0000759', winner: [true] },
  { name: 'P.W.S. Anderson', imdb: 'nm0027271', winner: [false] },
  { name: 'Amy Heckerling', imdb: 'nm0002132', winner: [true] },
  { name: 'Warren Beatty', imdb: 'nm0000886', winner: [false] },
  { name: 'Gore Verbinski', imdb: 'nm0893659', winner: [true] },
  { name: 'John Singleton', imdb: 'nm0005436', winner: [false] },
  { name: 'Jonathan Demme', imdb: 'nm0001129', winner: [true] },
  { name: 'Cronenberg', imdb: 'nm0000343', winner: [false] },
  { name: 'Sam Raimi', imdb: 'nm0000600', winner: [true] },
  { name: 'Elaine May', imdb: 'nm0561938', winner: [false] },
  { name: 'Michael Bay', imdb: 'nm0000881', winner: [true] },
  { name: 'F. Gary Gray', imdb: 'nm0336620', winner: [false] },
  { name: 'Francis F. Coppola', imdb: 'nm0000338', winner: [true] },
  { name: 'Alex Proyas', imdb: 'nm0001639', winner: [false] },
  { name: '70S Altman', imdb: 'nm0000265', winner: [false] },
  { name: 'Mel Brooks', imdb: 'nm0000316', winner: [true] },
  { name: 'Peter Jackson', imdb: 'nm0001392', winner: [] },
  { name: 'Martin Brest', imdb: 'nm0000976', winner: [] },
  { name: 'John McTiernan', imdb: 'nm0001532', winner: [] },
  { name: 'Buster Keaton', imdb: 'nm0000036', winner: [] },
  { name: 'John Carpenter', imdb: 'nm0000118', winner: [] },
  { name: 'Peter Weir', imdb: 'nm0001837', winner: [] },
  { name: 'Nora Ephron', imdb: 'nm0001188', winner: [] },
  { name: 'Penny Marshall', imdb: 'nm0001508', winner: [] },
  { name: 'Guillermo Del Toro', imdb: 'nm0868219', winner: [] },
  { name: 'Chris Columbus', imdb: 'nm0001060', winner: [] },
  { name: 'Terrence Malick', imdb: 'nm0000517', winner: [] },
  { name: 'William Friedkin', imdb: 'nm0001243', winner: [] },
  { name: 'George Miller', imdb: 'nm0004306', winner: [] },
  { name: 'Tony Scott', imdb: 'nm0001716', winner: [] },
  { name: 'Joe Dante', imdb: 'nm0001102', winner: [] },
  { name: 'Preston Sturges', imdb: 'nm0002545', winner: [] },
];

export const winnerLookup = {};

function setWinners(opts) {
  const winner = opts.find(o => o.winner[opts.length / 2 - 1]);
  winnerLookup[opts.map(o => o.name).join()] = winner || {
    possible: opts.filter(o => o.winner.every(Boolean)),
  };

  if (opts.length > 2) {
    setWinners(opts.slice(0, opts.length / 2));
    setWinners(opts.slice(-opts.length / 2));
  }
}
setWinners(options);

function setPoll({ range, poll }) {
  winnerLookup[
    options
      .slice(...range)
      .map(o => o.name)
      .join()
  ].poll = `https://twitter.com/blankcheckpod/status/${poll}`;
}

let rangeStart = 0;
let range = 2;
[
  '1101529711556128770',
  '1101891004192514048',
  '1102254593642299394',
  '1102617025573203968',
  '1102983806594764800',
  '1103341673927659520',
  '1103704623427260416',
  '1104068984331268096',
  '1104432075069931521',
].forEach(poll => {
  if (rangeStart >= options.length) {
    range *= 2;
    rangeStart = 0;
  }
  setPoll({ range: [rangeStart, rangeStart + range], poll });
  rangeStart += range;
});
