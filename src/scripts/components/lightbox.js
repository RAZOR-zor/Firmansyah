/**
 * Lightbox sertifikat.
 *
 * Dipakai `<dialog>` bawaan, bukan div yang dibuat-buat sendiri. Alasannya
 * bukan Kesederhanaan: `showModal()` sudah menyediakan apa saja yang
 * mustahil ditiru dengan benar — focus trap, `Esc` menutup, klik backdrop
 * menutup, dan `::backdrop`.
 *
 * @module components/lightbox
 */

import { gsap } from '../animations/gsap.js';
import { EASE } from '../animations/tokens.js';
import { reduceMotion } from '../utils/env.js';
import { qs, qsa } from '../utils/dom.js';

/** @type {HTMLDialogElement|null} */
let dlg = null;
/** @type {HTMLElement|null} */
let figure = null;
/** @type {HTMLElement|null} */
let caption = null;
/** @type {ReturnType<typeof setTimeout>}|null */
let lastFocus = null;

/** @returns {{ title: string, meta: string }|null} */
function captionOf(item) {
  if (!item) return null;
  return {
    title: item.querySelector('.cert__title')?.textContent?.trim() ?? '',
    meta: [
      item.querySelector('.cert__issuer')?.textContent?.trim(),
      item.querySelector('.cert__date')?.textContent?.trim(),
      item.querySelector('.cert__note')?.textContent?.trim(),
    ]
      .filter(Boolean)
      .join(' — '),
  };
}

/**
 * Buka lightbox untuk satu kartu sertifikat.
 * @param {Element|null} card
 */
function open(card) {
  if (!dlg || !card || dlg.open) return;
  const img = card.querySelector('.cert__img');
  const info = captionOf(card);
  if (!img || !info) return;

  const src = img.getAttribute('src') ?? '';
  const alt = img.getAttribute('alt') ?? '';

  // `src` dan `alt` disalin dari kartu, bukan ditulis ulang. Kalau teks
  // sertifikat berubah karena ganti bahasa, gambar di lightbox ikut
  // berubah — tidak ada dua tempat yang bisa tidak sinkron.
  const box = /** @type {HTMLImageElement|null} */ (qs('#lightbox-img', dlg));
  if (box) {
    box.setAttribute('src', src);
    box.setAttribute('alt', alt);
  }

  if (caption) {
    const t = qs('#lightbox-title', caption);
    const m = qs('#lightbox-meta', caption);
    if (t) t.textContent = info.title;
    if (m) m.textContent = info.meta;
  }

  lastFocus = /** @type {HTMLElement|null} */ (document.activeElement);
  dlg.showModal();

  if (gsap && !reduceMotion()) {
    gsap.fromTo(
      figure,
      { autoAlpha: 0, y: 14, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: EASE.out }
    );
  }
}

/** Tutup lightbox. Dipanggil oleh tombol, `Esc`, dan klik backdrop. */
function close() {
  if (!dlg || !dlg.open) return;
  if (gsap && !reduceMotion()) {
    gsap.to(figure, {
      autoAlpha: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        dlg.close();
        gsap.set(figure, { clearProps: 'all' });
      },
    });
    return;
  }
  dlg.close();
}

/**
 * Pasang lightbox. Delegasi ke `#certificates-list` supaya tetap bekerja
 * setelah kartu dibangun ulang saat ganti bahasa — dan tidak perlu
 * listener baru per kartu.
 */
export function initLightbox() {
  dlg = /** @type {HTMLDialogElement|null} */ (qs('#cert-lightbox'));
  if (!dlg) return;

  figure = qs('.lightbox__figure', dlg);
  caption = qs('.lightbox__caption', dlg);

  // Delegasi: satu listener untuk semua kartu.
  qs('#certificates-list')?.addEventListener('click', (e) => {
    const link = e.target instanceof Element ? e.target.closest('.cert__open') : null;
    if (!link) return;
    e.preventDefault();
    open(link.closest('.cert'));
  });

  qsa('[data-lightbox-close]', dlg).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  });

  // Klik pada area dialog yang bukan figurnya = klik backdrop.
  // `event.target === dlg` dipakai sebagai penanda, bukan membandingkan
  // koordinat: yang benar-benar diuji adalah "apakah klik mendarat di
  // kotak dialog itu sendiri".
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });

  // Fokus dikembalikan ke pemicu saat ditutup. Tanpa ini, keyboard akan
  // mulai dari atas dokumen setiap kali lightbox ditutup.
  dlg.addEventListener('close', () => {
    lastFocus?.focus?.({ preventScroll: true });
    lastFocus = null;
  });
}
