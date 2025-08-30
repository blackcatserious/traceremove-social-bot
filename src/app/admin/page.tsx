'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, BarChart3, Shield, Github, Share2 } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Active Domains', value: '3', icon: Brain, color: 'from-blue-600 to-blue-700' },
  { label: 'AI Conversations', value: '1,247', icon: MessageSquare, color: 'from-green-600 to-green-700' },
  { label: 'Social Posts', value: '89', icon: Share2, color: 'from-purple-600 to-purple-700' },
  { label: 'GitHub Updates', value: '23', icon: Github, color: 'from-orange-600 to-orange-700' }
];

const quickActions = [
  { title: 'Reindex RAG', href: '/admin/reindex', icon: Brain, description: 'Update AI knowledge base' },
  { title: 'Domain Analytics', href: '/admin/analytics', icon: BarChart3, description: 'View performance metrics' },
  { title: 'Security Settings', href: '/admin/security', icon: Shield, description: 'Manage access control' },
  { title: 'Content Management', href: '/admin/content', icon: MessageSquare, description: 'Manage Notion content' }
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Management Center</h1>
          <p className="text-gray-400">Control your AI-powered domain ecosystem</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Link
                  href={action.href}
                  className="block glass-card-premium hover:border-blue-500/50 transition-all duration-300"
                >
                  <action.icon className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card-premium"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Domain Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { domain: 'traceremove.dev', persona: 'Philosophy of Technology', status: 'Active', color: 'green' },
              { domain: 'traceremove.com', persona: 'ORM Assistant (Multi-lang)', status: 'Active', color: 'green' },
              { domain: 'traceremove.io', persona: 'ORM Assistant (Russian)', status: 'Active', color: 'green' }
            ].map((domain, index) => (
              <div key={domain.domain} className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{domain.domain}</h3>
                  <div className={`w-3 h-3 rounded-full bg-${domain.color}-400`}></div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{domain.persona}</p>
                <p className="text-gray-500 text-xs">{domain.status}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
