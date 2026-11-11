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

  // Resolución «de hoja de examen» (estima analítica y las que declaren su cuenta en el kit): cada paso dice qué trae de
  // los anteriores, qué fórmula plantea y, una vez contestado, la cuenta línea a línea. Sin la voz del profe: sus
  // consejos son de carta y aquí no hay carta.
  const deHoja = pasos.some((p) => p.lineas);
  const traigoEl = (p) => (p.traigo?.length ? h('div.guiado-traigo', h('small', 'Traigo (del enunciado y de los pasos anteriores)'), p.traigo.map((x) => h('div', x))) : null);
  const tablaEl = (p, hecho) => (p.tabla ? h('div.guiado-tabla-caja', p.tabla.titulo ? h('p.guiado-tabla-tit.small.muted', p.tabla.titulo) : null, h('table.guiado-tabla',
    h('thead', h('tr', p.tabla.cab.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', p.tabla.filas.map((f, n) => h('tr', { class: hecho && p.tabla.marca?.includes(n) ? 'marcada' : '' }, f.map((c, i) => (i ? h('td', c) : h('th', { scope: 'row' }, c))))),
      hecho && p.tabla.suma ? h('tr.total', h('th', { scope: 'row' }, 'Suma'), h('td', ''), h('td', ''), h('td', valorCampo(p, 0)), h('td', valorCampo(p, 1))) : null))) : null);
  const valorCampo = (p, j) => { const c = p.pide?.campos?.[j]; return c ? quantity(c.kind).format(c.value) : ''; };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs = {}, texto = null) => { const e = document.createElementNS(SVGNS, tag); for (const [k2, v] of Object.entries(attrs)) e.setAttribute(k2, v); if (texto != null) e.textContent = texto; return e; };
  /** El croquis del paso, como el que se hace a lápiz en la hoja: la curva de la marea o los tramos encadenados. */
  function croquisEl(p) {
    const c = p.croquis;
    if (!c) return null;
    const svg = sv('svg', { viewBox: '0 0 320 150', role: 'img', class: 'guiado-croquis' });
    // Se dibuja solo, trazo a trazo (docs/EFECTOS.md: nada con «reducir movimiento»); al tocarlo, se repite.
    let turno = 0;
    const traza = (el, dur = 0.7) => { el.setAttribute('pathLength', '1'); el.classList.add('cq-traza'); el.style.animationDelay = `${turno.toFixed(2)}s`; el.style.animationDuration = `${dur}s`; turno += dur; return el; };
    const sale = (...els) => { for (const el of els) { el.classList.add('cq-sale'); el.style.animationDelay = `${turno.toFixed(2)}s`; } turno += 0.25; return els; };
    svg.addEventListener('click', () => { for (const e of svg.querySelectorAll('.cq-traza, .cq-sale')) { const a = e.style.animationName; e.style.animationName = 'none'; void e.getBoundingClientRect(); e.style.animationName = a; } });
    if (c.tipo === 'marea') {
      svg.setAttribute('aria-label', `Curva de la marea entre las ${c.a.hora} y las ${c.b.hora}`);
      const x0 = 46; const x1 = 274; const yAlto = 34; const yBajo = 98; const yEje = 126;
      const sube = c.b.h > c.a.h;
      const y = (f) => { const k2 = (1 - Math.cos(Math.PI * f)) / 2; return sube ? yBajo - (yBajo - yAlto) * k2 : yAlto + (yBajo - yAlto) * k2; };
      const pts = Array.from({ length: 41 }, (_, i) => `${(x0 + (x1 - x0) * (i / 40)).toFixed(1)},${y(i / 40).toFixed(1)}`).join(' ');
      const alt = (v) => String(v.toFixed(2)).replace('.', ',');
      svg.append(sv('line', { x1: 20, y1: yEje, x2: 300, y2: yEje, class: 'cq-eje' }));
      svg.append(...sale(sv('circle', { cx: x0, cy: y(0), r: 3.5, class: 'cq-punto' }), sv('text', { x: x0, y: 141, 'text-anchor': 'middle' }, `${c.a.hora} UT`),
        sv('text', { x: x0, y: y(0) + (sube ? 16 : -8), 'text-anchor': 'middle' }, `${sube ? 'BM' : 'PM'} ${alt(c.a.h)} m`)));
      svg.append(traza(sv('polyline', { points: pts, class: 'cq-tinta' }), 1.1));
      svg.append(...sale(sv('circle', { cx: x1, cy: y(1), r: 3.5, class: 'cq-punto' }), sv('text', { x: x1, y: 141, 'text-anchor': 'middle' }, `${c.b.hora} UT`),
        sv('text', { x: x1, y: y(1) + (sube ? -8 : 16), 'text-anchor': 'middle' }, `${sube ? 'PM' : 'BM'} ${alt(c.b.h)} m`)));
      if (c.x != null && c.x >= 0 && c.x <= 1) {
        const xx = x0 + (x1 - x0) * c.x;
        svg.append(...sale(sv('line', { x1: xx, y1: y(c.x), x2: xx, y2: yEje, class: 'cq-raya' }), sv('circle', { cx: xx, cy: y(c.x), r: 4, class: 'cq-marca' }),
          sv('text', { x: xx, y: 16, 'text-anchor': 'middle', class: 'cq-marca-tx' }, c.hora ?? '')));
      }
      return svg;
    }
    // Tramos: de la salida a la llegada, cada tramo a continuación del anterior (N arriba); la corriente, a trazos.
    svg.setAttribute('aria-label', 'Croquis de los tramos, con el norte arriba');
    let x = 0; let yy = 0; const P = [{ x: 0, y: 0 }];
    for (const l of c.legs) { x += l.ap; yy -= l.dl; P.push({ x, y: yy }); }
    const xs = P.map((q2) => q2.x); const ys = P.map((q2) => q2.y);
    const w = Math.max(1, Math.max(...xs) - Math.min(...xs)); const hh = Math.max(1, Math.max(...ys) - Math.min(...ys));
    const esc = Math.min(210 / w, 96 / hh);
    const ox = 160 - ((Math.max(...xs) + Math.min(...xs)) / 2) * esc; const oy = 78 - ((Math.max(...ys) + Math.min(...ys)) / 2) * esc;
    const T = (q2) => ({ x: ox + q2.x * esc, y: oy + q2.y * esc });
    svg.append(sv('line', { x1: 22, y1: 40, x2: 22, y2: 14, class: 'cq-eje' }), sv('text', { x: 22, y: 10, 'text-anchor': 'middle' }, 'N'));
    const ini = T(P[0]); const fin = T(P.at(-1));
    svg.append(...sale(sv('circle', { cx: ini.x, cy: ini.y, r: 3.5, class: 'cq-punto' }), sv('text', { x: ini.x, y: ini.y + (fin.y > ini.y ? -8 : 16), 'text-anchor': 'middle' }, 'salida')));
    c.legs.forEach((l, i) => { const a = T(P[i]); const b = T(P[i + 1]);
      const linea = sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: l.corriente ? 'cq-raya' : 'cq-tinta' });
      const rot = sv('text', { x: (a.x + b.x) / 2 + 6, y: (a.y + b.y) / 2 - 5 }, l.corriente ? 'corr.' : c.legs.length > 1 ? String(i + 1) : '');
      if (l.corriente) svg.append(...sale(linea, rot)); else { svg.append(traza(linea, 0.6)); svg.append(...sale(rot)); } });
    if (c.catetos) svg.append(...sale(sv('polyline', { points: `${ini.x},${ini.y} ${ini.x},${fin.y} ${fin.x},${fin.y}`, class: 'cq-raya' }),
      sv('text', { x: ini.x - 6, y: (ini.y + fin.y) / 2, 'text-anchor': 'end' }, 'Δl'), sv('text', { x: (ini.x + fin.x) / 2, y: fin.y + (fin.y > ini.y ? 14 : -6), 'text-anchor': 'middle' }, 'A')));
    svg.append(...sale(sv('circle', { cx: fin.x, cy: fin.y, r: 4, class: 'cq-marca' }), sv('text', { x: fin.x, y: fin.y + (fin.y > ini.y ? 16 : -10), 'text-anchor': 'middle', class: 'cq-marca-tx' }, 'llegada')));
    return svg;
  }

  // En negrita, los resultados: la última línea o, si el paso pide dos diferencias (Δl y A), las dos.
  const cuentaEl = (p) => { const n = p.pide?.campos?.length === 2 && p.pide.campos.every((c) => c.kind === 'minutos') && p.lineas.length === 2 ? 2 : 1;
    return h('div.guiado-cuenta', p.lineas.map((l, i) => h('div', { class: i >= p.lineas.length - n ? 'res' : '' }, l))); };

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
      p.lineas ? [traigoEl(p), croquisEl(p), tablaEl(p, true), cuentaEl(p)] : deHoja ? h('p.guiado-nota', p.text) : explicacion(p.i));
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
      p.tras.includes('traigo') ? null : traigoEl(p), p.tras.includes('croquis') ? null : croquisEl(p), tablaEl(p, false),
      p.plantea ? h('p.guiado-plantea', h('small', 'Planteo'), p.plantea) : null,
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
    h('p.small.muted', 'Te pido cada paso y te lo corrijo al momento. «Dímelo» te da el valor sin contar como fallo. Escribe los rumbos como 045, la Ct como 3 W o −3, las coordenadas como 36 05,2 N, las horas como 14:35 y las diferencias en minutos con su signo o su letra (−68,9 o 68,9 W).'),
    progreso, lista, final);
  o.dibujar?.(0);
  avanzar(false);

  return {
    el,
    summary: () => `MODO PASO A PASO ${q.id}: paso ${Math.max(0, actual + 1)}/${pasos.length}` +
      `\n${resultados.map((r) => `${pasos[r.i].title}: ${r.resultado}`).join('\n')}${terminado ? '\nPASOS TERMINADOS (falta o ya está la opción)' : ''}`,
  };
}
