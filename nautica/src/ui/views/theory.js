// Vistas de teoría y exámenes de una titulación (PER, PY…):
//   #/<tit>/teoria/ut/<n>     tanda de 10 preguntas de un tema (corrección inmediata + profe)
//   #/<tit>/examenes          examen a medias, simulacro y exámenes reales completos
//   #/<tit>/test/simulacro    #/<tit>/test/real/<convocatoria>   cronometrados, corrección oficial y revisión con el profe

import { h, setChildren, copyText } from '../dom.js';
import { link, navigate } from '../router.js';
import { loadTheoryBank } from '../../store/datasets.js';
import { bloque, bloquesEnOrden, totalPreguntas } from '../../theory/blocks.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { TANDA, MIN_TANDA } from '../../course/plan.js';
import { pintarCierre } from '../cierre.js';
import { barraActividad, avisoBreve } from '../actividad.js';
import { buildSimulacro, buildReal, buildPractica, buildMezcla, convocatorias, grade } from '../../theory/engine.js';
import { narrateTheory } from '../../teacher/theory.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { voice } from '../voice.js';
import { illustrationEls } from '../illustration.js';
import { createKit } from '../../exams/kit.js';
import { segmentar, delata } from '../../theory/vocabulario.js';
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
  // Vocabulario (no en exámenes): los términos se pueden tocar y su definición aparece bajo la pregunta.
  // Antes de responder solo se subraya el enunciado, y nunca un término cuya definición delate la respuesta.
  const usados = new Set();
  const correctaTxt = q.opciones?.[q.correcta] ?? '';
  if (o.vocab && !o.reveal) for (const [id, t] of o.vocab.porId) if (delata(t, correctaTxt)) usados.add(id);
  const defBox = h('div.vocab-def', { hidden: true, 'aria-live': 'polite' });
  let abierto = null;
  const conVocab = (texto) => (o.vocab ? segmentar(texto, o.vocab, usados).map((x) => (x.tipo === 'texto' ? x.texto
    : h('button.vocab-term', { type: 'button', 'aria-expanded': 'false', onclick: (ev) => {
      ev.preventDefault(); // dentro de una opción, no la marques
      ev.stopPropagation();
      const t = o.vocab.porId.get(x.id);
      const mismo = abierto === ev.currentTarget;
      if (abierto) abierto.setAttribute('aria-expanded', 'false');
      abierto = mismo ? null : ev.currentTarget;
      defBox.hidden = mismo;
      if (!mismo) { ev.currentTarget.setAttribute('aria-expanded', 'true'); setChildren(defBox, h('p', h('strong', `${t.termino}: `), t.definicion), h('button.small.secondary', { type: 'button', onclick: () => { defBox.hidden = true; abierto?.setAttribute('aria-expanded', 'false'); abierto = null; } }, 'Cerrar')); }
    } }, x.texto))) : texto);
  const enunciado = conVocab(q.enunciado);
  const opts = Object.entries(q.opciones ?? {}).map(([k, v]) => {
    const cls = !o.reveal ? '' : k === q.correcta ? 'correct' : k === o.chosen ? 'wrong' : '';
    const fig = q.opciones_figuras?.[k];
    return h('label.option', { class: cls },
      h('input', { type: 'radio', name: `q-${q.id}`, value: k, checked: o.chosen === k, disabled: o.reveal && o.lock, onchange: () => o.onChoose?.(k) }),
      h('span', h('strong', `${k}) `), o.reveal ? conVocab(v) : v, fig ? h('img.qfig.opt', { src: imgSrc(fig), alt: `Figura de la opción ${k}`, loading: 'lazy' }) : null));
  });
  return h('article.qcard',
    h('div.qmeta', o.number ? h('span.badge', `${o.number}`) : null, b && o.tema !== false ? h('span.badge.muted', `${b.icon} ${b.titulo}`) : null,
      h('span.muted.small', [q.convocatoria, q.modulo ? `módulo ${q.modulo === 'generico' ? 'genérico' : 'de navegación'}` : null, q.bloque && q.bloque !== 'carta' ? ({ loxodromica: 'loxodrómica' }[q.bloque] ?? q.bloque) : null].filter(Boolean).join(' · ')), q.anulada ? h('span.badge.warn', 'Anulada') : null),
    q.contexto ? h('pre.qcontext', q.contexto) : null,
    h('p.qtext', enunciado),
    (q.figuras ?? []).map((f) => (/tabla-mareas/.test(f)
      ? h('details.qtable', h('summary', '📊 Tabla para calcular la altura de la marea'), h('img.qfig.wide', { src: imgSrc(f), alt: 'Tabla de corrección de la altura de la marea', loading: 'lazy' }))
      : h('img.qfig', { src: imgSrc(f), alt: 'Figura de la pregunta', loading: 'lazy' }))),
    defBox,
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
    expl?.ilustraciones ? h('div.il-grid.inline', illustrationEls(expl.ilustraciones, { modo: 'explicacion' })) : null,
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
// #/<tit>/examenes — examen a medias, simulacro y exámenes de convocatorias anteriores

/** Enlace para continuar un examen guardado. */
export function rutaTest(tc) {
  return tlink(tc.tit, tc.tipo === 'real' ? ['test', 'real', String(tc.conv)] : ['test', 'simulacro'], tc.tipo === 'real' || tc.seed == null ? undefined : { s: String(tc.seed) });
}

/** Reconstruye las preguntas de un examen (simulacro con su semilla o convocatoria real). */
function construirTest(estructura, preguntas, tipo, conv, seed) {
  return tipo === 'real' ? buildReal(preguntas, conv) : buildSimulacro(estructura, preguntas, createRng(seed));
}

export function examenesView({ ctx, progress, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const T0 = T;
  const E0 = E;
  const el = h('div.examenes', h('h1', 'Examen'), h('p.muted', 'Cargando exámenes…'));
  let summaryText = `VISTA exámenes ${T0.sigla} (cargando)`;
  loadTheoryBank(T0.id).then(({ preguntas }) => {
    const convs = convocatorias(E0, preguntas);
    const tests = progress.tests().filter((t) => (t.tit ?? 'per') === T0.id).slice(-8).reverse();
    const tc = progress.testEnCurso();
    const aMedias = tc && tc.tit === T0.id ? tc : null;
    let aviso = null;
    if (aMedias) {
      const total = construirTest(E0, preguntas, aMedias.tipo, aMedias.conv, aMedias.seed).preguntas.length;
      const resp = Object.keys(aMedias.respuestas ?? {}).length;
      const quedan = Math.max(1, Math.round(E0.duracionMin - (aMedias.consumidoMs ?? 0) / 60000));
      aviso = h('section.tarjeta-hoy.examen-medias',
        h('h2', 'Tienes un examen a medias'),
        h('p.linea', `${resp} de ${total} respondidas · quedan ${quedan} min`),
        h('a.btn.grande', { href: rutaTest(aMedias) }, 'Continuar →'),
        h('p.centrado', h('button.linklike.descartar', { type: 'button', onclick: () => {
          if (confirm('¿Descartar el examen que tienes a medias? Se perderán sus respuestas.')) { progress.saveTestEnCurso(null); dispatchEvent(new HashChangeEvent('hashchange')); }
        } }, 'Descartarlo')));
    }
    summaryText = `VISTA exámenes ${T0.sigla} · ${convs.length} convocatorias${aMedias ? ` · EXAMEN A MEDIAS (${Object.keys(aMedias.respuestas ?? {}).length} respondidas) → ${rutaTest(aMedias)}` : ''}\n${convs.map((c) => `${c.key}: ${c.titulo} (${c.n} preguntas)`).join('\n')}` +
      `\nRUTAS: #/${T0.id}/test/simulacro?s=<semilla> · #/${T0.id}/test/real/<convocatoria> · #/${T0.id}/teoria/ut/<n>?s=<semilla> (test por tema; f=1 solo fallos) · #/${T0.id}/teoria/mezcla`;
    setChildren(el,
      h('h1', 'Examen'),
      aviso,
      h('section.simulacro',
        h('a.btn.grande', { href: tlink(T0.id, ['test', 'simulacro'], { s: randomSeed() }), class: aMedias ? 'secondary' : '' }, 'Hacer un simulacro'),
        h('p.centrado.muted', `${totalPreguntas(E0)} preguntas · ${E0.duracionMin} minutos · como el de verdad`)),
      h('section.test-tema', h('h2', 'Test por tema'),
        h('p.muted', `${TANDA} preguntas de un tema, con la explicación del profe en cada una.`),
        h('ul.lista-tests', bloquesEnOrden(E0).map((b) => {
          const fallos = preguntas.filter((q) => q.ut === b.ut && progress.get().exams[q.id]?.ok === false).length;
          return h('li',
            h('a.test-tema-enlace', { href: tlink(T0.id, ['teoria', 'ut', String(b.ut)], { s: randomSeed() }) }, h('span', `${b.icon} ${b.titulo}`), b.maxErrores != null ? h('span.limite-tema', `eliminatorio: máximo ${b.maxErrores} fallos`) : null),
            fallos ? h('a.fallos-tema', { href: tlink(T0.id, ['teoria', 'ut', String(b.ut)], { s: randomSeed(), f: '1' }) }, `Mis fallos (${fallos})`) : null);
        })),
        h('a.btn.secondary', { href: tlink(T0.id, ['teoria', 'mezcla'], { s: randomSeed() }) }, 'Repaso mezclado de varios temas')),
      tests.length ? h('section', h('h2', 'Tus últimos exámenes'), h('ul.ultimos', tests.map((t) => h('li', `${new Date(t.t).toLocaleDateString('es-ES')} · ${t.titulo}: ${t.aciertos} de ${t.total} ${t.apto == null ? '' : t.apto ? '✅ APTO' : '❌ NO APTO'}`)))) : null,
      h('details', h('summary', 'Exámenes de convocatorias anteriores'),
        h('p.muted', 'Las preguntas de una convocatoria oficial de Andalucía, en su orden, con el tiempo y las reglas del examen.'),
        h('div.cards', convs.map((c) => {
          const hecho = progress.tests().filter((t) => t.conv === c.key).at(-1);
          return h('a.card', { href: tlink(T0.id, ['test', 'real', c.key]) },
            h('h3', c.titulo ?? c.key),
            h('div.meta', h('span.stat', `${c.n} preguntas`), c.completa ? null : h('span.stat.warn', 'incompleto'),
              hecho ? h('span.stat', { class: hecho.apto ? 'ok' : 'warn' }, `${hecho.aciertos} de ${hecho.total} ${hecho.apto ? '✅' : '❌'}`) : null));
        }))),
      h('details', h('summary', 'Reglas del examen'),
        h('ul', T0.reglas.map((r) => h('li', r)), h('li', 'En la app, las preguntas en blanco cuentan como fallo y las anuladas por el tribunal como acierto.'))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// Componente: una tanda de preguntas, una por pantalla («No la sé», profe y «Siguiente →»)

/**
 * @param {{ preguntas: object[], explicaciones: object, progress: object, barra: HTMLElement, rotulo?: string,
 *   onFin: (ok: number, n: number) => void, onSummary?: (texto: string) => void }} o
 * @returns {HTMLElement}
 */
export function tandaPreguntas({ preguntas, explicaciones, progress, barra, rotulo = null, temaEnCadaPregunta = false, vocab = null, onFin, onSummary = () => {} }) {
  const box = h('div.tanda');
  const n = preguntas.length;
  let i = 0;
  let ok = 0;
  function show() {
    const q = preguntas[i];
    barra.set(`Pregunta ${i + 1} de ${n}`, i / n);
    let respondida = false;
    const feedback = h('div.feedback-profe', { tabindex: '-1' });
    const siguiente = h('button.grande', { type: 'button', hidden: true, onclick: () => {
      voice.stop();
      i += 1;
      if (i >= n) { barra.set(null, 1); onFin(ok, n); } else { show(); window.scrollTo(0, 0); }
    } }, i === n - 1 ? 'Ver resultado' : 'Siguiente →');
    const responder = (k) => {
      if (respondida) return;
      respondida = true;
      const good = k != null && (q.anulada || k === q.correcta);
      if (good) ok += 1;
      progress.recordExam(q.id, { choice: k, ok: good });
      const nueva = questionCard(q, { chosen: k ?? undefined, reveal: true, lock: true, tema: temaEnCadaPregunta, vocab });
      card.replaceWith(nueva);
      card = nueva;
      setChildren(feedback, profePanel(q, explanationFor(q, explicaciones), k));
      noLaSe.hidden = true;
      siguiente.hidden = false;
      barra.set(null, (i + 1) / n);
      feedback.focus({ preventScroll: true });
      feedback.scrollIntoView({ block: 'nearest' });
      onSummary(practiceSummary(q, explanationFor(q, explicaciones), k));
    };
    const noLaSe = h('button.secondary.grande', { type: 'button', onclick: () => responder(null) }, 'No la sé');
    let card = questionCard(q, { onChoose: responder, tema: temaEnCadaPregunta, vocab });
    setChildren(box, rotulo ? h('p.rotulo-tema', rotulo) : null, card, feedback, h('div.fila-inferior', noLaSe, siguiente));
    onSummary(practiceSummary(q, explicaciones[q.id], null));
  }
  if (n) show();
  return box;
}

/** Textos del cierre de una tanda según el porcentaje de aciertos (§5.5). */
export function cierreTanda(ok, n) {
  const p = n ? ok / n : 0;
  const linea = p >= 0.8 ? 'Muy bien. Este tema lo llevas encaminado.'
    : p >= 0.5 ? 'Bien. Las que has fallado volverán a salir.'
      : 'Este tema cuesta al principio. Las que has fallado volverán a salir.';
  return { icono: p >= 0.5 ? '🎉' : '💪', titulo: `${ok} de ${n}`, lineas: [linea] };
}

// ---------------------------------------------------------------------------
// #/<tit>/teoria/ut/<n>?s=semilla[&f=1] — tanda de 10 preguntas de un tema

export function practiceView({ ctx, progress, params: route, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const seed = Number(route.query.s) || randomSeed();
  if (route.parts[1] === 'mezcla') return mezclaView({ progress, seed });
  const ut = Number(route.parts[2]);
  const b = bloque(E, ut);
  const soloFalladas = route.query.f === '1';
  if (!b) return { el: h('div.practice', h('p', 'Este tema no existe.'), h('a.btn', { href: tlink(T.id, ['temario']) }, 'Ir al temario')), summary: () => 'ERROR tema no encontrado' };
  const tit0 = T.id;
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); } });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, cont);
  let summaryText = `VISTA tanda de preguntas · ${b.titulo}${soloFalladas ? ' (solo falladas)' : ''}`;

  loadTheoryBank(tit0).then(({ preguntas, explicaciones, reglasDe: rd, vocab }) => {
    reglasDe = rd;
    const respuestas = progress.get().exams;
    const fails = new Set(Object.entries(respuestas).filter(([, v]) => !v.ok).map(([k]) => k));
    const sesion = buildPractica(preguntas, ut, createRng(seed), { soloFalladas: soloFalladas ? fails : null, respuestas, limite: TANDA });
    if (!sesion.preguntas.length) {
      barra.set(b.titulo, 0);
      setChildren(cont, h('p.vacio', soloFalladas ? 'No tienes fallos pendientes en este tema.' : 'Aún no hay preguntas de este tema.'),
        h('a.btn.grande', { href: tlink(tit0, ['temario', String(ut)]) }, 'Volver al tema'));
      return;
    }
    setChildren(cont, tandaPreguntas({
      preguntas: sesion.preguntas, explicaciones, progress, barra, vocab, rotulo: `${b.icon} ${b.titulo}${soloFalladas ? ' · tus fallos' : ''}`,
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n) => {
        progress.logActividad(MIN_TANDA);
        barra.remove();
        pintarCierre(cont, progress, tit0, cierreTanda(ok, n));
        summaryText = `VISTA tanda terminada · ${b.titulo}: ${ok} de ${n} aciertos`;
        window.scrollTo(0, 0);
      },
    }));
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// #/<tit>/teoria/mezcla?s=semilla — repaso mezclado: 10 preguntas de los temas ya empezados, por turnos
function mezclaView({ progress, seed }) {
  const tit0 = T.id;
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); } });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, cont);
  let summaryText = 'VISTA repaso mezclado';
  loadTheoryBank(tit0).then(({ preguntas, explicaciones, reglasDe: rd, vocab }) => {
    reglasDe = rd;
    const respuestas = progress.get().exams;
    const empezados = bloquesEnOrden(E).filter((x) => preguntas.some((q) => q.ut === x.ut && respuestas[q.id])).map((x) => x.ut);
    const conLimite = new Set(E.bloques.filter((x) => x.maxErrores != null).map((x) => x.ut));
    const sesion = buildMezcla(preguntas, empezados, createRng(seed), { respuestas, conLimite, limite: TANDA });
    if (empezados.length < 2 || !sesion.preguntas.length) {
      barra.set('Repaso mezclado', 0);
      setChildren(cont, h('p.vacio', 'El repaso mezclado empieza cuando hayas hecho preguntas de al menos dos temas.'), h('a.btn.grande', { href: tlink(tit0, ['temario']) }, 'Ir al temario'));
      return;
    }
    setChildren(cont, tandaPreguntas({
      preguntas: sesion.preguntas, explicaciones, progress, barra, vocab, rotulo: `🔀 Repaso mezclado · ${empezados.length} temas`, temaEnCadaPregunta: true,
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n) => {
        progress.logActividad(MIN_TANDA);
        progress.setSetting(`mezclado_${tit0}`, new Date().toLocaleDateString('sv-SE'));
        barra.remove();
        pintarCierre(cont, progress, tit0, cierreTanda(ok, n));
        summaryText = `VISTA repaso mezclado terminado: ${ok} de ${n} aciertos`;
        window.scrollTo(0, 0);
      },
    }));
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

function practiceSummary(q, ex, chosen) {
  return [
    `PREGUNTA TEORÍA ${q.id} · tema ${q.ut} · ${q.convocatoria ?? ''}`,
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
// Pantalla de inicio (el reloj no corre hasta empezar), una pregunta por pantalla, guardado continuo
// (respuestas, pregunta actual y tiempo consumido solo con la pestaña visible) y resultado con el profe.

const GUARDAR_CADA_MS = 10000;

export function testView({ ctx, progress, params: route, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const T0 = T;
  const E0 = E;
  const tipo = route.parts[1] === 'real' ? 'real' : 'simulacro';
  const conv = tipo === 'real' ? route.parts[2] : null;
  const seedQ = Number(route.query.s) || null;
  const el = h('div.test', h('p.muted', 'Preparando el examen…'));
  let summaryText = 'VISTA examen (cargando)';

  loadTheoryBank(T0.id).then(({ preguntas, explicaciones, reglasDe: rd, vocab: vocabBanco }) => {
    reglasDe = rd;
    const tc = progress.testEnCurso();
    const mismo = tc && tc.tit === T0.id && tc.tipo === tipo && (tipo === 'real' ? tc.conv === conv : seedQ != null && tc.seed === seedQ);
    if (mismo) correr(tc);
    else inicio(tc);

    // --- pantalla de inicio
    function inicio(otro) {
      const seed = seedQ ?? randomSeed();
      const test = construirTest(E0, preguntas, tipo, conv, seed);
      if (!test.preguntas.length) { setChildren(el, h('p.warn', 'No hay preguntas para este examen.'), h('a.btn.grande', { href: tlink(T0.id, ['examenes']) }, 'Volver')); return; }
      const empezar = () => {
        const nuevo = { tit: T0.id, tipo, conv, seed: tipo === 'simulacro' ? seed : null, respuestas: {}, i: 0, consumidoMs: 0 };
        progress.saveTestEnCurso(nuevo);
        if (tipo === 'simulacro' && seedQ !== seed) navigate([T0.id, 'test', 'simulacro'], { s: String(seed) }, { replace: true });
        correr(progress.testEnCurso());
      };
      const limites = E0.bloques.filter((b) => b.maxErrores != null);
      summaryText = `VISTA inicio del examen «${test.titulo}» ${T0.sigla} · ${test.preguntas.length} preguntas · ${E0.duracionMin} min (aún no ha empezado)${otro ? ` · hay otro examen a medias → ${rutaTest(otro)}` : ''}`;
      setChildren(el,
        h('div.inicio-examen',
          h('h1', test.titulo),
          h('ul.datos-examen',
            h('li', `${test.preguntas.length} preguntas`),
            h('li', `${E0.duracionMin} minutos`),
            h('li', `Apruebas con ${E0.minAciertos} aciertos`),
            limites.map((b) => h('li', `${b.icon} ${b.titulo}: como mucho ${b.maxErrores} fallos`))),
          test.faltan.length ? h('p.warn', `Aviso: faltan preguntas en el banco para ${test.faltan.map((f) => bloque(E0, f.ut)?.titulo ?? f.ut).join(', ')}; el simulacro no está completo.`) : null,
          h('p', 'Puedes salir y seguir más tarde: se guarda solo. El reloj se para mientras no estés.'),
          otro
            ? [h('p.aviso-medias', 'Tienes otro examen a medias.'),
              h('div.botones-columna',
                h('a.btn.grande', { href: rutaTest(otro) }, 'Continuar el que tienes a medias'),
                h('button.secondary.grande', { type: 'button', onclick: () => { if (confirm('Se descartará el examen que tienes a medias. ¿Empezar uno nuevo?')) empezar(); } }, 'Empezar uno nuevo'))]
            : h('div.botones-columna', h('button.grande', { type: 'button', onclick: empezar }, 'Empezar el examen')),
          h('p.centrado', h('a', { href: tlink(T0.id, ['examenes']) }, 'Ahora no'))),
      );
      window.scrollTo(0, 0);
    }

    // --- examen en marcha: una pregunta por pantalla
    function correr(estado) {
      const test = construirTest(E0, preguntas, estado.tipo, estado.conv, estado.seed);
      const n = test.preguntas.length;
      if (!n) { progress.saveTestEnCurso(null); setChildren(el, h('p.warn', 'No hay preguntas para este examen.')); return; }
      const respuestas = { ...(estado.respuestas ?? {}) };
      let i = Math.min(Math.max(0, estado.i ?? 0), n - 1);
      let consumido = estado.consumidoMs ?? 0;
      const limite = E0.duracionMin * 60000;
      let ultimo = Date.now();
      let ultimoGuardado = Date.now();
      let activo = true;
      let terminado = false;
      const reloj = h('span.reloj');
      const barra = barraActividad({ texto: '', onSalir: salir, derecha: reloj });
      const cuerpo = h('div');
      const panel = h('div.panel-preguntas', { hidden: true, role: 'dialog', 'aria-label': 'Todas las preguntas' });

      const guardar = () => { if (!terminado) progress.saveTestEnCurso({ ...estado, respuestas, i, consumidoMs: Math.round(consumido) }); ultimoGuardado = Date.now(); };
      function contar() {
        const ahora = Date.now();
        if (activo && document.visibilityState === 'visible') consumido += ahora - ultimo;
        ultimo = ahora;
      }
      function tick() {
        if (!el.isConnected) { dejar(); return; }
        contar();
        const resto = limite - consumido;
        if (resto <= 0) { reloj.textContent = '⏱ 00:00'; finish(true); return; }
        const m = Math.floor(resto / 60000);
        const s = Math.floor((resto % 60000) / 1000);
        reloj.textContent = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        reloj.classList.toggle('warn', resto < 5 * 60000);
        if (Date.now() - ultimoGuardado >= GUARDAR_CADA_MS) guardar();
      }
      const onVis = () => { contar(); guardar(); };
      const onLeave = () => { if (!el.isConnected) dejar(); };
      const timer = setInterval(tick, 1000);
      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('pagehide', onVis);
      window.addEventListener('hashchange', onLeave);
      function limpiar() {
        activo = false;
        clearInterval(timer);
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pagehide', onVis);
        window.removeEventListener('hashchange', onLeave);
      }
      function dejar() { if (!activo) return; contar(); guardar(); limpiar(); }
      function salir() {
        dejar();
        avisoBreve('Guardado. Puedes seguir cuando quieras.');
        location.hash = tlink(T0.id);
      }

      const sinResponder = () => test.preguntas.filter((q) => !respuestas[q.id]).length;
      function ir(j) { i = Math.min(Math.max(0, j), n - 1); guardar(); mostrar(); window.scrollTo(0, 0); }
      function mostrar() {
        const q = test.preguntas[i];
        barra.set(`Pregunta ${i + 1} de ${n}`, (i + 1) / n);
        const ultima = i === n - 1;
        setChildren(cuerpo,
          questionCard(q, { number: i + 1, chosen: respuestas[q.id], onChoose: (k) => { respuestas[q.id] = k; guardar(); resumen(); } }),
          h('p.ver-todas', h('a', { href: '#', onclick: (ev) => { ev.preventDefault(); abrirPanel(); } }, 'Ver todas las preguntas')),
          h('div.fila-inferior',
            h('button.secondary.boton-anterior', { type: 'button', 'aria-label': 'Anterior', disabled: i === 0, onclick: () => ir(i - 1) }, '←'),
            ultima
              ? h('button.grande', { type: 'button', onclick: () => finish(false) }, 'Terminar y corregir')
              : h('button.grande', { type: 'button', onclick: () => ir(i + 1) }, 'Siguiente →')));
        resumen();
      }
      function abrirPanel() {
        setChildren(panel,
          h('div.panel-cabecera', h('h2', 'Todas las preguntas'), h('button.secondary', { type: 'button', onclick: () => { panel.hidden = true; } }, '✕ Cerrar')),
          h('p.muted', `${n - sinResponder()} de ${n} respondidas`),
          h('div.rejilla', test.preguntas.map((q, j) => h('button.celda', { type: 'button', class: [respuestas[q.id] ? 'hecha' : '', j === i ? 'actual' : ''].join(' '), 'aria-label': `Pregunta ${j + 1}${respuestas[q.id] ? ', respondida' : ''}`,
            onclick: () => { panel.hidden = true; ir(j); } }, String(j + 1)))),
          h('button.grande', { type: 'button', onclick: () => { panel.hidden = true; finish(false); } }, 'Terminar y corregir'));
        panel.hidden = false;
      }
      function resumen() {
        summaryText = `EXAMEN EN CURSO · ${test.titulo} · pregunta ${i + 1} de ${n} · ${n - sinResponder()}/${n} respondidas (sin corregir: el alumno está haciendo el examen; no des respuestas)`;
      }

      function finish(porTiempo = false) {
        if (terminado) return;
        const quedan = sinResponder();
        if (!porTiempo && quedan && !confirm(`Te quedan ${quedan} preguntas sin responder y contarán como fallo. ¿Terminar de todos modos?`)) return;
        contar();
        limpiar();
        terminado = true;
        const g = grade(E0, test, respuestas);
        for (const d of g.detalle) if (d.respuesta) progress.recordExam(d.id, { choice: d.respuesta, ok: d.ok });
        const minutos = Math.max(1, Math.round(consumido / 60000));
        progress.recordTest({ tit: T0.id, conv: test.tipo === 'real' ? estado.conv : undefined, tipo: test.tipo, titulo: test.titulo, aciertos: g.aciertos, total: g.total, apto: g.apto, minutos,
          porTema: g.bloques.map((b) => ({ ut: b.ut, aciertos: b.aciertos, total: b.total })) });
        progress.saveTestEnCurso(null);
        progress.logActividad(minutos);
        resultados(test, g, porTiempo);
      }

      setChildren(el, barra, cuerpo, panel);
      mostrar();
      tick();
    }

    // --- resultado
    function resultados(test, g, porTiempo) {
      document.body.classList.remove('focus');
      summaryText = `RESULTADO ${test.titulo}: ${g.aciertos}/${g.total} ${g.apto == null ? '' : g.apto ? 'APTO' : 'NO APTO'}\n` +
        g.bloques.map((b) => `${b.titulo}: ${b.aciertos}/${b.total}${b.maxErrores != null ? ` (máx. errores ${b.maxErrores})` : ''}`).join('\n') +
        `\nFALLADAS: ${g.detalle.filter((d) => !d.ok).map((d) => `${d.id} (marcó ${d.respuesta ?? '—'}, correcta ${d.correcta})`).join(', ')}`;
      const filtro = { value: 'falladas' };
      const review = h('div.review');
      const renderReview = () => setChildren(review, test.preguntas.map((q, j) => {
        const d = g.detalle[j];
        if (filtro.value === 'falladas' && d.ok) return null;
        return h('div.qholder', questionCard(q, { number: j + 1, chosen: d.respuesta, reveal: true, lock: true, vocab: vocabBanco }), profePanel(q, explanationFor(q, explicaciones), d.respuesta));
      }));
      const filterSel = h('select', { onchange: (ev) => { filtro.value = ev.target.value; renderReview(); } },
        h('option', { value: 'falladas' }, 'Solo las falladas'), h('option', { value: 'todas' }, 'Todas'));
      renderReview();
      const conFallos = g.bloques.filter((b) => b.errores > 0).sort((a, b) => b.errores - a.errores);
      const tituloRevision = h('h2#revision', 'Repasa tus fallos con el profe');
      setChildren(el,
        h('header.resultado', h('h1', g.apto == null ? 'Resultado' : g.apto ? '✅ APTO' : '❌ NO APTO'),
          h('p', `${g.aciertos} aciertos de ${g.total}${porTiempo ? ' · se acabó el tiempo' : ''}.`),
          g.motivos.length ? h('ul.warn', g.motivos.map((m) => h('li', m))) : null),
        conFallos.length
          ? h('table.stats.fallos-tema', h('thead', h('tr', h('th', 'Tema'), h('th', 'Fallos'))),
            h('tbody', conFallos.map((b) => {
              const suspenso = b.maxErrores != null && b.errores > b.maxErrores;
              return h('tr', { class: suspenso ? 'bad' : '' },
                h('td', `${b.icon} ${b.titulo}`, suspenso ? h('div.suspenso', `Aquí está el suspenso: máximo ${b.maxErrores} fallos`) : null),
                h('td', String(b.errores)));
            })))
          : h('p.ok', 'Sin fallos. Enhorabuena.'),
        h('div.botones-columna',
          g.errores ? h('button.grande', { type: 'button', onclick: () => tituloRevision.scrollIntoView({ behavior: 'smooth' }) }, 'Repasar mis fallos con el profe') : null,
          h('a.btn.grande', { href: tlink(T0.id), class: g.errores ? 'secondary' : '' }, 'Volver a Hoy')),
        tituloRevision,
        h('label.filtro-revision', 'Ver: ', filterSel),
        review,
      );
      window.scrollTo(0, 0);
    }
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo preparar el examen: ${e.message}`)));
  return { el, summary: () => summaryText };
}

export { copyText };
