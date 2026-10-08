// Protección de los datos del alumno: el progreso vive en el almacenamiento del navegador, que puede borrarlo si hay poco
// espacio o (en Safari de iPhone) si la web lleva días sin abrirse. Aquí se pide al navegador que lo conserve
// (`navigator.storage.persist()`), se guarda qué contestó y se explica en palabras. Sin DOM: el navegador entra por
// parámetro para poder probarlo.

const DIA = 864e5;
/** Cada cuánto se vuelve a pedir si el navegador dijo que no (los navegadores deciden con el uso, no con la insistencia). */
export const REINTENTO_DIAS = 3;
/** Días con actividad sin copia a partir de los cuales se recuerda guardarla: menos si los datos no están protegidos. */
export const AVISO_DIAS = { protegido: 7, sinProteger: 4 };

/** ¿La app está instalada en la pantalla de inicio (modo independiente)? */
export function estaInstalada(nav = globalThis.navigator, win = globalThis) {
  if (nav?.standalone === true) return true; // Safari de iPhone
  try { return !!win?.matchMedia?.('(display-mode: standalone)')?.matches; } catch { return false; }
}

/** ¿Es un iPhone o iPad? (para decir cómo instalarla). */
export function esIOS(nav = globalThis.navigator) {
  const ua = nav?.userAgent ?? '';
  return /iPad|iPhone|iPod/.test(ua) || (nav?.platform === 'MacIntel' && (nav?.maxTouchPoints ?? 0) > 1);
}

/** ¿Puede este navegador conservar los datos a petición? */
export const soportaPersistencia = (nav = globalThis.navigator) => typeof nav?.storage?.persist === 'function';

/**
 * Estado en palabras sencillas para Ajustes y los avisos.
 * @param {{ persistente?: boolean|null }} ajustes  lo guardado en los ajustes del alumno
 * @returns {{ estado: 'protegido'|'sin-proteger'|'no-disponible', instalada: boolean, ios: boolean, texto: string, consejo: string|null }}
 */
export function estadoProteccion(ajustes = {}, nav = globalThis.navigator, win = globalThis) {
  const instalada = estaInstalada(nav, win);
  const ios = esIOS(nav);
  if (ajustes.persistente === true) return { estado: 'protegido', instalada, ios, texto: 'Tus datos están protegidos: el navegador no los borrará por su cuenta.', consejo: null };
  if (!soportaPersistencia(nav)) {
    return { estado: 'no-disponible', instalada, ios, texto: 'Este navegador no permite proteger tus datos: el navegador podría borrarlos.', consejo: 'Guarda una copia de vez en cuando.' };
  }
  const consejo = ios && !instalada
    ? 'En iPhone, instala la app en la pantalla de inicio (Compartir, «Añadir a pantalla de inicio») para que Safari no borre tus datos si pasan días sin abrirla.'
    : 'Usa la app con frecuencia, o instálala, y guarda una copia de vez en cuando.';
  return { estado: 'sin-proteger', instalada, ios, texto: 'Tus datos todavía no están protegidos: el navegador podría borrarlos.', consejo };
}

/**
 * Pide al navegador que conserve los datos (una vez por sesión de la app y no más de cada REINTENTO_DIAS si dijo que no).
 * Guarda el resultado en los ajustes: `persistente` (true | false) y `persistenteIntento` (fecha).
 * @returns {Promise<boolean|null>}  true si está protegido, false si no, null si no se puede
 */
export async function pedirPersistencia({ nav = globalThis.navigator, leer, guardar, ahora = Date.now() } = {}) {
  if (!soportaPersistencia(nav)) return null;
  try {
    const ya = typeof nav.storage.persisted === 'function' ? await nav.storage.persisted() : false;
    if (ya) { if (leer().persistente !== true) guardar('persistente', true); return true; }
    const ult = leer().persistenteIntento ?? 0;
    if (leer().persistente === false && ahora - ult < REINTENTO_DIAS * DIA) return false;
    const ok = !!(await nav.storage.persist());
    guardar('persistente', ok);
    guardar('persistenteIntento', ahora);
    return ok;
  } catch {
    return null;
  }
}

/** Días con actividad sin copia a partir de los cuales toca el recordatorio, según estén o no protegidos los datos. */
export const diasParaAviso = (ajustes = {}) => (ajustes.persistente === true ? AVISO_DIAS.protegido : AVISO_DIAS.sinProteger);
