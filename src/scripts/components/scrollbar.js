/**
 * Scrollbar kustom.
 *
 * Bar bawaan browser tidak bisa diandalkan: Windows 11 memaksa scrollbar
 * "fluent" berwarna terang yang mengabaikan `::-webkit-scrollbar`, jadi
 * satu-satunya cara mendapat tampilan konsisten adalah menyembunyikan bar
 * native dan menggantinya dengan elemen sendiri.
 *
 * Prinsipnya minimal:
 *   - scroll tetap native (wheel, touchpad, keyboard) — bar ini hanya
 *     PENGECO, tidak pernah mencegat scroll;
 *   - digambar hanya dengan `transform` (translateY + scaleY), jadi
 *     tidak memicu layout sama sekali;
 *   - muncul saat halaman bergulir / kursor menyentuh rail, lalu sendiri
 *     menghilang saat sepi — sama seperti perilaku bar modern;
 *   - tanpa JS, penanda `html.has-scrollbar` tidak pernah terpasang,
 *     bar native versi tipis (base.css) tetap tampil. Tidak ada jalur
 *     yang bisa membuat halaman tak bisa digulir.
 *
 * @module components/scrollbar
 */

import { canHover } from '../utils/env.js';

/** Durasi bar bertahan setelah aktivitas terakhir, dalam ms. */
const IDLE_MS = 900;
/** Tinggi thumb minimum (px) supaya di halaman sangat panjang tetap bisa di-drag. */
const MIN_THUMB = 32;

/** @type {{root: HTMLElement|null, thumb: HTMLElement|null, raf: number, cleanups: Array<() => void>}} */
const state = {
  root: null,
  thumb: null,
  raf: 0,
  cleanups: [],
};

let lastY = -1;
let docH = 0;
let winH = 0;
let hideTimer = 0;
let dragging = false;

/** Sembunyikan bar setelah IDLE_MS — kecuali sedang di-drag. */
function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = /** @type {any} */ (setTimeout(() => {
    if (!dragging) state.root?.classList.remove('is-visible');
  }, IDLE_MS));
}

/** Tampilkan bar dan mulai hitung mundur untuk menyembunyikannya. */
function reveal() {
  if (!state.root) return;
  state.root.classList.add('is-visible');
  scheduleHide();
}

/**
 * Gambar ulang thumb dari posisi scroll terkini.
 * Dipanggil dari rAF hanya bila scrollY benar-benar berubah.
 */
function paint() {
  if (!state.thumb || !state.root) return;

  const max = docH - winH;
  if (max <= 0) {
    // Tidak ada yang bisa digulir → bar tidak perlu tampil.
    state.root.classList.remove('is-visible');
    return;
  }

  const y = window.scrollY;
  const trackH = state.root.clientHeight;
  const ratio = Math.min(trackH / docH, 1);
  const thumbH = Math.max(trackH * ratio, Math.min(MIN_THUMB, trackH));
  const range = trackH - thumbH;
  const progress = Math.min(y / max, 1);

  // Hanya transform — murah dan tanpa reflow.
  state.thumb.style.transform =
    `translateY(${(progress * range).toFixed(1)}px) scaleY(${(thumbH / trackH).toFixed(4)})`;
}

/** Loop rAF hemat: hanya menggambar saat scroll berubah atau ukuran berubah. */
function loop() {
  if (window.scrollY !== lastY) {
    lastY = window.scrollY;
    paint();
    if (!dragging) reveal();
  }
  state.raf = requestAnimationFrame(loop);
}

/** Ukur ulang tinggi dokumen & viewport. */
function measure() {
  docH = document.documentElement.scrollHeight;
  winH = window.innerHeight;
  paint();
}

/**
 * Ubah gerakan pointer di rail menjadi posisi scroll.
 * @param {number} clientY
 * @param {number} grabOffset jarak pointer dari puncak thumb saat drag dimulai
 */
function scrollToPointer(clientY, grabOffset = 0) {
  if (!state.root) return;
  const rect = state.root.getBoundingClientRect();
  const max = docH - winH;
  if (max <= 0) return;

  const trackH = state.root.clientHeight;
  const ratio = Math.min(trackH / docH, 1);
  const thumbH = Math.max(trackH * ratio, Math.min(MIN_THUMB, trackH));
  const range = trackH - thumbH;

  const target = (clientY - rect.top - grabOffset - thumbH / 2) / range;
  window.scrollTo(0, Math.max(0, Math.min(target, 1)) * max);
}

/**
 * Pasang scrollbar kustom. Aman dipanggil di lingkungan apa pun:
 * di perangkat sentuh atau tanpa overflow, modul ini diam saja.
 */
export function initScrollbar() {
  // Hanya perangkat bertetikus — di layar sentuh bar native overlay justru
  // paling pas, dan rail 12px akan mengganggu gesture tepi.
  if (state.root || !canHover()) return;

  const root = document.createElement('div');
  root.className = 'scrollbar';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="scrollbar__track"><div class="scrollbar__thumb"></div></div>';
  document.body.appendChild(root);

  state.root = root;
  state.thumb = /** @type {HTMLElement} */ (root.querySelector('.scrollbar__thumb'));

  // Penanda: sembunyikan bar native, aktifkan interaksi rail (components.css).
  document.documentElement.classList.add('has-scrollbar');

  const on = (target, type, fn, opts) => {
    /** @type {any} */ (target).addEventListener(type, fn, opts);
    state.cleanups.push(() => /** @type {any} */ (target).removeEventListener(type, fn, opts));
  };

  // Scroll di mana pun (termasuk wheel di atas rail) memunculkan bar.
  // paint() dipanggil langsung di sini juga, bukan hanya di loop rAF —
  // kalau rAF sempat ditahan browser (tab tak terlihat), posisi thumb
  // tetap benar begitu tab kembali aktif.
  on(window, 'scroll', () => { paint(); reveal(); }, { passive: true });
  on(window, 'wheel', () => reveal(), { passive: true });

  // Sentuh rail = lompat halus ke posisi itu.
  on(root, 'pointerdown', (/** @type {PointerEvent} */ e) => {
    if (e.button !== 0) return;
    dragging = true;
    root.classList.add('is-dragging');
    root.setPointerCapture?.(e.pointerId);
    scrollToPointer(e.clientY);
  });

  on(root, 'pointermove', (/** @type {PointerEvent} */ e) => {
    if (dragging) scrollToPointer(e.clientY);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    scheduleHide();
  };
  on(root, 'pointerup', endDrag);
  on(root, 'pointercancel', endDrag);

  // Ukuran berubah → tinggi dokumen ikut berubah.
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    state.cleanups.push(() => ro.disconnect());
  }
  on(window, 'resize', measure);
  on(window, 'load', measure);

  measure();
  state.raf = requestAnimationFrame(loop);
}

/** Lepas seluruh scrollbar kustom dan kembalikan bar native. */
export function destroyScrollbar() {
  cancelAnimationFrame(state.raf);
  clearTimeout(hideTimer);
  state.cleanups.forEach((fn) => fn());
  state.cleanups = [];
  state.root?.remove();
  state.root = null;
  state.thumb = null;
  document.documentElement.classList.remove('has-scrollbar');
}
