'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">GitHub Integration</h1>
              <p className="text-gray-400">Manage repository connections and webhooks</p>
            </div>
            <button className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center mb-4">
              <Github className="w-8 h-8 text-white mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Webhook Status</h3>
                <p className="text-gray-400 text-sm">Real-time events</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                webhookStatus === 'active' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-white capitalize">{webhookStatus}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center mb-4">
              <GitBranch className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Repositories</h3>
                <p className="text-gray-400 text-sm">Connected repos</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{repositories.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-white">Events Today</h3>
                <p className="text-gray-400 text-sm">Webhook events</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">47</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-6">Connected Repositories</h2>
            <div className="space-y-4">
              {repositories.map((repo, index) => (
                <div key={repo.name} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Github className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="font-semibold text-white">{repo.name}</h3>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      repo.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Last sync: {repo.lastSync}</span>
                    <span>{repo.commits} commits</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
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
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">{activity.repo} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
