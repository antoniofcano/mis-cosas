// Láminas hechas para lecciones que no tenían ninguna. Cada grupo exporta LAMINAS = { tipo: { fn, params, ejemplo } }.

import { LAMINAS as propias } from './propias.js';
import { LAMINAS as costa } from './costa.js';
import { LAMINAS as tierra } from './tierra.js';
import { LAMINAS as seguridad } from './seguridad.js';
import { LAMINAS as carta } from './carta.js';
import { LAMINAS as mar } from './mar.js';
import { LAMINAS as casco } from './casco.js';
import { LAMINAS as fondeo } from './fondeo.js';

export const LAMINAS_LECCIONES = { ...propias, ...costa, ...tierra, ...seguridad, ...carta, ...mar, ...casco, ...fondeo };
