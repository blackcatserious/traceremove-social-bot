'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Content Management</h1>
              <p className="text-gray-400">Manage Notion databases and RAG content</p>
            </div>
            <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">Databases</h2>
              <div className="space-y-3">
                {databases.map((db) => (
                  <motion.div
                    key={db.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDatabase(db.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDatabase === db.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Database className="w-5 h-5 text-blue-400 mr-2" />
                      <h3 className="font-semibold text-white">{db.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{db.domain}</p>
                    <p className="text-gray-500 text-xs">{db.entries} entries</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reindex All
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
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
                  <motion.div
                    key={entry.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <h3 className="font-semibold text-white">{entry.title}</h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                            entry.status === 'Published' ? 'bg-green-600/20 text-green-400' :
                            entry.status === 'Draft' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-blue-600/20 text-blue-400'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="mr-4">{entry.type}</span>
                          <span>Updated {entry.updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">RAG Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">156</p>
                    <p className="text-gray-400 text-sm">Indexed Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">2.3k</p>
                    <p className="text-gray-400 text-sm">Vector Embeddings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">98%</p>
                    <p className="text-gray-400 text-sm">Index Health</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
