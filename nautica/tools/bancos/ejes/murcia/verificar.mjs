// Verificación de los PDF de Murcia que el usuario descarga a mano (carm.es tiene CAPTCHA) y deja en
// .cache/bancos/murcia/pdf/ con el nombre del manifiesto (columna archivo_local del inventario).
//   node tools/bancos/ejes/murcia/verificar.mjs [--todos]
// Para cada documento del manifiesto (PER y PY): FALTA | CAPTCHA (se guardó la página HTML del CAPTCHA de Radware con
// extensión .pdf) | NO-PDF | TAMAÑO (no pesa lo publicado: descarga cortada o fichero sustituido) | OK, y en los OK el
// resumen del subrayado (preguntas, con una sola opción subrayada, sin subrayar, con varias). Sustituye a
// research_notes/…/murcia_herramientas/verify_murcia.py. La etapa manifiesto hace las mismas comprobaciones de fichero
// dentro de npm run bancos -- murcia.
import { closeSync, existsSync, openSync, readSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tamanoPublicado, rutaPDF } from '../../etapas/manifiesto.mjs';
import { leerSubrayados } from '../../adaptadores/subrayado.mjs';
import { leerJSON } from '../../lib/comun.mjs';
import { join } from 'node:path';
import { dirEje } from '../../lib/comun.mjs';

/** Primeros bytes de un fichero (como texto latin1). */
function cabecera(ruta, n = 4096) {
  const fd = openSync(ruta, 'r');
  const b = Buffer.alloc(n);
  const leidos = readSync(fd, b, 0, n, 0);
  closeSync(fd);
  return b.subarray(0, leidos).toString('latin1');
}

/** ¿Es la página del CAPTCHA (u otra página HTML) guardada con extensión .pdf? */
export function esPaginaCaptcha(texto) {
  return /perfdrive|radware|captcha/i.test(texto) || /^\s*(<!doctype html|<html)/i.test(texto);
}

/** Comprueba un fichero contra su documento del manifiesto → { estado, detalle, bytes } */
export function verificarArchivo(ruta, doc) {
  if (!existsSync(ruta)) return { estado: 'FALTA', detalle: `descárgalo de ${doc.pagina}` };
  const bytes = statSync(ruta).size;
  const cab = cabecera(ruta);
  if (!cab.startsWith('%PDF')) {
    if (esPaginaCaptcha(cab)) return { estado: 'CAPTCHA', detalle: 'es la página del CAPTCHA guardada como .pdf: vuelve a descargarlo desde el navegador', bytes };
    return { estado: 'NO-PDF', detalle: 'no empieza por %PDF', bytes };
  }
  const pub = tamanoPublicado(doc.tamanoPublicado);
  if (pub && Math.abs(bytes - pub.bytes) > pub.tolerancia) {
    return { estado: 'TAMAÑO', detalle: `${(bytes / 1024).toFixed(2)} KB frente a ${doc.tamanoPublicado} publicados`, bytes };
  }
  return { estado: 'OK', detalle: '', bytes };
}

/** Resumen de la lectura del subrayado de un PDF. */
export function resumenSubrayado(r) {
  if (!r || r.error) return r?.error ? `error: ${r.error}` : 'sin análisis';
  const ps = r.preguntas;
  const una = ps.filter((p) => p.subrayadas.length === 1).length;
  const sin = ps.filter((p) => !p.subrayadas.length).map((p) => p.n);
  const varias = ps.filter((p) => p.subrayadas.length > 1).map((p) => `${p.n}:${p.subrayadas.join('')}`);
  return `${ps.length} preguntas, ${una} con una sola opción subrayada${sin.length ? `, sin subrayar: ${sin.join(' ')}` : ''}${varias.length ? `, varias: ${varias.join(' ')}` : ''}`;
}

export function verificar({ todos = false } = {}) {
  const man = leerJSON(join(dirEje('murcia'), 'manifiesto.json'));
  const filas = man.documentos.map((d) => ({ d, ruta: rutaPDF('murcia', d) })).map((x) => ({ ...x, ...verificarArchivo(x.ruta, x.d) }));
  const ok = filas.filter((f) => f.estado === 'OK');
  const sub = leerSubrayados(ok.map((f) => f.ruta));
  for (const f of filas) {
    if (f.estado === 'FALTA' && !todos) continue;
    console.log(`${f.estado.padEnd(8)} ${f.d.archivo}${f.detalle ? `  ${f.detalle}` : ''}${f.estado === 'OK' ? `  | ${resumenSubrayado(sub[f.ruta])}` : ''}`);
  }
  const cuenta = filas.reduce((m, f) => ({ ...m, [f.estado]: (m[f.estado] ?? 0) + 1 }), {});
  console.log(Object.entries(cuenta).map(([k, n]) => `${k} ${n}`).join(' · '), `(de ${filas.length}; --todos lista también los que faltan)`);
  return filas;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) verificar({ todos: process.argv.includes('--todos') });
