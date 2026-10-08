// Ficha de una idea (concepto) que se le resiste al alumno. Funciones puras: cuándo toca la ficha y qué lleva.
// La vista es src/ui/views/idea.js (#/<tit>/idea/<idConcepto>); se abre desde el repaso de fallos (tras el segundo
// fallo de la idea), el resumen de la sesión (idea en rojo) y el Temario (idea floja). Nunca durante un examen ni
// dentro de un simulacro: ninguna de esas pantallas la enlaza.
//
// La ficha no inventa contenido: la nota del catálogo (sin las frases que son instrucciones para quien etiqueta), la
// clase donde se enseña con su mapa o su lámina, las reglas para recordar validadas (data/comun/mnemotecnias.json) de
// sus preguntas o de su clase, y la chuleta de esa clase.

/** Intentos que hacen falta (con la idea floja) para dejar de insistir con preguntas y ofrecer la ficha. */
export const INTENTOS_FICHA = 2;

/**
 * ¿Toca la ficha? La idea está floja (último intento fallado o acierto suavizado < 60 %) y lleva al menos
 * INTENTOS_FICHA intentos (dos preguntas distintas o la misma dos veces): sale floja por segunda vez.
 * @param {object} d  dominio de la idea (ic.dominio(respuestas)[id])
 * @param {object[]} qs  sus preguntas (ic.preguntasDe(id, { soloEstudio: false }))
 */
export function necesitaFicha(d, qs = [], respuestas = {}) {
  if (!d || d.estado !== 'flojo') return false;
  const intentos = qs.reduce((s, q) => s + (respuestas[q.id] ? (respuestas[q.id].n ?? 1) : 0), 0);
  return Math.max(intentos, d.vistas) >= INTENTOS_FICHA && d.fallos >= 1;
}

/**
 * ¿Hay que enseñar la ficha antes de volver a preguntar la idea? Toca la ficha y no se ha abierto desde su último
 * fallo (vista = ISO de la última vez que se abrió, o undefined).
 */
export const fichaPendiente = (d, qs, respuestas, vista) => necesitaFicha(d, qs, respuestas) && !(vista && d.ultimo?.t && vista >= d.ultimo.t);

// Frases de la nota que son para quien etiqueta (dónde va cada pregunta), no para el alumno.
const ID = /\b[a-z][a-z0-9-]*(?:\.[a-z0-9-]+){1,}\b/;
const PARA_ETIQUETAR = [
  ID, // cita ids del catálogo («va en meteo.presion.tendencia»)
  /\b(?:la|las|una|esa) preguntas?\b[^.]*\b(?:va|van)\b/i, // «si la pregunta …, va al concepto…»
  /\bse pregunta en\b/i, // de qué tribunal sale
  /\bse usa cuando la pregunta\b/i,
  /^(?:Sustituido por|Retirado)\b/,
  /\bva(?:n)? (?:al|a la|en el|en la) concepto\b/i,
  /\b(?:no incluye|no entra|queda fuera)\b[^.]*\((?:va|van) /i,
];

/** Partes una nota en frases (sin romper «p. ej.», «art. 17», «arts. 17–25» ni cifras decimales). */
function frases(texto) {
  const out = [];
  let actual = '';
  const partes = String(texto).split(/(?<=[.;!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡(])/u);
  for (const p of partes) {
    actual = actual ? `${actual} ${p}` : p;
    if (/\b(?:p\. ej|art|arts|núm|aprox|etc)\.$/i.test(actual)) continue;
    out.push(actual);
    actual = '';
  }
  if (actual) out.push(actual);
  return out;
}

/**
 * La nota del catálogo para el alumno: la misma, sin las frases (o los paréntesis) que solo sirven para etiquetar.
 * Si no queda nada, null (la ficha va sin nota antes que con una instrucción interna).
 */
export function notaParaAlumno(nota) {
  if (!nota) return null;
  const limpia = frases(nota)
    .map((f) => f.replace(/\s*\([^()]*\b(?:va|van)\s+(?:en|a|al)\s+[^()]*\)/g, '') // «(va en …)»
      .replace(/\s+cuando se preguntan? como vocabulario/g, ''))
    .filter((f) => !PARA_ETIQUETAR.some((re) => re.test(f)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return limpia || null;
}

/**
 * Reglas para recordar de una idea: las de sus preguntas (reglasDe(idPregunta) del banco) y las de la clase donde se
 * enseña (pasos de tipo «regla»), sin repetir.
 * @param {object[]} qs  preguntas de la idea
 * @param {(id: string) => object[]} reglasDe
 * @param {object|null} clase  la clase (con sus pasos)
 * @param {Map<string, object>} reglasPorId
 */
export function reglasDeIdea(qs, reglasDe, clase = null, reglasPorId = new Map()) {
  const vistas = new Map();
  for (const q of qs) for (const r of reglasDe?.(q.id) ?? []) if (r?.id && !vistas.has(r.id)) vistas.set(r.id, r);
  for (const p of clase?.pasos ?? []) if (p.tipo === 'regla' && reglasPorId.has(p.id) && !vistas.has(p.id)) vistas.set(p.id, reglasPorId.get(p.id));
  return [...vistas.values()];
}

/**
 * La pregunta de «Probar otra pregunta»: otra del ESTUDIO con esa idea como principal, nunca reservada, anulada ni
 * retirada (ic.preguntasDe), y que no sea ninguna de `excluir`. Antes las no vistas, luego las falladas (la más
 * antigua primero) y luego las acertadas (la más antigua primero); con `rng`, al azar entre las del mejor nivel.
 */
export function preguntaParaProbar(ic, idConcepto, respuestas = {}, { excluir = [], rng = null } = {}) {
  const fuera = new Set(excluir);
  let qs = ic.preguntasDe(idConcepto, { soloEstudio: true, soloPrincipal: true, conDescendientes: false }).filter((q) => !fuera.has(q.id));
  if (!qs.length) qs = ic.preguntasDe(idConcepto, { soloEstudio: true, conDescendientes: false }).filter((q) => !fuera.has(q.id));
  if (!qs.length) return null;
  const nivel = (q) => { const r = respuestas[q.id]; return !r ? 0 : r.ok ? 2 : 1; };
  const mejor = Math.min(...qs.map(nivel));
  const top = qs.filter((q) => nivel(q) === mejor).sort((a, b) => String(respuestas[a.id]?.t ?? '').localeCompare(String(respuestas[b.id]?.t ?? '')));
  return mejor === 0 && rng ? top[Math.floor(rng() * top.length)] : top[0];
}
