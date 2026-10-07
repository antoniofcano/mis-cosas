<!-- Encargo de cada lote de soluciones de carta. Sustituye {TIT} (per|py), {AÑOS} (p. ej. 2015 y 2016) y {RAMA} = trabajo/and1519-carta-{lote}. -->

Repo: `nautica/` (app vanilla JS que prepara los exámenes de PER y Patrón de Yate). Rama de partida: `feat/andalucia-2015-2019`. Tu tarea: programar las soluciones de las preguntas de carta de Andalucía **{TIT} de {AÑOS}** con el kit de carta, en `nautica/src/exams/solutions/andalucia-{TIT}-<AÑO>.js` (un fichero por año, ya creados y registrados: exportan `default` = { id: solución } y `documentadas`).

## Qué preguntas
En `nautica/data/ejes/andalucia/{TIT}/preguntas.json`, las de esas convocatorias (`conv` and-AAAA-cN… / and-py-AAAA-cN…):
- PER: las 42–45 (`requiere: ["carta"]`, ids `…-qNN`).
- PY: las del módulo de navegación n11–n20 (UT 4): carta (`bloque: "carta"`), mareas con su tabla (`tabla_mareas`) y loxodrómicas/estima analítica (`bloque: "loxodromica"`), y las de la Polar o la corrección total sin carta. Las de mareas sin tabla (`requiere: ["anuario"]`: and-py-2016-c1-n19 y -n20) NO llevan solución (se explican con el método).
- Las anuladas (`anulada: true`) no llevan solución.

## Cómo
- Formato y kit: copia el estilo de `andalucia-per-0.js`…`-3.js` y `andalucia-py-2020.js`…`-2026.js` (mismos nombres de `ejercicio`: situacion-dos-demoras, estima-directa, rumbo-distancia, ct-enfilacion, rumbo-pasar-distancia, distancia-faro, corriente-efectiva, corriente-rumbo-a-dar, corriente-desconocida, abatimiento, demoras-no-simultaneas, situacion-demora-distancia, marea-sonda, estima-analitica). Funciones del kit en `src/exams/kit.js` (`ct`, `oposicion`, `enfilacion`, `fix2`, `tangent`, `rhumb`, `run`, `efectivo`, `rumboConCorriente`, `ctPolar`, `rumboDirecto`, `tramos`, `tramoMarea`, `horaUT`, `sondaA`, `horaParaSonda`…). Lugares: ids de la carta (`punta-europa`, `isla-tarifa`, `cabo-espartel`…; el «faro de Punta Camarinal» de los enunciados es `punta-gracia`). `k.note(...)` para explicar los pasos que no se ven (rumbos cuadrantales, signos que el enunciado no da…).
- Declinación «del año en curso» o «actualizada»: con la de la carta L105 (2°50′ W 2005, 7′ E anuales, como en andalucia-per-1.js) y el año de la convocatoria (`q.fecha`; las de 2015 no tienen fecha: año 2015). Si el enunciado da la declinación, esa.
- Las que no se dibujan en la carta (mareas, loxodrómica, Polar sin situación) llevan `sinCarta: true` (el test lo comprueba).
- `solve` devuelve los valores que se comparan con las opciones (`{ kind: 'lat'|'lon'|'bearing'|'signed'|'clock'|'speed'|'distance'|'meters', value }`), como en los ficheros existentes.
- Comprueba con `cd nautica && node --test tests/exams.test.js`: cada solución tiene que elegir la opción oficial **sin empate**; en el PY además con margen (la oficial gana con claridad). Nunca fuerces el resultado: la verdad es la matemática y la carta.
- Si un cálculo honrado no llega a la oficial (error del tribunal, dato imposible, situación fuera de la carta L105), NO la pongas en `default`: ponla en `documentadas` del mismo fichero: `{ tipo: 'discrepancia', texto: 'lo que da el cálculo (valores) frente a la oficial y por qué' }`; si no es un cálculo (se mira en la carta), `{ tipo: 'sin-calculo', texto }`. Cada pregunta de carta no anulada acaba en una de las dos.
- Solo tocas tus ficheros `andalucia-{TIT}-<AÑO>.js`. Si te falta algo del kit, escribe el ayudante dentro de tu fichero. Nunca subas PDF oficiales ni la carta escaneada.
- `git add`, commit y `git push -u origin {RAMA}` después de cada convocatoria (los tests de exams en verde). Sin PR. El mensaje de commit termina exactamente con:
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01113zJmsP4kFMhbEwqBp1dt
```

Al terminar, responde con: rama, último commit, cuántas resueltas, cuántas documentadas (ids y tipo) y cualquier problema del kit o de los datos (enunciado mal leído, opción rota…).
