# Extracción de bancos de examen (tools/bancos)

El proceso de extracción convierte los exámenes oficiales publicados por cada administración examinadora (un
**eje**: andalucia, dgmm, murcia…) en el banco normalizado que lee la app. El formato de salida, los ids y las reglas
del banco son el contrato de [docs/BANCOS.md](BANCOS.md); este documento explica cómo se llega a él desde los PDF.

Principios:

- **Reproducible**: todo sale de los PDF oficiales y de ficheros escritos a mano que citan su fuente
  (`config.json`, `correcciones.json`). Cada etapa deja su resultado en la caché y la siguiente lo lee.
- **Nada oficial en git**: los PDF, las páginas descargadas y las salidas intermedias van a `.cache/bancos/`
  (git-ignorada). Se suben el manifiesto (metadatos), los informes y, cuando el eje lo permite, el banco final.
- **Ids estables**: un id publicado no cambia nunca (el progreso de los alumnos va por id).
- **Marcar de más**: lo dudoso (lecturas, emparejamientos, normas) no se decide en silencio; va al informe.

## Cómo se ejecuta

```
npm run bancos -- <eje> [--tit per|py] [--solo etapa[,etapa]] [--desde etapa] [--descubrir] [--todas] [--sin-red]
```

| Opción | Qué hace |
|---|---|
| `<eje>` | Carpeta de `tools/bancos/ejes/<eje>/` (obligatorio). |
| `--tit per\|py` | Solo esa titulación (por defecto, las de `config.titulaciones`). |
| `--solo etapa[,etapa]` | Solo esas etapas; cada una lee de la caché la salida de la anterior. |
| `--desde etapa` | Desde esa etapa hasta el final. |
| `--descubrir` | Vuelve a leer las páginas oficiales y rehace el manifiesto (sin ella se usa `ejes/<eje>/manifiesto.json`). |
| `--todas` | Incluye las convocatorias con `activa: false` (Andalucía 2015–2019). |
| `--sin-red` | No descarga nada: trabaja con lo que ya está en la caché y avisa de lo que falta. |

Ejemplos:

```
npm run bancos -- andalucia                          # 2020–2026, todas las etapas (las de 2015–2019 se conservan)
npm run bancos -- andalucia --todas --sin-red        # 2015–2026 con los PDF ya en la caché
npm run bancos -- andalucia --tit py --solo extraer  # repetir solo la extracción del PY
npm run bancos -- andalucia --desde normativa        # tras cambiar data/normativa.json
npm run bancos -- murcia --sin-red                   # Murcia: PDF descargados a mano
```

Cada etapa imprime una línea con su resumen (`· extraer (95.1 s): {…}`) y al final los avisos. Andalucía completa
(2015–2026, 136 cuadernillos y sus hojas) tarda unos 100 s, casi todo en la lectura óptica.

Requisitos: Node (el mismo de la app); `python3` con PyMuPDF y numpy (sin OpenCV); poppler (`pdftotext`, `pdfinfo`); `curl`.
`tesseract` (solo con el modelo inglés en este entorno) para el futuro adaptador `ocr`.

## Etapas

`manifiesto → extraer → repetidas → correcciones → clasificar → normativa → validar → escribir`

Cada etapa es `etapas/<etapa>.mjs`, exporta una función con su nombre que recibe el contexto
(`{ eje, config, opciones, avisos, tits }`) y escribe `.cache/bancos/<eje>/etapas/<etapa>-<tit>.json`.

| # | Etapa | Entrada | Salida | Qué hace |
|---|---|---|---|---|
| 1 | manifiesto | `config.json` (+ páginas oficiales con `--descubrir`) | `ejes/<eje>/manifiesto.json` (se sube) y `.cache/bancos/<eje>/pdf/` | Lista los documentos (url, convocatoria, titulación, modelo, rol `cuestionario` \| `plantilla` \| `correccion` \| `anexo`, tamaño publicado) y los descarga con su sha256. En los ejes de descarga manual solo verifica lo que el usuario deja en la caché. |
| 2 | extraer | manifiesto y PDF | `extraer-<tit>.json` → `{ apariciones }` | El **adaptador** del eje lee cada examen: cada aparición es una pregunta tal como sale en un examen concreto (convocatoria, modelo, número) con la respuesta tal como la da la fuente (`letras`, `estado`). |
| 3 | repetidas | apariciones | `repetidas-<tit>.json` → `{ preguntas, ambiguas, emparejadas }` | Une las apariciones que son la misma pregunta (modelos barajados, exámenes repetidos) en una con `apareceEn` y el mapa de letras de cada aparición. Asigna los ids. |
| 4 | correcciones | preguntas + `ejes/<eje>/correcciones.json` | `correcciones-<tit>.json` → `{ preguntas, conflictos, dudas, sinAplicar }` | Respuesta oficial de cada pregunta: la de su fuente y, encima, las correcciones publicadas (anular, respuesta, aceptar varias, errata de texto). |
| 5 | clasificar | correcciones | `clasificar-<tit>.json` (+ `atipicas`) | Tema (`ut`), `modulo`, `orden`, `bloque` y `requiere` por la posición en el examen (estructura del RD 875/2014); un clasificador por palabras clave señala las atípicas. |
| 6 | normativa | clasificar + `data/normativa.json` | `normativa-<tit>.json` | `norma: { estado: "revisar", normas }` si la aparición más antigua es anterior a un cambio normativo cuyo detector encaja. |
| 7 | validar | normativa (y las anteriores, para el informe) | `validar-<tit>.json` → `{ errores, avisos }` e `informes/<eje>.md` | Puertas de calidad del contrato; un error impide escribir en `data/ejes/`. |
| 8 | escribir | normativa + validar | según `config.salida` | `data` → `data/ejes/<eje>/<tit>/preguntas.json` y `eje.json` (estado «borrador»); `cache` → `.cache/bancos/<eje>/salida/<tit>/preguntas.json`. |

### Criterios de cada etapa

- **repetidas**: se **unen** dos apariciones si sus cuatro opciones coinciden como conjunto (texto canónico: sin
  tildes, mayúsculas, signos ni orden) y el enunciado tiene un Jaccard de palabras ≥ 0,90, o si la similitud total
  es ≥ 0,97. Entre 0,80 y ese umbral, **ambiguas**: no se unen y van al informe. Nunca se unen dos apariciones del
  mismo examen. Si el eje declara `repetidas.permutaciones` (Andalucía A/B), las que quedan sueltas se emparejan por
  posición y se listan como **emparejadas** (una errata en un modelo, p. ej.). Con `repetidas.entreConvocatorias`
  también se unen preguntas de convocatorias distintas (Andalucía no: sus ids son por convocatoria).
- **correcciones**: una letra → esa; varias → se aceptan todas; las cuatro → anulada; hoja óptica sin marca →
  anulada (el tribunal deja en blanco las anuladas) con aviso si ninguna corrección publicada lo confirma. Las
  correcciones se escriben con la letra y el número **tal como se imprimieron** en su modelo y se traducen al resto
  de apariciones por el texto de la opción. Dos apariciones con respuestas distintas sin corrección que lo resuelva
  → **conflicto** (al informe).
- **clasificar**: PER 4-2-4-2-5-10-2-3-4-5-4 → UT 1–11 (carta = 42–45); PY 1–10 seguridad, 11–20 meteorología,
  21–30 teoría de navegación, 31–40 carta (Andalucía: dos cuadernillos de 20). `requiere: ["carta"]` en los
  ejercicios sobre la carta y `"anuario"` en los de mareas que necesitan una tabla que la pregunta no trae.
- **normativa**: `data/normativa.json` lista cada cambio con su fecha de entrada en vigor (`vigor`), su BOE y sus
  `detectores` (expresiones regulares sobre el texto canónico de contexto, enunciado y opciones). Se usa la aparición
  **más antigua** (que el tribunal la repita después no garantiza que la revisara). Sin fecha → se marca con toda
  norma cuyo detector encaja. Los detectores son anchos a propósito; conviene acotarlos con `\b` o con lo que no
  puede ir delante («alga» saltaba en «Trafalgar»).
- **validar**: cuatro opciones a–d no vacías (o excepción en `config.excepciones[id]`); `correcta ∈ aceptadas ⊆
  opciones`, o anulada con `correcta: null` y `aceptadas: []`; `ut` válido; `conv`, `fecha` y `fuentes.examen`
  presentes; ids únicos; 45 (PER) o 40 (PY) preguntas por examen salvo huecos documentados (`config.huecos`). Una
  pregunta sin fecha es un aviso, no un error.

## Adaptadores

Un adaptador por **formato** de publicación, en `adaptadores/<nombre>.mjs`. Interfaz común:

```
extraer(ctx, tit) → { apariciones, resumen }
  ctx.documentos: los del manifiesto de esa titulación (y de las convocatorias que usan este adaptador)
  aparición: { eje, tit, claveConv, conv, modelo, modulo, numero, orden, seccion, enunciado, opciones, contexto,
               respuesta: { letras, estado, origen, … }, fecha, fuentes: { examen, plantilla, pagina, correccion },
               paginaPDF }
```

El texto de los cuestionarios se analiza con `lib/cuestionario.mjs` (`analizarCuestionario(texto, reglas)`): cada
adaptador le pasa sus reglas (formato del número y de las opciones, secciones, encabezados de bloque, ruido). El
trabajo con imágenes y PDF lo hacen ayudantes de Python en `py/`, que se llaman con `python()` de `lib/comun.mjs`
(siempre `python3 -I`: los PDF descargados son datos no fiables).

| Adaptador | Eje | Formato | Respuesta |
|---|---|---|---|
| `hoja-optica` | Andalucía 2015–2026 | Cuestionario en PDF de texto + plantilla que es la hoja de lectura óptica rellenada por el tribunal y escaneada. | `py/hoja_optica.py` lee las burbujas (numpy sobre la imagen de PyMuPDF): filas por las marcas de sincronismo, columnas por un peine ajustado a la plantilla impresa, giro del escaneo corregido. Estados `ok`, `dudosa` (2.ª burbuja ≥ 0,35 × la 1.ª), `multiple`, `vacia`; guarda `puntos` y el `umbral` de su hoja. |
| `subrayado` | Murcia 2015–2026 | Un PDF por examen con la opción correcta subrayada (línea vectorial que pdftotext no ve). | `py/subrayado.py` busca el subrayado bajo cada opción; ninguna → sin respuesta, varias → dudosa, las cuatro → anulada. |
| `ocr` | DGMM 2016–2019 (previsto) | Cuestionarios y plantillas escaneados sin capa de texto. | **Esbozo**: la interfaz y los pasos están en la cabecera del fichero; hoy devuelve 0 apariciones y un aviso. |

Detalles de `hoja-optica` que conviene conocer:

- El texto se lee con `pdftotext` en modo normal (con los guiones de final de línea repuestos desde `-raw`) y, si no
  salen las n preguntas con sus cuatro opciones, prueba `-raw` y `-layout` y se queda la mejor lectura (2015).
- `py/etiquetas_figura.py` quita del texto los rótulos que caen dentro de una figura (banderas, tablas de mareas).
- Los modelos A y B del PER son dos hojas escaneadas por separado: la etapa repetidas los empareja y la de
  correcciones comprueba que la opción marcada en las dos tenga el mismo texto.
- 2015–2019: en `-raw` el guion de una palabra partida por sílabas se quita si sus dos trozos no salen sueltos en el
  cuadernillo («obsta-culiza»); el «0» volado que en 2017–2018 hace de símbolo de grado («237⁰», «-5⁰ (menos)») lo
  localiza `py/grado_cero.py` y se repone como «º»; el encabezado «MAREAS.» y la tabla del anuario metida en un enunciado
  (2/2016) pasan al contexto de sus preguntas; las figuras dibujadas en la página las recorta
  `ejes/andalucia/figuras.mjs` (`py/recorte.py`) y las asigna `ejes/andalucia/figuras.json` por aparición.

La DGMM y Baleares tienen sus propios adaptadores (plantilla aparte, respuesta en línea) en sus ramas.

## Descubrimiento de documentos

`descubrir/<eje>.mjs` exporta `descubrir(config, { avisos, todas }) → documentos` y lo llama la etapa manifiesto
(la primera vez o con `--descubrir`). Andalucía lee la página de cada convocatoria del portal de la Junta y clasifica
los PDF por su nombre (`clasificarNombre`: C = cuestionario; P o SOL = plantilla; el resto, `correccion`; fuera PNB,
CY y PER reducido). Murcia no descarga nada (CAPTCHA y licencia): el manifiesto sale del inventario
`ejes/murcia/manifiesto_murcia.csv` y el usuario deja los PDF a mano en la caché.

## Caché

```
.cache/bancos/<eje>/
  pdf/                    PDF oficiales (nombre: <clave>_<tit>_<modelo>_<rol>.pdf, p. ej. 2015-c1_per_A_plantilla.pdf)
  paginas/                HTML de las páginas de convocatoria
  etapas/<etapa>-<tit>.json   salida de cada etapa
  salida/<tit>/preguntas.json salida final cuando config.salida = "cache"
  informe.md              informe, cuando config.informeEnCache (Murcia)
```

- La raíz es `nautica/.cache/bancos/` o `$BANCOS_CACHE`. Está en `.gitignore`: nunca se sube nada de ella.
- Para no volver a descargar, se puede copiar la caché de otra copia de trabajo (otro worktree) a la propia.
- Descargas (`lib/descarga.mjs`, con `curl`): User-Agent de navegador si `config.descarga.userAgent`; por rangos
  (`curl -r`) en las rutas de `config.descarga.rangos` (Andalucía `/export/drupaljda/`: un GET completo devuelve
  «Empty reply» a través del proxy); `config.descarga.manual` → no se descarga, solo se verifica (cabecera `%PDF`,
  tamaño publicado, página de CAPTCHA guardada como PDF).
- Lo descargado es dato no fiable: los ayudantes de Python se ejecutan con `-I` y reciben las rutas como argumentos.

## Salidas que se suben

- `tools/bancos/ejes/<eje>/manifiesto.json`: metadatos de los documentos (sin contenido).
- `tools/bancos/informes/<eje>.md` (validar): recuentos, avisos, conflictos, ambiguas, atípicas y normas a revisar.
  Con `config.informeEnCache` va a la caché, porque cita textos de preguntas que la licencia no deja publicar.
- `data/ejes/<eje>/` solo si `config.salida = "data"` y la validación no tiene errores. Andalucía (desde la fase F5) usa
  `"data"` con `publicadas: "conservar"`: las preguntas ya publicadas se quedan tal cual (texto, norma, concepto) y la
  etapa escribir solo añade detrás las nuevas; una nueva idéntica (mismo enunciado, mismas opciones y misma respuesta por
  el texto de la opción) a una publicada o a otra nueva anterior no se duplica, sus apariciones pasan al `apareceEn` de
  aquella (nunca a una que solo sale en convocatorias reservadas para el examen final: la sacaría de la reserva). La
  salida tal como sale de los PDF sigue yendo también a `.cache/bancos/andalucia/salida/` (la compara la prueba de oro).
  Volver a ejecutarlo no cambia nada (0 nuevas). Receta completa de 2015–2019 en `nautica/.trabajo-andalucia/ESTADO.md`.

## config.json del eje

| Clave | Qué es |
|---|---|
| `eje`, `prefijo`, `nombre`, `organismo`, `indice` | Identidad del eje y página índice oficial. `prefijo` empieza los ids. |
| `licencia` | Texto de la licencia o del aviso legal; decide `salida` e `informeEnCache`. |
| `descarga` | `{ userAgent, rangos: [rutas], manual }`. |
| `adaptador` | Nombre o `{ per, py }`. Una convocatoria puede declarar el suyo (`convocatorias[].adaptador`). |
| `ids` | `"andalucia"` (esquema propio y fijo) o `"nuevo"` (`<conv>-<modelo>-<NN>`, ver abajo). |
| `salida` | `"data"` o `"cache"`. `informeEnCache`: el informe a la caché. |
| `publicadas` | `"conservar"`: las publicadas no se reescriben y las idénticas nuevas se unen a ellas (ver «Salidas que se suben»). |
| `titulaciones` | `{ per: { preguntas: 45, modelos, disposicion }, py: { preguntas: 40, modulos \| modelos, disposicion } }`. |
| `convocatorias` | `[{ clave, pagina, fecha \| fechas: { per, py }, activa, titulaciones?, adaptador?, titulo?, derivadaDe?, nota? }]`. `activa: false` → solo con `--todas`. |
| `repetidas` | `{ entreConvocatorias, ordenModelos, permutaciones }`. |
| `excepciones`, `huecos` | Excepciones documentadas a las puertas de validar (`{ id: motivo }`, `{ "conv · modelo": motivo }`). |
| `ficha`, `descripcion`, `notasInforme` | Ficha del eje que escribe la etapa escribir, descripción del banco y notas para el informe. |

Ids (`lib/ids.mjs`): Andalucía conserva `and-AAAA-cN-tNN|qNN` y `and-py-AAAA-cN-gNN|nNN`; los ejes nuevos usan
`<prefijo>-<tit>-<AAAA-MM>-<modelo>-<NN>` con la primera aparición, y `conv` `<prefijo>-<tit>-AAAA-MM`. Si el banco ya
existe en `data/ejes/`, cada pregunta conserva el id publicado con el que comparte alguna aparición.

### correcciones.json

Correcciones oficiales publicadas (notas del tribunal, acuerdos, textos de las páginas), a mano y cada una con su
fuente:

```json
{ "conv": "and-2015-c2", "modelo": "B", "numero": 32, "accion": "anular",
  "fuente": "https://…/examenes-segundaconvocatoria-2015.html", "texto": "PER B: la nº 32 queda anulada." }
```

`accion`: `anular` | `respuesta` (`letras`, sustituye) | `aceptar` (`letras`, varias válidas) | `errata`
(`campo`: `enunciado` | `opcion-a`…, `buscar`, `reemplazar`). Opcional: `fecha` (se aplican en orden de fecha).
Una corrección que no casa con ninguna pregunta sale en `sinAplicar` y como aviso.

## Herramientas por eje y pruebas

- Andalucía (`ejes/andalucia/`):
  - `oro.mjs` → `informes/andalucia-oro.md`: prueba de oro, compara la salida 2020–2026 con el banco vivo, id a id;
    cada diferencia se explica en `oro.json`.
  - `antiguas.mjs` → `informes/andalucia-2015-2019.md`: recuentos, confianza de la lectura óptica, correcciones
    frente a la hoja y cruce con las repeticiones (solo caché).
  - `normativa.mjs` → `informes/andalucia-normativa.md`: la etapa normativa sobre el banco vivo, en modo informe.
- Murcia: `ejes/murcia/verificar.mjs` comprueba los PDF descargados a mano.
- Pruebas: `tests/bancos-extraccion.test.js` (adaptadores, descubrimiento, informes, normativa) y
  `tests/bancos-extraccion-oro.test.js` (prueba de oro y erratas del banco vivo). Usan PDF **sintéticos**
  (`tests/fixtures/bancos/generar.py`); las que necesitan la caché o PyMuPDF se saltan si no están.

## Cómo añadir un eje

1. **Investiga** la fuente: dónde publica los exámenes, formato de cuestionarios y plantillas, modelos, correcciones
   y licencia (`research_notes/…/<eje>.md`). La licencia decide si el banco puede subirse.
2. **Configura** `tools/bancos/ejes/<eje>/config.json`: identidad, `descarga`, `adaptador`, `ids: "nuevo"`,
   `salida` (`"cache"` mientras no esté revisado o si la licencia no lo permite), `titulaciones` y
   `convocatorias` (clave `AAAA-MM`, página, fechas). Añade el prefijo, que no se repita con otro eje.
3. **Descubrimiento**: escribe `tools/bancos/descubrir/<eje>.mjs` (`descubrir(config, { avisos, todas })`), que
   devuelve los documentos con su rol, titulación y modelo. Si el portal no deja descargar, parte de un inventario
   y usa `descarga.manual`. Ejecuta `npm run bancos -- <eje> --solo manifiesto --descubrir` y revisa el manifiesto.
4. **Adaptador**: si el formato es nuevo, crea `tools/bancos/adaptadores/<nombre>.mjs` con la interfaz de arriba,
   reutilizando `lib/cuestionario.mjs` y, para leer imágenes o PDF, un ayudante en `py/` (siempre `python3 -I`).
   Pruebas con un PDF sintético en `tests/fixtures/bancos/` (nunca uno oficial). Ejecuta
   `npm run bancos -- <eje> --solo extraer` y revisa el resumen.
5. **Correcciones**: copia a `ejes/<eje>/correcciones.json` las anulaciones y erratas publicadas, con su fuente.
6. **Proceso completo**: `npm run bancos -- <eje>`. Revisa `informes/<eje>.md`: errores (bloquean la escritura),
   conflictos, ambiguas, lecturas dudosas, atípicas y normas a revisar. Resuelve cada caso en el adaptador, en
   `correcciones.json` o con `excepciones`/`huecos` documentados, y repite con `--desde` la etapa que toque.
7. **Normativa**: si el eje cita una norma que no está en `data/normativa.json` (otra edición de la IALA, una norma
   autonómica), añádela con su BOE, su fecha y sus detectores, y repite desde `normativa`.
8. **Publicar**: con la validación limpia y revisado el informe, `salida: "data"` escribe el banco y la ficha
   (estado «borrador»); sigue los pasos de «Cómo añadir un eje» de [docs/BANCOS.md](BANCOS.md) (registro,
   explicaciones, práctica, `npm test`, `npm run precache`).
9. **Nunca** se suben los PDF oficiales, la carta escaneada ni, si la licencia no lo permite, nada con textos de sus
   preguntas (informe en la caché).
