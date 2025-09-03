'use client';

import React, { useState } from 'react';
import { Layers, Network, Shield, BarChart3 } from 'lucide-react';

export default function ServiceMeshPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Service Mesh</h1>
          <p className="text-secondary">Manage service mesh configuration and traffic</p>
        </div>
      </div>
    </div>
  );
}
