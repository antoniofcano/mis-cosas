// Registro de las láminas interactivas. Cada una usa el mismo identificador que su lámina del catálogo:
// las specs no cambian y validSpec las sigue aceptando. Si la spec no encaja (aplica() falso), se dibuja la lámina fija.
import { rosa } from './interactivas/rosa.js';
import { nortes } from './interactivas/nortes.js';
import { abatimiento } from './interactivas/abatimiento.js';
import { corriente } from './interactivas/corriente.js';
import { sectoresLuces } from './interactivas/sectores-luces.js';
import { cruce } from './interactivas/cruce.js';

export const INTERACTIVAS = { rosa, nortes, abatimiento, corriente, 'sectores-luces': sectoresLuces, cruce };

/** Definición interactiva que corresponde a una spec, o null. */
export function interactivaDe(spec) {
  const def = spec && INTERACTIVAS[spec.tipo];
  if (!def) return null;
  return !def.aplica || def.aplica(spec) ? def : null;
}

/** Imagen fija de una lámina interactiva: su mismo dibujo en el estado inicial de la spec. */
export function dibujoFijo(def, spec) {
  const e = def.estado(spec);
  const d = def.dibujar(e, def.calcular(e), { pendiente: false });
  return { svg: d.svg ?? d.vistas.map((v) => v.svg).join(''), caption: def.pie ? def.pie(e) : d.lectura };
}

/** ¿Esta spec, en una clase, pide responder una predicción antes de seguir? */
export function pidePrediccion(spec) {
  const def = interactivaDe(spec);
  return !!def?.prediccion && def.prediccion(def.estado(spec), spec) != null;
}
