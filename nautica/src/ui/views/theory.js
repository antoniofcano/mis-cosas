// Vistas de teoría y exámenes de una titulación (PER, PY…):
//   #/<tit>/teoria/ut/<n>     práctica por bloque (corrección inmediata + profe)
//   #/<tit>/examenes          simulacro y exámenes reales completos
//   #/<tit>/test/simulacro    #/<tit>/test/real/<convocatoria>   cronometrados, corrección oficial y revisión con el profe

import { h, setChildren, copyText } from '../dom.js';
import { link } from '../router.js';
import { loadTheoryBank } from '../../store/datasets.js';
import { bloque, totalPreguntas } from '../../theory/blocks.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { buildSimulacro, buildReal, buildPractica, convocatorias, grade } from '../../theory/engine.js';
import { narrateTheory } from '../../teacher/theory.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { voice } from '../voice.js';
import { illustrationEls } from '../illustration.js';
import { createKit } from '../../exams/kit.js';
import cartaSolutions from '../../exams/solutions/andalucia-per.js';
import { narrateSteps } from '../../teacher/narrate.js';

let chartRef = null;
/** Explicación de una pregunta: la redactada para teoría o, en las de carta, la resolución calculada. */
function explanationFor(q, explicaciones) {
  if (explicaciones[q.id]) return explicaciones[q.id];
  const sol = T.id === 'per' && q.ut === 11 && chartRef && cartaSolutions[q.id];
  if (!sol) return null;
  try {
    const k = createKit(chartRef);
    sol.solve(k);
    const n = narrateSteps(k.steps, { seed: q.id });
    return { explicacion: k.steps.map((st, i) => `${i + 1}. ${n[i].intro} ${st.text}`).join(' '), clave: n.find((x) => x.tip)?.tip };
  } catch {
    return null;
  }
}

let T = TITULACIONES.per;
let E = T.estructura;
/** Fija la titulación de la vista (una vista activa a la vez). */
function useTit(tit) {
  T = TITULACIONES[tit] ?? TITULACIONES.per;
  E = T.estructura;
}
const imgSrc = (p) => new URL(`../../../data/exams/${p}`, import.meta.url).href;

// ---------------------------------------------------------------------------
// Componente: una pregunta tipo test

/**
 * @param {object} q
 * @param {{ chosen?: string, reveal?: boolean, onChoose?: (letter) => void, expl?: object, number?: number }} o
 */
export function questionCard(q, o = {}) {
  const b = bloque(E, q.ut);
  const opts = Object.entries(q.opciones ?? {}).map(([k, v]) => {
    const cls = !o.reveal ? '' : k === q.correcta ? 'correct' : k === o.chosen ? 'wrong' : '';
    const fig = q.opciones_figuras?.[k];
    return h('label.option', { class: cls },
      h('input', { type: 'radio', name: `q-${q.id}`, value: k, checked: o.chosen === k, disabled: o.reveal && o.lock, onchange: () => o.onChoose?.(k) }),
      h('span', h('strong', `${k}) `), v, fig ? h('img.qfig.opt', { src: imgSrc(fig), alt: `Figura de la opción ${k}`, loading: 'lazy' }) : null));
  });
  return h('article.qcard',
    h('div.qmeta', o.number ? h('span.badge', `${o.number}`) : null, b ? h('span.badge.muted', `${b.icon} ${b.titulo}`) : null,
      h('span.muted.small', [q.convocatoria, q.modulo ? `módulo ${q.modulo === 'generico' ? 'genérico' : 'de navegación'}` : null, q.bloque && q.bloque !== 'carta' ? ({ loxodromica: 'loxodrómica' }[q.bloque] ?? q.bloque) : null].filter(Boolean).join(' · ')), q.anulada ? h('span.badge.warn', 'Anulada') : null),
    q.contexto ? h('pre.qcontext', q.contexto) : null,
    h('p.qtext', q.enunciado),
    (q.figuras ?? []).map((f) => (/tabla-mareas/.test(f)
      ? h('details.qtable', h('summary', '📊 Tabla para calcular la altura de la marea'), h('img.qfig.wide', { src: imgSrc(f), alt: 'Tabla de corrección de la altura de la marea', loading: 'lazy' }))
      : h('img.qfig', { src: imgSrc(f), alt: 'Figura de la pregunta', loading: 'lazy' }))),
    h('div.options', opts),
  );
}

let reglasDe = () => [];

/** Prepara el contexto compartido (titulación, carta y reglas) para usar las tarjetas fuera de estas vistas. */
export function prepareTheory({ tit, chart, reglas }) {
  useTit(tit);
  if (chart) chartRef = chart;
  if (reglas) reglasDe = reglas;
}

export { explanationFor };

/** Panel del profe para una pregunta respondida. */
export function profePanel(q, expl, chosen) {
  const n = narrateTheory(q, expl, chosen, reglasDe(q.id));
  const ok = q.anulada || chosen === q.correcta;
  return h('div.profe', { class: chosen == null ? '' : ok ? 'ok-border' : 'bad-border' },
    h('span.profe-badge', '👨‍🏫 El profe'),
    voice.supported ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, '🔊') : null,
    n.display.map((line) => h('p', { class: /^💡/.test(line) ? 'tip' : /^⚠️/.test(line) ? 'trap' : /^🧠/.test(line) ? 'mnemo' : '' }, line)),
    expl?.ilustraciones ? h('div.il-grid.inline', illustrationEls(expl.ilustraciones)) : null,
    T.id === 'per' && q.ut === 11 ? h('p', h('a.btn.secondary', { href: link(['examenes', 'andalucia-per.json', q.id]) }, '🗺️ Ver la resolución en la carta')) : null,
  );
}

// ---------------------------------------------------------------------------
// Estadísticas de lo respondido por bloque (práctica y tests)

export function blockStats(preguntas, progress) {
  const answered = progress.get().exams;
  return (ut) => {
    const qs = preguntas.filter((q) => q.ut === ut);
    const done = qs.filter((q) => answered[q.id]);
    return { total: qs.length, hechas: done.length, ok: done.filter((q) => answered[q.id].ok).length };
  };
}

const pct = (s) => (s.hechas ? Math.round((100 * s.ok) / s.hechas) : null);

// ---------------------------------------------------------------------------
// #/<tit>/examenes — simulacros y exámenes reales completos

export function examenesView({ ctx, progress, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const el = h('div.theory-hub', h('p.muted', 'Cargando exámenes…'));
  let summaryText = `VISTA exámenes ${T.sigla} (cargando)`;
  loadTheoryBank(T.id).then(({ preguntas }) => {
    const convs = convocatorias(E, preguntas);
    const tests = progress.tests().filter((t) => (t.tit ?? 'per') === T.id).slice(-8).reverse();
    summaryText = `VISTA exámenes ${T.sigla} · ${convs.length} convocatorias\n${convs.map((c) => `${c.key}: ${c.titulo} (${c.n} preguntas)`).join('\n')}` +
      `\nRUTAS: #/${T.id}/test/simulacro?s=<semilla> · #/${T.id}/test/real/<convocatoria>`;
    setChildren(el,
      h('h1', `📝 Exámenes · ${T.sigla}`),
      h('p', `${T.resumen}. Cronometrados, sin corrección hasta que entregues y corregidos con las reglas oficiales; después, revisión de las falladas con el profe.`),
      h('div.actions',
        h('a.btn', { href: tlink(T.id, ['test', 'simulacro'], { s: randomSeed() }) }, `🎯 Simulacro (${totalPreguntas(E)} preguntas, ${E.duracionMin} min)`)),
      tests.length ? h('section', h('h2', 'Tus últimos exámenes'), h('ul.small', tests.map((t) => h('li', `${new Date(t.t).toLocaleDateString('es-ES')} · ${t.titulo}: ${t.aciertos}/${t.total} ${t.apto == null ? '' : t.apto ? '✅ APTO' : '❌ NO APTO'}`)))) : null,
      h('h2', 'Exámenes reales completos'),
      h('p.muted', `Las preguntas de una convocatoria oficial de Andalucía, en su orden, con el tiempo y las reglas del examen.`),
      h('div.cards', convs.map((c) => {
        const hecho = progress.tests().filter((t) => t.conv === c.key).at(-1);
        return h('a.card', { href: tlink(T.id, ['test', 'real', c.key]) },
          h('h3', c.titulo ?? c.key),
          h('div.meta', h('span.stat', `${c.n} preguntas`), c.completa ? null : h('span.stat.warn', 'incompleto'),
            hecho ? h('span.stat', { class: hecho.apto ? 'ok' : 'warn' }, `${hecho.aciertos}/${hecho.total} ${hecho.apto ? '✅' : '❌'}`) : null));
      })),
      h('details', h('summary', `Reglas del examen ${T.sigla}`),
        h('ul', T.reglas.map((r) => h('li', r)), h('li', 'En la app, las preguntas en blanco cuentan como fallo y las anuladas por el tribunal como acierto.'))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/<tit>/teoria/ut/<n>?s=semilla — práctica por bloque, pregunta a pregunta

export function practiceView({ ctx, progress, params: route, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const ut = Number(route.parts[2]);
  const b = bloque(E, ut);
  const seed = Number(route.query.s) || randomSeed();
  const soloFalladas = route.query.f === '1';
  const el = h('div.practice', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA práctica UT${ut}`;
  if (!b) return { el: h('p', 'Bloque no encontrado.'), summary: () => 'ERROR bloque' };

  loadTheoryBank(T.id).then(({ preguntas, explicaciones, reglasDe: rd }) => {
    reglasDe = rd;
    const fails = new Set(Object.entries(progress.get().exams).filter(([, v]) => !v.ok).map(([k]) => k));
    const sesion = buildPractica(preguntas, ut, createRng(seed), { soloFalladas: soloFalladas ? fails : null });
    let i = 0;
    let ok = 0;
    let hechas = 0;
    const body = h('div');
    const score = h('span.badge');
    function show() {
      const q = sesion.preguntas[i];
      score.textContent = `${ok}/${hechas} ✓ · ${i + 1} de ${sesion.preguntas.length}`;
      if (!q) {
        setChildren(body, h('p.ok', `🎉 Bloque terminado: ${ok} aciertos de ${hechas}.`),
          h('div.actions', h('a.btn', { href: tlink(T.id, ['teoria', 'ut', String(ut)], { s: randomSeed() }) }, '🔄 Otra vuelta'),
            h('a.btn.secondary', { href: tlink(T.id, ['teoria', 'ut', String(ut)], { s: randomSeed(), f: '1' }) }, 'Solo las falladas'),
            h('a.btn.secondary', { href: tlink(T.id, ['temario', String(ut)]) }, 'Volver al tema')));
        summaryText = `VISTA práctica UT${ut} terminada: ${ok}/${hechas}`;
        return;
      }
      let answered = false;
      const feedback = h('div');
      const next = h('button', { type: 'button', hidden: true, onclick: () => { voice.stop(); i += 1; show(); } }, 'Siguiente →');
      const card = questionCard(q, {
        onChoose: (k) => {
          if (answered) return;
          answered = true;
          hechas += 1;
          const good = q.anulada || k === q.correcta;
          if (good) ok += 1;
          progress.recordExam(q.id, { choice: k, ok: good });
          card.replaceWith(questionCard(q, { chosen: k, reveal: true, lock: true }));
          setChildren(feedback, profePanel(q, explanationFor(q, explicaciones), k));
          score.textContent = `${ok}/${hechas} ✓ · ${i + 1} de ${sesion.preguntas.length}`;
          next.hidden = false;
          summaryText = practiceSummary(q, explanationFor(q, explicaciones), k);
        },
      });
      setChildren(body, card, feedback, h('div.actions', next,
        h('button.secondary', { type: 'button', onclick: () => { i += 1; show(); } }, 'No la sé')));
      summaryText = practiceSummary(q, explicaciones[q.id], null);
    }
    setChildren(el,
      barraActividad({ texto: b.titulo, onSalir: () => { location.hash = tlink(T.id); } }),
      h('header', h('h1', `${b.icon} ${b.titulo}`), h('div.badges', score, soloFalladas ? h('span.badge.warn', 'Solo falladas') : null)),
      sesion.preguntas.length ? body : h('p.muted', soloFalladas ? 'No tienes preguntas falladas en este bloque. 👏' : 'Aún no hay preguntas de este bloque.'),
    );
    if (sesion.preguntas.length) show();
  });
  return { el, summary: () => summaryText };
}

function practiceSummary(q, ex, chosen) {
  return [
    `PREGUNTA TEORÍA ${q.id} · UT${q.ut} · ${q.convocatoria ?? ''}`,
    `ENUNCIADO: ${q.enunciado}`,
    ...Object.entries(q.opciones ?? {}).map(([k, v]) => `  ${k}) ${v}`),
    `RESPUESTA ALUMNO: ${chosen ?? '(sin responder)'}`,
    `CORRECTA (plantilla oficial): ${q.anulada ? 'anulada' : q.correcta}`,
    ex?.explicacion ? `EXPLICACIÓN: ${ex.explicacion}` : '',
    ex?.clave ? `CLAVE: ${ex.clave}` : '',
  ].filter(Boolean).join('\n');
}

// ---------------------------------------------------------------------------
// #/<tit>/test/simulacro?s=…  y  #/<tit>/test/real/<convocatoria> — examen cronometrado

export function testView({ ctx, progress, params: route, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const tipo = route.parts[1];
  const el = h('div.test', h('p.muted', 'Preparando el examen…'));
  let summaryText = 'VISTA test (cargando)';
  let timer = 0;

  loadTheoryBank(T.id).then(({ preguntas, explicaciones, reglasDe: rd }) => {
    reglasDe = rd;
    const seed = Number(route.query.s) || randomSeed();
    const test = tipo === 'real' ? buildReal(preguntas, route.parts[2]) : buildSimulacro(E, preguntas, createRng(seed));
    if (!test.preguntas.length) { setChildren(el, h('p.warn', 'No hay preguntas para este examen.')); return; }
    const respuestas = {};
    const t0 = Date.now();
    const limite = E.duracionMin * 60 * 1000;
    const clock = h('span.clock');
    const answeredCount = h('span.badge');
    const nav = h('div.qnav');
    let entregado = false;

    const cards = test.preguntas.map((q, i) => {
      const holder = h('div.qholder', { id: `p${i + 1}` });
      setChildren(holder, questionCard(q, { number: i + 1, onChoose: (k) => { respuestas[q.id] = k; refreshNav(); } }));
      return holder;
    });
    function refreshNav() {
      answeredCount.textContent = `${Object.keys(respuestas).length}/${test.preguntas.length} respondidas`;
      setChildren(nav, test.preguntas.map((q, i) => h('a.qdot', { href: `#p${i + 1}`, class: respuestas[q.id] ? 'done' : '', onclick: (ev) => { ev.preventDefault(); cards[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, String(i + 1))));
      summaryText = `TEST EN CURSO · ${test.titulo} · ${Object.keys(respuestas).length}/${test.preguntas.length} respondidas (sin corregir: el alumno está haciendo el examen; no des respuestas)`;
    }
    function tick() {
      const rest = limite - (Date.now() - t0);
      if (rest <= 0) { clock.textContent = '⏰ 00:00'; finish(true); return; }
      const m = Math.floor(rest / 60000);
      const s = Math.floor((rest % 60000) / 1000);
      clock.textContent = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      clock.classList.toggle('warn', rest < 5 * 60000);
    }
    timer = setInterval(() => { if (!el.isConnected) { clearInterval(timer); return; } tick(); }, 1000);
    tick();

    function finish(porTiempo = false) {
      if (entregado) return;
      const sinResponder = test.preguntas.length - Object.keys(respuestas).length;
      if (!porTiempo && sinResponder && !confirm(`Te quedan ${sinResponder} preguntas sin responder (cuentan como fallo). ¿Entregar?`)) return;
      entregado = true;
      clearInterval(timer);
      const g = grade(E, test, respuestas);
      for (const d of g.detalle) if (d.respuesta) progress.recordExam(d.id, { choice: d.respuesta, ok: d.ok });
      progress.recordTest({ tit: T.id, conv: test.tipo === 'real' ? route.parts[2] : undefined, tipo: test.tipo, titulo: test.titulo, aciertos: g.aciertos, total: g.total, apto: g.apto, minutos: Math.round((Date.now() - t0) / 60000) });
      showResults(g, porTiempo);
    }

    function showResults(g, porTiempo) {
      summaryText = `RESULTADO ${test.titulo}: ${g.aciertos}/${g.total} ${g.apto == null ? '' : g.apto ? 'APTO' : 'NO APTO'}\n` +
        g.bloques.map((b) => `UT${b.ut} ${b.titulo}: ${b.aciertos}/${b.total}${b.maxErrores != null ? ` (máx. errores ${b.maxErrores})` : ''}`).join('\n') +
        `\nFALLADAS: ${g.detalle.filter((d) => !d.ok).map((d) => `${d.id} (marcó ${d.respuesta ?? '—'}, correcta ${d.correcta})`).join(', ')}`;
      const filtro = { value: 'falladas' };
      const review = h('div.review');
      const renderReview = () => setChildren(review, test.preguntas.map((q, i) => {
        const d = g.detalle[i];
        if (filtro.value === 'falladas' && d.ok) return null;
        return h('div.qholder', questionCard(q, { number: i + 1, chosen: d.respuesta, reveal: true, lock: true }), profePanel(q, explanationFor(q, explicaciones), d.respuesta));
      }));
      const filterSel = h('select', { onchange: (ev) => { filtro.value = ev.target.value; renderReview(); } },
        h('option', { value: 'falladas' }, 'Solo las falladas'), h('option', { value: 'todas' }, 'Todas'));
      renderReview();
      setChildren(el,
        h('header', h('h1', g.apto == null ? 'Resultado' : g.apto ? '✅ APTO' : '❌ NO APTO'),
          h('p', `${g.aciertos} aciertos de ${g.total}${porTiempo ? ' · se acabó el tiempo' : ''}.`),
          g.motivos.length ? h('ul.warn', g.motivos.map((m) => h('li', m))) : null),
        h('table.stats', h('thead', h('tr', h('th', 'Bloque'), h('th', 'Aciertos'), h('th', 'Errores'), h('th', 'Límite'))),
          h('tbody', g.bloques.map((b) => h('tr', { class: b.maxErrores != null && b.errores > b.maxErrores ? 'bad' : '' },
            h('td', `${b.icon} ${b.titulo}`), h('td', `${b.aciertos}/${b.total}`), h('td', String(b.errores)), h('td', b.maxErrores != null ? `máx. ${b.maxErrores}` : '—'))))),
        h('div.actions',
          h('a.btn', { href: tlink(T.id, ['test', 'simulacro'], { s: randomSeed() }) }, '🎯 Otro simulacro'),
          h('a.btn.secondary', { href: tlink(T.id, ['examenes']) }, 'Volver a Exámenes'),
          h('label', 'Revisar: ', filterSel)),
        h('h2', 'Revisión con el profe'),
        review,
      );
      window.scrollTo(0, 0);
    }

    refreshNav();
    setChildren(el,
      barraActividad({ texto: test.titulo, onSalir: () => { location.hash = tlink(T.id); } }),
      h('div.test-bar', h('strong', `${T.sigla} · ${test.titulo}`), clock, answeredCount,
        h('button', { type: 'button', onclick: () => finish(false) }, 'Terminar y corregir')),
      test.faltan.length ? h('p.warn.small', `Aviso: faltan preguntas en el banco para ${test.faltan.map((f) => bloque(E, f.ut)?.titulo ?? f.ut).join(', ')}; el simulacro no está completo.`) : null,
      nav,
      cards,
      h('div.actions', h('button', { type: 'button', onclick: () => finish(false) }, 'Terminar y corregir')),
      h('p.muted.small', 'Sin corrección hasta que entregues, como en el examen. En blanco cuenta como fallo.'),
    );
  });
  return { el, summary: () => summaryText };
}

export { copyText };
