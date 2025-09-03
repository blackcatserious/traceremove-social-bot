'use client';

import React, { useState } from 'react';
import { HardDrive, Database, Archive, Trash2 } from 'lucide-react';

export default function StorageManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Storage Management</h1>
          <p className="text-secondary">Manage storage systems and data retention</p>
        </div>
      </div>
    </div>
  );
}
