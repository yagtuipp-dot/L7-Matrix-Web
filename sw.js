const C="l7-v03";
const A=["./","./index.html","./style.css","./app.js","./manifest.webmanifest"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))])));
self.addEventListener("fetch",e=>{if(e.request.method==="GET")e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
