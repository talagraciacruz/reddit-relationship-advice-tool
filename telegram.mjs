/**
 * telegram.mjs — Telegram Bot integration for notifications and replies.
 *
 * Sends post summaries to the therapist's Telegram chat.
 * Listens for voice message replies, transcribes them,
 * and passes the text back to the caller for posting to Reddit.
 */

import config from './config.js';

const API = `https://api.telegram.org/bot${config.telegram.botToken}`;

/**
 * Send a post notification to Telegram.
 */
export async function sendNotification({ subreddit, title, text, permalink, postId }) {
  const message = [
    `📬 New post in r/${subreddit}`,
    '',
    `**${title}**`,
    '',
    text.slice(0, 800) + (text.length > 800 ? '...' : ''),
    '',
    permalink,
    '',
    `Reply to this message with your advice. Post ID: ${postId}`,
  ].join('\n');

  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

/**
 * Listen for replies (text or voice) from Telegram.
 * When a voice message is received, it is transcribed.
 * The callback receives { postId, text }.
 */
export function listenForReplies(onReply) {
  let offset = 0;

  async function pollUpdates() {
    try {
      const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
      const data = await res.json();

      for (const update of data.result || []) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (!msg || String(msg.chat.id) !== String(config.telegram.chatId)) continue;

        // Extract post ID from the replied-to message
        const replyTo = msg.reply_to_message?.text || '';
        const postIdMatch = replyTo.match(/Post ID:\s*(\w+)/);
        if (!postIdMatch) continue;

        const postId = postIdMatch[1];
        let text = '';

        if (msg.text) {
          text = msg.text;
        } else if (msg.voice) {
          text = await transcribeVoice(msg.voice.file_id);
        }

        if (text && postId) {
          await onReply({ postId, text });
        }
      }
    } catch (err) {
      console.error('Telegram poll error:', err.message);
    }

    setTimeout(pollUpdates, 1000);
  }

  pollUpdates();
}

/**
 * Download and transcribe a Telegram voice message.
 */
async function transcribeVoice(fileId) {
  // Get file path from Telegram
  const fileRes = await fetch(`${API}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  const filePath = fileData.result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${config.telegram.botToken}/${filePath}`;

  // Download the audio file
  const audioRes = await fetch(fileUrl);
  const audioBuffer = await audioRes.arrayBuffer();

  // Transcribe using Whisper API or similar service
  // Implementation depends on chosen transcription provider
  // Returns the transcribed text
  return transcribeAudio(Buffer.from(audioBuffer));
}

async function transcribeAudio(buffer) {
  // Placeholder — integrate with OpenAI Whisper, Deepgram, etc.
  throw new Error('Transcription provider not configured');
}
