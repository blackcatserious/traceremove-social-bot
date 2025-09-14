import type { Platform } from './limits';
import { normalizeTags } from './hashtags';
import { composeForPlatform } from './formatters';
import { generateWithLLM, LLMMode } from './llm';

export interface GenerateInput {
  platform: Platform;
  title: string;
  summary?: string;
  url?: string;
  tags?: string[];
}

export interface GeneratedContent {
  content: Array<{
    content: string;
    hashtags: string[];
    platform: string;
    type: string;
  }>;
  deliverables: string[];
  timeline: string;
  nextSteps: string[];
}

export interface ComprehensiveRequest {
  type: 'content' | 'project' | 'development' | 'analysis' | 'strategy';
  topic: string;
  requirements: string[];
  deliverables: string[];
  timeline?: string;
  audience?: string;
  platform?: string;
  language?: string;
}

export class ContentGenerator {
  async generateComprehensiveContent(request: ComprehensiveRequest): Promise<GeneratedContent> {
    const { type, topic, requirements, deliverables, timeline, audience, platform, language } = request;

    try {
      switch (type) {
        case 'content':
          return await this.generateContentPiece(topic, requirements || [], audience, platform, language);
        
        case 'project':
          return await this.generateProjectPlan(topic, requirements || [], deliverables, timeline);
        
        case 'development':
          return await this.generateDevelopmentSolution(topic, requirements || [], platform);
        
        case 'strategy':
          return await this.generateStrategy(topic, requirements || [], audience, timeline);
        
        case 'analysis':
          return await this.generateAnalysis(topic, requirements || [], audience);
        
        default:
          throw new Error(`Unsupported content type: ${type}`);
      }
    } catch (error) {
      console.error('Error generating comprehensive content:', error);
      return {
        content: [{
          content: `I apologize, but I encountered an error while generating ${type} content for "${topic}". Please try again or contact support.`,
          hashtags: [`#${type}`, '#Error'],
          platform: platform || 'general',
          type: type
        }],
        deliverables: ['Error report'],
        timeline: 'Immediate',
        nextSteps: ['Retry request', 'Contact support']
      };
    }
  }

  private async generateContentPiece(topic: string, requirements: string[], audience?: string, platform?: string, language?: string): Promise<GeneratedContent> {
    return {
      content: [{
        content: `# ${topic}\n\nComprehensive content piece covering ${topic} with focus on ${requirements.join(', ')}.\n\n## Overview\nDetailed analysis and insights on ${topic}.\n\n## Key Points\n${requirements.map(r => `- ${r}`).join('\n')}\n\n## Conclusion\nActionable takeaways and next steps.`,
        hashtags: ['#Content', '#Strategy'],
        platform: platform || 'blog',
        type: 'content'
      }],
      deliverables: ['Content piece', 'SEO optimization', 'Distribution plan'],
      timeline: '7 days',
      nextSteps: ['Content review', 'Publication', 'Performance tracking']
    };
  }

  private async generateProjectPlan(topic: string, requirements: string[], deliverables?: string[], timeline?: string): Promise<GeneratedContent> {
    return {
      content: [{
        content: `# Project Plan: ${topic}\n\n## Project Overview\nComprehensive project plan for ${topic}.\n\n## Requirements\n${requirements.map(r => `- ${r}`).join('\n')}\n\n## Deliverables\n${(deliverables || ['Planning document', 'Implementation guide']).map(d => `- ${d}`).join('\n')}\n\n## Timeline\n${timeline || '30 days'}\n\n## Next Steps\n- Project kickoff\n- Resource allocation\n- Implementation tracking`,
        hashtags: ['#ProjectManagement', '#Planning'],
        platform: 'documentation',
        type: 'project'
      }],
      deliverables: deliverables || ['Planning document', 'Implementation guide', 'Progress tracking'],
      timeline: timeline || '30 days',
      nextSteps: ['Project kickoff', 'Resource allocation', 'Implementation tracking']
    };
  }

  private async generateDevelopmentSolution(topic: string, requirements: string[], platform?: string): Promise<GeneratedContent> {
    return {
      content: [{
        content: `# Development Solution: ${topic}\n\n## Technical Requirements\n${requirements.map(r => `- ${r}`).join('\n')}\n\n## Architecture\nScalable solution architecture for ${topic}.\n\n## Implementation Plan\nStep-by-step development approach.\n\n## Code Structure\n\`\`\`typescript\n// Example implementation\nclass ${topic.replace(/\s+/g, '')}Solution {\n  // Implementation details\n}\n\`\`\``,
        hashtags: ['#Development', '#Code'],
        platform: platform || 'github',
        type: 'development'
      }],
      deliverables: ['Technical specification', 'Code implementation', 'Testing suite'],
      timeline: '21 days',
      nextSteps: ['Code review', 'Testing', 'Deployment']
    };
  }

  private async generateStrategy(topic: string, requirements: string[], audience?: string, timeline?: string): Promise<GeneratedContent> {
    return {
      content: [{
        content: `# Strategic Plan: ${topic}\n\n## Objectives\n${requirements.map(r => `- ${r}`).join('\n')}\n\n## Target Audience\n${audience || 'stakeholders'}\n\n## Timeline\n${timeline || '90 days'}\n\n## Implementation Strategy\nDetailed implementation plan with milestones and success metrics.`,
        hashtags: ['#Strategy', '#Planning'],
        platform: 'documentation',
        type: 'strategy'
      }],
      deliverables: ['Strategic document', 'Implementation roadmap', 'Success metrics'],
      timeline: timeline || '90 days',
      nextSteps: ['Stakeholder review', 'Resource allocation', 'Implementation kickoff']
    };
  }

  private async generateAnalysis(topic: string, requirements: string[], audience?: string): Promise<GeneratedContent> {
    return {
      content: [{
        content: `# Analysis Report: ${topic}\n\n## Executive Summary\nComprehensive analysis of ${topic} based on specified requirements.\n\n## Key Findings\n${requirements.map(r => `- ${r}`).join('\n')}\n\n## Recommendations\nActionable insights and next steps based on analysis.`,
        hashtags: ['#Analysis', '#Research'],
        platform: 'documentation',
        type: 'analysis'
      }],
      deliverables: ['Analysis report', 'Data insights', 'Recommendations'],
      timeline: '14 days',
      nextSteps: ['Review findings', 'Implement recommendations', 'Monitor results']
    };
  }
}

/**
 * Generate the final post text.  If `OPENAI_API_KEY` is provided and
 * `LLM_MODE` is not `off`, this calls the LLM helper.  Otherwise the
 * simple formatter is used.
 */
export async function generatePost(input: GenerateInput): Promise<string> {
  const { platform, title, summary, url, tags } = input;
  const llmMode = (process.env.LLM_MODE as LLMMode) || 'off';
  const hasLLM = !!process.env.OPENAI_API_KEY && llmMode !== 'off';
  if (hasLLM) {
    const { text } = await generateWithLLM({ platform, title, summary, url, tags });
    return text.trim();
  }
  const tagsList = tags || [];
  const text = composeForPlatform({ platform, title, summary, canonicalUrl: url, tags: tagsList });
  return text.trim();
}

export const contentGenerator = new ContentGenerator();
