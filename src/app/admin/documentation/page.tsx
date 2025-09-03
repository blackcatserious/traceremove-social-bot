'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, Search, Edit } from 'lucide-react';

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Documentation</h1>
          <p className="text-secondary">System documentation and guides</p>
        </div>
      </div>
    </div>
  );
}
