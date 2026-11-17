# ADR 0014: Migraciones SQL revisadas y producción intocable desde fuera

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

Una orden de borrado sin condición sobre producción eliminó alumnos reales y se supo por el aviso de un alumno (S-22).
En v1 el Worker se despliega a mano y borrar un alumno es una orden SQL a mano. Gran parte del código lo escriben agentes
con acceso a una terminal.

## Decisión

- **Migraciones con `dbmate` 2**: SQL puro, numerado, solo hacia delante, patrón expandir y contraer. `squawk` bloquea
  en CI lo destructivo.
- Las migraciones **solo las ejecuta el despliegue**, con `patron_propietario`, tras una copia verificada.
- **Sin camino de red ni credenciales fuera del VPS:** Postgres sin puerto publicado; ninguna contraseña de producción
  en GitHub ni en equipos locales.
- **El arnés de pruebas se niega** a conectarse a nada que no sea local y cuyo nombre no termine en `_test`.
- `patron_api` sin `TRUNCATE`, sin DDL y sin `DELETE` sobre `alumnos` y `eventos`; el borrado es una función que
  exige una solicitud registrada y vencida, con 7 días de margen.
- Acceso humano de solo lectura por defecto (`patron-psql`); la escritura manual hace copia antes, exige motivo y
  queda en `auditoria`.
- *Staging* con datos sintéticos; nunca una copia de producción.
- El producto nuevo no tiene credenciales de v1: contra la maqueta solo lee (un clon del repositorio y su API pública).

## Alternativas

- **Migraciones de un ORM (Drizzle, Prisma):** cómodas, pero RLS, roles y funciones acaban siendo SQL igualmente.
- **Confiar en un protocolo escrito:** es lo que había.
- **Migraciones con vuelta atrás automática:** las inversas destructivas son otra vía de pérdida; se vuelve atrás con
  la imagen anterior y, en el peor caso, con la recuperación a un punto en el tiempo.

## Consecuencias

- Depurar producción es más incómodo (solo lectura, por SSH y VPN): es el precio buscado.
- Los cambios de esquema necesitan a veces dos despliegues.
- Un agente no puede dañar producción ni queriendo: como mucho, proponer un PR.
