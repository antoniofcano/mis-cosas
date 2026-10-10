// Pantalla encendida (Screen Wake Lock API) mientras se estudia: en un paso de la sesión de hoy, en un examen o
// simulacro a medias y en una clase abierta. Invisible: ni botón, ni ajuste, ni aviso. Sin la API, o si el navegador
// la niega (ahorro de batería, sin permiso…), no pasa nada.
//   · Se pide al entrar en una de esas pantallas y otra vez al volver a la app (el navegador la suelta al ocultarse).
//   · Se suelta al salir de ellas, al terminar y tras INACTIVIDAD_MS sin tocar nada (la app olvidada encendida no
//     vacía la batería); el siguiente toque la vuelve a pedir.
// El navegador entra por parámetro (nav, doc, reloj) para poder probarlo sin él: tests/pantalla-encendida.test.js.
// Documentado en docs/ENTRADA.md («Pantalla encendida y compartir el parte»).

/** Diez minutos sin tocar nada: se deja que la pantalla se apague como siempre. */
export const INACTIVIDAD_MS = 10 * 60 * 1000;

/** Eventos que cuentan como «el alumno sigue ahí». */
export const EVENTOS_ACTIVIDAD = ['pointerdown', 'keydown', 'click', 'wheel'];

/**
 * ¿Esta pantalla quiere la pantalla encendida?
 * @param {string[]} parts  la dirección partida (#/per/curso/x → ['per', 'curso', 'x'])
 * @param {{ enSesion?: boolean, examenAMedias?: boolean }} o  enSesion = es el paso actual de la sesión de hoy;
 *   examenAMedias = hay un examen o simulacro empezado sin terminar
 */
export function quierePantallaEncendida(parts = [], { enSesion = false, examenAMedias = false } = {}) {
  if (enSesion) return true;
  const [, seccion, id] = parts;
  if (seccion === 'curso' && id) return true; // una clase abierta
  if (seccion === 'test' && examenAMedias) return true; // un examen o simulacro en marcha
  return false;
}

/**
 * Crea el control. `quiere()` dice si la pantalla actual lo pide; se consulta en `revisar()`, al volver a la app y con
 * cada toque. Nunca lanza: los fallos del navegador se tragan.
 * @param {{ nav?: object, doc?: object, quiere?: () => boolean, inactividad?: number,
 *   reloj?: { setTimeout: Function, clearTimeout: Function } }} o
 */
export function crearPantallaEncendida({ nav = globalThis.navigator, doc = globalThis.document, quiere = () => false, inactividad = INACTIVIDAD_MS,
  reloj = { setTimeout: (f, ms) => globalThis.setTimeout(f, ms), clearTimeout: (t) => globalThis.clearTimeout(t) } } = {}) {
  const api = nav?.wakeLock;
  const disponible = typeof api?.request === 'function';
  let centinela = null; // WakeLockSentinel en curso
  let pidiendo = null; // la petición en vuelo (para no pedir dos veces)
  let dormida = false; // soltada por inactividad: hasta el siguiente toque
  let temporizador = null;
  let parada = false;

  const visible = () => !doc || doc.visibilityState !== 'hidden';
  const quiereAhora = () => { try { return !parada && !!quiere(); } catch { return false; } };

  function soltar() {
    const c = centinela;
    centinela = null;
    if (c && !c.released) { try { Promise.resolve(c.release()).catch(() => {}); } catch { /* ya suelta */ } }
  }

  function pedir() {
    if (!disponible || centinela || pidiendo) return;
    let p;
    try { p = Promise.resolve(api.request('screen')); } catch { return; }
    pidiendo = p.then((c) => {
      pidiendo = null;
      if (!c) return;
      // Mientras se pedía ha cambiado algo (salió de la pantalla, se ocultó, se durmió): se suelta enseguida.
      if (!quiereAhora() || dormida || !visible()) { try { Promise.resolve(c.release()).catch(() => {}); } catch { /* nada */ } return; }
      centinela = c;
      try { c.addEventListener?.('release', () => { if (centinela === c) centinela = null; }); } catch { /* nada */ }
    }, () => { pidiendo = null; }); // negada (ahorro de batería, sin permiso, pestaña oculta): en silencio
  }

  function armarTemporizador() {
    if (temporizador != null) reloj.clearTimeout(temporizador);
    temporizador = null;
    if (!quiereAhora()) return;
    temporizador = reloj.setTimeout(() => { temporizador = null; dormida = true; soltar(); }, inactividad);
  }

  /** Vuelve a mirar si la pantalla actual lo quiere (al pintar cada dirección) y pide o suelta. */
  function revisar() {
    if (!disponible || parada) return;
    if (quiereAhora() && visible() && !dormida) { pedir(); if (temporizador == null) armarTemporizador(); } else if (!quiereAhora()) {
      soltar();
      if (temporizador != null) { reloj.clearTimeout(temporizador); temporizador = null; }
      dormida = false;
    }
  }

  /** El alumno ha tocado algo: el plazo de inactividad vuelve a empezar (y, si estaba dormida, se pide de nuevo). */
  function actividad() {
    if (!disponible || parada) return;
    dormida = false;
    armarTemporizador();
    revisar();
  }

  const alCambiarVisibilidad = () => {
    if (!disponible || parada) return;
    // Al ocultarse, el navegador ya la suelta; al volver, volver a la app cuenta como actividad.
    if (visible()) actividad(); else centinela = null;
  };
  if (disponible) { // sin la API ni siquiera se escucha nada
    try { doc?.addEventListener?.('visibilitychange', alCambiarVisibilidad); } catch { /* nada */ }
    for (const ev of EVENTOS_ACTIVIDAD) { try { doc?.addEventListener?.(ev, actividad, { capture: false, passive: true }); } catch { /* nada */ } }
  }

  return {
    disponible,
    revisar,
    actividad,
    /** ¿Hay ahora un bloqueo en vigor? (para pruebas y el resumen del agente) */
    activa: () => !!centinela,
    /** Suelta y deja de escuchar. */
    parar() {
      parada = true;
      soltar();
      if (temporizador != null) reloj.clearTimeout(temporizador);
      temporizador = null;
      try { doc?.removeEventListener?.('visibilitychange', alCambiarVisibilidad); } catch { /* nada */ }
      for (const ev of EVENTOS_ACTIVIDAD) { try { doc?.removeEventListener?.(ev, actividad, { capture: false }); } catch { /* nada */ } }
    },
  };
}
