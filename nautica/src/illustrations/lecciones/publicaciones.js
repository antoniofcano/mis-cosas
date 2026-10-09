// Láminas de la carta del Estrecho (per-11-1: coordenadas en los márgenes, rumbos y demoras con el transportador,
// «desde el faro» y «al faro») y de las publicaciones náuticas (py-3-7: cómo se lleva cada Aviso a los Navegantes
// a la carta y los radioavisos). Funciones puras spec → { svg, caption }; admiten `resaltar` (una parte o lista).

import { fx } from '../kit.js';
import { cartaMargenesC, transportadorC, MARGENES_PARTES } from '../per-cola-carta-c.js';
import { avisosNavegantesC, AVISOS_PARTES, RADIO_PARTES } from '../py-cierre-c.js';

const faro = (p) => `<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="6.5" style="fill:var(--l-faro);stroke:currentColor" stroke-width="1.2"/><circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="1.8" fill="currentColor"/>`;

// ---------------------------------------------------------------------------
// Coordenadas en los márgenes de la carta. spec: { tipo:'carta-margenes', resaltar?: 'latitud'|'longitud'|'divisiones' }
// Punto de la lección: 36° 07,3′ N, 005° 58,6′ W. Cada minuto de la escala, en cinco partes de 0,2′.

// ---------------------------------------------------------------------------
// Transportador. spec: { tipo:'transportador', caso:'rumbo'|'faro', rv?: 0–359 (rumbo; por defecto 75), dv?: 0–359 (faro; por defecto 310) }

// ---------------------------------------------------------------------------
// Avisos a los Navegantes y radioavisos. spec: { tipo:'avisos-navegantes', vista:'correccion'|'radioavisos', resaltar? }

/** Lápiz (para anotar y borrar) o pluma (tinta), de unos 34 px, inclinado. */

// ---------------------------------------------------------------------------

export const LAMINAS = {
  'carta-margenes': {
    fn: cartaMargenesC,
    params: { resaltar: MARGENES_PARTES },
    ejemplo: { tipo: 'carta-margenes' },
  },
  transportador: {
    fn: transportadorC,
    params: { caso: ['rumbo', 'faro'], rv: 'rumbo: Rv a medir, 0–359 (por defecto 75)', dv: 'faro: demora del enunciado, 0–359 (por defecto 310)' },
    ejemplo: { tipo: 'transportador', caso: 'rumbo' },
  },
  'avisos-navegantes': {
    fn: avisosNavegantesC,
    params: { vista: ['correccion', 'radioavisos'], resaltar: [...AVISOS_PARTES, ...RADIO_PARTES] },
    ejemplo: { tipo: 'avisos-navegantes', vista: 'correccion' },
  },
};
