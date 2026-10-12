// Segundas láminas para cinco lecciones del PER: cuándo es obligatorio izar el pabellón nacional (per-4-7), velocidad
// de gobierno, arrancada y rabeo (per-7-3), hélices gemelas y ciaboga con dos hélices (per-7-5), el achique en una vía
// de agua (per-8-5) y barómetros de mercurio y aneroide con la tendencia barométrica (per-9-1). Todas en estilo C.
// Funciones puras spec → { svg, caption }; las que tienen partes devuelven null con una parte desconocida.

import { dibujoAnimado } from '../animaciones/index.js';
import { pabellonObligatorioC, PABELLON } from '../per-cola-normativa-c.js';
import { gobiernoRabeoC } from '../per-final-c.js';
import { achiqueSentinaC, barometroTendenciaC, ACHIQUE, ZONAS_ACHIQUE, TENDENCIAS } from '../per-final-b-c.js';

export const LAMINAS = {
  'pabellon-obligatorio': {
    fn: pabellonObligatorioC,
    params: { resaltar: [...Object.keys(PABELLON), 'otras'] },
    ejemplo: { tipo: 'pabellon-obligatorio' },
  },
  'gobierno-rabeo': {
    fn: gobiernoRabeoC,
    params: { vista: ['gobierno', 'rabeo'], resaltar: ['gobierno', 'arrancada'] },
    ejemplo: { tipo: 'gobierno-rabeo', vista: 'gobierno' },
  },
  'ciaboga-dos-helices': {
    fn: dibujoAnimado, // animada, en estilo C: src/illustrations/animaciones/ciaboga-dos.js
    params: { banda: ['er', 'br'], resaltar: ['exterior', 'interior', 'ciaboga'] },
    ejemplo: { tipo: 'ciaboga-dos-helices', banda: 'er' },
  },
  'achique-sentina': {
    fn: achiqueSentinaC,
    params: { resaltar: [...ACHIQUE.map((a) => a[0]), ...ZONAS_ACHIQUE.map((z) => z[0])] },
    ejemplo: { tipo: 'achique-sentina' },
  },
  'barometro-tendencia': {
    fn: barometroTendenciaC,
    params: { vista: ['instrumentos', 'tendencia'], resaltar: ['mercurio', 'aneroide', ...TENDENCIAS.map((x) => x[0])] },
    ejemplo: { tipo: 'barometro-tendencia', vista: 'instrumentos' },
  },
};
