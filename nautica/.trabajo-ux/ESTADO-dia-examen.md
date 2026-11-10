# Estado: día del examen y repaso exprés (R-44, R-45)

Rama `feat/dia-examen` (desde `feat/examen-dia`). Sin push ni PR.

## Hecho
- `#/<tit>/dia-examen`: lista con casillas por tribunal y titulación (`src/course/dia-examen.js`, `data/comun/dia-examen.json`, `src/ui/views/dia-examen.js`). Cada elemento con su fuente; lo no comprobado, «pendiente de verificar». Calculadora solo si `calculadoraPermitida`. Imprimible.
- Tu convocatoria: hora, sede y enlace (`src/course/convocatoria.js`, `src/ui/convocatoria.js`), editables y borrables en Ajustes → «Tu convocatoria». Hoy: tarjeta «Tu examen» la semana del examen y recordatorio de admitidos (21 días a la víspera). También en la vista de la semana.
- `#/<tit>/vispera`: repaso exprés de 15 min (`src/course/vispera.js`, `tools/errores-frecuentes.mjs`, `data/comun/errores-frecuentes.json`); paso del día k = 1 de la semana antes (`planSemana({ repasoExpres })`).
- Guardado: ajustes compartidos `convocatoria_<tit>` y `listadia_<tit>` (docs/SYNC.md); aceptados por el validador de `origin/main`.
- Tests: `tests/dia-examen.test.js`, `tests/vispera.test.js`.

## No hecho / decidido
- Push diario con texto de admitidos: no. El texto es fijo en `sw.js` y el SW no conoce la fecha; exigiría duplicar estado en el SW. Worker sin tocar.
- La app no consulta el boletín: solo recuerda.
- Sin verificar: convocatorias vigentes de cada tribunal (Andalucía 2025, Madrid 2026; Baleares sin revisar).
