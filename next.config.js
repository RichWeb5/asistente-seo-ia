/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Prevent source maps in production (leaks code)
  productionBrowserSourceMaps: false,
  // Disable x-powered-by header
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ],
};

module.exports = nextConfig;
