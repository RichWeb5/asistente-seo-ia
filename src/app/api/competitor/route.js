import { protectApiRoute } from '@/lib/security/api-guard';
import { sanitizeDomain, sanitizeLanguageCode, sanitizeInt } from '@/lib/security/sanitize';
import {
  getDomainKeywords,
  getDomainPages,
  getKeywordsIntersection,
  getCompetitorGap,
} from '@/services/dataforseo';

export async function POST(request) {
  const guard = await protectApiRoute(request, { limiterType: 'dataforseo' });
  if (guard instanceof Response) return guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const competitorDomain = sanitizeDomain(body.competitorDomain);
  const userDomain = body.userDomain ? sanitizeDomain(body.userDomain) : '';
  const language = sanitizeLanguageCode(body.language);
  const location = sanitizeInt(body.location, 1, 999999, 2724);

  if (!competitorDomain) {
    return Response.json({ error: 'Se requiere un dominio de competidor válido' }, { status: 400 });
  }

  try {
    const promises = [
      getDomainKeywords(competitorDomain, language, location),
      getDomainPages(competitorDomain, language, location),
    ];

    if (userDomain) {
      promises.push(
        getKeywordsIntersection(userDomain, competitorDomain, language, location),
        getCompetitorGap(userDomain, competitorDomain, language, location),
      );
    }

    const results = await Promise.all(promises);

    const competitorKeywords = results[0] || [];
    const competitorPages = results[1] || [];
    const sharedKeywords = results[2] || [];
    const gapKeywords = results[3] || [];

    const summary = {
      totalCompetitorKeywords: competitorKeywords.length,
      totalCompetitorPages: competitorPages.length,
      totalShared: sharedKeywords.length,
      totalGaps: gapKeywords.length,
      avgCompetitorPosition:
        competitorKeywords.length > 0
          ? Math.round(
              (competitorKeywords.reduce((sum, k) => sum + k.position, 0) /
                competitorKeywords.length) *
                10
            ) / 10
          : 0,
    };

    return Response.json({
      competitorKeywords,
      competitorPages,
      sharedKeywords,
      gapKeywords,
      summary,
    });
  } catch (error) {
    console.error('Error en análisis de competencia:', error.message);
    return Response.json({ error: 'Error al analizar competidor' }, { status: 500 });
  }
}
