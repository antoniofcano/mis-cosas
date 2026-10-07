# Conceptos

Un **concepto** es algo que el alumno puede saber o no saber por separado y sobre lo que se puede preguntar («Luces de
un pesquero de arrastre», «Regala y amurada»). El catálogo de conceptos es **común** a todos los ejes y titulaciones:
sale de la norma y del temario, no de un tribunal. Con él se etiqueta el contenido (primero las preguntas de los
bancos; después clases, láminas, mapas, podcast y chuleta) para que el método trabaje por concepto: diagnóstico,
repaso de un fallo con **otra** pregunta del mismo concepto y del mismo eje (para no memorizar la letra) y «¿Estás
listo?» por concepto.

Los bancos **no se mezclan nunca**: el concepto es común, pero cada pregunta sigue siendo de su tribunal y todo lo
que la app ofrece para estudiar sale del banco activo (eje y titulación).

## Ficheros

```
data/conceptos/index.json               { "grupos": ["nomenclatura-maniobra", …] }  qué ficheros forman el catálogo
data/conceptos/<grupo>.json             un grupo del catálogo
data/ejes/<eje>/<tit>/conceptos.json    conceptos de cada pregunta de ese banco
tools/conceptos/etiquetas/<eje>/<tit>/  lotes de etiquetas decididas (con su motivo), ya fusionados (opcional; no se sirven)
.cache/conceptos/candidatos/            lotes de candidatos generados (no se suben: se regeneran)
```

Grupos de hoy: `nomenclatura-maniobra`, `seguridad-legislacion`, `balizamiento-ripa`, `meteorologia`,
`navegacion`. Un grupo nuevo se añade a `index.json` (si no, la app no lo carga y el validador da error); un grupo que
el índice nombra y aún no existe es solo un aviso.

### Catálogo (`data/conceptos/<grupo>.json`, inspirado en SKOS)

```json
{ "grupo": "balizamiento-ripa", "version": 1, "conceptos": [
  { "id": "ripa.luces.arrastre",
    "tipo": "concepto",
    "etiqueta": "Luces de un pesquero de arrastre",
    "sinonimos": ["arrastrero", "verde sobre blanco"],
    "nota": "Qué entra y qué no (alcance). 1–3 frases.",
    "padre": "ripa.luces",
    "relacionados": [],
    "tit": ["per", "py"],
    "clases": ["per-6-4"],
    "temario": "RD 875/2014, anexo …" }
] }
```

- `tipo`: `concepto` (se etiqueta con él) | `grupo` (solo agrupa; no se etiqueta con él).
- `etiqueta` (obligatoria), `sinonimos` (términos con que aparece en los enunciados: ayudan al buscador de candidatos),
  `nota` (alcance).
- `padre` (opcional): id de un concepto de tipo `grupo`; sin ciclos. `relacionados` (opcional): ids existentes.
- `tit`: titulaciones donde se examina (`per`, `py`). `clases`: ids de clases de `data/curso/{per,py}.json` donde se
  enseña (`[]` si ninguna).
- `temario`: ancla legal o del temario oficial; si no se encuentra con seguridad, `"pendiente"` (nunca inventada).
- `grupo` debe coincidir con el nombre del fichero; `version` es un entero ≥ 1 que se sube al cambiar el fichero.

**Granularidad**: un concepto se puede saber o no por separado y se puede preguntar. Orientativo: 3–8 por clase. Si
dos preguntas se responden sabiendo lo mismo, son del mismo concepto.

### Ids estables

- Formato: minúsculas ASCII y dígitos en segmentos separados por puntos; dentro de un segmento, `-` o `_`
  (`ripa.luces.arrastre`, `nav.carta.rumbo-verdadero`). Sin acentos, sin «ñ», sin espacios.
- El prefijo sugiere el lugar en el árbol, pero **el árbol es `padre`**, no el id.
- **Un id publicado no se renombra ni se reutiliza nunca**: el progreso del alumno y las etiquetas de los bancos van
  por id. Si un concepto se parte en dos, se crean dos ids nuevos y el viejo pasa a `tipo: "grupo"` padre de ambos
  (sus preguntas se re-etiquetan); si dos se juntan, uno queda y el otro se deja de usar (no se borra hasta que ninguna
  etiqueta lo cite y nunca se reutiliza su id).
- Los ids son únicos en todo el catálogo (entre todos los grupos).

### Etiquetas (`data/ejes/<eje>/<tit>/conceptos.json`)

```json
{
"and-2022-c2-t05": ["nomenclatura.amarre.cabos"],
"and-2022-c2-t06": ["ripa.luces.arrastre", "ripa.luces.remolque"]
}
```

1–2 conceptos de tipo `concepto` que incluyan esa titulación; el primero es el **principal**. Una pregunta por línea,
en el orden del banco (lo escribe `fusionar`). No se toca `preguntas.json`: su campo `concepto` es otra cosa (el id
de la pregunta equivalente de la que se adaptó la explicación, docs/BANCOS.md).

## Flujo

```
catálogo  →  candidatos  →  etiquetado (agentes)  →  fusión  →  validación
```

1. **Catálogo**: se escriben los grupos en `data/conceptos/` y se valida: `npm run conceptos -- validar`.
2. **Candidatos**: `npm run conceptos -- candidatos [--eje e] [--tit t] [--k 8] [--lote 40] [--todas] [--ids a,b]`
   escribe `.cache/conceptos/candidatos/<eje>/<tit>/lote-NNN.json` con las preguntas aún sin etiquetar (con `--todas`,
   también las etiquetadas, con sus etiquetas en `actuales`). Necesita `npm install` en `nautica/` (ver «Buscador»).
3. **Etiquetado**: quien etiqueta (un agente o una persona) lee un lote de candidatos y escribe un lote de etiquetas
   decididas, eligiendo entre los candidatos (o cualquier otro id del catálogo si ninguno encaja).
4. **Fusión**: `npm run conceptos -- fusionar <lote.json|carpeta>… [--forzar] [--simular]` lleva las etiquetas a
   `data/ejes/<eje>/<tit>/conceptos.json` y valida. Guarda los lotes decididos en
   `tools/conceptos/etiquetas/<eje>/<tit>/` para conservar los motivos.
5. **Validación** y cobertura: `npm run conceptos -- validar`. Después, `npm run precache` (los ficheros nuevos de
   `data/` entran solos en la lista del service worker si están en git) y `npm test`.

### Lote de candidatos (`conceptos-candidatos/1`, lo escribe la herramienta)

```json
{
 "formato": "conceptos-candidatos/1", "eje": "dgmm", "tit": "per", "lote": 1, "de": 49, "k": 8, "generado": "2026-10-07",
 "instrucciones": "…",
 "conceptos": { "casco.regala": { "etiqueta": "Regala y amurada", "nota": "…", "padre": "casco" } },
 "preguntas": [
  { "id": "dgmm-per-2019-06-01", "ut": 1, "ut_titulo": "…", "clases": ["per-1-1"], "enunciado": "…", "opciones": { "a": "…" },
    "correcta": "c", "clave": "…", "explicacion": "… (recortada)", "actuales": ["…"],
    "candidatos": [ { "id": "casco.regala", "p": 0.91, "clase": true }, { "id": "…", "p": 0.42 } ] }
 ]
}
```

`conceptos` trae solo los conceptos citados en el lote (no todo el catálogo): así quien etiqueta lee poco. `p` es la
puntuación (0–1, relativa a la mejor de la pregunta); `clase: true`, que el concepto se enseña en una clase cuya
práctica incluye la pregunta. `correcta` es una lista cuando el tribunal aceptó varias. Las anuladas no se proponen.

### Lote de etiquetas decididas (`conceptos-etiquetas/1`, lo escribe quien etiqueta)

```json
{
 "formato": "conceptos-etiquetas/1", "eje": "dgmm", "tit": "per", "autor": "agente-nomenclatura", "fecha": "2026-10-07",
 "etiquetas": {
  "dgmm-per-2019-06-01": { "conceptos": ["casco.regala"], "motivo": "Pregunta qué es la regala." },
  "dgmm-per-2019-06-46": { "conceptos": ["casco.barlovento", "maniobra.atraque"], "motivo": "Barlovento aplicado al atraque." },
  "dgmm-per-2019-06-50": { "conceptos": [], "falta": "nomenclatura.casco.imbornal · Imbornales", "motivo": "No hay concepto para desagües." }
 }
}
```

- `motivo`: una frase corta (por qué ese concepto). Sin `eje`/`tit`, se deducen del id de cada pregunta.
- `conceptos: []` con `falta`: no hay concepto en el catálogo; la fusión no escribe nada y lo lista como propuesta para
  quien mantiene ese grupo del catálogo.
- La fusión **no pisa** una etiqueta ya fusionada distinta (la lista como «conservada») salvo con `--forzar`; si dos
  lotes discrepan en una pregunta, no escribe ninguna de las dos y lo lista como conflicto. Rechaza (y lista) ids de
  pregunta que no existen y conceptos que no existen, son grupos o no son de esa titulación. Sale con 1 si hay
  rechazadas, conflictos o errores de validación.

### Validador

`npm run conceptos -- validar [--eje e] [--tit t] [--json] [--sin-cobertura] [--avisos N]` comprueba:

- **catálogo**: índice válido; cada fichero del índice (falta = aviso) y ningún fichero fuera de él; esquema de cada
  concepto; ids con formato y únicos entre grupos; `padre` que existe, es de tipo `grupo` y sin ciclos; `relacionados`
  que existen; `clases` que existen en `data/curso`; `tit` válidas; `temario` presente. Avisos: concepto sin clases,
  clase de otra titulación, grupo sin hijos, etiqueta repetida, campos desconocidos, falta `nota`.
- **etiquetas** de cada banco: preguntas que existen en ese banco; 1–2 conceptos, sin repetir, de tipo `concepto` y de
  esa titulación (aviso si la pregunta está anulada).
- **cobertura**: preguntas no anuladas con etiquetas válidas, por eje, titulación y tema (`ut`).

Sale con 1 si hay errores (los avisos no cuentan). Funciona sin catálogo y sin etiquetas (cobertura 0 %).

### Buscador de candidatos

`tools/conceptos/candidatos.mjs` no escribe un buscador propio: usa **MiniSearch** (`minisearch` 7.2.0; BM25 con
búsqueda por prefijo y fuzzy, sin dependencias, MIT) sobre `etiqueta` (×3), `sinonimos` (×3), `nota` (×1) y la
etiqueta del grupo padre (×0,7) de cada concepto, con un tokenizador propio: minúsculas, fuera palabras vacías (y
muletillas de examen: «indique», «correcta»…), raíz **Snowball española** (`snowball-stemmers` 0.6.0, ISC, sin
dependencias: el algoritmo oficial de Snowball compilado a JS) y, al final, sin acentos (se quitan después de sacar la
raíz porque el algoritmo de Snowball cuenta con ellos: «navegación» → «naveg»).

La pregunta se busca por partes y se suman las puntuaciones: enunciado (×1, con su `contexto`), respuesta correcta
(×0,8), demás opciones (×0,35) y clave + explicación del eje (×0,5). Se normaliza a 0–1 por la mejor y se suma un
refuerzo de 0,3 a los conceptos cuyas `clases` incluyen una clase cuya práctica tiene la pregunta (`practica.json`);
puntuación final = 0,7 × texto + 0,3 × clase (pesos en `PESOS`). Solo conceptos de tipo `concepto` y de la titulación
de la pregunta.

`--medir <oro.json>…` (un `conceptos.json` o lotes de etiquetas decididas, ficheros o carpetas) da recall@1/3/5/k del
concepto principal y de todas las etiquetas, el MRR del principal y las preguntas cuyo principal no salió. Úsalo con
unas decenas de preguntas etiquetadas a mano antes de lanzar el etiquetado masivo, y para ajustar `k` y `PESOS`.

Las dos librerías son `devDependencies` y solo las usa `tools/`: la app no tiene dependencias en ejecución y
`npm test` no necesita `npm install` (los tests del generador se saltan con un aviso si no están).

## En la app (`src/conceptos/`)

- `catalogo.js` (puro): rutas, formato de id, `indexarCatalogo(grupos)` → `{ conceptos, porId, concepto(id),
  descendientes(id), ancestros(id) }`.
- `conceptos.js` (puro): `crearIndiceConceptos({ catalogo, etiquetas, banco })` →
  - `conceptosDe(idPregunta)` → ids (el primero, el principal); `principalDe(idPregunta)`.
  - `preguntasDe(conceptoId, { soloEstudio = true, soloPrincipal = false })` → preguntas del banco (con un grupo, las
    de sus descendientes). Con `soloEstudio`, de `banco.estudio`: **sin reservadas para el examen final, ni anuladas,
    ni retiradas por la norma**. Con `false`, todas salvo anuladas y retiradas.
  - `dominio(respuestas)` → por concepto (y grupo, sumando): `preguntas` (de estudio), `vistas`, `aciertos`,
    `fallos`, `tasa` = (aciertos+1)/(vistas+2), `ultimo` `{ id, t, ok }` y `estado` (`sin-datos` | `flojo` |
    `en-progreso` | `dominado`). `respuestas` = `progress.exams` (la última respuesta a cada pregunta). Cuentan también
    las respuestas del examen final ya hecho.
  - `conceptosFlojos(respuestas, { limite })` → conceptos con el último intento fallado o tasa < 0,6; peor tasa
    primero y, a igual tasa, el fallo más reciente.
  - `variante(idFallada, respuestas, { hoy, rng })` → otra pregunta del estudio del mismo banco con el mismo concepto
    principal: antes las que lo tienen como principal; entre ellas, no vistas, luego falladas (más antiguas primero),
    luego acertadas (más antiguas primero), las respondidas hoy al final; las casi iguales (mismo enunciado o
    equivalentes por su `concepto` de origen) solo si no hay otra. `null` si no tiene concepto o no hay otra.
- `index.js`: `cargarConceptos(eje, tit)` (carga perezosa: nada se pide hasta la primera llamada; el catálogo una vez,
  las etiquetas una vez por banco) → la API anterior. Usa el motor de bancos: `cargarCatalogoConceptos()` (lee
  `data/conceptos/index.json` y sus grupos; un grupo que falta se salta) y `banco.etiquetasConceptos()` (lee
  `conceptos.json` del banco la primera vez que se pide; `{}` si aún no existe).

Tests: `tests/conceptos.test.js` (catálogo y banco de juguete).

## Cómo se usará en el método

Hoy la app **no cambia de comportamiento**: el módulo está listo y probado, pero ninguna pantalla lo usa todavía.
Previsto, cuando la cobertura de un eje lo permita:

- **Repaso de fallos**: al tocar repasar una pregunta fallada, se ofrece `variante(id, progress.exams)`: otra pregunta
  del mismo concepto y del mismo tribunal. La original vuelve más tarde; acertar la variante cuenta para el concepto.
- **Diagnóstico**: `dominio()` y `conceptosFlojos()` sustituyen (o afinan) el diagnóstico por clase y tema: qué
  conceptos fallas, con qué clase se enseñan (`clases`) y qué preguntas los practican.
- **¿Estás listo?**: además de los aciertos por tema, exigir que no queden conceptos flojos en los temas que
  penalizan (RIPA, balizamiento, carta).
- **Contenido**: clases, láminas, mapas, podcast y chuleta se etiquetarán con los mismos ids para enlazar «lo que
  fallas» con «dónde se explica».
