#!/usr/bin/env node
/**
 * Watches for new March Madness poll links by running fetch-polls.mjs
 * and fetch-patreon-polls.mjs on a schedule.
 *
 * Each script is tracked independently:
 *  - Both poll hourly until they find the day's link
 *  - Once a script finds a new link, it stops until the next day
 *  - The other script keeps polling if it hasn't found its link yet
 *  - On April 2nd and beyond, prints "March Madness is Over" once per day
 *
 * Usage:
 *   node scripts/watch-polls.mjs
 *   npm run watch-polls
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'brackets', 'data');

const END_DATE = new Date('2026-04-02T00:00:00');
const TEN_MIN_MS = 10 * 60 * 1000;

// Returns ms until the next scheduled check:
//   9:00–9:59 → every 10 minutes (snapped to :00, :10, :20, …)
//   all other hours → every hour (snapped to :00)
// This naturally hits 9:00am since it's an hour boundary.
function msUntilNextCheck() {
  const now = new Date();
  const h = now.getHours();
  if (h === 9) {
    const msIntoHour =
      (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
    return TEN_MIN_MS - (msIntoHour % TEN_MIN_MS);
  }
  const nextHour = new Date(now);
  nextHour.setHours(h + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

function countMatches(files, pattern) {
  let count = 0;
  for (const file of files) {
    const content = readFileSync(join(DATA_DIR, file), 'utf-8');
    count += (content.match(pattern) ?? []).length;
  }
  return count;
}

const trackers = [
  {
    label: 'poll links',
    script: 'fetch-polls.mjs',
    args: [],
    count: () => countMatches(['2026.ts'], /poll: 'https?:/g),
    foundToday: false,
  },
  {
    label: 'patreon links',
    script: 'fetch-patreon-polls.mjs',
    args: [],
    count: () => countMatches(['2026-patreon.ts'], /poll: 'https?:/g),
    foundToday: false,
  },
  {
    label: 'winners',
    script: 'fetch-polls.mjs',
    args: [],
    count: () => countMatches(['2026.ts'], /winner: '/g),
    foundToday: false,
  },
  {
    label: 'patreon winners',
    script: 'fetch-patreon-polls.mjs',
    args: [],
    count: () => countMatches(['2026-patreon.ts'], /winner: '/g),
    foundToday: false,
  },
];

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runScript(name, ...args) {
  try {
    execFileSync(process.execPath, [join(__dirname, name), ...args], {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch {
    // Script errors are already printed via stdio: inherit; keep the watcher alive.
  }
}

function commitAndPush(updates) {
  try {
    const msg = `chore: ${updates
      .map(({ label, count }) => `${label} (${count} new)`)
      .join(', ')}`;
    execFileSync('npm', ['run', 'lint', '--', '--fix'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    execFileSync('git', ['add', 'src/brackets/data/'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    execFileSync('git', ['commit', '-m', msg], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    execFileSync('git', ['push'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    log(`Committed and pushed: "${msg}"`);
  } catch (err) {
    log(`Git error: ${err.message}`);
  }
}

function log(msg) {
  console.log(`[${new Date().toLocaleString()}] ${msg}`);
}

function todayKey() {
  return new Date().toDateString();
}

async function main() {
  log('Poll watcher started.');
  let lastDay = null;

  while (true) {
    const now = new Date();

    // Reset "found today" flags when the day rolls over
    const today = todayKey();
    if (today !== lastDay) {
      lastDay = today;
      for (const t of trackers) t.foundToday = false;
    }

    if (now >= END_DATE) {
      log('March Madness is Over');
      await sleep(msUntilMidnight());
      continue;
    }

    const pending = trackers.filter((t) => !t.foundToday);

    const updates = [];

    for (const tracker of pending) {
      const before = tracker.count();
      log(`Running ${tracker.label}…`);
      runScript(tracker.script, ...tracker.args);
      const after = tracker.count();

      if (after > before) {
        const found = after - before;
        log(`✓ ${tracker.label}: found ${found} new item(s). Done for today.`);
        tracker.foundToday = true;
        updates.push({ label: tracker.label, count: found });
      } else {
        log(`${tracker.label}: nothing new yet.`);
      }
    }

    if (updates.length > 0) {
      commitAndPush(updates);
    }

    const allFound = trackers.every((t) => t.foundToday);

    if (allFound) {
      const wait = msUntilMidnight();
      log(
        `All links found for today. Next check at midnight (${Math.round(
          wait / 60000
        )} min).`
      );
      await sleep(wait);
    } else {
      const stillPending = trackers
        .filter((t) => !t.foundToday)
        .map((t) => t.label);
      const wait = msUntilNextCheck();
      log(
        `Still waiting on: ${stillPending.join(', ')}. Next check in ${Math.round(wait / 60000)} min.`
      );
      await sleep(wait);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
