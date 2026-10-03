/**
 * Layar muat — "print sheet".
 *
 * Dua tahap:
 *
 *   1. MUAT    Registration mark tumbuh dari sudut, wordmark diset
 *              huruf demi huruf dari balik baseline, garis rambut
 *              terisi 0 → 100%. Readout di atasnya melaporkan
 *              pekerjaan yang benar-benar sedang terjadi.
 *   2. KELUAR  Isi lembar menyingkir, lembar turun keluar layar, dan
 *              garis aksen tertinggal di atas halaman yang sudah
 *              terbuka lalu menyusut ke tengah.
 *
 * Halaman terbuka sendiri. Tidak ada tombol, tidak ada pager yang
 * menggantung, dan tidak ada durasi yang dipilih demi supaya
 * animasinya enak dilihat.
 *
 * ── Kenapa progresnya nyata ──────────────────────────────────────
 *
 * Yang dicatat adalah lima kejadian yang benar-benar terjadi, dengan
 * bobot yang menyatakan seberapa penting masing-masing:
 *
 *   01  dom     document sudah diurai                   8%
 *   02  layout  gaya sudah berlaku, tinggi bisa diukur  12%
 *   03  fonts   document.fonts.ready                    25%
 *   04  load    window.load                             20%
 *   05  intro   animasi pembuka selesai                 35%
 *
 * Yang tidak dicatat adalah waktu. Tidak ada durasi yang dipilih agar
 * bar terlihat bergerak: versi lama mengisi bar selama tiga detik tetap,
 * padahal di localhost semuanya selesai dalam 130ms, jadi angkanya
 * tidak pernah berarti apa pun selain "berapa lama kita sengaja
 * menunggu sebelum dibolehkan masuk". Bar sekarang hanya bergerak
 * karena ada pekerjaan yang selesai.
 *
 * ── Kenapa lamanya dipilih, dan bukan berdasarkan keberhasilan ──
 *
 * `MIN_SECONDS` bukan durasi, melainkan lantai: progres boleh lebih
 * lambat dari lantai itu kalau ada yang belum beres, tapi tidak boleh
 * lebih cepat. Dan 2,2 detik di situ bukan angka bulat yang enak
 * dipilih — animasi pembuka berakhir di 1,1 detik, jadi lantai yang
 * lebih pendek akan membuat bar penuh sementara hurufnya masih naik.
 * Bar penuh sementara ada yang bergerak terbaca bukan "hampir
 * selesai", tapi "ada yang lupa jalan".
 *
 * Gunanya yang lain: halaman yang siap dalam 130ms tetap sempat
 * menampilkan seluruh urutan (mark → huruf → bar penuh → "Siap"), jadi
 * yang ditonton orang adalah satu kalimat visual yang utuh, bukan
 * kedipan yang hilang sebelum sempat dibaca.
 *
 * 3 detik versi lama tidak bisa dibenarkan dengan alasan yang sama:
 * di 3 detik, "sedang memuat" sudah tidak benar karena tidak ada apa
 * pun yang sedang dimuat.
 *
 * Setiap kejadian punya batas waktu sendiri, jadi satu aset yang
 * tidak pernah tiba tidak pernah menggantung seluruh layar.
 *
 * ── Reduce motion ────────────────────────────────────────────────
 *
 * Geraknya dipangkas, waktunya tidak. Wordmark dan registration mark
 * tampil apa adanya; yang tetap bergerak cuma bar dan angkanya. Bar
 * 2px yang mendatar tidak memicu gangguan vestibular — yang memicu
 * adalah gerakan besar, mendadak, dan di luar ekspektasi. Menghapus
 * bar justru lebih buruk: itu menghapus satu-satunya informasi yang
 * jujur di layar ini.
 *
 * @module components/loader
 */

import { gsap } from '../animations/gsap.js';
import { DURATION, EASE, STAGGER } from '../animations/tokens.js';
import { t } from '../i18n.js';
import { reduceMotion } from '../utils/env.js';
import { loaderHold } from '../utils/preview.js';

const selectors = {
  sheet: '.loader__sheet',
  foot: '.loader__foot',
  armH: '.loader__mark > span:first-child',
  armV: '.loader__mark > span:last-child',
  marks: '.loader__mark',
  chars: '.loader__word-line > span',
  rule: '.loader__rule',
  fill: '[data-loader-fill]',
  pct: '[data-loader-pct]',
  seam: '[data-loader-seam]',
  step: '[data-loader-step]',
  total: '[data-loader-total]',
  status: '[data-loader-status]',
  frame: '[data-frame-step]',
  guides: '.loader__guides',
  scan: '.loader__scan',
};

/**
 * Lantai waktu muat, dalam detik. `?loader=N` menimpanya.
 *
 * 2,2 detik, dan angka ini bukan bebas. Animasi pembuka (mark tumbuh +
 * sebelas huruf diset) berakhir di 1,1 detik. Lantai yang lebih pendek
 * dari itu berarti bar mencapai 100% sebelum huruf terakhirnya naik.
 *
 * Sisa 1,1 detik dipakai bar untuk menyapu 35% terakhir, dan itu bagian
 * yang paling enak dibaca: huruf sudah terpasang, lalu mesinnya jalan.
 * Sekalian menentukan ritme angkanya — lihat `PCT_STEP`.
 */
const MIN_SECONDS = 2.2;

/**
 * Laju pengejaran bar, dalam fraksi per detik.
 *
 * 2,6 berarti 0 → 100% keluar dalam ~0,38 detik. Nilainya bukan
 * estetika: cukup cepat supaya tidak terasa lengket setelah satu
 * kejadian selesai, cukup lambat supaya pergerakan bar terbaca
 * sebagai respons dan bukan lompatan.
 */
const CATCH_RATE = 2.6;

/**
 * Lima kejadian, urut, dengan bobot. Jumlahnya selalu 1, jadi
 * `progress` tidak mungkin keluar dari 0..1.
 *
 * bobot `intro` paling besar, dan itu bukan kebetulan: itu satu-satunya
 * kejadian yang benar-benar terlihat di layar. Setelah huruf terakhir naik,
 * bar masih menyisakan 35% terakhir — ruas-ruas itu yang dibaca orang
 * sebagai "mesinnya sedang jalan", bukan jeda kosong. Empat kejadian lainnya
 * selesai dalam ~0,1 detik dan tidak akan pernah terlihat kalau dibobot
 * lebih besar; bobot mereka menyatakan importance, bukan porsi layar.
 *
 * @type {ReadonlyArray<{ key: string, weight: number, timeout: number }>}
 */
const STEPS = [
  { key: 'dom', weight: 0.08, timeout: 0.3 },
  { key: 'layout', weight: 0.12, timeout: 0.3 },
  { key: 'fonts', weight: 0.25, timeout: 2.2 },
  { key: 'load', weight: 0.2, timeout: 2.8 },
  { key: 'intro', weight: 0.35, timeout: 3.4 },
];

/**
 * Berapa lama "100% · Siap" ditahan sebelum layar keluar, dalam detik.
 *
 * 0,42. Cukup untuk "penuh" terbaca sebagai peristiwa — dan bukan sekadar
 * bar yang kebetulan mentok — tanpa terasa seperti tombol yang tidak mau
 * merespons.
 */
const FULL_SETTLE = 0.42;

/**
 * Pager pengaman, dipisah per tahap karena risikonya berbeda.
 *
 * Tahap MUAT boleh menggantung kalau satu promise aset tidak pernah
 * resolve; 9 detik jauh di atas normal, jadi hanya menyala kalau sudah
 * rusak. Tahap KELUAR cuma transisi GSAP, yang mustahil menggantung
 * lebih dari 5 detik.
 *
 * Pager menambah `?loader=` ke anggarannya. Tanpa itu, `?loader=20`
 * akan dibunuh pager 9 detik di tengah jalan — bar masih naik, lalu
 * layarnya hilang tanpa sempat selesai. Pager menangkap "macet", bukan
 * "sedang sengaja lambat".
 */
const SAFETY_MS = 9000;
const SAFETY_EXIT_MS = 5000;

/** Elemen di luar layar yang dibikin `inert` selama layar tampil. */
const BEHIND = ['#nav', '#main', '.footer'];

let safetyTimer = null;
let armed = false;

/**
 * @param {string} sel
 * @param {ParentNode} [scope]
 * @returns {Element[]}
 */
const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/**
 * Pasang pager pengaman untuk satu tahap.
 * @param {number} ms
 */
function setSafety(ms) {
  clearTimeout(safetyTimer);
  safetyTimer = setTimeout(() => {
    safetyTimer = null;
    skipLoader();
  }, ms);
}

/**
 * Ambil alih layar muat dari jaring pengaman CSS.
 *
 * CSS `loader-failsafe` menyingkirkan diri setelah 3,2 detik supaya
 * halaman tetap bisa dibuka bila JavaScript tidak pernah jalan. Begitu
 * modul ini berjalan, wewenang itu pindah ke JS.
 *
 * Latar `.loader` ikut disterilkan. Aturan CSS tetap melekat sampai
 * JS mengaturnya, tapi dari titik ini onward yang bergerak adalah
 * `.loader__sheet`; kalau latar `.loader` tidak hilang, lembar yang
 * turun akan memperlihatkan dirinya sendiri sebagai kertas yang
 * berhenti di tengah layar. Lihat `.loader` di `components.css`.
 */
export function armLoader() {
  const node = document.getElementById('loader');
  if (!node || armed) return;
  armed = true;

  node.style.animation = 'none';
  node.style.backgroundColor = 'transparent';
  setSafety(SAFETY_MS + loaderHold() * 1000);
}

/** Buang layar muat tanpa animasi, dan lepaskan `inert` dari halaman. */
export function skipLoader() {
  clearTimeout(safetyTimer);
  safetyTimer = null;
  releasePage();
  document.getElementById('loader')?.remove();
}

/**
 * Lepaskan `inert` dari elemen di belakang layar.
 *
 * `inert` dipasang di `playLoader()` supaya pembaca layar tidak
 * membaca seluruh beranda di belakang layar muat. Yang memberitahu
 * halaman sudah terbuka adalah live region di `.loader__status` —
 * makanya fokus TIDAK dipindahkan ke sini: memindahkan fokus tanpa
 * diminta akan mengulang pengumuman yang barusan sudah dibacakan, dan
 * membiarkan fokus di `body` membuat pengguna keyboard mulai lagi dari
 * atas dengan cara yang wajar.
 */
function releasePage() {
  for (const sel of BEHIND) {
    /** @type {HTMLElement|null} */ (document.querySelector(sel))?.removeAttribute('inert');
  }
}

/**
 * Satu promise, paling lama `seconds` detik.
 *
 * Timeout-nya bukan failure: kalau `load` tidak pernah
 * datang dalam 2,8 detik, tahap itu tetap dihitung selesai dengan
 * timbangannya sendiri. Progress yang macet bukan informasi, dan
 * membiarkan layar menggantung juga bukan informasi.
 *
 * @param {Promise<unknown>|null|undefined} p
 * @param {number} seconds
 * @returns {Promise<void>}
 */
function within(p, seconds) {
  if (!p) return Promise.resolve();
  return Promise.race([
    Promise.resolve(p).then(() => undefined, () => undefined),
    new Promise((r) => setTimeout(r, seconds * 1000)),
  ]);
}

/* ─────────────────────────── TAHAP 1 · MUAT ─────────────────────────── */

/**
 * @returns {Promise<void>} resolve saat muat selesai
 */
export function playLoader() {
  armLoader();

  const node = document.getElementById('loader');
  if (!node || !gsap) {
    skipLoader();
    return Promise.resolve();
  }

  for (const sel of BEHIND) document.querySelector(sel)?.setAttribute('inert', '');

  const rule = node.querySelector(selectors.rule);
  const fill = node.querySelector(selectors.fill);
  const pct = node.querySelector(selectors.pct);
  const stepEl = node.querySelector(selectors.step);
  const totalEl = node.querySelector(selectors.total);
  const statusEl = node.querySelector(selectors.status);
  const armH = qsa(selectors.armH, node);
  const armV = qsa(selectors.armV, node);
  const chars = qsa(selectors.chars, node);
  const frameBits = qsa(selectors.frame, node);

  const still = reduceMotion();
  const min = loaderHold() || MIN_SECONDS;

  if (totalEl) totalEl.textContent = `/ ${String(STEPS.length).padStart(2, '0')}`;

  /** Bobot yang benar-benar sudah selesai. */
  let real = 0;
  /** Lantai waktu, 0 → 1 sepanjang `min`. */
  let floor = 0;
  /** Yang sedang digambar. Tidak pernah melebihi `real` maupun `floor`. */
  const paint = { v: 0 };

  /**
   * Kelipatan angka persen, dalam persen.
   *
   * 5, dan itu karena hitungannya, bukan selera. Bar mengisi 0 → 100%
   * dalam 2,2 detik, jadi satu persen datang setiap ~22ms — satu digit
   * per frame. Angka yang bergerak secepat itu tidak dibaca siapa pun;
   * yang tersisa cuma kedipan di tepi kanan.
   *
   * 5% memberi satu perubahan per ~0,11 detik: cukup jarang untuk dibaca,
   * cukup sering untuk terasa hidup. Dan karena selalu `floor`, angkanya
   * tidak pernah lebih besar dari bar — jadi tidak pernah bergerak lebih
   * cepat dari pekerjaannya, hanya tertinggal maksimal 4%.
   *
   * Bar-nya sendiri tetap bergerak mulus. Yang di-sample hanya angkanya:
   * bentuk bergerak cepat tidak mengganggu, teks bergerak cepat tidak
   * terbaca.
   */
  const PCT_STEP = 5;

  /** Tulis bar dan angka dari satu sumber yang sama. */
  const write = () => {
    if (pct) {
      const shown = Math.floor((paint.v * 100) / PCT_STEP) * PCT_STEP;
      pct.textContent = `${shown}%`;
    }
    // Ditulis langsung, bukan lewat `gsap.set`: ini jalan setiap frame,
    // dan `gsap.set` akan mengalokasikan tween baru setiap frame. Yang
    // berubah cuma `transform`, jadi jalur manual ini justru lebih
    // murah dan sama persis hasilnya.
    if (fill) fill.style.transform = `scaleX(${paint.v})`;
  };

  /* ── Readout ─────────────────────────────────────────────────
     Irama tetap, bukan secepat kejadiannya mendarat.

     Empat dari lima kejadian selesai dalam ~0,1 detik kalau semuanya
     sudah cached. Kalau labelnya mengikuti kecepatan itu, ia akan
     menembak 01 → 04 dalam sepersekian detik lalu DIAM di "04"
     selama hampir seluruh sisa waktu — persis yang terjadi sebelum
     ini, dan itu terbaca bukan sebagai "mesin bekerja", tapi sebagai
     "layarnya nyangkut".

     Jadi urutannya dibalik: angka bergerak dengan irama tetap
     (`pace`), dan sebuah label hanya BOLEH tampil kalau kejadiannya
     benar-benar sudah selesai. Di cache panas, angka berjalan setiap
     ~0,3 detik dari 01 sampai 05. Di koneksi lambat, angka menahan
     diri — karena ia tidak akan pernah menampilkan pekerjaan yang belum
     terjadi. */
  let settled = 0;
  let displayed = 0;
  let paceTimer = 0;

  const showStep = (key) => {
    const i = STEPS.findIndex((s) => s.key === key);
    // `ready` tidak ada di STEPS karena tidak punya bobot, dan
    // `findIndex` akan mengembalikan -1. Nomornya ditahan di tahap
    // terakhir: "05 / 05 · Siap", bukan "00 / 05 · Siap".
    const n = (i < 0 ? STEPS.length : i + 1);
    if (stepEl) stepEl.textContent = String(n).padStart(2, '0');
    if (statusEl) statusEl.textContent = t(`loader.${key}`);
  };

  /** Jeda satu langkah readout, dalam detik. */
  const pace = min / (STEPS.length + 1);

  const pump = () => {
    if (displayed < settled) {
      // `?.` bukan paranoia: `settled` menghitung kejadian, dan kalau
      // suatu langkah terpicu dua kali, angka ini bisa melewati panjang
      // STEPS. Tanpa penjaga, `pump` melempar TypeError di dalam
      // setTimeout — yang tidak tertangkap siapa pun.
      showStep(STEPS[displayed]?.key);
      displayed += 1;
    }
    paceTimer = setTimeout(pump, pace * 1000);
  };

  const stopPace = () => {
    clearTimeout(paceTimer);
    paceTimer = 0;
  };

  /* ── Kerangka halaman (secondary) ────────────────────────────────
     Setiap potongan layout punya `data-frame-step` yang menunjuk ke
     kejadian muat yang membukanya. Dia dipanggil dari `settle()`,
     bukan dari timer terpisah.

     Itu satu-satunya alasan kenapa ini jujur: bentuk yang muncul di
     layar adalah pekerjaan yang barusan selesai. Kalau punya durasi
     sendiri, kita akan mengarang halaman yang "sedang disusun" padahal
     tidak ada yang sedang disusun - dan seluruh kejujuran yang sudah
     dibangun di bar progres jadi bohong oleh animasi di atasnya.

     Dua perlakuan, satu per bentuk. Bentuk menentukan gerak, bukan
     sekadar pemanis yang sama untuk semua:

       BARIS  tumbuh dari pendek ke panjang. `scaleX` 0 → 1 dengan
              asal di kiri. Bukan `width`, karena `width` memicu
              layout tiap frame; `scaleX` cuma kompositor. Dan bukan
              fade, karena fade membuat bar "menyala" - yang mau kita
              tunjukkan justru teks yang sedang ditulis.

       DIAL   tumbuh dari satu titik menjadi lingkaran. `scale` 0,05
              → 1 dari pusat, jadi yang terlihat lebih dulu adalah
              titik yang mengembang jadi bulat. `0,05` dan bukan 0:
              mulai persis 0 akan membuang subpixel dan membulat
              garis 1px itu jadi nyaris tak terlihat di frame pertama.

     Dial sengaja lebih lambat dari bar (0,9 dtk vs 0,5 dtk). Bar
     beres cepat supaya tidak menahan; dial yang selesai belakangan,
     supaya mata sempat melihat dial itu sebagai jangkar dan bukan
     sekadar satu bentuk lagi di antara baris. */
  const FRAME_IN = {
    bar: {
      from: { autoAlpha: 0, scaleX: 0 },
      to: { autoAlpha: 1, scaleX: 1, duration: DURATION.base + 0.18, ease: EASE.reveal },
    },
    dial: {
      from: { autoAlpha: 0, scale: 0.05 },
      to: { autoAlpha: 1, scale: 1, duration: DURATION.slow + 0.3, ease: EASE.out },
    },
  };

  const frameTls = new Map();
  /** @type {Map<string, number>} */
  const frameSeen = new Map();
  for (const el of frameBits) {
    const key = el.dataset.frameStep;
    const kind = FRAME_IN[el.dataset.frameIn] ? el.dataset.frameIn : 'bar';
    if (!frameTls.has(key)) {
      frameTls.set(key, gsap.timeline({ paused: true }));
      frameSeen.set(key, 0);
    }
    const n = frameSeen.get(key);
    frameSeen.set(key, n + 1);
    frameTls.get(key).fromTo(
      el,
      FRAME_IN[kind].from,
      { ...FRAME_IN[kind].to, delay: n * STAGGER.line },
      0
    );
  }

  /** Buka kerangka yang terikat pada satu kejadian. Aman dipanggil berkali-kali. */
  const revealFrame = (key) => frameTls.get(key)?.play();

  if (still) {
    for (const el of frameBits) el.style.opacity = '1';
  }

  /** Kunci yang sudah dihitung. Satu langkah tidak boleh menambah dua kali. */
  const done = new Set();

  /** Catat satu kejadian selesai. */
  const settle = (key) => {
    const step = STEPS.find((s) => s.key === key);
    if (!step || done.has(key)) return;
    done.add(key);
    real = Math.min(1, real + step.weight);
    settled += 1;
    revealFrame(key);
  };

  /* ── Intro: mark dan wordmark ───────────────────────────────────
     Bagian loader yang tidak terikat aset, dan itu benar: yang sedang
     diset di layar memang teksnya sendiri, bukan berkasnya. */
  const intro = gsap.timeline({ paused: true });
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    settle('intro');
  };

  if (still) {
    intro.to({}, { duration: 0 });
    finishIntro();
  } else {
    if (armH.length) {
      intro.from(armH, {
        scaleX: 0,
        duration: 0.5,
        ease: EASE.out,
        stagger: 0.036,
      }, 0);
    }
    if (armV.length) {
      intro.from(armV, {
        scaleY: 0,
        duration: 0.5,
        ease: EASE.out,
        stagger: 0.036,
      }, 0.05);
    }
    if (chars.length) {
      // `from` sudah memakai `immediateRender`, jadi huruf langsung
      // tersembunyi di balik baris dari frame pertama: tidak ada
      // kedipan kata utuh sebelum mulai terangkat.
      //
      // Stagger 0,038 untuk sepuluh huruf = 0,34 detik kaskade. Angka
      // itu yang bikin gerakannya terbaca sebagai "huruf diset satu per
      // satu"; di bawah ~0,03 seluruh kata bergerak hampir bersamaan dan
      // gesturnya hilang, jadi yang tersisa cuma satu fade panjang.
      intro.from(chars, {
        yPercent: 112,
        duration: 0.58,
        ease: EASE.out,
        stagger: 0.038,
      }, 0.16);
    }
    intro.eventCallback('onComplete', finishIntro);
  }

  return new Promise((resolve) => {
    /* Kejadian 01 dan 02 sudah terjadi sebelum modul ini sempat jalan:
       kita sedang berjalan di dalam document yang sudah diurai, dan
       tanpa CSS tidak ada tinggi yang bisa diukur. Keduanya tetap
       dicatat supaya readout tidak melompat dari 02 ke 04. */
    settle('dom');
    settle('layout');
    intro.play(0);

    // Langkah pertama tampil seketika, lalu sisanya jalan irama `pace`.
    // `pump` sendiri TIDAK dipanggil di sini: kalau dipanggil, ia akan
    // langsung-naik ke langkah 02 dan 01 hanya tampil sepersekian
    // detik — jadi tidak pernah sempat terbaca.
    showStep(STEPS[0].key);
    displayed = 1;
    paceTimer = setTimeout(pump, pace * 1000);

    const stylesReady = new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const fontsReady = document.fonts?.ready;
    const pageReady =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((r) => window.addEventListener('load', r, { once: true }));

    const step = (key, p) => within(p, STEPS.find((s) => s.key === key).timeout).then(() => settle(key));

    // Berurutan, bukan paralel. Urutan readout harus mengikuti urutan
    // kerja, dan `settle` menambah bobot: dijalankan paralel, angkanya
    // melompat dan tidak sesuai dengan yang ditampilkan.
    step('layout', stylesReady)
      .then(() => step('fonts', fontsReady))
      .then(() => step('load', pageReady));

    /* Satu loop, bukan tween per kejadian.
       Bar dikejar dengan laju tetap (`CATCH_RATE`) menuju nilai yang
       lebih kecil dari `real` dan `floor`, jadi isinya tidak pernah
       melewati pekerjaan yang benar-benar selesai, dan tidak pernah
       bergerak lebih cepat dari lantai waktu.

       Kenapa bukan `gsap.to()` per kejadian: tween baru dibuat ulang
       setiap frame, dan tween yang dibuat ulang tiap frame tidak pernah
       sempat dirender — bar akan diam di 0% sementara tween-nya terus
       dibuat ulang. Satu loop yang menulis transform langsung lebih
       murah dan tidak punya jebakan itu.

       `finish()` adalah satu-satunya jalan keluar dari tahap ini
       selain pager: tidak ada promise yang bisa menggantung, karena
       yang memanggilnya adalah loop ini, bukan rantai promise. */
    const started = performance.now();
    let raf = 0;
    let lastT = 0;
    let ended = false;

    const finish = () => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      // Readout ikut berhenti: kalau dibiarkan, `pump` akan menimpa
      // "Siap" dengan label tahap begitu saja.
      stopPace();

      clearTimeout(safetyTimer);
      safetyTimer = null;

      if (pct) pct.textContent = '100%';
      rule?.classList.add('is-full');
      showStep('ready');
      // Sesaat cukup supaya "100%" sempat terbaca sebagai peristiwa,
      // bukan sekadar bar yang kebetulan mentok.
      gsap.delayedCall(FULL_SETTLE, resolve);
    };

    const tick = (now) => {
      const t = (now - started) / 1000;
      const dt = lastT ? Math.min(t - lastT, 0.08) : 0;
      lastT = t;

      floor = Math.min(1, t / min);

      // Lantai habis: apa pun yang masih jalan tidak ada lagi alasan
      // menahannya, dan satu aset yang telat tidak boleh membuat layar
      // terus menutupi halaman.
      if (floor >= 1) {
        real = 1;
        intro.progress(1);
        finishIntro();
      }

      const target = Math.min(real, floor);
      const gap = target - paint.v;
      if (Math.abs(gap) > 0.0004) {
        paint.v += Math.sign(gap) * Math.min(Math.abs(gap), CATCH_RATE * dt);
        write();
      }

      if (floor >= 1 && paint.v > 0.9995) {
        finish();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Pager tahap MUAT sudah dipasang `armLoader()`; pager tahap
    // KELUAR dipasang `exitLoader()`.
  });
}

/* ────────────────────── TAHAP 2 · KELUAR ────────────────────── */

/**
 * Peta detik transisi keluar.
 *
 * Satu sumber untuk `exitLoader()` dan untuk penundaan pembuka hero di
 * `main.js`. Kalau keduanya punya angka sendiri, keduanya akan
 * melenceng dan pembuka hero bisa mulai sebelum lembarnya menyingkir.
 */
export const ENTER_BEAT = {
  /** Isi lembar mulai menyingkir. */
  clear: 0,
  /** Lembar mulai turun. Ini juga detik pembuka hero. */
  reveal: 0.14,
  /** Durasi lembar turun. */
  revealDur: 0.58,
  /**
   * Garis aksen mulai menyusut. Sengaja sesudah lembar sempat lewat,
   * supaya garisnya terlihat tertinggal di atas halaman yang sudah
   * terbuka, bukan ikut hilang bersama kertasnya.
   */
  seam: 0.28,
  /** Durasi penyusutan garis. */
  seamDur: 0.3,
};

/**
 * Angkat layar muat dan buka halaman.
 *
 * Tiga babak, tanpa overshoot, sesuai archetype Premium yang dipakai
 * seluruh situs ini:
 *
 *   1. BERSIH (0 → 0,22)    Readout, wordmark, angka persen, dan
 *                           registration mark memudar. Tersisa garis
 *                           baseline beserta isian aksennya.
 *   2. TURUN  (0,14 → 0,72) Lembar turun setinggi dirinya sendiri dan
 *                           keluar tanpa sisa. Yang tersingkap pertama
 *                           adalah bagian atas halaman, jadi navbar
 *                           muncul duluan.
 *   3. JATUH  (0,28 → 0,58) Isian aksen menyusut ke tengah dan
 *                           memudar, meninggalkan baris 2px di atas
 *                           halaman yang sudah terbuka.
 *
 * Arah turun dipilih supaya halaman tersingkap dari atas ke bawah, sama
 * seperti urutan kaskade pembuka hero di `hero.js`. Kalau lembar
 * terangkat, bagian bawah halaman yang terlihat lebih dulu, navbar
 * selesai beranimasi di belakang kertas, dan yang ditonton orang hanya
 * halaman yang sudah diam.
 *
 * Reduce motion mengurangi ukuran dan durasi gerak, bukan
 * keberadaannya: layar tetap hilang dengan sebuah fade pendek. Layar
 * yang lenyap tanpa gerakan apa pun terbaca sebagai kegagalan memuat.
 *
 * @returns {Promise<void>} resolve saat layar benar-benar hilang
 */
export function exitLoader() {
  const node = document.getElementById('loader');
  if (!node) {
    releasePage();
    return Promise.resolve();
  }

  releasePage();

  if (!gsap) {
    node.remove();
    return Promise.resolve();
  }

  setSafety(SAFETY_EXIT_MS);

  const sheet = node.querySelector(selectors.sheet);
  const foot = node.querySelector(selectors.foot);
  const fill = node.querySelector(selectors.fill);
  const seam = node.querySelector(selectors.seam);
  const arms = qsa(selectors.marks, node);
  const frameOut = qsa(selectors.frame, node);
  const guides = node.querySelector(selectors.guides);
  const scan = node.querySelector(selectors.scan);

  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(safetyTimer);
      safetyTimer = null;
      node.remove();
      resolve();
    };

    if (reduceMotion()) {
      gsap.to(node, { autoAlpha: 0, duration: 0.18, ease: EASE.soft, onComplete: done });
      return;
    }

    const tl = gsap.timeline({ onComplete: done });

    /* ── Babak 1 · BERSIH ─────────────────────────────────────
       Keluar dengan `power2.in`: mulai pelan, hilang cepat, jadi
       perhatian paling banyak ada di frame pertama saat elemennya
       masih terbaca.

       Kerangka dan garis pandu ikut dibersihkan di babak yang sama,
       bukan ikut turun bersama lembar. Alasannya keduanya adalah
       lapisan "keadaan muat" - kalau ikut turun, mata membacanya
       sebagai bagian dari kertas yang sedang dicetak, dan kita
       kembali ke layar yang hampa. Yang turun cuma yang benar-benar
       tercetak: mark, wordmark, dan bar. */
    if (foot) tl.to(foot, { autoAlpha: 0, y: -10, duration: 0.22, ease: EASE.exit }, ENTER_BEAT.clear);
    if (arms.length) tl.to(arms, { autoAlpha: 0, duration: 0.2, ease: EASE.exit }, ENTER_BEAT.clear);
    if (frameOut.length) {
      tl.to(frameOut, { autoAlpha: 0, duration: 0.24, ease: EASE.exit }, ENTER_BEAT.clear);
    }
    if (guides) tl.to(guides, { autoAlpha: 0, duration: 0.2, ease: EASE.exit }, ENTER_BEAT.clear);
    // `scan` ikut hilang sedikit lebih cepat: dia gerak looping, dan
    // loop yang masih jalan di atas kertas yang sedang turun akan
    // terlihat seperti tambalan yang belum dilepas.
    if (scan) tl.to(scan, { autoAlpha: 0, duration: 0.16, ease: EASE.exit }, ENTER_BEAT.clear);

    /* ── Babak 2 · TURUN ──────────────────────────────────────
       `yPercent: 100` memakai tinggi lembar sendiri, jadi ia meluncur
       tepat setinggi dirinya sendiri dan keluar tanpa sisa tepi. */
    if (sheet) {
      tl.to(sheet, { yPercent: 100, duration: ENTER_BEAT.revealDur, ease: 'expo.inOut' }, ENTER_BEAT.reveal);
    }

    /* ── Babak 3 · JATUH ──────────────────────────────────────
       Isian aksen dilepas dari track-nya dulu: dari anak
       `loader__fill` — yang ikut lembar turun — menjadi elemen
       `fixed` yang berdiri sendiri di posisi track yang sama.

       Kotaknya diukur dan dipindahkan di detik yang sama, jadi tidak
       ada layout shift di antara pengukuran dan penempatan. */
    if (fill && seam) {
      const r = fill.getBoundingClientRect();
      gsap.set(seam, { top: r.top, left: r.left, width: r.width, autoAlpha: 1 });
      tl.to(seam, {
        scaleX: 0,
        autoAlpha: 0,
        duration: ENTER_BEAT.seamDur,
        ease: 'power2.inOut',
      }, ENTER_BEAT.seam);
    }
  });
}
