# Andalucía 2015–2019 · extracción y entrada en el banco vivo

Generado por `node tools/bancos/ejes/andalucia/antiguas.mjs` el 2026-10-07, tras `npm run bancos -- andalucia --todas`. Las 16 convocatorias de 2015–2019 (research_notes/…/andalucia_anteriores.md) se extraen de sus PDF oficiales (cuestionario de texto + hoja de lectura óptica escaneada) con el adaptador `hoja-optica`, a `.cache/bancos/andalucia/salida/<tit>/preguntas.json` junto con las de 2020–2026. Desde la fase F5 la etapa escribir las añade a `data/ejes/andalucia/<tit>/preguntas.json` sin tocar las publicadas (`config.publicadas = "conservar"`; ver «Entrada en el banco vivo»).

Ids con el esquema de Andalucía: `and-AAAA-cN-tNN` (teoría PER), `and-AAAA-cN-qNN` (carta PER), `and-py-AAAA-cN-gNN|nNN` (PY). Casos especiales:

- **1ª de 2018**: su página está en otra ruta (`…/investigacion-innovacion-deportiva/…`). El PY tuvo modelos A y B de cada módulo con **preguntas distintas** (no son permutaciones): el A es `and-py-2018-c1-…` y el B, una convocatoria aparte del banco, `and-py-2018-c1b-gNN|nNN` («1ª convocatoria 2018, PY modelo B» en config.json).
- **3ª de 2018**: solo PNB y PER (Cádiz y Sevilla); no hubo PY (`titulaciones: ["per"]` en config.json).
- **2015**: los cuadernillos no traen fecha y no se ha encontrado en fuente oficial: las preguntas van sin fecha (la etapa normativa las marca «revisar» con toda norma cuyo detector encaja; la etapa validar da un aviso «sin fecha» por pregunta). Las fechas del PY de 2018 (14-3, 12-6 y 23-11) son las de sus portadas, distintas de las del PER.
- Correcciones publicadas (ejes/andalucia/correcciones.json): todas las erratas y anulaciones de las páginas de 2015–2016 que recoge andalucia_anteriores.md (salvo las del PER reducido, que no se extrae) y la nota del Tribunal de 21-01-2019 de la 4ª de 2018 (leída por OCR del PDF escaneado: anula la 39 de A y B; da por buenas a+b en A11/B12 y c+d en A13/B14). En 2017, en la 1ª–3ª de 2018 y en 2019 las páginas no publican correcciones de PER ni de PY. La otra nota de la 4ª de 2018 («alegaciones contestadas») no se pudo descargar (el servidor no da Content-Length ni con peticiones por rangos).

## Resumen

| | PER | PY |
|---|---|---|
| Convocatorias | 16 | 16 |
| Preguntas | 720 | 640 |
| Anuladas / con varias válidas | 3 / 2 | 1 / 0 |
| Filas de hoja leídas | 1440 | 640 |
| Modelos A y B con la misma respuesta | **720/720** (100,0 %) | — (un solo modelo) |
| Repetidas en otra convocatoria con la misma respuesta | 44/45 pares (50 preguntas) | 42/45 pares (45 preguntas) |
| Lecturas dudosas (2.ª/1.ª ≥ 0,35) | 0 | 0 |
| Marcas por debajo de 1,5 × umbral | 0 | 0 |
| Conflictos / dudas / errores de validación | 0 / 0 / 0 | 0 / 0 / 0 |

**Confianza de la lectura óptica: alta.** En el PER cada pregunta se lee dos veces, en hojas escaneadas por separado (modelos A y B, con la letra traducida por el texto de la opción), y las 720 coinciden. En el PY (una sola hoja) no hay segunda lectura, pero ninguna fila es dudosa, la marca más débil queda a 1,51 veces el umbral de su hoja y las 45 repeticiones en otras convocatorias (leídas en otras hojas, o tomadas del banco vivo de 2020–2026) dan la misma respuesta salvo variantes con el enunciado invertido a propósito. Cada fila «vacía» es una pregunta anulada y cada «múltiple», una con dos respuestas aceptadas por el Tribunal.

## PER

- **720 preguntas** de 16 convocatorias (and-2015-c1-t01 … and-2019-c3-q45); 3 anuladas, 2 con varias respuestas aceptadas.
- Lectura óptica: 1440 filas leídas: 1432 ok, 4 vacia, 4 multiple. Modelos A y B: **720/720** preguntas con la misma respuesta en las dos hojas (100,0 %); son dos escaneos distintos y en 653 el B pone la pregunta en otro número (las opciones van en el mismo orden), así que el acuerdo no es la misma fila leída dos veces.
- Conflictos entre apariciones: 0; lecturas dudosas o sin respuesta: 0; errores de validación: 0; avisos de validación: 135 (todos «sin fecha», de 2015).

| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |
|---|---|---|---|---|---|---|---|---|
| and-2015-c1 | — | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 6 |
| and-2015-c2 | — | 45 | 90 | 1 | 0 | 88 ok, 2 vacia | 45/45 | 0 |
| and-2015-c3 | — | 45 | 90 | 1 | 0 | 90 ok | 45/45 | 0 |
| and-2016-c1 | 2016-04-09 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2016-c2 | 2016-06-18 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 1 |
| and-2016-c3 | 2016-11-19 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2017-c1 | 2017-04-01 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2017-c2 | 2017-06-17 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 1 |
| and-2017-c3 | 2017-11-11 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2018-c1 | 2018-03-10 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2018-c2 | 2018-05-26 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 1 |
| and-2018-c3 | 2018-09-29 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2018-c4 | 2018-12-01 | 45 | 90 | 1 | 2 | 84 ok, 4 multiple, 2 vacia | 45/45 | 0 |
| and-2019-c1 | 2019-04-06 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2019-c2 | 2019-06-15 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |
| and-2019-c3 | 2019-11-23 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 0 |

### Confianza de la lectura óptica

- Relación 2.ª burbuja / 1.ª en las 1432 filas con una marca (0 = marca limpia; «dudosa» desde 0,35): < 0,10: 1429; 0,10–0,20: 3; 0,20–0,35: 0; ≥ 0,35 (dudosa): 0. Las de menos margen: and-2015-c3/A/2 0,12; and-2015-c1/A/35 0,12; and-2019-c2/B/10 0,10; and-2015-c1/A/40 0,09; and-2017-c3/B/36 0,09; and-2016-c3/A/30 0,09.
- Fuerza de la marca (1.ª burbuja / umbral de marca de su hoja; por debajo de 1 sería «vacía»): < 1,5: 0; 1,5–2: 51; 2–3: 1332; ≥ 3: 49; mediana 2,60. Las más débiles: and-2015-c1/A/3 1,57; and-2018-c4/B/44 1,59; and-2015-c2/B/4 1,60; and-2015-c2/B/18 1,62; and-2015-c3/B/40 1,64; and-2019-c3/B/34 1,73.
- Filas vacías: and-2015-c2/A/30 (máx. 0,00 × umbral; and-2015-c2-t30 anulada); and-2015-c2/B/32 (máx. -0,06 × umbral; and-2015-c2-t30 anulada); and-2018-c4/A/39 (máx. 0,02 × umbral; and-2018-c4-t39 anulada); and-2018-c4/B/39 (máx. 0,02 × umbral; and-2018-c4-t39 anulada).
- Filas con dos marcas: and-2018-c4/A/11 «ab» (and-2018-c4-t11: aceptadas a+b); and-2018-c4/B/12 «ab» (and-2018-c4-t11: aceptadas a+b); and-2018-c4/A/13 «cd» (and-2018-c4-t13: aceptadas c+d); and-2018-c4/B/14 «cd» (and-2018-c4-t13: aceptadas c+d).

### Correcciones publicadas frente a la hoja

| Convocatoria | Modelo | Nº | Corrección | Pregunta | Hoja escaneada | Resultado en el banco |
|---|---|---|---|---|---|---|
| and-2015-c1 | A | 32 | respuesta b | and-2015-c1-t32 | la hoja ya trae la respuesta corregida | b |
| and-2015-c1 | B | 30 | respuesta b | and-2015-c1-t32 | la hoja ya trae la respuesta corregida | b |
| and-2015-c2 | A | 3 | respuesta a | and-2015-c2-t03 | la hoja ya trae la respuesta corregida | a |
| and-2015-c2 | A | 30 | anular | and-2015-c2-t30 | la hoja ya la deja en blanco | anulada |
| and-2015-c2 | B | 2 | respuesta a | and-2015-c2-t03 | la hoja ya trae la respuesta corregida | a |
| and-2015-c2 | B | 32 | anular | and-2015-c2-t30 | la hoja ya la deja en blanco | anulada |
| and-2015-c3 | A | 10 | anular | and-2015-c3-t10 | la hoja marca «b»: la anulación solo está en la página | anulada |
| and-2015-c3 | B | 7 | anular | and-2015-c3-t10 | la hoja marca «b»: la anulación solo está en la página | anulada |
| and-2016-c3 | A | 13 | respuesta c | and-2016-c3-t13 | la hoja ya trae la respuesta corregida | c |
| and-2016-c3 | B | 15 | respuesta c | and-2016-c3-t13 | la hoja ya trae la respuesta corregida | c |
| and-2018-c4 | A | 39 | anular | and-2018-c4-t39 | la hoja ya la deja en blanco | anulada |
| and-2018-c4 | B | 39 | anular | and-2018-c4-t39 | la hoja ya la deja en blanco | anulada |
| and-2018-c4 | A | 11 | aceptar a+b | and-2018-c4-t11 | la hoja ya marca las dos | a+b |
| and-2018-c4 | B | 12 | aceptar a+b | and-2018-c4-t11 | la hoja ya marca las dos | a+b |
| and-2018-c4 | A | 13 | aceptar c+d | and-2018-c4-t13 | la hoja ya marca las dos | c+d |
| and-2018-c4 | B | 14 | aceptar c+d | and-2018-c4-t13 | la hoja ya marca las dos | c+d |

### Cruce con las repeticiones en otras convocatorias

Preguntas de 2015–2019 que reaparecen en otra convocatoria de 2015–2026 (mismas opciones y enunciado con Jaccard ≥ 0,90): 50. Idénticas: 37/37 pares con la misma respuesta (por el texto de la opción). Variantes (alguna palabra distinta): 7/8.

| Par | Tipo | Respuestas | Diferencia en el enunciado | Revisión |
|---|---|---|---|---|
| and-2017-c3-t34 / and-2018-c1-t34 | variante | c / b | «mar hacia tierra» / «tierra a mar» | coherente: brisa «de la mar hacia tierra» = virazón; «de la tierra a mar» = terral |

### Emparejamiento de los modelos A y B

- Emparejadas por posición (texto casi igual, sim. 0,95): and-2017-c3/A/20 ↔ and-2017-c3/B/22. Mismo enunciado; una opción cambia alguna palabra (errata de uno de los modelos).
- No unidas (ambiguas, sim. 0,93): and-2015-c3/A/31 / and-2015-c3/A/32 — «liquidas» / «gaseosos»: son dos preguntas distintas.
- No unidas (ambiguas, sim. 0,93): and-2015-c3/A/31 / and-2015-c3/B/30 — «liquidas» / «gaseosos»: son dos preguntas distintas.
- No unidas (ambiguas, sim. 0,93): and-2015-c3/A/32 / and-2015-c3/B/31 — «gaseosos» / «liquidas»: son dos preguntas distintas.
- No unidas (ambiguas, sim. 0,93): and-2015-c3/B/30 / and-2015-c3/B/31 — «gaseosos» / «liquidas»: son dos preguntas distintas.

### Tema dudoso (clasificar)

El tema sale de la posición en el cuadernillo; estas suman palabras clave de otro tema. Revisadas en la fase F5: se quedan en el tema de su bloque, porque es donde el tribunal las puso y el examen real se corrige por bloques (mínimos de RIPA, balizamiento y carta). and-2016-c2-t31 (UT 8 → 3); and-2018-c2-t09 (UT 3 → 8); and-2018-c3-t31 (UT 8 → 7); and-2018-c4-t09 (UT 3 → 1); and-2019-c2-t09 (UT 3 → 10); and-2019-c3-t12 (UT 4 → 8); and-2019-c3-t32 (UT 8 → 10).

### Anuladas y con varias respuestas

- and-2015-c2-t30: anulada — PER A: la nº 30 queda anulada. PER B: la nº 32 queda anulada.
- and-2015-c3-t10: anulada — El Tribunal, reunido el 9-12-2015, anula la nº 10 del PER examen A. El Tribunal, reunido el 9-12-2015, anula la nº 7 del PER examen B.
- and-2018-c4-t39: anulada — Nota informativa del presidente del Tribunal (Puerto Real, 21-01-2019), 4ª convocatoria 2018: se anula la pregunta 39 del PER modelo A. Nota informativa del pre
- and-2018-c4-t11: aceptadas a y b
- and-2018-c4-t13: aceptadas c y d

## PY

- **640 preguntas** de 16 convocatorias (and-py-2015-c1-g01 … and-py-2019-c3-n20); 1 anuladas, 0 con varias respuestas aceptadas.
- Lectura óptica: 640 filas leídas: 639 ok, 1 vacia. Un solo modelo por convocatoria: no hay segunda hoja con la que cruzar.
- Conflictos entre apariciones: 0; lecturas dudosas o sin respuesta: 0; errores de validación: 0; avisos de validación: 120 (todos «sin fecha», de 2015).

| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |
|---|---|---|---|---|---|---|---|---|
| and-py-2015-c1 | — | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2015-c2 | — | 40 | 40 | 0 | 0 | 40 ok | — | 1 |
| and-py-2015-c3 | — | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2016-c1 | 2016-04-09 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2016-c2 | 2016-06-18 | 40 | 40 | 1 | 0 | 39 ok, 1 vacia | — | 0 |
| and-py-2016-c3 | 2016-11-19 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2017-c1 | 2017-04-01 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2017-c2 | 2017-06-17 | 40 | 40 | 0 | 0 | 40 ok | — | 1 |
| and-py-2017-c3 | 2017-11-11 | 40 | 40 | 0 | 0 | 40 ok | — | 1 |
| and-py-2018-c1 | 2018-03-14 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2018-c1b | 2018-03-14 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2018-c2 | 2018-06-12 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2018-c4 | 2018-11-23 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2019-c1 | 2019-04-06 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2019-c2 | 2019-06-15 | 40 | 40 | 0 | 0 | 40 ok | — | 0 |
| and-py-2019-c3 | 2019-11-23 | 40 | 40 | 0 | 0 | 40 ok | — | 1 |

### Confianza de la lectura óptica

- Relación 2.ª burbuja / 1.ª en las 639 filas con una marca (0 = marca limpia; «dudosa» desde 0,35): < 0,10: 638; 0,10–0,20: 1; 0,20–0,35: 0; ≥ 0,35 (dudosa): 0. Las de menos margen: and-py-2015-c1/generico/9 0,17; and-py-2017-c3/generico/5 0,07; and-py-2019-c1/navegacion/20 0,06; and-py-2019-c2/generico/17 0,05; and-py-2015-c2/navegacion/5 0,05; and-py-2015-c1/navegacion/4 0,05.
- Fuerza de la marca (1.ª burbuja / umbral de marca de su hoja; por debajo de 1 sería «vacía»): < 1,5: 0; 1,5–2: 19; 2–3: 607; ≥ 3: 13; mediana 2,64. Las más débiles: and-py-2015-c1/generico/8 1,51; and-py-2015-c1/generico/13 1,57; and-py-2015-c3/navegacion/20 1,72; and-py-2015-c3/navegacion/19 1,78; and-py-2015-c3/generico/6 1,85; and-py-2015-c1/generico/3 1,88.
- Filas vacías: and-py-2016-c2/generico/18 (máx. -0,04 × umbral; and-py-2016-c2-g18 anulada).

### Correcciones publicadas frente a la hoja

| Convocatoria | Modelo | Nº | Corrección | Pregunta | Hoja escaneada | Resultado en el banco |
|---|---|---|---|---|---|---|
| and-py-2016-c1 | navegacion | 18 | respuesta a | and-py-2016-c1-n18 | la hoja ya trae la respuesta corregida | a |
| and-py-2016-c2 | generico | 18 | anular | and-py-2016-c2-g18 | la hoja ya la deja en blanco | anulada |

### Cruce con las repeticiones en otras convocatorias

Preguntas de 2015–2019 que reaparecen en otra convocatoria de 2015–2026 (mismas opciones y enunciado con Jaccard ≥ 0,90): 45. Idénticas: 41/41 pares con la misma respuesta (por el texto de la opción). Variantes (alguna palabra distinta): 1/4.

| Par | Tipo | Respuestas | Diferencia en el enunciado | Revisión |
|---|---|---|---|---|
| and-py-2017-c2-g17 / and-py-2023-c2-g12 | variante | b / a | «vanguardia es mas frio que el de retaguardia» / «retaguardia es mas frio que el de vanguardia» | coherente: polar de vanguardia más frío → oclusión cálida; de retaguardia más frío → oclusión fría |
| and-py-2019-c1-g15 / and-py-2023-c2-g12 | variante | b / a | «vanguardia es mas frio que el de retaguardia» / «retaguardia es mas frio que el de vanguardia» | coherente: polar de vanguardia más frío → oclusión cálida; de retaguardia más frío → oclusión fría |
| and-py-2019-c3-g14 / and-py-2024-c2-g13 | variante | c / a | «menos» / «mas» | coherente: vanguardia «menos frío» que la retaguardia → oclusión fría; «más frío» → oclusión cálida |

### Tema dudoso (clasificar)

El tema sale de la posición en el cuadernillo; estas suman palabras clave de otro tema. Revisadas en la fase F5: se quedan en el tema de su bloque, porque es donde el tribunal las puso y el examen real se corrige por bloques (mínimos de RIPA, balizamiento y carta). and-py-2015-c1-n03 (UT 3 → 4); and-py-2015-c1-n10 (UT 3 → 4).

### Anuladas y con varias respuestas

- and-py-2016-c2-g18: anulada — PY módulo genérico, pregunta 18 anulada.

## Arreglos del proceso necesarios para 2015–2019

- **Texto en columnas (2015)**: pdftotext en modo normal separa las letras «a) b) c) d)» de sus textos. El adaptador lee en modo normal y, si no salen las n preguntas con sus cuatro opciones, prueba `-raw` y `-layout` y se queda la mejor lectura (2015: `-raw` en 11 de los 12 cuadernillos).
- **Cabecera de página de 2015** (códigos de certificación «ER-…/2011», «CÓDIGO nnnnnnnn» y el nombre del centro que maquetó los cuadernillos, con las letras separadas en `-raw`): ruido.
- **Escaneos girados**: un giro del 1,5 % desplaza medio paso de fila el bloque 1–25 respecto de las marcas de sincronismo (antes del arreglo: PER 1/2017 con 12 respuestas distintas entre las hojas A y B y 17 lecturas dudosas; PER 3/2015 con 26 y 22). `hoja_optica.py` mide el giro en las marcas, predice el desfase de cada bloque y lo afina con la plantilla impresa; también corrige la deriva horizontal de las columnas.
- **Hoja de 2015–2016 (otro impresor, casillas rectangulares) y lápiz claro**: el lápiz se busca como gris (oscuro y sin color), sin confundirlo con los números impresos en magenta oscuro, y el paso de burbuja se busca entre el 92 % y el 102 % del nominal (PY 2/2015: el peine se corría sobre los números y salían 10 filas en blanco).
- **Umbral de cada hoja en la salida**: el adaptador guarda en cada lectura el umbral de marca de su hoja (`respuesta.umbral`) para medir la fuerza de cada marca en este informe.
- **Fase F5** (al revisar la salida para el banco vivo): en `-raw` el guion de una palabra partida por sílabas se quita si sus dos trozos no salen sueltos en el cuadernillo («obsta-culiza», 3/2015); el «0» volado que en 2017–2018 hace de símbolo de grado («237⁰», «-5⁰ (menos)», «marcación 090⁰») lo localiza `py/grado_cero.py` y se repone como «º» (26 preguntas); el encabezado «MAREAS.» con punto y la tabla del anuario metida en un enunciado (2/2016) pasan al contexto de sus preguntas, y `tablaMareas` lee el formato «Hora Alt. 05:40 3,24»; «calcular la sonda» es de mareas y «rumbo directo… desea navegar hasta» de loxodrómica; las 5 figuras dibujadas en la página (dos banderas «A», hélice, timón y una depresión) las recorta `ejes/andalucia/figuras.mjs`.
- Tras los arreglos, la prueba de oro de 2020–2026 sigue en el 100 % (informes/andalucia-oro.md).

## Entrada en el banco vivo (fase F5)

- PER: 689 preguntas nuevas y 31 que repiten una ya publicada (mismo enunciado, opciones y respuesta), que no se duplican: su aparición va al `apareceEn` de aquella (20 de la 1ª de 2015 son de la 1ª de 2021). PY: 609 nuevas y 31 unidas. Las 5 idénticas a preguntas reservadas para el examen final (2025) no se unen, porque las sacarían de la reserva: and-2015-c1-t29, and-2016-c2-t28, and-2016-c3-t38, and-2017-c1-t37 y and-2017-c3-t39.
- Revisión normativa (`revision-normativa.mjs`, bloque F5; motivo y fuente en `ajustes.json`): de las 279 nuevas marcadas (y 1 publicada con una aparición más antigua), 4 retiradas (notificación reducida de desechos, derogada por el RD 128/2022; revisión anual de balsas, sustituida por la del fabricante en el RD 339/2021 y el RD 587/2022; la franja de baño a 3 nudos, una vez derogada la Orden de 1964) y 11 actualizadas (aguas sucias y extintores por el RD 339/2021, posidonia por el RD 191/2026). Ninguna remite al régimen anterior al RD 875/2014: todas siguen su estructura de examen.
- Explicaciones de todas las que no son de carta (y de las de carta del PY, como en 2020–2026), adaptadas por concepto de las del mismo tribunal cuando la respuesta es la misma; soluciones de carta (PER 63 + 1 documentada; PY 151 + 7 documentadas; 2 de mareas sin tabla, con el método); práctica de cada clase ampliada.

## Pendiente

- Fecha de las tres convocatorias de 2015 (sin fecha en cuadernillos ni páginas): hasta tenerla, la etapa normativa marca sus preguntas con toda norma cuyo detector encaja (y todas se han revisado).
- Nota de «alegaciones contestadas» de la 4ª de 2018: no descargable; si se consigue, comprobar que no cambia más respuestas.
- Mareas de la 1ª de 2016 (and-py-2016-c1-n19 y -n20): el cuadernillo no trae la tabla del anuario; quedan con `requiere: ["anuario"]` y su explicación da el método.

