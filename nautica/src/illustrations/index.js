// Motor de ilustraciones de teoría: { tipo, ...parámetros } → { svg, caption, sound? }.
// Dibujos SVG generados al vuelo: ligeros y nítidos. Las láminas animadas (src/illustrations/animaciones/) dan aquí su
// fotograma fijo; el reproductor (src/ui/animacion.js) las mueve. Algunas láminas antiguas aún se animan con SMIL.
// Para añadir una ilustración nueva: crea su función y regístrala en RENDERERS y en CATALOGO.

import { buoyIllustration, cardinalClock, BUOYS } from './buoys.js';
import { shipIllustration, SHIPS } from './ships.js';
import { crossingIllustration, riesgoIllustration, SENALES } from './situations.js';
import { meteoIllustration } from './misc.js';
import { banderaIllustration, sonidoIllustration } from './senales-c.js';
import { boatIllustration } from './laminas-c.js';
import { parseRhythm, rhythmTimeline, blinkingLight } from './lights.js';
import { beaufortIllustration } from './meteo.js';
import { mareaIllustration, dstIllustration } from './navigation.js';
import { vientoAparenteIllustration } from './meteo-c.js';
import { enfilacionIllustration, demorasIllustration, loxodromicaIllustration } from './carta-c.js';
import { socorroIllustration, SOCORRO, HOJAS_SOCORRO } from './socorro.js';
import { bifurcacionIllustration, regionesIllustration, canalIllustration } from './balizamiento.js';
import { ciabogaIllustration } from './maniobra.js';
import { dibujoAnimado } from './animaciones/index.js';
import { INTERACTIVAS, interactivaDe, dibujoFijo } from './interactivas.js';
import { LAMINAS_LECCIONES } from './lecciones/index.js';
import { amarrasIllustration, jerarquiaIllustration } from './seamanship.js';
import { movimientoIllustration, busquedaIllustration, fuegoIllustration } from './seguridad-c.js';
import { RENDERERS_PER } from './per-renderers.js';

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
  sonido: sonidoIllustration,
  meteo: meteoIllustration,
  barco: boatIllustration,
  helice: dibujoAnimado,
  rosa: (s) => dibujoFijo(INTERACTIVAS.rosa, s),
  bandera: banderaIllustration,
  nortes: (s) => dibujoFijo(INTERACTIVAS.nortes, s),
  enfilacion: enfilacionIllustration,
  corriente: (s) => dibujoFijo(INTERACTIVAS.corriente, s),
  abatimiento: (s) => dibujoFijo(INTERACTIVAS.abatimiento, s),
  'viento-aparente': vientoAparenteIllustration,
  loxodromica: loxodromicaIllustration,
  marea: mareaIllustration,
  'sectores-luces': (s) => dibujoFijo(INTERACTIVAS['sectores-luces'], s),
  canal: canalIllustration,
  dst: dstIllustration,
  jerarquia: jerarquiaIllustration,
  estabilidad: (s) => dibujoFijo(INTERACTIVAS.estabilidad, s),
  movimiento: movimientoIllustration,
  amarras: amarrasIllustration,
  busqueda: busquedaIllustration,
  'hombre-al-agua': dibujoAnimado,
  fuego: fuegoIllustration,
  socorro: socorroIllustration,
  riesgo: riesgoIllustration,
  'helice-timon': (s) => dibujoFijo(INTERACTIVAS['helice-timon'], s),
  evolucion: dibujoAnimado,
  ciaboga: ciabogaIllustration,
  desatraque: (s) => dibujoFijo(INTERACTIVAS.desatraque, s),
  bifurcacion: bifurcacionIllustration,
  regiones: regionesIllustration,
  beaufort: beaufortIllustration,
  demoras: demorasIllustration,
  ...Object.fromEntries(Object.entries(LAMINAS_LECCIONES).map(([k, l]) => [k, l.fn])),
  // PER en estilo C (ritmos, buques, regiones, amarras, riesgo, jerarquía, DST y ciaboga): sustituyen a las antiguas
  ...RENDERERS_PER,
};

/** Catálogo documentado (lo usan los editores de contenido y la validación). */
export const CATALOGO = {
  boya: { params: { clase: Object.keys(BUOYS), ritmo: 'opcional, p.ej. "Fl(3) G 9s"', reloj: 'bool (cardinales: reloj completo)' }, ejemplo: { tipo: 'boya', clase: 'estribor' } },
  cardinales: { params: { resaltar: ['cardinal-n', 'cardinal-e', 'cardinal-s', 'cardinal-w'] }, ejemplo: { tipo: 'cardinales', resaltar: 'cardinal-s' } },
  ritmo: { params: { ritmo: 'característica: Fl, Fl(2) 5s, Q, VQ(3) 5s, Q(6)+LFl 15s, Iso 4s, Oc 6s, LFl 10s, Mo(A) 6s, Al.Bu/Y 3s', texto: 'opcional' }, ejemplo: { tipo: 'ritmo', ritmo: 'Fl(2) 5s' } },
  buque: { params: { clase: Object.keys(SHIPS), vista: ['proa', 'babor', 'estribor', 'popa', 'todas'], dia: 'bool: añade sus marcas de día', arrancada: 'bool (por defecto true)', obstruccion: ['estribor', 'babor'], aparejo: ['estribor', 'babor'] }, ejemplo: { tipo: 'buque', clase: 'pesquero-arrastre', vista: 'proa', dia: true } },
  cruce: { params: { situacion: ['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'], aspecto: 'opcional, 0–355 (motor)' }, ejemplo: { tipo: 'cruce', situacion: 'cruce' } },
  sonido: { params: { senal: Object.keys(SENALES), texto: 'opcional' }, ejemplo: { tipo: 'sonido', senal: '..' } },
  meteo: { params: { sistema: ['borrasca', 'anticiclon', 'buys-ballot', 'brisa-mar', 'brisa-tierra', 'frentes', 'isobaras', 'frente-frio-corte', 'frente-calido-corte', 'niebla-adveccion', 'niebla-radiacion', 'niebla-vapor'] }, ejemplo: { tipo: 'meteo', sistema: 'borrasca' } },
  barco: { params: { resaltar: ['proa', 'popa', 'babor', 'estribor', 'crujia', 'eslora', 'manga', 'puntal', 'calado', 'obra-viva', 'obra-muerta', 'francobordo', 'amura', 'aleta', 'traves', 'linea-flotacion'] }, ejemplo: { tipo: 'barco', resaltar: ['manga'] } },
  helice: { params: { sentido: ['dextrogira', 'levogira'], marcha: ['avante', 'atras'] }, ejemplo: { tipo: 'helice', sentido: 'dextrogira', marcha: 'atras' } },
  rosa: { params: { rumbo: '0-359', demora: '0-359 opcional', marcacion: 'bool', etiqueta: 'nombre del objeto' }, ejemplo: { tipo: 'rosa', rumbo: 45, demora: 120, marcacion: true, etiqueta: 'faro' } },
  bandera: { params: { codigo: ['A', 'buceo', 'O', 'N', 'C', 'B', 'H', 'U', 'V', 'W'] }, ejemplo: { tipo: 'bandera', codigo: 'A' } },
  nortes: { params: { dm: 'declinación en grados (E +, W −)', desvio: 'desvío en grados (+/−)' }, ejemplo: { tipo: 'nortes', dm: -4, desvio: 2 } },
  enfilacion: { params: { dv: 'demora verdadera de la enfilación', da: 'demora de aguja observada' }, ejemplo: { tipo: 'enfilacion', dv: 40, da: 44 } },
  corriente: { params: { caso: ['efectivo', 'rumbo-a-dar'], rumbo: 'efectivo: Rv (proa); rumbo-a-dar: rumbo efectivo al destino (por defecto 40 / 50)', rc: 'hacia dónde va la corriente, 0–359 (por defecto 120)', ic: 'intensidad de la corriente en nudos (por defecto 2,5)', ab: 'abatimiento con signo: + si el viento entra por babor, − por estribor (por defecto 0)', vb: 'velocidad del barco en nudos (por defecto 6)' }, ejemplo: { tipo: 'corriente', caso: 'efectivo' } },
  abatimiento: { params: { banda: ['babor', 'estribor'], ab: 'abatimiento en grados, 0–20 (se toma el valor absoluto; por defecto 10)', rv: 'rumbo verdadero 0–359 (por defecto 40)', vb: 'velocidad del barco en nudos (por defecto 6)' }, ejemplo: { tipo: 'abatimiento', banda: 'babor' } },
  'viento-aparente': { params: { rumbo: ['cenida', 'traves', 'aleta', 'popa'] }, ejemplo: { tipo: 'viento-aparente', rumbo: 'cenida' } },
  loxodromica: { params: {}, ejemplo: { tipo: 'loxodromica' } },
  marea: { params: { modo: ['curva', 'duodecimos', 'sonda', 'fases'] }, ejemplo: { tipo: 'marea', modo: 'sonda' } },
  'sectores-luces': { params: { aspecto: 'desde dónde se mira, 0–355 desde su proa (por defecto 60)', luz: ['todas'] }, ejemplo: { tipo: 'sectores-luces' } },
  canal: { params: { sentido: ['entrando', 'saliendo'] }, ejemplo: { tipo: 'canal', sentido: 'entrando' } },
  dst: { params: {}, ejemplo: { tipo: 'dst' } },
  jerarquia: { params: {}, ejemplo: { tipo: 'jerarquia' } },
  estabilidad: { params: { caso: ['estable', 'indiferente', 'inestable'] }, ejemplo: { tipo: 'estabilidad', caso: 'estable' } },
  movimiento: { params: { mov: ['balance', 'cabezada', 'guinada'] }, ejemplo: { tipo: 'movimiento', mov: 'balance' } },
  amarras: { params: { resaltar: ['largo-proa', 'esprin-proa', 'traves', 'esprin-popa', 'largo-popa'] }, ejemplo: { tipo: 'amarras' } },
  busqueda: { params: { patron: ['cuadrado', 'sectores'] }, ejemplo: { tipo: 'busqueda', patron: 'cuadrado' } },
  'hombre-al-agua': { params: { maniobra: ['boutakow', 'anderson', 'scharnow'] }, ejemplo: { tipo: 'hombre-al-agua', maniobra: 'boutakow' } },
  fuego: { params: { vista: ['tetraedro', 'clases'] }, ejemplo: { tipo: 'fuego', vista: 'tetraedro' } },
  socorro: { params: { hoja: Object.keys(HOJAS_SOCORRO), resaltar: Object.keys(SOCORRO), solo: 'bool: dibuja solo la resaltada, en grande' }, ejemplo: { tipo: 'socorro', resaltar: 'cohete-paracaidas' } },
  riesgo: { params: { caso: ['comparar', 'constante', 'variable'] }, ejemplo: { tipo: 'riesgo', caso: 'comparar' } },
  'helice-timon': { params: { marcha: ['avante', 'atras'], timon: ['er', 'br'], sentido: ['dextrogira', 'levogira'] }, ejemplo: { tipo: 'helice-timon', marcha: 'atras', timon: 'br', sentido: 'dextrogira' } },
  evolucion: { params: {}, ejemplo: { tipo: 'evolucion' } },
  ciaboga: { params: {}, ejemplo: { tipo: 'ciaboga' } },
  desatraque: { params: { abrir: ['popa', 'proa'] }, ejemplo: { tipo: 'desatraque', abrir: 'popa' } },
  bifurcacion: { params: { marca: ['canal-principal-estribor', 'canal-principal-babor'], ruta: ['principal', 'secundario'] }, ejemplo: { tipo: 'bifurcacion', marca: 'canal-principal-estribor', ruta: 'principal' } },
  regiones: { params: {}, ejemplo: { tipo: 'regiones' } },
  beaufort: { params: { escala: ['beaufort', 'douglas'], fuerza: '0–12 opcional (Beaufort: resalta esa fila)', grado: '0–9 opcional (Douglas: resalta esa fila)' }, ejemplo: { tipo: 'beaufort' } },
  demoras: { params: { d1: 'Dv al faro A (por defecto 330)', d2: 'Dv al faro B (por defecto 034)' }, ejemplo: { tipo: 'demoras', d1: 330, d2: 34 } },
  ...Object.fromEntries(Object.entries(LAMINAS_LECCIONES).map(([k, l]) => [k, { params: l.params, ejemplo: l.ejemplo }])),
};

/** Comprueba que una especificación es dibujable. */
export function validSpec(spec) {
  const fn = dibujoDe(spec);
  if (!fn) return false;
  try { return !!fn(spec); } catch { return false; }
}

/** Función que dibuja una spec: la de su lámina interactiva si la tiene (es el mismo dibujo en su estado inicial) o la fija. */
function dibujoDe(spec) {
  if (!spec || !RENDERERS[spec.tipo]) return null;
  const def = interactivaDe(spec);
  return def ? (s) => dibujoFijo(def, s) : RENDERERS[spec.tipo];
}

/** @returns {{ svg: string, caption: string, sound?: string } | null} */
export function renderIllustration(spec) {
  const fn = dibujoDe(spec);
  if (!fn) return null;
  try { return fn(spec); } catch (e) { console.error('Ilustración', spec, e); return null; }
}
