'use client';

import React, { useState } from 'react';
import { Zap, Globe, Github, Database, BarChart3, MessageSquare, Settings, CheckCircle, AlertTriangle, X, Star, GitBranch, Users, Plus } from 'lucide-react';

export default function IntegrationsGitHubPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('notion');
  const [activeTab, setActiveTab] = useState('integrations');

  const integrations = [
    {
      id: 'notion',
      name: 'Notion',
      description: 'Knowledge base and content management',
      status: 'connected',
      capabilities: ['Content Storage', 'Knowledge Base', 'Project Tracking'],
      config: {
        databases: 3,
        lastSync: '2 minutes ago',
        apiKey: 'ntn_***************'
      }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository and project management',
      status: 'connected',
      capabilities: ['Code Management', 'Project Tracking', 'Automation'],
      config: {
        repositories: 5,
        lastSync: '5 minutes ago',
        webhooks: 'Active'
      }
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'AI language model and processing',
      status: 'connected',
      capabilities: ['Text Generation', 'Analysis', 'Conversation'],
      config: {
        model: 'gpt-4o-mini',
        usage: '85% of quota',
        lastRequest: '1 minute ago'
      }
    },
    {
      id: 'upstash',
      name: 'Upstash Vector',
      description: 'Vector database for RAG',
      status: 'connected',
      capabilities: ['Vector Storage', 'Similarity Search', 'RAG Context'],
      config: {
        vectors: '12,450',
        lastIndex: '10 minutes ago',
        dimensions: 1536
      }
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deployment and hosting platform',
      status: 'connected',
      capabilities: ['Deployment', 'Edge Functions', 'Analytics'],
      config: {
        deployments: 23,
        lastDeploy: '1 hour ago',
        domains: 3
      }
    },
    {
      id: 'analytics',
      name: 'Analytics Suite',
      description: 'Performance tracking and insights',
      status: 'pending',
      capabilities: ['Performance Tracking', 'User Analytics', 'Reporting'],
      config: {
        events: 0,
        setup: 'Required'
      }
    }
  ];

  const repositories = [
    {
      id: 'traceremove-social-bot',
      name: 'traceremove-social-bot',
      description: 'AI-powered social media automation and content generation',
      status: 'active',
      stars: 42,
      forks: 8,
      language: 'TypeScript',
      lastCommit: '2 hours ago',
      branch: 'main'
    },
    {
      id: 'traceremove-modern',
      name: 'traceremove-modern',
      description: 'Modern research platform for AI ethics and philosophy',
      status: 'active',
      stars: 156,
      forks: 23,
      language: 'TypeScript',
      lastCommit: '1 day ago',
      branch: 'main'
    },
    {
      id: 'ai-ethics-framework',
      name: 'ai-ethics-framework',
      description: 'Comprehensive framework for AI ethics evaluation',
      status: 'archived',
      stars: 89,
      forks: 12,
      language: 'Python',
      lastCommit: '2 weeks ago',
      branch: 'main'
    }
  ];

  const githubActivity = [
    { action: 'Push to main', repo: 'traceremove-social-bot', time: '2 hours ago', user: 'Arthur Ziganshine' },
    { action: 'PR merged', repo: 'traceremove-modern', time: '1 day ago', user: 'Devin AI' },
    { action: 'Issue opened', repo: 'ai-ethics-framework', time: '3 days ago', user: 'Community' },
    { action: 'Release v2.1.0', repo: 'traceremove-social-bot', time: '1 week ago', user: 'Arthur Ziganshine' }
  ];

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'archived': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'active': return CheckCircle;
      case 'pending': return AlertTriangle;
      case 'archived': return Database;
      case 'error': return X;
      default: return AlertTriangle;
    }
  };

  const getIntegrationIcon = (id: string) => {
    switch (id) {
      case 'notion': return Database;
      case 'github': return Github;
      case 'openai': return Zap;
      case 'upstash': return Database;
      case 'vercel': return Globe;
      case 'analytics': return BarChart3;
      default: return Settings;
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Integrations & GitHub</h1>
              <p className="text-secondary">Manage external service connections and GitHub repositories</p>
            </div>
            <button className="btn-primary">
              <Zap className="w-4 h-4 mr-2" />
              Add Integration
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="card-professional">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Connected</h3>
                <p className="text-secondary text-sm">Active integrations</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Github className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Repositories</h3>
                <p className="text-secondary text-sm">Active repos</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {repositories.filter(r => r.status === 'active').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Star className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Total Stars</h3>
                <p className="text-secondary text-sm">GitHub stars</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {repositories.reduce((sum, r) => sum + r.stars, 0)}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">API Calls</h3>
                <p className="text-secondary text-sm">Last 24 hours</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">2,847</div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['integrations', 'github', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-secondary hover:text-primary hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="card-professional">
                <h2 className="text-xl font-bold text-primary mb-6">Integrations</h2>
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const StatusIcon = getStatusIcon(integration.status);
                    const IntegrationIcon = getIntegrationIcon(integration.id);
                    return (
                      <div
                        key={integration.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedIntegration === integration.id
                            ? 'bg-blue-600/20 border border-blue-500/50'
                            : 'bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <IntegrationIcon className="w-5 h-5 text-blue-400 mr-2" />
                            <h3 className="font-semibold text-primary">{integration.name}</h3>
                          </div>
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(integration.status)}`} />
                        </div>
                        <p className="text-secondary text-sm mb-2">{integration.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.capabilities.slice(0, 2).map((cap) => (
                            <span key={cap} className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1 rounded">
                              {cap}
                            </span>
                          ))}
                          {integration.capabilities.length > 2 && (
                            <span className="text-xs text-gray-500">+{integration.capabilities.length - 2}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedIntegrationData && (
                  <div className="space-y-6">
                    <div className="card-professional">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          {React.createElement(getIntegrationIcon(selectedIntegrationData.id), {
                            className: "w-8 h-8 text-blue-400 mr-3"
                          })}
                          <div>
                            <h2 className="text-xl font-bold text-primary">{selectedIntegrationData.name}</h2>
                            <p className="text-secondary text-sm">{selectedIntegrationData.description}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIntegrationData.status)} bg-gray-700`}>
                          {selectedIntegrationData.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {Object.entries(selectedIntegrationData.config).map(([key, value]) => (
                          <div key={key} className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-primary font-semibold mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                            <p className="text-secondary text-sm">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-4">
                        <button className="btn-primary">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </button>
                        <button className="btn-secondary">
                          Test Connection
                        </button>
                        {selectedIntegrationData.status === 'connected' && (
                          <button className="btn-secondary text-red-400 border-red-400 hover:bg-red-400/10">
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card-professional">
                      <h3 className="text-lg font-bold text-primary mb-4">Capabilities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedIntegrationData.capabilities.map((capability) => (
                          <div key={capability} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                            <span className="text-secondary text-sm">{capability}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              {repositories.map((repo) => {
                const StatusIcon = getStatusIcon(repo.status);
                return (
                  <div key={repo.id} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(repo.status)}`} />
                        <div>
                          <h3 className="font-semibold text-primary">{repo.name}</h3>
                          <p className="text-secondary text-sm">{repo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs bg-gray-700 ${getStatusColor(repo.status)}`}>
                          {repo.status}
                        </span>
                        <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                          <Github className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                          <GitBranch className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-secondary">Language</p>
                        <p className="text-primary font-semibold">{repo.language}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Stars</p>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-primary font-semibold">{repo.stars}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-secondary">Forks</p>
                        <p className="text-primary font-semibold">{repo.forks}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Last Commit</p>
                        <p className="text-primary font-semibold">{repo.lastCommit}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Branch</p>
                        <p className="text-primary font-semibold">{repo.branch}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {githubActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-primary text-sm">{activity.action}</p>
                    <p className="text-secondary text-xs">{activity.repo} • {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
