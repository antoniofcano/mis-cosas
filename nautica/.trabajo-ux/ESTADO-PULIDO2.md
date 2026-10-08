# Pulido 2 — estado

Rama `feat/pulido-2`. Cuatro puntos, un commit cada uno.

| # | Punto | Estado |
|---|-------|--------|
| 1 | Mi progreso: resumen arriba (rango de la travesía + camino), examen final compacto, detalle con el lenguaje de la Travesía | hecho |
| 2 | Tarjeta del test de nivel en Hoy, discreta | hecho |
| 3 | Radio de a bordo: tarjetas de episodio, guion plegado | hecho |
| 4 | Identidad tipográfica (fuente propia, sin conexión) | pendiente |

## 1. Mi progreso

- `tarjetaRango(sy)` sale de `src/ui/views/travesia.js` (la Travesía la usa igual); Progreso llama a `sincronizarTravesia`, como Hoy: ni umbrales ni cálculos duplicados.
- Debajo, «Tu camino» (la misma `lineaAvance` y fracción del motor, con la barra `.barra-trav`) y el enlace «Ver mi travesía» (fila con flecha, como «Insignias»).
- `tarjetaFinalCompacta()` en `src/ui/views/theory.js`: cerrado → candado + una línea; las líneas del motor y la lista de temas con lo que falta, plegadas en «Ver qué falta». Abierto → la tarjeta de siempre (con su botón). La lógica de `estadoFinal` no cambia.
- Secciones con rótulo `.eti`; «Ideas por dominar» plegadas por tema (antes se abrían las que tenían flojas y la página medía 6500 px); «Ejercicios de carta» igual que antes, con icono.
- Capturas: `scratchpad/pul-capturas/antes|despues/progreso-*`.

## 2. Tarjeta del test de nivel (Hoy)

- Superficie normal (borde fino, sin azul), icono `diana` en disco, una línea, «Hacer el test» como botón secundario y «Ahora no» como enlace pequeño subrayado (44 px de alto).
- Va DEBAJO de «Sesión de hoy» (antes iba encima): así es claramente secundaria. A revisar si se prefiere arriba.
- Texto condensado: «¿Ya sabes algo? Test de nivel: 20 preguntas, 8 min; te saltas las clases que ya sabes.» A medias: «Test de nivel a medias. Sigue donde lo dejaste.» + «Seguir el test».

## 3. Radio de a bordo

- `tarjetaEpisodio()` en `src/ui/views/podcast.js` sustituye a las «boyas»: botón de reproducir de 44 px (pone el audio y abre el episodio, como antes), número + título (enlace al episodio), tipo con su icono (o el tema, en el destacado), duración y estado: «Sin escuchar», «Escuchado» (icono ok) o «En curso · N %» con barra. Sin audio: disco de reloj a trazos y «Próximamente».
- La sinopsis y el arranque del guion (cursiva) van plegados en «Ver el guion», con el enlace «Abrir el episodio con el guion entero →».
- «Para empezar / Siguiente parada / Sigue escuchando»: la misma tarjeta sobre fondo suave, con el tema y su icono. Se arregla de paso que el recomendado no traía su tema.
- La vista del episodio (reproductor, guion al hilo, minijuego) y `enlaceEpisodio`/`episodiosDeTema` no cambian.
- Decisión: en la lista, cada tarjeta muestra el TIPO (panorama/profundiza) con icono y no el tema, porque ya está agrupada bajo la cabecera del tema con su icono; el tema aparece en la tarjeta destacada.
