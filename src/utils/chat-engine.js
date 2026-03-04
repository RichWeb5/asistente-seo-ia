/**
 * Motor de chat SEO.
 * Responde preguntas sobre SEO basándose en los datos del sitio y conocimiento SEO general.
 */

const SEO_KNOWLEDGE = {
  'meta descripción': 'La meta descripción es un fragmento de texto (150-160 caracteres) que aparece en los resultados de búsqueda. Debe ser única para cada página, incluir la palabra clave principal y tener un llamado a la acción.',
  'title tag': 'El title tag es el elemento más importante del SEO on-page. Debe tener 50-60 caracteres, incluir la palabra clave principal al inicio y ser único para cada página.',
  'h1': 'Cada página debe tener un solo H1 que describa claramente el tema principal. Debe incluir la palabra clave principal de forma natural.',
  'velocidad': 'La velocidad de carga es un factor de ranking. Usa PageSpeed Insights para medir el rendimiento. Optimiza imágenes, usa caché del navegador y minimiza CSS/JS.',
  'mobile': 'Google usa mobile-first indexing, lo que significa que la versión móvil de tu sitio es la principal. Asegúrate de que sea responsiva y fácil de navegar en dispositivos móviles.',
  'enlaces internos': 'Los enlaces internos ayudan a distribuir la autoridad entre páginas y facilitan la navegación. Enlaza desde páginas fuertes hacia páginas que quieres posicionar.',
  'sitemap': 'El sitemap XML ayuda a Google a descubrir todas las páginas de tu sitio. Debe estar actualizado y enviado a Search Console.',
  'robots.txt': 'El archivo robots.txt controla qué páginas pueden rastrear los bots. Asegúrate de no bloquear páginas importantes.',
  'canonical': 'La etiqueta canonical indica la URL preferida cuando hay contenido duplicado. Úsala para evitar problemas de contenido duplicado.',
  'schema': 'Los datos estructurados (Schema.org) ayudan a Google a entender mejor tu contenido y pueden generar rich snippets en los resultados.',
  'backlinks': 'Los backlinks (enlaces desde otros sitios) son un factor de ranking importante. Busca enlaces de sitios relevantes y con autoridad en tu nicho.',
  'contenido': 'El contenido debe ser original, útil y responder a la intención de búsqueda del usuario. Actualiza regularmente el contenido antiguo.',
  'ctr': 'El CTR (Click Through Rate) es el porcentaje de personas que hacen clic en tu resultado. Un CTR bajo con muchas impresiones indica que necesitas mejorar el título y la meta descripción.',
  'posición': 'La posición promedio indica dónde apareces en los resultados. Posiciones 1-10 = primera página. El objetivo es estar en el top 3 para tus keywords principales.',
  'keywords': 'Las keywords o palabras clave son los términos que los usuarios buscan. Investiga las keywords relevantes para tu negocio y optimiza tu contenido para ellas.',
  'core web vitals': 'Los Core Web Vitals (LCP, FID, CLS) son métricas de experiencia de usuario que Google usa como factores de ranking. Mídelos y optimízalos.',
};

/**
 * Procesa una pregunta del usuario y genera una respuesta contextual.
 * @param {string} question - Pregunta del usuario en español
 * @param {object} siteData - Datos del sitio (métricas, consultas, páginas)
 * @returns {string} Respuesta en español
 */
export function processQuestion(question, siteData = {}) {
  const q = question.toLowerCase().trim();

  // Buscar en la base de conocimiento SEO
  for (const [topic, answer] of Object.entries(SEO_KNOWLEDGE)) {
    if (q.includes(topic)) {
      let response = answer;
      // Agregar contexto del sitio si hay datos disponibles
      if (siteData.summary) {
        response += `\n\nPara tu sitio: tienes ${siteData.summary.totalClicks} clics y ${siteData.summary.totalImpressions} impresiones en los últimos 30 días.`;
      }
      return response;
    }
  }

  // Respuestas basadas en datos del sitio
  if (q.includes('cómo voy') || q.includes('resumen') || q.includes('rendimiento')) {
    if (siteData.summary) {
      const s = siteData.summary;
      return `Resumen de tu sitio en los últimos 30 días:\n` +
        `- Clics totales: ${s.totalClicks.toLocaleString('es')}\n` +
        `- Impresiones totales: ${s.totalImpressions.toLocaleString('es')}\n` +
        `- CTR promedio: ${(s.avgCtr * 100).toFixed(2)}%\n` +
        `- Posición promedio: ${s.avgPosition.toFixed(1)}\n\n` +
        `${s.avgCtr < 0.03 ? 'Tu CTR está bajo. Considera mejorar títulos y meta descripciones.' : 'Tu CTR es aceptable. Sigue optimizando para mantenerlo.'}`;
    }
    return 'No tengo datos de tu sitio cargados. Selecciona un sitio en el panel para ver tu rendimiento.';
  }

  if (q.includes('mejorar') || q.includes('optimizar') || q.includes('subir')) {
    return 'Para mejorar tu SEO, te recomiendo:\n\n' +
      '1. **Optimiza títulos y meta descripciones**: Haz que sean atractivos y relevantes\n' +
      '2. **Mejora el contenido**: Asegúrate de que responda a la intención de búsqueda\n' +
      '3. **Velocidad de carga**: Usa PageSpeed Insights y optimiza\n' +
      '4. **Enlaces internos**: Conecta páginas relacionadas entre sí\n' +
      '5. **Mobile-first**: Verifica que todo funcione bien en móvil\n' +
      '6. **Datos estructurados**: Implementa Schema.org cuando sea relevante\n\n' +
      'Revisa las recomendaciones del panel para ver acciones específicas para tu sitio.';
  }

  if (q.includes('consulta') || q.includes('query') || q.includes('palabra clave') || q.includes('keyword')) {
    if (siteData.topQueries && siteData.topQueries.length > 0) {
      const top5 = siteData.topQueries.slice(0, 5);
      let response = 'Tus consultas principales son:\n\n';
      top5.forEach((tq, i) => {
        response += `${i + 1}. "${tq.keys[0]}" - ${tq.clicks} clics, ${tq.impressions} impresiones, posición ${tq.position.toFixed(1)}\n`;
      });
      return response;
    }
    return 'Selecciona un sitio para ver tus consultas principales.';
  }

  if (q.includes('página') || q.includes('pagina') || q.includes('url')) {
    if (siteData.topPages && siteData.topPages.length > 0) {
      const top5 = siteData.topPages.slice(0, 5);
      let response = 'Tus páginas con mejor rendimiento:\n\n';
      top5.forEach((tp, i) => {
        response += `${i + 1}. ${tp.keys[0]}\n   ${tp.clicks} clics, ${tp.impressions} impresiones\n`;
      });
      return response;
    }
    return 'Selecciona un sitio para ver tus páginas principales.';
  }

  // Respuesta por defecto
  return 'Puedo ayudarte con temas de SEO. Prueba preguntándome sobre:\n\n' +
    '- "¿Cómo voy?" - Resumen de rendimiento\n' +
    '- "¿Cómo mejorar mi SEO?" - Consejos generales\n' +
    '- "Meta descripción" - Qué es y cómo optimizarla\n' +
    '- "Mis consultas" - Ver tus keywords principales\n' +
    '- "Mis páginas" - Ver tus URLs principales\n' +
    '- "Velocidad" - Consejos de velocidad de carga\n' +
    '- "Core Web Vitals" - Métricas de experiencia de usuario\n' +
    '- Y mucho más sobre SEO técnico y on-page';
}
