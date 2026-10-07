# Prueba de oro · Andalucía 2020–2026

Generado por `node tools/bancos/ejes/andalucia/oro.mjs` el 2026-10-07, tras `npm run bancos -- andalucia` desde los PDF oficiales (cuestionarios de texto y plantillas escaneadas leídas con el adaptador `hoja-optica`). Compara, id a id, la salida del proceso (`.cache/bancos/andalucia/salida/<tit>/preguntas.json`) con el banco vivo (`data/ejes/andalucia/<tit>/preguntas.json`). La prueba no modifica el banco vivo: las erratas que destapa se corrigen aparte y se listan en «Erratas del banco vivo corregidas».

Normalización de texto antes de comparar: espacios (incluidos los de anchura especial), comillas y apóstrofos tipográficos, y el espacio delante de un signo de puntuación («es :» = «es:»). La huella (`tools/bancos/andalucia-huella.json`) se compara sin normalizar.

## Resultado

| Campo | PER iguales | PY iguales |
|---|---|---|
| enunciado | 810/810 (100,0 %) | 720/720 (100,0 %) |
| opcion a | 810/810 (100,0 %) | 720/720 (100,0 %) |
| opcion b | 810/810 (100,0 %) | 720/720 (100,0 %) |
| opcion c | 810/810 (100,0 %) | 720/720 (100,0 %) |
| opcion d | 810/810 (100,0 %) | 720/720 (100,0 %) |
| correcta | 810/810 (100,0 %) | 720/720 (100,0 %) |
| anulada | 810/810 (100,0 %) | 720/720 (100,0 %) |
| ut | 810/810 (100,0 %) | 720/720 (100,0 %) |
| numero | 810/810 (100,0 %) | 720/720 (100,0 %) |
| fecha | 810/810 (100,0 %) | 720/720 (100,0 %) |
| huella exacta | 806/810 | 717/720 |

- PER: 810 preguntas en el banco vivo, 810 encontradas en la salida.
- PY: 720 preguntas en el banco vivo, 720 encontradas en la salida.
- **correcta / anulada: acuerdo del 100 %**. Diferencias en total: 0 (0 probables errores del banco vivo, 0 sin explicar).
- Las huellas que no coinciden son las preguntas con diferencias de espacio delante de un signo («es :») o de las listadas abajo: el texto que ve el alumno es el mismo salvo en esas.

## Diferencias

_Ninguna._

## Erratas del banco vivo corregidas

Diferencias que la prueba destapó como errores del banco vivo y que ya se han corregido en `data/ejes/andalucia/` (con su huella en `tools/bancos/andalucia-huella.json` y la errata en `ERRATAS` de `tools/bancos/migrar-andalucia.mjs`). Tras corregirlas, la comparación de arriba ya no las cuenta.

| id | Campo | Antes | Después | Fecha | Evidencia | Arreglo |
|---|---|---|---|---|---|---|
| and-py-2022-c3-n20 | opcion d | "26° 35,7′ S, 179° 59,4′ W \u0012 \u0013" | "26° 35,7′ S, 179° 59,4′ W" | 2026-10-07 | 2022-c3_py_navegacion_cuestionario.pdf (https://www.juntadeandalucia.es/…/2022_3C_PY_modulo_navegacion.pdf), pág. 6: «d) 26° 35,7′ S, 179° 59,4′ W» y nada más; la pág. 7 es la tabla para calcular la altura de la marea (imagen con rótulos) y pdftotext saca de ella «(», U+0012 y U+0013, que la extracción antigua pegó a la opción. Solo afecta al texto (la respuesta, c, coincide). PY: un solo modelo, sin hoja B con la que cruzar. | Se quitan los dos caracteres de control (U+0012 y U+0013) y los espacios que los precedían en data/ejes/andalucia/py/preguntas.json. La huella de la pregunta en tools/bancos/andalucia-huella.json pasa de 05fc60c695c5010a a d1cd1315a857e33b, y tools/bancos/migrar-andalucia.mjs aplica la errata (ERRATAS) antes de calcular la huella, así que repetir la migración da el banco corregido. No cambian ni la respuesta (c) ni el id: el progreso guardado sigue valiendo. |

## Lectura óptica (2020–2026)

- PER: 1620 burbujas-fila leídas (1600 ok, 20 vacia). Modelos A y B: 810/810 preguntas con la misma respuesta en las dos hojas (traducida por el texto de la opción). Cada «vacía» es una pregunta anulada (el tribunal deja su fila en blanco); las demás anuladas salen de las correcciones publicadas.
  Lecturas con menos margen (2.ª burbuja / 1.ª; «dudosa» a partir de 0,35): and-2021-c2/B/5 0,31; and-2021-c2/B/4 0,18; and-2021-c1/B/9 0,09; and-2021-c1/B/31 0,09; and-2023-c3/A/31 0,08.
- PY: 720 burbujas-fila leídas (717 ok, 3 vacia). Cada «vacía» es una pregunta anulada (el tribunal deja su fila en blanco); las demás anuladas salen de las correcciones publicadas.
  Lecturas con menos margen (2.ª burbuja / 1.ª; «dudosa» a partir de 0,35): and-py-2021-c2/navegacion/6 0,18; and-py-2021-c2/navegacion/5 0,17; and-py-2021-c2/navegacion/9 0,13; and-py-2024-c3/generico/3 0,10; and-py-2021-c2/generico/16 0,09.

## Errores del proceso que destapó la prueba (corregidos)

- **Peine de columnas desplazado en la hoja óptica** (40 preguntas: PY módulo genérico de la 1ª convocatoria de 2025 y de la 1ª de 2026, 20 cada una; 2 de ellas salían además como anuladas (g09 de 2025, g05 de 2026)). En esos escaneos los números impresos de las preguntas salen más intensos que las burbujas, y el ajuste del peine de 4×4 burbujas se corría una columna a la izquierda (sobre los números), con el paso de burbuja en el tope del intervalo de búsqueda: cada respuesta se leía una letra antes (b→a…) y la burbuja d no se miraba. Arreglo: py/hoja_optica.py penaliza el hueco a la derecha de la burbuja d de cada bloque (antes de los números del bloque siguiente), que debe estar vacío. Con ello las 72 hojas de 2020–2026 coinciden al 100 % con el banco vivo.
- **Guion del número de pregunta dentro del enunciado** (71 enunciados: PER 2ª/2021 (28: t09, t18–t34, t36–t41, q42–q45); PY 1ª/2021 navegación 1–10, 2ª/2021 genérico 1–20 y navegación 1–10, 3ª/2025 navegación 18–20). Los cuadernillos numeran «9.- Cual…»; la expresión del número solo consumía el punto y el enunciado empezaba por «- ». Arreglo: REGLAS_ANDALUCIA.numero acepta «N.-» seguido de espacio.
- **Guiones de final de línea perdidos por pdftotext** (3 preguntas: and-2024-c2-t07 («estriborbabor»), and-2021-c2-t10 («(babor estribor)») y and-2021-c1-q42 («Ct = 8º -» se perdía y la opción c quedaba pegada a la b: la pregunta salía con 2 opciones)). El modo normal de pdftotext «deshace» los guiones de final de línea (dehyphenation) y se come el guion. El modo -raw lo conserva pero desordena las tablas de mareas. Arreglo: El adaptador lee el texto normal y repone los guiones que -raw tiene al final de línea (reponerGuiones): pegado a la palabra → «estribor-babor»; suelto → guion y salto de línea.
- **Rótulos de figura dentro de una opción** (1 pregunta: and-2025-c3-t19 (opción b con «Blanco Azul» en medio)). La bandera de la figura es un dibujo vectorial con rótulos de texto que pdftotext intercala con las líneas de la opción. Arreglo: py/etiquetas_figura.py localiza (PyMuPDF) las líneas cortas cuyo centro cae dentro de una imagen o de un dibujo relleno, y el adaptador las quita del texto de su página.
- **Sigla en mayúsculas tomada por encabezado de bloque** (1 pregunta: and-py-2024-c2-g05 (la opción d perdía «SOLAS»)). Cualquier línea en mayúsculas abría un bloque de contexto (pensado para «MAREAS» y «LOXODRÓMICA»). Arreglo: Lista cerrada de encabezados de bloque y de cabeceras de tabla (CONTEXTO en el adaptador).
- **Tabla de mareas dentro del enunciado** (1 pregunta: and-py-2021-c2-n20 («… Sc= 3.28m HORAS 1:48 7:48 14:03 20:19»)). En ese cuadernillo la columna de horas de la tabla sale entre el enunciado y las opciones. Arreglo: separarTabla() pasa al contexto de la pregunta una cola «HORAS hh:mm …» del enunciado.
- **Error de tipos en la reparación de opciones** (todas (la etapa extraer se detenía)). lib/cuestionario.mjs llamaba a LETRAS.filter con LETRAS = 'abcd' (una cadena). Arreglo: [...LETRAS].filter (cambio de una línea en el núcleo común, comunicado al dueño).

