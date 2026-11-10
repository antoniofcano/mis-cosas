// Tu convocatoria (R-44): hora y sede del examen y el enlace a la página de tu tribunal, que se suman a la fecha que ya
// se guarda en Ajustes (`examen_<tit>`), y el recordatorio de «las listas de admitidos». Funciones puras, sin DOM ni
// reloj propio: el día de hoy entra siempre como `hoy` ('AAAA-MM-DD', día local) o `ahora` (milisegundos).
//
// Qué se guarda y dónde (docs/SYNC.md):
//   convocatoria_<tit> = { para, hora, sede, enlace, admitidos }   ajuste compartido entre aparatos (prefijo en
//                                                                  src/store/sync/operaciones.js)
//     para       'AAAA-MM-DD'  fecha del examen para la que se escribió (decide cuándo es «otra convocatoria»)
//     hora       'HH:MM'       opcional
//     sede       texto libre   opcional (≤ 120 caracteres)
//     enlace     'https://…'   opcional: página de la convocatoria de su tribunal (si no, la de la ficha del eje)
//     admitidos  'AAAA-MM-DD'  el día en que marcó «ya he comprobado que estoy en la lista de admitidos»
//
// Una convocatoria nueva (la fecha del examen cambia cuando la anterior ya pasó) reinicia hora, sede y lo de admitidos;
// el enlace se conserva (suele ser la misma página de un año a otro). Si la fecha cambia ANTES del examen (el tribunal la
// movió, o se había escrito mal), nada se reinicia.

import { diasHasta } from './plan.js';
import { diaISO } from '../texto.js';

export const claveConvocatoria = (tit) => `convocatoria_${tit}`;
/** Semanas antes del examen desde las que se recuerda comprobar la lista de admitidos (3 semanas). */
export const DIAS_ADMITIDOS = 21;
export const MAX_SEDE = 120;
export const MAX_ENLACE = 300;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const esObj = (x) => x != null && typeof x === 'object' && !Array.isArray(x);

/** Hora válida 'HH:MM' (la de <input type="time">) o null. */
export const horaValida = (x) => (typeof x === 'string' && HORA.test(x) ? x : null);

/** Enlace válido: solo http(s) (nunca `javascript:` ni `data:`), sin espacios y de longitud razonable; null si no. */
export function enlaceValido(x) {
  if (typeof x !== 'string') return null;
  const t = x.trim();
  if (!t || t.length > MAX_ENLACE || /\s/.test(t)) return null;
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch { return null; }
}

/** Texto libre de la sede: una línea, sin espacios de más, recortada. */
export const sedeValida = (x) => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, MAX_SEDE) || null : null);

/** El ajuste guardado, normalizado: { para, hora, sede, enlace, admitidos } (lo que no vale, null). */
export function leerConvocatoria(v) {
  const a = esObj(v) ? v : {};
  return {
    para: ISO.test(a.para ?? '') ? a.para : null,
    hora: horaValida(a.hora),
    sede: sedeValida(a.sede),
    enlace: enlaceValido(a.enlace),
    admitidos: ISO.test(a.admitidos ?? '') ? a.admitidos : null,
  };
}

/**
 * ¿Sigue valiendo lo guardado para la fecha de examen de hoy? Valía para `para`:
 *  - sin `para` (se guardó sin fecha de examen): vale;
 *  - misma fecha: vale;
 *  - otra fecha: vale si el examen para el que se guardó aún no había pasado (la fecha se corrigió o el tribunal la movió);
 *    si ya había pasado, es otra convocatoria y no vale.
 * @param {string|null} para  fecha para la que se guardó
 * @param {string|null} fechaExamen  la fecha del examen que hay ahora en Ajustes
 * @param {string} hoy  'AAAA-MM-DD'
 */
export function vigente(para, fechaExamen, hoy) {
  if (!para) return true;
  if (fechaExamen && para === fechaExamen) return true;
  return para >= hoy;
}

/**
 * La convocatoria que cuenta hoy: lo guardado, con hora, sede y «admitidos» reiniciados si es de una convocatoria que ya
 * pasó. El enlace siempre se conserva.
 */
export function convocatoriaVigente(v, { fechaExamen = null, hoy }) {
  const c = leerConvocatoria(v);
  return vigente(c.para, fechaExamen, hoy) ? c : { para: null, hora: null, sede: null, enlace: c.enlace, admitidos: null };
}

/**
 * Cambia campos de la convocatoria y devuelve lo que se guarda (siempre con `para` = la fecha del examen de hoy). Los
 * campos que no se nombran se conservan (los de una convocatoria pasada ya vienen reiniciados). Un valor vacío o no válido
 * borra el campo.
 * @param {object} v  el ajuste guardado
 * @param {{ hora?: string|null, sede?: string|null, enlace?: string|null, admitidos?: string|null }} cambios
 */
export function cambiarConvocatoria(v, cambios, { fechaExamen = null, hoy }) {
  const c = convocatoriaVigente(v, { fechaExamen, hoy });
  const n = { ...c, para: fechaExamen && ISO.test(fechaExamen) ? fechaExamen : c.para };
  if ('hora' in cambios) n.hora = horaValida(cambios.hora);
  if ('sede' in cambios) n.sede = sedeValida(cambios.sede);
  if ('enlace' in cambios) n.enlace = enlaceValido(cambios.enlace);
  if ('admitidos' in cambios) n.admitidos = ISO.test(cambios.admitidos ?? '') ? cambios.admitidos : null;
  return n;
}

/** ¿Hay algo guardado que se pueda borrar? (hora, sede, enlace propio o lo de admitidos) */
export const hayDatos = (c) => !!(c.hora || c.sede || c.enlace || c.admitidos);

/**
 * El enlace a enseñar: el que puso el alumno o, si no, la página oficial de la ficha del eje (`ficha.fuente`).
 * @returns {{ url: string, propio: boolean, oficial: boolean } | null}
 */
export function enlaceConvocatoria(c, ficha = null) {
  if (c?.enlace) return { url: c.enlace, propio: true, oficial: false };
  const oficial = enlaceValido(ficha?.fuente);
  return oficial ? { url: oficial, propio: false, oficial: true } : null;
}

/** «10:30» → «10:30 h»; sin hora, null. */
export const horaTexto = (c) => (c?.hora ? `${c.hora} h` : null);

/**
 * El recordatorio de las listas de admitidos para Hoy: desde `DIAS_ADMITIDOS` días antes de la fecha hasta el día antes
 * del examen, mientras no se haya marcado como hecho. La app no puede consultar el boletín (no hay servidor que lo haga):
 * solo recuerda y enseña el enlace guardado. Con la fecha orientativa (no es una convocatoria) no se recuerda nada.
 * @returns {{ mostrar: boolean, dias: number|null, hecho: boolean }}
 */
export function recordatorioAdmitidos({ fechaExamen = null, orientativa = false, convocatoria = null, ahora, desde = DIAS_ADMITIDOS }) {
  const dias = fechaExamen ? diasHasta(fechaExamen, ahora) : null;
  const hecho = !!convocatoriaVigente(convocatoria, { fechaExamen, hoy: diaISO(ahora) }).admitidos;
  const enVentana = dias != null && !orientativa && dias >= 1 && dias <= desde;
  return { mostrar: enVentana && !hecho, dias, hecho };
}

/**
 * Cuándo se ve cada cosa en Hoy, según los días que faltan (`null` sin fecha o con fecha orientativa):
 *  - 'semana': la semana del examen (≤ 7 días): hora y sede a la vista y acceso a la lista;
 *  - 'vispera': mañana (1 día): lista y repaso exprés;
 *  - 'dia': hoy es el examen: lista.
 */
export function momentoExamen({ fechaExamen = null, orientativa = false, ahora }) {
  if (!fechaExamen || orientativa) return null;
  const d = diasHasta(fechaExamen, ahora);
  if (d == null || d < 0 || d > 7) return null;
  return d === 0 ? 'dia' : d === 1 ? 'vispera' : 'semana';
}
