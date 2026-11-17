# ADR 0010: Registro de operaciones como fuente de verdad y proyecciones

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El progreso es un registro de operaciones con id único que cada aparato pliega de forma determinista; la convergencia
está probada en cualquier orden. El servidor guarda las operaciones como texto opaco y no puede contestar ninguna
pregunta sobre el progreso, que es lo que necesita la vista de profesor (D-04).

## Decisión

- Se **conserva el modelo**: `operaciones` (solo inserción, `jsonb`) es la fuente de verdad en el servidor; el
  cliente sigue plegando.
- Se añaden **tablas de proyección** (`proy_actividad_dia`, `proy_temas`, `proy_examenes`, `proy_resumen`) que una
  tarea calcula **plegando con el mismo código que el cliente** (`@patron/nucleo/sincro`).
- Las proyecciones son desechables y reconstruibles; un test de propiedad comprueba que coinciden con el pliegue.
- `instantaneas`: base plegada por alumno para que un aparato nuevo no descargue todo el historial.
- Contrato de operaciones versionado; `corr` y `fallo` dejan de ser claves de `settings` en la versión 2, y el pliegue
  acepta las dos formas.

## Alternativas

- **Proyectar con SQL o disparadores:** duplicaría en otro lenguaje reglas sutiles y divergiría.
- **Que el cliente suba su progreso plegado:** el servidor se fiaría del cliente y no convergería entre aparatos.
- **Abandonar el registro por tablas de estado:** pierde el funcionamiento sin conexión, que es un diferenciador.

## Consecuencias

- El servidor ejecuta código del núcleo: `api` depende de `nucleo` y se despliegan juntos.
- La vista del profesor va con segundos de retraso respecto a la sincronización.
- Cambiar una regla del pliegue obliga a reconstruir proyecciones (una orden; minutos).
