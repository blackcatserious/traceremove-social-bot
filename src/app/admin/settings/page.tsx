'use client';

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Database, Globe, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'TraceRemove Management Center',
    defaultLanguage: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    slackNotifications: false,
    autoBackup: true,
    debugMode: false,
    maintenanceMode: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const environmentVariables = [
    { name: 'OPENAI_API_KEY', value: '••••••••••••••••', status: 'configured' },
    { name: 'NOTION_TOKEN', value: '••••••••••••••••', status: 'configured' },
    { name: 'UPSTASH_VECTOR_REST_URL', value: '••••••••••••••••', status: 'configured' },
    { name: 'GITHUB_TOKEN', value: '••••••••••••••••', status: 'configured' },
    { name: 'ADMIN_TOKEN', value: '••••••••••••••••', status: 'configured' }
  ];

  const systemInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Environment', value: 'Production' },
    { label: 'Uptime', value: '7 days, 14 hours' },
    { label: 'Memory Usage', value: '245 MB' },
    { label: 'CPU Usage', value: '12%' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">System Settings</h1>
              <p className="text-secondary">Configure system preferences and environment</p>
            </div>
            <button className="flex items-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card-professional">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-bold text-primary">General Settings</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="ru">Russian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CET">Central European Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-professional">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-xl font-bold text-primary">Notifications</h2>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email alerts for important events' },
                  { key: 'slackNotifications', label: 'Slack Notifications', description: 'Send notifications to Slack channels' },
                  { key: 'autoBackup', label: 'Automatic Backups', description: 'Automatically backup data daily' },
                  { key: 'debugMode', label: 'Debug Mode', description: 'Enable detailed logging for troubleshooting' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put system in maintenance mode' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{setting.label}</h3>
                      <p className="text-secondary text-sm">{setting.description}</p>
                    </div>
                    <div
                      onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                        settings[setting.key as keyof typeof settings] ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-professional">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 text-green-400 mr-3" />
                <h2 className="text-xl font-bold text-primary">Environment Variables</h2>
              </div>
              <div className="space-y-3">
                {environmentVariables.map((env, index) => (
                  <div key={env.name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{env.name}</h3>
                      <p className="text-secondary text-sm font-mono">{env.value}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      env.status === 'configured' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="card-professional">
              <div className="flex items-center mb-6">
                <Globe className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-xl font-bold text-primary">System Info</h2>
              </div>
              <div className="space-y-4">
                {systemInfo.map((info, index) => (
                  <div key={info.label} className="flex items-center justify-between">
                    <span className="text-secondary">{info.label}</span>
                    <span className="text-primary font-semibold">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-professional">
              <div className="flex items-center mb-6">
                <Palette className="w-6 h-6 text-pink-400 mr-3" />
                <h2 className="text-xl font-bold text-primary">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center btn-primary px-4 py-2 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart System
                </button>
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Data
                </button>
                <button className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
