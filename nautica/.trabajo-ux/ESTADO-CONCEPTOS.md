# Conceptos en el método (rama feat/conceptos-metodo)

Encargo: llevar los conceptos (docs/CONCEPTOS.md) al método: el repaso entrena IDEAS, no la letra de la pregunta.
Todo con degradación elegante: sin etiquetas para el eje/tit (hoy DGMM), la app se comporta exactamente como antes.

## Hecho
- [x] Repaso por concepto: `src/course/repaso.js` (itemsRepaso, colaRepaso/repasoDelDia con `conceptos`, planRepaso,
      siguienteRepasoConcepto). Estado por concepto en `progress.repConceptos["<eje>/<tit>"]` (store), aparte de las
      respuestas (que no cambian). Motor (`estadoAlumno` entrada `conceptos`) y plan (`planHoy`, `ritmoEstudio`).
      `variante` acepta `excluir`. Vista `repasoView` (theory.js): variante, aviso «con otra redacción», «vuelve en N días».
- [x] Hoy: «Te cuesta: …» (ideas flojas) en la tarjeta de sesión; «Tus fallos» nombra las ideas; línea de ideas bajo
      «¿Estás listo?». Examen: el botón de repaso usa la cuenta del motor.
- [x] Resumen de la sesión por concepto (punto verde: sabido, vuelve en N días; rojo: a repasar, mañana); sin etiquetas, por tema.
- [x] «Ideas por dominar» por tema en Progreso (`conceptosPorTema`, listo.js). La probabilidad NO cambia (ver abajo).
- [x] Temario: ideas de cada clase (sabidas/flojas/sin ver) y, de las flojas, su clase y su mapa o lámina.
- [x] Tests: `tests/repaso-conceptos.test.js` (incluye bancos reales: ninguna variante reservada/retirada/anulada;
      DGMM sin cambios). Playwright: scratchpad `conceptos-pw/flujo.mjs` (nuevo, Andalucía con fallos, recarga a
      mitad, DGMM), capturas en `ux-capturas-conceptos/`.

## Por qué no se sustituye el cálculo de «¿Estás listo?»
La probabilidad oficial (beta-binomial por tema con las reglas reales) está construida sobre lo que el examen mide:
preguntas por bloque. Pasar a conceptos exige decidir cuánto pesa cada idea en el examen y cuántas flojas se pueden
tener y aprobar; eso solo se calibra con datos reales (resultados de examen frente a ideas dominadas). Hasta tenerlos,
la vista por concepto es apoyo (qué falta), no veredicto.

## Pendiente / fuera
- «5 minutos» y «Mis fallos» por tema (f=1) siguen por pregunta.
- DGMM sin etiquetar: pide `data/ejes/dgmm/<tit>/conceptos.json` (404 esperado, una vez por banco).
- La etiqueta de concepto encima de la pregunta (chip, de antes) a veces casi delata la respuesta («Cuadernas y baos»).

## Cómo seguir
`cd nautica && npm test`; tras tocar ficheros servidos: `git add` + `npm run precache` + `node --check sw.js`.
