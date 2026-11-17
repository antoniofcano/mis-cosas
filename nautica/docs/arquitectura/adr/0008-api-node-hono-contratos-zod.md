# ADR 0008: API con Node + Hono y contratos Zod compartidos

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El servidor actual es un Worker de 612 líneas con D1, cuidadoso (consultas parametrizadas, validación estricta,
límites) pero sin modelo relacional. Importa el validador de la app por ruta relativa, lo que ha obligado a meter
datos nuevos en `settings` para no redesplegar (E-11, E-12). La API va al VPS con Docker.

## Decisión

- **Node 24 LTS + Hono 4** (`@hono/node-server`). Como el Worker, usa `Request`/`Response` estándar: `/v1/sync` y sus
  pruebas se portan cambiando solo el acceso a datos.
- **Contratos en `@patron/contratos`** (Zod 4): operaciones versionadas como unión discriminada, y petición y
  respuesta de cada ruta. La API valida con ellos; el cliente usa un `fetch` tipado derivado de ellos. OpenAPI 3.1
  generado solo como documentación.
- `/v1/*` intacto para la app antigua; `/v2/*` para lo nuevo.
- Acceso a datos con `pg` 8 y Kysely 0.28, con tipos generados de la base; sin ORM.
- Tareas programadas en un segundo proceso de la misma imagen con `pg-boss` 10; sin Redis.
- Límites de tasa en memoria; registros `pino` sin datos personales.

## Alternativas

- **Fastify 5:** más veterano en Node; obliga a reescribir el manejador y las pruebas del Worker.
- **Seguir en Workers con Postgres externo (lo que decía VERSION-2):** dos proveedores y latencia para lo mismo.
- **tRPC:** acopla el cliente a los tipos del servidor.
- **NestJS:** demasiada estructura para una persona.
- **OpenAPI como fuente y generar código:** válido; Zod evita el paso de generación y ya valida el contenido.

## Consecuencias

- Añadir un tipo de operación es un cambio en `contratos` que cliente y servidor adoptan en el mismo despliegue.
- Un solo proceso: los límites de tasa en memoria se reinician al desplegar (aceptable).
- El aula en tiempo real, cuando llegue, cabe en el mismo proceso con WebSocket.
