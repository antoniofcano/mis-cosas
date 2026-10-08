// Ejecutor de la sesión de estudio en la interfaz. La sesión (src/course/sesion.js) se guarda en el progreso
// (ajuste sesion_<tit>) y cada paso abre la vista de siempre (clase, repaso de fallos, mezclado, simulacro):
//   - #/<tit>/sesion reenvía al paso por el que vas (o enseña el resumen si ya no queda ninguno);
//   - mientras la dirección es la del paso actual, app.js pone encima la barra de la sesión (tramos, Parar, Saltar);
//   - el cierre de la vista (cierre() en src/ui/cierre.js, el resultado del examen) marca el paso hecho y ofrece
//     «Siguiente», que vuelve a #/<tit>/sesion.
// Recargar en cualquier punto deja al alumno donde estaba: la dirección del paso y la sesión están guardadas.

import { h } from './dom.js';
import { tlink } from './titulacion.js';
import { avisoBreve } from './actividad.js';
import { cuenta } from '../texto.js';
import {
  sesionDeHoy, indiceActual, arrancar, marcarHecho, saltar, pausar, cerrar, terminada, pasoEnRuta,
} from '../course/sesion.js';

const clave = (tit) => `sesion_${tit}`;
export const EVENTO = 'nautica-sesion';

/** La sesión de hoy de una titulación (null si no hay o es de otro día). */
export const leerSesion = (progress, tit, ahora = Date.now()) => sesionDeHoy(progress.settings()[clave(tit)] ?? null, ahora);

export function guardarSesion(progress, tit, s) {
  progress.setSetting(clave(tit), s);
  if (typeof dispatchEvent === 'function') dispatchEvent(new CustomEvent(EVENTO, { detail: { tit } }));
}

/**
 * Dirección de un paso: la que se fijó al empezar (con su semilla) o la de su ruta. Un examen ya empezado en este paso
 * se retoma con su semilla (el simulacro la pone al empezar; sin ella, la vista ofrecería empezar otro).
 */
export function hrefPaso(tit, p, tc = null) {
  if (p.ruta[0] === 'test' && tc && (tc.tit ?? 'per') === tit && tc.tipo === p.ruta[1]) {
    if (tc.tipo === 'simulacro' && tc.seed != null) return tlink(tit, ['test', 'simulacro'], { s: String(tc.seed) });
    if (tc.tipo === 'real' && String(tc.conv) === String(p.ruta[2])) return tlink(tit, ['test', 'real', String(tc.conv)]);
  }
  return p.href ?? tlink(tit, p.ruta, p.query);
}

/**
 * #/<tit>/sesion: adónde ir. La dirección del paso actual (y la sesión queda en curso), la de Hoy si no hay sesión,
 * o null si ya no quedan pasos (entonces se enseña el resumen).
 */
export function destinoSesion(progress, tit) {
  const s = leerSesion(progress, tit);
  if (!s) return tlink(tit);
  if (terminada(s)) { if (s.estado !== 'hecha') guardarSesion(progress, tit, cerrar(s)); return null; }
  const r = arrancar(s);
  guardarSesion(progress, tit, r);
  return hrefPaso(tit, r.pasos[indiceActual(r)], progress.testEnCurso());
}

// --- el paso en pantalla ------------------------------------------------------------------------------------------

let enPantalla = null; // { progress, tit, i }
let pintadas = 0; // pantallas pintadas: un cierre que llega tarde (asíncrono) de otra pantalla no toca la sesión

/** Número de la pantalla actual (cambia con cada dirección que pinta app.js). */
export const pantallaActual = () => pintadas;

/**
 * Lo fija app.js al pintar cada dirección: el paso de la sesión en curso que corresponde a esta dirección, o nada.
 * Solo cuenta el paso actual (los ya hechos o saltados no vuelven a mostrar la barra).
 */
export function pasoEnPantalla(progress, tit, parts) {
  const s = leerSesion(progress, tit);
  const i = s && s.estado === 'en-curso' ? pasoEnRuta(s, parts) : -1;
  pintadas += 1;
  enPantalla = i >= 0 && i === indiceActual(s) ? { progress, tit, i } : null;
  return enPantalla;
}

/** Parar: se guarda por dónde vas y se vuelve a Hoy (con la salida de la propia vista, que guarda lo suyo). */
function parar(progress, tit) {
  const s = leerSesion(progress, tit);
  const i = indiceActual(s);
  if (s) guardarSesion(progress, tit, pausar(s));
  // La salida de la vista (la X) guarda su estado (un examen a medias, la tarjeta de la clase) y lleva a Hoy.
  const salir = document.querySelector('main .barra-actividad .ba-salir');
  if (salir && salir.isConnected) salir.click();
  else location.hash = tlink(tit);
  for (const a of document.querySelectorAll('.aviso-breve')) a.remove(); // un solo aviso: el de la sesión
  avisoBreve(i >= 0 && s ? `Sesión parada. Cuando vuelvas, sigues por «${s.pasos[i].titulo}».` : 'Sesión parada.');
}

/**
 * Botones de «sigue la sesión» para un cierre. Marca hecho el paso en pantalla (una vez) y devuelve el botón de seguir
 * y el de parar; null si la pantalla no es de una sesión.
 */
export function botonesSesion() {
  if (!enPantalla) return null;
  const { progress, tit, i } = enPantalla;
  let s = leerSesion(progress, tit);
  if (!s) return null;
  if (s.pasos[i]?.estado === 'pendiente') { s = marcarHecho(s, i); guardarSesion(progress, tit, s); }
  const j = indiceActual(s);
  const sig = j >= 0 ? s.pasos[j] : null;
  return [
    h('a.btn.grande.seguir-sesion', { href: tlink(tit, ['sesion']) }, sig ? `Siguiente: ${sig.titulo} (${sig.minutos} min)` : 'Terminar la sesión'),
    sig ? h('button.secondary.grande', { type: 'button', onclick: () => parar(progress, tit) }, 'Parar aquí') : null,
  ].filter(Boolean);
}

/**
 * Barra de la sesión, encima de la vista del paso: Parar, el paso y su número, Saltar y la barra por tramos (el tramo
 * actual se llena con el avance de la propia vista, que lo cuenta su barra de actividad).
 */
export function barraSesion(progress, tit, i) {
  const fila = h('div.sb-fila');
  const tramos = h('div.sb-tramos', { role: 'progressbar', 'aria-label': 'Avance de la sesión', 'aria-valuemin': '0' });
  const el = h('nav.sesion-barra', { 'aria-label': 'Sesión de hoy' }, fila, tramos);
  let fraccion = 0;
  const pinta = () => {
    const s = leerSesion(progress, tit);
    if (!s) return;
    const p = s.pasos[i];
    const hecho = p.estado !== 'pendiente';
    fila.replaceChildren(
      h('button.sb-boton.sb-parar', { type: 'button', onclick: () => parar(progress, tit) }, 'Parar'),
      h('div.sb-centro', h('strong.sb-titulo', p.titulo), h('span.sb-contador', `Paso ${i + 1} de ${s.pasos.length}`)),
      hecho ? h('span.sb-hueco') : h('button.sb-boton.sb-saltar', { type: 'button', title: 'Saltar este paso', onclick: () => {
        guardarSesion(progress, tit, saltar(leerSesion(progress, tit), i));
        location.hash = tlink(tit, ['sesion']);
      } }, 'Saltar'));
    const n = s.pasos.length;
    const hechos = s.pasos.filter((x) => x.estado !== 'pendiente').length;
    tramos.setAttribute('aria-valuemax', String(n));
    tramos.setAttribute('aria-valuenow', String(hechos));
    tramos.setAttribute('aria-valuetext', `${hechos} de ${cuenta(n, 'paso')} hechos`);
    tramos.replaceChildren(...s.pasos.map((x, j) => {
      const f = x.estado !== 'pendiente' ? 1 : j === i ? fraccion : 0;
      return h('span.sb-tramo', { class: x.estado === 'saltado' ? 'saltado' : j === i ? 'actual' : '' }, h('span', { style: `width:${Math.round(f * 100)}%` }));
    }));
  };
  const alCambiar = () => { if (!el.isConnected && el.dataset.puesta) { quitar(); return; } pinta(); };
  const alAvanzar = (ev) => {
    if (!el.isConnected) return;
    fraccion = Math.max(0, Math.min(1, ev.detail?.fraccion ?? 0));
    const actual = tramos.children[i]?.firstChild;
    if (actual && leerSesion(progress, tit)?.pasos[i]?.estado === 'pendiente') actual.style.width = `${Math.round(fraccion * 100)}%`;
  };
  function quitar() { removeEventListener(EVENTO, alCambiar); removeEventListener('nautica-avance', alAvanzar); removeEventListener('hashchange', alSalir); }
  const alSalir = () => setTimeout(() => { if (!el.isConnected) quitar(); }, 0);
  addEventListener(EVENTO, alCambiar);
  addEventListener('nautica-avance', alAvanzar);
  addEventListener('hashchange', alSalir);
  requestAnimationFrame?.(() => { el.dataset.puesta = '1'; });
  pinta();
  return el;
}
