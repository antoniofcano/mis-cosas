# ADR 0011: Cuenta opcional, enlace mágico, passkeys y sesiones revocables

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

En v1 la identidad es un código de 12 símbolos para siempre: quien lo ve una vez tiene acceso completo sin caducidad
ni revocación (S-10), y viaja en un enlace (S-05). El público incluye gente mayor y el producto promete que se puede
estudiar sin registrarse. Profesores y pagos necesitan una identidad de verdad.

## Decisión

- La app **funciona sin cuenta**. Cada aparato obtiene una **sesión** propia (token opaco; en el servidor, su *hash*),
  revocable desde «Mis dispositivos».
- Para **unir un aparato**, un enlace o código de **un solo uso** y 10 minutos. No existe credencial permanente compartida.
- **Cuenta opcional con enlace mágico** por correo; **passkeys** después. Sin contraseñas.
- Cuenta **obligatoria para profesores, administradores de centro y para pagar**. El alumno de academia entra con el
  código de centro, sin cuenta.
- Sesión en cookie `__Host-` `HttpOnly` del subdominio de la API (mismo sitio que la web).
- Implementación propia de sesiones y enlaces (pocas rutas, bien acotadas); WebAuthn con `@simplewebauthn/server` 13.

## Alternativas

- **Código permanente como en v1:** sin revocación ni roles.
- **Correo y contraseña:** contraseñas que guardar y que olvidar.
- **Google o Apple:** rápido, pero datos en terceros y dependencia.
- **Una librería o servicio de autenticación completo:** encaja mal con «alumno sin cuenta con varios aparatos» y con
  centros con seguridad por filas; se revisa en la rebanada vertical.
- **Token en el almacenamiento del navegador:** legible por cualquier script.

## Consecuencias

- Hace falta enviar correo: proveedor transaccional europeo, con SPF, DKIM y DMARC en el dominio.
- Un alumno sin cuenta que pierde todos sus aparatos pierde el acceso: la app se lo explica y le propone la cuenta.
- La autenticación propia exige revisión de seguridad por un modelo distinto del que la escribió y por el dueño.
- Unir una cuenta con un alumno que ya tenía progreso es sumar eventos (ADR 0010).
