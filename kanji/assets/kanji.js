/* ============================================================
   TENGOKU — KAMUS KANJI
   ------------------------------------------------------------
   Sumber data (semua gratis & tanpa API key):
   • kanji-data (davidluzgouveia) : daftar kanji + level JLPT N5–N1,
                                    arti, kunyomi, onyomi, jumlah goresan
   • KanjiVG                      : data SVG urutan goresan
   • kanjiapi.dev                 : contoh kata (JMdict) & cadangan data kanji
   • Google Input Tools           : pengenalan tulisan tangan
   • MyMemory                     : terjemahan otomatis Inggris → Indonesia
   ============================================================ */
(() => {
'use strict';

/* ---------- 0. Konfigurasi ---------- */
const CFG = {
  kanjiData: [
    'https://cdn.jsdelivr.net/gh/davidluzgouveia/kanji-data@master/kanji.json',
    'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json'
  ],
  kanjiApi: 'https://kanjiapi.dev/v1',
  kanjivg: hex => [
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`,
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`
  ],
  translate: 'https://api.mymemory.translated.net/get',
  handwriting: [
    'https://inputtools.google.com/request?itc=ja-t-i0-handwrit&app=demopage',
    'https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8'
  ],
  knownKey: 'tengoku_kanji_known'
};

/* ============================================================
   1. UTIL KANA / ROMAJI  (murni, tanpa DOM)
   ============================================================ */
const KANA_PAIRS =
  'a:あ i:い u:う e:え o:お ' +
  'ka:か ki:き ku:く ke:け ko:こ ' +
  'sa:さ shi:し si:し su:す se:せ so:そ ' +
  'ta:た chi:ち ti:ち tsu:つ tu:つ te:て to:と ' +
  'na:な ni:に nu:ぬ ne:ね no:の ' +
  'ha:は hi:ひ fu:ふ hu:ふ he:へ ho:ほ ' +
  'ma:ま mi:み mu:む me:め mo:も ' +
  'ya:や yu:ゆ yo:よ ' +
  'ra:ら ri:り ru:る re:れ ro:ろ ' +
  'wa:わ wo:を n:ん ' +
  'ga:が gi:ぎ gu:ぐ ge:げ go:ご ' +
  'za:ざ ji:じ zi:じ zu:ず ze:ぜ zo:ぞ ' +
  'da:だ di:ぢ du:づ de:で do:ど ' +
  'ba:ば bi:び bu:ぶ be:べ bo:ぼ ' +
  'pa:ぱ pi:ぴ pu:ぷ pe:ぺ po:ぽ ' +
  'kya:きゃ kyu:きゅ kyo:きょ sha:しゃ shu:しゅ sho:しょ sya:しゃ syu:しゅ syo:しょ ' +
  'cha:ちゃ chu:ちゅ cho:ちょ tya:ちゃ tyu:ちゅ tyo:ちょ cya:ちゃ cyu:ちゅ cyo:ちょ ' +
  'nya:にゃ nyu:にゅ nyo:にょ hya:ひゃ hyu:ひゅ hyo:ひょ mya:みゃ myu:みゅ myo:みょ ' +
  'rya:りゃ ryu:りゅ ryo:りょ gya:ぎゃ gyu:ぎゅ gyo:ぎょ ' +
  'ja:じゃ ju:じゅ jo:じょ jya:じゃ jyu:じゅ jyo:じょ zya:じゃ zyu:じゅ zyo:じょ ' +
  'bya:びゃ byu:びゅ byo:びょ pya:ぴゃ pyu:ぴゅ pyo:ぴょ';

const R2H = {};   // romaji  -> hiragana
const H2R = {};   // hiragana -> romaji (ejaan Hepburn, entri pertama menang)
KANA_PAIRS.split(' ').forEach(p => {
  const [r, h] = p.split(':');
  R2H[r] = h;
  if (!(h in H2R)) H2R[h] = r;
});

const toHira = s => String(s || '').replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const isKanji = c => /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(c);

function romajiToHira(input){
  const s = String(input || '').toLowerCase()
    .replace(/[āâ]/g, 'aa').replace(/[īî]/g, 'ii').replace(/[ūû]/g, 'uu')
    .replace(/[ēê]/g, 'ee').replace(/[ōô]/g, 'ou');
  let out = '', i = 0;
  while (i < s.length){
    const c = s[i];
    if (c === ' ' || c === '-' || c === '.' || c === "'" ){ i++; continue; }
    if (i + 1 < s.length && c === s[i + 1] && /[bcdfghjkmpqrstvwxyz]/.test(c)){ out += 'っ'; i++; continue; }
    if (c === 't' && s.substr(i, 3) === 'tch'){ out += 'っ'; i++; continue; }
    if (c === 'n'){
      const n1 = s[i + 1], n2 = s[i + 2];
      if (n1 === undefined){ out += 'ん'; i++; continue; }
      if (n1 === "'"){ out += 'ん'; i += 2; continue; }
      if (n1 === 'n'){
        if (n2 && /[aiueoy]/.test(n2)){ out += 'ん'; i++; continue; }
        out += 'ん'; i += 2; continue;
      }
      if (!/[aiueoy]/.test(n1)){ out += 'ん'; i++; continue; }
    }
    let m = null;
    for (let len = 3; len >= 1; len--){
      const k = s.substr(i, len);
      if (R2H[k]){ m = k; break; }
    }
    if (!m) return null;
    out += R2H[m]; i += m.length;
  }
  return out;
}

function toRomaji(str){
  const h = toHira(str);
  let out = '', gem = false, i = 0;
  const put = r => {
    if (gem){ out += r.startsWith('ch') ? 't' : r[0]; gem = false; }
    out += r;
  };
  while (i < h.length){
    const c = h[i];
    if (c === 'っ'){ gem = true; i++; continue; }
    if (c === 'ー'){ const m = out.match(/[aiueo]$/); if (m) out += m[0]; i++; continue; }
    const two = h.substr(i, 2);
    if (H2R[two]){ put(H2R[two]); i += 2; continue; }
    if (H2R[c]){ put(H2R[c]); i++; continue; }
    out += c; i++;
  }
  return out;
}

/* ============================================================
   2. MODEL DATA & PENCARIAN  (murni, tanpa DOM)
   ============================================================ */
function indexRec(rec){
  rec._en = rec.en.map(s => s.toLowerCase());
  const seen = new Set();
  rec._rd = [];
  const add = h => { if (!h || seen.has(h)) return; seen.add(h); rec._rd.push({ h, r: toRomaji(h) }); };
  rec.on.forEach(r => add(toHira(r).replace(/[-.\s]/g, '')));
  rec.kun.forEach(r => {
    const h = toHira(r).replace(/[-\s]/g, '');
    add(h.replace(/\./g, ''));
    add(h.split('.')[0]);
  });
  return rec;
}

function makeRec(ch, v){
  return indexRec({
    ch,
    strokes: v.strokes ?? null,
    grade:   v.grade ?? null,
    freq:    v.freq ?? null,
    jlpt:    v.jlpt_new ?? null,           // 5 = N5 … 1 = N1
    en:      (v.meanings || []).map(String),
    on:      v.readings_on  || [],
    kun:     v.readings_kun || []
  });
}

function makeRecFromApi(j){
  return indexRec({
    ch: j.kanji, strokes: j.stroke_count ?? null, grade: j.grade ?? null, freq: null, jlpt: null,
    en: j.meanings || [], on: j.on_readings || [], kun: j.kun_readings || [], fromApi: true
  });
}

const LV_BONUS = { 5: 12, 4: 9, 3: 6, 2: 3, 1: 1 };
function popularity(r){
  let b = r.jlpt ? (LV_BONUS[r.jlpt] || 0) : 0;
  if (r.freq) b += 10 * (1 - Math.min(r.freq, 2500) / 2500);
  return b;
}
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Cari di daftar rec. Mengembalikan [{rec, score}] terurut dari yang paling mirip. */
function searchIn(list, q, level){
  const raw = String(q || '').trim();
  if (!raw) return [];
  const lower = raw.toLowerCase().replace(/\s+/g, ' ');
  const hasKana = /[\u3040-\u30ffー]/.test(raw);
  const ascii = /^[a-zA-ZāēīōūâêîôûĀĒĪŌŪ\s'.-]+$/.test(raw);
  const hira = hasKana
    ? toHira(raw.replace(/[^\u3040-\u30ffー]/g, ''))
    : (ascii ? romajiToHira(lower) : null);
  const rq = ascii
    ? lower.replace(/[āâ]/g, 'a').replace(/[īî]/g, 'i').replace(/[ūû]/g, 'u')
           .replace(/[ēê]/g, 'e').replace(/[ōô]/g, 'o').replace(/[^a-z]/g, '')
    : '';
  const tokens = ascii ? lower.split(' ').filter(Boolean) : [];
  const wordRe = ascii && lower.length >= 3 ? new RegExp('(^|[^a-z])' + escRe(lower) + '([^a-z]|$)') : null;

  const out = [];
  for (const rec of list){
    if (level && rec.jlpt !== level) continue;
    let s = 0;

    if (hira){
      for (const rd of rec._rd){
        if (rd.h === hira) s = Math.max(s, 100);
        else if (rd.h.startsWith(hira)) s = Math.max(s, 60 + 8 * hira.length / rd.h.length);
      }
    }
    if (rq){
      for (const rd of rec._rd){
        if (rd.r === rq) s = Math.max(s, 96);
        else if (rq.length >= 2 && rd.r.startsWith(rq)) s = Math.max(s, 56 + 8 * rq.length / rd.r.length);
      }
    }
    if (ascii){
      for (const m of rec._en){
        if (m === lower) s = Math.max(s, 92);
        else if (lower.length >= 3 && m.startsWith(lower)) s = Math.max(s, 68);
        else if (wordRe && wordRe.test(m)) s = Math.max(s, 62);
        else if (lower.length >= 4 && m.includes(lower)) s = Math.max(s, 40);
      }
      if (tokens.length > 1){
        const joined = rec._en.join(' ');
        if (tokens.every(t => joined.includes(t))) s = Math.max(s, 50);
      }
    }
    if (s > 0) out.push({ rec, score: s + popularity(rec) * (s >= 60 ? 1 : 0.5) });
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

/* dipakai untuk uji di luar browser */
if (typeof window !== 'undefined') window.__kanjiUtils = { romajiToHira, toRomaji, toHira, isKanji, makeRec, searchIn };

/* ============================================================
   3. UI  — hanya jalan di halaman yang punya #kamus
   ============================================================ */
const root = document.getElementById('kamus');
if (!root) return;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LEVELS = [5, 4, 3, 2, 1];

/* ---------- 3.1 Pemuatan data ---------- */
const S = { db: new Map(), list: [], byLevel: { 5: [], 4: [], 3: [], 2: [], 1: [] }, failed: false, extra: new Map() };

async function fetchJSON(urls){
  let err;
  for (const u of [].concat(urls)){
    try { const r = await fetch(u); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch (e){ err = e; }
  }
  throw err || new Error('fetch gagal');
}

S.ready = (async () => {
  try {
    const raw = await fetchJSON(CFG.kanjiData);
    for (const [ch, v] of Object.entries(raw)){
      if ([...ch].length !== 1) continue;
      const rec = makeRec(ch, v);
      S.db.set(ch, rec); S.list.push(rec);
    }
    S.list.sort((a, b) => (a.freq ?? 99999) - (b.freq ?? 99999));
    S.list.forEach(r => { if (r.jlpt >= 1 && r.jlpt <= 5) S.byLevel[r.jlpt].push(r); });
  } catch (e){
    S.failed = true;
    console.warn('[Kamus Kanji] gagal memuat data kanji', e);
  }
})();

async function getRec(ch){
  if (S.db.has(ch)) return S.db.get(ch);
  if (S.extra.has(ch)) return S.extra.get(ch);
  try {
    const j = await fetchJSON(`${CFG.kanjiApi}/kanji/${encodeURIComponent(ch)}`);
    const rec = makeRecFromApi(j);
    S.extra.set(ch, rec);
    return rec;
  } catch (e){ return null; }
}

/* ---------- 3.2 Terjemahan (cache di localStorage) ---------- */
const memCache = new Map();
async function translate(text, from, to){
  const key = `tk_tr_${from}${to}_${text}`;
  if (memCache.has(key)) return memCache.get(key);
  try { const c = localStorage.getItem(key); if (c){ memCache.set(key, c); return c; } } catch (e){}
  try {
    const j = await fetchJSON(`${CFG.translate}?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const t = j?.responseData?.translatedText;
    if (j?.responseStatus !== 200 || !t || /MYMEMORY|QUERY LENGTH|INVALID/i.test(t)) return null;
    memCache.set(key, t);
    try { localStorage.setItem(key, t); } catch (e){}
    return t;
  } catch (e){ return null; }
}
const idMeaning = rec => translate(rec.en.slice(0, 4).join(', '), 'en', 'id');

/* ---------- 3.3 Tampilan umum ---------- */
const lvLabel = r => r.jlpt ? `JLPT N${r.jlpt}` : 'Di luar JLPT';
const cleanKun = k => k.replace(/-/g, '');
const kunShow = (rec, n = 2) => rec.kun.slice(0, n).map(cleanKun).join('、');
const onShow  = (rec, n = 2) => rec.on.slice(0, n).join('、');

function kanjiCard(rec, selected){
  const rd = [kunShow(rec, 1), onShow(rec, 1)].filter(Boolean).join(' · ');
  return `<button type="button" class="kd-card${selected ? ' active' : ''}" data-ch="${esc(rec.ch)}">
    <span class="kd-card-ch jp">${esc(rec.ch)}</span>
    <span class="kd-card-body">
      <b>${esc(rec.en.slice(0, 2).join(', ') || '—')}</b>
      <small class="jp">${esc(rd || '—')}</small>
      <em>${rec.jlpt ? 'N' + rec.jlpt : 'non-JLPT'}${rec.strokes ? ' · ' + rec.strokes + ' goresan' : ''}</em>
    </span>
  </button>`;
}

/* ---------- 3.4 Tab ---------- */
const tabs = $$('.kd-tab', root);
function switchTab(name){
  tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  ['type', 'cat', 'draw'].forEach(n => { $('#kdPanel-' + n).hidden = n !== name; });
  $('#kdResults').hidden = !(name !== 'cat' && R.list !== null && R.tab === name);
  if (name === 'draw') pad.resize();
  if (name === 'cat') renderCategory(true);
}
tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

/* ---------- 3.5 Hasil pencarian (3 kanji terdekat) ---------- */
const R = { list: null, page: 0, label: '', tab: 'type', note: '' };
const resultsBox = $('#kdResults');

function showResults(recs, label, tab){
  R.list = recs; R.page = 0; R.label = label; R.tab = tab;
  renderResults();
}
function hideResults(){ R.list = null; resultsBox.hidden = true; resultsBox.innerHTML = ''; }
function renderResults(msg){
  resultsBox.hidden = false;
  if (msg){ resultsBox.innerHTML = `<p class="kd-status">${msg}</p>`; return; }
  if (!R.list || !R.list.length){
    resultsBox.innerHTML = `<p class="kd-status">Tidak ada kanji yang cocok. Coba tulis romaji lain, arti dalam bahasa Inggris, atau langsung ketik kanjinya.</p>`;
    return;
  }
  const pages = Math.ceil(R.list.length / 3);
  const slice = R.list.slice(R.page * 3, R.page * 3 + 3);
  const cur = $('.kd-detail-inner')?.dataset.current;
  resultsBox.innerHTML = `
    <div class="kd-res-head">
      <p class="kd-lbl">${esc(R.label)}</p>
      ${pages > 1 ? `<button type="button" class="kd-more" id="kdMore">3 hasil lainnya ↻ <span>${R.page + 1}/${pages}</span></button>` : ''}
    </div>
    <div class="kd-res-grid">${slice.map(r => kanjiCard(r, r.ch === cur)).join('')}</div>
    <p class="kd-res-tip">Pilih salah satu kanji untuk melihat arti, cara baca, contoh kata, dan urutan goresan.</p>`;
}
resultsBox.addEventListener('click', e => {
  if (e.target.closest('#kdMore')){
    R.page = (R.page + 1) % Math.ceil(R.list.length / 3);
    renderResults();
  }
});

/* ---------- 3.6 Tab 1 — Ketik ---------- */
const input = $('#kdInput');
let typeLevel = 0, seq = 0, typeTimer;

async function doTypeSearch(){
  const q = input.value.trim();
  const my = ++seq;
  if (!q){ hideResults(); return; }
  renderResults('Mencari…'); R.tab = 'type'; R.list = [];
  await S.ready;
  if (my !== seq) return;

  const kanjis = [...new Set([...q].filter(isKanji))];
  if (kanjis.length){
    const recs = (await Promise.all(kanjis.map(getRec))).filter(Boolean);
    if (my !== seq) return;
    showResults(recs, kanjis.length === 1 ? 'Kanji yang kamu cari' : 'Kanji dalam kata ini', 'type');
    if (kanjis.length === 1 && recs[0]) selectKanji(recs[0].ch, { scroll: false });
    return;
  }
  if (S.failed){ renderResults('Data kamus gagal dimuat. Periksa koneksi internet lalu muat ulang halaman. (Mencari dengan mengetik kanji langsung masih bisa.)'); return; }

  let found = searchIn(S.list, q, typeLevel);
  let label = `3 kanji terdekat dengan “${q}”`;
  if (!found.length && /^[a-zA-Z\s'-]{3,}$/.test(q)){
    const en = await translate(q, 'id', 'en');
    if (my !== seq) return;
    if (en && en.toLowerCase() !== q.toLowerCase()){
      found = searchIn(S.list, en, typeLevel);
      if (found.length) label = `Terdekat dengan “${q}” (≈ ${en.toLowerCase()})`;
    }
  }
  showResults(found.slice(0, 30).map(f => f.rec), label, 'type');
}

input.addEventListener('input', () => { clearTimeout(typeTimer); typeTimer = setTimeout(doTypeSearch, 300); });
$('#kdForm').addEventListener('submit', e => { e.preventDefault(); clearTimeout(typeTimer); doTypeSearch(); });
$$('.kd-eg', root).forEach(b => b.addEventListener('click', () => { input.value = b.dataset.q; doTypeSearch(); }));

function levelChips(container, current, withAll, onPick){
  container.innerHTML =
    (withAll ? `<button type="button" class="kd-chip${current === 0 ? ' active' : ''}" data-lv="0">Semua</button>` : '') +
    LEVELS.map(l => `<button type="button" class="kd-chip${current === l ? ' active' : ''}" data-lv="${l}">N${l}</button>`).join('');
  container.onclick = e => {
    const b = e.target.closest('[data-lv]'); if (!b) return;
    onPick(+b.dataset.lv);
  };
}
function drawTypeChips(){ levelChips($('#kdTypeChips'), typeLevel, true, v => { typeLevel = v; drawTypeChips(); if (input.value.trim()) doTypeSearch(); }); }
drawTypeChips();

/* ---------- 3.7 Tab 2 — Kategori JLPT ---------- */
const CAT = { level: 5, shown: 0, step: 96 };
function renderCategory(reset){
  levelChips($('#kdCatChips'), CAT.level, false, v => { CAT.level = v; renderCategory(true); });
  const grid = $('#kdGrid'), info = $('#kdCatInfo'), more = $('#kdGridMore');
  $('#kdCatFc').textContent = `Flashcard N${CAT.level}`;
  if (!S.list.length){
    grid.innerHTML = '';
    info.textContent = S.failed ? 'Data kamus gagal dimuat. Muat ulang halaman.' : 'Memuat data kanji…';
    more.hidden = true;
    if (!S.failed) S.ready.then(() => renderCategory(true));
    return;
  }
  const list = S.byLevel[CAT.level];
  if (reset){ CAT.shown = 0; grid.innerHTML = ''; }
  const next = list.slice(CAT.shown, CAT.shown + CAT.step);
  const cur = $('.kd-detail-inner')?.dataset.current;
  grid.insertAdjacentHTML('beforeend', next.map(r =>
    `<button type="button" class="kd-tile${r.ch === cur ? ' active' : ''}" data-ch="${esc(r.ch)}" title="${esc(r.en.slice(0, 3).join(', '))}">
       <span class="jp">${esc(r.ch)}</span><small>${esc(r.en[0] || '')}</small></button>`).join(''));
  CAT.shown += next.length;
  info.innerHTML = list.length
    ? `<b>JLPT N${CAT.level}</b> · menampilkan ${CAT.shown} dari ${list.length} kanji`
    : `Data level N${CAT.level} tidak tersedia.`;
  more.hidden = CAT.shown >= list.length;
}
$('#kdGridMore').addEventListener('click', () => renderCategory(false));
$('#kdCatFc').addEventListener('click', () => openFlash(CAT.level));

/* ---------- 3.8 Tab 3 — Gambar (handwriting) ---------- */
const pad = (() => {
  const wrap = $('#kdPad'), cv = $('#kdCanvas'), ph = $('#kdPadPh'), status = $('#kdPadStatus');
  const ctx = cv.getContext('2d');
  const P = { strokes: [], cur: null, t0: 0, timer: 0, token: 0 };

  function resize(){
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  function redraw(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(5, wrap.clientWidth / 55);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#201a1a';
    const all = P.cur ? [...P.strokes, P.cur] : P.strokes;
    for (const s of all){
      ctx.beginPath();
      s.x.forEach((x, i) => (i ? ctx.lineTo(x, s.y[i]) : ctx.moveTo(x, s.y[i])));
      if (s.x.length === 1) ctx.lineTo(s.x[0] + .01, s.y[0]);
      ctx.stroke();
    }
    ph.hidden = all.length > 0;
  }
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    clearTimeout(P.timer);
    if (!P.strokes.length) P.t0 = performance.now();
    const [x, y] = pos(e);
    P.cur = { x: [x], y: [y], t: [Math.round(performance.now() - P.t0)] };
    redraw();
  });
  cv.addEventListener('pointermove', e => {
    if (!P.cur) return;
    const [x, y] = pos(e);
    P.cur.x.push(x); P.cur.y.push(y); P.cur.t.push(Math.round(performance.now() - P.t0));
    redraw();
  });
  const end = () => {
    if (!P.cur) return;
    P.strokes.push(P.cur); P.cur = null; redraw();
    clearTimeout(P.timer); P.timer = setTimeout(recognize, 650);
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap);

  async function recognize(){
    if (!P.strokes.length){ status.textContent = ''; hideResults(); return; }
    const my = ++P.token;
    status.textContent = 'Mengenali tulisan…';
    const w = wrap.clientWidth, h = wrap.clientHeight;
    const ink = P.strokes.map(s => [s.x.map(Math.round), s.y.map(Math.round), s.t]);
    const body = JSON.stringify({
      options: 'enable_pre_space',
      requests: [{ writing_guide: { writing_area_width: w, writing_area_height: h }, ink, pre_context: '', max_num_results: 15, max_completions: 0, language: 'ja' }]
    });
    let cands = null;
    for (const url of CFG.handwriting){
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (!r.ok) throw new Error(r.status);
        const j = await r.json();
        if (j[0] !== 'SUCCESS') throw new Error('gagal');
        cands = j[1][0][1]; break;
      } catch (e){ /* coba endpoint berikutnya */ }
    }
    if (my !== P.token) return;
    if (!cands){
      status.textContent = 'Layanan pengenalan tulisan tidak dapat dihubungi. Periksa koneksi, atau pakai tab “Ketik”.';
      return;
    }
    await S.ready;
    const chars = [...new Set(cands.filter(c => [...c].length === 1 && isKanji(c)))].slice(0, 12);
    const recs = (await Promise.all(chars.map(getRec))).filter(Boolean).filter((r, i, a) => a.findIndex(x => x.ch === r.ch) === i);
    if (my !== P.token) return;
    status.textContent = recs.length ? '' : 'Belum ada kanji yang cocok. Coba tulis lebih besar atau sesuai urutan goresan.';
    if (recs.length) showResults(recs, '3 kanji paling mirip dengan tulisanmu', 'draw');
    else { R.tab = 'draw'; R.list = []; renderResults(); }
  }
  function clear(){ clearTimeout(P.timer); P.token++; P.strokes = []; P.cur = null; status.textContent = ''; redraw(); if (R.tab === 'draw') hideResults(); }
  function undo(){ clearTimeout(P.timer); P.strokes.pop(); redraw(); P.timer = setTimeout(recognize, 250); }
  $('#kdPadClear').addEventListener('click', clear);
  $('#kdPadUndo').addEventListener('click', undo);
  return { resize, clear };
})();

/* ============================================================
   4. DETAIL KANJI
   ============================================================ */
const detail = $('#kdDetail');
let selToken = 0, player = null;

/* ---------- 4.1 Pemutar animasi goresan ---------- */
class StrokePlayer {
  constructor(svg, onChange){
    this.inks = $$('.ink path', svg);
    this.nums = $$('.nums text', svg);
    this.lens = this.inks.map(p => p.getTotalLength());
    this.n = this.inks.length;
    this.p = 0; this.speed = 1; this.raf = 0; this.playing = false; this.onChange = onChange || (() => {});
    this.inks.forEach((p, i) => { p.style.strokeDasharray = this.lens[i]; });
    this.render();
    this._ready = true;
  }
  render(){
    const p = this.p;
    const cur = this.current;
    if (cur !== this._cur){ this._cur = cur; if (this._ready) this.emit(); }
    this.inks.forEach((el, i) => {
      const f = Math.min(1, Math.max(0, (p - i) / 0.85));
      const e = 1 - Math.pow(1 - f, 2);
      el.style.strokeDashoffset = this.lens[i] * (1 - e);
      el.style.opacity = f > 0 ? 1 : 0;
      el.classList.toggle('cur', f > 0 && f < 1);
      if (this.nums[i]) this.nums[i].style.opacity = f > 0.2 ? 1 : 0;
    });
  }
  emit(){ this.onChange(this); }
  cancel(){ cancelAnimationFrame(this.raf); this.playing = false; }
  animateTo(target, rate = 0.9){
    this.cancel();
    const from = this.p, dist = Math.abs(target - from);
    if (!dist){ this.emit(); return; }
    const dur = dist * rate * 1000 / this.speed, start = performance.now();
    this.playing = true; this.emit();
    const tick = now => {
      const k = Math.min(1, (now - start) / dur);
      this.p = from + (target - from) * k;
      this.render();
      if (k < 1) this.raf = requestAnimationFrame(tick);
      else { this.playing = false; this.emit(); }
    };
    this.raf = requestAnimationFrame(tick);
  }
  play(){ if (this.p >= this.n - 0.001){ this.p = 0; this.render(); } this.animateTo(this.n); }
  pause(){ this.cancel(); this.emit(); }
  toggle(){ this.playing ? this.pause() : this.play(); }
  step(){
    this.cancel();
    if (this.p >= this.n - 0.001){ this.p = 0; this.render(); }
    this.animateTo(Math.min(this.n, Math.floor(this.p + 0.001) + 1), 0.9);
  }
  reset(){ this.cancel(); this.p = 0; this.render(); this.emit(); }
  jump(i){ this.cancel(); this.p = i + 1; this.render(); this.emit(); }
  get current(){ return Math.min(this.n, Math.max(0, Math.ceil(this.p - 0.15))); }
}

const strokeCache = new Map();
async function fetchStrokes(ch){
  if (strokeCache.has(ch)) return strokeCache.get(ch);
  const hex = ch.codePointAt(0).toString(16).padStart(5, '0');
  for (const url of CFG.kanjivg(hex)){
    try {
      const r = await fetch(url); if (!r.ok) continue;
      const txt = await r.text();
      const paths = [...txt.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map(m => m[1]);
      if (!paths.length) continue;
      const nums = [...txt.matchAll(/<text[^>]*transform="matrix\(1 0 0 1 ([\d.\-]+) ([\d.\-]+)\)"[^>]*>(\d+)<\/text>/g)]
        .map(m => ({ x: +m[1], y: +m[2], t: m[3] }));
      const data = { paths, nums };
      strokeCache.set(ch, data);
      return data;
    } catch (e){ /* coba sumber berikutnya */ }
  }
  throw new Error('KanjiVG tidak tersedia');
}

function mountStage(data){
  const svg = $('#kdSvg'); if (!svg) return;
  const guide =
    '<rect class="g-frame" x="1" y="1" width="107" height="107" rx="5"/>' +
    '<path class="g-guide" d="M54.5 1V108M1 54.5H108"/>';
  svg.innerHTML = guide +
    `<g class="ghost">${data.paths.map(d => `<path d="${d}"/>`).join('')}</g>` +
    `<g class="ink">${data.paths.map(d => `<path d="${d}"/>`).join('')}</g>` +
    `<g class="nums">${data.nums.map(n => `<text x="${n.x}" y="${n.y}">${n.t}</text>`).join('')}</g>`;

  $('#kdSteps').innerHTML = data.paths.map((_, k) =>
    `<button type="button" class="kd-step" data-i="${k}" aria-label="Goresan ${k + 1}">
       <svg viewBox="0 0 109 109" aria-hidden="true">
         ${data.paths.slice(0, k).map(d => `<path class="prev" d="${d}"/>`).join('')}
         <path class="now" d="${data.paths[k]}"/>
       </svg><small>${k + 1}</small></button>`).join('');

  const playBtn = $('#kdPlay'), lbl = $('#kdStrokeLbl');
  if (player) player.cancel();
  player = new StrokePlayer(svg, pl => {
    playBtn.innerHTML = pl.playing ? '❚❚ Jeda' : (pl.p >= pl.n - 0.001 ? '↺ Putar ulang' : '▶ Putar');
    lbl.textContent = `Goresan ${pl.current} / ${pl.n}`;
    $$('.kd-step', detail).forEach((b, i) => b.classList.toggle('on', i === pl.current - 1));
  });
  player.emit();
  setTimeout(() => { if (player && svg.isConnected) player.play(); }, 350);   // otomatis putar sekali
}

/* ---------- 4.2 Contoh kata ---------- */
const wordsCache = new Map();
function tagScore(v){
  let s = 0;
  for (const p of v.priorities || []){
    if (p === 'ichi1') s += 4; else if (p === 'news1') s += 3; else if (p === 'spec1') s += 2;
    else if (p === 'gai1') s += 1; else if (p === 'ichi2' || p === 'news2') s += 1;
    else if (/^nf0\d$/.test(p)) s += 3; else if (/^nf[12]\d$/.test(p)) s += 1;
  }
  return s;
}
async function fetchWords(ch){
  if (wordsCache.has(ch)) return wordsCache.get(ch);
  let arr = [];
  try { arr = await fetchJSON(`${CFG.kanjiApi}/words/${encodeURIComponent(ch)}`); } catch (e){ arr = []; }
  const words = arr.map(w => {
    const vs = (w.variants || []).filter(v => v.written && v.written.includes(ch))
      .map(v => ({ ...v, sc: tagScore(v) })).sort((a, b) => b.sc - a.sc);
    if (!vs.length) return null;
    const v = vs[0];
    const mean = (w.meanings || []).slice(0, 2).map(m => (m.glosses || []).slice(0, 2).join(', ')).filter(Boolean).join(' / ');
    return { written: v.written, reading: v.pronounced, mean, sc: v.sc };
  }).filter(Boolean);
  words.sort((a, b) => b.sc - a.sc || a.written.length - b.written.length);
  const common = words.filter(w => w.sc > 0);
  const out = (common.length >= 4 ? common : words).slice(0, 8);
  wordsCache.set(ch, out);
  return out;
}
function wordRow(w, ch){
  const written = [...w.written].map(c => isKanji(c) && c !== ch
    ? `<a class="kd-wk" data-ch="${esc(c)}" title="Lihat kanji ${esc(c)}">${esc(c)}</a>` : esc(c)).join('');
  return `<li class="kd-word"><div><span class="kd-w jp">${written}</span><small class="jp">${esc(w.reading)} · ${esc(toRomaji(w.reading))}</small></div><p>${esc(w.mean || '—')}</p></li>`;
}

/* ---------- 4.3 Render panel detail ---------- */
function readingChips(list, kind){
  if (!list.length) return `<p class="kd-none">Tidak ada ${kind}.</p>`;
  return `<div class="kd-chips-rd">${list.map(r => {
    const shown = kind === 'kunyomi' ? r : r;
    return `<span class="kd-rd"><b class="jp">${esc(shown)}</b><small>${esc(toRomaji(r).replace(/-/g, ''))}</small></span>`;
  }).join('')}</div>`;
}
function gradeNote(g){
  if (!g) return '';
  if (g >= 1 && g <= 6) return `Kelas ${g} SD (Jepang)`;
  if (g === 8) return 'Jōyō (SMP/SMA)';
  if (g >= 9) return 'Nama (jinmeiyō)';
  return '';
}

function renderDetail(rec){
  const badges = [
    `<span class="kd-badge ${rec.jlpt ? 'lv' : ''}">${lvLabel(rec)}</span>`,
    rec.strokes ? `<span class="kd-badge">✎ ${rec.strokes} goresan</span>` : '',
    gradeNote(rec.grade) ? `<span class="kd-badge">${gradeNote(rec.grade)}</span>` : ''
  ].join('');
  detail.hidden = false;
  detail.innerHTML = `
  <div class="kd-detail-inner" data-current="${esc(rec.ch)}">
    <div class="kd-stage-card">
      <div class="kd-stage-top"><span class="kd-lbl">URUTAN GORESAN</span><span class="kd-count" id="kdStrokeLbl">${rec.strokes ? 'Goresan 0 / ' + rec.strokes : ''}</span></div>
      <div class="kd-stage">
        <svg id="kdSvg" viewBox="0 0 109 109" role="img" aria-label="Animasi urutan goresan kanji ${esc(rec.ch)}">
          <rect class="g-frame" x="1" y="1" width="107" height="107" rx="5"/>
          <path class="g-guide" d="M54.5 1V108M1 54.5H108"/>
          <text class="g-fallback jp" x="54.5" y="80" text-anchor="middle">${esc(rec.ch)}</text>
        </svg>
        <p class="kd-stage-msg" id="kdStageMsg">Memuat animasi…</p>
      </div>
      <div class="kd-ctrls">
        <button type="button" class="btn btn-primary kd-btn" id="kdPlay">▶ Putar</button>
        <button type="button" class="btn btn-ghost kd-btn" id="kdStep">Berikutnya ›</button>
        <button type="button" class="btn btn-ghost kd-btn" id="kdReset" aria-label="Kosongkan">⟲</button>
      </div>
      <div class="kd-speed"><span>Kecepatan</span>
        <button type="button" data-sp="0.5">0.5×</button><button type="button" data-sp="1" class="on">1×</button><button type="button" data-sp="2">2×</button>
      </div>
      <div class="kd-steps" id="kdSteps" aria-label="Tahap penulisan"></div>
    </div>

    <div class="kd-info">
      <div class="kd-badges">${badges}</div>
      <div class="kd-sec">
        <p class="kd-lbl">ARTI</p>
        <h3 class="kd-mean" id="kdMeanId"><span class="kd-shimmer">Menerjemahkan…</span></h3>
        <p class="kd-mean-en">${esc(rec.en.join(', ') || '—')} <small>(Inggris)</small></p>
      </div>
      <div class="kd-cols">
        <div class="kd-sec"><p class="kd-lbl">KUNYOMI <span class="jp">訓読み</span></p>${readingChips(rec.kun, 'kunyomi')}</div>
        <div class="kd-sec"><p class="kd-lbl">ONYOMI <span class="jp">音読み</span></p>${readingChips(rec.on, 'onyomi')}</div>
      </div>
      <div class="kd-sec">
        <p class="kd-lbl">CONTOH KATA UMUM</p>
        <ul class="kd-words" id="kdWords"><li class="kd-none"><span class="kd-shimmer">Memuat contoh kata…</span></li></ul>
      </div>
      <div class="kd-detail-actions">
        <button type="button" class="btn btn-ghost" id="kdDetailFc">Flashcard ${rec.jlpt ? 'N' + rec.jlpt : ''}</button>
      </div>
    </div>
  </div>`;
  // tombol
  $('#kdPlay').onclick  = () => player?.toggle();
  $('#kdStep').onclick  = () => player?.step();
  $('#kdReset').onclick = () => player?.reset();
  $$('.kd-speed button', detail).forEach(b => b.onclick = () => {
    $$('.kd-speed button', detail).forEach(x => x.classList.toggle('on', x === b));
    if (player) player.speed = +b.dataset.sp;
  });
  $('#kdSteps').onclick = e => { const b = e.target.closest('.kd-step'); if (b && player) player.jump(+b.dataset.i); };
  $('#kdDetailFc').onclick = () => openFlash(rec.jlpt || CAT.level);
}

async function selectKanji(ch, { scroll = true } = {}){
  const my = ++selToken;
  await S.ready;
  const rec = await getRec(ch);
  if (!rec || my !== selToken) return;
  if (player){ player.cancel(); player = null; }

  $$('.kd-card, .kd-tile', root).forEach(el => el.classList.toggle('active', el.dataset.ch === ch));
  renderDetail(rec);
  if (scroll) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  try { history.replaceState(null, '', '#' + encodeURIComponent(ch)); } catch (e){}

  fetchStrokes(ch).then(d => { if (my !== selToken) return; $('#kdStageMsg').hidden = true; mountStage(d); })
    .catch(() => { if (my !== selToken) return; $('#kdStageMsg').textContent = 'Animasi goresan untuk kanji ini belum tersedia.'; });

  fetchWords(ch).then(ws => {
    if (my !== selToken) return;
    $('#kdWords').innerHTML = ws.length ? ws.map(w => wordRow(w, ch)).join('') : '<li class="kd-none">Belum ada contoh kata untuk kanji ini.</li>';
  });

  idMeaning(rec).then(t => {
    if (my !== selToken) return;
    const el = $('#kdMeanId');
    el.textContent = t ? t.charAt(0).toUpperCase() + t.slice(1) : (rec.en[0] || '—');
    if (t) el.title = 'Terjemahan otomatis dari bahasa Inggris';
  });
}

root.addEventListener('click', e => {
  const el = e.target.closest('[data-ch]');
  if (el && root.contains(el)) selectKanji(el.dataset.ch);
});

/* ============================================================
   5. FLASHCARD
   ============================================================ */
const fc = $('#fc'), fcBody = $('#fcBody');
const FC = { level: 5, count: 20, dir: 'k2m', skip: false, deck: [], i: 0, flipped: false, hit: [], miss: [] };
const known = (() => { try { return new Set(JSON.parse(localStorage.getItem(CFG.knownKey) || '[]')); } catch (e){ return new Set(); } })();
const saveKnown = () => { try { localStorage.setItem(CFG.knownKey, JSON.stringify([...known])); } catch (e){} };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

async function openFlash(level){
  await S.ready;
  if (S.failed){ alert('Data kamus belum termuat. Periksa koneksi internet lalu muat ulang halaman.'); return; }
  if (level >= 1 && level <= 5) FC.level = level;
  fc.hidden = false; document.body.style.overflow = 'hidden';
  fc.scrollTop = 0;
  renderSetup();
}
function closeFlash(){ fc.hidden = true; document.body.style.overflow = ''; }

function chip(act, val, label, on, extra = ''){ return `<button type="button" class="kd-chip${on ? ' active' : ''}" data-act="${act}" data-v="${val}">${label}${extra}</button>`; }

function renderSetup(){
  const lvBtns = LEVELS.map(l => {
    const list = S.byLevel[l], k = list.filter(r => known.has(r.ch)).length;
    return chip('lv', l, `N${l}`, FC.level === l, `<small>${list.length} kanji${k ? ' · ' + k + ' hafal' : ''}</small>`);
  }).join('');
  const pool = S.byLevel[FC.level].filter(r => !(FC.skip && known.has(r.ch))).length;
  fcBody.innerHTML = `
    <div class="fc-setup">
      <p class="tag">FLASHCARD <span class="jp">暗記</span></p>
      <h2>Uji Hafalan Kanji</h2>
      <p class="fc-lead">Pilih level JLPT, lalu balik kartu dan nilai dirimu sendiri dengan jujur. Progres “hafal” tersimpan di perangkat ini.</p>

      <div class="fc-group"><p class="kd-lbl">LEVEL JLPT</p><div class="kd-chips fc-lvls">${lvBtns}</div></div>
      <div class="fc-group"><p class="kd-lbl">JUMLAH KARTU</p><div class="kd-chips">
        ${[10, 20, 30, 0].map(n => chip('cnt', n, n ? n : 'Semua', FC.count === n)).join('')}</div></div>
      <div class="fc-group"><p class="kd-lbl">MODE</p><div class="kd-chips">
        ${chip('dir', 'k2m', '漢字 → Arti & bacaan', FC.dir === 'k2m')}
        ${chip('dir', 'm2k', 'Arti → 漢字', FC.dir === 'm2k')}</div></div>
      <label class="fc-check"><input type="checkbox" data-act="skip" ${FC.skip ? 'checked' : ''}> Lewati kanji yang sudah kutandai hafal</label>

      <div class="fc-start">
        <button type="button" class="btn btn-primary btn-lg" data-act="start" ${pool ? '' : 'disabled'}>Mulai Flashcard N${FC.level} →</button>
        <button type="button" class="btn btn-ghost" data-act="reset-known">Reset progres N${FC.level}</button>
      </div>
      ${pool ? '' : '<p class="kd-none">Semua kanji N' + FC.level + ' sudah kamu hafal. Matikan opsi “lewati” atau reset progres.</p>'}
    </div>`;
}

function startDeck(list){
  FC.deck = list; FC.i = 0; FC.flipped = false; FC.hit = []; FC.miss = [];
  renderCard();
}
function startFromSetup(){
  let pool = S.byLevel[FC.level].filter(r => !(FC.skip && known.has(r.ch)));
  pool = shuffle(pool);
  if (FC.count) pool = pool.slice(0, FC.count);
  if (pool.length) startDeck(pool);
}

function backHtml(r){
  return `
    <div class="fc-back-top"><span class="fc-back-ch jp">${esc(r.ch)}</span>
      <div><span class="kd-badge lv">${r.jlpt ? 'N' + r.jlpt : '—'}</span>${r.strokes ? `<span class="kd-badge">✎ ${r.strokes}</span>` : ''}</div></div>
    <p class="fc-mean" id="fcId">${esc(r.en.slice(0, 3).join(', '))}</p>
    <p class="fc-mean-en">${esc(r.en.join(', '))}</p>
    <div class="fc-rd"><p class="kd-lbl">KUNYOMI</p><p class="jp">${esc(r.kun.map(cleanKun).join('、') || '—')}</p></div>
    <div class="fc-rd"><p class="kd-lbl">ONYOMI</p><p class="jp">${esc(r.on.join('、') || '—')}</p></div>`;
}

function renderCard(){
  const r = FC.deck[FC.i], total = FC.deck.length;
  const front = FC.dir === 'k2m'
    ? `<span class="fc-front-ch jp">${esc(r.ch)}</span><p class="fc-q">Apa arti & cara bacanya?</p>`
    : `<p class="fc-front-mean">${esc(r.en.slice(0, 3).join(', '))}</p><p class="fc-q">Kanji apa ini?</p>`;
  fcBody.innerHTML = `
    <div class="fc-play">
      <div class="fc-top">
        <span class="fc-count">${FC.i + 1} / ${total}</span>
        <div class="fc-prog"><i style="width:${(FC.i / total) * 100}%"></i></div>
        <button type="button" class="fc-link" data-act="setup">Selesai</button>
      </div>
      <div class="fc-card${FC.flipped ? ' flipped' : ''}" data-act="flip" tabindex="0" aria-label="Balik kartu">
        <div class="fc-inner">
          <div class="fc-face fc-front">${front}<span class="fc-tap">ketuk untuk membalik</span></div>
          <div class="fc-face fc-back">${backHtml(r)}</div>
        </div>
      </div>
      <div class="fc-actions">
        ${FC.flipped
          ? `<button type="button" class="btn btn-ghost btn-lg" data-act="no">✗ Belum hafal</button>
             <button type="button" class="btn btn-primary btn-lg" data-act="yes">✓ Hafal</button>`
          : `<button type="button" class="btn btn-primary btn-lg" data-act="flip">Lihat jawaban</button>`}
      </div>
      <p class="fc-hint">Spasi = balik kartu · ← belum hafal · → hafal</p>
    </div>`;
  if (FC.flipped) idMeaning(r).then(t => { const el = $('#fcId'); if (t && el && FC.deck[FC.i] === r) el.textContent = t; });
}

function flip(){
  if (FC.flipped) return;
  FC.flipped = true;
  const card = $('.fc-card', fcBody); if (!card) return;
  card.classList.add('flipped');
  $('.fc-actions', fcBody).innerHTML =
    `<button type="button" class="btn btn-ghost btn-lg" data-act="no">✗ Belum hafal</button>
     <button type="button" class="btn btn-primary btn-lg" data-act="yes">✓ Hafal</button>`;
  const r = FC.deck[FC.i];
  idMeaning(r).then(t => { const el = $('#fcId'); if (t && el && FC.deck[FC.i] === r) el.textContent = t; });
}
function answer(ok){
  if (!FC.flipped) return;
  const r = FC.deck[FC.i];
  if (ok){ FC.hit.push(r); known.add(r.ch); } else { FC.miss.push(r); known.delete(r.ch); }
  saveKnown();
  FC.i++; FC.flipped = false;
  FC.i >= FC.deck.length ? renderResult() : renderCard();
}
function renderResult(){
  const total = FC.deck.length, ok = FC.hit.length, pct = Math.round(ok / total * 100);
  const msg = pct === 100 ? 'Sempurna! すごい！' : pct >= 70 ? 'Bagus sekali, terus latihan!' : pct >= 40 ? 'Lumayan, ulangi yang belum hafal.' : 'Tidak apa-apa, belajar bertahap itu kunci.';
  fcBody.innerHTML = `
    <div class="fc-result">
      <p class="tag">HASIL · JLPT N${FC.level}</p>
      <div class="fc-score"><b>${ok}</b><span>/ ${total}</span></div>
      <h2>${msg}</h2>
      ${FC.miss.length ? `<div class="fc-group"><p class="kd-lbl">PERLU DIULANG (${FC.miss.length}) — ketuk untuk lihat detail</p>
        <div class="fc-miss">${FC.miss.map(r => `<button type="button" class="fc-miss-item" data-act="detail" data-ch="${esc(r.ch)}"><span class="jp">${esc(r.ch)}</span><small>${esc(r.en[0] || '')}</small></button>`).join('')}</div></div>` : ''}
      <div class="fc-start">
        ${FC.miss.length ? '<button type="button" class="btn btn-primary btn-lg" data-act="retry">Ulangi yang belum hafal</button>' : ''}
        <button type="button" class="btn ${FC.miss.length ? 'btn-ghost' : 'btn-primary btn-lg'}" data-act="setup">Atur ulang / level lain</button>
        <button type="button" class="btn btn-ghost" data-act="close">Tutup</button>
      </div>
    </div>`;
}

fc.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, v = t.dataset.v;
  if (a === 'close') closeFlash();
  else if (a === 'lv'){ FC.level = +v; renderSetup(); }
  else if (a === 'cnt'){ FC.count = +v; renderSetup(); }
  else if (a === 'dir'){ FC.dir = v; renderSetup(); }
  else if (a === 'skip'){ FC.skip = t.checked; renderSetup(); }
  else if (a === 'reset-known'){ S.byLevel[FC.level].forEach(r => known.delete(r.ch)); saveKnown(); renderSetup(); }
  else if (a === 'start') startFromSetup();
  else if (a === 'flip') flip();
  else if (a === 'yes') answer(true);
  else if (a === 'no') answer(false);
  else if (a === 'setup') renderSetup();
  else if (a === 'retry') startDeck(shuffle(FC.miss));
  else if (a === 'detail'){ closeFlash(); selectKanji(t.dataset.ch); }
});
document.addEventListener('keydown', e => {
  if (fc.hidden) return;
  if (e.key === 'Escape'){ closeFlash(); return; }
  if (!$('.fc-card', fcBody)) return;
  if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); flip(); }
  else if (e.key === 'ArrowRight') answer(true);
  else if (e.key === 'ArrowLeft') answer(false);
});
$('#fcOpen').addEventListener('click', () => openFlash());

/* ============================================================
   6. INISIALISASI
   ============================================================ */
S.ready.then(() => {
  const h = decodeURIComponent((location.hash || '').slice(1));
  if (h && [...h].length === 1 && isKanji(h)) selectKanji(h, { scroll: true });
  if (!$('#kdPanel-cat').hidden) renderCategory(true);
});
})();
