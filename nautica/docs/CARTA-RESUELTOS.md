# Ejercicios de carta resueltos paso a paso

Galería de ejemplos resueltos, uno por **tipo** de ejercicio de carta del Patrón de Yate (y los que también entran en el
PER), sobre un extracto de la carta del Estrecho dibujado en estilo C (docs/ESTILO-LAMINAS.md): **un paso, un dibujo,
una cota, una cuenta**. Lo trazado en pasos anteriores va en tinta y lo nuevo del paso en magenta y más grueso (y
nombrado en el texto alternativo: nada solo por color).

## Dónde está cada cosa

| Pieza | Fichero |
| --- | --- |
| Los tipos: enunciado, datos, pasos (regla, texto, cuenta, figura), resultado, convenios y trampas | `src/course/carta-pasos.js` |
| El dibujo de cada paso (extracto de carta o los tres nortes) | `src/illustrations/carta-pasos-c.js` |
| Componente «paso a paso» reutilizable (Anterior/Siguiente, «Ver todos los pasos») | `src/ui/pasos.js` |
| La vista `#/<tit>/carta-pasos[/<tipo>][?p=<paso>&todos=1&desde=…]` | `src/ui/views/carta-pasos.js` |
| Situación por dos distancias (motor nuevo) | `fixTwoRanges()` en `src/nautical/positioning.js` |
| Tests (cifras contra el motor y la geometría, pasos, dibujos) | `tests/carta-pasos.test.js` |

La ruta se llama `carta-pasos` (y no `resueltos`) para no confundirla con los «resueltos» de cada banco
(`data/ejes/<eje>/<tit>/resueltos.json`: preguntas reales de examen resueltas en la carta dentro de una clase).

## Reglas

1. **Las cifras no se escriben a mano.** Cada tipo calcula su ejemplo con los motores de la app (`src/nautical/*`,
   `src/math/*`) a partir de los datos del enunciado, como lo haría el alumno: lo que se mide en la carta se redondea
   como en el examen (rumbos al grado, distancias a la décima) y las cuentas siguientes parten del valor redondeado.
   `tests/carta-pasos.test.js` comprueba cada cifra contra el motor y, sobre todo, contra la geometría (la situación
   hallada ve los faros en las demoras del enunciado, está a las distancias dadas, el rumbo de paso pasa a la distancia
   pedida, el rumbo a dar da el efectivo, etc.).
2. **Ejemplos propios.** Ninguno sale de una pregunta de examen, y menos de una reservada para el examen final
   (docs/CUARENTENA.md; `tests/cuarentena.test.js` sigue en verde). Usan los faros y la costa vectorial de la app
   (`data/chart-105.json`), nunca la carta escaneada.
3. **4–8 pasos** por tipo, cada uno con su regla, un texto corto, la cuenta (monoespaciada) y su dibujo. Al final, los
   convenios de signos y «la trampa» (los errores típicos).
4. **Dónde se ve:** Biblioteca (grupo «Carta») y la lista de ejercicios de carta; la ficha de las ideas de carta
   («Ver cómo se resuelve», `TIPO_DE_CONCEPTO`); la corrección de un ejercicio de carta fallado (`#/ej/…`) y de una
   pregunta de carta fallada en la práctica (`TIPO_DE_EJERCICIO` con el `ejercicio` de su solución programada).
   **Nunca** desde un examen, un simulacro ni su revisión (`profePanel(…, { pasos: false })` y `modoExamen()`).
5. **Accesibilidad:** el cambio de paso se anuncia (`aria-live`), el foco va al título del paso, los botones miden al
   menos 44 px, no hay animación y el paso queda en la dirección (`?p=3`, `?todos=1`).

## Tipos

| Tipo (`id`) | Niveles | Ejemplo (cifras calculadas por el motor) |
| --- | --- | --- |
| `ct-dm-desvio` | PER, PY | Carta 2° 50′ W 2005 (7′ E), año 2015 → dm 1° 40′ W; Ra 075°, Δ +3° → Ct +1° 20′ → Rv 076° 20′ (comprobado por Rm 078°) |
| `enfilacion` | PER, PY | Enfilación Punta Europa–Punta Carnero, Dv 243,5° (carta), Da 247° → Ct −3,5°; dm 2° NW → Δ −1,5°; Da Almina 185° → Dv 181,5°; situación 36° 08,4′ N 005° 16,3′ W, a 3,9 M de Punta Europa |
| `dos-demoras` | PER, PY | Da Punta Paloma 023° y Da Isla de Tarifa 090°, dm 2° NW, Δ +1° → Ct −1°, Dv 022° y 089° → 36° 00,0′ N 005° 45,1′ W; corte de 67° |
| `demora-distancia` | PER, PY | Da Cabo Trafalgar 050°, 6 M, dm 1° NW, Δ −2° → Dv 047°, opuesta 227° → 36° 06,9′ N 006° 07,5′ W |
| `dos-distancias` | PER, PY | 4,6 M a Punta Almina y 10,7 M a Punta Europa, estima 35° 56′ N 005° 22′ W → 35° 56,0′ N 005° 21,9′ W (el otro corte, 35° 57,7′ N 005° 13,4′ W, se descarta) |
| `no-simultaneas` | PY | Ra 094°, 6 nudos, Ct +1° → Rv 095°; 10:00 Da Paloma 038°, 10:50 Da Tarifa 080°; traslado 5,0 M → 35° 59,6′ N 005° 40,9′ W a las 10:50 |
| `estima` | PER, PY | Desde 36° 08′ N 006° 12′ W, Ra 140°, Ct −2° → Rv 138°; 6 nudos × 1,5 h = 9 M → 36° 01,3′ N 006° 04,5′ W |
| `rumbo-distancia` | PER, PY | De 35° 53′ N 005° 34′ W al espigón de Tarifa: Rv 347°, 7,7 M; Ct −3° → Ra 350°; 6 nudos, 1 h 17 min: 08:15 → 09:32 |
| `pasar-distancia` | PER, PY | Desde 36° 00′ N 006° 09′ W, Cabo Trafalgar a Dv 027° y 12,4 M; 3 M por estribor: α 14,0°, Rv 013°, Ct +2° → Ra 011°; través Dv 103° |
| `corriente-efectiva` | PY | Ra 012°, Ct −2° → Rs 010°, 6 nudos; corriente 080° 2 nudos → Ref 026°, Vef 6,9 nudos; situación a las 10:15 |
| `corriente-rumbo-a-dar` | PY | De 35° 55′ N 005° 32′ W a 36° 03′ N 005° 24′ W: Ref 039°, 10,3 M; corriente 090° 2 nudos, barco 6 nudos → Rs 024°, Vef 7,1 nudos, 1 h 27 min (09:00 → 10:27); Ct −3° → Ra 027° |
| `corriente-desconocida` | PY | Ra 095°, Ct −2° → Rv 093°, 6 nudos, 2 h → estima; observada por Dv 314° (Tarifa) y 128° (Cires) → Rc 067°, 2,9 M, Ihc 1,5 nudos |
| `viento` | PY | De 35° 53′ N 005° 42′ W a 36° 00′ N 005° 28′ W: Rs 058°, 13,3 M; viento del N por babor, Ab +8° → Rv 050°; Ct −3° → Ra 053°; 5 nudos: 07:30 → 10:10 |
| `estima-analitica` | PY | Desde 36° 06′ N 006° 14′ W: 12 M al 160° y 10 M al 100° → Δl −13,01′, A +13,95 M, lm 35° 59,5′ N, ΔL 17,2′ E → 35° 53,0′ N 005° 56,8′ W; directo 133°, 19,1 M |

Queda fuera: las mareas (`marea-sonda`, no es de carta), la estrella Polar (`nav.ct.polar`) y la situación por sonda o
veril (parte de `carta.situacion.distancias`).

## Apéndice: verificación (fuente de cada convenio y fórmula)

| Hecho | Fuente |
| --- | --- |
| Signos E (NE) +, W (NW) −; Ct = dm + Δ; Rv = Ra + Ct; Ra = Rv − Ct; Rm = Ra + Δ; Rv = Rm + dm; Dv = Da + Ct | RD 875/2014, anexo II (PY, UT 3.2 y 4.1: corrección total por declinación y desvío); `src/nautical/compass.js` |
| Declinación actualizada: dm del año = dm de la carta + años × variación anual (con su signo; una dm W con variación E disminuye) | Leyenda de la rosa de la carta; Tratado de navegación (declinación magnética y su variación anual); `updateDeclination()` |
| El desvío se toma de la tablilla con el rumbo de aguja | Tratado de navegación (tablilla de desvíos); RD 875/2014, anexo II (PY, UT 3.2) |
| Enfilación: Ct = Dv − Da; Δ = Ct − dm | RD 875/2014, anexo II (PY, UT 4.1 «Demora de aguja a una enfilación»); `ctFrom()`, `desvioFrom()` |
| Líneas de posición: la demora se traza desde el objeto con la opuesta (Dv ± 180°); la situación es el corte; mejor cuanto más cerca de 90° | RD 875/2014, anexo II (PY, UT 4.3 «Situación simultánea con dos líneas de posición»); `fixTwoBearings()` |
| Distancia: arco con centro en el objeto, medida en la escala de latitudes (1′ = 1 milla) | Tratado de navegación (proyección Mercator: escala de latitudes crecientes); `fixBearingDistance()`, `fixTwoRanges()` |
| Traslado de la primera línea el rumbo y la distancia navegados; el corte con la segunda es la situación a la hora de la segunda | RD 875/2014, anexo II (PY, UT 4.4 «Situación no simultánea»); `fixRunning()` |
| Estima: d = v · t; desde la salida, el Rv y la distancia | RD 875/2014, anexo II (PER, UT 10; PY, UT 4.7); `rhumbDestination()` |
| Rumbo para pasar a una distancia: sen α = d / D; faro por estribor Rv = Dv − α, por babor Rv = Dv + α; el punto más próximo es el través (Dv = Rv ± 90°) | RD 875/2014, anexo II (PY, UT 4.2); `closestApproach()` |
| Corriente: se nombra hacia dónde va; efectivo = superficie + corriente; rumbo a dar: corriente desde la salida y arco de radio la velocidad del barco; Vef sobre el efectivo | RD 875/2014, anexo II (PY, UT 4.5 «Corriente conocida, resolución gráfica»); `effectiveCourse()`, `courseToSteer()` |
| Corriente desconocida: de la estima a la observada a la misma hora; Ihc = distancia / tiempo | RD 875/2014, anexo II (PY, UT 4.6); `currentFromDrift()` |
| Viento: se nombra por de dónde viene; Rs = Rv + Ab, Ab + con el viento por babor (abate a estribor) y − por estribor | RD 875/2014, anexo II (PY, UT 3.3 y 4.2); `rsFromRv()`, `rvFromRs()`, `abatimientoSigned()`, `windSide()` |
| Estima loxodrómica: Δl = D · cos R; A = D · sen R; lm = l0 + Δl / 2; ΔL = A / cos lm; tg R = A / Δl (en cuadrante); D = √(Δl² + A²) | RD 875/2014, anexo II (PY, UT 4.8 «Derrota loxodrómica, resolución analítica»); `deadReckoning()` |
