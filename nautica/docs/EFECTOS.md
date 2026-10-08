# Efectos: movimiento, sonidos y vibración

Criterio rector: los efectos **acompañan** al aprendizaje. Nunca presionan, no distraen y no premian la velocidad.
No cambian nada de la lógica (respuestas, dominio, repaso, «¿Estás listo?», travesía): solo pintan, suenan o vibran
cuando algo ya ha pasado.

## Qué anima, qué suena y qué vibra

| Momento | Animación (sin «reducir movimiento») | Sonido (si «Sonidos» está activado) | Vibración (si «Vibración» está activada) |
|---|---|---|---|
| Aciertas una pregunta (tanda, clase, repaso, ejercicios de tocar, emparejar y cuentas) | Pulso suave en la opción elegida (`rebote`, 320 ms) | «Tic»: seno de 1568 Hz con un armónico tenue, ~0,1 s | Un pulso de 12 ms |
| Fallas una pregunta | Temblor leve de la elegida (±3 px, 320 ms); la correcta se revela con calma un instante después (`revela`, 450 ms) | Un toque grave (262 Hz), muy bajo y breve. Nada que suene a castigo | Dos pulsos muy suaves (6 ms, pausa, 6 ms) |
| Un faro pasa a encendido | Destello con halo y la lámpara que se enciende (`faro-enciende`, 450 ms) en el parte de la sesión, en la carta de la Travesía y en el Temario. Después, el halo suave continuo de siempre (solo carta y parte) | Campanilla (dos notas que suben) solo en el parte de la sesión | Patrón corto (18, 90, 18) en el parte |
| Subes de rango | Su propio momento en el parte: el disco sube y brilla una vez (`rango-sube`, 850 ms) | Campanilla | Patrón corto (18, 90, 18, 90, 30) |
| Insignia nueva | Entrada suave del disco (`insignia-entra`, 450 ms) en el parte y en la pantalla de insignias | — | — |
| Terminas una sesión (resumen con parte de travesía) | — | Campana de guardia: dos campanadas suaves (síntesis aditiva, parciales inarmónicos, caída exponencial). Si además se encendió un faro o subiste de rango, primero la campanilla y la campana 0,7 s después | — |
| Barras de avance (rango, Tu camino, Temario, sesión) | Se rellenan al aparecer (`crecer`, 450 ms) y se deslizan al cambiar | — | — |
| Cambiar de pantalla o de tarjeta | Las transiciones de siempre (View Transitions), ahora con variables | Nunca | Nunca |

**Solo el cambio, no cada visita.** `src/ui/efectos.js` guarda en este aparato (`localStorage`, clave
`nautica.efectos.vistos.v1`, aparte del progreso: no viaja en la copia) qué faros, insignias y partes ya se han visto.
La primera visita a una pantalla no anima nada; después, solo lo que ha cambiado desde la última vez. El parte de una
sesión anima (y suena) solo la primera vez que se enseña; volver a él lo enseña quieto y en silencio, y avisa a la carta
de la Travesía de que esos faros ya se encendieron delante del alumno.

**Sin sonidos al entrar en una pantalla.** La carta de la Travesía y el Temario solo animan: un sonido al abrir una
pantalla sería un sonido al navegar. Suenan las respuestas, el parte y el final de la sesión.

**Al repasar un examen ya hecho** (la revisión con el profe) las tarjetas no se mueven ni suenan.

## Ajustes

En **Ajustes → Sonidos y vibración** (y la fila de Ajustes en **Más** lo menciona):

- **Sonidos** (`settings.sonidos`, `false` por defecto). Al encenderlo se crea el AudioContext (es un gesto del
  usuario) y suena un tic de muestra. «Escuchar la campana» toca la campana de guardia para probar el volumen.
- **Vibración** (`settings.vibracion`, `false` por defecto). Al encenderla, un pulso de muestra. Si el aparato no
  puede vibrar desde el navegador (Safari de iPhone no tiene `navigator.vibrate`), el interruptor no aparece y una
  línea lo explica.

Migración: un progreso de antes, sin estos campos (o con un valor que no es `true`/`false`), se queda con los dos en
`false` (`src/store/progress.js`, `normaliza`). Nada más cambia. Antes la app vibraba siempre al corregir en los
móviles que podían; ahora solo si se activa.

## Reglas de sonido

- **Autoplay**: no se crea ningún AudioContext hasta el primer gesto del usuario (toque o tecla) y solo si los sonidos
  están activados (`escucharPrimerGesto`). Si el contexto está suspendido, se reanuda y el sonido solo se toca si lo
  consigue en menos de 300 ms: un sonido que llega tarde ya no acompaña a nada.
- **Modo silencioso**: en Safari se pide `navigator.audioSession.type = 'ambient'`, que respeta el interruptor de
  silencio del iPhone y no corta la música de otras apps. En el resto, el volumen del sistema manda.
- **La voz del profe y la radio de a bordo mandan**: mientras habla el profe (Web Speech) o suena un episodio, los
  efectos callan.
- **Nada de música ni de sonidos al navegar.**

### Límites de volumen

- Bus maestro: `GANANCIA_MAX = 0.2` (de 0 a 1).
- Las notas de un sonido se normalizan para sumar 1 como mucho: ni sonando todas a la vez se pasa del bus maestro.
- Cada sonido lleva además su volumen relativo: tic 0,5 · fallo 0,12 · campanilla 0,45 · campana 0,8.
- Cada nota: ataque de 2–5 ms desde 0, caída exponencial hasta 0,0001 y un fundido lineal a 0 de 30 ms antes de
  parar el oscilador (sin clics).
- Límites comprobados por los tests: 60–8000 Hz, ataque 2–50 ms, caída 20 ms–3,5 s, duración total ≤ 4,5 s.

## Movimiento

Todas las duraciones y curvas están en variables CSS en `:root` (`styles/app.css`):

| Variable | Valor | Uso |
|---|---|---|
| `--dur-rapida` | 150 ms | retrasos breves (la correcta se revela tras el temblor) |
| `--dur-corta` | 200 ms | barra de actividad, trazo del visto |
| `--dur-media` | 260 ms | panel del profe, barras de la sesión |
| `--dur-respuesta` | 320 ms | opción que reacciona, panel de corrección |
| `--dur-larga` | 450 ms | faro que se enciende, insignia, barras |
| `--dur-momento` | 850 ms | subida de rango (el único que pasa de 450 ms) |
| `--dur-vt`, `--dur-vt-sale`, `--dur-vt-entra` | 200, 80, 160 ms | transiciones entre tarjetas y pantallas (las de siempre) |
| `--ease-sale`, `--ease-suave`, `--ease-entra` | `cubic-bezier(.2,.8,.2,1)`, `ease-out`, `ease-in` | curvas |

- Todo lo nuevo está dentro de `@media (prefers-reduced-motion: no-preference)`. Además, con «reducir movimiento» el JS
  no pone las clases de cambio (`claseAnimada()` devuelve `''`): el cambio se ve (el faro está encendido, el rango y
  la insignia aparecen con su texto), pero quieto.
- Nada comunica información solo con movimiento: el estado siempre está en el texto y en el color de reposo.
- Cero confeti, cero parpadeos y ninguna animación infinita nueva: la única en bucle es el halo suave de los faros
  encendidos, que ya existía (los tests lo comprueban).

## Cómo añadir un efecto

1. **Sonido**: escribe en `src/audio/efectos.js` una función pura que devuelva `sonido(nombre, volumen, notas)` con
   `nota(f, t, ataque, caida, amp)` y regístrala en `SONIDOS` con el nombre del efecto. Los tests de
   `tests/efectos.test.js` comprueban todos los de `SONIDOS` contra los límites.
2. **Vibración**: añade su patrón a `PATRONES` en `src/ui/efectos.js` (corto: ≤ 120 ms cada pulso, ≤ 300 ms en total;
   `null` = no vibra).
3. **Disparo**: llama a `efecto('nombre')` (o `respuesta(ok)` al corregir) donde ocurre el cambio. Nunca al entrar en
   una pantalla ni al navegar.
4. **Animación de cambio**: decide qué es nuevo con `novedades(ambito, idsDeAhora)` y pon la clase con
   `claseAnimada('clase')`; define su `@keyframes` y la regla dentro de `@media (prefers-reduced-motion:
   no-preference)` usando las variables `--dur-*` y `--ease-*`.
5. Documenta aquí el momento, el sonido y la vibración.

## Lo que no se puede comprobar con tests

El oído. Los tests y la verificación en navegador comprueban que los sonidos se programan (osciladores, frecuencias,
envolventes, ganancias, que no suenan sin gesto ni con el profe hablando), pero si el tic resulta agradable, si la
campana suena a campana de barco y si el volumen es el adecuado en un móvil real hay que oírlo.
