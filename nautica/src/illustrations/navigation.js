// Ilustraciones de navegación: triángulos de corriente, abatimiento,
// viento aparente (también según el rumbo), loxodrómica, mareas (y vivas/muertas), situación por dos demoras, sectores de las luces, canal balizado y dispositivo de separación del tráfico.
// Los colores son de saturación media para leerse en los temas claro y oscuro (el fondo es il-panel).

import { mareasVivasMuertas } from './meteo-c.js';

const C = { v: '#2563eb', m: '#16a34a', a: '#d97706', r: '#dc2626', p: '#7c3aed', g: '#64748b' };

const defs = (id) => `<defs>${Object.entries(C).map(([k, c]) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;
const title = (x, t) => `<text x="${x}" y="22" class="il-title">${t}</text>`;
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="il-lbl" text-anchor="${anchor}" ${c ? `style="fill:${C[c]}"` : ''} ${extra}>${t}</text>`;

// Nortes (verdadero, magnético y de aguja): ahora es interactiva, en src/illustrations/interactivas/nortes.js.

// Corriente y abatimiento: ahora son interactivas, en src/illustrations/interactivas/ (cadena.js, corriente.js, abatimiento.js).

// Viento real, de avance y aparente: ahora en estilo C, en src/illustrations/meteo-c.js.

// ---------------------------------------------------------------------------
// Mareas. spec: { tipo:'marea', modo:'curva'|'duodecimos'|'sonda' }

export function mareaIllustration(spec) {
  // curva, duodécimos y sonda: ahora son interactivas (src/illustrations/interactivas/marea.js)
  return spec.modo === 'fases' ? mareasVivasMuertas() : null;
}

// Sectores de las luces: ahora es interactiva, en src/illustrations/interactivas/sectores-luces.js.

// Canal balizado: ahora en estilo C, en src/illustrations/balizamiento.js.

// ---------------------------------------------------------------------------
// Dispositivo de separación del tráfico (Regla 10). spec: { tipo:'dst' }

// Mareas vivas y muertas: ahora en estilo C, en src/illustrations/meteo-c.js.

// Enfilación, situación por dos demoras y loxodrómica: ahora en estilo C, en src/illustrations/carta-c.js.
