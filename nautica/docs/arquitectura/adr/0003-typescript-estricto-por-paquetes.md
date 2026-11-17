# ADR 0003: TypeScript estricto por paquetes, con `checkJs` de transición

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

Ni un `@ts-check` y un solo `@typedef`. `tsc --checkJs` sin `strict` da 472 errores (13 llamadas con argumentos de más
y 95 aritméticas dudosas: fallos probables); con `strict`, 14.159, de los que 8.714 son parámetros sin anotar. Los
directorios del núcleo dan entre 0 y 17 errores salvo `course` (103) e `illustrations` (184).

## Decisión

1. `checkJs` sin `strict` como puerta de CI inmediata sobre el código actual, con una lista de errores conocidos que
   solo puede bajar (trinquete) hasta 0.
2. `contratos` y `api` nacen en TypeScript `strict` (más `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
   `verbatimModuleSyntax` y `erasableSyntaxOnly`).
3. El núcleo pasa a `.ts` estricto directorio a directorio, de menos a más errores, un PR por directorio y sin tocar
   los tests.
4. La `ui/` antigua no se convierte: se borra.
5. Las pruebas del núcleo siguen en `node:test`, que en Node 24 ejecuta `.ts` sin compilar.

## Alternativas

- **JSDoc + `checkJs` para siempre:** evita compilar, pero ya hará falta empaquetar, y las uniones de operaciones se
  escriben mal en comentarios.
- **Convertir todo de golpe:** 14.159 errores a la vez; imposible de revisar.
- **Migrar las pruebas a Vitest:** reescribir 2.581 casos sin ganar nada.

## Consecuencias

- Los tipos de dominio (`Pregunta`, `Operacion`, `Progreso`, `Titulacion`, `Leccion`) se definen una vez, derivados
  de los esquemas Zod de `contratos`.
- `erasableSyntaxOnly` prohíbe `enum` y `namespace`: se usan uniones de literales.
- Tipar `plegar.js` y `operaciones.js` (complejidad 83 y 66) es la parte delicada: se hace con el test de equivalencia
  de 200 secuencias como red y sin reestructurar en el mismo PR.
