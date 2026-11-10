# Ideas

Cajón de ideas de producto que **no están planificadas**. Cuando una se decide, pasa a `docs/ROADMAP.md` con su id y aquí
se tacha con la referencia. Cada idea dice qué problema resuelve, para poder descartarla con criterio.

_Última revisión: 10 de noviembre de 2026._

## Formación

### Entrenar el procedimiento, no solo el resultado
- **Problema:** en un problema de carta o de mareas el alumno elige a, b, c o d; si falla ve la solución entera y tiene
  que encontrar él en qué paso se perdió.
- **Idea:** un modo guiado en que la app pide cada paso por separado («¿cuánto vale la Ct?», «¿y el rumbo verdadero?»,
  «marca la situación») y lo corrige en el momento. Los pasos ya existen en las resoluciones programadas
  (`src/exams/kit.js`).
- **Qué se gana:** el error se descubre en el paso exacto y en segundos, y se ve si el alumno falla siempre en el mismo.

### Diagnóstico por tipo de error
- **Problema:** la app sabe que una pregunta se ha fallado, pero no por qué.
- **Idea:** cuando la respuesta coincide con la que sale de un error típico (signo de la Ct, abatimiento por deriva,
  escala equivocada, interpolación), decirlo: «te salen 9° de diferencia: es lo que da restar la Ct en vez de sumarla».
  Los ejercicios generados ya diagnostican errores típicos; faltaría llevarlo a las preguntas reales.
- **Qué se gana:** se repasa el fallo concreto, no todo el tema; y a un profesor le dice qué errores repite su grupo.

### Examen de carta con papel de verdad
- **Problema:** el examen se hace sobre la carta en papel, con transportador y compás; la app entrena en pantalla.
- **Idea:** hojas de práctica imprimibles por tipo de problema y una guía de cómo organizar la mesa y el tiempo.
- **Condición:** la carta oficial tiene derechos (Instituto Hidrográfico de la Marina); solo con cartografía propia o permiso.

### Las prácticas obligatorias
- **Problema:** las prácticas de seguridad y navegación y las de radio no tienen ningún apoyo en la app.
- **Idea:** qué se hace en cada una, qué llevar y una lista de comprobación. Encaja con el modelo de academias.

### Vídeos con infografías de las ideas difíciles
- Ver `docs/VIDEOS-PY.md`: una ficha por vídeo de las ideas del Patrón de Yate que peor se asimilan.

## Consulta rápida

- **Glosario visual** del barco y de la jarcia, con buscador.
- **Simulacros con el formato exacto de cada tribunal:** orden, numeración y hoja de respuestas.
- **Novedades normativas** que cambian respuestas: ya está en la hoja de ruta (R-13).

## Ya decididas (pasaron a la hoja de ruta)

- ~~Estrategia de examen~~ → R-31.
- ~~Fórmulas y tablas en una hoja, con ejemplo resuelto~~ → R-32.
- ~~Modo «la semana antes»~~ → R-33.
- ~~Entrenar el procedimiento, no solo el resultado~~ → R-35 (se conserva arriba la explicación).
- ~~Diagnóstico por tipo de error~~ → R-36 (ídem).
