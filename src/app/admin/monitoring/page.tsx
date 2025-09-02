'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

interface SystemHealth {
  summary: string;
  metrics: {
    timestamp: string;
    apiResponseTimes: Record<string, number>;
    databaseConnections: number;
    vectorIndexSize: number;
    notionSyncStatus: Record<string, any>;
    modelUsage: Record<string, any>;
    memoryUsage: number;
    uptime: number;
  };
  health: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
    lastCheck: string;
  }>;
  recommendations: string[];
}

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system/health?detailed=true');
      const data = await response.json();
      setSystemHealth(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600/20 text-green-400';
      case 'degraded': return 'bg-yellow-600/20 text-yellow-400';
      case 'unhealthy': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  if (loading && !systemHealth) {
    return (
      <div className="main-content">
        <div className="fade-in">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span className="ml-3 text-secondary">Loading system health...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">System Monitoring</h1>
            <p className="text-secondary">Real-time system metrics and service health</p>
          </div>
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {systemHealth && (
          <>
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
              <h2 className="text-lg font-semibold text-primary mb-2">System Summary</h2>
              <p className="text-secondary">{systemHealth.summary}</p>
              <p className="text-xs text-gray-400 mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>

            <div className="grid-professional grid-cols-3 mb-8">
              <div className="card-professional">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium status-active">
                    {systemHealth.health.filter(h => h.status === 'healthy').length}/{systemHealth.health.length} Healthy
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {systemHealth.metrics.memoryUsage.toFixed(1)}MB
                </div>
                <div className="text-secondary text-sm">Memory Usage</div>
              </div>

              <div className="card-professional">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    {formatUptime(systemHealth.metrics.uptime)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {Object.keys(systemHealth.metrics.apiResponseTimes).length}
                </div>
                <div className="text-secondary text-sm">API Endpoints</div>
              </div>

              <div className="card-professional">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-6 h-6 text-purple-400" />
                  <span className="text-sm font-medium text-green-400">
                    {Object.keys(systemHealth.metrics.modelUsage).length} Models
                  </span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {systemHealth.metrics.databaseConnections}
                </div>
                <div className="text-secondary text-sm">DB Connections</div>
              </div>
            </div>
          </>
        )}

        {systemHealth && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-6">Service Health</h2>
              <div className="space-y-4">
                {systemHealth.health.map((service, index) => (
                  <div key={service.service} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {service.status === 'healthy' ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        ) : service.status === 'degraded' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                        )}
                        <h3 className="font-semibold text-primary">{service.service}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBg(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-secondary text-sm">Response Time</p>
                        <p className="text-primary font-semibold">
                          {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary text-sm">Last Check</p>
                        <p className="text-primary font-semibold">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {service.error && (
                      <div className="mt-3 p-2 bg-red-600/10 rounded text-red-400 text-xs">
                        {service.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-6">System Recommendations</h2>
              <div className="space-y-4">
                {systemHealth.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      recommendation.includes('Critical') ? 'bg-red-400' :
                      recommendation.includes('Warning') ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-primary text-sm">{recommendation}</p>
                      <p className="text-secondary text-xs">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {systemHealth && (
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Performance Metrics</h2>
            <div className="grid-professional grid-cols-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {systemHealth.metrics.vectorIndexSize}
                </p>
                <p className="text-secondary text-sm">Vector Index Size</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {Object.keys(systemHealth.metrics.apiResponseTimes).length}
                </p>
                <p className="text-secondary text-sm">Active Endpoints</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {Object.values(systemHealth.metrics.modelUsage).reduce((acc: number, model: any) => acc + model.requests, 0)}
                </p>
                <p className="text-secondary text-sm">Total AI Requests</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {Object.values(systemHealth.metrics.apiResponseTimes).length > 0 
                    ? Math.round(Object.values(systemHealth.metrics.apiResponseTimes).reduce((a: number, b: number) => a + b, 0) / Object.values(systemHealth.metrics.apiResponseTimes).length)
                    : 0}ms
                </p>
                <p className="text-secondary text-sm">Avg Response Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
