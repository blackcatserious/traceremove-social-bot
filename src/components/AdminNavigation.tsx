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
  Share2, 
  Users, 
  Shield, 
  Settings,
  Menu,
  X,
  Activity,
  Workflow,
  Database,
  Search,
  Bell,
  Zap,
  Code,
  Monitor,
  Lock,
  Cloud,
  GitBranch,
  Package,
  Cpu,
  HardDrive,
  Network,
  Eye,
  AlertTriangle,
  Layers,
  Server,
  Terminal,
  Gauge,
  Wrench,
  BookOpen,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/domains-personas', label: 'Domains & Personas', icon: Globe },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
  { href: '/admin/monitoring-health', label: 'Monitoring & Health', icon: Activity },
  { href: '/admin/logs-backup', label: 'Logs & Backup', icon: FileText },
  { href: '/admin/workflows-deployments', label: 'Workflows & Deployments', icon: Workflow },
  { href: '/admin/content-publishing', label: 'Content & Publishing', icon: FileText },
  { href: '/admin/models-vectors', label: 'Models & Vectors', icon: Brain },
  { href: '/admin/ai-analytics', label: 'AI Analytics', icon: BarChart3 },
  { href: '/admin/analytics-reports', label: 'Analytics & Reports', icon: BarChart3 },
  { href: '/admin/integrations-github', label: 'Integrations & GitHub', icon: Share2 },
  { href: '/admin/projects-users', label: 'Projects & Users', icon: Users },
  { href: '/admin/api-security', label: 'API Docs & Security', icon: Shield },
  { href: '/admin/database-management', label: 'Database Management', icon: Database },
  { href: '/admin/search-optimization', label: 'Search Optimization', icon: Search },
  { href: '/admin/notifications-alerts', label: 'Notifications & Alerts', icon: Bell },
  { href: '/admin/performance-tuning', label: 'Performance Tuning', icon: Zap },
  { href: '/admin/code-generation', label: 'Code Generation', icon: Code },
  { href: '/admin/system-monitoring', label: 'System Monitoring', icon: Monitor },
  { href: '/admin/security-compliance', label: 'Security & Compliance', icon: Lock },
  { href: '/admin/cloud-infrastructure', label: 'Cloud Infrastructure', icon: Cloud },
  { href: '/admin/version-control', label: 'Version Control', icon: GitBranch },
  { href: '/admin/package-management', label: 'Package Management', icon: Package },
  { href: '/admin/resource-allocation', label: 'Resource Allocation', icon: Cpu },
  { href: '/admin/storage-management', label: 'Storage Management', icon: HardDrive },
  { href: '/admin/network-configuration', label: 'Network Configuration', icon: Network },
  { href: '/admin/audit-logging', label: 'Audit & Logging', icon: Eye },
  { href: '/admin/error-tracking', label: 'Error Tracking', icon: AlertTriangle },
  { href: '/admin/service-mesh', label: 'Service Mesh', icon: Layers },
  { href: '/admin/server-management', label: 'Server Management', icon: Server },
  { href: '/admin/cli-tools', label: 'CLI Tools', icon: Terminal },
  { href: '/admin/metrics-dashboard', label: 'Metrics Dashboard', icon: Gauge },
  { href: '/admin/maintenance-tools', label: 'Maintenance Tools', icon: Wrench },
  { href: '/admin/documentation', label: 'Documentation', icon: BookOpen },
  { href: '/admin/communication', label: 'Communication', icon: MessageSquare },
  { href: '/admin/scheduling', label: 'Scheduling', icon: Calendar },
  { href: '/admin/goal-tracking', label: 'Goal Tracking', icon: Target },
  { href: '/admin/trend-analysis', label: 'Trend Analysis', icon: TrendingUp }
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
