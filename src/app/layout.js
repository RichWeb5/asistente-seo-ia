import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'AsistenteSEO IA - Tu asistente SEO inteligente',
  description: 'Analiza y mejora el SEO de tu sitio web con datos reales de Google Search Console',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
