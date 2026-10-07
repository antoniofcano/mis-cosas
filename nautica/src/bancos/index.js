// Motor de bancos: el único sitio que sabe dónde y cómo están guardados los bancos de preguntas.
// Cada eje (administración examinadora: Andalucía, DGMM…) tiene su banco por titulación en data/ejes/<eje>/
// (formato en docs/BANCOS.md). El resto de la app pide «el banco de este eje y esta titulación» y no conoce ni
// ficheros ni ids concretos. Los ejes nunca se mezclan; el curso (las clases) es nacional y único.
//
// crearBancos(leer) recibe cómo leer un JSON por su ruta relativa a la raíz de la app: en el navegador, fetch; en
// los tests, el sistema de ficheros. Las cargas se cachean (una promesa por fichero).

import { TITULACIONES } from '../theory/blocks.js';
import { convocatorias as convocatoriasDe, convDeClave, ordenEn } from '../theory/engine.js';
import { compilarVocabulario } from '../theory/vocabulario.js';
import { resueltasSegun } from '../course/resueltos.js';
import { SOLUCIONES } from './soluciones.js';
import { EJE_POR_DEFECTO } from './registro.js';
import { equivalenteEn } from './equivalentes.js';
import { validarConfig, aplicarConfigCurso, aplicarConfigReglas, aplicarConfigReglasDe } from '../course/config-profe.js';
import { RUTA_INDICE, rutaGrupo } from '../conceptos/catalogo.js';

export { EJE_POR_DEFECTO, SOLUCIONES };

/** ¿La pregunta entra en una lista? Filtros: `requiere` (lo necesita) y `sinRequiere` (no lo necesita). */
const enLista = (l, q) => (!l.requiere || q.requiere.includes(l.requiere)) && (!l.sinRequiere || !q.requiere.includes(l.sinRequiere));

/** Curso de una titulación con la práctica de cada clase sacada del banco del eje (función pura). */
export function cursoConPractica(curso, banco) {
  if (!curso) return null;
  return { ...curso, modulos: curso.modulos.map((m) => ({ ...m, lecciones: m.lecciones.map((l) => ({ ...l, practica: banco.practicaDe(l.id) })) })) };
}

/** El curso con su ruta por defecto (los tramos del fichero de ruta) en `ruta` (función pura). */
export const conRuta = (curso, ruta) => (curso ? { ...curso, ruta: ruta?.tramos ?? null } : null);

/** Convocatorias en las que sale una pregunta (la suya y las de apareceEn). */
const convsDe = (q) => new Set([q.conv, ...(q.apareceEn ?? []).map((a) => a.conv)]);

/**
 * Reparto de la reserva (función pura): `final` = las preguntas que salen en alguna convocatoria del examen final del
 * alumno (`res.convs`); `reservadas` = los ids que no se estudian. En modo «examen», las que solo salen en
 * convocatorias apartadas (`res.apartar`); en modo «pregunta», todas las que salen en alguna de ellas.
 * @param {object[]} todas
 * @param {{ modo: 'examen'|'pregunta', convs: string[], apartar: string[] }} res
 */
export function repartoReserva(todas, res) {
  const finalConvs = new Set(res.convs ?? []);
  const apartar = new Set(res.apartar ?? res.convs ?? []);
  const final = finalConvs.size ? todas.filter((q) => [...convsDe(q)].some((c) => finalConvs.has(c))) : [];
  const reservadas = new Set();
  if (apartar.size) {
    for (const q of todas) {
      const cs = [...convsDe(q)];
      if (res.modo === 'pregunta' ? cs.some((c) => apartar.has(c)) : cs.every((c) => apartar.has(c))) reservadas.add(q.id);
    }
  }
  return { final, reservadas };
}

/**
 * @param {(ruta: string) => Promise<any>} leer  JSON de una ruta relativa a la raíz de la app (data/…)
 */
export function crearBancos(leer) {
  const cache = new Map();
  // Dónde se guarda la foto de la reserva de cada alumno (la app la pone con fijarReservaAlumno; en Node no hay).
  let alumno = null;
  /**
   * La app indica cómo leer y guardar la foto de la reserva del alumno ({ convs, modo, desde } por eje y titulación,
   * en sus ajustes). Sin esto (herramientas, tests), la reserva es la de la ficha.
   * @param {{ leer: (eje, tit) => object|null, guardar: (eje, tit, foto) => void } | null} a
   */
  const fijarReservaAlumno = (a) => { alumno = a; };
  // Configuración del profesor que ha importado el alumno (la app pone de dónde leerla con fijarConfigProfe). Se aplica
  // aquí, encima de los datos por defecto ya cargados (que no cambian): el curso (ruta y chuletas) y las reglas.
  let leerConfig = () => null;
  const validadas = new WeakMap();
  /** La configuración activa, validada (se vuelve a validar al leerla: viene de los ajustes, que se pueden recuperar de una copia). */
  const configActiva = () => {
    const raw = leerConfig();
    if (!raw || typeof raw !== 'object') return null;
    if (!validadas.has(raw)) validadas.set(raw, validarConfig(raw).config);
    return validadas.get(raw);
  };
  /** @param {() => object|null} f  devuelve la configuración guardada (o null) */
  const fijarConfigProfe = (f) => { leerConfig = typeof f === 'function' ? f : () => null; };
  const conConfig = (curso, tit) => aplicarConfigCurso(curso, configActiva(), tit);
  const memo = (k, f) => {
    if (!cache.has(k)) cache.set(k, f());
    return cache.get(k);
  };
  const fichas = new Map(); // fichas ya cargadas, para las consultas síncronas (rutaResolucion)

  /** Registro de ejes (data/ejes/index.json). */
  const registro = () => memo('registro', () => leer('data/ejes/index.json').then((d) => d.ejes ?? []));
  /** Ejes que se ofrecen a los alumnos. */
  const ejesPublicados = async () => (await registro()).filter((e) => e.estado === 'publicado');
  /**
   * Ejes entre los que el alumno elige «dónde te examinas», con su ficha: los publicados, solo si hay más de uno (con
   * uno solo no hay nada que elegir: []). Los ejes sin banco publicado no aparecen nunca.
   */
  const ejesParaElegir = async () => {
    const pub = await ejesPublicados();
    if (pub.length < 2) return [];
    return Promise.all(pub.map(async (e) => ({ ...e, ficha: await cargarFicha(e.id).catch(() => null) })));
  };
  /** El eje pedido si existe; si no, el de por defecto. */
  const resolverEje = async (eje) => ((await registro()).some((e) => e.id === eje) ? eje : EJE_POR_DEFECTO);

  /** Ficha del eje (data/ejes/<eje>/eje.json). */
  const cargarFicha = (eje) => memo(`ficha:${eje}`, () => leer(`data/ejes/${eje}/eje.json`).then((f) => { fichas.set(eje, f); return f; }));
  /** Titulaciones que tiene el banco de un eje. */
  const titsDe = (ficha) => Object.keys(ficha.examen ?? {}).filter((t) => TITULACIONES[t]);

  /** Reglas nemotécnicas (comunes a todos los ejes) y, para cada pregunta, las que le ayudan. */
  const mnemoBase = () => memo('mnemo', async () => {
    const d = await leer('data/comun/mnemotecnias.json').catch(() => ({ reglas: [] }));
    const byQ = new Map();
    for (const r of d.reglas) for (const id of r.preguntas ?? []) byQ.set(id, [...(byQ.get(id) ?? []), r]);
    return { reglas: d.reglas, reglasDe: (id) => byQ.get(id) ?? [] };
  });
  /** Con la configuración del profesor encima (reglas cambiadas, ocultas o nuevas); `porDefecto`, las de la app. */
  const cargarMnemotecnias = () => mnemoBase().then((m) => ({
    reglas: aplicarConfigReglas(m.reglas, configActiva()), reglasDe: (id) => aplicarConfigReglasDe(m.reglasDe(id), configActiva()), porDefecto: m.reglas,
  }));

  /**
   * Catálogo de conceptos (común a todos los ejes, docs/CONCEPTOS.md): los ficheros de grupo de data/conceptos/ que
   * nombra su índice, ya leídos (un grupo que aún no existe se salta). Sin catálogo, []. Se carga solo si se pide.
   */
  const cargarCatalogoConceptos = () => memo('conceptos', async () => {
    const indice = await leer(RUTA_INDICE).catch(() => ({ grupos: [] }));
    const grupos = await Promise.all((indice.grupos ?? []).map((g) => leer(rutaGrupo(g)).catch(() => null)));
    return grupos.filter(Boolean);
  });

  /** Vocabulario para tocar en las preguntas. El de Yate incluye el del PER (se da por sabido); su matiz manda. */
  const cargarVocabulario = (tit = 'per') => memo(`vocab:${tit}`, async () => {
    const listas = await Promise.all((tit === 'py' ? ['per', 'py'] : ['per']).map((t) => leer(`data/comun/vocabulario-${t}.json`).then((d) => d.terminos ?? []).catch(() => [])));
    const porId = new Map();
    for (const t of listas.flat()) porId.set(t.id, t);
    return compilarVocabulario([...porId.values()]);
  });

  /**
   * Curso nacional de una titulación (sin práctica), con su ruta por defecto en `ruta` (los tramos de
   * data/curso/ruta-<tit>.json; null si no hay); null si el curso aún no existe.
   */
  const cursoPorDefecto = (tit) => memo(`curso:${tit}`, () => Promise.all([leer(`data/curso/${tit}.json`).catch(() => null), leer(`data/curso/ruta-${tit}.json`).catch(() => null)])
    .then(([curso, ruta]) => conRuta(curso, ruta)));
  /** El mismo, con la configuración del profesor encima (si el alumno ha importado una). */
  const cargarCursoBase = (tit) => cursoPorDefecto(tit).then((c) => conConfig(c, tit));

  /**
   * Reserva del alumno para un eje y una titulación: las convocatorias de su examen final (la foto que se guardó la
   * primera vez que cargó ese banco; sin foto, las de la ficha). Si la ficha cambia después, su examen final no
   * cambia: se apartan del estudio las de la foto y las de la ficha (que nadie estudie lo reservado).
   */
  const reservaEfectiva = (eje, tit, ficha) => {
    const datos = [...(ficha.reserva?.[tit] ?? [])];
    let foto = alumno?.leer(eje, tit) ?? null;
    if (!foto?.convs?.length && alumno && datos.length) {
      foto = { convs: datos, modo: ficha.reserva?.modo ?? 'examen', desde: new Date().toISOString().slice(0, 10) };
      try { alumno.guardar(eje, tit, foto); } catch { /* sin almacén: se usa la de la ficha */ }
    }
    const convs = foto?.convs?.length ? [...foto.convs] : datos;
    const apartar = [...new Set([...convs, ...datos])];
    return { modo: ficha.reserva?.modo ?? 'examen', convs, datos, apartar, firma: `${convs.join(',')}|${apartar.join(',')}` };
  };

  /**
   * Banco de un eje para una titulación (con la reserva del alumno, ver reservaEfectiva).
   * - todas: todas sus preguntas; porId: id → pregunta.
   * - reservadas: ids que no se estudian porque son del examen final. En modo «examen», las preguntas que solo salen
   *   en convocatorias reservadas (una que también salió en otra convocatoria ya es pública: sigue en el estudio);
   *   en modo «pregunta», todas las que salen en ellas.
   * - examenes: las que forman los exámenes de convocatorias (todas menos las reservadas; las retiradas por la
   *   revisión normativa siguen en ellos, con su nota, porque el examen fue así).
   * - estudio: las que se usan para estudiar (práctica de las clases, tandas, repaso, mezcla, «5 minutos»,
   *   simulacros, pausas del podcast, motor de seguimiento): las de los exámenes menos las retiradas.
   * - final: las preguntas de las convocatorias del examen final del alumno, sin las retiradas;
   *   reserva = { modo, convs, datos, examenes: [{ key, titulo, fecha, n, completa, ids }] } (las convocatorias
   *   reservadas, cada una con sus preguntas en orden).
   * - convocatorias(): exámenes reales que se ofrecen [{ key, titulo, fecha, n, completa }] (sin las reservadas).
   * - practicaDe(leccionId): preguntas de práctica de una clase; resueltasDe(leccionId): preguntas resueltas por la
   *   app del tipo de la clase («Míralo resuelto»). Las dos, solo del estudio.
   * - listas: listados de preguntas reales (p. ej. las de carta), con su título y descripción (sin las reservadas).
   */
  const bancoDe = async (eje, tit) => {
    const ficha = await cargarFicha(eje);
    const res = reservaEfectiva(eje, tit, ficha);
    return memo(`banco:${eje}:${tit}:${res.firma}`, () => construirBanco(ficha, eje, tit, res));
  };
  const construirBanco = async (ficha, eje, tit, res) => {
    const dir = `data/ejes/${eje}/${tit}`;
    const lee = (f, porDefecto) => memo(`fichero:${dir}/${f}`, () => (porDefecto === undefined ? leer(`${dir}/${f}`) : leer(`${dir}/${f}`).catch(() => porDefecto)));
    const [datos, explicaciones, practica, resueltos, mnemo, vocab] = await Promise.all([
      lee('preguntas.json'), lee('explicaciones.json', {}), lee('practica.json', {}), lee('resueltos.json', {}), cargarMnemotecnias(), cargarVocabulario(tit)]);
    const todas = datos.preguntas ?? [];
    const porId = new Map(todas.map((q) => [q.id, q]));
    const estructura = TITULACIONES[tit].estructura;
    const r = repartoReserva(todas, res);
    const examenes = r.reservadas.size ? todas.filter((q) => !r.reservadas.has(q.id)) : todas;
    // Las retiradas por la revisión normativa (su respuesta ya no es correcta) no se usan para estudiar.
    const retirada = (q) => q.norma?.estado === 'retirada';
    const estudio = examenes.some(retirada) ? examenes.filter((q) => !retirada(q)) : examenes;
    const enEstudio = new Set(estudio.map((q) => q.id));
    const final = r.final.filter((q) => !retirada(q));
    const apartar = new Set(res.apartar);
    const finalConvs = new Set(res.convs);
    const examenesFinal = convocatoriasDe(estructura, r.final).filter((c) => finalConvs.has(convDeClave(c.key)))
      .map((c) => ({ ...c, ids: r.final.map((q) => ({ q, o: ordenEn(q, c.key) })).filter((x) => x.o != null).sort((a, b) => a.o - b.o).map((x) => x.q.id) }));
    const listas = (ficha.listas?.[tit] ?? [{ id: 'todas', titulo: datos.meta?.titulo ?? tit, descripcion: datos.meta?.descripcion ?? '' }])
      .map((l) => ({ ...l, preguntas: examenes.filter((q) => enLista(l, q)) }));
    const banco = {
      eje: ficha, tit, meta: datos.meta ?? {}, todas, examenes, estudio, final, reservadas: r.reservadas, porId, explicaciones, reglasDe: mnemo.reglasDe, vocab, listas,
      reserva: { modo: res.modo, convs: res.convs, datos: res.datos, examenes: examenesFinal },
      convocatorias: () => convocatoriasDe(estructura, examenes).filter((c) => !apartar.has(convDeClave(c.key))),
      practicaDe: (leccionId) => (practica[leccionId] ?? []).filter((id) => enEstudio.has(id)),
      resueltasDe: (leccionId) => resueltasSegun(resueltos[leccionId], SOLUCIONES, porId).filter((id) => enEstudio.has(id)),
      lista: (id) => listas.find((l) => l.id === id) ?? null,
      /** Conceptos de cada pregunta ({ id: [principal, secundario?] }, docs/CONCEPTOS.md); se lee la primera vez que se pide. */
      etiquetasConceptos: () => lee('conceptos.json', {}),
      /** La lista a la que pertenece una pregunta (la primera que la incluye). */
      listaDe: (q) => listas.find((l) => enLista(l, q)) ?? listas[0],
    };
    return banco;
  };
  /** Banco de un eje (si no existe, el de por defecto) para una titulación (si no existe, el PER). */
  const cargarBanco = (eje, tit) => resolverEje(eje).then((e) => bancoDe(e, TITULACIONES[tit] ? tit : 'per'));

  /** Curso de una titulación con la práctica del eje en cada clase (lo que usan el motor y las pantallas). */
  // Uno por banco (el banco cambia si cambia la reserva del alumno, y con él la práctica de las clases).
  const cursos = new WeakMap();
  const cursoDe = async (tit, eje) => {
    const [curso, banco] = await Promise.all([cursoPorDefecto(tit), bancoDe(eje, tit)]);
    if (!cursos.has(banco)) cursos.set(banco, cursoConPractica(curso, banco));
    return conConfig(cursos.get(banco), tit);
  };
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

  /**
   * La pregunta que corresponde a `id` en el banco del eje `eje` (misma titulación): la propia si ya es de ese eje; si
   * no, su equivalente (por concepto o por parecido del texto, src/bancos/equivalentes.js); y si no hay, la original.
   * → { q, propia, equivalente, ficha } (ficha: la del eje de la pregunta devuelta), o null si el id no existe.
   * Lo usan las pausas del minijuego del podcast, que citan preguntas de un eje concreto.
   */
  async function equivalente(id, eje) {
    const r = await pregunta(id);
    if (!r) return null;
    const e = await resolverEje(eje);
    // Una pregunta que no se estudia (reservada para el examen final o retirada) no sale en una pausa: se cambia por su
    // equivalente del estudio del mismo eje o, si no la hay, la pausa se queda sin pregunta (null).
    const estudiable = (banco, q) => banco.estudio.includes(q);
    const suplente = (banco, q) => equivalenteEn(q, banco.estudio.filter((x) => x.id !== q.id));
    if (r.q.eje === e) {
      if (estudiable(r.banco, r.q)) return { q: r.q, propia: true, equivalente: false, ficha: r.banco.eje };
      const otra = suplente(r.banco, r.q);
      return otra ? { q: otra, propia: true, equivalente: true, ficha: r.banco.eje } : null;
    }
    const ficha = await cargarFicha(e).catch(() => null);
    if (ficha && titsDe(ficha).includes(r.q.tit)) {
      const banco = await bancoDe(e, r.q.tit);
      const otra = equivalenteEn(r.q, banco.estudio);
      if (otra) return { q: otra, propia: true, equivalente: true, ficha: banco.eje };
    }
    if (estudiable(r.banco, r.q)) return { q: r.q, propia: false, equivalente: false, ficha: r.banco.eje };
    const otra = suplente(r.banco, r.q);
    return otra ? { q: otra, propia: false, equivalente: true, ficha: r.banco.eje } : null;
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

  return { registro, ejesPublicados, ejesParaElegir, resolverEje, cargarFicha, titsDe, cargarBanco, cargarCurso, cargarCursoBase, cursoPorDefecto, cargarMnemotecnias, cargarVocabulario, cargarCatalogoConceptos, pregunta, equivalente, resolverLegado, rutaResolucion, fijarReservaAlumno, fijarConfigProfe, configActiva };
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
export const { registro, ejesPublicados, ejesParaElegir, resolverEje, cargarFicha, cargarBanco, cargarCurso, cargarCursoBase, cursoPorDefecto, cargarMnemotecnias, cargarVocabulario, cargarCatalogoConceptos, pregunta, equivalente, resolverLegado, rutaResolucion, fijarReservaAlumno, fijarConfigProfe, configActiva } = bancos;
