'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const LOCATIONS = [
  { code: 2724, label: 'España' },
  { code: 2484, label: 'México' },
  { code: 2032, label: 'Argentina' },
  { code: 2152, label: 'Chile' },
  { code: 2170, label: 'Colombia' },
  { code: 2604, label: 'Perú' },
];

export default function KeywordForm({ onSearch, loading }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState(2724);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim() || loading) return;
    onSearch({ keyword: keyword.trim(), language: 'es', location });
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Investigación de Palabras Clave
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Escribe una palabra semilla..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input-field pl-9"
            disabled={loading}
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(Number(e.target.value))}
          className="input-field sm:w-40"
          disabled={loading}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Investigar
            </>
          )}
        </button>
      </form>
    </div>
  );
}
