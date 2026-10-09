// Láminas de seguridad: supervivencia en el agua (hipotermia), balsa salvavidas (zafa, inflado, adrizado,
// lanzamiento), rescate con helicóptero y chaleco / arnés. Cada función es pura: spec → { svg, caption }.
// Estilo común del kit: fondo il-panel, textos en currentColor y superficies con las variables --l-* del tema.

import { fx } from '../kit.js';
import { balsaC } from '../balsa-c.js';
import { hipotermiaC } from '../per-cola-c.js';
import { helicopteroC, arnesC, PARTES_CHALECO, PARTES_ARNES } from '../py-cola-c.js';

const MAR = 'style="fill:var(--l-mar)"';

/** Superficie del mar desde la altura y hasta el fondo de la lámina, con una línea de ola. */
function mar(y, W, H, x0 = 0) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < W; x += 20) d += ` q5,-3 10,0 q5,3 10,0`;
  return `<rect x="${x0}" y="${y}" width="${W - x0}" height="${H - y}" ${MAR}/><path d="${d}" fill="none" stroke="${'var(--l-v)'}" stroke-width="1.2"/>`;
}
/** Trazo de miembro (brazo o pierna). */
const miembro = (pts, w = 6) => `<polyline points="${pts.map((p) => p.map(fx).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;

// ---------------------------------------------------------------------------
// Supervivencia en el agua. spec: { tipo:'hipotermia', postura:'saltar'|'help'|'grupo'|'atender' }

// ---------------------------------------------------------------------------
// Balsa salvavidas (zafa, inflado, adrizar, lanzar): en estilo C, en src/illustrations/balsa-c.js.

// ---------------------------------------------------------------------------
// Rescate con helicóptero (rumbo, cable, señales) y chaleco y arnés: en estilo C, en src/illustrations/py-cola-c.js.

// ---------------------------------------------------------------------------

export const LAMINAS = {
  hipotermia: { fn: hipotermiaC, params: { postura: ['saltar', 'help', 'grupo', 'atender'] }, ejemplo: { tipo: 'hipotermia', postura: 'help' } },
  balsa: { fn: balsaC, params: { vista: ['zafa', 'inflado', 'adrizar', 'lanzar'], resaltar: ['contenedor', 'zafa', 'trinca', 'boza', 'union-debil'] }, ejemplo: { tipo: 'balsa', vista: 'zafa' } },
  helicoptero: { fn: helicopteroC, params: { vista: ['rumbo', 'cable', 'senales'] }, ejemplo: { tipo: 'helicoptero', vista: 'rumbo' } },
  arnes: { fn: arnesC, params: { vista: ['chaleco', 'arnes'], resaltar: [...PARTES_CHALECO, ...PARTES_ARNES] }, ejemplo: { tipo: 'arnes', vista: 'chaleco' } },
};
