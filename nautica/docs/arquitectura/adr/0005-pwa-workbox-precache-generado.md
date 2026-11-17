# ADR 0005: PWA con Workbox y precarga generada en la *build*

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

La lista de precarga (`sw-lista.js`, 592 líneas) y la versión de `sw.js` se regeneran a mano; si alguien publica sin
hacerlo, nadie recibe la actualización (S-06), y dos ramas chocan siempre ahí (M-02). La precarga baja 23,5 MB de
datos de tres tribunales a todo el mundo (R-02). Lo bueno: la actualización nunca interrumpe un examen.

## Decisión

- `vite-plugin-pwa` 1.x en modo `injectManifest` con Workbox 7: service worker propio en TypeScript y manifiesto de
  precarga inyectado por la *build*. `sw-lista.js` deja de existir.
- Precarga = carcasa completa (todas las rutas). Contenido del banco elegido, a una caché versionada en segundo plano;
  otros bancos, bajo demanda; audio, solo lo que el alumno escucha o descarga, con tope y peticiones por rango.
- Se conserva la actualización que espera al alumno (`prompt`) y nunca se aplica con un examen en curso.
- Interruptor de emergencia (service worker que se desinstala y `Clear-Site-Data`) preparado y ensayado en *staging*.

## Alternativas

- **Mantener el service worker a mano generando la lista en la *build*:** posible, pero reimplementa Workbox.
- **`generateSW`:** no permite la lógica propia de actualización.
- **Precargar también todos los datos:** es el problema actual.

## Consecuencias

- Un E2E cubre «instalar, cortar la red, abrir cualquier pantalla» y «versión nueva con examen a medias».
- Primera instalación ≈ 3 MB gzip en vez de 7,5 MB.
- Un alumno que cambia de tribunal sin conexión no tiene ese banco: se le dice con claridad.
