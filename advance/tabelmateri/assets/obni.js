/* TENGOKU — OBNI: furigana {kanji|yomi} -> <ruby>, plus toggle */
/* label sel tabel untuk tampilan kartu di HP (dibuat sebelum furigana dikonversi) */
document.querySelectorAll('.obni-table').forEach(tb => {
  const heads = [...tb.querySelectorAll('thead th')].map(th => th.textContent.replace(/\{([^|{}]+)\|[^{}]+\}/g, '$1').trim());
  tb.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((td, i) => td.setAttribute('data-label', heads[i] || '')));
});
document.querySelectorAll('.obni').forEach(el => {
  el.innerHTML = el.innerHTML.replace(/\{([^|{}<>]+)\|([^{}<>]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
});
const furiToggle = document.getElementById('furiToggle');
furiToggle?.addEventListener('click', () => {
  const off = document.body.classList.toggle('no-furi');
  furiToggle.textContent = 'Furigana: ' + (off ? 'OFF' : 'ON');
  furiToggle.setAttribute('aria-pressed', String(!off));
});
