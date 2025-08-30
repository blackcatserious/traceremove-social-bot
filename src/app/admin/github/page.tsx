'use client';

import React, { useState } from 'react';
import { Github, GitBranch, GitCommit, GitPullRequest, Settings, Activity } from 'lucide-react';

export default function GitHubPage() {
  const [webhookStatus, setWebhookStatus] = useState('active');

  const repositories = [
    { name: 'traceremove-social-bot', status: 'active', lastSync: '2 minutes ago', commits: 23 },
    { name: 'traceremove-modern', status: 'active', lastSync: '1 hour ago', commits: 45 },
    { name: 'traceremove-docs', status: 'inactive', lastSync: '2 days ago', commits: 12 }
  ];

  const recentActivity = [
    { type: 'push', repo: 'traceremove-social-bot', message: 'feat: add GitHub integration', time: '2 minutes ago' },
    { type: 'pr', repo: 'traceremove-modern', message: 'fix: update navigation component', time: '1 hour ago' },
    { type: 'issue', repo: 'traceremove-social-bot', message: 'bug: webhook timeout issue', time: '3 hours ago' },
    { type: 'commit', repo: 'traceremove-docs', message: 'docs: update API documentation', time: '1 day ago' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">GitHub Integration</h1>
              <p className="text-secondary">Manage repository connections and webhooks</p>
            </div>
            <button className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Github className="w-8 h-8 text-primary mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Webhook Status</h3>
                <p className="text-secondary text-sm">Real-time events</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                webhookStatus === 'active' ? 'status-active' : 'status-inactive'
              }`}></div>
              <span className="text-primary capitalize">{webhookStatus}</span>
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <GitBranch className="w-8 h-8 text-primary mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Repositories</h3>
                <p className="text-secondary text-sm">Connected repos</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">{repositories.length}</div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-primary mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Events Today</h3>
                <p className="text-secondary text-sm">Webhook events</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">47</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Connected Repositories</h2>
            <div className="space-y-4">
              {repositories.map((repo, index) => (
                <div key={repo.name} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Github className="w-5 h-5 text-secondary mr-2" />
                      <h3 className="font-semibold text-primary">{repo.name}</h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      repo.status === 'active' ? 'status-active' : 'status-inactive'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>Last sync: {repo.lastSync}</span>
                    <span>{repo.commits} commits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'push' ? 'bg-blue-600/20' :
                    activity.type === 'pr' ? 'bg-green-600/20' :
                    activity.type === 'issue' ? 'bg-red-600/20' : 'bg-purple-600/20'
                  }`}>
                    {activity.type === 'push' && <GitCommit className="w-4 h-4 text-blue-400" />}
                    {activity.type === 'pr' && <GitPullRequest className="w-4 h-4 text-green-400" />}
                    {activity.type === 'issue' && <Github className="w-4 h-4 text-red-400" />}
                    {activity.type === 'commit' && <GitCommit className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-primary text-sm">{activity.message}</p>
                    <p className="text-secondary text-xs">{activity.repo} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
