// Conceptos en la app: carga perezosa del catálogo (común) y de las etiquetas del banco activo (eje y titulación), y la
// API pura de src/conceptos/conceptos.js sobre ellos. Formato y flujo: docs/CONCEPTOS.md.
//
//   const c = await cargarConceptos(eje, tit);
//   c.conceptosDe(id) · c.preguntasDe(conceptoId) · c.dominio(progress.exams) · c.conceptosFlojos(progress.exams)
//   c.variante(idFallada, progress.exams, { hoy })
//
// Nada se lee hasta que alguien llama a cargarConceptos; cada catálogo y cada banco se indexan una sola vez.

import { bancos } from '../bancos/index.js';
import { indexarCatalogo } from './catalogo.js';
import { crearIndiceConceptos } from './conceptos.js';

export { indexarCatalogo, crearIndiceConceptos };

/**
 * @param {{ cargarBanco: Function, cargarCatalogoConceptos: Function }} motor  el motor de bancos (src/bancos)
 */
export function crearConceptos(motor) {
  let catalogo = null;
  const indices = new WeakMap(); // banco → índice
  /** Catálogo indexado (src/conceptos/catalogo.js). */
  const cargarCatalogo = () => (catalogo ??= motor.cargarCatalogoConceptos().then(indexarCatalogo));
  /** Conceptos del banco de un eje y una titulación. */
  async function cargarConceptos(eje, tit) {
    const banco = await motor.cargarBanco(eje, tit);
    if (!indices.has(banco)) {
      indices.set(banco, Promise.all([cargarCatalogo(), banco.etiquetasConceptos()])
        .then(([cat, etiquetas]) => crearIndiceConceptos({ catalogo: cat, etiquetas, banco })));
    }
    return indices.get(banco);
  }
  return { cargarCatalogo, cargarConceptos };
}

export const conceptos = crearConceptos(bancos);
export const { cargarCatalogo, cargarConceptos } = conceptos;
