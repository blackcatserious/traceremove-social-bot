import { TwitterApi } from 'twitter-api-v2';

/**
 * Publish a post to X/Twitter.  When `BOT_DRY_RUN` is `true` the function
 * logs the message and returns the string `dry-run` without posting.
 */
export async function publishToX(text: string): Promise<string> {
  const dry = process.env.BOT_DRY_RUN === 'true';
  if (dry) {
    console.log(`[DRY] X post:\n${text}\n`);
    return 'dry-run';
  }
  const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY!,
    appSecret: process.env.TWITTER_APP_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!
  });
  const res = await client.v2.tweet(text);
  return res.data.id;
}