'use client';

import React, { useState } from 'react';
import { FolderOpen, Plus, Calendar, Users, BarChart3, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ProjectsPage() {
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

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'planning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'planning': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Project Management</h1>
              <p className="text-secondary">Comprehensive project tracking and management</p>
            </div>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
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
              <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
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
              <Calendar className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-primary">Planning</h3>
                <p className="text-secondary text-sm">Upcoming projects</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {projects.filter(p => p.status === 'planning').length}
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
      </div>
    </div>
  );
}
