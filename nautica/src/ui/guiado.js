// Modo guiado «Paso a paso» (R-35): la app pide cada paso de la resolución programada de una pregunta y lo corrige en
// el momento; al final, la opción y un resumen. La lógica está en src/exams/guiado.js; los pasos y sus valores, en el
// kit (src/exams/kit.js, `steps[i].pide`). Nunca en un examen: con un examen en marcha no se ofrece (modoExamen()).
//
// guiadoPanel({ q, sol, chart, … }) → { el, summary } se pone en la vista de la pregunta (#/q/<id>?guiado=1), en el panel
// del profe de la práctica (clases y tandas) y en la pestaña «Paso a paso» de la mesa de cartas.

import { h, setChildren } from './dom.js';
import { conIcono, icono } from './iconos.js';
import { modoExamen } from './modo-examen.js';
import { lineaProfe, rotuloProfe } from './profe-steps.js';
import { glosar } from './glosas.js';
import { voice } from './voice.js';
import { createKit } from '../exams/kit.js';
import { chooseOption } from '../exams/options.js';
import { pasosGuiados, tienePasosPreguntables, corregirPaso, valorTexto, resumenGuiado, ESTADO } from '../exams/guiado.js';
import { PASOS } from '../exams/taxonomia.js';
import { quantity } from '../analysis/quantities.js';
import { narrateSteps } from '../teacher/narrate.js';
import { fmtLat, fmtLon } from '../math/format.js';
import { erroresAlumno } from '../store/errores.js';
import { diagnosticoEl } from './diagnostico.js';
import { cuenta } from '../texto.js';

let contador = 0;

/** ¿Se puede resolver paso a paso esta pregunta? (tiene resolución con pasos que preguntar y no hay examen en marcha) */
export function guiadoDisponible(q, sol, chart) {
  if (!sol || !chart || modoExamen()) return false;
  try { const k = createKit(chart); sol.solve(k, q); return tienePasosPreguntables(k.steps); } catch { return false; }
}

/**
 * @param {object} o
 * @param {object} o.q        pregunta
 * @param {object} o.sol      su solución programada
 * @param {object} o.chart    motor de carta
 * @param {(n: number) => void} [o.dibujar]  dibuja la construcción hasta el paso n (carta del sitio donde se pone)
 * @param {() => object|null} [o.carta]     API de la carta donde el alumno marca puntos (para «Tomar la situación»)
 * @param {number} [o.factor]   factor de tolerancia (Ajustes → exigencia)
 * @param {object} [o.glosas]   contexto de las siglas ({ tit, ut })
 * @param {(letra: string, ok: boolean) => void} [o.onOpcion]  al comprobar la opción final
 * @param {() => void} [o.onCerrar]  botón «Cerrar el paso a paso» (si se da)
 */
export function guiadoPanel(o) {
  const { q, sol, chart } = o;
  const uid = `g${++contador}`;
  const k = createKit(chart);
  const values = sol.solve(k, q);
  const pick = chooseOption(q.opciones ?? {}, values);
  const pasos = pasosGuiados(k.steps);
  const narr = narrateSteps(k.steps, { seed: q.id });
  const almacen = erroresAlumno();
  const resultados = []; // { i, paso, resultado }
  let actual = -1; // último paso enseñado
  let terminado = false;
  let eleccion = null;

  const lista = h('ol.guiado-lista');
  const progreso = h('p.guiado-progreso.small.muted', { 'aria-live': 'polite' });
  const final = h('div.guiado-final');
  const totalPreguntas = pasos.filter((p) => p.pide).length;

  const explicacion = (i) => {
    const n = narr[i];
    const box = h('div.profe.guiado-profe', rotuloProfe(),
      voice.supported ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', 'aria-label': 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, icono('escuchar')) : null,
      n.display.split('\n').map((l) => lineaProfe(l).el));
    glosar(box, o.glosas);
    return box;
  };

  /** Un paso ya resuelto (o una nota): título, resultado y explicación. */
  function pasoHecho(p, r) {
    const cab = r == null ? conIcono('libro', p.title)
      : r.resultado === ESTADO.OK ? conIcono('ok', `${p.title}: correcto`)
        : r.resultado === 'dimelo' ? conIcono('bombilla', `${p.title}: ${valorTexto(p.pide)}`)
          : conIcono(r.resultado === ESTADO.CASI ? 'casi' : 'no', `${p.title}: ${r.resultado === ESTADO.CASI ? 'casi' : 'no'}`);
    return h('li.guiado-paso.hecho', { class: r ? `r-${r.resultado}` : 'nota', 'data-paso': String(p.i + 1) },
      h('h3.guiado-tit', cab),
      r && r.resultado !== ESTADO.OK && r.resultado !== 'dimelo' ? h('p.guiado-era', `Era ${valorTexto(p.pide)}${r.tuyo ? ` (escribiste ${r.tuyo})` : ''}.`) : null,
      r?.resultado === ESTADO.OK ? h('p.guiado-era', valorTexto(p.pide)) : null,
      explicacion(p.i));
  }

  /** El paso que se pregunta ahora. */
  function pasoActual(p) {
    const n = actual + 1;
    const pedidos = pasos.slice(0, p.i + 1).filter((x) => x.pide).length;
    progreso.textContent = `Paso ${pedidos} de ${totalPreguntas} que se preguntan · ${PASOS[p.pide.paso]?.nombre ?? ''}`;
    const entradas = p.pide.campos.map((c, j) => {
      const qn = quantity(c.kind);
      const id = `${uid}-p${n}-${j}`;
      return { c, input: h('input', { id, name: id, placeholder: qn.placeholder, autocomplete: 'off', inputmode: 'text', 'aria-describedby': `${id}-fb` }), fb: h('div.feedback', { id: `${id}-fb` }) };
    });
    const aviso = h('div.guiado-aviso', { 'aria-live': 'polite' });
    const lat = entradas.find((x) => x.c.kind === 'lat');
    const lon = entradas.find((x) => x.c.kind === 'lon');
    const api = o.carta?.();
    const tomar = lat && lon && api ? h('button.secondary', { type: 'button', onclick: () => {
      const punto = (o.carta?.() ?? api).getUserItems().filter((u) => u.t === 'pos').at(-1);
      if (!punto) { aviso.textContent = 'Marca antes tu situación en la carta con la herramienta Punto.'; return; }
      lat.input.value = fmtLat(punto.at.lat); lon.input.value = fmtLon(punto.at.lon);
      aviso.textContent = `Tomada de tu último punto: ${fmtLat(punto.at.lat)}, ${fmtLon(punto.at.lon)}. Pulsa «Comprobar».`;
    } }, conIcono('lugar', 'Tomar la situación de la carta')) : null;
    const titulo = h('h3.guiado-tit', { tabindex: '-1' }, `${p.title}`);
    const form = h('form.answers.guiado-form', { onsubmit: (ev) => { ev.preventDefault(); comprobar(); } },
      h('p.guiado-pregunta', p.pide.pregunta),
      entradas.map(({ c, input, fb }) => h('label.field', { for: input.id }, h('span.lbl', `${c.label}${c.medido ? ' (en la carta)' : ''}`), input, fb)),
      tomar, aviso,
      h('div.actions',
        h('button', { type: 'submit' }, 'Comprobar'),
        h('button.secondary', { type: 'button', onclick: () => cerrarPaso('dimelo') }, conIcono('bombilla', 'Dímelo'))));
    const li = h('li.guiado-paso.actual', { 'data-paso': String(p.i + 1) }, titulo, form);

    function comprobar() {
      const r = corregirPaso(p.pide, entradas.map((x) => x.input.value), { factor: o.factor ?? 1 });
      if (r.estado === ESTADO.VACIO || r.estado === ESTADO.ILEGIBLE) {
        for (const [j, x] of entradas.entries()) {
          const f = r.campos[j];
          x.input.dataset.status = f.estado === ESTADO.ILEGIBLE ? 'invalid' : f.estado === ESTADO.VACIO ? 'empty' : '';
          x.fb.replaceChildren(...(f.estado === ESTADO.ILEGIBLE ? conIcono('aviso', `No se entiende el formato. Ejemplo: ${f.ejemplo}`) : f.estado === ESTADO.VACIO ? ['Falta este dato.'] : []));
        }
        aviso.textContent = r.estado === ESTADO.VACIO ? 'Escribe todos los datos, o pulsa «Dímelo».' : 'Revisa el formato.';
        return;
      }
      cerrarPaso(r.estado, r.campos.map((f) => f.valorTexto).join(' · '));
    }
    return li;
  }

  /** Cierra el paso actual con su resultado y sigue. */
  function cerrarPaso(resultado, tuyo) {
    const p = pasos[actual];
    const r = { i: p.i, paso: p.pide.paso, resultado, tuyo };
    resultados.push(r);
    if (resultado !== 'dimelo') almacen.paso(q.id, p.pide.paso, resultado === ESTADO.OK);
    lista.lastElementChild.replaceWith(pasoHecho(p, r));
    o.dibujar?.(p.i + 1);
    avanzar(true);
  }

  /** Enseña las notas que vienen y se para en el siguiente paso que se pregunta (o en la opción final). */
  function avanzar(enfocar) {
    while (actual + 1 < pasos.length) {
      actual += 1;
      const p = pasos[actual];
      if (p.pide) {
        const li = pasoActual(p);
        lista.append(li);
        if (enfocar) requestAnimationFrame(() => li.querySelector('input')?.focus());
        return;
      }
      lista.append(pasoHecho(p, null));
      o.dibujar?.(p.i + 1);
    }
    terminar(enfocar);
  }

  function terminar(enfocar) {
    if (terminado) return;
    terminado = true;
    progreso.textContent = 'Pasos terminados: ahora, la opción.';
    const fb = h('div.guiado-opcion-fb', { 'aria-live': 'polite' });
    const titulo = h('h3.guiado-tit', { tabindex: '-1' }, conIcono('diana', '¿Qué opción marcarías?'));
    const opciones = h('div.options', Object.entries(q.opciones ?? {}).map(([letra, v]) => h('label.option',
      h('input', { type: 'radio', name: `${uid}-opt`, value: letra, onchange: () => { eleccion = letra; } }),
      h('span', h('strong', `${letra}) `), v))));
    setChildren(final, titulo, h('p.small.muted', 'Busca la opción que coincide con lo que acabas de calcular.'), opciones,
      h('div.actions', h('button', { type: 'button', onclick: () => {
        if (!eleccion) { fb.textContent = 'Elige una opción.'; return; }
        const ok = q.anulada || eleccion === q.correcta || (q.aceptadas ?? []).includes(eleccion);
        o.onOpcion?.(eleccion, ok);
        setChildren(fb,
          q.anulada ? h('p.ok', conIcono('ok', 'Pregunta anulada: en el examen valía cualquier respuesta.'))
            : ok ? h('p.ok', conIcono('ok', `Correcta: la ${q.correcta}).`)) : h('p.warn', conIcono('no', `No: la oficial es la ${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}`)),
          ok ? null : diagnosticoEl(q, eleccion, { chart }),
          resumenEl());
      } }, 'Comprobar la opción')),
      fb);
    if (enfocar) requestAnimationFrame(() => titulo.focus());
  }

  function resumenEl() {
    const s = resumenGuiado(resultados);
    const pasoFlojo = (() => { const x = almacen.resumen().peorPaso; return x ? `En lo que llevas, fallas sobre todo ${x.al}.` : null; })();
    return h('section.guiado-resumen', { 'aria-label': 'Resumen del paso a paso' },
      h('h3', 'Resumen'),
      h('p', `Bien: ${s.aciertos} de ${cuenta(s.total, 'paso')}${s.dichos ? ` · con «Dímelo»: ${s.dichos}` : ''}${s.fallos ? ` · por repasar: ${s.fallos}` : ''}.`),
      h('ul.guiado-resumen-lista', resultados.map((r) => h('li', { class: `r-${r.resultado}` },
        conIcono(r.resultado === ESTADO.OK ? 'ok' : r.resultado === 'dimelo' ? 'bombilla' : r.resultado === ESTADO.CASI ? 'casi' : 'no',
          `${pasos[r.i].title}: ${r.resultado === ESTADO.OK ? 'bien' : r.resultado === 'dimelo' ? 'te lo dije' : r.resultado === ESTADO.CASI ? 'casi' : 'fallado'}`)))),
      h('p', h('strong', 'Opción oficial: '), q.correcta ? `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}` : 'sin respuesta oficial (anulada)',
        pick.choice && q.correcta && pick.choice !== q.correcta ? ` (la resolución llega a la ${pick.choice})` : ''),
      pasoFlojo ? h('p.small', conIcono('diana', pasoFlojo)) : null,
      h('div.actions', h('button.secondary', { type: 'button', onclick: reiniciar }, conIcono('repaso', 'Volver a empezar'))));
  }

  function reiniciar() {
    resultados.length = 0; actual = -1; terminado = false; eleccion = null;
    lista.replaceChildren(); final.replaceChildren();
    o.dibujar?.(0);
    avanzar(true);
  }

  const el = h('section.guiado', { 'aria-labelledby': `${uid}-t` },
    h('div.guiado-cab',
      h('h2', { id: `${uid}-t` }, conIcono('lapiz', 'Resolver paso a paso')),
      o.onCerrar ? h('button.small.secondary', { type: 'button', onclick: o.onCerrar }, conIcono('salir', 'Cerrar')) : null),
    h('p.small.muted', 'Te pido cada paso y te lo corrijo al momento. «Dímelo» te da el valor sin contar como fallo. Escribe los rumbos como 045, la Ct como 3 W o −3, las coordenadas como 36 05,2 N y las horas como 14:35.'),
    progreso, lista, final);
  o.dibujar?.(0);
  avanzar(false);

  return {
    el,
    summary: () => `MODO PASO A PASO ${q.id}: paso ${Math.max(0, actual + 1)}/${pasos.length}` +
      `\n${resultados.map((r) => `${pasos[r.i].title}: ${r.resultado}`).join('\n')}${terminado ? '\nPASOS TERMINADOS (falta o ya está la opción)' : ''}`,
  };
}
