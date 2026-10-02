// Estabilidad transversal con un peso que se puede subir, bajar y trasladar de banda. Modelo de pequeñas
// escoras (metacentro fijo), suficiente para las preguntas del examen: subir peso sube G y reduce GM; trasladarlo
// a una banda escora hacia ella; con GM ≤ 0 el barco no adriza. Funciones puras.

/** Barco de ejemplo (cifras ilustrativas): desplazamiento D (t), peso móvil w (t), KM, KB y KG del resto (m). */
export const BARCO = { D: 10, w: 1, KM: 1.2, KB: 0.5, KGresto: 0.9 };
const rad = (d) => (d * Math.PI) / 180;

/**
 * @param {{ altura: number, traslado: number, escora?: number }} p  altura del peso sobre la quilla (m); traslado
 *   lateral del peso (m, + estribor); escora a la que una ola deja el barco, hacia estribor (grados)
 * @returns {{ KG, GM, GGt, GZ, estable: boolean, adriza: boolean, alturaCritica }}
 */
export function estabilidad({ altura, traslado = 0, escora = 15 }, b = BARCO) {
  const KG = ((b.D - b.w) * b.KGresto + b.w * altura) / b.D;
  const GM = b.KM - KG;
  const GGt = (b.w * traslado) / b.D; // G se va hacia donde va el peso
  // Brazo adrizante con el barco escorado a estribor: el empuje (en B) y el peso (en G) forman un par.
  const GZ = GM * Math.sin(rad(escora)) - GGt * Math.cos(rad(escora));
  const alturaCritica = (b.KM * b.D - (b.D - b.w) * b.KGresto) / b.w; // altura del peso con la que GM = 0
  return { KG, GM, GGt, GZ, estable: GM > 0, adriza: GZ > 0, alturaCritica };
}
