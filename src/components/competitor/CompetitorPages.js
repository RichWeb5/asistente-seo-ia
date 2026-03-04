'use client';

import { useState } from 'react';
import { ArrowUpDown, ExternalLink } from 'lucide-react';

export default function CompetitorPages({ data }) {
  const [sortBy, setSortBy] = useState('keywords');
  const [sortDir, setSortDir] = useState('desc');

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 text-sm">No se encontraron páginas del competidor</p>
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

  const sorted = [...data].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Páginas Mejor Posicionadas ({sorted.length})
      </h3>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <SortHeader col="keywords" label="Keywords" />
              <SortHeader col="traffic" label="Tráfico Est." />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Keyword</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, 30).map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-[300px]">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs truncate"
                  >
                    {row.url.replace(/^https?:\/\/[^/]+/, '')}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </td>
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {(row.keywords || 0).toLocaleString('es')}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {(row.traffic || 0).toLocaleString('es')}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {row.topKeyword || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
