# Conceptos · motor (rama feat/conceptos-motor)

Tarea: herramientas (validar, candidatos, fusionar), módulo de la app src/conceptos/ y docs/CONCEPTOS.md. No escribe el
catálogo (lo escriben otros agentes en data/conceptos/<grupo>.json).

## Hecho
- `data/conceptos/index.json`: lista los 5 grupos (nomenclatura-maniobra, seguridad-legislacion, balizamiento-ripa,
  meteorologia, navegacion). Los ficheros de grupo que aún no existen son solo un aviso del validador; un fichero de
  grupo que no esté en el índice es error (la app no lo cargaría).
- `tools/conceptos/validar.mjs` (`npm run conceptos -- validar`): catálogo (esquema, ids, padres grupo, ciclos,
  relacionados, clases de data/curso, tit, temario) + etiquetas por banco + cobertura por eje/tit/ut. Código 1 si hay
  errores. Funciona sin catálogo ni etiquetas.
- `tools/conceptos/candidatos.mjs` (`npm run conceptos -- candidatos`, `--medir oro.json`): MiniSearch 7.2.0 + Snowball
  español (`snowball-stemmers` 0.6.0). Lotes en `.cache/conceptos/candidatos/<eje>/<tit>/lote-NNN.json`
  (formato `conceptos-candidatos/1`). Probado con un catálogo falso de 125 conceptos (uno por clase): 10 051 preguntas
  en ~7 s, ~1,3 KB por pregunta en el lote.
- `tools/conceptos/fusionar.mjs` (`npm run conceptos -- fusionar <lotes>`): formato `conceptos-etiquetas/1`, no pisa sin
  `--forzar`, conflictos entre lotes, propuestas de conceptos que faltan, valida al final.
- `src/conceptos/` (catalogo.js, conceptos.js puros; index.js con carga perezosa). En `src/bancos/index.js`:
  `cargarCatalogoConceptos()` y `banco.etiquetasConceptos()` (perezosos). La app no cambia de comportamiento.
- `tests/conceptos.test.js` (14 tests; los 2 del generador se saltan con aviso sin `npm install`).
- `docs/CONCEPTOS.md`; línea en docs/BANCOS.md.

## Elección del lematizador
`snowball-stemmers` 0.6.0 (ISC, sin dependencias): es el compilado a JS del algoritmo oficial Snowball (jssnowball), que
no cambia; la última publicación es de 2022, pero el algoritmo español de Snowball es estable. Alternativa descartada:
`@nlpjs/lang-es` (su `latest` es una 5.0.0-alpha y arrastra `@nlpjs/core`). Orden: minúsculas → raíz → sin acentos
(Snowball cuenta con los acentos: «navegación» → «naveg», pero «navegacion» sin tilde no se reduce).

## Pendiente / ideas
- Medir recall@k con unas decenas de preguntas etiquetadas a mano en cuanto haya catálogo real, y ajustar `PESOS`/k.
- Usar el módulo en la app (repaso con variante, diagnóstico por concepto, «¿Estás listo?»): fuera de esta tarea.

## Cómo seguir
- Leer docs/CONCEPTOS.md. `npm install` en nautica/ para candidatos. `npm test` no lo necesita.
