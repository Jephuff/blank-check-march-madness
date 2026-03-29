import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  applyPollUrlByMatch,
  applyNextPollUrl,
  applyWinnerByUrl,
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

test('applyWinnerByUrl maps later-round API winner text to the child winner value', () => {
  const content = `const data = {
  options: [
    {
      poll: 'https://www.patreon.com/posts/2026-march-day-153329595',
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

  const result = applyWinnerByUrl(
    content,
    'https://www.patreon.com/posts/2026-march-day-153329595',
    'HUNGER GAMES'
  );

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /winner: 'Hunger Games',\n {6}poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153329595'/
  );
});

test('applyPollUrlByMatch places a Patreon later-round link on the matching internal matchup', () => {
  const content = `const data = {
  options: [
    {
      poll: 'https://www.patreon.com/posts/2026-march-day-153424586',
      options: [
        {
          winner: 'Bourne',
          options: [
            {
              winner: 'Bourne',
              poll: 'https://www.patreon.com/posts/2026-march-day-5-152272006',
              options: ['Rambo', 'Bourne'],
            },
            {
              winner: 'Teen Shakespeare',
              poll: 'https://www.patreon.com/posts/2026-march-day-6-152350907',
              options: ['Teen Shakespeare', 'H.S. Musical'],
            },
          ],
        },
        {
          options: [
            {
              winner: 'Bruce Lee',
              poll: 'https://www.patreon.com/posts/2026-march-day-7-152436234',
              options: ['Dirty Harry', 'Bruce Lee'],
            },
            {
              winner: 'Halloween',
              poll: 'https://www.patreon.com/posts/2026-march-day-8-152507890',
              options: ['Chucky', 'Halloween'],
            },
          ],
        },
      ],
    },
  ],
};
`;

  const result = applyPollUrlByMatch(content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153497034',
    options: ['BRUCE LEE', 'HALLOWEEN'],
  });

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153497034',\n {10}options: \[\n {12}\{\n {14}winner: 'Bruce Lee'/
  );
  assert.doesNotMatch(
    result.content,
    /poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153497034',\n {10}options: \[\n {12}\{\n {14}winner: 'Bourne'/
  );
});

test('applyPollUrlByMatch tolerates small naming differences in matchup options', () => {
  const content = `const data = {
  options: [
    {
      options: [
        {
          winner: 'Toxic Avengers',
          options: [
            {
              winner: 'Toxic Avengers',
              poll: 'https://www.patreon.com/posts/2026-march-day-9-152583172',
              options: ['Toxic Avengers', 'Universal Soldier'],
            },
            {
              winner: 'Barbershop',
              poll: 'https://www.patreon.com/posts/2026-march-day-152676430',
              options: ['Airport', 'Barbershop'],
            },
          ],
        },
      ],
    },
  ],
};
`;

  const result = applyPollUrlByMatch(content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153573451',
    options: ['TOXIC AVENGER', 'BARBERSHOP'],
  });

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /winner: 'Toxic Avengers',\n {10}poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153573451'/
  );
});

test('bracket-data-updater has no runtime typescript dependency', () => {
  const source = readFileSync(new URL('./bracket-data-updater.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /from 'typescript'/);
  assert.doesNotMatch(source, /from "typescript"/);
});
