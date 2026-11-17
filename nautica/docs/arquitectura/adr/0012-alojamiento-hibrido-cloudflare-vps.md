# ADR 0012: Alojamiento híbrido: Cloudflare para estáticos y audio, VPS para la API

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El dueño ha decidido alojamiento híbrido: API y base de datos en su VPS de OVH con Docker; web y audio tras una CDN;
la app debe abrir aunque el VPS caiga. GitHub Pages no permite cabeceras (CSP) y comparte origen con otros proyectos
(S-01, S-02). El audio son 304 MB que hoy están en git (M-04).

## Decisión

- **Cloudflare** como CDN, DNS y proxy: web en Workers Static Assets (`<dominio>`), audio en R2 (`audio.<dominio>`),
  API tras el proxy (`api.<dominio>`), *staging* tras Cloudflare Access.
- En el VPS, **Docker Compose** con Caddy 2, API, tareas, PostgreSQL 18 con pgBackRest y Uptime Kuma; un proyecto de
  Compose por entorno.
- El origen solo acepta conexiones de Cloudflare; SSH solo por VPN.

## Alternativas

- **Bunny.net:** europea y barata (1–2 €/mes); es el plan B, sin cambios de diseño.
- **Servir estáticos y audio desde el VPS:** un solo sitio, pero la app nueva no abriría si el VPS cae.
- **Seguir en GitHub Pages:** sin cabeceras, origen compartido, límite de 1 GB.
- **Traefik:** aporta descubrimiento dinámico que aquí no se usa; Caddy es un fichero corto.
- **Kubernetes o un PaaS autoalojado:** más superficie que operar que la propia aplicación.

## Consecuencias

- Cloudflare es subencargado de tratamiento y un punto de dependencia: si falla, falla la primera visita, no el
  estudio de quien ya tiene la app.
- Un solo VPS es punto único de fallo de la API; se asume por el diseño *offline-first* y las copias externas.
- R2 no cobra tráfico de salida: el coste del audio es prácticamente cero.
- Coste fijo adicional ≈ 6–8 €/mes.
