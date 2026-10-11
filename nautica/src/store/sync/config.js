// Configuración de la sincronización (docs/SYNC.md). La URL del servidor se puede cambiar aquí (o, para pruebas, con
// localStorage['nautica.sync.url'] en el propio navegador). Si el servidor no responde, la app sigue igual en local.

export const URL_PRODUCCION = 'https://patron-sync.antoniofcano.workers.dev';

/** URL del servidor de sincronización: la de producción, salvo que el navegador tenga otra puesta para pruebas. */
export function urlServidor(storage = globalThis.localStorage) {
  try {
    const u = storage?.getItem('nautica.sync.url');
    if (u && /^https?:\/\/[\w.:-]+$/.test(u)) return u;
  } catch { /* sin almacenamiento */ }
  return URL_PRODUCCION;
}

/** Cada cuánto se sincroniza con la app abierta y en primer plano. */
export const CADA_MS = 4 * 60e3;
/** Espera tras una escritura antes de subirla (junta varias respuestas seguidas en una subida). */
export const TRAS_ESCRIBIR_MS = 4000;
/** Espera tras un fallo: crece al doble en cada fallo seguido, hasta el máximo. */
export const ESPERA_MIN_MS = 15e3;
export const ESPERA_MAX_MS = 30 * 60e3;
/** Tiempo máximo de una petición. */
export const TIMEOUT_MS = 20e3;
/** Operaciones y bytes por lote de subida (el servidor acepta hasta 500 y 256 KB). */
export const LOTE_OPS = 500;
export const LOTE_BYTES = 200 * 1024;
/** Sin sincronizar desde hace más de esto: punto discreto en la cabecera. */
export const AVISO_CABECERA_MS = 24 * 3600e3;
/** Sin sincronizar desde hace más de esto (o sin código): vuelven los avisos de guardar una copia. */
export const SANA_MS = 3 * 24 * 3600e3;
