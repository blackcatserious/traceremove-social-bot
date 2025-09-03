'use client';

import React, { useState } from 'react';
import { Play, Pause, Plus, Edit3, Trash2, Clock, CheckCircle, AlertTriangle, Calendar, Rocket, GitBranch, Globe } from 'lucide-react';

interface WorkflowData {
  workflows: any[];
  templates: any[];
  stats: {
    total: number;
    active: number;
    totalRuns: number;
  };
}

export default function WorkflowsDeploymentsPage() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);

  const workflows = [
    {
      id: 1,
      name: 'Daily ETL Sync',
      description: 'Sync all Notion databases and update vector embeddings',
      schedule: '0 2 * * *',
      status: 'active',
      lastRun: '2024-09-01 02:00:00',
      nextRun: '2024-09-02 02:00:00',
      success: true,
      duration: '12m 34s'
    },
    {
      id: 2,
      name: 'Incremental Content Update',
      description: 'Check for updated content every 15 minutes',
      schedule: '*/15 * * * *',
      status: 'paused',
      lastRun: '2024-09-01 21:45:00',
      nextRun: null,
      success: true,
      duration: '2m 15s'
    },
    {
      id: 3,
      name: 'Weekly Analytics Report',
      description: 'Generate and send weekly performance reports',
      schedule: '0 9 * * 1',
      status: 'active',
      lastRun: '2024-08-26 09:00:00',
      nextRun: '2024-09-02 09:00:00',
      success: false,
      duration: '5m 42s'
    }
  ];

  const deployments = [
    {
      id: 1,
      environment: 'Production',
      branch: 'main',
      commit: 'a1b2c3d',
      status: 'deployed',
      timestamp: '2024-09-01 14:30:00',
      duration: '3m 45s',
      url: 'https://traceremove.net'
    },
    {
      id: 2,
      environment: 'Staging',
      branch: 'develop',
      commit: 'e4f5g6h',
      status: 'deploying',
      timestamp: '2024-09-01 15:15:00',
      duration: '2m 12s',
      url: 'https://staging.traceremove.net'
    },
    {
      id: 3,
      environment: 'Preview',
      branch: 'feature/new-ui',
      commit: 'i7j8k9l',
      status: 'failed',
      timestamp: '2024-09-01 13:45:00',
      duration: '1m 23s',
      url: 'https://preview-123.traceremove.net'
    }
  ];

  const workflowTemplates = [
    {
      name: 'Database Backup',
      description: 'Automated database backup with retention policy',
      category: 'Maintenance'
    },
    {
      name: 'Content Moderation',
      description: 'Automated content review and flagging',
      category: 'Content'
    },
    {
      name: 'Performance Monitoring',
      description: 'System health checks and alerting',
      category: 'Monitoring'
    },
    {
      name: 'User Engagement Analysis',
      description: 'Analyze user interactions and generate insights',
      category: 'Analytics'
    }
  ];

  const getWorkflowStatusIcon = (status: string, success: boolean) => {
    if (status === 'paused') return <Pause className="w-5 h-5 text-yellow-400" />;
    if (success) return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <AlertTriangle className="w-5 h-5 text-red-400" />;
  };

  const getWorkflowStatusColor = (status: string, success: boolean) => {
    if (status === 'paused') return 'bg-yellow-600/20 text-yellow-400';
    if (success) return 'bg-green-600/20 text-green-400';
    return 'bg-red-600/20 text-red-400';
  };

  const getDeploymentStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'deploying': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-600/20 text-green-400';
      case 'deploying': return 'bg-blue-600/20 text-blue-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Workflows & Deployments</h1>
              <p className="text-secondary">Manage automated tasks and deployment pipeline</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </button>
              <button className="btn-secondary">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['workflows', 'deployments'].map((tab) => (
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

          {activeTab === 'workflows' && (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getWorkflowStatusIcon(workflow.status, workflow.success)}
                      <div>
                        <h3 className="font-semibold text-primary">{workflow.name}</h3>
                        <p className="text-secondary text-sm">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getWorkflowStatusColor(workflow.status, workflow.success)}`}>
                        {workflow.status === 'paused' ? 'Paused' : workflow.success ? 'Success' : 'Failed'}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Schedule</p>
                      <p className="text-primary font-mono">{workflow.schedule}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Last Run</p>
                      <p className="text-primary">{workflow.lastRun}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Next Run</p>
                      <p className="text-primary">{workflow.nextRun || 'Not scheduled'}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Duration</p>
                      <p className="text-primary">{workflow.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getDeploymentStatusIcon(deployment.status)}
                      <div>
                        <h3 className="font-semibold text-primary">{deployment.environment}</h3>
                        <p className="text-secondary text-sm">Branch: {deployment.branch} • Commit: {deployment.commit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getDeploymentStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Globe className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <GitBranch className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Environment</p>
                      <p className="text-primary">{deployment.environment}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Deployed</p>
                      <p className="text-primary">{deployment.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Duration</p>
                      <p className="text-primary">{deployment.duration}</p>
                    </div>
                    <div>
                      <p className="text-secondary">URL</p>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                        {deployment.url}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Workflow Templates</h2>
          
          <div className="grid-professional grid-cols-2">
            {workflowTemplates.map((template, index) => (
              <div key={index} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">{template.name}</h3>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                    {template.category}
                  </span>
                </div>
                <p className="text-secondary text-sm mb-4">{template.description}</p>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
