// Láminas propias para lecciones del PER: per-2-3 (tenedero), per-2-4 (fondeo-gira), per-3-3 (capear-correr), per-6-1
// (ripa-definiciones) y per-8-4 (varada-abordaje). Todas en estilo C: capear y definiciones en per-cola-c.js; tenedero y
// fondeo a la gira en per-final-c.js; varada y abordaje en per-final-b-c.js.

import { capearCorrerC, ripaDefinicionesC, PARTES_CAPEAR, PARTES_RIPA } from '../per-cola-c.js';
import { tenederoC, fondeoGiraC, FACTORES_TENEDERO, FONDOS_TENEDERO, PASOS_FONDEO } from '../per-final-c.js';
import { varadaAbordajeC, PARTES_VARADA } from '../per-final-b-c.js';

export const LAMINAS = {
  tenedero: {
    fn: tenederoC,
    params: { vista: ['elegir', 'fondos'], resaltar: [...FACTORES_TENEDERO, ...FONDOS_TENEDERO] },
    ejemplo: { tipo: 'tenedero', vista: 'elegir' },
  },
  'fondeo-gira': {
    fn: fondeoGiraC,
    params: { vista: ['maniobra', 'cadena'], resaltar: PASOS_FONDEO },
    ejemplo: { tipo: 'fondeo-gira', vista: 'maniobra' },
  },
  'capear-correr': {
    fn: capearCorrerC,
    params: { vista: ['rumbos', 'costa'], resaltar: PARTES_CAPEAR },
    ejemplo: { tipo: 'capear-correr', vista: 'rumbos' },
  },
  'ripa-definiciones': {
    fn: ripaDefinicionesC,
    params: { vista: ['vela-motor', 'categorias'], resaltar: PARTES_RIPA },
    ejemplo: { tipo: 'ripa-definiciones', vista: 'vela-motor' },
  },
  'varada-abordaje': {
    fn: varadaAbordajeC,
    params: { vista: ['varada', 'abordaje'], resaltar: PARTES_VARADA },
    ejemplo: { tipo: 'varada-abordaje', vista: 'varada' },
  },
};
