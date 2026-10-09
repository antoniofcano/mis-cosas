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

## Lo que queda (orden propuesto por peso en el examen)

1. `humedad` y `psicrometro` (py-2-5, 91 preguntas).
2. `helicoptero` (3 vistas; py-1-10, 84).
3. `nubes`, `nubes-pisos` (py-2-6, 79) y `ola` (2 vistas; py-2-8, 77).
4. `husos` (4 vistas; py-3-5, 73): las cuentas de la lección están en `tests/lecciones-tierra.test.js`.
5. `superficies-libres` (py-1-3, 68), `vientos-regionales` (2; py-2-4, 67), `arnes` (2; py-1-4, 66),
   `modelos-viento` (py-2-3, 63), `avisos-navegantes` (2; py-3-7, 52), `extintor` (2; py-1-7, 28).
6. No se hacen por falta de fuentes: `corriente-estrecho` (py-2-9), torniquete y la carta L105.

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
