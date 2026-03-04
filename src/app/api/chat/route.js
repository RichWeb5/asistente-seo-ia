import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { getTopQueries, getTopPages, getDailyMetrics } from '@/utils/google/gsc';
import { generateSummary } from '@/utils/seo-analyzer';
import { processQuestion } from '@/utils/chat-engine';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { question, siteUrl } = await request.json();

  if (!question) {
    return Response.json({ error: 'Se requiere una pregunta' }, { status: 400 });
  }

  let siteData = {};

  // Si hay un sitio seleccionado, obtener datos para contexto
  if (siteUrl) {
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
