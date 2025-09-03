'use client';

import React, { useState } from 'react';
import { FileText, Calendar, Send, Edit3, Eye, Trash2, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ContentPublishingPage() {
  const [activeTab, setActiveTab] = useState('content');

  const contentItems = [
    {
      id: 1,
      title: 'AI Ethics in Modern Technology',
      type: 'Article',
      status: 'published',
      author: 'Arthur Ziganshine',
      publishDate: '2024-09-01',
      views: 1234,
      engagement: 89
    },
    {
      id: 2,
      title: 'Digital Reputation Management Guide',
      type: 'Guide',
      status: 'draft',
      author: 'Arthur Ziganshine',
      publishDate: null,
      views: 0,
      engagement: 0
    },
    {
      id: 3,
      title: 'Weekly Tech Philosophy Newsletter',
      type: 'Newsletter',
      status: 'scheduled',
      author: 'Arthur Ziganshine',
      publishDate: '2024-09-05',
      views: 0,
      engagement: 0
    }
  ];

  const upcomingContent = [
    {
      id: 1,
      title: 'Q4 Brand Strategy Review',
      type: 'Report',
      scheduledDate: '2024-09-15',
      platform: 'Website',
      status: 'pending'
    },
    {
      id: 2,
      title: 'AI Model Performance Analysis',
      type: 'Analysis',
      scheduledDate: '2024-09-10',
      platform: 'Blog',
      status: 'ready'
    },
    {
      id: 3,
      title: 'Social Media Campaign Launch',
      type: 'Campaign',
      scheduledDate: '2024-09-08',
      platform: 'Multiple',
      status: 'in_review'
    }
  ];

  const publishingStats = [
    { label: 'Total Content', value: 156, change: '+12%' },
    { label: 'Published This Month', value: 23, change: '+8%' },
    { label: 'Scheduled Posts', value: 7, change: '+2%' },
    { label: 'Draft Articles', value: 14, change: '-3%' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'draft': return <Edit3 className="w-5 h-5 text-yellow-400" />;
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'in_review': return <Eye className="w-5 h-5 text-blue-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600/20 text-green-400';
      case 'scheduled': return 'bg-blue-600/20 text-blue-400';
      case 'draft': return 'bg-yellow-600/20 text-yellow-400';
      case 'ready': return 'bg-green-600/20 text-green-400';
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'in_review': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Content & Publishing</h1>
              <p className="text-secondary">Manage content creation and publishing pipeline</p>
            </div>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </button>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {publishingStats.map((stat, index) => (
            <div key={stat.label} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['content', 'upcoming', 'analytics'].map((tab) => (
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

          {activeTab === 'content' && (
            <div className="space-y-4">
              {contentItems.map((item) => (
                <div key={item.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-primary">{item.title}</h3>
                        <p className="text-secondary text-sm">{item.type} • By {item.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
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
                      <p className="text-secondary">Status</p>
                      <p className="text-primary capitalize">{item.status}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Publish Date</p>
                      <p className="text-primary">{item.publishDate || 'Not scheduled'}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Views</p>
                      <p className="text-primary">{item.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Engagement</p>
                      <p className="text-primary">{item.engagement}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingContent.map((item) => (
                <div key={item.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-primary">{item.title}</h3>
                        <p className="text-secondary text-sm">{item.type} • {item.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-secondary hover:text-green-400 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-secondary">Scheduled Date</p>
                      <p className="text-primary">{item.scheduledDate}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Platform</p>
                      <p className="text-primary">{item.platform}</p>
                    </div>
                    <div>
                      <p className="text-secondary">Status</p>
                      <p className="text-primary capitalize">{item.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Content Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total Views</span>
                    <span className="text-primary font-semibold">45,678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Avg. Engagement</span>
                    <span className="text-primary font-semibold">7.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Top Performing Type</span>
                    <span className="text-primary font-semibold">Articles</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Publishing Frequency</span>
                    <span className="text-primary font-semibold">3.2/week</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">Article published</p>
                      <p className="text-secondary text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">Content scheduled</p>
                      <p className="text-secondary text-xs">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">Draft created</p>
                      <p className="text-secondary text-xs">6 hours ago</p>
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
