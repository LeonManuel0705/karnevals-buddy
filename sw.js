const CACHE = 'karnevals-buddy-v5';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'css/art.css',
  'js/icons.js',
  'js/ui.js',
  'js/dates.js',
  'js/store.js',
  'js/surprises.js',
  'js/start.js',
  'js/events.js',
  'js/costumes.js',
  'js/packing.js',
  'js/notes.js',
  'js/art.js',
  'js/formations.js',
  'js/app.js',
  'fonts/titan-one.woff2',
  'fonts/mplus-rounded-400.woff2',
  'fonts/mplus-rounded-500.woff2',
  'fonts/mplus-rounded-700.woff2',
  'fonts/mplus-rounded-800.woff2',
  'img/icon.svg',
  'img/icon-180.png',
  'img/icon-192.png',
  'img/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES.map(url => new Request(url, { cache: 'reload' })))),
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Cache-first with one complete set of files per version, so a flaky network in the hall
// can never mix old and new scripts. Bump CACHE whenever a file changes.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request)),
  );
});
