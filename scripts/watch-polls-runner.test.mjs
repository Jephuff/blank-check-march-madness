import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeScriptRun } from './watch-polls-runner.mjs';

test('summarizeScriptRun reports upstream match failures distinctly', () => {
  const result = summarizeScriptRun({
    status: 0,
    stdout: `Found 1 poll ID(s): 16734155
  ✓ "BC MARCH MADNESS 2026 - Day 17"  |  Martin Scorsese vs F Gary Gray  →  https://poll.fm/16734155
  ✗ No match in 2026.ts for: Martin Scorsese vs F Gary Gray
`,
    stderr: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.blockedByMatchFailure, true);
});

test('summarizeScriptRun stays clean when the fetcher makes no changes and has no match errors', () => {
  const result = summarizeScriptRun({
    status: 0,
    stdout: 'No changes needed for 2026.ts\nDone.\n',
    stderr: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.blockedByMatchFailure, false);
});

test('summarizeScriptRun reports winner placement failures distinctly', () => {
  const result = summarizeScriptRun({
    status: 0,
    stdout:
      'Writing winners to 2026.ts...\n  ✗ Could not place winner for https://poll.fm/16780845 in 2026.ts\n',
    stderr: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.blockedByMatchFailure, true);
});

test('summarizeScriptRun preserves failed exit status', () => {
  const result = summarizeScriptRun({
    status: 1,
    stdout: '',
    stderr: 'HTTP 500 fetching march-madness page\n',
  });

  assert.equal(result.ok, false);
  assert.equal(result.blockedByMatchFailure, false);
});
