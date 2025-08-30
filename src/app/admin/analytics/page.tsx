'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, MessageSquare, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Total Conversations', value: '1,247', change: '+12%', icon: MessageSquare, color: 'blue' },
    { label: 'Active Users', value: '892', change: '+8%', icon: Users, color: 'green' },
    { label: 'Response Rate', value: '98.5%', change: '+2%', icon: TrendingUp, color: 'purple' },
    { label: 'Avg Response Time', value: '1.2s', change: '-15%', icon: Activity, color: 'orange' }
  ];

  const domainStats = [
    { domain: 'traceremove.dev', conversations: 423, users: 312, satisfaction: 4.8 },
    { domain: 'traceremove.com', conversations: 651, users: 487, satisfaction: 4.7 },
    { domain: 'traceremove.io', conversations: 173, users: 93, satisfaction: 4.9 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Monitor performance across all domains</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 text-${metric.color}-400`} />
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-premium"
          >
            <h2 className="text-xl font-bold text-gradient mb-6">Domain Performance</h2>
            <div className="space-y-4">
              {domainStats.map((domain, index) => (
                <div key={domain.domain} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{domain.domain}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-white">{domain.satisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Conversations</p>
                      <p className="text-white font-semibold">{domain.conversations}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Users</p>
                      <p className="text-white font-semibold">{domain.users}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-premium"
          >
            <h2 className="text-xl font-bold text-gradient mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { time: '2 minutes ago', event: 'New conversation on traceremove.com', type: 'chat' },
                { time: '15 minutes ago', event: 'RAG reindex completed for traceremove.dev', type: 'system' },
                { time: '1 hour ago', event: 'GitHub webhook received', type: 'integration' },
                { time: '2 hours ago', event: 'Social media post published', type: 'social' },
                { time: '3 hours ago', event: 'New user registered', type: 'user' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'chat' ? 'bg-blue-400' :
                    activity.type === 'system' ? 'bg-green-400' :
                    activity.type === 'integration' ? 'bg-purple-400' :
                    activity.type === 'social' ? 'bg-orange-400' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.event}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-premium"
        >
          <h2 className="text-xl font-bold text-gradient mb-6">Usage Trends</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Chart visualization would be implemented here</p>
              <p className="text-gray-500 text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
