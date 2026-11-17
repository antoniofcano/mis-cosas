// «¿Estás listo?» con tu cuaderno de fallos y tu velocidad por tipo de problema (R-56, H-70). Funciones puras (sin DOM).
//
// La probabilidad de aprobar (src/course/listo.js) sale de lo que aciertas por tema. Hay dos cosas que esa cuenta no ve
// y que suspenden igual:
//  1. Un fallo con nombre que sigue abierto en un tema con límite propio (sobre todo la carta): sabes el método, pero
//     ese paso te lo llevas mal. En la carta del PER solo se pueden fallar 2 de 4: un fallo abierto es un punto que se
//     puede ir. Fuente: el cuaderno de fallos (src/course/cuaderno.js).
//  2. El tiempo: si tardas más de lo que te deja el tribunal por problema en los tipos que más caen, no llegas, aunque
//     aciertes. Fuente: tu tiempo por tipo en simulacros, exámenes y práctica (src/course/velocidad.js) frente al tiempo
//     disponible por pregunta de carta (`tiempoDisponible`, src/course/estrategia.js).
//
// No hay una «nota» nueva ni se toca la probabilidad: cada cosa sale como un MOTIVO con su frase y su acción concreta
// («haz su dosis», «practica con reloj»). Un motivo de nivel «riesgo» impide decir «Estás listo» (se queda en «Casi»,
// con la probabilidad tal cual); los demás informan. Sin datos suficientes se dice, no se juzga.
//
// Todos los umbrales son HIPÓTESIS razonadas, no medidas (R-14, R-51): se calibrarán con las comparaciones
// predicción–resultado de tras el examen.

import { nombreFallo } from './cuaderno.js';
import { nombreTipo, duracion, mmssCorto, estadoTiempo } from './velocidad.js';
import { cuenta, fechaLarga } from '../texto.js';

/** Peso de un fallo según su estado: abierto (o reabierto) entero, en vigilancia la mitad, resuelto nada. */
export const PESO_ESTADO = { abierto: 1, vigilando: 0.5, resuelto: 0 };
/** Peso de los fallos de un tema con límite a partir del cual es un riesgo (un abierto, o dos en vigilancia). */
export const RIESGO_CUADERNO = 1;
/** Problemas cronometrados de un tipo que hacen falta para opinar de tu tiempo en él (de los más recientes). */
export const MIN_MUESTRAS_TIEMPO = 3;
/** Los tipos «que más caen»: los más frecuentes en el banco hasta cubrir esta parte de las preguntas de carta. */
export const CUBREN_FRECUENTES = 0.8;
/** Tipos que se nombran en una sola frase de «faltan datos» (el resto, «y N más»). */
const MAX_NOMBRES = 3;

export const NIVELES = { riesgo: 'Riesgo', aviso: 'Ojo', 'sin-datos': 'Sin datos', bien: 'Bien' };
const ORDEN_NIVEL = { riesgo: 0, aviso: 1, 'sin-datos': 2, bien: 3 };

const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : String(xs[0] ?? ''));
const comillas = (xs) => xs.map((x) => `«${x}»`);
/** Primera letra en minúscula, salvo siglas («RIPA», «Ct»): «Marea y sonda» → «marea y sonda». */
const minus = (s) => (/^(?:[A-ZÁÉÍÓÚÑ]{2}|Ct\b)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/**
 * Los tipos de problema del banco del alumno (solo su estudio, nunca lo reservado; con un módulo, solo sus temas):
 * a qué tema va cada tipo (el de la mayoría de sus preguntas) y los que más caen.
 * @param {object[]} preguntas  banco de estudio (ya recortado al módulo si lo hay)
 * @param {(q: object) => string} tipoDe  tipo de problema de una pregunta (src/course/velocidad.js, tipoDePregunta)
 * @returns {{ utDe: Record<string, number>, frecuencia: { tipo, n, cuota }[], frecuentes: string[], porTipo: Record<string, string[]> }}
 */
export function tiposDelBanco(preguntas = [], tipoDe = null) {
  const cuenta_ = new Map();
  const porTipo = {};
  if (typeof tipoDe === 'function') {
    for (const q of preguntas) {
      if (q.anulada) continue;
      const tipo = tipoDe(q);
      if (!tipo || tipo === 'teoria') continue;
      if (!cuenta_.has(tipo)) cuenta_.set(tipo, new Map());
      const m = cuenta_.get(tipo);
      m.set(q.ut, (m.get(q.ut) ?? 0) + 1);
      (porTipo[tipo] ??= []).push(q.id);
    }
  }
  const utDe = {};
  const frecuencia = [];
  for (const [tipo, m] of cuenta_) {
    utDe[tipo] = [...m].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
    frecuencia.push({ tipo, n: [...m.values()].reduce((s, x) => s + x, 0) });
  }
  const total = frecuencia.reduce((s, x) => s + x.n, 0);
  frecuencia.sort((a, b) => b.n - a.n || a.tipo.localeCompare(b.tipo));
  const frecuentes = [];
  let acum = 0;
  for (const f of frecuencia) {
    f.cuota = total ? f.n / total : 0;
    if (f.tipo === 'carta') continue; // «otras de carta» no es un tipo que se practique como tal
    if (acum < CUBREN_FRECUENTES) frecuentes.push(f.tipo);
    acum += f.cuota;
  }
  return { utDe, frecuencia, frecuentes, porTipo };
}

/** Tema de un tipo: el del banco; si el banco no lo trae (un tipo solo de ejercicios generados), el de la carta. */
const temaDeTipo = (tipo, utDe, cartaUt) => utDe?.[tipo] ?? cartaUt ?? null;

/** Acción para un fallo: la comprobación si toca, su dosis si toca, y si no (esperando la comprobación) el cuaderno. */
function accionFallos(fs) {
  const c = fs.find((f) => f.pide === 'comprobar');
  if (c) return { texto: `Comprobar «${nombreFallo(c).titulo}»`, ruta: ['fallos', 'comprobar', c.id] };
  const d = fs.find((f) => f.pide === 'dosis');
  if (d) return { texto: fs.filter((f) => f.pide === 'dosis').length > 1 ? 'Haz sus dosis de 2 minutos' : 'Haz su dosis de 2 minutos', ruta: ['fallos', 'dosis', d.id] };
  return { texto: 'Ver tu cuaderno de fallos', ruta: ['fallos'] };
}

/**
 * Motivos del cuaderno de fallos: uno por tema con límite propio que tiene fallos abiertos o en vigilancia.
 * Abierto pesa 1, vigilando 0,5 y resuelto 0; con un peso de RIESGO_CUADERNO o más en el tema, es un riesgo.
 * @param {{ cuaderno: object, estructura: object, utDe?: Record<string, number>, cartaUt?: number|null, ahora?: number }} o
 */
export function motivosCuaderno({ cuaderno, estructura, utDe = {}, cartaUt = null, ahora = Date.now() }) {
  if (!cuaderno || cuaderno.vacio || !estructura) return [];
  const bloques = new Map(estructura.bloques.filter((b) => b.maxErrores != null).map((b) => [b.ut, b]));
  const porTema = new Map();
  for (const f of cuaderno.lista ?? []) {
    const ut = temaDeTipo(f.y, utDe, cartaUt);
    if (!bloques.has(ut)) continue; // tema sin límite propio, o fuera del módulo que preparas
    if (!porTema.has(ut)) porTema.set(ut, []);
    porTema.get(ut).push(f);
  }
  const out = [];
  for (const [ut, fs] of porTema) {
    const b = bloques.get(ut);
    const abiertos = fs.filter((f) => f.est === 'abierto');
    const vigilando = fs.filter((f) => f.est === 'vigilando');
    const resueltos = fs.filter((f) => f.est === 'resuelto');
    const peso = fs.reduce((s, f) => s + (PESO_ESTADO[f.est] ?? 0), 0);
    const limite = `En ${minus(b.titulo)} solo se pueden fallar ${b.maxErrores} de ${b.n}.`;
    const tema = minus(b.corto ?? b.titulo);
    if (abiertos.length || vigilando.length) {
      const nombresA = comillas(abiertos.map((f) => nombreFallo(f).titulo));
      const nombresV = comillas(vigilando.map((f) => nombreFallo(f).titulo));
      const riesgo = peso >= RIESGO_CUADERNO;
      let frase;
      if (abiertos.length) {
        frase = `Tienes ${cuenta(abiertos.length, 'fallo abierto', 'fallos abiertos')} en ${tema}: ${lista(nombresA)}${vigilando.length ? `, y ${vigilando.length} en vigilancia (${lista(nombresV)})` : ''}. ${limite}`;
      } else {
        const prox = vigilando.map((f) => f.comp?.prox).filter(Boolean).sort()[0];
        const cuando = prox ? ` Te ${vigilando.length === 1 ? 'lo' : 'los'} compruebo ${prox <= new Date(ahora).toLocaleDateString('sv-SE') ? 'hoy' : `el ${fechaLarga(prox, { ahora })}`}.` : '';
        frase = riesgo
          ? `Tienes ${cuenta(vigilando.length, 'fallo', 'fallos')} en vigilancia en ${tema}: ${lista(nombresV)}. Cada uno pesa la mitad que uno abierto, pero juntos ya son un riesgo.${cuando}`
          : `Tienes 1 fallo en vigilancia en ${tema}: ${nombresV[0]}. Pesa la mitad que uno abierto: aún falta una comprobación bien.${cuando}`;
      }
      out.push({ id: `cuaderno:${ut}`, clase: 'cuaderno', nivel: riesgo ? 'riesgo' : 'aviso', ut, peso, fallos: [...abiertos, ...vigilando].map((f) => f.id), frase, accion: accionFallos([...abiertos, ...vigilando]) });
    } else if (resueltos.length) {
      out.push({ id: `cuaderno:${ut}`, clase: 'cuaderno', nivel: 'bien', ut, peso: 0, fallos: [], frase: resueltos.length === 1 ? `Tu fallo de ${tema} está resuelto: ya no cuenta.` : `Tus fallos de ${tema} (${cuenta(resueltos.length, 'fallo')}) están resueltos: ya no cuentan.`, accion: null });
    }
  }
  return out;
}

/**
 * Dónde practicar un tipo con reloj: una pregunta real del estudio de ese tipo en «Resolver paso a paso» (lleva reloj
 * con el objetivo del tribunal y guarda tu tiempo), la que hace más que no respondes; si el banco no tiene, el ejercicio
 * generado de ese tipo. null si no hay ninguna de las dos (p. ej. «otras de carta»).
 */
export function practicaConReloj(tipo, { porTipo = {}, respuestas = {}, ahora = Date.now() } = {}) {
  const ids = porTipo[tipo] ?? [];
  if (ids.length) {
    const cuando = (id) => Date.parse(respuestas[id]?.t ?? '') || 0;
    const id = [...ids].sort((a, b) => cuando(a) - cuando(b) || a.localeCompare(b))[0];
    return { texto: 'Practica uno con reloj', ruta: ['q', id], query: { guiado: '1' }, fuera: true };
  }
  if (tipo === 'carta' || tipo === 'teoria') return null;
  return { texto: 'Practica uno con reloj', ruta: ['ej', tipo], query: { s: String(Math.floor(ahora / 864e5)) }, fuera: true };
}

/**
 * Motivos del tiempo: en los tipos que más caen (y que son de tu examen o tu módulo), tu media frente al tiempo que te
 * deja el tribunal por pregunta de carta. Te pasas: riesgo. Justo (más del 75 %): aviso. Con menos de
 * MIN_MUESTRAS_TIEMPO problemas cronometrados del tipo: se dice que faltan datos. Todo cabe: una línea de «bien».
 * @param {{ filas: object[], frecuentes: string[], utDe?: Record<string, number>, estructura: object, cartaUt?: number|null,
 *   disponibleS: number|null, porTipo?: Record<string, string[]>, respuestas?: object, ahora?: number }} o
 *   filas: velocidadPorTipo (src/course/velocidad.js)
 */
export function motivosVelocidad({ filas = [], frecuentes = [], utDe = {}, estructura, cartaUt = null, disponibleS = null, porTipo = {}, respuestas = {}, ahora = Date.now() }) {
  if (!disponibleS || !estructura) return [];
  const uts = new Set(estructura.bloques.map((b) => b.ut));
  const tipos = frecuentes.filter((t) => uts.has(temaDeTipo(t, utDe, cartaUt)));
  if (!tipos.length) return [];
  const fila = new Map(filas.map((f) => [f.tipo, f]));
  const disp = `unos ${duracion(disponibleS)}`;
  const out = [];
  const conDatos = [];
  const sinDatos = [];
  for (const tipo of tipos) {
    const f = fila.get(tipo);
    if (!f || f.n < MIN_MUESTRAS_TIEMPO) { sinDatos.push({ tipo, n: f?.n ?? 0 }); continue; }
    conDatos.push(tipo);
    const estado = estadoTiempo(f.mediaS, disponibleS);
    if (estado === 'cabe') continue;
    const nombre = nombreTipo(tipo);
    const accion = practicaConReloj(tipo, { porTipo, respuestas, ahora });
    const tendencia = f.tendencia === 'baja' ? ' Vas bajando: sigue así.' : f.tendencia === 'sube' ? ' Y últimamente vas más lento.' : '';
    if (estado === 'se-pasa') {
      out.push({ id: `tiempo:${tipo}`, clase: 'tiempo', nivel: 'riesgo', tipo, mediaS: f.mediaS, disponibleS, exceso: f.mediaS / disponibleS,
        frase: `En ${minus(nombre)} tardas ${mmssCorto(f.mediaS)} de media (${cuenta(f.n, 'problema cronometrado', 'problemas cronometrados')}) y el examen te da ${disp} por problema de carta: aunque aciertes, no llegas.${tendencia}`, accion });
    } else {
      out.push({ id: `tiempo:${tipo}`, clase: 'tiempo', nivel: 'aviso', tipo, mediaS: f.mediaS, disponibleS, exceso: f.mediaS / disponibleS,
        frase: `En ${minus(nombre)} vas justo: ${mmssCorto(f.mediaS)} de media para ${disp} por problema. Te queda poco margen para repasar.${tendencia}`, accion });
    }
  }
  out.sort((a, b) => b.exceso - a.exceso);
  if (sinDatos.length) {
    const nombres = sinDatos.slice(0, MAX_NOMBRES).map((x) => `${minus(nombreTipo(x.tipo))} (${x.n ? `${x.n} de ${MIN_MUESTRAS_TIEMPO}` : 'ninguno'})`);
    const mas = sinDatos.length - MAX_NOMBRES;
    out.push({ id: 'tiempo:sin-datos', clase: 'tiempo', nivel: 'sin-datos', tipos: sinDatos.map((x) => x.tipo),
      frase: `Aún no sé si llegas a tiempo en ${lista([...nombres, ...(mas > 0 ? [`${cuenta(mas, 'tipo')} más`] : [])])}: necesito ${MIN_MUESTRAS_TIEMPO} problemas cronometrados de cada uno, en un simulacro o en el paso a paso.`,
      accion: practicaConReloj(sinDatos[0].tipo, { porTipo, respuestas, ahora }) });
  }
  if (conDatos.length && !out.some((m) => m.nivel === 'riesgo' || m.nivel === 'aviso')) {
    out.push({ id: 'tiempo:bien', clase: 'tiempo', nivel: 'bien', tipos: conDatos,
      frase: `De tiempo vas bien: en ${lista(conDatos.map((t) => minus(nombreTipo(t))))} te sobra margen (${disp} por problema).`, accion: null });
  }
  return out;
}

/**
 * Todos los motivos, del más grave al más leve.
 * @param {{ cuaderno, estructura, tipos?: ReturnType<typeof tiposDelBanco>, cartaUt?, filas?, disponibleS?, respuestas?, ahora? }} o
 */
export function motivosListo({ cuaderno = null, estructura, tipos = null, cartaUt = null, filas = [], disponibleS = null, respuestas = {}, ahora = Date.now() }) {
  const t = tipos ?? { utDe: {}, frecuentes: [], porTipo: {} };
  const m = [
    ...motivosCuaderno({ cuaderno, estructura, utDe: t.utDe, cartaUt, ahora }),
    ...motivosVelocidad({ filas, frecuentes: t.frecuentes, utDe: t.utDe, estructura, cartaUt, disponibleS, porTipo: t.porTipo, respuestas, ahora }),
  ];
  return m.sort((a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel] || (a.clase === 'cuaderno' ? 0 : 1) - (b.clase === 'cuaderno' ? 0 : 1));
}

/**
 * «¿Estás listo?» con sus motivos. La probabilidad no cambia; con algún riesgo, «listo» se queda en «casi» (`frenado`).
 * `estadoModelo` guarda lo que decía solo la probabilidad.
 */
export function conMotivos(listo, motivos = []) {
  const riesgos = motivos.filter((m) => m.nivel === 'riesgo');
  const frenado = listo.estado === 'listo' && riesgos.length > 0;
  return { ...listo, estadoModelo: listo.estado, estado: frenado ? 'casi' : listo.estado, frenado, motivos, riesgos: riesgos.length };
}

/** La frase que se añade a «¿Estás listo?» cuando un riesgo lo frena (o lo hay sin frenar). '' si no hay riesgos. */
export function lineaRiesgos(listo) {
  const n = listo?.riesgos ?? 0;
  if (!n) return '';
  if (listo.frenado) return `Pero aún no te doy por listo: tienes ${cuenta(n, 'riesgo concreto', 'riesgos concretos')} que la probabilidad no ve (tu cuaderno de fallos o tu tiempo).`;
  return `Además, ${cuenta(n, 'riesgo concreto', 'riesgos concretos')} de tu cuaderno de fallos o de tu tiempo.`;
}

/** En texto, para `nautica.state()`: una línea por motivo con su acción. */
export function resumenMotivos(listo, tit) {
  const ms = listo?.motivos ?? [];
  if (!ms.length) return '';
  const href = (a) => (a.fuera ? `#/${a.ruta.join('/')}` : `#/${tit}/${a.ruta.join('/')}`) + (a.query ? `?${new URLSearchParams(a.query)}` : '');
  return `\nLISTO, MOTIVOS (umbrales orientativos):\n${ms.map((m) => `- [${m.nivel}] ${m.frase}${m.accion ? ` → ${m.accion.texto}: ${href(m.accion)}` : ''}`).join('\n')}`;
}
