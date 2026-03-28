import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDataHashes, getFileHash } from './update-data-hashes.mjs';

test('getFileHash is stable for the same input', () => {
  assert.equal(getFileHash('abc'), getFileHash('abc'));
});

test('buildDataHashes returns hashes for the live data files', () => {
  const result = buildDataHashes((file) => {
    if (file.endsWith('/2026.ts')) return 'main-data';
    if (file.endsWith('/2026-patreon.ts')) return 'patreon-data';
    throw new Error(`Unexpected file: ${file}`);
  });

  assert.deepEqual(result, {
    '2026': getFileHash('main-data'),
    '2026-patreon': getFileHash('patreon-data'),
  });
});
