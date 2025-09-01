'use client';

import React, { useState } from 'react';
import { Download, Upload, Database, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function BackupPage() {
  const [selectedDatabase, setSelectedDatabase] = useState('all');

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

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Backup & Export</h1>
          <p className="text-secondary">Manage database backups and data exports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Create Backup</h2>
              
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

          <div className="lg:col-span-2">
            <div className="card-professional">
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
