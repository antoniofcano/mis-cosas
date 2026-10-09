# Estado: ejercicios de carta resueltos paso a paso (rama feat/carta-pasos)

## Hecho

- **Ruta** `#/<tit>/carta-pasos[/<tipo>][?p=<paso>&todos=1&desde=ej:<id>:<semilla>|idea:<concepto>]` (no `resueltos`, para no
  confundirla con los `resueltos.json` de cada banco). Lista por categoría (en el PER, los suyos y aparte los del PY).
- **14 tipos** con ejemplo propio sobre la carta del Estrecho (costa vectorial y faros de la app, sin la carta escaneada):
  `ct-dm-desvio`, `enfilacion`, `dos-demoras`, `demora-distancia`, `dos-distancias`, `no-simultaneas`, `estima`,
  `rumbo-distancia`, `pasar-distancia`, `corriente-efectiva`, `corriente-rumbo-a-dar`, `corriente-desconocida`,
  `viento`, `estima-analitica`. 4–6 pasos cada uno (regla, texto, cuenta, dibujo), resultado, convenios y «la trampa».
  Cifras y tabla de ejemplos: docs/CARTA-RESUELTOS.md.
- **Cifras calculadas por los motores** (`src/course/carta-pasos.js`), redondeando lo medido como en el examen.
  Motor nuevo: `fixTwoRanges()` (situación por dos distancias) en `src/nautical/positioning.js`.
- **Dibujos** en estilo C (`src/illustrations/carta-pasos-c.js`): extracto de carta con escala constante entre pasos,
  cuadrícula rotulada, rosa, escala gráfica; lo anterior en tinta y lo nuevo en magenta y más grueso; vectores con 1/2/3
  puntas; los pasos de aguja con los tres nortes (ángulos exagerados, rótulos dm/Δ/Ct junto a los arcos). Texto
  alternativo por paso con lo que se ve y lo nuevo.
- **Componente** `src/ui/pasos.js`: Anterior/Siguiente, «Ver todos los pasos», barra de progreso, aria-live, foco al
  título, botones ≥ 44 px, sin animación; el paso queda en la URL (replaceState). En ≥ 900 px, texto y dibujo en dos columnas.
- **Enlaces**: Biblioteca (grupo Carta), lista de ejercicios de carta (`#/<tit>/carta`), ficha de las ideas de carta
  («Ver cómo se resuelve»), corrección de un ejercicio de carta fallado (`#/ej/…`, vuelve al mismo ejercicio con su
  semilla) y de una pregunta de carta fallada en la práctica (tandas, clases). Nunca en el examen ni en su revisión.
- **Tests** `tests/carta-pasos.test.js` (20): cifras contra el motor y la geometría, pasos completos, sin emojis ni NaN,
  enlaces a conceptos/ejercicios existentes, dibujos (texto ≥ 10,5 px efectivos, solo `--lc-*`, alt, escala constante,
  sin imágenes), y que el examen no enlaza.
- **Verificación visual** (Playwright, `scratchpad/cps-capturas/`): lista, los 14 tipos con todos los pasos, la
  navegación, la ficha, el ejercicio fallado, la pregunta de práctica fallada y la lista/biblioteca del PER; claro y
  oscuro a 390 (todo), 360 y 990 (lo principal). Sin desborde horizontal ni errores de consola (solo el favicon).

## Pendiente / ideas

- Situación por sonda (veril) y Ct por la Polar no tienen resuelto.
- Los rótulos de algunos dibujos densos (enfilación paso 5, corriente desconocida 4–5) quedan apretados a 360 px pero sin pisarse.
- Podría enlazarse desde «Más» directamente (hoy se llega por Biblioteca y por la lista de carta).
