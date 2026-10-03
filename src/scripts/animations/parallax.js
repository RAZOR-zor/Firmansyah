/**
 * Parallax scroll — hanya untuk layer dekoratif.
 *
 * Aturan dari motion-design: parallax TIDAK boleh dipakai pada body copy
 * atau kontrol interaktif, dan amplitudo harus kecil
 * (5–12%) supaya latar dan depan tidak terpisah secara mengganggu.
 *
 * @module animations/parallax
 */

import { gsap } from './gsap.js';

/** @param {Element|null} el @returns {boolean} */
const visible = (el) => !!el && getComputedStyle(el).display !== 'none';

/**
 * Pasang parallax pada sekumpulan elemen.
 * @param {Element[]} targets
 * @param {number} [amount]  Persentase y, boleh negatif. Default 8.
 */
export function parallax(targets, amount = 8) {
  targets.filter(visible).forEach((target) => {
    gsap.fromTo(
      target,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: target.parentElement ?? target,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}

/**
 * Bar progres timeline yang tumbuh mengikuti posisi scroll.
 * @param {Element|null} bar
 * @param {Element|null} track
 */
export function timelineProgress(bar, track) {
  if (!visible(bar) || !track) return;
  gsap.fromTo(
    bar,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
    }
  );
}
