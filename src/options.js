import polls from './polls.json';
import directors from './directors.json';

export const winnerLookup = {};

function setWinners(opts, winnerIndex = 4) {
  const winner = opts.find(o => o.winner[winnerIndex]);
  winnerLookup[opts.map(o => o.name).join()] = winner || {
    possible: opts.filter(o => o.winner.every(Boolean)),
  };

  if (opts.length > 2) {
    setWinners(opts.slice(0, opts.length / 2), winnerIndex - 1);
    setWinners(opts.slice(-opts.length / 2), winnerIndex - 1);
  }
}
setWinners(directors);

function setPoll({ range, poll }) {
  winnerLookup[
    directors
      .slice(...range)
      .map(o => o.name)
      .join()
  ].poll = `https://twitter.com/blankcheckpod/status/${poll}`;
}

let rangeStart = 0;
let range = 2;
polls.forEach(poll => {
  if (rangeStart >= directors.length) {
    range *= 2;
    rangeStart = 0;
  }
  setPoll({ range: [rangeStart, rangeStart + range], poll });
  rangeStart += range;
});
