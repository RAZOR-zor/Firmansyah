/**
 * Menu mobile: buka/tutup, animasi, focus trap, tombol Escape.
 * @module components/menu
 */

import { gsap } from '../animations/gsap.js';
import { t } from '../i18n.js';
import { qs, qsa } from '../utils/dom.js';

/** Elemen yang boleh difokus di dalam panel menu. */
const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

let open = false;
let lastFocused = null;

/** @type {ReturnType<typeof setTimeout>|null} */
let closeTimer = null;

/**
 * @param {HTMLElement} menu
 * @param {HTMLElement} burger
 */
export function initMenu(menu, burger) {
  if (!menu || !burger) return;

  const nav = /** @type {HTMLElement|null} */ (document.getElementById('nav'));

  // `hidden` dipakai agar menu tidak bisa difokus sebelum dibuka.
  const setHidden = (v) => {
    menu.hidden = v;
    document.body.style.overflow = v ? '' : 'hidden';
  };

  /** @param {boolean} next */
  const setOpen = (next) => {
    if (open === next) return;
    open = next;

    burger.setAttribute('aria-expanded', String(next));
    burger.setAttribute('aria-label', next ? t('burgerClose') : t('burgerOpen'));
    menu.classList.toggle('is-open', next);
    nav?.classList.toggle('is-menu-open', next);

    if (next) {
      if (closeTimer) clearTimeout(closeTimer);
      setHidden(false);
      // Paksa reflow supaya transisi masuk benar-benar berjalan
      void menu.offsetWidth;
      const first = /** @type {HTMLElement|null} */ (menu.querySelector(FOCUSABLE));
      first?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      const finish = () => {
        if (!open) setHidden(true);
      };
      if (gsap) gsap.delayedCall(0.32, finish);
      else setTimeout(finish, 320);
      lastFocused?.focus({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () => {
    lastFocused = /** @type {HTMLElement} */ (document.activeElement);
    setOpen(!open);
  });

  // Klik tautan di dalam menu → tutup dulu, lalu scroll
  qsa('[data-menu-link]', menu).forEach((link) => {
    link.addEventListener('click', () => {
      setOpen(false);
      lastFocused = null;
    });
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key !== 'Tab') return;

    const items = qsa(FOCUSABLE, menu).filter((n) => n.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Klik pada area panel yang bukan tautan → tutup
  menu.addEventListener('click', (e) => {
    if (e.target === menu || (e.target instanceof HTMLElement && e.target.classList.contains('menu__panel'))) {
      setOpen(false);
    }
  });

  // Tutup otomatis kalau viewport melebar ke mode desktop
  const mq = window.matchMedia('(min-width: 1000px)');
  const onWide = () => mq.matches && setOpen(false);
  mq.addEventListener('change', onWide);

  setHidden(true);
}

/** @returns {boolean} */
export const isMenuOpen = () => open;

/** Tutup menu dari luar (mis. setelah navigasi). */
export function closeMenu() {
  const burger = qs('#burger');
  if (burger && open) burger.click();
}

/**
 * Selaraskan label tombol dengan bahasa aktif.
 * Dipanggil setelah ganti bahasa, karena `aria-label` di-set dari JS
 * (tidak bisa handled oleh `data-i18n-attr` yang hanya berjalan sekali).
 */
export function localizeMenuLabels() {
  const burger = qs('#burger');
  if (burger) burger.setAttribute('aria-label', open ? t('burgerClose') : t('burgerOpen'));
}
