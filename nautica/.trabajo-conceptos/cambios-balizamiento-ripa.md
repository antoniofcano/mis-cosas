# Cambios aplicados · balizamiento-ripa

Rama `feat/conceptos-cambios-balizamiento-ripa` (desde origin/feat/conceptos). `version` del grupo: 1 -> 2.

Fuente usada para contrastar el RIPA: texto español del Convenio COLREG 1972 con las enmiendas hasta 2002 (edición
oficial chilena, directemar.cl, en español) y, para el inglés, cultofsea.com. **No pude abrir el RIPA en el BOE**
(el BOE de 1977 solo da el PDF escaneado). La numeración y el contenido son los del texto OMI, el mismo que recoge el
BOE, pero conviene que el responsable confirme las letras en el BOE antes de dar por cerradas las comprobaciones.
El punto 5.1 del anexo II del RD 875/2014 sí lo contrasté en el BOE (BOE-A-2014-10344).

## Aplicado (por propuesta)
1. **Partir `ripa.luces.def.alcance-remolque`** (aprobada). Nuevos `ripa.luces.def.alcance` (Regla 21 c)) y
   `ripa.luces.def.remolque` (Regla 21 d)), con etiqueta, sinónimos, nota, tit, clases per-6-7 y temario propios, hijos
   del viejo. El viejo pasa a `grupo` (conserva padre `ripa.luces.def` y etiqueta; sin sinónimos propios; nota breve,
   tit/clases/temario porque el validador los exige en todo grupo). Cifras verificadas: 135 grados, 67,5 por banda.
2. **Partir `ripa.vela.misma-banda`** (aprobada). Nuevo `ripa.vela.barlovento` (Regla 12 b)); `misma-banda` queda en
   «cede el de barlovento (12 a) ii))», sin la definición, y conserva su significado (no pasa a grupo). Corrección
   sobre la propuesta: el texto oficial dice «aparejo cruzado» (no «de cuchillo»): la nota usa «en los buques de
   aparejo cruzado, la contraria a la que lleva cazada la mayor de las velas de cuchillo»; «aparejo cuadro» queda como
   sinónimo.
3. `ripa.luces.remolcado`: nota reescrita según la Regla 24 e)-g) (verificada: luz blanca todo horizonte en cada
   extremo, dos más si la anchura es >= 25 m, intermedias si > 100 m a no más de 100 m, bicónica a popa del último
   objeto y otra cerca de proa si el remolque > 200 m). La norma dice «anchura»; la propuesta decía «manga».
4. `baliza.luz.ritmos` y `ripa.luces.def.todo-horizonte`: frase de aviso (Regla 21 f) verificada: 120 o más
   centelleos/min) y relacionados cruzados.
5. `ripa.luces.cuando`: nota con Regla 20 e) (anexo I) y 20 c) (de día con visibilidad reducida «en caso de llevarse»),
   ambas verificadas.
6. `baliza.iala.reconocer`: frase final sobre azul y amarilla alternantes (nuevo peligro).
7. `baliza.nuevo-peligro`: solo los **sinónimos** (baja). Ver lo no aplicado para temario y nota.

Piloto: las preguntas del concepto partido se re-etiquetaron (bal-per-2025-09-c-23, bal-per-2026-06-c-19,
dgmm-per-2023-11-65 -> `alcance`; dgmm-per-2024-04-24 -> `remolque`) y se añadieron al piloto 4 preguntas de definición
de barlovento (dgmm-per-2020-12-21, dgmm-per-2025-11-25, bal-per-2022-03-a-26, bal-per-2022-12-fd-20) ->
`ripa.vela.barlovento`. Las dos del piloto con `misma-banda` (and-2025-c3-t18, bal-per-2017-03-a-27) son de la regla
12 a) ii) y se quedan. No existen aún ficheros `data/ejes/*/*/conceptos.json` en esta rama: solo hay piloto que re-etiquetar.

## NO aplicado y por qué (lista para el responsable)
- **`ripa.niebla.pequenas` (alta): propuesta incorrecta en las letras.** En el texto oficial: 35 i) = buques de 12 a
  menos de 20 m (sin obligación de las señales de campana/gong de g) y h); si no las hacen, otra señal acústica eficaz
  cada <= 2 min); 35 j) = buques de < 12 m; 35 k) = embarcación de práctico. Por tanto la propuesta de quitar el
  paréntesis «(< 20 m, solo la mitad de campana/gong)» y citar 35 i) para <12 m no cuadra: la nota actual mezcla i) y
  j), y la etiqueta y el temario actuales («Regla 35 i)») son erróneos para <12 m (es 35 j)). Arreglo sugerido:
  nota «< 12 m (35 j)) y 12-20 m (35 i)): no obligados a las señales de campana/gong y otras de la regla; harán otra
  señal acústica eficaz a intervalos <= 2 min», temario «Regla 35 i) y j)». A decidir; posible partición en dos.
- **`ripa.niebla.remolcado-practico` (partición no aprobada + letras mal):** valoración «duda» y la propuesta cita
  «35 j)» para el práctico; en el texto oficial el práctico es **35 k)** (cuatro cortas, «además de las de a), b) o f)»,
  no «a), b) o g)») y 35 e) remolcado y 35 f) unidad compuesta sí cuadran. Sin aplicar. Además el temario actual
  «Regla 35 e), f) y j)» tiene la letra j) mal (debe ser k)).
- **`ripa.luces.draga-buceo` (partición no aprobada, valoración «duda»).** Contrastado: 27 d) (dragas: dos rojas/dos
  bolas del lado obstruido; dos verdes/dos bicónicas del libre), 27 e) (roja-blanca-roja y bandera A rígida >= 1 m,
  cuando las dimensiones impiden las del d)) y 27 g) (exención < 12 m salvo buceo) son correctos. Solo falta la
  aprobación de la partición.
- **`ripa.marcas.vela-motor` (nota <12 m, Regla 25 e)): no cuadra.** El texto que pude leer de 25 e) (español y
  cultofsea.com en inglés) no contiene ninguna exención para < 12 m. Habría que comprobarlo en el texto vigente del BOE
  o de la OMI; queda pendiente.
- **`ripa.marcas.pesca` (cesta < 20 m, Regla 26 b) i) y c) i)):** fuentes contradictorias. El texto español
  consolidado (con la enmienda A.736(18) de 1993) no contiene la cesta; cultofsea.com sí (versión anterior/NavRules).
  Un lector de esa web comenta que ya no está. Probablemente suprimida; no aplicada. Si es así, el distractor de
  bal-per-2025-12-b-22 es simplemente falso.
- **`baliza.nuevo-peligro` temario «pendiente» y nota (media):** la valoración la marca «duda» (decisión 5/6). Contrasté
  en el BOE que el 5.1 del anexo II solo lista laterales región A, cardinales, peligro aislado, aguas navegables y
  especiales y que «en cada Resolución de Convocatorias se especificará la normativa IALA», así que la propuesta es
  coherente; si el responsable la confirma, es poner temario «pendiente» y añadir a la nota «No figura expresamente en
  5.1; es norma IALA (sistema de balizamiento marítimo)». El temario actual ya contiene la salvedad.
- **`ripa.canal.adelantar` y `ripa.canal.recodo` (temario):** ya recogen la Regla 34 c) y 34 e) («... y 6.4 Señales
  acústicas y luminosas, Regla 34 c)» / «34 e)»). Verificadas las dos reglas (34 c) i)-ii) y 34 e) cuadran). Cambiar el
  final como propone quitaría el ancla 6.4; sin cambio.
- **`ripa.jerarquia.categorias` (baja):** valoración «duda»; sin dependencia normativa. Texto propuesto listo
  (quitar «y vela» y relacionar con motor-vela). Pendiente de confirmación.
- **`ripa.luces.vela` clases (baja):** «revisar si quitar per-6-5»: es una decisión, no un cambio claro.

## Recall (candidatos --medir, piloto de 235 preguntas)
- Antes (principal / todas las etiquetas): recall@1 86,8 % / 80,8 %; @3 98,3 / 95,8; @5 99,1 / 98,1; @8 99,6 / 98,8;
  MRR 0,926.
- Después de re-etiquetar el mismo piloto (235): @1 86,8 / 80,8; @3 97,9 / 95,8; @5 99,1 / 98,1; @8 99,6 / 99,2; MRR 0,925.
- Después de añadir las 4 preguntas de barlovento (239): @1 87,0 / 81,1; @3 97,9 / 95,8; @5 99,2 / 98,1; @8 99,6 / 99,2;
  MRR 0,926.

## Para otro grupo
- Nada que dependa de otras ramas. Las preguntas de buceo (RD 550/2020, seguridad-legislacion) se relacionarán con
  `ripa.luces.buceo` solo si se aprueba la partición pendiente.
