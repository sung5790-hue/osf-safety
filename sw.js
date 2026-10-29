// 입구 페이지만 저장해 두는 작은 서비스 워커입니다.
// 안전확인 화면(구글)은 저장하지 않고 늘 새로 받습니다.
const CACHE = 'osf-safety-v7';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'logo-white.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;           // 구글 쪽은 손대지 않음
  // 새것 먼저, 안 되면 저장본. 브라우저가 10분씩 붙잡아 두는 옛 파일도 건너뛰고 늘 새로 확인합니다
  e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(r => {
    const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r;
  }).catch(() => caches.match(e.request)));
});
