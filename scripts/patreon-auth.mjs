#!/usr/bin/env node
/**
 * One-time Patreon OAuth flow. Saves credentials to scripts/.patreon-credentials.json,
 * which fetch-patreon-polls.mjs will use for authenticated API access and winner detection.
 *
 * Setup:
 *   1. Go to https://www.patreon.com/portal/registration/register-clients
 *   2. Create an app; set the redirect URI to: http://localhost:8281/callback
 *   3. Run: PATREON_CLIENT_ID=xxx PATREON_CLIENT_SECRET=xxx node scripts/patreon-auth.mjs
 */

import { createServer } from 'http';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const PORT = 8281;
const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_FILE = join(__dirname, '.patreon-credentials.json');
const CLIENT_ID = process.env.PATREON_CLIENT_ID;
const CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'Usage: PATREON_CLIENT_ID=xxx PATREON_CLIENT_SECRET=xxx node scripts/patreon-auth.mjs'
  );
  console.error(
    '\nGet credentials at: https://www.patreon.com/portal/registration/register-clients'
  );
  console.error(`Set the redirect URI to: http://localhost:${PORT}/callback`);
  process.exit(1);
}

const authUrl = new URL('https://www.patreon.com/oauth2/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('scope', 'identity campaigns');

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl.toString());
console.log(`\nWaiting for callback on http://localhost:${PORT}/callback…\n`);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    res.end('No authorization code received.');
    return;
  }

  try {
    const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(
        `Token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`
      );
    }

    const tokens = await tokenRes.json();
    const creds = {
      ...tokens,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      created_at: Date.now(),
    };

    writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), 'utf-8');

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Authorized! You can close this tab.');
    console.log('✓ Credentials saved to scripts/.patreon-credentials.json');
    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
    console.error('✗ Error:', err.message);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT);
