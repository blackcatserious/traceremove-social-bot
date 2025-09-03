'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Play, Pause } from 'lucide-react';

export default function SchedulingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Scheduling</h1>
          <p className="text-secondary">Task scheduling and automation</p>
        </div>
      </div>
    </div>
  );
}
