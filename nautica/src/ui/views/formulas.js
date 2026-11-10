// #/<tit>/formulas[?t=<tema>&q=<texto>] — «Fórmulas y tablas en una hoja»: las del examen por bloques, cada fórmula con
// qué es cada letra y su signo, cuándo se usa, la trampa típica y un ejemplo resuelto con las teclas de la calculadora.
// Los datos están en data/comun/formulas.json y la lógica (selección, búsqueda, cálculo de los ejemplos) en
// src/course/formulas.js; aquí solo se pinta. En estilo C, como la chuleta del tema (src/ui/views/chuleta.js), y con su
// patrón de impresión: A4, blanco y negro, dos columnas (styles/laminas.css, «Fórmulas y tablas en una hoja»).
//
// Nunca en un examen: no se enlaza desde el examen y, si el modo examen está puesto, no se abre.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { navigate } from '../router.js';
import { loadFormulas, loadCourse } from '../../store/datasets.js';
import { bloquesPara, encaja, porTit, teclasParaPintar, formulasPermitidas, resumenFormulas } from '../../course/formulas.js';
import { BEAUFORT, DOUGLAS } from '../../illustrations/meteo.js';
import { modoExamen } from '../modo-examen.js';
import { icono, conIcono } from '../iconos.js';
import { fechaImpresion } from './chuleta.js';

/** Texto con **negrita** → nodos (sin HTML de los datos). */
const negritas = (s) => String(s ?? '').split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) => (/^\*\*.+\*\*$/.test(p) ? h('strong', p.slice(2, -2)) : p));
/** Número con coma decimal, sin ceros de más (hasta 4 decimales). */
const coma = (x) => String(Number(x.toFixed(4))).replace('.', ',').replace('-', '−');
/** Filas de las tablas que ya existen en la app (las mismas de las láminas y las tarjetas). */
const DESDE = {
  beaufort: () => BEAUFORT.map(([n, kn], i) => [String(i), n, kn]),
  douglas: () => DOUGLAS.map(([n, m], i) => [String(i), n, m]),
};
const CLAVE_EJEMPLOS = 'nautica.formulas.sinEjemplos';
const leeSinEjemplos = () => { try { return localStorage.getItem(CLAVE_EJEMPLOS) === '1'; } catch { return false; } };
const guardaSinEjemplos = (v) => { try { localStorage.setItem(CLAVE_EJEMPLOS, v ? '1' : '0'); } catch { /* sin almacenamiento */ } };

export function formulasView({ tit, params: route }) {
  const T = TITULACIONES[tit];
  const q = route.query ?? {};
  const ut = q.t && /^\d+$/.test(q.t) ? Number(q.t) : null;
  if (!formulasPermitidas({ hash: typeof location === 'undefined' ? '' : location.hash, modoExamen: modoExamen() })) {
    return { el: h('div.mas', h('h1', 'Fórmulas y tablas'), h('p', 'Durante un examen no hay fórmulas: como en el examen de verdad.')), summary: () => 'VISTA fórmulas: no disponible en un examen' };
  }

  const cuerpo = h('div.fm-cuerpo', h('p.muted', 'Cargando…'));
  const nada = h('p.fm-nada', { hidden: true, role: 'status' });
  const buscador = h('input.fm-buscar', { type: 'search', id: 'fm-buscar', value: q.q ?? '', placeholder: 'Ct, marea, huso, GM…', autocomplete: 'off', enterkeyhint: 'search' });
  const indice = h('nav.fm-indice', { 'aria-label': 'Bloques de la hoja' });
  let summaryText = `VISTA fórmulas ${T.sigla} (cargando)`;

  const sinEjemplos = leeSinEjemplos();
  const el = h('article.formulas.mc-hoja', { class: sinEjemplos ? 'sin-ejemplos' : '' },
    h('div.no-imprimir.mc-acciones', volver('Biblioteca', tlink(tit, ['biblioteca'])),
      h('div.mc-botones',
        h('label.check', h('input', { type: 'checkbox', checked: !sinEjemplos, onchange: (ev) => { el.classList.toggle('sin-ejemplos', !ev.target.checked); guardaSinEjemplos(!ev.target.checked); } }), 'Con los ejemplos resueltos'),
        h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab',
      h('p.mc-impresion', h('span', `${T.nombre} (${T.sigla})`), h('span', ut ? `Fórmulas y tablas del tema ${ut}` : 'Fórmulas y tablas'), h('span', fechaImpresion())),
      h('p.lc-eti.mc-eti-pantalla', icono('cuentas', 'ico-t'), `Fórmulas · ${T.sigla}${ut ? ` · tema ${ut}` : ''}`),
      h('h1.lc-titulo', 'Fórmulas y tablas'),
      h('p.mc-intro', 'Las del examen en una hoja, cada una con lo que es cada letra, cuándo se usa, su trampa y un ejemplo resuelto. Es para estudiar: en el examen no la tendrás.')),
    h('div.no-imprimir.fm-herramientas',
      ut ? h('p.fm-filtro', `Solo las del tema ${ut}. `, h('a', { href: tlink(tit, ['formulas']) }, 'Ver todas')) : null,
      h('label.fm-buscar-eti', { for: 'fm-buscar' }, conIcono('lupa', 'Buscar')),
      buscador,
      indice),
    nada,
    cuerpo);

  Promise.all([loadFormulas(), loadCourse('per').catch(() => null), loadCourse('py').catch(() => null)]).then(([datos, per, py]) => {
    const titulosClase = new Map([per, py].filter(Boolean).flatMap((c) => c.modulos.flatMap((m) => m.lecciones.map((l) => [l.id, { titulo: l.titulo, tit: l.curso }]))));
    const bloques = bloquesPara(datos, tit, { ut });
    if (!bloques.length) { setChildren(cuerpo, h('p', 'Este tema no tiene fórmulas ni tablas.')); return; }
    const secciones = bloques.map((b) => seccionBloque(b, tit, titulosClase));
    setChildren(cuerpo, secciones.map((s) => s.el));
    setChildren(indice, bloques.map((b) => h('button.fm-ir', { type: 'button', onclick: () => {
      const destino = document.getElementById(`fm-${b.id}`);
      destino?.scrollIntoView({ block: 'start' });
      destino?.querySelector('h2')?.focus({ preventScroll: true });
    } }, conIcono(b.ico, b.corto ?? b.titulo))));

    // Búsqueda: oculta lo que no encaja (también los bloques vacíos); el índice sigue la búsqueda.
    const filtra = () => {
      const texto = buscador.value.trim();
      let visibles = 0;
      secciones.forEach((s, i) => {
        let n = 0;
        for (const { x, nodo } of s.items) { const si = encaja(x, tit, texto); nodo.hidden = !si; if (si) n += 1; }
        s.el.hidden = !n;
        indice.children[i].hidden = !n;
        visibles += n;
      });
      nada.hidden = visibles > 0;
      nada.textContent = visibles ? '' : `Nada con «${texto}». Prueba con otra palabra (Ct, marea, huso, apartamiento…).`;
    };
    buscador.addEventListener('input', filtra);
    buscador.addEventListener('change', () => navigate([tit, 'formulas'], { ...(ut ? { t: String(ut) } : {}), ...(buscador.value.trim() ? { q: buscador.value.trim() } : {}) }, { replace: true }));
    if (buscador.value) filtra();
    summaryText = `VISTA fórmulas y tablas ${T.sigla}${ut ? ` (tema ${ut})` : ''}: ${bloques.reduce((n, b) => n + b.formulas.length, 0)} fórmulas con su ejemplo resuelto y ${bloques.reduce((n, b) => n + b.tablas.length, 0)} tablas (nunca en un examen)\n${resumenFormulas(bloques, tit)}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudieron cargar las fórmulas: ${e.message}`)));

  return { el, summary: () => summaryText };
}

/** Un bloque: su título y sus fórmulas y tablas. Devuelve el nodo y cada elemento con su dato (para buscar). */
function seccionBloque(b, tit, titulosClase) {
  const items = [
    ...b.formulas.map((f) => ({ x: f, nodo: fichaFormula(f, tit, titulosClase) })),
    ...b.tablas.map((t) => ({ x: t, nodo: fichaTabla(t, tit, titulosClase) })),
  ];
  const el = h('section.fm-bloque', { id: `fm-${b.id}`, 'aria-labelledby': `fm-${b.id}-tit` },
    h('h2.fm-bloque-tit', { id: `fm-${b.id}-tit`, tabindex: '-1' }, icono(b.ico, 'ico-t'), h('span', b.titulo)),
    items.map((i) => i.nodo));
  return { el, items };
}

/** Rótulo pequeño en versalitas (Cuándo, Trampa, Ejemplo resuelto…). */
const rotulo = (ico, texto) => h('p.mc-rotulo', conIcono(ico, texto));

function fichaFormula(f, tit, titulosClase) {
  const e = f.ejemplo;
  const signos = porTit(f.signos, tit);
  return h('article.fm-formula', { id: `fm-f-${f.id}`, 'aria-labelledby': `fm-f-${f.id}-tit` },
    h('h3.fm-tit', { id: `fm-f-${f.id}-tit` }, f.titulo),
    h('div.fm-expr', f.expresion.map((x) => h('p.fm-linea', x))),
    h('dl.fm-letras', f.letras.map(([l, d]) => [h('dt', l), h('dd', d)])),
    signos ? h('p.fm-signos', h('span.fm-eti', 'Signos: '), negritas(signos)) : null,
    h('p.fm-cuando', h('span.fm-eti', 'Cuándo: '), negritas(porTit(f.cuando, tit))),
    h('div.mc-trampa.fm-trampa', rotulo('aviso', 'Trampa'), h('p', negritas(porTit(f.trampa, tit)))),
    e ? h('div.fm-ejemplo',
      rotulo('lapiz', 'Ejemplo resuelto'),
      h('p.fm-enunciado', negritas(e.enunciado)),
      h('ol.fm-pasos', e.pasos.map((p) => h('li', negritas(p)))),
      e.calculadora?.length ? h('div.fm-calc', h('p.fm-eti', conIcono('calculadora', 'Con la calculadora')),
        e.calculadora.map((c) => h('p.fm-teclas',
          h('span.fm-kbds', { 'aria-label': `Teclas: ${c.teclas}` }, teclasParaPintar(c.teclas).map(({ t, numero }) => h(numero ? 'span.fm-num' : 'kbd', { 'aria-hidden': 'true' }, t))),
          h('span.fm-da', `→ ${c.pantalla ?? coma(c.da)}`)))) : null,
      h('p.fm-resultado', h('span.fm-eti', 'Resultado: '), h('strong', e.resultado))) : null,
    f.fueraDelCurso ? h('p.fm-fuera', conIcono('bombilla', f.fueraDelCurso)) : null,
    origen(f.origen, tit, titulosClase));
}

function fichaTabla(t, tit, titulosClase) {
  const filas = t.desde ? DESDE[t.desde]() : porTit(t.filas, tit);
  // Con cuatro columnas o más, en el móvil cada fila se pinta como una ficha con el nombre de cada dato (CSS): a 360 px
  // no cabe. Los roles mantienen la tabla para los lectores de pantalla aunque cambie cómo se ve.
  const ancha = t.columnas.length >= 4;
  return h('article.fm-formula.fm-con-tabla', { id: `fm-f-${t.id}` },
    h('h3.fm-tit', t.titulo),
    h('div.fm-tabla-caja', { role: 'region', 'aria-label': t.titulo, tabindex: '0' },
      h('table.fm-tabla', { class: ancha ? 'fm-ancha' : '', role: 'table' },
        h('thead', h('tr', { role: 'row' }, t.columnas.map((c) => h('th', { scope: 'col', role: 'columnheader' }, c)))),
        h('tbody', filas.map((fila) => h('tr', { role: 'row' }, fila.map((c, i) => (i
          ? h('td', { role: 'cell', 'data-col': t.columnas[i] }, c)
          : h('th', { scope: 'row', role: 'rowheader', class: /^\d+$/.test(c) ? 'fm-cifra' : '', 'data-col': t.columnas[0] }, c)))))))),
    t.nota ? h('p.fm-nota', t.nota) : null,
    origen(t.origen, tit, titulosClase));
}

/** «Del curso: …» con enlaces a sus clases (las de la otra titulación, con su sigla). */
function origen(o, tit, titulosClase) {
  const cls = (o?.clases ?? []).filter((id) => titulosClase.has(id));
  const propias = cls.filter((id) => titulosClase.get(id).tit === tit);
  const mostrar = propias.length ? propias : cls;
  if (!mostrar.length) return null;
  return h('p.fm-origen', 'En el curso: ', mostrar.map((id, i) => {
    const c = titulosClase.get(id);
    return [i ? ' · ' : '', h('a', { href: tlink(c.tit, ['curso', id]) }, c.titulo), c.tit !== tit ? ` (${TITULACIONES[c.tit].sigla})` : ''];
  }));
}
