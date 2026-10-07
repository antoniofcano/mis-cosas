// Prueba de oro de Andalucía 2020–2026: compara la salida del proceso de extracción (desde los PDF oficiales, en
// .cache/bancos/andalucia/salida/<tit>/preguntas.json) con el banco vivo (data/ejes/andalucia/<tit>/preguntas.json),
// id a id, y escribe tools/bancos/informes/andalucia-oro.md.
//   node tools/bancos/ejes/andalucia/oro.mjs            (tras npm run bancos -- andalucia)
// Campos: enunciado y opciones (con espacios y comillas normalizados), correcta, anulada, ut, numero y fecha; y la huella
// de la migración (tools/bancos/andalucia-huella.json: enunciado, opciones, correcta, anulada y tema, exactos).
// Cada diferencia debe estar explicada en oro.json (clase «banco»: probable error del banco vivo, con su evidencia).
// Los errores del proceso que la prueba destapó y ya se corrigieron se listan en oro.json → «corregidos».
// tests/bancos-extraccion-oro.test.js ejecuta la comparación cuando existe la caché y se salta si no.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANCOS, CACHE, RAIZ, escribirTexto, hoy, leerJSON } from '../../lib/comun.mjs';

export const TITS = ['per', 'py'];
export const CAMPOS = ['enunciado', 'opcion a', 'opcion b', 'opcion c', 'opcion d', 'correcta', 'anulada', 'ut', 'numero', 'fecha'];
/** Campos que deben coincidir siempre (100 %) o tener una explicación. */
export const CRITICOS = ['correcta', 'anulada'];

/** Texto normalizado para comparar: espacios, comillas tipográficas y espacio antes de signo de puntuación. */
export function normalizar(s) {
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[“”«»„″]/g, '"')
    .replace(/[‘’‚´`′]/g, "'")
    .replace(/[\s  -​ ]+/g, ' ')
    .replace(/ ([,.;:)])(?=\s|$)/g, '$1')
    .trim();
}

/** Huella de la migración (la misma función que tools/bancos/migrar-andalucia.mjs; copiada para no importar el script). */
export function huella(q) {
  return createHash('sha256').update(JSON.stringify([q.enunciado, q.opciones, q.correcta ?? null, !!q.anulada, q.ut])).digest('hex').slice(0, 16);
}

const valor = (q, campo) => (campo.startsWith('opcion ') ? q.opciones?.[campo.slice(7)] : q[campo]);

/** Compara un banco vivo con la salida del proceso (listas de preguntas). */
export function comparar(vivo, salida, { huellas = {} } = {}) {
  const S = new Map(salida.map((q) => [q.id, q]));
  const V = new Set(vivo.map((q) => q.id));
  const porCampo = Object.fromEntries(CAMPOS.map((c) => [c, { iguales: 0, distintas: 0 }]));
  const diferencias = [];
  const faltan = [];
  let huellaIgual = 0;
  let conHuella = 0;
  for (const q of vivo) {
    const p = S.get(q.id);
    if (!p) { faltan.push(q.id); continue; }
    for (const campo of CAMPOS) {
      const a = valor(q, campo);
      const b = valor(p, campo);
      const igual = campo === 'enunciado' || campo.startsWith('opcion ') ? normalizar(a) === normalizar(b) : JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
      porCampo[campo][igual ? 'iguales' : 'distintas']++;
      if (!igual) diferencias.push({ id: q.id, campo, vivo: a ?? null, salida: b ?? null });
    }
    if (huellas[q.id]) { conHuella++; if (huella(p) === huellas[q.id]) huellaIgual++; }
  }
  const sobran = salida.filter((q) => !V.has(q.id) && /^and-(py-)?20(2\d)-/.test(q.id)).map((q) => q.id);
  return { total: vivo.length, comparadas: vivo.length - faltan.length, faltan, sobran, porCampo, diferencias, huella: { iguales: huellaIgual, total: conHuella } };
}

/** Une cada diferencia con su explicación de oro.json (clave «id|campo»). */
export function clasificar(diferencias, explicaciones = {}) {
  return diferencias.map((d) => ({ ...d, ...(explicaciones[`${d.id}|${d.campo}`] ?? { clase: 'sin-explicar' }) }));
}

/** Rutas de la caché de salida y del banco vivo. */
export const rutaSalida = (tit, cache = CACHE) => join(cache, 'andalucia', 'salida', tit, 'preguntas.json');
export const rutaVivo = (tit) => join(RAIZ, 'data', 'ejes', 'andalucia', tit, 'preguntas.json');
export const hayCache = (cache = CACHE) => TITS.every((t) => existsSync(rutaSalida(t, cache)));

/** Ejecuta la comparación de las dos titulaciones desde la caché. */
export function ejecutarOro({ cache = CACHE } = {}) {
  const huellas = leerJSON(join(BANCOS, 'andalucia-huella.json'));
  const explicaciones = leerJSON(join(BANCOS, 'ejes', 'andalucia', 'oro.json'));
  const res = {};
  for (const tit of TITS) {
    const vivo = JSON.parse(readFileSync(rutaVivo(tit), 'utf8')).preguntas;
    const salida = JSON.parse(readFileSync(rutaSalida(tit, cache), 'utf8')).preguntas;
    const r = comparar(vivo, salida, { huellas });
    r.diferencias = clasificar(r.diferencias, explicaciones.diferencias);
    res[tit] = r;
  }
  return { res, explicaciones };
}

/** Lectura óptica: estados, margen y acuerdo entre modelos A y B (desde las etapas en caché, si están). */
export function estadisticasOMR({ cache = CACHE, desde = '2020' } = {}) {
  const out = {};
  for (const tit of TITS) {
    const ruta = join(cache, 'andalucia', 'etapas', `correcciones-${tit}.json`);
    if (!existsSync(ruta)) continue;
    const ps = JSON.parse(readFileSync(ruta, 'utf8')).preguntas.filter((p) => (p.fecha ?? '') >= desde && /^and-(py-)?20(2\d)/.test(p.id));
    const estados = {};
    const margenes = [];
    let pares = 0;
    let acuerdo = 0;
    for (const p of ps) {
      for (const a of p.apareceEn) {
        const r = a.respuesta;
        estados[r.estado] = (estados[r.estado] ?? 0) + 1;
        if (r.estado === 'ok' && r.puntos) {
          const v = [...r.puntos].sort((x, y) => y - x);
          margenes.push({ ref: `${a.conv}/${a.modelo ?? '-'}/${a.numero}`, relacion: v[0] > 0 ? v[1] / v[0] : 1, marca: v[0] });
        }
      }
      if (p.apareceEn.length === 2) {
        pares++;
        const [x, y] = p.apareceEn.map((a) => a.respuesta.letras.join('') || a.respuesta.estado);
        if (x === y) acuerdo++;
      }
    }
    margenes.sort((a, b) => b.relacion - a.relacion);
    out[tit] = { lecturas: Object.values(estados).reduce((s, n) => s + n, 0), estados, peores: margenes.slice(0, 5), pares, acuerdo };
  }
  return out;
}

const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1).replace('.', ',')} %` : '—');
const celda = (x) => String(x ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/[\u0000-\u001f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

export function informeOro({ res, explicaciones }, omr = {}) {
  const L = [];
  L.push('# Prueba de oro · Andalucía 2020–2026', '');
  L.push(`Generado por \`node tools/bancos/ejes/andalucia/oro.mjs\` el ${hoy()}, tras \`npm run bancos -- andalucia\` desde los PDF oficiales (cuestionarios de texto y plantillas escaneadas leídas con el adaptador \`hoja-optica\`). Compara, id a id, la salida del proceso (\`.cache/bancos/andalucia/salida/<tit>/preguntas.json\`) con el banco vivo (\`data/ejes/andalucia/<tit>/preguntas.json\`). La prueba no modifica el banco vivo: las erratas que destapa se corrigen aparte y se listan en «Erratas del banco vivo corregidas».`, '');
  L.push('Normalización de texto antes de comparar: espacios (incluidos los de anchura especial), comillas y apóstrofos tipográficos, y el espacio delante de un signo de puntuación («es :» = «es:»). La huella (`tools/bancos/andalucia-huella.json`) se compara sin normalizar.', '');
  L.push('## Resultado', '');
  L.push('| Campo | PER iguales | PY iguales |', '|---|---|---|');
  for (const c of CAMPOS) L.push(`| ${c} | ${res.per.porCampo[c].iguales}/${res.per.comparadas} (${pct(res.per.porCampo[c].iguales, res.per.comparadas)}) | ${res.py.porCampo[c].iguales}/${res.py.comparadas} (${pct(res.py.porCampo[c].iguales, res.py.comparadas)}) |`);
  L.push(`| huella exacta | ${res.per.huella.iguales}/${res.per.huella.total} | ${res.py.huella.iguales}/${res.py.huella.total} |`, '');
  for (const tit of TITS) {
    const r = res[tit];
    L.push(`- ${tit.toUpperCase()}: ${r.total} preguntas en el banco vivo, ${r.comparadas} encontradas en la salida${r.faltan.length ? ` (faltan: ${r.faltan.join(', ')})` : ''}${r.sobran.length ? `; ${r.sobran.length} de 2020–2026 en la salida que no están en el banco vivo: ${r.sobran.join(', ')}` : ''}.`);
  }
  const todas = TITS.flatMap((t) => res[t].diferencias);
  const criticas = todas.filter((d) => CRITICOS.includes(d.campo));
  L.push(`- **correcta / anulada: ${criticas.length ? `${criticas.length} diferencias` : 'acuerdo del 100 %'}**. Diferencias en total: ${todas.length} (${todas.filter((d) => d.clase === 'banco').length} probables errores del banco vivo, ${todas.filter((d) => d.clase === 'sin-explicar').length} sin explicar).`);
  L.push('- Las huellas que no coinciden son las preguntas con diferencias de espacio delante de un signo («es :») o de las listadas abajo: el texto que ve el alumno es el mismo salvo en esas.', '');
  L.push('## Diferencias', '');
  if (!todas.length) L.push('_Ninguna._', '');
  else {
    L.push('| id | Campo | Banco vivo | Proceso | Clase | Evidencia |', '|---|---|---|---|---|---|');
    for (const d of todas) L.push(`| ${d.id} | ${d.campo} | ${celda(JSON.stringify(d.vivo))} | ${celda(JSON.stringify(d.salida))} | ${d.clase === 'banco' ? 'probable error del banco vivo' : d.clase} | ${celda(d.evidencia ?? d.motivo ?? '')} |`);
    L.push('');
  }
  const erratas = explicaciones.erratasCorregidas ?? [];
  if (erratas.length) {
    L.push('## Erratas del banco vivo corregidas', '');
    L.push('Diferencias que la prueba destapó como errores del banco vivo y que ya se han corregido en `data/ejes/andalucia/` (con su huella en `tools/bancos/andalucia-huella.json` y la errata en `ERRATAS` de `tools/bancos/migrar-andalucia.mjs`). Tras corregirlas, la comparación de arriba ya no las cuenta.', '');
    L.push('| id | Campo | Antes | Después | Fecha | Evidencia | Arreglo |', '|---|---|---|---|---|---|---|');
    for (const e of erratas) L.push(`| ${e.id} | ${e.campo} | ${celda(JSON.stringify(e.antes))} | ${celda(JSON.stringify(e.despues))} | ${e.fecha} | ${celda(e.evidencia)} | ${celda(e.arreglo)} |`);
    L.push('');
  }
  if (omr.per || omr.py) {
    L.push('## Lectura óptica (2020–2026)', '');
    for (const tit of TITS) {
      const o = omr[tit];
      if (!o) continue;
      L.push(`- ${tit.toUpperCase()}: ${o.lecturas} burbujas-fila leídas (${Object.entries(o.estados).map(([k, n]) => `${n} ${k}`).join(', ')}).${o.pares ? ` Modelos A y B: ${o.acuerdo}/${o.pares} preguntas con la misma respuesta en las dos hojas (traducida por el texto de la opción).` : ''} Cada «vacía» es una pregunta anulada (el tribunal deja su fila en blanco); las demás anuladas salen de las correcciones publicadas.`);
      L.push(`  Lecturas con menos margen (2.ª burbuja / 1.ª; «dudosa» a partir de 0,35): ${o.peores.map((m) => `${m.ref} ${m.relacion.toFixed(2).replace('.', ',')}`).join('; ')}.`);
    }
    L.push('');
  }
  L.push('## Errores del proceso que destapó la prueba (corregidos)', '');
  for (const c of explicaciones.corregidos ?? []) L.push(`- **${c.titulo}** (${c.afectadas}). ${c.causa} Arreglo: ${c.arreglo}`);
  L.push('');
  return `${L.join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!hayCache()) {
    console.error('No hay salida en la caché: ejecuta antes npm run bancos -- andalucia');
    process.exitCode = 1;
  } else {
    const r = ejecutarOro();
    escribirTexto(join(BANCOS, 'informes', 'andalucia-oro.md'), informeOro(r, estadisticasOMR()));
    for (const tit of TITS) console.log(tit, JSON.stringify(Object.fromEntries(Object.entries(r.res[tit].porCampo).map(([k, v]) => [k, v.distintas]))), 'huella', r.res[tit].huella);
  }
}
