'use client';

import React, { useState } from 'react';
import { Lock, Shield, Key, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export default function SecurityCompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const securityMetrics = [
    { label: 'Security Score', value: '94%', status: 'good', icon: Shield },
    { label: 'Vulnerabilities', value: '2', status: 'warning', icon: AlertTriangle },
    { label: 'Compliance', value: '98%', status: 'good', icon: CheckCircle },
    { label: 'Active Keys', value: '12', status: 'good', icon: Key }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Security & Compliance</h1>
              <p className="text-secondary">Monitor security posture and compliance status</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {securityMetrics.map((metric, index) => (
            <div key={index} className="card-professional">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className="w-6 h-6 text-blue-400" />
                <div className={`w-3 h-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-400' :
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{metric.value}</div>
              <div className="text-secondary text-sm">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
