/**
 * ══════════════════════════════════════════════════════════════
 *  DATA — satu-satunya file yang perlu kamu edit.
 *
 *  Struktur bahasa:
 *   - `text`   → semua teks, dikelompokkan per bahasa
 *   - `projects` / `journey` / `contacts`
 *                → bagian yang TIDAK berubah antar bahasa
 *                → teksnya diambil dari `text[lang]`, dicocokkan
 *                  dengan kunci yang stabil (nomor project / tahun)
 *
 *  Menambah bahasa: tambah kodenya ke `LANGS`, lalu salin blok `en`
 *  di bawah dan ganti isinya.
 * ══════════════════════════════════════════════════════════════
 * @module data
 */

/** @typedef {'id'|'en'} Lang */

/** Kode bahasa yang tersedia. */
export const LANGS = /** @type {const} */ (['id', 'en']);

/** Bahasa yang dipakai kalau belum ada pilihan tersimpan. */
export const DEFAULT_LANG = /** @type {Lang} */ ('id');

/* ─────────────────────────────────────────────────────────────
   IDENTITAS
   ───────────────────────────────────────────────────────────── */

export const identity = {
  /** Nama yang dipakai untuk branding (title, navbar, loader, footer). */
  name: 'Firmansyah',
  /** Nama lengkap — dipakai di prosa About dan meta tag. */
  fullName: 'Firmansyah Al Jaelani',
  school: 'SMK Wikrama Bogor',
  grade: '11',
  city: 'Bogor, Indonesia',
  timezone: 'Asia/Jakarta',
  timezoneLabel: 'WIB',
};

/* ─────────────────────────────────────────────────────────────
   PROYEK & PERJALANAN
   Hanya bagian yang tidak perlu diterjemahkan. Teksnya diambil
   dari `text[lang]` memakai kunci `index` / `year` di bawah.
   ───────────────────────────────────────────────────────────── */

/**
 * @typedef {Object} ProjectShell
 * @property {string} index   Kunci pencocok teks, mis. '01'
 * @property {'portfolio'|'hotel'|'ui'|'extension'|'newtab'} mockup
 * @property {'wide'|'narrow'} layout
 * @property {string} [status]  Kunci badge status di `projects.*`, mis.
 *   'development'. Kosongkan kalau proyeknya sudah selesai dan tidak perlu
 *   ada catatan apa pun.
 * @property {string} [linkHref]  Kosongkan kalau proyeknya tidak punya
 *   URL publik — tombolnya lalu disembunyikan, bukan dibuat jadi tautan mati.
 */

/**
/**
 * Hanya Form Solver yang punya `linkHref`: repo-nya sudah dipublikasikan di
 * GitHub, jadi orang bisa langsung mengklona dan mencobanya sendiri. RAZOR
 * masih kosong — kalau diisi dengan URL yang tidak benar, tombolnya akan
 * terlihat bisa diklik tapi tidak menuju ke mana pun.
 *
 * Kalau RAZOR nanti dipublikasi (web store, repo), isi `linkHref` dengan URL
 * aslinya dan tombolnya akan muncul otomatis.
 *
 * Dua layout berbeda bukan hiasan: `wide` memberi mockup 7 kolom dan teks 5,
 * `narrow` membalik proporsinya. Dengan dua proyek, daftar jadi punya ritme
 * instead of dua blok yang sama persis.
 * @type {ProjectShell[]}
 */
export const projects = [
  { index: '01', mockup: 'extension', layout: 'wide', linkHref: 'https://github.com/RAZOR-zor/Formsolver' },
  { index: '02', mockup: 'newtab', layout: 'narrow', status: 'development' },
];

/**
 * @typedef {Object} JourneyShell
 * @property {string} year
 */

/** Kunci `year` harus sama dengan `text[lang].journey.items`. @type {JourneyShell[]} */
export const journey = [{ year: '2025-smk' }, { year: '2025-teknologi' }, { year: '2026' }, { year: 'Sekarang' }];

/**
 * @typedef {Object} CertificateShell
 * @property {string} key      Kunci pencocok teks, mis. 'ibm-skillsbuild'
 * @property {string} src      Path gambar di `assets/certificates/`
 * @property {number} width    Lebar asli gambar
 * @property {number} height   Tinggi asli gambar
 *
 * `width`/`height` dipakai sebagai atribut `<img>` supaya browser me-reserve
 * ruang sebelum gambar selesai diunduh — tanpa itu, setiap sertifikat
 * mendorong section ke bawah saat memuat. Keduanya WAJIB sama dengan
 * berkas, dan TIDAK boleh diseragamkan: asli IBM 1200×742 (sudah dipotong
 * whitespace-nya) dan Code.org 1200×848, jadi keduanya tidak bisa dipaksa
 * satu rasio tanpa membuat salah satunya gepeng atau melar.
 */

/**
 * Sertifikat. Teksnya di `text[lang].certificates.items[key]`.
 *
 * `src` memakai nama yang bisa dibaca orang, bukan nama file asli dari
 * situs penerbit. File Code.org aslinya bernama hash base64
 * (`eyJuYW1lIjoiRmlybWFuc3lhaCIs…`), yang isinya JSON
 * `{"name":"Firmansyah Al jaelani","course":"pre-express-2025"}` — itu
 * metadata untuk menautkan unduhan ke akun penerbit, bukan nama berkas.
 * Menyalinnya ke `assets/` tanpa diganti akan membuat file tidak bisa
 * dicari, dan `alt`/SEO-nya ikut terbaca apa adanya.
 *
 * @type {CertificateShell[]}
 */
export const certificates = [
  {
    key: 'ibm-skillsbuild-fundamentals',
    src: 'assets/certificates/ibm-skillsbuild-ai-fundamentals.jpg',
    width: 1200,
    height: 746,
  },
  {
    key: 'ibm-skillsbuild',
    src: 'assets/certificates/ibm-skillsbuild-ai-literacy.jpg',
    width: 1200,
    height: 742,
  },
  {
    key: 'code-org',
    src: 'assets/certificates/code-org-pre-express.jpg',
    width: 1200,
    height: 848,
  },
  {
    key: 'wadhwani-speaking-listening',
    src: 'assets/certificates/wadhwani-speaking-listening-en-us.jpg',
    width: 1200,
    height: 850,
  },
  {
    key: 'wadhwani-writing',
    src: 'assets/certificates/wadhwani-writing-en-us.jpg',
    width: 1200,
    height: 850,
  },
];

/* Kontak SENGAJA dikosongkan.

   Alasannya bukan belum sempat diisi, tapi memang belum ada kontak yang
   mau dipublikasikan. GitHub sudah ada tapi masih kosong, dan menautkan
   akun kosong terlihat seperti tautan mati.

   `contacts` dibiarkan ada (dan kosong) supaya `components/contact.js`
   tidak perlu diubah kalau nanti diisi lagi: begitu ada isinya, link
   `data-contact="email"` langsung hidup tanpa menyentuh kode lain.

   Jangan diisi dengan data placeholder. Tautan yang terlihat bisa diklik
   tapi tidak menuju ke mana pun lebih buruk daripada tidak ada tautan
   sama sekali. */
export const contacts = [];


/* ─────────────────────────────────────────────────────────────
   TEKS SITUS
   ───────────────────────────────────────────────────────────── */

/** @type {Record<Lang, Record<string, any>>} */
export const text = {
  id: {
    meta: {
      title: 'Firmansyah',
      description:
        'Portofolio Firmansyah Al Jaelani, siswa kelas 11 SMK Wikrama Bogor jurusan Perhotelan yang tertarik pada teknologi, web, dan desain.',
    },
    skip: 'Lewati ke konten utama',
    themeLabel: 'Ganti tema terang dan gelap',
    burgerOpen: 'Buka menu',
    burgerClose: 'Tutup menu',
    langLabel: 'Ganti bahasa',

    /**
     * Layar muat. Key-nya adalah nama kejadian yang benar-benar
     * terjadi, bukan nama tahap animasi — urutan label di layar ikut
     * dengan urutan bobotnya di `components/loader.js`.
     * `ready` dipakai setelah 100%, jadi tidak punya bobot.
     */
    loader: {
      dom: 'Menyusun halaman',
      layout: 'Menyusun tata letak',
      fonts: 'Memuat typeface',
      load: 'Mengambil aset',
      intro: 'Mengatur huruf',
      ready: 'Siap',
    },

    /** Label section untuk margin rail dan navbar. */
    sections: {
      hero: 'Beranda',
      tentang: 'Tentang',
      keahlian: 'Keahlian',
      proyek: 'Proyek',
      sertifikat: 'Sertifikat',
      perjalanan: 'Perjalanan',
    },

    nav: {
      home: 'Beranda',
      about: 'Tentang',
      skills: 'Keahlian',
      projects: 'Proyek',
      certificates: 'Sertifikat',
      journey: 'Perjalanan',
    },

    hero: {
      eyebrow: '',
      /* memakai <br> — lihat catatan di i18n.js soal data-i18n-html */
      title: 'Halo, saya<br />Firmansyah.',
      sub: 'Siswa Perhotelan · Pembelajar Kreatif · Antarik Web',
      desc: 'Teknologi saya pelajari di luar jam sekolah. Standar perhotelan saya pelajari di kelas.',
      ctaPrimary: 'Lihat Proyek',
      ctaSecondary: 'Tentang Saya',
      scroll: 'Gulir',
      scrollAria: 'Gulir ke bagian Tentang',
      facts: [
        { key: 'Berbasis di', val: 'Bogor, Indonesia' },
        { key: 'Sekolah', val: 'SMK Wikrama Bogor' },
        { key: 'Kelas', val: '11' },
        { key: 'Jurusan', val: 'Perhotelan' },
      ],
    },

    about: {
      eyebrow: '02 — Tentang',
      title: 'Tentang saya.',
      statement: 'Siswa perhotelan yang belajar web di luar jam sekolah.',
      p1: 'Perkenalkan, saya Firmansyah Al Jaelani. Saya siswa kelas 11 di SMK Wikrama Bogor, jurusan Perhotelan. Setelah lulus, target saya adalah bekerja di bidang perhotelan.',
      p2: 'Di sekolah saya belajar housekeeping, F&B service dan front office. Yang sudah saya kerjakan langsung: merapihkan kasur, tata letak alat makan di meja, dan latihan service tamu. Front office sendiri masih teori.',
      p3: 'Di luar jam sekolah saya belajar sendiri sejak 2025 — HTML, CSS, lalu JavaScript, sebagian besar dari YouTube dan dibantu AI. Dari situ saya membuat dua Chrome extension. Saya juga belajar keamanan jaringan dasar di jaringan milik saya sendiri: cara kerja access point, deauthentication, dan pemalsuan SSID.',
      marks: [
        { key: 'Sekolah', val: 'SMK Wikrama Bogor — Perhotelan' },
        { key: 'Praktik', val: 'Making bed · Tata letak alat makan' },
        { key: 'Mandiri', val: 'HTML, CSS, JavaScript, Node.js' },
      ],
    },

    skills: {
      eyebrow: '03 — Keahlian',
      title: 'Keahlian.',
      note: 'Apa yang benar-benar saya kerjakan, bukan daftar yang saya inginkan.',
      groups: [
        {
          title: 'Perhotelan',
          note: 'Dari praktik di sekolah.',
          tags: ['Making bed', 'Tata letak alat makan', 'Service Tamu', 'Front Office'],
        },
        {
          title: 'Web',
          note: 'Belajar sendiri sejak 2025, sebagian besar lewat YouTube dan dibantu AI.',
          tags: ['HTML', 'CSS', 'JavaScript', 'Chrome Extension', 'Manifest V3'],
        },
        {
          title: 'Tools',
          note: 'Linux untuk keamanan jaringan, plus yang saya pakai sehari-hari.',
          tags: ['Linux', 'WiFi Adapter', 'Windows', 'VS Code', 'Node.js'],
        },
      ],
    },

    projects: {
      eyebrow: '04 — Proyek',
      title: 'Proyek terpilih.',
      note: 'Keduanya masih saya kerjakan sendiri. Form Solver sudah ada di GitHub dan bisa langsung dicoba; RAZOR belum dipublikasikan.',
      concept: 'Konsep',
      development: 'Dalam pengembangan',
      use: 'Kegunaan',
      how: 'Fungsi',
      /** Kunci = `projects[].index` */
      items: {
        '01': {
          title: 'Form Solver',
          category: 'Chrome Extension · 2026',
          description:
            'Ekstensi Chrome (Manifest V3) untuk mengisi Google Form milik sendiri dengan bantuan AI. Membaca soal, tipe, dan pilihannya, lalu mengisi field satu per satu. Submit tetap manual. Tanpa framework, tanpa backend, tanpa dependensi.',
          uses: [
            'Menyusun latihan: satu form soal, diisi berulang tanpa mengetik ulang setiap jawaban.',
            'Menguji form baru sebelum dibagikan — memastikan soal, tipe, dan opsi dropdown-nya benar-benar jalan.',
            'Memindahkan jawaban dari form lama ke form yang baru, tanpa mengetik dari nol.',
          ],
          how: [
            'Membaca tiap soal beserta tipe dan opsinya, lalu mengisi field satu per satu dari atas ke bawah.',
            'Dropdown, radio, checkbox, dan teks semuanya diklik lewat UI sungguhan — bukan menulis nilai diam-diam ke dalam DOM.',
            'Submit tetap manual, jadi jawaban tetap Anda periksa sendiri sebelum dikirim.',
            'Hanya jalan di Google Form milik sendiri, dengan permission secukupnya. Tidak menyentuh password, cookie, atau token.',
          ],
          tags: ['Chrome Extension', 'Manifest V3', 'Shadow DOM', 'AI'],
          linkLabel: 'Buka di GitHub',
        },
        '02': {
          title: 'RAZOR',
          category: 'Chrome Extension · 2026',
          description:
            'Ekstensi Chrome (Manifest V3) yang mengganti tab baru dengan layar sendiri. Wallpaper, warna, dan nama bisa diatur sendiri; tekan Space atau klik kanan untuk melihat daftar ikon; Alt+S membuka pengaturan. Tanpa framework, tanpa backend. Masih dikerjakan: beberapa shortcut, ikon, dan detail belum rapi.',
          uses: [
            'Mengganti tab baru jadi layar sendiri: wallpaper, warna, dan nama bisa diatur sesuai selera.',
            'Melihat semua ikon situs dalam satu layar — tekan Space atau klik kanan, tidak perlu mencari bookmark.',
            'Mencari tanpa mouse: ketik apa saja di tab baru, pilih dari saran, tekan Enter.',
            'Melihat dan berpindah tab tanpa meninggalkan halaman yang sedang dibaca.',
          ],
          how: [
            'Space atau klik kanan untuk membuka daftar ikon. Mengetik huruf apa saja langsung membuka panel cari.',
            'Alt+S membuka pengaturan: tambah ikon, ganti warna, ganti tema dan wallpaper.',
            'Hampir semuanya bisa diganti sendiri — nama, logo, font, dan warna teks sampai warna chevron.',
            'Tanpa framework, tanpa backend. Semua data tersimpan lokal di browser, tidak ada yang dikirim ke server.',
          ],
          tags: ['Chrome Extension', 'Manifest V3', 'GSAP', 'Content Script'],
          linkLabel: 'Buka proyek',
        },
      },
    },

    certificates: {
      eyebrow: '05 — Sertifikat',
      title: 'Sertifikat.',
      view: 'Lihat sertifikat',
      /** Kunci = `certificates[].key` */
      items: {
        'ibm-skillsbuild-fundamentals': {
          issuer: 'IBM SkillsBuild',
          title: 'AI Fundamentals: Foundations for Understanding AI',
          meta: 'PLAN-AC28D1A01CA2',
          date: '29 Sep 2026',
          alt: 'Sertifikat penyelesaian IBM SkillsBuild untuk kursus AI Fundamentals: Foundations for Understanding AI, atas nama Firmansyah Al Jaelani, dengan nomor PLAN-AC28D1A01CA2 dan tanggal penyelesaian 29 September 2026.',
        },
        'ibm-skillsbuild': {
          issuer: 'IBM SkillsBuild',
          title: 'AI Literacy — Earn a digital credential!',
          meta: 'PLAN-18EB492D5259',
          date: '23 Jul 2026',
          alt: 'Sertifikat penyelesaian IBM SkillsBuild untuk kursus AI Literacy, atas nama Firmansyah Al Jaelani, dengan nomor PLAN-18EB492D5259 dan tanggal penyelesaian 23 Juli 2026.',
        },
        'code-org': {
          issuer: 'Code.org',
          title: 'Pre Express 2025',
          meta: 'Program dua tahun: konsep dasar computer science',
          // Sengaja TIDAK ada `date`.
          //
          // Sertifikat Code.org tidak mencantumkan tanggal sama sekali —
          // sudah diperiksa di gambar (tidak ada di bagian bawah mana pun),
          // di EXIF (berkasnya tanpa tag metadata), dan di nama file
          // (base64-nya cuma berisi name, course, dan donor).
          //
          // Yang pernah terisi di sini adalah `LastWriteTime` berkas,
          // yaitu waktu file itu disimpan di komputer — BUKAN waktu
          // sertifikat diterbitkan. Menampilkannya sebagai tanggal
          // penyelesaian berarti mengarang fakta, jadi dihapus.
          //
          // Bandingkan dengan IBM: sertifikat itu benar-benar mencetak
          // "Completion date: 23 Jul 2026 (GMT)", dan angka itu dipakai
          // apa adanya. Perbedaan perlakuan itu disengaja.
          alt: 'Sertifikat penyelesaian Code.org Pre Express 2025, atas nama Firmansyah Al jaelani, ditandatangani Hadi Partovi.',
        },
        'wadhwani-speaking-listening': {
          issuer: 'Wadhwani Foundation',
          title: 'Effective Speaking and Listening Skills (US English)',
          meta: '75 jam pelatihan, kelas dan daring',
          date: '5 Okt 2026',
          alt: 'Sertifikat penyelesaian Wadhwani Foundation untuk pelatihan Effective Speaking and Listening Skills (US English), atas nama Firmansyah Al Jaelani dari SMK Wikrama, 75 jam pelatihan pada 5 Oktober 2026.',
        },
        'wadhwani-writing': {
          issuer: 'Wadhwani Foundation',
          title: 'Effective Writing Skills (US English)',
          meta: '75 jam pelatihan, kelas dan daring',
          date: '5 Okt 2026',
          // Sertifikat aslinya mencetak "Impactive Writing Skills".
          // Kemungkinan besar salah ketik penerbit untuk "Effective" —
          // satu-satunya salah ketik yang disengaja untuk dibetulkan
          // di sini. Kalau ternyata memang istilah resmi, cukup
          // ganti satu kata di `title` dan `alt`.
          alt: 'Sertifikat penyelesaian Wadhwani Foundation untuk pelatihan Effective Writing Skills (US English), atas nama Firmansyah Al Jaelani dari SMK Wikrama, 75 jam pelatihan pada 5 Oktober 2026.',
        },
      },
    },
    journey: {
        eyebrow: '06 — Perjalanan',
        title: 'Perjalanan.',
        aside: 'Hotel adalah arahnya. Web adalah yang saya pelajari sendiri sambil jalan.',
        /** Kunci = `journey[].year` */
        items: {
          '2025-smk': {
            year: '2025',
            title: 'Masuk SMK Wikrama Bogor',
            description:
              'Jurusan Perhotelan. Mulai belajar housekeeping, F&B service, dan front office.',
          },
          '2025-teknologi': {
            year: '2025',
            title: 'Mulai belajar web sendiri',
            description:
              'HTML, CSS, lalu JavaScript. Sebagian besar dari YouTube, sisanya dibantu AI.',
          },
          '2026': {
            year: '2026',
            title: 'Kelas 11 dan tugas KKA',
            description:
              'Untuk tugas dari guru, saya mengerjakan program Code.org Pre Express dan mendapat sertifikat AI Literacy dari IBM SkillsBuild.',
          },
          Sekarang: {
            year: 'Sekarang',
            title: 'Menuju perhotelan',
            description:
              'Fokus ke ilmu perhotelan, sambil tetap menjaga kemampuan web tetap berjalan.',
          },
        },
    },

    footer: {
      sub: 'SMK Wikrama Bogor · Perhotelan · Kelas 11',
      copy: '© 2026 Firmansyah',
      toTop: 'Kembali ke atas',
    },

  },

  en: {
    meta: {
      title: 'Firmansyah',
      description:
        "Portfolio of Firmansyah Al Jaelani, a Grade 11 student at SMK Wikrama Bogor majoring in Hotel Management, interested in technology, the web, and design.",
    },
    skip: 'Skip to main content',
    themeLabel: 'Switch between light and dark theme',
    burgerOpen: 'Open menu',
    burgerClose: 'Close menu',
    langLabel: 'Change language',

    /**
     * Loading screen. Keys are the real events that happen, not the
     * names of animation stages — the order on screen follows the
     * weight order in `components/loader.js`. `ready` is shown after
     * 100%, so it carries no weight.
     */
    loader: {
      dom: 'Assembling the page',
      layout: 'Laying out',
      fonts: 'Loading typeface',
      load: 'Fetching assets',
      intro: 'Setting type',
      ready: 'Ready',
    },

    sections: {
      hero: 'Home',
      tentang: 'About',
      keahlian: 'Skills',
      proyek: 'Projects',
      sertifikat: 'Certificates',
      perjalanan: 'Journey',
    },

    nav: {
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      certificates: 'Certificates',
      journey: 'Journey',
    },

    hero: {
      eyebrow: '',
      title: "Hi, I'm<br />Firmansyah.",
      sub: 'Hotel Management Student · Creative Learner · Web Enthusiast',
      desc: 'I learn technology outside of school hours. I learn hospitality standards in class. Both of them run at the same time.',
      ctaPrimary: 'View Projects',
      ctaSecondary: 'About Me',
      scroll: 'Scroll',
      scrollAria: 'Scroll to the About section',
      facts: [
        { key: 'Based in', val: 'Bogor, Indonesia' },
        { key: 'School', val: 'SMK Wikrama Bogor' },
        { key: 'Grade', val: '11' },
        { key: 'Major', val: 'Hotel Management' },
      ],
    },

    about: {
      eyebrow: '02 — About',
      title: 'About me.',
      statement: 'A hotel student who teaches himself web after class.',
      p1: "Hello, I'm Firmansyah Al Jaelani. I'm a Grade 11 student at SMK Wikrama Bogor, majoring in Hotel Management. After I graduate, my goal is to work in hospitality.",
      p2: 'At school I study housekeeping, F&B service, front office, and KKA. What I have actually done hands-on: making beds, laying out table settings, and guest service practice. Front office is still theory for me.',
      p3: "Outside of school I have been learning on my own since 2025 — HTML, CSS, then JavaScript, mostly from YouTube and with help from AI. That is where my two Chrome extensions came from. I have also been picking up basic network security on my own network: how access points work, deauthentication, and SSID spoofing.",
      marks: [
        { key: 'School', val: 'SMK Wikrama Bogor — Hotel Management' },
        { key: 'Practical work', val: 'Making bed · Table setting' },
        { key: 'Self-taught', val: 'HTML, CSS, JavaScript, Node.js' },
      ],
    },

    skills: {
      eyebrow: '03 — Skills',
      title: 'Skills.',
      note: "What I actually work on, not a list of what I would like to be able to do.",
      groups: [
        {
          title: 'Hospitality',
          note: 'From practical work at school.',
          tags: ['Making bed', 'Table setting', 'Guest Service', 'Front Office'],
        },
        {
          title: 'Web',
          note: 'Learned on my own since 2025, mostly from YouTube and with help from AI.',
          tags: ['HTML', 'CSS', 'JavaScript', 'Chrome Extension', 'Manifest V3'],
        },
        {
          title: 'Tools',
          note: 'Linux for network security work, plus what I use every day.',
          tags: ['Linux', 'WiFi Adapter', 'Windows', 'VS Code', 'Node.js'],
        },
      ],
    },

    projects: {
      eyebrow: '04 — Projects',
      title: 'Selected projects.',
      note: 'Both are still being built by me. Form Solver is on GitHub and can be tried right away; RAZOR is not published yet.',
      concept: 'Concept',
      development: 'In development',
      use: 'Use cases',
      how: 'How it works',
      items: {
        '01': {
          title: 'Form Solver',
          category: 'Chrome Extension · 2026',
          description:
            'A Chrome extension (Manifest V3) that fills my own Google Forms with AI. It reads each question, its type, and its options, then fills the field one at a time. Submit stays manual. No framework, no backend, no dependencies.',
          uses: [
            'Building practice quizzes: one question form, filled repeatedly without retyping every answer.',
            'Testing a new form before sharing it — making sure the questions, types, and dropdown options actually work.',
            'Moving answers from an old form into a new one without typing everything from scratch.',
          ],
          how: [
            'Reads each question along with its type and options, then fills the fields one at a time from top to bottom.',
            'Dropdowns, radios, checkboxes, and text are all clicked through the real interface — not written into the DOM behind your back.',
            'Submit stays manual, so you still check the answers yourself before sending them.',
            'Only runs on your own Google Forms, with minimal permissions. It never touches passwords, cookies, or tokens.',
          ],
          tags: ['Chrome Extension', 'Manifest V3', 'Shadow DOM', 'AI'],
          linkLabel: 'Open on GitHub',
        },
        '02': {
          title: 'RAZOR',
          category: 'Chrome Extension · 2026',
          description:
            'A Chrome extension (Manifest V3) that replaces the new tab with a screen of your own. Wallpaper, colours, and the name are all configurable; press Space or right-click for your icon list; Alt+S opens settings. No framework, no backend. Still being built: a few shortcuts, the icon, and some details are unfinished.',
          uses: [
            'Turns the new tab into a screen of your own: wallpaper, colours, and the name are yours to set.',
            'Every site icon on one screen — press Space or right-click instead of hunting through bookmarks.',
            'Searching without the mouse: type anything on a new tab, pick a suggestion, press Enter.',
            'Seeing and switching tabs without leaving the page you were reading.',
          ],
          how: [
            'Space or right-click opens the icon list. Typing any letter opens the search panel straight away.',
            'Alt+S opens settings, where you can add icons, change colours, and switch theme or wallpaper.',
            'Almost everything is replaceable — the name, the logo, the font, and the text colour down to the chevron itself.',
            'No framework, no backend. All data stays in the browser — nothing is sent to a server.',
          ],
          tags: ['Chrome Extension', 'Manifest V3', 'GSAP', 'Content Script'],
          linkLabel: 'Open project',
        },
      },
    },

    certificates: {
      eyebrow: '05 — Certificates',
      title: 'Certificates.',
      view: 'View certificate',
      /** Kunci = `certificates[].key` */
      items: {
        'ibm-skillsbuild-fundamentals': {
          issuer: 'IBM SkillsBuild',
          title: 'AI Fundamentals: Foundations for Understanding AI',
          meta: 'PLAN-AC28D1A01CA2',
          date: '29 Sep 2026',
          alt: 'IBM SkillsBuild completion certificate for the AI Fundamentals: Foundations for Understanding AI course, awarded to Firmansyah Al Jaelani, credential number PLAN-AC28D1A01CA2, completed 29 September 2026.',
        },
        'ibm-skillsbuild': {
          issuer: 'IBM SkillsBuild',
          title: 'AI Literacy — Earn a digital credential!',
          meta: 'PLAN-18EB492D5259',
          date: '23 Jul 2026',
          alt: 'IBM SkillsBuild completion certificate for the AI Literacy course, awarded to Firmansyah Al Jaelani, credential number PLAN-18EB492D5259, completed 23 July 2026.',
        },
        'code-org': {
          issuer: 'Code.org',
          title: 'Pre Express 2025',
          meta: 'Two-year program, computer science concepts',
          alt: 'Code.org Pre Express 2025 completion certificate, awarded to Firmansyah Al jaelani, signed by Hadi Partovi.',
        },
        'wadhwani-speaking-listening': {
          issuer: 'Wadhwani Foundation',
          title: 'Effective Speaking and Listening Skills (US English)',
          meta: '75 hours of training, in-class and online',
          date: '5 Oct 2026',
          alt: 'Wadhwani Foundation certificate for the Effective Speaking and Listening Skills (US English) training, awarded to Firmansyah Al Jaelani of SMK Wikrama, 75 hours of training completed on 5 October 2026.',
        },
        'wadhwani-writing': {
          issuer: 'Wadhwani Foundation',
          title: 'Effective Writing Skills (US English)',
          meta: '75 hours of training, in-class and online',
          date: '5 Oct 2026',
          alt: 'Wadhwani Foundation certificate for the Effective Writing Skills (US English) training, awarded to Firmansyah Al Jaelani of SMK Wikrama, 75 hours of training completed on 5 October 2026.',
        },
      },
    },

      journey: {
        eyebrow: '06 — Journey',
        title: 'Journey.',
        aside: 'Hotel is the destination. Web is what I teach myself along the way.',
        /** Kunci = `journey[].year` */
        items: {
          '2025-smk': {
            year: '2025',
            title: 'Started at SMK Wikrama Bogor',
            description:
              'Hotel Management major. Began with housekeeping, F&B service, front office, and KKA.',
          },
          '2025-teknologi': {
            year: '2025',
            title: 'Started learning web on my own',
            description:
              'HTML, then CSS, then JavaScript. Mostly from YouTube, with some help from AI.',
          },
          '2026': {
            year: '2026',
            title: 'Grade 11 and a KKA assignment',
            description:
              'For an assignment from my teacher, I completed the Code.org Pre Express program and earned an AI Literacy certificate from IBM SkillsBuild.',
          },
          Sekarang: {
            year: 'Present',
            title: 'Heading towards hospitality',
            description:
              'Focusing on hospitality while keeping the web skills alive.',
          },
        },
      },

    footer: {
      sub: 'SMK Wikrama Bogor · Hotel Management · Grade 11',
      copy: '© 2026 Firmansyah',
      toTop: 'Back to top',
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   PREFERENSI MOTION
   Semua sakelarnya benar-benar dipakai oleh main.js / hero.js.
   `enabled: false` membuat situs diam total, tapi isi halaman tetap
   tampil dan tetap bisa dibaca.
   ───────────────────────────────────────────────────────────── */

export const motionProfile = {
  /** Master switch untuk semua animasi. */
  enabled: true,
  /** Judul besar dipecah per kata (GSAP SplitText). Tambah banyak node DOM. */
  useTextSplit: true,
  /** Kursor kustom. Hanya aktif di perangkat bertetikus. */
  customCursor: true,
  /** Tombol yang menempel mild ke kursor. */
  magnetic: true,
  /** Pergeseran halus pada mockup project. */
  parallax: true,
  /** Grafik orbit dekoratif di kanan hero + gerak ambientnya. */
  heroMotion: true,
};
