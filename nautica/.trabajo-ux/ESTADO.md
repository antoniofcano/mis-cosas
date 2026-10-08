# Rediseño de Hoy y sesión de estudio (rama feat/ux-hoy)

Maqueta aprobada: Main.dc.html (fuera del repo, en el scratchpad de la sesión). Encargo: Hoy con fase (Aprender ·
Mezclar · Comprobar), una sesión con un botón, ejecutor de sesión (#/<tit>/sesion), resumen, Más en la barra.

## Hecho
- [x] `src/course/sesion.js` (puro): deducirFase, componerSesion, estado de la sesión, resumen. Tests: `tests/sesion.test.js`.

## Pendiente
- [ ] UI: `src/ui/sesion.js` (guardar/leer sesión en ajuste `sesion_<tit>`, barra de tramos, gancho de cierres)
- [ ] Ejecutor `#/<tit>/sesion` (reenvía al paso actual; resumen al acabar)
- [ ] Hoy nueva (fase, tarjeta de sesión, podcast)
- [ ] Más (`#/<tit>/mas`) y barra Hoy · Temario · Examen · Más
- [ ] Etiqueta de concepto en preguntas (solo si hay etiquetas) y calculadora en la pregunta
- [ ] CSS claro/oscuro, precache, capturas Playwright, repaso adversarial

## Cómo seguir
`cd nautica && npm test`. Diseño del ejecutor: la sesión se guarda en progress.settings().sesion_<tit>; app.js pinta
una barra de sesión encima de la vista cuando la ruta coincide con el paso actual; `cierre()` (src/ui/cierre.js) y
el resultado del examen marcan el paso hecho y ofrecen «Siguiente».
