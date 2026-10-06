// Motor del curso: estado de cada lección a partir de lo que el alumno ha visto y respondido, repaso espaciado
// (cajas de Leitner) y el plan «Hoy toca». Funciones puras: el progreso entra como datos.

/** Días hasta el siguiente repaso según la caja (0 = recién aprendida o fallada). */
export const INTERVALOS = [1, 3, 7, 14, 30];
const DIA = 24 * 3600 * 1000;

/** Umbral de acierto para dar una práctica por buena. */
export const APROBADO = 0.8;

/**
 * Estado de una lección.
 * @param {object} leccion   { id, practica: [ids] }
 * @param {object} reg       registro guardado { visto, caja, proximo, ultimo, paso } (o undefined)
 * @param {object} respuestas mapa idPregunta → { ok }
 * @param {number} ahora     ms
 * @returns {{ estado: 'nueva'|'empezada'|'vista'|'repasar'|'dominada', hechas: number, aciertos: number, total: number, pct: number|null, proximo: number|null }}
 *   'vista': terminada (cuenta como hecha para avanzar), pero aún sin afianzar con su práctica.
 */
export function estadoLeccion(leccion, reg, respuestas, ahora = Date.now()) {
  const ids = leccion.practica ?? [];
  const hechas = ids.filter((id) => respuestas[id]);
  const aciertos = hechas.filter((id) => respuestas[id].ok).length;
  const pct = hechas.length ? aciertos / hechas.length : null;
  const base = { hechas: hechas.length, aciertos, total: ids.length, pct, proximo: reg?.proximo ?? null };
  // Terminar la clase (o practicarla) es lo que la da por hecha; abrirla y dejarla a medias, no.
  if (!reg?.visto && reg?.caja == null) return { ...base, estado: reg?.paso ? 'empezada' : 'nueva' };
  // Sin práctica: una clase sin preguntas propias (de concepto; su práctica está en otro tema) queda aprendida al
  // terminarla; con preguntas, queda vista hasta practicarla.
  if (reg.caja == null) return { ...base, estado: ids.length ? 'vista' : 'dominada' };
  // Con práctica, el repaso espaciado decide: vuelve cuando toca (mañana si se falló; días después si se acertó).
  if (reg.proximo != null && reg.proximo <= ahora) return { ...base, estado: 'repasar' };
  return { ...base, estado: reg.caja >= 1 ? 'dominada' : 'vista' };
}

/**
 * Actualiza la caja de Leitner tras una práctica de la lección.
 * @param {object} reg      registro previo
 * @param {number} acierto  fracción 0..1 de la práctica que acaba de hacer
 */
export function trasPractica(reg = {}, acierto, ahora = Date.now()) {
  // La primera práctica aprobada ya pasa a la caja 1 (vuelve en unos días); una suspendida, a la 0 (mañana).
  const caja = acierto >= APROBADO ? Math.min((reg.caja ?? 0) + 1, INTERVALOS.length - 1) : 0;
  return { ...reg, visto: true, caja, ultimo: ahora, proximo: ahora + INTERVALOS[caja] * DIA, ultimoAcierto: acierto };
}

/** Recorre las lecciones de un curso en orden. */
export const leccionesDe = (curso) => curso.modulos.flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut, modulo: m.titulo })));

/**
 * Plan del día: repasos pendientes (los más atrasados primero), la siguiente lección nueva y,
 * si hay fecha de examen, cuántas lecciones al día hacen falta para llegar.
 * @param {object} curso
 * @param {Record<string, object>} regs   registros por id de lección
 * @param {Record<string, {ok:boolean}>} respuestas
 * @param {{ ahora?: number, fechaExamen?: string, prioridad?: number[] }} o  prioridad: UTs con límite de errores
 */
export function hoyToca(curso, regs, respuestas, { ahora = Date.now(), fechaExamen = null, prioridad = [] } = {}) {
  const ls = leccionesDe(curso).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora) }));
  const repasos = ls.filter((x) => x.e.estado === 'repasar')
    .sort((a, b) => (prioridad.includes(b.l.ut) - prioridad.includes(a.l.ut)) || ((a.e.proximo ?? 0) - (b.e.proximo ?? 0)));
  const empezadas = ls.filter((x) => x.e.estado === 'empezada');
  const nuevas = ls.filter((x) => x.e.estado === 'nueva');
  const siguiente = empezadas[0] ?? nuevas[0] ?? null;
  let ritmo = null;
  if (fechaExamen) {
    const dias = Math.max(1, Math.ceil((new Date(fechaExamen).getTime() - ahora) / DIA));
    const pendientes = nuevas.length + empezadas.length;
    ritmo = { dias, pendientes, porDia: Math.ceil(pendientes / Math.max(1, dias - 7)), simulacros: dias <= 14 };
  }
  const dominadas = ls.filter((x) => x.e.estado === 'dominada').length;
  return { repasos: repasos.slice(0, 3).map((x) => x.l), siguiente: siguiente?.l ?? null, ritmo, total: ls.length, dominadas };
}

/**
 * La pregunta del final de la clase sale cada vez al azar entre las preguntas reales de examen de la clase
 * (`disponibles`). Si la clase ya acaba en una pregunta fija, esta se sustituye; si no, se añade al final.
 * Sin preguntas reales, la clase queda como está.
 */
export function conPreguntaFinal(pasos, disponibles, rng) {
  if (!disponibles.length) return pasos;
  const q = rng.pick(disponibles);
  const final = { tipo: 'check', real: q, enunciado: q.enunciado, opciones: q.opciones, correcta: q.correcta };
  return pasos.at(-1)?.tipo === 'check' ? [...pasos.slice(0, -1), final] : [...pasos, final];
}

const VACIAS = new Set('para como cual cuál esta este estos estas desde hasta entre sobre segun según donde dónde cuando cuándo tiene tienen será serán puede pueden debe deben cuales cuáles siguientes siguiente respuesta respuestas correcta correctas correcto incorrecta afirmacion afirmación anteriores ninguna todas todos otra otro otras otros mismo misma también tambien buque buques barco barcos embarcación embarcacion'.split(' '));
const sinTildes = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const raiz = (w) => w.slice(0, 6);
/** Palabras con contenido de un texto (sin tildes, de 5 letras o más, sin las vacías), reducidas a su raíz. */
export const palabrasClave = (s = '') => [...new Set(sinTildes(s).match(/[a-zñ]{5,}/g)?.filter((w) => !VACIAS.has(w)).map(raiz) ?? [])];
/** Texto visible de un paso de clase (para saber qué se ha contado ya). */
export const textoDePaso = (p) => [p.titulo, p.texto, p.enunciado, p.explicacion, ...(p.pares ?? []).flat()].filter(Boolean).join(' ');
/**
 * ¿Se puede contestar la pregunta con lo visto? Las palabras clave del enunciado y de la respuesta correcta tienen que
 * haber salido ya en la clase (casi todas las de la respuesta; la mayoría de las del enunciado).
 */
export function cubierta(q, visto) {
  const v = new Set(palabrasClave(visto));
  const dentro = (ws) => (ws.length ? ws.filter((w) => v.has(w)).length / ws.length : 1);
  const resp = palabrasClave(q.opciones?.[q.correcta] ?? '');
  return dentro(resp) >= 0.75 && dentro(palabrasClave(q.enunciado)) >= 0.6;
}

/** Tarjetas de contenido seguidas como máximo antes de pedir una respuesta al alumno. */
export const CADA = 3;
const respondeAlumno = (p) => p.tipo === 'check' || p.tipo === 'toca' || p.tipo === 'emparejar' || (p.tipo === 'ilustracion' && p.prediccion);

/**
 * Intercala preguntas reales de la clase para que el alumno responda cada `cada` tarjetas como mucho (no se espera al
 * final). Cuenta como respuesta un «¿Lo pillas?» que ya hubiera o una lámina que pide predicción (`p.prediccion`).
 * No repite preguntas ni mete una justo antes de la pregunta final. Sin preguntas disponibles, deja la clase igual.
 * @param {object[]} pasos  pasos de la clase (con su pregunta final ya puesta)
 * @param {object[]} disponibles  preguntas reales de la clase que se pueden usar
 */
export function conPreguntasIntercaladas(pasos, disponibles, rng, cada = CADA) {
  const usadas = new Set(pasos.filter((p) => p.real).map((p) => p.real.id));
  const bolsa = rng.shuffle(disponibles.filter((q) => !usadas.has(q.id)));
  const out = [];
  let seguidas = 0;
  let visto = ''; // texto de la clase mostrado hasta aquí: solo se pregunta lo que ya se ha contado
  pasos.forEach((p, i) => {
    out.push(p);
    visto += ` ${textoDePaso(p)}`;
    if (respondeAlumno(p)) { seguidas = 0; return; }
    seguidas += 1;
    const quedan = pasos.slice(i + 1);
    const siguienteResponde = quedan[0] && respondeAlumno(quedan[0]);
    const lista = bolsa.findIndex((q) => cubierta(q, visto));
    if (seguidas >= cada && lista > -1 && quedan.length >= 2 && !siguienteResponde) {
      const [q] = bolsa.splice(lista, 1);
      out.push({ tipo: 'check', real: q, enunciado: q.enunciado, opciones: q.opciones, correcta: q.correcta, intercalada: true });
      seguidas = 0;
    }
  });
  return out;
}

/** Tarjetas por tramo de clase: sesiones cortas que se cierran solas. */
export const TARJETAS_TRAMO = 7;
/** Segundos por tarjeta mientras no se sepa el ritmo real del alumno (se va midiendo al cerrar cada tramo). */
export const SEG_TARJETA = 40;

/** Tarjetas que tendrá una clase con `nPasos` pasos: intro, una pregunta cada 3 pasos, «Empareja» y la final. */
export const tarjetasDe = (nPasos) => nPasos + Math.floor(nPasos / 3) + 3;

/** Cuántos tramos tiene una clase de `nPasos` pasos (sin los extra): uno cada unas 7 tarjetas (al menos 1). */
export function numTramos(nPasos = 1) {
  return Math.max(1, Math.min(nPasos, Math.round(tarjetasDe(nPasos) / TARJETAS_TRAMO)));
}

/** Minutos que lleva un tramo de `n` tarjetas al ritmo `seg` (segundos por tarjeta). */
export const minutosTramo = (n, seg = SEG_TARJETA) => Math.max(1, Math.round((n * seg) / 60));

/** Ritmo nuevo (media móvil) tras un tramo de `n` tarjetas hecho en `ms`; cada tarjeta cuenta entre 10 y 120 s. */
export function nuevoRitmo(seg = SEG_TARJETA, n = 1, ms = 0) {
  const muestra = Math.min(120, Math.max(10, ms / 1000 / Math.max(1, n)));
  return Math.round(0.7 * seg + 0.3 * muestra);
}

/**
 * Reparte los pasos de una clase en `k` tramos seguidos (`p.tramo` = 0…k−1), equilibrando la longitud del texto
 * (una tarjeta corta pesa menos que una larga). Un tramo nunca queda vacío.
 */
export function enTramos(pasos, k) {
  const peso = (p) => 120 + (p.texto?.length ?? 0) + (p.enunciado?.length ?? 0);
  const total = pasos.reduce((s, p) => s + peso(p), 0);
  let acum = 0;
  return pasos.map((p, i) => {
    const t = Math.min(k - 1, Math.floor((k * acum) / total), i);
    acum += peso(p);
    return { ...p, tramo: Math.max(t, k - (pasos.length - i) > 0 ? k - (pasos.length - i) : 0) };
  });
}

/**
 * Pista de una parte de lámina sin decir su nombre (para «Toca en el dibujo»): lo que va tras «Nombre:» o tras la
 * primera frase, hasta el primer punto. «G, centro de gravedad: donde se concentra el peso…» → «donde se concentra el peso…».
 */
export function pistaParte(desc = '', max = 110) {
  const s = String(desc);
  const dos = s.indexOf(':');
  const resto = dos > -1 && dos < 45 ? s.slice(dos + 1) : s.includes('. ') ? s.slice(s.indexOf('. ') + 2) : s;
  return definicionCorta(resto.trim(), max);
}

/** Primera frase de una definición, recortada para caber en un botón de «Empareja». */
export function definicionCorta(def = '', max = 95) {
  const f = def.split(/(?<=\.)\s/)[0].replace(/\.$/, '');
  return f.length > max ? `${f.slice(0, f.lastIndexOf(' ', max - 1))}…` : f;
}

/**
 * Añade ejercicios que no son de elegir opción: tras cada lámina con partes con nombre, «Toca en el dibujo»; y antes de
 * la pregunta final, «Empareja» con los términos de la clase (si hay al menos 3). `partesDe(spec)` da las partes de
 * una lámina ([[parte, nombre]…]) o null.
 */
export function conEjercicios(pasos, { terminos = [], partesDe = () => null } = {}) {
  const out = [];
  for (const p of pasos) {
    out.push(p);
    const partes = p.tipo === 'ilustracion' ? partesDe(p.spec) : null;
    if (partes?.length >= 3) out.push({ tipo: 'toca', spec: p.spec, partes });
  }
  if (terminos.length >= 3) {
    const i = out.at(-1)?.tipo === 'check' ? out.length - 1 : out.length;
    out.splice(i, 0, { tipo: 'emparejar', pares: terminos.map((t) => [t.termino, definicionCorta(t.definicion)]) });
  }
  return out;
}
