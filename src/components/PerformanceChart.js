'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function PerformanceChart({ data, loading }) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  // Formatear datos para Recharts
  const chartData = data.map((d) => ({
    fecha: d.keys[0],
    clics: d.clicks,
    impresiones: d.impressions,
    ctr: +(d.ctr * 100).toFixed(2),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Rendimiento en los últimos 30 días
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(v) => {
              const d = new Date(v);
              return d.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
              });
            }}
            formatter={(value, name) => {
              if (name === 'ctr') return [value + '%', 'CTR'];
              return [value.toLocaleString('es'), name === 'clics' ? 'Clics' : 'Impresiones'];
            }}
          />
          <Legend
            formatter={(value) => {
              const labels = { clics: 'Clics', impresiones: 'Impresiones', ctr: 'CTR (%)' };
              return labels[value] || value;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clics"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="impresiones"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
