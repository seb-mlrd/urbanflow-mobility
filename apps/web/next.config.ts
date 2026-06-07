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
        options: { cacheName: 'pages-and-api' },
      },
      {
        urlPattern: /\.(?:js|css|woff2?)$/,
        handler: 'CacheFirst',
        options: { cacheName: 'static-assets' },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'images' },
      },
    ],
  },
});

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
};

export default withBundleAnalyzer(withPWA(nextConfig));
