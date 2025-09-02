'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Download, Calendar, Filter, Eye } from 'lucide-react';

export default function AnalyticsReportsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [timeRange, setTimeRange] = useState('7d');

  const analyticsData = [
    { label: 'Total Conversations', value: 1247, change: '+12%', icon: MessageSquare },
    { label: 'Active Users', value: 892, change: '+8%', icon: Users },
    { label: 'Response Rate', value: '97.3%', change: '+2.1%', icon: TrendingUp },
    { label: 'Avg Response Time', value: '1.2s', change: '-0.3s', icon: BarChart3 }
  ];

  const domainPerformance = [
    { domain: 'traceremove.dev', conversations: 423, users: 312, satisfaction: 94 },
    { domain: 'traceremove.com', conversations: 651, users: 445, satisfaction: 91 },
    { domain: 'traceremove.io', conversations: 173, users: 135, satisfaction: 96 }
  ];

  const reports = [
    {
      id: 1,
      name: 'Weekly Performance Report',
      type: 'Performance',
      generated: '2024-09-01 09:00:00',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'User Engagement Analysis',
      type: 'Analytics',
      generated: '2024-08-31 14:30:00',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Monthly AI Model Usage',
      type: 'Usage',
      generated: '2024-08-30 10:15:00',
      status: 'completed',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'Content Performance Review',
      type: 'Content',
      generated: '2024-08-29 16:45:00',
      status: 'generating',
      size: 'Pending'
    }
  ];

  const recentActivity = [
    { action: 'New conversation started', domain: 'traceremove.com', time: '2 minutes ago' },
    { action: 'Report generated', type: 'Weekly Performance', time: '1 hour ago' },
    { action: 'User feedback received', rating: '5 stars', time: '2 hours ago' },
    { action: 'AI model switched', model: 'GPT-4o', time: '3 hours ago' },
    { action: 'Content published', title: 'AI Ethics Guide', time: '4 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600/20 text-green-400';
      case 'generating': return 'bg-blue-600/20 text-blue-400';
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
              <h1 className="text-3xl font-bold text-primary mb-2">Analytics & Reports</h1>
              <p className="text-secondary">Monitor performance and generate insights</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button className="btn-primary">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {analyticsData.map((item, index) => (
            <div key={item.label} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <item.icon className="w-6 h-6 text-blue-400" />
                <span className={`text-sm font-medium ${
                  item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
              <div className="text-secondary text-sm">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['analytics', 'reports', 'insights'].map((tab) => (
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

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Domain Performance</h3>
                <div className="space-y-4">
                  {domainPerformance.map((domain, index) => (
                    <div key={domain.domain} className="bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-primary">{domain.domain}</h4>
                        <span className="text-green-400 text-sm">{domain.satisfaction}% satisfaction</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-secondary">Conversations</p>
                          <p className="text-primary font-semibold">{domain.conversations}</p>
                        </div>
                        <div>
                          <p className="text-secondary">Active Users</p>
                          <p className="text-primary font-semibold">{domain.users}</p>
                        </div>
                        <div>
                          <p className="text-secondary">Satisfaction</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-400 h-2 rounded-full"
                                style={{ width: `${domain.satisfaction}%` }}
                              ></div>
                            </div>
                            <span className="text-primary font-semibold">{domain.satisfaction}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-primary text-sm">{activity.action}</p>
                        <p className="text-secondary text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-primary">{report.name}</h3>
                      <p className="text-secondary text-sm">{report.type} Report</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      {report.status === 'completed' && (
                        <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Generated</p>
                      <p className="text-primary">{report.generated}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Type</p>
                      <p className="text-primary">{report.type}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Size</p>
                      <p className="text-primary">{report.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Key Insights</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-400 pl-4">
                    <p className="text-primary font-semibold">Peak Usage Hours</p>
                    <p className="text-secondary text-sm">Most conversations occur between 2-4 PM UTC</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <p className="text-primary font-semibold">Popular Topics</p>
                    <p className="text-secondary text-sm">AI ethics and technology philosophy are trending</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <p className="text-primary font-semibold">User Retention</p>
                    <p className="text-secondary text-sm">78% of users return within 7 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                    <div>
                      <p className="text-primary text-sm">Optimize response times during peak hours</p>
                      <p className="text-secondary text-xs">Consider scaling AI model capacity</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    <div>
                      <p className="text-primary text-sm">Expand content on popular topics</p>
                      <p className="text-secondary text-xs">Create more AI ethics resources</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                    <div>
                      <p className="text-primary text-sm">Implement user engagement campaigns</p>
                      <p className="text-secondary text-xs">Target users who haven't returned in 14+ days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
