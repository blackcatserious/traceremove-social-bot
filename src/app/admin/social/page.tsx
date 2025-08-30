'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Social Media Management</h1>
              <p className="text-gray-400">Manage posts and engagement across platforms</p>
            </div>
            <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <platform.icon className="w-8 h-8 text-blue-400" />
                <div className={`w-3 h-3 rounded-full ${
                  platform.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{platform.name}</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Posts</span>
                  <span className="text-white text-sm">{platform.posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Engagement</span>
                  <span className="text-green-400 text-sm">{platform.engagement}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Scheduled Posts</h2>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600"
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
                        {post.platform === 'github' && <Github className="w-5 h-5 text-gray-400 mr-2" />}
                        <span className="text-white font-medium capitalize">{post.platform}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'scheduled' ? 'bg-blue-600/20 text-blue-400' : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                    <p className="text-gray-400 text-xs">Scheduled for: {post.scheduledFor}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Performance Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Posts</span>
                  <span className="text-white font-semibold">114</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg. Engagement</span>
                  <span className="text-green-400 font-semibold">14.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Scheduled</span>
                  <span className="text-blue-400 font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Drafts</span>
                  <span className="text-yellow-400 font-semibold">3</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Create Post
                </button>
                <button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Batch
                </button>
                <button className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
