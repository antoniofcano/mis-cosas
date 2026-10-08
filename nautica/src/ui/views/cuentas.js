// #/<tit>/cuentas — apéndice «Las cuentas del patrón»: las clases cortas de matemáticas (grados, horas, signos,
// trigonometría y regla de tres) con ejercicios para la calculadora. No es un tema del examen: no está en el temario
// ni cuenta en el plan. Las clases se abren en #/<tit>/cuentas/<id> (la misma vista que las del curso).

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { loadApendice } from '../../store/datasets.js';
import { estadoApendice } from '../../course/apendice.js';
import { cuenta } from '../../texto.js';
import { conIcono } from '../iconos.js';

const MARCA = { nueva: '', empezada: ' · a medias', vista: ' · vista ✓', dominada: ' · vista ✓', repasar: ' · vista ✓' };

export function cuentasView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const lista = h('div.cards', h('p.muted', 'Cargando…'));
  let resumen = 'VISTA cuentas del patrón (cargando)';
  loadApendice().then((ap) => {
    const st = estadoApendice(ap, tit, progress.lecciones()); // del motor del curso
    setChildren(lista, st.lecciones.map(({ l, estado }, i) => h('a.card', { href: tlink(tit, ['cuentas', l.id]) },
      h('h3', `${i + 1}. ${l.titulo}`),
      h('p', l.objetivos?.[0] ?? ''),
      h('p.meta.small', `${cuenta(l.minutos ?? 10, 'minuto')}${MARCA[estado] ?? ''}`))));
    resumen = `VISTA cuentas del patrón ${T.sigla} (${st.vistas}/${cuenta(st.total, 'clase')} vistas; no cuenta en el plan)\n${st.lecciones.map(({ l, estado }) => `${l.id} ${l.titulo} [${estado}] → ${tlink(tit, ['cuentas', l.id])}`).join('\n')}`;
  }).catch((e) => setChildren(lista, h('p.warn', `No se pudo cargar: ${e.message}`)));
  const el = h('div.mas.cuentas',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', conIcono('cuentas', 'Las cuentas del patrón')),
    h('p', `Las cuentas que piden los ejercicios de carta${tit === 'py' ? ', las mareas y la estima analítica' : ''}, paso a paso y practicadas con la calculadora. Cada ejercicio sale con números nuevos.`),
    h('p.muted.small', 'Es un repaso de matemáticas, no un tema del examen: no cuenta en tu plan ni en «¿Estás listo?».'),
    lista,
    h('p', h('a.btn.secondary', { href: link(['calculadora']) }, conIcono('calculadora', 'Abrir la calculadora científica'))),
  );
  return { el, summary: () => resumen };
}
