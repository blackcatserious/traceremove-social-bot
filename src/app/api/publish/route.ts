import { NextResponse } from 'next/server';
import { fetchDuePosts, markAsPublished } from '@/lib/notion';
import { generatePost } from '@/lib/generator';
import { publishToX } from '@/lib/publishers/x';
import { publishToFacebook } from '@/lib/publishers/facebook';
import { publishToInstagram } from '@/lib/publishers/instagram';
import type { Platform } from '@/lib/limits';

// Disable caching for edge / Vercel
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  const { limit = 5, force = false } = await parseBody(req);
  const posts = await fetchDuePosts(limit);
  const published: any[] = [];
  for (const post of posts) {
    const platformIds: Partial<Record<Platform, string>> = {};
    for (const platform of post.platforms) {
      try {
        const text = await generatePost({
          platform,
          title: post.title,
          summary: post.summary,
          url: post.canonicalUrl,
          tags: post.tags
        });
        if (platform === 'X') {
          platformIds.X = await publishToX(text);
        } else if (platform === 'Facebook') {
          platformIds.Facebook = await publishToFacebook(text);
        } else if (platform === 'Instagram') {
          platformIds.Instagram = await publishToInstagram(text, post.imageUrl);
        }
      } catch (err) {
        console.error(`Failed to publish to ${platform}:`, err);
      }
    }
    await markAsPublished(post.id, platformIds);
    published.push({ postId: post.id, platformIds });
  }
  return NextResponse.json({ published });
}

// Helper to parse JSON body safely
async function parseBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}