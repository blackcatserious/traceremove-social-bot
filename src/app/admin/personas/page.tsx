'use client';

import React, { useState } from 'react';
import { Brain, MessageSquare, Globe, Settings, Edit3 } from 'lucide-react';

export default function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState('philosopher');

  const personas = [
    {
      id: 'philosopher',
      name: 'Philosophy of Technology',
      domain: 'traceremove.dev',
      language: 'English',
      description: 'Explores the intersection of technology and humanity with philosophical depth',
      systemPrompt: 'You are a Philosopher of Technology for traceremove.dev. You respond calmly and thoughtfully...',
      chatTitle: 'Philosophy of Technology',
      chatSubtitle: 'Exploring tech & humanity'
    },
    {
      id: 'orm-multilang',
      name: 'ORM Assistant (Multi-language)',
      domain: 'traceremove.com',
      language: 'EN/ES/FR',
      description: 'Professional ORM and brand reputation management across multiple languages',
      systemPrompt: 'You are an ORM (Online Reputation Management) and Brand Reputation Assistant...',
      chatTitle: 'Reputation Assistant',
      chatSubtitle: 'Brand & ORM expertise'
    },
    {
      id: 'orm-russian',
      name: 'ORM Assistant (Russian)',
      domain: 'traceremove.io',
      language: 'Russian',
      description: 'Russian-language ORM assistant for reputation management',
      systemPrompt: 'Вы ORM-ассистент для Traceremove. Отвечайте по-русски...',
      chatTitle: 'ORM Ассистент',
      chatSubtitle: 'Управление репутацией'
    }
  ];

  const selectedPersonaData = personas.find(p => p.id === selectedPersona);

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">AI Personas</h1>
          <p className="text-secondary">Configure and manage AI personality profiles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Personas</h2>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPersona === persona.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Brain className="w-5 h-5 text-blue-400 mr-2" />
                      <h3 className="font-semibold text-primary">{persona.name}</h3>
                    </div>
                    <p className="text-secondary text-sm">{persona.domain}</p>
                    <p className="text-gray-500 text-xs">{persona.language}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPersonaData && (
              <div className="space-y-6">
                <div className="card-professional">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary">
                      {selectedPersonaData.name} Configuration
                    </h2>
                    <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Chat Title</label>
                      <input
                        type="text"
                        value={selectedPersonaData.chatTitle}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Chat Subtitle</label>
                      <input
                        type="text"
                        value={selectedPersonaData.chatSubtitle}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={selectedPersonaData.description}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        rows={3}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                      <textarea
                        value={selectedPersonaData.systemPrompt}
                        className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                        rows={6}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid-professional grid-cols-3">
                  <div className="card-professional">
                    <Globe className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Domain</h3>
                    <p className="text-lg font-bold text-primary">{selectedPersonaData.domain}</p>
                    <p className="text-secondary text-sm">Target domain</p>
                  </div>
                  <div className="card-professional">
                    <MessageSquare className="w-8 h-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Languages</h3>
                    <p className="text-lg font-bold text-primary">{selectedPersonaData.language}</p>
                    <p className="text-secondary text-sm">Supported languages</p>
                  </div>
                  <div className="card-professional">
                    <Settings className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">Status</h3>
                    <p className="text-lg font-bold status-active">Active</p>
                    <p className="text-secondary text-sm">Persona status</p>
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
