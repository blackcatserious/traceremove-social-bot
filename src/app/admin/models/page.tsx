'use client';

import React, { useState } from 'react';
import { Cpu, Settings, TrendingUp, Zap, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState('all');

  const providers = ['all', 'openai', 'anthropic', 'google', 'mistral', 'groq'];

  const models = [
    {
      provider: 'openai',
      name: 'GPT-4o-mini',
      type: 'Chat Completion',
      status: 'active',
      usage: '2,847 requests',
      avgResponseTime: '1.2s',
      cost: '$12.45',
      successRate: '99.2%',
      lastUsed: '2 minutes ago'
    },
    {
      provider: 'anthropic',
      name: 'Claude-3.5-Sonnet',
      type: 'Chat Completion',
      status: 'active',
      usage: '1,234 requests',
      avgResponseTime: '1.8s',
      cost: '$23.67',
      successRate: '98.9%',
      lastUsed: '5 minutes ago'
    },
    {
      provider: 'google',
      name: 'Gemini-1.5-Flash',
      type: 'Chat Completion',
      status: 'active',
      usage: '856 requests',
      avgResponseTime: '0.9s',
      cost: '$8.92',
      successRate: '97.8%',
      lastUsed: '12 minutes ago'
    },
    {
      provider: 'mistral',
      name: 'Mistral-Large',
      type: 'Chat Completion',
      status: 'inactive',
      usage: '234 requests',
      avgResponseTime: '1.5s',
      cost: '$5.23',
      successRate: '96.5%',
      lastUsed: '2 hours ago'
    },
    {
      provider: 'groq',
      name: 'Llama-3.1-70B',
      type: 'Chat Completion',
      status: 'active',
      usage: '1,567 requests',
      avgResponseTime: '0.7s',
      cost: '$4.56',
      successRate: '99.1%',
      lastUsed: '1 minute ago'
    },
    {
      provider: 'openai',
      name: 'text-embedding-3-large',
      type: 'Embeddings',
      status: 'active',
      usage: '5,432 requests',
      avgResponseTime: '0.3s',
      cost: '$18.90',
      successRate: '99.8%',
      lastUsed: '30 seconds ago'
    }
  ];

  const routingRules = [
    {
      id: 1,
      name: 'Quick Q&A',
      condition: 'intent=qa AND length<400',
      model: 'GPT-4o-mini',
      provider: 'openai',
      enabled: true
    },
    {
      id: 2,
      name: 'Long Form Content',
      condition: 'intent=long OR length>2000',
      model: 'Claude-3.5-Sonnet',
      provider: 'anthropic',
      enabled: true
    },
    {
      id: 3,
      name: 'Code Generation',
      condition: 'intent=code',
      model: 'Llama-3.1-70B',
      provider: 'groq',
      enabled: true
    },
    {
      id: 4,
      name: 'Analysis Tasks',
      condition: 'intent=analysis',
      model: 'Gemini-1.5-Flash',
      provider: 'google',
      enabled: true
    }
  ];

  const filteredModels = models.filter(model => 
    selectedProvider === 'all' || model.provider === selectedProvider
  );

  const getProviderColor = (provider: string) => {
    const colors = {
      openai: 'bg-green-600/20 text-green-400',
      anthropic: 'bg-orange-600/20 text-orange-400',
      google: 'bg-blue-600/20 text-blue-400',
      mistral: 'bg-purple-600/20 text-purple-400',
      groq: 'bg-red-600/20 text-red-400'
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-600/20 text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? 
      <CheckCircle className="w-5 h-5 text-green-400" /> : 
      <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 
      'bg-green-600/20 text-green-400' : 
      'bg-yellow-600/20 text-yellow-400';
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Model Management</h1>
          <p className="text-secondary">Configure and monitor AI model performance</p>
        </div>

        <div className="card-professional mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-secondary" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
              >
                {providers.map(provider => (
                  <option key={provider} value={provider}>
                    {provider === 'all' ? 'All Providers' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredModels.map((model, index) => (
              <div key={index} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(model.status)}
                    <div>
                      <h3 className="font-semibold text-primary">{model.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </span>
                        <span className="text-secondary text-sm">{model.type}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-secondary">Usage</p>
                    <p className="text-primary font-semibold">{model.usage}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Avg Response</p>
                    <p className="text-primary font-semibold">{model.avgResponseTime}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Cost</p>
                    <p className="text-primary font-semibold">{model.cost}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Success Rate</p>
                    <p className="text-primary font-semibold">{model.successRate}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Last Used</p>
                    <p className="text-primary font-semibold">{model.lastUsed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Performance Metrics</h2>
            <div className="grid-professional grid-cols-2">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">6,890</p>
                <p className="text-secondary text-sm">Total Requests</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">1.1s</p>
                <p className="text-secondary text-sm">Avg Response</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">98.7%</p>
                <p className="text-secondary text-sm">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">$73.73</p>
                <p className="text-secondary text-sm">Total Cost</p>
              </div>
            </div>
          </div>

          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Routing Rules</h2>
            <div className="space-y-4">
              {routingRules.map((rule) => (
                <div key={rule.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary">{rule.name}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={rule.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-secondary text-sm mb-2 font-mono">{rule.condition}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getProviderColor(rule.provider)}`}>
                      {rule.provider}
                    </span>
                    <span className="text-primary text-sm">{rule.model}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
