// Reproductor de las láminas animadas (docs/ESTILO-LAMINAS.md, «Animaciones»): el equivalente a un vídeo corto, pero
// dibujado y controlable. Toma una pista pura (src/illustrations/animaciones/pista.js) y la mueve con
// requestAnimationFrame: en cada fotograma solo cambia los atributos de los elementos [data-ani] que se mueven.
//
// Controles (todos de 44 px o más, con foco visible y nombre accesible):
//   · Anterior / Reproducir-Pausa / Siguiente: los pasos («hitos») con nombre; saltar a uno para la animación.
//   · Deslizador de tiempo con aria-valuetext («Paso 3 de 6: 90°: avance y traslado, a los 18 s»).
//   · Velocidad 0,5×, 1× y 2×.
//   · El paso vigente se lee en voz alta (aria-live) al cambiar, y se ve escrito debajo.
// Con «reducir movimiento» no arranca sola: enseña el último fotograma (con todas sus cotas) y los pasos.
// Se para sola cuando la lámina sale de la pantalla o la pestaña se oculta, y sigue al volver si estaba en marcha.

import { h } from './dom.js';
import { icono } from './iconos.js';
import { quieto } from './movimiento.js';
import { hitoEn, momento } from '../illustrations/animaciones/pista.js';

export const VELOCIDADES = [[0.5, '0,5×', 'media velocidad'], [1, '1×', 'velocidad normal'], [2, '2×', 'doble velocidad']];
let serie = 0;

/** Texto del deslizador en el instante t. */
export function textoMomento(p, t) {
  const i = hitoEn(p.hitos, t);
  return `Paso ${i + 1} de ${p.hitos.length}: ${p.hitos[i].nombre}, ${p.momento ? p.momento(t) : `a los ${momento(p, t)}`}`;
}

/**
 * Reproductor de una pista sobre un dibujo ya pintado (el contenedor tiene el SVG o los SVG de la pista).
 * @param {HTMLElement} dibujo
 * @param {object} p  pista
 * @param {{ autoplay?: boolean, tInicial?: number, alFotograma?: (t: number) => void, alParar?: (t: number) => void }} o
 *   alFotograma: después de pintar cada fotograma; alParar: al pausar, saltar de paso o terminar (para sincronizar
 *   lo que no se anima, como la lectura de una lámina interactiva)
 */
export function reproductor(dibujo, p, { autoplay = true, tInicial = null, alFotograma = null, alParar = null } = {}) {
  const uid = `ani${++serie}`;
  const reducido = quieto();
  let pista = p;
  let t = tInicial ?? (reducido || !autoplay ? pista.tFijo : 0);
  let vel = 1;
  let quiere = autoplay && !reducido;
  let visible = typeof IntersectionObserver !== 'function';
  let raf = 0;
  let ultimo = 0;
  // Hasta que la lámina entra en la página no se sabe si se ve; si sale de ella después, el reproductor se apaga.
  let conectado = false;
  const fuera = () => { if (dibujo.isConnected) { conectado = true; return false; } return conectado; };
  let hito = -1;
  let indice = new Map();
  const cache = new WeakMap();

  const btn = (nombre, etiqueta, onclick) => h('button.secondary.ani-boton', { type: 'button', 'aria-label': etiqueta, title: etiqueta, onclick }, icono(nombre));
  const anterior = btn('inicio', 'Paso anterior', () => { pausa(); ir(destinoAnterior()); avisaParada(); });
  const play = btn('play', 'Reproducir', () => (corriendo() || quiere ? (pausa(), avisaParada()) : reproducir()));
  const siguiente = btn('fin', 'Paso siguiente', () => { pausa(); ir(destinoSiguiente()); avisaParada(); });
  const slider = h('input.ani-tiempo', { type: 'range', min: 0, max: pista.duracion, step: pista.paso ?? 0.05, value: t, 'aria-label': 'Momento de la animación', id: `${uid}-t`,
    oninput: (ev) => { pausa(); ir(Number(ev.target.value)); },
    onchange: () => avisaParada() });
  const marcas = h('div.ani-marcas', { 'aria-hidden': 'true' });
  const vels = VELOCIDADES.map(([v, txt, nombre]) => h('button.secondary.ani-vel', { type: 'button', 'aria-pressed': String(v === vel), 'aria-label': `${txt}, ${nombre}`, 'data-vel': String(v),
    onclick: () => { vel = v; for (const b of vels) b.setAttribute('aria-pressed', String(b.dataset.vel === String(v))); } }, txt));
  const paso = h('p.ani-paso', { 'aria-live': 'polite', id: `${uid}-paso` });
  const el = h('div.ani-ctl', { role: 'group', 'aria-label': 'Animación: reproducir y ver paso a paso', 'data-estado': 'pausada' },
    h('div.ani-fila', anterior, play, siguiente, h('div.ani-vels', { role: 'group', 'aria-label': 'Velocidad' }, vels)),
    h('div.ani-pista', slider, marcas),
    paso);

  function pintaMarcas() {
    marcas.replaceChildren(...pista.hitos.map((x) => h('span', { style: `left:${((x.t / pista.duracion) * 100).toFixed(2)}%` })));
    slider.max = String(pista.duracion);
    slider.step = String(pista.paso ?? 0.05);
  }

  function reindexa() {
    indice = new Map();
    for (const n of dibujo.querySelectorAll('[data-ani]')) {
      const k = n.getAttribute('data-ani');
      if (!indice.has(k)) indice.set(k, []);
      indice.get(k).push(n);
    }
  }

  const corriendo = () => quiere && visible && !(typeof document !== 'undefined' && document.hidden);

  function aplica() {
    const c = pista.cambios(t);
    for (const k in c) {
      const nodos = indice.get(k);
      if (!nodos) continue;
      const attrs = c[k];
      for (const n of nodos) {
        let prev = cache.get(n);
        if (!prev) { prev = {}; cache.set(n, prev); }
        for (const a in attrs) {
          const v = String(attrs[a]);
          if (prev[a] === v) continue;
          prev[a] = v;
          if (a === 'texto') n.textContent = v;
          else n.setAttribute(a, v);
        }
      }
    }
    slider.value = String(t);
    slider.setAttribute('aria-valuetext', textoMomento(pista, t));
    const i = hitoEn(pista.hitos, t);
    if (i !== hito) {
      hito = i;
      const x = pista.hitos[i];
      paso.replaceChildren(h('span.ani-num', `${i + 1}/${pista.hitos.length}`), ' ', h('b', x.nombre), x.texto ? ` ${x.texto}` : '');
    }
    anterior.disabled = t <= 0.001;
    siguiente.disabled = t >= pista.duracion - 0.001;
    alFotograma?.(t);
  }

  function destinoAnterior() {
    let d = 0;
    for (const x of pista.hitos) if (x.t < t - 0.25) d = x.t;
    return d;
  }
  function destinoSiguiente() {
    const x = pista.hitos.find((y) => y.t > t + 0.01);
    return x ? x.t : pista.duracion;
  }

  function estado() {
    const s = corriendo() ? 'reproduciendo' : quiere ? 'en-espera' : t >= pista.duracion - 0.001 && !pista.bucle ? 'fin' : 'pausada';
    el.dataset.estado = s;
    const marcha = quiere;
    play.replaceChildren(icono(marcha ? 'pausa' : 'play'));
    const etq = marcha ? 'Pausa' : s === 'fin' ? 'Volver a reproducir' : 'Reproducir';
    play.setAttribute('aria-label', etq);
    play.title = etq;
  }

  function bucle(ts) {
    raf = 0;
    if (fuera()) { destruir(); return; }
    if (!conectado) { raf = requestAnimationFrame(bucle); return; }
    if (!corriendo()) { estado(); return; }
    const dt = ultimo ? Math.min(0.1, (ts - ultimo) / 1000) : 0;
    ultimo = ts;
    t += dt * vel;
    if (t >= pista.duracion) {
      if (pista.bucle) t %= pista.duracion;
      else { t = pista.duracion; quiere = false; }
    }
    aplica();
    if (!quiere) { estado(); alParar?.(t); return; }
    raf = requestAnimationFrame(bucle);
  }

  function arranca() {
    estado();
    if (corriendo() && !raf && typeof requestAnimationFrame === 'function') { ultimo = 0; raf = requestAnimationFrame(bucle); }
  }

  function reproducir() {
    if (t >= pista.duracion - 0.001 && !pista.bucle) { t = 0; aplica(); }
    quiere = true;
    // si se pide desde los controles con el dibujo fuera de la vista, se trae el dibujo (si no, esperaría a verse)
    if (!visible && typeof dibujo.scrollIntoView === 'function') dibujo.scrollIntoView({ block: 'nearest', behavior: reducido ? 'auto' : 'smooth' });
    arranca();
  }
  function pausa() {
    quiere = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    estado();
  }
  const avisaParada = () => alParar?.(t);
  function ir(nt) {
    t = Math.min(pista.duracion, Math.max(0, Number(nt) || 0));
    aplica();
    estado();
  }

  // Pausa automática fuera de la pantalla o con la pestaña oculta.
  let io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver((es) => {
      if (fuera()) { destruir(); return; }
      for (const e of es) visible = e.isIntersecting;
      arranca();
    }, { threshold: 0.2 });
    io.observe(dibujo);
  }
  const alOcultar = () => { if (fuera()) { destruir(); return; } arranca(); };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', alOcultar);
  function destruir() {
    quiere = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', alOcultar);
  }

  reindexa();
  pintaMarcas();
  aplica();
  arranca();

  return {
    el,
    get t() { return t; },
    get reproduciendo() { return corriendo(); },
    get hito() { return hito; },
    get pista() { return pista; },
    ir, reproducir, pausar: pausa, destruir, reindexa,
    /** Cambia de pista (p. ej. al mover un mando): se queda parada en `tNuevo` (por defecto, el fotograma fijo). */
    cargar(nueva, tNuevo = nueva.tFijo) {
      pausa();
      pista = nueva;
      t = Math.min(nueva.duracion, Math.max(0, tNuevo));
      hito = -1;
      reindexa();
      pintaMarcas();
      aplica();
      estado();
    },
  };
}

/**
 * Figura de una lámina animada sin mandos: el dibujo (en el instante inicial) y sus controles debajo.
 * @param {object} p  pista
 * @param {{ modo?: 'clase'|'explicacion'|'galeria' }} o  en la explicación de una pregunta no arranca sola
 */
export function animacionEl(p, { modo = 'galeria' } = {}) {
  const autoplay = modo !== 'explicacion';
  const t0 = quieto() || !autoplay ? p.tFijo : 0;
  const dibujo = h('div.il-svg.ani-dibujo', { html: p.svg(t0) });
  const fig = h('figure.il-figure.ani', { 'data-modo': modo }, dibujo);
  const r = reproductor(dibujo, p, { autoplay, tInicial: t0 });
  fig.append(r.el);
  fig.animacion = r;
  return fig;
}
