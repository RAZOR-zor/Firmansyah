/**
 * Jembatan ke GSAP.
 *
 * GSAP dimuat sebagai skrip UMD klasik (defer), jadi saat modul ini
 * dievaluasi `window.gsap` sudah ada — modul selalu diproses setelah
 * skrip klasik selesai.
 *
 * @module animations/gsap
 */

const g = /** @type {any} */ (window);

/** @type {any} */
export const gsap = g.gsap;

/** @type {any} */
export const ScrollTrigger = g.ScrollTrigger;

/** @type {any} */
export const SplitText = g.SplitText;

/** true bila GSAP termuat (script CDN gagal / diblokir). */
export const gsapReady = Boolean(gsap && ScrollTrigger);

/**
 * Aman dipanggil walau GSAP tidak ada — animasi dilewati saja,
 * konten tetap tampil karena CSS tidak menyembunyikannya secara permanen.
 * @param {() => void} fn
 * @returns {boolean} true bila dijalankan
 */
export function whenGsap(fn) {
  if (!gsapReady) return false;
  fn();
  return true;
}

if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  gsap.defaults({ duration: 0.6, ease: 'power3.out' });
  gsap.config({ nullTargetWarn: false });
  ScrollTrigger.config({ ignoreMobileResize: true });
}
