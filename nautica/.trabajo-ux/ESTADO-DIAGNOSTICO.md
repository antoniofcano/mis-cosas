# Test de nivel y ficha de la idea floja (rama feat/diagnostico-ficha)

Encargo: (1) diagnóstico inicial por conceptos, adaptativo y corto, que alimenta el dominio por idea y ofrece saltar
clases que ya se saben; (2) ficha corta de una idea que se resiste. Todo degrada sin etiquetas (sin conceptos.json del
banco activo no hay test ni ficha y la app es la de siempre).

## Hecho
- [x] Lógica pura del test: `src/course/nivel.js` (bloques = raíces del catálogo, nav.* juntas; sondas por rondas;
      fallo → una más fácil del mismo bloque; bloque caído tras dos fallos; máx. 25; solo estudio, sin carta/anuario/
      tabla de mareas/contexto). `clasesQueSabes`, `puntoDePartida`, `resultadoNivel`.
- [x] Lógica pura de la ficha: `src/course/ficha.js` (necesitaFicha, fichaPendiente, notaParaAlumno, reglasDeIdea,
      preguntaParaProbar).
- [x] Store: `recordExam(…, { nivel: true })` no toca la cola de repaso; `nivel/recordNivel`, `fichasVistas/recordFichaVista`.
- [x] `estadoLeccion` → «saltada» (reg.saltada sin empezar): cuenta como hecha para el plan, no como vista.

## Pendiente
- [ ] Vistas: #/<tit>/nivel, #/<tit>/idea/<id>; Hoy (oferta, punto de partida, «Ya lo sabes: saltar»); Más; repaso
      (ficha tras el segundo fallo); resumen y Temario (enlace a la ficha). CSS claro/oscuro.
- [ ] Tests, precache, Playwright y capturas.

## Cómo seguir
`cd nautica && npm test`; tras tocar ficheros servidos: `git add` + `npm run precache` + `node --check sw.js`.
