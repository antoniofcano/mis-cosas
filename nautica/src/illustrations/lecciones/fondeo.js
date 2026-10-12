// Láminas de fondeo, nudos, atraque y remolque (lecciones per-1-6, per-2-2, per-2-5, per-2-6, per-3-8 y per-7-7). Todas
// en estilo C: fondeo y remolque en per-cola-c.js; nudos y atraque en per-final-c.js. Funciones puras spec → { svg, caption }.

import { fondeoC, remolqueC, PARTES_ANCLA, PARTES_LINEA, VOCES } from '../per-cola-c.js';
import { nudosC, atraqueC, NUDOS_PER } from '../per-final-c.js';

export const LAMINAS = {
  fondeo: {
    fn: fondeoC,
    params: { vista: ['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'], resaltar: `una parte o lista; ancla: ${PARTES_ANCLA.join(', ')}; linea: ${PARTES_LINEA.join(', ')}; orinque: orinque, boyarin, cruz; voces: ${VOCES.join(', ')}` },
    ejemplo: { tipo: 'fondeo', vista: 'ancla' },
  },
  nudos: {
    fn: nudosC,
    params: { nudo: NUDOS_PER },
    ejemplo: { tipo: 'nudos' },
  },
  atraque: {
    fn: atraqueC,
    params: { modo: ['costado', 'punta', 'abarloado', 'boya'], helice: ['dextrogira', 'levogira'], viento: ['costado'] },
    ejemplo: { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  },
  remolque: {
    fn: remolqueC,
    params: { vista: ['largo', 'abarloado', 'naufrago'] },
    ejemplo: { tipo: 'remolque', vista: 'largo' },
  },
};

/** Todas las variantes que conviene comprobar (las usa el test y la página de revisión). */
export const VARIANTES = [
  ...['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'].map((vista) => ({ tipo: 'fondeo', vista })),
  { tipo: 'fondeo', vista: 'ancla', resaltar: ['unas', 'danforth', 'cepo'] },
  { tipo: 'fondeo', vista: 'linea', resaltar: 'barboten' },
  { tipo: 'fondeo', vista: 'orinque', resaltar: 'cruz' },
  { tipo: 'fondeo', vista: 'voces', resaltar: 'pique' },
  { tipo: 'nudos' },
  ...NUDOS_PER.map((nudo) => ({ tipo: 'nudos', nudo })),
  { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  { tipo: 'atraque', modo: 'costado', helice: 'levogira' },
  { tipo: 'atraque', modo: 'punta' },
  { tipo: 'atraque', modo: 'punta', viento: 'costado' },
  { tipo: 'atraque', modo: 'abarloado' },
  { tipo: 'atraque', modo: 'boya' },
  ...['largo', 'abarloado', 'naufrago'].map((vista) => ({ tipo: 'remolque', vista })),
];
