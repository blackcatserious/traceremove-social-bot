import axios from 'axios';

/**
 * Publish a post to Facebook.  Requires the Page ID and access token.
 * Returns the ID of the created post.  In dry‑run mode logs the
 * message instead of calling the API.
 */
export async function publishToFacebook(text: string): Promise<string> {
  const dry = process.env.BOT_DRY_RUN === 'true';
  if (dry) {
    console.log(`[DRY] Facebook post:\n${text}\n`);
    return 'dry-run';
  }
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_ACCESS_TOKEN;
  if (!pageId || !token) throw new Error('Facebook credentials not set');
  const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
  const params = new URLSearchParams();
  params.append('message', text);
  params.append('access_token', token);
  const res = await axios.post(url, params);
  return res.data.id as string;
}