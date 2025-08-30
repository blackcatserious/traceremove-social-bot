import { Client } from '@notionhq/client';
import type { Platform } from './limits';

export interface Post {
  id: string;
  title: string;
  summary?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  tags: string[];
  platforms: Platform[];
  publishAt?: string;
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * Fetch all posts from the Notion database that are ready to publish.  A post
 * qualifies if its status is `Ready` or `Scheduled` and its `Publish At`
 * property is either empty or not greater than the current time (in the
 * timezone specified by `TIMEZONE`).  The `limit` argument can be used to
 * restrict the number of returned posts.
 */
export async function fetchDuePosts(limit = 5): Promise<Post[]> {
  if (!databaseId) return [];
  const now = new Date().toISOString();
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Status',
          select: { equals: 'Ready' }
        },
        {
          or: [
            {
              property: 'Publish At',
              date: { is_empty: true }
            },
            {
              property: 'Publish At',
              date: { on_or_before: now }
            }
          ]
        }
      ]
    },
    sorts: [{ property: 'Publish At', direction: 'ascending' }],
    page_size: limit
  });
  const posts: Post[] = [];
  for (const page of response.results) {
    if (!('properties' in page)) continue;
    const props: any = page.properties;
    const titleProp = props['Title']?.title?.[0]?.plain_text || '';
    const summaryProp = props['Summary']?.rich_text?.[0]?.plain_text || '';
    const canonicalUrl = props['Canonical URL']?.url || undefined;
    const imageUrl = props['Image URL']?.url || undefined;
    const tags = (props['Tags']?.multi_select || []).map((t: any) => t.name);
    const platforms = (props['Platforms']?.multi_select || []).map((p: any) => p.name) as Platform[];
    const publishAt = props['Publish At']?.date?.start || undefined;
    posts.push({
      id: page.id,
      title: titleProp,
      summary: summaryProp,
      canonicalUrl,
      imageUrl,
      tags,
      platforms,
      publishAt
    });
  }
  return posts;
}

/**
 * Update the given page to mark it as published and record the platform IDs.
 * The `platformIds` object maps platform names (`X`, `Facebook`, `Instagram`)
 * to the IDs returned by the corresponding API after posting.
 */
export async function markAsPublished(pageId: string, platformIds: Partial<Record<Platform, string>>): Promise<void> {
  const updates: Record<string, any> = {
    Status: { select: { name: 'Published' } }
  };
  if (platformIds.X) {
    updates['X Post ID'] = { rich_text: [{ text: { content: platformIds.X } }] };
  }
  if (platformIds.Facebook) {
    updates['FB Post ID'] = { rich_text: [{ text: { content: platformIds.Facebook } }] };
  }
  if (platformIds.Instagram) {
    updates['IG Media ID'] = { rich_text: [{ text: { content: platformIds.Instagram } }] };
  }
  await notion.pages.update({
    page_id: pageId,
    properties: updates
  });
}