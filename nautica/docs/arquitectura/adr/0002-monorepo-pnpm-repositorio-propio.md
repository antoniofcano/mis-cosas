# ADR 0002: Repositorio propio, monorepo con pnpm

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

v1 vive en una carpeta de un repositorio personal con otros proyectos, pesa 377 MiB por 304 MB de audio y su servidor
importa código de la app por ruta relativa (E-11). El dueño ha decidido repositorio propio. El producto nuevo se
construye desde cero (ADR 0001).

## Decisión

- Repositorio dedicado y **privado**, con `apps/{web,api}`, `packages/{contratos,nucleo,laminas,contenido,diseno}`,
  `e2e/`, `herramientas/{importar-v1,oraculo,bancos,podcast}`, `infra/` y `docs/`.
- **pnpm 10** con *workspaces*, `catalog:` y `node-linker=isolated`; Node 24 LTS.
- Reglas de dependencia en `.dependency-cruiser.cjs` (falla la CI) y `knip` para lo que sobra.
- Historial nuevo. El audio no entra nunca en git (R2). El código de v1 no se copia al repositorio: lo que se porta
  entra por PR, módulo a módulo, ya tipado y con sus pruebas; las herramientas leen v1 de un clon aparte.

## Alternativas

- **Bifurcar el repositorio de v1:** hereda estructura, historial y peso.
- **npm o Yarn workspaces:** válidos; pnpm es más estricto con dependencias no declaradas y más rápido en CI.
- **Nx o Turborepo:** caché de tareas innecesaria a este tamaño; se añade si la CI pasa de 10 minutos.
- **Varios repositorios** (web, API, contenido): el contrato compartido obligaría a publicar paquetes.

## Consecuencias

- Privado implica GitHub Pro para ramas protegidas y aprobaciones (≈ 4 $/mes).
- El contenido (con derechos sin aclarar) y el código quedan en un repositorio que no es público.
- La frontera entre núcleo, contenido, interfaz y servidor está vigilada por herramienta desde el primer commit.
