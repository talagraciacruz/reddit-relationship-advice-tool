# Reddit Relationship Advice Tool

A personal workflow tool that bridges Reddit and Telegram, enabling a trained couples therapist to efficiently provide quality relationship advice across Reddit.

## Purpose

Relationship subreddits are frequently dominated by reactionary or harmful advice. This tool allows a qualified therapist to monitor new posts, review them via Telegram, and post thoughtful, evidence-based responses — without the friction of constant Reddit browsing.

## How It Works

```
Reddit (new posts) → Monitor → Telegram notification
                                      ↓
                              Therapist reviews post
                                      ↓
                              Records voice advice
                                      ↓
                          Transcribe → Post to Reddit
```

1. **Monitor**: Polls target subreddits for new posts seeking advice
2. **Notify**: Sends post summary to Telegram for review
3. **Respond**: Therapist records voice response via Telegram
4. **Post**: Transcribes and posts the response to Reddit under the therapist's account

## Technical Details

- **Runtime**: Node.js (v18+)
- **Reddit Access**: OAuth2 script-type app, single account
- **API Usage**: Read (polling new posts) + Write (posting comments)
- **Volume**: ~5 comments/day, well within rate limits
- **Pacing**: Minimum 5s delay between API calls with jitter
- **External**: Telegram Bot API for notifications

## What This Tool Does NOT Do

- ❌ Scrape or store Reddit data
- ❌ Train AI/ML models
- ❌ Vote, moderate, or manipulate content
- ❌ Post automated/templated responses
- ❌ Operate on behalf of multiple users
- ❌ Engage in any commercial activity

All responses are authored by the account holder. The tool is purely a delivery mechanism.

## Subreddits

- r/relationship_advice
- r/relationships
- r/Marriage
- r/dating_advice

## Rate Limiting & Politeness

- Respects Reddit's rate limits (100 QPM for OAuth)
- Implements exponential backoff on 429/5xx
- Randomised delay between requests (500-1500ms)
- Custom User-Agent per Reddit guidelines

## File Structure

```
├── README.md
├── reddit.mjs          # Reddit API client (OAuth + public JSON)
├── monitor.mjs         # Subreddit polling and filtering
├── telegram.mjs        # Telegram bot integration
└── config.example.js   # Configuration template (no secrets)
```

## Setup

1. Register a Reddit script-type app
2. Set environment variables (see config.example.js)
3. Create a Telegram bot via @BotFather
4. Run: `node monitor.mjs`

## License

MIT — Personal use only.
