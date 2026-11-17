# ADR 0006: IndexedDB con eventos e instantánea del servidor

- **Estado:** aceptada (cambia: ya no hay migración desde `localStorage` ni compactación a «bases»)
- **Fecha:** 17 de noviembre de 2026

## Contexto

v1 serializa el registro entero en `localStorage` en cada respuesta, dentro de 5 MB compartidos y sin compactar
(D-01, D-02). El producto nuevo guarda el progreso como eventos (ADR 0010) y el servidor tiene autoridad e instantáneas.

## Decisión

- Una base IndexedDB `patron`, con esquema versionado, accedida solo desde `apps/web/src/lib/datos/` con `idb` 8.
  Almacenes: `eventos` (una fila por evento), `instantanea`, `meta`, `local`, `carta-usuario`, `errores`.
- Estado en memoria (instantánea + eventos posteriores, plegados al arrancar); cada escritura es un `put` asíncrono;
  volcado forzado en `pagehide`.
- **Compactación:** con más de 2.000 eventos confirmados, el aparato baja la instantánea del servidor y borra los
  eventos que cubre.
- `BroadcastChannel` y `navigator.locks` entre pestañas; `navigator.storage.persist()`.
- `localStorage` solo para la preferencia de tema.

## Alternativas

- **SQLite en el navegador (WebAssembly + OPFS):** consultas locales, pero ≈ 400 KB más, *worker* obligatorio y
  comportamiento desigual en WebKit, para datos que caben en memoria.
- **Dexie:** más cómoda para consultas; aquí casi todo es «añadir» y «leer todo».
- **Guardar solo el estado plegado:** más simple, pero no permite unir aparatos ni reintentar subidas.
- **Que el aparato conserve todo el historial para recomponer el servidor (v1):** innecesario con copias y
  recuperación a un punto en el tiempo.

## Consecuencias

- El almacenamiento local no crece sin límite y escribir una respuesta no depende de la antigüedad del alumno.
- Si el servidor perdiera datos más allá de sus copias, los aparatos compactados no podrían reponer el historial
  fino: se acepta (ADR 0015).
- Safari puede purgar el almacenamiento de sitios sin instalar tras semanas sin uso: lo sincronizado se recupera del
  servidor; lo no sincronizado se pierde, y por eso se sincroniza pronto.
