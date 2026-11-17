# ADR 0003: TypeScript estricto desde el inicio y Vitest en todo el monorepo

- **Estado:** aceptada (cambia: antes había `checkJs` de transición y se conservaba `node:test`)
- **Fecha:** 17 de noviembre de 2026

## Contexto

v1 no tiene tipos (1 `@typedef` en 73.700 líneas) ni linter, y la forma de una pregunta o del progreso solo está en
prosa (T-01). En un desarrollo nuevo no hay código que tipar poco a poco, y la mayor parte la escribirán agentes: los
tipos y el lint son la primera revisión automática de su trabajo.

## Decisión

- **TypeScript `strict` en todos los paquetes desde la primera línea**, con `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes` y `verbatimModuleSyntax`. Sin JavaScript en `src/`.
- Los tipos de dominio (`Pregunta`, `Evento`, `EstadoAlumno`, `Titulacion`, `Leccion`) se derivan de los esquemas Zod
  de `@patron/contratos`: una sola fuente para tipo y validación.
- **Vitest 4 como único ejecutor** (núcleo, contratos, contenido, API, componentes) y `fast-check` para propiedades.
- ESLint con `complexity` ≤ 15 y funciones ≤ 80 líneas **como error**: no se admite otra `plegar` de complejidad 83.
- Lo que se porta de v1 se tipa en el mismo PR en que entra; sus pruebas se convierten a Vitest (`node:assert` sigue valiendo).
- Sin `any` explícito salvo lista con motivo.

## Alternativas

- **JavaScript con JSDoc y `checkJs`:** era la transición para el código existente; ya no hay código existente.
- **Mantener `node:test` para lo portado:** dos ejecutores y dos formas de medir cobertura sin motivo.
- **Límites de complejidad como aviso:** los avisos se acumulan (v1 tendría 743).

## Consecuencias

- Portar un módulo cuesta algo más que copiarlo: hay que anotarlo. A cambio, los 13 probables fallos de argumentos y
  las 95 aritméticas dudosas que `tsc` veía en v1 se resuelven al entrar.
- Las funciones largas de v1 que se porten tal cual (kit, generadores) necesitan partirse o una excepción anotada;
  partir con los casos dorados como red es seguro.
