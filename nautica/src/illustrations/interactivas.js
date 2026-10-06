// Registro de las láminas interactivas. Cada una usa el mismo identificador que su lámina del catálogo:
// las specs no cambian y validSpec las sigue aceptando. Si la spec no encaja (aplica() falso), se dibuja la lámina fija.
import { rosa } from './interactivas/rosa.js';
import { nortes } from './interactivas/nortes.js';
import { abatimiento } from './interactivas/abatimiento.js';
import { corriente } from './interactivas/corriente.js';
import { sectoresLuces } from './interactivas/sectores-luces.js';
import { cruce } from './interactivas/cruce.js';
import { estabilidad } from './interactivas/estabilidad.js';
import { heliceTimon } from './interactivas/helice-timon.js';
import { desatraque } from './interactivas/desatraque.js';
import { isobaras } from './interactivas/isobaras.js';
import { nieblas } from './interactivas/nieblas.js';
import { marea } from './interactivas/marea.js';
import { frentes } from './interactivas/frentes.js';
import { barcoViento, cardinales, playaDistancia, fuegoApagar } from './interactivas/per-basicas.js';

export const INTERACTIVAS = { rosa, nortes, abatimiento, corriente, 'sectores-luces': sectoresLuces, cruce, estabilidad, 'helice-timon': heliceTimon, desatraque,
  // PER: solo las specs que lo piden (modo/marca) son interactivas; las demás de esos tipos siguen fijas (tarjetas, fichas…)
  barco: barcoViento, cardinales, playa: playaDistancia, fuego: fuegoApagar,
  // meteo: solo algunas variantes son interactivas; el resto (borrasca, anticiclón, brisas…) sigue fija
  // marea: curva, duodécimos y sonda son la misma lámina interactiva; «fases» (vivas y muertas) sigue fija
  marea: { porVariante: 'modo', porDefecto: 'curva', variantes: { curva: marea, duodecimos: marea, sonda: marea } },
  meteo: { porVariante: 'sistema', variantes: { isobaras, 'niebla-adveccion': nieblas, 'niebla-radiacion': nieblas, 'niebla-vapor': nieblas, frentes } },
};

/** Definición interactiva que corresponde a una spec, o null. */
export function interactivaDe(spec) {
  let def = spec && INTERACTIVAS[spec.tipo];
  if (def?.porVariante) def = def.variantes[spec[def.porVariante] ?? def.porDefecto];
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

/**
 * Todas las láminas interactivas, una entrada por variante: { clave, tipo, def, ejemplo, encaja(spec) }.
 * La clave es el tipo («nortes») o tipo:variante («meteo:isobaras»).
 */
export function listaInteractivas() {
  return Object.entries(INTERACTIVAS).flatMap(([tipo, d]) => (d.porVariante
    ? Object.entries(d.variantes).map(([v, def]) => ({ clave: `${tipo}:${v}`, tipo, def, ejemplo: { tipo, [d.porVariante]: v }, encaja: (s) => s.tipo === tipo && s[d.porVariante] === v }))
    : [{ clave: tipo, tipo, def: d, ejemplo: null, encaja: (s) => s.tipo === tipo }]));
}
