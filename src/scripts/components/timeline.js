/**
 * Render timeline perjalanan.
 * @module components/timeline
 */

import { journey } from '../data.js';
import { tRaw } from '../i18n.js';
import { el, qs } from '../utils/dom.js';

/**
 * Render timeline ke dalam `#timeline`.
 *
 * Aman dipanggil ulang setiap kali bahasa diganti: node dibangun dari
 * ulang dengan `el()`, bukan menyalin `innerHTML`, sehingga elemen yang
 * sudah di-split GSAP tidak ikut terkacau.
 */
export function renderTimeline() {
  const list = qs('#timeline');
  if (!list) return;

  const rail = el('span', { class: 'timeline__rail', attrs: { 'aria-hidden': 'true' } });
  const progress = el('span', {
    class: 'timeline__progress',
    attrs: { 'aria-hidden': 'true', 'data-timeline-progress': 'true' },
  });
  rail.append(progress);

  const items = journey.map((shell) => {
    /** @type {{title?:string, description?:string, year?:string}} */
    const copy = tRaw(`journey.items.${shell.year}`) ?? {};
    return el('li', {
      class: 'tl-item',
      attrs: { 'data-reveal': 'true' },
      children: [
        el('span', { class: 'tl-item__node', attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: 'tl-item__year', text: copy.year || shell.year }),
        el('h3', { class: 'tl-item__title', text: copy.title ?? '' }),
        el('p', { class: 'tl-item__desc', text: copy.description ?? '' }),
      ],
    });
  });

  list.replaceChildren(rail, ...items);
}
