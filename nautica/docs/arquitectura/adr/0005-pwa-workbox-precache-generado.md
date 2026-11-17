# ADR 0005: PWA con Workbox y precarga generada en la *build*

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

En v1 la lista de precarga se regenera a mano: si alguien publica sin hacerlo, nadie recibe la actualización (S-06,
M-02), y la precarga baja 23,5 MB de datos de tres tribunales a todo el mundo (R-02). Lo que v1 hace bien: la
actualización nunca interrumpe un examen. El producto nuevo debe ser instalable y funcionar sin conexión.

## Decisión

- `@vite-pwa/sveltekit` 1.x en modo `injectManifest` con Workbox 7: service worker propio en TypeScript y manifiesto
  de precarga generado por la *build*.
- Precarga = carcasa de la app del alumno. Contenido del banco elegido, a una caché versionada en segundo plano; otros
  bancos, bajo demanda; audio, solo lo que el alumno escucha o descarga, con tope y peticiones por rango. El panel del
  profesor y las páginas públicas no se precargan.
- La versión nueva espera al alumno y nunca se aplica con un examen en curso.
- Interruptor de emergencia (service worker que se desinstala y `Clear-Site-Data`) preparado y ensayado en *staging*.

## Alternativas

- **Service worker escrito a mano con la lista generada:** reimplementa Workbox.
- **`generateSW`:** no permite la lógica propia de actualización.
- **Precargar todos los datos:** es el problema de v1.
- **App sin service worker, solo caché HTTP:** no garantiza abrir sin red.

## Consecuencias

- Un E2E cubre «instalar, cortar la red, abrir cualquier pantalla» y «versión nueva con examen a medias».
- Primera instalación ≈ 3 MB gzip (v1: 7,5 MB).
- Un alumno que cambia de tribunal sin conexión no tiene ese banco: se le dice con claridad.
