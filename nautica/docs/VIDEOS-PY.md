# Vídeos del Patrón de Yate: las ideas que peor se asimilan (R-34)

Una ficha por vídeo con las ideas del Patrón de Yate (PY) que más cuesta asimilar, para hacer después vídeos cortos
con infografías. Es un documento de trabajo: no cambia la app. Las cifras salen de `tools/videos-py.mjs` (ver «Cómo
se ha hecho»).

## Resumen

| Ficha | Vídeo | Idea | Tema | Preguntas | Tanda |
|---|---|---|---|---|---|
| v01 | M manda: estable, indiferente o inestable | Equilibrio, metacentro y GM | Seguridad | 95 | primera |
| v02 | Dos puntos, dos fuerzas: G pesa, C empuja | Centro de gravedad y de carena | Seguridad | 55 | tercera |
| v03 | Mover pesos sin volcar | Traslados, consumos y superficies libres | Seguridad | 47 | segunda |
| v04 | La zafa suelta a 4 metros, no con un golpe de mar | Zafa hidrostática | Seguridad | 33 | tercera |
| v05 | Radiobaliza o respondedor: quién avisa y quién te encuentra | EPIRB frente a SART | Seguridad | 84 | segunda |
| v06 | Helicóptero: lo que haces y lo que nunca haces | Rescate con helicóptero | Seguridad | 81 | segunda |
| v07 | Isobaras juntas, viento fuerte | Gradiente de presión | Meteorología | 67 | segunda |
| v08 | Frente frío y frente cálido: quién empuja a quién | Frentes | Meteorología | 53 | segunda |
| v09 | La oclusión se apellida por el aire más frío | Oclusión fría y cálida | Meteorología | 30 | segunda |
| v10 | Cinco vientos de papel | Modelos de viento | Meteorología | 63 | segunda |
| v11 | Humedad: gramos, porcentaje y una temperatura | Humedad, punto de rocío, psicrómetro | Meteorología | 91 | segunda |
| v12 | Tres nieblas, tres recetas | Nieblas | Meteorología | 67 | tercera |
| v13 | El nombre dice el piso | Nubes por su altura | Meteorología | 62 | tercera |
| v14 | Cada corriente, su motor | Corrientes por su causa | Meteorología | 43 | tercera |
| v15 | Mar de viento o mar de fondo | Mar de viento y mar de fondo | Meteorología | 29 | tercera |
| v16 | Cinco nombres para la hora | TU, HcL, husos, hora legal, oficial y HRB | Teoría de navegación | 73 | segunda |
| v17 | Perpendicular, ¿a qué? | Esfera terrestre | Teoría de navegación | 72 | tercera |
| v18 | Tres nortes y un signo | Declinación, desvío y Ct | Teoría de navegación | 103 | primera |
| v19 | La Ct en la mar: enfilación, oposición y Polar | Ct por enfilación y Polar | Carta | 85 | primera |
| v20 | Abatimiento no es deriva | Abatimiento, deriva, rumbos de superficie y efectivo | Teoría de navegación | 56 | primera |
| v21 | Radar: la ganancia va con su filtro | Ajustes del radar | Teoría de navegación | 37 | tercera |
| v22 | Raster o vectorial: foto o base de datos | Cartas electrónicas | Teoría de navegación | 59 | tercera |
| v23 | AIS: solo ves a quien lo lleva | AIS | Teoría de navegación | 62 | tercera |
| v24 | La pantalla del GNSS, sigla a sigla | Siglas del GNSS | Teoría de navegación | 67 | tercera |
| v25 | Rumbo a dar con corriente: el triángulo | Corriente conocida | Carta | 130 | primera |
| v26 | Corriente desconocida: de la estima a la observada | Corriente desconocida | Carta | 100 | primera |
| v27 | Viento en la carta: del timón a la carta y vuelta | Rumbo de superficie y rumbo a dar | Carta | 100 | primera |
| v28 | Demoras no simultáneas: traslada la primera | Situación no simultánea | Carta | 97 | primera |
| v29 | Viento primero, corriente después | Rumbo y velocidad efectivos | Carta | 88 | primera |
| v30 | Mareas: la curva en tres pasos | Sonda en un instante y hora para una sonda | Carta | 140 | primera |
| v31 | Estima analítica: Δl, apartamiento y cuadrante | Loxodrómica directa e inversa | Carta | 101 | segunda |
| v32 | Pasar a X millas de un faro: la tangente | Rumbo para pasar a una distancia | Carta | 67 | segunda |

Tandas: **primera** 10 vídeos (el módulo de navegación con límite de fallos y la estabilidad), **segunda** 11,
**tercera** 11. «Preguntas» son preguntas distintas de los tres bancos de PY que tocan la idea, reservadas incluidas.

## Cómo se ha hecho y qué no es

- **No hay datos de fallos de alumnos reales.** La «dificultad» de cada idea no está medida: es criterio pedagógico
  (qué obstáculo tiene: espacial, de signos, de vocabulario o de proceso) apoyado en señales objetivas del repositorio.
  Ninguna cifra de este documento dice cuántos alumnos fallan algo.
- **Señales usadas:**
  - Cuánto cae: preguntas etiquetadas con los conceptos de la idea en `data/ejes/<eje>/py/conceptos.json` de los tres
    bancos (Andalucía, DGMM, Baleares) y en cuántas convocatorias sale al menos una (campo `apareceEn`).
  - Trampas documentadas: el campo `trampa` de `explicaciones.json`, los pasos «ojo» de `data/curso/py.json` y las
    `trampas` de cada episodio en `podcast/episodios.json`. Casi todas las preguntas tienen su `trampa`, así que su número
    no distingue ideas; se usa su contenido (qué confusión se repite), no su recuento.
  - Discrepancias con la plantilla: el campo `discrepancia` de las explicaciones (lo que recoge `docs/DISCREPANCIAS.md`).
    Ojo: en la corriente desconocida (v26) 10 de las 11 no son discrepancias de cálculo, sino notas de que la plantilla
    da el rumbo por su cuadrante («NE», «SE») y no se pudo comprobar solo; se cuentan igual porque el campo existe.
  - Peso en el examen: Teoría de navegación y Carta son eliminatorias (como mucho 5 y 3 fallos de 10; estructura del
    PY en `src/theory/blocks.js`, del RD 875/2014, anexo II). Seguridad y Meteorología no tienen límite propio.
- **Cómo se cuentan las preguntas:** preguntas distintas (una con dos conceptos de la misma idea cuenta una vez), de
  todas las convocatorias, también las **reservadas** para el examen final: son parte del examen real, pero aquí no se
  citan. Baleares publica a veces modelos A y B con preguntas distintas, por eso tiene más filas por convocatoria; la
  columna de convocatorias corrige ese efecto.
- **Las preguntas de ejemplo** son todas públicas: ninguna de una convocatoria reservada (reserva de
  `data/ejes/<eje>/eje.json`, vía `reservas()` de `tools/cuarentena.mjs`, la misma de la cuarentena), ninguna anulada ni
  retirada y ninguna con discrepancia documentada. `node tools/videos-py.mjs --comprobar` lo vigila.
- **Verdad de lo que se dibuja** (principio 1 de `docs/ROADMAP.md`): cada ficha lleva sus «Hechos y fuentes». Casi
  todos vienen de la verificación de la clase (`verificacion` de cada clase en `data/curso/py.json`) o del apéndice de
  `docs/CARTA-RESUELTOS.md`, donde están las normas, los cálculos y las plantillas que los respaldan. Lo que no he
  podido comprobar en el repositorio va marcado **por verificar** y no debe dibujarse como cierto hasta comprobarlo.
  Las cifras de ejemplo de carta son las de los resueltos de la app (`src/course/carta-pasos.js`), calculadas por el
  motor y comprobadas por `tests/carta-pasos.test.js`; las he recalculado a mano en este documento.
- **No es** un guion cerrado ni un plan de producción: es la materia prima de cada vídeo. Tampoco cambia el banco ni la
  app, y no usa material con derechos: los enunciados citados son los del banco del repositorio (licencias en
  `data/ejes/<eje>/eje.json`).

### Cifras recalculadas

<!-- cifras -->
| Ficha | Idea | Tema del examen | And | DGMM | Bal | Total | Públicas | Reservadas | Convocatorias con ella (And · DGMM · Bal) | Discrepancias |
|---|---|---|---|---|---|---|---|---|---|---|
| v01 | Equilibrio estable, indiferente e inestable; metacentro y GM | Seguridad | 41 | 17 | 37 | **95** | 78 | 17 | 30/34 · 14/14 · 28/28 | 0 |
| v02 | Centro de gravedad y centro de carena: peso y empuje | Seguridad | 31 | 9 | 15 | **55** | 45 | 10 | 27/34 · 8/14 · 23/28 | 2 |
| v03 | Traslado de pesos, consumos y superficies libres | Seguridad | 19 | 12 | 16 | **47** | 37 | 10 | 20/34 · 10/14 · 24/28 | 0 |
| v04 | Zafa hidrostática | Seguridad | 19 | 7 | 7 | **33** | 29 | 4 | 19/34 · 7/14 · 14/28 | 1 |
| v05 | Radiobaliza (EPIRB) frente a respondedor de radar (SART) | Seguridad (82), Teoría de navegación (2) | 28 | 15 | 41 | **84** | 71 | 13 | 22/34 · 10/14 · 27/28 | 3 |
| v06 | Rescate con helicóptero | Seguridad | 34 | 27 | 20 | **81** | 68 | 13 | 28/34 · 14/14 · 26/28 | 2 |
| v07 | Gradiente de presión, isobaras y fuerza del viento | Meteorología | 28 | 15 | 24 | **67** | 54 | 13 | 29/34 · 14/14 · 27/28 | 1 |
| v08 | Frente frío y frente cálido | Meteorología | 18 | 9 | 26 | **53** | 43 | 10 | 17/34 · 9/14 · 21/28 | 0 |
| v09 | Oclusión de tipo frío y de tipo cálido | Meteorología | 20 | 6 | 4 | **30** | 26 | 4 | 21/34 · 6/14 · 13/28 | 0 |
| v10 | Modelos de viento (Euler, geostrófico, gradiente, ciclostrófico, antitríptico) | Meteorología | 29 | 11 | 23 | **63** | 47 | 16 | 31/34 · 10/14 · 26/28 | 4 |
| v11 | Humedad absoluta y relativa, punto de rocío y psicrómetro | Meteorología | 34 | 23 | 34 | **91** | 76 | 15 | 32/34 · 14/14 · 27/28 | 0 |
| v12 | Nieblas de radiación, advección y vapor | Meteorología | 38 | 10 | 19 | **67** | 59 | 8 | 33/34 · 9/14 · 25/28 | 0 |
| v13 | Nubes por su altura (y los géneros) | Meteorología | 29 | 12 | 21 | **62** | 50 | 12 | 27/34 · 11/14 · 24/28 | 3 |
| v14 | Corrientes de arrastre, de densidad y de gradiente | Meteorología | 29 | 5 | 9 | **43** | 36 | 7 | 28/34 · 4/14 · 21/28 | 0 |
| v15 | Mar de viento frente a mar de fondo | Meteorología | 11 | 7 | 11 | **29** | 20 | 9 | 12/34 · 7/14 · 17/28 | 0 |
| v16 | La hora: TU, hora civil del lugar, husos, hora legal y HRB | Teoría de navegación | 35 | 10 | 28 | **73** | 60 | 13 | 31/34 · 9/14 · 27/28 | 2 |
| v17 | Esfera terrestre: meridianos, paralelos, trópicos y círculos polares | Teoría de navegación | 36 | 12 | 24 | **72** | 60 | 12 | 28/34 · 9/14 · 23/28 | 0 |
| v18 | Declinación, desvío y corrección total | Teoría de navegación (81), Carta (22) | 43 | 31 | 29 | **103** | 86 | 17 | 32/34 · 13/14 · 26/28 | 2 |
| v19 | Corrección total por enfilación y por la Polar | Carta (55), Teoría de navegación (30) | 49 | 10 | 26 | **85** | 75 | 10 | 33/34 · 7/14 · 22/28 | 7 |
| v20 | Abatimiento frente a deriva; rumbo de superficie y efectivo | Teoría de navegación (55), Carta (1) | 28 | 16 | 12 | **56** | 45 | 11 | 25/34 · 12/14 · 20/28 | 0 |
| v21 | Radar: sintonía, ganancia y filtros | Teoría de navegación | 22 | 4 | 11 | **37** | 33 | 4 | 22/34 · 4/14 · 13/28 | 2 |
| v22 | Cartas raster y vectoriales | Teoría de navegación | 25 | 14 | 20 | **59** | 48 | 11 | 25/34 · 12/14 · 26/28 | 1 |
| v23 | AIS: qué muestra y qué no | Teoría de navegación (60), Seguridad (2) | 28 | 15 | 19 | **62** | 47 | 15 | 27/34 · 14/14 · 27/28 | 0 |
| v24 | Siglas del GNSS: HDG, COG, SOG, XTE, DTG… | Teoría de navegación | 34 | 6 | 27 | **67** | 56 | 11 | 32/34 · 6/14 · 25/28 | 0 |
| v25 | Rumbo a dar con corriente conocida | Carta | 48 | 13 | 69 | **130** | 114 | 16 | 30/34 · 11/14 · 28/28 | 0 |
| v26 | Corriente desconocida | Carta | 24 | 14 | 62 | **100** | 87 | 13 | 24/34 · 14/14 · 28/28 | 11 |
| v27 | Viento en la carta: rumbo de superficie y rumbo a dar | Carta | 39 | 6 | 55 | **100** | 92 | 8 | 27/34 · 6/14 · 24/28 | 0 |
| v28 | Situación por líneas de posición no simultáneas | Carta | 27 | 16 | 54 | **97** | 83 | 14 | 27/34 · 14/14 · 27/28 | 2 |
| v29 | Rumbo y velocidad efectivos con corriente | Carta | 34 | 17 | 37 | **88** | 75 | 13 | 26/34 · 11/14 · 25/28 | 2 |
| v30 | Mareas: sonda en un instante y hora para una sonda | Carta | 61 | 13 | 66 | **140** | 122 | 18 | 31/34 · 13/14 · 28/28 | 1 |
| v31 | Estima analítica directa e inversa | Carta (99), Teoría de navegación (2) | 38 | 18 | 45 | **101** | 84 | 17 | 33/34 · 11/14 · 28/28 | 0 |
| v32 | Rumbo para pasar a una distancia de un faro | Carta | 19 | 9 | 39 | **67** | 60 | 7 | 18/34 · 8/14 · 23/28 | 0 |
<!-- /cifras -->

Columnas: preguntas por tribunal y total; cuántas son públicas y cuántas reservadas para el examen final;
convocatorias en que sale al menos una (de las que hay en el banco); y cuántas públicas tienen una discrepancia
documentada. Se regenera con `node tools/videos-py.mjs --escribir`.

### Lista de partida frente a lo recalculado

Las cifras por concepto de la lista de partida eran correctas (coinciden con el etiquetado), pero:

- **Contaban las reservadas** sin decirlo: entre 4 y 18 preguntas de cada idea son del examen final (columna
  «Reservadas»). Para estudiar quedan las «públicas».
- **Las sumas de varios conceptos cuentan dos veces** las preguntas con dos etiquetas: el helicóptero, «≈ 84 en tres
  ideas» (25 + 32 + 27), son **81** preguntas distintas; humedad y psicrómetro, 19 + 32 + 24 + 18 = 93, son **91**;
  sonda en un instante y hora para una sonda, 79 + 59 = 138, son **137** (140 con el Anuario y la sonda en pleamar o
  bajamar); estima directa e inversa, 36 + 66 = 102, son **99** (101 con los conceptos previos de la loxodrómica);
  frentes frío y cálido, 23 + 29 = 52, son **47** (53 con la definición de frente); centro de carena y GM, 33 + 21, son
  **54**. EPIRB y SART (38 + 46 = 84) no se solapan: **84**.
- **Superficies libres** no tenía cifra: solo **1** pregunta en los tres bancos (Baleares). No justifica un vídeo
  propio: se fusiona en v03 (es el mismo mecanismo, G que sube).
- Ideas con más preguntas que no estaban en la lista: **Ct por enfilación u oposición, 62** (la Polar, 25, iba dentro
  de la idea 17) y **siglas del GNSS, 67**. Se añaden como v19 y v24.

### Ideas fusionadas, partidas y añadidas

| Partida | Ahora | Por qué |
|---|---|---|
| 1 equilibrio · 3 centro de carena y GM | v01 (equilibrio, metacentro, GM, par adrizante, duro y blando) y v02 (G, C y desplazamiento) | El signo de GM es lo que decide el equilibrio: va con él. G y C son otra confusión (de vocabulario), la de los dos puntos |
| 2 traslado de pesos · 4 superficies libres | v03 | Superficies libres tiene 1 pregunta; es el mismo mecanismo. Se añade el traslado transversal (15 preguntas), que se pregunta junto al vertical |
| 5 zafa · EPIRB frente a SART | v04 y v05 | Son dos confusiones distintas (cuándo se suelta / qué hace cada aparato) y las dos tienen preguntas para su vídeo |
| 10 modelos de viento | v10, con Buys-Ballot | La ley de Buys-Ballot (4) se enseña en la misma clase (py-2-3) |
| 13 nubes por altura | v13, con los géneros | Las preguntas de géneros (17) preguntan el piso de cada nube |
| 14 corrientes · mar de viento y de fondo | v14 y v15 | Dos fenómenos distintos sin nada en común salvo el tema |
| 17 declinación, desvío, Ct y Polar | v18 (de dónde sale la Ct) y v19 (Ct por enfilación, oposición y Polar) | La Ct por enfilación tiene 62 preguntas y es de carta (eliminatoria); es un procedimiento, no una definición |
| 18 abatimiento frente a deriva | v20, con rumbo de superficie y efectivo | Las preguntas de rumbos de superficie y efectivo (15) son la misma confusión |
| 20 carta raster frente a vectorial; AIS | v22 y v23 | Una idea por vídeo; las dos tienen preguntas de sobra |
| — | v24 siglas del GNSS | 67 preguntas, confusión de vocabulario (COG y HDG, XTE y DTG) que se ve muy bien en una pantalla dibujada |
| 26 mareas | v30, con el Anuario y la sonda en pleamar o bajamar | Son los pasos del mismo problema |

Consideradas y no añadidas (muchas preguntas, pero poco que ganar con un vídeo frente a una lámina o una tarjeta):
pirotecnia (características, 45), Avisos a los Navegantes (45), situación por dos demoras simultáneas (38, ya la tiene
el PER), vida en la balsa (31) y abandono con balsa (30).

### Hechos por verificar

Lo que ninguna fuente del repositorio respalda del todo. No se dibuja como cierto hasta comprobarlo:

1. v06: la página de Salvamento Marítimo «Rescate mediante helicóptero» no se pudo leer al verificar la clase (la
   verificación de py-1-10 dice que la web daba error). Lo que se dibuje del procedimiento, contra esa página o el
   Manual IAMSAR, vol. III.
2. v05: el AIS-SART (respondedor que emite por AIS): la norma técnica que lo regula no está en el repositorio.
3. v10: el «≈ 90 % del viento real» del geostrófico sale de las plantillas, no de una fuente física: no dibujarlo como
   cifra.
4. v14: las corrientes frente a Ceuta, entre Málaga y Gata y en el canal de Túnez-Sicilia solo están respaldadas por
   plantillas («Derrotero IHM no consultable en línea», según la verificación de py-2-9).
5. v21: el comportamiento de los filtros anti-mar y anti-lluvia está respaldado por plantillas y manuales, no por una
   norma técnica del radar en el repositorio.
6. v04: «la zafa de la balsa se cambia cada 2 años» sale del fabricante (ficha citada en py-1-5); la norma del RD
   1185/2006 que da 2 años es la del dispositivo de liberación de la **radiobaliza**. No presentarlo como norma de la
   balsa.
7. v16: los husos de Canarias y la península (UTC y UTC+1 en invierno; UTC+1 y UTC+2 en verano) están citados al
   Anuario de Mareas del IHM y a la Directiva 2000/84/CE, que fija las fechas del cambio y no los husos: falta la norma
   española que fija la hora oficial.
8. v04: la unión débil (qué es y cuándo rompe) solo está en el catálogo de conceptos y en las explicaciones; falta el
   párrafo del Código IDS que la define.

## Formato de los vídeos (recomendación)

Son recomendaciones, no reglas del proyecto:

- **2–4 minutos y una idea por vídeo**, como las láminas (regla 1 de `docs/ESTILO-LAMINAS.md`). Si una ficha pide dos
  ideas, son dos vídeos.
- **Empezar por el error**: la primera escena enseña la opción trampa del examen y por qué parece buena. Después, la
  regla; al final, la misma trampa desmontada.
- **Cerrar con una pregunta real** del banco (las de cada ficha), con pausa para pensar antes de dar la respuesta.
  Solo preguntas públicas: nunca de una convocatoria reservada para el examen final (`docs/CUARENTENA.md`). No copiar
  las de los minijuegos de los guiones del podcast: algunos leen preguntas reservadas (deuda del audio).
- **Estilo C**: papel crema y tinta azul marino, magenta para lo que hay que mirar, serifa para los nombres y
  monoespaciada para rumbos, horas y cifras; en las de carta, rumbos con tres cifras (`Rv 040°`) y los signos del
  examen (E +, W −). Si se exageran ángulos pequeños, decirlo en pantalla («ángulos ×3»), como hacen las láminas.
- **Nada solo por color** (regla 5 del estilo): cada cosa con su rótulo. Pensar en verlo en blanco y negro.
- **Subtítulos siempre** y texto en pantalla grande y corto: se verá en el móvil y muchas veces sin sonido.
- **Lo nuevo de cada paso en magenta y lo anterior en tinta**, como los resueltos de carta (`docs/CARTA-RESUELTOS.md`).
- **Cada hecho dibujado, con su fuente** en la descripción del vídeo (las de la ficha). Si la plantilla y la norma
  difieren, decirlo: qué contesta el examen y qué es lo cierto.
- Sin nombres de entidades privadas de formación ni material con derechos (cartas escaneadas, páginas de manuales):
  la carta se dibuja con la costa vectorial de la app (`data/chart-105.json`).

## Fichas

Cada ficha: ideas (ids del catálogo `data/conceptos/`), por qué cuesta, cuánto cae, error típico y trampa, objetivo,
guion gráfico, hechos y fuentes, material de la app, preguntas para cerrar y tanda. En «Material», «clase» es el id de
`data/curso/py.json`, «episodio» el del podcast (`podcast/episodios.json`, guion en `podcast/py/`), «lámina» la spec
del catálogo (`src/illustrations/`), «mapa» el de `data/mapas/` y «resuelto» el tipo de `src/course/carta-pasos.js`.

### v01 · M manda: estable, indiferente o inestable

**Ideas:** `estabilidad.equilibrio`, `estabilidad.metacentro`, `estabilidad.altura-metacentrica`,
`estabilidad.par-adrizante`, `estabilidad.buque-duro-blando`.

**Por qué cuesta.** Espacial y de vocabulario: tres puntos (G, C y M) en una sección que escora, y cuatro siglas que se
parecen (GM, KM, KG, BM). El alumno memoriza «estable, indiferente, inestable» sin ver qué punto se mueve y cuál no.

**Cuánto cae.** <!-- cae:v01 -->
**95 preguntas**: Andalucía 41, DGMM 17, Baleares 37 (78 publicadas para estudiar y 17 reservadas para el examen final). Sale en 30 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 28 de 28 convocatorias de Baleares. Tema: Seguridad (módulo genérico, sin límite propio de fallos).
<!-- /cae:v01 -->

**Error típico y trampa.** Comparar G con C (el centro de carena) en vez de con M, y confundir «se queda escorado»
(indiferente) con «escora más» (inestable). Fuentes: «ojo» de la clase py-1-2 («En el equilibrio indiferente coinciden
M y G, no G y B ni M y B»); trampas del episodio py 1.1; trampa de `bal-py-2025-04-bc-09` en
`data/ejes/baleares/py/explicaciones.json` («un barco con G sobre B puede ser estable»).

**Objetivo.** Dibujar G, C y M en un barco escorado y decir, por dónde queda M respecto a G, si el barco adriza, se
queda o vuelca.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Pregunta trampa en pantalla: «¿qué decide si el equilibrio es estable?», con la opción «G respecto al centro de carena» marcada | Parece lógico comparar el peso con el empuje. Es la opción más elegida y es falsa | La opción trampa |
| 2 | Sección del barco adrizado: G (peso, flecha abajo) y C (empuje, flecha arriba) en la misma vertical | G no se mueve si no mueves pesos; C es el centro del volumen sumergido | G fijo, C en la carena |
| 3 | El barco escora 15°: la carena cambia de forma, C se va a la banda baja; la vertical de C corta la crujía en M | M es ese corte. GM es la distancia de G a M | M y la cota GM |
| 4 | Tres viñetas: M encima de G (adriza), M en G (se queda), M debajo de G (escora más) | El signo de GM manda: positivo, cero o negativo | La flecha del giro en cada viñeta |
| 5 | Dos barcos dando balances: uno con GM grande (rápido, brusco), otro con GM pequeño (lento) | Mucho GM es un barco duro; poco, blando. Duro no es mejor: castiga | El periodo de cada balance |
| 6 | Vuelve la pregunta del principio y se tacha la trampa | Lo que decide es M respecto a G | La respuesta c) |

**Hechos y fuentes.** GM es la distancia G–M (GM = KM − KG); M, corte de la vertical del centro de carena con la crujía
para escoras pequeñas; indiferente: M = G, GM = 0; inestable: M bajo G; GZ = GM · sen θ en la estabilidad inicial
(verificación de py-1-2: plantillas de Andalucía y teoría del buque). Duro con GM grande y blando con GM pequeño
(verificación de py-1-3).

**Material de la app.** Lámina interactiva `{ tipo: 'estabilidad', caso: 'estable' }` y `caso: 'inestable'`
(`src/illustrations/interactivas/estabilidad.js`: ola que escora 15°, G, B, M y GZ; adriza o vuelca). Mapa
`estabilidad` (nodos g, m, gm, gz, estable, indiferente, inestable, duro, blando). Clase py-1-2. Episodio py 1.1
(`podcast/py/1-1-por-que-flota-y-por-que-vuelca.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-g03` · Andalucía, 1ª convocatoria 2024 · «Cuando la distancia entre el centro de gravedad y el metacentro es nula, la embarcación se encuentra en:» Respuesta: **c)** Equilibrio indiferente.
- `dgmm-py-2024-04-05` · DGMM, abril de 2024 · «Un buque, que al escorarse queda en equilibrio indiferente, no recupera su posición de adrizado porque:» Respuesta: **c)** El peso y el empuje actúan siempre en la misma vertical y no se genera ningún par de fuerzas que haga adrizarlo.
- `bal-py-2025-12-b-06` · Baleares, diciembre de 2025 · «Si un buque se halla en equilibrio inestable (marcar la respuesta correcta):» Respuesta: **b)** Su altura metacéntrica es negativa.

**Tanda: primera.** Sale en casi todas las convocatorias de los tres tribunales y es la base de v02 y v03. Es un
problema espacial: la animación del barco escorando enseña lo que el texto no puede.

### v02 · Dos puntos, dos fuerzas: G pesa, C empuja

**Ideas:** `estabilidad.centro-gravedad`, `estabilidad.centro-carena`, `estabilidad.desplazamiento`.

**Por qué cuesta.** De vocabulario: «centro de carena», «centro de empuje», «centro de flotación» y «centro de
gravedad» suenan igual, y el examen los cruza. Y de proceso: qué cambia cuando el barco se mueve y qué cuando se
consumen pesos.

**Cuánto cae.** <!-- cae:v02 -->
**55 preguntas**: Andalucía 31, DGMM 9, Baleares 15 (45 publicadas para estudiar y 10 reservadas para el examen final). Sale en 27 de 34 convocatorias de Andalucía, 8 de 14 convocatorias de la DGMM, 23 de 28 convocatorias de Baleares. Tema: Seguridad (módulo genérico, sin límite propio de fallos).
<!-- /cae:v02 -->

**Error típico y trampa.** Pensar que G se mueve con el balance y la cabezada (lo que se mueve es C), y llamar centro de
carena al centro del plano de flotación. Fuentes: «ojo» de la clase py-1-1 (trampas del centro de carena y del centro de
flotación); trampas del episodio py 1.1; trampa de `and-py-2024-c3-g05` («Pensar que G se mueve con el balance»).

**Objetivo.** Señalar en una sección G y C, decir qué fuerza actúa en cada uno y cuál de los dos se mueve con el
balance y cuál con los consumos.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Las cuatro palabras en pantalla: gravedad, carena, empuje, flotación | El examen las mezcla. Dos son el mismo punto | «Carena = empuje» |
| 2 | Barco a flote: peso hacia abajo desde G, empuje hacia arriba desde C, del mismo tamaño | Flota porque empuje = peso (Arquímedes); en equilibrio, en la misma vertical | Las dos flechas iguales |
| 3 | La obra viva sombreada; C en su centro. El plano de flotación visto desde arriba con su centro F | C es el centro del volumen sumergido; F, el del área de flotación: otro punto | C frente a F |
| 4 | El barco da un balance: la carena cambia, C se mueve; G quieto | Con el balance se mueve C, no G: nadie ha movido pesos | G con un candado |
| 5 | Se vacía un tanque: el barco sube, cambian D, G y C | Con consumos cambian los tres; el desplazamiento no es invariable | D, G y C a la vez |

**Hechos y fuentes.** G, punto de aplicación del peso; C (B en la clase), centro de gravedad del volumen sumergido; con
balance y cabezada se mueve C y no G; con consumos cambian D, G y C; densidad del agua de mar ≈ 1,025 t/m³; centro de
flotación = centro del área del plano de flotación (verificación de py-1-1: plantillas de Andalucía, principio de
Arquímedes y programa del PY, RD 875/2014).

**Material de la app.** Láminas `{ tipo: 'barco', resaltar: ['obra-viva', 'linea-flotacion'] }` y
`{ tipo: 'estabilidad', caso: 'estable' }`. Mapa `estabilidad` (desplazamiento, carena, g). Clase py-1-1. Episodio
py 1.1.

**Preguntas para cerrar.**
- `and-py-2024-c3-g05` · Andalucía, 3ª convocatoria 2024 · «Cuando el buque se mueve por efecto de la mar (balance y cabezada):» Respuesta: **b)** Varía la posición del centro de carena, pero no la del centro de gravedad.
- `dgmm-py-2023-11-10` · DGMM, noviembre de 2023 · «¿Qué es el centro de carena de un buque para una flotación dada?» Respuesta: **c)** El centro de gravedad del volumen sumergido para esa flotación.
- `bal-py-2025-07-a-05` · Baleares, julio de 2025 · «En cuanto a la flotabilidad, señale la opción incorrecta:» Respuesta: **b)** Para que la embarcación flote, el centro de carena y el centro de gravedad deben estar siempre en la misma vertical.

**Tanda: tercera.** Es de vocabulario y la lámina y la clase ya lo resuelven bien; el vídeo añade poco frente a v01,
que lo recoge en su escena 2. Tiene 2 discrepancias documentadas (el sentido del empuje en una pregunta de Arquímedes y
«centro de empuje» como sinónimo de carena), que piden cuidado al redactar.

### v03 · Mover pesos sin volcar

**Ideas:** `estabilidad.traslado-vertical`, `estabilidad.traslado-horizontal`, `estabilidad.superficies-libres`.

**Por qué cuesta.** De signos y espacial: dos movimientos a la vez (arriba o abajo cambia GM; a una banda produce
escora) y preguntas que piden corregir una escora y además subir o bajar GM. El consumo de un tanque bajo G va en contra
de la intuición («es solo un líquido»).

**Cuánto cae.** <!-- cae:v03 -->
**47 preguntas**: Andalucía 19, DGMM 12, Baleares 16 (37 publicadas para estudiar y 10 reservadas para el examen final). Sale en 20 de 34 convocatorias de Andalucía, 10 de 14 convocatorias de la DGMM, 24 de 28 convocatorias de Baleares. Tema: Seguridad (módulo genérico, sin límite propio de fallos).
<!-- /cae:v03 -->

**Error típico y trampa.** Llevar el peso a la misma banda de la escora, y creer que consumir un tanque bajo G no
cambia nada. Fuentes: «ojo» de la clase py-1-3 («Las opciones con la misma banda de la escora siempre son falsas»;
«El consumo de agua o combustible bajo G disminuye la estabilidad»); trampas del episodio py 1.2.

**Objetivo.** Ante un traslado o un consumo, decir hacia dónde va G, si GM sube o baja y hacia qué banda escora el
barco.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Escora a babor y cuatro opciones; «a babor y abajo» tachada | El peso nunca va a la banda de la escora | La banda contraria |
| 2 | Peso que baja de cubierta a la sentina: G baja, GM crece | Bajar pesos da estabilidad; subirlos la quita | G y la cota GM |
| 3 | Peso que se mueve a estribor: G se va a estribor, el barco escora hasta que C queda bajo G | Un traslado transversal escora; uno vertical no | El nuevo equilibrio |
| 4 | Tanque bajo G que se vacía: G sube | Quitar peso de abajo es como subir el resto: GM baja | G subiendo |
| 5 | Tanque a medias: el líquido corre a la banda baja; G sube a G virtual. Al lado, el mismo tanque con un mamparo | La pérdida depende de la manga del tanque al cubo; con un mamparo en medio, una cuarta parte | G virtual y «¼» |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Bajar pesos aumenta GM y consumir bajo G lo disminuye; para corregir una escora, el peso a la
banda contraria, abajo (+GM) o arriba (−GM); GG′ = p · d / D; la superficie libre depende de la manga del tanque, no
del volumen de líquido (verificación de py-1-3). El ¼ con un mamparo longitudinal es matemática: la inercia del plano
del líquido va con la manga al cubo, y dos tanques de media manga suman 2 · (b/2)³ = b³/4 (marco `superficies-libres`
de `src/illustrations/marcos-py.js`).

**Material de la app.** Lámina interactiva `{ tipo: 'estabilidad', caso: 'estable' }` (mandos de subir, bajar y
trasladar el peso); lámina `{ tipo: 'superficies-libres', resaltar: 'medias' }` (`src/illustrations/py-cola-c.js`).
Mapa `estabilidad` (consumos, traslado, superficies, pesos). Clase py-1-3. Episodio py 1.2
(`podcast/py/1-2-mover-pesos-sin-volcar.md`).

**Preguntas para cerrar.**
- `and-py-2023-c3-g03` · Andalucía, 3ª convocatoria 2023 · «¿En qué dirección se debe trasladar un peso situado en la cubierta principal si se quiere corregir una escora a babor y aumentar la altura metacéntrica para que el buque sea más estable?:» Respuesta: **a)** A estribor y por debajo de la cubierta principal.
- `dgmm-py-2024-04-01` · DGMM, abril de 2024 · «El consumo de agua, combustible y otros pertrechos, que se encuentran por debajo del centro de gravedad del buque:» Respuesta: **b)** Disminuye su altura metacéntrica.
- `and-py-2024-c3-g01` · Andalucía, 3ª convocatoria 2024 · «Cuando en un buque con equilibrio indiferente trasladamos un peso por encima del centro de gravedad, conseguimos:» Respuesta: **c)** Que el barco pueda escorar, no se recupere y dé la vuelta.

**Tanda: segunda.** Depende de v01 (sin GM no se entiende). Pregunta frecuente y con un obstáculo de signos que el
vídeo resuelve bien con dos ejes (arriba-abajo y babor-estribor).

### v04 · La zafa suelta a 4 metros, no con un golpe de mar

**Ideas:** `seguridad.equipo.zafa-hidrostatica`.

**Por qué cuesta.** De cifras y de sentido común engañoso: «al mojarse» o «con un golpe» parecen razonables, y «más
trincas» parece más seguro. Hay que entender para qué sirve la zafa para descartar esas opciones.

**Cuánto cae.** <!-- cae:v04 -->
**33 preguntas**: Andalucía 19, DGMM 7, Baleares 7 (29 publicadas para estudiar y 4 reservadas para el examen final). Sale en 19 de 34 convocatorias de Andalucía, 7 de 14 convocatorias de la DGMM, 14 de 28 convocatorias de Baleares. Tema: Seguridad (módulo genérico, sin límite propio de fallos).
<!-- /cae:v04 -->

**Error típico y trampa.** Las cifras falsas («a 6 m», «entre 5 y 7 m») y «al mojarse». Fuentes: «ojo» de la clase
py-1-5 («La respuesta buena es a 4 metros como máximo»); trampa del episodio py 1.3; trampa de `and-py-2024-c2-g04`
(«El 6 m es el distractor de siempre»). Hay una discrepancia documentada (`and-py-2021-c2-g05`, «entre 1,5 y 4,5 m»).

**Objetivo.** Explicar cuándo suelta la zafa la balsa (o la radiobaliza), por qué no antes, y por qué no se añaden
trincas.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Balsa en su cuna con la zafa y una sola trinca; un golpe de mar barre la cubierta y la balsa sigue en su sitio | Si se soltara al mojarse, la perderías con el primer golpe de mar | La zafa intacta |
| 2 | El barco se hunde: escala de profundidad al lado, la zafa actúa antes de los 4 m | Suelta por presión, a 4 m como máximo | La marca de 4 m |
| 3 | La balsa sube, la boza tira y la balsa se infla; la unión débil rompe y la balsa queda libre | Después, la unión débil corta el último lazo con el barco | La unión débil |
| 4 | Una segunda trinca añadida: el barco se hunde y se lleva la balsa | Más trincas anulan la suelta automática | La trinca de más, tachada |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** Zafa: suelta a 4 m como máximo, no suelta con las olas (Código IDS, Res. MSC.48(66), párr.
4.1.6.3, en la verificación de py-1-5). Que la zafa típica actúe entre 1,5 y 4 m y se cambie cada 2 años es dato del
fabricante citado en py-1-5: **por verificar** como norma (ver «Hechos por verificar», 6). La unión débil: concepto
del catálogo y trampa de `bal-py-2023-12-a-07`; su descripción técnica en el Código IDS, **por verificar** el párrafo.

**Material de la app.** Láminas `{ tipo: 'balsa', vista: 'zafa' }` e `{ tipo: 'balsa', vista: 'inflado' }`
(`src/illustrations/balsa-c.js`). Clase py-1-5. Episodio py 1.3 (`podcast/py/1-3-chalecos-aros-y-balsa.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-g04` · Andalucía, 2ª convocatoria 2024 · «En caso de no poder disparar la zafa hidrostática manualmente, ésta se disparará automáticamente al sumergirse en el agua a una profundidad de:» Respuesta: **a)** 4 metros como máximo.
- `and-py-2024-c3-g06` · Andalucía, 3ª convocatoria 2024 · «Para estibar y trincar una balsa a bordo es conveniente:» Respuesta: **c)** No colocar más trincas de la que viene con la balsa unida a la zafa.
- `dgmm-py-2023-11-02` · DGMM, noviembre de 2023 · «La zafa hidrostática de una balsa salvavidas, se activa automáticamente:» Respuesta: **d)** Al alcanzar una profundidad de 4 metros por hundimiento de la embarcación.

**Tanda: tercera.** Una cifra y un porqué: con la lámina y una tarjeta basta para muchos alumnos. El vídeo es corto y
barato de hacer si sobra tiempo.

### v05 · Radiobaliza o respondedor: quién avisa y quién te encuentra

**Ideas:** `seguridad.radio.epirb`, `seguridad.radio.sart`.

**Por qué cuesta.** De vocabulario y de funcionamiento: dos aparatos naranjas que se llevan a la balsa, con siglas
inglesas y españolas (EPIRB/RLS, SART/RESAR), uno habla con satélites y otro contesta a radares. El examen mezcla sus
frecuencias, cómo se activan y dónde se ven.

**Cuánto cae.** <!-- cae:v05 -->
**84 preguntas**: Andalucía 28, DGMM 15, Baleares 41 (71 publicadas para estudiar y 13 reservadas para el examen final). Sale en 22 de 34 convocatorias de Andalucía, 10 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Seguridad 82, Teoría de navegación 2 (el grueso, módulo genérico, sin límite propio de fallos).
<!-- /cae:v05 -->

**Error típico y trampa.** Creer que la radiobaliza la reciben los barcos cercanos, que el SART se activa solo al
tocar el agua o que se ve en el GPS o en el VHF. Fuentes: «ojo» de la clase py-1-9; trampas del episodio py 1.6; trampa
de `bal-py-2025-12-b-08` («La c) mezcla el SART con el AIS»). Discrepancias documentadas: 3 (si el SART se activa al
tocar el agua; si la EPIRB transmite el nombre del barco).

**Objetivo.** Decir, para cada aparato, a quién llega su señal, cómo se activa y qué ve quien te busca.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Los dos aparatos uno al lado del otro con sus dos nombres cada uno | Uno avisa de que estás en peligro; el otro ayuda a encontrarte cuando ya vienen | Los nombres |
| 2 | Radiobaliza en el agua: señal de 406 MHz hacia un satélite, de ahí a tierra y al centro de salvamento | La alerta va por satélite, con tu identidad codificada (MMSI); tiene que estar registrada | Satélite, no barcos |
| 3 | La misma radiobaliza emitiendo también en 121,5 MHz hacia un avión de búsqueda cercano | Esa segunda señal sirve para la recalada final | 121,5 MHz |
| 4 | SART en la balsa, a 1 m de altura; un radar de banda X (9 GHz) lo interroga; en su pantalla, una línea de 12 puntos que apunta a la balsa | El SART contesta al radar: se ve en la pantalla del radar | Los 12 puntos |
| 5 | Tabla: alerta / localización, satélite / radar, activación | Repaso de las diferencias | La columna «dónde se ve» |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Radiobaliza 406 MHz con 121,5 MHz de recalada, autonomía ≥ 48 h, codificada con el MMSI; registro
obligatorio en la DGMM de toda radiobaliza instalada (IMO Res. MSC.471(101); RD 1185/2006, arts. 8.1 y 22). SART 9 GHz,
12 puntos, omnidireccional, activación manual, a ≥ 1 m sobre el agua, 96 h en espera y 8 h respondiendo (IMO Res.
MSC.510(105); Código IDS párr. 4.1.1.5.7). Todo en la verificación de py-1-9. El AIS-SART (`dgmm-py-2024-04-02`):
**por verificar** su norma técnica antes de dibujarlo.

**Material de la app.** Láminas `{ tipo: 'socorro', resaltar: 'radiobaliza', solo: true }` y
`{ tipo: 'socorro', resaltar: 'SART', solo: true }` (`src/illustrations/socorro.js`) y
`{ tipo: 'radar-respondedores' }` (racon y SART en la pantalla, `src/illustrations/electronica-c.js`). Clase py-1-9.
Episodio py 1.6 (`podcast/py/1-6-pedir-ayuda.md`).

**Preguntas para cerrar.**
- `and-py-2023-c3-g04` · Andalucía, 3ª convocatoria 2023 · «Señale la afirmación correcta sobre las radiobalizas EPIRB:» Respuesta: **d)** Todas las respuestas anteriores son correctas (activación manual y automática, registro siempre, 406 MHz).
- `dgmm-py-2024-04-04` · DGMM, abril de 2024 · «En relación con el RESAR, indique la afirmación INCORRECTA.» Respuesta: **b)** Su señal se refleja en la pantalla de radar por un único punto.
- `bal-py-2024-12-a-05` · Baleares, diciembre de 2024 · «Estando activado nuestro SART. ¿Cuándo pasa a la modalidad de trasmisión?» Respuesta: **c)** Cuando reciba las ondas de radares de banda X (9 Ghz).

**Tanda: segunda.** Mucho peso en Baleares (sale en 27 de 28 convocatorias) y una diferencia que se ve muy bien
dibujada (satélite frente a pantalla de radar). No es eliminatoria.

### v06 · Helicóptero: lo que haces y lo que nunca haces

**Ideas:** `seguridad.helicoptero.preparacion`, `seguridad.helicoptero.maniobra`, `seguridad.helicoptero.izado`.

**Por qué cuesta.** De procedimiento y de intuición engañosa: varias opciones falsas suenan prudentes («amarrar el
cable firmemente», «desactivar el SART para no interferir», «un cohete se ve mejor desde el aire»). Y el método del
reloj se cuenta desde el helicóptero, no desde el barco.

**Cuánto cae.** <!-- cae:v06 -->
**81 preguntas**: Andalucía 34, DGMM 27, Baleares 20 (68 publicadas para estudiar y 13 reservadas para el examen final). Sale en 28 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 26 de 28 convocatorias de Baleares. Tema: Seguridad (módulo genérico, sin límite propio de fallos).
<!-- /cae:v06 -->

**Error típico y trampa.** Hacer firme el cable, cogerlo antes de que toque el agua, lanzar un cohete con paracaídas,
dar las horas desde el barco. Fuentes: «ojo» de la clase py-1-10 (lista de falsas habituales); trampas del episodio
py 1.6; trampa de `bal-py-2024-12-a-10` («"Firmemente" suena a seguridad, pero es justo lo prohibido»). Discrepancia:
una plantilla de 2020 dio por buena «apagar el motor» (`and-py-2020-c3-g09`); la recomendación y el resto de
plantillas dicen arrancarlo.

**Objetivo.** Saber las cinco cosas que se hacen (chaleco, cubierta despejada, rumbo y velocidad que pidan, velas
arriadas y motor en marcha, canal 16) y las tres que nunca (cable firme, cogerlo sin que toque el agua, cohete con
paracaídas).

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Cuatro opciones que suenan prudentes; tres son falsas | En este tema lo prudente a veces es lo prohibido | Las tres trampas |
| 2 | Velero con las velas arriadas y el motor en marcha, cubierta despejada, todos con chaleco | Antes de que llegue: canal 16, chalecos, cubierta libre, velas abajo y motor arrancado | «Arrancar» |
| 3 | Vista desde arriba: el helicóptero se acerca por popa; viento unos 30° por la amura de babor; rumbo y velocidad constantes | Te pedirán un rumbo y una velocidad: mantenlos | El ángulo de 30° |
| 4 | El cable baja y toca el agua antes de que nadie lo coja (chispa al tocar) | Descarga la electricidad estática; nunca se hace firme | La chispa y «nunca firme» |
| 5 | Reloj dibujado sobre el helicóptero: su morro son las 12, «a tus 3» es a su derecha | Las horas, desde el helicóptero | El 12 en el morro |
| 6 | Balsa: humo sí, espejo sí, SART encendido; cohete con paracaídas tachado | Nada que suba hacia él | El cohete tachado |

**Hechos y fuentes.** Contacto: canal 16, LSD 70, 2182 kHz, 900 202 202 o 112 (Ministerio de Transportes, «Activación
de los medios de salvamento», en la verificación de py-1-10). Viento unos 30° por la amura de babor y rumbo y velocidad
constantes; descarga estática y no hacer firme el dispositivo (Manual IAMSAR, vol. III, sección 2, en la misma
verificación). Velero: arriar velas y arrancar el motor, chalecos, reloj desde el helicóptero, no desconectar el SART
(Salvamento Marítimo, «Rescate mediante helicóptero», y plantillas): la página de Salvamento Marítimo queda **por
verificar** (ver «Hechos por verificar», 1).

**Material de la app.** Láminas `{ tipo: 'helicoptero', vista: 'rumbo' }`, `vista: 'cable'` y `vista: 'senales'`
(`src/illustrations/py-cola-c.js`). Clase py-1-10. Episodio py 1.6.

**Preguntas para cerrar.**
- `and-py-2024-c1-g07` · Andalucía, 1ª convocatoria 2024 · «Respecto al rescate desde un helicóptero y según la información publicada por Salvamento Marítimo, señale la afirmación que NO ES CORRECTA:» Respuesta: **c)** Si nos encontramos en una balsa salvavidas desactivaremos el RESAR para que no interfiera en las comunicaciones con el helicóptero.
- `dgmm-py-2024-04-06` · DGMM, abril de 2024 · «En una situación de abandono de la embarcación, estando ya a bordo de la balsa salvavidas, se acerca un helicóptero, ¿cuál de las siguientes conductas NO es recomendable?» Respuesta: **b)** Utilice un cohete con paracaídas para llamar la atención y que localicen su posición ya que una señal alta será mejor percibida por las unidades aéreas.
- `bal-py-2024-12-a-10` · Baleares, diciembre de 2024 · «En un rescate, respecto al cable de rescate del helicóptero, indicar la respuesta incorrecta:» Respuesta: **b)** Amarrarlo firmemente a la embarcación.

**Tanda: segunda.** Sale en las 14 convocatorias de la DGMM y en casi todas las demás; es un procedimiento que se
recuerda mejor visto. Necesita antes verificar la página de Salvamento Marítimo.

### v07 · Isobaras juntas, viento fuerte

**Ideas:** `meteo.presion.gradiente`, `meteo.presion.gradiente-calculo`, `meteo.presion.isobaras`.

**Por qué cuesta.** De lenguaje: la pregunta más repetida del tema se redacta mezclando «mayor/menor», «juntas/separadas»
y «más/menos intenso», y «inclinación de las superficies isobáricas» es una imagen en tres dimensiones que nadie ha
visto.

**Cuánto cae.** <!-- cae:v07 -->
**67 preguntas**: Andalucía 28, DGMM 15, Baleares 24 (54 publicadas para estudiar y 13 reservadas para el examen final). Sale en 29 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v07 -->

**Error típico y trampa.** Romper la cadena: «más inclinación, menos gradiente» o «más gradiente, isobaras más
separadas». Fuentes: «ojo» de la clase py-2-1 («comprueba que las tres piezas van en el mismo sentido»); trampas del
episodio py 2.1; trampa de `and-py-2024-c2-g16` («en la correcta las tres relaciones van en el mismo sentido»).

**Objetivo.** Leer un mapa de isobaras y decir dónde sopla más el viento, y calcular un gradiente sencillo.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Las cuatro opciones de siempre, casi iguales | No memorices la frase: comprueba que todo va en el mismo sentido | Las tres piezas |
| 2 | Superficie isobárica en 3D como una ladera: suave y empinada | Más inclinación es más cuesta abajo para el aire | La pendiente |
| 3 | La ladera aplastada en el mapa: donde es empinada, las isobaras quedan juntas | Isobaras juntas = mucho gradiente = viento fuerte | Isobaras juntas |
| 4 | Flecha del gradiente perpendicular a las isobaras, de la alta a la baja | El gradiente se mide perpendicular a las isobaras, nunca paralelo | El ángulo recto |
| 5 | Cálculo: 4 hPa entre dos isobaras separadas 40 millas → 0,1 hPa por milla → 6 hPa por grado (60 millas) | Diferencia de presión entre distancia | La división |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Más inclinación → más gradiente → isobaras juntas → viento más fuerte; gradiente perpendicular a
las isobaras (verificación de py-2-1: plantillas de Andalucía). Isobara: línea de igual presión, reducida al nivel del
mar (AEMET, mapa de análisis de superficie, ídem). El cálculo es aritmética: 4/40 = 0,1 hPa/M, × 60 = 6 hPa por grado
de latitud (nota del concepto `meteo.presion.gradiente-calculo`).

**Material de la app.** Lámina interactiva `{ tipo: 'meteo', sistema: 'isobaras' }`
(`src/illustrations/interactivas/isobaras.js`: borrasca o anticiclón, posición del barco y separación de las
isobaras); lámina animada `{ tipo: 'meteo', sistema: 'borrasca' }` (circulación). Mapa `meteo` (presion, isobaras,
viento). Clase py-2-1. Episodio py 2.1 (`podcast/py/2-1-isobaras-borrascas-anticiclones.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-g15` · Andalucía, 3ª convocatoria 2024 · «Cuanto menor sea el gradiente horizontal de presión:» Respuesta: **a)** Las isobaras se encontrarán más separadas y el viento soplará con menor intensidad.
- `dgmm-py-2024-04-13` · DGMM, abril de 2024 · «¿Qué valor, por sí sólo, nos proporciona información sobre la velocidad del viento en un punto?» Respuesta: **a)** El gradiente horizontal de presión.
- `bal-py-2025-12-b-19` · Baleares, diciembre de 2025 · «Si dos isóbaras de 1008 y 1012 milibares están separadas entre ellas una distancia de 40 millas náuticas, ¿cuál será el gradiente horizontal de presión en un punto situado entre las dos isóbaras?» Respuesta: **d)** 0,1 mb/milla.

**Tanda: segunda.** Sale en casi todas las convocatorias de los tres tribunales; es la base de v10. No es eliminatoria,
pero la imagen de la ladera resuelve una pregunta que se repite con mil redacciones.

### v08 · Frente frío y frente cálido: quién empuja a quién

**Ideas:** `meteo.frentes.frio`, `meteo.frentes.calido`, `meteo.frentes.definicion`.

**Por qué cuesta.** Espacial: un corte vertical de dos masas de aire que el alumno solo ha visto en planta (la línea
con triángulos o semicírculos). Y el examen cambia una sola palabra («sube» por «baja», «frío» por «cálido»).

**Cuánto cae.** <!-- cae:v08 -->
**53 preguntas**: Andalucía 18, DGMM 9, Baleares 26 (43 publicadas para estudiar y 10 reservadas para el examen final). Sale en 17 de 34 convocatorias de Andalucía, 9 de 14 convocatorias de la DGMM, 21 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v08 -->

**Error típico y trampa.** Decir que en el frente frío el aire frío obliga al cálido a bajar, o atribuir los chubascos
al frente cálido. Fuentes: «ojo» de la clase py-2-2 («El examen te cambia quién se mueve y hacia dónde va el aire»);
trampas del episodio py 2.2; trampa de `and-py-2024-c1-g13`.

**Objetivo.** Dibujar el corte de cada frente, decir qué masa avanza, qué nubes da y qué tiempo trae a su paso.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Mapa: frente frío (azul, triángulos) y cálido (rojo, semicírculos) con el sector cálido entre ellos | Los símbolos apuntan hacia donde avanza el frente | Triángulos y semicírculos |
| 2 | Corte del frente frío: cuña fría que entra por debajo y levanta el cálido con pendiente fuerte; cumulonimbos | El frío empuja y obliga al cálido a subir: chubascos, tormenta | «Subir», nunca «bajar» |
| 3 | Corte del frente cálido: el cálido sube despacio sobre la cuña fría, pendiente suave; de cirros a nimbostratos | El cálido asciende solo sobre el frío: lluvia continua y mala visibilidad | La pendiente suave |
| 4 | Barco que ve pasar los dos: primero el cálido (lluvia larga), luego el frío (chubascos, sube la presión, mejora la visibilidad) | El orden de lo que ves en la mar | El cambio tras el frío |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** Símbolos: frío azul con triángulos, cálido rojo con semicírculos (OMM, símbolos de análisis;
AEMET); frente frío: el frío desplaza al cálido y lo obliga a subir, Cb y chubascos; frente cálido: el cálido asciende
espontáneamente sobre la cuña fría (verificación de py-2-2). Tiempo tras el paso del frío (sube la presión, baja la
temperatura, mejora la visibilidad): nota del concepto `meteo.frentes.frio`.

**Material de la app.** Lámina interactiva `{ tipo: 'meteo', sistema: 'frentes' }`
(`src/illustrations/interactivas/frentes.js`: mapa y corte en perspectiva, se toca cada parte) y láminas
`frente-frio-corte` y `frente-calido-corte` (`src/illustrations/meteo-c.js`). Mapa `meteo` (frentes, frio, calido).
Clase py-2-2. Episodio py 2.2 (`podcast/py/2-2-masas-de-aire-y-frentes.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-g13` · Andalucía, 1ª convocatoria 2024 · «De las siguientes afirmaciones marque la opción verdadera.» Respuesta: **d)** En un frente cálido el aire cálido asciende espontáneamente por encima de una cuña de aire frío.
- `dgmm-py-2023-11-12` · DGMM, noviembre de 2023 · «Se denomina frente cálido:» Respuesta: **c)** A la zona de transición delgada que separa el aire más cálido que avanza del aire más frío que retrocede.
- `bal-py-2024-12-bc-14` · Baleares, diciembre de 2024 · «Indica la respuesta correcta:» Respuesta: **d)** En el frente cálido se dan normalmente lloviznas y visibilidad de regular a mala.

**Tanda: segunda.** Muy visual y con la lámina en perspectiva ya hecha como base; se hace junto con v09.

### v09 · La oclusión se apellida por el aire más frío

**Ideas:** `meteo.frentes.oclusion-tipos`, `meteo.frentes.ocluido`.

**Por qué cuesta.** Espacial y de lectura: tres masas de aire, el cálido ya despegado del suelo, y una pregunta que se
repite cambiando solo si la de vanguardia es «más fría» o «más cálida» que la de retaguardia.

**Cuánto cae.** <!-- cae:v09 -->
**30 preguntas**: Andalucía 20, DGMM 6, Baleares 4 (26 publicadas para estudiar y 4 reservadas para el examen final). Sale en 21 de 34 convocatorias de Andalucía, 6 de 14 convocatorias de la DGMM, 13 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v09 -->

**Error típico y trampa.** Dar la oclusión de tipo frío cuando la vanguardia es la más fría (es de tipo cálido), y creer
que el ocluido se forma cuando el cálido alcanza al frío. Fuentes: «ojo» de la clase py-2-2 («Lee despacio vanguardia y
retaguardia»); trampas del episodio py 2.2; trampa de `and-py-2024-c3-g12` («Fíjate bien en si dice más frío o más
cálido»).

**Objetivo.** Ante «el aire de vanguardia es más frío (o más cálido) que el de retaguardia», decir el tipo de oclusión.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Mapa: el frente frío alcanza al cálido y los dos se juntan en una línea morada | El frío es más rápido y alcanza al cálido, nunca al revés | La línea ocluida |
| 2 | Corte: el aire cálido levantado del suelo; abajo, aire frío delante (vanguardia) y detrás (retaguardia) | Ahora se enfrentan dos aires fríos | Vanguardia y retaguardia rotuladas |
| 3 | Caso 1: el de detrás es el más frío y se mete por debajo | Sigue mandando el frente frío: oclusión de tipo frío | «Detrás, más frío» |
| 4 | Caso 2: el de delante es el más frío; el de detrás sube por encima | Sigue en el suelo el frente cálido: oclusión de tipo cálido | «Delante, más frío» |
| 5 | La pregunta real con «vanguardia» y «más cálido» subrayados | Se apellida como el frente que sigue tocando el suelo | Las dos palabras |

**Hechos y fuentes.** El frente frío alcanza al cálido; la oclusión puede ser de tipo frío o cálido; tipo cálido con la
vanguardia más fría y tipo frío con la retaguardia más fría (verificación de py-2-2: plantillas de Andalucía). Símbolo
del ocluido: morado, triángulos y semicírculos alternos del mismo lado (OMM, ídem).

**Material de la app.** Lámina interactiva `{ tipo: 'meteo', sistema: 'frentes' }` (no dibuja la oclusión en corte:
habría que hacer el corte nuevo). Mapa `meteo` (frentes). Clase py-2-2. Episodio py 2.2.

**Preguntas para cerrar.**
- `and-py-2024-c2-g13` · Andalucía, 2ª convocatoria 2024 · «Cuando dos masas de aire entran en contacto, si el aire cálido de una depresión no toca el suelo y el aire polar de vanguardia es más frío que el de retaguardia se trataría de:» Respuesta: **a)** Una oclusión de tipo frente cálido.
- `and-py-2024-c3-g12` · Andalucía, 3ª convocatoria 2024 · «Cuando dos masas de aire entran en contacto, si el aire cálido de una depresión no toca el suelo y el aire polar de vanguardia es más cálido que el de retaguardia se trataría de:» Respuesta: **c)** Una oclusión de tipo frente frío.
- `dgmm-py-2024-04-20` · DGMM, abril de 2024 · «En un frente ocluido frío:» Respuesta: **a)** La temperatura de la masa de aire fría que empuja por detrás es más fría que la masa de aire que va por delante de ella.

**Tanda: segunda.** Pesa sobre todo en Andalucía (sale en 21 de 34 convocatorias) y es una sola pregunta con dos
versiones: un vídeo corto la deja resuelta. Pide un corte nuevo que la app no tiene.

### v10 · Cinco vientos de papel

**Ideas:** `meteo.modelos.euler`, `meteo.modelos.geostrofico`, `meteo.modelos.gradiente`,
`meteo.modelos.ciclostrofico`, `meteo.modelos.antitriptico`, `meteo.sistemas.buys-ballot`.

**Por qué cuesta.** De vocabulario y abstracción: cinco nombres raros para modelos teóricos que se distinguen por qué
fuerzas suman. Además el antitríptico del examen no es el de la meteorología teórica estricta.

**Cuánto cae.** <!-- cae:v10 -->
**63 preguntas**: Andalucía 29, DGMM 11, Baleares 23 (47 publicadas para estudiar y 16 reservadas para el examen final). Sale en 31 de 34 convocatorias de Andalucía, 10 de 14 convocatorias de la DGMM, 26 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v10 -->

**Error típico y trampa.** Cruzar «paralelo» y «perpendicular» (el de Euler no es paralelo; el geostrófico no es
perpendicular), meter el rozamiento en el geostrófico o en el de gradiente. Fuentes: «ojo» de la clase py-2-3 (trampas
habituales y nota sobre el antitríptico); trampas del episodio py 2.3; trampa de `and-py-2024-c2-g18`. Discrepancias
documentadas: 4 (antitríptico y Coriolis, geostrófico más intenso a menor latitud).

**Objetivo.** Decir, para cada modelo, qué fuerzas suma y cómo sopla respecto a las isobaras.

**Guion gráfico** (≈ 3,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Isobaras rectas, alta arriba y baja abajo; una partícula de aire | Vamos añadiendo fuerzas una a una | — |
| 2 | Solo el gradiente: flecha de la alta a la baja, perpendicular a las isobaras | Euler: solo gradiente; de altas a bajas, perpendicular | Una flecha |
| 3 | Se suma Coriolis: la partícula se desvía a la derecha hasta ir paralela a las isobaras, con las altas a su derecha | Geostrófico: gradiente + Coriolis; paralelo a isobaras rectas (hemisferio norte) | Altas a la derecha |
| 4 | Isobaras curvas alrededor de una baja: se suma la centrífuga | De gradiente: + centrífuga, paralelo a isobaras curvas | La curva |
| 5 | Torbellino pequeño e intenso: Coriolis desaparece | Ciclostrófico: gradiente y centrífuga, sin Coriolis | Coriolis tachado |
| 6 | Cerca del agua el rozamiento frena el viento: corta las isobaras hacia la baja | Antitríptico, en el examen: el que considera el rozamiento. En teoría estricta, además, desprecia Coriolis | El ángulo con la isobara |
| 7 | De cara al viento con la baja a la derecha (Buys-Ballot) y pregunta de cierre | Hemisferio norte | — |

**Hechos y fuentes.** Las cinco definiciones y su versión del examen (verificación de py-2-3: plantillas de Andalucía
y R. Stull, *Practical Meteorology*, cap. 10). El viento de superficie corta las isobaras unos 10–20° sobre el mar
(Stull, ídem). Buys-Ballot: de cara al viento, la baja a la derecha en el hemisferio norte (concepto
`meteo.sistemas.buys-ballot`). El «≈ 90 % del viento real» del geostrófico es de las plantillas: **por verificar**, no
dibujarlo (ver «Hechos por verificar», 3).

**Material de la app.** Lámina `{ tipo: 'modelos-viento' }` con sus vistas `todos`, `geostrofico`, `gradiente` y
`antitriptico` (`src/illustrations/py-cola-meteo-c.js`) y `{ tipo: 'meteo', sistema: 'buys-ballot' }`. Mapa `meteo`
(viento, buys). Clase py-2-3. Episodio py 2.3 (`podcast/py/2-3-modelos-de-viento.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-g18` · Andalucía, 2ª convocatoria 2024 · «Señale la opción correcta.» Respuesta: **d)** En el viento antitríptico se considera el efecto de la fuerza de rozamiento.
- `dgmm-py-2023-11-20` · DGMM, noviembre de 2023 · «El viento geostrófico se diferencia del viento de Euler por tener en cuenta el siguiente efecto:» Respuesta: **d)** La fuerza de Coriolis.
- `bal-py-2025-07-a-20` · Baleares, julio de 2025 · «¿Cómo se denomina el viento teórico que responde solo a las diferencias de presión?» Respuesta: **a)** Viento de Euler.

**Tanda: segunda.** Sale en 31 de 34 convocatorias de Andalucía y tiene la diferencia entre teoría y examen que el
curso explica: el vídeo debe decirlo sin confundir. Va después de v07.

### v11 · Humedad: gramos, porcentaje y una temperatura

**Ideas:** `meteo.humedad.absoluta`, `meteo.humedad.relativa`, `meteo.humedad.punto-rocio`,
`meteo.humedad.psicrometro`.

**Por qué cuesta.** De unidades: tres magnitudes con tres unidades distintas (g/m³, %, °C) que las opciones cambian de
sitio, más otras dos que existen y no se preguntan (humedad específica y relación de mezcla, g/kg).

**Cuánto cae.** <!-- cae:v11 -->
**91 preguntas**: Andalucía 34, DGMM 23, Baleares 34 (76 publicadas para estudiar y 15 reservadas para el examen final). Sale en 32 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v11 -->

**Error típico y trampa.** Dar los g/kg como humedad absoluta, definir la relativa como una densidad o el punto de rocío
como una presión. Fuentes: «ojo» de la clase py-2-5 («Las distractoras cambian las unidades y las magnitudes»); trampas
del episodio py 2.5; trampa de `and-py-2024-c1-g19` («b) dice g/m² en lugar de g/m³ y a) dice "presión" en lugar de
"temperatura"»).

**Objetivo.** Asociar cada magnitud a su unidad y leer un psicrómetro: qué indica la diferencia entre el termómetro
seco y el húmedo.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Tres etiquetas: g/m³, %, °C | Cada humedad tiene su unidad: si la unidad no casa, la opción es falsa | Las unidades |
| 2 | Un metro cúbico de aire con gotitas de vapor contadas en gramos | Absoluta: gramos de vapor por metro cúbico | g/m³ |
| 3 | Un vaso que se llena hasta la raya de saturación; la raya sube si se calienta el aire | Relativa: lo que hay frente a lo que cabría a esa temperatura. Al calentar el camarote sin añadir vapor, baja | El vaso y su raya |
| 4 | Se enfría el aire sin quitarle vapor hasta que la raya baja al nivel del agua: aparece rocío | Punto de rocío: la temperatura a la que satura | °C |
| 5 | Psicrómetro: seco 18 °C, húmedo 15 °C; tabla: HR ≈ 71–73 %, punto de rocío ≈ 13 °C. Si marcan lo mismo, 100 % | La diferencia dice cuánto se evapora: poca diferencia, aire casi saturado | La diferencia de 3 °C |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Absoluta en g/m³; relativa = vapor real / vapor de saturación a la misma temperatura; punto de
rocío, temperatura de saturación al enfriar a presión y vapor constantes; g/kg es humedad específica o relación de
mezcla; ejemplo 18/15 °C → HR ≈ 71–73 %, Td ≈ 12,6–13,1 °C; el psicrómetro necesita ventilación (OMM, *Guide to
Instruments*, WMO-No. 8, y cálculo, en la verificación de py-2-5).

**Material de la app.** Láminas `{ tipo: 'humedad' }` y `{ tipo: 'psicrometro' }` con sus variantes `ejemplo`,
`humedo` y `seco` (`src/illustrations/py-cola-meteo-c.js`). Lámina interactiva de nieblas (mando de temperatura del
aire con humedad relativa y punto de rocío, `src/illustrations/interactivas/nieblas.js`). Mapa `nieblas` (absoluta,
relativa, rocio, psicrometro). Clase py-2-5. Episodio py 2.5 (`podcast/py/2-5-humedad-y-nubes.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-g19` · Andalucía, 1ª convocatoria 2024 · «De las siguientes afirmaciones señale la opción verdadera.» Respuesta: **c)** La humedad relativa es la razón entre la cantidad de vapor de agua contenido realmente en el aire y el que podría contener si estuviera saturado a la misma temperatura.
- `dgmm-py-2024-04-12` · DGMM, abril de 2024 · «El Punto de Rocío es:» Respuesta: **c)** La temperatura a la que comienza a condensarse el vapor de agua contenido en el aire.
- `bal-py-2025-12-a-16` · Baleares, diciembre de 2025 · «Con el psicrómetro y las tablas psicrométricas se calcula:» Respuesta: **b)** La humedad relativa y el punto de rocío.

**Tanda: segunda.** Una de las ideas más frecuentes del genérico (sale en 32 de 34 convocatorias de Andalucía y en las
14 de la DGMM). El vaso con su raya de saturación es una infografía sencilla y potente; es la base de v12.

### v12 · Tres nieblas, tres recetas

**Ideas:** `meteo.nieblas.definicion`, `meteo.nieblas.clasificacion`, `meteo.nieblas.radiacion`,
`meteo.nieblas.adveccion`, `meteo.nieblas.vapor`, `meteo.nieblas.frontal`, `meteo.nieblas.prevision`,
`meteo.nieblas.disipacion`.

**Por qué cuesta.** De clasificación cruzada: el examen pide el grupo (enfriamiento, evaporación, mezcla), el
mecanismo (qué aire sobre qué superficie) y la época, y cambia una sola pieza.

**Cuánto cae.** <!-- cae:v12 -->
**67 preguntas**: Andalucía 38, DGMM 10, Baleares 19 (59 publicadas para estudiar y 8 reservadas para el examen final). Sale en 33 de 34 convocatorias de Andalucía, 9 de 14 convocatorias de la DGMM, 25 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v12 -->

**Error típico y trampa.** Advección «de evaporación» o «con aire seco»; vapor «con aire cálido sobre agua fría»;
radiación «por calentamiento» o «de primavera». Fuentes: «ojo» de la clase py-2-7; trampas del episodio py 2.6; trampa
de `and-py-2024-c2-g11` («c) describe la niebla de mezcla con el nombre de la de advección»).

**Objetivo.** Para cada niebla, decir qué aire, sobre qué superficie, a qué grupo pertenece y qué la disipa.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Tres columnas: enfriamiento, evaporación, mezcla | Primero, el grupo | Los tres grupos |
| 2 | Noche despejada y en calma sobre tierra; el suelo se enfría y el aire de encima llega al punto de rocío | Radiación: enfriamiento del suelo; otoño e invierno | «Enfriamiento», «tierra» |
| 3 | Aire templado y húmedo que se mueve sobre mar fría | Advección: enfriamiento por debajo; la típica del mar | La flecha del aire que viaja |
| 4 | Aire muy frío sobre agua templada: el agua humea | Vapor: evaporación; aire frío sobre agua templada, al revés que la de advección | El «humo» |
| 5 | Sale el sol, sube la temperatura por encima del punto de rocío; arrecia el viento | Se disipa al calentarse o con viento; la de mar se aclara sobre aguas más templadas | T > Td |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Niebla: visibilidad < 1 km (AEMET, Glosario de términos marítimos); clasificación, mecanismos y
época, disipación con T > Td, aguas más templadas o viento de fuerza 4 o más (verificación de py-2-7: plantillas de
Andalucía). Previsión: riesgo cuando la temperatura del mar se acerca al punto de rocío (ídem).

**Material de la app.** Lámina interactiva de nieblas con sus tres variantes `niebla-adveccion`, `niebla-radiacion` y
`niebla-vapor` (`src/illustrations/interactivas/nieblas.js`). Mapa `nieblas`. Clase py-2-7. Episodio py 2.6
(`podcast/py/2-6-nieblas.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-g11` · Andalucía, 2ª convocatoria 2024 · «Con respecto a las nieblas marque la opción verdadera.» Respuesta: **b)** Cuando se entabla una corriente de aire frío sobre agua mucho más templada, se producen las llamadas nieblas de vapor.
- `and-py-2024-c3-g18` · Andalucía, 3ª convocatoria 2024 · «Las nieblas de advección son debidas a procesos de:» Respuesta: **b)** Enfriamiento.
- `dgmm-py-2023-11-11` · DGMM, noviembre de 2023 · «¿Qué dos factores principales pueden producir la dispersión de la niebla?» Respuesta: **c)** El calentamiento y la sustracción de vapor.

**Tanda: tercera.** Frecuente en Andalucía (33 de 34), pero la lámina interactiva ya enseña las tres recetas con un
mando; el vídeo sería casi un recorrido por ella. Va después de v11.

### v13 · El nombre dice el piso

**Ideas:** `meteo.nubes.altura`, `meteo.nubes.generos`, `meteo.nubes.forma`.

**Por qué cuesta.** De vocabulario engañoso: «alto-» no es alto (es medio), «estrato» no tiene prefijo y es bajo, y el
cúmulo es de desarrollo vertical. Además el examen usa cuatro grupos y la OMM tres, con otras alturas.

**Cuánto cae.** <!-- cae:v13 -->
**62 preguntas**: Andalucía 29, DGMM 12, Baleares 21 (50 publicadas para estudiar y 12 reservadas para el examen final). Sale en 27 de 34 convocatorias de Andalucía, 11 de 14 convocatorias de la DGMM, 24 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v13 -->

**Error típico y trampa.** Altocúmulos y altostratos «altos»; cúmulos «de desarrollo horizontal». Fuentes: «ojo» de la
clase py-2-6; trampas del episodio py 2.5; trampa de `and-py-2024-c1-g12` («El prefijo "alto" engaña»). Discrepancias
documentadas: 3.

**Objetivo.** Colocar cada uno de los diez géneros en su piso a partir de su nombre.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | La palabra «altocúmulo» con «alto» tachado y «medio» encima | El nombre engaña una vez; luego ayuda | «alto-» = medio |
| 2 | Cielo en pisos: «cirro-» arriba (Ci, Cc, Cs), «alto-» en medio (Ac, As), sin prefijo abajo (St, Sc, Ns) | El prefijo te dice el piso | Los prefijos |
| 3 | Cúmulo y cumulonimbo creciendo desde abajo hasta el piso alto, con yunque | Los de desarrollo vertical van aparte | La flecha vertical |
| 4 | Cartela: alturas del examen (> 6000, 2000–6000, < 2000 m) frente a las de la OMM (5–13, 2–7, 0–2 km), con el nimbostrato en medio | El examen y la OMM no coinciden: en el examen, el nimbostrato es bajo | El nimbostrato |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** Pisos y géneros de la OMM (Atlas Internacional de Nubes, WMO-No. 407) y los cuatro grupos del
examen con el nimbostrato bajo (verificación de py-2-6; marco `nubes-pisos` de `src/illustrations/marcos-py.js`).

**Material de la app.** Láminas `{ tipo: 'nubes' }` y `{ tipo: 'nubes-pisos' }` (`src/illustrations/py-cola-meteo-c.js`).
Mapa `nieblas` (altas, medias, bajas, vertical). Clase py-2-6. Episodio py 2.5.

**Preguntas para cerrar.**
- `and-py-2024-c1-g12` · Andalucía, 1ª convocatoria 2024 · «De las siguientes afirmaciones marque la opción FALSA.» Respuesta: **c)** Los altocúmulos son nubes altas formadas por una capa o grupo de nubecillas de forma globular o aplanada.
- `dgmm-py-2023-11-14` · DGMM, noviembre de 2023 · «¿Cuál de los siguientes tipos de nubes NO se clasifican según su altura como nubes altas?» Respuesta: **c)** Nimboestratos.
- `bal-py-2024-07-bc-12` · Baleares, julio de 2024 · «Atendiendo a su altura, señalar a qué familia de nubes pertenecen los Cúmulos:» Respuesta: **d)** Nubes de desarrollo vertical.

**Tanda: tercera.** Una regla de vocabulario que la lámina por pisos ya resuelve; el vídeo es corto y útil, pero no
urgente.

### v14 · Cada corriente, su motor

**Ideas:** `meteo.corrientes.clasificacion`, `meteo.corrientes.arrastre`, `meteo.corrientes.densidad`,
`meteo.corrientes.gradiente`.

**Por qué cuesta.** De clasificación: cuatro tipos con cuatro causas que las opciones intercambian, y absolutos
(«exclusivamente») que convierten en falsa una frase casi cierta.

**Cuánto cae.** <!-- cae:v14 -->
**43 preguntas**: Andalucía 29, DGMM 5, Baleares 9 (36 publicadas para estudiar y 7 reservadas para el examen final). Sale en 28 de 34 convocatorias de Andalucía, 4 de 14 convocatorias de la DGMM, 21 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v14 -->

**Error típico y trampa.** Atribuir las de arrastre a la Luna y el Sol, las de marea a la temperatura y la salinidad, o
las de gradiente «exclusivamente» a la presión en superficie. Fuentes: «ojo» de la clase py-2-9 («El examen cruza las
causas»); trampas del episodio py 2.8; trampa de `and-py-2024-c1-g14` («"exclusivamente" casi siempre convierte la frase
en falsa»).

**Objetivo.** Asociar cada tipo de corriente con su causa.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Cuatro motores: viento, densidad (termómetro y sal), desnivel, Luna y Sol | Cada corriente tiene un motor | Los cuatro iconos |
| 2 | Viento persistente que arrastra la capa de superficie | De arrastre (o de deriva): el viento, y no al instante | «Persistente» |
| 3 | Dos aguas de distinta temperatura y salinidad; la densa se hunde | De densidad o termohalinas; las profundas son casi todas de este tipo | La densa que baja |
| 4 | Mar con el nivel inclinado por diferencias de presión | De gradiente: un desnivel que empuja | El desnivel |
| 5 | Cartela: «exclusivamente», «siempre», «solo» en rojo | Desconfía de los absolutos | Los absolutos |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Tipos y causas: termohalina (temperatura y salinidad), arrastre (viento persistente), gradiente
(desnivel por presión), marea (Luna y Sol) (verificación de py-2-9: plantillas de Andalucía). La corriente se nombra por
hacia dónde va (NGA, *Sailing Directions* Pub. 131, ídem). Las corrientes regionales no entran en este vídeo; si se
añaden, las de Ceuta y Túnez-Sicilia quedan **por verificar** (ver «Hechos por verificar», 4).

**Material de la app.** Lámina `{ tipo: 'corriente-estrecho', vista: 'tipos' }` (y `vista: 'corte'` para el
Estrecho). Clase py-2-9. Episodio py 2.8 (`podcast/py/2-8-corrientes-marinas.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-g17` · Andalucía, 2ª convocatoria 2024 · «De las siguientes afirmaciones marque la opción correcta.» Respuesta: **d)** Las corrientes termohalinas son debidas a variaciones de densidad.
- `and-py-2024-c1-g14` · Andalucía, 1ª convocatoria 2024 · «Con respecto a las corrientes marinas marque la opción FALSA.» Respuesta: **b)** Las corrientes de gradiente son debidas exclusivamente a variaciones de presión en la superficie.
- `dgmm-py-2022-06-12` · DGMM, junio de 2022 · «¿Qué fenómeno es el principal causante de las corrientes marinas de arrastre?» Respuesta: **c)** El viento.

**Tanda: tercera.** Pesa casi solo en Andalucía (28 de 34; 4 de 14 en la DGMM) y es una tabla de cuatro filas.

### v15 · Mar de viento o mar de fondo

**Ideas:** `meteo.olas.mar-de-viento`, `meteo.olas.mar-de-fondo`.

**Por qué cuesta.** Las preguntas intercambian rasgos sueltos (crestas, longitud, regularidad, dirección) y cada opción
falsa mezcla uno de cada tipo.

**Cuánto cae.** <!-- cae:v15 -->
**29 preguntas**: Andalucía 11, DGMM 7, Baleares 11 (20 publicadas para estudiar y 9 reservadas para el examen final). Sale en 12 de 34 convocatorias de Andalucía, 7 de 14 convocatorias de la DGMM, 17 de 28 convocatorias de Baleares. Tema: Meteorología (módulo genérico, sin límite propio de fallos).
<!-- /cae:v15 -->

**Error típico y trampa.** Dar a la mar de viento altura regular, o a la de fondo crestas agudas y longitud parecida a la
altura. Fuentes: «ojo» de la clase py-2-8; trampas del episodio py 2.7; trampa de `bal-py-2025-07-a-17` («Cada opción
falsa mezcla un rasgo de la mar de viento con otro de la mar de fondo»).

**Objetivo.** Reconocer por su perfil y su origen si una mar es de viento o de fondo.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Una borrasca lejos y un barco en calma con olas largas | Puede haber mar sin viento | La borrasca lejana |
| 2 | Mar de viento: crestas agudas, cortas, irregulares, en la dirección del viento que sopla | Se forma donde sopla | Crestas agudas |
| 3 | Mar de fondo: ondas redondeadas, largas y regulares, que llegan de otra dirección | Viene de lejos; su periodo es más largo | La longitud |
| 4 | Perfil de una ola con longitud (cresta a cresta), altura (seno a cresta = 2 × amplitud) y periodo (tiempo) | Las medidas que también se cruzan | 2 × amplitud |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** Mar de viento y mar de fondo (AEMET, Glosario de términos marítimos); longitud cresta–cresta,
periodo tiempo cresta–cresta, altura seno–cresta = 2 × amplitud; altura según intensidad, persistencia y fetch
(verificación de py-2-8).

**Material de la app.** Láminas `{ tipo: 'ola', vista: 'partes' }` y `{ tipo: 'ola', vista: 'mar-de-fondo' }`
(`src/illustrations/py-cola-meteo-c.js`). Clase py-2-8. Episodio py 2.7 (`podcast/py/2-7-las-olas.md`).

**Preguntas para cerrar.**
- `and-py-2023-c3-g18` · Andalucía, 3ª convocatoria 2023 · «De las afirmaciones siguientes marque la opción correcta.» Respuesta: **a)** El mar de fondo presenta crestas redondeadas.
- `dgmm-py-2022-12-14` · DGMM, diciembre de 2022 · «En relación con el mar de fondo, ¿cuál de las siguientes afirmaciones es CORRECTA?» Respuesta: **c)** No tiene por qué ir con el mar de viento.
- `bal-py-2025-12-b-12` · Baleares, diciembre de 2025 · «Las olas características de la mar de leva o mar de fondo, en comparación con las generadas por la mar de viento, poseen un periodo relativamente:» Respuesta: **a)** Más largo.

**Tanda: tercera.** La idea con menos preguntas de la lista; contraste sencillo que una lámina doble ya enseña.

### v16 · Cinco nombres para la hora

**Ideas:** `nav.hora.tu-hcl`, `nav.hora.legal-husos`, `nav.hora.hrb`.

**Por qué cuesta.** De vocabulario y de proceso: cinco horas (TU, HcL, legal, oficial y HRB) con definiciones que
cambian una palabra («Sol medio» o «verdadero», meridiano «inferior» o «superior»), y quién fija cada una.

**Cuánto cae.** <!-- cae:v16 -->
**73 preguntas**: Andalucía 35, DGMM 10, Baleares 28 (60 publicadas para estudiar y 13 reservadas para el examen final). Sale en 31 de 34 convocatorias de Andalucía, 9 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Teoría de navegación (módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v16 -->

**Error típico y trampa.** Llamar legal a la que fija el Gobierno (es la oficial), decir que la HRB «es igual» a la
oficial, o cambiar «inferior» por «superior». Fuentes: «ojo» de la clase py-3-5 (las palabras que cambian y los
verbos); trampas del episodio py 3.4; trampa de `and-py-2023-c3-n02` («La legal es la hora civil del meridiano central
(TU ± huso)»). Discrepancias documentadas: 2.

**Objetivo.** Definir cada hora por quién o qué la fija, y pasar de TU a hora civil del lugar y a hora legal.

**Guion gráfico** (≈ 3,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Cinco relojes con su sigla | Cinco nombres, una pregunta: ¿quién la fija? | Las siglas |
| 2 | La Tierra desde el polo; el Sol medio pasa por el meridiano inferior de Greenwich (medianoche) | TU: desde el paso del Sol medio por el meridiano inferior de Greenwich | «Medio», «inferior» |
| 3 | Lo mismo en el meridiano del barco; 15° = 1 hora; ejemplo: TU 08:00 en 075° W → HcL 03:00 | HcL: lo mismo en tu meridiano. Al W se resta | La cuenta |
| 4 | La Tierra cortada en 24 husos de 15°; dentro de un huso, una sola hora | Hora legal: la del meridiano central del huso, TU ± huso | Un huso |
| 5 | Mapa de España: oficial = legal + adelanto que fija el Gobierno | Oficial: la del Gobierno | El adelanto |
| 6 | Reloj de bitácora con la mano del patrón | HRB: la que decide el patrón; puede coincidir con otra, no tiene por qué | «Puede coincidir» |

**Hechos y fuentes.** TU y HcL desde el paso del Sol medio por el meridiano inferior; huso de 15°, hora legal = TU ±
huso; HRB la fija el patrón; TU 08:00 en 075° W → HcL 03:00 (verificación de py-3-5: plantillas y recálculo). Horario
de verano del último domingo de marzo al último de octubre (Directiva 2000/84/CE). Los husos de la península y Canarias
quedan **por verificar** en la norma española (ver «Hechos por verificar», 7). Ojo: el tribunal rectificó una pregunta
sobre la misma longitud y la misma hora (`and-py-2021-c1-n04`, discrepancia documentada): no usarla de ejemplo.

**Material de la app.** Lámina `{ tipo: 'husos' }` con sus vistas `husos`, `calculo` (ejemplos `e` y `w`) y `oficial`
(`src/illustrations/py-cola-c.js`). Mapa `mareas-py` (tu, hcl, hz, ho, hrb). Clase py-3-5. Episodio py 3.4
(`podcast/py/3-4-la-hora-en-la-mar.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-n05` · Andalucía, 2ª convocatoria 2024 · «La hora civil del lugar (HcL) es:» Respuesta: **d)** El tiempo que ha transcurrido desde que el sol medio pasó por el meridiano inferior de lugar.
- `and-py-2023-c3-n02` · Andalucía, 3ª convocatoria 2023 · «Indique la opción correcta:» Respuesta: **a)** Los husos horarios están limitados por dos meridianos cuyas longitudes difieren 15º.
- `bal-py-2025-07-a-25` · Baleares, julio de 2025 · «¿Cómo se representa la Hora Legal?» Respuesta: **d)** Hz.

**Tanda: segunda.** Teoría de navegación es eliminatoria y la hora sale en 31 de 34 convocatorias de Andalucía y 27 de
28 de Baleares; además la necesita v30 (mareas, paso a TU).

### v17 · Perpendicular, ¿a qué?

**Ideas:** `nav.esfera.circulos`, `nav.esfera.tropicos-polares`, `nav.esfera.meridiano-lugar`.

**Por qué cuesta.** Espacial y de palabras: «perpendicular al eje» frente a «perpendicular al ecuador», círculo máximo
frente a menor, y cifras que se invierten (23° 27′ frente a 27° 23′).

**Cuánto cae.** <!-- cae:v17 -->
**72 preguntas**: Andalucía 36, DGMM 12, Baleares 24 (60 publicadas para estudiar y 12 reservadas para el examen final). Sale en 28 de 34 convocatorias de Andalucía, 9 de 14 convocatorias de la DGMM, 23 de 28 convocatorias de Baleares. Tema: Teoría de navegación (módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v17 -->

**Error típico y trampa.** «Los meridianos son perpendiculares al eje», «todos los círculos máximos pasan por los
polos», círculos polares solo en el norte. Fuentes: «ojo» de la clase py-3-1 («La trampa está en la palabra
perpendicular»); trampas del episodio py 3.1; trampa de `and-py-2024-c2-n01` («Las cifras invertidas»).

**Objetivo.** Señalar en una esfera eje, ecuador, paralelos, meridianos, trópicos y círculos polares, y decir a qué es
perpendicular cada uno.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Esfera con el eje; se corta por un plano perpendicular al eje: el ecuador | Ecuador y paralelos, perpendiculares al eje | El ángulo recto con el eje |
| 2 | Plano que contiene el eje: un meridiano | Los meridianos contienen el eje y cortan el ecuador en ángulo recto | El eje dentro del plano |
| 3 | Círculos máximos (ecuador, meridianos) frente a menores (paralelos) | No todo círculo máximo pasa por los polos: el ecuador no | El ecuador |
| 4 | Trópicos a 23° 27′ N y S; círculos polares a 66° 33′ N y S | Dos de cada, uno en cada hemisferio | Las dos cifras |
| 5 | Meridiano del lugar (superior) y su opuesto (inferior); Greenwich y el 180° | El meridiano superior pasa por ti; el inferior, por el lado opuesto | Superior e inferior |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Definiciones de la esfera; trópicos 23° 27′ y círculos polares 66° 33′ en los dos hemisferios
(verificación de py-3-1: plantillas de Andalucía). La oblicuidad actual es de unos 23° 26′ (IAU, ídem): el examen usa
23° 27′; si el vídeo da la cifra, decir las dos.

**Material de la app.** Lámina `{ tipo: 'coordenadas', vista: 'esfera' }` con `resaltar: 'maximos'` y
`resaltar: 'tropicos'`, y `vista: 'lugar'` (`src/illustrations/coordenadas-c.js`). Clase py-3-1. Episodio py 3.1
(`podcast/py/3-1-la-esfera-terrestre.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-n01` · Andalucía, 3ª convocatoria 2024 · «Se denomina meridianos a:» Respuesta: **a)** Los círculos máximos que unen los polos norte y sur, y son perpendiculares al ecuador.
- `and-py-2024-c2-n02` · Andalucía, 2ª convocatoria 2024 · «Los círculos polares están situados:» Respuesta: **c)** En el hemisferio norte y en el hemisferio sur.
- `bal-py-2025-12-b-28` · Baleares, diciembre de 2025 · «El trópico de Capricornio es un paralelo separado del ecuador:» Respuesta: **b)** 23º 27' hacia el hemisferio sur.

**Tanda: tercera.** Eliminatoria y frecuente, pero son definiciones que la lámina de la esfera ya enseña; el vídeo es
rápido de hacer con un globo en 3D.

### v18 · Tres nortes y un signo

**Ideas:** `nav.aguja.declinacion`, `nav.aguja.declinacion-actualizar`, `nav.aguja.desvio`, `nav.ct.definicion`,
`nav.ct.dm-desvio`, `nav.ct.convertir`, `nav.rumbos.tipos`.

**Por qué cuesta.** De signos y de proceso: tres nortes, dos ángulos con signo (E +, W −), una suma algebraica y el paso
de un rumbo a otro en los dos sentidos. Y de vocabulario: qué depende del lugar y qué del barco.

**Cuánto cae.** <!-- cae:v18 -->
**103 preguntas**: Andalucía 43, DGMM 31, Baleares 29 (86 publicadas para estudiar y 17 reservadas para el examen final). Sale en 32 de 34 convocatorias de Andalucía, 13 de 14 convocatorias de la DGMM, 26 de 28 convocatorias de Baleares. Tema: Teoría de navegación 81, Carta 22 (el grueso, módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v18 -->

**Error típico y trampa.** Atribuir a la declinación lo que es del desvío (los hierros, la ubicación de la aguja), y
creer que el desvío de un rumbo vale para todos. Fuentes: «ojo» de la clase py-3-2; trampas del episodio py 3.2; trampa
de `and-py-2024-c1-n02` («Las opciones a, b y d describen causas del desvío»).

**Objetivo.** Dibujar los tres nortes, decir de qué depende cada ángulo, calcular la Ct con su signo y pasar de rumbo
de aguja a verdadero y al revés.

**Guion gráfico** (≈ 3,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Rosa con tres nortes saliendo del mismo punto: verdadero, magnético y de aguja | Tres nortes, tres rumbos | Los tres |
| 2 | Entre Nv y Nm, la declinación; la Tierra con el polo magnético lejos del geográfico | La declinación depende del lugar y del año; la da la carta | «Lugar y año» |
| 3 | Entre Nm y Na, el desvío; el barco con sus hierros y el motor | El desvío depende del barco y del rumbo de aguja | «Barco y rumbo» |
| 4 | Suma con signo: Ct = dm + Δ; E +, W − | La Ct es la suma con sus signos | Los signos |
| 5 | Ejemplo: carta 2° 50′ W 2005 (7′ E) → en 2015, dm 1° 40′ W; Ra 075°, Δ +3° → Ct +1° 20′ → Rv 076° 20′ | De aguja a verdadero se suma la Ct; de verdadero a aguja se resta | La variación anual que resta |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Signos E (NE) +, W (NW) −; Ct = dm + Δ; Rv = Ra + Ct; Ra = Rv − Ct; declinación actualizada con la
variación anual y su signo; el desvío se toma con el rumbo de aguja (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014,
anexo II, PY UT 3.2 y 4.1, y `src/nautical/compass.js`). La declinación depende de la zona y del tiempo, el desvío del
barco y del rumbo (verificación de py-3-2). Ejemplo: resuelto `ct-dm-desvio`; recalculado: 10 años × 7′ E = 1° 10′,
2° 50′ W − 1° 10′ = 1° 40′ W; −1° 40′ + 3° = +1° 20′; 075° + 1° 20′ = 076° 20′.

**Material de la app.** Lámina interactiva `{ tipo: 'nortes', dm: 3, desvio: -5 }` (`src/illustrations/interactivas/nortes.js`:
mandos de declinación y desvío, signo de la Ct). Resuelto `ct-dm-desvio` (`#/py/carta-pasos/ct-dm-desvio`). Mapa
`rumbos` (del PER: nv, nm, na, dm, desvio, ct). Clase py-3-2. Episodio py 3.2 (`podcast/py/3-2-la-correccion-total.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-n02` · Andalucía, 1ª convocatoria 2024 · «La declinación magnética depende:» Respuesta: **c)** De la zona geográfica de navegación.
- `and-py-2024-c3-n02` · Andalucía, 3ª convocatoria 2024 · «En el caso de que obtengamos la corrección total por medio de una enfilación, el desvío que calculemos corresponde a:» Respuesta: **b)** Al rumbo de aguja al que navegamos.
- `bal-py-2024-07-bc-25` · Baleares, julio de 2024 · «El ángulo que forma la dirección del norte de aguja con la del norte magnético, a bordo de un barco se llama:» Respuesta: **b)** Desvío.

**Tanda: primera.** La idea con más preguntas de teoría (y 22 de carta): todo el examen de carta empieza y acaba con la
Ct. Eliminatoria por los dos lados.

### v19 · La Ct en la mar: enfilación, oposición y Polar

**Ideas:** `nav.ct.enfilacion`, `nav.ct.polar`.

**Por qué cuesta.** De proceso y de signos: hay que medir la recta en la carta en el sentido bueno, restar en el orden
bueno (Dv − Da) y no meter los datos que sobran (rumbo, velocidad, declinación). La Polar añade la idea de que su
azimut verdadero es casi 0°.

**Cuánto cae.** <!-- cae:v19 -->
**85 preguntas**: Andalucía 49, DGMM 10, Baleares 26 (75 publicadas para estudiar y 10 reservadas para el examen final). Sale en 33 de 34 convocatorias de Andalucía, 7 de 14 convocatorias de la DGMM, 22 de 28 convocatorias de Baleares. Tema: Carta 55, Teoría de navegación 30 (el grueso, módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v19 -->

**Error típico y trampa.** Restar al revés (Da − Dv), medir la oposición hacia el faro equivocado (sale una Ct de casi
180°) o usar la declinación cuando solo piden la Ct. Fuentes: «ojo» de la clase py-4-1 («Casi todos los enunciados traen
datos que sobran»); trampas del episodio py 4.1; trampa de `and-py-2024-c2-n11` («Hacer Da − Dv»). Discrepancias
documentadas: 7 (tres de la Polar en Baleares, tres de trazado de la enfilación, que mide 078,6° y no 080°, y una de
formato de las opciones).

**Objetivo.** Sacar la Ct de una enfilación, de una oposición y de la Polar, con su signo, y de ahí el desvío si dan la
declinación.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Enunciado con rumbo, velocidad, declinación y demora de aguja; todo tachado salvo la Da | Para la Ct de una enfilación solo hacen falta dos números | La Da |
| 2 | Extracto de carta: dos faros alineados; la recta medida del faro de atrás al de delante: Dv 243,5° | La Dv sale de la carta, en el sentido en que miras | La flecha de la recta |
| 3 | Ct = Dv − Da = 243,5° − 247° = −3,5° | Carta menos aguja; al revés sale el mismo número con el otro signo | El orden de la resta |
| 4 | Si dan la declinación (2° NW): Δ = Ct − dm = −3,5° − (−2°) = −1,5°, válido solo para ese rumbo | El desvío sale después, y es del rumbo al que ibas | «Solo para este rumbo» |
| 5 | Oposición: los faros a un lado y otro; se mide hacia el faro marcado | Si mides hacia el otro, la Ct sale cerca de 180° | La flecha bien puesta |
| 6 | Cielo nocturno con la Polar: Zv ≈ 000°; Za 358° → Ct +2° | La Polar está a menos de 1° del polo: el examen toma Zv = 000° | Zv = 000° |

**Hechos y fuentes.** Enfilación: Ct = Dv − Da; Δ = Ct − dm (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo
II, PY UT 4.1, y `ctFrom()`, `desvioFrom()`); el ejemplo es el resuelto `enfilacion` (Dv 243,5°, Da 247°, Ct −3,5°;
dm 2° NW, Δ −1,5°). Polar a menos de 1° del polo, error de azimut de unos 0,8° a 36° N; el examen toma Zv = 000°
(Za 358° → Ct +2°, `and-py-2021-c2-n11`) (verificación de py-4-1 y py-3-2).

**Material de la app.** Lámina `{ tipo: 'enfilacion', dv: 147, da: 152 }` (`src/illustrations/carta-c.js`) y lámina
interactiva de nortes. Resuelto `enfilacion`. Clase py-4-1. Episodio py 4.1
(`podcast/py/4-1-correccion-total-en-la-carta.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-n11` · Andalucía, 3ª convocatoria 2024 · «Navegamos al rumbo de aguja 240º. Al cruzar la enfilación de los faros de Punta Alcázar y Punta Cires marcamos el faro de Punta Cires en demora de aguja 233º. Calcular la corrección total.» Respuesta: **b)** – 6º (menos). (Con carta.)
- `and-py-2024-c2-n11` · Andalucía, 2ª convocatoria 2024 · «Navegamos al rumbo verdadero 310º. Al cruzar la oposición de los faros de Punta Alcázar y Punta Paloma, marcamos al faro de Punta Paloma en demora de aguja 321º. Calcular la corrección total.» Respuesta: **c)** +8º (más). (Con carta.)
- `dgmm-py-2024-04-27` · DGMM, abril de 2024 · «Para calcular mediante fórmula la corrección total en una enfilación, bastará con conocer:» Respuesta: **d)** La demora de aguja y la demora verdadera.

**Tanda: primera.** Sale en 33 de 34 convocatorias de Andalucía, casi siempre en carta (eliminatoria, 3 fallos como
mucho). Es un procedimiento corto con dos trampas de signo que se ven en un solo dibujo.

### v20 · Abatimiento no es deriva

**Ideas:** `nav.viento-corriente.abatimiento`, `nav.rumbos.superficie-efectivo`.

**Por qué cuesta.** De vocabulario y espacial: cuatro rumbos (verdadero, de superficie, efectivo y, en la carta, a
dar) y dos ángulos (abatimiento y deriva) que el examen intercambia. Es el vocabulario de todos los problemas de carta.

**Cuánto cae.** <!-- cae:v20 -->
**56 preguntas**: Andalucía 28, DGMM 16, Baleares 12 (45 publicadas para estudiar y 11 reservadas para el examen final). Sale en 25 de 34 convocatorias de Andalucía, 12 de 14 convocatorias de la DGMM, 20 de 28 convocatorias de Baleares. Tema: Teoría de navegación 55, Carta 1 (el grueso, módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v20 -->

**Error típico y trampa.** Llamar efectivo al rumbo afectado por el viento (es el de superficie) y atribuir la deriva al
viento. Fuentes: «ojo» de la clase py-3-3; trampas del episodio py 3.3; trampa de `dgmm-py-2024-04-26` («La b) atribuye
la deriva al viento»).

**Objetivo.** Nombrar el rumbo y el ángulo que produce el viento, el que produce la corriente y el que resulta de los
dos.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Barco visto desde arriba con la proa al Rv | El rumbo verdadero es a donde apunta la proa | La crujía |
| 2 | Sopla viento por babor: la estela se tuerce; el barco avanza por el Rs, a sotavento | Abatimiento: el ángulo entre la crujía y la estela, por el viento. Rs = Rv + Ab | El ángulo Ab |
| 3 | Sin viento, con corriente: el agua entera se mueve; el barco avanza sobre el fondo por el Ref | Deriva: el ángulo entre la crujía y la derrota sobre el fondo, por la corriente | El ángulo de deriva |
| 4 | Los dos a la vez: primero Rs, luego el vector de la corriente; sale el Ref | Con viento y corriente, el resultante es el efectivo | El orden |
| 5 | Cartela: el viento solo cambia la dirección; la corriente, dirección y velocidad, igual para todos los barcos | Por convenio | «Igual para todos» |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Definiciones de abatimiento y deriva; viento y corriente juntos dan el rumbo efectivo; la
corriente afecta igual a todos los barcos y el viento no (verificación de py-3-3: plantillas de Andalucía). Rs = Rv + Ab
con Ab positivo si el viento entra por babor (apéndice de `docs/CARTA-RESUELTOS.md`). Ejemplo para la escena 4: Rv 040°
a 6 nudos con corriente al 120° de 2,5 nudos → Ref ≈ 061°, Vef ≈ 6,9 nudos (verificación de py-3-3; recalculado).

**Material de la app.** Láminas interactivas `{ tipo: 'abatimiento', banda: 'babor' }`
(`src/illustrations/interactivas/abatimiento.js`) y `{ tipo: 'corriente', caso: 'efectivo' }`
(`src/illustrations/interactivas/corriente.js`). Mapa `corriente-abatimiento` (rv, ab, rs, deriva, ref). Clase py-3-3.
Episodio py 3.3 (`podcast/py/3-3-viento-y-corriente.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-n03` · Andalucía, 1ª convocatoria 2024 · «Navegamos con rumbo de aguja Sur constante en la bahía de Algeciras, y observamos que la enfilación popa-proa de nuestra embarcación va variando su proyección en tierra, ¿A qué se puede deber si navegamos en una zona sin corriente?:» Respuesta: **c)** Al abatimiento.
- `dgmm-py-2024-04-26` · DGMM, abril de 2024 · «En relación con el abatimiento y la deriva, señale la afirmación CORRECTA.» Respuesta: **c)** El abatimiento es el ángulo entre la derrota y la línea de crujía debido a la acción del viento.
- `bal-py-2025-04-bc-25` · Baleares, abril de 2025 · «¿En qué casos coincide el rumbo verdadero con el de superficie?» Respuesta: **d)** Cuando se navega con el viento por la proa.

**Tanda: primera.** Por sí sola pesa menos, pero es el vocabulario de v25 a v29: conviene que exista antes que ellos.

### v21 · Radar: la ganancia va con su filtro

**Ideas:** `nav.radar.ajustes`.

**Por qué cuesta.** De funcionamiento: tres mandos (sintonía, ganancia y filtros de mar y de lluvia) que nadie ha
tocado y cuyo efecto solo se entiende viendo la pantalla.

**Cuánto cae.** <!-- cae:v21 -->
**37 preguntas**: Andalucía 22, DGMM 4, Baleares 11 (33 publicadas para estudiar y 4 reservadas para el examen final). Sale en 22 de 34 convocatorias de Andalucía, 4 de 14 convocatorias de la DGMM, 13 de 28 convocatorias de Baleares. Tema: Teoría de navegación (módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v21 -->

**Error típico y trampa.** Combinar la sintonía con el anti-lluvia, creer que la ganancia al máximo aumenta el alcance
o que el anti-mar borra la costa. Fuentes: «ojo» de la clase py-3-8 («La ganancia acompaña siempre al filtro»);
trampas del episodio py 3.6; trampa de `and-py-2024-c1-n06`.

**Objetivo.** Elegir el ajuste para cada problema de la pantalla: imagen óptima, mar, lluvia, ecos débiles y barrido
sin ecos.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Pantalla de radar limpia con la costa, un barco y una boya | Tres mandos | Los tres mandos |
| 2 | Ganancia baja: ecos débiles; ganancia al máximo: la pantalla se llena de ruido | Ganancia: ni a cero ni al máximo | La saturación |
| 3 | Ruido de mar alrededor del centro; anti-mar lo limpia y se lleva un barco pequeño cercano | El filtro de mar actúa cerca: cuidado con los ecos pequeños | El barco que desaparece |
| 4 | Mancha de un chubasco; anti-lluvia la aclara | Con lluvia, ganancia y anti-lluvia; con mar, ganancia y anti-mar | Las dos parejas |
| 5 | Barrido sin ecos: se ajusta la sintonía | Imagen óptima: sintonía y ganancia | La sintonía |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Lluvia → ganancia y anti-lluvia; mar → ganancia y anti-mar; óptima → sintonía y ganancia; barrido
sin ecos → sintonía; ganancia alta satura (verificación de py-3-8: plantillas de Andalucía). Bandas X (≈ 9,4 GHz) y S
(≈ 3 GHz) (UIT-R M.1313 / OMI MSC.192(79), ídem). El comportamiento de los filtros queda **por verificar** contra una
norma técnica (ver «Hechos por verificar», 5). Dos discrepancias documentadas: con la ganancia a cero tampoco hay ecos
(`and-py-2023-c3-n06`) y la niebla apenas da eco en el radar (`bal-py-2025-12-a-23`).

**Material de la app.** Lámina `{ tipo: 'radar-pantalla', presentacion: 'ambas' }` (`src/illustrations/electronica-c.js`).
Mapa `electronica` (radar, ganancia, mar, lluvia). Clase py-3-8. Episodio py 3.6 (`podcast/py/3-6-el-radar.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-n06` · Andalucía, 1ª convocatoria 2024 · «¿Cuál es el efecto de incrementar hasta su valor máximo la ganancia en un equipo de radar?:» Respuesta: **d)** Ninguna de las respuestas anteriores es correcta.
- `and-py-2023-c2-n05` · Andalucía, 2ª convocatoria 2023 · «Al utilizar el control de perturbación de mar (anti-clutter sea):» Respuesta: **a)** Pueden atenuarse e incluso desaparecer de la pantalla del radar los ecos de buques pequeños que se encuentren cerca del nuestro.
- `dgmm-py-2022-12-24` · DGMM, diciembre de 2022 · «Realizando navegación costera, se reciben ciertos ecos muy débiles en la pantalla del radar. Pese a estar éste ajustado a una escala adecuada, no se observa el perfil de la costa en la pantalla. En general, ¿cómo se podría ajustar el radar para visualizar en pantalla el perfil de la costa?» Respuesta: **b)** Aumentando la ganancia del radar.

**Tanda: tercera.** Muy visual, pero pesa sobre todo en Andalucía (22 de 34; 4 de 14 en la DGMM) y depende de verificar
los filtros con una fuente técnica.

### v22 · Raster o vectorial: foto o base de datos

**Ideas:** `nav.cartas-electronicas.tipos`, `nav.cartas-electronicas.ecdis-papel`.

**Por qué cuesta.** De siglas: RNC, ENC, ECDIS, ECS, SENC, y el examen cruza cuál es raster y cuál vectorial y mezcla
cartas con sistemas.

**Cuánto cae.** <!-- cae:v22 -->
**59 preguntas**: Andalucía 25, DGMM 14, Baleares 20 (48 publicadas para estudiar y 11 reservadas para el examen final). Sale en 25 de 34 convocatorias de Andalucía, 12 de 14 convocatorias de la DGMM, 26 de 28 convocatorias de Baleares. Tema: Teoría de navegación (módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v22 -->

**Error típico y trampa.** «ENC raster y RNC vectorial» y «los tipos de carta son raster y ECDIS». Fuentes: «ojo» de la
clase py-3-10; trampas del episodio py 3.8; trampa de `and-py-2024-c3-n09` («Las afirmaciones con los tipos
intercambiados»).

**Objetivo.** Distinguir las dos cartas electrónicas y no confundirlas con los sistemas que las muestran.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Una carta raster ampliada hasta verse los píxeles | RNC: la foto escaneada de la carta de papel | Los píxeles |
| 2 | Una vectorial en capas (tierra, sondas, boyas) que salta una alarma al cruzar un veril | ENC: objeto a objeto (S-57); por eso puede avisar | La alarma |
| 3 | Un ECDIS, un ECS y un plotter con la carta dentro | Son sistemas que muestran cartas, no cartas | «Sistema» |
| 4 | Las dos con un sello de «actualizada» | Las dos se actualizan | El sello |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** Raster (RNC) y vectorial (ENC, S-57); ECDIS y ECS son sistemas; las ENC españolas las produce el
IHM; un ECDIS en modo raster necesita cartas de papel al día (verificación de py-3-10: OHI S-57, OMI Res. MSC.232(82),
SOLAS V/19).

**Material de la app.** Lámina `{ tipo: 'carta-raster-vectorial' }` (`src/illustrations/electronica-c.js`). Mapa
`electronica` (cartas). Clase py-3-10. Episodio py 3.8 (`podcast/py/3-8-cartas-electronicas-y-ais.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-n09` · Andalucía, 3ª convocatoria 2024 · «En relación con las cartas electrónicas, ¿cuál de las siguientes respuestas es correcta?:» Respuesta: **d)** Ninguna de las respuestas anteriores es correcta.
- `and-py-2023-c3-n09` · Andalucía, 3ª convocatoria 2023 · «Las cartas náuticas electrónicas generadas por el procedimiento de escanear cartas náuticas de papel se conocen como:» Respuesta: **d)** Raster o RNC.
- `dgmm-py-2023-11-27` · DGMM, noviembre de 2023 · «Las cartas electrónicas vectoriales y oficiales son:» Respuesta: **b)** ENC.

**Tanda: tercera.** Dos siglas y una imagen; la lámina ya lo resuelve.

### v23 · AIS: solo ves a quien lo lleva

**Ideas:** `nav.ais.sistema`, `nav.ais.datos`.

**Por qué cuesta.** De funcionamiento: se confunde con el radar (que ve todo lo que da eco) y se sobreestima lo que da
(«siempre toda la información», «sustituye al radar»).

**Cuánto cae.** <!-- cae:v23 -->
**62 preguntas**: Andalucía 28, DGMM 15, Baleares 19 (47 publicadas para estudiar y 15 reservadas para el examen final). Sale en 27 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Teoría de navegación 60, Seguridad 2 (el grueso, módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v23 -->

**Error típico y trampa.** Creer que el AIS ve a todos los barcos o que da la misma información que el radar. Fuentes:
«ojo» de la clase py-3-10 («siempre falso: sustituye al radar…»); trampas del episodio py 3.8; trampa de
`dgmm-py-2023-11-28` («el radar ve todo lo que da eco; el AIS, solo a quien transmite»).

**Objetivo.** Decir qué ve el AIS, qué no ve y por qué no sustituye al radar ni a la vigilancia.

**Guion gráfico** (≈ 2 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Carta con tu barco: un mercante con AIS (triángulo y vector), una boya con AIS, la estación costera | El AIS intercambia identidad, posición, rumbo y velocidad por VHF | Los triángulos |
| 2 | Un velero sin AIS cerca: no aparece en el AIS; sí en el radar | Solo ves a quien lo lleva encendido | El velero que falta |
| 3 | El AIS toma la posición del GNSS del barco | Si el GNSS falla, el AIS no sabe dónde está | La flecha GNSS → AIS |
| 4 | Cartela: canales 87B y 88B; alcance del VHF | Es radio VHF, no radar ni satélite | 87B · 88B |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** AIS en VHF, canales 87B y 88B (161,975 y 162,025 MHz) (UIT-R M.1371); obligatoriedad (SOLAS
V/19.2.4); el patrón puede apagarlo si compromete la seguridad (OMI Res. A.1106(29)) (verificación de py-3-10). Toma la
posición del GNSS y no ve a quien no lo lleva (marco `ais` de `src/illustrations/marcos-py.js`).

**Material de la app.** Lámina `{ tipo: 'ais' }` (`src/illustrations/electronica-c.js`). Mapa `electronica` (ais).
Clase py-3-10. Episodio py 3.8.

**Preguntas para cerrar.**
- `and-py-2024-c1-n10` · Andalucía, 1ª convocatoria 2024 · «¿Para qué sirve el Sistema de Identificación Automática de buques A.I.S.?:» Respuesta: **b)** Para prevenir abordajes, mediante el seguimiento y la identificación de embarcaciones en tiempo real.
- `dgmm-py-2023-11-28` · DGMM, noviembre de 2023 · «Si hay niebla en zona de tráfico denso, el AIS de nuestra embarcación permite:» Respuesta: **b)** Identificar y posicionar a los buques de nuestro entorno equipados con AIS.
- `bal-py-2022-12-b-30` · Baleares, diciembre de 2022 · «El AIS es un sistema que,» Respuesta: **d)** Las opciones A y C son correctas.

**Tanda: tercera.** Una idea sola («solo ves a quien lo lleva») que la lámina ya dice. Ojo: hay dos plantillas de
Andalucía que parecen chocar sobre la meteorología por AIS (explicado en el «ojo» de py-3-10): no usarlas de ejemplo.

### v24 · La pantalla del GNSS, sigla a sigla

**Ideas:** `nav.gnss.siglas`.

**Por qué cuesta.** De vocabulario: siglas inglesas parecidas (COG, SOG, CMG; XTE, DTG; ETA, ETD) y otras inventadas
que el examen cuela (MOG, VSG, WTE).

**Cuánto cae.** <!-- cae:v24 -->
**67 preguntas**: Andalucía 34, DGMM 6, Baleares 27 (56 publicadas para estudiar y 11 reservadas para el examen final). Sale en 32 de 34 convocatorias de Andalucía, 6 de 14 convocatorias de la DGMM, 25 de 28 convocatorias de Baleares. Tema: Teoría de navegación (módulo de navegación; el tema admite como mucho 5 fallos).
<!-- /cae:v24 -->

**Error típico y trampa.** Confundir COG (rumbo) con SOG (velocidad), XTE con la distancia que falta (DTG) y ETA con
ETD. Fuentes: «ojo» de la clase py-3-9; trampas del episodio py 3.7; trampa de `and-py-2024-c1-n07` («Confundir COG
(rumbo) con SOG (velocidad)»).

**Objetivo.** Leer una pantalla de GNSS y decir qué es cada sigla y cuál es rumbo, velocidad, distancia u hora.

**Guion gráfico** (≈ 2,5 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Pantalla con las siglas y algunas inventadas mezcladas | Primero, separar las que existen | Las inventadas, tachadas |
| 2 | Ruta entre dos WPT vista desde arriba: el barco a un lado; HDG (proa), COG y SOG (sobre el fondo) | Over Ground: sobre el fondo, con viento y corriente; son los efectivos | COG frente a HDG |
| 3 | El XTE acotado de la ruta al barco; el DTG hasta el WPT | XTE: cuánto te has apartado; DTG: cuánto falta | Las dos cotas |
| 4 | TTG = DTG / SOG: 18 M / 6 nudos = 3 h; ETA 10:20 + 3 h = 13:20 | La ETA sale con la SOG | La división |
| 5 | Botón MOB | Hombre al agua: guarda la posición | MOB |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Siglas WPT, COG, SOG, XTE, ETA, MOB (verificación de py-3-9: plantillas de Andalucía); TTG 18/6 =
3 h, ETA 13:20; XTE 0,05 M ≈ 93 m (ídem, recalculado). COG y SOG incluyen viento y corriente (marco `gnss` de
`src/illustrations/marcos-py.js`).

**Material de la app.** Láminas `{ tipo: 'gnss' }` y `{ tipo: 'gnss-calculos' }` (`src/illustrations/electronica-c.js`).
Mapa `electronica` (gnss, sog, cog, ruta). Clase py-3-9. Episodio py 3.7 (`podcast/py/3-7-el-gps.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-n07` · Andalucía, 1ª convocatoria 2024 · «La velocidad efectiva en un equipo GNSS está representada por las siglas:» Respuesta: **b)** SOG.
- `dgmm-py-2022-06-28` · DGMM, junio de 2022 · «¿Qué significan las siglas XTE?» Respuesta: **d)** Cross Track Error.
- `bal-py-2025-07-b-26` · Baleares, julio de 2025 · «¿En cuál de las siguientes opciones hay siglas que no se corresponden con el GNSS?» Respuesta: **b)** SOG, COG, WTE.

**Tanda: tercera.** Idea añadida por su frecuencia (32 de 34 en Andalucía), pero es vocabulario: una tarjeta por sigla
la resuelve casi igual. El vídeo, si se hace, enlaza con v20 (COG y SOG son el rumbo y la velocidad efectivos).

### v25 · Rumbo a dar con corriente: el triángulo

**Ideas:** `carta.corriente.rumbo-a-dar`.

**Por qué cuesta.** De proceso y espacial: un triángulo de velocidades a escala de una hora en el que hay que saber
desde dónde se traza cada lado y cuál de las tres líneas es el rumbo a dar. Es el problema de carta con más preguntas.

**Cuánto cae.** <!-- cae:v25 -->
**130 preguntas**: Andalucía 48, DGMM 13, Baleares 69 (114 publicadas para estudiar y 16 reservadas para el examen final). Sale en 30 de 34 convocatorias de Andalucía, 11 de 14 convocatorias de la DGMM, 28 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v25 -->

**Error típico y trampa.** Medir el rumbo a dar desde la salida hasta el corte (eso es el efectivo), calcular la hora
con la velocidad del barco en vez de la efectiva, o aproar hacia el lado al que empuja la corriente. Fuentes: «ojo» de
la clase py-4-7; trampas del episodio py 4.5; trampa de `and-py-2024-c1-n12` («Aproar directamente al rumbo efectivo
olvidando la corriente»).

**Objetivo.** Construir el triángulo y sacar el rumbo de aguja, la velocidad efectiva y la hora de llegada.

**Guion gráfico** (≈ 4 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Barco que aproa directo al destino y la corriente lo saca de la línea | Si das la proa al destino, no llegas | La derrota que se desvía |
| 2 | Línea de la salida al destino: Ref 039°, 10,3 M | Esa línea es el rumbo efectivo que necesitas | Ref |
| 3 | Desde la salida, el vector de la corriente: 090°, 2 millas (una hora) | La corriente, desde la salida, a escala de una hora | El vector corriente |
| 4 | Desde la punta de la corriente, arco de radio 6 millas (la velocidad del barco) que corta el Ref | El arco es tu barco en una hora | El corte |
| 5 | De la punta de la corriente al corte: Rv 024°; de la salida al corte: Vef 7,1 nudos | El rumbo a dar sale de la punta de la corriente; la Vef, de la salida | Las dos líneas, rotuladas |
| 6 | Hora: 10,3 / 7,1 → 1 h 27 min (09:00 → 10:27); Ct −3° → Ra 027° | La hora con la Vef; al final, la Ct | Vef, no Vb |
| 7 | Pregunta de cierre | | |

**Hechos y fuentes.** Corriente nombrada hacia donde va; rumbo a dar: corriente desde la salida y arco de radio la
velocidad del barco; Vef sobre el efectivo (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.5, y
`courseToSteer()`). Ejemplo: resuelto `corriente-rumbo-a-dar` (de 35° 55′ N 005° 32′ W a 36° 03′ N 005° 24′ W).
Recalculado: el ángulo entre corriente y efectivo es 51°; 2 · sen 51° / 6 → 15,0°, 039° − 15° = 024°; Vef = 6 · cos
15° + 2 · cos 51° ≈ 7,05; 10,3 / 7,05 ≈ 1,46 h = 1 h 27 min; Ra = 024° − (−3°) = 027°.

**Material de la app.** Lámina interactiva `{ tipo: 'corriente', caso: 'rumbo-a-dar' }` (conmutador «qué rumbo doy para
llegar», `src/illustrations/interactivas/corriente.js`). Resuelto `corriente-rumbo-a-dar`. Mapa `corriente-abatimiento`
(corriente, rumboadar, ref, hora). Clase py-4-7. Episodio py 4.5
(`podcast/py/4-5-corriente-conocida-y-desconocida.md`).

**Preguntas para cerrar.**
- `and-py-2024-c1-n12` · Andalucía, 1ª convocatoria 2024 · «Navegamos a 8 nudos en zona de corriente de rumbo de corriente = W e intensidad horaria = 3 millas. Al encontrarnos a 3 millas al E verdadero del faro de Punta Almina, damos rumbo a Algeciras (luz roja de la bocana del puerto). Calcular el rumbo de aguja sabiendo que la declinación magnética = 7º NE y el desvío de la aguja = +5º (más).» Respuesta: **b)** 332º. (Con carta.)
- `and-py-2024-c3-n13` · Andalucía, 3ª convocatoria 2024 · «Al ser HRB = 13:15 nos encontramos en situación 35º 57,0′ N, 005º 50,0′ W y damos rumbo a Barbate (faro de Tierra), teniendo en cuenta que nos afecta una corriente de rumbo de corriente = SE e intensidad horaria = 3 millas. Calcular el rumbo de aguja y la velocidad del barco para llegar a Barbate a HRB = 16:15. El desvío de la aguja = –5º (menos) y la declinación magnética de la carta = 4º 40′ W 2014 (4′ E).» Respuesta: **b)** 342º, 7,8 nudos. (Con carta; variante de hora fijada.)

**Tanda: primera.** La idea con más preguntas de todo el PY después de las mareas, sale en todas las convocatorias de
Baleares y es de carta (eliminatoria). El triángulo animado es justo lo que un vídeo hace mejor que el texto.

### v26 · Corriente desconocida: de la estima a la observada

**Ideas:** `carta.corriente.desconocida`.

**Por qué cuesta.** De proceso y de sentido: hacer la estima sin la corriente (que es lo que se busca), situarse a la
misma hora, trazar el vector en el sentido bueno y dividir por el tiempo bueno.

**Cuánto cae.** <!-- cae:v26 -->
**100 preguntas**: Andalucía 24, DGMM 14, Baleares 62 (87 publicadas para estudiar y 13 reservadas para el examen final). Sale en 24 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 28 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v26 -->

**Error típico y trampa.** El rumbo de la corriente al revés (de la observada a la estimada, a 180°) y la intensidad
doble o mitad (no dividir por las horas desde la última situación fiable). Fuentes: «ojo» de la clase py-4-8; trampas
del episodio py 4.5; trampa de `and-py-2024-c2-n17` («No dividir por el tiempo (5,0′) o invertir el sentido (045º)»).
De las 11 discrepancias de la tabla, 10 son notas de formato (la plantilla da el rumbo por su cuadrante), no errores.

**Objetivo.** Hallar el rumbo y la intensidad horaria de una corriente desconocida a partir de la estima y la situación
observada.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Las cuatro opciones típicas: dos rumbos opuestos y dos intensidades, una doble de la otra | La pregunta castiga el sentido y el tiempo | Las parejas |
| 2 | Estima desde la salida con el Rv y la velocidad (y el viento si lo hay), sin corriente: Ra 095°, Ct −2° → Rv 093°, 6 nudos, 2 h | En la estima no se mete la corriente: es lo que buscas | La estima |
| 3 | Situación observada a la misma hora con dos demoras | Estima y observada, a la misma hora | Las dos marcas |
| 4 | Flecha de la estimada a la observada: Rc 067°, 2,9 millas | La corriente va de la estimada a la observada | El sentido de la flecha |
| 5 | 2,9 millas / 2 h = 1,45 ≈ 1,5 nudos | Se divide por las horas desde la última situación fiable | La división |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Corriente desconocida: de la estima a la observada a la misma hora; Ihc = distancia / tiempo
(apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.6, y `currentFromDrift()`). Ejemplo: resuelto
`corriente-desconocida` (observada por Dv 314° de Tarifa y 128° de Cires); 2,9 / 2 = 1,45 nudos (la app lo da como 1,5).

**Material de la app.** Lámina `{ tipo: 'corriente-desconocida' }` y la interactiva de corriente con
`{ caso: 'efectivo', rumbo: 100, rc: 44, ic: 2, vb: 6 }` (clase py-4-8). Resuelto `corriente-desconocida`. Mapa
`corriente-abatimiento` (estima, desconocida). Clase py-4-8. Episodio py 4.5.

**Preguntas para cerrar.**
- `and-py-2024-c2-n17` · Andalucía, 2ª convocatoria 2024 · «A HRB = 16:00 nos encontramos en situación 36º 00,0′ N, 005º 50,0′ W. Navegamos al rumbo verdadero 325º con velocidad del buque 4,3 nudos, en zona de corriente desconocida. A HRB = 18:30 nos encontramos al sur (S) verdadero del faro de Cabo Trafalgar y al oeste (W) verdadero del faro de Punta Camarinal. Calcular el rumbo y la intensidad de la corriente.» Respuesta: **c)** Rc = 225º; Ihc = 2,0′. (Con carta.)
- `and-py-2024-c1-n17` · Andalucía, 1ª convocatoria 2024 · «A HRB = 09:00 nos encontramos en la oposición de los faros de Isla de Tarifa y Punta Cires y al Norte verdadero del faro de Punta Alcázar. Navegamos a 8 nudos al rumbo verdadero = 270º en zona de corriente desconocida. A HRB = 10:31 tomamos demora verdadera al faro de Punta Camarinal = 343º y demora verdadera al faro de Punta Cires = 091º. Calcular el Rumbo y la intensidad de la corriente.» Respuesta: **a)** Rc = 135º; Ihc = 3,0′. (Con carta.)

**Tanda: primera.** Sale en todas las convocatorias de la DGMM y de Baleares; las dos trampas (sentido y tiempo) se
desmontan en un solo dibujo.

### v27 · Viento en la carta: del timón a la carta y vuelta

**Ideas:** `carta.viento`.

**Por qué cuesta.** De signos y de orden: decidir por qué banda entra el viento (depende del rumbo, no del nombre del
viento), sumar o restar el abatimiento según el sentido y aplicar la Ct en el momento justo.

**Cuánto cae.** <!-- cae:v27 -->
**100 preguntas**: Andalucía 39, DGMM 6, Baleares 55 (92 publicadas para estudiar y 8 reservadas para el examen final). Sale en 27 de 34 convocatorias de Andalucía, 6 de 14 convocatorias de la DGMM, 24 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v27 -->

**Error típico y trampa.** Decidir la banda por el nombre del viento, sumar el abatimiento cuando toca restarlo y
olvidar la Ct al final. Fuentes: «ojo» de la clase py-4-2 («del timón a la carta, Ct y luego Ab; de la carta al timón,
Ab y luego Ct»); trampas del episodio py 4.2; trampa de `and-py-2024-c2-n16` («Restar el abatimiento o sumar la Ct con
el signo equivocado»).

**Objetivo.** Pasar del rumbo de aguja al de superficie y del de superficie al de aguja con viento, con la banda y los
signos bien puestos.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Viento del N y dos barcos con rumbos distintos: a uno le entra por babor y al otro por estribor | La banda depende del rumbo: viento − Rv | Las dos bandas |
| 2 | Del timón a la carta: Ra → (+Ct) → Rv → (+Ab) → Rs | Primero la Ct, luego el abatimiento | La cadena |
| 3 | De la carta al timón, con el resuelto: Rs 058° (la línea trazada); viento del N por babor, Ab +8° → Rv 050°; Ct −3° → Ra 053° | Al revés: primero se quita el Ab, luego la Ct | Las restas |
| 4 | Hora: 13,3 millas a 5 nudos → 2 h 40 min (07:30 → 10:10) | La distancia se mide sobre el Rs | El Rs |
| 5 | Pregunta de cierre | | |

**Hechos y fuentes.** El viento se nombra por de dónde viene; Rs = Rv + Ab, Ab + con el viento por babor (abate a
estribor) y − por estribor (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 3.3 y 4.2, y
`rsFromRv()`, `windSide()`). Ejemplo: resuelto `viento` (de 35° 53′ N 005° 42′ W a 36° 00′ N 005° 28′ W). Recalculado:
viento 000° − Rv 050° = −50°, por babor; Rv = 058° − 8° = 050°; Ra = 050° − (−3°) = 053°; 13,3 / 5 = 2,66 h = 2 h 40 min.

**Material de la app.** Lámina interactiva `{ tipo: 'abatimiento', banda: 'estribor' }` (mandos de banda y ángulo).
Resuelto `viento`. Mapa `corriente-abatimiento` (ra, ct, rv, ab, rs). Clase py-4-2. Episodio py 4.2
(`podcast/py/4-2-el-viento-en-la-carta.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-n16` · Andalucía, 2ª convocatoria 2024 · «A HRB = 08:15 nos encontramos en situación 35º 50,0′ N, 005º 10,0′ W y damos rumbo a Algeciras (luz roja del espigón), teniendo en cuenta que sopla viento del este (E) que nos produce un abatimiento de 12º. Calcular el rumbo de aguja sabiendo que la declinación magnética = 2º NW y el desvío de la aguja = –8º (menos).» Respuesta: **d)** 349º. (Con carta.)
- `and-py-2024-c3-n16` · Andalucía, 3ª convocatoria 2024 · «Nos encontramos en situación 36º 00,0′ N, 006º 00,0′ W, navegando al Ra = 138º. Sopla viento del este (E) que nos produce un abatimiento de 12º. Calcular el rumbo que realiza el barco afectado por el viento, sabiendo que la declinación magnética = 3º NW y el desvío de la aguja = –9º (menos).» Respuesta: **b)** 138º. (Aquí el Rs sale igual que el Ra: Ct −12° y Ab +12° se anulan.)

**Tanda: primera.** 100 preguntas, casi todas de Andalucía y Baleares, y la base de v32 y de la mitad de los problemas
de corriente. Eliminatoria.

### v28 · Demoras no simultáneas: traslada la primera

**Ideas:** `carta.situacion.no-simultaneas`.

**Por qué cuesta.** Espacial y de proceso: hay que mover una línea de posición en el tiempo (trasladarla con el rumbo y
la distancia navegados), y el alumno no sabe cuál se traslada, hacia dónde ni por qué rumbo si hay viento.

**Cuánto cae.** <!-- cae:v28 -->
**97 preguntas**: Andalucía 27, DGMM 16, Baleares 54 (83 publicadas para estudiar y 14 reservadas para el examen final). Sale en 27 de 34 convocatorias de Andalucía, 14 de 14 convocatorias de la DGMM, 27 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v28 -->

**Error típico y trampa.** Trasladar la segunda línea, o trasladar hacia atrás; trazar la demora desde el barco; con
viento, trasladar por el Rv. Fuentes: «ojo» de la clase py-4-4 («Las trampas más repetidas»); trampas del episodio
py 4.3; trampa de `and-py-2024-c3-n15` («Trasladar la segunda demora en vez de la primera o hacia el rumbo opuesto»).

**Objetivo.** Situarse con dos demoras tomadas a horas distintas trasladando la primera.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Barco navegando; a las 10:00, demora a Punta Paloma; la línea desde el faro | Una demora sola no sitúa: estás en algún punto de esa línea | La primera línea |
| 2 | Ra 094°, Ct +1° → Rv 095°; 6 nudos × 50 min = 5,0 millas | Lo que has navegado entre las dos demoras | El vector navegado |
| 3 | La primera línea se desplaza entera 5 millas al 095° | Se traslada la primera, en el sentido navegado | La línea trasladada, en magenta |
| 4 | A las 10:50, demora a la Isla de Tarifa; corta a la trasladada | El corte es tu situación a la hora de la segunda | El corte |
| 5 | Cartela: con viento, por el Rs; la demora, desde el faro (Dv + 180°) | Las otras dos trampas | Rs y la opuesta |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Traslado de la primera línea con el rumbo y la distancia navegados; el corte con la segunda es la
situación a la hora de la segunda; la demora se traza desde el objeto con la opuesta (apéndice de
`docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.3 y 4.4, y `fixRunning()`). Ejemplo: resuelto
`no-simultaneas`; 6 × 50/60 = 5,0 millas.

**Material de la app.** Lámina interactiva `{ tipo: 'demoras', modo: 'traslado' }`
(`src/illustrations/interactivas/py-carta.js`). Resuelto `no-simultaneas`. Mapa `lineas-posicion` (del PER: lp, sit,
nosim). Clase py-4-4. Episodio py 4.3 (`podcast/py/4-3-situarse.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-n15` · Andalucía, 3ª convocatoria 2024 · «Navegamos al rumbo verdadero 170º a 6 nudos de velocidad. A HRB = 05:00 tomamos demora verdadera al faro de Cabo Roche = 079º. A HRB = 07:30 tomamos demora verdadera al faro de Cabo Trafalgar = 040º. Calcular la situación a HRB = 07:30.» Respuesta: **d)** 36º 02,0′ N, 006º 11,5′ W. (Con carta.)
- `and-py-2023-c3-n17` · Andalucía, 3ª convocatoria 2023 · «Navegamos en aguas del Estrecho al rumbo verdadero 080º y a 8 nudos de velocidad. Al ser HRB = 11:00 marcamos el faro de Punta Cires en demora verdadera 131º. 45 minutos después, a HRB = 11:45, volvemos a marcar dicho faro en demora verdadera 198º. Calcular la situación a HRB = 11:45.» Respuesta: **b)** 35º 59,2′ N 005º 27,0′ W. (Con carta.)
- `dgmm-py-2024-04-31` · DGMM, abril de 2024 · «Navegando al rumbo verdadero= 262º a una velocidad de máquinas de 7 nudos, observamos a las Hrb= 11:00 el Faro de Punta Europa con una demora verdadera de 035º. Manteniendo rumbo y velocidad observamos el Faro de Isla de Tarifa a las Hrb= 11:40 con una demora verdadera de 315º. Hallar la situación no simultánea más aproximada a las Hrb= 11:40.» Respuesta: **a)** l= 35º57,5´N; L=005º33,4´W. (Con carta.)

**Tanda: primera.** Sale en las 14 convocatorias de la DGMM y en casi todas las de Baleares; mover una línea en el tiempo
es justo lo que una animación enseña y un texto no.

### v29 · Viento primero, corriente después

**Ideas:** `carta.corriente.efectiva`.

**Por qué cuesta.** De orden y de magnitudes: el viento es un ángulo y la corriente un vector; se aplican en ese orden
y la corriente se nombra al revés que el viento (hacia dónde va).

**Cuánto cae.** <!-- cae:v29 -->
**88 preguntas**: Andalucía 34, DGMM 17, Baleares 37 (75 publicadas para estudiar y 13 reservadas para el examen final). Sale en 26 de 34 convocatorias de Andalucía, 11 de 14 convocatorias de la DGMM, 25 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v29 -->

**Error típico y trampa.** Trazar la corriente hacia de donde viene, sumar los grados de la corriente al rumbo, o
aplicarla solo una hora cuando la navegación dura más. Fuentes: «ojo» de la clase py-4-5 («La corriente se traza hacia
donde va su rumbo»; «primero el viento, luego la corriente»); trampas del episodio py 4.4; trampa de `and-py-2024-c3-n17`
(«Abatir hacia el lado equivocado o aplicar la corriente solo 1 h»).

**Objetivo.** Calcular el rumbo y la velocidad efectivos y la situación de estima con viento y corriente.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Una veleta (el viento viene) y una flecha en el agua (la corriente va) | El viento se nombra por de dónde viene; la corriente, por hacia dónde va | Las dos flechas |
| 2 | Del Ra al Rs: Ra 012°, Ct −2° → 010° (sin viento, Rv = Rs) | Primero el viento, que es un ángulo | El Rs |
| 3 | Vector del barco: 6 millas al 010°; en su punta, la corriente: 2 millas al 080° | Luego la corriente, que es un vector | El vector corriente |
| 4 | De la salida a la punta: Ref 026°, Vef 6,9 nudos | El efectivo es el lado que cierra el triángulo | Ref y Vef |
| 5 | Cartela: 2 h 15 min son 2,25 h, no 2,15 | Las horas, en decimal | 2,25 |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** Corriente nombrada por hacia dónde va; efectivo = superficie + corriente (apéndice de
`docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.5, y `effectiveCourse()`). Ejemplo: resuelto
`corriente-efectiva`. Recalculado: N = 6 cos 10° + 2 cos 80° ≈ 6,26; E = 6 sen 10° + 2 sen 80° ≈ 3,01; Ref ≈ 025,7° ≈
026°; Vef ≈ 6,94 nudos. Lo de 2 h 15 min = 2,25 h es aritmética (trampa del episodio py 4.4).

**Material de la app.** Lámina interactiva `{ tipo: 'corriente', caso: 'efectivo' }` (conmutador «adónde voy»).
Resuelto `corriente-efectiva`. Mapa `corriente-abatimiento` (rs, corriente, ref, estima). Clase py-4-5. Episodio py 4.4
(`podcast/py/4-4-estima-con-viento-y-corriente.md`).

**Preguntas para cerrar.**
- `and-py-2024-c3-n17` · Andalucía, 3ª convocatoria 2024 · «A HRB = 15:00 nos encontramos a 5 millas al Norte verdadero del faro de Punta Alcázar. Navegamos a 8 nudos al rumbo verdadero 080º, con viento del sur (S) que nos abate 10º y nos afecta una corriente de Rumbo corriente = SE e Intensidad Horaria = 3 millas. Calcular situación de estima a las 16:40.» Respuesta: **a)** 35º 57,0′ N, 005º 13,8′ W. (Con carta.)
- `dgmm-py-2024-04-38` · DGMM, abril de 2024 · «Situados el 1 de abril de 2024 a Hrb= 08:15 en posición l= 35° 51,0´N; L= 006°14,0´W, nos encontramos en zona de corriente de Rc=NNE e Ih=2,6 nudos navegando al Ra=099°. El desvío es 1,6°(+), la declinación magnética será la del año en curso y nuestra velocidad de máquinas es de 4 nudos. Determinar el rumbo y velocidad efectivos más aproximados de entre los siguientes a Hrb= 10:45, suponiendo que las condiciones de navegación se mantienen estables desde Hrb= 08:15.» Respuesta: **d)** Ref= 071°; Vef= 5,2 nudos. (Con carta.)

**Tanda: primera.** Es el problema directo del triángulo (v25 es el inverso): conviene hacerlo antes que v25. 88
preguntas y eliminatoria.

### v30 · Mareas: la curva en tres pasos

**Ideas:** `mareas.sonda-instante`, `mareas.hora-sonda`, `mareas.sonda-pleamar-bajamar`, `mareas.anuario`.

**Por qué cuesta.** De proceso: muchos pasos encadenados (hora oficial a TU, elegir el tramo, contar el intervalo hasta
la bajamar, la fórmula o la tabla, sumar la bajamar y la sonda de la carta, volver a hora oficial) y una función (seno
al cuadrado) que el alumno usa sin verla.

**Cuánto cae.** <!-- cae:v30 -->
**140 preguntas**: Andalucía 61, DGMM 13, Baleares 66 (122 publicadas para estudiar y 18 reservadas para el examen final). Sale en 31 de 34 convocatorias de Andalucía, 13 de 14 convocatorias de la DGMM, 28 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v30 -->

**Error típico y trampa.** No pasar a TU antes de entrar en el Anuario, contar el intervalo desde la pleamar, olvidar
sumar la bajamar y la sonda de la carta, y la calculadora en radianes. Fuentes: «ojo» de la clase py-4-9 («Los fallos
que cuestan esta pregunta»); trampas del episodio py 4.6; trampa de `dgmm-py-2023-11-40` («La a) da solo la altura de la
marea, sin sumarle la sonda de la carta»).

**Objetivo.** Calcular la sonda en un instante y la hora a la que habrá una sonda, con la curva de la tabla oficial.

**Guion gráfico** (≈ 4 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Corte del fondo: sonda de la carta (bajo el cero hidrográfico) + altura de la marea = sonda del momento | Lo que buscas es agua sobre el fondo | La suma |
| 2 | Reloj con la hora oficial que se pasa a TU (restar el adelanto) | El Anuario va en TU | El adelanto |
| 3 | Curva de la marea entre bajamar y pleamar; amplitud A y duración D; el intervalo I contado desde la bajamar | I siempre hasta o desde la bajamar | I desde la bajamar |
| 4 | C = A · sen²(90° · I / D); con A 2,40 m, D 6 h, I 2 h → 30°, sen² = 0,25, C 0,60 m; + bajamar 0,50 → 1,10 m; + sonda de la carta 1,20 → 2,30 m | La tabla del examen es esta curva | Los tres sumandos |
| 5 | Problema inverso: de la sonda pedida a C, de C a I, de I a la hora (BM ± I) y a hora oficial | El mismo camino al revés | BM + I o BM − I |
| 6 | Cartela: la regla de los doceavos es una aproximación; la oficial es la curva | En el examen, la tabla | «Aproximación» |
| 7 | Pregunta de cierre | | |

**Hechos y fuentes.** Horas del Anuario en TU y alturas sobre el cero hidrográfico (IHM, contenido del Anuario de
Mareas); C = A · sen²(90° · I / D) e inverso I = D · arcsen √(C/A) / 90°; ejemplo A 2,40 m, D 6 h, I 2 h → C 0,60 m, h
1,10 m, sonda 2,30 m; ≈ 1 cm por hPa respecto a 1013 hPa (verificación de py-3-6 y py-4-9). Los doceavos como
aproximación (nota del concepto `mareas.sonda-instante`). Comprobado con `dgmm-py-2024-04-34`: I = 2 h hasta la
bajamar, D = 6 h 06 min, A = 1,50 m → C ≈ 0,36 m, sonda ≈ 12,61 m, la oficial.

**Material de la app.** Lámina interactiva y animada `{ tipo: 'marea', modo: 'curva' }`, `modo: 'duodecimos'` y
`modo: 'sonda'` (`src/illustrations/interactivas/marea.js`: la creciente animada, el agua que sube en el corte y en la
curva). Mapa `mareas-py` (anuario, amplitud, duracion, intervalo, sonda-carta, sonda-momento, inverso). Clases py-3-6 y
py-4-9. Episodio py 4.6 (`podcast/py/4-6-mareas.md`).

**Preguntas para cerrar.**
- `dgmm-py-2024-04-34` · DGMM, abril de 2024 · «Navegando en un punto de sonda en la carta de 12 metros, ¿cuál de las siguientes respuestas más se aproxima a la sonda en el momento a las 10:40? Se cuenta con la siguiente información: Hora de la pleamar= 06:34 y altura de la pleamar= 1,75m. Hora de la bajamar= 12:40 y altura de la bajamar= 0,25m.» Respuesta: **d)** 12,61 metros.
- `dgmm-py-2023-11-40` · DGMM, noviembre de 2023 · «Encontrándonos en un punto de sonda en la carta de 6 metros, obtenemos del anuario de mareas la siguiente lectura: Hora de la pleamar=12:10, altura de la pleamar=3,3 metros. Hora de la bajamar= 18:20, altura de la bajamar=0,40 metros. ¿Cuál de las siguientes respuestas más se aproxima a la sonda en el momento a las 12:30?» Respuesta: **c)** 9,28 metros.
- `and-py-2024-c3-n18` · Andalucía, 3ª convocatoria 2024 · «Calcular la hora oficial entre la segunda pleamar y segunda bajamar del 05 de noviembre de 2024, a la que tendremos una sonda de 3,48 metros en un bajo marcado en la carta con una sonda de 1,92 metros. Adelanto vigente: +1 hora.» Respuesta: **d)** 20:57. (Con el extracto del Anuario que acompaña a la pregunta en la app.)

**Tanda: primera.** La idea con más preguntas del PY (dos de cada examen de carta en Andalucía), en todas las
convocatorias de Baleares. Un vídeo con la curva animada ordena un proceso largo.

### v31 · Estima analítica: Δl, apartamiento y cuadrante

**Ideas:** `carta.loxodromica.directa`, `carta.loxodromica.inversa`, `nav.loxodromica.conceptos`.

**Por qué cuesta.** De cálculo y de signos: fórmulas con seno y coseno, la latitud media, el apartamiento (millas) frente
a la diferencia de longitud (minutos), y colocar el ángulo de la arcotangente en su cuadrante. Más el antimeridiano y
el hemisferio sur.

**Cuánto cae.** <!-- cae:v31 -->
**101 preguntas**: Andalucía 38, DGMM 18, Baleares 45 (84 publicadas para estudiar y 17 reservadas para el examen final). Sale en 33 de 34 convocatorias de Andalucía, 11 de 14 convocatorias de la DGMM, 28 de 28 convocatorias de Baleares. Tema: Carta 99, Teoría de navegación 2 (el grueso, módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v31 -->

**Error típico y trampa.** Tomar el ángulo de la arcotangente como rumbo sin colocarlo en su cuadrante, dividir por el
coseno de la latitud de salida, o restar longitudes de distinto nombre. Fuentes: «ojo» de las clases py-4-10 y py-3-4;
trampas del episodio py 4.7; trampa de `dgmm-py-2024-04-39` («058° es N58E: te equivocas de cuadrante al ir hacia el
W»).

**Objetivo.** Hacer la estima directa (de rumbos y distancias a situación) y la inversa (de dos situaciones a rumbo y
distancia), con el cuadrante bien puesto.

**Guion gráfico** (≈ 4 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Triángulo de estima: distancia D, Δl hacia el N o el S, apartamiento A hacia el E o el W | Δl = D · cos R; A = D · sen R | El triángulo |
| 2 | Dos tramos sumados: 12 M al 160° y 10 M al 100° → Δl −13,01′, A +13,95 M | Con varios rumbos se suman con signo | Los signos |
| 3 | Globo: los meridianos se juntan hacia el polo; el apartamiento se convierte en ΔL con la latitud media | ΔL = A / cos lm; lm = 35° 59,5′ → ΔL 17,2′ E | La latitud media |
| 4 | Llegada: 35° 53,0′ N 005° 56,8′ W | La directa | La situación |
| 5 | Inversa: tg R = A / Δl → 47°, con Δl al S y A al E → S47E = 133°; D = √(Δl² + A²) = 19,1 M | El ángulo de la calculadora se coloca en su cuadrante | S47E → 133° |
| 6 | Cartela: calculadora en grados; ΔL nunca menor que A; al cruzar el 180°, el camino corto | Las tres comprobaciones | DEG |

**Hechos y fuentes.** Δl = D · cos R; A = D · sen R; lm = l0 + Δl/2; ΔL = A / cos lm; tg R = A / Δl (en cuadrante);
D = √(Δl² + A²) (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.8, y `deadReckoning()`).
Ejemplo: resuelto `estima-analitica` (desde 36° 06′ N 006° 14′ W). Recalculado: 12 · cos 160° + 10 · cos 100° = −13,01;
12 · sen 160° + 10 · sen 100° = 13,95; 13,95 / cos 35,99° ≈ 17,2′; arctg(13,95 / 13,01) ≈ 47,0° → 133°; √(13,01² +
13,95²) ≈ 19,1 M. Apartamiento = distancia sobre el paralelo (verificación de py-3-4).

**Material de la app.** Lámina interactiva `{ tipo: 'loxodromica', modo: 'triangulo' }`
(`src/illustrations/interactivas/py-carta.js`) y `{ tipo: 'loxo-orto' }`. Resuelto `estima-analitica`. Clases py-3-4 y
py-4-10. Episodio py 4.7 (`podcast/py/4-7-estima-analitica.md`).

**Preguntas para cerrar.**
- `and-py-2024-c2-n20` · Andalucía, 2ª convocatoria 2024 · «El 10 de julio de 2024, nos encontramos en situación 37° 30,0′ N, 002° 05,0′ E y damos rumbo a un punto situado en 35º 39,0´ N y 002º 40,0´W. Calcular el rumbo verdadero que debemos hacer para llegar a dicho punto (redondear al grado más próximo).» Respuesta: **b)** 244º.
- `dgmm-py-2024-04-39` · DGMM, abril de 2024 · «¿Cuál de las siguientes respuestas más se aproxima al rumbo y distancia (loxodrómica) entre los siguientes puntos de salida (l= 35º55´N; L= 006º10´W) y llegada (l= 36º25´N; L= 007º10´W)?» Respuesta: **d)** Rumbo 302º / Distancia 56,6 millas.

**Tanda: segunda.** Muy frecuente (sale en 33 de 34 convocatorias de Andalucía y en todas las de Baleares) y
eliminatoria, pero es cálculo de calculadora: el vídeo ayuda sobre todo con el cuadrante y la latitud media, y la
interactiva del triángulo ya existe.

### v32 · Pasar a X millas de un faro: la tangente

**Ideas:** `carta.pasar-distancia`.

**Por qué cuesta.** Espacial y de orden: trazar la tangente a un círculo, elegir la buena según la banda, y saber que la
tangente es el Rs (con viento) o el Ref (con corriente), no el Rv.

**Cuánto cae.** <!-- cae:v32 -->
**67 preguntas**: Andalucía 19, DGMM 9, Baleares 39 (60 publicadas para estudiar y 7 reservadas para el examen final). Sale en 18 de 34 convocatorias de Andalucía, 8 de 14 convocatorias de la DGMM, 23 de 28 convocatorias de Baleares. Tema: Carta (módulo de navegación; el tema admite como mucho 3 fallos).
<!-- /cae:v32 -->

**Error típico y trampa.** Aplicar la Ct directamente a la tangente sin quitar antes el abatimiento (sale una opción a ±
Ab del resultado), o sumar el abatimiento cuando hay que restarlo. Fuentes: «ojo» de la clase py-4-3 («La tangente es
el Rs, no el Rv»); trampas del episodio py 4.2; trampa de `and-py-2024-c1-n14` («Sumar el abatimiento en vez de
restarlo»).

**Objetivo.** Hallar el rumbo de aguja para pasar a una distancia dada de un faro, con y sin viento.

**Guion gráfico** (≈ 3 min)

| # | Qué se ve | Qué se dice | Se resalta |
|---|---|---|---|
| 1 | Faro con un círculo de 3 millas; el barco a 12,4 millas, Dv 027° | Pasar a 3 millas es rozar ese círculo | El círculo |
| 2 | Las dos tangentes; se elige la que deja el faro por estribor | Dos tangentes: la banda decide | La tangente buena |
| 3 | Triángulo rectángulo: sen α = 3 / 12,4 → α = 14,0°; faro por estribor → Rv = Dv − α = 013° | El ángulo sale de la trigonometría | α |
| 4 | Ct +2° → Ra 011°; el través: Dv = Rv + 90° = 103° | Al final, la Ct | El través |
| 5 | Con viento: la tangente es el Rs; Rv = Rs − Ab y luego Ra = Rv − Ct | El orden con viento | Rs, no Rv |
| 6 | Pregunta de cierre | | |

**Hechos y fuentes.** sen α = d / D; faro por estribor Rv = Dv − α, por babor Rv = Dv + α; el punto más próximo es el
través (apéndice de `docs/CARTA-RESUELTOS.md`: RD 875/2014, anexo II, PY UT 4.2, y `closestApproach()`). Con viento la
tangente es el Rs (verificación de py-4-3). Ejemplo: resuelto `pasar-distancia` (desde 36° 00′ N 006° 09′ W, Cabo
Trafalgar). Recalculado: arcsen(3 / 12,4) ≈ 14,0°; 027° − 14° = 013°; 013° − 2° = 011°; 013° + 90° = 103°.

**Material de la app.** Láminas `{ tipo: 'abatimiento', banda: 'estribor', rv: 121, ab: 10 }` y `{ tipo: 'tangente-viento' }`
(clase py-4-3). Resuelto `pasar-distancia`. Mapa `corriente-abatimiento` (tangente). Clase py-4-3. Episodio py 4.2.

**Preguntas para cerrar.**
- `and-py-2024-c1-n14` · Andalucía, 1ª convocatoria 2024 · «El 04 de abril de 2024 salimos de Tánger (luz de la bocana del puerto). Sopla viento del SW (sudoeste) que nos produce un abatimiento de 20º. Calcular el rumbo de aguja para pasar a cuatro millas del faro de Cabo Espartel. Declinación magnética = 6º W, desvío de la aguja = +10º (más).» Respuesta: **c)** 285º. (Con carta.)
- `and-py-2024-c2-n12` · Andalucía, 2ª convocatoria 2024 · «El 10 de julio de 2024 salimos de Barbate (luz de la bocana del puerto). Sopla viento del este (E) que nos produce un abatimiento de 15º. Calcular el rumbo de aguja para pasar a cinco millas del faro de Punta Paloma. La declinación magnética de la carta es 4º W 2012 (5′ E) y el desvío de la aguja = +9º (más).» Respuesta: **a)** 128º. (Con carta.)

**Tanda: segunda.** Pesa mucho en Baleares (23 de 28) y menos en Andalucía (18 de 34); depende de v27 (viento) y es
casi la misma escena. Eliminatoria.
