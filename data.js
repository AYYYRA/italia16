/* ============================================================
   意大利 16 天 · 行程数据
   坐标由 Nominatim 核验后写入 coords.json，此处只存 key
   ============================================================ */

window.TRIP = (function () {

  /* ---------------- 城市 ----------------
     parent 用于把一日游城市挂到主城配色 */
  const cities = [
    {
      id: 'rome', name: '罗马', it: 'Roma', color: '#A8392B',
      center: [41.8990, 12.4650], zoom: 13.2, nights: 5,
      hotel: { name: 'c-hotels Club House Roma', key: 'hotel_rome', note: 'Aurelio 区 Via Alciato；门口就是地铁 A 线 Cornelia，到 Termini 22 分钟、梵蒂冈 12 分钟、斗兽场约 32 分钟' },
      station: { name: 'Roma Termini', key: 'termini', note: '高铁 / 机场快线 / 地铁 A·B 线换乘' },
      blurb: '五晚，按片区排：梵蒂冈（离酒店 3 站）、古罗马遗址、北边博尔盖塞一路下坡到纳沃纳，各占一天，最后半天留给早市和特拉斯提弗列。'
    },
    {
      id: 'florence', name: '佛罗伦萨', it: 'Firenze', color: '#9A6B24',
      center: [43.7785, 11.2495], zoom: 14.0, nights: 4,
      hotel: { name: 'PopArtment', key: 'hotel_florence', note: 'Via Catalani，带厨房的 Studio；步行 1.1 km 到 SMN，去 Duomo 约 20 分钟' },
      station: { name: 'Firenze S.M.N.', key: 'smn', note: '高铁 / 区域火车枢纽，去比萨、锡耶纳都从这里出发' },
      blurb: '四晚，老城三天全程步行 + 周一（博物馆闭馆）去比萨半日；锡耶纳往返 3 小时车程，默认不去。'
    },
    {
      id: 'venice', name: '威尼斯', it: 'Venezia', color: '#17656F',
      center: [45.4385, 12.3235], zoom: 13.9, nights: 2,
      hotel: { name: 'Hampton by Hilton Isola Nuova', key: 'hotel_venice', note: '在 Tronchetto 岛（不在主岛！）；People Mover 4 分钟到 Piazzale Roma，再步行 600 m 到 S. Lucia 车站' },
      station: { name: 'Venezia S. Lucia', key: 'sl', note: '一出站就是大运河，水上巴士 1 线、2 线在这里换乘' },
      blurb: '两晚，到达当天沿大运河进主岛，第二天外岛；离开那天不再进主岛折返，直接去车站。住处在 Tronchetto 岛，进出走 People Mover。'
    },
    {
      id: 'milan', name: '米兰', it: 'Milano', color: '#2B4E82',
      center: [45.4680, 9.1560], zoom: 12.9, nights: 4,
      hotel: { name: 'Amedia Milan', key: 'hotel_milan', note: 'Bisceglie 区，就在 M1 线终点站旁；到 Duomo 18 分钟、到 Cadorna 12 分钟（机场快线起点）' },
      station: { name: 'Milano Centrale', key: 'centrale', note: '高铁枢纽，去科莫、威尼斯都在这里；机场快线另在 Cadorna' },
      blurb: '四晚，市区艺术 + 科莫湖一日 + 最后一天购物退税缓冲。'
    },
    { id: 'pisa', name: '比萨', it: 'Pisa', color: '#9A6B24', parent: 'florence', center: [43.7230, 10.3966], zoom: 14.4, nights: 0, excursion: true },
    { id: 'siena', name: '锡耶纳', it: 'Siena', color: '#9A6B24', parent: 'florence', center: [43.3187, 11.3308], zoom: 14.2, nights: 0, excursion: true },
    { id: 'lucca', name: '卢卡', it: 'Lucca', color: '#9A6B24', parent: 'florence', center: [43.8430, 10.5070], zoom: 14.2, nights: 0, excursion: true },
    { id: 'como', name: '科莫湖', it: 'Lago di Como', color: '#2B4E82', parent: 'milan', center: [45.8100, 9.0800], zoom: 13.6, nights: 0, excursion: true }
  ];

  /* ---------------- 交通枢纽 ---------------- */
  const hubs = [
    { id: 'h_fco', key: 'fco', city: 'rome', name: '菲乌米奇诺机场', it: 'FCO · T1/T3', kind: 'airport', note: '入境后跟随 "Treni" 指示牌到火车站，Leonardo Express 直达 Termini。' },
    { id: 'h_termini', key: 'termini', city: 'rome', name: '罗马 Termini 中央车站', it: 'Roma Termini', kind: 'station', note: '24 个站台。地铁 A 线、B 线在站内换乘，高铁在 1–8 号站台侧。' },
    { id: 'h_smn', key: 'smn', city: 'florence', name: '新圣母火车站', it: 'Firenze S.M.N.', kind: 'station', note: '出站正对圣母百花的方向，步行 8 分钟。去比萨在 5–9 号站台。' },
    { id: 'h_pisa', key: 'pisa_centrale', city: 'pisa', name: '比萨中央车站', it: 'Pisa Centrale', kind: 'station', note: '到奇迹广场步行 20 分钟，或站前 LAM Rossa 公交 10 分钟。' },
    { id: 'h_siena', key: 'siena_train', city: 'siena', name: '锡耶纳车站', it: 'Siena FS', kind: 'station', note: '在城外山下，需转公交或扶梯上老城（约 15 分钟）。' },
    { id: 'h_sl', key: 'sl', city: 'venice', name: '圣露西亚车站', it: 'Venezia S. Lucia', kind: 'station', note: '出站即大运河。水上巴士 1 线慢船、2 线快船都在站前码头。' },
    { id: 'h_centrale', key: 'centrale', city: 'milan', name: '米兰中央车站', it: 'Milano Centrale', kind: 'station', note: '去科莫 S. Giovanni 在 12–16 号站台，约 40 分钟。' },
    { id: 'h_cadorna', key: 'cadorna', city: 'milan', name: '卡多尔纳车站', it: 'Milano Cadorna', kind: 'station', note: 'Malpensa Express 从这里发车直达机场 T1，比中央车站更方便。' },
    { id: 'h_mxp', key: 'mxp', city: 'milan', name: '马尔彭萨机场', it: 'MXP · T1', kind: 'airport', note: 'Malpensa Express 43 分钟到 Cadorna；大巴约 50 分钟到中央车站。' },
    { id: 'h_como', key: 'como_sg', city: 'como', name: '科莫 S. Giovanni 站', it: 'Como S. Giovanni', kind: 'station', note: '国铁站（从米兰中央车站来）。到湖边步行 12 分钟；也可在站前转 1 路公交。' },
    { id: 'h_como_lago', key: 'como_lago', city: 'como', name: '科莫湖滨站', it: 'Como Nord Lago', kind: 'station', note: 'Trenord 从米兰 Cadorna 直达，出站就是湖边，大教堂 300 米、Brunate 缆车下站步行 5 分钟。' }
  ];

  /* ---------------- 景点 ---------------- */
  const places = [
    /* ===== 罗马 ===== */
    {
      id: 'spagna', key: 'spagna', city: 'rome', base: 'rome',
      name: '西班牙广场 · 西班牙阶梯', it: 'Piazza di Spagna / Scalinata', cat: '广场', dur: '45 分钟',
      desc: '十八世纪的巴洛克舞台：135 级台阶从广场一路铺到山上天主圣三教堂，台阶下是贝尔尼尼父亲的「破船喷泉」。这里是全罗马最上镜的黄昏机位，也是奢侈品街 Via dei Condotti 的起点。',
      hours: '全天开放（台阶本身禁止坐卧，会有警员吹哨）', price: '免费',
      booking: { level: 'none' },
      access: '地铁 A 线 Spagna 站出站即到', tip: '清晨 7–8 点几乎没人；白天台阶禁止坐下吃东西，会被罚款。'
    },
    {
      id: 'trevi', key: 'trevi', city: 'rome', base: 'rome',
      name: '特雷维喷泉（许愿池）', it: 'Fontana di Trevi', cat: '广场', dur: '30 分钟',
      desc: '罗马最大的巴洛克喷泉，26 米高，整面墙就是一座舞台，海神驾着贝壳战车从岩石间涌出。池水来自两千年前的古罗马引水道 Acqua Vergine，至今仍在流动。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '地铁 A 线 Barberini 站步行 6 分钟', tip: '背对喷泉、右手从左肩越过投一枚硬币，据说会再回罗马。夜间打灯后比白天更美。'
    },
    {
      id: 'colosseo', tier: 'must', key: 'colosseo', city: 'rome', base: 'rome',
      name: '古罗马斗兽场', it: 'Colosseo', cat: '古迹', dur: '1.5–2 小时',
      desc: '公元 80 年落成的弗拉维圆形剧场，可容纳五万观众，是古罗马工程与暴力的双重纪念碑。地下层（Hypogeum）是角斗士与猛兽候场的迷宫，需要单独票种才能下去。',
      hours: '08:30 起开放，冬季约 16:30 闭馆，夏季至 19:15（闭馆前 1 小时停止入场）；1/1、12/25 闭馆', price: '24 小时联票 €18（含古罗马广场 + 帕拉蒂尼山）；Full Experience 含地下层约 €24；欧盟 18–25 岁 €2',
      booking: { level: 'required', label: '必须预约 15 分钟时段', url: 'https://ticketing.colosseo.it/', note: '实名时段票；联票 24 小时内有效，没逛完可以次日再进广场。旺季当日票基本没有，别在门口买「免排队 + 导游」的加价转售。' },
      access: '地铁 B 线 Colosseo 站出站即到；从 Termini 步行约 25 分钟', tip: '选最早一批（8:30）人最少；地下层票种要更早抢。'
    },
    {
      id: 'foro', tier: 'must', key: 'foro', city: 'rome', base: 'rome',
      name: '古罗马广场', it: 'Foro Romano', cat: '古迹', dur: '1.5 小时',
      desc: '共和与帝国时期的政治心脏。凯撒在此火化，元老院在此开会，马克·安东尼在此发表那篇著名的演说。如今是一条从塞维鲁凯旋门走到提图斯凯旋门的石板大道，两侧残柱与神庙基座连成一片。',
      hours: '与斗兽场同一联票，08:30 起开放', price: '含在斗兽场联票内',
      booking: { level: 'required', label: '随联票预约', url: 'https://ticketing.colosseo.it/', note: '与斗兽场同一入口安检，从 Via dei Fori Imperiali 一侧进入。' },
      access: '与斗兽场相邻，从斗兽场出口步行 5 分钟', tip: '下午光线更好，遗址面向西侧；建议先斗兽场后遗址，顺序反过来排队更长。'
    },
    {
      id: 'palatino', key: 'palatino', city: 'rome', base: 'rome',
      name: '帕拉蒂尼山', it: 'Palatino', cat: '古迹', dur: '1 小时',
      desc: '罗马七座山丘中最核心的一座，传说罗慕路斯在此建城。帝国时期整座山是皇宫区，图密善的宫殿遗迹至今仍能看到层层叠起的拱券与花园平台。从山顶俯视古罗马广场的视角是全遗址最好的。',
      hours: '同联票，随遗址区开放', price: '含在斗兽场联票内',
      booking: { level: 'required', label: '随联票预约', url: 'https://ticketing.colosseo.it/', note: '无独立入口，需从古罗马广场或斗兽场进入。' },
      access: '从古罗马广场内部步行上山（有坡道与台阶）', tip: '这里比广场安静得多，适合中途休息；山上风大，冬天要加一件外套。'
    },
    {
      id: 'altare_patria', key: 'altare_patria', city: 'rome', base: 'rome',
      name: '威尼斯广场 · 祖国祭坛', it: 'Piazza Venezia / Altare della Patria', cat: '广场', dur: '40 分钟',
      desc: '为纪念意大利统一而建的巨型白色大理石纪念堂，罗马人戏称它「打字机」。拾级而上可俯瞰帝国大道一路通向斗兽场。它的位置正好卡在古罗马区与老城之间，是天然的路线中转站。',
      hours: '广场全天；登屋顶观景电梯 09:30–18:30', price: '广场免费，观景电梯约 €12',
      booking: { level: 'none', note: '现场购票，通常不排队。' },
      access: '地铁 B 线 Colosseo 步行 12 分钟；从万神殿步行 10 分钟', tip: '屋顶电梯人少、视野比斗兽场还开阔，是常被忽略的机位。'
    },
    {
      id: 'pantheon', tier: 'must', key: 'pantheon', city: 'rome', base: 'rome',
      name: '万神殿', it: 'Pantheon', cat: '教堂', dur: '45 分钟',
      desc: '哈德良在公元 118–125 年重建的异教神庙，穹顶直径 43.3 米，与室内高度完全相等——一个完美的球体刚好塞进这间屋子。顶部 9 米宽的圆孔是唯一的采光口，雨天雨丝会直接落在大理石地面上。',
      hours: '09:00–19:00（周日 09:00–18:00），弥撒时段不对游客开放', price: '€5',
      booking: { level: 'recommended', label: '建议在线购票', url: 'https://www.pantheonroma.com/', note: '现场排队约 10–30 分钟，线上票可直接进。' },
      access: '地铁 A 线 Barberini 步行 10 分钟；纳沃纳广场步行 5 分钟', tip: '拉斐尔葬在这里。雨天进去看雨丝穿过圆孔落下，是罗马最独特的体验之一。'
    },
    {
      id: 'navona', key: 'navona', city: 'rome', base: 'rome',
      name: '纳沃纳广场', it: 'Piazza Navona', cat: '广场', dur: '45 分钟',
      desc: '建在一世纪图密善竞技场的看台上，所以广场的平面至今是那条跑道的形状。中央是贝尔尼尼的四河喷泉，四座巨人分别代表多瑙河、尼罗河、恒河与拉普拉塔河，身上缠绕的细节值得绕一圈慢慢看。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '万神殿步行 5 分钟；地铁 A 线 Spagna 步行 15 分钟', tip: '冬季圣诞前后有集市；广场上的露天座位价格偏高，站在喷泉边看就行。'
    },
    {
      id: 'campo_fiori', key: 'campo_fiori', city: 'rome', base: 'rome',
      name: '鲜花广场', it: 'Campo de\' Fiori', cat: '街区', dur: '30 分钟',
      desc: '白天是果蔬与香料市集，晚上变成酒吧区。广场中央立着哲学家布鲁诺的雕像——1600 年他就在这里被烧死。这是罗马最有生活气的一块空地，摊贩、餐馆和清晨的菜摊全挤在一起。',
      hours: '市集周一至周六 07:00–14:00 左右', price: '免费',
      booking: { level: 'none' },
      access: '纳沃纳广场步行 3 分钟', tip: '上午来买水果和松露酱；附近 Roscioli 是本地人排队买火腿和芝士的老店。'
    },
    {
      id: 'bocca_verita', tier: 'optional', key: 'bocca_verita', city: 'rome', base: 'rome',
      coord: [41.88802, 12.48153],
      name: '真理之口', it: 'Bocca della Verità', cat: '古迹', dur: '40 分钟',
      desc: '科斯梅丁圣母堂门廊上的一块圆形大理石浮雕，雕的可能是海神。中世纪传说：把手伸进嘴里，说谎的人会被咬断。1953 年《罗马假日》里格里高利·派克在这里吓奥黛丽·赫本，从此成为朝圣地。',
      hours: '教堂 09:30–17:50（冬季至 16:50），排队在门外', price: '免费（教堂建议投 €0.50）',
      booking: { level: 'none', note: '不预约，现场排队 20–40 分钟。' },
      access: '地铁 B 线 Circo Massimo 步行 8 分钟；威尼斯广场步行 15 分钟', tip: '排队半小时、拍照一分钟，是典型的"来都来了"景点。旁边就是屠牛广场和台伯河，可以顺路走到鲜花广场。'
    },
    {
      id: 'vatican_museums', tier: 'must', key: 'vatican_museums', city: 'rome', base: 'rome',
      name: '梵蒂冈博物馆', it: 'Musei Vaticani', cat: '博物馆', dur: '3.5–4 小时',
      desc: '54 个展厅、七公里展线，从古希腊雕塑（拉奥孔群像）一路走到拉斐尔房间，终点是西斯廷礼拜堂——米开朗基罗在穹顶上画的《创世纪》和祭坛墙上的《最后的审判》。',
      hours: '周一至周六 08:00–20:00（最后入场 18:00）；周日闭馆，每月最后一个周日 09:00–14:00 免费开放（12:30 停止入场）', price: '€20 + €5 预订费（官网合计 €25）；优惠票 €10 + €5',
      booking: { level: 'required', label: '必须预约时段', url: 'https://tickets.museivaticani.va/home', note: '唯一官方购票站是 tickets.museivaticani.va，注意别进同形域名。票不可退改；免费周日人最多且 14:00 清场。' },
      access: '地铁 A 线 Cipro 站步行 8 分钟（Ottaviano 站 10 分钟）；入口在 Viale Vaticano 城墙边', tip: '从正门进后先直奔西斯廷（早上人少），再倒着往回看；肩膝必须遮盖。'
    },
    {
      id: 'sanpietro', tier: 'must', key: 'sanpietro', city: 'rome', base: 'rome',
      name: '圣彼得大教堂', it: 'Basilica di San Pietro', cat: '教堂', dur: '1.5 小时',
      desc: '基督教的中心教堂，布拉曼特、米开朗基罗、贝尔尼尼接力建了一百二十年。米开朗基罗设计的穹顶内径 42 米，贝尔尼尼的青铜华盖悬在使徒彼得墓穴正上方。进门右手是《哀悼基督》，唯一一件米开朗基罗署名的作品。',
      hours: '07:00–18:30（冬季至 18:00）；登穹顶 08:00–17:00', price: '教堂免费；登顶电梯 €10，步行 551 级 €8',
      booking: { level: 'recommended', label: '免费票可预约', url: 'https://www.basilicasanpietro.va/', note: '不预约也能进，但安检队伍可能 45–60 分钟。' },
      access: '圣彼得广场东侧入口；地铁 A 线 Ottaviano 步行 12 分钟', tip: '上午逆光、下午顺光。登顶要在爬完 320 级旋转楼梯后再爬 231 级窄梯，恐高者慎入。'
    },
    {
      id: 'borghese', tier: 'must', key: 'borghese', city: 'rome', base: 'rome',
      name: '博尔盖塞美术馆', it: 'Galleria Borghese', cat: '博物馆', dur: '2 小时',
      desc: '一座私人收藏的密度奇迹：贝尔尼尼的《阿波罗与达芙妮》把少女变成月桂树的瞬间刻在石头上，卡拉瓦乔的《大卫与歌利亚》就在隔壁。馆内只放 360 人，任何时刻都有足够的空间站在作品前面。',
      hours: '周二至周日 09:00–19:00（末场约 17:00），周一、1/1、12/25 闭馆；两小时一场，场次固定', price: '€15 + €2 预订费',
      booking: { level: 'required', label: '必须预约场次', url: 'https://galleriaborghese.cultura.gov.it/', note: '官网已从 beniculturali.it 迁到 cultura.gov.it，旧链接打不开。场次制、每场限流约 360 人，旺季提前 2–3 周；迟到不得入场。' },
      access: '地铁 A 线 Spagna 步行 15 分钟，穿过博尔盖塞公园；公交 910 路', tip: '一定要订 09:00 第一场，出馆正好在公园散步。相机背包需寄存。'
    },
    {
      id: 'trastevere', key: 'trastevere', city: 'rome', base: 'rome',
      name: '特拉斯提弗列老城', it: 'Trastevere', cat: '街区', dur: '2 小时',
      desc: '台伯河西岸的老城区，巷子窄到两个人错身都要侧一下。这里的圣母教堂后殿有一整面十二世纪的金色马赛克。傍晚开始，石板上摆满小桌，是本地上班族吃晚饭的地方。',
      hours: '全天；教堂 07:30–20:00', price: '免费',
      booking: { level: 'none' },
      access: '从鲜花广场过 Ponte Sisto 桥步行 10 分钟；有轨电车 8 路', tip: '吃晚饭建议 19:30 前到，之后热门店要排 40 分钟。回程过桥时看圣彼得穹顶的夜景。'
    },

    /* ===== 佛罗伦萨 ===== */
    {
      id: 'duomo_fi', tier: 'must', key: 'duomo_fi', city: 'florence', base: 'florence',
      name: '圣母百花大教堂', it: 'Cattedrale di S. Maria del Fiore', cat: '教堂', dur: '1 小时（不含登穹顶）',
      desc: '布鲁内莱斯基在没有脚手架的年代把 45 米宽的穹顶架上了天，1436 年完工时是欧洲最大的穹顶，也开启文艺复兴建筑。外墙的绿白粉三色大理石拼贴，是佛罗伦萨的城市配色本身。',
      hours: '教堂 10:15–15:45（周日及宗教节日下午开放）；穹顶需预约时段 08:15–19:00', price: '教堂免费但需领免费时段票；Brunelleschi Pass €30（穹顶 + 钟楼 + 洗礼堂 + 地宫 + 博物馆，7 天有效）；Giotto Pass €20',
      booking: { level: 'required', label: '登穹顶必须预约', url: 'https://duomo.firenze.it/', note: '穹顶 463 级台阶、无电梯、通道单行；联票激活后 7 天内有效，别浪费第二天。' },
      access: '从 S.M.N. 车站步行 8 分钟；老城内全程步行', tip: '教堂本体免费但排队绕广场一圈，早上 8 点前最短。登穹顶选日落前最后一场，能看到整座城变金色。'
    },
    {
      id: 'campanile', tier: 'optional', key: 'campanile', city: 'florence', base: 'florence',
      name: '乔托钟楼', it: 'Campanile di Giotto', cat: '教堂', dur: '40 分钟',
      desc: '82 米高的方形钟楼，乔托设计、建了二十多年。414 级台阶登顶，中途有几层平台可以停下喘气。从顶上看到的是穹顶的侧面轮廓——这是拍穹顶最好的位置。',
      hours: '08:15–18:45（随联票）', price: '含在 €30 联票内',
      booking: { level: 'recommended', label: '随联票预约', url: 'https://duomo.firenze.it/', note: '钟楼也要预约时段，与穹顶分开选。' },
      access: '大教堂正面右侧入口', tip: '如果只能登一个，选钟楼（能看到穹顶本身）；想要「被穹顶包围」的视角才选穹顶。'
    },
    {
      id: 'battistero', key: 'battistero', city: 'florence', base: 'florence',
      name: '圣乔瓦尼洗礼堂', short: '洗礼堂', it: 'Battistero di S. Giovanni', cat: '教堂', dur: '20 分钟',
      desc: '大教堂前那座八角形罗马式建筑，但丁、美第奇家族都在这里受洗。东门的「天堂之门」被米开朗基罗这样称赞过——现在门上是复制品，真品在旁边的博物馆里，可以近距离看吉贝尔蒂花了 27 年雕的浮雕。',
      hours: '08:30–19:00（周日 08:30–14:00）', price: '含在联票内；单买 €5',
      booking: { level: 'none' },
      access: '大教堂正门对面', tip: '内部穹顶的拜占庭式金色马赛克容易被忽略，进门前抬头看。'
    },
    {
      id: 'signoria', key: 'signoria', city: 'florence', base: 'florence',
      name: '领主广场', it: 'Piazza della Signoria', cat: '广场', dur: '40 分钟',
      desc: '佛罗伦萨的政治客厅，七百年来一直如此。广场上是露天的雕塑馆：米开朗基罗《大卫》的复制品站在旧宫门口，旁边是班迪内利的《海格力斯与卡库斯》，再往前是阿曼纳蒂的海神喷泉。萨伏那洛拉就是在这里被烧死的。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '乌菲兹美术馆出口即达；从大教堂步行 5 分钟', tip: '广场边的 Gucci 咖啡（Caffè Rivoire 露台）价格高但位置无敌，站着喝咖啡便宜很多。'
    },
    {
      id: 'vecchio', key: 'vecchio', city: 'florence', base: 'florence',
      name: '旧宫（市政厅）', short: '旧宫', it: 'Palazzo Vecchio', cat: '古迹', dur: '1 小时',
      desc: '1299 年建的市政厅，94 米高的塔楼是佛罗伦萨天际线的定音鼓。内部五百人大厅曾是共和国的议事厅，瓦萨里在墙上画满了战役壁画。可以走到塔楼平台，俯瞰领主广场和穹顶。',
      hours: '09:00–19:00（周四 09:00–14:00）', price: '€12.5，登塔另加 €12.5',
      booking: { level: 'recommended', label: '建议预约', url: 'https://musefirenze.it/', note: '现场买票通常可以，登塔名额有限。' },
      access: '领主广场东侧', tip: '塔楼视角比钟楼更「城市感」，能看到穹顶和山丘同框。'
    },
    {
      id: 'dante', tier: 'optional', key: 'dante', city: 'florence', base: 'florence',
      name: '但丁故居', it: 'Casa di Dante', cat: '博物馆', dur: '30 分钟',
      desc: '但丁出生的街区（真正的故居已毁，现在是重建的博物馆）。旁边那条窄巷 Via Santa Margherita 保留着中世纪的轮廓，据说是但丁第一次遇见贝雅特丽齐的地方。',
      hours: '10:00–17:00，周一闭馆', price: '€5',
      booking: { level: 'none' },
      access: '领主广场步行 2 分钟，教堂圣玛格丽特街', tip: '适合顺路一看，不必专程；里面的展陈比较旧，价值在街区的氛围。'
    },
    {
      id: 'ponte_vecchio', key: 'ponte_vecchio', city: 'florence', base: 'florence',
      name: '老桥', it: 'Ponte Vecchio', cat: '古迹', dur: '30 分钟',
      desc: '1345 年建成的石拱桥，阿诺河上最古老的桥。桥上两排全是金匠店，从罗马时代就在这个位置摆摊。二层是瓦萨里走廊——美第奇家族从旧宫到皮蒂宫的秘密通道，不用下楼就能过河。',
      hours: '全天；店铺约 09:00–19:00', price: '免费',
      booking: { level: 'none' },
      access: '乌菲兹步行 3 分钟；从领主广场沿河步行 5 分钟', tip: '桥中央的栏杆是看日落的经典位置，但人挤人。往西走到三一桥（Ponte S. Trinità）反而更开阔。'
    },
    {
      id: 'michelangelo', key: 'michelangelo', city: 'florence', base: 'florence',
      name: '米开朗基罗广场', it: 'Piazzale Michelangelo', cat: '自然', dur: '1 小时（含往返）',
      desc: '阿诺河南岸山坡上的观景平台，是全城看日落的标准答案。整座老城——穹顶、钟楼、圣十字教堂、老桥——在一小时内从米色变成粉金色。广场中央立着一座青铜《大卫》复制品。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '从老桥步行 25 分钟（有坡）；公交 12/13 路从车站直达，约 15 分钟', tip: '日落前 40 分钟到占位置；冬天风大记得带围巾。下山走回老桥约 20 分钟。'
    },
    {
      id: 'uffizi', tier: 'must', key: 'uffizi', city: 'florence', base: 'florence',
      name: '乌菲兹美术馆', it: 'Galleria degli Uffizi', cat: '博物馆', dur: '3 小时',
      desc: '美第奇家族的办公室（Uffizi 就是「办公室」的意思），现在是文艺复兴绘画最集中的一条长廊。波提切利的《春》与《维纳斯的诞生》在同一间展厅，达芬奇的《天使报喜》、米开朗基罗唯一的架上画《圣家族》都在几步之内。',
      hours: '周二至周日 08:15–18:30（售票处 17:30 关），周一、1/1、12/25 闭馆', price: '现场 €25；提前线上实名预约 €29；每月第一个周日免费',
      booking: { level: 'required', label: '必须预约时段', url: 'https://tickets.uffizi.it/', note: '现场排队 1–2 小时是常态，务必线上订。PassePartout 5 日票 €40 含乌菲兹 + 皮蒂宫 + 波波里。' },
      access: '领主广场东侧，从乌菲兹庭院进入', tip: '从三楼开始往下看（人流少），最后在一楼书店收尾。走廊尽头的窗正对老桥，是经典机位。'
    },
    {
      id: 'accademia', tier: 'must', key: 'accademia', city: 'florence', base: 'florence',
      name: '学院美术馆（大卫像）', short: '学院美术馆', it: 'Galleria dell\'Accademia', cat: '博物馆', dur: '1.5 小时',
      desc: '米开朗基罗 29 岁时用一块被废弃的 5.2 米大理石凿出的《大卫》，原本要站在大教堂屋顶上。1504 年它被放在领主广场，1873 年搬进这里保护。通往大卫的走廊两侧摆着几件未完成的「奴隶」，更能看出他的凿法。',
      hours: '周二至周日 08:15–18:50，周一、1/1、12/25 闭馆', price: '€16（线上预约含手续费）；18 岁以下免费',
      booking: { level: 'required', label: '必须预约时段', url: 'https://www.galleriaaccademiafirenze.it/', note: '旺季当天票几乎为零，提前一周订。' },
      access: '从大教堂步行 5 分钟，Via Ricasoli 街', tip: '选 08:15 第一场，能空场站在大卫脚下；馆不大，1.5 小时足够。'
    },
    {
      id: 'pitti', key: 'pitti', city: 'florence', base: 'florence',
      name: '皮蒂宫', it: 'Palazzo Pitti', cat: '古迹', dur: '2 小时',
      desc: '美第奇家族在阿诺河南岸的宫殿，外表是粗石砌成的文艺复兴「霸气」立面。内部帕拉蒂尼画廊挂着拉斐尔、提香、鲁本斯的一整排画，还有一间挂满 11 幅拉斐尔的房间。',
      hours: '周二至周日 08:15–18:30，周一闭馆', price: '€16（画廊）；含波波里花园联票 €22',
      booking: { level: 'recommended', label: '建议预约', url: 'https://www.uffizi.it/', note: '与乌菲兹同一系统，联票更划算。' },
      access: '老桥过河后步行 5 分钟', tip: '如果当天已经看了乌菲兹，皮蒂宫可以只逛花园，省体力。'
    },
    {
      id: 'boboli', tier: 'optional', key: 'boboli', city: 'florence', base: 'florence',
      name: '波波里花园', it: 'Giardino di Boboli', cat: '自然', dur: '1 小时',
      desc: '皮蒂宫背后的意式台地花园，从山脚一路铺到山上。柏树夹道、雕塑、喷泉和一整条通往米开朗基罗广场方向的林荫道。冬天树叶落尽，园子显得空旷，能听到整个城市的低鸣。',
      hours: '08:15 起开放，冬季约 16:30 闭园', price: '€10，含皮蒂宫联票 €22',
      booking: { level: 'recommended', label: '随皮蒂宫购票', url: 'https://www.uffizi.it/', note: '通常不排队。' },
      access: '皮蒂宫后门进入', tip: '从山上出口出园正好接去米开朗基罗广场的路。'
    },
    {
      id: 'mercato_centrale', key: 'mercato_centrale', city: 'florence', base: 'florence',
      name: '中央市场', it: 'Mercato Centrale', cat: '美食', dur: '1 小时',
      desc: '一楼是传统市场：牛肚包摊（Nerbone 从 1872 年卖到现在）、芝士、生火腿、松露。二楼是改造过的美食城，有披萨、意面、精酿，价格公道，适合不用想太多就坐下吃。',
      hours: '一楼 07:00–14:00（周六至 15:00）；二楼 10:00–24:00', price: '人均 €10–20',
      booking: { level: 'none' },
      access: 'S.M.N. 车站旁 2 分钟，整个市场都在车站东侧', tip: '牛肚包（panino con lampredotto）是佛罗伦萨的市井味，怕内脏可以点普通的 porchetta。'
    },
    {
      id: 'santa_croce', tier: 'optional', key: 'santa_croce', city: 'florence', base: 'florence',
      name: '圣十字教堂', it: 'Basilica di Santa Croce', cat: '教堂', dur: '45 分钟',
      desc: '佛罗伦萨的「先贤祠」：米开朗基罗、伽利略、马基雅维利、罗西尼都葬在这里。教堂立面是十九世纪的新哥特式贴面，内部反而朴素，布鲁内莱斯基设计的帕齐礼拜堂是文艺复兴建筑的教科书。',
      hours: '09:30–17:30（周日 12:30 起）', price: '€8',
      booking: { level: 'none' },
      access: '领主广场步行 8 分钟', tip: '门口广场晚上是本地人聚会的地方，很安全。'
    },

    /* ===== 比萨 ===== */
    {
      id: 'miracoli', key: 'miracoli', city: 'pisa', base: 'florence',
      name: '奇迹广场', it: 'Piazza dei Miracoli', cat: '广场', dur: '1.5 小时',
      desc: '一整片白色大理石建筑群铺在绿草地上：斜塔、大教堂、洗礼堂、比萨墓园，四件一组。1987 年整体列入世界遗产。草坪中央的角度能一次把四座建筑都拍进去。',
      hours: '全天开放；各建筑单独售票', price: '广场免费',
      booking: { level: 'none' },
      access: '从比萨中央车站步行 20 分钟，或站前 LAM Rossa 公交 10 分钟', tip: '草坪不许进去坐（会有管理员吹哨），拍照在石板路上取景即可。'
    },
    {
      id: 'torre_pisa', key: 'torre_pisa', city: 'pisa', base: 'florence',
      name: '比萨斜塔', it: 'Torre di Pisa', cat: '古迹', dur: '1 小时（含登塔）',
      desc: '1173 年开工，建到三层就开始歪，工程断断续续近两百年。1990 年代用 600 吨铅块和地下抽土把倾斜从 5.5 度拉回到约 3.97 度，现在每年还会回正一点点。登塔是 296 级台阶，塔内是中空的圆筒。',
      hours: '登塔 09:00–18:00（冬季至 17:00）；每批 20 人、30 分钟', price: '登塔 €20；大教堂 €5',
      booking: { level: 'required', label: '登塔必须预约', url: 'https://www.opapisa.it/', note: '现场名额常售罄，尤其下午。8 岁以下不得登塔。' },
      access: '奇迹广场内，塔基入口在北侧', tip: '登塔全程不能带大包（免费寄存）。不登塔也完全值得，广场上转一圈就够。'
    },
    {
      id: 'duomo_pisa', key: 'duomo_pisa', city: 'pisa', base: 'florence',
      name: '比萨大教堂', it: 'Duomo di Pisa', cat: '教堂', dur: '30 分钟',
      desc: '十一世纪的罗曼式大教堂，比斜塔更早、也更重要。内部的黑白大理石条纹和伽利略传说中「发现钟摆定律」的青铜吊灯都在这里。后殿的镶嵌画《基督全能者》是 1300 年代的原作。',
      hours: '10:00–18:00（周日 13:00 起）', price: '€5（登塔联票另计）',
      booking: { level: 'none', note: '需在售票处领免费时段票，实际常有余量。' },
      access: '奇迹广场中央', tip: '进教堂要过安检、穿肩膝遮盖的衣服。'
    },

    /* ===== 锡耶纳 ===== */
    {
      id: 'siena_campo', key: 'siena_campo', city: 'siena', base: 'florence',
      name: '田野广场', it: 'Piazza del Campo', cat: '广场', dur: '1 小时',
      desc: '欧洲最美的中世纪广场之一，扇形铺开、向市政厅倾斜，地面用红砖划出九个扇区。每年 7 月 2 日和 8 月 16 日在这里跑 Palio 赛马，全城 17 个街区派马参赛，90 秒定胜负。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '从锡耶纳车站乘扶梯上山进城，步行 15 分钟到广场', tip: '坐在扇形最低点拍照最好；周边的 Osteria 中午有 €15 左右的套餐。'
    },
    {
      id: 'siena_duomo', key: 'siena_duomo', city: 'siena', base: 'florence',
      name: '锡耶纳大教堂', it: 'Duomo di Siena', cat: '教堂', dur: '1 小时',
      desc: '黑白大理石条纹从地面一路爬到穹顶，中世纪锡耶纳人用这种方式表达对圣母的忠诚。地板上的 56 幅大理石镶嵌画（《 Hermes 智慧山》等）一年只揭开几周，能不能看到要看运气。',
      hours: '10:30–19:00（冬季至 17:30），周日 13:30 起', price: '€9（含图书馆）；登顶另 €10',
      booking: { level: 'recommended', label: '建议预约', url: 'https://operaduomo.siena.it/', note: '旺季排队长，线上预约可跳队。' },
      access: '田野广场步行 5 分钟（上坡）', tip: '旁边的 Piccolomini 图书馆有一整面 Pinturicchio 壁画，含在票内，别错过。'
    },

    /* ===== 卢卡 ===== */
    {
      id: 'lucca_mura', key: 'lucca_mura', city: 'lucca', base: 'florence',
      name: '卢卡城墙', it: 'Mura di Lucca', cat: '自然', dur: '1.5 小时',
      desc: '四公里长的文艺复兴城墙，顶上种满树，被改成了环城公园。租一辆自行车在城墙上骑一圈，四十分钟就能绕完整个小城，是意大利最舒服的城市体验之一。',
      hours: '全天；租车行约 09:00–19:00', price: '免费；自行车约 €5/小时',
      booking: { level: 'none' },
      access: '从卢卡车站步行 10 分钟进城，任一门都可上墙', tip: '冬天风大注意保暖；城墙上看得到远处的山和教堂塔楼。'
    },
    {
      id: 'lucca_anfiteatro', key: 'lucca_anfiteatro', city: 'lucca', base: 'florence',
      name: '圆形竞技场广场', short: '竞技场广场', it: 'Piazza dell\'Anfiteatro', cat: '广场', dur: '40 分钟',
      desc: '建在古罗马圆形剧场的地基上，所以广场是一个闭合的椭圆，四个开口对应当年的四个门。周围一圈房子全是餐厅和咖啡馆，坐在当中说话会有轻微的回声。',
      hours: '全天', price: '免费',
      booking: { level: 'none' },
      access: '城墙内步行 5 分钟', tip: '午餐在这里吃一顿 slow lunch，是卢卡最正确的打开方式。'
    },

    /* ===== 威尼斯 ===== */
    {
      id: 'san_marco', tier: 'must', key: 'san_marco', city: 'venice', base: 'venice',
      name: '圣马可广场', it: 'Piazza San Marco', cat: '广场', dur: '45 分钟',
      desc: '拿破仑称之为「欧洲最美的客厅」。三面是行政官邸大楼的连拱廊，一面是圣马可大教堂，尽头是潟湖和圣乔治岛。涨潮（acqua alta）时广场会被水淹，冬天尤其常见，木栈道会架起来。',
      hours: '全天开放', price: '免费',
      booking: { level: 'none' },
      access: '水上巴士 1/2 线 S. Marco 站；从车站步行 35 分钟穿过小巷', tip: '清晨 7 点的广场几乎没有游客，只有清扫的人和鸽子。冬天潮水期查潮汐预报。'
    },
    {
      id: 'basilica_sm', tier: 'must', key: 'basilica_sm', city: 'venice', base: 'venice',
      name: '圣马可大教堂', it: 'Basilica di San Marco', cat: '教堂', dur: '1 小时',
      desc: '拜占庭式的金色教堂，八千平方米的马赛克穹顶在昏暗中发光。里面藏着从君士坦丁堡抢来的四匹青铜马（门廊上是复制品，真品在室内博物馆）。黄金祭坛屏（Pala d\'Oro）镶了两千颗宝石。',
      hours: '周一至周六 09:30–17:15，周日 14:00–17:15（弥撒时段游客参观受限）', price: '€10 全票，10 岁以下免费；黄金祭坛与登顶另计',
      booking: { level: 'required', label: '必须线上实名购票', url: 'https://www.basilicasanmarco.it/', note: '2025 年 7 月起取消现场售票，改为全线上实名时段票，票价从 €3 涨到 €10。没订到就进不去，别白排广场的队。' },
      access: '圣马可广场东侧', tip: '背包和大包不能入内，需在附近免费寄存；露肩短裤会被拦。'
    },
    {
      id: 'sospiri', key: 'sospiri', city: 'venice', base: 'venice',
      name: '叹息桥', it: 'Ponte dei Sospiri', cat: '古迹', dur: '15 分钟',
      desc: '1600 年建的封闭石桥，连接总督宫审讯室和新监狱。名字来自囚犯过桥时透过小窗最后看一眼潟湖的那声叹息。桥只在外面看得到，内部要参加总督宫的「Secret Itineraries」导览。',
      hours: '全天（外观）', price: '免费（外观）',
      booking: { level: 'none' },
      access: '圣马可广场旁，总督宫与监狱之间的小桥', tip: '最好的拍摄点在东侧 Ponte della Paglia 桥上，早上顺光。'
    },
    {
      id: 'rialto', key: 'rialto', city: 'venice', base: 'venice',
      name: '里亚托桥', it: 'Ponte di Rialto', cat: '古迹', dur: '30 分钟',
      desc: '大运河上最古老的桥，1591 年用一万两千根木桩打进河床才立住。桥上是两排商铺，桥顶能看整条大运河的 S 形转弯。旁边的里亚托市场早上有鱼市和果蔬摊。',
      hours: '全天；市场周一至周六 07:30–12:00', price: '免费',
      booking: { level: 'none' },
      access: '水上巴士 1 线 Rialto 站；圣马可步行 8 分钟', tip: '清晨的鱼市是威尼斯最真实的一面；桥顶日落时人非常多。'
    },
    {
      id: 'murano', tier: 'optional', key: 'murano', city: 'venice', base: 'venice',
      name: '穆拉诺（玻璃岛）', it: 'Murano', cat: '街区', dur: '2.5 小时',
      desc: '1291 年威尼斯把全城玻璃窑都迁到这座岛上，怕火灾烧了木造主城。至今仍在吹玻璃，沿运河能看到作坊里的炉火。玻璃博物馆（Museo del Vetro）收藏了从古罗马到当代的玻璃工艺。',
      hours: '岛屿全天；博物馆 10:00–18:00，周三闭馆', price: '岛屿免费；博物馆 €12',
      booking: { level: 'none', note: '部分作坊演示需现场预约，一般免费。' },
      access: '水上巴士 4.1/4.2 线（F.te Nove 出发 10 分钟）或 12 线', tip: '认准「Vetro Artistico Murano」标志的店，避免买到中国产玻璃。'
    },
    {
      id: 'burano', key: 'burano', city: 'venice', base: 'venice',
      name: '布拉诺（彩色岛）', it: 'Burano', cat: '街区', dur: '2 小时',
      desc: '渔民为了让出海回来的丈夫在雾里认出自家房子，把外墙刷成荧光色。现在刷什么颜色要报备政府。岛上还以手工蕾丝闻名，蕾丝博物馆在一栋老学校里。',
      hours: '全天；博物馆 10:00–17:00', price: '岛屿免费；博物馆 €6',
      booking: { level: 'none' },
      access: '水上巴士 12 线从 F.te Nove 出发约 40 分钟（经 Murano）', tip: '从 Murano 到 Burano 的 12 线班次少，先查好回程时间。冬天下午光线最好。'
    },
    {
      id: 'santa_margherita', key: 'santa_margherita', city: 'venice', base: 'venice',
      name: '圣玛格丽特广场', short: '圣玛格丽特', it: 'Campo Santa Margherita', cat: '街区', dur: '1 小时',
      desc: '威尼斯大学旁边的广场，学生、本地人和游客混在一起。晚上广场四周的 bacari（小酒馆）把桌子摆到石板地上，一杯 spritz 配几块 cicchetti，是最便宜的威尼斯晚餐。',
      hours: '全天；酒吧 18:00 后热闹', price: '免费',
      booking: { level: 'none' },
      access: '从里亚托桥步行 10 分钟；水上巴士 Ca\' Rezzonico 站 5 分钟', tip: '站着喝比坐下便宜一半；cicchetti 每块 €1.5–2.5，可以边走边吃。'
    },

    /* ===== 米兰 ===== */
    {
      id: 'duomo_mi', tier: 'must', key: 'duomo_mi', city: 'milan', base: 'milan',
      name: '米兰大教堂', it: 'Duomo di Milano', cat: '教堂', dur: '1.5 小时',
      desc: '建了将近六百年的哥特教堂，135 座尖塔像石头的森林，顶上立着 4 米高的金色圣母像 Madonnina。屋顶是可以走上去的，在尖塔之间穿行，大理石被六百年的人踩得发亮。',
      hours: '教堂 09:00–19:00（最后入场 18:10）；屋顶 09:00–19:00', price: '教堂 €10；屋顶步行 €16 / 电梯 €22（以官网为准）',
      booking: { level: 'recommended', label: '建议预约', url: 'https://www.duomomilano.it/', note: '安检队伍长，线上票走另一条通道。屋顶票分电梯/楼梯两种。' },
      access: '地铁 M1/M3 Duomo 站出站即到', tip: '屋顶一定要上去，冬天空气干净时能看到阿尔卑斯山。日落前一小时光线最好。'
    },
    {
      id: 'galleria', key: 'galleria', city: 'milan', base: 'milan',
      name: '埃马努埃莱二世拱廊', short: '二世拱廊', it: 'Galleria Vittorio Emanuele II', cat: '街区', dur: '30 分钟',
      desc: '1867 年落成的玻璃穹顶商业街，连接大教堂广场和斯卡拉歌剧院。地面中央的公牛马赛克被踩出了一个凹坑——米兰人说用脚跟踩着公牛转一圈会带来好运。',
      hours: '全天；店铺 10:00–19:30', price: '免费',
      booking: { level: 'none' },
      access: '大教堂广场北侧', tip: '转圈时小心钱包；拱廊二楼的 Camparino 是站着喝开胃酒的好地方。'
    },
    {
      id: 'cenacolo', tier: 'must', key: 'cenacolo', city: 'milan', base: 'milan',
      name: '《最后的晚餐》', it: 'Cenacolo Vinciano', cat: '博物馆', dur: '45 分钟',
      desc: '达芬奇 1495–1498 年画在圣母感恩堂食堂墙上的壁画，也是他实验性干壁技法失败的现场——画完二十年就开始剥落。经过五百年修复，十二使徒的表情依然清晰得可怕。每批只放 35 人，进 15 分钟。',
      hours: '周二至周日 08:15–19:00（最后入场 18:45），周一、1/1、12/25 闭馆', price: '€15；欧盟 18–25 岁 €2；18 岁以下免费',
      booking: { level: 'required', label: '极难抢，必须预约', url: 'https://cenacolovinciano.org/', note: '按季度放票：9 月放 11–1 月、12 月放 2–4 月、3 月放 5–7 月；每周三 12:00 追加下周余票。每场 15 分钟限 40 人，须提前 30 分钟到，迟到作废。' },
      access: '地铁 M1/M2 Cadorna 站步行 8 分钟；M2 S. Ambrogio 站 5 分钟', tip: '提前 20 分钟到，需换票、过安检、存包；室内不能拍照。'
    },
    {
      id: 'brera', key: 'brera', city: 'milan', base: 'milan',
      name: '布雷拉美术馆', it: 'Pinacoteca di Brera', cat: '博物馆', dur: '2 小时',
      desc: '米兰最重要的绘画收藏，威尼斯画派和伦巴第画派的主场。拉斐尔的《圣母的婚礼》是镇馆之作，卡拉瓦乔的《以马忤斯的晚餐》、曼特尼亚的《哀悼基督》都在同一层。美术馆所在的街区本身是米兰最有味道的文艺区。',
      hours: '周二至周日 08:30–19:15，周一闭馆', price: '€15',
      booking: { level: 'recommended', label: '建议预约', url: 'https://pinacotecabrera.org/', note: '现场通常不排长队，但旺季建议线上。' },
      access: '地铁 M2 Lanza 站步行 5 分钟；M3 Montenapoleone 站 7 分钟', tip: '周边 Brera 街区的小酒馆晚上很热闹，看完展正好吃饭。'
    },
    {
      id: 'sforza', key: 'sforza', city: 'milan', base: 'milan',
      name: '斯福尔扎城堡', it: 'Castello Sforzesco', cat: '古迹', dur: '1.5 小时',
      desc: '十五世纪米兰公爵的城堡，达芬奇曾在这里为斯福尔扎家族工作。现在里面是几座市立博物馆，最值得看的是米开朗基罗临终前未完成的《隆达尼尼圣殇》。庭院的红砖塔楼和护城河都是免费的。',
      hours: '城堡庭院 07:00–19:30；博物馆 10:00–17:30，周一闭馆', price: '庭院免费；博物馆 €5',
      booking: { level: 'none' },
      access: '地铁 M1 Cairoli 站；从大教堂步行 12 分钟', tip: '穿过城堡就是森皮奥内公园，出来正好去和平门（Arco della Pace）。'
    },
    {
      id: 'sempione', key: 'sempione', city: 'milan', base: 'milan',
      name: '森皮奥内公园', it: 'Parco Sempione', cat: '自然', dur: '45 分钟',
      desc: '米兰的中央公园，城堡背后一大片绿地，尽头是拿破仑时期建的和平门。旁边有 Branca 塔（可以登顶看城市）。本地人在这里跑步、遛狗、躺着晒太阳。',
      hours: '06:30–23:00', price: '免费',
      booking: { level: 'none' },
      access: '斯福尔扎城堡后门直接进入', tip: '公园里的小咖啡亭便宜；Branca 塔 €6 登顶，视角比大教堂屋顶更「城市」。'
    },
    {
      id: 'navigli', key: 'navigli', city: 'milan', base: 'milan',
      name: '纳维利运河区', it: 'Navigli', cat: '街区', dur: '2 小时',
      desc: '达芬奇参与设计的水闸系统留下的两条运河，现在是米兰的夜生活中心。傍晚六点开始，沿岸酒吧摆出 aperitivo 自助——点一杯酒，小食随便吃。运河边停着船屋和旧货市场。',
      hours: '全天；aperitivo 18:00–21:00', price: '开胃酒 €8–12（含小食）',
      booking: { level: 'none' },
      access: '地铁 M2 Porta Genova 站步行 5 分钟', tip: '周日下午有古着/旧书市集（Mercatone dell\'Antiquariato，每月最后一个周日）。'
    },
    {
      id: 'montenapoleone', key: 'montenapoleone', city: 'milan', base: 'milan',
      name: '蒙特拿破仑大街', it: 'Via Monte Napoleone', cat: '购物', dur: '1.5 小时',
      desc: '「黄金四边形」的主街，全球租金最贵的商业街之一。整条街都是旗舰店：Prada、Armani、Bottega Veneta、Loro Piana。街角的 Pasticceria Cova 是米兰老派下午茶。',
      hours: '店铺 10:00–19:30（周日部分营业）', price: '—',
      booking: { level: 'none' },
      access: '地铁 M3 Montenapoleone 站出站即到', tip: '意大利退税（Tax Free）单笔满 €154.94 可办，记得带护照，店里直接开单。'
    },
    {
      id: 'spiga', key: 'spiga', city: 'milan', base: 'milan',
      name: '斯皮加大街', it: 'Via della Spiga', cat: '购物', dur: '45 分钟',
      desc: '黄金四边形的另一条主街，比蒙特拿破仑更安静，弯弯曲曲的步行街，两侧是高级珠宝、独立设计师店和几间老式手工作坊。适合不想挤人群的逛法。',
      hours: '店铺 10:00–19:30', price: '—',
      booking: { level: 'none' },
      access: '地铁 M3 Montenapoleone 站 3 分钟', tip: '街中间有几家不打折也值得看的手工皮具店。'
    },
    {
      id: 'rinascente', key: 'rinascente', city: 'milan', base: 'milan',
      name: '文艺复兴百货', it: 'La Rinascente', cat: '购物', dur: '1 小时',
      desc: '米兰的老牌百货，就在大教堂广场对面。负一层是设计家居，顶层有餐厅和屋顶露台，正对大教堂的尖塔——不买东西也值得上去看一眼。',
      hours: '09:30–21:00（周日 10:00–20:00）', price: '—',
      booking: { level: 'none' },
      access: '大教堂广场东侧，地铁 Duomo 站', tip: '退税柜台在顶层，买完直接办；屋顶餐厅的咖啡比广场上的便宜。'
    },

    /* ===== 科莫 ===== */
    {
      id: 'como_duomo', tier: 'optional', key: 'como_duomo', city: 'como', base: 'milan',
      name: '科莫大教堂', it: 'Duomo di Como', cat: '教堂', dur: '30 分钟',
      desc: '科莫湖畔的哥特—文艺复兴过渡期大教堂，立面上同时有哥特尖券和文艺复兴的圆拱，像一部建筑断代史。内部挂着一组十六世纪的挂毯，讲的是《圣母生平》。',
      hours: '07:30–19:00', price: '免费',
      booking: { level: 'none' },
      access: '从科莫 S. Giovanni 站步行 12 分钟到湖边即达', tip: '教堂前的广场是看湖和缆车山的好位置。'
    },
    {
      id: 'funicolare', key: 'funicolare', city: 'como', base: 'milan',
      name: '科莫—布鲁纳特缆车', it: 'Funicolare Como–Brunate', cat: '交通', dur: '1.5 小时',
      desc: '1894 年通车的齿轨缆车，七分钟从湖边爬到海拔 500 米的布鲁纳特村。车厢是斜着建的，窗外整片湖面会一寸寸展开。山顶的观景台能看到阿尔卑斯山南麓。',
      hours: '06:00–24:00，全程 7 分钟；冬季班次约 15–30 分钟一班', price: '单程约 €3 / 往返约 €6（现场或 ATM App 购票）',
      booking: { level: 'none', note: '现场买票，节假日排队 20 分钟。' },
      access: '科莫湖滨 Piazza de Gasperi 缆车站，从大教堂步行 5 分钟', tip: '冬天山顶常有雾或雪，出发前看官网摄像头；上山后步行 10 分钟到 Faro Voltiano 灯塔视角最好。'
    },
    {
      id: 'brunate', key: 'brunate', city: 'como', base: 'milan',
      name: '布鲁纳特观景台', it: 'Brunate', cat: '自然', dur: '1 小时',
      desc: '缆车终点的小村子，海拔 715 米，从十九世纪起就是米兰人的避暑地。沿村道再走十五分钟到 Volta 灯塔，整条科莫湖的 Y 形轮廓、对岸的别墅和远处的雪山会一起出现。',
      hours: '全天开放', price: '免费（含在缆车行程内）',
      booking: { level: 'none' },
      access: '缆车终点站出站即村中心', tip: '穿防滑鞋，冬天的石板路会结冰；山顶温度比湖边低 5–8 度。'
    }
  ];

  /* ---------------- 餐厅 ---------------- */
  const food = [
    { id: 'f_armando', key: 'pantheon', city: 'rome', name: 'Armando al Pantheon', note: '万神殿旁的家庭餐厅，做正统罗马菜（cacio e pepe、carciofi）。必须电话或官网订位，午市比晚市好订。', price: '€€' },
    { id: 'f_roscioli', key: 'campo_fiori', city: 'rome', name: 'Roscioli', note: '熟食店 + 餐厅，火腿芝士柜台可以现买现吃。菜单有英文，服务员习惯游客。', price: '€€' },
    { id: 'f_daenzo', key: 'trastevere', city: 'rome', name: 'Da Enzo al 29', note: 'Trastevere 最火的罗马菜小馆，不接受订位，18:30 前去排队约 20 分钟。', price: '€€' },
    { id: 'f_bonci', key: 'vatican_museums', city: 'rome', name: 'Pizzarium Bonci', note: '梵蒂冈博物馆后门的切片披萨，按重量称，指一下就能点，最省沟通。', price: '€' },
    { id: 'f_giolitti', key: 'trevi', city: 'rome', name: 'Giolitti', note: '1900 年开业的冰淇淋店，先付钱拿票再选口味，队伍走得快。', price: '€' },
    { id: 'f_santeustachio', key: 'pantheon', city: 'rome', name: 'Sant\'Eustachio Il Caffè', note: '1938 年的咖啡吧，站着喝一杯 gran caffè 约 €1.5。', price: '€' },
    { id: 'f_antico', key: 'duomo_fi', city: 'florence', name: 'All\'Antico Vinaio', note: '佛罗伦萨最出名的意式三明治（schiacciata），排队但翻台快，指着菜单点即可。', price: '€' },
    { id: 'f_nerbone', key: 'mercato_centrale', city: 'florence', name: 'Nerbone', note: '中央市场一楼 1872 年的牛肚包摊，柜台点单、站着吃，5 分钟搞定。', price: '€' },
    { id: 'f_mario', key: 'mercato_centrale', city: 'florence', name: 'Trattoria Mario', note: '只做午市、拼桌、现金，菜单写在小黑板上。最地道的佛罗伦萨家常菜。', price: '€' },
    { id: 'f_santospirito', key: 'ponte_vecchio', city: 'florence', name: 'Osteria Santo Spirito', note: '过河后的广场边上，招牌是松露芝士焗饭，分量很大。', price: '€€' },
    { id: 'f_vivoli', key: 'santa_croce', city: 'florence', name: 'Vivoli', note: '1930 年的冰淇淋老店，本地人比游客多。', price: '€' },
    { id: 'f_gilli', key: 'signoria', city: 'florence', name: 'Caffè Gilli', note: '共和广场上的百年咖啡厅，有座位可以坐下来歇脚。', price: '€€' },
    { id: 'f_testiere', key: 'san_marco', city: 'venice', name: 'Osteria alle Testiere', note: '只有 9 张桌的海鲜小馆，当天菜单看鱼市。必须提前订位。', price: '€€€' },
    { id: 'f_madonna', key: 'rialto', city: 'venice', name: 'Trattoria alla Madonna', note: '1954 年开的威尼斯老店，菜单有图，服务员很习惯游客。', price: '€€' },
    { id: 'f_domori', key: 'rialto', city: 'venice', name: 'Cantina Do Mori', note: '1472 年营业至今的 bacaro，站着喝一杯 ombra + 一块 cicchetto。', price: '€' },
    { id: 'f_dalmoro', key: 'san_marco', city: 'venice', name: 'Dal Moro\'s', note: '现炒外卖意面，盒装带走坐在运河边吃，€8 左右。', price: '€' },
    { id: 'f_luini', key: 'duomo_mi', city: 'milan', name: 'Luini Panzerotti', note: '大教堂旁 1888 年的炸馅饼店，指一下柜台就能买，€3 一个。', price: '€' },
    { id: 'f_marchesi', key: 'galleria', city: 'milan', name: 'Marchesi 1824', note: '拱廊二楼的百年甜点店，坐下来喝咖啡配一块 panettone。', price: '€€' },
    { id: 'f_camparino', key: 'galleria', city: 'milan', name: 'Camparino in Galleria', note: '拱廊入口的酒吧，站着喝一杯 Negroni sbagliato 配小食。', price: '€€' },
    { id: 'f_milanese', key: 'navigli', city: 'milan', name: 'Trattoria Milanese', note: '1933 年的米兰家常菜，risotto alla milanese 和 ossobuco 是招牌。', price: '€€' },
    { id: 'f_princi', key: 'montenapoleone', city: 'milan', name: 'Princi', note: '面包店 + 简餐，柜台自选，购物间隙最省时间的一顿。', price: '€' }
  ];

  /* ---------------- 购物 / 街区区块 ---------------- */
  const areas = [
    { id: 'a_moda', city: 'milan', name: '黄金四边形', center: [45.4685, 9.1948], radius: 330, color: '#2B4E82', desc: 'Via Monte Napoleone、Via della Spiga、Via Sant\'Andrea、Via Manzoni 围出的四边形，全球奢侈品牌旗舰店最密集的街区。退税柜台多，单笔 €154.94 起可办。' },
    { id: 'a_tornabuoni', city: 'florence', name: '托纳布奥尼街', center: [43.7708, 11.2508], radius: 200, color: '#9A6B24', desc: '佛罗伦萨的奢侈品街，从老桥北端一直通到新圣母广场，两侧是文艺复兴宫殿改的旗舰店。' },
    { id: 'a_corso', city: 'rome', name: '科尔索大街', center: [41.9058, 12.4792], radius: 260, color: '#A8392B', desc: '罗马老城的主轴，从人民广场到威尼斯广场，平价品牌和本地小店混在一起，逛起来不累。' }
  ];

  /* ---------------- 城际交通 ---------------- */
  const legs = [
    {
      id: 'l_fco_termini', from: 'fco', to: 'termini', mode: 'Leonardo Express', dur: '32 分钟', km: 32, day: 1,
      path: [[41.8003, 12.2389], [41.8180, 12.3100], [41.8560, 12.4300], [41.8720, 12.4660], [41.8850, 12.4920], [41.9010, 12.5017]],
      note: '机场每 15 分钟一班，直达不换乘，€14。'
    },
    {
      id: 'l_termini_smn', from: 'termini', to: 'smn', mode: 'Frecciarossa 高铁', dur: '1 小时 35 分', km: 274, day: 6,
      path: [[41.9010, 12.5017], [41.9106, 12.5290], [42.1500, 12.4500], [42.4600, 12.3860], [42.7200, 12.1100], [43.0100, 11.9500], [43.3000, 11.8500], [43.4650, 11.8800], [43.6500, 11.5000], [43.7764, 11.2479]],
      note: 'Frecciarossa 直达，二等座早鸟 €19.9 起。Italo 也走这条线。'
    },
    {
      id: 'l_smn_pisa', from: 'smn', to: 'pisa_centrale', mode: 'Regionale 区域火车', dur: '50–60 分钟', km: 80, day: 8,
      path: [[43.7764, 11.2479], [43.7400, 11.1500], [43.7190, 10.9460], [43.6800, 10.6500], [43.7166, 10.3985]],
      note: '无需订座，车站自助机买票，上车前记得打卡（convalidare）。'
    },
    {
      id: 'l_smn_siena', from: 'smn', to: 'siena_train', mode: 'Regionale / 转巴士', dur: '1 小时 30 分–2 小时', km: 75, day: 9,
      path: [[43.7764, 11.2479], [43.7300, 11.1500], [43.7190, 10.9460], [43.6000, 11.1000], [43.4500, 11.2000], [43.3187, 11.3308]],
      note: '多为 Empoli 换乘；也可坐直达巴士（Rapida）约 1 小时 15 分。'
    },
    {
      id: 'l_smn_sl', from: 'smn', to: 'sl', mode: 'Frecciarossa 高铁', dur: '2 小时 05 分', km: 258, day: 10,
      path: [[43.7764, 11.2479], [44.0500, 11.3000], [44.2000, 11.3500], [44.5060, 11.3431], [44.7000, 11.5000], [44.8380, 11.6190], [45.0500, 11.7000], [45.3000, 11.8000], [45.4170, 11.8790], [45.4830, 12.2320], [45.4410, 12.3208]],
      note: '经博洛尼亚、帕多瓦。注意终点是 Venezia S. Lucia，不是 Mestre。'
    },
    {
      id: 'l_sl_centrale', from: 'sl', to: 'centrale', mode: 'Frecciarossa 高铁', dur: '2 小时 25 分', km: 267, day: 12,
      path: [[45.4410, 12.3208], [45.4830, 12.2320], [45.4170, 11.8790], [45.4300, 11.5000], [45.4290, 10.9820], [45.5000, 10.6000], [45.5320, 10.2130], [45.6000, 9.9000], [45.5500, 9.5000], [45.4859, 9.2043]],
      note: '经维罗纳、布雷西亚。米兰中央车站下。'
    },
    {
      id: 'l_cadorna_como', from: 'cadorna', to: 'como_lago', mode: 'Trenord 区域火车', dur: '约 1 小时', km: 47, day: 14,
      path: [[45.4684, 9.1755], [45.5030, 9.1530], [45.6080, 9.0360], [45.6950, 9.0560], [45.7700, 9.0700], [45.8141, 9.0841]],
      note: 'Cadorna 发车，直达湖滨的 Como Nord Lago 站，约每 30 分钟一班；酒店在 M1 上，比去中央车站换车省事。'
    },
    {
      id: 'l_cadorna_mxp', from: 'cadorna', to: 'mxp', mode: 'Malpensa Express', dur: '43 分钟', km: 49, day: 16,
      path: [[45.4685, 9.1750], [45.5100, 9.1400], [45.6250, 9.0350], [45.6100, 8.8500], [45.6306, 8.7281]],
      note: 'Cadorna 直达 T1，€13；从中央车站坐大巴约 50 分钟。'
    }
  ];

  /* ---------------- 市内交通线路 ---------------- */
  const transit = [
    {
      id: 't_metro_a', city: 'rome', name: '地铁 A 线（红）', color: '#C8392B', dash: false,
      path: [[41.9095, 12.4586], [41.9127, 12.4749], [41.9067, 12.4849], [41.9037, 12.4889], [41.9025, 12.4957], [41.9010, 12.5017], [41.8945, 12.5062], [41.8855, 12.5090]],
      stations: ['Ottaviano', 'Flaminio', 'Spagna', 'Barberini', 'Repubblica', 'Termini', 'Vittorio E.', 'S. Giovanni'],
      note: '罗马唯一贯穿老城的地铁，梵蒂冈 / 西班牙广场 / Termini 都在线上。'
    },
    {
      id: 't_metro_b', city: 'rome', name: '地铁 B 线（蓝）', color: '#1F5C8F', dash: false,
      path: [[41.9106, 12.5290], [41.9010, 12.5017], [41.8900, 12.4930], [41.8896, 12.4924], [41.8843, 12.4816], [41.8760, 12.4790]],
      stations: ['Tiburtina', 'Termini', 'Cavour', 'Colosseo', 'Circo Massimo', 'Piramide'],
      note: '斗兽场站出来就是斗兽场，是全程最方便的一站。'
    },
    {
      id: 't_metro_m1', city: 'milan', name: '地铁 M1（红）', color: '#D4382C', dash: false,
      path: [[45.4642, 9.1900], [45.4655, 9.1860], [45.4680, 9.1800], [45.4685, 9.1750], [45.4645, 9.1700], [45.4600, 9.1850]],
      stations: ['Duomo', 'Cordusio', 'Cairoli', 'Cadorna', 'Conciliazione', 'S. Babila'],
      note: '大教堂—斯福尔扎城堡—Cadorna（去机场）一条线。'
    },
    {
      id: 't_metro_m3', city: 'milan', name: '地铁 M3（黄）', color: '#C9A227', dash: false,
      path: [[45.4859, 9.2043], [45.4800, 9.1990], [45.4760, 9.1950], [45.4710, 9.1920], [45.4642, 9.1900]],
      stations: ['Centrale', 'Repubblica', 'Turati', 'Montenapoleone', 'Duomo'],
      note: '中央车站到米兰大教堂的直达线，也经过蒙特拿破仑购物街。'
    },
    {
      id: 't_metro_m2', city: 'milan', name: '地铁 M2（绿）', color: '#2E8B57', dash: false,
      path: [[45.4859, 9.2043], [45.4830, 9.1900], [45.4800, 9.1855], [45.4780, 9.1820], [45.4720, 9.1790], [45.4685, 9.1750]],
      stations: ['Centrale', 'Gioia', 'Garibaldi', 'Moscova', 'Lanza', 'Cadorna'],
      note: '中央车站 ↔ Cadorna 直达，去马尔彭萨机场走这条。'
    },
    {
      id: 't_vap_1', city: 'venice', name: '水上巴士 1 线（大运河）', color: '#17656F', dash: false,
      path: [[45.4380, 12.3223], [45.4387, 12.3280], [45.4390, 12.3339], [45.4375, 12.3350], [45.4355, 12.3400], [45.4330, 12.3450], [45.4290, 12.3390], [45.4320, 12.3340]],
      stations: ['Ferrovia', 'Riva de Biasio', 'S. Marcuola', 'Rialto', 'S. Silvestro', 'S. Marco'],
      note: '沿大运河每一站都停的慢船，风景最好，坐全程约 40 分钟。'
    },
    {
      id: 't_vap_12', city: 'venice', name: '水上巴士 12 线（外岛）', color: '#1D8A93', dash: true,
      path: [[45.4436, 12.3380], [45.4520, 12.3480], [45.4560, 12.3530], [45.4600, 12.3500], [45.4855, 12.4180], [45.4845, 12.4160], [45.4760, 12.4260]],
      stations: ['F.te Nove', 'Murano', 'Burano'],
      note: '去玻璃岛、彩色岛的唯一公交线，班次约 30–60 分钟一班。'
    },
    {
      id: 't_tram_t2', city: 'florence', name: 'T2 电车（机场线）', color: '#B23A2E', dash: true,
      path: [[43.7764, 11.2479], [43.7800, 11.2300], [43.7870, 11.2050], [43.7950, 11.1900], [43.8100, 11.1900]],
      stations: ['S.M.N.', 'Guidoni', 'Novoli', 'Peretola 机场'],
      note: '只在去机场时用得上；老城内全部步行，不需要交通票。'
    }
  ];

  /* ---------------- 16 天 ---------------- */
  /* 16 天日程
     stops = 高精力版（完整）；lite = 低精力版（只走核心，省略的点在卡片里列为"体力好可加"）
     规则：需要预约的门票、火车班次两个版本完全相同，只在免预约的点上做取舍；交通全程公共交通，不打车 */
  const days = [
    {
      n: 1, city: 'rome', title: '抵达罗马 · 先回酒店安顿',
      sub: 'FCO 机场 → Leonardo Express → Termini → 地铁 A 线回酒店 → 傍晚圣彼得广场散步',
      liteSub: 'FCO 机场 → Leonardo Express → Termini → 地铁 A 线回酒店，早点休息',
      stops: ['fco', 'termini'],
      legs: ['l_fco_termini'],
      stay: '罗马', note: '落地日不排景点，全程公共交通：Leonardo Express 直达 Termini（32 分钟），换地铁 A 线 10 站到 Cornelia（18 分钟），连换乘约 1 小时 15 分。高精力版傍晚 A 线 4 站到 Ottaviano，步行 10 分钟看圣彼得广场的夜景，明天要来的地方先认个路。', food: ['f_bonci']
    },
    {
      n: 2, city: 'rome', title: '梵蒂冈一整天',
      sub: '梵蒂冈博物馆 → 西斯廷礼拜堂 → 圣彼得大教堂 → 登穹顶',
      liteSub: '梵蒂冈博物馆 → 西斯廷礼拜堂 → 圣彼得大教堂（不登穹顶）',
      stops: ['vatican_museums', 'sanpietro'],
      stay: '罗马', note: '离酒店最近的一天：地铁 A 线 Cornelia → Cipro 只有 3 站。博物馆订 8:30 前后的场次（两个版本相同），西斯廷礼拜堂在参观路线末尾，看完约 12:30。下午圣彼得大教堂免门票、安检排队；高精力版再登穹顶（551 级，现场买票）。特意不放周三：1/20 上午教皇接见，广场和大教堂上午封闭。', food: ['f_bonci']
    },
    {
      n: 3, city: 'rome', title: '古罗马一整天 · 斗兽场到真理之口', liteTitle: '古罗马 · 斗兽场与古罗马广场',
      sub: '斗兽场 → 帕拉蒂尼山 → 古罗马广场 → 祖国祭坛 → 真理之口',
      liteSub: '斗兽场 → 古罗马广场 → 祖国祭坛',
      stops: ['colosseo', 'palatino', 'foro', 'altare_patria', 'bocca_verita'],
      lite: ['colosseo', 'foro', 'altare_patria'],
      stay: '罗马', note: '古罗马遗址集中在一片，一天走完不折返。斗兽场订 9:00 场，联票 24 小时有效，帕拉蒂尼山和古罗马广场用的是同一张票，两个版本订法一样。去程地铁 A 线到 Termini 换 B 线到 Colosseo。高精力版上帕拉蒂尼山、下到古罗马广场，从卡比托利欧一侧出来是祖国祭坛，午饭后往南 10 分钟到真理之口，再走 8 分钟坐 B 线 Circo Massimo 回程；低精力版不爬帕拉蒂尼山、不去真理之口，祖国祭坛外围看完沿帝国大道走回 B 线 Colosseo。', food: []
    },
    {
      n: 4, city: 'rome', title: '博尔盖塞 → 西班牙台阶 → 万神殿',
      sub: '上午美术馆（预约场次）→ 下山到西班牙广场 → 许愿池 → 万神殿 → 纳沃纳',
      liteSub: '上午美术馆（预约场次）→ 西班牙广场 → 许愿池 → 万神殿',
      stops: ['borghese', 'spagna', 'trevi', 'pantheon', 'navona'],
      lite: ['borghese', 'spagna', 'trevi', 'pantheon'],
      stay: '罗马', note: '从北往南一路下坡：博尔盖塞订 9:00 场（限时 2 小时，周一闭馆，今天周四，两个版本相同），出来穿过公园到 Pincio 平台，沿台阶下到西班牙广场，许愿池、万神殿之间都是 5–10 分钟步行。去程地铁 A 线 Cornelia → Spagna 7 站。高精力版逛到纳沃纳，晚饭后步行 20 分钟过 Ponte Umberto I 桥，从 A 线 Lepanto 站回酒店；低精力版看完万神殿步行 15 分钟回 A 线 Spagna 站。', food: ['f_giolitti', 'f_santeustachio', 'f_armando']
    },
    {
      n: 5, city: 'rome', title: '罗马半日 · 鲜花广场早市',
      sub: '鲜花广场早市 → 过 Ponte Sisto 桥 → 特拉斯提弗列午饭 → 下午回酒店收行李',
      liteSub: '鲜花广场早市 → 沿 Via Giulia 到圣天使桥 → 地铁回酒店收行李',
      stops: ['campo_fiori', 'trastevere'],
      lite: ['campo_fiori'],
      stay: '罗马', note: '明早坐火车，今天只排半天。去程地铁 A 线到 Spagna，穿过老城步行 20 分钟到鲜花广场早市（周一至周六，14:00 收摊）。高精力版过 Ponte Sisto 桥到特拉斯提弗列吃午饭，回程坐 8 路电车到 Trastevere 火车站，换 FL3 区域火车到 Valle Aurelia，再坐地铁 A 线 2 站回 Cornelia（Metrebus 单程票在市区通用）；低精力版逛完早市沿 Via Giulia 走到圣天使桥，从 A 线 Ottaviano 站回酒店。', food: ['f_roscioli', 'f_daenzo']
    },
    {
      n: 6, city: 'florence', title: '上午高铁去佛罗伦萨 · 下午老城',
      sub: '09:00 前后 Roma Termini 发车 → 10:35 到 Firenze S.M.N. → 圣母百花 → 领主广场 → 老桥 → 米开朗基罗广场日落',
      liteSub: '09:00 前后 Roma Termini 发车 → 10:35 到 Firenze S.M.N. → 圣母百花 → 领主广场 → 老桥',
      stops: ['smn', 'duomo_fi', 'dante', 'signoria', 'ponte_vecchio', 'michelangelo'],
      lite: ['smn', 'duomo_fi', 'signoria', 'ponte_vecchio'],
      legs: ['l_termini_smn'],
      stay: '佛罗伦萨', note: '08:20 退房，地铁 A 线到 Termini 约 25 分钟，坐 09:00 前后的高铁（两个版本同一班车）。到站步行 14 分钟到酒店寄存行李（14:00 才开房）。下午从北往南走：大教堂（周六约 15:45 关，先去）→ 领主广场 → 老桥。高精力版加但丁故居，16:15 往米开朗基罗广场上山看 17:10 前后的日落，下山坐 12 / 13 路公交回 SMN；低精力版看完老桥走到 SMN，坐 T1 电车 1 站到 Fortezza 回酒店。', food: ['f_antico', 'f_vivoli']
    },
    {
      n: 7, city: 'florence', title: '艺术日：乌菲兹 · 皮蒂宫 · 波波里', liteTitle: '艺术日：乌菲兹 · 下午休息',
      sub: '乌菲兹（早场）→ 过老桥 → 皮蒂宫 → 波波里花园 → 晚饭在河南岸',
      liteSub: '乌菲兹（早场）→ 过老桥到河南岸午饭 → 下午回酒店休息',
      stops: ['uffizi', 'pitti', 'boboli'],
      lite: ['uffizi'],
      stay: '佛罗伦萨', note: '全天在河两岸 1.5 公里内。乌菲兹订 8:15 第一场（两个版本相同），从三楼往下看。高精力版 11:00 出馆过老桥到皮蒂宫，下午逛波波里花园（冬季约 16:30 关），晚饭在河南岸 Santo Spirito 一带；低精力版看完乌菲兹过老桥吃午饭、随便走走，下午回酒店休息。皮蒂宫、波波里 1 月现场买票即可，不用预订。回程走到 SMN 坐 T1 电车 1 站到 Fortezza。', food: ['f_santospirito']
    },
    {
      n: 8, city: 'pisa', title: '比萨半日 · 下午回城休息',
      sub: '区域火车 1 小时 → 奇迹广场 → 斜塔 → 大教堂 → 13:40 回到佛罗伦萨',
      stops: ['pisa_centrale', 'miracoli', 'torre_pisa', 'duomo_pisa'],
      legs: ['l_smn_pisa'],
      stay: '佛罗伦萨', note: '周一佛罗伦萨的乌菲兹、学院、皮蒂宫都闭馆，正好出城。8:30 前后的区域火车到比萨，不用订座、上车前打卡。斜塔订 10:00 场，看完大教堂、洗礼堂就回城（两个版本相同），下午回酒店歇一歇，晚饭去中央市场二楼（开到深夜，离酒店步行 10 分钟）。', food: []
    },
    {
      n: 9, city: 'florence', title: '佛罗伦萨慢一天：大卫 · 中央市场 · 圣十字', liteTitle: '佛罗伦萨慢一天：大卫 · 中央市场',
      sub: '学院美术馆（早场）→ 中央市场 → 登乔托钟楼 → 圣十字教堂',
      liteSub: '学院美术馆（早场）→ 中央市场 → 下午回酒店收拾行李',
      stops: ['accademia', 'mercato_centrale', 'campanile', 'santa_croce'],
      lite: ['accademia', 'mercato_centrale'],
      stay: '佛罗伦萨', note: '原计划的锡耶纳 / 卢卡一日游往返要 3 小时车程，改为留在城里、全程步行。学院美术馆订 8:15 场看大卫（两个版本相同），出来 10 分钟到中央市场。高精力版中午前登乔托钟楼（414 级台阶，现场买票），下午去圣十字教堂；低精力版吃完中央市场就回酒店休息、收拾行李。实在想去锡耶纳：SMN 旁的长途车站有直达大巴（约 1 小时 15 分），可以把今天整天换过去。', food: ['f_nerbone', 'f_mario', 'f_vivoli']
    },
    {
      n: 10, city: 'venice', title: '高铁去威尼斯 · 大运河到圣马可',
      sub: '09:00 前后 SMN 发车 → 11:05 到 S. Lucia → 酒店放行李 → 2 线沿大运河到里亚托 → 圣马可广场 → 大教堂 → 叹息桥',
      liteSub: '09:00 前后 SMN 发车 → 11:05 到 S. Lucia → 酒店放行李 → 2 线直达圣马可 → 大教堂 → 叹息桥',
      stops: ['sl', 'rialto', 'san_marco', 'basilica_sm', 'sospiri'],
      lite: ['sl', 'san_marco', 'basilica_sm', 'sospiri'],
      legs: ['l_smn_sl'],
      stay: '威尼斯', note: '酒店在 Tronchetto 岛：S. Lucia 出站过宪法桥到 Piazzale Roma，坐 People Mover 一站到酒店，约 15 分钟。放下行李就在 Tronchetto 码头上 2 线沿大运河——这一程本身就是游览。高精力版在里亚托下船吃午饭、步行 10 分钟到圣马可；低精力版直接坐到 San Marco。圣马可大教堂订 14:30 前后的时段（两个版本相同，周三开到 17:15），日落后从 San Marco 码头坐 2 线回酒店。48 小时水上巴士通票今天激活。', food: ['f_domori', 'f_dalmoro']
    },
    {
      n: 11, city: 'venice', title: '外岛一日：玻璃岛 + 彩色岛', liteTitle: '外岛半日：彩色岛',
      sub: 'Murano 玻璃岛 → 12 线到 Burano 彩色岛 → 回程在圣玛格丽特广场吃 cicchetti',
      liteSub: '睡到自然醒 → 12 线直达 Burano 彩色岛 → 下午回酒店',
      stops: ['murano', 'burano', 'santa_margherita'],
      lite: ['burano'],
      stay: '威尼斯', note: '全程水上巴士，用昨天激活的 48 小时通票。高精力版从 Piazzale Roma 坐直达 Murano 的船（约 25–35 分钟，线路以码头时刻表为准），玻璃岛逛两小时，再从 Murano Faro 坐 12 线约 35 分钟到 Burano；回程 12 线到 Fondamente Nove 换环岛线回 Piazzale Roma，顺路在圣玛格丽特广场吃晚饭。低精力版只去 Burano：环岛线到 Fondamente Nove 换 12 线直达（约 45 分钟），下午就回。冬天外岛风大、12 线班次稀，先拍下回程时刻。', food: []
    },
    {
      n: 12, city: 'milan', title: '上午高铁去米兰 · 下午大教堂',
      sub: '10:00 前后 S. Lucia 发车 → 12:25 到 Milano Centrale → 酒店放行李 → 大教堂与屋顶 → 埃马努埃莱二世拱廊',
      stops: ['centrale', 'duomo_mi', 'galleria'],
      legs: ['l_sl_centrale'],
      stay: '米兰', note: '早上不再进主岛折返：退房后 People Mover + 步行 15 分钟到 S. Lucia，坐 10:00 前后的高铁（两个版本同一班车），中午到米兰。Centrale 坐 M2 到 Cadorna 换 M1 到 Bisceglie（约 30 分钟）放行李，再坐 M1 直达 Duomo（20 分钟）。大教堂屋顶趁天亮先上，傍晚在拱廊的 Camparino 喝杯开胃酒。', food: ['f_luini', 'f_camparino']
    },
    {
      n: 13, city: 'milan', title: '最后的晚餐 · 斯福尔扎 · 布雷拉', liteTitle: '最后的晚餐 · 斯福尔扎城堡',
      sub: '《最后的晚餐》（预约场次）→ 斯福尔扎城堡 → 森皮奥内公园 → 布雷拉美术馆',
      liteSub: '《最后的晚餐》（预约场次）→ 斯福尔扎城堡 → 中午回酒店休息',
      stops: ['cenacolo', 'sforza', 'sempione', 'brera'],
      lite: ['cenacolo', 'sforza'],
      stay: '米兰', note: '一条线向东北走：酒店坐 M1 到 Conciliazione（约 15 分钟），步行 5 分钟到感恩圣母堂。《最后的晚餐》每场 15 分钟，须提前 30 分钟取票（两个版本同一场次）。出来往北 600 米是斯福尔扎城堡。高精力版穿过森皮奥内公园再向东到布雷拉美术馆（现场买票即可），晚上在布雷拉区吃饭，M2 Lanza 一站到 Cadorna 换 M1 回酒店；低精力版看完城堡从 M1 Cairoli 站直接回酒店。运河区挪到 D15，今天不再南北折返。', food: []
    },
    {
      n: 14, city: 'como', title: '科莫湖一日 · 缆车上山',
      sub: 'Cadorna 坐 Trenord 直达 Como Nord Lago → 科莫大教堂 → 缆车上 Brunate → 湖边散步',
      liteSub: 'Cadorna 坐 Trenord 直达 Como Nord Lago → 缆车上 Brunate → 早点回米兰',
      stops: ['como_lago', 'como_duomo', 'funicolare', 'brunate'],
      lite: ['como_lago', 'funicolare', 'brunate'],
      legs: ['l_cadorna_como'],
      stay: '米兰', note: '酒店在 M1 上，从 Cadorna 直达湖滨的 Como Nord Lago 站，比去中央车站换车省事：M1 15 分钟到 Cadorna，Trenord 约 1 小时，出站就是湖（区域火车当天买，两个版本一样）。大教堂在 300 米外，缆车下站步行 5 分钟，7 分钟到山顶 Brunate 看湖。高精力版下午湖边走走，16:00 前后的车回米兰；低精力版不进大教堂，看完湖 14:00 前后就回。', food: []
    },
    {
      n: 15, city: 'milan', title: '购物 · 退税 · 运河区黄昏', liteTitle: '购物 · 退税',
      sub: '蒙特拿破仑大街 → 斯皮加大街 → 文艺复兴百货（顶层办退税）→ 运河区开胃酒',
      liteSub: '蒙特拿破仑大街 → 文艺复兴百货（顶层办退税）→ 回酒店收拾行李',
      stops: ['montenapoleone', 'spiga', 'rinascente', 'navigli'],
      lite: ['montenapoleone', 'rinascente'],
      stay: '米兰', note: '周一《最后的晚餐》和布雷拉都闭馆，正好留给购物：M1 到 San Babila，逛完回到大教堂旁的文艺复兴百货集中办退税（单店满 €154.94，护照随身）。高精力版买得多就先送回酒店（M1 直达），傍晚 M1 到 Cadorna 换 M2 到 Porta Genova 去运河区喝开胃酒；低精力版办完退税就回酒店收拾行李。', food: ['f_princi', 'f_marchesi', 'f_milanese']
    },
    {
      n: 16, city: 'milan', title: '返程 · 马尔彭萨机场',
      sub: 'M1 到 Cadorna → Malpensa Express 直达 T1',
      stops: ['cadorna', 'mxp'],
      legs: ['l_cadorna_mxp'],
      stay: '—', note: '起飞前 3.5 小时从酒店出发：M1 到 Cadorna 15 分钟，Malpensa Express 43 分钟直达 T1。国际航班 + 退税盖章，提前 3 小时到机场。', food: []
    }
  ];

  /* ---------------- 城市内每日路线（连线顺序） ---------------- */
  // 每个城市每天的推荐步行/交通顺序，用于绘制带箭头的路线
  /* 每日路径：一天按顺序走过的点。城市 id（'rome' / 'florence' / 'venice' / 'milan'）代表当晚的酒店。
     大部分天是环：酒店 → …… → 酒店。换城日从旧酒店出发、到新酒店收尾；一日游中间夹着往返火车。
     相邻两点是一"段"：两端都是车站且有 legs 的是城际段（地图上画在城际线层），其余画在市内路线层；每段怎么走见下面的 hops。
     低精力版自动只保留 days[].lite 里的景点（车站、酒店保留）；liteMode 是低精力版的一句话交通说明 */
  const routes = {
    rome: [
      { day: 1, stops: ['fco', 'termini', 'rome'], mode: '机场快线 + 地铁 A 线回酒店' },
      { day: 2, stops: ['rome', 'vatican_museums', 'sanpietro', 'rome'], mode: '地铁 A 线来回 + 步行' },
      { day: 3, stops: ['rome', 'colosseo', 'palatino', 'foro', 'altare_patria', 'bocca_verita', 'rome'], mode: '地铁 A→B 线去，步行串完，B→A 线回', liteMode: '地铁 A→B 线去，步行，B→A 线回' },
      { day: 4, stops: ['rome', 'borghese', 'spagna', 'trevi', 'pantheon', 'navona', 'rome'], mode: '地铁 A 线 Spagna 去，一路下坡步行，A 线 Lepanto 回', liteMode: '地铁 A 线 Spagna 来回，中间步行' },
      { day: 5, stops: ['rome', 'campo_fiori', 'trastevere', 'rome'], mode: '地铁 A 线去，步行过桥，8 路电车 + FL3 + A 线回', liteMode: '地铁 A 线 Spagna 去，步行到 Ottaviano 回' }
    ],
    florence: [
      { day: 6, stops: ['rome', 'termini', 'smn', 'florence', 'duomo_fi', 'dante', 'signoria', 'ponte_vecchio', 'michelangelo', 'florence'], mode: '地铁 + 高铁 → 酒店放行李 → 步行 + 上山，12 / 13 路公交下山', liteMode: '地铁 + 高铁 → 酒店放行李 → 步行，T1 电车回酒店' },
      { day: 7, stops: ['florence', 'uffizi', 'pitti', 'boboli', 'florence'], mode: '步行去（过老桥一段），T1 电车回酒店' },
      { day: 8, stops: ['florence', 'smn', 'pisa_centrale', 'miracoli', 'torre_pisa', 'duomo_pisa', 'pisa_centrale', 'smn', 'florence'], mode: '区域火车往返 + 步行' },
      { day: 9, stops: ['florence', 'accademia', 'mercato_centrale', 'campanile', 'santa_croce', 'florence'], mode: '全程步行' }
    ],
    venice: [
      { day: 10, stops: ['florence', 'smn', 'sl', 'venice', 'rialto', 'san_marco', 'basilica_sm', 'sospiri', 'venice'], mode: '高铁 → People Mover 到酒店 → 水上巴士 2 线沿大运河 → 步行 → 2 线回', liteMode: '高铁 → People Mover 到酒店 → 水上巴士 2 线直达 San Marco → 2 线回' },
      { day: 11, stops: ['venice', 'murano', 'burano', 'santa_margherita', 'venice'], mode: '水上巴士（Murano → 12 线 Burano → 环岛线回）', liteMode: '水上巴士 12 线直达 Burano 来回' }
    ],
    milan: [
      { day: 12, stops: ['venice', 'sl', 'centrale', 'milan', 'duomo_mi', 'galleria', 'milan'], mode: '高铁 → 地铁 M2 + M1 先回酒店放行李 → M1 直达 Duomo 来回' },
      { day: 13, stops: ['milan', 'cenacolo', 'sforza', 'sempione', 'brera', 'milan'], mode: '地铁 M1 去 + 步行，M2 + M1 回', liteMode: '地铁 M1 来回 + 步行' },
      { day: 14, stops: ['milan', 'cadorna', 'como_lago', 'como_duomo', 'funicolare', 'brunate', 'funicolare', 'como_lago', 'cadorna', 'milan'], mode: 'M1 + Trenord 直达湖滨，缆车上下山，原路回' },
      { day: 15, stops: ['milan', 'montenapoleone', 'spiga', 'rinascente', 'navigli', 'milan'], mode: '地铁 M1 去 + 步行 + 3 路电车，M2 + M1 回', liteMode: '地铁 M1 来回 + 步行' },
      { day: 16, stops: ['milan', 'cadorna', 'mxp'], mode: '地铁 M1 + Malpensa Express' }
    ]
  };

  /* 每一段怎么走。key = '起点>终点'，用 routes 里的写法（城市 id = 酒店）
     sum：一句话概括；steps：[方式, 说明, 分钟]，方式 = walk 步行 / metro 地铁 / tram 电车 / bus 公交 / train 火车 /
          boat 水上巴士 / mover People Mover / funi 缆车；min：门到门大约几分钟（含走到站、等车）
     alt：差不多的备选；taxi：打车大约几分钟（数字），或一句话（不能打 / 不必打 / 注意事项）
     没写的段按步行估算（直线距离 × 1.3，每分钟 75 米）；城际火车段没写时取 legs 的车型与时长。
     时间是 1 月平日的经验值，地铁、电车按白天班次估，出行前用 Google Maps 实时查一下 */
  const hops = {
    // —— 罗马（酒店在 A 线 Cornelia 站旁）——
    'fco>termini': { sum: 'Leonardo Express 机场快线', min: 45,
      steps: [['walk', '出关后跟 Treni 标志走到机场火车站', 10], ['train', 'Leonardo Express 直达 Termini，中途不停，€14', 32]],
      alt: 'FL1 区域火车（约 €8）到 Trastevere / Ostiense，不进 Termini，再转车不顺路',
      taxi: '可以：机场到城墙内是固定价 €55，酒店在城墙外按表计价，约 40 分钟' },
    'termini>rome': { sum: '地铁 A 线 → Cornelia', min: 30,
      steps: [['metro', 'A 线（方向 Battistini）→ Cornelia，10 站', 18], ['walk', '出站步行到酒店', 5]], taxi: 25 },
    'rome>vatican_museums': { sum: '地铁 A 线 → Cipro + 步行', min: 25,
      steps: [['walk', '步行到 A 线 Cornelia 站', 5], ['metro', 'A 线 → Cipro（Musei Vaticani），3 站', 5], ['walk', '出站步行到博物馆入口', 8]],
      alt: 'Ottaviano 站下（4 站），步行 10 分钟', taxi: 12 },
    'vatican_museums>sanpietro': { sum: '步行，沿梵蒂冈城墙', min: 18,
      steps: [['walk', '出博物馆沿城墙走到圣彼得广场', 18]], taxi: '不必，沿城墙走就到' },
    'sanpietro>rome': { sum: '步行 + 地铁 A 线 Ottaviano → Cornelia', min: 25,
      steps: [['walk', '步行到 A 线 Ottaviano 站', 10], ['metro', 'A 线 → Cornelia，4 站', 7], ['walk', '出站步行到酒店', 5]], taxi: 15 },
    'rome>colosseo': { sum: '地铁 A 线 → Termini 换 B 线', min: 35,
      steps: [['walk', '步行到 A 线 Cornelia 站', 5], ['metro', 'A 线 → Termini，10 站', 18], ['metro', '换 B 线（方向 Laurentina）→ Colosseo，2 站', 7], ['walk', '出站就是斗兽场', 2]],
      alt: 'A 线 Termini 下车后步行 20 分钟', taxi: 25 },
    'colosseo>palatino': { sum: '步行，遗址区内', min: 8, steps: [['walk', '到 Via di San Gregorio 入口，同一张联票', 8]], taxi: '遗址区内，只能步行' },
    'palatino>foro': { sum: '步行下山', min: 10, steps: [['walk', '从帕拉蒂尼山走下古罗马广场', 10]], taxi: '遗址区内，只能步行' },
    'colosseo>foro': { sum: '步行', min: 8, steps: [['walk', '走到帝国大道一侧的古罗马广场入口', 8]], taxi: '太近，不必打车' },
    'foro>altare_patria': { sum: '步行', min: 8, steps: [['walk', '从卡比托利欧一侧出口出来就到', 8]], taxi: '太近，不必打车' },
    'bocca_verita>rome': { sum: '步行 + 地铁 B 线 → Termini 换 A 线', min: 45,
      steps: [['walk', '步行到 B 线 Circo Massimo 站', 8], ['metro', 'B 线 → Termini，3 站', 6], ['metro', '换 A 线 → Cornelia，10 站', 18], ['walk', '出站步行到酒店', 5]], taxi: 25 },
    'altare_patria>rome': { sum: '步行 + 地铁 B 线 → Termini 换 A 线', min: 45,
      steps: [['walk', '沿帝国大道步行到 B 线 Colosseo 站', 12], ['metro', 'B 线 → Termini，2 站', 4], ['metro', '换 A 线 → Cornelia，10 站', 18], ['walk', '出站步行到酒店', 5]],
      alt: 'Piazza Venezia 坐 64 路公交到 Termini，再换 A 线', taxi: 25 },
    'rome>borghese': { sum: '地铁 A 线 → Spagna + 穿公园步行', min: 40,
      steps: [['walk', '步行到 A 线 Cornelia 站', 5], ['metro', 'A 线 → Spagna，7 站', 13], ['walk', '从站内出口上坡，穿过博尔盖塞公园到美术馆', 18]],
      alt: 'Flaminio 站下（6 站），穿公园步行约 20 分钟', taxi: '可以，约 20 分钟，能停在美术馆门口' },
    'borghese>spagna': { sum: '步行，一路下坡', min: 20, steps: [['walk', '穿过公园到 Pincio 平台，沿台阶下到西班牙广场', 20]], taxi: 10 },
    'navona>rome': { sum: '步行过桥 + 地铁 A 线 Lepanto → Cornelia', min: 35,
      steps: [['walk', '过 Ponte Umberto I 桥步行到 A 线 Lepanto 站', 20], ['metro', 'A 线 → Cornelia，5 站', 9], ['walk', '出站步行到酒店', 5]],
      alt: '步行 20 分钟回 A 线 Spagna 站（7 站）', taxi: 20 },
    'pantheon>rome': { sum: '步行 + 地铁 A 线 Spagna → Cornelia', min: 35,
      steps: [['walk', '步行到 A 线 Spagna 站', 15], ['metro', 'A 线 → Cornelia，7 站', 13], ['walk', '出站步行到酒店', 5]], taxi: 20 },
    'rome>campo_fiori': { sum: '地铁 A 线 → Spagna + 步行穿老城', min: 45,
      steps: [['walk', '步行到 A 线 Cornelia 站', 5], ['metro', 'A 线 → Spagna，7 站', 13], ['walk', '穿过老城步行到鲜花广场', 22]],
      alt: 'Lepanto 站下（5 站），过河步行约 25 分钟', taxi: '可以，约 20 分钟；广场是步行区，停在 Corso Vittorio Emanuele 路边' },
    'campo_fiori>trastevere': { sum: '步行过 Ponte Sisto 桥', min: 12, steps: [['walk', '过 Ponte Sisto 桥进特拉斯提弗列', 12]], taxi: '太近，不必打车' },
    'trastevere>rome': { sum: '8 路电车 + FL3 火车 + 地铁 A 线', min: 45,
      steps: [['tram', '8 路电车 → Stazione Trastevere', 10], ['train', 'FL3 区域火车 → Valle Aurelia（约每 15–30 分钟一班，Metrebus 单程票通用）', 12], ['metro', '换 A 线 → Cornelia，2 站', 4], ['walk', '出站步行到酒店', 5]],
      alt: '8 路电车坐到 Largo Argentina，步行约 18 分钟到 A 线 Spagna 站', taxi: 20 },
    'campo_fiori>rome': { sum: '步行到圣天使桥 + 地铁 A 线 Ottaviano → Cornelia', min: 50,
      steps: [['walk', '沿 Via Giulia 步行到圣天使桥', 18], ['walk', '过桥沿 Via Crescenzio 走到 A 线 Ottaviano 站', 15], ['metro', 'A 线 → Cornelia，4 站', 7], ['walk', '出站步行到酒店', 5]],
      alt: '走累了：Corso Vittorio Emanuele 坐 64 路到 Termini 换 A 线，时间差不多', taxi: 18 },

    // —— 换城：罗马 → 佛罗伦萨（酒店在 Fortezza 一带，离 SMN 车站 1 km）——
    'rome>termini': { sum: '地铁 A 线 → Termini（拖行李）', min: 35,
      steps: [['walk', '拖行李步行到 A 线 Cornelia 站', 6], ['metro', 'A 线 → Termini，10 站', 18], ['walk', '站内走到高铁站台，留出找站台的时间', 10]], taxi: '可以，约 25 分钟，拖行李时最省事' },
    'smn>florence': { sum: '步行 1 km', min: 15,
      steps: [['walk', '出站沿 Viale F.lli Rosselli 直走到酒店', 14]], alt: 'T1 电车到 Fortezza 站，再走 5 分钟（拖行李时）', taxi: '可以，车站门口有出租车站，约 5 分钟' },
    'florence>smn': { sum: '步行 1 km', min: 15,
      steps: [['walk', '沿 Viale F.lli Rosselli 步行到车站', 14]], alt: 'Fortezza 站坐 T1 电车到车站', taxi: 5 },
    'florence>duomo_fi': { sum: '步行，经车站穿老城', min: 22,
      steps: [['walk', '经 SMN 车站穿老城步行到大教堂', 22]], alt: 'T1 电车到车站，再步行 10 分钟', taxi: '可以，约 8 分钟；大教堂广场是步行区，停在附近路口' },
    'ponte_vecchio>michelangelo': { sum: '步行上山（台阶）', min: 25,
      steps: [['walk', '过老桥经 San Niccolò，沿台阶上到广场', 25]], alt: '不想爬坡：坐 12 / 13 路公交上山', taxi: 10 },
    'michelangelo>florence': { sum: '12 / 13 路公交下山 + T1 电车', min: 40,
      steps: [['bus', '12 / 13 路公交下山到 SMN 车站', 25], ['tram', 'T1 电车 → Fortezza 站', 5], ['walk', '步行到酒店', 5]], alt: '下山步行回酒店约 45 分钟', taxi: 15 },
    'ponte_vecchio>florence': { sum: '步行到车站 + T1 电车', min: 25,
      steps: [['walk', '步行到 SMN 车站', 15], ['tram', 'T1 电车 → Fortezza 站', 5], ['walk', '步行到酒店', 5]], alt: '直接走回酒店约 30 分钟', taxi: 10 },
    'florence>uffizi': { sum: '步行，经车站、大教堂', min: 28,
      steps: [['walk', '经车站、大教堂步行到乌菲兹', 28]], alt: 'T1 电车到车站，再步行 15 分钟', taxi: '可以，约 10 分钟，停在附近路口' },
    'uffizi>pitti': { sum: '步行过老桥', min: 10, steps: [['walk', '沿河走过老桥到皮蒂宫', 10]], taxi: '太近，不必打车' },
    'pitti>boboli': { sum: '步行', min: 3, steps: [['walk', '皮蒂宫后面就是花园入口', 3]], taxi: '同一处，不必打车' },
    'boboli>florence': { sum: '步行到车站 + T1 电车', min: 35,
      steps: [['walk', '过河步行到 SMN 车站', 25], ['tram', 'T1 电车 → Fortezza 站', 5], ['walk', '步行到酒店', 5]], taxi: 12 },
    'uffizi>florence': { sum: '步行到车站 + T1 电车', min: 28,
      steps: [['walk', '步行到 SMN 车站', 18], ['tram', 'T1 电车 → Fortezza 站', 5], ['walk', '步行到酒店', 5]], alt: '直接走回酒店约 30 分钟', taxi: 10 },
    'florence>accademia': { sum: '步行，经 Piazza dell\'Indipendenza', min: 20,
      steps: [['walk', '往东南经 Piazza dell\'Indipendenza 步行到学院美术馆', 20]], taxi: 8 },
    'santa_croce>florence': { sum: '步行穿老城', min: 32,
      steps: [['walk', '穿老城步行回酒店', 32]], alt: '走到 SMN 车站坐 T1 电车到 Fortezza，时间差不多', taxi: 12 },
    'mercato_centrale>florence': { sum: '步行', min: 12, steps: [['walk', '步行回酒店', 12]], taxi: 6 },
    'pisa_centrale>miracoli': { sum: '步行，或 LAM Rossa 公交', min: 22,
      steps: [['walk', '沿 Corso Italia 过阿诺河一路往北', 22]], alt: 'LAM Rossa（红线）公交，约 10 分钟', taxi: 7 },
    'duomo_pisa>pisa_centrale': { sum: '步行，或 LAM Rossa 公交', min: 22,
      steps: [['walk', '原路往南走回车站', 22]], alt: 'LAM Rossa（红线）公交，约 10 分钟', taxi: 7 },
    'miracoli>torre_pisa': { sum: '步行', min: 2, steps: [['walk', '同一片草坪', 2]], taxi: '同一处，不必打车' },
    'torre_pisa>duomo_pisa': { sum: '步行', min: 2, steps: [['walk', '斜塔旁边就是大教堂', 2]], taxi: '同一处，不必打车' },

    // —— 换城：佛罗伦萨 → 威尼斯（酒店在 Tronchetto 岛，People Mover 一站到 Piazzale Roma）——
    'sl>venice': { sum: '步行过桥 + People Mover', min: 15,
      steps: [['walk', '出站过宪法桥到 Piazzale Roma', 8], ['mover', 'People Mover → Tronchetto，1 站，€1.50', 3], ['walk', '步行到酒店', 3]],
      taxi: '主岛没有出租车；水上出租可以直达，约 €60 起' },
    'venice>sl': { sum: 'People Mover + 步行过桥', min: 15,
      steps: [['walk', '步行到 People Mover 站', 3], ['mover', 'People Mover → Piazzale Roma', 3], ['walk', '过宪法桥到 S. Lucia 车站', 8]],
      taxi: '主岛没有出租车；水上出租约 €60 起' },
    'venice>rialto': { sum: '水上巴士 2 线，沿大运河', min: 30,
      steps: [['walk', '步行到 Tronchetto 码头', 3], ['boat', '水上巴士 2 线 → Rialto，沿大运河', 25]],
      alt: 'Piazzale Roma 坐 1 线，站站停，约 35 分钟', taxi: '水上出租约 15 分钟，€70 起；主岛没有陆地出租车' },
    'rialto>san_marco': { sum: '步行穿小巷', min: 12, steps: [['walk', '跟着 Per S. Marco 的黄色指示牌走', 12]], taxi: '主岛没有出租车' },
    'san_marco>basilica_sm': { sum: '步行', min: 1, steps: [['walk', '广场东头就是大教堂', 1]], taxi: '主岛没有出租车' },
    'basilica_sm>sospiri': { sum: '步行', min: 3, steps: [['walk', '绕过总督宫走到海边', 3]], taxi: '主岛没有出租车' },
    'sospiri>venice': { sum: '水上巴士 2 线回 Tronchetto', min: 45,
      steps: [['walk', '步行到 San Zaccaria / San Marco 码头', 3], ['boat', '水上巴士 2 线 → Tronchetto', 35], ['walk', '步行到酒店', 3]],
      alt: 'San Zaccaria 坐 1 线到 Piazzale Roma，再坐 People Mover，慢一些', taxi: '水上出租约 20 分钟，€80 起' },
    'venice>san_marco': { sum: '水上巴士 2 线直达', min: 45,
      steps: [['walk', '步行到 Tronchetto 码头', 3], ['boat', '水上巴士 2 线 → San Marco，沿大运河', 40]], taxi: '水上出租约 20 分钟，€80 起' },
    'venice>murano': { sum: 'People Mover + 水上巴士', min: 40,
      steps: [['mover', 'People Mover → Piazzale Roma', 3], ['boat', '水上巴士 3 / 4.1 / 4.2 线 → Murano（以码头时刻表为准）', 30]], taxi: '水上出租约 20 分钟，€80 起' },
    'murano>burano': { sum: '水上巴士 12 线', min: 40,
      steps: [['walk', '走到 Murano Faro 码头', 5], ['boat', '12 线 → Burano，班次稀，先拍下时刻表', 35]], taxi: '水上出租约 20 分钟，€80 起' },
    'burano>santa_margherita': { sum: '12 线 + 环岛线 + 步行', min: 85,
      steps: [['boat', '12 线 → Fondamente Nove', 45], ['boat', '换 4.1 / 5.1 环岛线 → Piazzale Roma', 25], ['walk', '步行到圣玛格丽特广场', 10]],
      alt: 'Fondamente Nove 下船后步行约 30 分钟穿过主岛', taxi: '水上出租约 35 分钟，€100 起' },
    'santa_margherita>venice': { sum: '步行 + People Mover', min: 18,
      steps: [['walk', '步行到 Piazzale Roma', 10], ['mover', 'People Mover → Tronchetto', 3], ['walk', '步行到酒店', 3]], taxi: '主岛没有出租车' },
    'venice>burano': { sum: 'People Mover + 环岛线 + 12 线', min: 80,
      steps: [['mover', 'People Mover → Piazzale Roma', 3], ['boat', '4.2 / 5.2 环岛线 → Fondamente Nove', 25], ['boat', '换 12 线 → Burano', 45]], taxi: '水上出租约 35 分钟，€100 起' },
    'burano>venice': { sum: '12 线 + 环岛线 + People Mover', min: 80,
      steps: [['boat', '12 线 → Fondamente Nove', 45], ['boat', '换 4.1 / 5.1 环岛线 → Piazzale Roma', 25], ['mover', 'People Mover → Tronchetto', 3]], taxi: '水上出租约 35 分钟，€100 起' },

    // —— 换城：威尼斯 → 米兰（酒店离 M1 Bisceglie 站步行 7 分钟）——
    'centrale>milan': { sum: '地铁 M2 → Cadorna 换 M1', min: 40,
      steps: [['metro', 'M2（绿线）→ Cadorna，5 站', 10], ['metro', '换 M1（红线，方向 Bisceglie）→ Bisceglie，9 站', 15], ['walk', '出站步行到酒店', 7]],
      alt: 'M3 到 Duomo 换 M1，多换一段，时间差不多', taxi: 25 },
    'milan>duomo_mi': { sum: '地铁 M1 → Duomo', min: 30,
      steps: [['walk', '步行到 M1 Bisceglie 站', 7], ['metro', 'M1 → Duomo，12 站', 20]], taxi: 25 },
    'galleria>milan': { sum: '地铁 M1 → Bisceglie', min: 32,
      steps: [['walk', '步行到 M1 Duomo 站', 3], ['metro', 'M1 → Bisceglie，12 站', 20], ['walk', '出站步行到酒店', 7]], taxi: 25 },
    'milan>cenacolo': { sum: '地铁 M1 → Conciliazione + 步行', min: 30,
      steps: [['walk', '步行到 M1 Bisceglie 站', 7], ['metro', 'M1 → Conciliazione，8 站', 14], ['walk', '步行到感恩圣母堂', 6]], alt: 'Cadorna 站下，步行 10 分钟', taxi: 18 },
    'brera>milan': { sum: '地铁 M2 Lanza → Cadorna 换 M1', min: 35,
      steps: [['walk', '步行到 M2 Lanza 站', 6], ['metro', 'M2 → Cadorna，1 站', 2], ['metro', '换 M1 → Bisceglie，9 站', 15], ['walk', '出站步行到酒店', 7]], taxi: 22 },
    'sforza>milan': { sum: '地铁 M1 Cairoli → Bisceglie', min: 30,
      steps: [['walk', '步行到 M1 Cairoli 站', 4], ['metro', 'M1 → Bisceglie，10 站', 17], ['walk', '出站步行到酒店', 7]], taxi: 20 },
    'milan>cadorna': { sum: '地铁 M1 → Cadorna', min: 25,
      steps: [['walk', '步行到 M1 Bisceglie 站', 7], ['metro', 'M1 → Cadorna，9 站', 15]], taxi: 18 },
    'cadorna>milan': { sum: '地铁 M1 → Bisceglie', min: 25,
      steps: [['metro', 'M1 → Bisceglie，9 站', 15], ['walk', '出站步行到酒店', 7]], taxi: 18 },
    'como_lago>como_duomo': { sum: '步行', min: 5, steps: [['walk', '出站穿过 Piazza Cavour 到大教堂', 5]], taxi: '太近，不必打车' },
    'como_lago>funicolare': { sum: '步行，沿湖往北', min: 7, steps: [['walk', '出站沿湖边往北走到缆车下站', 7]], taxi: '太近，不必打车' },
    'funicolare>como_lago': { sum: '步行，沿湖往南', min: 7, steps: [['walk', '沿湖边走回 Como Nord Lago 站', 7]], taxi: '太近，不必打车' },
    'como_duomo>funicolare': { sum: '步行', min: 8, steps: [['walk', '沿湖边走到缆车下站', 8]], taxi: '太近，不必打车' },
    'funicolare>brunate': { sum: '缆车上山', min: 10,
      steps: [['funi', '缆车上山，约每 15–30 分钟一班', 7]], taxi: '可以开车上山，约 20 分钟，但缆车更快' },
    'brunate>funicolare': { sum: '缆车下山', min: 10,
      steps: [['funi', '缆车下山', 7]], taxi: '可以开车下山，约 20 分钟' },
    'milan>montenapoleone': { sum: '地铁 M1 → San Babila', min: 32,
      steps: [['walk', '步行到 M1 Bisceglie 站', 7], ['metro', 'M1 → San Babila，13 站', 22], ['walk', '出站步行到蒙特拿破仑大街', 3]], taxi: 25 },
    'rinascente>navigli': { sum: '3 路电车直达运河区', min: 22,
      steps: [['walk', '步行到 Via Torino 电车站', 5], ['tram', '3 路电车 → Porta Ticinese / 运河区', 15]],
      alt: 'M1 Duomo → Cadorna 换 M2 → Porta Genova；或步行约 25 分钟。买得多可先回酒店放东西', taxi: 12 },
    'navigli>milan': { sum: '地铁 M2 Porta Genova → Cadorna 换 M1', min: 38,
      steps: [['walk', '步行到 M2 Porta Genova 站', 5], ['metro', 'M2 → Cadorna，3 站', 6], ['metro', '换 M1 → Bisceglie，9 站', 15], ['walk', '出站步行到酒店', 7]], taxi: 20 },
    'rinascente>milan': { sum: '地铁 M1 Duomo → Bisceglie', min: 30,
      steps: [['walk', '步行到 M1 Duomo 站', 2], ['metro', 'M1 → Bisceglie，12 站', 20], ['walk', '出站步行到酒店', 7]], taxi: 25 },
    'cadorna>mxp': { sum: 'Malpensa Express 直达 T1', min: 50,
      steps: [['train', 'Malpensa Express → Malpensa T1，€13', 43]], taxi: '可以，约 45 分钟，车费 €100 左右' }
  };

  return { cities, hubs, places, food, areas, legs, transit, days, routes, hops };
})();
