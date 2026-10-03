/**
 * Pelacakan section aktif.
 *
 * Satu sumber kebenaran untuk tiga tempat sekaligus:
 *  - link mana yang aktif di navbar
 *  - label + index di margin rail
 *  - label kecil di navbar brand
 *
 * Cara kerjanya: pemindaian geometris, bukan IntersectionObserver dengan
 * ambang batas. Alasannya — kalau halaman di-*jump* ke luar (klik "kembali
 * ke atas", buka tautan dalam, atau browser restore posisi scroll), tidak
 * ada section yang sempat melewati pita pemicu observer, sehingga labelnya
 * macet di section terakhir yang kebetulan terlihat.
 *
 * @module animations/section
 */

import { qs, qsa } from '../utils/dom.js';
import { markRailActive } from '../components/rail.js';

/**
 * Garis imajiner yang menentukan section aktif, sebagai fraksi tinggi
 * viewport. Section dianggap aktif begitu bagian atasnya melewati garis ini.
 *
 * Angka 0,4 dipilih supaya perpindahan label terjadi saat section memang
 * sudah jadi isi layar, bukan tepat saat section masih di bawah lipatan.
 */
const ACTIVE_LINE = 0.4;

/** @type {IntersectionObserver|null} */
let markObserver = null;

/** @type {IntersectionObserver|null} */
let centerObserver = null;

/** Section yang terakhir dianggap aktif. @type {HTMLElement|null} */
let activeSection = null;

/** Nomor frame yang sedang dijadwalkan, supaya tidak menumpuk. @type {number|null} */
let frame = null;

/** Fungsi pembersih yang dikumpulkan dari tiap listener. @type {Array<() => void>} */
let cleanups = [];

/**
 * Terapkan state aktif ke navbar, rail, dan brand.
 * @param {HTMLElement|null} section
 */
function applyActive(section) {
  if (!section || section === activeSection) return;
  activeSection = section;

  const id = section.id;
  const label = section.dataset.section ?? '';

  qsa('[data-nav]').forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });

  // Peta di margin rail ikut memakai sumber yang sama, supaya navbar dan
  // rail tidak mungkin berbeda pendapat soal posisi yang sama.
  markRailActive(section);

  const brandRole = qs('#nav-brand-role');
  if (brandRole) brandRole.textContent = label;
}

/**
 * Terapkan ulang label aktif dari `data-section` terbaru.
 * Wajib dipanggil setelah ganti bahasa, karena label ikut berubah sementara
 * posisi scroll tidak berubah — jadi tidak ada pemindaian yang terpicu.
 */
export function refreshActiveLabel() {
  const previous = activeSection;
  activeSection = null;
  applyActive(previous ? document.getElementById(previous.id) : null);
}

/**
 * Section aktif = section terakhir yang sudah melewati garis imajiner
 * di 40% tinggi layar.
 * @param {HTMLElement[]} sections
 */
function scan(sections) {
  const line = window.innerHeight * ACTIVE_LINE;
  /** @type {HTMLElement|null} */
  let current = null;

  // Semua pembacaan posisi lebih dulu, baru penulisan class/teks.
  // Mencampurkannya dalam satu frame akan memicu thrashing layout.
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line) current = section;
  }
  applyActive(current);
}

/**
 * Aktifkan pelacakan section aktif + tandai entri timeline.
 * @param {HTMLElement[]} sections
 */
export function initSectionTracking(sections) {
  if (!sections.length) return;

  const onScroll = () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      scan(sections);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  });

  scan(sections);

  // Penanda "sudah dibaca" di timeline tetap pakai IntersectionObserver:
  // yang dibutuhkan hanya "sudah pernah terlihat sekali", jadi ambang
  // batasnya tidak masalah.
  const items = qsa('.tl-item');
  if (items.length) {
    markObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-seen');
            markObserver?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0.25 }
    );
    items.forEach((i) => markObserver?.observe(i));
  }
}

/**
 * Nyalakan class `is-active` pada elemen saat berada di tengah viewport.
 * @param {Element|null} target
 * @param {string} [className]
 */
export function trackCenter(target, className = 'is-active') {
  if (!target) return;
  centerObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => target.classList.toggle(className, e.isIntersecting)),
    { rootMargin: '-45% 0px -45% 0px' }
  );
  centerObserver.observe(target);
}

/** Putuskan semua listener dan observer. */
export function destroySectionTracking() {
  if (frame !== null) {
    cancelAnimationFrame(frame);
    frame = null;
  }
  cleanups.forEach((fn) => fn());
  cleanups = [];
  markObserver?.disconnect();
  centerObserver?.disconnect();
  markObserver = centerObserver = null;
  activeSection = null;
}
