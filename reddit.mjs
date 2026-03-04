/**
 * reddit.mjs — Reddit API client for the Relationship Advisor Bot.
 *
 * Handles OAuth2 authentication and provides:
 * - getNewPosts(subreddit) — fetch recent posts
 * - postComment(postId, text) — post a comment as the authenticated user
 */

const BASE_URL = 'https://www.reddit.com';
const OAUTH_URL = 'https://oauth.reddit.com';

let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Polite delay between requests.
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Authenticate with Reddit using OAuth2 password grant.
 */
export async function authenticate() {
  const { clientId, clientSecret, username, password, userAgent } = (await import('./config.js')).default.reddit;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username,
      password,
    }),
  });

  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  console.log('Authenticated with Reddit.');
}

/**
 * Make an authenticated request to Reddit's OAuth API.
 */
async function oauthFetch(path, options = {}) {
  if (Date.now() > tokenExpiresAt - 60000) await authenticate();

  const { userAgent } = (await import('./config.js')).default.reddit;
  const { rateLimit } = (await import('./config.js')).default;

  await sleep(randInt(rateLimit.minDelayMs, rateLimit.maxDelayMs));

  const res = await fetch(`${OAUTH_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': userAgent,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit API error: ${res.status} ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * Fetch new posts from a subreddit.
 */
export async function getNewPosts(subreddit, { limit = 10 } = {}) {
  const data = await oauthFetch(`/r/${subreddit}/new?limit=${limit}`);

  return data.data.children
    .filter((p) => p.kind === 't3')
    .map((p) => ({
      id: p.data.id,
      title: p.data.title,
      author: p.data.author,
      selftext: p.data.selftext?.slice(0, 2000) || '',
      score: p.data.score,
      comments: p.data.num_comments,
      permalink: `https://reddit.com${p.data.permalink}`,
      created: new Date(p.data.created_utc * 1000).toISOString(),
    }));
}

/**
 * Post a comment on a Reddit post.
 */
export async function postComment(postId, text) {
  const fullname = postId.startsWith('t3_') ? postId : `t3_${postId}`;

  return oauthFetch('/api/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      thing_id: fullname,
      text,
      api_type: 'json',
    }),
  });
}
