/**
 * Pengisian tautan kontak statis.
 *
 * Semua elemen bertanda `data-contact="email"` mengambil `href`-nya dari
 * `data.js`, sehingga ada satu sumber tautan saja di proyek ini.
 * @module components/contact
 */

import { contacts } from '../data.js';
import { qsa } from '../utils/dom.js';

export function hydrateContactLinks() {
  const byKey = new Map(contacts.map((c) => [c.key.toLowerCase(), c]));

  qsa('[data-contact]').forEach((node) => {
    const key = String(node.dataset.contact ?? '').toLowerCase();
    const item = byKey.get(key);
    if (!item) return;

    const anchor = /** @type {HTMLAnchorElement} */ (
      node.tagName === 'A' ? node : node.querySelector('a') ?? node
    );
    anchor.setAttribute('href', item.href);
    if (item.external) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
}
