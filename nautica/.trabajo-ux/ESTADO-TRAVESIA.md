# Estado: Travesía (fases 1 y 2)

Rama `feat/travesia`. Reglas completas en `docs/TRAVESIA.md`.

## Hecho
- `src/course/travesia.js`: faros, rango (máximo guardado), semana, insignias, foto y parte de sesión, carta. Puro, con tests (`tests/travesia.test.js`, 28).
- Almacén: campo opcional `travesia` versionado (`progress.travesia/guardarTravesia/ganarInsignia`), migración suave.
- Pantallas: `#/<tit>/travesia`, `/insignias`, tarjeta en Hoy, filas en Más y Progreso, vuelta desde la ficha (`desde=travesia/<faro>`).
- Parte de travesía en `#/<tit>/sesion` con la foto guardada al «Empezar la sesión».
- «Guardia de 5 minutos» se apunta al terminar la tanda de «5 minutos».
- Verificado con Playwright (360/390/990, claro/oscuro, nuevo/mixto, parte, sin etiquetas, reduced-motion): capturas en scratchpad `trav-capturas/`.

## Decisiones a revisar
- Agrupación de 13 bloques en 6 faros (PY: 3 faros).
- Ideas con < 3 preguntas se dominan con todas bien (si no, faros imposibles).
- «Bloque completo» = 100 % del faro; «Idea rescatada» = floja -> no floja en una sesión, o dominada con primer fallo.
- Travesía usa solo respuestas a preguntas del estudio (cuarentena); tras el examen final puede diferir levemente de otros conteos por idea.
- Rangos 20/45/70/90 % con simulacro (Contramaestre) e inédito (Patrón).

## Fuera
- Sesiones empezadas antes de la travesía no tienen parte (sin foto).
- Racha semanal acumulada entre semanas, notificaciones, insignias por podcast/tarjetas.
