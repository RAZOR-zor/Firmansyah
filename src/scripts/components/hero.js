/**
 * Choreografi pembuka hero.
 *
 * Kenapa `fromTo`, bukan `from`:
 * elemen hero disembunyikan lebih dulu dengan `gsap.set(autoAlpha: 0)`
 * supaya tidak ada kedipan di balik layar muat. Kalau lalu dipakai
 * `from({ autoAlpha: 0 })`, GSAP akan memakai state SAAT INI sebagai
 * tujuan — yaitu 0 — sehingga elemennya beranimasi dari 0 ke 0 dan
 * tetap tak terlihat. `fromTo` menentukan tujuan secara eksplisit,
 * jadi hasilnya tidak bergantung pada state awal.
 *
 * Satu timeline, stagger 0,06, target total ± 1 detik, dan tidak ada
 * lebih dari dua elemen yang bergerak bersamaan.
 *
 * @module components/hero
 */

import { gsap } from '../animations/gsap.js';
import { motionProfile } from '../data.js';
import { DURATION, EASE, SHIFT, STAGGER } from '../animations/tokens.js';
import { splitIn } from '../animations/split.js';
import { playHeroMotion } from './heroMotion.js';
import { qsa } from '../utils/dom.js';

/**
 * Sembunyikan elemen hero.
 * Dipanggil SEBELUM layar muat selesai, supaya elemen tidak pernah
 * terlihat lalu melompat hilang di detik pertama.
 *
 * Judul TIDAK ikut disembunyikan: `mask: 'lines'` pada SplitText sudah
 * men-clip kata-kata di luar baris, jadi tidak ada risiko kedipan.
 *
 * @param {Element|null} scrollHint
 */
export function hideHeroBeforeIntro(scrollHint) {
  if (!gsap) return;
  gsap.set(qsa('[data-hero]'), { autoAlpha: 0 });
  if (scrollHint) gsap.set(scrollHint, { autoAlpha: 0 });
}
/**
 * @param {Element|null} scrollHint
 * @param {number} [delay]  Detik penundaan sebelum animasi mulai.
 *
 * Delay ini bukan hiasan. Panel layar muat menyingkir dari ATAS ke bawah,
 * jadi isi layar bagian paling atas (navbar) yang pertama kali terlihat —
 * dan itu persis urutan kaskade di bawah. Kalau hero mulai bersamaan
 * dengan panel, animasi navbarnya selesai di detik ke-0,6 sementara
 * panelnya baru bergerak 0,42: seluruh pembuka hero terjadi di balik
 * panel yang masih menutup layar, dan yang ditonton pengguna cuma
 * halaman yang sudah diam.
 *
 * Jadi hero ditahan sampai seam mulai turun, lalu kaskadenya berjalan
 * di ruang yang benar-benar terbuka.
 */
export function playHeroIntro(scrollHint = null, delay = 0) {
  const title = document.querySelector('[data-split="mask"]');
  const groups = {
    eyebrow: qsa('[data-hero="eyebrow"]'),
    sub: qsa('[data-hero="sub"]'),
    desc: qsa('[data-hero="desc"]'),
    cta: qsa('[data-hero="cta"]'),
    facts: qsa('[data-hero="facts"]'),
    motion: qsa('[data-hero="motion"]'),
  };
  // Kerangka halaman ikut muncul bersama pembuka, supaya tidak terasa
  // seperti "halaman tiba-tiba sudah ada" di balik layar yang terangkat.
  const chrome = qsa('[data-hero="chrome"]');

  if (!gsap) return null;

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    paused: delay > 0,
  });

  /**
   * @param {Element[]} nodes
   * @param {number} y
   * @param {number} duration
   * @param {number} at
   * @param {number} [stagger]
   */
  const riseIn = (nodes, y, duration, at, stagger = 0) => {
    if (!nodes.length) return;
    tl.fromTo(
      nodes,
      { autoAlpha: 0, y },
      { autoAlpha: 1, y: 0, duration, stagger, ease: EASE.out },
      at
    );
  };

  riseIn(chrome, SHIFT.xs, DURATION.slow, 0, STAGGER.tight);
  riseIn(groups.eyebrow, SHIFT.xs, DURATION.base, 0.05);
  riseIn(groups.sub, SHIFT.sm, DURATION.base, 0.42);
  riseIn(groups.desc, SHIFT.sm, DURATION.base, 0.48);
  riseIn(groups.cta, SHIFT.md, DURATION.slow, 0.55, STAGGER.tight);
  riseIn(groups.facts, SHIFT.sm, DURATION.slow, 0.64);
  riseIn(groups.motion, SHIFT.sm, DURATION.slow, 0.58);

  if (title) {
    if (motionProfile.useTextSplit) {
      // Judul sudah autoAlpha 1; hanya kata-katanya yang naik dari bawah mask
      //
      // `splitIn` membuat tween-nya sendiri di timeline global, bukan di
      // timeline hero ini. Jadi penundaannya harus ikut diteruskan lewat
      // `delay` — kalau tidak, kata-kata judul tetap bergerak saat panel
      // masih menutup layar, dan `paused: true` di sini jadi tidak
      // melakukan apa pun.
      splitIn(title, { delay: delay + 0.12, duration: DURATION.intro, stagger: 0.055 });
    } else {
      // SplitText dimatikan: judul muncul sebagai satu blok utuh
      riseIn([title], SHIFT.md, DURATION.slow, 0.12);
    }
  }

  if (scrollHint) {
    tl.fromTo(scrollHint, { autoAlpha: 0 }, { autoAlpha: 1, duration: DURATION.base, ease: EASE.out }, 0.78);

    const dot = scrollHint.querySelector('.scroll-hint__dot');
    if (dot) {
      tl.fromTo(
        dot,
        { scaleX: 0.1, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true },
        0.85
      );
    }
  }

  // Isi grafik orbit (cincin, ticks, denyut) punya timeline sendiri di
  // `heroMotion.js`. Ia dipanggil dari sini, bukan dari `main.js`, supaya
  // penundaannya mengikuti lembar loader persis seperti yang dilakukan
  // `splitIn()` untuk judul di atas.
  if (groups.motion.length) playHeroMotion(delay + 0.74);

  if (delay > 0) {
    gsap.delayedCall(delay, () => tl.play(0));
  }

  return tl;
}
