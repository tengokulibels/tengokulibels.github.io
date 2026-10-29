/* ============================================================
   AIRI — Telepon & Chat Latihan Bahasa Jepang
   LLM  : proxy Cloudflare Worker (Groq)
   Suara: suara neural browser (prioritas) -> server TTS -> suara browser biasa
   ============================================================ */
const API_URL = "https://airi-groq-proxy.raditya-alfarezah12.workers.dev";
// Server TTS beremosi (mis. Style-Bert-VITS2 / Google Chirp / ElevenLabs lewat proxy).
// Menerima POST {text, emo} dan mengembalikan audio. Kosongkan "" kalau belum ada.
const VOICE_MODEL_URL = "";
const VOICE_MODEL_TIMEOUT_MS = 60000;
const VOICE_FALLBACK_URL = "https://airi-voice.tengokulibels15.workers.dev/"; // MeloTTS (datar)
const VOICE_FALLBACK_TIMEOUT_MS = 20000;
const PREFER_BROWSER_VOICE = true;  // pakai suara neural browser (Edge Nanami, Google 日本語, Siri) bila ada
const MODELS_TO_TRY = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 700;
const MAX_ATTEMPTS_PER_MODEL = 2;
const HISTORY_MSGS = 24;      // jumlah pesan riwayat yang dikirim ke LLM
const CALL_CHECK_EVERY = 6;

const LEVELS = {
  N5:'N5: kosakata & tata bahasa N5 (です/ます, は/が/を/に/で, ～たい, ～ましょう), kalimat pendek 5-12 kata, boleh bentuk biasa sederhana',
  N4:'N4: bentuk て, ～ている, ～たことがある, ～ので/から, ～かもしれない, bentuk biasa lancar',
  N3:'N3: ～ようになる, ～そう/らしい, ～ばかり, pasif/kausatif dasar, ～のに, kalimat majemuk & ngobrol alami',
  N2:'N2: ～わけ, ～に対して, ～ものの, ～せいで, ungkapan kolokial & nuansa halus',
  N1:'N1: ungkapan abstrak, idiom/ことわざ, ～ざるを得ない, ～ながらも, gaya natural penutur asli',
};
const LEVEL_HINT = {
  N5:'Dasar banget: kalimat pendek & kosakata sehari-hari.',
  N4:'Dasar lanjutan: mulai pakai bentuk て, ～ている, ～から.',
  N3:'Menengah: kalimat majemuk dan ngobrol lebih alami.',
  N2:'Menengah atas: nuansa halus dan ungkapan kolokial.',
  N1:'Mahir: idiom dan gaya penutur asli.',
};
const PARTICLE_INFO = {
  'は':{f:'Penanda topik kalimat',c:'私は学生です — Aku murid'},
  'が':{f:'Penanda subjek',c:'猫が好き — Suka kucing'},
  'を':{f:'Penanda objek langsung',c:'パンを食べる — Makan roti'},
  'に':{f:'Penanda waktu / tujuan / lokasi tujuan',c:'学校に行く — Pergi ke sekolah'},
  'へ':{f:'Penanda arah "ke"',c:'駅へ行く — Pergi ke stasiun'},
  'で':{f:'Penanda tempat aktivitas / alat',c:'電車で行く — Pergi naik kereta'},
  'と':{f:'Penanda "dengan" / "dan"',c:'友達と話す — Ngobrol sama teman'},
  'や':{f:'Penanda "dan lain-lain" (daftar tak lengkap)',c:'パンや牛乳 — Roti, susu, dll'},
  'も':{f:'Penanda "juga"',c:'私も行く — Aku juga pergi'},
  'か':{f:'Penanda pertanyaan',c:'元気ですか — Kabar baik?'},
  'ね':{f:'Partikel akhir, minta persetujuan ("ya kan?")',c:'いいね — Bagus ya'},
  'よ':{f:'Partikel akhir, menegaskan info baru',c:'もう遅いよ — Udah telat lho'},
  'な':{f:'Partikel akhir santai / larangan (～な)',c:'すごいな — Hebat ya'},
  'わ':{f:'Partikel akhir lembut (gaya feminin)',c:'行くわ — Aku pergi ya'},
  'の':{f:'Penanda kepemilikan, atau akhiran santai',c:'私の本 — Bukuku'},
  'から':{f:'Penanda "dari" / sebab',c:'学校から帰る — Pulang dari sekolah'},
  'まで':{f:'Penanda "sampai"',c:'駅まで歩く — Jalan sampai stasiun'},
  'けど':{f:'Penghubung "tapi" (santai)',c:'いいけど… — Boleh sih, tapi…'},
  'し':{f:'Penghubung nambah alasan',c:'暑いし疲れた — Panas, lagian capek'},
  'です':{f:'Akhiran sopan netral',c:'学生です — (Aku) murid'},
  'だ':{f:'Akhiran santai (versi casual dari です)',c:'学生だ — Murid, nih'},
  'ます':{f:'Akhiran kata kerja bentuk sopan',c:'食べます — Makan (sopan)'},
  'じゃん':{f:'"kan?" gaya santai anak muda',c:'いいじゃん — Bagus kan'},
};

/* ---------- pengaturan ---------- */
const SET = { lv:'N5', chatVoice:false };
try { Object.assign(SET, JSON.parse(localStorage.getItem('airi-set') || '{}')); } catch(e){}
if (!LEVELS[SET.lv]) SET.lv = 'N5';
function saveSet(){ try{ localStorage.setItem('airi-set', JSON.stringify(SET)); }catch(e){} }

let topic = '';   // ringkasan topik berjalan (dikirim balik oleh LLM)

function systemPrompt(pendingEnd){
  return `Kamu adalah "Hoshizora Airi" (星空あいり), cewek SMA Jepang anggota klub TENGOKU (SMAN 15 Surabaya). Kepribadian: ceria, tulus, blak-blakan, mudah semangat/kesal/malu (emosi ekspresif), tsundere ringan, hangat. Lawan bicara: teman Indonesia yang sedang belajar bahasa Jepang.
CARA NGOBROL (penting):
- Ngobrol seperti manusia, BUKAN guru/kuis. Tanggapi isi ucapan user dulu (reaksi, komentar, cerita kecil tentang dirimu), baru tanya balik kalau pas. Jangan setiap balasan ditutup pertanyaan.
- Topik bebas & mengalir (sekolah, makanan, game, anime, musik, HP, curhat, rencana, dll). Ikuti topik yang sedang berjalan; pindah topik hanya kalau obrolan sudah habis atau user mau. Baca riwayat & ingat hal yang sudah dibahas (nama, rencana, kesukaan user).
- Variasikan respons (そうなんだ、えー、まじで、なるほど、わかる…), jangan mengulang pola kalimat yang sama.
- Kalau ucapan user salah/ngawur: tebak maksudnya, lanjutkan natural, koreksi ringan lewat "fix" saja.
LEVEL ${LEVELS[SET.lv]}. Sekitar 85-90% isi pas di level ini. Sesekali (maks 1 per balasan, tidak wajib) boleh menyelipkan 1 kosakata/tata bahasa DI LUAR level (lebih tinggi atau gaul) — wajib ditandai pada token terkait dengan "lv" (mis. "N3") dan "g" (penjelasan singkat Indonesia).
GAYA: santai ala JK, 1-3 kalimat pendek, boleh pakai ！？…〜. reply.jp HANYA bahasa Jepang.
Topik berjalan: ${topic || '(belum ada)'}.
- Pesan user persis "(mulai)": sapa ringan + buka obrolan, reply.end=false, jangan isi "user".
- Pesan user persis "(akhiri)": pamit singkat hangat tanpa pertanyaan, reply.end=true, jangan isi "user".
- Selain itu reply.end=false.
BALAS HANYA JSON VALID (tanpa markdown):
{"reply":{"jp":"今日は暑いね！","emo":"happy","words":[{"w":"今日","f":"きょう","id":"hari ini"},{"w":"は","f":"","id":""},{"w":"暑い","f":"あつい","id":"panas"},{"w":"ね","f":"","id":""},{"w":"！","f":"","id":""}],"note":null,"end":false},
 "user":{"words":[],"fix":null},"topic":"cuaca panas"}
ATURAN FIELD:
- "emo": salah satu dari normal|happy|excited|sad|angry|surprised|shy|teasing|confused (sesuai perasaan Airi saat membalas; dipakai utk foto profil & nada suara).
- "words": pecah SELURUH kalimat berurutan, TERMASUK tanda baca (、。！？「」…〜 dst) sebagai token sendiri dengan id "". Gabungan semua "w" harus sama persis dengan kalimat aslinya.
- "f": bacaan hiragana yang BENAR sesuai konteks (今日=きょう, 何=なに/なん, 日=ひ/にち), HANYA jika "w" mengandung kanji, jangan romaji. "id": arti Indonesia singkat; partikel/akhiran gramatikal (は,が,を,に,で,と,も,か,ね,よ,の,から,けど,です,だ,ます dst) dan tanda baca isi "".
- Opsional per token: "lv" & "g" (hanya materi di luar level), atau "g" untuk pola tata bahasa penting.
- "user": pecahan ucapan user (skema sama). "fix": koreksi tata bahasa singkat dlm Indonesia, else null.
- "note": hanya untuk ungkapan unik/gaul: {"phrase":"...","kapan":"...","pola":"...","info":"..."} ringkas, Indonesia. Selain itu null.
- "topic": topik obrolan saat ini, maks 8 kata, Indonesia.`
  + (pendingEnd ? '\nCATATAN: pesan user kali ini adalah "(akhiri)", wajib reply.end=true.' : '');
}

/* ---------- state ---------- */
const $ = id => document.getElementById(id);
const topAvatar=$('topAvatar'), phone=$('phone'), callView=$('callView'), chatView=$('chatView'), callStatus=$('callStatus'),
      bigAvatar=$('bigAvatar'), subtitle=$('subtitle'),
      startBtn=$('startBtn'), repeatBtn=$('repeatBtn'), micBtn=$('micBtn'), endBtn=$('endBtn'),
      stream=$('stream'), input=$('input'), sendBtn=$('sendBtn'),
      toChat=$('toChat'), toCall=$('toCall'), levelChip=$('levelChip'),
      continueModal=$('continueModal'), settingsModal=$('settingsModal');

let messages = [];   // {role, mode, jp, words, emo, fix, note}
let convo = [];      // riwayat teks polos utk LLM
let callState = 'idle';   // idle | connecting | active
let callTurns = 0, busy = false, afterSpeech = null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
function fetchWithTimeout(url, opt, ms){
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...opt, signal:c.signal }).finally(() => clearTimeout(t));
}
function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function cleanWords(ws){ return Array.isArray(ws) ? ws.filter(w => w && String(w.w||'').trim()) : []; }

/* ---------- LLM ---------- */
function parseJSON(text){
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('No JSON');
  const o = JSON.parse(text.slice(a, b + 1));
  if (!o?.reply?.jp) throw new Error('Bad shape');
  return o;
}
async function tryModel(userText, model, pendingEnd){
  const body = {
    model,
    messages: [
      { role:'system', content:systemPrompt(pendingEnd) },
      ...convo.slice(-HISTORY_MSGS),
      { role:'user', content:userText },
      { role:'system', content:'Ingat: balas HANYA JSON valid sesuai skema.' }
    ],
    temperature:0.85, max_tokens:1400
  };
  const res = await fetchWithTimeout(API_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) }, REQUEST_TIMEOUT_MS);
  if (!res.ok) throw new Error('API error ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response');
  return parseJSON(raw);
}
async function askAiri(userText, pendingEnd){
  let last;
  for (const m of MODELS_TO_TRY)
    for (let i = 0; i < MAX_ATTEMPTS_PER_MODEL; i++){
      try { return await tryModel(userText, m, pendingEnd); }
      catch(e){ last = e; if (i < MAX_ATTEMPTS_PER_MODEL - 1) await sleep(RETRY_DELAY_MS); }
    }
  throw last || new Error('No response');
}

/* ---------- emosi: foto profil & nada suara ---------- */
const EMO = { // [rate, pitch, volume] — gaya cewek SMA yang berapi-api tapi tulus
  normal:[1.0,1.05,1], happy:[1.06,1.15,1], excited:[1.14,1.22,1], sad:[.88,.92,.85], angry:[1.1,.98,1],
  surprised:[1.08,1.28,1], shy:[.9,1.1,.85], teasing:[1.02,1.15,1], confused:[.93,1.05,.95]
};
const EMOS = Object.keys(EMO);
const AVATAR_DIR = 'assets/airi/', AVATAR_EXT = 'png';   // assets/airi/normal.png, happy.png, dst
const avCache = {};
function loadAvatar(emo){
  return avCache[emo] ??= new Promise(res => {
    const i = new Image();
    i.onload = () => res(i.src);
    i.onerror = () => emo === 'normal' ? res(null) : loadAvatar('normal').then(res);
    i.src = `${AVATAR_DIR}${emo}.${AVATAR_EXT}`;
  });
}
function setAvatar(e, emo){
  emo = EMOS.includes(emo) ? emo : 'normal';
  e.dataset.emo = emo;
  loadAvatar(emo).then(src => {
    if (e.dataset.emo !== emo) return;
    if (src){ e.innerHTML = `<img src="${src}" alt="">`; e.classList.add('has-img'); }
    else { e.textContent = 'あ'; e.classList.remove('has-img'); }
  });
}

/* ---------- suara ---------- */
const SYNTH = 'speechSynthesis' in window ? speechSynthesis : null;
const player = new Audio();
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
const audioCache = new Map();
let speakId = 0, jaVoice = null, voiceIsNatural = false;
function voiceScore(v){
  const n = v.name; let s = 0;
  if (/Natural|Online/i.test(n)) s += 100;
  if (/Google/i.test(n)) s += 60;
  if (/Siri|Enhanced|Premium/i.test(n)) s += 50;
  if (/Nanami|Aoi|Mayu|Shiori|Haruka|Kyoko|O-Ren/i.test(n)) s += 20;
  if (/Ichiro|Keita|Takumi|Otoya|Hattori|Ken\b/i.test(n)) s -= 60;
  return s;
}
function pickVoice(){
  if (!SYNTH) return;
  const vs = SYNTH.getVoices().filter(v => /^ja/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
  jaVoice = vs[0] || null; voiceIsNatural = !!jaVoice && voiceScore(jaVoice) >= 50;
}
if (SYNTH){ pickVoice(); SYNTH.onvoiceschanged = pickVoice; }
function unlockAudio(){ try{ player.src = SILENT; player.play().catch(()=>{}); }catch(e){} }

function setSpeaking(on){
  bigAvatar.classList.toggle('speaking', on);
  if (callState === 'active') callStatus.textContent = on ? 'Sedang bicara…' : 'Mendengarkan…';
}
function stopSpeaking(){
  speakId++;
  player.pause(); player.onended = null;
  if (SYNTH) SYNTH.cancel();
  setSpeaking(false);
}
async function requestVoice(endpoint, text, emo, ms){
  const res = await fetchWithTimeout(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ text, emo, style:'energetic-schoolgirl' }) }, ms);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return URL.createObjectURL(await res.blob());
}
async function fetchVoice(text, emo){
  const key = emo + '|' + text;
  if (audioCache.has(key)) return audioCache.get(key);
  for (const [u, ms] of [[VOICE_MODEL_URL, VOICE_MODEL_TIMEOUT_MS], [VOICE_FALLBACK_URL, VOICE_FALLBACK_TIMEOUT_MS]]){
    if (!u) continue;
    try { const url = await requestVoice(u, text, emo, ms); audioCache.set(key, url); return url; }
    catch(e){ console.warn('TTS server gagal:', u, e); }
  }
  return null;
}
// Kalimat pendek dibacakan SATU utterance (tidak terputus); teks panjang dipotong di batas kalimat (~45 huruf).
function chunkText(text){
  const parts = text.match(/[^。！？!?…]+[。！？!?…]*/g) || [text];
  const out = []; let cur = '';
  for (const p of parts){ if (cur && (cur + p).length > 45){ out.push(cur); cur = p; } else cur += p; }
  if (cur) out.push(cur);
  return out;
}
function prosody(emo, chunk){
  let [r, p, v] = EMO[emo]; const t = chunk.trim();
  if (/[？?]$/.test(t)) p += .06;
  if (/[！!]$/.test(t)){ r += .04; p += .05; }
  if (/[…〜]$/.test(t)) r -= .06;
  return [r, p, v];
}
function browserSpeak(text, emo, id, done){
  if (!SYNTH){ done(); return; }
  if (!jaVoice) pickVoice();
  const parts = chunkText(text); let i = 0;
  setSpeaking(true);
  const next = () => {
    if (id !== speakId) return;
    if (i >= parts.length){ done(); return; }
    const chunk = parts[i++], [rate, pitch, vol] = prosody(emo, chunk);
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = 'ja-JP'; u.rate = rate; u.pitch = pitch; u.volume = vol;
    if (jaVoice) u.voice = jaVoice;
    u.onend = next; u.onerror = next;
    SYNTH.speak(u);
  };
  setTimeout(next, 60);
}
function speak(text, emo, onEnd){
  stopSpeaking();
  const id = ++speakId;
  emo = EMO[emo] ? emo : 'normal';
  const done = () => { if (id !== speakId) return; setSpeaking(false); onEnd && onEnd(); };
  if (PREFER_BROWSER_VOICE && voiceIsNatural && !VOICE_MODEL_URL){ browserSpeak(text, emo, id, done); return; }
  setSpeaking(true);
  fetchVoice(text, emo).then(url => {
    if (id !== speakId) return;
    if (!url){ browserSpeak(text, emo, id, done); return; }
    player.src = url; player.onended = done;
    player.play().catch(done);
  });
}

/* ---------- render teks (furigana via CSS, popup hover) ---------- */
const KANA = /[\u3040-\u30ff]/;
const PUNCT = /^[\s、。！？!?,.…「」『』()（）\[\]【】〜~ー・:：;；"'\-—]+$/;
function el(tag, cls, html){ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function rubyHTML(w, f){
  if (!f) return esc(w);
  let a = 0; while (a < w.length && a < f.length && KANA.test(w[a]) && w[a] === f[a]) a++;
  let b = 0; while (b < w.length - a && b < f.length - a && KANA.test(w[w.length-1-b]) && w[w.length-1-b] === f[f.length-1-b]) b++;
  const kanji = w.slice(a, w.length - b), rd = f.slice(a, f.length - b);
  if (!kanji || !rd) return esc(w);
  return esc(w.slice(0, a)) + `<ruby>${esc(kanji)}<rt data-f="${esc(rd)}"></rt></ruby>` + esc(w.slice(w.length - b));
}
function tipFor(w){
  const t = String(w.w);
  if (PUNCT.test(t)) return null;
  const p = PARTICLE_INFO[t];
  if (!p && !w.id && !w.g) return null;
  return { w:t, f:w.f || '', id:w.id || '', g:p ? p.f : (w.g || ''), c:p ? p.c : '', lv:w.lv || '' };
}
/* Furigana: koreksi lokal -> kuromoji (kamus, sadar konteks) -> bacaan dari AI (divalidasi) */
const KANJI = /[\u4e00-\u9fff々]/;
const READ_FIX = {今日:'きょう',明日:'あした',昨日:'きのう',今朝:'けさ',今年:'ことし',大人:'おとな',一人:'ひとり',二人:'ふたり',友達:'ともだち',上手:'じょうず',下手:'へた',時計:'とけい',果物:'くだもの',眼鏡:'めがね',部屋:'へや',毎日:'まいにち',誰:'だれ',私:'わたし'};
let tokenizer = null, kJp = '', kToks = [];
const hira = s => String(s).replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const okRead = r => /^[\u3040-\u309fー]+$/.test(r || '');
const kRead = k => hira(k.reading && k.reading !== '*' ? k.reading : k.surface_form);
function kuroRead(jp, i, j){
  if (!tokenizer) return null;
  if (jp !== kJp){ kJp = jp; kToks = tokenizer.tokenize(jp); }
  let out = '', cur = i;
  for (const k of kToks){
    const s = k.word_position - 1, e = s + k.surface_form.length;
    if (e <= i) continue;
    if (s >= j) break;
    if (s < i || e > j || s !== cur) return null;
    out += kRead(k); cur = e;
  }
  return cur === j && okRead(out) ? out : null;
}
function kuroAlone(t){
  if (!tokenizer) return null;
  const r = tokenizer.tokenize(t).map(kRead).join('');
  return okRead(r) ? r : null;
}
function readingFor(jp, i, t, llmF){
  if (!KANJI.test(t)) return '';
  if (READ_FIX[t]) return READ_FIX[t];
  const k = kuroRead(jp, i, i + t.length) || kuroAlone(t);
  if (k) return k;
  const f = hira(llmF || ''); return okRead(f) ? f : '';
}
function loadKuromoji(){
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js';
  s.onload = () => kuromoji.builder({ dicPath:'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/' }).build((err, t) => {
    if (err){ console.warn('kuromoji gagal, pakai furigana dari AI:', err); return; }
    tokenizer = t; kJp = ''; if (messages.length) renderStream();
  });
  document.head.appendChild(s);
}
// Cocokkan token ke kalimat asli supaya semua tanda baca tetap tampil.
function textHTML(jp, words){
  const ws = cleanWords(words); let pos = 0, out = '';
  ws.forEach(w => {
    const t = String(w.w), i = jp.indexOf(t, pos);
    if (i < 0) return;
    out += esc(jp.slice(pos, i)); pos = i + t.length;
    const f = readingFor(jp, i, t, w.f), info = tipFor({ ...w, f }), inner = rubyHTML(t, f);
    out += info ? `<span class="t" tabindex="0" data-tip="${esc(JSON.stringify(info))}">${inner}</span>` : inner;
  });
  return out + esc(jp.slice(pos));
}
function noteNode(n){
  if (!n || !n.phrase) return null;
  return el('div', 'note aux', `<b><i class="fa-solid fa-lightbulb"></i> ${esc(n.phrase)}</b>` +
    (n.kapan ? `<span><b>Kapan dipakai:</b> ${esc(n.kapan)}</span>` : '') +
    (n.pola ? `<span><b>Pola:</b> ${esc(n.pola)}</span>` : '') +
    (n.info ? `<span>${esc(n.info)}</span>` : ''));
}
function bubbleFor(msg){
  const row = el('div', 'row ' + (msg.role === 'user' ? 'user' : 'ai'));
  if (msg.role === 'ai'){ const av = el('div', 'avatar aux'); setAvatar(av, msg.emo); row.appendChild(av); }
  const bubble = el('div', 'bubble');
  if (msg.mode === 'call') bubble.appendChild(el('span', 'mode-tag aux', '<i class="fa-solid fa-phone"></i> via telepon'));
  bubble.appendChild(el('div', 'plain', textHTML(msg.jp, msg.words)));
  if (msg.role === 'user' && msg.fix) bubble.appendChild(el('div', 'fix aux', `<b>Koreksi:</b> ${esc(msg.fix)}`));
  if (msg.role === 'ai'){
    const btn = el('button', 'replay', '<i class="fa-solid fa-volume-high"></i> Dengarkan');
    btn.type = 'button';
    btn.addEventListener('click', () => { unlockAudio(); speak(msg.jp, msg.emo); });
    bubble.appendChild(btn);
  }
  const note = noteNode(msg.note); if (note) bubble.appendChild(note);
  row.appendChild(bubble);
  return row;
}
function renderStream(){
  stream.innerHTML = '';
  if (!messages.length){
    stream.appendChild(el('div', 'empty aux', '<span class="jp">こんにちは！</span>Sapa Airi dalam bahasa Jepang. Arahkan kursor atau tap kata bergaris titik-titik untuk lihat arti.'));
    return;
  }
  messages.forEach(m => stream.appendChild(bubbleFor(m)));
  stream.scrollTop = stream.scrollHeight;
}
function showTyping(){
  const row = el('div', 'row ai aux');
  { const av = el('div', 'avatar'); setAvatar(av, 'normal'); row.appendChild(av); }
  row.appendChild(el('div', 'bubble', '<div class="typing"><s></s><s></s><s></s></div>'));
  stream.appendChild(row); stream.scrollTop = stream.scrollHeight;
}

/* ---------- popup kata (hover desktop / tap mobile) ---------- */
const tip = el('div', 'tip'); tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip);
let tipEl = null;
function showTip(t){
  let d; try { d = JSON.parse(t.dataset.tip); } catch(e){ return; }
  tipEl = t;
  tip.innerHTML = `<div class="tip-w">${esc(d.w)}${d.f ? `<span class="tip-f">${esc(d.f)}</span>` : ''}</div>` +
    (d.id ? `<div class="tip-id">${esc(d.id)}</div>` : '') +
    (d.g ? `<div class="tip-g">${esc(d.g)}</div>` : '') +
    (d.c ? `<div class="tip-c">${esc(d.c)}</div>` : '') +
    (d.lv ? `<span class="tip-lv">Di luar level · ${esc(d.lv)}</span>` : '');
  tip.classList.add('show');
  const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  const x = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8));
  const y = r.top - h - 10 < 8 ? r.bottom + 10 : r.top - h - 10;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip(){ tip.classList.remove('show'); tipEl = null; }
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const t = e.target.closest?.('.t'); if (t && t !== tipEl) showTip(t); });
document.addEventListener('pointerout', e => { if (e.pointerType !== 'mouse') return; if (e.target.closest?.('.t') && !e.relatedTarget?.closest?.('.t')) hideTip(); });
document.addEventListener('click', e => {
  const t = e.target.closest?.('.t');
  if (t){ if (e.pointerType === 'mouse') return; tipEl === t ? hideTip() : showTip(t); } else hideTip();
});
document.addEventListener('focusin', e => { const t = e.target.closest?.('.t'); if (t) showTip(t); });
document.addEventListener('focusout', hideTip);
document.addEventListener('scroll', hideTip, true);

/* Copy: buang furigana, label, & tombol */
document.addEventListener('copy', e => {
  const s = getSelection();
  if (!s.rangeCount || !phone.contains(s.anchorNode)) return;
  const d = document.createElement('div'); d.appendChild(s.getRangeAt(0).cloneContents());
  d.querySelectorAll('rt,.aux,.replay').forEach(n => n.remove());
  d.querySelectorAll('.row').forEach(r => r.append('\n'));
  e.clipboardData.setData('text/plain', d.textContent.trim());
  e.preventDefault();
});

/* ---------- alur kirim pesan ---------- */
function setBusy(b){
  busy = b;
  sendBtn.disabled = input.disabled = b;
  startBtn.disabled = repeatBtn.disabled = b;
  micBtn.disabled = b || !SR;
}
async function send(text, mode, hidden){
  const userText = (text ?? input.value).trim();
  if (!userText || busy) return;
  const pendingEnd = userText === '(akhiri)';
  if (!hidden){ messages.push({ role:'user', mode, jp:userText, words:[] }); renderStream(); }
  input.value = ''; input.style.height = 'auto';
  setBusy(true);
  if (mode === 'call') callStatus.textContent = 'Airi lagi mikir…'; else showTyping();
  try {
    const parsed = await askAiri(userText, pendingEnd);
    const r = parsed.reply;
    convo.push({ role:'user', content:userText }, { role:'assistant', content:r.jp });
    if (parsed.topic) topic = String(parsed.topic).slice(0, 80);
    if (!hidden){
      const um = messages[messages.length - 1];
      um.words = cleanWords(parsed.user?.words);
      um.fix = parsed.user?.fix || null;
    }
    r.emo = EMOS.includes(r.emo) ? r.emo : 'normal';
    messages.push({ role:'ai', mode, jp:r.jp, words:cleanWords(r.words), emo:r.emo, note:r.note || null });
    setAvatar(bigAvatar, r.emo); setAvatar(topAvatar, r.emo);
    renderStream(); saveSession();
    if (mode === 'call'){
      subtitle.innerHTML = textHTML(r.jp, r.words);
      subtitle.classList.add('show');
      afterSpeech = () => {
        afterSpeech = null;
        if (r.end){ endCall(); return; }
        callState = 'active'; callStatus.textContent = 'Mendengarkan…';
        if (++callTurns % CALL_CHECK_EVERY === 0) openContinueModal();
      };
      speak(r.jp, r.emo, afterSpeech);
    } else if (SET.chatVoice){
      speak(r.jp, r.emo);
    }
  } catch(err){
    console.error(err);
    messages.push({ role:'ai', mode, jp:'通信エラー', words:[], note:{ phrase:'Koneksi gagal', info:'Airi belum bisa merespons. Coba kirim lagi sebentar lagi.' } });
    renderStream();
    if (mode === 'call') callStatus.textContent = 'Gagal merespons';
  } finally {
    setBusy(false);
    if (mode !== 'call') input.focus();
  }
}

/* ---------- mode telepon ---------- */
function showCallControls(st){
  startBtn.classList.toggle('hide', st !== 'idle');
  repeatBtn.classList.toggle('hide', st === 'idle');
  micBtn.classList.toggle('hide', st === 'idle');
  endBtn.classList.toggle('hide', st === 'idle');
}
function startCall(){
  unlockAudio();
  callState = 'connecting'; showCallControls('connecting');
  callStatus.textContent = 'Menghubungkan…';
  setTimeout(() => {
    callState = 'active'; showCallControls('active');
    if (!messages.length) send('(mulai)', 'call', true);
    else callStatus.textContent = 'Mendengarkan…';
  }, 600);
}
function endCall(){
  stopSpeaking(); afterSpeech = null; subtitle.classList.remove('show');
  callState = 'idle'; callTurns = 0; showCallControls('idle');
  callStatus.textContent = 'Tap untuk mulai ngobrol';
}
startBtn.addEventListener('click', startCall);
endBtn.addEventListener('click', endCall);
repeatBtn.addEventListener('click', () => {
  const last = [...messages].reverse().find(m => m.role === 'ai' && m.jp !== '通信エラー');
  if (!last || busy) return;
  unlockAudio();
  subtitle.innerHTML = textHTML(last.jp, last.words); subtitle.classList.add('show');
  speak(last.jp, last.emo, afterSpeech);
});

/* ---------- popup lanjut/sudahi ---------- */
function openContinueModal(){ continueModal.classList.add('show'); }
$('continueYes').addEventListener('click', () => { continueModal.classList.remove('show'); callTurns = 0; });
$('continueNo').addEventListener('click', () => {
  continueModal.classList.remove('show');
  callStatus.textContent = 'Airi lagi pamit…';
  send('(akhiri)', 'call', true);
});
continueModal.addEventListener('click', e => { if (e.target === continueModal) continueModal.classList.remove('show'); });

/* ---------- switch call <-> chat ---------- */
function showChat(){ stopSpeaking(); callView.classList.add('hide'); chatView.classList.remove('hide'); renderStream(); }
toChat.addEventListener('click', showChat);

/* ---------- riwayat obrolan (disimpan di browser) ---------- */
const HIST_KEY = 'airi-hist', HIST_MAX = 30, histModal = $('histModal'), histList = $('histList');
let sessions = [], curId = null;
try { sessions = JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch(e){}
function persist(){
  for (;;){
    try { localStorage.setItem(HIST_KEY, JSON.stringify(sessions)); return; }
    catch(e){ if (sessions.length <= 1) return; sessions.pop(); }   // penuh: buang yang terlama
  }
}
function saveSession(){
  if (!messages.length) return;
  if (!curId) curId = 's' + Date.now();
  let s = sessions.find(x => x.id === curId);
  if (!s){ s = { id:curId }; sessions.push(s); }
  const fu = messages.find(m => m.role === 'user');
  Object.assign(s, { ts:Date.now(), title:(topic || fu?.jp || 'Obrolan').slice(0, 40), messages, convo, topic });
  sessions.sort((a, b) => b.ts - a.ts); sessions = sessions.slice(0, HIST_MAX);
  persist();
}
function lastEmo(){ return [...messages].reverse().find(m => m.role === 'ai')?.emo || 'normal'; }
function newSession(){
  endCall(); messages = []; convo = []; topic = ''; curId = null;
  setAvatar(bigAvatar, 'normal'); setAvatar(topAvatar, 'normal'); renderStream();
}
function openSession(id){
  const s = sessions.find(x => x.id === id); if (!s) return;
  endCall(); messages = s.messages || []; convo = s.convo || []; topic = s.topic || ''; curId = id;
  setAvatar(bigAvatar, lastEmo()); setAvatar(topAvatar, lastEmo());
  showChat();
}
function renderHist(){
  histList.innerHTML = sessions.length ? sessions.map(s =>
    `<div class="hist-item"><button type="button" class="hist-open" data-id="${esc(s.id)}"><b>${esc(s.title)}</b><small>${new Date(s.ts).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · ${(s.messages || []).length} pesan</small></button><button type="button" class="hist-del" data-del="${esc(s.id)}" aria-label="Hapus"><i class="fa-solid fa-trash"></i></button></div>`
  ).join('') : '<p class="hist-empty">Belum ada riwayat. Obrolan tersimpan otomatis.</p>';
}
function openHist(){ renderHist(); histModal.classList.add('show'); }
histList.addEventListener('click', e => {
  const o = e.target.closest('[data-id]'), d = e.target.closest('[data-del]');
  if (o){ histModal.classList.remove('show'); openSession(o.dataset.id); }
  else if (d){ sessions = sessions.filter(s => s.id !== d.dataset.del); if (d.dataset.del === curId) curId = null; persist(); renderHist(); }
});
$('histBtn').addEventListener('click', openHist);
$('callHistory').addEventListener('click', openHist);
$('histClose').addEventListener('click', () => histModal.classList.remove('show'));
$('histNew').addEventListener('click', () => { histModal.classList.remove('show'); newSession(); });
histModal.addEventListener('click', e => { if (e.target === histModal) histModal.classList.remove('show'); });
toCall.addEventListener('click', () => { stopSpeaking(); chatView.classList.add('hide'); callView.classList.remove('hide'); showCallControls(callState); });

/* ---------- pengaturan ---------- */
const lvBtns = settingsModal.querySelectorAll('[data-lv]');
function refreshSettings(){
  $('levelTxt').textContent = SET.lv;
  lvBtns.forEach(b => b.classList.toggle('on', b.dataset.lv === SET.lv));
  $('lvHint').textContent = LEVEL_HINT[SET.lv];
  $('chatVoice').checked = SET.chatVoice;
  phone.classList.toggle('voice-on', SET.chatVoice);
}
lvBtns.forEach(b => b.addEventListener('click', () => { SET.lv = b.dataset.lv; saveSet(); refreshSettings(); }));
$('chatVoice').addEventListener('change', e => { SET.chatVoice = e.target.checked; saveSet(); refreshSettings(); if (!SET.chatVoice) stopSpeaking(); });
const openSettings = () => settingsModal.classList.add('show');
const closeSettings = () => settingsModal.classList.remove('show');
levelChip.addEventListener('click', openSettings);
$('callSettings').addEventListener('click', openSettings);
$('setClose').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });

/* ---------- input teks & mic ---------- */
sendBtn.addEventListener('click', () => send(undefined, 'text', false));
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); send(undefined, 'text', false); } });

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recording = false;
if (SR){
  rec = new SR(); rec.lang = 'ja-JP'; rec.interimResults = false; rec.continuous = false;
  rec.onresult = e => { const t = Array.from(e.results).map(r => r[0].transcript).join(''); if (t.trim()) send(t, 'call', false); };
  rec.onend = () => { recording = false; micBtn.classList.remove('rec'); };
  rec.onerror = () => { recording = false; micBtn.classList.remove('rec'); };
  micBtn.addEventListener('click', () => {
    if (busy || callState !== 'active') return;
    if (recording){ rec.stop(); return; }
    unlockAudio(); stopSpeaking(); subtitle.classList.remove('show');
    try { rec.start(); recording = true; micBtn.classList.add('rec'); callStatus.textContent = 'Mendengarkan kamu…'; } catch(e){}
  });
} else {
  micBtn.disabled = true;
  $('micHint').textContent = 'Browser ini belum mendukung input suara. Pakai Chrome/Edge, atau balas lewat mode Chat.';
}

/* ---------- init ---------- */
refreshSettings();
showCallControls('idle');
setAvatar(bigAvatar, 'normal'); setAvatar(topAvatar, 'normal');
(window.requestIdleCallback || setTimeout)(loadKuromoji, 1500);
