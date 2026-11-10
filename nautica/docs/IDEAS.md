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

## Simulación y 3D (a largo plazo, fuera del alcance actual)

Ideas del autor, anotadas el 10 de noviembre de 2026. Son un salto de tecnología (motor 3D, física, modelos) respecto a
la app actual, que es 2D y sin dependencias: cada una sería un proyecto propio, y encajan mejor en la versión 2 o en un
producto hermano que comparta contenido y progreso.

### Barco en 3D con despiece interactivo
- **Problema:** la nomenclatura (casco, jarcia, aparejo, elementos de amarre y fondeo) se aprende hoy con láminas planas.
- **Idea:** un modelo 3D del barco que se gira, se acerca y se «despieza» por capas; tocar una pieza da su nombre y su
  función, y un modo juego pide «toca la botavara». Sustituiría al glosario visual plano.
- **A resolver:** modelos propios o con licencia clara, peso de descarga en móvil y que funcione sin conexión.

### Simulador de radio
- **Problema:** las prácticas de radio y los procedimientos de socorro (MAYDAY, PAN PAN, SÉCURITÉ, llamada selectiva
  digital) se memorizan sin practicarlos.
- **Idea:** un equipo VHF simulado con sus mandos, el botón de socorro y guiones de llamada que el alumno completa o dice
  en voz alta, con corrección del procedimiento.
- **Nota:** es el más asequible de los tres: no necesita 3D y casa con el apoyo a las prácticas obligatorias.

### Mundo 3D con mar abierto y puerto, y física
- **Problema:** maniobra, gobierno, reglas de rumbo y balizamiento se entienden de verdad al verlos en movimiento.
- **Idea:** un pequeño mundo con puerto y mar abierto y física del barco (viento, corriente, inercia, efecto de la hélice)
  para practicar atraque, fondeo, hombre al agua o un cruce según el RIPA, eligiendo el tipo de barco (vela, motor) y el
  modo: **observador** (la app lo hace y lo explica), **asistido** (lo haces con ayudas) o **solitario** (sin ayudas).
- **A resolver:** fidelidad de la física frente a la complejidad, rendimiento en móviles, y que lo simulado sea correcto
  (la app ya tiene animaciones 2D con física de evolución, ciaboga, desatraque y hombre al agua como punto de partida).

## Consulta rápida

- **Glosario visual** del barco y de la jarcia, con buscador (ver arriba la alternativa en 3D con despiece).
- **Simulacros con el formato exacto de cada tribunal:** orden, numeración y hoja de respuestas.
- **Novedades normativas** que cambian respuestas: ya está en la hoja de ruta (R-13).

## Ya decididas (pasaron a la hoja de ruta)

- ~~Estrategia de examen~~ → R-31.
- ~~Fórmulas y tablas en una hoja, con ejemplo resuelto~~ → R-32.
- ~~Modo «la semana antes»~~ → R-33.
- ~~Entrenar el procedimiento, no solo el resultado~~ → R-35 (se conserva arriba la explicación).
- ~~Diagnóstico por tipo de error~~ → R-36 (ídem).
