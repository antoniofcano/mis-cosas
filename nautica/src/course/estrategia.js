// Estrategia de examen (#/<tit>/estrategia): cómo HACER el examen. Funciones puras (sin DOM) con dos capas:
//  1. La estrategia del examen de una titulación y un tribunal: cifras (preguntas, tiempo, aprobado, colchón, límites
//     por tema, módulos) que salen de la estructura oficial (src/theory/blocks.js) y de la ficha del eje, un presupuesto
//     de tiempo orientativo y los textos de data/comun/estrategia.json, filtrados por titulación y tribunal.
//  2. Tu estrategia: con los exámenes hechos (progress.tests(): porTema y minutos) y «¿Estás listo?» (src/course/listo.js),
//     el tema con límite en que más cerca estás de suspender, tu tiempo frente al del examen y dos o tres consejos.
//
// Regla de rigor: nada sobre el examen se afirma aquí si no sale de la estructura, de la ficha del eje o de una fuente
// citada en los datos. Lo que no está comprobado para un tribunal se dice como pendiente (docs/ROADMAP.md, principio 1).

import { totalPreguntas } from '../theory/blocks.js';
import { calculadoraPermitida } from '../calculadora/reglas.js';
import { esRutaDeExamen } from './chuletario.js';
import { cuenta } from '../texto.js';

/** Simulacros completos recientes que se tienen en cuenta para «Tu estrategia». */
export const SIMULACROS_ESTRATEGIA = 5;
/** Fracción del tiempo del examen a partir de la cual se va «justo». */
export const JUSTO = 0.9;
/** Fracción del tiempo del examen por debajo de la cual se va «holgado». */
export const HOLGADO = 0.6;

/** «1,5»: decimales con coma, sin ceros de más. */
export const num = (x, d = 1) => String(Math.round(x * 10 ** d) / 10 ** d).replace('.', ',');

/**
 * ¿Se puede enseñar la estrategia ahora? Nunca con un examen en marcha (modo examen) ni en una dirección de examen
 * (simulacro, convocatoria real o examen final): ahí solo el alumno, el reloj y las reglas.
 * @param {{ modo?: string|null, hash?: string }} o  modo: el de src/ui/modo-examen.js; hash: location.hash
 */
export function estrategiaPermitida({ modo = null, hash = '' } = {}) {
  return !modo && !esRutaDeExamen(hash);
}

/** Una fuente escrita en texto con su URL dentro («BOJA … https://…pdf») → { titulo, corto, url }. */
export function partirFuente(texto) {
  const url = String(texto).match(/https?:\/\/\S+/)?.[0]?.replace(/[.,;)]+$/, '') ?? null;
  const titulo = String(texto).replace(url ?? '', '').replace(/\s+/g, ' ').replace(/[\s.]+$/, '').trim();
  // Lo corto: hasta los dos puntos (la cita literal que sigue sobra en una línea de fuente).
  return { titulo, corto: titulo.split(':')[0].trim(), url };
}

/**
 * Las cifras del examen de una titulación en un tribunal.
 * @param {object} T  TITULACIONES[tit]
 * @param {object|null} ficha  ficha del eje (banco.eje)
 */
export function cifrasExamen(T, ficha = null) {
  const E = T.estructura;
  const preguntas = totalPreguntas(E);
  const colchon = preguntas - E.minAciertos;
  const limites = E.bloques.filter((b) => b.maxErrores != null)
    .map((b) => ({ ut: b.ut, titulo: b.titulo, corto: b.corto ?? b.titulo, ico: b.ico, n: b.n, maxErrores: b.maxErrores, minBien: b.n - b.maxErrores }));
  const enLimites = limites.reduce((s, b) => s + b.maxErrores, 0);
  const modulos = (E.modulos ?? []).map((m) => {
    const bs = E.bloques.filter((b) => m.uts.includes(b.ut));
    const n = bs.reduce((s, b) => s + b.n, 0);
    return { id: m.id, titulo: m.titulo, duracionMin: m.duracionMin, preguntas: n, minPorPregunta: m.duracionMin / n, temas: bs.map((b) => b.titulo), limites: bs.filter((b) => b.maxErrores != null).map((b) => b.titulo) };
  });
  const delEje = ficha?.examen?.[T.id] ?? {};
  return {
    sigla: T.sigla, nombre: T.nombre, preguntas, duracionMin: E.duracionMin, minPorPregunta: E.duracionMin / preguntas,
    minAciertos: E.minAciertos, colchon, limites, enLimites, colchonLibre: Math.max(0, colchon - enLimites),
    sinLimite: E.bloques.filter((b) => b.maxErrores == null).map((b) => b.titulo), modulos,
    calculadora: { permitida: calculadoraPermitida(T.id, ficha), fuente: typeof delEje.calculadora === 'boolean' ? (delEje.calculadoraFuente ? partirFuente(delEje.calculadoraFuente) : { id: 'ficha', titulo: 'Ficha del tribunal en la app', corto: 'ficha del tribunal en la app', url: null }) : null },
    reglasTribunal: delEje.reglas ?? [],
  };
}

/**
 * Presupuesto de tiempo orientativo (consejo, no norma): por tramo (el examen entero o cada módulo), la teoría a un ritmo
 * fijo (`minTeoria` por pregunta), una fracción para el repaso final y el resto para la carta (lleva dibujo y cuenta).
 * Si el tramo no tiene carta, lo que sobra es margen para las dudosas. `hito`: minuto en que debería acabar la primera
 * pasada de teoría.
 * @param {object} T  TITULACIONES[tit] (estructura y cartaUt)
 * @param {{ minTeoria: number, repasoFraccion: number }} cfg  data/comun/estrategia.json → tiempo
 */
export function presupuestoTiempo(T, { minTeoria = 1.2, repasoFraccion = 0.1 } = {}) {
  const E = T.estructura;
  const tramos = E.modulos?.length
    ? E.modulos.map((m) => ({ id: m.id, titulo: m.titulo, duracionMin: m.duracionMin, bloques: E.bloques.filter((b) => m.uts.includes(b.ut)) }))
    : [{ id: 'examen', titulo: 'Examen', duracionMin: E.duracionMin, bloques: E.bloques }];
  return tramos.map((t) => {
    const nCarta = t.bloques.filter((b) => b.ut === T.cartaUt).reduce((s, b) => s + b.n, 0);
    const nTeoria = t.bloques.reduce((s, b) => s + b.n, 0) - nCarta;
    const repaso = Math.round(t.duracionMin * repasoFraccion);
    const teoria = Math.round(nTeoria * minTeoria);
    const resto = Math.max(0, t.duracionMin - repaso - teoria);
    const filas = [{ parte: 'teoria', nombre: 'Teoría', preguntas: nTeoria, minutos: teoria, porPregunta: nTeoria ? teoria / nTeoria : null }];
    if (nCarta) filas.push({ parte: 'carta', nombre: 'Carta (dibujo y cuenta)', preguntas: nCarta, minutos: resto, porPregunta: resto / nCarta });
    else filas.push({ parte: 'margen', nombre: 'Margen para las dudosas', preguntas: null, minutos: resto, porPregunta: null });
    filas.push({ parte: 'repaso', nombre: 'Repaso final', preguntas: null, minutos: repaso, porPregunta: null });
    return { id: t.id, titulo: t.titulo, duracionMin: t.duracionMin, filas, hito: teoria, cartaDesde: nCarta ? teoria : null, repasoDesde: t.duracionMin - repaso };
  });
}

/**
 * El tiempo que te deja el examen por pregunta (R-42, «Tu velocidad en carta»): por pregunta de carta y de teoría,
 * según el presupuesto orientativo (presupuestoTiempo), y la media del examen. En segundos. En el PY, el del módulo
 * que tiene la carta.
 */
export function tiempoDisponible(T, cfg = {}) {
  const pres = presupuestoTiempo(T, cfg);
  const conCarta = pres.find((t) => t.filas.some((f) => f.parte === 'carta')) ?? pres[0];
  const fila = (p) => conCarta.filas.find((f) => f.parte === p);
  const E = T.estructura;
  return { cartaS: fila('carta')?.porPregunta != null ? fila('carta').porPregunta * 60 : null, teoriaS: fila('teoria')?.porPregunta != null ? fila('teoria').porPregunta * 60 : null,
    mediaS: (E.duracionMin / totalPreguntas(E)) * 60, tramo: pres.length > 1 ? conCarta.titulo : null };
}

/** Una norma lleva su fuente legible: «Convocatoria 2025… (base quinta 5)». */
function conFuente(item, fuentes) {
  const f = item.fuente ? fuentes?.[item.fuente] : null;
  return { tipo: item.tipo === 'norma' ? 'norma' : 'consejo', texto: item.texto, fuente: f ? { id: item.fuente, titulo: f.titulo, corto: f.corto ?? f.titulo, url: f.url ?? null, ref: item.ref ?? null } : null };
}

/**
 * Los textos de la estrategia para una titulación y un tribunal (data/comun/estrategia.json), ya filtrados: sin lo
 * de otra titulación, con la regla de «si no la sabes» según esté comprobado o no cómo corrige ese tribunal, la
 * calculadora según la ficha y las normas con su fuente.
 * @param {object} datos  data/comun/estrategia.json
 * @param {{ tit: string, eje: string, calculadora: boolean }} o
 */
export function textosEstrategia(datos, { tit, eje, calculadora }) {
  const trib = datos.tribunales?.[eje] ?? null;
  const verificado = !!trib?.correccion?.verificado;
  const deTit = (x) => !x.tit || x.tit === tit;
  const F = Object.fromEntries(Object.entries(datos.fuentes ?? {}).map(([k, f]) => [k, { ...f, titulo: f.titulo.replace('<eje>', eje) }]));
  const lista = (xs) => (xs ?? []).filter(deTit).map((x) => conFuente(x, F));
  const correccion = verificado
    ? { verificado: true, normas: lista(datos.correccion?.verificado), base: conFuente({ tipo: 'norma', fuente: trib.correccion.fuente, texto: trib.correccion.texto }, F), app: datos.correccion?.app ?? null }
    : { verificado: false, normas: [], pendiente: datos.correccion?.pendiente ?? null, app: datos.correccion?.app ?? null };
  const unReloj = trib?.unReloj ? conFuente({ tipo: 'norma', fuente: trib.unReloj.fuente, texto: trib.unReloj.texto }, F) : null;
  const pendientes = [...(trib?.pendientes ?? [])];
  if (!trib) pendientes.push('Este tribunal no tiene aún su ficha de examen en la estrategia: material, documentación y corrección, en su convocatoria.');
  return {
    tiempo: datos.tiempo ?? {},
    correccion,
    noSabes: lista(verificado ? datos.noSabes?.verificado : datos.noSabes?.pendiente),
    orden: lista(datos.orden),
    leer: lista(datos.leer),
    repaso: lista(datos.repaso),
    diaAntes: lista(datos.diaAntes),
    diaExamen: lista(datos.diaExamen),
    calculadora: calculadora ? datos.calculadora?.si : datos.calculadora?.no,
    tribunal: trib ? { dia: lista(trib.dia), nota: trib.nota ?? null } : { dia: [], nota: null },
    py: tit === 'py' && datos.py ? {
      modulos: lista(datos.py.modulos), consejos: lista(datos.py.consejos),
      reloj: unReloj ? { comprobado: true, texto: datos.py.unReloj, fuente: unReloj.fuente, dato: unReloj.texto } : { comprobado: false, texto: datos.py.relojPendiente },
    } : null,
    pendientes: [...new Set(pendientes)].filter((p) => tit === 'py' || !/módulo/i.test(p)),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Capa 2: tu estrategia

/** Exámenes completos (con apto o no apto: simulacro, convocatoria real o examen final), los más recientes al final. */
export const examenesCompletos = (tests = [], max = SIMULACROS_ESTRATEGIA) => tests.filter((t) => t.apto === true || t.apto === false).slice(-max);

/**
 * Tu estrategia, con tus datos.
 * @param {{ estructura: object, tests?: object[], listo?: object|null, max?: number }} o
 *   tests: los de la titulación y el eje (progress.tests() filtrados); listo: estoyListo() del motor (st.listo)
 * @returns {{ suficiente: boolean, simulacros: number, tiempo: object|null, limites: object[], masCerca: object|null,
 *   colchon: object|null, consejos: { texto: string, ut?: number }[], aviso: string|null }}
 */
export function tuEstrategia({ estructura: E, tests = [], listo = null, max = SIMULACROS_ESTRATEGIA }) {
  const completos = examenesCompletos(tests, max);
  const n = completos.length;
  const total = totalPreguntas(E);
  const permitidos = total - E.minAciertos;

  // Tiempo: lo que tardas de media frente a la duración del examen (y cuántas veces se te acabó).
  const conMin = completos.filter((t) => Number.isFinite(t.minutos) && t.minutos > 0);
  let tiempo = null;
  if (conMin.length) {
    const media = conMin.reduce((s, t) => s + t.minutos, 0) / conMin.length;
    const agotados = conMin.filter((t) => t.minutos >= E.duracionMin).length;
    const ratio = media / E.duracionMin;
    tiempo = { media, duracionMin: E.duracionMin, ratio, agotados, sobra: Math.max(0, E.duracionMin - media), estado: agotados || ratio >= JUSTO ? 'justo' : ratio <= HOLGADO ? 'holgado' : 'bien' };
  }

  // Temas con límite: fallos de media y peor caso en tus exámenes; probabilidad de pasarte según «¿Estás listo?».
  const temaListo = (ut) => listo?.temas?.find((t) => t.ut === ut && t.suficiente) ?? null;
  const limites = E.bloques.filter((b) => b.maxErrores != null).map((b) => {
    const fallos = completos.map((t) => t.porTema?.find((p) => p.ut === b.ut)).filter((p) => p && p.total).map((p) => p.total - p.aciertos);
    const media = fallos.length ? fallos.reduce((s, x) => s + x, 0) / fallos.length : null;
    const tl = temaListo(b.ut);
    const pFalla = tl?.pFallaLimite ?? null;
    const pasado = fallos.filter((f) => f > b.maxErrores).length;
    // Riesgo: la probabilidad del modelo si la hay; si no, lo cerca que quedan tus fallos medios del límite.
    const riesgo = pFalla ?? (media != null ? Math.min(1, (media + (pasado ? 1 : 0)) / (b.maxErrores + 1)) : null);
    return { ut: b.ut, titulo: b.titulo, ico: b.ico, n: b.n, maxErrores: b.maxErrores, examenes: fallos.length, media, peor: fallos.length ? Math.max(...fallos) : null, pasado, margen: media != null ? b.maxErrores - media : null, pFalla, riesgo };
  });
  const conDatos = limites.filter((l) => l.riesgo != null);
  const masCerca = conDatos.length ? [...conDatos].sort((a, b) => b.riesgo - a.riesgo || (a.margen ?? 99) - (b.margen ?? 99))[0] : null;

  // Colchón global: tus fallos de media frente a los que permite el examen.
  const colchon = n ? (() => {
    const media = completos.reduce((s, t) => s + (t.total - t.aciertos), 0) / n;
    return { media, permitidos, aptos: completos.filter((t) => t.apto).length, queda: permitidos - media };
  })() : null;

  const suficiente = n > 0 || conDatos.length > 0;
  const consejos = [];
  if (masCerca && (masCerca.pasado || (masCerca.margen != null && masCerca.margen <= 1.5) || (masCerca.pFalla ?? 0) >= 0.15)) {
    const dato = masCerca.media != null
      ? `fallas de media ${num(masCerca.media)} de ${masCerca.n} y el máximo es ${masCerca.maxErrores}${masCerca.pasado ? ` (te pasaste en ${cuenta(masCerca.pasado, 'examen', 'exámenes')})` : ''}`
      : `en tus respuestas, te pasarías del máximo (${masCerca.maxErrores}) en ${Math.round(100 * masCerca.pFalla)} de cada 100 exámenes`;
    consejos.push({ ut: masCerca.ut, texto: `${masCerca.titulo} es tu límite más justo: ${dato}. Contesta sus preguntas con calma en la primera pasada y revísalas las primeras en el repaso final. Antes del examen, una tanda de ese tema.` });
  } else if (masCerca) {
    consejos.push({ ut: masCerca.ut, texto: `Tus temas con límite van con margen; el más justo es ${masCerca.titulo}${masCerca.media != null ? ` (fallas de media ${num(masCerca.media)} de ${masCerca.n}; máximo ${masCerca.maxErrores})` : ''}. Revisa sus marcadas antes que las demás.` });
  }
  if (tiempo) {
    if (tiempo.estado === 'justo') {
      consejos.push({ texto: `Vas justo de tiempo: tardas de media ${cuenta(Math.round(tiempo.media), 'minuto')} de ${tiempo.duracionMin}${tiempo.agotados ? ` y se te acabó el reloj en ${cuenta(tiempo.agotados, 'examen', 'exámenes')}` : ''}. Marca y salta: ninguna pregunta de teoría más de 2 minutos en la primera pasada, y la carta después.` });
    } else if (tiempo.estado === 'holgado') {
      consejos.push({ texto: `Te sobra tiempo: tardas de media ${cuenta(Math.round(tiempo.media), 'minuto')} de ${tiempo.duracionMin}. No entregues antes: usa esos ${cuenta(Math.round(tiempo.sobra), 'minuto')} en repasar las marcadas y las de los temas con límite.` });
    } else {
      consejos.push({ texto: `Tu ritmo cabe: tardas de media ${cuenta(Math.round(tiempo.media), 'minuto')} de ${tiempo.duracionMin}. Guarda siempre los últimos minutos para el repaso final.` });
    }
  }
  if (colchon) {
    if (colchon.queda < 0) consejos.push({ texto: `Aún fallas de media ${num(colchon.media)} y el examen permite ${permitidos}: antes que la estrategia, toca subir aciertos. Repasa tus fallos y vuelve a hacer un simulacro.` });
    else if (colchon.queda <= 2) consejos.push({ texto: `Vas al límite de la nota: fallas de media ${num(colchon.media)} de ${permitidos} permitidos. Cada pregunta dudosa cuenta: descarta opciones antes de elegir y no dejes ninguna sin contestar.` });
    else if (consejos.length < 3) consejos.push({ texto: `Tienes colchón en la nota (fallas de media ${num(colchon.media)} de ${permitidos} permitidos): lo que más te puede tumbar son los límites por tema, no el total.` });
  }

  let aviso = null;
  if (!suficiente) aviso = 'Aún no hay datos tuyos para afinar la estrategia: haz un simulacro completo y aquí verás tu tiempo, tu límite más justo y tus consejos.';
  else if (!n) aviso = 'Con tus respuestas ya se ve qué límite tienes más justo, pero falta tu tiempo: haz un simulacro completo.';
  else if (n === 1) aviso = 'Con un solo simulacro esto es una pista, no una tendencia: haz otro para confirmarlo.';
  return { suficiente, simulacros: n, tiempo, limites, masCerca, colchon, consejos: consejos.slice(0, 3), aviso };
}

/** Resumen en texto (para `nautica.state()`): una línea por idea, sin iconos. */
export function resumenEstrategia(c, presupuesto, tu) {
  const lineas = [`ESTRATEGIA ${c.sigla}: ${cuenta(c.preguntas, 'pregunta')}, ${c.duracionMin} min (${num(c.minPorPregunta)} min/pregunta), apto con ${c.minAciertos}; colchón ${cuenta(c.colchon, 'fallo')}`,
    `LIMITES: ${c.limites.map((l) => `${l.titulo} máx ${l.maxErrores} de ${l.n}`).join(' · ')}`,
    `CALCULADORA: ${c.calculadora.permitida ? 'sí' : 'no'}`,
    ...presupuesto.map((t) => `TIEMPO ${t.titulo}: ${t.filas.map((f) => `${f.nombre} ${f.minutos} min`).join(', ')} (orientativo)`)];
  if (tu) {
    lineas.push(tu.aviso ? `TU ESTRATEGIA: ${tu.aviso}` : `TU ESTRATEGIA (${tu.simulacros} exámenes)`);
    for (const k of tu.consejos) lineas.push(`- ${k.texto}`);
  }
  return lineas.join('\n');
}
