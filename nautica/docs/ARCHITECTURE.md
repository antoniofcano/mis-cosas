# Arquitectura

JavaScript moderno (módulos ES), sin framework ni paso de compilación. Cada motor es independiente
y sin DOM salvo `graphics` (que solo produce texto SVG) y `ui`. Todo lo que no es `ui/` se prueba en Node.

```
nautica/
├── index.html            Punto de entrada
├── llms.txt              Guía para agentes de IA
├── data/                 Base de datos estática (JSON)
│   ├── chart-105.json    Carta: puntos notables, costa (polígonos de tierra), declinación
│   ├── curso/            Clases por titulación (per.json; módulos por tema con tarjetas, chuleta y práctica)
│   └── exams/            Bancos de preguntas reales (index.json + un fichero por banco)
├── src/
│   ├── math/             MOTOR MATEMÁTICO   ángulos, vectores, Mercator/loxodrómica, RNG con semilla, formatos
│   ├── nautical/         MOTOR NÁUTICO      aguja (Ct, dm, Δ), cinemática (corrientes, abatimiento),
│   │                                        situación (líneas de posición), glosario
│   ├── chart/            MOTOR DE CARTA     consultas geográficas: ¿agua?, ¿visible?, punto navegable aleatorio
│   ├── exercises/        MOTOR DE EJERCICIOS contrato (define.js), registro y un fichero por tipo (types/)
│   ├── analysis/         MOTOR DE ANÁLISIS  magnitudes (lectura/formato/error), corrección y diagnóstico
│   ├── graphics/         MOTOR GRÁFICO      carta en coordenadas mundo (Mercator) por capas, construcciones,
│   │                                        instrumentos (transportador, compás, regla) y georreferenciación
│   │                                        de escaneos (ajuste afín)
│   ├── store/            DATOS              progreso del alumno (localStorage) y carga de datasets
│   ├── course/           CURSO              estado de las clases y repaso espaciado (engine.js) y recomendador «Hoy» (plan.js)
│   ├── exams/            EXÁMENES REALES    kit de resolución (kit.js), lector de opciones y soluciones por banco
│   ├── theory/           MOTOR DE TESTS     estructura de cada titulación (blocks.js: PER, PY, TITULACIONES),
│   │                                        simulacros, exámenes reales y corrección con las reglas oficiales
│   ├── illustrations/    ILUSTRACIONES      SVG paramétrico animado (boyas, luces, maniobras, meteo…) por spec
│   ├── teacher/          MOTOR «PROFE»     lecciones por tipo de paso (intro, truco, error típico), narración
│   │                                        de soluciones y conversión a lenguaje hablado para la voz
│   ├── ai/               INTERFAZ IA        resúmenes de texto compactos y API window.nautica
│   └── ui/               INTERFAZ           router por hash (#/<tit>/… por titulación), barra inferior, vistas; ui/chart/: carta interactiva (zoom, capas,
│                                            herramientas de dibujo) y capa raster de la carta del usuario
├── styles/app.css
└── tests/                node --test
```

Dependencias permitidas (de abajo arriba): `math` ← `nautical` ← `chart` ← `exercises` ← `analysis`
← `graphics` ← `ai` ← `ui`. `store` solo lo usa `ui`.

## Organización por titulación y navegación

La titulación (PER, PY) es el eje de la interfaz. `src/theory/blocks.js` define `TITULACIONES`: estructura
del examen (temas, nº de preguntas, límites de errores, aciertos mínimos, duración) y nivel de los ejercicios
de carta. Añadir una titulación = una entrada en `TITULACIONES` + su banco en cada eje
(`data/ejes/<eje>/<tit>/`) y su curso `data/curso/<tit>.json` (si no existe, `loadCourse` devuelve `null` y la
app funciona solo con preguntas).

Las preguntas reales de examen están en **bancos por eje** (administración examinadora; hoy, Andalucía): formato,
motor (`src/bancos`) y cómo añadir un eje en [`BANCOS.md`](BANCOS.md). Ningún código fuera de `src/bancos` nombra
un banco concreto; las vistas piden `cargarBanco(currentEje(progress), tit)`.

`ui/app.js` enruta por hash y pinta la barra inferior (`#tabbar`: Hoy, Temario, Examen, Más):

| Ruta | Vista |
|---|---|
| `#/`, `#/<tit>` | `views/hoy.js` → `hoyView` (sin presentación previa, `#/` lleva a `#/bienvenida`) |
| `#/bienvenida` | `views/bienvenida.js` |
| `#/<tit>/temario`, `#/<tit>/temario/<n>` | `views/temario.js` → `temarioView`, `temaView` |
| `#/<tit>/curso/<id>[?practica=1]` | `views/curso.js` → `leccionView` (clase) |
| `#/<tit>/teoria/ut/<n>?s=…[&f=1]` | `views/theory.js` → `practiceView` (tanda de 10) |
| `#/<tit>/examenes`, `#/<tit>/test/simulacro?s=…`, `#/<tit>/test/real/<conv>` | `views/theory.js` → `examenesView`, `testView` |
| `#/<tit>/carta`, `#/ej/<id>?s=…`, `#/mesa` | ejercicios y mesa de cartas |
| `#/q/<id>`, `#/<tit>/examenes/<lista>` (antes `#/examenes/<fichero>/<id>`, que redirige) | `views/exams.js` → `preguntaView`, `listaView` |
| `#/<tit>/laminas`, `#/reglas`, `#/conceptos`, `#/mas`, `#/progreso` | biblioteca, «Más» y mi progreso |
| `#/calculadora` | `views/calculadora.js`: calculadora científica (lógica en `src/calculadora/motor.js`) |
| `#/<tit>/cuentas[/<id>]` | `views/cuentas.js` y `leccionView`: apéndice «Las cuentas del patrón» (`data/curso/apendice-matematicas.json`, `src/course/apendice.js` y `cuentas.js`). Fuera del curso: no entra en temas, plan ni «¿Estás listo?». Sus enlaces «Repasa: …» salen de `usadoEn` en los datos |

- **Recomendador único** (`course/plan.js`, funciones puras con tests): `planHoy` (lista ordenada de
  actividades; la primera es la de Hoy), `estadoTema` y `avance`. Lo usan Hoy, Temario, Mi progreso y las
  pantallas de cierre (`ui/cierre.js`, que recalcula el plan tras guardar el progreso).
- **Modo concentración**: en clase, tanda o examen, `body.focus` oculta cabecera, barra inferior y pie; la vista
  coloca `barraActividad()` (`ui/actividad.js`) como primer hijo.
- **Progreso** (`store/progress.js`, `nautica.progress.v1`, `version: 1`; solo campos opcionales nuevos):
  `settings.{onboarded, minutosDia, vozAuto, avisoCartaVisto, ultimaCopia, avisoCopiaHasta}`, `lecciones[id].paso`
  (tarjeta donde se dejó la clase), `dias` (minutos y actividades por día, 60 días) y `testEnCurso` (examen a
  medias: respuestas, pregunta actual y tiempo consumido solo con la pestaña visible). Copia de seguridad en `ui/copia.js`.

## Flujo de un ejercicio

1. `generate(rng, ctx)` produce **datos serializables** (`params`), reproducibles con la semilla de la URL.
   Usa la carta real: posiciones en agua, faros visibles, trayectorias sin cruzar tierra.
2. `statement(params, ctx)` redacta el enunciado como en el examen.
3. `solve(params, ctx)` devuelve `results` (números), `steps` (explicación) y `drawing` (primitivas SVG
   con el paso en que aparecen).
4. `analysis/checker` lee las respuestas según su magnitud (`analysis/quantities.js`), compara con la
   tolerancia y, si hay fallos, ejecuta los `mistakes` del tipo para identificar el error cometido.
5. La UI muestra pistas = `steps` uno a uno, y la carta dibuja las primitivas hasta ese paso.

## Añadir un tipo de ejercicio nuevo (p.ej. mareas para PY)

1. Si hace falta conocimiento nuevo, añádelo como funciones puras en `src/nautical/` (p.ej. `tides.js`).
2. Crea `src/exercises/types/mi-tipo.js` con `defineExercise({...})` (ver el contrato en `define.js`).
3. Regístralo en `src/exercises/registry.js` (y una categoría nueva en `define.js` si procede).
4. Si necesita una magnitud nueva (p.ej. altura de marea en metros), añádela en `analysis/quantities.js`.
5. `npm test` ya lo prueba automáticamente: genera 40 casos, comprueba que se resuelven, que el enunciado
   no tiene huecos y que la solución se autocorrige; y que cada error típico se detecta.

## Exámenes reales: resolución programada y validación

`src/exams/kit.js` ofrece operaciones de alto nivel (`ct`, `oposicion`, `fix2`, `fromMark`, `tangent`, `run`,
`eta`…) que calculan con los motores, redactan el paso explicado y añaden el dibujo. Cada pregunta tiene en
`src/exams/solutions/<eje>*.js` (registradas por su eje en `src/bancos/ejes/<eje>.js`) una función corta que encadena esas operaciones y devuelve los valores
pedidos. `src/exams/options.js` lee las opciones del examen y elige la más próxima; `tests/exams.test.js`
exige que coincida con la plantilla oficial. Si cambias la carta o un motor, este test avisa.

## Añadir preguntas de examen

Las preguntas van en el banco de su eje (`data/ejes/<eje>/<tit>/preguntas.json`), con el formato normalizado y
las reglas de [`BANCOS.md`](BANCOS.md) (que valida `tests/bancos.test.js`); sus soluciones de carta, opcionales,
en `src/bancos/ejes/<eje>.js`. Datos de la carta: `node tools/build-chart.mjs` regenera `data/chart-105.json`.

## Carta interactiva e instrumentos

- Coordenadas mundo: x = longitud (min) × 10, y = −latitud aumentada (min) × 10. Zoom/desplazamiento = viewBox.
- Capas: mar → escaneo del usuario (opcional) → tierra vectorial → cuadrícula → faros → solución → dibujo del
  alumno → instrumento activo. Las capas con texto se regeneran a la escala actual (tamaño constante en pantalla).
- Escaneo: `data/carta-l105-calibracion.json` guarda 18 cruces de la cuadrícula de 10′ (lat/lon ↔ píxel). La
  imagen la aporta cada usuario (IndexedDB; `store/user-chart.js` extrae el JPEG del PDF sin librerías) y
  `graphics/georef.js` calcula la matriz afín. La carta tiene © IHM: nunca se sube al repositorio.
- Instrumentos (`graphics/instruments.js`) son dibujo puro; la interacción está en `ui/chart/interactive-chart.js`.
- Mesa de cartas (`ui/chart/workspace.js`): carta a pantalla completa + panel. Traslada el formulario de respuesta
  del ejercicio al panel mientras está abierta y lo devuelve al cerrar; conserva lo dibujado entre aperturas.
- Tutorial (`ui/chart/tutorial.js`): a partir de las primitivas con `step` de cualquier solución deduce el
  instrumento de cada trazo (`ray`/`line` → transportador, `arc`/`circle` → compás, `seg` → regla, `vec` →
  transportador + compás) y lo reproduce con encuadre automático. Cualquier tipo de ejercicio nuevo que dibuje
  su solución tiene tutorial sin escribir nada más.

## Ayudas del alumno

- **Asa de plegar** (`ui/hoja.js` → `botonPlegar(panel)`): botón `.hoja-plegar` (48 px) que alterna la clase
  `plegada` del panel y su `aria-expanded`. La usan la corrección (hoja) y el panel de la mesa de cartas (en el
  móvil se queda en la fila de pestañas y la carta ocupa todo; en pantallas anchas, una columna estrecha). El
  tutorial de la mesa trae el enunciado plegado («Ver el enunciado») para compararlo con lo que dice el profe.
- **Chuleta de la práctica** (`data/comun/chuletario.json`, `course/chuletario.js`, `ui/ayudas.js`): fichas de
  fórmulas, signos y conversiones citadas por tema (`temas.<tit>.<ut>`) y por tipo de ejercicio (`ejercicios.<id>`);
  debajo, la chuleta de las clases que vienen a cuento. `crearAyudas({ modo, tit, ut, ejercicios, leccion })` da la
  barra (botón «Chuleta») y el panel, que va en el flujo de la página (no tapa la respuesta) o flotando sobre la
  carta en la mesa. Abierta o cerrada se recuerda en `sessionStorage`. **Solo en práctica** (`MODOS_PRACTICA`):
  nunca en simulacro, examen real ni examen final; `tests/chuletario.test.js` lo comprueba en las vistas.
- **Hueco para otras ayudas** (calculadora, apéndice de matemáticas): `registrarAyuda({ id, crear(ctx) })` en
  `ui/ayudas.js` añade un botón a la barra de ayudas de todas las pantallas de práctica (`.ayudas-hueco[data-hueco]`).
  La barra no existe en los exámenes: si una ayuda debe estar también allí, que la vista del examen la pinte aparte.
- **Siglas y términos al tocarlos** (`data/comun/abreviaturas.json`, `theory/glosas.js`, `ui/glosas.js`):
  `glosar(raiz, { tit, ut, leccion })` convierte, en el texto ya pintado, la primera aparición de cada sigla y de
  cada término del vocabulario (`vocabulario-*.json`, los de ese tema y sus afines) en un botón con una explicación
  flotante (tocar, ratón o teclado; Esc o tocar fuera la cierra; nunca tapa la palabra). Solo nodos de texto, sin
  innerHTML; no entra en botones, enlaces, opciones de respuesta ni títulos. Se usa en las tarjetas y la chuleta de
  las clases, las tarjetas de memoria (en el anverso, nada que delate la respuesta), los enunciados de carta y las
  explicaciones del profe. En los exámenes no se marca nada.

## El profe y la voz

- `teacher/lessons.js`: conocimiento pedagógico. Cada lección reconoce un tipo de paso por su título (y, si hace
  falta, por su texto) y aporta introducción (con variantes), truco y error típico. Añadir conocimiento = editar
  este fichero; sirve para todos los ejercicios y preguntas de examen a la vez.
- `teacher/narrate.js`: compone la explicación (lección + cálculo real del paso), con presentación y cierre.
- `teacher/speech.js`: pasa el texto técnico a lenguaje hablado («Rv = 036°» → «rumbo verdadero igual a cero 36 grados»).
- `ui/voice.js`: Web Speech API (voz española del sistema), lectura por frases y salvaguarda de tiempo para no bloquear.

## Herramientas de desarrollo

Solo Node.js ≥ 20: `npm start` (servidor estático `tools/serve.mjs`), `npm test` (`node --test`),
`node tools/build-chart.mjs` (datos de la carta). La app en sí es HTML + CSS + módulos ES, sin compilación.

## Pensado para asistentes de IA

- Cada vista expone `summary()`: texto compacto con todo lo relevante. Se obtiene con `nautica.state()` y, en
  ejercicios y preguntas de carta, se muestra plegado al final («Para asistentes de IA», `#ai-context`).
- La API `window.nautica` permite generar, resolver y corregir sin leer el DOM.
- El estado del ejercicio vive en la URL (`#/ej/<tipo>?s=<semilla>`), así que es reproducible.
