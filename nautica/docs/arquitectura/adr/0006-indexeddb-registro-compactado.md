# ADR 0006: IndexedDB con registro de operaciones compactado

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El registro de operaciones se serializa entero en `localStorage` en cada respuesta (hasta ~2 MB, síncrono), comparte
5 MB con todo el origen, no se compacta y hay 14 claves sin inventario (D-01, D-02, D-08). El modelo de operaciones y
pliegue, en cambio, es de lo mejor del proyecto.

## Decisión

- Una base IndexedDB `patron` con almacenes `ops` (una fila por operación), `base`, `meta`, `local`, `kv`,
  `carta-usuario` y `errores`; acceso solo desde `apps/web/src/datos/` con `idb` 8.
- Lectura en memoria (se pliega al arrancar), escritura asíncrona por operación, volcado en `pagehide`.
- **Compactación:** las operaciones confirmadas por el servidor con más de 90 días se pliegan a una base (operaciones
  `b`, mecanismo ya existente) cuando pasan de 3.000. Invariante probado: `plegar(base + cola) ≡ plegar(todo)`.
- `BroadcastChannel` y `navigator.locks` entre pestañas.
- Migración desde `localStorage` verificada por igualdad del progreso plegado; la copia antigua se guarda 60 días.

## Alternativas

- **SQLite en el navegador (WASM + OPFS):** consultas potentes, pero ≈ 400 KB más y peor soporte en WebKit.
- **Seguir en `localStorage` en origen propio:** resuelve el reparto de los 5 MB, no la reescritura completa.
- **No compactar y confiar en la cuota:** el coste de arranque crecería con la fidelidad del alumno.

## Consecuencias

- Tras compactar, un aparato ya no puede resubir el historial fino si el servidor lo pierde: resube la base, con la
  regla conocida de «puede quedarse corto, nunca largo». Se acepta porque el servidor pasa a tener copias y
  recuperación a un punto en el tiempo (ADR 0015).
- La API del almacén (`progress.get()`, `recordExam`…) no cambia para los motores.
- Safari puede purgar el almacenamiento de sitios sin instalar tras semanas sin uso: se pide persistencia y la
  sincronización sigue siendo la red de seguridad.
