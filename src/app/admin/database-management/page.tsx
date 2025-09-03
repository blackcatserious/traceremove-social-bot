'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Plus, Trash2, Edit, Search, Download, Upload } from 'lucide-react';

export default function DatabaseManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const databases = [
    { name: 'PostgreSQL Main', status: 'healthy', size: '2.4 GB', connections: 12, queries: 1456 },
    { name: 'Qdrant Vector', status: 'healthy', size: '890 MB', connections: 8, queries: 234 },
    { name: 'Redis Cache', status: 'healthy', size: '156 MB', connections: 24, queries: 5678 },
    { name: 'Notion Sync', status: 'syncing', size: '45 MB', connections: 2, queries: 89 }
  ];

  const tables = [
    { name: 'documents', rows: 12450, size: '1.2 GB', lastUpdated: '2 min ago' },
    { name: 'embeddings', rows: 8930, size: '890 MB', lastUpdated: '5 min ago' },
    { name: 'users', rows: 1234, size: '45 MB', lastUpdated: '1 hour ago' },
    { name: 'sessions', rows: 5678, size: '234 MB', lastUpdated: '30 min ago' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Database Management</h1>
              <p className="text-secondary">Manage databases, tables, and data operations</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Connection
              </button>
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['overview', 'tables', 'queries', 'backups'].map((tab) => (
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

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {databases.map((db, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Database className="w-8 h-8 text-blue-400" />
                      <div className={`w-3 h-3 rounded-full ${
                        db.status === 'healthy' ? 'bg-green-400' :
                        db.status === 'syncing' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">{db.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Size:</span>
                        <span className="text-primary">{db.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Connections:</span>
                        <span className="text-primary">{db.connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Queries/min:</span>
                        <span className="text-primary">{db.queries}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tables..."
                      className="input-professional pl-10"
                    />
                  </div>
                </div>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Table
                </button>
              </div>
              
              <div className="space-y-3">
                {tables.map((table, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-primary font-medium">{table.name}</h4>
                        <div className="flex space-x-6 mt-2 text-sm text-secondary">
                          <span>{table.rows.toLocaleString()} rows</span>
                          <span>{table.size}</span>
                          <span>Updated {table.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-secondary hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
