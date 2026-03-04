'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import SiteSelector from '@/components/SiteSelector';
import MetricCards from '@/components/MetricCards';
import PerformanceChart from '@/components/PerformanceChart';
import QueriesTable from '@/components/QueriesTable';
import PagesTable from '@/components/PagesTable';
import Recommendations from '@/components/Recommendations';
import ChatPanel from '@/components/ChatPanel';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Cargar sitios al iniciar
  useEffect(() => {
    if (!session?.accessToken) return;

    async function fetchSites() {
      try {
        const res = await fetch('/api/sites');
        const data = await res.json();
        setSites(data.sites || []);
      } catch (error) {
        console.error('Error al cargar sitios:', error);
      } finally {
        setLoadingSites(false);
      }
    }

    fetchSites();
  }, [session]);

  // Cargar métricas y recomendaciones al seleccionar un sitio
  const loadSiteData = useCallback(async (siteUrl) => {
    setSelectedSite(siteUrl);
    if (!siteUrl) {
      setMetrics(null);
      setRecommendations([]);
      return;
    }

    setLoadingMetrics(true);
    setLoadingRecs(true);

    const encodedSite = encodeURIComponent(siteUrl);

    // Cargar métricas y recomendaciones en paralelo
    const metricsPromise = fetch(`/api/metrics?siteUrl=${encodedSite}`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoadingMetrics(false);
      })
      .catch(() => setLoadingMetrics(false));

    const recsPromise = fetch(`/api/recommendations?siteUrl=${encodedSite}`)
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setLoadingRecs(false);
      })
      .catch(() => setLoadingRecs(false));

    await Promise.all([metricsPromise, recsPromise]);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      {/* Selector de sitio */}
      <div className="mb-6">
        <SiteSelector
          sites={sites}
          selectedSite={selectedSite}
          onSelect={loadSiteData}
          loading={loadingSites}
        />
      </div>

      {/* Métricas principales */}
      {(selectedSite || loadingMetrics) && (
        <div className="mb-6">
          <MetricCards summary={metrics?.summary} loading={loadingMetrics} />
        </div>
      )}

      {/* Gráfico de rendimiento */}
      {(selectedSite || loadingMetrics) && (
        <div className="mb-6">
          <PerformanceChart data={metrics?.daily} loading={loadingMetrics} />
        </div>
      )}

      {/* Grid: Recomendaciones + Chat */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Recommendations recommendations={recommendations} loading={loadingRecs} />
        <ChatPanel siteUrl={selectedSite} />
      </div>

      {/* Tablas de consultas y páginas */}
      {(selectedSite || loadingMetrics) && (
        <div className="grid lg:grid-cols-2 gap-6">
          <QueriesTable data={metrics?.queries} loading={loadingMetrics} />
          <PagesTable data={metrics?.pages} loading={loadingMetrics} />
        </div>
      )}
    </>
  );
}
