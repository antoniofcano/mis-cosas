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
