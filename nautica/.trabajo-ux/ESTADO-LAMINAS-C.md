# Estado: láminas en estilo C

Rama `feat/laminas-c`. Guía: `docs/ESTILO-LAMINAS.md`.

## Hecho

1. **Guía y sistema** — `docs/ESTILO-LAMINAS.md` (paleta, tipografía, reglas, apéndice de verificación),
   `styles/laminas.css` (tokens `--lc-*` claro/oscuro, tema forzado), `src/illustrations/estilo-c.js` (lienzo con
   patrones, marco con graduación, cartela, cotas lineales y de ángulo, ondas, tierra, reloj, rosa, pasos, barcos),
   `luzC()` y `cronoC()` en `lights.js`.
2. **Marco HTML** — `src/ui/lamina-marco.js` + `src/illustrations/marcos.js` (titulo, clave, nota, datos, alt, tema).
   Galería (h1 = título del marco), clases, ficha de idea; en la explicación de una pregunta, solo la figura. En clase,
   con predicción pendiente, el marco oculta título, clave, datos y nota hasta responder.
3. **Diez pilotos** — cardinales (fichas y la interactiva), marcas IALA (todas las clases), canal y bifurcación, luces
   de un buque de motor, cruce (y veleros), partes del barco (y barlovento/sotavento), borrasca y anticiclón, hélice y
   hélice-timón, hombre al agua (Boutakow, Anderson), estabilidad, marea (curva, doceavos, sonda).
4. **Limpieza** — sin emojis en `src/illustrations` (🔊 🔔 fuera; ✕ ▼ ⇒ ↺ ↻ cambiados) y test que lo vigila.

Tests nuevos: `tests/laminas-estilo.test.js` (contraste AA, tokens en los dos modos, piezas sin colores fijos, texto
≥ 10,5 px efectivos, marco completo, partes dibujadas, ids estables) y el de emojis en `tests/iconos.test.js`.

Capturas antes/después: scratchpad `lam-capturas/` (`antes-*`, `despues-*`, `d2-*`), 360/390/990, claro y oscuro.

## Pendiente (propuesta de orden por rentabilidad)

1. `buque` (luces y marcas de buques, ~20 láminas + tarjetas): mucho peso en el examen; reutiliza `noche()`.
2. `ritmo` (6) y `sonido` (16): pequeñas, con `cronoC()` y un cronograma de pitadas igual.
3. `meteo` restante: Buys-Ballot, brisas, frentes en corte (las interactivas isobaras, nieblas y frentes después).
4. `socorro` y `bandera`: muchas variantes con el mismo molde.
5. PY carta: `rosa`, `nortes`, `corriente`, `abatimiento`, `demoras`, `loxodromica`, `enfilacion`.
6. `lecciones/*` (láminas propias de las clases, el grueso del catálogo).
7. Sueltas: `regiones`, `marea` fases, `dst`, `jerarquia`, `riesgo`, `movimiento`, `amarras`, `busqueda`, `fuego`,
   `evolucion`, `ciaboga`, `desatraque`, `beaufort`, `viento-aparente`.
