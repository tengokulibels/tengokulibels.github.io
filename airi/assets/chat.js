/* ============================================================
   AIRI — Latihan Bicara Jepang
   LLM  : lewat proxy Cloudflare Worker (API key Groq tidak ada di sini)
   Suara: Cloudflare Worker (Workers AI - MeloTTS). Kalau gagal, dipakai suara bawaan browser.
   ============================================================ */
const API_URL = "https://airi-groq-proxy.raditya-alfarezah12.workers.dev";
// Suara: Cloudflare Worker (Workers AI - MeloTTS), lang "ja".
const VOICE_URL = "https://airi-voice.tengokulibels15.workers.dev/";
const MODELS_TO_TRY = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 700;
const MAX_ATTEMPTS_PER_MODEL = 2;
const RATE_EVERY = 4;                // munculkan pop-up penilaian tiap N balasan AI

const SCENES = [
  { id:'kenalan', jp:'自己紹介', t:'Berkenalan', d:'Menyapa & memperkenalkan diri', p:'dua orang baru bertemu di klub bahasa Jepang dan berkenalan (nama, asal, hobi sederhana)' },
  { id:'konbini', jp:'コンビニ', t:'Di konbini', d:'Membeli minuman & camilan', p:'user membeli minuman dan camilan di konbini, Airi adalah kasir yang ramah' },
  { id:'gakkou',  jp:'学校',     t:'Di sekolah', d:'Ngobrol dengan teman sekelas', p:'dua teman sekelas mengobrol saat istirahat siang tentang pelajaran dan bekal' },
  { id:'resto',   jp:'レストラン', t:'Memesan makanan', d:'Di restoran ramen', p:'user memesan makanan di restoran ramen, Airi adalah pelayannya' },
  { id:'shumi',   jp:'趣味',     t:'Hobi & akhir pekan', d:'Cerita kegiatan sehari-hari', p:'dua teman mengobrol santai tentang hobi dan rencana akhir pekan' },
  { id:'michi',   jp:'道案内',   t:'Bertanya arah', d:'Mencari stasiun terdekat', p:'user tersesat dan bertanya arah ke stasiun, Airi adalah warga yang membantu' },
];
const LEVELS = {
  1:'SANGAT MUDAH: kalimat 3-6 kata, hanya です/ます, kosakata paling dasar, pertanyaan yang bisa dijawab satu kata',
  2:'MUDAH: kalimat pendek 5-8 kata, です/ます, kosakata N5 dasar',
  3:'SEDANG: kosakata dan tata bahasa N5, kalimat sampai 10 kata',
  4:'CUKUP SULIT: N5 lanjut sampai N4 awal, bentuk て/たい/ている, kalimat sedikit lebih panjang',
  5:'SULIT: N4, kalimat majemuk, sedikit bentuk biasa (tanpa です/ます) seperti anak muda Jepang',
};

const $ = id => document.getElementById(id);
const stream=$('stream'), input=$('input'), sendBtn=$('sendBtn'), micBtn=$('micBtn'),
      scenesEl=$('scenes'), subtitle=$('subtitle'), avatar=$('avatar'), statusEl=$('statusEl'),
      rateModal=$('rateModal');

let scene=null, convo=[], aiTurns=0, busy=false;
let level = 2;
try { level = Math.min(5, Math.max(1, +localStorage.getItem('airi-level') || 2)); } catch(e){}
function saveLevel(){ try{ localStorage.setItem('airi-level', level); }catch(e){} }

/* ---------- Prompt ---------- */
function systemPrompt(){
  return `Kamu adalah "Hoshizora Airi", teman ngobrol bahasa Jepang di klub TENGOKU SMAN 15 Surabaya. Kepribadian: ceria, sedikit ceroboh, tsundere ringan, tetap ramah.
TUGAS: melatih user (pelajar Indonesia, pemula) BERBICARA bahasa Jepang lewat cerita sehari-hari yang natural ala orang Jepang.
Skenario: ${scene.p}.
Tingkat kesulitan sekarang (${level}/5): ${LEVELS[level]}.
ATURAN:
- Ucapanmu (reply.jp) HANYA bahasa Jepang, 1-2 kalimat pendek, selalu berakhir dengan pertanyaan/ajakan supaya user menjawab. Jangan pakai bahasa lain di reply.jp.
- Kalau user salah/tidak nyambung, tetap lanjutkan dengan ramah dan sederhanakan.
- Kalau pesan user persis "(mulai)", buka percakapan dengan salam sesuai skenario dan jangan isi "user".
BALAS HANYA JSON VALID (tanpa markdown, tanpa teks lain) dengan bentuk:
{"reply":{"jp":"kalimat lengkap","furi":[["今日","きょう"],["は",""]],"words":[{"w":"今日","r":"kyou","id":"hari ini"},{"w":"は","r":"wa","id":"(penanda topik)"}],"note":null},
 "user":{"words":[...],"fix":null,"note":null}}
- "words": pecah SELURUH kalimat per kata/partikel sesuai urutan (tanda baca tidak perlu), r = romaji, id = arti bahasa Indonesia yang singkat.
- "furi": kalimat yang sama dipotong menjadi pasangan [teks, hiragana]; beri hiragana hanya untuk bagian kanji, sisanya "" .
- "user": pecahan kata dari ucapan user (kalimat persis seperti yang user tulis). "fix": koreksi singkat dalam bahasa Indonesia jika ada kesalahan tata bahasa/kata, kalau tidak ada isi null.
- "note": isi HANYA jika ada ungkapan unik, gaul, atau khas percakapan (misal ちょっと, やばい, じゃあね, ～ね). Bentuk: {"phrase":"ungkapan","kapan":"kapan dipakai","pola":"pola kalimat","info":"info singkat lain"} dalam bahasa Indonesia, sangat ringkas. Selain itu null.`;
}

/* ---------- LLM ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
function fetchWithTimeout(url, opt, ms){
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...opt, signal:c.signal }).finally(() => clearTimeout(t));
}
function parseJSON(text){
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('No JSON');
  const o = JSON.parse(text.slice(a, b + 1));
  if (!o?.reply?.jp) throw new Error('Bad shape');
  return o;
}
async function tryModel(userText, model){
  const messages = [{ role:'system', content:systemPrompt() }, ...convo.slice(-6), { role:'user', content:userText }];
  const res = await fetchWithTimeout(API_URL, {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ model, messages, temperature:0.7, max_tokens:1200 })
  }, REQUEST_TIMEOUT_MS);
  if (!res.ok) throw new Error('API error ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response');
  return { raw, parsed: parseJSON(raw) };
}
async function askAiri(userText){
  let last;
  for (const m of MODELS_TO_TRY)
    for (let i = 0; i < MAX_ATTEMPTS_PER_MODEL; i++){
      try { return await tryModel(userText, m); }
      catch(e){ last = e; if (i < MAX_ATTEMPTS_PER_MODEL - 1) await sleep(RETRY_DELAY_MS); }
    }
  throw last || new Error('No response');
}

/* ---------- Suara ---------- */
const audioCache = new Map();
let currentAudio = null;
function setSpeaking(on){ avatar.classList.toggle('speaking', on); statusEl.textContent = on ? 'Sedang berbicara…' : 'Online'; }
function stopSpeaking(){
  if (currentAudio){ currentAudio.pause(); currentAudio = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  setSpeaking(false);
}
async function requestVoice(endpoint, text, timeoutMs){
  const res = await fetchWithTimeout(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ text }) }, timeoutMs);
  if (!res.ok) throw new Error(res.status);
  return URL.createObjectURL(await res.blob());
}
async function fetchVoice(text){
  if (!VOICE_URL) return null;
  if (audioCache.has(text)) return audioCache.get(text);
  try {
    const url = await requestVoice(VOICE_URL, text, 20000);
    audioCache.set(text, url); return url;
  } catch(e){ console.warn('Voice server gagal, pakai suara browser:', e); return null; }
}
async function speak(text){
  stopSpeaking();
  const url = await fetchVoice(text);
  setSpeaking(true);
  if (url){
    currentAudio = new Audio(url);
    currentAudio.onended = () => setSpeaking(false);
    currentAudio.play().catch(() => setSpeaking(false));
  } else if ('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('ja')); if (v) u.voice = v;
    u.onend = u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  } else setSpeaking(false);
}

/* ---------- Render ---------- */
function el(tag, cls, html){ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function wordsHTML(words){
  return '<div class="words">' + words.map(w =>
    `<span class="w"><b>${esc(w.w)}</b><i>${esc(w.r)}</i><small>${esc(w.id)}</small></span>`).join('') + '</div>';
}
function furiHTML(furi, fallback){
  if (!Array.isArray(furi) || !furi.length) return esc(fallback);
  return furi.map(p => p[1] ? `<ruby>${esc(p[0])}<rt>${esc(p[1])}</rt></ruby>` : esc(p[0])).join('');
}
function noteHTML(n){
  if (!n || !n.phrase) return '';
  return `<div class="note"><b><i class="fa-solid fa-lightbulb"></i> ${esc(n.phrase)}</b>` +
    (n.kapan ? `<span><b>Kapan dipakai:</b> ${esc(n.kapan)}</span>` : '') +
    (n.pola ? `<span><b>Pola:</b> ${esc(n.pola)}</span>` : '') +
    (n.info ? `<span>${esc(n.info)}</span>` : '') + '</div>';
}
function addRow(role){
  const row = el('div', 'row ' + role);
  if (role === 'ai') row.appendChild(el('div', 'avatar jp', 'あ'));
  const bubble = el('div', 'bubble'); row.appendChild(bubble);
  stream.appendChild(row); stream.scrollTop = stream.scrollHeight;
  return bubble;
}
function fillUser(bubble, text, u){
  bubble.innerHTML = (u?.words?.length ? wordsHTML(u.words) : `<div class="plain">${esc(text)}</div>`)
    + (u?.fix ? `<div class="fix"><b>Koreksi:</b> ${esc(u.fix)}</div>` : '') + noteHTML(u?.note);
}
function fillAI(bubble, r){
  bubble.innerHTML = (r.words?.length ? wordsHTML(r.words) : `<div class="plain">${esc(r.jp)}</div>`) + noteHTML(r.note);
  const btn = el('button', 'replay', '<i class="fa-solid fa-rotate-right"></i> Ulangi dengan subtitle');
  btn.type = 'button';
  btn.addEventListener('click', () => { showSubtitle(r); speak(r.jp); });
  bubble.insertBefore(btn, bubble.querySelector('.note'));
}
function showSubtitle(r){ subtitle.innerHTML = furiHTML(r.furi, r.jp); subtitle.classList.add('show'); }
subtitle.addEventListener('click', () => subtitle.classList.remove('show'));

/* ---------- Alur percakapan ---------- */
function setBusy(b){ busy = b; sendBtn.disabled = micBtn.disabled = input.disabled = b; }

async function send(text, hidden = false){
  const userText = (text ?? input.value).trim();
  if (!userText || busy || !scene) return;
  stopSpeaking(); subtitle.classList.remove('show');
  input.value = ''; input.style.height = 'auto';
  const uBubble = hidden ? null : addRow('user');
  if (uBubble) fillUser(uBubble, userText);
  const tBubble = addRow('ai'); tBubble.innerHTML = '<div class="typing"><s></s><s></s><s></s></div>';
  setBusy(true);
  try {
    const { raw, parsed } = await askAiri(userText);
    convo.push({ role:'user', content:userText }, { role:'assistant', content:raw });
    if (uBubble) fillUser(uBubble, userText, parsed.user);
    fillAI(tBubble, parsed.reply);
    aiTurns++;
    speak(parsed.reply.jp);
    if (aiTurns % RATE_EVERY === 0) setTimeout(openRate, 2500);
  } catch(err){
    console.error(err);
    tBubble.innerHTML = '<div class="plain">通信エラー</div><div class="fix">Airi belum bisa merespons. Coba kirim lagi sebentar lagi.</div>';
  } finally { setBusy(false); stream.scrollTop = stream.scrollHeight; if (!hidden) input.focus(); }
}

function startScene(s){
  scene = s; convo = []; aiTurns = 0; stream.innerHTML = '';
  scenesEl.classList.add('hide'); subtitle.classList.remove('show');
  $('sceneName').textContent = s.t + ' · tingkat ' + level + '/5';
  send('(mulai)', true);
}
function showScenes(){ stopSpeaking(); scenesEl.classList.remove('hide'); }

$('scenes').querySelector('.scene-grid').append(...SCENES.map(s => {
  const b = el('button', 'scene', `<span class="jp">${s.jp}</span><b>${s.t}</b><span>${s.d}</span>`);
  b.type = 'button'; b.addEventListener('click', () => startScene(s)); return b;
}));
$('changeScene').addEventListener('click', showScenes);

/* ---------- Penilaian tingkat kesulitan (pop-up) ---------- */
function openRate(){ if (scene && !rateModal.classList.contains('show')) rateModal.classList.add('show'); }
function closeRate(){ rateModal.classList.remove('show'); }
rateModal.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => {
  level = Math.min(5, Math.max(1, level + (+b.dataset.rate)));
  saveLevel(); closeRate();
  if (scene) $('sceneName').textContent = scene.t + ' · tingkat ' + level + '/5';
}));
$('rateSkip').addEventListener('click', closeRate);
rateModal.addEventListener('click', e => { if (e.target === rateModal) closeRate(); });
$('rateBtn').addEventListener('click', openRate);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRate(); });

/* ---------- Input: teks & mic ---------- */
sendBtn.addEventListener('click', () => send());
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); send(); } });

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recording = false;
if (SR){
  rec = new SR(); rec.lang = 'ja-JP'; rec.interimResults = true; rec.continuous = false;
  rec.onresult = e => { input.value = Array.from(e.results).map(r => r[0].transcript).join(''); };
  rec.onend = () => { recording = false; micBtn.classList.remove('rec'); if (input.value.trim()) send(); };
  rec.onerror = () => { recording = false; micBtn.classList.remove('rec'); };
  micBtn.addEventListener('click', () => {
    if (busy) return;
    if (recording){ rec.stop(); return; }
    stopSpeaking(); input.value = '';
    try { rec.start(); recording = true; micBtn.classList.add('rec'); } catch(e){}
  });
} else {
  micBtn.disabled = true;
  $('micHint').textContent = 'Browser ini belum mendukung input suara. Gunakan Chrome/Edge, atau ketik jawabanmu dalam bahasa Jepang.';
}
if ('speechSynthesis' in window) speechSynthesis.getVoices();
