// Normalización de texto y similitud entre preguntas.

/** Limpieza mínima del texto extraído: espacios, guiones de corte de línea y comillas tipográficas sueltas. */
export function limpiar(s) {
  return String(s ?? '')
    .replace(/­/g, '')
    .replace(/[ -​ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:)])(?=\s|$)/g, '$1')
    .trim();
}

/** Forma canónica para comparar: sin tildes, minúsculas, comillas y apóstrofos unificados, espacios simples. */
export function canonico(s) {
  return limpiar(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‘’‚‛′´`]/g, "'")
    .replace(/[“”„″«»]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/[º°˚]/g, 'º')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clave sin signos: solo letras y dígitos (para agrupar preguntas idénticas). */
export function clave(s) {
  return canonico(s).replace(/[^a-z0-9ñ]+/g, ' ').trim();
}

export function tokens(s) {
  return clave(s).split(' ').filter(Boolean);
}

/** Jaccard sobre conjuntos de palabras. */
export function jaccard(a, b) {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (!A.size && !B.size) return 1;
  let i = 0;
  for (const t of A) if (B.has(t)) i++;
  return i / (A.size + B.size - i);
}

/** Texto completo de una pregunta (enunciado + opciones en orden alfabético de su texto: invariante a barajar). */
export function textoPregunta(p, { barajable = true } = {}) {
  const ops = Object.values(p.opciones ?? {}).map(clave);
  return `${clave(p.enunciado)} || ${(barajable ? ops.sort() : ops).join(' | ')}`;
}

/**
 * Similitud entre dos preguntas: Jaccard del enunciado y del conjunto de opciones (sin importar el orden).
 * Devuelve { enunciado, opciones, total } en 0..1; total = media ponderada (enunciado 0,5; opciones 0,5).
 */
export function similitud(p, q) {
  const e = jaccard(p.enunciado, q.enunciado);
  const op = Object.values(p.opciones ?? {}).map(clave).sort();
  const oq = Object.values(q.opciones ?? {}).map(clave).sort();
  // Opciones: proporción de opciones de p con una igual (exacta) en q, más Jaccard global como desempate.
  const iguales = op.filter((o) => oq.includes(o)).length / Math.max(op.length, oq.length, 1);
  const o = Math.max(iguales, jaccard(op.join(' '), oq.join(' ')) * 0.9);
  return { enunciado: e, opciones: o, total: 0.5 * e + 0.5 * o };
}
