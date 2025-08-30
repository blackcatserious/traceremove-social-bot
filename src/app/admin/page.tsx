'use client';

import React from 'react';
import { Brain, MessageSquare, BarChart3, Shield, Github, Share2 } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Active Domains', value: '3', icon: Brain },
  { label: 'AI Conversations', value: '1,247', icon: MessageSquare },
  { label: 'Social Posts', value: '89', icon: Share2 },
  { label: 'GitHub Updates', value: '23', icon: Github }
];

const quickActions = [
  { title: 'Reindex RAG', href: '/admin/reindex', icon: Brain, description: 'Update AI knowledge base' },
  { title: 'Domain Analytics', href: '/admin/analytics', icon: BarChart3, description: 'View performance metrics' },
  { title: 'Security Settings', href: '/admin/security', icon: Shield, description: 'Manage access control' },
  { title: 'Content Management', href: '/admin/content', icon: MessageSquare, description: 'Manage Notion content' }
];

export default function AdminDashboard() {
  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Management Center</h1>
          <p className="text-secondary">Control your AI-powered domain ecosystem</p>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="card-professional"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
          <div className="grid-professional grid-cols-4">
            {quickActions.map((action, index) => (
              <div
                key={action.title}
              >
                <Link
                  href={action.href}
                  className="block card-professional hover:border-blue-500/50 transition-all duration-300"
                >
                  <action.icon className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">{action.title}</h3>
                  <p className="text-secondary text-sm">{action.description}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card-professional">
          <h2 className="text-2xl font-bold text-primary mb-6">Domain Status</h2>
          <div className="grid-professional grid-cols-3">
            {[
              { domain: 'traceremove.dev', persona: 'Digital Arthur Ziganshine', status: 'Active', color: 'green' },
              { domain: 'traceremove.com', persona: 'Digital Arthur Ziganshine (ORM)', status: 'Active', color: 'green' },
              { domain: 'traceremove.io', persona: 'Digital Arthur Ziganshine (ORM)', status: 'Active', color: 'green' }
            ].map((domain, index) => (
              <div key={domain.domain} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-primary">{domain.domain}</h3>
                  <div className={`w-3 h-3 rounded-full bg-${domain.color}-400`}></div>
                </div>
                <p className="text-secondary text-sm mb-1">{domain.persona}</p>
                <p className="text-gray-500 text-xs">{domain.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
