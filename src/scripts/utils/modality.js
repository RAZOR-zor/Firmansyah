/**
 * Lacak cara pengguna terakhir berinteraksi: keyboard atau tetikus/sentuh.
 *
 * Kenapa ini perlu ada kalau `:focus-visible` sudah disediakan browser?
 *
 * Karena `:focus-visible` menyesatkan untuk fokus yang dipasang lewat
 * `element.focus()`. Chrome menganggap fokus programatis itu "visible" —
 * jadi begitu kita autofocus tombol di gerbang masuk, **setiap** pengunjung
 * langsung melihat cincin fokus, termasuk yang cuma pakai tetikus.
 * Firefox tidak begitu, dan hasilnya dua browser menampilkan tampilan
 * berbeda untuk halaman yang sama.
 *
 * Jadi kita tidak menebak-nebak: kita catat dulu interaksi yang nyata.
 * Cincin fokus baru muncul setelah tombol keyboard benar-benar dipakai.
 * Orang yang belum pernah menekan tombol keyboard memang belum sedang
 * bernavigasi dengan keyboard, jadi tidak ada yang hilang.
 *
 * Atributnya ditaruh di `<html>` supaya bisa dipakai selector CSS:
 *
 *   [data-modality='kbd'] .skip-link:focus-visible { ... }
 *
 * @module utils/modality
 */

const KEY = 'data-modality';

/**
 * Nilai saat ini. Awalnya `null` — bukan `'pointer'` — supaya pemanggilan
 * pertama ke `set()` benar-benar menulis atribut, bukan lolos karena
 * kebetulan sama dengan nilai awal.
 * @type {'kbd'|'pointer'|'touch'|null}
 */
let current = null;

/** @param {'kbd'|'pointer'|'touch'} value */
function set(value) {
  if (current === value) return;
  current = value;
  document.documentElement.setAttribute(KEY, value);
}

/** @returns {'kbd'|'pointer'|'touch'|null} */
export function modality() {
  return current;
}

/**
 * Pasang pencacah modalitas. Panggil sekali, sedekat mungkin dengan
 * awal halaman — makin awal, makin akurat rekonstruksinya.
 */
export function initModality() {
  // Asumsi awal: perangkat ini punya tetimus. Kalau ternyata tidak, kita
  // sudah tahu itu lebih baik daripada menebak.
  set(window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'pointer');

  // `keydown` menangkap semua tombol, termasuk modifier dan Tab.
  window.addEventListener('keydown', () => set('kbd'), true);

  // `pointerdown` menutupi tetikus, pena, dan sentuh dalam satu listener.
  window.addEventListener('pointerdown', () => set('pointer'), true);
}
