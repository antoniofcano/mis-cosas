// Meteo, variante frentes, en perspectiva: un bloque con el mapa en el suelo y el corte A–A′ en la pared del
// fondo, más el mapa y el corte en plano. Tocar una parte (frente frío, frente cálido, sector cálido, aire frío) la
// resalta en las tres vistas. Punto de vista fijo, dibujado en SVG. Sin mandos ni predicción: es una lámina de ver.
import { f1 } from './kit.js';

const D = 110; // profundidad del bloque (de sur a norte)
/** Proyección del bloque: x al este, y al norte (hacia el fondo), z hacia arriba. */
const P = (x, y, z) => `${f1(20 + x + y * 0.45)},${f1(205 - y * 0.75 - z * 0.9)}`;
const poly = (pts, p, fill) => `<polygon data-parte="${p}" points="${pts.join(' ')}" fill="${fill}" stroke="var(--border)" stroke-width="1"/>`;
const seg = (a, b, p, color) => { const [x1, y1] = a.split(','); const [x2, y2] = b.split(','); return `<line data-parte="${p}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`; };
const txt = (x, y, t, size = 12, anchor = 'middle') => `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="700" text-anchor="${anchor}" fill="var(--text)" style="font-family:inherit">${t}</text>`;
function nube(x, y, s) {
  return `<g fill="var(--l-nube)" stroke="var(--l-g)" stroke-width="1"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(22 * s)}" ry="${f1(9 * s)}"/><ellipse cx="${f1(x - 10 * s)}" cy="${f1(y - 7 * s)}" rx="${f1(11 * s)}" ry="${f1(8 * s)}"/><ellipse cx="${f1(x + 8 * s)}" cy="${f1(y - 9 * s)}" rx="${f1(13 * s)}" ry="${f1(10 * s)}"/></g>`;
}
const pt = (s) => s.split(',').map(Number);

function bloque() {
  const o = ['<svg viewBox="0 0 310 228" class="il lam-svg" role="img" aria-label="Bloque en perspectiva: el mapa en el suelo y el corte vertical al fondo"><rect width="310" height="228" rx="10" fill="var(--l-fondo)"/>'];
  // pared del fondo: el corte por A–A′
  o.push(poly([P(0, D, 0), P(85, D, 0), P(55, D, 80), P(0, D, 80)], 'af', 'var(--l-frio)'));
  o.push(poly([P(125, D, 0), P(220, D, 0), P(220, D, 54)], 'af', 'var(--l-frio)'));
  o.push(poly([P(85, D, 0), P(125, D, 0), P(220, D, 54), P(220, D, 80), P(55, D, 80)], 'sc', 'var(--l-calido)'));
  for (const [x, z, s] of [[78, 52, 0.9], [170, 42, 0.7], [200, 62, 0.6]]) { const [a, b] = pt(P(x, D, z)); o.push(nube(a, b, s)); }
  o.push(seg(P(85, D, 0), P(55, D, 80), 'ff', 'var(--l-frente-frio)'), seg(P(125, D, 0), P(220, D, 54), 'fc', 'var(--l-frente-calido)'));
  // suelo: el mapa
  o.push(poly([P(0, 0, 0), P(35, 0, 0), P(85, D, 0), P(0, D, 0)], 'af', 'var(--l-frio)'));
  o.push(poly([P(190, 0, 0), P(220, 0, 0), P(220, D, 0), P(125, D, 0)], 'af', 'var(--l-frio)'));
  o.push(poly([P(35, 0, 0), P(190, 0, 0), P(125, D, 0), P(85, D, 0)], 'sc', 'var(--l-calido)'));
  o.push(seg(P(35, 0, 0), P(85, D, 0), 'ff', 'var(--l-frente-frio)'), seg(P(190, 0, 0), P(125, D, 0), 'fc', 'var(--l-frente-calido)'));
  const [ax, ay] = pt(P(0, D, 0));
  const [bx, by] = pt(P(220, D, 0));
  o.push(txt(ax - 4, ay + 4, 'A', 13, 'end'), txt(bx + 4, by + 4, 'A′', 13, 'start'));
  const [cx, cy] = pt(P(110, D, 88));
  o.push(txt(130, 222, 'el mapa, visto desde el sur', 12), txt(cx, cy, 'el corte', 12));
  o.push('</svg>');
  return o.join('');
}

function mapa() {
  const o = ['<svg viewBox="0 0 160 150" class="il lam-svg" role="img" aria-label="Mapa del tiempo con la borrasca y sus dos frentes">'];
  o.push('<rect data-parte="af" width="160" height="150" rx="10" fill="var(--l-frio)"/>');
  o.push('<polygon data-parte="sc" points="80,22 58,62 25,150 140,150 98,62" fill="var(--l-calido)"/>');
  o.push('<g data-parte="ff"><polyline points="80,22 58,62 25,150" fill="none" stroke="var(--l-frente-frio)" stroke-width="3.5"/><path d="M68 42l11 3-6 9zM50 80l11 2-5 10zM37 114l11 2-5 10z" fill="var(--l-frente-frio)"/></g>');
  o.push('<g data-parte="fc"><polyline points="80,22 98,62 140,150" fill="none" stroke="var(--l-frente-calido)" stroke-width="3.5"/><circle cx="94" cy="42" r="5" fill="var(--l-frente-calido)"/><circle cx="112" cy="80" r="5" fill="var(--l-frente-calido)"/><circle cx="128" cy="114" r="5" fill="var(--l-frente-calido)"/></g>');
  o.push(txt(80, 18, 'B', 16));
  o.push('<line x1="6" y1="62" x2="154" y2="62" stroke="var(--text)" stroke-width="1.5" stroke-dasharray="5 4"/>', txt(6, 56, 'A', 14, 'start'), txt(154, 56, 'A′', 14, 'end'));
  o.push('</svg>');
  return o.join('');
}

function corte() {
  const S = (x, z) => `${x},${135 - z * 1.5}`;
  const o = ['<svg viewBox="0 0 220 150" class="il lam-svg" role="img" aria-label="Corte vertical por la línea A–A′">'];
  o.push(poly([S(0, 0), S(85, 0), S(55, 80), S(0, 80)], 'af', 'var(--l-frio)'), poly([S(125, 0), S(220, 0), S(220, 54)], 'af', 'var(--l-frio)'));
  o.push(poly([S(85, 0), S(125, 0), S(220, 54), S(220, 80), S(55, 80)], 'sc', 'var(--l-calido)'));
  o.push(nube(76, 62, 1), nube(72, 40, 1.1), nube(165, 74, 0.8), nube(198, 44, 0.7));
  o.push(seg(S(85, 0), S(55, 80), 'ff', 'var(--l-frente-frio)'), seg(S(125, 0), S(220, 54), 'fc', 'var(--l-frente-calido)'));
  o.push('<rect y="135" width="220" height="15" fill="var(--l-mar)"/>', txt(30, 124, 'frío', 15), txt(118, 60, 'cálido', 15), txt(188, 124, 'frío', 15));
  o.push('</svg>');
  return o.join('');
}

const INICIO = 'El suelo del bloque es el mapa del tiempo; la pared del fondo es el corte por la línea A–A′. Cada frente del mapa sube por la pared como una superficie inclinada. Toca una parte.';

export const frentes = {
  mandos: [],
  estado: () => ({}),
  calcular: () => ({}),
  pie: () => 'Los símbolos de los frentes apuntan hacia donde avanzan: triángulos azules el frío, semicírculos rojos el cálido. En el corte, el frío es una cuña empinada y el cálido una rampa suave.',
  dibujar: () => ({
    vistas: [{ svg: bloque(), pie: 'La borrasca y sus frentes, en perspectiva' }, { svg: mapa(), pie: 'El mapa. A–A′ es por donde se corta.' }, { svg: corte(), pie: 'El corte por A–A′, mirando al norte.' }],
    disposicion: 'primera-ancha',
    lectura: INICIO,
  }),
  partes: {
    ff: 'Frente frío. En el mapa, la línea azul con triángulos. En el corte, una cuña empinada de aire frío que levanta de golpe el aire cálido: nubes de desarrollo vertical, chubascos y rachas; al pasar, el barómetro sube y el viento rola.',
    fc: 'Frente cálido. En el mapa, la línea roja con semicírculos. En el corte, una rampa suave: el aire cálido sube despacio sobre el frío, con nubes en capas y lluvia continua por delante del frente.',
    sc: 'Sector cálido: la cuña de aire templado y húmedo entre los dos frentes. Se estrecha hacia el centro de la borrasca.',
    af: 'Aire frío: detrás del frente frío y delante del cálido, y por debajo de las dos superficies inclinadas.',
  },
  botonesPartes: [['ff', 'Frente frío'], ['fc', 'Frente cálido'], ['sc', 'Sector cálido'], ['af', 'Aire frío']],
};
