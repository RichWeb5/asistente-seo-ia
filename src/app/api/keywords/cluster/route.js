import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';

// TODO: Rate limiting / credits check

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return Response.json({ error: 'Se requiere un array de keywords' }, { status: 400 });
    }

    // Agrupar por intención
    const groups = {};
    keywords.forEach((kw) => {
      const intent = kw.intent || 'informational';
      if (!groups[intent]) groups[intent] = [];
      groups[intent].push(kw);
    });

    // Sub-agrupar por similitud semántica (n-gram overlap)
    const clusters = [];

    Object.entries(groups).forEach(([intent, kws]) => {
      const subClusters = clusterBySemanticSimilarity(kws);
      subClusters.forEach((cluster) => {
        const avgVolume = cluster.reduce((sum, k) => sum + (k.volume || 0), 0) / cluster.length;
        const avgDifficulty = cluster.reduce((sum, k) => sum + (k.difficulty || 0), 0) / cluster.length;

        clusters.push({
          name: cluster[0].keyword,
          intent,
          keywords: cluster,
          count: cluster.length,
          avgVolume: Math.round(avgVolume),
          avgDifficulty: Math.round(avgDifficulty),
        });
      });
    });

    // Detectar oportunidades long-tail
    const longTailOpportunities = keywords.filter((kw) => {
      const wordCount = kw.keyword.split(/\s+/).length;
      return wordCount >= 3 && (kw.competition || 0) < 0.5 && (kw.volume || 0) > 10;
    });

    // Ordenar clusters por volumen promedio
    clusters.sort((a, b) => b.avgVolume - a.avgVolume);

    return Response.json({
      clusters,
      longTailOpportunities,
      totalClusters: clusters.length,
    });
  } catch (error) {
    console.error('Error en clustering:', error.message);
    return Response.json({ error: 'Error al agrupar palabras clave' }, { status: 500 });
  }
}

/**
 * Agrupa keywords por similitud semántica usando n-gram overlap.
 */
function clusterBySemanticSimilarity(keywords) {
  if (keywords.length <= 1) return [keywords];

  const clusters = [];
  const assigned = new Set();

  for (let i = 0; i < keywords.length; i++) {
    if (assigned.has(i)) continue;

    const cluster = [keywords[i]];
    assigned.add(i);

    const wordsA = new Set(keywords[i].keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 2));

    for (let j = i + 1; j < keywords.length; j++) {
      if (assigned.has(j)) continue;

      const wordsB = new Set(keywords[j].keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 2));

      // Calcular overlap
      let overlap = 0;
      wordsA.forEach((w) => {
        if (wordsB.has(w)) overlap++;
      });

      const similarity = overlap / Math.max(wordsA.size, wordsB.size, 1);

      if (similarity >= 0.4) {
        cluster.push(keywords[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}
