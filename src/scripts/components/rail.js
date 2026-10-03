/**
 * Margin rail — peta posisi halaman.
 *
 * Rail menampilkan satu titik per section, dihubungkan garis vertikal yang
 * ujungnya berhenti tepat di titik section yang sedang aktif.
 *
 * Tiga keputusan yang tidak bisa ditebak dari kode saja:
 *
 * 1. **Ujung garis = titik aktif, bukan persentase scroll.** Dua percobaan
 *    sebelumnya gagal dan keduanya salah dengan cara berbeda:
 *
 *    - `scrollY / (scrollHeight - innerHeight)` — persen scroll dokumen dan
 *      jarak antar titik di rail adalah dua skala yang tidak berhubungan.
 *      Di detik section 02 sudah jadi aktif, ujungnya masih di dekat 01.
 *    - Interpolasi posisi scroll di antara titik — ujungnya benar secara
 *      geometris, tapi sambil membaca section 02 garis sudah merambat ke
 *      arah 03, jadi terlihat sudah mencapai titik yang belum dimasuki.
 *    Yang benar: garis pindah dari titik ke titik mengikuti perpindahan
 *    section aktif, dengan transisi pendek supaya tidak terasa melompat.
 *
 * 2. **Titik-titiknya tidak bisa diklik.** Rail adalah penanda posisi, bukan
 *    navigasi. Navbar sudah menyediakan tautan section; menambah tautan
 *    kedua di kolom selebar 104px hanya mengulang hal yang sama, dan
 *    melompat-lompat karena tidak ada yang meminta. Karena itu rail
 *    `aria-hidden` — isinya dekorasi, dan pembaca layar sudah menemukan
 *    posisi aktif di navbar lewat `aria-current`.
 *
 * 3. **Tidak ada listener scroll sama sekali.** Isian garis sepenuhnya
 *    diturunkan dari state section aktif, jadi tidak ada yang perlu diukur
 *    per frame.
 *
 * @module components/rail
 */

import { qs, qsa } from '../utils/dom.js';

/** Kunci CSS untuk posisi ujung garis, dalam fraksi ruang antar titik. */
const PROGRESS_VAR = '--rail-progress';

/** Section yang dipetakan. @type {HTMLElement[]} */
let sections = [];

/**
 * Bangun ulang daftar peta dari section asli.
 *
 * @param {HTMLElement[]} list
 */
export function initRailMap(list) {
  const map = qs('#rail-map');
  if (!map) return;

  sections = list;
  if (!sections.length) return;

  const items = sections
    .map((section) => ({
      id: section.id,
      num: section.dataset.index ?? '',
      label: section.dataset.section ?? '',
    }))
    .filter((item) => item.id);

  if (!items.length) return;

  // HTML ditulis manual untuk keadaan tanpa JS. Kalau jumlahnya tidak sama
  // dengan section asli, berarti ada section yang ditambah atau dihapus dan
  // HTML-nya belum disesuaikan — beri tahu, jangan diam-diam tampil basi.
  const existing = qsa('.rail__step', map).length;
  if (existing !== items.length) {
    console.warn(
      `[rail] ${items.length} section tapi ${existing} entri di #rail-map. ` +
        'Daftar di index.html perlu disesuaikan — akan dibangun ulang sekarang.'
    );
  }

  map.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li');
      li.className = 'rail__step';
      li.dataset.sectionId = item.id;

      const dot = document.createElement('span');
      dot.className = 'rail__dot';
      dot.setAttribute('aria-hidden', 'true');

      const num = document.createElement('span');
      num.className = 'rail__num';
      num.textContent = item.num;

      // Titik dan nomor berbagi satu baris. `rail__row` yang memberi
      // tipografi mono-nya; tanpa pembungkus itu nomornya jatuh ke font
      // bawaan dan ikut berubah ukurannya.
      const row = document.createElement('span');
      row.className = 'rail__row';
      row.append(dot, num);

      const name = document.createElement('span');
      name.className = 'rail__name';
      name.textContent = item.label;

      li.append(row, name);
      return li;
    })
  );
}

/**
 * Tandai baris peta yang aktif, dan geser ujung garis ke titik itu.
 *
 * Dipanggil dari `animations/section.js`, yang sudah menentukan section aktif
 * dari posisi geometri — jadi rail dan navbar memakai satu sumber kebenaran
 * dan tidak mungkin berbeda pendapat.
 *
 * @param {HTMLElement|null} section
 */
export function markRailActive(section) {
  if (!section) return;

  const order = sections.map((s) => s.id);
  const at = order.indexOf(section.id);
  if (at < 0) return;

  qsa('.rail__step').forEach((step) => {
    const el = /** @type {HTMLElement} */ (step);
    const i = order.indexOf(el.dataset.sectionId ?? '');
    el.classList.toggle('is-active', i === at);
    // Titik yang sudah dilewati terisi: makna "sudah dibaca" tanpa perlu
    // teks tambahan di kolom selebar 104px.
    el.classList.toggle('is-visited', i > -1 && i < at);
  });

  // Nilai 0 berarti titik pertama, 1 berarti titik terakhir — jadi garis
  // selalu mendarat di salah satu titik, tidak pernah di antaranya.
  const fraction = order.length > 1 ? at / (order.length - 1) : 0;
  document.documentElement.style.setProperty(PROGRESS_VAR, fraction.toFixed(4));
}

/** Putuskan state rail. */
export function destroyRail() {
  sections = [];
  document.documentElement.style.removeProperty(PROGRESS_VAR);
}
