import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';

const source = readFileSync(new URL('./watch-polls.mjs', import.meta.url), 'utf8');

test('winner trackers run fetchers in live-results mode', () => {
  assert.match(
    source,
    /label:\s*'winners'[\s\S]*?args:\s*\[\s*'--mock-closed'\s*\]/u
  );
  assert.match(
    source,
    /label:\s*'patreon winners'[\s\S]*?args:\s*\[\s*'--mock-closed'\s*\]/u
  );
});
