'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, Bell, Users } from 'lucide-react';

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Communication</h1>
          <p className="text-secondary">Team communication and messaging</p>
        </div>
      </div>
    </div>
  );
}
