'use client';

import React, { useState } from 'react';
import { FolderOpen, Plus, Calendar, Users, BarChart3, CheckCircle, Clock, AlertTriangle, User, Mail, Shield } from 'lucide-react';

export default function ProjectsUsersPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<string>('project-1');

  const projects = [
    {
      id: 'project-1',
      name: 'Brand Reputation Campaign',
      description: 'Comprehensive ORM strategy for Q4 2025',
      status: 'in_progress',
      progress: 65,
      startDate: '2025-08-01',
      endDate: '2025-12-31',
      team: ['Arthur Ziganshine', 'Content Team', 'Analytics Team'],
      tasks: 24,
      completedTasks: 16,
      budget: 50000,
      spent: 32500
    },
    {
      id: 'project-2',
      name: 'AI System Enhancement',
      description: 'Expanding digital Arthur Ziganshine capabilities',
      status: 'planning',
      progress: 15,
      startDate: '2025-09-01',
      endDate: '2026-02-28',
      team: ['Arthur Ziganshine', 'Development Team'],
      tasks: 18,
      completedTasks: 3,
      budget: 75000,
      spent: 8500
    },
    {
      id: 'project-3',
      name: 'Content Production Pipeline',
      description: 'Automated content creation and distribution',
      status: 'completed',
      progress: 100,
      startDate: '2025-06-01',
      endDate: '2025-08-15',
      team: ['Arthur Ziganshine', 'Content Team'],
      tasks: 12,
      completedTasks: 12,
      budget: 30000,
      spent: 28750
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Arthur Ziganshine',
      email: 'arthur@traceremove.dev',
      role: 'Administrator',
      status: 'active',
      lastLogin: '2024-09-01 15:30:00',
      projects: 3,
      permissions: ['admin', 'content', 'analytics']
    },
    {
      id: 2,
      name: 'Content Manager',
      email: 'content@traceremove.com',
      role: 'Content Manager',
      status: 'active',
      lastLogin: '2024-09-01 14:15:00',
      projects: 2,
      permissions: ['content', 'social']
    },
    {
      id: 3,
      name: 'Analytics Specialist',
      email: 'analytics@traceremove.com',
      role: 'Analyst',
      status: 'active',
      lastLogin: '2024-09-01 12:45:00',
      projects: 1,
      permissions: ['analytics', 'reports']
    },
    {
      id: 4,
      name: 'Guest Reviewer',
      email: 'guest@example.com',
      role: 'Guest',
      status: 'inactive',
      lastLogin: '2024-08-28 09:30:00',
      projects: 0,
      permissions: ['read']
    }
  ];

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'planning': return 'text-yellow-400';
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'planning': return AlertTriangle;
      case 'active': return CheckCircle;
      case 'inactive': return AlertTriangle;
      default: return Clock;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-red-600/20 text-red-400';
      case 'Content Manager': return 'bg-blue-600/20 text-blue-400';
      case 'Analyst': return 'bg-green-600/20 text-green-400';
      case 'Guest': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Projects & Users Management</h1>
              <p className="text-secondary">Manage projects, team members, and user permissions</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <Users className="w-4 h-4 mr-2" />
                Add User
              </button>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          <div className="card-professional">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Active Projects</h3>
                <p className="text-secondary text-sm">Currently running</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {projects.filter(p => p.status === 'in_progress').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Active Users</h3>
                <p className="text-secondary text-sm">Team members</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {users.filter(u => u.status === 'active').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Completed</h3>
                <p className="text-secondary text-sm">This quarter</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {projects.filter(p => p.status === 'completed').length}
            </div>
          </div>

          <div className="card-professional">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Total Budget</h3>
                <p className="text-secondary text-sm">All projects</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card-professional mb-8">
          <div className="flex space-x-1 mb-6">
            {['projects', 'users', 'permissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-secondary hover:text-primary hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="card-professional">
                <h2 className="text-xl font-bold text-primary mb-6">Projects</h2>
                <div className="space-y-4">
                  {projects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status);
                    return (
                      <div
                        key={project.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedProject === project.id
                            ? 'bg-blue-600/20 border border-blue-500/50'
                            : 'bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-primary">{project.name}</h3>
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(project.status)}`} />
                        </div>
                        <p className="text-secondary text-sm mb-2">{project.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{project.progress}% complete</span>
                          <span>{project.completedTasks}/{project.tasks} tasks</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedProjectData && (
                  <div className="space-y-6">
                    <div className="card-professional">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-primary">{selectedProjectData.name}</h2>
                          <p className="text-secondary text-sm">{selectedProjectData.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProjectData.status)} bg-gray-700`}>
                          {selectedProjectData.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Progress</label>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-700 rounded-full h-3 mr-3">
                              <div 
                                className="bg-blue-400 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${selectedProjectData.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-primary font-semibold">{selectedProjectData.progress}%</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Timeline</label>
                          <p className="text-secondary text-sm">
                            {selectedProjectData.startDate} → {selectedProjectData.endDate}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                            <span className="text-primary font-semibold">Tasks</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            {selectedProjectData.completedTasks}/{selectedProjectData.tasks}
                          </p>
                        </div>

                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Users className="w-5 h-5 text-blue-400 mr-2" />
                            <span className="text-primary font-semibold">Team</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">{selectedProjectData.team.length}</p>
                        </div>

                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
                            <span className="text-primary font-semibold">Budget</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            ${selectedProjectData.spent.toLocaleString()}
                          </p>
                          <p className="text-xs text-secondary">
                            of ${selectedProjectData.budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card-professional">
                      <h3 className="text-lg font-bold text-primary mb-4">Team Members</h3>
                      <div className="space-y-3">
                        {selectedProjectData.team.map((member, index) => (
                          <div key={index} className="flex items-center bg-gray-700/50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-semibold">
                                {member.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-primary">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              {users.map((user) => {
                const StatusIcon = getStatusIcon(user.status);
                return (
                  <div key={user.id} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">{user.name}</h3>
                          <p className="text-secondary text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(user.status)}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-secondary">Status</p>
                        <p className="text-primary font-semibold capitalize">{user.status}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Last Login</p>
                        <p className="text-primary font-semibold">{user.lastLogin}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Projects</p>
                        <p className="text-primary font-semibold">{user.projects}</p>
                      </div>
                      <div>
                        <p className="text-secondary">Permissions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.permissions.slice(0, 2).map((perm) => (
                            <span key={perm} className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1 rounded">
                              {perm}
                            </span>
                          ))}
                          {user.permissions.length > 2 && (
                            <span className="text-xs text-gray-500">+{user.permissions.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Permission Levels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-red-400 mr-3" />
                      <span className="text-primary font-semibold">Administrator</span>
                    </div>
                    <span className="text-secondary text-sm">Full access</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-400 mr-3" />
                      <span className="text-primary font-semibold">Content Manager</span>
                    </div>
                    <span className="text-secondary text-sm">Content & Social</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-400 mr-3" />
                      <span className="text-primary font-semibold">Analyst</span>
                    </div>
                    <span className="text-secondary text-sm">Analytics & Reports</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-primary font-semibold">Guest</span>
                    </div>
                    <span className="text-secondary text-sm">Read only</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">User login: Arthur Ziganshine</p>
                      <p className="text-secondary text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">Permission updated: Content Manager</p>
                      <p className="text-secondary text-xs">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">New user added: Analytics Specialist</p>
                      <p className="text-secondary text-xs">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
