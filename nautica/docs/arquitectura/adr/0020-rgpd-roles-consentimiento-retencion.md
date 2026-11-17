# ADR 0020: RGPD: papeles, consentimiento, retención y borrado

- **Estado:** aceptada (los textos legales, pendientes de revisión profesional)
- **Fecha:** 17 de noviembre de 2026

## Contexto

No hay política de privacidad, ni exportación, ni borrado, ni caducidad de datos (S-12); la documentación llama
«nada que lo identifique» a lo que son datos seudónimos (S-13). Es exigible ya y bloquea cobrar. Las academias añaden
un tercero que ve datos del alumno.

## Decisión

- **Papeles:** el titular del servicio es responsable del tratamiento de los alumnos particulares. Para el seguimiento
  de alumnos de un centro, **el centro es responsable y el servicio su encargado**, con contrato de encargo aceptado
  al dar de alta el centro y anexo de subencargados.
- **Consentimiento** del alumno para compartir su progreso con su profesor: explícito, granular, registrado con la
  versión del texto, revocable en un toque y **aplicado por la base de datos** (política RLS). No compartir no quita
  el acceso al contenido.
- **Exportación y borrado desde la app**, con o sin cuenta. Borrado con 7 días de margen, en cascada, con lápida para
  que los aparatos antiguos no recreen al alumno.
- **Retención:** 24 meses de inactividad para alumnos y cuentas; 12 meses para la auditoría de accesos; 30 días de
  registros; 35 días de copias; 6 años para pagos.
- **Minimización:** la cuenta es un correo; el servidor no guarda IP ni agente de usuario en claro.
- **Registro de actividades de tratamiento** y textos legales versionados en `docs/legal/`.
- Datos en la UE.

## Alternativas

- **Basar el acceso del profesor en el contrato del centro:** defendible, pero el producto promete que el alumno decide.
- **Conservar los datos indefinidamente:** contrario a la limitación del plazo de conservación.
- **Borrado inmediato:** un toque equivocado sería irreversible; ya hubo un borrado accidental.

## Consecuencias

- Los textos legales debe revisarlos un profesional antes de cobrar: tarea y coste del dueño, no técnicos.
- Un alumno sin cuenta e inactivo 24 meses pierde su progreso en el servidor sin aviso por correo (no lo hay); la app
  avisa al volver tras 18 meses.
- El panel del profesor enseña menos de lo que podría; es deliberado.
