// Segundas láminas del PER: qué hace crecer la mar y mar de viento frente a mar de fondo (per-9-6), cómo se actualiza
// la declinación de la carta (per-10-5), rumbo circular y cuadrantal (per-10-6), demora frente a marcación (per-11-5) y
// la calidad de la situación según el ángulo de corte (per-11-6). Todas en estilo C: la mar en per-final-b-c.js, las
// demás en per-cola-calculo-c.js. Funciones puras spec → { svg, caption }.

import { declinacionC, rumboCuadrantalC, demoraMarcacionC, calidadCorteC, cuadrantalACircular } from '../per-cola-calculo-c.js';
import { marCreceC, PARTES_MAR } from '../per-final-b-c.js';

export { cuadrantalACircular };

export const LAMINAS = {
  'mar-crece': {
    fn: marCreceC,
    params: { vista: ['factores', 'viento-fondo'], resaltar: PARTES_MAR },
    ejemplo: { tipo: 'mar-crece', vista: 'factores' },
  },
  'declinacion-anual': {
    fn: declinacionC,
    params: { dm: 'declinación de la carta en minutos con signo (E +, W −; por defecto −150 = 2° 30′ W)', anio: 'año de la carta (por defecto 2016)', variacion: 'variación anual en minutos con signo (por defecto +9 = 9′ E)', actual: 'año en que navegas (por defecto 2026)' },
    ejemplo: { tipo: 'declinacion-anual', dm: -150, anio: 2016, variacion: 9, actual: 2026 },
  },
  'rumbo-cuadrantal': {
    fn: rumboCuadrantalC,
    params: { rumbo: ['N20E', 'S65E', 'S45W', 'N64W'] },
    ejemplo: { tipo: 'rumbo-cuadrantal', rumbo: 'N64W' },
  },
  'demora-marcacion': {
    fn: demoraMarcacionC,
    params: { rumbo: 'rumbo verdadero 0–359 (por defecto 70)', marcacion: 'marcación −180..180, estribor +, babor − (por defecto −100)', resaltar: ['demora', 'marcacion'] },
    ejemplo: { tipo: 'demora-marcacion', rumbo: 70, marcacion: -100 },
  },
  'calidad-corte': {
    fn: calidadCorteC,
    params: { angulo: 'ángulo de corte del caso malo, 10–45 (por defecto 20)', resaltar: ['buena', 'mala'] },
    ejemplo: { tipo: 'calidad-corte' },
  },
};
