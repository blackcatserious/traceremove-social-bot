'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export default function SecurityPage() {
  const [authMethod, setAuthMethod] = useState('token');

  const securityMetrics = [
    { label: 'Security Score', value: '98%', status: 'excellent', icon: Shield },
    { label: 'Active Sessions', value: '3', status: 'normal', icon: Key },
    { label: 'Failed Attempts', value: '0', status: 'good', icon: Lock },
    { label: 'Last Breach', value: 'Never', status: 'excellent', icon: CheckCircle }
  ];

  const accessLogs = [
    { timestamp: '2 minutes ago', user: 'admin@traceremove.net', action: 'Login successful', ip: '192.168.1.100', status: 'success' },
    { timestamp: '1 hour ago', user: 'content@traceremove.net', action: 'Content updated', ip: '192.168.1.101', status: 'success' },
    { timestamp: '3 hours ago', user: 'unknown', action: 'Failed login attempt', ip: '203.0.113.1', status: 'warning' },
    { timestamp: '1 day ago', user: 'admin@traceremove.net', action: 'Security settings changed', ip: '192.168.1.100', status: 'info' }
  ];

  const securitySettings = [
    { name: 'Two-Factor Authentication', enabled: true, description: 'Require 2FA for all admin accounts' },
    { name: 'IP Whitelist', enabled: false, description: 'Restrict access to specific IP addresses' },
    { name: 'Session Timeout', enabled: true, description: 'Auto-logout after 30 minutes of inactivity' },
    { name: 'Audit Logging', enabled: true, description: 'Log all administrative actions' }
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
              <h1 className="text-4xl font-bold text-gradient mb-2">Security & Access</h1>
              <p className="text-gray-400">Manage authentication and security settings</p>
            </div>
            <button className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Security Audit
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {securityMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card-premium"
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${
                  metric.status === 'excellent' ? 'text-green-400' :
                  metric.status === 'good' ? 'text-blue-400' :
                  metric.status === 'normal' ? 'text-yellow-400' : 'text-red-400'
                }`} />
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-400' :
                  metric.status === 'good' ? 'bg-blue-400' :
                  metric.status === 'normal' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-premium"
          >
            <h2 className="text-xl font-bold text-gradient mb-6">Authentication Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Authentication Method</label>
                <select
                  value={authMethod}
                  onChange={(e) => setAuthMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                >
                  <option value="token">Token-based</option>
                  <option value="oauth">OAuth 2.0</option>
                  <option value="saml">SAML</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Token</label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value="••••••••••••••••"
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    readOnly
                  />
                  <button className="btn-premium px-4 py-2 rounded-lg transition-colors">
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-premium"
          >
            <h2 className="text-xl font-bold text-gradient mb-6">Security Features</h2>
            <div className="space-y-4">
              {securitySettings.map((setting, index) => (
                <div key={setting.name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{setting.name}</h3>
                    <p className="text-gray-400 text-sm">{setting.description}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    setting.enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-premium"
        >
          <h2 className="text-xl font-bold text-gradient mb-6">Access Logs</h2>
          <div className="space-y-4">
            {accessLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    log.status === 'success' ? 'bg-green-400' :
                    log.status === 'warning' ? 'bg-yellow-400' :
                    log.status === 'info' ? 'bg-blue-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium">{log.action}</p>
                    <p className="text-gray-400 text-sm">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
