'use client';

import React, { useState } from 'react';
import { BarChart, Download, Calendar, TrendingUp, Users, MessageSquare, Database, Clock } from 'lucide-react';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedReport, setSelectedReport] = useState('usage');

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const reportTypes = [
    { value: 'usage', label: 'Usage Analytics', icon: BarChart },
    { value: 'performance', label: 'Performance Metrics', icon: TrendingUp },
    { value: 'users', label: 'User Activity', icon: Users },
    { value: 'content', label: 'Content Analytics', icon: Database }
  ];

  const usageMetrics = [
    { label: 'Total API Calls', value: '12,847', change: '+15.3%', trend: 'up' },
    { label: 'Chat Conversations', value: '3,421', change: '+8.7%', trend: 'up' },
    { label: 'Search Queries', value: '8,956', change: '+12.1%', trend: 'up' },
    { label: 'ETL Operations', value: '168', change: '+2.4%', trend: 'up' }
  ];

  const performanceMetrics = [
    { label: 'Avg Response Time', value: '245ms', change: '-12.5%', trend: 'down' },
    { label: 'Error Rate', value: '0.2%', change: '-45.2%', trend: 'down' },
    { label: 'Uptime', value: '99.8%', change: '+0.1%', trend: 'up' },
    { label: 'Cache Hit Rate', value: '89.3%', change: '+5.7%', trend: 'up' }
  ];

  const domainBreakdown = [
    { domain: 'traceremove.dev', requests: 4521, users: 312, satisfaction: 4.8 },
    { domain: 'traceremove.com', requests: 6834, users: 487, satisfaction: 4.7 },
    { domain: 'traceremove.io', requests: 1492, users: 93, satisfaction: 4.9 }
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Weekly Performance Summary',
      schedule: 'Every Monday at 9:00 AM',
      recipients: ['admin@traceremove.net'],
      lastSent: '2024-08-26 09:00:00',
      status: 'active'
    },
    {
      id: 2,
      name: 'Monthly Usage Report',
      schedule: 'First day of month at 8:00 AM',
      recipients: ['admin@traceremove.net', 'analytics@traceremove.net'],
      lastSent: '2024-09-01 08:00:00',
      status: 'active'
    },
    {
      id: 3,
      name: 'Daily Error Summary',
      schedule: 'Every day at 6:00 AM',
      recipients: ['dev@traceremove.net'],
      lastSent: '2024-09-01 06:00:00',
      status: 'paused'
    }
  ];

  const getCurrentMetrics = () => {
    switch (selectedReport) {
      case 'performance': return performanceMetrics;
      case 'usage':
      default: return usageMetrics;
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Reports Dashboard</h1>
              <p className="text-secondary">Generate and analyze system reports</p>
            </div>
            <button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-secondary" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-secondary" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-professional grid-cols-4">
            {getCurrentMetrics().map((metric, index) => (
              <div key={metric.label} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-primary">{metric.value}</div>
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-secondary text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Domain Breakdown</h2>
            <div className="space-y-4">
              {domainBreakdown.map((domain, index) => (
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
                      <p className="text-secondary text-sm">Requests</p>
                      <p className="text-primary font-semibold">{domain.requests.toLocaleString()}</p>
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
            <h2 className="text-xl font-bold text-primary mb-6">Top Insights</h2>
            <div className="space-y-4">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-primary">Peak Usage Hours</h3>
                </div>
                <p className="text-secondary text-sm">
                  Highest activity between 2-4 PM UTC, with 40% of daily requests.
                </p>
              </div>

              <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-primary">Chat Performance</h3>
                </div>
                <p className="text-secondary text-sm">
                  Average response time improved by 15% with new model routing.
                </p>
              </div>

              <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-primary">Content Growth</h3>
                </div>
                <p className="text-secondary text-sm">
                  Vector database grew by 12% with 156 new documents indexed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Scheduled Reports</h2>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">{report.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary">Schedule</p>
                    <p className="text-primary">{report.schedule}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Recipients</p>
                    <p className="text-primary">{report.recipients.length} recipient(s)</p>
                  </div>
                  <div>
                    <p className="text-secondary">Last Sent</p>
                    <p className="text-primary">{report.lastSent}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
