# Pulido 2 — estado

Rama `feat/pulido-2`. Cuatro puntos, un commit cada uno.

| # | Punto | Estado |
|---|-------|--------|
| 1 | Mi progreso: resumen arriba (rango de la travesía + camino), examen final compacto, detalle con el lenguaje de la Travesía | hecho |
| 2 | Tarjeta del test de nivel en Hoy, discreta | pendiente |
| 3 | Radio de a bordo: tarjetas de episodio, guion plegado | pendiente |
| 4 | Identidad tipográfica (fuente propia, sin conexión) | pendiente |

## 1. Mi progreso

- `tarjetaRango(sy)` sale de `src/ui/views/travesia.js` (la Travesía la usa igual); Progreso llama a `sincronizarTravesia`, como Hoy: ni umbrales ni cálculos duplicados.
- Debajo, «Tu camino» (la misma `lineaAvance` y fracción del motor, con la barra `.barra-trav`) y el enlace «Ver mi travesía» (fila con flecha, como «Insignias»).
- `tarjetaFinalCompacta()` en `src/ui/views/theory.js`: cerrado → candado + una línea; las líneas del motor y la lista de temas con lo que falta, plegadas en «Ver qué falta». Abierto → la tarjeta de siempre (con su botón). La lógica de `estadoFinal` no cambia.
- Secciones con rótulo `.eti`; «Ideas por dominar» plegadas por tema (antes se abrían las que tenían flojas y la página medía 6500 px); «Ejercicios de carta» igual que antes, con icono.
- Capturas: `scratchpad/pul-capturas/antes|despues/progreso-*`.
