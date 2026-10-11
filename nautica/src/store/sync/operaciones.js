// Operaciones del registro de progreso (docs/SYNC.md): cada escritura del almacén (src/store/progress.js) se apunta como
// una operación pequeña, con un id único, que se guarda en el aparato y se sube al servidor. El progreso que ve la app
// sale de plegar todas las operaciones (plegar.js). Este módulo dice qué operaciones existen, cómo se validan (lo usan
// el cliente y el Worker de sync-worker/, que valida lo mismo) y qué ajustes se comparten entre aparatos.
//
// Formato (claves de una letra: el registro de un alumno puede tener decenas de miles):
//   { i: id, k: tipo, t: instante (ms), ...campos del tipo }
//   r  respuesta a una pregunta de examen   q: pregunta · c: opción elegida o null («No la sé») · o: acierto
//                                           d: día local 'YYYY-MM-DD' de la respuesta · n: true si era del test de nivel
//   e  intento de un ejercicio generado     y: tipo · o: acierto · s: semilla · m: errores típicos (lista)
//   v  valor con nombre (gana el último)    c: colección · p: ruta (1 o 2 claves) · v: valor (sin v = borrar)
//   a  minutos de estudio                   d: día local · m: minutos
//   x  test completo (simulacro o examen)   e: el registro del test
//   g  travesía de un banco                 b: 'eje/tit' · r: rango · s: insignias { id: ISO }
//   b  base (trozo del progreso que había)  g: grupo (una base = varios trozos) · c: nº de trozo · h: instante de los
//                                           datos · p: trozo del progreso con su misma forma

export const TIPOS = ['r', 'e', 'v', 'a', 'x', 'g', 'b'];

/** Colecciones de las operaciones `v` y cuántas claves lleva su ruta. */
export const COLECCIONES = { lecciones: 1, niveles: 1, planes: 1, fichas: 2, repConceptos: 2, settings: 1 };

/** Tamaño máximo de una operación (JSON, bytes). Una base se trocea por debajo de esto. */
export const MAX_OP = 64 * 1024;
/** Tamaño objetivo de cada trozo de una base. */
export const TROZO_BASE = 40 * 1024;
/** Primer instante aceptado (antes no existía la app) y margen hacia el futuro (relojes adelantados). */
export const T_MIN = Date.UTC(2024, 0, 1);
export const MARGEN_FUTURO = 2 * 864e5;

/**
 * Ajustes que se comparten entre los aparatos del alumno (lista blanca): lo que dice cómo y para cuándo estudia.
 * Todo lo demás es del aparato y no sale de él: letra, sonidos, vibración, voz, velocidad del podcast, avisos
 * descartados, cuándo se guardó la última copia, si el navegador protege los datos, la capa de la carta, la sesión de
 * hoy a medias, el test de nivel a medias, el borrador del modo profesor…
 */
export const AJUSTES_COMPARTIDOS = ['level', 'toleranceFactor', 'minutosDia', 'diasEstudio', 'eje', 'onboarded', 'segTarjeta', 'configProfe', 'podcasts', 'podcastUltimo'];
export const PREFIJOS_COMPARTIDOS = ['examen_', 'examenOrientativo_', 'guiaVista_', 'planEsencial_', 'mezclado_', 'reserva_', 'chuletasLeidas_', 'nivelNo_'];
/** Ajustes en los que gana el PRIMER valor, no el último: la reserva del examen final se fija una vez y no cambia. */
export const PREFIJOS_PRIMERO = ['reserva_'];

export const esAjusteCompartido = (k) => AJUSTES_COMPARTIDOS.includes(k) || PREFIJOS_COMPARTIDOS.some((p) => k.startsWith(p));

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9]{4,16}\.[a-z0-9]{1,10}\.[a-z0-9]{1,8}$/;
const CLAVE_RE = /^[\w\-./:]{1,120}$/u;
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
const bytes = (s) => (typeof TextEncoder === 'function' ? new TextEncoder().encode(s).length : s.length * 3);

/** Dispositivo de una operación (lo que va antes del primer punto del id). */
export const dispositivoDe = (id) => String(id).split('.')[0];

/** Id de operación: «<aparato>.<contador en base 36>.<azar>». El contador nunca se repite en un aparato. */
export const idOperacion = (dispositivo, n, azar) => `${dispositivo}.${n.toString(36)}.${azar}`;

/** Id de aparato al azar (10 símbolos [a-z0-9]). */
export function idAleatorio(largo = 10, rnd = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n))) {
  const A = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  while (s.length < largo) for (const b of rnd(largo * 2)) { if (b < 252 && s.length < largo) s += A[b % 36]; }
  return s;
}

/**
 * Valida una operación. `ahora` sirve para rechazar instantes del futuro.
 * @returns {string|null}  null si vale; si no, el motivo (corto, sin datos del alumno)
 */
export function validarOperacion(op, ahora = Date.now()) {
  if (!esObj(op)) return 'no-es-objeto';
  if (typeof op.i !== 'string' || !ID_RE.test(op.i)) return 'id';
  if (!TIPOS.includes(op.k)) return 'tipo';
  if (!Number.isSafeInteger(op.t) || op.t < T_MIN || op.t > ahora + MARGEN_FUTURO) return 'instante';
  let json;
  try { json = JSON.stringify(op); } catch { return 'json'; }
  if (bytes(json) > MAX_OP) return 'tamano';
  const permitidas = { r: 'iktqcodn', e: 'iktyosm', v: 'iktcpv', a: 'iktdm', x: 'ikte', g: 'iktbrs', b: 'iktgchp' }[op.k];
  if (Object.keys(op).some((k) => k.length !== 1 || !permitidas.includes(k))) return 'campos';
  const texto = (x, max = 120) => typeof x === 'string' && x.length > 0 && x.length <= max;
  switch (op.k) {
    case 'r':
      if (!texto(op.q, 160)) return 'pregunta';
      if (!(op.c === null || texto(op.c, 16))) return 'opcion';
      if (typeof op.o !== 'boolean') return 'acierto';
      if (!DIA_RE.test(op.d ?? '')) return 'dia';
      if (op.n !== undefined && op.n !== true) return 'nivel';
      return null;
    case 'e':
      if (!texto(op.y, 120)) return 'ejercicio';
      if (typeof op.o !== 'boolean') return 'acierto';
      if (!(op.s == null || Number.isFinite(op.s) || texto(op.s, 64))) return 'semilla';
      if (!Array.isArray(op.m) || op.m.length > 30 || !op.m.every((x) => texto(x, 120))) return 'errores';
      return null;
    case 'v': {
      const n = COLECCIONES[op.c];
      if (!n || !Object.hasOwn(COLECCIONES, op.c)) return 'coleccion';
      if (!Array.isArray(op.p) || op.p.length !== n || !op.p.every((x) => typeof x === 'string' && CLAVE_RE.test(x))) return 'ruta';
      return null;
    }
    case 'a':
      if (!DIA_RE.test(op.d ?? '')) return 'dia';
      if (!Number.isInteger(op.m) || op.m < 0 || op.m > 1440) return 'minutos';
      return null;
    case 'x':
      if (!esObj(op.e)) return 'test';
      return null;
    case 'g':
      if (typeof op.b !== 'string' || !CLAVE_RE.test(op.b)) return 'banco';
      if (!(op.r === null || texto(op.r, 40))) return 'rango';
      if (!esObj(op.s) || Object.keys(op.s).length > 100 || !Object.entries(op.s).every(([k, v]) => CLAVE_RE.test(k) && texto(v, 40))) return 'insignias';
      return null;
    case 'b':
      if (typeof op.g !== 'string' || !ID_RE.test(op.g)) return 'grupo';
      if (!Number.isInteger(op.c) || op.c < 0 || op.c > 10000) return 'trozo';
      if (!Number.isSafeInteger(op.h) || op.h < 0 || op.h > ahora + MARGEN_FUTURO) return 'hasta';
      if (!esObj(op.p)) return 'progreso';
      return null;
    default:
      return 'tipo';
  }
}
