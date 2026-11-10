// Tu convocatoria en la interfaz (R-44, src/course/convocatoria.js tiene la lógica): hora, sede y enlace de la página de
// tu tribunal, que se editan y se borran en Ajustes (una sola sección), y lo que Hoy enseña con ellas: la tarjeta de «tu
// examen» la semana del examen (con el acceso a la lista del día del examen y al repaso exprés) y el recordatorio de
// comprobar la lista de admitidos. Se guarda en los ajustes compartidos `convocatoria_<tit>` y `listadia_<tit>`
// (docs/SYNC.md). Nada de esto se enseña con un examen en marcha (Hoy y Ajustes no son pantallas de examen).

import { h, setChildren } from './dom.js';
import { TITULACIONES, tlink, currentEje } from './titulacion.js';
import { conIcono, icono } from './iconos.js';
import { cargarBanco } from '../bancos/index.js';
import {
  claveConvocatoria, convocatoriaVigente, cambiarConvocatoria, hayDatos, enlaceConvocatoria, enlaceValido, horaTexto, MAX_SEDE,
} from '../course/convocatoria.js';
import { claveLista, marcadasVigentes, vaciarLista } from '../course/dia-examen.js';
import { cuenta, diaISO, fechaLarga } from '../texto.js';

export const fechaExamenDe = (progress, tit) => progress.settings()[`examen_${tit}`] || null;

/** La convocatoria que cuenta hoy (hora, sede, enlace propio y «admitidos»), reiniciada si es de una convocatoria pasada. */
export const convocatoriaDe = (progress, tit, ahora = Date.now()) =>
  convocatoriaVigente(progress.settings()[claveConvocatoria(tit)], { fechaExamen: fechaExamenDe(progress, tit), hoy: diaISO(ahora) });

/** Guarda cambios de la convocatoria (hora, sede, enlace, admitidos); lo no nombrado se conserva. */
export function guardarConvocatoria(progress, tit, cambios, ahora = Date.now()) {
  const nuevo = cambiarConvocatoria(progress.settings()[claveConvocatoria(tit)], cambios, { fechaExamen: fechaExamenDe(progress, tit), hoy: diaISO(ahora) });
  progress.setSetting(claveConvocatoria(tit), nuevo);
  return nuevo;
}

/** Las casillas marcadas de la lista del día del examen que cuentan hoy. */
export const marcadasDe = (progress, tit, ahora = Date.now()) =>
  marcadasVigentes(progress.settings()[claveLista(tit)], { fechaExamen: fechaExamenDe(progress, tit), hoy: diaISO(ahora) });

/** La ficha del eje del alumno (para su página oficial), o null si no se puede cargar. */
export const fichaDelEje = (progress, tit) => cargarBanco(currentEje(progress), tit).then((b) => b.eje).catch(() => null);

/** «Sábado 21 de noviembre · 10:00 h · Aula 3» (lo que haya). */
export function lineaConvocatoria({ fecha, conv, ahora = Date.now() }) {
  return [fecha ? fechaLarga(fecha, { ahora }) : null, horaTexto(conv), conv?.sede].filter(Boolean).join(' · ');
}

/** El enlace a la página de la convocatoria, listo para pintar (se abre en otra pestaña), o null si no hay ninguno. */
export function enlaceAConvocatoria(conv, ficha, texto = 'Página de tu convocatoria') {
  const e = enlaceConvocatoria(conv, ficha);
  return e ? h('a.convocatoria-enlace', { href: e.url, target: '_blank', rel: 'noopener noreferrer' }, texto, h('span.visualmente-oculto', ' (se abre en otra pestaña)')) : null;
}

// --- Ajustes: una sección clara para editar y borrar todo ---------------------------------------------------------

/**
 * «Tu convocatoria»: hora, sede y enlace (todo opcional), el estado de «lista de admitidos» y de la lista del día del
 * examen, y cómo borrarlo todo. `ficha`: promesa con la ficha del eje (su página oficial prerrellena el enlace).
 */
export function seccionConvocatoria(progress, tit, { ficha = Promise.resolve(null), alCambiar = () => {} } = {}) {
  const T = TITULACIONES[tit];
  let oficial = null; // el enlace de la ficha del eje
  const estado = h('p.muted.small.convocatoria-estado', { role: 'status', 'aria-live': 'polite' });
  const error = h('p.convocatoria-error', { role: 'alert', hidden: true });
  const filaAdmitidos = h('div.convocatoria-fila');
  const filaLista = h('div.convocatoria-fila');
  const aviso = (t) => { estado.textContent = t; setTimeout(() => { if (estado.textContent === t) estado.textContent = ''; }, 4000); };

  const hora = h('input#conv-hora', { type: 'time', value: convocatoriaDe(progress, tit).hora ?? '', onchange: () => { guardarConvocatoria(progress, tit, { hora: hora.value }); pinta(); aviso(hora.value ? 'Hora guardada.' : 'Hora borrada.'); } });
  const sede = h('input#conv-sede', { type: 'text', maxlength: String(MAX_SEDE), autocomplete: 'off', placeholder: 'Por ejemplo, el aula o el centro', value: convocatoriaDe(progress, tit).sede ?? '',
    onchange: () => { guardarConvocatoria(progress, tit, { sede: sede.value }); sede.value = convocatoriaDe(progress, tit).sede ?? ''; pinta(); aviso(sede.value ? 'Sede guardada.' : 'Sede borrada.'); } });
  const enlace = h('input#conv-enlace', { type: 'url', inputmode: 'url', autocomplete: 'off', placeholder: 'https://…', 'aria-describedby': 'conv-enlace-ayuda conv-enlace-error', value: convocatoriaDe(progress, tit).enlace ?? '',
    onchange: () => {
      const v = enlace.value.trim();
      error.hidden = true;
      if (v && !enlaceValido(v)) { error.hidden = false; error.textContent = 'Ese enlace no vale: tiene que empezar por https:// (o http://) y no llevar espacios.'; return; }
      // El enlace de la ficha no se guarda como propio: se sigue enseñando el oficial.
      guardarConvocatoria(progress, tit, { enlace: v && enlaceValido(v) !== oficial ? v : '' });
      pinta();
      aviso(v ? 'Enlace guardado.' : 'Enlace borrado.');
    } });
  error.id = 'conv-enlace-error';
  const ayudaEnlace = h('p.muted.small#conv-enlace-ayuda', 'La página de tu convocatoria, donde se publican las listas de admitidos y el lugar del examen.');

  const borrar = h('button.secondary', { type: 'button', onclick: () => {
    if (!confirm('¿Borrar la hora, la sede y el enlace de tu convocatoria?')) return;
    guardarConvocatoria(progress, tit, { hora: '', sede: '', enlace: '', admitidos: '' });
    pinta(); aviso('Borrado.');
  } }, 'Borrar hora, sede y enlace');

  function pinta() {
    const c = convocatoriaDe(progress, tit);
    hora.value = c.hora ?? '';
    sede.value = c.sede ?? '';
    enlace.value = c.enlace ?? oficial ?? '';
    ayudaEnlace.textContent = c.enlace ? 'La página de tu convocatoria, donde se publican las listas de admitidos y el lugar del examen. Borra el campo para volver a la página oficial de tu tribunal.'
      : oficial ? 'Está la página oficial de tu tribunal (la de la ficha del banco). Cámbiala por la página de tu convocatoria si es otra.' : 'La página de tu convocatoria, donde se publican las listas de admitidos y el lugar del examen.';
    borrar.disabled = !(c.hora || c.sede || c.enlace || c.admitidos);
    setChildren(filaAdmitidos, c.admitidos
      ? [h('p', icono('ok', 'ico-t'), ` Lista de admitidos: marcada como comprobada el ${fechaLarga(c.admitidos)}.`),
        h('button.secondary', { type: 'button', onclick: () => { guardarConvocatoria(progress, tit, { admitidos: '' }); pinta(); alCambiar(); } }, 'Desmarcar')]
      : [h('p.muted', 'Lista de admitidos: aún sin marcar. Hoy te lo recuerda desde unas semanas antes del examen.')]);
    const n = marcadasDe(progress, tit).length;
    setChildren(filaLista,
      h('p', n ? `Lista del día del examen: ${cuenta(n, 'casilla marcada', 'casillas marcadas')}.` : 'Lista del día del examen: ninguna casilla marcada.'),
      h('a.btn.secondary', { href: tlink(tit, ['dia-examen']) }, 'Abrir la lista'),
      n ? h('button.secondary', { type: 'button', onclick: () => { progress.setSetting(claveLista(tit), vaciarLista({ fechaExamen: null })); pinta(); aviso('Casillas desmarcadas.'); } }, 'Desmarcar todas') : null);
    alCambiar();
  }
  ficha.then((f) => { oficial = enlaceConvocatoria({ enlace: null }, f)?.url ?? null; pinta(); }).catch(() => {});
  const el = h('section#convocatoria.ajuste-convocatoria', { 'aria-labelledby': 'convocatoria-tit' },
    h('h2#convocatoria-tit', conIcono('calendario', `Tu convocatoria de ${T.sigla}`)),
    h('p.muted', 'Opcional. Con la fecha de arriba, la hora, la sede y la página de tu tribunal salen en Hoy la semana del examen y en tu lista del día del examen. Se guardan en tus aparatos y se reinician solas cuando pongas la fecha de la convocatoria siguiente.'),
    h('div.convocatoria-campos',
      h('label.field', { for: 'conv-hora' }, h('span.lbl', 'Hora del examen'), hora),
      h('label.field', { for: 'conv-sede' }, h('span.lbl', 'Sede o lugar'), sede),
      h('label.field', { for: 'conv-enlace' }, h('span.lbl', 'Enlace de tu convocatoria'), enlace),
      ayudaEnlace, error),
    h('div.actions', borrar),
    estado, filaAdmitidos, filaLista);
  pinta();
  el.refrescar = pinta;
  return el;
}

// --- Hoy ---------------------------------------------------------------------------------------------------------

const TXT_MOMENTO = { semana: (d) => `Tu examen es en ${cuenta(d, 'día')}`, vispera: () => 'Tu examen es mañana', dia: () => 'Tu examen es hoy' };

/**
 * La tarjeta «Tu examen» de Hoy la semana del examen: fecha, hora y sede, el enlace de la convocatoria y los accesos a la
 * lista del día del examen (siempre) y al repaso exprés (a partir de la víspera). Sin hora ni sede, invita a ponerlas.
 * @param {{ momento: 'semana'|'vispera'|'dia', dias: number, fecha: string, conv: object, ficha: object|null, ahora: number }} o
 */
export function tarjetaExamenCerca(progress, tit, { momento, dias, fecha, conv, ficha, ahora }) {
  const linea = lineaConvocatoria({ fecha, conv, ahora });
  const enlace = enlaceAConvocatoria(conv, ficha);
  const sinDatos = !conv.hora && !conv.sede;
  const principal = momento !== 'semana';
  return h('section.examen-cerca', { 'data-momento': momento, 'aria-labelledby': 'examen-cerca-t' },
    h('p.entrada-cta-eti', 'Tu examen'),
    h('h2#examen-cerca-t', TXT_MOMENTO[momento](dias)),
    h('p.examen-cerca-linea', linea),
    sinDatos ? h('p.muted.small', 'Añade la hora y la sede para tenerlas aquí. ', h('a', { href: '#/ajustes?campo=convocatoria' }, 'Poner hora y sede')) : h('p.muted.small', h('a', { href: '#/ajustes?campo=convocatoria' }, 'Editar hora, sede y enlace')),
    enlace ? h('p.examen-cerca-enlace', enlace) : null,
    h('div.examen-cerca-botones',
      h('a.btn', { class: principal ? '' : 'secondary', href: tlink(tit, ['dia-examen']) }, conIcono('lista', 'Mi lista del día del examen')),
      momento === 'vispera' ? h('a.btn.secondary', { href: tlink(tit, ['vispera']) }, conIcono('luna', 'Repaso exprés de 15 minutos')) : null));
}

/**
 * El recordatorio de la lista de admitidos de Hoy: «¿Ya has comprobado…?», con el enlace guardado y la opción de marcarlo
 * como hecho. La app no puede mirar el boletín por su cuenta: solo lo recuerda. `alCambiar`: se llama al marcarlo.
 */
export function tarjetaAdmitidos(progress, tit, { dias, conv, ficha, ahora = Date.now(), alCambiar = () => {} }) {
  const caja = h('section.admitidos-aviso', { 'aria-labelledby': 'admitidos-t' });
  const enlace = enlaceAConvocatoria(conv, ficha, enlaceConvocatoria(conv, ficha)?.propio ? 'Abrir la página de tu convocatoria' : 'Abrir la página oficial de tu tribunal');
  setChildren(caja,
    h('p.entrada-cta-eti', `Faltan ${cuenta(dias, 'día')} para el examen`),
    h('h2#admitidos-t', '¿Ya has comprobado que estás en la lista de admitidos y el lugar del examen?'),
    h('p.muted.small', 'La app no puede mirar el boletín por ti: míralo tú en la página de tu convocatoria y, cuando lo tengas claro, márcalo.'),
    h('div.examen-cerca-botones',
      enlace,
      h('button', { type: 'button', onclick: () => {
        guardarConvocatoria(progress, tit, { admitidos: diaISO(ahora) }, ahora);
        setChildren(caja, h('p.muted', { role: 'status' }, 'Anotado. Puedes cambiarlo en Ajustes, en «Tu convocatoria».'));
        alCambiar();
      } }, conIcono('ok', 'Sí, ya lo he comprobado'))),
    !conv.enlace ? h('p.muted.small', h('a', { href: '#/ajustes?campo=convocatoria' }, 'Guardar el enlace de mi convocatoria')) : null);
  return caja;
}
