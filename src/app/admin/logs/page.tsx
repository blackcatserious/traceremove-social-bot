'use client';

import React, { useState } from 'react';
import { FileText, Filter, Download, Search, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function LogsPage() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const logLevels = ['all', 'error', 'warning', 'info', 'debug'];
  const services = ['all', 'api', 'etl', 'chat', 'auth', 'database'];

  const logs = [
    {
      timestamp: '2024-09-01 22:10:45',
      level: 'error',
      service: 'api',
      message: 'OpenAI API rate limit exceeded for search endpoint',
      details: 'Request failed with status 429. Retrying in 60 seconds.',
      requestId: 'req_abc123'
    },
    {
      timestamp: '2024-09-01 22:09:32',
      level: 'info',
      service: 'etl',
      message: 'Notion database sync completed successfully',
      details: 'Processed 45 records from Registry database. 3 new, 2 updated.',
      requestId: 'etl_def456'
    },
    {
      timestamp: '2024-09-01 22:08:15',
      level: 'warning',
      service: 'chat',
      message: 'High response time detected for chat completion',
      details: 'Response took 3.2s, exceeding threshold of 2s. Model: gpt-4o-mini',
      requestId: 'chat_ghi789'
    },
    {
      timestamp: '2024-09-01 22:07:03',
      level: 'info',
      service: 'database',
      message: 'PostgreSQL connection pool optimized',
      details: 'Adjusted pool size to 20 connections. Current active: 12',
      requestId: 'db_jkl012'
    },
    {
      timestamp: '2024-09-01 22:05:48',
      level: 'debug',
      service: 'auth',
      message: 'Admin token validation successful',
      details: 'Token validated for /api/admin/reindex endpoint',
      requestId: 'auth_mno345'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const levelMatch = selectedLevel === 'all' || log.level === selectedLevel;
    const serviceMatch = selectedService === 'all' || log.service === selectedService;
    const searchMatch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    return levelMatch && serviceMatch && searchMatch;
  });

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'debug': return <CheckCircle className="w-5 h-5 text-gray-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-l-red-400 bg-red-600/10';
      case 'warning': return 'border-l-yellow-400 bg-yellow-600/10';
      case 'info': return 'border-l-blue-400 bg-blue-600/10';
      case 'debug': return 'border-l-gray-400 bg-gray-600/10';
      default: return 'border-l-gray-400 bg-gray-600/10';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Logs Management</h1>
              <p className="text-secondary">Monitor system logs and troubleshoot issues</p>
            </div>
            <button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </button>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-secondary" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-secondary" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                {logLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                {services.map(service => (
                  <option key={service} value={service}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-secondary mb-4">
            Showing {filteredLogs.length} of {logs.length} log entries
          </div>
        </div>

        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`card-professional border-l-4 ${getLogColor(log.level)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-primary font-semibold">{log.timestamp}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-600/20 text-red-400' :
                        log.level === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
                        log.level === 'info' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">
                        {log.service}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{log.requestId}</span>
                  </div>
                  <p className="text-primary mb-2">{log.message}</p>
                  <p className="text-secondary text-sm">{log.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="card-professional text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-secondary">No logs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
