// Preguntas equivalentes entre ejes: la del banco de un eje que pregunta lo mismo que otra de otro eje.
// Primero por `concepto` (agrupación que se pone al reutilizar explicaciones entre preguntas equivalentes; el concepto de
// una pregunta sin concepto es su propio id) y, si no hay, por parecido del texto dentro del mismo tema.
// Función pura: la usan el motor de bancos (equivalente) y los tests.

const SIN_TILDES = /[̀-ͯ]/g;
const VACIAS = new Set(['de', 'la', 'el', 'los', 'las', 'en', 'y', 'a', 'que', 'un', 'una', 'del', 'por', 'con', 'se', 'su', 'al', 'es', 'o', 'para', 'lo', 'le', 'como', 'mas', 'no', 'si']);

/** Palabras con significado de un texto (sin tildes, en minúsculas, sin palabras vacías). */
export function palabras(texto) {
  return new Set(String(texto ?? '').normalize('NFD').replace(SIN_TILDES, '').toLowerCase().split(/[^a-z0-9ñ]+/).filter((w) => w.length > 1 && !VACIAS.has(w)));
}

const jaccard = (A, B) => {
  if (!A.size && !B.size) return 0;
  let i = 0;
  for (const w of A) if (B.has(w)) i++;
  return i / (A.size + B.size - i);
};

/** Parecido (0–1) de dos preguntas: la mitad por el enunciado y la mitad por el conjunto de sus opciones. */
export function parecido(p, q) {
  return 0.5 * jaccard(palabras(p.enunciado), palabras(q.enunciado))
    + 0.5 * jaccard(palabras(Object.values(p.opciones ?? {}).join(' ')), palabras(Object.values(q.opciones ?? {}).join(' ')));
}

/** Umbral de parecido para dar por equivalentes dos preguntas sin concepto común. */
export const UMBRAL_PARECIDO = 0.5;

/**
 * La pregunta de `candidatas` (un banco de otro eje, misma titulación) equivalente a `q`, o null.
 * Solo cuentan las que se pueden contestar (no anuladas, con respuesta).
 */
export function equivalenteEn(q, candidatas) {
  const utiles = candidatas.filter((c) => !c.anulada && c.correcta);
  const conceptos = new Set([q.id, q.concepto].filter(Boolean));
  const mejor = (lista) => lista.map((c) => ({ c, s: parecido(q, c) })).sort((a, b) => b.s - a.s)[0]?.c ?? null;
  const porConcepto = utiles.filter((c) => c.concepto && conceptos.has(c.concepto));
  if (porConcepto.length) return mejor(porConcepto);
  const mismas = utiles.filter((c) => c.ut === q.ut).map((c) => ({ c, s: parecido(q, c) })).sort((a, b) => b.s - a.s);
  return mismas[0]?.s >= UMBRAL_PARECIDO ? mismas[0].c : null;
}
