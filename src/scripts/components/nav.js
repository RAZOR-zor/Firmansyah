/**
 * Navigasi: status scroll navbar + smooth scroll antar section.
 *
 * Scroll halus memakai `scrollIntoView({ behavior: 'smooth' })` bawaan
 * browser, bukan ScrollSmoother. Alasannya: ScrollSmoother butuh
 * transform pada wrapper yang bisa merusak `position: fixed` dan
 * `scroll-behavior` — dan untuk satu halaman, native sudah cukup
 * halus dengan jauh lebih sedikit JavaScript.
 *
 * @module components/nav
 */

import { qs, qsa } from '../utils/dom.js';
import { reduceMotion } from '../utils/env.js';
import { closeMenu } from './menu.js';

/** @type {ReturnType<typeof setTimeout>|null} */
let scrollTicker = null;

/**
 * Navbar jadi berkaca saat scroll. Ditoggle lewat requestAnimationFrame
 * supaya membaca posisi scroll dan menulis class tidak bertumpuk dalam satu frame.
 * @param {HTMLElement} nav
 */
function initScrollState(nav) {
  let last = -1;

  /** */
  const read = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y === last) return;
    last = y;
    nav.classList.toggle('is-scrolled', y > 24);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicker) return;
      scrollTicker = requestAnimationFrame(() => {
        scrollTicker = null;
        read();
      });
    },
    { passive: true }
  );

  read();
}

/**
 * delegated klik untuk semua tautan anchor internal.
 * @param {string} sel
 */
function initAnchorScroll(sel) {
  document.addEventListener('click', (e) => {
    const link = /** @type {Element} */ (e.target).closest(sel);
    if (!(link instanceof HTMLAnchorElement)) return;

    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('#') || href === '#') return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    closeMenu();

    const behavior = reduceMotion() ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });

    // Fokus ikut pindah supaya keyboard & screen reader tidak tertinggal
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    // Tulis ulang hash tanpa memicu scroll kedua
    history.replaceState(null, '', href);
  });
}

/**
 * @param {{ nav: HTMLElement|null, anchorSelector: string }} opt
 */
export function initNav({ nav, anchorSelector }) {
  if (nav) initScrollState(nav);
  initAnchorScroll(anchorSelector);

  // Perbarui state awal bila halaman dimuat dengan hash
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
  }
}

/** Semua tautan navigasi (dipakai untuk sorotan kursor). */
export const navSelector = '[data-nav], [data-menu-link]';

/** @returns {HTMLAnchorElement[]} */
export const getNavLinks = () => /** @type {HTMLAnchorElement[]} */ (qsa('[data-nav]'));

/** @param {Element|null} node */
export const focusElement = (node) => /** @type {HTMLElement} */ (node)?.focus({ preventScroll: true });

/** @returns {HTMLElement|null} */
export const getNav = () => qs('#nav');
