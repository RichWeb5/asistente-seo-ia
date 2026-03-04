'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { List, Grid3X3 } from 'lucide-react';
import KeywordForm from '@/components/keyword-research/KeywordForm';
import KeywordFilters from '@/components/keyword-research/KeywordFilters';
import KeywordTable from '@/components/keyword-research/KeywordTable';
import KeywordClusters from '@/components/keyword-research/KeywordClusters';

export default function InvestigacionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [results, setResults] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [view, setView] = useState('table');
  const [filters, setFilters] = useState({
    intent: 'all',
    minVolume: 0,
    maxDifficulty: 100,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  const handleSearch = async ({ keyword, language, location }) => {
    setLoading(true);
    setError('');
    setResults(null);
    setClusters(null);

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, language, location }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al buscar keywords');
        return;
      }

      setResults(data.keywords || []);

      // Guardar en localStorage para el módulo de contenido
      localStorage.setItem('seo_keywords_cache', JSON.stringify(data.keywords || []));

      // Ejecutar clustering automáticamente
      if (data.keywords && data.keywords.length > 0) {
        setClusterLoading(true);
        try {
          const clusterRes = await fetch('/api/keywords/cluster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: data.keywords }),
          });
          const clusterData = await clusterRes.json();
          if (clusterRes.ok) {
            setClusters(clusterData);
          }
        } catch (err) {
          console.error('Error en clustering:', err);
        } finally {
          setClusterLoading(false);
        }
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKeywords = (selectedKeywords) => {
    localStorage.setItem('seo_keywords_cache', JSON.stringify(selectedKeywords));
    router.push('/dashboard/contenido?source=research');
  };

  // Aplicar filtros
  const filteredResults = results
    ? results.filter((kw) => {
        if (filters.intent !== 'all' && kw.intent !== filters.intent) return false;
        if ((kw.volume || 0) < filters.minVolume) return false;
        if ((kw.difficulty || 0) > filters.maxDifficulty) return false;
        return true;
      })
    : null;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      <KeywordForm onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="card !bg-red-50 !border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <KeywordFilters filters={filters} onChange={setFilters} />
            <div className="flex gap-1 ml-4">
              <button
                onClick={() => setView('table')}
                className={`p-2 rounded-lg ${view === 'table' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('clusters')}
                className={`p-2 rounded-lg ${view === 'clusters' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {view === 'table' ? (
            <KeywordTable data={filteredResults} onSelectKeywords={handleSelectKeywords} />
          ) : (
            <>
              {clusterLoading ? (
                <div className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                  ))}
                </div>
              ) : (
                <KeywordClusters
                  clusters={clusters?.clusters}
                  longTailOpportunities={clusters?.longTailOpportunities}
                />
              )}
            </>
          )}
        </>
      )}

      {results && results.length === 0 && !loading && (
        <div className="card text-center py-10">
          <p className="text-gray-500">No se encontraron resultados. Intenta con otra palabra clave.</p>
        </div>
      )}
    </div>
  );
}
