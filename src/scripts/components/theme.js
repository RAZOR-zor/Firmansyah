/**
 * Tombol tema terang / gelap.
 * @module components/theme
 */

import { applyTheme, readTheme, writeTheme } from '../utils/store.js';
import { qs } from '../utils/dom.js';

/** @returns {'light'|'dark'} */
const current = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

/**
 * @param {'light'|'dark'} theme
 */
function commit(theme) {
  applyTheme(theme);
  writeTheme(theme);
}

/**
 * Pasang toggle. Kalau user belum pernah memilih, ikuti perubahan
 * sistem secara langsung. Kalau sudah memilih, pilihan itu yang diPegang.
 */
export function initThemeToggle() {
  const btn = /** @type {HTMLButtonElement|null} */ (qs('#theme-toggle'));
  if (!btn) return;

  if (!readTheme()) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
      if (readTheme()) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  btn.addEventListener('click', () => {
    commit(current() === 'dark' ? 'light' : 'dark');
  });

  // Ikon tombol ikut berganti lewat CSS [data-theme], tidak perlu JS.
}

/** Dipakai untuk mengsinkronkan tampilan bila tema diubah dari luar. */
export function syncThemeMeta() {
  applyTheme(current());
}
