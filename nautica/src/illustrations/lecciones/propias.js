// Láminas de lección: rumbo directo (per-11-3), oposición y enfilación (per-11-7), humedad y punto de rocío (py-2-5)
// y AIS (py-3-10). Todas en estilo C: rumbo directo y oposición en per-cola-carta-c.js.

import { humedadC } from '../py-cola-meteo-c.js';
import { aisC } from '../electronica-c.js';
import { rumboDirectoC, oposicionC, OPOSICION_PARTES } from '../per-cola-carta-c.js';


/** py-2-5: humedad relativa y punto de rocío; en estilo C, en src/illustrations/py-cola-meteo-c.js. */
const humedad = humedadC;

/** py-3-10: lo que enseña el AIS y lo que no; en estilo C, en src/illustrations/electronica-c.js. */
const ais = aisC;

export const LAMINAS = {
  'rumbo-directo': { fn: rumboDirectoC, params: {}, ejemplo: { tipo: 'rumbo-directo' } },
  oposicion: { fn: oposicionC, params: { caso: ['oposicion', 'enfilacion'], resaltar: OPOSICION_PARTES }, ejemplo: { tipo: 'oposicion', caso: 'oposicion' } },
  humedad: { fn: humedad, params: { t: 'temperatura del aire (por defecto 20)', td: 'punto de rocío (por defecto 12)' }, ejemplo: { tipo: 'humedad' } },
  ais: { fn: ais, params: {}, ejemplo: { tipo: 'ais' } },
};
