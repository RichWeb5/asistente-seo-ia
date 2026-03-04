'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const INTENT_CONFIG = {
  informational: { label: 'Informacional', color: '#3B82F6' },
  transactional: { label: 'Transaccional', color: '#10B981' },
  commercial: { label: 'Comercial', color: '#F59E0B' },
  navigational: { label: 'Navegacional', color: '#8B5CF6' },
};

const TYPE_CONFIG = {
  blog: { label: 'Blog Posts', color: '#3B82F6' },
  landing_page: { label: 'Landing Pages', color: '#10B981' },
  category: { label: 'Categorías', color: '#F59E0B' },
  comparison_page: { label: 'Comparativas', color: '#8B5CF6' },
};

export default function IntentChart({ summary }) {
  if (!summary) return null;

  const intentData = Object.entries(summary.byIntent)
    .filter(([, count]) => count > 0)
    .map(([intent, count]) => ({
      name: INTENT_CONFIG[intent]?.label || intent,
      value: count,
      color: INTENT_CONFIG[intent]?.color || '#9CA3AF',
    }));

  const typeData = Object.entries(summary.byType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: TYPE_CONFIG[type]?.label || type,
      value: count,
      color: TYPE_CONFIG[type]?.color || '#9CA3AF',
    }));

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Distribución por intención */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Distribución por Intención</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intentData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {intentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} keywords`, '']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución por tipo de contenido */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipo de Contenido Recomendado</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} keywords`, '']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
