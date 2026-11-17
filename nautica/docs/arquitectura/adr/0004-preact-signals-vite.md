# ADR 0004: Preact + signals + Vite, a confirmar con la prueba de «Hoy»

- **Estado:** aceptada, pendiente de confirmar con la prueba
- **Fecha:** 17 de noviembre de 2026

## Contexto

Las vistas son cierres gigantes sin ciclo de vida, con 53 variables de módulo como estado y 42 oyentes globales sin
desmontar. No hay empaquetador: 403 peticiones y 1,4 MB gzip en la primera visita. El auxiliar `h('div.clase', attrs,
hijos)` tiene casi la forma de *hyperscript*. La auditoría pidió decidir el framework con una prueba real.

## Decisión

- **Preact 10 con TSX, `@preact/signals` 2 y Vite 7**; rutas por *hash* con `wouter-preact` 3 y carga perezosa por ruta.
- Se confirma con la **prueba de «Hoy»**: Preact frente a Svelte 5 sobre el mismo `modeloHoy` y el mismo E2E (medidas
  y criterio en `ARQUITECTURA-V2.md` §3.1). Se mantiene Preact salvo que Svelte gane por más del 25 % en peso y en
  arranque sin perder en convivencia con las vistas antiguas.
- Estado en un contenedor creado por `crearApp(...)` con dependencias inyectadas; sin singletons de módulo.
- Rutas por *hash*: los enlaces actuales siguen valiendo y el fragmento no llega a registros de servidor.

## Alternativas

- **Svelte 5:** mejor CSS con ámbito y algo menos de código por componente; traducción no mecánica y modelo propio.
- **Solid:** rendimiento excelente; semántica que hace engañosa la traducción desde `h()`; comunidad pequeña.
- **React:** el mismo modelo con diez veces el peso.
- **Lit o sin framework:** no resuelven estado ni ciclo de vida con la misma ergonomía.

## Consecuencias

- El cliente pasa de 0 a 4 dependencias de ejecución (`preact`, `@preact/signals`, `wouter-preact`, `idb`), todas
  pequeñas y auditadas en CI.
- Preact y la vista antigua conviven en el mismo árbol mediante `<VistaAntigua>`.
- Si la prueba da la vuelta a la decisión, cambia este ADR y nada más: núcleo, contratos y API no dependen del framework.
