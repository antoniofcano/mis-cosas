# Patrón · Preparador del examen de PER y Patrón de Yate

Aplicación web estática, gratuita y sin dependencias para **aprobar el examen teórico de Patrón de Embarcaciones
de Recreo (PER) y de Patrón de Yate (PY)** de la Junta de Andalucía. Empezó como simulador de cartas y hoy cubre
el examen entero: teoría, carta y simulacros.

## Cómo está organizada

Pensada para estudiar en el móvil, en sesiones cortas y sin tener que explorar: cada pantalla tiene una sola
acción principal, toda actividad termina en una pantalla de cierre y todo se retoma donde se dejó.
La primera vez, una bienvenida de tres pasos pregunta la titulación, la fecha del examen y los minutos al día.

Barra inferior con cuatro pestañas (en pantallas anchas, una fila bajo la cabecera):

| Pestaña | Ruta | Qué hay |
|---|---|---|
| 🏠 **Hoy** | `#/` · `#/per` · `#/py` | La entrada única ([`docs/ENTRADA.md`](docs/ENTRADA.md)): con el banco etiquetado, la carta de tu derrota en pequeño con el marcador «estás aquí» (abre la Travesía); la tarjeta «Siguiente parada» con un solo botón, «Seguir»; una fila de estado (rango, semana, ¿estás listo?) y lo demás debajo. La fase (Aprender · Mezclar · Comprobar, deducida de tu estado: temas por ver, temario visto, examen a ≤ 14 días o listo) va en una etiqueta con su explicación plegada, donde se puede mirar otra sin cambiar el plan. Los pasos los decide el recomendador (`src/course/plan.js`) y la cola de fallos; el ejecutor `#/<tit>/sesion` los encadena (barra por tramos, «Parar» guarda por dónde vas) y acaba con un resumen. Debajo, el podcast del tema y el progreso plegado. Al alumno nuevo le ofrece un test de nivel (`#/<tit>/nivel`) para saltarse las clases que ya sabe; las ideas que se resisten tienen ficha (`#/<tit>/idea/<id>`). Con el banco etiquetado, la carta lleva a la Travesía (`#/<tit>/travesia`: faros por bloque, rango, semana, insignias; ver [`docs/TRAVESIA.md`](docs/TRAVESIA.md)) y cada sesión acaba con su parte de travesía. |
| 📚 **Temario** | `#/<tit>/temario` · `#/<tit>/temario/<n>` | Los temas del examen con su estado. Cada tema tiene sus clases (tarjetas paso a paso, chuleta y práctica con preguntas reales y repaso espaciado), sus preguntas de examen en tandas de 10 con **el profe** explicando cada respuesta (con voz, ilustraciones y animaciones) y, en el tema de carta, los ejercicios de carta. |
| 📝 **Examen** | `#/<tit>/examenes` | Simulacros con el número de preguntas y el tiempo del examen y las convocatorias reales completas (Andalucía 2015–2026). Pantalla de inicio, una pregunta por pantalla, guardado continuo (se puede salir y seguir: el reloj se para) y corrección con las reglas oficiales y revisión con el profe. |
| ☰ **Más** | `#/<tit>/mas` (y `#/mas`) | Biblioteca (láminas, mapas, reglas, carta), radio de a bordo, tarjetas, calculadora, las cuentas del patrón, chuletas por tema, mi progreso y mi plan, copia de seguridad, ajustes y modo profesor. Cada cosa sigue en su dirección de siempre. |

Durante una clase, una tanda de preguntas o un examen la app entra en «modo concentración»: sin barra inferior,
con una barra de actividad (✕ Salir, «Pregunta 4 de 10», barra de avance). Las direcciones antiguas
(`#/per/curso`, `#/per/teoria`, `#/teoria`, `#/carta`, `#/laminas`…) redirigen a las nuevas.

| Titulación | Examen | Banco de preguntas |
|---|---|---|
| PER | 45 preguntas · 90 min · apto con 32; máx. 5 errores en RIPA, 2 en Balizamiento y 2 en Carta | 738 de teoría + 72 de carta (18 convocatorias), con explicación del profe y 267 ilustraciones |
| PY | 40 preguntas en dos módulos (genérico 45 min, navegación 75 min) · apto con 28; máx. 5 errores en Teoría de navegación y 3 en Carta | 720 (18 convocatorias): seguridad, meteorología, teoría de navegación y carta (carta, mareas con tabla y loxodrómica) |

Añadir otra titulación (PNB, Capitán…) es una entrada en `TITULACIONES` (`src/theory/blocks.js`) y su banco en cada eje (`data/ejes/<eje>/<tit>/`). Los bancos de preguntas van por eje (administración examinadora); hoy hay uno, Andalucía. Formato y cómo añadir un eje: [`docs/BANCOS.md`](docs/BANCOS.md).

## Funciones destacadas

- **🎧 Radio de a bordo** (`#/<tit>/podcast`): podcasts de diez a quince minutos por tema, con un panorama de cada tema y episodios que profundizan. El reproductor sigue sonando mientras navegas; el guion se ilumina al hilo y se toca para saltar; en el minijuego contestas tú antes que Andrés. Los guiones están en `podcast/` (guía, índice y fichas) y el audio se genera con `podcast/audio.py` (ElevenLabs).

- **🧭 Ruta del curso que intercala temas**: las clases se dan en tramos de dos o tres de un tema y se pasa a otro
  (en el PY, Teoría, Carta, Seguridad y Meteorología se van alternando), siempre después de las clases en las que se
  apoyan. Cada clase dice en qué otras se apoya y, si se abre antes de tiempo, lo avisa. Ver [`docs/RUTA.md`](docs/RUTA.md).

- **🧑‍🏫 Modo profesor** (Ajustes → «Soy profesor»): un profesor reordena la ruta (sin romper las dependencias),
  edita las reglas para recordar y las chuletas de las clases, y lo comparte en un fichero. Sus alumnos lo usan en
  Ajustes → «Usar la configuración de mi profesor»; solo les cambia a ellos y se puede quitar cuando se quiera.

- **📌 Chuleta para practicar**: en ejercicios de carta, clases, tandas, repasos y «5 minutos», un botón «Chuleta»
  abre las fórmulas, signos y conversiones de lo que se practica (Ct = dm + Δ, Rv = Ra + Ct, d = V × t, duodécimos,
  estima analítica…) y la chuleta de la clase (`data/comun/chuletario.json`). Nunca en simulacros ni exámenes.
- **Siglas explicadas al tocarlas**: Rv, Ct, HRB, MMSI, EPIRB… y los términos del vocabulario se pueden tocar en
  las clases, la chuleta, las tarjetas, los enunciados de carta y las explicaciones del profe
  (`data/comun/abreviaturas.json`).
- **Ejercicios por tipo**, generados con datos nuevos cada vez sobre la zona del Estrecho (carta L105).
- **Corrección automática** con tolerancias de examen y **diagnóstico de errores típicos**
  (signo de la Ct, demora sin invertir, corriente al revés, olvidar el traslado…).
- **Pistas paso a paso** y **construcción gráfica** progresiva en la carta (SVG).
- **Carta interactiva con instrumentos de examen**: zoom y desplazamiento (rueda, botones, dos dedos),
  📏 regla (Rv y distancia), 🧭 compás (radio en millas medido en la escala de latitudes),
  📐 transportador cuadrado (agujero central, graduación 0–360° en el borde, hilo y «Trazar»; se queda puesto
  mientras usas las demás herramientas), 📍 punto (movible, coordenadas visibles u ocultas), 🔤 anotaciones de
  texto, 🧽 goma, deshacer. Todo se ajusta a los faros. Lo dibujado aparece también en el resumen para IA.
- **Mesa de cartas** (pantalla completa) en cada ejercicio y pregunta de examen con construcción gráfica:
  📋 *Ejercicio*: el enunciado troceado en fichas que se envían a la carta como notas, los faros citados
  resaltados y la respuesta/corrección en el propio panel, sin cambiar de pantalla. 🎓 *Tutorial*: la
  resolución reproducida sobre la carta paso a paso —se coloca el transportador, el compás o la regla como
  en el examen y después se traza— con la explicación de cada paso (anterior/siguiente/reproducir).
- **👨‍🏫 El profe**: cada paso de la solución (pistas, tutorial y preguntas de examen) viene explicado como lo
  haría un profesor —qué hacemos y por qué, el cálculo con los números del ejercicio, un truco y el error típico de
  examen— y **con voz** (síntesis del navegador, gratis, en español; voz y velocidad en Más → Voz del profe).
  En el tutorial la carta avanza al ritmo de la explicación.
- **Escalas en los márgenes y guías**: arrastra desde la escala de latitudes o de longitudes para sacar un
  paralelo o un meridiano (se ajusta a la décima de minuto y admite el valor exacto); el cruce de dos guías
  sitúa el punto y todas las herramientas se ajustan a él. Atajo ⌖ para trazar guías (y punto) desde unas coordenadas.
- **Notas de texto** en la carta con tamaño de letra (S–XXL), editables y movibles.
- **Tu carta escaneada como fondo** (opcional): carga tu PDF/imagen de la L105 y la app la georreferencia
  con la calibración incluida (error < 0,1′). Se guarda solo en tu navegador (IndexedDB), nunca en el repo.
- **136 preguntas reales de examen** (PER Andalucía 2015–2026, preguntas de carta) con la respuesta de la
  plantilla oficial y **resolución paso a paso calculada por la app** (con dibujo en la carta).
  La app resuelve 134 de ellas y en las 131 no anuladas elige la opción oficial: es la validación de los motores
  y de la carta (`tests/exams.test.js`). Las otras 2 quedan documentadas (`documentadas` de `src/bancos/ejes/andalucia.js`).
- **340 preguntas de carta del PY Andalucía** (2015–2026: situación, viento, corriente, mareas, estima analítica):
  la app resuelve 324 paso a paso (de 2015–2019: 151 resueltas, 7 documentadas como discrepancia y 2 de mareas
  sin la tabla del anuario en el cuadernillo, explicadas con el método). Cada resolución está escrita a mano para su pregunta (datos del enunciado →
  motores de cálculo), y un test comprueba que la opción oficial es la más próxima al resultado, dentro de dos
  veces la tolerancia: valida a la vez los motores y la transcripción de cada pregunta, no el texto de las
  explicaciones. Las 7 restantes (5 anuladas, 1 con errata en la plantilla y 1 por la medida de una enfilación)
  quedan explicadas en el bloque `DISCREPANCIAS` de `src/exams/solutions/andalucia-py-<año>.js`.
  Las mareas se calculan con la fórmula exacta; el examen usa la tabla del Anuario, y pueden diferir 1–2 cm o
  1 minuto. En las tandas de teoría del PY sale
  «Ver la resolución en la carta» (o «paso a paso» cuando no hay nada que dibujar).
- **🧮 Calculadora científica** (`#/calculadora`, y flotante desde la carta, los ejercicios y las preguntas de carta): las teclas de la que se permite en el examen, °′″ incluida. En los simulacros sale solo si la ficha del eje la permite.
- **➗ Las cuentas del patrón** (`#/<tit>/cuentas`): apéndice de matemáticas (grados, horas, signos y rumbos; en el PY también trigonometría y regla de tres) con ejercicios de números nuevos para la calculadora. No cuenta en el plan.
- **Progreso** guardado en el navegador (también los minutos de estudio por día y el examen a medias), con copia de seguridad y recordatorio para guardarla.
- **Preparada para asistentes IA** (Claude en Chrome / Cowork): resumen compacto `#ai-context`,
  API `window.nautica` y `llms.txt`.

## Uso

Herramientas: **solo un navegador** para usarla y **Node.js ≥ 20** para desarrollar (servidor local,
pruebas y scripts de datos). Sin dependencias, sin compilación, sin Python.

```bash
cd nautica
npm start            # servidor local (tools/serve.mjs) → http://localhost:8080
npm test             # pruebas (node --test)
node tools/build-chart.mjs   # regenera data/chart-105.json desde tools/source/
npm run precache     # regenera sw-lista.js (lista y versión del modo sin conexión)
```

Necesita servirse por HTTP (los módulos ES no funcionan abriendo el fichero con doble clic).

Publicación gratuita: GitHub Pages (Settings → Pages → rama y carpeta raíz). La app quedará en
`https://<usuario>.github.io/mis-cosas/nautica/`.

**App instalable y sin conexión (PWA).** `manifest.webmanifest` e `icons/` la hacen instalable; `sw.js` la guarda
en el móvil (la app al instalar, los datos justo después) y sirve primero lo guardado. La lista de archivos y la
versión están en `sw-lista.js`, generado con `npm run precache`: **después de cambiar cualquier archivo de la app
hay que regenerarlo** (un test lo comprueba). Cuando se publica una versión nueva, la app muestra «Hay una versión
nueva → Actualizar» y no cambia sola. En `localhost` el worker no se registra salvo que se añada `?sw` a la
dirección, para ver siempre lo último al desarrollar.

## Tipos de ejercicio (PER)

| Categoría | Ejercicio |
|---|---|
| Aguja | Conversión de rumbos y Ct · Ct por enfilación u oposición |
| Estima | Situación de estima · Rumbo de aguja, distancia y HRB de llegada · Rumbo para pasar a X millas de un faro |
| Situación | Demora (o marcación) y distancia, al mismo faro o a otro · Dos demoras o marcaciones simultáneas · Oposición/enfilación + demora (distancia a faro) · Demoras no simultáneas |
| Estima (PY) | Estima analítica con varios rumbos (Δl, apartamiento, latitud media, rumbo y distancia directos) |
| Corrientes (PY) | Rumbo/velocidad efectivos · Rumbo a dar · Calcular la corriente |
| Viento (PY) | Abatimiento (Rs y rumbo a dar) |
| Mareas (PY) | Altura de marea, sonda y agua bajo la quilla · Hora para pasar un bajo (Anuario UT → hora legal) |

Los enunciados generados imitan los de Andalucía: declinación «4º NW» o «de la carta, 2° 50′ W 2005 (7′ E)»
(con actualización al año), desvío «+4º (más)», situaciones «a 4 millas al Sur verdadero del faro…», «al Sur
verdadero de A y al Oeste verdadero de B», coordenadas, puertos (Barbate, Algeciras, Ceuta, Tánger)…

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para la arquitectura y cómo añadir tipos nuevos.

## Aviso

Es una herramienta de estudio. La carta de examen es la **IHM L105 Enseñanza «Estrecho de Gibraltar»**
(datum ED50). Las posiciones de faros y luces se han tomado de la NGA Pub. 113 y comprobado sobre un escaneo
georreferenciado de la L105 (ver `tools/source/notes.md`); la costa es de © OpenStreetMap contributors (ODbL),
simplificada. Preguntas de examen: Junta de Andalucía (enlace a cada cuadernillo y plantilla). Practica también el trazado
con transportador y compás sobre la carta L105 en papel.
