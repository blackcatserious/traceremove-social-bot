'use client';

import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Zap, Globe } from 'lucide-react';

export default function HealthPage() {
  const [lastCheck, setLastCheck] = useState(new Date());

  const systemHealth = {
    overall: 'healthy',
    score: 98,
    issues: 1,
    warnings: 2
  };

  const healthChecks = [
    {
      category: 'Core Services',
      checks: [
        { name: 'API Gateway', status: 'healthy', responseTime: '120ms', details: 'All endpoints responding' },
        { name: 'Authentication', status: 'healthy', responseTime: '45ms', details: 'Token validation working' },
        { name: 'Rate Limiting', status: 'healthy', responseTime: '12ms', details: 'Within normal limits' }
      ]
    },
    {
      category: 'Database',
      checks: [
        { name: 'PostgreSQL', status: 'healthy', responseTime: '34ms', details: 'Connection pool: 12/20 active' },
        { name: 'Vector Database', status: 'warning', responseTime: '156ms', details: 'Slightly elevated response time' },
        { name: 'Database Migrations', status: 'healthy', responseTime: '0ms', details: 'All migrations applied' }
      ]
    },
    {
      category: 'External APIs',
      checks: [
        { name: 'OpenAI API', status: 'healthy', responseTime: '1.2s', details: 'Rate limits: 80% capacity' },
        { name: 'Anthropic API', status: 'healthy', responseTime: '1.8s', details: 'All models available' },
        { name: 'Notion API', status: 'warning', responseTime: '340ms', details: 'Intermittent timeouts' },
        { name: 'Google API', status: 'healthy', responseTime: '890ms', details: 'Gemini models responding' }
      ]
    },
    {
      category: 'Infrastructure',
      checks: [
        { name: 'Memory Usage', status: 'healthy', responseTime: '0ms', details: '68% of 2GB allocated' },
        { name: 'CPU Usage', status: 'healthy', responseTime: '0ms', details: '34% average load' },
        { name: 'Disk Space', status: 'healthy', responseTime: '0ms', details: '2.4GB used of 10GB' },
        { name: 'Network Connectivity', status: 'healthy', responseTime: '23ms', details: 'All regions accessible' }
      ]
    },
    {
      category: 'Application',
      checks: [
        { name: 'ETL Pipeline', status: 'healthy', responseTime: '0ms', details: 'Last sync: 2 hours ago' },
        { name: 'Chat System', status: 'healthy', responseTime: '245ms', details: 'All personas responding' },
        { name: 'Search Index', status: 'error', responseTime: '0ms', details: 'Index rebuild required' },
        { name: 'File Storage', status: 'healthy', responseTime: '89ms', details: 'S3 bucket accessible' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600/20 text-green-400';
      case 'warning': return 'bg-yellow-600/20 text-yellow-400';
      case 'error': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getOverallColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const runHealthCheck = () => {
    setLastCheck(new Date());
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">System Health</h1>
              <p className="text-secondary">Comprehensive system health monitoring</p>
            </div>
            <button onClick={runHealthCheck} className="btn-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Check
            </button>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Heart className={`w-8 h-8 ${getOverallColor(systemHealth.overall)}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">System Status</h2>
                <p className={`text-lg ${getOverallColor(systemHealth.overall)}`}>
                  {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">{systemHealth.score}%</div>
              <div className="text-secondary text-sm">Health Score</div>
            </div>
          </div>

          <div className="grid-professional grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {healthChecks.reduce((acc, cat) => acc + cat.checks.filter(c => c.status === 'healthy').length, 0)}
              </div>
              <div className="text-secondary text-sm">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{systemHealth.warnings}</div>
              <div className="text-secondary text-sm">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{systemHealth.issues}</div>
              <div className="text-secondary text-sm">Issues</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-secondary text-sm">
              Last checked: {lastCheck.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {healthChecks.map((category, categoryIndex) => (
            <div key={categoryIndex} className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.checks.map((check, checkIndex) => (
                  <div key={checkIndex} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <h3 className="font-semibold text-primary">{check.name}</h3>
                          <p className="text-secondary text-sm">{check.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                        {check.responseTime !== '0ms' && (
                          <p className="text-secondary text-xs mt-1">{check.responseTime}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
