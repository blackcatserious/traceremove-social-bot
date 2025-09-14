'use client';

import React, { useState } from 'react';
import { Book, Shield, Key, Lock, Eye, EyeOff, Copy, RefreshCw, AlertTriangle, CheckCircle, Globe, Code } from 'lucide-react';

export default function APISecurityPage() {
  const [activeTab, setActiveTab] = useState('api-docs');
  const [showApiKey, setShowApiKey] = useState(false);

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/chat',
      description: 'AI chat completion endpoint',
      auth: 'API Key',
      rateLimit: '100/hour',
      status: 'active'
    },
    {
      method: 'POST',
      endpoint: '/api/search',
      description: 'Vector search with RAG context',
      auth: 'API Key',
      rateLimit: '50/hour',
      status: 'active'
    },
    {
      method: 'GET',
      endpoint: '/api/system/health',
      description: 'System health check',
      auth: 'None',
      rateLimit: '1000/hour',
      status: 'active'
    },
    {
      method: 'POST',
      endpoint: '/api/admin/reindex',
      description: 'Trigger RAG reindexing',
      auth: 'Admin Token',
      rateLimit: '10/day',
      status: 'active'
    },
    {
      method: 'GET',
      endpoint: '/api/system/metrics',
      description: 'System performance metrics',
      auth: 'API Key',
      rateLimit: '200/hour',
      status: 'active'
    }
  ];

  const securitySettings = [
    {
      name: 'API Rate Limiting',
      description: 'Protect against abuse with configurable rate limits',
      status: 'enabled',
      config: '100 requests/hour per key'
    },
    {
      name: 'CORS Protection',
      description: 'Cross-origin resource sharing controls',
      status: 'enabled',
      config: 'Restricted to allowed domains'
    },
    {
      name: 'Request Validation',
      description: 'Input sanitization and validation',
      status: 'enabled',
      config: 'Strict schema validation'
    },
    {
      name: 'SSL/TLS Encryption',
      description: 'Secure data transmission',
      status: 'enabled',
      config: 'TLS 1.3 enforced'
    },
    {
      name: 'API Key Rotation',
      description: 'Automatic key rotation policy',
      status: 'enabled',
      config: 'Monthly rotation'
    },
    {
      name: 'Audit Logging',
      description: 'Comprehensive request logging',
      status: 'enabled',
      config: '30-day retention'
    }
  ];

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk-proj-abc123...xyz789',
      created: '2024-08-01',
      lastUsed: '2024-09-01 15:30:00',
      requests: 15420,
      status: 'active'
    },
    {
      id: 2,
      name: 'Development Key',
      key: 'sk-dev-def456...uvw012',
      created: '2024-08-15',
      lastUsed: '2024-09-01 12:45:00',
      requests: 3240,
      status: 'active'
    },
    {
      id: 3,
      name: 'Testing Key',
      key: 'sk-test-ghi789...rst345',
      created: '2024-08-20',
      lastUsed: '2024-08-30 09:15:00',
      requests: 890,
      status: 'inactive'
    }
  ];

  const securityAlerts = [
    {
      level: 'warning',
      message: 'Unusual API usage pattern detected from IP 192.168.1.100',
      time: '2 hours ago'
    },
    {
      level: 'info',
      message: 'API key rotated successfully: Production API Key',
      time: '1 day ago'
    },
    {
      level: 'error',
      message: 'Failed authentication attempt from unknown source',
      time: '2 days ago'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600/20 text-green-400';
      case 'POST': return 'bg-blue-600/20 text-blue-400';
      case 'PUT': return 'bg-yellow-600/20 text-yellow-400';
      case 'DELETE': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'enabled': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'disabled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">API Documentation & Security</h1>
              <p className="text-secondary">API endpoints, authentication, and security management</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </button>
              <button className="btn-primary">
                <Shield className="w-4 h-4 mr-2" />
                Security Scan
              </button>
            </div>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">API Endpoints</h3>
                <p className="text-secondary text-sm">Active endpoints</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {apiEndpoints.filter(e => e.status === 'active').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Key className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">API Keys</h3>
                <p className="text-secondary text-sm">Active keys</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {apiKeys.filter(k => k.status === 'active').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Security Features</h3>
                <p className="text-secondary text-sm">Enabled protections</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {securitySettings.filter(s => s.status === 'enabled').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Security Alerts</h3>
                <p className="text-secondary text-sm">Last 24 hours</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {securityAlerts.length}
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['api-docs', 'security', 'keys', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-secondary hover:text-primary hover:bg-gray-700'
                }`}
              >
                {tab.replace('-', ' ').charAt(0).toUpperCase() + tab.replace('-', ' ').slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'api-docs' && (
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-primary font-mono">{endpoint.endpoint}</code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${endpoint.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      <span className={`text-sm ${getStatusColor(endpoint.status)}`}>{endpoint.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-secondary text-sm mb-3">{endpoint.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Authentication</p>
                      <p className="text-primary font-semibold">{endpoint.auth}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Rate Limit</p>
                      <p className="text-primary font-semibold">{endpoint.rateLimit}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Actions</p>
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 text-xs">Test</button>
                        <button className="text-green-400 hover:text-green-300 text-xs">Docs</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {securitySettings.map((setting, index) => (
                <div key={index} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Shield className={`w-5 h-5 ${getStatusColor(setting.status)}`} />
                      <div>
                        <h3 className="font-semibold text-primary">{setting.name}</h3>
                        <p className="text-secondary text-sm">{setting.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        setting.status === 'enabled' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {setting.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-secondary">Configuration: <span className="text-primary">{setting.config}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-primary">{key.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-secondary text-sm font-mono">
                          {showApiKey ? key.key : key.key.replace(/(?<=.{8}).*(?=.{8})/g, '***')}
                        </code>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        key.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {key.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Created</p>
                      <p className="text-primary font-semibold">{key.created}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Last Used</p>
                      <p className="text-primary font-semibold">{key.lastUsed}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Requests</p>
                      <p className="text-primary font-semibold">{key.requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Actions</p>
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                        <button className="text-red-400 hover:text-red-300 text-xs">Revoke</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {securityAlerts.map((alert, index) => (
                <div key={index} className={`card-professional border-l-4 ${getAlertColor(alert.level)}`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.level === 'error' ? 'bg-red-400' :
                        alert.level === 'warning' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm">{alert.message}</p>
                      <p className="text-secondary text-xs mt-1">{alert.time}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <button className="text-secondary hover:text-primary text-xs">Dismiss</button>
                    </div>
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
