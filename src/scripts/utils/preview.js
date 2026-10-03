/**
 * Override pratinjau lewat URL.
 *
 * Ada dua kondisi yang membuat bagian pembuka sulit dilihat:
 *
 *  1. Sistem operasi menyalakan "reduce motion". Itu SHOULD dikormati —
 *     animasi harus dilewati — tapi artinya kamu tidak bisa me-review
 *     desainnya.
 *  2. Di localhost semuanya dimuat dalam ~130ms, jadi layar muat hanya
 *     ada sebentar dan gampang terlewat.
 *
 * Tiga parameter ini menutup kedua kasus tanpa mengubah perilaku default:
 *
 *   ?motion=off      abaikan reduce motion, paksa animasi jalan
 *   ?motion=on       paksa nona-motion (untuk menguji jalur aksesibel)
 *   ?loader=5        angkat lantai muat jadi 5 detik (untuk review)
 *   ?loader=hold     sama seperti ?loader=5
 *   ?intro=off       lewati layar muat, langsung ke konten
 *
 * `?intro=off` sengaja terpisah dari `?motion=off`. Keduanya soal gerak,
 * sedangkan gerbang adalah soal navigasi — mencampurkannya berarti
 * "matikan animasi" diam-diam ikut menghapus langkah yang harus diklik.
 *
 * Hanya dibaca di development/lokal. Tidak ada efek di Vercel kecuali
 * seseorang memang sengaja mengetik query-nya.
 * @module utils/preview
 */

const params = new URLSearchParams(window.location.search);

/** @returns {boolean|null} true=paksa jalan, false=paksa mati, null=pakai setelan OS */
export function motionOverride() {
  const v = params.get('motion');
  if (v === 'off' || v === '0') return true;
  if (v === 'on' || v === '1') return false;
  return null;
}

/**
 * Lantai waktu muat, dalam detik. 0 kalau tidak diaktifkan.
 *
 * Angka ini MENAIKAN lantai, bukan menggantinya: progres tetap
 * dibatasi oleh pekerjaan yang benar-benar selesai, tapi tidak boleh
 * bergerak lebih cepat dari angka ini. Itulah yang membuatnya berguna
 * untuk review, saat kamu tidak ingin menunggu CDN yang lambat.
 *
 * Batasnya 30 detik karena pager pengaman di `loader.js` menambah
 * nilai ini ke anggarannya sendiri.
 * @returns {number}
 */
export function loaderHold() {
  const v = params.get('loader');
  if (!v) return 0;
  if (v === 'hold') return 5;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30) : 0;
}

/**
 * Lewati layar muat dan langsung ke konten.
 * @returns {boolean}
 */
export function introSkipped() {
  const v = params.get('intro');
  return v === 'off' || v === '0';
}

/** true kalau ada parameter pratinjau yang dipakai. */
export const isPreview = motionOverride() !== null || loaderHold() > 0 || introSkipped();
