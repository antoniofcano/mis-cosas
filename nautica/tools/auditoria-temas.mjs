// Auditoría de las preguntas sospechosas de estar en el tema equivocado (reproducible; no cambia ningún dato).
//   node tools/auditoria-temas.mjs             → resumen por eje y titulación
//   node tools/auditoria-temas.mjs --detalle   → además, cada candidata con el tema actual, el propuesto, la señal y el enunciado
//   node tools/auditoria-temas.mjs --json      → todo en JSON (para comparar antes/después)
//   node tools/auditoria-temas.mjs --escribir  → guarda el informe completo en .trabajo-ux/AUDITORIA-temas.md
//
// De dónde sale el tema: el `ut` de cada pregunta es el BLOQUE DEL EXAMEN OFICIAL en que salió (por su número; etapa
// «clasificar» de tools/bancos, docs/EXTRACCION.md). Por eso casi ninguna «está mal» respecto al examen; lo que esta
// auditoría busca son las que, por su contenido, el alumno espera en otro tema. Cuatro señales objetivas:
//
//   posicion     El tribunal puso la misma pregunta en bloques distintos en convocatorias diferentes. Propuesto: el
//                bloque en que más veces salió. Si ese no es el actual, es la señal más fuerte que hay.
//   concepto     Las demás preguntas de su misma idea (concepto principal, data/ejes/<eje>/<tit>/conceptos.json; se
//                miran las de todos los ejes de esa titulación) están casi todas en otro tema (al menos MIN_VECINAS y
//                el UMBRAL_CONCEPTO de ellas). También si todas las clases donde se enseña la idea son de otro tema.
//   practica     Sale en la práctica (practica.json) de una clase de otro tema: estudiando esa clase, el alumno la ve
//                «fuera de sitio». Desde la recolocación (tools/bancos/practica-tema.mjs) solo quedan las excepciones
//                revisadas de tools/bancos/practica-excepciones.json; tests/practica-tema.test.js no deja entrar más.
//   vocabulario  Su texto se parece mucho más al de otro tema: clasificador bayesiano ingenuo entrenado con las demás
//                preguntas de la titulación (de todos los ejes, sin la propia), con un margen amplio (MARGEN_VOCAB).
//
// Nivel: «fuerte» si la posición mayoritaria es otro bloque, o si al menos dos señales distintas proponen el mismo tema;
// «candidata» en otro caso. Los bancos no se mezclan en la app; aquí los demás ejes solo se usan como evidencia.
// Las preguntas reservadas para el examen final (docs/CUARENTENA.md) se listan por su id, SIN enunciado.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TITULACIONES, totalPreguntas } from '../src/theory/blocks.js';
import { ejes, titsDeEje, leerJSON, practicaDe, bancosNode, RAIZ } from './bancos/leer.mjs';

export const MIN_VECINAS = 4; // preguntas de la misma idea (sin contar la propia) para fiarse de su mayoría
export const UMBRAL_CONCEPTO = 0.8; // fracción de las vecinas que tienen que estar en el otro tema
export const MARGEN_VOCAB = 12; // diferencia de logaritmos de verosimilitud entre el tema propuesto y el actual
const MIN_PALABRAS = 6; // con menos palabras útiles, el vocabulario no dice nada

const VACIAS = new Set(('a al algo ante como con cual cuales cuando de del desde donde dos el ella en entre es esta este esto ha han hay la las lo los mas me mi muy no nos o para pero por que se sea ser si sin sobre son su sus un una uno unas unos y ya e u le les nuestro nuestra '
  + 'indique indicar senale senalar siguiente siguientes correcta correcto incorrecta falsa verdadera respuesta respuestas opcion opciones afirmacion afirmaciones anteriores anterior ninguna todas ambas cierta ciertas denomina llama debe deben puede pueden segun caso tiene tienen cuanto').split(' '));

/** Palabras útiles de un texto: minúsculas, sin acentos, sin palabras vacías ni números, recortadas a su raíz (6 letras). */
export function palabras(texto) {
  const t = String(texto ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return [...new Set((t.match(/[a-zñ]{3,}/g) ?? []).filter((w) => !VACIAS.has(w)).map((w) => w.slice(0, 6)))];
}
const textoDe = (q) => [q.enunciado, ...Object.values(q.opciones ?? {})].join(' ');

/** Bloque (ut) de cada posición del examen de una titulación: [ut de la 1, ut de la 2, …]. */
export function bloquesPorPosicion(estructura) {
  return estructura.bloques.flatMap((b) => Array(b.n).fill(b.ut));
}

/**
 * Señal «posicion»: bloques en que el tribunal puso la pregunta (solo exámenes completos, donde el número dice el bloque).
 * @returns {{ cuenta: Record<number, number>, mayoritario: number|null, empate: boolean }|null}  null si siempre fue el suyo
 */
export function senalPosicion(q, utPos, completos) {
  const cuenta = {};
  for (const a of q.apareceEn?.length ? q.apareceEn : [{ conv: q.conv, modelo: null, numero: q.orden ?? q.numero }]) {
    if (!completos.has(`${a.conv}|${a.modelo ?? ''}`)) continue;
    const ut = utPos[a.numero - 1];
    if (ut != null) cuenta[ut] = (cuenta[ut] ?? 0) + 1;
  }
  const uts = Object.keys(cuenta).map(Number);
  if (uts.length < 2 && (uts[0] ?? q.ut) === q.ut) return null;
  const orden = uts.sort((a, b) => cuenta[b] - cuenta[a] || (a === q.ut ? -1 : b === q.ut ? 1 : a - b));
  return { cuenta, mayoritario: orden[0], empate: orden.length > 1 && cuenta[orden[0]] === cuenta[orden[1]] };
}

/** Clasificador bayesiano ingenuo por tema, con las preguntas de una titulación (todos los ejes). */
export function entrenar(preguntas, uts) {
  const porUt = new Map(uts.map((ut) => [ut, { n: 0, f: new Map() }]));
  const vocab = new Set();
  const de = new Map();
  for (const q of preguntas) {
    const c = porUt.get(q.ut);
    if (!c) continue;
    const ws = palabras(textoDe(q));
    de.set(q.id, ws);
    c.n += 1;
    for (const w of ws) { c.f.set(w, (c.f.get(w) ?? 0) + 1); vocab.add(w); }
  }
  /** Logaritmo de la verosimilitud de cada tema para la pregunta `q`, entrenando sin ella. */
  const puntuar = (q) => {
    const ws = de.get(q.id) ?? palabras(textoDe(q));
    const out = {};
    for (const [ut, c] of porUt) {
      const propia = ut === q.ut && de.has(q.id) ? 1 : 0;
      const n = c.n - propia;
      let s = 0;
      for (const w of ws) s += Math.log(((c.f.get(w) ?? 0) - propia + 0.5) / (n + 1));
      out[ut] = s;
    }
    return { puntos: out, n: ws.length };
  };
  return { puntuar };
}

/**
 * Audita todos los bancos.
 * @returns {Promise<{ filas: object[], bancos: object[] }>}  filas: una por pregunta candidata
 */
export async function auditar() {
  const b = bancosNode();
  const bancos = [];
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      if (!TITULACIONES[tit]) continue;
      let qs;
      try { qs = leerJSON(`data/ejes/${e.id}/${tit}/preguntas.json`).preguntas; } catch { continue; }
      let etiquetas = {};
      try { etiquetas = leerJSON(`data/ejes/${e.id}/${tit}/conceptos.json`); } catch { /* sin etiquetas */ }
      const banco = await b.cargarBanco(e.id, tit);
      bancos.push({ eje: e.id, tit, qs, etiquetas, practica: practicaDe(tit, e.id), reservadas: banco.reservadas });
    }
  }
  // Catálogo de conceptos (clases donde se enseña cada idea) y tema de cada clase.
  const catalogo = new Map();
  try {
    for (const g of leerJSON('data/conceptos/index.json').grupos ?? []) {
      try { for (const c of leerJSON(`data/conceptos/${g}.json`).conceptos ?? []) catalogo.set(c.id, c); } catch { /* grupo que aún no existe */ }
    }
  } catch { /* sin catálogo */ }
  const utDeClase = {};
  for (const tit of Object.keys(TITULACIONES)) {
    utDeClase[tit] = new Map();
    try { for (const m of leerJSON(`data/curso/${tit}.json`).modulos) for (const l of m.lecciones) utDeClase[tit].set(l.id, l.ut ?? m.ut); } catch { /* sin curso */ }
  }

  // Excepciones revisadas de la práctica (tools/bancos/practica-excepciones.json): se dicen en la señal.
  let excepciones = {};
  try { excepciones = leerJSON('tools/bancos/practica-excepciones.json'); } catch { /* sin excepciones */ }
  const filas = [];
  for (const tit of Object.keys(TITULACIONES)) {
    const E = TITULACIONES[tit].estructura;
    const total = totalPreguntas(E);
    const utPos = bloquesPorPosicion(E);
    const titulo = (ut) => E.bloques.find((x) => x.ut === ut)?.titulo ?? `Tema ${ut}`;
    const delTit = bancos.filter((x) => x.tit === tit);
    const todas = delTit.flatMap((x) => x.qs);
    const modelo = entrenar(todas, E.bloques.map((x) => x.ut));
    // Temas de las preguntas de cada idea (concepto principal), con todos los ejes de la titulación.
    const porConcepto = new Map();
    for (const x of delTit) for (const q of x.qs) {
      const c = x.etiquetas[q.id]?.[0];
      if (!c) continue;
      if (!porConcepto.has(c)) porConcepto.set(c, {});
      porConcepto.get(c)[q.ut] = (porConcepto.get(c)[q.ut] ?? 0) + 1;
    }
    for (const x of delTit) {
      // Exámenes completos: (convocatoria, modelo) cuyo último número es el total de la titulación.
      const maximo = new Map();
      for (const q of x.qs) for (const a of q.apareceEn?.length ? q.apareceEn : [{ conv: q.conv, modelo: null, numero: q.orden ?? q.numero }]) {
        const k = `${a.conv}|${a.modelo ?? ''}`;
        maximo.set(k, Math.max(maximo.get(k) ?? 0, a.numero ?? 0));
      }
      const completos = new Set([...maximo].filter(([, n]) => n === total).map(([k]) => k));
      const clasesDe = new Map();
      for (const [clase, ids] of Object.entries(x.practica)) for (const id of ids) clasesDe.set(id, [...(clasesDe.get(id) ?? []), clase]);
      for (const q of x.qs) {
        const senales = [];
        // Lo reservado para el examen final no se enseña en ningún informe (docs/CUARENTENA.md): ni su enunciado ni su idea.
        const reservada = x.reservadas.has(q.id);
        // 1. Posición en el examen oficial.
        const pos = senalPosicion(q, utPos, completos);
        if (pos) {
          const reparto = Object.entries(pos.cuenta).map(([ut, n]) => `${n}× ${titulo(Number(ut))}`).join(', ');
          senales.push({ tipo: 'posicion', propuesto: pos.mayoritario, fuerte: pos.mayoritario !== q.ut && !pos.empate,
            texto: `el tribunal la puso en bloques distintos (${reparto})` });
        }
        // 2. Idea (concepto principal): temas de sus vecinas y de las clases donde se enseña.
        const c = x.etiquetas[q.id]?.[0];
        if (c) {
          const cuenta = { ...porConcepto.get(c) };
          cuenta[q.ut] -= 1;
          const n = Object.values(cuenta).reduce((s, v) => s + v, 0);
          const [utMay, nMay] = Object.entries(cuenta).sort((a, z) => z[1] - a[1])[0] ?? [];
          if (n >= MIN_VECINAS && Number(utMay) !== q.ut && nMay / n >= UMBRAL_CONCEPTO) {
            senales.push({ tipo: 'concepto', base: 'vecinas', propuesto: Number(utMay), texto: `${nMay} de las otras ${n} preguntas de su idea${reservada ? '' : ` (${c})`} están en ${titulo(Number(utMay))}` });
          } else {
            const uts = [...new Set((catalogo.get(c)?.clases ?? []).map((id) => utDeClase[tit].get(id)).filter((u) => u != null))];
            if (uts.length === 1 && uts[0] !== q.ut) senales.push({ tipo: 'concepto', base: 'clases', propuesto: uts[0], texto: `su idea${reservada ? '' : ` (${c})`} solo se enseña en clases de ${titulo(uts[0])}` });
          }
        }
        // 3. Práctica de una clase de otro tema.
        const fuera = (clasesDe.get(q.id) ?? []).filter((id) => utDeClase[tit].has(id) && utDeClase[tit].get(id) !== q.ut);
        if (fuera.length) {
          const uts = [...new Set(fuera.map((id) => utDeClase[tit].get(id)))];
          const ex = excepciones[x.eje]?.[tit]?.[q.id];
          senales.push({ tipo: 'practica', propuesto: uts[0], clases: fuera, ...(ex ? { excepcion: ex.tipo } : {}), texto: `sale en la práctica de ${fuera.join(', ')} (${uts.map(titulo).join(', ')})${ex ? ` · excepción revisada «${ex.tipo}»` : ''}` });
        }
        // 4. Vocabulario.
        const { puntos, n } = modelo.puntuar(q);
        if (n >= MIN_PALABRAS) {
          const [utV, pV] = Object.entries(puntos).sort((a, z) => z[1] - a[1])[0];
          const margen = pV - puntos[q.ut];
          if (Number(utV) !== q.ut && margen >= MARGEN_VOCAB) senales.push({ tipo: 'vocabulario', propuesto: Number(utV), margen: Number(margen.toFixed(1)), texto: `su texto se parece mucho más al de ${titulo(Number(utV))} (margen ${margen.toFixed(1)})` });
        }
        if (!senales.length) continue;
        // Propuesto: el de la posición si es fuerte; si no, el tema más votado por las señales (distinto del actual).
        const votos = {};
        for (const s of senales) if (s.propuesto !== q.ut) votos[s.propuesto] = (votos[s.propuesto] ?? 0) + 1;
        const posFuerte = senales.find((s) => s.tipo === 'posicion' && s.fuerte);
        const masVotado = Object.entries(votos).sort((a, z) => z[1] - a[1])[0];
        const propuesto = posFuerte ? posFuerte.propuesto : masVotado ? Number(masVotado[0]) : q.ut;
        const acuerdo = new Set(senales.filter((s) => s.propuesto === propuesto).map((s) => s.tipo)).size;
        filas.push({
          eje: x.eje, tit, id: q.id, conv: q.conv, ut: q.ut, tema: titulo(q.ut), propuesto, temaPropuesto: titulo(propuesto),
          nivel: posFuerte || (propuesto !== q.ut && acuerdo >= 2) ? 'fuerte' : 'candidata',
          senales: senales.map(({ fuerte, ...s }) => s), reservada,
          enunciado: reservada ? null : q.enunciado,
        });
      }
    }
  }
  return { filas, bancos: bancos.map((x) => ({ eje: x.eje, tit: x.tit, preguntas: x.qs.length })) };
}

const TIPOS = ['posicion', 'concepto', 'practica', 'vocabulario'];
const MARCA_NOTAS = '<!-- notas -->';

/** El informe en Markdown (resumen y, con `detalle`, cada candidata). */
export function informe({ filas, bancos }, { detalle = true } = {}) {
  const L = ['# Auditoría de temas', '',
    'Generado con `node tools/auditoria-temas.mjs --escribir`. Preguntas sospechosas de estar en el tema equivocado, por',
    'eje y titulación. El `ut` de cada pregunta es el bloque del examen oficial en que salió; las señales dicen que, por',
    'su contenido, el alumno la espera en otro tema (qué mide cada una, en la cabecera de la herramienta). Nada de esto',
    'cambia datos: son candidatas para revisar. Las reservadas para el examen final van sin enunciado.', '',
    '## Resumen', '',
    `| Eje | Tit. | Preguntas | Candidatas | Fuertes | ${TIPOS.join(' | ')} | Reservadas |`, `|---|---|---|---|---|${TIPOS.map(() => '---').join('|')}|---|`];
  for (const b of bancos) {
    const fs = filas.filter((f) => f.eje === b.eje && f.tit === b.tit);
    L.push(`| ${b.eje} | ${b.tit} | ${b.preguntas} | ${fs.length} | ${fs.filter((f) => f.nivel === 'fuerte').length} | ${TIPOS.map((t) => fs.filter((f) => f.senales.some((s) => s.tipo === t)).length).join(' | ')} | ${fs.filter((f) => f.reservada).length} |`);
  }
  L.push('', `Total: ${filas.length} candidatas (${filas.filter((f) => f.nivel === 'fuerte').length} fuertes) de ${bancos.reduce((s, b) => s + b.preguntas, 0)} preguntas. Una pregunta puede tener varias señales.`, '');
  if (!detalle) return L.join('\n');
  for (const b of bancos) {
    const fs = filas.filter((f) => f.eje === b.eje && f.tit === b.tit);
    if (!fs.length) continue;
    L.push(`## ${b.eje} · ${b.tit}`, '');
    for (const nivel of ['fuerte', 'candidata']) {
      const sub = fs.filter((f) => f.nivel === nivel).sort((a, z) => a.ut - z.ut || a.id.localeCompare(z.id));
      if (!sub.length) continue;
      L.push(`### ${nivel === 'fuerte' ? 'Fuertes' : 'Candidatas'} (${sub.length})`, '', '| id | Tema actual | Propuesto | Señales | Enunciado |', '|---|---|---|---|---|');
      for (const f of sub) {
        const texto = f.reservada ? '_(reservada para el examen final: no se enseña)_' : String(f.enunciado ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').slice(0, 160);
        L.push(`| ${f.id} | ${f.ut} · ${f.tema} | ${f.propuesto === f.ut ? '(el mismo)' : `${f.propuesto} · ${f.temaPropuesto}`} | ${f.senales.map((s) => `**${s.tipo}**: ${s.texto}`).join('; ').replace(/\|/g, '\\|')} | ${texto} |`);
      }
      L.push('');
    }
  }
  return L.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await auditar();
  const args = process.argv.slice(2);
  if (args.includes('--json')) { console.log(JSON.stringify(r.filas, null, 1)); process.exit(0); }
  if (args.includes('--escribir')) {
    const dir = join(RAIZ, '.trabajo-ux');
    mkdirSync(dir, { recursive: true });
    // Lo que haya escrito a mano tras la marca (el antes y el después de una corrección) se conserva.
    const ruta = join(dir, 'AUDITORIA-temas.md');
    let notas = '';
    try { const antes = readFileSync(ruta, 'utf8'); if (antes.includes(MARCA_NOTAS)) notas = antes.slice(antes.indexOf(MARCA_NOTAS)); } catch { /* aún no existe */ }
    writeFileSync(ruta, `${informe(r)}\n${notas}`);
    console.log(`Escrito .trabajo-ux/AUDITORIA-temas.md (${r.filas.length} candidatas).`);
  }
  console.log(informe(r, { detalle: args.includes('--detalle') }));
}
