// #/<tit>/dia-examen — la lista del día del examen (R-44): lo que llevas y lo que compruebas la víspera, con casillas que se
// marcan y se guardan. Sale de data/comun/dia-examen.json según tu tribunal y tu titulación; cada elemento dice su fuente
// y lo que no está comprobado para tu tribunal sale como «pendiente de verificar» (compruébalo en tu convocatoria), nunca
// como norma. La calculadora solo es una casilla si tu tribunal y tu titulación la permiten. Las casillas se guardan en
// el ajuste compartido `listadia_<tit>` y se reinician con la convocatoria siguiente (src/course/dia-examen.js).
// Imprimible (estilo C, como las chuletas). Nunca se enseña ni se enlaza con un examen en marcha (src/ui/modo-examen.js).

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { calcularPlan } from '../cierre.js';
import { loadEstrategia, loadDiaExamen } from '../../store/datasets.js';
import { cifrasExamen, estrategiaPermitida } from '../../course/estrategia.js';
import { listaDiaExamen, claveLista, alternarMarca, casillasHechas, resumenLista, ID_ADMITIDOS, vaciarLista } from '../../course/dia-examen.js';
import { modoExamen } from '../modo-examen.js';
import { icono, conIcono } from '../iconos.js';
import { cuenta, diaISO } from '../../texto.js';
import { fechaImpresion } from './chuleta.js';
import { convocatoriaDe, guardarConvocatoria, marcadasDe, fechaExamenDe, lineaConvocatoria, enlaceAConvocatoria } from '../convocatoria.js';
import { hayDatos } from '../../course/convocatoria.js';

const ETIQUETA = { norma: 'Norma', consejo: 'Consejo', pendiente: 'Pendiente de verificar' };

/** Cita de una fuente: «Fuente: BOJA 2025, convocatoria, base quinta 5.» con su enlace si lo hay. */
function cita(f) {
  if (!f) return null;
  return h('span.dx-fuente', 'Fuente: ', f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer' }, f.corto ?? f.titulo) : (f.corto ?? f.titulo), f.ref ? `, ${f.ref}` : '', '.');
}

export function diaExamenView({ progress, tit }) {
  const T = TITULACIONES[tit];
  let summaryText = `VISTA lista del día del examen ${T.sigla} (cargando)`;
  if (!estrategiaPermitida({ modo: modoExamen(), hash: typeof location === 'undefined' ? '' : location.hash })) {
    return { el: h('div', h('h1', 'Lista del día del examen'), h('p', 'No está disponible durante un examen.')), summary: () => 'VISTA lista del día del examen: no disponible durante un examen' };
  }
  const ahora = Date.now();
  const cuerpo = h('div.mc-clases.dx-cuerpo', h('p.muted', 'Cargando…'));
  const eti = h('p.lc-eti.mc-eti-pantalla', icono('lista', 'ico-t'), `Día del examen · ${T.sigla}`);
  const impresion = h('p.mc-impresion', h('span', `${T.nombre} (${T.sigla})`), h('span', 'Lista del día del examen'), h('span', fechaImpresion()));
  const el = h('article.mc-hoja.dia-examen',
    h('div.no-imprimir.mc-acciones', volver('Estrategia', tlink(tit, ['estrategia'])),
      h('div.mc-botones', h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab', impresion, eti,
      h('h1.lc-titulo', 'Tu lista del día del examen'),
      h('p.mc-intro', 'Marca lo que ya tienes preparado la víspera. Solo hay lo que consta en una fuente, y cada cosa dice cuál; lo que no está comprobado para tu tribunal va marcado para que lo compruebes en tu convocatoria.')),
    cuerpo);

  Promise.all([loadEstrategia(), loadDiaExamen(), calcularPlan(progress, tit, ahora, { guardar: false })]).then(([estrategia, datos, { banco }]) => {
    const ficha = banco.eje;
    const c = cifrasExamen(T, ficha);
    const lista = listaDiaExamen({ datos, fuentes: estrategia.fuentes, tit, eje: ficha.id, calculadora: c.calculadora });
    eti.replaceChildren(icono('lista', 'ico-t'), `Día del examen · ${T.sigla} · ${ficha.nombre}`);
    impresion.children[1].textContent = `Lista del día del examen · ${ficha.nombre}`;
    const fecha = fechaExamenDe(progress, tit);

    const marcadas = new Set(marcadasDe(progress, tit, ahora));
    const conv = () => convocatoriaDe(progress, tit, ahora);
    if (conv().admitidos) marcadas.add(ID_ADMITIDOS);
    const progresoEl = h('p.dx-avance', { role: 'status', 'aria-live': 'polite' });
    const pintaAvance = () => {
      const a = casillasHechas(lista, [...marcadas].filter((x) => x !== ID_ADMITIDOS), { admitidos: marcadas.has(ID_ADMITIDOS) });
      progresoEl.textContent = a.faltan.length ? `${a.hechas} de ${a.total} marcadas.` : `Todo marcado (${a.total} de ${a.total}). A descansar.`;
      progresoEl.classList.toggle('completa', !a.faltan.length);
      return a;
    };

    const alMarcar = (x, ev) => {
      const si = ev.target.checked;
      if (si) marcadas.add(x.id); else marcadas.delete(x.id);
      if (x.id === ID_ADMITIDOS) guardarConvocatoria(progress, tit, { admitidos: si ? diaISO(ahora) : '' }, ahora);
      else progress.setSetting(claveLista(tit), alternarMarca(progress.settings()[claveLista(tit)], x.id, si, { fechaExamen: fecha, hoy: diaISO(ahora) }));
      pintaAvance();
      ev.target.closest('li.dx-item')?.classList.toggle('marcada', si);
    };

    const item = (x) => {
      const id = `dx-${x.id}`;
      const dato = x.id === 'horalugar' && (conv().hora || conv().sede) ? h('span.dx-tuyo', `Lo que tienes anotado: ${lineaConvocatoria({ fecha: null, conv: conv() })}.`) : null;
      const caja = x.marcable
        ? h('input', { type: 'checkbox', id, checked: marcadas.has(x.id), 'aria-describedby': `${id}-d`, onchange: (ev) => alMarcar(x, ev) })
        : h('span.dx-sin', { 'aria-hidden': 'true' }, '–');
      return h('li.dx-item', { class: `${marcadas.has(x.id) ? 'marcada' : ''} ${x.marcable ? '' : 'sin-casilla'}`, 'data-tipo': x.tipo },
        caja,
        h(x.marcable ? 'label.dx-texto' : 'div.dx-texto', x.marcable ? { for: id } : {}, x.texto),
        h('span.dx-eti', { 'data-tipo': x.tipo }, ETIQUETA[x.tipo] ?? ''),
        h('span.dx-detalle', { id: `${id}-d` },
          x.comprobar ? h('span.dx-comprobar', icono('aviso', 'ico-t'), ` ${x.comprobar}`) : null,
          x.ayuda ? h('span.dx-ayuda', x.ayuda) : null, dato, cita(x.fuente)));
    };

    const grupos = lista.grupos.map((g) => h('section.mc-clase.dx-grupo', { 'aria-labelledby': `dx-g-${g.id}` },
      h('h2.mc-clase-tit', { id: `dx-g-${g.id}` }, icono(g.icono ?? 'lista', 'ico-t'), h('span', g.titulo)),
      h('ul.dx-lista', g.items.map(item))));

    // Tu convocatoria: lo que tienes anotado (se edita en Ajustes).
    const cv = conv();
    const enlace = enlaceAConvocatoria(cv, ficha);
    const tuya = h('section.mc-clase.dx-convocatoria', { 'aria-labelledby': 'dx-conv' },
      h('h2.mc-clase-tit', { id: 'dx-conv' }, icono('calendario', 'ico-t'), h('span', 'Tu convocatoria')),
      fecha ? h('p.dx-linea', lineaConvocatoria({ fecha, conv: cv, ahora })) : h('p.muted', 'Aún no tienes puesta la fecha del examen.'),
      enlace ? h('p.dx-enlace', enlace) : null,
      !fecha || !(cv.hora && cv.sede) ? h('p.no-imprimir.muted.small', hayDatos(cv) ? 'Te falta la ' + (cv.hora ? 'sede' : cv.sede ? 'hora' : 'hora y la sede') + '. ' : 'Pon aquí tu fecha, hora, sede y el enlace de tu convocatoria. ',
        h('a', { href: !fecha ? '#/ajustes?campo=fecha' : '#/ajustes?campo=convocatoria' }, 'Editar en Ajustes')) : h('p.no-imprimir.muted.small', h('a', { href: '#/ajustes?campo=convocatoria' }, 'Editar hora, sede y enlace')));

    const avisos = lista.avisos.length ? h('section.mc-clase.dx-avisos', { 'aria-labelledby': 'dx-avisos' },
      h('h2.mc-clase-tit', { id: 'dx-avisos' }, icono('aviso', 'ico-t'), h('span', 'Lo que te dan y lo que no puedes tener')),
      h('ul.dx-lista.sin-casillas', lista.avisos.map((a) => h('li', a.texto, ' ', cita(a.fuente))))) : null;

    const pendientes = lista.pendientes
      ? h('p.est-pendiente.dx-pendientes', icono('aviso', 'ico-t'), `${cuenta(lista.pendientes, 'cosa está', 'cosas están')} sin comprobar para tu tribunal: compruébalas en tu convocatoria. No se dan por norma.`) : null;

    setChildren(cuerpo, tuya, h('div.dx-progreso', progresoEl), pendientes, grupos, avisos,
      lista.nota ? h('p.est-nota', lista.nota) : null,
      h('p.no-imprimir.dx-pie',
        h('button.secondary.linklike', { type: 'button', onclick: () => {
          if (!confirm('¿Desmarcar todas las casillas?')) return;
          progress.setSetting(claveLista(tit), vaciarLista({ fechaExamen: fecha }));
          guardarConvocatoria(progress, tit, { admitidos: '' }, ahora);
          dispatchEvent(new HashChangeEvent('hashchange'));
        } }, 'Desmarcar todo'),
        ' · ', h('a', { href: tlink(tit, ['estrategia']) }, 'Estrategia de examen'),
        ' · ', h('a', { href: tlink(tit, ['vispera']) }, 'Repaso exprés de la víspera')));
    pintaAvance();
    summaryText = `VISTA lista del día del examen ${T.sigla} · ${ficha.nombre}\n${resumenLista(lista, [...marcadas], { admitidos: marcadas.has(ID_ADMITIDOS) })}\nRUTAS: #/${tit}/estrategia · #/${tit}/vispera · #/ajustes?campo=convocatoria`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la lista: ${e.message}`)));
  return { el, summary: () => summaryText };
}
