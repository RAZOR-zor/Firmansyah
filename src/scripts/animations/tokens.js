/**
 * Token motion — angka melekat antara CSS dan GSAP.
 * Archetype: Premium. Tidak ada overshoot, tidak ada bounce.
 * @module animations/tokens
 */

export const DURATION = {
  quick: 0.18,
  base: 0.32,
  slow: 0.6,
  reveal: 0.62,
  intro: 0.85,
};

export const EASE = {
  /** Entrance — mulai cepat, mendarat lembut */
  out: 'expo.out',
  /** State change di layar */
  soft: 'power2.out',
  /** Reveal standar */
  reveal: 'power3.out',
  /** Exit — mulai pelan, hilang cepat.
   *  Arah wajib dibalik dari `out`. Elemen yang menghilang dengan ease-out
   *  terasa "melayang lalu berhenti", bukan meninggalkan layar: melambat
   *  persis di detik terakhir, di tempat yang sudah hampir tak terlihat.
   *  Exit yang benar justru mulai pelan lalu makin cepat, jadi perhatian
   *  paling banyak ada di frame pertama — saat elemennya masih di layar. */
  exit: 'power2.in',
};

export const STAGGER = {
  /** Total stagger dijaga di bawah 500ms */
  micro: 0.03,
  tight: 0.06,
  base: 0.09,
  line: 0.055,
};

/** Jarak masuk (px). Kecil supaya terbaca sebagai fade, bukan slide. */
export const SHIFT = {
  xs: 8,
  sm: 14,
  md: 24,
  lg: 40,
};
