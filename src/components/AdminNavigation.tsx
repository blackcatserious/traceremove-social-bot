'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Globe, 
  Brain, 
  BarChart3, 
  FileText, 
  Github, 
  Share2, 
  Users, 
  Shield, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/domains', label: 'Domain Management', icon: Globe },
  { href: '/admin/personas', label: 'AI Personas', icon: Brain },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content Management', icon: FileText },
  { href: '/admin/github', label: 'GitHub Integration', icon: Github },
  { href: '/admin/social', label: 'Social Media', icon: Share2 },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/security', label: 'Security & Access', icon: Shield },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="nav-professional">
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">TraceRemove</h1>
              <p className="text-sm text-secondary">Management Center</p>
            </div>
          </Link>
          
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black border border-gray-700 rounded"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="nav-professional open">
            <div className="p-6 pt-16">
              <Link href="/admin" className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-primary">TraceRemove</h1>
                  <p className="text-sm text-secondary">Management Center</p>
                </div>
              </Link>
              
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 bg-black/50 -z-10"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
}
