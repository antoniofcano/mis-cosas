# ADR 0008: API con Node + Fastify y contratos Zod compartidos

- **Estado:** aceptada (cambia: antes Hono)
- **Fecha:** 17 de noviembre de 2026

## Contexto

La versión anterior elegía Hono porque usa `Request`/`Response` estándar, como el Worker de v1, y permitía portar su
manejador y sus pruebas casi sin tocar. Con desarrollo nuevo no se porta el Worker: la API nace con otro contrato
(ADR 0010). Va al VPS con Docker, junto a PostgreSQL, y la operará una sola persona.

## Decisión

- **Node 24 LTS + Fastify 5.**
- **Contratos en `@patron/contratos`** (Zod 4): eventos versionados y petición y respuesta de cada ruta. La API los usa
  con `fastify-type-provider-zod` (valida entrada y salida); el cliente, con un `fetch` tipado derivado de ellos.
  OpenAPI 3.1 generado como documentación.
- Piezas oficiales: `@fastify/rate-limit`, `@fastify/helmet`, `@fastify/cookie`, `@fastify/cors`, registros `pino`
  con redacción; `@fastify/websocket` cuando llegue el aula.
- Acceso a datos con `pg` 8 y Kysely 0.28, con tipos generados de la base; sin ORM.
- Tareas programadas en un segundo proceso de la misma imagen con `pg-boss` 10; sin Redis.
- Prefijo `/v2` en las rutas, para no confundirlas nunca con las del Worker de la maqueta.

## Alternativas

- **Hono:** ligero y portable a otros entornos; su ventaja aquí era portar el Worker, que ya no aplica.
- **NestJS:** demasiada estructura para una persona.
- **tRPC:** acopla el cliente a los tipos del servidor y complica un API estable.
- **Las rutas de servidor de SvelteKit:** uniría web y API en un despliegue; rompe «la web vive en la CDN y abre sin el VPS».
- **Workers + Postgres externo:** dos proveedores y latencia para lo mismo.

## Consecuencias

- Añadir un tipo de evento es un cambio en `contratos` que cliente y servidor adoptan en el mismo despliegue.
- Un solo proceso: los límites de tasa en memoria se reinician al desplegar (aceptable).
- La API queda atada a Node; no es un problema con servidor propio.
