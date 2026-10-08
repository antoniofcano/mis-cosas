// #/<tit>/tarjetas — tarjetas de memoria (B4): lista de mazos con lo que toca repasar.
// #/<tit>/tarjetas/<mazo> — sesión de 10 tarjetas de un mazo · #/<tit>/tarjetas/repaso — las que tocan hoy de todos.
// Anverso → «Ver la respuesta» → reverso → «Lo sabía» / «No lo sabía». Se guarda como una respuesta más, así que
// las falladas vuelven con el repaso espaciado (mañana, a los 3 días, a los 7…).

import { h, setChildren } from '../dom.js';
import { renderIllustration } from '../../illustrations/index.js';
import { playSignal } from '../../illustrations/situations.js';
import { mazos, sesionMazo, tarjetasPorRepasar, sinRotulos } from '../../course/tarjetas.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { pintarCierre } from '../cierre.js';
import { cronometro } from '../../course/cronometro.js';
import { cuenta } from '../../texto.js';
import { glosar } from '../glosas.js';
import { delata } from '../../theory/vocabulario.js';
import { conIcono } from '../iconos.js';

export function tarjetasView(o) {
  return o.params.parts[1] ? sesionView(o) : listaView(o);
}

function listaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const ms = mazos(tit);
  const resp = progress.get().exams;
  const tocan = tarjetasPorRepasar(ms, resp);
  const el = h('div.mas',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', conIcono('tarjetas', `Tarjetas de memoria · ${T.sigla}`)),
    h('p.muted', 'Para lo que solo se aprende repitiendo. Mira la tarjeta, piensa la respuesta y dale la vuelta. Las que no sepas volverán mañana.'),
    tocan.length ? h('a.btn.grande', { href: tlink(tit, ['tarjetas', 'repaso']) }, conIcono('repaso', `Repasar ${cuenta(tocan.length, 'tarjeta', 'tarjetas')} de hoy`)) : null,
    h('div.cards', ms.map((m) => {
      const vistas = m.cartas.filter((c) => resp[c.clave]).length;
      const hoy = tarjetasPorRepasar([m], resp).length;
      return h('a.card', { href: tlink(tit, ['tarjetas', m.id], { s: randomSeed() }) },
        h('h3', conIcono(m.ico, m.titulo)),
        h('div.meta', h('span.stat', `${cuenta(m.cartas.length, 'tarjeta')}`), vistas ? h('span.stat', `${vistas} vistas`) : null, hoy ? h('span.stat.warn', `${hoy} por repasar`) : null));
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

function anversoEl(c, tit) {
  const a = c.anverso;
  const partes = [];
  if (a.spec) {
    const r = renderIllustration(a.spec);
    if (r) partes.push(h('div.il-svg.tarjeta-dibujo', { html: sinRotulos(r.svg, a.quitar) }));
  }
  if (a.sonido) {
    const r = renderIllustration({ tipo: 'sonido', senal: a.sonido });
    partes.push(h('button.grande.secondary', { type: 'button', onclick: () => playSignal(r?.sound ?? a.sonido) }, conIcono('play', 'Escuchar la señal')));
  }
  if (a.texto) partes.push(h('p.tarjeta-texto', a.texto));
  // En el anverso, lo que se pregunta (a.texto) no se explica; en la pregunta, nada que delate la respuesta.
  const pregunta = h('p.tarjeta-pregunta', a.pregunta);
  glosar(pregunta, { tit }, { excluir: delataTarjeta(c) });
  partes.push(pregunta);
  return partes;
}

function sesionView({ progress, tit, params }) {
  const T = TITULACIONES[tit];
  const ms = mazos(tit);
  const id = params.parts[1];
  const resp = progress.get().exams;
  const repaso = id === 'repaso';
  const mazo = ms.find((m) => m.id === id);
  const cartas = repaso ? tarjetasPorRepasar(ms, resp).slice(0, 20) : mazo ? sesionMazo(mazo, resp, createRng(Number(params.query.s) || randomSeed())) : [];
  const titulo = repaso ? 'Tarjetas de hoy' : mazo ? mazo.titulo : 'Tarjetas';
  const barra = barraActividad({ texto: titulo, onSalir: () => { location.hash = tlink(tit, ['tarjetas']); } });
  const cont = h('div.tarjeta-sesion');
  const el = h('div.practice', barra, cont);
  let summaryText = `VISTA tarjetas ${id}`;
  if (!cartas.length) {
    setChildren(cont, h('p.vacio', repaso ? 'Hoy no te toca repasar ninguna tarjeta.' : 'Este mazo no existe.'), h('a.btn.grande', { href: tlink(tit, ['tarjetas']) }, 'Ver los mazos'));
    return { el, summary: () => summaryText };
  }
  let i = 0;
  let bien = 0;
  const crono = cronometro(); // minutos reales, con tope por tarjeta
  const mostrar = (vuelta = false) => {
    const c = cartas[i];
    barra.set(`${titulo} · ${i + 1} de ${cartas.length}`, i / cartas.length);
    const reverso = vuelta ? h('div.tarjeta-reverso', h('p.tarjeta-respuesta', c.reverso.titulo), c.reverso.texto ? h('p', c.reverso.texto) : null) : null;
    glosar(reverso, { tit });
    const responder = (ok) => {
      progress.recordExam(c.clave, { choice: null, ok });
      crono.marca();
      if (ok) bien += 1;
      i += 1;
      if (i < cartas.length) { mostrar(false); return; }
      progress.logActividad(crono.minutos());
      barra.remove();
      pintarCierre(cont, progress, tit, { icono: bien === cartas.length ? 'hecho' : 'flojo', titulo: `${bien} de ${cartas.length}`,
        lineas: [bien === cartas.length ? 'Todas sabidas: volverán más adelante para afianzarlas.' : 'Las que no sabías vuelven mañana al repaso.'] });
      summaryText = `VISTA tarjetas terminadas: ${bien} de ${cartas.length}`;
    };
    setChildren(cont,
      h('div.tarjeta', anversoEl(c, tit), reverso),
      h('div.fila-inferior', vuelta
        ? [h('button.secondary.grande', { type: 'button', onclick: () => responder(false) }, conIcono('no', 'No lo sabía')), h('button.grande', { type: 'button', onclick: () => responder(true) }, conIcono('ok', 'Lo sabía'))]
        : h('button.grande', { type: 'button', onclick: () => mostrar(true) }, 'Ver la respuesta')));
    summaryText = `TARJETA ${c.clave} (${i + 1}/${cartas.length}) · ${c.anverso.texto ?? c.anverso.pregunta}${vuelta ? ` → ${c.reverso.titulo}${c.reverso.texto ? `. ${c.reverso.texto}` : ''}` : ' (sin dar la vuelta: no reveles la respuesta)'}`;
    window.scrollTo(0, 0);
  };
  mostrar(false);
  return { el, summary: () => summaryText };
}
