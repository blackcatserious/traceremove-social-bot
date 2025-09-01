'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function MonitoringPage() {
  const [systemMetrics, setSystemMetrics] = useState({
    apiResponseTime: '245ms',
    uptime: '99.8%',
    activeConnections: 127,
    errorRate: '0.2%',
    memoryUsage: '68%',
    cpuUsage: '34%'
  });

  const services = [
    { name: 'API Gateway', status: 'healthy', responseTime: '120ms', uptime: '99.9%' },
    { name: 'PostgreSQL', status: 'healthy', responseTime: '45ms', uptime: '99.8%' },
    { name: 'Vector Database', status: 'healthy', responseTime: '89ms', uptime: '99.7%' },
    { name: 'Notion API', status: 'warning', responseTime: '340ms', uptime: '98.5%' },
    { name: 'OpenAI API', status: 'healthy', responseTime: '1.2s', uptime: '99.2%' },
    { name: 'S3 Storage', status: 'healthy', responseTime: '156ms', uptime: '99.9%' }
  ];

  const recentAlerts = [
    { time: '2 minutes ago', message: 'High response time detected on Notion API', severity: 'warning' },
    { time: '15 minutes ago', message: 'Vector database reindex completed successfully', severity: 'info' },
    { time: '1 hour ago', message: 'Memory usage spike resolved', severity: 'resolved' },
    { time: '3 hours ago', message: 'Scheduled backup completed', severity: 'info' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">System Monitoring</h1>
          <p className="text-secondary">Real-time system metrics and service health</p>
        </div>

        <div className="grid-professional grid-cols-3 mb-8">
          <div className="card-professional">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-sm font-medium status-active">Healthy</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{systemMetrics.apiResponseTime}</div>
            <div className="text-secondary text-sm">Avg Response Time</div>
          </div>

          <div className="card-professional">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">{systemMetrics.uptime}</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{systemMetrics.activeConnections}</div>
            <div className="text-secondary text-sm">Active Connections</div>
          </div>

          <div className="card-professional">
            <div className="flex items-center justify-between mb-4">
              <Server className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-medium text-green-400">{systemMetrics.errorRate}</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{systemMetrics.memoryUsage}</div>
            <div className="text-secondary text-sm">Memory Usage</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Service Health</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.name} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {service.status === 'healthy' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                      ) : service.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                      )}
                      <h3 className="font-semibold text-primary">{service.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service.status === 'healthy' ? 'bg-green-600/20 text-green-400' :
                      service.status === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-secondary text-sm">Response Time</p>
                      <p className="text-primary font-semibold">{service.responseTime}</p>
                    </div>
                    <div>
                      <p className="text-secondary text-sm">Uptime</p>
                      <p className="text-primary font-semibold">{service.uptime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.severity === 'warning' ? 'bg-yellow-400' :
                    alert.severity === 'info' ? 'bg-blue-400' :
                    alert.severity === 'resolved' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-primary text-sm">{alert.message}</p>
                    <p className="text-secondary text-xs">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Performance Metrics</h2>
          <div className="grid-professional grid-cols-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-primary mb-1">2.3k</p>
              <p className="text-secondary text-sm">DB Queries/min</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-primary mb-1">156</p>
              <p className="text-secondary text-sm">API Calls/min</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-primary mb-1">89%</p>
              <p className="text-secondary text-sm">Cache Hit Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-primary mb-1">1.2s</p>
              <p className="text-secondary text-sm">Avg Processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
