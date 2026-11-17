# ADR 0015: Copias con pgBackRest y restauración probada

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

Hoy no hay copias automáticas de D1 ni restauración ensayada (M-07). Con cuentas, centros y cobros, perder la base no
es recuperable desde los aparatos. Un solo VPS es punto único de fallo.

## Decisión

- **pgBackRest 2.5x** hacia un almacén S3 **en la UE y de un proveedor distinto del VPS**, cifrado en origen.
- Completa semanal, diferencial diaria, **WAL continuo** (`archive_timeout = 60 s`), retención de 35 días.
- `pg_dump` lógico semanal al mismo almacén, como formato portable.
- **Restauración automática semanal** en un contenedor desechable, con comprobaciones y latido a un vigilante externo;
  simulacro manual completo cada trimestre, con runbook.
- Objetivos: pérdida ≤ 5 minutos, recuperación ≤ 4 horas.
- La clave de cifrado se guarda también fuera del VPS.

## Alternativas

- **`pg_dump` nocturno:** sencillo, pero pierde hasta 24 horas y no permite volver a un instante concreto.
- **WAL-G:** equivalente; pgBackRest verifica mejor y está mejor documentado.
- **Instantáneas del VPS:** útiles como complemento; mismo proveedor y sin consistencia garantizada.
- **Réplica en caliente en otro servidor:** duplica coste y operación.

## Consecuencias

- Coste: céntimos al mes de almacenamiento.
- Los datos de un alumno borrado persisten en copias hasta 35 días; lo dice la política de privacidad.
- Si se pierden a la vez el VPS y la clave de cifrado, las copias no sirven: la clave vive en dos sitios.
