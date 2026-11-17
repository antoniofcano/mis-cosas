// «¿Estás listo?» con tu cuaderno de fallos y tu tiempo (H-70): la lista de motivos, cada uno con su frase y su acción.
// No calcula nada: pinta lo que trae `st.listo.motivos` (el motor, src/course/motor.js, con src/course/listo-motivos.js).
// Va bajo «¿Estás listo?» en Hoy, la Travesía y la semana del examen, y en la tarjeta del examen final cuando un riesgo
// la tiene cerrada.

import { h } from './dom.js';
import { icono } from './iconos.js';
import { tlink } from './titulacion.js';
import { link } from './router.js';
import { NIVELES, MIN_MUESTRAS_TIEMPO } from '../course/listo-motivos.js';

const ICONO_NIVEL = { riesgo: 'aviso', aviso: 'reloj', 'sin-datos': 'pregunta', bien: 'ok' };
const ICONO_CLASE = { cuaderno: 'diana', tiempo: 'reloj' };

/** Enlace de la acción de un motivo (dentro de la titulación, o una pregunta o ejercicio: `#/q/<id>`, `#/ej/<tipo>`). */
export const hrefAccion = (tit, a) => (a.fuera ? link(a.ruta, a.query) : tlink(tit, a.ruta, a.query));

/**
 * Los motivos de «¿Estás listo?». null si no hay ninguno.
 * @param {string} tit
 * @param {object[]} motivos  st.listo.motivos (o solo los riesgos)
 * @param {{ titulo?: string|null, nota?: boolean }} o  titulo: el encabezado (null, sin él); nota: la de los umbrales
 */
export function motivosListoEl(tit, motivos, { titulo = 'Lo que la probabilidad no ve', nota = true } = {}) {
  if (!motivos?.length) return null;
  return h('section.listo-motivos', titulo ? { 'aria-label': titulo } : {},
    titulo ? h('h3.lm-titulo', titulo) : null,
    h('ul.lm-lista', motivos.map((m) => h('li.lm-motivo', { 'data-nivel': m.nivel },
      h('span.lm-cab', icono(ICONO_NIVEL[m.nivel] ?? ICONO_CLASE[m.clase], 'ico-t'),
        h('span.lm-nivel', NIVELES[m.nivel]), h('span.lm-clase', m.clase === 'cuaderno' ? 'Cuaderno de fallos' : 'Tiempo')),
      h('p.lm-frase', m.frase),
      m.accion ? h('a.btn.secondary.small.lm-accion', { href: hrefAccion(tit, m.accion) }, m.accion.texto) : null))),
    nota ? h('p.muted.small.lm-nota', `Umbrales orientativos, aún sin calibrar con resultados reales: un fallo abierto en un tema con límite es un riesgo (en vigilancia cuenta la mitad; resuelto, nada); en tiempo, tu media en los tipos que más caen frente a lo que da el tribunal por problema, con al menos ${MIN_MUESTRAS_TIEMPO} cronometrados de cada uno. Un riesgo no cambia la probabilidad, pero no te doy por listo hasta resolverlo.`) : null);
}
