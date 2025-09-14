'use client';

import React, { useState, useEffect } from 'react';

export default function AIAnalyticsPage() {
  const [ngrokStatus, setNgrokStatus] = useState<{ active: boolean; url?: string } | null>(null);
  const [conversationStats, setConversationStats] = useState({
    total: 1247,
    avgResponseTime: '2.3s',
    satisfaction: '94.2%',
    filesProcessed: 456,
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeConversations: 0,
    averageResponseTime: 0,
    errorRate: 0,
    modelUsage: {} as Record<string, number>,
    totalRequests: 0,
    successfulRequests: 0,
  });

  useEffect(() => {
    checkNgrokStatus();
    fetchRealtimeMetrics();
    
    const ngrokInterval = setInterval(checkNgrokStatus, 30000);
    const metricsInterval = setInterval(fetchRealtimeMetrics, 15000);
    
    return () => {
      clearInterval(ngrokInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const checkNgrokStatus = async () => {
    try {
      const response = await fetch('/api/ngrok/status');
      const data = await response.json();
      setNgrokStatus(data);
    } catch (error) {
      console.error('Failed to check ngrok status:', error);
      setNgrokStatus({ active: false });
    }
  };

  const fetchRealtimeMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime');
      if (response.ok) {
        const data = await response.json();
        setRealtimeMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">AI Assistant Analytics</h1>
        <p className="text-gray-400">Monitor AI conversation metrics and performance</p>
      </div>

      {ngrokStatus && (
        <div className="mb-6">
          <div className={`bg-gray-800 p-4 rounded-lg border ${ngrokStatus.active ? 'border-green-500' : 'border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">ngrok Status</h3>
                <p className="text-gray-400">Development tunnel status</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${ngrokStatus.active ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                {ngrokStatus.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            {ngrokStatus.active && ngrokStatus.url && (
              <div className="mt-3">
                <p className="text-sm text-gray-400">Public URL:</p>
                <a href={ngrokStatus.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                  {ngrokStatus.url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Conversations</p>
              <p className="text-2xl font-bold text-white">{realtimeMetrics.activeConversations}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">Real-time active chats</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">{realtimeMetrics.averageResponseTime.toFixed(1)}s</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">Current average</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {realtimeMetrics.totalRequests > 0 
                  ? ((realtimeMetrics.successfulRequests / realtimeMetrics.totalRequests) * 100).toFixed(1)
                  : '100.0'}%
              </p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">
              {realtimeMetrics.successfulRequests}/{realtimeMetrics.totalRequests} requests
            </span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Error Rate</p>
              <p className="text-2xl font-bold text-white">{(realtimeMetrics.errorRate * 100).toFixed(1)}%</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-400 text-sm">Current error rate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Topics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Content Creation</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">78%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Technical Analysis</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">65%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Project Management</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '52%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">52%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Strategy Development</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '41%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">41%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Language Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">English</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">68%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Русский</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '24%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">24%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Español</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '5%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Other</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-gray-500 h-2 rounded-full" style={{width: '3%'}}></div>
                </div>
                <span className="text-gray-400 text-sm">3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
