/**
 * Reveal on scroll — utilitas yang dipakai semua section.
 *
 * Aturan main:
 *  - hanya `transform` + `opacity` (GPU-friendly, tanpa layout thrash)
 *  - `toggleActions: 'play none none reverse'` supaya tidak memicu
 *    berulang tiap arah scroll
 *  - `once: true` untuk elemen yang tidak perlu berbalik
 *  - awal selalu pakai `autoAlpha`, bukan `opacity`, supaya elemen
 *    opacity 0 tidak memblokir klik
 *
 * @module animations/reveal
 */

import { gsap, ScrollTrigger } from './gsap.js';
import { DURATION, EASE, SHIFT, STAGGER } from './tokens.js';

/**
 * Satu elemen reveal masuk saat masuk viewport.
 * @param {Element} target
 * @param {Partial<{ y:number, scale:number, duration:number, delay:number, start:string, once:boolean }>} [opt]
 * @returns {any} ScrollTrigger instance
 */
export function revealOne(target, opt = {}) {
  const { y = SHIFT.md, scale, duration = DURATION.reveal, delay = 0, start = 'top 85%', once = true } = opt;

  const from = { autoAlpha: 0, y };
  if (typeof scale === 'number') from.scale = scale;

  return gsap.fromTo(target, from, {
    autoAlpha: 1,
    y: 0,
    ...(typeof scale === 'number' ? { scale: 1 } : {}),
    duration,
    delay,
    ease: EASE.reveal,
    scrollTrigger: {
      trigger: target,
      start,
      once,
      toggleActions: once ? 'play none none none' : 'play none none reverse',
    },
  });
}

/**
 * Sekumpulan elemen reveal berstagger.
 * Dibatasi maksimal 8 item — di atas itu, item terakhir terasa lambat.
 * @param {Element[]} targets
 * @param {Partial<{ y:number, duration:number, stagger:number, start:string, once:boolean }>} [opt]
 * @returns {any|null}
 */
export function revealGroup(targets, opt = {}) {
  if (!targets.length) return null;
  const {
    y = SHIFT.sm,
    duration = DURATION.reveal,
    stagger = STAGGER.base,
    start = 'top 86%',
    once = true,
  } = opt;

  return gsap.fromTo(
    targets,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      stagger,
      ease: EASE.reveal,
      scrollTrigger: { trigger: targets[0], start, once },
    }
  );
}

/**
 * Ikan semua elemen `[data-reveal]` di dalam satu scope.
 * Elemen yang sudah punya trigger dari pemanggil lain dilewati.
 * @param {ParentNode} scope
 */
export function revealAll(scope = document) {
  /** @type {HTMLElement[]} */
  const nodes = Array.from(scope.querySelectorAll('[data-reveal]'));
  if (!nodes.length) return;

  nodes.forEach((node) => {
    if (node.dataset.revealBound === '1') return;
    node.dataset.revealBound = '1';

    // Elemen yang punya anak ber-[data-reveal] dianimasikan sebagai kelompok
    const children = node.querySelectorAll('[data-reveal]:not([data-reveal-bound])');
    if (children.length >= 2) {
      revealGroup(Array.from(children));
    } else {
      revealOne(node);
    }
  });
}

/** Paksa semua trigger dihitung ulang — dipanggil setelah render konten. */
export function refreshScrollTriggers() {
  if (ScrollTrigger) ScrollTrigger.refresh();
}
