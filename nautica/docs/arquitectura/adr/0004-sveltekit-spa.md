# ADR 0004: SvelteKit en modo SPA

- **Estado:** aceptada, a validar en la rebanada vertical (cambia: antes Preact + signals)
- **Fecha:** 17 de noviembre de 2026

## Contexto

En la versión anterior ganaba Preact porque el auxiliar `h()` de v1 se traducía casi mecánicamente y las vistas
antiguas podían convivir con las nuevas. Con desarrollo nuevo (ADR 0001) no hay nada que traducir ni con qué
convivir. Pasa a pesar otra cosa: una sola persona dirige agentes y necesita que la estructura la dé el framework, no
decisiones propias que luego hay que mantener. Además el producto necesita páginas públicas (portada, precios, alta de
centros, privacidad) que se indexen.

## Decisión

- **Svelte 5 con SvelteKit 2**, `adapter-static`: la app del alumno y el panel del profesor como SPA (`ssr = false`);
  las páginas públicas, prerenderizadas.
- Rutas por ficheros con carga perezosa, diseños anidados y límites de error de serie. Estado con *runes* en un
  contenedor creado por `crearApp(...)`; sin singletons de módulo.
- CSS con ámbito por componente sobre los tokens de `@patron/diseno`; primitivas accesibles sin estilo (`bits-ui` 2).
- `svelte-check` y `eslint-plugin-svelte` en CI.
- **Validación:** una rebanada vertical en la primera fase. Se cambia a Preact + Vite si los agentes necesitan más de
  dos rondas de corrección por componente o `svelte-check` no deja el código limpio.

## Alternativas

- **Preact + Vite:** el modelo de React es el que mejor escriben los agentes y pesa poco, pero hay que elegir y montar
  enrutador, estado, carga perezosa y prerenderizado. Es el plan B.
- **React 19:** el ecosistema más grande; ≈ 55 KB de base y las mismas piezas por montar.
- **Solid:** rendimiento excelente, comunidad pequeña.
- **Aplicación con renderizado en servidor:** rompería «la app abre aunque el VPS caiga».

## Consecuencias

- Menos código de fontanería propio; un desarrollador que llegue reconoce la estructura.
- Riesgo: que un agente mezcle sintaxis de Svelte 4; lo caza `svelte-check` y se fija en las instrucciones del repositorio.
- Las láminas siguen siendo SVG generado como texto, insertado por un único componente con *Trusted Types*.
- Si la rebanada da la vuelta a la decisión, cambian `apps/web` y `packages/diseno`; núcleo, contratos, contenido y API no.
