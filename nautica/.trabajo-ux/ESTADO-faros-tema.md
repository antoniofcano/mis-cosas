# Faros de la derrota = temas del Temario

## Qué pasaba

Los porcentajes de los faros de la Travesía no coincidían con los del Temario. El criterio era el mismo (`luzDeFaro`,
ideas dominadas) pero se agrupaba distinto: el Temario, por tema del examen; la Travesía, en seis faros fijos por bloque
del catálogo.

## Qué se ha hecho

- **Una sola función reparte las ideas en faros**: `farosDeTemas(ideas, estructura)` en `src/course/travesia.js`.
  `estadoTravesia({ ic, estructura, … }).faros` (carta de Hoy y de la Travesía, parte, insignias) y `farosPorTema(est)`
  (Temario) devuelven los mismos objetos. Un faro por tema con ideas, en el orden del Temario (`bloquesEnOrden`), con
  `id` `t<n>`, `ut`, `nombre` (título del tema) y `corto` (rótulo de la carta, nuevo campo en `src/theory/blocks.js`).
  PER: 11 faros; PY: 4 (en los tres bancos).
- **Ideas sin tema**: no hay ninguna hoy (toda idea de la travesía tiene preguntas del estudio, así que tiene tema, y
  todos caen en la estructura). Si apareciera una, va al faro «Otras ideas» (`otras`, al final) para que los faros sumen
  todas las ideas; el Temario no lo pinta y un test avisa.
- **La carta con número variable de faros** (`trazadoDerrota`): hasta seis, la carta de siempre (con puntos propios para
  cuatro, porque repartir los seis puntos dejaba dos faros del PY pegados); con más, la carta «densa» (filas en zigzag, 3
  columnas en la Travesía y 4 en Hoy, costa al norte y al sur, rosa y cartela sobre la del sur). Estilo C, solo `--lc-*`.
- **Marcador «estás aquí»**: `faroDeParada(faros, ut)` es ahora directo (el faro del tema que toca). «Siguiente parada»
  sigue siendo el primer faro sin encender, ahora en el orden del Temario. Los rangos no cambian.
- **Insignias**: `tema:<n>` («Tema completo: …») en lugar de `bloque:<faro>`. Las `bloque:*` ya ganadas se conservan
  guardadas y se siguen viendo en la rejilla (detrás de las de tema, con una nota); las no ganadas desaparecen; las de
  tema salen de los datos con la regla de siempre (100 % de las ideas del tema). La sincronización no se toca: unión por id.
  Documentado en `docs/TRAVESIA.md` («Migración de las «Bloque completo»»).
- **Textos**: «bloque» → «tema» en la Travesía, el menú Más y los `aria-label`. El detalle de un faro enlaza a su tema
  («Ver el tema»).
- **Docs**: `docs/TRAVESIA.md`, `docs/ENTRADA.md`, `docs/ICONOS.md`, una nota en `docs/SYNC.md` y la línea de `llms.txt`.
- **Tests**: adaptados `tests/travesia.test.js`, `tests/entrada.test.js`, `tests/hoy-travesia-c.test.js`; nuevos: faros de
  la derrota = faros del Temario en PER y PY de todos los bancos (contra un cálculo aparte), migración de insignias (con
  `plegar`), `farosDeTemas`, trazado de la carta y cajas sin solapes a 360 px, SVG de la carta densa.

## Comprobado en navegador (Chromium, Playwright)

PER y PY (Andalucía) con progreso de prueba inyectado; Travesía, Hoy, Temario e insignias a 360 y 990 px, en claro y
oscuro, con «reducir movimiento». Las cuentas leídas del DOM coinciden entre la Travesía y el Temario; ningún disco, nombre
o marcador se pisa ni se sale de la carta; sin errores de consola.

## Sin comprobar o pendiente

- No se ha visto en navegador: el marcador en la bandera (todos los faros encendidos) ni en la fila de arriba; el parte de
  sesión con un faro recién encendido; las animaciones (todas las capturas son con «reducir movimiento»); DGMM y Baleares
  (solo por tests); anchos intermedios (entre 360 y 990) y móviles reales.
- Con el marcador en la bandera en la carta de siempre (PY), el icono se sale por arriba: ya pasaba antes y no se ha tocado.
- En la rejilla de insignias a 360 px, «Nomenclatura» se parte en dos líneas («Nomenclatur/a»): ya pasaba con «Bloque
  completo: Nomenclatura».
- La carta de Hoy de la PER mide ≈ 300 px de alto a 360 px (antes ≈ 210): once faros no caben en menos sin quitar los nombres.
- «Mi progreso» (`conceptosPorTema`) cuenta también las ideas cuyas únicas preguntas están fuera del estudio (entre 2 y 14
  por banco): sus totales por tema pueden diferir en una o dos ideas de los del Temario y la Travesía. No se ha tocado.
- `tests/listo.test.js` («repaso mezclado») fallaba ya antes de este cambio por depender de la fecha real; se le ha
  inyectado `ahora`. No tiene que ver con los faros.
