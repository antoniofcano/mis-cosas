// Contrato de un tipo de ejercicio. Añadir un tipo nuevo = crear un fichero en ./types/ que exporte
// `defineExercise({...})` y registrarlo en ./registry.js. La interfaz, la corrección, las pistas, el
// dibujo en la carta y el resumen para IA funcionan solos a partir de esta definición.
//
// {
//   id:          'situacion-dos-demoras'          identificador estable (va en la URL)
//   title:       'Situación por dos demoras'
//   category:    'situacion'                       ver CATEGORIES
//   levels:      ['PER', 'PY']                     titulaciones en las que entra
//   difficulty:  1..3
//   concepts:    ['Ct', 'demora']                  claves del glosario (nautical/glossary.js)
//   summary:     'Texto corto para el menú'
//   method:      ['Paso 1 ...', 'Paso 2 ...']      procedimiento general (teoría breve)
//   generate(rng, ctx) → params                   datos aleatorios reproducibles con semilla
//   statement(params, ctx) → string               enunciado en lenguaje de examen
//   solve(params, ctx) → { results, steps, drawing? }
//        results: { clave: valorNumérico }        un valor por cada respuesta
//        steps:   [{ title, text }]               solución razonada; se usa también como pistas
//        drawing: { items: [...primitivas], focus: [puntos] }   construcción gráfica (graphics/)
//   answers:     [{ key, label, kind, tolerance? }]   kind: ver analysis/quantities.js
//   mistakes:    [{ id, explain, mutate(params, ctx) → params }]   errores típicos (diagnóstico)
// }

const REQUIRED = ['id', 'title', 'category', 'levels', 'generate', 'statement', 'solve', 'answers'];

export function defineExercise(def) {
  for (const k of REQUIRED) {
    if (def[k] == null) throw new Error(`Ejercicio "${def.id ?? '?'}": falta "${k}"`);
  }
  return Object.freeze({ difficulty: 1, concepts: [], method: [], mistakes: [], summary: '', ...def });
}

export const CATEGORIES = [
  { id: 'aguja', title: 'Aguja y corrección total', icon: '🧭', blurb: 'Rv, Ra, Rm, dm, Δ y Ct.' },
  { id: 'estima', title: 'Navegación de estima', icon: '📐', blurb: 'Rumbo, distancia, velocidad y tiempo entre puntos.' },
  { id: 'situacion', title: 'Situación', icon: '📍', blurb: 'Demoras, distancias y enfilaciones.' },
  { id: 'corrientes', title: 'Corrientes', icon: '🌊', blurb: 'Rumbo efectivo, rumbo a dar y corriente desconocida.' },
  { id: 'viento', title: 'Viento y abatimiento', icon: '💨', blurb: 'Rumbo de superficie y abatimiento.' },
  { id: 'mareas', title: 'Mareas', icon: '🌙', blurb: 'Altura de la marea, sonda y hora para pasar por un bajo.' },
];

/** Las respuestas pueden depender de la variante del ejercicio: `answers` puede ser lista o función(params). */
export const answersFor = (exercise, params) =>
  typeof exercise.answers === 'function' ? exercise.answers(params) : exercise.answers;
