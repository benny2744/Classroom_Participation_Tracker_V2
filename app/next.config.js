// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: Next.js generates URLs with /participation prefix
  // Nginx strips /participation before forwarding, so Next.js receives root paths
  basePath: '/participation',

  // Use the default .next folder (or override via env if you really want)
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // ✅ Always produce a standalone build so Docker can run .next/standalone/server.js
  output: 'standalone',

  // Keep file tracing rooted at the repo root (app/ is one level down)
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },

  // Don't fail the Docker build on lint issues
  eslint: { ignoreDuringBuilds: true },

  // Avoid type errors blocking production builds (you can turn this back off later)
  typescript: { ignoreBuildErrors: true },

  // If you aren't optimizing images in prod, keep this
  images: { unoptimized: true },
};

module.exports = nextConfig;
