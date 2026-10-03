/**
 * Render daftar proyek.
 *
 * Teks diambil dari `data.js` → `text[lang].projects.items`, dicocokkan
 * dengan `project.index` supaya tidak perlu menduplikasi data non-teks.
 * Markup dibangun lewat DOM API, bukan innerHTML dari data.
 * @module components/projects
 */

import { projects } from '../data.js';
import { t, tRaw } from '../i18n.js';
import { mockupSvg } from './mockup.js';
import { el, qs } from '../utils/dom.js';

const ARROW =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11L11 5M5 5h6v6"/></svg>';

/** @param {import('../data.js').ProjectShell} shell */
function buildProject(shell) {
  const href = shell.linkHref ?? '';
  const isExternal = /^https?:/.test(href);

  const figure = el('div', { class: 'project__figure' });
  const media = el('div', { class: 'project__media', attrs: { 'data-parallax': 'true' } });
  // SVG mockup bersifat statis, tidak pernah berisi input pengguna.
  media.innerHTML = mockupSvg(shell.mockup, t(`projects.items.${shell.index}.title`));
  figure.append(media);

  const meta = el('p', { class: 'project__meta' });
  meta.append(el('span', { class: 'project__index', text: shell.index }));
  meta.append(el('span', { text: t(`projects.items.${shell.index}.category`) }));
  if (shell.status) {
    meta.append(el('span', { class: 'project__badge', text: t(`projects.${shell.status}`) }));
  }

  /** @type {string[]} */
  const tagList = tRaw(`projects.items.${shell.index}.tags`) ?? [];

  const tags = el('ul', { class: 'project__tags' });
  tagList.forEach((tag) => tags.append(el('li', { text: tag })));

  /**
   * Tombol hanya dibuat kalau proyeknya punya URL. Tanpa ini, `href="#"`
   * menghasilkan tautan mati: terlihat bisa diklik, tidak menuju ke
   * mana pun, dan `project__link:hover` tetap memberi affordance palsu.
   * Kedua proyeknya: Form Solver sudah punya repo publik, jadi tautannya
   * membuka tab baru. RAZOR belum dipublikasikan, jadi tombolnya memang
   * tidak muncul.
   * @type {HTMLElement|null}
   */
  const link = href
    ? el('a', {
        class: 'project__link',
        attrs: {
          href,
          'data-cursor': 'view',
          ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
        children: [
          el('span', { text: t(`projects.items.${shell.index}.linkLabel`) }),
          el('span', { class: 'project__arrow', html: ARROW }),
        ],
      })
    : null;

  /**
   * Dua daftar terpisah, bukan satu blok teks: "dipakai untuk apa" dan
   * "bagaimana kerjanya" adalah dua pertanyaan berbeda, dan menyatukannya
   * jadi satu paragraf panjang selalu berakhir jadi kabur.
   *
   * Labelnya ikut diterjemahkan, tapi isi daftarnya per proyek — karena
   * apa yang berguna dan apa yang dikerjakan memang berbeda-bedanya.
   * @param {string} key
   * @returns {HTMLElement|null}
   */
  function factBlock(key) {
    const list = tRaw(`projects.items.${shell.index}.${key}`);
    if (!Array.isArray(list) || !list.length) return null;

    const items = list.map((row) => el('li', { text: String(row) }));
    return el('div', {
      class: 'project__facts',
      children: [
        el('p', { class: 'fact__label', text: t(`projects.${key === 'uses' ? 'use' : 'how'}`) }),
        el('ul', { class: 'fact__list', children: items }),
      ],
    });
  }

  const body = el('div', {
    class: 'project__body',
    children: [
      meta,
      el('h3', { class: 'project__title', text: t(`projects.items.${shell.index}.title`) }),
      el('p', { class: 'project__desc', text: t(`projects.items.${shell.index}.description`) }),
      factBlock('uses'),
      factBlock('how'),
      tags,
      link,
    ].filter(Boolean),
  });

  return el('li', {
    class: `project project--${shell.layout}`,
    attrs: { 'data-reveal': 'true' },
    children: [figure, body],
  });
}

/**
 * Render semua proyek ke dalam `#projects-list`.
 * Aman dipanggil ulang setiap kali bahasa diganti.
 */
export function renderProjects() {
  const list = qs('#projects-list');
  if (!list) return;
  list.replaceChildren(...projects.map(buildProject));
}
