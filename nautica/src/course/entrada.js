// La entrada única (pestaña Hoy, docs/ENTRADA.md): dónde estás en tu derrota, qué toca ahora y un solo botón para
// seguir. Funciones puras: componen lo que ya calculan la sesión (src/course/sesion.js), la travesía
// (src/course/travesia.js) y «¿Estás listo?» (src/course/listo.js); no deciden nada nuevo ni cambian ninguna lógica.

import { cuenta } from '../texto.js';

/** Tipos de paso que nombran una clase o un tema (su `sub` empieza por ese nombre). */
const CON_NOMBRE = new Set(['clase', 'preguntas', 'repaso', 'chuleta']);

/**
 * ¿Alumno recién llegado? Ni una respuesta ni una clase terminada: entonces el botón dice «Empezar» y el marcador de la
 * carta está en el inicio. (La oferta del test de nivel usa su propio criterio, más amplio, en Hoy.)
 */
export const esNuevo = ({ respondidas = 0, terminadas = 0 } = {}) => respondidas === 0 && terminadas === 0;

/**
 * El estado de la entrada.
 *   'hecho-hoy'  la sesión de hoy está hecha
 *   'a-medias'   hay una sesión de hoy empezada y sin terminar
 *   'nuevo'      no hay sesión y el alumno acaba de llegar
 *   'en-curso'   no hay sesión: toca la de hoy
 * `carta`: hay carta de la derrota (el banco tiene conceptos etiquetados); sin ella, la entrada es la misma sin héroe.
 * @param {{ sesion?: object|null, terminada?: boolean, nuevo?: boolean, carta?: boolean }} p
 *   `sesion` = la sesión guardada de hoy (o null) y `terminada` = si ya no le quedan pasos (sesion.js, terminada()).
 * @returns {{ estado: 'hecho-hoy'|'a-medias'|'nuevo'|'en-curso', carta: boolean, modo: string }}
 *   `modo` = el estado, o 'sin-etiquetas' cuando no hay carta (para el resumen y la documentación).
 */
export function estadoEntrada({ sesion = null, terminada = false, nuevo = false, carta = false } = {}) {
  let estado;
  if (sesion?.estado === 'hecha') estado = 'hecho-hoy';
  else if (sesion && !terminada) estado = 'a-medias';
  else estado = nuevo ? 'nuevo' : 'en-curso';
  return { estado, carta: !!carta, modo: carta ? estado : 'sin-etiquetas' };
}

/**
 * La siguiente parada de la derrota: el primer faro, en el orden de la derrota, que aún no está encendido. Con todos
 * encendidos, la siguiente parada es el examen (la bandera): `indice` = -1.
 * @param {{ id: string, estado: string }[]} faros  los de estadoTravesia (ya en orden)
 * @returns {{ indice: number, faro: object|null, encendidos: number, total: number, alExamen: boolean }}
 */
export function siguienteParada(faros = []) {
  const indice = faros.findIndex((f) => f.estado !== 'on');
  return { indice, faro: indice >= 0 ? faros[indice] : null, encendidos: faros.filter((f) => f.estado === 'on').length, total: faros.length, alExamen: faros.length > 0 && indice < 0 };
}

/**
 * El faro de la siguiente parada: el bloque de la carta donde cae el tema (ut) de lo que toca (la clase de la sesión).
 * Cada idea va a un tema con `temaDe(id)` (temaDeIdea de src/course/listo.js); gana el faro con más ideas de ese tema
 * (a igualdad, el primero de la derrota). Sin tema (repaso de fallos, mezclado) o sin ideas de ese tema: el primer faro
 * sin encender (siguienteParada), y -1 si están todos encendidos (el marcador va a la bandera del examen).
 * @returns {number}  índice del faro en `faros`, o -1
 */
export function faroDeParada(faros = [], ut = null, temaDe = () => null) {
  if (ut != null) {
    const n = new Map();
    for (const f of faros) for (const i of f.ideas ?? []) if (temaDe(i.id) === ut) n.set(f.id, (n.get(f.id) ?? 0) + 1);
    let mejor = -1;
    faros.forEach((f, k) => { if ((n.get(f.id) ?? 0) > (mejor < 0 ? 0 : n.get(faros[mejor].id))) mejor = k; });
    if (mejor >= 0) return mejor;
  }
  return siguienteParada(faros).indice;
}

/**
 * Qué toca, para la tarjeta «Siguiente parada»: la clase (o el tema) de la sesión y, si no hay ninguna, su primer paso.
 * @param {object[]} pasos  los de componerSesion (o los pendientes de una sesión a medias, empezando por el actual)
 * @param {{ actual?: boolean }} [o]  actual: nombrar el primer paso tal cual (sesión a medias: va por ese)
 * @returns {null | { nombre: string, tipo: string, paso: object }}  `tipo` = «Clase nueva · tramo 1 de 3», «Tus fallos»…
 */
export function paradaDeSesion(pasos = [], { actual = false } = {}) {
  const p = actual ? pasos[0] : pasos.find((x) => x.tipo === 'clase') ?? pasos.find((x) => CON_NOMBRE.has(x.tipo)) ?? pasos[0];
  if (!p) return null;
  if (CON_NOMBRE.has(p.tipo) && p.sub) {
    const [nombre, ...resto] = p.sub.split(' · ');
    return { nombre, tipo: [p.titulo, ...resto].join(' · '), paso: p };
  }
  return { nombre: p.titulo, tipo: p.sub ?? '', paso: p };
}

/** «3 pasos · 21 min». */
export function resumenPasos(pasos = []) {
  const min = pasos.reduce((s, p) => s + (p.minutos ?? 0), 0);
  return `${cuenta(pasos.length, 'paso')} · ${min} min`;
}

/** La línea de contexto de la cabecera: «PER · 38 días al examen», «PER · sin fecha», «PER · examen mañana». */
export function lineaContexto(sigla, dias) {
  if (dias == null || dias < 0) return `${sigla} · sin fecha`;
  if (dias === 0) return `${sigla} · examen hoy`;
  if (dias === 1) return `${sigla} · examen mañana`;
  return `${sigla} · ${cuenta(dias, 'día')} al examen`;
}

/**
 * «¿Estás listo?» en una línea, con el mismo margen que lineaListo (src/course/listo.js): «Casi: entre 5 y 7 de cada
 * 10». No calcula nada: lee el resultado de estarListo().
 */
export function listoCorto(r) {
  if (!r) return 'Aún sin datos';
  if (r.estado === 'faltan-datos') {
    const n = r.temasSinDatos?.length ?? 0;
    return n ? `Faltan datos de ${cuenta(n, 'tema')}` : 'Aún sin datos';
  }
  const base = r.estado === 'listo' ? 'Listo' : r.estado === 'casi' ? 'Casi' : 'Todavía no';
  const de10 = Math.round(r.prob * 10);
  const bajo = Math.round(r.margen.bajo * 10), alto = Math.round(r.margen.alto * 10);
  const rango = alto - bajo >= 2 && bajo !== alto ? `entre ${bajo} y ${alto}` : `unas ${de10}`;
  return `${base}: aprobarías ${rango} de cada 10`;
}

/**
 * Texto alternativo de la carta de Hoy: dónde estás y cuál es la siguiente parada.
 * «Tu derrota: 2 de 6 faros encendidos. Estás en Seguridad, faro 3 de 6; siguiente parada: «El casco…».»
 */
export function textoCarta({ faros = [], parada = null, nuevo = false, marca = null } = {}) {
  const s = siguienteParada(faros);
  const k = marca ?? s.indice;
  const sigue = parada ? `; siguiente parada: «${parada}»` : '';
  if (!s.total) return 'Tu derrota';
  if (k < 0) return `Tu derrota: los ${s.total} faros encendidos, rumbo al examen${sigue}.`;
  const f = faros[k];
  const donde = `faro ${k + 1} de ${s.total}`;
  if (nuevo || !s.encendidos && !faros.some((x) => x.estado === 'parcial')) return `Tu derrota: ${s.total} faros, todos apagados. Estás en el inicio, ${f.corto ?? f.nombre}, ${donde}${sigue}.`;
  const luz = s.alExamen ? `los ${s.total} faros encendidos` : `${s.encendidos} de ${cuenta(s.total, 'faro encendido', 'faros encendidos')}`;
  return `Tu derrota: ${luz}. Estás en ${f.corto ?? f.nombre}, ${donde}${sigue}.`;
}
