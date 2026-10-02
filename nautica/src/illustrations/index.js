// Motor de ilustraciones de teoría: { tipo, ...parámetros } → { svg, caption, sound? }.
// Dibujos SVG generados al vuelo y animados con SMIL (sin JavaScript ni imágenes): ligeros y nítidos.
// Para añadir una ilustración nueva: crea su función y regístrala en RENDERERS y en CATALOGO.

import { buoyIllustration, cardinalClock, BUOYS } from './buoys.js';
import { shipIllustration, SHIPS } from './ships.js';
import { crossingIllustration, soundIllustration, SENALES } from './situations.js';
import { meteoIllustration, boatIllustration, propellerIllustration, roseIllustration, flagIllustration } from './misc.js';
import { parseRhythm, rhythmTimeline, blinkingLight } from './lights.js';
import { nortesIllustration, enfilacionIllustration, corrienteIllustration, abatimientoIllustration, vientoAparenteIllustration, loxodromicaIllustration, mareaIllustration, sectoresIllustration, canalIllustration, dstIllustration } from './navigation.js';
import { socorroIllustration, SOCORRO } from './socorro.js';
import { estabilidadIllustration, movimientoIllustration, amarrasIllustration, busquedaIllustration, hombreAlAguaIllustration, fuegoIllustration, jerarquiaIllustration } from './seamanship.js';

function rhythmIllustration(spec) {
  const r = parseRhythm(spec.ritmo);
  const W = 300;
  const H = 120;
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Ritmo ${spec.ritmo}"><rect width="${W}" height="${H}" rx="10" class="il-night"/>` +
    blinkingLight(50, 58, 9, spec.ritmo) +
    `<text x="96" y="34" class="il-title left night">${spec.ritmo}</text>` + rhythmTimeline(96, 50, 184, 16, spec.ritmo) + '</svg>';
  return { svg, caption: spec.texto ?? `Periodo de ${r.period} s: el tiempo que tarda en repetirse la secuencia completa.` };
}

const RENDERERS = {
  boya: buoyIllustration,
  cardinales: (s) => cardinalClock(s.resaltar),
  ritmo: rhythmIllustration,
  buque: shipIllustration,
  cruce: crossingIllustration,
  sonido: soundIllustration,
  meteo: meteoIllustration,
  barco: boatIllustration,
  helice: propellerIllustration,
  rosa: roseIllustration,
  bandera: flagIllustration,
  nortes: nortesIllustration,
  enfilacion: enfilacionIllustration,
  corriente: corrienteIllustration,
  abatimiento: abatimientoIllustration,
  'viento-aparente': vientoAparenteIllustration,
  loxodromica: loxodromicaIllustration,
  marea: mareaIllustration,
  'sectores-luces': sectoresIllustration,
  canal: canalIllustration,
  dst: dstIllustration,
  jerarquia: jerarquiaIllustration,
  estabilidad: estabilidadIllustration,
  movimiento: movimientoIllustration,
  amarras: amarrasIllustration,
  busqueda: busquedaIllustration,
  'hombre-al-agua': hombreAlAguaIllustration,
  fuego: fuegoIllustration,
  socorro: socorroIllustration,
};

/** Catálogo documentado (lo usan los editores de contenido y la validación). */
export const CATALOGO = {
  boya: { params: { clase: Object.keys(BUOYS), ritmo: 'opcional, p.ej. "Fl(3) G 9s"', reloj: 'bool (cardinales: reloj completo)' }, ejemplo: { tipo: 'boya', clase: 'estribor' } },
  cardinales: { params: { resaltar: ['cardinal-n', 'cardinal-e', 'cardinal-s', 'cardinal-w'] }, ejemplo: { tipo: 'cardinales', resaltar: 'cardinal-s' } },
  ritmo: { params: { ritmo: 'característica: Fl, Fl(2) 5s, Q, VQ(3) 5s, Q(6)+LFl 15s, Iso 4s, Oc 6s, LFl 10s, Mo(A) 6s, Al.Bu/Y 3s', texto: 'opcional' }, ejemplo: { tipo: 'ritmo', ritmo: 'Fl(2) 5s' } },
  buque: { params: { clase: Object.keys(SHIPS), vista: ['proa', 'babor', 'estribor', 'popa', 'todas'], dia: 'bool: añade sus marcas de día', arrancada: 'bool (por defecto true)' }, ejemplo: { tipo: 'buque', clase: 'pesquero-arrastre', vista: 'proa', dia: true } },
  cruce: { params: { situacion: ['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'] }, ejemplo: { tipo: 'cruce', situacion: 'cruce' } },
  sonido: { params: { senal: Object.keys(SENALES), texto: 'opcional' }, ejemplo: { tipo: 'sonido', senal: '..' } },
  meteo: { params: { sistema: ['borrasca', 'anticiclon', 'buys-ballot', 'brisa-mar', 'brisa-tierra', 'frentes', 'isobaras', 'frente-frio-corte', 'frente-calido-corte', 'niebla-adveccion', 'niebla-radiacion'] }, ejemplo: { tipo: 'meteo', sistema: 'borrasca' } },
  barco: { params: { resaltar: ['proa', 'popa', 'babor', 'estribor', 'crujia', 'eslora', 'manga', 'puntal', 'calado', 'obra-viva', 'obra-muerta', 'francobordo', 'amura', 'aleta', 'traves', 'linea-flotacion'] }, ejemplo: { tipo: 'barco', resaltar: ['manga'] } },
  helice: { params: { sentido: ['dextrogira', 'levogira'], marcha: ['avante', 'atras'] }, ejemplo: { tipo: 'helice', sentido: 'dextrogira', marcha: 'atras' } },
  rosa: { params: { rumbo: '0-359', demora: '0-359 opcional', marcacion: 'bool', etiqueta: 'nombre del objeto' }, ejemplo: { tipo: 'rosa', rumbo: 45, demora: 120, marcacion: true, etiqueta: 'faro' } },
  bandera: { params: { codigo: ['A', 'buceo', 'O', 'N', 'C', 'B', 'H', 'U', 'V', 'W'] }, ejemplo: { tipo: 'bandera', codigo: 'A' } },
  nortes: { params: { dm: 'declinación en grados (E +, W −)', desvio: 'desvío en grados (+/−)' }, ejemplo: { tipo: 'nortes', dm: -4, desvio: 2 } },
  enfilacion: { params: { dv: 'demora verdadera de la enfilación', da: 'demora de aguja observada' }, ejemplo: { tipo: 'enfilacion', dv: 40, da: 44 } },
  corriente: { params: { caso: ['efectivo', 'rumbo-a-dar'] }, ejemplo: { tipo: 'corriente', caso: 'efectivo' } },
  abatimiento: { params: { banda: ['babor', 'estribor'] }, ejemplo: { tipo: 'abatimiento', banda: 'babor' } },
  'viento-aparente': { params: {}, ejemplo: { tipo: 'viento-aparente' } },
  loxodromica: { params: {}, ejemplo: { tipo: 'loxodromica' } },
  marea: { params: { modo: ['curva', 'duodecimos', 'sonda'] }, ejemplo: { tipo: 'marea', modo: 'sonda' } },
  'sectores-luces': { params: { luz: ['todas', 'tope', 'costados', 'alcance'] }, ejemplo: { tipo: 'sectores-luces' } },
  canal: { params: { sentido: ['entrando', 'saliendo'] }, ejemplo: { tipo: 'canal', sentido: 'entrando' } },
  dst: { params: {}, ejemplo: { tipo: 'dst' } },
  jerarquia: { params: {}, ejemplo: { tipo: 'jerarquia' } },
  estabilidad: { params: { caso: ['estable', 'inestable'] }, ejemplo: { tipo: 'estabilidad', caso: 'estable' } },
  movimiento: { params: { mov: ['balance', 'cabezada', 'guinada'] }, ejemplo: { tipo: 'movimiento', mov: 'balance' } },
  amarras: { params: { resaltar: ['largo-proa', 'esprin-proa', 'traves', 'esprin-popa', 'largo-popa'] }, ejemplo: { tipo: 'amarras' } },
  busqueda: { params: { patron: ['cuadrado', 'sectores'] }, ejemplo: { tipo: 'busqueda', patron: 'cuadrado' } },
  'hombre-al-agua': { params: { maniobra: ['boutakow', 'anderson'] }, ejemplo: { tipo: 'hombre-al-agua', maniobra: 'boutakow' } },
  fuego: { params: { vista: ['tetraedro', 'clases'] }, ejemplo: { tipo: 'fuego', vista: 'tetraedro' } },
  socorro: { params: { resaltar: Object.keys(SOCORRO), solo: 'bool: dibuja solo la resaltada, en grande' }, ejemplo: { tipo: 'socorro', resaltar: 'cohete-paracaidas' } },
};

/** Comprueba que una especificación es dibujable. */
export function validSpec(spec) {
  if (!spec || !RENDERERS[spec.tipo]) return false;
  try { return !!RENDERERS[spec.tipo](spec); } catch { return false; }
}

/** @returns {{ svg: string, caption: string, sound?: string } | null} */
export function renderIllustration(spec) {
  const fn = RENDERERS[spec?.tipo];
  if (!fn) return null;
  try { return fn(spec); } catch (e) { console.error('Ilustración', spec, e); return null; }
}
