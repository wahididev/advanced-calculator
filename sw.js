/* simple service worker for offline support */
const CACHE = 'adv-calc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/script.js',
  '/assets/favicon.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    // update cache for navigation & same-origin assets
    if(e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)){
      caches.open(CACHE).then(cache=>cache.put(e.request, resp.clone()));
    }
    return resp;
  })).catch(()=>caches.match('/index.html')));
});
