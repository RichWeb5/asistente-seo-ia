'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
} from 'lucide-react';

const PRIORITY_STYLES = {
  alta: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
  media: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  baja: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
};

const TYPE_ICONS = {
  ctr_bajo: Target,
  sin_clics: AlertTriangle,
  casi_top10: TrendingUp,
  pagina_bajo_rendimiento: AlertTriangle,
};

export default function Recommendations({ recommendations, loading }) {
  const [expanded, setExpanded] = useState({});

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-56 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded mb-3"></div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recomendaciones SEO</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Selecciona un sitio para ver recomendaciones personalizadas.
        </p>
      </div>
    );
  }

  const toggle = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Recomendaciones SEO ({recommendations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const style = PRIORITY_STYLES[rec.priority];
          const Icon = TYPE_ICONS[rec.type] || Lightbulb;

          return (
            <div
              key={i}
              className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left"
              >
                <Icon className={`w-5 h-5 mt-0.5 ${style.text} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${style.badge} ${style.text}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                </div>
                {expanded[i] ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                )}
              </button>

              {expanded[i] && (
                <div className="px-4 pb-4 pl-12">
                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Acciones recomendadas:
                  </p>
                  <ul className="space-y-1">
                    {rec.actions.map((action, j) => (
                      <li
                        key={j}
                        className="text-sm text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-primary-500 mt-1">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
