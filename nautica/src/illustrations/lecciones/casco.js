// Láminas del casco y la maniobra básica (PER, UT 1 y UT 7): cubierta (per-1-2), estructura del casco (per-1-3 y vías
// de agua de per-8-5), timón (per-1-4) y cabos (per-7-1). Todas en estilo C: cubierta y timón en per-final-c.js,
// estructura y cabos en per-cola-c.js. Funciones puras spec → { svg, caption }.

import { estructuraC, caboC, ESTRUCTURA, CABO } from '../per-cola-c.js';
import { cubiertaC, timonC, PARTES_CUBIERTA, PARTES_TIMON, TIPOS_TIMON } from '../per-final-c.js';

export const LAMINAS = {
  cubierta: {
    fn: cubiertaC,
    params: { resaltar: PARTES_CUBIERTA },
    ejemplo: { tipo: 'cubierta', resaltar: ['lumbrera', 'manguerote'] },
  },
  estructura: {
    fn: estructuraC,
    params: { vista: ['partes', 'vias-agua'], resaltar: ESTRUCTURA },
    ejemplo: { tipo: 'estructura', resaltar: ['quilla', 'roda', 'codaste'] },
  },
  timon: {
    fn: timonC,
    params: { vista: ['partes', 'cana', 'tipos'], resaltar: [...PARTES_TIMON, ...TIPOS_TIMON], cana: ['babor', 'estribor'] },
    ejemplo: { tipo: 'timon', vista: 'cana', cana: 'babor' },
  },
  cabo: {
    fn: caboC,
    params: { vista: ['partes', 'cornamusa', 'por-seno', 'encapillar'], resaltar: CABO },
    ejemplo: { tipo: 'cabo', vista: 'partes' },
  },
};
