import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPatreonPollUrl,
  applyPatreonPost,
  loadCookies,
} from './fetch-patreon-polls.mjs';

test('applyPatreonPollUrl matches later-round posts by live poll choices when available', () => {
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

  const result = applyPatreonPollUrl(content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153497034',
    options: ['BRUCE LEE', 'HALLOWEEN'],
  });

  assert.equal(result.updated, true);
  assert.match(
    result.content,
    /poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153497034',\n {10}options: \[\n {12}\{\n {14}winner: 'Bruce Lee'/
  );
});

test('applyPatreonPost writes winners so later-round links can be matched in the same run', () => {
  const content = `const data = {
  options: [
    {
      options: [
        {
          poll: 'https://www.patreon.com/posts/2026-march-day-153424586',
          options: [
            {
              poll: 'https://www.patreon.com/posts/2026-march-day-153497034',
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
              poll: 'https://www.patreon.com/posts/2026-march-day-153573451',
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
    },
  ],
};
`;

  const day19 = applyPatreonPost(content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153424586',
    options: ['BOURNE', 'TEEN SHAKESPEARE'],
    pollWinner: 'TEEN SHAKESPEARE',
  });

  assert.equal(day19.updated, true);
  assert.match(
    day19.content,
    /winner: 'Teen Shakespeare',\n\s+poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153424586'/
  );

  const day20 = applyPatreonPost(day19.content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153497034',
    options: ['BRUCE LEE', 'HALLOWEEN'],
    pollWinner: 'HALLOWEEN',
  });

  assert.equal(day20.updated, true);
  assert.match(
    day20.content,
    /winner: 'Halloween',\n\s+poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153497034'/
  );

  const day23 = applyPatreonPost(day20.content, {
    url: 'https://www.patreon.com/posts/2026-march-day-153687561',
    options: ['TEEN SHAKESPEARE', 'HALLOWEEN'],
    pollWinner: null,
  });

  assert.equal(day23.updated, true);
  assert.match(
    day23.content,
    /poll: 'https:\/\/www\.patreon\.com\/posts\/2026-march-day-153687561',\n {10}options: \[\n {12}\{\n {14}winner: 'Teen Shakespeare'/
  );
});

test('loadCookies prefers PATREON_COOKIES env var over the local file', () => {
  const result = loadCookies({
    envCookies: 'session_id=from-env',
    fileExists: true,
    readFile: () => 'session_id=from-file',
  });

  assert.equal(result, 'session_id=from-env');
});

test('loadCookies falls back to the local file when PATREON_COOKIES is unset', () => {
  const result = loadCookies({
    envCookies: '',
    fileExists: true,
    readFile: () => 'session_id=from-file',
  });

  assert.equal(result, 'session_id=from-file');
});
