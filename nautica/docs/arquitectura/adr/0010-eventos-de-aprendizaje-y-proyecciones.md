# ADR 0010: Eventos de aprendizaje, pliegue conmutativo, servidor con autoridad y proyecciones

- **Estado:** aceptada (cambia: antes se conservaba el contrato de operaciones de v1)
- **Fecha:** 17 de noviembre de 2026

## Contexto

v1 guarda el progreso como un registro de operaciones que cada aparato pliega; converge en cualquier orden y funciona
sin conexión. Es de lo mejor de la maqueta, pero arrastra historia: tipos de una letra, datos nuevos metidos en
`settings` para no redesplegar (E-12), «bases» de migraciones antiguas, un pliegue de complejidad 83 que depende del
orden, un servidor que no entiende lo que guarda (D-04) y aparatos que conservan todo el historial para recomponerlo.
Con desarrollo nuevo se puede elegir de nuevo.

## Decisión

- **Se mantiene la idea** (el progreso es una lista de hechos y de ella se deriva todo) y **se rehace el contrato**:
  eventos tipados con versión en `@patron/contratos/eventos` (`respuesta`, `intento_ejercicio`, `actividad`,
  `leccion_vista`, `examen_hecho`, `ajuste`, `reserva_fijada`, `insignia`, `correccion_tema`, `fallo_cuaderno`,
  `convocatoria_alumno`, `importado_v1`), con id UUIDv7, instante, aparato y contador.
- **Pliegue conmutativo**: sumas, máximos, uniones, «gana el más reciente» y «gana el primero»; el repaso de cada
  pregunta guarda sus últimas 20 respuestas para recalcularse si llega una tardía. Propiedad probada:
  `aplicar(instantánea, eventos nuevos) ≡ plegar(todo)` en cualquier orden.
- **El servidor valida y tiene autoridad** sobre lo sincronizado; el aparato, solo sobre lo pendiente.
- **Instantáneas** por alumno (estado plegado hasta un `seq`) para aparatos nuevos y para compactar en local.
- **Proyecciones** (`proy_*`) calculadas con el mismo pliegue que el cliente; desechables y reconstruibles.

## Alternativas

- **Motor de sincronización Postgres ↔ SQLite local (PowerSync, ElectricSQL, Zero):** otro servicio que operar y una
  dependencia central, para un caso más simple que el que resuelven (un solo escritor por alumno, solo añadir).
- **CRDT genérico (Yjs, Automerge):** estado opaco en el servidor; sin consultas para el panel del profesor.
- **Estado con «gana el último»:** pierde intentos entre aparatos.
- **Conservar el contrato de v1 tal cual:** hereda sus rodeos; la compatibilidad se resuelve mejor con un conversor (ADR 0013).
- **Proyectar con SQL:** duplicaría en otro lenguaje las reglas del pliegue.

## Consecuencias

- `api` depende de `nucleo` y se despliegan juntos; el panel del profesor va con segundos de retraso.
- Diseñar el estado para que sea conmutativo exige cuidado al añadir cada tipo de evento: hay prueba de propiedad obligatoria.
- Cambiar una regla del pliegue obliga a reconstruir proyecciones e instantáneas (una orden; minutos) y sube la
  versión del pliegue.
- Ya no se puede recomponer el servidor desde los aparatos: se sustituye por copias probadas (ADR 0015).
