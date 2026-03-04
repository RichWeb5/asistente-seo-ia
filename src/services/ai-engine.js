/**
 * Motor IA de clasificación y generación de contenido SEO.
 * Versión rule-based, preparada para swap a LLM (OpenAI/Claude).
 */

// Patrones de intención en español
const TRANSACTIONAL_PATTERNS = /comprar|precio|barato|oferta|descuento|tienda|donde comprar|costo|cotizar|envío|envio|pedido|orden|suscripción|suscripcion|contratar/i;
const COMMERCIAL_PATTERNS = /mejor|mejores|comparar|comparativa|vs|review|reseña|opiniones|top \d|ranking|cual elegir|cuál elegir|recomendado|alternativas/i;
const NAVIGATIONAL_PATTERNS = /login|iniciar sesión|iniciar sesion|página oficial|pagina oficial|contacto|teléfono|telefono|dirección|direccion|horario|ubicación|ubicacion/i;

/**
 * Clasifica la intención de búsqueda de una keyword.
 */
export function classifyIntent(keyword) {
  const k = keyword.toLowerCase().trim();
  if (TRANSACTIONAL_PATTERNS.test(k)) return 'transactional';
  if (COMMERCIAL_PATTERNS.test(k)) return 'commercial';
  if (NAVIGATIONAL_PATTERNS.test(k)) return 'navigational';
  return 'informational';
}

/**
 * Detecta el tipo de oportunidad de contenido.
 */
export function detectOpportunityType(keyword, intent, volume) {
  if (intent === 'informational') return 'blog';
  if (intent === 'transactional') return volume > 1000 ? 'landing_page' : 'category';
  if (intent === 'commercial') return 'comparison_page';
  return 'blog';
}

/**
 * Genera un título optimizado para SEO.
 */
function generateTitle(keyword, intent) {
  const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  const year = new Date().getFullYear();

  switch (intent) {
    case 'transactional':
      return `${capitalized} - Mejores Precios y Ofertas ${year}`;
    case 'commercial':
      return `${capitalized}: Guía Comparativa y Opiniones ${year}`;
    case 'navigational':
      return `${capitalized} - Información Oficial y Contacto`;
    default:
      return `${capitalized}: Guía Completa ${year}`;
  }
}

/**
 * Genera una meta descripción optimizada.
 */
function generateMetaDescription(keyword, intent) {
  const k = keyword.toLowerCase();

  switch (intent) {
    case 'transactional':
      return `Descubre las mejores ofertas de ${k}. Compara precios, lee opiniones y encuentra la mejor opción. Envío rápido y garantía incluida.`;
    case 'commercial':
      return `Comparativa completa de ${k}. Analizamos las mejores opciones, precios y características para ayudarte a elegir la mejor alternativa.`;
    case 'navigational':
      return `Encuentra toda la información sobre ${k}. Datos de contacto, ubicación, horarios y servicios disponibles actualizados.`;
    default:
      return `Todo lo que necesitas saber sobre ${k}. Guía completa con consejos prácticos, ejemplos y respuestas a las preguntas más frecuentes.`;
  }
}

/**
 * Genera la estructura de headings H1/H2/H3.
 */
function generateHeadings(keyword, relatedKeywords, intent) {
  const k = keyword.toLowerCase();
  const related = relatedKeywords.slice(0, 6);

  const h1 = generateTitle(keyword, intent);
  let h2s = [];
  let h3Map = {};

  switch (intent) {
    case 'transactional':
      h2s = [
        `¿Por qué elegir ${k}?`,
        `Mejores opciones de ${k}`,
        `Comparativa de precios`,
        `¿Dónde comprar ${k}?`,
        `Opiniones de clientes`,
        'Preguntas frecuentes',
      ];
      h3Map = {
        [`Mejores opciones de ${k}`]: related.slice(0, 3).map((r) => r.keyword || r),
        'Comparativa de precios': ['Rango de precios', 'Relación calidad-precio', 'Ofertas actuales'],
      };
      break;
    case 'commercial':
      h2s = [
        `¿Qué es ${k}?`,
        `Top opciones de ${k}`,
        'Tabla comparativa',
        'Pros y contras',
        '¿Cuál es la mejor opción?',
        'Preguntas frecuentes',
      ];
      h3Map = {
        [`Top opciones de ${k}`]: related.slice(0, 3).map((r) => r.keyword || r),
        'Pros y contras': ['Ventajas principales', 'Desventajas a considerar'],
      };
      break;
    default:
      h2s = [
        `¿Qué es ${k}?`,
        `Beneficios de ${k}`,
        `Cómo funciona ${k}`,
        'Consejos prácticos',
        'Errores comunes a evitar',
        'Preguntas frecuentes',
      ];
      h3Map = {
        'Consejos prácticos': related.slice(0, 3).map((r) => r.keyword || r),
        'Errores comunes a evitar': ['Error #1', 'Error #2', 'Error #3'],
      };
  }

  return { h1, h2s, h3Map };
}

/**
 * Extrae términos semánticos relacionados.
 */
function extractSemanticTerms(keyword, relatedKeywords) {
  const words = new Set();
  const allText = [keyword, ...relatedKeywords.map((r) => r.keyword || r)].join(' ');
  const tokens = allText.toLowerCase().split(/\s+/);

  tokens.forEach((token) => {
    if (token.length > 3) words.add(token);
  });

  return [...words].slice(0, 15);
}

/**
 * Genera preguntas frecuentes relevantes.
 */
function generateFAQs(keyword, intent) {
  const k = keyword.toLowerCase();

  const baseFAQs = [
    { question: `¿Qué es ${k}?`, answer: `${k} se refiere a...` },
    { question: `¿Cuánto cuesta ${k}?`, answer: `El precio de ${k} varía según...` },
    { question: `¿Cómo elegir el mejor ${k}?`, answer: `Para elegir el mejor ${k}, considera...` },
  ];

  const intentFAQs = {
    transactional: [
      { question: `¿Dónde comprar ${k} al mejor precio?`, answer: `Las mejores opciones para comprar ${k} son...` },
      { question: `¿Cuál es el envío de ${k}?`, answer: `Los tiempos de envío de ${k} suelen ser...` },
    ],
    commercial: [
      { question: `¿Cuál es el mejor ${k}?`, answer: `Según nuestro análisis, el mejor ${k} es...` },
      { question: `¿Vale la pena ${k}?`, answer: `${k} vale la pena si...` },
    ],
    informational: [
      { question: `¿Cómo funciona ${k}?`, answer: `${k} funciona mediante...` },
      { question: `¿Cuáles son los beneficios de ${k}?`, answer: `Los principales beneficios de ${k} incluyen...` },
    ],
    navigational: [
      { question: `¿Cómo contactar con ${k}?`, answer: `Puedes contactar con ${k} a través de...` },
    ],
  };

  return [...baseFAQs, ...(intentFAQs[intent] || [])];
}

/**
 * Genera sugerencias de enlazado interno.
 */
function generateLinkingSuggestions(keyword, intent, opportunityType) {
  const suggestions = [];

  if (intent === 'informational') {
    suggestions.push(
      { type: 'related_guide', text: `Enlazar a guía relacionada sobre temas complementarios` },
      { type: 'product_page', text: `Enlazar a página de producto/servicio relevante` },
      { type: 'category', text: `Enlazar a la categoría principal del tema` },
    );
  } else if (intent === 'transactional') {
    suggestions.push(
      { type: 'comparison', text: `Enlazar a comparativa de alternativas` },
      { type: 'guide', text: `Enlazar a guía de compra` },
      { type: 'reviews', text: `Enlazar a opiniones y reseñas` },
    );
  } else if (intent === 'commercial') {
    suggestions.push(
      { type: 'product_page', text: `Enlazar a páginas de producto individuales` },
      { type: 'buying_guide', text: `Enlazar a guía de compra detallada` },
      { type: 'blog', text: `Enlazar a artículos informativos relacionados` },
    );
  }

  suggestions.push(
    { type: 'home', text: `Enlazar desde la página de inicio si es contenido importante` },
    { type: 'sitemap', text: `Asegurar inclusión en el sitemap XML` },
  );

  return suggestions;
}

/**
 * Genera el esquema editorial completo para una keyword.
 */
export function generateArticleOutline(keyword, relatedKeywords = [], intent = null) {
  const detectedIntent = intent || classifyIntent(keyword);
  const opportunityType = detectOpportunityType(keyword, detectedIntent, 0);

  return {
    keyword,
    intent: detectedIntent,
    opportunityType,
    title: generateTitle(keyword, detectedIntent),
    metaDescription: generateMetaDescription(keyword, detectedIntent),
    headings: generateHeadings(keyword, relatedKeywords, detectedIntent),
    semanticFocus: extractSemanticTerms(keyword, relatedKeywords),
    faqs: generateFAQs(keyword, detectedIntent),
    internalLinking: generateLinkingSuggestions(keyword, detectedIntent, opportunityType),
  };
}

/**
 * Genera un plan editorial completo para un conjunto de keywords.
 */
export function generateEditorialPlan(keywords) {
  // Clasificar cada keyword
  const classified = keywords.map((kw) => {
    const keyword = typeof kw === 'string' ? kw : kw.keyword;
    const volume = typeof kw === 'string' ? 0 : (kw.volume || 0);
    const difficulty = typeof kw === 'string' ? 0 : (kw.difficulty || 0);
    const intent = classifyIntent(keyword);
    const opportunityType = detectOpportunityType(keyword, intent, volume);

    return { keyword, volume, difficulty, intent, opportunityType };
  });

  // Agrupar por intención
  const byIntent = { informational: 0, transactional: 0, commercial: 0, navigational: 0 };
  const byType = { blog: 0, landing_page: 0, category: 0, comparison_page: 0 };

  classified.forEach((kw) => {
    byIntent[kw.intent] = (byIntent[kw.intent] || 0) + 1;
    byType[kw.opportunityType] = (byType[kw.opportunityType] || 0) + 1;
  });

  // Generar outline para cada keyword
  const plan = classified.map((kw) => {
    const related = classified
      .filter((r) => r.keyword !== kw.keyword && r.intent === kw.intent)
      .slice(0, 5);

    const outline = generateArticleOutline(kw.keyword, related, kw.intent);

    return {
      ...outline,
      volume: kw.volume,
      difficulty: kw.difficulty,
    };
  });

  return {
    summary: {
      total: classified.length,
      byIntent,
      byType,
    },
    plan,
  };
}
