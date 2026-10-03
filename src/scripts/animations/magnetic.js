/**
 * Efek magnetik pada tombol.
 *
 * Pakai `gsap.quickTo`, bukan listener per-frame: GSAP melakukan
 * interpolasi di ticker-nya sendiri sehingga kita cukup menulis
 * koordinat sekali per event mousemove — jauh lebih murah daripada
 * menghitung offset sendiri di setiap frame.
 *
 * Dibatasi 0.3 supaya elemen tidak pernah keluar dari hit-box-nya.
 * Diterapkan maksimal pada 2 elemen fokus per layar agar tidak ramai.
 *
 * @module animations/magnetic
 */

import { gsap } from './gsap.js';

/** @type {Array<() => void>} */
const disposers = [];

/** @param {Element} el @param {number} strength @returns {number} */
const clamp = (el, strength) => (el.offsetWidth / 2) * strength;

/**
 * Pasang magnetik pada satu elemen.
 * @param {HTMLElement} target
 * @param {number} [strength] 0–0.5
 */
export function magnetic(target, strength = 0.28) {
  const label = target.querySelector('.btn__text, .cta__text');
  let xTo, yTo, lxTo, lyTo;

  /** @param {PointerEvent} e */
  const move = (e) => {
    const r = target.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    const lim = clamp(target, strength);
    xTo(gsap.utils.clamp(-lim, lim, mx));
    yTo(gsap.utils.clamp(-lim, lim, my) * 0.7);
    if (label) {
      lxTo(gsap.utils.clamp(-lim, lim, mx) * 0.35);
      lyTo(gsap.utils.clamp(-lim, lim, my) * 0.2);
    }
  };

  /** @param {PointerEvent} e */
  const enter = (e) => {
    xTo = gsap.quickTo(target, 'x', { duration: 0.45, ease: 'power3.out' });
    yTo = gsap.quickTo(target, 'y', { duration: 0.45, ease: 'power3.out' });
    if (label) {
      lxTo = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' });
      lyTo = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3.out' });
    }
    move(e);
  };

  const leave = () => {
    xTo?.(0);
    yTo?.(0);
    lxTo?.(0);
    lyTo?.(0);
  };

  target.addEventListener('pointerenter', enter);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerleave', leave);
  target.addEventListener('pointercancel', leave);

  disposers.push(() => {
    target.removeEventListener('pointerenter', enter);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerleave', leave);
    target.removeEventListener('pointercancel', leave);
    gsap.killTweensOf(target);
  });
}

/** Lepas semua listener magnetik. */
export function magneticCleanup() {
  disposers.forEach((fn) => fn());
  disposers.length = 0;
}
