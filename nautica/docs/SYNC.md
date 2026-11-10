# Sincronización del progreso entre aparatos

El progreso de un alumno (respuestas, clases, minutos, travesía…) se copia solo entre sus aparatos —móvil, tableta,
ordenador— sin que tenga que exportar, importar, guardar ni pulsar nada. Sin conexión, o con el servidor caído, la app
funciona exactamente igual en local y sube lo pendiente después. Los datos no son sensibles (aciertos de test), pero
se tratan con cuidado: el servidor no guarda el código del alumno, ni su IP, ni nada que lo identifique.

Piezas (pocas, a propósito):

| Dónde | Qué |
|---|---|
| `src/store/progress.js` | El almacén de siempre (misma API). Cada escritura apunta una **operación** y el progreso sale de **plegarlas**. |
| `src/store/sync/operaciones.js` | Tipos de operación, validación (la misma en el cliente y en el Worker), ids y la lista blanca de ajustes compartidos. |
| `src/store/sync/plegar.js` | `plegar(operaciones, local) → progreso`: función pura y determinista. |
| `src/store/sync/fusion.js` | Unión de operaciones por id, separar lo compartido de lo del aparato y trocear una base. |
| `src/store/sync/registro.js` | El registro local (`nautica.sync.v1`): operaciones, pendientes, cursor, código, pestañas. |
| `src/store/sync/motor.js` | Cola, cursor, reintentos con espera creciente y disparadores. Sin DOM. |
| `src/store/sync/codigo.js` | Código del alumno: generar, normalizar, validar. |
| `src/store/sync/config.js` | URL del servidor y tiempos. |
| `src/ui/sync.js`, `src/ui/dispositivos.js`, `src/ui/views/vincular.js`, `src/ui/qr.js` | Interfaz: Ajustes → «Mis dispositivos», `#/vincular/<código>`, punto de la cabecera. |
| `sync-worker/` (fuera de `nautica/`) | El servidor: Cloudflare Worker + D1. No entra en la precarga ni en Pages. |

El mismo Worker lleva también el **recordatorio diario** opcional por push (rutas `/v1/avisos`, una tarea programada
por hora y la tabla `avisos`): ver [`AVISOS.md`](AVISOS.md).

## Modelo: registro de operaciones y pliegue

Antes, el progreso era un JSON único que se sobrescribía. Con dos aparatos eso no se puede fusionar: `exams[pregunta]`
es un resumen (`n` veces, `ok1` acertó a la primera, `rep` repaso espaciado) y con «gana el último» se pierden
intentos y `ok1` no se puede recuperar. Ahora cada escritura es un **evento** pequeño con id único que se guarda, se
sube y se recibe; el progreso de siempre se **deriva** plegando todos los eventos en orden.

Operación: `{ i: id, k: tipo, t: instante (ms), …campos }`. Id: `<aparato>.<contador base 36>.<azar>` (el aparato es
un id al azar de 10 símbolos; el contador nunca se repite en un aparato; el azar evita choques entre pestañas).

| Tipo | Escritura del almacén | Campos | Cómo se pliega |
|---|---|---|---|
| `r` | `recordExam` | `q` pregunta, `c` opción o null, `o` acierto, `d` día local, `n` test de nivel | Como siempre: `n+1`, `ok1` de la primera, `rep` con `siguienteRepaso`/`repasoDe` usando el **día guardado en el evento** (determinista). Una respuesta más antigua que la guardada suma su vez pero no cambia la última opción. |
| `e` | `recordAttempt` | `y` tipo, `o`, `s` semilla, `m` errores | Contadores derivados de los intentos (attempts, correct, streak, mistakes, history de 30). |
| `a` | `logActividad` | `d` día, `m` minutos | Cada aparato suma lo suyo; el pliegue suma los de todos y guarda 60 días. |
| `v` | `saveLeccion`, `recordNivel`, `setPlanEstudio`, `recordFichaVista`, `recordRepasoConcepto`, `setSetting` (compartidos) | `c` colección, `p` ruta, `v` valor | Gana el más reciente (instante y, si empatan, id). Excepción: `reserva_*` (la reserva del examen final) gana el **primero**, porque se fija una vez y no debe cambiar. Fichas vistas: gana la vista más reciente (lo mismo que hacía el almacén al volver a abrirla). |
| `v` (clave `corr.<pregunta>` de `settings`) | `corregirTema`, `quitarCorreccion` | `c: 'settings'`, `p: ['corr.<id de la pregunta>']`, `v: { ut, clase?, de?, t }` (sin `v` = deshacer) | Gana la más reciente por pregunta; se pliega en `correcciones[<id>]`, no en los ajustes. Ver «Correcciones de tema». |
| `g` | `guardarTravesia`, `ganarInsignia` | `b` banco, `r` rango, `s` insignias | Rango: el máximo alcanzado (nunca baja). Insignias: unión, con la fecha más antigua de cada una (las `bloque:*` de los faros antiguos se conservan junto a las `tema:*`: docs/TRAVESIA.md). |
| `x` | `recordTest` | `e` el test | Unión por id; los últimos 50. |
| `b` | migración e `import` | `g` grupo, `c` trozo, `h` instante de los datos, `p` trozo del progreso | Ver «Bases». |

Orden total: instante, aparato, contador (numérico) y azar. Antes de plegar se quitan duplicados por id. Así el
resultado es el mismo en cualquier aparato, con cualquier orden de llegada y aunque algo llegue dos veces.

`plegar()` devuelve **exactamente** la forma de `progress.get()` de antes (los tests de equivalencia comparan con una
copia literal del almacén antiguo, `tests/fixtures/progress-antiguo.js`, con 200 secuencias de escrituras al azar).
Al escribir, el almacén aplica la operación sobre el estado ya plegado (no vuelve a plegar todo) si va detrás de la
última; si no (otro aparato, otra pestaña, un reloj que retrocede), vuelve a plegar entero.

**No se sincroniza** (se queda en el aparato, en `local` del registro): el examen a medias (`testEnCurso`), los ajustes
del aparato y la carta escaneada (IndexedDB `user-chart.js`, que nunca sale del aparato por los derechos del IHM).

### Tiempo por pregunta (R-42, «Tu velocidad en carta»)

- **Exámenes** (simulacro, módulo, convocatoria real, examen final): el registro del test (`recordTest`, operación `x`)
  lleva un campo nuevo y opcional `tq: [[id, segundos, acierto 1|0, tipo], …]` (`tiemposDelTest` en
  `src/course/velocidad.js`): el tiempo que cada pregunta estuvo en pantalla, contado con el mismo criterio que el reloj
  del examen (solo con la pestaña visible), con tope de 30 minutos y sin las de menos de 1 s. `tipo` es el `ejercicio`
  de la solución programada (`src/bancos/soluciones.js`), `carta` o `teoria`. **El servidor no cambia:** el validador
  desplegado (el de `origin/main`, idéntico al de esta rama) solo exige que `e` sea un objeto y que la operación no pase
  de `MAX_OP` (64 KiB); un examen de 45 preguntas con ids largos ocupa unos 3,7 KB (`tests/velocidad.test.js`). Un
  registro antiguo sin `tq` se lee igual (no tiene tiempos). El examen a medias guarda lo que lleva en
  `testEnCurso.tiempos` (ms por id; del aparato, como todo el examen a medias).
- **Ensayo en papel** (R-41): también es un `x`, con `tipo: 'ensayo'`, `parte`, `aptoParte` y, si se hizo con el
  cuadernillo impreso, `impreso: true` (todo dentro de `e`, que el servidor no mira). No lleva `tq`: se resuelve en
  papel.
- **Práctica** (preguntas de carta de las tandas y ejercicios de carta): **no se sincroniza**. Las operaciones `r` y `e`
  tienen sus campos cerrados (el validador rechaza uno nuevo con `campos`) y la colección de `v` es una lista cerrada,
  así que no hay sitio sin cambiar el servidor. Se guarda en el aparato, como los errores del alumno: `localStorage`
  `nautica.tiempos.v1` (`src/store/tiempos.js`: `{ t, y tipo, s segundos, o acierto, q }`, 400 anotaciones, 180 días,
  una vez por pregunta y día). No va al progreso, ni a la sincronización, ni a la copia de seguridad. «Tu velocidad en
  carta» junta las dos fuentes; en otro aparato solo se ven los tiempos de los exámenes.

### Correcciones de tema («¿No es de este tema?»)

El alumno puede cambiar el tema (y, si quiere, la clase) en que cuenta una pregunta en su estudio
([`BANCOS.md`](BANCOS.md), «Correcciones del alumno»). Es un dato suyo y viaja con su progreso:

- **En el progreso plegado**: `correcciones = { [idPregunta]: { ut, clase?, de?, t } }` (`ut`: tema elegido; `clase`: id
  de la clase elegida; `de`: el tema que tenía en el banco al corregirla; `t`: cuándo). El campo no existe hasta que hay
  alguna. API del almacén: `correcciones()`, `correccionDe(id)`, `corregirTema(id, { ut, clase, de })`,
  `quitarCorreccion(id)`.
- **En el registro**: no es un tipo de operación nuevo ni una colección nueva. Es un valor con nombre (`v`) de la
  colección `settings` cuya clave empieza por `corr.` (`PREFIJO_CORRECCION`, `claveCorreccion(id)` en `operaciones.js`).
  Deshacer es la misma clave sin valor. El pliegue (`ponerKV` en `plegar.js`) desvía esas claves a `correcciones` y
  nunca las deja en `settings`; un valor que no cumple `correccionValida` se trata como «deshacer».
- **Fusión**: un registro por pregunta en el que gana el último (instante y, si empatan, id), llegue en el orden que
  llegue. Dos aparatos que corrigen la misma pregunta sin conexión acaban con la corrección más reciente; deshacer es una
  operación más (gana si es la última y la pisa una corrección posterior). Las correcciones que vienen dentro de una
  base (una copia recuperada, la migración) compiten con las demás por la fecha de los datos de esa base.
- **Por qué así y no una colección `correcciones`**: el Worker valida cada operación con `validarOperacion`, que se
  empaqueta con él **al desplegarlo**. Una colección o un tipo nuevos los rechazaría el Worker ya desplegado
  (`coleccion`) y una operación rechazada no se reintenta: las correcciones hechas antes de redesplegar no se
  sincronizarían nunca. Con una clave de `settings` el servidor de hoy las acepta sin tocarlo ni redesplegarlo (está
  comprobado contra la validación anterior a este cambio y de punta a punta con el Worker en
  `tests/correcciones-tema.test.js`). Al redesplegar el Worker, además, valida la forma del valor (motivo `correccion`).
- **Una app sin actualizar** que reciba estas operaciones las guarda como un ajuste desconocido `corr.<id>` (no lo usa
  nada) y sigue funcionando; al actualizarse, vuelve a plegar el registro y pasan a `correcciones`.
- **Tamaño**: unos 150 bytes por corrección.

### Ajustes compartidos (lista blanca)

`level`, `toleranceFactor`, `minutosDia`, `diasEstudio`, `eje`, `onboarded`, `segTarjeta` (ritmo de lectura del
alumno), `configProfe`, `podcasts` y `podcastUltimo` (por dónde va en la radio), y los que empiezan por `examen_`,
`examenOrientativo_`, `guiaVista_`, `planEsencial_`, `mezclado_`, `reserva_`, `chuletasLeidas_`, `nivelNo_`,
`convocatoria_`, `listadia_` (tu convocatoria y la lista del día del examen), `semana_` (el modo «la semana antes»: activado a mano, salido, días hechos y cómo fue el examen; y, antes y después del examen real, la foto de la predicción, el resultado por materia y el módulo pendiente descartado; `src/course/semana.js`, `src/course/tras-examen.js`).
Es una clave más de `settings`: el Worker desplegado la acepta sin tocarlo.

También `convocatoria_<tit>` (`{ para, hora, sede, enlace, admitidos }`: hora `HH:MM`, sede texto ≤ 120, enlace http(s) ≤ 300, día en que marcó la lista de admitidos) y `listadia_<tit>` (`{ para, marcadas: [id…] }`: casillas de la lista del día del examen), R-44. `para` es la fecha del examen para la que se guardó: si la fecha cambia cuando esa ya pasó, hora, sede, admitidos y casillas se ignoran (el enlace se conserva); si cambia antes del examen, se conservan. Dos claves y no una para que marcar una casilla en un aparato y editar la hora en otro no se pisen. Comprobado contra `validarOperacion` de `origin/main` (el desplegado): colección `settings` con clave `[\w\-./:]{1,120}` y cualquier valor ≤ 64 KB, aceptadas; sin tocar el Worker.

Del aparato (no viajan): letra, sonidos, vibración, voz (`voz`, `vozAuto`, `vozNombre`, `vozVelocidad`),
`podcastPreguntas`, avisos descartados (`avisoCopiaHasta`, `avisoInstalarHasta`, `avisoCartaVisto`), `ultimaCopia`,
`persistente`/`persistenteIntento`, `capa` de la carta, la sesión de hoy (`sesion_*`), el test de nivel a medias
(`nivelEnCurso_*`), el borrador del modo profesor y cualquier ajuste que no esté en la lista.

## Bases y migración automática

Al primer arranque de esta versión (no hay `nautica.sync.v1`), el progreso guardado en `nautica.progress.v1` se separa
en lo compartido y lo del aparato, y lo compartido se convierte en una **base**: una o varias operaciones `b` (trozos
de menos de 40 KB; una base grande se trocea por preguntas) con el id de este aparato. `progress.get()` no cambia
(test). Un progreso de versión antigua (sin campos nuevos) carga igual que antes; uno corrupto empieza de cero, como
antes. No se vuelve a migrar; y si por lo que sea se migra dos veces, no se duplica nada (ver abajo: máximos).

Dos aparatos con historial propio que se unen traen cada uno su base. Se unen así:

- por pregunta: `n` = el **máximo**, la última respuesta (opción, acierto, hora, repaso) = la más reciente y `ok1` = la
  del registro **más antiguo**;
- ejercicios: `attempts`, `correct` y cada error típico por máximo; racha y última vez del más reciente; historia unida;
- minutos por día: el máximo de cada (aparato, día), sumado entre aparatos;
- travesía: rango máximo, insignias unidas con la fecha más antigua; tests: unión;
- lo demás (clases, niveles, planes, fichas, repaso por concepto, ajustes): el de la base con datos más recientes
  (`h`, el instante más reciente que se ve dentro de la base).

**Puede quedarse corto, nunca largo**: si dos aparatos respondieron la misma pregunta antes de unirse, cuenta las veces
del que más (no la suma); lo que se responda después de unirse sí se suma exacto.

`import` (Ajustes → Avanzado → «Recuperar una copia») **suma** la copia como una base más (no sustituye) y toma de la
copia los ajustes del aparato. `reset` («Empezar de cero en este aparato») borra el registro de **este** aparato y lo
desune (sin código: se creará otro en la próxima subida); los otros aparatos y el servidor conservan lo suyo, así un
toque equivocado no borra el progreso de todos. `export` sigue igual (el progreso plegado en JSON).

## Registro local

`nautica.sync.v1` = `{ v: 1, epoca, dev, n, ops, pend, cursor, codigo, creador, local }` (ver `registro.js`).
`nautica.progress.v1` sigue guardando el progreso plegado tras cada escritura (lo que había siempre). El diagnóstico va
aparte (`nautica.sync.diag.v1`: estado, último éxito, fallos y últimos errores, sin datos del alumno).

Pestañas: cada escritura de otra pestaña llega por el evento `storage`; se **une** por id con lo que hay en memoria y,
si a la otra le faltaba algo, se vuelve a guardar. El contador se toma como el máximo de las dos y el id lleva azar:
dos pestañas no pisan ni duplican operaciones (test). `navigator.locks` evita que dos pestañas sincronicen a la vez.

Tamaño: unas 100 bytes por respuesta. 20 000 operaciones ocupan ~2 MB y se pliegan en ~60 ms en un ordenador
(test de rendimiento). El navegador da unos 5 MB por origen (compartidos con lo demás de `antoniofcano.github.io`).
Si un día no cabe, el registro sigue en memoria y en el servidor, y el diagnóstico dice «almacenamiento: error»; la
solución futura es compactar (sustituir lo ya subido por una base), que aún no está hecha.

## API del servidor

Base: `https://patron-sync.antoniofcano.workers.dev` (`src/store/sync/config.js`; para pruebas,
`localStorage['nautica.sync.url']` en el propio navegador).

**En local no se sincroniza.** Con la app servida desde `localhost` o `127.0.0.1` (desarrollo y pruebas automáticas con
Playwright), `urlServidor()` devuelve `null` salvo que se ponga `nautica.sync.url` a mano: el motor no crea código ni
hace peticiones (estado `sin-servidor`) y el recordatorio no se suscribe. Motivo: las pruebas con progreso inventado
daban de alta alumnos de prueba en el servidor real (noviembre de 2026). Para probar la sincronización, `wrangler dev`
y `nautica.sync.url` apuntando a él.

`POST /v1/sync` con `Authorization: Bearer <código normalizado>` y cuerpo `{ v: 1, cursor, ops: [...], crear? }`.
Inserta las operaciones ignorando duplicados y, en la misma ida y vuelta, devuelve las que el aparato no tiene:

```json
{ "v": 1, "cursor": 1234, "ops": [ ... ], "mas": false, "aceptadas": 3, "duplicadas": 0, "rechazadas": [], "total": 1234 }
```

- `cursor`: número de orden (`seq`) hasta el que se ha devuelto. El aparato lo guarda junto con lo recibido.
- `ops`: las de `seq > cursor`, menos las que acaba de mandar (el cursor sí avanza por encima de ellas).
- `mas`: quedan más (respuesta troceada); el motor sigue pidiendo.
- `rechazadas`: `[{ i, motivo }]` de las que no pasan la validación (se quedan en el aparato y no se reintentan).

`GET /v1/salud` → `{ ok, version }` (comprueba la base de datos).

`POST /v1/avisos` y `POST /v1/avisos/baja`: el recordatorio diario (ver [`AVISOS.md`](AVISOS.md)).

Errores (JSON `{ error, motivo }`): `400 json|esquema`, `401 codigo-invalido`, `403 origen`, `404 codigo-desconocido`
(el código no existe y no se pidió crear), `405`, `409 tope`, `413 demasiado-grande` (el motor parte el lote a la
mitad), `429 limite` (con `Retry-After`), `500 configuracion|servidor`.

El servidor es tonto a propósito: no fusiona, guarda y reenvía. La fusión es el pliegue de cada aparato.

### Esquema D1

`sync-worker/schema.sql` (igual a las migraciones de `sync-worker/migrations/` aplicadas en orden; un test lo comprueba):

- `alumnos(id, hash UNIQUE, creado, ultimo, seq)`: un alumno = el hash de su código; `seq` = última operación (sin
  huecos, así que también es cuántas tiene).
- `operaciones(alumno, seq, op_id, tipo, instante, json, recibido)`, clave `(alumno, seq)` y única `(alumno, op_id)`.
- `limites(clave, ventana, n)`: contadores de peticiones (y el de avisos enviados en el día, `avisos:dia`).
- `avisos(…)`: una fila por aparato con el recordatorio diario activado (migración `0002_avisos.sql`, ver
  [`AVISOS.md`](AVISOS.md)).

Un lote entra con **un solo INSERT** (`json_each` + `row_number()`, saltando los ids que ya están) dentro de un
`batch` (transacción) con la actualización de `seq`: unas 7 consultas por petición aunque el lote sea de 500.

## Límites

| Límite | Valor | Dónde |
|---|---|---|
| Cuerpo de una petición | 256 KB | `LIMITES.cuerpoBytes` (413) |
| Operaciones por lote | 500 | `LIMITES.opsPorLote` (413) |
| Tamaño de una operación | 64 KB | `MAX_OP` (se rechaza esa operación) |
| Operaciones por alumno | 100 000 | `LIMITES.opsPorAlumno` (409) |
| Respuesta | 1 000 operaciones o 2 MB, con `mas: true` | `LIMITES.respuestaOps`, `respuestaBytes` |
| Peticiones por IP | 120 por minuto | `LIMITES.porIpMinuto` (429) |
| Peticiones por alumno | 60 por minuto | `LIMITES.porAlumnoMinuto` (429) |
| Códigos inexistentes o mal formados | 20 por IP y hora; después, esa IP bloqueada una hora | `LIMITES.fallosIpHora` (429) |
| Alumnos nuevos | 20 por IP y día | `LIMITES.altasIpDia` (429) |
| Instantes | desde 2024-01-01 hasta 2 días en el futuro | `T_MIN`, `MARGEN_FUTURO` |

Los contadores van en la tabla `limites` de D1 (ventanas fijas de minuto, hora o día; la clave lleva el hash de la IP
o el id del alumno). Es sencillo y suficiente para dos alumnos; no es un limitador distribuido exacto (D1 serializa
las escrituras, así que no se pierden cuentas). Las ventanas pasadas se borran de vez en cuando (2 % de peticiones) y,
con los avisos encendidos, también una vez al día en la tarea programada.
Si hiciera falta más, Cloudflare tiene reglas de limitación en el panel, sin tocar el código.

En el cliente: lotes de 500 o 200 KB; espera creciente tras cada fallo (15 s, 30 s, 1 min… hasta 30 min, con algo de
azar); al recibir `Retry-After`, se espera eso.

## Seguridad

- **Código del alumno**: 12 símbolos de un alfabeto de 31 sin ambigüedades (`23456789ABCDEFGHJKMNPQRSTUVWXYZ`: sin
  0, O, 1, I ni L), formato `K7QM-4TXD-92HB`, generado con `crypto.getRandomValues`. Los 11 primeros son al azar
  (31¹¹ ≈ 2,5·10¹⁶ códigos) y el último es de control (detecta cualquier símbolo cambiado y dos vecinos traspuestos
  antes de preguntar al servidor). Se normaliza (mayúsculas, sin espacios ni guiones). Un código con 0, O, 1, I o L se
  rechaza con un motivo claro en vez de adivinar.
- El servidor guarda solo `SHA-256("patron-sync:v1:" + PEPPER + ":" + código)`; `PEPPER` es un secreto del Worker
  (`wrangler secret put PEPPER`, al menos 16 caracteres; sin él, el Worker no sincroniza). Ni el código ni la IP se
  guardan tal cual (la IP, con hash, solo en la tabla de límites).
- Crear alumno = primera subida con `crear: true` (solo la manda el aparato que generó el código, mientras el servidor
  no lo conozca). Vincular = mandar un código sin `crear`: si no existe, `404` y el aparato vuelve a como estaba. Los
  intentos con códigos inexistentes cuentan para el bloqueo por IP (contra quien pruebe códigos al azar).
- CORS solo para `https://antoniofcano.github.io`, `http://localhost:*` y `http://127.0.0.1:*` (y los de
  `ORIGENES_EXTRA`, si se configura). Un navegador desde otra web recibe `403`. Las peticiones sin `Origin` (curl) se
  atienden: CORS no es identidad; la identidad es el código.
- Validación estricta de cada operación (tipos conocidos, campos permitidos, tamaños, instantes razonables) con el
  mismo código en cliente y servidor (`operaciones.js`, que el Worker importa al empaquetarse).
- Sin claves en el cliente. El diagnóstico que se copia no lleva el código ni respuestas.

## Cuándo sincroniza (motor)

Al abrir la app (1,5 s después), al volver la red (`online`), al volver a primer plano (`visibilitychange`), cada 4
minutos con la app abierta y visible, y 4 s después de cada escritura (junta varias respuestas en una subida). Nunca
bloquea la interfaz. Sin red (`navigator.onLine === false`) ni lo intenta. Lo pendiente sigue pendiente hasta que el
servidor confirma; lo recibido se guarda junto con el cursor; si la respuesta se pierde, se reenvía y el servidor
ignora los duplicados.

Primer uso: el código se crea **en silencio** en cuanto hay algo que subir (o al abrir «Mis dispositivos»). Un aparato
recién abierto que no ha hecho nada no crea alumno.

## Interfaz

- **Ajustes → «Mis dispositivos»**: el código grande con la instrucción de apuntarlo; un QR (negro sobre blanco,
  también en oscuro) con el enlace `…/nautica/#/vincular/<código>` para la cámara del otro móvil (la app no lleva
  lector de QR; el QR se genera con `src/vendor/qrcode-generator.js`, MIT, y un test lo decodifica con jsQR); un campo
  para escribir el código de otro aparato («Unir este aparato»: lo que hubiera aquí se suma, sin preguntar); la línea
  de estado y «Copiar diagnóstico».
- **`#/vincular/<código>`**: una frase («¿Usar en este aparato el progreso del código …? Lo que hayas estudiado aquí
  se sumará.») y «Sí, unir» / «Ahora no».
- **Estado** (solo para diagnóstico): «Sincronizado · hace 2 min · 0 pendientes · v<versión>»; «Pendiente de
  sincronizar»; «Sin conexión: se sincronizará al volver»; «Error al sincronizar (<código>): <motivo>»; «Sin vincular».
- **Punto en la cabecera** (en el engranaje de Ajustes): solo si hay código y lleva más de 24 h sin lograr sincronizar.
- **Avisos de copia**: mientras la sincronización esté sana (con código y lograda hace menos de 3 días), no salen ni
  el recordatorio de Hoy (`avisoCopia`) ni la tarjeta de Ajustes, y en Más se enlaza «Mis dispositivos». Si no está
  vinculada o lleva días sin sincronizar, vuelven como siempre. Guardar o recuperar una copia en un archivo y
  «Empezar de cero» quedan en la sección plegada «Avanzado».

## Diagnóstico

«Copiar diagnóstico» copia: versión, estado, si está vinculado, pendientes, operaciones en el aparato, cursor, último
éxito e intento, fallos seguidos, subidas/recibidas/ignoradas, estado del almacenamiento, si hay red y los últimos
errores (código y motivo). Nada del alumno. Para probar contra un servidor local en un navegador:
`localStorage.setItem('nautica.sync.url', 'http://127.0.0.1:4810')`.

## Pruebas

- `nautica/tests/sync-plegar.test.js`: equivalencia con el almacén antiguo (200 secuencias al azar), migración
  (60 progresos al azar y versiones antiguas), bases troceadas, pliegue determinista con duplicados y desorden,
  fusión de bases, reserva, ajustes compartidos y del aparato, import y reset.
- `nautica/tests/sync-motor.test.js`: de punta a punta en Node (almacenes + motor + el Worker con un D1 en memoria):
  dos aparatos sin conexión que convergen en los dos órdenes, idempotencia, sin red, red intermitente y respuestas
  perdidas, servidor caído, respuesta cortada, respuestas troceadas, lotes demasiado grandes, vincular con un código
  inexistente, pestañas; código del alumno.
- `nautica/tests/correcciones-tema.test.js`: la operación de las correcciones de tema (validación, pliegue con dos
  aparatos y con deshacer, al azar y en cualquier orden, almacén, copia y recuperación) y de punta a punta por el Worker.
- `nautica/tests/sync-qr.test.js` (el QR se decodifica) y `sync-rendimiento.test.js` (20 000 operaciones).
- `sync-worker/tests/servidor.test.js` (Node, D1 sobre `node:sqlite`, sin red): esquema = migraciones, alta, hash,
  duplicados, cursor, troceo, validación, cuerpo, tope, límites, intentos fallidos, CORS, rutas, consultas por petición.
- `sync-worker/tests/integracion.test.js`: el Worker de verdad (`wrangler dev --local`, workerd y D1 local) en el
  puerto 4811; se salta si no hay `node_modules`.
- Del recordatorio diario: `sync-worker/tests/webpush.test.js`, `sync-worker/tests/avisos.test.js` y
  `nautica/tests/recordatorio.test.js` (ver [`AVISOS.md`](AVISOS.md)).

## Despliegue (lo hace el dueño, a mano)

Requisitos: cuenta de Cloudflare y `npx wrangler login` (en `sync-worker/`, tras `npm install`).

```sh
cd sync-worker
npm install
npx wrangler login
npx wrangler d1 create patron-sync               # copia el database_id que imprime
#   → pégalo en wrangler.toml (database_id = "…")
npx wrangler d1 migrations apply patron-sync --remote
openssl rand -base64 32 | npx wrangler secret put PEPPER   # o escribe uno largo a mano; guárdalo en tu gestor
npx wrangler deploy
curl https://patron-sync.antoniofcano.workers.dev/v1/salud   # → {"ok":true,"version":"1.1.0"}
```

- Si el subdominio de workers.dev de la cuenta no es `antoniofcano`, la URL será otra: cámbiala en
  `nautica/src/store/sync/config.js` (`URL_PRODUCCION`), `npm run precache` y publica la app.
- **El PEPPER no se puede cambiar** después sin dejar a los alumnos sin acceso (sus hashes dejarían de coincidir). Si
  se pierde, cada aparato sigue funcionando en local; para volver a sincronizar habría que vaciar `alumnos` y que cada
  alumno se vuelva a unir (los aparatos vuelven a subirlo todo al vincularse).
- Migraciones nuevas: `migrations/000N_….sql` y actualizar `schema.sql`; aplicar con
  `npx wrangler d1 migrations apply patron-sync --remote` antes de desplegar el Worker que las use.
- Probar en local sin tocar Cloudflare: `npx wrangler d1 migrations apply patron-sync --local` y
  `npx wrangler dev --local --port 4810 --var PEPPER:una-clave-de-pruebas-larga` (o un `.dev.vars`, que está en
  `.gitignore`).
- Copia de la base de datos: `npx wrangler d1 export patron-sync --remote --output copia.sql` (no la subas a git).
- Borrar un alumno (si lo pide): con su código, calcula el hash (ver `hashCodigo` en `src/servidor.js`) y
  `DELETE FROM avisos WHERE alumno = (SELECT id FROM alumnos WHERE hash = '…'); DELETE FROM operaciones WHERE alumno = (SELECT id FROM alumnos WHERE hash = '…'); DELETE FROM alumnos WHERE hash = '…';`
  con `npx wrangler d1 execute patron-sync --remote --command "…"` (primero `avisos` y `operaciones`: D1 hace cumplir
  las claves ajenas).
- Recordatorio diario (migración `0002`, claves VAPID, `PUSH_ACTIVO`, la tarea programada): pasos en
  [`AVISOS.md`](AVISOS.md), «Despliegue».


## Si el servicio pierde los datos de un alumno

Cada aparato guarda su registro completo de operaciones, así que el servicio se recompone solo. Si un aparato que ya
había sincronizado con éxito con su código recibe `codigo-desconocido`, da de alta el mismo código otra vez
(`registro.recrear()`: `creador` activo, cursor a 0 y todo el registro como pendiente) y lo resube; los demás aparatos
traen y suben lo que les falte en su siguiente sincronización. Un código que nunca funcionó en ese aparato (uno mal
escrito al vincular) no entra por este camino: se dice que no existe. El diagnóstico muestra cuántas veces ha pasado
(`recreados`). En Ajustes, un código que el servicio aún no ha confirmado lleva un aviso para no usarlo en otro aparato.

**Mantenimiento de la base de datos:** nunca se vacían tablas de producción a ciegas. Para limpiar pruebas se borra
por la clave de lo que se creó (el hash del código de prueba), no con `DELETE` sin condición.
