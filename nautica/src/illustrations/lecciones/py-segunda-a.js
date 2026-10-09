// Segundas láminas del Patrón de Yate: superficies libres (py-1-3), el extintor de CO₂ y cómo se usa un
// extintor (py-1-7), los modelos de viento con sus fuerzas (py-2-3), el psicrómetro y el punto de rocío
// (py-2-5) y las nubes de cada piso con su aspecto (py-2-6).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, fx } from '../kit.js';
import { superficiesLibresC, PARTES_SL } from '../py-cola-c.js';
import { extintorC, PARTES_CO2, PARTES_USO } from '../py-cierre-c.js';
import { modelosVientoC, psicrometroC, nubesPisosC, PISOS_NUBES } from '../py-cola-meteo-c.js';

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', p: 'var(--l-p)', g: 'var(--l-g)', t: 'currentColor' };
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

const flecha = (x1, y1, x2, y2, k, id, w = 2.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})" ${extra}/>`;

// ===========================================================================
// 1. Superficies libres (py-1-3): en estilo C, en src/illustrations/py-cola-c.js.

// ===========================================================================
// 2. Extintor (py-1-7): cómo se reconoce el de CO₂ y cómo se usa un extintor portátil.
// spec: { tipo:'extintor', vista?: 'ambas'|'co2'|'uso', resaltar?: parte o lista }

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
    fn: extintorC,
    params: { vista: ['ambas', 'co2', 'uso', 'norma'], resaltar: [...PARTES_CO2, ...PARTES_USO] },
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
