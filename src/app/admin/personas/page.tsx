'use client';

import React, { useState } from 'react';
import { Brain, MessageSquare, Globe, Settings, Edit3, Zap, Code, BarChart3 } from 'lucide-react';

export default function PersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState('philosopher');

  const personas = [
    {
      id: 'philosopher',
      name: 'Digital Arthur Ziganshine',
      domain: 'traceremove.dev',
      language: 'English',
      description: 'Comprehensive digital assistant for philosophy, technology, content creation, and project implementation',
      systemPrompt: 'You are Arthur Ziganshine, a comprehensive digital AI system with deep expertise in philosophy of technology, full-stack development, content creation, project management, and strategic planning. You provide end-to-end solutions from concept to implementation.',
      chatTitle: 'Digital Arthur Ziganshine',
      chatSubtitle: 'Comprehensive AI System',
      capabilities: ['philosophy', 'technology_architecture', 'content_creation', 'project_management', 'development', 'research_analysis', 'strategic_planning', 'automation'],
      integrations: ['notion', 'github', 'social_media', 'development_tools', 'analytics', 'project_management_tools'],
      specializations: ['full_stack_development', 'system_architecture', 'content_strategy', 'workflow_automation', 'ai_ml_systems']
    },
    {
      id: 'orm-multilang',
      name: 'Digital Arthur Ziganshine (ORM)',
      domain: 'traceremove.com',
      language: 'EN/ES/FR',
      description: 'Comprehensive ORM assistant for multi-language brand reputation management and content strategy',
      systemPrompt: 'You are Arthur Ziganshine, a comprehensive digital ORM and brand reputation specialist with expertise in multi-language content creation, crisis management, and comprehensive brand strategy development and implementation.',
      chatTitle: 'Digital Arthur Ziganshine',
      chatSubtitle: 'ORM & Brand Strategy Expert',
      capabilities: ['orm_strategy', 'brand_management', 'content_creation', 'social_media_management', 'crisis_communication', 'analytics_reporting', 'localization'],
      integrations: ['notion', 'social_media_platforms', 'analytics_tools', 'review_platforms', 'email_marketing', 'crm_systems'],
      specializations: ['multi_language_orm', 'international_branding', 'digital_marketing', 'reputation_recovery', 'content_localization']
    },
    {
      id: 'orm-russian',
      name: 'Цифровой Артур Зиганшин',
      domain: 'traceremove.io',
      language: 'Russian',
      description: 'Комплексный ORM-ассистент для управления репутацией бренда и контент-стратегии',
      systemPrompt: 'Вы Артур Зиганшин, комплексная цифровая система управления репутацией с экспертизой в создании контента, кризисных коммуникациях и полной реализации стратегий бренда.',
      chatTitle: 'Цифровой Артур Зиганшин',
      chatSubtitle: 'Эксперт по ORM и стратегии бренда',
      capabilities: ['orm_strategy', 'brand_management', 'content_creation', 'social_media_management', 'crisis_communication', 'analytics_reporting', 'automation'],
      integrations: ['notion', 'social_media_platforms', 'analytics_tools', 'review_platforms', 'email_marketing', 'crm_systems'],
      specializations: ['russian_market_orm', 'local_brand_management', 'russian_content_strategy', 'reputation_recovery', 'digital_marketing_ru']
    }
  ];

  const selectedPersonaData = personas.find(p => p.id === selectedPersona);

  const getCapabilityIcon = (capability: string) => {
    if (capability.includes('development') || capability.includes('code')) return Code;
    if (capability.includes('analytics') || capability.includes('research')) return BarChart3;
    if (capability.includes('content') || capability.includes('strategy')) return MessageSquare;
    return Zap;
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">AI Personas</h1>
          <p className="text-secondary">Manage comprehensive digital Arthur Ziganshine personas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Digital Personas</h2>
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
                    <div className="flex flex-wrap gap-1 mt-2">
                      {persona.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                          {cap.replace('_', ' ')}
                        </span>
                      ))}
                      {persona.capabilities.length > 3 && (
                        <span className="text-xs text-gray-500">+{persona.capabilities.length - 3}</span>
                      )}
                    </div>
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

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Comprehensive Capabilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPersonaData.capabilities.map((capability) => {
                      const IconComponent = getCapabilityIcon(capability);
                      return (
                        <div key={capability} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                          <IconComponent className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-secondary text-sm">{capability.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Integrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPersonaData.integrations.map((integration) => (
                      <div key={integration} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                        <Globe className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-secondary text-sm">{integration.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Specializations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPersonaData.specializations.map((specialization) => (
                      <div key={specialization} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                        <Settings className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-secondary text-sm">{specialization.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Comprehensive Capabilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPersonaData.capabilities.map((capability) => {
                      const IconComponent = getCapabilityIcon(capability);
                      return (
                        <div key={capability} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                          <IconComponent className="w-4 h-4 text-blue-400 mr-2" />
                          <span className="text-secondary text-sm">{capability.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Integrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPersonaData.integrations.map((integration) => (
                      <div key={integration} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                        <Globe className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-secondary text-sm">{integration.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-professional">
                  <h3 className="text-lg font-bold text-primary mb-4">Specializations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPersonaData.specializations.map((specialization) => (
                      <div key={specialization} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                        <Settings className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-secondary text-sm">{specialization.replace('_', ' ')}</span>
                      </div>
                    ))}
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
