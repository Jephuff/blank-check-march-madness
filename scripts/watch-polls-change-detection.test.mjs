import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildWorkflowDispatchRequest,
  evaluateTrackerUpdate,
  getWatchPollsMode,
  isWatchPollsEntrypoint,
} from './watch-polls.mjs';

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

test('buildWorkflowDispatchRequest creates the GitHub workflow_dispatch API request', () => {
  const result = buildWorkflowDispatchRequest({
    repository: 'jeffrey/blank-check-march-madness',
    token: 'secret-token',
    workflowId: 'march-madness.yml',
    ref: 'main',
  });

  assert.deepEqual(result, {
    url: 'https://api.github.com/repos/jeffrey/blank-check-march-madness/actions/workflows/march-madness.yml/dispatches',
    options: {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer secret-token',
        'Content-Type': 'application/json',
        'User-Agent': 'blank-check-march-madness-watch-polls',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    },
  });
});

test('getWatchPollsMode returns github-actions-trigger when the mode flag is enabled', () => {
  assert.equal(getWatchPollsMode({ useGithubActionsTrigger: true }), 'github-actions-trigger');
  assert.equal(getWatchPollsMode({ useGithubActionsTrigger: false }), 'local-watch');
});
