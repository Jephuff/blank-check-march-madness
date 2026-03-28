import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPollUrlsMissingWinners,
  filterPollsMissingWinners,
} from './fetch-polls.mjs';

test('getPollUrlsMissingWinners only returns recorded poll URLs without a winner', () => {
  const content = `const data = {
  options: [
    {
      winner: 'Martin Scorsese',
      poll: 'https://poll.fm/16734155',
      options: [
        {
          winner: 'Martin Scorsese',
          poll: 'https://poll.fm/16667456',
          options: ['Martin Scorsese', 'Dennis Dugan'],
        },
        {
          poll: 'https://poll.fm/16667603',
          options: ['F. Gary Gray', 'Francois Truffaut'],
        },
      ],
    },
  ],
};
`;

  assert.deepEqual(getPollUrlsMissingWinners(content), ['https://poll.fm/16667603']);
});

test('filterPollsMissingWinners skips closed polls that already have winners recorded', () => {
  const polls = [
    { url: 'https://poll.fm/16734155', pollId: '16734155', closed: true },
    { url: 'https://poll.fm/16667603', pollId: '16667603', closed: true },
    { url: 'https://poll.fm/16667612', pollId: '16667612', closed: false },
  ];

  const result = filterPollsMissingWinners(
    polls,
    new Set(['https://poll.fm/16667603'])
  );

  assert.deepEqual(result, [
    { url: 'https://poll.fm/16667603', pollId: '16667603', closed: true },
  ]);
});
