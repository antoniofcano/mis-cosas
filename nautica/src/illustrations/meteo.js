// Escalas Beaufort (fuerza del viento) y Douglas (estado de la mar), en estilo C (docs/ESTILO-LAMINAS.md): una lámina
// por escala, para que se lean a 360 px (una idea por lámina).
//   { tipo:'beaufort', fuerza?: 0..12 }                    Beaufort, con esa fuerza resaltada
//   { tipo:'beaufort', escala:'douglas', grado?: 0..9 }    Douglas, con ese grado resaltado
// Valores: escala Beaufort de la OMM en nudos y escala de estado de la mar de la OMM (Douglas), con los nombres
// españoles de AEMET. Solo colores T.* (--lc-*).

import { T, TXT, lienzo, rotulo, f1 } from './estilo-c.js';

export const BEAUFORT = [
  ['Calma', '< 1'], ['Ventolina', '1–3'], ['Flojito', '4–6'], ['Flojo', '7–10'], ['Bonancible', '11–16'], ['Fresquito', '17–21'], ['Fresco', '22–27'],
  ['Frescachón', '28–33'], ['Temporal', '34–40'], ['Temporal fuerte', '41–47'], ['Temporal duro', '48–55'], ['Temporal muy duro', '56–63'], ['Temporal huracanado', '≥ 64'],
];
export const DOUGLAS = [
  ['Calma (llana)', '0'], ['Rizada', '0–0,1'], ['Marejadilla', '0,1–0,5'], ['Marejada', '0,5–1,25'], ['Fuerte marejada', '1,25–2,5'],
  ['Gruesa', '2,5–4'], ['Muy gruesa', '4–6'], ['Arbolada', '6–9'], ['Montañosa', '9–14'], ['Enorme', '> 14'],
];

const W = 358;
/** Límite superior de cada fuerza, en nudos (la 12, sin límite: se dibuja hasta el borde). */
const TOPE_KN = [1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63, 70];

function tablaBeaufort(f) {
  const fila = 26;
  const y0 = 44;
  const H = y0 + 13 * fila + 34;
  const alt = `Escala Beaufort, de la fuerza 0 a la 12: ${BEAUFORT.map(([n, kn], i) => `${i}, ${n.toLowerCase()}, ${kn} nudos`).join('; ')}. Cada fila lleva una barra que crece con la velocidad; una línea marca los 34 nudos, donde empieza el temporal.${f != null ? ` Resaltada la fuerza ${f}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const xb = 248;
  const wb = 96;
  const kx = (kn) => xb + (Math.min(kn, 70) / 70) * wb;
  out.push(rotulo(16, 30, 'FUERZA Y NOMBRE', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado, espacio: 0.8 }));
  out.push(rotulo(238, 30, 'NUDOS', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'end', color: T.apagado }));
  BEAUFORT.forEach(([n, kn], i) => {
    const y = y0 + i * fila;
    const on = f === i;
    const dim = f != null && !on ? ' opacity=".5"' : '';
    if (i % 2 === 0 || on) out.push(`<rect x="10" y="${y}" width="${W - 20}" height="${fila}" fill="${on ? T.papel : T.agua2}" ${on ? `stroke="${T.magenta}" stroke-width="1.6"` : 'opacity=".55"'}/>`);
    const color = on ? T.magenta : i >= 8 ? T.rojoTxt : T.tinta;
    out.push(`<g data-parte="f${i}"${dim}>`,
      rotulo(30, y + 18, String(i), { size: 15, weight: 700, estilo: 'mono', color }),
      rotulo(60, y + 18, n, { size: 14, weight: on || i === 8 ? 700 : 400, estilo: 'serif', anchor: 'start', color }),
      rotulo(238, y + 18, kn, { size: TXT.rotulo + 0.5, estilo: 'mono', anchor: 'end', color }),
      `<rect x="${xb}" y="${y + 8}" width="${f1(kx(TOPE_KN[i]) - xb)}" height="10" fill="${on ? T.magenta : i >= 8 ? T.rojo : T.lineaAgua}"/>`, '</g>');
  });
  // los 34 nudos: desde ahí, temporal
  const x34 = kx(34);
  out.push(`<line x1="${f1(x34)}" y1="${y0 - 4}" x2="${f1(x34)}" y2="${y0 + 13 * fila + 4}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="4 3"/>`);
  out.push(rotulo(x34, y0 + 13 * fila + 22, '34 kn: temporal', { size: TXT.min, estilo: 'serif', italic: true, color: T.rojoTxt, weight: 700 }));
  out.push(rotulo(16, H - 12, 'velocidad del viento en nudos', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: f == null
      ? 'Beaufort mide la fuerza del viento, del 0 (calma) al 12 (temporal huracanado), cada fuerza con su intervalo de velocidad en nudos. Desde la fuerza 8 (34 nudos) es temporal.'
      : `Fuerza ${f} Beaufort: ${BEAUFORT[f][0].toLowerCase()}, ${BEAUFORT[f][1]} nudos.`,
  };
}

function tablaDouglas(g) {
  const fila = 32;
  const y0 = 44;
  const H = y0 + 10 * fila + 30;
  const alt = `Escala Douglas del estado de la mar, del grado 0 al 9: ${DOUGLAS.map(([n, m], i) => `${i}, ${n.toLowerCase()}, olas de ${m} metros`).join('; ')}. En cada fila, una ola dibujada que crece con el grado.${g != null ? ` Resaltado el grado ${g}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(rotulo(16, 30, 'GRADO Y MAR', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.apagado, espacio: 0.8 }));
  out.push(rotulo(244, 30, 'OLAS (m)', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'end', color: T.apagado, espacio: 0.6 }));
  DOUGLAS.forEach(([n, m], i) => {
    const y = y0 + i * fila;
    const on = g === i;
    const dim = g != null && !on ? ' opacity=".5"' : '';
    if (i % 2 === 0 || on) out.push(`<rect x="10" y="${y}" width="${W - 20}" height="${fila}" fill="${on ? T.papel : T.agua2}" ${on ? `stroke="${T.magenta}" stroke-width="1.6"` : 'opacity=".55"'}/>`);
    const color = on ? T.magenta : T.tinta;
    // la ola: amplitud que crece con el grado (dibujo de referencia, no a escala)
    const a = i === 0 ? 0 : Math.min(12, 1 + i * 1.35);
    const ym = y + fila / 2 + 2;
    const xo = 254;
    const ola = i === 0 ? `M${xo},${ym} h88` : `M${xo},${ym} q11,${f1(-2 * a)} 22,0 t22,0 t22,0 t22,0`;
    out.push(`<g data-parte="g${i}"${dim}>`,
      rotulo(30, y + 21, String(i), { size: 15, weight: 700, estilo: 'mono', color }),
      rotulo(60, y + 21, n, { size: 14, weight: on ? 700 : 400, estilo: 'serif', anchor: 'start', color }),
      rotulo(244, y + 21, m, { size: TXT.rotulo + 0.5, estilo: 'mono', anchor: 'end', color }),
      `<path d="${ola}" fill="none" stroke="${on ? T.magenta : T.azulTxt}" stroke-width="1.6" stroke-linejoin="round"/>`, '</g>');
  });
  out.push(rotulo(16, H - 12, 'altura de las olas en metros', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  out.push(cierra());
  return {
    svg: out.join(''),
    caption: g == null
      ? 'Douglas clasifica el estado de la mar por la altura de las olas, del 0 (calma o llana) al 9 (enorme). No hay equivalencia exacta con Beaufort: la mar depende de la fuerza del viento, de cuánto tiempo sopla y del fetch.'
      : `Grado ${g} Douglas: ${DOUGLAS[g][0].toLowerCase()}, olas de ${DOUGLAS[g][1]} m.`,
  };
}

export function beaufortIllustration(spec) {
  const escala = spec.escala ?? 'beaufort';
  if (escala === 'douglas') {
    const g = spec.grado == null ? null : Number(spec.grado);
    if (g != null && !(Number.isInteger(g) && g >= 0 && g <= 9)) return null;
    return tablaDouglas(g);
  }
  if (escala !== 'beaufort') return null;
  const f = spec.fuerza == null ? null : Number(spec.fuerza);
  if (f != null && !(Number.isInteger(f) && f >= 0 && f <= 12)) return null;
  return tablaBeaufort(f);
}
