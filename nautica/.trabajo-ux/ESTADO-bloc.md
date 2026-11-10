# Bloc de notas (hoja de borrador en los ejercicios de cuentas)

Petición del alumno: «En el ejercicio de mareas poder abrir una nota con el enunciado y donde desarrollar el
ejercicio usando la calculadora y tomando notas de los valores». Confirmado: en **todos** los ejercicios de cálculo.

## Qué es

Un botón «Bloc» (lápiz; con un punto ámbar si ya hay algo apuntado) que abre la hoja de borrador de ese ejercicio:

- **El enunciado a la vista**, con sus datos marcados; en las preguntas reales, también el enunciado común, los datos
  que acompañan (p. ej. la tabla del Anuario de Mareas) y las opciones.
- **Fichas «Datos»**: los números del enunciado con su unidad (`04:15 UT`, `0,45 m`, `36º 05,0′ N`, `+6º`, `8 nudos`).
  Tocar una la escribe en la nota donde está el cursor.
- **Notas**: texto libre, una línea por valor («Hb = 0,45 m»). Tira de signos que cuesta encontrar en el teclado del
  móvil: `=`, `°`, `′`, `→` e «Intro». Ni las fichas ni los signos quitan el foco de la nota (no se cierra el teclado).
- **Calculadora**: el botón abre la de siempre (la flotante). «Apuntar <resultado>» lleva a la nota lo que marca la
  pantalla (desactivado si no hay resultado o hay error).
- **Se guardan solas** al escribir, en el aparato (`localStorage`, `nautica.bloc.v1`): siguen ahí al cerrar el bloc, al
  cambiar de pantalla y al recargar. «Borrar» (papelera, con confirmación). Otro ejercicio (otra semilla, otra
  pregunta, «Otra con otros números») empieza en blanco. Se conservan las 40 más recientes y 60 días. No van al progreso
  ni al registro de sincronización.

Forma: en el móvil (≤ 700 px) una hoja a pantalla completa que se ajusta al teclado (`visualViewport`) y deja sitio a
la calculadora acoplada (con ella desplegada se aprieta: sin cabecera ni fichas, enunciado + dos líneas de nota +
«Apuntar»; al tocar la nota la calculadora se minimiza sola, como ya hacía, y la hoja crece). En pantallas anchas, una
columna a la izquierda que aparta la página (se sigue viendo y se puede responder), con la calculadora flotante al lado.
En la mesa de cartas, una pestaña «Bloc» del panel, entre «Ejercicio» y «Tutorial», con la misma nota que fuera.

## Dónde aparece

| Sitio | Fichero | Nota (identificador) |
| --- | --- | --- |
| Ejercicios generados `#/ej/<tipo>` (los 17 tipos, con y sin carta: mareas, estima analítica…) | `views/exercise.js` | tipo + semilla |
| «Haz la cuenta» de las clases y del apéndice «Las cuentas del patrón» | `views/curso.js` (`pasoCuenta`) | clase + tarjeta + semilla |
| «Problema modelo» de las clases | `views/curso.js` (`accionesModelo`) | la del problema |
| «¿Lo pillas? Pregunta de examen» de las clases, si es de cuentas | `views/curso.js` | pregunta |
| Preguntas reales de cuentas en las tandas (fila de fichas, junto a «Calculadora») | `views/theory.js` (`chipsPregunta`) | pregunta |
| Pregunta real suelta `#/q/<id>` | `views/exams.js` | pregunta (la misma que en la tanda) |
| Examen cronometrado (simulacro, real, final), en las preguntas de cuentas | `views/theory.js` (`testView`) | examen + pregunta |
| Mesa de cartas (pestaña «Bloc») desde cualquiera de los anteriores | `chart/workspace.js` | la del que la abre |

«Pregunta de cuentas» (`esDeCuentas`): las del tema de carta (en el PY, también mareas y loxodrómica), las que piden
la carta y, fuera de ese tema, las que traen datos, piden calcular y tienen todas las opciones numéricas
(`preguntaDeCuentas`, criterio prudente).

En el examen: es papel de borrador (como en el de verdad). Sin glosas, pistas ni soluciones; la calculadora y «Apuntar»
solo si el examen la permite; la nota es de ese examen (no trae lo apuntado al practicar la misma pregunta) y sigue ahí
si se sale y se continúa el examen.

## Dónde no, y por qué

- `views/cuentas.js` (índice de «Las cuentas del patrón»): es una lista de clases, no hay enunciado. Las cuentas están
  en las clases, que sí lo llevan.
- `#/calculadora`: no hay ejercicio al que atar la nota.
- La revisión de un examen ya corregido: no se ha puesto (ahí ya no se resuelve).
- Preguntas de teoría sin cuentas: no se ofrece.
- Carta resuelta paso a paso y tutorial: son para mirar, no para resolver.

## Cambios de comportamiento a tener en cuenta

- La cuenta de una clase recuerda su semilla durante la sesión (`sessionStorage`): **al recargar sale la misma cuenta**
  (antes salía otra), para que la nota siga siendo la suya. Al comprobarla bien o ver cómo se hace se olvida; «Otra con
  otros números» la cambia.
- `tests/listo.test.js`: un test dependía de la fecha real (fallaba en la rama base desde un mes después de la fecha de
  sus datos). Se le ha fijado el reloj; no toca código de la app.

## Ficheros

Nuevos: `src/bloc/notas.js` (lógica pura), `src/ui/bloc.js` (componente), `tests/bloc.test.js` (16 tests).
Tocados: `src/ui/calculadora.js` (dos exportaciones: `resultadoCalculadora`, `alCambiarCalculadora`),
`src/ui/views/{exercise,exams,theory,curso}.js`, `src/ui/chart/workspace.js` (import, una línea de JSDoc y un bloque de
cuatro líneas donde se definen las pestañas; `interactive-chart.js` no se toca), `styles/app.css` (bloque al final),
`docs/ARCHITECTURE.md`, `tests/listo.test.js`, `sw-lista.js`.

## Comprobado en navegador (Chromium con Playwright, app servida en local)

- La nota sobrevive a recargar: ejercicio de mareas, cuenta de clase (misma cuenta y misma nota) y pregunta de una tanda.
- Otro ejercicio / «Otra con otros números» / siguiente pregunta: bloc en blanco; al volver al anterior, su nota.
- Ir a Hoy y volver: la nota sigue. La hoja se cierra sola al cambiar de pregunta o de pantalla.
- Fichas y signos escriben en el cursor sin quitar el foco de la nota. «Apuntar» lleva el resultado de la calculadora.
- Borrar vacía la nota y lo guardado; el punto del botón aparece y desaparece.
- La nota escrita fuera se ve en la pestaña «Bloc» de la mesa y al revés. Esc en la nota de la mesa no cierra la carta.
- Examen del PY (con calculadora) y del PER en un eje sin calculadora: sin botón de calculadora ni «Apuntar» en el bloc
  ni en la mesa, sin pestaña «Tutorial», sin glosas; la nota sigue al cambiar de pregunta y volver.
- 360 y 990 px, claro y oscuro, sin desbordamiento horizontal ni botones menores de 44 px (a 320 px solo se ha mirado que no desborda).
- «Reducir movimiento»: sin animación de entrada ni transición.

## Sin comprobar

- **iPhone real**: el ajuste al teclado con `visualViewport` y que tocar una ficha no cierre el teclado se han probado
  solo en Chromium (el teclado, simulado con una ventana baja). Hay que mirarlo en Safari de iOS y en la app instalada.
- Lector de pantalla (VoiceOver): rótulos y regiones puestos, sin probar con uno de verdad.
- Examen «final» y examen «real» por convocatoria: comparten el código del simulacro, que es el que se ha recorrido.
- «¿Lo pillas? Pregunta de examen» de las clases: el botón está puesto con el mismo componente, pero no se ha abierto
  en el navegador en esa tarjeta (el «Problema modelo» sí, y su nota aparece en la pestaña «Bloc» de su carta).
- La fusión con el trabajo de «carta a pantalla completa» en `workspace.js` (no estaba en esta rama).

Capturas: `/tmp/claude-0/-home-user-mis-cosas/1ed25e87-cf04-586d-9dc7-3c5b3383751a/scratchpad/bloc/`.
