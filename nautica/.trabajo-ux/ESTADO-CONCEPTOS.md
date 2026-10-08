# Conceptos en el método (rama feat/conceptos-metodo)

Encargo: llevar los conceptos (docs/CONCEPTOS.md) al método. Todo con degradación elegante: sin etiquetas para el
eje/tit (hoy DGMM), la app se comporta exactamente como antes.

## Hecho
- [x] Repaso por concepto (lógica): `src/course/repaso.js` (itemsRepaso, colaRepaso con `conceptos`, planRepaso,
      siguienteRepasoConcepto), estado por concepto en `progress.repConceptos[<eje>/<tit>]` (store), motor y plan con
      `conceptos`. `variante` del motor acepta `excluir`. Tests: `tests/repaso-conceptos.test.js`.
- [x] Vista del repaso (`theory.js` repasoView): variante + aviso + «vuelve en N días».

## Pendiente
- Diagnóstico en Hoy, resumen por concepto, ¿Estás listo? por concepto, Temario, capturas.

## Cómo seguir
`cd nautica && npm test`; tras tocar ficheros servidos: `git add` + `npm run precache` + `node --check sw.js`.
