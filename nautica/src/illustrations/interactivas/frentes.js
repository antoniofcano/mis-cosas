// Meteo, variante frentes, en perspectiva: un bloque con el mapa en el suelo y el corte A–A′ en la pared del
// fondo, más el mapa y el corte en plano. Tocar una parte (frente frío, frente cálido, sector cálido, aire frío) la
// resalta en las tres vistas. Punto de vista fijo, dibujado en SVG. Sin mandos ni predicción: es una lámina de ver.
// Estilo C (docs/ESTILO-LAMINAS.md): aire frío en azul y cálido en rojo, siempre rotulados; los frentes con su símbolo
// de mapa (triángulos el frío, semicírculos el cálido, hacia donde avanzan).
import { T, lienzo, rotulo, f1 } from '../estilo-c.js';

const D = 110; // profundidad del bloque (de sur a norte)
const K = 1.15;
/** Proyección del bloque: x al este, y al norte (hacia el fondo), z hacia arriba. */
const P = (x, y, z) => `${f1(22 + (x + y * 0.45) * K)},${f1(238 - (y * 0.75 + z * 0.9) * K)}`;
const FRIO = { fill: T.azul, op: 0.34 };
const CALIDO = { fill: T.rojo, op: 0.24 };
const poly = (pts, p, c) => `<polygon data-parte="${p}" points="${pts.join(' ')}" fill="${c.fill}" fill-opacity="${c.op}" stroke="${T.tinta}" stroke-width=".8"/>`;
const fondoPoly = (pts) => `<polygon points="${pts.join(' ')}" fill="${T.papel}"/>`;
const seg = (a, b, p, color) => { const [x1, y1] = a.split(','); const [x2, y2] = b.split(','); return `<line data-parte="${p}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`; };
const txt = (x, y, t, { size = 12.5, anchor = 'middle', color = T.tinta, cap = false } = {}) => rotulo(x, y, t, { size, weight: 700, anchor, color, estilo: cap ? 'cap' : 'serif' });
function nube(x, y, s) {
  return `<g fill="${T.papel}" stroke="${T.tinta}" stroke-width=".9"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(22 * s)}" ry="${f1(9 * s)}"/><ellipse cx="${f1(x - 10 * s)}" cy="${f1(y - 7 * s)}" rx="${f1(11 * s)}" ry="${f1(8 * s)}"/><ellipse cx="${f1(x + 8 * s)}" cy="${f1(y - 9 * s)}" rx="${f1(13 * s)}" ry="${f1(10 * s)}"/></g>`;
}
const pt = (s) => s.split(',').map(Number);

function bloque() {
  const { out: o, cierra } = lienzo(358, 270, 'Bloque en perspectiva: en el suelo, el mapa del tiempo con la borrasca y sus dos frentes; en la pared del fondo, el corte vertical por la línea A–A′, con la cuña del frente frío y la rampa del frente cálido.');
  // pared del fondo: el corte por A–A′ (sobre papel, para que las transparencias no se mezclen)
  o.push(fondoPoly([P(0, D, 0), P(220, D, 0), P(220, D, 80), P(0, D, 80)]));
  o.push(poly([P(0, D, 0), P(85, D, 0), P(55, D, 80), P(0, D, 80)], 'af', FRIO));
  o.push(poly([P(125, D, 0), P(220, D, 0), P(220, D, 54)], 'af', FRIO));
  o.push(poly([P(85, D, 0), P(125, D, 0), P(220, D, 54), P(220, D, 80), P(55, D, 80)], 'sc', CALIDO));
  for (const [x, z, s] of [[78, 52, 0.9], [170, 42, 0.7], [200, 62, 0.6]]) { const [a, b] = pt(P(x, D, z)); o.push(nube(a, b, s)); }
  o.push(seg(P(85, D, 0), P(55, D, 80), 'ff', T.azulTxt), seg(P(125, D, 0), P(220, D, 54), 'fc', T.rojoTxt));
  // suelo: el mapa
  o.push(fondoPoly([P(0, 0, 0), P(220, 0, 0), P(220, D, 0), P(0, D, 0)]));
  o.push(poly([P(0, 0, 0), P(35, 0, 0), P(85, D, 0), P(0, D, 0)], 'af', FRIO));
  o.push(poly([P(190, 0, 0), P(220, 0, 0), P(220, D, 0), P(125, D, 0)], 'af', FRIO));
  o.push(poly([P(35, 0, 0), P(190, 0, 0), P(125, D, 0), P(85, D, 0)], 'sc', CALIDO));
  o.push(seg(P(35, 0, 0), P(85, D, 0), 'ff', T.azulTxt), seg(P(190, 0, 0), P(125, D, 0), 'fc', T.rojoTxt));
  const [ax, ay] = pt(P(0, D, 0));
  const [bx, by] = pt(P(220, D, 0));
  o.push(txt(ax - 4, ay + 5, 'A', { anchor: 'end', size: 14 }), txt(bx + 4, by + 5, 'A′', { anchor: 'start', size: 14 }));
  const [cx, cy] = pt(P(110, D, 88));
  const [sx, sy] = pt(P(110, 0, 0));
  o.push(txt(sx, sy + 20, 'el mapa, visto desde el sur', { size: 12 }), txt(cx, cy, 'el corte', { size: 12 }));
  // rótulos de las masas de aire en el suelo
  const [fx1, fy1] = pt(P(20, 30, 0));
  const [cx1, cy1] = pt(P(110, 30, 0));
  o.push(txt(fx1, fy1, 'frío', { size: 12, color: T.azulTxt }), txt(cx1, cy1, 'cálido', { size: 12, color: T.rojoTxt }));
  o.push(cierra());
  return o.join('');
}

function mapa() {
  const { out: o, cierra } = lienzo(160, 160, 'Mapa del tiempo con la borrasca: el frente frío (triángulos) y el cálido (semicírculos) salen del centro B; entre los dos, el sector cálido. La línea A–A′ marca el corte.');
  o.push(`<rect data-parte="af" x="0" y="0" width="160" height="160" fill="${FRIO.fill}" fill-opacity="${FRIO.op}"/>`);
  o.push(`<polygon data-parte="sc" points="80,28 58,68 25,160 140,160 98,68" fill="${T.papel}"/><polygon data-parte="sc" points="80,28 58,68 25,160 140,160 98,68" fill="${CALIDO.fill}" fill-opacity="${CALIDO.op}"/>`);
  o.push(`<g data-parte="ff"><polyline points="80,28 58,68 25,160" fill="none" stroke="${T.azulTxt}" stroke-width="2.4"/><path d="M68 48l11 3-6 9zM50 86l11 2-5 10zM37 120l11 2-5 10z" fill="${T.azulTxt}"/></g>`);
  o.push(`<g data-parte="fc"><polyline points="80,28 98,68 140,160" fill="none" stroke="${T.rojoTxt}" stroke-width="2.4"/><circle cx="94" cy="48" r="5" fill="${T.rojoTxt}"/><circle cx="112" cy="86" r="5" fill="${T.rojoTxt}"/><circle cx="128" cy="120" r="5" fill="${T.rojoTxt}"/></g>`);
  o.push(txt(80, 24, 'B', { size: 17, color: T.rojoTxt }));
  o.push(`<line x1="8" y1="68" x2="152" y2="68" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="5 4"/>`, txt(10, 62, 'A', { anchor: 'start', size: 13 }), txt(150, 62, 'A′', { anchor: 'end', size: 13 }));
  o.push(cierra());
  return o.join('');
}

function corte() {
  // el mismo corte A–A′ que la pared del bloque, a la escala de 160 de ancho
  const S = (x, z) => `${f1(x * 0.727)},${f1(140 - z * 1.45)}`;
  const { out: o, cierra } = lienzo(160, 160, 'Corte vertical por la línea A–A′: a la izquierda la cuña empinada del aire frío bajo el frente frío; en el centro el aire cálido, que sube; a la derecha la rampa suave del frente cálido sobre el aire frío.');
  o.push(poly([S(0, 0), S(85, 0), S(55, 80), S(0, 80)], 'af', FRIO), poly([S(125, 0), S(220, 0), S(220, 54)], 'af', FRIO));
  o.push(poly([S(85, 0), S(125, 0), S(220, 54), S(220, 80), S(55, 80)], 'sc', CALIDO));
  o.push(nube(58, 60, 0.8), nube(54, 40, 0.85), nube(120, 70, 0.65), nube(146, 46, 0.55));
  o.push(seg(S(85, 0), S(55, 80), 'ff', T.azulTxt), seg(S(125, 0), S(220, 54), 'fc', T.rojoTxt));
  o.push(`<rect y="140" width="160" height="20" fill="${T.agua}"/>`, txt(22, 130, 'frío', { size: 12.5, color: T.azulTxt }), txt(90, 106, 'cálido', { size: 12.5, color: T.rojoTxt }), txt(140, 130, 'frío', { size: 12.5, color: T.azulTxt }));
  o.push(cierra());
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
