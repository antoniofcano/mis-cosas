// Motor de sincronización (docs/SYNC.md): sube las operaciones pendientes del registro y trae las de los otros aparatos
// del alumno, en una sola petición (POST /v1/sync) por lote. Nunca bloquea la interfaz (todo es asíncrono) y nunca
// pierde nada: lo pendiente sigue pendiente hasta que el servidor confirma, y lo recibido se guarda junto con el cursor.
//
// Cuándo sincroniza: al abrir la app, al volver la red (`online`), al volver a primer plano (`visibilitychange`), cada
// pocos minutos con la app abierta y unos segundos después de cada escritura. Si falla, espera cada vez el doble (de
// 15 s a 30 min, con algo de azar). Sin red o con el servidor caído, la app funciona igual en local.
//
// Sin DOM: la red, el reloj, los temporizadores y el almacenamiento entran por parámetro (así se prueba con un
// servidor simulado). El estado para la interfaz y el diagnóstico se guarda en `nautica.sync.diag.v1` (sin datos del
// alumno: ni respuestas ni código).

import { generarCodigo, validarCodigo } from './codigo.js';
import { validarOperacion } from './operaciones.js';
import * as C from './config.js';

export const CLAVE_DIAG = 'nautica.sync.diag.v1';
const MAX_ERRORES = 8;
const MAX_VUELTAS = 40;

/** Error de sincronización con un código corto y un motivo en palabras (sin datos del alumno). */
class ErrorSync extends Error {
  constructor(codigo, motivo, { estado = 'error', reintentoMs = null } = {}) { super(motivo); this.codigo = codigo; this.estado = estado; this.reintentoMs = reintentoMs; }
}

const MOTIVOS = {
  red: 'Sin conexión con el servidor.',
  tiempo: 'El servidor tarda demasiado.',
  respuesta: 'Respuesta del servidor no válida.',
  'codigo-desconocido': 'Ese código no existe.',
  'codigo-invalido': 'El código no es válido.',
  limite: 'Demasiadas peticiones: se reintentará más tarde.',
  tope: 'Se ha llenado el espacio de este alumno en el servidor.',
  servidor: 'El servidor ha fallado.',
};

/**
 * @param {object} o
 * @param {object} o.registro   el de progress.registro (src/store/sync/registro.js)
 * @param {Storage|null} [o.storage]  para el diagnóstico
 * @param {Function} [o.fetch]  fetch (o uno simulado)
 * @param {string|Function} [o.url]  URL del servidor (o función que la da)
 * @param {Function} [o.ahora]  reloj (ms)
 * @param {{ setTimeout: Function, clearTimeout: Function, setInterval: Function, clearInterval: Function }} [o.reloj]
 * @param {() => boolean} [o.enLinea]  ¿hay red? (navigator.onLine)
 * @param {Function} [o.azar]  número al azar en [0, 1)
 * @param {object} [o.locks]  navigator.locks (para que dos pestañas no sincronicen a la vez)
 */
export function crearMotor({
  registro, storage = null, fetch: f = globalThis.fetch?.bind(globalThis), url = C.URL_PRODUCCION, ahora = Date.now,
  reloj = globalThis, enLinea = () => globalThis.navigator?.onLine !== false, azar = Math.random, locks = globalThis.navigator?.locks,
  generar = generarCodigo,
} = {}) {
  let diag = { estado: null, ultimoExito: null, ultimoIntento: null, fallos: 0, errores: [], recibidas: 0, subidas: 0, ignoradas: 0 };
  try { const raw = storage?.getItem(CLAVE_DIAG); if (raw) diag = { ...diag, ...JSON.parse(raw) }; } catch { /* nada */ }
  const guardaDiag = () => { try { storage?.setItem(CLAVE_DIAG, JSON.stringify(diag)); } catch { /* nada */ } };
  const oyentes = new Set();
  const avisa = () => { for (const o of oyentes) { try { o(motor.estado()); } catch { /* nada */ } } };
  let enCurso = null;
  let temporizador = null;
  let proximo = null;
  let loteOps = C.LOTE_OPS;
  const quitar = [];
  const base = () => (typeof url === 'function' ? url() : url);

  function apuntaError(e) {
    diag.fallos += 1;
    diag.estado = e.estado;
    diag.errores = [...diag.errores, { t: ahora(), codigo: e.codigo, motivo: e.message }].slice(-MAX_ERRORES);
    guardaDiag();
  }

  async function peticion(cuerpo) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = reloj.setTimeout(() => ctl?.abort(), C.TIMEOUT_MS);
    let res;
    try {
      res = await f(`${base()}/v1/sync`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${registro.codigo}` },
        body: JSON.stringify(cuerpo),
        signal: ctl?.signal,
      });
    } catch (e) {
      throw e?.name === 'AbortError' ? new ErrorSync('tiempo', MOTIVOS.tiempo, { estado: 'sin-conexion' }) : new ErrorSync('red', MOTIVOS.red, { estado: 'sin-conexion' });
    } finally { reloj.clearTimeout(t); }
    let json = null;
    try { json = await res.json(); } catch { /* sin cuerpo JSON */ }
    if (!res.ok) {
      const codigo = json?.error ?? (res.status >= 500 ? 'servidor' : `http-${res.status}`);
      const espera = Number(res.headers?.get?.('retry-after'));
      throw new ErrorSync(codigo, MOTIVOS[codigo] ?? json?.motivo ?? `Error ${res.status}.`, { reintentoMs: Number.isFinite(espera) && espera > 0 ? espera * 1000 : null });
    }
    if (!json || !Number.isSafeInteger(json.cursor) || !Array.isArray(json.ops)) throw new ErrorSync('respuesta', MOTIVOS.respuesta);
    return json;
  }

  /** Una vuelta completa: sube en lotes y trae hasta ponerse al día. `alResponder` se llama tras cada respuesta buena. */
  async function vuelta(alResponder = () => {}) {
    for (let i = 0; i < MAX_VUELTAS; i += 1) {
      const lote = registro.lote(loteOps, C.LOTE_BYTES);
      let json;
      try {
        json = await peticion({ v: 1, cursor: registro.cursor, ops: lote, ...(registro.creador ? { crear: true } : {}) });
      } catch (e) {
        if (e.codigo === 'demasiado-grande' && loteOps > 1) { loteOps = Math.max(1, Math.floor(loteOps / 2)); continue; }
        throw e;
      }
      const validas = json.ops.filter((op) => validarOperacion(op, ahora()) === null);
      diag.ignoradas += json.ops.length - validas.length;
      const nuevas = registro.recibir({ ops: validas, cursor: json.cursor, subidas: lote.map((o) => o.i) });
      alResponder();
      diag.recibidas += nuevas;
      diag.subidas += lote.length;
      for (const r of json.rechazadas ?? []) diag.errores = [...diag.errores, { t: ahora(), codigo: 'rechazada', motivo: String(r?.motivo ?? '').slice(0, 40) }].slice(-MAX_ERRORES);
      if (!json.mas && registro.pendientes() === 0) return;
      if (!json.mas && lote.length === 0) return;
    }
  }

  async function sincronizarYa() {
    if (temporizador) { reloj.clearTimeout(temporizador); temporizador = null; proximo = null; } // ya va ahora
    diag.ultimoIntento = ahora();
    if (!registro.codigo) {
      if (registro.pendientes() === 0) { diag.estado = 'sin-vincular'; guardaDiag(); avisa(); return motor.estado(); }
      registro.ponerCodigoNuevo(generar()); // primer uso: el código se crea en silencio
    }
    if (!enLinea()) {
      apuntaError(new ErrorSync('red', MOTIVOS.red, { estado: 'sin-conexion' }));
      avisa();
      programa(espera());
      return motor.estado();
    }
    try {
      await vuelta();
      diag.ultimoExito = ahora();
      diag.fallos = 0;
      diag.estado = registro.pendientes() ? 'pendiente' : 'al-dia';
      loteOps = C.LOTE_OPS;
      guardaDiag();
    } catch (e) {
      const err = e instanceof ErrorSync ? e : new ErrorSync('interno', String(e?.message ?? e).slice(0, 80));
      apuntaError(err);
      programa(err.reintentoMs ?? espera());
    }
    avisa();
    return motor.estado();
  }

  /** Espera antes del siguiente intento tras `fallos` fallos seguidos. */
  const espera = () => Math.min(C.ESPERA_MAX_MS, C.ESPERA_MIN_MS * 2 ** Math.max(0, diag.fallos - 1)) * (0.75 + azar() / 2);

  function programa(ms) {
    const cuando = ahora() + ms;
    if (temporizador && proximo != null && proximo <= cuando) return; // ya hay uno antes
    if (temporizador) reloj.clearTimeout(temporizador);
    proximo = cuando;
    temporizador = reloj.setTimeout(() => { temporizador = null; proximo = null; motor.sincronizar(); }, ms);
  }

  const motor = {
    /** Sincroniza ahora (si ya está en marcha, espera a esa). Nunca lanza: el resultado está en estado(). */
    sincronizar() {
      if (enCurso) return enCurso;
      const corre = () => sincronizarYa();
      enCurso = (locks?.request ? locks.request('patron-sync', { ifAvailable: true }, (lock) => (lock ? corre() : motor.estado())) : corre())
        .catch(() => motor.estado())
        .finally(() => { enCurso = null; });
      return enCurso;
    },
    /** Programa una sincronización dentro de `ms` (si no hay otra antes). */
    programar: programa,

    /** Arranca los disparadores. `win`: window; `doc`: document. */
    iniciar({ win = globalThis, doc = globalThis.document } = {}) {
      const alVolver = () => { if (doc?.visibilityState !== 'hidden') motor.sincronizar(); };
      win.addEventListener?.('online', alVolver);
      doc?.addEventListener?.('visibilitychange', alVolver);
      const cada = reloj.setInterval(() => { if (doc?.visibilityState !== 'hidden') motor.sincronizar(); }, C.CADA_MS);
      const tras = registro.on('agregadas', () => { diag.estado = diag.estado === 'error' || diag.estado === 'sin-conexion' ? diag.estado : 'pendiente'; programa(C.TRAS_ESCRIBIR_MS); avisa(); });
      quitar.push(() => win.removeEventListener?.('online', alVolver), () => doc?.removeEventListener?.('visibilitychange', alVolver), () => reloj.clearInterval(cada), tras);
      programa(1500); // al abrir, sin estorbar a la primera pantalla
      return motor;
    },
    parar() { for (const q of quitar.splice(0)) q(); if (temporizador) reloj.clearTimeout(temporizador); temporizador = null; },

    /** Garantiza que hay código (lo crea en silencio si falta) y lo devuelve. */
    asegurarCodigo() {
      if (!registro.codigo) registro.ponerCodigoNuevo(generar());
      return registro.codigo;
    },

    /**
     * Une este aparato al alumno del código `texto`. Lo que haya aquí se suma a lo suyo, sin preguntar.
     * @returns {Promise<{ ok: boolean, texto?: string, motivo?: string }>}
     */
    async vincular(texto) {
      const v = validarCodigo(texto);
      if (!v.ok) return { ok: false, motivo: v.motivo, texto: v.texto };
      if (v.codigo === registro.codigo) return { ok: true, ya: true };
      if (enCurso) await enCurso;
      const deshacer = registro.vincular(v.codigo);
      let aceptado = false; // el servidor ya conoce el código: el vínculo vale aunque falte traer algo
      try {
        if (!enLinea()) throw new ErrorSync('red', MOTIVOS.red, { estado: 'sin-conexion' });
        await vuelta(() => { aceptado = true; });
        diag.ultimoExito = ahora();
        diag.fallos = 0;
        diag.estado = registro.pendientes() ? 'pendiente' : 'al-dia';
        guardaDiag();
        avisa();
        return { ok: true };
      } catch (e) {
        if (aceptado) { // a medias (límite de peticiones, red que se corta…): sigue sola en un rato
          apuntaError(e instanceof ErrorSync ? e : new ErrorSync('interno', String(e?.message ?? e).slice(0, 80)));
          programa(e?.reintentoMs ?? espera());
          avisa();
          return { ok: true, parcial: true };
        }
        deshacer();
        avisa();
        const codigo = e?.codigo ?? 'interno';
        const textoError = codigo === 'codigo-desconocido' ? 'Ese código no existe. Revisa que esté bien escrito.'
          : e?.estado === 'sin-conexion' ? 'No hay conexión. Prueba otra vez cuando tengas internet.'
            : codigo === 'limite' ? 'Demasiados intentos. Espera un rato y vuelve a probar.'
              : 'No se ha podido unir ahora. Prueba otra vez en un rato.';
        return { ok: false, motivo: codigo, texto: textoError };
      }
    },

    /** Estado para la interfaz y el diagnóstico (sin datos del alumno). */
    estado() {
      const pendientes = registro.pendientes();
      let estado = diag.estado;
      if (!registro.codigo) estado = 'sin-vincular';
      else if (estado === 'sin-vincular') estado = 'pendiente';
      else if (!enLinea()) estado = 'sin-conexion';
      else if (estado === 'al-dia' && pendientes) estado = 'pendiente';
      else if (!estado) estado = pendientes || !diag.ultimoExito ? 'pendiente' : 'al-dia';
      return {
        estado, codigo: registro.codigo, pendientes, cursor: registro.cursor, ultimoExito: diag.ultimoExito, ultimoIntento: diag.ultimoIntento,
        fallos: diag.fallos, errores: diag.errores, ultimoError: diag.errores.at(-1) ?? null, operaciones: registro.ops.length,
        recibidas: diag.recibidas, subidas: diag.subidas, ignoradas: diag.ignoradas, sinEspacio: registro.errorGuardar?.() ?? null,
      };
    },
    on(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
  };
  return motor;
}

/**
 * ¿Está sana la sincronización? Con código y una sincronización lograda hace menos de C.SANA_MS. Mientras lo esté, no
 * hace falta recordar al alumno que guarde copias (src/ui/copia.js).
 */
export const estaSana = (e, ahora = Date.now()) => !!(e?.codigo && e.ultimoExito && ahora - e.ultimoExito < C.SANA_MS);

/** ¿Merece el punto de aviso en la cabecera? Hay algo que sincronizar y lleva más de un día sin lograrlo. */
export function avisoCabecera(e, ahora = Date.now()) {
  if (!e?.codigo) return false;
  const desde = e.ultimoExito ?? null;
  if (desde == null) return e.fallos > 0 && e.errores?.[0] && ahora - e.errores[0].t > C.AVISO_CABECERA_MS;
  return ahora - desde > C.AVISO_CABECERA_MS;
}
