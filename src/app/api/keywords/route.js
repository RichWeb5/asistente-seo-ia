import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { getKeywordIdeas, getKeywordDifficulty } from '@/services/dataforseo';

// TODO: Rate limiting / credits check

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { keyword, language = 'es', location = 2724 } = body;

    if (!keyword) {
      return Response.json({ error: 'Se requiere una palabra clave' }, { status: 400 });
    }

    // Obtener ideas de keywords
    const ideas = await getKeywordIdeas(keyword, language, location);

    // Obtener dificultad para las keywords
    const keywordList = ideas.map((i) => i.keyword).slice(0, 100);
    let difficultyMap = {};

    if (keywordList.length > 0) {
      try {
        difficultyMap = await getKeywordDifficulty(keywordList, language, location);
      } catch (err) {
        console.error('Error al obtener dificultad:', err.message);
      }
    }

    // Combinar resultados
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
