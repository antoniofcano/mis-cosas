// Escalas Beaufort (fuerza del viento) y Douglas (estado de la mar), en tabla visual.
// spec: { tipo:'beaufort', fuerza?: 0..12 (resalta esa fila) }

import { open, title, lbl } from './kit.js';

export const BEAUFORT = [
  ['Calma', '< 1'], ['Ventolina', '1–3'], ['Flojito', '4–6'], ['Flojo', '7–10'], ['Bonancible', '11–16'], ['Fresquito', '17–21'], ['Fresco', '22–27'],
  ['Frescachón', '28–33'], ['Temporal', '34–40'], ['Temporal fuerte', '41–47'], ['Temporal duro', '48–55'], ['Temporal muy duro', '56–63'], ['Temporal huracanado', '≥ 64'],
];
export const DOUGLAS = [
  ['Calma (llana)', '0'], ['Rizada', '0–0,1'], ['Marejadilla', '0,1–0,5'], ['Marejada', '0,5–1,25'], ['Fuerte marejada', '1,25–2,5'],
  ['Gruesa', '2,5–4'], ['Muy gruesa', '4–6'], ['Arbolada', '6–9'], ['Montañosa', '9–14'], ['Enorme', '> 14'],
];

/** Color de la fila: de azul (calma) a rojo (temporal). */
const ramp = (i, n) => `hsl(${Math.round(205 - (205 * i) / (n - 1))} 70% 50%)`;

export function beaufortIllustration(spec) {
  const f = spec.fuerza == null ? null : Number(spec.fuerza);
  if (f != null && !(f >= 0 && f <= 12)) return null;
  const W = 384;
  const rh = 17;
  const y0 = 56;
  const H = y0 + 13 * rh + 26;
  const out = open(W, H, 'Escalas Beaufort y Douglas', 'bf');
  out.push(title(W / 2, 'Escalas Beaufort (viento) y Douglas (mar)'));
  out.push(lbl(8, 44, 'Beaufort', null, 'start', 'font-weight="700"'), lbl(184, 44, 'nudos', null, 'end', 'font-size="9"'));
  out.push(lbl(198, 44, 'Douglas', null, 'start', 'font-weight="700"'), lbl(376, 44, 'olas (m)', null, 'end', 'font-size="9"'));
  BEAUFORT.forEach(([n, kn], i) => {
    const y = y0 + i * rh;
    const on = f == null || f === i;
    out.push(`<g opacity="${on ? 1 : 0.4}"><rect x="6" y="${y - 12}" width="182" height="${rh - 2}" rx="3" fill="${ramp(i, 13)}" opacity="${f === i ? 0.45 : 0.18}"/>` +
      `<rect x="6" y="${y - 12}" width="${8 + i * 2.6}" height="${rh - 2}" rx="3" fill="${ramp(i, 13)}"/>` +
      `<text x="22" y="${y}" class="il-lbl strong" font-size="10" text-anchor="end">${i}</text>` + lbl(32, y, n, null, 'start', `font-size="10"${f === i ? ' font-weight="700"' : ''}`) + lbl(184, y, kn, null, 'end', 'font-size="10"') + '</g>');
  });
  DOUGLAS.forEach(([n, m], i) => {
    const y = y0 + i * rh;
    out.push(`<rect x="196" y="${y - 12}" width="182" height="${rh - 2}" rx="3" fill="${ramp(i, 10)}" opacity=".18"/>` +
      `<path d="M199,${y - 4} ${[0, 1].map(() => `q3,${-1 - i * 0.55} 6,0 q3,${1 + i * 0.55} 6,0`).join(' ')}" fill="none" stroke="${ramp(i, 10)}" stroke-width="1.8"/>` +
      `<text x="${232}" y="${y}" class="il-lbl strong" font-size="10" text-anchor="end">${i}</text>` + lbl(238, y, n, null, 'start', 'font-size="10"') + lbl(376, y, m, null, 'end', 'font-size="10"'));
  });
  out.push(lbl(198, y0 + 10 * rh + 4, 'La mar depende también del fetch', null, 'start', 'font-size="9"'), lbl(198, y0 + 10 * rh + 16, '(distancia sobre la que sopla)', null, 'start', 'font-size="9"'), lbl(198, y0 + 10 * rh + 28, 'y de cuánto dura el viento.', null, 'start', 'font-size="9"'));
  out.push(lbl(8, H - 8, 'Velocidad del viento en nudos · altura significativa de las olas en metros', null, 'start', 'font-size="9"'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: f == null
      ? 'Beaufort mide la fuerza del viento (0 a 12) y Douglas el estado de la mar (0 a 9). No hay una equivalencia exacta entre ambas: la mar que levanta un viento depende de su fuerza, del fetch y del tiempo que lleva soplando.'
      : `Fuerza ${f} Beaufort: ${BEAUFORT[f][0].toLowerCase()}, ${BEAUFORT[f][1]} nudos.`,
  };
}
