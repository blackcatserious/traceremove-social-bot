'use client';

import React from 'react';
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
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-secondary">Monitor performance across all domains</p>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-6 h-6 text-primary" />
                <span className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'status-active' : 'status-inactive'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="text-secondary text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Domain Performance</h2>
            <div className="space-y-4">
              {domainStats.map((domain, index) => (
                <div key={domain.domain} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-primary">{domain.domain}</h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-primary">{domain.satisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-secondary text-sm">Conversations</p>
                      <p className="text-primary font-semibold">{domain.conversations}</p>
                    </div>
                    <div>
                      <p className="text-secondary text-sm">Users</p>
                      <p className="text-primary font-semibold">{domain.users}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Recent Activity</h2>
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
                    <p className="text-primary text-sm">{activity.event}</p>
                    <p className="text-secondary text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Usage Trends</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-secondary">Chart visualization would be implemented here</p>
              <p className="text-gray-500 text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
