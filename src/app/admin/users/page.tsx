'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield, Edit3, Trash2, Search } from 'lucide-react';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 1, name: 'Admin User', email: 'admin@traceremove.net', role: 'admin', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Content Manager', email: 'content@traceremove.net', role: 'editor', status: 'active', lastLogin: '1 day ago' },
    { id: 3, name: 'Analytics Viewer', email: 'analytics@traceremove.net', role: 'viewer', status: 'active', lastLogin: '3 days ago' },
    { id: 4, name: 'Guest User', email: 'guest@traceremove.net', role: 'guest', status: 'inactive', lastLogin: '1 week ago' }
  ];

  const roles = [
    { name: 'admin', color: 'red', permissions: 'Full access to all features' },
    { name: 'editor', color: 'blue', permissions: 'Content management and analytics' },
    { name: 'viewer', color: 'green', permissions: 'Read-only access to analytics' },
    { name: 'guest', color: 'gray', permissions: 'Limited access to public features' }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">User Management</h1>
              <p className="text-gray-400">Manage user accounts and permissions</p>
            </div>
            <button className="flex items-center btn-premium px-4 py-2 rounded-lg transition-colors">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card-premium mb-6"
            >
              <h2 className="text-xl font-bold text-gradient mb-4">User Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-semibold">{users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active</span>
                  <span className="text-green-400 font-semibold">
                    {users.filter(u => u.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Inactive</span>
                  <span className="text-red-400 font-semibold">
                    {users.filter(u => u.status === 'inactive').length}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-premium"
            >
              <h2 className="text-xl font-bold text-gradient mb-4">Roles</h2>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.name} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full bg-${role.color}-400 mr-2`}></div>
                      <span className="text-white font-medium capitalize">{role.name}</span>
                    </div>
                    <p className="text-gray-400 text-xs">{role.permissions}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-premium"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gradient">Users</h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-600/20 text-red-400' :
                            user.role === 'editor' ? 'bg-blue-600/20 text-blue-400' :
                            user.role === 'viewer' ? 'bg-green-600/20 text-green-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-gray-400 text-xs mt-1">Last login: {user.lastLogin}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found matching your search</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
