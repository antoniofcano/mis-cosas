# Estado: iconos SVG propios y Temario con progreso

Rama `feat/iconos-temario`. Reglas y set completo en `docs/ICONOS.md`.

## Hecho
- `src/ui/iconos.js`: set cerrado de ~100 iconos de línea (24 × 24, trazo 1,75, `currentColor`), `icono(nombre, clase, etiqueta)`,
  `conIcono(nombre, …texto)`, `svgIcono(nombre)`. Revisado en hoja de pruebas a 16/20/24/32/64 px, claro y oscuro (rehechos: nudo,
  boya, timón, satélite).
- Todos los emojis de `src/ui/**/*.js` (≈ 316) e `index.html` sustituidos. Quedan solo signos tipográficos de la lista blanca
  (`→ ← ↑ ↓ ↔ ✓ ✗ ▾ ● ○`). La cabecera de `index.html` lleva el SVG de la brújula y del engranaje desde el primer pintado.
- `icon` (emoji) → `ico` (nombre del set) en temas, titulaciones, categorías de ejercicios y mazos de tarjetas.
- `cierre()`: `icono: 'hecho' | 'flojo'` en vez de 🎉/💪. `lineaListo` ya no empieza por ✅ (Hoy pone el icono `ok`).
- Más: cada fila con su icono en un disco. Mesa de cartas, tutorial, radio, calculadora: botones con iconos y `aria-label`.
- Temario: faro por tema (apagado / en curso / encendido; `luzDeFaro` compartido con la carta de la Travesía), barra de ideas
  dominadas (`farosPorTema` + `temaDeIdea`), chip «Máx. N fallos de M», «Hoy toca» encima del título. Sin etiquetas: aspecto de
  siempre con el icono del tema.
- Tests: `tests/iconos.test.js` (sin emojis en src/ui, nombres existentes, reglas de dibujo, cabecera de index.html) y dos más en
  `tests/travesia.test.js` (luzDeFaro, farosPorTema = mismo reparto que conceptosPorTema).
- Verificado con Playwright: capturas antes/después en el scratchpad `ico-capturas/` (390 claro/oscuro de todas las pantallas;
  360 y 990 de las principales), sin errores de página ni desbordes.

## Decisiones a revisar
- Iconos elegidos para conceptos abstractos: «Reglas para recordar» = `nudo` (lazo de cabo), mapas de conceptos = `red`,
  chuleta = `chincheta`, resultado flojo del cierre = `repaso`.
- En el Temario con etiquetas, la barra fina de ideas dominadas sustituye a la barra «camino hasta tener el tema al día».
- El tema de una idea es el de la mayoría de sus preguntas (todas, no solo las de estudio), como en Mi progreso.

## Fuera / pendiente
- Emojis en datos (no tocados): `data/curso/per.json` y `py.json` («📝 Nota del profe», 5), `↔` en explicaciones de varios ejes.
- `src/illustrations/situations.js` pinta 🔔/🔊 en el SVG de la lámina de señal acústica; `src/teacher` sigue usando
  prefijos 💡⚠️🧠📝 como formato interno (la UI los cambia por iconos).
- Sonido, vibración y animaciones nuevas: otro encargo.
