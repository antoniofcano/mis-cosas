// Motor de bancos: el único sitio que sabe dónde y cómo están guardados los bancos de preguntas.
// Cada eje (administración examinadora: Andalucía, DGMM…) tiene su banco por titulación en data/ejes/<eje>/
// (formato en docs/BANCOS.md). El resto de la app pide «el banco de este eje y esta titulación» y no conoce ni
// ficheros ni ids concretos. Los ejes nunca se mezclan; el curso (las clases) es nacional y único.
//
// crearBancos(leer) recibe cómo leer un JSON por su ruta relativa a la raíz de la app: en el navegador, fetch; en
// los tests, el sistema de ficheros. Las cargas se cachean (una promesa por fichero).

import { TITULACIONES } from '../theory/blocks.js';
import { convocatorias as convocatoriasDe, convDeClave } from '../theory/engine.js';
import { compilarVocabulario } from '../theory/vocabulario.js';
import { resueltasSegun } from '../course/resueltos.js';
import { SOLUCIONES } from './soluciones.js';
import { EJE_POR_DEFECTO } from './registro.js';

export { EJE_POR_DEFECTO, SOLUCIONES };

/** ¿La pregunta entra en una lista? Filtros: `requiere` (lo necesita) y `sinRequiere` (no lo necesita). */
const enLista = (l, q) => (!l.requiere || q.requiere.includes(l.requiere)) && (!l.sinRequiere || !q.requiere.includes(l.sinRequiere));

/** Curso de una titulación con la práctica de cada clase sacada del banco del eje (función pura). */
export function cursoConPractica(curso, banco) {
  if (!curso) return null;
  return { ...curso, modulos: curso.modulos.map((m) => ({ ...m, lecciones: m.lecciones.map((l) => ({ ...l, practica: banco.practicaDe(l.id) })) })) };
}

/**
 * @param {(ruta: string) => Promise<any>} leer  JSON de una ruta relativa a la raíz de la app (data/…)
 */
export function crearBancos(leer) {
  const cache = new Map();
  const memo = (k, f) => {
    if (!cache.has(k)) cache.set(k, f());
    return cache.get(k);
  };
  const fichas = new Map(); // fichas ya cargadas, para las consultas síncronas (rutaResolucion)

  /** Registro de ejes (data/ejes/index.json). */
  const registro = () => memo('registro', () => leer('data/ejes/index.json').then((d) => d.ejes ?? []));
  /** Ejes que se ofrecen a los alumnos. */
  const ejesPublicados = async () => (await registro()).filter((e) => e.estado === 'publicado');
  /** El eje pedido si existe; si no, el de por defecto. */
  const resolverEje = async (eje) => ((await registro()).some((e) => e.id === eje) ? eje : EJE_POR_DEFECTO);

  /** Ficha del eje (data/ejes/<eje>/eje.json). */
  const cargarFicha = (eje) => memo(`ficha:${eje}`, () => leer(`data/ejes/${eje}/eje.json`).then((f) => { fichas.set(eje, f); return f; }));
  /** Titulaciones que tiene el banco de un eje. */
  const titsDe = (ficha) => Object.keys(ficha.examen ?? {}).filter((t) => TITULACIONES[t]);

  /** Reglas nemotécnicas (comunes a todos los ejes) y, para cada pregunta, las que le ayudan. */
  const cargarMnemotecnias = () => memo('mnemo', async () => {
    const d = await leer('data/comun/mnemotecnias.json').catch(() => ({ reglas: [] }));
    const byQ = new Map();
    for (const r of d.reglas) for (const id of r.preguntas ?? []) byQ.set(id, [...(byQ.get(id) ?? []), r]);
    return { reglas: d.reglas, reglasDe: (id) => byQ.get(id) ?? [] };
  });

  /** Vocabulario para tocar en las preguntas. El de Yate incluye el del PER (se da por sabido); su matiz manda. */
  const cargarVocabulario = (tit = 'per') => memo(`vocab:${tit}`, async () => {
    const listas = await Promise.all((tit === 'py' ? ['per', 'py'] : ['per']).map((t) => leer(`data/comun/vocabulario-${t}.json`).then((d) => d.terminos ?? []).catch(() => [])));
    const porId = new Map();
    for (const t of listas.flat()) porId.set(t.id, t);
    return compilarVocabulario([...porId.values()]);
  });

  /** Curso nacional de una titulación, tal cual (sin práctica); null si aún no existe. */
  const cargarCursoBase = (tit) => memo(`curso:${tit}`, () => leer(`data/curso/${tit}.json`).catch(() => null));

  /**
   * Banco de un eje para una titulación.
   * - todas: todas sus preguntas; porId: id → pregunta.
   * - estudio: las que se usan para estudiar (práctica, tandas, simulacros, exámenes de convocatorias);
   *   final: las reservadas para el examen final (ficha.reserva). En modo «examen» se reservan convocatorias
   *   (no se ofrecen como examen, pero sus preguntas siguen en la práctica); en modo «pregunta», además, sus
   *   preguntas salen de toda la práctica.
   * - convocatorias(): exámenes reales que se ofrecen [{ key, titulo, fecha, n, completa }].
   * - practicaDe(leccionId): preguntas de práctica de una clase; resueltasDe(leccionId): preguntas resueltas por la
   *   app del tipo de la clase («Míralo resuelto»).
   * - listas: listados de preguntas reales (p. ej. las de carta), con su título y descripción.
   */
  const bancoDe = (eje, tit) => memo(`banco:${eje}:${tit}`, async () => {
    const ficha = await cargarFicha(eje);
    const dir = `data/ejes/${eje}/${tit}`;
    const [datos, explicaciones, practica, resueltos, mnemo, vocab] = await Promise.all([
      leer(`${dir}/preguntas.json`), leer(`${dir}/explicaciones.json`).catch(() => ({})), leer(`${dir}/practica.json`).catch(() => ({})),
      leer(`${dir}/resueltos.json`).catch(() => ({})), cargarMnemotecnias(), cargarVocabulario(tit)]);
    const todas = datos.preguntas ?? [];
    const porId = new Map(todas.map((q) => [q.id, q]));
    const modo = ficha.reserva?.modo ?? 'examen';
    const reservadas = new Set(ficha.reserva?.[tit] ?? []);
    const final = reservadas.size ? todas.filter((q) => reservadas.has(q.conv) || (q.apareceEn ?? []).some((a) => reservadas.has(a.conv))) : [];
    const apartadas = modo === 'pregunta' ? new Set(final.map((q) => q.id)) : new Set();
    const estudio = apartadas.size ? todas.filter((q) => !apartadas.has(q.id)) : todas;
    const enEstudio = new Set(estudio.map((q) => q.id));
    const estructura = TITULACIONES[tit].estructura;
    const listas = (ficha.listas?.[tit] ?? [{ id: 'todas', titulo: datos.meta?.titulo ?? tit, descripcion: datos.meta?.descripcion ?? '' }])
      .map((l) => ({ ...l, preguntas: todas.filter((q) => enLista(l, q)) }));
    const banco = {
      eje: ficha, tit, meta: datos.meta ?? {}, todas, estudio, final, porId, explicaciones, reglasDe: mnemo.reglasDe, vocab, listas,
      convocatorias: () => convocatoriasDe(estructura, estudio).filter((c) => !reservadas.has(convDeClave(c.key))),
      practicaDe: (leccionId) => (practica[leccionId] ?? []).filter((id) => enEstudio.has(id)),
      resueltasDe: (leccionId) => resueltasSegun(resueltos[leccionId], SOLUCIONES, porId),
      lista: (id) => listas.find((l) => l.id === id) ?? null,
      /** La lista a la que pertenece una pregunta (la primera que la incluye). */
      listaDe: (q) => listas.find((l) => enLista(l, q)) ?? listas[0],
    };
    return banco;
  });
  /** Banco de un eje (si no existe, el de por defecto) para una titulación (si no existe, el PER). */
  const cargarBanco = (eje, tit) => resolverEje(eje).then((e) => bancoDe(e, TITULACIONES[tit] ? tit : 'per'));

  /** Curso de una titulación con la práctica del eje en cada clase (lo que usan el motor y las pantallas). */
  const cursoDe = (tit, eje) => memo(`cursoEje:${eje}:${tit}`, async () => {
    const [curso, banco] = await Promise.all([cargarCursoBase(tit), bancoDe(eje, tit)]);
    return cursoConPractica(curso, banco);
  });
  const cargarCurso = (tit, eje) => resolverEje(eje).then((e) => cursoDe(tit, e));

  /** Una pregunta por su id, sea del eje que sea (por el prefijo): { q, banco } o null. */
  async function pregunta(id) {
    const candidatos = (await registro()).filter((e) => String(id).startsWith(`${e.prefijo}-`)).sort((a, b) => b.prefijo.length - a.prefijo.length);
    for (const e of candidatos) {
      const ficha = await cargarFicha(e.id);
      for (const tit of titsDe(ficha)) {
        const banco = await bancoDe(e.id, tit);
        if (banco.porId.has(id)) return { q: banco.porId.get(id), banco };
      }
    }
    return null;
  }

  /** Dirección antigua de un banco (#/examenes/<fichero>) → { eje, tit, lista } (o null). */
  async function resolverLegado(fichero) {
    for (const e of await registro()) {
      const l = (await cargarFicha(e.id)).legado?.[fichero];
      if (l) return { eje: e.id, ...l };
    }
    return null;
  }

  /**
   * Ruta donde ver resuelta una pregunta (['q', id]) o null: las que tienen solución programada y las de una lista
   * de carta del eje (se pueden resolver sobre la carta aunque la app no traiga la solución).
   * Síncrona: la pregunta viene de un banco ya cargado.
   */
  function rutaResolucion(q) {
    if (!q) return null;
    if (SOLUCIONES[q.id]) return ['q', q.id];
    const listas = fichas.get(q.eje)?.listas?.[q.tit] ?? [];
    return listas.some((l) => l.requiere === 'carta') && q.requiere?.includes('carta') ? ['q', q.id] : null;
  }

  return { registro, ejesPublicados, resolverEje, cargarFicha, titsDe, cargarBanco, cargarCurso, cargarCursoBase, cargarMnemotecnias, cargarVocabulario, pregunta, resolverLegado, rutaResolucion };
}

// ---------------------------------------------------------------------------
// Instancia de la app (navegador): lee con fetch desde la raíz de la app.

const RAIZ = new URL('../../', import.meta.url);

function leerFetch(ruta) {
  return fetch(new URL(ruta, RAIZ)).then((r) => {
    if (!r.ok) throw new Error(`No se pudo cargar ${ruta} (${r.status})`);
    return r.json();
  });
}

/** URL de una figura de una pregunta (rutas relativas a la carpeta de su eje). */
export const urlFigura = (q, f) => new URL(`data/ejes/${q.eje}/${f}`, RAIZ).href;

export const bancos = crearBancos(leerFetch);
export const { registro, ejesPublicados, resolverEje, cargarFicha, cargarBanco, cargarCurso, cargarCursoBase, cargarMnemotecnias, cargarVocabulario, pregunta, resolverLegado, rutaResolucion } = bancos;
