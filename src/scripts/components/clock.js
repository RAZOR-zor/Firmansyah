/**
 * Jam lokal Bogor (WIB) di margin rail.
 *
 * Sengaja memakai `Asia/Jakarta` dan bukan offset tetap: kalau daylight
 * saving dihitung ulang, jamnya tetap benar.
 *
 * @module components/clock
 */

import { identity } from '../data.js';
import { qs } from '../utils/dom.js';

const formatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: identity.timezone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** @returns {string} contoh "14:05" */
export function bogorTime() {
  try {
    return formatter.format(new Date());
  } catch {
    return '--:--';
  }
}

/** Pasang jam yang berdetak tiap menit, dan langsung isi nilainya. */
export function initClock() {
  const node = qs('#rail-time');
  if (!node) return;

  const tick = () => {
    node.textContent = bogorTime();
  };
  tick();

  // Dijepad ke detik ke-0 supaya angka tidak terlihat melompat.
  const msToMinute = 60000 - (Date.now() % 60000);
  setTimeout(() => {
    tick();
    setInterval(tick, 60000);
  }, msToMinute);
}
