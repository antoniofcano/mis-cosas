// #/<tit>/vispera — el repaso exprés de la víspera (R-45): en una sola pantalla y sin preguntas, las trampas más repetidas
// de los temas con límite de fallos (PER: Balizamiento, RIPA y Carta; PY: Teoría de navegación y Carta), priorizadas por
// tus ideas flojas y por lo que más se pregunta en tu tribunal, para leerlas en unos 15 minutos (src/course/vispera.js:
// de dónde sale cada cosa, cómo se eligen y cómo se recortan). Tono tranquilo. Imprimible (estilo C, como las chuletas).
// El penúltimo día de «la semana antes» (k = 1) es su paso; también se abre desde Hoy, la semana y la Biblioteca. Nunca
// se enseña ni se enlaza con un examen en marcha (src/ui/modo-examen.js).

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { calcularPlan } from '../cierre.js';
import { loadCourse, loadMnemonics, loadErroresFrecuentes } from '../../store/datasets.js';
import { estrategiaPermitida } from '../../course/estrategia.js';
import { ideasPriorizadas, temasPriorizados } from '../../course/semana.js';
import { repasoExpres, resumenVispera, MINUTOS_VISPERA } from '../../course/vispera.js';
import { erroresAlumno } from '../../store/errores.js';
import { modoExamen } from '../modo-examen.js';
import { rich } from './curso.js';
import { glosar } from '../glosas.js';
import { icono, conIcono } from '../iconos.js';
import { cuenta } from '../../texto.js';
import { fechaImpresion } from './chuleta.js';
import { enPasoDeSesion, botonesSesion } from '../sesion.js';

export function visperaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  let summaryText = `VISTA repaso exprés de la víspera ${T.sigla} (cargando)`;
  if (!estrategiaPermitida({ modo: modoExamen(), hash: typeof location === 'undefined' ? '' : location.hash })) {
    return { el: h('div', h('h1', 'Repaso exprés'), h('p', 'No está disponible durante un examen.')), summary: () => 'VISTA repaso exprés: no disponible durante un examen' };
  }
  const cuerpo = h('div.mc-clases.vs-cuerpo', h('p.muted', 'Preparando tu repaso…'));
  const eti = h('p.lc-eti.mc-eti-pantalla', icono('luna', 'ico-t'), `Víspera · ${T.sigla}`);
  const impresion = h('p.mc-impresion', h('span', `${T.nombre} (${T.sigla})`), h('span', 'Repaso exprés de la víspera'), h('span', fechaImpresion()));
  const intro = h('p.mc-intro', `Una lectura tranquila, sin preguntas y sin prisa: las trampas que más se repiten en los temas donde un despiste suspende. Unos ${cuenta(MINUTOS_VISPERA, 'minuto')}.`);
  const el = h('article.mc-hoja.vispera',
    h('div.no-imprimir.mc-acciones', volver('Hoy', tlink(tit)),
      h('div.mc-botones',
        h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-reglas', !ev.target.checked) }), 'Con las reglas para recordar'),
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab', impresion, eti, h('h1.lc-titulo', 'Repaso exprés de la víspera'), intro),
    cuerpo);

  Promise.all([loadCourse(tit), loadMnemonics(), loadErroresFrecuentes(), calcularPlan(progress, tit, Date.now(), { guardar: false })]).then(([curso, mnemo, frecuentes, d]) => {
    const { banco, indiceConceptos: ic } = d;
    const ficha = banco.eje;
    const base = { estructura: T.estructura, preguntas: banco.practica, respuestas: d.respuestas, reservadas: banco.reservadas };
    // Cada idea con las clases que la enseñan: la prioridad de una trampa es la de las ideas de su clase.
    const ideas = ideasPriorizadas({ ic, ...base }).map((i) => ({ ...i, clases: ic?.concepto(i.id)?.clases ?? [] }));
    const r = repasoExpres({
      curso, estructura: T.estructura, reglas: new Map(mnemo.reglas.map((x) => [x.id, x])), ideas, temas: temasPriorizados(base),
      erroresTribunal: frecuentes.porBanco?.[`${ficha.id}/${tit}`] ?? [], erroresAlumno: erroresAlumno().resumen().errores, cartaUt: T.cartaUt ?? null,
    });
    eti.replaceChildren(icono('luna', 'ico-t'), `Víspera · ${T.sigla} · ${ficha.nombre}`);
    impresion.children[1].textContent = `Repaso exprés de la víspera · ${ficha.nombre}`;
    if (r.vacio) { setChildren(cuerpo, h('p', 'Aún no hay trampas que repasar para esta titulación.')); summaryText = resumenVispera(r); return; }
    const flojas = r.temas.some((t) => t.trampas.some((x) => x.tuyo));
    setChildren(intro, `Una lectura tranquila, sin preguntas y sin prisa: las trampas que más se repiten en los temas donde un despiste suspende (${r.temas.map((t) => t.titulo).join(', ')}). Unos ${cuenta(r.minutos, 'minuto')}${flojas ? '; van antes las que más te cuestan' : ''}.`);

    const tema = (t) => h('section.mc-clase.vs-tema', { 'aria-labelledby': `vs-t${t.ut}` },
      h('h2.mc-clase-tit', { id: `vs-t${t.ut}` }, icono(t.ico ?? 'temario', 'ico-t'), h('span', t.titulo)),
      h('p.vs-limite', `Aquí un despiste suspende: como mucho ${cuenta(t.maxErrores, 'fallo')} de ${cuenta(t.n, 'pregunta')}.`),
      t.trampas.map((x, i) => {
        const nueva = i === 0 || t.trampas[i - 1].leccion !== x.leccion;
        const c = h('div.mc-trampa.vs-trampa', { class: x.tuyo ? 'tuya' : '' },
          h('p.mc-rotulo', conIcono('aviso', 'Trampa'), nueva ? h('span.vs-clase', ` · ${x.leccionTitulo}`) : null, x.tuyo ? h('span.vs-cuesta', ' · te cuesta') : null),
          rich(x.texto));
        glosar(c, { tit, ut: t.ut, leccion: x.leccion });
        return c;
      }),
      t.reglas.map((x) => h('div.mc-regla.vs-regla', h('p.mc-rotulo', conIcono('nudo', 'Para recordar')), h('p', h('strong', x.regla), ` — ${x.significado}`))));

    const errores = r.errores.length ? h('section.mc-clase.vs-errores', { 'aria-labelledby': 'vs-errores' },
      h('h2.mc-clase-tit', { id: 'vs-errores' }, icono('mapa', 'ico-t'), h('span', 'En la carta: los errores que más se repiten')),
      h('p.vs-limite', 'Los que más ponen los tribunales como respuesta falsa, y los que tú has cometido.'),
      h('ul.vs-errores-lista', r.errores.map((e) => h('li', { class: e.tuyo ? 'tuyo' : '' },
        h('strong', e.nombre), e.tuyo ? h('span.vs-cuesta', ` · tuyo: ${cuenta(e.tuyo, 'vez', 'veces')}`) : null,
        h('span.vs-si', `Es lo que sale si ${e.si}.`))))) : null;

    // Como paso de la sesión de la víspera: «Ya lo he leído» lo da por hecho y ofrece seguir (no tiene cierre propio).
    const cierre = h('div.no-imprimir.vs-cierre');
    if (enPasoDeSesion()) {
      setChildren(cierre, h('button.grande', { type: 'button', onclick: () => { const b = botonesSesion(); if (b) setChildren(cierre, h('div.botones', b)); } }, conIcono('ok', 'Ya lo he leído')));
    } else {
      setChildren(cierre,
        h('p.vs-calma', 'Con esto vale. Ahora, tu lista del día del examen y a descansar: dormir bien cuenta tanto como una tanda más.'),
        h('div.botones', h('a.btn', { href: tlink(tit, ['dia-examen']) }, conIcono('lista', 'Mi lista del día del examen')),
          h('a.btn.secondary', { href: tlink(tit) }, 'Volver a Hoy')));
    }

    setChildren(cuerpo, r.temas.map(tema), errores,
      h('p.vs-pie.est-nota', `${cuenta(r.temas.reduce((s, t) => s + t.trampas.length, 0), 'trampa')} de ${cuenta(r.temas.length, 'tema')}, unos ${cuenta(r.minutos, 'minuto')} de lectura.`,
        r.recortado ? [` Van las más importantes para ti; hay ${cuenta(r.fuera, 'más', 'más')} en `, h('a', { href: tlink(tit, ['chuletas']) }, 'las chuletas'), '.'] : null),
      cierre);
    summaryText = `VISTA repaso exprés de la víspera ${T.sigla} · ${ficha.nombre}\n${resumenVispera(r)}\nRUTAS: #/${tit}/dia-examen · #/${tit}/chuletas`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar el repaso: ${e.message}`)));
  return { el, summary: () => summaryText };
}
