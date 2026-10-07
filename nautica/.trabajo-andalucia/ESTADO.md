# Andalucía 2015–2019 en el eje vivo (fase F5) · estado del trabajo

Rama: `feat/andalucia-2015-2019` (desde origin/main). Fichero de notas para retomar el trabajo sin contexto.

## Datos de partida

- Extracción previa (solo caché, no en git): `nautica/.cache/bancos/andalucia/` copiada de
  `.claude/worktrees/agent-a79feab3cb540097a/nautica/.cache/bancos/andalucia/` (PDF, páginas, etapas, salida).
  Si falta: `npm run bancos -- andalucia --todas` (las rutas `/export/drupaljda/` van por rangos).
- Salida de la caché: PER 1530 (810 vivas + 720 nuevas de 2015–2019), PY 1360 (720 + 640). Los ids vivos salen iguales.
- Duplicados exactos (mismo enunciado, opciones y respuesta por texto) con el banco vivo: PER 28 (5 de ellos con una
  pregunta solo de convocatorias reservadas 2025: and-2015-c1-t29, and-2016-c2-t28, and-2016-c3-t38, and-2017-c1-t37,
  and-2017-c3-t39), PY 20 (ninguno reservado). Entre las nuevas: PER 8, PY 11.
- Preguntas nuevas con «figura» en el texto sin imagen extraída: and-2016-c2-t26, and-2019-c2-t01, and-2019-c2-t21,
  and-2019-c3-t01 (revisar; puede haber más con figura sin la palabra).

## Plan / hecho

- [ ] 1. Fusión en `data/ejes/andalucia/{per,py}/preguntas.json` por la etapa escribir (solo añadir; duplicados → apareceEn).
- [ ] 2. Revisión normativa de las marcadas (ajustes.json con motivo y fuente).
- [ ] 3. Explicaciones de las nuevas que no son de carta (lotes por subsesiones).
- [ ] 4. Soluciones de carta (PER 42–45, PY n11–n20) o documentadas.
- [ ] 5. Práctica por clase (practica.mjs).
- [ ] 6. Puertas, npm test, huella, humo con Playwright.

## Decisiones

- Las 5 duplicadas de preguntas reservadas (2025) NO se funden: fundirlas sacaría esas preguntas de la reserva (en modo
  «examen», una pregunta que sale también en una convocatoria pública deja de estar reservada). Se crean con su id propio.
