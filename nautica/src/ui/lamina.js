// Componente compartido de las láminas interactivas: predicción (en clase), dibujo, mandos, lectura, voz y
// resaltado entre vistas. Toda la lógica está en el controlador (lamina-estado.js); aquí solo se pinta.

import { h, setChildren } from './dom.js';
import { voice } from './voice.js';
import { controlador } from './lamina-estado.js';
import { conIcono } from './iconos.js';

let serie = 0;

/**
 * @param {object} def  definición de src/illustrations/interactivas/
 * @param {object} spec spec de la lámina (su estado inicial)
 * @param {{ modo?: 'clase'|'explicacion'|'galeria', caption?: string, onRespuesta?: (acierto: boolean) => void }} o
 */
export function laminaEl(def, spec, { modo = 'galeria', caption = null, onRespuesta = null } = {}) {
  const c = controlador(def, spec, modo);
  const uid = `lam${++serie}`;
  const dibujo = h('div.il-svg.lam-dibujo');
  const lectura = h('p.lam-lectura', { 'aria-live': 'polite', id: `${uid}-lectura` });
  const casillas = h('div.lam-casillas');
  const cadena = h('ol.lam-cadena');
  const nota = h('p.lam-nota');
  const ctl = h('div.lam-mandos');
  const aviso = h('p.lam-aviso', 'Responde primero para poder mover los mandos.');
  const fig = h('figure.il-figure.lamina', { 'data-modo': modo });
  const entradas = new Map();

  function pintaDibujo(v) {
    const vistas = v.vistas ?? [{ svg: v.svg }];
    dibujo.className = `il-svg lam-dibujo${v.disposicion === 'primera-ancha' ? ' lam-primera-ancha' : vistas.length > 1 && !v.apiladas ? ' lam-duo' : ''}`;
    setChildren(dibujo, vistas.map((x) => h('figure.lam-vista', h('div', { html: x.svg }), x.pie ? h('figcaption', x.pie) : null)));
    dibujo.classList.toggle('lam-con-parte', !!v.parte);
    for (const el of dibujo.querySelectorAll('[data-parte]')) el.classList.toggle('lam-sel', el.dataset.parte === v.parte);
  }

  function pinta() {
    const v = c.vista();
    pintaDibujo(v);
    nota.textContent = v.nota ?? '';
    nota.hidden = !v.nota;
    lectura.textContent = v.lectura;
    setChildren(casillas, (v.casillas ?? []).map(([k, val]) => h('div', h('b', k), val)));
    casillas.hidden = !v.casillas?.length;
    setChildren(cadena, (v.cadena ?? []).map(([k, val]) => h('li', h('b', k), val)));
    cadena.hidden = !v.cadena?.length;
    ctl.classList.toggle('lam-bloqueado', v.bloqueado);
    aviso.hidden = !v.bloqueado;
    if (conmutadorEl) for (const b of conmutadorEl.querySelectorAll('button')) { b.setAttribute('aria-pressed', String(b.dataset.valor === String(v.conmutador.valor))); b.disabled = v.bloqueado; }
    for (const m of v.mandos) {
      const e = entradas.get(m.id);
      if (!e) continue;
      if (m.tipo === 'rango') {
        e.input.value = m.valor;
        e.input.disabled = v.bloqueado;
        e.valor.textContent = m.texto ?? String(m.valor);
      } else {
        for (const b of e.botones) { b.setAttribute('aria-pressed', String(b.dataset.valor === String(m.valor))); b.disabled = v.bloqueado; }
      }
    }
    for (const b of partesBtns) b.setAttribute('aria-pressed', String(b.dataset.parte === v.parte));
    if (volver) volver.disabled = !c.cambiado;
  }

  function mandoEl(m) {
    const id = `${uid}-${m.id}`;
    if (m.tipo === 'rango') {
      const valor = h('span.lam-valor');
      const input = h('input', { id, type: 'range', min: m.min, max: m.max, step: m.paso, value: c.estado()[m.id], oninput: (ev) => { c.mover(m.id, ev.target.value); pinta(); } });
      entradas.set(m.id, { input, valor });
      return h('div.lam-mando', h('label', { for: id }, `${m.etiqueta}: `, valor), input,
        m.extremos ? h('div.lam-extremos', { 'aria-hidden': 'true' }, m.extremos.map((t) => h('span', t))) : null);
    }
    const botones = m.opciones.map(([val, txt]) => h('button.secondary', { type: 'button', 'data-valor': String(val), 'aria-pressed': 'false', onclick: () => { c.mover(m.id, val); pinta(); } }, txt));
    entradas.set(m.id, { botones });
    return h('div.lam-mando', h('p.lam-etiqueta', { id }, m.etiqueta), h('div.lam-seg', { role: 'group', 'aria-labelledby': id }, botones));
  }

  // Predicción (solo en clase)
  const v0 = c.vista();
  let predEl = null;
  if (v0.prediccion) {
    const p = v0.prediccion;
    const fb = h('p.lam-fb', { hidden: true, 'aria-live': 'polite' });
    const ops = Object.entries(p.opciones).map(([k, t]) => h('button.secondary', { type: 'button', 'data-k': k, onclick: () => {
      const ok = c.responder(k);
      for (const b of ops) {
        b.disabled = true;
        if (b.dataset.k === p.correcta) b.classList.add('lam-bien');
      }
      if (!ok) ops.find((b) => b.dataset.k === k)?.classList.add('lam-mal');
      fb.hidden = false;
      fb.className = `lam-fb ${ok ? 'ok' : 'warn'}`;
      fb.replaceChildren(...conIcono(ok ? 'ok' : 'no', `${ok ? 'Eso es.' : `No: es «${p.opciones[p.correcta]}».`} ${p.tras}`));
      pinta();
      onRespuesta?.(ok);
      if (voice.enabled) voice.speak(fb.textContent);
    } }, t));
    predEl = h('div.lam-pred', h('p.lam-pregunta', conIcono('pregunta', p.enunciado)), h('div.lam-opciones', ops), fb);
  }

  for (const m of v0.mandos) ctl.append(mandoEl(m));
  // Conmutador: cambia lo que se pregunta (p. ej. «adónde voy» / «qué rumbo doy»). Al cambiar, los mandos se rehacen.
  const conmutadorEl = v0.conmutador ? h('div.lam-mando.lam-conmutador', h('p.lam-etiqueta', { id: `${uid}-conm` }, v0.conmutador.etiqueta),
    h('div.lam-seg', { role: 'group', 'aria-labelledby': `${uid}-conm` }, v0.conmutador.opciones.map(([val, txt]) => h('button.secondary', { type: 'button', 'data-valor': String(val), 'aria-pressed': 'false', onclick: () => {
      if (!c.mover(v0.conmutador.id, val)) return;
      entradas.clear();
      setChildren(ctl, c.vista().mandos.map(mandoEl));
      pinta();
    } }, txt)))) : null;
  const partesBtns = Object.keys(def.partes ?? {}).length && def.botonesPartes
    ? def.botonesPartes.map(([p, t]) => h('button.secondary', { type: 'button', 'data-parte': p, 'aria-pressed': 'false', onclick: () => { c.resaltar(p); pinta(); } }, t))
    : [];
  dibujo.addEventListener('click', (ev) => {
    const p = ev.target.closest?.('[data-parte]')?.dataset.parte;
    if (p && def.partes?.[p]) { c.resaltar(p); pinta(); }
  });

  // En la explicación de una pregunta, un botón devuelve la lámina al caso de esa pregunta.
  const volver = modo === 'explicacion' && v0.mandos.length
    ? h('button.secondary.small.lam-volver', { type: 'button', onclick: () => { c.reiniciar(); pinta(); } }, conIcono('deshacer', 'Volver al caso de la pregunta'))
    : null;
  const escuchar = voice.supported ? h('button.secondary.small.lam-voz', { type: 'button', onclick: () => {
    const v = c.vista();
    const pend = v.prediccion && v.prediccion.respuesta == null ? `${v.prediccion.enunciado} ` : '';
    voice.speak(pend + v.lectura);
  } }, conIcono('escuchar', 'Escuchar')) : null;

  fig.append(...[
    predEl,
    dibujo,
    nota,
    partesBtns.length ? h('div.lam-seg.lam-partes', { role: 'group', 'aria-label': 'Partes del dibujo' }, partesBtns) : null,
    v0.mandos.length ? h('div.lam-ctl', aviso, conmutadorEl, ctl) : null,
    cadena,
    lectura,
    casillas,
    volver || escuchar ? h('div.lam-botones', volver, escuchar) : null,
    caption ? h('figcaption', caption) : null,
  ].filter(Boolean));
  pinta();
  fig.controlador = c;
  return fig;
}
