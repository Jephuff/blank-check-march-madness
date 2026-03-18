import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPollUrlByMatch,
  applyNextPollUrl,
} from './bracket-data-updater.mjs';

test('applyPollUrlByMatch inserts a later-round poll using normalized winner names', () => {
  const content = `const data = {
  options: [
    {
      options: [
        {
          winner: 'Martin Scorsese',
          poll: 'https://poll.fm/16667456',
          options: ['Martin Scorsese', 'Dennis Dugan'],
        },
        {
          winner: 'F. Gary Gray',
          poll: 'https://poll.fm/16667603',
          options: ['F. Gary Gray', 'Francois Truffaut'],
        },
      ],
    },
  ],
};
`;

  const result = applyPollUrlByMatch(content, {
    url: 'https://poll.fm/16734155',
    options: ['Martin Scorsese', 'F Gary Gray'],
  });

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /poll: 'https:\/\/poll\.fm\/16734155',\n {6}options: \[\n {8}\{\n {10}winner: 'Martin Scorsese'/
  );
});

test('applyNextPollUrl inserts the next Patreon poll into the first ready internal matchup', () => {
  const content = `const data = {
  options: [
    {
      options: [
        {
          winner: 'Stand-up Animation',
          poll: 'https://www.patreon.com/posts/2026-march-day-1-151931254',
          options: ['Alvin & The Chipmunks', 'Stand-up Animation'],
        },
        {
          winner: 'Bridget Jones',
          poll: 'https://www.patreon.com/posts/2026-march-day-2-151992757',
          options: ['Bridget Jones', 'My Big Fat Greek Wedding'],
        },
      ],
    },
    {
      options: [
        {
          winner: 'Pauly Shore',
          poll: 'https://www.patreon.com/posts/2026-march-day-3-152135835',
          options: ['Pauly Shore', 'Cheech & Chong'],
        },
        {
          winner: 'Hunger Games',
          poll: 'https://www.patreon.com/posts/2026-march-day-4-152219989',
          options: ['Purge', 'Hunger Games'],
        },
      ],
    },
  ],
};
`;

  const result = applyNextPollUrl(
    content,
    'https://www.patreon.com/posts/2026-march-day-17-153255136'
  );

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-17-153255136',\n {6}options: \[\n {8}\{\n {10}winner: 'Stand-up Animation'/
  );
});
