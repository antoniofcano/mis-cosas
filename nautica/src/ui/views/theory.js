// Vistas de teoría: centro de bloques, práctica por bloque (corrección inmediata + profe),
// simulacro y examen real (cronometrados, corrección oficial y revisión con el profe).

import { h, setChildren, copyText } from '../dom.js';
import { link, navigate } from '../router.js';
import { loadTheoryBank } from '../../store/datasets.js';
import { PER, bloque } from '../../theory/blocks.js';
import { buildSimulacro, buildReal, buildPractica, convocatorias, grade } from '../../theory/engine.js';
import { narrateTheory } from '../../teacher/theory.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { voice } from '../voice.js';
import { createKit } from '../../exams/kit.js';
import cartaSolutions from '../../exams/solutions/andalucia-per.js';
import { narrateSteps } from '../../teacher/narrate.js';

let chartRef = null;
/** Explicación de una pregunta: la redactada para teoría o, en las de carta, la resolución calculada. */
function explanationFor(q, explicaciones) {
  if (explicaciones[q.id]) return explicaciones[q.id];
  const sol = q.ut === 11 && chartRef && cartaSolutions[q.id];
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

const E = PER;
const imgSrc = (p) => new URL(`../../../data/exams/${p}`, import.meta.url).href;

// ---------------------------------------------------------------------------
// Componente: una pregunta tipo test

/**
 * @param {object} q
 * @param {{ chosen?: string, reveal?: boolean, onChoose?: (letter) => void, expl?: object, number?: number }} o
 */
function questionCard(q, o = {}) {
  const b = bloque(E, q.ut);
  const opts = Object.entries(q.opciones ?? {}).map(([k, v]) => {
    const cls = !o.reveal ? '' : k === q.correcta ? 'correct' : k === o.chosen ? 'wrong' : '';
    const fig = q.opciones_figuras?.[k];
    return h('label.option', { class: cls },
      h('input', { type: 'radio', name: `q-${q.id}`, value: k, checked: o.chosen === k, disabled: o.reveal && o.lock, onchange: () => o.onChoose?.(k) }),
      h('span', h('strong', `${k}) `), v, fig ? h('img.qfig.opt', { src: imgSrc(fig), alt: `Figura de la opción ${k}`, loading: 'lazy' }) : null));
  });
  return h('article.qcard',
    h('div.qmeta', o.number ? h('span.badge', `${o.number}`) : null, b ? h('span.badge.muted', `${b.icon} UT${b.ut} ${b.titulo}`) : null,
      h('span.muted.small', q.convocatoria ?? ''), q.anulada ? h('span.badge.warn', 'Anulada') : null),
    h('p.qtext', q.enunciado),
    (q.figuras ?? []).map((f) => h('img.qfig', { src: imgSrc(f), alt: 'Figura de la pregunta', loading: 'lazy' })),
    h('div.options', opts),
  );
}

/** Panel del profe para una pregunta respondida. */
function profePanel(q, expl, chosen) {
  const n = narrateTheory(q, expl, chosen);
  const ok = q.anulada || chosen === q.correcta;
  return h('div.profe', { class: chosen == null ? '' : ok ? 'ok-border' : 'bad-border' },
    h('span.profe-badge', '👨‍🏫 El profe'),
    voice.supported ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, '🔊') : null,
    n.display.map((line) => h('p', { class: /^💡/.test(line) ? 'tip' : /^⚠️/.test(line) ? 'trap' : '' }, line)),
    q.ut === 11 ? h('p', h('a.btn.secondary', { href: link(['examenes', 'andalucia-per.json', q.id]) }, '🗺️ Ver la resolución en la carta')) : null,
  );
}

// ---------------------------------------------------------------------------
// #/teoria — centro de teoría

export function theoryHubView({ ctx, progress }) {
  chartRef = ctx.chart;
  const el = h('div.theory-hub', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA teoría (cargando)';
  loadTheoryBank().then(({ preguntas, explicaciones }) => {
    const answered = progress.get().exams;
    const statsFor = (ut) => {
      const qs = preguntas.filter((q) => q.ut === ut);
      const done = qs.filter((q) => answered[q.id]);
      return { total: qs.length, hechas: done.length, ok: done.filter((q) => answered[q.id].ok).length };
    };
    const convs = convocatorias(E, preguntas);
    const tests = progress.tests().slice(-5).reverse();
    summaryText = `VISTA teoría PER · ${preguntas.length} preguntas reales · ${Object.keys(explicaciones).length} explicaciones\n` +
      E.bloques.map((b) => { const s = statsFor(b.ut); return `UT${b.ut} ${b.titulo}: ${s.total} preguntas, hechas ${s.hechas}, acertadas ${s.ok}`; }).join('\n') +
      '\nRUTAS: #/teoria/ut/<n> · #/test/simulacro · #/test/real/<convocatoria>';
    setChildren(el,
      h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › Teoría'),
      h('h1', 'Teoría del PER'),
      h('p', `Preguntas reales de los exámenes de Andalucía (${convs.length} convocatorias), organizadas por bloques, con la respuesta de la plantilla oficial y la explicación del profe.`),
      h('div.actions',
        h('a.btn', { href: link(['test', 'simulacro'], { s: randomSeed() }) }, '🎯 Simulacro de examen (45 preguntas, 90 min)'),
        h('a.btn.secondary', { href: '#reales' }, '📄 Exámenes reales completos'),
        h('a.btn.secondary', { href: link(['conceptos']) }, '📘 Conceptos de carta')),
      tests.length ? h('section', h('h2', 'Tus últimos tests'), h('ul.small', tests.map((t) => h('li', `${new Date(t.t).toLocaleDateString('es-ES')} · ${t.titulo}: ${t.aciertos}/${t.total} ${t.apto == null ? '' : t.apto ? '✅ APTO' : '❌ NO APTO'}`)))) : null,
      h('h2', 'Practicar por bloques'),
      h('div.cards', E.bloques.map((b) => {
        const s = statsFor(b.ut);
        return h('a.card', { href: link(['teoria', 'ut', String(b.ut)], { s: randomSeed() }) },
          h('h3', `${b.icon} UT${b.ut} · ${b.titulo}`),
          h('p', `${b.n} preguntas en el examen${b.maxErrores != null ? ` · máximo ${b.maxErrores} errores` : ''}`),
          h('div.meta', h('span.stat', `${s.total} preguntas`), s.hechas ? h('span.stat', `${s.ok}/${s.hechas} ✓`) : h('span.stat.muted', 'sin empezar')));
      })),
      h('h2#reales', 'Exámenes reales completos'),
      h('p.muted', 'Las 45 preguntas de una convocatoria, en su orden, con el tiempo y las reglas del examen.'),
      h('div.cards', convs.map((c) => h('a.card', { href: link(['test', 'real', c.key]), 'aria-disabled': String(!c.completa) },
        h('h3', c.titulo ?? c.key), h('div.meta', h('span.stat', `${c.n} preguntas`), c.completa ? null : h('span.stat.warn', 'incompleto'))))),
      h('details', h('summary', 'Reglas del examen PER'),
        h('ul', h('li', '45 preguntas tipo test, 4 opciones, 90 minutos.'), h('li', 'Apto con al menos 32 aciertos (máximo 13 fallos).'),
          h('li', 'Además, como máximo: 5 errores en Reglamento (RIPA), 2 en Balizamiento y 2 en Carta de navegación.'),
          h('li', 'En la app, las preguntas en blanco cuentan como fallo y las anuladas por el tribunal como acierto.'))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/teoria/ut/<n>?s=semilla — práctica por bloque, pregunta a pregunta

export function practiceView({ ctx, progress, params: route }) {
  chartRef = ctx.chart;
  const ut = Number(route.parts[2]);
  const b = bloque(E, ut);
  const seed = Number(route.query.s) || randomSeed();
  const soloFalladas = route.query.f === '1';
  const el = h('div.practice', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA práctica UT${ut}`;
  if (!b) return { el: h('p', 'Bloque no encontrado.'), summary: () => 'ERROR bloque' };

  loadTheoryBank().then(({ preguntas, explicaciones }) => {
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
          h('div.actions', h('a.btn', { href: link(['teoria', 'ut', String(ut)], { s: randomSeed() }) }, '🔄 Otra vuelta'),
            h('a.btn.secondary', { href: link(['teoria', 'ut', String(ut)], { s: randomSeed(), f: '1' }) }, 'Solo las falladas'),
            h('a.btn.secondary', { href: '#/teoria' }, 'Volver a Teoría')));
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
        h('button.secondary', { type: 'button', onclick: () => { i += 1; show(); } }, 'Saltar')));
      summaryText = practiceSummary(q, explicaciones[q.id], null);
    }
    setChildren(el,
      h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › ', h('a', { href: '#/teoria' }, 'Teoría'), ` › UT${ut}`),
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
// #/test/simulacro?s=…  y  #/test/real/<convocatoria> — examen cronometrado

export function testView({ ctx, progress, params: route }) {
  chartRef = ctx.chart;
  const tipo = route.parts[1];
  const el = h('div.test', h('p.muted', 'Preparando el examen…'));
  let summaryText = 'VISTA test (cargando)';
  let timer = 0;

  loadTheoryBank().then(({ preguntas, explicaciones }) => {
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
      progress.recordTest({ tipo: test.tipo, titulo: test.titulo, aciertos: g.aciertos, total: g.total, apto: g.apto, minutos: Math.round((Date.now() - t0) / 60000) });
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
        h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › ', h('a', { href: '#/teoria' }, 'Teoría'), ` › ${test.titulo}`),
        h('header', h('h1', g.apto == null ? 'Resultado' : g.apto ? '✅ APTO' : '❌ NO APTO'),
          h('p', `${g.aciertos} aciertos de ${g.total}${porTiempo ? ' · se acabó el tiempo' : ''}.`),
          g.motivos.length ? h('ul.warn', g.motivos.map((m) => h('li', m))) : null),
        h('table.stats', h('thead', h('tr', h('th', 'Bloque'), h('th', 'Aciertos'), h('th', 'Errores'), h('th', 'Límite'))),
          h('tbody', g.bloques.map((b) => h('tr', { class: b.maxErrores != null && b.errores > b.maxErrores ? 'bad' : '' },
            h('td', `${b.icon} ${b.titulo}`), h('td', `${b.aciertos}/${b.total}`), h('td', String(b.errores)), h('td', b.maxErrores != null ? `máx. ${b.maxErrores}` : '—'))))),
        h('div.actions',
          h('a.btn', { href: link(['test', 'simulacro'], { s: randomSeed() }) }, '🎯 Otro simulacro'),
          h('a.btn.secondary', { href: '#/teoria' }, 'Volver a Teoría'),
          h('label', 'Revisar: ', filterSel)),
        h('h2', 'Revisión con el profe'),
        review,
      );
      window.scrollTo(0, 0);
    }

    refreshNav();
    setChildren(el,
      h('div.test-bar', h('strong', test.titulo), clock, answeredCount,
        h('button', { type: 'button', onclick: () => finish(false) }, 'Entregar')),
      test.faltan.length ? h('p.warn.small', `Aviso: faltan preguntas en el banco para ${test.faltan.map((f) => `UT${f.ut}`).join(', ')}; el simulacro no está completo.`) : null,
      nav,
      cards,
      h('div.actions', h('button', { type: 'button', onclick: () => finish(false) }, 'Entregar el examen')),
      h('p.muted.small', 'Sin corrección hasta que entregues, como en el examen. En blanco cuenta como fallo.'),
    );
  });
  return { el, summary: () => summaryText };
}

export { copyText };
