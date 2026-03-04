/**
 * Configuration template for Reddit Relationship Advisor Bot
 * Copy to config.js and fill in your values.
 * NEVER commit config.js — it contains secrets.
 */

export default {
  reddit: {
    clientId: '',          // From reddit.com/prefs/apps
    clientSecret: '',      // From reddit.com/prefs/apps
    username: '',          // Your Reddit username
    password: '',          // Your Reddit password
    userAgent: 'script:relationship-advisor:v1.0.0 (by /u/YOUR_USERNAME)',
  },

  telegram: {
    botToken: '',          // From @BotFather
    chatId: '',            // Your personal chat ID
  },

  monitor: {
    subreddits: [
      'relationship_advice',
      'relationships',
      'Marriage',
      'dating_advice',
    ],
    pollIntervalMs: 60000,       // Check every 60 seconds
    maxPostAgeMins: 30,          // Only notify for posts < 30 mins old
    minPostLengthChars: 100,     // Skip very short posts
  },

  rateLimit: {
    minDelayMs: 5000,
    maxDelayMs: 10000,
    timeoutMs: 20000,
  },
};
