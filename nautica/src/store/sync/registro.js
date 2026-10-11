// Registro local de operaciones (docs/SYNC.md): lo que este aparato guarda para sincronizar, en una clave aparte del
// progreso (`nautica.sync.v1`):
//   { v: 1, epoca, dev, n, ops: [...], pend: [ids], cursor, codigo, creador, local: { settings, testEnCurso } }
//   epoca   cambia al empezar de cero: otra pestaña con la época vieja no resucita lo borrado
//   dev     id al azar de este aparato · n: contador de operaciones (nunca se repite)
//   ops     todas las operaciones conocidas (propias y de los otros aparatos) · pend: las propias aún sin subir
//   cursor  hasta dónde se ha recibido del servidor · codigo: código del alumno (normalizado) o null
//   creador true mientras el código lo ha creado este aparato y el servidor aún no lo conoce
//   local   la parte del progreso que no sale del aparato (ajustes del aparato y el examen a medias)
// Con varias pestañas: cada escritura de otra pestaña llega por el evento `storage` y se UNE (por id) con lo que hay en
// memoria; si a la otra le faltaba algo nuestro, se vuelve a guardar. Así ninguna pisa a la otra ni se duplica nada.

import { idOperacion, idAleatorio } from './operaciones.js';
import { unirOps } from './fusion.js';

export const CLAVE_SYNC = 'nautica.sync.v1';

function vacio(rnd) {
  return { v: 1, epoca: idAleatorio(8, rnd), dev: idAleatorio(10, rnd), n: 0, ops: [], pend: [], cursor: 0, codigo: null, creador: false, local: { settings: {} } };
}

/**
 * @param {Storage|null} storage
 * @param {{ rnd?: Function }} o  rnd(n): bytes al azar (inyectable en pruebas)
 */
export function crearRegistro(storage, { rnd } = {}) {
  let st = null;
  let existia = false;
  try {
    const raw = storage?.getItem(CLAVE_SYNC);
    if (raw) {
      const x = JSON.parse(raw);
      if (x && x.v === 1 && Array.isArray(x.ops)) { st = x; existia = true; }
    }
  } catch { /* corrupto: se empieza de nuevo (el progreso antiguo, si lo hay, se vuelve a migrar) */ }
  st ??= vacio(rnd);
  st.pend ??= [];
  st.local ??= { settings: {} };
  st.local.settings ??= {};
  let ids = new Set(st.ops.map((o) => o.i));
  let errorGuardar = null;
  const oyentes = { nuevas: new Set(), agregadas: new Set() };

  const guardar = () => {
    try { storage?.setItem(CLAVE_SYNC, JSON.stringify(st)); errorGuardar = null; return true; } catch (e) { errorGuardar = e?.name || 'error'; return false; }
  };

  const reg = {
    /** ¿Había registro guardado al crear este objeto? (si no, toca migrar el progreso antiguo) */
    existia: () => existia,
    get ops() { return st.ops; },
    get local() { return st.local; },
    get dev() { return st.dev; },
    get codigo() { return st.codigo; },
    get creador() { return st.creador; },
    get cursor() { return st.cursor; },
    get epoca() { return st.epoca; },
    pendientes: () => st.pend.length,
    errorGuardar: () => errorGuardar,
    guardar,

    /** Id nuevo de este aparato. */
    siguienteId() {
      st.n += 1;
      return idOperacion(st.dev, st.n, idAleatorio(3, rnd));
    },

    /** Añade operaciones propias (quedan pendientes de subir) y guarda. */
    agregar(ops) {
      for (const op of ops) {
        if (ids.has(op.i)) continue;
        st.ops.push(op);
        st.pend.push(op.i);
        ids.add(op.i);
      }
      guardar();
      avisar('agregadas');
    },

    /** Las operaciones pendientes, en lotes: como mucho `max` y `bytes` (JSON) por lote. */
    lote(max = 500, bytes = 200 * 1024) {
      const pend = new Set(st.pend);
      const out = [];
      let tam = 2;
      for (const op of st.ops) {
        if (!pend.has(op.i)) continue;
        const t = JSON.stringify(op).length + 1;
        if (out.length && (out.length >= max || tam + t > bytes)) break;
        out.push(op);
        tam += t;
      }
      return out;
    },

    /**
     * Respuesta del servidor: une lo recibido, avanza el cursor y quita de pendientes lo subido (aceptado o rechazado:
     * lo rechazado se queda en este aparato, pero no se reintenta para siempre). Devuelve cuántas operaciones nuevas
     * han llegado.
     */
    recibir({ ops = [], cursor, subidas = [] }) {
      let nuevas = 0;
      for (const op of ops) if (op && typeof op.i === 'string' && !ids.has(op.i)) { st.ops.push(op); ids.add(op.i); nuevas += 1; }
      if (Number.isSafeInteger(cursor) && cursor > st.cursor) st.cursor = cursor;
      if (subidas.length) { const s = new Set(subidas); st.pend = st.pend.filter((i) => !s.has(i)); }
      st.creador = false;
      guardar();
      if (nuevas) avisar('nuevas');
      return nuevas;
    },

    /** Código nuevo creado por este aparato (el servidor lo dará de alta en la primera subida). */
    ponerCodigoNuevo(codigo) {
      st.codigo = codigo;
      st.creador = true;
      st.cursor = 0;
      guardar();
    },

    /**
     * Une este aparato a otro código: lo que hay aquí se marca para subir a ese alumno (se fusiona) y se recibe lo
     * suyo desde el principio. Devuelve lo necesario para deshacerlo si el código no existe.
     */
    vincular(codigo) {
      const antes = { codigo: st.codigo, creador: st.creador, cursor: st.cursor, pend: [...st.pend] };
      st.codigo = codigo;
      st.creador = false;
      st.cursor = 0;
      st.pend = st.ops.map((o) => o.i);
      guardar();
      return () => { Object.assign(st, antes); guardar(); };
    },

    /** Empezar de cero: registro vacío, sin código (este aparato deja de estar unido a los otros). */
    reiniciar() {
      const dev = st.dev;
      const n = st.n;
      st = { ...vacio(rnd), dev, n };
      ids = new Set();
      guardar();
    },

    /** Cambia la parte local (ajustes del aparato, examen a medias) y guarda. */
    cambiarLocal(fn) { fn(st.local); guardar(); },

    /**
     * Escucha: 'nuevas' (han llegado operaciones de otros aparatos: el almacén vuelve a plegar) o 'agregadas' (este
     * aparato ha apuntado operaciones: el motor programa una subida).
     */
    on(evento, f) { oyentes[evento].add(f); return () => oyentes[evento].delete(f); },

    /**
     * Otra pestaña ha guardado (`raw` = el valor nuevo de CLAVE_SYNC). Une y devuelve true si algo ha cambiado aquí.
     */
    deFuera(raw) {
      let x;
      try { x = JSON.parse(raw); } catch { return false; }
      if (!x || x.v !== 1 || !Array.isArray(x.ops)) return false;
      if (x.epoca !== st.epoca) { // la otra pestaña empezó de cero o es más nueva: manda la suya
        st = x; st.pend ??= []; st.local ??= { settings: {} }; ids = new Set(st.ops.map((o) => o.i));
        return true;
      }
      const suyas = new Set(x.ops.map((o) => o.i));
      const antes = st.ops.length;
      const unidas = unirOps(st.ops, x.ops);
      const faltabanAlli = st.ops.some((o) => !suyas.has(o.i));
      st.ops = unidas;
      ids = new Set(unidas.map((o) => o.i));
      st.n = Math.max(st.n, x.n ?? 0);
      // Pendientes: lo que la otra pestaña ya subió deja de estarlo allí; aquí se queda lo nuestro que ella no conocía.
      const pendSuyas = new Set(x.pend ?? []);
      st.pend = [...new Set([...(x.pend ?? []), ...st.pend.filter((i) => !suyas.has(i) || pendSuyas.has(i))])];
      const cambiaCodigo = x.codigo !== st.codigo;
      if (cambiaCodigo) { st.codigo = x.codigo; st.creador = x.creador; st.cursor = x.cursor ?? 0; } else st.cursor = Math.max(st.cursor, x.cursor ?? 0);
      st.local = x.local ?? st.local;
      if (faltabanAlli) guardar();
      return unidas.length !== antes || cambiaCodigo;
    },
  };
  function avisar(evento) { for (const f of oyentes[evento]) { try { f(); } catch { /* nada */ } } }
  return reg;
}
