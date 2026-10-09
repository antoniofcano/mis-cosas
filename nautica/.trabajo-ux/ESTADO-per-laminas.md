# Láminas del PER en estilo C: estado

Rama `feat/per-laminas-c`. Guía: `docs/ESTILO-LAMINAS.md` (apéndice con la fuente de cada lámina). Trabajo paralelo:
la cola del PY va en `feat/py-laminas-cola`; aquí, ficheros nuevos y cambios de una o dos líneas en los comunes.

## Hecho en esta rama

| Lámina (spec) | Fichero | Notas |
| --- | --- | --- |
| `ritmo` (los 6 de la galería y cualquier otro: Q(6)+LFl, Fl(2+1), Al.Bu/Y, F…) | `per-c.js` | la luz de un faro de noche (SMIL, como las boyas), el nombre del ritmo, cronograma con un trazo por segundo y cotas del periodo y de la primera luz; `texto` sigue siendo el pie |
| `regiones` | `per-c.js` | dos canales con los símbolos de la carta (lata y cono), mismas formas y colores al revés |
| `amarras` (+ `resaltar`) | `per-c.js` | leyenda numerada, norays negros, esprines cruzados; el pie (qué impide cada amarra) no cambia |
| `riesgo` (`comparar`, `constante`, `variable`) | `per-c.js` | demoras calculadas (`casoRiesgo`): 033° ×4 y 033°, 035°, 038°, 041°; conserva «demoras: … · …» |
| `jerarquia` | `per-c.js` | escalones con la marca de día de cada uno |
| `dst` | `per-c.js` | vías, zona de separación, zona costera; cruzar a 90°, entrar por el extremo, velero en la zona costera |
| `buque` (32 clases, todas las vistas, día, obstrucción, aparejo, sin arrancada) | `buques-c.js` | mismos datos (`SHIPS`); celdas de noche y de día; luces con `data-luz` |
| Tarjetas del mazo «buques» (32) | `tarjetas-c.js` → `buqueSvg()` | estilo C, sin el nombre; ya no queda ningún anverso antiguo |
| `ciaboga` | `animaciones/ciaboga.js` + `nautical/maniobra-puerto.js` | animada (Nomoto + presión lateral), 5 hitos, imagen fija = final |
| `desatraque` (abrir popa / proa y las 12 combinaciones de mandos) | `interactivas/desatraque.js` + `maniobra-puerto.js` | interactiva y animada; mandos, predicción y `data-parte` iguales |

Marcos: `marcos-per.js` (enganchado con dos líneas en `marcos.js`). Registro: `per-renderers.js` (dos líneas en
`index.js`) y una entrada en `animaciones/index.js`. Tests: `tests/laminas-per.test.js` (12) y dos ajustes:
`tests/illustrations.test.js` (la draga, ahora por `data-luz`) y `tests/tarjetas-c.test.js` (ya no quedan anversos
antiguos). La galería del PER ya no tiene ninguna lámina sin marco.

## Errores o dudas encontrados (no corregidos en silencio)

- `src/illustrations/ships.js`, `buceo`: `sinCostados: true`. La regla 27 e) no dice nada de las luces de costado (las
  de la 27 d) incluyen las de la 27 b, con costados si tiene arrancada); se deja así porque esas embarcaciones trabajan
  paradas, pero no está verificado que nunca deban llevarlos.
- `ships.js`, `dragaminas`: la luz de tope a 0,6 del palo, por debajo de las verdes. La regla 27 f) solo dice que una
  verde va «cerca del tope del palo de proa»; la altura relativa del tope no está verificada: se dibuja como estaba.
- Las luces que destellan con SMIL (boyas, ritmos) no se paran con «reducir movimiento» (comportamiento de antes, no
  de esta rama). Destellan a menos de 3 por segundo, pero conviene decidir si se paran.
- `src/illustrations/seamanship.js`, `situations.js`, `navigation.js`, `maniobra.js`, `balizamiento.js` y `ships.js`
  conservan sus dibujos antiguos (`amarrasIllustration`, `riesgoIllustration`, `dstIllustration`, `ciabogaIllustration`,
  `regionesIllustration`, `shipIllustration`): ya no se usan (los tapa `per-renderers.js`). Se dejaron para no tocar
  ficheros comunes; se pueden borrar en una limpieza.

## Mapas y chuletas del PER (revisados a 360 px, claro y oscuro)

Sin errores de consola ni desbordes. Mapas (lista, explorar, mapa entero, jugar) y chuletas de los temas 5, 6 y 7 bien.
Anotado:
- Las miniaturas de los buques en «Jugar», «Viene de» y «No lo confundas con» (unos 50 px) son casi ilegibles: un
  cuadro oscuro con puntitos. Ya pasaba con el dibujo antiguo; mejor una vista (`vista: 'proa'`) en esos nodos o una
  miniatura propia.
- En «Explorar» la lámina va en `il-figure` con su pie largo (la nota de `SHIPS`), sin el marco C (título, clave): es
  como está diseñado, pero en las láminas con marco el pie repite lo que ya dice el concepto.

## Clases del PER: revisión (peso = preguntas por clase en cada banco: Andalucía / DGMM / Baleares)

Ninguna clase sin lámina (test `course.test.js`). Las 37 clases cuyas láminas son todas propias de la lección
(`src/illustrations/lecciones/*`, dibujo antiguo, sin marco) son la cola siguiente, por peso:

| Clase | Láminas | Peso |
| --- | --- | --- |
| per-11-1 La carta del Estrecho | carta-margenes, milla, transportador | 36 / 84 / 242 |
| per-11-3 Rumbo directo, distancia y hora | rumbo-directo | 32 / 33 / 156 |
| per-6-1 El reglamento y sus definiciones | ripa-definiciones | 28 / 44 / 82 |
| per-11-4 Situación de estima | estima | 28 / 27 / 95 |
| per-11-8 Marcaciones «más tarde» | traslado-demora | 18 / 18 / 98 |
| per-1-6 El equipo de fondeo | fondeo | 29 / 35 / 68 |
| per-3-3 Mal tiempo | capear-correr | 28 / 38 / 66 |
| per-10-2 Distancia, velocidad y tiempo | milla | 27 / 27 / 54 |
| per-9-3 El viento: vocabulario | rolar | 27 / 26 / 49 |
| per-1-3 La estructura del casco | estructura | 16 / 21 / 60 |
| per-10-3 La carta y las publicaciones | veriles | 17 / 22 / 53 |
| per-2-5 Borneo, garreo | fondeo | 14 / 28 / 42 |
| per-7-1 Cabos | cabo | 17 / 34 / 38 |
| per-3-8 Rescate y remolque | remolque, hipotermia | 11 / 24 / 54 |
| per-11-9 Rumbo para pasar a una distancia | tangente | 18 / 14 / 51 |
| resto (22 clases, menos de 80 preguntas en total cada una) | cubierta, timón, nudos, orinque, revisión, zonas, normativa (7), atraque, sanidad (4), varada, vías de agua, previsión, oposición | |

No se han añadido láminas genéricas a esas clases: todas tienen ya una lámina propia de su tema (más precisa que
cualquiera de la galería); lo que les falta es el estilo C. Prioridad propuesta: las cuatro de carta (11-1, 11-3,
11-4, 11-8; pueden reutilizar `carta-c.js` y `colocaEtiquetas`), definiciones del RIPA y fondeo.

## Pendiente

- La cola de lecciones de arriba (y `fuego` con `modo: 'apagar'`, la interactiva del PER en per-8-7, aún sin marco).
- Ciaboga con dos hélices (`ciaboga-dos-helices`, lección per-7-5): sin animar.
- Capturas: scratchpad `lper-capturas/` (galería de la app a 360 px claro y oscuro de las 46 láminas, una a 990,
  tarjetas, mapas, chuletas, fotogramas de las animaciones y hoja de contacto).
