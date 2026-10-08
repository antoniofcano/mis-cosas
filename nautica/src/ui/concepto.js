// Etiqueta del concepto de una pregunta (docs/CONCEPTOS.md), para enseñarla en la práctica. Solo si el banco del eje
// tiene sus preguntas etiquetadas (conceptos.json): sin etiquetas no se carga el catálogo y no se enseña nada.

import { h } from './dom.js';
import { tlink } from './titulacion.js';
import { cargarBanco } from '../bancos/index.js';
import { cargarConceptos } from '../conceptos/index.js';
import { nodosDeClase } from '../course/mapas.js';
import { idLamina } from '../illustrations/catalogo-laminas.js';
import { resumenDominio } from '../conceptos/conceptos.js';
import { necesitaFicha, fichaPendiente } from '../course/ficha.js';

const conEtiquetas = new WeakMap(); // banco → Promise<boolean>

/** ¿Tiene este banco sus preguntas etiquetadas? (se pregunta una vez por banco) */
function tieneEtiquetas(banco) {
  if (!conEtiquetas.has(banco)) conEtiquetas.set(banco, banco.etiquetasConceptos().then((e) => !!e && Object.keys(e).length > 0).catch(() => false));
  return conEtiquetas.get(banco);
}

/**
 * Los conceptos del banco de un eje y una titulación (src/conceptos: conceptosDe, preguntasDe, dominio, variante…), o
 * null si el banco no tiene etiquetas o algo falla. Es la puerta de todo lo que la app hace por concepto: con null,
 * cada pantalla se comporta como siempre.
 */
export async function conceptosDelBanco(eje, tit) {
  try {
    const banco = await cargarBanco(eje, tit);
    if (!(await tieneEtiquetas(banco))) return null;
    return await cargarConceptos(eje, tit);
  } catch {
    return null;
  }
}

/** Nombre del concepto principal de la pregunta, o null (sin etiquetas, sin concepto o si algo falla). */
export async function etiquetaConcepto(eje, tit, idPregunta) {
  const c = await conceptosDelBanco(eje, tit);
  const id = c?.principalDe(idPregunta);
  return id ? c.concepto(id)?.etiqueta ?? null : null;
}

/**
 * Lo que el motor necesita para el repaso y el diagnóstico por concepto (src/course/motor.js, entrada `conceptos`),
 * o null sin etiquetas. `clave` es el eje del banco (banco.eje.id): el estado de repaso se guarda por eje y titulación.
 */
export function entradaConceptos(ic, progress, clave, tit, respuestas, { limite = 5 } = {}) {
  if (!ic) return null;
  return {
    principalDe: ic.principalDe,
    estado: progress.repasoConceptos(clave, tit),
    etiqueta: (c) => ic.concepto(c)?.etiqueta ?? null,
    flojos: ic.conceptosFlojos(respuestas, { limite }),
  };
}

/** Las clases de un curso por id. */
export const clasesDeCurso = (curso) => new Map((curso?.modulos ?? []).flatMap((m) => m.lecciones ?? []).map((l) => [l.id, l]));

/**
 * Dónde se enseña una idea (campo `clases` del catálogo): la primera de sus clases que exista en este curso y, si esa
 * clase tiene un nodo en un mapa de conceptos, ese mapa; si no, su primera lámina. null si no se enseña en ninguna.
 * @param {Map<string, object>} clases  clasesDeCurso(curso)
 */
export function dondeSeEnsena(concepto, tit, clases, mapas = []) {
  const l = (concepto?.clases ?? []).map((id) => clases.get(id)).find(Boolean);
  if (!l) return null;
  const nodo = nodosDeClase(mapas, l.id, tit)[0] ?? null;
  const spec = nodo ? null : (l.pasos ?? []).find((p) => p.tipo === 'ilustracion' && p.spec)?.spec ?? null;
  return {
    clase: { id: l.id, href: tlink(tit, ['curso', l.id]), titulo: l.titulo },
    mapa: nodo ? { href: tlink(tit, ['mapas', nodo.mapa.id], { v: 'mapa', n: nodo.nodo.id }), titulo: nodo.mapa.titulo } : null,
    lamina: spec ? { href: tlink(tit, ['laminas', idLamina(spec)]) } : null,
  };
}

/**
 * Dirección de la ficha de una idea (#/<tit>/idea/<id>). `desde` dice adónde vuelve: 'repaso', 'sesion' o
 * 'temario/<ut>' (por defecto, Hoy). La ficha no se enlaza nunca desde un examen ni un simulacro.
 */
export const hrefFicha = (tit, id, desde = null) => tlink(tit, ['idea', id], desde ? { desde } : undefined);

/**
 * ¿Le toca la ficha a esta idea? `necesita`: está floja por segunda vez; `pendiente`: y no se ha abierto la ficha desde
 * su último fallo (entonces el repaso no la vuelve a preguntar hasta que la mire).
 */
export function estadoFicha(ic, idConcepto, respuestas = {}, vistas = {}) {
  if (!ic?.concepto(idConcepto)) return { necesita: false, pendiente: false };
  const qs = ic.preguntasDe(idConcepto, { soloEstudio: false, conDescendientes: false });
  const d = resumenDominio(qs, respuestas);
  return { necesita: necesitaFicha(d, qs, respuestas), pendiente: fichaPendiente(d, qs, respuestas, vistas[idConcepto]), d };
}

/**
 * Una idea floja como fila: su nombre y los enlaces a su ficha (con `ficha`), a la clase donde se enseña (salvo que sea
 * `claseActual`) y a su mapa o lámina.
 */
export function filaIdea(c, tit, clases, mapas, { claseActual = null, ficha = null } = {}) {
  const d = dondeSeEnsena(c, tit, clases, mapas);
  const enlaces = [
    ficha ? h('a.enlace-ficha', { href: hrefFicha(tit, c.id, ficha) }, 'Ver la ficha') : null,
    d && d.clase.id !== claseActual ? h('a', { href: d.clase.href }, `Clase: ${d.clase.titulo}`) : null,
    d?.mapa ? h('a', { href: d.mapa.href }, `Mapa: ${d.mapa.titulo}`) : null,
    d?.lamina ? h('a', { href: d.lamina.href }, 'Ver la lámina') : null,
  ].filter(Boolean);
  return h('li.idea-floja', h('span.idea-nombre', c.etiqueta), enlaces.length ? h('span.idea-enlaces', enlaces.flatMap((a, i) => (i ? [' · ', a] : [a]))) : null);
}
