import { protectApiRoute, validateSiteOwnership } from '@/lib/security/api-guard';
import { sanitizeSiteUrl } from '@/lib/security/sanitize';
import { getTopQueries, getTopPages } from '@/utils/google/gsc';
import { generateRecommendations } from '@/utils/seo-analyzer';

export async function GET(request) {
  const guard = await protectApiRoute(request);
  if (guard instanceof Response) return guard;
  const { session } = guard;

  const { searchParams } = new URL(request.url);
  const siteUrl = sanitizeSiteUrl(searchParams.get('siteUrl'));

  if (!siteUrl) {
    return Response.json({ error: 'Se requiere un siteUrl válido' }, { status: 400 });
  }

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
    const [queries, pages] = await Promise.all([
      getTopQueries(session.accessToken, siteUrl, startStr, endStr),
      getTopPages(session.accessToken, siteUrl, startStr, endStr),
    ]);

    const recommendations = generateRecommendations(queries, pages);

    return Response.json({ recommendations });
  } catch (error) {
    console.error('Error al generar recomendaciones:', error.message);
    return Response.json(
      { error: 'Error al generar recomendaciones' },
      { status: 500 }
    );
  }
}
