# Rediseño de Hoy y sesión de estudio (rama feat/ux-hoy)

Maqueta aprobada: Main.dc.html (fuera del repo, en el scratchpad de la sesión). Encargo: Hoy con fase (Aprender ·
Mezclar · Comprobar), una sesión con un botón, ejecutor de sesión (#/<tit>/sesion), resumen, Más en la barra.

## Hecho
- [x] `src/course/sesion.js` (puro): deducirFase, componerSesion, estado de la sesión, resumen. Tests: `tests/sesion.test.js`.
- [x] `src/ui/sesion.js`: sesión guardada en el ajuste `sesion_<tit>`, barra de tramos (Parar/Saltar), botones de cierre.
- [x] Ejecutor `#/<tit>/sesion` (app.js reenvía al paso actual; al acabar, resumen en `src/ui/views/sesion.js`).
- [x] Hoy nueva (`src/ui/views/hoy.js`): fase, tarjeta de sesión (nueva / a medias / hecha), podcast, progreso plegado.
- [x] Más (`#/<tit>/mas`, `src/ui/views/mas-menu.js`) y barra Hoy · Temario · Examen · Más. `#/mas` lleva a Más.
- [x] Etiqueta de concepto (`src/ui/concepto.js`, solo con conceptos.json) y calculadora en la pregunta (theory.js).
- [x] Gancho de cierre: `cierre()` (cierre.js) y resultado del examen (theory.js) marcan el paso hecho.
- [x] CSS (tokens --sesion-*, --on-accent, claro y oscuro). Flujo probado en Playwright (scripts en el scratchpad).

## Pendiente
- [ ] Capturas completas (390×844 y 1280×800, claro/oscuro) de cada fase, cada tipo de paso, resumen y Más
- [ ] Prueba sin conexión (service worker) y repaso adversarial del diff
- [ ] README/llms.txt: rutas nuevas

## Cómo seguir
`cd nautica && npm test`; tras tocar ficheros servidos: `git add` + `npm run precache` (solo entra lo que está en git).
