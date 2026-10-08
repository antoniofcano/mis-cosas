# La entrada única (pestaña Hoy)

Al abrir la app, en un vistazo y sin leer: **dónde estoy** en mi viaje, **qué toca ahora** y **un botón grande para
seguir**. Todo lo demás es secundario y va debajo. Hoy y la Travesía dejan de ser dos ideas separadas: Hoy enseña la
derrota en pequeño y la Travesía es su vista de detalle.

Código: `src/course/entrada.js` (funciones puras: estado, siguiente parada, faro del marcador, textos cortos),
`src/ui/entrada.js` (arrancar la sesión y poner el marcador, compartido por Hoy y la Travesía), `src/ui/views/hoy.js`
(la pantalla) y `cartaDerrota()` de `src/ui/views/travesia.js` (la carta, la misma en las dos pantallas). Estilos: el
bloque `/* ---- Entrada única ---- */` de `styles/app.css`. Tests: `tests/entrada.test.js`.

Nada de esto cambia la lógica de la sesión, del dominio, del repaso, de «¿Estás listo?», de los rangos ni de las
insignias: solo la presentación y la composición.

## Composición (móvil primero, de arriba abajo)

| # | Elemento | Qué enseña | Qué abre |
|---|---|---|---|
| 1 | Cabecera | Saludo y una línea de contexto: `PER · 38 días al examen` (`lineaContexto`), y el banco con que estudias si hay varios | La píldora, Ajustes → fecha del examen; el banco, Ajustes |
| 2 | **Héroe: la carta** | La carta de la derrota en compacto (≈ 200–225 px de alto): mismos faros, patas, colores y bandera que la Travesía, faros sin botón, con el marcador **«estás aquí»** (icono `barco-marca`) en el faro de la siguiente parada | Toda la carta es un enlace a `#/<tit>/travesia`; debajo, el enlace explícito «Ver mi derrota» |
| 3 | Fase (etiqueta) | `Fase 1 · Aprender` y «¿Qué es esto?», plegado: el porqué de la fase y los tres botones para **mirar** otra fase (la de siempre: el plan no cambia) | — |
| 3 | **Tarjeta principal** | «Siguiente parada»: el nombre de la clase (o del tema) que toca, su tipo («Clase nueva · tramo 1 de 3»), los minutos y el botón grande **Seguir** (o **Empezar**). Debajo, `3 pasos · 21 min` con «Ver los pasos» plegado (te cuesta, punto de partida, pasos, «Ya lo sabes: saltar») | «Seguir» arranca la sesión de hoy (`empezarSesion` → `#/<tit>/sesion`, el ejecutor de siempre) |
| 4 | Fila de estado | Rango (nombre + barra fina) o, sin carta, «Tu camino» (%); la semana en 7 puntos con el día de descanso; «¿Estás listo?» en una línea con su margen (`listoCorto`) | Rango y semana → Travesía (sin carta, `#/progreso`); ¿Estás listo? → Travesía (nota real) o, sin carta, despliega «Ver mi progreso» |
| 5 | Secundario | Test de nivel (solo alumno nuevo), aviso del plan si lo hay, podcast del tema, minutos de hoy y racha, «¿Primera vez?», «Ver mi progreso» (plegado: meta, avance, ¿Estás listo? completo, «Si te sobra tiempo», «Tengo 5 minutos»), copia de seguridad, temario | Cada uno, lo de siempre |

En pantallas anchas (≥ 760 px) la carta y la tarjeta van lado a lado; la fila de estado, en una sola fila.

## Estados (`estadoEntrada`)

| Estado | Cuándo | Tarjeta principal |
|---|---|---|
| `nuevo` | Sin sesión de hoy, ni una respuesta ni una clase terminada (`esNuevo`) | «Siguiente parada» + **Empezar**; carta con los faros apagados y el marcador en el primero (el inicio); test de nivel como opción secundaria |
| `en-curso` | Sin sesión de hoy | «Siguiente parada» + **Seguir** |
| `a-medias` | Sesión de hoy empezada sin terminar | «Sesión a medias», el paso por el que vas, **Seguir** (al ejecutor) y «Empezar una sesión nueva» |
| `hecho-hoy` | Sesión de hoy hecha | «Hoy ya has navegado», aciertos, **Mañana:** lo que tocaría (`lineaManana`, como el resumen de la sesión), «Ver el parte de hoy» y «Repaso extra»; el avance sigue a la vista |
| sin etiquetas | El banco no tiene conceptos (`conceptos.json` vacío) | Lo mismo, **sin héroe**; la fila de estado usa el camino en vez del rango (`modo: 'sin-etiquetas'`) |

Mirando otra fase (desde la ayuda plegada), la tarjeta enseña «Así sería en …» con sus pasos y «Volver a mi sesión».
Un examen a medias sale como primer paso, con «Descartar el examen a medias», como siempre.

## El marcador «estás aquí»

`faroDeParada(faros, ut, temaDe)`: el faro de la carta donde cae el tema (`ut`) de lo que toca (la clase de la sesión o,
a medias, de sus pasos pendientes). Cada idea va a un tema con `temaDeIdea` (el mismo reparto que el Temario y Mi
progreso) y gana el faro con más ideas de ese tema. Sin tema (repaso de fallos, mezclado, simulacro): el primer faro sin
encender (`siguienteParada`); con todos encendidos, la bandera del examen. La Travesía pone el marcador en el mismo sitio.

Texto alternativo de la carta (`textoCarta`): «Tu derrota: 2 de 6 faros encendidos. Estás en Seguridad, faro 3 de 6;
siguiente parada: «…». Abre tu derrota completa.»

## La Travesía (`#/<tit>/travesia`)

Sigue siendo la vista de detalle (rango, carta grande con faros que se eligen, ideas por reforzar, semana, nota real e
insignias). Arriba: «← Hoy» y, si la sesión de hoy no está hecha, **Seguir la sesión** (va a medias) o **Seguir la
derrota** (arranca la de hoy, la misma que ofrece Hoy). La tarjeta «Tu travesía» que había en Hoy desaparece: su
contenido vive ahora en la carta y en la fila de estado.

## Accesibilidad y reglas

Botones y enlaces reales de 44 px o más; la carta es un único enlace con texto alternativo útil (los faros, dentro, no son
interactivos); orden de tabulación: cabecera, carta, «Ver mi derrota», fase, Seguir, pasos, estado, secundario. Claro y
oscuro con los tokens de siempre. Sin animaciones nuevas.
