# Arquitectura

JavaScript moderno (módulos ES), sin framework ni paso de compilación. Cada motor es independiente
y sin DOM salvo `graphics` (que solo produce texto SVG) y `ui`. Todo lo que no es `ui/` se prueba en Node.

```
nautica/
├── index.html            Punto de entrada
├── llms.txt              Guía para agentes de IA
├── data/                 Base de datos estática (JSON)
│   ├── chart-105.json    Carta: puntos notables, costa (polígonos de tierra), declinación
│   ├── curso/            Clases por titulación (per.json; módulos por tema con tarjetas, chuleta y práctica) y su
│   │                     ruta por defecto (ruta-<tit>.json: tramos que intercalan temas; ver docs/RUTA.md)
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
│   ├── store/            DATOS              progreso del alumno (localStorage), su sincronización (sync/) y carga de datasets
│   ├── course/           CURSO              estado de las clases y repaso espaciado (engine.js), recomendador «Hoy» (plan.js)
│   │                                        y ruta del curso: dependencias `requiere` y orden de las clases (ruta.js)
│   ├── exams/            EXÁMENES REALES    kit de resolución (kit.js), lector de opciones y soluciones por banco
│   ├── bloc/             BLOC DE NOTAS      hoja de borrador de cada ejercicio (notas.js: guardar en el aparato, datos del
│   │                                        enunciado, insertar en la nota); sin DOM ni dependencias
│   ├── theory/           MOTOR DE TESTS     estructura de cada titulación (blocks.js: PER, PY, TITULACIONES),
│   │                                        simulacros, exámenes reales y corrección con las reglas oficiales
│   ├── illustrations/    ILUSTRACIONES      SVG paramétrico animado (boyas, luces, maniobras, meteo…) por spec
│   ├── teacher/          MOTOR «PROFE»     lecciones por tipo de paso (intro, truco, error típico), narración
│   │                                        de soluciones y conversión a lenguaje hablado para la voz
│   ├── ai/               INTERFAZ IA        resúmenes de texto compactos y API window.nautica
│   └── ui/               INTERFAZ           router por hash (#/<tit>/… por titulación), barra inferior, vistas; ui/chart/: carta interactiva (zoom, capas,
│                                            herramientas de dibujo) y capa raster de la carta del usuario
├── styles/app.css        Colores como tokens CSS en `:root` (claro), `@media (prefers-color-scheme: dark)` con `:root:not([data-theme="light"])`
│                         (automático) y `:root[data-theme="dark"]` (forzado): los dos bloques oscuros son idénticos (tests/tema.test.js).
│                         Letras: Patron Texto / Titulos (condensada) / Mono, en fonts/ (fonts/README.md). Retícula de carta en `body`.
├── styles/laminas.css    Láminas (`--lc-*`, con su claro y oscuro propios) y Hoy, Travesía y la semana en estilo carta;
│                         desde R-69 también la mesa de cartas (carta interactiva, ampliada y mesa), la estrategia, el día del examen, la víspera, el ensayo, el cuaderno de fallos y el aviso
│                         diario (mismo patrón: los `--lc-*` se reasignan a los tokens) y un bloque «Resto de pantallas» (Temario, Examen,
│                         clase, fichas…) solo con tokens y, desde R-05, el informe de fin de sesión, el cierre de clases y tandas y Mi progreso (`.progress`, `.resumen-sesion`, `.cierre`: bloque «Informe y Mi progreso»). Las clases y las láminas no reasignan `--lc-*`. Icono: icons/icono.svg (PNG de él)
└── tests/                node --test
```

Dependencias permitidas (de abajo arriba): `math` ← `nautical` ← `chart` ← `exercises` ← `analysis`
← `graphics` ← `ai` ← `ui`. `store` solo lo usa `ui`.

## Aspecto: claro, oscuro, automático (R-67)

`ui/tema.js` guarda el ajuste `aspecto` (del aparato; no está en la lista de ajustes compartidos de la sincronización) y lo
copia a `localStorage['nautica.aspecto']`, que lee un script de `<head>` de `index.html` antes de cargar la hoja de estilos para
poner `data-theme` en `<html>` y la meta `theme-color` sin parpadeo. Sin ajuste (automático) no hay `data-theme` y manda
`prefers-color-scheme`. Los colores de cada pantalla salen siempre de los tokens (`--bg`, `--surface`, `--text`, `--accent`,
`--boton`, `--aviso-*`…), nunca de una regla `@media` suelta; las láminas conservan sus `--lc-*`.

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
| `#/<tit>/estrategia` | `views/estrategia.js`: estrategia de examen (R-31). Lógica pura en `src/course/estrategia.js` (`cifrasExamen`, `presupuestoTiempo`, `textosEstrategia`, `tuEstrategia` con `progress.tests()` y `st.listo`); textos en `data/comun/estrategia.json` (normas con fuente: RD 875/2014 y convocatorias; consejos; pendientes por tribunal). Enlazada desde Examen, la Biblioteca y la pantalla de inicio de un simulacro; nunca con un examen en marcha (`estrategiaPermitida`, `tests/estrategia.test.js`). Imprimible con el patrón de las chuletas (`.mc-*`) |
| `#/<tit>/dia-examen` | `views/dia-examen.js`: la lista del día del examen (R-44). Lógica pura en `src/course/dia-examen.js` (`listaDiaExamen`: grupos documentación, material, calculadora, hora y lugar por tribunal y titulación; casillas, vigencia y reinicio) sobre `data/comun/dia-examen.json` (cada elemento con su fuente; lo no comprobado, «pendiente de verificar») y las fuentes de `estrategia.json`. La calculadora es casilla solo si `calculadoraPermitida`. Casillas en el ajuste compartido `listadia_<tit>`; la de «admitidos» vive en `convocatoria_<tit>`. Imprimible; nunca con un examen en marcha (`estrategiaPermitida`) |
| `#/<tit>/vispera` | `views/vispera.js`: repaso exprés de la víspera, 15 min (R-45). `src/course/vispera.js` (`repasoExpres`, `erroresDeLaVispera`): trampas (pasos «ojo» del curso = las de las chuletas) de los temas con límite, por la prioridad de las ideas de su clase (`ideasPriorizadas`), recortadas a 1950 palabras (130 p/min); errores del tribunal (`data/comun/errores-frecuentes.json`, de `tools/errores-frecuentes.mjs`) y del alumno (`store/errores.js`). Paso del día k = 1 de «la semana antes» (`planSemana({ repasoExpres })`). Imprimible; nunca en un examen |
| `#/<tit>/ensayo[?p=<parte>&s=<semilla>]`, `#/<tit>/ensayo/cuadernillo?p=…&s=…`, `#/<tit>/test/ensayo?p=…&s=…` | Ensayo general en papel (R-41): `views/ensayo.js` (preparación: parte, material del tribunal sacado de `data/comun/estrategia.json` → `tribunales.<eje>.dia` vía `textosEstrategia`, aviso de la carta de papel; y cuadernillo imprimible con la hoja en blanco), `views/theory.js` → `testView` (`tipo: 'ensayo'`, `correrPapel`) y `ui/ensayo.js` (cuadernillo en pantalla, reloj del tribunal y hoja de respuestas). Lógica pura en `src/theory/ensayo.js` (`partesEnsayo`, `estructuraEnsayo`: PY módulo de navegación con su tiempo oficial; PER navegación y carta, temas 10 y 11, con el tiempo orientativo del presupuesto de la estrategia; o el examen completo; `corregirHoja` con `grade`; `cuentaEnsayos`). Sin ninguna ayuda de la práctica (`SIN_AYUDAS`, `tests/ensayo.test.js`) |
| `#/<tit>/test/general?s=…` | Ensayo general (R-66): `views/theory.js` → `testView` (`tipo: 'general'`), partes de `partesGeneral` (`src/course/plan-examen.js`) con el foco del alumno; ver «Simulacro con estrategia y ensayo general» |
| `#/<tit>/oficial[/<convocatoria>]` | Tu examen oficial (R-60): `views/oficial.js` (lista de convocatorias recientes con `banco.convocatoriasTodas()`, qué parte, aviso de la reserva, hojas por módulo con `hojaRespuestasEl` de `ui/ensayo.js`, corrección con `corregirHoja` y resultado por tipo de problema). Lógica pura en `src/course/examen-oficial.js` (`convocatoriasApuntables`, `marcarHecha`, `hojasDe`, `resultadoDe`, `fallosAgrupados`). Guarda `recordExam` por pregunta, `recordTest({ tipo: 'real', oficial: true })` y `apuntarResultado` en `semana_<tit>`; marca la convocatoria como hecha en el ajuste compartido `hechas_<eje>_<tit>` (lo lee `reservaEfectiva` de `src/bancos/index.js`). Enlazada desde Examen y desde «¿Cuántas fallaste en cada materia?» |
| `#/<tit>/fallos[/dosis\|comprobar/<fallo>]` | Tu cuaderno de fallos (R-55, R-56): `views/fallos.js` (lista por estado, dosis de 2 minutos con micro-tarjetas y reloj, comprobación sin pistas). Lógica pura en `src/course/cuaderno.js` y `src/course/dosis.js`; anotar y la tarjeta de Hoy en `ui/cuaderno.js`. Ver «Cuaderno de fallos, dosis y comprobación» |
| Elección de módulo (Hoy, `ui/foco.js`) | «¿De qué te examinas?» en el PY: ajuste compartido `modulos_<tit>` (`ambos` · id de módulo). `src/course/foco.js` (`focoModulo`, `datosDelModulo`): `estadoAlumno` recorta estructura, curso (con su ruta) y preguntas al módulo, y devuelve `foco`; sin elección, el módulo que queda tras un resultado apuntado (`moduloPendiente`). El plan guardado lleva `foco` y se rehace si cambia |
| `#/<tit>/formulas[?t=<tema>]` | `views/formulas.js`: «Fórmulas y tablas en una hoja» (`data/comun/formulas.json`, `src/course/formulas.js`). Por bloques, cada fórmula con su ejemplo resuelto; imprimible. Nunca en un examen (ver «Ayudas del alumno») |
| `#/<tit>/cuentas[/<id>]` | `views/cuentas.js` y `leccionView`: apéndice «Las cuentas del patrón» (`data/curso/apendice-matematicas.json`, `src/course/apendice.js` y `cuentas.js`). Fuera del curso: no entra en temas, plan ni «¿Estás listo?». Sus enlaces «Repasa: …» salen de `usadoEn` en los datos |

- **Recomendador único** (`course/plan.js`, funciones puras con tests): `planHoy` (lista ordenada de
  actividades; la primera es la de Hoy), `estadoTema` y `avance`. Lo usan Hoy, Temario, Mi progreso y las
  pantallas de cierre (`ui/cierre.js`, que recalcula el plan tras guardar el progreso).
- **La semana antes** (`course/semana.js`, funciones puras con `ahora`/`hoy` inyectados; tests `tests/semana.test.js`):
  modo de los últimos 7 días antes del examen. `estadoModo` (automático con la fecha no orientativa a ≤ 7 días, a mano
  con `activarManual`, `salirDelModo`, y pasada la fecha `preguntar` cómo fue), `ideasPriorizadas` (prioridad = peso del
  tema × límite de fallos × (1 − tasa) × convocatorias en que sale / convocatorias del banco; solo preguntas que se
  practican), `repartoDias` y `planSemana` (ideas, simulacro, repaso del simulacro, ligero, víspera sin nada nuevo,
  examen) y `sesionDeSemana` (la sesión de hoy, `fase: 'semana'`, que guarda el tipo del día). La interfaz:
  `ui/semana.js` (calcula con el resultado de `calcularPlan`, guarda el ajuste compartido `semana_<tit>` y apunta el día
  hecho), la tarjeta de Hoy (`views/hoy.js`), `views/semana.js` (`#/<tit>/semana` y la tanda `#/<tit>/semana/ideas/<n>`) y
  la Travesía («Seguir» arranca la misma sesión, `composicionDeHoy`).
- **Paso a paso «de hoja de examen»** (H-46, R-52): un paso del kit puede declarar `traigo` (datos de pasos anteriores),
  `plantea` (la fórmula o la regla, visible antes de contestar), `lineas` (la cuenta o la construcción escrita, visible al
  contestar) y `tabla`. `ui/guiado.js` los pinta en lugar de la voz del profe; si un paso preguntado no los trae, ese paso
  vuelve a la voz del profe. Hoy los traen todos los pasos preguntados del kit: la estima analítica (`tramos` y
  `rumboDirecto`, cada fila con la magnitud `minutos` de `analysis/quantities.js`), las mareas (`tramoMarea`, `horaUT`,
  `sondaA`, `horaParaSonda`), la corrección total (`ct` con la dm del año en minutos, `rv`, `ra`, `dv`, `dvM`, `ctFrom`,
  `ctPolar`: cada signo escrito y la vuelta de 360°), las líneas de posición y situaciones (opuesta de cada demora,
  oposición, enfilación, traslado —también el paso de la 1ª línea, que no se pregunta—), el viento (`abatimiento`,
  `rvConAbatimiento`: la banda por viento − rumbo y Rs = Rv + Ab) y la corriente (`efectivo`, `rumboConCorriente`,
  `rumboYVelocidad`, `corrienteDesconocida`, `estimaEfectiva`: el triángulo de velocidades por sus trazos). `croquis`
  (`{ tipo: 'marea' | 'tramos' | 'ct' | 'abatimiento' | 'corriente', … }`) lo dibuja `croquisEl(p, hecho)`: en los de la
  carta, antes de contestar solo lo que da el enunciado (los nortes con dm y Δ, la proa y el viento, dos lados del
  triángulo) y al contestar lo que se buscaba (Ct, Rs o Rv, el tercer lado); `'ct'` exagera los ángulos y lo dice.
  Animado con CSS (`.cq-traza`, `.cq-sale`; nada con «reducir movimiento»). `tras: ['traigo', 'croquis']` deja esas
  partes para después de contestar (en `tramoMarea`, elegir el tramo en la tabla es parte del problema; en `ctFrom` y
  `ctPolar`, el croquis sería la respuesta). `tests/guiado.test.js` exige en todas las soluciones reales que cada paso
  preguntado traiga, plantee y escriba una cuenta que acabe en el valor pedido.
- **Ejercicio generado con el kit** (R-53, `exams/ejercicios.js`): la estima analítica generada
  (`exercises/types/estima-analitica.js`: corriente como una fila más, cruce del meridiano 180°, hemisferio sur y ecuador)
  se resuelve también con el kit (`resolverEstima`: salida, distancias y `k.tramos` con la fila de la corriente, y
  `k.rumboDirecto` si se pide). `guiadoDeEjercicio(id, params, seed)` da `{ q, sol }` (cuatro opciones de la semilla: la
  buena y las de tres variantes del kit) y `views/exercise.js` abre con ellos `guiadoPanel` («Resolver paso a paso») sobre
  `CARTA_NUMEROS` (sin dibujo). Para respetar las capas, el ejercicio no importa el kit: su `calcular(p, error)` hace la
  misma cuenta y simula sus `mistakes` (ids de la taxonomía) con el mismo efecto que las variantes del kit, y
  `tests/estima-analitica.test.js` lo comprueba. En una dosis o comprobación del cuaderno, `generate` recibe `ctx.foco` (el
  error) y pone el ejercicio que lo prueba.
- **Antes y después del examen real** (R-48 a R-50; `course/tras-examen.js`, funciones puras; tests
  `tests/tras-examen.test.js`): `fallosPorMateria` (los 3 últimos exámenes con `porTema` completo de cada materia:
  simulacro, real, final, módulo y ensayo; nunca el simulacro de tus errores ni las tandas) con `estadoFrente` (holgado,
  justo a uno o menos del límite, pasado); `fotoPrediccion`/`tocaFoto` (una foto al día de «¿Estás listo?» y de la media
  de fallos por materia, hasta la víspera); `leerResultado`, `modulosAprobados`, `aptoCompleto` y `compararPrediccion`
  (avisó de ir justo donde fue justo); `moduloPendiente` (el último examen con resultado manda: «No aprobé» y un módulo
  aprobado) y `testsDelModulo`. Todo se guarda en el ajuste compartido `semana_<tit>` (`fotos`, `resultados`,
  `moduloFuera`; `guardarFoto`, `apuntarResultado` y `descartarModulo` en `course/semana.js`, como mucho 6 exámenes).
  Con un módulo pendiente, `estadoAlumno` (`course/motor.js`) calcula `listo` con `estructuraModulo` y devuelve
  `moduloPendiente`, y `planSemana` recibe `soloModulo` (el simulacro es solo el de ese módulo). La interfaz,
  `ui/tras-examen.js`: `tablaFallos` (Hoy, Travesía y semana), `fotografiar` (Hoy y semana), `tarjetaResultado` (tras
  «¿Cómo te fue?» y en `#/<tit>/semana`), `avisoModulo`. Norma de la conservación del módulo: BOE-A-2026-510, anexo III C.
- **Tu convocatoria** (R-44, `course/convocatoria.js` puro, `ui/convocatoria.js`): hora, sede y enlace opcionales (ajuste compartido `convocatoria_<tit>`, que junto a `listadia_<tit>` se reinicia con la convocatoria siguiente: la fecha cambia cuando la anterior ya pasó), editables y borrables en Ajustes → «Tu convocatoria»; Hoy enseña «Tu examen» la semana del examen (`momentoExamen`) y, de 21 días a la víspera, «¿Ya has comprobado que estás en la lista de admitidos…?» (`recordatorioAdmitidos`; la app no consulta el boletín). El push diario no se toca: su texto es fijo en `sw.js` y no conoce la fecha.
- **Tu velocidad en carta** (R-42; `course/velocidad.js`, funciones puras; tests `tests/velocidad.test.js`): tipo de
  problema de cada pregunta (`tipoDePregunta`: el `ejercicio` de su solución, `carta` o `teoria`), acumulador de tiempo con
  la pestaña visible (el criterio del reloj del examen; en la interfaz, `ui/reloj-visible.js`), `tiemposDelTest` (el campo
  `tq` del registro del test), `velocidadPorTipo` (media de las 12 más recientes, tendencia y «cabe / justo / te pasas»
  frente a `tiempoDisponible` de `course/estrategia.js`) y `consejoVelocidad` (por dónde empezar la carta). Se pinta en
  «Tu estrategia» (`#est-velocidad`) y en el resultado de un simulacro. La práctica se guarda en el aparato
  (`store/tiempos.js`); dónde va cada cosa y por qué, en [`SYNC.md`](SYNC.md) («Tiempo por pregunta»).
  **Reloj del paso a paso y de la práctica de carta** (R-64; `course/reloj-paso.js` puro, `ui/reloj-paso.js`; tests
  `tests/reloj-paso.test.js`): el objetivo por problema es el `tiempoDisponible` de arriba (estimación, no norma; con la
  media del examen si no hubiera carta), los estados siguen la tabla de velocidad (`estadoTiempo`), la pausa es la de
  `relojVisible`. Va en el paso a paso (que al terminar guarda su tiempo en `store/tiempos.js`, clave `guiado:<id>`) y,
  compacto, en las preguntas de carta de las tandas; nunca en exámenes ni simulacros.
- **Simulacro con estrategia y ensayo general** (R-57, R-66; `course/plan-examen.js` y `course/descarte.js`, puras; tests
  `tests/plan-examen.test.js` y `tests/descarte.test.js`): `clasificar`/`costeTipo` (cada pregunta con su tipo y su coste
  para el alumno: con `velocidadPorTipo` y los fallos abiertos de `cuadernoDe`, o el reparto orientativo cuentas/trazado sin
  datos), `planExamen` (teoría primero, carta fácil después, cara al final; presupuesto por pregunta escalado al tiempo menos
  el repaso; prescindibles sin pasar de `maxErrores − 1` del tema; hitos), `primerMinuto` (recuento por tipo y qué
  localizar: mareas, desvíos, declinación, figuras, faros), `avisoPlan` (pregunta que pasa de 1,5 veces su presupuesto o
  ritmo atrasado) y `hitoActual` (ensayo en papel), `informePlan` (plan frente a lo hecho y dónde estimar) y `cansancio`
  (primera mitad del tiempo frente a la segunda, por la hora a la que se contestó cada pregunta: `marcas` del examen a
  medias), `partesGeneral` (PY: genérico y navegación seguidos con su tiempo; con foco, uno; PER: el examen). Las reglas de
  descarte (`REGLAS_DESCARTE`) solo usan datos del enunciado y de su tabla de mareas; el test las pasa por todo el estudio
  de PER y PY (nunca reservadas) y exige que jamás descarten la oficial. La interfaz, `ui/plan-examen.js` (`prepararPlan`,
  `pantallaPrimerMinuto`, `lineaAvisoPlan`, `seccionInformePlan`): `testView` enseña el primer minuto al empezar un
  simulacro o una convocatoria (no el examen final ni el de tus errores) y guarda el plan compacto en `testEnCurso.plan`;
  `#/<tit>/test/general?s=…` (`tipo: 'general'`, partes en `partes`/`idsPartes`/`hechas`) se guarda al final como un
  simulacro (o de módulo) con `general: true`; la preparación del ensayo en papel enseña el primer minuto y `correrEnsayo`
  recuerda los hitos. Las vistas no calculan (`tests/plan-examen.test.js`); el examen en marcha no enseña descartes.
- **Ensayos en papel en la semana y la estrategia:** `recordatorioEnsayos` (`course/semana.js`) y `cuentaEnsayos`
  (`theory/ensayo.js`) cuentan los `tests` con `tipo: 'ensayo'` frente a los 2 recomendados; la página de la semana, la
  estrategia y la pantalla Examen enlazan `#/<tit>/ensayo`.
- **Rutas existentes en tiempo de ejecución** (`ui/rutas.js`): `app.js` publica las claves de `TIT_ROUTES`
  (`fijarRutasTit`) y una vista enlaza otra sección solo si `hayRuta('<sección>')`. Es el punto de extensión de la
  semana para la página «Estrategia de examen»: al registrar `estrategia` en `TIT_ROUTES`, sus accesos la enlazan solos.
- **Ruta del curso** (`course/ruta.js`, [`RUTA.md`](RUTA.md)): cada clase declara `requiere` (clases del mismo curso
  en que se apoya) y `data/curso/ruta-<tit>.json` (generada con `tools/ruta.mjs` y retocada a mano) fija el orden en
  que se dan, intercalando temas. `planHoy`, `unidades` (plan con fecha) y `hoyToca` la siguen; Temario sigue por temas.
- **Configuración del profesor** (`course/config-profe.js`, `ui/config-profe.js`, `views/profe.js`, [`RUTA.md`](RUTA.md)):
  un JSON validado con esquema estricto que cambia ruta, reglas para recordar y chuletas solo para quien lo importa
  (`settings.configProfe`). Se aplica en un solo sitio, al cargar curso y reglas en `bancos/index.js`.
- **Modo concentración**: en clase, tanda o examen, `body.focus` oculta cabecera, barra inferior y pie; la vista
  coloca `barraActividad()` (`ui/actividad.js`) como primer hijo.
- **Progreso** (`store/progress.js`, `nautica.progress.v1`, `version: 1`; solo campos opcionales nuevos):
  `settings.{onboarded, minutosDia, vozAuto, avisoCartaVisto, ultimaCopia, avisoCopiaHasta}`, `lecciones[id].paso`
  (tarjeta donde se dejó la clase), `dias` (minutos y actividades por día, 60 días) y `testEnCurso` (examen a
  medias: respuestas, pregunta actual y tiempo consumido solo con la pestaña visible). Copia de seguridad en `ui/copia.js`.
- **Sincronización entre aparatos** (`store/sync/`, [`SYNC.md`](SYNC.md)): cada escritura de `progress.js` se apunta
  como una operación (`nautica.sync.v1`) y `progress.get()` sale de `plegar(operaciones, local)`, función pura con la
  forma de siempre (la API del almacén no cambia). `motor.js` sube y trae operaciones de un Worker de Cloudflare + D1
  (`sync-worker/`, fuera de `nautica/`, no se precarga) que solo guarda y reenvía; sin red, todo sigue en local. La
  primera vez, el progreso de antes se convierte en una operación «base» (migración automática). Interfaz: Ajustes →
  «Mis dispositivos» (`ui/dispositivos.js`: código, QR, unir otro aparato, estado), `#/vincular/<código>`
  (`views/vincular.js`) y un punto en el engranaje si lleva más de un día sin sincronizar (`ui/sync.js`). Código de
  terceros en `src/vendor/` (con su licencia en `src/vendor/README.md`).
- **Correcciones de tema del alumno** ([`BANCOS.md`](BANCOS.md), «Correcciones del alumno»): «¿No es de este tema?»
  bajo la explicación de una pregunta (`ui/tema-pregunta.js`) guarda en el progreso (`correcciones`, sincronizado) el
  tema y la clase que elige el alumno; `bancos/correcciones.js` las aplica como una vista del banco para estudiar, sin
  tocar los datos ni los exámenes. Se ven y se deshacen en Ajustes → «Mis correcciones».
- **Recordatorio diario** ([`AVISOS.md`](AVISOS.md)): `store/recordatorio.js` (lógica sin DOM: push o calendario
  `.ics`, activar, desactivar, comprobación local al abrir), `ui/recordatorio.js` (Ajustes y tarjeta de Hoy),
  `store/sync/avisos.js` (horas, zonas y validación, compartido con el Worker) y los eventos `push` y
  `notificationclick` de `sw.js`. En el Worker, `src/webpush.js` (RFC 8291 y 8292 con WebCrypto) y `src/avisos.js`
  (una tarea por hora).

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

### Modo guiado y diagnóstico por tipo de error (R-35, R-36)

- **Paso preguntable.** Cada operación del kit que da un valor que el alumno puede calcular o medir lo deja junto a su
  paso: `steps[i].pide = { paso, pregunta, campos: [{ kind, value, label, medido? }] }` (`kind` = magnitud de
  `analysis/quantities.js`; `medido` = se mide en la carta). Las notas, los datos y las construcciones no llevan `pide`.
  Las soluciones no cambian: el dato sale del kit.
- **Taxonomía común** (`exams/taxonomia.js`): `PASOS` (Ct, declinación, aguja, marcación, oposición/enfilación,
  situación, medida, tiempo, tangente, abatimiento, corriente, traslado, estima, loxodrómica, marea, sonda, hora oficial),
  `ERRORES` (cada error típico con su paso y su frase «Es lo que sale si…»; ids iguales a los de los ejercicios
  generados, con `ALIAS` para los que no) y `VARIANTES` (cómo se comete cada error en el kit). Los de R-53: `antimeridiano` (`:letra` en `tramos`, `:resta` en `rumboDirecto`),
  `corriente-al-reves` y `lm-hemisferios` (`:llegada`, `:media`); el kit solo los consulta si hay corriente, se cruza el
  180° o hay latitudes S, así su «Ojo» sale solo donde toca.
- **Kit con un error típico:** `createKit(chart, { error: 'signo-ct:aplicacion' })` calcula igual salvo donde ese error
  se comete. `exams/diagnostico.js` resuelve la pregunta con cada variante y dice qué error lleva a la opción marcada
  (mismo criterio que `chooseOption`, cada valor dentro de la tolerancia de examen, sin empate, nunca la oficial ni la
  que sale sin error; un solo error = diagnóstico; dos = «puede ser A o B»; más, nada). Cobertura medida con
  `node tools/diagnostico-cobertura.mjs` ([`CARTA-RESUELTOS.md`](CARTA-RESUELTOS.md)).
- **Modo guiado:** lógica en `exams/guiado.js` (corrección con tolerancia de examen, ×2 en lo medido, × el factor de
  Ajustes), interfaz en `ui/guiado.js` (`guiadoPanel`). Se abre en `#/q/<id>` («Resolver paso a paso» o `?guiado=1`),
  en el panel del profe de la práctica (clases y tandas) y en la pestaña «Paso a paso» de la mesa (`openWorkspace({ guiado })`,
  que dibuja cada paso con el tutorial). Nunca en un examen (`modoExamen()`), ni en la revisión de uno.
- **Paso a paso que enseña (R-71):** lógica en `exams/ensena.js` (sin DOM). `preguntaDeTipo(q, tipo)` arma el primer paso
  «¿Qué tipo de problema es?» con el tipo de `tipoDePregunta` (el `ejercicio` de la solución) y tres de `CONFUNDE_TIPO`,
  barajados de forma estable; `TIPOS[tipo]` dice cuándo es de ese tipo y con qué expresiones del enunciado se delata
  (`delator`: la cita; en las demoras no simultáneas, la segunda hora). Fallarlo no va al cuaderno (no hay error de la
  taxonomía para eso). `escalones(p)` da la ayuda de cada paso: pista (`PISTAS[paso]` y lo que se busca), la fórmula con los
  datos (`plantea` y `cuentaSinResultado`: las `lineas` del kit cortadas en el primer «=» que da el valor) o la regla
  (`REGLAS[paso]`) y, al final, «Dímelo»; cada resultado guarda `ayudas` (no cuenta como fallo; `resumenAyudas`).
  `ejemplosDelTipo` elige dos preguntas reales del mismo tipo y titulación de `banco.practica` (nunca reservadas), estables
  por el id; `pasosRellenos` marca la primera mitad de los pasos que se preguntan. `guiadoPanel` acepta `modo` (`normal`,
  `resuelto`, `huecos`; los ejemplos sin reloj ni primer paso) y `ejemplos` (`{ resuelto, huecos }`, que monta
  `ui/views/exams.js` con su carta). Test `tests/ensena.test.js` (barrido de las preguntas de práctica).
- **Hoja en papel corregida por pasos (R-58):** lógica en `exams/papel.js` (`pasosPapel`, `corregirPapel`, `veredicto`,
  `textoPapel`), interfaz en `ui/papel.js` (`papelPanel`, `papelDisponible`). Se abre en `#/q/<id>?papel=1` («Lo hice en
  papel»), desde el resultado del ensayo en papel (`testView`, «Corrige tu hoja por pasos») y desde tu examen oficial
  (fallos de carta); nunca con un examen en marcha. **Errores arrastrados:** `createKit(chart, { fijos })` sustituye en
  cada operación el valor calculado de un paso por el que escribió el alumno (`fijos[i][campo]`; helpers `F`, `FH` para
  duraciones y `FP` para situaciones, con desplazamiento cuando una operación apunta varios pasos) y sigue con él; con
  `fijos`, una hora fuera de la tabla de mareas usa el tramo más cercano. Cada paso escrito se compara con la resolución
  y con la resolución «con sus datos»: si cuadra con la segunda, está bien hecho (`arrastrado`) y solo cuenta el primer
  desvío. El error con nombre sale de las variantes de la taxonomía con sus datos anteriores fijados, buscando también
  en los pasos que no escribió (un solo error = nombre; dos = «puede ser»). Tolerancias de `toleranciaCampo` (las del
  paso a paso, ×2 lo medido); «casi» hasta el doble, salvo que coincida con un error típico. El primer fallo con nombre
  va a `store/errores.js` y al cuaderno (`anotarFallo`, origen `papel`). Lo escrito se guarda como borrador en el aparato
  (`nautica.papel.<id>`). Test `tests/papel.test.js` (barrido sobre las preguntas del estudio de todos los bancos).
- **Carta gráfica por intención (R-54, «Trázalo en la carta»):** lógica en `exams/intencion.js` (sin DOM), interfaz en
  `ui/intencion.js` (`intencionPanel`, `intencionDisponible`). Se abre en `#/q/<id>?traza=1`; nunca con un examen en
  marcha. El kit apunta cada operación de primer nivel en `k.ops` (`{ op, args, ret, pasos, items }`: rangos de
  `steps` e `items`; no cambia ningún resultado). `planIntencion` reparte cada operación con trazo en trazos (`TRAZOS`:
  acción, argumento del objeto, argumentos de valor, sentido e índices de sus `items`) y arma las decisiones de cada uno:
  acción (la buena, la del trazo siguiente —`orden-trazado`— y las que se confunden —`trazo-equivocado`—), objeto
  (faros del problema y los más cercanos, o las situaciones ya en la carta —`faro-equivocado`—), valor (el argumento de
  esa operación en el kit resuelto con cada variante de la taxonomía, agrupado: uno o dos errores) y sentido (error fijo
  y su cambio). Las cuentas entre dos trazos (`ct`, `dv`, `abatimiento`…) no son trazos: su `plantea` es la pista del
  valor, y las del final se enseñan al acabar. `resolverCon({ cambios, capturar })` resuelve con un `Proxy` del kit que,
  en la operación j, sustituye argumentos (`{ i: valor | { suma } }`) o usa la variante del error: así se dibuja lo que
  traza una elección equivocada (`intento`) y se compara el resultado de las primeras elecciones con la resolución
  (`compararFinal`, encadenado). Los trazos que se pintan son los `items` del kit con rótulo (los arcos lo admiten);
  el intento, con el estilo `intento` (discontinuo). El primer fallo con nombre va a `store/errores.js` y al cuaderno
  (`anotarFallo`, origen `traza`). Errores del paso `trazado` en `ERRORES_DE_TRAZADO` (sin variante del kit). Las
  distancias no simultáneas (`trasladoArco`, `trasladoDosArcos`) van en tres trazos: la demora o el primer arco (el kit lo
  dibuja donde se tomó la distancia), el traslado de la línea o del centro del arco (`trasladar`, `trasladar-arco`: qué se
  hace con ella —trasladar, al revés (`traslado-al-reves`) o sin trasladar (`sin-traslado`)— y el rumbo y la distancia
  navegados) y el segundo arco; si un traslado equivocado no corta, el kit deja dibujado lo trasladado antes de romperse y
  `resolverCon` lo toma igual. Cubre las 1124 preguntas de práctica con algo que trazar. Test `tests/intencion.test.js`
  (barrido sobre el banco de práctica).
- **Avisos por paso (R-65):** `exams/avisos-pasos.js` (sin DOM) guarda el catálogo `AVISOS` (por error típico: `ojo`, `no`,
  `asi`, `has`; test: uno por cada `E(...)` del kit). El kit anota en cada paso preguntable `errores` (los `E(...)` que se
  consultan en su operación, afinados por paso con `erroresDelPaso`; no cambia ningún resultado) y `pasosGuiados` los pasa.
  `avisoPrevio` elige el «Ojo» (el error del alumno de `store/errores.js` o, sin datos, el más frecuente del tribunal de
  `data/comun/errores-frecuentes.json`); `diagnosticarPaso` vuelve a resolver con cada variante de esos errores y compara
  el paso. Interfaz: `avisosDeLosPasos` en `ui/guiado.js`.
- **Diagnóstico en la interfaz:** `ui/diagnostico.js` (`diagnosticoEl`) en la corrección de `#/q/<id>`, en el panel del
  profe (práctica y revisión de un examen terminado) y al final del modo guiado; «Tus errores más repetidos» en Mi progreso.
- **Errores del alumno** (`store/errores.js`, `localStorage` `nautica.errores.v1`): pasos fallados en el modo guiado y
  errores diagnosticados (también los de los ejercicios generados), una vez por pregunta y día, 400 anotaciones y 180
  días. Solo en el aparato: no va al progreso, ni a la sincronización, ni a la copia. Los `sup` (superado) restan uno al
  error al resumir (ver abajo).

### Cuaderno de fallos, dosis y comprobación (R-55, R-56)

«Patrón sabe cómo fallas tú, y te arregla eso» (`docs/CARTA-MOVIL.md`, función 2).

- **Fallo** (`course/cuaderno.js`, puro): un error típico de la taxonomía (`exams/taxonomia.js`) en un tipo de problema
  (el `ejercicio` de la solución o el id del ejercicio generado; `carta` si no tiene). Id `<error>.<tipo>`. Guarda las
  veces (`n`), las últimas con fecha y origen (`paso`, `pregunta`, `simulacro`, `examen`, `oficial`, `ejercicio`,
  `comprobacion`, `papel`, `traza`), la última dosis y las comprobaciones. Una misma pregunta (o semilla) con el mismo fallo el mismo día
  cuenta una vez: el paso guiado y la opción final de esa pregunta no se duplican.
- **Estados y calendario:** abierto → (dosis superada, ≥ 4 de 5) comprobación a `DIAS_COMPROBACION` (3) días →
  bien: vigilando, la siguiente a `DIAS_VIGILANDO` (7) → bien otra vez: resuelto. Mal: abierto, dosis primero y la
  comprobación a `DIAS_TRAS_FALLO` (2) días de la nueva dosis. Si reaparece (vigilando, resuelto o esperando la
  comprobación), abierto. `pendiente(f, ahora)` → `'dosis' | 'comprobar' | null`; todas las fechas entran como `ahora`.
- **Se alimenta** (`ui/cuaderno.js`, `anotarFallo`): `diagnosticarPaso` al fallar un paso del modo guiado (`ui/guiado.js`,
  en `cerrarPaso`; también a `store/errores.js`); `diagnosticoEl` al marcar una opción con diagnóstico único (práctica,
  `#/q`, final del modo guiado, revisión); `anotarFallosDeExamen` al corregir un examen en `testView` (simulacro,
  módulo, convocatoria, final, ensayo, simulacro de tus errores) y tu examen oficial (`views/oficial.js`), que además
  enseñan qué fallo se abre (`seccionCuadernoExamen`); y los `mistakes` de los ejercicios generados (`views/exercise.js`).
  `diagnosticarPaso` usa el paso calculado con el error aunque la resolución con el error se rompa más adelante (el
  adelanto al revés puede sacar la hora UT de la tabla de mareas).
- **Dosis** (`course/dosis.js`, puro): micro-tarjetas con números de una semilla para 21 errores (mareas: `adelanto-signo`,
  `sin-adelanto`, `pleamar-bajamar`, `lineal`, `sonda-carta-*`; corrección total: `signo-ct`, `sin-ct`, `signo-dm`,
  `signo-desvio`, `olvida-desvio`, `variacion-signo`, `dm-sin-actualizar`; viento y corriente: `signo-abatimiento`,
  `sin-abatimiento`, `corriente-invertida`, `sin-corriente`; y `banda-marcacion`, `marcacion-como-demora`,
  `demora-sin-opuesta`, `horas-decimales`). Cada tarjeta: opciones (o teclear hora o rumbo) con la correcta y las
  trampas exactas de cada error, calculadas con los motores del kit (`correccionTabla`, `effectiveCourse`, `windSide`…);
  test en `tests/dosis.test.js`. Sin tarjetas: `preguntasConTrampa` (2–3 de `banco.practica` con ese distractor en el
  índice de abajo) o `ejercicioParaFallo` (un ejercicio con `?dosis=<fallo>`).
- **Comprobación** (`elegirComprobacion`): pregunta real de `banco.practica` de ese tipo con esa trampa (nunca reservadas:
  cuarentena) y no usada antes en ese fallo; si no, el ejercicio generado de su tipo (`#/ej/<id>?s=…&comprobar=<fallo>`:
  sin pista, solución, chuleta ni resolución en la mesa hasta corregir); si no, una pregunta de otro tipo; si no, en
  papel («Me salió bien / Caí otra vez»).
- **Dónde se ve:** `#/<tit>/fallos` (`views/fallos.js`: lista, `dosis/<fallo>` con `relojPaso` compacto de objetivo fijo
  2:00, `comprobar/<fallo>`; los cierres usan `cierre()`, así un paso de la sesión queda hecho). En Hoy, `tarjetaCuaderno`
  (dosis y comprobaciones de hoy). El motor (`estadoAlumno` → `datos.cuaderno`, `cuadernoDe(settings, ahora)`) y `planHoy`
  proponen una actividad `dosis` (`actividadCuaderno`: la comprobación que toca o la dosis más reciente) detrás de lo
  principal y antes del repaso mezclado; `componerSesion` la mete justo detrás del primer paso. Enlaces en Más y en «Tus
  errores más repetidos».
- **Dónde se guarda:** ajustes compartidos `fallo_<id>` (docs/SYNC.md, «Cuaderno de fallos»): viaja entre aparatos sin
  tocar el Worker.

### Simulacro de tus errores (R-43)

- **Índice estático** (`tools/indice-errores.mjs` → `data/ejes/<eje>/<tit>/distractores.json`, en el precaché):
  `{ id: { letra: error } }` con las opciones erróneas que explica un **único** error típico
  (`distractoresUnicos()` de `exams/diagnostico.js`, el mismo rigor que el diagnóstico). Solo preguntas del estudio
  (sin reservadas —cuarentena—, retiradas ni anuladas). Lo carga `cargarDistractores(eje, tit)` de `bancos/index.js`.
  `tests/simulacro-errores.test.js` comprueba que está al día, que coincide con `diagnosticar()` en vivo en una muestra
  (una de cada cuatro preguntas con resolución, todas sus opciones) y que no trae ninguna reservada.
- **Selección** (`course/simulacro-errores.js`, pura): con los errores vivos del alumno (`store/errores.js`) que salen
  como distractor en su banco; si tiene menos de `MIN_VECES` (2) registrados, si casi no salen en su banco o si no
  juntan `MINIMO` (5) preguntas, dice por qué y usa los errores que más ponen los tribunales en ese banco (los de más
  preguntas en el índice). Hasta `MAX_ERRORES` (5) errores; `OBJETIVO` (10) preguntas o las que haya; solo del
  `banco.estudio` del alumno; primero las no vistas, luego las falladas; una por error y el resto por D'Hondt sobre
  cuántas veces lo comete; sin repetir. Tiempo: el presupuesto de la estrategia (`presupuestoTiempo`: carta a su ritmo,
  el resto al ritmo medio de su parte del examen).
- **En la app:** entrada en Examen (`examenesView`) y en «Tus errores más repetidos» (Mi progreso), `ui/simulacro-errores.js`.
  Se hace en `testView` (`#/<tit>/test/errores?s=<semilla>`): reloj, modo examen, sin ayudas. El examen a medias guarda
  `errores: { modo, motivo, min, objetivos, tuyos, errores }` para corregirlo igual. `recordTest` con `tipo: 'errores'`
  y `apto: null` (no cuenta en «¿Estás listo?», la travesía ni la estrategia). En la corrección, cada fallada dice
  «Has vuelto a…» (`ERRORES[e].otraVez`) si cayó en uno de sus errores, o el error típico en que cayó, y enlaza
  `#/q/<id>?guiado=1` («Resolver paso a paso»).
- **El contador baja:** acertar en este simulacro una pregunta cuyo distractor era tu error apunta un `sup`; al resumir,
  en orden de tiempo, cada error diagnosticado suma uno y cada `sup` resta uno (nunca por debajo de cero: no da crédito
  por adelantado). A cero, el error sale como «superado»; si lo vuelves a cometer, vuelve. Caer en él en el simulacro lo
  apunta como cualquier diagnóstico (una vez por pregunta y día). Solo este simulacro resta: es donde la trampa está
  puesta a propósito.

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
- Carta a pantalla completa (móvil; `setCompleta` en `ui/chart/interactive-chart.js`, estilos al final de `styles/app.css`):
  botón «Ampliar» en la barra de cualquier carta y «Salir» siempre a la vista. Es diseño propio (clase `completa`), no la
  Fullscreen API (el iPhone no la tiene para elementos; donde existe y la pantalla es táctil se pide además, como
  mejora). Barra compacta de iconos abajo (vertical) o a la derecha (móvil tumbado), «Más» desplegable, zonas seguras
  con `env()` (se añade `viewport-fit=cover` solo mientras dura). Incrustada en una página, la carta pasa a `<body>` y
  vuelve a su hueco al salir; en la mesa, el panel se abre encima con «Enunciado». Lo dibujado no se toca.
  Estilo (R-04): el bloque «Mesa de cartas» de `styles/laminas.css` (cartelas rectas con filete, rótulos en `--fuente-titulos`, lecturas en
  `--fuente-mono`, herramienta activa con relleno `--boton` y barra) se apoya en los tokens; el mar y la tierra (`--sea`, `--land`) no cambian.
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
- **Fórmulas y tablas en una hoja** (`data/comun/formulas.json`, `course/formulas.js`, `ui/views/formulas.js`): las
  fórmulas del examen por bloques y titulación (`tits`, `temas`), cada una con su expresión, letras y signos, cuándo se
  usa, la trampa y un ejemplo resuelto; y las tablas que se memorizan (Beaufort y Douglas salen de
  `illustrations/meteo.js`, las mismas de las láminas). Cada fórmula cita sus clases, su ficha de la chuleta y el motor
  (`origen`), y una `cita` que debe estar escrita igual en ellas. Los ejemplos no se escriben a mano: `CALCULOS` los
  resuelve con los motores (`nautical/`, `math/`) y `tests/formulas.test.js` exige que cada número publicado coincida
  con el cálculo y esté escrito en el ejemplo, y pulsa cada secuencia de teclas en `calculadora/motor.js`. Buscador y
  filtro por tema (`?t=`); al imprimir, A4 en dos columnas (estilos al final de «Fórmulas y tablas» en
  `styles/laminas.css`), con o sin ejemplos. Se enlaza desde el panel de la chuleta (solo existe en práctica), la
  Biblioteca, el tema y las cuentas; nunca desde un examen, y la vista no se abre con el modo examen puesto
  (`formulasPermitidas`).
- **Hueco para otras ayudas** (calculadora, apéndice de matemáticas): `registrarAyuda({ id, crear(ctx) })` en
  `ui/ayudas.js` añade un botón a la barra de ayudas de todas las pantallas de práctica (`.ayudas-hueco[data-hueco]`).
  La barra no existe en los exámenes: si una ayuda debe estar también allí, que la vista del examen la pinte aparte.
- **Bloc de notas** (`src/bloc/notas.js`, `ui/bloc.js`): hoja de borrador de un ejercicio de cuentas, con el enunciado
  a la vista (sus datos marcados y en fichas que se apuntan con un toque), las notas del alumno (texto libre) y la
  calculadora a mano («Apuntar <resultado>» la lleva a la nota). `botonBloc({ id, titulo, enunciado, comun, contexto,
  opciones, calculadora })` se pone en cualquier barra: ejercicios generados, «Haz la cuenta» y problema modelo de las
  clases, preguntas reales de cuentas (tandas, pregunta suelta, exámenes) y, con `crearBloc`, la pestaña «Bloc» del panel
  de la mesa de cartas (`openWorkspace({ bloc })`). En el móvil es una hoja a pantalla completa que se ajusta al teclado
  (`visualViewport`) y a la calculadora acoplada; en pantallas anchas, una columna a la izquierda que aparta la página.
  Las notas son de ese ejercicio (`ID_BLOC`: tipo y semilla, pregunta, o pregunta dentro de un examen) y se guardan
  solas en el aparato (`localStorage`, `nautica.bloc.v1`, las 40 más recientes, 60 días): **no** van al progreso ni al
  registro de sincronización. Es papel de borrador: también en los exámenes, sin glosas ni pistas y sin calculadora si
  el examen no la permite.
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
