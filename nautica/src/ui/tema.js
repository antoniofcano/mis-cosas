// Aspecto de la app (R-67): claro, oscuro o automático (el del sistema; por defecto).
//
// Es un ajuste del aparato —`aspecto` en los ajustes locales, fuera de la lista de los que se sincronizan—: lo que se ve de
// día o de noche depende de la pantalla en la que se mira, no del alumno. Para pintar sin parpadeo hay que saberlo antes de que
// cargue la hoja de estilos, y los ajustes (en el registro de sincronización) todavía no están leídos: por eso se guarda
// además, tal cual, en una clave pequeña de localStorage (`nautica.aspecto`) que el script de <head> de index.html lee al
// momento. Ese script repite a propósito la lógica de `temaForzado` y `COLOR_BARRA` (no puede importar módulos sin esperar);
// tests/tema.test.js comprueba que dan lo mismo.
//
// En CSS: sin `data-theme` manda el sistema (@media prefers-color-scheme); `data-theme="light"` y `data-theme="dark"` fuerzan
// (styles/app.css y styles/laminas.css). La meta `theme-color` (la barra del navegador) sigue al mismo aspecto.

export const ASPECTOS = [['auto', 'Automático'], ['claro', 'Claro'], ['oscuro', 'Oscuro']];
export const CLAVE_ASPECTO = 'nautica.aspecto';
/** Color de la barra del navegador en cada aspecto: el del fondo (--bg) de cada tema. */
export const COLOR_BARRA = { claro: '#EEF3F5', oscuro: '#0A1418' };

/** Cualquier valor guardado → 'auto', 'claro' u 'oscuro' (lo desconocido es automático). */
export const normalizaAspecto = (v) => (v === 'claro' || v === 'oscuro' ? v : 'auto');

/** Valor de `data-theme` que fuerza el aspecto, o null si lo decide el sistema. */
export const temaForzado = (aspecto) => ({ claro: 'light', oscuro: 'dark' })[normalizaAspecto(aspecto)] ?? null;

/** Color de la barra del navegador: el del aspecto forzado o, en automático, el del sistema. */
export const colorBarra = (aspecto, sistemaOscuro = false) => {
  const a = normalizaAspecto(aspecto);
  return COLOR_BARRA[a === 'auto' ? (sistemaOscuro ? 'oscuro' : 'claro') : a];
};

/**
 * Pone el aspecto en el documento: `data-theme` en <html> (quitado en automático) y la meta `theme-color`. En automático las
 * dos metas (una para cada preferencia del sistema) recuperan su color; forzado, las dos llevan el del aspecto.
 */
export function aplicaAspecto(aspecto, doc = typeof document === 'undefined' ? null : document) {
  if (!doc?.documentElement) return;
  const forzado = temaForzado(aspecto);
  if (forzado) doc.documentElement.setAttribute('data-theme', forzado); else doc.documentElement.removeAttribute('data-theme');
  for (const m of doc.querySelectorAll('meta[name="theme-color"]')) {
    const oscura = /dark/.test(m.getAttribute('media') ?? '');
    m.setAttribute('content', forzado ? COLOR_BARRA[forzado === 'dark' ? 'oscuro' : 'claro'] : COLOR_BARRA[oscura ? 'oscuro' : 'claro']);
  }
}

/** Guarda el aspecto en la clave pequeña que lee el script de <head> (sin romper si el almacenamiento no está). */
export function guardaAspecto(aspecto, storage = typeof localStorage === 'undefined' ? null : localStorage) {
  try {
    if (normalizaAspecto(aspecto) === 'auto') storage?.removeItem(CLAVE_ASPECTO); else storage?.setItem(CLAVE_ASPECTO, normalizaAspecto(aspecto));
  } catch { /* sin almacenamiento: el ajuste sigue en los ajustes del aparato */ }
}

/** Cambia el aspecto: lo guarda como ajuste del aparato, lo copia a la clave del <head> y lo aplica ya. */
export function elegirAspecto(progress, aspecto, doc) {
  const a = normalizaAspecto(aspecto);
  progress.setSetting('aspecto', a);
  guardaAspecto(a);
  aplicaAspecto(a, doc);
  return a;
}

/** Lee la clave pequeña del <head> (null si no hay o no se puede leer). */
export function leeAspecto(storage = typeof localStorage === 'undefined' ? null : localStorage) {
  try { return storage?.getItem(CLAVE_ASPECTO) ?? null; } catch { return null; }
}

/**
 * Al arrancar: aplica el aspecto de los ajustes del aparato y deja la clave del <head> igual que ellos. Si los ajustes aún no
 * lo tienen (se acaban de borrar, o lo puso otra pestaña), vale la clave: no se borra lo que el alumno eligió.
 */
export function iniciarAspecto(progress, doc, storage) {
  const a = normalizaAspecto(progress.settings().aspecto ?? leeAspecto(storage));
  guardaAspecto(a, storage);
  aplicaAspecto(a, doc);
  return a;
}
