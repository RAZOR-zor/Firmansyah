# Firmansyah

Website portofolio personal satu halaman, **dwibahasa** (Indonesia / Inggris).
Dibangun dengan HTML, CSS, dan JavaScript murni — **tanpa build step, tanpa
framework, tanpa `package.json`.**

---

## Menjalankan secara lokal

Website ini memakai ES Module, jadi **harus** dijalankan lewat HTTP server,
bukan klik-ganda `index.html` (yang akan gagal karena `file://` memblokir modul).

**Cara utama — `npm start`**

```bash
npm start
```

Lalu buka **http://127.0.0.1:5500/**

Tidak perlu `npm install` — proyek ini nol dependency, jadi tidak ada
yang perlu diunduh. Yang dibutuhkan hanya Node.js 18 ke atas.

Ganti port bila 5500 sudah dipakai:

```bash
PORT=8080 npm start          # macOS / Linux / Git Bash
set PORT=8080 && npm start   # Windows PowerShell / cmd
```

**Alternatif — VS Code Live Server**

Klik kanan `index.html` → **Open with Live Server**. Bisa jalan bareng
dengan `npm start` selama tidak memakai port yang sama.

> **Kalau halaman tampil polos tanpa styling** (font bawaan, teks hitam di
> kiri atas, tidak ada warna), berarti CSS-nya gagal dimuat. Tekan `F12` →
> Console, cari permintaan yang 404.
>
> Penyebabnya biasanya Live Server menyajikan folder yang salah, sehingga
> URL-nya jadi `127.0.0.1:5500/coba/index.html` dan bukan `127.0.0.1:5500/`.
>
> **Perbaikannya:** jalankan `npm start` (root otomatis benar), atau klik
> kanan `index.html` → **Open with Live Server**. Jangan menyajikan folder
> induknya. Semua path di proyek ini sudah relatif (`src/styles/main.css`,
> bukan `/src/styles/main.css`), jadi situs tetap jalan di kedua kondisi.

---

## Deploy ke Vercel

Tidak ada build script yang menjalankan kompilasi apa pun, jadi Vercel
menyajikan file statis apa adanya.

**Cara 1 — lewat GitHub**

1. Push folder ini ke repository GitHub
2. Di Vercel: **Add New → Project → Import** repository tersebut
3. Biarkan semua pengaturan build kosong, klik **Deploy**

**Cara 2 — lewat CLI**

```bash
npx vercel
```

`vercel.json` sudah berisi header cache untuk font, serta header keamanan
(`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
`Permissions-Policy`).

> **Kenapa `package.json` punya script `build`?**
>
> Karena Vercel selalu mencoba menjalankan `npm run build` bila ada
> `package.json`. Script-nya di sini sengaja `node --version` — perintah
> yang selalu berhasil dan tidak mengubah apa pun. Gunanya supaya Vercel
> tidak gagal dengan pesan "missing script: build", sekaligus menegaskan
> bahwa proyek ini memang tidak butuh proses build.
>
> `npm start` tidak pernah terpakai oleh Vercel — itu hanya untuk
> pengembangan lokal.

> Sebelum deploy, ganti domain di `index.html` (tag `canonical`, `og:*`),
> `robots.txt`, dan `sitemap.xml` dengan domain asli kamu.

---

## Struktur berkas

```
index.html                  Semua konten teks (SEO + fallback tanpa JS)
package.json                Hanya untuk `npm start` (nol dependency)
server.mjs                  Static server pengembangan, tanpa dependency
vercel.json                 Header cache & keamanan
robots.txt · sitemap.xml · .gitignore
favicon.svg
assets/fonts/               Archivo & JetBrains Mono (self-host, subset latin)src/
  styles/
    main.css                Titik masuk
    tokens.css              Warna, tipografi, spasi, motion, layout
    base.css                Reset, elemen dasar, aksesibilitas
    layout.css              Grid, container, section shell
    components.css          Semua komponen visual
  scripts/
    main.js                 Entry — urutan: bahasa → render → pasang → animasi
    data.js                 ⚠️ HANYA FILE YANG PERLU KAMU EDIT
    i18n.js                 Mekanisme ganti bahasa
    utils/                  dom.js · env.js · store.js · preview.js
    animations/             gsap.js · tokens.js · reveal.js · parallax.js
                            split.js · magnetic.js · section.js
     components/             loader · hero · heroMotion · nav · menu · theme
                              rail · cursor · clock · mockup · projects
                              timeline · certificates · lightbox · scrollbar
                              contact (social footer)
                              dial (TIDAK dipakai — lihat catatan di bawah)
```

## Bagian-bagian halaman

| # | Section | Sumber teksnya |
|---|---|---|
| 01 | Hero | `index.html` ( langsung diedit) |
| 02 | Tentang saya | `index.html` |
| 03 | Keahlian & minat | `index.html` |
| 04 | Proyek terpilih | `data.js` → `text[id|en].projects.items` |
| 05 | Perjalanan | `data.js` → `text[id|en].journey.items` |
| 06 | Footer | `index.html` |

---

## Mengganti konten

Semua teks ada dalam **dua bahasa** (Indonesia dan Inggris). Setiap elemen
punya atribut penanda, jadi tidak ada string yang tersebar di beberapa tempat.

### 1. Teks statis → `index.html`

Teks Bahasa Indonesia ditulis langsung di HTML, lalu ditandai dengan
atribut kunci. Ini disengaja: mesin pencari membaca isi lengkap dari
HTML, dan kalau JavaScript gagal, halaman tetap tampil utuh dalam
Bahasa Indonesia.

```html
<h2 class="section-title" data-i18n="about.title">Tentang saya.</h2>
<a data-i18n-attr="aria-label:themeLabel">…</a>
```

Untuk mengubah teksnya, cukup cari `data-i18n="about.title"` lalu buka
nilainya di `data.js` → `text.id.about.title` **dan** `text.en.about.title`.

| Bagian | Kunci yang dipakai |
|---|---|
| Hero | `hero.eyebrow`, `hero.title`, `hero.sub`, `hero.desc`, `hero.ctaPrimary`, `hero.facts.*` |
| Tentang | `about.eyebrow`, `about.title`, `about.statement`, `about.p1..p3`, `about.marks.*` |
| Keahlian | `skills.eyebrow`, `skills.title`, `skills.note`, `skills.groups.*.title/note/tags.*` |
| Proyek | `projects.eyebrow`, `projects.title`, `projects.note`, `projects.concept` |
| Perjalanan | `journey.eyebrow`, `journey.title`, `journey.aside` |
| Footer | `footer.sub`, `footer.copy`, `footer.toTop` |
| Navigasi | `nav.home` … `nav.journey`, `sections.*` |

### 2. Teks project & perjalanan → `src/scripts/data.js`

Strukturnya: bagian yang tidak perlu diterjemahkan (nomor, mockup, layout,
tautan) ada di `projects` dan `journey`; teksnya ada di `text[lang]` dan
dicocokkan lewat kunci yang stabil.

```js
export const projects = [
  { index: '01', mockup: 'extension', layout: 'wide' },
  { index: '02', mockup: 'newtab', layout: 'narrow', status: 'development' },
  // ...
];

// lalu di text.id.projects.items dan text.en.projects.items:
'01': {
  title: 'Form Solver',               // id
  //     'Form Solver',               // en
  category: 'Chrome Extension · 2026',
  description: '…',
  uses: ['…', '…'],                   // dipakai untuk apa
  how: ['…', '…'],                    // bagaimana kerjanya
  tags: ['Chrome Extension', 'Manifest V3'],
  linkLabel: 'Buka proyek',
},
```

`linkHref` **boleh dikosongkan**, dan itu yang terjadi sekarang. Form Solver
adalah Chrome extension yang dimuat lokal lewat "Load unpacked" — tidak ada
halaman publik yang bisa ditautkan. `projects.js` karena itu hanya membuat
tombolnya kalau `linkHref` terisi; tanpa itu tombolnya **dihilangkan**, bukan
dibuat jadi `href="#"`. Alasannya: tautan mati tetap terlihat bisa diklik,
`:hover`-nya tetap memberi affordance, tapi tidak menuju ke mana pun. Proyek
lokal memang tidak punya tujuan yang bisa diklik, jadi tombolnya tidak
pernah muncul.

Kalau nanti dipublikasi (web store, repo), isi `linkHref` dengan URL aslinya
dan tombolnya muncul otomatis.

### 3. Tautan → `src/scripts/data.js`

```js
export const contacts = [
  { key: 'Email',     value: '...', href: 'mailto:...',                  },
  { key: 'Instagram', value: '...', href: 'https://...', external: true  },
  // ...
];
```

Tautan di footer dan link Email pada menu mobile mengambil dari sini
lewat atribut `data-contact`.

### 4. Menambah bahasa baru

1. Tambah kodenya di `LANGS` pada `data.js`
2. Salin blok `en` di `text`, ganti isinya
3. Tidak perlu menyentuh kode lain

### 5. Warna, ukuran, dan ritme spasi → `src/styles/tokens.css`

Seluruh nilai desain ada di `:root`. Mengubah satu baris di sini
mengubah seluruh situs.

```css
--paper:  #F4F4F1;   /* latar terang  */
--ink:    #111111;   /* teks utama    */
--accent: #6E2E2E;   /* aksen claret  */
```

Tema gelap ada di blok `[data-theme="dark"]`.

#### Kontras: angka, bukan perasaan

Tangga tinta dan garis sengaja **dihitung**, bukan dipilih dari mata. Semua
nilai di bawah sudah diverifikasi di browser pada **kedua tema** — hasilnya
**128/128 elemen teks lolos WCAG AA** di desktop dan **118/118** di mobile
390px, dengan nol overflow dan nol elemen terpotong.

| | Terang | Gelap |
|---|---|---|
| `--ink` di `--paper` | 17,1:1 | 18,2:1 |
| `--ink-2` di `--paper` | 10,1:1 | 10,0:1 |
| `--ink-3` di `--paper` | 7,0:1 | 7,0:1 |
| `--ink-3` di `--surface-2` (terburuk) | 5,9:1 | 6,0:1 |
| `--accent` di `--paper` | 9,1:1 | 7,3:1 |
| `--accent-ink` di `--accent` | 10,0:1 | 7,0:1 |
| `--rule` di `--surface-2` | 2,0:1 | 2,0:1 |
| `--rule-strong` di `--surface-2` | **3,1:1** | **3,1:1** |

Tiga koreksi yang sudah dilakukan, dan alasannya:

**1. `--ink-3` awalnya hanya 3,1:1.** Komentanya di token bilang "hanya untuk
teks non-esensial" — dan itu keliru. WCAG tidak mengecualikan teks berdasarkan
seberapa penting isinya; yang menentukan adalah ukuran dan kontrasnya. Token itu
dipakai untuk label mono 10–11px, dan teks kecil justru butuh lebih banyak
kontras, bukan lebih sedikit. Sekarang **7,0:1** — naik ke AAA.

**2. Menaikkan satu abu-abu saja membuat tangentanya runtuh.** Saat `--ink-3`
pertama kali dinaikkan ke 5,4:1, jaraknya ke `--ink-2` hanya 0,35 poin —
hierarki sekunder/tersier praktis hilang dan desain jadi datar. Karena itu
ketiganya digeser sekaligus dengan jarak ±3 poin: 18 → 10 → 7. Tiga tingkat
abu-abu tidak mungkin sekaligus *berbeda jelas* **dan** semuanya kuat kalau dua
atas sudah tinggi; salah satunya harus digeser.

**3. Garis dihitung terhadap `--surface-2`, bukan `--paper`.** Ini yang mudah
terlewat. Kalau `--rule-strong` cuma 3,1:1 di atas `paper`, ia turun ke 2,6:1
di atas kartu — dan sebagian besar garis memang ada di atas kartu. Sekarang
dihitung terhadap latar tergelap, jadi **3,1:1 di mana pun** itu berada.
Angka 3:1 diambil dari WCAG 1.4.11 (Non-text Contrast): batas komponen dan
objek grafis yang harus dikenali.

#### Ukuran teks

Ukuran terkecil di situs ini **12px**. Semula ada rentang 9–11px yang tersebar
di 20 tempat, hampir semua uppercase mono dengan `letter-spacing` 0,14em —
gabungan yang membuatnya terlihat pucat **bukan** hanya karena kontrasnya, tapi
karena terlalu kecil untuk dibaca santai. Jadi dua-duanya diperbaiki: ukuran
naik satu langkah (9→11px, 10→12px, 13→14px, 14→15px) dan kontras dinaikkan.
`--fs-body` juga naik dari 1rem ke 1,0625rem (16→17px) karena teks deskripsi
punya bobot baca paling lama di halaman ini.

Yang **tidak** diubah: `--fs-display` dan `--fs-h2`. Judul sudah besar dan
kontrasnya 17:1 — menaikkan lagi hanya menambah lebar baris, bukan
keterbacaan.

#### Warna yang berbeda di tengah teks = hampir selalu bug

`.about__body` punya tiga paragraf berbobot sama, dan stylesheet punya
`.about__body p:first-of-type { color: var(--ink) }`. Efeknya: paragraf
pertama mendadak putih di antara dua paragraf abu-abu — dan saat `--ink-2`
dinaikkan ke 10:1, jaraknya jadi makin menyakitkan karena `--ink` ada di
18:1. Terlihat seperti glitch, bukan seperti hierarki.

Aturannya dihapus, bukan diperhalus. Alasannya: **peran lede sudah terpenuhi**
oleh `.about__statement` — teks 28px tepat di atasnya yang memang boleh tampil
penuh. Memberi `--ink` juga ke paragraf biasa hanya menggandakan peran itu,
bukan menambah hierarki. Sekarang hierarkinya bersih:

| Elemen | Warna | Ukuran |
|---|---|---|
| `.about__statement` (lede) | `--ink` | 28px |
| ketiga paragraf isi | `--ink-2` | 15px |

Pelajaran yang lebih umum: saat memperbaiki kontras, periksa ulang **mana yang
tiba-tiba beda dari tetangganya**. Menaikkan satu token membuat selisih yang
tadinya tak terlihat jadi mencolok — dan yang kelihatan selama ini bukan
sejak kontras diubah, tapi sudah salah sejak awal dan baru ketahuan sekarang.

#### Margin rail: dari kolom kosong jadi peta posisi

Rail punya lebar 128px dan tinggi satu layar penuh, tapi isinya cuma tiga baris
di ujung kolom: indeks + label section aktif di atas, jam di bawah. Sisanya
**kosong setinggi layar** — dan ruang kosong sebesar itu bukan "minimalis", itu
kolom yang belum diisi.

Sekarang isinya peta: satu titik per section, dihubungkan garis vertikal yang
berhenti **tepat di titik** section yang sedang aktif. Titik yang sudah
dilewati terisi, titik aktif diberi labelnya, sisanya kosong.

| | Sebelum | Sesudah |
|---|---|---|
| Isi kolom | 3 baris di dua ujung | 5 titik + garis |
| Posisi sekarang | label aktif di atas | ujung garis di titik yang aktif |
| Klik | tidak ada | **tetap tidak ada** — lihat catatan |

**Ujung garis = titik aktif, bukan persentase scroll.** Ini sempat salah dua
kali, dan dua-duanya kelihatan sama dari sisi pengguna — garis tidak sampai
ke dot yang menyala:

1. `scrollY / (scrollHeight - innerHeight)` — persen scroll dokumen dan jarak
   antar titik di rail adalah dua skala yang tidak berhubungan. Di detik
   section 02 sudah jadi aktif, ujungnya masih di dekat 01.
2. Interpolasi posisi scroll di antara titik — ujungnya benar secara
   geometris, tapi sambil membaca section 02 garis sudah merambat ke arah 03,
   jadi terlihat sudah mencapai titik yang belum dimasuki.

Yang benar: garis pindah dari titik ke titik mengikuti **state section
aktif**, dengan transisi 0,45s pada `height` supaya tidak terasa melompat.
Akibatnya **tidak ada listener scroll sama sekali** di `rail.js` — tidak ada
yang perlu diukur per frame. Diuji di sembilan posisi scroll: selisih ujung
garis ke titik aktif **0px di semua posisi**.

Tiga jebakan geometri yang harus diperbaiki di CSS:

- **`.rail` harus `flex-direction: column`.** `display: flex` baru aktif di
  breakpoint 1024px, dan tanpa arah eksplisit hasilnya **row**: peta dan jam
  jadi dua kolom berdampingan, jam muncul di samping peta di tengah layar
  bukan di bawahnya. Geometri map tetap benar semua — tidak ada yang gagal
  diam-diam, cuma posisinya salah. Ukuran `.rail__foot` sudah diukur ulang:
  di 1024/1440/1920 selalu menempel 24px dari tepi bawah,bewajar dari peta,
  dan tidak pernah menabrak label `05`.
- **Garis harus membentang titik pertama → titik terakhir**, bukan atas map →
  bawah map. Peta 480px tapi titiknya hanya menempati 10..452px; kalau
  dipetakan ke 100% tinggi map, ujungnya selalu melewati titik aktif ~38px.
  Tinggi tiap bagian dihitung sekali sebagai custom property
  (`--dot`, `--row-h`, `--step-h`, `--line-top`, `--line-bottom`) supaya
  tidak ada angka yang harus dicocokkan tangan.
- **Peta harus `flex: 1`**, bukan cuma `max-height`. Tanpa itu tingginya sama
  dengan isi (±220px), jadi `space-between` tidak punya ruang untuk dibagi dan
  titiknya duduk berhimpitan di atas — ruang kosongnya dipindah, bukan
  dihilangkan. Batasnya dalam rem, bukan persen: persen butuh tinggi induk
  yang definite, dan `.rail__nav` adalah flex item.

**Titiknya sengaja tidak bisa diklik.** Rail adalah penanda posisi, bukan
navigasi: navbar sudah menyediakan tautan ke tiap section, dan menambah
tautan kedua di kolom selebar 128px hanya mengulang hal yang sama — plus
melompat halaman karena tidak ada yang meminta. Verifikasi: nol `<a>`, nol
`<button>`, nol `tabindex`, `aria-hidden="true"`, dan 8× `Tab` dari atas tidak
pernah menyentuh rail. Membranesai titik, nomor, maupun label tidak mengubah
`scrollY` maupun `hash`.

Sumber kebenaran tetap `<section data-index>`, **bukan** daftar di
`index.html`. Daftar itu ditulis manual supaya tidak berkedip saat
*hydration* dan tetap berguna tanpa JavaScript — `rail.js` membangun ulang
dari section asli, dan memberi peringatan di konsol kalau jumlahnya tidak
cocok, supaya penambahan section tidak diam-diam membuat rail basi.

Terverifikasi: 132/132 elemen lolos AA di kedua tema, nol overflow, nol error
konsol, rail tersembunyi di mobile, dan tanpa JavaScript daftar 5 titiknya
tetap tampil.

#### Cara mengaudit ulang

Token di atas menjelaskan asal-usulnya, tapi angka statis tidak menangkap
opacity leluhur, gradasi, atau warna turunan. Audit di browser mengukur
setiap elemen teks sungguhan:

```js
// Tempel di konsol, ganti tema, lalu scroll seluruh halaman agar
// reveal animation tidak menyisakan elemen pada opacity 0.
const lin = c => (c/=255, c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4);
const lum = ([r,g,b]) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)]; return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
// untuk tiap elemen teks: ambil computed color, naiki leluhur sampai
// ketemu background-color pertama yang tidak transparan, kalikan opacity
// leluhur, lalu bandingkan. Ambil 4,5:1 untuk teks kecil, 3:1 untuk
// teks >= 24px (atau >= 18,66px bold).
```

Dua kegagalan yang hanya ketahuan oleh cara ini, bukan dari membaca token:

- **Label mockup project.** `<text class="bl-t">` di SVG mockup memakai
  `currentColor` dengan `opacity: .5`. Di tema gelap itu aman (4,8:1), di tema
  terang hanya **3,3:1** — teks gelap transparan di atas latar terang.
  Opasitasnya dinaikkan ke 0,62, yang menutupi paper/surface/surface-2 di
  kedua tema. Font-size-nya juga dinaikkan 9 → 12 user unit, karena viewBox
  800 dirender ~686px (skala 0,86) sehingga 9px hanya jadi **7,7px** di layar.
- Label yang sama juga tidak boleh meluber dari frame; diperiksa dengan
  `getBBox()` terhadap `viewBox`, hasilnya nol yang meluber.

---

## Menambah project baru

Strukturnya sudah gallery: tambah satu entri di `projects` dan satu blok
teks di `text.id` + `text.en`.

1. Di `data.js` → `projects`, tambahkan
   `{ index: '02', mockup: '…', layout: 'wide' | 'narrow' }`
2. Di `text.id.projects.items['02']` dan `text.en.projects.items['02']`, isi
   `title`, `category`, `description`, `uses`, `how`, `tags`
3. `uses` dan `how` itu dua daftar terpisah: **dipakai untuk apa** dan
   **bagaimana kerjanya**. Dua pertanyaan berbeda; digabung jadi satu
   paragraf, teksnya tumbuh jadi blok padat yang tidak pernah dibaca habis
4. Badge status: `status: 'development'` di shellnya, lalu isi
   `text.*.projects.development`. Kosongkan `status` kalau proyeknya selesai
   dan tidak perlu ada catatan apa pun
5. `linkHref`: isi URL kalau projectnya punya halaman publik. Kosongkan
   kalau tidak — tombolnya lalu tidak dirender sama sekali
6. Ingat: `title`, `category`, `description`, `uses`, `how`, dan `tags` ada
   **dua kali** — blok `id` dan `en`

`mockup` memilih varian SVG di `components/mockup.js`. Yang tersedia:
`portfolio`, `hotel`, `ui`, `extension`, `newtab`.

| Varian | Menggambar | Dipakai |
|---|---|---|
| `extension` | Google Form, tombol yang disuntik, panel Riwayat/Pengaturan | Form Solver |
| `newtab` | Chevron, panel cari, rail tab tepi kiri, deretan kartu | RAZOR |

Kedua variannya sengaja tidak bisa ditukar. `extension` menggambarkan **halaman
di dalam form**, `newtab` menggambarkan **layar tab baru** yang seluruh UI-nya
cuma satu glyph. Memakai `extension` untuk keduanya akan membuat dua proyek
terlihat sama padahal produknya tidak sama sekali.

Untuk memakai screenshot asli, buat file di `assets/`, lalu di
`projects.js` ganti `media.innerHTML = mockupSvg(…)` dengan elemen `<img>`
(`loading="lazy"` + `width`/`height` supaya tidak ada layout shift).

### Yang sengaja tidak ada di Form Solver

Tidak ada tombol **Submit** di mockupnya, dan tidak ada `linkHref`. Keduanya
bukan kelalaian: Submit di proyek aslinya manual (sudah diverifikasi — tidak
ada satu pun pemanggilan `.submit()` di seluruh kode), dan extension-nya
dimuat lokal sehingga tidak punya URL. Mockup yang menunjukkan submit
otomatis akan berbohong, dan tombol yang terlihat bisa diklik tapi tidak
menuju ke mana pun lebih buruk daripada tidak ada tombolnya.

---

## Mengatur bahasa

Pemilih `ID | EN` ada di navbar, di sebelah tombol tema. Pilihan disimpan
di `localStorage`, jadi tetap sama setelah reload.

Cara kerjanya: teks Bahasa Indonesia **tetap ada di `index.html`**.
JavaScript hanya menulis ulang teks itu kalau pengguna memilih Inggris.
Alasannya:

- tidak ada kedipan (FOUC), tidak perlu render ulang
- mesin pencari tetap membaca isi lengkap dari HTML
- tanpa JavaScript, situs tetap tampil utuh dalam Bahasa Indonesia

Ketika bahasa diganti, komponen yang dibangun dari data (proyek,
perjalanan, social footer) dirender ulang dan seluruh animasi scroll
dipasang ulang dari nol — lebih sederhana dan bebas bug dibanding
menambal trigger satu per satu.

Bahasa aktif ikut adjusting `<html lang>`, `<title>`, dan meta
deskripsi, supaya mesin pencari dan pembaca layar ikut benar.

### Menambah bahasa ketiga

```js
// data.js
export const LANGS = ['id', 'en', 'jp'];
```

Lalu salin blok `en` di `text` menjadi blok `jp`. Tidak perlu menyentuh
kode lain.

---

## Mengatur animasi

Semua nyala/matinya motion terkumpul di satu tempat:
`motionProfile` di `src/scripts/data.js`.

```js
enabled: true,          // master switch
useTextSplit: true,     // pemecah judul (GSAP SplitText)
customCursor: true,     // kursor kustom (hanya pointer fine)
magnetic: true,         // tombol magnetik
parallax: true,         // parallax mockup project
heroMotion: true,       // grafik orbit di kanan hero + gerak ambientnya
```

### Grafik orbit di hero (`components/heroMotion.js`)

Tiga lapis berputar berlawanan arah, satu denyut di pusat, dan satu napas
sangat lambat pada seluruh gambar.

| Lapis | Periode | Kecepatan |
|---|---|---|
| Cincin 60 tick (setiap ke-6 aksen) | 48s | 7,5°/detik |
| Cincin putus-putus + titik aksen | 24s | 15°/detik |
| Dua busur dalam | 16s, arah berlawanan | 22,5°/detik |

**Kecepatan 48 detik itu bukan bulat.** Tick major berjarak 36°, jadi di
kecepatan lama (150 detik = 2,5°/detik) pola aksennya baru maju satu tik
setiap 14 detik — mata membaca itu sebagai diam, bukan sebagai putaran
lambat. 48 detik sama dengan kecepatan jarum detik jam, dan itu persis
benda yang ditirukan modul ini. `ease: 'none'` di semua lapisan, dan tidak
boleh di-ease: putaran loop yang di-ease berdenyut, cepat di satu titik dan
lambat di titik berikutnya, selamanya.

Dua hal lain yang dipegang modul ini:

- **Loop dijeda saat keluar layar.** `IntersectionObserver` pause/resume
  semua tween ambient-nya. Loop yang tak terlihat tetap membakar frame.
- **Napas 11 detik** (scale 1 → 1,02, `sine.inOut`, yoyo) supaya gambar
  tidak pernah benar-benar diam, tapi juga tidak terasa denyut.

Mengatur `enabled: false` membuat situs diam total, tapi seluruh konten
tetap tampil dan bisa dipakai.

### Menghormati reduced motion

Arahkan ke **Settings → Accessibility → Visual → Animation** (Windows) atau
**System Settings → Accessibility → Display → Reduce motion** (macOS), lalu
reload. Timeline, parallax, kursor, serta tombol magnetik mati otomatis,
sementara isi halaman tetap utuh. Layar muat tetap muncul, tapi hanya
diam lalu memudar.

Yang **tetap** jalan walau reduced motion aktif: penanda posisi di navbar dan
margin rail. Garis bawah pada link navbar adalah penanda posisi pengguna,
bukan dekorasi — sama seperti `aria-current` yang tetap ada walau tidak ada
transisi.

---

## Layar muat

Konsepnya **lembar kerja cetak yang sedang disiapkan**: registration mark
menahan keempat sudut layar, wordmark diset huruf demi huruf dari balik
baseline, dan satu garis rambut jadi baseline tempat progres berjalan.

```
┌ ─                                        ─ ┐   ← registration mark
│
│   04 / 05 │ MENGAMBIL ASET                    ← readout: tahap + pekerjaan
│   Firmansyah
│   ────────────────────────────────────  62%  ← baseline + progres
│
└ ─                                        ─ ┘
```

**Dua tahap, dan tidak ada tombol.** Progres mencapai 100%, lalu halaman
terbuka sendiri. Versi lama punya gerbang "Masuk" yang WAJIB diklik; itu
sudah dibuang — satu langkah yang tidak ada gunanya kalau tidak ada yang
dimuat.

### Tahap 1 · Muat — sekitar 2,6 detik

Progresnya **nyata**, bukan angka yang dianimasi. Yang dicatat adalah lima
kejadian yang benar-benar terjadi, dengan bobot yang menyatakan seberapa
penting masing-masing:

| # | Kejadian | Bobot | Kapan |
|---|---|---|---|
| 01 | `dom` | 8% | document sudah diurai |
| 02 | `layout` | 12% | gaya sudah berlaku, tinggi bisa diukur |
| 03 | `fonts` | 25% | `document.fonts.ready` |
| 04 | `load` | 20% | `window.load` |
| 05 | `intro` | 35% | animasi pembuka selesai |

Yang **tidak** dicatat adalah waktu. Tidak ada durasi yang dipilih agar bar
terlihat bergerak: versi lama mengisi bar selama tiga detik tetap, padahal
di `localhost` semuanya selesai dalam ~130ms, jadi angkanya tidak pernah
berarti apa pun selain "berapa lama kita sengaja menunggu sebelum dibolehkan
masuk". Bar sekarang hanya bergerak karena ada pekerjaan yang selesai, dan
persentase di ujung kanan selalu berarti hal yang sama: *seberapa banyak
pekerjaan yang sudah beres*.

`MIN_SECONDS` (2,2 detik) di `loader.js` bukan durasi, melainkan **lantai**:
progres boleh lebih lambat dari lantai itu kalau ada yang belum beres, tapi
tidak boleh lebih cepat. Dan 2,2 detik itu bukan angka yang enak dipilih —
animasi pembuka berakhir di 1,1 detik, jadi lantai yang lebih pendek akan
membuat bar penuh sementara hurufnya masih naik. Bar penuh sementara ada
yang bergerak terbaca bukan "hampir selesai", tapi "ada yang lupa jalan".

Gunanya yang lain: halaman yang siap dalam 130ms tetap sempat menampilkan
seluruh urutan (mark → huruf → bar penuh → "Siap"), jadi yang ditonton orang
adalah satu kalimat visual yang utuh, bukan kedipan yang hilang sebelum sempat
dibaca. Sisa 1,1 detik dipakai bar untuk menyapu 35% terakhir — huruf sudah
terpasang, lalu mesinnya jalan. 3 detik versi lama tidak bisa dibenarkan
dengan alasan yang sama: di 3 detik, "sedang memuat" sudah tidak benar karena
tidak ada apa pun yang sedang dimuat.

| | reduce motion | normal |
|---|---|---|
| Registration mark | tampil apa adanya | tumbuh dari ujung luar ke sudut, 0,5s |
| Wordmark | tampil apa adanya | naik dari mask, stagger 0,038s |
| Bar + angka | 0 → 100% selama 2,2s | sama |
| Keluar | fade 0,18s | lembar turun 0,58s + garis menyusut 0,3s |

Total dari paint pertama sampai konten terlihat: **± 3,3 detik.**

#### Angkanya dua irama, dan keduanya penting

Nilai ini sempat salah sekali, jadi alasannya ditulis di sini.

**Nomor langkah jalan dengan irama tetap, bukan mengikuti kecepatan
kejadiannya.** Empat dari lima kejadian selesai dalam ~0,1 detik kalau
semuanya sudah cached. Kalau labelnya mengikuti kecepatan itu, ia menembak
01 → 04 dalam sepersekian detik lalu **diam di "04"** selama hampir seluruh
sisa waktu — persis yang terjadi pada versi pertama loader ini, dan itu
terbaca bukan sebagai "mesin bekerja", tapi sebagai "layarnya nyangkut".

Jadi urutannya dibalik: `pump` berjalan setiap `min / 6` detik (≈ 0,37s), dan
sebuah label hanya **boleh** tampil kalau kejadiannya benar-benar sudah
selesai. Di cache panas, nomornya berjalan 01 → 05 dengan jarak sama rata.
Di koneksi lambat, nomornya menahan diri — karena ia tidak akan pernah
menampilkan pekerjaan yang belum terjadi.

**Angka persen di-sample, bar-nya tidak.** Bar mengisi 0 → 100% dalam 2,2
detik, jadi satu persen datang setiap ~22ms — satu digit per frame. Angka
yang bergerak secepat itu tidak dibaca siapa pun; yang tersisa cuma kedipan
di tepi kanan. Jadi angkanya ditahan di kelipatan `PCT_STEP` (5%), satu
perubahan per ~0,11 detik. Karena selalu `floor`, angkanya tidak pernah lebih
besar dari bar — jadi tidak pernah bergerak lebih cepat dari pekerjaannya,
hanya tertinggal maksimal 4%. Bar-nya sendiri tetap mulus: bentuk yang
bergerak cepat tidak mengganggu, teks yang bergerak cepat tidak terbaca.

Bar dikejar dengan laju tetap (`CATCH_RATE`, 2,6 fraksi/detik ≈ 0,38s dari
0 ke 100%), bukan `ease`. Alasannya sama seperti versi lamanya: bar yang
dipercepat lalu melambat di ujung berbohong soal jarak waktu, dan yang ini
hanya mengejar angka yang memang sudah terjadi. Lajunya dibuat rata
terhadap waktu (`dt` dihitung dari `performance.now()`), jadi bergerak sama
di 60Hz maupun 120Hz.

Bar ditulis langsung ke `style.transform` dari satu `requestAnimationFrame`,
**bukan** `gsap.to()` per kejadian. Ini bukan preferensi gaya: tween yang
dibuat ulang setiap frame tidak pernah sempat dirender, dan bar-nya diam di
0% sementara tween-nya terus dibuat ulang. Satu loop yang menulis transform
langsung lebih murah dan tidak punya jebakan itu. Bar dan angkanya membaca
satu nilai yang sama (`paint.v`), jadi tidak mungkin berbeda pendapat.

#### Kenapa angka persennya tetap dipertahankan

Track kosong (`--rule`, kontras 2,0:1) dan track penuh hampir tidak bisa
dibedakan di layar gelap, jadi tanpa angka tidak ada cara untuk tahu muat
sudah selesai atau belum. Detailnya tidak berubah dari versi lama:

- Bar dan angka menulis dari sumber yang sama, jadi selalu sama di frame
  yang sama.
- `width: 4ch` + `tnum` + rata kanan: ruangnya dipesan selebar "100%" sejak
  frame pertama, jadi ujung kanan bar tidak bergerak saat angka naik dari
  "9%" ke "100%". Bar yang bergeser sambil diukur adalah bar yang tidak
  bisa diukur.
- Saat penuh, angka dikunci ke `100%` **dan** warnanya naik `--ink-3` →
  `--ink`. Perubahan warna itulah yang membuat "selesai" terasa sebagai
  peristiwa.

#### Reduce motion: geraknya dipangkas, waktunya tidak

Ditemukan lewat laporan pengguna: "pas refresh langsung 100% dengan cepat".
Penyebabnya bukan waktunya, tapi jalurnya. Jadi perbedaannya dipindah ke
*bentuk* gerak, bukan ke lamanya:

Layar muat menutupi seluruh halaman, jadi melewatiinya tanpa penanda
membuat halaman melompat dari kosong jadi berisi. Sebaliknya, gerakannya
justru yang mengganggu. Bar progres 2px yang mendatar tidak memicu
gangguan vestibular — yang memicu adalah gerakan besar, mendadak, dan di
luar ekspektasi. Menghapus bar justru lebih buruk: itu menghapus satu-satunya
informasi yang jujur di layar ini.

### Tahap 2 · Keluar — lembar turun, garis tertinggal

Tiga babak, tanpa overshoot, sesuai archetype Premium yang dipakai seluruh
situs ini:

```
1. BERSIH  0 → 0,22    readout, wordmark, angka, dan mark memudar
2. TURUN   0,14 → 0,72 lembar turun setinggi dirinya sendiri, keluar tanpa sisa
3. JATUH   0,28 → 0,58 isian aksen menyusut ke tengah dan memudar
```

Arah **turun** dipilih supaya halaman tersingkap dari atas ke bawah, sama
seperti urutan kaskade pembuka hero. Kalau lembar terangkat, bagian bawah
halaman yang terlihat lebih dulu, navbar selesai beranimasi di belakang
kertas, dan yang ditonton orang hanya halaman yang sudah diam. Karena itu
pembuka hero ditahan sampai `ENTER_BEAT.reveal`.

Isian aksen (yang 2px warnanya `--accent`) **dilepas dari track-nya** di detik
yang sama: dari anak `.loader__fill` yang ikut lembar turun, menjadi elemen
`fixed` yang berdiri sendiri di posisi track yang sama. Setelah lembar lewat,
meninggalkan baris 2px di atas halaman yang sudah terbuka, lalu baris itu
menyusut ke tengah dan hilang. Kotaknya diukur dan dipindahkan di detik yang sama,
jadi tidak ada layout shift di antara keduanya.

Acaranya hanya GSAP: `clipPath` dihindari karena memaksa repaint, dan
`top`/`left`/`width` dihindari karena memicu layout tiap frame — yang berubah
hanya `transform` dan `opacity`.

### Kalau JavaScript gagal

Tiga lapis jaring pengaman:

| Lapis | Pemicu | Batas |
|---|---|---|
| CSS `loader-failsafe` | JavaScript tidak pernah jalan sama sekali | 3,2 detik |
| `armLoader()` | modul JS hidup, wewenang pindah dari CSS ke JS | 9 detik + `?loader=` |
| Pager transisi | Tween GSAP nyangkut | 5 detik |

Default muat ~2,6 detik jauh di bawah 9 detik, jadi jaring pengaman punya
ruang yang lega.

Lapis pertama dan kedua saling menggantikan, tidak menumpuk: begitu
`armLoader()` berjalan, animasi CSS dimatikan **dan** latar `.loader`
disterilkan. Kalau latar itu tidak hilang, lembar yang turun akan
memperlihatkan dirinya sendiri sebagai kertas yang berhenti di tengah layar.

`armLoader()` juga memasang `inert` pada `#nav`, `#main`, dan `.footer`,
supaya pembaca layar tidak membaca seluruh beranda di belakang layar muat.
Yang memberitahu halaman sudah terbuka adalah live region di
`.loader__status` — makanya fokus **tidak** dipindahkan: memindahkan fokus
tanpa diminta akan mengulang pengumuman yang barusan sudah dibacakan.

Pager `armLoader()` menambah durasi `?loader=` ke anggarannya. Tanpa itu,
`?loader=20` akan dibunuh pager 9 detik di tengah jalan: bar masih naik,
lalu layarnya hilang tanpa sempat selesai. Pager menangkap "macet", bukan
"sedang sengaja lambat".

Setiap kejadian juga punya batas waktu sendiri (`timeout` di `STEPS`), jadi
satu aset yang tidak pernah tiba tidak akan menggantung layar: tahap itu
dihitung selesai dengan timbangannya sendiri, karena progres yang macet bukan
informasi.

Aturan global `prefers-reduced-motion` di `base.css` biasanya mematikan
seluruh animasi dalam 0,001ms. Jaring pengaman CSS **kecualiannya** — kalau
ikut dimatikan, layar akan `visibility: hidden` sejak frame pertama, dan
justru membuat halaman tidak bisa dibuka kalau JS-nya benar-benar gagal.

Menunggu font dibatasi maksimum **2,2 detik** (lihat `withTimeout` di
`main.js`). Kalau CDN font lambat, halaman tidak ikut tertahan — ia lanjut
pakai font cadangan.

### Cara melihatnya

Di `localhost` semuanya dimuat dalam ~130ms, jadi layar muat cuma ~
3,3 detik dan gampang terlewat. Buka DevTools → **Network** → **Slow 3G**,
lalu refresh.

Parametrik untuk pratinjau:

| Parameter | Fungsi |
|---|---|
| `?motion=off` | abaikan reduce motion, paksa semua animasi jalan |
| `?motion=on` | paksa mode reduced motion (untuk menguji jalur aksesibel) |
| `?loader=5` | naikkan lantai muat ke 5 detik, untuk review desain |
| `?loader=hold` | sama seperti `?loader=5` |
| `?intro=off` | lewati layar muat, langsung ke konten |

`?loader=N` **menaikkan** lantai, bukan menggantinya: progres tetap dibatasi
oleh pekerjaan yang benar-benar selesai, tapi tidak boleh bergerak lebih
cepat dari N detik. Itulah yang membuatnya berguna untuk review, saat kamu
tidak ingin menunggu CDN yang lambat.

`?intro=off` sengaja terpisah dari `?motion=off`. Keduanya soal gerak,
sedangkan melewati layar muat adalah soal alur halaman — mencampurkannya
berarti "matikan animasi" diam-diam ikut menghapus langkah yang harus dilewati.

> **Headless Chrome selalu `prefers-reduced-motion: reduce`.** Kalau
> menguji dengan browser tanpa UI, semua yang terlihat hanya jalur
> reduced motion. Pakai `?motion=off` supaya jalur normalnya yang
> diuji.

Perilaku default tidak berubah sama sekali — semua parameter hanya dibaca
kalau diketik. Kodenya ada di `src/scripts/utils/preview.js`.

### Reduced motion

Layar muat **tetap muncul** walau `prefers-reduced-motion` aktif, tapi
tanpa gerakan apa pun: wordmark dan registration mark tampil apa adanya,
dan yang tetap bergerak cuma bar beserta angkanya. Keluar dengan fade
pendek 0,18s.


---

## Keterangan teknis

> **`components/dial.js` tidak dipakai apa pun.** Sempat dipasang sebagai
> cincin tick yang berputar di tengah layar muat, lalu dicabut: dial memenuhi
> layar gerbang masuk dan menutupi komposisi yang seharusnya tenang.
>
> Berkasnya sengaja **tidak dihapus** supaya tidak hilang — tapi tidak ada
> modul yang meng-`import`-nya, dan tidak ada markup-nya di `index.html`.
> Kalau memang tidak akan dipakai, hapus berkasnya juga.
>
> Kalau mau memakainya di section lain (bukan di layar muat), salin SVG-nya
> dari riwayat, lalu panggil `initDial(scope)` sekali di awal, dan
> `setDialProgress(v)` mengikuti progres.

**Font** — Archivo (variable, `wght` 300–700) dan JetBrains Mono (variable,
`wght` 400–500), self-host dari subset latin Google Fonts, total sekitar 65 KB.
Tanpa request ke pihak ketiga.

> **Kalau suatu saat teks mono terlihat "bolong-bolong"** — huruf-huruf
> tampil dengan lebar berbeda-beda, atau satu huruf terlihat beda dari
> sekawannya di tengah kata — itu bukan bug CSS, itu tanda subset font-nya
> rusak: karakter yang tidak ada di cmap akan jatuh ke font cadangan sistem,
> jadi lebarnya beda dari tetangganya yang asli.
>
> Contoh yang pernah terjadi di sini: `jetbrains-mono-latin.woff2` berukuran
> 5,8 KB dan **hanya punya 2 karakter ASCII** — `U+0020` (spasi) dan
> `U+0041` ('A'). Sisanya hilang semua; yang "tersisa" cuma huruf Vietnam dan
> diakritik. `document.fonts` tetap melaporkan status `loaded` karena berkasnya
> memang valid, hanya isinya tidak lengkap — jadi tidak ada error di konsol
> yang bisa memperingatkan, dan huruf yang hilang hanya diam-diam dirender
> memakai font sistem.
>
> Cara memastikan:
>
> ```bash
> python -c "from fontTools.ttLib import TTFont; \
>   cm=TTFont('assets/fonts/jetbrains-mono-latin.woff2').getBestCmap(); \
>   print(len([c for c in cm if 0x20<=c<=0x7E]), 'dari 95')"
> ```
>
> Jawaban yang benar: `95 dari 95`. Untuk font monospace, semua karakter ASCII
> juga harus punya advance width yang sama — cek dengan
> `set(f['hmtx'][g][0] for cp,g in cm.items() if 0x20<=cp<=0x7E)`, hasilnya
> harus satu nilai saja.
>
> Pelajaran: jangan pernah memangkas font lebih dulu lalu menyalin berkasnya
> ke `assets/`. Subset yang rusak lebih buruk daripada tidak punya font sama
> sekali, karena ia terlihat "nyata" sampai ada yang mengukurnya.

**GSAP** — dimuat dari jsDelivr dengan versi dikunci (`3.15.0`) lewat
`<script defer>`, lalu diekspos ke modul ES lewat `animations/gsap.js`.
Kalau CDN diblokir, situs tetap berfungsi: konten tampil normal, hanya
animasi yang dilewati.

**Kursor kustom** — hanya aktif di perangkat dengan tetikus
(`pointer: fine` + `hover: hover`). Di layar sentuh, kursor asli dibiarkan
agar penanda fokus tidak hilang.

**Aksesibilitas** — skip link, hierarki heading berurutan, focus ring yang
selalu terlihat, target sentuh minimal 44px, focus trap plus tombol `Escape`
pada menu mobile, `aria-current` pada link navigasi aktif, `aria-pressed`
pada pemilih bahasa, dan penghormatan `prefers-reduced-motion`.

**Performa** — tanpa runtime framework. Total sekitar 45 KB JavaScript
(compresif) dan 8 KB CSS. Semua animasi hanya memakai `transform` dan
`opacity`, sehingga tidak memicu layout ulang.

---

## Browser yang didukung

Chrome, Edge, Firefox, dan Safari versi terkini. Memakai `color-mix()`,
`:focus-visible`, `aspect` fleksibel, dan `dvh` — semuanya sudah tersedia
di browser sejak 2022–2023.
