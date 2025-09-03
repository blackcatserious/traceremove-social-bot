'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, RefreshCw, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react';

export default function SystemMonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const systemServices = [
    { name: 'Web Server', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '12ms' },
    { name: 'Cache Layer', status: 'warning', uptime: '98.5%', responseTime: '8ms' },
    { name: 'AI Models', status: 'healthy', uptime: '99.2%', responseTime: '234ms' },
    { name: 'Vector DB', status: 'healthy', uptime: '99.7%', responseTime: '67ms' },
    { name: 'Background Jobs', status: 'degraded', uptime: '95.2%', responseTime: '156ms' }
  ];

  const metrics = [
    { label: 'System Uptime', value: '15d 8h 23m', icon: Clock, status: 'good' },
    { label: 'Active Processes', value: '47', icon: Cpu, status: 'good' },
    { label: 'Error Rate', value: '0.02%', icon: AlertTriangle, status: 'good' },
    { label: 'Health Score', value: '98.5%', icon: CheckCircle, status: 'good' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">System Monitoring</h1>
              <p className="text-secondary">Monitor system health and performance metrics</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setLoading(!loading)}
                className="btn-secondary"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="btn-primary">
                <Monitor className="w-4 h-4 mr-2" />
                Live View
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-6 h-6 text-blue-400" />
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="text-secondary text-sm">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['overview', 'services', 'alerts', 'logs'].map((tab) => (
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

          {activeTab === 'services' && (
            <div className="space-y-4">
              {systemServices.map((service, index) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-400' :
                        service.status === 'warning' ? 'bg-yellow-400' :
                        service.status === 'degraded' ? 'bg-red-400' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <h4 className="text-primary font-medium">{service.name}</h4>
                        <div className="flex space-x-6 mt-1 text-sm text-secondary">
                          <span>Uptime: {service.uptime}</span>
                          <span>Response: {service.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        service.status === 'healthy' ? 'bg-green-600/20 text-green-400' :
                        service.status === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                        service.status === 'degraded' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Resource Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary text-sm">CPU Usage</span>
                      <span className="text-primary font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary text-sm">Memory Usage</span>
                      <span className="text-primary font-semibold">67%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-secondary text-sm">Disk Usage</span>
                      <span className="text-primary font-semibold">34%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Network Activity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Inbound Traffic</span>
                    <span className="text-primary">2.4 MB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Outbound Traffic</span>
                    <span className="text-primary">1.8 MB/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Active Connections</span>
                    <span className="text-primary">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Requests/min</span>
                    <span className="text-primary">1,234</span>
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
