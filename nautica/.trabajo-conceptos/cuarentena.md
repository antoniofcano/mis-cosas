# Cuarentena de lo reservado (rama feat/cuarentena-reserva)

Tarea: que ningún contenido servido cite preguntas reservadas para el examen final (fase 1: solo reglas y texto; el
audio del podcast se regenera en la fase 2). Todo está explicado en nautica/docs/CUARENTENA.md y en docs/BANCOS.md
(«Cuarentena»).

## Hecho (fase 1)
- `tools/cuarentena.mjs`: inventario (por id y por texto), `--arreglar`, `--plan`, `--deuda`, `--escribir`.
- `tests/cuarentena.test.js`: falla con citas nuevas; deuda del audio en `tools/cuarentena-deuda.json` (197, `MAX_DEUDA`).
- Arreglado en texto: práctica (441 citas), resueltos (7), verificación de las clases (131 fuentes), 32 preguntas de
  minijuegos en 23 guiones sin audio (PER temas 2-4 y 6-11), con episodios.json, data/podcast-per.json y README del podcast.
- App: pausas con reservada → equivalente del estudio, o aviso «Esta pregunta es del examen final»; tras el examen
  final del alumno, la del guion. Aviso suave en el episodio cuyo audio lee una reservada. Probado en navegador
  (per-6-0, per-5-1, py-1-3, per-1-1).
- docs/CUARENTENA.md (inventario, plan de la fase 2 con fragmentos y caracteres) y docs/BANCOS.md.

## Pendiente
- Fase 2: regrabar 31 episodios (47 preguntas; ~33.551 caracteres con caché, ~348.756 sin ella). Procedimiento en
  docs/CUARENTENA.md. No se ha llamado a ElevenLabs.
- Revisión humana de los minijuegos reescritos (sobre todo los de carta del tema 11 y 4-1).

## Cómo seguir
- `node tools/cuarentena.mjs` resumen; `--escribir` regenera docs/CUARENTENA.md; tras regrabar, `--deuda` y bajar `MAX_DEUDA`.
