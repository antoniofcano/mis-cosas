// #/<tit>/tarjetas — tarjetas de memoria (B4): lista de mazos con lo que toca repasar.
// #/<tit>/tarjetas/<mazo> — sesión de 10 tarjetas de un mazo · #/<tit>/tarjetas/repaso — las que tocan hoy de todos.
// Anverso → «Ver la respuesta» (la tarjeta se voltea) → reverso → «La sabía» / «No la sabía». Se guarda como una
// respuesta más, así que las falladas vuelven con el repaso espaciado (mañana, a los 3 días, a los 7…).
// Apariencia en estilo C (docs/ESTILO-LAMINAS.md): papel de carta, marco con doble filete y graduación, respuesta en
// serifa, dato en monoespaciada y «Nota»; el avance del mazo con los faros de la Travesía. El anverso lo dibuja
// src/illustrations/tarjetas-c.js.

import { h, setChildren } from '../dom.js';
import { playSignal } from '../../illustrations/situations.js';
import { anversoTarjeta } from '../../illustrations/tarjetas-c.js';
import { mazos, sesionMazo, tarjetasPorRepasar } from '../../course/tarjetas.js';
import { diaLocal, sumaDias } from '../../course/repaso.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { pintarCierre } from '../cierre.js';
import { cronometro } from '../../course/cronometro.js';
import { cuenta } from '../../texto.js';
import { glosar } from '../glosas.js';
import { delata } from '../../theory/vocabulario.js';
import { conIcono, icono } from '../iconos.js';
import { transicion } from '../movimiento.js';

export function tarjetasView(o) {
  return o.params.parts[1] ? sesionView(o) : listaView(o);
}

const mayus = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

function listaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const ms = mazos(tit);
  const resp = progress.get().exams;
  const tocan = tarjetasPorRepasar(ms, resp);
  const el = h('div.mas.tc-lista',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', conIcono('tarjetas', `Tarjetas de memoria · ${T.sigla}`)),
    h('p.muted', 'Para lo que solo se aprende repitiendo. Mira la tarjeta, piensa la respuesta y dale la vuelta. Las que no sepas volverán mañana.'),
    tocan.length ? h('a.btn.grande', { href: tlink(tit, ['tarjetas', 'repaso']) }, conIcono('repaso', `Repasar ${cuenta(tocan.length, 'tarjeta', 'tarjetas')} de hoy`)) : null,
    h('ul.tc-mazos', ms.map((m) => {
      const total = m.cartas.length;
      const vistas = m.cartas.filter((c) => resp[c.clave]).length;
      const sabidas = m.cartas.filter((c) => resp[c.clave]?.ok === true).length;
      const hoy = tarjetasPorRepasar([m], resp).length;
      const pie = vistas ? `${cuenta(sabidas, 'sabida')} de ${total}` : 'Sin empezar';
      return h('li', h('a.tc-mazo', { href: tlink(tit, ['tarjetas', m.id], { s: randomSeed() }), 'aria-label': `${m.titulo}: ${cuenta(total, 'tarjeta')}, ${pie.toLowerCase()}${hoy ? `, ${hoy} por repasar hoy` : ''}` },
        h('span.tc-mazo-ico', { 'aria-hidden': 'true' }, icono(m.ico)),
        h('span.tc-mazo-tx',
          h('span.tc-mazo-eti', cuenta(total, 'tarjeta')),
          h('span.tc-mazo-titulo', m.titulo),
          h('span.barra-trav.on.tc-mazo-barra', { 'aria-hidden': 'true' }, h('span', { style: `width:${Math.round((sabidas / total) * 100)}%` })),
          h('span.tc-mazo-pie', h('span', pie), hoy ? h('span.tc-hoy', `${hoy} por repasar hoy`) : null))));
    })));
  return { el, summary: () => `VISTA tarjetas ${T.sigla} · ${tocan.length} por repasar hoy\n${ms.map((m) => `${m.id}: ${m.titulo} (${m.cartas.length}) → ${tlink(tit, ['tarjetas', m.id])}`).join('\n')}` };
}

/**
 * ¿La explicación de una sigla o término delataría la respuesta de la tarjeta? (en el anverso no se marca)
 * @param {object} e  entrada de la glosa ({ clase, titulo, significado, texto })
 */
const delataTarjeta = (c) => (e) => {
  const respuesta = `${c.reverso.titulo} ${c.reverso.texto ?? ''}`;
  return delata({ formas: [e.titulo], termino: e.significado || e.titulo, definicion: e.texto }, respuesta);
};

/** El estímulo: el dibujo (con su texto alternativo) o la palabra en grande, con la regla de las escalas. */
function estimuloEl(a, { mini = false } = {}) {
  if (!a) return null;
  if (a.svg) return h(`div.il-svg.tc-dibujo${a.estiloC ? '' : '.tc-antiguo'}${mini ? '.tc-mini' : ''}`, { html: mini ? a.svg.replace(/role="img"[^>]*?aria-label="[^"]*"/, 'aria-hidden="true" focusable="false"') : a.svg });
  return h(`div.tc-estimulo${mini ? '.tc-mini' : ''}`, mini ? { 'aria-hidden': 'true' } : {},
    h(`p.tc-estimulo-grande${a.texto.mono ? '.mono' : ''}`, a.texto.grande),
    a.regla && !mini ? h('div.tc-regla-caja', { html: a.regla }) : null);
}

function anversoEl(c, tit, a, mazoTitulo) {
  const partes = [h('p.tc-eti', `Tarjeta · ${mazoTitulo}`), h('div.tc-figura', estimuloEl(a))];
  if (c.anverso.sonido) {
    partes.push(h('button.secondary.tc-escuchar', { type: 'button', onclick: (ev) => { ev.stopPropagation(); playSignal(c.anverso.sonido); } }, conIcono('play', 'Escuchar la señal')));
  }
  // En el anverso, lo que se pregunta (a.texto) no se explica; en la pregunta, nada que delate la respuesta.
  const pregunta = h('p.tc-pregunta', c.anverso.pregunta);
  glosar(pregunta, { tit }, { excluir: delataTarjeta(c) });
  partes.push(pregunta);
  return partes;
}

function reversoEl(c, tit, a) {
  const r = c.reverso;
  const respuesta = mayus(r.respuesta ?? r.titulo);
  const nombre = r.nombre && r.nombre !== respuesta ? r.nombre : null;
  // Sin nota propia, la de un dibujo antiguo es su descripción (las luces y marcas de un buque, por ejemplo).
  const nota = r.nota ?? a?.descripcion ?? null;
  const resp = h(`h2.tc-respuesta${respuesta.length > 90 ? '.muy-larga' : respuesta.length > 50 ? '.larga' : ''}`, respuesta);
  const notaTx = nota ? h('p.lc-nota-txt', nota) : null;
  const cuerpo = h('div.tc-rev-cuerpo',
    h('p.tc-eti', 'Respuesta'),
    h('div.tc-rev-cab',
      h('div.tc-rev-tx', nombre ? h('p.tc-nombre', nombre) : null, resp),
      // la miniatura del dibujo, para unir respuesta y estímulo (los dibujos antiguos, muy anchos, no se leen en pequeño;
      // si el estímulo es una palabra, ya está en el nombre; el de una señal acústica ya está en su dato, los puntos y rayas)
      a?.estiloC && a.svg && !a.sonido ? estimuloEl(a, { mini: true }) : null),
    r.dato ? h('p.tc-dato', h('span.visualmente-oculto', 'Dato: '), r.dato) : null,
    // en las escalas, la regla con el grado marcado: dónde cae en la escala
    a?.regla ? h('div.tc-regla-caja', { html: a.regla }) : null,
    notaTx ? h('aside.lc-nota.tc-nota', h('p.lc-nota-eti', 'Nota'), notaTx) : null);
  // Se explican los términos de la respuesta y de la nota (no los del nombre en versalitas ni los del dato).
  const usados = new Set();
  glosar(resp, { tit }, { usados });
  if (notaTx) glosar(notaTx, { tit }, { usados });
  return cuerpo;
}

/** Faros del mazo (como los de la Travesía): encendido, la sabías; en camino, vuelve al repaso; apagado, por ver. */
function farosEl(cartas, resultados, i) {
  const sab = resultados.filter((x) => x === true).length;
  const no = resultados.filter((x) => x === false).length;
  return h('ol.tc-faros', { 'aria-label': `Avance del mazo: ${sab} sabidas, ${no} por repasar, ${cartas.length - sab - no} por ver` },
    cartas.map((_, k) => h(`li.tc-faro${resultados[k] === true ? '.on' : resultados[k] === false ? '.parcial' : ''}${k === i ? '.actual' : ''}`, { 'aria-hidden': 'true' })));
}

/** Cuándo vuelve una tarjeta, según su registro de repaso (solo se lee: la lógica es la de siempre). */
function cuandoVuelve(reg) {
  const rep = reg?.rep;
  if (!rep) return reg?.ok ? 'no vuelve al repaso de hoy' : '';
  const hoy = diaLocal();
  if (rep.prox <= hoy) return 'vuelve hoy';
  if (rep.prox === sumaDias(hoy, 1)) return 'vuelve mañana';
  const dias = Math.round((new Date(rep.prox) - new Date(hoy)) / 864e5);
  return `vuelve dentro de ${cuenta(dias, 'día')}`;
}

function sesionView({ progress, tit, params }) {
  const ms = mazos(tit);
  const id = params.parts[1];
  const resp = progress.get().exams;
  const repaso = id === 'repaso';
  const mazo = ms.find((m) => m.id === id);
  const cartas = repaso ? tarjetasPorRepasar(ms, resp).slice(0, 20) : mazo ? sesionMazo(mazo, resp, createRng(Number(params.query.s) || randomSeed())) : [];
  const titulo = repaso ? 'Tarjetas de hoy' : mazo ? mazo.titulo : 'Tarjetas';
  const barra = barraActividad({ texto: titulo, onSalir: () => { location.hash = tlink(tit, ['tarjetas']); } });
  const cont = h('div.tarjeta-sesion.tc-sesion');
  const el = h('div.practice', barra, cont);
  let summaryText = `VISTA tarjetas ${id}`;
  if (!cartas.length) {
    setChildren(cont, h('p.vacio', repaso ? 'Hoy no te toca repasar ninguna tarjeta.' : 'Este mazo no existe.'), h('a.btn.grande', { href: tlink(tit, ['tarjetas']) }, 'Ver los mazos'));
    return { el, summary: () => summaryText };
  }
  let i = 0;
  let bien = 0;
  const resultados = [];
  const crono = cronometro(); // minutos reales, con tope por tarjeta
  // Lo que acaba de pasar (la anterior: sabida o no y cuándo vuelve), para el lector de pantalla y a la vista.
  const aviso = h('p.tc-aviso', { 'aria-live': 'polite', role: 'status' });
  const mostrar = (enfocar = false) => {
    const c = cartas[i];
    const tituloMazo = ms.find((m) => m.id === c.mazo)?.titulo ?? titulo;
    const a = anversoTarjeta(c.mazo, c);
    barra.set(`${titulo} · ${i + 1} de ${cartas.length}`, i / cartas.length);
    const frente = h('section.tc-cara.tc-anverso', { 'aria-label': `Tarjeta ${i + 1} de ${cartas.length}`, tabindex: '-1' }, h('div.tc-marco', h('div.tc-papel', anversoEl(c, tit, a, tituloMazo))));
    const dorso = h('section.tc-cara.tc-reverso', { 'aria-label': 'Respuesta', tabindex: '-1', 'aria-hidden': 'true' }, h('div.tc-marco', h('div.tc-papel', reversoEl(c, tit, a))));
    dorso.inert = true;
    const caras = h('div.tc-caras', frente, dorso);
    const botones = h('div.fila-inferior');
    const responder = (ok) => {
      progress.recordExam(c.clave, { choice: null, ok });
      crono.marca();
      if (ok) bien += 1;
      resultados[i] = ok;
      const nombre = c.reverso.nombre ?? c.reverso.titulo;
      const vuelve = cuandoVuelve(progress.get().exams[c.clave]);
      aviso.textContent = `Anterior, «${nombre}»: ${ok ? 'la sabías' : 'no la sabías'}${vuelve ? `; ${vuelve}` : ''}.`;
      i += 1;
      if (i < cartas.length) { transicion(() => mostrar(true), 'adelante'); return; }
      progress.logActividad(crono.minutos());
      barra.remove();
      pintarCierre(cont, progress, tit, { icono: bien === cartas.length ? 'hecho' : 'flojo', titulo: `${bien} de ${cartas.length}`,
        lineas: [bien === cartas.length ? 'Todas sabidas: volverán más adelante para afianzarlas.' : 'Las que no sabías vuelven mañana al repaso.'] });
      summaryText = `VISTA tarjetas terminadas: ${bien} de ${cartas.length}`;
    };
    const voltear = () => {
      if (caras.classList.contains('vuelta')) return;
      caras.classList.add('vuelta');
      frente.inert = true;
      frente.setAttribute('aria-hidden', 'true');
      dorso.inert = false;
      dorso.removeAttribute('aria-hidden');
      setChildren(botones,
        h('button.secondary.grande.tc-no', { type: 'button', onclick: () => responder(false) }, conIcono('no', 'No la sabía')),
        h('button.grande.tc-si', { type: 'button', onclick: () => responder(true) }, conIcono('ok', 'La sabía')));
      dorso.focus({ preventScroll: true });
      summaryText = `TARJETA ${c.clave} (${i + 1}/${cartas.length}) · ${c.anverso.texto ?? c.anverso.pregunta} → ${c.reverso.titulo}${c.reverso.texto ? `. ${c.reverso.texto}` : ''}`;
    };
    // Tocar la tarjeta también la voltea (el botón de abajo es el camino del teclado).
    frente.addEventListener('click', (ev) => { if (!ev.target.closest('button, a')) voltear(); });
    setChildren(botones, h('button.grande.tc-ver', { type: 'button', onclick: voltear }, 'Ver la respuesta'));
    setChildren(cont,
      h('div.tc-cab', farosEl(cartas, resultados, i), h('span.tc-cuenta', `${i + 1} / ${cartas.length}`)),
      aviso,
      h('div.tc-volteo', caras),
      botones);
    summaryText = `TARJETA ${c.clave} (${i + 1}/${cartas.length}) · ${c.anverso.texto ?? c.anverso.pregunta} (sin dar la vuelta: no reveles la respuesta)`;
    window.scrollTo(0, 0);
    if (enfocar) frente.focus({ preventScroll: true });
  };
  mostrar(false);
  return { el, summary: () => summaryText };
}
