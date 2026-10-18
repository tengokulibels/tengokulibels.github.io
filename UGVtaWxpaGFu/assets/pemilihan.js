/* ============================================================
   TENGOKU — PEMILIHAN PENGURUS
   Mengirim langsung ke Google Form (tanpa menampilkan formnya).
   ============================================================ */
(function(){
  const app = document.getElementById('voteApp');
  if (!app) return;

  /* ---------- Konfigurasi ---------- */
  const FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSeQi1nVTWkt-V6GCSBdU5buPCAxcY-r4oJ3_dEo9xPQkkW6Iw/formResponse';

  // Nama WAJIB persis sama dengan opsi di Google Form (titik & huruf besar/kecil berpengaruh).
  // TEMPLATE: taruh foto kandidat di images/kandidat/ dengan nama file di bawah.
  const CANDIDATES = [
    { id:'arsy',     name:'Arsy Maulana P.',        photo:'images/kandidat/arsy-maulana.png' },
    { id:'rizky',    name:'Muhammad Rizky A.',      photo:'images/kandidat/muhammad-rizky.jpeg' },
    { id:'galih',    name:'Muhammad Galih A.',      photo:'images/kandidat/muhammad-galih.jpeg' },
    { id:'rangga',   name:'Rangga Adinata B.',      photo:'images/kandidat/rangga-adinata.jpeg' },
    { id:'rakha',    name:'Rakha Umar G.',          photo:'images/kandidat/rakha-umar.jpeg' },
    { id:'fajrina',  name:'Fajrina Siti Nur A. D.', photo:'images/kandidat/fajrina-siti.jpeg' },
    { id:'rana',     name:'Rana Salsabil F.',       photo:'images/kandidat/rana-salsabil.jpeg' },
    { id:'khalisha', name:'Khalisha Nadya S.',      photo:'images/kandidat/khalisha-nadya.jpeg' },
  ];

  const ROLES = [
    { key:'ketua',      label:'Ketua',          jp:'会長',   entry:'entry.460066342',  max:1,
      desc:'Pilih 1 orang yang paling pantas memimpin Tengoku.',
      old:[{ src:'images/pengurus-lama/ketua.png', cap:'Ketua sebelumnya' }] },
    { key:'wakil',      label:'Wakil Ketua',    jp:'副会長', entry:'entry.1254997608', max:1,
      desc:'Pilih 1 orang yang mendampingi dan menggantikan ketua saat berhalangan.',
      old:[{ src:'images/pengurus-lama/wakil.png', cap:'Wakil sebelumnya' }] },
    { key:'sekretaris', label:'Sekretaris',     jp:'書記',   entry:'entry.448179995',  max:2,
      desc:'Pilih 2 orang yang mengurus administrasi, surat, dan dokumentasi.',
      old:[{ src:'images/pengurus-lama/sekretaris-1.png', cap:'Sekretaris sebelumnya' },
           { src:'images/pengurus-lama/sekretaris-2.png', cap:'Sekretaris sebelumnya' }] },
    { key:'bendahara',  label:'Bendahara',      jp:'会計',   entry:'entry.1215246785', max:2,
      desc:'Pilih 2 orang yang mengelola keuangan dan kas klub.',
      old:[{ src:'images/pengurus-lama/bendahara-1.png', cap:'Bendahara sebelumnya' },
           { src:'images/pengurus-lama/bendahara-2.png', cap:'Bendahara sebelumnya' }] },
  ];
  const CONFIRM = ROLES.length;           // indeks langkah konfirmasi
  const STEP_COUNT = ROLES.length + 1;

  /* ---------- State ---------- */
  const state = { step:0, picks:{ ketua:[], wakil:[], sekretaris:[], bendahara:[] }, sending:false, error:'', done:false };

  /* ---------- Helper ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cand = id => CANDIDATES.find(c => c.id === id);
  const initials = name => name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  const roleDone = r => state.picks[r.key].length === r.max;
  const allDone = () => ROLES.every(roleDone);
  const roleOf = id => ROLES.find(r => state.picks[r.key].includes(id));
  const img = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.display='none'">`;
  let lastPopped = null;
  let animate = false;   // animasi panel hanya saat pindah langkah

  /* ---------- Komponen ---------- */
  function pairHTML(role, slot){
    const old = role.old[slot];
    const pickId = state.picks[role.key][slot];
    const c = pickId ? cand(pickId) : null;
    const label = role.max > 1 ? `${role.label} ${slot+1}` : role.label;
    const pop = c && lastPopped === `${role.key}:${slot}:${pickId}` ? ' pop' : '';
    return `
    <div class="pair${c ? ' filled' : ''}">
      <div class="pair-role">${esc(label)}</div>
      <div class="pair-row">
        <div class="pair-fig old">
          <div class="pair-photo">${img(old.src, old.cap)}</div>
          <div class="pair-cap"><small>Dulu</small>${esc(old.cap)}</div>
        </div>
        <div class="pair-arrow" aria-hidden="true">→</div>
        <div class="pair-fig new">
          ${c
            ? `<div class="pair-photo${pop}"><span class="ini jp">${esc(initials(c.name))}</span>${img(c.photo, c.name)}</div>
               <div class="pair-cap"><small>Pilihanmu</small>${esc(c.name)}</div>`
            : `<div class="pair-photo empty"><span class="ini">?</span></div>
               <div class="pair-cap none"><small>Pilihanmu</small>Belum dipilih</div>`}
        </div>
      </div>
    </div>`;
  }

  function stepperHTML(){
    const items = ROLES.map((r, i) => {
      const n = state.picks[r.key].length;
      const cls = ['vstep', i === state.step ? 'active' : '', roleDone(r) ? 'done' : ''].join(' ');
      return `<button type="button" class="${cls}" data-step="${i}">
        <span class="vstep-num">${roleDone(r) ? '✓' : i+1}</span>
        <span class="vstep-label">${esc(r.label)}</span>
        <span class="vstep-count">${n}/${r.max}</span></button>`;
    }).join('');
    const cls = ['vstep', state.step === CONFIRM ? 'active' : '', ''].join(' ');
    return `<div class="vote-steps">${items}
      <button type="button" class="${cls}" data-step="${CONFIRM}" ${allDone() ? '' : 'disabled'}>
        <span class="vstep-num">${STEP_COUNT}</span><span class="vstep-label">Kirim</span><span class="vstep-count">${allDone() ? 'siap' : 'terkunci'}</span></button></div>`;
  }

  function roleStepHTML(role){
    const picks = state.picks[role.key];
    const pairs = role.old.map((_, i) => pairHTML(role, i)).join('');
    const cards = CANDIDATES.map(c => {
      const sel = picks.includes(c.id);
      const other = !sel && roleOf(c.id);
      const cls = ['cand', sel ? 'selected' : '', other ? 'taken' : ''].join(' ');
      const stateTxt = sel ? `Dipilih sebagai ${role.label}` : other ? `Sudah jadi ${other.label}` : 'Ketuk untuk memilih';
      return `<button type="button" class="${cls}" data-cand="${c.id}" ${other ? 'disabled aria-disabled="true"' : ''} aria-pressed="${sel}">
        <span class="cand-check" aria-hidden="true">✓</span>
        <span class="cand-photo"><span class="ini jp">${esc(initials(c.name))}</span>${img(c.photo, c.name)}</span>
        <span class="cand-body"><span class="cand-name">${esc(c.name)}</span><span class="cand-state">${esc(stateTxt)}</span></span>
      </button>`;
    }).join('');
    const last = state.step === ROLES.length - 1;
    const msg = roleDone(role) ? '' : `Pilih ${role.max - picks.length} orang lagi untuk lanjut`;
    return `
    <div class="vpanel${animate ? ' enter' : ''}">
      <div class="vpanel-head">
        <div><span class="jp">${role.jp}</span><h3>Pilih ${esc(role.label)}</h3><p>${esc(role.desc)}</p></div>
        <div class="vcounter"><b>${picks.length}</b> / ${role.max} dipilih</div>
      </div>
      <div class="pairs${role.max === 1 ? ' single' : ''}">${pairs}</div>
      <div class="vlabel">8 Kandidat <span>Setiap orang hanya boleh menempati satu jabatan</span></div>
      <div class="cand-grid">${cards}</div>
      <p class="vhint">Kandidat yang sudah kamu pilih di jabatan lain terkunci. Untuk memindahkannya, buka jabatan tersebut lalu ketuk kembali kandidatnya untuk membatalkan.</p>
      <div class="vnav">
        <button type="button" class="btn btn-ghost" data-nav="prev" ${state.step === 0 ? 'disabled' : ''}>← Kembali</button>
        <span class="vnav-msg">${esc(msg)}</span>
        <button type="button" class="btn btn-primary" data-nav="next" ${roleDone(role) ? '' : 'disabled'}>${last ? 'Tinjau Pilihan' : 'Lanjut'} →</button>
      </div>
    </div>`;
  }

  function reviewGrid(){
    return `<div class="review-grid">${ROLES.map(r => r.old.map((_, i) => pairHTML(r, i)).join('')).join('')}</div>`;
  }

  function confirmHTML(){
    return `
    <div class="vpanel${animate ? ' enter' : ''}">
      <div class="vpanel-head">
        <div><span class="jp">確認</span><h3>Tinjau Pilihanmu</h3>
        <p>Periksa lagi susunan pengurus pilihanmu. Setelah dikirim, jawaban langsung masuk ke tim pengurus.</p></div>
      </div>
      ${reviewGrid()}
      ${state.error ? `<div class="vsend-error">${esc(state.error)}</div>` : ''}
      <div class="vnav">
        <button type="button" class="btn btn-ghost" data-nav="prev" ${state.sending ? 'disabled' : ''}>← Ubah Pilihan</button>
        <span class="vnav-msg"></span>
        <button type="button" class="btn btn-primary btn-lg" data-send ${state.sending ? 'disabled' : ''}>
          ${state.sending ? '<span class="spin"></span> Mengirim…' : 'Kirim Pilihan ↗'}</button>
      </div>
    </div>`;
  }

  function doneHTML(){
    return `
    <div class="vote-done">
      <div class="done-badge">✓</div>
      <span class="jp">ありがとうございます</span>
      <h3>Pilihanmu Sudah Terkirim!</h3>
      <p>Terima kasih sudah ikut menentukan masa depan Tengoku. Hasil pemilihan akan diumumkan oleh tim pengurus.</p>
      ${reviewGrid()}
      <a class="btn btn-primary btn-lg" href="https://tengokulibels.github.io">Kembali ke Beranda</a>
    </div>`;
  }

  function render(){
    if (state.done){ app.innerHTML = doneHTML(); return; }
    app.innerHTML = stepperHTML() + (state.step === CONFIRM ? confirmHTML() : roleStepHTML(ROLES[state.step]));
    animate = false;
  }

  function goto(step, scroll){
    state.step = step; state.error = ''; lastPopped = null; animate = true;
    render();
    if (scroll) app.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  /* ---------- Interaksi ---------- */
  function toggle(id){
    const role = ROLES[state.step];
    const picks = state.picks[role.key];
    const idx = picks.indexOf(id);
    if (idx > -1){ picks.splice(idx, 1); lastPopped = null; }
    else {
      if (roleOf(id)) return;                       // sudah dipakai jabatan lain
      if (role.max === 1) picks.length = 0;         // ketua/wakil: ganti pilihan
      else if (picks.length >= role.max) return;    // sekretaris/bendahara penuh
      picks.push(id);
      lastPopped = `${role.key}:${picks.length - 1}:${id}`;
    }
    render();
  }

  async function send(){
    if (state.sending || !allDone()) return;
    state.sending = true; state.error = ''; render();

    const body = new URLSearchParams();
    ROLES.forEach(r => state.picks[r.key].forEach(id => body.append(r.entry, cand(id).name)));
    body.append('fvv', '1');
    body.append('pageHistory', '0');

    try {
      // no-cors: respons tidak bisa dibaca, tapi data tetap masuk ke Google Form.
      await fetch(FORM_ACTION, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body });
      state.done = true;
      state.sending = false;
      render();
      app.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch (err){
      state.sending = false;
      state.error = 'Pilihanmu belum terkirim. Periksa koneksi internetmu lalu coba kirim lagi.';
      render();
    }
  }

  app.addEventListener('click', e => {
    const stepBtn = e.target.closest('[data-step]');
    if (stepBtn && !stepBtn.disabled){ goto(+stepBtn.dataset.step, true); return; }
    const candBtn = e.target.closest('[data-cand]');
    if (candBtn && !candBtn.disabled){ toggle(candBtn.dataset.cand); return; }
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn && !navBtn.disabled){
      goto(state.step + (navBtn.dataset.nav === 'next' ? 1 : -1), true); return;
    }
    if (e.target.closest('[data-send]')) send();
  });

  render();
})();
