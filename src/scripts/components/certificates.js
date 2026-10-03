/**
 * Render daftar sertifikat.
 *
 * Pola yang sama seperti `projects.js` dan `timeline.js`: kerangka HTML
 * ada di `index.html` (agar tetap tampil tanpa JavaScript), lalu modul ini
 * membangun ulang isinya dari `data.js` setiap kali bahasa diganti.
 *
 * Kenapa bukan `<img>` polos: sertifikat tanpa konteksnya cuma gambar
 * pahit. Yang membuat orang percaya bukan gambar Certificate itu sendiri,
 * tapi penerbit, judul kursus, nomor kredensial, dan tanggal — jadi
 * keempatnya ikut dirender sebagai TEKS yang bisa dibaca mesin pencari,
 * bukan ditulis permanen di dalam gambar.
 *
 * @module components/certificates
 */

import { certificates } from '../data.js';
import { t, tRaw } from '../i18n.js';
import { el, qs } from '../utils/dom.js';

const ARROW =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11L11 5M5 5h6v6"/></svg>';
/**
 * @param {import('../data.js').CertificateShell} shell
 * @returns {HTMLElement}
 */
function buildCertificate(shell) {
  /** @type {{issuer?:string, title?:string, meta?:string, date?:string, alt?:string}} */
  const copy = tRaw(`certificates.items.${shell.key}`) ?? {};

  // `alt` ditulis lengkap per sertifikat, bukan "sertifikat" generik.
  // Pembaca layar harus bisa tahu sertifikat ini yang mana tanpa melihat
  // gambarnya — dan mesin pencari memakainya untuk memahami isi halaman.
  const img = el('img', {
    class: 'cert__img',
    attrs: {
      src: shell.src,
      alt: copy.alt ?? '',
      loading: 'lazy',
      decoding: 'async',
      width: String(shell.width),
      height: String(shell.height),
    },
  });

  // Tautan ke berkas aslinya dipakai sebagai CADANGAN: tanpa JavaScript,
  // atau kalau <dialog> tidak didukung, klik ini tetap membuka gambar di tab
  // baru alih-alih mati total. Dengan JS aktif, lightbox yang menanganinya
  // dan mencegahnya dengan preventDefault().
  const open = el('a', {
    class: 'cert__open',
    attrs: { href: shell.src, target: '_blank', rel: 'noopener noreferrer', 'data-cursor': 'view' },
    children: [
      el('span', { class: 'cert__open-label', text: t('certificates.view') }),
      el('span', { class: 'cert__open-arrow', html: ARROW }),
    ],
  });

  return el('li', {
    class: 'cert',
    attrs: { 'data-reveal': 'true' },
    children: [
      el('div', {
        class: 'cert__frame',
        children: [img, el('span', { class: 'cert__corner', attrs: { 'aria-hidden': 'true' } })],
      }),
      el('div', {
        class: 'cert__body',
        children: [
          el('p', {
            class: 'cert__meta',
            children: [
              el('span', { class: 'cert__issuer', text: copy.issuer ?? '' }),
              // Tanggal bersifat opsional. Sertifikat Code.org tidak
              // mencantumkan tanggal sama sekali, jadi tidak ada yang
              // boleh ditampilkan — `span` kosong hanya akan menambah
              // jarak yang tidak menjelaskan apa pun.
              copy.date ? el('span', { class: 'cert__date', text: copy.date }) : null,
            ].filter(Boolean),
          }),
          el('h3', { class: 'cert__title', text: copy.title ?? '' }),
          copy.meta ? el('p', { class: 'cert__note', text: copy.meta }) : null,
          open,
        ].filter(Boolean),
      }),
    ],
  });
}

/**
 * Render semua sertifikat ke dalam `#certificates-list`.
 * Aman dipanggil ulang setiap kali bahasa diganti.
 */
export function renderCertificates() {
  const list = qs('#certificates-list');
  if (!list) return;
  list.replaceChildren(...certificates.map(buildCertificate));
}
