// Motor matemático: formato y lectura de magnitudes náuticas (estilo español: coma decimal).

import { norm360, round, toDegMin } from './angles.js';

const comma = (s) => String(s).replace('.', ',');
const pad = (n, w) => String(n).padStart(w, '0');

/** Rumbo/demora circular: "045°" o "045,5°". */
export function fmtBearing(deg, dec = 0) {
  const v = round(norm360(deg), dec);
  const v2 = v >= 360 ? 0 : v;
  const [i, f] = v2.toFixed(dec).split('.');
  return `${pad(i, 3)}${f ? ',' + f : ''}°`;
}

/** Ángulo con signo E/W (dm, Δ, Ct): "3° 10' W" o "+2,5°". */
export function fmtSigned(deg, { style = 'EW', dec = 0 } = {}) {
  if (style === 'EW') {
    const { sign, deg: d, min } = toDegMin(deg, dec);
    if (d === 0 && min === 0) return "0°";
    const m = min ? ` ${comma(min.toFixed(dec))}'` : '';
    return `${d}°${m} ${sign < 0 ? 'W' : 'E'}`;
  }
  const v = round(deg, dec);
  const d = Number.isInteger(v) ? 0 : dec;
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${comma(Math.abs(v).toFixed(d))}°`;
}

/** Ángulo con signo como "+3,5°" / "−2°" (estilo cálculo). */
export const fmtSignedNum = (deg, dec = 1) => fmtSigned(deg, { style: 'num', dec });

/** Latitud: "36° 00,1' N". */
export function fmtLat(lat, dec = 1) {
  const { sign, deg, min } = toDegMin(lat, dec);
  return `${pad(deg, 2)}° ${pad(comma(min.toFixed(dec)), dec ? 3 + dec : 2)}' ${sign < 0 ? 'S' : 'N'}`;
}

/** Longitud: "005° 36,5' W". */
export function fmtLon(lon, dec = 1) {
  const { sign, deg, min } = toDegMin(lon, dec);
  return `${pad(deg, 3)}° ${pad(comma(min.toFixed(dec)), dec ? 3 + dec : 2)}' ${sign < 0 ? 'W' : 'E'}`;
}

export const fmtPos = (p, dec = 1) => `${fmtLat(p.lat, dec)}  ${fmtLon(p.lon, dec)}`;

export const fmtMiles = (d, dec = 1) => `${comma(round(d, dec).toFixed(dec))} millas`;
export const fmtKnots = (v, dec = 1) => `${comma(round(v, dec).toFixed(dec))} nudos`;

/** Horas decimales → "1 h 25 min". */
export function fmtDuration(hours) {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Minutos desde 00:00 → "hh:mm" (admite valores > 24 h). */
export function fmtClock(minutes) {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60), 2)}:${pad(m % 60, 2)}`;
}

// ---------------------------------------------------------------------------
// Lectura de entradas del usuario (tolerante con formatos habituales).

const num = (s) => Number(String(s).replace(',', '.'));

/** Número simple ("12,5", "12.5"). Devuelve NaN si no es válido. */
export function parseNumber(text) {
  const t = String(text ?? '').trim().toLowerCase()
    .replace(/(millas|milla|nudos|nudo|nm|kn|kts|m|')$/u, '').replace(/\s+/g, '');
  if (!/^[+-−]?\d+([.,]\d+)?$/.test(t)) return NaN;
  return num(t.replace('−', '-'));
}

/**
 * Ángulo/coordenada: admite "36 05,2 N", "36°05.2'N", "36-05,2", "36.0867", "-5 36,5", "5°36,5'W", "3 W", "+2,5".
 * `hemis` indica letras válidas para signo negativo (p.ej. 'SW' → S y W negativos).
 */
export function parseAngle(text) {
  if (text == null) return NaN;
  let t = String(text).trim().toUpperCase().replace(/−/g, '-');
  if (!t) return NaN;
  let sign = 1;
  const hemi = t.match(/[NSEWO]\s*$/) || t.match(/^\s*[NSEWO]/);
  if (hemi) {
    const h = hemi[0].trim();
    if (h === 'S' || h === 'W' || h === 'O') sign = -1;
    t = t.replace(/[NSEWO]/g, ' ');
  }
  if (t.trim().startsWith('-')) { sign *= -1; t = t.replace('-', ' '); }
  t = t.replace('+', ' ');
  const parts = t.replace(/[°º'’´"]/g, ' ').replace(/(\d)-(\d)/g, '$1 $2').trim().split(/\s+/).filter(Boolean);
  if (!parts.length || parts.length > 3 || parts.some((p) => !/^\d+([.,]\d+)?$/.test(p))) return NaN;
  const [d, m = 0, s = 0] = parts.map(num);
  if (parts.length > 1 && (m >= 60 || s >= 60)) return NaN;
  return sign * (d + m / 60 + s / 3600);
}

/** Hora "hh:mm" o "hhmm" → minutos desde 00:00. */
export function parseClock(text) {
  const t = String(text ?? '').trim();
  const m = t.match(/^(\d{1,2})[:h.,]?(\d{2})$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return NaN;
  return h * 60 + mi;
}

/** Duración: "1:25", "1h25", "85 min", "1,5" (horas). Devuelve horas. */
export function parseDuration(text) {
  const t = String(text ?? '').trim().toLowerCase();
  let m = t.match(/^(\d+)\s*(?:h|:)\s*(\d{1,2})?\s*(?:min|m)?$/);
  if (m) return Number(m[1]) + Number(m[2] || 0) / 60;
  m = t.match(/^(\d+(?:[.,]\d+)?)\s*(?:min|m)$/);
  if (m) return num(m[1]) / 60;
  const n = parseNumber(t);
  return n;
}
