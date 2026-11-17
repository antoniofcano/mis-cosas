# Auditoría de código de «Patrón»

Diagnóstico de `nautica/` (la app) y `sync-worker/` (el servicio de sincronización) tal como están en `main`
(commit `2755e59`, 17 de noviembre de 2026). No se ha cambiado código, no se han hecho peticiones a producción y no se
ha tocado la base de datos de producción. Es el paso previo al diseño de la arquitectura nueva y al plan de
refactorización: aquí no se diseña nada, se mide y se opina.

Cómo leerlo:

- Cada hallazgo lleva un id (`E` estructura, `C` calidad, `T` tipado, `P` pruebas, `S` seguridad, `M` mantenimiento,
  `R` rendimiento, `D` datos), su evidencia (`fichero:línea` o el fichero de métricas) y su gravedad (alta, media, baja).
- Las métricas en bruto y la configuración con que se sacaron están en [`metricas/`](metricas/) (índice en el anexo A).
  Las herramientas se instalaron en una carpeta temporal fuera del repositorio; `package.json` no se ha tocado.
- Las rutas son relativas a `nautica/` salvo las que empiezan por `sync-worker/`.

## 1. Resumen ejecutivo

**Qué hay.** 393 módulos y 73.700 líneas de JavaScript en `src/`, 3.800 líneas de CSS (333 KB), 24 MB de datos JSON
(10.182 preguntas de tres tribunales), 304 MB de audio en git, 122 ficheros de pruebas con 2.581 casos, y un Worker de
612 líneas con D1. Sin framework, sin empaquetador, sin tipos, sin linter, sin integración continua. De los 427 commits
sin fusiones de `main`, 371 (87 %) los firma un agente de IA.

**El diagnóstico en una frase.** El proyecto tiene un núcleo de lógica mejor de lo que el dueño cree y una carcasa
peor de lo que parece: los motores (curso, exámenes, bancos, sincronización, matemáticas) son funciones puras, sin
DOM, con cobertura cercana al 100 % y casi sin duplicación; la interfaz (16.500 líneas), el CSS, el proceso de
publicación, el modelo de identidad y el almacenamiento son de prototipo y son los que frenan lo que el producto quiere
ser (cuentas, academias, profesor, cobro).

| Área | Nota (0–10) | En una línea |
| --- | --- | --- |
| 1. Tamaño y estructura | **6** | Capas respetadas donde importa (nada fuera de `ui/` toca el DOM ni importa `ui/`), solo 2 ciclos triviales; pero vistas de 400–800 líneas en una sola función, CSS monolítico y 16.700 líneas de contenido escritas como código |
| 2. Calidad | **5,5** | 1,8 % de duplicación y cero globales indebidos; 102 funciones con complejidad > 20, 22 funciones de más de 150 líneas, 107 variables sin usar, sin linter ni formateador |
| 3. Tipado | **3** | Ni un `@ts-check`, 1 `@typedef`; aun así `tsc --checkJs` sin modo estricto da solo 472 errores: el camino a tipos es corto en el núcleo |
| 4. Pruebas | **6,5** | 2.581 casos en 37 s y 80 % de líneas reales; pero la interfaz está al 19 %, 47 ficheros no los carga ningún test, 36 ficheros de test fijan texto de CSS o de código fuente y no hay E2E versionado ni CI |
| 5. Seguridad | **6** como prototipo · **3** como servicio de pago | Worker cuidadoso (sin SQL concatenado, límites, hash con pepper, sin registros); faltan cuentas, revocación, borrado y exportación, política de privacidad, CSP y origen propio |
| 6. Mantenimiento | **4** | Publicación a mano por push a una rama, sin CI, precarga manual, repositorio de 377 MiB por el audio, una sola persona y documentación exhaustiva pero ilegible |
| 7. Rendimiento | **6** | Primera visita: 403 peticiones y 4,4 MB de JS sin empaquetar; después, el service worker lo tapa. Accesibilidad sobresaliente (axe: 0 infracciones en 9 de 10 pantallas) |
| 8. Datos | **4** | Registro de operaciones bien pensado, pero se reescribe entero en `localStorage` en cada respuesta, comparte 5 MB con todo el origen, no hay esquema formal del contenido y el modelo no tiene dónde poner una academia |

**Lo que hay que conservar** (detalle en §10): los motores puros y sus pruebas, el modelo de operaciones y pliegue de
la sincronización, la tubería de extracción y validación de bancos, la cuarentena de convocatorias, la accesibilidad
y la higiene del Worker.

**Opinión sobre refactor o reescritura** (detalle en §13, pregunta 1): ni una cosa ni la otra en bloque. **Conservar y tipar el
núcleo (≈ 54.000 líneas, 96–100 % cubiertas salvo `graphics`) y reescribir la carcasa** —interfaz, estilos, almacenamiento local, servicio
e identidad— por estrangulamiento, pantalla a pantalla, sobre un repositorio y un dominio propios. Reescribir el
núcleo sería tirar lo único que hoy está probado; refactorizar la interfaz actual sin red de pruebas (19 %) costaría
más que rehacerla con componentes.

## 2. Tamaño y estructura

### 2.1 Cifras

| Directorio | Líneas | Ficheros | Qué es |
| --- | ---: | ---: | --- |
| `src/exams/` | 19.671 | 60 | De ellas 16.741 en `solutions/` (49 ficheros): resoluciones programadas de exámenes reales |
| `src/illustrations/` | 17.101 | 95 | Generadores de SVG como cadenas de texto |
| `src/ui/` | 16.457 | 105 | `views/` 8.043 (37), `chart/` 1.375 (4) |
| `src/course/` | 9.072 | 41 | Motores del curso, plan, travesía, semana |
| `src/exercises/`, `store/`, `nautical/`, `theory/`, `bancos/` y otros 9 | ≈ 9.200 | 91 | Motores pequeños |
| `src/vendor/` | 2.237 | 1 | Generador de QR (terceros) |
| **`src/` total** | **73.745** | **393** | |
| `tests/` | 19.017 | 125 | |
| `tools/` | 8.019 | 61 | Más 5 guiones en Python |
| `styles/` | 3.800 | 2 | `app.css` 2.991 líneas y 255 KB; `laminas.css` 809 líneas y 78 KB |
| `sync-worker/src/` | 612 | 4 | Más 857 de pruebas |
| `data/` | — | 182 | 24 MB |
| `podcast/` | — | 164 | 306 MB (304 MB de MP3) |

Ficheros mayores: `styles/app.css` (2.991), `src/ui/views/theory.js` (1.336), ocho `src/exams/solutions/baleares-*.js`
(918–1.224 cada uno), `src/exams/kit.js` (976), `src/course/carta-pasos.js` (950),
`src/ui/chart/interactive-chart.js` (943). Lista completa en `metricas/01-lineas.txt`.

### 2.2 Hallazgos

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| E-01 | **Vistas que son una sola función.** Cada pantalla es un cierre gigante que mezcla estado, cálculo, eventos y construcción del DOM. No hay componente, ni ciclo de vida, ni forma de probar una parte | `src/ui/chart/interactive-chart.js:47` (`interactiveChart`, 788 líneas), `src/ui/views/curso.js:57` (`leccionView`, 454), `src/ui/guiado.js:107` (`guiadoPanel`, 454), `src/ui/views/theory.js:836` (`testView`, 438), `src/ui/views/hoy.js:136` (269). 22 funciones de más de 150 líneas, 7 de más de 300 (`metricas/04-eslint.txt`) | Alta | Es la parte que se rehace: componentes pequeños con estado explícito. No merece refactor in situ |
| E-02 | **`theory.js` es un nudo.** 1.336 líneas, importa 54 módulos, guarda la titulación activa en variables del módulo que una función cambia («una vista activa a la vez») | `src/ui/views/theory.js:61`, `:77-78` (`let T`, `let E`), `:134`; 44 avisos de lint, el fichero con más | Alta | Partir por pantallas (lista de exámenes, tanda, examen, resultados) al migrar |
| E-03 | **`app.js` importa todo al arrancar.** 64 importaciones estáticas; no hay carga diferida de rutas (solo 3 `import()` en todo el código). Abrir la app descarga los 393 módulos | `src/ui/app.js:7-70`; `metricas/11-arranque-y-axe.json` (393 `.js` en la primera carga) | Media | Rutas con carga diferida y empaquetado (ver R-01) |
| E-04 | **Contenido escrito como código.** Las resoluciones de exámenes (16.741 líneas) y las láminas (17.101) son el 46 % de `src/`. Son datos con forma de programa: cada convocatoria nueva añade ~1.000 líneas de JS que viajan en la precarga | `src/exams/solutions/` (49 ficheros), p. ej. `baleares-py-07.js` (1.224) | Media | Mantenerlas como código (tienen pruebas contra la geometría), pero fuera del arranque: un paquete de contenido cargado por banco |
| E-05 | **CSS monolítico.** 2.615 bloques de reglas y 1.425 clases en un fichero; 370 colores literales además de 102 variables; 148 estilos puestos desde JS. Sin ámbito: cualquier clase puede chocar con otra | `styles/app.css`; `metricas/13-css.txt`, `metricas/06-patrones.txt` | Media | CSS por componente con los tokens actuales (que están bien: claro, oscuro y automático comprobados por test) |
| E-06 | **CSS muerto, poco.** 38 clases de `app.css` sin rastro en el código (`.qnav`, `.qdot`, `.tit-card`, `.rose`, `.il-sky`…) y 1 de `laminas.css` | `metricas/13-css.txt` | Baja | Borrarlas; con CSS por componente deja de ocurrir |
| E-07 | **La regla de capas documentada deja fuera el 64 % del código.** `ARCHITECTURE.md` fija `math ← nautical ← chart ← exercises ← analysis ← graphics ← ai ← ui`, pero `course`, `exams`, `bancos`, `theory`, `illustrations` y `conceptos` (47.500 líneas) no están en la regla y nada la comprueba | `docs/ARCHITECTURE.md:49-50`; matriz real en `metricas/03-capas.txt` | Media | Declarar las capas completas y comprobarlas en CI (regla de importaciones) |
| E-08 | **Dependencias mutuas entre capas.** `course ↔ illustrations` (9/1), `course ↔ theory` (12/1), `course ↔ exams` (4/1), `bancos ↔ conceptos` (1/1). Y `store` (datos) importa hacia arriba: `bancos`, `course`, `exams` | `illustrations/tarjetas-c.js → course/tarjetas.js` y `course/tarjetas.js → illustrations/buoys.js`; `theory/ensayo.js → course/estrategia.js`; `exams/ensena.js → course/velocidad.js`; `store/progress.js:13` | Media | Al extraer el núcleo, separar «dominio» (preguntas, temario, reglas del examen) de «aprendizaje» (plan, repaso) y de «presentación» (láminas) |
| E-09 | **Solo 2 ciclos de importación**, los dos dentro de un mismo directorio | `exams/kit.js ↔ exams/avisos-pasos.js`, `course/ruta.js ↔ course/engine.js` (`metricas/02-ciclos-madge.txt`) | Baja | Romperlos al tipar; no bloquean |
| E-10 | **Código muerto acotado.** De 2.021 exportaciones, 29 no las usa nadie (ni su propio fichero) y otras 29 existen solo para los tests | `metricas/14-exportaciones-sin-uso.txt` (`renderChart`, `fromDegMin`, `rmFromRv`, `blockStats`…) | Baja | Borrar las 29; un linter las detecta solas |
| E-11 | **El Worker importa código de la app por ruta relativa.** La validación compartida se empaqueta con el Worker al desplegar; cliente y servidor pueden quedar con validadores distintos, y eso ya ha obligado a rodeos (E-12) | `sync-worker/src/servidor.js:16-18` (`'../../nautica/src/store/sync/…'`) | Media | Paquete compartido versionado («contrato») y despliegue conjunto |
| E-12 | **Datos nuevos colados en `settings` para no redesplegar el servidor.** Las correcciones de tema (`corr.<id>`) y el cuaderno de fallos (`fallo_<id>`) no son tipos de operación propios: son claves de ajustes porque el Worker desplegado rechazaría un tipo nuevo | `docs/SYNC.md` («Por qué así y no una colección…»); `src/store/sync/operaciones.js:69` | Media | Versionar el contrato de operaciones y poder desplegar el servidor con una orden; deja de hacer falta el truco |

**Lo que sí se cumple, y es raro en un proyecto sin herramientas:** ningún módulo fuera de `ui/` importa `ui/`; `store`
solo lo usa `ui`; solo dos ficheros fuera de `ui/` nombran `document` o `window` (`ai/api.js`, `store/sync/motor.js`);
no hay ni una asignación a `window.*` (el único global es `globalThis.nautica`, intencionado, `src/ai/api.js:57`).

## 3. Calidad

ESLint 9 con la configuración recomendada más reglas de complejidad y tamaño (`metricas/config/eslint.config.mjs`),
sobre `src/`, `sw.js` y `sw-lista.js`: **109 errores y 743 avisos** en 394 ficheros (`metricas/04-eslint.txt`).

| Regla | Casos | Nota |
| --- | ---: | --- |
| `complexity` > 10 | 407 | 102 por encima de 20, 29 por encima de 30, 6 por encima de 50 |
| `no-use-before-define` | 108 | Estilo: funciones auxiliares declaradas después |
| `no-unused-vars` | 107 | Importaciones y variables que sobran |
| `max-lines-per-function` > 80 | 60 | 22 por encima de 150 |
| `max-params` > 5 | 55 | |
| `no-shadow` | 41 | |
| `no-param-reassign` | 25 | |
| `no-await-in-loop` | 17 | |
| `no-undef` | **0** | Ninguna variable global sin declarar |
| `no-eval`, `no-implied-eval`, `no-new-func` | **0** | |

Funciones más complejas (ciclomática): `aplicarBases` 83 (`src/store/sync/plegar.js:94`), `validarOperacion` 66
(`src/store/sync/operaciones.js:91`), `validarConfig` 64 (`src/course/config-profe.js:51`), `estadoAlumno` 55
(`src/course/motor.js:54`), `resultados` 52 (`src/ui/views/theory.js:1158`), `planHoy` 51 (`src/course/plan.js:122`),
`estadoFinal` 50 (`src/course/final.js:56`), el cuerpo de `hoyView` 50 (`src/ui/views/hoy.js:156`).

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| C-01 | **Sin linter, sin formateador, sin `.editorconfig`.** El estilo es coherente porque casi todo lo escribe el mismo agente, no porque algo lo imponga. Líneas de 200–400 caracteres frecuentes en `ui/` | No existe configuración en el repositorio; `metricas/04-eslint.txt` | Alta | ESLint + Prettier (o Biome) en CI desde el primer día. Los 107 `no-unused-vars` se arreglan solos |
| C-02 | **Complejidad concentrada en piezas críticas.** Las dos funciones más complejas del proyecto son las que fusionan y validan el progreso del alumno. Están bien probadas (200 secuencias al azar contra el almacén antiguo), pero son difíciles de cambiar | `plegar.js:94` (83), `operaciones.js:91` (66), `fusion.js:47` (38) | Media | No tocarlas sin motivo; al tiparlas, partir por tipo de operación con un validador declarativo |
| C-03 | **Lógica de negocio dentro de las vistas.** La corrección de un examen, el cálculo de resultados y la decisión de qué enseñar viven en cierres de la vista | `src/ui/views/theory.js:1158` (`resultados`, complejidad 52), `src/ui/views/exams.js:143` (`renderQuestion`, 207 líneas), `src/ui/views/hoy.js:156-420` | Alta | Sacarla a funciones puras antes de rehacer la vista: es lo que permite probarla |
| C-04 | **Estado compartido en variables de módulo.** 53 `let` a nivel de módulo, casi todos en `ui/` (radio, calculadora, sesión, efectos, cuaderno), y un patrón `fijarX(…)` que inyecta dependencias en módulos globales al arrancar | `src/ui/radio.js:13-18`, `src/ui/calculadora.js:31,110,126,142`, `src/ui/cuaderno.js:15-17`, `src/bancos/index.js:80,93,101`, `src/ui/app.js:230-241` | Media | Un contenedor de estado explícito (o contexto del framework); los singletons impiden probar y tener dos instancias |
| C-05 | **Errores silenciados.** 238 `catch`, de ellos 40 vacíos y 58 `.catch(() => {})`. Muchos son correctos (almacenamiento no disponible, sin red), pero no hay forma de distinguirlos ni de enterarse de los que no lo son | `metricas/06-patrones.txt`; p. ej. `src/store/sync/registro.js:191`, `src/ui/views/theory.js:68-75` | Media | Una función única de «error esperado» que deje rastro; telemetría de errores opcional y sin datos personales |
| C-06 | **Sin manejador global de errores.** No hay `unhandledrejection` ni `error`. Si una vista falla al pintar, al alumno se le enseña la traza (`<pre>` con `e.stack`) | `src/ui/app.js:308`, `:323` | Media | Pantalla de error con «volver a Hoy» y registro del fallo |
| C-07 | **Oyentes globales sin ciclo de vida.** 42 `addEventListener` sobre `window`/`document` en `ui/` frente a 19 `removeEventListener`; se compensa comprobando `isConnected` en 43 sitios | `src/ui/views/theory.js:1034-1036`; `metricas/06-patrones.txt` | Media | Lo resuelve cualquier framework con desmontaje; a mano, un `AbortController` por vista |
| C-08 | **Duplicación baja** (1,79 %; 117 clones). El 92 % está en `exams/solutions/`, donde es esperable | `metricas/15-duplicacion.txt` | Baja | Nada urgente |
| C-09 | **Duplicación dentro del Worker.** `sincronizar` repite a mano el hash de IP y la lectura del cuerpo que ya existen como `limiteIp` y `leerJson` | `sync-worker/src/servidor.js:215-216` frente a `:120-125`; `:232-237` frente a `:128-133` | Baja | Usar las auxiliares |
| C-10 | **Nombres e idioma mezclados.** Motores antiguos en inglés (`createProgressStore`, `exerciseView`), todo lo nuevo en español (`crearRegistro`, `plegar`), a veces en el mismo fichero | `src/store/progress.js:45` frente a `:14-16` | Baja | Fijar convención en la arquitectura nueva; no renombrar por renombrar |

## 4. Tipado

| Medida | Valor |
| --- | --- |
| Bloques `/** … */` | 1.982 en 299 ficheros (casi todo prosa) |
| `@param` | 420 en 118 ficheros |
| `@returns` | 174 en 95 ficheros |
| `@typedef` | 1 |
| `// @ts-check` | 0 |
| Funciones y constantes exportadas | ≈ 1.520 (2.021 exportaciones en total) |
| `tsc --allowJs --checkJs --noEmit`, sin `strict` | **472 errores en 125 de 392 ficheros** (8 s) |
| Lo mismo con `strict` | **14.159 errores en 368 ficheros** (8.714 son `TS7006`, parámetro sin tipo) |

Errores sin `strict` por tipo: `TS2339` propiedad inexistente (170), `TS2345` argumento incompatible (69), `TS2353`
propiedad de más en un literal (56), `TS2362/2363/2365` aritmética con no números (95), `TS2322` asignación (37),
`TS2554` número de argumentos (13). Por directorio: `illustrations` 184, `ui` 133, `course` 103, `exams` 17, `store` 13,
`theory` 8 (`metricas/05-tsc.txt`).

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| T-01 | **No hay ningún contrato de tipos.** La forma de una pregunta, de una operación de sincronización o del progreso plegado solo está descrita en prosa (`docs/BANCOS.md`, `docs/SYNC.md`) y en comentarios | 1 `@typedef` en todo `src/` | Alta | Definir primero los tipos de dominio: `Pregunta`, `Banco`, `Operacion`, `Progreso`, `Titulacion`, `Leccion` |
| T-02 | **Los 472 errores sin `strict` incluyen fallos reales probables**: llamadas con argumentos de más (13 `TS2554`, p. ej. `src/course/dosis.js:364`, `src/course/engine.js:225`) y aritmética sobre valores que pueden ser texto (95 casos) | `metricas/05-tsc.txt` | Media | Revisar los `TS2554` y `TS236x` uno a uno: es la primera pasada barata |
| T-03 | **El núcleo está a un paso de poder tiparse.** `exams` (19.700 líneas) da 17 errores; `store` 13; `bancos`, `math`, `analysis`, `chart`, `graphics`, `bloc`, `ai` dan 0 | `metricas/05-tsc.txt` | — (oportunidad) | Empezar por ahí |

**Valoración: ¿TypeScript o JSDoc con `checkJs`?** Las dos son viables y no son excluyentes:

- *JSDoc + `checkJs`* no exige compilar y mantiene «un navegador y ya» para desarrollar. Sirve como transición: se
  enciende por directorio con `// @ts-check`, empezando por los que ya dan 0 errores. Su límite es la ergonomía: los
  tipos de dominio complejos (uniones de operaciones, genéricos) se escriben mal en comentarios y nadie los mantiene.
- *TypeScript* exige un paso de compilación, que de todos modos hace falta por rendimiento (R-01). Una vez hay
  empaquetador, la ventaja de JSDoc desaparece.

**Recomendación preliminar:** TypeScript estricto para todo lo nuevo y para el núcleo extraído; `checkJs` sin `strict`
como puerta de CI inmediata sobre el código actual (objetivo: 472 → 0) mientras dure la migración. Los 14.159 errores
del modo estricto no son un presupuesto de trabajo: 8.714 se van al anotar parámetros según se migra cada módulo.

## 5. Pruebas

| Medida | Valor |
| --- | --- |
| Casos (`node --test`) | 2.581 en 122 ficheros (1.016 `test(…)`; el resto son subcasos generados por datos) |
| Resultado en `main` sin `npm install` | 2.575 pasan, 5 se saltan, **1 falla** (`tests/sync-qr.test.js`: necesita `jsqr`, que es `devDependency`) |
| Duración | 37 s de reloj (114 s de CPU); el caso más lento, 14,4 s |
| Cobertura de líneas que informa Node | 89,6 % líneas, 92,7 % ramas, 92,3 % funciones… **solo sobre los ficheros que algún test carga** |
| Cobertura real de `src/` (contando los 47 ficheros que ningún test carga) | **≈ 80 %** de líneas |
| Worker | 40 casos (36 pasan, 4 se saltan sin las dependencias instaladas), 1 s |

Cobertura por directorio (`metricas/08-cobertura.txt`): `exams`, `course`, `calculadora` 100 %; `illustrations`,
`exercises`, `bancos`, `math`, `theory`, `conceptos`, `analysis`, `chart` 99 %; `store` 96 %; **`graphics` 42 %;
`ui` 19 %** (32 % sobre lo que se carga); `ai` 0 %.

Qué tipo de pruebas son (`metricas/07-tests.txt`):

- **Unitarias de motor puro**: la mayoría y las mejores. Fechas y azar inyectados, sin DOM.
- **De contrato de datos**: 62 ficheros leen `data/` y comprueban invariantes sobre el contenido real (cada pregunta
  de carta se resuelve con el kit y sale la respuesta oficial; ninguna pregunta reservada sale por ninguna puerta; cada
  paso preguntado termina en el valor pedido). Son las que más valor tienen y las más lentas.
- **De propiedad y equivalencia**: 200 secuencias al azar del almacén nuevo contra una copia literal del antiguo;
  convergencia de dos aparatos en cualquier orden; rendimiento con 20.000 operaciones.
- **De integración en Node**: almacén + motor + Worker con un D1 en memoria (`tests/sync-motor.test.js`).
- **De texto**: 36 ficheros leen `styles/*.css` o ficheros de `src/ui/` **como texto** y comprueban con expresiones
  regulares que contienen cierta regla o cierta cadena.

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| P-01 | **La interfaz casi no está probada.** 47 ficheros (6.845 líneas) no los carga ningún test: `views/hoy.js`, `views/exams.js`, `views/travesia.js`, `app.js`, `views/fallos.js`… Y los que sí se cargan: carta interactiva 5 %, clase 9 %, paso a paso 10 %, examen 17 % | `metricas/08-cobertura.txt` | Alta | E2E con Playwright sobre los recorridos críticos antes de tocar la interfaz (son las pruebas de caracterización que pide VERSION-2) |
| P-02 | **No hay E2E versionado.** Los documentos citan «la revisión con Playwright» y capturas a 360 y 990 px, pero en el repositorio no hay ni un guion ni una dependencia de Playwright | Búsqueda de `playwright` en el repositorio: 0 ficheros de código; `tests/hoy-css.test.js:1-3`; `docs/ROADMAP.md:237` | Alta | Carpeta `e2e/` con los recorridos: primera visita, clase, tanda, examen completo, carta, sincronizar dos aparatos, actualizar versión, sin conexión |
| P-03 | **Pruebas que fijan el texto del CSS y del código.** Suplen la falta de E2E comprobando que el CSS contiene literalmente `min-width: 44px; min-height: 44px` o que cierta función menciona cierta ruta. Se rompen al reordenar una regla y no detectan que la pantalla esté mal | `tests/animaciones.test.js:363-365`, `tests/hoy-travesia-c.test.js:121-125`, `tests/estrategia.test.js:184`, `tests/hoy-css.test.js:8-22`; 36 ficheros (`metricas/07-tests.txt`) | Media | No se migran: se sustituyen por E2E (tamaño real del botón, desborde real) y pruebas de componente |
| P-04 | **La cifra de cobertura engaña.** Node solo cuenta los ficheros cargados; el 89,6 % esconde los 47 que no se cargan | `metricas/08-cobertura.txt` | Media | En CI, cobertura con `--all` (c8) y umbral por directorio |
| P-05 | **`npm test` no pasa recién clonado.** Un test falla sin `npm install`; otros dos se saltan en silencio por lo mismo, y dos más por falta de una caché que no está en git | `tests/sync-qr.test.js`; `metricas/07-tests.txt` (5 `SKIP`) | Baja | `npm ci` en CI; que un salto por dependencia ausente sea fallo en CI |
| P-06 | **Nada ejecuta los tests antes de publicar.** Depende de que quien publica se acuerde | No existe `.github/`; `docs/ROADMAP.md:237` | Alta | Ver M-01 |
| P-07 | **API exportada solo para los tests.** 29 exportaciones no se usan ni dentro de su fichero salvo desde `tests/`; otras 202 exportaciones solo se importan desde tests o herramientas | `metricas/14-exportaciones-sin-uso.txt` | Baja | Normal en parte; revisar al extraer el núcleo qué es API pública de verdad |
| P-08 | **37 s es buen tiempo** para 2.581 casos, y el 60 % se va en 5 barridos sobre el banco real | `metricas/07-tests.txt` | — (bien) | Separar «rápidas» y «de contenido» en CI para tener respuesta en 10 s |

## 6. Seguridad

Solo revisión de código. No se ha llamado a producción.

### 6.1 Cliente

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| S-01 | **Origen compartido.** La app se sirve bajo una ruta del dominio `*.github.io` de la cuenta. `localStorage`, IndexedDB y la cuota de 5 MB se comparten con cualquier otro sitio publicado bajo ese mismo dominio (el repositorio contiene otros proyectos). Cualquier JavaScript de esos sitios puede leer el código de alumno (la credencial) y todo el progreso | `docs/SYNC.md` («compartidos con lo demás de…»); `src/store/sync/registro.js:45`; CORS del Worker por origen, no por ruta (`sync-worker/src/servidor.js:41-43`) | **Alta** | Dominio propio para la app antes de cualquier cuenta o cobro. Ojo: cambiar de origen deja atrás el almacenamiento local; hay que planificar el traslado (el propio código de alumno sirve de puente) |
| S-02 | **Sin política de seguridad de contenido (CSP).** No hay cabecera (GitHub Pages no deja ponerlas) ni `<meta http-equiv>`; hay un script en línea en `index.html` | `index.html:15` | Media | Con servidor propio: CSP estricta por cabecera (`script-src 'self'`), mover el script en línea a un fichero o usar hash |
| S-03 | **`innerHTML` controlado, pero sin barrera.** 18 asignaciones directas y 15 usos de `h(…, { html })`. En todos los revisados el contenido es SVG generado por código propio, y el texto del usuario que llega a la carta se escapa (`esc`). No se ha encontrado XSS. Pero nada lo impide mañana: `h()` acepta `html` con cualquier cadena | `src/ui/dom.js:18`; `src/ui/chart/interactive-chart.js:296-314`; escape en `src/graphics/chart-renderer.js:31,182` y `src/illustrations/estilo-c.js:32`; configuración del profesor saneada y pintada como texto (`src/course/config-profe.js:8-9,31`) | Baja (hoy) | CSP + `Trusted Types`, o un tipo `SvgSeguro` que solo produzcan los generadores. El riesgo sube cuando haya contenido escrito por academias |
| S-04 | **La URL del servidor de sincronización se puede cambiar desde `localStorage`** con cualquier `http(s)://host`. Pensado para pruebas, pero junto con S-01 permite que otro sitio del mismo origen redirija la sincronización —y con ella el código del alumno— a un servidor ajeno | `src/store/sync/config.js:14-18` | Media | Quitarlo de producción (solo en `localhost`) |
| S-05 | **La credencial vive en claro en `localStorage` y viaja en un enlace.** El código está en `nautica.sync.v1` y en `#/vincular/<código>` (QR). El fragmento no llega al servidor, pero queda en el historial y en capturas | `src/store/sync/registro.js`; `src/ui/dispositivos.js:22`; `docs/SYNC.md` («Interfaz») | Media | Aceptable para el prototipo; con cuentas, el enlace de vinculación debe ser de un solo uso y caducar |
| S-06 | **Service worker: actualización correcta, invalidación frágil.** Estrategia «primero la caché» para todo, incluido `index.html`; la versión es un hash del contenido y la actualización espera al alumno (nunca a mitad de examen). El fallo posible es de proceso: si se publica sin regenerar `sw-lista.js`, la versión no cambia y **nadie recibe la actualización**; lo protege un test que nadie está obligado a ejecutar | `sw.js:19,23,55-68`; `tools/precache.mjs`; `tests/pwa.test.js:9-10` | Media | Generar la lista en el build, no a mano (M-02). Añadir un «interruptor de emergencia» (un SW que se desinstala) documentado |
| S-07 | **Dependencias del cliente: limpias.** 0 dependencias de ejecución, 3 de desarrollo, `npm audit`: 0 vulnerabilidades. Una librería de terceros copiada en `src/vendor/` (QR, MIT) sin versión anotada | `package.json`; `metricas/09-npm-audit.txt`; `src/vendor/qrcode-generator.js` | Baja | Anotar versión y origen del vendor, o pasarlo a dependencia cuando haya empaquetador |
| S-08 | **Secretos: no se han encontrado.** Búsqueda en el árbol y en las 972 confirmaciones de todas las ramas por patrones de claves privadas, tokens de proveedores y asignaciones a `PEPPER`, `VAPID_PRIVATE`, `API_TOKEN`, `secret`, `password`: solo aparecen valores de prueba en los tests y marcadores en la documentación. Nunca se ha añadido un `.env`, `.dev.vars`, `.pem` o `.key` | Búsquedas con `git log --all -G…` y `--diff-filter=A` (sin imprimir valores) | — (bien) | Añadir escaneo de secretos a CI. `.dev.vars` está ignorado en `sync-worker/.gitignore` y `.env.local` en `nautica/.gitignore`; un `.env` a secas no lo está en ninguno: añadirlo |
| S-09 | **Claves de prueba en el repositorio**, marcadas como tales (par VAPID y par ECDH de los tests). La pública de producción es distinta de la de prueba | `sync-worker/tests/claves-prueba.js` | Baja | Correcto; mantener la separación y no reutilizarlas nunca |

### 6.2 Worker de sincronización

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| S-10 | **Identidad = un código de 12 símbolos, para siempre.** ≈ 54 bits de azar (31¹¹), generado con `crypto.getRandomValues`, guardado solo como hash SHA-256 con pepper. Suficiente contra fuerza bruta con los límites actuales. Pero quien lo ve una vez (una foto de la pantalla, un QR, S-01) tiene acceso completo de lectura y escritura sin caducidad, **y no hay forma de revocarlo ni de cambiarlo** | `src/store/sync/codigo.js:9-33`; `sync-worker/src/servidor.js:72,213-257` | Alta para un servicio de pago · Media hoy | Cuentas opcionales con sesiones revocables; el código pasa a ser un medio de vinculación, no la credencial |
| S-11 | **El pepper no se puede rotar** sin dejar a todos los alumnos sin acceso, y si se pierde hay que vaciar la tabla | `docs/SYNC.md` («El PEPPER no se puede cambiar») | Media | Identificador de versión del pepper en el hash, o identidad basada en cuenta |
| S-12 | **Sin derechos RGPD en el producto.** No existe ruta de borrado ni de exportación: borrar un alumno es una orden SQL a mano sobre producción. No hay política de privacidad ni aviso en la app (0 apariciones de «privacidad» en `src/` e `index.html`). No hay caducidad de datos: `alumnos` y `operaciones` no se borran nunca (solo las suscripciones de push, a los 120 días) | `docs/SYNC.md` («Borrar un alumno»); `sync-worker/src/avisos.js:24,97-103`; `sync-worker/schema.sql` | **Alta** (bloquea cobrar) | Borrado y exportación desde la app, política publicada, retención definida (p. ej. borrar tras N meses sin actividad), registro de tratamientos |
| S-13 | **Los datos son seudónimos, no anónimos.** El servidor no guarda código ni IP en claro (bien), pero sí el historial completo de respuestas con instantes, la zona horaria y el punto de acceso de push de cada aparato. `docs/SYNC.md` lo describe como «nada que lo identifique»: a efectos del RGPD siguen siendo datos personales | `sync-worker/schema.sql` (tablas `operaciones`, `avisos`) | Media | Corregir la afirmación en la documentación y tratarlo como dato personal |
| S-14 | **Agotamiento de almacenamiento sin autenticación.** Cualquiera puede crear alumnos (20 por IP y día) y cada uno admite 100.000 operaciones de hasta 64 KB con claves de ajuste casi libres. Con los límites actuales un solo código puede subir del orden de 15 MB por minuto. No hay tope global | `sync-worker/src/servidor.js:24-34` (`LIMITES`), `:27`; `src/store/sync/operaciones.js:27,69` | Media | Tope de bytes por alumno y global, alerta de crecimiento, y altas ligadas a algo más que la IP cuando haya cuentas |
| S-15 | **Límites de tasa hechos con escrituras en D1.** Cada petición hace 2–3 escrituras en `limites` antes de autenticar. Funciona y está probado, pero consume cuota de escritura y la limpieza es probabilística (2 % de las peticiones) | `sync-worker/src/servidor.js:75-86,218-221` | Baja | En servidor propio: limitador en memoria o en el proxy inverso |
| S-16 | **CORS admite `http://localhost:*` en producción.** Cualquier página servida en local en el equipo del alumno pasa el filtro de origen. CORS no es la identidad aquí, así que el riesgo es bajo | `sync-worker/src/servidor.js:44` | Baja | Solo en el entorno de desarrollo |
| S-17 | **Sin inyección SQL.** Todas las consultas usan parámetros enlazados (`?1`…); los lotes entran por `json_each` sobre un JSON ya validado. Validación de entrada estricta: lista cerrada de claves, tipos, tamaños, instantes razonables | `sync-worker/src/servidor.js:77-79,169,186-192,279-285`; `src/store/sync/operaciones.js:91-…` | — (bien) | Conservar el patrón |
| S-18 | **Sin registros con datos sensibles.** La observabilidad de Cloudflare está apagada a propósito para que la cabecera `Authorization` no acabe en ningún registro; los errores solo registran la ruta y el mensaje | `sync-worker/wrangler.toml:30-32`; `sync-worker/src/servidor.js:114` | — (bien), pero ver M-07 | Registros estructurados que redacten la cabecera, en vez de no tener ninguno |
| S-19 | **Dependencias de desarrollo del Worker con avisos.** `npm audit`: 4 vulnerabilidades altas, todas de `undici` a través de `miniflare`/`wrangler`; `miniflare` está fijado a una versión *alpha*. No se despliegan (el Worker no tiene dependencias de ejecución) | `metricas/09-npm-audit.txt`; `sync-worker/package.json` | Baja | Actualizar `wrangler`; Dependabot o Renovate |

### 6.3 Infraestructura y publicación

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| S-20 | **Publicar es hacer push a una rama.** GitHub Pages sirve una rama de despliegue; lo que llega ahí está en producción al momento, sin puerta. Quien tenga permiso de escritura en el repositorio (personas, agentes con token, aplicaciones autorizadas) puede publicar código que se ejecuta en el navegador de todos los alumnos con acceso a su progreso y su código | `docs/RAMAS.md` («Rama de despliegue»); `README.md` («Publicación gratuita») | **Alta** | Protección de rama, despliegue solo desde CI tras pasar las pruebas, y revisión obligatoria. Comprobar en los ajustes del repositorio quién tiene escritura (no se ve desde el código) |
| S-21 | **El Worker se despliega a mano** desde el equipo del dueño con `wrangler deploy`; no queda constancia de qué versión del código está desplegada salvo la constante `VERSION` | `docs/SYNC.md` («Despliegue (lo hace el dueño, a mano)»); `sync-worker/src/servidor.js:22` | Media | Despliegue desde CI con etiqueta de versión |
| S-22 | **Ya hubo un incidente.** Una orden de borrado sin condición sobre producción eliminó alumnos reales y se supo por el aviso de un alumno. Se mitigó con la recomposición automática desde los aparatos, no con controles | `docs/VERSION-2.md` (§1, «Lección que motiva la fase 0») | Alta | Copias automáticas probadas, acceso de solo lectura por defecto, cambios en producción solo por migración revisada |
| S-23 | **Repositorio personal con varios proyectos.** La app vive en una carpeta de un repositorio que contiene otros proyectos en otras ramas; el contenido (preguntas oficiales, audio, guiones) se publica junto con el código. `docs/PRODUCTO.md` §9 reconoce que los derechos de las preguntas y de la carta están sin aclarar | `docs/RAMAS.md`; `docs/PRODUCTO.md` §9 | Media (legal, no técnica) | Repositorio propio; decidir qué es público |

## 7. Mantenimiento

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| M-01 | **No hay integración continua.** No existe `.github/`. Nada ejecuta pruebas, lint ni tipos; nada impide fusionar o publicar en rojo | Raíz del repositorio | **Alta** | Es la primera tarea, antes de cualquier arquitectura: un flujo que ejecute pruebas, lint, `checkJs` y la comprobación de la precarga en cada PR |
| M-02 | **La precarga se regenera a mano.** Tras tocar cualquier fichero hay que ejecutar `npm run precache`, que reescribe `sw-lista.js` (592 líneas) y la primera línea de `sw.js`. Cada PR lleva ese ruido y dos ramas paralelas chocan siempre en esos dos ficheros | `tools/precache.mjs`; `README.md:127`; `sw-lista.js` | Media | Generarlo en el build y no versionarlo |
| M-03 | **Registro de cambios y hoja de ruta a mano**, con reglas escritas («en el mismo commit», «al desplegar pasa a su fecha y versión») que dependen de la disciplina de quien publica | `CHANGELOG.md:5-13`; `docs/ROADMAP.md:8-18` | Baja | Aceptable; automatizar la entrada de versión al publicar |
| M-04 | **El repositorio pesa 377 MiB por el audio.** 304 MB de MP3 en el árbol; 244 MiB empaquetados más 133 MiB sueltos. Cada regeneración de episodios añade otra copia al historial para siempre. GitHub Pages tiene un límite blando de 1 GB por sitio y por repositorio | `git count-objects -vH`; `podcast/audio/` (62 MP3 de unos 5 MB) | Media | Sacar el audio a almacenamiento de objetos (o a ficheros estáticos del servidor propio) y dejar en git solo guiones e índice. Limpiar el historial al estrenar repositorio |
| M-05 | **Una sola persona.** Un autor humano; el 87 % de los commits los firma un agente. El conocimiento está en `docs/` (22 documentos, 7.360 líneas) y eso es mucho mejor que nada, pero el dueño depende de que un agente lea esos documentos para cambiar algo | `git shortlog -sn --no-merges main` (371 / 56) | Alta | Herramientas que impongan las reglas (CI, tipos, lint) en lugar de documentos que las describen; arquitectura convencional que cualquier desarrollador reconozca |
| M-06 | **Documentación exhaustiva pero ilegible.** `ARCHITECTURE.md` son 54 KB en 495 líneas, con filas de tabla de 900 caracteres que mezclan ruta, fichero, función, test, id de requisito y decisión. Es un registro de todo lo hecho, no una guía de la arquitectura. Además su regla de capas está desfasada (E-07) | `docs/ARCHITECTURE.md` (línea más larga: 903 caracteres) | Media | Separar: una guía corta de arquitectura, registros de decisiones (ADR) fechados, y la referencia generada a partir del código |
| M-07 | **Sin observabilidad.** Registros del Worker apagados (por una buena razón, S-18), sin alertas, sin métricas de uso ni de errores del cliente, sin copias automáticas de D1. Lo único que hay es un diagnóstico que el alumno puede copiar a mano | `sync-worker/wrangler.toml:30-32`; `docs/SYNC.md` («Diagnóstico») | Alta | Registros estructurados sin datos personales, alerta de errores 5xx y de crecimiento, copia diaria con restauración probada |
| M-08 | **Tubería de datos bien hecha pero a mano.** `tools/bancos/` es una cadena de 8 etapas (manifiesto → extraer → repetidas → correcciones → clasificar → normativa → validar → escribir) con adaptadores por tribunal y 5 guiones en Python para leer PDF y hojas ópticas; sus cachés no están en git, así que no se puede reproducir un banco sin volver a descargar las fuentes | `tools/bancos/bancos.mjs:4-10`; `.gitignore` (`nautica/.cache/`); `README.md` dice «sin Python» | Media | Es un activo: versionar entradas (o su huella) y ejecutar la validación en CI. Corregir el README |
| M-09 | **Datos generados y escritos a mano mezclados en `data/`** sin marca que los distinga: `preguntas.json` sale de la tubería; el curso, las explicaciones y las etiquetas de conceptos se editan a mano; `temas-revisados.json` son 346 decisiones manuales que una herramienta aplica encima | `data/ejes/*/`, `data/curso/`, `tools/bancos/temas-revisados.json` | Media | Separar «fuente» (editable) de «compilado» (generado, no versionado o claramente marcado) |
| M-10 | **Higiene de ramas costosa.** Se llegaron a acumular 186 ramas remotas; los agentes no pueden borrarlas | `docs/RAMAS.md` | Baja | Activar el borrado automático de ramas al fusionar |

## 8. Rendimiento y accesibilidad

Medido en local con Chromium (Playwright), sin service worker, sirviendo con `python3 -m http.server` (HTTP/1.1, sin
compresión) y con las peticiones a `workers.dev` cortadas. `metricas/11-arranque-y-axe.json`, `metricas/12-datos-al-inicio.txt`.

| Medida | Valor |
| --- | --- |
| Peticiones en la primera carga | **403** (393 módulos JS) |
| Bytes de la primera carga | 4,9 MB sin comprimir (JS 4,38 MB; ≈ 1,4 MB con gzip) |
| Primera pintura con contenido | 104 ms (el HTML ya lleva la cabecera) |
| Pantalla lista, equipo de escritorio | 0,95 s (mediana de 5) |
| Pantalla lista, CPU ×4 (móvil modesto) | 2,1 s |
| Pantalla lista, CPU ×4 y red de 1,6 Mbps con 150 ms de latencia | **28 s** (en HTTP/1.1; en producción, con HTTP/2 y compresión, será bastante menos, pero siguen siendo 393 peticiones encadenadas por el grafo de importaciones) |
| JSON que se descarga y analiza al abrir «Hoy» (PER) | 22 ficheros, **4,5 MB** (el banco entero, 2,2 MB; el curso, 0,7 MB; las explicaciones, 0,7 MB) |
| Memoria JS en «Hoy» | ≈ 23 MB |
| Precarga del service worker | App: 405 ficheros, 4,8 MB (1,6 MB gzip). Datos: 181 ficheros, **23,5 MB** (5,9 MB gzip) |

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| R-01 | **Sin empaquetado ni carga diferida.** La primera visita descarga todos los módulos de todas las pantallas, uno por petición y en cascada (el navegador solo descubre un módulo al analizar el que lo importa) | 403 peticiones; `src/ui/app.js:7-70` | Alta para la primera visita con mala cobertura · Baja después (la caché del SW lo tapa) | Empaquetador (Vite/Rollup) con trozos por ruta: del orden de 10–15 peticiones y 300–400 KB comprimidos para «Hoy» |
| R-02 | **La precarga baja los tres tribunales y las dos titulaciones a todo el mundo.** 23,5 MB de datos aunque el alumno solo estudie un tribunal y el PER (≈ 3,6 MB) | `metricas/10-precache.txt`; `sw.js:28-37` | Media | Precarga por tribunal y titulación elegidos; el resto, bajo demanda |
| R-03 | **Cada pantalla analiza el banco completo.** 2,2 MB de JSON del banco más 0,7 MB de explicaciones para pintar «Hoy», que enseña una tarjeta | `metricas/12-datos-al-inicio.txt` | Media | Índice ligero para planificar y preguntas por tema bajo demanda; o base local (IndexedDB/SQLite en el navegador) con consultas |
| R-04 | **El coste de arranque crecerá con el contenido.** Cada convocatoria añade ~1.000 líneas de resoluciones a la precarga y cada tribunal 1–4 MB de preguntas | E-04; `metricas/10-precache.txt` | Media | Contenido como paquetes versionados por banco |
| R-05 | **Accesibilidad: muy bien.** axe-core (WCAG 2.0/2.1/2.2 A y AA) en 10 pantallas a 390 px: 0 infracciones en 9; 1 en la mesa de cartas (una tabla desplazable sin foco). En el código: 428 atributos `aria-*`, 85 `role`, 48 reglas `:focus-visible`, 14 bloques `prefers-reduced-motion`, objetivos táctiles de 44 px comprobados por test, tres tamaños de letra, tema claro y oscuro | `metricas/11-arranque-y-axe.json`; `metricas/06-patrones.txt` | — (bien) | Conservar. Añadir axe a los E2E para no perderlo en la migración. Falta una revisión manual con lector de pantalla |

## 9. Datos

Cómo se guarda hoy cada cosa:

| Qué | Dónde | Forma |
| --- | --- | --- |
| Preguntas (10.182), explicaciones, distractores | `data/ejes/<tribunal>/<titulación>/*.json` en git | Un fichero por banco; lo genera `tools/bancos/` y lo validan los tests |
| Curso, rutas, conceptos, fórmulas, estrategia | `data/curso/`, `data/conceptos/`, `data/comun/` en git | JSON escrito a mano |
| Resoluciones de carta | `src/exams/solutions/*.js` | Código |
| Láminas y animaciones | `src/illustrations/` | Código que genera SVG |
| Audio | `podcast/audio/*.mp3` en git | 304 MB |
| Progreso del alumno | `localStorage` `nautica.sync.v1` (registro de operaciones) y `nautica.progress.v1` (progreso plegado) | JSON; se reescriben enteros en cada escritura |
| Datos solo del aparato | Otras 12 claves de `localStorage` (errores, tiempos, bloc, calculadora, avisos, aspecto…) | JSON |
| Carta escaneada del alumno | IndexedDB (`src/store/user-chart.js`) | Imagen; nunca sale del aparato |
| Copia en servidor | D1: `alumnos`, `operaciones` (JSON por fila), `limites`, `avisos` | SQLite gestionado |

| Id | Hallazgo | Evidencia | Gravedad | Recomendación |
| --- | --- | --- | --- | --- |
| D-01 | **El registro local se serializa entero en cada respuesta.** Cada escritura hace `JSON.stringify` de todo el registro (hasta ~2 MB con 20.000 operaciones) y lo guarda en `localStorage`, que es síncrono y bloquea la interfaz; además se guarda el progreso plegado. El coste por respuesta crece con la antigüedad del alumno | `src/store/sync/registro.js:45`; `docs/SYNC.md` («Tamaño») | Alta a medio plazo | IndexedDB (o SQLite en el navegador) con una fila por operación y escritura incremental |
| D-02 | **Tope de 5 MB compartido y sin compactación.** El registro crece para siempre (~100 bytes por respuesta); la compactación está descrita como «solución futura, aún no hecha». Si no cabe, el registro sigue en memoria y el diagnóstico dice «almacenamiento: error» | `docs/SYNC.md` («Si un día no cabe…»); S-01 | Alta a medio plazo | Compactar lo ya confirmado por el servidor en una base; origen propio |
| D-03 | **Sin esquema formal del contenido.** La forma de una pregunta (≈ 25 campos) solo está en `docs/BANCOS.md` y en los tests. Un campo mal escrito en el curso se publica igual que un cambio de código | `docs/BANCOS.md` («Pregunta normalizada»); T-01 | Media | JSON Schema o un validador tipado (zod, valibot) como fuente única, del que salgan los tipos y la validación de CI |
| D-04 | **El servidor guarda operaciones opacas.** `operaciones.json` es texto; no se puede preguntar a la base «¿cuántos alumnos han hecho un simulacro esta semana?» sin plegar el registro de cada uno en código. Es deliberado («el servidor es tonto»), y es exactamente lo que impide la vista de profesor | `sync-worker/schema.sql`; `docs/SYNC.md` | Alta para el producto que se quiere | Mantener el registro como fuente de verdad y añadir proyecciones consultables en el servidor (respuestas, sesiones, exámenes) |
| D-05 | **El modelo no tiene entidades.** Solo existe «alumno = hash de un código». No hay usuario, aparato, academia, grupo, profesor, matrícula, pase ni consentimiento. Tampoco hay relación entre el progreso y la versión del banco con que se generó | `sync-worker/schema.sql` (4 tablas) | Alta para academias y cobro | Modelo relacional nuevo junto al registro; no forzarlo dentro de D1 tal como está |
| D-06 | **Identificadores de pregunta ligados al tribunal y la convocatoria** (`and-2020-c1-t01`), con un mecanismo de equivalencias para las repetidas. Funciona para tres tribunales; el progreso queda atado a esos ids para siempre | `data/ejes/andalucia/per/preguntas.json`; `src/bancos/equivalentes.js` | Media | Definir en la arquitectura la política de ids estables y de migración de progreso cuando un banco se corrige |
| D-07 | **La extensibilidad a más titulaciones y tribunales existe, pero solo en el cliente.** `TITULACIONES` y los «ejes» permiten añadir PNB o un tribunal nuevo con datos y una entrada de configuración; ningún código fuera de `src/bancos` nombra un banco concreto | `src/theory/blocks.js`; `docs/ARCHITECTURE.md:60-70`; `docs/BANCOS.md` («Cómo añadir un eje») | — (bien) | Conservar el concepto de eje |
| D-08 | **Catorce claves de `localStorage` sin inventario ni migraciones.** Cada módulo define la suya; solo el progreso tiene versión y migración probada | `metricas/06-patrones.txt` («claves localStorage») | Baja | Un único módulo de almacenamiento local con esquema versionado |
| D-09 | **La configuración del profesor es un fichero que se pasa a mano.** El «modo profesor» actual genera un JSON que el alumno importa; no hay relación viva profesor–alumno | `src/course/config-profe.js:1-14` | Media | Es un buen prototipo del contenido que querrá editar una academia; en el servicio será una entidad del servidor |

**Límites para crecer, en una línea cada uno:**

- *Más alumnos:* el Worker aguanta; el tope es D1 y el control de abuso (S-14).
- *Más titulaciones o tribunales:* cabe en el diseño de ejes; el límite es el peso de la precarga (R-02, R-04).
- *Cuentas:* no hay nada; hay que construir identidad y sesión (S-10).
- *Profesor y academias:* el servidor no puede contestar ninguna pregunta sobre el progreso (D-04) ni sabe qué es un grupo (D-05).
- *Cobro:* bloqueado por RGPD (S-12), por los derechos del contenido y por no tener cuentas.

## 10. Lo que está bien y hay que conservar

| Qué | Por qué | Evidencia |
| --- | --- | --- |
| **Motores puros, sin DOM y con dependencias inyectadas** | `course`, `exams`, `bancos`, `theory`, `math`, `nautical`, `store/sync`: ≈ 54.000 líneas (con láminas) que se ejecutan igual en Node y en el navegador, con fecha, azar y almacenamiento como parámetros | 2 ficheros fuera de `ui/` nombran `document`/`window`; cobertura 96–100 % (`metricas/08-cobertura.txt`) |
| **Las pruebas de contenido** | Cada pregunta de carta se resuelve con el kit y debe salir la respuesta oficial; ninguna pregunta reservada sale por ninguna puerta. Son la garantía de que el producto no enseña cosas falsas | `tests/guiado.test.js`, `tests/cuarentena.test.js`, barridos de `metricas/07-tests.txt` |
| **El modelo de operaciones y pliegue** | Registro de eventos con id único, pliegue determinista, convergencia probada en cualquier orden, sin conexión de verdad, recomposición si el servidor pierde datos. Es difícil de hacer bien y está bien hecho | `src/store/sync/plegar.js`, `fusion.js`; `tests/sync-plegar.test.js`, `tests/sync-motor.test.js` |
| **Higiene del Worker** | Consultas parametrizadas, validación estricta compartida con el cliente, límites por IP y por alumno, hash con pepper, ni código ni IP en claro, sin registros con credenciales, interruptor de emergencia para los avisos | `sync-worker/src/servidor.js`; `sync-worker/wrangler.toml` |
| **La tubería de bancos** | Extracción por etapas con adaptadores por tribunal, huellas, validación y cuarentena de convocatorias reservadas | `tools/bancos/`, `docs/BANCOS.md`, `docs/CUARENTENA.md` |
| **Accesibilidad y diseño para gente mayor** | 0 infracciones de axe en 9 de 10 pantallas, tres tamaños de letra, objetivos de 44 px, movimiento reducido, claro y oscuro con tokens | `metricas/11-arranque-y-axe.json` |
| **El concepto de eje y de titulación** | Añadir un tribunal o una titulación es añadir datos, no tocar las vistas | `src/bancos/registro.js`, `src/theory/blocks.js` |
| **Cero dependencias de ejecución** | No hay cadena de suministro que vigilar en el cliente | `package.json` |
| **Actualización de versión que respeta al alumno** | Nunca cambia a mitad de un examen; la versión es un hash del contenido | `sw.js:19-23`, `src/ui/pwa.js` |
| **La costumbre de documentar las decisiones y sus motivos** | Aunque el formato sea mejorable (M-06), el porqué de casi todo está escrito | `docs/SYNC.md`, `docs/BANCOS.md` |
| **Auxiliar `h()` para el DOM** | Texto como nodos de texto por defecto: es la razón de que no haya XSS. Y su forma (`h('div.clase', attrs, hijos)`) hace casi mecánica una migración a un framework de tipo *hyperscript*/JSX | `src/ui/dom.js:3-24` |

## 11. Los diez riesgos principales

| # | Riesgo | Hallazgos | Por qué va aquí |
| ---: | --- | --- | --- |
| 1 | **Publicar sin puerta**: un push a una rama pone código en el navegador de todos los alumnos, sin pruebas automáticas ni revisión | M-01, S-20, P-06 | Probabilidad alta (ya se publica así a diario), impacto total |
| 2 | **Identidad sin cuentas ni revocación**, sobre un **origen compartido** con otros sitios | S-10, S-01, S-04 | Bloquea academias y cobro; hoy cualquier script del mismo dominio lee la credencial |
| 3 | **Sin derechos RGPD, sin política de privacidad y sin retención** | S-12, S-13 | Bloquea cobrar y es exigible ya, aunque sea gratis |
| 4 | **Interfaz sin pruebas y en funciones de 400–800 líneas**: cada cambio visual es a ciegas | E-01, E-02, C-03, P-01, P-02 | Es donde más se trabaja (rediseños de densidad en curso) y donde menos red hay |
| 5 | **Operación a ciegas**: sin registros, alertas ni copias probadas; ya hubo un borrado accidental en producción | M-07, S-22, S-21 | Una pérdida de datos se descubre cuando un alumno se queja |
| 6 | **Dependencia de una persona y de un agente**; las reglas viven en documentos, no en herramientas | M-05, M-06, C-01 | Si el dueño para, nadie puede continuar con seguridad |
| 7 | **Almacenamiento local que no escala**: registro entero reescrito en cada respuesta, 5 MB compartidos, sin compactación | D-01, D-02 | Los alumnos más fieles son los primeros que lo sufrirán |
| 8 | **El servidor no puede responder preguntas sobre el progreso** y el modelo no tiene academias, grupos ni profesores | D-04, D-05, E-12 | Es el producto que se quiere vender |
| 9 | **Sin tipos ni contratos** en las fronteras (contenido, operaciones, API) | T-01, D-03, E-11 | Cada rodeo de hoy (E-12) es deuda de contrato |
| 10 | **Peso**: repositorio de 377 MiB por el audio, precarga de 28 MB, 403 peticiones en la primera visita | M-04, R-01, R-02 | Crece con cada convocatoria y cada episodio |

## 12. Evaluación de `docs/VERSION-2.md`

El plan existente es sensato en sus principios y está desfasado en su arquitectura objetivo y en su puerta de entrada.

**Sigue valiendo:**

- **«Estrangulamiento, no reescritura» y «el motor de repaso y la fusión no se tocan salvo para tiparlos».** Esta
  auditoría lo confirma con números: el núcleo está al 96–100 % de cobertura y a 17 errores de `checkJs` en 19.700 líneas.
- **V2-F0 (cimientos):** CI que bloquea, formato, tipos, registro de decisiones y protocolo de operaciones sobre
  producción. Es exactamente lo que piden los riesgos 1, 5 y 6. Su estimación (2–3 semanas) es realista.
- **Contenido como producto (V2-F1):** esquema formal, estados editoriales, fuente obligatoria. Coincide con D-03 y M-09.
- **Núcleo como paquete tipado (V2-F2).**
- **Cuentas opcionales que se vinculan al código actual** sin perder progreso, roles, consentimiento del alumno,
  auditoría de accesos del profesor, RGPD antes de cobrar.
- **Migración sin riesgo:** lo nuevo en la base nueva, doble escritura y comparación antes de cortar, copia antes de
  cada cambio, interruptores por centro.
- **No usar Firebase**, y los riesgos de §8 (reescribir lo que funciona, derechos del contenido, dependencia de una persona).

**Hay que revisarlo:**

| Punto de VERSION-2 | Problema | Qué cambia |
| --- | --- | --- |
| Puerta «invertir en F0–F2 solo con ~30 clientes de pago o un centro» (§7) | F0 no es inversión de producto, es higiene: los riesgos 1, 3, 5 y 6 existen con cero clientes. Y el dueño ya ha decidido invertir en calidad | F0 sin condición y ya. La puerta de negocio se queda para F4 en adelante |
| Arquitectura objetivo: API en Cloudflare Workers + PostgreSQL gestionado + Hyperdrive + Durable Objects (§3) | Se escribió sin el VPS. Con un servidor propio con Docker, la combinación Workers ↔ Postgres externo añade piezas (conexión, latencia, dos proveedores) que un proceso Node junto a su base de datos no necesita. La «seguridad por filas» presupone Postgres | Reabrir la decisión (preguntas 3 y 4 de §13). La sala en tiempo real con WebSocket es más sencilla en un proceso propio que en Durable Objects |
| «Los mismos 2.200 tests, ahora sobre el paquete» (§3.2) | Es cierto para los motores. No lo es para los 36 ficheros que fijan texto de CSS o de código de `ui/`: no sobreviven a un cliente nuevo | Contar con reescribirlos como E2E y pruebas de componente (P-03) |
| V2-F3 «Cliente: empaquetado, TypeScript, componentes, accesibilidad» en 6–8 semanas | Son 16.500 líneas de interfaz al 19 % de cobertura, 37 vistas y 333 KB de CSS. Sin E2E previos no hay forma de saber si la pantalla nueva iguala a la vieja | Añadir una fase previa de E2E de caracterización y estimar F3 en meses, pantalla a pantalla, conviviendo con la app antigua |
| «Sincronización y avisos existentes, migrados sin cambiar su contrato» (§3.4) | El contrato actual lleva rodeos (E-12) y un validador empaquetado en el despliegue (E-11) | Versionar el contrato al migrar; conservar el modelo, no la letra |
| Orden de fases | No aparecen: dominio propio y traslado de origen (S-01), sacar el audio de git (M-04), repositorio propio, E2E, observabilidad del cliente | Añadirlos a F0 |
| «Paquetes firmados» de contenido (§3.1) | Es complejidad sin amenaza clara mientras contenido y app salgan del mismo servidor por HTTPS | Dejarlo fuera hasta que haya contenido de terceros |
| V2-F7 «Operación» como fase continua al final | Copias y alertas son previas a tener datos de pago, no posteriores | Lo mínimo (copia diaria probada, alerta de errores) pasa a F0 |
| Estimación total «8–12 meses, un desarrollador con agentes» | Plausible para F0–F4 si no se reescribe el núcleo; optimista si se incluyen F5–F6 (profesor y sala) | Planificar por hitos publicables, no por el total |

## 13. Preguntas abiertas para la fase de arquitectura

Para cada una: opciones y una recomendación preliminar. No son el diseño; son lo que el dueño tendrá que decidir.

### 1. ¿Refactorizar o reescribir?

| Opción | A favor | En contra |
| --- | --- | --- |
| A. Refactor in situ de todo | No se pierde nada | La interfaz no tiene pruebas que protejan el refactor; se arrastra el diseño de «una función por pantalla» |
| B. Reescritura completa | Arquitectura limpia | Tira ≈ 54.000 líneas probadas y años de contenido verificado; es el «error más caro» que ya identifica VERSION-2 |
| **C. Conservar el núcleo, reescribir la carcasa** | Aprovecha lo probado; rehace solo lo que hoy es prototipo | Exige una frontera clara entre núcleo y carcasa y convivir un tiempo con dos interfaces |

**Recomendación: C.** Núcleo (`math`, `nautical`, `chart`, `exercises`, `analysis`, `course`, `exams`, `bancos`,
`theory`, `conceptos`, `store/sync`, `illustrations`) → paquete tipado, sin cambios de comportamiento, con sus
pruebas. Carcasa (`ui/`, `styles/`, almacenamiento local, service worker, Worker, despliegue) → nueva, pantalla a
pantalla, empezando por E2E de caracterización de la pantalla que se sustituye.

### 2. ¿Framework de interfaz?

| Opción | Nota |
| --- | --- |
| Seguir sin framework, ordenando el código | Viable solo con mucha disciplina; no resuelve ciclo de vida ni estado (C-04, C-07) |
| Framework ligero con JSX o *hyperscript* (Preact, Solid) | El `h()` actual tiene casi la misma forma: la migración de vistas es en buena parte mecánica. Pocos KB |
| Svelte | Muy buen resultado en tamaño y ergonomía; migración menos mecánica |
| React | Ecosistema y contratación; más peso del necesario para esta app |
| Componentes web (Lit) | Estándar y duradero; menos ergonómico para pantallas con mucho estado |

**Recomendación preliminar:** sí a un framework ligero con empaquetador (Vite) y TypeScript; decidir entre Preact y
Svelte con una prueba de una pantalla real («Hoy») midiendo tamaño, tiempo y cuánto código antiguo se reutiliza. El
empaquetador y la carga por rutas son obligatorios en cualquier caso (R-01).

### 3. ¿Servidor propio en el VPS o Cloudflare?

| Opción | A favor | En contra |
| --- | --- | --- |
| Seguir solo con Worker + D1 | Ya funciona, coste casi nulo, sin servidores que cuidar | D1 no da el modelo relacional ni las consultas que pide el producto; tiempo real más enrevesado |
| Todo en el VPS (API + base de datos + estáticos, en Docker) | Un solo sitio, un proceso normal, WebSocket sencillo, coste fijo ya pagado, datos en la UE | Punto único de fallo; copias, parches, certificados y vigilancia pasan a ser trabajo del dueño |
| **Híbrido: API y base de datos en el VPS; estáticos y audio tras una CDN** | Lo mejor de ambos: la app sigue abriendo aunque el VPS caiga (es *offline-first*) | Dos piezas que desplegar |

**Recomendación preliminar:** híbrido, con dominio propio. La app ya tolera que el servidor no esté; eso hace
asumible un único VPS si hay copia diaria fuera de la máquina y restauración probada. El Worker actual sigue vivo
durante la migración (doble escritura) y se apaga al final.

### 4. ¿Qué base de datos?

| Opción | Nota |
| --- | --- |
| SQLite en el VPS (con copia continua tipo Litestream) | Suficiente de sobra para el volumen previsible (cientos o pocos miles de alumnos); operación mínima; migrar desde D1 es trivial. Sin seguridad por filas: el aislamiento entre academias sería responsabilidad del código |
| PostgreSQL en Docker en el VPS | Relaciones, transacciones, seguridad por filas, JSONB para las operaciones, herramientas maduras de copia. Algo más de operación |
| PostgreSQL gestionado (lo que decía VERSION-2) | Menos operación, más coste y otro proveedor |

**Recomendación preliminar:** PostgreSQL en el VPS si las academias (aislamiento entre centros) son un objetivo
firme; SQLite si el primer año va a ser solo particulares con cuenta. La pregunta que decide es de negocio, no técnica.
En ambos casos: el registro de operaciones se conserva como fuente de verdad y se añaden tablas de proyección (D-04).
Para el **contenido**, ninguna base de datos: sigue en git con esquema y se compila a paquetes (pregunta 8).

### 5. ¿Autenticación y cuentas?

| Opción | Nota |
| --- | --- |
| Solo código de alumno (hoy) | Sin fricción; sin revocación, sin recuperación, sin roles |
| Cuenta opcional con enlace mágico por correo | Sin contraseñas que guardar; apta para gente mayor; exige enviar correo |
| *Passkeys* | Lo más seguro y cómodo en móvil; conviene como segundo paso, no como único método |
| Proveedor externo (Google, Apple) | Rápido; dependencia y datos en terceros |
| Código de centro para alumnos de academia | Ya previsto en PRODUCTO; convive con lo anterior |

**Recomendación preliminar:** la app sigue funcionando sin cuenta; la cuenta es opcional (correo con enlace mágico,
*passkey* después) y obligatoria solo para profesores y para pagar. El código actual se conserva como forma de unir un
aparato a una cuenta, de un solo uso y con caducidad. Sesiones revocables en servidor.

### 6. ¿Monorepo y repositorio propio?

**Recomendación preliminar:** sí a las dos. Repositorio dedicado (fuera del repositorio personal de varios proyectos),
con espacios de trabajo: núcleo, contenido, web, API y E2E. Historial nuevo sin el audio. El contrato compartido
entre cliente y servidor deja de ser una importación por ruta relativa (E-11).

### 7. ¿Dominio propio, y cómo se traslada a los alumnos?

Es condición de las preguntas 3 y 5 y del riesgo 2. El cambio de origen deja atrás `localStorage`. Opciones: (a) la app
antigua muestra un aviso y lleva al dominio nuevo con el código de alumno en el enlace, que recupera el progreso desde
el servidor; (b) mantener las dos en paralelo un tiempo. **Recomendación preliminar:** (a), aprovechando que la
vinculación por enlace ya existe (`#/vincular/<código>`), y hacerlo **antes** de introducir cuentas.

### 8. ¿Dónde vive el contenido?

| Opción | Nota |
| --- | --- |
| JSON en git (hoy) con esquema formal y compilación a paquetes por banco | Revisión por PR, historial, sin CMS que mantener |
| Base de datos con editor | Necesario solo cuando editen personas que no usan git (academias) |

**Recomendación preliminar:** git con esquema ahora; dejar el contenido propio de cada academia (lo que hoy es el
fichero del «modo profesor», D-09) como datos de servidor cuando llegue esa fase.

### 9. ¿Se mantiene el modelo sin conexión con registro de operaciones?

**Recomendación preliminar:** sí; es un diferenciador y está probado. Cambios: IndexedDB en vez de `localStorage`,
compactación, contrato versionado y proyecciones en el servidor.

### 10. ¿Qué se hace con el audio?

Fuera de git: almacenamiento de objetos o directorio estático del VPS tras la CDN, con el índice (`episodios.json`) en
el repositorio. Decidir también si los guiones (860 KB) son contenido del producto o material de trabajo.

### 11. ¿Qué nivel de pruebas se exige para dar por buena una pantalla migrada?

**Recomendación preliminar:** un E2E del recorrido principal escrito contra la pantalla antigua y que pase igual en la
nueva, axe sin infracciones y pruebas de las funciones puras que se hayan sacado de la vista. Cobertura con umbral por
paquete en CI (núcleo ≥ 95 %, como ya está).

### 12. ¿Público o privado?

El repositorio publica el código, las preguntas, los guiones y el audio. Con derechos de las preguntas y de la carta
sin aclarar (`docs/PRODUCTO.md` §9) y un plan de cobro, hay que decidir qué es público. Es una decisión del dueño,
previa a elegir alojamiento de los estáticos.

## Anexo A. Métricas en bruto

Carpeta [`metricas/`](metricas/). Todo sale de `main` en `2755e59`.

| Fichero | Contenido | Cómo se obtuvo |
| --- | --- | --- |
| `01-lineas.txt` | Líneas y ficheros por directorio, los 50 ficheros mayores, tamaños de `data/` y `podcast/` | `wc -l`, `du` |
| `02-ciclos-madge.txt` | Ciclos de importación | `madge --circular src` |
| `03-capas.txt` | Matriz capa → capa, dependencias mutuas, módulos más importados y que más importan | `madge --json` + `config/capas.mjs` |
| `04-eslint.txt` | Avisos por regla, 30 funciones más complejas, 25 más largas | ESLint 9, `config/eslint.config.mjs` |
| `05-tsc.txt` | Errores de `checkJs` por código y por directorio, con y sin `strict` | TypeScript, `config/tsconfig.checkjs.json` |
| `06-patrones.txt` | JSDoc, `innerHTML`, almacenamiento, `try/catch`, globales, `fetch`, accesibilidad, CSS | `grep` |
| `07-tests.txt` | Resumen de la ejecución, clasificación de tests, casos más lentos | `node --test` |
| `08-cobertura.txt` | Cobertura por directorio contando los ficheros no cargados; ficheros nunca cargados | `node --test --experimental-test-coverage` + `config/cov.mjs` |
| `09-npm-audit.txt` | Auditoría de dependencias de los dos paquetes | `npm audit --package-lock-only` sobre copias |
| `10-precache.txt` | Tamaño de la precarga (app y datos), con gzip | `config/precache.mjs` |
| `11-arranque-y-axe.json` | Tiempos de arranque en tres condiciones y axe-core en 10 pantallas | Playwright + axe-core, `config/arranque.mjs` |
| `12-datos-al-inicio.txt` | JSON que se descarga al abrir «Hoy» y «Examen» | Playwright |
| `13-css.txt` | Reglas, clases, clases sin uso, variables | `config/css.mjs` |
| `14-exportaciones-sin-uso.txt` | Exportaciones que nadie importa | `config/muertos.mjs` |
| `15-duplicacion.txt` | Clones y porcentaje de duplicación | `jscpd` |

Otras cifras citadas: `git count-objects -vH` → 132,58 MiB sueltos + 244,25 MiB empaquetados; `git rev-list --count
main` → 558 confirmaciones (972 en todas las ramas); `git shortlog -sn --no-merges main` → 371 de un agente, 56 del autor.

## Anexo B. Límites de esta auditoría

- **No se ha visto la configuración de GitHub** (protección de ramas, colaboradores, visibilidad, Pages) ni la de
  Cloudflare (secretos, reglas, plan). Los hallazgos S-20 a S-23 se basan en lo que dicen el código y la documentación.
- **El rendimiento se midió en local**, con HTTP/1.1 y sin compresión; las cifras absolutas con red lenta son un techo,
  no una medida de producción. El número de peticiones y los tamaños sí son exactos.
- **La búsqueda de secretos es por patrones**; no sustituye a una herramienta dedicada sobre todo el historial.
- **axe-core** detecta una parte de los problemas de accesibilidad; no se probó con lector de pantalla ni con teclado.
- **No se ha revisado la corrección del contenido** (preguntas, lecciones, láminas), solo cómo se guarda y se valida.
- **Dos agentes estaban cambiando vistas a la vez** en otras ramas; las cifras de `ui/` y de `styles/` son las de `main`.
- Los tests se ejecutaron sin `npm install` (para no tocar el proyecto): de ahí el fallo de `sync-qr` y dos saltos.
