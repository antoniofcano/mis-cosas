# ADR 0016: CI/CD con GitHub Actions, entornos y aprobación

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

En v1 no existe `.github/`: nada ejecuta pruebas, lint ni tipos; publicar es hacer *push* a una rama y el Worker se despliega
a mano (M-01, S-20, S-21). Es el riesgo número 1 de la auditoría.

## Decisión

- **`ci.yml` obligatorio en cada PR:** formato, lint, tipos, reglas de capas, pruebas con umbral de cobertura,
  validación de contenido y cuarentena, pruebas de la API con Postgres efímero y batería de aislamiento, *build* con
  presupuesto de peso, E2E con axe y Lighthouse, auditoría de dependencias y de secretos.
- `main` protegida: sin *push* directo, CI en verde y revisión del dueño.
- **Entornos:** `staging` (automático desde `main`) y `produccion` (solo desde etiqueta, **con aprobación del dueño**).
- Web: `wrangler deploy` a Cloudflare. API: imagen en GHCR, desplegada por *digest*, la misma en los dos entornos.
- Versión y CHANGELOG generados con `release-please` y Conventional Commits.
- Renovate para dependencias e imágenes.

## Alternativas

- **Publicación continua a producción sin aprobación:** demasiado riesgo con una sola persona revisando agentes.
- **Despliegue «tirando» desde el VPS (Watchtower):** sin aprobación ni orden con las migraciones.
- **Otra plataforma de CI:** sin ventaja estando el código en GitHub.

## Consecuencias

- Publicar deja de ser inmediato: PR → *staging* → aprobación; un arreglo urgente tarda ≈ 20 minutos.
- El repositorio privado necesita GitHub Pro; ≈ 300–600 minutos de CI al mes, dentro de lo incluido.
- La norma «`npm test` en verde, claro y oscuro, a 360 px» de la hoja de ruta la impone una máquina.
