'use client';

import React, { useState } from 'react';
import { Brain, Database, Zap, BarChart3, Settings, RefreshCw, Activity, Clock } from 'lucide-react';

export default function ModelsVectorsPage() {
  const [activeTab, setActiveTab] = useState('models');

  const models = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      status: 'active',
      usage: 85,
      requests: 12450,
      avgResponseTime: 1200,
      cost: 245.67
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      status: 'active',
      usage: 65,
      requests: 8930,
      avgResponseTime: 1800,
      cost: 189.23
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      status: 'standby',
      usage: 15,
      requests: 1250,
      avgResponseTime: 950,
      cost: 23.45
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'Mistral',
      status: 'active',
      usage: 45,
      requests: 5670,
      avgResponseTime: 1100,
      cost: 78.90
    }
  ];

  const vectorDatabases = [
    {
      id: 'qdrant-main',
      name: 'Qdrant Main Index',
      type: 'Primary',
      vectors: 125000,
      dimensions: 1536,
      status: 'healthy',
      lastSync: '2024-09-01 14:30:00',
      size: '2.4 GB'
    },
    {
      id: 'qdrant-backup',
      name: 'Qdrant Backup',
      type: 'Backup',
      vectors: 125000,
      dimensions: 1536,
      status: 'healthy',
      lastSync: '2024-09-01 02:00:00',
      size: '2.4 GB'
    },
    {
      id: 'notion-embeddings',
      name: 'Notion Embeddings',
      type: 'Specialized',
      vectors: 45000,
      dimensions: 1536,
      status: 'syncing',
      lastSync: '2024-09-01 15:15:00',
      size: '890 MB'
    }
  ];

  const modelMetrics = [
    { label: 'Total Requests', value: '28.3K', change: '+12%' },
    { label: 'Avg Response Time', value: '1.2s', change: '-5%' },
    { label: 'Success Rate', value: '99.7%', change: '+0.1%' },
    { label: 'Monthly Cost', value: '$537', change: '+8%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-400';
      case 'healthy': return 'bg-green-600/20 text-green-400';
      case 'standby': return 'bg-yellow-600/20 text-yellow-400';
      case 'syncing': return 'bg-blue-600/20 text-blue-400';
      case 'error': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="w-5 h-5 text-green-400" />;
      case 'healthy': return <Activity className="w-5 h-5 text-green-400" />;
      case 'standby': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'syncing': return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return <Settings className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Models & Vector Management</h1>
              <p className="text-secondary">Manage AI models and vector database operations</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Vectors
              </button>
              <button className="btn-primary">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </button>
            </div>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {modelMetrics.map((metric, index) => (
            <div key={metric.label} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="text-secondary text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['models', 'vectors', 'performance'].map((tab) => (
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

          {activeTab === 'models' && (
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(model.status)}
                      <div>
                        <h3 className="font-semibold text-primary">{model.name}</h3>
                        <p className="text-secondary text-sm">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Usage</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${model.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-primary font-semibold">{model.usage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-secondary">Requests</p>
                      <p className="text-primary font-semibold">{model.requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Avg Response</p>
                      <p className="text-primary font-semibold">{model.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-secondary">Cost</p>
                      <p className="text-primary font-semibold">${model.cost}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Actions</p>
                      <div className="flex space-x-1">
                        <button className="text-blue-400 hover:text-blue-300 text-xs">Configure</button>
                        <button className="text-green-400 hover:text-green-300 text-xs">Test</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vectors' && (
            <div className="space-y-4">
              {vectorDatabases.map((db) => (
                <div key={db.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(db.status)}
                      <div>
                        <h3 className="font-semibold text-primary">{db.name}</h3>
                        <p className="text-secondary text-sm">{db.type} Database</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(db.status)}`}>
                        {db.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Vectors</p>
                      <p className="text-primary font-semibold">{db.vectors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Dimensions</p>
                      <p className="text-primary font-semibold">{db.dimensions}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Size</p>
                      <p className="text-primary font-semibold">{db.size}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Last Sync</p>
                      <p className="text-primary font-semibold">{db.lastSync}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Actions</p>
                      <div className="flex space-x-1">
                        <button className="text-blue-400 hover:text-blue-300 text-xs">Reindex</button>
                        <button className="text-green-400 hover:text-green-300 text-xs">Backup</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Best Performing Model</span>
                    <span className="text-primary font-semibold">GPT-4o</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Fastest Response</span>
                    <span className="text-primary font-semibold">Gemini Pro (950ms)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Most Cost Effective</span>
                    <span className="text-primary font-semibold">Mistral Large</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total API Calls</span>
                    <span className="text-primary font-semibold">28,300</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Vector Database Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total Vectors</span>
                    <span className="text-primary font-semibold">295,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Search Latency</span>
                    <span className="text-primary font-semibold">45ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Index Efficiency</span>
                    <span className="text-primary font-semibold">97.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Storage Used</span>
                    <span className="text-primary font-semibold">5.7 GB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
