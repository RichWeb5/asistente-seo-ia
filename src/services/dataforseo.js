const BASE_URL = 'https://api.dataforseo.com/v3';

function getAuthHeader() {
  const credentials = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
  ).toString('base64');
  return `Basic ${credentials}`;
}

async function apiRequest(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DataForSEO error ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.status_code !== 20000) {
    throw new Error(data.status_message || 'Error desconocido de DataForSEO');
  }

  return data;
}

/**
 * Obtiene ideas de palabras clave a partir de una palabra semilla.
 */
export async function getKeywordIdeas(keyword, language = 'es', locationCode = 2724) {
  const data = await apiRequest('/keywords_data/google_ads/keywords_for_keywords/live', [
    {
      keywords: [keyword],
      language_code: language,
      location_code: locationCode,
      include_seed_keyword: true,
      sort_by: 'search_volume',
    },
  ]);

  const results = data.tasks?.[0]?.result || [];
  return results.map((item) => ({
    keyword: item.keyword,
    volume: item.search_volume || 0,
    cpc: item.cpc || 0,
    competition: item.competition || 0,
    competitionLevel: item.competition_level || 'N/A',
    trend: item.monthly_searches || [],
    intent: item.keyword_info?.search_intent || null,
  }));
}

/**
 * Obtiene dificultad de palabras clave en bulk.
 */
export async function getKeywordDifficulty(keywords, language = 'es', locationCode = 2724) {
  const data = await apiRequest('/dataforseo_labs/google/bulk_keyword_difficulty/live', [
    {
      keywords,
      language_code: language,
      location_code: locationCode,
    },
  ]);

  const results = data.tasks?.[0]?.result || [];
  const difficultyMap = {};
  results.forEach((item) => {
    if (item.keyword) {
      difficultyMap[item.keyword] = item.keyword_difficulty || 0;
    }
  });
  return difficultyMap;
}

/**
 * Obtiene las palabras clave principales de un dominio competidor.
 */
export async function getDomainKeywords(domain, language = 'es', locationCode = 2724, limit = 100) {
  const data = await apiRequest('/dataforseo_labs/google/ranked_keywords/live', [
    {
      target: domain,
      language_code: language,
      location_code: locationCode,
      limit,
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    },
  ]);

  const results = data.tasks?.[0]?.result?.[0]?.items || [];
  return results.map((item) => ({
    keyword: item.keyword_data?.keyword || '',
    position: item.ranked_serp_element?.serp_item?.rank_group || 0,
    volume: item.keyword_data?.keyword_info?.search_volume || 0,
    cpc: item.keyword_data?.keyword_info?.cpc || 0,
    difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0,
    url: item.ranked_serp_element?.serp_item?.url || '',
    traffic: item.ranked_serp_element?.serp_item?.estimated_paid_traffic_cost || 0,
  }));
}

/**
 * Obtiene las páginas más relevantes de un dominio competidor.
 */
export async function getDomainPages(domain, language = 'es', locationCode = 2724, limit = 50) {
  const data = await apiRequest('/dataforseo_labs/google/relevant_pages/live', [
    {
      target: domain,
      language_code: language,
      location_code: locationCode,
      limit,
      order_by: ['metrics.organic.count,desc'],
    },
  ]);

  const results = data.tasks?.[0]?.result?.[0]?.items || [];
  return results.map((item) => ({
    url: item.page_address || '',
    keywords: item.metrics?.organic?.count || 0,
    traffic: item.metrics?.organic?.etv || 0,
    topKeyword: item.main_keyword || '',
  }));
}

/**
 * Obtiene las palabras clave compartidas entre dos dominios.
 */
export async function getKeywordsIntersection(domain1, domain2, language = 'es', locationCode = 2724, limit = 100) {
  const data = await apiRequest('/dataforseo_labs/google/domain_intersection/live', [
    {
      target1: domain1,
      target2: domain2,
      language_code: language,
      location_code: locationCode,
      limit,
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
    },
  ]);

  const results = data.tasks?.[0]?.result?.[0]?.items || [];
  return results.map((item) => ({
    keyword: item.keyword_data?.keyword || '',
    volume: item.keyword_data?.keyword_info?.search_volume || 0,
    difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0,
    position1: item.first_domain_serp_element?.serp_item?.rank_group || 0,
    position2: item.second_domain_serp_element?.serp_item?.rank_group || 0,
  }));
}

/**
 * Obtiene las keywords donde el competidor posiciona y el usuario no.
 * Usa domain_intersection filtrando donde domain1 no tiene resultados.
 */
export async function getCompetitorGap(userDomain, competitorDomain, language = 'es', locationCode = 2724, limit = 100) {
  const data = await apiRequest('/dataforseo_labs/google/domain_intersection/live', [
    {
      target1: competitorDomain,
      target2: userDomain,
      language_code: language,
      location_code: locationCode,
      limit,
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
      filters: [
        'second_domain_serp_element.serp_item.rank_group',
        '=',
        null,
      ],
    },
  ]);

  const results = data.tasks?.[0]?.result?.[0]?.items || [];
  return results.map((item) => ({
    keyword: item.keyword_data?.keyword || '',
    volume: item.keyword_data?.keyword_info?.search_volume || 0,
    difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0,
    competitorPosition: item.first_domain_serp_element?.serp_item?.rank_group || 0,
    url: item.first_domain_serp_element?.serp_item?.url || '',
  }));
}
