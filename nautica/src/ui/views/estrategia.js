// #/<tit>/estrategia — Estrategia de examen: cómo HACER el examen (R-31). Dos capas:
//  1. La de tu examen (titulación y tribunal): cifras, límites que suspenden, presupuesto de tiempo, orden, cómo leer y
//     descartar, qué hacer si no la sabes, repaso, el día antes y el día del examen y, en el PY, los módulos.
//  2. La tuya: con tus simulacros y «¿Estás listo?» (src/course/estrategia.js, tuEstrategia).
// Los textos están en data/comun/estrategia.json (normas con su fuente, consejos como consejos); la lógica, sin DOM, en
// src/course/estrategia.js. Nunca se enseña ni se enlaza con un examen en marcha (src/ui/modo-examen.js).
// En estilo C y para imprimir como las chuletas (styles/laminas.css, .mc-*; lo propio, al final de styles/app.css).

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { link } from '../router.js';
import { calcularPlan } from '../cierre.js';
import { loadEstrategia } from '../../store/datasets.js';
import { cifrasExamen, presupuestoTiempo, textosEstrategia, tuEstrategia, estrategiaPermitida, resumenEstrategia, num } from '../../course/estrategia.js';
import { modoExamen } from '../modo-examen.js';
import { randomSeed } from '../../math/rng.js';
import { icono, conIcono } from '../iconos.js';
import { cuenta } from '../../texto.js';
import { fechaImpresion } from './chuleta.js';

/** Fuentes citadas en la página (para la lista del final): se llena al pintar. */
let citadas = new Map();

/** Una línea de la lista: «Norma» con su fuente (corta; la completa, al final) o «Consejo». `eti`: con su rótulo. */
function item(x, eti = true) {
  const f = x.fuente;
  if (f && !citadas.has(f.id ?? f.titulo)) citadas.set(f.id ?? f.titulo, f);
  return h('li.est-item', { 'data-tipo': x.tipo },
    eti ? h('span.est-eti', x.tipo === 'norma' ? 'Norma' : 'Consejo') : null,
    h('span.est-texto', x.texto),
    f ? h('span.est-fuente', 'Fuente: ', f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.corto ?? f.titulo) : (f.corto ?? f.titulo), f.ref ? `, ${f.ref}` : '', '.') : null);
}
/** Lista de normas y consejos. Si todas son del mismo tipo, el rótulo va una vez encima («Consejos de método»). */
function lista(xs) {
  const ys = (xs ?? []).flat().filter(Boolean);
  if (!ys.length) return null;
  const tipos = new Set(ys.map((x) => x.tipo));
  if (tipos.size > 1) return h('ul.est-lista', ys.map((x) => item(x)));
  const norma = tipos.has('norma');
  return [h('p.est-rotulo', { 'data-tipo': norma ? 'norma' : 'consejo' }, norma ? 'Lo que dice la norma' : 'Consejos de método (no son norma)'), h('ul.est-lista', ys.map((x) => item(x, false)))];
}

function seccion(id, ico, titulo, ...hijos) {
  return h('section.mc-clase.est-seccion', { 'aria-labelledby': `est-${id}` },
    h('h2.mc-clase-tit', { id: `est-${id}` }, icono(ico, 'ico-t'), h('span', titulo)), ...hijos);
}

function tablaTiempo(t, varios) {
  const fmt = (x) => (x == null ? '—' : `${num(x)} min`);
  return h('table.est-tabla',
    h('caption', varios ? `${t.titulo}: ${cuenta(t.duracionMin, 'minuto')}` : `${cuenta(t.duracionMin, 'minuto')} en total`),
    h('thead', h('tr', h('th', { scope: 'col' }, 'Parte'), h('th', { scope: 'col' }, h('abbr', { title: 'Preguntas' }, 'Preg.')), h('th', { scope: 'col' }, 'Min.'), h('th', { scope: 'col' }, 'Cada una'))),
    h('tbody', t.filas.map((f) => h('tr', { class: `est-fila-${f.parte}` },
      h('th', { scope: 'row' }, f.nombre), h('td', f.preguntas ?? '—'), h('td', String(f.minutos)), h('td', fmt(f.porPregunta))))));
}

/** Hitos del reloj; en un examen por módulos, contados desde que empieza cada módulo. */
function hitos(t, varios) {
  const m = (x) => (varios ? `Minuto ${x} del módulo` : `Minuto ${x}`);
  const ls = [h('li', h('strong', m(t.hito)), `: primera pasada de teoría hecha (las dudosas, marcadas)${t.cartaDesde != null ? '; a la carta' : ''}.`)];
  ls.push(h('li', h('strong', m(t.repasoDesde)), ': repaso final, pase lo que pase.'));
  return h('ul.est-hitos', ls);
}

/** «Tu estrategia» (capa 2): tus datos, tus consejos o la invitación a hacer un simulacro. */
function tuya(T, c, tu) {
  const datos = [];
  if (tu.tiempo) datos.push(h('li', h('span.lc-cifra', `${Math.round(tu.tiempo.media)} min`), h('span.lc-dato-txt', `tardas de media (el examen: ${c.duracionMin})`)));
  if (tu.masCerca) datos.push(h('li', h('span.lc-cifra', tu.masCerca.media != null ? `${num(tu.masCerca.media)} / ${tu.masCerca.maxErrores}` : `${Math.round(100 * tu.masCerca.pFalla)} %`),
    h('span.lc-dato-txt', tu.masCerca.media != null ? `fallos de media en ${tu.masCerca.titulo} / máximo` : `de riesgo de pasarte en ${tu.masCerca.titulo}`)));
  if (tu.colchon) datos.push(h('li', h('span.lc-cifra', `${num(tu.colchon.media)} / ${tu.colchon.permitidos}`), h('span.lc-dato-txt', 'fallos de media / permitidos')));
  return seccion('tuya', 'diana', 'Tu estrategia',
    tu.suficiente ? h('p.est-sub', tu.simulacros ? `Con tus ${cuenta(tu.simulacros, 'examen completo', 'exámenes completos')} más recientes${tu.masCerca?.pFalla != null ? ' y tus respuestas' : ''}.` : 'Con tus respuestas en las tandas y los repasos.') : null,
    datos.length ? h('ul.lc-datos.est-datos', datos) : null,
    tu.consejos.length ? h('ol.est-consejos', tu.consejos.map((k) => h('li', k.texto,
      k.ut != null ? [' ', h('a.no-imprimir', { href: tlink(T.id, ['teoria', 'ut', String(k.ut)], { s: randomSeed() }) }, 'Hacer una tanda →')] : null))) : null,
    tu.aviso ? h('p.est-aviso', tu.aviso) : null,
    !tu.simulacros || tu.simulacros < 2 ? h('p.no-imprimir', h('a.btn.grande', { href: tlink(T.id, ['test', 'simulacro'], { s: randomSeed() }) }, conIcono('reloj', 'Hacer un simulacro'))) : null);
}

export function estrategiaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  let summaryText = `VISTA estrategia de examen ${T.sigla} (cargando)`;
  // Segunda barrera: con un examen en marcha no hay estrategia (la vista tampoco se enlaza desde él).
  if (!estrategiaPermitida({ modo: modoExamen(), hash: typeof location === 'undefined' ? '' : location.hash })) {
    return { el: h('div', h('h1', 'Estrategia de examen'), h('p', 'No está disponible durante un examen.')), summary: () => 'VISTA estrategia: no disponible durante un examen' };
  }
  const cuerpo = h('div.mc-clases.est-cuerpo', h('p.muted', 'Cargando…'));
  const eti = h('p.lc-eti.mc-eti-pantalla', icono('diana', 'ico-t'), `Estrategia · ${T.sigla}`);
  const impresion = h('p.mc-impresion', h('span', `${T.nombre} (${T.sigla})`), h('span', 'Estrategia de examen'), h('span', fechaImpresion()));
  const el = h('article.mc-hoja.estrategia',
    h('div.no-imprimir.mc-acciones', volver('Examen', tlink(tit, ['examenes'])),
      h('div.mc-botones',
        h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-tuya', !ev.target.checked) }), 'Incluir mis datos'),
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab', impresion, eti,
      h('h1.lc-titulo', 'Cómo hacer el examen'),
      h('p.mc-intro', 'Lo que dicen las normas de tu examen, con su fuente, y consejos de método para el día. Los consejos son eso: consejos, no normas.')),
    cuerpo);

  Promise.all([loadEstrategia(), calcularPlan(progress, tit, Date.now(), { guardar: false })]).then(([datos, { banco, st }]) => {
    const ficha = banco.eje;
    citadas = new Map();
    const c = cifrasExamen(T, ficha);
    const tx = textosEstrategia(datos, { tit, eje: ficha.id, calculadora: c.calculadora.permitida });
    const pres = presupuestoTiempo(T, tx.tiempo);
    const tu = tuEstrategia({ estructura: T.estructura, tests: st.datos.tests, listo: st.listo });
    eti.replaceChildren(icono('diana', 'ico-t'), `Estrategia · ${T.sigla} · ${ficha.nombre}`);
    impresion.children[1].textContent = `Estrategia de examen · ${ficha.nombre}`;

    const cifras = seccion('cifras', 'examen', 'Tu examen en cifras',
      h('ul.lc-datos.est-datos',
        h('li', h('span.lc-cifra', String(c.preguntas)), h('span.lc-dato-txt', 'preguntas')),
        h('li', h('span.lc-cifra', String(c.duracionMin)), h('span.lc-dato-txt', 'minutos')),
        h('li', h('span.lc-cifra', num(c.minPorPregunta)), h('span.lc-dato-txt', 'minutos por pregunta')),
        h('li', h('span.lc-cifra', String(c.minAciertos)), h('span.lc-dato-txt', 'aciertos para aprobar')),
        h('li', h('span.lc-cifra', String(c.colchon)), h('span.lc-dato-txt', 'fallos como máximo'))),
      lista([
        { tipo: 'norma', texto: `${cuenta(c.preguntas, 'pregunta')} tipo test de cuatro opciones en ${cuenta(c.duracionMin, 'minuto')}; apto con al menos ${cuenta(c.minAciertos, 'acierto')}.`, fuente: { id: 'rd875', ...datos.fuentes.rd875 } },
        { tipo: 'norma', texto: c.calculadora.permitida ? 'Calculadora científica: permitida.' : 'Calculadora: no permitida.', fuente: c.calculadora.fuente },
        c.reglasTribunal.map((r) => ({ tipo: 'norma', texto: r, fuente: { id: 'ficha', ...datos.fuentes.ficha, titulo: datos.fuentes.ficha.titulo.replace('<eje>', ficha.id) } })),
      ]));

    const limites = seccion('limites', 'aviso', 'Los límites que suspenden',
      h('p', `Aunque llegues a ${cuenta(c.minAciertos, 'acierto')}, suspendes si pasas el máximo de fallos de uno de estos temas:`),
      h('table.est-tabla.est-limites',
        h('caption', 'Temas con límite de fallos'),
        h('thead', h('tr', h('th', { scope: 'col' }, 'Tema'), h('th', { scope: 'col' }, h('abbr', { title: 'Preguntas' }, 'Preg.')), h('th', { scope: 'col' }, 'Fallos máx.'), h('th', { scope: 'col' }, 'Bien mín.'))),
        h('tbody', c.limites.map((l) => h('tr', h('th', { scope: 'row' }, conIcono(l.ico, l.corto)), h('td', String(l.n)), h('td', String(l.maxErrores)), h('td', String(l.minBien)))))),
      h('p.est-colchon', h('strong', `Colchón: ${cuenta(c.colchon, 'fallo')} en total.`), ` Si gastas los ${c.enLimites} que permiten los temas con límite, te quedan ${c.colchonLibre} para todo lo demás (${c.sinLimite.join(', ')}).`),
      lista([tx.correccion.verificado ? [...tx.correccion.normas, tx.correccion.base] : null,
        tx.correccion.app ? { tipo: 'norma', texto: tx.correccion.app, fuente: { id: 'app', ...datos.fuentes.app } } : null]),
      !tx.correccion.verificado && tx.correccion.pendiente ? h('p.est-pendiente', icono('aviso', 'ico-t'), tx.correccion.pendiente) : null);

    const tiempo = seccion('tiempo', 'reloj', 'Presupuesto de tiempo',
      h('p', `De media tienes ${cuenta(Math.round(c.minPorPregunta * 10) / 10, 'minuto')} por pregunta, pero no todas cuestan igual: las de carta llevan dibujo y cuenta. Un reparto razonable:`),
      pres.map((t) => h('div.est-tramo', tablaTiempo(t, pres.length > 1), hitos(t, pres.length > 1))),
      lista([{ tipo: 'consejo', texto: tx.tiempo.nota }, tx.py ? { tipo: 'consejo', texto: tx.py.reloj.texto } : null,
        tx.py?.reloj.comprobado ? { tipo: 'norma', texto: tx.py.reloj.dato, fuente: tx.py.reloj.fuente } : null]));

    const modulos = tx.py ? seccion('modulos', 'brujula', 'El PY por módulos',
      lista(tx.py.modulos), lista(tx.py.consejos),
      h('p.no-imprimir', h('a', { href: tlink(tit, ['examenes']) }, 'Simulacro de un solo módulo, en Examen →'))) : null;

    const dia = seccion('dia', 'calendario', 'El día del examen',
      lista(tx.tribunal.dia), lista([tx.calculadora ? { tipo: 'consejo', texto: tx.calculadora } : null, tx.diaExamen]),
      !c.calculadora.permitida ? h('p.no-imprimir', h('a', { href: tlink(tit, ['cuentas']) }, 'Las cuentas del patrón →')) : null,
      tx.tribunal.nota ? h('p.est-nota', tx.tribunal.nota) : null);

    const pend = [...tx.pendientes, ...(!tx.correccion.verificado && tx.correccion.pendiente ? [tx.correccion.pendiente] : [])];

    setChildren(cuerpo,
      cifras,
      h('div.est-tuya', tuya(T, c, tu)),
      limites,
      tiempo,
      seccion('orden', 'lista', 'Orden para contestar', lista(tx.orden)),
      seccion('leer', 'lupa', 'Leer el enunciado y descartar', lista(tx.leer)),
      seccion('nosabes', 'pregunta', 'Si no la sabes', lista(tx.noSabes)),
      seccion('repaso', 'repaso', 'Repaso final y hoja de respuestas', lista(tx.repaso)),
      modulos,
      seccion('antes', 'luna', 'El día antes', lista(tx.diaAntes)),
      dia,
      pend.length ? seccion('pendiente', 'aviso', 'Pendiente de verificar', h('p.est-sub', 'Esto no está comprobado para tu tribunal y por eso no se afirma arriba. Míralo en su convocatoria.'), h('ul', pend.map((p) => h('li', p)))) : null,
      h('section.est-fuentes', h('h2.mc-clase-tit', 'Fuentes'), h('ul', [...citadas.values()].map((f) => h('li', f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.titulo) : f.titulo))),
        h('p.est-sub.no-imprimir', 'Reglas del examen y exámenes de convocatorias anteriores, en ', h('a', { href: tlink(tit, ['examenes']) }, 'Examen'), '. Trucos para recordar, en ', h('a', { href: link(['reglas']) }, 'Reglas para recordar'), '.')));
    summaryText = `VISTA estrategia de examen ${T.sigla} · ${ficha.nombre}\n${resumenEstrategia(c, pres, tu)}\nRUTAS: #/${tit}/test/simulacro?s=<semilla> · #/${tit}/examenes`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la estrategia: ${e.message}`)));
  return { el, summary: () => summaryText };
}
