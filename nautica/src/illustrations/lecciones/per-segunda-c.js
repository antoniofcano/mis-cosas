// Segundas láminas del PER: qué hace crecer la mar y mar de viento frente a mar de fondo (per-9-6),
// cómo se actualiza la declinación de la carta (per-10-5), rumbo circular y cuadrantal (per-10-6),
// demora frente a marcación (per-11-5) y la calidad de la situación según el ángulo de corte (per-11-6).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) donde la lámina tiene partes.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx } from '../kit.js';
import { declinacionC, rumboCuadrantalC, demoraMarcacionC, calidadCorteC, cuadrantalACircular } from '../per-cola-calculo-c.js';

export { cuadrantalACircular };

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', p: 'var(--l-p)', g: 'var(--l-g)', t: 'currentColor' };
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];
const close = (out) => { out.push('</svg>'); return out.join(''); };
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

/** Partes resaltadas; null si alguna no existe. */
function marcas(spec, validas) {
  const s = new Set(lista(spec.resaltar));
  if ([...s].some((p) => !validas.includes(p))) return null;
  return { activo: s.size > 0, on: (p) => s.has(p), op: (p) => (s.size && !s.has(p) ? ' opacity=".38"' : '') };
}

const flecha = (x1, y1, x2, y2, k, id, w = 2.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})" ${extra}/>`;
const linea = (x1, y1, x2, y2, k = 't', w = 1.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k] ?? k}" stroke-width="${w}" ${extra}/>`;

/** Texto con halo del color del fondo. o = { c, a, s, b, halo, extra } */
const tx = (x, y, t, o = {}) => {
  const w = String(t).replace(/<[^>]*>|&[a-z]+;/g, 'x').length * (o.s ?? 11) * (o.b ? 0.58 : 0.52);
  const a = o.a ?? 'start';
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const c = o.c ? (K[o.c] ?? o.c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.halo === false ? ` style="fill:${c}"` : ` style="fill:${c};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round"`} ${o.extra ?? ''}>${t}</text>`;
};

/** Arco de rumbo náutico a1 → a2 (sentido horario si a2 > a1) con radio r alrededor de (cx, cy). */

// ===========================================================================
// 1. La mar (per-9-6). spec: { tipo:'mar-crece', vista?: 'factores'|'viento-fondo',
//    resaltar? (factores): 'intensidad'|'persistencia'|'fetch' o lista }

const PARTES_MAR = ['intensidad', 'persistencia', 'fetch'];

function marFactores(m) {
  const W = 320;
  const H = 292;
  const id = 'pmc';
  const out = start(W, H, 'Qué hace crecer la mar', id);
  out.push(title(160, 'Qué hace crecer la mar'));
  const hi = (p) => m.on(p);
  // Viento (intensidad): flechas desde tierra hacia la mar.
  const wI = hi('intensidad') ? 3.4 : 2.4;
  out.push(`<g${m.op('intensidad')}>`, tx(52, 44, 'viento', { b: hi('intensidad'), c: 'v', s: 11 }));
  for (const x of [52, 112, 172]) out.push(flecha(x, 56, x + 44, 56, 'v', id, wI));
  out.push('</g>');
  // Reloj (persistencia).
  const cx = 262;
  const cy = 54;
  out.push(`<g${m.op('persistencia')}><circle cx="${cx}" cy="${cy}" r="12" fill="none" style="stroke:${hi('persistencia') ? K.a : 'currentColor'}" stroke-width="${hi('persistencia') ? 2.6 : 1.6}"/>`);
  out.push(linea(cx, cy, cx, cy - 8, 't', 1.6), linea(cx, cy, cx + 6, cy + 2, 't', 1.6));
  out.push(tx(cx + 18, cy + 4, 'horas', { s: 10 }), '</g>');
  // Tierra a la izquierda y la mar.
  const y0 = 140;
  const xT = 46;
  out.push(`<path d="M8,104 L30,100 L${xT},112 L${xT + 4},${y0} L${xT},180 L8,180Z" style="fill:var(--l-a)" opacity=".45"/>`);
  out.push(tx(12, 96, 'tierra', { s: 10 }));
  // Olas: crecen con la distancia a la costa hasta un tope (mar totalmente desarrollada).
  const amp = (x) => 1 + 17 * Math.min(1, Math.max(0, (x - xT - 10) / 190)) ** 1.3;
  const pts = [];
  for (let x = xT + 4; x <= 312; x += 2) {
    const L = 10 + 26 * Math.min(1, (x - xT) / 180);
    pts.push([x, y0 - amp(x) * Math.cos((2 * Math.PI * (x - xT)) / L) * 0.5 - amp(x) * 0.5]);
  }
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('');
  out.push(`<path d="${d}L312,180L${xT + 4},180Z" style="fill:var(--l-mar)"/><path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.8"/>`);
  // Fetch: extensión de mar sobre la que sopla.
  const yF = 100;
  const wF = hi('fetch') ? 3 : 1.8;
  out.push(`<g${m.op('fetch')}>`, linea(xT + 4, yF - 6, xT + 4, yF + 6, 't', 1), linea(310, yF - 6, 310, yF + 6, 't', 1));
  out.push(flecha(178, yF, xT + 7, yF, 'm', id, wF), flecha(178, yF, 307, yF, 'm', id, wF));
  out.push(tx(178, yF - 8, 'fetch: extensión de mar', { a: 'middle', b: hi('fetch'), c: 'm', s: 11 }), '</g>');
  // Debajo de la mar.
  out.push(tx(xT + 2, 196, 'poco fetch,', { s: 10 }), tx(xT + 2, 208, 'poca mar', { s: 10 }));
  out.push(tx(310, 196, 'la ola ya no crece: mar', { a: 'end', s: 10 }), tx(310, 208, 'totalmente desarrollada', { a: 'end', s: 10 }));
  // Leyenda de los tres factores.
  const filas = [
    ['intensidad', 'Intensidad', '= fuerza del viento', 'v'],
    ['persistencia', 'Persistencia', '= tiempo soplando igual', 'a'],
    ['fetch', 'Fetch', '= extensión (espacio) de mar', 'm'],
  ];
  filas.forEach(([k, n, t, c], i) => {
    const y = 230 + i * 16;
    out.push(`<g${m.op(k)}>`, tx(14, y, n, { b: true, c, s: 11 }), tx(104, y, t, { b: hi(k), s: 11 }), '</g>');
  });
  out.push(tx(14, 282, 'Cuanto mayores los tres, más alta la ola.', { b: true, s: 11 }));
  return close(out);
}

function marVientoFondo() {
  const W = 320;
  const H = 280;
  const id = 'pmf';
  const out = start(W, H, 'Mar de viento y mar de fondo', id);
  out.push(title(160, 'Mar de viento y mar de fondo'));
  // Nube de temporal a la izquierda, lejos; costa en calma a la derecha.
  out.push(`<path d="M18,62 a12,12 0 0 1 16,-14 a16,16 0 0 1 30,-2 a12,12 0 0 1 20,10 a10,10 0 0 1 -4,18 L24,74 a8,8 0 0 1 -6,-12Z" style="fill:var(--l-nube);stroke:var(--l-g)" stroke-width="1.2"/>`);
  out.push(flecha(30, 90, 70, 90, 'v', id, 2.4), flecha(80, 90, 120, 90, 'v', id, 2.4));
  out.push(tx(98, 54, 'temporal lejano', { s: 10 }));
  out.push(`<path d="M290,100 L312,100 L312,150 L296,150 L292,128Z" style="fill:var(--l-a)" opacity=".45"/>`, tx(310, 92, 'costa', { a: 'end', s: 10 }));
  out.push(tx(252, 62, 'aquí: calma', { a: 'middle', s: 10 }), tx(252, 75, 'o viento de otra dirección', { a: 'middle', s: 10 }));
  // Perfil: mar de viento (corta, puntiaguda) a la izquierda, mar de fondo (larga, redonda) a la derecha.
  const y0 = 128;
  let d = `M8,${y0}`;
  for (let x = 8, i = 0; x < 128; x += 12, i++) {
    const h = [10, 14, 8, 12, 15, 9, 13, 11, 14, 10][i % 10];
    d += ` Q${x + 7},${y0 - h * 0.5} ${x + 9},${y0 - h} L${x + 12},${y0}`;
  }
  out.push(`<path d="${d} L128,150 L8,150Z" style="fill:var(--l-mar)"/><path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.8"/>`);
  for (const x of [17, 53, 89, 113]) out.push(`<path d="M${x},${y0 - 12} l3,3 l-2,1 l3,3" fill="none" stroke="currentColor" stroke-width="1.1"/>`);
  const p2 = [];
  for (let x = 128; x <= 292; x += 2) p2.push([x, y0 - 4 - 5 * Math.cos((2 * Math.PI * (x - 128)) / 54)]);
  const d2 = p2.map(([x, y], i) => `${i ? 'L' : 'M'}${fx(x)},${fx(y)}`).join('');
  out.push(`<path d="${d2}L292,150L128,150Z" style="fill:var(--l-mar)"/><path d="${d2}" fill="none" style="stroke:var(--l-v)" stroke-width="2"/>`);
  out.push(linea(128, 104, 128, 152, 't', 1, 'stroke-dasharray="3 3" stroke-opacity=".6"'));
  out.push(flecha(150, 108, 250, 108, 't', id, 1.8), tx(200, 100, 'viaja hasta ti', { a: 'middle', s: 10 }));
  // Descripciones.
  out.push(tx(14, 172, 'MAR DE VIENTO', { b: true, c: 'v', s: 11 }));
  out.push(tx(14, 186, 'la levanta el viento de ese momento y lugar', { s: 10 }), tx(14, 199, 'cortas, irregulares, cresta puntiaguda que rompe', { s: 10 }));
  out.push(tx(14, 220, 'MAR DE FONDO (o mar de leva)', { b: true, c: 'p', s: 11 }));
  out.push(tx(14, 234, 'se formó lejos y ha viajado hasta ti', { s: 10 }), tx(14, 247, 'largas, regulares, cresta redondeada', { s: 10 }));
  out.push(tx(14, 268, 'Mares cruzadas o contra corriente: mar confusa.', { b: true, s: 10 }));
  return close(out);
}

export function marCreceIllustration(spec) {
  const vista = spec.vista ?? 'factores';
  if (vista === 'viento-fondo') {
    if (lista(spec.resaltar).length) return null;
    return { svg: marVientoFondo(), caption: 'Mar de viento: la levanta el viento que sopla ahí y entonces; olas cortas, irregulares y de cresta puntiaguda. Mar de fondo (o de leva): se formó lejos y llega larga, regular y redondeada, aunque aquí haya calma o sople otro viento.' };
  }
  if (vista !== 'factores') return null;
  const m = marcas(spec, PARTES_MAR);
  if (!m) return null;
  const CAP = {
    intensidad: 'Intensidad: la fuerza del viento sobre la mar. Con más fuerza, más ola.',
    persistencia: 'Persistencia: el tiempo que lleva soplando con la misma dirección e intensidad.',
    fetch: 'Fetch: la extensión de mar sobre la que sopla el viento con la misma dirección e intensidad. Un viento de tierra levanta poca mar cerca de la costa porque apenas tiene fetch.',
  };
  const s = lista(spec.resaltar);
  const caption = s.length === 1 ? CAP[s[0]] : 'La ola crece con la intensidad (fuerza), la persistencia (tiempo) y el fetch (extensión) del viento, hasta la mar totalmente desarrollada. Cerca de una costa de la que sopla el viento hay poco fetch y poca mar.';
  return { svg: marFactores(m), caption };
}

// Declinación (per-10-5), cuadrantal (per-10-6), demora y marcación (per-11-5) y calidad del corte (per-11-6): en estilo C,
// en src/illustrations/per-cola-calculo-c.js.

// ===========================================================================

export const LAMINAS = {
  'mar-crece': {
    fn: marCreceIllustration,
    params: { vista: ['factores', 'viento-fondo'], resaltar: PARTES_MAR },
    ejemplo: { tipo: 'mar-crece', vista: 'factores' },
  },
  'declinacion-anual': {
    fn: declinacionC,
    params: { dm: 'declinación de la carta en minutos con signo (E +, W −; por defecto −150 = 2° 30′ W)', anio: 'año de la carta (por defecto 2016)', variacion: 'variación anual en minutos con signo (por defecto +9 = 9′ E)', actual: 'año en que navegas (por defecto 2026)' },
    ejemplo: { tipo: 'declinacion-anual', dm: -150, anio: 2016, variacion: 9, actual: 2026 },
  },
  'rumbo-cuadrantal': {
    fn: rumboCuadrantalC,
    params: { rumbo: ['N20E', 'S65E', 'S45W', 'N64W'] },
    ejemplo: { tipo: 'rumbo-cuadrantal', rumbo: 'N64W' },
  },
  'demora-marcacion': {
    fn: demoraMarcacionC,
    params: { rumbo: 'rumbo verdadero 0–359 (por defecto 70)', marcacion: 'marcación −180..180, estribor +, babor − (por defecto −100)', resaltar: ['demora', 'marcacion'] },
    ejemplo: { tipo: 'demora-marcacion', rumbo: 70, marcacion: -100 },
  },
  'calidad-corte': {
    fn: calidadCorteC,
    params: { angulo: 'ángulo de corte del caso malo, 10–45 (por defecto 20)', resaltar: ['buena', 'mala'] },
    ejemplo: { tipo: 'calidad-corte' },
  },
};
