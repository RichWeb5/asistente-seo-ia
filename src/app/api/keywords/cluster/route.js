import { protectApiRoute } from '@/lib/security/api-guard';
import { sanitizeKeyword } from '@/lib/security/sanitize';

export async function POST(request) {
  const guard = await protectApiRoute(request);
  if (guard instanceof Response) return guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { keywords } = body;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return Response.json({ error: 'Se requiere un array de keywords' }, { status: 400 });
  }

  // Limit array size to prevent abuse
  if (keywords.length > 500) {
    return Response.json({ error: 'Máximo 500 keywords por solicitud' }, { status: 400 });
  }

  try {
    // Sanitize each keyword
    const sanitizedKeywords = keywords.map((kw) => {
      if (typeof kw === 'string') {
        return { keyword: sanitizeKeyword(kw), intent: 'informational', volume: 0, difficulty: 0, competition: 0 };
      }
      return {
        ...kw,
        keyword: sanitizeKeyword(kw.keyword || ''),
      };
    }).filter((kw) => kw.keyword);

    // Agrupar por intención
    const groups = {};
    sanitizedKeywords.forEach((kw) => {
      const intent = kw.intent || 'informational';
      if (!groups[intent]) groups[intent] = [];
      groups[intent].push(kw);
    });

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

    const longTailOpportunities = sanitizedKeywords.filter((kw) => {
      const wordCount = kw.keyword.split(/\s+/).length;
      return wordCount >= 3 && (kw.competition || 0) < 0.5 && (kw.volume || 0) > 10;
    });

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
