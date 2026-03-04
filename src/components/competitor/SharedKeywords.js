'use client';

import { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

export default function SharedKeywords({ sharedData, gapData }) {
  const [activeTab, setActiveTab] = useState('shared');
  const [sortBy, setSortBy] = useState('volume');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');

  const data = activeTab === 'shared' ? sharedData : gapData;

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const filtered = (data || []).filter((kw) =>
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'shared'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Compartidas ({sharedData?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'gaps'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Brechas ({gapData?.length || 0})
          </button>
        </div>
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

      {activeTab === 'gaps' && gapData && gapData.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">
            <strong>{gapData.length} keywords</strong> donde tu competidor posiciona y tú no. Estas son oportunidades de ataque SEO.
          </p>
        </div>
      )}

      {(!data || data.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            {activeTab === 'shared'
              ? 'No se encontraron keywords compartidas. Asegúrate de incluir tu dominio.'
              : 'No se encontraron brechas de contenido.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <SortHeader col="keyword" label="Keyword" />
                <SortHeader col="volume" label="Volumen" />
                <SortHeader col="difficulty" label="KD" />
                {activeTab === 'shared' ? (
                  <>
                    <SortHeader col="position1" label="Tu Pos." />
                    <SortHeader col="position2" label="Comp. Pos." />
                  </>
                ) : (
                  <>
                    <SortHeader col="competitorPosition" label="Pos. Comp." />
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL Comp.</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.slice(0, 50).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {row.keyword}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-medium">
                    {(row.volume || 0).toLocaleString('es')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.difficulty || 0}</td>
                  {activeTab === 'shared' ? (
                    <>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          row.position1 <= 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {row.position1 || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          row.position2 <= 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {row.position2 || '-'}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          {row.competitorPosition || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                        {row.url || '-'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
