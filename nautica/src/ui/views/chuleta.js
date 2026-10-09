// #/<tit>/temario/<ut>/chuleta — chuleta de un tema para imprimir (B6): de cada clase, su chuleta (fórmulas y
// datos clave), las reglas para recordar y las trampas. Todo sale del curso; sin contenido nuevo.
// En estilo C (docs/ESTILO-LAMINAS.md, «Mapas de conceptos y chuletas»): papel y tinta de carta (--lc-*), títulos en
// serifa, cifras en monoespaciada, la regla en una cartela y la trampa con su rótulo. Al imprimir (styles/laminas.css,
// @media print): A4, blanco y negro, dos columnas, cada clase sin partir y una cabecera con la titulación y la fecha.

import { h, setChildren } from '../dom.js';
import { loadCourse, loadMnemonics } from '../../store/datasets.js';
import { bloque } from '../../theory/blocks.js';
import { temasDePocoPeso } from '../../course/calendario.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { rich } from './curso.js';
import { glosar } from '../glosas.js';
import { icono, conIcono } from '../iconos.js';
import { fechaLarga } from '../../texto.js';

/** Contenido de la chuleta de un tema, sin DOM: por clase, sus puntos clave, reglas y trampas. */
export function contenidoChuleta(curso, ut, reglas = new Map()) {
  const m = curso?.modulos?.find((x) => x.ut === ut);
  return (m?.lecciones ?? []).map((l) => ({
    id: l.id,
    titulo: l.titulo,
    claves: l.chuleta ?? [],
    reglas: l.pasos.filter((p) => p.tipo === 'regla' && reglas.has(p.id)).map((p) => reglas.get(p.id)),
    trampas: l.pasos.filter((p) => p.tipo === 'ojo' && p.texto).map((p) => p.texto),
  })).filter((c) => c.claves.length || c.reglas.length || c.trampas.length);
}

/** Fecha de la hoja impresa: «9 de octubre de 2026». */
export const fechaImpresion = (d = new Date()) => fechaLarga(d, { diaSemana: false, año: true });

/**
 * Cabecera de la hoja impresa: la titulación (nombre y sigla), qué es y la fecha. Nada más: ningún nombre de centro
 * de formación ni de profesor (la chuleta es del temario oficial).
 * @returns {{ titulacion: string, hoja: string, fecha: string }}
 */
export function cabeceraImpresion(T, ut, fecha = new Date()) {
  return { titulacion: `${T.nombre} (${T.sigla})`, hoja: `Chuleta del tema ${ut}`, fecha: fechaImpresion(fecha) };
}

export function chuletaView({ tit, params: route, progress = null }) {
  const T = TITULACIONES[tit];
  const ut = Number(route.parts[1]);
  const b = bloque(T.estructura, ut);
  const cab = cabeceraImpresion(T, ut);
  const cuerpo = h('div.mc-clases', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA chuleta ${T.sigla} tema ${ut}`;
  const el = h('article.chuleta-tema.mc-hoja',
    h('div.no-imprimir.mc-acciones', volver(b?.titulo ?? 'Tema', tlink(tit, ['temario', String(ut)])),
      h('div.mc-botones',
        h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-trampas', !ev.target.checked) }), 'Incluir las trampas'),
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab',
      // Solo en papel: titulación, hoja y fecha (en pantalla ya lo dicen el eyebrow y la cabecera de la app).
      h('p.mc-impresion', h('span', cab.titulacion), h('span', cab.hoja), h('span', cab.fecha)),
      h('p.lc-eti.mc-eti-pantalla', icono(b?.ico ?? 'temario', 'ico-t'), `Chuleta · ${T.sigla} · tema ${ut}`),
      h('h1.lc-titulo', b?.titulo ?? `Tema ${ut}`),
      h('p.mc-intro', 'Lo esencial de cada clase: fórmulas y datos, reglas para recordar y trampas del examen.')),
    cuerpo);
  Promise.all([loadCourse(tit), loadMnemonics()]).then(([curso, mnemo]) => {
    const clases = contenidoChuleta(curso, ut, new Map(mnemo.reglas.map((r) => [r.id, r])));
    if (!clases.length) { setChildren(cuerpo, h('p', 'Este tema aún no tiene chuleta.')); return; }
    // En el plan esencial, la chuleta de un tema de poco peso es una tarea del plan: se marca como leída.
    const enPlan = progress?.settings()[`planEsencial_${tit}`] && temasDePocoPeso(T.estructura).includes(ut);
    const clave = `chuletasLeidas_${tit}`;
    const leida = () => (progress.settings()[clave] ?? []).includes(ut);
    const marca = enPlan ? h('div.no-imprimir.chuleta-leida') : null;
    const pintaMarca = () => marca && setChildren(marca, leida()
      ? h('p.ok', icono('ok', 'ico-t'), 'Leída: cuenta en tu plan. ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan'))
      : h('button.grande', { type: 'button', onclick: () => { progress.setSetting(clave, [...(progress.settings()[clave] ?? []), ut]); pintaMarca(); } }, conIcono('ok', 'Ya la he leído')));
    pintaMarca();
    setChildren(cuerpo, clases.map((c, i) => {
      const s = h('section.chuleta-clase.mc-clase', { 'aria-labelledby': `mc-clase-${i + 1}` },
        h('h2.mc-clase-tit', { id: `mc-clase-${i + 1}` }, h('span.mc-num', { 'aria-hidden': 'true' }, String(i + 1)), h('span', c.titulo)),
        c.claves.length ? h('ul.mc-claves', c.claves.map((x) => h('li', rich(x)))) : null,
        c.reglas.map((r) => h('div.chuleta-regla.mc-regla', h('p.mc-rotulo', conIcono('nudo', 'Para recordar')), h('p', h('strong', r.regla), ` — ${r.significado}`))),
        c.trampas.map((t) => h('div.chuleta-trampa.mc-trampa', h('p.mc-rotulo', conIcono('aviso', 'Trampa')), rich(t))));
      glosar(s, { tit, ut, leccion: c.id }); // siglas explicadas al tocarlas, la primera vez en cada clase
      return s;
    }));
    if (marca) cuerpo.append(marca);
    summaryText = `VISTA chuleta ${T.sigla} ${b?.titulo}\n${clases.map((c) => `## ${c.titulo}\n${c.claves.join('\n')}${c.reglas.map((r) => `\nREGLA: ${r.regla} — ${r.significado}`).join('')}${c.trampas.map((t) => `\nTRAMPA: ${t}`).join('')}`).join('\n')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la chuleta: ${e.message}`)));
  return { el, summary: () => summaryText };
}
