import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { generateEditorialPlan } from '@/services/ai-engine';

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

    const result = generateEditorialPlan(keywords);

    return Response.json(result);
  } catch (error) {
    console.error('Error al generar plan editorial:', error.message);
    return Response.json({ error: 'Error al generar el plan editorial' }, { status: 500 });
  }
}
