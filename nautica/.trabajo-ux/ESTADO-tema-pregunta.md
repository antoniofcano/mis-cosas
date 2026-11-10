# Estado: preguntas en el tema equivocado («¿No es de este tema?»)

10 de noviembre de 2026. Rama `worktree-agent-a3c1df9b3fee74123`. Sin push ni PR.

## Qué pasaba

El tema (`ut`) de cada pregunta es el **bloque del examen oficial en que salió** (por su número; etapa `clasificar` de
`tools/bancos`). Comprobado: en los seis bancos, el número de cada aparición cae en el bloque de su `ut` (21 632
apariciones), salvo 5 preguntas del PER de Baleares que el propio tribunal repitió en bloques distintos. Así que lo que
el alumno ve «fuera de sitio» son sobre todo dos cosas: preguntas que el tribunal puso en un bloque que no es el que su
contenido sugiere, y preguntas que `practica.json` asigna a una clase de otro tema (230 en total; 119 en el PER de Baleares).

## Parte 1 · Auditoría

`node tools/auditoria-temas.mjs [--detalle|--json|--escribir]` (no cambia datos). Informe completo en
`.trabajo-ux/AUDITORIA-temas.md`. Cuatro señales: `posicion` (el tribunal la puso en bloques distintos), `concepto`
(las demás preguntas de su idea, o las clases donde se enseña, son de otro tema), `practica` (sale en la práctica de una
clase de otro tema) y `vocabulario` (clasificador bayesiano entrenado con el resto de la titulación). «Fuerte» = la
posición mayoritaria es otro bloque, o dos señales distintas proponen el mismo tema.

| Eje | Tit. | Preguntas | Candidatas | Fuertes | posición | concepto | práctica | vocabulario |
|---|---|---|---|---|---|---|---|---|
| andalucia | per | 1499 | 17 | 3 | 0 | 8 | 6 | 6 |
| andalucia | py | 1329 | 29 | 0 | 0 | 2 | 27 | 0 |
| dgmm | per | 1950 | 72 | 5 | 0 | 30 | 26 | 21 |
| dgmm | py | 555 | 20 | 1 | 0 | 2 | 17 | 2 |
| baleares | per | 3573 | 208 | 79 | 5 | 129 | 119 | 82 |
| baleares | py | 1191 | 38 | 3 | 0 | 6 | 35 | 0 |

Total: 384 candidatas (91 fuertes) de 10 097. Las reservadas para el examen final van en el informe sin enunciado ni
nombre de su idea. La señal de vocabulario tiene ruido (es para mirar, no para decidir).

### Corregida en el banco (una, la única inequívoca)

`bal-per-2017-03-b-25` («Si vemos un faro de color verde y de golpe, cambia a color rojo…»):

- Antes: `ut: 6`, «Reglamento de abordajes (RIPA)»; práctica en `per-6-7`.
- Después: `ut: 10`, «Teoría de navegación»; práctica en `per-10-4`.
- Prueba: el tribunal la puso 4 de 5 veces en el bloque de Teoría de navegación (números 40, 37, 37 y 37; solo la
  primera, la 25, cae en el RIPA); su idea (`nav.luces.alcance-sectores`) tiene sus otras 4 preguntas en el tema 10; y su
  explicación habla de una luz de sectores, no del RIPA.
- Dónde: `data/ejes/baleares/per/preguntas.json`, `practica.json`, y el ajuste por id en
  `tools/bancos/ejes/baleares/ajustes.json` (`ut`, `ut_titulo`: campos de ajuste que ya admite el proceso) más la línea de
  `practica-informe.json`. Efecto lateral: el examen real de marzo de 2017 (modelo B) cuenta esa pregunta en Teoría de
  navegación y no en RIPA; los otros cuatro exámenes en que sale pasan a contarla bien.

Las demás se quedan como candidatas. La más clara de las que no he tocado: `bal-per-2017-03-ci-38` (una cardinal; el
tribunal la puso 6 veces en Teoría de navegación y 4 en Balizamiento; su idea es de balizamiento). No la cambio porque
la posición mayoritaria es la actual y es una pregunta reservada.

## Parte 2 · El mecanismo

- **Acción**: «¿No es de este tema?» bajo la explicación del profe, junto a «Avisar de un error» (tandas, mezcla, repaso,
  «5 minutos», práctica de las clases, `#/q/<id>` y revisión de un examen terminado). Abre un diálogo con los temas de la
  titulación y, opcional, la clase. Nunca durante un examen en curso ni antes de responder.
- **Qué cambia** (al momento, solo para ese alumno): `banco.estudio`, `banco.practica`, `banco.porId` y
  `practicaDe(clase)` de la vista del banco que devuelve `cargarBanco`: tandas por tema, «Mis fallos», Temario, mezcla,
  repaso, plan, «¿Estás listo?» y práctica de las clases.
- **Qué no cambia**: los ficheros del banco y el banco en memoria; los exámenes de convocatoria, el examen final y los
  **simulacros** (se arman y corrigen con el tema oficial, `banco.oficial`); la idea (concepto) de la pregunta y los
  faros; las respuestas guardadas.
- **Ver y deshacer**: Ajustes → «Mis correcciones».
- **Sincronización**: valor con nombre (`v`) de la colección `settings` con clave `corr.<id>`; se pliega en
  `progreso.correcciones`; gana el último por pregunta; deshacer es una operación sin valor. **El servidor no necesita
  cambios ni redespliegue** (ver «Decisión» abajo).
- **Al autor**: tras corregir y desde «Mis correcciones», «Avisar al autor» (incidencia de GitHub ya escrita: id, eje,
  titulación, tema actual, propuesto y clase; sin enunciado) y «Copiar el aviso».

### Decisión sobre el servidor

`sync-worker/src/servidor.js` valida cada operación con `validarOperacion` de `nautica/src/store/sync/operaciones.js`,
empaquetada al desplegar. Un tipo o una colección nuevos no exigirían tocar el código del Worker, pero el Worker **ya
desplegado** los rechazaría (`coleccion`) y el cliente no reintenta las rechazadas: se perdería la sincronización de lo
corregido antes de redesplegar. Por eso la corrección viaja como una clave de `settings`, que la validación actual
acepta (comprobado ejecutando la validación de `HEAD` sobre la operación). No he tocado `sync-worker/`.

## Ficheros

Nuevos: `src/bancos/correcciones.js`, `src/ui/tema-pregunta.js`, `tools/auditoria-temas.mjs`,
`tests/correcciones-tema.test.js`, `.trabajo-ux/AUDITORIA-temas.md`, este fichero.
Cambiados: `src/bancos/index.js`, `src/store/progress.js`, `src/store/sync/operaciones.js`, `src/store/sync/plegar.js`,
`src/ui/app.js`, `src/ui/views/theory.js`, `src/ui/views/exams.js`, `src/ui/views/mas.js`, `styles/app.css`,
`docs/SYNC.md`, `docs/BANCOS.md`, `docs/ARCHITECTURE.md`, `tests/listo.test.js`, `sw.js`, `sw-lista.js`, y los cuatro
de datos de la corrección de arriba.

`tests/listo.test.js`: el test «repaso mezclado…» fallaba ya sin mis cambios porque usaba el reloj de verdad (respuestas
fechadas el 1 de octubre de 2026; el peso de las acertadas crece con los días). Le he fijado la fecha.

## Comprobado

- `npm test`: 2211 tests, 2206 pasan, 0 fallan, 5 saltados (los de siempre). Tests de `sync-worker` (servidor, avisos,
  webpush): 36 de 36.
- Navegador (Chromium con Playwright, servidor local, sin salir a la red): corregir en una tanda, que deja de salir en el
  tema de antes y sale en el nuevo, «Mis correcciones», deshacer, y que en un examen en curso no hay acción (y sí en su
  revisión). 109 comprobaciones en 360 y 990 px, claro y oscuro; la de 360 claro con movimiento, las otras tres con
  «reducir movimiento». Capturas en
  `/tmp/claude-0/-home-user-mis-cosas/1ed25e87-cf04-586d-9dc7-3c5b3383751a/scratchpad/tema-pregunta/`.

## Sin comprobar o pendiente

- La sincronización contra el Worker **desplegado** de verdad (solo contra su código en Node con D1 en memoria, y contra
  la validación de `HEAD`). Si lo desplegado no es `HEAD`, no lo sé.
- Móviles reales, lector de pantalla y Safari: no probados. El diálogo es un `<dialog>` nativo (`showModal`).
- «Avisar al autor»: he comprobado la dirección y el texto, no he abierto GitHub. Exige cuenta de GitHub; sin cuenta
  solo queda «Copiar el aviso». Un envío sin cuenta necesitaría un servicio nuevo.
- Una app sin actualizar que reciba correcciones las guarda como un ajuste `corr.<id>` que no usa: razonado sobre el
  código, sin test.
- El aviso «AbortError: Transition was skipped» sale una vez en la consola al navegar deprisa en el arranque (en `#/per`,
  antes de tocar nada de esto). No he comprobado si sale también sin mis cambios.
- `tools/bancos/informes/baleares.md` (informe generado) sigue diciendo `ut 6` para la pregunta corregida: no lo he
  regenerado (necesita las etapas de extracción).
- Las otras 383 candidatas, y en particular las 230 de `practica.json` con clase de otro tema, esperan decisión.
- El minijuego del podcast no ofrece la acción (no usa el panel del profe).

---

# Segunda parte: la práctica de cada clase, solo con preguntas de su tema

10 de noviembre de 2026, segundo commit de la rama. Decisión del dueño: corregir las ~230 preguntas que `practica.json`
asignaba a la clase de otro tema.

## Causa

No era un fallo accidental: los generadores lo hacían a propósito.

- `tools/bancos/ejes/baleares/practica.mjs`: «si una clase de otro tema puntúa más del doble [por contenido], la pregunta
  va a esa clase» (incendios o primeros auxilios que el tribunal pone en el bloque de seguridad…), y las mareas con
  anuario del bloque de carta iban a la clase de mareas del tema anterior (`per-10-8`, `py-3-6`).
- `tools/bancos/practica.mjs` (DGMM y la ampliación de Andalucía): las de la unidad de carta que no se hacen sobre la
  carta (mareas, estima analítica) «pueden ir también a las clases de la teoría de navegación».
- Andalucía: práctica revisada a mano que ponía la misma pregunta en dos clases (la de su tema y otra), más
  `practica-extra.json` (la bandera «A» del RIPA en la clase de buzos).

Los dos generadores eligen ahora solo entre las clases del tema y terminan con `recolocar`
(`tools/bancos/lib/practica-tema.mjs`). Comprobado: ejecutados los tres (DGMM, Baleares, Andalucía `--ampliar`), el
resultado pasa `tests/practica-tema.test.js` (0 fuera de tema). **No he dejado su salida**: regenerar del todo no
reproduce la práctica publicada ni antes de mi cambio (cambia cientos de asignaciones que no tienen que ver, porque los
textos de las clases y las explicaciones han cambiado desde que se generó). Los `practica.json` se han corregido con la
herramienta dirigida `node tools/bancos/practica-tema.mjs --excepciones --escribir`, que es reproducible.

## Qué se hizo con las 230

| Eje | Tit. | Quitadas (ya estaban en una clase de su tema) | A la clase de su tema, por idea | Fuera de las clases (solo en su tema) | Excepción «tema-dudoso» | Excepción «clase-corta» |
|---|---|---|---|---|---|---|
| andalucia | per | 4 | 0 | 0 | 0 | 2 |
| andalucia | py | 14 | 0 | 0 | 0 | 13 |
| dgmm | per | 2 | 24 | 0 | 0 | 0 |
| dgmm | py | 15 | 2 | 0 | 0 | 0 |
| baleares | per | 0 | 43 | 24 | 51 | 1 |
| baleares | py | 0 | 0 | 0 | 3 | 32 (y además a `py-4-9`) |
| Total | | 35 | 69 | 24 | 54 | 48 |

Ninguna salió por «parecido» ni por «hermanas». Detalle de cada una en `.trabajo-ux/PRACTICA-temas.md`.

- **tema-dudoso (54)**: su idea vive en el tema de la clase donde está (al menos 4 hermanas y el 80 % allí): lo dudoso
  es el `ut`. No se fuerzan a una clase que no las explica; siguen donde estaban y como candidatas de la auditoría.
- **clase-corta (48)**: la clase se quedaría con menos de 3 preguntas de su tema. Sobre todo `py-3-6` (el Anuario y la
  curva de marea): en Baleares **toda** su práctica (32) son mareas del bloque de carta, y sin ellas la clase no pasa las
  puertas de calidad; en Andalucía, 13. Y `per-4-3` de Andalucía (2, la bandera «A», revisión a mano anterior) y
  `per-7-8` de Baleares (1).
- **Fuera de las clases (24, PER de Baleares)**: ninguna clase de su tema enseña su idea (p. ej. las 9 de «peligro nuevo»
  que el tribunal pone en Teoría de navegación). Siguen en las tandas por tema, el repaso y los exámenes.

## Para revisar

- Las 24 mareas «sonda en la pleamar o la bajamar» del PER de DGMM (y 23 de Baleares) pasan de `per-10-8` Mareas a
  `per-11-1` La carta del Estrecho, porque el catálogo dice que esa idea se enseña también ahí. `per-11-1` de DGMM pasa
  de 8 a 31 preguntas y `per-10-8` de 37 a 13.
- Las excepciones «clase-corta» de `py-3-6` son en el fondo una decisión pendiente: o la clase es del tema 4, o se acepta
  que practica con preguntas del bloque de carta.

## Comprobado y sin comprobar (segunda parte)

- `npm test` y las puertas de calidad de los tres ejes: ver el informe de entrega.
- Informes derivados: `practica-informe.json` de Baleares y las cuentas de `informes/dgmm-practica.md`, puestos al día con
  `practica-tema.mjs --informes`. `informes/baleares.md` lo he corregido **a mano** (la fila de `bal-per-2017-03-b-25`, el
  párrafo y las cifras de la práctica): su generador necesita la caché de la extracción (`.cache/bancos`), que no está.
- No he mirado en el navegador las clases afectadas (el cambio es solo de datos y lo cubren los tests).
- Los criterios son automáticos: no he leído una a una las 128 recolocadas ni las 102 excepciones.
