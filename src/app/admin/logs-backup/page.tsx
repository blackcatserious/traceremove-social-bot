'use client';

import React, { useState } from 'react';
import { Download, Upload, Database, CheckCircle, Clock, AlertTriangle, Search, Filter, FileText, Trash2 } from 'lucide-react';

export default function LogsBackupPage() {
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [logLevel, setLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const databases = [
    { id: 'all', name: 'All Databases', size: '2.4 GB' },
    { id: 'catalog', name: 'Catalog (Registry)', size: '856 MB' },
    { id: 'cases', name: 'Cases', size: '423 MB' },
    { id: 'publishing', name: 'Publishing', size: '678 MB' },
    { id: 'finance', name: 'Finance', size: '234 MB' },
    { id: 'vectors', name: 'Vector Database', size: '1.2 GB' }
  ];

  const backupHistory = [
    {
      id: 1,
      type: 'Full Backup',
      database: 'All Databases',
      timestamp: '2024-09-01 02:00:00',
      size: '2.4 GB',
      status: 'completed',
      duration: '12m 34s'
    },
    {
      id: 2,
      type: 'Incremental',
      database: 'Catalog',
      timestamp: '2024-09-01 14:00:00',
      size: '45 MB',
      status: 'completed',
      duration: '2m 15s'
    },
    {
      id: 3,
      type: 'Vector Backup',
      database: 'Vector Database',
      timestamp: '2024-09-01 08:00:00',
      size: '1.2 GB',
      status: 'completed',
      duration: '8m 42s'
    },
    {
      id: 4,
      type: 'Manual Backup',
      database: 'Publishing',
      timestamp: '2024-08-31 16:30:00',
      size: '678 MB',
      status: 'failed',
      duration: '0m 45s'
    }
  ];

  const logs = [
    {
      id: 1,
      timestamp: '2024-09-01 15:30:45',
      level: 'info',
      service: 'API Gateway',
      message: 'Request processed successfully',
      details: 'GET /api/search - 200ms response time'
    },
    {
      id: 2,
      timestamp: '2024-09-01 15:29:12',
      level: 'warn',
      service: 'Database',
      message: 'Connection pool approaching limit',
      details: '8/10 connections in use'
    },
    {
      id: 3,
      timestamp: '2024-09-01 15:28:33',
      level: 'error',
      service: 'Vector DB',
      message: 'Index update failed',
      details: 'Timeout after 30 seconds'
    },
    {
      id: 4,
      timestamp: '2024-09-01 15:27:55',
      level: 'info',
      service: 'ETL Pipeline',
      message: 'Notion sync completed',
      details: '1,234 records processed'
    }
  ];

  const exportOptions = [
    { id: 'json', name: 'JSON Export', description: 'Export data in JSON format for analysis' },
    { id: 'csv', name: 'CSV Export', description: 'Export tabular data for spreadsheet analysis' },
    { id: 'sql', name: 'SQL Dump', description: 'Complete database dump with schema' },
    { id: 'markdown', name: 'Markdown Export', description: 'Export content as markdown files' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600/20 text-green-400';
      case 'running': return 'bg-blue-600/20 text-blue-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-red-500';
      case 'warn': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Logs & Backup Management</h1>
          <p className="text-secondary">Manage system logs, database backups and data exports</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">System Logs</h2>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-secondary" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-secondary" />
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <button className="flex items-center bg-red-600 hover:bg-red-700 text-primary px-4 py-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Logs
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`card-professional border-l-4 ${getLogColor(log.level)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        log.level === 'error' ? 'bg-red-400' :
                        log.level === 'warn' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-primary font-semibold">{log.service}</h3>
                        <span className="text-secondary text-xs">{log.timestamp}</span>
                      </div>
                      <p className="text-secondary text-sm mb-1">{log.message}</p>
                      <p className="text-gray-400 text-xs">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Create Backup</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select Database
                </label>
                <select
                  value={selectedDatabase}
                  onChange={(e) => setSelectedDatabase(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
                >
                  {databases.map(db => (
                    <option key={db.id} value={db.id}>
                      {db.name} ({db.size})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Backup Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="backupType" value="full" defaultChecked className="mr-2" />
                    <span className="text-primary">Full Backup</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="backupType" value="incremental" className="mr-2" />
                    <span className="text-primary">Incremental</span>
                  </label>
                </div>
              </div>
            </div>

            <button className="w-full btn-primary mb-4">
              <Download className="w-4 h-4 mr-2" />
              Create Backup
            </button>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-primary mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Database className="w-4 h-4 mr-2" />
                  Backup All
                </button>
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <h2 className="text-xl font-bold text-primary mb-6">Backup History</h2>
          
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <h3 className="font-semibold text-primary">{backup.type}</h3>
                      <p className="text-secondary text-sm">{backup.database}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(backup.status)}`}>
                    {backup.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-secondary">Timestamp</p>
                    <p className="text-primary">{backup.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Size</p>
                    <p className="text-primary">{backup.size}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Duration</p>
                    <p className="text-primary">{backup.duration}</p>
                  </div>
                </div>
                
                {backup.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      Download Backup
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-xl font-bold text-primary mb-6">Data Export Options</h2>
          
          <div className="grid-professional grid-cols-2">
            {exportOptions.map((option) => (
              <div key={option.id} className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-primary mb-2">{option.name}</h3>
                <p className="text-secondary text-sm mb-4">{option.description}</p>
                <button className="btn-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
