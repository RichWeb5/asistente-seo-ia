import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { getTopQueries, getTopPages } from '@/utils/google/gsc';
import { generateRecommendations } from '@/utils/seo-analyzer';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get('siteUrl');

  if (!siteUrl) {
    return Response.json({ error: 'Se requiere siteUrl' }, { status: 400 });
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const [queries, pages] = await Promise.all([
      getTopQueries(session.accessToken, siteUrl, startStr, endStr),
      getTopPages(session.accessToken, siteUrl, startStr, endStr),
    ]);

    const recommendations = generateRecommendations(queries, pages);

    return Response.json({ recommendations });
  } catch (error) {
    console.error('Error al generar recomendaciones:', error.message);
    return Response.json(
      { error: 'Error al generar recomendaciones' },
      { status: 500 }
    );
  }
}
