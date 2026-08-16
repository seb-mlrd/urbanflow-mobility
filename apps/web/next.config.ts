import path from 'path';
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https?.*\/(api)\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-and-api-v2',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\.(?:js|css|woff2?)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default withBundleAnalyzer(withPWA(nextConfig));
