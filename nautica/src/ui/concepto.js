// Etiqueta del concepto de una pregunta (docs/CONCEPTOS.md), para enseñarla en la práctica. Solo si el banco del eje
// tiene sus preguntas etiquetadas (conceptos.json): sin etiquetas no se carga el catálogo y no se enseña nada.

import { cargarBanco } from '../bancos/index.js';
import { cargarConceptos } from '../conceptos/index.js';

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
