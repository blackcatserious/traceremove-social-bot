'use client';

import React, { useState } from 'react';
import { Database, Search, RefreshCw, BarChart3, Layers, Zap, TrendingUp, Activity } from 'lucide-react';

export default function VectorsPage() {
  const [selectedNamespace, setSelectedNamespace] = useState('all');

  const namespaces = [
    { id: 'all', name: 'All Namespaces', vectors: 8947 },
    { id: 'traceremove_public', name: 'Public Content', vectors: 5623 },
    { id: 'traceremove_internal', name: 'Internal Content', vectors: 3324 }
  ];

  const vectorStats = [
    { label: 'Total Vectors', value: '8,947', change: '+12.3%', icon: Database },
    { label: 'Dimensions', value: '3,072', change: '0%', icon: Layers },
    { label: 'Index Size', value: '2.4 GB', change: '+8.7%', icon: BarChart3 },
    { label: 'Query Speed', value: '89ms', change: '-15.2%', icon: Zap }
  ];

  const recentQueries = [
    {
      id: 1,
      query: 'AI ethics in modern technology',
      namespace: 'traceremove_public',
      results: 15,
      responseTime: '67ms',
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      query: 'philosophy of machine learning',
      namespace: 'traceremove_public',
      results: 23,
      responseTime: '89ms',
      timestamp: '5 minutes ago'
    },
    {
      id: 3,
      query: 'brand reputation management',
      namespace: 'traceremove_internal',
      results: 8,
      responseTime: '45ms',
      timestamp: '12 minutes ago'
    },
    {
      id: 4,
      query: 'digital rights framework',
      namespace: 'traceremove_public',
      results: 31,
      responseTime: '102ms',
      timestamp: '18 minutes ago'
    }
  ];

  const indexHealth = [
    {
      table: 'catalog',
      vectors: 3456,
      lastUpdate: '2 hours ago',
      status: 'healthy',
      coverage: '98.5%'
    },
    {
      table: 'cases',
      vectors: 1234,
      lastUpdate: '4 hours ago',
      status: 'healthy',
      coverage: '97.2%'
    },
    {
      table: 'publishing',
      vectors: 2890,
      lastUpdate: '1 hour ago',
      status: 'healthy',
      coverage: '99.1%'
    },
    {
      table: 'finance',
      vectors: 1367,
      lastUpdate: '6 hours ago',
      status: 'warning',
      coverage: '94.8%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600/20 text-green-400';
      case 'warning': return 'bg-yellow-600/20 text-yellow-400';
      case 'error': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getNamespaceColor = (namespace: string) => {
    switch (namespace) {
      case 'traceremove_public': return 'bg-blue-600/20 text-blue-400';
      case 'traceremove_internal': return 'bg-purple-600/20 text-purple-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Vector Database</h1>
              <p className="text-secondary">Manage vector embeddings and search performance</p>
            </div>
            <button className="btn-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reindex All
            </button>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {vectorStats.map((stat, index) => (
            <div key={stat.label} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 
                  stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Namespaces</h2>
              <div className="space-y-3">
                {namespaces.map((namespace) => (
                  <div
                    key={namespace.id}
                    onClick={() => setSelectedNamespace(namespace.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedNamespace === namespace.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-primary">{namespace.name}</h3>
                        <p className="text-secondary text-sm">{namespace.vectors.toLocaleString()} vectors</p>
                      </div>
                      <Database className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Search className="w-4 h-4 mr-2" />
                  Test Query
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-6">Recent Queries</h2>
              <div className="space-y-4">
                {recentQueries.map((query) => (
                  <div key={query.id} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-primary">{query.query}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getNamespaceColor(query.namespace)}`}>
                        {query.namespace.replace('traceremove_', '')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-secondary">Results</p>
                        <p className="text-primary font-semibold">{query.results}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Response Time</p>
                        <p className="text-primary font-semibold">{query.responseTime}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Timestamp</p>
                        <p className="text-primary font-semibold">{query.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Index Health</h2>
          <div className="grid-professional grid-cols-2">
            {indexHealth.map((index) => (
              <div key={index.table} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary capitalize">{index.table}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(index.status)}`}>
                    {index.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary">Vectors</p>
                    <p className="text-primary font-semibold">{index.vectors.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Coverage</p>
                    <p className="text-primary font-semibold">{index.coverage}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-secondary text-xs">Last updated: {index.lastUpdate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
