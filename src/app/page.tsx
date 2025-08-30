import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          TraceRemove Social Bot
        </h1>
        <p className="text-gray-600 mb-6">
          AI-powered social media bot with domain-specific personas and RAG functionality.
        </p>
        <div className="text-sm text-gray-500">
          <p>Chat widget available in bottom right corner</p>
        </div>
      </div>
    </div>
  );
}
