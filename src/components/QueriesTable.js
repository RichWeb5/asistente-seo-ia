'use client';

import { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

export default function QueriesTable({ data, loading, title = 'Consultas principales' }) {
  const [sortBy, setSortBy] = useState('clicks');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const filtered = data.filter((q) =>
    q.keys[0].toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    return (a[sortBy] - b[sortBy]) * mult;
  });

  const SortHeader = ({ col, label }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Consulta
              </th>
              <SortHeader col="clicks" label="Clics" />
              <SortHeader col="impressions" label="Impresiones" />
              <SortHeader col="ctr" label="CTR" />
              <SortHeader col="position" label="Posición" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, 20).map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {row.keys[0]}
                </td>
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {row.clicks.toLocaleString('es')}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {row.impressions.toLocaleString('es')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      row.ctr >= 0.05
                        ? 'bg-green-100 text-green-700'
                        : row.ctr >= 0.02
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {(row.ctr * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {row.position.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
