// App-scoped immutable shell. A new worker waits for an explicit user update.
const VERSION='pmp-lab-2026-11-11-v5';
const CACHE=`${VERSION}:${self.registration.scope}`;
const ASSETS=['./','./index.html','./styles.css','./app.js','./content.js','./engine.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png','./docs/MASTER_ARCHITECTURE.md','./docs/SOURCES.md'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('pmp-lab-')&&key.endsWith(`:${self.registration.scope}`)&&key!==CACHE)await caches.delete(key);}await self.clients.claim();})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
 if(event.data?.type==='VERIFY_CACHE')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const ready=(await Promise.all(ASSETS.map(path=>cache.match(new URL(path,self.registration.scope))))).every(Boolean);event.ports[0]?.postMessage({ready,version:VERSION,files:ASSETS.length});})());
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate')return (await cache.match(new URL('./index.html',scope)))||fetch(event.request);const hit=await cache.match(event.request,{ignoreSearch:true});return hit||fetch(event.request);})());
});
