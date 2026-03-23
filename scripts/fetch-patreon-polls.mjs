#!/usr/bin/env node
/**
 * Fetches Blank Check Patreon March Madness post links and updates
 * src/brackets/data/2026-patreon.ts with the post URLs and poll winners.
 *
 * Without cookies: fetches post URLs only (unauthenticated API).
 * With cookies: also detects winners from closed Patreon native polls.
 *
 * Cookie setup (one-time):
 *   1. Open patreon.com in Chrome and log in
 *   2. Open DevTools > Network tab, click any patreon.com request
 *   3. In Request Headers, find "Cookie:" and copy the entire value
 *   4. Paste it into a new file: scripts/.patreon-cookies.txt
 *   (Refresh when cookies expire — usually every few weeks)
 *
 * Usage:
 *   node scripts/fetch-patreon-polls.mjs            # fetch and write
 *   node scripts/fetch-patreon-polls.mjs --dry-run  # preview without writing
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  applyNextPollUrl,
  applyPollUrlByMatch,
  applyWinnerByUrl,
  clearMatchupByPollUrl,
} from './bracket-data-updater.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(
  __dirname,
  '..',
  'src',
  'brackets',
  'data',
  '2026-patreon.ts'
);
const COOKIES_FILE = join(__dirname, '.patreon-cookies.txt');
const DRY_RUN = process.argv.includes('--dry-run');
// Treat all polls as closed (fetches live results regardless of closes_at)
const MOCK_CLOSED = process.argv.includes('--mock-closed');

const CAMPAIGN_ID = '2285006';
const YEAR = '2026';

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

function loadCookies() {
  if (!existsSync(COOKIES_FILE)) return null;
  const cookies = readFileSync(COOKIES_FILE, 'utf-8').trim();
  return cookies || null;
}

// ---------------------------------------------------------------------------
// Fetch Patreon posts via public API
// ---------------------------------------------------------------------------

async function fetchMarchMadnessPosts(cookies) {
  const posts = [];
  let cursor = null;

  while (true) {
    const params = new URLSearchParams({
      'fields[post]': 'title,url,published_at',
      'filter[campaign_id]': CAMPAIGN_ID,
      'filter[contains_exclusive_posts]': 'true',
      'filter[is_draft]': 'false',
      sort: '-published_at',
      'page[count]': '50',
      'json-api-use-default-includes': 'false',
      include: '[]',
      'json-api-version': '1.0',
    });
    if (cursor) params.set('page[cursor]', cursor);

    const headers = {
      Accept: 'application/vnd.api+json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };
    if (cookies) headers['Cookie'] = cookies;

    const res = await fetch(`https://www.patreon.com/api/posts?${params}`, {
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching Patreon posts`);

    const data = await res.json();
    const pagePosts = data.data || [];

    for (const post of pagePosts) {
      const title = post.attributes?.title ?? '';
      const dayMatch = title.match(
        /(\d{4})\s+MARCH\s+MADNESS\s*[-–]\s*DAY\s*(\d+)/i
      );
      if (!dayMatch || dayMatch[1] !== YEAR) continue;

      posts.push({
        day: parseInt(dayMatch[2], 10),
        title,
        url: post.attributes.url,
        options: null,
        pollWinner: null,
      });
    }

    const nextLink = data.links?.next;
    if (!nextLink || pagePosts.length === 0) break;

    const cursorMatch = nextLink.match(/page\[cursor\]=([^&]+)/);
    if (!cursorMatch) break;
    cursor = decodeURIComponent(cursorMatch[1]);

    // Stop after 150 posts — march madness posts are always recent
    if (posts.length >= 150) break;
  }

  posts.sort((a, b) => a.day - b.day);

  if (cookies) {
    for (const post of posts) {
      try {
        const pollDetails = await fetchPatreonPollDetails(post.url, cookies);
        post.options = pollDetails.options;
        post.pollWinner = pollDetails.winner;
      } catch (err) {
        if (err instanceof CookieExpiredError) {
          console.error(`\n⚠ ${err.message}\n`);
          break;
        }
        throw err;
      }
    }
  }

  return posts;
}

// ---------------------------------------------------------------------------
// Cookie-based poll winner detection
// ---------------------------------------------------------------------------

class CookieExpiredError extends Error {}

function postIdFromUrl(url) {
  const m = url.match(/-(\d+)$/);
  return m ? m[1] : null;
}

async function fetchPatreonPollDetails(postUrl, cookies) {
  const postId = postIdFromUrl(postUrl);
  if (!postId) return { options: null, winner: null };

  const headers = {
    Cookie: cookies,
    Accept: 'application/vnd.api+json',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  // Step 1: get poll ID and closed status from the post
  const postRes = await fetch(
    `https://www.patreon.com/api/posts/${postId}?include=poll&fields[poll]=closes_at,num_responses,question_text`,
    { headers }
  );
  if (postRes.status === 401 || postRes.status === 403) {
    throw new CookieExpiredError(
      'Patreon cookie has expired. Update scripts/.patreon-cookies.txt.'
    );
  }
  if (!postRes.ok) return { options: null, winner: null };

  const postData = await postRes.json();
  const pollRef = postData.data?.relationships?.poll?.data;
  if (!pollRef) return { options: null, winner: null };

  const pollResource = postData.included?.find(
    (i) => i.type === 'poll' && i.id === pollRef.id
  );
  const closesAt = pollResource?.attributes?.closes_at;
  const closed = MOCK_CLOSED || (closesAt && new Date(closesAt) <= new Date());

  // Step 2: fetch poll choices
  const pollRes = await fetch(
    `https://www.patreon.com/api/polls/${pollRef.id}?include=choices&fields[poll_choice]=text_content,num_responses,position`,
    { headers }
  );
  if (!pollRes.ok) return { options: null, winner: null };

  const pollData = await pollRes.json();
  const choices =
    pollData.included?.filter((i) => i.type === 'poll_choice') ?? [];

  if (choices.length === 0) return { options: null, winner: null };

  const options = choices
    .sort(
      (a, b) =>
        (a.attributes?.position ?? Number.MAX_SAFE_INTEGER) -
        (b.attributes?.position ?? Number.MAX_SAFE_INTEGER)
    )
    .map((choice) => choice.attributes?.text_content ?? '')
    .filter(Boolean);

  let winner = null;
  let highestVotes = -1;

  for (const choice of choices) {
    const text = choice.attributes?.text_content ?? '';
    const votes = choice.attributes?.num_responses ?? 0;
    console.log(`    ${text || '(no text)'}: ${votes} vote(s)`);
    if (votes > highestVotes) {
      highestVotes = votes;
      winner = text;
    }
  }

  return {
    options: options.length === 2 ? options : null,
    winner: closed ? winner || null : null,
  };
}

// ---------------------------------------------------------------------------
// Update 2026-patreon.ts with poll URLs
// ---------------------------------------------------------------------------

export function applyPatreonPollUrl(content, post) {
  if (post.options?.length === 2) {
    const cleared = clearMatchupByPollUrl(content, post.url);
    const baseContent = cleared.updated ? cleared.content : content;
    return applyPollUrlByMatch(baseContent, post);
  }
  return applyNextPollUrl(content, post.url);
}

export function applyPatreonPost(content, post) {
  let nextContent = content;
  let updated = false;
  const hasPlacedPoll = nextContent.includes(`poll: '${post.url}'`);
  if (post.options?.length === 2 || !hasPlacedPoll) {
    const pollResult = applyPatreonPollUrl(nextContent, post);
    if (!pollResult.updated) {
      return pollResult;
    }
    nextContent = pollResult.content;
    updated = true;
  }

  if (post.pollWinner) {
    const winnerResult = applyWinnerByUrl(nextContent, post.url, post.pollWinner);
    if (winnerResult.updated) {
      nextContent = winnerResult.content;
      updated = true;
    }
  }

  return {
    content: nextContent,
    updated,
    reason: updated ? undefined : 'already-recorded',
  };
}

function updateDataFile(posts) {
  let content = readFileSync(DATA_FILE, 'utf-8');
  let updated = 0;

  for (const post of posts) {
    const hadPoll = content.includes(`poll: '${post.url}'`);
    const result = applyPatreonPost(content, post);

    if (result.updated) {
      content = result.content;
      updated++;
      console.log(`  ✓ Day ${post.day}  →  ${post.url}`);
    } else if (hadPoll) {
      console.log(`  · Already recorded: Day ${post.day}`);
    } else {
      console.log(
        `  ✗ No unpolled matchup found for Day ${post.day}: "${post.title}"`
      );
    }
  }

  if (updated > 0) {
    if (DRY_RUN) {
      console.log(
        `\n  (dry-run) Would write ${updated} update(s) to 2026-patreon.ts`
      );
    } else {
      writeFileSync(DATA_FILE, content, 'utf-8');
      console.log(`\n  Saved 2026-patreon.ts (${updated} update(s))`);
    }
  } else {
    console.log('\n  No changes needed for 2026-patreon.ts');
  }

  return updated;
}

function updateWinnersInFile(pollsWithWinners) {
  let content = readFileSync(DATA_FILE, 'utf-8');
  let updated = 0;

  for (const { url, winner } of pollsWithWinners) {
    const result = applyWinnerByUrl(content, url, winner);
    if (result.updated) {
      content = result.content;
      updated++;
      console.log(`  ✓ Winner: ${winner}  (${url})`);
    } else if (result.reason === 'already-recorded') {
      console.log(`  · Winner already recorded for ${url}`);
    } else {
      console.log(`  ✗ Could not place winner for ${url}`);
    }
  }

  if (updated > 0) {
    if (DRY_RUN) {
      console.log(
        `\n  (dry-run) Would write ${updated} winner(s) to 2026-patreon.ts`
      );
    } else {
      writeFileSync(DATA_FILE, content, 'utf-8');
      console.log(`\n  Saved 2026-patreon.ts (${updated} winner(s))`);
    }
  } else {
    console.log('\n  No winner updates needed for 2026-patreon.ts');
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const cookies = loadCookies();

  if (cookies) {
    console.log('Patreon cookies found; winner detection enabled.\n');
  } else {
    console.log(
      'No Patreon cookies found. See script header for setup instructions.\n'
    );
  }

  console.log('Fetching Patreon posts for Blank Check…\n');
  const posts = await fetchMarchMadnessPosts(cookies);

  if (posts.length === 0) {
    console.log(`No ${YEAR} March Madness posts found.`);
    return;
  }

  console.log(`Found ${posts.length} March Madness post(s):`);
  for (const p of posts) {
    console.log(`  Day ${p.day}: "${p.title}"  →  ${p.url}`);
  }

  console.log('\nUpdating 2026-patreon.ts…');
  updateDataFile(posts);

  if (cookies) {
    const postsWithWinners = posts.filter((p) => p.pollWinner);
    if (postsWithWinners.length > 0) {
      console.log(
        `\nWriting ${postsWithWinners.length} winner(s) to 2026-patreon.ts…`
      );
      updateWinnersInFile(
        postsWithWinners.map((p) => ({ url: p.url, winner: p.pollWinner }))
      );
    } else {
      console.log('\nNo closed polls with winners found.');
    }
  }

  console.log('\nDone.');
}

const isMainModule =
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    (process.platform === 'win32'
      ? process.argv[1].replace(/\//g, '\\')
      : process.argv[1]);

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
