# Estado: sincronización del progreso entre aparatos (rama feat/sync-progreso)

Diseño completo en [`docs/SYNC.md`](../docs/SYNC.md).

## Hecho

- Registro de operaciones (`src/store/sync/`): operaciones, pliegue puro, fusión, registro local, motor, código y
  configuración. `progress.js` apunta una operación por escritura y deriva `get()` plegando; su API no cambia.
- Migración automática del progreso de antes a una operación «base» (troceada por debajo de 40 KB).
- Servidor `sync-worker/` (Worker + D1): `POST /v1/sync`, `GET /v1/salud`, hash del código con pepper, límites por IP,
  por alumno, intentos fallidos y altas, CORS, validación por operación (el mismo validador que el cliente).
  `wrangler.toml`, `schema.sql`, `migrations/0001_inicial.sql`. Sin desplegar.
- Interfaz: Ajustes → «Mis dispositivos» (código, QR, unir con código, estado, «Copiar diagnóstico»), «Avanzado»
  plegado (copia en archivo y empezar de cero), `#/vincular/<código>`, punto en el engranaje tras 24 h sin sincronizar,
  avisos de copia callados mientras la sincronización esté sana (Hoy, Ajustes, Más).
- QR con `qrcode-generator` 2.0.4 (MIT) vendorizado en `src/vendor/` con su licencia; `jsqr` como dependencia de
  desarrollo para comprobar que se lee.

## Comprobado

- `npm test` en `nautica/` (incluye equivalencia con el almacén antiguo en 200 secuencias, migración, fusión en los
  dos órdenes, red intermitente, servidor caído, respuestas cortadas y troceadas, QR decodificado, rendimiento con
  20 000 operaciones).
- `npm test` en `sync-worker/`: servidor con D1 en `node:sqlite` y el Worker de verdad con `wrangler dev --local`.
- Navegador (Chromium con Playwright, dos y más contextos, Worker local en 4810, app en 4820): migración, código
  creado en silencio, QR pintado en la página decodificado con jsQR y abierto en el otro contexto, «Sí, unir», bases
  fusionadas, estudiar en A sin conexión y en B con conexión, reconectar, convergencia del JSON y de la interfaz
  (opción marcada en la pregunta, «Mi progreso» idéntico), unir un tercero tecleando el código en minúsculas y sin
  guiones, código erróneo, punto de la cabecera, aviso de copia sin sincronización sana y sin él con ella,
  diagnóstico sin datos del alumno, sin scroll horizontal y letra ≥ 12 px a 360 y 990 px en claro y oscuro.
  Capturas en el scratchpad de la sesión (`sync-capturas/`), no en el repo.

## No comprobado

- Despliegue real en Cloudflare (D1 remoto, límites reales de D1 con `json_each` de 256 KB, latencia) y la URL
  `patron-sync.antoniofcano.workers.dev` (depende del subdominio de la cuenta).
- Dispositivos físicos: iPhone/Safari (borrado de datos a los 7 días sin abrir, `navigator.locks`, evento `online`),
  Android real, escaneo del QR con una cámara de verdad.
- Cuota de localStorage al límite (más de ~40 000 operaciones): no hay compactación todavía.
- Dos pestañas reales a la vez en un navegador (sí en test con eventos `storage` simulados).

## Dudas y decisiones tomadas sin brief

- `reset` («Empezar de cero») desune este aparato en vez de borrar el progreso de todos; `import` suma como base.
- Ajustes compartidos: además de la lista del brief, `segTarjeta`, `configProfe`, `podcasts`, `podcastUltimo` y los
  prefijos `examen_`, `guiaVista_`, `planEsencial_`, `mezclado_`, `reserva_` (gana el primero), `chuletasLeidas_`,
  `nivelNo_`. La sesión de hoy (`sesion_*`) y el test de nivel a medias son del aparato.
- Fichas vistas: gana la vista más reciente (como hacía el almacén).
- Código: 11 símbolos al azar + 1 de control; 0/O/1/I/L no existen y se rechazan con un mensaje claro.
- Sana = con código y sincronizada hace menos de 3 días.
- Registros de Cloudflare (`observability`) apagados para que la cabecera con el código no quede registrada.
- `onboarded` se completa al cargar (como antes), no tras cada escritura: un aparato puede no tenerlo en memoria hasta
  recargar; los tests comparan el progreso como lo vería al volver a abrir.
