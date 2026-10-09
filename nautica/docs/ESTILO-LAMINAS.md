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
| Anverso de las tarjetas de memoria (y su CSS `.tc-*`, al final de `styles/laminas.css`) | `src/illustrations/tarjetas-c.js` |
| Luz que destella y cronograma del ritmo | `luzC()` y `cronoC()` de `src/illustrations/lights.js` |
| Marca de balizamiento (castillete, tope, franjas) | `marcaC()` de `src/illustrations/buoys.js` |
| Textos del marco de cada lámina (`titulo`, `clave`, `nota`, `datos`, `alt`) | `src/illustrations/marcos.js` |
| Marco HTML (eyebrow, título, frase clave, figura, datos, nota) | `src/ui/lamina-marco.js` |
| Láminas animadas: pistas puras (evolución, hombre al agua, hélice, borrasca y anticiclón) | `src/illustrations/animaciones/` (registro en `index.js`, piezas comunes en `pista.js`) |
| Reproductor de las animaciones (controles, reloj, pausa fuera de pantalla) | `src/ui/animacion.js` (CSS `.ani-*` al final de `styles/laminas.css`) |
| Modelo de maniobra (curva de evolución, hombre al agua, andar de la hélice) | `src/nautical/maniobra.js` |
| Tests del estilo | `tests/laminas-estilo.test.js` |
| Tests de las animaciones (física, fotogramas, reproductor) | `tests/animaciones.test.js` |

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
| Señales acústicas | Corta ≈ 1 s, larga 4–6 s. Maniobra: 1 corta estribor, 2 babor, 3 atrás; 5 o más cortas, duda; 1 larga, recodo. Canal angosto: 2 largas + 1 corta, alcanzar por estribor; 2 largas + 2 cortas, por babor; larga-corta-larga-corta, conformidad. Niebla (≤ 2 min): 1 larga motor con arrancada; 2 largas (unos 2 s entre ellas) parado; larga + 2 cortas, sin gobierno, restringidos, vela, pesca, remolque; larga + 3 cortas, remolcado. Fondeado: repique de ~5 s cada ≤ 1 min (≥ 100 m, además gong a popa); varado: 3 golpes, repique y 3 golpes; práctico: 4 cortas. | RIPA, reglas 32, 34 y 35 |
