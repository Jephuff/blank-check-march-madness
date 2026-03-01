#!/usr/bin/env node
/**
 * Fetches Blank Check Patreon March Madness post links and updates
 * src/brackets/data/2026-patreon.ts with the post URLs.
 *
 * The Patreon API returns post metadata publicly (no auth required).
 * Posts are matched to bracket matchups in file order by day number.
 *
 * Usage:
 *   node scripts/fetch-patreon-polls.mjs            # fetch and write
 *   node scripts/fetch-patreon-polls.mjs --dry-run  # preview without writing
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'src', 'brackets', 'data', '2026-patreon.ts');
const DRY_RUN = process.argv.includes('--dry-run');

const CAMPAIGN_ID = '2285006';
const YEAR = '2026';

// ---------------------------------------------------------------------------
// Fetch Patreon posts via public API
// ---------------------------------------------------------------------------

async function fetchMarchMadnessPosts() {
  const posts = [];
  let cursor = null;

  while (true) {
    const params = new URLSearchParams({
      'fields[post]': 'title,url,published_at',
      'filter[campaign_id]': CAMPAIGN_ID,
      'filter[contains_exclusive_posts]': 'true',
      'filter[is_draft]': 'false',
      'sort': '-published_at',
      'page[count]': '50',
      'json-api-use-default-includes': 'false',
      'include': '[]',
      'json-api-version': '1.0',
    });
    if (cursor) params.set('page[cursor]', cursor);

    const res = await fetch(`https://www.patreon.com/api/posts?${params}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching Patreon posts`);

    const data = await res.json();
    const pagePosts = data.data || [];

    // Only keep March Madness day posts
    for (const post of pagePosts) {
      const title = post.attributes?.title ?? '';
      const dayMatch = title.match(/(\d{4})\s+MARCH\s+MADNESS\s*[-–]\s*DAY\s*(\d+)/i);
      if (dayMatch && dayMatch[1] === YEAR) {
        posts.push({
          day: parseInt(dayMatch[2], 10),
          title,
          url: post.attributes.url,
        });
      }
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
  return posts;
}

// ---------------------------------------------------------------------------
// Update 2026-patreon.ts
// ---------------------------------------------------------------------------

function updateDataFile(posts) {
  let content = readFileSync(DATA_FILE, 'utf-8');
  let updated = 0;

  for (const post of posts) {
    if (content.includes(`poll: '${post.url}'`)) {
      console.log(`  · Already recorded: Day ${post.day}`);
      continue;
    }

    // Match the next unpolled leaf matchup:
    // a "{" immediately followed (next line) by "options: ['X', 'Y']"
    // (polled matchups have "poll: '...'" between "{" and "options:")
    const pattern = /([ \t]+)\{\n\1  options: \['([^']+)', '([^']+)'\]/;
    const match = pattern.exec(content);

    if (match) {
      const [fullMatch, indent, opt1, opt2] = match;
      content = content.replace(
        fullMatch,
        `${indent}{\n${indent}  poll: '${post.url}',\n${indent}  options: ['${opt1}', '${opt2}']`
      );
      updated++;
      console.log(`  ✓ Day ${post.day}: ${opt1} vs ${opt2}  →  ${post.url}`);
    } else {
      console.log(`  ✗ No unpolled matchup found for Day ${post.day}: "${post.title}"`);
    }
  }

  if (updated > 0) {
    if (DRY_RUN) {
      console.log(`\n  (dry-run) Would write ${updated} update(s) to 2026-patreon.ts`);
    } else {
      writeFileSync(DATA_FILE, content, 'utf-8');
      console.log(`\n  Saved 2026-patreon.ts (${updated} update(s))`);
    }
  } else {
    console.log('\n  No changes needed for 2026-patreon.ts');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching Patreon posts for Blank Check…\n');

  const posts = await fetchMarchMadnessPosts();

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

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
