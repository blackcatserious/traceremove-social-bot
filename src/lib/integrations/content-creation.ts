export interface ContentTemplate {
  id: string;
  name: string;
  type: 'article' | 'social_post' | 'documentation' | 'presentation' | 'strategy' | 'plan';
  structure: ContentSection[];
  variables: ContentVariable[];
}

export interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'list' | 'code' | 'image' | 'table';
  required: boolean;
  placeholder?: string;
}

export interface ContentVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'list';
  required: boolean;
  defaultValue?: any;
}

export interface ContentPiece {
  id: string;
  title: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  language: string;
}

export class ContentCreator {
  private templates: ContentTemplate[] = [
    {
      id: 'article_template',
      name: 'Technical Article',
      type: 'article',
      structure: [
        { id: 'title', title: 'Title', type: 'text', required: true },
        { id: 'introduction', title: 'Introduction', type: 'text', required: true },
        { id: 'main_content', title: 'Main Content', type: 'text', required: true },
        { id: 'code_examples', title: 'Code Examples', type: 'code', required: false },
        { id: 'conclusion', title: 'Conclusion', type: 'text', required: true }
      ],
      variables: [
        { name: 'target_audience', type: 'string', required: true },
        { name: 'technical_level', type: 'string', required: true },
        { name: 'word_count', type: 'number', required: false, defaultValue: 1500 }
      ]
    },
    {
      id: 'strategy_template',
      name: 'Strategic Plan',
      type: 'strategy',
      structure: [
        { id: 'executive_summary', title: 'Executive Summary', type: 'text', required: true },
        { id: 'objectives', title: 'Objectives', type: 'list', required: true },
        { id: 'analysis', title: 'Situation Analysis', type: 'text', required: true },
        { id: 'strategy', title: 'Strategy & Tactics', type: 'text', required: true },
        { id: 'timeline', title: 'Implementation Timeline', type: 'table', required: true },
        { id: 'metrics', title: 'Success Metrics', type: 'list', required: true }
      ],
      variables: [
        { name: 'timeframe', type: 'string', required: true },
        { name: 'budget', type: 'number', required: false },
        { name: 'stakeholders', type: 'list', required: true }
      ]
    }
  ];

  async generateContent(type: string, params: {
    template?: string;
    topic: string;
    audience: string;
    tone: string;
    length: number;
    language: string;
    requirements?: string[];
  }): Promise<ContentPiece> {
    const template = this.templates.find(t => t.type === type || t.id === params.template);
    
    if (!template) {
      throw new Error(`Template not found for type: ${type}`);
    }

    const content = await this.generateFromTemplate(template, params);
    
    return {
      id: `content_${Date.now()}`,
      title: params.topic,
      type,
      content,
      metadata: {
        template: template.id,
        audience: params.audience,
        tone: params.tone,
        length: params.length,
        requirements: params.requirements || []
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.extractTags(params.topic, content),
      language: params.language
    };
  }

  async scheduleContent(content: ContentPiece, schedule: {
    publishDate: Date;
    platforms: string[];
    timezone: string;
  }): Promise<{
    id: string;
    contentId: string;
    scheduledFor: Date;
    platforms: string[];
    status: 'scheduled' | 'published' | 'failed';
  }> {
    return {
      id: `schedule_${Date.now()}`,
      contentId: content.id,
      scheduledFor: schedule.publishDate,
      platforms: schedule.platforms,
      status: 'scheduled'
    };
  }

  async optimizeContent(content: ContentPiece): Promise<{
    suggestions: string[];
    seoScore: number;
    readabilityScore: number;
    optimizedContent?: string;
  }> {
    const suggestions: string[] = [];
    let seoScore = 70;
    let readabilityScore = 75;

    if (content.content.length < 300) {
      suggestions.push('Content is too short for optimal SEO');
      seoScore -= 20;
    }

    if (!content.content.includes(content.title.toLowerCase())) {
      suggestions.push('Include the main topic more frequently in the content');
      seoScore -= 10;
    }

    const sentences = content.content.split('.').length;
    const words = content.content.split(' ').length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence > 20) {
      suggestions.push('Consider shorter sentences for better readability');
      readabilityScore -= 15;
    }

    return {
      suggestions,
      seoScore,
      readabilityScore
    };
  }

  async analyzePerformance(contentId: string): Promise<{
    views: number;
    engagement: number;
    shares: number;
    conversions: number;
    topPerformingPlatforms: string[];
    recommendations: string[];
  }> {
    return {
      views: Math.floor(Math.random() * 10000),
      engagement: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 500),
      conversions: Math.floor(Math.random() * 50),
      topPerformingPlatforms: ['LinkedIn', 'Twitter'],
      recommendations: [
        'Post during peak engagement hours',
        'Use more visual content',
        'Engage with comments more actively'
      ]
    };
  }

  private async generateFromTemplate(template: ContentTemplate, params: any): Promise<string> {
    let content = `# ${params.topic}\n\n`;
    
    for (const section of template.structure) {
      content += `## ${section.title}\n\n`;
      
      switch (section.type) {
        case 'text':
          content += `[Generated ${section.title.toLowerCase()} content for ${params.topic}]\n\n`;
          break;
        case 'list':
          content += `- Key point 1\n- Key point 2\n- Key point 3\n\n`;
          break;
        case 'code':
          content += `\`\`\`javascript\n// Example code\nconsole.log('Hello World');\n\`\`\`\n\n`;
          break;
        case 'table':
          content += `| Column 1 | Column 2 |\n|----------|----------|\n| Data 1   | Data 2   |\n\n`;
          break;
      }
    }
    
    return content;
  }

  private extractTags(topic: string, content: string): string[] {
    const commonTags = ['technology', 'strategy', 'development', 'content', 'digital'];
    const topicWords = topic.toLowerCase().split(' ');
    return [...topicWords, ...commonTags].slice(0, 5);
  }

  getTemplates(): ContentTemplate[] {
    return this.templates;
  }

  getTemplate(id: string): ContentTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}
