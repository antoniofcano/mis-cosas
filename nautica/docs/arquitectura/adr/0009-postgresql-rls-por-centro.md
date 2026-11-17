# ADR 0009: PostgreSQL en el VPS con seguridad por filas entre centros

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El dueño ha fijado las academias como objetivo del primer año: profesor que sigue a sus alumnos, varios centros
aislados entre sí y canon por centro. D1 no da relaciones, ni aislamiento, ni consultas sobre el progreso (D-04, D-05).

## Decisión

- **PostgreSQL 18** en Docker en el VPS, junto a la API.
- **Seguridad por filas (RLS)** activada y forzada en toda tabla con `centro_id` o `alumno_id`. El contexto
  (`app.cuenta_id`, `app.alumno_id`, `app.centro_id`, `app.rol`) se fija por transacción con `set_config(..., true)`
  desde un único punto del código.
- Roles separados: `patron_propietario` (DDL, solo migraciones), `patron_api` (sin `BYPASSRLS`, sin `TRUNCATE`),
  `patron_lectura` y `patron_copias`.
- El consentimiento del alumno forma parte de la política que deja ver su progreso al profesor.
- Una prueba recorre el catálogo y falla si una tabla nueva queda sin política; otra batería comprueba el aislamiento
  entre dos centros ruta a ruta.

## Alternativas

- **Filtrar solo en el código:** un `WHERE` olvidado es una fuga entre centros, y el código lo escriben agentes.
- **Un esquema o una base por centro:** aislamiento fuerte, pero migraciones y copias multiplicadas, y el alumno es
  transversal (puede tener progreso propio y estar en un centro).
- **SQLite con Litestream:** suficiente en volumen, sin aislamiento por filas.
- **PostgreSQL gestionado:** menos operación, más coste y otro proveedor; el VPS ya está pagado.

## Consecuencias

- Operar Postgres (copias, parches, vigilancia) pasa a ser trabajo del dueño: se acota con los ADR 0015 y 0019.
- Las políticas con subconsulta tienen coste: índices dedicados y medida del panel del profesor en CI.
- Las tareas de sistema (proyecciones, retención) corren con un contexto `rol = 'sistema'` explícito y auditado,
  nunca saltándose RLS.
