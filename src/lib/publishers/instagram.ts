import axios from 'axios';

/**
 * Publish a post to Instagram via the Graph API.  Requires an image URL.
 * Returns the media ID created.  In dry‑run mode logs the message instead
 * of calling the API.
 */
export async function publishToInstagram(text: string, imageUrl?: string): Promise<string> {
  const dry = process.env.BOT_DRY_RUN === 'true';
  if (dry) {
    console.log(`[DRY] Instagram post:\n${text}\nimage: ${imageUrl}`);
    return 'dry-run';
  }
  const businessId = process.env.IG_BUSINESS_ACCOUNT_ID;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!businessId || !token) throw new Error('Instagram credentials not set');
  if (!imageUrl) throw new Error('Instagram requires an image URL');
  // Step 1: create media container
  const createRes = await axios.post(
    `https://graph.facebook.com/v19.0/${businessId}/media`,
    {
      caption: text,
      image_url: imageUrl,
      access_token: token
    }
  );
  const creationId = createRes.data.id as string;
  // Step 2: publish media container
  await axios.post(
    `https://graph.facebook.com/v19.0/${businessId}/media_publish`,
    {
      creation_id: creationId,
      access_token: token
    }
  );
  return creationId;
}