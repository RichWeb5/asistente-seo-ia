'use client';

import { useState } from 'react';
import { ArrowUpDown, FileText } from 'lucide-react';

const INTENT_LABELS = {
  informational: { label: 'Info', class: 'badge-info' },
  transactional: { label: 'Trans', class: 'badge-success' },
  commercial: { label: 'Comerc', class: 'badge-warning' },
  navigational: { label: 'Nav', class: 'badge-purple' },
};

const TYPE_LABELS = {
  blog: 'Blog',
  landing_page: 'Landing',
  category: 'Categoría',
  comparison_page: 'Comparativa',
};

export default function EditorialPlan({ plan, onSelectArticle }) {
  const [sortBy, setSortBy] = useState('volume');
  const [sortDir, setSortDir] = useState('desc');

  if (!plan || plan.length === 0) return null;

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const sorted = [...plan].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'keyword') return a.keyword.localeCompare(b.keyword) * mult;
    if (sortBy === 'intent') return a.intent.localeCompare(b.intent) * mult;
    if (sortBy === 'opportunityType') return a.opportunityType.localeCompare(b.opportunityType) * mult;
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
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Plan Editorial SEO ({plan.length} contenidos)
        </h3>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader col="keyword" label="Keyword" />
              <SortHeader col="intent" label="Intención" />
              <SortHeader col="opportunityType" label="Tipo" />
              <SortHeader col="volume" label="Vol." />
              <SortHeader col="difficulty" label="KD" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título Propuesto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((row, i) => {
              const intentInfo = INTENT_LABELS[row.intent] || INTENT_LABELS.informational;
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                    {row.keyword}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${intentInfo.class}`}>{intentInfo.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {TYPE_LABELS[row.opportunityType] || row.opportunityType}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-medium">
                    {(row.volume || 0).toLocaleString('es')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.difficulty || 0}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[250px] truncate">
                    {row.title}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectArticle(i)}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Ver esquema
                    </button>
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
