#!/usr/bin/env node
/**
 * Fetches poll links from blankcheckpod.com/march-madness and updates
 * src/brackets/data/2026.ts (and 2026-patreon.ts) with poll URLs.
 *
 * Usage:
 *   node scripts/fetch-polls.mjs            # fetch and write
 *   node scripts/fetch-polls.mjs --dry-run  # preview without writing
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'brackets', 'data');
const DRY_RUN = process.argv.includes('--dry-run');
// Treat all polls as closed (fetches live results regardless of pollClosed flag)
const MOCK_CLOSED = process.argv.includes('--mock-closed');

// ---------------------------------------------------------------------------
// Fetch the march-madness page and extract all Polldaddy script URLs
// ---------------------------------------------------------------------------

async function fetchPollIds() {
  const res = await fetch('https://www.blankcheckpod.com/march-madness', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching march-madness page`);

  const html = await res.text();
  const ids = new Set();
  for (const m of html.matchAll(/secure\.polldaddy\.com\/p\/(\d+)\.js/g)) {
    ids.add(m[1]);
  }
  return [...ids];
}

// ---------------------------------------------------------------------------
// Fetch one Polldaddy JS file and extract title + option names + closed flag
// ---------------------------------------------------------------------------

async function fetchPollDetails(pollId) {
  const res = await fetch(`https://secure.polldaddy.com/p/${pollId}.js`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching poll ${pollId}`);

  const js = await res.text();

  // Title: PDV_POLL_q{id} = 'BC MARCH MADNESS 2026 - Day 1';
  const titleMatch = js.match(/PDV_POLL_q\d+\s*=\s*'([^']+)'/);
  const title = titleMatch?.[1]?.trim() ?? '';

  // Options: PDV_A{id}[N][1] = 'Martin Scorsese (1)';
  const options = [];
  for (const m of js.matchAll(/PDV_A\d+\[\d+\]\[1\]\s*=\s*'([^']+)'/g)) {
    // Strip trailing seed " (1)", " (8)" etc.
    const name = m[1].replace(/\s*\(\d+\)\s*$/, '').trim();
    if (name) options.push(name);
  }

  // pollClosed{id} = true means voting is finished; --mock-closed overrides
  const closedMatch = js.match(/pollClosed\d+\s*=\s*(true|false)/);
  const closed = MOCK_CLOSED || closedMatch?.[1] === 'true';

  return {
    pollId,
    url: `https://poll.fm/${pollId}`,
    title,
    options,
    closed,
  };
}

// ---------------------------------------------------------------------------
// Fetch results for a closed poll and return the winner name
// ---------------------------------------------------------------------------

async function fetchPollWinner(poll) {
  const res = await fetch(`https://poll.fm/${poll.pollId}/results`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching results for poll ${poll.pollId}`);

  const html = await res.text();

  // Extract answer texts and percentages from the results page HTML
  const textMatches = [...html.matchAll(/class="pds-answer-text">([^<]+)</g)];
  const pctMatches = [...html.matchAll(/class="pds-feedback-per">[^0-9]*(\d+)%/g)];

  if (textMatches.length !== pctMatches.length || textMatches.length === 0) {
    return null;
  }

  let winner = null;
  let highestPct = -1;
  for (let i = 0; i < textMatches.length; i++) {
    // Strip seed suffix like " (1)" to match bracket option names
    const name = textMatches[i][1].replace(/\s*\(\d+\)\s*$/, '').trim();
    const pct = parseInt(pctMatches[i][1], 10);
    console.log(`    ${name}: ${pct}%`);
    if (pct > highestPct) {
      highestPct = pct;
      winner = name;
    }
  }

  return winner;
}

// ---------------------------------------------------------------------------
// Update a bracket data file with poll URLs and/or winners
// ---------------------------------------------------------------------------

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateDataFile(filename, polls) {
  const filePath = join(DATA_DIR, filename);
  let content = readFileSync(filePath, 'utf-8');
  let updated = 0;

  for (const poll of polls) {
    const [a, b] = poll.options;

    if (content.includes(`poll: '${poll.url}'`)) {
      console.log(`  · Already recorded: ${a} vs ${b}`);
      continue;
    }

    // Try both orderings in case they differ between bracket and poll
    let matched = false;
    for (const [opt1, opt2] of [[a, b], [b, a]]) {
      const pattern = new RegExp(
        `([ \\t]+)options: \\['${escapeRegex(opt1)}', '${escapeRegex(opt2)}'\\]`,
        'g'
      );
      const next = content.replace(
        pattern,
        `$1poll: '${poll.url}',\n$1options: ['${opt1}', '${opt2}']`
      );
      if (next !== content) {
        content = next;
        matched = true;
        updated++;
        console.log(`  ✓ ${a} vs ${b}  →  ${poll.url}`);
        break;
      }
    }

    if (!matched) {
      console.log(`  ✗ No match in ${filename} for: ${a} vs ${b}`);
    }
  }

  if (updated > 0) {
    if (DRY_RUN) {
      console.log(`  (dry-run) Would write ${updated} update(s) to ${filename}`);
    } else {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`  Saved ${filename} (${updated} update(s))`);
    }
  } else {
    console.log(`  No changes needed for ${filename}`);
  }

  return updated;
}

function updateWinnersInFile(filename, pollsWithWinners) {
  const filePath = join(DATA_DIR, filename);
  let content = readFileSync(filePath, 'utf-8');
  let updated = 0;

  for (const { url, winner } of pollsWithWinners) {
    // Skip if winner already written
    const alreadyPattern = new RegExp(`winner: '${escapeRegex(winner)}',[\\s\\S]*?poll: '${escapeRegex(url)}'`);
    if (alreadyPattern.test(content)) {
      console.log(`  · Winner already recorded for ${url}`);
      continue;
    }

    // Find "  poll: 'URL'," not preceded by a winner line in the same block
    // Pattern: opening "{" on its own line immediately before "poll:" (no winner between them)
    const pattern = new RegExp(
      `([ \\t]+)\\{\\n\\1  poll: '${escapeRegex(url)}',`
    );
    const next = content.replace(
      pattern,
      `$1{\n$1  winner: '${winner}',\n$1  poll: '${url}',`
    );

    if (next !== content) {
      content = next;
      updated++;
      console.log(`  ✓ Winner: ${winner}  (${url})`);
    } else {
      console.log(`  ✗ Could not place winner for ${url} in ${filename}`);
    }
  }

  if (updated > 0) {
    if (DRY_RUN) {
      console.log(`  (dry-run) Would write ${updated} winner(s) to ${filename}`);
    } else {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`  Saved ${filename} (${updated} winner(s))`);
    }
  } else {
    console.log(`  No winner updates needed for ${filename}`);
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching poll IDs from blankcheckpod.com/march-madness…\n');

  const pollIds = await fetchPollIds();
  if (pollIds.length === 0) {
    console.log('No polls found on the page.');
    return;
  }

  console.log(`Found ${pollIds.length} poll ID(s): ${pollIds.join(', ')}`);
  console.log('Fetching poll details…\n');

  const polls = await Promise.all(pollIds.map(fetchPollDetails));

  for (const p of polls) {
    const valid = p.options.length === 2;
    console.log(
      `  ${valid ? '✓' : '⚠'} "${p.title}"  |  ${p.options.join(' vs ')}  →  ${p.url}${p.closed ? '  [CLOSED]' : ''}`
    );
    if (!valid) console.warn(`    ⚠ Expected 2 options, got ${p.options.length}`);
  }

  const validPolls = polls.filter((p) => p.options.length === 2);

  console.log('\nUpdating 2026.ts (main bracket)…');
  updateDataFile('2026.ts', validPolls);

  console.log('\nUpdating 2026-patreon.ts (patreon bracket)…');
  updateDataFile('2026-patreon.ts', validPolls);

  // Fetch winners for closed polls and write them to 2026.ts
  const closedPolls = validPolls.filter((p) => p.closed);
  if (closedPolls.length > 0) {
    console.log(`\nFetching results for ${closedPolls.length} closed poll(s)…`);
    const pollsWithWinners = [];
    for (const poll of closedPolls) {
      console.log(`  Results for "${poll.title}":`);
      const winner = await fetchPollWinner(poll);
      if (winner) {
        console.log(`  → Winner: ${winner}`);
        pollsWithWinners.push({ url: poll.url, winner });
      } else {
        console.warn(`  ⚠ Could not determine winner for poll ${poll.pollId}`);
      }
    }

    if (pollsWithWinners.length > 0) {
      console.log('\nWriting winners to 2026.ts…');
      updateWinnersInFile('2026.ts', pollsWithWinners);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
