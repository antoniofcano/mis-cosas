// Segundas láminas del PER: amarrado a una boya con las partes del cabo (per-2-1), el reflector radar y la tormenta
// eléctrica (per-3-4), lo que exige cada zona en chalecos, aros y balsas (per-3-5), el tanque de retención y su vaciado
// (per-4-4) y las basuras a un lado y otro del estrecho (per-4-5). Todas en estilo C: las dos primeras en
// per-final-c.js y per-final-b-c.js; las demás en per-cola-normativa-c.js. Funciones puras spec → { svg, caption }.

import { dotacionZonasC, tanqueRetencionC, marpolBasurasC, EQUIPOS, PARTES_TQ } from '../per-cola-normativa-c.js';
import { muertoBoyaC, PARTES_MB } from '../per-final-c.js';
import { reflectorTormentaC } from '../per-final-b-c.js';

export const LAMINAS = {
  'muerto-boya': {
    fn: muertoBoyaC,
    params: { resaltar: PARTES_MB },
    ejemplo: { tipo: 'muerto-boya' },
  },
  'reflector-tormenta': {
    fn: reflectorTormentaC,
    params: { vista: ['reflector', 'tormenta'] },
    ejemplo: { tipo: 'reflector-tormenta', vista: 'reflector' },
  },
  'dotacion-zonas': {
    fn: dotacionZonasC,
    params: { resaltar: EQUIPOS, zona: [1, 2, 3, 4, 5, 6, 7] },
    ejemplo: { tipo: 'dotacion-zonas' },
  },
  'tanque-retencion': {
    fn: tanqueRetencionC,
    params: { vista: ['puerto', 'mar'], resaltar: `una parte o lista, solo en la vista puerto: ${PARTES_TQ.join(', ')}` },
    ejemplo: { tipo: 'tanque-retencion', vista: 'puerto' },
  },
  'marpol-basuras': {
    fn: marpolBasurasC,
    params: { zona: ['atlantico', 'mediterraneo'] },
    ejemplo: { tipo: 'marpol-basuras' },
  },
};
