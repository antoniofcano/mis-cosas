// #/reglas — reglas nemotécnicas validadas, agrupadas por bloque, con su significado y sus fuentes.

import { h, setChildren } from '../dom.js';
import { loadMnemonics } from '../../store/datasets.js';
import { volver, tlink } from '../titulacion.js';
import { cuenta } from '../../texto.js';

const GRUPOS = [
  [/^PY UT1/, 'Patrón de Yate · Seguridad'], [/^PY UT2/, 'Patrón de Yate · Meteorología'], [/^PY UT3/, 'Patrón de Yate · Teoría de navegación'], [/^PY UT4/, 'Patrón de Yate · Carta'],
  [/UT1\b|Nomenclatura/, 'Nomenclatura'], [/UT5|Balizamiento/, 'Balizamiento'], [/UT6|RIPA/, 'Reglamento (RIPA)'],
  [/UT10|UT11|Carta|navegación/i, 'Navegación y carta'], [/UT9|Meteo/, 'Meteorología'], [/UT3|UT8|Seguridad|Emergencias/, 'Seguridad y emergencias'],
];
const grupo = (tema) => GRUPOS.find(([re]) => re.test(tema))?.[1] ?? 'Otras';

export function reglasView({ tit }) {
  const el = h('div.reglas', h('p.muted', 'Cargando…'));
  let summaryText = 'VISTA reglas nemotécnicas (cargando)';
  loadMnemonics().then(({ reglas }) => {
    const groups = new Map();
    for (const r of reglas) {
      const g = grupo(r.tema);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(r);
    }
    summaryText = `VISTA reglas nemotécnicas (${reglas.length})\n${reglas.map((r) => `${r.id}: ${r.regla}`).join('\n')}`;
    setChildren(el,
      volver('Biblioteca', tlink(tit, ['biblioteca'])),
      h('h1', '🧠 Reglas para recordar'),
      h('p', 'Comprobadas contra el reglamento y elegidas por ser útiles y fáciles de memorizar. El profe te las recuerda en las preguntas donde ayudan.'),
      [...groups].map(([g, rs]) => h('section', h('h2', g), rs.map((r) => h('details.mnemo-card',
        h('summary', r.regla),
        h('p', r.significado),
        r.preguntas?.length ? h('p.muted.small', `Te ayuda en ${cuenta(r.preguntas.length, 'pregunta')} de examen.`) : null,
        r.fuentes?.length ? h('p.small', 'Fuentes: ', r.fuentes.map((u, i) => [i ? ' · ' : '', h('a', { href: u, target: '_blank', rel: 'noopener' }, new URL(u).hostname.replace(/^www\./, ''))])) : null)))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las reglas: ${e.message}`)));
  return { el, summary: () => summaryText };
}
