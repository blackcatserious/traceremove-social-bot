'use client';

import React, { useState } from 'react';
import { Zap, Globe, Github, Database, BarChart3, MessageSquare, Settings, CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string>('notion');

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

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'pending': return AlertTriangle;
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
              <h1 className="text-3xl font-bold text-primary mb-2">System Integrations</h1>
              <p className="text-secondary">Manage external service connections and APIs</p>
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
              <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Pending</h3>
                <p className="text-secondary text-sm">Setup required</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {integrations.filter(i => i.status === 'pending').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Capabilities</h3>
                <p className="text-secondary text-sm">Total features</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {integrations.reduce((sum, i) => sum + i.capabilities.length, 0)}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">API Calls</h3>
                <p className="text-secondary text-sm">Last 24 hours</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">2,847</div>
          </div>
        </div>

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

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center bg-gray-700/50 rounded-lg p-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-primary text-sm">API call successful</p>
                        <p className="text-secondary text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-700/50 rounded-lg p-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-primary text-sm">Configuration updated</p>
                        <p className="text-secondary text-xs">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-700/50 rounded-lg p-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-primary text-sm">Connection established</p>
                        <p className="text-secondary text-xs">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
