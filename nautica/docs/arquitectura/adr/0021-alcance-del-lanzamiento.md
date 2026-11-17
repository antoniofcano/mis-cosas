# ADR 0021: Orden de lanzamiento: particulares, academias, cobro

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

Un desarrollo nuevo no entrega nada hasta que lanza. v1 tiene 37 pantallas; igualarlas todas antes de publicar
retrasaría un año el primer uso real. El dueño quiere academias el primer año y cobrar después. Las puertas de negocio
de `PRODUCTO.md` (derechos del contenido, privacidad) siguen vigentes para cobrar.

## Decisión

Tres lanzamientos, en este orden, cada uno sobre el anterior:

1. **Particulares (gratis).** Lo que hace falta para preparar el examen de principio a fin:
   PER y PY en los tres tribunales; bienvenida; «Hoy» con plan; clases y tarjetas; tandas por tema con corrección y
   explicación; exámenes de convocatoria, simulacros y examen final con su reserva; repaso espaciado y «estoy listo»;
   **carta paso a paso** y ejercicios generados; láminas; progreso; ajustes de letra y tema; sin conexión; sincronizar
   aparatos; cuenta opcional; exportar y borrar datos; traer el progreso de v1.
2. **Academias.** Centros, grupos, código de centro, consentimiento, panel del profesor, configuración del grupo.
3. **Cobro.** Pases para particulares y canon para centros.

**Paridad con v1, después del primer lanzamiento y en paralelo con academias**, por este orden: mesa de cartas
interactiva; pódcast; cuaderno de fallos y dosis; la semana antes, víspera y día del examen; estrategia y simulacro
completo; travesía e insignias; recordatorio diario; calculadora, biblioteca, fórmulas, chuleta y mapas; carta
escaneada por el alumno.

## Alternativas

- **Paridad completa antes de lanzar:** un año sin usuarios reales.
- **Academias primero:** el panel del profesor no vale nada sin una app de alumno completa.
- **Cobrar desde el primer lanzamiento:** bloqueado por los derechos del contenido y prematuro sin uso real.

## Consecuencias

- En el primer lanzamiento el producto nuevo hace **menos** que v1 en algunas cosas (mesa de cartas, pódcast). v1
  sigue abierta para eso, y la lista de paridad lo dice con claridad.
- La carta paso a paso entra en el primer lanzamiento porque es el diferencial; la mesa interactiva es la pieza de
  interfaz más compleja de v1 y va la primera de la paridad.
- El relevo del contenido (ADR 0007) coincide con el primer lanzamiento.
