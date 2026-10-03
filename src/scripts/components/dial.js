/**
 * Dial registrasi — cincin tick yang berputar.
 *
 * Elemen ini adalah "wajah" layar muat: satu-satunya bentuk di sheet itu
 * yang bergerak terus-menerus, dan satu-satunya yang dibangun dari
 * garis-garis pendek.
 *
 * ── Kenapa hanya bagian luar yang memakai tick ────────────────────
 *
 * Referensinya punya dua jenis goresan: cincin dalam yang penuh
 * (lingkaran, satu busur) dan cincin luar yang pecah menjadi tick. Yang
 * luar ikut berputar, yang dalam diam. Itu pilihan yang tepat, bukan
 * sekadar soalitarian: kalau semuanya berputar, mata tidak tahu bagian
 * mana yang jadi acuan. Diamnya bagian dalam itulah yang membuat putaran
 * di luar TERBACA sebagai putaran.
 *
 * Jadi di dalam sini tidak ada cincin putus-putus. Yang ada hanya
 * lingkaran penuh, satu busur, dan titik tengah. Kalau nanti cincin
 * putus di dalam dibutuhkan, itu penambahan — bukan pengembalian.
 *
 * ── Kenapa 60 tick ───────────────────────────────────────────────
 *
 * 60 membagi 360, jadi pola tick berulang setiap 6°. Satu putaran penuh
 * berakhir pada posisi yang identik dengan posisi awal, jadi loop-nya
 * tidak pernah terlihat melompat — yang terjadi cuma 60 tick yang
 * saling bertukar tempat, persis seperti sikat jam yang benar.
 *
 * Lima tick pertama (setiap kelipatan 12, jadi 72°) memakai aksen dan
 * dibuat lebih panjang: tick mayor seperti bezel meteran. Jumlahnya
 * sengaja lima, sama dengan jumlah kejadian pada `STEPS`.
 *
 * @module components/dial
 */

import { gsap } from '../animations/gsap.js';
import { reduceMotion } from '../utils/env.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Jumlah tick. Harus membagi 360 supaya putarannya seamless. */
const TICKS = 60;

/** Berapa lama satu putaran, dalam detik. */
const REVOLUTION = 3.2;

/** Titik pusat viewBox 0 0 480 480. */
const CX = 240;
const CY = 240;

/**
 * Jari-jari dalam viewBox 0 0 480 480, diukur dari pusat.
 *
 * Angkanya diambil dari referensinya dengan satu satuan: bezel = 1,00.
 * Lingkaran dalam 0,40, busur 0,60, tick 1,10 → 1,20. Menyamakan
 * proporsi ke satu satuan lebih penting daripada angka absolutnya —
 * itulah yang membuat dial ini terasa seperti satu benda yang
 * digambar, bukan kumpulan lingkaran yang kebetulan ada di sana.
 */
const R_RING = 70;
const R_ARC = 106;
const R_BEZEL = 176;
const R_TICK_IN = 194;
const R_TICK_OUT = 206;
const R_TICK_MAJOR = 222;
const R_DATUM = 228;

/** Setiap berapa tick yang jadi mayor (aksen). */
const MAJOR_EVERY = 12;

/**
 * @param {SVGElement} root
 * @returns {SVGGElement|null}
 */
const ticksGroup = (root) => /** @type {SVGGElement|null} */ (root.querySelector('[data-dial-ticks]'));

/**
 * Bangun tick-nya.
 *
 * `document.createElementNS` wajib, bukan helper `el()` dari
 * `utils/dom.js`: helper itu memakai `createElement`, yang membuat
 * HTMLUnknownElement untuk tag SVG — node-nya ada di DOM tapi browser
 * tidak menggambarnya.
 *
 * @param {SVGGElement|null} group
 * @returns {number} berapa tick yang dibuat
 */
function buildTicks(group) {
  if (!group) return 0;
  const step = 360 / TICKS;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < TICKS; i++) {
    const major = i % MAJOR_EVERY === 0;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(CX));
    line.setAttribute('y1', String(CY - R_TICK_IN));
    line.setAttribute('x2', String(CX));
    line.setAttribute('y2', String(CY - (major ? R_TICK_MAJOR : R_TICK_OUT)));
    line.setAttribute('transform', `rotate(${step * i} ${CX} ${CY})`);
    if (major) line.setAttribute('class', 'dial__tick dial__tick--major');
    else line.setAttribute('class', 'dial__tick');
    frag.appendChild(line);
  }

  group.appendChild(frag);
  return TICKS;
}

/** @type {any} */
let spin = null;

/**
 * Pasang dial: bangun tick-nya, lalu mulai berputar.
 *
 * Tidak idempoten dipanggil dua kali untuk node yang sama — `data-dial`
 * dipakai sebagai penanda, jadi panggilan kedua dilewati.
 *
 * @param {ParentNode} [scope]
 * @returns {SVGSVGElement|null}
 */
export function initDial(scope = document) {
  const root = /** @type {SVGSVGElement|null} */ (scope.querySelector('[data-dial]'));
  if (!root || root.dataset.dialReady === 'true') return root;

  root.dataset.dialReady = 'true';
  buildTicks(ticksGroup(root));

  // Reduced motion: cincin tetap ada, tapi tidak berputar. Dial adalah
  // navigasi, bukan dekorasi — ia harus tetap tell ke mana jarum
  // sedang berada, dan itu disampaikan oleh busur progress di tengah.
  if (!gsap || reduceMotion()) return root;

  const group = ticksGroup(root);
  if (!group) return root;

  // `svgOrigin` bukan `transformOrigin`: yang dirotasi adalah koordinat
  // dalam ruang SVG, bukan kotak elemennya.
  spin = gsap.to(group, {
    rotation: 360,
    duration: REVOLUTION,
    ease: 'none',
    repeat: -1,
    svgOrigin: `${CX} ${CY}`,
  });

  return root;
}

/**
 * Setel jarum progress.
 *
 * Memakai `stroke-dashoffset` pada lingkaran `pathLength="100"`, jadi
 * nilainya 0..100 langsung — tidak ada perhitungan keliling sama
 * sekali, dan angka di sini sama dengan angka persen di readout.
 *
 * @param {number} v 0..1
 * @param {ParentNode} [scope]
 */
export function setDialProgress(v, scope = document) {
  const arc = /** @type {SVGCircleElement|null} */ (scope.querySelector('.dial__prog'));
  if (arc) arc.style.strokeDashoffset = String((1 - Math.min(1, Math.max(0, v))) * 100);
}

/**
 * Hentikan putaran dan kembalikan ke posisi awal.
 * Dipanggil transisi keluar supaya tidak ada yang terus berputar di
 * elemen yang sedang dibuang.
 * @param {ParentNode} [scope]
 */
export function stopDial(scope = document) {
  spin?.kill();
  spin = null;
  const group = /** @type {SVGGElement|null} */ (scope.querySelector('[data-dial-ticks]'));
  if (group && gsap) gsap.set(group, { clearProps: 'transform' });
}
