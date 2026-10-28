// 앱 파일을 폰에 저장해 두고, 인터넷이 없어도 열리게 한다. (https 주소에서만 동작)
const V = "ai-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./apple-touch-icon.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;   // 저장본을 먼저 보여주고, 뒤에서 새 버전을 받아 둔다
  }));
});
