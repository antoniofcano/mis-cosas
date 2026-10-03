// #/<tit>/temario/<ut>/chuleta — chuleta de un tema para imprimir (B6): de cada clase, su chuleta (fórmulas y
// datos clave), las reglas para recordar y las trampas. Todo sale del curso; sin contenido nuevo.

import { h, setChildren } from '../dom.js';
import { loadCourse, loadMnemonics } from '../../store/datasets.js';
import { bloque } from '../../theory/blocks.js';
import { temasDePocoPeso } from '../../course/calendario.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { rich } from './curso.js';

/** Contenido de la chuleta de un tema, sin DOM: por clase, sus puntos clave, reglas y trampas. */
export function contenidoChuleta(curso, ut, reglas = new Map()) {
  const m = curso?.modulos?.find((x) => x.ut === ut);
  return (m?.lecciones ?? []).map((l) => ({
    id: l.id,
    titulo: l.titulo,
    claves: l.chuleta ?? [],
    reglas: l.pasos.filter((p) => p.tipo === 'regla' && reglas.has(p.id)).map((p) => reglas.get(p.id)),
    trampas: l.pasos.filter((p) => p.tipo === 'ojo' && p.texto).map((p) => p.texto),
  })).filter((c) => c.claves.length || c.reglas.length || c.trampas.length);
}

export function chuletaView({ tit, params: route, progress = null }) {
  const T = TITULACIONES[tit];
  const ut = Number(route.parts[1]);
  const b = bloque(T.estructura, ut);
  const cuerpo = h('div', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA chuleta ${T.sigla} tema ${ut}`;
  const el = h('div.chuleta-tema',
    h('div.no-imprimir', volver(b?.titulo ?? 'Tema', tlink(tit, ['temario', String(ut)])),
      h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-trampas', !ev.target.checked) }), 'Incluir las trampas'),
      h('button.secondary', { type: 'button', onclick: () => window.print() }, '🖨️ Imprimir')),
    h('h1', `${b?.icon ?? ''} ${b?.titulo ?? 'Tema'} · chuleta ${T.sigla}`),
    cuerpo);
  Promise.all([loadCourse(tit), loadMnemonics()]).then(([curso, mnemo]) => {
    const clases = contenidoChuleta(curso, ut, new Map(mnemo.reglas.map((r) => [r.id, r])));
    if (!clases.length) { setChildren(cuerpo, h('p', 'Este tema aún no tiene chuleta.')); return; }
    // En el plan esencial, la chuleta de un tema de poco peso es una tarea del plan: se marca como leída.
    const enPlan = progress?.settings()[`planEsencial_${tit}`] && temasDePocoPeso(T.estructura).includes(ut);
    const clave = `chuletasLeidas_${tit}`;
    const leida = () => (progress.settings()[clave] ?? []).includes(ut);
    const marca = enPlan ? h('div.no-imprimir.chuleta-leida') : null;
    const pintaMarca = () => marca && setChildren(marca, leida()
      ? h('p.ok', '✅ Leída: cuenta en tu plan. ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan'))
      : h('button.grande', { type: 'button', onclick: () => { progress.setSetting(clave, [...(progress.settings()[clave] ?? []), ut]); pintaMarca(); } }, '✓ Ya la he leído'));
    pintaMarca();
    setChildren(cuerpo, clases.map((c) => h('section.chuleta-clase',
      h('h2', c.titulo),
      c.claves.length ? h('ul', c.claves.map((x) => h('li', rich(x)))) : null,
      c.reglas.map((r) => h('p.chuleta-regla', h('strong', `🧠 ${r.regla}`), ` — ${r.significado}`)),
      c.trampas.map((t) => h('div.chuleta-trampa', h('strong', '⚠️ Trampa: '), rich(t))))));
    if (marca) cuerpo.append(marca);
    summaryText = `VISTA chuleta ${T.sigla} ${b?.titulo}\n${clases.map((c) => `## ${c.titulo}\n${c.claves.join('\n')}${c.reglas.map((r) => `\nREGLA: ${r.regla} — ${r.significado}`).join('')}${c.trampas.map((t) => `\nTRAMPA: ${t}`).join('')}`).join('\n')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la chuleta: ${e.message}`)));
  return { el, summary: () => summaryText };
}
