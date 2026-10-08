// Efectos que acompañan al estudio (docs/EFECTOS.md): sonido y vibración opcionales (los dos apagados por defecto, en
// Ajustes) y el recuerdo de qué faros, rangos e insignias ya se han visto, para animar solo el cambio y no cada visita.
// Nunca tocan la lógica: ni respuestas, ni dominio, ni repaso, ni «¿Estás listo?», ni la travesía.

import { crearMotor, sonidoDe, hayAudio } from '../audio/efectos.js';
import { quieto } from './movimiento.js';

/** Patrones de vibración (ms; navigator.vibrate). Cortos y suaves: confirman, no avisan. */
export const PATRONES = { acierto: 12, fallo: [6, 70, 6], faro: [18, 90, 18], rango: [18, 90, 18, 90, 30], guardia: null };

/** Ajustes de los efectos y su valor por defecto (todo apagado). */
export const AJUSTES_EFECTOS = { sonidos: false, vibracion: false };

let ajustes = () => ({});
let ocupado = () => false;
let motor = null;
let nav = globalThis.navigator;

/**
 * Conecta los efectos con el almacén de ajustes y con lo que ya está sonando (la voz del profe, la radio): mientras
 * suena otra cosa, los efectos callan. Todo inyectable para los tests.
 */
export function configurarEfectos({ settings, estaOcupado, motor: m, navegador } = {}) {
  if (settings) ajustes = settings;
  if (estaOcupado) ocupado = estaOcupado;
  if (m !== undefined) motor = m;
  if (navegador !== undefined) nav = navegador;
}

const conMotor = () => (motor ??= crearMotor());
export const sonidosActivos = () => ajustes()?.sonidos === true;
export const vibracionActiva = () => ajustes()?.vibracion === true;

/** ¿Este navegador puede vibrar? (Safari de iPhone no) */
export const soportaVibracion = (n = nav) => typeof n?.vibrate === 'function';
/** ¿Este navegador puede sintetizar sonido? */
export const soportaSonido = () => hayAudio();

/**
 * Prepara el sonido: crea o reanuda el AudioContext. Solo dentro de un gesto del usuario (un toque, una tecla).
 * @returns {boolean}
 */
export function desbloquearSonido() {
  if (!sonidosActivos()) return false;
  try { return conMotor().desbloquear(); } catch { return false; }
}

/**
 * Escucha el primer gesto del usuario para crear el AudioContext (antes no se puede: política de reproducción
 * automática). Si los sonidos están apagados no crea nada; el interruptor de Ajustes lo crea al encenderlos.
 */
export function escucharPrimerGesto(doc = globalThis.document) {
  if (!doc?.addEventListener) return;
  const alGesto = () => { if (sonidosActivos() && desbloquearSonido() && motor?.listo) quitar(); };
  const quitar = () => { for (const ev of ['pointerdown', 'keydown']) doc.removeEventListener(ev, alGesto, true); };
  for (const ev of ['pointerdown', 'keydown']) doc.addEventListener(ev, alGesto, true);
}

/** Toca el sonido de un efecto (si están activados y no suena la voz del profe). */
export function sonar(nombre, { retraso = 0 } = {}) {
  if (!sonidosActivos()) return false;
  let callado = false;
  try { callado = ocupado(); } catch { /* sin datos: no calla */ }
  if (callado) return false;
  const s = sonidoDe(nombre);
  if (!s) return false;
  try { return conMotor().tocar(s, retraso); } catch { return false; }
}

/** Vibra con el patrón de un efecto (si está activada y el aparato puede). Sin soporte, no hace nada (ni falla). */
export function vibrar(nombre) {
  if (!vibracionActiva() || !soportaVibracion()) return false;
  const p = PATRONES[nombre];
  if (!p) return false;
  try { return nav.vibrate(p) !== false; } catch { return false; }
}

/** Un efecto completo: su sonido y su vibración. Devuelve qué ha hecho (para los tests y el agente). */
export function efecto(nombre, o = {}) {
  return { sonido: sonar(nombre, o), vibracion: vibrar(nombre) };
}

/** Al corregir una respuesta: tic al acertar; al fallar, un toque neutro muy bajo. */
export const respuesta = (ok) => efecto(ok ? 'acierto' : 'fallo');

// --- animar solo el cambio --------------------------------------------------------------------------------------------

const CLAVE_VISTOS = 'nautica.efectos.vistos.v1';
let almacen = null;
const guardado = () => {
  if (almacen) return almacen;
  try { return globalThis.localStorage ?? null; } catch { return null; }
};
/** Para los tests: otro almacén (un objeto con getItem/setItem). */
export function fijarAlmacenVistos(a) { almacen = a; }

function leerVistos() {
  try { const raw = guardado()?.getItem(CLAVE_VISTOS); const v = raw ? JSON.parse(raw) : {}; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; }
}
function escribirVistos(v) { try { guardado()?.setItem(CLAVE_VISTOS, JSON.stringify(v)); } catch { /* sin almacén: se anima como la primera vez */ } }

/**
 * Lo que es nuevo en `ambito` respecto a la última vez que se vio (y lo apunta como visto). `ids` = lo que está ahora
 * (los faros encendidos, p. ej.). La primera vez que se ve un ámbito no hay nada nuevo (no se anima todo de golpe),
 * salvo con `primeraVezTodo` (el parte de una sesión: todo lo que trae es un cambio).
 * Es cosa de este aparato (localStorage aparte del progreso): no viaja en la copia ni cambia ningún cálculo.
 * @returns {string[]}
 */
export function novedades(ambito, ids, { primeraVezTodo = false } = {}) {
  const v = leerVistos();
  const antes = Array.isArray(v[ambito]) ? v[ambito] : null;
  const nuevos = antes ? ids.filter((id) => !antes.includes(id)) : primeraVezTodo ? [...ids] : [];
  v[ambito] = [...new Set(ids)];
  escribirVistos(v);
  return nuevos;
}

/**
 * Apunta `ids` como vistos en `ambito` sin quitar lo que ya hubiera (el parte avisa a la carta de la Travesía de que ese
 * faro ya se encendió delante del alumno). Si el ámbito aún no existe no hace nada: su primera visita lo crea entero.
 */
export function marcarVistos(ambito, ids) {
  const v = leerVistos();
  if (!Array.isArray(v[ambito])) return;
  v[ambito] = [...new Set([...v[ambito], ...ids])];
  escribirVistos(v);
}

/** La clase de una animación de cambio, o '' con «reducir movimiento» (entonces el cambio se ve, pero quieto). */
export const claseAnimada = (clase) => (quieto() ? '' : clase);
