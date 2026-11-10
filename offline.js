/* 网页版专用（tools/build-web.mjs 把它放进 dist/ 并在 index.html 引入；本地 file:// 打开时不加载）
   1. 注册 sw.js：页面、脚本、数据、图标第一次打开就缓存好
   2. 离线包（照片 + 本地瓦片约 42 MB）：打成十来个约 4 MB 的包（pack/*.bin）下载，拆开后逐个放进缓存，
      断网也能看地图和照片；进度显示在「攻略」页顶部；断网会暂停，联网后自动接着下
   3. iPhone：主屏 App 和 Safari 标签页的存储是分开的。在 Safari 标签页里先不自动下载，提示「添加到主屏幕」，
      从主屏图标打开后才自动下载（也可以点按钮直接在 Safari 里下） */
(function () {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const BULK = 'bulk-29fca62b06';
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const autoStart = !isIOS || standalone;
  const st = { phase: 'check', done: 0, total: 0 };
  const MB = b => (b / 1048576).toFixed(b < 10485760 ? 1 : 0);

  navigator.serviceWorker.register('sw.js').catch(err => { st.phase = 'error'; st.msg = String(err); paint(); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { el.classList.remove('show'); setTimeout(() => { el.hidden = true; }, 260); }, 3200);
  }

  // 「攻略」页顶部的离线状态块（放在 #guideBody 外面，攻略重绘不会冲掉它）
  function box() {
    let el = document.getElementById('offlineBox');
    if (el) return el;
    const host = document.getElementById('panel-guide');
    if (!host) return null;
    el = document.createElement('section');
    el.id = 'offlineBox';
    el.className = 'offline-box';
    host.insertBefore(el, host.firstChild);
    el.addEventListener('click', e => { if (e.target.closest('[data-offline-go]')) download(); });
    return el;
  }
  function paint() {
    const el = box();
    if (!el) return;
    const pct = st.total ? Math.min(100, Math.round(st.done / st.total * 100)) : 0;
    let line, btn = '';
    if (st.phase === 'check') line = '正在检查离线包…';
    else if (st.phase === 'idle') {
      line = `Safari 底部「分享」→「添加到主屏幕」，之后从主屏图标打开，会自动下载离线包（约 ${MB(st.total)} MB，建议连 Wi-Fi）`;
      btn = '<button data-offline-go>直接在 Safari 里下载</button>';
    }
    else if (st.phase === 'loading') line = `正在下载离线包 ${pct}%（${MB(st.done)} / ${MB(st.total)} MB），照片和地图瓦片，建议连着 Wi-Fi`;
    else if (st.phase === 'ready') line = '离线包已就绪：断网也能看行程、地图和照片（离开下载过的城市范围，底图要联网）';
    else if (st.phase === 'partial') {
      line = `离线包还差 ${MB(st.total - st.done)} MB 没下完${navigator.onLine === false ? '（现在没网，联网后会自动接着下）' : ''}`;
      btn = '<button data-offline-go>继续下载</button>';
    }
    else line = '离线缓存不可用：' + (st.msg || '浏览器不支持');
    const hint = isIOS && !standalone && st.phase !== 'idle'
      ? '<p class="offline-hint">用 Safari 底部的「分享」→「添加到主屏幕」，之后从主屏图标打开：全屏显示，像 App 一样。</p>' : '';
    el.innerHTML = `<div class="offline-row"><b>离线使用</b><span>${line}</span>${btn}</div>
      ${st.phase === 'loading' ? `<div class="offline-bar"><i style="width:${pct}%"></i></div>` : ''}${hint}`;
  }

  // 清单 + 缓存里已有哪些，算出还缺哪些包
  async function plan() {
    const list = await (await fetch('offline-assets.json', { cache: 'no-store' })).json();
    const cache = await caches.open(BULK);
    const have = new Set((await cache.keys()).map(r => r.url));
    const abs = p => new URL(p, location.href).href;
    const todo = list.packs.filter(pk => pk.entries.some(e => !have.has(abs(e[0]))));
    st.total = list.bytes;
    st.done = list.bytes - todo.reduce((s, pk) => s + pk.size, 0);
    return { cache, have, abs, todo };
  }

  let running = false;
  async function download() {
    if (running) return;
    running = true;
    try {
      const { cache, have, abs, todo } = await plan();
      if (!todo.length) { st.phase = 'ready'; paint(); return; }
      st.phase = 'loading';
      paint();
      // 3 路并发；网络断了（连续失败 2 次或系统报离线）就停，等 online 事件再接着下
      let i = 0, fails = 0, stop = false;
      const worker = async () => {
        while (!stop && i < todo.length) {
          const pk = todo[i++];
          try {
            const res = await fetch(pk.url, { cache: 'no-store' });
            if (!res.ok) throw new Error(res.status);
            const buf = await res.arrayBuffer();
            for (const [p, off, len, type] of pk.entries) {
              if (have.has(abs(p))) continue;
              await cache.put(abs(p), new Response(buf.slice(off, off + len), { headers: { 'Content-Type': type, 'Content-Length': String(len) } }));
            }
            st.done += pk.size;
            fails = 0;
            paint();
          } catch (err) {
            if (++fails >= 2 || navigator.onLine === false) stop = true;
          }
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      const left = (await plan()).todo.length;
      st.phase = left ? 'partial' : 'ready';
      paint();
      if (!left) toast('离线包下载完成：断网也能用');
    } catch (err) {
      st.phase = 'partial';
      paint();
    } finally {
      running = false;
    }
  }
  window.addEventListener('online', () => { if (st.phase === 'partial') download(); });

  // 新版本：sw.js 换了 core 缓存后，下次打开就是新版；当前页面不打断
  window.addEventListener('load', () => {
    paint();
    navigator.serviceWorker.ready.then(async () => {
      try {
        const { todo } = await plan();
        if (!todo.length) { st.phase = 'ready'; paint(); return; }
        if (autoStart) setTimeout(download, 1200);
        else { st.phase = 'idle'; paint(); }
      } catch (err) { st.phase = 'partial'; paint(); }
    });
  });
})();
