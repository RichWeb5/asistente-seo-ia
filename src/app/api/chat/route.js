import { protectApiRoute, validateSiteOwnership } from '@/lib/security/api-guard';
import { sanitizeChatInput, sanitizeSiteUrl } from '@/lib/security/sanitize';
import { getTopQueries, getTopPages, getDailyMetrics } from '@/utils/google/gsc';
import { generateSummary } from '@/utils/seo-analyzer';
import { processQuestion } from '@/utils/chat-engine';

export async function POST(request) {
  const guard = await protectApiRoute(request, { limiterType: 'chat' });
  if (guard instanceof Response) return guard;
  const { session } = guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const question = sanitizeChatInput(body.question);
  const siteUrl = sanitizeSiteUrl(body.siteUrl);

  if (!question) {
    return Response.json({ error: 'Se requiere una pregunta válida' }, { status: 400 });
  }

  let siteData = {};

  if (siteUrl) {
    const isOwner = await validateSiteOwnership(session.accessToken, siteUrl);
    if (!isOwner) {
      return Response.json({ error: 'No tienes acceso a este sitio' }, { status: 403 });
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const [daily, topQueries, topPages] = await Promise.all([
        getDailyMetrics(session.accessToken, siteUrl, startStr, endStr),
        getTopQueries(session.accessToken, siteUrl, startStr, endStr),
        getTopPages(session.accessToken, siteUrl, startStr, endStr),
      ]);

      siteData = {
        summary: generateSummary(daily),
        topQueries: topQueries.slice(0, 20),
        topPages: topPages.slice(0, 20),
      };
    } catch (error) {
      console.error('Error al obtener datos del sitio para chat:', error.message);
    }
  }

  const answer = processQuestion(question, siteData);

  return Response.json({ answer });
}
