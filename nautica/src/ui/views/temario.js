// Temario: #/<tit>/temario (lista de temas) y #/<tit>/temario/<ut> (página de un tema: clases,
// preguntas de examen y material de apoyo). Une lo que antes eran «Curso» y «Teoría».

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { estadoLeccion } from '../../course/engine.js';
import { estadoTema, TANDA } from '../../course/plan.js';
import { bloque, bloquesEnOrden } from '../../theory/blocks.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { calcularPlan } from '../cierre.js';

const ESTADO_TXT = { nueva: 'sin empezar', empezada: 'a medias', repasar: 'toca repasar', dominada: 'aprendida' };
const ESTADO_CLS = { dominada: 'ok', repasar: 'warn', empezada: 'close' };

/** Línea de estado de un tema (§4.2): nunca «0 %» ni porcentajes con pocos datos. */
export function lineaEstado(e) {
  switch (e.estado) {
    case 'sin-empezar': return 'Sin empezar';
    case 'bien': return `Vas bien · ${e.pct} %`;
    case 'repasar': return `Conviene repasar · ${e.pct} %`;
    default: return e.hechas ? `En marcha · ${e.hechas} preguntas hechas` : 'En marcha';
  }
}
const ESTADO_TEMA_CLS = { bien: 'ok', repasar: 'warn' };

// ---------------------------------------------------------------------------
// #/<tit>/temario

export function temarioView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.temario', h('h1', `Temario del ${T.sigla}`), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA temario ${T.sigla} (cargando)`;
  calcularPlan(progress, tit).then((d) => {
    const hoyUt = d.plan[0]?.ut ?? null;
    const filas = bloquesEnOrden(T.estructura).map((b) => ({ b, e: estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora) }));
    summaryText = `VISTA temario ${T.sigla}\n${filas.map(({ b, e }) => `${b.ut} ${b.titulo}: examen ${b.n}${b.maxErrores != null ? ` (máx ${b.maxErrores} err)` : ''} · ${e.estado} · hechas ${e.hechas}/${e.total} · acierto ${e.pct ?? '—'}${e.clases.total ? ` · clases ${e.clases.vistas}/${e.clases.total}` : ''}${b.ut === hoyUt ? ' · HOY TOCA' : ''}`).join('\n')}` +
      `\nRUTAS: #/${tit}/temario/<n> tema · #/${tit}/teoria/ut/<n>?s=<semilla>[&f=1] tanda de ${TANDA} preguntas`;
    setChildren(el,
      h('h1', `Temario del ${T.sigla}`),
      h('p.muted', 'En el orden en que te recomendamos estudiarlo: primero lo que más pesa en el examen y más práctica pide.'),
      h('div.lista-temas', filas.map(({ b, e }) => h('a.card.tema-card', { href: tlink(tit, ['temario', String(b.ut)]) },
        b.ut === hoyUt ? h('span.badge.hoy-toca', 'Hoy toca') : null,
        h('h3', `${b.icon} ${b.titulo}`),
        h('p', `Tema ${b.ut} del temario oficial · ${b.n} preguntas en el examen${b.maxErrores != null ? ` · ¡ojo!, solo se pueden fallar ${b.maxErrores}` : ''}`),
        h('p.estado-linea', { class: ESTADO_TEMA_CLS[e.estado] ?? '' }, lineaEstado(e)),
        e.hechas ? h('div.bar', h('span', { style: `width:${Math.round(100 * Math.min(1, e.hechas / e.total))}%` })) : null))),
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
  calcularPlan(progress, tit).then((d) => {
    const m = d.curso?.modulos?.find((x) => x.ut === ut);
    const clases = (m?.lecciones ?? []).map((l) => ({ l, e: estadoLeccion(l, d.regs[l.id], d.respuestas, d.ahora) }));
    const e = estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
    const aMedias = clases.find((c) => c.e.estado === 'empezada');
    const nueva = clases.find((c) => c.e.estado === 'nueva');
    const tanda = tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed() });
    const principal = aMedias ? h('a.btn.grande', { href: tlink(tit, ['curso', aMedias.l.id]) }, `Continuar: ${aMedias.l.titulo}`)
      : nueva ? h('a.btn.grande', { href: tlink(tit, ['curso', nueva.l.id]) }, `Empezar: ${nueva.l.titulo}`)
        : h('a.btn.grande', { href: tanda }, `Hacer ${TANDA} preguntas`);
    summaryText = `VISTA tema ${T.sigla} ${b.titulo} · examen ${b.n}${b.maxErrores != null ? ` (máx ${b.maxErrores} err)` : ''} · ${e.estado} · hechas ${e.hechas}/${e.total} · fallos pendientes ${e.fallos}\n` +
      clases.map(({ l, e: x }) => `CLASE ${l.id} ${l.titulo}: ${x.estado} → #/${tit}/curso/${l.id}`).join('\n');
    setChildren(el,
      volver('Temario', tlink(tit, ['temario'])),
      h('h1', `${b.icon} ${b.titulo}`),
      m?.intro ? h('p', m.intro) : null,
      principal,
      clases.length ? h('section', h('h2', 'Clases'), h('ol.clases', clases.map(({ l, e: x }) => h('li', h('a.clase', { href: tlink(tit, ['curso', l.id]) },
        h('span.clase-titulo', l.titulo),
        h('span.clase-meta', h('span.muted', `${l.minutos ?? 10} min`), h('span.estado', { class: ESTADO_CLS[x.estado] ?? '' }, ESTADO_TXT[x.estado]))))))) : null,
      h('section', h('h2', 'Preguntas de examen'),
        e.hechas ? h('p', `${e.hechas} de ${e.total} hechas`) : null,
        h('div.actions',
          h('a.btn.secondary', { href: tanda }, `Hacer ${TANDA} preguntas`),
          e.fallos ? h('a.btn.secondary', { href: tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed(), f: '1' }) }, `Repasar mis fallos (${e.fallos})`) : null)),
      ut === T.cartaUt ? h('a.card', { href: tlink(tit, ['carta']) }, h('h3', '🗺️ Ejercicios de carta'), h('p', 'Practica cada tipo de ejercicio sobre la carta del Estrecho.')) : null,
      h('section', h('h2', 'Para ayudarte'),
        h('div.cards',
          h('a.card', { href: tlink(tit, ['laminas']) }, h('h3', '🎞️ Láminas')),
          h('a.card', { href: link(['reglas']) }, h('h3', '🧠 Reglas para recordar')),
          ut === T.cartaUt ? h('a.card', { href: link(['conceptos']) }, h('h3', '📘 Conceptos de carta')) : null)),
    );
  }).catch((err) => setChildren(el, h('p.warn', `No se pudo cargar el tema: ${err.message}`)));
  return { el, summary: () => summaryText };
}
