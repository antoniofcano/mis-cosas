# Estilo de las láminas («estilo C»)

Las láminas son la explicación dibujada de **una idea**. Se presentan como en un material didáctico —una frase clave
grande, una figura que muestra la regla, cifras en recuadros y una nota para recordar— con la **piel gráfica de una carta
náutica**: papel crema, tinta azul marino, magenta de carta, marco con graduación, punteado y rayado, líneas de agua
discontinuas, rotulación con serifa, ritmos de luz y ángulos en monoespaciada, cartelas con doble filete y cotas de
ángulo y distancia con sus líneas de referencia.

La referencia visual son las maquetas «C» (marcas cardinales y luces de un buque de motor). Las láminas piloto ya
migradas están en la tabla del final; las demás siguen con su dibujo antiguo hasta que se rehagan (la migración es
gradual: nada se rompe si una lámina no tiene marco).

## Dónde está cada cosa

| Pieza | Fichero |
| --- | --- |
| Colores (claro y oscuro) y tipografías | `styles/laminas.css` (variables `--lc-*`) |
| Piezas de dibujo (marco, cartela, cotas, ondas, tierra, reloj, rosa, barco…) | `src/illustrations/estilo-c.js` |
| Etiquetas que no se pisan (láminas de carta con muchas cotas) | `junto()` y `colocaEtiquetas()` de `src/illustrations/estilo-c.js` |
| Láminas fijas de carta del PY (enfilación, dos demoras, estima) | `src/illustrations/carta-c.js` |
| Ejercicios de carta resueltos paso a paso (extracto de carta y los tres nortes, un dibujo por paso) | `src/illustrations/carta-pasos-c.js` (ver docs/CARTA-RESUELTOS.md, con su apéndice de fuentes) |
| Láminas fijas de meteorología y mareas del PY (Buys-Ballot, brisas, frentes en corte, vivas y muertas) | `src/illustrations/meteo-c.js` |
| Láminas fijas de seguridad del PY (movimientos, búsqueda, fuego) | `src/illustrations/seguridad-c.js` |
| Banderas del Código Internacional y señales acústicas (láminas `bandera` y `sonido`) | `src/illustrations/senales-c.js` |
| Señales de peligro del Anexo IV: índice, cuatro hojas y cada señal sola (lámina `socorro`, pictogramas también para las tarjetas) | `src/illustrations/socorro.js` |
| Escalas Beaufort y Douglas (lámina `beaufort`, con `escala: 'douglas'`) | `src/illustrations/meteo.js` |
| Electrónica del PY: radar, racon y SART, GNSS, cartas raster y vectorial, AIS | `src/illustrations/electronica-c.js` |
| Coordenadas (esfera, latitud, longitud, meridiano del lugar, diferencias) | `src/illustrations/coordenadas-c.js` |
| Balsa salvavidas (zafa, inflado, adrizar, lanzar) | `src/illustrations/balsa-c.js` |
| Marcos de esas láminas del PY (los demás, en `marcos.js`) | `src/illustrations/marcos-py.js` |
| Cola del PY: humedad, psicrómetro, nubes, olas y modelos de viento / helicóptero, chaleco y arnés, superficies libres y husos (tests en `tests/laminas-py-cola.test.js`) | `src/illustrations/py-cola-meteo-c.js` / `src/illustrations/py-cola-c.js` |
| Anverso de las tarjetas de memoria (y su CSS `.tc-*`, al final de `styles/laminas.css`) | `src/illustrations/tarjetas-c.js` |
| La carta de la derrota de Hoy y la Travesía (fondo, veriles, patas, marco, rosa y cartela; los faros son HTML encima) y el CSS de las dos pantallas (bloque «Hoy y la Travesía en estilo C» de `styles/laminas.css`) | `src/illustrations/derrota-c.js` (tests en `tests/hoy-travesia-c.test.js`) |
| Luz que destella y cronograma del ritmo | `luzC()` y `cronoC()` de `src/illustrations/lights.js` |
| Marca de balizamiento (castillete, tope, franjas) | `marcaC()` de `src/illustrations/buoys.js` |
| Textos del marco de cada lámina (`titulo`, `clave`, `nota`, `datos`, `alt`) | `src/illustrations/marcos.js` |
| Marco HTML (eyebrow, título, frase clave, figura, datos, nota) | `src/ui/lamina-marco.js` |
| Láminas animadas: pistas puras (evolución, hombre al agua, hélice, borrasca y anticiclón) | `src/illustrations/animaciones/` (registro en `index.js`, piezas comunes en `pista.js`) |
| Reproductor de las animaciones (controles, reloj, pausa fuera de pantalla) | `src/ui/animacion.js` (CSS `.ani-*` al final de `styles/laminas.css`) |
| Modelo de maniobra (curva de evolución, hombre al agua, andar de la hélice) | `src/nautical/maniobra.js` |
| Tests del estilo | `tests/laminas-estilo.test.js` |
| Tests de las animaciones (física, fotogramas, reproductor) | `tests/animaciones.test.js` |
| Láminas fijas del PER: ritmos de las luces, regiones A y B, amarras, riesgo de abordaje, jerarquía (Regla 18) y DST (Regla 10) | `src/illustrations/per-c.js` (registro en `per-renderers.js`) |
| Luces y marcas de los 32 tipos de buque (lámina `buque` y anverso de la tarjeta) | `src/illustrations/buques-c.js` |
| Ciaboga (animada) y desatraque (interactivo y animado); su modelo | `src/illustrations/animaciones/ciaboga.js`, `src/illustrations/interactivas/desatraque.js`; `src/nautical/maniobra-puerto.js` |
| Marcos de las láminas del PER de esa tanda | `src/illustrations/marcos-per.js` |
| Tests de las láminas del PER (estilo, marcos, hechos del RIPA, física de la ciaboga y del desatraque) | `tests/laminas-per.test.js` |
| Tanda de cierre: ayudas comunes de las láminas de lección (lista, textos, panel de notas, partes que se resaltan) | `src/illustrations/kit-lecciones-c.js` |
| Tanda de cierre: carta del PER (márgenes, transportador, milla, rumbo directo, estima, traslado de demora, tangente, veriles, oposición y enfilación) | `src/illustrations/per-cola-carta-c.js` |
| Tanda de cierre: reglamento, maniobra, casco, seguridad y meteorología del PER (definiciones del RIPA, capear y correr, fondeo, estructura, rolar, cabos, remolque, hipotermia) | `src/illustrations/per-cola-c.js` |
| Tanda de cierre: legislación del PER (zonas, dotación por zona, playas, vertidos, tanque, basuras, posidonia, banderas, pabellón; puerto comercial, seguro, contaminación, auxilio) y el dibujo de la interactiva de la playa | `src/illustrations/per-cola-normativa-c.js`, `src/illustrations/per-cola-normativa-b-c.js` |
| Tanda de cierre: cálculo del PER (declinación anual, cuadrantal, demora y marcación, calidad del corte) | `src/illustrations/per-cola-calculo-c.js` |
| Tanda de cierre: extintor y avisos a los navegantes del PY | `src/illustrations/py-cierre-c.js` |
| Ciaboga con dos hélices (animada) | `src/illustrations/animaciones/ciaboga-dos.js` |
| Miniatura legible de un buque (mapas «Jugar», «Viene de», «No lo confundas con») | `miniaturaBuque()` de `src/illustrations/buques-c.js` |
| Marcos de la tanda de cierre | `src/illustrations/marcos-cierre.js`, `marcos-cierre-b.js`, `marcos-normativa.js` |
| Tests de la tanda de cierre (estilo, marcos, cifras, reducir movimiento, miniaturas, pendientes) | `tests/laminas-cierre.test.js` |
| Sanidad a bordo del PER: hemorragias (tipos, cómo pararlas, torniquete), quemaduras (grados, agua, gravedad), golpe de calor, Radio-Médico, botiquín y atender al rescatado con hipotermia; sus marcos y sus tests | `src/illustrations/sanidad-c.js`, `marcos-sanidad.js`; `tests/laminas-sanidad.test.js` |

## Paleta (variables `--lc-*`)

| Variable | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--lc-fondo` | `#f3efe2` | `#0f1b2b` | fondo del marco |
| `--lc-papel` | `#f8f5ea` | `#14263c` | papel de la figura, cartelas, recuadros |
| `--lc-tinta` | `#1b2a41` | `#d7e4f3` | trazos y texto |
| `--lc-apagado` | `#5a6678` | `#9fb3c9` | texto secundario |
| `--lc-magenta` | `#a8265f` | `#e47aae` | lo que hay que mirar: arco de tope, flecha del reloj, frase clave |
| `--lc-amarillo` / `--lc-negro` | `#e0b63a` / `#1b2a41` | `#e2b43a` / `#05090f` | colores de marca IALA |
| `--lc-agua` / `--lc-agua-2` / `--lc-linea-agua` | `#cfe0ea` / `#dbe8ef` / `#7fa6c4` | `#173653` / `#1b3d5c` / `#4f7aa0` | mar y líneas de agua |
| `--lc-tierra` | `#e8dcb8` | `#3a3622` | tierra (con punteado) |
| `--lc-verde` / `--lc-verde-texto` | `#46a877` / `#17663c` | `#2f9e6a` / `#6fe0a2` | sector o marca verde / texto verde |
| `--lc-rojo` / `--lc-rojo-texto` | `#d9605a` / `#a32019` | `#c24a4a` / `#ff9a9a` | sector o marca roja / texto rojo |
| `--lc-naranja` | `#e07b2a` | `#cf6f26` | humo, lona y balsa salvavidas (relleno, nunca texto) |
| `--lc-casco` | `#e9e3d0` | `#2a4261` | casco en planta |
| `--lc-noche`, `--lc-luz-*` | | | escenas de noche y luces (siempre oscuras) |

- El oscuro sigue a `prefers-color-scheme` salvo que la app fuerce el claro (`data-theme="light"`), como
  `styles/app.css`; `data-theme="dark"` también lo fuerza.
- **Nunca un color fijo** dentro de un dibujo en estilo C: siempre `T.*` de `estilo-c.js` (que son `var(--lc-*)`). El
  test lo comprueba en las láminas piloto.
- Contraste AA (4,5:1) del texto sobre su fondo en los dos modos: tinta, apagado, magenta, verde-texto y rojo-texto
  sobre papel y fondo. Lo comprueba el test. Los colores de relleno (verde, rojo de un sector) no llevan texto encima:
  el texto va en una cartela de papel.

## Tipografía

- **Serifa** (`--lc-serif`: Georgia y sus equivalentes): títulos, nombres, notas y subtítulos de cartela (cursiva).
- **Monoespaciada** (`--lc-mono`): ritmos de luz (`Q(6)+LFl 15 s`), ángulos (`112,5°`), horas, alturas y cifras.
- **Versalitas espaciadas** (`estilo: 'cap'`): la primera línea de una cartela (`VERDE`, `ALCANCE`) y el eyebrow.
- Dentro del SVG, la familia se pone con clase (`lc-serif`, `lc-mono`, `lc-sans`) y el tamaño con `font-size`.

## Reglas

1. **Una idea por lámina.** Si una lámina quiere enseñar dos cosas, son dos láminas (o dos vistas de una interactiva).
   El título dice de qué es; la frase clave dice la regla en una línea.
2. **Texto mínimo dentro del SVG: 10,5 px efectivos a 360 px de ancho.** En el móvil la figura se dibuja a unos 328 px
   (360 menos 16 px de margen a cada lado) y nunca más alta de unos 430 px. Tamaño efectivo =
   `font-size × min(328 / anchoViewBox, 430 / altoViewBox)`. Con el viewBox de referencia (358 de ancho) eso pide
   `font-size ≥ 11,5`: usa `TXT.min` o más. El test mide todos los `<text>` de las láminas piloto.
3. **Trazos de 1 a 1,6 px.** Los filetes finos de 0,5–0,7 son solo decoración (doble filete, líneas de referencia,
   graduación); lo que se mira (un sector, una derrota, una flecha) va a 1,4–1,6, y solo lo protagonista más grueso.
4. **Qué va en el SVG y qué en el HTML.** En el SVG, solo lo que necesita estar en su sitio: rótulos de partes, cotas,
   cartelas, ritmos, números de paso. Todo lo demás —título, frase clave, cifras, nota, explicación larga— va en el
   marco HTML (se lee mejor, se agranda con el zoom del sistema y lo lee el lector de pantalla).
5. **Nada importante solo por color.** Las marcas laterales se distinguen por forma (cilindro / cono) y rótulo; los
   sectores de luz llevan su cartela («VERDE · estribor»); las cardinales, sus conos y su reloj.
6. **Texto alternativo obligatorio**, útil y concreto: qué se ve y qué enseña («Buque de motor visto desde arriba con
   sus sectores: verde a estribor, roja a babor…»), no «Ilustración». Es el `aria-label` del SVG y el `alt` del marco.
7. **Nada de emojis** (ni en el SVG ni en los textos): números de paso con `paso()`, flechas dibujadas con `flecha()`.
   `tests/iconos.test.js` vigila `src/ui` y `src/illustrations`.
8. **Animación**: solo donde el movimiento es la idea (una maniobra, un fenómeno), con el reproductor común (ver
   «Láminas animadas»). Ninguna información depende de la animación: el dibujo parado (miniatura, «reducir movimiento»)
   es su fotograma final, con todas las cotas, y los pasos se leen escritos. Las animaciones SMIL antiguas (luces que
   destellan…) se conservan.
9. **Corrección**: la verdad es la norma y la matemática. Cada lámina se comprueba contra su fuente (apéndice).
10. **Parametrización**: al rehacer una lámina se conservan su `tipo`, sus parámetros, sus variantes, sus `data-parte`
    (los usan las clases «toca en el dibujo» y el resaltado) y su interacción. `validSpec` sigue aceptando las specs.

## Piezas de `estilo-c.js`

```js
import { T, TXT, lienzo, cartela, etiqueta, cota, cotaArco, referencia, flecha, ondas, tierra, reloj, rosaNorte, paso, barco, rotulo } from './estilo-c.js';

const { out, pt, ray, cierra } = lienzo(358, 300, 'Texto alternativo útil');   // abre el SVG con patrones y papel
out.push(tierra('M0 0 H70 …Z', pt));              // tierra con punteado
out.push(ondas(6, 352, 240));                      // líneas de agua discontinua y punteada
out.push(cotaArco(179, 160, 141, 0, 112.5, '112,5°'));  // arco de cota con topes y etiqueta mono
out.push(cartela(229, 119, 'VERDE', 'estribor', { color: T.verdeTxt, p: 'verde' }));
out.push(reloj(124, 58, 25, 90));                  // esfera con flecha magenta al este
out.push(cierra());                                // marco con graduación y </svg>
```

- `lienzo()` da ids estables a los patrones (el mismo dibujo, el mismo id): la imagen fija de una lámina interactiva
  sigue siendo idéntica a su dibujo en el estado inicial.
- `p` en cualquier pieza le pone `data-parte` (resaltado y «toca en el dibujo»).
- En las láminas de carta, donde las líneas salen en cualquier dirección (rumbos, demoras, corrientes), las etiquetas no
  se colocan a mano: `junto(a, b, texto)` da posiciones candidatas pegadas a un segmento (a los dos lados, a lo largo y
  pasada la punta) y `colocaEtiquetas(peticiones, { W, H, segs, cajas })` elige para cada una la primera que cabe, no
  corta ninguna línea de `segs` ni tapa otra etiqueta o una zona de `cajas` (la rosa del norte, una cartela). Con `ref`
  la etiqueta se une a su punto con una línea de referencia; con `rotulo` es texto suelto en cursiva.

### Convenios de las láminas de carta

- Rumbos, demoras y ángulos en monoespaciada y con tres cifras (`Rv 040°`, `Dv 147°`); los nortes y ángulos pequeños
  se exageran (×3, o menos si no caben) y la lámina lo dice (`ángulos ×3`).
- Signos del examen: E (+), W (−); `Ct = dm + Δ`; `Rv = Ra + Ct`; `Dv = Da + Ct`; `Rs = Rv + Ab` con el abatimiento
  positivo si el viento entra por babor; la corriente se nombra por hacia dónde va (Rc) y el viento por de dónde viene.
- Vectores como en el trazado en la carta: rumbo de superficie con una punta, efectivo con dos (en magenta: es la línea
  que se dibuja) y corriente con tres; la proa (Rv), a trazos con el barco. Las líneas de posición se trazan desde el
  objeto con la demora opuesta (Dv ± 180°); la situación es un círculo con punto.

## Láminas animadas

El equivalente a un vídeo corto, pero dibujado, controlable y calculado: cada animación sale de una **función pura del
tiempo** con la física del dominio (`src/nautical/*`), no de fotogramas clave pintados a ojo. La misma función dibuja
cualquier instante, alimenta los tests y da la imagen fija.

- **Pista** (`src/illustrations/animaciones/pista.js`): `{ duracion, hitos: [{ t, nombre, texto }], tFijo, svg(t),
  cambios(t) }`. Los elementos que se mueven llevan `data-ani="clave"` y `cambios(t)` da sus atributos en el instante t
  (`texto` para el contenido de un `<text>`); `svg(t)` se construye con esos mismos cambios (`el()`), así que no
  pueden desacompasarse. `ritmo()` hace tramos a cámara lenta (el timón, la popa que abre) y deprisa (navegar).
- **Reproductor** (`src/ui/animacion.js`): `requestAnimationFrame`; en cada fotograma solo escribe los atributos que
  cambian (con caché: nunca rehace el SVG). Controles de 44 px: paso anterior, reproducir/pausa, paso siguiente,
  velocidad 0,5×/1×/2× (`aria-pressed`) y deslizador de tiempo con `aria-valuetext` («Paso 3 de 6: 90°: avance y
  traslado, a los 18 s»), con marcas de los pasos; debajo, el paso vigente escrito y anunciado (`aria-live`).
  `bucle: true` en la pista la hace volver a empezar.
- **Arranque y pausa**: en la galería y en clase arranca sola cuando se ve; en la explicación de una pregunta, no. Se
  para sola cuando la lámina sale de la pantalla (`IntersectionObserver`) o la pestaña se oculta, y sigue al volver si
  estaba en marcha (pausada a mano, no). Con **«reducir movimiento»** no arranca: enseña el fotograma fijo (el final,
  con todos sus rótulos) y el control paso a paso; se puede reproducir a mano.
- **Láminas con mandos**: la definición interactiva lleva `animacion: { pista(estado, resultado), mando? }` y su
  `dibujar(…, { t })` pinta el instante t. Mover un mando carga la pista del nuevo estado. Con `mando` (la hora de la
  marea) el tiempo es ese mando: se mueven a la par y, al parar, la lectura y las casillas se ponen al día.
- **Imagen fija**: `renderIllustration` da `svg(tFijo)` (galería, miniaturas, tarjetas). En las interactivas, la de
  siempre (el estado de la spec).

| Lámina | Qué se mueve | Hitos |
| --- | --- | --- |
| `evolucion` | el yate (a escala, con su pala del timón), su estela y la de la popa | rumbo inicial · todo a estribor · la popa abre · 90°: avance y traslado · 180°: diámetro táctico · 360°: diámetro final |
| `hombre-al-agua` (`boutakow`, `anderson`, `scharnow`) | el yate con su estela (banda de agua batida), el timón rotulado, el náufrago | caída y timón a su banda · 60° / 240°: a la otra · 20° antes del opuesto: a la vía · rumbo opuesto sobre la estela · recogida |
| `helice` | la hélice vista desde popa girando y el barco que cae, con las estelas de proa y popa | máquina · la popa cae · la proa ha caído |
| `meteo` `borrasca` / `anticiclon` | 16 partículas de aire en espiral con su cola | gira · cruza las isobaras 25° · converge y asciende (o desciende y diverge) |
| `marea` (`curva`, `duodecimos`, `sonda`) | el agua bajo la curva, las franjas de los doceavos que se llenan, el agua del corte, el barco que flota y las cotas | una por hora, de la bajamar a la pleamar |
| `corriente`, `abatimiento` | el barco con la proa al Rv, el fantasma sin corriente, la corriente y el efectivo que crecen | salida · avanza y lo arrastra · media hora · una hora · en la carta |
| `ciaboga` | el yate (con su pala), las estelas de proa y popa, la orden de máquina y timón, la flecha de la presión lateral dando atrás | parado, en poco sitio · avante, todo a estribor · atrás, todo a babor · otra vez avante · al rumbo opuesto |
| `desatraque` (con mandos: viento, esprín, máquina) | el barco que gira alrededor de la defensa, el esprín que se tensa y se larga, el empuje de la máquina | atracado · máquina · pivota en la defensa · abierta: largar · sale atrás o avante (o «se queda», «el viento lo separa») |
| `ciaboga-dos-helices` (`banda: 'er'` o `'br'`) | el barco que gira casi sobre sí mismo con un motor avante y el otro atrás; arriba, fijos, los montajes de giro al exterior y al interior | parado · un motor avante y el otro atrás · cae hacia la banda del que va atrás · al rumbo opuesto |

### Hipótesis físicas (para comprobar contra el temario)

- **Yate de ejemplo**: 12 m de eslora a 6 nudos (3,09 m/s). Rumbo con el modelo de Nomoto de primer orden
  (T·ṙ + r = δ·U/R, T = 3,5 s; R = 1,5 esloras con todo el timón), ángulo de deriva de hasta 15° que se desarrolla en
  6 s, pérdida de velocidad del 30 % en el giro y desplazamiento lateral inicial hacia fuera que se apaga en 3 s; el
  timón va de la vía a la banda en 1,7 s. Resultado: avance ≈ 2,7 esloras, traslado ≈ 1,2, diámetro táctico ≈ 3,1 y
  final ≈ 2,9 (el táctico, algo mayor, como dice el temario); la popa abre hacia la banda contraria.
- **Hombre al agua**: con ese mismo modelo, la curva de Boutakow con el cambio a 60° y la de Scharnow con el cambio a
  240°, a la vía 20° antes del rumbo opuesto, vuelven solas a menos de media eslora de la derrota inicial al rumbo
  opuesto (en un barco real el ángulo se ajusta en pruebas). Anderson: a la vía a los 250° y aproximación con poco
  timón. La persona queda donde cayó, porque la referencia es el agua (la corriente los arrastra igual a los dos).
  Boutakow y Anderson: acción inmediata, cae por la aleta de estribor; Scharnow: acción retrasada, cayó unos 25 s antes.
- **Hélice**: la banda es la de `src/nautical/helice.js` (dextrógira: avante la popa a estribor, atrás a babor). El
  barco gira alrededor de su punto de giro (a un tercio de la eslora desde la proa avante, desde la popa atrás). Avante
  la popa cae a 1,2°/s y menos con arrancada; atrás, a 4,5°/s: en 12 s, unos 40°. Son valores cualitativos.
- **Borrasca y anticiclón**: espirales logarítmicas que cortan las isobaras con el ángulo de rozamiento de
  `src/nautical/meteo.js` (25°), a velocidad constante (las isobaras del dibujo están igual de separadas).
- **Marea**: altura con la fórmula de la tabla (`correccionTabla`), dos segundos por hora; las franjas de los doceavos
  se llenan con la curva. **Corriente**: el barco está en cada instante en t·(superficie + corriente): velocidad
  constante y triángulo que crece sin deformarse.
- **Ciaboga** (`src/nautical/maniobra-puerto.js`): el mismo yate y el mismo Nomoto (T = 3,5 s, R = 1,5 esloras). Avante con
  poca máquina (0,9 m/s) el timón trabaja con la corriente de la hélice (1,6 m/s más la arrancada) y la presión lateral
  lleva la popa a estribor a 1,2°/s; atrás (0,7 m/s) el timón gobierna la mitad y al revés, y la presión lateral lleva la
  popa a babor a 4,5°/s. Tramos de 7 s avante y 8 s atrás hasta pasar del rumbo opuesto: tres paladas atrás, 177° en
  50 s, en una dársena de dos esloras (la curva de evolución necesitaría 3,1). Valores cualitativos.
- **Desatraque**: el barco gira alrededor de la defensa (la amura con el esprín de proa, la aleta con el de popa) con
  respuesta de primer orden (T = 3,5 s, hasta 6°/s) que se frena al tensarse el esprín: abre unos 25° la popa o 20° la
  proa; al largarlo sale atrás o avante a 0,8 m/s con el timón a la vía. Qué pasa en cada caso lo decide
  `src/nautical/desatraque.js` (no cambia); con viento de la mar y el esprín de popa la proa se abre unos 6° y el viento
  la devuelve.
- **Ciaboga con dos hélices** (`src/illustrations/animaciones/ciaboga-dos.js`): sin arrancada, el barco gira alrededor
  de su centro con respuesta de primer orden (T = 2 s) hasta 6°/s y para en el rumbo opuesto (unos 32 s). Lo cualitativo
  (hacia dónde cae y por qué ayuda el giro al exterior) es del temario; los grados por segundo son ilustrativos y no se
  han contrastado con ninguna fuente: dependen del barco y de la máquina.

## Mapas de conceptos y chuletas

Los mapas de conceptos (`#/<tit>/mapas`) y la chuleta de cada tema (`#/<tit>/temario/<ut>/chuleta`) llevan la misma
piel: tokens `--lc-*`, títulos en serifa, cifras en monoespaciada, cartelas con doble filete. CSS `.mc-*` y `.mapa-*` al
final de `styles/laminas.css`; tests en `tests/mapas-chuletas-c.test.js`.

- **Mapa entero** (`mapaSvg()` de `src/illustrations/mapa-c.js`): fondo de carta con su marco; cada concepto, una
  cartela que es un enlace (`<a>` con `aria-label` «nombre: qué es») para explorarlo; el que se mira, en magenta
  (`aria-current`). Cada relación es una flecha con su **número** en una etiqueta de cota; cada confusión, una línea
  magenta a trazos con su **letra**. El texto de las relaciones (largo) va debajo, en HTML, con el mismo número o letra:
  el dibujo cabe y el texto se lee. Dos aristas entre los mismos conceptos van en paralelo. El SVG es `role="group"`
  (con `role="img"` los enlaces desaparecerían del lector de pantalla).
- **Texto mínimo en el mapa**: se pinta a escala 1 (`width` = ancho del viewBox) en un recuadro que se desplaza con el
  dedo; en el escritorio se agranda hasta 1,25 veces, nunca se encoge. Así el texto efectivo es su `font-size` (13,5 los
  nombres, 11,5 los números) también a 360 px. Al abrirlo, el concepto actual queda centrado.
- **Explorar**: el concepto en un marco de lámina (eyebrow, título, qué es, su lámina) con enlaces a su clase, al mapa
  entero y a la **ficha de la idea** (`hrefFicha(tit, id, 'mapas/<mapa>')`) cuando el banco activo tiene etiquetas y la
  idea se enseña en esa clase; sus vecinos («Viene de», «Lleva a», «No lo confundas con», este a trazos magenta).
- **Chuleta**: una hoja de papel con cabecera (eyebrow, título del tema) y cada clase numerada; «Para recordar» en
  cartela y «Trampa» con borde magenta a trazos (rótulo con icono, no solo color). Botón «Imprimir / guardar PDF»
  (`window.print()`).
- **Impresión** (`@media print`): A4; todos los `--lc-*` pasan a blanco y negro en cualquier tema (también con el
  oscuro del sistema o forzado); dos columnas; nunca se parte un punto, una regla ni una trampa, y el título de la clase
  no se queda al pie; arriba, la titulación (nombre y sigla), «Chuleta del tema N» y la fecha. Ningún nombre de centro
  de formación.

## El marco de la lámina (HTML)

`src/illustrations/marcos.js` da, para cada spec migrada, `{ tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }`.
`src/ui/lamina-marco.js` lo pinta alrededor de la figura (estática o interactiva):

- **eyebrow** «Lámina · tema» (magenta, versalitas) · **título** en serifa · **frase clave** en cursiva serif magenta con
  doble filete · la **figura** · **datos** en recuadros (cifra grande + subtítulo) · **Nota** con borde discontinuo.
- En la galería el título es el `h1` de la ficha; en una clase o en la ficha de una idea, un `h3`. En la explicación de
  una pregunta solo se ve la figura (la pregunta ya da el contexto).
- Si una lámina no tiene marco, se ve como siempre.
- Los textos se escriben a mano, en buen español, sin abreviaturas raras y con la cifra exacta de la norma.

## Cómo migrar una lámina

1. Comprueba el hecho contra la fuente y anótalo en el apéndice.
2. Redibuja con `estilo-c.js` y solo `T.*`; conserva `tipo`, parámetros, variantes, `data-parte` e interacción.
3. Escribe su marco en `marcos.js` (`titulo`, `clave`, `nota`, `datos`, `alt`).
4. Añade su spec a `PILOTO` de `tests/laminas-estilo.test.js` (texto mínimo, colores, marco, claro y oscuro).
5. Míralo a 360, 390 y 990 px, en claro y en oscuro.

## Apéndice: verificación de cada lámina

| Lámina | Hecho comprobado | Fuente |
| --- | --- | --- |
| Marcas cardinales | N: conos con la punta arriba, negro sobre amarillo, Q o VQ continuo. E: conos base con base, negro-amarillo-negro, Q(3) 10 s / VQ(3) 5 s. S: conos con la punta abajo, amarillo sobre negro, Q(6)+LFl 15 s / VQ(6)+LFl 10 s. W: conos punta con punta, amarillo-negro-amarillo, Q(9) 15 s / VQ(9) 10 s. Se pasa por el lado de su nombre; luz blanca. | Sistema de balizamiento marítimo IALA-AISM (región A), cap. 3 «Marcas cardinales»; RD 875/2014, anexo II (PER, UT 5) |
| Marcas laterales, canal y bifurcación | Región A, entrando desde la mar: babor roja, cilíndrica (o castillete con tope cilíndrico), luz roja; estribor verde, cónica (tope cónico con la punta arriba), luz verde. Numeración: impares las verdes, pares las rojas, desde la mar. Bifurcación con canal principal a estribor: roja con una banda verde ancha, tope cilíndrico rojo, Fl(2+1) R; con canal principal a babor: verde con banda roja, tope cónico verde, Fl(2+1) G. | IALA-AISM, cap. 2 «Marcas laterales» (2.1 sentido convencional, 2.2 región A, 2.3 marcas laterales modificadas) |
| Luces de un buque de motor | Tope blanca 225° (de proa a 22,5° a popa del través por cada banda); costados verde (Er) y roja (Br) de 112,5° cada una; alcance blanca 135° hacia popa. | RIPA (COLREG 72), regla 21 a, b y c; regla 23 a; anexo I §9 (corte de los sectores) |
| Cruce, alcance y vuelta encontrada | Alcance: quien viene desde más de 22,5° a popa del través del otro se mantiene apartado. Vuelta encontrada: los dos caen a estribor (babor con babor). Cruce de buques de motor: se aparta el que tiene al otro por su estribor (ves su roja), evitando cortarle la proa; el otro mantiene rumbo y velocidad. Veleros: amura distinta, se aparta el amurado a babor; misma amura, el de barlovento. | RIPA, reglas 12, 13, 14, 15, 16 y 17 |
| Partes del barco | Eslora (longitud), manga (anchura máxima), puntal (de la quilla a la cubierta principal), calado (de la flotación a la quilla), francobordo (de la flotación a la cubierta); obra viva bajo la flotación, obra muerta encima; babor a la izquierda mirando a proa, estribor a la derecha; amura (proa), través (90°), aleta (popa). | RD 875/2014, anexo II (PER, UT 1 Nomenclatura náutica) |
| Borrasca y anticiclón | Hemisferio norte: alrededor de la borrasca el viento gira en sentido antihorario y converge hacia el centro (cruza las isobaras hacia la baja presión); alrededor del anticiclón, horario y divergente. Presión menor en el centro de la borrasca, mayor en el del anticiclón. | Ley de Buys-Ballot; efecto de Coriolis y rozamiento (OMM, Manual de meteorología marina); RD 875/2014, anexo II (PER, UT 9) |
| Hélice y timón | Hélice dextrógira (gira a la derecha avante, vista desde popa): avante la popa cae a estribor (poco), atrás a babor (mucho); levógira, al revés. Timón con arrancada avante: timón a estribor, proa a estribor y popa a babor. Atrás con poca arrancada manda la hélice. | RD 875/2014, anexo II (PER, UT 7 Maniobra); presión lateral de las palas |
| Hombre al agua (animada) | Boutakow (Williamson): todo el timón a la banda de la caída; separado unos 60° del rumbo inicial, todo a la banda contraria; unos 20° antes del rumbo opuesto, a la vía y gobernar al opuesto; vuelve por su estela. Anderson (una vuelta): todo a la banda del náufrago; tras unos 250°, a la vía y parar o moderar para acercarse; la más rápida, para acción inmediata. Scharnow: todo a una banda; a unos 240°, todo a la otra; 20° antes del opuesto, a la vía; vuelve a la derrota más atrás, con menos camino recorrido: para acción retrasada, no para inmediata. Los ángulos dependen del barco; el modelo de `src/nautical/maniobra.js` los cumple. | IAMSAR, vol. III, sección 2 (persona al agua: maniobras de Williamson, de una vuelta o Anderson y de Scharnow); RD 875/2014, anexo II (PER, UT 3; PY, UT 1) |
| Curva de evolución (animada) | Al meter el timón la popa abre hacia la banda contraria y el barco se desplaza un poco hacia ella antes de caer; avance: lo que adelanta en la dirección inicial al caer 90°; traslado: lo que se separa de ella a los 90°; diámetro táctico: la separación al caer 180°; diámetro final: el del círculo ya estabilizado, algo menor que el táctico. | RD 875/2014, anexo II (PER, UT 7 «Maniobra»: curva de evolución); tratados de maniobra del buque (modelo de Nomoto de primer orden, ángulo de deriva) |
| Efecto de la hélice (animada) | Además del timón, la hélice de un barco de una hélice desvía la popa por la presión lateral de sus palas: dextrógira, avante a estribor (poco) y atrás a babor (mucho, sobre todo sin arrancada); levógira, al revés. El barco gira alrededor de su punto de giro. | RD 875/2014, anexo II (PER, UT 7 «Maniobra»: efecto evolutivo de la hélice); tratados de maniobra del buque |
| Estabilidad | Estable si M está por encima de G (GM > 0): el par adriza; GZ = GM · sen(escora) en pequeñas escoras. Subir pesos sube G y reduce GM y GZ; con G por encima de M el par vuelca. | Teoría del buque, estabilidad inicial (metacentro transversal); RD 875/2014, anexo II (PER, UT 3) |
| Marea: curva y doceavos (animada) | La altura sigue una curva aproximadamente senoidal entre bajamar y pleamar; regla de los doceavos para ~6 h: 1, 2, 3, 3, 2 y 1 doceavos de la amplitud cada hora (a las 3 h, la mitad: sen²(45°) = 0,5). Sonda del momento = sonda de la carta + altura de la marea; agua bajo la quilla = sonda − calado. | Anuario de mareas del Instituto Hidrográfico de la Marina (tabla de corrección C = A · sen²(90° · I / D)); RD 875/2014, anexo II (PER, UT 10; PY, UT 3) |
| Corrección total: los tres nortes | Ct = dm + Δ, cada uno con su signo (E +, W −); Rv = Ra + Ct; el norte de aguja queda al E del verdadero si la Ct es positiva y al W si es negativa. La declinación viene en la carta; el desvío, en la tablilla. | RD 875/2014, anexo II (PY, UT 3.2 y 4.1: corrección total por declinación y desvío); convenio del examen en `src/nautical/compass.js` |
| Rumbo, demora y marcación | Rumbo y demora se miden desde el norte de 000° a 359° en el sentido de las agujas del reloj; la marcación, desde la proa, de 0° a 180° por cada banda: Dv = Rv + M (M + a estribor, − a babor). | RD 875/2014, anexo II (PER, UT 10; PY, UT 3.3) |
| Abatimiento (babor y estribor) | Rs = Rv + Ab; Ab positivo con el viento por babor (el barco abate a estribor) y negativo por estribor; en el problema inverso Rv = Rs − Ab. | RD 875/2014, anexo II (PY, UT 3.3 «Rumbos: verdadero, de superficie y efectivo; abatimiento y deriva» y UT 4.2) |
| Corriente: efectivo y rumbo a dar | La corriente se nombra por hacia dónde va (Rc) y su intensidad en nudos; efectivo = vector superficie + vector corriente; rumbo a dar: corriente desde la salida y, con centro en su extremo y radio la velocidad del barco, corte con la línea al destino. | RD 875/2014, anexo II (PY, UT 4.5 «Corriente conocida, resolución gráfica»); triángulo de velocidades (`src/nautical/kinematics.js`) |
| Enfilación y corrección total | Ct = Dv − Da (demora verdadera de la carta menos la de aguja de la enfilación); Δ = Ct − dm. | RD 875/2014, anexo II (PY, UT 3.2 y 4.1 «Demora de aguja a una enfilación») |
| Situación por dos demoras simultáneas | Cada demora, pasada a verdadera (Dv = Da + Ct), se traza desde el objeto con la opuesta (Dv ± 180°); la situación es el corte; mejor cuanto más cerca de 90°. | RD 875/2014, anexo II (PY, UT 4.3 «Situación simultánea con dos líneas de posición») |
| Demoras no simultáneas: el traslado | Se traslada la primera línea paralela a sí misma el rumbo y la distancia navegados (Rv, Rs o efectivo, según haya viento o corriente); su corte con la segunda es la situación a la hora de la segunda. | RD 875/2014, anexo II (PY, UT 4.4 «Situación no simultánea») |
| Estima loxodrómica | Δl = D · cos R (minutos de latitud = millas); A = D · sen R (millas); ΔL = A / cos lm (minutos de longitud); tg R = A / Δl. | RD 875/2014, anexo II (PY, UT 4.8 «Derrota loxodrómica, resolución analítica»); estima por latitud media |
| Rumbo para pasar a una distancia, con viento | sen α = d / D; dejando el faro por babor Rs = Dv + α, por estribor Rs = Dv − α (la tangente es el rumbo de superficie); Ab según la banda por la que entra el viento respecto al Rs; Rv = Rs − Ab; Ra = Rv − Ct. Ejemplo: Dv 089,5°, D 10,9 M, d 4 M → α 21,5°, Rs 111°; viento del S por estribor, Ab −10° → Rv 121°; Ct +5° → Ra 116°. | RD 875/2014, anexo II (PY, UT 4.2 «Rumbo para pasar a una distancia de un punto de la costa, con y sin viento») |
| Faro por el través y derrota | El través se mide desde la proa: Dv = Rv ± 90° (+ estribor, − babor); la línea se traza desde el faro (Dv + 180°) y se corta con la derrota sobre el agua (Rs). Ejemplo: Rv 170°, viento del W por estribor, Ab −10° → Rs 160°; través de babor Dv 080°; 8,4 M a 8 nudos → 1 h 03 min. | RD 875/2014, anexo II (PY, UT 4.4 y 4.7); convenio Rs = Rv + Ab |
| Corriente desconocida | La corriente es el vector de la situación de estima (sin corriente) a la observada a la misma hora; Ihc = distancia / horas. Ejemplo comprobado: Rv 100°, 9 M desde 35°56,0′ N 005°55,0′ W → Se 35°54,4′ N 005°44,1′ W (Δl −1,6′, A 8,86 M, ΔL 10,9′ con lm 35,9°); So 35°56,6′ N 005°41,5′ W → Rc 044°, 3,0 M, Ihc 2,0 nudos. | RD 875/2014, anexo II (PY, UT 4.6 «Corriente desconocida»); cálculo con la estima por latitud media |
| Loxodrómica y ortodrómica | La loxodrómica corta todos los meridianos con el mismo ángulo y en la proyección Mercator (conforme, latitudes crecientes) es una recta; la ortodrómica es el arco de círculo máximo, la distancia más corta, y en la Mercator se curva hacia el polo. | RD 875/2014, anexo II (PY, UT 4.8 «Derrota loxodrómica»); propiedades de la proyección Mercator |
| Mareas vivas y muertas | Luna nueva y llena (sicigias): Sol, Tierra y Luna alineados, mareas vivas (más amplitud); cuartos creciente y menguante (cuadraturas): mareas muertas (menos amplitud); se alternan cada unos 15 días. Vista desde el norte, la Luna gira en sentido antihorario: cuarto creciente a 90° de la nueva en ese sentido. | Anuario de mareas del Instituto Hidrográfico de la Marina (conceptos generales); RD 875/2014, anexo II (PER, UT 10; PY, UT 4.9) |
| Ley de Buys-Ballot | Hemisferio norte: con el viento por la espalda, la baja presión queda a la izquierda y algo adelantada (el viento cruza las isobaras hacia la baja, unos 20° en la mar) y la alta a la derecha; en el hemisferio sur, al revés. | Ley de Buys-Ballot (OMM, Manual de meteorología marina); RD 875/2014, anexo II (PY, UT 2.2 y 2.3) |
| Isobaras y viento | Isobaras cada 4 hPa; gradiente horizontal de presión: isobaras juntas, más viento; giro antihorario y convergente en la borrasca, horario y divergente en el anticiclón (hemisferio norte), cruzando las isobaras (modelo de `src/nautical/meteo.js`). | RD 875/2014, anexo II (PY, UT 2.1 «Isobaras: definición y utilidad del gradiente horizontal de presión») |
| Frentes (bloque, mapa y corte) y frentes frío y cálido en corte | Frente frío: línea azul con triángulos hacia donde avanza; cuña empinada que levanta el aire cálido: cumulonimbos, chubascos, rachas; tras su paso rola el viento, baja la temperatura y sube la presión. Frente cálido: línea roja con semicírculos; rampa suave: Ci, Cs (halo), As y Ns con lluvia continua; la presión baja antes de su paso. | Símbolos de frentes de la OMM; RD 875/2014, anexo II (PY, UT 2.2 «Frente cálido, frente frío… tiempo asociado») |
| Nieblas: advección, radiación y vapor | Advección: aire templado y húmedo sobre superficie fría (la de la mar); radiación: tierra en noches despejadas y en calma, se disipa con el sol; vapor (humo de mar): aire muy frío sobre agua más templada, por evaporación. Aparecen al llegar al punto de rocío (humedad relativa 100 %; fórmula de Magnus en `src/nautical/meteo.js`). | RD 875/2014, anexo II (PY, UT 2.4 «Humedad» y 2.6 «Nieblas: clasificación según su proceso de formación») |
| Brisa marina y terral | De día la tierra se calienta más: el aire asciende sobre ella y en superficie entra del mar (virazón); de noche, al revés (terral). Circulación cerrada con retorno en altura. | RD 875/2014, anexo II (PER, UT 9; PY, UT 2.3 «Vientos característicos») |
| Movimientos del barco | Balance: escora alternativa a una y otra banda (giro alrededor del eje proa-popa), sobre todo con mar de través; cabezada: proa y popa suben y bajan (eje de babor a estribor), con mar de proa o de popa; guiñada: la proa a uno y otro lado del rumbo (eje vertical), típica con mar de popa o de aleta. | RD 875/2014, anexo II (PER, UT 1; PY, UT 1 «Estabilidad: movimientos del buque») |
| Búsqueda en cuadrado expansivo y por sectores | Cuadrado expansivo: desde el datum, giros de 90° a estribor y tramos S, S, 2S, 2S, 3S…; por sectores: tramos de radio R que pasan por el datum con giros de 120° a estribor (secuencia de sectores 0°, 240°, 120°), tres triángulos; si no aparece, se repite girado unos 30°. | IAMSAR, vol. III, sección 2 (modelos de búsqueda SS y VS); RD 875/2014, anexo II (PY, UT 1) |
| Tetraedro y clases de fuego | Combustible, comburente (oxígeno), calor y reacción en cadena; se apaga retirando el combustible, sofocando, enfriando o inhibiendo. Clases: A sólidos, B líquidos, C gases, D metales, F aceites de cocina; la E ya no es una clase. | Norma UNE-EN 2 (clases de fuego, con la modificación A1 de 2005); RD 875/2014, anexo II (PER, UT 8; PY, UT 1 «Contraincendios») |
| Viento aparente (general, ceñida, través, aleta y popa) | Aparente = real + de avance (igual y contrario a la velocidad del barco, de proa); entra siempre más a proa que el real salvo en popa cerrada; ciñendo y de través es más fuerte que el real, por la aleta y en popa más flojo; en popa, real menos velocidad. Ejemplos: real 12 kn, barco 6 kn → ceñida 45° → 16,8 kn a 30°; través → 13,4 kn a 63°; aleta 135° → 8,8 kn a 106°. | Suma de vectores (`src/nautical/viento.js`); RD 875/2014, anexo II (PER, UT 9; PY, UT 2.3) |
| Banderas del Código Internacional | A blanca y azul con cola de golondrina (buzo sumergido); B roja con cola (mercancías peligrosas); C azul-blanca-roja-blanca-azul (sí); H blanca y roja (práctico a bordo); N damero azul y blanco (no); O roja y amarilla en diagonal (hombre al agua); U cuarteles rojos y blancos (se dirige a un peligro); V blanca con aspa roja (necesito asistencia); W azul, blanca y roja (asistencia médica). NC = N encima de C, señal de peligro. | Código Internacional de Señales (señales de una letra); RIPA, Anexo IV 1 f) |
| Señales de peligro (índice, hojas y señal sola) | Las quince del punto 1 del Anexo IV, de la a) a la o): cañonazo cada minuto aprox.; sonido continuo de niebla; cohetes o granadas de estrellas rojas uno a uno; SOS por cualquier sistema; MAYDAY por radiotelefonía; NC; bandera cuadra con bola encima o debajo; llamaradas a bordo; cohete con paracaídas o bengala de mano de luz roja; fumígena de humo naranja; subir y bajar los brazos extendidos; alerta LSD (VHF canal 70; MF/HF 2187,5, 4207,5, 6312, 8414,5, 12577 y 16804,5 kHz); alerta buque-costera por Inmarsat u otro proveedor; radiobalizas; SART y otras señales aprobadas. Complementarias del punto 3: lona naranja con cuadrado y círculo negros, y colorante. Ya no figuran las alarmas radiotelegráfica y radiotelefónica. | RIPA (COLREG 72), Anexo IV, con las enmiendas de la Resolución OMI A.1004(25), de 2007, en vigor desde 2009 |
| Pirotecnia: cohete, bengala y fumígena | Cohete con paracaídas: sube 300 m como mínimo; luz roja de 30.000 cd o más durante 40 s o más; baja a no más de 5 m/s. Bengala de mano: roja, 15.000 cd o más, 1 minuto o más; sigue ardiendo tras 10 s a 100 mm bajo el agua. Fumígena flotante: humo naranja 3 minutos o más en aguas tranquilas, sin llama, no se anega; 10 s a 100 mm. Se usan por sotavento, de espaldas al viento. | Código IDS (Resolución MSC.48(66)), 3.1, 3.2 y 3.3; Orden FOM/1144/2003 (equipos de las embarcaciones de recreo); RD 875/2014, anexo II (PER, UT 8; PY, UT 1) |
| Radiobaliza (cadena de la alerta) | 406 MHz a los satélites Cospas-Sarsat con la identidad (MMSI); 121,5 MHz de recalada; 48 h o más emitiendo; zafa hidrostática y activación al tocar el agua; el centro de control español está en Maspalomas y la alerta llega a Salvamento Marítimo. Los barcos cercanos no la reciben. | Sistema Cospas-Sarsat (C/S T.001); Resolución OMI MSC.471(101) (radiobalizas de 406 MHz); RD 1185/2006 (radiocomunicaciones de recreo) |
| SART | Banda X (9 GHz); en el radar, línea de 12 puntos desde su posición hacia fuera en su misma demora; de cerca, arcos y, muy cerca, círculos; unas 96 h en espera y 8 h respondiendo; a 1 m o más sobre el agua; se enciende a mano. | Resolución OMI MSC.247(83) (respondedores de radar para búsqueda y salvamento) y A.802(19); IAMSAR, vol. III |
| Escalas Beaufort y Douglas | Beaufort en nudos: 0 calma < 1; 1 ventolina 1–3; 2 flojito 4–6; 3 flojo 7–10; 4 bonancible 11–16; 5 fresquito 17–21; 6 fresco 22–27; 7 frescachón 28–33; 8 temporal 34–40; 9 temporal fuerte 41–47; 10 temporal duro 48–55; 11 temporal muy duro 56–63; 12 temporal huracanado ≥ 64. Douglas (altura de las olas, m): 0 calma o llana 0; 1 rizada 0–0,1; 2 marejadilla 0,1–0,5; 3 marejada 0,5–1,25; 4 fuerte marejada 1,25–2,5; 5 gruesa 2,5–4; 6 muy gruesa 4–6; 7 arbolada 6–9; 8 montañosa 9–14; 9 enorme > 14. | OMM, Manual de servicios meteorológicos marinos (OMM-N.º 558), escala Beaufort; OMM-N.º 306, tabla de cifrado 3700 (estado de la mar); nombres españoles de AEMET; RD 875/2014, anexo II (PER, UT 9; PY, UT 2) |
| Radar: presentaciones, EBL y VRM | Proa arriba: la línea de proa arriba, la EBL da la marcación y la imagen gira al cambiar de rumbo; norte arriba: la EBL da la demora y la imagen no gira. Dv = Rv + M (marcación circular, o + estribor y − babor). Ejemplos: Rv 210°, 90° por estribor → 300°; 40° por babor (320°) → 170°. El VRM mide la distancia al borde más próximo del eco. | RD 875/2014, anexo II (PY, UT 3 «Radar»); convenio de rumbos de `src/nautical/compass.js` |
| Racon, SART y reflector | El racon responde con una letra Morse en línea radial detrás de su eco; la «D» (— · ·) marca un nuevo peligro o pecio. El reflector de radar es pasivo y hace visible un casco no metálico. | Recomendación IALA O-133 (marca de pecio de emergencia, racon «D»); Orden FOM/1144/2003 (reflector de radar) |
| GNSS: siglas y cálculos | XTE: distancia a la línea entre los dos WPT, con su banda (R derecha, L izquierda); BRG y DTG al WPT; COG y SOG sobre el fondo; HDG, la proa; VMG = SOG · cos(COG − BRG); TTG = DTG / SOG; ETA = hora + TTG. 1 milla = 1852 m = 10 cables. Ejemplo: 18,0 M a 6,0 kn desde las 10:20 → 3 h, 13:20; 6 · cos 20° = 5,6 kn; 0,05 M ≈ 93 m. | RD 875/2014, anexo II (PY, UT 3 «GNSS»); definiciones de las sentencias NMEA 0183 (XTE, BWC, VMG) |
| Cartas electrónicas | Raster (RNC): imagen escaneada de la carta de papel; vectorial (ENC): base de datos objeto a objeto según la norma S-57 de la OHI, por capas y con alarmas. ECDIS (homologado OMI), ECS y plotter son sistemas, no cartas. Un ECDIS con ENC oficiales al día puede sustituir al papel; con raster, necesita además cartas de papel. Las ENC oficiales españolas las produce el Instituto Hidrográfico de la Marina. | OHI S-57 y S-52; SOLAS, cap. V, regla 19; Resolución OMI MSC.232(82) (normas de funcionamiento del ECDIS) |
| AIS | Emite y recibe por VHF, canales 87B y 88B (161,975 y 162,025 MHz), la identidad, la posición (del GNSS), el rumbo y la velocidad; clase A en los buques del SOLAS, clase B en recreo. Alcance habitual de unas 20–30 millas (orientativo: el del VHF). Quien no lo lleva no aparece. | Recomendación UIT-R M.1371; SOLAS, cap. V, regla 19.2.4; RD 875/2014, anexo II (PY, UT 3) |
| Coordenadas | Ecuador y meridianos, círculos máximos; paralelos, círculos menores; latitud 0°–90° N o S, arco de meridiano desde el ecuador; longitud 0°–180° E o W, arco de ecuador desde Greenwich; meridiano superior e inferior a 180°; diferencias: mismo nombre se restan, distinto se suman, y la ΔL mayor de 180° se toma como 360° − ΔL con el sentido cambiado (100° W → 110° E: 150° W). Trópicos a 23° 27′ y círculos polares a 66° 33′ (el valor del temario; hoy la oblicuidad es de unos 23° 26′). | RD 875/2014, anexo II (PY, UT 3.1 «La esfera terrestre»); proyección ortográfica calculada en `src/illustrations/coordenadas-c.js` |
| Balsa salvavidas | La zafa hidrostática suelta la balsa a no más de 4 m de profundidad; una sola trinca, la que pasa por la zafa; el barco al hundirse tensa la boza, que dispara el inflado, y la unión débil se rompe después. Lanzarla a mano: boza a un punto fuerte, por sotavento, sacar toda la boza y dar un tirón; soltar la boza con todos dentro. Adrizarla desde la botella, a sotavento, tirando de las cinchas del fondo. | Código IDS (Resolución MSC.48(66)), 4.1.6 (zafa y unión débil); SOLAS, cap. III; instrucciones de los fabricantes (adrizado y embarque); RD 875/2014, anexo II (PY, UT 1) |
| Señales acústicas | Corta ≈ 1 s, larga 4–6 s. Maniobra: 1 corta estribor, 2 babor, 3 atrás; 5 o más cortas, duda; 1 larga, recodo. Canal angosto: 2 largas + 1 corta, alcanzar por estribor; 2 largas + 2 cortas, por babor; larga-corta-larga-corta, conformidad. Niebla (≤ 2 min): 1 larga motor con arrancada; 2 largas (unos 2 s entre ellas) parado; larga + 2 cortas, sin gobierno, restringidos, vela, pesca, remolque; larga + 3 cortas, remolcado. Fondeado: repique de ~5 s cada ≤ 1 min (≥ 100 m, además gong a popa); varado: 3 golpes, repique y 3 golpes; práctico: 4 cortas. | RIPA, reglas 32, 34 y 35 |
| Humedad relativa y punto de rocío | HR = vapor que lleva el aire / el que lo satura a su temperatura; con el mismo vapor, al enfriarse sube hasta el 100 % en el punto de rocío. Ejemplo: 20 °C con rocío a 12 °C → HR 60 % (Magnus: 14,0 / 23,4 hPa). | Fórmula de Magnus (`src/nautical/meteo.js`; OMM-N.º 8, Guía de instrumentos y métodos de observación); RD 875/2014, anexo II (PY, UT 2.4 «Humedad») |
| Psicrómetro | El termómetro húmedo marca menos por la evaporación; con el seco y la diferencia, las tablas dan HR y rocío. Ejemplo 18 / 15 °C: e = es(15) − 0,66 · 3 ≈ 15,0 hPa → HR ≈ 71–73 % («algo más del 70 %») y Td ≈ 12,6–13,1 °C («unos 13 °C»), según la constante psicrométrica (ventilado o no). | Ecuación psicrométrica (OMM-N.º 8); RD 875/2014, anexo II (PY, UT 2.4) |
| Nubes por pisos | Diez géneros: altas Ci, Cc, Cs (prefijo cirro-); medias Ac, As (alto-); bajas St, Sc, Ns; desarrollo vertical Cu y Cb (yunque). Alturas del examen: más de 6000 m, 2000–6000 m, menos de 2000 m. La OMM da pisos que se solapan (en latitudes medias, altos de 5 a 13 km, medios de 2 a 7 km, bajos hasta 2 km) y pone el Ns en el piso medio: lo dice la nota del marco. | OMM, Atlas Internacional de Nubes (géneros y pisos); RD 875/2014, anexo II (PY, UT 2) |
| Partes de una ola; mar de viento y de fondo | Longitud de onda de cresta a cresta; altura del seno a la cresta = 2 × amplitud (onda senoidal); periodo, tiempo entre dos crestas por un punto fijo. Mar de viento: corta, irregular, crestas que rompen, con el viento; mar de fondo: larga, regular y redondeada, de un temporal lejano y quizá de otra dirección. Crece con la fuerza del viento, su persistencia y el fetch. | OMM, Guía para el análisis y la predicción de las olas (OMM-N.º 702); RD 875/2014, anexo II (PY, UT 2) |
| Modelos de viento | Geostrófico: gradiente = Coriolis, paralelo a isobaras rectas, altas a la derecha (HN). De gradiente: alrededor de una baja, gradiente = Coriolis + centrífuga, paralelo a las isobaras curvas. Con rozamiento: gradiente + Coriolis + rozamiento = 0 con el viento girado α hacia la baja; resuelto, C = G · cos α y R = G · sen α (dibujado a escala con α = 20°); 10–20° sobre el mar, 30° o más sobre tierra. | Equilibrio de fuerzas en la capa de rozamiento (dinámica atmosférica; OMM, Manual de meteorología marina); RD 875/2014, anexo II (PY, UT 2) |
| Helicóptero: rumbo, cable y señales | Rumbo y velocidad constantes con el viento unos 30° por la amura de babor (el helicóptero, aproado al viento, se acerca por popa con la grúa a su derecha); el cable o el gancho tocan el agua o la cubierta antes de cogerlos (electricidad estática) y nunca se hacen firmes al barco; ningún cohete con paracaídas con el helicóptero cerca. | IAMSAR, vol. III, sección 2 (operaciones con helicóptero); Transport Canada TP 4414 (descarga de la estática; el gancho nunca firme al buque); RD 875/2014, anexo II (PY, UT 1) |
| Chaleco salvavidas | Uno por persona y uno más en la zona 1; niños, a su peso y talla; flotabilidad mínima 275 N (zona 1), 150 N (2, 3 y 4) y 100 N (5, 6 y 7); con luz, de la que se puede prescindir solo de día en las zonas 4 a 7. Luz blanca; silbato y material retrorreflectante; a más flotabilidad, mejor gira al inconsciente (el de 100 N puede no hacerlo). | Real Decreto 339/2021, art. 7 (la Orden FOM/1144/2003 quedó derogada el 1 de julio de 2021); UNE-EN ISO 12402-2 a -4 y -8; Código IDS 2.2.3 (luz blanca) |
| Arnés y línea de vida | Línea de vida tensa de proa a popa; arnés con el enganche en el pecho; línea de amarre de 2 m como máximo, con mosquetones de seguridad. | UNE-EN ISO 12401 (arneses y líneas de amarre); RD 875/2014, anexo II (PY, UT 1) |
| Superficies libres | El líquido de un tanque a medias sube G a G virtual (GGv = ρ · i / Δ, con i = l · b³ / 12): se pierde GM. Lleno o vacío, nada; un mamparo longitudinal en medio deja 2 · (b/2)³ = b³/4, la cuarta parte. | Teoría del buque (corrección por superficies libres); RD 875/2014, anexo II (PY, UT 1) |
| Husos horarios y hora oficial | 15° = 1 h; huso = longitud / 15 redondeada (el 0, de 7° 30′ W a 7° 30′ E); Hz = TU ± huso; HcL = TU ± longitud en tiempo (1° = 4 min). Ejemplo: 069° 25′ E, TU 10:30 → huso 5 E, Hz 15:30, HcL 15:07,7. Hora oficial: Península, Baleares, Ceuta y Melilla TU + 1 (verano TU + 2); Canarias TU (verano TU + 1); verano del último domingo de marzo al último de octubre, a la 01:00 TU. | `src/nautical/hora.js`; Real Decreto 236/2002 (hora de verano, Directiva 2000/84/CE); RD 875/2014, anexo II (PY, UT 3) |
| Ritmos de las luces | Destello (Fl): la luz dura menos que la oscuridad; destello largo (LFl): 2 s o más; centelleo (Q): 50–79 por minuto, normalmente 50 o 60 (el dibujo usa 60); centelleo rápido (VQ): 80–159, normalmente 100 o 120; isofase (Iso): luz y oscuridad iguales; ocultación (Oc): más luz que oscuridad; Morse Mo(A): · —; alternativa (Al): cambia de color. Aguas navegables: Iso, Oc, LFl 10 s o Mo(A); peligro aislado: Fl(2); cardinales: Q/VQ continuo, (3), (6)+LFl y (9); bifurcación: Fl(2+1); nuevo peligro: Al.Bu/Y (1 s azul, 0,5 s, 1 s amarilla, 0,5 s). | Recomendación IALA E-110 (caracteres rítmicos de las luces de las ayudas a la navegación); Sistema de balizamiento IALA-AISM; Recomendación IALA O-133 (marca de pecio de emergencia); RD 875/2014, anexo II (PER, UT 5 y 10) |
| Regiones A y B | Solo cambian los colores de las laterales (y de las modificadas): en la región B, verde a babor y roja a estribor entrando desde la mar. Las formas (lata a babor, cono a estribor) y las demás marcas son iguales. Región B: América del Norte, Central y del Sur, Japón, República de Corea y Filipinas; región A, el resto (España incluida). | Sistema de balizamiento marítimo IALA-AISM, cap. 1 y 2 (regiones A y B) |
| Amarras | Largo de proa hacia proa y de popa hacia popa; esprín de proa sale de proa hacia popa (impide avanzar), esprín de popa de popa hacia proa (impide retroceder); través, perpendicular. Los esprines se cruzan. | RD 875/2014, anexo II (PER, UT 2 «Amarras» y UT 7); vocabulario de maniobra |
| Riesgo de abordaje | Hay riesgo si la demora de aguja del que se aproxima no varía de forma apreciable (y la distancia disminuye); puede haberlo aunque varíe, con un buque grande, un remolque o a corta distancia; ante la duda, existe. No se presume con información escasa, sobre todo de radar. Ejemplo dibujado: tú al 000° y el otro al 245° hacia el mismo punto a la vez: 033° en las cuatro demoras; si el otro va más despacio, 033°, 035°, 038° y 041° (te pasa por la popa). | RIPA, regla 7 (b, c y d) |
| Jerarquía entre buques | El de propulsión mecánica se aparta del sin gobierno, del de maniobra restringida, del que pesca y del de vela; el de vela, de los tres primeros; el que pesca, del sin gobierno y del restringido. Todos, salvo el sin gobierno y el restringido, evitan estorbar al restringido por su calado. El hidroavión amarado se aparta de todos. Salvo lo que digan las reglas 9, 10 y 13. Marcas de día: dos bolas; bola, bicónica y bola; cilindro; dos conos unidos por el vértice. | RIPA, reglas 18, 27 a y b, 26 y 28 |
| Dispositivo de separación del tráfico | Por la vía y en el sentido general de la circulación; entrar y salir por los extremos o con el menor ángulo; cruzar con el rumbo (la proa) lo más perpendicular posible a la corriente del tráfico; no entrar en la zona de separación salvo para cruzar, entrar o salir, pescar en ella o por peligro inmediato. La zona de navegación costera la pueden usar los de menos de 20 m, los de vela y los pesqueros. Los de menos de 20 m y los de vela no estorban a los de propulsión mecánica que siguen una vía; los pesqueros, a ninguno. El sentido de las flechas del dibujo es un ejemplo, no una regla. | RIPA, regla 10 |
| Luces y marcas: motor, vela y remo | Motor: tope 225° a proa, costados, alcance; con 50 m o más, segundo tope a popa y más alto (los menores pueden llevarlo). Menos de 12 m: blanca todo horizonte y costados en lugar de tope y alcance; menos de 7 m y no más de 7 nudos: blanca todo horizonte y, si puede, costados. Vela: costados y alcance; opcional roja sobre verde todo horizonte en el tope (no con el tricolor); menos de 20 m: farol combinado en el tope. A vela y motor: luces de motor y, de día, cono con el vértice abajo a proa. Remo: puede llevar las de vela; si no, linterna blanca lista. | RIPA, reglas 21, 23 y 25 |
| Luces y marcas: remolque y empuje | Remolcando: dos topes en vertical (tres si el remolque, de la popa del remolcador al extremo del remolcado, pasa de 200 m), costados, alcance y amarilla de remolque sobre la de alcance; bicónica de día con más de 200 m. Empujando a proa o remolcando por el costado: dos topes en vertical, costados y alcance, sin amarilla. Unidad rígida: un buque de motor. Remolcado: costados y alcance (bicónica si > 200 m); empujado a proa: costados en su extremo de proa. | RIPA, regla 24 |
| Luces y marcas: pesca | Arrastre: verde sobre blanca todo horizonte; con 50 m o más, tope a popa más alto que la verde (los menores pueden llevarlo). Otra pesca: roja sobre blanca; con aparejo de más de 150 m en horizontal, blanca todo horizonte (de día, cono con el vértice arriba) hacia el aparejo, a 2–6 m y no más alta que la blanca. Costados y alcance solo con arrancada. De día, dos conos unidos por el vértice. | RIPA, regla 26; anexo I, 4 a |
| Luces y marcas: sin gobierno, restringidos, calado | Sin gobierno: dos rojas en vertical, dos bolas; con arrancada, costados y alcance. Maniobra restringida: roja-blanca-roja, bola-bicónica-bola; con arrancada, tope, costados y alcance. Draga: además, dos rojas (dos bolas) en la banda obstruida y dos verdes (dos bicónicas) en la libre. Buceo pequeño: roja-blanca-roja y bandera A rígida de 1 m o más. Limpieza de minas: tres verdes (tres bolas), en el tope del palo de proa y en los penoles de su verga; peligroso a menos de 1000 m. Restringido por su calado: además de sus luces de motor, tres rojas en vertical o un cilindro. | RIPA, reglas 27 y 28 |
| Luces y marcas: práctico, fondeado y varado | Práctico en servicio: blanca sobre roja en el tope; con arrancada, costados y alcance; fondeado, además las de fondeo. Fondeado: blanca todo horizonte a proa (bola de día); con 50 m o más, otra a popa más baja; los de 100 m o más iluminan la cubierta; los menores de 7 m fuera de canales y fondeaderos no están obligados. Varado: las de fondeo y dos rojas en vertical; tres bolas. | RIPA, reglas 29 y 30 |
| Ciaboga (animada) | Con una hélice dextrógira se cae a estribor: avante con todo el timón a estribor y atrás con todo a babor, alternando; dando atrás, la presión lateral lleva la popa a babor y la proa sigue cayendo a estribor; con levógira, al revés. Con arrancada atrás el timón actúa al revés que avante (timón a babor, popa a babor). El modelo (Nomoto) da el giro de 180° en dos esloras. | RD 875/2014, anexo II (PER, UT 7 «Maniobra»: ciaboga); presión lateral de las palas (`src/nautical/helice.js`) |
| Desatraque (animado) | Atracado por babor con hélice dextrógira: abrir la popa con el esprín de proa, avante y el timón al muelle, y salir atrás; abrir la proa con el esprín de popa y atrás (la hélice lleva la popa al muelle y ayuda), y salir avante. Con viento de la mar se abre primero la popa. El esprín que trabaja hace de pivote sobre la defensa; el que no trabaja queda en banda. | RD 875/2014, anexo II (PER, UT 7 «Atraque y desatraque»); `src/nautical/desatraque.js` |
| Márgenes de la carta (tanda de cierre) | Título, número, escala, unidades de las sondas, edición y correcciones (año: grupo/aviso en el margen inferior izquierdo), escalas de latitudes (las que miden distancias) y de longitudes. No se dibuja la carta escaneada: esquema propio. | Catálogo y simbología de cartas náuticas del IHM (Carta 1 / INT 1, apartado A); RD 875/2014, anexo II (PER, UT 10) |
| Transportador, milla y rumbo directo | El transportador se orienta con un meridiano o paralelo; Rv del centro al borde. 1 milla = 1 minuto de arco de meridiano = 1852 m; se mide en la escala de latitudes a la altura del tramo. Ra = Rv − Ct. Cifras calculadas en la lámina. | RD 875/2014, anexo II (PER, UT 10 y 11); definición de la milla náutica internacional (1852 m) |
| Estima, traslado de demora, tangente y veriles | Distancia = velocidad × tiempo (estima con Rv o Ra corregido); traslado de la primera línea paralela a sí misma el rumbo y la distancia navegados; tangente: sen α = d / D; veriles: líneas de igual sonda, sondas reducidas al cero hidrográfico y naturaleza del fondo (S, M, G, R, Sh…). Todas las cifras salen de la cuenta (test «las cifras de la carta salen de la matemática»). | RD 875/2014, anexo II (PER, UT 11); Carta 1 / INT 1 (apartados I y J: sondas y naturaleza del fondo) |
| Oposición y enfilación | Oposición: entre los dos puntos, sobre el segmento; enfilación: en la prolongación, fuera del segmento. La recta no lleva corrección; desde el tercer faro se traza Dv ± 180° (080° → 260°; 205° → 025°); el tercer faro se coloca a esa demora desde la situación. | RD 875/2014, anexo II (PER, UT 11 «Líneas de posición»); geometría de `per-cola-carta-c.js` |
| Declinación anual | dm del año = dm de la carta + años × variación anual, con su signo (E +, W −). Ejemplos: 2° 30′ W en 2016 con 9′ E → 1° W en 2026; 30′ E en 2010 con 7′ W → 1° 22′ W en 2026. | RD 875/2014, anexo II (PER, UT 10 «Declinación magnética»); cuenta de `cuentaDeclinacion()` |
| Rumbo cuadrantal | N x E = x; S x E = 180° − x; S x W = 180° + x; N x W = 360° − x (S65E = 115°, S45W = 225°, N64W = 296°, N20E = 020°). | RD 875/2014, anexo II (PER, UT 10) |
| Demora y marcación (PER) | Dv = Rv + M (estribor +, babor −), normalizada a 000°–359°: Rv 070° con 100° por babor → 330°; Rv 200° con 120° por estribor → 320°. | RD 875/2014, anexo II (PER, UT 11) |
| Calidad del corte | Con el mismo error ±e en cada línea, la zona del corte es un rombo: diagonal larga 2e / sen(α/2) frente a 2e·√2 a 90°; razón 1 / (√2 · sen(α/2)): unas 4 veces a 20°. | Geometría (rombo de dos bandas); RD 875/2014, anexo II (PER, UT 11) |
| Definiciones del RIPA | Buque de vela: el que navega a vela sin usar su maquinaria aunque la lleve; de propulsión mecánica, el que la usa; a vela y motor, cono con el vértice abajo a proa. Sin gobierno, maniobra restringida, pesca (no el curricán) y restringido por su calado (solo propulsión mecánica). | RIPA, reglas 3 b, c, d, f, g y h; 25 e |
| Capear y correr; costa a sotavento | Capear: la mar por la amura con poca máquina; correr: por la aleta o la popa; atravesado a la mar, balances peligrosos. La costa peligrosa es la de sotavento. | RD 875/2014, anexo II (PER, UT 3 «Mal tiempo»); vocabulario de AEMET (barlovento y sotavento) |
| Fondeo (ancla, línea, borneo, garreo, orinque, voces) | Partes del ancla (arganeo, caña, cruz, brazos, uñas; cepo en la de almirantazgo); línea de fondeo de cinco esloras como mínimo con una eslora de cadena, grilletes en los empalmes; hasta 6 m de eslora puede ser toda de estacha. Borneo alrededor del ancla con el viento; garreo: el ancla no agarra. | Real Decreto 339/2021, art. 11 (línea de fondeo); RD 875/2014, anexo II (PER, UT 2 y 6) |
| Estructura del casco, cabos, remolque | Quilla, cuadernas, baos, varengas, mamparos; partes de un cabo (chicote, firme, seno); hacer firme en una cornamusa; remolque a la larga o abarloado; recoger un náufrago. Vocabulario del temario, sin cifras de norma. | RD 875/2014, anexo II (PER, UT 1 y 2) |
| Rolar y vocabulario del viento | Rolar: cambiar de dirección el viento; racha, amainar (AEMET); refrescar (RAE). El «y se mantiene» de la clase no está en AEMET: anotado, no dibujado. | AEMET, glosario de términos marítimos; Diccionario de la lengua española (RAE) |
| Hipotermia | Postura HELP (solo) y en grupo; no nadar si no hay a dónde; saltar al agua con el chaleco puesto, sujetándolo, de pie. Atender al rescatado (`postura: 'atender'`): ambiente cálido y sin corrientes, en horizontal; ropa húmeda por seca y manta cubriendo la cabeza; si no basta, dos personas abrazadas a él y envueltas en mantas; consciente, líquidos calientes y azucarados; ni frotar ni sacudir; ni alcohol, ni café, ni tabaco; consejo médico por radio. | OMI, guía de supervivencia en agua fría (MSC.1/Circ.1185/Rev.1); IAMSAR, vol. III; Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 2 «Accidentes por frío: hipotermia» (pág. 48), cap. 7 «Asistencia a náufragos y rescatados» (págs. 197-198) y anexo 10 «Normas a seguir ante un abandono de barco» (pág. 440) |
| Fuego «apagar» (interactiva) | Quitar uno de los cuatro elementos apaga el fuego: combustible (retirar), comburente (sofocar), calor (enfriar), reacción en cadena (inhibir). | Norma UNE-EN 2; RD 875/2014, anexo II (PER, UT 8) |
| Miniaturas de buques | Las mismas luces y marcas de la lámina `buque`, en 88 × 60 px y con los radios mínimos legibles. | RIPA, reglas 21 a 30 (las de `buques-c.js`) |
| Reducir movimiento | Con `prefers-reduced-motion: reduce`, las luces destellantes se quedan encendidas fijas (`.lc-destello`) y el cursor del cronograma desaparece; el ritmo sigue escrito. | WCAG 2.1, criterio 2.3.3 (animación por interacción) y 2.2.2 (pausar, detener, ocultar) |
| Zonas de navegación | Zona 1 ilimitada; 2, 3 y 4: hasta 60, 25 y 12 millas de la costa; 5 y 6: no más de 5 y 2 millas de un abrigo o playa accesible; 7: aguas protegidas. | Real Decreto 339/2021, art. 3 |
| Chalecos, aros y balsa por zona | Chalecos de 275 N (zona 1, con uno de más), 150 N (2 a 4) y 100 N (5 a 7), con luz salvo de día en 4 a 7; aro con luz y rabiza en 1 a 4 (dos en la 1); balsa para todos en 1 a 3. | Real Decreto 339/2021, arts. 6, 7 y 8 |
| Zona de baño | Balizada: dentro no se navega; canal de acceso señalizado. Sin balizar: 200 m en playas y 50 m en el resto de la costa, a 3 nudos como máximo y sin vertidos. El «canal de 25 a 50 m» de la lámina antigua no está en la norma: quitado. | Reglamento General de Costas (RD 876/2014), art. 73; IALA-AISM (laterales del canal) |
| Aguas sucias y tanque de retención | Con inodoro, tanque, instalación de tratamiento o sistema para desmenuzar y desinfectar; conexión universal a tierra; válvulas que se puedan cerrar y precintar; el art. 22 no se aplica a los de marcado CE. Descarga: más de 3 millas desmenuzadas y desinfectadas, más de 12 sin tratar, desde la línea de base; el tanque, a régimen moderado, en ruta y a 4 nudos o más; con instalación de tratamiento, fuera de la zona 7. | Real Decreto 339/2021, arts. 22 y 23 |
| Basuras | Plásticos y aceite de cocina, nunca; la comida, fuera de zona especial, triturada (criba de 25 mm) a más de 3 millas y sin triturar a más de 12; en el Mediterráneo (zona especial, al E de 5° 36′ W), triturada y a más de 12; siempre en ruta. | Convenio MARPOL, anexo V (reglas 4 y 6; límite de la zona especial del Mediterráneo) |
| Posidonia | Prohibido fondear sobre las praderas y donde la cadena las toque al bornear; boyas autorizadas; salvo fuerza mayor o peligro. | Real Decreto 191/2026 (BOE-A-2026-5877) |
| Banderas y pabellón | Asta de popa y pico, solo la de España; las demás, con la de España izada y con un tercio de su área como máximo; obligatorio izarla al entrar y salir de puerto, a la vista de buques de guerra o fortalezas, en puerto de sol a sol los festivos, cuando lo disponga la autoridad y según la costumbre o la norma extranjera. | Real Decreto 2335/1980 |
| Puerto comercial | El recreo de menos de 20 m no estorba el tránsito en las aguas de servicio de los puertos comerciales; los buques evitan fondear en un canal angosto. «El que sale pasa primero» (texto de la clase) no está en estas normas: no se dibuja. | Real Decreto 186/2023; RIPA, regla 9 g |
| Seguro obligatorio | Recreo a motor (motos náuticas incluidas) y sin motor de más de 6 m; cubre a terceros; límites 120.202,42 € por víctima, 240.404,84 € por siniestro (personales) y 96.161,94 € (materiales). | Real Decreto 607/1999 |
| Contaminación y deber de auxilio | Responden solidariamente naviero, propietario, asegurador de RC y capitán, y reparan el daño; el capitán comunica a la Capitanía todo episodio de contaminación observado. Auxilio: acudir a toda velocidad si se puede sin grave peligro, sea cual sea la nacionalidad de las personas; si no, anotar el motivo e informar; constancia en el Diario. | TRLPEMM (RDL 2/2011), art. 310; Ley 14/2014 de Navegación Marítima, arts. 183.3 y 186.1; SOLAS, cap. V, regla 33.1 |
| Extintor (PY) | Sin marcado CE: extintores de 34 B y 2 kg como mínimo, por eslora y por potencia (0,3 B por kW por encima de 220 kW); revisión trimestral, anual por empresa y prueba de presión cada 5 años. El de CO₂ no lleva manómetro. No se dibuja una tabla agente × clase de fuego: falta la UNE-EN 3-7. | Real Decreto 339/2021, art. 15; Reglamento de instalaciones de protección contra incendios (RD 513/2017), anexo II; guía de la Diputación Foral de Bizkaia (CO₂) |
| Avisos a los navegantes (PY) | Grupo semanal del IHM; permanentes a tinta, temporales (T) y preliminares (P) a lápiz; registro «año: grupo/aviso(orden)» en el margen inferior; radioavisos NAVAREA (21 zonas, España coordina la III), costeros (Salvamento Marítimo) y locales; NAVTEX 518 kHz en inglés y 490 kHz en el idioma nacional. | IHM, Grupo de Avisos, avisos generales 2(G) y 3(G); OMI MSC.1/Circ.1403 (servicio mundial de radioavisos) |
| Hemorragias: tipos | Arterial: rojo vivo, a borbotones, al ritmo del pulso, la más peligrosa; venosa: rojo oscuro, continua y con poca presión; capilar: rezuma y para sola. | La Guía Sanitaria a Bordo (Instituto Social de la Marina, 2013) solo define la hemorragia (cap. 7 «Hemorragias», pág. 144: salida de sangre por rotura de arterias o venas) y no describe los tipos: es la clase per-8-1 y coincide con las respuestas de los tres bancos. Anotado en `.trabajo-ux/ESTADO-per-laminas.md` |
| Hemorragia externa: cómo pararla | Presión directa con gasas o un paño limpio, 10 minutos como mínimo y sin levantar las gasas; si se empapa, más gasas encima sin retirar las anteriores ni dejar de apretar; brazo o pierna por encima del corazón, salvo dolor importante; que no esté de pie (inconsciente: posición antishock). El torniquete, después de lo anterior. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 1 «V. Detener las hemorragias» (págs. 26-27) y cap. 7 «Actitud ante hemorragias externas» (pág. 145) |
| Torniquete | Último recurso, cuando lo anterior no controla una hemorragia importante; en la zona del miembro con un solo hueso (brazo o muslo), entre la herida y el tronco (figuras 7-36 y 7-37); anotar la hora; consejo médico por radio cuanto antes; con el manguito del tensiómetro o con un paño (o la venda triangular) y un palo, sin nudos sobre la piel; mantenido demasiado tiempo, gangrena o lesiones de nervios. No se dibuja la pauta de aflojarlo (la Guía dice cada 15 minutos; el curso, que no se afloja): divergencia anotada en ESTADO. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 7 «Hemorragias», «3.º Torniquete» (págs. 146-149) |
| Quemaduras: grados | 1.er grado: capa superficial, piel enrojecida y dolor, sin secuelas; 2.º: capa profunda, ampollas de líquido claro, dolor intenso, suele dejar cicatriz; 3.er: todas las capas, lesión negruzca que no duele; suelen coexistir varios grados. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 7 «Quemaduras», «2) Profundidad» y «3) Lugar afectado» (págs. 150-151) |
| Quemaduras: el agua | Térmica: agua fría enseguida, retirar relojes y anillos, cortar la ropa sin tirar si está pegada, no enfriar grandes áreas, no romper ampollas, nada encima al principio. Química: agua 15-20 minutos como mínimo, quitar la ropa sin que el producto toque zonas sanas, protegerse; ojo: 15-20 minutos de dentro hacia fuera, los dos ojos alternando cada 10 s. Eléctrica: cortar antes la corriente. Los minutos de la térmica no se dibujan (la Guía dice «unos minutos»; el curso, 10 a 20). | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 2 «Quemaduras (calor, químicas, eléctricas)» (págs. 40-41) |
| Quemaduras: gravedad | Regla de los nueves (cabeza y cuello 9 %, cada brazo 9 %, tronco 18 % delante y 18 % detrás, cada pierna 18 %, genitales 1 %) y la palma del herido, 1 %. Sin lesión por inhalación, a bordo: 1.er grado < 20 %, 2.º < 10 %, 3.er < 1 %; se evacúan las demás y las de cara y cuello, manos y pies, genitales, pliegues y orificios. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 7 «Quemaduras», «Valoración de la importancia» y «Criterios de tratamiento» (págs. 149-152) |
| Golpe de calor | Más de 40 °C; ambiente caluroso y húmedo, piel caliente, roja y seca, confusión, pulso rápido, sed. Lugar fresco, seco y ventilado y quitar la ropa; ducha o paños de agua fría (unos 20 °C); consciente, suero oral en agua fresca; bajar hasta 39 °C y controlar cada 10 minutos; no seguir enfriando a 38,5 °C; ni alcohol ni estimulantes; consejo médico por radio. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 2 «Accidentes por calor: golpe de calor» (pág. 49) y cap. 7 «Lesiones por calor» (págs. 195-196) |
| Radio-Médico | Centro Radio-Médico Español, del ISM, en Madrid: por radio a través de una estación costera pidiendo «consulta médica» (gratuita y con prioridad) o por teléfono al 91 310 34 75 (también por satélite o telefonía móvil); 24 horas todos los días, gratis, en español; no urgentes, de 9:00 a 15:00 (hora de Madrid); datos del barco y del paciente preparados. El canal 16 y la coordinación con Salvamento Marítimo no están en la Guía: no se dibujan. | Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 4 «Asistencia médica a distancia» (págs. 77-80) |
| Botiquín de recreo | Sin tripulación profesional, zonas 1 a 4: botiquín de contenido idéntico al tipo «Balsas de Salvamento» del anexo II del RD 258/1999; con botiquín, la Guía Sanitaria a Bordo; con tripulación profesional, RD 258/1999 (recreo con tripulación contratada: A a más de 150 millas de la costa, B entre 60 y 150, C hasta 60); caducado cuando es obligatorio, infracción grave. | Real Decreto 339/2021, arts. 13.2 y 24; Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013: cap. 5 «Botiquín de a bordo» (págs. 89-97) |
