/**
 * Static server untuk pengembangan lokal.
 *
 * Tanpa dependency. Hanya pakai modul bawaan Node, jadi `npm install`
 * tidak perlu dijalankan sama sekali — cukup `npm start`.
 *
 * Dipakai sebagai pengganti Live Server supaya perilakunya konsisten:
 * MIME type yang benar, tanpa cache, dan pesan error yang jelas.
 *
 * Jalankan:
 *   npm start              → http://127.0.0.1:5500
 *   PORT=8080 npm start    → ganti port
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT) || 8800;
const HOST = process.env.HOST || '127.0.0.1';

/**
 * MIME type. `text/javascript` PENTING untuk `.js` — kalau tidak, browser
 * menolak memuat ES module sama sekali (dan errornya muncul di Network
 * tab, bukan di console).
 */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.map': 'application/json; charset=utf-8',
};

/**
 * @param {string} filePath
 * @returns {string}
 */
const contentType = (filePath) => MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

/**
 * Terjemahkan URL menjadi path di dalam ROOT.
 * Returns null kalau path-nya keluar dari ROOT (path traversal).
 *
 * @param {string} urlPath
 * @returns {string|null}
 */
function safePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }

  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  const full = resolve(join(ROOT, relative));

  // Penjaga path traversal: hasil resolve harus tetap di dalam ROOT
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;
  return full;
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} code
 * @param {string} message
 */
function sendError(res, code, message) {
  res.writeHead(code, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(`<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8">
<title>${code}</title>
<style>
  body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#F4F4F1;
       color:#111;font:400 16px/1.6 ui-sans-serif,system-ui,sans-serif}
  .box{max-width:34rem;padding:2rem}
  h1{margin:0 0 .5rem;font-size:2.5rem;font-weight:500;letter-spacing:-.03em}
  p{margin:0 0 1rem;color:#5C5C5A}
  a{color:#6E2E2E}
  code{font-family:ui-monospace,monospace;font-size:.875em;background:#EBEAE5;padding:.15em .4em}
</style></head>
<body><div class="box">
<h1>${code}</h1>
<p>${message}</p>
<p><a href="/">Kembali ke beranda</a></p>
</div></body></html>`);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const target = safePath(req.url ?? '/');
  if (!target) {
    sendError(res, 400, 'Permintaan tidak valid.');
    return;
  }

  let filePath = target;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    sendError(res, 404, `Berkas tidak ditemukan: <code>${req.url}</code>`);
    return;
  }

  let body;
  try {
    body = await readFile(filePath);
  } catch {
    sendError(res, 404, 'Berkas tidak ditemukan.');
    return;
  }

  res.writeHead(200, {
    'content-type': contentType(filePath),
    // Tanpa cache sama sekali selama pengembangan. Ini yang membuat
    // "kenapa perubahanku tidak muncul" tidak pernah terjadi —
    // termasuk modul ES yang biasanya banyakezer di-cache browser.
    'cache-control': 'no-store, must-revalidate',
  });
  res.end(req.method === 'HEAD' ? undefined : body);
});

server.on('error', (err) => {
  const code = /** @type {NodeJS.ErrnoException} */ (err).code;

  if (code === 'EADDRINUSE') {
    console.error(
      `\n  Port ${PORT} sedang dipakai proses lain.` +
        `\n  Tutup Live Server / server lain yang memakai port itu, atau jalankan:` +
        `\n\n      PORT=8080 npm start\n`
    );
    process.exit(1);
  }

  console.error('\n  Server gagal:', err.message, '\n');
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  // Hanya ASCII: konsol Windows (cmd/PowerShell) sering salah menampilkan
  // karakter seperti em-dash atau tanda panah sebagai mojibake.
  console.log(`\n  Firmansyah - server pengembangan\n`);
  console.log(`  ->  http://${HOST}:${PORT}/\n`);
  console.log(`  Stop: Ctrl+C\n`);
});

/** @param {string} sig */
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}
