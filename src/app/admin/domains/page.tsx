'use client';

import React, { useState } from 'react';
import { Brain, Globe, Settings, BarChart3, MessageSquare, ExternalLink } from 'lucide-react';

export default function DomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState('traceremove.dev');

  const domains = [
    {
      id: 'traceremove.dev',
      name: 'traceremove.dev',
      persona: 'Digital Arthur Ziganshine',
      language: 'English',
      status: 'Active',
      conversations: 423,
      lastActivity: '2 hours ago',
      description: 'Philosophical exploration of technology and humanity'
    },
    {
      id: 'traceremove.com',
      name: 'traceremove.com',
      persona: 'Digital Arthur Ziganshine (ORM)',
      language: 'EN/ES/FR',
      status: 'Active',
      conversations: 651,
      lastActivity: '15 minutes ago',
      description: 'Online reputation management and brand assistance'
    },
    {
      id: 'traceremove.io',
      name: 'traceremove.io',
      persona: 'Digital Arthur Ziganshine (ORM)',
      language: 'Russian',
      status: 'Active',
      conversations: 173,
      lastActivity: '1 hour ago',
      description: 'Russian language ORM and reputation management'
    }
  ];

  const selectedDomainData = domains.find(d => d.id === selectedDomain);

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Domain Management</h1>
          <p className="text-secondary">Manage AI personas and domain configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Domains</h2>
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedDomain === domain.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-primary">{domain.name}</h3>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <p className="text-secondary text-sm">{domain.persona}</p>
                    <p className="text-gray-500 text-xs">{domain.conversations} conversations</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedDomainData && (
              <div className="space-y-6">
                <div className="card-professional">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary">
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
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Languages</label>
                      <input
                        type="text"
                        value={selectedDomainData.language}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={selectedDomainData.description}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        rows={3}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid-professional grid-cols-3">
                  <div className="card-professional">
                    <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Conversations</h3>
                    <p className="text-3xl font-bold text-primary">{selectedDomainData.conversations}</p>
                    <p className="text-secondary text-sm">Total interactions</p>
                  </div>
                  <div className="card-professional">
                    <Globe className="w-8 h-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Status</h3>
                    <p className="text-3xl font-bold text-green-400">{selectedDomainData.status}</p>
                    <p className="text-secondary text-sm">Domain health</p>
                  </div>
                  <div className="card-professional">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Last Activity</h3>
                    <p className="text-lg font-bold text-primary">{selectedDomainData.lastActivity}</p>
                    <p className="text-secondary text-sm">Recent interaction</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
