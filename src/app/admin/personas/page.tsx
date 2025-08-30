'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">AI Personas</h1>
          <p className="text-gray-400">Configure and manage AI personality profiles</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">Personas</h2>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <motion.div
                    key={persona.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPersona === persona.id
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Brain className="w-5 h-5 text-blue-400 mr-2" />
                      <h3 className="font-semibold text-white">{persona.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{persona.domain}</p>
                    <p className="text-gray-500 text-xs">{persona.language}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPersonaData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
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
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Chat Subtitle</label>
                      <input
                        type="text"
                        value={selectedPersonaData.chatSubtitle}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={selectedPersonaData.description}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        rows={3}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                      <textarea
                        value={selectedPersonaData.systemPrompt}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                        rows={6}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <Globe className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Domain</h3>
                    <p className="text-lg font-bold text-white">{selectedPersonaData.domain}</p>
                    <p className="text-gray-400 text-sm">Target domain</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <MessageSquare className="w-8 h-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Languages</h3>
                    <p className="text-lg font-bold text-white">{selectedPersonaData.language}</p>
                    <p className="text-gray-400 text-sm">Supported languages</p>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <Settings className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                    <p className="text-lg font-bold text-green-400">Active</p>
                    <p className="text-gray-400 text-sm">Persona status</p>
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
