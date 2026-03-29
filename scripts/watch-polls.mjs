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
import { runScript } from './watch-polls-runner.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'brackets', 'data');
const USE_GITHUB_ACTIONS_TRIGGER = true;
const GITHUB_ACTIONS_TRIGGER_INTERVAL_MS = 5 * 60 * 1000;
const GITHUB_ACTIONS_REPOSITORY = 'Jephuff/blank-check-march-madness';
const GITHUB_ACTIONS_WORKFLOW_ID = 'march-madness.yml';
const GITHUB_ACTIONS_REF = 'master';

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

function snapshotFiles(files) {
  return files
    .map((file) => readFileSync(join(DATA_DIR, file), 'utf-8'))
    .join('\n');
}

export function evaluateTrackerUpdate({
  beforeCount,
  afterCount,
  beforeSnapshot,
  afterSnapshot,
}) {
  const delta = afterCount - beforeCount;
  if (delta > 0) {
    return { changed: true, count: delta };
  }

  if (beforeSnapshot !== afterSnapshot) {
    return { changed: true, count: 1 };
  }

  return { changed: false, count: 0 };
}

export function getWatchPollsMode({
  useGithubActionsTrigger = USE_GITHUB_ACTIONS_TRIGGER,
} = {}) {
  return useGithubActionsTrigger ? 'github-actions-trigger' : 'local-watch';
}

export function buildWorkflowDispatchRequest({
  repository,
  token,
  workflowId = GITHUB_ACTIONS_WORKFLOW_ID,
  ref = GITHUB_ACTIONS_REF,
}) {
  return {
    url: `https://api.github.com/repos/${repository}/actions/workflows/${workflowId}/dispatches`,
    options: {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'blank-check-march-madness-watch-polls',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref }),
    },
  };
}

const trackers = [
  {
    label: 'poll links',
    script: 'fetch-polls.mjs',
    args: [],
    files: ['2026.ts'],
    count: () => countMatches(['2026.ts'], /poll: 'https?:/g),
    foundToday: false,
  },
  {
    label: 'patreon links',
    script: 'fetch-patreon-polls.mjs',
    args: [],
    files: ['2026-patreon.ts'],
    count: () => countMatches(['2026-patreon.ts'], /poll: 'https?:/g),
    foundToday: false,
  },
  {
    label: 'winners',
    script: 'fetch-polls.mjs',
    args: [],
    files: ['2026.ts'],
    count: () => countMatches(['2026.ts'], /winner: '/g),
    foundToday: false,
  },
  {
    label: 'patreon winners',
    script: 'fetch-patreon-polls.mjs',
    args: [],
    files: ['2026-patreon.ts'],
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

function commitAndPush(updates) {
  try {
    const msg = `chore: ${updates
      .map(({ label, count }) => `${label} (${count} new)`)
      .join(', ')}`;
    execFileSync('npm', ['run', 'lint', '--', '--fix'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    execFileSync(
      process.execPath,
      [join(__dirname, 'update-data-hashes.mjs')],
      {
        cwd: ROOT,
        stdio: 'inherit',
      }
    );
    execFileSync(
      'git',
      ['add', 'src/brackets/data/', 'public/data-hashes.json'],
      {
        cwd: ROOT,
        stdio: 'inherit',
      }
    );
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
  if (getWatchPollsMode() === 'github-actions-trigger') {
    await runGithubActionsTriggerLoop();
    return;
  }

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
      const beforeSnapshot = snapshotFiles(tracker.files);
      log(`Running ${tracker.label}…`);
      const result = runScript(tracker.script, ...tracker.args);
      const after = tracker.count();
      const afterSnapshot = snapshotFiles(tracker.files);
      const change = evaluateTrackerUpdate({
        beforeCount: before,
        afterCount: after,
        beforeSnapshot,
        afterSnapshot,
      });

      if (change.changed) {
        const found = change.count;
        log(`✓ ${tracker.label}: found ${found} new item(s). Done for today.`);
        tracker.foundToday = true;
        updates.push({ label: tracker.label, count: found });
      } else if (result.blockedByMatchFailure) {
        log(
          `${tracker.label}: upstream data was found, but the fetcher could not place it in the bracket file.`
        );
      } else if (!result.ok) {
        log(`${tracker.label}: fetcher failed; see script output above.`);
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
        `Still waiting on: ${stillPending.join(
          ', '
        )}. Next check in ${Math.round(wait / 60000)} min.`
      );
      await sleep(wait);
    }
  }
}

async function triggerGithubWorkflowDispatch({
  fetchImpl = fetch,
  token = process.env.GITHUB_ACTIONS_TRIGGER_TOKEN,
  repository = GITHUB_ACTIONS_REPOSITORY,
  workflowId = process.env.GITHUB_ACTIONS_WORKFLOW_ID ||
    GITHUB_ACTIONS_WORKFLOW_ID,
  ref = process.env.GITHUB_ACTIONS_REF || GITHUB_ACTIONS_REF,
} = {}) {
  if (!token) {
    throw new Error('Missing GITHUB_ACTIONS_TRIGGER_TOKEN.');
  }
  if (!repository) {
    throw new Error('Missing GitHub repository configuration.');
  }

  const request = buildWorkflowDispatchRequest({
    repository,
    token,
    workflowId,
    ref,
  });

  const response = await fetchImpl(request.url, request.options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub workflow dispatch failed: HTTP ${response.status} ${body}`
    );
  }
}

async function runGithubActionsTriggerLoop() {
  log('GitHub Actions trigger mode started.');

  while (true) {
    const now = new Date();

    if (now >= END_DATE) {
      log('March Madness is Over');
      await sleep(msUntilMidnight());
      continue;
    }

    try {
      await triggerGithubWorkflowDispatch();
      log('Triggered GitHub March Madness workflow.');
    } catch (err) {
      log(`GitHub workflow trigger failed: ${err.message}`);
    }

    await sleep(GITHUB_ACTIONS_TRIGGER_INTERVAL_MS);
  }
}

function normalizeExecPath(value, platform) {
  if (!value) return null;
  return platform === 'win32' ? value.replace(/\//g, '\\') : value;
}

export function isWatchPollsEntrypoint({
  moduleUrl = import.meta.url,
  argv1 = process.argv[1],
  pmExecPath = process.env.pm_exec_path,
  platform = process.platform,
} = {}) {
  const modulePath = fileURLToPath(moduleUrl);
  return (
    modulePath === normalizeExecPath(argv1, platform) ||
    modulePath === normalizeExecPath(pmExecPath, platform)
  );
}

if (isWatchPollsEntrypoint()) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
