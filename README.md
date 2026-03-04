# AsistenteSEO IA

Asistente SEO basado en datos reales de Google Search Console. Analiza el rendimiento de tu sitio web, recibe recomendaciones priorizadas y consulta dudas de SEO en español.

## Características

- **Login con Google OAuth 2.0** — Acceso seguro con tu cuenta de Google
- **Integración con Search Console** — Datos reales de clics, impresiones, CTR y posiciones
- **Panel de métricas** — Gráficos de rendimiento con tendencias diarias
- **Recomendaciones SEO** — Sugerencias priorizadas basadas en tus datos reales
- **Chat SEO en español** — Pregunta sobre SEO y obtén respuestas contextuales
- **Tablas de consultas y páginas** — Ordenables y filtrables

## Requisitos previos

- Node.js 18 o superior
- Una cuenta de Google con acceso a Search Console
- Credenciales OAuth 2.0 de Google Cloud

## 1. Configurar credenciales en Google Cloud

### Crear proyecto y habilitar APIs

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (o selecciona uno existente)
3. Ve a **APIs y Servicios > Biblioteca**
4. Busca y habilita **Google Search Console API**

### Configurar pantalla de consentimiento OAuth

1. Ve a **APIs y Servicios > Pantalla de consentimiento OAuth**
2. Selecciona **Externo** como tipo de usuario
3. Completa los campos obligatorios:
   - Nombre de la app: `AsistenteSEO IA`
   - Correo de soporte: tu email
   - Dominios autorizados: `localhost` (para desarrollo)
4. En **Permisos**, agrega el scope:
   - `https://www.googleapis.com/auth/webmasters.readonly`
5. En **Usuarios de prueba**, agrega tu correo de Google

### Crear credenciales OAuth 2.0

1. Ve a **APIs y Servicios > Credenciales**
2. Haz clic en **Crear credenciales > ID de cliente OAuth**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `AsistenteSEO IA`
5. URIs de redirección autorizados:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Guarda el **Client ID** y **Client Secret**

## 2. Instalar y configurar el proyecto

```bash
# Clonar o copiar el proyecto
cd asistente-seo-ia

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secreto-aqui
```

Para generar `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 4. Probar la integración

1. Haz clic en **Iniciar sesión con Google**
2. Autoriza los permisos de Search Console
3. Selecciona un sitio del dropdown
4. Verás las métricas de rendimiento, recomendaciones y el chat SEO

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js   # Autenticación OAuth
│   │   ├── chat/route.js                  # API del chat SEO
│   │   ├── metrics/route.js               # Métricas de rendimiento
│   │   ├── recommendations/route.js       # Recomendaciones SEO
│   │   └── sites/route.js                 # Sitios de Search Console
│   ├── dashboard/page.js                  # Panel principal
│   ├── layout.js                          # Layout raíz
│   ├── page.js                            # Página de inicio/login
│   └── globals.css                        # Estilos globales
├── components/
│   ├── ChatPanel.js                       # Chat interactivo
│   ├── MetricCards.js                     # Tarjetas de métricas
│   ├── Navbar.js                          # Barra de navegación
│   ├── PagesTable.js                      # Tabla de páginas
│   ├── PerformanceChart.js                # Gráfico de rendimiento
│   ├── Providers.js                       # Provider de sesión
│   ├── QueriesTable.js                    # Tabla de consultas
│   ├── Recommendations.js                # Panel de recomendaciones
│   └── SiteSelector.js                   # Selector de sitios
├── config/
│   └── auth.js                            # Configuración de NextAuth
└── utils/
    ├── chat-engine.js                     # Motor de chat SEO
    ├── seo-analyzer.js                    # Analizador de recomendaciones
    └── google/
        └── gsc.js                         # Cliente de Search Console API
```

## Tecnologías

- **Next.js 14** — Framework React con App Router
- **NextAuth.js** — Autenticación OAuth 2.0
- **googleapis** — Cliente oficial de Google APIs
- **Recharts** — Gráficos de rendimiento
- **Tailwind CSS** — Estilos
- **Lucide React** — Iconos

## Notas

- La app usa `webmasters.readonly` (solo lectura) — no modifica nada en Search Console
- Los datos de Search Console tienen un retraso de 2-3 días respecto a la fecha actual
- En modo de prueba de Google Cloud, solo los usuarios agregados manualmente pueden iniciar sesión
- Para producción, deberás verificar la app en Google Cloud y configurar un dominio real
