# Carta a pantalla completa (móvil)

Petición del dueño: «para las cartas náuticas en el móvil con pantalla pequeña, un botón de poder trabajar la carta en
pantalla completa».

## Qué hay

- **Entrar**: botón «Ampliar» (icono de flechas hacia fuera, rótulo accesible «Ampliar: carta a pantalla completa») en
  la barra de herramientas de **cualquier** carta: la mesa de cartas y la carta incrustada (`#/mesa`, ejercicios,
  preguntas, clases). Con el móvil tumbado, la mesa entra sola (la disposición normal dejaba la carta con 0 px de alto).
- **Salir**: botón «Salir» (rótulo «Salir de la pantalla completa»), siempre a la vista junto a la línea de lectura;
  también Esc (sale del modo sin cerrar la mesa) y, donde se usa la Fullscreen API, el gesto del sistema.
- **Disposición** (CSS propio, clase `completa`; no depende de la Fullscreen API):
  - vertical: carta arriba, barra de 8 iconos (Mover, Regla, Compás, Transportador, Punto, Texto, Goma, Más) y, al
    fondo, la línea de lectura (2 líneas; se despliega al tocarla) con «Enunciado» y «Salir»;
  - tumbado: la carta con todo el alto, barra de 2 columnas a la derecha con «Enunciado» y «Salir» debajo, y la
    lectura como una píldora de una línea sobre la carta;
  - «Más» despliega encima deshacer, coordenadas, situar, borrar todo, zoom, capa, calculadora y chuleta; se recoge al
    tocar la carta;
  - en la mesa, «Enunciado» abre el panel (Ejercicio / Tutorial / Tu respuesta) como hoja encima de la carta (arriba en
    vertical, a la izquierda tumbado) y lo vuelve a quitar; la carta sigue viva al lado.
- **Zonas seguras**: `env(safe-area-inset-*)` por los cuatro lados; mientras dura el modo se añade `viewport-fit=cover`
  a la etiqueta `viewport` y se quita al salir (el resto de la app no cambia).
- **Trazos**: no se tocan. En la mesa solo cambian clases; la carta incrustada pasa al final de `<body>` y vuelve a su
  hueco al salir (o al cambiar de ruta).
- **Fullscreen API**: solo como mejora, con el mismo botón, si existe y el puntero es táctil (Android); si el usuario
  sale con el gesto del sistema, se sale también del modo.
- `avisoCartaMovil` ya no manda a la tableta: explica el botón «Ampliar» y lo de girar el móvil.

## Ficheros

`src/ui/chart/interactive-chart.js` (modo, botones, API `setCompleta / enCompleta / accionesCompleta / extrasCompleta`,
opción `onCompleta`), `src/ui/chart/workspace.js` (bloque localizado: botón «Enunciado», cabecera fuera, ayudas a «Más»,
entrada automática tumbado), `src/ui/chart-widget.js` (texto del aviso), `src/ui/iconos.js` + `docs/ICONOS.md`
(`pantalla-completa`, `pantalla-reducir`), `styles/app.css` (bloque final «Carta a pantalla completa»),
`docs/ARCHITECTURE.md`, `tests/carta-completa.test.js` (nuevo), `sw.js` / `sw-lista.js` (precache).

Además: `tests/listo.test.js` fallaba ya en `main` por la fecha (usaba el reloj de verdad con respuestas fechadas el
2026-10-01; a partir de un mes deja de cumplirse). Se le fija `ahora`; no se toca el motor.

## Medidas (Chromium con Playwright, táctil; sin barras del navegador ni zonas seguras)

| Pantalla | Carta antes (mesa) | Carta a pantalla completa |
|---|---|---|
| 390×844 vertical | 390×273 (32 % del alto) | 390×736 (87 %); 724 si la lectura ocupa dos líneas |
| 360×640 vertical | 360×171 (27 %) | 360×520 (81 %) |
| 844×390 tumbado | 844×0 (no se veía) | 732×390 (100 % del alto, 87 % del área) |
| 640×360 tumbado | 0 de alto | 528×360 (100 % del alto, 82 % del área) |

Con las zonas seguras de un iPhone **simuladas** (47 px arriba y 34 abajo en vertical; 47 a cada lado y 21 abajo
tumbado): 390×643 (76 % del alto) y 638×390 (100 % del alto, 76 % del área).

## Comprobado en el navegador

A 390×844, 360×640, 844×390 y 640×360, claro y oscuro, con «reducir movimiento»: entrar y salir sin perder trazos (mesa
e incrustada), regla y compás con el dedo en modo completo, arrastrar y pellizcar sin que la página se mueva ni haga
zoom, «Más», abrir y cerrar el enunciado, tutorial, Esc, girar con el modo puesto, botones ≥ 44 px y con nombre, nada
fuera de la pantalla, calculadora encima, Fullscreen API (entra, y al salir del sistema sale el modo), escritorio
1280×800. `npm test`: 0 fallos.

## Sin comprobar (hace falta un iPhone de verdad)

- Que Safari / la PWA instalada apliquen el `viewport-fit=cover` puesto en caliente y que `env()` dé las medidas
  reales (isla dinámica, barra de inicio). Si no lo aplica, el modo funciona igual pero tumbado quedan las franjas.
- Gestos del sistema: deslizar desde el borde izquierdo (atrás) y desde abajo (inicio) al trazar cerca de los bordes.
- Pellizcar sobre la barra de herramientas (iOS ignora `user-scalable`; se confía en `touch-action: none`).
- El teclado en pantalla al escribir una nota o una respuesta con el modo puesto (sobre todo tumbado).
- Girar el iPhone con la PWA instalada: el manifiesto dice `orientation: portrait` (iOS lo ignora, según la
  documentación; en **Android instalada** sí bloquea el giro: habría que decidir si se cambia a `any`).
- Rendimiento del redibujado al girar y la voz del tutorial con el panel recogido.

## Limitaciones conocidas

- Tumbado, la calculadora flotante puede tapar «Salir» hasta que se mueve, se minimiza o se cierra (es una ventana
  propia, no se ha tocado).
- La chuleta y la calculadora de la mesa quedan a dos toques (dentro de «Más»).
- Al navegar con la mesa abierta, la mesa sigue abierta (ya pasaba); el modo completo sí se quita.
