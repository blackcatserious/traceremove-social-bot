'use client';

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';

export default function SearchOptimizationPage() {
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(false);

  const searchMetrics = [
    { label: 'Average Response Time', value: '245ms', change: '-12%', icon: Zap },
    { label: 'Search Accuracy', value: '94.2%', change: '+3%', icon: Target },
    { label: 'Cache Hit Rate', value: '78%', change: '+8%', icon: TrendingUp },
    { label: 'Daily Searches', value: '12.4K', change: '+15%', icon: BarChart3 }
  ];

  const topQueries = [
    { query: 'AI ethics', count: 1234, avgTime: '180ms', accuracy: '96%' },
    { query: 'machine learning', count: 987, avgTime: '220ms', accuracy: '94%' },
    { query: 'data privacy', count: 756, avgTime: '195ms', accuracy: '92%' },
    { query: 'automation', count: 654, avgTime: '210ms', accuracy: '95%' },
    { query: 'digital rights', count: 543, avgTime: '175ms', accuracy: '97%' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Search Optimization</h1>
              <p className="text-secondary">Optimize search performance and accuracy</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reindex
              </button>
              <button className="btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                Optimize
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {searchMetrics.map((metric, index) => (
            <div key={index} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-6 h-6 text-blue-400" />
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
            {['performance', 'queries', 'indexing', 'semantic'].map((tab) => (
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

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Response Time Trends</h3>
                  <div className="space-y-4">
                    {['Last 24h', 'Last 7d', 'Last 30d'].map((period, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-secondary">{period}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full"
                              style={{ width: `${85 - index * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-primary w-12 text-right">{245 + index * 20}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Search Quality Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">Precision</span>
                      <span className="text-primary">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">Recall</span>
                      <span className="text-primary">91.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">F1 Score</span>
                      <span className="text-primary">93.0%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">User Satisfaction</span>
                      <span className="text-primary">4.3/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary mb-4">Top Search Queries</h3>
              <div className="space-y-3">
                {topQueries.map((query, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-primary font-medium">"{query.query}"</h4>
                        <div className="flex space-x-6 mt-2 text-sm text-secondary">
                          <span>{query.count} searches</span>
                          <span>Avg: {query.avgTime}</span>
                          <span>Accuracy: {query.accuracy}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${
                          parseFloat(query.accuracy) > 95 ? 'bg-green-400' :
                          parseFloat(query.accuracy) > 90 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
