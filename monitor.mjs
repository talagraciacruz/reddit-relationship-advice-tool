#!/usr/bin/env node

/**
 * monitor.mjs — Polls subreddits for new posts and notifies via Telegram.
 *
 * This is the main entry point. It:
 * 1. Authenticates with Reddit via OAuth2
 * 2. Polls configured subreddits for new posts
 * 3. Filters by age and length
 * 4. Sends matching posts to Telegram
 * 5. Listens for voice replies via Telegram
 * 6. Transcribes and posts replies back to Reddit
 */

import { getNewPosts, postComment, authenticate } from './reddit.mjs';
import { sendNotification, listenForReplies } from './telegram.mjs';
import config from './config.js';

const seen = new Set();

async function poll() {
  for (const sub of config.monitor.subreddits) {
    const posts = await getNewPosts(sub, { limit: 10 });

    for (const post of posts) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);

      // Skip very short posts or posts older than threshold
      const ageMs = Date.now() - new Date(post.created).getTime();
      if (ageMs > config.monitor.maxPostAgeMins * 60000) continue;
      if ((post.selftext || '').length < config.monitor.minPostLengthChars) continue;

      await sendNotification({
        subreddit: sub,
        title: post.title,
        text: post.selftext,
        permalink: post.permalink,
        postId: post.id,
      });
    }
  }
}

async function main() {
  console.log('Authenticating with Reddit...');
  await authenticate();

  console.log('Starting Telegram listener...');
  listenForReplies(async ({ postId, text }) => {
    console.log(`Posting reply to ${postId}...`);
    await postComment(postId, text);
    console.log('Reply posted.');
  });

  console.log(`Monitoring: ${config.monitor.subreddits.join(', ')}`);
  console.log(`Poll interval: ${config.monitor.pollIntervalMs / 1000}s`);

  // Initial poll
  await poll();

  // Recurring poll
  setInterval(poll, config.monitor.pollIntervalMs);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
