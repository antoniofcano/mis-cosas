// Adaptador «ocr» (ESBOZO, sin implementar): cuestionarios escaneados sin capa de texto. Caso previsto: DGMM de junio de
// 2016 a abril de 2019 (más octubre y diciembre de 2019): enunciados y plantillas en imagen JBIG2/CCITT a 300 ppp, con
// 4 «Test» de PER por convocatoria (dos juegos barajados: T01≡T03, T02≡T04), PY T01–T02 y, en 2018–2019, hojas de
// «modificación de respuestas» también escaneadas (research_notes/…/madrid_dgmm.md, §1–2).
//
// Interfaz (la de todos los adaptadores; la usa etapas/extraer.mjs):
//   extraer(ctx, tit) → { apariciones, resumen }
//     ctx.documentos: los del manifiesto de esta titulación (rol cuestionario | plantilla | correccion, modelo = «T01»…)
//     cada aparición: { eje, tit, claveConv, conv, modelo, modulo, numero, orden, seccion, enunciado, opciones,
//                       contexto, respuesta: { letras, estado, origen: 'ocr', confianza }, fecha, fuentes, paginaPDF }
//   ocrPagina(pdf, pagina, { idioma }) → { texto, palabras: [{ texto, bbox, confianza }] }
//
// TODO (fase F2 de la DGMM):
//   1. Rasterizar cada página a 300 ppp (PyMuPDF, en py/ y con python3 -I) y pasarla por tesseract. En este entorno solo
//      hay el modelo inglés («eng»): instalar «spa» (tildes, «º», «ñ») o corregir después con un diccionario.
//   2. Partir cada PDF en exámenes por la cabecera «Test 0N» (titulación + modelo); la de abril de 2016 lleva una capa OCR
//      de calidad media que puede servir de punto de partida.
//   3. Reutilizar lib/cuestionario.mjs (analizarCuestionario con nuevoExamen para las cabeceras) sobre el texto OCR, con
//      reglas tolerantes a los errores típicos («O1» por «01», «2"» por «2º», «a)» leído como «a]» o «al»).
//   4. Plantillas: tablas «número letra» escaneadas → OCR por celdas (o lectura de la rejilla, como py/hoja_optica.py).
//   5. Hojas de «modificación de respuestas» → ejes/dgmm/correcciones.json a mano, con su fuente (son pocas).
//   6. confianza < umbral (media de tesseract por palabra) → respuesta «dudosa» y la pregunta al informe; un juego y su
//      permutación (T01/T03) deben dar el mismo texto y la misma respuesta: la etapa repetidas lo cruza.
//   7. Pruebas con un PDF sintético escaneado (tests/fixtures/bancos/), nunca con PDF oficiales.

const PENDIENTE = 'adaptador ocr no implementado (esbozo: ver TODO en tools/bancos/adaptadores/ocr.mjs)';

/** OCR de una página (sin implementar). */
export function ocrPagina(pdf, pagina, { idioma = 'spa' } = {}) {
  throw new Error(`${PENDIENTE}: ${pdf} pág. ${pagina} (${idioma})`);
}

/** Interfaz de adaptador: no extrae nada y avisa de cada documento pendiente, para que el informe lo recoja. */
export function extraer(ctx, tit) {
  const docs = ctx.documentos.filter((d) => !d.tit || d.tit === tit);
  for (const d of docs) ctx.avisos.add('extraer', `${d.archivo}: ${PENDIENTE}`);
  return { apariciones: [], resumen: { examenes: 0, apariciones: 0, pendientes: docs.length } };
}
