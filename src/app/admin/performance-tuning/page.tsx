'use client';

import React, { useState } from 'react';
import { Zap, Cpu, HardDrive, Network, TrendingUp, Settings, RefreshCw } from 'lucide-react';

export default function PerformanceTuningPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const performanceMetrics = [
    { label: 'CPU Usage', value: '45%', status: 'good', icon: Cpu },
    { label: 'Memory Usage', value: '67%', status: 'warning', icon: HardDrive },
    { label: 'Network I/O', value: '23%', status: 'good', icon: Network },
    { label: 'Response Time', value: '234ms', status: 'good', icon: Zap }
  ];

  const optimizations = [
    { name: 'Database Query Optimization', impact: 'High', status: 'active', improvement: '25%' },
    { name: 'Cache Layer Enhancement', impact: 'Medium', status: 'pending', improvement: '15%' },
    { name: 'API Response Compression', impact: 'Medium', status: 'active', improvement: '18%' },
    { name: 'Static Asset Optimization', impact: 'Low', status: 'completed', improvement: '8%' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Performance Tuning</h1>
              <p className="text-secondary">Optimize system performance and resource utilization</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze
              </button>
              <button className="btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                Auto-Optimize
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-6 h-6 text-blue-400" />
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="text-secondary text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['overview', 'optimizations', 'benchmarks', 'recommendations'].map((tab) => (
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

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Performance Trends</h3>
                  <div className="space-y-4">
                    {['Response Time', 'Throughput', 'Error Rate', 'Resource Usage'].map((metric, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-secondary">{metric}</span>
                        <div className="flex items-center space-x-3">
                          <TrendingUp className={`w-4 h-4 ${
                            index % 2 === 0 ? 'text-green-400' : 'text-red-400'
                          }`} />
                          <span className={`text-sm ${
                            index % 2 === 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {index % 2 === 0 ? '+12%' : '-8%'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Resource Allocation</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-secondary text-sm">CPU Cores</span>
                        <span className="text-primary font-semibold">8/16</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-secondary text-sm">Memory</span>
                        <span className="text-primary font-semibold">10.7GB/16GB</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-secondary text-sm">Storage</span>
                        <span className="text-primary font-semibold">234GB/500GB</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '47%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'optimizations' && (
            <div className="space-y-4">
              {optimizations.map((opt, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-primary font-medium">{opt.name}</h4>
                      <div className="flex space-x-6 mt-2 text-sm text-secondary">
                        <span>Impact: {opt.impact}</span>
                        <span>Improvement: {opt.improvement}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        opt.status === 'active' ? 'bg-green-600/20 text-green-400' :
                        opt.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-blue-600/20 text-blue-400'
                      }`}>
                        {opt.status}
                      </span>
                      <button className="btn-secondary text-xs">
                        {opt.status === 'pending' ? 'Apply' : 'Configure'}
                      </button>
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
