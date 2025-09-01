'use client';

import React, { useState } from 'react';
import { Book, Play, Copy, CheckCircle, Code, Globe, Lock } from 'lucide-react';

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/search');
  const [testResponse, setTestResponse] = useState('');

  const endpoints = [
    {
      path: '/api/search',
      method: 'GET',
      description: 'Search across all content with RAG',
      auth: 'none',
      params: [
        { name: 'q', type: 'string', required: true, description: 'Search query' },
        { name: 'persona', type: 'string', required: false, description: 'public or internal' },
        { name: 'limit', type: 'number', required: false, description: 'Max results (default: 10)' }
      ]
    },
    {
      path: '/api/publishing/upcoming',
      method: 'GET',
      description: 'Get upcoming publication deadlines',
      auth: 'none',
      params: [
        { name: 'limit', type: 'number', required: false, description: 'Max results (default: 10)' },
        { name: 'persona', type: 'string', required: false, description: 'public or internal' }
      ]
    },
    {
      path: '/api/admin/reindex',
      method: 'POST',
      description: 'Trigger ETL reindexing',
      auth: 'bearer',
      params: [
        { name: 'persona', type: 'string', required: false, description: 'Specific persona to reindex' },
        { name: 'type', type: 'string', required: false, description: 'full, incremental, or persona' },
        { name: 'force', type: 'boolean', required: false, description: 'Force database initialization' }
      ]
    },
    {
      path: '/api/chat',
      method: 'POST',
      description: 'Chat with AI personas',
      auth: 'none',
      params: [
        { name: 'message', type: 'string', required: true, description: 'User message' },
        { name: 'persona', type: 'string', required: false, description: 'Specific persona ID' }
      ]
    },
    {
      path: '/api/etl/full',
      method: 'POST',
      description: 'Full ETL sync of all databases',
      auth: 'bearer',
      params: []
    },
    {
      path: '/api/etl/incremental',
      method: 'POST',
      description: 'Incremental ETL sync',
      auth: 'bearer',
      params: [
        { name: 'since', type: 'string', required: false, description: 'ISO timestamp for incremental sync' }
      ]
    }
  ];

  const exampleResponses = {
    '/api/search': {
      query: 'AI ethics',
      persona: 'public',
      answer: 'AI ethics involves the moral principles and guidelines...',
      sources: [
        { title: 'AI Ethics in Modern Society', table: 'catalog' },
        { title: 'Digital Rights Framework', table: 'catalog' }
      ],
      documents: [],
      model: 'gpt-4o-mini',
      provider: 'openai'
    },
    '/api/publishing/upcoming': {
      upcoming: [
        {
          id: 'notion_123',
          title: 'AI Ethics Paper',
          dueDate: '2024-09-15',
          venue: 'Journal of AI Ethics',
          submissionStatus: 'draft'
        }
      ],
      total: 1,
      stats: { total: 15, upcoming: 3, published: 8 }
    },
    '/api/admin/reindex': {
      ok: true,
      type: 'persona_reindex',
      persona: 'philosopher',
      indexed: 156,
      timestamp: '2024-09-01T22:00:00Z'
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600/20 text-green-400';
      case 'POST': return 'bg-blue-600/20 text-blue-400';
      case 'PUT': return 'bg-yellow-600/20 text-yellow-400';
      case 'DELETE': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getAuthIcon = (auth: string) => {
    return auth === 'bearer' ? <Lock className="w-4 h-4 text-yellow-400" /> : <Globe className="w-4 h-4 text-green-400" />;
  };

  const handleTestEndpoint = async () => {
    const endpoint = endpoints.find(e => e.path === selectedEndpoint);
    if (!endpoint) return;

    setTestResponse('Testing endpoint...');
    
    setTimeout(() => {
      const example = exampleResponses[selectedEndpoint as keyof typeof exampleResponses];
      setTestResponse(JSON.stringify(example, null, 2));
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">API Documentation</h1>
          <p className="text-secondary">Interactive documentation for traceremove.net API</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Endpoints</h2>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    onClick={() => setSelectedEndpoint(endpoint.path)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEndpoint === endpoint.path
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      {getAuthIcon(endpoint.auth)}
                    </div>
                    <h3 className="font-semibold text-primary text-sm">{endpoint.path}</h3>
                    <p className="text-secondary text-xs mt-1">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-professional">
              {(() => {
                const endpoint = endpoints.find(e => e.path === selectedEndpoint);
                if (!endpoint) return null;

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <h2 className="text-xl font-bold text-primary">{endpoint.path}</h2>
                      </div>
                      <button
                        onClick={handleTestEndpoint}
                        className="btn-primary"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </button>
                    </div>

                    <p className="text-secondary mb-6">{endpoint.description}</p>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-primary mb-3">Authentication</h3>
                      <div className="flex items-center space-x-2">
                        {getAuthIcon(endpoint.auth)}
                        <span className="text-primary">
                          {endpoint.auth === 'bearer' ? 'Bearer Token Required' : 'No Authentication Required'}
                        </span>
                      </div>
                    </div>

                    {endpoint.params.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-primary mb-3">Parameters</h3>
                        <div className="space-y-3">
                          {endpoint.params.map((param, index) => (
                            <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-semibold text-primary">{param.name}</span>
                                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                                  {param.type}
                                </span>
                                {param.required && (
                                  <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs">
                                    required
                                  </span>
                                )}
                              </div>
                              <p className="text-secondary text-sm">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-primary mb-3">Example Request</h3>
                      <div className="bg-gray-800 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard(`curl -X ${endpoint.method} "https://traceremove.net${endpoint.path}"`)}
                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <pre className="text-green-400 text-sm">
                          <code>
                            {`curl -X ${endpoint.method} "https://traceremove.net${endpoint.path}"`}
                            {endpoint.auth === 'bearer' && '\n  -H "Authorization: Bearer YOUR_TOKEN"'}
                          </code>
                        </pre>
                      </div>
                    </div>

                    {testResponse && (
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-3">Response</h3>
                        <div className="bg-gray-800 rounded-lg p-4 relative">
                          <button
                            onClick={() => copyToClipboard(testResponse)}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <pre className="text-blue-400 text-sm overflow-x-auto">
                            <code>{testResponse}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
