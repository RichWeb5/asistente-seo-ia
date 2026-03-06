import { protectApiRoute, validateSiteOwnership } from '@/lib/security/api-guard';
import { sanitizeSiteUrl } from '@/lib/security/sanitize';
import { getDailyMetrics, getTopQueries, getTopPages, getDeviceMetrics } from '@/utils/google/gsc';
import { generateSummary } from '@/utils/seo-analyzer';

export async function GET(request) {
  const guard = await protectApiRoute(request);
  if (guard instanceof Response) return guard;
  const { session } = guard;

  const { searchParams } = new URL(request.url);
  const siteUrl = sanitizeSiteUrl(searchParams.get('siteUrl'));

  if (!siteUrl) {
    return Response.json({ error: 'Se requiere un siteUrl válido' }, { status: 400 });
  }

  // Verify the user owns this site in Search Console
  const isOwner = await validateSiteOwnership(session.accessToken, siteUrl);
  if (!isOwner) {
    return Response.json({ error: 'No tienes acceso a este sitio' }, { status: 403 });
  }

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
