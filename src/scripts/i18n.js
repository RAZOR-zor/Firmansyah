/**
 * Mekanisme Dwibahasa.
 *
 * Prinsip: teks Bahasa Indonesia TETAP ada di `index.html`. JavaScript
 * hanya menulis ulang teks itu bila pengguna memilih bahasa Inggris.
 * Alasannya:
 *  - tidak ada kedipan (FOUC) dan tidak perlu render ulang
 *  - mesin pencari tetap membaca isi lengkap dalam HTML
 *  - tanpa JavaScript, situs tetap tampil utuh dalam Bahasa Indonesia
 *
 * Cara memakai:
 *   <p data-i18n="hero.desc">…</p>                     → teks
 *   <a data-i18n-attr="aria-label:themeLabel">…</a>    → atribut
 *   <h1 data-i18n-html="hero.title">…</h1>             → HTML
 *
 * CATATAN `data-i18n-html` — hanya dipakai untuk dua judul besar yang
 * butuh pemenggalan baris eksplisit (`<br />`). Nilainya berasal dari
 * `data.js` milik kita sendiri, bukan dari input pengguna, jadi aman.
 * Dipakai seminimal mungkin: dari ribuan elemen, hanya 2 yang memakai ini.
 *
 * @module i18n
 */

import { DEFAULT_LANG, LANGS, text } from './data.js';
import { qs, qsa } from './utils/dom.js';

const STORAGE_KEY = 'fa-lang';

/** @type {import('./data.js').Lang} */
let current = DEFAULT_LANG;

/** @type {Array<() => void>} */
const listeners = [];

/** @returns {import('./data.js').Lang[]} */
export const available = () => /** @type {any} */ (LANGS);

/** @returns {import('./data.js').Lang} */
export const getLang = () => current;

/**
 * Ambil nilai mentah untuk satu kunci — bisa string, array, atau object.
 * @param {string} path  contoh 'projects.items.01.tags'
 * @param {import('./data.js').Lang} [lang]
 * @returns {any}
 */
export function tRaw(path, lang = current) {
  const read = (dict) =>
    path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), /** @type {any} */ (dict));
  const found = read(text[lang] ?? text[DEFAULT_LANG]);
  return found ?? read(text[DEFAULT_LANG]);
}

/**
 * Ambil teks untuk satu kunci. Kalau yang ditemukan bukan string,
 * hasilnya dikembalikan sebagai JSON agar tidak hilang diam-diam.
 * @param {string} path  contoh 'hero.desc' atau 'projects.items.01.title'
 * @param {import('./data.js').Lang} [lang]
 * @returns {string}
 */
export function t(path, lang = current) {
  const found = tRaw(path, lang);
  return typeof found === 'string' ? found : '';
}

/**
 * Tulis ulang seluruh elemen bertanda `data-i18n` dan `data-i18n-attr`.
 * Dipanggil sekali saat muat, dan setiap kali bahasa diganti.
 * @param {import('./data.js').Lang} lang
 */
function translateDom(lang) {
  qsa('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (!key) return;
    const value = t(key, lang);
    if (value) node.textContent = value;
  });

  qsa('[data-i18n-html]').forEach((node) => {
    const key = node.getAttribute('data-i18n-html');
    if (!key) return;
    const value = t(key, lang);
    if (value) node.innerHTML = value;
  });

  qsa('[data-i18n-attr]').forEach((node) => {
    // Format: "attr:key.attr:key"
    node.getAttribute('data-i18n-attr')
      ?.split(' ')
      .filter(Boolean)
      .forEach((pair) => {
        const sep = pair.indexOf(':');
        if (sep < 1) return;
        const attr = pair.slice(0, sep);
        const key = pair.slice(sep + 1);
        const value = t(key, lang);
        if (value) node.setAttribute(attr, value);
      });
  });
}

/**
 * Perbarui <title> dan meta deskripsi mengikuti bahasa aktif.
 * @param {import('./data.js').Lang} lang
 */
function translateMeta(lang) {
  const title = t('meta.title', lang);
  const description = t('meta.description', lang);
  if (title) document.title = title;
  if (description) {
    /** @type {HTMLMetaElement|null} */
    const m = qs('meta[name="description"]');
    m?.setAttribute('content', description);
    qs('meta[property="og:title"]')?.setAttribute('content', title);
    qs('meta[property="og:description"]')?.setAttribute('content', description);
  }
}

/**
 * Tandai bahasa aktif pada elemen pemindah bahasa.
 * @param {import('./data.js').Lang} lang
 */
function syncSwitcher(lang) {
  qsa('[data-lang]').forEach((btn) => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/** @returns {import('./data.js').Lang|null} */
function readSaved() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return /** @type {any} */ (LANGS).includes(/** @type {any} */ (v)) ? v : null;
  } catch {
    return null;
  }
}

/** @param {import('./data.js').Lang} lang */
function save(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* mode privat — pilihan tidak disimpan, tidak fatal */
  }
}

/**
 * Ganti bahasa dan beri tahu pendengar (termasuk render ulang komponen).
 * @param {import('./data.js').Lang} lang
 * @param {{ persist?: boolean }} [opt]
 */
export function setLang(lang, opt = {}) {
  if (!(/** @type {any} */ (LANGS).includes(lang))) return;
  current = lang;

  document.documentElement.setAttribute('lang', lang);
  translateDom(lang);
  translateMeta(lang);
  syncSwitcher(lang);
  if (opt.persist !== false) save(lang);

  listeners.forEach((fn) => fn(lang));
}

/** @param {(lang: import('./data.js').Lang) => void} fn */
export function onLangChange(fn) {
  listeners.push(fn);
}

/**
 * Daftarkan tombol pemindah bahasa.
 * @param {HTMLElement} root
 */
export function initLangSwitcher(root) {
  root.addEventListener('click', (e) => {
    const btn = /** @type {Element|null} */ (e.target).closest('[data-lang]');
    if (!btn) return;
    const lang = /** @type {import('./data.js').Lang} */ (btn.getAttribute('data-lang'));
    if (lang && lang !== current) setLang(lang);
  });
}

/**
 * Terapkan bahasa tersimpan (atau bawaan) saat halaman dimuat.
 * Harus dipanggil SEBELUM animasi dimulai.
 */
export function initLang() {
  setLang(readSaved() ?? DEFAULT_LANG, { persist: false });
}
