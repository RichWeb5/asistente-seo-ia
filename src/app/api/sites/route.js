import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { getSites } from '@/utils/google/gsc';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }

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
