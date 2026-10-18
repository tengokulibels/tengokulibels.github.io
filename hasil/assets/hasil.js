/* ============================================================
   TENGOKU — HASIL VOTING
   Mengambil data langsung dari Google Spreadsheet (hasil Google Form).
   Syarat: spreadsheet dibagikan "Anyone with the link — Viewer".
   ============================================================ */
(function(){
  const app = document.getElementById('hasilApp');
  if (!app) return;

  /* ---------- Konfigurasi ---------- */
  const SHEET_ID   = '1FRjpgCCoVYVBeYujGeSntm8m3hhJzsgt6ChMyHVrGMk';
  const REFRESH_MS = 30000;          // muat ulang otomatis tiap 30 detik

  // Nama harus sama persis dengan opsi di Google Form.
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
  // col = urutan kolom di spreadsheet (0 = Timestamp)
  const ROLES = [
    { key:'ketua',     label:'Ketua',       jp:'会長',   col:1, max:1, old:['images/pengurus-lama/ketua.png'] },
    { key:'wakil',     label:'Wakil Ketua', jp:'副会長', col:2, max:1, old:['images/pengurus-lama/wakil.png'] },
    { key:'sekretaris',label:'Sekretaris',  jp:'書記',   col:3, max:2, old:['images/pengurus-lama/sekretaris-1.png','images/pengurus-lama/sekretaris-2.png'] },
    { key:'bendahara', label:'Bendahara',   jp:'会計',   col:4, max:2, old:['images/pengurus-lama/bendahara-1.png','images/pengurus-lama/bendahara-2.png'] },
  ];

  /* ---------- Helper ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initials = n => n.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  const img = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.display='none'">`;
  const pct = (v, t) => t ? Math.round(v / t * 100) : 0;

  /* ---------- Ambil data ---------- */
  function parseCSV(text){
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++){
      const ch = text[i];
      if (q){
        if (ch === '"'){ if (text[i+1] === '"'){ cur += '"'; i++; } else q = false; }
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ','){ row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r'){
        if (ch === '\r' && text[i+1] === '\n') i++;
        row.push(cur); rows.push(row); row = []; cur = '';
      } else cur += ch;
    }
    if (cur !== '' || row.length){ row.push(cur); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim() !== ''));
  }

  async function viaCSV(){
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&_=${Date.now()}`;
    const res = await fetch(url, { cache:'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('not-public');
    return parseCSV(text).slice(1);                       // buang baris header
  }

  function viaJSONP(){                                    // cadangan bila fetch/CORS gagal
    return new Promise((resolve, reject) => {
      const cb = '__tengokuSheet' + Date.now();
      const s = document.createElement('script');
      const done = () => { delete window[cb]; s.remove(); clearTimeout(t); };
      const t = setTimeout(() => { done(); reject(new Error('timeout')); }, 12000);
      window[cb] = data => {
        done();
        if (!data || data.status === 'error' || !data.table) return reject(new Error('not-public'));
        resolve(data.table.rows.map(r => (r.c || []).map(c => c ? (c.f != null ? String(c.f) : (c.v != null ? String(c.v) : '')) : '')));
      };
      s.onerror = () => { done(); reject(new Error('script')); };
      s.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler=${cb}&_=${Date.now()}`;
      document.head.appendChild(s);
    });
  }

  async function loadRows(){
    try { return await viaCSV(); }
    catch (e){ return await viaJSONP(); }
  }

  /* ---------- Hitung ---------- */
  function tally(rows){
    const votes = {};                                      // votes[role][candId] = n
    ROLES.forEach(r => { votes[r.key] = {}; CANDIDATES.forEach(c => votes[r.key][c.id] = 0); });
    let valid = 0;
    rows.forEach(row => {
      if (!row || row.length < 2) return;
      valid++;
      ROLES.forEach(r => {
        const cell = row[r.col] || '';
        CANDIDATES.forEach(c => { if (cell.includes(c.name)) votes[r.key][c.id]++; });
      });
    });
    const last = rows.length ? (rows[rows.length - 1][0] || '') : '';
    return { votes, total: valid, last };
  }

  function ranking(votes, roleKey){
    return CANDIDATES.map((c, i) => ({ c, v: votes[roleKey][c.id], i }))
      .sort((a, b) => b.v - a.v || a.i - b.i);
  }

  // Susunan sementara: urut Ketua → Wakil → Sekretaris → Bendahara,
  // kandidat yang sudah menduduki satu jabatan tidak dihitung lagi di jabatan berikutnya.
  function cabinet(votes){
    const taken = new Set(); const out = {};
    ROLES.forEach(r => {
      const pool = ranking(votes, r.key).filter(x => !taken.has(x.c.id));
      const picks = pool.slice(0, r.max);
      out[r.key] = picks.map((p, idx) => {
        const rest = pool.slice(r.max);
        const tie = p.v > 0 && rest.some(x => x.v === p.v);
        return { ...p, tie };
      });
      picks.forEach(p => taken.add(p.c.id));
    });
    return out;
  }

  /* ---------- Render ---------- */
  function cabinetPair(role, slot, pick, total){
    const label = role.max > 1 ? `${role.label} ${slot+1}` : role.label;
    const has = pick && pick.v > 0;
    return `
    <div class="pair${has ? ' filled' : ''}">
      <div class="pair-role">${esc(label)}</div>
      <div class="pair-row">
        <div class="pair-fig old">
          <div class="pair-photo">${img(role.old[slot], 'Pengurus lama')}</div>
          <div class="pair-cap"><small>Dulu</small>${esc(role.label)} sebelumnya</div>
        </div>
        <div class="pair-arrow" aria-hidden="true">→</div>
        <div class="pair-fig new">
          ${has
            ? `<div class="pair-photo"><span class="ini jp">${esc(initials(pick.c.name))}</span>${img(pick.c.photo, pick.c.name)}</div>
               <div class="pair-cap"><small>Unggul</small>${esc(pick.c.name)}<span class="votes">${pick.v} suara · ${pct(pick.v, total)}%</span>${pick.tie ? '<span class="pair-tie">Seri</span>' : ''}</div>`
            : `<div class="pair-photo empty"><span class="ini">?</span></div>
               <div class="pair-cap none"><small>Unggul</small>Belum ada suara</div>`}
        </div>
      </div>
    </div>`;
  }

  function boardHTML(role, data){
    const rank = ranking(data.votes, role.key);
    const top = Math.max(...rank.map(x => x.v), 0);
    const rows = rank.map((x, idx) => {
      const lead = idx < role.max && x.v > 0;
      const w = top ? (x.v / top * 100) : 0;
      return `<div class="brow${lead ? ' lead' : ''}">
        <div class="brow-rank">${idx + 1}</div>
        <div class="bavatar"><span class="ini jp">${esc(initials(x.c.name))}</span>${img(x.c.photo, x.c.name)}</div>
        <div class="brow-main">
          <div class="brow-top"><span class="brow-name">${esc(x.c.name)}</span>
            <span class="brow-val">${x.v}<small>${pct(x.v, data.total)}%</small></span></div>
          <div class="btrack"><div class="bfill" style="width:${w.toFixed(1)}%"></div></div>
        </div></div>`;
    }).join('');
    const edge = rank[role.max - 1], next = rank[role.max];
    const tie = edge && next && edge.v > 0 && edge.v === next.v;
    return `<article class="board">
      <div class="board-head"><div><span class="jp">${role.jp}</span><h4>${esc(role.label)}</h4></div>
        <small>${role.max > 1 ? `Top ${role.max} unggul` : '1 unggul'}</small></div>
      ${rows}
      ${tie ? '<p class="board-note">⚠ Ada suara seri di batas peringkat unggul.</p>' : ''}
    </article>`;
  }

  function rekapHTML(data){
    const maxCell = Math.max(1, ...ROLES.flatMap(r => CANDIDATES.map(c => data.votes[r.key][c.id])));
    const body = CANDIDATES.map(c => {
      let sum = 0;
      const cells = ROLES.map(r => {
        const v = data.votes[r.key][c.id]; sum += v;
        return `<td class="${v ? 'hot' : 'zero'}" style="--heat:${(v / maxCell).toFixed(2)}">${v}</td>`;
      }).join('');
      return `<tr><td>${esc(c.name)}</td>${cells}<td class="total">${sum}</td></tr>`;
    }).join('');
    return `<div class="rekap-wrap"><table class="rekap">
      <thead><tr><th>Kandidat</th>${ROLES.map(r => `<th>${esc(r.label)}</th>`).join('')}<th>Total</th></tr></thead>
      <tbody>${body}</tbody></table></div>`;
  }

  function statusBar(kind, text, sub){
    return `<div class="hbar">
      <div class="hlive"><span class="dot ${kind}"></span><div>${esc(text)}<br><small>${esc(sub)}</small></div></div>
      <div class="hbar-actions">
        <button type="button" class="btn btn-ghost btn-sm" data-refresh>↻ Segarkan</button>
        <a class="btn btn-primary btn-sm" href="https://tengokulibels.github.io/UGVtaWxpaGFu">Isi Pemilihan ↗</a>
      </div></div>`;
  }

  let firstLoad = true, timer = null, busy = false, lastData = null;

  function render(data, status){
    const cab = cabinet(data.votes);
    const hasVotes = data.total > 0;
    const now = new Date().toLocaleTimeString('id-ID');
    app.className = 'hasil-app' + (firstLoad ? ' first-load' : '');
    app.innerHTML = `
      ${status === 'err'
        ? statusBar('err', 'Gagal memperbarui data', 'Menampilkan data terakhir yang berhasil dimuat. Mencoba lagi otomatis…')
        : statusBar('on', 'Data langsung dari spreadsheet', `Diperbarui ${now} · otomatis tiap ${REFRESH_MS/1000} detik`)}
      <div class="hstats">
        <div class="hstat"><div class="num">${data.total}</div><div class="lbl">Total suara masuk</div></div>
        <div class="hstat"><div class="num">${CANDIDATES.length}</div><div class="lbl">Kandidat</div></div>
        <div class="hstat"><div class="num sm">${hasVotes ? esc(data.last) : '—'}</div><div class="lbl">Suara terakhir masuk</div></div>
      </div>
      ${hasVotes ? `
      <div class="cabinet">
        <div class="hsub"><span class="jp">暫定</span><h3>Susunan Sementara</h3>
          <p>Dihitung berurutan dari Ketua, Wakil, Sekretaris, lalu Bendahara. Kandidat yang sudah unggul di satu jabatan tidak dihitung lagi di jabatan berikutnya, karena satu orang hanya boleh menempati satu jabatan.</p></div>
        <div class="pairs">${ROLES.map(r => r.old.map((_, i) => cabinetPair(r, i, cab[r.key][i], data.total)).join('')).join('')}</div>
      </div>
      <div class="hsub"><span class="jp">順位</span><h3>Peringkat per Jabatan</h3>
        <p>Perolehan suara murni tiap jabatan, tanpa menyaring kandidat yang unggul di jabatan lain. Persentase dihitung dari total suara masuk.</p></div>
      <div class="board-grid">${ROLES.map(r => boardHTML(r, data)).join('')}</div>
      <div class="hsub"><span class="jp">集計</span><h3>Rekap Lengkap</h3>
        <p>Jumlah suara setiap kandidat di semua jabatan. Warna makin pekat berarti suara makin banyak.</p></div>
      ${rekapHTML(data)}`
      : `<div class="hmsg"><h4>Belum ada suara masuk</h4>Hasil akan muncul di sini begitu ada yang mengirim pilihan.<br>
         <a class="btn btn-primary" href="pemilihan.html">Isi Pemilihan ↗</a></div>`}`;
    firstLoad = false;
  }

  function renderError(err){
    if (lastData){ render(lastData, 'err'); return; }
    const notPublic = err && err.message === 'not-public';
    app.className = 'hasil-app';
    app.innerHTML = `${statusBar('err', 'Data belum bisa dimuat', 'Mencoba lagi otomatis…')}
      <div class="hmsg"><h4>Gagal mengambil data spreadsheet</h4>
        ${notPublic
          ? 'Spreadsheet belum bisa dibaca publik. Buka spreadsheet › Share › atur akses umum ke <b>Anyone with the link — Viewer</b>.'
          : 'Periksa koneksi internetmu, lalu coba segarkan.'}
        <br><button type="button" class="btn btn-primary" data-refresh>↻ Coba Lagi</button></div>`;
  }

  async function refresh(){
    if (busy) return; busy = true;
    const btn = app.querySelector('[data-refresh]');
    if (btn) btn.innerHTML = '<span class="spin"></span> Memuat…';
    try {
      const rows = await loadRows();
      lastData = tally(rows);
      render(lastData, 'ok');
    } catch (e){ renderError(e); }
    busy = false;
  }

  app.addEventListener('click', e => { if (e.target.closest('[data-refresh]')) refresh(); });
  app.innerHTML = '<div class="hskeleton"></div>';
  refresh();
  timer = setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
})();
