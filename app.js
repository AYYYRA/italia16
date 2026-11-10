/* ============================================================
   意大利 16 天 · 交互引擎
   依赖：Leaflet / window.TRIP / window.COORDS
   ============================================================ */
(function () {
  'use strict';

  const T = window.TRIP;
  const C = window.COORDS || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------------- 图标（内联 SVG 线性图标，统一 24 网格 / currentColor） ---------------- */
  const svg = d => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    train: svg('<rect x="5" y="3" width="14" height="14" rx="3.5"/><path d="M5 10.5h14M9 21l1.6-4M15 21l-1.6-4M8.6 13.8h.01M15.4 13.8h.01"/>'),
    plane: svg('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
    metro: svg('<circle cx="12" cy="12" r="9"/><path d="M8 16V8.5l4 5 4-5V16"/>'),
    tram: svg('<rect x="5" y="6" width="14" height="12" rx="3"/><path d="M5 12h14M9 2.5h6M12 2.5V6M8.5 21.5l1.5-3.5M15.5 21.5 14 18"/>'),
    walk: svg('<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>'),
    boat: svg('<path d="M12 10.2V14M12 2v3M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.4 20A11.6 11.6 0 0 0 21 14l-8.2-3.6a2 2 0 0 0-1.6 0L3 14a11.6 11.6 0 0 0 2.8 7.8"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>'),
    mover: svg('<path d="M2 9l20-5M12 12V6.5"/><rect x="4" y="12" width="16" height="9.5" rx="3"/><path d="M9 12v5M15 12v5M4 17h16"/>'),
    bed: svg('<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>'),
    food: svg('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    ticket: svg('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>'),
    calendar: svg('<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18M9 15.5l2 2 4-4"/>'),
    bus: svg('<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3M8 14.5h.01M16 14.5h.01"/>'),
    funi: svg('<path d="M3 4.5 21 8.5M12 6.5V11"/><rect x="6" y="11" width="12" height="9" rx="2.5"/><path d="M6 15.5h12M10 11v4.5M14 11v4.5"/>'),
    route: svg('<circle cx="6" cy="19" r="2.6"/><path d="M8.6 19h8.9a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="2.6"/>'),
    pin: svg('<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
    map: svg('<path d="M14.1 5.1 9.9 3.4a2 2 0 0 0-1.6 0L3.6 5.5a1 1 0 0 0-.6.9v13.1a1 1 0 0 0 1.4.9l4-1.8a2 2 0 0 1 1.6 0l4.2 1.7a2 2 0 0 0 1.6 0l4.7-2.1a1 1 0 0 0 .6-.9V4.4a1 1 0 0 0-1.4-.9l-4 1.8a2 2 0 0 1-1.6 0zM9 3.2v15M15 5.8v15"/>'),
    bulb: svg('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>'),
    ext: svg('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    copy: svg('<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M4.5 16A2 2 0 0 1 3 14V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 1.5"/>'),
    locate: svg('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
    arrowL: svg('<path d="M19 12H5M11 18l-6-6 6-6"/>'),
    arrowR: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chevR: svg('<path d="m9 6 6 6-6 6"/>'),
    chevD: svg('<path d="m6 9 6 6 6-6"/>'),
    luggage: svg('<path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M10 20h4"/><circle cx="16" cy="20" r="1.6"/><circle cx="8" cy="20" r="1.6"/>'),
    bag: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>')
  };
  /* 酒店门到门表里的交通方式：数据里是 emoji，呈现时换成线性图标 */
  const TR_ICON = { '🚇': 'metro', '🚋': 'tram', '🚶': 'walk', '🚈': 'mover', '🚤': 'boat' };

  /* 日期：D1 = 2027-01-18（与罗马酒店入住日一致），只用于显示 */
  const TRIP_START = new Date(2027, 0, 18);
  const WEEKDAY = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function dayDate(n) {
    const d = new Date(TRIP_START.getFullYear(), TRIP_START.getMonth(), TRIP_START.getDate() + n - 1);
    return { md: `${d.getMonth() + 1}/${d.getDate()}`, wd: WEEKDAY[d.getDay()] };
  }

  /* ---------------- 索引 ---------------- */
  const cityById = Object.fromEntries(T.cities.map(c => [c.id, c]));
  const placeById = Object.fromEntries(T.places.map(p => [p.id, p]));
  const foodById = Object.fromEntries(T.food.map(f => [f.id, f]));
  const hubById = Object.fromEntries(T.hubs.map(h => [h.id, h]));
  const hubByKey = Object.fromEntries(T.hubs.map(h => [h.key, h]));

  const MAIN_CITIES = ['rome', 'florence', 'venice', 'milan'];
  const EXCURSION = T.cities.filter(c => c.excursion);

  /* 住宿（已确认的酒店订单，坐标按门牌地址核验；transit 为门到门实际线路） */
  const HOTELS = {
    rome: {
      key: 'hotel_rome', coord: [41.90456, 12.42650],
      name: 'c-hotels Club House Roma',
      addr: 'Via Andrea Alciato 14/16, Aurelio',
      nights: 5, stay: '1/18 → 1/23',
      toStation: '地铁 A 线 Cornelia 上车，到 Termini 10 站，约 18 分钟',
      passes: '地铁 72 小时通票 €18（单程 €1.50，100 分钟内可换乘一次）',
      transit: [
        { ico: '🚇', to: 'Roma Termini 车站', mode: '地铁 A 线', detail: 'Cornelia → Termini，10 站', time: '18 分', fare: '€1.50' },
        { ico: '🚇', to: '梵蒂冈博物馆', mode: '地铁 A 线 + 步行', detail: 'Cornelia → Cipro，3 站，再走 8 分', time: '20 分', fare: '€1.50' },
        { ico: '🚇', to: '西班牙广场', mode: '地铁 A 线', detail: 'Cornelia → Spagna，7 站', time: '14 分', fare: '€1.50' },
        { ico: '🚇', to: '斗兽场', mode: '地铁 A + B', detail: 'Termini 换 B 线 2 站到 Colosseo', time: '32 分', fare: '€1.50' },
        { ico: '🚋', to: '特拉斯提弗列', mode: '公交 + 电车 8 路', detail: 'A 线到 Termini 转 8 路电车到 Piazza Belli', time: '38 分', fare: '€1.50' }
      ]
    },
    florence: {
      key: 'hotel_florence', coord: [43.78438, 11.24178],
      name: 'PopArtment',
      addr: 'Via Alfredo Catalani 13',
      nights: 4, stay: '1/23 → 1/27',
      toStation: '步行 1.0 km 到 SMN，约 14 分钟',
      passes: '公交单程 €1.70 / 90 分钟（老城全靠走，基本不用买）',
      transit: [
        { ico: '🚶', to: 'Firenze S.M.N. 车站', mode: '步行', detail: '沿 Viale F.lli Rosselli 直走 1.0 km', time: '14 分', fare: '免费' },
        { ico: '🚶', to: '圣母百花大教堂', mode: '步行', detail: '经车站穿老城，1.7 km', time: '22 分', fare: '免费' },
        { ico: '🚶', to: '乌菲兹美术馆', mode: '步行', detail: '2.1 km，穿过领主广场', time: '28 分', fare: '免费' },
        { ico: '🚋', to: 'SMN（拖行李时）', mode: 'T1 电车', detail: '步行 500 m 到 Fortezza 站，1 站到 Alamanni', time: '10 分', fare: '€1.70' }
      ]
    },
    venice: {
      key: 'hotel_venice', coord: [45.44255, 12.30888],
      name: 'Hampton by Hilton Isola Nuova',
      addr: 'Isola Nova del Tronchetto 17（Tronchetto 岛，不在主岛）',
      nights: 2, stay: '1/27 → 1/29',
      toStation: 'People Mover 3 分钟到 Piazzale Roma，再步行 600 m 过桥，约 18 分钟',
      passes: '水上巴士 48 小时通票 €35（单程 €9.50）；People Mover 单独 €1.50，不在通票内',
      transit: [
        { ico: '🚈', to: 'Venezia S. Lucia 车站', mode: 'People Mover + 步行', detail: 'Tronchetto → Piazzale Roma（3 分），过 Calatrava 桥 600 m', time: '18 分', fare: '€1.50' },
        { ico: '🚤', to: '圣马可广场', mode: '水上巴士 2 线', detail: 'Tronchetto 起点站直达 San Marco', time: '30 分', fare: '通票内' },
        { ico: '🚤', to: '里亚托桥', mode: '水上巴士 2 线', detail: '直达 Rialto', time: '25 分', fare: '通票内' },
        { ico: '🚤', to: 'Murano / Burano', mode: '2 线 + 3 线 + 12 线', detail: '2 线到 P.le Roma → 3 线到 F.te Nove → 12 线', time: '60 分', fare: '通票内' }
      ]
    },
    milan: {
      key: 'hotel_milan', coord: [45.45240, 9.11715],
      name: 'Amedia Milan',
      addr: 'Via Bisceglie 96',
      nights: 4, stay: '1/29 → 2/2',
      toStation: '地铁 M1 Bisceglie 上车，到 Cadorna 约 15 分钟',
      passes: '地铁 72 小时通票 €18（单程 €2.20，90 分钟有效）',
      transit: [
        { ico: '🚇', to: 'Cadorna 车站（机场快线上车点）', mode: '地铁 M1', detail: 'Bisceglie → Cadorna，10 站', time: '15 分', fare: '€2.20' },
        { ico: '🚇', to: '米兰大教堂', mode: '地铁 M1', detail: 'Bisceglie → Duomo，13 站', time: '20 分', fare: '€2.20' },
        { ico: '🚇', to: 'Milano Centrale 车站', mode: '地铁 M1 + M2', detail: 'Cadorna 换 M2，4 站', time: '28 分', fare: '€2.20' },
        { ico: '🚇', to: '《最后的晚餐》', mode: '地铁 M1 + 步行', detail: 'Cadorna 下，步行 800 m', time: '25 分', fare: '€2.20' }
      ]
    }
  };

  /* ---------------- 坐标解析 ---------------- */
  const missing = new Set();
  function pos(key) {
    const c = C[key];
    if (c && typeof c.lat === 'number' && typeof c.lon === 'number') return [c.lat, c.lon];
    const p = T.places.find(x => x.key === key);
    if (p && Array.isArray(p.coord)) return p.coord;
    if (HOTELS[key]) return HOTELS[key].coord;
    missing.add(key);
    return null;
  }
  function colorOf(cityId) {
    const c = cityById[cityId];
    if (!c) return '#0F4C3A';
    return c.parent ? cityById[c.parent].color : c.color;
  }

  /* ---------------- 状态 ---------------- */
  const state = {
    mode: 'overview',     // overview | city
    city: 'rome',
    day: null,            // 当前高亮的日期
    tab: 'days',
    layers: {
      legs: true, intra: true, poi: true, hub: true,
      transit: false, food: false, shop: false
    },
    selected: null
  };

  /* 精力版本：high = 完整行程；low = 只走核心。需要预约的门票、火车两版一致，只在免预约的点上取舍。
     记在本机；?energy=low 可直接打开低精力版 */
  const ENERGY_KEY = 'trtip_energy';
  state.energy = (() => {
    const q = new URLSearchParams(location.search).get('energy');
    if (q === 'low' || q === 'high') return q;
    try { return localStorage.getItem(ENERGY_KEY) === 'low' ? 'low' : 'high'; } catch (e) { return 'high'; }
  })();
  const isLite = () => state.energy === 'low';
  const dayByN = Object.fromEntries(T.days.map(d => [d.n, d]));
  function stopsOf(d) { return d ? (isLite() && d.lite ? d.lite : d.stops) : []; }
  const titleOf = d => (isLite() && d.liteTitle) || d.title;
  // 每天从哪家酒店出发、晚上回哪家（按 days[].stay 对到 HOTELS）；首日从机场来、末日去机场
  const nightHotel = n => { const d = dayByN[n]; return d ? Object.keys(HOTELS).find(cid => cityById[cid] && cityById[cid].name === d.stay) || null : null; };
  const hotelsOf = d => ({ from: d.n > 1 ? nightHotel(d.n - 1) : null, to: nightHotel(d.n) });
  const PHOTOS = window.PHOTOS || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 地图 ---------------- */
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    minZoom: 4,
    maxZoom: 18,
    zoomSnap: 1,
    zoomDelta: 0.5
  }).setView([43.2, 11.7], 6);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  /* 底图：均为免 Key 的公开瓦片服务
     light   = Esri Light Gray Canvas（极简浅灰，配本页米白界面），原生最高 z16
               local: true → 先读 tiles/ 里同一套瓦片（tools/fetch-tiles.mjs 下载），本地没有再走网络
     street  = OpenStreetMap 标准瓦片（街道与地名完整，找路用），原生最高 z17
     offline = 本地 tiles/ 目录，断网也能用
     maxNativeZoom 让它在更高级别时放大上一级瓦片，而不是显示空白 */
  const BASE = {
    light: {
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      native: 16,
      local: true,
      attr: 'Tiles &copy; Esri — Esri, DeLorme, HERE'
    },
    street: {
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      native: 17,
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    offline: {
      tiles: ['tiles/{z}/{x}/{y}.png'],
      native: 16,
      attr: '离线底图 · 已下载的城市范围'
    }
  };
  const BLANK_TILE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAABZJREFUaN7twTEBAAAAwqD1T20ND6AAAAtIAAGf0V7hAAAAAElFTkSuQmCC';
  const ITALY_BOUNDS = L.latLngBounds([36.0, 6.0], [47.5, 19.0]);   // 与 fetch-tiles 的全国范围一致
  const localTileUrl = (z, x, y) => `tiles/${z}/${x}/${y}.png`;

  /* 本地优先的瓦片层：本地文件几乎瞬时；缺了再取网络；网络也失败才给透明占位 */
  const LocalFirstLayer = L.TileLayer.extend({
    createTile(coords, done) {
      const tile = document.createElement('img');
      tile.alt = '';
      tile.setAttribute('role', 'presentation');
      const z = this._getZoomForUrl();
      const remote = this.getTileUrl(coords);
      L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
      L.DomEvent.on(tile, 'error', e => {
        if (!tile._remote) { tile._remote = true; tile.src = remote; return; }
        this._tileOnError(done, tile, e);
      });
      tile.src = localTileUrl(z, coords.x, coords.y);
      return tile;
    }
  });

  let baseLayers = [];
  let activeBase = 'light';

  function setBase(key) {
    baseLayers.forEach(l => map.removeLayer(l));
    const B = BASE[key];
    const Layer = B.local ? LocalFirstLayer : L.TileLayer;
    const common = {
      maxZoom: 19,
      errorTileUrl: BLANK_TILE,
      keepBuffer: 4,            // 多留一圈瓦片，来回拖动不再重新加载
      updateWhenIdle: false,    // 手机上拖动过程中也加载，而不是松手才开始
      updateInterval: 120
    };
    baseLayers = B.tiles.map((u, i) => new Layer(u, Object.assign({}, common, {
      maxNativeZoom: B.native,
      className: 'base-main',
      zIndex: 2,
      attribution: i === 0 ? B.attr : ''
    })));
    // 低清垫底层：全国 z≤9 的本地瓦片放大铺在下面；高清瓦片没到之前看到的是"略糊的地图"而不是空白
    if (B.local) {
      baseLayers.push(new Layer(B.tiles[0], Object.assign({}, common, {
        maxNativeZoom: 9,
        bounds: ITALY_BOUNDS,
        className: 'base-under',
        zIndex: 1
      })));
    }
    baseLayers.forEach(l => l.addTo(map));
    activeBase = key;

    // 瓦片加载进度：顶部细条，弱网时让人知道"还在加载"而不是"坏了"
    const wrap = document.getElementById('mapWrap');
    if (wrap && baseLayers[0]) {
      baseLayers[0].on('loading', () => wrap.classList.add('is-loading'));
      baseLayers[0].on('load', () => wrap.classList.remove('is-loading'));
    }
  }
  setBase('light');

  /* 飞行前预取目的地瓦片（目标级 + 上一级），落地时已在缓存里 */
  function prefetchView(center, zoom) {
    const B = BASE[activeBase];
    if (!B || !center) return;
    const size = map.getSize();
    const zr = Math.round(zoom);
    [zr, zr - 1].forEach(zt => {
      const z = Math.max(0, Math.min(zt, B.native));
      const half = size.divideBy(2 * map.getZoomScale(zoom, z));
      const p = map.project(center, z);
      const x0 = Math.floor((p.x - half.x) / 256), x1 = Math.floor((p.x + half.x) / 256);
      const y0 = Math.floor((p.y - half.y) / 256), y1 = Math.floor((p.y + half.y) / 256);
      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          const remote = L.Util.template(B.tiles[0], { x, y, z, s: 'a', r: '' });
          const img = new Image();
          if (B.local) {
            img.onerror = () => { img.onerror = null; img.src = remote; };
            img.src = localTileUrl(z, x, y);
          } else {
            img.src = remote;
          }
        }
      }
    });
  }

  /* 图层容器 */
  const G = {
    legs: L.layerGroup(),
    intra: L.layerGroup(),
    poi: L.layerGroup(),
    poiLabels: L.layerGroup(),
    hub: L.layerGroup(),
    transit: L.layerGroup(),
    food: L.layerGroup(),
    shop: L.layerGroup(),
    labels: L.layerGroup()
  };

  const dailyRoutes = [];   // {city, day, line, color}
  const poiMarkers = {};    // placeId -> marker
  const routePoints = {};   // `${city}:${day}` -> [ [lat,lng] ]

  /* ---------------- 编号：城市内唯一序号 + 当日顺序 ---------------- */
  /* "当日第几站"：按当前精力版本的 stops 算，与地图上当天的编号一致 */
  function seqOf(id) {
    for (const d of T.days) {
      const i = stopsOf(d).indexOf(id);
      if (i >= 0) return { n: i + 1, day: d.n };
    }
    return null;
  }

  /* 每个城市内景点的固定序号（按数据顺序，1..n，不重复） */
  const citySeq = {};
  T.cities.forEach(c => {
    T.places.filter(p => (p.base || p.city) === c.id)
      .forEach((p, i) => { citySeq[p.id] = i + 1; });
  });

  /* ---------------- 图标 ---------------- */
  /* 必看 = 金环 + 大一号；可跳过 = 小一号 + 淡；其余为常规 */
  function pinIcon(n, color, opts) {
    opts = opts || {};
    const tier = opts.tier;
    let cls = 'pin';
    let size = 26;
    if (tier === 'must') { cls += ' pin-must'; size = 30; }
    else if (tier === 'optional') { cls += ' pin-opt'; size = 21; }
    if (opts.dim) cls += ' is-dim';
    return L.divIcon({
      className: '',
      html: `<div class="${cls}" style="--c:${color}">${n}</div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -14]
    });
  }
  function hubIcon(color, label) {
    return L.divIcon({
      className: '',
      html: `<div class="pin-hub" style="--c:${color}">${label}</div>`,
      iconSize: [22, 22], iconAnchor: [11, 11]
    });
  }
  function foodIcon() {
    return L.divIcon({
      className: '',
      html: `<div class="pin-food">${ICON.food}</div>`,
      iconSize: [16, 16], iconAnchor: [8, 8]
    });
  }
  function arrowIcon(deg, color) {
    return L.divIcon({
      className: '',
      html: `<div class="route-arrow-wrap" style="transform:rotate(${deg}deg)"><i class="route-arrow" style="--c:${color}"></i></div>`,
      iconSize: [10, 10], iconAnchor: [5, 5]
    });
  }
  function bearing(a, b) {
    const φ1 = a[0] * Math.PI / 180, φ2 = b[0] * Math.PI / 180;
    const Δλ = (b[1] - a[1]) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  /* ---------------- 构建：城际交通 ---------------- */
  /* 车程标签位置（按路径比例）+ 总览时只显示主干三条高铁 */
  const TAG_RATIO = {
    l_fco_termini: 0.72, l_termini_smn: 0.45, l_smn_pisa: 0.74, l_smn_siena: 0.42,
    l_smn_sl: 0.62, l_sl_centrale: 0.42, l_cadorna_como: 0.55, l_cadorna_mxp: 0.62
  };
  const MAIN_LEGS = new Set(['l_termini_smn', 'l_smn_sl', 'l_sl_centrale']);
  const legLines = [];
  T.legs.forEach((leg, idx) => {
    const path = leg.path.filter(p => Array.isArray(p) && p.length === 2);
    if (path.length < 2) return;
    const isTravel = leg.mode.includes('高铁');
    const line = L.polyline(path, {
      color: '#1F5C4A',
      weight: isTravel ? 3 : 2,
      opacity: .78,
      dashArray: isTravel ? null : '2 7',
      lineCap: 'round',
      lineJoin: 'round',
      className: 'leg-line'
    });
    G.legs.addLayer(line);
    line._travel = isTravel;
    line._legId = leg.id;
    legLines.push(line);

    // 车程标签：放在路径中段，按序号错位，避免同城多条线标签叠在一起
    const tagPt = sampleAlong(path, TAG_RATIO[leg.id] || 0.5);
    if (tagPt) {
      const tag = L.marker(tagPt, {
        icon: L.divIcon({
          className: '',
          html: `<div class="route-tag major">${ICON.train}<span>${leg.mode}</span><b>${leg.dur}</b></div>`,
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        interactive: true,
        keyboard: false,
        zIndexOffset: 100
      });
      tag._isLegTag = true;
      tag._main = MAIN_LEGS.has(leg.id);
      tag.on('click', () => {
        toast(`${leg.mode} · ${leg.dur} · ${leg.km} km`);
      });
      G.legs.addLayer(tag);
    }

    // 方向箭头（每段中点）
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      G.legs.addLayer(L.marker(mid, {
        icon: arrowIcon(bearing(a, b), '#1F5C4A'),
        interactive: false, keyboard: false
      }));
    }
  });

  /* 城际标签偏移：避免与城市标签重叠 */
  /* ---------------- 构建：市内每日路线 ----------------
     低精力版只连当天 lite 里的点（车站、酒店保留），切换版本时整组重建 */
  const routeLayers = [];
  function buildDailyRoutes() {
    routeLayers.forEach(l => G.intra.removeLayer(l));
    routeLayers.length = 0;
    dailyRoutes.length = 0;
    Object.keys(T.routes).forEach(rcid => T.routes[rcid].forEach(r => {
      const keys = pathKeys(r);
      // 按城际段切开：一天的路径可能横跨两座城（换城日）或去了又回（一日游）
      const chunks = [[]];
      keys.forEach((k, i) => {
        if (i > 0 && legByPair[keys[i - 1] + '>' + k]) chunks.push([]);
        chunks[chunks.length - 1].push(k);
      });
      chunks.filter(c => c.length >= 2).forEach(ck => {
        const nodes = ck.map(nodePos);
        if (nodes.some(p => !p)) return;
        const cid = nodeCity(ck[0]) || rcid;
        const color = colorByCity(cid);
        const segs = loopGeometry(ck, nodes);

        // 相邻同类的段并成一条线：步行段一条粗线，换乘段一条细线
        const runs = [];
        segs.forEach(s => {
          const last = runs[runs.length - 1];
          if (last && last.ride === s.ride) last.pts.push(...s.pts.slice(1));
          else runs.push({ ride: s.ride, pts: s.pts.slice() });
        });
        runs.forEach(run => {
          const line = L.polyline(run.pts, { color, lineCap: 'round', lineJoin: 'round', interactive: false });
          line._city = cid;
          line._day = r.day;
          line._baseColor = color;
          line._stops = keys;
          line._ride = run.ride;
          line.setStyle(routeStyle(line, 'base'));
          dailyRoutes.push(line);
          routeLayers.push(line);
          G.intra.addLayer(line);
        });

        segs.forEach(s => {
          // 箭头：每段中点一个（弧线段放在弧的中点，方向与弦平行）
          if (Math.hypot(s.a[0] - s.b[0], s.a[1] - s.b[1]) >= 0.0025) {
            const m = L.marker(s.mid, { icon: arrowIcon(bearing(s.a, s.b), color), interactive: false, keyboard: false });
            m._city = cid;
            m._day = r.day;
            m._isArrow = true;
            routeLayers.push(m);
            G.intra.addLayer(m);
          }
          // 接住悬停 / 点击的透明宽线：悬停出一圈淡色并浮出这一段怎么走，点一下弹出卡片
          const hit = L.polyline(s.pts, { color, weight: 18, opacity: 0, lineCap: 'round', className: 'hop-hit', bubblingMouseEvents: false });
          hit._city = cid;
          hit._day = r.day;
          hit._isHit = true;
          hit._hop = [s.ka, s.kb];
          hit._mid = s.mid;
          if (CAN_HOVER) {
            hit.bindTooltip(() => hopHtml(s.ka, s.kb, r.day), { sticky: true, direction: 'top', offset: [0, -14], opacity: 1, className: 'tt-hop' });
            hit.on('mouseover', () => hit.setStyle({ opacity: .16 }));
            hit.on('mouseout', () => hit.setStyle({ opacity: 0 }));
          }
          hit.on('click', e => { hit.closeTooltip(); openHopPopup(s.ka, s.kb, r.day, e.latlng); });
          routeLayers.push(hit);
          G.intra.addLayer(hit);
        });
      });
    }));
  }

  /* ---------------- 每一段怎么走（data.js 的 hops；没写的按步行估算，火车段取 legs） ---------------- */
  const CAN_HOVER = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  const legByPair = {};
  T.legs.forEach(l => { legByPair[l.from + '>' + l.to] = l; legByPair[l.to + '>' + l.from] = l; });
  const STEP = {
    walk: ['步行', ICON.walk], metro: ['地铁', ICON.metro], tram: ['电车', ICON.tram], bus: ['公交', ICON.bus],
    train: ['火车', ICON.train], boat: ['水上巴士', ICON.boat], mover: ['People Mover', ICON.mover], funi: ['缆车', ICON.funi]
  };
  function nodePos(k) { return (poiMarkers[k] && poiMarkers[k]._ll) || pos(k); }
  function nodeCity(k) {
    if (HOTELS[k]) return k;
    const p = placeById[k]; if (p) return p.city;
    const h = hubByKey[k] || hubById[k]; return h ? h.city : null;
  }
  function nodeName(k) {
    if (HOTELS[k]) return '酒店';
    const p = placeById[k]; if (p) return p.short || p.name;
    const h = hubByKey[k] || hubById[k]; return h ? h.name : k;
  }
  // 一天的路径（按当前精力版本删掉没去的景点，车站、酒店保留），地图和日卡都用它
  function pathKeys(r) {
    const day = dayByN[r.day];
    const keep = isLite() && day && day.lite ? new Set(day.lite) : null;
    return (keep ? r.stops.filter(k => !placeById[k] || keep.has(k)) : r.stops)
      .filter((k, i, a) => i === 0 || k !== a[i - 1]);   // 删点后可能出现相邻重复
  }
  function routeOfDay(n) {
    for (const arr of Object.values(T.routes)) { const r = arr.find(x => x.day === n); if (r) return r; }
    return null;
  }
  function distM(a, b) {
    const R = 6371000, t = Math.PI / 180;
    const dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function hopOf(a, b) {
    const h = (T.hops || {})[a + '>' + b];
    const leg = legByPair[a + '>' + b] || null;
    if (h) return Object.assign({ leg }, h);
    if (leg) return { leg, sum: leg.mode, dur: leg.dur, steps: [['train', `${leg.mode}，${leg.km} km`]] };
    const pa = nodePos(a), pb = nodePos(b);
    const m = pa && pb ? Math.max(1, Math.round(distM(pa, pb) * 1.3 / 75)) : 10;
    return { sum: '步行', min: m, steps: [['walk', '步行', m]], taxi: m <= 10 ? '太近，不必打车' : Math.round(m / 3 + 4), est: true };
  }
  const fmtMin = m => m >= 60 ? `约 ${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分` : ''}` : `约 ${m} 分钟`;
  const hopTime = h => h.min ? fmtMin(h.min) : (h.dur || '');
  // 卡片里「打车」是单独一栏；日卡里只有一行小字，没提到打车的说明前面补上「打车：」
  const taxiText = (h, inline) => h.taxi == null ? '' : typeof h.taxi === 'number'
    ? (inline ? `打车约 ${h.taxi} 分钟` : `可以，约 ${h.taxi} 分钟`)
    : (inline && !/打车|出租/.test(h.taxi) ? '打车：' + h.taxi : h.taxi);
  // 这一段用到的交通方式图标（有车就不画步行），最多三个
  function hopIcons(h) {
    const ms = [...new Set(h.steps.map(s => s[0]))];
    const ride = ms.filter(m => m !== 'walk');
    return (ride.length ? ride : ms).slice(0, 3).map(m => (STEP[m] || STEP.walk)[1]).join('');
  }
  function hopHtml(a, b, dayN) {
    const h = hopOf(a, b);
    const showSteps = h.steps.length > 1 || (h.steps[0] && h.steps[0][1] !== h.sum && h.steps[0][1] !== '步行');
    const steps = showSteps ? `<div class="hp-steps">${h.steps.map(([m, t, n]) => `<div class="hp-step">${(STEP[m] || STEP.walk)[1]}<span>${esc(t)}</span>${n ? `<em>${n} 分</em>` : ''}</div>`).join('')}</div>` : '';
    const tx = taxiText(h);
    return `<div class="hp" style="--c:${colorByCity(nodeCity(a) || nodeCity(b))}">
      <div class="hp-od">D${dayN} · ${esc(nodeName(a))} → ${esc(nodeName(b))}</div>
      <div class="hp-sum"><span class="hp-ico">${hopIcons(h)}</span><b>${esc(h.sum)}</b><span class="hp-t">${hopTime(h)}</span></div>
      ${steps}
      ${h.alt ? `<div class="hp-row"><span>备选</span>${esc(h.alt)}</div>` : ''}
      ${tx ? `<div class="hp-row"><span>打车</span>${esc(tx)}</div>` : ''}
      ${h.est ? '<div class="hp-note">按距离估算的步行时间</div>' : ''}
    </div>`;
  }
  let hopPopup = null;
  function openHopPopup(a, b, dayN, latlng) {
    const narrow = window.innerWidth <= 860;
    hopPopup = L.popup({
      className: 'pop-hop', maxWidth: 300, minWidth: 236, closeButton: true, autoPan: true,
      autoPanPaddingTopLeft: narrow ? [16, 90] : [sideInset() + 24, 96],
      autoPanPaddingBottomRight: narrow ? [16, 110] : [24, 24]
    }).setLatLng(latlng).setContent(hopHtml(a, b, dayN)).openOn(map);
  }
  // 日卡里点某一段：镜头框住这一段，落地后在段中点弹出卡片
  function focusHop(a, b, dayN) {
    if (state.day !== dayN) focusDay(dayN, { keepScroll: true, noFly: true });
    let bounds = null, mid = null;
    const hit = routeLayers.find(l => l._isHit && l._day === dayN && l._hop[0] === a && l._hop[1] === b);
    if (hit) { bounds = hit.getBounds(); mid = hit._mid; }
    else {
      const leg = legByPair[a + '>' + b];
      const ll = leg && legLines.find(l => l._legId === leg.id);
      if (ll) { bounds = ll.getBounds(); mid = ll.getCenter(); }
    }
    if (!bounds) return;
    if (hopPopup) map.closePopup(hopPopup);
    map.once('moveend', () => setTimeout(() => openHopPopup(a, b, dayN, mid), 60));
    flyBounds(bounds.pad(0.35), { maxZoom: 16 });
  }

  /* 路线样式：景点之间的步行段粗而实；进出酒店 / 车站的换乘段（地铁、电车、船）细一档、淡一档 */
  function routeStyle(line, mode) {
    const ride = line._ride;
    if (mode === 'active') return ride ? { weight: 2.2, opacity: .72, dashArray: null } : { weight: 3.6, opacity: .95, dashArray: null };
    if (mode === 'hover') return ride ? { weight: 2.2, opacity: .78, dashArray: null } : { weight: 3.4, opacity: .95, dashArray: null };
    if (mode === 'dim') return ride ? { weight: 1.8, opacity: .07, dashArray: '2 6' } : { weight: 2.4, opacity: .1, dashArray: '5 6' };
    return ride ? { weight: 1.8, opacity: .45, dashArray: '2 6' } : { weight: 2.4, opacity: .62, dashArray: '5 6' };
  }

  /* 环线几何：进出酒店 / 车站的换乘段、来回走同一段的，画成向外鼓的弧，
     去程和回程分到两边，一天的路线读起来是"从酒店出发、绕一圈、回到酒店"的环；景点之间的步行段保持直线 */
  function loopGeometry(keys, nodes) {
    const lat0 = nodes.reduce((s, p) => s + p[0], 0) / nodes.length;
    const kx = Math.cos(lat0 * Math.PI / 180);
    const xy = p => [p[1] * kx, p[0]];
    const ll = q => [q[1], q[0] / kx];
    const uniq = [...new Set(keys)].map(k => xy(nodes[keys.indexOf(k)]));
    const cen = [uniq.reduce((s, q) => s + q[0], 0) / uniq.length, uniq.reduce((s, q) => s + q[1], 0) / uniq.length];
    const pairs = new Set(keys.slice(1).map((k, i) => keys[i] + '>' + k));
    const segs = [];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const ride = !placeById[keys[i]] || !placeById[keys[i + 1]];
      const back = pairs.has(keys[i + 1] + '>' + keys[i]);
      const ka = keys[i], kb = keys[i + 1];
      if (!ride && !back) { segs.push({ a, b, ka, kb, ride, pts: [a, b], mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }); continue; }
      const A0 = xy(a), B0 = xy(b);
      const dx = B0[0] - A0[0], dy = B0[1] - A0[1], len = Math.hypot(dx, dy) || 1e-9;
      const nx = dy / len, ny = -dx / len;                       // 行进方向的右侧
      // 同一段来回：都往各自右边鼓，自然分开；其余：往远离整条线重心的一侧鼓，环不会自交
      const cross = dx * (cen[1] - A0[1]) - dy * (cen[0] - A0[0]);
      const side = back || Math.abs(cross) < len * len * 0.03 ? 1 : (cross > 0 ? 1 : -1);
      const k = (back ? 0.22 : 0.2) * side;
      const C = [(A0[0] + B0[0]) / 2 + nx * len * k, (A0[1] + B0[1]) / 2 + ny * len * k];
      const pts = [a];
      for (let s = 1; s <= 18; s++) {
        const t = s / 18, u = 1 - t;
        pts.push(ll([u * u * A0[0] + 2 * u * t * C[0] + t * t * B0[0], u * u * A0[1] + 2 * u * t * C[1] + t * t * B0[1]]));
      }
      segs.push({ a, b, ka, kb, ride, pts, mid: ll([.25 * A0[0] + .5 * C[0] + .25 * B0[0], .25 * A0[1] + .5 * C[1] + .25 * B0[1]]) });
    }
    return segs;
  }

  /* ---------------- 路线流动层 ----------------
     当天路线上流动的光点、总览时高铁线上跑的列车光点。单独一个 SVG 渲染器放在自己的层里，
     动画只重绘这一小层，不牵动其他路线和标记 */
  map.createPane('flowPane');
  map.getPane('flowPane').style.zIndex = 450;
  map.getPane('flowPane').style.pointerEvents = 'none';
  const flowRenderer = L.svg({ pane: 'flowPane', padding: 0.3 });
  const flowGroup = L.layerGroup().addTo(map);
  const FLOW = { renderer: flowRenderer, color: '#FFFDF8', opacity: 1, lineCap: 'round', lineJoin: 'round', interactive: false };
  function updateFlows(hoverLines) {
    flowGroup.clearLayers();
    const lines = hoverLines || (state.day ? dailyRoutes.filter(l => l._day === state.day) : []);
    if (map.hasLayer(G.intra)) {
      lines.forEach(l => {
        const el = l.getElement && l.getElement();
        if (!el || el.style.display === 'none') return;
        if (l._ride) return;   // 换乘段很长、横跨大半屏，逐帧重绘代价大；方向靠箭头
        flowGroup.addLayer(L.polyline(l.getLatLngs(), Object.assign({ className: 'route-flow', weight: 3 }, FLOW)));
      });
    }
    if (!state.day && !hoverLines && state.layers.legs && state.mode === 'overview' && map.getZoom() < 9.8) {
      // 每段高铁一颗"列车"光点：pathLength 归一，长短线一样的节奏；错开起步
      // 底下一层宽而淡的光晕，上面一层亮芯：读起来是"一列车在跑"，而不是线断了一截
      legLines.filter(l => l._travel).forEach((l, i) => {
        [{ className: 'leg-flow leg-halo', weight: 10, color: '#1F5C4A', opacity: .2 },
         { className: 'leg-flow', weight: 3.4 }].forEach(o => {
          const fl = L.polyline(l.getLatLngs(), Object.assign({}, FLOW, o));
          flowGroup.addLayer(fl);
          const el = fl.getElement();
          if (el) { el.setAttribute('pathLength', '100'); el.style.animationDelay = (-i * 1.1) + 's'; }
        });
      });
    }
  }

  function colorByCity(cid) {
    const c = cityById[cid];
    if (!c) return '#0F4C3A';
    return c.parent ? cityById[c.parent].color : c.color;
  }

  /* ---------------- 构建：景点 ---------------- */
  const placedPts = [];
  const labelMarkers = {};
  T.places.forEach((p, pIdx) => {
    const base = pos(p.key);
    if (!base) return;

    // 同一广场上的多个点（如大教堂/钟楼/洗礼堂）互相推开几十米，避免标记重叠
    let ll = base;
    let k = 0;
    while (k < 9 && placedPts.some(q => Math.hypot(q[0] - ll[0], q[1] - ll[1]) < 0.00115)) {
      k++;
      const r = 0.00092 * Math.ceil(k / 3);
      const a = k * 2.2;
      ll = [base[0] + r * Math.sin(a), base[1] + r * Math.cos(a)];
    }
    placedPts.push(ll);

    const color = colorOf(p.base || p.city);
    const n0 = citySeq[p.id] || '·';
    const m = L.marker(ll, { icon: pinIcon(n0, color, { tier: p.tier }), riseOnHover: true });
    m._place = p;
    m._city = p.base || p.city;
    m._citySeq = n0;
    m._shown = n0;
    m._ll = ll;
    m.on('click', () => selectPlace(p.id, { fly: false }));
    // 悬停预览：照片 + 类别 / 时长；名称标签已经显示时卡片里不再重复名字（触屏直接点开详情）
    if (!L.Browser.mobile) m.bindTooltip(() => photoTip(p), { direction: 'top', offset: [0, -18], opacity: 1, className: 'tt-photo' });

    // 悬停时高亮经过这个景点的当日路线
    m.on('mouseover', () => highlightRoutesOf(p.id, true));
    m.on('mouseout', () => highlightRoutesOf(p.id, false));

    poiMarkers[p.id] = m;
    G.poi.addLayer(m);

    // 名称标签：与序号点分离，按条件显隐（见 updateLabels）
    const side = (pIdx % 2 === 0) ? 'right' : 'left';
    const lab = L.marker(ll, {
      icon: L.divIcon({
        className: '',
        html: `<div class="poi-label ${side}${p.tier === 'must' ? ' is-must' : p.tier === 'optional' ? ' is-opt' : ''}">${p.short || p.name}</div>`,
        iconSize: [0, 0], iconAnchor: [0, 0]
      }),
      interactive: false, keyboard: false, zIndexOffset: -20
    });
    lab._city = p.base || p.city;
    lab._placeId = p.id;
    labelMarkers[p.id] = lab;
    G.poiLabels.addLayer(lab);
  });

  /* 悬停预览卡：照片 + 一行说明 */
  function photoCard(photoId, name, meta) {
    const cap = `<div class="pv-cap">${name ? `<b>${esc(name)}</b>` : ''}<span>${esc(meta)}</span></div>`;
    return PHOTOS[photoId]
      ? `<div class="pv"><img src="photos/${photoId}_s.jpg" alt="" width="224" height="140">${cap}</div>`
      : `<div class="pv pv-noimg">${cap}</div>`;
  }
  function photoTip(p) {
    const lab = labelMarkers[p.id];
    const inner = lab && lab.getElement && lab.getElement() && lab.getElement().querySelector('.poi-label');
    const labelShown = inner && inner.style.opacity === '1' && map.hasLayer(G.poiLabels);
    return photoCard(p.id, labelShown ? '' : p.name,
      `${p.cat} · ${p.dur}${p.booking && p.booking.level === 'required' ? ' · 需预约' : ''}`);
  }

  /* 悬停高亮经过某景点的路线 */
  function highlightRoutesOf(placeId, on) {
    if (state.day) return;   // 已经有当日高亮时不再叠加
    const hits = dailyRoutes.filter(line => line._stops && line._stops.includes(placeId));
    hits.forEach(line => line.setStyle(routeStyle(line, on ? 'hover' : 'base')));
    updateFlows(on ? hits : undefined);
  }

  buildDailyRoutes();   // 景点标记建好之后再连线

  /* ---------------- 构建：枢纽 ---------------- */
  T.hubs.forEach(h => {
    const ll = pos(h.key);
    if (!ll) return;
    const color = colorOf(h.city);
    const label = h.kind === 'airport' ? ICON.plane : ICON.train;
    const m = L.marker(ll, { icon: hubIcon(color, label), zIndexOffset: 400 });
    m._hub = h;
    m._city = h.city;
    m.on('click', () => openHub(h.id));
    // 车站没有常驻名称标签，预览卡里带上名字
    if (!L.Browser.mobile) m.bindTooltip(() => photoCard(h.key, h.name, h.it), { direction: 'top', offset: [0, -16], opacity: 1, className: 'tt-photo' });
    else m.bindTooltip(h.name, { direction: 'top', offset: [0, -12], className: 'tt-name' });
    G.hub.addLayer(m);
  });

  /* ---------------- 构建：住宿区 → 车站 连线 ---------------- */
  MAIN_CITIES.forEach(cid => {
    const h = HOTELS[cid];
    const st = cityById[cid].station;
    const a = h.coord, b = pos(st.key);
    if (!a || !b) return;

    const line = L.polyline([a, b], {
      color: colorByCity(cid), weight: 1.6, opacity: .5, dashArray: '1 5', lineCap: 'round'
    });
    line._city = cid;
    line._isHotelLink = true;
    G.intra.addLayer(line);

    const hotelMarker = L.marker(a, {
      icon: L.divIcon({
        className: '',
        html: `<div class="pin-hotel" style="--c:${colorByCity(cid)}">${ICON.bed}</div>`,
        iconSize: [22, 22], iconAnchor: [11, 11]
      }),
      title: h.name, zIndexOffset: 300
    });
    hotelMarker._city = cid;
    hotelMarker._isHotel = true;
    hotelMarker.on('click', () => showHotel(cid));
    hotelMarker.bindTooltip(`${h.name} · 到车站 ${h.toStation}`, { direction: 'top', offset: [0, -12], className: 'tt-name' });
    G.intra.addLayer(hotelMarker);
  });

  /* ---------------- 构建：市内公交 ---------------- */
  T.transit.forEach(t => {
    const color = t.color;
    const path = t.path.filter(p => Array.isArray(p) && p.length === 2);
    const line = L.polyline(path, {
      color, weight: 3, opacity: .72,
      dashArray: t.dash ? '7 6' : null,
      lineCap: 'round', lineJoin: 'round'
    });
    line._city = t.city;
    G.transit.addLayer(line);

    // 站点小点 + 首末站标签
    t.stations.forEach((name, i) => {
      // 站点坐标沿折线均分采样
      const pt = sampleAlong(path, i / Math.max(1, t.stations.length - 1));
      if (!pt) return;
      const dot = L.circleMarker(pt, {
        radius: 2.6, color: '#fff', weight: 1.2, fillColor: color, fillOpacity: 1
      });
      dot._city = t.city;
      G.transit.addLayer(dot);
    });

    const mid = sampleAlong(path, 0.5);
    if (mid) {
      const tag = L.marker(mid, {
        icon: L.divIcon({
          className: '',
          html: `<div class="transit-tag" style="--c:${color}">${t.name}</div>`,
          iconSize: [0, 0], iconAnchor: [0, 0]
        }),
        interactive: true, keyboard: false
      });
      tag._city = t.city;
      tag.bindTooltip(`${t.name}<br><span style="color:#8B8579;font-size:10.5px">${t.note}</span>`, { direction: 'top', offset: [0, -4], className: 'tt-name' });
      G.transit.addLayer(tag);
    }
  });

  function sampleAlong(path, t) {
    if (!path || path.length < 2) return null;
    // 按累计距离采样
    const segs = [];
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const d = Math.hypot(path[i][0] - path[i + 1][0], path[i][1] - path[i + 1][1]);
      segs.push(d); total += d;
    }
    let target = total * t;
    for (let i = 0; i < segs.length; i++) {
      if (target <= segs[i]) {
        const r = segs[i] === 0 ? 0 : target / segs[i];
        return [
          path[i][0] + (path[i + 1][0] - path[i][0]) * r,
          path[i][1] + (path[i + 1][1] - path[i][1]) * r
        ];
      }
      target -= segs[i];
    }
    return path[path.length - 1];
  }

  /* ---------------- 构建：餐厅 ---------------- */
  T.food.forEach(f => {
    const ll = pos(f.key);
    if (!ll) return;
    const p = placeByKey(f.key);
    const cityId = p ? (p.base || p.city) : f.city;
    // 轻微偏移避免与景点重合
    const off = [ll[0] + 0.00085, ll[1] + 0.00085];
    const m = L.marker(off, { icon: foodIcon(), title: f.name });
    m._city = cityId;
    m.on('click', () => buildFoodCard(f));
    m.bindTooltip(`${f.name} · ${f.price}`, { direction: 'top', offset: [0, -10], className: 'tt-name' });
    G.food.addLayer(m);
  });

  function placeByKey(key) {
    return T.places.find(p => p.key === key);
  }

  /* ---------------- 构建：购物区 ---------------- */
  T.areas.forEach(a => {
    const circle = L.circle(a.center, {
      radius: a.radius,
      color: a.color, weight: 1.5, opacity: .55,
      fillColor: a.color, fillOpacity: .09,
      dashArray: '3 4'
    });
    circle._city = a.city;
    circle.on('click', () => buildAreaCard(a));
    circle.bindTooltip(a.name, { direction: 'center', className: 'area-label', permanent: true, opacity: 1 });
    G.shop.addLayer(circle);
  });

  /* ---------------- 构建：城市标签 ---------------- */
  T.cities.forEach((c, ci) => {
    const ll = c.center;
    const main = !c.parent;
    const label = L.marker(ll, {
      icon: L.divIcon({
        className: '',
        html: `<div class="city-label ${main ? 'is-main' : ''}" style="color:${main ? c.color : colorByCity(c.id)};--d:${ci * 70}ms">${c.name}</div>`,
        iconSize: [96, 24], iconAnchor: [48, 12]
      }),
      interactive: main, keyboard: false,
      zIndexOffset: 5000
    });
    label._city = c.id;
    label._isLabel = true;
    label._isExcursion = !main;
    if (main) {
      label.on('click', () => openCity(c.id));
      label.bindTooltip('点击进入城市视图', { direction: 'bottom', offset: [0, 10], className: 'tt-name' });
    }
    G.labels.addLayer(label);
  });

  /* ---------------- 可见性同步 ---------------- */
  function cityVisible(cid) {
    if (state.mode === 'overview') return true;
    if (cid === state.city) return true;
    const c = cityById[cid];
    if (c && c.parent === state.city) return true;   // 一日游城市随主城显示
    return false;
  }

  /* zGroups：按这个级别决定挂哪些图层（飞行预热用目的地级别），其余显隐仍按当前级别 */
  function syncVisibility(zGroups) {
    // 渐进披露：总览时只留城市与城际线，放大后再出现车站、景点
    const z = map.getZoom();
    const zg = zGroups != null ? zGroups : z;
    const detailOK = zg >= 9.8;
    const hubOK = zg >= 7.5;

    Object.keys(G).forEach(gk => {
      if (gk === 'labels') return;
      let want = !!state.layers[gk];
      if (gk === 'poi' || gk === 'intra' || gk === 'food' || gk === 'shop' || gk === 'transit') want = want && detailOK;
      if (gk === 'poiLabels') want = state.layers.poi && detailOK;
      if (gk === 'hub') want = want && hubOK;
      if (!want) {
        if (map.hasLayer(G[gk])) map.removeLayer(G[gk]);
      } else {
        if (!map.hasLayer(G[gk])) map.addLayer(G[gk]);
      }
    });

    // 城市标签只在总览模式
    if (state.mode === 'overview') {
      if (!map.hasLayer(G.labels)) map.addLayer(G.labels);
    } else if (map.hasLayer(G.labels)) {
      map.removeLayer(G.labels);
    }

    // 逐元素按城市过滤
    [G.poi, G.poiLabels, G.hub, G.intra, G.transit, G.food, G.shop].forEach(group => {
      group.eachLayer(l => {
        const cid = l._city;
        if (!cid) return;
        const ok = cityVisible(cid);
        const el = l.getElement && l.getElement();
        const want = ok ? '' : 'none';
        if (el && el.style.display !== want) el.style.display = want;
      });
    });

    // 日期高亮
    applyDayHighlight();

    // 城际车程标签：总览只留主干，放大后显示支线与机场线；窄屏需要更大缩放才显示
    const narrow = window.innerWidth <= 860;
    const legTagOK = z >= (narrow ? 10 : 8.5);
    G.legs.eachLayer(l => {
      if (!l._isLegTag) return;
      const el = l.getElement && l.getElement();
      const show = narrow ? (z >= 10) : (l._main || legTagOK);
      if (el) el.style.display = show ? '' : 'none';
    });

    syncCityLabels(z);
  }
  /* 一日游城市名只在放大后出现，避免总览拥挤；景点一出现（≥10 级）城市名就收起，免得压在景点上 */
  function syncCityLabels(z) {
    G.labels.eachLayer(l => {
      const el = l.getElement && l.getElement();
      if (!el) return;
      const want = (z >= 10 || (l._isExcursion && z < 8.5)) ? 'none' : '';
      if (el.style.display !== want) el.style.display = want;
    });
  }

  /* 用 setStyle 控制矢量，用 opacity 控制 marker */
  let lastAnimDay;
  function applyDayHighlight() {
    const d = state.day;
    const day = d ? T.days.find(x => x.n === d) : null;

    // 景点：选中某天时，该天景点显示「当日顺序」，其余显示城市内固定序号并淡出
    Object.entries(poiMarkers).forEach(([id, m]) => {
      const p = m._place;
      let n = m._citySeq || '·';
      let inDay = true;
      if (day) {
        const idx = stopsOf(day).indexOf(id);
        if (idx >= 0) n = idx + 1;
        else inDay = false;
      }
      if (m._shown !== n) {
        m.setIcon(pinIcon(n, colorOf(p.base || p.city), { tier: p.tier }));
        m._shown = n;
      }
      const root = m.getElement && m.getElement();
      if (!root) return;
      const pin = root.querySelector('.pin') || root;
      pin.classList.toggle('is-dim', !inDay);
      pin.classList.toggle('is-active', !!state.selected && state.selected === p.id);
    });
    // 路线
    const dChanged = lastAnimDay !== d;
    lastAnimDay = d;
    dailyRoutes.forEach(line => {
      const active = d && line._day === d;
      line.setStyle(routeStyle(line, active ? 'active' : d ? 'dim' : 'base'));
      if (active && dChanged && !mapEl.classList.contains('hold')) animatePath(line);
    });
    // 箭头
    G.intra.eachLayer(l => {
      if (l._isHit) {
        const he = l.getElement && l.getElement();
        if (he) he.style.pointerEvents = !d || l._day === d ? '' : 'none';
        return;
      }
      if (!l._isArrow) return;
      const el = l.getElement && l.getElement();
      if (!el) return;
      el.style.opacity = d ? (l._day === d ? '1' : '.08') : '1';
      el.classList.toggle('is-on', !!d && l._day === d);   // 当天的箭头往前探
    });

    updateFlows();
    updateLabels();
  }

  function belongsToDay(placeId, dayNum) {
    const d = T.days.find(x => x.n === dayNum);
    if (!d) return false;
    if (d.stops.includes(placeId)) return true;
    // routes 里同一天也可能包含
    return Object.values(T.routes).some(rs =>
      rs.some(r => r.day === dayNum && r.stops.includes(placeId))
    );
  }

  /* 路线绘制动画：从起点"画"到终点 */
  function animatePath(line) {
    const el = line.getElement && line.getElement();
    if (!el) return;
    // pathLength=1 让虚线长度按整条线归一，只写不读，不触发排版
    el.setAttribute('pathLength', '1');
    el.style.transition = 'none';
    el.style.strokeDasharray = '1';
    el.style.strokeDashoffset = '1';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset .85s cubic-bezier(.22,.61,.36,1)';
      el.style.strokeDashoffset = '0';
    }));
    setTimeout(() => {
      el.removeAttribute('pathLength');
      el.style.transition = '';
      el.style.strokeDasharray = '';
      el.style.strokeDashoffset = '';
    }, 1000);
  }

  /* 景点名称标签的显隐 + 自动避让
     规则：选中某天 → 只显示当天景点；否则放大到 13.2 级以上显示
     放置：按城市内序号优先，依次尝试 右/左/上/下，与已占位矩形相交则换方向，全冲突则隐藏 */
  const R_OVERLAP = 2;   // 允许 2px 容差
  function rect(x, y, w, h) { return { x, y, w, h }; }
  function hits(a, b) {
    return a.x < b.x + b.w - R_OVERLAP && a.x + a.w - R_OVERLAP > b.x &&
           a.y < b.y + b.h - R_OVERLAP && a.y + a.h - R_OVERLAP > b.y;
  }
  function measureLabel(s, fs) {
    let w = 0;
    for (const ch of s) w += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? fs : fs * 0.56;
    return w + 9;
  }

  function setLabel(id, show, dir) {
    const lab = labelMarkers[id];
    const el = lab && lab.getElement && lab.getElement();
    if (!el) return;
    const inner = el.querySelector('.poi-label');
    if (!inner) return;
    if (!show) { inner.style.opacity = '0'; return; }
    inner.style.opacity = '1';
    const T = {
      right: 'translate(16px, -50%)',
      left: 'translate(calc(-100% - 16px), -50%)',
      top: 'translate(-50%, calc(-100% - 12px))',
      bottom: 'translate(-50%, 13px)',
      tr: 'translate(12px, calc(-100% - 12px))',
      tl: 'translate(calc(-100% - 12px), calc(-100% - 12px))',
      br: 'translate(12px, 13px)',
      bl: 'translate(calc(-100% - 12px), 13px)'
    };
    inner.style.transform = T[dir] || T.right;
  }

  function updateLabels() {
    const z = map.getZoom();
    const d = state.day ? T.days.find(x => x.n === state.day) : null;
    const showAll = !d && z >= 13.2;

    // 1) 占位：只算仍然清晰的 pin。选中某天时其他点已淡出，不参与占位
    const occupied = [];
    Object.entries(poiMarkers).forEach(([id, m]) => {
      if (d && !stopsOf(d).includes(id)) return;
      const el = m.getElement && m.getElement();
      if (!el || el.style.display === 'none') return;
      const pt = map.latLngToContainerPoint(m.getLatLng());
      occupied.push(rect(pt.x - 15, pt.y - 15, 30, 30));
    });

    // 2) 收集候选，按城市内序号排序（越靠前越优先拿到好位置）
    const items = [];
    Object.entries(labelMarkers).forEach(([id, lab]) => {
      const p = placeById[id];
      if (!p) return;
      const visible = d ? stopsOf(d).includes(id) : (showAll && cityVisible(lab._city));
      if (!visible) { setLabel(id, false); return; }
      items.push({ id, name: p.short || p.name, pt: map.latLngToContainerPoint(lab.getLatLng()) });
    });
    items.sort((a, b) => (citySeq[a.id] || 99) - (citySeq[b.id] || 99));

    // 3) 贪心放置：右/左/上/下/四角，放不下就隐藏
    items.forEach(it => {
      const fs = 11, h = 14;   // 与 .poi-label 的 font-size 同步
      const w = measureLabel(it.name, fs);
      const g = 16, vg = 12;
      const cands = [
        ['right', rect(it.pt.x + g, it.pt.y - h / 2, w, h)],
        ['left', rect(it.pt.x - g - w, it.pt.y - h / 2, w, h)],
        ['top', rect(it.pt.x - w / 2, it.pt.y - vg - h, w, h)],
        ['bottom', rect(it.pt.x - w / 2, it.pt.y + vg, w, h)],
        ['tr', rect(it.pt.x + 12, it.pt.y - vg - h, w, h)],
        ['tl', rect(it.pt.x - 12 - w, it.pt.y - vg - h, w, h)],
        ['br', rect(it.pt.x + 12, it.pt.y + vg, w, h)],
        ['bl', rect(it.pt.x - 12 - w, it.pt.y + vg, w, h)]
      ];
      let pick = null;
      for (const [dir, r] of cands) {
        if (!occupied.some(o => hits(o, r))) { pick = [dir, r]; break; }
      }
      if (!pick) { setLabel(it.id, false); return; }
      setLabel(it.id, true, pick[0]);
      occupied.push(pick[1]);
    });
  }

  /* ---------------- 详情面板 ---------------- */
  const detail = $('#detail');
  const detailBody = $('#detailBody');

  function closeDetail() {
    detail.classList.remove('is-open');
    detail.setAttribute('aria-hidden', 'true');
    state.selected = null;
    applyDayHighlight();
  }
  $('#detailClose').addEventListener('click', closeDetail);

  function openDetail(html) {
    detailBody.innerHTML = html;
    detailBody.scrollTop = 0;
    detail.classList.add('is-open');
    detail.setAttribute('aria-hidden', 'false');
    bindDetailEvents();
  }

  const showDetail = openDetail;   // 兼容别名

  function bindDetailEvents() {
    const el = $('#detailBody');
    const act = el.querySelector('[data-act="center"]');
    if (act) act.addEventListener('click', () => {
      if (state._focus) flyToPlace(state._focus, Math.max(map.getZoom(), 15.5));
    });
    el.querySelectorAll('[data-nav]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-nav');
        if (id) goTo(id);
      });
    });
    el.querySelectorAll('[data-copy]').forEach(b => {
      b.addEventListener('click', async () => {
        const txt = b.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(txt);
          toast('已复制：' + txt);
        } catch {
          toast(txt);
        }
      });
    });
    el.querySelectorAll('[data-open-station]').forEach(b => {
      b.addEventListener('click', () => {
        const cid = b.getAttribute('data-open-station');
        const st = cityById[cid] && cityById[cid].station;
        if (!st) return;
        const hub = T.hubs.find(x => x.key === st.key);
        openCity(cid);
        if (hub) {
          openHub(hub.id);
          const ll = pos(hub.key);
          if (ll) flyToPlace(ll, 15.2);
        }
      });
    });
  }

  function badgeOf(b) {
    if (!b) return '';
    if (b.level === 'required') return `<span class="badge req">必须预约</span>`;
    if (b.level === 'recommended') return `<span class="badge rec">建议预约</span>`;
    return `<span class="badge free">免预约</span>`;
  }

  /* 详情面板的公共片段 */
  function heroHtml(color, kicker, title, sub, mark, photoId) {
    const ph = photoId && PHOTOS[photoId];
    return `<div class="d-hero${ph ? ' has-photo' : ''}" style="--c:${color}">
        ${ph
          ? `<img class="d-hero-img" src="photos/${photoId}.jpg" alt="" decoding="async">`
          : `<div class="d-hero-pattern"></div><div class="d-hero-mark" aria-hidden="true">${mark || ''}</div>`}
        <div class="d-hero-txt">
          <div class="d-kicker">${kicker}</div>
          <h2>${title}</h2>
          ${sub ? `<div class="it-name">${sub}</div>` : ''}
        </div>
      </div>`;
  }
  function creditHtml(photoId) {
    const ph = photoId && PHOTOS[photoId];
    if (!ph) return '';
    return `<p class="d-credit">图片 · ${esc(ph.artist || '佚名')} · ${esc(ph.license)} · <a href="${esc(ph.page)}" target="_blank" rel="noopener">Wikimedia Commons</a></p>`;
  }
  function factRow(icon, k, v) {
    return `<div class="d-fact"><div class="k">${ICON[icon] || ''}<span>${k}</span></div><div class="v">${v}</div></div>`;
  }
  function nameOf(id) {
    const x = placeById[id] || hubById[id] || hubByKey[id];
    return x ? x.name : id;
  }
  function navBtn(id, dir) {
    return dir === 'prev'
      ? `<button data-nav="${id}"><span>${ICON.arrowL}上一站</span><b>${nameOf(id)}</b></button>`
      : `<button data-nav="${id}" class="is-next"><span>下一站${ICON.arrowR}</span><b>${nameOf(id)}</b></button>`;
  }
  function mapsLink(query, label, primary) {
    return `<a ${primary ? 'class="primary" ' : ''}href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noopener">${ICON.ext}<span>${label || 'Google Maps'}</span></a>`;
  }
  const centerBtn = `<button data-act="center">${ICON.locate}<span>居中</span></button>`;

  /* 统一导航：景点或车站都能跳 */
  function goTo(id) {
    if (placeById[id]) { selectPlace(id, { fly: true }); return; }
    const h = T.hubs.find(x => x.key === id || x.id === id);
    if (h) {
      openHub(h.id);
      const ll = pos(h.key);
      if (ll) flyToPlace(ll, Math.max(map.getZoom(), 15.2));
      return;
    }
    const hot = Object.keys(HOTELS).find(c => HOTELS[c].key === id);
    if (hot) showHotel(hot);
  }

  function showHotel(cid) {
    const h = HOTELS[cid];
    state._focus = h.coord;
    flyToPlace(h.coord, 15.2);
    buildHotelCard(cid);
  }

  /* 桌面端侧栏是浮在全幅地图上的玻璃面板：取它的右边缘作为可见地图的左界（移动端侧栏是抽屉，记 0） */
  let sideInsetCache = null;
  function sideInset() {
    if (window.innerWidth <= 860) return 0;
    if (sideInsetCache == null) {
      const s = $('#side');
      sideInsetCache = s ? Math.max(0, Math.round(s.getBoundingClientRect().right)) : 0;
    }
    return sideInsetCache;
  }
  window.addEventListener('resize', () => { sideInsetCache = null; });
  /* flyToBounds / fitBounds 的留白：左让侧栏，上让顶栏与时间线 */
  function viewPad() {
    if (window.innerWidth <= 860) return {};
    return { paddingTopLeft: [sideInset() + 24, 100], paddingBottomRight: [24, 24] };
  }
  /* flyTo 用：让 ll 落在侧栏右侧可见区的正中 */
  function centerFor(ll, z) {
    const p = map.project(ll, z);
    p.x -= sideInset() / 2;
    return map.unproject(p, z);
  }
  /* 打开详情时：桌面端目标点放到侧栏与详情卡（392 + 12 边距）之间的正中；
     移动端详情是底部抽屉（高 64%，见 app.css），目标点放到抽屉上方那条可见地图的中间 */
  function focusPoint(ll, z) {
    const p = map.project(ll, z);
    if (window.innerWidth <= 860) {
      const H = map.getSize().y;
      p.y += H / 2 - (64 + H * 0.36) / 2;   // 64 = 顶栏占用
    } else {
      p.x += (404 - sideInset()) / 2;
    }
    return map.unproject(p, z);
  }
  function flyToPlace(ll, z) {
    flyView(focusPoint(ll, z), z);
  }

  /* ================================================================
     镜头：飞行、跨尺度过场、平滑缩放
     ================================================================ */

  /* 时间曲线：缓起、中段快、长而柔的落地（替换 Leaflet flyTo 的 ease-out，起步不再"猛一下"） */
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t;
    const sy = t => ((ay * t + by) * t + cy) * t;
    const dsx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(t) - x, d = dsx(t);
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(Math.max(0, Math.min(1, t)));
    };
  }
  const easeFly = cubicBezier(0.45, 0.05, 0.2, 1);

  /* 沿用 Leaflet 1.9 flyTo 的 van Wijk 最优路径（远距离先拉远再推近），只换时间曲线 */
  map.flyTo = function (targetCenter, targetZoom, options) {
    options = options || {};
    if (options.animate === false || !L.Browser.any3d) return this.setView(targetCenter, targetZoom, options);
    this._stop();
    const from = this.project(this.getCenter()), to = this.project(targetCenter);
    const size = this.getSize(), startZoom = this._zoom;
    targetCenter = L.latLng(targetCenter);
    targetZoom = targetZoom === undefined ? startZoom : targetZoom;
    const w0 = Math.max(size.x, size.y), w1 = w0 * this.getZoomScale(startZoom, targetZoom);
    const u1 = to.distanceTo(from) || 1, rho = 1.42, rho2 = rho * rho;
    const r = i => {
      const s1 = i ? -1 : 1, s2 = i ? w1 : w0;
      const t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1;
      const b = t1 / (2 * s2 * rho2 * u1);
      const sq = Math.sqrt(b * b + 1) - b;
      return sq < 1e-9 ? -18 : Math.log(sq);
    };
    const sinh = n => (Math.exp(n) - Math.exp(-n)) / 2;
    const cosh = n => (Math.exp(n) + Math.exp(-n)) / 2;
    const tanh = n => sinh(n) / cosh(n);
    const r0 = r(0);
    const w = s => w0 * (cosh(r0) / cosh(r0 + rho * s));
    const u = s => w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2;
    const S = (r(1) - r0) / rho;
    const duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;
    const start = performance.now();
    const frame = () => {
      const t = (performance.now() - start) / duration;
      if (t <= 1) {
        const sv = easeFly(t) * S;
        this._flyToFrame = L.Util.requestAnimFrame(frame, this);
        this._move(
          this.unproject(from.add(to.subtract(from).multiplyBy(u(sv) / u1)), startZoom),
          this.getScaleZoom(w0 / w(sv), startZoom),
          { flyTo: true });
      } else {
        this._move(targetCenter, targetZoom)._moveEnd(true);
      }
    };
    this._moveStart(true, options.noMoveStart);
    frame();
    return this;
  };

  /* 飞行时长：按缩放跨度和距离算，全国 ↔ 城市约 1.7 秒，城内跳转约 0.85 秒 */
  function flightTime(center, zoom) {
    const dz = Math.abs(zoom - map.getZoom());
    const dist = map.latLngToContainerPoint(center).distanceTo(map.getSize().divideBy(2));
    return Math.min(2.1, Math.max(0.75, 0.7 + dz * 0.115 + dist / 2800));
  }

  /* 过场：预取瓦片；跨尺度时四角压暗；
     推近时一过景点出现的级别，景点就从可见区中心向外依次弹出、当天路线随之画出；
     拉远时景点先缩走，城市名依次弹回。
     性能：所有 DOM 工作（挂图层、建图标）在起飞前这一帧做完，飞行中途只切换类名，
     不在镜头最快的时候创建上百个元素；换级后清掉旧瓦片层，避免每帧变换越积越多的瓦片 */
  const mapWrapEl = $('#mapWrap');
  const mapEl = $('#map');
  let flightId = 0, flightZoomFn = null;
  function levelOf(z) { return z >= 9.8 ? 2 : z >= 7.5 ? 1 : 0; }   // 与 syncVisibility 的阈值一致
  function freezeMain(on) {
    const l = baseLayers[0];
    if (!l || !l.options) return;
    l.options.updateWhenZooming = !on;
  }
  function cinematic(center, zoom, run) {
    endSmooth();
    prefetchView(center, zoom);
    const id = ++flightId;
    const z0 = map.getZoom();
    const big = Math.abs(zoom - z0) >= 3;
    const diving = big && zoom > z0, rising = big && zoom < z0;
    mapWrapEl.classList.add('is-flying');
    if (big) freezeMain(true);
    mapWrapEl.classList.toggle('is-diving', diving);
    mapWrapEl.classList.toggle('is-rising', rising);
    // 预热：按目的地级别挂好图层；推近时先藏着（.hold），到级别再亮出来
    mapEl.classList.remove('hold');
    syncVisibility(diving ? zoom : undefined);
    const held = diving && levelOf(z0) < 2 && levelOf(zoom) === 2;
    if (held) mapEl.classList.add('hold');
    let lvl = levelOf(z0);
    if (flightZoomFn) map.off('zoom', flightZoomFn);
    flightZoomFn = () => {
      const z = map.getZoom();
      const l = levelOf(z);
      if (l === lvl) return;
      const up = l > lvl;
      lvl = l;
      if (held && up && l === 2) { mapEl.classList.remove('hold'); revealPins(); drawDayRoute(); }
      if (rising && !up) syncCityLabels(z);
    };
    map.on('zoom', flightZoomFn);
    map.once('moveend', () => {
      if (id !== flightId) return;
      freezeMain(false);
      map.off('zoom', flightZoomFn);
      flightZoomFn = null;
      mapEl.classList.remove('hold');
      mapWrapEl.classList.remove('is-flying', 'is-diving', 'is-rising');
    });
    run();
  }

  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flyView(center, zoom, opts) {
    cinematic(center, zoom, () => map.flyTo(center, zoom, Object.assign({ duration: flightTime(center, zoom), animate: !REDUCED_MOTION }, opts)));
  }
  function flyBounds(bounds, opts) {
    const o = Object.assign({ animate: !REDUCED_MOTION }, viewPad(), opts);
    const t = map._getBoundsCenterZoom(bounds, o);
    cinematic(t.center, t.zoom, () => map.flyTo(t.center, t.zoom, Object.assign({ duration: flightTime(t.center, t.zoom) }, o)));
  }

  /* 景点从可见区中心向外依次弹出（只写 CSS 变量，不读布局） */
  let revealTimer = 0;
  function revealPins() {
    const c = visibleCenterPoint();
    [G.poi, G.hub, G.intra].forEach(g => g.eachLayer(m => {
      if (m._isArrow) return;
      const el = m._icon;
      const pin = el && el.firstElementChild;
      if (!pin || !m.getLatLng || el.style.display === 'none') return;
      const d = map.latLngToContainerPoint(m.getLatLng()).distanceTo(c);
      pin.style.setProperty('--d', Math.round(Math.min(480, d * 0.75)) + 'ms');
    }));
    mapEl.classList.remove('reveal');
    void mapEl.offsetWidth;
    mapEl.classList.add('reveal');
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => mapEl.classList.remove('reveal'), 1200);
  }
  function drawDayRoute() {
    if (!state.day) return;
    dailyRoutes.forEach(line => { if (line._day === state.day) animatePath(line); });
  }

  /* ---------------- 平滑缩放 ----------------
     滚轮 / 触控板 / 缩放按钮 / 双击统一走这里：逐帧逼近目标级别，光标下的位置保持不动。
     鼠标滚轮一格 = 一级；触控板手停在哪就停在哪（较大的手势落在整数级 0.12 以内才顺势贴上，瓦片更清晰）。
     缩放途中不增删图层（停手后一次性处理），大幅缩放时名称先隐去。触屏双指缩放仍用 Leaflet 自带的 */
  const SZ = { active: false, goal: 0, pt: null, ll: null, raf: 0, t: 0, last: 0, z0: 0, lvl0: 0, k: 0.35, trackpad: false };
  const clampZ = z => Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), z));
  function visibleCenterPoint() {
    const size = map.getSize();
    return L.point((size.x + sideInset()) / 2, size.y / 2);
  }
  function smoothZoom(goal, pt, trackpad) {
    pt = pt || visibleCenterPoint();
    if (!SZ.active) {
      map._stop();
      SZ.active = true;
      SZ.goal = SZ.z0 = map.getZoom();
      SZ.lvl0 = levelOf(SZ.z0);
      SZ.t = performance.now();
      map._moveStart(true, false);
      SZ.raf = requestAnimationFrame(smoothTick);
    }
    SZ.goal = clampZ(goal);
    SZ.trackpad = !!trackpad;
    SZ.k = trackpad ? 0.5 : 0.32;      // 触控板紧跟手指；滚轮 / 按钮约 0.2 秒到位
    SZ.pt = pt;
    SZ.ll = map.containerPointToLatLng(pt);
    SZ.last = performance.now();
  }
  function smoothTick(now) {
    const dt = Math.min(64, Math.max(0, now - SZ.t));
    SZ.t = now;
    const z = map.getZoom();
    let nz = z + (SZ.goal - z) * (1 - Math.pow(1 - SZ.k, dt / 16.7));
    if (Math.abs(SZ.goal - nz) < 0.002) nz = SZ.goal;
    const c = map.project(SZ.ll, nz).subtract(SZ.pt).add(map.getSize().divideBy(2));
    map._move(map.unproject(c, nz), nz, { pinch: true });
    if (Math.abs(nz - SZ.z0) > 0.6) mapWrapEl.classList.add('is-zooming');
    if (nz === SZ.goal) {
      const idle = now - SZ.last;
      if (SZ.trackpad) {
        if (idle > 220) {
          const r = Math.round(SZ.goal);
          // 只有较大的手势落在整数级附近才顺势贴上；轻轻一推就留在原处，不会被“弹回去”
          if (r !== SZ.goal && Math.abs(r - SZ.goal) <= 0.12 && Math.abs(SZ.goal - SZ.z0) >= 0.5) { SZ.goal = clampZ(r); SZ.trackpad = false; SZ.k = 0.3; SZ.last = now - 100; }
          else { endSmooth(); return; }
        }
      } else if (idle > 60) { endSmooth(); return; }
    }
    SZ.raf = requestAnimationFrame(smoothTick);
  }
  function endSmooth() {
    if (!SZ.active) return;
    cancelAnimationFrame(SZ.raf);
    SZ.active = false;
    const crossedUp = SZ.lvl0 < 2 && levelOf(map.getZoom()) === 2;
    mapWrapEl.classList.remove('is-zooming');
    map._moveEnd(true);          // zoomend → syncVisibility / 标签重排 / 瓦片更新，一次性完成
    if (crossedUp) revealPins();
  }

  /* 飞行 / 平滑缩放中，Leaflet 的 SVG 路线是按上次绘制的级别整体缩放的：推近 5 级线宽就变 32 倍、拉远就缩没了。
     缩放偏离上次绘制一级以上就重投影重绘一次，线条全程保持正常粗细 */
  map.on('zoom', () => {
    if (map._animatingZoom) return;
    [map._renderer, flowRenderer].forEach(r => {
      if (!r || r._zoom === undefined || !r._map) return;
      if (Math.abs(map.getZoom() - r._zoom) >= 1) { r._onZoomEnd(); r._update(); }
    });
  });

  map.scrollWheelZoom.disable();
  map.doubleClickZoom.disable();
  map.getContainer().addEventListener('wheel', e => {
    e.preventDefault();
    let dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    dy = Math.max(-300, Math.min(300, dy));
    if (!dy) return;
    const pt = map.mouseEventToContainerPoint(e);
    const base = SZ.active ? SZ.goal : map.getZoom();
    // 鼠标滚轮（按行滚动，或一次 ≥50px 的整数增量）：一格一级；其余视为触控板，连续缩放
    const notch = !e.ctrlKey && (e.deltaMode === 1 || (Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY)));
    if (notch) smoothZoom(Math.round(base) - Math.sign(dy), pt, false);
    else smoothZoom(base - dy / (e.ctrlKey ? 100 : 170), pt, true);   // ctrlKey = 触控板捏合
  }, { passive: false });
  map.on('dblclick', e => {
    smoothZoom(Math.round(SZ.active ? SZ.goal : map.getZoom()) + (e.originalEvent.shiftKey ? -1 : 1), e.containerPoint, false);
  });
  // 缩放按钮（以及其他调用 zoomIn / zoomOut 的地方）绕可见区中心平滑缩放一级
  map.zoomIn = function (d) { smoothZoom(Math.round(SZ.active ? SZ.goal : this.getZoom()) + Math.max(1, Math.round(d || 1))); return this; };
  map.zoomOut = function (d) { smoothZoom(Math.round(SZ.active ? SZ.goal : this.getZoom()) - Math.max(1, Math.round(d || 1))); return this; };
  // 缩放途中开始拖动：就停在当前级别
  map.on('dragstart', endSmooth);

  function selectPlace(id, opts) {
    const p = placeById[id];
    if (!p) return;
    const marker = poiMarkers[id];
    const ll = (marker && marker._ll) || pos(p.key);
    if (!ll) { toast('该地点坐标缺失'); return; }
    state.selected = id;
    state._focus = ll;

    // 确保所在城市可见
    if (state.mode === 'city' && !cityVisible(p.base || p.city)) {
      state.city = p.base || p.city;
      renderChips(); updateModeUI();
    }
    syncVisibility();

    if (opts && opts.fly) {
      flyToPlace(ll, Math.max(map.getZoom(), 16));
    }

    const color = colorOf(p.base || p.city);
    const seq = seqOf(p.id);
    const relatedDays = T.days.filter(d => stopsOf(d).includes(p.id));
    const fullDays = T.days.filter(d => d.stops.includes(p.id));   // 低精力版省掉的点，标出它在高精力版的哪天

    let nextPrev = '';
    if (relatedDays.length) {
      const d = relatedDays[0];
      const ds = stopsOf(d);
      const idx = ds.indexOf(p.id);
      const prev = ds[idx - 1], next = ds[idx + 1];
      const chips = [];
      if (prev) chips.push(navBtn(prev, 'prev'));
      if (next) chips.push(navBtn(next, 'next'));
      if (chips.length) nextPrev = `<div class="d-next">${chips.join('')}</div>`;
    }

    const bookingRow = p.booking && p.booking.level !== 'none'
      ? factRow('calendar', '预约', `
           ${p.booking.url ? `<a href="${p.booking.url}" target="_blank" rel="noopener">${p.booking.url.replace(/^https?:\/\//, '')}</a><br>` : ''}
           <span class="muted">${p.booking.note || ''}</span>`)
      : (p.booking && p.booking.note ? factRow('calendar', '预约', `不需要预约 · <span class="muted">${p.booking.note}</span>`)
        : factRow('calendar', '预约', '不需要预约，直接走进去'));

    const bk = p.booking && p.booking.level;
    const bkCls = bk === 'required' ? 'req' : bk === 'recommended' ? 'rec' : 'free';
    const bkTxt = bk === 'required' ? '必须预约' : bk === 'recommended' ? '建议预约' : '免预约';
    const city = cityById[p.base || p.city];
    const ownCity = cityById[p.city] || city;

    openDetail(`
      ${heroHtml(color, `${city.name} · ${p.cat}${p.tier === 'must' ? ' · 必看' : p.tier === 'optional' ? ' · 可跳过' : ''}`, p.name, p.it, ownCity.it, p.id)}
      <div class="d-content" style="--c:${color}">
        <div class="d-stats">
          <div class="d-stat ${bkCls}"><span class="k">预约</span><span class="v">${bkTxt}</span></div>
          <div class="d-stat"><span class="k">建议停留</span><span class="v">${p.dur}</span></div>
          <div class="d-stat"><span class="k">行程</span><span class="v">${relatedDays.length ? 'D' + relatedDays.map(d => d.n).join(' / D') : (fullDays.length ? 'D' + fullDays.map(d => d.n).join(' / D') : '—')}${seq ? `<small>第 ${seq.n} 站</small>` : (fullDays.length ? '<small>高精力版才去</small>' : '')}</span></div>
        </div>
        <p class="d-desc">${p.desc}</p>
        <div class="d-facts">
          ${factRow('clock', '开放', p.hours)}
          ${factRow('ticket', '门票', p.price)}
          ${bookingRow}
          ${factRow('route', '怎么去', p.access)}
        </div>
        ${p.tip ? `<div class="d-tip">${ICON.bulb}<div><b>实操提示</b>${p.tip}</div></div>` : ''}
        <div class="d-actions">
          ${mapsLink(`${ll[0]},${ll[1]}`, '在 Google Maps 打开', true)}
          ${centerBtn}
          <button data-copy="${ll[0].toFixed(5)}, ${ll[1].toFixed(5)}">${ICON.copy}<span>复制坐标</span></button>
        </div>
        ${nextPrev}
        ${creditHtml(p.id)}
      </div>
    `);
  }

  function openHub(id) {
    const h = hubById[id];
    if (!h) return;
    const ll = pos(h.key);
    state._focus = ll;
    const city = cityById[h.city];
    const air = h.kind === 'airport';
    openDetail(`
      ${heroHtml(colorOf(h.city), `${air ? '机场' : '车站'} · ${city.name}`, h.name, h.it, air ? 'Aeroporto' : 'Stazione', h.key)}
      <div class="d-content" style="--c:${colorOf(h.city)}">
        <p class="d-desc">${h.note}</p>
        <div class="d-facts">
          ${factRow('pin', '城市', `${city.name}（${city.it}）`)}
          ${factRow(air ? 'plane' : 'train', '周边', air ? '值机、退税盖章在出发层' : '行李寄存、售票机、咖啡吧都在站厅')}
          ${factRow('info', '提醒', air ? '国际航班建议提前 3 小时到达' : '上车前记得在绿色小机器上打卡（部分车次）')}
        </div>
        <div class="d-actions">
          ${mapsLink(`${ll[0]},${ll[1]}`, '在 Google Maps 打开', true)}
          ${centerBtn}
        </div>
        ${creditHtml(h.key)}
      </div>
    `);
  }

  function buildHotelCard(cid) {
    const h = HOTELS[cid];
    const st = cityById[cid].station;
    const color = colorByCity(cid);
    state._focus = h.coord;
    const legsFromStation = T.legs.filter(l => l.from === st.key || l.to === st.key);
    openDetail(`
      ${heroHtml(color, `已订住宿 · ${cityById[cid].name}`, h.name, `<span class="plain">${h.addr}</span>`, cityById[cid].it)}
      <div class="d-content" style="--c:${color}">
        <div class="d-stats">
          <div class="d-stat"><span class="k">入住</span><span class="v">${h.stay}</span></div>
          <div class="d-stat"><span class="k">晚数</span><span class="v">${h.nights} 晚</span></div>
          <div class="d-stat"><span class="k">到车站</span><span class="v">${h.transit[0] ? h.transit[0].time : '—'}</span></div>
        </div>

        <div class="transit-box">
          <div class="transit-title">从这里出发 · 门到门</div>
          ${h.transit.map(t => `
            <div class="transit-row">
              <div class="tr-ico">${ICON[TR_ICON[t.ico]] || t.ico}</div>
              <div class="tr-body">
                <div class="tr-to">${t.to}</div>
                <div class="tr-detail">${t.mode} · ${t.detail}</div>
              </div>
              <div class="tr-right">
                <div class="tr-time">${t.time}</div>
                <div class="tr-fare">${t.fare}</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="d-facts">
          ${factRow('train', '去车站', h.toStation)}
          ${factRow('route', '长途出发', legsFromStation.map(l => `${l.mode}（${l.dur}）`).join('、') || '以步行为主')}
          ${factRow('ticket', '票务', h.passes)}
        </div>

        <div class="d-tip">${ICON.bulb}<div><b>住宿节奏</b>${cityById[cid].blurb}</div></div>

        <div class="d-actions">
          ${mapsLink(`${h.coord[0]},${h.coord[1]}`, '在 Google Maps 打开', true)}
          ${centerBtn}
          <button data-copy="${h.addr}">${ICON.copy}<span>复制地址</span></button>
        </div>
        <div class="d-next">
          <button data-open-station="${cid}" class="is-next"><span>看这个城市的车站与线路${ICON.arrowR}</span><b>${st.name}</b></button>
        </div>
      </div>
    `);
  }

  function buildFoodCard(f) {
    const p = placeByKey(f.key);
    const ll = pos(f.key);
    state._focus = ll ? [ll[0] + 0.00085, ll[1] + 0.00085] : null;
    const cityId = p ? (p.base || p.city) : f.city;
    openDetail(`
      ${heroHtml(colorOf(cityId), `餐厅 · ${cityById[cityId].name} · ${f.price}`, f.name, `<span class="plain">靠近 ${p ? p.name : '老城中心'}</span>`, cityById[cityId].it)}
      <div class="d-content" style="--c:${colorOf(cityId)}">
        <div class="d-badges"><span class="badge">游客友好</span><span class="badge">${f.price || '€'}</span></div>
        <p class="d-desc">${f.note}</p>
        <div class="d-tip">${ICON.bulb}<div><b>点餐提示</b>进门说 "Un tavolo per due"（两个人的桌子）；看不懂菜单就用手机翻译菜单页，意大利餐厅上菜慢是正常的。</div></div>
        <div class="d-actions">
          ${ll ? mapsLink(`${f.name} ${cityById[cityId].it}`, '搜这家店', true) : ''}
          ${centerBtn}
        </div>
      </div>
    `);
  }

  function buildAreaCard(a) {
    state._focus = a.center;
    openDetail(`
      ${heroHtml(a.color, `购物街区 · ${cityById[a.city].name}`, a.name, 'Shopping district', cityById[a.city].it)}
      <div class="d-content" style="--c:${a.color}">
        <p class="d-desc">${a.desc}</p>
        <div class="d-tip">${ICON.bulb}<div><b>退税</b>同一天同一店消费满 €154.94 可开退税单，离境时在机场找 Tax Free 柜台盖章。护照随身带，别放托运行李里。</div></div>
        <div class="d-actions">${centerBtn}</div>
      </div>
    `);
  }

  /* ---------------- 侧栏：日程 ---------------- */
  const dayList = $('#dayList');

  /* ---------------- 每日节奏（几点出门 / 几点回） ---------------- */
  /* 每日节奏：SCHEDULE = 高精力版；SCHEDULE_LITE = 低精力版（没写的天两版相同）。
     预约场次、火车班次两版一致，只在免预约的部分取舍；全程公共交通 */
  const SCHEDULE = {
    1: [['落地 +1h', '出关、取行李', '入境排队视航班，留足 1 小时'],
        ['+1h20', 'Leonardo Express 到 Termini', '32 分钟，€14'],
        ['+2h', '地铁 A 线到 Cornelia，酒店寄存行李', '10 站 18 分钟；15:00 开房'],
        ['傍晚', '圣彼得广场夜景', 'A 线 Cornelia → Ottaviano 4 站，步行 10 分'],
        ['19:00', '晚饭，早睡倒时差', 'Pizzarium Bonci 在 Cipro 站旁，回酒店顺路']],
    2: [['08:00', '出门', 'A 线 Cornelia → Cipro 3 站 + 步行 8 分'],
        ['08:30–12:30', '梵蒂冈博物馆 + 西斯廷礼拜堂（预约 8:30 场）', '走 4 小时，穿软底鞋'],
        ['12:30–13:30', '午饭', 'Prati 区，或 Pizzarium Bonci'],
        ['13:45–15:30', '圣彼得大教堂', '免费，安检排队 30–60 分'],
        ['15:30–16:30', '登穹顶（551 级）', '现场买票，17:00 停止'],
        ['17:00', '回酒店', 'A 线 Ottaviano → Cornelia，20 分钟到']],
    3: [['08:15', '出门', 'A 线到 Termini 换 B 线到 Colosseo，约 30 分'],
        ['09:00–10:30', '斗兽场（预约 9:00 场）', '联票 24 小时有效'],
        ['10:30–12:30', '帕拉蒂尼山 → 古罗马广场', '同一张票，从卡比托利欧一侧出'],
        ['12:30–13:30', '祖国祭坛 + 午饭', '屋顶观景电梯可跳过'],
        ['13:45–14:30', '真理之口', '步行 10 分；排队 20–40 分'],
        ['14:45', '回酒店', '步行 8 分到 B 线 Circo Massimo，Termini 换 A 线，约 40 分']],
    4: [['08:20', '出门', 'A 线 Cornelia → Spagna 7 站，步行穿公园 15 分'],
        ['09:00–11:00', '博尔盖塞美术馆（预约 9:00 场，限时 2h）', '迟到不得入场'],
        ['11:00–11:45', 'Pincio 平台 → 西班牙台阶', '一路下坡'],
        ['12:00–13:00', '许愿池 + 午饭', 'Giolitti 冰淇淋就在附近'],
        ['13:15–14:15', '万神殿', 'Sant’Eustachio 咖啡在旁边'],
        ['14:30–16:00', '纳沃纳广场', '步行 5 分钟'],
        ['17:30', '晚饭后回酒店', 'Armando al Pantheon 要提前订位；步行 20 分过 Ponte Umberto I 到 A 线 Lepanto']],
    5: [['10:00', '出门', 'A 线到 Spagna，穿过老城步行 20 分'],
        ['10:30–11:30', '鲜花广场早市', '14:00 收摊；Roscioli 面包房在旁边'],
        ['11:30–14:00', '过 Ponte Sisto 到特拉斯提弗列，午饭', 'Da Enzo al 29 排队，11:45 前到'],
        ['14:30', '回酒店收拾行李', '8 路电车到 Trastevere 站 → FL3 到 Valle Aurelia → A 线 2 站，约 40 分'],
        ['19:00', '酒店附近晚饭，早睡', '明早 08:20 出门']],
    6: [['08:20', '退房出门', 'A 线 Cornelia → Termini 10 站，约 25 分'],
        ['09:00–10:35', '高铁到佛罗伦萨', 'Frecciarossa / Italo，约 1 小时 35 分'],
        ['10:35–11:00', '步行到酒店寄存行李', '14 分钟；14:00 才开房'],
        ['11:30–12:45', '圣母百花大教堂（+ 洗礼堂）', '教堂周六约 15:45 关，先去'],
        ['12:45–13:15', '但丁故居', '往领主广场顺路'],
        ['13:20–14:00', '午饭', 'All’Antico Vinaio 三明治'],
        ['14:15–15:30', '领主广场 → 老桥', '旧宫外观，步行'],
        ['16:00–17:15', '米开朗基罗广场看日落', '上山 25 分，日落约 17:10'],
        ['18:00', '晚饭，回酒店', '12 / 13 路公交下山到 SMN，T1 电车 1 站到 Fortezza']],
    7: [['08:00', '出门步行到乌菲兹', '约 25 分'],
        ['08:15–11:00', '乌菲兹（预约 8:15 场）', '从三楼往下看，人最少'],
        ['11:00–13:00', '过老桥 → 皮蒂宫', '现场买票；周一闭馆，今天周日开'],
        ['13:00–14:00', '午饭', '河南岸 Oltrarno'],
        ['14:00–15:30', '波波里花园', '冬季约 16:30 关'],
        ['16:00–18:30', 'Santo Spirito 一带闲逛 + 晚饭', 'Osteria Santo Spirito'],
        ['19:00', '回酒店', '步行到 SMN，T1 电车 1 站到 Fortezza']],
    8: [['08:00', '出门到 SMN', '步行 14 分'],
        ['08:30–09:30', '区域火车到比萨', '不用订座，站台机器买票，上车前打卡'],
        ['09:30–10:00', '车站步行到奇迹广场', '约 20 分，或 LAM Rossa 公交'],
        ['10:00–11:00', '比萨斜塔（预约 10:00 场）', '不登塔可省 €20'],
        ['11:00–12:00', '大教堂 + 洗礼堂', ''],
        ['12:40–13:40', '火车回佛罗伦萨', ''],
        ['14:00', '回酒店休息', '下午自由'],
        ['18:30', '中央市场二楼吃晚饭', '开到深夜，离酒店步行 10 分']],
    9: [['08:00', '出门', '步行约 20 分到学院美术馆'],
        ['08:15–09:45', '学院美术馆看大卫（预约 8:15 场）', '周一闭馆，今天周二开'],
        ['10:00–11:00', '中央市场一楼', 'Nerbone 牛肚包当早午饭'],
        ['11:15–12:15', '登乔托钟楼（414 级）', '现场买票；看圣母百花圆顶最好的角度'],
        ['12:30–14:00', '午饭', 'Trattoria Mario（只做午饭，12:00 开门要排队）'],
        ['14:30–15:45', '圣十字教堂', 'Vivoli 冰淇淋在旁边'],
        ['16:30', '步行回酒店收拾行李', '约 30 分钟；明早 08:35 出门']],
    10: [['08:35', '退房出门', '步行 14 分到 SMN'],
         ['09:00–11:05', '高铁到威尼斯 S. Lucia', 'Frecciarossa 约 2 小时 05 分'],
         ['11:05–11:30', '过宪法桥 → People Mover 到酒店寄存行李', '约 15 分钟；买 48 小时水上巴士通票'],
         ['11:45–12:15', 'Tronchetto 码头坐 2 线到里亚托', '沿大运河，这一程就是游览'],
         ['12:15–13:15', '里亚托桥 + 午饭', 'Cantina Do Mori 站着吃 cicchetti'],
         ['13:30–14:15', '穿小巷步行到圣马可广场', '约 10 分钟'],
         ['14:30–15:30', '圣马可大教堂（线上预约）', '已取消现场售票；周三开到 17:15'],
         ['15:30–17:00', '叹息桥 → 斯拉夫人堤岸看日落', '日落约 17:00'],
         ['18:30', '晚饭后坐 2 线回 Tronchetto', 'San Marco 码头上船约 35 分钟']],
    11: [['08:40', '出门', 'People Mover 到 Piazzale Roma'],
         ['09:00–09:35', '水上巴士到 Murano', '直达线约 25–35 分钟，以码头时刻表为准'],
         ['09:35–11:45', '玻璃岛 Murano', '玻璃作坊看现场吹制'],
         ['11:50–12:25', '12 线到 Burano', '班次稀，先拍下回程时刻'],
         ['12:30–15:00', '彩色岛 Burano + 午饭', ''],
         ['15:15–16:30', '12 线到 F.te Nove，换环岛线回 Piazzale Roma', '约 1 小时 15 分'],
         ['17:00–19:30', '圣玛格丽特广场 cicchetti 晚饭', '从 Piazzale Roma 步行 10 分'],
         ['20:00', '步行 + People Mover 回酒店', '']],
    12: [['09:15', '退房出门', 'People Mover + 过宪法桥，约 15 分到 S. Lucia'],
         ['10:00–12:25', '高铁到米兰中央车站', 'Frecciarossa 约 2 小时 25 分'],
         ['12:30–13:15', 'Centrale → 酒店寄存行李', 'M2 到 Cadorna 换 M1 到 Bisceglie，约 30 分'],
         ['13:30', 'M1 直达 Duomo', '约 20 分'],
         ['14:00–14:30', '午饭', 'Luini 炸面包，大教堂旁'],
         ['14:30–16:30', '米兰大教堂 + 屋顶', '屋顶趁天亮先上'],
         ['16:30–17:30', '埃马努埃莱二世拱廊', ''],
         ['17:30', 'Camparino 开胃酒，之后 M1 回酒店', '约 20 分']],
    13: [['08:20', '出门', 'M1 到 Conciliazione 约 15 分，步行 5 分'],
         ['09:00–09:45', '《最后的晚餐》（提前 30 分取票）', '每场 15 分钟，迟到作废'],
         ['10:00–11:30', '斯福尔扎城堡', '往北步行 10 分'],
         ['11:30–12:15', '森皮奥内公园', '穿过公园到和平门'],
         ['12:30–13:30', '午饭', '布雷拉区'],
         ['13:30–15:30', '布雷拉美术馆', '现场买票；周一闭馆，今天周六开'],
         ['16:00–18:00', '布雷拉街区闲逛 + 晚饭', ''],
         ['18:30', '回酒店', 'M2 Lanza → Cadorna 换 M1，约 25 分']],
    14: [['08:30', '出门', 'M1 到 Cadorna 约 15 分'],
         ['09:00–10:00', 'Trenord 直达 Como Nord Lago', '约 1 小时；纸质票上车前打卡'],
         ['10:00–11:00', '湖滨 + 科莫大教堂', '出站即湖，大教堂 300 米'],
         ['11:15–13:30', '缆车上 Brunate + 午饭', '7 分钟一趟；山顶看湖'],
         ['13:30–15:30', '下山，湖边散步', ''],
         ['16:00–17:00', '火车回 Cadorna', ''],
         ['17:30', 'M1 回酒店', '约 15 分']],
    15: [['09:30', '出门', 'M1 到 San Babila 约 22 分'],
         ['10:00–12:30', '蒙特拿破仑大街 → 斯皮加大街', '黄金四边形'],
         ['12:30–13:30', '午饭', 'Princi 面包房'],
         ['13:30–15:30', '文艺复兴百货（顶层办退税）', '单店满 €154.94，护照随身'],
         ['16:00', '回酒店放东西（买得多的话）', 'M1 约 20 分'],
         ['17:30–19:30', '运河区开胃酒', 'M1 到 Cadorna 换 M2 到 Porta Genova'],
         ['20:00', '回酒店收拾行李', 'M2 + M1 约 25 分']],
    16: [['起飞前 3.5h', '酒店出发', 'M1 到 Cadorna 15 分'],
         ['—', 'Malpensa Express 到 T1', '43 分，€13'],
         ['—', '值机 + 退税盖章', '国际航班提前 3 小时到']]
  };
  const SCHEDULE_LITE = {
    1: [['落地 +1h', '出关、取行李', '入境排队视航班，留足 1 小时'],
        ['+1h20', 'Leonardo Express 到 Termini', '32 分钟，€14'],
        ['+2h', '地铁 A 线到 Cornelia，酒店寄存行李', '10 站 18 分钟；15:00 开房'],
        ['18:30', '酒店附近晚饭，早睡倒时差', 'Pizzarium Bonci 在 Cipro 站旁']],
    2: [['08:00', '出门', 'A 线 Cornelia → Cipro 3 站 + 步行 8 分'],
        ['08:30–12:30', '梵蒂冈博物馆 + 西斯廷礼拜堂（预约 8:30 场）', '走 4 小时，穿软底鞋'],
        ['12:30–13:30', '午饭', 'Prati 区'],
        ['13:45–15:00', '圣彼得大教堂（不登穹顶）', '免费，安检排队 30–60 分'],
        ['15:30', '回酒店休息', 'A 线 Ottaviano → Cornelia']],
    3: [['08:15', '出门', 'A 线到 Termini 换 B 线到 Colosseo，约 30 分'],
        ['09:00–10:30', '斗兽场（预约 9:00 场）', '联票 24 小时有效'],
        ['10:30–12:00', '古罗马广场（不上帕拉蒂尼山）', '同一张票'],
        ['12:00–12:30', '祖国祭坛外围', '不坐观景电梯'],
        ['12:30–13:30', '午饭', ''],
        ['14:00', '回酒店休息', '沿帝国大道步行 12 分回 B 线 Colosseo，Termini 换 A 线']],
    4: [['08:20', '出门', 'A 线 Cornelia → Spagna 7 站，步行穿公园 15 分'],
        ['09:00–11:00', '博尔盖塞美术馆（预约 9:00 场，限时 2h）', '迟到不得入场'],
        ['11:00–11:45', 'Pincio 平台 → 西班牙台阶', '一路下坡'],
        ['12:00–13:00', '许愿池 + 午饭', 'Giolitti 冰淇淋就在附近'],
        ['13:15–14:00', '万神殿', ''],
        ['14:30', '回酒店', '步行 15 分回 A 线 Spagna']],
    5: [['10:00', '出门', 'A 线到 Spagna，穿过老城步行 20 分'],
        ['10:30–11:45', '鲜花广场早市', '14:00 收摊'],
        ['11:45–12:45', '午饭', 'Roscioli 一带'],
        ['13:00–13:40', '沿 Via Giulia 走到圣天使桥', ''],
        ['14:00', '回酒店收拾行李', 'A 线 Ottaviano → Cornelia'],
        ['18:30', '酒店附近晚饭，早睡', '明早 08:20 出门']],
    6: [['08:20', '退房出门', 'A 线 Cornelia → Termini 10 站，约 25 分'],
        ['09:00–10:35', '高铁到佛罗伦萨', '与高精力版同一班车'],
        ['10:35–11:00', '步行到酒店寄存行李', '14 分钟；14:00 才开房'],
        ['11:30–12:45', '圣母百花大教堂（+ 洗礼堂）', '周六约 15:45 关，先去'],
        ['13:00–13:45', '午饭', 'All’Antico Vinaio'],
        ['14:00–15:00', '领主广场 → 老桥', '步行'],
        ['15:30', '回酒店休息', '走到 SMN 坐 T1 电车 1 站到 Fortezza']],
    7: [['08:00', '出门步行到乌菲兹', '约 25 分'],
        ['08:15–11:00', '乌菲兹（预约 8:15 场）', '从三楼往下看'],
        ['11:15–13:00', '过老桥，河南岸午饭 + 闲逛', ''],
        ['14:00', '回酒店休息', '走到 SMN 坐 T1 电车 1 站'],
        ['18:30', '晚饭', '酒店附近']],
    9: [['08:00', '出门', '步行约 20 分到学院美术馆'],
        ['08:15–09:45', '学院美术馆看大卫（预约 8:15 场）', ''],
        ['10:00–11:30', '中央市场一楼 + 早午饭', 'Nerbone 牛肚包'],
        ['12:00', '回酒店休息，收拾行李', '步行 10 分'],
        ['18:30', '中央市场二楼晚饭', '明早 08:35 出门']],
    10: [['08:35', '退房出门', '步行 14 分到 SMN'],
         ['09:00–11:05', '高铁到威尼斯 S. Lucia', '与高精力版同一班车'],
         ['11:05–11:30', '过宪法桥 → People Mover 到酒店寄存行李', '买 48 小时水上巴士通票'],
         ['11:45–12:25', 'Tronchetto 码头坐 2 线直达 San Marco', '沿大运河经过里亚托'],
         ['12:30–13:30', '午饭', '圣马可广场附近'],
         ['14:30–15:30', '圣马可大教堂（线上预约）', '与高精力版同一时段'],
         ['15:30–16:30', '叹息桥 → 斯拉夫人堤岸', ''],
         ['17:00', '坐 2 线回 Tronchetto', '约 35 分钟']],
    11: [['10:00', '出门', 'People Mover → Piazzale Roma → 环岛线到 Fondamente Nove，约 35 分'],
         ['10:45–11:30', '12 线直达 Burano', ''],
         ['11:30–14:30', '彩色岛 Burano + 午饭', ''],
         ['14:45–16:15', '12 线回 F.te Nove，换环岛线回 Piazzale Roma', ''],
         ['16:30', '回酒店休息', '']],
    13: [['08:20', '出门', 'M1 到 Conciliazione 约 15 分，步行 5 分'],
         ['09:00–09:45', '《最后的晚餐》（提前 30 分取票）', '与高精力版同一场次'],
         ['10:00–11:30', '斯福尔扎城堡', '往北步行 10 分'],
         ['11:30–12:30', '午饭', '城堡附近'],
         ['13:00', '回酒店休息', 'M1 Cairoli 站直达']],
    14: [['09:00', '出门', 'M1 到 Cadorna 约 15 分'],
         ['09:30–10:30', 'Trenord 直达 Como Nord Lago', '约 1 小时'],
         ['10:30–12:30', '缆车上 Brunate 看湖', '7 分钟一趟'],
         ['12:30–13:30', '湖边午饭', ''],
         ['14:00–15:00', '火车回 Cadorna', ''],
         ['15:30', 'M1 回酒店', '约 15 分']],
    15: [['10:00', '出门', 'M1 到 San Babila 约 22 分'],
         ['10:30–12:30', '蒙特拿破仑大街', '黄金四边形'],
         ['12:30–13:30', '午饭', 'Princi 面包房'],
         ['13:30–15:00', '文艺复兴百货（顶层办退税）', '单店满 €154.94，护照随身'],
         ['15:30', '回酒店收拾行李', 'M1 约 20 分']]
  };

  /* ---------------- 顶部 16 天时间线 ---------------- */
  function renderTimeline() {
    const el = $('#timeline');
    if (!el) return;
    // 按主城（一日游归到所属城市）分组，16 天自然分成 罗马 / 佛罗伦萨 / 威尼斯 / 米兰 四个色块
    const groups = [];
    T.days.forEach(d => {
      const main = (cityById[d.city] && cityById[d.city].parent) || d.city;
      const last = groups[groups.length - 1];
      if (last && last.main === main) last.days.push(d); else groups.push({ main, days: [d] });
    });
    el.innerHTML = groups.map(g => `<div class="tl-group" style="--c:${colorByCity(g.main)}">${g.days.map(d => {
      const dt = dayDate(d.n);
      return `<button class="tl-dot" data-tl="${d.n}" style="--c:${colorByCity(d.city)}" title="D${d.n} · ${dt.md} ${dt.wd} · ${titleOf(d)}">${d.n}</button>`;
    }).join('')}</div>`).join('');
    $$('.tl-dot', el).forEach(b => {
      b.addEventListener('click', () => focusDay(state.day === +b.dataset.tl ? null : +b.dataset.tl));
    });
    updateTimeline();
  }

  function updateTimeline() {
    const tl = $('#timeline');
    $$('.tl-dot', tl).forEach(b => {
      const n = +b.dataset.tl;
      b.classList.toggle('is-active', n === state.day);
      b.classList.toggle('is-past', state.day != null && n < state.day);
    });
    // 窄屏时间线可横向滚动：把当前天滚到中间（下一帧再读布局，不卡点击）
    if (window.innerWidth > 860) return;
    requestAnimationFrame(() => {
      const act = $('.tl-dot.is-active', tl);
      if (act && tl.scrollWidth > tl.clientWidth + 2) {
        tl.scrollTo({ left: act.offsetLeft - (tl.clientWidth - act.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }

  /* 聚焦某一天：自动处理城市视图越界、图层可见性与视野 */
  function focusDay(n, opts = {}) {
    state.day = n;
    state.selected = null;
    if (n && state.mode === 'city') {
      const d = T.days.find(x => x.n === n);
      const c = cityById[d.city];
      const sameCity = d.city === state.city || (c && c.parent === state.city);
      if (!sameCity) { state.mode = 'overview'; updateModeUI(); }
    }
    syncDayCards();
    updateDayPill();
    renderLegend();
    updateTimeline();
    let flew = false;
    if (n && opts.noFly) { syncVisibility(); return; }
    if (n) {
      const d = T.days.find(x => x.n === n);
      const allPts = stopsOf(d).map(id => {
        const p = placeById[id]; const h = hubById[id] || hubByKey[id];   // 日程里车站写的是 key（如 'fco'）
        return p ? pos(p.key) : (h ? pos(h.key) : null);
      }).filter(Boolean);
      // 优先用当天景点自身范围，避免被跨城车站拉远导致景点被缩放阈值隐藏
      const placePts = stopsOf(d).map(id => placeById[id]).filter(Boolean).map(p => pos(p.key)).filter(Boolean);
      let pts = placePts.length >= 2 ? placePts : allPts;
      let pad = pts.length > 1 ? 0.35 : 0.05;
      const hc = hotelsOf(d).to || hotelsOf(d).from;
      if (pts.length >= 2 && hc) {
        const o = Object.assign({}, viewPad(), { maxZoom: 15.5 });
        const withH = pts.concat([HOTELS[hc].coord]);
        const z0 = map._getBoundsCenterZoom(L.latLngBounds(pts).pad(0.35), o).zoom;
        const z1 = map._getBoundsCenterZoom(L.latLngBounds(withH).pad(0.2), o).zoom;
        if (z1 >= z0 - 1.1) { pts = withH; pad = 0.2; }
      }
      if (pts.length) {
        flyBounds(L.latLngBounds(pts).pad(pad), { maxZoom: 15.5 });   // 内含图层同步
        flew = true;
      }
      if (!opts.keepScroll) setTimeout(() => {
        const el = $(`.day[data-day="${n}"]`, dayList);
        if (el) $('#panel-days').scrollTo({ top: Math.max(0, el.offsetTop - 70), behavior: 'smooth' });
      }, 120);
    }
    if (!flew) syncVisibility();
  }

  /* 当天推荐动线（步行 / 地铁 / 水上巴士） */
  function routeModeRow(d) {
    let mode = null;
    Object.values(T.routes).some(arr => arr.some(r => {
      if (r.day === d.n && r.mode) { mode = (isLite() && r.liteMode) || r.mode; return true; }
      return false;
    }));
    if (!mode) return '';
    return `<div class="leg-row is-route">${ICON.walk}<span class="leg-mode">当日动线</span><span class="leg-dur">${mode}</span></div>`;
  }

  /* 当日节奏时间轴 */
  function scheduleRow(d) {
    const rows = (isLite() && SCHEDULE_LITE[d.n]) || SCHEDULE[d.n];
    if (!rows) return '';
    const ver = SCHEDULE_LITE[d.n] ? (isLite() ? ' · 低精力版' : ' · 高精力版') : '';
    return `<div class="sch-box">
      <div class="sch-title">${ICON.clock}当日节奏${ver}</div>
      ${rows.map(([t, w, tr]) => `<div class="sch-row">
        <span class="sch-t">${t}</span>
        <span class="sch-w">${w}${tr ? `<i>${tr}</i>` : ''}</span>
      </div>`).join('')}
    </div>`;
  }

  /* 只切换日卡的展开态：整张列表重建（16 张卡 + 时间轴）再强制排版，是切换日期卡顿的主要来源 */
  function syncDayCards() {
    $$('.day', dayList).forEach(el => el.classList.toggle('is-open', +el.dataset.day === state.day));
  }

  function renderDays() {
    let prevMain = null, prevStay = null;
    dayList.innerHTML = T.days.map(d => {
      const city = cityById[d.city];
      const color = colorByCity(d.city);
      const open = state.day === d.n;
      const dt = dayDate(d.n);

      // 城市分段标题（吸顶）：几晚、哪几天；点一下进入该城市地图
      const main = city.parent || d.city;
      let sec = '';
      if (main !== prevMain) {
        const mc = cityById[main];
        const ht = HOTELS[main];
        sec = `<button class="city-sec" data-open-city="${main}" style="--c:${mc.color}" title="打开${mc.name}地图">
          <span class="cs-txt"><span class="cs-name">${mc.name}</span><span class="cs-meta">${ht ? `${ht.stay.replace(' → ', ' – ')} · ${ht.nights} 晚` : ''}</span></span>
        </button>`;
      }
      prevMain = main;

      // 只在"今天不一样"时打标：一日游 / 换宿（要拖行李）/ 返程
      let tag = '';
      if (city.parent) tag = `<span class="day-tag">${ICON.route}一日游 · ${city.name}</span>`;
      else if (d.stay === '—') tag = `<span class="day-tag">${ICON.plane}返程</span>`;
      else if (prevStay && d.stay !== prevStay) tag = `<span class="day-tag is-move">${ICON.luggage}换宿 · 住${d.stay}</span>`;
      prevStay = d.stay;

      const visStops = stopsOf(d);
      const liteSet = d.lite ? new Set(d.lite) : null;
      const extras = isLite() ? d.stops.filter(id => !visStops.includes(id) && placeById[id]) : [];
      const extraRow = extras.length
        ? `<div class="stop-extra">${ICON.route}<span><b>体力好可加</b>${extras.map(id => `<a class="stop-x" data-place="${id}">${placeById[id].name}</a>`).join('、')}</span></div>`
        : '';
      const hs = hotelsOf(d);
      const hotelRow = (cid, label) => cid ? `<div class="stop is-hotel" data-hotel="${cid}">
          <div class="stop-idx">${ICON.bed}</div>
          <div class="stop-txt"><div class="stop-name">${label}</div><div class="stop-meta">${HOTELS[cid].name}</div></div>
          ${ICON.chevR}
        </div>` : '';
      const r = routeOfDay(d.n);
      const path = r ? pathKeys(r) : visStops;
      const nodeRow = (id, i) => {
        if (HOTELS[id]) return hotelRow(id, i === 0 ? (hs.from !== hs.to ? '退房出发' : '从酒店出发')
          : i === path.length - 1 ? (hs.from ? '回酒店' : '入住酒店') : '到酒店放行李');
        const p = placeById[id];
        const h = hubById[id] || hubByKey[id];
        const name = p ? p.name : (h ? h.name : id);
        const meta = p ? `${p.cat} · ${p.dur}` : (h ? (h.kind === 'airport' ? '机场' : '车站') : '');
        const req = p && p.booking && p.booking.level === 'required' ? '<span class="stop-req">需预约</span>'
          : (p && liteSet && !liteSet.has(id) ? '<span class="stop-opt">低精力可省</span>' : '');
        const tier = p ? (p.tier === 'must' ? ' is-must' : p.tier === 'optional' ? ' is-opt' : '') : ' is-hub';
        // 序号与地图上"当日第几站"一致，车站、机场用图标
        const idx = p ? visStops.indexOf(id) + 1 : (h && h.kind === 'airport' ? ICON.plane : ICON.train);
        return `<div class="stop${tier}" data-place="${id}">
          <div class="stop-idx">${idx}</div>
          <div class="stop-txt"><div class="stop-name">${name}${req}</div><div class="stop-meta">${meta}</div></div>
          ${ICON.chevR}
        </div>`;
      };
      const hopRow = (a, b) => {
        const h = hopOf(a, b);
        const sub = [h.alt ? '或 ' + h.alt : '', taxiText(h, true)].filter(Boolean).join(' · ');
        return `<button class="hop${h.leg ? ' is-leg' : ''}" data-a="${a}" data-b="${b}" data-day="${d.n}">
          <span class="hop-ico">${hopIcons(h)}</span>
          <span class="hop-txt"><span class="hop-main"><b>${esc(h.sum)}</b><span class="hop-t">${hopTime(h)}</span></span>${sub ? `<small>${esc(sub)}</small>` : ''}</span>
        </button>`;
      };
      const stops = path.map((k, i) => (i ? hopRow(path[i - 1], k) : '') + nodeRow(k, i)).join('');

      const foodRow = (d.food || []).length
        ? `<div class="day-food">${ICON.food}<span><b>今天吃什么</b>${d.food.map(fid => foodById[fid] ? foodById[fid].name : '').filter(Boolean).join('、')}</span></div>`
        : '';

      return `${sec}<div class="day ${open ? 'is-open' : ''}" data-day="${d.n}" style="--c:${color}">
        <button class="day-head">
          <div class="day-no"><b>${d.n}</b><span>${dt.md}</span><span>${dt.wd}</span></div>
          <div class="day-main">
            ${tag}
            <div class="day-title">${titleOf(d)}</div>
            <div class="day-sub">${isLite() && d.liteSub ? d.liteSub : d.sub}</div>
          </div>
          <div class="day-chev">${ICON.chevD}</div>
        </button>
        <div class="day-body">
          <div class="day-body-in">
            ${routeModeRow(d)}
            <div class="stop-list">${stops}</div>
            ${extraRow}
            ${scheduleRow(d)}
            ${d.note ? `<div class="day-note">${d.note}</div>` : ''}
            ${foodRow}
            <div class="day-actions">
              <button class="mini-btn" data-focus-day="${d.n}">${ICON.locate}框住当天路线</button>
              <button class="mini-btn" data-open-city="${d.city}">${ICON.map}打开${city.name}地图</button>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    // 事件
    $$('.day-head', dayList).forEach(btn => {
      btn.addEventListener('click', () => {
        const n = +btn.parentElement.dataset.day;
        focusDay(state.day === n ? null : n);
      });
    });

    $$('.hop', dayList).forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        if (window.innerWidth <= 860) $('#side').classList.remove('is-open');
        focusHop(el.dataset.a, el.dataset.b, +el.dataset.day);
      });
    });

    $$('.stop-x', dayList).forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        selectPlace(el.dataset.place, { fly: true });
        if (window.innerWidth <= 860) $('#side').classList.remove('is-open');
      });
    });

    $$('.stop', dayList).forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const id = el.dataset.place;
        if (el.dataset.hotel) showHotel(el.dataset.hotel);
        else if (placeById[id]) selectPlace(id, { fly: true });
        else {
          const h = T.hubs.find(x => x.key === id || x.id === id);
          if (h) { openHub(h.id); flyToPlace(pos(h.key), 15.5); }
        }
        if (window.innerWidth <= 860) $('#side').classList.remove('is-open');
      });
    });

    $$('[data-focus-day]', dayList).forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        focusDay(+b.dataset.focusDay);
      });
    });

    $$('[data-open-city]', dayList).forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        openCity(b.dataset.openCity);
        if (window.innerWidth <= 860) $('#side').classList.remove('is-open');
      });
    });
  }

  /* ---------------- 侧栏：城市 chips ---------------- */
  const cityChips = $('#cityChips');
  function renderChips() {
    cityChips.innerHTML = MAIN_CITIES.map(cid => {
      const c = cityById[cid];
      return `<button class="chip ${state.mode === 'city' && state.city === cid ? 'is-active' : ''}" data-city="${cid}" style="--c:${c.color}"><i></i>${c.name}</button>`;
    }).join('');
    $$('.chip', cityChips).forEach(b => {
      b.addEventListener('click', () => openCity(b.dataset.city));
    });

    $('#cityRail').innerHTML = MAIN_CITIES.map(cid => {
      const c = cityById[cid];
      return `<button class="city-pill ${state.mode === 'city' && state.city === cid ? 'is-active' : ''}" data-city="${cid}" style="--c:${c.color}"><span class="cp-name">${c.name}</span><small>${c.nights} 晚</small></button>`;
    }).join('');
    $$('.city-pill', $('#cityRail')).forEach(b => {
      b.addEventListener('click', () => {
        const cid = b.dataset.city;
        openCity(cid);
        const sec = $(`.city-sec[data-open-city="${cid}"]`, dayList);
        if (sec) $('#panel-days').scrollTo({ top: Math.max(0, sec.offsetTop - 4), behavior: 'smooth' });
      });
    });
  }

  function openCity(cid) {
    state.city = cid;
    state.mode = 'city';
    state.day = null;
    updateModeUI();
    syncDayCards();
    updateTimeline();
    const c = cityById[cid];
    // 整数级：瓦片不缩放，最清晰；窄屏向下取整，免得城市边上的景点被裁掉
    const cz = window.innerWidth <= 860 ? Math.floor(c.zoom) : Math.round(c.zoom);
    updateDayPill();
    renderLegend();
    flyView(centerFor(c.center, cz), cz);   // 内含图层同步
  }

  function updateModeUI() {
    $$('.mode').forEach(b => b.classList.toggle('is-active', b.dataset.mode === state.mode));
    $('#dayPill').hidden = !state.day;
    renderChips();   // 回到总览时城市按钮 / 城市色块的选中态要一起清掉
  }

  $('#modeSwitch').addEventListener('click', e => {
    const b = e.target.closest('.mode');
    if (!b) return;
    if (b.dataset.mode === 'overview') {
      state.mode = 'overview';
      state.day = null;
      updateModeUI(); updateDayPill(); syncDayCards(); renderLegend(); updateTimeline();
      flyBounds(L.latLngBounds(T.cities.filter(c => !c.parent).map(c => c.center)).pad(0.3));
    } else {
      openCity(state.city);
    }
  });

  /* ---------------- 图层面板 ---------------- */
  const LAYER_DEFS = [
    { key: 'legs', name: '城市间大交通', sw: '#1F5C4A', count: () => T.legs.length + ' 段', group: '全程' },
    { key: 'intra', name: '城市内每日路线', sw: '#A8392B', count: () => '按天' , group: '全程' },
    { key: 'poi', name: '景点与地标', sw: '#2B4E82', count: () => T.places.length + ' 处', group: '全程' },
    { key: 'hub', name: '车站与机场', sw: '#0F4C3A', count: () => T.hubs.length + ' 个', group: '全程' },
    { key: 'transit', name: '地铁 / 水上巴士 / 电车', sw: '#C9A227', count: () => T.transit.length + ' 条线', group: '交通设施' },
    { key: 'food', name: '餐厅推荐', sw: '#A9812F', count: () => T.food.length + ' 家', group: '周边' },
    { key: 'shop', name: '购物街区', sw: '#2B4E82', count: () => T.areas.length + ' 片', group: '周边' }
  ];

  function renderLayers() {
    const groups = {};
    LAYER_DEFS.forEach(d => { (groups[d.group] = groups[d.group] || []).push(d); });
    const baseGroup = `<div class="layer-group is-radio">
      <h3>底图<span>显示风格</span></h3>
      ${[{ k: 'light', n: '浅色极简', d: '默认 · 留白多，看结构最清楚' },
        { k: 'street', n: '标准地图', d: '街道与地名更全，找路时用' },
        { k: 'offline', n: '离线底图', d: '已下载的城市范围，断网也能看' }].map(b => `
        <div class="layer-item ${activeBase === b.k ? 'is-on' : ''}" data-base="${b.k}" style="--sw:#0F4C3A">
          <div class="layer-name">${b.n}<div class="layer-desc">${b.d}</div></div>
          <div class="layer-tick"></div>
        </div>`).join('')}
    </div>`;

    $('#layerList').innerHTML = Object.keys(groups).map(g => `
      <div class="layer-group">
        <h3>${g}<span>${g === '全程' ? '跨城市' : '默认关闭'}</span></h3>
        ${groups[g].map(d => `
          <div class="layer-item ${state.layers[d.key] ? 'is-on' : ''}" data-layer="${d.key}" style="--sw:${d.sw}">
            <div class="layer-swatch sw-${d.key}" style="--sw:${d.sw}"></div>
            <div class="layer-name">${d.name}</div>
            <div class="layer-count">${typeof d.count === 'function' ? d.count() : d.count}</div>
            <div class="layer-tick"></div>
          </div>
        `).join('')}
      </div>
    `).join('') + baseGroup;

    $$('.layer-item', $('#layerList')).forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.base) {
          const k = el.dataset.base;
          if (k === activeBase) return;
          setBase(k);
          renderLayers();
          toast(k === 'light' ? '已切换浅色底图' : '已切换标准地图');
          return;
        }
        const k = el.dataset.layer;
        state.layers[k] = !state.layers[k];
        el.classList.toggle('is-on', state.layers[k]);
        syncVisibility();
        renderLegend();
      });
    });
  }

  $$('[data-preset]').forEach(b => {
    b.addEventListener('click', () => {
      const p = b.dataset.preset;
      if (p === 'all') Object.keys(state.layers).forEach(k => state.layers[k] = true);
      if (p === 'clean') {
        state.layers = { legs: true, intra: true, poi: true, hub: true, transit: false, food: false, shop: false };
      }
      if (p === 'transit') {
        state.layers = { legs: true, intra: false, poi: false, hub: true, transit: true, food: false, shop: false };
      }
      renderLayers(); syncVisibility(); renderLegend();
    });
  });

  /* ---------------- 图例 ---------------- */
  function renderLegend() {
    const rows = [];
    const cityList = state.mode === 'city' ? [state.city] : MAIN_CITIES;
    rows.push(`<div class="legend-cities">${cityList.map(cid => {
      const c = cityById[cid];
      return c ? `<span class="legend-row"><span class="lz lz-dot" style="--c:${c.color}"></span>${c.name}</span>` : '';
    }).join('')}</div>`);
    rows.push(`<div class="legend-row"><span class="lz lz-pin is-must"></span>必看</div>`);
    rows.push(`<div class="legend-row"><span class="lz lz-pin is-opt"></span>可跳过</div>`);
    rows.push(`<div class="legend-row"><span class="lz lz-hub">${ICON.train}</span>车站 / 机场</div>`);
    if (state.layers.legs) rows.push(`<div class="legend-row"><span class="lz lz-line" style="--c:#1F5C4A"></span>城际高铁</div>`);
    if (state.layers.transit) rows.push(`<div class="legend-row"><span class="lz lz-line" style="--c:#C9A227"></span>地铁 / 水上巴士</div>`);
    if (state.layers.food) rows.push(`<div class="legend-row"><span class="lz lz-food">${ICON.food}</span>餐厅</div>`);
    if (state.layers.shop) rows.push(`<div class="legend-row"><span class="lz lz-area"></span>购物街区</div>`);
    if (map.getZoom() < 9.8) {
      rows.push(`<div class="legend-hint">放大后显示景点与路线</div>`);
    }
    $('#legend').innerHTML = rows.join('');
  }

  /* ---------------- 日期条 ---------------- */
  function updateDayPill() {
    const pill = $('#dayPill');
    if (state.day) {
      const d = T.days.find(x => x.n === state.day);
      pill.hidden = false;
      pill.textContent = `D${d.n} · ${titleOf(d).split(' · ')[0]}`;
      pill.title = '取消当天高亮';
      pill.onclick = () => {
        state.day = null;
        updateDayPill(); applyDayHighlight(); syncDayCards(); renderLegend(); updateTimeline();
      };
    } else {
      pill.hidden = true;
    }
  }

  /* ---------------- 播放 ---------------- */
  let playTimer = null;
  const playBtn = $('#playBtn');
  function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    playBtn.classList.remove('is-playing');
    $('.play-ico', playBtn).textContent = '▶';
    $('.play-txt', playBtn).textContent = '按天播放';
  }
  function startPlay() {
    if (state.day === 16) state.day = 0;
    playBtn.classList.add('is-playing');
    $('.play-ico', playBtn).textContent = '❚❚';
    $('.play-txt', playBtn).textContent = '暂停';
    playTimer = setInterval(() => {
      const next = (state.day || 0) + 1;
      if (next > 16) { stopPlay(); return; }
      focusDay(next);
      const el = $(`.day[data-day="${next}"]`, dayList);
      if (el) {
        el.classList.add('is-open');
        const panel = $('#panel-days');
        panel.scrollTo({ top: Math.max(0, el.offsetTop - 80), behavior: 'smooth' });
      }
    }, 3600);
  }
  playBtn.addEventListener('click', () => { playTimer ? stopPlay() : startPlay(); });
  $('#resetBtn').addEventListener('click', () => {
    stopPlay();
    state.day = null; state.selected = null; state.mode = 'overview';
    closeDetail();
    updateModeUI(); updateDayPill(); syncDayCards(); renderLegend(); updateTimeline();
    flyBounds(L.latLngBounds(MAIN_CITIES.map(c => cityById[c].center)).pad(0.3));
  });

  /* ---------------- 精力版本开关（侧栏底部常驻，看到哪一天都能直接切） ---------------- */
  function paintEnergy() {
    $$('#energySwitch [data-energy]').forEach(b => {
      const on = b.dataset.energy === state.energy;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', String(on));
    });
  }
  function setEnergy(v) {
    if (v === state.energy) return;
    // 记下视口顶上那张日卡的位置，重建列表后放回原处，正在看的日程不跳走
    const scroller = $('#panel-days');
    const top = scroller.getBoundingClientRect().top;
    const anchor = $$('.day', dayList).find(c => c.getBoundingClientRect().bottom > top + 8);
    const off = anchor ? anchor.getBoundingClientRect().top - top : 0;
    state.energy = v;
    try { localStorage.setItem(ENERGY_KEY, state.energy); } catch (e) {}
    paintEnergy();
    buildDailyRoutes();
    renderDays();
    renderTimeline();
    updateDayPill();
    const el = anchor && $(`.day[data-day="${anchor.dataset.day}"]`, dayList);
    if (el) scroller.scrollTop += el.getBoundingClientRect().top - top - off;
    syncVisibility();
    if (state.day) focusDay(state.day, { keepScroll: true });
    toast(isLite() ? '已切换低精力版：只走核心，订票和火车不变' : '已切换高精力版：完整行程');
  }
  $$('#energySwitch [data-energy]').forEach(b => b.addEventListener('click', () => setEnergy(b.dataset.energy)));
  paintEnergy();

  /* ---------------- Tab ---------------- */
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      state.tab = t.dataset.tab;
      $$('.tab').forEach(x => x.classList.toggle('is-active', x === t));
      $$('.panel').forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + state.tab));
    });
  });

  /* ---------------- 搜索 ---------------- */
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  function searchIndex() {
    const items = [];
    T.places.forEach(p => items.push({ id: p.id, kind: 'place', name: p.name, sub: p.it, city: p.base || p.city }));
    T.hubs.forEach(h => items.push({ id: h.id, kind: 'hub', name: h.name, sub: h.it, city: h.city }));
    T.food.forEach(f => items.push({ id: f.id, kind: 'food', name: f.name, sub: f.note.slice(0, 28) + '…', city: f.city }));
    return items;
  }
  const SEARCH = searchIndex();

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.hidden = true; return; }
    const hits = SEARCH.filter(x =>
      x.name.toLowerCase().includes(q) || (x.sub || '').toLowerCase().includes(q)
    ).slice(0, 9);
    if (!hits.length) {
      searchResults.innerHTML = `<div class="sr-empty">没有匹配的地点</div>`;
    } else {
      searchResults.innerHTML = hits.map(h => {
        const cid = cityById[h.city] ? h.city : 'rome';
        return `<div class="sr-item" data-kind="${h.kind}" data-id="${h.id}" style="--c:${colorByCity(cid)}">
          <span class="sr-ico">${h.kind === 'place' ? ICON.pin : h.kind === 'hub' ? ICON.train : ICON.food}</span>
          <span class="sr-name">${h.name}</span>
          <span class="sr-city">${cityById[cid].name}</span>
        </div>`;
      }).join('');
    }
    searchResults.hidden = false;
    $$('.sr-item', searchResults).forEach(el => {
      el.addEventListener('click', () => {
        const { kind, id } = el.dataset;
        searchResults.hidden = true;
        searchInput.value = '';
        if (kind === 'place') selectPlace(id, { fly: true });
        else if (kind === 'hub') { openHub(id); const h = hubById[id]; flyToPlace(pos(h.key), 15.5); }
        else { const f = foodById[id]; buildFoodCard(f); }
      });
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.searchbox')) searchResults.hidden = true;
  });

  /* ---------------- 攻略 ---------------- */
  function renderGuide() {
    const totalKm = T.legs.reduce((s, l) => s + (l.km || 0), 0);
    $('#guideBody').innerHTML = `
      <h2>行程骨架</h2>
      <div class="stat-grid">
        <div class="stat-card" style="--c:var(--green)"><div class="k">天数</div><div class="v">16 <small>天</small></div></div>
        <div class="stat-card" style="--c:var(--c-rome)"><div class="k">城市</div><div class="v">4 <small>座</small></div></div>
        <div class="stat-card" style="--c:var(--c-venice)"><div class="k">城际里程</div><div class="v">${totalKm} <small>km</small></div></div>
        <div class="stat-card" style="--c:var(--c-florence)"><div class="k">换宿</div><div class="v">4 <small>次</small></div></div>
      </div>
      <div class="stay-bar">${MAIN_CITIES.map(cid => `<span style="--c:${cityById[cid].color};flex:${HOTELS[cid].nights}"><b>${cityById[cid].name}</b>${HOTELS[cid].nights} 晚</span>`).join('')}</div>
      <p>罗马 5 晚 → 佛罗伦萨 4 晚 → 威尼斯 2 晚 → 米兰 4 晚。四次换宿都靠高铁完成，单程最长 2.5 小时，不需要中途过夜。</p>
      <p>排法的原则是<b>一天只待一个片区、全程公共交通不打车</b>：罗马按梵蒂冈 / 古罗马 / 北边下坡线分三天，佛罗伦萨三天全程步行，周一博物馆闭馆那天去比萨半日；威尼斯离开那天不再进主岛折返，米兰去科莫从酒店所在的 M1 线 Cadorna 直达湖滨站。D5、D9 下午和 D15 是机动时间，用来消化天气、排队和临时发现。</p>
      <p>每天分<b>高精力 / 低精力</b>两个版本（侧栏底部随时切换，键盘 E 也行）：低精力版只走核心景点、早点回酒店，<b>需要预约的门票和火车两个版本完全一样</b>，只在免预约的点上取舍，所以下面的票照常买就行。</p>

      <h2>要买的火车票</h2>
      <div class="book-list">
        ${[
          ['1/23 周六 · 罗马 → 佛罗伦萨', 'Roma Termini 09:00 前后 → Firenze S.M.N.，约 1 小时 35 分。Frecciarossa 或 Italo 都行，提前买早鸟。', '必须订座'],
          ['1/27 周三 · 佛罗伦萨 → 威尼斯', 'Firenze S.M.N. 09:00 前后 → Venezia S. Lucia（不是 Mestre），约 2 小时 05 分。', '必须订座'],
          ['1/29 周五 · 威尼斯 → 米兰', 'Venezia S. Lucia 10:00 前后 → Milano Centrale，约 2 小时 25 分。原计划 12:30 的车，提前到上午能多出半个下午。', '必须订座'],
          ['1/25 周一 · 佛罗伦萨 ⇄ 比萨', '区域火车，当天在站台机器买，上车前打卡。', '不用提前买'],
          ['1/31 周日 · 米兰 Cadorna ⇄ 科莫湖滨', 'Trenord 区域火车，当天买，上车前打卡。', '不用提前买'],
          ['2/2 周二 · Cadorna → 马尔彭萨 T1', 'Malpensa Express，€13，可在 App 上买。', '不用提前买']
        ].map(([name, meta, tag]) => `
          <div class="book-item">
            <div class="book-head"><b>${name}</b><span class="book-tag">${tag}</span></div>
            <div class="book-meta">${meta}</div>
          </div>
        `).join('')}
      </div>

      <h2>怎么买票</h2>
      <ul>
        <li><b>高铁（Frecciarossa / Italo）</b>：提前 1–3 个月在 Trenitalia 或 Italo 官网买早鸟，二等座常能买到 €19.9–29.9。不要用第三方加价平台。</li>
        <li><b>区域火车（比萨、科莫）</b>：不需要订座，车站自助机买，上车前在绿色小机器打卡（convalidare），否则算逃票。</li>
        <li><b>市内交通</b>：罗马地铁单程 €1.5（100 分钟内换乘一次）；威尼斯水上巴士单程 €9.5，<b>买 24/48 小时通票更划算</b>（€25 / €35）；米兰地铁单程 €2.2。</li>
      </ul>

      <h2>必须提前抢的（按优先级）</h2>
      <p style="color:#8B8579;font-size:11.5px;margin-top:2px">票价与时刻核对于 2026 年 11 月，下单前以官网当日页面为准。</p>
      <div class="book-list">
        ${[
          ['《最后的晚餐》', '按季度放票、开票即抢；每周三 12:00 补下周余票', 'https://cenacolovinciano.org/', 'cenacolovinciano.org'],
          ['博尔盖塞美术馆', '提前 2–3 周，场次限流，迟到作废', 'https://galleriaborghese.cultura.gov.it/', 'galleriaborghese'],
          ['梵蒂冈博物馆', '提前 3–4 周，周末与免费周日最紧', 'https://tickets.museivaticani.va/home', 'tickets.museivaticani.va'],
          ['斗兽场 + 古罗马广场', '提前 3–4 周，15 分钟实名时段', 'https://ticketing.colosseo.it/', 'ticketing.colosseo.it'],
          ['圣马可大教堂', '提前 2–3 周，已取消现场售票', 'https://www.basilicasanmarco.it/', 'basilicasanmarco.it'],
          ['乌菲兹 / 学院美术馆', '提前 1–2 周，线上比现场贵 €4 但免排队', 'https://tickets.uffizi.it/', 'tickets.uffizi.it'],
          ['圣母百花穹顶', '提前 1–2 周，联票 7 天有效', 'https://duomo.firenze.it/', 'duomo.firenze.it'],
          ['比萨斜塔登顶', '提前 3–7 天，每批 20 人', 'https://www.opapisa.it/', 'opapisa.it']
        ].map(([name, meta, url, label]) => `
          <div class="book-item">
            <div class="book-head"><b>${name}</b><a href="${url}" target="_blank" rel="noopener">${label}</a></div>
            <div class="book-meta">${meta}</div>
          </div>
        `).join('')}
      </div>

      <h2>寒假（1–2 月）要注意</h2>
      <ul>
        <li><b>天黑得早</b>：日落约 17:00–17:40，户外景点（斗兽场、米开朗基罗广场）尽量排在下午 15:00 前。</li>
        <li><b>威尼斯涨潮</b>：11 月至次年 2 月是 acqua alta 高发期，圣马可广场会积水，出发前查潮汐预报，木栈道会架起来。</li>
        <li><b>雪与雾</b>：科莫湖缆车在结冰或大风时可能停运，出发前看官网；佛罗伦萨清晨常有雾，反而是拍照的好时候。</li>
        <li><b>穿着</b>：教堂有肩膝遮盖要求（梵蒂冈、圣彼得、圣马可最严），随身带一条围巾或薄外套。</li>
        <li><b>淡季红利</b>：1–2 月是意大利旅游淡季，博物馆票价常是淡季价，排队比夏天短一半。</li>
      </ul>

      <h2>餐厅怎么点最省事</h2>
      <ul>
        <li>认准门口写 <b>"Cucina tipica"</b> 或菜单有图的 trattoria，沟通成本最低。</li>
        <li><b>Coperto</b>（座位费）每人 €1.5–3 是正常的，不是坑。</li>
        <li>站着喝咖啡 €1.2–1.5，坐下喝可能 €4–6，同一杯。</li>
        <li>午餐 12:30–14:30、晚餐 19:30 后，中间厨房休息。想吃晚饭 19:00 前到最稳。</li>
      </ul>

      <h2>退税</h2>
      <p>同一店铺同一天消费满 <b>€154.94</b> 可开退税单（Tax Free Form），要出示护照。离境时在马尔彭萨机场找海关盖章（可能查货），再去退款柜台。商品别托运——海关可能要验。</p>

      <h2>三个最容易翻车的点</h2>
      <ul>
        <li><b>威尼斯拖行李</b>：主岛全是桥和台阶，没有车。住处离车站越近越好，或提前查是否有 porter 服务。</li>
        <li><b>梵蒂冈周三</b>：教皇接见日，圣彼得广场封闭、大教堂上午不开，行程里避开。</li>
        <li><b>《最后的晚餐》没抢到</b>：别买黄牛票。可关注官方释放的当日余票，或改去布雷拉看卡拉瓦乔，损失不大。</li>
      </ul>

      <h2>这份地图怎么用</h2>
      <ul>
        <li><b>日程</b>：点任意一天，地图会自动框住当天景点并高亮路线；再点一次取消。</li>
        <li><b>图层</b>：地铁、水上巴士、餐厅、购物区默认关闭，按需打开，避免地图过载。</li>
        <li><b>城市内</b>：点顶部城市名进入单城视图，只显示该城内容。</li>
        <li><b>详情</b>：点任意景点，看开放时间、票价、预约方式、怎么去。</li>
      </ul>
    `;
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 260);
    }, 2200);
  }

  /* ---------------- 移动端 ---------------- */
  $('#sideOpen').addEventListener('click', () => $('#side').classList.add('is-open'));
  $('#sideClose').addEventListener('click', () => $('#side').classList.remove('is-open'));
  const scrim = $('#scrim');
  if (scrim) scrim.addEventListener('click', () => $('#side').classList.remove('is-open'));

  /* 底部详情抽屉：在顶部（或内容已滚到顶）向下拖动即可关闭，单手不用够右上角的 ✕ */
  (function sheetDrag() {
    let y0 = null, dy = 0;
    detail.addEventListener('touchstart', e => {
      if (window.innerWidth > 860 || !detail.classList.contains('is-open')) return;
      if (detailBody.scrollTop > 0 && !e.target.closest('.d-hero')) return;
      if (e.target.closest('a, button')) return;
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    detail.addEventListener('touchmove', e => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0) {
        detail.classList.add('is-dragging');
        detail.style.transform = `translateY(${dy}px)`;
      }
    }, { passive: true });
    const end = () => {
      if (y0 == null) return;
      detail.classList.remove('is-dragging');
      detail.style.transform = '';
      if (dy > 90) closeDetail();
      y0 = null; dy = 0;
    };
    detail.addEventListener('touchend', end);
    detail.addEventListener('touchcancel', end);
  })();

  /* ---------------- 键盘快捷键 ---------------- */
  const CITY_KEYS = { '1': 'rome', '2': 'florence', '3': 'venice', '4': 'milan' };
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') {
      if (detail.classList.contains('is-open')) { closeDetail(); return; }
      if ($('#side').classList.contains('is-open')) { $('#side').classList.remove('is-open'); return; }
      if (state.day) focusDay(null);
      return;
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusDay(Math.min(16, (state.day || 0) + 1)); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); focusDay(Math.max(1, (state.day || 2) - 1)); return; }
    if (CITY_KEYS[e.key]) { openCity(CITY_KEYS[e.key]); return; }
    if (e.key === 'e' || e.key === 'E') { setEnergy(isLite() ? 'high' : 'low'); return; }
  });

  /* ---------------- 统计行 ---------------- */
  function renderStatLine() {
    const totalKm = T.legs.reduce((s, l) => s + (l.km || 0), 0);
    $('#statLine').innerHTML = `<span>${T.places.length} 个地点 · ${T.legs.length} 段城际 · ${totalKm} km</span>`;
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    renderChips();
    renderDays();
    renderTimeline();
    renderLayers();
    renderGuide();
    renderLegend();
    renderStatLine();
    syncVisibility();
    updateModeUI();

    // 初始视野：等布局稳定后再 fit，避免容器尺寸为 0 导致缩放算错
    requestAnimationFrame(() => {
      map.invalidateSize();
      if (window.innerWidth <= 860) {
        map.setView([43.55, 11.9], 6, { animate: false });
      } else {
        map.fitBounds(L.latLngBounds(MAIN_CITIES.map(c => cityById[c].center)), {
          paddingTopLeft: [sideInset() + 56, 130],
          paddingBottomRight: [56, 64],
          animate: false
        });
      }
    });

    // 地图点击空白关闭详情
    map.on('click', () => {
      if (detail.classList.contains('is-open')) closeDetail();
    });

    // 缩放时重新计算渐进披露层级
    map.on('zoomend', () => { syncVisibility(); renderLegend(); });
    // 拖动后重新排布景点名称，避免标签压到别的点上
    map.on('moveend', () => updateLabels());

    // 支持分享链接：?city=rome / ?day=6
    setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const c = params.get('city');
      const d = params.get('day');
      if (c && cityById[c]) openCity(c);
      if (d && T.days.some(x => x.n === +d)) focusDay(+d);
      const pl = params.get('place');
      if (pl && placeById[pl]) setTimeout(() => selectPlace(pl, { fly: false }), 150);
      const ht = params.get('hotel');
      if (ht && HOTELS[ht]) setTimeout(() => showHotel(ht), 200);
      const zz = params.get('z');
      if (zz) setTimeout(() => map.setZoom(+zz, { animate: false }), 300);
      const bs = params.get('base');
      if (bs && BASE[bs]) setTimeout(() => { setBase(bs); renderLayers(); }, 250);

      // 断网时自动切到本地底图
      if (navigator.onLine === false) setBase('offline');
      const tab = params.get('tab');
      if (tab) { const t = $(`.tab[data-tab="${tab}"]`); if (t) t.click(); }

      // 调试面板：?dbg 时在左下角打印标签统计
      if (params.get('dbg')) {
        window.__map = map;   // 调试用：自动化测试读缩放级别
        const box = document.createElement('div');
        box.id = 'dbgBox';
        box.style.cssText = 'position:fixed;left:0;bottom:0;z-index:9999;background:#111;color:#3f6;font:11px/1.5 monospace;padding:6px 10px;max-width:100%;white-space:pre';
        document.body.appendChild(box);
        const tick = () => {
          const all = [...document.querySelectorAll('.poi-label')];
          box.textContent =
            `zoom=${map.getZoom()} day=${state.day} mode=${state.mode}\n` +
            `labels=${all.length} visible=${all.filter(e => e.style.opacity === '1').length}\n` +
            `sample=${all.filter((e, i) => i < 6).map(e => e.textContent).join('|')}\n` +
            `shortTest=${(placeById.vecchio || {}).short}|${(placeById.vecchio || {}).name}`;
        };
        tick();
        setInterval(tick, 800);
      }
    }, 400);

    // 缺坐标提示
    setTimeout(() => {
      if (missing.size) {
        console.warn('[trtip] 缺少坐标:', Array.from(missing));
        toast(`有 ${missing.size} 个地点缺坐标，已跳过`);
      }
    }, 600);

    // 首屏引导
    setTimeout(() => {
      let seen = false;
      try { seen = !!sessionStorage.getItem('trtip_seen'); sessionStorage.setItem('trtip_seen', '1'); } catch { seen = false; }
      if (!seen) toast('点左侧任意一天，地图会框住当天路线');
    }, 1400);

    // 入场动画只播一次，之后切换日期不再逐个弹跳
    setTimeout(() => document.body.classList.add('booted'), 2800);
  }

  window.addEventListener('resize', () => map.invalidateSize());

  // 等 DOM + 数据就绪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
