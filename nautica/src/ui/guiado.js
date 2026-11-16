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
import { fmtLat, fmtLon, fmtSigned } from '../math/format.js';
import { erroresAlumno } from '../store/errores.js';
import { diagnosticoEl } from './diagnostico.js';
import { cuenta } from '../texto.js';
import { relojPaso } from './reloj-paso.js';
import { tiemposAlumno } from '../store/tiempos.js';
import { tipoDePregunta } from '../course/velocidad.js';
import { AVISOS, avisoPrevio, erroresDelTribunal, diagnosticarPaso } from '../exams/avisos-pasos.js';
import { loadErroresFrecuentes } from '../store/datasets.js';
import { anotarFallo } from './cuaderno.js';
import { preguntaDeTipo, escalones, pasosRellenos, textoAyudas, resumenAyudas } from '../exams/ensena.js';

let contador = 0;

/** ¿Se puede resolver paso a paso esta pregunta? (tiene resolución con pasos que preguntar y no hay examen en marcha) */
export function guiadoDisponible(q, sol, chart) {
  if (!sol || !chart || modoExamen()) return false;
  try { const k = createKit(chart); sol.solve(k, q); return tienePasosPreguntables(k.steps); } catch { return false; }
}

// Avisos «Ojo / No olvides / Así se hace» de cada paso (R-65, textos y lógica en src/exams/avisos-pasos.js).
// - Antes de contestar: «Ojo» (la trampa) si el alumno ya ha fallado ese error o, sin datos suyos, el más frecuente del
//   tribunal; con «No olvides» plegado debajo.
// - Tras contestar: si falla y su respuesta es lo que sale con un error típico del paso, el error con nombre («Has
//   sumado el adelanto en vez de restarlo») y la regla; si acierta, «Así se hace».
function avisosDeLosPasos({ q, sol, chart, almacen, factor = 1, tit = null }) {
  let tribunal = null; // errores del tribunal (data/comun/errores-frecuentes.json), cuando cargan
  const pendientes = new Set();
  loadErroresFrecuentes().then((d) => { tribunal = erroresDelTribunal(d?.porBanco, tit); for (const f of pendientes) f(); pendientes.clear(); }).catch(() => { tribunal = []; });
  const previos = new Map(); // paso (índice) → { id, motivo }
  const aviso = (clase, icono, rotulo, texto) => h(`p.guiado-aviso-txt.${clase}`, icono ? conIcono(icono, h('strong', `${rotulo} `), texto) : [h('strong', `${rotulo} `), texto]);
  return {
    /** El bloque que va antes de contestar (puede quedar vacío si no toca avisar). */
    antes(p) {
      const caja = h('div.guiado-ojo-caja');
      if (!p.errores?.length) return caja;
      const rellena = () => {
        const previo = avisoPrevio(p.errores, { erroresAlumno: almacen.resumen().errores, erroresTribunal: tribunal ?? [] });
        if (!previo) return;
        previos.set(p.i, previo);
        const a = AVISOS[previo.id];
        caja.replaceChildren(
          h('div.guiado-ojo', aviso('ojo', 'aviso', 'Ojo:', a.ojo),
            h('p.small.muted.guiado-ojo-motivo', previo.motivo === 'tuyo' ? 'Te lo digo porque ya has fallado este error.' : 'Es de los errores que más repiten en el examen.')),
          h('details.guiado-no', h('summary', 'No olvides'), h('p', a.no)));
      };
      const sinDatos = !almacen.resumen().errores.length;
      if (sinDatos && tribunal == null) pendientes.add(rellena); else rellena();
      return caja;
    },
    /** El bloque que va tras cerrar el paso: error con nombre si falla, «Así se hace» si acierta. */
    despues(p, r) {
      if (!p.pide || !p.errores?.length || !r) return null;
      const previo = previos.get(p.i);
      if (r.resultado === ESTADO.OK || r.resultado === 'dimelo') {
        return previo ? h('div.guiado-ojo.hecho', aviso('asi', 'ok', 'Así se hace:', AVISOS[previo.id].asi)) : null;
      }
      // El diagnóstico se hace una vez, al cerrar el paso (cerrarPaso lo deja en r.diag y lo apunta en el cuaderno).
      const id = r.diag !== undefined ? r.diag : r.resultado === ESTADO.MAL ? diagnosticarPaso({ sol, q, chart, i: p.i, errores: p.errores, pide: p.pide, valores: r.valores ?? [], factor }) : null;
      if (id) {
        const cu = r.cuaderno;
        return h('div.guiado-ojo.error', aviso('ojo', 'aviso', `${AVISOS[id].has}.`, ''), aviso('no', null, 'No olvides:', AVISOS[id].no),
          cu ? h('p.small.guiado-cuaderno', h('a', { href: `#/${tit ?? 'py'}/fallos` }, cu.nuevo ? `Apuntado en tu cuaderno de fallos: «${cu.nombre.titulo}».` : cu.reabierto ? `«${cu.nombre.titulo}» vuelve a abrirse en tu cuaderno de fallos.` : `«${cu.nombre.titulo}», en tu cuaderno de fallos.`)) : null);
      }
      return previo ? h('div.guiado-ojo', aviso('no', 'libro', 'No olvides:', AVISOS[previo.id].no)) : null;
    },
  };
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
 * @param {'normal'|'resuelto'|'huecos'} [o.modo]  R-71: 'resuelto' enseña todos los pasos hechos (el ejemplo resuelto);
 *   'huecos', la primera mitad de los pasos rellena y el alumno completa el resto. Ninguno de los dos lleva reloj ni el
 *   primer paso «¿qué tipo es?».
 * @param {boolean} [o.tipo]   el primer paso «¿Qué tipo de problema es?» (por defecto, sí en el modo normal)
 * @param {{ resuelto: () => HTMLElement, huecos?: (() => HTMLElement)|null }|null} [o.ejemplos]  R-71: el ejemplo resuelto
 *   y el de huecos de otra pregunta del mismo tipo (los monta la vista, con su carta); sin ellos, no se ofrecen
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
  const avisos = avisosDeLosPasos({ q, sol, chart, almacen, factor: o.factor ?? 1, tit: o.glosas?.tit ?? null });
  const resultados = []; // { i, paso, resultado, ayudas }
  let actual = -1; // último paso enseñado
  let terminado = false;
  let eleccion = null;
  // R-71: el modo (la pregunta del alumno, el ejemplo resuelto o el de huecos), el primer paso «¿qué tipo es?» y las ayudas.
  const modo = o.modo ?? 'normal';
  const normal = modo === 'normal';
  const rellenos = modo === 'resuelto' ? new Set(pasos.filter((p) => p.pide).map((p) => p.i)) : modo === 'huecos' ? pasosRellenos(pasos) : new Set();
  const tipoProblema = tipoDePregunta(q, sol, { deCarta: true });
  const pasoTipo = normal && o.tipo !== false ? preguntaDeTipo(q, tipoProblema) : null;
  let tipoHecho = null; // { ok, elegido } del primer paso
  let ayudasPaso = 0; // escalones de ayuda usados en el paso en curso

  // Reloj (R-64): el tiempo de la resolución y de cada paso; al terminar los pasos se guarda con los de carta (R-42).
  // Solo en la pregunta del alumno: el ejemplo resuelto y el de huecos no son un problema entero hecho por él.
  const rp = normal ? relojPaso({ tit: o.glosas?.tit ?? null, pasos: true, vivo: () => el.isConnected }) : null;
  const lista = h('ol.guiado-lista');
  const progreso = h('p.guiado-progreso.small.muted', { 'aria-live': 'polite' });
  const final = h('div.guiado-final');
  const ejemploBox = normal ? h('div.guiado-ejemplo', { hidden: true, tabindex: '-1' }) : null;
  const totalPreguntas = pasos.filter((p) => p.pide && !rellenos.has(p.i)).length;

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
  function croquisEl(p, hecho = false) {
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
    if (c.tipo === 'ct') return croquisCt(svg, c, hecho, traza, sale);
    if (c.tipo === 'abatimiento') return croquisAbatimiento(svg, c, hecho, traza, sale);
    if (c.tipo === 'corriente') return croquisCorriente(svg, c, hecho, traza, sale);
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

  // ---- Croquis de la carta (R-52): los tres nortes, el abatimiento y el triángulo de velocidades. Antes de contestar
  // solo se dibuja lo que da el enunciado; al contestar, lo que se buscaba. Los ángulos pequeños se exageran (y se dice).
  const rumboA = (o2, b, r) => ({ x: o2.x + r * Math.sin(b * Math.PI / 180), y: o2.y - r * Math.cos(b * Math.PI / 180) });
  const grad = (b) => `${String(Math.round(((b % 360) + 360) % 360) % 360).padStart(3, '0')}°`;
  const nudos = (v) => `${v.toFixed(1).replace('.', ',')} nudos`;
  /** Vector con su punta: [línea, punta]. `cls` = tinta | raya | efec. */
  function flecha(a, b, cls) {
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1; const u = { x: (b.x - a.x) / L, y: (b.y - a.y) / L };
    const pta = sv('polygon', { points: `${b.x.toFixed(1)},${b.y.toFixed(1)} ${(b.x - 8 * u.x + 4 * u.y).toFixed(1)},${(b.y - 8 * u.y - 4 * u.x).toFixed(1)} ${(b.x - 8 * u.x - 4 * u.y).toFixed(1)},${(b.y - 8 * u.y + 4 * u.x).toFixed(1)}`, class: `cq-pta ${cls}` });
    return [sv('line', { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), class: `cq-${cls}` }), pta];
  }
  /** Leyenda (arriba a la izquierda): una muestra del trazo y su texto. */
  function leyenda(svg, filas, sale, y0 = 16) {
    filas.forEach(([cls, texto], i) => {
      const y = y0 + i * 17;
      const m = cls ? sv('line', { x1: 6, y1: y - 4, x2: 20, y2: y - 4, class: `cq-${cls}` }) : null;
      svg.append(...sale(...[m, sv('text', { x: cls ? 25 : 6, y, class: 'cq-ley' }, texto)].filter(Boolean)));
    });
  }
  const norteEl = (x, y) => [sv('line', { x1: x, y1: y + 22, x2: x, y2: y, class: 'cq-eje' }), sv('polygon', { points: `${x},${y - 3} ${x - 3.5},${y + 5} ${x + 3.5},${y + 5}`, class: 'cq-pta raya' }), sv('text', { x, y: y - 6, 'text-anchor': 'middle' }, 'N')];

  /** Los tres nortes: Nv, Nm (a la dm) y Na (a Δ del Nm); la Ct, de Nv a Na. Sin dm (Ct por enfilación o Polar), Nv y Na. */
  function croquisCt(svg, c, hecho, traza, sale) {
    svg.setAttribute('aria-label', `Los nortes: verdadero, ${c.dm != null ? 'magnético y ' : ''}de aguja${hecho ? `; la corrección total es ${fmtSigned(c.ct)}` : ''}`);
    const O = { x: 200, y: 140 };
    const ex = (v) => (Math.abs(v) < 1e-9 ? 0 : Math.sign(v) * Math.min(30, 7 + 2.2 * Math.abs(v)));
    const arco = (a, b, r, cls) => { const A = rumboA(O, a, r); const B = rumboA(O, b, r);
      return sv('path', { d: `M${A.x.toFixed(1)},${A.y.toFixed(1)} A${r},${r} 0 0 ${b > a ? 1 : 0} ${B.x.toFixed(1)},${B.y.toFixed(1)}`, class: `cq-${cls}` }); };
    const tip = (b, r, texto, cls) => { const t = rumboA(O, b, r + 9); return sv('text', { x: t.x.toFixed(1), y: (t.y + 3).toFixed(1), 'text-anchor': b < -2 ? 'end' : b > 2 ? 'start' : 'middle', class: cls }, texto); };
    svg.append(sv('text', { x: O.x - 78, y: O.y - 4, 'text-anchor': 'middle' }, '← W (−)'), sv('text', { x: O.x + 78, y: O.y - 4, 'text-anchor': 'middle' }, 'E (+) →'));
    svg.append(traza(sv('line', { x1: O.x, y1: O.y, x2: O.x, y2: O.y - 116, class: 'cq-eje cq-nv' }), 0.4), ...sale(tip(0, 116, 'Nv', 'cq-ley')));
    const filas = [];
    let aNa;
    if (c.dm != null) {
      const aNm = ex(c.dm); aNa = aNm + ex(c.dz);
      const m = rumboA(O, aNm, 98);
      svg.append(...sale(sv('line', { x1: O.x, y1: O.y, x2: m.x.toFixed(1), y2: m.y.toFixed(1), class: 'cq-raya' }), tip(aNm, 98, 'Nm', 'cq-ley')));
      if (aNm) svg.append(...sale(arco(0, aNm, 70, 'raya')));
      filas.push(['raya', `dm ${fmtSigned(c.dm)}`]);
      const a = rumboA(O, aNa, 82);
      svg.append(traza(sv('line', { x1: O.x, y1: O.y, x2: a.x.toFixed(1), y2: a.y.toFixed(1), class: 'cq-tinta' }), 0.5), ...sale(tip(aNa, 82, 'Na', 'cq-ley')));
      if (aNa !== aNm) svg.append(...sale(arco(aNm, aNa, 54, 'tinta')));
      filas.push(['tinta', `Δ ${fmtSigned(c.dz)}`]);
    } else if (hecho) {
      aNa = ex(c.ct);
      const a = rumboA(O, aNa, 82);
      svg.append(traza(sv('line', { x1: O.x, y1: O.y, x2: a.x.toFixed(1), y2: a.y.toFixed(1), class: 'cq-tinta' }), 0.5), ...sale(tip(aNa, 82, 'Na', 'cq-ley')));
    }
    if (hecho && aNa) svg.append(...sale(arco(0, aNa, 38, 'efec')));
    if (hecho) filas.push(['efec', `Ct ${fmtSigned(c.ct)}`]);
    leyenda(svg, filas, sale);
    svg.append(sv('text', { x: 6, y: 146, class: 'cq-nota' }, 'ángulos exagerados'));
    return svg;
  }

  /** Abatimiento: la proa (Rv), el viento que entra por una banda y el rumbo de superficie (Rs), con el norte arriba. */
  function croquisAbatimiento(svg, c, hecho, traza, sale) {
    const nombre = { Rv: 'Rv (proa)', Rs: 'Rs' };
    svg.setAttribute('aria-label', `Abatimiento: ${c.sabido.n} ${grad(c.sabido.r)}, viento del ${grad(c.viento)}${hecho ? `, ${c.busca.n} ${grad(c.busca.r)}` : ''}`);
    const C = { x: 205, y: 80 };
    const v0 = rumboA(C, c.viento, 68); const v1 = rumboA(C, c.viento, 20);
    svg.append(...norteEl(304, 14));
    svg.append(...sale(...flecha(v0, v1, 'raya'), sv('text', { x: v0.x.toFixed(1), y: (v0.y + (v0.y < C.y ? -5 : 13)).toFixed(1), 'text-anchor': 'middle' }, 'viento')));
    svg.append(...sale(sv('circle', { cx: C.x, cy: C.y, r: 3.5, class: 'cq-punto' })));
    const ls = c.sabido.n === 'Rv' ? 64 : 50; const lb = c.sabido.n === 'Rv' ? 50 : 64;
    const [l1, p1] = flecha(C, rumboA(C, c.sabido.r, ls), c.sabido.n === 'Rv' ? 'tinta' : 'efec');
    const t1 = rumboA(C, c.sabido.r, ls + 11);
    svg.append(traza(l1, 0.5), ...sale(p1, sv('text', { x: t1.x.toFixed(1), y: (t1.y + 4).toFixed(1), 'text-anchor': 'middle', class: 'cq-ley' }, c.sabido.n)));
    const filas = [[c.sabido.n === 'Rv' ? 'tinta' : 'efec', `${nombre[c.sabido.n]} ${grad(c.sabido.r)}`], ['raya', `viento del ${grad(c.viento)}`]];
    if (hecho) {
      const [l2, p2] = flecha(C, rumboA(C, c.busca.r, lb), c.busca.n === 'Rv' ? 'tinta' : 'efec');
      const t2 = rumboA(C, c.busca.r, lb + 11);
      svg.append(traza(l2, 0.5), ...sale(p2, sv('text', { x: t2.x.toFixed(1), y: (t2.y + 4).toFixed(1), 'text-anchor': 'middle', class: 'cq-ley' }, c.busca.n)));
      filas.push([c.busca.n === 'Rv' ? 'tinta' : 'efec', `${nombre[c.busca.n]} ${grad(c.busca.r)}`], [null, `Ab ${c.ab > 0 ? '+' : c.ab < 0 ? '−' : ''}${Math.abs(c.ab)}°`]);
    }
    leyenda(svg, filas, sale);
    return svg;
  }

  /**
   * Triángulo de velocidades (una hora), con el norte arriba. `modo`: 'efectivo' (barco y, a continuación, corriente →
   * efectivo), 'rumbo' (corriente y la línea del Ref → barco y efectivo) o 'velocidad' (corriente y efectivo → barco).
   */
  function croquisCorriente(svg, c, hecho, traza, sale) {
    const V = (b, l) => ({ x: l * Math.sin(b * Math.PI / 180), y: -l * Math.cos(b * Math.PI / 180) });
    const mas = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
    const O = { x: 0, y: 0 };
    const efec = c.modo === 'efectivo';
    const M = efec ? V(c.rs, c.vb) : V(c.rc, c.ic); // el vértice intermedio
    const F = efec ? mas(M, V(c.rc, c.ic)) : V(c.ref, c.vef);
    const guia = c.modo === 'rumbo' && !hecho ? V(c.ref, c.vef * 1.15) : null;
    const pts = [O, M, F, ...(guia ? [guia] : [])];
    const xs = pts.map((q2) => q2.x); const ys = pts.map((q2) => q2.y);
    const w = Math.max(1, Math.max(...xs) - Math.min(...xs)); const hh = Math.max(1, Math.max(...ys) - Math.min(...ys));
    // Más alto que los demás: la leyenda va debajo, a lo ancho, para que el triángulo tenga sitio.
    svg.setAttribute('viewBox', '0 0 320 196');
    const esc = Math.min(230 / w, 100 / hh);
    const ox = 160 - ((Math.max(...xs) + Math.min(...xs)) / 2) * esc; const oy = 64 - ((Math.max(...ys) + Math.min(...ys)) / 2) * esc;
    const T = (q2) => ({ x: ox + q2.x * esc, y: oy + q2.y * esc });
    svg.setAttribute('aria-label', `Triángulo de velocidades: barco, corriente y efectivo${hecho ? '' : ' (falta lo que se busca)'}`);
    svg.append(...norteEl(304, 14));
    const o = T(O); const m = T(M); const f = T(F);
    const barco = efec ? [o, m] : [m, f]; const corr = efec ? [m, f] : [o, m];
    const verEfec = c.modo === 'velocidad' || hecho;
    svg.append(...sale(sv('circle', { cx: o.x.toFixed(1), cy: o.y.toFixed(1), r: 3.5, class: 'cq-punto' })));
    if (guia) { const g = T(guia); svg.append(...sale(sv('line', { x1: o.x.toFixed(1), y1: o.y.toFixed(1), x2: g.x.toFixed(1), y2: g.y.toFixed(1), class: 'cq-guia' }))); }
    const pinta = (seg, cls, dur) => { const [l, p] = flecha(seg[0], seg[1], cls); if (cls === 'raya') svg.append(...sale(l, p)); else svg.append(traza(l, dur), ...sale(p)); };
    if (efec) { pinta(barco, 'tinta', 0.6); pinta(corr, 'raya'); } else { pinta(corr, 'raya'); if (c.modo === 'velocidad') pinta([o, f], 'efec', 0.6); }
    if (hecho) { if (!efec) pinta(barco, 'tinta', 0.6); if (c.modo !== 'velocidad') pinta([o, f], 'efec', 0.6); }
    const q = (v, txt) => (v ? txt : '?');
    const sabeRs = efec || hecho; const sabeVb = efec || c.modo === 'rumbo' || hecho;
    leyenda(svg, [
      ['tinta', `barco: Rs ${q(sabeRs, grad(c.rs))} · ${q(sabeVb, nudos(c.vb))}`],
      ['raya', `corriente: ${grad(c.rc)} · ${nudos(c.ic)}`],
      ['efec', `efectivo: Ref ${q(!efec || hecho, grad(c.ref))} · ${q(verEfec, nudos(c.vef))}`],
    ], sale, 140);
    svg.append(sv('text', { x: 314, y: 191, 'text-anchor': 'end', class: 'cq-nota' }, 'en una hora'));
    return svg;
  }

  // En negrita, los resultados: la última línea o, si el paso pide dos diferencias (Δl y A), las dos.
  const cuentaEl = (p) => { const n = p.pide?.campos?.length === 2 && p.pide.campos.every((c) => c.kind === 'minutos') && p.lineas.length === 2 ? 2 : 1;
    return h('div.guiado-cuenta', p.lineas.map((l, i) => h('div', { class: i >= p.lineas.length - n ? 'res' : '' }, l))); };

  /** Un paso ya resuelto (o una nota): título, resultado y explicación. */
  function pasoHecho(p, r) {
    const cab = r == null ? conIcono('libro', p.title)
      : r.resultado === 'relleno' ? conIcono('libro', `${p.title}: ${valorTexto(p.pide)}`)
      : r.resultado === ESTADO.OK ? conIcono('ok', `${p.title}: correcto`)
        : r.resultado === 'dimelo' ? conIcono('bombilla', `${p.title}: ${valorTexto(p.pide)}`)
          : conIcono(r.resultado === ESTADO.CASI ? 'casi' : 'no', `${p.title}: ${r.resultado === ESTADO.CASI ? 'casi' : 'no'}`);
    return h('li.guiado-paso.hecho', { class: r ? `r-${r.resultado}` : 'nota', 'data-paso': String(p.i + 1) },
      h('h3.guiado-tit', cab),
      r?.resultado === 'relleno' && modo === 'huecos' ? h('p.guiado-relleno.small.muted', 'Ya relleno: míralo y sigue.') : null,
      r?.ayudas && r.resultado !== 'dimelo' ? h('p.guiado-con-ayudas.small', conIcono('bombilla', textoAyudas(r.ayudas))) : null,
      r && r.resultado !== ESTADO.OK && r.resultado !== 'dimelo' && r.resultado !== 'relleno' ? h('p.guiado-era', `Era ${valorTexto(p.pide)}${r.tuyo ? ` (escribiste ${r.tuyo})` : ''}.`) : null,
      r?.resultado === ESTADO.OK ? h('p.guiado-era', valorTexto(p.pide)) : null,
      p.lineas ? [traigoEl(p), croquisEl(p, true), tablaEl(p, true), cuentaEl(p)] : deHoja && !p.pide ? h('p.guiado-nota', p.text) : explicacion(p.i),
      avisos.despues(p, r));
  }

  /** El paso que se pregunta ahora. */
  function pasoActual(p) {
    const n = actual + 1;
    const pedidos = pasos.slice(0, p.i + 1).filter((x) => x.pide && !rellenos.has(x.i)).length;
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
    // Ayuda por escalones (R-71): la pista, la fórmula con los datos y, por último, «Dímelo». No es fallar, pero se apunta.
    ayudasPaso = 0;
    const esc = escalones(p);
    const ayudaCaja = h('div.guiado-ayudas', { 'aria-live': 'polite' });
    const rotuloAyuda = () => (ayudasPaso < esc.length - 1 ? `${esc[ayudasPaso].titulo === 'La fórmula con tus datos' ? 'La fórmula' : esc[ayudasPaso].titulo} · ${ayudasPaso + 1} de ${esc.length}` : `Dímelo · ${esc.length} de ${esc.length}`);
    const botonAyuda = h('button.secondary.guiado-ayuda-btn', { type: 'button', onclick: () => siguienteAyuda() }, conIcono('bombilla', rotuloAyuda()));
    function siguienteAyuda() {
      if (ayudasPaso >= esc.length - 1) { cerrarPaso('dimelo'); return; }
      const e = esc[ayudasPaso];
      ayudasPaso += 1;
      ayudaCaja.append(h('div.guiado-escalon', { 'data-escalon': e.id },
        h('p.guiado-escalon-tit.small', h('strong', `${e.titulo} `), h('span.muted', `(ayuda ${ayudasPaso} de ${esc.length})`)),
        e.texto ? h('p', e.texto) : null,
        e.lineas?.length ? h('div.guiado-cuenta.guiado-escalon-cuenta', e.lineas.map((l) => h('div', l))) : null));
      botonAyuda.replaceChildren(...conIcono('bombilla', rotuloAyuda()));
    }
    const form = h('form.answers.guiado-form', { onsubmit: (ev) => { ev.preventDefault(); comprobar(); } },
      p.tras.includes('traigo') ? null : traigoEl(p), p.tras.includes('croquis') ? null : croquisEl(p, false), tablaEl(p, false),
      p.plantea ? h('p.guiado-plantea', h('small', 'Planteo'), p.plantea) : null,
      avisos.antes(p),
      h('p.guiado-pregunta', p.pide.pregunta),
      entradas.map(({ c, input, fb }) => h('label.field', { for: input.id }, h('span.lbl', `${c.label}${c.medido ? ' (en la carta)' : ''}`), input, fb)),
      tomar, aviso, ayudaCaja,
      h('div.actions',
        h('button', { type: 'submit' }, 'Comprobar'),
        botonAyuda));
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
      cerrarPaso(r.estado, r.campos.map((f) => f.valorTexto).join(' · '), r.campos.map((f) => f.valor));
    }
    return li;
  }

  /** Cierra el paso actual con su resultado y sigue. */
  function cerrarPaso(resultado, tuyo, valores) {
    const p = pasos[actual];
    const r = { i: p.i, paso: p.pide.paso, resultado, tuyo, valores, ayudas: ayudasPaso };
    resultados.push(r);
    rp?.marcaPaso(resultado === ESTADO.OK);
    if (resultado !== 'dimelo') almacen.paso(q.id, p.pide.paso, resultado === ESTADO.OK);
    // Fallo con nombre (R-55): si lo escrito es lo que sale con un error típico del paso, a tus errores y a tu cuaderno de
    // fallos. La opción final de la misma pregunta con el mismo error, el mismo día, ya no cuenta otra vez.
    r.diag = resultado === ESTADO.MAL && p.errores?.length
      ? diagnosticarPaso({ sol, q, chart, i: p.i, errores: p.errores, pide: p.pide, valores: valores ?? [], factor: o.factor ?? 1 }) : null;
    if (r.diag) {
      almacen.error(q.id, r.diag);
      r.cuaderno = anotarFallo({ error: r.diag, tipo: tipoDePregunta(q, sol, { deCarta: true }), origen: 'paso', q: q.id });
    }
    lista.lastElementChild.replaceWith(pasoHecho(p, r));
    o.dibujar?.(p.i + 1);
    avanzar(true);
  }

  /** Enseña las notas que vienen y se para en el siguiente paso que se pregunta (o en la opción final). */
  function avanzar(enfocar) {
    while (actual + 1 < pasos.length) {
      actual += 1;
      const p = pasos[actual];
      if (p.pide && rellenos.has(p.i)) {
        lista.append(pasoHecho(p, { i: p.i, paso: p.pide.paso, resultado: 'relleno' }));
        o.dibujar?.(p.i + 1);
        continue;
      }
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
    if (modo === 'resuelto') {
      // El ejemplo resuelto acaba con la opción que sale, sin preguntarla.
      progreso.textContent = 'Ejemplo resuelto entero.';
      const letra = q.correcta ?? pick.choice;
      setChildren(final, h('p.guiado-ejemplo-opcion', h('strong', 'Opción: '), letra ? `${letra}) ${q.opciones?.[letra] ?? ''}` : '—'));
      return;
    }
    // Tu velocidad en carta: el tiempo de la resolución completa (clave aparte de la de la tanda: no se pisan).
    if (rp) {
      const seg = rp.parar();
      const limpio = resultados.length > 0 && resultados.every((r) => r.resultado === ESTADO.OK);
      tiemposAlumno().anota({ y: tipoProblema, s: seg, o: limpio, q: `guiado:${q.id}` });
    }
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
    const ay = resumenAyudas(resultados);
    const pasoFlojo = (() => { const x = almacen.resumen().peorPaso; return x ? `En lo que llevas, fallas sobre todo ${x.al}.` : null; })();
    return h('section.guiado-resumen', { 'aria-label': 'Resumen del paso a paso' },
      h('h3', 'Resumen'),
      tipoHecho ? h('p', conIcono(tipoHecho.ok ? 'ok' : 'casi', `Tipo de problema: ${tipoHecho.ok ? 'a la primera' : 'con explicación'}.`)) : null,
      h('p', `Bien: ${s.aciertos} de ${cuenta(s.total, 'paso')}${s.dichos ? ` · con «Dímelo»: ${s.dichos}` : ''}${ay.pasos ? ` · con ayudas: ${ay.pasos}` : ''}${s.fallos ? ` · por repasar: ${s.fallos}` : ''}.`),
      h('ul.guiado-resumen-lista', resultados.map((r) => h('li', { class: `r-${r.resultado}` },
        conIcono(r.resultado === ESTADO.OK ? 'ok' : r.resultado === 'dimelo' ? 'bombilla' : r.resultado === ESTADO.CASI ? 'casi' : 'no',
          `${pasos[r.i].title}: ${r.resultado === ESTADO.OK ? 'bien' : r.resultado === 'dimelo' ? 'te lo dije' : r.resultado === ESTADO.CASI ? 'casi' : 'fallado'}${r.ayudas && r.resultado !== 'dimelo' ? ` (${textoAyudas(r.ayudas)})` : ''}`)))),
      h('p', h('strong', 'Opción oficial: '), q.correcta ? `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}` : 'sin respuesta oficial (anulada)',
        pick.choice && q.correcta && pick.choice !== q.correcta ? ` (la resolución llega a la ${pick.choice})` : ''),
      pasoFlojo ? h('p.small', conIcono('diana', pasoFlojo)) : null,
      h('div.actions', h('button.secondary', { type: 'button', onclick: reiniciar }, conIcono('repaso', 'Volver a empezar'))));
  }

  function reiniciar() {
    resultados.length = 0; actual = -1; terminado = false; eleccion = null; tipoHecho = null;
    rp?.reinicia();
    lista.replaceChildren(); final.replaceChildren();
    o.dibujar?.(0);
    empezar(true);
  }

  // ---- El primer paso (R-71): «¿Qué tipo de problema es?». Fallarlo no va al cuaderno: se explica qué lo delata.
  function pasoDeTipo() {
    const t = pasoTipo;
    const preguntaId = `${uid}-tipo`;
    const fb = h('div.guiado-tipo-fb', { 'aria-live': 'polite' });
    const li = h('li.guiado-paso.actual.guiado-tipo', { 'data-paso': 'tipo' }, h('h3.guiado-tit', { id: preguntaId, tabindex: '-1' }, t.pregunta),
      h('p.small.muted', 'Antes de la primera cuenta: ¿qué problema es? Así sabes qué pasos vienen.'));
    const botones = t.opciones.map((op) => h('button.secondary.guiado-tipo-op', { type: 'button', 'data-op': op.id, onclick: () => elegirTipo(op) }, h('span', op.texto)));
    li.append(h('div.guiado-tipo-ops', { role: 'group', 'aria-labelledby': preguntaId }, botones), fb);
    function elegirTipo(op) {
      tipoHecho = { ok: op.ok, elegido: op.id };
      for (const b of botones) {
        b.disabled = true;
        const o2 = t.opciones.find((x) => x.id === b.dataset.op);
        if (o2.ok) { b.classList.add('bien'); b.replaceChildren(...conIcono('ok', h('span', o2.texto))); }
        else if (o2.id === op.id) { b.classList.add('mal'); b.replaceChildren(...conIcono('no', h('span.guiado-tipo-marca', 'No:'), h('span', o2.texto))); }
      }
      const seguir = h('button', { type: 'button', onclick: () => { li.replaceWith(tipoResuelto()); avanzar(true); } }, 'Seguir con el problema');
      const [es, ...resto] = t.partes(op.ok ? null : op.id);
      setChildren(fb, h(`div.guiado-ojo.${op.ok ? 'hecho' : 'error'}`,
        h(`p.guiado-aviso-txt.${op.ok ? 'asi' : 'ojo'}`, conIcono(op.ok ? 'ok' : 'aviso', h('strong', op.ok ? 'Bien visto. ' : 'No es ese. '), es)),
        resto.map((x) => h('p.small', x))),
      h('div.actions', seguir));
      requestAnimationFrame(() => seguir.focus());
    }
    return li;
  }
  const tipoResuelto = () => h('li.guiado-paso.hecho.guiado-tipo', { class: tipoHecho?.ok ? 'r-ok' : 'r-casi', 'data-paso': 'tipo' },
    h('h3.guiado-tit', conIcono(tipoHecho?.ok ? 'ok' : 'casi', `Tipo: ${pasoTipo.opciones.find((x) => x.ok).texto}`)),
    tipoHecho?.ok ? null : h('p.small', pasoTipo.explica()));

  function empezar(enfocar) {
    if (pasoTipo) {
      const li = pasoDeTipo();
      lista.append(li);
      progreso.textContent = 'Primer paso: ¿qué tipo de problema es?';
      if (enfocar) requestAnimationFrame(() => li.querySelector('h3')?.focus());
      return;
    }
    avanzar(enfocar);
  }

  // ---- El ejemplo resuelto y, después, otro con huecos (R-71): otras preguntas reales del mismo tipo.
  function verEjemplo() {
    setChildren(ejemploBox,
      h('div.guiado-cab', h('h3', conIcono('libro', 'Ejemplo resuelto')), h('button.small.secondary', { type: 'button', onclick: cerrarEjemplo }, conIcono('salir', 'Cerrar'))),
      h('p.small.muted', 'Otra pregunta real del mismo tipo, resuelta entera paso a paso. Después, prueba tú otra con huecos.'),
      o.ejemplos.resuelto(),
      h('div.actions', o.ejemplos.huecos ? h('button', { type: 'button', onclick: verHuecos }, conIcono('lapiz', 'Ahora tú, con huecos')) : null,
        h('button.secondary', { type: 'button', onclick: cerrarEjemplo }, 'Volver a tu pregunta')));
    ejemploBox.hidden = false;
    requestAnimationFrame(() => { ejemploBox.scrollIntoView({ block: 'start' }); ejemploBox.focus({ preventScroll: true }); });
  }
  function verHuecos() {
    setChildren(ejemploBox,
      h('div.guiado-cab', h('h3', conIcono('lapiz', 'Ahora tú, con huecos')), h('button.small.secondary', { type: 'button', onclick: cerrarEjemplo }, conIcono('salir', 'Cerrar'))),
      h('p.small.muted', 'Otra pregunta del mismo tipo con la primera mitad de los pasos ya rellena: completa tú el resto.'),
      o.ejemplos.huecos(),
      h('div.actions', h('button.secondary', { type: 'button', onclick: cerrarEjemplo }, 'Volver a tu pregunta')));
    ejemploBox.hidden = false;
    requestAnimationFrame(() => { ejemploBox.scrollIntoView({ block: 'start' }); ejemploBox.querySelector('input')?.focus({ preventScroll: true }); });
  }
  function cerrarEjemplo() {
    ejemploBox.replaceChildren(); ejemploBox.hidden = true;
    requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }

  const intro = normal
    ? 'Te pido cada paso y te lo corrijo al momento. Si te atascas, la ayuda va por escalones: la pista (qué buscar), la fórmula con tus datos y, al final, «Dímelo». Usar una ayuda no es fallar, pero queda apuntado. Escribe los rumbos como 045, la Ct como 3 W o −3, las coordenadas como 36 05,2 N, las horas como 14:35 y las diferencias en minutos con su signo o su letra (−68,9 o 68,9 W).'
    : null;
  const el = h('section.guiado', { 'aria-labelledby': `${uid}-t`, class: normal ? '' : `guiado-${modo}` },
    h('div.guiado-cab',
      normal ? h('h2', { id: `${uid}-t` }, conIcono('lapiz', 'Resolver paso a paso')) : h('h4', { id: `${uid}-t` }, `${q.convocatoria ?? ''}${q.numero ? ` · pregunta ${q.numero}` : ''}`),
      o.onCerrar ? h('button.small.secondary', { type: 'button', onclick: o.onCerrar }, conIcono('salir', 'Cerrar')) : null),
    normal ? null : h('p.guiado-ejemplo-enunciado', q.enunciado),
    intro ? h('p.small.muted', intro) : null,
    normal && o.ejemplos?.resuelto ? h('div.actions.guiado-ejemplo-acc', h('button.secondary', { type: 'button', onclick: verEjemplo }, conIcono('libro', 'Ver un ejemplo resuelto'))) : null,
    ejemploBox,
    rp?.el, progreso, lista, final);
  o.dibujar?.(0);
  empezar(false);

  return {
    el,
    summary: () => `MODO PASO A PASO ${q.id}${normal ? '' : ` (${modo === 'resuelto' ? 'ejemplo resuelto' : 'ejemplo con huecos'})`}: paso ${Math.max(0, actual + 1)}/${pasos.length}` +
      `${pasoTipo ? `\nTipo de problema: ${tipoHecho ? (tipoHecho.ok ? 'acertado' : `fallado (eligió ${tipoHecho.elegido})`) : 'sin contestar'}` : ''}` +
      `\n${resultados.map((r) => `${pasos[r.i].title}: ${r.resultado}${r.ayudas && r.resultado !== 'dimelo' ? ` (${textoAyudas(r.ayudas)})` : ''}`).join('\n')}${terminado ? '\nPASOS TERMINADOS (falta o ya está la opción)' : ''}`,
  };
}
