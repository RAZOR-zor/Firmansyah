/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *  MAIN â€” titik masuk.
 *
 *  Urutan disengaja:
 *   1. Tandai `.js`            â†’ CSS bisa membedakan JS aktif/tidak
 *   2. Terapkan bahasa        â†’ teks ditulis sebelum browser paint,
 *                               supaya tidak ada kedipan
 *   3. Render konten          â†’ isi data ke DOM
 *   4. Daftar komponen        â†’ pasang perilaku
 *   5. Animasi                â†’ baru di akhir, setelah DOM siap
 *
 *  Ganti bahasa memakai jalur yang sama: komponen yang dirender ulang
 *  dari data (proyek, timeline, kontak) dibangun ulang, lalu seluruh
 *  animasi scroll dipasang ulang dari nol. Lebih sederhana dan bebas bug
 *  dibanding mencoba menambal trigger satu per satu.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { motionProfile } from './data.js';
import { canHover, reduceMotion } from './utils/env.js';
import { introSkipped } from './utils/preview.js';
import { initModality } from './utils/modality.js';
import { qs, qsa } from './utils/dom.js';

import { initLang, initLangSwitcher, onLangChange } from './i18n.js';

import { renderProjects } from './components/projects.js';
import { renderCertificates } from './components/certificates.js';
import { initLightbox } from './components/lightbox.js';
import { renderTimeline } from './components/timeline.js';
import { renderHeroMotion } from './components/heroMotion.js';
import { hydrateContactLinks } from './components/contact.js';
import { initClock } from './components/clock.js';
import { initScrollbar } from './components/scrollbar.js';
import { initThemeToggle } from './components/theme.js';
import { initMenu, localizeMenuLabels } from './components/menu.js';
import { initNav } from './components/nav.js';
import { initCursor, destroyCursor, rebindCursor } from './components/cursor.js';
import { initRailMap, destroyRail } from './components/rail.js';
import { armLoader, playLoader, exitLoader, skipLoader, ENTER_BEAT } from './components/loader.js';
import { hideHeroBeforeIntro, playHeroIntro } from './components/hero.js';

import { gsap, gsapReady, ScrollTrigger } from './animations/gsap.js';
import { revealAll, refreshScrollTriggers } from './animations/reveal.js';
import { parallax, timelineProgress } from './animations/parallax.js';
import { magnetic, magneticCleanup } from './animations/magnetic.js';
import { resplitStatic } from './animations/split.js';
import { initSectionTracking, trackCenter, refreshActiveLabel, destroySectionTracking } from './animations/section.js';

/** Aktifkan bila animasi tidak dimatikan dan user tidak minta reduced motion. */
const motionOn = () => Boolean(motionProfile.enabled && gsapReady && !reduceMotion());

/**
 * Kursor kustom hanya aktif bila ada tetikus sungguhan DAN user tidak
 * meminta reduced motion â€” kursor yang mengejar tetikus tetap merupakan
 * gerakan, meski kecil.
 * @returns {boolean}
 */
const cursorAllowed = () => Boolean(motionProfile.customCursor && canHover() && !reduceMotion());

/* â”€â”€ 1. Scroll ke atas, lalu tandai JS aktif â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Refresh selalu kembali ke atas.
 *
 * Ini BUKAN penanganan yang utama. Penetapan
 * `history.scrollRestoration = 'manual'` sudah dipasang lebih dulu di
 * `<head>` (`index.html`), karena modul ini deferred: browser sudah
 * memutuskan pemulihan posisi sebelum baris di bawah dieksekusi.
 *
 * Yang tersisa di sini adalah dua hal yang hanya bisa dikerjakan modul:
 *
 *  1. `scrollTo(0, 0)` dijadwalkan di `requestAnimationFrame`. Pada
 *     frame pertama, `scrollTo` inline di `<head>` belum tentu berhasil
 *     karena tinggi dokumen belum diukur â€” loader masih `position: fixed`
 *     dan section di bawahnya belum punya tinggi. Setelah satu frame,
 *     layout sudah terjadi dan posisi yang dipulihkan barulah benar-benar
 *     ada yang bisa dituju.
 *
 *  2. `pageshow` untuk kasus `bfcache`. Saat pengguna menekan "kembali",
 *     browser mengembalikan halaman dari cache beserta posisinya, dan
 *     `event.persisted` itulah yang membedakannya dari refresh biasa â€”
 *     yang posisinya justru harus dibuang.
 *
 * Hash SENGAJA ikut diabaikan saat refresh, dan itu memang kontroversial.
 *
 * Alasannya ada di `nav.js`: setiap kali tautan navbar diklik, ia menulis
 * `history.replaceState(null, '', href)` â€” jadi begitu saja pengguna
 * menggulir lewat situs, URL-nya sudah jadi `#proyek` atau `#sertifikat`.
 * Kalau hash dihormati saat refresh, "selalu kembali ke atas" berubah
 * jadi "selalu kembali ke section terakhir yang diklik", persis hal yang
 * pemakai minta dibuang.
 *
 * Konsekuensinya jujur: tautan yang dibagikan dengan anchor
 * (`situs/#proyek`) TIDAK lagi ikut bekerja setelah me-refresh halaman
 * itu. Trade-off itu diterima dengan sadar â€” refresh yang bisa
 * diprediksi lebih berharga daripada deep link yang hanya berfungsi sekali
 * saat pertama dibuka. Kalau nanti deep link memang dibutuhkan,
 * penandanya bisa berupa flag di `sessionStorage` yang hanya ditulis saat
 * dokumen benar-benar baru dimuat, bukan saat `replaceState` berjalan.
 *
 * `pageshow` dipasang untuk kasus `bfcache`: saat pengguna menekan
 * "kembali", browser mengembalikan halaman dari cache beserta posisinya.
 * Itu tidak boleh dianulir, jadi pemeriksaan `event.persisted` yang
 * membedakannya dari refresh biasa.
 */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const toTop = () => window.scrollTo(0, 0);
requestAnimationFrame(toTop);
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) toTop();
});

document.documentElement.classList.add('js');

/**
 * Catat interaksi pengguna dari detik pertama. Harus dipasang sebelum
 * autofocus apa pun, kalau tidak modularitasnya sudah keliru.
 */
initModality();

/**
 * Ambil alih layar muat dari jaring pengaman CSS.
 * Harus dipanggil sedekat mungkin dengan awal halaman: begitu modul ini
 * hidup, JS yang bertanggung jawab menutup layar â€” bukan CSS.
 */
armLoader();

/* â”€â”€ 2. Terapkan bahasa (sebelum animasi) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
initLang();
initLangSwitcher(/** @type {HTMLElement} */ (qs('#lang-switch')));

/* â”€â”€ 3. Render konten dari data.js â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const renderAll = () => {
  renderProjects();
  renderCertificates();
  renderTimeline();
  renderHeroMotion();
  hydrateContactLinks();
};
renderAll();

/* â”€â”€ 4. Komponen dasar (tidak bergantung animasi) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
initThemeToggle();
initClock();
initScrollbar();
initMenu(
  /** @type {HTMLElement} */ (qs('#mobile-menu')),
  /** @type {HTMLElement} */ (qs('#burger'))
);
localizeMenuLabels();

initLightbox();

initNav({
  nav: /** @type {HTMLElement} */ (qs('#nav')),
  anchorSelector: 'a[href^="#"]',
});

const scrollHint = qs('.scroll-hint');

initCursor(cursorAllowed());

/**
 * Section dalam urutan dokumen â€” sumber kebenaran untuk navbar, peta rail,
 * dan penanda posisi. diambil sekali supaya tidak perlu requery.
 */
const sections = /** @type {HTMLElement[]} */ (qsa('section[data-index]'));

// Peta rail dibangun dari section asli, bukan dari daftar di HTML. Daftar
// HTML cuma cadangan untuk keadaan tanpa JS.
initRailMap(sections);

/* â”€â”€ 5. State UI (selalu aktif) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Pasang pelacakan section aktif.
 *
 * Ini bukan dekorasi: garis bawah pada link navbar dan label di
 * margin rail adalah penanda posisi pengguna. Penanda harus tetap jalan
 * walau animasi dimatikan, sama seperti `aria-current` tetap ada walau
 * tidak ada transisi. Karena itu tidak disimpan di dalam `setupMotion()`.
 */
function setupState() {
  destroySectionTracking();
  initSectionTracking(/** @type {HTMLElement[]} */ (qsa('section[data-index]')));
}

/* â”€â”€ 6. Animasi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Pasang seluruh animasi dari kondisi nol.
 * Dipanggil sekali saat muat, dan sekali lagi setiap kali bahasa diganti.
 * @param {{ playIntro: boolean }} opt
 */
function setupMotion(opt) {
  if (!motionOn()) {
    // Jaring pengaman: `hideHeroBeforeIntro()` menyetel `autoAlpha: 0`
    // secara inline. Kalau animasi ternyata tidak aktif, elemen itu akan
    // hilang permanen â€” jadi-inline-nya dibersihkan di sini.
    qsa('[data-hero]').forEach((el) => {
      el.style.removeProperty('opacity');
      el.style.removeProperty('visibility');
    });
    revealAll(document);
    refreshScrollTriggers();
    return;
  }

  // Buang trigger lama supaya tidak menunjuk node yang sudah diganti
  ScrollTrigger?.getAll().forEach((st) => st.kill());
  destroySectionTracking();
  magneticCleanup();

  initSectionTracking(/** @type {HTMLElement[]} */ (qsa('section[data-index]')));
  if (scrollHint) trackCenter(scrollHint);

  qsa('[data-magnetic]').forEach((btn) => {
    if (motionProfile.magnetic && canHover()) magnetic(/** @type {HTMLElement} */ (btn));
  });

  revealAll(document);

  if (motionProfile.parallax) {
    parallax(qsa('[data-parallax]'), 7);
    timelineProgress(qs('[data-timeline-progress]'), qs('.timeline'));
  }

  refreshActiveLabel();
  refreshScrollTriggers();

  if (opt.playIntro) playHeroIntro(scrollHint);
}

/**
 * Sembunyikan hero SEBELUM layar muat selesai.
 * Kalau ditunda sampai setelahnya, elemen sempat terlihat lalu melompat
 * hilang tepat di detik pertama.
 */
if (motionOn()) {
  hideHeroBeforeIntro(/** @type {HTMLElement} */ (scrollHint));
}

/* â”€â”€ Ganti bahasa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

onLangChange(() => {
  // Komponen dari data dibangun ulang dengan teks bahasa baru
  renderAll();
  localizeMenuLabels();

  // Peta rail dibangun ulang supaya label section ikut berubah bahasa.
  // Label diambil dari `data-section` milik tiap <section>, yang baru
  // diperbarui oleh i18n di baris atas.
  destroyRail();
  initRailMap(sections);

  if (!motionOn()) {
    setupState();
    refreshActiveLabel();
    return;
  }

  // Judul hasil SplitText harus dipecah ulang: teksnya sudah diganti,
  // tapi struktur kata yang dipecah sebelumnya masih terpasang.
  if (motionProfile.useTextSplit) {
    qsa('[data-split="mask"]').forEach((title) => resplitStatic(/** @type {HTMLElement} */ (title)));
  }

  destroyCursor();
  if (cursorAllowed()) initCursor(true);
  rebindCursor();

  setupMotion({ playIntro: false });
});

/* â”€â”€ Orkestrasi pemuatan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Batas waktu maksimum untuk menunggu font.
 *
 * Font memang memengaruhi layout, jadi kita tunggu â€” tapi kalau CDN font
 * lambat atau gagal, halaman tidak boleh ikut tertahan. Setelah 2,2 detik
 * kita lanjut saja dengan font cadangan.
 * @param {Promise<unknown>} promise
 * @param {number} ms
 * @returns {Promise<unknown>}
 */
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((r) => setTimeout(r, ms))]);
}

const ready = withTimeout(document.fonts?.ready ?? Promise.resolve(), 2200);

/**
 * Bukalah halaman dengan cara yang aman: kalau ada tahap yang gagal,
 * halaman tetap harus bisa dibaca.
 * @returns {Promise<void>}
 */
async function revealSite() {
  // Tahap 1: progres nyata sampai 100%. Tidak ada tombol dan tidak
  // ada langkah yang harus diklik. Versi lama punya gerbang "Masuk"
  // di titik ini; halaman sekarang terbuka sendiri.
  await playLoader();

  // Semua trigger dipasang SEBELUM layar terangkat, supaya tidak ada
  // elemen yang masih "belum terpasang" saat halaman terlihat.
  setupState();
  setupMotion({ playIntro: false });

  // Transisi dan pembuka hero berjalan berbarengan, tapi tidak
  // bersamaan.
  //
  // Lembar loader turun ke bawah, jadi bagian atas halaman yang
  // tersingkap lebih dulu - dan itu persis urutan kaskade hero
  // (navbar, judul, sub, desc, CTA). Kalau hero mulai sebelum lembar
  // bergerak, navbar selesai beranimasi di belakang kertas sementara
  // panelnya belum bergerak, dan yang benar-benar ditonton pengguna
  // adalah halaman yang sudah diam.
  //
  // Karena itu hero ditahan sampai `ENTER_BEAT.reveal`, yaitu detik
  // saat lembar mulai turun. Tidak ada satu pun bagian hero yang
  // selesai beranimasi di balik lembar yang masih menutup layar.
  const lifted = exitLoader();
  if (motionOn()) playHeroIntro(scrollHint, ENTER_BEAT.reveal);
  await lifted;
}

ready
  .then(() => {
    // `?intro=off` adalah alat bantu review tata letak: langsung ke
    // konten, tanpa layar muat, supaya tidak harus menunggu progres
    // setiap kali mau melihat section berikutnya.
    if (introSkipped()) {
      skipLoader();
      setupState();
      setupMotion({ playIntro: false });
      if (motionOn()) playHeroIntro(scrollHint);
      return;
    }
    return revealSite();
  })
  .catch((err) => {
    // Jangan pernah biarkan satu kegagalan mematikan seluruh halaman
    console.warn('[init] gagal pada tahap pemuatan:', err);
    skipLoader();
    setupState();
    setupMotion({ playIntro: false });
    if (motionOn()) playHeroIntro(scrollHint);
  });

/* â”€â”€ Kebersihan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// Font bisa selesai dimuat setelah animasi berjalan â†’ hitung ulang trigger
document.fonts?.ready?.then(() => ScrollTrigger?.refresh());
window.addEventListener('load', () => ScrollTrigger?.refresh());

// Halaman coming from bfcache: pulihkan kursor & bersihkan state
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    destroyCursor();
    if (cursorAllowed()) initCursor(true);
  }
});
