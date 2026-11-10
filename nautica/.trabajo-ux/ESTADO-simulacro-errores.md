# Simulacro de tus errores (R-43, rama feat/simulacro-errores sobre feat/examen-dia)

Encargo: un simulacro armado a propósito con preguntas cuyos distractores son los errores que el alumno repite.

## Hecho
- [x] `distractoresUnicos()` en `src/exams/diagnostico.js` (mismo criterio que el diagnóstico: error único).
- [x] Índice estático por banco: `tools/indice-errores.mjs` → `data/ejes/<eje>/<tit>/distractores.json` (6 ficheros,
      29 kB en total, 518 preguntas). Solo estudio según la ficha (sin reservadas, retiradas ni anuladas). En el
      precaché. `--comprobar` para CI. Cargador `cargarDistractores()` en `src/bancos/index.js`.
- [x] Lógica pura `src/course/simulacro-errores.js`: elegir errores (tuyos o de los tribunales, con motivo), armar
      (estudio del alumno, no vistas → falladas → acertadas, una por error y D'Hondt, sin repetir; 10 preguntas o las que
      haya), tiempo con `presupuestoTiempo` de la estrategia, estructura sin apto y corrección («has vuelto a…»).
- [x] `src/store/errores.js`: evento `sup` (superado); al resumir resta uno al error (mínimo 0) y lista `superados`.
- [x] `src/exams/taxonomia.js`: `otraVez` (infinitivo) en cada error y `fraseOtraVez()`.
- [x] Interfaz `src/ui/simulacro-errores.js`; hooks pequeños en `testView`/`examenesView` (`theory.js`), título en
      `testDesdeIds` (`engine.js`), ruta del examen a medias en `plan.js`, entrada en Mi progreso (`ui/diagnostico.js`,
      `misc.js`). CSS en un bloque al final de `styles/app.css`.
- [x] `recordTest` con `tipo: 'errores'`, `apto: null`.
- [x] Tests `tests/simulacro-errores.test.js` (índice al día, coincide con el diagnóstico en vivo, sin reservadas;
      selección, motivos, tiempo, sin apto, corrección, contador). `npm test` 0 fallos.
- [x] Playwright (scratchpad `simulacro-errores/flujo.mjs`): sin errores (oferta de los tribunales), con errores
      inyectados, simulacro hecho, corrección con «Has vuelto a…» y «Resolver paso a paso», Mi progreso después; 360 y
      990 px, claro y oscuro, reducir movimiento; sin errores de consola ni scroll horizontal.

## Decisiones a revisar
- Contador: un acierto en el simulacro resta uno (una vez por pregunta y día); acertar antes de cometerlo no da
  crédito. Solo resta este simulacro (en la práctica normal la trampa no está puesta a propósito).
- Umbrales: `MIN_VECES` 2 errores registrados, `MINIMO` 5 preguntas, `OBJETIVO` 10, `MAX_ERRORES` 5.
- Tiempo del PER: 8 min por pregunta de carta (el presupuesto de la estrategia) → 10 preguntas son 80 min.
- En el modo «tribunal» las cifras por error de la pantalla de inicio suman más que las preguntas (una pregunta puede
  tener dos errores de distractor).

## Pendiente / fuera
- No probado en un móvil real. No se ha mirado el lector de pantalla más allá de roles y textos.
