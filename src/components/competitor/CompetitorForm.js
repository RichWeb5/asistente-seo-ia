'use client';

import { useState } from 'react';
import { Swords, Loader2 } from 'lucide-react';

export default function CompetitorForm({ onAnalyze, loading, initialDomain }) {
  const [competitorDomain, setCompetitorDomain] = useState('');
  const [userDomain, setUserDomain] = useState(initialDomain || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!competitorDomain.trim() || loading) return;
    onAnalyze({
      competitorDomain: competitorDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, ''),
      userDomain: userDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '') || null,
    });
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Análisis de Competencia
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Dominio del competidor *
            </label>
            <input
              type="text"
              placeholder="ejemplo: competidor.com"
              value={competitorDomain}
              onChange={(e) => setCompetitorDomain(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tu dominio (opcional, para comparar)
            </label>
            <input
              type="text"
              placeholder="ejemplo: tuweb.com"
              value={userDomain}
              onChange={(e) => setUserDomain(e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Swords className="w-4 h-4" />
              Analizar Competidor
            </>
          )}
        </button>
      </form>
    </div>
  );
}
