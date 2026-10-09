// #/<tit>/carta-pasos[/<tipo>][?p=<paso>&todos=1&desde=…] — ejercicios de carta resueltos paso a paso: la lista por tipo
// y, para cada tipo, un ejemplo propio sobre la carta del Estrecho resuelto en 4–8 pasos dibujados en estilo C
// (src/course/carta-pasos.js, src/illustrations/carta-pasos-c.js, src/ui/pasos.js). Es material de estudio: se enlaza
// desde la Biblioteca, la lista de ejercicios de carta, la ficha de una idea de carta y la corrección de un ejercicio de
// carta fallado; nunca desde un examen ni un simulacro.
//   desde=ej:<ejercicio>:<semilla>  vuelve al ejercicio · desde=idea:<concepto>  vuelve a la ficha de la idea

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { tiposCarta, tipoCarta, CATEGORIAS_PASOS } from '../../course/carta-pasos.js';
import { figuraPaso } from '../../illustrations/carta-pasos-c.js';
import { getExercise } from '../../exercises/registry.js';
import { pasosEl } from '../pasos.js';
import { hrefFicha } from '../concepto.js';
import { conIcono } from '../iconos.js';
import { cuenta } from '../../texto.js';

/** Dirección de un tipo resuelto, con de dónde se viene (para volver). */
export const hrefPasos = (tit, tipo, desde = null) => tlink(tit, ['carta-pasos', tipo], desde ? { desde } : undefined);

/** Adónde vuelve la página de un tipo. */
function volverDe(tit, desde) {
  const [a, b, c] = String(desde ?? '').split(':');
  if (a === 'ej' && b && getExercise(b)) return ['El ejercicio', link(['ej', b], c ? { s: c } : undefined)];
  if (a === 'idea' && b) return ['La ficha de la idea', hrefFicha(tit, b)];
  return ['Ejercicios de carta resueltos', tlink(tit, ['carta-pasos'])];
}

const NIVEL = { per: 'PER', py: 'PY' };

function listaView({ ctx, tit }) {
  const T = TITULACIONES[tit];
  const nivel = NIVEL[tit] ?? 'PY';
  const tipos = tiposCarta(ctx.chart);
  const propios = tipos.filter((t) => t.niveles.includes(nivel));
  const otros = tipos.filter((t) => !t.niveles.includes(nivel));
  const tarjeta = (t) => h('a.card.cps-card', { href: hrefPasos(tit, t.id) },
    h('h3', t.titulo), h('p', t.corto),
    h('div.meta', h('span.muted', cuenta(t.pasos.length, 'paso')), h('span.badges', t.niveles.map((n) => h('span.badge.muted', n)))));
  const grupos = CATEGORIAS_PASOS.map((c) => [c, propios.filter((t) => t.categoria === c.id)]).filter(([, ts]) => ts.length);
  const el = h('div.home.cps-lista',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', conIcono('mapa', 'Ejercicios de carta resueltos')),
    h('p', 'Un ejemplo de cada tipo de ejercicio de carta, resuelto paso a paso sobre la carta del Estrecho: un paso, un dibujo, una cuenta. Lo nuevo de cada paso va en magenta. Al final de cada uno, la trampa que más se repite en el examen.'),
    grupos.map(([c, ts]) => h('section.category', h('h2', c.titulo), h('div.cards', ts.map(tarjeta)))),
    otros.length ? h('section.category', h('h2', `Del ${tit === 'per' ? 'Patrón de Yate' : 'otro nivel'}`),
      h('p.muted', tit === 'per' ? 'No entran en el examen del PER, pero están aquí si quieres verlos.' : ''), h('div.cards', otros.map(tarjeta))) : null,
    h('p.muted.small', 'Los ejemplos son propios, con los faros y la costa de la app; las cifras las calcula la app con los mismos motores que corrigen los ejercicios.'));
  return {
    el,
    summary: () => `VISTA ejercicios de carta resueltos ${T.sigla}\n${tipos.map((t) => `${t.id}: ${t.titulo} [${t.niveles.join('/')}] ${cuenta(t.pasos.length, 'paso')} → ${hrefPasos(tit, t.id)}`).join('\n')}`,
  };
}

function tipoView({ ctx, params: route, tit }) {
  const id = route.parts[1];
  const t = tipoCarta(ctx.chart, id);
  const [txtVolver, hrefVolver] = volverDe(tit, route.query.desde);
  if (!t) {
    return { el: h('div.home', volver('Ejercicios de carta resueltos', tlink(tit, ['carta-pasos'])), h('h1', 'Ejercicio no encontrado'), h('p', 'Ese tipo de ejercicio resuelto no existe.')), summary: () => `ERROR tipo resuelto ${id} no encontrado` };
  }
  const nivel = NIVEL[tit] ?? 'PY';
  const n = t.pasos.length;
  const leyenda = (i) => (t.pasos[i - 1].figura?.tipo === 'nortes'
    ? 'Los tres nortes con los ángulos exagerados. En magenta y más grueso, lo que se calcula en este paso.'
    : 'Extracto de la carta del Estrecho. En magenta y más grueso, lo que se traza en este paso.');
  const pasos = pasosEl({
    pasos: t.pasos, figura: (i) => figuraPaso(ctx.chart, t, i), leyenda, nombre: `Resolución de «${t.titulo}» paso a paso`,
    inicio: Number(route.query.p) || 1, todos: route.query.todos === '1',
    onCambio: (i, todos) => {
      // el paso y el modo quedan en la dirección (se puede recargar o compartir) sin volver a pintar la vista
      const q = { ...route.query, p: String(i) };
      if (todos) q.todos = '1'; else delete q.todos;
      history.replaceState(null, '', tlink(tit, ['carta-pasos', t.id], q));
    },
  });
  const ejercicios = t.ejercicios.map(getExercise).filter((e) => e && e.levels.includes(nivel));
  const el = h('div.cps-tipo',
    volver(txtVolver, hrefVolver),
    h('p.eti.cps-eti', `Ejercicio de carta resuelto · ${CATEGORIAS_PASOS.find((c) => c.id === t.categoria)?.titulo ?? ''}`),
    h('h1', t.titulo),
    !t.niveles.includes(nivel) ? h('p.aviso-nivel.muted', `Este tipo de ejercicio es del ${t.niveles.join(' y del ')}.`) : null,
    h('section.cps-enunciado', h('h2.eti', 'El ejemplo'), h('p', t.enunciado),
      h('ul.lc-datos.cps-datos', t.datos.map((d) => h('li', h(`span.lc-cifra${d.cifra.length > 9 ? '.muy-larga' : d.cifra.length > 6 ? '.larga' : ''}`, d.cifra), h('span.lc-dato-txt', d.texto))))),
    h('section.cps-resolucion', h('h2.eti', `La resolución en ${cuenta(n, 'paso')}`), pasos.el),
    h('section.cps-resultado#resultado', h('h2.eti', 'Resultado'),
      h('ul.lc-datos.cps-datos', t.resultado.map((d) => h('li', h(`span.lc-cifra${d.cifra.length > 12 ? '.muy-larga' : d.cifra.length > 8 ? '.larga' : ''}`, d.cifra), h('span.lc-dato-txt', d.texto))))),
    h('section.cps-convenios', h('h2.eti', 'Convenios de signos'), h('ul', t.convenios.map((c) => h('li', c)))),
    h('section.cps-trampas', h('h2.eti', 'La trampa'), h('ul', t.trampas.map((x) => h('li', h('strong', x.error), ' ', x.porque)))),
    ejercicios.length ? h('section.cps-practica', h('h2.eti', 'Ahora tú'),
      h('div.botones', ejercicios.map((e) => h('a.btn.secondary', { href: link(['ej', e.id]) }, `Practicar: ${e.title}`)))) : null);
  return {
    el,
    summary: () => {
      const { paso, todos } = pasos.estado();
      return `VISTA ejercicio de carta resuelto ${t.id} «${t.titulo}» (${t.niveles.join('/')}) · ${todos ? 'todos los pasos' : `paso ${paso} de ${n}`}\nENUNCIADO: ${t.enunciado}\n` +
        t.pasos.map((p, i) => `${i + 1}. ${p.titulo}: ${p.regla} ${(p.cuenta ?? []).join(' | ')}`).join('\n') +
        `\nRESULTADO: ${t.resultado.map((r) => `${r.texto} ${r.cifra}`).join(' · ')}\nTRAMPAS: ${t.trampas.map((x) => x.error).join(' / ')}`;
    },
  };
}

export function cartaPasosView(o) {
  return o.params.parts[1] ? tipoView(o) : listaView(o);
}
