// Segundas láminas del Patrón de Yate: superficies libres (py-1-3), el extintor de CO₂ y cómo se usa un
// extintor (py-1-7), los modelos de viento con sus fuerzas (py-2-3), el psicrómetro y el punto de rocío
// (py-2-5) y las nubes de cada piso con su aspecto (py-2-6).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx } from '../kit.js';
import { superficiesLibresC, PARTES_SL } from '../py-cola-c.js';
import { modelosVientoC, psicrometroC, nubesPisosC, PISOS_NUBES } from '../py-cola-meteo-c.js';

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

/** Texto con halo del color del fondo. o = { c, a, s, b, extra } */
const tx = (x, y, t, o = {}) => {
  // Que no se salga del panel (ancho estimado del texto).
  const w = String(t).replace(/<[^>]*>|&[a-z]+;/g, 'x').length * (o.s ?? 10) * (o.b ? 0.58 : 0.52);
  const a = o.a ?? 'start';
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const c = o.c ? (K[o.c] ?? o.c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${o.a ?? 'start'}"${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.halo === false ? ` style="fill:${c}"` : ` style="fill:${c};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round"`} ${o.extra ?? ''}>${t}</text>`;
};

// Rotación de un punto local (x, y) un ángulo en grados (horario en pantalla) alrededor de (cx, cy).
const rot = (cx, cy, deg, [x, y]) => {
  const r = (deg * Math.PI) / 180;
  return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
};

// ===========================================================================
// 1. Superficies libres (py-1-3): en estilo C, en src/illustrations/py-cola-c.js.

// ===========================================================================
// 2. Extintor (py-1-7): cómo se reconoce el de CO₂ y cómo se usa un extintor portátil.
// spec: { tipo:'extintor', vista?: 'ambas'|'co2'|'uso', resaltar?: parte o lista }

const PARTES_CO2 = ['manometro', 'boquilla', 'precinto', 'etiqueta'];
const PARTES_USO = ['viento', 'base', 'barrer', 'salida'];

function botella(x, y, h, w, { manometro = false, on = () => false } = {}) {
  const s = [];
  // Cuerpo rojo con etiqueta.
  s.push(`<rect x="${fx(x - w / 2)}" y="${fx(y)}" width="${w}" height="${h}" rx="${w / 2.6}" style="fill:var(--l-roja);stroke:currentColor" stroke-width="1.2"/>`);
  s.push(`<rect x="${fx(x - w / 2 + 3)}" y="${fx(y + h * 0.35)}" width="${w - 6}" height="${fx(h * 0.32)}" rx="2" style="fill:var(--l-nube);stroke:currentColor" stroke-width="${on('etiqueta') ? 2.2 : 0.8}"/>`);
  for (let i = 0; i < 3; i++) s.push(linea(x - w / 2 + 6, y + h * 0.42 + i * 6, x + w / 2 - 6, y + h * 0.42 + i * 6, 'g', 1.2));
  // Válvula y maneta.
  s.push(`<rect x="${fx(x - 5)}" y="${fx(y - 12)}" width="10" height="13" style="fill:var(--l-g);stroke:currentColor" stroke-width="1"/>`);
  s.push(`<path d="M${fx(x - 3)},${fx(y - 12)} L${fx(x + 16)},${fx(y - 20)}" style="stroke:currentColor" stroke-width="2.6" stroke-linecap="round"/>`);
  if (manometro) s.push(`<circle cx="${fx(x - 10)}" cy="${fx(y - 8)}" r="5.5" style="fill:var(--l-nube);stroke:currentColor" stroke-width="${on('manometro') ? 2.4 : 1.2}"/><line x1="${fx(x - 10)}" y1="${fx(y - 8)}" x2="${fx(x - 7)}" y2="${fx(y - 11)}" style="stroke:var(--l-m)" stroke-width="1.6"/>`);
  return s.join('');
}

function parteCO2(out, y0, m, id) {
  out.push(tx(12, y0 + 14, 'Cómo se reconoce un extintor de CO₂', { b: true, s: 11.5 }));
  // Extintor de CO₂: sin manómetro, manguera y trompa.
  const x = 40;
  const yb = y0 + 46;
  out.push(botella(x, yb, 92, 30, { on: m.on }));
  // Precinto y pasador (anilla) en la válvula.
  out.push(`<circle cx="${x + 9}" cy="${yb - 5}" r="3.6" fill="none" style="stroke:var(--l-a)" stroke-width="${m.on('precinto') ? 2.6 : 1.6}"/>`);
  // Manguera hasta la trompa (boquilla difusora ancha).
  out.push(`<path d="M${x + 5},${yb - 6} C${x + 30},${yb - 6} ${x + 30},${yb + 30} ${x + 26},${yb + 44}" fill="none" stroke="currentColor" stroke-width="2.4"/>`);
  out.push(`<path d="M${x + 22},${yb + 44} L${x + 30},${yb + 44} L${x + 38},${yb + 74} L${x + 14},${yb + 74}Z" style="fill:var(--l-tope);stroke:currentColor" stroke-width="${m.on('boquilla') ? 2.6 : 1}"/>`);
  out.push(tx(x, yb + 108, 'CO₂', { a: 'middle', b: true }));
  // Rótulos con línea guía.
  const lx = 104;
  const filas = [
    ['manometro', 'Sin manómetro:', 'su carga se controla pesándolo', yb - 14, [x + 1, yb - 12]],
    ['precinto', 'Precinto y pasador', 'de seguridad', yb + 14, [x + 12, yb - 4]],
    ['etiqueta', 'Etiqueta', 'con instrucciones', yb + 42, [x + 12, yb + 46]],
    ['boquilla', 'Boquilla ancha en trompa:', 'no la agarres, se enfría mucho', yb + 70, [x + 36, yb + 66]],
  ];
  for (const [k, a, b, y, [px, py]] of filas) {
    const on = m.on(k);
    out.push(`<g${m.op(k)}>`);
    out.push(linea(px, py, lx - 4, y - 4, 't', on ? 1.6 : 0.8, 'stroke-opacity=".6"'));
    out.push(tx(lx, y, a, { b: true, c: on ? 'r' : null }), tx(lx, y + 12, b, { b: on }));
    out.push('</g>');
  }
  // Extintor de polvo, con manómetro, para comparar.
  const xp = 290;
  out.push(`<g${m.op('manometro')}>`);
  out.push(botella(xp, yb + 4, 70, 26, { manometro: true, on: m.on }));
  out.push(tx(xp, yb + 92, 'Polvo, con', { a: 'middle', b: true }), tx(xp, yb + 105, 'manómetro', { a: 'middle', b: true }));
  out.push('</g>');
}

function llama(x, y, s = 1) {
  return `<path d="M${fx(x)},${fx(y)} C${fx(x - 12 * s)},${fx(y - 8 * s)} ${fx(x - 6 * s)},${fx(y - 22 * s)} ${fx(x - 2 * s)},${fx(y - 30 * s)} C${fx(x + 2 * s)},${fx(y - 20 * s)} ${fx(x + 10 * s)},${fx(y - 16 * s)} ${fx(x + 6 * s)},${fx(y - 40 * s)} C${fx(x + 18 * s)},${fx(y - 24 * s)} ${fx(x + 16 * s)},${fx(y - 8 * s)} ${fx(x + 12 * s)},${fx(y)}Z" style="fill:var(--l-a);stroke:var(--l-r)" stroke-width="1.4"/>`;
}

function parteUso(out, y0, m, id) {
  out.push(tx(12, y0 + 14, 'Cómo se usa', { b: true, s: 11.5 }));
  out.push(tx(12, y0 + 30, 'Antes: alarma, para el motor, corta combustible'), tx(12, y0 + 42, 'y electricidad; quita el pasador y prueba.'));
  const yd = y0 + 128; // cubierta
  out.push(`<rect x="8" y="${yd}" width="304" height="6" style="fill:var(--l-casco)"/>`);
  // Viento por la espalda.
  out.push(`<g${m.op('viento')}>`);
  for (const dy of [0, 14]) out.push(flecha(14, y0 + 60 + dy, 52, y0 + 60 + dy, 'v', id, m.on('viento') ? 3 : 2));
  out.push(tx(14, y0 + 98, 'viento', { b: true, c: 'v' }), tx(14, y0 + 110, 'a la espalda', { c: 'v', b: m.on('viento') }));
  out.push('</g>');
  // Persona (de pie, mirando al fuego) con el extintor.
  const px = 100;
  out.push(`<g style="stroke:currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><circle cx="${px}" cy="${yd - 62}" r="7" style="fill:var(--bg)"/><line x1="${px}" y1="${yd - 55}" x2="${px}" y2="${yd - 26}"/><line x1="${px}" y1="${yd - 26}" x2="${px - 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 26}" x2="${px + 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 48}" x2="${px + 16}" y2="${yd - 36}"/></g>`);
  out.push(`<rect x="${px + 12}" y="${yd - 40}" width="9" height="22" rx="3" style="fill:var(--l-roja);stroke:currentColor"/>`);
  // Chorro hacia la base de las llamas.
  out.push(`<g${m.op('base')}>`);
  out.push(`<path d="M${px + 20},${yd - 38} L${px + 106},${yd - 8} L${px + 104},${yd - 2} Z" style="fill:var(--l-niebla)" opacity=".9"/>`);
  out.push(flecha(px + 22, yd - 36, px + 104, yd - 6, 'm', id, m.on('base') ? 3 : 2));
  out.push(tx(px + 18, yd - 56, 'apunta a la base', { b: true, c: 'm' }), tx(px + 18, yd - 44, 'de las llamas', { c: 'm', b: m.on('base') }));
  out.push('</g>');
  // Llamas.
  out.push(llama(214, yd - 1, 0.9), llama(236, yd - 1, 1.15), llama(262, yd - 1, 1));
  // Barrido de cerca a lejos.
  out.push(`<g${m.op('barrer')}>`);
  out.push(flecha(206, yd + 16, 282, yd + 16, 'a', id, m.on('barrer') ? 3 : 2));
  out.push(tx(244, yd + 30, 'barre del borde', { a: 'middle', b: true, c: 'a' }), tx(244, yd + 42, 'cercano al fondo', { a: 'middle', b: true, c: 'a' }));
  out.push('</g>');
  // Salida libre detrás.
  out.push(`<g${m.op('salida')}>`);
  out.push(flecha(84, yd + 16, 28, yd + 16, 'g', id, m.on('salida') ? 3 : 2, 'stroke-dasharray="5 3"'));
  out.push(tx(14, yd + 30, 'salida libre detrás', { b: m.on('salida') }));
  out.push('</g>');
  out.push(tx(160, yd + 60, 'De barlovento a sotavento. Se vacía en segundos.', { a: 'middle' }));
}

export function extintorIllustration(spec) {
  const vista = spec.vista ?? 'ambas';
  const validas = vista === 'co2' ? PARTES_CO2 : vista === 'uso' ? PARTES_USO : vista === 'ambas' ? [...PARTES_CO2, ...PARTES_USO] : null;
  if (!validas) return null;
  const m = marcas(spec, validas);
  if (!m) return null;
  const id = 'pex';
  const W = 320;
  const hCO2 = 162;
  const hUso = 196;
  if (vista === 'co2') {
    const out = start(W, hCO2 + 6, 'Cómo se reconoce un extintor de CO₂', id);
    parteCO2(out, 4, m, id);
    return { svg: close(out), caption: 'El de CO₂ no lleva manómetro (su carga se controla pesándolo) y tiene una boquilla ancha en forma de trompa que no se agarra, porque se enfría muchísimo. El de polvo sí lleva manómetro. Todos llevan etiqueta con instrucciones y precinto.' };
  }
  if (vista === 'uso') {
    const out = start(W, hUso + 4, 'Cómo se usa un extintor', id);
    parteUso(out, 2, m, id);
    return { svg: close(out), caption: 'Con el viento a la espalda y una salida libre detrás, apunta a la base de las llamas y barre desde el borde más cercano hacia el fondo, avanzando a medida que el fuego retrocede.' };
  }
  const out = start(W, hCO2 + hUso + 8, 'El extintor: cómo se reconoce el de CO₂ y cómo se usa', id);
  parteCO2(out, 4, m, id);
  out.push(linea(8, hCO2 + 4, W - 8, hCO2 + 4, 't', 1, 'stroke-opacity=".3"'));
  parteUso(out, hCO2 + 6, m, id);
  return { svg: close(out), caption: 'El de CO₂ se reconoce porque no lleva manómetro (se pesa) y tiene una boquilla ancha en trompa que no se agarra. Para usar cualquier extintor: viento a la espalda, salida libre detrás, a la base de las llamas y barriendo del borde cercano al fondo.' };
}

// ===========================================================================
// 3, 4 y 5. Modelos de viento (py-2-3), psicrómetro (py-2-5) y nubes de cada piso (py-2-6): en estilo C, en
// src/illustrations/py-cola-meteo-c.js.

// ===========================================================================

export const LAMINAS = {
  'superficies-libres': {
    fn: superficiesLibresC,
    params: { resaltar: PARTES_SL },
    ejemplo: { tipo: 'superficies-libres' },
  },
  extintor: {
    fn: extintorIllustration,
    params: { vista: ['ambas', 'co2', 'uso'], resaltar: [...PARTES_CO2, ...PARTES_USO] },
    ejemplo: { tipo: 'extintor', vista: 'ambas' },
  },
  'modelos-viento': {
    fn: modelosVientoC,
    params: { modelo: ['todos', 'geostrofico', 'gradiente', 'antitriptico'] },
    ejemplo: { tipo: 'modelos-viento' },
  },
  psicrometro: {
    fn: psicrometroC,
    params: { caso: ['ejemplo', 'humedo', 'seco'] },
    ejemplo: { tipo: 'psicrometro' },
  },
  'nubes-pisos': {
    fn: nubesPisosC,
    params: { resaltar: PISOS_NUBES },
    ejemplo: { tipo: 'nubes-pisos' },
  },
};
