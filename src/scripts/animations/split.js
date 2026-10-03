/**
 * Pemecah teks dengan GSAP SplitText.
 *
 * Dipakai hanya untuk judul pendek (kurang dari 8 kata). Memecah paragraf
 * akan menambah jumlah DOM tanpa manfaat dan merusak sorotan teks.
 *
 * `mask: 'lines'` membungkus tiap baris dengan `overflow: clip`, sehingga
 * kata yang mulai di `yPercent: 118` sudah terpotong di luar baris. Judul
 * karena itu tidak perlu disembunyikan terpisah — tidak ada kedipan.
 *
 * `autoSplit` + `onSplit` membuat GSAP memecah ulang dan menjalankan
 * animasi yang sama otomatis setiap kali font dimuat ulang atau ukuran
 * jendela berubah, lalu membersihkannya sendiri.
 *
 * @module animations/split
 */

import { gsap, SplitText } from './gsap.js';
import { DURATION, EASE, STAGGER } from './tokens.js';

/** true bila plugin SplitText berhasil dimuat. */
export const splitReady = Boolean(SplitText);

/** @type {Map<Element, any>} */
const instances = new Map();

const CONFIG = { type: 'lines,words', mask: 'lines', autoSplit: true, aria: 'auto' };

/**
 * Kembalikan elemen ke teks polos, buang SplitText lama.
 * @param {Element} target
 */
export function revertSplit(target) {
  const inst = instances.get(target);
  if (inst) {
    inst.revert();
    instances.delete(target);
  } else if (target) {
    // instances belum ada, tapi elemen mungkin pernah di-split oleh autoSplit
    try {
      SplitText?.create(target, { ...CONFIG, autoSplit: false }).revert();
    } catch {
      /* belum pernah di-split */
    }
  }
}

/**
 * Animasi judul terpecah masuk.
 * @param {Element} target
 * @param {Partial<{ duration:number, stagger:number, delay:number }>} [opt]
 * @returns {any|null} tween atau instance SplitText
 */
export function splitIn(target, opt = {}) {
  if (!splitReady) {
    // Fallback polos kalau plugin gagal: fade biasa
    return gsap.fromTo(
      target,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: DURATION.reveal, ease: EASE.reveal, delay: opt.delay ?? 0 }
    );
  }

  const { duration = DURATION.intro, stagger = STAGGER.line, delay = 0 } = opt;

  const inst = SplitText.create(target, {
    ...CONFIG,
    onSplit(self) {
      return gsap.fromTo(
        self.words,
        { yPercent: 118, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration, stagger, delay, ease: EASE.out }
      );
    },
  });

  instances.set(target, inst);
  return inst;
}

/**
 * Pecah ulang judul dengan teks baru TANPA animasi.
 *
 * Dipakai setelah ganti bahasa: teks di dalam elemen sudah ditulis ulang,
 * sehingga struktur SplitText yang lama harus dibuang dan dibuat ulang.
 * Kata langsung ditampilkan pada posisi akhir supaya tidak ada lompatan.
 *
 * @param {Element} target
 */
export function resplitStatic(target) {
  if (!splitReady || !target) return;

  revertSplit(target);

  const inst = SplitText.create(target, {
    ...CONFIG,
    onSplit(self) {
      gsap.set(self.words, { yPercent: 0, y: 0, autoAlpha: 1, clearProps: 'transform' });
    },
  });

  instances.set(target, inst);
}
