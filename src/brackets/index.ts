import EventEmitter from 'eventemitter3';

import directors2019 from './2019/directors.json';
import polls2019 from './2019/polls.json';

import directors2020 from './2020/directors.json';
import polls2020 from './2020/polls.json';

// import directors2020Patreon from './2020-patreon/directors.json';
// import polls2020Patreon from './2020-patreon/polls.json';
import { useEffect, useState } from 'react';

interface Director {
  name: string;
  imdb: string;
  winner: boolean[];
}

export const bracketKeys = [
  'Bracket 2019',
  'Bracket 2020',
  // 'Bracket 2020 Patreon',
] as const;

interface Bracket {
  directors: Array<Director>;
  polls: Array<string | null>;
  winnerLookup: {
    [key: string]: (Director | { possible: Array<Director> }) & {
      poll?: string;
    };
  };
  key: 'Bracket 2019' | 'Bracket 2020' | 'Bracket 2020 Patreon';
}
const brackets: Array<Bracket> = [
  {
    directors: directors2019,
    polls: polls2019,
    winnerLookup: {},
    key: 'Bracket 2019' as const,
  },
  {
    directors: directors2020,
    polls: polls2020,
    winnerLookup: {},
    key: 'Bracket 2020' as const,
  },
  // {
  //   directors: directors2020Patreon,
  //   polls: polls2020Patreon,
  //   key: 'Bracket 2020 Patreon' as const,
  //   winnerLookup: {},
  // },
].map(bracket => {
  const winnerLookup: Bracket['winnerLookup'] = bracket.winnerLookup;
  function setWinners(opts: Array<Director>, winnerIndex = 4) {
    const winner = opts.find(o => o.winner[winnerIndex]);
    winnerLookup[opts.map(o => o.name).join()] = winner || {
      possible: opts.filter(o => o.winner.every(Boolean)),
    };
    if (opts.length > 2) {
      setWinners(opts.slice(0, opts.length / 2), winnerIndex - 1);
      setWinners(opts.slice(-opts.length / 2), winnerIndex - 1);
    }
  }
  setWinners(bracket.directors);
  function setPoll({ range, poll }: { range: [number, number]; poll: string }) {
    winnerLookup[
      bracket.directors
        .slice(...range)
        .map(o => o.name)
        .join()
    ].poll = `https://twitter.com/blankcheckpod/status/${poll}`;
  }
  let rangeStart = 0;
  let range = 2;
  bracket.polls.forEach(poll => {
    if (rangeStart >= bracket.directors.length) {
      range *= 2;
      rangeStart = 0;
    }

    if (poll) setPoll({ range: [rangeStart, rangeStart + range], poll });

    rangeStart += range;
  });
  return { ...bracket, winnerLookup };
});

let currentBracket: typeof brackets[0]['key'] = 'Bracket 2020';

const emitter = new EventEmitter();
export const useBracket = (): [
  typeof brackets[0],
  (key: typeof currentBracket) => void
] => {
  const [bracket, setBracket] = useState(
    () =>
      brackets.find(bracket => bracket.key === currentBracket) || brackets[0]
  );
  useEffect(() => {
    const onUpdate = () =>
      setBracket(
        brackets.find(bracket => bracket.key === currentBracket) || brackets[0]
      );
    emitter.on('update', onUpdate);
    return () => {
      emitter.off('update', onUpdate);
    };
  }, []);

  return [
    bracket,
    key => {
      currentBracket = key;
      emitter.emit('update');
    },
  ];
};
