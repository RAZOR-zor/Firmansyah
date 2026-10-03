/**
 * Kursor kustom.
 *
 * Hanya aktif di perangkat dengan tetikus (pointer fine). Di layar sentuh
 * kursor asli dibiarkan utuh — kalau tidak, user kehilangan penanda fokus.
 *
 * Implementasi pakai `gsap.quickTo` untuk follower supaya tidak ada
 * perhitungan manual per frame.
 *
 * @module components/cursor
 */

import { gsap } from '../animations/gsap.js';
import { on } from '../utils/dom.js';

/** @type {{ x: (v:number)=>void, y: (v:number)=>void }|null} */
let follower = null;
/** @type {Array<() => void>} */
const disposers = [];

const LABELS = { link: '', view: 'Lihat' };

/**
 * Pasang seluruh perilaku kursor pada sebuah node.
 * @param {HTMLElement} node
 */
function attachCursor(node) {
  follower = {
    x: gsap.quickTo(node, 'x', { duration: 0.28, ease: 'power3.out' }),
    y: gsap.quickTo(node, 'y', { duration: 0.28, ease: 'power3.out' }),
  };

  const label = node.querySelector('.cursor__label');

  /** @param {PointerEvent} e */
  const move = (e) => {
    follower?.x(e.clientX);
    follower?.y(e.clientY);
    node.classList.add('is-visible');
  };

  /**
   * `hit` sudah merupakan elemen yang cocok — hasil pencarian dari helper
   * delegasi. Jangan mencarinya lagi dari `e.target`, karena `e.target`
   * tidak selalu berupa Element.
   *
   * @param {Element} hit
   */
  const over = (hit) => {
    const kind = hit.getAttribute('data-cursor') ?? '';
    node.classList.toggle('is-link', kind === 'link');
    node.classList.toggle('is-view', kind === 'view');
    if (label) label.textContent = LABELS[/** @type {keyof typeof LABELS} */ (kind)] ?? '';
  };

  /**
   * Pointer keluar dari elemen — harus dicek apakah ia pindah ke elemen
   * lain yang juga punya `data-cursor`, supaya tidak berkedip.
   * @param {Element} hit
   * @param {Event} e
   */
  const out = (hit, e) => {
    const to = e.relatedTarget;
    if (to instanceof Element && to.closest('[data-cursor]')) return;
    node.classList.remove('is-link', 'is-view');
    if (label) label.textContent = '';
  };

  const down = () => node.classList.add('is-down');
  const up = () => node.classList.remove('is-down');
  const leave = () => node.classList.remove('is-visible');
  const enter = () => node.classList.add('is-visible');

  window.addEventListener('pointermove', move, { passive: true });
  disposers.push(() => window.removeEventListener('pointermove', move));

  disposers.push(on('[data-cursor]', 'pointerover', over));
  disposers.push(on('[data-cursor]', 'pointerout', out));
  disposers.push(on('a, button', 'pointerdown', down));
  disposers.push(on('a, button', 'pointerup', up));
  disposers.push(on('a, button', 'pointercancel', up));

  document.documentElement.addEventListener('mouseleave', leave);
  document.documentElement.addEventListener('mouseenter', enter);
  disposers.push(() => {
    document.documentElement.removeEventListener('mouseleave', leave);
    document.documentElement.removeEventListener('mouseenter', enter);
  });
}

/**
 * Aktifkan kursor bila layak.
 * @param {boolean} allowed
 */
export function initCursor(allowed) {
  const node = /** @type {HTMLElement|null} */ (document.getElementById('cursor'));
  if (!node || !allowed || !gsap) return;

  document.documentElement.classList.add('has-custom-cursor');
  attachCursor(node);
}

/** Aktifkan ulang setelah node baru dirender. */
export function rebindCursor() {
  if (!document.documentElement.classList.contains('has-custom-cursor')) return;
  const node = /** @type {HTMLElement|null} */ (document.getElementById('cursor'));
  if (node) attachCursor(node);
}

/** Cabut kursor kustom sepenuhnya. */
export function destroyCursor() {
  disposers.forEach((fn) => fn());
  disposers.length = 0;
  document.documentElement.classList.remove('has-custom-cursor');
}
