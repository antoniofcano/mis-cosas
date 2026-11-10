# La Travesía

Gamificación sobria del progreso: la derrota hacia el examen con un **faro por tema del temario** (los mismos faros, con
las mismas cuentas, que enseña el Temario), un **rango**, una
**semana** con día de descanso, unas **insignias** y un **parte de travesía** al terminar cada sesión. Solo existe si el
banco activo (eje y titulación) tiene sus preguntas etiquetadas por concepto (docs/CONCEPTOS.md); sin `conceptos.json` no
aparece nada y la app es la de siempre.

Código: `src/course/travesia.js` (todo el cálculo, puro y con la hora inyectada), `src/ui/travesia.js` (cálculo con el
almacén), `src/ui/views/travesia.js` (pantallas, la carta `cartaDerrota` que también usa Hoy y el parte). Tests: `tests/travesia.test.js`. La carta se
dibuja en estilo C con `src/illustrations/derrota-c.js` (ver docs/ENTRADA.md, «Accesibilidad y reglas»).

## Lo que NO cambia

- «¿Estás listo?» (`src/course/listo.js`) y el dominio de cada idea (`src/conceptos/conceptos.js`) son los de siempre: la
  travesía los **lee**. La pantalla enseña la nota real tal cual la da `lineaListo`.
- Ni ranking público, ni puntos, ni nada por velocidad o por número de preguntas.
- **Cuarentena**: solo cuentan las preguntas del estudio del banco. Antes de calcular nada se descartan las respuestas a
  preguntas que no son del estudio (reservadas para el examen final, anuladas, retiradas). Ninguna pantalla ni texto
  nombra, lista o cuenta preguntas: solo ideas. Nada lleva ids de preguntas.

## Ruta y pantallas

| Ruta | Qué es |
|---|---|
| `#/<tit>/travesia` | «← Hoy» y «Seguir» (si la sesión de hoy no está hecha), rango, carta con los faros y el marcador «estás aquí», detalle del faro elegido (ideas por reforzar con «Ver ficha»), semana, nota «¿Estás listo?» |
| `#/<tit>/travesia/insignias` | Rejilla de insignias con su detalle y la escalera de rangos |
| Hoy | La carta en compacto como héroe (toda ella abre la travesía) y rango y semana en la fila de estado: docs/ENTRADA.md (las cuatro pestañas no cambian) |
| Más, Mi progreso | Enlace a la travesía |
| `#/<tit>/temario` | Los mismos faros, uno por **tema** (`farosPorTema`; ver docs/ICONOS.md) |
| `#/<tit>/sesion` (al terminar) | Parte de travesía arriba del resumen, con «Compartir mi parte» (docs/ENTRADA.md) |

La ficha de una idea abierta desde la travesía vuelve a ella (`?desde=travesia/<faro>`; el id de un faro es `t<n>`, el
número de su tema). El detalle de cada faro enlaza a su tema del Temario («Ver el tema»).

## Faros

**Los faros de la derrota son los temas del temario de la titulación**: uno por tema del examen que tenga ideas, en el
orden del Temario (el de estudio, `bloquesEnOrden`), con el título del tema y un nombre de una palabra para el rótulo de la
carta (`corto`, en `src/theory/blocks.js`). Un faro se enciende con **≥ 80 %** de las ideas de su tema dominadas
(`FARO_ENCENDIDO`). «Dominada» es el estado `dominado` de `dominio()`.

| Titulación | Faros (en el orden de la derrota) |
|---|---|
| PER (11) | Nomenclatura · Balizamiento · RIPA · Navegación · Carta · Amarre · Seguridad · Legislación · Maniobra · Emergencias · Meteorología |
| PY (4) | Navegación · Carta · Seguridad · Meteorología |

**Una sola función reparte las ideas en faros**: `farosDeTemas(ideas, estructura)` de `src/course/travesia.js`. Cada idea
va al tema de la mayoría de sus preguntas (`temaDeIdea` de `src/course/listo.js`) y la luz de cada faro la da `luzDeFaro`.
`estadoTravesia().faros` (la carta de Hoy y de la Travesía, el parte, las insignias) y `farosPorTema(est)` (el Temario) son
los mismos objetos: dominadas, total, porcentaje y estado no pueden divergir. Un test lo comprueba en la PER y el PY de
todos los bancos contra un cálculo aparte.

Antes los faros eran seis fijos que agrupaban los bloques del catálogo (nomenclatura, maniobra, seguridad, balizamiento,
meteorología, navegación) y sus porcentajes no coincidían con los del Temario, que ya iba por tema. Esos seis ya no se
dibujan (`FAROS_ANTIGUOS` solo da nombre a sus insignias guardadas; ver «Insignias»).

**Ideas sin tema.** Toda idea de la travesía tiene alguna pregunta del estudio, así que `temaDeIdea` siempre le da un tema;
hoy, en todos los bancos, todas caen en un tema del temario. Si alguna vez una idea quedara sin tema (o con un tema que la
estructura no tiene), iría al faro «Otras ideas» (`otras`, el último), que solo existe si hace falta: así los faros siempre
suman todas las ideas (las del rango). El Temario no lo pinta (no es un tema) y un test avisa si aparece.

**La carta con un número variable de faros** (`trazadoDerrota(n, { compacta })`): hasta seis faros (el PY tiene cuatro,
con sus propios puntos) se usa la carta de siempre, de 358 × 320. Con más (la PER, once) se usa la carta «densa»: más
alta, con los faros en filas recorridas en zigzag de abajo arriba (3 columnas en la Travesía, 4 en Hoy), las columnas
alternas algo más arriba para que dos nombres vecinos no queden a la misma altura, la bandera del examen en el hueco
siguiente al último faro y, en la grande, la rosa y la cartela sobre la costa del sur. Un test mide las cajas de discos,
nombres y marcador a 360 px y falla si algo se pisa o se sale.

**Extensión del criterio de dominio**: `dominio()` exige al menos 3 preguntas respondidas, y entre el 15 y el 30 % de las
ideas de cada banco tienen 1 o 2 preguntas: nunca llegarían a «dominadas» y habría faros imposibles de encender. Una idea con
menos de 3 preguntas de estudio se da por dominada cuando **todas** están respondidas y bien (sin estar floja). No hay
ningún umbral nuevo.

## Rango

Sobre el **porcentaje** de ideas dominadas del banco (cada titulación y eje), no cifras fijas:

| Rango | Ideas dominadas | Además |
|---|---|---|
| Grumete | 0 % | |
| Marinero | 20 % | |
| Timonel | 45 % | |
| Contramaestre | 70 % | un simulacro (o examen real) aprobado |
| Patrón | 90 % | un examen inédito aprobado |

«Inédito» = el criterio de «¿Estás listo?» (`pesoExamen > 1`: el examen final o un examen con ≥ 60 % de preguntas nuevas).
El rango **nunca baja**: se guarda el máximo alcanzado. La barra mide el camino hasta el siguiente.

## Semana

De lunes a domingo. Cuenta como día de estudio cualquier día con actividad (`logActividad`). **Descanso**: el primer día ya
pasado sin estudiar después del primer día de estudio de la semana (uno por semana); los demás días sin estudiar son
«libres». Nada se «rompe» ni hay contador que se pierda.

## Insignias

| Insignia | Se consigue con |
|---|---|
| Guardia de 5 minutos | completar una sesión de «5 minutos» (la apunta esa pantalla al terminar) |
| Una semana de travesía | ≥ 4 días de estudio en una misma semana (lunes a domingo), seguidos o no |
| Idea rescatada | una idea que estaba floja deja de estarlo en una sesión, o una idea dominada cuyo primer intento fue fallo |
| Tema completo (una por faro, `tema:<n>`) | todas las ideas del tema dominadas (el faro se enciende al 80 %; esta pide el 100 %) |
| Primer simulacro aprobado | un simulacro o examen real aprobado |
| Examen inédito aprobado | un examen inédito aprobado |

**Migración de las «Bloque completo».** Con los seis faros antiguos había una insignia por faro, `bloque:<faro>`
(`bloque:nomenclatura`, `bloque:maniobra`…). Ahora hay una por tema, `tema:<n>` (n = número del tema, estable). Reglas:

- **Nada se borra ni se renombra.** Las `bloque:*` que alguien ya tenía siguen guardadas con su fecha y se siguen
  enseñando en la rejilla, detrás de las de tema, como «Bloque completo: …» con una nota que explica el cambio
  (`catalogoInsignias(faros, ganadas)`). Cuentan entre las conseguidas.
- Las `bloque:*` que no se ganaron dejan de existir: no salen en la rejilla ni se pueden ganar.
- Las nuevas `tema:*` no se regalan: salen de los datos de hoy con la regla de siempre (todas las ideas del tema
  dominadas) y se apuntan al abrir Hoy, la Travesía o el parte. Quien tenía un bloque completo y conserva sus ideas
  dominadas gana enseguida las de sus temas.
- **Entre aparatos** (docs/SYNC.md) nada cambia: las insignias son una unión por id con la fecha más antigua; un aparato
  con la versión anterior y otro con la nueva solo se suman ids. Los ids nuevos caben en las claves de una operación.
- El recuerdo de «faros ya vistos» (`src/ui/efectos.js`, fuera del progreso) cambia de nombre (`faros-tema:<eje>/<tit>`):
  la primera visita con los faros nuevos no anima nada.

## Parte de travesía

Al empezar una sesión (`empezar` en Hoy) se guarda en ella una **foto** (`sesion.foto`): estado de cada idea vista, rango e
insignias. Al terminar, `parteSesion` compara con el estado de ahora: ideas nuevas, rescatadas, siguen flojas (trabajadas en
la sesión), faros que cruzan el 80 %, insignias nuevas, rango y «para mañana» (la idea floja que antes vuelve al repaso, con su
ficha). Una sesión empezada antes de existir la travesía no tiene foto y no muestra parte.

## Almacén

`progress.travesia(eje, tit)` → `{ rango, insignias: { id: ISO } }`, dentro del campo opcional `travesia`
`{ v: 1, bancos: { 'eje/tit': … } }`. La versión del progreso sigue siendo 1 (la importación la exige); un progreso sin el
campo carga igual y uno mal formado se descarta (se recalcula desde los datos). Se guarda al abrir Hoy, la travesía o el parte.
