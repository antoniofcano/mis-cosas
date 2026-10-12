# Preguntas de carta sin solución (rama `feat/carta-sin-solucion`, R-22)

Estado al 12 de octubre de 2026. Recuento reproducible: `node tools/auditoria-carta.mjs` (resumen), `--detalle` (cada
id con su motivo) y `--json`. Pregunta de carta: `requiere` incluye «carta» o `bloque === 'carta'`.

## Qué veía el alumno y qué ve ahora

- **Antes.** Al pulsar «Ver solución» en una pregunta de carta sin resolución programada salía siempre «Esta pregunta
  no tiene resolución programada (requiere leer símbolos de la carta)», también en las anuladas y en las que no
  coinciden con la plantilla. El motivo documentado (`documentadas` de cada eje) nunca se enseñaba. Y esas preguntas
  estaban en la práctica de las clases y en las listas de carta.
- **Ahora.**
  1. **Interfaz** (`src/exams/motivo.js`, `src/ui/motivo-carta.js`, bloque `.motivo-carta` de `styles/laminas.css`):
     un aviso en estilo C con etiqueta en palabras, titular y el motivo:
     «Pregunta anulada por el tribunal: se dieron todas por válidas» (con el acuerdo si consta en las notas),
     «Se resuelve mirando la carta», «Nuestra resolución no coincide con la plantilla oficial» (con la cuenta y
     «En el examen vale la respuesta oficial del tribunal») y, nuevo, «Nuestra cuenta llega a la respuesta oficial, pero
     por poco» (`sinMargen`). Una anulada resuelta lleva la etiqueta «Anulada» y, si la cuenta no se acerca a ninguna
     opción, lo dice. Al comprobar una anulada: «Pregunta anulada: en el examen valía cualquier respuesta» (antes decía
     «Incorrecta. La correcta es la null)»).
  2. **Fuera de la práctica** (`src/bancos/index.js`: `practicable`, `banco.practica`): ninguna pregunta de carta sin
     solución programada sale en la práctica de las clases, tandas por tema, mezcla, repaso, «5 minutos», sesiones,
     motor ni en las listas «Preguntas reales de carta». Siguen en los exámenes de convocatoria, los simulacros y su
     enlace directo (`#/q/<id>`), que enseña el motivo. «Ver la resolución en la carta» ya no se ofrece para ellas
     (`rutaResolucion`): en la revisión de un examen sale el motivo. Test: `tests/carta-sin-solucion.test.js` (tres
     bancos, dos titulaciones).
  3. **Revisión de cada discrepancia** con el kit y la carta L105 del repo (motores `src/nautical/*`, datos
     `data/chart-105.json` y `tools/source/points.json`; nunca la carta escaneada).

## Cifras por banco (antes → después)

«Salen de la práctica»: preguntas del estudio que el banco aparta ahora de la práctica (todas de carta sin solución;
siguen en sus exámenes). Las reservadas para el examen final no se estudian y no se tocan.

| Banco | Carta | Programadas antes → después | Anuladas programadas | Discrepancias | Sin cálculo | Anuladas sin solución | Salen de la práctica |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Andalucía PY | 247 | 235 → 243 | 0 → 2 | 8 → 0 | 0 → 0 | 4 → 2 | 1 |
| DGMM PY | 110 | 96 → 98 | 0 → 4 | 9 → 6 | 0 → 1 | 5 → 1 | 6 |
| Baleares PY | 369 | 338 → 344 | 0 → 0 | 14 → 8 | 17 → 17 | 0 → 0 | 22 |
| Andalucía PER | 136 | 131 → 131 | 3 → 3 | 1 → 1 | 1 → 1 | 0 → 0 | 1 |
| DGMM PER | 134 | 106 → 106 | 3 → 5 | 2 → 2 | 18 → 18 | 5 → 3 | 19 |
| Baleares PER | 463 | 369 → 369 | 0 → 0 | 5 → 5 | 89 → 89 | 0 → 0 | 90 |

Total que sale de la práctica: 139 preguntas (Andalucía PER 1, PY 1; DGMM PER 19, PY 6; Baleares PER 90, PY 22).
Para que ninguna clase se quedara sin práctica, la clase `per-11-8` de Baleares (sus dos preguntas eran de carta sin
solución) recibe tres preguntas resueltas de su tema (`bal-per-2020-07-espf-45`, `bal-per-2021-12-d-44`,
`bal-per-2019-04-c-43`). La que más baja es `per-11-1` de DGMM (de 8 a 2).

## Andalucía PY: lo que vio el usuario (8 documentadas y 4 anuladas)

| Pregunta | Clase | Antes | Ahora |
| --- | --- | --- | --- |
| `and-py-2022-c2-n11`, `and-py-2016-c2-n11`, `and-py-2016-c3-n12`, `and-py-2018-c4-n13` | py-4-1 | discrepancia | **Resueltas** con la enfilación Espartel–Malabata a 079,8° (ver abajo) |
| `and-py-2015-c3-n11` | py-4-5 | discrepancia | **Resuelta**, con aviso «por poco» |
| `and-py-2015-c2-n13` | py-4-8 | discrepancia | **Resuelta**, con aviso «por poco» |
| `and-py-2017-c3-n14`, `and-py-2018-c1b-n14` | py-4-8 | discrepancia | **Resueltas**: las opciones nombran el rumbo (SE, N) |
| `and-py-2024-c2-n15` | py-4-4 | anulada | **Resuelta** con el dato corregido por el tribunal (020°): sale la b |
| `and-py-2021-c2-n17` | py-4-8 | anulada | **Resuelta** para practicar; la vista avisa de que ninguna opción se acerca |
| `and-py-2021-c2-n12` | py-4-1 | anulada | Sin solución (el dato no encaja): fuera de la práctica, con el motivo y la cuenta |
| `and-py-2026-c2-n17` | — | anulada, reservada | Sin cambios (reservada: no se toca); su vista dice el acuerdo del tribunal |

**La enfilación Espartel–Malabata.** Los tribunales de Andalucía (5 preguntas) y de Baleares (2) usan 079,5°–080°; la
carta de la app, midiendo entre los símbolos, da 078,6°. La situación oficial del faro de Punta Malabata (Lista de faros,
NGA Pub. 113: 35° 49,0′ N 005° 44,9′ W, que coincide con la que dan las listas públicas de faros) llevada al datum de la
carta (ED50, +0,08′ N) queda 0,16′ al S de su símbolo (lo anota `tools/source/notes.md`): con ella la enfilación sale
079,8° (079,9° con los dos faros en su situación oficial). Es la matemática del tribunal. No se ha movido el faro en la
carta: con la situación oficial empeoraban 67 de las 145 resoluciones que lo usan para situarse (y dos del PY dejaban de
llegar a la oficial), así que solo la dirección de esta enfilación corta (8,7 millas) se toma con la situación oficial,
explicándolo en un paso (`src/exams/solutions/faros-lista.js`). La lección para el alumno, en el paso: si mide en su
carta saldrá entre 078° y 080°; la plantilla usa 080°.

## Detalle por banco

### Andalucía PY

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `and-py-2021-c2-n12` | anulada | anulada | py-4-1 | No la resolvemos porque el dato no encaja: en la oposición de Isla de Tarifa y Punta Alcázar estamos entre los dos faros, y Punta Alcázar queda al S (Dv 165,7°). Con una Da de 351° a ella la Ct saldría de casi 180°, imposible. Sol… |
| `and-py-2026-c2-n17` | anulada | anulada (reservada: no se toca) | — | OMR: lectura 1 = - (sin marca), lectura 2 = -; verificada visualmente sobre la plantilla. Anulada de oficio por acuerdo del Tribunal de 29-06-2026 (pdf/2026_2_Tribunal_IAD_Anulacion_Pregunta_PY_MN_17.pdf) por un error material de … |
| `and-py-2015-c2-n13` | discrepancia | programada | py-4-8 | Rc 069°, Ihc 4,1 → d (071°, 4,0); la b (068°, 3,1) queda a menos del doble: `sinMargen` con el porqué. |
| `and-py-2015-c3-n11` | discrepancia | programada | py-4-5 | Traslado con el efectivo (Ref 159°, Vef 7,4): 36° 04,0′ N → a (03,6′); la c (05,0′) cerca: `sinMargen`. |
| `and-py-2016-c2-n11` | discrepancia | programada | py-4-1 | Igual: Dv 079,8°, Da 093° → Ct −13,2° → d (−13°). |
| `and-py-2016-c3-n12` | discrepancia | programada | py-4-1 | Oposición Espartel–Malabata: Dv a Malabata 079,8°, Da 071° → +8,8° → d (+9°). |
| `and-py-2017-c3-n14` | discrepancia | programada | py-4-8 | Corriente desconocida: Rc 140,3°, Ihc 3,4. Las opciones nombran el rumbo (SE/NW): 140° es el SE (k.porNombre) → d (SE, 3,6). |
| `and-py-2018-c1b-n14` | discrepancia | programada | py-4-8 | Rc 355,2°, Ihc 1,54 → el N (k.porNombre) → d (N, 1,6). |
| `and-py-2018-c4-n13` | discrepancia | programada | py-4-1 | Dv 079,8°, Da 087° → −7,2° → b (−7°). |
| `and-py-2022-c2-n11` | discrepancia | programada | py-4-1 | Enfilación Espartel–Malabata con la situación oficial del faro de Malabata (Lista de faros NGA 113: 35° 49,0′ N 005° 44,9′ W; el símbolo de la carta está 0,16′ al N): 079,8°. Ct = 079,8° − 078° = +1,8° → b (+2°). Entre símbolos salía 078,6° (+0,6°). |
| `and-py-2021-c2-n17` | anulada | anulada, programada | py-4-8 | Anulada, resuelta para practicar: Rc 200°, Ihc 0,8; ninguna opción se acerca (la a es la corriente al revés). La vista lo dice. |
| `and-py-2024-c2-n15` | anulada | anulada, programada | py-4-4 | Anulada por la errata 200° (acuerdo: era 20°). Con 020°: 35° 59,4′ N 005° 27,9′ W = b (la marcada en la plantilla escaneada). |

### DGMM PY

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `dgmm-py-2022-06-36` | anulada | anulada | — | No la resolvemos: la situación de salida del enunciado, 36° 40′ N 005° 15′ W, está en tierra, en la serranía de Ronda, 20′ al N del borde de la carta. Con ese dato no hay rumbo a Punta Almina que calcular. |
| `dgmm-py-2019-06-39` | discrepancia | discrepancia | py-4-1, py-4-7 | La enfilación Punta Europa–Punta Carnero (vemos Europa con Carnero detrás, al SW) va al 243,5° entre los símbolos de la carta (243,7° con la situación oficial de los faros). Con la Da 242°: Ct = 243,5° − 242° = +1,5°, que es justo… |
| `dgmm-py-2021-07-32` | discrepancia | discrepancia | py-4-1, py-4-2 | Del punto A (35° 50′ N 005° 10′ W) a Punta Almina: Rs = 307° (6,8 millas). El viento del N entra por estribor y nos abate a babor 7°: para hacer 307° hay que dar Rv = 307° + 7° = 314°. Ct = dm de la carta para 2021 (2° 50′ W − 16 … |
| `dgmm-py-2023-04-36` | discrepancia | discrepancia | py-4-5, py-4-8 | Ct = −1° + 2° = +1°: Rv 084°, 4,5 nudos durante 2 h 20 min (10,5 millas): estima de las 07:05 en 35° 52,1′ N 005° 58,1′ W. Con las Dv 036° (Punta de Gracia) y 151° (Cabo Espartel) la situación verdadera es 35° 53,4′ N 005° 59,4′ W… |
| `dgmm-py-2023-04-79` | discrepancia | discrepancia | py-4-2, py-4-3 | Rv = 190° − 2,5° = 187,5°; el viento del SE entra por babor y nos abate 5° a estribor: Rs = 192,5°. En 54 min: 6,75 millas al 192,5° (Δl −6,6′, A −1,5′). La corriente «de rumbo 090°» va hacia el E (el rumbo de una corriente es hac… |
| `dgmm-py-2024-11-40` | discrepancia | discrepancia (reservada: no se toca) | — | Falta un dato: la situación de la «marca cardinal norte próxima a Punta Malabata». No está entre los puntos de la carta de la app ni la da ningún enunciado o solución oficial de la DGMM (en dgmm-per-2022-10-89 solo se sabe que est… |
| `dgmm-py-2025-04-39` | discrepancia | discrepancia (reservada: no se toca) | — | Corriente desconocida. Salida 3 millas al SW de Tarifa (35° 58,0′ N 5° 39,1′ W); Ct = −0,50° − 1,5° = −2°, Rv 103°, 8 nudos durante 45 min: estima 12:15 en 35° 56,6′ N 5° 31,9′ W. Con las Dv 169° (Cires) y 025° (Carnero) la verdad… |
| `dgmm-py-2021-12-36` | discrepancia | programada | py-4-1, py-4-3 | Ct +3°: c «3º+». Antes empataba con b «3º»: options.js desempata a favor de la única que escribe el signo del resultado (test en options.test.js). |
| `dgmm-py-2021-12-40` | discrepancia | programada | py-4-5, py-4-8 | Rc 097,9°, Ihc 2,26 → a (095°, 2,3); la c (095°, 2,9) casi igual de cerca: `sinMargen`. |
| `dgmm-py-2020-12-35` | anulada | anulada, programada | — | Anulada, resuelta: Ref = recta a Espartel 237° → c (235°); la b (227°) es el Rv con el abatimiento: pregunta y opciones mezclan rumbos. |
| `dgmm-py-2022-06-34` | anulada | anulada, programada | — | Anulada, resuelta con la latitud corregida (025° → 35° 49′ N): Rc 157°, Ihc 1,0 → c (160°, 0,93). |
| `dgmm-py-2022-06-39` | anulada | anulada, programada | — | Anulada, resuelta: oposición Alcázar–Cires y Dv 136° a Tarifa → 35° 54,2′ N 005° 29,5′ W = c. |
| `dgmm-py-2022-12-37` | anulada | anulada, programada | — | Anulada, resuelta con 2 h (17:15 UTC → 20:15 HRB = 19:15 UTC): 35° 54,7′ N 006° 01,9′ W, cerca de c. |

Sin cálculo: 1, `dgmm-py-2023-11-39`, que antes figuraba como discrepancia: falta la situación de la marca cardinal N de Punta Malabata, que solo está en la carta en papel. Estaba en la práctica (py-4-1, py-4-3) y ahora sale de ella; su texto se reescribe con el procedimiento. Ids: `dgmm-py-2023-11-39`.

### Baleares PY

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `bal-py-2019-12-a-32` | discrepancia | discrepancia | py-4-10 | Ct −3°: Rv = 300° − 3° = 297°. El viento del W entra por babor y nos abate 4° a estribor: Rs = 301°. Con la corriente (045°, 2,5 nudos) el efectivo sale y en 2 h llegamos a 35° 54,9′ N 006° 08,8′ W: es la opción d, no la oficial a… |
| `bal-py-2021-06-ac-31` | discrepancia | discrepancia | py-4-10 | Da de Punta Cires = Ra − marcación por babor = 303° − 60° = 243°. Estamos en la enfilación Alcázar–Cires, viendo Cires delante de Alcázar: la Dv a Cires es la de esa recta, 226,6° entre los símbolos de la carta (227,2° con la situ… |
| `bal-py-2024-07-a-33` | discrepancia | discrepancia | py-4-10 | Ct = −3,5° + 1° = −2,5°: Rv 250,5°. Situación de las 08:00 a 6 millas de Punta Europa marcada 80° por estribor; estima de las 09:30 (12,5 millas al 250,5°); situación verdadera por la Da 183° a Punta Cires y Punta Leona 109° por b… |
| `bal-py-2025-04-a-36` | discrepancia | discrepancia | py-4-10 | Es la pregunta bal-py-2021-06-ac-31 con otra fecha. Da de Punta Cires = 303° − 60° = 243°; en la enfilación Alcázar–Cires la Dv a Cires es 226,6° (227,2° con la situación oficial de los faros): Ct = −16,4° (−15,8°). La más próxima… |
| `bal-py-2025-04-a-39` | discrepancia | discrepancia | py-4-10 | Los arcos de 5 millas (Punta Paloma) y 7 millas (Isla de Tarifa) se cortan en el mar en 35° 59,2′ N 005° 45,1′ W (el otro corte cae en tierra). Ct = 5° + 4° = +9°: Rv 180°. La corriente al W no cambia la latitud: bajamos a unos 7 … |
| `bal-py-2026-06-a-36` | discrepancia | discrepancia (reservada: no se toca) | — | El cálculo llega a la oficial (c) sin margen: el Ra sale 079,2° (el de a y c), pero la corriente da Rc = 038,3° e Ihc = 1,96 nudos, a medio camino entre la a (035°, 2,3) y la c (041°, 2,3). |
| `bal-py-2026-06-a-39` | discrepancia | discrepancia (reservada: no se toca) | — | El cálculo llega a la b (086°, 4,7) por muy poco: sale Rc = 086,9° e Ihc = 4,29 nudos, y la oficial es la a (089°, 4,4). La situación de partida (arcos de 5 M de Trafalgar y 4 M de Barbate) es muy sensible al trazado. |
| `bal-py-2026-06-b-36` | discrepancia | discrepancia (reservada: no se toca) | — | El cálculo llega a la oficial (a, 222°) pero lejos: siguiendo toda la derrota del enunciado (tangente a 2′ de Espartel con corriente al E, 40 min con corriente, misma proa sin corriente hasta Tánger por el través de babor y nueva … |
| `bal-py-2018-12-a-34` | discrepancia | programada | py-4-10 | Rc 069,8°, Ihc 2,56 → a (072°, 2,6); c (070°, 1,5) cerca por el rumbo: `sinMargen`. |
| `bal-py-2021-03-b-33` | discrepancia | programada | py-4-10 | La misma: → b (072°, 2,5); `sinMargen`. |
| `bal-py-2021-03-b-40` | discrepancia | programada | py-4-10 | Ra 199,3°, Vb 10,7 → a (200°, 10,2); b (195°, 10,8) cerca: `sinMargen`. |
| `bal-py-2021-12-b-37` | discrepancia | programada | py-4-10 | Situación 35° 58,6′ N 005° 21,3′ W = d; Rc 139,5°, Ihc 2,4 (d: 135°, 2,5); `sinMargen`. |
| `bal-py-2021-12-b-38` | discrepancia | programada | py-4-10 | Rc 035,7°, Ihc 2,47 → c (038°, 2,4), la única con esa intensidad; b (035°, 3,1) casi igual: `sinMargen`. |
| `bal-py-2025-07-a-33` | discrepancia | programada | py-4-10 | Ra 241,8° → d (243°); b (240°) cerca: `sinMargen`. |

Sin cálculo (se resuelven mirando la carta o falta un elemento que la carta de la app no tiene): 17, de ellas 17 estaban en la práctica de alguna clase y ahora salen de ella. Su texto no cambia. Ids: `bal-py-2017-03-cb-35`, `bal-py-2017-07-b-31`, `bal-py-2018-04-a-32`, `bal-py-2018-04-b-39`, `bal-py-2018-04-b-40`, `bal-py-2018-06-b-37`, `bal-py-2019-06-a-36`, `bal-py-2020-07-a-38`, `bal-py-2020-12-b-37`, `bal-py-2021-03-ac-34`, `bal-py-2021-12-a-31`, `bal-py-2022-12-ac-35`, `bal-py-2024-07-a-40`, `bal-py-2024-12-a-33`, `bal-py-2024-12-a-35`, `bal-py-2025-07-b-31`, `bal-py-2025-12-a-37`.

### Andalucía PER

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `and-2018-c3-q45` | discrepancia | discrepancia | per-11-6 | Rv 250°: Punta Carnero a 55° por estribor (Dv 305°) y Punta Almina a 88° por babor (Dv 162°). Situación: 36° 01,5′ N 005° 19,7′ W. La oficial (d) dice «36º 01,4' N; 006º 19,6' W»: los minutos cuadran con la cuenta, pero el grado d… |

Sin cálculo (se resuelven mirando la carta o falta un elemento que la carta de la app no tiene): 1, de ellas 0 estaban en la práctica de alguna clase y ahora salen de ella. Su texto no cambia. Ids: `and-2025-c2-q45`.

### DGMM PER

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `dgmm-per-2019-06-42` | anulada | anulada | — | No la resolvemos: faltan datos. El enunciado da un rumbo de aguja (154,8°) sin desvío ni declinación, y no dice si estamos entre los dos faros o en la prolongación de la alineación. Con la declinación de la carta para 2019 y sin d… |
| `dgmm-per-2019-06-87` | anulada | anulada | — | No la resolvemos: la oposición de Isla de Tarifa y Punta de los Judíos necesita la situación de Punta de los Judíos, que no está entre los puntos de la carta de la app. En tu carta: une Tarifa con Punta de los Judíos y Punta de Gr… |
| `dgmm-per-2023-06-89` | anulada | anulada | — | No la resolvemos porque el dato no encaja: en la oposición de Punta Paloma y Punta Malabata estamos entre los dos faros, y Malabata queda al S (Dv 185,9°). Con una Da de 003,5° a ella la Ct saldría de casi 180°, imposible. Solo te… |
| `dgmm-per-2020-12-177` | discrepancia | discrepancia | per-11-2, per-11-4 | En la oposición Punta Europa–Punta Carnero la demora verdadera a Carnero es la de la recta Europa → Carnero: 243,5° en la carta (243,7° con la situación oficial de los faros). Ct = Dv − Da = 243,5° − 250° = −6,5°: negativa. La úni… |
| `dgmm-per-2021-02-44` | discrepancia | discrepancia | per-11-2 | Es dgmm-per-2020-12-177 con otra Da. En la oposición Europa–Carnero la Dv a Carnero es 243,5°: Ct = 243,5° − 255° = −11,5°, negativa. La oficial es la c, «10º» sin signo (frente a la b, «10º +»): el tribunal escribe así la negativ… |
| `dgmm-per-2019-06-44` | anulada | anulada, programada | — | Anulada, resuelta: 35° 58,7′ N 005° 51,6′ W; las 4 opciones están a 0,2′ entre sí y a más de 2′ de la cuenta. |
| `dgmm-per-2022-06-90` | anulada | anulada, programada | — | Anulada, resuelta: desde la boya cardinal E de Getares, estima a las 10:00; desde Punta Cires 076°, 3,5 millas → c (075°, 3,5). |

Sin cálculo (se resuelven mirando la carta o falta un elemento que la carta de la app no tiene): 18, de ellas 14 estaban en la práctica de alguna clase y ahora salen de ella. Su texto no cambia. Ids: `dgmm-per-2019-06-89`, `dgmm-per-2020-12-88`, `dgmm-per-2021-02-42`, `dgmm-per-2021-02-45`, `dgmm-per-2021-02-88`, `dgmm-per-2021-04-87`, `dgmm-per-2021-07-42`, `dgmm-per-2021-07-45`, `dgmm-per-2022-04-44`, `dgmm-per-2022-06-42`, `dgmm-per-2022-10-89`, `dgmm-per-2023-11-89`, `dgmm-per-2024-04-90`, `dgmm-per-2024-11-87`, `dgmm-per-2025-11-42`, `dgmm-per-2025-11-43`, `dgmm-per-2026-06-42`, `dgmm-per-2026-06-45`.

### Baleares PER

| id | Antes | Después | En práctica antes (clases) | Motivo y evidencia |
| --- | --- | --- | --- | --- |
| `bal-per-2018-06-c-44` | discrepancia | discrepancia | per-11-2 | Da de Punta Europa = S 70 W = 250°. La enfilación Europa–Carnero va al 243,5° en la carta (243,7° con la situación oficial de los faros): Ct = 243,5° − 250° = −6,5°; desvío = Ct − variación = −6,5° − (−2°) = −4,5°, justo entre la … |
| `bal-per-2024-12-ce-45` | discrepancia | discrepancia | per-11-3 | Tomando la salida en 005° 58,4′ W (el «E» del enunciado es una errata), Rv = 315,8° y 23,4 millas a 6 nudos: HRB 01:25 del día siguiente, como la oficial (c). Pero Ct = −9° − 3,5° = −12,5°, y Ra = Rv − Ct = 315,8° + 12,5° = 328°. … |
| `bal-per-2025-04-ae-44` | discrepancia | discrepancia | per-11-4 | Ra S33E = 147°; Ct = 3° − 1,6° = +1,4°: Rv 148,4°. Punta de Gracia a 42° por babor (Dv 106,4°) y Punta Alcázar a 12° por babor (Dv 136,4°): desde la situación, Cabo Trafalgar queda a 9,7 millas, la opción c (9,8). La oficial es la… |
| `bal-per-2025-12-b-45` | discrepancia | discrepancia | per-11-4 | Los arcos de 5 millas (Punta Almina) y 11 millas (Punta Carnero) se cortan en 35° 53,9′ N 005° 23,0′ W (en el mar, al W de Ceuta) y en 35° 58,6′ N 005° 14,2′ W. Ra S84W = 264°; Ct = −2,8° − 1,2° = −4°: Rv 260°. Punta Alcázar por e… |
| `bal-per-2025-12-d-43` | discrepancia | discrepancia | per-11-4 | Ra S33E = 147°; Ct = 6,5° − 2,5° = +4°: Rv 151°. Punta de Gracia a 42° por babor (Dv 109°) y Punta Malabata a 15° por estribor (Dv 166°): Cabo Trafalgar queda a 10,9 millas, la opción a (10,8). La oficial es la c (9,2). Probando o… |

Sin cálculo (se resuelven mirando la carta o falta un elemento que la carta de la app no tiene): 89, de ellas 85 estaban en la práctica de alguna clase y ahora salen de ella. Su texto no cambia. Ids: `bal-per-2017-03-a-43`, `bal-per-2017-07-b-45`, `bal-per-2017-09-a-45`, `bal-per-2017-09-d-44`, `bal-per-2017-09-e-44`, `bal-per-2018-04-a-45`, `bal-per-2018-04-b-43`, `bal-per-2018-04-c-43`, `bal-per-2018-04-c-44`, `bal-per-2018-04-d-43`, `bal-per-2018-04-d-45`, `bal-per-2018-04-e-42`, `bal-per-2018-06-a-43`, `bal-per-2018-06-a-44`, `bal-per-2018-06-b-42`, `bal-per-2018-06-b-43`, `bal-per-2018-06-b-44`, `bal-per-2018-06-i-42`, `bal-per-2018-09-a-42`, `bal-per-2018-09-a-44`, `bal-per-2018-09-b-42`, `bal-per-2018-09-b-45`, `bal-per-2018-09-d-43`, `bal-per-2018-12-a-44`, `bal-per-2018-12-a-45`, `bal-per-2018-12-c-43`, `bal-per-2019-04-a-45`, `bal-per-2019-04-b-44`, `bal-per-2019-04-c-45`, `bal-per-2019-06-b-45`, `bal-per-2019-06-c-45`, `bal-per-2019-09-a-43`, `bal-per-2019-12-d-45`, `bal-per-2020-07-ah-42`, `bal-per-2020-07-c-44`, `bal-per-2020-10-b-42`, `bal-per-2020-10-f-45`, `bal-per-2020-10-g-44`, `bal-per-2020-12-b-42`, `bal-per-2020-12-f-43`, `bal-per-2020-12-g-44`, `bal-per-2020-12-i-44`, `bal-per-2021-03-b-43`, `bal-per-2021-03-c-45`, `bal-per-2021-06-bh-43`, `bal-per-2021-06-bh-44`, `bal-per-2021-06-ci-42`, `bal-per-2021-06-e-43`, `bal-per-2021-06-espa-42`, `bal-per-2021-06-espa-43`, `bal-per-2021-06-espa-44`, `bal-per-2021-06-g-44`, `bal-per-2021-09-a-43`, `bal-per-2021-12-c-42`, `bal-per-2022-03-b-42`, `bal-per-2022-09-a-42`, `bal-per-2022-09-a-43`, `bal-per-2022-09-a-45`, `bal-per-2022-09-b-42`, `bal-per-2022-09-b-45`, `bal-per-2022-12-a-42`, `bal-per-2022-12-be-43`, `bal-per-2023-03-a-45`, `bal-per-2023-03-bf-45`, `bal-per-2023-03-cg-42`, `bal-per-2023-03-e-42`, `bal-per-2023-03-e-45`, `bal-per-2023-09-bf-45`, `bal-per-2023-09-c-45`, `bal-per-2023-12-a-45`, `bal-per-2023-12-e-44`, `bal-per-2023-12-e-45`, `bal-per-2024-07-a-44`, `bal-per-2024-07-c-45`, `bal-per-2024-09-a-42`, `bal-per-2024-09-a-43`, `bal-per-2024-09-d-42`, `bal-per-2024-12-b-44`, `bal-per-2024-12-df-42`, `bal-per-2025-07-a-43`, `bal-per-2025-07-b-43`, `bal-per-2025-07-c-42`, `bal-per-2025-07-d-43`, `bal-per-2025-07-d-44`, `bal-per-2025-09-d-42`, `bal-per-2026-03-a-43`, `bal-per-2026-09-d-43`, `bal-per-2026-09-d-44`, `bal-per-2026-09-d-45`.

## Cambios de criterio (para revisar)

- **`sinMargen`** (`src/bancos/soluciones.js`, `tests/exams.test.js`): el PY exige que la oficial gane «con claridad»
  (la segunda opción, al doble de distancia). Las que llegan a la oficial dentro del doble de la tolerancia, pero con
  otra opción casi igual de cerca, ahora se programan con un `sinMargen` que explica por qué; la vista lo enseña como
  «Nuestra cuenta llega a la respuesta oficial, pero por poco». El test falla si un `sinMargen` sobra o si no elige la
  oficial. Son 9: `and-py-2015-c2-n13`, `and-py-2015-c3-n11`, `dgmm-py-2021-12-40` y seis de Baleares PY (las de la
  tabla). Las que quedan lejos (más del doble de la tolerancia) siguen documentadas.
- **Signo en las opciones** (`src/exams/options.js`): si dos opciones empatan con el mismo valor y solo una escribe el
  signo del resultado («3º+» frente a «3º»), vale esa y la otra queda una tolerancia detrás. Antes era un empate que
  dejaba `dgmm-py-2021-12-36` sin resolver. `tests/options.test.js` cubre los casos (si el signo escrito no es el del
  resultado, no desempata).
- **Rumbo por su nombre** (`k.porNombre` en `src/exams/kit.js`): cuando las opciones dan el rumbo de la corriente por su
  nombre (N, SE…), la cuenta se nombra con el punto de la rosa de 8 en que cae, y el paso lo explica.
- **Anuladas resueltas para practicar**: el test de margen del PY no se aplica a una anulada (no hay oficial).
- `rutaResolucion(q)` solo da ruta a las que tienen solución programada (antes, también a las de una lista de carta).

## Lo que queda sin resolver y por qué

- **Discrepancias que siguen documentadas (22, 5 de ellas reservadas).** Cada texto da ahora la cuenta correcta, a qué
  llegaría el alumno midiendo y si la oficial es defendible o errónea:
  - Defendibles solo con una medida o un redondeo concretos (tipo b): `dgmm-py-2019-06-39` (enfilación Europa–Carnero
    al grado, 244°), `bal-py-2021-06-ac-31` y `bal-py-2025-04-a-36` (Alcázar–Cires al 228°; 227,2° con la situación
    oficial), `bal-py-2024-07-a-33` (el corte Leona–Cires, muy agudo, da 035,7° y la oficial es 037°; la cuenta cae en la
    a), `dgmm-py-2023-04-36` (10° de rumbo en un vector de 1,65 millas), `dgmm-per-2020-12-177` y `dgmm-per-2021-02-44`
    (Ct negativa escrita sin signo; recta a 245°), `bal-per-2018-06-c-44` (Europa–Carnero a 245°).
  - Oficial errónea o con errata (tipo c): `dgmm-py-2023-04-79` (toma la corriente al revés), `dgmm-py-2021-07-32`
    (necesita una declinación de 5° W que no es la de la carta), `bal-py-2019-12-a-32` (errata de 2019: la misma pregunta
    de 2020 da la oficial que sale), `bal-py-2025-04-a-39` (la gemela de 2022 sí cuadra), `and-2018-c3-q45` (errata de
    imprenta en el grado de longitud de la d), `bal-per-2024-12-ce-45` (Ct sumada con el signo cambiado),
    `bal-per-2025-04-ae-44` (plantilla incoherente entre convocatorias), `bal-per-2025-12-d-43` y
    `bal-per-2025-12-b-45` (ninguna lectura del enunciado llega a la oficial).
  - Reservadas para el examen final (no se tocan; anotadas): `dgmm-py-2024-11-40`, `dgmm-py-2025-04-39`,
    `bal-py-2026-06-a-36`, `bal-py-2026-06-a-39`, `bal-py-2026-06-b-36`. Si se quisieran programar, `bal-py-2026-06-a-36`
    encajaría con `sinMargen` según su propio texto; no se ha cambiado.
- **Anuladas sin solución (6):** `and-py-2021-c2-n12` y `dgmm-per-2023-06-89` (la demora dada es la del faro contrario:
  Ct de casi 180°), `dgmm-per-2019-06-42` (falta el desvío y la situación es ambigua), `dgmm-per-2019-06-87` (Punta de
  los Judíos no está en la carta de la app), `dgmm-py-2022-06-36` (la salida está en tierra) y `and-py-2026-c2-n17`
  (reservada: no se toca; su vista ya dice el acuerdo del tribunal).
- **Sin cálculo (126):** se resuelven mirando la carta o necesitan un elemento que la carta de la app no tiene
  (isobáticas, sondas, marcas, cimas, DST). No es un fallo de la app; ahora salen de la práctica y su vista lo dice.

## Dudas

- El criterio `sinMargen` relaja la puerta de calidad del PY a cambio de enseñar la resolución con un aviso honesto.
  Si se prefiere la puerta estricta, basta con devolver esas 9 a `documentadas` (sus textos están en `sinMargen`).
- `dgmm-per-2022-06-90` usa la boya cardinal E de Getares de la carta de la app (confianza baja en `points.json`) como
  «marca cardinal Este de la Bahía de Algeciras»; la cuenta cae en la c con margen, lo que respalda la posición.
- `dgmm-py-2022-12-37` (anulada) toma 2 h entre las 17:15 UTC y las 20:15 HRB (UTC + 1 en diciembre); la cuenta queda
  cerca de la c, no encima.
- Las de carta sin solución siguen en los simulacros y los exámenes de convocatoria (son examen, no práctica); su
  revisión enseña el motivo.

## Capturas

En el scratchpad de la sesión, `lcarta-capturas/`: `anulada`, `sin-calculo`, `discrepancia`, `resuelta-nueva`
(`and-py-2022-c2-n11`), `por-poco` y `anulada-resuelta`, cada una a 360 y 990 px en claro y oscuro. Sin desbordamiento
horizontal a 360 px ni errores en la consola.
