# Estado: entrada única (Hoy + Travesía)

Rama `feat/entrada-unica`. Reglas y composición en `docs/ENTRADA.md`.

## Hecho

- Hoy rehecha como entrada única: cabecera mínima (saludo + `PER · N días al examen`), héroe con la carta de la derrota en
  compacto (la misma `cartaDerrota` de la Travesía, extraída en el mismo fichero) con el marcador «estás aquí»
  (`barco-marca`, icono nuevo) y enlace «Ver mi derrota»; tarjeta «Siguiente parada» con un solo botón (Seguir / Empezar),
  pasos plegados («3 pasos · 21 min»), fase como etiqueta con su ayuda plegada (incluye mirar otra fase); fila de estado
  (rango, semana, ¿estás listo? en una línea); lo secundario debajo.
- Estados: nuevo, en curso, a medias, hecho hoy («Hoy ya has navegado» + mañana + parte + repaso extra), sin etiquetas
  (sin héroe; camino en vez de rango).
- Travesía: «Seguir la sesión» / «Seguir la derrota» arriba si la sesión de hoy no está hecha; marcador en la carta. Se
  quita la tarjeta «Tu travesía» de Hoy (`tarjetaTravesiaHoy`), ya sin uso.
- Funciones puras en `src/course/entrada.js` con `tests/entrada.test.js`.
- CSS en el bloque `/* ---- Entrada única ---- */` al final de `styles/app.css` (sin animaciones).
- Verificación con Playwright (`scratchpad/ent-pw.mjs`): 360/390/990, claro y oscuro, nuevo, mixto, hecho hoy, sin
  etiquetas, PY; sin desborde, zonas táctiles >= 44 px, sin errores de consola; Seguir arranca la sesión, la carta abre
  la Travesía y «← Hoy» vuelve. Capturas antes/después en `scratchpad/ent-capturas/`.

## Pendiente / a revisar

- Integración con `feat/efectos` (animaciones): toca `src/ui/views/travesia.js` (la carta se ha envuelto en
  `cartaDerrota`) y `styles/app.css` (bloque propio al final).
