'use client';

import { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

export default function CompetitorKeywords({ data }) {
  const [sortBy, setSortBy] = useState('volume');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 text-sm">No se encontraron keywords del competidor</p>
      </div>
    );
  }

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const filtered = data.filter((kw) =>
    kw.keyword.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'keyword') return a.keyword.localeCompare(b.keyword) * mult;
    return ((a[sortBy] || 0) - (b[sortBy] || 0)) * mult;
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
        <h3 className="text-lg font-semibold text-gray-900">
          Keywords del Competidor ({sorted.length})
        </h3>
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
              <SortHeader col="keyword" label="Keyword" />
              <SortHeader col="position" label="Posición" />
              <SortHeader col="volume" label="Volumen" />
              <SortHeader col="difficulty" label="KD" />
              <SortHeader col="cpc" label="CPC" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, 50).map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {row.keyword}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.position <= 3 ? 'bg-green-100 text-green-700' :
                    row.position <= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.position}
                  </span>
                </td>
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {(row.volume || 0).toLocaleString('es')}
                </td>
                <td className="px-4 py-3 text-gray-600">{row.difficulty || 0}</td>
                <td className="px-4 py-3 text-gray-600">${(row.cpc || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                  {row.url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
