/* 공통: 밝기 전환, 메뉴, 입력 폼, 저장된 내 사주 */
(function () {
  'use strict';
  var root = document.documentElement;
  var SITE = '명리서재';

  // 밝기
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'light' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)) root.setAttribute('data-theme', 'light');
  function toggleTheme() {
    var light = root.getAttribute('data-theme') === 'light';
    if (light) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    try { localStorage.setItem('theme', light ? 'dark' : 'light'); } catch (e) {}
  }

  var MENU = [
    { href: 'saju.html', ic: '命', name: '사주풀이', desc: '만세력으로 내 사주 여덟 글자 보기', tab: '사주' },
    { href: 'today.html', ic: '日', name: '오늘의 운세', desc: '오늘 일진과 한 주의 흐름', tab: '오늘' },
    { href: 'match.html', ic: '合', name: '궁합', desc: '두 사람의 일주 궁합', tab: '궁합' },
    { href: 'ilju.html', ic: '柱', name: '일주 사전', desc: '육십갑자 60가지 일주 풀이', tab: '일주' },
    { href: 'guide.html', ic: '學', name: '명리 기초', desc: '오행·십신·합충·용어 사전' },
    { href: 'board.html', ic: '談', name: '게시판', desc: '자유롭게 글 남기기' }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function build() {
    var path = location.pathname.split('/').pop() || 'index.html';
    function on(h) { return h === path ? ' on' : ''; }

    var bg = el('div', 'aurora'); bg.appendChild(el('i')); document.body.insertBefore(bg, document.body.firstChild);

    var head = el('header', 'site-head');
    head.innerHTML = '<div class="bar"><a class="logo" href="./"><span class="seal">命</span>' + SITE + '</a>' +
      '<nav class="gnb" aria-label="주 메뉴">' + MENU.map(function (m) { return '<a class="' + on(m.href).trim() + '" href="' + m.href + '">' + m.name + '</a>'; }).join('') + '</nav>' +
      '<div class="head-tools"><button class="icon-btn" id="themeBtn" type="button" aria-label="밝기 전환" title="밝기 전환">◐</button>' +
      '<button id="menuBtn" type="button" aria-haspopup="dialog">메뉴</button></div></div>';
    document.body.insertBefore(head, bg.nextSibling);

    var sheet = el('div', 'sheet'); sheet.id = 'sheet';
    sheet.innerHTML = '<div class="sheet-panel" role="dialog" aria-label="전체 메뉴"><div class="grab"></div><h4>바로 보기</h4>' +
      '<a class="item' + on('index.html') + '" href="./"><span class="ic">家</span><span><b>홈</b><small>오늘의 일진과 빠른 사주 보기</small></span></a>' +
      MENU.slice(0, 3).map(item).join('') + '<h4>읽을거리</h4>' + MENU.slice(3).map(item).join('') + '</div>';
    function item(m) { return '<a class="item' + on(m.href) + '" href="' + m.href + '"><span class="ic">' + m.ic + '</span><span><b>' + m.name + '</b><small>' + m.desc + '</small></span></a>'; }
    document.body.appendChild(sheet);

    var tab = el('nav', 'tabbar'); tab.setAttribute('aria-label', '빠른 메뉴');
    tab.innerHTML = '<a class="' + on('index.html').trim() + '" href="./"><span class="ic">家</span>홈</a>' +
      MENU.slice(0, 4).map(function (m) { return '<a class="' + on(m.href).trim() + '" href="' + m.href + '"><span class="ic">' + m.ic + '</span>' + m.tab + '</a>'; }).join('') +
      '<button type="button" id="tabMore"><span class="ic">≡</span>전체</button>';
    document.body.appendChild(tab);

    var foot = el('footer', 'site-foot');
    foot.innerHTML = '<div class="wrap"><div class="foot-grid"><div><div class="logo"><span class="seal">命</span>' + SITE + '</div></div>' +
      '<div class="foot-links">' + MENU.map(function (m) { return '<a href="' + m.href + '">' + m.name + '</a>'; }).join('') + '</div></div>' +
      '<p class="foot-note">이곳의 풀이는 전통 명리 이론을 바탕으로 한 참고 자료입니다. 중요한 결정은 스스로의 판단과 전문가의 조언을 따르시기 바랍니다. 입력한 생년월일은 서버로 보내지 않고 이 기기 안에서만 계산·저장합니다.</p>' +
      '<p class="foot-note">' + SITE + ' · 2026</p></div>';
    document.body.appendChild(foot);

    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    function setSheet(open) { sheet.classList.toggle('open', open); }
    document.getElementById('menuBtn').addEventListener('click', function () { setSheet(true); });
    document.getElementById('tabMore').addEventListener('click', function () { setSheet(true); });
    sheet.addEventListener('click', function (ev) { if (ev.target === sheet) setSheet(false); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') setSheet(false); });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);

  /* ---------- 저장된 내 사주 ---------- */
  function getProfile() {
    try { var v = JSON.parse(localStorage.getItem('saju.profile') || 'null'); return v && v.y ? v : null; } catch (e) { return null; }
  }
  function saveProfile(p) { try { localStorage.setItem('saju.profile', JSON.stringify(p)); return true; } catch (e) { return false; } }
  function clearProfile() { try { localStorage.removeItem('saju.profile'); } catch (e) {} }

  /* ---------- 주소 ↔ 입력값 ---------- */
  function toQuery(v) {
    var q = [];
    if (v.name) q.push('n=' + encodeURIComponent(v.name));
    if (v.gender) q.push('g=' + v.gender);
    q.push('c=' + (v.calendar === 'lunar' ? (v.leap ? 'll' : 'l') : 's'));
    q.push('y=' + v.y, 'm=' + v.m, 'd=' + v.d);
    q.push('t=' + (v.unknownTime ? 'x' : (v.h < 10 ? '0' : '') + v.h + (v.mi < 10 ? '0' : '') + v.mi));
    if (v.lon && Math.abs(v.lon - 126.98) > 0.001) q.push('lon=' + v.lon);
    if (v.correction === 'none') q.push('k=n');
    if (v.jasi === 'yaja') q.push('j=y');
    return q.join('&');
  }
  function fromQuery(search) {
    var o = {};
    (search || location.search).replace(/^\?/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); });
    if (!o.y || !o.m || !o.d) return null;
    var v = { name: (o.n || '').slice(0, 20), gender: o.g === 'M' || o.g === 'F' ? o.g : '', calendar: o.c && o.c.charAt(0) === 'l' ? 'lunar' : 'solar', leap: o.c === 'll',
      y: parseInt(o.y, 10), m: parseInt(o.m, 10), d: parseInt(o.d, 10), unknownTime: !o.t || o.t === 'x', h: 12, mi: 0,
      lon: parseFloat(o.lon) || 126.98, correction: o.k === 'n' ? 'none' : 'solar', jasi: o.j === 'y' ? 'yaja' : 'next' };
    if (!v.unknownTime && /^\d{4}$/.test(o.t)) { v.h = Math.min(23, +o.t.slice(0, 2)); v.mi = Math.min(59, +o.t.slice(2)); } else v.unknownTime = true;
    if (!(v.y > 0 && v.m > 0 && v.d > 0)) return null;
    return v;
  }

  /* ---------- 생년월일 입력 폼 ---------- */
  var formSeq = 0;
  // opts: { name, advanced, submit, value }
  function birthForm(box, opts) {
    opts = opts || {};
    var id = 'bf' + (++formSeq), S = window.Saju;
    var h = '';
    if (opts.name !== false) h += '<label class="field"><span>이름 <span class="opt">(선택)</span></span><input type="text" data-k="name" maxlength="20" autocomplete="off" placeholder="' + (opts.namePlaceholder || '별명도 괜찮습니다') + '"></label>';
    h += '<div class="row c2"><div class="field"><span>성별</span><div class="seg"><label><input type="radio" name="' + id + 'g" value="M"><span>남</span></label><label><input type="radio" name="' + id + 'g" value="F"><span>여</span></label></div></div>' +
      '<div class="field"><span>달력</span><div class="seg"><label><input type="radio" name="' + id + 'c" value="solar" checked><span>양력</span></label><label><input type="radio" name="' + id + 'c" value="lunar"><span>음력</span></label></div></div></div>';
    h += '<div class="field"><span>생년월일</span><div class="row ymd"><input type="number" data-k="y" inputmode="numeric" min="1900" max="2100" placeholder="1990" aria-label="태어난 해">' +
      '<input type="number" data-k="m" inputmode="numeric" min="1" max="12" placeholder="월" aria-label="월"><input type="number" data-k="d" inputmode="numeric" min="1" max="31" placeholder="일" aria-label="일"></div>' +
      '<label class="check hide" data-k="leapBox"><input type="checkbox" data-k="leap">윤달입니다</label></div>';
    h += '<div class="field"><span>태어난 시각</span><div class="row c2"><input type="time" data-k="time" aria-label="태어난 시각"><label class="check"><input type="checkbox" data-k="unknown">시간을 모릅니다</label></div></div>';
    if (opts.advanced !== false) {
      h += '<details class="adv"><summary>세부 설정 (출생 지역 · 시간 보정)</summary><div class="form">' +
        '<label class="field"><span>출생 지역</span><select data-k="lon">' + S.CITIES.map(function (c) { return '<option value="' + c.lon + '">' + c.name + '</option>'; }).join('') + '</select></label>' +
        '<div class="field"><span>시간 보정</span><div class="seg"><label><input type="radio" name="' + id + 'k" value="solar" checked><span>지역 태양시 보정</span></label><label><input type="radio" name="' + id + 'k" value="none"><span>시계 시각 그대로</span></label></div></div>' +
        '<div class="field"><span>밤 11시 이후 출생</span><div class="seg"><label><input type="radio" name="' + id + 'j" value="next" checked><span>다음 날 일주로</span></label><label><input type="radio" name="' + id + 'j" value="yaja"><span>야자시 (당일 유지)</span></label></div></div>' +
        '<p class="small muted" style="margin:0">한국 표준시는 동경 135도 기준이라 실제 태양시보다 약 30분 빠릅니다. 보정을 켜면 출생 지역의 경도에 맞춰 시주를 정합니다. 과거의 표준시 변경과 서머타임은 자동으로 반영합니다.</p></div></details>';
    }
    h += '<div class="msg" data-k="msg" role="alert"></div>';
    if (opts.submit !== false) h += '<button class="btn main block" type="submit">' + (opts.submit || '사주 보기') + '</button>';
    var form = el('form', 'form'); form.noValidate = true; form.innerHTML = h;
    box.appendChild(form);

    function q(k) { return form.querySelector('[data-k="' + k + '"]'); }
    function radio(n) { var r = form.querySelector('input[name="' + id + n + '"]:checked'); return r ? r.value : ''; }
    function setRadio(n, v) { var r = form.querySelector('input[name="' + id + n + '"][value="' + v + '"]'); if (r) r.checked = true; }
    function syncCal() { q('leapBox').classList.toggle('hide', radio('c') !== 'lunar'); }
    function syncTime() { q('time').disabled = q('unknown').checked; }
    form.addEventListener('change', function () { syncCal(); syncTime(); });
    // 자릿수가 차면 다음 칸으로
    q('y').addEventListener('input', function () { if (this.value.length >= 4) q('m').focus(); });
    q('m').addEventListener('input', function () { if (this.value.length >= 2 || +this.value > 1) q('d').focus(); });

    function set(v) {
      if (!v) return;
      if (q('name')) q('name').value = v.name || '';
      if (v.gender) setRadio('g', v.gender);
      setRadio('c', v.calendar === 'lunar' ? 'lunar' : 'solar');
      q('leap').checked = !!v.leap;
      q('y').value = v.y || ''; q('m').value = v.m || ''; q('d').value = v.d || '';
      q('unknown').checked = !!v.unknownTime;
      q('time').value = v.unknownTime ? '' : ((v.h < 10 ? '0' : '') + v.h + ':' + (v.mi < 10 ? '0' : '') + v.mi);
      if (q('lon')) {
        var best = 0, opts2 = q('lon').options;
        for (var i = 0; i < opts2.length; i++) if (Math.abs(+opts2[i].value - (v.lon || 126.98)) < Math.abs(+opts2[best].value - (v.lon || 126.98))) best = i;
        q('lon').selectedIndex = best;
        setRadio('k', v.correction === 'none' ? 'none' : 'solar'); setRadio('j', v.jasi === 'yaja' ? 'yaja' : 'next');
      }
      syncCal(); syncTime();
    }
    function get() {
      var msg = q('msg'); msg.textContent = '';
      var v = { name: q('name') ? q('name').value.trim() : '', gender: radio('g'), calendar: radio('c') || 'solar', leap: q('leap').checked,
        y: parseInt(q('y').value, 10), m: parseInt(q('m').value, 10), d: parseInt(q('d').value, 10), unknownTime: q('unknown').checked, h: 12, mi: 0,
        lon: q('lon') ? +q('lon').value : 126.98, correction: q('lon') ? radio('k') : 'solar', jasi: q('lon') ? radio('j') : 'next' };
      if (v.calendar !== 'lunar') v.leap = false;
      function fail(t, k) { msg.textContent = t; if (k) q(k).focus(); return null; }
      if (opts.requireGender !== false && !v.gender) return fail('성별을 선택해 주세요. 대운의 방향을 정하는 데 필요합니다.');
      if (!(v.y >= 1900 && v.y <= 2100)) return fail('태어난 해를 1900~2100 사이로 입력해 주세요.', 'y');
      if (!(v.m >= 1 && v.m <= 12)) return fail('월을 1~12 사이로 입력해 주세요.', 'm');
      if (!(v.d >= 1 && v.d <= 31)) return fail('일을 1~31 사이로 입력해 주세요.', 'd');
      if (v.calendar === 'lunar' && !S.hasLunar()) return fail('이 브라우저에서는 음력 변환을 지원하지 않습니다. 양력으로 입력해 주세요.');
      if (!v.unknownTime) {
        var t = q('time').value;
        if (!/^\d{2}:\d{2}/.test(t)) return fail('태어난 시각을 입력하거나 "시간을 모릅니다"를 선택해 주세요.', 'time');
        v.h = +t.slice(0, 2); v.mi = +t.slice(3, 5);
      }
      return v;
    }
    function showError(t) { q('msg').textContent = t || ''; }
    if (opts.value) set(opts.value); else { syncCal(); syncTime(); }
    return { form: form, get: get, set: set, showError: showError };
  }

  /* ---------- 표시 도우미 ---------- */
  function gzTile(type, idx, sub) {
    var S = window.Saju;
    if (idx === null || idx === undefined) return '<div class="gz empty"><b>?</b><span>모름</span></div>';
    var isStem = type === 's', elIdx = isStem ? S.stemEl(idx) : S.BR_EL[idx];
    return '<div class="gz el-' + elIdx + '"><b>' + (isStem ? S.STEM_H[idx] : S.BR_H[idx]) + '</b><span>' + (isStem ? S.STEM_K[idx] : S.BR_K[idx]) + ' · ' + (sub || S.EL[elIdx]) + '</span></div>';
  }
  function miniGz(p) {
    var S = window.Saju;
    return '<span class="mini-gz"><span class="gz-inline el-' + S.stemEl(p.s) + '">' + S.STEM_H[p.s] + '</span><span class="gz-inline el-' + S.BR_EL[p.b] + '">' + S.BR_H[p.b] + '</span></span>';
  }
  function fmtKst(utc) {
    var p = window.Saju.seoulParts(utc);
    return p.m + '월 ' + p.d + '일 ' + (p.h < 10 ? '0' : '') + p.h + ':' + (p.mi < 10 ? '0' : '') + p.mi;
  }

  window.SajuSite = { SITE: SITE, el: el, esc: esc, getProfile: getProfile, saveProfile: saveProfile, clearProfile: clearProfile,
    toQuery: toQuery, fromQuery: fromQuery, birthForm: birthForm, gzTile: gzTile, miniGz: miniGz, fmtKst: fmtKst };
})();
