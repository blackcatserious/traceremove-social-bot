'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

export default function GoalTrackingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Goal Tracking</h1>
          <p className="text-secondary">Track goals and performance metrics</p>
        </div>
      </div>
    </div>
  );
}
