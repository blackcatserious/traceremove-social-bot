'use client';

import React, { useState } from 'react';
import { Code, Play, Download, Copy, Settings, Zap } from 'lucide-react';

export default function CodeGenerationPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('api-endpoint');

  const templates = [
    { id: 'api-endpoint', name: 'API Endpoint', description: 'Generate REST API endpoints', language: 'TypeScript' },
    { id: 'database-model', name: 'Database Model', description: 'Create database models and schemas', language: 'SQL' },
    { id: 'react-component', name: 'React Component', description: 'Generate React components', language: 'TSX' },
    { id: 'test-suite', name: 'Test Suite', description: 'Create comprehensive test suites', language: 'TypeScript' }
  ];

  const generatedCode = `// Generated API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { handleAPIError } from '@/lib/error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    
    return NextResponse.json({
      success: true,
      data: {}
    });
  } catch (error) {
    const { response, status } = handleAPIError(error);
    return NextResponse.json(response, { status });
  }
}`;

  return (
    <div className="main-content">
      <div className="fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Code Generation</h1>
              <p className="text-secondary">Generate code templates and boilerplate</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-secondary">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </button>
              <button className="btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card-professional">
            <h2 className="text-xl font-bold text-primary mb-6">Templates</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'bg-blue-600/20 border border-blue-600'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <h3 className="text-primary font-medium">{template.name}</h3>
                  <p className="text-secondary text-sm mt-1">{template.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-600 text-xs rounded">
                    {template.language}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card-professional">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Generated Code</h2>
              <div className="flex space-x-2">
                <button className="btn-secondary">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </button>
                <button className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button className="btn-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <pre className="text-gray-300 whitespace-pre-wrap">{generatedCode}</pre>
            </div>

            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-primary font-medium mb-3">Generation Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-secondary text-sm mb-2">Framework</label>
                  <select className="input-professional">
                    <option>Next.js</option>
                    <option>Express</option>
                    <option>FastAPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary text-sm mb-2">Language</label>
                  <select className="input-professional">
                    <option>TypeScript</option>
                    <option>JavaScript</option>
                    <option>Python</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
