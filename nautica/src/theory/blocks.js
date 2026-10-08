// Motor de tests: estructura oficial del examen teórico del PER (RD 875/2014, anexo) y sus reglas.
// Para añadir otra titulación (PY, PNB…), define su estructura con el mismo formato.

export const PER = {
  id: 'PER',
  titulo: 'Patrón de Embarcaciones de Recreo',
  duracionMin: 90,
  minAciertos: 32,
  // ut: unidad teórica · n: preguntas en el examen · maxErrores: límite propio del bloque (si lo tiene)
  bloques: [
    { ut: 1, titulo: 'Nomenclatura náutica', n: 4, ico: 'velero' },
    { ut: 2, titulo: 'Amarre y fondeo', n: 2, ico: 'ancla' },
    { ut: 3, titulo: 'Seguridad', n: 4, ico: 'chaleco' },
    { ut: 4, titulo: 'Legislación', n: 2, ico: 'ley' },
    { ut: 5, titulo: 'Balizamiento', n: 5, maxErrores: 2, ico: 'boya' },
    { ut: 6, titulo: 'Reglamento (RIPA)', n: 10, maxErrores: 5, ico: 'barco' },
    { ut: 7, titulo: 'Maniobra y navegación', n: 2, ico: 'timon' },
    { ut: 8, titulo: 'Emergencias en la mar', n: 3, ico: 'salvavidas' },
    { ut: 9, titulo: 'Meteorología', n: 4, ico: 'nube' },
    { ut: 10, titulo: 'Teoría de navegación', n: 5, ico: 'brujula' },
    { ut: 11, titulo: 'Carta de navegación', n: 4, maxErrores: 2, ico: 'mapa' },
  ],
  // Orden en que se recomienda estudiar: el vocabulario primero y después lo que más pesa y más práctica pide
  // (los temas con límite de fallos y la navegación); el resto al final.
  ordenEstudio: [1, 5, 6, 10, 11, 2, 3, 4, 7, 8, 9],
  // Aprobar «con margen» el examen final (F1): lo que hace falta para darse por preparado, no solo apto.
  margen: { minAciertos: 36, maxErrores: { 6: 3, 5: 1, 11: 1 } },
};

export const totalPreguntas = (estructura) => estructura.bloques.reduce((s, b) => s + b.n, 0);
export const bloque = (estructura, ut) => estructura.bloques.find((b) => b.ut === ut);

/** Posición de un tema (por su ut) en el orden de estudio: para ordenar cualquier lista por temas igual en todas partes. */
export function posEstudio(estructura, ut) {
  const orden = estructura.ordenEstudio ?? [];
  const i = orden.indexOf(ut);
  return i < 0 ? orden.length + ut : i;
}

/** Bloques en el orden de estudio recomendado (o en el oficial si la estructura no lo fija). */
export function bloquesEnOrden(estructura) {
  return [...estructura.bloques].sort((a, b) => posEstudio(estructura, a.ut) - posEstudio(estructura, b.ut));
}

// Patrón de Yate (RD 875/2014, anexo II, ap. 4): 40 preguntas en dos módulos de 20 (genérico: Seguridad y
// Meteorología; navegación: Teoría y Carta). Cómo numera y reparte cada tribunal sus cuadernillos va en los datos
// de su eje (data/ejes/<eje>/eje.json y el campo `orden` de cada pregunta).
export const PY = {
  id: 'PY',
  titulo: 'Patrón de Yate',
  duracionMin: 120,
  minAciertos: 28,
  modulos: [
    { id: 'generico', titulo: 'Módulo genérico', duracionMin: 45, uts: [1, 2] },
    { id: 'navegacion', titulo: 'Módulo de navegación', duracionMin: 75, uts: [3, 4] },
  ],
  bloques: [
    { ut: 1, titulo: 'Seguridad en la mar', n: 10, ico: 'chaleco' },
    { ut: 2, titulo: 'Meteorología', n: 10, ico: 'nube' },
    { ut: 3, titulo: 'Teoría de navegación', n: 10, maxErrores: 5, ico: 'brujula' },
    { ut: 4, titulo: 'Carta de navegación', n: 10, maxErrores: 3, ico: 'mapa' },
  ],
  // Primero el módulo de navegación (límites de fallos y más práctica); después el genérico.
  ordenEstudio: [3, 4, 1, 2],
  margen: { minAciertos: 32, maxErrores: { 4: 1, 3: 3 } },
};

/**
 * Titulaciones disponibles. Cada una: su estructura de examen, el nivel de los ejercicios de carta y la UT de carta.
 * `calculadora`: si en su examen se permite la calculadora científica cuando la ficha del eje no lo dice
 * (src/calculadora/reglas.js). Sus preguntas están en el banco de cada eje (src/bancos). Añadir otra (PNB, Capitán…) = una entrada más aquí.
 */
export const TITULACIONES = {
  per: {
    id: 'per', sigla: 'PER', nombre: 'Patrón de Embarcaciones de Recreo', ico: 'velero', estructura: PER, nivel: 'PER', cartaUt: 11, calculadora: false,
    resumen: '45 preguntas · 90 minutos · apto con 32 aciertos',
    reglas: ['45 preguntas tipo test, 4 opciones, 90 minutos.', 'Apto con al menos 32 aciertos (máximo 13 fallos).',
      'Además, como máximo: 5 errores en Reglamento (RIPA), 2 en Balizamiento y 2 en Carta de navegación.'],
  },
  py: {
    id: 'py', sigla: 'PY', nombre: 'Patrón de Yate', ico: 'barco', estructura: PY, nivel: 'PY', cartaUt: 4, calculadora: true,
    resumen: '40 preguntas · 2 módulos (45 + 75 min) · apto con 28 aciertos',
    reglas: ['40 preguntas tipo test en dos módulos: genérico (Seguridad y Meteorología, 45 min) y navegación (Teoría y Carta, 75 min).',
      'Apto con al menos 28 aciertos (máximo 12 fallos).', 'Además, como máximo: 5 errores en Teoría de navegación y 3 en Carta.'],
  },
};
