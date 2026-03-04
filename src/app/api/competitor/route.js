import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import {
  getDomainKeywords,
  getDomainPages,
  getKeywordsIntersection,
  getCompetitorGap,
} from '@/services/dataforseo';

// TODO: Rate limiting / credits check

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { competitorDomain, userDomain, language = 'es', location = 2724 } = body;

    if (!competitorDomain) {
      return Response.json({ error: 'Se requiere el dominio del competidor' }, { status: 400 });
    }

    // Ejecutar todas las consultas en paralelo
    const promises = [
      getDomainKeywords(competitorDomain, language, location),
      getDomainPages(competitorDomain, language, location),
    ];

    // Solo buscar intersección y gaps si hay dominio del usuario
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

    // Calcular resumen
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
