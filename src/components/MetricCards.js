'use client';

import { MousePointerClick, Eye, Percent, ArrowUpDown } from 'lucide-react';

const METRICS = [
  {
    key: 'totalClicks',
    label: 'Clics',
    icon: MousePointerClick,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    format: (v) => v.toLocaleString('es'),
  },
  {
    key: 'totalImpressions',
    label: 'Impresiones',
    icon: Eye,
    color: 'text-green-600',
    bg: 'bg-green-50',
    format: (v) => v.toLocaleString('es'),
  },
  {
    key: 'avgCtr',
    label: 'CTR Promedio',
    icon: Percent,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    format: (v) => (v * 100).toFixed(2) + '%',
  },
  {
    key: 'avgPosition',
    label: 'Posición Promedio',
    icon: ArrowUpDown,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    format: (v) => v.toFixed(1),
  },
];

export default function MetricCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map(({ key, label, icon: Icon, color, bg, format }) => (
        <div key={key} className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-sm text-gray-500">{label}</span>
          </div>
          <p className={`text-2xl font-bold ${color}`}>
            {format(summary[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
