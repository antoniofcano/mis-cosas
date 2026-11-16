// Simulacro con estrategia (R-57) y ensayo general (R-66). Funciones puras (sin DOM): la vista solo pinta lo que sale
// de aquí (tests/plan-examen.test.js y tests/motor.test.js lo vigilan).
//
// Cose lo que ya existe en vez de repetirlo:
//  - el tipo de problema de cada pregunta y tu tiempo por tipo: «Tu velocidad en carta» (src/course/velocidad.js);
//  - el tiempo que te deja el examen por pregunta: el presupuesto orientativo de la estrategia (src/course/estrategia.js);
//  - tus fallos con nombre por tipo: el cuaderno de fallos (src/course/cuaderno.js, solo se lee);
//  - qué opciones son imposibles con los datos: src/course/descarte.js.
//
// Tres piezas para antes, durante y después del reloj:
//  1. El primer minuto (`primerMinuto`): hojear el cuadernillo antes de empezar: qué tipos trae, cuáles te son fáciles y
//     cuáles caros, y dónde están las tablas (Anuario de Mareas), los desvíos, la declinación y los faros de la carta.
//  2. El reparto del tiempo (`planExamen`, `avisoPlan`): qué preguntas primero, cuáles al final y cuáles no merecen la
//     pena si vas justo; durante el simulacro, un aviso discreto si te desvías.
//  3. El informe (`informePlan`, `cansancio`): plan frente a lo que hiciste, dónde habría convenido estimar y, en el
//     ensayo general, la primera mitad del tiempo frente a la segunda.
// Nada de esto cambia cómo se puntúa: la corrección sigue siendo `grade` (src/theory/engine.js).

import { estructuraModulo, totalPreguntas } from '../theory/blocks.js';
import { nombreTipo, MIN_CONSEJO, duracion } from './velocidad.js';
import { descartes, pistaEstimar } from './descarte.js';
import { cuenta } from '../texto.js';

/** Tipos de problema que se resuelven con cuentas (tabla, calculadora); el resto lleva trazado en la carta. */
export const TIPOS_CUENTAS = ['marea-sonda', 'conversion-rumbos', 'hora', 'estima-analitica', 'ct-enfilacion'];

/** Un aviso de pregunta salta cuando llevas en ella esta parte más de lo que le daba el plan (y al menos AVISO_MIN_S). */
export const AVISO_PREGUNTA = 1.5;
export const AVISO_MIN_S = 90;
/** Un aviso de ritmo salta cuando vas por detrás del plan más de esto (segundos o fracción del tiempo). */
export const RETRASO_S = 180;
export const RETRASO_FRACCION = 0.08;
/** Mínimo de preguntas contestadas en cada mitad para comparar el cansancio. */
export const MIN_MITAD = 4;

export const COSTES = { facil: 'Fácil para ti', normal: 'Normal', caro: 'Cara para ti' };
export const COSTES_ORIENTATIVOS = { facil: 'Rápida', normal: 'Cuentas', caro: 'Lleva trazado' };

/**
 * Lo que cuesta un tipo de problema a ESTE alumno.
 * Con datos (fila de velocidadPorTipo con MIN_CONSEJO muestras o más): «caro» si te pasas del tiempo disponible o
 * fallas más de la mitad; «fácil» si cabe holgado (≤ 75 %) y aciertas tres de cada cuatro; si no, «normal». Un fallo
 * abierto de tu cuaderno en ese tipo baja un escalón lo fácil. Sin datos, el reparto orientativo: la teoría es rápida,
 * las de cuentas son normales y las de trazado, caras (lo dice como orientativo).
 * @returns {{ coste: 'facil'|'normal'|'caro', fuente: 'tuyo'|'orientativo', motivo: string, estimadoS: number }}
 */
export function costeTipo(tipo, fila, disp, fallos = []) {
  const carta = tipo !== 'teoria';
  const dispS = (carta ? disp?.cartaS : disp?.teoriaS) ?? disp?.mediaS ?? 90;
  if (fila && fila.n >= MIN_CONSEJO) {
    const tasa = fila.aciertos / fila.n;
    let coste = fila.estado === 'se-pasa' || tasa < 0.5 ? 'caro' : fila.estado === 'cabe' && tasa >= 0.75 ? 'facil' : 'normal';
    const partes = [`tardas ${duracion(fila.mediaS)} de media`, `aciertas ${fila.aciertos} de ${fila.n}`];
    if (fallos.length && coste === 'facil') coste = 'normal';
    if (fallos.length) partes.push(`tienes abierto «${fallos[0]}»`);
    return { coste, fuente: 'tuyo', motivo: partes.join(', '), estimadoS: fila.mediaS };
  }
  const coste = !carta ? 'facil' : TIPOS_CUENTAS.includes(tipo) ? 'normal' : 'caro';
  const motivo = !carta ? 'teoría: a ritmo' : coste === 'normal' ? 'se resuelve con cuentas' : 'hay que trazar en la carta';
  return { coste, fuente: 'orientativo', motivo: fallos.length ? `${motivo}; tienes abierto «${fallos[0]}»` : motivo, estimadoS: dispS };
}

/**
 * Las preguntas del examen con su tipo, su coste para ti y el tiempo que te llevarían.
 * @param {{ preguntas: object[], tipos: Record<string,string>, filas?: object[], disp: object, fallosPorTipo?: Record<string,string[]> }} o
 *   tipos: id → tipo de problema; filas: velocidadPorTipo; disp: tiempoDisponible; fallosPorTipo: tipo → nombres de
 *   fallos abiertos del cuaderno
 */
export function clasificar({ preguntas, tipos, filas = [], disp, fallosPorTipo = {} }) {
  const porTipo = new Map(filas.map((f) => [f.tipo, f]));
  return preguntas.map((q, i) => {
    const tipo = tipos[q.id] ?? 'teoria';
    const c = costeTipo(tipo, porTipo.get(tipo), disp, fallosPorTipo[tipo] ?? []);
    return { n: i + 1, id: q.id, ut: q.ut, tipo, nombre: nombreTipo(tipo), carta: tipo !== 'teoria', ...c };
  });
}

const ORDEN_COSTE = { facil: 0, normal: 1, caro: 2 };

/**
 * El reparto del tiempo de un examen (o de una parte): qué primero, qué después, qué al final y qué no merece la pena
 * si vas justo, con un presupuesto por pregunta y los hitos para mirar el reloj.
 *  - Primero, la teoría (rápida y segura, como dice la estrategia), en el orden del cuadernillo.
 *  - Después, la carta que te es fácil o normal, de la más rápida a la más lenta.
 *  - Al final, la carta cara para ti.
 *  - Si no cabe todo, las caras más lentas son las que no merecen la pena, sin pasar del límite de fallos del tema
 *    (dejar una en blanco cuenta como fallo): como mucho maxErrores − 1 por tema, para que quede margen.
 * El presupuesto de cada pregunta es su tiempo estimado, escalado si no cabe todo en el tiempo (menos el repaso).
 * @param {{ items: object[], estructura: object, duracionMin: number, repasoFraccion?: number }} o  items: clasificar()
 */
export function planExamen({ items, estructura, duracionMin, repasoFraccion = 0.1 }) {
  const totalS = duracionMin * 60;
  const repasoS = Math.round(totalS * repasoFraccion);
  const disponibleS = totalS - repasoS;
  const teoria = items.filter((x) => !x.carta);
  const carta = [...items.filter((x) => x.carta)].sort((a, b) => ORDEN_COSTE[a.coste] - ORDEN_COSTE[b.coste] || a.estimadoS - b.estimadoS || a.n - b.n);
  const despues = carta.filter((x) => x.coste !== 'caro');
  const final = carta.filter((x) => x.coste === 'caro');
  const orden = [...teoria, ...despues, ...final];
  const estimadoS = orden.reduce((s, x) => s + x.estimadoS, 0);
  const f = estimadoS > disponibleS ? disponibleS / estimadoS : 1;
  const presupuesto = Object.fromEntries(orden.map((x) => [x.id, Math.round(x.estimadoS * f)]));
  // Las que no merecen la pena si vas justo: de las caras, las más lentas, sin acercarse al límite de fallos del tema.
  const cupo = new Map((estructura?.bloques ?? []).map((b) => [b.ut, b.maxErrores != null ? Math.max(0, b.maxErrores - 1) : Infinity]));
  const prescindibles = [];
  for (const x of [...final].sort((a, b) => b.estimadoS - a.estimadoS)) {
    const c = cupo.get(x.ut) ?? Infinity;
    if (c <= 0 || prescindibles.length >= 3) continue;
    cupo.set(x.ut, c - 1);
    prescindibles.push(x.n);
  }
  const fases = [
    { id: 'primero', titulo: 'Primero', texto: 'La teoría, de corrido: marca las dudosas y sigue.', items: teoria },
    { id: 'despues', titulo: 'Después', texto: 'La carta que te sale bien, de la más rápida a la más lenta.', items: despues },
    { id: 'final', titulo: 'Al final', texto: 'La carta que más te cuesta. Si vas justo, estima y descarta.', items: final },
  ].filter((x) => x.items.length).map((x) => ({ ...x, numeros: x.items.map((i) => i.n), minutos: Math.round(x.items.reduce((s, i) => s + presupuesto[i.id], 0) / 60), items: undefined }));
  let acum = 0;
  const hitos = fases.map((x) => { acum += x.minutos; return { minuto: Math.min(duracionMin, acum), texto: `Acabado «${x.titulo.toLowerCase()}»` }; });
  hitos.push({ minuto: Math.round((totalS - repasoS) / 60), texto: 'Empieza el repaso de las marcadas' });
  const faltaS = Math.max(0, estimadoS - disponibleS);
  return {
    duracionMin, repasoMin: Math.round(repasoS / 60), disponibleS, estimadoS: Math.round(estimadoS), cabe: faltaS === 0, faltaS: Math.round(faltaS),
    conDatos: items.some((x) => x.carta && x.fuente === 'tuyo'), orden: orden.map((x) => x.id), presupuesto, fases, hitos,
    prescindibles: prescindibles.sort((a, b) => a - b),
  };
}

/** El plan en lo mínimo que hace falta guardar con el examen a medias (para el aviso y el informe). */
export const planCompacto = (p) => ({ orden: p.orden, presupuesto: p.presupuesto, fases: p.fases.map((f) => ({ id: f.id, titulo: f.titulo, numeros: f.numeros, minutos: f.minutos })),
  prescindibles: p.prescindibles, disponibleS: p.disponibleS, duracionMin: p.duracionMin, cabe: p.cabe, hitos: p.hitos });

/**
 * El aviso discreto durante el simulacro, o null. Uno solo, el más útil:
 *  - «pregunta»: llevas en esta más de AVISO_PREGUNTA veces lo que le daba el plan (y al menos AVISO_MIN_S);
 *  - «ritmo»: con las que llevas contestadas, el plan habría gastado bastante menos tiempo que tú.
 * @param {{ plan: object, consumidoS: number, actual?: { id: string, n: number, s: number, tipo?: string }, respondidas: number }} o
 */
export function avisoPlan({ plan, consumidoS, actual = null, respondidas = 0 }) {
  if (!plan?.orden?.length) return null;
  const ps = plan.presupuesto ?? {};
  if (actual && ps[actual.id] != null) {
    const tope = Math.max(AVISO_MIN_S, AVISO_PREGUNTA * ps[actual.id]);
    if (actual.s > tope) {
      const pres = (plan.prescindibles ?? []).includes(actual.n);
      return { tipo: 'pregunta', texto: `Llevas ${duracion(actual.s)} en la ${actual.n}; tu plan le daba ${duracion(ps[actual.id])}. ${pres ? 'Es de las que no merecen la pena si vas justo: si' : 'Si'} no sale, descarta lo imposible, marca y sigue.`, pista: actual.tipo ? pistaEstimar(actual.tipo) : null };
    }
  }
  const k = Math.min(respondidas, plan.orden.length);
  const planS = plan.orden.slice(0, k).reduce((s, id) => s + (ps[id] ?? 0), 0);
  const retraso = consumidoS - planS;
  const umbral = Math.max(RETRASO_S, RETRASO_FRACCION * (plan.disponibleS ?? 0));
  if (consumidoS > umbral && retraso > umbral) {
    return { tipo: 'ritmo', texto: `Vas unos ${cuenta(Math.round(retraso / 60), 'minuto')} por detrás de tu plan. Sigue el orden: lo caro, al final.`, pista: null };
  }
  return null;
}

/**
 * Hito del ensayo en papel (sin tiempo por pregunta): el último hito pasado, para recordarlo sin interrumpir.
 * @returns {{ minuto: number, texto: string } | null}
 */
export function hitoActual(plan, consumidoS) {
  const min = consumidoS / 60;
  return [...(plan?.hitos ?? [])].reverse().find((h) => min >= h.minuto) ?? null;
}

/**
 * El primer minuto: hojear el cuadernillo antes de que corra el reloj.
 * @param {{ preguntas: object[], items: object[], esDeCarta?: (q) => boolean }} o
 * @returns {{ recuento: object[], localizar: { id: string, titulo: string, texto: string, numeros: number[] }[], faros: string[], conDatos: boolean }}
 */
export function primerMinuto({ preguntas, items, esDeCarta = () => false }) {
  const porId = new Map(items.map((x) => [x.id, x]));
  const recuento = [];
  for (const x of items) {
    let r = recuento.find((y) => y.tipo === x.tipo);
    if (!r) recuento.push(r = { tipo: x.tipo, nombre: x.nombre, carta: x.carta, coste: x.coste, fuente: x.fuente, motivo: x.motivo, numeros: [] });
    r.numeros.push(x.n);
  }
  recuento.sort((a, b) => (a.carta - b.carta) || ORDEN_COSTE[a.coste] - ORDEN_COSTE[b.coste] || a.numeros[0] - b.numeros[0]);
  const nums = (f) => preguntas.map((q, i) => (f(q, porId.get(q.id)) ? i + 1 : null)).filter(Boolean);
  const tx = (q) => `${q.enunciado_comun ?? ''} ${q.enunciado ?? ''}`;
  const localizar = [
    { id: 'mareas', titulo: 'Anuario de Mareas', texto: 'Busca la tabla de mareas (en el anexo o con el enunciado): el día, las pleamares y bajamares en UT y sus alturas. Antes de calcular, apunta el adelanto.',
      numeros: nums((q, x) => q.tabla_mareas?.length || x?.tipo === 'marea-sonda' || /anuario|marea/i.test(tx(q))) },
    { id: 'desvios', titulo: 'Desvíos', texto: 'Apunta cada desvío con su signo (o búscalo en la tablilla de desvíos si el enunciado la cita).',
      numeros: nums((q) => /desv[ií]o/i.test(tx(q))) },
    { id: 'declinacion', titulo: 'Declinación de la carta', texto: 'Donde dan la declinación «de la carta» con su año y su variación, actualízala al año del enunciado antes de nada.',
      numeros: nums((q) => /\d{4}\s*\(\s*\d+\s*[′'´’]?\s*[EW]\s*\)|declinaci[oó]n magn[eé]tica (?:de la carta|indicada)/i.test(tx(q))) },
    { id: 'anexos', titulo: 'Figuras y anexos', texto: 'Las que traen figura, tabla o un enunciado común: localízalos ahora para no buscarlos con el reloj encima.',
      numeros: nums((q) => (q.figuras?.length || q.contexto || q.enunciado_comun) && !q.tabla_mareas?.length) },
    { id: 'carta', titulo: 'Datos de la carta', texto: 'Las de carta: localiza en la carta los faros y puntos que nombran (abajo) y deja a mano el transportador y el compás.',
      numeros: nums((q, x) => esDeCarta(q) || (x?.carta && !TIPOS_CUENTAS.includes(x.tipo))) },
  ].filter((x) => x.numeros.length);
  // Faros y puntos que se nombran en las de carta: para ubicarlos de un vistazo antes de empezar.
  const faros = new Set();
  for (const q of preguntas) {
    if (!esDeCarta(q)) continue;
    for (const m of tx(q).matchAll(/(?:faro|luz)(?: roja| verde)?(?: de(?:l| la)?)?\s+((?:(?:Pta\.|Punta|Cabo|Isla de|Isla|Puerto de)\s+)?[A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+(?:de\s+|del\s+)?[A-ZÁÉÍÓÚ][a-záéíóúñ]+)?)/g)) faros.add(m[1].replace(/^Pta\./, 'Punta'));
  }
  return { recuento, localizar, faros: [...faros].slice(0, 10), conDatos: items.some((x) => x.carta && x.fuente === 'tuyo') };
}

/**
 * El informe del plan al terminar: cada fase, lo que le daba el plan frente a lo que tardaste y cuántas acertaste; y
 * dónde habría convenido estimar: preguntas que fallaste, dejaste en blanco o te comieron el tiempo, en las que los
 * datos del enunciado permitían descartar opciones imposibles (src/course/descarte.js).
 * @param {{ plan: object, preguntas: object[], detalle: { id, ok, respuesta }[], segundos?: Record<string, number> }} o
 *   segundos: tiempo por pregunta (sin él, como en el ensayo en papel, no se compara el tiempo)
 */
export function informePlan({ plan, preguntas, detalle, segundos = null }) {
  const det = new Map(detalle.map((d) => [d.id, d]));
  const ps = plan?.presupuesto ?? {};
  const idDe = new Map(preguntas.map((q, i) => [i + 1, q.id]));
  const fases = (plan?.fases ?? []).map((f) => {
    const ids = f.numeros.map((n) => idDe.get(n)).filter(Boolean);
    const real = segundos ? ids.reduce((s, id) => s + (segundos[id] ?? 0), 0) : null;
    return { id: f.id, titulo: f.titulo, n: ids.length, aciertos: ids.filter((id) => det.get(id)?.ok).length, planMin: f.minutos, realMin: real == null ? null : Math.round(real / 60) };
  });
  const estimar = [];
  preguntas.forEach((q, i) => {
    const d = det.get(q.id);
    if (!d || d.anulada || d.retirada) return;
    const s = segundos?.[q.id] ?? null;
    const largo = s != null && ps[q.id] != null && s > Math.max(AVISO_MIN_S, AVISO_PREGUNTA * ps[q.id]);
    if (d.ok && !largo) return;
    const x = descartes(q);
    if (!x) return;
    estimar.push({ n: i + 1, id: q.id, s, presupuestoS: ps[q.id] ?? null, ok: d.ok, enBlanco: !d.respuesta, quedan: x.quedan, descartadas: x.descartadas,
      reglas: x.reglas.map((r) => ({ nombre: r.nombre, cota: r.cota })),
      motivo: !d.respuesta ? 'la dejaste en blanco' : !d.ok ? (x.descartadas.includes(d.respuesta) ? `marcaste la ${d.respuesta}), que era imposible` : 'la fallaste') : `te llevó ${duracion(s)} (tu plan le daba ${duracion(ps[q.id])})` });
  });
  const desvio = fases.filter((f) => f.realMin != null && f.realMin > f.planMin + 2);
  const texto = !plan ? null
    : desvio.length ? `Te pasaste del plan en ${desvio.map((f) => `«${f.titulo.toLowerCase()}» (${f.realMin} min de ${f.planMin})`).join(' y ')}.`
      : fases.some((f) => f.realMin != null) ? 'Seguiste tu reparto del tiempo.' : null;
  return { fases, estimar, texto };
}

/**
 * ¿Te cansas? La primera mitad del tiempo frente a la segunda: cuántas contestaste en cada una, cuántas bien y cuánto
 * tardaste frente a lo que les daba el plan (así no pesa que la carta, más larga, vaya al final). Cada pregunta cuenta
 * en la mitad en que la contestaste (`marcas`: id → milisegundos del reloj del examen al contestarla).
 * null si no hay al menos MIN_MITAD contestadas en cada mitad.
 * @param {{ marcas: Record<string, number>, totalMs: number, detalle: { id, ok }[], segundos?: Record<string, number>, presupuesto?: Record<string, number> }} o
 */
export function cansancio({ marcas = {}, totalMs, detalle, segundos = {}, presupuesto = {} }) {
  if (!(totalMs > 0)) return null;
  const ok = new Map(detalle.map((d) => [d.id, d.ok]));
  const mitad = (m) => (m < totalMs / 2 ? 0 : 1);
  const ms = [[], []];
  for (const [id, m] of Object.entries(marcas)) if (ok.has(id) && Number.isFinite(m)) ms[mitad(m)].push(id);
  if (ms.some((x) => x.length < MIN_MITAD)) return null;
  const resumen = (ids) => {
    const conPlan = ids.filter((id) => presupuesto[id] > 0 && segundos[id] > 0);
    const ritmo = conPlan.length ? conPlan.reduce((s, id) => s + segundos[id], 0) / conPlan.reduce((s, id) => s + presupuesto[id], 0) : null;
    return { n: ids.length, aciertos: ids.filter((id) => ok.get(id)).length, tasa: ids.filter((id) => ok.get(id)).length / ids.length, ritmo };
  };
  const [a, b] = ms.map(resumen);
  const baja = a.tasa - b.tasa >= 0.15;
  const lento = a.ritmo != null && b.ritmo != null && b.ritmo - a.ritmo >= 0.25;
  const pct = (x) => `${Math.round(100 * x)} %`;
  const texto = baja && lento ? `En la segunda mitad bajaste: acertaste el ${pct(b.tasa)} (antes, el ${pct(a.tasa)}) y fuiste más lento respecto a tu plan. El cansancio cuenta: en el examen, una pausa de un minuto a mitad (respira, bebe agua) y lo caro, con la cabeza fresca.`
    : baja ? `En la segunda mitad acertaste menos: el ${pct(b.tasa)} frente al ${pct(a.tasa)}. Puede ser cansancio o que lo difícil iba al final; repítelo en otro ensayo general para saberlo.`
      : lento ? 'En la segunda mitad fuiste más lento respecto a tu plan, aunque acertaste igual. Ojo con el reloj al final: ahí es donde más cuesta.'
        : `Aguantaste: en la segunda mitad acertaste el ${pct(b.tasa)} (en la primera, el ${pct(a.tasa)}) y a un ritmo parecido.`;
  return { primera: a, segunda: b, baja, lento, texto };
}

// ---------------------------------------------------------------------------------------------------------------
// Ensayo general (R-66): teoría y carta seguidas, con los tiempos del tribunal

/**
 * Las partes del ensayo general, cada una con su estructura y su tiempo oficial:
 *  - PY: el módulo genérico y el de navegación seguidos (45 + 75 minutos, RD 875/2014); con el foco del alumno en un
 *    módulo (src/course/foco.js), solo ese.
 *  - PER (sin módulos): el examen entero.
 * @param {object} estructura  T.estructura
 * @param {{ id: string } | null} foco  focoModulo()
 */
export function partesGeneral(estructura, foco = null) {
  const ms = estructura?.modulos ?? [];
  if (!ms.length) return [{ id: 'completo', titulo: 'Examen completo', estructura, duracionMin: estructura.duracionMin, preguntas: totalPreguntas(estructura) }];
  const ids = foco && ms.some((m) => m.id === foco.id) ? [foco.id] : ms.map((m) => m.id);
  return ids.map((id) => { const E = estructuraModulo(estructura, id); return { id, titulo: E.titulo, estructura: E, duracionMin: E.duracionMin, preguntas: totalPreguntas(E) }; });
}

/** Tiempo total del ensayo general (minutos) y su descripción en una línea. */
export function resumenGeneral(partes) {
  const min = partes.reduce((s, p) => s + p.duracionMin, 0);
  return { minutos: min, texto: partes.length > 1 ? `${partes.map((p) => `${p.titulo} (${cuenta(p.preguntas, 'pregunta')}, ${p.duracionMin} min)`).join(' y, sin pausa, ')}: ${cuenta(min, 'minuto')} en total.` : `${partes[0].titulo}: ${cuenta(partes[0].preguntas, 'pregunta')} en ${cuenta(min, 'minuto')}.` };
}

/** Texto compacto del plan para `nautica.state()`. */
export function resumenPlan(plan) {
  if (!plan) return '';
  return `PLAN: ${plan.fases.map((f) => `${f.titulo} ${f.numeros.join(',')} (${f.minutos} min)`).join(' · ')}${plan.prescindibles.length ? ` · si vas justo, no merecen la pena: ${plan.prescindibles.join(', ')}` : ''}`;
}
