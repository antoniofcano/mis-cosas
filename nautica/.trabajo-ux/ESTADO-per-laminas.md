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

### Lo que quedaba con el dibujo antiguo (19 tipos; hoy 15: los de sanidad se migraron en `feat/laminas-sanidad`, abajo)

Sin fuente comprobable en esta tanda (no se ha dibujado nada nuevo de ellas):

| Lámina | Clase | Por qué queda |
| --- | --- | --- |
| ~~`hemorragia`, `quemadura`, `radio-medico`, `botiquin`~~ | per-8-1, 8-2, 8-3 | migradas con la Guía Sanitaria a Bordo del ISM y el RD 339/2021 (sección «Sanidad a bordo») |
| `cubierta`, `timon`, `nudos`, `estructura` del tenedero (`tenedero`), `fondeo-gira`, `muerto-boya`, `atraque`, `gobierno-rabeo` | per-1-2, 1-4, 2-1, 2-2, 2-3, 2-4, 7-3, 7-7 | vocabulario y maniobra sin cifras de norma; se pueden migrar con el RD 875/2014 (anexo II) como única fuente, pero no se ha hecho en esta tanda |
| `revision-salida`, `prevision-salida` | per-3-2, 9-7 | listas de buena práctica (motor, fuentes de la previsión); el «hasta 20 millas» de las aguas costeras de AEMET y los canales de trabajo de Salvamento Marítimo están por comprobar |
| `reflector-tormenta` | per-3-4 | el reflector (RD 339/2021) se puede comprobar; lo de la tormenta eléctrica y el desvío de la aguja, no |
| `varada-abordaje`, `achique-sentina` | per-8-4, 8-5 | procedimiento de emergencia sin fuente normativa a mano |
| `barometro-tendencia`, `mar-crece` | per-9-1, 9-6 | física (tendencia barométrica, fetch y persistencia): hace falta OMM-N.º 702 / N.º 8; el glosario de AEMET no lo cubre |

## Sanidad a bordo (rama `feat/laminas-sanidad`)

Fuente: Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013 (NIPO 273-13-027-4), por capítulos y páginas en el
apéndice de `docs/ESTILO-LAMINAS.md`; el botiquín de recreo, con el Real Decreto 339/2021 (arts. 13.2 y 24). La Guía no
está en el repositorio. Todo con marco completo, `data-parte` y los parámetros de antes; tests en
`tests/laminas-sanidad.test.js`. `PENDIENTES` de `tests/laminas-cierre.test.js` ya no lleva `hemorragia`, `quemadura`,
`radio-medico` ni `botiquin`.

| Clase | Lámina (spec) | Fichero | Notas |
| --- | --- | --- | --- |
| per-8-1 | `hemorragia` `tipos` (resaltar `arterial`, `venosa`, `capilar`) | `sanidad-c.js` | los tipos no están en la Guía (divergencia 16) |
| per-8-1 | `hemorragia` `parar` (resaltar `presion`, `elevar`, `vendaje`, `torniquete`) | `sanidad-c.js` | `vendaje` ahora es «si se empapa, más gasas encima»: el vendaje compresivo no está en la Guía |
| per-8-1 | `hemorragia` `torniquete` (**nueva**; resaltar `ultimo-recurso`, `hueso`, `hora`, `radio`) | `sanidad-c.js` | solo lo que comparten Guía y curso; sin la pauta de aflojar |
| per-8-2 | `quemadura` `grados` y `enfriar` (resaltar de antes) | `sanidad-c.js` | |
| per-8-2 | `quemadura` `gravedad` (**nueva**; resaltar `extension`, `a-bordo`, `evacuar`) | `sanidad-c.js` | regla de los nueves, palma = 1 %, criterios de tratamiento a bordo (la DGMM los pregunta) |
| per-8-2 | `golpe-calor` (**nueva**; resaltar `fresco`, `enfriar`, `beber`, `temperatura`) | `sanidad-c.js` | insolación y golpe de calor: unas 10 preguntas entre los tres bancos |
| per-8-3 | `radio-medico` (resaltar `radio`, `telefono`) | `sanidad-c.js` | añade el horario de 9:00 a 15:00 (lo preguntan Andalucía y la DGMM) |
| per-8-3 | `botiquin` (resaltar `zonas-1-4`, `zonas-5-7`, `guia`) | `sanidad-c.js` | añade A, B y C con tripulación profesional y la infracción por caducidad |
| per-8-9 | `hipotermia` `postura: 'atender'` (**nueva**) | `sanidad-c.js` (lo llama `hipotermiaC`) | atender al rescatado: unas 12 preguntas entre los tres bancos |

Las cuatro láminas nuevas se han añadido como pasos `ilustracion` en `data/curso/per.json` (per-8-1 tras la lámina
`parar`; per-8-2 tras «Quemaduras graves» y tras «Insolación: qué hacer»; per-8-9 tras «Bebida caliente, nunca
alcohol»), cada una con su pie. El texto de las clases no se ha tocado.

### Divergencias para que decida el autor (no resueltas en silencio)

1. **Aflojar el torniquete.** Guía, cap. 7, pág. 149: «Aflojar el torniquete cada 15 minutos para que circule la sangre
   por el resto del miembro. Si continúa la hemorragia, volver a comprimir transcurridos 30 segundos.» Curso, per-8-1
   («El torniquete, el último recurso»): «se **anota la hora** y **no se afloja**: lo retira el personal sanitario», y su
   «ojo»: «Aflojar el torniquete cada cierto tiempo es un consejo antiguo: hoy no se hace.» (criterio actual: ERC/TCCC).
   **No todos los bancos están con el curso.** La DGMM pregunta justo esto citando la Guía: dgmm-per-2021-04-75, «Según
   la Guía Médica del Instituto Social de la Marina, ¿cada cuánto tiempo se debe aflojar un torniquete…?», y da por buena
   «a) Cada cuarto de hora» («d) No se debe aflojar nunca» es falsa para ese tribunal). dgmm-per-2022-04-77 da por
   correcta «anotar la hora en que se coloca y mantener fría la parte inferior del miembro» (el frío tampoco está en el
   curso), y en dgmm-per-2022-06-32 la opción falsa es «aflojarlo cada 20 minutos… transcurrido 1 minuto» (falsa por las
   cifras, no por aflojar). La lámina no dibuja ni aflojar ni no aflojar. Hace falta decidir qué dice la clase, y la
   explicación de esas preguntas de la DGMM, sabiendo que ese tribunal sigue la Guía.
2. **Dónde va el torniquete.** Guía, pág. 146: «El torniquete debe realizarse en las zonas de los miembros donde sólo
   exista un hueso» (las figuras 7-36 y 7-37 lo ponen en el brazo con la herida en el antebrazo). Curso: «Va **5–7 cm por
   encima** de la herida (nunca sobre una articulación), con material ancho». Los 5–7 cm y el «material ancho» no están
   en la Guía; con una herida en el antebrazo o en la pierna, la Guía lo sube al brazo o al muslo. La lámina dibuja «en
   el brazo o el muslo (un solo hueso), entre la herida y el tronco».
3. **El torniquete como primera medida y la presión sobre la arteria.** La Guía (págs. 146-147) admite el torniquete
   «como primera medida sólo ante hemorragias muy profusas (por ejemplo, la amputación de una extremidad)» y pone antes
   un 2.º método, la «presión sobre la arteria» (puntos de compresión, fig. 7-35). Ni el curso ni la lámina los cuentan.
4. **Minutos de presión y vendaje compresivo.** Guía: presión «10 minutos mínimo, sin levantar las gasas» (pág. 26).
   dgmm-per-2025-06-31 da por buena «comprima fuertemente… al menos 4 o 5 minutos, pudiendo aplicar posteriormente un
   vendaje compresivo». El curso dice «Cuando ceda, mantén un vendaje compresivo»; la Guía no habla de vendaje
   compresivo (sí de «añadir más gasas sin retirar las anteriores»). Dibujado: 10 min y «más gasas encima».
5. **Elevar el miembro.** La Guía lo pide (págs. 26 y 145, salvo dolor importante) y el examen también; la nota del profe
   de per-8-1 recuerda que el ERC 2025 ya no lo incluye. Dibujado, como en el curso.
6. **Sangrado por la nariz** (no hay lámina). Guía, pág. 144: cabeza inclinada hacia delante, «Apretar ambos orificios
   nasales, cerca del hueso de la nariz, unos 10 minutos». Curso: «pinza la **parte blanda de la nariz** 10–15
   minutos». Baleares da por buena «entre 5 y 10 minutos». Zona y minutos distintos.
7. **Quemadura térmica: cuánto enfriar.** Guía, cap. 2, pág. 40: «Enfríe las áreas quemadas con agua fría durante unos
   minutos.» Curso: «al menos 10 minutos y, mejor, 20» (ya lo avisa su «ojo»). La lámina dice «Agua fría, ya», sin
   minutos.
8. **Tercer grado.** Guía, pág. 150: «Provoca una lesión negruzca que no duele.» Curso: «Piel **blanquecina, amarillenta
   o negruzca**… Es grave siempre». Dibujado solo «negruzca, no duele»; «grave siempre» no está en la Guía (sí que las de
   más del 1 % se evacúan).
9. **Química en el ojo.** Curso: «**Nunca agua oxigenada** en el ojo» y 15 minutos como mínimo. La Guía no habla del agua
   oxigenada en el ojo (no se dibuja) y pide 15-20 minutos (dibujado «15–20 min»).
10. **Golpe de calor.** Guía, pág. 49: «Baje la temperatura hasta los 39 °C y contrólelo cada 10 minutos… No continúe
    enfriando cuando la temperatura alcance los 38,5 °C»; de beber, suero oral en agua fresca. Curso: «Para de enfriar
    cuando la temperatura baje de unos 39 °C, sin llegar a 37 °C», «lo más rápido es sumergirlo hasta el cuello» y «agua a
    sorbos». Dibujado lo de la Guía (39 y 38,5 °C, suero oral); la inmersión no está en la Guía (sí en las
    recomendaciones actuales para el golpe de calor por esfuerzo): no se dibuja.
11. **Radio-Médico: canal 16 y Salvamento Marítimo.** Curso: «en VHF, llamada por el canal 16» y «coordinado con
    Salvamento Marítimo». La Guía (cap. 4) solo dice «a través de las estaciones radiocosteras» y no nombra a Salvamento.
    Baleares da por buenas las dos cosas (bal-per-2018-04-e-31, «por el canal 16 de VHF»; bal-per-2017-12-b-32, «Puede
    coordinarse con Salvamento Marítimo»). No se dibujan: falta otra fuente.
12. **Dónde se consigue la Guía.** Curso: «Se **descarga gratis desde la web del ISM**». La Guía dice que es «distribuida
    de forma gratuita» y que el ISM la facilita a los armadores en las inspecciones anuales; no habla de la descarga. La
    lámina dice «la edita el ISM, gratuita».
13. **Botiquín en las zonas 5 a 7.** El curso dice «muy recomendable»; el RD 339/2021 no dice nada. La lámina: «la norma
    no lo exige».
14. **Hipotermia y café.** Guía, cap. 2, pág. 48: «No le dé bebidas alcoholicas ni café, y que no fume»; pero en las
    congelaciones (cap. 7, pág. 194): «bebidas calientes (sopa, té, café) muy azucaradas». La lámina `atender` sigue el
    cap. 2. El curso no habla del café.
15. **Saltar al agua** (lámina `hipotermia` `saltar`, ya migrada). Guía, anexo 10, pág. 440: no desde más de 5 metros y
    «Mantener los codos a los lados tapando la nariz y la boca con una mano mientras se sujeta la muñeca o el codo
    firmemente con la otra mano». Curso y lámina: «sujeta el chaleco con el otro brazo cruzado». No cambiado.
16. **Hemorragia: tipos.** La Guía no describe arterial, venosa ni capilar; la lámina sigue a la clase (y a las respuestas
    de los tres bancos). Para una fuente escrita, la Guía Médica Internacional de a Bordo (OMS/OMI).

## Pendiente

- Los 15 tipos que siguen en `PENDIENTES` (`cubierta`, `timon`, `muerto-boya`, `nudos`, `tenedero`, `fondeo-gira`,
  `revision-salida`, `reflector-tormenta`, `gobierno-rabeo`, `atraque`, `varada-abordaje`, `achique-sentina`,
  `barometro-tendencia`, `mar-crece`, `prevision-salida`).
- Las divergencias de sanidad de arriba, para el autor.
- Capturas: scratchpad `lcierre-capturas/` (tanda de cierre) y `lsan-capturas/` (sanidad).
