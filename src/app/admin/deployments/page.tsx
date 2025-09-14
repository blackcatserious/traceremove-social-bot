'use client';

import React, { useState } from 'react';
import { Rocket, GitBranch, Clock, CheckCircle, XCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react';

export default function DeploymentsPage() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');

  const environments = [
    { id: 'production', name: 'Production', url: 'https://traceremove.net', status: 'healthy' },
    { id: 'staging', name: 'Staging', url: 'https://staging.traceremove.net', status: 'healthy' },
    { id: 'development', name: 'Development', url: 'https://dev.traceremove.net', status: 'warning' }
  ];

  const deployments = [
    {
      id: 1,
      environment: 'production',
      version: 'v2.1.4',
      branch: 'main',
      commit: 'a9093db',
      status: 'success',
      deployedAt: '2024-09-01 20:15:32',
      deployedBy: 'Devin AI',
      duration: '2m 34s',
      changes: ['Fix API route deployment issues', 'Remove cron job limitations']
    },
    {
      id: 2,
      environment: 'staging',
      version: 'v2.1.5-rc.1',
      branch: 'devin/expand-management-pages',
      commit: '1234567',
      status: 'running',
      deployedAt: '2024-09-01 22:10:00',
      deployedBy: 'Devin AI',
      duration: '1m 45s',
      changes: ['Add 10 new admin pages', 'Expand monitoring capabilities']
    },
    {
      id: 3,
      environment: 'production',
      version: 'v2.1.3',
      branch: 'main',
      commit: '02f0834',
      status: 'success',
      deployedAt: '2024-09-01 18:45:12',
      deployedBy: 'Devin AI',
      duration: '3m 12s',
      changes: ['Implement comprehensive AI system', 'Add multi-model routing']
    },
    {
      id: 4,
      environment: 'development',
      version: 'v2.1.2',
      branch: 'feature/vector-db',
      commit: '8745c80',
      status: 'failed',
      deployedAt: '2024-09-01 16:20:45',
      deployedBy: 'Devin AI',
      duration: '0m 45s',
      changes: ['Vector database integration', 'RAG improvements']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-600/20 text-green-400';
      case 'running': return 'bg-blue-600/20 text-blue-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      case 'warning': return 'bg-yellow-600/20 text-yellow-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-600/20 text-red-400';
      case 'staging': return 'bg-yellow-600/20 text-yellow-400';
      case 'development': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const filteredDeployments = deployments.filter(deployment => 
    selectedEnvironment === 'all' || deployment.environment === selectedEnvironment
  );

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Deployment Management</h1>
              <p className="text-secondary">Monitor deployments and manage environments</p>
            </div>
            <button className="btn-primary">
              <Rocket className="w-4 h-4 mr-2" />
              Deploy
            </button>
          </div>
        </div>

        <div className="grid-professional grid-cols-3 mb-8">
          {environments.map((env) => (
            <div key={env.id} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Rocket className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-primary">{env.name}</h3>
                    <p className="text-secondary text-sm">{env.url}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(env.status)}`}>
                  {env.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-primary px-3 py-2 rounded-lg text-sm transition-colors">
                  <Play className="w-4 h-4 mr-1 inline" />
                  Deploy
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-primary px-3 py-2 rounded-lg text-sm transition-colors">
                  <RotateCcw className="w-4 h-4 mr-1 inline" />
                  Rollback
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-secondary" />
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Environments</option>
                {environments.map(env => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredDeployments.map((deployment) => (
              <div key={deployment.id} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(deployment.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-primary">{deployment.version}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getEnvironmentColor(deployment.environment)}`}>
                          {deployment.environment}
                        </span>
                      </div>
                      <p className="text-secondary text-sm">
                        {deployment.branch} • {deployment.commit}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deployment.status)}`}>
                    {deployment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-secondary">Deployed At</p>
                    <p className="text-primary">{deployment.deployedAt}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Deployed By</p>
                    <p className="text-primary">{deployment.deployedBy}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Duration</p>
                    <p className="text-primary">{deployment.duration}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Changes</p>
                    <p className="text-primary">{deployment.changes.length} change(s)</p>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-3">
                  <h4 className="text-sm font-medium text-primary mb-2">Changes:</h4>
                  <ul className="space-y-1">
                    {deployment.changes.map((change, index) => (
                      <li key={index} className="text-secondary text-sm">
                        • {change}
                      </li>
                    ))}
                  </ul>
                </div>

                {deployment.status === 'failed' && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      View Error Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
