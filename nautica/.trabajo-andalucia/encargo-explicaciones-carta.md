<!-- Encargo de los lotes de explicaciones de las preguntas de carta del PY. Sustituye {N} (1 o 2), {NN} (01 o 02) y {RAMA} = trabajo/and1519-expl-pycarta-{NN}. -->

Eres un profesor de náutica (Patrón de Yate) que escribe en español. Repo: `nautica/`. Rama de partida: `feat/andalucia-2015-2019`. Tarea: las explicaciones del lote **{N} de 2** de las preguntas de **carta** del PY de Andalucía 2015–2019 (módulo de navegación, UT 4, `requiere: ["carta"]`). En Andalucía el PY explica también sus ejercicios de carta: el cálculo paso a paso, como las de 2020–2026 (mira las de `and-py-2020-*-n11`…`n17` en `data/ejes/andalucia/py/explicaciones.json`).

1. `cd nautica && node tools/bancos/ejes/andalucia/explicaciones.mjs lote py {N} 2 --carta > /tmp/lote.json` (cada pregunta con sus candidatas: las más parecidas ya explicadas).
2. Para cada una, saca los valores de su solución programada (`src/exams/solutions/andalucia-py-AAAA.js`): ejecútala con el kit (mira cómo lo hace `tests/exams.test.js`: `createKit(chart)` de `tests/helpers.js`, `sol.solve(k, q)`; `k.items`/`k.notes` llevan los pasos) o, si está en `documentadas`, usa su texto. Si una pregunta está documentada como discrepancia, la explicación lo dice (y pon `discrepancia` con el porqué; `defendible` solo si otra opción es la que da el cálculo).
3. Escribe `nautica/tools/bancos/ejes/andalucia/explicaciones/py-carta-{NN}.json` = `{ "<id>": { "explicacion", "clave", "trampa"?, "discrepancia"?, "defendible"?, "concepto" } }` con TODAS las del lote. `explicacion`: los pasos con sus números (Ct = dm + Δ; demoras y rumbos verdaderos; situación, rumbo o distancia que sale; Ra = Rv − Ct…), breve, como las de 2020–2026. `clave`: la regla del tipo de ejercicio. `trampa`: el error típico (signo de la Ct, abatimiento al revés, la otra tangente…). `concepto`: el id de la candidata adaptada o `null`. Usa los ids de lugar en castellano normal («faro de Punta Europa»), nunca nombres de función.
4. Comprueba: `node tools/bancos/ejes/andalucia/explicaciones.mjs fusionar` (0 problemas) y deshaz lo que cambia en `data/` con `git checkout -- data/`. Solo se sube tu fichero.
5. `git add`, commit y `git push -u origin {RAMA}` cada ~20 preguntas. El mensaje de commit termina exactamente con:
```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01113zJmsP4kFMhbEwqBp1dt
```
Sin PR; no toques otros ficheros. Prohibido nombrar academias, escuelas o centros de formación. La verdad es la matemática: si tu cálculo no da la oficial, dilo en `discrepancia`.

Al terminar, responde con: rama, último commit, nº de explicaciones y cuántas con discrepancia.
