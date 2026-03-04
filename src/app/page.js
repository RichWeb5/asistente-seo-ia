'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, Search, Lightbulb, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900">
            AsistenteSEO <span className="text-primary-600">IA</span>
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu asistente SEO
            <br />
            <span className="text-primary-600">con datos reales</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Conecta tu cuenta de Google Search Console y obtén análisis,
            recomendaciones y asistencia personalizada para mejorar el
            posicionamiento de tu sitio web.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="inline-flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-8 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Iniciar sesión con Google
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Datos reales</h3>
            <p className="text-sm text-gray-600">
              Conecta con Google Search Console y visualiza clics, impresiones,
              CTR y posiciones de tu sitio.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Recomendaciones
            </h3>
            <p className="text-sm text-gray-600">
              Recibe sugerencias SEO priorizadas basadas en los datos reales de
              rendimiento de tu sitio.
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Chat SEO</h3>
            <p className="text-sm text-gray-600">
              Haz preguntas en español sobre cómo mejorar tu SEO y recibe
              respuestas contextuales.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-gray-400">
        AsistenteSEO IA — Mejora tu posicionamiento web
      </footer>
    </div>
  );
}
