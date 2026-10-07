// Configuración del profesor: un fichero JSON que un profesor prepara en «Modo profesor» y comparte con sus alumnos.
// Cambia, SOLO para quien lo importa, la ruta del curso (orden e intercalado de las clases), las reglas para recordar y
// la chuleta de las clases. Nunca cambia los datos por defecto de la app.
//
// Es el ÚNICO sitio donde la configuración se aplica sobre los datos (las funciones `aplicar…`); src/bancos/index.js
// las llama al cargar el curso y las reglas. Funciones puras, sin DOM.
//
// Seguridad: el fichero viene de fuera. Se valida con un esquema estricto (claves conocidas, tipos y tamaños), no se
// ejecuta nada y todo el texto se limpia (sin caracteres de control) y se pinta siempre como texto, nunca como HTML.
//
// Formato (versión 1):
// { version: 1, autor, nombre, fecha: 'AAAA-MM-DD', tit?: 'per'|'py', ruta?: [idClase…],
//   reglas?: { añadir?: [{ regla, significado, tema? }], cambiar?: { idRegla: { regla?, significado? } }, quitar?: [idRegla] },
//   chuletas?: { idClase: 'una línea por punto\n…' } }

import { violacionesRuta, ordenRuta, idsRuta } from './ruta.js';
import { cuenta } from '../texto.js';

export const VERSION_CONFIG = 1;
/** Límites del fichero: lo bastante holgados para un curso entero y lo bastante cortos para no colgar la app. */
export const LIMITES = { bytes: 300_000, corto: 80, regla: 300, significado: 1500, linea: 300, lineas: 20, ruta: 400, reglas: 200, chuletas: 400 };
const TITS = ['per', 'py'];
const CLAVES = ['version', 'autor', 'nombre', 'fecha', 'tit', 'ruta', 'reglas', 'chuletas'];
const ID = /^[a-z0-9][a-z0-9-]{0,40}$/i;

const esObjeto = (x) => x != null && typeof x === 'object' && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;

/** Caracteres de control, de anchura cero y de dirección del texto (bidi): no se muestran nunca. */
const invisible = (c) => (c >= 0x7f && c <= 0x9f) || (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e) || (c >= 0x2066 && c <= 0x2069) || c === 0xfeff;
/** Texto limpio: sin caracteres de control (salvo saltos de línea si `lineas`), sin espacios sobrantes y recortado. */
export function sanearTexto(s, max = LIMITES.corto, { lineas = false } = {}) {
  if (typeof s !== 'string') return '';
  const sinControl = [...s.normalize('NFC')].map((ch) => (lineas && ch === '\n' ? ch : ch.codePointAt(0) < 0x20 ? ' ' : invisible(ch.codePointAt(0)) ? '' : ch)).join('');
  const limpio = lineas ? sinControl.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim() : sinControl.replace(/\s+/g, ' ').trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
}

/** Líneas de una chuleta escrita como texto (una por línea; se quitan viñetas «- » y «• » del principio). */
export function lineasChuleta(texto) {
  return sanearTexto(String(texto ?? ''), LIMITES.linea * LIMITES.lineas, { lineas: true }).split('\n')
    .map((l) => sanearTexto(l.replace(/^\s*[-•*]\s+/, ''), LIMITES.linea)).filter(Boolean).slice(0, LIMITES.lineas);
}

/**
 * Valida (estrictamente) y limpia una configuración. Lo que no se entiende es un error (el fichero no se usa); lo que
 * se entiende pero no existe en la app (una clase o una regla que no conocemos) es un aviso (se ignora esa parte).
 * @param {unknown} obj  lo leído del fichero
 * @param {{ cursos?: Record<string, object>, reglas?: object[] }} contexto  para avisar de ids desconocidos
 * @returns {{ ok: boolean, config: object|null, errores: string[], avisos: string[] }}
 */
export function validarConfig(obj, { cursos = null, reglas = null } = {}) {
  const errores = [];
  const avisos = [];
  if (!esObjeto(obj)) return { ok: false, config: null, errores: ['No es una configuración del profesor (tiene que ser un objeto JSON).'], avisos };
  for (const k of Object.keys(obj)) if (!CLAVES.includes(k)) errores.push(`Campo desconocido: «${sanearTexto(k, 30)}».`);
  if (obj.version !== VERSION_CONFIG) errores.push(`Versión no válida (tiene que ser ${VERSION_CONFIG}).`);
  const autor = sanearTexto(obj.autor);
  const nombre = sanearTexto(obj.nombre);
  if (!autor) errores.push('Falta el autor.');
  if (!nombre) errores.push('Falta el nombre de la configuración.');
  const fecha = typeof obj.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.fecha) ? obj.fecha : null;
  if (!fecha) errores.push('La fecha tiene que ir como AAAA-MM-DD.');
  let tit = null;
  if (obj.tit != null) { if (TITS.includes(obj.tit)) tit = obj.tit; else errores.push('La titulación tiene que ser «per» o «py».'); }
  const config = { version: VERSION_CONFIG, autor, nombre, fecha, ...(tit ? { tit } : {}) };

  // Ruta: lista de ids de clase (sin repetir).
  if (obj.ruta != null) {
    if (!Array.isArray(obj.ruta) || obj.ruta.length > LIMITES.ruta || !obj.ruta.every((x) => typeof x === 'string' && ID.test(x))) errores.push('La ruta tiene que ser una lista de clases (sus ids).');
    else if (new Set(obj.ruta).size !== obj.ruta.length) errores.push('La ruta repite una clase.');
    else config.ruta = [...obj.ruta];
  }

  // Reglas para recordar.
  if (obj.reglas != null) {
    const r = obj.reglas;
    if (!esObjeto(r) || Object.keys(r).some((k) => !['añadir', 'cambiar', 'quitar'].includes(k))) errores.push('«reglas» solo admite «añadir», «cambiar» y «quitar».');
    else {
      const out = { añadir: [], cambiar: {}, quitar: [] };
      if (r.añadir != null) {
        if (!Array.isArray(r.añadir) || r.añadir.length > LIMITES.reglas) errores.push('«reglas.añadir» tiene que ser una lista de reglas.');
        else r.añadir.forEach((x, i) => {
          if (!esObjeto(x) || Object.keys(x).some((k) => !['id', 'regla', 'significado', 'tema'].includes(k))) { errores.push(`Regla nueva ${i + 1}: formato no válido.`); return; }
          const regla = sanearTexto(x.regla, LIMITES.regla);
          const significado = sanearTexto(x.significado, LIMITES.significado);
          if (!regla) { errores.push(`Regla nueva ${i + 1}: falta el texto de la regla.`); return; }
          out.añadir.push({ id: `profe-${i + 1}`, regla, significado, tema: sanearTexto(x.tema, LIMITES.corto) || 'Reglas de tu profesor' });
        });
      }
      if (r.cambiar != null) {
        if (!esObjeto(r.cambiar) || Object.keys(r.cambiar).length > LIMITES.reglas) errores.push('«reglas.cambiar» tiene que ser un objeto { idRegla: { regla, significado } }.');
        else for (const [id, x] of Object.entries(r.cambiar)) {
          if (!ID.test(id) || !esObjeto(x) || Object.keys(x).some((k) => !['regla', 'significado'].includes(k))) { errores.push(`Cambio de la regla «${sanearTexto(id, 30)}»: formato no válido.`); continue; }
          const c = {};
          if (x.regla != null) c.regla = sanearTexto(x.regla, LIMITES.regla);
          if (x.significado != null) c.significado = sanearTexto(x.significado, LIMITES.significado);
          if (c.regla === '') { errores.push(`Cambio de la regla «${id}»: el texto no puede quedar vacío.`); continue; }
          out.cambiar[id] = c;
        }
      }
      if (r.quitar != null) {
        if (!Array.isArray(r.quitar) || r.quitar.length > LIMITES.reglas || !r.quitar.every((x) => typeof x === 'string' && ID.test(x))) errores.push('«reglas.quitar» tiene que ser una lista de ids de reglas.');
        else out.quitar = [...new Set(r.quitar)];
      }
      config.reglas = out;
    }
  }

  // Chuletas de las clases: { idClase: texto }.
  if (obj.chuletas != null) {
    if (!esObjeto(obj.chuletas) || Object.keys(obj.chuletas).length > LIMITES.chuletas) errores.push('«chuletas» tiene que ser un objeto { idClase: texto }.');
    else {
      config.chuletas = {};
      for (const [id, t] of Object.entries(obj.chuletas)) {
        if (!ID.test(id) || typeof t !== 'string') { errores.push(`Chuleta de «${sanearTexto(id, 30)}»: tiene que ser texto.`); continue; }
        const ls = lineasChuleta(t);
        if (ls.length) config.chuletas[id] = ls.join('\n');
      }
    }
  }
  if (errores.length) return { ok: false, config: null, errores, avisos };

  // Ids que la app no conoce: se avisan y esa parte no se aplica.
  if (cursos) {
    const clases = new Map(Object.entries(cursos).filter(([, c]) => c).flatMap(([t, c]) => idsClases(c).map((id) => [id, t])));
    const ruta = config.ruta ?? [];
    const fuera = ruta.filter((id) => !clases.has(id));
    if (fuera.length) avisos.push(`La ruta nombra ${cuenta(fuera.length, 'clase que no existe', 'clases que no existen')} (${fuera.slice(0, 5).join(', ')}): se saltan.`);
    const titsRuta = new Set(ruta.filter((id) => clases.has(id)).map((id) => clases.get(id)));
    if (titsRuta.size > 1) avisos.push('La ruta mezcla clases del PER y del PY: cada curso sigue las suyas.');
    if (tit && [...titsRuta].some((t) => t !== tit)) avisos.push(`La ruta tiene clases de otra titulación que la indicada (${tit.toUpperCase()}): se saltan.`);
    for (const t of titsRuta) {
      if (tit && t !== tit) continue;
      const v = problemasRutaConfig(config, cursos[t], t);
      if (v.length) avisos.push(`La ruta del ${t.toUpperCase()} no respeta lo que requiere cada clase (${v.slice(0, 3).map((x) => `${x.id} va antes de ${x.faltan.join(', ')}`).join('; ')}): se usará la ruta por defecto.`);
    }
    const chu = Object.keys(config.chuletas ?? {}).filter((id) => !clases.has(id));
    if (chu.length) avisos.push(`Hay ${cuenta(chu.length, 'chuleta', 'chuletas')} de clases que no existen (${chu.slice(0, 5).join(', ')}): se ignoran.`);
  }
  if (reglas && config.reglas) {
    const ids = new Set(reglas.map((r) => r.id));
    const raras = [...Object.keys(config.reglas.cambiar), ...config.reglas.quitar].filter((id) => !ids.has(id));
    if (raras.length) avisos.push(`Se cambian u ocultan ${cuenta(raras.length, 'regla que no existe', 'reglas que no existen')} (${raras.slice(0, 5).join(', ')}): se ignoran.`);
  }
  return { ok: true, config, errores, avisos };
}

/** Lee el texto de un fichero (o pegado) y lo valida. Nunca lanza: los problemas vuelven en `errores`. */
export function leerConfigTexto(texto, contexto = {}) {
  if (typeof texto !== 'string' || !texto.trim()) return { ok: false, config: null, errores: ['El fichero está vacío.'], avisos: [] };
  if (texto.length > LIMITES.bytes) return { ok: false, config: null, errores: ['El fichero es demasiado grande para ser una configuración.'], avisos: [] };
  let obj;
  try { obj = JSON.parse(texto.replace(/^﻿/, '')); } catch { return { ok: false, config: null, errores: ['No se entiende el fichero: no es JSON válido.'], avisos: [] }; }
  return validarConfig(obj, contexto);
}

const idsClases = (curso) => (curso?.modulos ?? []).flatMap((m) => m.lecciones.map((l) => l.id));
/** ¿Aplica la ruta de la configuración a este curso? Solo si es de su titulación y nombra alguna de sus clases. */
const rutaPara = (config, curso, tit) => {
  if (!config?.ruta || (config.tit && tit && config.tit !== tit)) return null;
  const propias = new Set(idsClases(curso));
  const ids = config.ruta.filter((id) => propias.has(id));
  return ids.length ? ids : null;
};

/** Clases de la ruta de la configuración que irían antes de las que requieren (ya con las que falten al final). */
export function problemasRutaConfig(config, curso, tit = null) {
  const ids = rutaPara(config, curso, tit);
  if (!ids) return [];
  return violacionesRuta(ordenRuta({ ...curso, ruta: ids }).map((l) => l.id), curso);
}

/**
 * El curso con la configuración del profesor encima: su ruta (si es de esta titulación y respeta `requiere`; si no,
 * la ruta por defecto) y las chuletas de las clases que cambia. Sin configuración, el mismo curso.
 */
export function aplicarConfigCurso(curso, config, tit = null) {
  if (!curso || !config) return curso;
  const ids = rutaPara(config, curso, tit);
  const ruta = ids && !problemasRutaConfig(config, curso, tit).length ? ids : curso.ruta;
  const chu = config.chuletas ?? {};
  const cambia = idsClases(curso).some((id) => chu[id]);
  if (ruta === curso.ruta && !cambia) return curso;
  return {
    ...curso, ruta,
    modulos: cambia ? curso.modulos.map((m) => ({ ...m, lecciones: m.lecciones.map((l) => (chu[l.id] ? { ...l, chuleta: chu[l.id].split('\n'), chuletaProfe: true } : l)) })) : curso.modulos,
  };
}

/** Reglas para recordar con la configuración encima: las cambiadas, sin las ocultas y con las nuevas al final. */
export function aplicarConfigReglas(reglas, config) {
  const r = config?.reglas;
  if (!r) return reglas;
  const quitar = new Set(r.quitar ?? []);
  return [
    ...reglas.filter((x) => !quitar.has(x.id)).map((x) => (r.cambiar?.[x.id] ? { ...x, ...r.cambiar[x.id], deProfe: true } : x)),
    ...(r.añadir ?? []).map((x) => ({ ...x, preguntas: [], deProfe: true })),
  ];
}

/** Lo mismo para las reglas que ayudan en una pregunta (el profe las cita al explicarla). */
export const aplicarConfigReglasDe = (lista, config) => (config?.reglas ? aplicarConfigReglas(lista, { reglas: { ...config.reglas, añadir: [] } }) : lista);

/** «Ruta de: …» (lo que se enseña, discreto, mientras la configuración está puesta). */
export const nombreConfig = (config) => (config ? `Ruta de: ${config.autor}` : null);

/**
 * Qué cambia la configuración, en frases cortas (para confirmar antes de usarla y para la vista previa).
 * @param {object} config  validada
 * @param {Record<string, object>} cursos  { per, py } con su ruta por defecto
 */
export function resumenConfig(config, cursos = {}) {
  const out = [];
  for (const [t, curso] of Object.entries(cursos)) {
    if (!curso) continue;
    const ids = rutaPara(config, curso, t);
    if (!ids) continue;
    const antes = ordenRuta(curso).map((l) => l.id);
    const despues = ordenRuta({ ...curso, ruta: ids }).map((l) => l.id);
    const movidas = despues.filter((id, i) => antes[i] !== id).length;
    const valida = !problemasRutaConfig(config, curso, t).length;
    out.push(!valida ? `Ruta del ${t.toUpperCase()}: no respeta lo que requiere cada clase; se seguirá la ruta por defecto.`
      : movidas ? `Ruta del ${t.toUpperCase()}: cambia de sitio ${cuenta(movidas, 'clase', 'clases')} (de ${despues.length}).` : `Ruta del ${t.toUpperCase()}: la misma que la de por defecto.`);
  }
  const r = config.reglas;
  if (r) {
    const partes = [[r.añadir?.length ?? 0, 'añade', 'regla nueva', 'reglas nuevas'], [Object.keys(r.cambiar ?? {}).length, 'cambia', 'regla', 'reglas'], [r.quitar?.length ?? 0, 'oculta', 'regla', 'reglas']]
      .filter(([n]) => n).map(([n, v, uno, varios]) => `${v} ${cuenta(n, uno, varios)}`);
    if (partes.length) out.push(`Reglas para recordar: ${partes.join(', ')}.`);
  }
  const todas = new Set(Object.values(cursos).flatMap((c) => idsClases(c)));
  const chu = Object.keys(config.chuletas ?? {}).filter((id) => todas.has(id)).length;
  if (chu) out.push(`Chuletas: cambia la de ${cuenta(chu, 'clase', 'clases')}.`);
  if (!out.length) out.push('No cambia nada de lo que hay ahora.');
  return out;
}

/**
 * Configuración lista para exportar a partir de lo editado en el modo profesor (se valida al final: lo que se
 * comparte cumple el mismo esquema que lo que se importa).
 */
export function crearConfig({ autor, nombre, tit = null, ruta = null, reglas = null, chuletas = null, fecha }) {
  const obj = { version: VERSION_CONFIG, autor, nombre, fecha, ...(tit ? { tit } : {}) };
  if (ruta?.length) obj.ruta = idsRuta(ruta);
  if (reglas && ((reglas.añadir?.length ?? 0) + Object.keys(reglas.cambiar ?? {}).length + (reglas.quitar?.length ?? 0))) {
    obj.reglas = { añadir: (reglas.añadir ?? []).map(({ regla, significado, tema }) => ({ regla, significado, ...(tema ? { tema } : {}) })), cambiar: reglas.cambiar ?? {}, quitar: reglas.quitar ?? [] };
  }
  if (chuletas && Object.keys(chuletas).length) obj.chuletas = { ...chuletas };
  return validarConfig(obj);
}
