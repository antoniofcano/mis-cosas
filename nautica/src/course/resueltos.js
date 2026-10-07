// Clases de carta → preguntas reales de examen ya resueltas por la app (src/exams/solutions) del mismo tipo, para
// «Míralo resuelto en la carta». Se elige por el tipo de ejercicio de la solución o, cuando el tipo mezcla casos
// distintos, por la lista exacta de preguntas. Las reglas son de cada eje (sus ids): van en sus datos.

/**
 * Ids de las preguntas resueltas que ilustran una clase, según la regla del eje para esa clase
 * (data/ejes/<eje>/<tit>/resueltos.json): `ids` = lista exacta; si no, las del tipo de ejercicio (`ejercicios`)
 * salvo `excepto`. Solo cuentan las que tienen solución programada y están en el banco (`porId`). Sin regla, [].
 * @param {{ ids?: string[], ejercicios?: string[], excepto?: string[] }|undefined} regla
 * @param {Record<string, { ejercicio?: string }>} soluciones
 * @param {Map<string, object>} porId
 */
export function resueltasSegun(regla, soluciones, porId) {
  if (!regla) return [];
  const cumple = regla.ids
    ? (id) => regla.ids.includes(id)
    : (id, s) => (regla.ejercicios ?? []).includes(s.ejercicio) && !(regla.excepto ?? []).includes(id);
  return Object.entries(soluciones).filter(([id, s]) => porId.has(id) && cumple(id, s)).map(([id]) => id);
}

/**
 * Inserta el paso «resuelto» tras el primer paso de resolución de la clase («Resolución…», «Ejemplo resuelto»,
 * «Método paso a paso») y sus láminas; si no lo hay, antes de la pregunta final. Sin preguntas resueltas, la clase queda igual.
 */
export function conResuelto(pasos, ids) {
  if (!ids.length) return pasos;
  const paso = { tipo: 'resuelto', ids };
  let i = pasos.findIndex((p) => /^(Resolución|Ejemplo resuelto|Método paso a paso)/i.test(p.titulo ?? ''));
  if (i < 0) i = pasos.at(-1)?.tipo === 'check' ? pasos.length - 2 : pasos.length - 1;
  else while (pasos[i + 1]?.tipo === 'ilustracion') i += 1; // detrás de la lámina de la resolución
  return [...pasos.slice(0, i + 1), paso, ...pasos.slice(i + 1)];
}
