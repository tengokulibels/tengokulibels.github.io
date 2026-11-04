/* TENGOKU — Materi Kelas Advance: furigana {kanji|yomi} -> <ruby>, toggle, petunjuk geser tabel */
document.querySelectorAll('.tbl-wrap').forEach(w => {
  const p = document.createElement('p'); p.className = 'tbl-hint'; p.textContent = '← Geser tabel ke samping →';
  w.parentNode.insertBefore(p, w);
});
document.querySelectorAll('.adv').forEach(el => {
  el.innerHTML = el.innerHTML.replace(/\{([^|{}<>]+)\|([^{}<>]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
});
const furiToggle = document.getElementById('furiToggle');
furiToggle?.addEventListener('click', () => {
  const off = document.body.classList.toggle('no-furi');
  furiToggle.textContent = 'Furigana: ' + (off ? 'OFF' : 'ON');
  furiToggle.setAttribute('aria-pressed', String(!off));
});
