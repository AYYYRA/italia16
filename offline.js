/* 网页版专用（tools/build-web.mjs 把它放进 dist/ 并在 index.html 引入；本地 file:// 打开时不加载）
   1. 注册 sw.js：页面、脚本、数据、图标第一次打开就缓存好
   2. 照片 + 本地瓦片（约 50 MB）分批下载进缓存，断网也能看地图和照片；进度显示在「攻略」页顶部
   3. 在 Safari 标签页里打开时提示「添加到主屏幕」：主屏 App 的缓存更稳，全屏也更像 App */
(function () {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const BULK = 'bulk-d8bb74d0c8';
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const st = { phase: 'check', done: 0, total: 0, failed: 0, mb: 0 };

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
    const pct = st.total ? Math.round(st.done / st.total * 100) : 0;
    let line, btn = '';
    if (st.phase === 'check') line = '正在检查离线包…';
    else if (st.phase === 'loading') line = `正在下载离线包 ${pct}%（${st.done} / ${st.total}）· 照片和地图瓦片约 ${st.mb} MB，建议连着 Wi-Fi`;
    else if (st.phase === 'ready') line = `离线包已就绪：断网也能看行程、地图和照片（离开下载过的城市范围，底图要联网）`;
    else if (st.phase === 'partial') { line = `还有 ${st.failed} 个文件没下载成功`; btn = '<button data-offline-go>继续下载</button>'; }
    else line = '离线缓存不可用：' + (st.msg || '浏览器不支持');
    const hint = isIOS && !standalone
      ? '<p class="offline-hint">用 Safari 底部的「分享」→「添加到主屏幕」，之后从主屏图标打开：全屏显示，离线缓存也更稳。</p>' : '';
    el.innerHTML = `<div class="offline-row"><b>离线使用</b><span>${line}</span>${btn}</div>
      ${st.phase === 'loading' ? `<div class="offline-bar"><i style="width:${pct}%"></i></div>` : ''}${hint}`;
  }

  let running = false;
  async function download() {
    if (running) return;
    running = true;
    try {
      const list = await (await fetch('offline-assets.json', { cache: 'no-store' })).json();
      st.mb = Math.round(list.bytes / 1048576);
      const cache = await caches.open(BULK);
      const have = new Set((await cache.keys()).map(r => r.url));
      const todo = list.files.filter(f => !have.has(new URL(f, location.href).href));
      st.total = list.files.length;
      st.done = st.total - todo.length;
      st.failed = 0;
      if (!todo.length) { st.phase = 'ready'; paint(); return; }
      st.phase = 'loading';
      paint();
      // 6 路并发；每 40 个刷新一次进度
      let i = 0, n = 0;
      const worker = async () => {
        while (i < todo.length) {
          const f = todo[i++];
          try {
            const res = await fetch(f);
            if (!res.ok) throw new Error(res.status);
            await cache.put(f, res);
          } catch (err) { st.failed++; }
          st.done++;
          if (++n % 40 === 0) paint();
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      st.done -= st.failed;
      st.phase = st.failed ? 'partial' : 'ready';
      paint();
      if (!st.failed) toast('离线包下载完成：断网也能用');
    } catch (err) {
      st.phase = 'partial';
      st.failed = st.failed || 1;
      paint();
    } finally {
      running = false;
    }
  }

  // 新版本：sw.js 换了 core 缓存后，下次打开就是新版；当前页面不打断
  window.addEventListener('load', () => {
    paint();
    navigator.serviceWorker.ready.then(() => setTimeout(download, 1500));
  });
})();
