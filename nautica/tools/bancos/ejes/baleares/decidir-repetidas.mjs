// Decisiones sobre preguntas repetidas de Baleares (tools/bancos/ejes/baleares/repetidas.json).
// El tribunal recicla mucho su banco interno, pero al copiar las preguntas de un examen a otro corrige erratas, cambia la
// puntuación o reordena las opciones; el umbral genérico de la etapa «repetidas» deja miles de esas parejas como
// «ambiguas». Este script las revisa con una regla más fina y deja escrita cada decisión (con su motivo) para que la
// etapa la aplique y el informe la liste. Nada se une en silencio: lo que no cumple la regla sigue como ambigua.
//
// MISMA PREGUNTA (se unen) si, comparando enunciado y opciones (emparejadas por su texto):
//   - las cifras son las mismas (datos, años, distancias) y no cambia ninguna negación (no, nunca, incorrecta, excepto…);
//   - las palabras que cambian son solo palabras vacías (artículos, preposiciones…) o erratas: pares de palabras de 4+
//     letras a distancia de edición ≤ 2 (≤ 1 si tienen menos de 6), como mucho 4 en el enunciado y 2 por opción;
//   - ninguna de las palabras que cambian es «de sentido» (babor/estribor, proa/popa, norte/sur…, colores, mayor/menor…);
//   - las opciones que citan otras («A y B son correctas») citan las mismas opciones una vez traducidas las letras.
// SEPARAR: dos apariciones que la etapa uniría por umbral (mismas opciones y enunciado muy parecido) pero cuyo texto
//   difiere en una cifra, una negación o una palabra de sentido (p. ej. «cardinal Este» / «cardinal Oeste» con las
//   mismas cuatro opciones): son preguntas distintas.
// Uso: node tools/bancos/ejes/baleares/decidir-repetidas.mjs   (tras la etapa extraer; luego --desde repetidas)
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, dirEje, escribirTexto, leerJSON, rutaEtapa } from '../../lib/comun.mjs';
import { clave } from '../../lib/texto.mjs';
import { agrupar, ref } from '../../etapas/repetidas.mjs';

const EJE = 'baleares';
const VACIAS = new Set('a al el la los las lo un una unos unas de del en y o u e que se su sus por para con es son le les nos mas muy ya pues dicho dicha esto este esta estos estas ese esa eso cual cuales cuando donde como deberemos debemos podemos podremos sera seran ha han hay qu cuanto ser estar esta estan tiene tienen hacer haremos'.split(' '));
const SENTIDO = new Set(('babor estribor proa popa norte sur este oeste nordeste noreste noroeste sudeste sureste sudoeste suroeste levante poniente ' +
  'mayor menor mayores menores mas menos superior inferior encima debajo arriba abajo izquierda derecha delante detras dentro fuera ' +
  'blanca blanco blancas blancos roja rojo rojas rojos verde verdes amarilla amarillo amarillas negra negro negras negros azul ' +
  'base bases vertice vertices alcanzado alcanzando alcanza alcanzante dia noche diurna nocturna maxima maximo minima minimo ' +
  'aumenta disminuye aumentar disminuir sube baja subir bajar entrante saliente creciente menguante pleamar bajamar ' +
  'avante atras ciar avance retroceso dextrogira levogira cerrada abierta larga corta largo corto alta alto altas altos ' +
  'primera primero segunda segundo tercera tercero cuarta cuarto anterior posterior antes despues siempre todas todos ninguna ninguno ' +
  'estable inestable positiva negativa positivo negativo calido frio caliente fria seca seco humedo humeda ' +
  'cardinal lateral especial aislado nuevo arterial venosa venoso capilar entrar salir entrada salida entrando saliendo motor vela remo ' +
  'latitud longitud mar tierra caer caemos caigo dar damos gobierno varado fondeado pesca arrastre remolque remolcado remolcando ' +
  'sincronismo barlovento sotavento ascendente descendente ciclon anticiclon borrasca alta baja frente calido frio ocluido').split(' '));
const NEGACION = /\b(no|nunca|jamas|incorrect[ao]s?|fals[ao]s?|excepto|salvo|ningun[ao]?)\b/g;

const tok = (s) => clave(s).split(' ').filter(Boolean);
const cifras = (s) => (clave(s).match(/\d+/g) ?? []).join(',');
const negaciones = (s) => (clave(s).match(NEGACION) ?? []).sort().join(',');
const lev = (a, b) => {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
};

/**
 * Diferencias de palabras entre dos textos → { erratas, motivo } (motivo = por qué NO son el mismo texto, o null).
 * Primero se buscan los cambios de sentido (cifras, negaciones, palabras de sentido —también si solo cambian de orden,
 * «hacia proa o hacia popa» / «hacia popa o proa»— y siglas o letras sueltas como «clase A» / «clase C»); después,
 * las palabras cambiadas que no son erratas.
 */
export function difTexto(x, y, maxErratas) {
  if (cifras(x) !== cifras(y)) return { motivo: 'cifras distintas' };
  if (negaciones(x) !== negaciones(y)) return { motivo: 'negación distinta' };
  const tx = tok(x);
  const ty = tok(y);
  const secuencia = (ts) => ts.filter((t) => SENTIDO.has(t)).join(' ');
  const cuenta = (ts) => ts.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map());
  const A = cuenta(tx);
  const B = cuenta(ty);
  const soloA = [];
  const soloB = [];
  for (const [t, n] of A) for (let k = 0; k < n - (B.get(t) ?? 0); k++) soloA.push(t);
  for (const [t, n] of B) for (let k = 0; k < n - (A.get(t) ?? 0); k++) soloB.push(t);
  const sentido = [...soloA, ...soloB].find((t) => SENTIDO.has(t) || (t.length <= 2 && !VACIAS.has(t)));
  if (sentido) return { motivo: `palabra de sentido «${sentido}»` };
  if (secuencia(tx) !== secuencia(ty)) return { motivo: `palabra de sentido (orden: «${secuencia(tx)}» / «${secuencia(ty)}»)` };
  let erratas = 0;
  const restoB = [...soloB];
  let suelta = null;
  for (const t of soloA) {
    if (VACIAS.has(t)) continue;
    const i = restoB.findIndex((u) => t.length >= 4 && u.length >= 4 && lev(t, u) <= (Math.min(t.length, u.length) < 6 ? 1 : 2));
    if (i < 0) { suelta ??= t; continue; }
    restoB.splice(i, 1);
    erratas++;
  }
  suelta ??= restoB.find((u) => !VACIAS.has(u));
  if (suelta) return { motivo: `palabra «${suelta}»` };
  if (erratas > maxErratas) return { motivo: `${erratas} palabras cambiadas` };
  return { erratas, motivo: null };
}

/** ¿Cambian el sentido? (cifras, negación o palabra de sentido) → motivo o null. */
export function cambioDeSentido(x, y) {
  const d = difTexto(x, y, 99);
  return d.motivo && /cifras|negación|sentido/.test(d.motivo) ? d.motivo : null;
}

const REF_LETRAS = /\b([A-D])\b(?=[^.]*\b(correct|incorrect|anteriores|verdader|son|es)\w*)/g;
const letrasCitadas = (t) => [...String(t).matchAll(REF_LETRAS)].map((m) => m[1].toLowerCase());

/** ¿Misma pregunta? → { mismo: bool, motivo, mapa } */
export function mismaPregunta(a, b) {
  const e = difTexto(a.enunciado, b.enunciado, 4);
  if (e.motivo) return { mismo: false, motivo: `enunciado: ${e.motivo}` };
  const la = Object.keys(a.opciones);
  const lb = Object.keys(b.opciones);
  if (la.length !== 4 || lb.length !== 4) return { mismo: false, motivo: 'opciones incompletas' };
  // Emparejar opciones: primero texto idéntico, luego la de menos diferencias.
  const mapa = {};
  const libres = new Set(lb);
  for (const l of la) {
    const igual = [...libres].find((m) => clave(a.opciones[l]) === clave(b.opciones[m]));
    if (igual) { mapa[l] = igual; libres.delete(igual); }
  }
  for (const l of la.filter((x) => !mapa[x])) {
    let mejor = null;
    for (const m of libres) {
      const d = difTexto(a.opciones[l], b.opciones[m], 2);
      if (!d.motivo && (!mejor || d.erratas < mejor.erratas)) mejor = { m, erratas: d.erratas };
    }
    if (!mejor) {
      // Las opciones que solo citan letras («A y B son correctas») se comparan después, traducidas.
      if (letrasCitadas(a.opciones[l]).length >= 2) continue;
      return { mismo: false, motivo: `opción ${l}) «${a.opciones[l].slice(0, 60)}» sin pareja` };
    }
    mapa[l] = mejor.m;
    libres.delete(mejor.m);
  }
  for (const l of la.filter((x) => !mapa[x])) {
    const citadas = letrasCitadas(a.opciones[l]).map((x) => mapa[x]).sort().join();
    const m = [...libres].find((y) => letrasCitadas(b.opciones[y]).sort().join() === citadas && !difTexto(a.opciones[l].replace(/\b[A-D]\b/g, ''), b.opciones[y].replace(/\b[A-D]\b/g, ''), 2).motivo);
    if (!m) return { mismo: false, motivo: `opción ${l}) cita otras opciones distintas` };
    mapa[l] = m;
    libres.delete(m);
  }
  // Opciones que citan letras y emparejaron por texto («A y B son correctas» ↔ «A y B son correctas»): las letras citadas
  // tienen que ser las mismas opciones.
  for (const l of la) {
    const ca = letrasCitadas(a.opciones[l]);
    if (ca.length < 2) continue;
    if (ca.map((x) => mapa[x]).sort().join() !== letrasCitadas(b.opciones[mapa[l]]).sort().join()) return { mismo: false, motivo: `opción ${l}) cita otras opciones distintas` };
  }
  return { mismo: true, motivo: e.erratas ? `erratas o puntuación (${e.erratas} palabras del enunciado)` : 'mismo texto salvo puntuación, palabras vacías o el orden de las opciones', mapa };
}

/**
 * Segunda regla: las cuatro opciones son las mismas (texto canónico, en cualquier orden) y el enunciado está
 * reformulado sin cambiar cifras, negaciones ni palabras de sentido y conserva al menos la mitad de sus palabras
 * («tres esferas negras» / «tres bolas negras», «de los faros…» añadido). Con las mismas opciones, el alumno ve la
 * misma pregunta.
 */
export function mismasOpcionesReformulada(a, b) {
  const oa = Object.values(a.opciones).map(clave).sort().join('|');
  const ob = Object.values(b.opciones).map(clave).sort().join('|');
  if (Object.keys(a.opciones).length !== 4 || oa !== ob) return null;
  const e = difTexto(a.enunciado, b.enunciado, 99);
  if (e.motivo && /cifras|negación|sentido/.test(e.motivo)) return null;
  const j = jac(a.enunciado, b.enunciado);
  if (j < 0.5 || !mismaRespuesta(a, b)) return null;
  return `mismas opciones; enunciado reformulado (Jaccard ${j.toFixed(2)}) y misma respuesta oficial`;
}

/**
 * ¿La respuesta oficial es la misma opción en las dos? (por el texto de las opciones marcadas). El tribunal reutiliza a
 * veces las mismas cuatro opciones para preguntar lo contrario («caer a babor» / «dar atrás», «al entrar» / «al salir»):
 * si la respuesta cambia, no es la misma pregunta.
 */
export function mismaRespuesta(a, b) {
  const ta = (a.respuesta?.letras ?? []).map((l) => a.opciones[l] ?? '');
  const tb = (b.respuesta?.letras ?? []).map((l) => b.opciones[l] ?? '');
  if (!ta.length || ta.length !== tb.length) return false;
  return ta.every((x) => tb.some((y) => clave(x) === clave(y) || (jac(x, y) >= 0.6 && !cambioDeSentido(x, y))));
}

const jac = (x, y) => { const A = new Set(tok(x)); const B = new Set(tok(y)); let i = 0; for (const t of A) if (B.has(t)) i++; return i / Math.max(1, A.size + B.size - i); };

/**
 * Parejas ambiguas que son claramente preguntas distintas → motivo (o null si siguen siendo dudosas):
 *   - el enunciado cambia una cifra, una negación o una palabra de sentido;
 *   - variante: alguna opción no tiene ninguna parecida en la otra pregunta (Jaccard de palabras < 0,5): el tribunal
 *     ha reescrito las opciones y el alumno ve otra pregunta (se agrupan por «concepto» para compartir explicación).
 */
export function distintas(a, b) {
  const e = difTexto(a.enunciado, b.enunciado, 99);
  if (e.motivo && /cifras|negación|sentido/.test(e.motivo)) return `enunciado distinto (${e.motivo})`;
  const ob = Object.values(b.opciones);
  const sueltas = Object.values(a.opciones).filter((o) => !ob.some((p) => jac(o, p) >= 0.5));
  if (sueltas.length) return `variante con otras opciones (${sueltas.length} sin equivalente)`;
  const oa = Object.values(a.opciones);
  for (const [o, p] of oa.map((o) => [o, ob.reduce((m, q) => (jac(o, q) > jac(o, m) ? q : m), ob[0])])) {
    const d = difTexto(o, p, 99);
    if (d.motivo && /cifras|negación|sentido/.test(d.motivo)) return `una opción cambia de sentido (${d.motivo})`;
  }
  return null;
}

/**
 * Tercera regla: el enunciado es el mismo (o reformulado sin cambiar de sentido, Jaccard ≥ 0,5) y las opciones están
 * retocadas: cada una tiene su pareja en la otra pregunta (Jaccard de palabras ≥ 0,5, emparejamiento uno a uno), sin
 * cambios de cifras, negaciones ni palabras de sentido, y la respuesta oficial de las dos es la misma opción emparejada
 * («luz de tope» / «luz o luces de tope», «emisoras costeras» / «estaciones costeras»). Si la respuesta no coincide, la
 * pareja sigue como ambigua y se revisa a mano.
 */
export function opcionesRetocadas(a, b) {
  const e = difTexto(a.enunciado, b.enunciado, 99);
  if (e.motivo && /cifras|negación|sentido/.test(e.motivo)) return null;
  if (jac(a.enunciado, b.enunciado) < 0.5) return null;
  const la = Object.keys(a.opciones);
  const lb = Object.keys(b.opciones);
  if (la.length !== 4 || lb.length !== 4) return null;
  const pares = [];
  for (const x of la) for (const y of lb) pares.push({ x, y, j: clave(a.opciones[x]) === clave(b.opciones[y]) ? 2 : jac(a.opciones[x], b.opciones[y]) });
  pares.sort((p, q) => q.j - p.j);
  const mapa = {};
  const usadas = new Set();
  for (const p of pares) if (!mapa[p.x] && !usadas.has(p.y) && p.j >= 0.5) { mapa[p.x] = p.y; usadas.add(p.y); }
  if (Object.keys(mapa).length !== 4) return null;
  for (const x of la) {
    const d = difTexto(a.opciones[x], b.opciones[mapa[x]], 99);
    if (d.motivo && /cifras|negación|sentido/.test(d.motivo)) return null;
    const ca = letrasCitadas(a.opciones[x]);
    if (ca.length >= 2 && ca.map((l) => mapa[l]).sort().join() !== letrasCitadas(b.opciones[mapa[x]]).sort().join()) return null;
  }
  const ra = (a.respuesta?.letras ?? []).map((l) => mapa[l]).sort().join();
  const rb = [...(b.respuesta?.letras ?? [])].sort().join();
  if (!ra || ra !== rb) return null;
  return 'opciones retocadas (cada una con su pareja); misma respuesta oficial';
}

/** Huella de las figuras de una aparición (el mismo texto puede ir con otra imagen: «¿qué nube vemos en la imagen?»). */
const huellas = new Map();
const huellaFiguras = (a) => (a.figuras ?? []).map((f) => {
  if (!huellas.has(f)) huellas.set(f, createHash('sha256').update(readFileSync(join(RAIZ, 'data', 'ejes', EJE, f))).digest('hex'));
  return huellas.get(f);
}).join(',');
/** Figuras incompatibles: las dos llevan figura y no es la misma (si una no la lleva, es el PDF que la perdió). */
const otraFigura = (a, b) => Boolean(a.figuras?.length && b.figuras?.length && huellaFiguras(a) !== huellaFiguras(b));
const mencionaImagen = (a) => /\bim[aá]gen|adjunt|figura\b|fotograf/i.test(a.enunciado);

/** ¿Cambia el sentido? (para separar parejas que el umbral uniría) */
function sentidoDistinto(a, b) {
  if (otraFigura(a, b)) return 'otra figura (la imagen de la pregunta es distinta)';
  if (mencionaImagen(a) && !(a.figuras?.length || b.figuras?.length)) return null;
  const e = difTexto(a.enunciado, b.enunciado, 99);
  if (e.motivo && /cifras|negación|sentido/.test(e.motivo)) return `enunciado: ${e.motivo}`;
  // Enunciado reformulado (no solo erratas) y otra respuesta: es otra pregunta con las mismas opciones.
  if (difTexto(a.enunciado, b.enunciado, 4).motivo && !mismaRespuesta(a, b)) return 'enunciado reformulado y otra respuesta oficial';
  return null;
}

if (process.argv[1]?.endsWith('decidir-repetidas.mjs')) {
  const decisiones = [];
  const resumen = {};
  for (const tit of ['per', 'py']) {
    const { apariciones } = leerJSON(rutaEtapa(EJE, 'extraer', tit));
    const { preguntas, ambiguas } = agrupar(apariciones, { entreConvocatorias: true });
    const porRef = new Map(apariciones.map((a) => [ref(a), a]));
    const r = { unir: 0, separar: 0, ambiguasRestantes: 0, motivos: {} };
    // 1. Grupos que la etapa formaría: separar las apariciones que cambian de sentido respecto a la canónica.
    for (const p of preguntas) {
      if (p.apareceEn.length < 2) continue;
      const canon = porRef.get(`${p.apareceEn[0].conv}/${p.apareceEn[0].modelo ?? '-'}/${p.apareceEn[0].numero}`);
      for (const ap of p.apareceEn.slice(1)) {
        const b = porRef.get(`${ap.conv}/${ap.modelo ?? '-'}/${ap.numero}`);
        const m = sentidoDistinto(canon, b);
        if (m) { decisiones.push({ tit, a: ref(canon), b: ref(b), decision: 'separar', motivo: m }); r.separar++; }
      }
    }
    // 2. Parejas ambiguas: unir las que solo difieren en erratas.
    for (const x of ambiguas) {
      if (x.motivo === 'mismo examen') continue;
      const a = porRef.get(x.a);
      const b = porRef.get(x.b);
      if (otraFigura(a, b)) { decisiones.push({ tit, a: x.a, b: x.b, decision: 'separar', motivo: 'otra figura (la imagen de la pregunta es distinta)' }); r.separar++; continue; }
      const m = mismaPregunta(a, b);
      if (m.mismo) { decisiones.push({ tit, a: x.a, b: x.b, decision: 'unir', motivo: m.motivo }); r.unir++; continue; }
      const f = mismasOpcionesReformulada(a, b) ?? opcionesRetocadas(a, b);
      if (f) { decisiones.push({ tit, a: x.a, b: x.b, decision: 'unir', motivo: f }); r.unir++; r.motivos[f.split(';')[0].split(' (')[0]] = (r.motivos[f.split(';')[0].split(' (')[0]] ?? 0) + 1; continue; }
      const d = distintas(a, b);
      if (d) { decisiones.push({ tit, a: x.a, b: x.b, decision: 'separar', motivo: d }); r.separar++; const k = d.replace(/«.*»/, '«…»'); r.motivos[k] = (r.motivos[k] ?? 0) + 1; continue; }
      r.ambiguasRestantes++;
      const k = `ambigua: ${m.motivo.replace(/«.*»/, '«…»').replace(/opción [a-d]\)/, 'opción')}`;
      r.motivos[k] = (r.motivos[k] ?? 0) + 1;
      if (process.env.VER && k.includes(process.env.VER)) console.log('---', x.a, x.b, '\n A', a.enunciado, JSON.stringify(a.opciones), '\n B', b.enunciado, JSON.stringify(b.opciones));
    }
    resumen[tit] = r;
  }
  const descripcion = 'Decisiones sobre preguntas repetidas (generadas por decidir-repetidas.mjs con la regla documentada en ese fichero; revisadas por muestreo). unir: misma pregunta con erratas, puntuación u opciones reordenadas. separar: el umbral genérico las uniría, pero cambian una cifra, una negación o una palabra de sentido.';
  escribirTexto(join(dirEje(EJE), 'repetidas.json'), `{"eje": "${EJE}",\n"descripcion": ${JSON.stringify(descripcion)},\n"decisiones": [\n${decisiones.map((d) => JSON.stringify(d)).join(',\n')}\n]}\n`);
  console.log(JSON.stringify(resumen, null, 1));
}
