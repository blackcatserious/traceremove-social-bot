'use client';

import React, { useState } from 'react';
import { Database, FileText, RefreshCw, Plus, Edit3, Trash2 } from 'lucide-react';

export default function ContentPage() {
  const [selectedDatabase, setSelectedDatabase] = useState('dev');

  const databases = [
    { id: 'dev', name: 'Philosophy DB', domain: 'traceremove.dev', entries: 45 },
    { id: 'com', name: 'ORM Multi-lang DB', domain: 'traceremove.com', entries: 78 },
    { id: 'io', name: 'ORM Russian DB', domain: 'traceremove.io', entries: 32 }
  ];

  const contentEntries = [
    { id: 1, title: 'AI Ethics in Modern Society', type: 'Article', status: 'Published', updated: '2 hours ago' },
    { id: 2, title: 'Technology and Human Dignity', type: 'Essay', status: 'Draft', updated: '1 day ago' },
    { id: 3, title: 'Digital Rights Framework', type: 'Research', status: 'Review', updated: '3 days ago' },
    { id: 4, title: 'Philosophy of Machine Learning', type: 'Article', status: 'Published', updated: '1 week ago' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Content Management</h1>
              <p className="text-secondary">Manage Notion databases and RAG content</p>
            </div>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Databases</h2>
              <div className="space-y-3">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    onClick={() => setSelectedDatabase(db.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDatabase === db.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Database className="w-5 h-5 text-blue-400 mr-2" />
                      <h3 className="font-semibold text-primary">{db.name}</h3>
                    </div>
                    <p className="text-secondary text-sm">{db.domain}</p>
                    <p className="text-gray-500 text-xs">{db.entries} entries</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reindex All
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card-professional">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">
                  {databases.find(db => db.id === selectedDatabase)?.name} Content
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {contentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="w-5 h-5 text-secondary mr-2" />
                          <h3 className="font-semibold text-primary">{entry.title}</h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                            entry.status === 'Published' ? 'bg-green-600/20 text-green-400' :
                            entry.status === 'Draft' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-secondary">
                          <span className="mr-4">{entry.type}</span>
                          <span>Updated {entry.updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-secondary hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
                <h3 className="text-lg font-semibold text-primary mb-2">RAG Status</h3>
                <div className="grid-professional grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">156</p>
                    <p className="text-secondary text-sm">Indexed Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">2.3k</p>
                    <p className="text-secondary text-sm">Vector Embeddings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">98%</p>
                    <p className="text-secondary text-sm">Index Health</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
