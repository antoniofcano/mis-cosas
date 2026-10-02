// Panel de una titulación (#/<tit>) y ejercicios de carta de una titulación (#/<tit>/carta).

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { exercisesByCategory, EXERCISES } from '../../exercises/registry.js';
import { loadTheoryBank } from '../../store/datasets.js';
import { convocatorias } from '../../theory/engine.js';
import { totalPreguntas } from '../../theory/blocks.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { blockStats } from './theory.js';

// ---------------------------------------------------------------------------
// #/<tit> — panel de la titulación

const ESTADO = (p) => (p == null ? ['', 'sin datos'] : p >= 80 ? ['ok', 'bien'] : p >= 60 ? ['close', 'repasar'] : ['warn', 'flojo']);

export function dashboardView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const E = T.estructura;
  const cartaEx = EXERCISES.filter((e) => e.levels.includes(T.nivel));
  const cartaHechos = cartaEx.reduce((n, e) => n + progress.stats(e.id).attempts, 0);
  const body = h('div', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA panel ${T.sigla}`;

  const el = h('div.dashboard',
    h('header.tit-head', h('div.tit-icon', T.icon), h('div', h('h1', `${T.sigla} · ${T.nombre}`), h('p.muted', T.resumen))),
    body,
  );

  loadTheoryBank(T.id).then(({ preguntas, explicaciones }) => {
    const statsFor = blockStats(preguntas, progress);
    const convs = convocatorias(E, preguntas);
    const tests = progress.tests().filter((t) => (t.tit ?? 'per') === T.id);
    const last = tests.at(-1);
    const filas = E.bloques.map((b) => {
      const s = statsFor(b.ut);
      const p = s.hechas ? Math.round((100 * s.ok) / s.hechas) : null;
      return { b, s, p };
    });
    const hechas = filas.reduce((n, f) => n + f.s.hechas, 0);
    const oks = filas.reduce((n, f) => n + f.s.ok, 0);
    // Siguiente paso: el bloque más flojo (con límite de errores primero) o el primero sin empezar
    const flojo = filas.filter((f) => f.p != null && f.p < 80).sort((a, b) => (a.p - (a.b.maxErrores != null ? 10 : 0)) - (b.p - (b.b.maxErrores != null ? 10 : 0)))[0]
      ?? filas.find((f) => f.p == null);

    summaryText = `VISTA panel ${T.sigla} · ${preguntas.length} preguntas reales · ${convs.length} convocatorias · explicaciones ${Object.keys(explicaciones).length}\n` +
      filas.map((f) => `UT${f.b.ut} ${f.b.titulo}: examen ${f.b.n}${f.b.maxErrores != null ? ` (máx ${f.b.maxErrores} err)` : ''} · hechas ${f.s.hechas}/${f.s.total} · acierto ${f.p ?? '—'}%`).join('\n') +
      `\nÚLTIMO EXAMEN: ${last ? `${last.titulo} ${last.aciertos}/${last.total} ${last.apto ? 'APTO' : 'NO APTO'}` : '—'}`;

    setChildren(body,
      h('div.paths',
        h('a.path', { href: tlink(T.id, ['temario']) },
          h('h2', '🎓 Curso'), h('p', 'Clases cortas por bloques: concepto, dibujos, reglas para recordar y práctica con preguntas reales. Se adapta a lo que fallas.'),
          h('p.big', 'Empieza la clase')),
        h('a.path', { href: tlink(T.id, ['temario']) },
          h('h2', '📚 Teoría'), h('p', `${E.bloques.length} bloques · ${preguntas.length} preguntas reales con el profe`),
          h('p.big', hechas ? `${oks}/${hechas} ✓` : 'Empieza por aquí'),
          h('div.bar', h('span', { style: `width:${preguntas.length ? Math.round((100 * hechas) / preguntas.length) : 0}%` }))),
        h('a.path', { href: tlink(T.id, ['carta']) },
          h('h2', '🗺️ Carta'), h('p', `${cartaEx.length} tipos de ejercicio con datos nuevos cada vez, tutorial sobre la carta y profe`),
          h('p.big', cartaHechos ? `${cartaHechos} ejercicios hechos` : 'Practica la carta')),
        h('a.path', { href: tlink(T.id, ['examenes']) },
          h('h2', '📝 Exámenes'), h('p', `Simulacros de ${totalPreguntas(E)} preguntas y ${convs.length} exámenes reales completos`),
          h('p.big', last ? `${last.apto ? '✅' : '❌'} ${last.aciertos}/${last.total}` : 'Ponte a prueba'))),
      flojo ? h('p.next', '👉 Siguiente paso: ', h('a', { href: tlink(T.id, ['teoria', 'ut', String(flojo.b.ut)], { s: randomSeed() }) },
        flojo.p == null ? `empieza el bloque ${flojo.b.icon} ${flojo.b.titulo}` : `repasa ${flojo.b.icon} ${flojo.b.titulo} (${flojo.p} % de acierto)`)) : null,
      h('h2', 'Cómo vas por bloques'),
      h('table.stats', h('thead', h('tr', h('th', 'Bloque'), h('th', 'En el examen'), h('th', 'Practicadas'), h('th', 'Acierto'), h('th', 'Estado'))),
        h('tbody', filas.map(({ b, s, p }) => {
          const [cls, txt] = ESTADO(p);
          return h('tr',
            h('td', h('a', { href: tlink(T.id, ['teoria', 'ut', String(b.ut)], { s: randomSeed() }) }, `${b.icon} ${b.titulo}`)),
            h('td', `${b.n}${b.maxErrores != null ? ` · máx. ${b.maxErrores} err.` : ''}`),
            h('td', `${s.hechas}/${s.total}`), h('td', p == null ? '—' : `${p} %`), h('td', h('span.estado', { class: cls }, txt)));
        }))),
      h('details', h('summary', `Reglas del examen ${T.sigla}`), h('ul', T.reglas.map((r) => h('li', r)))),
    );
  }).catch((e) => setChildren(body, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));

  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/<tit>/carta — ejercicios prácticos de carta por tipo

export function cartaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const cats = exercisesByCategory(T.nivel);
  const lines = [];
  const reales = T.id === 'per'
    ? h('a.card', { href: link(['examenes', 'andalucia-per.json']) }, h('h3', '📄 Preguntas reales de carta'), h('p', 'Las 72 preguntas de carta (42–45) de los exámenes del PER, resueltas paso a paso sobre la carta.'))
    : h('a.card', { href: tlink(T.id, ['teoria', 'ut', String(T.cartaUt)], { s: randomSeed() }) }, h('h3', '📄 Preguntas reales de carta'), h('p', 'Las preguntas 11–20 del módulo de navegación (carta, mareas y loxodrómica) de los exámenes del PY.'));
  const el = h('div.home',
    volver('Tema', tlink(T.id, ['temario', String(T.cartaUt)])),
    h('h1', `🗺️ Carta de navegación · ${T.sigla}`),
    h('p', 'Cada tipo de ejercicio con datos nuevos cada vez sobre la carta del Estrecho (L105). Compruebas tus respuestas, pides pistas, ves la construcción en la carta y el tutorial te lo resuelve como en el examen, con el profe explicándolo.'),
    h('div.cards',
      h('a.card', { href: link(['mesa']) }, h('h3', '🧰 Mesa de cartas libre'), h('p', 'La carta con todos los instrumentos para trazar a tu aire.')),
      reales),
    cats.map((c) => h('section.category',
      h('h2', `${c.icon} ${c.title}`),
      h('p.muted', c.blurb),
      h('div.cards', c.exercises.map((e) => {
        const st = progress.stats(e.id);
        lines.push(`${e.id}: ${e.title} [${e.levels.join('/')}] intentos=${st.attempts} aciertos=${st.correct}`);
        return h('a.card', { href: link(['ej', e.id]) },
          h('h3', e.title),
          h('p', e.summary),
          h('div.meta',
            h('span.diff', { title: 'Dificultad' }, '●'.repeat(e.difficulty) + '○'.repeat(3 - e.difficulty)),
            st.attempts ? h('span.stat', `${st.correct}/${st.attempts} ✓`) : null));
      })))),
  );
  return { el, summary: () => `VISTA carta ${T.sigla}\nTIPOS DE EJERCICIO:\n${lines.join('\n')}\nRUTAS: #/ej/<id>?s=<semilla> · #/mesa` };
}
