# La Travesía

Gamificación sobria del progreso: la derrota hacia el examen con un **faro por bloque del temario**, un **rango**, una
**semana** con día de descanso, unas **insignias** y un **parte de travesía** al terminar cada sesión. Solo existe si el
banco activo (eje y titulación) tiene sus preguntas etiquetadas por concepto (docs/CONCEPTOS.md); sin `conceptos.json` no
aparece nada y la app es la de siempre.

Código: `src/course/travesia.js` (todo el cálculo, puro y con la hora inyectada), `src/ui/travesia.js` (cálculo con el
almacén), `src/ui/views/travesia.js` (pantallas, tarjeta de Hoy y parte). Tests: `tests/travesia.test.js`.

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
| `#/<tit>/travesia` | Rango, carta con los faros, detalle del faro elegido (ideas por reforzar con «Ver ficha»), semana, nota «¿Estás listo?» |
| `#/<tit>/travesia/insignias` | Rejilla de insignias con su detalle y la escalera de rangos |
| Hoy | Tarjeta «Tu travesía» bajo la sesión (las cuatro pestañas no cambian) |
| Más, Mi progreso | Enlace a la travesía |
| `#/<tit>/sesion` (al terminar) | Parte de travesía arriba del resumen |

La ficha de una idea abierta desde la travesía vuelve a ella (`?desde=travesia/<faro>`).

## Faros

Un faro se enciende con **≥ 80 %** de las ideas de su bloque dominadas (`FARO_ENCENDIDO`). «Dominada» es el estado
`dominado` de `dominio()`. Los bloques del catálogo (`bloqueDe` de `src/course/nivel.js`) son 13 en el PER y 6 en el PY;
para la carta se agrupan en seis faros, en el orden de estudio:

| Faro | Bloques del catálogo |
|---|---|
| Nomenclatura náutica | `nomen` |
| Maniobra y marinería | `amarre`, `maniobra` |
| Seguridad y legislación | `estabilidad`, `seguridad`, `legis`, `emergencia` |
| Balizamiento y RIPA | `baliza`, `ripa` |
| Meteorología | `meteo` |
| Navegación y carta | `nav`, `mareas`, `carta` |

En el PY solo hay ideas en tres faros (seguridad, meteorología, navegación): se dibujan tres. Un bloque nuevo del catálogo
sin faro cae en «Otras ideas» y un test lo detecta para que se asigne.

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

## Insignias (primera versión)

| Insignia | Se consigue con |
|---|---|
| Guardia de 5 minutos | completar una sesión de «5 minutos» (la apunta esa pantalla al terminar) |
| Una semana de travesía | ≥ 4 días de estudio en una misma semana (lunes a domingo), seguidos o no |
| Idea rescatada | una idea que estaba floja deja de estarlo en una sesión, o una idea dominada cuyo primer intento fue fallo |
| Bloque completo (una por faro) | todas las ideas del faro dominadas (el faro se enciende al 80 %; esta pide el 100 %) |
| Primer simulacro aprobado | un simulacro o examen real aprobado |
| Examen inédito aprobado | un examen inédito aprobado |

## Parte de travesía

Al empezar una sesión (`empezar` en Hoy) se guarda en ella una **foto** (`sesion.foto`): estado de cada idea vista, rango e
insignias. Al terminar, `parteSesion` compara con el estado de ahora: ideas nuevas, rescatadas, siguen flojas (trabajadas en
la sesión), faros que cruzan el 80 %, insignias nuevas, rango y «para mañana» (la idea floja que antes vuelve al repaso, con su
ficha). Una sesión empezada antes de existir la travesía no tiene foto y no muestra parte.

## Almacén

`progress.travesia(eje, tit)` → `{ rango, insignias: { id: ISO } }`, dentro del campo opcional `travesia`
`{ v: 1, bancos: { 'eje/tit': … } }`. La versión del progreso sigue siendo 1 (la importación la exige); un progreso sin el
campo carga igual y uno mal formado se descarta (se recalcula desde los datos). Se guarda al abrir Hoy, la travesía o el parte.
