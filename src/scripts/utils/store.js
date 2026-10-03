/**
 * Penyimpanan preferensi pengguna (tema).
 * Aman dipanggil dari environment tanpa localStorage (mis. mode privat).
 * @module utils/store
 */

const KEY = 'fa-theme';

/** @returns {Storage|null} */
function safeStorage() {
  try {
    const probe = '__fa__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

const store = safeStorage();

/** @returns {'light'|'dark'|null} */
export function readTheme() {
  const v = store?.getItem(KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

/** @param {'light'|'dark'} theme */
export function writeTheme(theme) {
  store?.setItem(KEY, theme);
}

/** @param {'light'|'dark'} theme */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#F4F4F1');
}
