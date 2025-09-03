'use client';

import React, { useState } from 'react';
import { Bell, Plus, Settings, Mail, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function NotificationsAlertsPage() {
  const [activeTab, setActiveTab] = useState('alerts');

  const alerts = [
    { id: 1, type: 'error', message: 'High memory usage detected', time: '2 min ago', status: 'active' },
    { id: 2, type: 'warning', message: 'API response time elevated', time: '15 min ago', status: 'acknowledged' },
    { id: 3, type: 'info', message: 'Scheduled backup completed', time: '1 hour ago', status: 'resolved' },
    { id: 4, type: 'error', message: 'Database connection timeout', time: '2 hours ago', status: 'resolved' }
  ];

  const channels = [
    { name: 'Email', type: 'email', enabled: true, config: 'admin@traceremove.net' },
    { name: 'Slack', type: 'slack', enabled: true, config: '#alerts' },
    { name: 'Discord', type: 'discord', enabled: false, config: 'Not configured' },
    { name: 'Webhook', type: 'webhook', enabled: true, config: 'https://api.example.com/alerts' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Notifications & Alerts</h1>
              <p className="text-secondary">Manage system alerts and notification channels</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </button>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['alerts', 'channels', 'rules', 'history'].map((tab) => (
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

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.type === 'error' ? 'bg-red-400' :
                        alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                      <div>
                        <p className="text-primary font-medium">{alert.message}</p>
                        <p className="text-secondary text-sm">{alert.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        alert.status === 'active' ? 'bg-red-600/20 text-red-400' :
                        alert.status === 'acknowledged' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      }`}>
                        {alert.status}
                      </span>
                      <button className="btn-secondary text-xs">
                        {alert.status === 'active' ? 'Acknowledge' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              {channels.map((channel, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {channel.type === 'email' && <Mail className="w-5 h-5 text-blue-400" />}
                      {channel.type === 'slack' && <MessageSquare className="w-5 h-5 text-green-400" />}
                      {channel.type === 'discord' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                      {channel.type === 'webhook' && <Bell className="w-5 h-5 text-yellow-400" />}
                      <div>
                        <h4 className="text-primary font-medium">{channel.name}</h4>
                        <p className="text-secondary text-sm">{channel.config}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        channel.enabled ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                      <button className="btn-secondary text-xs">
                        {channel.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
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
