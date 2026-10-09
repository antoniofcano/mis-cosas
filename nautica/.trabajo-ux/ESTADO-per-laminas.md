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

## Tanda de cierre (rama `feat/laminas-cierre`)

Hecho, todo con marco completo, `data-parte` y parámetros de antes, y una fila en el apéndice de la guía con su fuente
(tests en `tests/laminas-cierre.test.js`):

| Clases | Láminas (spec) | Fichero |
| --- | --- | --- |
| per-10-2, 10-3, 11-1, 11-3, 11-4, 11-8, 11-9 | `carta-margenes`, `transportador`, `milla`, `rumbo-directo`, `estima`, `traslado-demora`, `tangente`, `veriles` (esquemas propios, nunca la carta escaneada) | `per-cola-carta-c.js` |
| per-11-7 | `oposicion` (`oposicion` y `enfilacion`; ahora con `resaltar`: recta, demora, situación) | `per-cola-carta-c.js` |
| per-10-5, 10-6, 11-5, 11-6 | `declinacion-anual`, `rumbo-cuadrantal`, `demora-marcacion`, `calidad-corte` | `per-cola-calculo-c.js` |
| per-1-3, 1-6, 2-5, 2-6, 3-3, 3-8, 6-1, 7-1, 8-5, 8-9, 9-3 | `ripa-definiciones`, `capear-correr`, `fondeo` (6 vistas), `estructura`, `rolar`, `cabo`, `remolque`, `hipotermia` | `per-cola-c.js` |
| per-3-5, 4-2, 4-4, 4-5, 4-7, 4-8 | `zonas`, `dotacion-zonas`, `playa`, `vertidos`, `tanque-retencion`, `marpol-basuras`, `posidonia`, `banderas-a-bordo`, `pabellon-obligatorio`; el dibujo de la interactiva `playa` (`modo: 'distancia'`) | `per-cola-normativa-c.js` |
| per-4-1, 4-6 | `puerto-comercial`, `seguro-rc`, `contaminacion`, `deber-auxilio` | `per-cola-normativa-b-c.js` |
| per-8-7 | `fuego` `modo: 'apagar'` (interactiva, con su marco) | `interactivas/per-basicas.js` |
| per-7-5 | `ciaboga-dos-helices`, animada (hipótesis en la guía) | `animaciones/ciaboga-dos.js` |
| mapas | miniatura propia de los buques en «Jugar», «Viene de» y «No lo confundas con» (88 × 60, celda de noche y de día) | `miniaturaBuque()` en `buques-c.js` |
| todas | las luces SMIL (faros de `ritmo`, `luzC`, `carta-c`) se quedan fijas con «reducir movimiento», y el cursor del cronograma se oculta | `styles/laminas.css`, `lights.js`, `carta-c.js` |

Limpieza: borrados los dibujos antiguos que ya no se usaban (`maniobra.js` entero; `amarrasIllustration` y demás de
`seamanship.js`, que se queda con `CLASES_FUEGO`; `riesgoIllustration`, `dstIllustration`, `regionesIllustration`,
`shipIllustration`, `blinkingLight`, `rhythmTimeline`, `rhythmIllustration`) y los de las lecciones migradas, con sus
ayudas sin uso. Lo que sigue en `index.js` llega solo por `per-renderers.js`.

### Cambios de contenido (anotados, no en silencio)

- `playa` balizada: quitado el rótulo «canal de acceso 25 a 50 m»: no está en el art. 73 del Reglamento de Costas.
- `puerto-comercial`: no se dibuja «el que sale pasa primero» (ni su `resaltar: 'salida'`, que ahora no resalta nada):
  no aparece en el RD 186/2023 ni en el RIPA; es costumbre u ordenanza de cada puerto. El texto del paso de per-4-1 lo
  sigue diciendo: **duda para el autor del temario**. «En el canal no se fondea» se dibuja como «evita fondear en el
  canal (RIPA 9 g)», que es lo que dice la regla. Quitados «velocidad reducida», «sin levantar ola» y «obedece a la
  autoridad portuaria y a Capitanía» por no tener fuente comprobada aquí.
- `tanque-retencion`: «con marcado CE, el barco ya cumple por construcción» pasa a «las reglas del artículo 22 no son
  para los de marcado CE», que es lo que dice el art. 22.1.
- `marpol-basuras`: el esquema del Estrecho ya no lleva los nombres de Huelva, Cádiz, Trafalgar, Málaga y Almería
  (siguen en el pie); unidades «M» en lugar de «mn» en todas las láminas nuevas.
- `deber-auxilio`: «deja constancia en el diario» al acudir viene de la Ley 14/2014, art. 183.3 (SOLAS V/33.1 solo pide
  anotar el motivo cuando no se acude).
- `contaminacion` `aviso`: «informar es obligatorio» se apoya ahora en la Ley 14/2014, art. 186.1 (el capitán comunica
  a la Capitanía todo episodio de contaminación observado).
- `rolar`: AEMET define rolar como «cambiar de dirección»; el «y se mantiene» de la clase no está ahí: no se dibuja.
- `calidad-corte`: el texto alternativo da la razón de longitudes calculada (1 / (√2 · sen(α/2)), unas 4 veces a 20°).

### Lo que queda con el dibujo antiguo (19 tipos; lista en el test «ninguna lámina… sigue con el dibujo antiguo»)

Sin fuente comprobable en esta tanda (no se ha dibujado nada nuevo de ellas):

| Lámina | Clase | Por qué queda |
| --- | --- | --- |
| `hemorragia`, `quemadura`, `radio-medico`, `botiquin` | per-8-1, 8-2, 8-3 | primeros auxilios: hace falta la Guía Médica Internacional de a Bordo (OMS/OMI) o la del Instituto Social de la Marina, y la norma del botiquín de recreo, para comprobar cada paso y cada número de teléfono |
| `cubierta`, `timon`, `nudos`, `estructura` del tenedero (`tenedero`), `fondeo-gira`, `muerto-boya`, `atraque`, `gobierno-rabeo` | per-1-2, 1-4, 2-1, 2-2, 2-3, 2-4, 7-3, 7-7 | vocabulario y maniobra sin cifras de norma; se pueden migrar con el RD 875/2014 (anexo II) como única fuente, pero no se ha hecho en esta tanda |
| `revision-salida`, `prevision-salida` | per-3-2, 9-7 | listas de buena práctica (motor, fuentes de la previsión); el «hasta 20 millas» de las aguas costeras de AEMET y los canales de trabajo de Salvamento Marítimo están por comprobar |
| `reflector-tormenta` | per-3-4 | el reflector (RD 339/2021) se puede comprobar; lo de la tormenta eléctrica y el desvío de la aguja, no |
| `varada-abordaje`, `achique-sentina` | per-8-4, 8-5 | procedimiento de emergencia sin fuente normativa a mano |
| `barometro-tendencia`, `mar-crece` | per-9-1, 9-6 | física (tendencia barométrica, fetch y persistencia): hace falta OMM-N.º 702 / N.º 8; el glosario de AEMET no lo cubre |

## Pendiente

- Los 19 tipos de arriba.
- Capturas de esta tanda: scratchpad `lcierre-capturas/`.
