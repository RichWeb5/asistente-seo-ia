/**
 * Motor de análisis y recomendaciones SEO.
 * Genera sugerencias priorizadas basadas en datos reales de Search Console.
 */

/**
 * Genera recomendaciones SEO basadas en datos de rendimiento.
 * @param {Array} queries - Datos de consultas (query, clicks, impressions, ctr, position)
 * @param {Array} pages - Datos de páginas
 * @returns {Array} Lista de recomendaciones priorizadas
 */
export function generateRecommendations(queries = [], pages = []) {
  const recommendations = [];

  // 1. Consultas con muchas impresiones pero pocos clics (CTR bajo)
  const lowCtrHighImpressions = queries
    .filter((q) => q.impressions > 50 && q.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);

  lowCtrHighImpressions.forEach((q) => {
    recommendations.push({
      type: 'ctr_bajo',
      priority: 'alta',
      title: `Mejorar CTR para "${q.keys[0]}"`,
      description: `Esta consulta tiene ${q.impressions} impresiones pero solo ${q.clicks} clics (CTR: ${(q.ctr * 100).toFixed(1)}%). Mejora el título y la meta descripción de la página correspondiente para hacerla más atractiva.`,
      metric: { impressions: q.impressions, clicks: q.clicks, ctr: q.ctr },
      actions: [
        'Reescribir el título (title tag) para que sea más llamativo y relevante',
        'Mejorar la meta descripción con un llamado a la acción claro',
        'Considerar agregar datos estructurados (schema markup) para rich snippets',
      ],
    });
  });

  // 2. Consultas sin clics pero con impresiones
  const zeroClicks = queries
    .filter((q) => q.clicks === 0 && q.impressions > 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);

  zeroClicks.forEach((q) => {
    recommendations.push({
      type: 'sin_clics',
      priority: 'alta',
      title: `Sin clics para "${q.keys[0]}"`,
      description: `Apareces ${q.impressions} veces en búsquedas para "${q.keys[0]}" pero nadie hace clic. Tu posición promedio es ${q.position.toFixed(1)}.`,
      metric: { impressions: q.impressions, position: q.position },
      actions: [
        q.position > 10
          ? 'Mejorar el contenido para subir de posición (estás fuera de la primera página)'
          : 'Optimizar título y meta descripción para diferenciarte de la competencia',
        'Verificar que la URL sea descriptiva y amigable',
        'Evaluar si el contenido responde a la intención de búsqueda del usuario',
      ],
    });
  });

  // 3. Páginas con posición cercana a top 10 (oportunidades de mejora rápida)
  const almostTop10 = queries
    .filter((q) => q.position >= 8 && q.position <= 20 && q.impressions > 30)
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);

  almostTop10.forEach((q) => {
    recommendations.push({
      type: 'casi_top10',
      priority: 'media',
      title: `Casi en top 10: "${q.keys[0]}"`,
      description: `Estás en posición ${q.position.toFixed(1)} para "${q.keys[0]}". Con pequeñas mejoras podrías entrar en la primera página.`,
      metric: { position: q.position, impressions: q.impressions },
      actions: [
        'Ampliar y mejorar el contenido existente sobre este tema',
        'Conseguir enlaces internos desde otras páginas relevantes de tu sitio',
        'Optimizar la velocidad de carga de la página',
        'Agregar contenido multimedia (imágenes, videos) relevante',
      ],
    });
  });

  // 4. Páginas con caída de rendimiento (si hay datos suficientes)
  const highImpLowClick = pages
    .filter((p) => p.impressions > 100 && p.ctr < 0.01)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 3);

  highImpLowClick.forEach((p) => {
    const url = p.keys[0];
    const shortUrl = url.length > 60 ? url.substring(0, 57) + '...' : url;
    recommendations.push({
      type: 'pagina_bajo_rendimiento',
      priority: 'media',
      title: `Página con bajo rendimiento: ${shortUrl}`,
      description: `Esta página tiene ${p.impressions} impresiones pero un CTR de solo ${(p.ctr * 100).toFixed(2)}%. Necesita optimización.`,
      metric: { impressions: p.impressions, clicks: p.clicks, ctr: p.ctr },
      actions: [
        'Revisar y actualizar el contenido de la página',
        'Asegurar que el título sea relevante para las consultas que la muestran',
        'Mejorar la estructura del contenido (encabezados H1, H2, H3)',
        'Verificar que la página cargue rápido y sea mobile-friendly',
      ],
    });
  });

  // Ordenar por prioridad
  const priorityOrder = { alta: 0, media: 1, baja: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Genera un resumen general de métricas SEO.
 */
export function generateSummary(dailyData = []) {
  if (dailyData.length === 0) {
    return { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 };
  }

  const totalClicks = dailyData.reduce((sum, d) => sum + d.clicks, 0);
  const totalImpressions = dailyData.reduce((sum, d) => sum + d.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    dailyData.reduce((sum, d) => sum + d.position, 0) / dailyData.length;

  return { totalClicks, totalImpressions, avgCtr, avgPosition };
}
