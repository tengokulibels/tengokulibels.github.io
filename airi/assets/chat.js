/* ============================================================
   AIRI — Telepon & Chat Latihan Bahasa Jepang
   LLM  : proxy Cloudflare Worker (Groq)
   Suara: Cloudflare Worker (Workers AI - MeloTTS), fallback suara browser
   ============================================================ */
const API_URL = "https://airi-groq-proxy.raditya-alfarezah12.workers.dev";
// Suara model asli (.pth) di Render. Kosongkan "" kalau service Render belum di-deploy.
// Render plan kecil bisa "tidur" & butuh waktu bangun -> timeout dibuat panjang.
const VOICE_MODEL_URL = "";                     // contoh: "https://airi-voice-xxxx.onrender.com/tts"
const VOICE_MODEL_TIMEOUT_MS = 60000;
// Cadangan: suara Jepang umum (MeloTTS via Cloudflare Worker), dipakai kalau
// VOICE_MODEL_URL kosong / gagal / Render belum bangun.
const VOICE_FALLBACK_URL = "https://airi-voice.tengokulibels15.workers.dev/";
const VOICE_FALLBACK_TIMEOUT_MS = 20000;
const MODELS_TO_TRY = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const REQUEST_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 700;
const MAX_ATTEMPTS_PER_MODEL = 2;
const CALL_CHECK_EVERY = 6; // tiap N balasan AI dalam telepon, tanya lanjut/sudahi

const LEVELS = {
  1:'SANGAT MUDAH: kalimat 3-6 kata, です/ます, kosakata paling dasar',
  2:'MUDAH: kalimat pendek 5-8 kata, です/ます, kosakata N5 dasar',
  3:'SEDANG: kosakata & tata bahasa N5, kalimat sampai 10 kata, boleh sedikit santai',
  4:'CUKUP SULIT: N5 lanjut-N4 awal, bentuk て/たい/ている, gaya santai ala anak muda',
  5:'SULIT: N4, kalimat majemuk, banyak bentuk biasa (tanpa です/ます) ala ngobrol JK',
};
const PARTICLE_INFO = {
  'は':{f:'Penanda topik kalimat',c:'私は学生です — Aku murid'},
  'が':{f:'Penanda subjek',c:'猫が好き — Suka kucing'},
  'を':{f:'Penanda objek langsung',c:'パンを食べる — Makan roti'},
  'に':{f:'Penanda waktu / tujuan / lokasi tujuan',c:'学校に行く — Pergi ke sekolah'},
  'で':{f:'Penanda tempat aktivitas / alat',c:'電車で行く — Pergi naik kereta'},
  'と':{f:'Penanda "dengan" / "dan"',c:'友達と話す — Ngobrol sama teman'},
  'も':{f:'Penanda "juga"',c:'私も行く — Aku juga pergi'},
  'か':{f:'Penanda pertanyaan',c:'元気ですか — Kabar baik?'},
  'ね':{f:'Partikel akhir, minta persetujuan ("ya kan?")',c:'いいね — Bagus ya'},
  'よ':{f:'Partikel akhir, menegaskan info baru',c:'もう遅いよ — Udah telat lho'},
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

function systemPrompt(level, pendingEnd){
  return `Kamu adalah "Hoshizora Airi", cewek SMA Jepang, anggota klub TENGOKU (bahasa & budaya Jepang SMAN 15 Surabaya). Kepribadian: ceria, agak ceroboh, tsundere ringan, tapi ramah dan suportif.
TUGAS: ngobrol santai sehari-hari dengan user (pelajar Indonesia belajar Jepang) seolah dia temen sekelasmu — sekolah, PR, bekal, klub, HP, drama, jajan, rencana weekend, dll. Lanjutkan topik secara alami dari riwayat chat, jangan ulang-ulang skema yang sama.
Tingkat kesulitan (${level}/5): ${LEVELS[level]}.
GAYA BICARA: santai & gaul ala JK (siswi SMA Jepang), BUKAN kaku seperti buku pelajaran — boleh pakai ekspresi kayak じゃん/だよね/やば kalau levelnya memungkinkan.
ATURAN:
- reply.jp HANYA bahasa Jepang, 1-2 kalimat pendek, biasanya ditutup pertanyaan/ajakan biar user balas. Jangan campur bahasa lain.
- Kalau pesan user persis "(mulai)": buka obrolan dengan sapaan ringan + 1 pertanyaan santai, reply.end=false, jangan isi "user".
- Kalau pesan user persis "(akhiri)": tutup obrolan dengan pamit singkat & hangat (TANPA pertanyaan balik), reply.end=true, jangan isi "user".
- Selain itu reply.end selalu false.
- Kalau user salah/kurang nyambung, tetap lanjut dengan ramah & sederhanakan.
BALAS HANYA JSON VALID (tanpa markdown/teks lain):
{"reply":{"jp":"...","furi":[["今日","きょう"],["は",""]],"words":[{"w":"今日","f":"きょう","id":"hari ini"},{"w":"は","f":"","id":""}],"note":null,"end":false},
 "user":{"words":[{"w":"...","f":"...","id":"..."}],"fix":null,"note":null}}
- "words": pecah seluruh kalimat per kata/partikel sesuai urutan (tanpa tanda baca). "f": bacaan hiragana HANYA jika "w" ada kanji, selain itu "". "id": arti Indonesia singkat; KHUSUS partikel/akhiran gramatikal (は,が,を,に,で,と,も,か,ね,よ,の,から,まで,けど,し,です,だ,ます, dsb) isi "id" dengan string kosong "".
- "furi": kalimat sama dipecah jadi pasangan [teks,hiragana] untuk subtitle; "" kalau bagian itu tanpa kanji.
- "user": pecahan kata ucapan user (schema sama, tanpa romaji). "fix": koreksi tata bahasa singkat dlm Indonesia kalau ada, else null.
- "note": isi HANYA untuk ungkapan unik/gaul/khas (misal ちょっと、やばい、じゃあね). Bentuk {"phrase":"...","kapan":"...","pola":"...","info":"..."} ringkas dlm Indonesia. Selain itu null.`
  + (pendingEnd ? '\nCATATAN: pesan user kali ini adalah trigger "(akhiri)", wajib reply.end=true.' : '');
}

/* ---------- state ---------- */
const $ = id => document.getElementById(id);
const callView=$('callView'), chatView=$('chatView'), callStatus=$('callStatus'),
      bigAvatar=$('bigAvatar'), subtitle=$('subtitle'),
      startBtn=$('startBtn'), repeatBtn=$('repeatBtn'), micBtn=$('micBtn'), endBtn=$('endBtn'),
      stream=$('stream'), input=$('input'), sendBtn=$('sendBtn'), statusEl=$('statusEl'),
      toChat=$('toChat'), toCall=$('toCall'), levelChip=$('levelChip'),
      continueModal=$('continueModal'), particleModal=$('particleModal');

let messages = [];           // {role:'user'|'ai', mode:'call'|'text', jp, words, furi, fix, note}
let convo = [];               // riwayat utk LLM: {role,content}
let level = 2;
try { level = Math.min(5, Math.max(1, +localStorage.getItem('airi-level') || 2)); } catch(e){}
function saveLevel(){ try{ localStorage.setItem('airi-level', level); }catch(e){} }
function refreshLevelChip(){ levelChip.textContent = 'Lv ' + level; }

let callState = 'idle';       // idle | connecting | active | ending
let callTurns = 0, busy = false, lastAiText = '';

/* ---------- util ---------- */
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
    messages: [{ role:'system', content:systemPrompt(level, pendingEnd) }, ...convo.slice(-10), { role:'user', content:userText }],
    temperature:0.75, max_tokens:1300
  };
  const res = await fetchWithTimeout(API_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) }, REQUEST_TIMEOUT_MS);
  if (!res.ok) throw new Error('API error ' + res.status);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty response');
  return { raw, parsed: parseJSON(raw) };
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

/* ---------- suara ---------- */
const audioCache = new Map();
let currentAudio = null;
function setSpeaking(on){ bigAvatar.classList.toggle('speaking', on); if (callState==='active') callStatus.textContent = on ? 'Sedang bicara…' : 'Mendengarkan…'; }
function stopSpeaking(){
  if (currentAudio){ currentAudio.pause(); currentAudio = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  setSpeaking(false);
}
async function requestVoice(endpoint, text, timeoutMs){
  const res = await fetchWithTimeout(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ text }) }, timeoutMs);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return URL.createObjectURL(await res.blob());
}
async function fetchVoice(text){
  if (audioCache.has(text)) return audioCache.get(text);
  if (VOICE_MODEL_URL){
    try {
      const url = await requestVoice(VOICE_MODEL_URL, text, VOICE_MODEL_TIMEOUT_MS);
      audioCache.set(text, url); return url;
    } catch(e){ console.warn('Voice model (Render) gagal/belum bangun, coba cadangan:', e); }
  }
  if (VOICE_FALLBACK_URL){
    try {
      const url = await requestVoice(VOICE_FALLBACK_URL, text, VOICE_FALLBACK_TIMEOUT_MS);
      audioCache.set(text, url); return url;
    } catch(e){ console.warn('Voice fallback gagal, pakai suara browser:', e); }
  }
  return null;
}
function speak(text, onEnd){
  stopSpeaking();
  fetchVoice(text).then(url => {
    setSpeaking(true);
    if (url){
      currentAudio = new Audio(url);
      currentAudio.onended = () => { setSpeaking(false); onEnd && onEnd(); };
      currentAudio.play().catch(() => { setSpeaking(false); onEnd && onEnd(); });
    } else if ('speechSynthesis' in window){
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP'; u.rate = 0.92;
      const v = speechSynthesis.getVoices().find(v => v.lang.startsWith('ja')); if (v) u.voice = v;
      u.onend = u.onerror = () => { setSpeaking(false); onEnd && onEnd(); };
      speechSynthesis.speak(u);
    } else { setSpeaking(false); onEnd && onEnd(); }
  });
}

/* ---------- render ---------- */
function el(tag, cls, html){ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function wChip(w){
  const isParticle = !!PARTICLE_INFO[w.w];
  const main = w.f ? `<ruby>${esc(w.w)}<rt>${esc(w.f)}</rt></ruby>` : esc(w.w);
  const span = el('span', 'w' + (isParticle ? ' particle' : ''), `<b>${main}</b>${isParticle ? '' : `<small>${esc(w.id)}</small>`}`);
  if (isParticle) span.querySelector('b').addEventListener('click', () => openParticle(w.w));
  return span;
}
function wordsHTML(words){
  const ws = cleanWords(words);
  if (!ws.length) return null;
  const wrap = el('div', 'words');
  ws.forEach(w => wrap.appendChild(wChip(w)));
  return wrap;
}
function furiHTML(furi, fallback){
  if (!Array.isArray(furi) || !furi.length) return esc(fallback);
  return furi.map(p => p[1] ? `<ruby>${esc(p[0])}<rt>${esc(p[1])}</rt></ruby>` : esc(p[0])).join('');
}
function noteNode(n){
  if (!n || !n.phrase) return null;
  return el('div', 'note', `<b><i class="fa-solid fa-lightbulb"></i> ${esc(n.phrase)}</b>` +
    (n.kapan ? `<span><b>Kapan dipakai:</b> ${esc(n.kapan)}</span>` : '') +
    (n.pola ? `<span><b>Pola:</b> ${esc(n.pola)}</span>` : '') +
    (n.info ? `<span>${esc(n.info)}</span>` : ''));
}
function bubbleFor(msg){
  const row = el('div', 'row ' + (msg.role === 'user' ? 'user' : 'ai'));
  if (msg.role === 'ai') row.appendChild(el('div', 'avatar jp', 'あ'));
  const bubble = el('div', 'bubble');
  if (msg.mode === 'call') bubble.appendChild(el('span', 'mode-tag', '<i class="fa-solid fa-phone"></i> via telepon'));
  const wnode = wordsHTML(msg.words);
  bubble.appendChild(wnode || el('div', 'plain', esc(msg.jp)));
  if (msg.role === 'user' && msg.fix) bubble.appendChild(el('div', 'fix', `<b>Koreksi:</b> ${esc(msg.fix)}`));
  if (msg.role === 'ai'){
    const btn = el('button', 'replay', '<i class="fa-solid fa-rotate-right"></i> Dengarkan');
    btn.type = 'button';
    btn.addEventListener('click', () => speak(msg.jp));
    bubble.appendChild(btn);
  }
  const note = noteNode(msg.note); if (note) bubble.appendChild(note);
  row.appendChild(bubble);
  return row;
}
function renderStream(){
  stream.innerHTML = '';
  messages.forEach(m => stream.appendChild(bubbleFor(m)));
  stream.scrollTop = stream.scrollHeight;
}
function openParticle(p){
  const info = PARTICLE_INFO[p] || { f:'Partikel/akhiran gramatikal', c:'' };
  $('particleWord').textContent = p;
  $('particleFungsi').textContent = info.f;
  $('particleContoh').textContent = info.c;
  particleModal.classList.add('show');
}
particleModal.addEventListener('click', e => { if (e.target === particleModal) particleModal.classList.remove('show'); });
$('particleClose').addEventListener('click', () => particleModal.classList.remove('show'));

/* ---------- alur kirim pesan ---------- */
function setBusy(b){
  busy = b;
  sendBtn.disabled = input.disabled = b;
  micBtn.disabled = startBtn.disabled = repeatBtn.disabled = b;
}
async function send(text, mode, hidden){
  const userText = (text ?? input.value).trim();
  if (!userText || busy) return;
  const pendingEnd = userText === '(akhiri)';
  if (!hidden){
    messages.push({ role:'user', mode, jp:userText, words:[] });
    renderStream();
  }
  input.value = ''; input.style.height = 'auto';
  setBusy(true);
  if (mode === 'call') callStatus.textContent = 'Airi lagi mikir…';
  try {
    const { raw, parsed } = await askAiri(userText, pendingEnd);
    convo.push({ role:'user', content:userText }, { role:'assistant', content:raw });
    if (!hidden){
      const um = messages[messages.length - 1];
      const uw = cleanWords(parsed.user?.words);
      if (uw.length) um.words = uw;
      um.fix = parsed.user?.fix || null;
    }
    const r = parsed.reply;
    lastAiText = r.jp;
    messages.push({ role:'ai', mode, jp:r.jp, words:cleanWords(r.words), furi:r.furi, note:r.note || null });
    renderStream();
    if (mode === 'call'){
      subtitle.innerHTML = furiHTML(r.furi, r.jp);
      subtitle.classList.add('show');
      speak(r.jp, () => {
        if (r.end){ endCall(); return; }
        callState = 'active'; callStatus.textContent = 'Mendengarkan…';
        callTurns++;
        if (callTurns % CALL_CHECK_EVERY === 0) openContinueModal();
      });
    } else {
      speak(r.jp);
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
  callState = 'connecting'; showCallControls('connecting');
  callStatus.textContent = 'Menghubungkan…';
  setTimeout(() => {
    callState = 'active'; showCallControls('active');
    if (!messages.length) send('(mulai)', 'call', true);
    else { callStatus.textContent = 'Mendengarkan…'; }
  }, 600);
}
function endCall(){
  stopSpeaking(); subtitle.classList.remove('show');
  callState = 'idle'; callTurns = 0; showCallControls('idle');
  callStatus.textContent = 'Tap untuk mulai ngobrol';
}
startBtn.addEventListener('click', startCall);
endBtn.addEventListener('click', endCall);
repeatBtn.addEventListener('click', () => {
  if (!lastAiText) return;
  const last = [...messages].reverse().find(m => m.role === 'ai');
  if (last){ subtitle.innerHTML = furiHTML(last.furi, last.jp); subtitle.classList.add('show'); }
  speak(lastAiText);
});

/* ---------- popup lanjut/sudahi ---------- */
function openContinueModal(){ if (!continueModal.classList.contains('show')) continueModal.classList.add('show'); }
$('continueYes').addEventListener('click', () => { continueModal.classList.remove('show'); callTurns = 0; });
$('continueNo').addEventListener('click', () => {
  continueModal.classList.remove('show');
  callStatus.textContent = 'Airi lagi pamit…';
  send('(akhiri)', 'call', true);
});
continueModal.addEventListener('click', e => { if (e.target === continueModal) continueModal.classList.remove('show'); });

/* ---------- switch call <-> chat ---------- */
toChat.addEventListener('click', () => { callView.classList.add('hide'); chatView.classList.remove('hide'); renderStream(); });
toCall.addEventListener('click', () => { chatView.classList.add('hide'); callView.classList.remove('hide'); showCallControls(callState); });
levelChip.addEventListener('click', () => openRate());

/* ---------- penilaian tingkat (manual) ---------- */
const rateModal = $('rateModal');
function openRate(){ rateModal.classList.add('show'); }
rateModal.querySelectorAll('[data-rate]').forEach(b => b.addEventListener('click', () => {
  level = Math.min(5, Math.max(1, level + (+b.dataset.rate)));
  saveLevel(); refreshLevelChip(); rateModal.classList.remove('show');
}));
$('rateSkip').addEventListener('click', () => rateModal.classList.remove('show'));
rateModal.addEventListener('click', e => { if (e.target === rateModal) rateModal.classList.remove('show'); });

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
    stopSpeaking(); subtitle.classList.remove('show');
    try { rec.start(); recording = true; micBtn.classList.add('rec'); callStatus.textContent = 'Mendengarkan kamu…'; } catch(e){}
  });
} else {
  micBtn.disabled = true;
  $('micHint').textContent = 'Browser ini belum mendukung input suara. Pakai Chrome/Edge, atau balas lewat mode Chat.';
}

/* ---------- init ---------- */
refreshLevelChip();
showCallControls('idle');
if ('speechSynthesis' in window) speechSynthesis.getVoices();
