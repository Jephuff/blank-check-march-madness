import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTrackerUpdate, isWatchPollsEntrypoint } from './watch-polls.mjs';

test('evaluateTrackerUpdate treats file content changes as updates even when counts stay flat', () => {
  const result = evaluateTrackerUpdate({
    beforeCount: 5,
    afterCount: 5,
    beforeSnapshot: 'poll: day19-wrong\npoll: day20-wrong\n',
    afterSnapshot: 'poll: day19-right\npoll: day20-right\n',
  });

  assert.deepEqual(result, {
    changed: true,
    count: 1,
  });
});

test('evaluateTrackerUpdate prefers count deltas when new items were added', () => {
  const result = evaluateTrackerUpdate({
    beforeCount: 7,
    afterCount: 9,
    beforeSnapshot: 'a',
    afterSnapshot: 'b',
  });

  assert.deepEqual(result, {
    changed: true,
    count: 2,
  });
});

test('isWatchPollsEntrypoint recognizes pm2 exec path launches', () => {
  const result = isWatchPollsEntrypoint({
    moduleUrl: 'file:///Users/jeffrey/projects/blank-check-march-madness/scripts/watch-polls.mjs',
    argv1: '/Users/jeffrey/.volta/tools/image/packages/pm2/lib/node_modules/pm2/lib/ProcessContainerFork.js',
    pmExecPath: '/Users/jeffrey/projects/blank-check-march-madness/scripts/watch-polls.mjs',
    platform: 'darwin',
  });

  assert.equal(result, true);
});
