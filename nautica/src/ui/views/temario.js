// Temario: #/<tit>/temario (lista de temas) y #/<tit>/temario/<ut> (página de un tema: clases,
// preguntas de examen y material de apoyo). Une lo que antes eran «Curso» y «Teoría».

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { loadCourse, loadTheoryBank } from '../../store/datasets.js';
import { estadoLeccion } from '../../course/engine.js';
import { bloque } from '../../theory/blocks.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { blockStats } from './theory.js';

const ESTADO_TXT = { nueva: 'sin empezar', empezada: 'a medias', repasar: 'toca repasar', dominada: 'aprendida' };
const ESTADO_CLS = { dominada: 'ok', repasar: 'warn', empezada: 'close' };

// ---------------------------------------------------------------------------
// #/<tit>/temario

export function temarioView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.temario', h('h1', `Temario del ${T.sigla}`), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA temario ${T.sigla} (cargando)`;
  loadTheoryBank(tit).then(({ preguntas }) => {
    const statsFor = blockStats(preguntas, progress);
    const filas = T.estructura.bloques.map((b) => ({ b, s: statsFor(b.ut) }));
    summaryText = `VISTA temario ${T.sigla}\n${filas.map(({ b, s }) => `${b.ut} ${b.titulo}: examen ${b.n} · hechas ${s.hechas}/${s.total} · aciertos ${s.ok}`).join('\n')}`;
    setChildren(el,
      h('h1', `Temario del ${T.sigla}`),
      h('div.lista-temas', filas.map(({ b, s }) => h('a.card.tema-card', { href: tlink(tit, ['temario', String(b.ut)]) },
        h('h3', `${b.icon} ${b.titulo}`),
        h('p', `${b.n} preguntas en el examen${b.maxErrores != null ? ` · ¡ojo!, solo se pueden fallar ${b.maxErrores}` : ''}`),
        h('p.estado-linea', s.hechas ? `En marcha · ${s.hechas} preguntas hechas` : 'Sin empezar'),
        s.hechas ? h('div.bar', h('span', { style: `width:${Math.round((100 * s.hechas) / s.total)}%` })) : null))),
      h('details', h('summary', 'Reglas del examen'), h('ul', T.reglas.map((r) => h('li', r)))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/<tit>/temario/<ut>

export function temaView({ progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const ut = Number(route.parts[1]);
  const b = bloque(T.estructura, ut);
  if (!b) return { el: h('div.tema', volver('Temario', tlink(tit, ['temario'])), h('p', 'Este tema no existe.')), summary: () => 'ERROR tema no encontrado' };
  const el = h('div.tema', volver('Temario', tlink(tit, ['temario'])), h('h1', `${b.icon} ${b.titulo}`), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA tema ${T.sigla} ${b.titulo} (cargando)`;
  Promise.all([loadCourse(tit), loadTheoryBank(tit)]).then(([curso, { preguntas }]) => {
    const resp = progress.get().exams;
    const regs = progress.lecciones();
    const m = curso?.modulos?.find((x) => x.ut === ut);
    const clases = (m?.lecciones ?? []).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], resp) }));
    const s = blockStats(preguntas, progress)(ut);
    const fallos = preguntas.filter((q) => q.ut === ut && resp[q.id] && !resp[q.id].ok).length;
    const aMedias = clases.find((c) => c.e.estado === 'empezada');
    const nueva = clases.find((c) => c.e.estado === 'nueva');
    const tanda = tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed() });
    const principal = aMedias ? h('a.btn.grande', { href: tlink(tit, ['curso', aMedias.l.id]) }, `Continuar: ${aMedias.l.titulo}`)
      : nueva ? h('a.btn.grande', { href: tlink(tit, ['curso', nueva.l.id]) }, `Empezar: ${nueva.l.titulo}`)
        : h('a.btn.grande', { href: tanda }, 'Hacer 10 preguntas');
    summaryText = `VISTA tema ${T.sigla} ${b.titulo} · examen ${b.n}${b.maxErrores != null ? ` (máx ${b.maxErrores} err)` : ''} · hechas ${s.hechas}/${s.total} · fallos pendientes ${fallos}\n` +
      clases.map(({ l, e }) => `CLASE ${l.id} ${l.titulo}: ${e.estado}`).join('\n');
    setChildren(el,
      volver('Temario', tlink(tit, ['temario'])),
      h('h1', `${b.icon} ${b.titulo}`),
      m?.intro ? h('p', m.intro) : null,
      principal,
      clases.length ? h('section', h('h2', 'Clases'), h('ol.clases', clases.map(({ l, e }) => h('li', h('a.clase', { href: tlink(tit, ['curso', l.id]) },
        h('span.clase-titulo', l.titulo), h('span.clase-meta', h('span.muted', `${l.minutos ?? 10} min`), h('span.estado', { class: ESTADO_CLS[e.estado] ?? '' }, ESTADO_TXT[e.estado]))))))) : null,
      h('section', h('h2', 'Preguntas de examen'),
        s.hechas ? h('p', `${s.hechas} de ${s.total} hechas`) : null,
        h('div.actions', h('a.btn.secondary', { href: tanda }, 'Hacer 10 preguntas'),
          fallos ? h('a.btn.secondary', { href: tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed(), f: '1' }) }, `Repasar mis fallos (${fallos})`) : null)),
      ut === T.cartaUt ? h('a.card', { href: tlink(tit, ['carta']) }, h('h3', '🗺️ Ejercicios de carta'), h('p', 'Practica cada tipo de ejercicio sobre la carta del Estrecho.')) : null,
      h('section', h('h2', 'Para ayudarte'),
        h('div.cards',
          h('a.card', { href: tlink(tit, ['laminas']) }, h('h3', '🎞️ Láminas')),
          h('a.card', { href: link(['reglas']) }, h('h3', '🧠 Reglas para recordar')),
          ut === T.cartaUt ? h('a.card', { href: link(['conceptos']) }, h('h3', '📘 Conceptos de carta')) : null)),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar el tema: ${e.message}`)));
  return { el, summary: () => summaryText };
}
