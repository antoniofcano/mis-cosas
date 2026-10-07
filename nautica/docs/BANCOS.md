# Bancos de preguntas por eje

Un **eje** es una administración examinadora (andalucia, dgmm, baleares, murcia…). Cada eje tiene su banco
independiente de preguntas reales de examen; nunca se mezclan. El curso (las clases) es nacional y único: lo que
cambia de un eje a otro son las preguntas, sus explicaciones, la práctica de cada clase y las particularidades
de su tribunal.

Este documento es el contrato entre el proceso de extracción (`tools/bancos/`, fase F2) y la app (`src/bancos/`,
fase F0). **Andalucía** es el eje por defecto (`src/bancos/registro.js`); el registro (`data/ejes/index.json`) dice
qué otros ejes hay y en qué estado.

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
  `reglas` (líneas que se añaden a «Reglas del examen»); `calculadora` (true/false: si en el examen se permite la
  calculadora científica; la app la enseña en el simulacro solo si es true; `calculadoraFuente`, de dónde sale); más adelante, p. ej.
  `{ "cuadernillos": 2 }`.
- `reserva`: claves `conv` reservadas para el examen final (F1). Lo reservado no se estudia por ninguna puerta
  (clases, tandas, repaso, mezcla, «5 minutos», simulacros, listas, pausas del podcast; `tests/reserva.test.js`) ni se cita en ningún contenido (cuarentena, más abajo).
  `modo`: `examen` (se reservan convocatorias: no se ofrecen como examen de convocatoria y el examen final es una de
  ellas entera; salen del estudio las preguntas que solo aparecen en convocatorias reservadas —una que también salió en
  otra convocatoria ya es pública—) | `pregunta` (salen del estudio todas las que aparecen en ellas, también por
  `apareceEn`, y el examen final se arma con el reparto oficial por temas). Andalucía y DGMM: `examen`; Baleares:
  `pregunta`.
- **Reserva por alumno**: la primera vez que un alumno carga un eje y una titulación, la app guarda la foto de la
  reserva en sus ajustes (`reserva_<eje>_<tit>` = `{ convs, modo, desde }`, con `fijarReservaAlumno`). Su examen final
  sale siempre de esa foto; si los datos cambian la reserva, se apartan del estudio las de la foto y las de la ficha.
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
    - `reservadas`: `Set` de ids que no se estudian por ser del examen final (ver `reserva`).
    - `examenes`: las de los exámenes de convocatorias (todas menos las reservadas; las retiradas siguen y se corrigen
      como anuladas, con su nota en la revisión).
    - `estudio`: las que se usan para estudiar (práctica, tandas, repaso, mezcla, «5 minutos», simulacros, pausas del
      podcast, motor de seguimiento): `examenes` sin las retiradas.
    - `final`: las preguntas de las convocatorias del examen final del alumno (sin retiradas); `reserva` =
      `{ modo, convs, datos, examenes: [{ key, titulo, fecha, n, completa, ids }] }`.
    - `convocatorias()` → `[{ key, titulo, fecha, n, completa }]` (más recientes primero; sin las reservadas)
    - `explicaciones`, `reglasDe(id)` (reglas nemotécnicas), `vocab`
    - `practicaDe(leccionId)` → ids de práctica de la clase (solo de `estudio`); `resueltasDe(leccionId)` → ids
      de preguntas resueltas por la app del tipo de la clase (las dos, solo del estudio)
    - `listas`, `lista(id)` → `{ id, titulo, descripcion, tarjeta?, preguntas }` (sin las reservadas); `listaDe(q)` → la
      lista de una pregunta (la primera que la incluye)
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
`repaso`, `calendario`) no saben de ejes: reciben las preguntas (`banco.estudio`) y el curso con su práctica; el
motor recibe además `reserva`, `pool` (`banco.final`) y `reservadas` para el examen final (`src/course/final.js`).

### Examen final (F1)

- `src/course/final.js` (puro, lo llama el motor: `st.final`): cerrado hasta que «¿Estás listo?» dice `listo` (y
  entonces dice qué falta con sus números); abierto, propone una convocatoria reservada que el alumno no haya visto
  (vista = hecha como examen o con al menos el 20 % de sus preguntas respondidas). Si las ha visto todas, lo dice: ya
  no es inédito. «Preparado» = el último examen final aprobado con margen (`estructura.margen` en
  `src/theory/blocks.js`: PER 36 aciertos, RIPA ≤ 3, balizamiento ≤ 1, carta ≤ 1; PY 32, carta ≤ 1, teoría ≤ 3).
  `planHoy` lo propone cuando estás listo, quedan 21 días o menos y aún no estás preparado.
- `buildFinal` (`src/theory/engine.js`): la convocatoria entera (una retirada se cambia por otra reservada del mismo
  tema) o, en modo `pregunta`, el reparto oficial por temas con las reservadas, primero las no vistas. Ruta
  `#/<tit>/test/final`; se guarda como `tests[]` con `tipo: 'final'` y `conv`.
- En el examen (simulacro, real y final) la vista marca `document.body.dataset.modoExamen` (`src/ui/modo-examen.js`) y
  la calculadora sigue la regla de la ficha (`examen.<tit>.calculadora`).
- «¿Estás listo?» (`src/course/listo.js`) pesa más los exámenes inéditos: el final cuenta 3 y un simulacro o examen
  real con al menos el 60 % de preguntas nuevas (`nuevas`, guardado al empezar), 2. El simulacro elige primero las
  preguntas no vistas sin cambiar el reparto oficial y avisa cuando ya has visto el 70 % del estudio.

### Cuarentena

Lo reservado para el examen final no se cita en ningún contenido (detalle, inventario y plan del audio en
docs/CUARENTENA.md):

- **Regla**: ningún fichero servido (`index.html`, `src/`, `data/`) ni ninguna fuente del audio del podcast
  (`podcast/episodios.json`, guiones) nombra una pregunta reservada de ningún eje ni titulación, ni por su id ni leyendo
  su enunciado casi literal. Solo pueden nombrarla sus propios datos (su fila del banco, su explicación, sus
  conceptos, su solución programada, su figura) y los metadatos que solo se usan cuando ella sale (las reglas
  nemotécnicas que la ayudan, el `excepto` de los resueltos). Práctica, resueltos, clases, mapas, chuleta, reglas,
  explicaciones de otras preguntas y ejemplos usan una equivalente del estudio del mismo eje.
- **Comprobación**: `tools/cuarentena.mjs` hace el inventario y `tests/cuarentena.test.js` falla con cualquier cita
  nueva. La única excepción es la **deuda del audio** (`tools/cuarentena-deuda.json`): pausas y minijuegos de episodios
  ya grabados que leen una reservada; no puede crecer y cada entrada se quita al regrabar su episodio. Los falsos
  positivos revisados a mano van en `permitidas`, con su motivo.
- **Cuando cambie la reserva** (una convocatoria nueva entra en el examen final): el test señala las citas nuevas;
  `node tools/cuarentena.mjs --arreglar` quita las reservadas de la práctica (con su equivalente cuando la hay), de los
  resueltos y de las fuentes de verificación de las clases; los guiones sin audio se reescriben a mano.
- **En la app**: la pausa del podcast cuya pregunta es reservada para el examen final del alumno enseña su equivalente
  del estudio o, si no la hay, queda sin pregunta con un aviso discreto; hecho su examen final de ese eje y titulación,
  enseña la del guion (`equivalente(id, eje, { finalHecho })`). Si el audio del episodio lee una reservada
  (`reservadaDe(id, eje)` sobre las `preguntas` del episodio), la ficha avisa antes de escucharlo, sin bloquear.

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
   con ids `<prefijo>-<tit>-AAAA-MM-NN` (`"ids": "conv-nn"` en su config) y `conv` `<prefijo>-<tit>-AAAA-MM`, y sus
   figuras en `data/ejes/<eje>/img/`.
2. Escribe su ficha `data/ejes/<eje>/eje.json` (organismo, fuente, licencia, carta, particularidades del examen,
   reserva y, si hace falta, listas) y añádelo a `data/ejes/index.json` con `estado: "borrador"`.
3. Explicaciones del profe (`explicaciones.json`) para cada pregunta que no es de carta, y la práctica de cada
   clase (`practica.json`): las clases son las nacionales; cada una lleva preguntas del eje sobre lo que explica.
4. Opcional: soluciones programadas de sus preguntas de carta en `src/bancos/ejes/<eje>.js` (registrado en
   `src/bancos/soluciones.js`) y `resueltos.json` para las clases de carta.
5. `npm test`: `tests/bancos.test.js` valida todos sus ficheros contra este contrato. Cuando esté revisado,
   `estado: "publicado"`. Después, `git add` y `npm run precache`.

## Convenciones de los ejes nuevos

- **Ids congelados**: una vez publicado, un id no cambia. `escribir` es de solo añadir: casa cada pregunta extraída
  con la publicada por su aparición o por su texto, conserva las publicadas que ya no se extraen y su `concepto`, y
  numera las nuevas a continuación (`tools/bancos/lib/ids.mjs`).
- **Juegos de un examen**: si una convocatoria tiene varios juegos de preguntas distintos (PER completo, liberado,
  PNB…), la clave de su examen es `<conv>@<modelo>` (p. ej. `dgmm-per-2021-10@T05`) y el examen se arma con el
  orden de `apareceEn`, también con preguntas que vienen de otra convocatoria (`convocatorias()` y `buildReal` en
  `src/theory/engine.js`). Las permutaciones de un mismo juego (T01/T03…) se juntan en una pregunta con `apareceEn`.
- **Ajustes por id** (`tools/bancos/ejes/<eje>/ajustes.json`): `{ <tit>: { <id>: { norma: { estado, nota } } } }`.
  Es el sitio de la revisión normativa hecha a mano (`vigente` | `actualizada` | `retirada`); la etapa `normativa`
  la aplica y el informe la resume. Las `retirada` salen del estudio y del examen final, pero siguen en los exámenes
  de convocatorias (se corrigen como anuladas y la revisión lo dice). Andalucía (banco migrado; desde la fase F5 sus
  convocatorias de 2015–2019 entran por la etapa escribir, que solo añade): su
  revisión de F1 está en `tools/bancos/ejes/andalucia/ajustes.json`, cada pregunta con `revision.motivos`
  (`{ norma, motivo, fuente }`), y la escribe y aplica `tools/bancos/ejes/andalucia/revision-normativa.mjs --escribir`
  (pone `norma` en el banco y, en las `actualizada`, la nota en la explicación tras su primera frase).
- **Explicaciones** (`tools/bancos/explicaciones.mjs`): `lote` saca lotes de preguntas con sus 3 candidatas más
  parecidas del eje de referencia (Andalucía), `revisar` comprueba una explicación y `fusionar` reúne los lotes en
  `explicaciones.json` y pone en cada pregunta su `concepto` = el id de la pregunta de Andalucía cuya explicación se
  adaptó. `src/bancos/equivalentes.js` usa ese `concepto` (y, si no, el parecido del texto en el mismo tema) para
  buscar la pregunta equivalente de otro eje (`equivalente(id, eje)` del motor: las pausas del podcast).
- **Práctica** (`tools/bancos/practica.mjs <eje> [--escribir]`): propone `practica.json` con la práctica de
  Andalucía como guía (concepto, vecinas, reglas del RIPA citadas, palabras propias de la clase y tipo de ejercicio
  de las de carta) y avisa de las clases que no llegan a las preguntas de su homóloga.
- **Soluciones de carta**: el módulo de cada eje (`src/bancos/ejes/<eje>.js`) exporta `{ id, soluciones,
  documentadas }`. `documentadas` = las de carta que no se resuelven, con su motivo: `{ tipo: 'discrepancia' |
  'sin-calculo', texto }`.
- **Puertas de calidad** (`tools/bancos/puertas.mjs <eje>`): lo que tiene que cumplir un eje para publicarse
  (explicación para toda pregunta que no es de carta, solución o motivo documentado para toda la de carta, práctica
  en cada clase, revisión normativa hecha, licencia citada). `tests/bancos.test.js` las exige a todo eje
  `publicado`.
- **Elegir eje**: `ejesParaElegir()` = los publicados; con más de uno, la bienvenida pregunta «¿Dónde te
  examinas?» y Ajustes ofrece cambiarlo (`src/ui/eje.js`). Cambiar de eje conserva el progreso; la fecha de
  examen es por titulación.

## Andalucía 2015–2019 (F5)

Las 16 convocatorias de 2015–2019 entran en el banco vivo por el proceso de extracción (`config.publicadas =
"conservar"`, docs/EXTRACCION.md): ids `and-AAAA-cN-tNN|qNN` y `and-py-AAAA-cN-gNN|nNN` (`and-py-2018-c1b-…` para el modelo
B del PY de la 1ª de 2018, otro examen). Las 1530 publicadas no cambian (`tools/bancos/andalucia-huella.json`); las
nuevas tienen su huella en `tools/bancos/andalucia-huella-2015-2019.json` (`ejes/andalucia/huella.mjs`). Una pregunta
idéntica a otra ya publicada no se duplica: es la misma pregunta con otra aparición en `apareceEn`, y el examen de su
convocatoria la incluye en su número (`ordenEn`). Las explicaciones salen de los lotes de
`tools/bancos/ejes/andalucia/explicaciones/` (`ejes/andalucia/explicaciones.mjs fusionar`; `concepto` = la pregunta del
mismo tribunal cuya explicación se adaptó) y la revisión normativa, de `revision-normativa.mjs` (bloque F5). La práctica
se amplía sin tocar la que ya había: `node tools/bancos/practica.mjs andalucia --ampliar --escribir`.

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
