# ADR 0002: Repositorio propio, monorepo con pnpm, historial nuevo

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

La app vive en una carpeta de un repositorio personal con otros proyectos, pesa 377 MiB por 304 MB de audio, publica
por *push* a una rama y el Worker importa código de la app por ruta relativa (E-11). El dueño ha decidido repositorio
propio con historial nuevo sin audio.

## Decisión

- Repositorio dedicado y **privado**, con `apps/{web,api,worker-legado}`,
  `packages/{contratos,nucleo,laminas,contenido,diseno}`, `e2e/`, `herramientas/`, `infra/` y `docs/`.
- **pnpm 10** con *workspaces*, `catalog:` y `node-linker=isolated`; Node 24 LTS.
- Reglas de dependencia en `.dependency-cruiser.cjs` (falla la CI) y `knip` para lo que sobra.
- Historial nuevo: primer commit = árbol importado de `nautica/` y `sync-worker/` sin `podcast/audio/`, con el *hash*
  del commit de origen anotado. El repositorio antiguo se archiva; no se reescribe su historial.
- Mientras el antiguo siga siendo producción (hasta la congelación), la importación es **un guion repetible**
  (`herramientas/importar-legado.mjs`), no una copia a mano.

## Alternativas

- **`git filter-repo` para conservar el historial sin audio:** conserva 972 commits de valor escaso (el porqué está
  en `docs/`) y arrastra contenido cuyos derechos no están claros.
- **npm o Yarn workspaces:** válidos; pnpm es más estricto con dependencias no declaradas y más rápido en CI.
- **Nx o Turborepo:** caché de tareas innecesaria a este tamaño; se añade si la CI pasa de 10 minutos.
- **Varios repositorios:** el contrato compartido obligaría a publicar paquetes.

## Consecuencias

- Se pierde `git blame` anterior; queda el repositorio archivado.
- Privado implica GitHub Pro para ramas protegidas y aprobaciones (≈ 4 $/mes).
- Entre la creación y la congelación hay dos repositorios: los cambios de producto se hacen en el antiguo y se
  importan; en el nuevo solo se añade (ver el plan, F0).
