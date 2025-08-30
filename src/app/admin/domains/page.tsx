'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Globe, Settings, BarChart3, MessageSquare, ExternalLink } from 'lucide-react';

export default function DomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState('traceremove.dev');

  const domains = [
    {
      id: 'traceremove.dev',
      name: 'traceremove.dev',
      persona: 'Philosophy of Technology',
      language: 'English',
      status: 'Active',
      conversations: 423,
      lastActivity: '2 hours ago',
      description: 'Philosophical exploration of technology and humanity'
    },
    {
      id: 'traceremove.com',
      name: 'traceremove.com',
      persona: 'ORM Assistant (Multi-lang)',
      language: 'EN/ES/FR',
      status: 'Active',
      conversations: 651,
      lastActivity: '15 minutes ago',
      description: 'Online reputation management and brand assistance'
    },
    {
      id: 'traceremove.io',
      name: 'traceremove.io',
      persona: 'ORM Assistant (Russian)',
      language: 'Russian',
      status: 'Active',
      conversations: 173,
      lastActivity: '1 hour ago',
      description: 'Russian language ORM and reputation management'
    }
  ];

  const selectedDomainData = domains.find(d => d.id === selectedDomain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Domain Management</h1>
          <p className="text-gray-400">Manage AI personas and domain configurations</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-card-premium">
              <h2 className="text-xl font-bold text-gradient mb-4">Domains</h2>
              <div className="space-y-3">
                {domains.map((domain) => (
                  <motion.div
                    key={domain.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDomain === domain.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{domain.name}</h3>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <p className="text-gray-400 text-sm">{domain.persona}</p>
                    <p className="text-gray-500 text-xs">{domain.conversations} conversations</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedDomainData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="glass-card-premium">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gradient">
                      {selectedDomainData.name} Configuration
                    </h2>
                    <a
                      href={`https://${selectedDomainData.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit Site
                    </a>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Persona Type</label>
                      <input
                        type="text"
                        value={selectedDomainData.persona}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Languages</label>
                      <input
                        type="text"
                        value={selectedDomainData.language}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={selectedDomainData.description}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        rows={3}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card-premium">
                    <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Conversations</h3>
                    <p className="text-3xl font-bold text-white">{selectedDomainData.conversations}</p>
                    <p className="text-gray-400 text-sm">Total interactions</p>
                  </div>
                  <div className="glass-card-premium">
                    <Globe className="w-8 h-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                    <p className="text-3xl font-bold text-green-400">{selectedDomainData.status}</p>
                    <p className="text-gray-400 text-sm">Domain health</p>
                  </div>
                  <div className="glass-card-premium">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Last Activity</h3>
                    <p className="text-lg font-bold text-white">{selectedDomainData.lastActivity}</p>
                    <p className="text-gray-400 text-sm">Recent interaction</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
