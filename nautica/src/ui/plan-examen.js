// Interfaz del simulacro con estrategia (R-57) y del ensayo general (R-66). La lógica, sin DOM y con sus tests, está en
// src/course/plan-examen.js (reparto, aviso, informe, cansancio) y src/course/descarte.js (estimar y descartar); aquí se
// reúnen los datos del alumno (sus tiempos por tipo, sus fallos abiertos del cuaderno) y se pintan las piezas:
//  - `prepararPlan` y `pantallaPrimerMinuto`: antes de que corra el reloj;
//  - `lineaAvisoPlan` y `avisoDelPlan`: el aviso discreto durante el examen (una línea, sin ventanas ni sonidos);
//  - `seccionInformePlan`: el informe al terminar (plan frente a lo hecho, dónde estimar y, si lo hay, el cansancio).
// La vista del examen (src/ui/views/theory.js) y la del ensayo en papel (src/ui/views/ensayo.js) solo llaman a esto.

import { h } from './dom.js';
import { icono, conIcono } from './iconos.js';
import { cuenta } from '../texto.js';
import { loadEstrategia } from '../store/datasets.js';
import { tiemposAlumno } from '../store/tiempos.js';
import { SOLUCIONES, esDeCarta } from '../bancos/index.js';
import { tiempoDisponible } from '../course/estrategia.js';
import { velocidadPorTipo, tipoDePregunta, duracion } from '../course/velocidad.js';
import { cuadernoDe, nombreFallo } from '../course/cuaderno.js';
import { focoModulo } from '../course/foco.js';
import { REGLAS_DESCARTE } from '../course/descarte.js';
import { clasificar, planExamen, planCompacto, primerMinuto, avisoPlan, hitoActual, informePlan, cansancio, partesGeneral, resumenGeneral, resumenPlan, COSTES, COSTES_ORIENTATIVOS } from '../course/plan-examen.js';

export { resumenPlan };

const deTitEje = (x, tit, eje) => (x?.tit ?? 'per') === tit && x?.eje === eje;
const lista = (ns) => (ns.length > 1 ? `${ns.slice(0, -1).join(', ')} y ${ns.at(-1)}` : String(ns[0] ?? ''));
const ICONO_COSTE = { facil: 'ok', normal: 'reloj', caro: 'aviso' };

/**
 * El plan de un examen (o de una parte) con los datos del alumno: su tiempo por tipo (exámenes y práctica), los fallos
 * abiertos de su cuaderno y el tiempo del tribunal.
 * @param {{ T: object, estructura: object, preguntas: object[], progress: object, eje: string, tipoDe?: (q) => string, esCarta?: (q) => boolean }} o
 * @returns {Promise<{ items, plan, compacto, primer }>}
 */
export async function prepararPlan({ T, estructura, preguntas, progress, eje, tipoDe = null, esCarta = esDeCarta }) {
  const datos = await loadEstrategia().catch(() => null);
  const cfg = datos?.tiempo ?? {};
  const disp = tiempoDisponible(T, cfg);
  const tests = progress.tests().filter((t) => deTitEje(t, T.id, eje));
  let practica = [];
  try { practica = tiemposAlumno().lista(); } catch { practica = []; }
  const filas = velocidadPorTipo({ tests, practica, disponibleCartaS: disp.cartaS, disponibleTeoriaS: disp.teoriaS });
  const fallosPorTipo = {};
  for (const f of cuadernoDe(progress.settings?.() ?? {}).abiertos) (fallosPorTipo[f.y] ??= []).push(nombreFallo(f).titulo);
  const tipoDe_ = tipoDe ?? ((q) => tipoDePregunta(q, SOLUCIONES[q.id], { cartaUt: T.cartaUt, deCarta: esDeCarta(q) }));
  const tipos = Object.fromEntries(preguntas.map((q) => [q.id, tipoDe_(q)]));
  const items = clasificar({ preguntas, tipos, filas, disp, fallosPorTipo });
  const plan = planExamen({ items, estructura, duracionMin: estructura.duracionMin, repasoFraccion: cfg.repasoFraccion ?? 0.1 });
  return { items, plan, compacto: planCompacto(plan), primer: primerMinuto({ preguntas, items, esDeCarta: esCarta }) };
}

/** Las partes del ensayo general, con el foco del alumno (PY: solo el módulo que prepara). */
export function partesDelGeneral(T, settings = {}) {
  const partes = partesGeneral(T.estructura, focoModulo(settings, T.id, T.estructura));
  return { partes, ...resumenGeneral(partes) };
}

/** Etiqueta del coste con icono y texto (nunca solo el color). */
function etiquetaCoste(r) {
  const txt = (r.fuente === 'tuyo' ? COSTES : COSTES_ORIENTATIVOS)[r.coste];
  return h('span.pm-coste', { 'data-coste': r.coste }, icono(ICONO_COSTE[r.coste], 'ico-t'), txt);
}

/** Las reglas de estimar y descartar, plegadas (para leerlas antes del reloj, nunca durante). */
export function reglasDescarteEl({ abierto = false } = {}) {
  return h('details.pm-descartar', { open: abierto },
    h('summary', conIcono('lupa', 'Estimar y descartar cuando no da tiempo')),
    h('p.muted.small', 'Solo lo que los datos del enunciado permiten descartar seguro. Lo que quede, márcalo: en blanco también cuenta como fallo.'),
    h('ul.pm-reglas', REGLAS_DESCARTE.map((r) => h('li', h('strong', r.nombre), '. ', r.explica))));
}

/** El reparto del tiempo: fases con sus preguntas y minutos, hitos y lo que no merece la pena si vas justo. */
export function repartoEl(plan) {
  return h('section.pm-reparto', { 'aria-labelledby': 'pm-reparto-t' },
    h('h2#pm-reparto-t', conIcono('reloj', 'Tu reparto del tiempo')),
    h('ol.pm-fases', plan.fases.map((f) => h('li.pm-fase',
      h('span.pm-fase-cab', h('strong', f.titulo), h('span.pm-min', `${f.minutos} min`)),
      h('span.pm-fase-num', `Preguntas ${lista(f.numeros)}`),
      h('span.muted.small', f.texto ?? '')))),
    h('p.small', `Mira el reloj en estos hitos: ${plan.hitos.map((x) => `minuto ${x.minuto}, ${x.texto.toLowerCase()}`).join('; ')}.`),
    plan.prescindibles.length ? h('p.pm-justo', icono('aviso', 'ico-t'), h('span', h('strong', 'Si vas justo, no merecen la pena: '), `${lista(plan.prescindibles)}. `,
      'Antes de dejarlas, descarta lo imposible y marca una: en blanco también cuenta como fallo.')) : null,
    plan.cabe ? null : h('p.pm-justo', icono('reloj', 'ico-t'), `Con tu ritmo de ahora no cabe todo: te faltarían unos ${cuenta(Math.round(plan.faltaS / 60), 'minuto')}. El plan reparte lo que hay.`),
    plan.conDatos ? null : h('p.muted.small', 'Aún sin tus tiempos de carta: reparto orientativo. Con tus simulacros se ajusta a ti.'));
}

/**
 * La pantalla del primer minuto: hojear el cuadernillo antes de que corra el reloj.
 * @param {{ titulo: string, sub?: string, primer: object, plan: object, onEmpezar: () => void, volver?: { texto: string, href: string } | null, antes?: any }} o
 */
export function pantallaPrimerMinuto({ titulo, sub = null, primer, plan, onEmpezar, volver = null, antes = null }) {
  return h('div.inicio-examen.primer-minuto',
    antes,
    h('p.lc-eti', icono('reloj', 'ico-t'), 'El primer minuto'),
    h('h1', titulo),
    h('p', sub ?? 'Antes de que corra el reloj, hojea el cuadernillo como en el examen: localiza lo que vas a necesitar y decide el orden.'),
    h('section.pm-localizar', { 'aria-labelledby': 'pm-loc-t' },
      h('h2#pm-loc-t', conIcono('lupa', '1. Localiza')),
      primer.localizar.length ? h('ul.pm-checks', primer.localizar.map((x, i) => h('li', h('label.check', h('input', { type: 'checkbox', id: `pm-loc-${i}` }),
        h('span', h('strong', `${x.titulo}: `), `${x.numeros.length > 1 ? 'preguntas' : 'pregunta'} ${lista(x.numeros)}. `, h('span.muted.small', x.texto)))))) : h('p.muted', 'Este examen no trae tablas ni anexos.'),
      primer.faros.length ? h('p.small', h('strong', 'En la carta: '), `${primer.faros.join(', ')}.`) : null),
    h('section.pm-recuento', { 'aria-labelledby': 'pm-rec-t' },
      h('h2#pm-rec-t', conIcono('lista', '2. Qué trae')),
      h('ul.pm-tipos', primer.recuento.map((r) => h('li.pm-tipo', { 'data-coste': r.coste },
        h('span.pm-tipo-cab', h('span.pm-tipo-nombre', `${r.nombre} × ${r.numeros.length}`), etiquetaCoste(r)),
        h('span.muted.small', `${r.numeros.length > 1 ? 'Preguntas' : 'Pregunta'} ${lista(r.numeros)} · ${r.motivo}`)))),
      primer.conDatos ? h('p.muted.small', '«Fácil» y «cara» salen de tus tiempos y tus aciertos por tipo, y de tu cuaderno de fallos.') : h('p.muted.small', 'Sin tus tiempos aún: las etiquetas son orientativas (lo que suele costar cada tipo).')),
    repartoEl(plan),
    reglasDescarteEl(),
    h('div.botones-columna', h('button.grande', { type: 'button', onclick: onEmpezar }, conIcono('reloj', 'Empieza el reloj'))),
    volver ? h('p.centrado', h('a', { href: volver.href }, volver.texto)) : null);
}

/** La línea del aviso discreto (oculta mientras no hay nada que decir). */
export function lineaAvisoPlan() {
  const txt = h('span');
  // La pista general del tipo, plegada: el aviso se queda en una o dos líneas.
  const pistaTx = h('span.muted.small');
  const pista = h('details.aviso-plan-pista', h('summary', 'Cómo estimar'), pistaTx);
  const el = h('div.aviso-plan', { hidden: true, role: 'status', 'aria-live': 'polite' }, icono('reloj', 'ico-t'), h('div.aviso-plan-tx', txt, pista));
  let ultimo = '';
  return {
    el,
    /** Pone el aviso (o lo quita con null); solo toca el DOM si cambia. */
    pon(a) {
      const clave = a ? `${a.tipo}|${a.texto}` : '';
      if (clave === ultimo) return;
      ultimo = clave;
      el.hidden = !a;
      el.dataset.tipo = a?.tipo ?? '';
      txt.textContent = a?.texto ?? '';
      pistaTx.textContent = a?.pista ?? '';
      pista.hidden = !a?.pista;
    },
  };
}

/** El aviso del plan en este momento (src/course/plan-examen.js, avisoPlan). */
export const avisoDelPlan = (plan, o) => avisoPlan({ plan, ...o });

/** El hito del plan ya pasado (ensayo en papel, sin tiempo por pregunta), como aviso. */
export function hitoDelPlan(plan, consumidoS) {
  const x = hitoActual(plan, consumidoS);
  return x ? { tipo: 'hito', texto: `Minuto ${x.minuto}: ${x.texto.toLowerCase()}, según tu plan.`, pista: null } : null;
}

/** El informe del plan (src/course/plan-examen.js, informePlan). */
export const informeDelPlan = (o) => informePlan(o);
/** El cansancio: primera mitad del tiempo frente a la segunda (src/course/plan-examen.js). */
export const cansancioDe = (o) => cansancio(o);

/**
 * Sección del informe al terminar: plan frente a lo hecho, dónde habría convenido estimar y el cansancio.
 * @param {{ informe: object|null, cansancio?: object|null, partes?: object[]|null }} o  partes: el ensayo general
 */
export function seccionInformePlan({ informe = null, cansancio: cs = null, partes = null }) {
  const tablaPartes = partes?.length > 1 ? h('section.pm-partes', { 'aria-labelledby': 'pm-partes-t' },
    h('h2#pm-partes-t', conIcono('lista', 'Parte a parte')),
    h('table.stats.pm-tabla', h('thead', h('tr', h('th', { scope: 'col' }, 'Parte'), h('th', { scope: 'col' }, 'Bien'), h('th', { scope: 'col' }, 'Min'))),
      h('tbody', partes.map((p) => h('tr', h('th', { scope: 'row' }, p.titulo, h('span.pm-nota', { 'data-apto': String(!!p.apto) }, p.apto ? conIcono('ok', 'Apto') : conIcono('no', 'No apto'))),
        h('td', `${p.aciertos}/${p.total}`), h('td', `${p.minutos}/${p.duracionMin}`))))),
    partes.some((p) => p.motivos?.length) ? h('ul.pm-motivos.small', partes.filter((p) => p.motivos?.length).map((p) => h('li', h('strong', `${p.titulo}: `), p.motivos.join(' ')))) : null,
    h('p.muted.small', 'Cada módulo, corregido con el límite de fallos de cada una de sus materias, como el aprobado por módulos del examen.')) : null;
  const fases = informe?.fases?.length ? h('section.pm-informe', { 'aria-labelledby': 'pm-inf-t' },
    h('h2#pm-inf-t', conIcono('reloj', 'Tu reparto del tiempo, frente a lo que hiciste')),
    h('table.stats.pm-tabla', h('thead', h('tr', h('th', { scope: 'col' }, 'Fase'), h('th', { scope: 'col' }, 'Plan'), h('th', { scope: 'col' }, 'Tú'), h('th', { scope: 'col' }, 'Bien'))),
      h('caption.muted.small', 'Plan y tú, en minutos.'),
      h('tbody', informe.fases.map((f) => h('tr', h('th', { scope: 'row' }, f.titulo), h('td', String(f.planMin)), h('td', f.realMin == null ? '—' : String(f.realMin)), h('td', `${f.aciertos}/${f.n}`))))),
    informe.texto ? h('p', informe.texto) : null) : null;
  const estimar = informe ? h('section.pm-estimar', { 'aria-labelledby': 'pm-est-t' },
    h('h2#pm-est-t', conIcono('lupa', 'Dónde habría convenido estimar')),
    informe.estimar.length
      ? h('ul.pm-estimar-lista', informe.estimar.map((e) => h('li',
        h('p', h('strong', `Pregunta ${e.n}`), `: ${e.motivo}.`),
        e.reglas.map((r) => h('p.small', h('em', `${r.nombre}. `), r.cota)),
        h('p.small', `Podías descartar ${lista(e.descartadas.map((l) => `la ${l})`))}; quedaban ${lista(e.quedan.map((l) => `la ${l})`))}.`))))
      : h('p.muted', 'En las que fallaste o te llevaron más de la cuenta, los datos no dejaban descartar nada con seguridad. Ahí, el método.'),
    reglasDescarteEl()) : null;
  const fatiga = cs ? h('section.pm-cansancio', { 'aria-labelledby': 'pm-can-t' },
    h('h2#pm-can-t', conIcono('reloj', '¿Te cansas?')),
    h('p', cs.texto),
    h('p.muted.small', `Primera mitad del tiempo: ${cs.primera.aciertos} de ${cs.primera.n} bien. Segunda: ${cs.segunda.aciertos} de ${cs.segunda.n}. Cada pregunta cuenta en la mitad en que la contestaste.`)) : null;
  if (!tablaPartes && !fases && !estimar && !fatiga) return null;
  return h('div.pm-resultado', tablaPartes, fases, estimar, fatiga);
}

/** Texto del informe para `nautica.state()`. */
export function textoInformePlan(informe, cs = null) {
  if (!informe) return '';
  return `\nPLAN: ${informe.fases.map((f) => `${f.titulo} plan ${f.planMin} min${f.realMin != null ? ` / real ${f.realMin}` : ''} (${f.aciertos}/${f.n})`).join(' · ')}` +
    `\nESTIMAR: ${informe.estimar.map((e) => `${e.n} (descartar ${e.descartadas.join(',')})`).join(' · ') || 'nada'}` + (cs ? `\nCANSANCIO: ${cs.texto}` : '');
}

/** «1 min 20 s» (para quien pinte tiempos junto al plan). */
export { duracion };
