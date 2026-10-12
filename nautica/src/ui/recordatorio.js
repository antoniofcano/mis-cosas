// El recordatorio diario en la interfaz (docs/AVISOS.md): «Avisarme cada día a las…» con cuatro horas fijas, en
// Ajustes (siempre) y en una tarjeta discreta de Hoy (tras unos días de uso y con «Ahora no»). El permiso del navegador
// se pide SOLO al tocar una hora. Donde no hay avisos (iPhone sin instalar, navegadores sin push, servidor sin
// configurar) las mismas horas descargan un evento diario para el calendario. Al abrir la app, una comprobación local.

import { h, setChildren } from './dom.js';
import { conIcono } from './iconos.js';
import { descargar } from './copia.js';
import { motorSync } from './sync.js';
import { urlServidor, clavePublicaAvisos } from '../store/sync/config.js';
import {
  HORAS, HORA_DEFECTO, horaTexto, leerLocal, modoAvisos, permisoAvisos, estadoAvisos, activar, desactivar, comprobarAlAbrir,
  icsDiario, nombreIcs, zonaCliente,
} from '../store/recordatorio.js';

const DIA = 864e5;
/** Días con actividad antes de ofrecerlo en Hoy (como la tarjeta de instalar). */
export const DIAS_ANTES_DE_OFRECER = 2;
/** Cuánto calla la tarjeta de Hoy tras «Ahora no». */
export const SILENCIO_DIAS = 30;

/** Lo que necesita la lógica (src/store/recordatorio.js) del navegador y de la sincronización. */
function deps() {
  const motor = motorSync();
  return {
    url: urlServidor(),
    clave: clavePublicaAvisos(),
    codigo: () => motor?.asegurarCodigo() ?? null,
    sincronizar: () => motor?.sincronizar(),
  };
}

/** Al arrancar la app: comprobación local (sin red salvo que el navegador haya cambiado la suscripción). */
export function iniciarRecordatorio() {
  if (!motorSync()) return;
  setTimeout(() => { comprobarAlAbrir(deps()).catch(() => {}); }, 3000);
}

/** Qué se dice, debajo del estado, donde no hay avisos y se ofrece el calendario. */
const AYUDA_CALENDARIO = {
  ios: 'Instálala desde Safari: Compartir, «Añadir a pantalla de inicio». Mientras tanto, añade un recordatorio diario a tu calendario:',
  'sin-push': 'Puedes añadir un recordatorio diario a tu calendario:',
  'sin-servidor': 'Añade un recordatorio diario a tu calendario:',
};

/**
 * El bloque de las horas, el estado y «Desactivar». `alCambiar(estado)` se llama tras activar o desactivar.
 * @param {{ idEstado?: string, alCambiar?: Function }} o
 */
export function bloqueAvisos({ idEstado = 'aviso-diario-estado', alCambiar = () => {} } = {}) {
  const d = deps();
  const modo = modoAvisos({ clave: d.clave });
  const caja = h('div.aviso-diario');
  const estado = h(`p#${idEstado}.aviso-diario-estado`, { 'aria-live': 'polite' });
  const nota = h('p.small.aviso-diario-nota', { 'aria-live': 'polite' });
  let ocupado = false;

  const pinta = (extra = null) => {
    const local = leerLocal();
    const e = estadoAvisos({ modo, permiso: permisoAvisos(), local });
    const push = modo === 'push';
    const activa = push && e.tipo === 'activo' ? local.hora : null;
    estado.className = `aviso-diario-estado ${e.tipo}`;
    estado.hidden = modo === 'sin-servidor';
    estado.textContent = e.texto;
    const zona = zonaCliente();
    nota.textContent = extra ?? (activa != null
      ? `Solo si ese día aún no has estudiado; un aviso al día como mucho.${zona.propia ? '' : ' Hora de la España peninsular.'}`
      : '');
    const botones = HORAS.map((hr) => h('button.aviso-hora', {
      type: 'button',
      class: (activa ?? HORA_DEFECTO) === hr ? 'elegida' : '',
      'aria-pressed': push ? String(activa === hr) : null,
      disabled: ocupado,
      onclick: () => (push ? elegir(hr) : calendario(hr)),
    }, horaTexto(hr)));
    setChildren(caja,
      estado,
      push ? null : h('p.small.aviso-diario-ayuda', AYUDA_CALENDARIO[modo]),
      h('div.aviso-horas', { role: 'group', 'aria-label': push ? 'Hora del aviso diario' : 'Hora del recordatorio en el calendario', 'aria-describedby': idEstado }, botones),
      activa != null ? h('button.secondary.aviso-quitar', { type: 'button', disabled: ocupado, onclick: quitar }, 'Desactivar avisos') : null,
      nota);
  };

  async function elegir(hora) {
    ocupado = true;
    pinta('Un momento…');
    const r = await activar(hora, d).catch(() => ({ ok: false, estado: 'error', texto: 'No se han podido activar los avisos ahora.' }));
    ocupado = false;
    pinta(r.ok ? null : r.texto ?? null);
    enfoca(hora);
    alCambiar(r);
  }
  async function quitar() {
    ocupado = true;
    pinta('Un momento…');
    const r = await desactivar(d).catch(() => ({ ok: true, estado: 'apagado' }));
    ocupado = false;
    pinta();
    caja.querySelector('.aviso-hora')?.focus();
    alCambiar(r);
  }
  function calendario(hora) {
    descargar(nombreIcs(hora), icsDiario(hora), 'text/calendar');
    pinta(`Abre el archivo que se ha descargado y pulsa «Añadir» para guardar el recordatorio de las ${horaTexto(hora)} en tu calendario.`);
    enfoca(hora);
    alCambiar({ ok: true, estado: 'calendario' });
  }
  // Al repintar, el foco vuelve al botón de la hora que se tocó (no se pierde).
  const enfoca = (hora) => caja.querySelectorAll('.aviso-hora')[HORAS.indexOf(hora)]?.focus();
  pinta();
  return caja;
}

/** Sección de Ajustes. */
export function seccionAvisos() {
  const sinSync = !motorSync() && modoAvisos({ clave: clavePublicaAvisos() }) === 'push';
  return h('section.aviso-diario-seccion', { id: 'aviso-diario' },
    h('h2', conIcono('campana', 'Aviso diario')),
    sinSync
      ? h('p', 'En este navegador no se pueden activar los avisos (por ejemplo, en una ventana privada).')
      : [h('p', 'Avisarme cada día a las…'), bloqueAvisos()]);
}

/** ¿Toca la tarjeta de Hoy? */
export function tocaOfrecerAvisos({ modo, activo, diasConActividad = 0, silenciadaHasta = 0, ahora = Date.now() }) {
  return !activo && (modo === 'push' || modo === 'ios') && diasConActividad >= DIAS_ANTES_DE_OFRECER && ahora >= silenciadaHasta;
}

/** Tarjeta de Hoy: discreta, tras unos días de uso, con «Ahora no» que la calla un mes. null si no toca. */
export function tarjetaAvisos(progress, ahora = Date.now()) {
  const s = progress.settings();
  const modo = modoAvisos({ clave: clavePublicaAvisos() });
  const activo = !!leerLocal() && permisoAvisos() === 'granted';
  if (!tocaOfrecerAvisos({ modo, activo, diasConActividad: progress.diasConActividadDesde(0), silenciadaHasta: s.avisoDiarioHasta ?? 0, ahora })) return null;
  const cerrar = h('button.small.secondary', { type: 'button', onclick: () => { if (!hecho) progress.setSetting('avisoDiarioHasta', Date.now() + SILENCIO_DIAS * DIA); el.remove(); } }, 'Ahora no');
  let hecho = false;
  const el = h('section.aviso-diario-hoy', { 'aria-label': 'Aviso diario' },
    h('div.aviso-diario-cab', h('span.aviso-diario-tit', conIcono('campana', h('strong', 'Avisarme cada día a las…'))), cerrar),
    bloqueAvisos({ idEstado: 'aviso-diario-estado-hoy', alCambiar: (r) => {
      hecho = r.ok;
      cerrar.textContent = r.ok ? 'Cerrar' : 'Ahora no';
      // Con el recordatorio ya en el calendario, la tarjeta no vuelve (sigue en Ajustes).
      if (r.estado === 'calendario') progress.setSetting('avisoDiarioHasta', Date.now() + 365 * DIA);
    } }));
  return el;
}
