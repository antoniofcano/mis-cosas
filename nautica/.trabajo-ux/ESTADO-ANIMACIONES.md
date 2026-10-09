# Estado: láminas animadas (rama `feat/animaciones`)

El equivalente a un vídeo corto, pero dibujado, controlable y calculado. Guía en `docs/ESTILO-LAMINAS.md`
(«Láminas animadas», con las hipótesis físicas y las fuentes en el apéndice).

## Inventario previo (qué se movía y cómo)

| Lámina | Qué se movía | Control | Reducir movimiento |
| --- | --- | --- | --- |
| `evolucion` (PER UT 7) | flecha por la curva (SMIL `animateMotion`, 9 s en bucle), curva de proporciones a ojo | ninguno | no lo respetaba |
| `hombre-al-agua` (boutakow, anderson) | barquito por la derrota (SMIL), arcos y rectas dibujados | ninguno | no |
| `helice` | hélice girando y barco que oscilaba ±12° (SMIL) | ninguno | no |
| `meteo` borrasca / anticiclón | flechas que giraban en bloque (SMIL, 24 s) | ninguno | no |
| `marea` curva / doceavos / sonda | nada (mando de hora) | mando | — |
| `corriente`, `abatimiento` | nada (mandos) | mandos | — |
| `ciaboga` | barco que saltaba entre 4 posiciones (SMIL) | ninguno | no |
| `canal`, `bifurcacion`, `cruce`, `riesgo`, `dst`, `busqueda`, `movimiento`, `brisa`, luces y ritmos, socorro | barcos, trazos, luces (SMIL) | ninguno | no |

## Hecho (6 animaciones, con el reproductor común)

1. **Curva de evolución** (`evolucion`): modelo de Nomoto con deriva y «kick» (`src/nautical/maniobra.js`); la popa abre,
   avance, traslado, diámetro táctico y final acotados en su hito; reloj y caída.
2. **Hombre al agua** (`boutakow`, `anderson` y la nueva variante `scharnow`): mismas reglas del IAMSAR (60°, 250°, 240°,
   20° antes del opuesto) sobre el mismo modelo; estela, timón rotulado, náufrago, recogida.
3. **Efecto de la hélice** (`helice`, 4 variantes): hélice vista desde popa girando, barco que cae alrededor de su punto
   de giro, estelas de proa y popa; banda según `src/nautical/helice.js`.
4. **Marea** (`marea` curva, doceavos y sonda): la creciente entera; el tiempo es el mando de la hora.
5. **Borrasca y anticiclón** (`meteo`): partículas en espiral logarítmica que cruzan las isobaras 25° (`meteo.js`).
6. **Corriente y abatimiento** (`corriente` efectivo y rumbo a dar, `abatimiento`): una hora de navegación; el barco va
   de lado con la proa al Rv, el fantasma sin corriente y el triángulo que crece; al final, la construcción de la carta.

Reproductor `src/ui/animacion.js`: rAF, solo atributos de `[data-ani]`, pasos con nombre (anterior/siguiente),
deslizador con `aria-valuetext`, velocidad 0,5×/1×/2×, aviso `aria-live`, bucle opcional, pausa fuera de pantalla y con
la pestaña oculta, sin autoplay con «reducir movimiento» (enseña el fotograma final) ni en la explicación de una pregunta.

## Verificación

- `tests/animaciones.test.js` (17 tests): física (evolución, Boutakow sobre su estela al opuesto, Scharnow, Anderson,
  hélice, circulación, marea, corriente), fotogramas (texto ≥ 10,5 px, solo `--lc-*`, sin NaN, `data-ani`), imagen fija,
  reproductor con DOM mínimo (controles, reducido, fuera de pantalla, final, bucle).
- Playwright (`scratchpad/ani-ver.mjs`, `ani-verifica.mjs`, `ani-clase.mjs`): capturas en t=0, hitos y final, claro y
  oscuro a 390 (360/990 el final); controles, teclado, fuera de pantalla, pestaña oculta, reducido; sin errores ni
  desbordes; 60 fps con la CPU ×4; en clase el reproductor espera a la predicción.

## Decisiones a revisar

- Marea con «reducir movimiento»: enseña la hora de la spec (es la lámina interactiva), no la pleamar.
- Scharnow es una variante nueva de `hombre-al-agua` (en la galería del PY, UT 1).
- Los rótulos del SVG de la evolución van en metros del yate de ejemplo; el marco da esloras.
- Valores de la hélice (1,2°/s avante, 4,5°/s atrás) son cualitativos.

## Pendiente

- `helice-timon` (interactiva): animar hélice + timón con arrancada (mismo modelo).
- Frentes en corte (`frente-frio-corte`, `frente-calido-corte`): la cuña que avanza y las nubes que se forman.
- `ciaboga` y `desatraque` con el modelo de maniobra; `busqueda` (cuadrado y sectores) con el reproductor.
- Las animaciones SMIL que quedan (luces, canal, cruce…) no respetan «reducir movimiento»: pasarlas al reproductor o
  pausarlas con `svg.pauseAnimations()`.
