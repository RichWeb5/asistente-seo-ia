'use client';

import { Globe, ChevronDown } from 'lucide-react';

export default function SiteSelector({ sites, selectedSite, onSelect, loading }) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-500 text-sm">
          No se encontraron sitios en tu cuenta de Search Console.
          Verifica que tengas propiedades verificadas.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Globe className="w-4 h-4 inline mr-1" />
        Selecciona un sitio
      </label>
      <div className="relative">
        <select
          value={selectedSite || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">— Elige un sitio —</option>
          {sites.map((site) => (
            <option key={site.siteUrl} value={site.siteUrl}>
              {site.siteUrl}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
