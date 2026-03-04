'use client';

import { useState } from 'react';
import { FileEdit, Upload, Loader2 } from 'lucide-react';

export default function ContentDashboard({ onGenerate, loading, hasResearchData }) {
  const [inputMode, setInputMode] = useState(hasResearchData ? 'from_research' : 'paste');
  const [pastedText, setPastedText] = useState('');

  const handleGenerate = () => {
    if (inputMode === 'paste') {
      const keywords = pastedText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((keyword) => ({ keyword, volume: 0, difficulty: 0 }));

      if (keywords.length === 0) return;
      onGenerate(keywords);
    } else {
      onGenerate(null); // Signal to use cached data
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Generador de Contenido IA
      </h2>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setInputMode('paste')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'paste'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pegar Keywords
        </button>
        <button
          onClick={() => setInputMode('from_research')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'from_research'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          disabled={!hasResearchData}
        >
          Desde Investigación {hasResearchData && '✓'}
        </button>
      </div>

      {inputMode === 'paste' ? (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Escribe o pega las palabras clave, una por línea..."
            rows={6}
            className="input-field resize-y"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Escribe una keyword por línea. Ejemplo: zapatos de cuero, botas de invierno...
          </p>
        </div>
      ) : (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-600" />
            <p className="text-sm text-primary-700">
              Se usarán las keywords de tu última investigación.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        className="btn-primary flex items-center gap-2 mt-4"
        disabled={loading || (inputMode === 'paste' && !pastedText.trim())}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando plan...
          </>
        ) : (
          <>
            <FileEdit className="w-4 h-4" />
            Generar Plan Editorial
          </>
        )}
      </button>
    </div>
  );
}
