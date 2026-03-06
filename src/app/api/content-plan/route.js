import { protectApiRoute } from '@/lib/security/api-guard';
import { sanitizeKeyword } from '@/lib/security/sanitize';
import { generateEditorialPlan } from '@/services/ai-engine';

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

  if (keywords.length > 200) {
    return Response.json({ error: 'Máximo 200 keywords por solicitud' }, { status: 400 });
  }

  try {
    // Sanitize keywords
    const sanitized = keywords.map((kw) => {
      if (typeof kw === 'string') return sanitizeKeyword(kw);
      return { ...kw, keyword: sanitizeKeyword(kw.keyword || '') };
    }).filter((kw) => (typeof kw === 'string' ? kw : kw.keyword));

    const result = generateEditorialPlan(sanitized);

    return Response.json(result);
  } catch (error) {
    console.error('Error al generar plan editorial:', error.message);
    return Response.json({ error: 'Error al generar el plan editorial' }, { status: 500 });
  }
}
