export interface Integration {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'error';
  config?: Record<string, any>;
}

export interface ProjectManagementCapability {
  createProject: (params: any) => Promise<any>;
  updateProject: (id: string, params: any) => Promise<any>;
  trackProgress: (id: string) => Promise<any>;
  generateReports: (id: string) => Promise<any>;
}

export interface ContentCreationCapability {
  generateContent: (type: string, params: any) => Promise<any>;
  scheduleContent: (content: any, schedule: any) => Promise<any>;
  optimizeContent: (content: any) => Promise<any>;
  analyzePerformance: (contentId: string) => Promise<any>;
}

export interface DevelopmentCapability {
  generateCode: (language: string, requirements: any) => Promise<any>;
  reviewCode: (code: string) => Promise<any>;
  deployProject: (project: any) => Promise<any>;
  monitorSystem: (systemId: string) => Promise<any>;
}

export interface AnalyticsCapability {
  collectData: (source: string, params: any) => Promise<any>;
  analyzeData: (data: any) => Promise<any>;
  generateInsights: (analysis: any) => Promise<any>;
  createDashboard: (metrics: any) => Promise<any>;
}

export const availableIntegrations: Integration[] = [
  {
    id: 'notion',
    name: 'Notion Integration',
    description: 'Content management and knowledge base',
    capabilities: ['content_storage', 'knowledge_base', 'project_tracking'],
    status: process.env.NOTION_TOKEN ? 'active' : 'inactive'
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Code repository and project management',
    capabilities: ['code_management', 'project_tracking', 'automation'],
    status: process.env.GITHUB_TOKEN ? 'active' : 'inactive'
  },
  {
    id: 'social_media',
    name: 'Social Media Integration',
    description: 'Multi-platform social media management',
    capabilities: ['content_publishing', 'engagement_tracking', 'analytics'],
    status: 'active'
  },
  {
    id: 'analytics',
    name: 'Analytics Integration',
    description: 'Data collection and analysis',
    capabilities: ['data_collection', 'performance_tracking', 'insights_generation'],
    status: 'active'
  },
  {
    id: 'development_tools',
    name: 'Development Tools',
    description: 'Code generation and deployment automation',
    capabilities: ['code_generation', 'deployment', 'monitoring'],
    status: 'active'
  }
];

export function getIntegrationStatus(integrationId: string): Integration | null {
  return availableIntegrations.find(i => i.id === integrationId) || null;
}

export function getActiveIntegrations(): Integration[] {
  return availableIntegrations.filter(i => i.status === 'active');
}
