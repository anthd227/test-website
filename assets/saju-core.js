/* 만세력 계산 (절기·간지·대운·십신 등) */
(function (g) {
  'use strict';

  var EL = ['목', '화', '토', '금', '수'];
  var EL_H = ['木', '火', '土', '金', '水'];
  var STEM_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var STEM_K = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var BR_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BR_K = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var BR_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  var ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  // 지장간 (여기 · 중기 · 정기 순, 마지막이 본기)
  var HIDDEN = [[8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2], [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]];
  var TEN = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
  var TEN_GROUP = ['비겁', '식상', '재성', '관성', '인성'];
  var STAGE = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
  var STAGE_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
  var TERMS = ['소한', '대한', '입춘', '우수', '경칩', '춘분', '청명', '곡우', '입하', '소만', '망종', '하지', '소서', '대서', '입추', '처서', '백로', '추분', '한로', '상강', '입동', '소설', '대설', '동지'];
  var PILLAR_NAME = ['년주', '월주', '일주', '시주'];

  var CITIES = [
    { name: '서울', lon: 126.98 }, { name: '인천', lon: 126.71 }, { name: '수원', lon: 127.03 }, { name: '춘천', lon: 127.73 },
    { name: '강릉', lon: 128.88 }, { name: '대전', lon: 127.38 }, { name: '청주', lon: 127.49 }, { name: '전주', lon: 127.15 },
    { name: '광주', lon: 126.85 }, { name: '목포', lon: 126.39 }, { name: '대구', lon: 128.60 }, { name: '포항', lon: 129.34 },
    { name: '부산', lon: 129.08 }, { name: '울산', lon: 129.31 }, { name: '창원', lon: 128.68 }, { name: '제주', lon: 126.53 }
  ];

  function mod(a, n) { return ((a % n) + n) % n; }
  function stemEl(s) { return Math.floor(s / 2); }
  function stemYang(s) { return s % 2 === 0; }
  function mainStem(b) { var h = HIDDEN[b]; return h[h.length - 1]; }
  function ganziIndex(s, b) { return mod(6 * s - 5 * b, 60); }
  function ganziOf(n) { n = mod(n, 60); return { s: n % 10, b: n % 12 }; }
  function gzH(p) { return STEM_H[p.s] + BR_H[p.b]; }
  function gzK(p) { return STEM_K[p.s] + BR_K[p.b]; }

  function tenGod(day, other) {
    var rel = mod(stemEl(other) - stemEl(day), 5);
    return rel * 2 + (stemYang(day) === stemYang(other) ? 0 : 1);
  }
  function stage(stem, branch) {
    return stemYang(stem) ? mod(branch - STAGE_START[stem], 12) : mod(STAGE_START[stem] - branch, 12);
  }

  /* ---------- 태양 황경 · 절기 ---------- */
  var RAD = Math.PI / 180;
  function deltaT(y) {
    var t;
    if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t; }
    if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t; }
    if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5); }
    if (y < 2050) { t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    return -20 + 32 * Math.pow((y - 1820) / 100, 2) - 0.5628 * (2150 - y);
  }
  // 지구 일심황경 급수 (VSOP87 주요 항) [진폭, 위상, 주파수]
  var VL = [
    [[175347046,0,0],[3341656,4.6692568,6283.07585],[34894,4.6261,12566.1517],[3497,2.7441,5753.3849],[3418,2.8289,3.5231],[3136,3.6277,77713.7715],[2676,4.4181,7860.4194],[2343,6.1352,3930.2097],[1324,0.7425,11506.7698],[1273,2.0371,529.691],[1199,1.1096,1577.3435],[990,5.233,5884.927],[902,2.045,26.298],[857,3.508,398.149],[780,1.179,5223.694],[753,2.533,5507.553],[505,4.583,18849.228],[492,4.205,775.523],[357,2.92,0.067],[317,5.849,11790.629],[284,1.899,796.298],[271,0.315,10977.079],[243,0.345,5486.778],[206,4.806,2544.314],[205,1.869,5573.143],[202,2.458,6069.777],[156,0.833,213.299],[132,3.411,2942.463],[126,1.083,20.775],[115,0.645,0.98],[103,0.636,4694.003],[102,0.976,15720.839],[102,4.267,7.114],[99,6.21,2146.17],[98,0.68,155.42],[86,5.98,161000.69],[85,1.3,6275.96],[85,3.67,71430.7],[80,1.81,17260.15]],
    [[628331966747,0,0],[206059,2.678235,6283.07585],[4303,2.6351,12566.1517],[425,1.59,3.523],[119,5.796,26.298],[109,2.966,1577.344],[93,2.59,18849.23],[72,1.14,529.69],[68,1.87,398.15],[67,4.41,5507.55],[59,2.89,5223.69],[56,2.17,155.42],[45,0.4,796.3],[36,0.47,775.52],[29,2.65,7.11],[21,5.34,0.98],[19,1.85,5486.78],[19,4.97,213.3],[17,2.99,6275.96],[16,0.03,2544.31]],
    [[52919,0,0],[8720,1.0721,6283.0758],[309,0.867,12566.152],[27,0.05,3.52],[16,5.19,26.3],[16,3.68,155.42],[10,0.76,18849.23],[9,2.06,77713.77],[7,0.83,775.52],[5,4.66,1577.34]],
    [[289,5.844,6283.076],[35,0,0],[17,5.49,12566.15],[3,5.2,155.42]],
    [[114,3.142,0],[8,4.13,6283.08],[1,3.84,12566.15]],
    [[1,3.14,0]]
  ];
  // 태양 시황경(도)
  function sunLon(jde) {
    var tau = (jde - 2451545) / 365250, T = tau * 10, L = 0, tp = 1;
    for (var i = 0; i < VL.length; i++) {
      var sum = 0, row = VL[i];
      for (var j = 0; j < row.length; j++) sum += row[j][0] * Math.cos(row[j][1] + row[j][2] * tau);
      L += sum * tp; tp *= tau;
    }
    var lon = L / 1e8 / RAD + 180;
    lon -= 0.09033 / 3600;
    var om = (125.04452 - 1934.136261 * T) * RAD, Ls = (280.4665 + 36000.7698 * T) * RAD, Lm = (218.3165 + 481267.8813 * T) * RAD;
    var dpsi = (-17.2 * Math.sin(om) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * om)) / 3600;
    var M = (357.52911 + 35999.05029 * T) * RAD, e = 0.016708634 - 0.000042037 * T;
    var R = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(M + (1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M)) * RAD));
    return mod(lon + dpsi - 20.4898 / 3600 / R, 360);
  }
  var termCache = {};
  // k: 0 소한 ~ 23 동지, 반환값은 UTC 밀리초
  function termUtc(year, k) {
    var key = year * 24 + k;
    if (termCache[key] !== undefined) return termCache[key];
    var target = (285 + 15 * k) % 360;
    var jd = Date.UTC(year, 0, 6) / 864e5 + 2440587.5 + k * 15.2184;
    var dt = deltaT(year) / 86400;
    for (var i = 0; i < 8; i++) {
      var diff = mod(target - sunLon(jd + dt) + 180, 360) - 180;
      jd += diff / 360 * 365.2422;
      if (Math.abs(diff) < 1e-7) break;
    }
    var ms = Math.round((jd - 2440587.5) * 864e5 / 1000) * 1000;
    termCache[key] = ms;
    return ms;
  }
  function termsOfYear(year) {
    var out = [];
    for (var k = 0; k < 24; k++) out.push({ k: k, name: TERMS[k], utc: termUtc(year, k) });
    return out;
  }
  // 기준 시각 앞뒤의 절기 (jeolOnly 면 12절만)
  function aroundTerm(utc, jeolOnly) {
    var y = new Date(utc).getUTCFullYear(), list = [];
    for (var yy = y - 1; yy <= y + 1; yy++) for (var k = 0; k < 24; k += (jeolOnly ? 2 : 1)) list.push({ k: k, name: TERMS[k], utc: termUtc(yy, k) });
    var prev = null, next = null;
    for (var i = 0; i < list.length; i++) { if (list[i].utc <= utc) prev = list[i]; else { next = list[i]; break; } }
    return { prev: prev, next: next };
  }

  /* ---------- 표준시 (과거 한국 표준시·서머타임 반영) ---------- */
  var seoulFmt = null;
  try {
    seoulFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  } catch (e) { seoulFmt = null; }
  function seoulParts(utc) {
    if (!seoulFmt) { var d0 = new Date(utc + 9 * 36e5); return { y: d0.getUTCFullYear(), m: d0.getUTCMonth() + 1, d: d0.getUTCDate(), h: d0.getUTCHours(), mi: d0.getUTCMinutes(), s: d0.getUTCSeconds() }; }
    var o = {};
    seoulFmt.formatToParts(new Date(utc)).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: (+o.hour) % 24, mi: +o.minute, s: +o.second };
  }
  function seoulOffsetMin(utc) {
    var p = seoulParts(utc);
    return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - utc) / 60000);
  }
  function wallToUtc(y, m, d, h, mi) {
    var wall = Date.UTC(y, m - 1, d, h, mi);
    var off = seoulOffsetMin(wall - 9 * 36e5);
    var utc = wall - off * 60000;
    var off2 = seoulOffsetMin(utc);
    if (off2 !== off) { off = off2; utc = wall - off * 60000; }
    return { utc: utc, offsetMin: off };
  }

  /* ---------- 음력 ---------- */
  var dangi = null;
  try {
    dangi = new Intl.DateTimeFormat('en-u-ca-dangi', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' });
    if (dangi.resolvedOptions().calendar !== 'dangi') dangi = null;
  } catch (e) { dangi = null; }
  function solarToLunar(y, m, d) {
    if (!dangi) return null;
    var o = {};
    dangi.formatToParts(new Date(Date.UTC(y, m - 1, d))).forEach(function (p) { o[p.type] = p.value; });
    var ly = +(o.relatedYear || o.year), mm = String(o.month);
    if (!ly || !parseInt(mm, 10)) return null;
    return { y: ly, m: parseInt(mm, 10), d: +o.day, leap: /[^0-9]/.test(mm) };
  }
  function lunarToSolar(ly, lm, ld, leap) {
    if (!dangi) return null;
    var t = Date.UTC(ly, 0, 15);
    for (var i = 0; i < 430; i++, t += 864e5) {
      var dt = new Date(t), l = solarToLunar(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
      if (l && l.y === ly && l.m === lm && l.d === ld && l.leap === !!leap) return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
    }
    return null;
  }

  /* ---------- 간지 ---------- */
  function dayGanzi(y, m, d) { return ganziOf(Math.round(Date.UTC(y, m - 1, d) / 864e5) + 2440588 + 49); }
  function yearGanzi(y) { return ganziOf(y - 4); }
  function hourBranch(h, mi) { return Math.floor((h * 60 + mi + 60) / 120) % 12; }

  /*
   * in: { y, m, d, h, mi, unknownTime, calendar:'solar'|'lunar', leap, gender:'M'|'F', lon, correction:'solar'|'none', jasi:'next'|'yaja' }
   */
  function calc(inp) {
    var sol = { y: inp.y, m: inp.m, d: inp.d };
    if (inp.calendar === 'lunar') {
      sol = lunarToSolar(inp.y, inp.m, inp.d, inp.leap);
      if (!sol) return { error: '해당 음력 날짜를 찾지 못했습니다. 윤달 여부와 날짜를 다시 확인해 주세요.' };
    }
    var chk = new Date(Date.UTC(sol.y, sol.m - 1, sol.d));
    if (chk.getUTCMonth() + 1 !== sol.m || chk.getUTCDate() !== sol.d) return { error: '없는 날짜입니다.' };
    if (sol.y < 1900 || sol.y > 2100) return { error: '1900년부터 2100년까지 계산할 수 있습니다.' };

    var unknown = !!inp.unknownTime;
    var h = unknown ? 12 : inp.h, mi = unknown ? 0 : inp.mi;
    var w = wallToUtc(sol.y, sol.m, sol.d, h, mi);
    var utc = w.utc;

    // 년주 · 월주 (절입 시각 기준)
    var ipchun = termUtc(sol.y, 2);
    var sajuYear = utc >= ipchun ? sol.y : sol.y - 1;
    var yp = yearGanzi(sajuYear);
    var jeol = aroundTerm(utc, true);
    var mb = (jeol.prev.k / 2 + 1) % 12;
    var mp = { s: mod((yp.s % 5) * 2 + 2 + mod(mb - 2, 12), 10), b: mb };

    // 일주 · 시주 (지역 평균태양시 보정)
    var useSolar = inp.correction !== 'none' && !unknown;
    var lon = inp.lon || 126.98;
    var localMs = useSolar ? utc + Math.round(lon * 4 * 60000) : Date.UTC(sol.y, sol.m - 1, sol.d, h, mi);
    var L = new Date(localMs);
    var lh = L.getUTCHours(), lmi = L.getUTCMinutes();
    var dp = dayGanzi(L.getUTCFullYear(), L.getUTCMonth() + 1, L.getUTCDate());
    var hp = null, lateJa = false;
    if (!unknown) {
      var hb = hourBranch(lh, lmi);
      lateJa = lh >= 23;
      var nextDay = ganziOf(ganziIndex(dp.s, dp.b) + 1);
      var baseStem = dp.s;
      if (lateJa) { baseStem = nextDay.s; if (inp.jasi !== 'yaja') dp = nextDay; }
      hp = { s: mod((baseStem % 5) * 2 + hb, 10), b: hb };
    }

    // 절입 시각 근접 여부
    var nearMin = Math.min(Math.abs(utc - jeol.prev.utc), Math.abs(jeol.next.utc - utc)) / 60000;
    var boundaryDay = false;
    if (unknown) {
      var ds = wallToUtc(sol.y, sol.m, sol.d, 0, 0).utc, de = ds + 864e5;
      boundaryDay = (jeol.prev.utc >= ds && jeol.prev.utc < de) || (jeol.next.utc >= ds && jeol.next.utc < de);
    }

    var res = {
      input: inp, solar: sol, lunar: solarToLunar(sol.y, sol.m, sol.d), utc: utc, offsetMin: w.offsetMin,
      unknownTime: unknown, corrected: useSolar, localTime: { h: lh, mi: lmi }, correctionMin: useSolar ? Math.round((localMs - Date.UTC(sol.y, sol.m - 1, sol.d, h, mi)) / 60000) : 0,
      lateJa: lateJa, sajuYear: sajuYear, pillars: [yp, mp, dp, hp], jeol: jeol, term: aroundTerm(utc, false),
      nearBoundaryMin: nearMin, boundaryDay: boundaryDay, gender: inp.gender
    };
    analyze(res);
    return res;
  }

  /* ---------- 분석 ---------- */
  var STEM_HAP = { '0-5': 2, '1-6': 3, '2-7': 4, '3-8': 0, '4-9': 1 };
  var YUKHAP = { '0-1': 2, '2-11': 0, '3-10': 1, '4-9': 3, '5-8': 4, '6-7': 1 };
  var SAMHAP = [[8, 0, 4, 4], [11, 3, 7, 0], [2, 6, 10, 1], [5, 9, 1, 3]];
  var BANGHAP = [[2, 3, 4, 0], [5, 6, 7, 1], [8, 9, 10, 3], [11, 0, 1, 4]];
  var HAE = ['0-7', '1-6', '2-5', '3-4', '8-11', '9-10'];
  var WONJIN = ['0-7', '1-6', '2-9', '3-8', '4-11', '5-10'];
  var PA = ['0-9', '1-4', '2-11', '3-6', '5-8', '7-10'];
  var HYEONG = ['2-5', '5-8', '2-8', '1-10', '7-10', '1-7', '0-3'];
  function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }

  // 두 지지의 관계 목록
  function branchRel(a, b) {
    var out = [], k = key(a, b);
    if (a === b) { out.push(a === 4 || a === 6 || a === 9 || a === 11 ? '자형' : '같은 지지'); return out; }
    if (mod(a - b, 12) === 6) out.push('충');
    if (YUKHAP[k] !== undefined) out.push('육합');
    SAMHAP.forEach(function (t) { if (t.indexOf(a) >= 0 && t.indexOf(a) < 3 && t.indexOf(b) >= 0 && t.indexOf(b) < 3) out.push('반합'); });
    if (HYEONG.indexOf(k) >= 0) out.push('형');
    if (PA.indexOf(k) >= 0) out.push('파');
    if (HAE.indexOf(k) >= 0) out.push('해');
    if (WONJIN.indexOf(k) >= 0) out.push('원진');
    return out;
  }
  function stemRel(a, b) {
    var k = key(a, b);
    if (STEM_HAP[k] !== undefined) return '합';
    if (Math.abs(a - b) === 6) return '충';
    return null;
  }

  var CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [2, 6], [5, 3], [5, 3]];
  var MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
  var YANGIN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
  var GOEGANG = [16, 46, 28, 34];           // 庚辰 庚戌 壬辰 戊戌
  var BAEKHO = [40, 31, 22, 13, 4, 58, 49]; // 甲辰 乙未 丙戌 丁丑 戊辰 壬戌 癸丑
  var WOLDEOK = [8, 6, 2, 0];               // 월지 삼합 그룹(수·금·화·목 국)별 천간
  function samGroup(b) { return b % 4; }    // 0 申子辰, 1 巳酉丑, 2 寅午戌, 3 亥卯未
  var YEOKMA = [2, 11, 8, 5], DOHWA = [9, 6, 3, 0], HWAGAE = [4, 1, 10, 7];

  function analyze(r) {
    var P = r.pillars, day = P[2].s, i;
    // 십신 · 12운성 · 지장간
    r.cells = P.map(function (p, idx) {
      if (!p) return null;
      return {
        s: p.s, b: p.b,
        stemTen: idx === 2 ? null : tenGod(day, p.s),
        branchTen: tenGod(day, mainStem(p.b)),
        hidden: HIDDEN[p.b].map(function (hs) { return { s: hs, ten: tenGod(day, hs) }; }),
        stage: stage(day, p.b),
        selfStage: stage(p.s, p.b)
      };
    });

    // 오행 분포
    var cnt = [0, 0, 0, 0, 0], ten = [0, 0, 0, 0, 0], total = 0;
    P.forEach(function (p, idx) {
      if (!p) return;
      cnt[stemEl(p.s)]++; cnt[BR_EL[p.b]]++; total += 2;
      if (idx !== 2) ten[Math.floor(tenGod(day, p.s) / 2)]++;
      ten[Math.floor(tenGod(day, mainStem(p.b)) / 2)]++;
    });
    r.elements = cnt; r.elementTotal = total; r.tenGroups = ten;
    r.yinYang = { yang: 0, yin: 0 };
    P.forEach(function (p) { if (!p) return; r.yinYang[stemYang(p.s) ? 'yang' : 'yin']++; r.yinYang[p.b % 2 === 0 ? 'yang' : 'yin']++; });

    // 신강 · 신약 (간이)
    var W = [[1, 1], [1, 3], [0, 1.5], [1, 1]], sup = 0, all = 0, de = stemEl(day);
    P.forEach(function (p, idx) {
      if (!p) return;
      function add(el, w) { if (!w) return; all += w; var rel = mod(el - de, 5); if (rel === 0 || rel === 4) sup += w; }
      add(stemEl(p.s), W[idx][0]); add(BR_EL[p.b], W[idx][1]);
    });
    var ratio = all ? sup / all : 0.5;
    r.strength = { ratio: ratio, label: ratio >= 0.6 ? '신강' : ratio >= 0.5 ? '중화(약간 강함)' : ratio >= 0.4 ? '중화(약간 약함)' : '신약', strong: ratio >= 0.5,
      deukryeong: (function () { var rel = mod(BR_EL[P[1].b] - de, 5); return rel === 0 || rel === 4; })() };
    // 억부 기준 보완 오행
    r.helpEls = r.strength.strong ? [mod(de + 1, 5), mod(de + 2, 5), mod(de + 3, 5)] : [mod(de + 4, 5), de];
    r.lackEls = []; r.manyEls = [];
    for (i = 0; i < 5; i++) { if (cnt[i] === 0) r.lackEls.push(i); if (cnt[i] >= 3) r.manyEls.push(i); }

    // 합 · 충 · 형
    var rel = [], a, b;
    for (a = 0; a < 4; a++) for (b = a + 1; b < 4; b++) {
      if (!P[a] || !P[b]) continue;
      var sr = stemRel(P[a].s, P[b].s);
      if (sr) rel.push({ kind: '천간' + sr, a: a, b: b, text: STEM_H[P[a].s] + STEM_H[P[b].s] + ' ' + sr, el: sr === '합' ? STEM_HAP[key(P[a].s, P[b].s)] : null });
      branchRel(P[a].b, P[b].b).forEach(function (n) {
        if (n === '같은 지지') return;
        rel.push({ kind: n, a: a, b: b, text: BR_H[P[a].b] + BR_H[P[b].b] + ' ' + n, el: n === '육합' ? YUKHAP[key(P[a].b, P[b].b)] : null });
      });
    }
    var bs = P.filter(Boolean).map(function (p) { return p.b; });
    SAMHAP.forEach(function (t) { if (bs.indexOf(t[0]) >= 0 && bs.indexOf(t[1]) >= 0 && bs.indexOf(t[2]) >= 0) rel.push({ kind: '삼합', text: BR_H[t[0]] + BR_H[t[1]] + BR_H[t[2]] + ' 삼합', el: t[3] }); });
    BANGHAP.forEach(function (t) { if (bs.indexOf(t[0]) >= 0 && bs.indexOf(t[1]) >= 0 && bs.indexOf(t[2]) >= 0) rel.push({ kind: '방합', text: BR_H[t[0]] + BR_H[t[1]] + BR_H[t[2]] + ' 방합', el: t[3] }); });
    r.relations = rel;

    // 신살
    var ss = [];
    function mark(name, idx) { var f = null; ss.forEach(function (x) { if (x.name === name) f = x; }); if (!f) { f = { name: name, at: [] }; ss.push(f); } if (f.at.indexOf(idx) < 0) f.at.push(idx); }
    var dayIdx = ganziIndex(P[2].s, P[2].b), gmStart = dayIdx - dayIdx % 10, gm = [(gmStart + 10) % 12, (gmStart + 11) % 12];
    r.gongmang = gm;
    P.forEach(function (p, idx) {
      if (!p) return;
      if (CHEONEUL[day].indexOf(p.b) >= 0) mark('천을귀인', idx);
      if (MUNCHANG[day] === p.b) mark('문창귀인', idx);
      if (YANGIN[day] === p.b) mark('양인', idx);
      if (BAEKHO.indexOf(ganziIndex(p.s, p.b)) >= 0) mark('백호', idx);
      if (idx !== 2 && gm.indexOf(p.b) >= 0) mark('공망', idx);
      if (WOLDEOK[samGroup(P[1].b)] === p.s) mark('월덕귀인', idx);
      [0, 2].forEach(function (base) {
        if (idx === base || !P[base]) return;
        var grp = samGroup(P[base].b);
        if (YEOKMA[grp] === p.b) mark('역마', idx);
        if (DOHWA[grp] === p.b) mark('도화', idx);
        if (HWAGAE[grp] === p.b) mark('화개', idx);
      });
    });
    if (GOEGANG.indexOf(dayIdx) >= 0) mark('괴강', 2);
    r.sinsal = ss;

    // 대운
    if (r.gender === 'M' || r.gender === 'F') {
      var fwd = stemYang(P[0].s) === (r.gender === 'M');
      var target = fwd ? r.jeol.next.utc : r.jeol.prev.utc;
      var days = Math.abs(target - r.utc) / 864e5;
      var num = Math.round(days / 3); if (num < 1) num = 1; if (num > 10) num = 10;
      var mIdx = ganziIndex(P[1].s, P[1].b), list = [];
      for (i = 1; i <= 10; i++) {
        var gz = ganziOf(mIdx + (fwd ? i : -i)), age = num + (i - 1) * 10;
        list.push({ s: gz.s, b: gz.b, age: age, year: r.solar.y + age, stemTen: tenGod(day, gz.s), branchTen: tenGod(day, mainStem(gz.b)), stage: stage(day, gz.b) });
      }
      r.daeun = { forward: fwd, num: num, days: days, exactYears: days / 3, list: list };
    }
  }

  // 특정 연도의 세운
  function yearLuck(dayStem, y) {
    var p = yearGanzi(y);
    return { y: y, s: p.s, b: p.b, stemTen: tenGod(dayStem, p.s), branchTen: tenGod(dayStem, mainStem(p.b)), stage: stage(dayStem, p.b) };
  }
  // 오늘(서울) 날짜
  function todaySeoul(offsetDays) {
    var p = seoulParts(Date.now() + (offsetDays || 0) * 864e5);
    return { y: p.y, m: p.m, d: p.d, h: p.h, mi: p.mi };
  }

  g.Saju = {
    EL: EL, EL_H: EL_H, STEM_H: STEM_H, STEM_K: STEM_K, BR_H: BR_H, BR_K: BR_K, BR_EL: BR_EL, ANIMAL: ANIMAL, HIDDEN: HIDDEN,
    TEN: TEN, TEN_GROUP: TEN_GROUP, STAGE: STAGE, TERMS: TERMS, PILLAR_NAME: PILLAR_NAME, CITIES: CITIES,
    mod: mod, stemEl: stemEl, stemYang: stemYang, mainStem: mainStem, ganziIndex: ganziIndex, ganziOf: ganziOf, gzH: gzH, gzK: gzK,
    tenGod: tenGod, stage: stage, termUtc: termUtc, termsOfYear: termsOfYear, aroundTerm: aroundTerm,
    seoulParts: seoulParts, wallToUtc: wallToUtc, solarToLunar: solarToLunar, lunarToSolar: lunarToSolar, hasLunar: function () { return !!dangi; },
    dayGanzi: dayGanzi, yearGanzi: yearGanzi, hourBranch: hourBranch, branchRel: branchRel, stemRel: stemRel,
    stemHapEl: function (a, b) { return STEM_HAP[key(a, b)]; },
    calc: calc, yearLuck: yearLuck, todaySeoul: todaySeoul
  };
})(typeof window !== 'undefined' ? window : globalThis);
