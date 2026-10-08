// Vistas de teoría y exámenes de una titulación (PER, PY…):
//   #/<tit>/teoria/ut/<n>     tanda de 10 preguntas de un tema (corrección inmediata + profe)
//   #/<tit>/examenes          examen a medias, simulacro y exámenes reales completos
//   #/<tit>/test/simulacro    #/<tit>/test/real/<convocatoria>   cronometrados, corrección oficial y revisión con el profe

import { h, setChildren, copyText } from '../dom.js';
import { link, navigate } from '../router.js';
import { cargarBanco, cargarCurso, urlFigura, rutaResolucion, SOLUCIONES as cartaSolutions } from '../../bancos/index.js';
import { bloque, bloquesEnOrden, totalPreguntas, posEstudio } from '../../theory/blocks.js';
import { TITULACIONES, tlink, currentEje, reglasExamen } from '../titulacion.js';
import { citaFuente } from '../eje.js';
import { TANDA } from '../../course/plan.js';
import { pintarCierre, calcularPlan } from '../cierre.js';
import { fijarModoExamen } from '../modo-examen.js';
import { barraActividad, avisoBreve } from '../actividad.js';
import { buildSimulacro, buildReal, buildFinal, buildPractica, buildMezcla, testDesdeIds, grade, nuevasDe } from '../../theory/engine.js';
import { narrateTheory, esDefendible } from '../../teacher/theory.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { voice } from '../voice.js';
import { hojaRespuesta } from '../hoja.js';
import { icono } from '../iconos.js';
import { vibrar, quieto, transicion } from '../movimiento.js';
import { avisoError } from '../aviso-error.js';
import { enlaceTrampa } from '../mapa-trampa.js';
import { remateMapas } from '../remate-mapas.js';
import { illustrationEls } from '../illustration.js';
import { createKit } from '../../exams/kit.js';
import { openWorkspace } from '../chart/workspace.js';
import { colaRepaso, tandaRapida, planRepaso, siguienteRepasoConcepto, diaLocal } from '../../course/repaso.js';
import { cronometro } from '../../course/cronometro.js';
import { segmentar, delata } from '../../theory/vocabulario.js';
import { narrateSteps } from '../../teacher/narrate.js';
import { cuenta, fechaLarga } from '../../texto.js';
import { botonCalculadora, bloquearCalculadora, desbloquearCalculadora, calculadoraEnAyudas } from '../calculadora.js';
import { calculadoraPermitida } from '../../calculadora/reglas.js';
import { crearAyudas } from '../ayudas.js';
import { glosar } from '../glosas.js';
import { botonesSesion } from '../sesion.js';
import { etiquetaConcepto, conceptosDelBanco, estadoFicha, hrefFicha } from '../concepto.js';

let chartRef = null;
/** Explicación de una pregunta: la redactada para teoría o, en las de carta, la resolución calculada. */
function explanationFor(q, explicaciones) {
  if (explicaciones[q.id]) return explicaciones[q.id];
  const sol = chartRef && cartaSolutions[q.id];
  if (!sol) return null;
  try {
    const k = createKit(chartRef);
    sol.solve(k, q);
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
    const cls = (!o.reveal ? '' : k === q.correcta ? 'correct' : k === o.chosen ? 'wrong' : '') + (o.reveal && k === o.chosen ? ' elegida' : '');
    const fig = q.opciones_figuras?.[k];
    return h('label.option', { class: cls },
      h('input', { type: 'radio', name: `q-${q.id}`, value: k, checked: o.chosen === k, disabled: o.reveal && o.lock, onchange: () => o.onChoose?.(k) }),
      h('span', h('strong', `${k}) `), o.reveal ? conVocab(v) : v, fig ? h('img.qfig.opt', { src: urlFigura(q, fig), alt: `Figura de la opción ${k}`, loading: 'lazy' }) : null));
  });
  return h('article.qcard', { class: o.reveal ? 'revelada' : '' },
    h('div.qmeta', o.number ? h('span.badge', `${o.number}`) : null, b && o.tema !== false ? h('span.badge.muted', `${b.icon} ${b.titulo}`) : null,
      h('span.muted.small', [q.convocatoria, q.modulo ? `módulo ${q.modulo === 'generico' ? 'genérico' : 'de navegación'}` : null, q.bloque && q.bloque !== 'carta' ? ({ loxodromica: 'loxodrómica' }[q.bloque] ?? q.bloque) : null].filter(Boolean).join(' · ')), q.anulada ? h('span.badge.warn', 'Anulada') : null),
    q.contexto ? h('pre.qcontext', q.contexto) : null,
    h('p.qtext', enunciado),
    (q.figuras ?? []).map((f) => (/tabla-mareas/.test(f)
      ? h('details.qtable', h('summary', '📊 Tabla para calcular la altura de la marea'), h('img.qfig.wide', { src: urlFigura(q, f), alt: 'Tabla de corrección de la altura de la marea', loading: 'lazy' }))
      : h('img.qfig', { src: urlFigura(q, f), alt: 'Figura de la pregunta', loading: 'lazy' }))),
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

/** ¿Esta pregunta se resuelve sobre la carta? (las que la requieren, salvo las que la app resuelve solo con cálculo) */
export function necesitaCarta(q) {
  const sol = cartaSolutions[q.id];
  return (!!q.requiere?.includes('carta') && !sol?.sinCarta) || (!!sol && !sol.sinCarta);
}

/**
 * Botón «Abrir la carta» para una pregunta que se resuelve sobre ella (en tandas, tests y clases): la carta se abre a
 * pantalla completa con el enunciado y, al cerrarla, sigues en la pregunta. null si la pregunta no la necesita.
 * @param {object} [ayudas]  contexto de práctica ({ modo, tit… }) para tener la chuleta en la carta; nunca en un examen
 */
export function botonCarta(q, progress, ayudas = null, { calculadora = true } = {}) {
  if (!necesitaCarta(q) || !chartRef) return null;
  return h('button.secondary.grande.boton-icono.abrir-carta', { type: 'button', onclick: () => openWorkspace({
    chart: chartRef, title: `Carta · ${q.convocatoria ?? ''}`, statement: q.enunciado, steps: [], items: [], focus: [], answerNodes: [], tab: 'ejercicio', progress,
    result: '', summary: () => `CARTA abierta para ${q.id}`, calculadora,
    ayudas: ayudas ? { ...ayudas, ut: q.ut } : null, glosas: ayudas ? { tit: T.id, ut: q.ut } : null,
  }) }, icono('mapa'), 'Abrir la carta');
}

/** Panel del profe para una pregunta respondida. */
export function profePanel(q, expl, chosen) {
  const n = narrateTheory(q, expl, chosen, reglasDe(q.id));
  const ok = q.anulada || q.norma?.estado === 'retirada' || chosen === q.correcta;
  // Al corregir: vibración breve y la explicación sube a la vista (el panel entra desde abajo, ver CSS).
  if (chosen != null) {
    vibrar(ok);
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => panel.isConnected && panel.scrollIntoView({ block: 'nearest', behavior: quieto() ? 'auto' : 'smooth' }));
  }
  const panel = h('div.profe', { class: chosen == null ? '' : ok ? 'ok-border' : 'bad-border' },
    h('span.profe-badge', '👨‍🏫 El profe'),
    // Pregunta retirada por la revisión normativa: se ve en la revisión del examen real, pero ya no se estudia.
    q.norma?.estado === 'retirada' ? h('p.nota-retirada', h('strong', 'Pregunta retirada. '),
      `${q.norma.nota ?? 'La norma ha cambiado y la respuesta oficial ya no es correcta.'} No cuenta en la nota del examen y ya no sale al estudiar.`) : null,
    voice.supported ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', 'aria-label': 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, icono('escuchar')) : null,
    // Al acertar, solo el truco (o la idea clave) y el resto bajo «Ver por qué»; al fallar, todo a la vista.
    (() => {
      const lineas = n.display.map((line) => {
        const tipo = /^💡/.test(line) ? 'tip' : /^⚠️/.test(line) ? 'trap' : /^🧠/.test(line) ? 'mnemo' : '';
        const ico = { tip: 'bombilla', trap: 'aviso', mnemo: 'temario' }[tipo];
        // Clave, trampa y regla con su icono de línea (no con emoji).
        return { tipo, el: h('p', { class: tipo }, ico ? [icono(ico), ' ', line.replace(/^(💡|⚠️|🧠)\uFE0F?\s*/u, '')] : line) };
      });
      const resto = [expl?.ilustraciones ? h('div.il-grid.inline', illustrationEls(expl.ilustraciones, { modo: 'explicacion' })) : null, enlaceResolucion(q)];
      // Con plantilla discutible (nota del profe), todo a la vista: la versión corta podría parecer contradictoria.
      if (!(chosen != null && ok && !q.anulada) || expl?.discrepancia) return [lineas.map((x) => x.el), resto];
      const corto = lineas.filter((x, i) => i === 0 || x.tipo === 'tip' || x.tipo === 'mnemo');
      const largo = lineas.filter((x) => !corto.includes(x));
      return [corto.map((x) => x.el), largo.length || resto.some(Boolean) ? h('details.ver-por-que', h('summary', 'Ver por qué'), largo.map((x) => x.el), resto) : null];
    })(),
    ok ? null : enlaceTrampa(q, chosen),
    h('p.pie-aviso', avisoError(`Pregunta ${q.id}${q.convocatoria ? ` (${q.convocatoria})` : ''}`, (q.enunciado ?? '').slice(0, 120))),
  );
  // Las siglas de la explicación (Ct, HRB, MMSI…) se explican al tocarlas. La pregunta ya está respondida.
  glosar(panel, { tit: T.id, ut: q.ut });
  return panel;
}

/** «Ver la resolución»: en la carta, o paso a paso si la pregunta se resuelve sin ella (mareas, estima analítica). */
function enlaceResolucion(q) {
  const ruta = rutaResolucion(q);
  if (!ruta) return null;
  const sinCarta = cartaSolutions[q.id]?.sinCarta;
  return h('p', h('a.btn.secondary', { href: link(ruta) }, sinCarta ? '🧮 Ver la resolución paso a paso' : '🗺️ Ver la resolución en la carta'));
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
  if (tc.tipo === 'final') return tlink(tc.tit, ['test', 'final']);
  return tlink(tc.tit, tc.tipo === 'real' ? ['test', 'real', String(tc.conv)] : ['test', 'simulacro'], tc.tipo === 'real' || tc.seed == null ? undefined : { s: String(tc.seed) });
}

/**
 * Construye las preguntas de un examen: convocatoria real (con sus preguntas retiradas, que se corrigen como anuladas)
 * o simulacro con su semilla (del estudio; con `respuestas`, primero las no vistas).
 */
function construirTest(estructura, banco, tipo, conv, seed, respuestas = null) {
  return tipo === 'real' ? buildReal(banco.examenes, conv) : buildSimulacro(estructura, banco.estudio, createRng(seed), { respuestas });
}

/** Rehace un examen guardado: con sus preguntas guardadas (ids) o, si es de antes de guardarlas, con la semilla. */
function rehacerTest(estructura, banco, tc) {
  return testDesdeIds(tc.tipo, tc.ids, banco.porId, tc.conv) ?? (tc.tipo === 'final' ? { tipo: 'final', titulo: 'Examen final', preguntas: [], faltan: [] } : construirTest(estructura, banco, tc.tipo, tc.conv, tc.seed));
}

/** ¿El examen guardado (o hecho) es de esta titulación y este eje? (los antiguos, sin titulación, son del PER) */
const deTitEje = (x, tit, eje) => (x?.tit ?? 'per') === tit && x?.eje === eje;

/**
 * Tarjeta del examen final (F1): cerrada hasta que estés listo (dice qué falta) o abierta (con qué examen toca). Todo
 * lo que dice sale del motor (st.final); null si el eje no reserva nada.
 */
export function tarjetaFinal(T0, fin, { titulo = 'h2' } = {}) {
  if (!fin?.hay) return null;
  return h('section.examen-final', { class: fin.desbloqueado ? 'abierto' : 'cerrado' },
    h(titulo, fin.desbloqueado ? '🎯 Examen final' : '🔒 Examen final'),
    h('p.muted.small', 'Preguntas reales reservadas que no salen al estudiar: la mejor prueba de si lo sabes de verdad.'),
    fin.lineas.map((l) => h('p', l)),
    fin.desbloqueado
      ? h('a.btn.grande', { href: tlink(T0.id, ['test', 'final']), class: fin.sugerir || !fin.todasVistas ? '' : 'secondary' }, fin.todasVistas ? 'Hacerlo igualmente' : 'Hacer el examen final')
      : null,
    fin.lineasResultado.length ? [h('h3', 'Tus exámenes finales'), h('ul.resultados-final', fin.lineasResultado.map((l, i) => h('li', { class: i === 0 && fin.preparado ? 'ok' : '' }, l)))] : null);
}

export function examenesView({ ctx, progress, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const T0 = T;
  const E0 = E;
  const el = h('div.examenes', h('h1', 'Examen'), h('p.muted', 'Cargando exámenes…'));
  let summaryText = `VISTA exámenes ${T0.sigla} (cargando)`;
  calcularPlan(progress, T0.id).then(({ banco, st }) => {
    const preguntas = banco.estudio;
    const eje = banco.eje;
    const fin = st.final; // del motor: el examen final (abierto o no, qué falta, resultados)
    const convs = banco.convocatorias();
    const tests = progress.tests().filter((t) => deTitEje(t, T0.id, eje.id)).slice(-8).reverse();
    const tc = progress.testEnCurso();
    const aMedias = deTitEje(tc, T0.id, eje.id) ? tc : null;
    let aviso = null;
    if (aMedias) {
      const total = rehacerTest(E0, banco, aMedias).preguntas.length;
      const resp = Object.keys(aMedias.respuestas ?? {}).length;
      const quedan = Math.max(1, Math.round(E0.duracionMin - (aMedias.consumidoMs ?? 0) / 60000));
      aviso = h('section.tarjeta-hoy.examen-medias',
        h('h2', 'Tienes un examen a medias'),
        h('p.linea', `${resp} de ${cuenta(total, 'respondida')} · quedan ${quedan} min`),
        h('a.btn.grande', { href: rutaTest(aMedias) }, 'Continuar →'),
        h('p.centrado', h('button.linklike.descartar', { type: 'button', onclick: () => {
          if (confirm('¿Descartar el examen que tienes a medias? Se perderán sus respuestas.')) { progress.saveTestEnCurso(null); dispatchEvent(new HashChangeEvent('hashchange')); }
        } }, 'Descartarlo')));
    }
    summaryText = `VISTA exámenes ${T0.sigla} · ${convs.length} convocatorias${aMedias ? ` · EXAMEN A MEDIAS (${Object.keys(aMedias.respuestas ?? {}).length} respondidas) → ${rutaTest(aMedias)}` : ''}\n${convs.map((c) => `${c.key}: ${c.titulo} (${cuenta(c.n, 'pregunta')})`).join('\n')}` +
      (fin.hay ? `\nEXAMEN FINAL: ${fin.desbloqueado ? 'abierto' : 'cerrado'} · ${fin.lineas.join(' ')}${fin.lineasResultado.length ? ` · ${fin.lineasResultado.join(' ')}` : ''} → #/${T0.id}/test/final` : '') +
      `\nRUTAS: #/${T0.id}/test/simulacro?s=<semilla> · #/${T0.id}/test/real/<convocatoria> · #/${T0.id}/teoria/ut/<n>?s=<semilla> (test por tema; f=1 solo fallos) · #/${T0.id}/teoria/mezcla · #/${T0.id}/teoria/repaso (repaso espaciado) · #/${T0.id}/teoria/rapido (5 minutos)`;
    setChildren(el,
      h('h1', 'Examen'),
      aviso,
      tarjetaFinal(T0, fin),
      h('section.simulacro',
        h('a.btn.grande', { href: tlink(T0.id, ['test', 'simulacro'], { s: randomSeed() }), class: aMedias || fin.sugerir ? 'secondary' : '' }, 'Hacer un simulacro'),
        h('p.centrado.muted', `${cuenta(totalPreguntas(E0), 'pregunta')} · ${cuenta(E0.duracionMin, 'minuto')} · como el de verdad`)),
      (() => {
        const n = st.repaso.hoy; // del motor (con conceptos, una por idea)
        return h('section.repaso-examen',
          n ? h('a.btn.secondary', { href: tlink(T0.id, ['teoria', 'repaso']) }, `🔁 Repasar mis fallos (${n} para hoy)`) : null,
          h('a.btn.secondary', { href: tlink(T0.id, ['teoria', 'rapido'], { s: randomSeed() }) }, '⏱ Tengo 5 minutos'));
      })(),
      h('section.test-tema', h('h2', 'Test por tema'),
        h('p.muted', `${cuenta(TANDA, 'pregunta')} de un tema, con la explicación del profe en cada una.`),
        h('ul.lista-tests', bloquesEnOrden(E0).map((b) => {
          const fallos = preguntas.filter((q) => q.ut === b.ut && progress.get().exams[q.id]?.ok === false).length;
          return h('li',
            h('a.test-tema-enlace', { href: tlink(T0.id, ['teoria', 'ut', String(b.ut)], { s: randomSeed() }) }, h('span', `${b.icon} ${b.titulo}`), b.maxErrores != null ? h('span.limite-tema', `eliminatorio: máximo ${cuenta(b.maxErrores, 'fallo')}`) : null),
            fallos ? h('a.fallos-tema', { href: tlink(T0.id, ['teoria', 'ut', String(b.ut)], { s: randomSeed(), f: '1' }) }, `Mis fallos (${fallos})`) : null);
        })),
        h('a.btn.secondary', { href: tlink(T0.id, ['teoria', 'mezcla'], { s: randomSeed() }) }, 'Repaso mezclado de varios temas')),
      tests.length ? h('section', h('h2', 'Tus últimos exámenes'), h('ul.ultimos', tests.map((t) => h('li', `${fechaLarga(t.t)} · ${t.tipo === 'final' ? '🎯 ' : ''}${t.titulo}: ${t.aciertos} de ${t.total} ${t.apto == null ? '' : t.apto ? '✅ APTO' : '❌ NO APTO'}`)))) : null,
      h('details', h('summary', 'Exámenes de convocatorias anteriores'),
        h('p.muted', `Las preguntas de una convocatoria oficial de ${eje.nombre}, en su orden, con el tiempo y las reglas del examen.`),
        citaFuente(eje),
        h('div.cards', convs.map((c) => {
          const hecho = progress.tests().filter((t) => t.conv === c.key).at(-1);
          return h('a.card', { href: tlink(T0.id, ['test', 'real', c.key]) },
            h('h3', c.titulo ?? c.key),
            h('div.meta', h('span.stat', `${cuenta(c.n, 'pregunta')}`), c.completa ? null : h('span.stat.warn', 'incompleto'),
              hecho ? h('span.stat', { class: hecho.apto ? 'ok' : 'warn' }, `${hecho.aciertos} de ${hecho.total} ${hecho.apto ? '✅' : '❌'}`) : null));
        }))),
      h('details', h('summary', 'Reglas del examen'),
        h('ul', reglasExamen(T0, eje).map((r) => h('li', r)), h('li', 'En la app, las preguntas en blanco cuentan como fallo y las anuladas por el tribunal como acierto.'))),
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
/**
 * ayudas: la de la vista (crearAyudas), para que la chuleta siga el tema de cada pregunta y la carta la lleve también.
 */
/**
 * avisoDe(i, q): un aviso encima de la pregunta i (p. ej. «te la traigo con otra redacción»), o null.
 * alResponder(i, q, ok): se llama tras guardar la respuesta; si devuelve un texto, va al final de la corrección.
 */
export function tandaPreguntas({ preguntas, explicaciones, progress, barra, rotulo = null, temaEnCadaPregunta = false, vocab = null, ayudas = null, avisoDe = null, alResponder = null, registrar = null, contador = null, onFin, onSummary = () => {} }) {
  const box = h('div.tanda');
  // La lista puede crecer mientras se responde (test de nivel adaptativo: alResponder añade la siguiente).
  const total = () => preguntas.length;
  const cuenta_ = (j) => contador?.(j) ?? { texto: `Pregunta ${j + 1} de ${total()}`, fraccion: j / total() };
  let i = 0;
  const crono = cronometro(); // minutos reales (con tope por pantalla), no estimados
  let ok = 0;
  function show() {
    const q = preguntas[i];
    const c0 = cuenta_(i);
    barra.set(c0.texto, c0.fraccion);
    ayudas?.contexto({ ut: q.ut });
    let respondida = false;
    box.classList.remove('respondida'); // el concepto no se enseña antes de responder: a veces delata la respuesta
    const feedback = h('div.feedback-profe', { tabindex: '-1' });
    const siguiente = h('button.grande', { type: 'button', hidden: true, onclick: () => {
      voice.stop();
      i += 1;
      crono.marca();
      if (i >= total()) { barra.set(null, 1); const min = crono.minutos(); transicion(() => onFin(ok, total(), min), 'adelante'); } else { transicion(() => { show(); window.scrollTo(0, 0); }, 'adelante'); }
    } }, i === total() - 1 ? 'Ver resultado' : 'Siguiente →');
    const responder = (k) => {
      if (respondida) return;
      respondida = true;
      box.classList.add('respondida');
      crono.marca();
      const good = k != null && (q.anulada || k === q.correcta);
      if (good) ok += 1;
      if (registrar) registrar(q, k, good); else progress.recordExam(q.id, { choice: k, ok: good });
      const extra = alResponder?.(i, q, good) ?? null;
      const ultima = i === total() - 1;
      siguiente.textContent = ultima ? 'Ver resultado' : 'Siguiente →';
      const nueva = questionCard(q, { chosen: k ?? undefined, reveal: true, lock: true, tema: temaEnCadaPregunta, vocab });
      card.replaceWith(nueva);
      card = nueva;
      noLaSe.hidden = true;
      siguiente.hidden = false;
      barra.set(null, contador ? cuenta_(i + 1).fraccion : (i + 1) / total());
      // La corrección sube en un panel desde abajo, con «Continuar» (que es el mismo «Siguiente»).
      // Opción defendible frente a una plantilla discutible: cuenta como fallo, pero el panel no la pinta de error.
      const defendible = esDefendible(q, explanationFor(q, explicaciones), k);
      hojaRespuesta(box, { ok: k == null || defendible ? null : good, titulo: k == null ? `Era la ${q.correcta})` : defendible ? 'Discutible' : undefined,
        contenido: extra ? h('div', profePanel(q, explanationFor(q, explicaciones), k), h('p.vuelve-idea', extra)) : profePanel(q, explanationFor(q, explicaciones), k), onContinuar: () => siguiente.click(), boton: ultima ? 'Ver resultado' : 'Continuar' });
      onSummary(practiceSummary(q, explanationFor(q, explicaciones), k));
    };
    const noLaSe = h('button.secondary.grande', { type: 'button', onclick: () => responder(null) }, 'No la sé');
    let card = questionCard(q, { onChoose: responder, tema: temaEnCadaPregunta, vocab });
    // Las preguntas de carta se resuelven sobre la carta: se abre a pantalla completa con el enunciado y los faros
    // citados resaltados, y al cerrarla sigues en la pregunta.
    const carta = botonCarta(q, progress, ayudas?.ctx() ?? null);
    setChildren(box, rotulo ? h('p.rotulo-tema', rotulo) : null, avisoDe?.(i, q) ?? null, chipsPregunta(q, progress, ayudas), card, carta, feedback, h('div.fila-inferior', noLaSe, siguiente));
    onSummary(practiceSummary(q, explicaciones[q.id], null));
  }
  if (total()) show();
  return box;
}

/**
 * Lo que va encima de una pregunta de práctica: el concepto que pregunta (solo si el banco tiene sus preguntas
 * etiquetadas; si no, nada) y la calculadora cuando la pregunta es de cuentas y la barra de ayudas no la trae ya.
 */
function chipsPregunta(q, progress, ayudas) {
  const fila = h('div.chips-pregunta', { hidden: true });
  const calc = (calculadoraEnAyudas({ tit: T.id, ut: q.ut }) || necesitaCarta(q)) && !ayudas?.barra?.querySelector('.boton-calculadora')
    ? botonCalculadora({ texto: 'Calculadora', clase: 'secondary.small.chip-calculadora' }) : null;
  if (calc) { fila.append(calc); fila.hidden = false; }
  etiquetaConcepto(currentEje(progress), T.id, q.id).then((t) => {
    if (!t) return;
    fila.prepend(h('span.chip-concepto', { title: 'Concepto que pregunta' }, t));
    fila.hidden = false;
  }).catch(() => {});
  return fila;
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
  if (route.parts[1] === 'repaso') return repasoView({ progress });
  if (route.parts[1] === 'rapido') return rapidoView({ progress, seed });
  const ut = Number(route.parts[2]);
  const b = bloque(E, ut);
  const soloFalladas = route.query.f === '1';
  if (!b) return { el: h('div.practice', h('p', 'Este tema no existe.'), h('a.btn', { href: tlink(T.id, ['temario']) }, 'Ir al temario')), summary: () => 'ERROR tema no encontrado' };
  const tit0 = T.id;
  const ayudas = crearAyudas({ modo: 'tanda', tit: tit0, ut });
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); }, derecha: ayudas.barra });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, ayudas.panel, cont);
  let summaryText = `VISTA tanda de preguntas · ${b.titulo}${soloFalladas ? ' (solo falladas)' : ''}`;

  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit0), cargarCurso(tit0, eje)]).then(([{ estudio: preguntas, explicaciones, reglasDe: rd, vocab }, curso]) => {
    reglasDe = rd;
    const respuestas = progress.get().exams;
    // Tema sin empezar (ni clases ni preguntas): se avisa antes de preguntar lo que aún no se ha explicado.
    const clases = (curso?.modulos ?? []).filter((m) => m.ut === ut).flatMap((m) => m.lecciones);
    const regs = progress.lecciones();
    const empezado = clases.some((l) => regs[l.id]) || preguntas.some((q) => q.ut === ut && respuestas[q.id]);
    if (!soloFalladas && !empezado && clases.length && route.query.ya !== '1') {
      barra.set(b.titulo, 0);
      summaryText = `VISTA tanda · ${b.titulo}: AVISO tema sin empezar`;
      setChildren(cont, h('section.tema-sin-empezar',
        h('h2', 'Aún no has visto este tema'),
        h('p', 'Las preguntas serán de cosas que todavía no te hemos explicado. Lo normal es empezar por su primera clase.'),
        h('a.btn.grande', { href: tlink(tit0, ['curso', clases[0].id]) }, `Empezar: ${clases[0].titulo}`),
        h('a.btn.secondary.grande', { href: tlink(tit0, ['teoria', 'ut', String(ut)], { s: seed, ya: '1' }) }, 'Probar el test igualmente')));
      return;
    }
    const fails = new Set(Object.entries(respuestas).filter(([, v]) => !v.ok).map(([k]) => k));
    const sesion = buildPractica(preguntas, ut, createRng(seed), { soloFalladas: soloFalladas ? fails : null, respuestas, limite: TANDA });
    if (!sesion.preguntas.length) {
      barra.set(b.titulo, 0);
      setChildren(cont, h('p.vacio', soloFalladas ? 'No tienes fallos pendientes en este tema.' : 'Aún no hay preguntas de este tema.'),
        h('a.btn.grande', { href: tlink(tit0, ['temario', String(ut)]) }, 'Volver al tema'));
      return;
    }
    setChildren(cont, tandaPreguntas({
      preguntas: sesion.preguntas, explicaciones, progress, barra, vocab, ayudas, rotulo: `${b.icon} ${b.titulo}${soloFalladas ? ' · tus fallos' : ''}`,
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n, min) => {
        progress.logActividad(min);
        barra.remove();
        pintarCierre(cont, progress, tit0, cierreTanda(ok, n));
        summaryText = `VISTA tanda terminada · ${b.titulo}: ${ok} de ${cuenta(n, 'acierto')}`;
        window.scrollTo(0, 0);
      },
    }));
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// #/<tit>/teoria/mezcla?s=semilla — repaso mezclado: 10 preguntas de los temas ya empezados, por turnos
function mezclaView({ progress, seed }) {
  const tit0 = T.id;
  const ayudas = crearAyudas({ modo: 'mezcla', tit: tit0 });
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); }, derecha: ayudas.barra });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, ayudas.panel, cont);
  let summaryText = 'VISTA repaso mezclado';
  cargarBanco(currentEje(progress), tit0).then(({ estudio: preguntas, explicaciones, reglasDe: rd, vocab }) => {
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
      preguntas: sesion.preguntas, explicaciones, progress, barra, vocab, ayudas, rotulo: `🔀 Repaso mezclado · ${cuenta(empezados.length, 'tema')}`, temaEnCadaPregunta: true,
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n, min) => {
        progress.logActividad(min);
        progress.setSetting(`mezclado_${tit0}`, new Date().toLocaleDateString('sv-SE'));
        barra.remove();
        pintarCierre(cont, progress, tit0, { ...cierreTanda(ok, n), extra: remateMapas(tit0, empezados) });
        summaryText = `VISTA repaso mezclado terminado: ${ok} de ${cuenta(n, 'acierto')}`;
        window.scrollTo(0, 0);
      },
    }));
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// #/<tit>/teoria/repaso — repaso espaciado de fallos (B1): las preguntas que tocan hoy, de 10 en 10. Si el banco tiene
// sus preguntas etiquetadas por concepto, lo que vuelve es la IDEA: otra pregunta del mismo concepto y del mismo banco
// (nunca reservada para el examen final, anulada ni retirada), y el concepto solo se da por repasado al acertar esa
// otra. Sin etiquetas, o si la idea no tiene otra pregunta, vuelve la misma, como siempre.
function repasoView({ progress }) {
  const tit0 = T.id;
  const ayudas = crearAyudas({ modo: 'repaso', tit: tit0 });
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); }, derecha: ayudas.barra });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, ayudas.panel, cont);
  let summaryText = 'VISTA repaso de fallos';
  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit0), conceptosDelBanco(eje, tit0)]).then(([banco, ic]) => {
    const { estudio: preguntas, explicaciones, reglasDe: rd, vocab } = banco;
    reglasDe = rd;
    const clave = banco.eje.id;
    const hoy = diaLocal();
    const conc = () => (ic ? { principalDe: ic.principalDe, estado: progress.repasoConceptos(clave, tit0) } : null);
    const cola = colaRepaso(preguntas, progress.get().exams, hoy, conc());
    if (!cola.hoy.length) {
      barra.set('Repaso de fallos', 0);
      setChildren(cont, h('p.vacio', cola.total ? `Hoy no te toca repasar nada. Tienes ${cuenta(cola.total, cola.porConcepto ? 'fallo' : 'pregunta', cola.porConcepto ? 'fallos' : 'preguntas')} en la cola para los próximos días.` : 'No tienes fallos por repasar. Las preguntas que falles volverán aquí al día siguiente.'),
        h('a.btn.grande', { href: tlink(tit0) }, 'Volver a Hoy'));
      return;
    }
    const enEstudio = new Set(preguntas.map((q) => q.id));
    // Una idea que sale floja por segunda vez no se vuelve a preguntar hasta que el alumno mire su ficha (src/course/
    // ficha.js): se le ofrece la ficha en lugar de otra pregunta. Abierta la ficha, vuelve al repaso como siempre.
    const vistas = progress.fichasVistas(clave, tit0);
    const conFicha = ic ? cola.items.filter((x) => x.concepto && estadoFicha(ic, x.concepto, progress.get().exams, vistas).pendiente) : [];
    const avisoFichas = conFicha.length ? h('aside.fichas-antes', { 'aria-label': 'Ideas que se te resisten' },
      h('p', h('strong', conFicha.length === 1 ? 'Esta idea se te resiste.' : 'Estas ideas se te resisten.'), ' En vez de otra pregunta, mira su ficha: es un minuto.'),
      h('ul', conFicha.map((x) => h('li', h('a.btn.secondary.small', { href: hrefFicha(tit0, x.concepto, 'repaso') }, `Ficha: ${ic.concepto(x.concepto)?.etiqueta ?? x.concepto}`))))) : null;
    const items = cola.items.filter((x) => !conFicha.includes(x));
    if (!items.length) {
      barra.set('Repaso de fallos', 0);
      const ses = botonesSesion();
      setChildren(cont, avisoFichas, ses ? h('div.botones', ses) : h('a.btn.grande', { href: tlink(tit0) }, 'Volver a Hoy'));
      summaryText = `VISTA repaso de fallos · solo fichas: ${conFicha.map((x) => x.concepto).join(', ')}`;
      return;
    }
    const plan = planRepaso(items.slice(0, TANDA), progress.get().exams, ic, { hoy, enEstudio });
    const tanda = plan.map((x) => x.q);
    const hace = (q) => {
      const t = progress.get().exams[q.id]?.t;
      const dias = t ? Math.round((Date.parse(`${hoy}T12:00`) - Date.parse(`${diaLocal(Date.parse(t))}T12:00`)) / 864e5) : null;
      return dias == null || dias > 30 ? 'Hace un tiempo' : dias <= 0 ? 'Hoy' : dias === 1 ? 'Ayer' : `Hace ${cuenta(dias, 'día')}`;
    };
    // Fichas de las ideas de una pregunta (la que se repasa primero, luego la segunda etiqueta): solo conceptos de este
    // temario con preguntas de estudio. Antes de responder no se nombran (a veces el nombre delata la respuesta).
    const fichasDe = (q, principal) => {
      if (!ic) return [];
      const ids = [...new Set([principal, ...ic.conceptosDe(q.id)].filter(Boolean))];
      return ids.filter((id) => { const c = ic.concepto(id); return c?.tipo === 'concepto' && (c.tit ?? []).includes(tit0); });
    };
    const enlacesFicha = (q, principal, conNombre) => {
      const ids = fichasDe(q, principal);
      if (!ids.length) return null;
      const enlace = (id, k) => h('a.enlace-ficha', { href: hrefFicha(tit0, id, 'repaso') },
        conNombre ? `Ficha: ${ic.concepto(id)?.etiqueta ?? id}` : ids.length === 1 ? '📖 Repasar la ficha antes de responder' : `📖 Ficha ${k + 1}`);
      return h(conNombre ? 'span.ficha-despues' : 'p.ficha-antes', conNombre ? null : ids.length > 1 ? 'Repasar antes de responder: ' : null, ids.flatMap((id, k) => (k ? [' · ', enlace(id, k)] : [enlace(id, k)])));
    };
    setChildren(cont, tandaPreguntas({
      preguntas: tanda, explicaciones, progress, barra, vocab, ayudas, rotulo: `🔁 Repaso de fallos · ${cola.hoy.length} para hoy`, temaEnCadaPregunta: true,
      // Las fichas pendientes se ofrecen al final (nombrar ideas antes de responder podría dar pistas).
      avisoDe: (i, q) => [
        // Repasar de verdad: la ficha de la idea (sin nombrarla, para no dar pistas) antes de responder.
        enlacesFicha(q, plan[i].item.concepto, false),
        plan[i].variante ? h('p.aviso-variante', `${hace(plan[i].item.q)} fallaste una pregunta de esta idea. Te la traigo `, h('strong', 'con otra redacción'), ', para comprobar que la entiendes y no que recuerdas la letra.') : null],
      alResponder: (i, q, ok) => {
        const { item, variante } = plan[i];
        if (!item.concepto) return null;
        // El estado de la idea, aparte del de la pregunta (que ya ha guardado recordExam).
        const nuevo = siguienteRepasoConcepto(item.rep, ok, hoy, new Date().toISOString());
        progress.recordRepasoConcepto(clave, tit0, item.concepto, nuevo);
        const otra = variante ? ', con otra pregunta' : '';
        const fichas = enlacesFicha(q, item.concepto, true);
        let msg = null;
        if (!ok) {
          // Segundo fallo de la idea: en vez de insistir con más preguntas, su ficha.
          msg = estadoFicha(ic, item.concepto, progress.get().exams, progress.fichasVistas(clave, tit0)).necesita
            ? 'Esta idea se te resiste: antes de otra pregunta, mira su ficha.'
            : `Esta idea vuelve mañana${variante ? ', con una pregunta distinta' : ''}.`;
        } else if (nuevo.fuera) msg = 'Idea repasada: ya no vuelve al repaso.';
        else if (nuevo.prox > hoy) msg = `Esta idea vuelve dentro de ${cuenta(Math.round((Date.parse(`${nuevo.prox}T12:00`) - Date.parse(`${hoy}T12:00`)) / 864e5), 'día')}${otra}.`;
        return msg || fichas ? [msg, msg && fichas ? ' ' : null, fichas] : null;
      },
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n, min) => {
        progress.logActividad(min);
        barra.remove();
        const quedan = colaRepaso(preguntas, progress.get().exams, diaLocal(), conc()).hoy.length;
        const ideas = plan.some((x) => x.item.concepto);
        pintarCierre(cont, progress, tit0, { icono: ok === n ? '🎉' : '💪', titulo: `${ok} de ${n}`,
          lineas: [ok === n ? 'Todas bien: volverán más adelante para afianzarlas.' : ideas ? 'Las ideas que has fallado vuelven mañana, con otra pregunta; las acertadas, dentro de unos días.' : 'Las que has fallado vuelven mañana; las acertadas, dentro de unos días.',
            quedan ? `Te quedan ${quedan} por repasar hoy.` : 'Repaso de hoy terminado.'],
          extra: h('div', avisoFichas, remateMapas(tit0, [...new Set(tanda.map((q) => q.ut))])) });
        summaryText = `VISTA repaso terminado: ${ok} de ${n} · quedan ${quedan} hoy`;
        window.scrollTo(0, 0);
      },
    }));
    summaryText = `VISTA repaso de fallos · ${cola.hoy.length} tocan hoy · ${cola.total} en la cola${cola.porConcepto ? ' · por concepto' : ''}\n` +
      `TANDA: ${plan.map((x) => `${x.q.id}${x.variante ? ` (variante de ${x.item.q.id}, concepto ${x.item.concepto})` : x.item.concepto ? ` (concepto ${x.item.concepto}, sin variante)` : ''}`).join(' · ')}`;
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// #/<tit>/teoria/rapido?s=semilla — «5 minutos» (B8): 5 preguntas, primero las del repaso
function rapidoView({ progress, seed }) {
  const tit0 = T.id;
  const ayudas = crearAyudas({ modo: 'rapido', tit: tit0 });
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit0); }, derecha: ayudas.barra });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, ayudas.panel, cont);
  let summaryText = 'VISTA 5 minutos';
  cargarBanco(currentEje(progress), tit0).then(({ estudio: preguntas, explicaciones, reglasDe: rd, vocab }) => {
    reglasDe = rd;
    const tanda = tandaRapida(preguntas, progress.get().exams, createRng(seed));
    setChildren(cont, tandaPreguntas({
      preguntas: tanda, explicaciones, progress, barra, vocab, ayudas, rotulo: '⏱ 5 minutos', temaEnCadaPregunta: true,
      onSummary: (t) => { summaryText = t; },
      onFin: (ok, n, min) => {
        progress.logActividad(min);
        progress.ganarInsignia(currentEje(progress), tit0, 'guardia'); // «Guardia de 5 minutos» (src/course/travesia.js): completar la tanda
        barra.remove();
        pintarCierre(cont, progress, tit0, { icono: ok >= n - 1 ? '🎉' : '💪', titulo: `${ok} de ${n}`, lineas: ['Cinco minutos bien aprovechados. Las que has fallado vuelven mañana al repaso.'] });
        summaryText = `VISTA 5 minutos terminado: ${ok} de ${n}`;
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

/** «Abrir la carta» en un examen: sin ayudas de práctica y, si no se permite, sin el botón de la calculadora. */
const cartaDeExamen = (q, progress, calculadora) => botonCarta(q, progress, null, { calculadora });

export function testView({ ctx, progress, params: route, tit }) {
  chartRef = ctx.chart;
  useTit(tit);
  const T0 = T;
  const E0 = E;
  const tipo = route.parts[1] === 'real' ? 'real' : route.parts[1] === 'final' ? 'final' : 'simulacro';
  const conv = tipo === 'real' ? route.parts[2] : null;
  const seedQ = Number(route.query.s) || null;
  const el = h('div.test', h('p.muted', 'Preparando el examen…'));
  let summaryText = 'VISTA examen (cargando)';
  // Calculadora: solo si en el examen de esta titulación se permite (src/calculadora/reglas.js). Mientras se carga la
  // ficha del eje, lo de la titulación; en un examen sin calculadora se cierra y no se puede abrir.
  let permitida = calculadoraPermitida(T0.id, null);
  if (!permitida) bloquearCalculadora(el);

  // El examen final necesita el estado del motor (si está abierto y qué convocatoria toca).
  Promise.all([cargarBanco(currentEje(progress), T0.id), tipo === 'final' ? calcularPlan(progress, T0.id) : null]).then(([banco, plan]) => {
    const { explicaciones, reglasDe: rd, vocab: vocabBanco } = banco;
    permitida = calculadoraPermitida(T0.id, banco.eje);
    if (permitida) desbloquearCalculadora(el); else bloquearCalculadora(el);
    const eje = banco.eje.id;
    const fin = plan?.st.final ?? null;
    reglasDe = rd;
    const tc = progress.testEnCurso();
    const mismo = deTitEje(tc, T0.id, eje) && tc.tipo === tipo && (tipo === 'real' ? tc.conv === conv : tipo === 'final' ? true : seedQ != null && tc.seed === seedQ);
    if (mismo) correr(tc);
    else inicio(tc);

    // --- pantalla de inicio
    function inicio(otro) {
      const seed = seedQ ?? randomSeed();
      const respuestasAntes = progress.get().exams;
      if (tipo === 'final' && !fin?.desbloqueado) {
        summaryText = `VISTA examen final ${T0.sigla}: CERRADO · ${fin?.lineas.join(' ') ?? 'este eje no reserva exámenes'}`;
        setChildren(el, h('div.inicio-examen', h('h1', '🔒 Examen final'), (fin?.hay ? fin.lineas : ['Este tribunal no tiene exámenes reservados en la app.']).map((l) => h('p', l)),
          h('a.btn.grande', { href: tlink(T0.id, ['examenes']) }, 'Volver a Examen')));
        return;
      }
      const test = tipo === 'final'
        ? buildFinal(E0, { modo: banco.reserva.modo, key: fin.siguiente?.key, examenes: banco.reserva.examenes, porId: banco.porId, pool: banco.final, respuestas: respuestasAntes, rng: createRng(seed) })
        : construirTest(E0, banco, tipo, conv, seed, respuestasAntes);
      if (!test.preguntas.length) { setChildren(el, h('p.warn', 'No hay preguntas para este examen.'), h('a.btn.grande', { href: tlink(T0.id, ['examenes']) }, 'Volver')); return; }
      const empezar = () => {
        // nuevas: las que no había respondido nunca (un examen inédito pesa más en «¿Estás listo?»).
        const nuevo = { tit: T0.id, eje, tipo, conv: tipo === 'final' ? test.key : conv, seed: tipo === 'simulacro' ? seed : null, ids: test.preguntas.map((q) => q.id), nuevas: nuevasDe(test.preguntas, respuestasAntes), respuestas: {}, i: 0, consumidoMs: 0 };
        progress.saveTestEnCurso(nuevo);
        if (tipo === 'simulacro' && seedQ !== seed) navigate([T0.id, 'test', 'simulacro'], { s: String(seed) }, { replace: true });
        correr(progress.testEnCurso());
      };
      const limites = E0.bloques.filter((b) => b.maxErrores != null);
      summaryText = `VISTA inicio del examen «${test.titulo}» ${T0.sigla} · ${cuenta(test.preguntas.length, 'pregunta')} · ${E0.duracionMin} min (aún no ha empezado)${otro ? ` · hay otro examen a medias → ${rutaTest(otro)}` : ''}`;
      setChildren(el,
        h('div.inicio-examen',
          h('h1', test.titulo),
          h('ul.datos-examen',
            h('li', `${cuenta(test.preguntas.length, 'pregunta')}`),
            h('li', `${cuenta(E0.duracionMin, 'minuto')}`),
            h('li', `Apruebas con ${cuenta(E0.minAciertos, 'acierto')}`),
            limites.map((b) => h('li', `${b.icon} ${b.titulo}: como mucho ${cuenta(b.maxErrores, 'fallo')}`)),
            h('li', permitida ? '🧮 Con calculadora científica (botón arriba, junto al reloj)' : 'Sin calculadora')),
          test.faltan.length ? h('p.warn', `Aviso: faltan preguntas en el banco para ${test.faltan.map((f) => bloque(E0, f.ut)?.titulo ?? f.ut).join(', ')}; el ${tipo === 'final' ? 'examen' : 'simulacro'} no está completo.`) : null,
          tipo === 'final' ? [fin.lineas.map((l) => h('p', l)), h('p.aviso-final', 'Como el día del examen: solo tú, el reloj y las reglas del tribunal. Al terminar, el profe te explica tus fallos.')] : null,
          test.avisoVistas ? h('p.aviso-vistas', `Ya has respondido el ${Math.round(test.vistas * 100)} % de las preguntas de estudio: este simulacro repetirá muchas que ya has visto y aprobarlo dice menos. La prueba de verdad es el examen final, con preguntas reservadas.`) : null,
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
    function correr(guardado) {
      const test = rehacerTest(E0, banco, guardado);
      // Un examen guardado sin sus preguntas (de antes de guardarlas) las guarda desde ya.
      const estado = { ...guardado, eje: guardado.eje ?? eje, ids: test.preguntas.map((q) => q.id) };
      const n = test.preguntas.length;
      if (!n) { progress.saveTestEnCurso(null); setChildren(el, h('p.warn', 'No hay preguntas para este examen.')); return; }
      // Modo examen (src/ui/modo-examen.js): la señal para que no se ofrezca ninguna ayuda de práctica; la calculadora,
      // la regla de la ficha del eje (calculadoraPermitida).
      fijarModoExamen(tipo === 'final' ? 'final' : 'examen', { calculadora: permitida });
      const respuestas = { ...(estado.respuestas ?? {}) };
      let i = Math.min(Math.max(0, estado.i ?? 0), n - 1);
      let consumido = estado.consumidoMs ?? 0;
      const limite = E0.duracionMin * 60000;
      let ultimo = Date.now();
      let ultimoGuardado = Date.now();
      let activo = true;
      let terminado = false;
      const reloj = h('span.reloj');
      const barra = barraActividad({ texto: '', onSalir: salir, derecha: [permitida ? botonCalculadora({ texto: '' }) : null, reloj] });
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
        // Empezado sin querer (sin ninguna respuesta): se cancela, no se queda «a medias» en Hoy.
        if (!Object.keys(respuestas).length) {
          limpiar();
          progress.saveTestEnCurso(null);
          avisoBreve('Examen cancelado: no habías respondido ninguna pregunta.');
          location.hash = tlink(T0.id);
          return;
        }
        dejar();
        avisoBreve('Guardado. Puedes seguir cuando quieras (o descartarlo desde Hoy).');
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
          cartaDeExamen(q, progress, permitida),
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
          h('p.muted', `${n - sinResponder()} de ${cuenta(n, 'respondida')}`),
          h('div.rejilla', test.preguntas.map((q, j) => h('button.celda', { type: 'button', class: [respuestas[q.id] ? 'hecha' : '', j === i ? 'actual' : ''].join(' '), 'aria-label': `Pregunta ${j + 1}${respuestas[q.id] ? ', respondida' : ''}`,
            onclick: () => { panel.hidden = true; ir(j); } }, String(j + 1)))),
          h('button.grande', { type: 'button', onclick: () => { panel.hidden = true; finish(false); } }, 'Terminar y corregir'));
        panel.hidden = false;
      }
      function resumen() {
        summaryText = `EXAMEN EN CURSO · ${test.titulo} · pregunta ${i + 1} de ${n} · ${n - sinResponder()}/${cuenta(n, 'respondida')} · calculadora: ${permitida ? 'permitida' : 'no permitida'} (sin corregir: el alumno está haciendo el examen; no des respuestas)`;
      }

      function finish(porTiempo = false) {
        if (terminado) return;
        const quedan = sinResponder();
        if (!porTiempo && quedan && !confirm(`Te quedan ${cuenta(quedan, 'pregunta')} sin responder y contarán como fallo. ¿Terminar de todos modos?`)) return;
        contar();
        limpiar();
        terminado = true;
        fijarModoExamen(null);
        const g = grade(E0, test, respuestas);
        // Las retiradas no se guardan: no se estudian y su respuesta oficial ya no vale.
        for (const d of g.detalle) if (d.respuesta && !d.retirada) progress.recordExam(d.id, { choice: d.respuesta, ok: d.ok });
        const minutos = Math.max(1, Math.round(consumido / 60000));
        progress.recordTest({ tit: T0.id, eje, conv: test.tipo === 'real' || test.tipo === 'final' ? estado.conv : undefined, tipo: test.tipo, titulo: test.titulo, aciertos: g.aciertos, total: g.total, apto: g.apto, minutos,
          nuevas: estado.nuevas ?? undefined,
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
      // Dentro de una sesión de estudio se sigue en modo concentración (la barra de la sesión manda).
      if (!document.body.classList.contains('en-sesion')) document.body.classList.remove('focus');
      // Los temas, en el mismo orden que en Temario y Progreso.
      g = { ...g, bloques: [...g.bloques].sort((a, b) => posEstudio(E0, a.ut) - posEstudio(E0, b.ut)) };
      summaryText = `RESULTADO ${test.titulo}: ${g.aciertos}/${g.total} ${g.apto == null ? '' : g.apto ? 'APTO' : 'NO APTO'}\n` +
        g.bloques.map((b) => `${b.titulo}: ${b.aciertos}/${b.total}${b.maxErrores != null ? ` (máx. errores ${b.maxErrores})` : ''}`).join('\n') +
        `\nFALLADAS: ${g.detalle.filter((d) => !d.ok).map((d) => `${d.id} (marcó ${d.respuesta ?? '—'}, correcta ${d.correcta})`).join(', ')}`;
      const filtro = { value: 'falladas' };
      const review = h('div.review');
      const renderReview = () => setChildren(review, test.preguntas.map((q, j) => {
        const d = g.detalle[j];
        if (filtro.value === 'falladas' && d.ok && !d.retirada) return null;
        // Una línea por pregunta (se ve todo el examen de un vistazo); al tocarla, la pregunta y el profe (se pintan al abrir).
        const b = bloque(E0, q.ut);
        const cuerpo = h('div.revision-cuerpo');
        const det = h('details.revision-pregunta', { class: d.retirada ? 'retirada' : d.ok ? 'ok' : 'bad', ontoggle: () => {
          if (det.open && !cuerpo.childElementCount) cuerpo.append(questionCard(q, { number: j + 1, chosen: d.respuesta, reveal: true, lock: true, vocab: vocabBanco }), profePanel(q, explanationFor(q, explicaciones), d.respuesta));
        } },
        h('summary',
          h('span.revision-num', String(j + 1)),
          h('span.revision-texto', h('span.revision-tema', b ? `${b.icon} ${b.titulo}` : ''), h('span.revision-enunciado', (q.enunciado ?? '').slice(0, 90) + ((q.enunciado ?? '').length > 90 ? '…' : '')),
            h('span.revision-dato', d.retirada ? 'Retirada: la norma ha cambiado y no cuenta en la nota' : d.ok ? `Bien: la ${d.correcta})` : d.respuesta ? `Marcaste la ${d.respuesta}); era la ${d.correcta})` : `En blanco; era la ${d.correcta})`))),
        cuerpo);
        return det;
      }));
      const filterSel = h('select', { onchange: (ev) => { filtro.value = ev.target.value; renderReview(); } },
        h('option', { value: 'falladas' }, 'Solo las falladas'), h('option', { value: 'todas' }, 'Todas'));
      renderReview();
      const conFallos = g.bloques.filter((b) => b.errores > 0).sort((a, b) => b.errores - a.errores);
      const tituloRevision = h('h2#revision', 'Repasa tus fallos con el profe');
      // Examen final: si has aprobado con margen (lo dice el motor, con el examen ya guardado).
      const lineaFinal = h('p.linea-final');
      if (test.tipo === 'final') {
        calcularPlan(progress, T0.id).then(({ st }) => {
          lineaFinal.textContent = `Examen final: ${st.final.lineasResultado[0] ?? ''}`;
          lineaFinal.classList.toggle('ok', st.final.preparado);
          summaryText += `\nEXAMEN FINAL: ${st.final.lineasResultado[0] ?? ''}`;
        }).catch(() => {});
      }
      const ses = botonesSesion();
      const repasar = g.errores ? h('button.grande', { type: 'button', class: ses ? 'secondary' : '', onclick: () => tituloRevision.scrollIntoView({ behavior: 'smooth' }) }, 'Repasar mis fallos con el profe') : null;
      // En una sesión de estudio (src/ui/sesion.js), lo primero es seguir con ella (arriba); el repaso de fallos, a mano.
      const botonesFin = ses ? h('div.botones-columna', ses[0], repasar, ses.slice(1))
        : h('div.botones-columna', repasar, h('a.btn.grande', { href: tlink(T0.id), class: g.errores ? 'secondary' : '' }, 'Volver a Hoy'));
      setChildren(el,
        h('header.resultado', h('h1', g.apto == null ? 'Resultado' : g.apto ? '✅ APTO' : '❌ NO APTO'),
          test.tipo === 'final' ? lineaFinal : null,
          h('p', `${cuenta(g.aciertos, 'acierto')} de ${g.total}${porTiempo ? ' · se acabó el tiempo' : ''}.`),
          g.motivos.length ? h('ul.warn', g.motivos.map((m) => h('li', m))) : null),
        ses ? botonesFin : null,
        conFallos.length
          ? h('table.stats.fallos-tema', h('thead', h('tr', h('th', 'Tema'), h('th', 'Fallos'))),
            h('tbody', conFallos.map((b) => {
              const suspenso = b.maxErrores != null && b.errores > b.maxErrores;
              return h('tr', { class: suspenso ? 'bad' : '' },
                h('td', `${b.icon} ${b.titulo}`, suspenso ? h('div.suspenso', `Aquí está el suspenso: máximo ${cuenta(b.maxErrores, 'fallo')}`) : null),
                h('td', String(b.errores)));
            })))
          : h('p.ok', 'Sin fallos. Enhorabuena.'),
        ses ? null : botonesFin,
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
