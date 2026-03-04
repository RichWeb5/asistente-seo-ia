import { google } from 'googleapis';

/**
 * Crea un cliente autenticado de Google Search Console.
 * @param {string} accessToken - Token de acceso OAuth del usuario
 * @returns {import('googleapis').webmasters_v3.Webmasters} cliente de Search Console
 */
export function createSearchConsoleClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.searchconsole({ version: 'v1', auth });
}

/**
 * Obtiene la lista de sitios verificados del usuario en Search Console.
 */
export async function getSites(accessToken) {
  const client = createSearchConsoleClient(accessToken);
  const response = await client.sites.list();
  return (response.data.siteEntry || []).map((site) => ({
    siteUrl: site.siteUrl,
    permissionLevel: site.permissionLevel,
  }));
}

/**
 * Obtiene datos de rendimiento de búsqueda para un sitio.
 * @param {string} accessToken
 * @param {string} siteUrl - URL del sitio (ej: "sc-domain:ejemplo.com")
 * @param {object} options
 * @param {string} options.startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} options.endDate - Fecha fin (YYYY-MM-DD)
 * @param {string[]} options.dimensions - Dimensiones (query, page, date, country, device)
 * @param {number} options.rowLimit - Límite de filas (max 25000)
 */
export async function getSearchAnalytics(accessToken, siteUrl, options = {}) {
  const client = createSearchConsoleClient(accessToken);

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const requestBody = {
    startDate: options.startDate || thirtyDaysAgo.toISOString().split('T')[0],
    endDate: options.endDate || today.toISOString().split('T')[0],
    dimensions: options.dimensions || ['date'],
    rowLimit: options.rowLimit || 1000,
  };

  const response = await client.searchanalytics.query({
    siteUrl,
    requestBody,
  });

  return (response.data.rows || []).map((row) => ({
    keys: row.keys,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

/**
 * Obtiene datos agrupados por consulta de búsqueda (top queries).
 */
export async function getTopQueries(accessToken, siteUrl, startDate, endDate) {
  return getSearchAnalytics(accessToken, siteUrl, {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 500,
  });
}

/**
 * Obtiene datos agrupados por página.
 */
export async function getTopPages(accessToken, siteUrl, startDate, endDate) {
  return getSearchAnalytics(accessToken, siteUrl, {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 500,
  });
}

/**
 * Obtiene datos agrupados por fecha (para gráficos de tendencia).
 */
export async function getDailyMetrics(accessToken, siteUrl, startDate, endDate) {
  return getSearchAnalytics(accessToken, siteUrl, {
    startDate,
    endDate,
    dimensions: ['date'],
    rowLimit: 500,
  });
}

/**
 * Obtiene datos agrupados por dispositivo.
 */
export async function getDeviceMetrics(accessToken, siteUrl, startDate, endDate) {
  return getSearchAnalytics(accessToken, siteUrl, {
    startDate,
    endDate,
    dimensions: ['device'],
    rowLimit: 10,
  });
}
