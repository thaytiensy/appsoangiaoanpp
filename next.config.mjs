/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.BUILD_MODE === 'verify' ? '.next-verify' : '.next',
  reactStrictMode: true,
  serverExternalPackages: ['better-sqlite3', 'drizzle-orm'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
