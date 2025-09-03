'use client';

import React, { useState } from 'react';
import { Package, Download, Upload, RefreshCw } from 'lucide-react';

export default function PackageManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Package Management</h1>
          <p className="text-secondary">Manage dependencies and packages</p>
        </div>
      </div>
    </div>
  );
}
