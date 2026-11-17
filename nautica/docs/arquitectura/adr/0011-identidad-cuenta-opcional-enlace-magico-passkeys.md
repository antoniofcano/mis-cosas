# ADR 0011: Cuenta opcional, enlace mágico, passkeys y sesiones revocables

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

La identidad es un código de 12 símbolos para siempre: quien lo ve una vez tiene acceso completo sin caducidad ni
revocación (S-10), vive en claro y viaja en un enlace (S-05), y su *pepper* no se puede rotar (S-11). El público
incluye gente mayor; el producto promete funcionar sin cuentas.

## Decisión

- La app **sigue funcionando sin cuenta**. Cada aparato obtiene una **sesión** propia (token opaco; en el servidor,
  su *hash*), revocable desde «Mis dispositivos».
- El **código de alumno pasa a ser un enlace de un solo uso** (10 minutos) para unir un aparato.
- **Cuenta opcional con enlace mágico** por correo; **passkeys** después como forma cómoda de entrar. Sin contraseñas.
- Cuenta **obligatoria para profesores, administradores de centro y para pagar**. El alumno de academia entra con el
  código de centro, sin cuenta.
- Sesión en cookie `__Host-` `HttpOnly` del subdominio de la API (mismo sitio que la web).
- `/v1/sync` acepta el código antiguo hasta 12 meses después de apagar el Worker; el *hash* lleva versión de *pepper*.

## Alternativas

- **Solo el código, como hoy:** sin revocación ni roles.
- **Correo y contraseña:** contraseñas que guardar y que olvidar.
- **Google o Apple:** rápido, pero datos en terceros y dependencia.
- **Un servicio de identidad externo o autoalojado:** otra pieza que operar para un flujo sencillo.
- **Token en el almacenamiento del navegador:** legible por cualquier script.

## Consecuencias

- Hace falta enviar correo: proveedor transaccional europeo, con SPF, DKIM y DMARC en el dominio.
- Un alumno sin cuenta que pierde todos sus aparatos pierde el acceso: la app se lo explica y le propone la cuenta
  como forma de no perder el progreso.
- Unir una cuenta con progreso previo reutiliza la fusión de bases, con su regla de «nunca largo».
