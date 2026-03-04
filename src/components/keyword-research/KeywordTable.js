'use client';

import { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

const INTENT_LABELS = {
  informational: { label: 'Informacional', class: 'badge-info' },
  transactional: { label: 'Transaccional', class: 'badge-success' },
  commercial: { label: 'Comercial', class: 'badge-warning' },
  navigational: { label: 'Navegacional', class: 'badge-purple' },
};

function getDifficultyColor(kd) {
  if (kd <= 30) return 'bg-green-100 text-green-700';
  if (kd <= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function KeywordTable({ data, onSelectKeywords }) {
  const [sortBy, setSortBy] = useState('volume');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(new Set());

  if (!data || data.length === 0) return null;

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

  const toggleSelect = (keyword) => {
    const next = new Set(selected);
    if (next.has(keyword)) {
      next.delete(keyword);
    } else {
      next.add(keyword);
    }
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === sorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((k) => k.keyword)));
    }
  };

  const handleSendToContent = () => {
    const selectedKeywords = data.filter((kw) => selected.has(kw.keyword));
    if (onSelectKeywords) onSelectKeywords(selectedKeywords);
  };

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
        <h3 className="text-lg font-semibold text-gray-900">
          Resultados ({sorted.length})
        </h3>
        <div className="flex items-center gap-3">
          {selected.size > 0 && onSelectKeywords && (
            <button
              onClick={handleSendToContent}
              className="btn-primary text-xs"
            >
              Enviar {selected.size} al Generador
            </button>
          )}
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
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === sorted.length && sorted.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <SortHeader col="keyword" label="Keyword" />
              <SortHeader col="volume" label="Volumen" />
              <SortHeader col="difficulty" label="KD" />
              <SortHeader col="cpc" label="CPC" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intención
              </th>
              <SortHeader col="competition" label="Comp." />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.slice(0, 50).map((row, i) => {
              const intentInfo = INTENT_LABELS[row.intent] || INTENT_LABELS.informational;
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.keyword)}
                      onChange={() => toggleSelect(row.keyword)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {row.keyword}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-medium">
                    {(row.volume || 0).toLocaleString('es')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(row.difficulty)}`}>
                      {row.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    ${(row.cpc || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${intentInfo.class}`}>
                      {intentInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {((row.competition || 0) * 100).toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
