# Registro de cambios

Qué cambia en la app para quien la usa, por fecha de publicación. Es la base de las notas de versión.

**Cómo se mantiene**

- Cada PR que cambie algo que el alumno pueda notar añade su línea en «Sin publicar», en el mismo commit.
- Al desplegar, «Sin publicar» pasa a ser una entrada con la fecha del despliegue y la versión del service worker
  (primera línea de `sw.js`).
- Tres apartados por entrada, solo los que hagan falta: **Novedades** (algo que antes no existía), **Mejoras** (algo que
  ya existía y cambia) y **Correcciones** (algo que estaba mal).
- Se escribe para el alumno: qué puede hacer ahora o qué ha dejado de fallar, sin nombres de ficheros. El detalle técnico
  vive en la PR (entre paréntesis) y en `docs/`.
- Lo que no se nota desde fuera (documentación, herramientas, tests) no entra aquí; para eso está `docs/ROADMAP.md`.

## Sin publicar

Nada pendiente.

## 16 de noviembre de 2026, sexta publicación · versión `ffd09e8aa632`

**Novedades**

- **El primer minuto.** Antes de que empiece el reloj de un simulacro, una convocatoria o un ensayo en papel, una pantalla para hojear el cuadernillo como en el examen: dónde está la tabla de mareas, qué preguntas traen desvíos o la declinación de la carta, qué faros hay que buscar y qué tipos de problema trae, marcados como fáciles o caros para ti según tus tiempos y tus fallos (si aún no hay datos tuyos, lo que suele costar cada tipo).
- **Tu reparto del tiempo.** Un plan para ese examen: qué preguntas primero, cuáles al final y cuáles no merecen la pena si vas justo, con los minutos de cada parte y los momentos en que mirar el reloj. Durante el simulacro, si una pregunta se alarga o te quedas atrás, una línea discreta te lo dice; en el ensayo en papel, te recuerda cada hito.
- **Estimar y descartar.** Cuando no da tiempo, reglas para quitar opciones imposibles con los datos del enunciado: la hora fuera del tramo de marea, una sonda menor que la de bajamar o mayor que la de pleamar, un rumbo que no va hacia donde está el destino, una distancia o una situación imposibles con esa velocidad. Al terminar, el resultado te dice en qué preguntas te habría convenido estimar y qué podías descartar.
- **Ensayo general.** En Examen, el examen de un tirón con los tiempos del tribunal: en el PY, el módulo genérico y el de navegación seguidos (o solo el que preparas, si lo has elegido); en el PER, el examen entero. Al final, el resultado parte a parte y si acertaste menos o fuiste más lento en la segunda mitad del tiempo.
- **Lo hice en papel.** En una pregunta de carta, junto a «Resolver paso a paso», tienes «Lo hice en papel»: la resuelves en tu hoja, como en el examen, y luego escribes el resultado de los pasos que tengas (no hace falta escribirlos todos). Te digo en qué paso te desviaste y, si es un error típico, cuál («Has aplicado el adelanto al revés»). Si un paso no coincide con la solución pero está bien hecho con el dato malo que traías de antes, no se te marca: solo cuenta el primer fallo, y ese va a tu cuaderno de fallos. El margen es el del paso a paso, y el doble en lo que se mide en la carta con transportador o compás.
- Al acabar el **ensayo general en papel**, «Corrige tu hoja por pasos» te lleva a cada problema de carta para corregir lo que escribiste en tu hoja. En **Tu examen oficial**, cada problema de carta fallado también se puede corregir así, si guardaste tu hoja.

## 16 de noviembre de 2026, quinta publicación · versión `32f9031c575a`

**Novedades**

- **Modo noche.** En Ajustes tienes ahora «Aspecto»: claro, oscuro o automático (el de tu móvil). El oscuro está pensado para estudiar de noche, con colores suaves que no deslumbran. Solo cambia en el aparato donde lo eliges.

**Mejoras**

- **Una cara nueva.** Colores de carta náutica, fondo con retícula discreta (que desaparece cuando lees una clase o haces un examen) y letras nuevas: títulos y botones en una letra más estrecha y las cifras del reloj y las horas en una de ancho fijo, más fáciles de leer de un vistazo. Funciona igual sin conexión.
- **Hoy, más claro.** La tarjeta «Siguiente parada» es lo primero que ves tras tu derrota, con un único botón grande; justo debajo, cómo vas y tu cuaderno de fallos. Todo lo demás sigue en su sitio, un poco más abajo.
- **El reloj del paso a paso cabe en una línea** también en los móviles estrechos: «0:02 de 5:30 · vas bien».

## 16 de noviembre de 2026, cuarta publicación · versión `67b743b4bad0`

**Novedades**

- **Tu cuaderno de fallos.** Patrón apunta cada fallo con nombre: no «fallaste mareas», sino «Adelanto al revés» en «Marea y sonda · Hora oficial y UT». Salen de donde se reconocen: un paso del paso a paso, la opción que marcas en una pregunta de examen, un ejercicio, un simulacro o tu examen oficial. Cada uno dice cuántas veces y de dónde ha salido. Está en Hoy, en Más («Tu cuaderno de fallos») y en el resultado de cada examen, que te dice qué fallo se abre.
- **Dosis de 2 minutos.** Para cada fallo abierto, cinco tarjetas sobre ese paso y nada más, con números nuevos y reloj: hora oficial y UT, intervalo desde la bajamar, corrección de la marea, sonda de la carta, Ct = dm + Δ, la declinación del año, el abatimiento, la corriente… Si caes en la trampa, te dice cuál es y la regla. Para los fallos sin tarjetas, la dosis es un ejercicio con números nuevos o dos o tres preguntas de examen con esa trampa.
- **Comprobación días después.** Tres días después de la dosis, un problema completo del tipo, sin pistas. Bien: el fallo pasa a «vigilando» y vuelve a comprobarse una semana después; con dos seguidas bien, queda resuelto. Mal: vuelve a abrirse y toca otra dosis. Si lo vuelves a cometer, se reabre. Hoy te propone la dosis o la comprobación cuando toca, detrás de lo principal. El cuaderno viaja a tus otros aparatos.

**Arreglos**

- En el paso a paso de mareas, si sumabas el adelanto en vez de restarlo, el aviso no lo reconocía como «adelanto al revés». Ahora sí, y ese fallo entra en tu cuaderno.

## 16 de noviembre de 2026, tercera publicación · versión `41e80a673ccb`

**Novedades**

- **Reloj en el paso a paso y en las preguntas de carta de la práctica.** Ves el tiempo que llevas, el objetivo por problema (una estimación con el reparto orientativo del tiempo de tu examen, no una norma), una barra hacia ese objetivo («vas bien», «vas justo», «te pasas»), lo que tardas en cada paso y un botón de pausa. Se para con la pestaña oculta; no se para al mirar las ayudas. El tiempo del paso a paso cuenta en «Tu velocidad en carta». En exámenes y simulacros no hay reloj de práctica: ya tienen el suyo.
- **Avisos en cada paso del paso a paso.** Antes de contestar, un «Ojo» te avisa de la trampa típica del paso (la que ya has fallado o, si aún no hay datos tuyos, la que más repiten en el examen) y un «No olvides» plegado te da la regla exacta. Si fallas y tu respuesta es la que sale con un error típico, te lo dice con nombre («Has aplicado el adelanto al revés»). Al acertar, «Así se hace» te deja la regla para la próxima.

**Mejoras**

- **El paso a paso reconoce el adelanto al revés aunque con él la hora caiga fuera de la tabla de mareas**, y el fallo de un paso ya cuenta en «Tus errores más repetidos» (sin contarlo dos veces si luego marcas la opción con el mismo error).
- **El ejercicio de mareas reconoce el adelanto aplicado al revés** y te lo dice con nombre.
- **Resolver paso a paso, como en la hoja del examen, en toda la carta.** Lo que ya tenían la estima analítica y las
  mareas llega a la corrección total, las demoras (dos demoras, oposición, enfilación, no simultáneas), el abatimiento y
  las corrientes (efectiva, rumbo a dar y desconocida): cada paso te dice qué datos traes, qué regla aplicas (Ct = dm + Δ,
  Rv = Ra + Ct, Rs = Rv + Ab según la banda, el triángulo de velocidades…) y, al contestar, la cuenta escrita con sus
  signos, como la pondrías en el papel. Con tres dibujos nuevos: los nortes (verdadero, magnético y de aguja), la proa
  con el viento y el triángulo de velocidades; lo que buscas aparece cuando contestas.

## 16 de noviembre de 2026, segunda publicación · versión `d7108aa0c424`

**Mejoras**

- **Tu examen oficial** acepta un enlace con la hoja ya rellena: la abres, la revisas y la corriges.

## 16 de noviembre de 2026 · versión `4b1450d82307`

**Novedades**

- **Tu examen oficial.** Si ya te has examinado y la convocatoria está en la app, pasa lo que marcaste en tu hoja (en
  Examen, o desde «¿Cuántas fallaste en cada materia?»). Patrón la corrige con la plantilla oficial, te enseña tus
  fallos por tipo de problema con su paso a paso, los mete en tu repaso de fallos y apunta tu resultado por materia
  (y el módulo que te queda, en el PY). Esa convocatoria deja de estar guardada para tu examen final, porque ya la has
  visto.
- **¿De qué te examinas?** En el PY, Hoy pregunta si preparas los dos módulos, solo el genérico o solo el de
  navegación (se cambia cuando quieras). La siguiente parada, el plan hasta el examen, el avance, «¿Estás listo?» y el
  simulacro siguen esa elección, y tu derrota (la travesía) enseña solo los faros de ese módulo; los temas del otro
  siguen a mano en el Temario, aparte. Si apuntas un examen con un módulo aprobado, se centra solo en el que te queda.
- **Las 10 preguntas de una clase se retoman donde las dejaste** si sales a mitad (por ejemplo, para avisar de un
  error). Y se puede ir directo a ellas sin pasar por las tarjetas: desde la primera tarjeta de la clase y desde la
  lista de clases del tema.
- **Andalucía, 3.ª convocatoria de 2026** (14 de noviembre), en el PER y en el PY. Entra reservada para el examen
  final; la 1.ª de 2025 pasa a poder estudiarse.

**Correcciones**

- Clases al día con lo que preguntó el examen del 14 de noviembre: la corriente frente a Ceuta tiende al SE y se divide
  en el cabo Tres Forcas; el siroco sopla por delante de las depresiones; el tramo de marea que pasa de medianoche;
  quién no puede apartarse según la Regla 3; de qué depende el círculo de borneo; y cómo situarse con una enfilación y la
  distancia a un faro. En un dispositivo de separación de tráfico, ir por la vía no da preferencia, ahora como idea propia.
- La numeración de las clases de un tema ya no salta números cuando hay ideas flojas entre ellas.

## 11 de noviembre de 2026 · versión `6a8d8eabafe6`

### Mejoras

- **Paso a paso de la estima analítica (loxodrómica), como en la hoja del examen:** ahora te pide cada fila de la tabla
  (Δl y apartamiento de cada tramo, con la corriente como un tramo más), la suma, la latitud, la diferencia de longitud
  y la situación; y en el rumbo directo, Δl, ΔL, apartamiento y rumbo. Cada paso enseña lo que traes de los anteriores y
  la fórmula que se plantea, y al contestar, la cuenta línea a línea (también el cruce del meridiano 180°). Antes daba
  hecha la tabla y solo preguntaba la latitud y el resultado.
- **Paso a paso de las mareas, igual:** duración y amplitud, hora UT, intervalo desde la bajamar, corrección de altura,
  altura y sonda (o, al revés, la hora para tener una sonda), cada uno con lo que traes, la fórmula y la cuenta.
- **Un croquis en los pasos que lo piden:** la curva de la marea con tu hora marcada y el dibujo de los tramos de la
  estima, con la corriente a trazos. Se dibuja solo, trazo a trazo, y se repite al tocarlo.
- **La tabla de mareas del enunciado, a la vista en su paso:** eliges tú la pleamar y la bajamar, como en el examen; al
  contestar se marcan las dos filas que tocaban.

## 10 de noviembre de 2026, quinta publicación · versión `7f43f6e77be8`

### Novedades

- **Tus fallos por materia:** bajo «¿Estás listo?» y en la semana del examen, cuántas fallaste en cada materia en tus
  últimos exámenes frente a su límite, y si vas holgado, justo o te has pasado alguna vez. Se suspende por pasarse en
  una sola materia, y aquí se ve de un vistazo dónde.
- **Lo que dijo la app y lo que pasó:** en la semana del examen la app guarda sola lo que predice. Después, al contestar
  «¿Cómo te fue?», puedes apuntar cuántas fallaste en cada materia y ver si la app acertó contigo; un botón lo copia
  para enviarlo.
- **Te queda un módulo (PY):** si suspendes pero apruebas un módulo, «¿Estás listo?» y la semana del examen se centran
  en el que queda, con su simulacro. Te recuerda que el aprobado se guarda dos convocatorias más y solo en tu tribunal.

### Correcciones

- La pantalla del ensayo en papel y la de tu velocidad en carta salían sin su diseño en pantalla (solo se veía bien al
  imprimir).

## 10 de noviembre de 2026, cuarta publicación · versión `f5cafd2feb48`

### Novedades

- **Ensayo general en papel:** el examen (el módulo de navegación del PY, la parte de carta del PER o el examen entero)
  como el día de verdad, con tu carta de papel, transportador, compás y reloj. La app solo da los enunciados y el reloj
  del tribunal; al final pasas las respuestas a la hoja y te corrige con las reglas reales. Cuadernillo imprimible para
  hacerlo sin pantalla. «La semana antes» y la estrategia recomiendan hacer dos.
- **Tu velocidad en carta:** los simulacros guardan cuánto tardas en cada pregunta, y «Tu estrategia» te enseña tu tiempo
  por tipo de problema de carta frente al que tienes en el examen, con el consejo de por dónde empezar.
- **Simulacro de tus errores:** preguntas cuyas opciones falsas son justo los errores que repites; al fallar te dice si
  has vuelto a caer en el mismo. Sin errores tuyos registrados, con las trampas que más ponen los tribunales. No cuenta
  como simulacro aprobado.
- **Lista del día del examen:** qué llevar según tu tribunal y titulación, con casillas para marcar la víspera, separando
  lo que dice la convocatoria de lo que conviene comprobar.
- **Tu convocatoria:** en Ajustes, la hora, la sede y el enlace a la convocatoria; Hoy te lo enseña la semana del examen
  y, desde tres semanas antes, te recuerda comprobar que estás en la lista de admitidos.
- **Repaso exprés de la víspera:** unos 15 minutos con las trampas más repetidas de tus temas con límite de fallos y tus
  errores. Es el paso del penúltimo día de «la semana antes».

## 10 de noviembre de 2026, tercera publicación · versión `e630b7f4c754`

### Novedades

- **Todas las chuletas en una hoja:** Biblioteca → «Todas las chuletas» reúne las de todos los temas, agrupadas por
  tema, para imprimir o guardar en PDF de una vez (cada tema empieza en una página). También se llega desde la chuleta
  de cualquier tema.

## 10 de noviembre de 2026, segunda publicación · versión `98fdf4ab1de6`

### Novedades

- **Estrategia de examen:** cómo repartir el tiempo, los temas con límite de fallos, el orden para contestar y qué llevar,
  según tu titulación y tu tribunal, con las normas separadas de los consejos y su fuente. Con tus simulacros, además,
  dónde estás más cerca de suspender y cómo vas de tiempo. Imprimible; nunca se ve durante un examen.
- **La semana antes:** cuando faltan siete días o menos para tu examen (o activándolo a mano), un plan día a día con tus
  ideas más flojas de lo que más cae, un simulacro a mitad de semana y el último día sin nada nuevo.
- **Fórmulas y tablas en una hoja:** todas las del examen por bloques (corrección total, rumbos y demoras, viento y
  corriente, mareas, estima analítica, la hora, estabilidad, y las tablas que se memorizan), cada una con qué es cada
  letra, cuándo se usa, su trampa y un ejemplo resuelto con las teclas de la calculadora. Con buscador e imprimible, con
  o sin ejemplos. No se abre durante un examen.
- **Resolver paso a paso:** en las preguntas de carta y de cuentas que la app sabe resolver, un modo que te pide cada paso
  (la corrección total, el rumbo verdadero, la situación…), lo corrige en el momento y al final te dice en cuáles has
  fallado. «Dímelo» no cuenta como fallo.
- **Por qué has fallado:** si la opción que marcas es la que sale de un error típico (por ejemplo, aplicar la corrección
  total con el signo cambiado), la app te lo dice. Solo cuando hay un único error que lo explica: ocurre en una de cada
  cinco opciones erróneas. «Mi progreso» muestra tus errores más repetidos (se guardan solo en ese aparato).

### Correcciones

- El curso, la chuleta y la hoja de fórmulas dicen ahora lo mismo en siete puntos donde no coincidían: el signo de la
  deriva, la Ct por la Polar, cuándo redondear la declinación (lo que diga el enunciado), ΔL, la presión normal, el
  ejemplo de la tangente del PER y el huso justo en el límite. La chuleta de mareas del PY incluye la corrección por presión.
- Simulacro por módulos del Patrón de Yate: se corrige como el aprobado por módulos oficial (RD 875/2014): no pasar de 5
  fallos en Seguridad ni de 5 en Meteorología en el genérico, y de 5 en Teoría ni de 3 en Carta en el de navegación. Antes
  pedía 14 aciertos de 20, que no es el criterio del examen.

## 10 de noviembre de 2026 · versión `2709ca4f3f65`

### Novedades

- **Simulacro por módulos en el Patrón de Yate:** además del examen completo, se puede hacer solo el módulo genérico
  (Seguridad y Meteorología, 20 preguntas, 45 min) o solo el de navegación (Teoría y Carta, 20 preguntas, 75 min), para
  practicar uno mientras se aprende el otro. Se corrige con 14 aciertos de 20 (la misma proporción que el examen) y los
  límites de fallos de sus temas; es orientativo y no cuenta como simulacro aprobado.
- **Bloc de notas** en los ejercicios y preguntas de cuentas (mareas, estima, carta, «Haz la cuenta» de las clases y
  también en el examen): el enunciado a la vista con sus datos para tocarlos, notas propias y la calculadora a mano, con
  «Apuntar» para llevar su resultado a la nota. Las notas se guardan en el aparato mientras sigues en ese ejercicio.
- **Carta a pantalla completa:** botón «Ampliar» en cualquier carta. En el móvil la carta pasa de un tercio a casi
  toda la pantalla, con las herramientas en una fila de iconos y el enunciado a un toque; con el móvil tumbado entra
  sola en este modo.
- **«¿No es de este tema?»:** tras responder una pregunta, puedes cambiarla de tema (y de clase) si crees que está
  mal colocada. Cambia en tu estudio al momento, se sincroniza entre tus dispositivos, se deshace en Ajustes → «Mis
  correcciones» y puedes enviarnos el aviso para corregirla para todos. No cambia los exámenes ni los simulacros.

### Mejoras

- **La derrota coincide con el Temario y se puede acercar:** en el PER la carta general tiene cinco faros (cada uno suma
  sus temas) y al tocar uno se abre su carta de aproximación, con una boya por tema y las mismas cuentas que el Temario.
  En el Patrón de Yate hay un faro por tema y al tocarlo se ven sus clases. Las insignias ya ganadas se conservan y hay
  una nueva por tema completo. «Mi progreso» cuenta las ideas igual que el Temario.

### Correcciones

- Práctica de las clases: 82 preguntas que salían al practicar una clase de otro tema pasan a una clase de su tema (o
  quedan solo en las tandas del tema si ninguna clase lo enseña). Quedan a propósito en su clase las de mareas y las
  dudosas, anotadas una a una.
- PER de Baleares: una pregunta sobre una luz de sectores estaba en RIPA; pasa a Teoría de navegación, donde la
  puso el tribunal en cuatro de sus cinco apariciones.
- Podcast, minijuego: cuando una pregunta del episodio está reservada para el examen final, la que la sustituye tiene que
  parecerse también en las opciones. Antes bastaba un enunciado genérico igual y, en el episodio de nieblas, salía una
  pregunta de corrientes.

## 13 de octubre de 2026 · versión `90d75c6ee175`

### Mejoras

- Al practicar una pregunta de carta, «Abrir la carta» trae también su resolución paso a paso en la pestaña Tutorial. En
  un examen no se muestra (#135).
- Las tarjetas «Problema modelo» de las clases de carta del Patrón de Yate avisan de que la solución viene en las
  tarjetas siguientes y ofrecen la carta y la calculadora para intentarlo antes (#135).

### Correcciones

- La mesa de cartas abierta desde la práctica ya no enseña un tutorial vacío («0 / 0») (#135).
- En las preguntas de oposición y enfilación Cabo Espartel–Punta Malabata, el tutorial dibuja la recta desde el primer
  paso (#135).

## 12 de octubre de 2026

### Novedades

- **Recordatorio diario opcional:** una notificación a la hora que elijas (9, 13, 18 o 21 h), solo si ese día no has
  estudiado; donde no hay notificaciones, un aviso de calendario (#133).
- **La pantalla no se apaga** durante una sesión, una clase o un examen, y un botón **«Compartir mi parte»** para enviar
  un resumen de tu travesía sin datos personales (#132).
- **Cierre del PER:** 15 láminas nuevas y la parte de sanidad revisada con la Guía Sanitaria a Bordo (#131).

### Mejoras

- Las preguntas de carta que la app no puede resolver explican por qué y ya no salen al practicar (#129).

### Correcciones

- Sincronización: si el servicio pierde los datos de un alumno, el aparato los vuelve a subir solo; Ajustes avisa cuando
  el código aún no está registrado (#134).
- Curso del PER: retirados dos datos no verificados (canales 10/74 y «hasta las 20 millas») (#131).

## 11 de octubre de 2026

### Novedades

- **Sincronización entre dispositivos:** tu progreso pasa solo de un aparato a otro con un código de alumno, que se puede
  escribir o leer con un código QR. Funciona sin conexión y junta lo estudiado en cada aparato sin perder nada (#128).

## 9 de octubre de 2026

### Novedades

- **Carta resuelta paso a paso:** 14 tipos de ejercicio sobre la carta del Estrecho, con el dibujo de cada paso (#118).
- **Animaciones con física** y un reproductor común: evolución, hombre al agua, hélice, marea, borrasca y anticiclón,
  corriente, ciaboga y desatraque (#119, #124).
- **Mapas de conceptos y chuletas** con hoja imprimible (#120).
- **Instalar la app:** tarjeta en Hoy, fila en Más y accesos directos (#115).
- **Protección de tus datos:** almacenamiento persistente, su estado en Más y recordatorio de copia de seguridad (#114).

### Mejoras

- **Nuevo estilo de las láminas** (papel de carta náutica) en todo el Patrón de Yate y el PER: carta, mareas,
  meteorología, seguridad, señales de socorro, radar, GNSS, AIS, balizamiento, luces y los 32 buques del RIPA (#113,
  #116, #121, #123, #124, #125).
- Hoy y la Travesía con la derrota dibujada como una carta náutica; tarjetas de memoria con el mismo estilo (#117, #122).

## 8 de octubre de 2026

### Novedades

- **La Travesía:** carta de faros que se encienden al dominar las ideas, rangos, insignias y parte de sesión (#108).
- **Hoy** como entrada única, con una sesión de estudio por fases y su resumen (#112).
- **Test de nivel inicial** y **ficha de la idea floja**, con otra pregunta de la misma idea (#103, #106).
- **Ideas (conceptos):** las preguntas de los tres tribunales, etiquetadas por la idea que preguntan (prácticamente
  todas); el repaso de fallos va por ideas.
- Efectos opcionales: animaciones sobrias, sonidos y vibración (#111).

### Mejoras

- «¿Estás listo?» tiene en cuenta el olvido de las respuestas antiguas y da un margen (#105).
- La corrección de una pregunta se pliega para volver a ver la pregunta o la explicación (#107).
- Iconos propios en toda la app, Temario con progreso, «Mi progreso» y tipografía propia (#109, #110).

### Correcciones

- Discrepancias con las plantillas oficiales documentadas por tribunal, y dos etiquetas de corrección total
  corregidas (#104).

## Antes del 8 de octubre de 2026

La base de la app, sin registro detallado por versión: mesa de cartas interactiva con regla, compás y transportador;
bancos de preguntas reales de Andalucía, de la DGMM y de Baleares con explicaciones; simulacros y exámenes reales con la
corrección oficial; curso del PER y del Patrón de Yate en clases con tarjetas; plan hasta el examen; calculadora
científica; y el podcast «Radio de a bordo».
