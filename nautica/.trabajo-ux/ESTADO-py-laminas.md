# Láminas del PY en estilo C: última tanda — estado

Rama `feat/py-laminas-final`. Guía: `docs/ESTILO-LAMINAS.md` (apéndice con la fuente de cada hecho dibujado).

## Hecho en esta rama

Catálogo del PY: las dos que faltaban (`socorro` y `beaufort`) ya están en estilo C, y además las láminas de lección
de más peso en el examen, elegidas cruzando las clases con las etiquetas de concepto de los tres bancos del PY
(preguntas por clase: py-3-10 119, py-3-1 116, py-1-9 96, py-3-8 95, py-3-9 94, py-1-5 91, py-1-6 86, py-1-8 85).

| Lámina | Variantes | Fichero |
| --- | --- | --- |
| Señales de peligro: índice (las 17 en cuatro grupos) | `{tipo:'socorro'}` | `socorro.js` |
| Señales de peligro: cuatro hojas | `hoja: 'pirotecnia' \| 'sonido' \| 'radio' \| 'vista'` (nuevo parámetro) | `socorro.js` |
| Señal resaltada en su hoja | `resaltar` sin `solo` (antes: la hoja de 17 entera) | `socorro.js` |
| Señal sola, en grande | `resaltar` + `solo`; cohete, bengala, humo, radiobaliza y SART con sus cifras y su funcionamiento; las otras doce, pictograma y rótulo | `socorro.js` |
| Escala Beaufort | `{tipo:'beaufort', fuerza?}` | `meteo.js` |
| Escala Douglas | `{tipo:'beaufort', escala:'douglas', grado?}` (nuevo) | `meteo.js` |
| Radar: proa arriba y norte arriba | `radar-pantalla`, `presentacion` ambas / proa-arriba / norte-arriba | `electronica-c.js` |
| Racon, SART y reflector | `radar-respondedores`, `sart` lejos / cerca | `electronica-c.js` |
| GNSS: las siglas de una ruta | `gnss` | `electronica-c.js` |
| XTE, VMG y ETA paso a paso | `gnss-calculos` | `electronica-c.js` |
| Cartas raster y vectorial | `carta-raster-vectorial` | `electronica-c.js` |
| AIS | `ais` | `electronica-c.js` |
| Coordenadas | `coordenadas`, `vista` esfera (con sus `resaltar`, máximos y trópicos) / latitud / longitud / lugar / diferencias | `coordenadas-c.js` |
| Balsa salvavidas | `balsa`, `vista` zafa (con `resaltar`) / inflado / adrizar / lanzar | `balsa-c.js` |

- Los tipos, parámetros, `resaltar` y los textos que comprueban los tests de las lecciones se conservan; las funciones
  antiguas se han quitado de `lecciones/*.js` y el registro `LAMINAS` apunta a las nuevas.
- Marcos en `src/illustrations/marcos-py.js` (se suman a `MARCOS` de `marcos.js`).
- Token nuevo `--lc-naranja` (claro y oscuro) para el humo, la lona y la balsa: solo relleno, nunca texto.
- Tarjetas de memoria: el mazo de señales de peligro usa ya el pictograma en estilo C (`pictoSocorro`); solo queda el
  dibujo antiguo en el mazo de buques (test de `tarjetas-c` al día).
- Galería: el PER (UT 6 y 8) y el PY (UT 1) enseñan el índice y las cuatro hojas; el PER (UT 9) y el PY (UT 2), Beaufort
  y Douglas. Test nuevo en `laminas-estilo.test.js`: esas láminas están en las dos galerías con el título de su marco.
- Todas las variantes en `PILOTO` de `tests/laminas-estilo.test.js` (texto ≥ 10,5 px a 360 px, solo `--lc-*`, marco
  completo, un título por lámina).

## Cambios de contenido (no silenciosos)

- **per-9-6** (`data/curso/per.json`): la lámina de Beaufort ya no lleva Douglas al lado (no cabían legibles a 360 px).
  Se ha cambiado el texto de su paso («La tabla completa: Beaufort a la izquierda y Douglas a la derecha») y se ha
  añadido un paso con la lámina de Douglas tras «Alturas de referencia».
- **Pies de las cinco señales solas** (cohete, bengala, humo, radiobaliza, SART): el pie de la lámina dice ahora la cifra
  del Código IDS («como mínimo»). El texto `nota` de `SOCORRO` (que usan el reverso de las tarjetas y las demás señales)
  **no se ha tocado**; ver «Errores encontrados».
- **Balsa, zafa**: el dibujo antiguo decía «La mayoría se cambia cada 2 años». No es una norma (depende del fabricante y
  del modelo): el dibujo nuevo no lo dice y la nota del marco remite al plazo del fabricante.

## Errores encontrados en el contenido existente (anotados, no corregidos)

1. `SOCORRO['cohete-paracaidas'].nota`: «sube a unos 300 m y la luz arde unos 40 s» — el Código IDS (3.1) da mínimos:
   300 m **o más** y 40 s **o más** (las plantillas puntúan «como mínimo»). Dice además «Se lanza a sotavento, algo
   inclinado», mientras la clase py-1-6 dice «casi vertical, siguiendo las instrucciones del fabricante; con nubes bajas,
   más inclinado». Lo usa el reverso de la tarjeta.
2. `SOCORRO.humo.nota`: «la flotante humea unos 3 minutos» — el Código IDS (3.3) dice 3 minutos **como mínimo**.
3. Trópicos y círculos polares a 23° 27′ y 66° 33′: es el valor del temario y del examen; la oblicuidad actual es de
   unos 23° 26′ (la clase py-3-1 ya lo explica). Se dibuja el del temario y la nota del marco lo aclara.

## Cola (rama `feat/py-laminas-cola`)

Pesos comprobados de nuevo (preguntas de los tres bancos del PY cuyos conceptos se enseñan en la clase): py-2-5 91,
py-1-10 84, py-2-6 80, py-2-8 77, py-3-5 73, py-1-3 72, py-2-4 67, py-1-4 66, py-2-3 63, py-3-7 52, py-1-7 28.

Hechas en estilo C (10 tipos, 17 láminas de clase), con sus marcos en `marcos-py.js`, el dibujo en
`src/illustrations/py-cola-meteo-c.js` (UT 2) y `src/illustrations/py-cola-c.js` (UT 1 y 3), y sus pruebas en
`tests/laminas-py-cola.test.js` (lista `PILOTO_COLA`: texto ≥ 10,5 px, solo `--lc-*`, marco completo, título único, partes
resaltables, galería del PY y las cifras). Mismos tipos, parámetros y `resaltar`; las funciones antiguas se han quitado
de `lecciones/*.js` y su registro apunta a las nuevas.

| Lámina | Variantes | Clase |
| --- | --- | --- |
| `humedad` | `t`, `td` | py-2-5 |
| `psicrometro` | `caso` ejemplo / humedo / seco | py-2-5 |
| `nubes` | `resaltar` género o piso | py-2-6 |
| `nubes-pisos` | `resaltar` piso | py-2-6 |
| `ola` | `vista` partes (con `resaltar`) / mar-de-fondo | py-2-8 |
| `modelos-viento` | `modelo` todos / geostrofico / gradiente / antitriptico | py-2-3 |
| `helicoptero` | `vista` rumbo / cable / senales | py-1-10 |
| `arnes` | `vista` chaleco / arnes, con `resaltar` | py-1-4 |
| `superficies-libres` | `resaltar` lleno / medias / vacio / mamparo | py-1-3 |
| `husos` | `vista` husos / calculo (`ejemplo`, `lon`, `tu`) / oficial | py-3-5 |

Ninguna de estas clases existe en el PER, así que no se ha tocado el bloque `per:` del catálogo (ni el del PY: las
láminas entran en la galería desde las clases).

### Cambios de contenido (no silenciosos)

- **Chaleco**: la lámina antigua citaba en la práctica la Orden FOM/1144/2003, **derogada** por el Real Decreto 339/2021
  (en vigor desde el 1 de julio de 2021). Las cifras que se dibujan (275 / 150 / 100 N, uno por persona y uno más en la
  zona 1, la luz que se omite solo de día en las zonas 4 a 7) son las del art. 7 del RD 339/2021 y coinciden con las de
  antes. Se han quitado del dibujo «se pone sin ayuda en 1 minuto» (exigencia del Código IDS para los chalecos SOLAS, no
  del RD para los CE) y «la radiobaliza personal no es obligatoria» (no lo he podido comprobar en el RD). El silbato y el
  material retrorreflectante no los exige el RD: vienen de la norma del chaleco (UNE-EN ISO 12402).
- **Flotabilidad**: la lámina antigua decía que todo chaleco «da la vuelta al inconsciente». La nota dice ahora que lo
  hace mejor cuanta más flotabilidad y que el de 100 N puede no hacerlo (alcance de la ISO 12402-4).
- **Modelos de viento**: la fila «Antitríptico» antigua dibujaba el viento real de superficie (gradiente, Coriolis y
  rozamiento). Se dibuja lo mismo, ahora con las fuerzas a escala, con el título «Con rozamiento (antitríptico)», y la
  nota explica que en sentido estricto el antitríptico equilibra solo gradiente y rozamiento (ver dudas).
- **Husos, cálculo con una longitud E en el meridiano central**: el pie antiguo decía siempre «Al W la hora va atrasada»;
  ahora dice «Al E … adelantada» cuando la longitud es E (solo afecta a specs con `lon` propia; las de la clase no
  cambian).
- **Hora oficial**: la tabla decía «Península y Baleares: huso 0»; el extremo W de Galicia (más de 7° 30′ W) está en el
  huso 1 W. Se dibuja «huso 0*» con la nota al pie. Se añaden Ceuta y Melilla (TU + 1 / TU + 2).
- **Nubes**: alturas del examen como antes; la nota del marco añade que la OMM da márgenes que se solapan y pone el Ns en
  el piso medio.

### Lo que queda (por peso)

1. `vientos-regionales` (2 vistas; py-2-4, 67): no la he hecho porque los nombres y las direcciones de la rosa
   mediterránea y del mapa (galerna, vendaval, alisios…) son tradicionales y no he encontrado una fuente normativa contra
   la que comprobarlos (el glosario de AEMET sería la candidata). Hay que verificarlos antes de dibujarlos.
2. `avisos-navegantes` (2 vistas; py-3-7, 52): pide comprobar NAVAREA (zonas y coordinadores), NAVTEX (518 / 490 kHz, quién
   emite en España) y las clases de avisos del Instituto Hidrográfico de la Marina; queda para otra tanda.
3. `extintor` (2 vistas; py-1-7, 28): la de menos peso. Para el RD 339/2021, art. 15 (34 B, 2 kg, eslora y potencia) ya
   está anotado lo comprobado en esta rama: sirve de punto de partida.
4. No se hacen por falta de fuentes: `corriente-estrecho` (py-2-9), torniquete y la carta L105.

### Dudas abiertas de esta tanda

- **Helicóptero, 30° por la amura de babor y la grúa a la derecha**: es lo que dice la clase y lo habitual en la
  práctica (IAMSAR, vol. III, operaciones con helicóptero); no he podido consultar el texto literal del IAMSAR en línea.
  La grúa a la derecha es lo normal en los helicópteros de rescate, no una regla: la frase clave dice «normalmente» y la nota del marco, «suele».
- **Las horas del reloj desde el helicóptero** («a sus 3»): convenio habitual de la aviación, no he encontrado un texto
  normativo marítimo que lo fije.
- **Antitríptico**: la clase py-2-3 y las preguntas lo definen como «el modelo con rozamiento»; en el glosario de
  meteorología es el equilibrio gradiente-rozamiento sin Coriolis. Habría que decidir si la clase lo matiza.
- **Psicrómetro**: «algo más del 70 %» y «unos 13 °C» salen de la ecuación psicrométrica (71–73 %, 12,6–13,1 °C según el
  aparato sea ventilado o no); no he visto las tablas concretas que usa la clase.

## Tanda de cierre (rama `feat/laminas-cierre`)

Hecho (fichero `src/illustrations/py-cierre-c.js`, marcos en `marcos-cierre-b.js`, tests en `tests/laminas-cierre.test.js`):

- `extintor` (py-1-7): vistas `co2`, `uso`, `ambas` (por defecto, como antes) y una nueva, `norma`: tablas del RD 339/2021,
  art. 15 (sin marcado CE, extintores de 34 B y 2 kg como mínimo, por eslora y por potencia; con más de 220 kW,
  B = 0,3 · P) y la revisión del Reglamento de instalaciones de protección contra incendios (RD 513/2017): tú cada
  3 meses, una empresa cada año, prueba de presión cada 5 años. **Paso nuevo** en `data/curso/py.json` (py-1-7, tras
  «Suma y ubicación») con esa vista.
- `avisos-navegantes` (py-3-7): `correccion` (permanentes a tinta; temporales y preliminares a lápiz; registro
  «año: grupo/aviso(orden)», ejemplo 2024: 32/127(1); 44/203(2)) y `radioavisos` (NAVAREA, 21 zonas, España coordina la
  III; costeros por Salvamento Marítimo; locales; NAVTEX 518 kHz en inglés y 490 kHz en el idioma del país).

Cambios de contenido (anotados): en `radioavisos` se quitó «Francia» (no comprobado quién emite qué en cada estación) y
«gratis»; el NAVTEX nacional se dice «en el idioma del país».

Queda:
- `vientos-regionales` (py-2-4): sin fuente. El glosario de AEMET no trae los vientos regionales; haría falta el
  derrotero del IHM o una publicación de AEMET con la rosa y las direcciones. No se ha dibujado nada.
- `corriente-estrecho` (py-2-9), torniquete y la carta L105: fuera de la tanda por falta de fuentes (como estaba).

Dudas:
- **«Tinta indeleble»** para los avisos permanentes: el aviso general 3(G) del IHM dice que los temporales y preliminares
  van a lápiz; lo de la tinta indeleble para los permanentes no lo he visto escrito tal cual.
- **El de CO₂ no lleva manómetro**: viene de una guía de la Diputación Foral de Bizkaia y es lo habitual; la norma de
  producto (UNE-EN 3-7) no la he podido consultar. Por lo mismo, no se dibuja ninguna tabla agente × clase de fuego.

## Dudas abiertas

- **Adrizar la balsa desde sotavento**: lo dicen la clase y las instrucciones habituales de los fabricantes (botella a
  sotavento, el viento ayuda a voltearla); no he encontrado el procedimiento en un texto normativo (el Código IDS solo
  exige que la balsa pueda adrizarla una persona). Se mantiene como estaba.
- **Alcance del AIS «20–30 millas»**: es orientativo (alcance del VHF según la altura de las antenas), no una cifra de la
  norma; el dibujo lo dice tal cual lo decía la lámina antigua.
- **Colorante del agua (Anexo IV 3 b)**: el Anexo no fija el color; el pictograma lo pinta verde (la fluoresceína
  habitual) pero ningún texto lo afirma.
- **Clase B del AIS en recreo**: el marco dice que es «la habitual en recreo»; no he comprobado si alguna norma española
  la exige a algún tipo de embarcación de recreo.

## Verificación

- `npm test`: todo en verde (ver el commit). `node --check sw.js` y `npm run precache` al día.
- Capturas en el scratchpad `lpy2-capturas/`: cada lámina nueva a 360 px en claro y en oscuro, una a 990 px y una hoja de
  contacto.
