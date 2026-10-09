// Láminas de «la Tierra y la carta»: coordenadas (esfera, latitud, longitud, meridiano del lugar, diferencias),
// la milla en la escala de latitudes, sondas y veriles con su corte del fondo, y los husos horarios.
// Funciones puras spec → { svg, caption }. Colores con las variables --l-* para que se lean en claro y en oscuro.

import { fx } from '../kit.js';
import { coordenadasC, COORD_PARTES } from '../coordenadas-c.js';
import { husosC } from '../py-cola-c.js';
import { millaC, verilesC, VERILES_PARTES } from '../per-cola-carta-c.js';

const line = (x1, y1, x2, y2, c, w = 1.5, extra = '') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${c}" stroke-width="${w}" ${extra}/>`;

// ---------------------------------------------------------------------------
// Coordenadas (esfera, latitud, longitud, meridiano del lugar y diferencias): en estilo C, en
// src/illustrations/coordenadas-c.js.

// ---------------------------------------------------------------------------
// La milla en la carta. spec: { tipo:'milla', vista:'carta'|'minuto'|'definicion' }

// ---------------------------------------------------------------------------
// Sondas y veriles con su corte. spec: { tipo:'veriles', vista:'carta'|'fondos', resaltar? }

// ---------------------------------------------------------------------------
// Husos horarios (husos, cálculo y hora oficial): en estilo C, en src/illustrations/py-cola-c.js.

// ---------------------------------------------------------------------------

export const LAMINAS = {
  coordenadas: {
    fn: coordenadasC,
    params: { vista: ['esfera', 'latitud', 'longitud', 'lugar', 'diferencias'], resaltar: COORD_PARTES, lat: 'latitud de P en grados, N + (latitud; por defecto 40)', lon: 'longitud de P en grados, E + / W − (latitud, longitud y lugar; por defecto −50, en lugar −40)' },
    ejemplo: { tipo: 'coordenadas', vista: 'latitud', lat: 40, lon: -50 },
  },
  milla: {
    fn: millaC,
    params: { vista: ['carta', 'minuto', 'definicion'] },
    ejemplo: { tipo: 'milla', vista: 'carta' },
  },
  veriles: {
    fn: verilesC,
    params: { vista: ['carta', 'fondos'], resaltar: VERILES_PARTES },
    ejemplo: { tipo: 'veriles', vista: 'carta' },
  },
  husos: {
    fn: husosC,
    params: { vista: ['husos', 'calculo', 'oficial'], ejemplo: ['e', 'w'], lon: 'opcional, longitud en grados (E +, W −)', tu: 'opcional, "HH:MM"' },
    ejemplo: { tipo: 'husos', vista: 'calculo', ejemplo: 'e' },
  },
};
