import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { getDailyMetrics, getTopQueries, getTopPages, getDeviceMetrics } from '@/utils/google/gsc';
import { generateSummary } from '@/utils/seo-analyzer';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get('siteUrl');

  if (!siteUrl) {
    return Response.json({ error: 'Se requiere siteUrl' }, { status: 400 });
  }

  // Calcular fechas: últimos 30 días
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const [daily, queries, pages, devices] = await Promise.all([
      getDailyMetrics(session.accessToken, siteUrl, startStr, endStr),
      getTopQueries(session.accessToken, siteUrl, startStr, endStr),
      getTopPages(session.accessToken, siteUrl, startStr, endStr),
      getDeviceMetrics(session.accessToken, siteUrl, startStr, endStr),
    ]);

    const summary = generateSummary(daily);

    return Response.json({
      summary,
      daily,
      queries: queries.slice(0, 50),
      pages: pages.slice(0, 50),
      devices,
    });
  } catch (error) {
    console.error('Error al obtener métricas:', error.message);
    return Response.json(
      { error: 'Error al obtener métricas de Search Console' },
      { status: 500 }
    );
  }
}
