'use client';

const INTENT_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'informational', label: 'Informacional' },
  { value: 'transactional', label: 'Transaccional' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'navigational', label: 'Navegacional' },
];

export default function KeywordFilters({ filters, onChange }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Filtro por intención */}
        <div className="flex gap-1 flex-wrap">
          {INTENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('intent', opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filters.intent === opt.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filtro por volumen mínimo */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Vol. mín:</label>
          <input
            type="number"
            min="0"
            value={filters.minVolume}
            onChange={(e) => updateFilter('minVolume', Number(e.target.value))}
            className="input-field w-24 text-xs"
          />
        </div>

        {/* Filtro por dificultad máxima */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">KD máx:</label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.maxDifficulty}
            onChange={(e) => updateFilter('maxDifficulty', Number(e.target.value))}
            className="input-field w-24 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
