#!/usr/bin/env node

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'brackets', 'data');
const OUTPUT_FILE = join(ROOT, 'public', 'data-hashes.json');

const HASHED_FILES = {
  '2026': '2026.ts',
  '2026-patreon': '2026-patreon.ts',
};

export function getFileHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function buildDataHashes(readFile = (file) => readFileSync(file, 'utf8')) {
  return Object.fromEntries(
    Object.entries(HASHED_FILES).map(([key, file]) => [
      key,
      getFileHash(readFile(join(DATA_DIR, file))),
    ])
  );
}

export function writeDataHashes(outputFile = OUTPUT_FILE) {
  const hashes = buildDataHashes();
  writeFileSync(outputFile, `${JSON.stringify(hashes, null, 2)}\n`, 'utf8');
  return hashes;
}

function normalizeExecPath(value, platform) {
  if (!value) return null;
  return platform === 'win32' ? value.replace(/\//g, '\\') : value;
}

const isMainModule =
  fileURLToPath(import.meta.url) ===
  normalizeExecPath(process.argv[1], process.platform);

if (isMainModule) {
  writeDataHashes();
}
