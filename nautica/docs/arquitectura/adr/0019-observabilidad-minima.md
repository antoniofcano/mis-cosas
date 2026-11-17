# ADR 0019: Observabilidad mínima para una persona

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

En v1 no hay registros (apagados a propósito para no guardar credenciales, S-18), ni alertas, ni métricas, ni errores
del cliente: una pérdida de datos se descubre cuando un alumno se queja (M-07). Quien opera es una sola persona.

## Decisión

- **Disponibilidad:** un monitor externo gratuito cada 5 minutos sobre la web y `/v2/salud`, y Uptime Kuma en el VPS
  para lo interno. Alertas por correo y mensajería.
- **Tareas críticas** (copia, restauración de prueba, retención, liquidación): latido a un vigilante externo.
- **Registros:** JSON estructurado sin datos personales, 30 días, con la rotación de Docker.
- **Umbrales:** una tarea cada 5 minutos comprueba 5xx, latencia, disco y crecimiento de la base.
- **Errores del cliente:** `POST /v2/errores` con huella, versión y ruta plantilla; sin datos del alumno.
- **Uso:** recuentos agregados diarios desde las proyecciones. Sin analítica de terceros ni *cookies*.

## Alternativas

- **Prometheus + Grafana + Loki:** tres servicios más que mantener para un proceso y una base.
- **Sentry o un APM comercial:** bueno, pero manda datos a un tercero; se reconsidera si los errores lo piden.
- **Seguir sin registros:** incompatible con cobrar.

## Consecuencias

- Menos detalle que con una pila completa; suficiente para saber que algo va mal y dónde.
- El número de alertas se mantiene bajo a propósito: cada una debe exigir una acción.
- Sin analítica de terceros no hay embudos de conversión finos; se miden con recuentos propios.
