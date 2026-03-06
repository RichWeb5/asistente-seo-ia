import { protectApiRoute } from '@/lib/security/api-guard';
import { getSites } from '@/utils/google/gsc';

export async function GET(request) {
  const guard = await protectApiRoute(request);
  if (guard instanceof Response) return guard;
  const { session } = guard;

  try {
    const sites = await getSites(session.accessToken);
    return Response.json({ sites });
  } catch (error) {
    console.error('Error al obtener sitios:', error.message);
    return Response.json(
      { error: 'Error al obtener sitios de Search Console' },
      { status: 500 }
    );
  }
}
