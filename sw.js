/* 离线缓存（由 tools/build-web.mjs 生成到 dist/，不要直接改 dist 里的副本）
   core  = 页面、脚本、样式、数据、图标：安装时一次缓存好，版本号随内容变
   bulk  = 照片 + 本地瓦片（约 50 MB）：页面里的 offline.js 分批下载进来，换版本不必重下
   tiles = 浏览时从 Esri 取到的瓦片：顺手存一份，限量 */
const CORE = 'core-c8a7602362';
const BULK = 'bulk-d8bb74d0c8';
const TILES = 'tiles-remote-v1';
const CORE_FILES = ["index.html","app.css","app.js","data.js","data/coords.js","data/photos.js","offline.js","vendor/leaflet.js","vendor/leaflet.css","manifest.webmanifest","offline-assets.json","vendor/images/layers-2x.png","vendor/images/layers.png","vendor/images/marker-icon-2x.png","vendor/images/marker-icon.png","vendor/images/marker-shadow.png","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png"];
const TILE_MAX = 2500;
let localTiles = null;   // tiles/ 里实际有的文件（来自 offline-assets.json），用来让不存在的本地瓦片秒回 404

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE).then(c => c.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = new Set([CORE, BULK, TILES]);
    for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function tileSet() {
  if (localTiles) return localTiles;
  const r = await caches.match('offline-assets.json') || await fetch('offline-assets.json').catch(() => null);
  const j = r ? await r.clone().json().catch(() => null) : null;
  localTiles = new Set(j ? j.files.filter(f => f.startsWith('tiles/')) : []);
  return localTiles;
}

let trimCount = 0;
async function trimTiles() {
  if (++trimCount % 50) return;
  const c = await caches.open(TILES);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - TILE_MAX; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Esri 远程瓦片：有缓存用缓存，否则按 CORS 取（对方允许跨域）并存一份
  if (url.hostname === 'server.arcgisonline.com') {
    e.respondWith((async () => {
      const c = await caches.open(TILES);
      const hit = await c.match(req.url);
      if (hit) return hit;
      try {
        const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
        if (res.ok) { c.put(req.url, res.clone()); trimTiles(); }
        return res;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  // 本地瓦片：缓存 → 网络；目录里根本没有的直接 404，图片立刻改走远程
  if (rel.startsWith('tiles/')) {
    e.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const set = await tileSet();
      if (set.size && !set.has(rel)) return new Response('', { status: 404 });
      try { return await fetch(req); } catch (err) { return new Response('', { status: 404 }); }
    })());
    return;
  }

  // 其余同源文件（页面、脚本、照片）：缓存优先，秒开、断网照常；新版本靠 sw.js 换 core 缓存
  e.respondWith((async () => {
    const hit = await caches.match(rel === '' ? 'index.html' : req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); }
    catch (err) {
      if (req.mode === 'navigate') return (await caches.match('index.html')) || Response.error();
      return Response.error();
    }
  })());
});
