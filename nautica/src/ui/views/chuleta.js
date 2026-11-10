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
import { enPasoDeSesion, botonesSesion } from '../sesion.js';

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

/** Una clase de la chuleta: título numerado, puntos clave, reglas y trampas. `pre`: prefijo de los id (varios temas en una hoja). */
function seccionClase(c, i, tit, ut, pre = 'mc-clase') {
  const id = `${pre}-${i + 1}`;
  const s = h('section.chuleta-clase.mc-clase', { 'aria-labelledby': id },
    h(pre === 'mc-clase' ? 'h2.mc-clase-tit' : 'h3.mc-clase-tit', { id }, h('span.mc-num', { 'aria-hidden': 'true' }, String(i + 1)), h('span', c.titulo)),
    c.claves.length ? h('ul.mc-claves', c.claves.map((x) => h('li', rich(x)))) : null,
    c.reglas.map((r) => h('div.chuleta-regla.mc-regla', h('p.mc-rotulo', conIcono('nudo', 'Para recordar')), h('p', h('strong', r.regla), ` — ${r.significado}`))),
    c.trampas.map((t) => h('div.chuleta-trampa.mc-trampa', h('p.mc-rotulo', conIcono('aviso', 'Trampa')), rich(t))));
  glosar(s, { tit, ut, leccion: c.id }); // siglas explicadas al tocarlas, la primera vez en cada clase
  return s;
}

/** Todas las chuletas de una titulación, sin DOM: por tema del examen (en su orden oficial), las clases de contenidoChuleta. */
export function contenidoChuletas(curso, estructura, reglas = new Map()) {
  return estructura.bloques.map((b) => ({ ut: b.ut, titulo: b.titulo, ico: b.ico, clases: contenidoChuleta(curso, b.ut, reglas) })).filter((t) => t.clases.length);
}

// #/<tit>/chuletas — todas las chuletas de la titulación en una hoja, agrupadas por tema, para imprimir o guardar en PDF.
// Al imprimir, cada tema empieza en página nueva (styles/laminas.css).
export function chuletasView({ tit }) {
  const T = TITULACIONES[tit];
  const cab = { titulacion: `${T.nombre} (${T.sigla})`, hoja: 'Chuletas de todos los temas', fecha: fechaImpresion() };
  const cuerpo = h('div.mc-temas', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA chuletas ${T.sigla} (todos los temas)`;
  const el = h('article.chuleta-tema.chuletas-todas.mc-hoja',
    h('div.no-imprimir.mc-acciones', volver('Biblioteca', tlink(tit, ['biblioteca'])),
      h('div.mc-botones',
        h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-trampas', !ev.target.checked) }), 'Incluir las trampas'),
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab',
      h('p.mc-impresion', h('span', cab.titulacion), h('span', cab.hoja), h('span', cab.fecha)),
      h('p.lc-eti.mc-eti-pantalla', icono('temario', 'ico-t'), `Chuletas · ${T.sigla} · todos los temas`),
      h('h1.lc-titulo', 'Todas las chuletas'),
      h('p.mc-intro', 'Lo esencial de cada clase, tema a tema: fórmulas y datos, reglas para recordar y trampas del examen. Al imprimir, cada tema empieza en una página.')),
    cuerpo);
  Promise.all([loadCourse(tit), loadMnemonics()]).then(([curso, mnemo]) => {
    const temas = contenidoChuletas(curso, T.estructura, new Map(mnemo.reglas.map((r) => [r.id, r])));
    if (!temas.length) { setChildren(cuerpo, h('p', 'Aún no hay chuletas.')); return; }
    setChildren(cuerpo,
      h('nav.no-imprimir.mc-indice', { 'aria-label': 'Temas' }, temas.map((t) => h('a', { href: `#mc-tema-${t.ut}`, onclick: (ev) => { ev.preventDefault(); document.getElementById(`mc-tema-${t.ut}`)?.scrollIntoView({ block: 'start' }); } }, `${t.ut} · ${t.titulo}`))),
      temas.map((t) => h('section.mc-tema', { 'aria-labelledby': `mc-tema-${t.ut}` },
        h('h2.mc-tema-tit', { id: `mc-tema-${t.ut}` }, icono(t.ico ?? 'temario', 'ico-t'), `Tema ${t.ut} · ${t.titulo}`),
        h('div.mc-clases', t.clases.map((c, i) => seccionClase(c, i, tit, t.ut, `mc-t${t.ut}-clase`))))));
    summaryText = `VISTA chuletas ${T.sigla} (todos los temas)\n${temas.map((t) => `# Tema ${t.ut} ${t.titulo}: ${t.clases.map((c) => c.titulo).join(' · ')}`).join('\n')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudieron preparar las chuletas: ${e.message}`)));
  return { el, summary: () => summaryText };
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
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')),
        h('a.mc-todas', { href: tlink(tit, ['chuletas']) }, 'Todas las chuletas en una hoja'))),
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
    setChildren(cuerpo, clases.map((c, i) => seccionClase(c, i, tit, ut)));
    if (marca) cuerpo.append(marca);
    // Como paso de una sesión (p. ej. el repaso ligero de «la semana antes»): «Ya la he repasado» lo da por hecho y
    // ofrece seguir con la sesión (la chuleta no tiene cierre propio).
    if (enPasoDeSesion()) {
      const fin = h('div.no-imprimir.chuleta-sesion');
      setChildren(fin, h('button.grande', { type: 'button', onclick: () => { const b = botonesSesion(); if (b) setChildren(fin, h('div.botones', b)); } }, conIcono('ok', 'Ya la he repasado')));
      cuerpo.append(fin);
    }
    summaryText = `VISTA chuleta ${T.sigla} ${b?.titulo}\n${clases.map((c) => `## ${c.titulo}\n${c.claves.join('\n')}${c.reglas.map((r) => `\nREGLA: ${r.regla} — ${r.significado}`).join('')}${c.trampas.map((t) => `\nTRAMPA: ${t}`).join('')}`).join('\n')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la chuleta: ${e.message}`)));
  return { el, summary: () => summaryText };
}
