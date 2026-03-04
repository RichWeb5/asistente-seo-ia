'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Star, Layers } from 'lucide-react';

const INTENT_LABELS = {
  informational: { label: 'Informacional', class: 'badge-info' },
  transactional: { label: 'Transaccional', class: 'badge-success' },
  commercial: { label: 'Comercial', class: 'badge-warning' },
  navigational: { label: 'Navegacional', class: 'badge-purple' },
};

export default function KeywordClusters({ clusters, longTailOpportunities }) {
  const [expandedClusters, setExpandedClusters] = useState(new Set());

  if (!clusters || clusters.length === 0) return null;

  const toggleCluster = (index) => {
    const next = new Set(expandedClusters);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedClusters(next);
  };

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Clusters ({clusters.length})
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {clusters.reduce((sum, c) => sum + c.count, 0)} keywords agrupadas en {clusters.length} clusters
          {longTailOpportunities?.length > 0 && (
            <> | <Star className="w-3 h-3 inline text-yellow-500" /> {longTailOpportunities.length} oportunidades long-tail</>
          )}
        </p>
      </div>

      {/* Clusters accordion */}
      {clusters.map((cluster, index) => {
        const isExpanded = expandedClusters.has(index);
        const intentInfo = INTENT_LABELS[cluster.intent] || INTENT_LABELS.informational;

        return (
          <div key={index} className="card !p-0 overflow-hidden">
            <button
              onClick={() => toggleCluster(index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{cluster.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${intentInfo.class}`}>{intentInfo.label}</span>
                    <span className="text-xs text-gray-500">{cluster.count} keywords</span>
                    <span className="text-xs text-gray-500">|</span>
                    <span className="text-xs text-gray-500">Vol. prom: {cluster.avgVolume.toLocaleString('es')}</span>
                    <span className="text-xs text-gray-500">|</span>
                    <span className="text-xs text-gray-500">KD prom: {cluster.avgDifficulty}</span>
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Keyword</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Volumen</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">KD</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">CPC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cluster.keywords.map((kw, ki) => (
                      <tr key={ki} className="hover:bg-white">
                        <td className="py-2 font-medium text-gray-900">{kw.keyword}</td>
                        <td className="py-2 text-blue-600">{(kw.volume || 0).toLocaleString('es')}</td>
                        <td className="py-2 text-gray-600">{kw.difficulty || 0}</td>
                        <td className="py-2 text-gray-600">${(kw.cpc || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Long-tail opportunities */}
      {longTailOpportunities && longTailOpportunities.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Oportunidades Long-Tail ({longTailOpportunities.length})
            </h3>
          </div>
          <div className="space-y-2">
            {longTailOpportunities.slice(0, 20).map((kw, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Vol: {(kw.volume || 0).toLocaleString('es')}</span>
                  <span>KD: {kw.difficulty || 0}</span>
                  <span>Comp: {((kw.competition || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
