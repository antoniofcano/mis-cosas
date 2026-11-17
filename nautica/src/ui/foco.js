// «¿De qué te examinas?» en Hoy (titulaciones con módulos: el PY). La lógica, en src/course/foco.js; el motor recorta
// con ella la ruta, el plan, lo de hoy y «¿Estás listo?». Sin elegir, se pregunta; elegido (o deducido de un examen con un
// módulo aprobado), una línea con lo que preparas y «Cambiar».

import { h } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { claveFoco, opcionesFoco, focoDecidido, focoModulo, AMBOS } from '../course/foco.js';
import { moduloPendiente, lineaModuloPendiente } from '../course/tras-examen.js';
import { leerAjuste, claveSemana, descartarModulo, apuntarResultado } from '../course/semana.js';
import { randomSeed } from '../math/rng.js';

const repintar = () => dispatchEvent(new HashChangeEvent('hashchange'));
const min = (t) => t.replace(/^Módulo/, 'módulo');

/** Guarda la elección. Elegir los dos con un módulo aprobado apuntado deja de centrarse en el que queda (como antes). */
function elegir(progress, tit, id, alTerminar = repintar) {
  const E = TITULACIONES[tit].estructura;
  progress.setSetting(claveFoco(tit), id);
  if (id === AMBOS) {
    const a = leerAjuste(progress.settings()[claveSemana(tit)]);
    const p = moduloPendiente(a, E);
    if (p) progress.setSetting(claveSemana(tit), descartarModulo(a, p.desde));
  } else {
    // Volver a centrarse en el módulo que queda tras haberlo descartado: se reactiva.
    const a = leerAjuste(progress.settings()[claveSemana(tit)]);
    if (a.moduloFuera && a.resultados[a.moduloFuera]) progress.setSetting(claveSemana(tit), apuntarResultado(a, a.moduloFuera, a.resultados[a.moduloFuera]));
  }
  alTerminar();
}

const botones = (progress, tit, actual) => h('div.foco-opciones', opcionesFoco(TITULACIONES[tit].estructura).map((o) =>
  h('button', { type: 'button', class: o.id === actual ? '' : 'secondary', 'aria-pressed': String(o.id === actual), onclick: () => elegir(progress, tit, o.id) }, o.titulo)));

/** La tarjeta de Hoy. null si la titulación no tiene módulos. */
export function tarjetaFoco(progress, tit, st) {
  const T = TITULACIONES[tit];
  if (!opcionesFoco(T.estructura).length) return null;
  const s = progress.settings();
  if (!focoDecidido(s, tit, T.estructura)) {
    return h('section.foco.foco-pregunta', { 'aria-labelledby': `foco-${tit}` },
      h('h2', { id: `foco-${tit}` }, '¿De qué te examinas?'),
      h('p', `Patrón ajusta tu ruta, lo de cada día, tu plan y los simulacros a lo que te vas a examinar. Si ya aprobaste un módulo del ${T.sigla}, prepara solo el otro.`),
      botones(progress, tit, null),
      h('p.muted.small', 'Puedes cambiarlo cuando quieras. Lo que estudies del otro módulo no se pierde.'));
  }
  const f = st.foco;
  const actual = f?.id ?? AMBOS;
  const p = st.moduloPendiente;
  return h('section.foco', { 'aria-labelledby': `foco-${tit}` },
    h('p', h('strong', { id: `foco-${tit}` }, 'Te preparas: '), f ? min(f.titulo) : 'los dos módulos'),
    f && p && p.id === f.id ? h('p.small', lineaModuloPendiente(p, T.sigla)) : null,
    f ? h('p.small', h('a', { href: tlink(tit, ['test', 'simulacro'], { s: randomSeed(), m: f.id }) }, `Simulacro del ${min(f.titulo)}`)) : null,
    h('details.foco-cambiar', h('summary', 'Cambiar'), botones(progress, tit, actual)));
}

/**
 * Los botones de «¿De qué te examinas?» sueltos (bienvenida, Ajustes y Temario; H-74): el módulo actual marcado (sin elegir,
 * «Los dos módulos») y, al elegir, se guarda y se repinta el propio selector. null si la titulación no tiene módulos.
 * @param {(id: string) => void} [alElegir]
 */
export function selectorFoco(progress, tit, alElegir = () => {}) {
  const T = TITULACIONES[tit];
  if (!opcionesFoco(T.estructura).length) return null;
  const caja = h('div.foco-selector');
  const pinta = () => {
    const f = focoModulo(progress.settings(), tit, T.estructura);
    const actual = f?.id ?? AMBOS;
    caja.replaceChildren(h('div.foco-opciones', { role: 'group', 'aria-label': '¿De qué te examinas?' }, opcionesFoco(T.estructura).map((o) =>
      h('button', { type: 'button', class: o.id === actual ? '' : 'secondary', 'aria-pressed': String(o.id === actual),
        onclick: () => { elegir(progress, tit, o.id, () => {}); pinta(); alElegir(o.id); } }, o.id === actual ? `✓ ${o.titulo}` : o.titulo))));
  };
  pinta();
  return caja;
}
