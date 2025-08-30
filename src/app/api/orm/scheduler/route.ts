import { NextRequest, NextResponse } from 'next/server';
import { Client as NotionClient } from '@notionhq/client';
import OpenAI from 'openai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

let notionClient: NotionClient | null = null;
let openaiClient: OpenAI | null = null;

function getNotionClient(): NotionClient {
  if (!notionClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error('Notion token not configured');
    }
    notionClient = new NotionClient({ auth: token });
  }
  return notionClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

interface SchedulerTask {
  type: 'social_post' | 'pr_response' | 'content_plan' | 'github_update';
  title: string;
  content: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
  persona?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('ORM Scheduler: Starting daily content generation...');
    
    const tasks = await generateDailyTasks();
    
    const results: Array<{
      task: string;
      title: string;
      notionId?: string;
      status: string;
      error?: string;
    }> = [];
    
    for (const task of tasks) {
      try {
        const notionPage = await createNotionDraft(task);
        results.push({
          task: task.type,
          title: task.title,
          notionId: notionPage.id,
          status: 'created'
        });
      } catch (error) {
        console.error(`Error creating Notion page for ${task.type}:`, error);
        results.push({
          task: task.type,
          title: task.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log('ORM Scheduler: Completed daily content generation');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasksGenerated: results.length,
      results
    });
    
  } catch (error) {
    console.error('ORM Scheduler error:', error);
    return NextResponse.json(
      { 
        error: 'Scheduler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateDailyTasks(): Promise<SchedulerTask[]> {
  const today = new Date().toLocaleDateString();
  
  const prompts = [
    {
      type: 'social_post' as const,
      prompt: `Generate a professional social media post for TraceRemove's reputation management services using the ORM Assistant persona. Focus on tips for online reputation management. Make it engaging and informative. Date: ${today}`,
      language: 'en',
      persona: 'orm-multilang'
    },
    {
      type: 'pr_response' as const,
      prompt: `Create a template response for addressing negative reviews professionally using the ORM Assistant persona. Include empathy, solution-oriented language, and brand protection strategies. Date: ${today}`,
      language: 'en',
      persona: 'orm-multilang'
    },
    {
      type: 'content_plan' as const,
      prompt: `Outline a weekly content plan for reputation management topics using the ORM Assistant persona. Include blog post ideas, social media themes, and educational content about ORM. Date: ${today}`,
      language: 'en',
      persona: 'orm-multilang'
    },
    {
      type: 'github_update' as const,
      prompt: `Create a GitHub issue or documentation update for TraceRemove's reputation management knowledge base. Focus on best practices and case studies. Date: ${today}`,
      language: 'en',
      persona: 'orm-multilang'
    }
  ];
  
  const tasks: SchedulerTask[] = [];
  
  for (const promptConfig of prompts) {
    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional ORM (Online Reputation Management) content creator for TraceRemove. Create high-quality, professional content that helps with brand reputation and online presence management.'
          },
          {
            role: 'user',
            content: promptConfig.prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      
      const content = completion.choices[0]?.message?.content || '';
      
      if (content) {
        tasks.push({
          type: promptConfig.type,
          title: `Daily ${promptConfig.type.replace('_', ' ')} - ${today}`,
          content,
          language: promptConfig.language,
          priority: 'medium',
          persona: promptConfig.persona
        });
      }
    } catch (error) {
      console.error(`Error generating ${promptConfig.type}:`, error);
    }
  }
  
  return tasks;
}

async function createNotionDraft(task: SchedulerTask): Promise<{ id: string }> {
  const databaseId = process.env.NOTION_COM_DB; // Default to .com database
  
  if (!databaseId) {
    throw new Error('Notion database ID not configured');
  }
  
  const notion = getNotionClient();
  const page = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      'Name': {
        title: [
          {
            text: {
              content: task.title,
            },
          },
        ],
      },
      'Type': {
        select: {
          name: task.type === 'social_post' ? 'Post' : 
                task.type === 'pr_response' ? 'ReviewReply' :
                task.type === 'github_update' ? 'GitHub' : 'Plan',
        },
      },
      'Status': {
        select: {
          name: 'Draft',
        },
      },
      'Priority': {
        select: {
          name: task.priority,
        },
      },
      'Language': {
        select: {
          name: task.language,
        },
      },
      'Created': {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: task.content,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Persona: ${task.persona || 'default'} | Language: ${task.language}`,
              },
            },
          ],
        },
      },
    ],
  });
  
  return page;
}

export async function GET() {
  return NextResponse.json({
    message: 'ORM Scheduler endpoint is active',
    timestamp: new Date().toISOString(),
    note: 'Use POST with proper authorization to trigger content generation'
  });
}
