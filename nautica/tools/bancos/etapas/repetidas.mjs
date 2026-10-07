// Etapa 3 · repetidas
// Entrada: extraer-<tit>.json (apariciones). Salida: repetidas-<tit>.json → { preguntas, ambiguas }.
// Une en una sola pregunta (con `apareceEn`) las apariciones que son la misma pregunta:
//   - permutaciones de un mismo juego (DGMM T01≡T03, T02≡T04; Andalucía modelo A/B; Murcia tipo 1/2),
//   - exámenes idénticos con letras distintas (Baleares Menorca/Eivissa),
//   - preguntas que se repiten entre convocatorias (si config.repetidas.entreConvocatorias; en Andalucía no, porque sus
//     ids son por convocatoria y no cambian).
// Criterio (documentado en docs/EXTRACCION.md):
//   UNIR      si las cuatro opciones coinciden como conjunto (texto canónico: sin tildes, mayúsculas, signos ni orden)
//             y el enunciado tiene Jaccard de palabras ≥ 0,90; o si la similitud total es ≥ 0,97.
//   AMBIGUA   si 0,80 ≤ similitud total y no se cumple lo anterior: NO se unen; se listan en el informe.
// Nunca se unen dos apariciones del mismo examen (misma convocatoria y modelo).
// Decisiones a mano (opcional): tools/bancos/ejes/<eje>/repetidas.json → { decisiones: [{ tit, a, b, decision, motivo }] }
// con a/b = «conv/modelo/número». «unir» une una pareja aunque no llegue al umbral (variantes de erratas revisadas);
// «separar» impide que dos apariciones acaben en la misma pregunta, aunque superen el umbral o se unan por cadena.
import { join } from 'node:path';
import { dirEje, escribirJSON, leerJSON, rutaEtapa } from '../lib/comun.mjs';
import { clave, similitud, tokens } from '../lib/texto.mjs';
import { asignarIds, idsExistentes } from '../lib/ids.mjs';

export const UMBRAL = { enunciadoUnir: 0.9, totalUnir: 0.97, ambigua: 0.8 };

const examen = (a) => `${a.conv}|${a.modelo ?? ''}|${a.modulo ?? ''}`;

/** ¿Es la misma pregunta? → 'unir' | 'ambigua' | null */
export function decidir(a, b) {
  const s = similitud(a, b);
  const oa = Object.values(a.opciones).map(clave).sort().join('|');
  const ob = Object.values(b.opciones).map(clave).sort().join('|');
  if ((oa === ob && Object.keys(a.opciones).length === 4 && s.enunciado >= UMBRAL.enunciadoUnir) || s.total >= UMBRAL.totalUnir) return { decision: 'unir', s };
  if (s.total >= UMBRAL.ambigua) return { decision: 'ambigua', s };
  return { decision: null, s };
}

/** Pares candidatos por índice invertido de palabras poco frecuentes (evita comparar todo con todo). */
function candidatos(aps, mismoGrupo) {
  const toks = aps.map((a) => new Set(tokens(`${a.enunciado} ${Object.values(a.opciones).join(' ')}`)));
  const df = new Map();
  for (const t of toks) for (const w of t) df.set(w, (df.get(w) ?? 0) + 1);
  const limite = Math.max(30, aps.length * 0.02);
  const indice = new Map();
  toks.forEach((t, i) => { for (const w of t) if (df.get(w) <= limite) { if (!indice.has(w)) indice.set(w, []); indice.get(w).push(i); } });
  const pares = [];
  // Idénticas (texto canónico): siempre candidatas, aunque no tengan palabras raras.
  const exactas = new Map();
  aps.forEach((a, i) => {
    const k = `${clave(a.enunciado)}||${Object.values(a.opciones).map(clave).sort().join('|')}`;
    if (!exactas.has(k)) exactas.set(k, []);
    exactas.get(k).push(i);
  });
  for (const g of exactas.values()) for (let x = 1; x < g.length; x++) for (let y = 0; y < x; y++) if (mismoGrupo(g[y], g[x])) pares.push([g[y], g[x]]);
  toks.forEach((t, i) => {
    const comunes = new Map();
    for (const w of t) for (const j of indice.get(w) ?? []) if (j > i) comunes.set(j, (comunes.get(j) ?? 0) + 1);
    const raras = [...t].filter((w) => df.get(w) <= limite).length || 1;
    for (const [j, c] of comunes) if (c / raras >= 0.5 && mismoGrupo(i, j)) pares.push([i, j]);
  });
  return pares;
}

/** Correspondencia de letras de una aparición con las de la pregunta canónica (por el texto de la opción). */
export function mapaLetras(canon, ap) {
  const mapa = {};
  const libres = new Set(Object.keys(canon.opciones));
  for (const [l, t] of Object.entries(ap.opciones)) {
    const k = clave(t);
    const igual = [...libres].find((c) => clave(canon.opciones[c]) === k);
    if (igual) { mapa[l] = igual; libres.delete(igual); }
  }
  for (const [l, t] of Object.entries(ap.opciones)) {
    if (mapa[l]) continue;
    let mejor = null;
    for (const c of libres) {
      const s = similitud({ enunciado: '', opciones: { x: t } }, { enunciado: '', opciones: { x: canon.opciones[c] } }).opciones;
      if (!mejor || s > mejor.s) mejor = { c, s };
    }
    if (mejor && mejor.s >= 0.5) { mapa[l] = mejor.c; libres.delete(mejor.c); }
  }
  // Opciones reescritas (p. ej. «dos esferas negras» / «dos bolas negras» en dos opciones a la vez): segunda pasada,
  // emparejando uno a uno las que quedan por su mayor parecido (≥ 0,3).
  const resto = [];
  for (const [l, t] of Object.entries(ap.opciones)) {
    if (mapa[l]) continue;
    for (const c of libres) resto.push({ l, c, s: similitud({ enunciado: '', opciones: { x: t } }, { enunciado: '', opciones: { x: canon.opciones[c] } }).opciones });
  }
  resto.sort((x, y) => y.s - x.s);
  for (const r of resto) if (!mapa[r.l] && libres.has(r.c) && r.s >= 0.3) { mapa[r.l] = r.c; libres.delete(r.c); }
  // Si solo queda una opción sin pareja a cada lado (una opción reescrita entre exámenes), son la misma.
  const sueltas = Object.keys(ap.opciones).filter((l) => !mapa[l]);
  if (sueltas.length === 1 && libres.size === 1) mapa[sueltas[0]] = [...libres][0];
  return mapa;
}

export function agrupar(apariciones, { entreConvocatorias = true, ordenModelos = [], permutaciones = false, decisiones = [] } = {}) {
  const n = apariciones.length;
  const padre = [...Array(n).keys()];
  const raiz = (i) => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
  const examenesDe = new Map(apariciones.map((a, i) => [i, new Set([examen(a)])]));
  const miembros = new Map(apariciones.map((a, i) => [i, [i]]));
  const ambiguas = [];
  const mismoGrupo = (i, j) => entreConvocatorias || apariciones[i].conv === apariciones[j].conv;
  // Decisiones a mano, por referencia de aparición.
  const indice = new Map(apariciones.map((a, i) => [ref(a), i]));
  const forzadas = new Map();
  const separar = new Map();
  const aplicadas = [];
  for (const d of decisiones) {
    const i = indice.get(d.a);
    const j = indice.get(d.b);
    if (i === undefined || j === undefined) continue;
    aplicadas.push(d);
    if (d.decision === 'unir') forzadas.set(`${Math.min(i, j)}|${Math.max(i, j)}`, d.motivo ?? 'decisión a mano');
    else if (d.decision === 'separar') { for (const [x, y] of [[i, j], [j, i]]) { if (!separar.has(x)) separar.set(x, new Set()); separar.get(x).add(y); } }
  }
  const vistos = new Set();
  const pares = [...candidatos(apariciones, mismoGrupo), ...[...forzadas.keys()].map((k) => k.split('|').map(Number))]
    .filter(([i, j]) => { const k = `${Math.min(i, j)}|${Math.max(i, j)}`; if (vistos.has(k)) return false; vistos.add(k); return true; })
    .map(([i, j]) => {
      const d = decidir(apariciones[i], apariciones[j]);
      const f = forzadas.get(`${Math.min(i, j)}|${Math.max(i, j)}`);
      return { i, j, ...d, ...(f ? { decision: 'unir', motivo: f } : {}) };
    })
    .filter((p) => p.decision)
    .sort((x, y) => Number(Boolean(forzadas.get(`${Math.min(y.i, y.j)}|${Math.max(y.i, y.j)}`))) - Number(Boolean(forzadas.get(`${Math.min(x.i, x.j)}|${Math.max(x.i, x.j)}`))) || y.s.total - x.s.total);
  const prohibido = (ri, rj) => miembros.get(ri).some((x) => separar.has(x) && miembros.get(rj).some((y) => separar.get(x).has(y)));
  for (const p of pares) {
    const ri = raiz(p.i);
    const rj = raiz(p.j);
    if (ri === rj) continue;
    if (p.decision === 'ambigua') { ambiguas.push(p); continue; }
    const ei = examenesDe.get(ri);
    const ej = examenesDe.get(rj);
    if ([...ei].some((e) => ej.has(e))) { ambiguas.push({ ...p, motivo: 'mismo examen' }); continue; }
    if (separar.size && prohibido(ri, rj)) continue;
    padre[rj] = ri;
    for (const e of ej) ei.add(e);
    miembros.get(ri).push(...miembros.get(rj));
  }
  // Modelos que son permutaciones del mismo juego (Andalucía A/B): las apariciones que quedan sueltas se emparejan
  // uno a uno con la más parecida del otro modelo (similitud ≥ 0,6). Son diferencias de texto entre modelos: se listan.
  const emparejadas = [];
  if (permutaciones) {
    const sueltas = new Map();
    apariciones.forEach((a, i) => {
      const r = raiz(i);
      if (apariciones.some((b, j) => j !== i && raiz(j) === r)) return;
      const k = a.conv;
      if (!sueltas.has(k)) sueltas.set(k, []);
      sueltas.get(k).push(i);
    });
    // Solo se emparejan exámenes que ya son permutaciones uno del otro: los que comparten al menos la mitad de sus
    // preguntas unidas (DGMM: T01≡T03 sí; T01 y T02, juegos distintos con alguna pregunta común, no).
    const enlaces = new Map();
    const tam = new Map();
    const porRaiz = new Map();
    apariciones.forEach((a, i) => {
      tam.set(examen(a), (tam.get(examen(a)) ?? 0) + 1);
      const r = raiz(i);
      if (!porRaiz.has(r)) porRaiz.set(r, new Set());
      porRaiz.get(r).add(examen(a));
    });
    for (const exs of porRaiz.values()) {
      const l = [...exs];
      for (const x of l) for (const y of l) if (x < y) enlaces.set(`${x}~${y}`, (enlaces.get(`${x}~${y}`) ?? 0) + 1);
    }
    const permutados = (x, y) => {
      if (x === y) return false;
      const k = x < y ? `${x}~${y}` : `${y}~${x}`;
      return (enlaces.get(k) ?? 0) >= 0.5 * Math.min(tam.get(x), tam.get(y));
    };
    for (const idx of sueltas.values()) {
      const cand = [];
      for (const i of idx) for (const j of idx) if (i < j && permutados(examen(apariciones[i]), examen(apariciones[j]))) cand.push({ i, j, s: similitud(apariciones[i], apariciones[j]) });
      cand.sort((x, y) => y.s.total - x.s.total);
      const usado = new Set();
      for (const c of cand) {
        if (usado.has(c.i) || usado.has(c.j) || c.s.total < 0.6) continue;
        usado.add(c.i); usado.add(c.j);
        padre[raiz(c.j)] = raiz(c.i);
        emparejadas.push({ a: ref(apariciones[c.i]), b: ref(apariciones[c.j]), similitud: Number(c.s.total.toFixed(3)), enunciadoA: apariciones[c.i].enunciado.slice(0, 200), enunciadoB: apariciones[c.j].enunciado.slice(0, 200) });
      }
    }
  }
  const grupos = new Map();
  apariciones.forEach((a, i) => { const r = raiz(i); if (!grupos.has(r)) grupos.set(r, []); grupos.get(r).push(a); });
  const rango = (m) => { const k = ordenModelos.indexOf(m); return k < 0 ? 99 : k; };
  const orden = (a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '') || a.conv.localeCompare(b.conv) || rango(a.modelo) - rango(b.modelo) || String(a.modelo ?? '').localeCompare(String(b.modelo ?? '')) || a.orden - b.orden;
  const preguntas = [...grupos.values()].map((g) => {
    g.sort(orden);
    // La canónica es la primera aparición completa (cuatro opciones con texto): un PDF con una página cortada puede
    // traer la pregunta incompleta en un modelo y entera en su permutación.
    const completa = (a) => Object.keys(a.opciones).length === 4 && Object.values(a.opciones).every((t) => String(t).trim());
    const canon = g.find(completa) ?? g[0];
    const apareceEn = g.map((a) => {
      const mapa = a === canon ? Object.fromEntries(Object.keys(a.opciones).map((l) => [l, l])) : mapaLetras(canon, a);
      return {
        conv: a.conv, modelo: a.modelo ?? a.modulo ?? null, numero: a.numero, orden: a.orden, mapa,
        respuesta: { ...a.respuesta, letras: a.respuesta.letras.map((l) => mapa[l] ?? `?${l}`), letrasOriginales: a.respuesta.letras },
        fecha: a.fecha, fuentes: a.fuentes, paginaPDF: a.paginaPDF, notaTribunal: a.notaTribunal ?? null,
      };
    });
    return { ...canon, apareceEn };
  });
  const ambiguasInfo = ambiguas.map((p) => ({
    a: ref(apariciones[p.i]), b: ref(apariciones[p.j]), similitud: Number(p.s.total.toFixed(3)), motivo: p.motivo ?? 'umbral',
    enunciadoA: apariciones[p.i].enunciado.slice(0, 160), enunciadoB: apariciones[p.j].enunciado.slice(0, 160),
  }));
  const ya = new Set(emparejadas.map((e) => `${e.a}~${e.b}`));
  // Las parejas ambiguas que una decisión a mano ya resolvió (unidas por cadena o separadas a propósito) no se listan.
  const decididas = new Set(aplicadas.flatMap((d) => [`${d.a}~${d.b}`, `${d.b}~${d.a}`]));
  const grupoDe = new Map();
  apariciones.forEach((a, i) => grupoDe.set(ref(a), raiz(i)));
  const pendientes = ambiguasInfo.filter((x) => !ya.has(`${x.a}~${x.b}`) && !ya.has(`${x.b}~${x.a}`) && !decididas.has(`${x.a}~${x.b}`) && grupoDe.get(x.a) !== grupoDe.get(x.b));
  return { preguntas, ambiguas: pendientes, emparejadas, decisiones: aplicadas };
}

export const ref = (a) => `${a.conv}/${a.modelo ?? a.modulo ?? '-'}/${a.numero}`;

export async function repetidas(ctx) {
  const out = {};
  const cfg = ctx.config.repetidas ?? {};
  for (const tit of ctx.tits) {
    const { apariciones } = leerJSON(rutaEtapa(ctx.eje, 'extraer', tit));
    const decisiones = leerJSON(join(dirEje(ctx.eje), 'repetidas.json'), { decisiones: [] }).decisiones.filter((d) => !d.tit || d.tit === tit);
    const { preguntas, ambiguas, emparejadas, decisiones: aplicadas } = agrupar(apariciones, { entreConvocatorias: cfg.entreConvocatorias ?? true, ordenModelos: cfg.ordenModelos ?? [], permutaciones: cfg.permutaciones ?? false, decisiones });
    const ids = asignarIds(preguntas, ctx.config, tit, idsExistentes(ctx.eje, tit));
    // Los ids publicados no se pierden: si una pregunta publicada ya no sale (el PDF ha cambiado o el analizador la lee
    // distinta), se avisa; la etapa «escribir» la conserva tal cual.
    for (const id of ids.perdidos) ctx.avisos.add('repetidas', `pregunta publicada que ya no sale de la extracción: ${id}`);
    preguntas.sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '') || a.conv.localeCompare(b.conv) || a.orden - b.orden || a.id.localeCompare(b.id));
    escribirJSON(rutaEtapa(ctx.eje, 'repetidas', tit), { eje: ctx.eje, tit, preguntas, ambiguas, emparejadas, decisiones: aplicadas, perdidos: ids.perdidos });
    out[tit] = { apariciones: apariciones.length, preguntas: preguntas.length, ambiguas: ambiguas.length, emparejadas: emparejadas.length, multiples: preguntas.filter((p) => p.apareceEn.length > 1).length, decisiones: aplicadas.length };
  }
  return out;
}
