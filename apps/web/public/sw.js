if (!self.define) {
  let e,
    s = {};
  const i = (i, c) => (
    (i = new URL(i + '.js', c).href),
    s[i] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = i), (e.onload = s), document.head.appendChild(e));
        } else ((e = i), importScripts(i), s());
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, n) => {
    const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[t]) return;
    let a = {};
    const d = (e) => i(e, t),
      r = { module: { uri: t }, exports: a, require: d };
    s[t] = Promise.all(c.map((e) => r[e] || d(e))).then((e) => (n(...e), a));
  };
}
define(['./workbox-1a576b69'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/Cvrb-uqV1W1FpNVwi5_kx/_buildManifest.js',
          revision: 'acd30ffe1657871454a4b21b8bfa1992',
        },
        {
          url: '/_next/static/Cvrb-uqV1W1FpNVwi5_kx/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/143-43a88f562d261ecd.js', revision: '43a88f562d261ecd' },
        { url: '/_next/static/chunks/237-6601b4c98188bdbf.js', revision: '6601b4c98188bdbf' },
        { url: '/_next/static/chunks/280-bd1053c0ed4af798.js', revision: 'bd1053c0ed4af798' },
        { url: '/_next/static/chunks/306-c795ca9783725cda.js', revision: 'c795ca9783725cda' },
        { url: '/_next/static/chunks/397.262ed5e386c9f401.js', revision: '262ed5e386c9f401' },
        { url: '/_next/static/chunks/42c1337e-0b430d6c8d825fa3.js', revision: '0b430d6c8d825fa3' },
        { url: '/_next/static/chunks/825-4c405e654e807dad.js', revision: '4c405e654e807dad' },
        { url: '/_next/static/chunks/928-e11c8133636f0225.js', revision: 'e11c8133636f0225' },
        {
          url: '/_next/static/chunks/app/(auth)/layout-981fe4c07e50ad2c.js',
          revision: '981fe4c07e50ad2c',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-cc7b6eacfc4c18e4.js',
          revision: 'cc7b6eacfc4c18e4',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-d66ece98444757e4.js',
          revision: 'd66ece98444757e4',
        },
        {
          url: '/_next/static/chunks/app/(main)/layout-5dae743ae171c8b4.js',
          revision: '5dae743ae171c8b4',
        },
        {
          url: '/_next/static/chunks/app/(main)/page-e6c67fb532c462dc.js',
          revision: 'e6c67fb532c462dc',
        },
        {
          url: '/_next/static/chunks/app/(protected)/layout-7c3f2fb075cb29b4.js',
          revision: '7c3f2fb075cb29b4',
        },
        {
          url: '/_next/static/chunks/app/(protected)/notifications/page-5ecb483f4de3628b.js',
          revision: '5ecb483f4de3628b',
        },
        {
          url: '/_next/static/chunks/app/(protected)/profil/page-9ce0ffab45a2af17.js',
          revision: '9ce0ffab45a2af17',
        },
        {
          url: '/_next/static/chunks/app/_global-error/page-f67d7b7024ffd89d.js',
          revision: 'f67d7b7024ffd89d',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-3505f53aa177558d.js',
          revision: '3505f53aa177558d',
        },
        {
          url: '/_next/static/chunks/app/layout-36a9db222870f8db.js',
          revision: '36a9db222870f8db',
        },
        { url: '/_next/static/chunks/fe69a73d.bfc6bd39764470b4.js', revision: 'bfc6bd39764470b4' },
        { url: '/_next/static/chunks/framework-531238451815549b.js', revision: '531238451815549b' },
        { url: '/_next/static/chunks/main-9943395e0c4aa4b4.js', revision: '9943395e0c4aa4b4' },
        { url: '/_next/static/chunks/main-app-d99e6ddbb1f036b8.js', revision: 'd99e6ddbb1f036b8' },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-f67d7b7024ffd89d.js',
          revision: 'f67d7b7024ffd89d',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-f67d7b7024ffd89d.js',
          revision: 'f67d7b7024ffd89d',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-80b11ce84c88cb85.js',
          revision: '80b11ce84c88cb85',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-f67d7b7024ffd89d.js',
          revision: 'f67d7b7024ffd89d',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-f67d7b7024ffd89d.js',
          revision: 'f67d7b7024ffd89d',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-f5553624b6e6f62f.js', revision: 'f5553624b6e6f62f' },
        { url: '/_next/static/css/1de76be520b4de19.css', revision: '1de76be520b4de19' },
        { url: '/_next/static/css/bca9fd7926953e68.css', revision: 'bca9fd7926953e68' },
        {
          url: '/_next/static/media/313510e2713fb214-s.p.woff2',
          revision: 'a6b899943e3136839ebb13d6d6263222',
        },
        {
          url: '/_next/static/media/851c4691abdf3def-s.woff2',
          revision: '7814274b600c9a4c2f4306d46ff80cec',
        },
        {
          url: '/_next/static/media/a6c19694cd327cd4-s.woff2',
          revision: '679c8ae97dcfaa700a3f86f0bfc15950',
        },
        {
          url: '/_next/static/media/a8a8dd7277bab4cf-s.woff2',
          revision: 'a3a0917757d798b305df43be49bbc1c1',
        },
        { url: '/_next/static/media/layers-2x.9859cd12.png', revision: '9859cd12' },
        { url: '/_next/static/media/layers.ef6db872.png', revision: 'ef6db872' },
        { url: '/_next/static/media/marker-icon.d577052a.png', revision: 'd577052a' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icons/icon-192.png', revision: '906850f387116d3ef7d100ca96260985' },
        { url: '/icons/icon-512.png', revision: '906850f387116d3ef7d100ca96260985' },
        { url: '/leaflet/marker-icon-2x.png', revision: '401d815dc206b8dc1b17cd0e37695975' },
        { url: '/leaflet/marker-icon.png', revision: '2273e3d8ad9264b7daa5bdbf8e6b47f8' },
        { url: '/leaflet/marker-shadow.png', revision: '44a526eed258222515aa21eaffd14a96' },
        { url: '/manifest.json', revision: '99f67bab8acfbd261c10dcba12650a1b' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/swe-worker-5c72df51bb1f6ee0.js', revision: '76fdd3369f623a3edcf74ce2200bfdd0' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET',
    ),
    e.registerRoute(
      /^https?.*\/(api)\/.*/,
      new e.NetworkFirst({ cacheName: 'pages-and-api', plugins: [] }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:js|css|woff2?)$/,
      new e.CacheFirst({ cacheName: 'static-assets', plugins: [] }),
      'GET',
    ),
    e.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      new e.StaleWhileRevalidate({ cacheName: 'images', plugins: [] }),
      'GET',
    ));
});
