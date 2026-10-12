# Recordatorio diario

Un aviso **opcional**, como mucho uno al día, a la hora que elija el alumno (9:00, 13:00, 18:00 o 21:00), **solo si ese
día aún no ha estudiado**. Texto genérico, sin datos de progreso: «Hoy toca un repaso de 10 minutos». Al tocarlo se
abre la app en Hoy. Es una cosa sencilla y está hecha para gastar lo mínimo: pocas piezas, nada que crezca sin tope,
nada que trabaje cuando no hay nada que hacer.

Donde no se puede avisar (iPhone o iPad sin la app instalada, navegadores sin avisos, o el servidor aún sin
configurar) se ofrece lo mismo como **evento diario en el calendario** (`.ics`), generado en el propio aparato.

## Piezas

| Dónde | Qué |
|---|---|
| `src/store/sync/avisos.js` | Lo que comparten app y servidor: horas, zonas horarias admitidas, validación de la suscripción. |
| `src/store/recordatorio.js` | Lógica del cliente sin DOM: qué se ofrece, activar, cambiar, desactivar, comprobación al abrir, `.ics`. |
| `src/ui/recordatorio.js` | Interfaz: sección «Aviso diario» de Ajustes y tarjeta de Hoy. |
| `sw.js` | Eventos `push` (muestra el aviso) y `notificationclick` (abre Hoy). |
| `src/store/sync/config.js` | `VAPID_PUBLICA`: la clave pública del servidor (vacía hasta desplegar). |
| `sync-worker/src/webpush.js` | Web Push con el WebCrypto del Worker: cifrado RFC 8291 (aes128gcm) y VAPID RFC 8292 (ES256). |
| `sync-worker/src/avisos.js` | La tarea programada (cron) y su lógica pura (hora local, a quién avisar, topes). |
| `sync-worker/src/servidor.js` | `POST /v1/avisos` (alta o cambio) y `POST /v1/avisos/baja`. |
| `sync-worker/migrations/0002_avisos.sql` | Tabla `avisos` y dos índices. Solo añade: no toca lo de `0001`. |
| `sync-worker/scripts/vapid.mjs` | `npm run vapid`: genera el par de claves VAPID. |

Sin dependencias nuevas. El módulo de Web Push son ~150 líneas sobre WebCrypto (lo que ya trae el Worker): una
librería de Web Push para Node arrastra `crypto`/`https` de Node y polyfills, y las «compatibles con Workers» pesan
más que este módulo y no ahorran nada. Está probado contra los vectores de la RFC 8291 (byte a byte) y la firma con
un verificador independiente (`node:crypto`).

## Cómo funciona

### En la app

- **Ajustes → «Aviso diario»** (siempre) y una **tarjeta en Hoy** (tras 2 días con actividad, si no toca la de
  instalar, con «Ahora no» que la calla 30 días): «Avisarme cada día a las…» y cuatro botones de hora. La de las 18:00
  sale marcada como sugerencia.
- El permiso del navegador se pide **solo al tocar una hora** (un gesto del alumno), nunca al abrir la app.
- Estados, en una frase: «Te avisaremos a las 18:00» · «Avisos desactivados» · «Tu navegador no admite avisos» ·
  «Permiso denegado: puedes cambiarlo en los ajustes del navegador». Con el aviso puesto: «Desactivar avisos».
- **Calendario**: en iPhone/iPad sin instalar («En iPhone, los avisos solo llegan con la app instalada» y cómo
  instalarla), sin `PushManager`/`Notification`/service worker, o con el servidor sin clave, las mismas horas
  descargan `recordatorio-patron-18h.ics`: evento diario de 10 minutos con alarma a esa hora, en hora local
  «flotante» (sigue a las 18:00 en verano y en invierno). Se genera con un `Blob`, sin servidor.
- La zona horaria es la del aparato (`Intl…resolvedOptions().timeZone`); si no está en la lista admitida, se usa
  Europe/Madrid y se dice «Hora de la España peninsular».
- Lo guardado en el aparato: `localStorage['nautica.avisos.v1'] = { hora, zona, endpoint, t }` (no se sincroniza:
  cada aparato decide si quiere avisos). «Ahora no» de Hoy: ajuste del aparato `avisoDiarioHasta`.

### Activar, cambiar, desactivar (tráfico del cliente)

| Acción | Peticiones |
|---|---|
| Activar | **1** `POST /v1/avisos` (la primera vez en un aparato recién creado, si el servidor aún no conoce el código: 1 sincronización y otra vez el POST) |
| Cambiar de hora | **1** `POST /v1/avisos` (misma fila: se actualiza por endpoint) |
| Desactivar | **1** `POST /v1/avisos/baja` (y `unsubscribe()` en el navegador; sin red, el servicio de push rechazará los envíos y el servidor la borrará solo) |
| Abrir la app | **0**: se mira en local (permiso, `getSubscription()`, zona). Solo si el navegador cambió la suscripción, la perdió, es de otra clave del servidor, el aparato cambió de zona o la última alta tiene más de 90 días, **1** `POST` (con `anterior` para borrar la vieja) |
| Permiso retirado en el navegador | **0**: se apaga en local; el servicio de push responderá 410 y el servidor la borrará |

Sin sondeos ni temporizadores. Lo de los 90 días es la única renovación «a ciegas»: el servidor borra las
suscripciones que llevan 120 días sin renovarse **y** cuyo alumno no ha estudiado en ese tiempo, así que un aparato que
vuelve tras meses se vuelve a apuntar solo (una petición cada 90 días como mucho, y solo al abrir la app).

### En el servidor: una tarea por hora

`wrangler.toml` → `[triggers] crons = ["0 * * * *"]` (la única tarea). Cada ejecución:

1. Si `PUSH_ACTIVO` es `"0"` o faltan las claves VAPID: termina **sin una sola consulta**.
2. Calcula con `Intl.DateTimeFormat` qué parejas (hora elegible, zona) tocan ahora en las zonas admitidas (los
   formateadores se crean al cargar el módulo). Si ninguna, termina sin consultas.
3. **Una consulta** por el índice `avisos_franja (hora, zona)`, con `LIMIT 100`, que ya descarta las pausadas que no
   han vuelto. Sin filas: termina (es la ejecución típica: **1 consulta**).
4. En memoria, para cada fila: no se avisa si ya se avisó hoy (día local), si el alumno **ya ha estudiado hoy**
   (`alumnos.ultimo`, que ya se actualiza en cada subida con operaciones: nada de escanear `operaciones`), o si está
   pausada (5 avisos seguidos sin estudiar).
5. Lee el contador del día (`limites`, clave `avisos:dia`), envía como mucho 40 (4 a la vez, **un intento** cada uno,
   sin reintentos), y escribe todo en **un batch**: la fila de cada avisado (`aviso`, `dia`, `seguidos`), el borrado de
   las que el servicio de push rechaza con 404/410 y el contador.
6. A las 3:00 UTC, ese mismo batch borra las ventanas pasadas de `limites` y las suscripciones caducadas.

El mensaje es `{"v":1}` cifrado (aes128gcm, ~110 bytes), con `TTL: 14400` (si el móvil está apagado más de 4 h, el de
hoy ya no llega), `Urgency: normal` y `Topic: recordatorio` (uno sin entregar se sustituye por el siguiente). El texto,
el icono y la etiqueta `recordatorio-diario` (el de hoy sustituye al de ayer: no se apilan) están en `sw.js`. VAPID:
JWT ES256 con `aud` = origen del servicio de push, `exp` = 12 h y `sub` = `https://antoniofcano.github.io/mis-cosas/nautica/`
(sin correo); un JWT por servicio de push y ejecución.

**Pausa**: `seguidos` cuenta los avisos enviados sin que el alumno haya estudiado desde el anterior; a los 5 no se
avisa más. En cuanto el alumno vuelve a estudiar (cualquier subida con operaciones, desde cualquier aparato:
`alumnos.ultimo > avisos.aviso`), vuelve a contar desde cero. Cambiar de hora o volver a activarlo también reanuda.

### API

`POST /v1/avisos` con `Authorization: Bearer <código>` y `{ v: 1, sus: { endpoint, keys: { p256dh, auth } }, zona, hora, anterior? }`
→ `{ ok: true, hora, zona }`. `POST /v1/avisos/baja` con `{ v: 1, endpoint }` → `{ ok: true, borradas }` (sin código:
el endpoint es una URL secreta y al azar del servicio de push).

Errores (JSON `{ error, motivo }`): `400 json|esquema|hora|zona|suscripcion`, `401 codigo-invalido`,
`404 codigo-desconocido`, `409 tope-avisos`, `413 demasiado-grande`, `429 limite`, `503 avisos-apagados|avisos-sin-configurar`.
Mismo CORS y mismos límites por IP y por alumno que `/v1/sync` (docs/SYNC.md).

### Tabla `avisos`

`avisos(id, alumno → alumnos.id, endpoint UNIQUE, p256dh, auth, zona, hora, renovado, aviso, dia, seguidos)` con los
índices `avisos_franja (hora, zona)` (el cron) y `avisos_alumno (alumno)` (el tope por alumno). Sin datos del alumno:
solo la suscripción (que no identifica a nadie fuera del servicio de push), su zona y su hora.

## Topes e interruptor

| Tope | Valor | Dónde |
|---|---|---|
| Suscripciones por alumno | 3 (al pasar, se sustituye la más antigua) | `LIMITES_AVISOS.porAlumno` |
| Suscripciones en total | 500 (al pasar, `409 tope-avisos`) | `LIMITES_AVISOS.total` |
| Filas que lee una ejecución | 100 | `LIMITES_AVISOS.filasPorEjecucion` |
| Envíos por ejecución | 40 (por debajo de las 50 subpeticiones del plan gratuito) | `LIMITES_AVISOS.enviosPorEjecucion` |
| Envíos por día | 400 (contador en D1) | `LIMITES_AVISOS.enviosPorDia` |
| Envíos por suscripción y día | 1 (columna `dia`) | `decidir()` |
| Avisos seguidos sin estudiar | 5, luego pausa | `LIMITES_AVISOS.pausaTras` |
| Cuerpo de alta o baja | 2 KB | `LIMITES_AVISOS.cuerpoBytes` (413) |
| Endpoint | `https:` sin puerto, ≤ 1024 caracteres, de `fcm.googleapis.com`, `updates.push.services.mozilla.com`, `web.push.apple.com` o `*.notify.windows.com` | `validarSuscripcion()` |
| Claves | `p256dh` 87 caracteres base64url (65 bytes, punto de la curva P-256 comprobado con WebCrypto), `auth` 22 (16 bytes) | `validarSuscripcion()` + `importarPublicaEcdh()` |
| Zonas | 26 zonas IANA (España, Portugal, Europa occidental y central, Marruecos e Hispanoamérica), todas de horas enteras | `ZONAS` |
| Peticiones | Las de `/v1/sync`: 120 por IP y minuto, 60 por alumno y minuto, bloqueo por códigos falsos | `LIMITES` |
| Caducidad | Sin renovar en 120 días y sin actividad del alumno en 120 días: se borra | `LIMITES_AVISOS.caducaDias` |

**Interruptor de emergencia**: `PUSH_ACTIVO = "0"` (en `wrangler.toml` → `[vars]` y `npx wrangler deploy`, o en el
panel de Cloudflare → Workers → patron-sync → Settings → Variables). Con él apagado no se envía nada, el cron no hace
ni una consulta y las altas reciben `503` con «Los avisos diarios están desactivados por ahora. Prueba más adelante.»
(la app lo enseña tal cual). Las bajas siguen funcionando. Para encenderlo: `"1"`.

## Presupuesto de recursos

Supuesto: hoy 2 alumnos; diseño pensado para decenas (N = 50 aparatos con aviso, el peor caso es que todos elijan la
misma hora y ninguno estudie). Plan gratuito de Cloudflare: 100 000 peticiones al día, 10 ms de CPU por invocación,
50 subpeticiones por invocación; D1: 5 millones de filas leídas y 100 000 escritas al día, 50 consultas por invocación.

| Recurso | Ejecución sin nada que hacer | Ejecución con avisos (N a la vez) | Al día (N = 50) | Plan gratuito |
|---|---|---|---|---|
| Invocaciones del Worker (cron) | 1 | 1 | 24 | 100 000 |
| Consultas D1 (idas y vueltas) | 1 (0 si ninguna zona está a una hora elegible o con el interruptor apagado) | 3: selección, contador, batch | ≤ 24 + 2 × 4 = 32 | 50 por invocación |
| Sentencias D1 | 1 | ≤ 5 (selección, contador, actualizar, borrar, contador) + 2 la de las 3:00 UTC | ≤ 45 | — |
| Filas leídas | las de la franja (por índice) | ≤ 100 + sus alumnos (clave primaria) | ≤ 2 × N ≈ 100 (más índices) | 5 000 000 |
| Filas escritas | 0 | N + 1 (más los índices) | ≤ 55 | 100 000 |
| Subpeticiones (envíos) | 0 | ≤ 40 | ≤ N | 50 por invocación |
| CPU | Intl con caché: ~0,15 ms (los formateadores se crean al cargar el Worker) | + ~1 ms por envío (cifrado: medido en Node; en workerd, nativo) | — | 10 ms por invocación |
| Filas guardadas | — | — | ≤ 500 en `avisos` (tope duro) + 1 contador | 5 GB |
| Peticiones del cliente | 0 al abrir | 1 al activar, 1 al cambiar, 1 al desactivar | ≈ 0 | — |
| Tamaño del aviso | — | ~110 bytes cifrados | — | 4 KB |

**CPU, lo único justo**: el cifrado cuesta ~1 ms por aviso en Node; en el Worker es WebCrypto nativo, pero con muchos
avisos a la misma hora una ejecución podría pasar de los 10 ms del plan gratuito. Si pasa, esa ejecución se corta (no se
cobra nada; esos avisos de ese día se pierden). Con decenas de alumnos repartidos en cuatro horas no debería ocurrir;
compruébalo en el panel (Workers → patron-sync → Metrics, «CPU time») tras las primeras horas de avisos y, si hiciera falta, baja
`enviosPorEjecucion` (p. ej. a 8) en `src/avisos.js`.

## Despliegue (lo hace el dueño, a mano)

Nada de esto se ha desplegado. Orden recomendado (la migración antes que el Worker que la usa):

```sh
cd sync-worker
npm ci
npx wrangler login                                   # si no lo estabas

# 1. La tabla nueva (solo añade; lo de 0001 no cambia)
npx wrangler d1 migrations apply patron-sync --remote

# 2. Las claves VAPID: la privada va DIRECTA a Cloudflare (no sale por pantalla ni toca ningún archivo) y la pública
#    se escribe en wrangler.toml (VAPID_PUBLIC) y en ../nautica/src/store/sync/config.js (VAPID_PUBLICA)
npm run vapid --silent -- --escribir | npx wrangler secret put VAPID_PRIVATE

# 3. El Worker con el cron (wrangler.toml ya trae [triggers] y PUSH_ACTIVO = "1")
npx wrangler deploy

# 4. Comprobaciones
curl https://patron-sync.antoniofcano.workers.dev/v1/salud        # → {"ok":true,"version":"1.1.0"}
npx wrangler secret list                                           # → PEPPER y VAPID_PRIVATE
npx wrangler d1 execute patron-sync --remote --command "SELECT COUNT(*) FROM avisos"
```

Después, la app: `cd ../nautica && npm run precache && npm test`, commit de `wrangler.toml`, `config.js` y
`sw-lista.js` (la clave pública no es secreta) y publicar. Hasta que la app publicada lleve la clave, ofrece solo el
calendario (el servidor tampoco admite altas sin la privada).

- En el panel de Cloudflare → Workers → patron-sync → Triggers debe aparecer la tarea `0 * * * *`.
- Primer aviso de verdad: activa el aviso en tu móvil a la próxima hora elegible, no estudies ese día, y a esa hora
  `npx wrangler tail` debe mostrar una línea `avisos {"consultas":3,…,"enviados":1,…}`.
- **Apagar en caso de apuro**: `PUSH_ACTIVO = "0"` en `wrangler.toml` y `npx wrangler deploy` (o en el panel, que dura
  hasta el siguiente despliegue). Quitar la tarea del todo: borrar `[triggers]` y desplegar.
- **Cambiar las claves** (si se pierde o se filtra la privada): repetir el paso 2 y desplegar Worker y app. Los aparatos
  con el aviso activado lo detectan al abrir la app (la clave de su suscripción ya no coincide) y se vuelven a apuntar
  solos con la nueva; los que no abran la app dejan de recibirlo y caducan a los 120 días.
- Probar en local sin tocar Cloudflare: `npx wrangler d1 migrations apply patron-sync --local` y
  `npx wrangler dev --local --port 4810 --test-scheduled --var PEPPER:… --var VAPID_PUBLIC:… --var VAPID_PRIVATE:…`
  (claves de `npm run vapid`, nunca las de producción); la tarea se lanza con
  `curl "http://127.0.0.1:4810/__scheduled?cron=0+*+*+*+*"`; en el navegador,
  `localStorage.setItem('nautica.sync.url', 'http://127.0.0.1:4810')` y
  `localStorage.setItem('nautica.avisos.vapid', '<pública de prueba>')`.

## Pruebas

- `sync-worker/tests/webpush.test.js`: cifrado contra la RFC 8291 (sección 5 y todos los valores intermedios del
  apéndice A, byte a byte; la RFC dice `Content-Length: 145` pero su propio cuerpo mide 144), descifrado del lado del
  navegador, sal y clave nuevas por mensaje, JWT de VAPID validado con `node:crypto` (y rechazado con otra clave o
  alterado), `npm run vapid`, cabeceras del envío y un solo intento.
- `sync-worker/tests/avisos.test.js` (D1 en memoria, reloj y servicio de push simulados): hora local por zona con los
  cambios de hora de marzo y octubre, hemisferio sur y sin horario de verano; parejas por hora UTC; a quién se avisa
  (ya estudió hoy, ya avisado hoy, pausado tras 5, se reanuda al volver, alumno sin actividad); validación de
  suscripciones; alta, cambio, `anterior`, baja; topes (3 por alumno, total, por ejecución, por día, filas); interruptor
  (0 consultas); 404/410 borran; un intento sin reintentos; limpieza; y **cuántas consultas** hace cada ejecución (un día
  entero sin coincidencias: 1 por hora, 0 si ninguna zona está a una hora elegible; con un aviso: 3 idas y vueltas).
- `sync-worker/tests/integracion.test.js`: en workerd con D1 local, alta (con el WebCrypto de workerd), punto fuera de
  la curva, la tarea programada (`--test-scheduled`) y la baja.
- `nautica/tests/recordatorio.test.js` (APIs simuladas): qué se ofrece en cada aparato, permiso concedido, denegado o
  sin contestar, sin `PushManager`, iPhone sin instalar, código aún desconocido, interruptor, sin red, número de
  peticiones de cada acción (0 al abrir si nada cambió), `.ics`, tarjeta de Hoy y el `sw.js` ejecutado en una caja
  (texto, icono, etiqueta y abrir Hoy).

**Lo que no se puede comprobar sin un móvil de verdad** (lista para el dueño):

1. Android + Chrome: activar a la próxima hora en punto, no estudiar, cerrar la app; llega «Patrón · Hoy toca un
   repaso de 10 minutos» con el icono; al tocarlo se abre la app en Hoy. Al día siguiente, estudiar antes de la hora:
   no llega.
2. iPhone (iOS 16.4 o posterior) con la app **instalada** desde Safari: el permiso se pide al tocar la hora, llega el
   aviso y el toque abre Hoy. Sin instalar: sale el calendario; abrir el `.ics` y comprobar que Calendario ofrece
   «Añadir» y que el evento se repite cada día a esa hora con alarma.
3. Firefox de escritorio o Android y Edge (servicio de Microsoft): llega el aviso.
4. Dos avisos sin abrir: solo se ve uno (etiqueta `recordatorio-diario`).
5. Desactivar: no vuelve a llegar; en D1 la fila ya no está.
6. Quitar el permiso en los ajustes del navegador: al abrir la app dice «Permiso denegado: …» (o «Avisos
   desactivados» si se dejó en «preguntar») y en D1 la fila desaparece tras el siguiente intento de envío (410).
7. Panel de Cloudflare → Workers → patron-sync → Metrics a la hora de los avisos: tiempo de CPU por invocación por
   debajo de 10 ms y sin errores.
