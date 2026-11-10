# Estrategia de examen (R-31) — estado

Sección nueva `#/<tit>/estrategia`: cómo HACER el examen, por titulación y tribunal, y «Tu estrategia» con los datos
del alumno. Rama `worktree-agent-aa1e2304ca601baaa`.

## Qué hay

- **Lógica pura** `src/course/estrategia.js` (sin DOM, con tests en `tests/estrategia.test.js`):
  - `cifrasExamen(T, ficha)`: preguntas, minutos, min/pregunta, aciertos, colchón, límites por tema (fallos máx. y
    bien mín.), lo que queda de colchón tras agotar los límites, módulos del PY, calculadora (`calculadoraPermitida`) con
    su fuente y las reglas propias del tribunal (ficha del eje). Todo sale de `src/theory/blocks.js` y de la ficha.
  - `presupuestoTiempo(T, cfg)`: reparto orientativo (consejo) por tramo (examen o módulo): teoría a 1,2 min/pregunta,
    10 % para el repaso final y el resto para la carta (o margen si el tramo no tiene carta); hitos del reloj.
  - `textosEstrategia(datos, { tit, eje, calculadora })`: filtra `data/comun/estrategia.json` por titulación y tribunal,
    pone las fuentes y decide qué se dice de «si no la sabes» según esté comprobado o no cómo corrige ese tribunal.
  - `tuEstrategia({ estructura, tests, listo })`: con los 5 exámenes completos más recientes (`porTema`, `minutos`) y
    «¿Estás listo?» (`pFallaLimite` de los temas con datos suficientes): el límite más justo, el tiempo medio frente al
    del examen (justo / bien / holgado; veces que se acabó el reloj), el colchón global y 2–3 consejos. Sin datos, lo
    dice e invita a un simulacro.
  - `estrategiaPermitida({ modo, hash })`: nunca con un examen en marcha ni en una dirección de examen.
- **Contenido** `data/comun/estrategia.json`: cada texto es «norma» (con `fuente`, y `ref` al artículo/base) o
  «consejo». Fuentes: RD 875/2014 anexo II (texto consolidado), convocatoria 2025 de Andalucía (BOJA núm. 7/2025),
  convocatoria 2026 de la Marina Mercante (BOE-A-2026-510), la ficha del eje y la corrección de la app. Pendientes
  por tribunal.
- **Vista** `src/ui/views/estrategia.js` (estilo C, patrón imprimible de las chuletas `.mc-*`; CSS propio en un bloque
  al final de `styles/app.css`): Tu examen en cifras · Tu estrategia · Los límites que suspenden · Presupuesto de
  tiempo · Orden · Leer y descartar · Si no la sabes · Repaso final y hoja de respuestas · El PY por módulos · El día
  antes · El día del examen · Pendiente de verificar · Fuentes. «Incluir mis datos» quita la parte personal al imprimir.
- **Enlaces**: Examen (bajo «Hacer un simulacro»), Biblioteca («Empezar») y la pantalla de inicio de un simulacro,
  antes de que corra el reloj. No en el examen en marcha (test de código y comprobado en el navegador: 0 enlaces y
  ningún texto «estrategia» con `body[data-modo-examen]`). En `app.js`: la ruta, pestaña Examen y cambio de titulación.
- Docs: `llms.txt` y `docs/ARCHITECTURE.md` con la ruta.

## Afirmaciones sobre el examen y su fuente

| Afirmación | Fuente |
| --- | --- |
| PER: 45 preguntas, 4 opciones, 90 min, apto con 32; máx. 5 errores RIPA, 2 Balizamiento, 2 Carta (mín. correctas 5, 3, 2) | RD 875/2014, anexo II (BOE-A-2014-10344), y `src/theory/blocks.js` |
| PY: 40 preguntas, 120 min, apto con 28; máx. 5 Teoría de navegación y 3 Carta (mín. correctas 5 y 7); genérico 45 min, navegación 1 h 15 min | RD 875/2014, anexo II; `blocks.js` |
| Solo cuentan las respuestas correctas (mínimo total y mínimo por tema con límite); los criterios no descuentan por fallar; una en blanco pesa como una fallada | RD 875/2014, anexo II («responder correctamente un mínimo de…», tabla de «número mínimo de respuestas correctas»). Afirmado **solo** para Andalucía (BOJA 2025, base quinta 3: remite a los criterios del RD) y Madrid (BOE-A-2026-510, anexo III) |
| Aprobado por módulos del PY (genérico: 5 bien en Seguridad y 5 en Meteorología; navegación: 5 en Teoría y 7 en Carta), se conserva dos convocatorias y solo vale en esa administración | RD 875/2014, anexo II (PY) |
| Andalucía: lápiz 2 HB, goma, bolígrafo azul o negro; PER y módulo de navegación del PY: calculadora científica no programable, cartabón, escuadra, regla, transportador y compás | BOJA 2025, base quinta 5 |
| Andalucía: la carta del Estrecho la da el tribunal | BOJA 2025, base quinta 6 |
| Andalucía: sin móvil ni otro soporte de información | BOJA 2025, base séptima 1 |
| Andalucía: un solo llamamiento; identidad con el mismo documento de la inscripción (DNI, permiso o pasaporte en físico; no fotocopias ni apps) | BOJA 2025, base séptima 2 |
| Andalucía: horario en la web del IAD | BOJA 2025, base quinta 2 |
| Madrid: carta y anuario/almanaque los da el tribunal; bolígrafo, lápiz y material de dibujo; calculadora solo en PY y CY | BOE-A-2026-510, apartado 14 |
| Madrid: pueden pedir el justificante de la tasa | BOE-A-2026-510, apartado 5 |
| Madrid: fecha, horario y lugar con la lista definitiva de admitidos | BOE-A-2026-510, apartado 11 |
| Madrid PY: un solo cuadernillo en dos horas (un solo reloj) | Ficha del eje (`data/ejes/dgmm/eje.json`) |
| Calculadora por tribunal y titulación | Ficha del eje (`calculadoraPermitida`) |
| Baleares: el tribunal entrega el extracto del Anuario de Mareas | Ficha del eje |
| En la app, en blanco = fallo y anulada = acierto | `src/theory/engine.js` (`grade`) |

Todo lo demás (orden, tiempo por pregunta, marcar y saltar, leer, descartar, repaso, hoja de respuestas, el día antes,
llegar con tiempo, dormir…) va rotulado como **consejo**, no como norma.

## Fuera por no poder verificarlo (pendiente)

- **Baleares**: si una respuesta errónea resta o una en blanco cuenta distinto (no se ha revisado su convocatoria);
  material y documento de identidad; si cada módulo del PY lleva su propio tiempo.
- **Andalucía**: si cada módulo del PY lleva su propio tiempo o hay uno solo.
- **Madrid**: qué documento de identidad piden (la convocatoria no lo detalla).
- No se afirma nada sobre el formato de la hoja de respuestas (lectura óptica, cómo corregir una marca): el consejo
  dice «si hay hoja de respuestas aparte» y remite a las instrucciones del tribunal.
- Las convocatorias citadas son la de 2025 (Andalucía) y la de 2026 (Madrid); la página pide comprobar la del año.

## Cambios colaterales

- `data/ejes/andalucia/eje.json`: `calculadoraFuente` citaba «base sexta 5»; en el BOJA es la **base quinta 5**
  (la sexta es la composición del tribunal). Corregido.
- Discrepancia detectada, **no tocada**: el simulacro de un solo módulo del PY (`estructuraModulo` en `blocks.js`) da
  por apto 14 de 20 «en proporción»; el RD fija el aprobado por módulos por materia (genérico 5 + 5; navegación 5 + 7,
  es decir, 10 y 12 de 20 como mínimo y con mínimos por materia). La pantalla de inicio ya dice «orientativo»; conviene
  alinearlo con el RD en otra tanda.

## Verificación

- `npm test`: 2267 tests, 2262 pasan, 0 fallos, 5 omitidos. Nuevos: 14 en `tests/estrategia.test.js`.
- Navegador (Playwright, `python3 -m http.server`): PER Andalucía y PY Madrid a 360 y 990 px, claro y oscuro, con y
  sin datos; PER Madrid y PY Baleares a 360 claro; impresión (PNG y PDF A4); enlaces en Examen, Biblioteca e inicio
  del simulacro; examen en marcha sin rastro de la estrategia. Sin desbordamiento horizontal ni errores de consola.
  Capturas en el scratchpad de la sesión (`estrategia/`).

## No verificado

- Móvil real, lector de pantalla y la impresión en una impresora de verdad (solo PDF de Chromium).
- La convocatoria de Baleares y las de 2026 de Andalucía.
- Los umbrales de «Tu estrategia» (justo ≥ 90 % del tiempo, holgado ≤ 60 %, margen ≤ 1,5 fallos) son hipótesis.
