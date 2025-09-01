'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Settings, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('recent');

  const notifications = [
    {
      id: 1,
      type: 'error',
      title: 'API Rate Limit Exceeded',
      message: 'OpenAI API rate limit reached for search endpoint. Service temporarily degraded.',
      timestamp: '2 minutes ago',
      read: false,
      channel: 'system'
    },
    {
      id: 2,
      type: 'success',
      title: 'ETL Sync Completed',
      message: 'Daily Notion database sync completed successfully. 45 records processed.',
      timestamp: '1 hour ago',
      read: true,
      channel: 'etl'
    },
    {
      id: 3,
      type: 'warning',
      title: 'High Memory Usage',
      message: 'System memory usage at 85%. Consider scaling resources.',
      timestamp: '3 hours ago',
      read: false,
      channel: 'monitoring'
    },
    {
      id: 4,
      type: 'info',
      title: 'New User Registration',
      message: 'New user registered for traceremove.com domain.',
      timestamp: '5 hours ago',
      read: true,
      channel: 'user'
    }
  ];

  const notificationChannels = [
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Receive notifications via email',
      enabled: true,
      icon: Mail
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Send alerts to Slack channels',
      enabled: false,
      icon: MessageSquare
    },
    {
      id: 'webhook',
      name: 'Webhook Notifications',
      description: 'Send notifications to custom webhooks',
      enabled: true,
      icon: Settings
    }
  ];

  const alertRules = [
    {
      id: 1,
      name: 'API Error Rate',
      condition: 'Error rate > 5%',
      severity: 'high',
      enabled: true,
      channels: ['email', 'slack']
    },
    {
      id: 2,
      name: 'Response Time',
      condition: 'Avg response time > 2s',
      severity: 'medium',
      enabled: true,
      channels: ['email']
    },
    {
      id: 3,
      name: 'Database Connection',
      condition: 'DB connection failed',
      severity: 'critical',
      enabled: true,
      channels: ['email', 'slack', 'webhook']
    },
    {
      id: 4,
      name: 'ETL Failure',
      condition: 'ETL sync failed',
      severity: 'medium',
      enabled: false,
      channels: ['email']
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-400 bg-red-600/10';
      case 'warning': return 'border-l-yellow-400 bg-yellow-600/10';
      case 'success': return 'border-l-green-400 bg-green-600/10';
      case 'info': return 'border-l-blue-400 bg-blue-600/10';
      default: return 'border-l-gray-400 bg-gray-600/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/20 text-red-400';
      case 'high': return 'bg-orange-600/20 text-orange-400';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400';
      case 'low': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Notifications Center</h1>
          <p className="text-secondary">Manage alerts and notification preferences</p>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['recent', 'channels', 'rules'].map((tab) => (
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

          {activeTab === 'recent' && (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-xl p-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'ring-1 ring-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-primary">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-secondary text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{notification.timestamp}</span>
                          <span>#{notification.channel}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              {notificationChannels.map((channel) => (
                <div key={channel.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <channel.icon className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-primary">{channel.name}</h3>
                        <p className="text-secondary text-sm">{channel.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={channel.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-primary">{rule.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(rule.severity)}`}>
                        {rule.severity}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={rule.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-secondary text-sm mb-3">{rule.condition}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Channels:</span>
                    {rule.channels.map((channel, index) => (
                      <span key={channel} className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded text-xs">
                        {channel}
                      </span>
                    ))}
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
