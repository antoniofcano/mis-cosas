# Andalucía 2015–2019 · extracción (solo caché)

Generado por `node tools/bancos/ejes/andalucia/antiguas.mjs` el 2026-10-07, tras `npm run bancos -- andalucia --todas`. Las 16 convocatorias de 2015–2019 (research_notes/…/andalucia_anteriores.md) se extraen de sus PDF oficiales (cuestionario de texto + hoja de lectura óptica escaneada) con el adaptador `hoja-optica`, a `.cache/bancos/andalucia/salida/<tit>/preguntas.json` junto con las de 2020–2026. **No se escriben en `data/ejes/`**: entran en la app en la fase F5.

Ids con el esquema de Andalucía: `and-AAAA-cN-tNN` (teoría PER), `and-AAAA-cN-qNN` (carta PER), `and-py-AAAA-cN-gNN|nNN` (PY). Casos especiales:

- **1ª de 2018**: su página está en otra ruta (`…/investigacion-innovacion-deportiva/…`). El PY tuvo modelos A y B de cada módulo con **preguntas distintas** (no son permutaciones): el A es `and-py-2018-c1-…` y el B, una convocatoria aparte del banco, `and-py-2018-c1b-gNN|nNN` («1ª convocatoria 2018, PY modelo B» en config.json).
- **3ª de 2018**: solo PNB y PER (Cádiz y Sevilla); no hubo PY (`titulaciones: ["per"]` en config.json).
- **2015**: los cuadernillos no traen fecha y no se ha encontrado en fuente oficial: las preguntas van sin fecha (la etapa normativa las marca «revisar» con toda norma cuyo detector encaja). Las fechas del PY de 2018 (14-3, 12-6 y 23-11) son las de sus portadas, distintas de las del PER.
- Correcciones publicadas (ejes/andalucia/correcciones.json): las de las páginas de 2015–2016 y la nota del Tribunal de 21-01-2019 de la 4ª de 2018 (leída por OCR del PDF escaneado: anula la 39 de A y B; da por buenas a+b en A11/B12 y c+d en A13/B14). La otra nota de esa página («alegaciones contestadas») no se pudo descargar (el servidor no da Content-Length ni con peticiones por rangos).

## PER

- **720 preguntas** de 16 convocatorias (and-2015-c1-t01 … and-2019-c3-q45); 3 anuladas, 2 con varias respuestas aceptadas.
- Lectura óptica: 1440 filas leídas: 1432 ok, 4 vacia, 4 multiple. Modelos A y B: **720/720** preguntas con la misma respuesta en las dos hojas (100,0 %).
- Conflictos entre apariciones: 0; lecturas dudosas o sin respuesta: 0; errores de validación: 0.
- Burbujas con menos margen (2.ª/1.ª; «dudosa» desde 0,35): and-2015-c3/A/2 0,12; and-2015-c1/A/35 0,12; and-2019-c2/B/10 0,10; and-2015-c1/A/40 0,09; and-2017-c3/B/36 0,09; and-2016-c3/A/30 0,09.

| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |
|---|---|---|---|---|---|---|---|---|
| and-2015-c1 | — | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 10 |
| and-2015-c2 | — | 45 | 90 | 1 | 0 | 88 ok, 2 vacia | 45/45 | 12 |
| and-2015-c3 | — | 45 | 90 | 1 | 0 | 90 ok | 45/45 | 14 |
| and-2016-c1 | 2016-04-09 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 9 |
| and-2016-c2 | 2016-06-18 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 10 |
| and-2016-c3 | 2016-11-19 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 14 |
| and-2017-c1 | 2017-04-01 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 14 |
| and-2017-c2 | 2017-06-17 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 13 |
| and-2017-c3 | 2017-11-11 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 12 |
| and-2018-c1 | 2018-03-10 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 11 |
| and-2018-c2 | 2018-05-26 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 13 |
| and-2018-c3 | 2018-09-29 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 11 |
| and-2018-c4 | 2018-12-01 | 45 | 90 | 1 | 2 | 84 ok, 4 multiple, 2 vacia | 45/45 | 8 |
| and-2019-c1 | 2019-04-06 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 10 |
| and-2019-c2 | 2019-06-15 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 9 |
| and-2019-c3 | 2019-11-23 | 45 | 90 | 0 | 0 | 90 ok | 45/45 | 13 |

Anuladas y con varias respuestas:

- and-2015-c2-t30: anulada — PER A: la nº 30 queda anulada. PER B: la nº 32 queda anulada.
- and-2015-c3-t10: anulada — El Tribunal, reunido el 9-12-2015, anula la nº 10 del PER examen A. El Tribunal, reunido el 9-12-2015, anula la nº 7 del PER examen B.
- and-2018-c4-t39: anulada — Nota informativa del presidente del Tribunal (Puerto Real, 21-01-2019), 4ª convocatoria 2018: se anula la pregunta 39 del PER modelo A. Nota informativa del pre
- and-2018-c4-t11: aceptadas a y b
- and-2018-c4-t13: aceptadas c y d

## PY

- **640 preguntas** de 16 convocatorias (and-py-2015-c1-g01 … and-py-2019-c3-n20); 1 anuladas, 0 con varias respuestas aceptadas.
- Lectura óptica: 640 filas leídas: 639 ok, 1 vacia. Un solo modelo por convocatoria: no hay segunda hoja con la que cruzar.
- Conflictos entre apariciones: 0; lecturas dudosas o sin respuesta: 0; errores de validación: 0.
- Burbujas con menos margen (2.ª/1.ª; «dudosa» desde 0,35): and-py-2015-c1/generico/9 0,17; and-py-2017-c3/generico/5 0,07; and-py-2019-c1/navegacion/20 0,06; and-py-2019-c2/generico/17 0,05; and-py-2015-c2/navegacion/5 0,05; and-py-2015-c1/navegacion/4 0,05.

| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |
|---|---|---|---|---|---|---|---|---|
| and-py-2015-c1 | — | 40 | 40 | 0 | 0 | 40 ok | — | 6 |
| and-py-2015-c2 | — | 40 | 40 | 0 | 0 | 40 ok | — | 5 |
| and-py-2015-c3 | — | 40 | 40 | 0 | 0 | 40 ok | — | 8 |
| and-py-2016-c1 | 2016-04-09 | 40 | 40 | 0 | 0 | 40 ok | — | 5 |
| and-py-2016-c2 | 2016-06-18 | 40 | 40 | 1 | 0 | 39 ok, 1 vacia | — | 4 |
| and-py-2016-c3 | 2016-11-19 | 40 | 40 | 0 | 0 | 40 ok | — | 6 |
| and-py-2017-c1 | 2017-04-01 | 40 | 40 | 0 | 0 | 40 ok | — | 4 |
| and-py-2017-c2 | 2017-06-17 | 40 | 40 | 0 | 0 | 40 ok | — | 8 |
| and-py-2017-c3 | 2017-11-11 | 40 | 40 | 0 | 0 | 40 ok | — | 6 |
| and-py-2018-c1 | 2018-03-14 | 40 | 40 | 0 | 0 | 40 ok | — | 9 |
| and-py-2018-c1b | 2018-03-14 | 40 | 40 | 0 | 0 | 40 ok | — | 6 |
| and-py-2018-c2 | 2018-06-12 | 40 | 40 | 0 | 0 | 40 ok | — | 10 |
| and-py-2018-c4 | 2018-11-23 | 40 | 40 | 0 | 0 | 40 ok | — | 7 |
| and-py-2019-c1 | 2019-04-06 | 40 | 40 | 0 | 0 | 40 ok | — | 11 |
| and-py-2019-c2 | 2019-06-15 | 40 | 40 | 0 | 0 | 40 ok | — | 8 |
| and-py-2019-c3 | 2019-11-23 | 40 | 40 | 0 | 0 | 40 ok | — | 8 |

Anuladas y con varias respuestas:

- and-py-2016-c2-g18: anulada — PY módulo genérico, pregunta 18 anulada.

## Arreglos del proceso necesarios para 2015–2019

- **Texto en columnas (2015)**: pdftotext en modo normal separa las letras «a) b) c) d)» de sus textos. El adaptador lee en modo normal y, si no salen las n preguntas con sus cuatro opciones, prueba `-raw` y `-layout` y se queda la mejor lectura (2015: `-raw` en 11 de los 12 cuadernillos).
- **Cabecera de página de 2015** (códigos de certificación «ER-…/2011», «CÓDIGO nnnnnnnn» y el nombre del centro que maquetó los cuadernillos, con las letras separadas en `-raw`): ruido.
- **Escaneos girados**: un giro del 1,5 % desplaza medio paso de fila el bloque 1–25 respecto de las marcas de sincronismo (antes del arreglo: PER 1/2017 con 12 respuestas distintas entre las hojas A y B y 17 lecturas dudosas; PER 3/2015 con 26 y 22). `hoja_optica.py` mide el giro en las marcas, predice el desfase de cada bloque y lo afina con la plantilla impresa; también corrige la deriva horizontal de las columnas.
- **Hoja de 2015–2016 (otro impresor, casillas rectangulares) y lápiz claro**: el lápiz se busca como gris (oscuro y sin color), sin confundirlo con los números impresos en magenta oscuro, y el paso de burbuja se busca entre el 92 % y el 102 % del nominal (PY 2/2015: el peine se corría sobre los números y salían 10 filas en blanco).
- Tras los arreglos, la prueba de oro de 2020–2026 sigue en el 100 % (informes/andalucia-oro.md).

