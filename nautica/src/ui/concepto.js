// Etiqueta del concepto de una pregunta (docs/CONCEPTOS.md), para enseñarla en la práctica. Solo si el banco del eje
// tiene sus preguntas etiquetadas (conceptos.json): sin etiquetas no se carga el catálogo y no se enseña nada.

import { cargarBanco } from '../bancos/index.js';
import { cargarConceptos } from '../conceptos/index.js';

const conEtiquetas = new WeakMap(); // banco → Promise<boolean>

/** Nombre del concepto principal de la pregunta, o null (sin etiquetas, sin concepto o si algo falla). */
export async function etiquetaConcepto(eje, tit, idPregunta) {
  try {
    const banco = await cargarBanco(eje, tit);
    if (!conEtiquetas.has(banco)) conEtiquetas.set(banco, banco.etiquetasConceptos().then((e) => !!e && Object.keys(e).length > 0).catch(() => false));
    if (!(await conEtiquetas.get(banco))) return null;
    const c = await cargarConceptos(eje, tit);
    const id = c.principalDe(idPregunta);
    return id ? c.concepto(id)?.etiqueta ?? null : null;
  } catch {
    return null;
  }
}
