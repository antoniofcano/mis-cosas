// Aplica la revisión del tema y la clase de las preguntas dudosas (tools/bancos/temas-revisados.json, R-29). Reproducible e
// idempotente; no toca ni el enunciado, ni las opciones, ni la respuesta oficial de ninguna pregunta.
//   node tools/bancos/temas-revisados.mjs             → qué cambiaría (no escribe nada)
//   node tools/bancos/temas-revisados.mjs --escribir  → lo escribe
//
// Cada decisión (docs/BANCOS.md, «Práctica y tema»):
//   tema      cambia su tema (`ut` y `ut_titulo`, de → a) en el ajuste por id del eje (tools/bancos/ejes/<eje>/ajustes.json,
//             el sitio donde el proceso de extracción guarda los ajustes a mano) y en el banco (preguntas.json), y practica
//             solo en `clase`. Solo entre temas sin límite de fallos propio (cambiarlo movería un fallo de un bloque
//             eliminatorio a otro en la corrección de los exámenes reales), nunca en una reservada para el examen final ni
//             en Andalucía (su tema está fijado en la huella del banco).
//   clase     practica en `clase` (de su tema, o de otro con `excepcion`): sale de las demás; con `ademas`, se suma.
//   se-queda, dudosa   no cambia nada; el motivo queda escrito y la auditoría de temas (tools/auditoria-temas.mjs) lo dice.
//   excepcion { clase, tipo }: sigue en la práctica de una clase de otro tema y se justifica con el mismo motivo en
//             tools/bancos/practica-excepciones.json. Una revisada sin `excepcion` no deja ninguna en ese fichero.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIZ, leerJSON } from './lib/comun.mjs';
import { TITULACIONES } from '../../src/theory/blocks.js';
import { RUTA_EXCEPCIONES } from './lib/practica-tema.mjs';
import { textoComo } from './practica-tema.mjs';

export const RUTA_REVISION = join(RAIZ, 'tools', 'bancos', 'temas-revisados.json');
export const DECISIONES = ['tema', 'clase', 'se-queda', 'dudosa'];

/** Revisión: { eje: { tit: { id: decisión } } } (sin la descripción). */
export function leerRevision(ruta = RUTA_REVISION) {
  const { descripcion, ...porEje } = leerJSON(ruta, {});
  return porEje;
}

/** Temas con límite de fallos propio de una titulación (en el PY, todos: por módulos, cada materia tiene el suyo). */
export function temasConLimite(tit) {
  const E = TITULACIONES[tit].estructura;
  return new Set(E.bloques.filter((b) => b.maxErrores != null || (E.modulos ?? []).some((m) => m.maxErrores?.[b.ut] != null)).map((b) => b.ut));
}

// Escritura con el mismo estilo que el fichero: JSON compacto o con espacios tras «:» y «,» (el de los ajustes de DGMM).
const conEspacios = (v) => (Array.isArray(v) ? `[${v.map(conEspacios).join(', ')}]`
  : v && typeof v === 'object' ? `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${conEspacios(x)}`).join(', ')}}` : JSON.stringify(v));

/** Ajustes por id con el formato de tools/bancos/ejes/<eje>/ajustes.json (una pregunta por línea). */
export function textoAjustes(ajustes, espaciado) {
  const fila = espaciado ? conEspacios : (v) => JSON.stringify(v);
  const bloques = Object.entries(ajustes).map(([k, v]) => {
    if (!['per', 'py'].includes(k)) return ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`;
    const ids = Object.entries(v);
    return ` ${JSON.stringify(k)}: {\n${ids.map(([id, a]) => `  ${JSON.stringify(id)}: ${fila(a)}`).join(',\n')}\n }`;
  });
  return `{\n${bloques.join(',\n')}\n}\n`;
}

/** Cambia `ut` y `ut_titulo` en la línea de una pregunta de preguntas.json (una por línea). */
export function cambiarTemaEnLinea(linea, ut, titulo) {
  const nueva = linea.replace(/"ut":\s*\d+,(\s*)"ut_titulo":\s*"[^"]*"/, (m, sp) => `"ut":${/"ut": /.test(m) ? ' ' : ''}${ut},${sp}"ut_titulo":${/"ut_titulo": /.test(m) ? ' ' : ''}${JSON.stringify(titulo)}`);
  if (nueva === linea && !new RegExp(`"ut":\\s*${ut},`).test(linea)) throw new Error('no encuentro «ut» en la línea');
  return nueva;
}

/**
 * Aplica la revisión. Devuelve los cambios por fichero; con `escribir`, los escribe.
 * @returns {{ cambios: string[], errores: string[] }}
 */
export function aplicar({ escribir = false, revision = leerRevision() } = {}) {
  const cambios = [];
  const errores = [];
  const excepciones = leerJSON(RUTA_EXCEPCIONES, {});
  const exAntes = JSON.stringify(excepciones);
  for (const [eje, porTit] of Object.entries(revision)) {
    const rutaAj = join(RAIZ, 'tools', 'bancos', 'ejes', eje, 'ajustes.json');
    const textoAj = readFileSync(rutaAj, 'utf8');
    const espaciado = /\{"[a-z_]+": /.test(textoAj);
    const ajustes = JSON.parse(textoAj);
    let ajCambiados = false;
    for (const [tit, decisiones] of Object.entries(porTit)) {
      const rutaQ = join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json');
      const lineas = readFileSync(rutaQ, 'utf8').split('\n');
      const filaDe = new Map();
      lineas.forEach((l, i) => { const m = /^\{"id":"([^"]+)"/.exec(l); if (m) filaDe.set(m[1], i); });
      const porId = new Map([...filaDe].map(([id, i]) => [id, JSON.parse(lineas[i].replace(/,$/, ''))]));
      const orden = new Map([...filaDe].map(([id], n) => [id, n]));
      const rutaP = join(RAIZ, 'data', 'ejes', eje, tit, 'practica.json');
      const originalP = readFileSync(rutaP, 'utf8');
      const practica = JSON.parse(originalP);
      // El título de cada tema, como lo escribe el banco (el de la etapa «clasificar»); si no, el de la estructura.
      const titulos = new Map(TITULACIONES[tit].estructura.bloques.map((b) => [b.ut, b.titulo]));
      const vistos = new Set();
      for (const q of porId.values()) if (!vistos.has(q.ut)) { vistos.add(q.ut); titulos.set(q.ut, q.ut_titulo); }
      let qCambiadas = false;
      for (const [id, d] of Object.entries(decisiones)) {
        const q = porId.get(id);
        if (!q) { errores.push(`${eje}/${tit} ${id}: no existe`); continue; }
        if (!DECISIONES.includes(d.decision)) { errores.push(`${id}: decisión «${d.decision}»`); continue; }
        if (d.decision === 'tema') {
          if (q.ut !== d.a) {
            if (q.ut !== d.de) { errores.push(`${id}: su tema es ${q.ut}, no ${d.de}`); continue; }
            lineas[filaDe.get(id)] = cambiarTemaEnLinea(lineas[filaDe.get(id)], d.a, titulos.get(d.a));
            qCambiadas = true;
            cambios.push(`${eje}/${tit} ${id}: tema ${d.de} → ${d.a}`);
          }
          const a = (ajustes[tit] ??= {})[id] ?? {};
          if (a.ut !== d.a || a.ut_titulo !== titulos.get(d.a)) {
            const { ut, ut_titulo, ...resto } = a;
            ajustes[tit][id] = { ut: d.a, ut_titulo: titulos.get(d.a), ...resto };
            ajCambiados = true;
          }
        }
        if (d.decision === 'tema' || d.decision === 'clase') {
          if (!(d.clase in practica)) { errores.push(`${id}: la clase ${d.clase} no está en la práctica`); continue; }
          for (const [l, ids] of Object.entries(practica)) {
            if (l === d.clase || d.ademas || !ids.includes(id)) continue;
            practica[l] = ids.filter((x) => x !== id);
            cambios.push(`${eje}/${tit} ${id}: sale de ${l}`);
          }
          if (!practica[d.clase].includes(id)) {
            practica[d.clase] = [...practica[d.clase], id].sort((x, y) => (orden.get(x) ?? 1e9) - (orden.get(y) ?? 1e9));
            cambios.push(`${eje}/${tit} ${id}: entra en ${d.clase}`);
          }
        }
        // Excepciones: la de la decisión, o ninguna.
        const ex = ((excepciones[eje] ??= {})[tit] ??= {});
        if (d.excepcion) ex[id] = { clase: d.excepcion.clase, tipo: d.excepcion.tipo, motivo: d.motivo };
        else delete ex[id];
      }
      if (escribir && qCambiadas) writeFileSync(rutaQ, lineas.join('\n'));
      const textoP = textoComo(originalP, practica);
      if (escribir && textoP !== originalP) writeFileSync(rutaP, textoP);
    }
    if (ajCambiados && textoAjustes(JSON.parse(textoAj), espaciado) !== textoAj) errores.push(`${eje}: ajustes.json no tiene el formato esperado (no se reescribe)`);
    else if (escribir && ajCambiados) writeFileSync(rutaAj, textoAjustes(ajustes, espaciado));
  }
  // Sin bancos vacíos en las excepciones.
  for (const [eje, porTit] of Object.entries(excepciones)) {
    if (eje === 'descripcion') continue;
    for (const tit of Object.keys(porTit)) if (!Object.keys(porTit[tit]).length) delete porTit[tit];
    if (!Object.keys(porTit).length) delete excepciones[eje];
  }
  if (escribir && JSON.stringify(excepciones) !== exAntes) writeFileSync(RUTA_EXCEPCIONES, `${JSON.stringify(excepciones, null, 1)}\n`);
  return { cambios, errores };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const escribir = process.argv.includes('--escribir');
  const { cambios, errores } = aplicar({ escribir });
  for (const c of cambios) console.log(c);
  for (const e of errores) console.error(`ERROR ${e}`);
  console.log(`${cambios.length} cambios${escribir ? ' escritos' : ' (sin escribir: --escribir)'}; ${errores.length} errores.`);
  if (errores.length) process.exitCode = 1;
}
