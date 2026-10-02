// Motor de análisis: tipos de magnitud que puede tener una respuesta.
// Cada tipo sabe leer la entrada del usuario, formatear un valor y medir el error frente a la solución.
// Añadir un tipo de magnitud nuevo = añadir una entrada aquí.

import { angleDist, norm360 } from '../math/angles.js';
import {
  parseAngle, parseNumber, parseDuration, parseClock,
  fmtBearing, fmtSigned, fmtLat, fmtLon, fmtMiles, fmtKnots, fmtDuration, fmtClock,
} from '../math/format.js';

export const QUANTITIES = {
  bearing: {
    label: 'rumbo/demora (°)',
    placeholder: 'p.ej. 045',
    parse: (t) => { const v = parseAngle(t); return Number.isNaN(v) ? NaN : norm360(v); },
    format: (v) => fmtBearing(v),
    error: (a, b) => angleDist(a, b),
    errorUnit: '°',
    tolerance: 1,
  },
  signed: {
    label: 'ángulo con signo (E +, W −)',
    placeholder: "p.ej. 3 W, -3, 2,5 E",
    parse: (t) => parseAngle(t),
    format: (v) => fmtSigned(v),
    error: (a, b) => Math.abs(a - b),
    errorUnit: '°',
    tolerance: 0.5,
  },
  lat: {
    label: 'latitud',
    placeholder: "p.ej. 36 00,5 N",
    parse: (t) => parseAngle(t),
    format: (v) => fmtLat(v),
    error: (a, b) => Math.abs(a - b) * 60,
    errorUnit: "'",
    tolerance: 1,
  },
  lon: {
    label: 'longitud',
    placeholder: "p.ej. 5 36,5 W",
    parse: (t) => { const v = parseAngle(t); return Number.isNaN(v) ? NaN : (/[EW]/i.test(t) ? v : -Math.abs(v)); },
    format: (v) => fmtLon(v),
    error: (a, b) => Math.abs(a - b) * 60,
    errorUnit: "'",
    tolerance: 1,
  },
  distance: {
    label: 'millas',
    placeholder: 'p.ej. 7,5',
    parse: parseNumber,
    format: (v) => fmtMiles(v),
    error: (a, b) => Math.abs(a - b),
    errorUnit: ' M',
    tolerance: 0.3,
  },
  speed: {
    label: 'nudos',
    placeholder: 'p.ej. 6,2',
    parse: parseNumber,
    format: (v) => fmtKnots(v),
    error: (a, b) => Math.abs(a - b),
    errorUnit: ' kn',
    tolerance: 0.3,
  },
  meters: {
    label: 'metros',
    placeholder: 'p.ej. 2,35',
    parse: (t) => parseNumber(String(t).replace(/\s*m(etros)?$/i, '')),
    format: (v) => `${v.toFixed(2).replace('.', ',')} m`,
    error: (a, b) => Math.abs(a - b),
    errorUnit: ' m',
    tolerance: 0.1,
  },
  duration: {
    label: 'duración',
    placeholder: 'p.ej. 1h25 o 85 min',
    parse: parseDuration,
    format: (v) => fmtDuration(v),
    error: (a, b) => Math.abs(a - b) * 60,
    errorUnit: ' min',
    tolerance: 3,
  },
  clock: {
    label: 'hora (hh:mm)',
    placeholder: 'p.ej. 14:35',
    parse: parseClock,
    format: (v) => fmtClock(v),
    error: (a, b) => { const d = Math.abs(a - b) % 1440; return Math.min(d, 1440 - d); },
    errorUnit: ' min',
    tolerance: 3,
  },
};

export function quantity(kind) {
  const q = QUANTITIES[kind];
  if (!q) throw new Error(`Magnitud desconocida: ${kind}`);
  return q;
}

/** Nota sobre la longitud: si el usuario no pone E/W se asume W (toda la carta L105 está al W de Greenwich). */
