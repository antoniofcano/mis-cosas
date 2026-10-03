// Láminas hechas para lecciones que no tenían ninguna. Cada grupo exporta LAMINAS = { tipo: { fn, params, ejemplo } }.

import { LAMINAS as propias } from './propias.js';
import { LAMINAS as costa } from './costa.js';
import { LAMINAS as tierra } from './tierra.js';
import { LAMINAS as seguridad } from './seguridad.js';
import { LAMINAS as carta } from './carta.js';
import { LAMINAS as mar } from './mar.js';
import { LAMINAS as casco } from './casco.js';
import { LAMINAS as fondeo } from './fondeo.js';
import { LAMINAS as normativa } from './normativa.js';
import { LAMINAS as sanidad } from './sanidad.js';
import { LAMINAS as publicaciones } from './publicaciones.js';
import { LAMINAS as pyNavegacion } from './py-navegacion.js';
import { LAMINAS as pySegundaA } from './py-segunda-a.js';
import { LAMINAS as pySegundaB } from './py-segunda-b.js';
import { LAMINAS as perPropias } from './per-propias.js';

export const LAMINAS_LECCIONES = { ...propias, ...costa, ...tierra, ...seguridad, ...carta, ...mar, ...casco, ...fondeo, ...normativa, ...sanidad, ...publicaciones, ...pyNavegacion, ...pySegundaA, ...pySegundaB, ...perPropias };
