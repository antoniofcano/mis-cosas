# Test de nivel y ficha de la idea floja (rama feat/diagnostico-ficha)

Encargo: (1) diagnóstico inicial por conceptos, adaptativo y corto, que alimenta el dominio por idea y ofrece saltar
clases que ya se saben; (2) ficha corta de una idea que se resiste. Todo degrada sin etiquetas (sin conceptos.json del
banco activo no hay test ni ficha y la app es la de siempre).

## Hecho
- [x] Lógica pura del test: `src/course/nivel.js`. Bloques = raíces del catálogo (nav.* juntas); sondas por rondas
      (1–3 por bloque según tamaño, idea central de clases distintas de la parte media-alta de la ruta); fallo → una más
      fácil (idea más temprana en la ruta) del mismo bloque; sonda y fácil falladas → bloque cerrado; máx. 25. Solo
      estudio, idea principal, sin carta/anuario/tabla de mareas/contexto. `clasesQueSabes`, `puntoDePartida`.
- [x] Lógica pura de la ficha: `src/course/ficha.js` (necesitaFicha: floja con ≥ 2 intentos; fichaPendiente: no abierta
      desde el último fallo; notaParaAlumno: quita frases para etiquetadores; reglasDeIdea; preguntaParaProbar).
- [x] Store: `recordExam(…, { nivel: true })` cuenta como una respuesta más (n, ok1, dominio) pero no toca la cola de
      repaso; nada de recordTest. `nivel/recordNivel` (por eje/tit), `fichasVistas/recordFichaVista`.
- [x] `estadoLeccion` → «saltada» (reg.saltada sin empezar): el plan la da por hecha, no es «vista» (clases.vistas no la
      cuenta); al abrirla vuelve a ser una clase normal.
- [x] Vistas: `#/<tit>/nivel` (intro, test con recarga a mitad, resultado, «Ya lo sabes: saltar estas N clases»,
      repetir con confirmación), `#/<tit>/idea/<id>` (ficha; «Probar otra pregunta» en modo concentración; si la idea
      toca hoy en el repaso, cuenta como su repaso). Hoy: oferta al alumno nuevo (< 40 respuestas y < 5 clases),
      «Tu punto de partida…», «Ya lo sabes: saltar» en la clase de la sesión. Más: test / repetir. Repaso: la idea
      floja por segunda vez no se pregunta hasta abrir la ficha (aviso al final de la tanda, para no dar pistas antes de
      responder) y tras el segundo fallo la corrección ofrece la ficha. Resumen (idea en rojo), Temario y Progreso
      (ideas flojas) enlazan la ficha. CSS claro/oscuro.
- [x] Tests: `tests/nivel-ficha.test.js` (juguete y los 6 bancos reales). Playwright: scratchpad `diag/flujo.mjs`,
      capturas en `ux-capturas-diagnostico/`.

## Decisiones a revisar
- Una idea acertada en el test basta (sin ninguna floja) para ofrecer saltar su clase: con ~16 aciertos salen ~15
  clases. Es una oferta, no se marcan vistas y sus preguntas siguen en tandas y mezclado. Endurecer en
  `clasesQueSabes` si hace falta (p. ej. exigir la mitad de las ideas de la clase).
- «Dominas X de Y ideas» cuenta las ideas del test (no todo el catálogo), para no extrapolar.
- La nota se limpia automáticamente; no hay reescrituras a mano (el catálogo no se toca).

## Pendiente / fuera
- Reescribir a mano notas muy técnicas (fichero aparte) si se quiere.
- La línea de punto de partida se enseña mientras la fase sea «Aprender».

## Cómo seguir
`cd nautica && npm test`; tras tocar ficheros servidos: `git add` + `npm run precache` + `node --check sw.js`.
Playwright: `node tools/serve.mjs 8947` y `node <scratchpad>/diag/flujo.mjs 8947`.
