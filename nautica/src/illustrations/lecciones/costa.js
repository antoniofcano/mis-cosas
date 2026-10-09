// Láminas de las lecciones de costa y medio ambiente del PER: zonas de navegación (per-3-5), playas y zonas
// de baño (per-4-2), vertidos de aguas sucias y basuras (per-4-4, per-4-5), banderas a bordo (per-4-7) y
// fondeo y posidonia (per-4-8). Desde la tanda de cierre, todas en estilo C (per-cola-normativa-c.js).

import { zonasC, playaC, vertidosC, posidoniaC, banderasABordoC } from '../per-cola-normativa-c.js';

export const LAMINAS = {
  zonas: { fn: zonasC, params: { resaltar: [1, 2, 3, 4, 5, 6, 7] }, ejemplo: { tipo: 'zonas' } },
  playa: { fn: playaC, params: { caso: ['balizada', 'no-balizada'] }, ejemplo: { tipo: 'playa', caso: 'balizada' } },
  vertidos: { fn: vertidosC, params: { tema: ['aguas-sucias', 'basuras'] }, ejemplo: { tipo: 'vertidos', tema: 'aguas-sucias' } },
  posidonia: { fn: posidoniaC, params: { vista: ['fondeo', 'planta'] }, ejemplo: { tipo: 'posidonia', vista: 'fondeo' } },
  'banderas-a-bordo': { fn: banderasABordoC, params: { resaltar: ['popa', 'pico', 'crucetas'] }, ejemplo: { tipo: 'banderas-a-bordo' } },
};
