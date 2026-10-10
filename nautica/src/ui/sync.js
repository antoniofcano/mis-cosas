// La sincronización en la interfaz (docs/SYNC.md): arranca el motor al abrir la app y da a las pantallas el estado en
// palabras sencillas («Sincronizado · hace 2 min · 0 pendientes · v…»), si está sana (para callar los avisos de guardar
// una copia) y si merece el punto discreto de la cabecera. El alumno no tiene que hacer nada: todo esto es para
// diagnóstico y para unir otro aparato.

import { crearMotor, estaSana, avisoCabecera } from '../store/sync/motor.js';
import { urlServidor } from '../store/sync/config.js';
import { formatearCodigo } from '../store/sync/codigo.js';
import { cuenta } from '../texto.js';

let motor = null;
let version = null;

/** Arranca la sincronización (una vez, en app.js). Sin almacenamiento (modo privado) no hace nada. */
export function iniciarSincronizacion(progress, { storage = globalThis.localStorage } = {}) {
  if (motor || !progress?.registro) return motor;
  try {
    motor = crearMotor({ registro: progress.registro, storage, url: () => urlServidor(storage) });
    motor.iniciar();
  } catch (e) {
    console.warn('sincronización desactivada', e);
    motor = null;
  }
  return motor;
}

export const motorSync = () => motor;
export const estadoSync = () => motor?.estado() ?? null;
/** ¿Sincronización sana? (con código y lograda hace poco). Sin motor (pruebas, modo privado): no. */
export const syncSana = (ahora = Date.now()) => estaSana(estadoSync(), ahora);
export const syncAvisoCabecera = (ahora = Date.now()) => avisoCabecera(estadoSync(), ahora);
export const alCambiarSync = (f) => motor?.on(f) ?? (() => {});

/** Versión de la app (la del service worker, sw-lista.js). */
export async function versionApp() {
  if (version) return version;
  try {
    const t = await (await fetch('sw-lista.js', { cache: 'no-store' })).text();
    version = /VERSION\s*=\s*'([0-9a-f]+)'/.exec(t)?.[1] ?? '?';
  } catch { version = '?'; }
  return version;
}

/** «hace un momento», «hace 5 minutos», «hace 2 horas», «hace 3 días». */
export function hace(ms, ahora = Date.now()) {
  const s = Math.max(0, ahora - ms) / 1000;
  if (s < 60) return 'hace un momento';
  if (s < 3600) return `hace ${cuenta(Math.round(s / 60), 'minuto')}`;
  if (s < 86400) return `hace ${cuenta(Math.round(s / 3600), 'hora')}`;
  return `hace ${cuenta(Math.round(s / 86400), 'día')}`;
}

/**
 * La línea de estado de Ajustes. Estados: al día, pendiente, sin conexión, error (con su código y motivo corto) y sin
 * vincular.
 * @returns {{ tipo: string, texto: string }}
 */
export function lineaEstado(e, ver = '?', ahora = Date.now()) {
  const v = `v${ver}`;
  if (!e) return { tipo: 'sin-vincular', texto: `Sin sincronizar en este navegador · ${v}` };
  const pend = cuenta(e.pendientes, 'pendiente');
  const cuando = e.ultimoExito ? hace(e.ultimoExito, ahora) : 'aún no';
  switch (e.estado) {
    case 'al-dia': return { tipo: 'ok', texto: `Sincronizado · ${cuando} · ${pend} · ${v}` };
    case 'pendiente': return { tipo: 'pendiente', texto: `Pendiente de sincronizar · ${pend} · última vez: ${cuando} · ${v}` };
    case 'sin-conexion': return { tipo: 'aviso', texto: `Sin conexión: se sincronizará al volver · ${pend} · última vez: ${cuando} · ${v}` };
    case 'error': return { tipo: 'aviso', texto: `Error al sincronizar (${e.ultimoError?.codigo ?? '?'}): ${e.ultimoError?.motivo ?? ''} · ${pend} · última vez: ${cuando} · ${v}` };
    default: return { tipo: 'sin-vincular', texto: `Sin vincular: aún no hay nada que sincronizar · ${v}` };
  }
}

/** Texto de «Copiar diagnóstico»: estado, cursor, pendientes, versión y últimos errores. Sin datos del alumno. */
export function textoDiagnostico(e, ver = '?', ahora = Date.now()) {
  const fecha = (ms) => (ms ? new Date(ms).toISOString() : '—');
  return [
    'Diagnóstico de sincronización (Patrón)',
    `versión: ${ver}`,
    `estado: ${e?.estado ?? 'sin motor'}`,
    `vinculado: ${e?.codigo ? 'sí' : 'no'}`,
    `pendientes: ${e?.pendientes ?? 0}`,
    `operaciones en este aparato: ${e?.operaciones ?? 0}`,
    `cursor: ${e?.cursor ?? 0}`,
    `último éxito: ${fecha(e?.ultimoExito)}`,
    `último intento: ${fecha(e?.ultimoIntento)}`,
    `fallos seguidos: ${e?.fallos ?? 0}`,
    `subidas/recibidas/ignoradas: ${e?.subidas ?? 0}/${e?.recibidas ?? 0}/${e?.ignoradas ?? 0}`,
    `almacenamiento: ${e?.sinEspacio ? `error (${e.sinEspacio})` : 'bien'}`,
    `en línea: ${globalThis.navigator?.onLine === false ? 'no' : 'sí'}`,
    `ahora: ${fecha(ahora)}`,
    'últimos errores:',
    ...((e?.errores ?? []).length ? e.errores.map((x) => `  ${fecha(x.t)} ${x.codigo}: ${x.motivo}`) : ['  ninguno']),
  ].join('\n');
}

/** El código del alumno en grupos de cuatro (lo crea en silencio si aún no lo hay). */
export function codigoAlumno() {
  if (!motor) return null;
  return formatearCodigo(motor.asegurarCodigo());
}
