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
import { cifrasExamen, presupuestoTiempo, textosEstrategia, tuEstrategia, estrategiaPermitida, resumenEstrategia, num, tiempoDisponible, bloquesAbiertos } from '../../course/estrategia.js';
import { velocidadPorTipo, consejoVelocidad, duracion, mmssCorto, resumenVelocidad } from '../../course/velocidad.js';
import { tiemposAlumno } from '../../store/tiempos.js';
import { cuentaEnsayos } from '../../theory/ensayo.js';
import { modoExamen } from '../modo-examen.js';
import { randomSeed } from '../../math/rng.js';
import { icono, conIcono } from '../iconos.js';
import { cuenta } from '../../texto.js';
import { fechaImpresion } from './chuleta.js';
import { plegable, abrirAlImprimir } from '../plegable.js';
import { ESTRATEGIA as TX } from '../textos-hubs.js';

/** Fuentes citadas en la página, numeradas por orden de aparición (la lista de «Fuentes y normas» del final): se llena al pintar. */
let citadas = new Map();
function numeroDeFuente(f) {
  const k = `${f.id ?? f.titulo}|${f.ref ?? ''}`;
  if (!citadas.has(k)) citadas.set(k, { n: citadas.size + 1, f });
  return citadas.get(k).n;
}

/** Una línea de la lista: «Norma» o «Consejo»; la fuente, con su número [n] (la lista completa va al final). `eti`: con su rótulo. */
function item(x, eti = true) {
  const f = x.fuente;
  const n = f ? numeroDeFuente(f) : null;
  return h('li.est-item', { 'data-tipo': x.tipo },
    eti ? h('span.est-eti', x.tipo === 'norma' ? 'Norma' : 'Consejo') : null,
    h('span.est-texto', x.texto, n ? h('sup.est-ref', { title: `Fuente ${n}` }, `[${n}]`) : null));
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
/** Un apartado dentro de un bloque plegable. */
function sub(id, ico, titulo, ...hijos) {
  return h('section.est-sub-bloque', { 'aria-labelledby': `est-${id}` },
    h('h3.est-sub-tit', { id: `est-${id}` }, icono(ico, 'ico-t'), h('span', titulo)), ...hijos);
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

/** «Tu estrategia» (capa 2): tus datos y tus consejos, o una línea que invita a hacer un simulacro. El botón va fuera, siempre. */
function tuya(T, c, tu) {
  const datos = [];
  if (tu.tiempo) datos.push(h('li', h('span.lc-cifra', `${Math.round(tu.tiempo.media)} min`), h('span.lc-dato-txt', `de media (examen: ${c.duracionMin})`)));
  if (tu.masCerca) datos.push(h('li', h('span.lc-cifra', tu.masCerca.media != null ? `${num(tu.masCerca.media)} / ${tu.masCerca.maxErrores}` : `${Math.round(100 * tu.masCerca.pFalla)} %`),
    h('span.lc-dato-txt', tu.masCerca.media != null ? `fallos en ${tu.masCerca.titulo}` : `riesgo en ${tu.masCerca.titulo}`)));
  if (tu.colchon) datos.push(h('li', h('span.lc-cifra', `${num(tu.colchon.media)} / ${tu.colchon.permitidos}`), h('span.lc-dato-txt', 'fallos / permitidos')));
  return seccion('tuya', 'diana', 'Tu estrategia',
    !tu.suficiente ? h('p.est-sub', TX.sinDatos) : null,
    datos.length ? h('ul.lc-datos.est-datos', datos) : null,
    tu.consejos.length ? h('ol.est-consejos', tu.consejos.map((k) => h('li', k.texto,
      k.ut != null ? [' ', h('a.no-imprimir', { href: tlink(T.id, ['teoria', 'ut', String(k.ut)], { s: randomSeed() }) }, 'Hacer una tanda →')] : null))) : null,
    tu.suficiente && tu.aviso ? h('p.est-aviso', tu.aviso) : null);
}

const TENDENCIA = { baja: ['↓', 'más rápido'], sube: ['↑', 'más lento'], estable: ['=', 'igual'] };
const ESTADO = { cabe: 'Cabe', justo: 'Justo', 'se-pasa': 'Te pasas' };

/**
 * «Tu tiempo por tipo de problema de carta» (R-42), solo con tiempos guardados: tu media en cada tipo (exámenes y
 * práctica), su tendencia y si cabe en el tiempo que te deja el examen por pregunta de carta; debajo, por dónde empezar.
 */
function velocidad(T, disp, filas, consejo) {
  const carta = filas.filter((f) => f.carta);
  if (!carta.length) return null;
  const teoria = filas.find((f) => !f.carta);
  return sub('velocidad', 'reloj', 'Tu tiempo por tipo de problema de carta',
    h('p.est-sub', `Con tus exámenes y tu práctica de carta (solo cuenta el tiempo con la app a la vista). Tienes unos ${duracion(disp.cartaS)} por pregunta de carta${disp.tramo ? ` en el ${disp.tramo.toLowerCase()}` : ''} según el reparto de arriba; la media del examen es ${duracion(disp.mediaS)} por pregunta.`),
    h('table.est-tabla.est-velocidad',
      h('caption', 'Tu media por tipo, de las más lentas a las más rápidas'),
      h('thead', h('tr', h('th', { scope: 'col' }, 'Tipo'), h('th', { scope: 'col' }, h('abbr', { title: 'Media en minutos y segundos' }, 'Media')), h('th', { scope: 'col' }, 'Tiempo'))),
      h('tbody', [...carta, ...(teoria ? [teoria] : [])].map((f) => h('tr', { class: f.estado ? `est-vel-${f.estado}` : '' },
        h('th', { scope: 'row' }, h('span.est-vel-nombre', f.nombre),
          h('span.est-vel-dato', cuenta(f.n, 'vez', 'veces'), f.tendencia ? [' · ', h('span', { 'aria-hidden': 'true' }, TENDENCIA[f.tendencia][0]), ` ${TENDENCIA[f.tendencia][1]}`] : '')),
        h('td', { 'aria-label': duracion(f.mediaS) }, mmssCorto(f.mediaS)),
        h('td.est-vel-estado', f.estado ? ESTADO[f.estado] : '—')))) ),
    consejo ? h('p.est-colchon', h('strong', 'Por dónde empezar: '), consejo.texto) : null,
    h('p.no-imprimir', h('a', { href: tlink(T.id, ['carta']) }, 'Ejercicios de carta →')));
}

/** Ensayo general en papel (R-41): cuántos llevas de los recomendados y el enlace. */
function ensayos(T, ce) {
  return sub('ensayo', 'lapiz', 'Ensayo general en papel',
    h('p', ce.texto),
    h('p.est-sub', 'La app solo te da los enunciados y el reloj; tú lo resuelves con la carta de papel, el transportador, el compás y el lápiz, y al final pasas las respuestas a la hoja.'),
    h('p.no-imprimir', h('a.btn.secondary', { href: tlink(T.id, ['ensayo']) }, conIcono('lapiz', ce.hechos ? 'Hacer otro ensayo en papel' : 'Preparar un ensayo en papel'))));
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
  const intro = h('p.mc-intro', TX.entrada(T.sigla, '…'));
  let imprimible = null;
  // Imprimir y «Incluir mis datos» van al pie: arriba solo cabe lo que se lee y la acción principal.
  const acciones = h('div.no-imprimir.mc-acciones.est-pie-acciones',
    h('div.mc-botones',
      h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (ev) => el.classList.toggle('sin-tuya', !ev.target.checked) }), 'Incluir mis datos'),
      // Al imprimir salen todos los bloques abiertos (ui/plegable.js): lo plegado no se pierde en el papel.
      h('button.mc-imprimir', { type: 'button', onclick: () => { imprimible?.abrir(); window.print(); } }, conIcono('imprimir', 'Imprimir / guardar PDF'))));
  const el = h('article.mc-hoja.estrategia',
    h('div.no-imprimir.mc-acciones', volver('Examen', tlink(tit, ['examenes']))),
    h('header.mc-hoja-cab', impresion, eti,
      h('h1.lc-titulo', 'Cómo hacer el examen'),
      intro),
    cuerpo, acciones);
  imprimible = abrirAlImprimir(el);

  Promise.all([loadEstrategia(), calcularPlan(progress, tit, Date.now(), { guardar: false })]).then(([datos, { banco, st }]) => {
    const ficha = banco.eje;
    citadas = new Map();
    const c = cifrasExamen(T, ficha);
    const tx = textosEstrategia(datos, { tit, eje: ficha.id, calculadora: c.calculadora.permitida });
    const pres = presupuestoTiempo(T, tx.tiempo);
    const tu = tuEstrategia({ estructura: T.estructura, tests: st.datos.tests, listo: st.listo });
    const disp = tiempoDisponible(T, tx.tiempo);
    const filasVel = velocidadPorTipo({ tests: st.datos.tests, practica: tiemposAlumno().lista(), disponibleCartaS: disp.cartaS, disponibleTeoriaS: disp.teoriaS });
    const consejoVel = consejoVelocidad(filasVel, { disponibleCartaS: disp.cartaS });
    const ce = cuentaEnsayos(st.datos.tests);
    const abiertos = bloquesAbiertos({ diasAlExamen: st.diasAlExamen, orientativa: st.orientativa });
    eti.replaceChildren(icono('diana', 'ico-t'), `Estrategia · ${T.sigla} · ${ficha.nombre}`);
    impresion.children[1].textContent = `Estrategia de examen · ${ficha.nombre}`;
    intro.textContent = TX.entrada(T.sigla, ficha.nombre);

    // A la vista: tus cifras, «Tu estrategia» y el botón. Todo lo demás, en bloques plegables.
    const cifras = seccion('cifras', 'examen', 'Tu examen en cifras',
      h('ul.lc-datos.est-datos',
        h('li', h('span.lc-cifra', String(c.preguntas)), h('span.lc-dato-txt', 'preguntas')),
        h('li', h('span.lc-cifra', String(c.duracionMin)), h('span.lc-dato-txt', 'minutos')),
        h('li', h('span.lc-cifra', num(c.minPorPregunta)), h('span.lc-dato-txt', 'minutos por pregunta')),
        h('li', h('span.lc-cifra', String(c.minAciertos)), h('span.lc-dato-txt', 'aciertos para aprobar')),
        h('li', h('span.lc-cifra', String(c.colchon)), h('span.lc-dato-txt', 'fallos como máximo'))));
    const tuyaEl = h('div.est-tuya', tuya(T, c, tu));
    const boton = h('p.no-imprimir.est-accion', h('a.btn.grande', { href: tlink(T.id, ['test', 'simulacro'], { s: randomSeed() }) }, conIcono('reloj', TX.boton)));

    // Los bloques se construyen en el orden en que salen: así las fuentes quedan numeradas [1], [2]… de arriba abajo.
    const limites = plegable({ id: 'est-b-limites', titulo: TX.limites, resumen: TX.resumenLimites(c), abierto: abiertos.includes('limites') },
      lista([
        { tipo: 'norma', texto: `${cuenta(c.preguntas, 'pregunta')} tipo test de cuatro opciones en ${cuenta(c.duracionMin, 'minuto')}; apto con al menos ${cuenta(c.minAciertos, 'acierto')}.`, fuente: { id: 'rd875', ...datos.fuentes.rd875 } },
        { tipo: 'norma', texto: c.calculadora.permitida ? 'Calculadora científica: permitida.' : 'Calculadora: no permitida.', fuente: c.calculadora.fuente },
        c.reglasTribunal.map((r) => ({ tipo: 'norma', texto: r, fuente: { id: 'ficha', ...datos.fuentes.ficha, titulo: datos.fuentes.ficha.titulo.replace('<eje>', ficha.id) } })),
      ]),
      h('p', `Aunque llegues a ${cuenta(c.minAciertos, 'acierto')}, suspendes si pasas el máximo de fallos de uno de estos temas:`),
      h('table.est-tabla.est-limites',
        h('caption', 'Temas con límite de fallos'),
        h('thead', h('tr', h('th', { scope: 'col' }, 'Tema'), h('th', { scope: 'col' }, h('abbr', { title: 'Preguntas' }, 'Preg.')), h('th', { scope: 'col' }, 'Fallos máx.'), h('th', { scope: 'col' }, 'Bien mín.'))),
        h('tbody', c.limites.map((l) => h('tr', h('th', { scope: 'row' }, conIcono(l.ico, l.corto)), h('td', String(l.n)), h('td', String(l.maxErrores)), h('td', String(l.minBien)))))),
      h('p.est-colchon', h('strong', `Colchón: ${cuenta(c.colchon, 'fallo')} en total.`), ` Si gastas los ${c.enLimites} que permiten los temas con límite, te quedan ${c.colchonLibre} para todo lo demás (${c.sinLimite.join(', ')}).`),
      lista([tx.correccion.verificado ? [...tx.correccion.normas, tx.correccion.base] : null,
        tx.correccion.app ? { tipo: 'norma', texto: tx.correccion.app, fuente: { id: 'app', ...datos.fuentes.app } } : null]),
      !tx.correccion.verificado && tx.correccion.pendiente ? h('p.est-pendiente', icono('aviso', 'ico-t'), tx.correccion.pendiente) : null);

    const tiempo = plegable({ id: 'est-b-tiempo', titulo: TX.tiempo, resumen: TX.resumenTiempo(c, disp.cartaS), abierto: abiertos.includes('tiempo') },
      h('p', `De media tienes ${cuenta(Math.round(c.minPorPregunta * 10) / 10, 'minuto')} por pregunta, pero no todas cuestan igual: las de carta llevan dibujo y cuenta. Un reparto razonable:`),
      pres.map((t) => h('div.est-tramo', tablaTiempo(t, pres.length > 1), hitos(t, pres.length > 1))),
      lista([{ tipo: 'consejo', texto: tx.tiempo.nota }, tx.py ? { tipo: 'consejo', texto: tx.py.reloj.texto } : null,
        tx.py?.reloj.comprobado ? { tipo: 'norma', texto: tx.py.reloj.dato, fuente: tx.py.reloj.fuente } : null]),
      velocidad(T, disp, filasVel, consejoVel));

    const contestar = plegable({ id: 'est-b-contestar', titulo: TX.contestar, resumen: TX.resumenContestar, abierto: abiertos.includes('contestar') },
      sub('orden', 'lista', 'Orden para contestar', lista(tx.orden)),
      sub('leer', 'lupa', 'Leer el enunciado y descartar', lista(tx.leer)),
      sub('nosabes', 'pregunta', 'Si no la sabes', lista(tx.noSabes)),
      sub('repaso', 'repaso', 'Repaso final y hoja de respuestas', lista(tx.repaso)));

    const modulos = tx.py ? plegable({ id: 'est-b-modulos', titulo: TX.modulos(T.sigla), resumen: TX.resumenModulos(c), abierto: abiertos.includes('modulos') },
      lista(tx.py.modulos), lista(tx.py.consejos),
      h('p.no-imprimir', h('a', { href: tlink(tit, ['examenes']) }, 'Simulacro de un solo módulo, en Examen →'))) : null;

    const dia = plegable({ id: 'est-b-dia', titulo: TX.dia, resumen: TX.resumenDia, abierto: abiertos.includes('dia') },
      sub('antes', 'luna', 'El día antes', lista(tx.diaAntes),
        h('p.no-imprimir.est-enlace-lista', h('a.btn.secondary', { href: tlink(tit, ['vispera']) }, conIcono('luna', 'Repaso exprés de la víspera (15 min)')))),
      sub('dia', 'calendario', 'El día del examen',
        lista(tx.tribunal.dia), lista([tx.calculadora ? { tipo: 'consejo', texto: tx.calculadora } : null, tx.diaExamen]),
        h('p.no-imprimir.est-enlace-lista', h('a.btn.secondary', { href: tlink(tit, ['dia-examen']) }, conIcono('lista', 'Mi lista del día del examen, con casillas'))),
        !c.calculadora.permitida ? h('p.no-imprimir', h('a', { href: tlink(tit, ['cuentas']) }, 'Las cuentas del patrón →')) : null,
        tx.tribunal.nota ? h('p.est-nota', tx.tribunal.nota) : null),
      ensayos(T, ce));

    const pend = [...tx.pendientes, ...(!tx.correccion.verificado && tx.correccion.pendiente ? [tx.correccion.pendiente] : [])];
    const fuentes = plegable({ id: 'est-b-fuentes', titulo: TX.fuentes, resumen: TX.resumenFuentes, abierto: abiertos.includes('fuentes'), clase: 'est-fuentes' },
      h('ol.est-lista-fuentes', [...citadas.values()].map(({ n, f }) => h('li', { value: String(n) },
        f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.titulo) : f.titulo, f.ref ? `, ${f.ref}` : '', '.'))),
      pend.length ? sub('pendiente', 'aviso', 'Pendiente de verificar', h('p.est-sub', 'Esto no está comprobado para tu tribunal y por eso no se afirma arriba. Míralo en su convocatoria.'), h('ul', pend.map((p) => h('li', p)))) : null,
      h('p.est-sub.no-imprimir', 'Reglas del examen y exámenes de convocatorias anteriores, en ', h('a', { href: tlink(tit, ['examenes']) }, 'Examen'), '. Trucos para recordar, en ', h('a', { href: link(['reglas']) }, 'Reglas para recordar'), '.'));

    setChildren(cuerpo, cifras, boton, tuyaEl, limites, tiempo, contestar, modulos, dia, fuentes);
    summaryText = `VISTA estrategia de examen ${T.sigla} · ${ficha.nombre}\n${resumenEstrategia(c, pres, tu)}\n${resumenVelocidad(filasVel, consejoVel)}\nENSAYOS EN PAPEL: ${ce.hechos} de ${ce.recomendados} → #/${tit}/ensayo\nRUTAS: #/${tit}/test/simulacro?s=<semilla> · #/${tit}/examenes\nBLOQUES PLEGADOS: ${[limites, tiempo, contestar, modulos, dia, fuentes].filter(Boolean).map((b) => `${b.querySelector('.plegable-tit').textContent}${b.open ? ' (abierto)' : ''}`).join(' · ')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la estrategia: ${e.message}`)));
  return { el, summary: () => summaryText };
}
