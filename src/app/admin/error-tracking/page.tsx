'use client';

import React, { useState } from 'react';
import { AlertTriangle, Bug, TrendingDown, RefreshCw } from 'lucide-react';

export default function ErrorTrackingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Error Tracking</h1>
          <p className="text-secondary">Track and analyze system errors and exceptions</p>
        </div>
      </div>
    </div>
  );
}
