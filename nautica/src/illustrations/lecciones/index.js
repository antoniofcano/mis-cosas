// Láminas hechas para lecciones que no tenían ninguna. Cada grupo exporta LAMINAS = { tipo: { fn, params, ejemplo } }.

import { LAMINAS as propias } from './propias.js';
import { LAMINAS as costa } from './costa.js';

export const LAMINAS_LECCIONES = { ...propias, ...costa };
