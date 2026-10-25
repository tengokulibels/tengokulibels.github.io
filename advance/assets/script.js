/* ============================================================
   TENGOKU — SCRIPT
   ============================================================ */

/* ---------- 1. Mobile nav (slide-in panel) ---------- */
const burgerBtn   = document.getElementById('burgerBtn');
const navCloseBtn = document.getElementById('navCloseBtn');
const mobileNav   = document.getElementById('mobileNav');
const navOverlay  = document.getElementById('navOverlay');

function openMobileNav(){ mobileNav.classList.add('open'); navOverlay.classList.add('show'); }
function closeMobileNav(){ mobileNav.classList.remove('open'); navOverlay.classList.remove('show'); }

burgerBtn?.addEventListener('click', openMobileNav);
navCloseBtn?.addEventListener('click', closeMobileNav);
navOverlay?.addEventListener('click', closeMobileNav);
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

/* ---------- 2. Nav transparan di atas hero, solid setelah scroll ---------- */
const siteNav = document.getElementById('siteNav');
const heroEl  = document.querySelector('.hero');
if (siteNav && heroEl){
  const navObserver = new IntersectionObserver(([entry]) => {
    siteNav.classList.toggle('scrolled', entry.intersectionRatio < 0.6);
  }, { threshold: [0, 0.6, 1] });
  navObserver.observe(heroEl);
} else if (siteNav){
  siteNav.classList.add('scrolled');
}

/* ---------- 3. Pilihan Kelas — klik = merah & membesar ---------- */
const kelasItems = document.querySelectorAll('.kelas-item');
kelasItems.forEach(item => {
  item.addEventListener('click', () => {
    kelasItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ---------- 3b. Jalur Belajar Visual — klik = fokus (background foto) ---------- */
const jalurVisualItems = document.querySelectorAll('.jalur-visual-item');
jalurVisualItems.forEach(item => {
  item.addEventListener('click', () => {
    jalurVisualItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ---------- 4. Video profil — klik play baru muat iframe (hemat kuota) ---------- */
const introPlay  = document.getElementById('introPlay');
const introFrame = document.getElementById('introFrame');
// TEMPLATE: ganti ID video YouTube profil klub di sini
const INTRO_VIDEO_ID = 'GDXymeJpuMc';
introPlay?.addEventListener('click', () => {
  introFrame.innerHTML = `<iframe src="https://www.youtube.com/embed/${INTRO_VIDEO_ID}?autoplay=1&rel=0"
    title="Video Profil Tengoku" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>`;
});

/* ---------- 5. Galeri — sumber Google Drive + lightbox ---------- */
/* TEMPLATE:
   1. Upload foto ke satu folder Google Drive, set folder/file "Anyone with the link".
   2. Buka file > klik kanan > "Get link" > salin bagian ID di antara /d/ dan /view.
      Contoh link: https://drive.google.com/file/d/1AbCдEfGhIJK/view -> id = 1AbCдEfGhIJK
   3. Tempel id itu ke daftar di bawah. Ukuran thumbnail (sz) bisa diubah, mis. w1600.       */
const GALLERY_IMAGES = [
  { id: '1RqxFyvljNPTRjS0TtK39mLiIvcrwKK4P', alt: 'Dokumentasi bersama Nihonjin, Yuichi-san', big: true },
  { id: '1rjRF3p64DtJc9GoZGiTDCaDbUpie41QW', alt: 'Dokumentasi MPLS 2026', big: true },
  { id: '1Qd9tMB1v2fgtCPyPWxLAZ-KVAGDe5BXX', alt: 'Penyerahan kepada Haruka-san' },
  { id: '1CqySPlBw4X1U154zd03NaUDLlxBCPBWu', alt: 'Penyerahan kepada Yuichi-san' },
  { id: '18F0Phk-YsCDiD6SGWiy1Apdq1EzSIh4T', alt: 'Tengoku di Universitas Brawijaya Malang!' },
  { id: '15pxmQAHbpz8HZUpA-gasUvNo8xUoNH2F', alt: 'Tengoku di Habatake 2026 Malang!' },
  { id: '1ItOTsBmMsn3tsNAg_oyIXJRqCA-9hhww', alt: 'Dokumentasi bersama Nihonjin, Haruka-san', wide: true },
  { id: '1-EKQf_hBzMIrzWMUj9WbGkx-JJQUOW1q', alt: 'Dokumentasi Studi Banding' },
  { id: '12A-x9XIyCFhA2p4V7bBV_IBEv4oJQsaB', alt: 'Dokumentasi MPLS 2026' },
];

const galleryGrid = document.getElementById('galleryGrid');
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose= document.getElementById('lightboxClose');

function driveThumb(id, size = 'w1000'){ return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`; }
function driveFull(id){ return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`; }

if (galleryGrid){
  GALLERY_IMAGES.forEach(pic => {
    const el = document.createElement('div');
    el.className = 'g-item' + (pic.big ? ' g-big' : '') + (pic.wide ? ' g-wide' : '');
    el.innerHTML = `<img src="${driveThumb(pic.id)}" alt="${pic.alt}" loading="lazy">`;
    el.addEventListener('click', () => openLightbox(pic.id, pic.alt));
    galleryGrid.appendChild(el);
  });
}
function openLightbox(id, alt){
  lightboxImg.src = driveFull(id);
  lightboxImg.alt = alt || '';
  lightbox.classList.add('show');
}
function closeLightbox(){ lightbox.classList.remove('show'); lightboxImg.src=''; }
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
