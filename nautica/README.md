# Patrón · Preparador del examen de PER y Patrón de Yate

Aplicación web estática, gratuita y sin dependencias para **aprobar el examen teórico de Patrón de Embarcaciones
de Recreo (PER) y de Patrón de Yate (PY)** de la Junta de Andalucía. Empezó como simulador de cartas y hoy cubre
el examen entero: teoría, carta y simulacros.

## Cómo está organizada

Eliges titulación en la portada (o con el selector PER | PY de la cabecera) y todo se adapta a su examen:

| Sección | Qué hay |
|---|---|
| **Panel** `#/per` · `#/py` | Cómo vas en cada bloque del temario (practicadas, % de acierto, estado), el siguiente paso recomendado y las reglas del examen. |
| **Teoría** `#/<tit>/teoria` | Práctica por bloques con las preguntas reales (PER: 810; PY: 720), corrección al momento y **el profe** explicando cada respuesta, con voz, ilustraciones y animaciones. Repaso de solo las falladas. |
| **Carta** `#/<tit>/carta` | Ejercicios de carta por tipo, generados con datos nuevos cada vez, con pistas, construcción gráfica, tutorial sobre la carta y profe. Preguntas reales de carta. |
| **Exámenes** `#/<tit>/examenes` | Simulacros con el número de preguntas y el tiempo del examen, y las 18 convocatorias reales completas (2020–2026), corregidos con las reglas oficiales (aciertos mínimos y límites de errores por bloque) y revisión con el profe. |

Comunes a las dos titulaciones: **Mesa de cartas** `#/mesa` (la carta con todos los instrumentos),
**Láminas animadas** `#/laminas`, **Conceptos de carta** `#/conceptos` y **Progreso** `#/progreso`.

| Titulación | Examen | Banco de preguntas |
|---|---|---|
| PER | 45 preguntas · 90 min · apto con 32; máx. 5 errores en RIPA, 2 en Balizamiento y 2 en Carta | 738 de teoría + 72 de carta (18 convocatorias), con explicación del profe y 267 ilustraciones |
| PY | 40 preguntas en dos módulos (genérico 45 min, navegación 75 min) · apto con 28; máx. 5 errores en Teoría de navegación y 3 en Carta | 720 (18 convocatorias): seguridad, meteorología, teoría de navegación y carta (carta, mareas con tabla y loxodrómica) |

Añadir otra titulación (PNB, Capitán…) es una entrada en `TITULACIONES` (`src/theory/blocks.js`) y su banco en `data/exams/`.

## Funciones destacadas

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
- **👨‍🏫 El profe**: cada paso de la solución (pistas, tutorial y preguntas de examen) viene explicado como en
  una academia —qué hacemos y por qué, el cálculo con los números del ejercicio, un truco y el error típico de
  examen— y **con voz** (síntesis del navegador, gratis, en español; voz y velocidad en Progreso → Ajustes).
  En el tutorial la carta avanza al ritmo de la explicación.
- **Escalas en los márgenes y guías**: arrastra desde la escala de latitudes o de longitudes para sacar un
  paralelo o un meridiano (se ajusta a la décima de minuto y admite el valor exacto); el cruce de dos guías
  sitúa el punto y todas las herramientas se ajustan a él. Atajo ⌖ para trazar guías (y punto) desde unas coordenadas.
- **Notas de texto** en la carta con tamaño de letra (S–XXL), editables y movibles.
- **Tu carta escaneada como fondo** (opcional): carga tu PDF/imagen de la L105 y la app la georreferencia
  con la calibración incluida (error < 0,1′). Se guarda solo en tu navegador (IndexedDB), nunca en el repo.
- **72 preguntas reales de examen** (PER Andalucía 2020–2026, preguntas de carta) con la respuesta de la
  plantilla oficial y **resolución paso a paso calculada por la app** (con dibujo en la carta).
  La app resuelve 71 de ellas y en las 68 no anuladas elige la opción oficial: es la validación de los motores
  y de la carta (`tests/exams.test.js`).
- **Progreso** guardado en el navegador, exportable.
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
```

Necesita servirse por HTTP (los módulos ES no funcionan abriendo el fichero con doble clic).

Publicación gratuita: GitHub Pages (Settings → Pages → rama y carpeta raíz). La app quedará en
`https://<usuario>.github.io/mis-cosas/nautica/`.

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
