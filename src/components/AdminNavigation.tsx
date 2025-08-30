'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Settings, Users, BarChart3, Database, 
  MessageSquare, Github, Share2, Shield,
  Menu, X, Brain
} from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/domains', label: 'Domain Management', icon: Brain },
  { href: '/admin/personas', label: 'AI Personas', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/content', label: 'Content Management', icon: Database },
  { href: '/admin/github', label: 'GitHub Integration', icon: Github },
  { href: '/admin/social', label: 'Social Media', icon: Share2 },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/security', label: 'Security & Access', icon: Shield },
  { href: '/admin/settings', label: 'System Settings', icon: Settings }
];

export default function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/admin" className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">TraceRemove</span>
              <span className="text-xs text-gray-400">Management Center</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-700/50 py-4"
            >
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
