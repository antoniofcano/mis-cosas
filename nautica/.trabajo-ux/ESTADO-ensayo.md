# Estado: ensayo general en papel (R-41) y tu velocidad en carta (R-42)

Rama `feat/ensayo-papel` (sale de `origin/feat/examen-dia`).

## R-41 — Ensayo general en papel

- **Dónde se entra:** Examen → «Ensayo general en papel» (con la cuenta de los hechos), la estrategia (sección
  «Ensayo general en papel») y la página de la semana antes (`#/<tit>/semana`).
- **Preparación** `#/<tit>/ensayo?p=<parte>&s=<semilla>` (`src/ui/views/ensayo.js`): qué parte (PY: módulo de
  navegación, 20 preguntas y 75 min oficiales; PER: navegación y carta, temas 10 y 11, 9 preguntas y 38 min
  *orientativos*, los que les deja el presupuesto de la estrategia, y se dice así; o el examen completo), lo que hay que
  tener en la mesa (las normas del tribunal de `data/comun/estrategia.json` con su fuente, marcables, más cuatro
  consejos del ensayo), el aviso de que la carta de papel la pone el alumno (IHM, con derechos) y tres salidas: empezar,
  imprimir el cuadernillo o «ya lo hice impreso: pasar mis respuestas» (con los minutos, opcional).
- **En marcha** `#/<tit>/test/ensayo?p=…&s=…` (`testView` → `correrPapel` → `src/ui/ensayo.js`): modo examen, sin
  calculadora de la app, sin mesa de cartas, bloc, glosas ni paso a paso. Solo el cuadernillo numerado y el reloj del
  tribunal, que solo corre con la pestaña visible. Se guarda como examen a medias (`testEnCurso`, `fase: 'papel'|'hoja'`).
  Al acabar el tiempo, a la hoja con aviso de «suelta el lápiz».
- **Hoja de respuestas:** todas a la vez, una fila por número con a b c d (48 px); el reloj está parado. Corrige con
  `grade` (reglas reales; en las partes, los límites de cada materia).
- **Resultado:** el de un simulacro, más «Revisa cada fallo paso a paso»: cada fallo enlaza a `#/q/<id>?guiado=1` si
  tiene paso a paso (carta y cuentas) o a su explicación.
- **Cuadernillo imprimible** `#/<tit>/ensayo/cuadernillo?p=…&s=…`: A4, cabecera con código, instrucciones, enunciados
  en dos columnas sin partir preguntas y la hoja de respuestas en página aparte.
- **Registro:** `recordTest` con `tipo: 'ensayo'`, `parte`, `aptoParte` (`apto` solo en el completo) e `impreso`.

## R-42 — Tu velocidad en carta

- Simulacros, módulos, reales y examen final guardan `tq: [[id, s, ok, tipo]]` en su registro (sincronizado; pasa el
  validador de `origin/main` sin cambiarlo; ~3,7 KB en el peor caso de 45 preguntas, de 64 KiB).
- Práctica: preguntas de carta de las tandas y ejercicios de carta → `nautica.tiempos.v1` en el aparato (las
  operaciones `r`/`e` no admiten campos nuevos en el servidor desplegado). Decisión en `docs/SYNC.md`.
- Se ve en «Tu estrategia» (tabla por tipo: veces, tendencia, media y «cabe / justo / te pasas» frente al tiempo por
  pregunta de carta del presupuesto; y «Por dónde empezar») y en el resultado del simulacro («Tu tiempo por tipo de
  problema»).

## Pruebas

- `tests/ensayo.test.js`, `tests/velocidad.test.js`; `npm test` en verde.
- Recorrido en Chromium a 360 y 990 px, claro y oscuro (capturas en el scratchpad de la sesión), sin peticiones fuera
  de localhost (sincronización bloqueada).

## Pendiente / no verificado

- Probar en un móvil real (impresión desde iOS/Android, reloj con la app en segundo plano).
- El tiempo de la parte del PER es orientativo; si un tribunal publica tiempos por parte, cambiarlo.
- La práctica no se sincroniza: en otro aparato solo se ven los tiempos de los exámenes.
