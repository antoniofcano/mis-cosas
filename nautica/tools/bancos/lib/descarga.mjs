// Descarga de documentos oficiales a la caché, con las particularidades de cada portal:
// - DGMM y Baleares exigen un User-Agent de navegador; Baleares devuelve «502 Proxy Error» si se insiste: reintentos con espera.
// - Andalucía /export/drupaljda/: un GET completo a través del proxy devuelve «Empty reply»; HEAD y GET por rangos sí
//   funcionan, así que se descarga por trozos (curl -r).
// Se usa curl porque respeta el proxy y el almacén de certificados del entorno.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, readSync, closeSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

export const UA_NAVEGADOR = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const espera = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function sha256(ruta) {
  return createHash('sha256').update(readFileSync(ruta)).digest('hex');
}

/** ¿Empieza por %PDF? (la página de un CAPTCHA guardada como .pdf no). */
export function esPDF(ruta) {
  if (!existsSync(ruta)) return false;
  const fd = openSync(ruta, 'r');
  const b = Buffer.alloc(5);
  readSync(fd, b, 0, 5, 0);
  closeSync(fd);
  return b.toString('latin1').startsWith('%PDF');
}

function curl(args) {
  const r = spawnSync('curl', ['-sS', '-L', '--max-time', '180', ...args], { encoding: 'utf8' });
  return { codigo: r.stdout.trim(), error: r.stderr.trim(), estado: r.status };
}

function longitudRemota(url, ua) {
  const r = spawnSync('curl', ['-sS', '-I', '-L', '-A', ua, '--max-time', '60', url], { encoding: 'utf8' });
  const m = [...r.stdout.matchAll(/^content-length:\s*(\d+)/gim)].pop();
  return m ? Number(m[1]) : null;
}

/**
 * Descarga url → destino. Opciones: ua (User-Agent), rangos (descarga por trozos), reintentos, minimo (bytes).
 * Devuelve { ok, bytes, motivo }.
 */
export function descargar(url, destino, { ua = UA_NAVEGADOR, rangos = false, reintentos = 6, minimo = 1000 } = {}) {
  mkdirSync(dirname(destino), { recursive: true });
  const parcial = `${destino}.part`;
  let motivo = '';
  for (let i = 1; i <= reintentos; i++) {
    rmSync(parcial, { force: true });
    if (rangos) {
      const total = longitudRemota(url, ua);
      if (!total) { motivo = 'sin Content-Length'; espera(2000 * i); continue; }
      const trozo = 512 * 1024;
      let ok = true;
      for (let ini = 0; ini < total && ok; ini += trozo) {
        const fin = Math.min(total, ini + trozo) - 1;
        const tmp = `${parcial}.r`;
        const r = curl(['-A', ua, '-r', `${ini}-${fin}`, '-o', tmp, '-w', '%{http_code}', url]);
        if (!['206', '200'].includes(r.codigo) || !existsSync(tmp)) { ok = false; motivo = `rango ${ini}: HTTP ${r.codigo} ${r.error}`; break; }
        appendFileSync(parcial, readFileSync(tmp));
        rmSync(tmp, { force: true });
      }
      if (ok && existsSync(parcial) && statSync(parcial).size !== total) { ok = false; motivo = `tamaño ${statSync(parcial).size} != ${total}`; }
      if (!ok) { espera(2000 * i); continue; }
    } else {
      const r = curl(['-A', ua, '-o', parcial, '-w', '%{http_code}', url]);
      if (r.codigo !== '200') { motivo = `HTTP ${r.codigo} ${r.error}`; espera(3000 * i); continue; }
    }
    const bytes = existsSync(parcial) ? statSync(parcial).size : 0;
    if (bytes < minimo || !esPDF(parcial)) { motivo = `no es un PDF (${bytes} B)`; espera(3000 * i); continue; }
    renameSync(parcial, destino);
    return { ok: true, bytes };
  }
  rmSync(parcial, { force: true });
  return { ok: false, motivo };
}

/** Descarga una página HTML (para descubrir enlaces). */
export function descargarPagina(url, { ua = UA_NAVEGADOR } = {}) {
  return execFileSync('curl', ['-sS', '-L', '--max-time', '90', '-A', ua, '--retry', '4', '--retry-delay', '3', url], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
}
