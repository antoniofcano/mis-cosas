// La tanda de práctica de una clase a medias (#/<tit>/curso/<id>, al final de las tarjetas o directa con ?practica=1).
// Se guarda en un ajuste del aparato (no se comparte entre aparatos): si el alumno sale a mitad (avisar de un error, una
// llamada, cambiar de app), al volver a la clase sigue en la misma pregunta con los aciertos que llevaba.

export const CLAVE_TANDA = 'tandaClase'; // { leccion, ids, i, ok, dia }
export const DIAS_TANDA = 3; // pasados estos días, la tanda a medias se olvida y se empieza otra

/**
 * La tanda a medias de esta clase, si la hay y sigue valiendo (sus preguntas siguen en el estudio); si no, null.
 * @param {object|null} t  el ajuste guardado
 * @param {string} leccion
 * @param {Map<string, object>|Set<string>} preguntas  las del estudio (por id)
 * @param {string} hoy  'AAAA-MM-DD'
 */
export function tandaAMedias(t, leccion, preguntas, hoy = new Date().toISOString().slice(0, 10)) {
  if (!t || t.leccion !== leccion || !Array.isArray(t.ids) || !t.ids.length || !t.ids.every((x) => preguntas.has(x))) return null;
  const i = Number(t.i);
  if (!Number.isInteger(i) || i < 0 || i >= t.ids.length) return null;
  const dias = (Date.parse(hoy) - Date.parse(t.dia ?? '')) / 864e5;
  if (!(dias >= 0 && dias <= DIAS_TANDA)) return null;
  return { ids: t.ids, i, ok: Math.max(0, Math.min(Number(t.ok) || 0, i)) };
}
