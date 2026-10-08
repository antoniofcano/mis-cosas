# Estado: efectos (movimiento, sonidos y vibración)

Rama `feat/efectos`. Reglas y límites en `docs/EFECTOS.md`.

## Hecho
- `src/audio/efectos.js`: sonidos sintetizados con WebAudio (tic, fallo neutro, campanilla, campana de guardia con
  parciales inarmónicos), funciones puras + motor fino con AudioContext inyectable. Tope de ganancia 0,2 y fundido final.
- `src/ui/efectos.js`: ajustes (apagados por defecto), primer gesto, voz del profe/radio callan los efectos, patrones de
  vibración, «ya visto» por aparato para animar solo el cambio, `claseAnimada()` que respeta «reducir movimiento».
- Ajustes: sección «Sonidos y vibración» (checkbox reales con etiqueta; sin `navigator.vibrate`, una línea lo explica).
  Fila de Ajustes en Más lo menciona. Migración suave en `progress.js` (`sonidos`/`vibracion` = false).
- Animaciones: opción recién corregida (pulso / temblor leve + correcta que se revela), faro que se enciende (parte,
  carta, Temario), rango nuevo en el parte, insignia nueva (parte y pantalla de insignias), barras con llenado corto.
  Duraciones y curvas en `--dur-*` / `--ease-*`; transiciones de pantalla iguales que antes.
- La vibración antigua (siempre activa en `movimiento.js`) pasa a ser opcional (`efectos.js`).
- Tests: `tests/efectos.test.js` (17). Suite completa en verde.
- Navegador (scratchpad `efe-pw.mjs`, capturas en `efe-capturas/`): por defecto nada suena ni vibra; con sonidos, el
  AudioContext se crea tras el gesto y se programan los osciladores esperados (tic 2, fallo 1, campanilla 4, campana
  18); con el profe hablando, calla; vibración simulada con los patrones; parte con faro, rango e insignias animados
  una vez y en silencio al volver; carta y Temario solo animan el faro nuevo; reduced-motion sin animaciones; claro y
  oscuro; 360/390/990 sin desborde; objetivos ≥ 44 px.

## Decisiones a revisar
- La carta de la Travesía y el Temario animan el faro nuevo pero no suenan (sería sonido al navegar).
- Fallo con un toque grave casi inaudible (volumen 0,12 de 0,2) en vez de silencio.
- Campana de guardia en cualquier final de sesión (con o sin parte), una vez por sesión.
- «Ya visto» vive en `localStorage` aparte del progreso (no viaja en la copia de seguridad).
- La vibración deja de estar activa por defecto (antes vibraba siempre al corregir).

## Pendiente / fuera
- Oírlo en un móvil real (timbre, volumen, que no resulte molesto).
- Sin sonido al encender un faro fuera de una sesión (solo animación en carta/Temario).
