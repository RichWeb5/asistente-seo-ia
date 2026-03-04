'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ContentDashboard from '@/components/content-engine/ContentDashboard';
import IntentChart from '@/components/content-engine/IntentChart';
import OpportunityList from '@/components/content-engine/OpportunityList';
import EditorialPlan from '@/components/content-engine/EditorialPlan';
import ArticleOutline from '@/components/content-engine/ArticleOutline';

export default function ContenidoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>}>
      <ContenidoContent />
    </Suspense>
  );
}

function ContenidoContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [error, setError] = useState('');
  const [hasResearchData, setHasResearchData] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  // Verificar si hay datos de investigación en localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem('seo_keywords_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setHasResearchData(Array.isArray(parsed) && parsed.length > 0);
      }
    } catch {
      setHasResearchData(false);
    }
  }, []);

  // Auto-generar si viene de investigación
  useEffect(() => {
    if (searchParams.get('source') === 'research' && hasResearchData && !plan && !loading) {
      handleGenerate(null);
    }
  }, [hasResearchData, searchParams]);

  const handleGenerate = async (keywords) => {
    setLoading(true);
    setError('');
    setPlan(null);
    setSelectedArticle(null);

    try {
      let keywordsToSend = keywords;

      // Si no se pasan keywords, usar las del cache
      if (!keywordsToSend) {
        try {
          const cached = localStorage.getItem('seo_keywords_cache');
          if (cached) {
            keywordsToSend = JSON.parse(cached);
          }
        } catch {
          setError('No se encontraron keywords guardadas');
          setLoading(false);
          return;
        }
      }

      if (!keywordsToSend || keywordsToSend.length === 0) {
        setError('No hay keywords para generar el plan');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/content-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywordsToSend }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Error al generar plan');
        return;
      }

      setPlan(result);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArticle = (index) => {
    setSelectedArticle(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* Esquema de artículo seleccionado */}
      {selectedArticle !== null && plan?.plan?.[selectedArticle] && (
        <ArticleOutline
          article={plan.plan[selectedArticle]}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      <ContentDashboard
        onGenerate={handleGenerate}
        loading={loading}
        hasResearchData={hasResearchData}
      />

      {error && (
        <div className="card !bg-red-50 !border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {plan && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary-600">{plan.summary?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total Keywords</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-blue-600">{plan.summary?.byType?.blog || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Blog Posts</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">{plan.summary?.byType?.landing_page || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Landing Pages</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-purple-600">
                {(plan.summary?.byType?.comparison_page || 0) + (plan.summary?.byType?.category || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Otros Contenidos</p>
            </div>
          </div>

          {/* Gráficos de distribución */}
          <IntentChart summary={plan.summary} />

          {/* Oportunidades agrupadas */}
          <OpportunityList plan={plan.plan} onSelectArticle={handleSelectArticle} />

          {/* Plan editorial completo */}
          <EditorialPlan plan={plan.plan} onSelectArticle={handleSelectArticle} />
        </>
      )}
    </div>
  );
}
