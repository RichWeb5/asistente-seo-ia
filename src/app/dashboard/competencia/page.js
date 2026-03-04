'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CompetitorForm from '@/components/competitor/CompetitorForm';
import CompetitorKeywords from '@/components/competitor/CompetitorKeywords';
import CompetitorPages from '@/components/competitor/CompetitorPages';
import SharedKeywords from '@/components/competitor/SharedKeywords';
import OpportunityMap from '@/components/competitor/OpportunityMap';

const TABS = [
  { id: 'keywords', label: 'Keywords' },
  { id: 'pages', label: 'Páginas' },
  { id: 'shared', label: 'Compartidas / Brechas' },
  { id: 'map', label: 'Mapa de Oportunidad' },
];

export default function CompetenciaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>}>
      <CompetenciaContent />
    </Suspense>
  );
}

function CompetenciaContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('keywords');
  const [error, setError] = useState('');

  const initialDomain = searchParams.get('domain') || '';

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  const handleAnalyze = async ({ competitorDomain, userDomain }) => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorDomain, userDomain }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Error al analizar competidor');
        return;
      }

      setData(result);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

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
      <CompetitorForm onAnalyze={handleAnalyze} loading={loading} initialDomain={initialDomain} />

      {error && (
        <div className="card !bg-red-50 !border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary-600">{data.summary?.totalCompetitorKeywords || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Keywords Competidor</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-blue-600">{data.summary?.totalCompetitorPages || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Páginas Top</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">{data.summary?.totalShared || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Compartidas</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-red-600">{data.summary?.totalGaps || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Brechas</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'keywords' && (
            <CompetitorKeywords data={data.competitorKeywords} />
          )}
          {activeTab === 'pages' && (
            <CompetitorPages data={data.competitorPages} />
          )}
          {activeTab === 'shared' && (
            <SharedKeywords sharedData={data.sharedKeywords} gapData={data.gapKeywords} />
          )}
          {activeTab === 'map' && (
            <OpportunityMap gapKeywords={data.gapKeywords} />
          )}
        </>
      )}
    </div>
  );
}
