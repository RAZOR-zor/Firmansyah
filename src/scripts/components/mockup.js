/**
 * Mockup project — komposisi SVG "blueprint" yang digambar prosedural.
 *
 * Kenapa SVG, bukan foto:
 *  - tidak ada request gambar, tidak ada CLS, tidak perlu lazy-load
 *  - ikut berubah saat tema light/dark
 *  - terasa dikerjakan sendiri, bukan aset stok
 *
 * @module components/mockup
 */

/** @param {number} n @returns {string} */
const mono = (n) => Math.round(n);

/**
 * @param {string} variant
 * @param {string} label
 * @returns {string} markup SVG
 */
export function mockupSvg(variant, label) {
  const w = 800;
  const h = 520;
  const builders = { portfolio: portfolioArt, hotel: hotelArt, ui: uiArt, extension: extensionArt, newtab: newtabArt };
  const build = builders[/** @type {keyof typeof builders} */ (variant)] ?? portfolioArt;

  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Mockup ${label}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bl { fill: none; stroke: currentColor; stroke-width: 1; vector-effect: non-scaling-stroke; }
    .bl-f { fill: currentColor; opacity: .08; }
    .bl-a { fill: none; stroke: currentColor; stroke-width: 1; opacity: .38; vector-effect: non-scaling-stroke; }

    /* Label mockup adalah TEKS sungguhan yang dibaca orang, jadi ukurannya
       dan kontrasnya dihitung, bukan dikira-kira.

       Angka di bawah adalah user unit. viewBox 800 biasanya dirender ~686px
       (skala 0,86), jadi 12px di sini tampil ~10,3px di layar.

       Opasitas 0,62, bukan 0,5: di tema terang, currentColor yang gelap di
       atas --surface hanya menghasilkan 3,3:1 pada 0,5. Angka 0,62
       membawa paper, surface, dan surface-2 semuanya melewati 4,5:1. */
    .bl-t { fill: currentColor; opacity: .62; font-family: "JetBrains Mono", monospace; font-size: 12px; letter-spacing: .1em; }
    .bl-d { fill: currentColor; opacity: .85; font-family: "JetBrains Mono", monospace; font-size: 14px; letter-spacing: .06em; }

    /* Teks di dalam kotak accent (tombol yang disuntik).

       WAJIB lewat CSS class, bukan presentation attribute
       fill="var(--paper)". Presentation attribute bukan CSS: nilainya
       diurai sebagai nilai atribut biasa, dan var() tidak pernah
       disubstitusi di sana — fill-nya jatuh ke yang diwarisi
       (currentColor), jadi di tema gelap hasilnya terang di atas
       terang dan teks tombolnya nyaris tak terlihat. */
    .bl-inv { fill: var(--paper); font-family: "JetBrains Mono", monospace; font-size: 14px; letter-spacing: .06em; }

    /* Glyph yang jadi seluruh UI produk — chevron. Butuh class sendiri
       karena stroke-width sebagai presentation attribute SELALU kalah oleh
       CSS: menuliskan class "bl" bersama stroke-width="2.5" tetap
       tergambar setebal 1px, karena nilai atribut diurai sebagai atribut
       biasa dan aturan class menang. Menebalkan lewat class, bukan atribut. */
    .bl-h { fill: none; stroke: currentColor; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
  </style>
  <g class="bl" opacity=".5">${gridLines(w, h)}</g>
  ${build(w, h, label)}
</svg>`;
}

/** @param {number} w @param {number} h @returns {string} */
function gridLines(w, h) {
  let out = '';
  for (let x = 50; x < w; x += 50) out += `<line x1="${mono(x)}" y1="0" x2="${mono(x)}" y2="${mono(h)}" class="bl-a" stroke-width=".5"/>`;
  for (let y = 50; y < h; y += 50) out += `<line x1="0" y1="${mono(y)}" x2="${mono(w)}" y2="${mono(y)}" class="bl-a" stroke-width=".5"/>`;
  return out;
}

/* ── Varian 1 · Portofolio: halaman editorial dua kolom ── */
function portfolioArt(w, h, label) {
  const pad = 64;
  return `
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl-f"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl"/>
  <line x1="${pad}" y1="${pad + 28}" x2="${w - pad}" y2="${pad + 28}" class="bl"/>
  <line x1="${pad}" y1="${pad + 28}" x2="${pad}" y2="${h - pad}" class="bl" opacity=".3"/>
  <text x="${pad + 12}" y="${pad + 18}" class="bl-t">${label.toUpperCase()}</text>
  <line x1="${pad + 250}" y1="${pad + 28}" x2="${pad + 250}" y2="${h - pad}" class="bl" opacity=".3"/>

  <rect x="${pad + 14}" y="${pad + 48}" width="150" height="7" class="bl-f" stroke="none"/>
  <rect x="${pad + 14}" y="${pad + 62}" width="196" height="7" class="bl-f" stroke="none"/>
  <rect x="${pad + 14}" y="${pad + 76}" width="120" height="7" class="bl-f" stroke="none"/>

  ${Array.from({ length: 7 }, (_, i) => {
    const y = pad + 104 + i * 17;
    return `<line x1="${pad + 14}" y1="${y}" x2="${pad + 212}" y2="${y}" class="bl-a" stroke-width=".75"/>`;
  }).join('')}

  <rect x="${pad + 272}" y="${pad + 48}" width="420" height="150" class="bl"/>
  <line x1="${pad + 272}" y1="${pad + 98}" x2="${pad + 692}" y2="${pad + 98}" class="bl-a" stroke-width=".75"/>
  <line x1="${pad + 272}" y1="${pad + 148}" x2="${pad + 692}" y2="${pad + 148}" class="bl-a" stroke-width=".75"/>
  <circle cx="${pad + 292}" cy="${pad + 68}" r="5" class="bl-a"/>

  <rect x="${pad + 272}" y="${pad + 220}" width="200" height="112" class="bl"/>
  <rect x="${pad + 492}" y="${pad + 220}" width="200" height="112" class="bl"/>
  ${Array.from({ length: 4 }, (_, i) => `<line x1="${pad + 286}" y1="${pad + 244 + i * 16}" x2="${pad + 450}" y2="${pad + 244 + i * 16}" class="bl-a" stroke-width=".75"/>`).join('')}
  ${Array.from({ length: 4 }, (_, i) => `<line x1="${pad + 506}" y1="${pad + 244 + i * 16}" x2="${pad + 670}" y2="${pad + 244 + i * 16}" class="bl-a" stroke-width=".75"/>`).join('')}`;
}

/* ── Varian 2 · Hotel: hero foto + panelbooking ── */
function hotelArt(w, h, label) {
  const pad = 64;
  const split = 360;
  return `
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl-f"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl"/>

  <rect x="${pad}" y="${pad}" width="${split}" height="86" class="bl"/>
  <text x="${pad + 14}" y="${pad + 32}" class="bl-d">HOTEL</text>
  <line x1="${pad + 14}" y1="${pad + 48}" x2="${pad + 120}" y2="${pad + 48}" class="bl-a" stroke-width=".75"/>
  ${[0, 1, 2].map((i) => `<line x1="${pad + 150 + i * 46}" y1="${pad + 44}" x2="${pad + 182 + i * 46}" y2="${pad + 44}" class="bl-a" stroke-width=".75"/>`).join('')}
  <rect x="${pad + split}" y="${pad}" width="${w - pad * 2 - split}" height="86" class="bl"/>

  <rect x="${pad}" y="${pad + 86}" width="${split}" height="${h - pad * 2 - 86}" class="bl"/>
  <line x1="${pad}" y1="${pad + 260}" x2="${pad + split}" y2="${pad + 260}" class="bl-a" stroke-width=".75"/>
  <rect x="${pad + 14}" y="${pad + 108}" width="180" height="9" class="bl-f" stroke="none"/>
  <rect x="${pad + 14}" y="${pad + 124}" width="130" height="9" class="bl-f" stroke="none"/>
  ${Array.from({ length: 3 }, (_, i) => `<line x1="${pad + 14}" y1="${pad + 154 + i * 16}" x2="${pad + 300}" y2="${pad + 154 + i * 16}" class="bl-a" stroke-width=".75"/>`).join('')}

  <rect x="${pad + split}" y="${pad + 86}" width="${w - pad * 2 - split}" height="${h - pad * 2 - 86}" class="bl"/>
  <text x="${pad + split + 16}" y="${pad + 112}" class="bl-t">${label.toUpperCase()}</text>
  <line x1="${pad + split + 16}" y1="${pad + 126}" x2="${w - pad}" y2="${pad + 126}" class="bl" opacity=".3"/>
  ${[0, 1].map((i) => `
    <rect x="${pad + split + 16}" y="${pad + 142 + i * 78}" width="${w - pad * 2 - split - 32}" height="66" class="bl"/>
    <text x="${pad + split + 28}" y="${pad + 164 + i * 78}" class="bl-t">KAMAR ${i === 0 ? 'DELUXE' : 'SUPERIOR'}</text>
    <line x1="${pad + split + 28}" y1="${pad + 176 + i * 78}" x2="${pad + split + 128}" y2="${pad + 176 + i * 78}" class="bl-a" stroke-width=".75"/>
    <rect x="${pad + split + 150}" y="${pad + 162 + i * 78}" width="76" height="20" class="bl-a"/>
  `).join('')}
  <rect x="${pad + split + 16}" y="${pad + 300}" width="${w - pad * 2 - split - 32}" height="34" class="bl"/>
  <text x="${pad + split + 34}" y="${pad + 321}" class="bl-t">PESAN SEKARANG</text>`;
}

/* ── Varian 3 · UI: dasbor housekeeping ── */
function uiArt(w, h, label) {
  const pad = 64;
  const railW = 52;
  return `
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl-f"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl"/>

  <rect x="${pad}" y="${pad}" width="${railW}" height="${h - pad * 2}" class="bl"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${pad + 18}" y="${pad + 22 + i * 34}" width="16" height="16" class="bl-a" stroke-width=".75"/>`).join('')}

  <text x="${pad + railW + 16}" y="${pad + 30}" class="bl-t">${label.toUpperCase()}</text>
  <line x1="${pad + railW}" y1="${pad + 46}" x2="${w - pad}" y2="${pad + 46}" class="bl" opacity=".3"/>

  ${[0, 1, 2].map((i) => `
    <rect x="${pad + railW + 16}" y="${pad + 64 + i * 76}" width="182" height="60" class="bl"/>
    <text x="${pad + railW + 28}" y="${pad + 86 + i * 76}" class="bl-t">KAMAR</text>
    <text x="${pad + railW + 28}" y="${pad + 110 + i * 76}" class="bl-d">${(i + 1) * 12 + 4}</text>
  `).join('')}

  <rect x="${pad + railW + 218}" y="${pad + 64}" width="${w - pad * 2 - railW - 234}" height="212" class="bl"/>
  ${Array.from({ length: 6 }, (_, i) => {
    const hgt = 40 + ((i * 37) % 96);
    return `<rect x="${pad + railW + 236 + i * 52}" y="${pad + 258 - hgt}" width="26" height="${hgt}" class="bl-a"/>`;
  }).join('')}
  <line x1="${pad + railW + 234}" y1="${pad + 258}" x2="${w - pad - 16}" y2="${pad + 258}" class="bl-a" stroke-width=".75"/>

  ${Array.from({ length: 3 }, (_, i) => `
    <rect x="${pad + railW + 16}" y="${pad + 300 + i * 34}" width="${w - pad * 2 - railW - 32}" height="24" class="bl"/>
    <circle cx="${pad + railW + 32}" cy="${pad + 312 + i * 34}" r="4" class="bl-a" stroke-width=".75"/>
    <line x1="${pad + railW + 48}" y1="${pad + 312 + i * 34}" x2="${pad + railW + 220}" y2="${pad + 312 + i * 34}" class="bl-a" stroke-width=".75"/>
  `).join('')}`;
}

/* ── Varian 4 · Ekstensi Chrome: Google Form + widget yang disuntik ──
   Bentuknya mengikuti cara kerja Form Solver sungguhan: halaman form di
   kiri, dan tombol "AI Form Solver" yang disuntik persis di bawah judul
   form. Dua panel di kanan (Riwayat & Pengaturan) ikut digambar, karena
   justru mereka yang menjelaskan apa yang dilakukan ekstensinya — mockup
   hotel atau dasbor tidak akan menjelaskan apa-apa soal ini.

   Yang TIDAK digambar: tombol Submit. Submit sengaja manual di proyek
   aslinya, jadi menampilkannya akan berbohong. */
function extensionArt(w, h, label) {
  const pad = 64;
  const split = 430;
  // Panjang panel kanan dihitung dari area konten yang sebenarnya
  // (`w - pad * 2`), bukan dari `w - pad`. Kalau yang dipakai yang
  // kedua, panelnya meluber sampai tepi luar figure — sisi kanan jadi
  // tanpa gutter sementara sisi kiri tetap ber-padding 64.
  const right = w - pad * 2 - split;
  const rx = pad + split;

  return `
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl-f"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl"/>

  <rect x="${pad}" y="${pad}" width="${split}" height="${h - pad * 2}" class="bl"/>
  <text x="${pad + 16}" y="${pad + 26}" class="bl-t">${label.toUpperCase()}</text>
  <rect x="${pad + 16}" y="${pad + 36}" width="150" height="9" class="bl-f" stroke="none"/>
  <rect x="${pad + 16}" y="${pad + 50}" width="112" height="9" class="bl-f" stroke="none"/>

  <rect x="${pad + 16}" y="${pad + 76}" width="152" height="26" fill="currentColor" opacity=".8"/>
  <text x="${pad + 28}" y="${pad + 93}" class="bl-inv">AI FORM SOLVER</text>

  ${[
    { y: pad + 128, kind: 'radio', tail: 150 },
    { y: pad + 186, kind: 'check', tail: 132 },
    { y: pad + 244, kind: 'text', tail: 196 },
  ].map((q) => `
    <line x1="${pad + 16}" y1="${q.y}" x2="${pad + 16 + q.tail}" y2="${q.y}" class="bl-a" stroke-width=".75"/>
    ${q.kind === 'radio'
      ? `<circle cx="${pad + 28}" cy="${q.y + 18}" r="4" class="bl-a" stroke-width=".75"/><circle cx="${pad + 28}" cy="${q.y + 18}" r="1.6" fill="currentColor"/>`
      : q.kind === 'check'
        ? `<rect x="${pad + 24}" y="${q.y + 14}" width="8" height="8" class="bl-a" stroke-width=".75"/>`
        : `<rect x="${pad + 24}" y="${q.y + 12}" width="110" height="12" class="bl-a" stroke-width=".75"/>`}
    <line x1="${pad + 42}" y1="${q.y + 18}" x2="${pad + 16 + q.tail}" y2="${q.y + 18}" class="bl-a" stroke-width=".75"/>
  `).join('')}

  <rect x="${rx}" y="${pad}" width="${right}" height="${h - pad * 2}" class="bl"/>
  <line x1="${rx}" y1="${pad + 150}" x2="${w - pad}" y2="${pad + 150}" class="bl" opacity=".3"/>

  <text x="${rx + 16}" y="${pad + 28}" class="bl-t">RIWAYAT</text>
  ${[0, 1].map((i) => `
    <rect x="${rx + 16}" y="${pad + 42 + i * 46}" width="${right - 32}" height="34" class="bl"/>
    <circle cx="${rx + 32}" cy="${pad + 59 + i * 46}" r="3" fill="currentColor"/>
    <line x1="${rx + 44}" y1="${pad + 53 + i * 46}" x2="${rx + 44 + (i ? 68 : 94)}" y2="${pad + 53 + i * 46}" class="bl-a" stroke-width=".75"/>
    <line x1="${rx + 44}" y1="${pad + 65 + i * 46}" x2="${rx + 96}" y2="${pad + 65 + i * 46}" class="bl-a" stroke-width=".75"/>
  `).join('')}

  <text x="${rx + 16}" y="${pad + 174}" class="bl-t">PENGATURAN</text>
  <text x="${rx + 16}" y="${pad + 200}" class="bl-t">MODEL</text>
  <rect x="${rx + 16}" y="${pad + 208}" width="${right - 32}" height="22" class="bl"/>
  <rect x="${rx + 16}" y="${pad + 208}" width="${right - 32}" height="22" fill="currentColor" opacity=".14" stroke="none"/>
  <line x1="${rx + 26}" y1="${pad + 219}" x2="${rx + 84}" y2="${pad + 219}" class="bl-a" stroke-width=".75"/>

  <text x="${rx + 16}" y="${pad + 262}" class="bl-t">KEY</text>
  ${[0, 1, 2].map((i) => `
    <rect x="${rx + 16}" y="${pad + 270 + i * 20}" width="${right - 32}" height="14" class="bl"/>
    <rect x="${rx + 22}" y="${pad + 274 + i * 20}" width="${right - 60 - i * 20}" height="6" class="bl-f" stroke="none"/>
  `).join('')}

  <text x="${rx + 16}" y="${pad + 358}" class="bl-t">KUOTA</text>
  <rect x="${rx + 16}" y="${pad + 366}" width="${right - 32}" height="6" class="bl-a"/>
  <rect x="${rx + 16}" y="${pad + 366}" width="${(right - 32) * 0.62}" height="6" fill="currentColor"/>`;
}

/**
 * New-tab page: satu chevron, panel cari, rail tab di tepi kiri, kartu.
 *
 * Sengaja menggambar tiga hal yang tidak bisa ditebak dari nama "RAZOR":
 * chevron yang jadi satu-satunya kontrol, rail tab yang muncul di halaman
 * mana pun (bukan cuma di tab baru), dan baris kartu. Tanpa ketiganya,
 * mockup ini hanya akan terlihat seperti halaman web generik.
 * @param {number} w @param {number} h @param {string} label
 */
function newtabArt(w, h, label) {
  const pad = 64;
  const railW = 54;
  const x0 = pad + railW;      // 118 — awal area konten, setelah rail
  const right = w - pad;        // 736
  const midY = 248;

  return `
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl-f"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" class="bl"/>

  <line x1="${x0}" y1="${pad}" x2="${x0}" y2="${h - pad}" class="bl"/>
  <text x="${pad + 12}" y="${pad + 26}" class="bl-t">TABS</text>
  ${[0, 1, 2, 3].map((i) => `
    <rect x="${pad + 14}" y="${pad + 48 + i * 32}" width="22" height="22" class="bl-a" stroke="none"/>
    <rect x="${pad + 14}" y="${pad + 48 + i * 32}" width="22" height="22" class="bl"/>
    <rect x="${pad + 19}" y="${pad + 53 + i * 32}" width="12" height="12" class="bl-f" stroke="none"/>
  `).join('')}

  <text x="${x0 + 24}" y="${pad + 26}" class="bl-t">${label.toUpperCase()}</text>

  <polyline points="${x0 + 40},${midY - 46} ${x0 + 92},${midY} ${x0 + 40},${midY + 46}" class="bl-h"/>
  <line x1="${x0 + 126}" y1="${midY - 70}" x2="${x0 + 126}" y2="${midY + 52}" class="bl-a" stroke="none"/>
  <line x1="${x0 + 126}" y1="${midY - 70}" x2="${x0 + 126}" y2="${midY + 52}" class="bl-a"/>
  <text x="${x0 + 24}" y="${midY + 92}" class="bl-t">TYPE TO SEARCH</text>

  <rect x="${right - 244}" y="${midY - 20}" width="244" height="40" class="bl"/>
  <line x1="${right - 230}" y1="${midY}" x2="${right - 152}" y2="${midY}" class="bl-a" stroke="none"/>
  <line x1="${right - 230}" y1="${midY}" x2="${right - 152}" y2="${midY}" class="bl-a"/>
  <line x1="${right - 144}" y1="${midY - 7}" x2="${right - 144}" y2="${midY + 7}" class="bl-a" stroke="none"/>
  <line x1="${right - 144}" y1="${midY - 7}" x2="${right - 144}" y2="${midY + 7}" class="bl-a"/>

  ${[0, 1, 2].map((i) => `
    <rect x="${right - 244}" y="${midY + 40 + i * 26}" width="${210 - i * 34}" height="18" class="bl-a" stroke="none"/>
    <rect x="${right - 244}" y="${midY + 40 + i * 26}" width="${210 - i * 34}" height="18" class="bl-a"/>
    <rect x="${right - 236}" y="${midY + 46 + i * 26}" width="${52 + i * 26}" height="6" class="bl-f" stroke="none"/>
  `).join('')}

  <text x="${x0 + 24}" y="${h - pad - 30}" class="bl-t">CARDS</text>
  ${[0, 1, 2, 3, 4, 5].map((i) => `
    <circle cx="${x0 + 38 + i * 40}" cy="${h - pad - 62}" r="13" class="bl-a" stroke="none"/>
    <circle cx="${x0 + 38 + i * 40}" cy="${h - pad - 62}" r="13" class="bl-a"/>
    <circle cx="${x0 + 38 + i * 40}" cy="${h - pad - 62}" r="5" class="bl-f" stroke="none"/>
  `).join('')}`;
}
