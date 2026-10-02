# Arquitectura

JavaScript moderno (módulos ES), sin framework ni paso de compilación. Cada motor es independiente
y sin DOM salvo `graphics` (que solo produce texto SVG) y `ui`. Todo lo que no es `ui/` se prueba en Node.

```
nautica/
├── index.html            Punto de entrada
├── llms.txt              Guía para agentes de IA
├── data/                 Base de datos estática (JSON)
│   ├── chart-105.json    Carta: puntos notables, costa (polígonos de tierra), declinación
│   └── exams/            Bancos de preguntas reales (index.json + un fichero por banco)
├── src/
│   ├── math/             MOTOR MATEMÁTICO   ángulos, vectores, Mercator/loxodrómica, RNG con semilla, formatos
│   ├── nautical/         MOTOR NÁUTICO      aguja (Ct, dm, Δ), cinemática (corrientes, abatimiento),
│   │                                        situación (líneas de posición), glosario
│   ├── chart/            MOTOR DE CARTA     consultas geográficas: ¿agua?, ¿visible?, punto navegable aleatorio
│   ├── exercises/        MOTOR DE EJERCICIOS contrato (define.js), registro y un fichero por tipo (types/)
│   ├── analysis/         MOTOR DE ANÁLISIS  magnitudes (lectura/formato/error), corrección y diagnóstico
│   ├── graphics/         MOTOR GRÁFICO      carta en coordenadas mundo (Mercator) por capas, construcciones,
│   │                                        instrumentos (transportador, compás, regla) y georreferenciación
│   │                                        de escaneos (ajuste afín)
│   ├── store/            DATOS              progreso del alumno (localStorage) y carga de datasets
│   ├── exams/            EXÁMENES REALES    kit de resolución (kit.js), lector de opciones y soluciones por banco
│   ├── ai/               INTERFAZ IA        resúmenes de texto compactos y API window.nautica
│   └── ui/               INTERFAZ           router por hash, vistas; ui/chart/: carta interactiva (zoom, capas,
│                                            herramientas de dibujo) y capa raster de la carta del usuario
├── styles/app.css
└── tests/                node --test
```

Dependencias permitidas (de abajo arriba): `math` ← `nautical` ← `chart` ← `exercises` ← `analysis`
← `graphics` ← `ai` ← `ui`. `store` solo lo usa `ui`.

## Flujo de un ejercicio

1. `generate(rng, ctx)` produce **datos serializables** (`params`), reproducibles con la semilla de la URL.
   Usa la carta real: posiciones en agua, faros visibles, trayectorias sin cruzar tierra.
2. `statement(params, ctx)` redacta el enunciado como en el examen.
3. `solve(params, ctx)` devuelve `results` (números), `steps` (explicación) y `drawing` (primitivas SVG
   con el paso en que aparecen).
4. `analysis/checker` lee las respuestas según su magnitud (`analysis/quantities.js`), compara con la
   tolerancia y, si hay fallos, ejecuta los `mistakes` del tipo para identificar el error cometido.
5. La UI muestra pistas = `steps` uno a uno, y la carta dibuja las primitivas hasta ese paso.

## Añadir un tipo de ejercicio nuevo (p.ej. mareas para PY)

1. Si hace falta conocimiento nuevo, añádelo como funciones puras en `src/nautical/` (p.ej. `tides.js`).
2. Crea `src/exercises/types/mi-tipo.js` con `defineExercise({...})` (ver el contrato en `define.js`).
3. Regístralo en `src/exercises/registry.js` (y una categoría nueva en `define.js` si procede).
4. Si necesita una magnitud nueva (p.ej. altura de marea en metros), añádela en `analysis/quantities.js`.
5. `npm test` ya lo prueba automáticamente: genera 40 casos, comprueba que se resuelven, que el enunciado
   no tiene huecos y que la solución se autocorrige; y que cada error típico se detecta.

## Exámenes reales: resolución programada y validación

`src/exams/kit.js` ofrece operaciones de alto nivel (`ct`, `oposicion`, `fix2`, `fromMark`, `tangent`, `run`,
`eta`…) que calculan con los motores, redactan el paso explicado y añaden el dibujo. Cada pregunta tiene en
`src/exams/solutions/<banco>*.js` una función corta que encadena esas operaciones y devuelve los valores
pedidos. `src/exams/options.js` lee las opciones del examen y elige la más próxima; `tests/exams.test.js`
exige que coincida con la plantilla oficial. Si cambias la carta o un motor, este test avisa.

## Añadir preguntas de examen

Añade un fichero en `data/exams/`, su entrada en `data/exams/index.json` y (opcional) sus soluciones en
`src/exams/solutions/`. Datos de la carta: `node tools/build-chart.mjs` regenera `data/chart-105.json`. Formato de pregunta:

```json
{ "id": "and-2024-11-a-41", "comunidad": "Andalucía", "titulacion": "PER", "convocatoria": "noviembre 2024",
  "numero": 41, "enunciado_comun": "…", "enunciado": "…", "opciones": {"a": "…", "b": "…", "c": "…", "d": "…"},
  "correcta": "b", "solucion": ["paso 1", "paso 2"], "ejercicio": "situacion-dos-demoras",
  "fuente_examen": "https://…", "fuente_plantilla": "https://…", "notas": "" }
```

## Carta interactiva e instrumentos

- Coordenadas mundo: x = longitud (min) × 10, y = −latitud aumentada (min) × 10. Zoom/desplazamiento = viewBox.
- Capas: mar → escaneo del usuario (opcional) → tierra vectorial → cuadrícula → faros → solución → dibujo del
  alumno → instrumento activo. Las capas con texto se regeneran a la escala actual (tamaño constante en pantalla).
- Escaneo: `data/carta-l105-calibracion.json` guarda 18 cruces de la cuadrícula de 10′ (lat/lon ↔ píxel). La
  imagen la aporta cada usuario (IndexedDB; `store/user-chart.js` extrae el JPEG del PDF sin librerías) y
  `graphics/georef.js` calcula la matriz afín. La carta tiene © IHM: nunca se sube al repositorio.
- Instrumentos (`graphics/instruments.js`) son dibujo puro; la interacción está en `ui/chart/interactive-chart.js`.
- Mesa de cartas (`ui/chart/workspace.js`): carta a pantalla completa + panel. Traslada el formulario de respuesta
  del ejercicio al panel mientras está abierta y lo devuelve al cerrar; conserva lo dibujado entre aperturas.
- Tutorial (`ui/chart/tutorial.js`): a partir de las primitivas con `step` de cualquier solución deduce el
  instrumento de cada trazo (`ray`/`line` → transportador, `arc`/`circle` → compás, `seg` → regla, `vec` →
  transportador + compás) y lo reproduce con encuadre automático. Cualquier tipo de ejercicio nuevo que dibuje
  su solución tiene tutorial sin escribir nada más.

## Herramientas de desarrollo

Solo Node.js ≥ 20: `npm start` (servidor estático `tools/serve.mjs`), `npm test` (`node --test`),
`node tools/build-chart.mjs` (datos de la carta). La app en sí es HTML + CSS + módulos ES, sin compilación.

## Pensado para asistentes de IA

- Cada vista expone `summary()`: texto compacto con todo lo relevante. Se muestra en `#ai-context`
  y se obtiene con `nautica.state()`.
- La API `window.nautica` permite generar, resolver y corregir sin leer el DOM.
- El estado del ejercicio vive en la URL (`#/ej/<tipo>?s=<semilla>`), así que es reproducible.
