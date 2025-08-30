'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Instagram, Github, Calendar, TrendingUp } from 'lucide-react';

export default function SocialPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, status: 'active', posts: 45, engagement: '12.3%' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, status: 'active', posts: 23, engagement: '8.7%' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, status: 'active', posts: 34, engagement: '15.2%' },
    { id: 'github', name: 'GitHub', icon: Github, status: 'active', posts: 12, engagement: '23.1%' }
  ];

  const scheduledPosts = [
    { id: 1, platform: 'twitter', content: 'Exploring the ethics of AI in modern society...', scheduledFor: '2 hours', status: 'scheduled' },
    { id: 2, platform: 'facebook', content: 'New research on digital rights and privacy...', scheduledFor: '4 hours', status: 'scheduled' },
    { id: 3, platform: 'instagram', content: 'Philosophy meets technology in our latest...', scheduledFor: '6 hours', status: 'scheduled' },
    { id: 4, platform: 'github', content: 'Updated documentation for AI ethics framework', scheduledFor: '1 day', status: 'draft' }
  ];

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Social Media Management</h1>
              <p className="text-secondary">Manage posts and engagement across platforms</p>
            </div>
            <button className="flex items-center btn-primary px-4 py-2 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </button>
          </div>
        </div>

        <div className="grid-professional grid-cols-4 mb-8">
          {platforms.map((platform, index) => (
            <div
              key={platform.id}
              className="card-professional"
            >
              <div className="flex items-center justify-between mb-4">
                <platform.icon className="w-8 h-8 text-blue-400" />
                <div className={`w-3 h-3 rounded-full ${
                  platform.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{platform.name}</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-secondary text-sm">Posts</span>
                  <span className="text-primary text-sm">{platform.posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary text-sm">Engagement</span>
                  <span className="text-green-400 text-sm">{platform.engagement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-professional">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Scheduled Posts</h2>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-gray-700 text-primary px-3 py-1 rounded-lg border border-gray-600"
                >
                  <option value="all">All Platforms</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="github">GitHub</option>
                </select>
              </div>

              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {post.platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400 mr-2" />}
                        {post.platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600 mr-2" />}
                        {post.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-400 mr-2" />}
                        {post.platform === 'github' && <Github className="w-5 h-5 text-secondary mr-2" />}
                        <span className="text-primary font-medium capitalize">{post.platform}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                    <p className="text-secondary text-xs">Scheduled for: {post.scheduledFor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-professional mb-6">
              <h2 className="text-xl font-bold text-primary mb-6">Performance Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Total Posts</span>
                  <span className="text-primary font-semibold">114</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Avg. Engagement</span>
                  <span className="text-green-400 font-semibold">14.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Scheduled</span>
                  <span className="text-blue-400 font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Drafts</span>
                  <span className="text-yellow-400 font-semibold">3</span>
                </div>
              </div>
            </div>

            <div className="card-professional">
              <h2 className="text-xl font-bold text-primary mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center btn-primary px-4 py-2 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Create Post
                </button>
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Batch
                </button>
                <button className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-primary px-4 py-2 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
