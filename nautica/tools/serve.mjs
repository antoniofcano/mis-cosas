#!/usr/bin/env node
// Servidor estático mínimo para desarrollo (sin dependencias). Uso: npm start [-- puerto]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.argv[2]) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    const tipo = { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
    // Por trozos (Range), como GitHub Pages: el navegador lo necesita para saltar dentro de un audio.
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    if (m) {
      const ini = m[1] ? Number(m[1]) : body.length - Number(m[2]);
      const fin = m[1] && m[2] ? Math.min(Number(m[2]), body.length - 1) : body.length - 1;
      res.writeHead(206, { ...tipo, 'Content-Range': `bytes ${ini}-${fin}/${body.length}` }).end(body.subarray(ini, fin + 1));
      return;
    }
    res.writeHead(200, tipo).end(body);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(port, () => console.log(`Carta Náutica en http://localhost:${port}`));
