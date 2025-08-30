'use client';

import React, { useState } from 'react';

interface ReindexResult {
  ok: boolean;
  persona: string;
  indexed: number;
  timestamp: string;
  error?: string;
}

const personas = [
  { id: 'philosopher', name: 'Philosophy of Technology', domain: 'traceremove.dev' },
  { id: 'orm-multilang', name: 'ORM Assistant (Multi-lang)', domain: 'traceremove.com' },
  { id: 'orm-russian', name: 'ORM Assistant (Russian)', domain: 'traceremove.io' }
];

export default function AdminReindexPage() {
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<Record<string, ReindexResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const authenticate = () => {
    if (adminToken.trim()) {
      setIsAuthenticated(true);
    }
  };

  const reindexPersona = async (personaId: string) => {
    setLoading(prev => ({ ...prev, [personaId]: true }));
    
    try {
      const response = await fetch(`/api/admin/reindex?persona=${personaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, [personaId]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [personaId]: { 
          ok: false, 
          persona: personaId, 
          indexed: 0, 
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [personaId]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-primary mb-6 text-center">
            Admin Authentication
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-primary rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
            />
            <button
              onClick={authenticate}
              className="w-full btn-primary font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              RAG Reindex Administration
            </h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-secondary hover:text-primary transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-6">
            {personas.map((persona) => (
              <div key={persona.id} className="bg-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-1">
                      {persona.name}
                    </h2>
                    <p className="text-secondary text-sm">
                      Domain: {persona.domain}
                    </p>
                  </div>
                  <button
                    onClick={() => reindexPersona(persona.id)}
                    disabled={loading[persona.id]}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-primary font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading[persona.id] ? 'Reindexing...' : 'Reindex'}
                  </button>
                </div>

                {results[persona.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    results[persona.id].ok 
                      ? 'bg-green-900 border border-green-700' 
                      : 'bg-red-900 border border-red-700'
                  }`}>
                    {results[persona.id].ok ? (
                      <div className="text-green-100">
                        <p className="font-medium">✅ Reindex completed successfully</p>
                        <p className="text-sm mt-1">
                          Indexed {results[persona.id].indexed} documents
                        </p>
                        <p className="text-xs text-green-300 mt-1">
                          {new Date(results[persona.id].timestamp).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-red-100">
                        <p className="font-medium">❌ Reindex failed</p>
                        <p className="text-sm mt-1">
                          {results[persona.id].error || 'Unknown error'}
                        </p>
                        <p className="text-xs text-red-300 mt-1">
                          {new Date(results[persona.id].timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-2">
              API Usage
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>GET /api/admin/reindex - View available personas</p>
              <p>POST /api/admin/reindex?persona=&lt;id&gt; - Reindex specific persona</p>
              <p className="text-xs text-secondary mt-2">
                Requires Authorization: Bearer &lt;ADMIN_TOKEN&gt; header
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
