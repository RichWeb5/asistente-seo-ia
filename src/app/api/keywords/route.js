import { protectApiRoute } from '@/lib/security/api-guard';
import { sanitizeKeyword, sanitizeLanguageCode, sanitizeInt } from '@/lib/security/sanitize';
import { getKeywordIdeas, getKeywordDifficulty } from '@/services/dataforseo';

export async function POST(request) {
  const guard = await protectApiRoute(request, { limiterType: 'dataforseo' });
  if (guard instanceof Response) return guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const keyword = sanitizeKeyword(body.keyword);
  const language = sanitizeLanguageCode(body.language);
  const location = sanitizeInt(body.location, 1, 999999, 2724);

  if (!keyword) {
    return Response.json({ error: 'Se requiere una palabra clave válida' }, { status: 400 });
  }

  try {
    const ideas = await getKeywordIdeas(keyword, language, location);

    const keywordList = ideas.map((i) => i.keyword).slice(0, 100);
    let difficultyMap = {};

    if (keywordList.length > 0) {
      try {
        difficultyMap = await getKeywordDifficulty(keywordList, language, location);
      } catch (err) {
        console.error('Error al obtener dificultad:', err.message);
      }
    }

    const keywords = ideas.map((idea) => ({
      ...idea,
      difficulty: difficultyMap[idea.keyword] || 0,
      intent: idea.intent || classifyIntentBasic(idea.keyword),
    }));

    return Response.json({ keywords });
  } catch (error) {
    console.error('Error en keyword research:', error.message);
    return Response.json({ error: 'Error al investigar palabras clave' }, { status: 500 });
  }
}

function classifyIntentBasic(keyword) {
  const k = keyword.toLowerCase();
  if (/comprar|precio|barato|oferta|tienda|donde comprar|costo/.test(k)) return 'transactional';
  if (/mejor|comparar|vs|review|opiniones|top \d|ranking/.test(k)) return 'commercial';
  if (/login|iniciar sesión|pagina oficial|contacto/.test(k)) return 'navigational';
  return 'informational';
}
