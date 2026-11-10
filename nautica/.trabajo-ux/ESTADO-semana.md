# Estado: «la semana antes» (R-33)

Repaso comprimido de los últimos 7 días antes del examen: lo que más cae y las ideas flojas del alumno, día a día.

## Qué hay

- **Lógica pura** `src/course/semana.js` (tests `tests/semana.test.js`, 26): modo, prioridad, reparto y plan. Todo con
  `ahora`/`hoy` inyectados; nada lee el reloj.
- **Prioridad de una idea** = peso del tema × flojedad × frecuencia.
  - peso del tema = (n / preguntas del examen) × (2 − maxErrores / n si tiene límite; 1 si no).
  - flojedad = 1 − tasa suavizada (aciertos + 1) / (vistas + 2); sin ver, 0,5.
  - frecuencia = convocatorias en que sale la idea / convocatorias del banco (solo preguntas que se practican).
  - Sin etiquetas: por tema, peso × (1 − tasa del tema).
- **Reparto** (k = días que faltan): k ≥ 3 ideas flojas; el simulacro (PY por módulos si los minutos al día no llegan a
  los 120 del examen; el examen final si ya toca) colocado para dejar un día de repaso de sus fallos; k = 2 repaso ligero
  (tarjetas, chuleta del tema con límite más flojo, carta si cabe); k = 1 nada nuevo, repaso corto y descanso; k = 0 sin
  tarea. Saltarse un día: se rehace con lo que queda (el simulacro pendiente pasa al siguiente día que pueda; si no queda
  día de repaso, su repaso entra en el ligero).
- **Interfaz**: tarjeta «Semana del examen · faltan N días» en Hoy (la sesión de hoy es la del plan; salir y volver),
  vista `#/<tit>/semana` (hoy, los días que quedan, 5–10 ideas flojas con ficha, accesos), tanda
  `#/<tit>/semana/ideas/<n>?c=…`, «¿Cómo te fue?» pasada la fecha, fila en Más, «Seguir» de la Travesía, mañana en el
  resumen de la sesión, chuleta como paso de sesión («Ya la he repasado»), vuelta de la ficha a la semana.
- **Estado**: ajuste `semana_<tit>` ({ manual, fuera, hechos, fue }), compartido (prefijo añadido en
  `src/store/sync/operaciones.js` y `docs/SYNC.md`; el Worker acepta cualquier clave de `settings`).
- **Punto de extensión**: `src/ui/rutas.js` (`hayRuta`). La vista de la semana enlaza «Estrategia de examen» solo si
  `estrategia` está en `TIT_ROUTES`.

## Verificado

`npm test` 0 fallos; Playwright: Hoy y la semana a 7, 3, 1 y 0 días, PER y PY, 360 y 990 px, claro y oscuro, sin
desborde horizontal ni errores de consola; activar a mano, empezar la sesión, salir, cómo fue y paso de chuleta.

## Pendiente / sin verificar

- Recorrer una semana entera de días reales (marcar días hechos tras terminar la sesión) solo está probado en la lógica.
- Las etiquetas de idea que empiezan por una palabra corta («El que alcanza…») no pasan a minúscula dentro de la frase.
- Lector de pantalla real y iPhone sin probar.
