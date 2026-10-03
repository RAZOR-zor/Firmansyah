/**
 * Deteksi kapabilitas perangkat.
 * Semua keputusan animasi+kursor bertumpu di sini.
 * @module utils/env
 */

import { motionOverride } from './preview.js';

const mqFine = window.matchMedia('(pointer: fine)');
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqHover = window.matchMedia('(hover: hover)');
const mqDesktop = window.matchMedia('(min-width: 1024px)');
const mqNoHover = window.matchMedia('(hover: none)');

/** @returns {boolean} true di desktop dengan tetikus (bukan sentuh) */
export const canHover = () => mqFine.matches && mqHover.matches && !mqNoHover.matches;

/**
 * @returns {boolean} true bila user minta reduced motion.
 * `?motion=off` di URL bisa mengabaikannya, untuk keperluan pratinjau.
 */
export const reduceMotion = () => {
  const override = motionOverride();
  if (override !== null) return !override;
  return mqReduce.matches;
};

/** @returns {boolean} true di >= 1024px */
export const isDesktop = () => mqDesktop.matches;

/**
 * Daftarkan callback saat status media query berubah.
 * @param {MediaQueryList} mq
 * @param {(m: MediaQueryList) => void} cb
 * @returns {() => void} fungsi lepas
 */
export function onMq(mq, cb) {
  const handler = (e) => cb(/** @type {MediaQueryList} */ (e));
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

/**
 * reduced-motion bisa berubah saat runtime (setting OS).
 * @param {() => void} cb
 * @returns {() => void}
 */
export const onReduceChange = (cb) => onMq(mqReduce, cb);

/** @returns {boolean} true bila browser berdiri di atas http(s), bukan file:// */
export const isServed = () => location.protocol === 'http:' || location.protocol === 'https:';
