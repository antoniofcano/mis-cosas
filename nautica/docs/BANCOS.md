# Bancos de preguntas por eje

Un **eje** es una administración examinadora (andalucia, dgmm, baleares, murcia…). Cada eje tiene su banco
independiente de preguntas reales de examen; nunca se mezclan. El curso (las clases) es nacional y único: lo que
cambia de un eje a otro son las preguntas, sus explicaciones, la práctica de cada clase y las particularidades
de su tribunal.

Este documento es el contrato entre el proceso de extracción (`tools/bancos/`, fase F2) y la app (`src/bancos/`,
fase F0). Hoy hay un solo eje, **Andalucía**, que es también el eje por defecto (`src/bancos/registro.js`).

## Ficheros

```
data/ejes/index.json                      registro de ejes
data/ejes/<eje>/eje.json                  ficha del eje
data/ejes/<eje>/<tit>/preguntas.json      banco normalizado (tit = per | py)
data/ejes/<eje>/<tit>/explicaciones.json  { <id>: { explicacion, clave, trampa?, ilustraciones?, discrepancia?, defendible?, verificada? } }
data/ejes/<eje>/<tit>/practica.json       { <leccionId>: [ids] }   preguntas de práctica de cada clase, para este eje
data/ejes/<eje>/<tit>/resueltos.json      { <leccionId>: regla }   preguntas resueltas por la app que ilustran una clase de carta (opcional)
data/ejes/<eje>/img/                      figuras de preguntas (rutas relativas a data/ejes/<eje>/)
data/comun/mnemotecnias.json              reglas nemotécnicas (comunes; citan ids de preguntas de cualquier eje)
data/comun/vocabulario-<tit>.json         vocabulario para tocar en las preguntas (común)
src/bancos/ejes/<eje>.js                  código propio del eje: sus soluciones programadas de carta (opcional)
```

Las soluciones programadas de las preguntas de carta de Andalucía siguen en `src/exams/solutions/andalucia-*.js`
(contenido escrito para su banco y la carta L105, por id de pregunta); solo las importa `src/bancos/ejes/andalucia.js`.

### data/ejes/index.json

```json
{ "ejes": [ { "id": "andalucia", "prefijo": "and", "nombre": "Andalucía", "estado": "publicado" } ] }
```

`prefijo` es el comienzo de los ids de sus preguntas (`and-…`); no se repite entre ejes. `estado`: `borrador` |
`interno` | `publicado` (solo `publicado` se ofrece a los alumnos).

### data/ejes/<eje>/eje.json (ficha)

```json
{
  "id": "andalucia",
  "nombre": "Andalucía",
  "organismo": "Junta de Andalucía",
  "ambito": ["Andalucía"],
  "estado": "publicado",
  "prefijo": "and",
  "fuente": "https://www.juntadeandalucia.es/.../cuestionarios-examenes.html",
  "licencia": { "tipo": "CC BY 3.0", "cita": "Información obtenida del Portal de la Junta de Andalucía", "usoApp": "permitido", "url": "https://www.juntadeandalucia.es/informacion/legal.html" },
  "carta": "L105",
  "examen": { "per": {}, "py": { "reglas": ["Carta: 7 ejercicios sobre la carta del Estrecho, …"] } },
  "reserva": { "modo": "examen", "per": [], "py": [] },
  "listas": {
    "per": [
      { "id": "carta", "requiere": "carta", "titulo": "PER Andalucía · Carta de navegación", "descripcion": "…", "tarjeta": "Las {n} preguntas de carta (42–45) …" },
      { "id": "teoria", "sinRequiere": "carta", "titulo": "PER Andalucía · Teoría (preguntas 1–41)", "descripcion": "…" }
    ],
    "py": [ { "id": "todas", "titulo": "PY Andalucía · Examen teórico completo (40 preguntas)", "descripcion": "…" } ]
  },
  "legado": { "andalucia-per.json": { "tit": "per", "lista": "carta" } }
}
```

- `examen.<tit>`: qué titulaciones tiene el banco (sus claves) y las particularidades del tribunal sobre la
  estructura nacional (RD 875/2014, en `src/theory/blocks.js`). Vacío = estructura nacional tal cual. Claves:
  `reglas` (líneas que se añaden a «Reglas del examen»); más adelante, p. ej. `{ "calculadora": true }`,
  `{ "cuadernillos": 2 }`.
- `reserva`: claves `conv` reservadas como examen final (F1). `modo`: `examen` (se reservan convocatorias: no se
  ofrecen como examen de convocatoria, pero sus preguntas siguen en la práctica) | `pregunta` (además, sus
  preguntas —y las que aparecen también en ellas (`apareceEn`)— salen de toda la práctica).
- `listas` (opcional): listados de preguntas reales del eje por titulación, con página propia
  (`#/<tit>/examenes/<id>`). Filtro: `requiere` (las que lo requieren) y/o `sinRequiere` (las que no). `tarjeta`
  es el texto de su tarjeta en «Ejercicios de carta» (`{n}` = número de preguntas). Una lista de `id` `carta`
  hace que sus preguntas se puedan abrir resueltas en la carta aunque la app no traiga su solución programada.
  Sin listas, el eje tiene una implícita, `todas`.
- `legado` (opcional): ficheros de banco antiguos → `{ tit, lista }`, para que los enlaces viejos
  (`#/examenes/<fichero>[/<id>]`) sigan funcionando.

## Pregunta normalizada (`preguntas.json`)

```json
{ "meta": { "eje": "andalucia", "tit": "per", "titulo": "PER · Andalucía", "generado": "2026-10-07", "fuente": "…", "descripcion": "…" },
  "preguntas": [ {
    "id": "and-2022-c2-t05",
    "eje": "andalucia",
    "tit": "per",
    "conv": "and-2022-c2",
    "convocatoria": "2ª convocatoria 2022 (11 de junio de 2022)",
    "fecha": "2022-06-11",
    "numero": 5,
    "orden": 5,
    "modulo": null,
    "ut": 2,
    "ut_titulo": "Elementos de amarre y fondeo",
    "bloque": null,
    "enunciado": "…",
    "opciones": { "a": "…", "b": "…", "c": "…", "d": "…" },
    "correcta": "c",
    "aceptadas": ["c"],
    "anulada": false,
    "requiere": [],
    "figuras": [],
    "contexto": null,
    "tabla_mareas": null,
    "apareceEn": [ { "conv": "and-2022-c2", "modelo": "A", "numero": 5 }, { "conv": "and-2022-c2", "modelo": "B", "numero": 7 } ],
    "fuentes": { "examen": "https://…pdf", "plantilla": "https://…pdf", "pagina": "https://…html", "correccion": null },
    "norma": { "estado": "vigente" },
    "concepto": null,
    "notas": ""
  } ] }
```

El fichero lleva una pregunta por línea (legible y con diferencias limpias en git).

Reglas:

- **ids**: los de Andalucía NO cambian (`and-YYYY-cN-tNN` teoría PER, `and-YYYY-cN-qNN` carta PER,
  `and-py-YYYY-cN-gNN|nNN` PY). Ejes nuevos: `<prefijo>-<tit>-<conv>-<NN>`, p. ej. `dgmm-per-2025-11-07` (la
  convocatoria/modelo de la primera aparición). Un id nunca se reutiliza ni cambia una vez publicado: el progreso
  de los alumnos (respuestas, repaso) va por id. La app no deduce nada del id: ni la convocatoria, ni si es de
  carta, ni la titulación.
- **conv**: clave de convocatoria (exámenes reales, `#/<tit>/test/real/<conv>`). Andalucía conserva las de antes
  (`and-2023-c1`, `and-py-2023-c1`) porque el progreso guardado (`tests[].conv`, `testEnCurso.conv`) las usa.
  Ejes nuevos: `<prefijo>-<tit>-AAAA-MM` (p. ej. `dgmm-per-2025-11`).
- **correcta**: letra, o `null` si `anulada`. **aceptadas**: todas las letras que el tribunal da por buenas
  (normalmente `[correcta]`; varias cuando se aceptan dos; `[]` si anulada).
- **requiere**: `"carta"` (pregunta que se resuelve sobre la carta del eje), `"anuario"` (necesita una tabla o
  extracto del anuario de mareas que no viene en la pregunta). Sustituye a deducirlo del id (`-qNN`) o de `bloque`.
- **orden**: posición en el examen real (PER: 1–45; PY Andalucía: 1–40 en el orden del cuadernillo). El examen de
  una convocatoria se ordena por `orden`. **numero**: el número impreso en el cuadernillo. **modulo**: `generico` |
  `navegacion` | null. **bloque** (PY): `carta` | `mareas` | `loxodromica` | null.
- **ut**: tema de la estructura nacional de la titulación (`TITULACIONES[tit].estructura.bloques`).
- **figuras**: rutas relativas a `data/ejes/<eje>/` (p. ej. `img/and-2020-c1-t29.png`); la app las sirve con
  `urlFigura(q, f)`.
- **contexto** / **tabla_mareas**: texto común y tabla del anuario que acompañan a una pregunta (mareas del PY).
- **norma.estado**: `vigente` | `revisar` (pendiente) | `actualizada` (la respuesta oficial era correcta con la
  norma de su fecha y la explicación lo dice; incluye `nota`) | `retirada` (no se usa para estudiar: la respuesta
  ya no es correcta). Opcional: `normas: ["RD 339/2021"]`, `nota`.
- **apareceEn**: todas las apariciones de la misma pregunta (modelos barajados, islas, convocatorias que la
  repiten). En el PER de Andalucía, modelos A y B; en el PY, `modelo: null` y `numero` = `orden`.
- **concepto**: agrupación para reutilizar explicaciones entre preguntas equivalentes (opcional).
- Campos ausentes en un eje → `null` / `[]`, nunca se omiten las claves de la lista anterior.

### Otros ficheros del eje

- `explicaciones.json`: la del profe para cada pregunta que no es de carta (las de carta se explican con su
  resolución programada, si la tienen).
- `practica.json`: `{ <leccionId>: [ids] }`. Las clases son las del curso nacional (`data/curso/<tit>.json`), que
  ya no llevan `practica`: el motor se la pone a cada clase con la del eje (`cargarCurso`).
- `resueltos.json`: `{ <leccionId>: { ids } | { ejercicios, excepto? } }`. `ids`: lista exacta; si no, las
  preguntas con solución programada del tipo de ejercicio (`ejercicios`) salvo `excepto`.

## Motor (src/bancos)

Solo `src/bancos/` (y el código propio de cada eje en `src/bancos/ejes/<eje>.js`) sabe dónde y cómo están
guardados los bancos. El resto de la app no nombra ningún banco ni ningún eje concretos
(`tests/bancos.test.js` lo comprueba buscando en `src/`).

`src/bancos/index.js`:

- `crearBancos(leer)` → el motor sobre una función que lee un JSON por su ruta relativa a la raíz de la app. En la
  app se usa `bancos` (con `fetch`); en Node, `bancosNode()` de `tools/bancos/leer.mjs` (con el disco). Todas las
  cargas se cachean (una promesa por fichero). Funciones (también exportadas sueltas, las de la app):
  - `registro()` → ejes de `data/ejes/index.json`; `ejesPublicados()`; `resolverEje(eje)` → el eje si existe o el
    de por defecto.
  - `cargarFicha(eje)` → la ficha (`eje.json`).
  - `cargarBanco(eje, tit)` → el banco (un eje que no existe cae en el de por defecto):
    - `eje` (la ficha), `tit`, `meta`
    - `todas`: todas sus preguntas; `porId`: `Map` id → pregunta
    - `estudio`: las que se usan para estudiar (tandas, repasos, simulacros, exámenes de convocatorias, motor de
      seguimiento); `final`: las reservadas para el examen final. Salen de `ficha.reserva` (en F0, sin reserva:
      `estudio === todas` y `final = []`).
    - `convocatorias()` → `[{ key, titulo, fecha, n, completa }]` (más recientes primero; sin las reservadas)
    - `explicaciones`, `reglasDe(id)` (reglas nemotécnicas), `vocab`
    - `practicaDe(leccionId)` → ids de práctica de la clase (solo de `estudio`); `resueltasDe(leccionId)` → ids
      de preguntas resueltas por la app del tipo de la clase
    - `listas`, `lista(id)` → `{ id, titulo, descripcion, tarjeta?, preguntas }`; `listaDe(q)` → la lista de una
      pregunta (la primera que la incluye)
  - `cargarCurso(tit, eje)` → el curso nacional con la práctica del eje en cada clase (`leccion.practica`);
    `cargarCursoBase(tit)` → el curso tal cual.
  - `pregunta(id)` → `{ q, banco }` de cualquier eje (por su prefijo), o `null`.
  - `resolverLegado(fichero)` → `{ eje, tit, lista }` de un fichero de banco antiguo.
  - `rutaResolucion(q)` → `['q', id]` si la pregunta se puede ver resuelta, o `null` (síncrona: la pregunta viene
    de un banco ya cargado).
  - `cargarMnemotecnias()`, `cargarVocabulario(tit)` (comunes).
- `cursoConPractica(curso, banco)` (pura), `urlFigura(q, f)`, `SOLUCIONES`, `EJE_POR_DEFECTO`.

`src/bancos/soluciones.js`: `SOLUCIONES` (id → `{ ejercicio?, sinCarta?, solve(kit, q) }`) de todos los ejes
registrados en él, y `solucionDe(id)`. `src/bancos/registro.js`: `EJE_POR_DEFECTO` (sin dependencias; lo usa
también el almacén del progreso).

En la interfaz, `currentEje(progress)` / `setEje(progress, eje)` (`src/ui/titulacion.js`) leen y guardan el eje
en los ajustes (`settings.eje`), como la titulación. Los módulos puros del curso (`motor`, `plan`, `listo`,
`repaso`, `calendario`) no saben de ejes: reciben las preguntas (`banco.estudio`) y el curso con su práctica.

### Rutas

- `#/q/<id>[?l=<lista>]`: una pregunta real (de cualquier eje), para resolverla y verla resuelta en la carta;
  «anterior/siguiente» recorren su lista (`l`, o la suya por defecto).
- `#/<tit>/examenes/<lista>`: una lista del eje activo (p. ej. `#/per/examenes/carta`).
- Direcciones antiguas: `#/examenes/<fichero>[/<id>]` y `#/<tit>/examenes/<fichero>[/<id>]` redirigen a las
  nuevas (por el `legado` de la ficha).

### Progreso

`settings.eje` (por defecto, el eje por defecto); cada test hecho (`tests[]`) y el examen a medias
(`testEnCurso`) llevan `eje`. El examen a medias guarda también sus preguntas en orden (`ids`) y se rehace con
ellas (sin `ids`, los antiguos se rehacen con su semilla o su convocatoria y quedan guardados con `ids`). Todo
progreso anterior a los ejes es del eje por defecto (`normaliza()` en `src/store/progress.js`).

## Cómo añadir un eje

1. Extrae sus exámenes al formato normalizado (F2: `tools/bancos/`): `data/ejes/<eje>/<tit>/preguntas.json`
   con ids `<prefijo>-<tit>-<conv>-<NN>` y `conv` `<prefijo>-<tit>-AAAA-MM`, y sus figuras en
   `data/ejes/<eje>/img/`.
2. Escribe su ficha `data/ejes/<eje>/eje.json` (organismo, fuente, licencia, carta, particularidades del examen,
   reserva y, si hace falta, listas) y añádelo a `data/ejes/index.json` con `estado: "borrador"`.
3. Explicaciones del profe (`explicaciones.json`) para cada pregunta que no es de carta, y la práctica de cada
   clase (`practica.json`): las clases son las nacionales; cada una lleva preguntas del eje sobre lo que explica.
4. Opcional: soluciones programadas de sus preguntas de carta en `src/bancos/ejes/<eje>.js` (registrado en
   `src/bancos/soluciones.js`) y `resueltos.json` para las clases de carta.
5. `npm test`: `tests/bancos.test.js` valida todos sus ficheros contra este contrato. Cuando esté revisado,
   `estado: "publicado"`. Después, `git add` y `npm run precache`.

## Migración de Andalucía (F0)

`tools/bancos/migrar-andalucia.mjs` (único, reproducible) convirtió los bancos antiguos (`data/exams/andalucia-*.json`,
leídos del commit anterior con `git show`) a este formato y sacó la práctica de las clases a `practica.json`.
Escribe también `tools/bancos/andalucia-huella.json`, la huella de cada pregunta antigua (enunciado, opciones,
correcta, anulada y tema), con la que `tests/bancos.test.js` comprueba que ninguna ha cambiado. Cambios de forma:
las de carta del PER llevan `ut: 11` y `requiere: ["carta"]` en el dato (antes los ponía el cargador o se deducían
del id); las del PY, `tit` (antes no lo llevaban); `fuentes` reúne `fuente_examen`, `fuente_plantilla` y
`pagina_convocatoria`, y la página de cada convocatoria del PER se da también a sus preguntas de teoría.
Las del PER de la 2ª convocatoria de 2025 citan como examen `2025/07/2025_1-C_PER_modelo_A.pdf`: no es un error
de los datos, es el nombre con que la Junta publicó ese cuadernillo en la página de esa convocatoria.
