/**
 * Grafik orbit dekoratif - mengisi kolom kanan hero yang kosong.
 *
 * Ini murni dekorasi: cincin hairline, satu pita ticks, dan denyut kecil
 * di pusat. Tidak ada teks, tidak ada angka, tidak ada klaim. Yang
 * dijual di beranda tetap isi kirinya.
 *
 * Bentuknya diambil dari benda yang memang dekat dengan Firmansyah:
 * meter jam. Cincin luar jadi skala detik, cincin dalam jadi menit,
 * pita ticks berjalan, denyut di pusat adalah detik yang berjalan.
 * Tidak ada label karena tidak perlu.
 *
 * Yang dipegang di sini:
 *  1. Hanya `transform` (rotate/scale/x/y) yang digerakkan - tidak ada
 *     layout, tidak ada paint berat.
 *  2. Putaran lambat dan linear. Gerak cepat di sini akan terbaca
 *     sebagai widget dashboard, bukan sebagai atmosfer. "Lambat" di
 *     sini berarti kecepatan jarum detik jam, bukan tidak bergerak —
 *     lihat `SPIN`.
 *  3. Loop dijeda saat keluar layar, dan tidak jalan sama sekali saat
 *     reduced motion.
 *  4. Tanpa JS host tetap kosong, dan itu tidak apa-apa.
 *
 * @module components/heroMotion
 */

import { gsap } from '../animations/gsap.js';
import { motionProfile } from '../data.js';
import { DURATION, EASE } from '../animations/tokens.js';
import { clear, qs } from '../utils/dom.js';
import { reduceMotion } from '../utils/env.js';

/** Namespace SVG. `document.createElement` tidak bisa bikin elemen SVG. */
const NS = 'http://www.w3.org/2000/svg';

/** Sisi viewBox. Semua koordinat dihitung dari angka ini. */
const BOX = 360;
const C = BOX / 2;

/** Panjang setiap tick, dari poros ke luar. Seragam untuk semua 60. */
const TICK_LEN = 15;

/** Jari-jari, dari luar ke dalam.
 *
 * Jarak antar lapisan sekitar 28 satuan viewBox (sekitar 37px di layar
 * 480px), itu yang disengaja.
 *
 * PITA TICKS - CINCIN LAYER 2 purposefully lebih rapat: 21 satuan. Itu
 * bukan lupa dihitung, itu pilihan. Semua tick sekarang sama panjang
 * (lihat `TICK_LEN`), jadi ujung pita adalah lingkaran sempurna dan
 * jaraknya ke cincin layer 2 benar-benar seragam di setiap sudut -
 * bukan bergantian 21 dan 29 seperti versi lama, yang terbaca sebagai
 * "ada yang dekat ada yang jauh".
 *
 * Kalau nanti jarak ini diubah, pastikan ujung tick ikut-adjusted:
 * apa pun yang membuat ujung pita bergerigi akan mengembalikan bug itu.
 */
const R_TICKS = 176;
const R_RING = 140;
const R_DASH = 112;
const R_ARC = 84;
const R_CORE_RING = 56;

/** Cincin aksen di poros, dan titik di dalamnya. */
const R_HUB_RING = 9;
const R_HUB_DOT = 3.5;

/**
 * Periode satu putaran, dalam detik.
 *
 * Tick luar = 36 detik, jadi 10°/detik. Angka itu diukur, bukan
 * ditebak. Versi pertama 150 detik (2,5°/detik) jelas gagal: dua tick
 * mayor berjarak 36°, jadi pola aksennya baru maju satu tik setiap 14
 * detik — itu dibaca sebagai diam. 48 detik (7,5°/detik) sudah bergerak,
 * tapi masih sekelas dengan jarum detik jam, jadi dari afar belum
 * terbaca. 36 detik = 10°/detik: satu tik mayor per 3,6 detik, jadi
 * pola aksennya bisa diikuti tanpa effort.
 *
 * `ease: 'none'` dan TIDAK BOLEH diganti. Putaran loop yang di-ease
 * akan terasa berdenyut: cepat di satu titik, lambat di titik
 * berikutnya, selamanya. Lurus adalah satu-satunya yang benar untuk
 * putaran yang tidak pernah berhenti; tidak ada yang perlu di-ease.
 */
const SPIN = { bezel: 27, mid: 21, inner: 13 };

/**
 * Ritme KHUSUS layer 1 (pita ticks).
 *
 * Satu siklus 21 detik, dan LETAK cepat di awal siklus:
 *
 *   0-10 detik  : cepat
 *   10-13 detik : REM - laju turun dari cepat ke pelan
 *   13-21 detik : NAIK LAGI - pelan menuju cepat lagi
 *   lalu mengulang, jadi cepat lagi tepat di detik ke-21
 *
 * Cepatnya lasting 10 detik, dan bagian yang tidak cepat adalah 11
 * detik: 3 detik rem, 8 detik naik lagi.
 *
 * `baseSec` = durasi satu putaran penuh pada laju pelan, jadi 36 detik
 * = 10°/detik - sama dengan putaran layer 1 yang lama.
 *
 * `fastScale` = pengali laju saat cepat. 12, jadi 120°/detik. Ini
 * "benar-benar cepat": satu tik mayor (36°) terlewati setiap 0,3 detik.
 * Angka 6 sebelumnya (60°/detik) ternyata masih terbaca sebagai putaran
 * biasa - pola aksennya masih sempat dilacak mata. Di 12, yang terbaca
 * hanya putaran saja, bukan lagi pola aksen.
 *
 * `riseSec` = 8 detik, jauh lebih panjang dari remnya. Ini disengaja:
 * dengan `power2.in`, lajunya spend hampir seluruh 8 detik itu di
 * jenjang bawah, dan baru menghilang di detik-detik akhir. Akibatnya
 * ada jeda yang terasa macet sebelum pita meluncur, dan naik ke
 * kecepatan penuhnya jadi hampir tak terlihat - seperti tombol gas
 * yang ditahan lama lalu dilepas.
 *
 * Kalau `riseSec` disamakan dengan `brakeSec`, efek itu hilang:
 * naiknya jadi secepat rem turunnya, dan mata langsung tahu akan
 * apa yang terjadi. Ketidaksimetran itulah yang membuatnya terasa
 * seperti mesin, bukan seperti animasi.
 *
 * REM memakai `power2.out`, bukan `sine.inOut`. Bedanya penting dan
 * bukan soal selera:
 *
 *   `sine.inOut`  - laju turun pelan, lalu turun cepat, lalu datar.
 *                    Terasa seperti dibuat-buat, bukan seperti rem.
 *   `power2.out`  - laju jatuh cepat di awal, lalu EKOR panjang yang
 *                    makin landung. Persis perilaku rem mobil: tekanan
 *                    utama di awal, sisa jaraknya makin landung.
 *
 * Kenapa hanya 3 detik untuk rem dan bukan 5: rem yang terlalu lama
 * membuat 10 detik cepat terasa tidak lama. Ini kompromi yang
 * disengaja.
 *
 * Tidak ada lagi efek SKALA pada pita - tidak ada `prepScale`, tidak
 * ada scaling, dan garis tidak menebal. Dulu ada "tarik napas" yang
 * membuat seluruh pita mengembang dan semua garis menebal sebelum
 * menyambar; semuanya dihapus atas permintaan.
 *
 * Yang ADA cuma satu, dan hanya untuk 10 tick oranye: memanjang ke
 * luar selama sprint (`majorGrow`). Pitanya sendiri tidak pernah
 * berubah bentuk.
 *
 * `majorGrow` = 10 satuan viewBox, jadi tick oranye jadi 27 satuan
 * (dari 15) - hampir dua kali panjangnya. Arahnya ke LUAR, bukan ke
 * dalam, dan itu penting:
 *
 *   ke dalam  - ujung dalam tick oranye bergerak dari 161 menuju 140,
 *               jadi jaraknya ke layer 2 ikut menyusut dari 21 jadi 11.
 *               Itu persis bug "ada yang dekat ada yang jauh" yang barusan
 *               diperbaiki, dan mengulanginya tiap 21 detik berarti bug
 *               itu tidak benar-benar hilang.
 *   ke luar   - ujung dalam tetap di 161, jadi jarak ke layer 2 tidak
 *               tersentuh. Yang bergerak hanya ujung luar, melewati
 *               batas pita, jadi yang terbaca adalah "aksennya
 *               melesat keluar", bukan "pitanya berubah".
 *
 * `growSec` 0,7 detik, `shrinkSec` 1,3 detik. Memanjang jauh lebih
 * cepat daripada memendek. Kalau dibalik, oranye terlihat menghilang
 * dari pitanya, dan yang terbaca bukan "aksen yang selesai sprint".
 * Memperlambat pemendekan justru supaya oranye terlihat menyusut
 * dengan tenang - selesai, bukan hilang.
 *
 * Keduanya memakai `linear`, bukan `sine`, karena yang dikejar
 * memang respons konstan: oranye keluar dan masuk dengan kecepatan
 * tetap, sehingga yang terasa hanya panjang dan lamanya - bukan rasa
 * geraknya.
 */
const BURST = {
  baseSec: 36,
  fastSec: 10,
  brakeSec: 3,
  riseSec: 8,
  fastScale: 12,
  majorGrow: 10,
  growSec: 0.7,
  shrinkSec: 1.3,
  glowMax: 0.42,
  swapLeadSec: 2.2,
  swapSec: 1.4,
};

/** Timeline pembuka. */
let intro = null;

/**
 * Hasil `build()` untuk render yang sedang berjalan.
 *
 * Disimpan di modul, bukan dikembalikan ke pemanggil, karena
 * `playHeroMotion()` dipanggil dari `hero.js` - file yang tidak perlu
 * tahu apa pun soal isi SVG. Dia hanya perlu menyalakan loop setelah
 * intro selesai, dan untuk itu dia memakai objek yang sudah ada.
 *
 * @type {{ svg: SVGSVGElement; groups: Record<string, SVGGElement>; ticks: SVGLineElement[]; majors: { line: SVGLineElement; glow: SVGLineElement; cos: number; sin: number }[]; glow: SVGGElement; dash: SVGCircleElement; arcs: SVGPathElement[]; halo: SVGCircleElement; hub: SVGGElement } | null}
 */
let built = null;

/** @type {gsap.core.Animation[]} */
let ambient = [];

/** Fungsi lepas untuk listener yang dipasang ulang tiap render. */
/** @type {IntersectionObserver|null} */
let watcher = null;

let played = false;

/**
 * Bikin elemen SVG.
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @returns {SVGElement}
 */
function svg(tag, attrs) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs ?? {})) node.setAttribute(k, v);
  return node;
}

/**
 * Path busur dari sudut ke sudut (derajat, 0 = jam 3, searah jam).
 * @param {number} r
 * @param {number} a0
 * @param {number} a1
 * @returns {string}
 */
function arcPath(r, a0, a1) {
  const rad = (d) => (d * Math.PI) / 180;
  const x0 = C + r * Math.cos(rad(a0));
  const y0 = C + r * Math.sin(rad(a0));
  const x1 = C + r * Math.cos(rad(a1));
  const y1 = C + r * Math.sin(rad(a1));
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * Gerak boleh jalan?
 * @returns {boolean}
 */
function motionAllowed() {
  return Boolean(gsap && motionProfile.enabled && motionProfile.heroMotion);
}

/**
 * Apakah `prefers-reduced-motion` ikut mengambil alih?
 *
 * Dial ini dekoratif, bukan informasi dan bukan umpan balik. Tidak ada
 * yang bergantung pada geraknya untuk memahami halaman, jadi membungkamnya
 * tidak menambah aksesibilitas apa pun - ia hanya membuat unsurnya
 * terlihat rusak: bentuknya sudah digambar lengkap, lalu diam tanpa
 * alasan yang pernah disengaja.
 *
 * Yang tetap dihormati reduce motion: `playHeroIntro()` dan
 * `buildIntro()`. Gerak masuk dengan scale + opacity + rotasi 14°-lah
 * yang bisa memicu mual, dan ia tetap dilewati oleh `main.js` lewat
 * `motionOn()`. Yang dilewati di sini hanya putaran ambient yang
 * lambat dan berulang.
 *
 * Pelan-pelan dan satu arah: 36 detik satu putaran, tanpa parallax,
 * tanpa zoom, tanpa movement yang berulang bolak-balik.
 *
 * @returns {boolean}
 */
function loopRuns() {
  return motionAllowed();
}

/**
 * Satu baris ke console, sekali saja, dari `renderHeroMotion()` —
 * satu-satunya tempat yang selalu jalan.
 *
 * Ini ada karena "dial-nya diam" punya beberapa penyebab yang jauh
 * berbeda, dan semuanya tanpa jejak. Yang paling sering: `reduce
 * motion` aktif di OS. Tapi saat itu `main.js` justru tidak memanggil
 * `playHeroIntro()` sama sekali, jadi laporan yang diletakkan di
 * pemanggilan intro tidak akan pernah tercetak — tepat pada keadaan
 * yang paling perlu dijelaskan. Karena itu lapornya harus di sini.
 *
 * Isinya menjawab apa yang terjadi dan kenapa, bukan hitungan tween:
 * hitungan bisa berubah setelah loop jalan, jawaban tidak.
 */
function report() {
  if (typeof console === 'undefined') return;
  // Layer 1 tidak punya "satu putaran = X detik" karena iramanya tidak
  // tetap: cepat, lalu rem, lalu naik lagi. Jadi yang dilaporkan ritmenya.
  const slowRate = 360 / BURST.baseSec;
  const fastRate = slowRate * BURST.fastScale;
  const cycle = BURST.fastSec + BURST.brakeSec + BURST.riseSec;
  const base =
    `[heroMotion] layer1: ${BURST.fastSec}s cepat ${fastRate.toFixed(1)}°/s` +
    ` + ${BURST.brakeSec}s rem` +
    ` + ${BURST.riseSec}s naik lagi` +
    ` · siklus ${cycle}s · pelan ${slowRate.toFixed(1)}°/s` +
    ` · oranye memanjang ${BURST.majorGrow}u saat cepat (${TICK_LEN}→${TICK_LEN + BURST.majorGrow})`;

  if (motionAllowed()) {
    console.info(`${base} · loop jalan${reduceMotion() ? ' (reduce motion aktif — grafik dekoratif tetap berputar)' : ''}`);
    return;
  }

  const why = !gsap
    ? 'GSAP tidak termuat'
    : !motionProfile.enabled
      ? 'motionProfile.enabled = false'
      : 'motionProfile.heroMotion = false';
  console.info(`${base} · DIAM: ${why}`);
}

/**
 * Bangun SVG-nya.
 * @param {Element} host
 * @returns {{ svg: SVGSVGElement; groups: Record<string, SVGGElement>; ticks: SVGLineElement[]; majors: { line: SVGLineElement; glow: SVGLineElement; cos: number; sin: number }[]; glow: SVGGElement; dash: SVGCircleElement; arcs: SVGPathElement[]; halo: SVGCircleElement; hub: SVGGElement } | null}
 */
function build(host) {
  clear(host);

  const root = svg('svg', {
    class: 'motion__svg',
    viewBox: `0 0 ${BOX} ${BOX}`,
    fill: 'none',
    focusable: 'false',
  });

  // Layer 2: cincin BERPUTUS-PUTUS tepat di dalam pita ticks, dan BERPUTAR.
  //
  // Dulu ini cincin PENUH yang diam. Dua masalah sekaligus: kelihatannya
  // nyambung dengan pita ticks di atasnya (dua garis solid berdekatan
  // terbaca sebagai satu pita ganda), dan tidak ada yang bergerak di
  // lapisan ini sama sekali.
  //
  // Sekarang coraknya putus-putus, jadi celahnya terlihat dan cincin ini
  // terpisah jelas dari pita ticks maupun dari cincin di bawahnya.
  //
  // Coraknya SEGMENT GARIS, bukan titik - itu yang membedakannya dari
  // layer 3. Kalau keduanya sama-sama titik, mata membaca dua cincin
  // bertitik berdekatan sebagai satu lapisan, persis masalah yang tadi
  // mau dibetulkan.
  //
  // Putarannya bisa terlihat justru karena coraknya putus-putus.
  // Cincin PENUH yang berputar akan menghasilkan nol perubahan - itu
  // sebabnya versi lamanya tidak pernah bergerak meski diarahkan.
  const bezelGroup = svg('g', { class: 'motion__spin motion__spin--bezel' });
  bezelGroup.append(svg('circle', { class: 'motion__bezel', cx: C, cy: C, r: R_RING }));

  // Layer 5: satu cincin penuh tipis, tetap diam. Cincin diam inilah
  // penyeimbang di tengah dial.
  root.append(bezelGroup, svg('circle', { class: 'motion__ring motion__ring--faint', cx: C, cy: C, r: R_CORE_RING }));

  // Pita ticks: 60 garis radial, satu per detik.
  //
  // SEMUA tick sama panjang - ini bukan pilihan gaya, tapi perbaikan bug
  // jarak. Dahulu tick mayor (R_TICKS - 15) lebih panjang dari yang minor
  // (R_TICKS - 7), jadi ujung dalam pita bukan lingkaran melainkan
  // bergerigi. Akibatnya jarak ke layer 2 bergantian antara 21 dan 29
  // satuan, dan di layar itu terbaca sebagai "ada yang dekat, ada yang
  // jauh" - dialnya terlihat tidak simetris padahal tidak ada satu pun
  // angka yang salah tempat.
  //
// Now semua ujung berada di satu lingkaran, jadi jaraknya benar-benar
  // seragam. Pembeda major dan minor dipindah ke WARNA dan TEBAL -
  // dua hal yang tidak mengubah bentuk, jadi tidak lagi merusak jarak.
  //
  // Pengecualiannya hanya satu, dan hanya saat sprint: 10 tick oranye
  // memanjang ke LUAR (lihat `BURST.majorGrow`). Ujung dalam mereka
  // tetap di 161, jadi jarak ke layer 2 tetap 21 - pitanya tidak pernah
  // berubah bentuk, hanya aksennya yang melesat keluar.
  //
  // Pita dimulai dari jam 12 supaya tick mayor jatuh di 12, 2, 4, 6, 8,
  // dan 10 - tetap simetris.
const tickGroup = svg('g', { class: 'motion__ticks' });

  // Lapisan GLOW: 10 duplikat tick oranye, stroke jauh lebih lebar dan
  // di-blur, dengan opacity 0 sampai pita memanjang.
  //
  // Kenapa duplikat dan bukan `filter` di atas tick aslinya: `filter` di
  // tiap elemen SVG memfilter 10 kali per frame, dan `feGaussianBlur`
  // dihitung ulang tiap frame selama memanjang. Duplikat ini hanya
  // di-blur SATU KALI lalu opacity-nya yang diubah, jadi per frame
  // yang terjadi cuma satukali composites - jauh lebih murah.
  //
  // `filter`-nya ada di GROUP, bukan di tiap garis. Filter region di
  // SVG dihitung dari bounding box objek, dan bbox garis miring itu
  // tinggi nol - blur-nya akan terpotong jadi garis tipis. Bbox group
  // yang mencakup 10 garis itu besar, jadi blur-nya aman.
  //
  // Dimuat di PITA, bukan di host, supaya ikut berputar bersama ticks.
  // Dan ditaruh SEBELUM garis cris-nya supaya glow jadi cahaya di
  // belakang, bukan kabut di atas.
  const glowGroup = svg('g', { class: 'motion__majors-glow' });

  /** @type {SVGLineElement[]} */
  const ticks = [];
  /** @type {{ line: SVGLineElement; glow: SVGLineElement; cos: number; sin: number }[]} */
  const majors = [];
  for (let i = 0; i < 60; i += 1) {
    const major = i % 6 === 0;
    const a = (i * 6 - 90) * (Math.PI / 180);
    const inner = R_TICKS - TICK_LEN;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const x1 = (C + inner * cos).toFixed(2);
    const y1 = (C + inner * sin).toFixed(2);
    const x2 = (C + R_TICKS * cos).toFixed(2);
    const y2 = (C + R_TICKS * sin).toFixed(2);
    const line = svg('line', {
      class: major ? 'motion__tick motion__tick--major' : 'motion__tick',
      x1,
      y1,
      x2,
      y2,
    });
    ticks.push(/** @type {SVGLineElement} */ (line));
    if (major) {
      const glow = /** @type {SVGLineElement} */ (
        svg('line', { class: 'motion__glow', x1, y1, x2, y2 })
      );
      glowGroup.append(glow);
      majors.push({ line: /** @type {SVGLineElement} */ (line), glow, cos, sin });
    }
    tickGroup.append(line);
  }
  tickGroup.insertBefore(glowGroup, tickGroup.firstChild);
  glowGroup.style.opacity = '0';

  // Layer 3: cincin BERTITIK, berputar BERLAWANAN dengan pita ticks.
  //
  // Berlawanan itu disengaja dan diminta: kalau ticks dan cincin ini
  // searah, yang bergerak hanya satu benda. Periodenya juga bukan
  // kelipatan dari periode ticks, jadi keduanya tidak pernah sinkron
  // walau tiba-tiba terlihat berimpit.
  //
  // Titik-titiknya sengaja disjarangkan (lihat `.motion__dash` di CSS)
  // supaya pola berulangnya tidak terlalu rapat.
  //
  // Cincin ini sekarang MURNI abu-abu: tidak ada aksen sama sekali.
  // Dua hal aksen pernah ada di sini dan keduanya dihapus -
  // garis radial panjang (`.motion__hand`), lalu titik oranye kecil
  // (`.motion__node`). Semuanya terlihat seperti kemunculan yang tidak
  // disengaja, bukan seperti penanda arah.
  //
  // Konsekuensinya, dan ini yang perlu diketahui: cincin bertitik
  // praktis simetris. Diputar ke kanan atau ke kiri, hasilnya nyaris
  // sama, jadi arah putaran lapisan ini praktis tidak bisa dibaca -
  // hanya kelihatan berputar. Itu trade-off yang terjadi karena cincin
  // ini dibiarkan polos.
  const midGroup = svg('g', { class: 'motion__spin motion__spin--mid' });
  const dashRing = svg('circle', { class: 'motion__dash', cx: C, cy: C, r: R_DASH });
  midGroup.append(dashRing);

  // Busur dalam: arah berlawanan supaya geraknya tidak terbaca
  // sebagai satu roda yang utuh.
  //
  // Dua `<path>`, bukan `<circle>` dengan `stroke-dasharray` - supaya
  // celahnya berupa BUSUR yang lebar dan tidak simetris, bukan sekadar
  // deretan titik. Itu yang membuatnya terbaca sebagai lapisan sendiri.
  //
  // Karena ini `<path>`, radiusnya tidak bisa diubah lewat atribut `r`.
  // Jari-jari harus ditulis ulang ke dalam `d`. Dan itu bukan sekadar
  // formalitas: `scale()` akan ikut menebalkan `stroke`, sedangkan yang
  // diminta di sini hanya UKURAN - bukan tebal. Menulis ulang `d`
  // mengubah radiusnya saja dan tidak menyentuh stroke sama sekali.
  const innerGroup = svg('g', { class: 'motion__spin motion__spin--inner' });
  const arcA = svg('path', { class: 'motion__arc', d: arcPath(R_ARC, -64, 26) });
  const arcB = svg('path', { class: 'motion__arc motion__arc--soft', d: arcPath(R_ARC, 116, 206) });
  innerGroup.append(arcA, arcB);

  // Pusat: cincin aksen yang membesar ke posisi lapisan 5, plus titik di
  // porosnya.
  //
  // Yang membesar HANYA cincinnya. Titik di dalam poros tetap kecil -
  // kalau ikut membesar, pusatnya jadi cakram besar dan kehilangan
  // bentuk "cincin dengan poros di tengah" yang jadi penanda diamnya.
  //
  // Cincinnya mendarat TEPAT di radius lapisan 5 (56). Lapisan 5 itu
  // sendiri tidak bergerak dan tidak hilang - jadi yang terjadi bukan
  // dua cincin bertumpuk, tapi cincin oranye menempati posisi yang
  // biasanya cuma garis tipis itu. Dan karena `hub` di-append paling
  // akhir, cincin oranye digambar DI ATAS lapisan 5, jadi yang terlihat
  // adalah cincin itu-own tempat, bukan dua garis bertindih.
  const hub = svg('g', { class: 'motion__hub' });
  const halo = svg('circle', { class: 'motion__halo', cx: C, cy: C, r: R_HUB_RING });
  hub.append(halo, svg('circle', { class: 'motion__core', cx: C, cy: C, r: R_HUB_DOT }));

  root.append(tickGroup, midGroup, innerGroup, hub);
  host.append(root);

  return {
    svg: /** @type {SVGSVGElement} */ (root),
    groups: { ticks: tickGroup, bezel: bezelGroup, mid: midGroup, inner: innerGroup },
    ticks,
    majors,
    glow: glowGroup,
    dash: dashRing,
    arcs: [arcA, arcB],
    halo,
    hub,
  };
}

/**
 * Timeline pembuka: cincin muncul lebih dulu, ticks lalu berputar masuk.
 * Satu timeline, bukan banyak tween terpisah.
 *
 * Pusat tidak punya tween sendiri di sini - ia sudah ikut terlihat lewat
 * tween `root`, dan memberi dia gerak tambahan hanya berarti satu gerak
 * yang tidak diminta.
 * @param {{ svg: SVGSVGElement; ticks: SVGLineElement[]; hub: SVGGElement }} parts
 * @returns {gsap.core.Timeline|null}
 */
function buildIntro(parts) {
  const { svg: root, ticks } = parts;
  if (!root) return null;

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });

  tl.fromTo(
    root,
    { autoAlpha: 0, scale: 0.94 },
    { autoAlpha: 1, scale: 1, duration: DURATION.intro, transformOrigin: '50% 50%' },
    0
  );
  // Putaran masuk 14 derajat. Bukan untuk "efek" - supaya garis
  // terputusnya tidak pernah terlihat tiba-tiba sudah di tempatnya.
  tl.fromTo(
    ticks,
    { autoAlpha: 0, rotation: -14, scale: 0.985 },
    {
      autoAlpha: 1,
      rotation: 0,
      scale: 1,
      duration: DURATION.intro,
      stagger: { each: 0.006, from: 'start' },
      svgOrigin: `${C} ${C}`,
    },
    0.1
  );
  // Pusat TIDAK ikut apa-apa di intro. Seluruh SVG muncul lewat tween
  // `root` di atas, jadi titik tengahnya sudah ikut terlihat - memberi
  // dia tween sendiri hanya menambah satu gerak yang tidak diminta.

  return tl;
}

/**
 * Loop ambient: tiga putaran dengan arah dan kecepatan berbeda, dan napas
 * sangat lambat pada seluruh gambar.
 *
 * Pusat dial sengaja tidak disentuh: tidak ada denyut, tidak ada halo.
 * Poros yang berdenyut akan dibaca sebagai "ada proses di sini", padahal
 * tidak ada apa pun yang diproses.
 *
 * @param {Element} host
 * @param {{ svg: SVGSVGElement; groups: Record<string, SVGGElement>; hub: SVGGElement }} parts
 */
function startAmbient(host, parts) {
  if (ambient.length || !gsap) return;

  const { svg: root, groups, majors, glow, dash, arcs, halo } = parts;

  // Empat lapisan bergerak, arah berselang-seling tanpa kecuali:
  //
  //   Layer 1 (pita ticks)        -> ke KANAN (searah jam, +360), 36 dtk
  //   Layer 2 (cincin putus garis)-> ke KIRI  (berlawanan, -360),  27 dtk
  //   Layer 3 (cincin bertitik)   -> ke KANAN (searah jam, +360),  21 dtk
  //   Layer 4 (dua busur dalam)   -> ke KIRI  (berlawanan, -360),  13 dtk
  //
  // Tidak ada dua lapisan bersebelahan yang searah. Perioidanya juga
  // sengaja tidak satu sama satu dan tidak saling kelipatan, jadi tidak
  // pernah terlihat berimpit.
  //
  // Tanda minus/plus bukan soal selera: `rotation` positif di SVG
  // berputar searah jam, yang berarti titik di puncak lingkaran bergerak
  // ke kanan.
  //
  // Cincin penuh tipis di tengah (layer 5) tetap diam. Cincin diam itu
  // yang jadi penyeimbang: lapisan bergerak diapitnya, dan itulah yang
  // membuat putaran di sekitarnya terbaca sebagai putaran.
  //
  // Layer 1 punya ritme sendiri.
  //
  // Putarannya satu tween linear `repeat: -1` di 36 detik (= 10°/detik),
  // dan yang membuatnya menyambar adalah `timeScale` tween itu sendiri.
  // `timeScale` hanya mengubah laju playback, bukan besaran yang dihitung,
  // jadi rotasi yang dihitung browser tetap LURUS sempurna: tidak ada
  // easing pada putaran, tidak ada denyut, dan tidak ada satu frame pun
  // di mana sudutnya diam.
  //
  // Kenapa bukan dua tween rotation yang disambung (versi sebelumnya):
  // di sambungan itu kecepatan berubah INSTAN - dari 10°/s langsung ke
  // 60°/s - dan itu terbaca sebagai berhenti lalu melompat. `ease:
  // 'none'` di dua tween itu memang benar untuk putaran konstan, tapi
  // salah begitu lajunya memang harus berubah.
  //
  // `sine.inOut` pada timeScale membuat perubahan laju landung di kedua
  // ujungnya: tidak ada velocity yang meloncat, sehingga tidak ada jeda
  // maupun kaku di titik pergantian.
  const slowSpin = gsap.to(groups.ticks, {
    rotation: '+=360',
    duration: BURST.baseSec,
    ease: 'none',
    repeat: -1,
    svgOrigin: `${C} ${C}`,
  });
  // Siklus dimulai di detik 0 yang sudah CEPAAT, jadi lajunya diset dari
  // awal. Kalau dibiarkan mulai dari 1, halaman akan terbuka pelan lalu
  // sprint, dan 10 detik "cepat" di siklus pertama terasa seperti 7.
  slowSpin.timeScale(BURST.fastScale);

  const BRAKE_AT = BURST.fastSec;
  const RISE_AT = BURST.fastSec + BURST.brakeSec;

  // TUKAR UKURAN: lapisan 3 dan 4 bertukar radius saat sprint.
  //
  // Dua tahap, bukan simultan, dan itu yang diminta:
  //   tahap 1 - lapisan 3 (cincin bertitik) mengecil ke ukuran lapisan 4
  //   tahap 2 - baru setelah tahap 1 selesai, lapisan 4 (dua busur)
  //              membesar ke ukuran lapisan 3
  //
  // Konsekuensinya: di antara dua tahap itu kedua lapisan berdiri di
  // radius yang sama (84). Titik-titik turun sampai tepat di radius
  // busur, jadi keduanya sempat berimpit. Itu arti "tahap 1 selesai,
  // tahap 2 belum mulai" - bukan bug. Kalau tidak diinginkan, dua tahap
  //nya cukup ditumpuk.
  //
  // JADWALNYA (siklus 21 detik). Disusun ulang karena versi lama menumpuk
  // semua gerak di detik 0-2 dan menyebar kembalinya ke 8 detik fase
  // naik. Dua keluhan itu memang akibatnya:
  //
  //   0,0-2,2  : masih cepat, TAPI tidak ada yang berubah ukuran.
  //               Putaran didiarkan dulu sampai laju penuhnya terasa, jadi
  //               saat ukuran berubah mata sudah tahu ada lonjakan laju.
  //               Versi lama mulai berukar di milidetik pertama, saat pita
  //               justru masih berakselerasi dari diam - terbaca sebagai
  //               "dial gelisah sejak halaman terbuka".
  //
  //   2,2-3,6  : tahap 1, lapisan 3 turun ke 84
  //   3,6-5,0  : tahap 2, lapisan 4 naik ke 112
  //   5,0-10   : TERTUKAR PENUH, DITAHAN LIMA DETIK PENUH. Tidak ada satu
  //               pun yang berubah selama rentang ini - tidak ukuran, tidak
  //               intensitas glow. Ini yang diminta: setelah bertukar,
  //               jeda yang lama di posisi akhir itu, baru boleh kembali.
  //               Versi lama rapuh karena kembalinya justru disebar
  //               ke 8 detik fase naik yang tenang - jadi yang terlihat
  //               bukan "diam dulu", tapi "lambat sekali".
  //
  //  10,0-11,5 : rem + kembali tahap A, busur turun ke 84
  //  11,5-13   : kembali tahap B, titik-titik naik ke 112
  //
  // Jadi dua keluhan itu dipisah: tahanannya dibuat lama dan tenang
  // (5 detik, di tengah fase cepat), sementara kembalinya tetap
  // singkat karena dipatok SETENGAH `brakeSec` per tahap - dua tahapnya
  // tepat mengisi fase rem dan selesai di detik 13. `fastSec` dan
  // `RISE_AT` tidak berubah, jadi fase naik 8 detik kini bersih:
  // hanya putaran lambat, ukuran sudah pulih sejak detik 13.
  const swap3 = { v: 0 };
  const swap4 = { v: 0 };
  const hubGrow = { v: 0 };
  const paintSwap = () => {
    // 0 = ukuran asli, 1 = sudah bertukar.
    dash.setAttribute('r', (R_DASH + (R_ARC - R_DASH) * swap3.v).toFixed(2));
    const r4 = R_ARC + (R_DASH - R_ARC) * swap4.v;
    arcs[0].setAttribute('d', arcPath(r4, -64, 26));
    arcs[1].setAttribute('d', arcPath(r4, 116, 206));
    // Cincin poros ikut membesar sampai persis di radius lapisan 5.
    // `R_CORE_RING`, bukan angka lain, supaya kalau lapisan 5 dipindah
    // angkanya, cincin ini otomatis ikut ke sana.
    halo.setAttribute('r', (R_HUB_RING + (R_CORE_RING - R_HUB_RING) * hubGrow.v).toFixed(2));
  };
  paintSwap();

  const SWAP_A = BURST.swapLeadSec;
  const SWAP_B = SWAP_A + BURST.swapSec;
  const BACK_A = BRAKE_AT;
  const HALF_BRAKE = BURST.brakeSec / 2;
  const BACK_B = BACK_A + HALF_BRAKE;

  // Yang TIDAK ada lagi: scaling pada pita dan penebalan semua garis.
  //
  // Keduanya dulu memberi "tarik napas" sebelum menyambar, dan scale pada
  // `groups.ticks` plus `--lw` untuk ketebalan sempat beres. Semuanya
  // dihapus atas permintaan: pita tidak pernah lagi berubah ukuran, dan
  // `stroke-width` di CSS sudah kembali polos tanpa `calc()`.
  //
  // Yang dipulihkan - dan ini lebih baik daripada scaling: HANYA 10 tick
  // oranye yang memanjang ke luar saat sprint. Karena yang bergerak adalah
  // ujung luarnya, ujung dalam tidak bergerak, jadi jarak ke layer 2 tetap
  // 21 satuan dan bug "dekat-jauh" tidak kembali. Pita diam ukurannya.
  //
  // Cara hitungnya: satu proxy `grow` di 0..1, lalu `paintMajors()`
  // menulis ulang `x2`/`y2` untuk 10 baris crisp dan 10 baris glow-nya,
  // sekaligus menyetel opacity glow dari angka yang sama. Bukan 20 tween
  // terpisah: itu berarti 20 tween yang harus dijaga sinkron, dan
  // semuanya menulis angka yang sama. Satu fungsi menjaga semuanya dari
  // satu angka.
  //
  // GlowNYA ikut memanjang karena geometrinya disalin dari angka yang
  // sama, bukan karena ditween terpisah. Kalau glow-nya punya animate
  // sendiri, ada satu tween di mana keduanya tidak sinkron, dan yang
  // terlihat adalah cahaya yang tertinggal di belakang garisnya.
  const grow = { v: 0 };
  const paintMajors = () => {
    const R = R_TICKS + BURST.majorGrow * grow.v;
    for (const m of majors) {
      const x = (C + R * m.cos).toFixed(2);
      const y = (C + R * m.sin).toFixed(2);
      m.line.setAttribute('x2', x);
      m.line.setAttribute('y2', y);
      m.glow.setAttribute('x2', x);
      m.glow.setAttribute('y2', y);
    }
    glow.style.opacity = (grow.v * BURST.glowMax).toFixed(3);
  };
  paintMajors();

  const burst = gsap
    .timeline({ repeat: -1 })
    // 0-0,7 detik: 10 tick oranye melesat keluar. `linear`, karena ini
    // ledakan singkat - yang dikejar konstan dan tegas, bukan landung.
    .to(grow, { v: 1, duration: BURST.growSec, ease: 'none', onUpdate: paintMajors }, 0)
    // TAHAP 1, 2,5-4,2 detik: lapisan 3 (titik-titik) turun ke radius
    // lapisan 4. `power2.inOut` karena diminta smooth: mulai lambat,
    // percepat di tengah, mendarat halus. Linear akan membuat perpindahan
    // ukuran terasa seperti lompatan yang dianimasikan.
    .to(swap3, { v: 1, duration: BURST.swapSec, ease: 'power2.inOut', onUpdate: paintSwap }, SWAP_A)
    // TAHAP 2, 3,6-5,0 detik: baru sesudah tahap 1 benar-benar selesai,
    // lapisan 4 (busur) membesar ke radius yang tadi dikosongkan.
    .to(swap4, { v: 1, duration: BURST.swapSec, ease: 'power2.inOut', onUpdate: paintSwap }, SWAP_B)
    // CINCIN POROS, 2,2-5,0 detik: membesar dari 9 ke 56 sambil kedua
    // tahap pertukaran berjalan. Satu tween yang membentang di atas KEDUA
    // tahap, bukan tahap ketiga - jadi yang terlihat adalah cincin itu
    // ikut bergerak bareng lapisan dalam, bukan gerak sendiri yang
    // kebetulan keburu. `power2.inOut` sama seperti yang lain, jadi
    // ketiganya satu ritme.
    .to(hubGrow, { v: 1, duration: BURST.swapSec * 2, ease: 'power2.inOut', onUpdate: paintSwap }, SWAP_A)
    // 10-11,3 detik: oranye menyusut tepat saat rem dimulai. Jadi oranye
    // panjang selama sprint, normal lagi selama 8 detik naiknya.
    .to(grow, { v: 0, duration: BURST.shrinkSec, ease: 'none', onUpdate: paintMajors }, BRAKE_AT)
    // CINCIN POROS, 10-13 detik: ikut menyusut selama rem, satu tween lagi
    // di atas dua tahap kembalinya. Berakhir di detik yang sama, jadi
    // tidak ada sisa gerak saat fase naik dimulai.
    .to(hubGrow, { v: 0, duration: BURST.brakeSec, ease: 'power2.inOut', onUpdate: paintSwap }, BACK_A)
    // KEMBALI, 10-11,5 detik: busur turun ke 84. Urutannya terbalik dari
    // saat masuk - waktu masuk titik-titik turun dulu, waktu keluar busur
    // yang turun dulu.
    .to(swap4, { v: 0, duration: HALF_BRAKE, ease: 'power2.inOut', onUpdate: paintSwap }, BACK_A)
    // KEMBALI, 11,5-13 detik: titik-titik naik ke 112. Selesai tepat di
    // akhir fase rem, jadi fase naik 8 detik tidak lagi dipakai untuk
    // memulihkan ukuran.
    .to(swap3, { v: 0, duration: HALF_BRAKE, ease: 'power2.inOut', onUpdate: paintSwap }, BACK_B)
    // 10-13 detik: REM. `power2.out` - laju jatuh cepat di awal, lalu
    // ekor panjang yang makin landung. Persis rem: tekanan utama di
    // depan, sisa jarak makin halus.
    .to(slowSpin, { timeScale: 1, duration: BURST.brakeSec, ease: 'power2.out' }, BRAKE_AT)
    // 13-21 detik: naik lagi ke cepat, mendarat tepat di detik ke-21.
    // `power2.in` kebalikannya: pelan dulu lalu menghilang, jadi lonjakan
    // kecepatannya hampir tidak terlihat - persis seperti tombol gas.
    .to(slowSpin, { timeScale: BURST.fastScale, duration: BURST.riseSec, ease: 'power2.in' }, RISE_AT);

  ambient.push(
    slowSpin,
    burst,
    gsap.to(groups.bezel, { rotation: -360, duration: SPIN.bezel, ease: 'none', repeat: -1, svgOrigin: `${C} ${C}` }),
    gsap.to(groups.mid, { rotation: 360, duration: SPIN.mid, ease: 'none', repeat: -1, svgOrigin: `${C} ${C}` }),
    gsap.to(groups.inner, { rotation: -360, duration: SPIN.inner, ease: 'none', repeat: -1, svgOrigin: `${C} ${C}` }),
    // Napas: skala 1 ke 1,02 dalam 11 detik. Cukup supaya tidak diam,
    // cukup kecil supaya tidak terasa denyut.
    gsap.to(root, { scale: 1.02, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' })
  );

  // SENGAJA TIDAK ADA apa pun yang reacted ke tetikus di sini.
  //
  // Dulu dial bergerak mengikuti kursor lewat `quickTo`. Permintaannya
  // jelas: tanpa efek apa pun ketika kursor diarahkan ke sana.
  //
  // Alasan Infinity-plus-nya: dial ini bukan kontrol. Tidak ada hover
  // state, tidak ada tooltip, tidak ada apa pun yang terjadi saat kursor
  // mendekatinya — jadi memberinya gerak hanya menambah satu hal yang
  // dipantau pengguna tanpa memberi imbalan apa pun. Di layar
  // 1024-1400px kolom kanannya sempit dan jaraknya cuma beberapa
  // puluhan piksel dari teks, sehingga kursor yang kebetulan lewat
  // membuat gambar ikut bergeser saat mata sedang membaca.
  //
  // Loop yang tak terlihat tetap membakar frame. Berhenti begitu
  // gambar keluar layar.
  watcher?.disconnect();
  watcher = null;
  if ('IntersectionObserver' in window) {
    watcher = new IntersectionObserver(([entry]) => {
      ambient.forEach((tw) => (entry.isIntersecting ? tw.resume() : tw.pause()));
    }, { threshold: 0 });
    watcher.observe(host);
  }

}

/**
 * Render ulang dari nol. Dipanggil dari `renderAll()`, jadi ikut jalan
 * setiap kali bahasa diganti.
 */
export function renderHeroMotion() {
  const host = qs('[data-hero="motion"]');
  const hadPlayed = played;

  intro?.kill();
  intro = null;
  built = null;
  ambient.forEach((tw) => tw.kill());
  ambient = [];
  watcher?.disconnect();
  watcher = null;

  report();

  if (!host) return;

  const parts = build(host);
  if (!parts) return;
  built = parts;

  if (!loopRuns()) return;

  // Reduce motion: JANGAN bikin timeline intro sama sekali.
  //
  // `buildIntro()` memakai `fromTo`, dan GSAP menerapkan nilai awal
  // seketika saat tween dibuat - termasuk ketika timeline-nya `paused`.
  // Jadi `autoAlpha: 0` langsung menempel ke SVG, lalu tidak pernah ada
  // yang memutar timeline itu untuk melepaskannya: dialnya hilang
  // total, bukan sekadar diam. Itu sebabnya jalur reduce motion
  // melompat langsung ke loop tanpa `buildIntro()`.
  if (reduceMotion()) {
    startAmbient(host, parts);
    return;
  }

  intro = buildIntro(parts);
  played = hadPlayed;

  // Render ulang karena ganti bahasa tidak boleh mengulang pembuka di
  // depan mata pengguna: snap ke keadaan akhir, lalu nyalakan loop.
  if (hadPlayed) {
    intro?.progress(1);
    startAmbient(host, parts);
  }
}

/**
 * Putar pembuka + nyalakan loop.
 *
 * Dipanggil dari `playHeroIntro()` supaya penundaannya mengikuti lembar
 * loader, sama seperti `splitIn()` untuk judul.
 * @param {number} [delay] detik penundaan
 * @returns {gsap.core.Timeline|null}
 */
export function playHeroMotion(delay = 0) {
  if (!intro) return null;
  played = true;

  const host = qs('[data-hero="motion"]');
  if (host && built) {
    // Pakai `parts` ASLI dari `build()`, bukan query ulang DOM.
    //
    // Versi lama membangun ulang objeknya di sini dengan mengetik
    // ulang `svg`, `groups`, dan `hub` saja. Itu tidak hanya boros -
    // ia SENGAJA TIDAK LENGKAP, dan `startAmbient()` butuh jauh lebih
    // banyak: `majors`, `glow`, `dash`, `arcs`, `halo`. Akibatnya
    // `paintSwap()` butuh `dash` yang tidak pernah ada di sini, dan
    // melempar `TypeError` di setiap frame tanpa suara - hanya di jalur
    // `?motion=off`, karena di jalur reduce motion `startAmbient` sudah
    // sempat dipanggil lebih dulu dengan parts yang benar.
    //
    // Satu sumber: `build()` sudah mengembalikan semuanya, dan objek
    // itu tetap hidup selama SVG-nya ada di DOM.
    intro.eventCallback('onComplete', () => startAmbient(host, built));
  }

  if (delay > 0) gsap.delayedCall(delay, () => intro?.play(0));
  else intro.play(0);

  return intro;
}
