'use client';

import React, { useState } from 'react';
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
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
              <p className="text-secondary">Manage user accounts and permissions</p>
            </div>
            <button className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card-professional mb-6">
              <h2 className="text-xl font-bold text-primary mb-4">User Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Total Users</span>
                  <span className="text-primary font-semibold">{users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Active</span>
                  <span className="text-green-400 font-semibold">
                    {users.filter(u => u.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Inactive</span>
                  <span className="text-red-400 font-semibold">
                    {users.filter(u => u.status === 'inactive').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-4">Roles</h2>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.name} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full bg-${role.color}-400 mr-2`}></div>
                      <span className="text-primary font-medium capitalize">{role.name}</span>
                    </div>
                    <p className="text-secondary text-xs">{role.permissions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card-professional">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Users</h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-700/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">{user.name}</h3>
                          <p className="text-secondary text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-600/20 text-red-400' :
                            user.role === 'editor' ? 'bg-blue-600/20 text-blue-400' :
                            user.role === 'viewer' ? 'bg-green-600/20 text-green-400' :
                            'bg-gray-600/20 text-secondary'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-secondary text-xs mt-1">Last login: {user.lastLogin}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-secondary hover:text-blue-400 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-secondary hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-secondary">No users found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
