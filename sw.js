// Sandėliukas service worker: app works offline, product photos and fonts are cached after first view
const V='sandeliukas-v5', RT='sandeliukas-rt-v1';
const CORE=['./','./index.html','./zxing.min.js','./manifest.webmanifest','./manifest-en.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(/open(food|beauty|products|petfood)facts\.org$/.test(u.hostname)&&u.pathname.startsWith('/api/'))return; // always live
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  if(u.origin===location.origin){e.respondWith(caches.match(r).then(m=>m||fetch(r)));return}
  if(/(^|\.)open(food|beauty|products|petfood)facts\.org$|fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(RT).then(async c=>{const m=await c.match(r);
      const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);
      return m||net}));}
});
