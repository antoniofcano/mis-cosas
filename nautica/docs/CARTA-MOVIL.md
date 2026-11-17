# La carta en el móvil

Qué hace Patrón para que se aprenda y se entrene la carta del examen con un móvil, y qué no hace. Es la decisión que
ordena las propuestas de noviembre de 2026 (maquetas «Mesa en el móvil» y «Patrón, tu entrenador»). Las líneas de
trabajo están en `docs/ROADMAP.md` (R-54 a R-59).

_Decidido el 16 de noviembre de 2026._

## Por qué

La teoría está resuelta: las fichas forman y los tests entrenan. La carta no. Tenemos las herramientas (mesa de cartas,
bloc, calculadora), pero se estudia sobre todo con el móvil, y la pantalla pequeña no sirve para trazar un problema
entero. La prueba fue la convocatoria del 14 de noviembre de 2026 en Andalucía: el método se sabía y la carta se
suspendió por el tiempo y por no ver la tabla de mareas del anexo.

No se trata de añadir funciones, sino de tener pocas, cada una para un tipo de problema y una carencia concretos.

## Los tipos de problema

| Tipo | En el móvil |
| --- | --- |
| Analítico: estima, loxodrómica, tramos enlazados | Bien: números y calculadora |
| Mareas | Bien: tabla y cuentas |
| Corrección total y conversiones | Bien: cuentas cortas |
| Carta gráfica: situación, demoras, corriente, abatimiento | Mal: hay que trazar |

**Decisión:** el móvil no es una mesa de cartas. La mesa se queda para tablet y ordenador y no se pule más para el móvil.
En el móvil se trabajan las cuentas, las decisiones y el gesto que se falla («desde el faro, ¿hacia dónde trazo?»). El
problema entero de carta gráfica se traza en papel.

## Tres funciones

| Carencia | Función | Dónde |
| --- | --- | --- |
| Aprender el método | 1. Paso a paso que enseña | Móvil |
| Reforzar un paso que falla y ganar soltura | 2. Cuaderno de fallos con dosis cortas | Móvil |
| Estrategia y condiciones de examen | 3. Simulacro con estrategia | Papel, con el móvil de reloj y corrector |

### 1. Paso a paso que enseña (R-54)
Parte de la hoja de examen que ya existe en la estima analítica y las mareas (H-46) y se lleva al resto de tipos (R-52).
Añade:
- un primer paso «¿qué tipo de problema es?»;
- avisos en el paso donde tocan: **Ojo** (te has equivocado), **No olvides** (una regla) y **Así se hace** (bien hecho);
- ayuda en escalones: una pregunta, después la fórmula y, al final, el resultado;
- un ejemplo resuelto entero y, a continuación, uno igual con huecos.

En la carta gráfica el alumno decide qué trazar y la app lo dibuja («construir por intención»); no hay herramientas de
dibujo que manejar con el dedo.

Orden: estima y loxodrómica, mareas y corrección total primero; la carta gráfica después.

_Estado (noviembre de 2026): hecha. La hoja de examen en todos los tipos (H-46, H-56), el reloj (H-54), los avisos (H-55),
la carta gráfica por intención (H-66 y H-67, abajo) y el primer paso «¿qué tipo es?», la ayuda en escalones y el ejemplo
resuelto seguido de otro con huecos (H-68, abajo)._

#### Lo que enseña el paso a paso (H-68) · hecho

Lógica en `src/exams/ensena.js`, interfaz en `src/ui/guiado.js`.

- **«¿Qué tipo de problema es?»** antes de la primera cuenta: cuatro botones, el tipo de la pregunta (el de su resolución:
  marea y sonda, situación por dos demoras, corriente: rumbo a dar…) y tres de los que más se le parecen. Si falla, se le
  dice por qué es de ese tipo, qué dato del enunciado lo delata («sonda que tendremos a la hora oficial 22:50…»; en las
  demoras no simultáneas, la segunda hora) y cuándo sería el que eligió. No va al cuaderno de fallos: ningún error de la
  taxonomía es «confundir el tipo», y no se ha inventado uno.
- **Ayuda en escalones** en cada paso, con un solo botón que avanza: la **pista** (qué buscar y qué se busca), **la
  fórmula con tus datos** (la cuenta de la hoja cortada justo antes del resultado: «D = 23:25 − 17:16 = …») o, si el paso
  no la trae, la regla, y al final **«Dímelo»**. Usar un escalón no es fallar, pero queda apuntado en el paso, en el
  resumen y en `nautica.state()` («con 2 ayudas»). Los avisos «Ojo / No olvides / Así se hace» y el reloj siguen igual.
- **Ejemplo resuelto y otro con huecos:** «Ver un ejemplo resuelto» enseña otra pregunta real del mismo tipo resuelta
  entera, paso a paso y con su carta; después, «Ahora tú, con huecos» abre una tercera con la primera mitad de los pasos
  ya rellena para que el alumno complete el resto. Salen de la práctica del banco (nunca de las convocatorias
  reservadas), siempre las mismas para una misma pregunta. Sin reloj: no son un problema entero hecho por él. No usa los
  ejercicios generados: con las preguntas reales hay ejemplos de todos los tipos.

#### La carta gráfica por intención («Trázalo en la carta», H-66) · hecha

Se abre desde la pregunta de carta, junto a «Resolver paso a paso» y «Lo hice en papel» (`#/q/<id>?traza=1`); nunca con
un examen en marcha. Lógica en `src/exams/intencion.js`, interfaz en `src/ui/intencion.js`.

- **Cada trazo, en tres o cuatro elecciones cortas**, con botones de 44 px o más: la **acción** (trazar una demora desde
  un faro, un arco de distancia con el compás, unir dos faros, un rumbo desde un punto, unir dos puntos y medir,
  componer la corriente, la tangente, situarse «al S del faro», trasladar la primera línea, unir la estima con la
  observada), el **objeto** (qué faro o qué situación), el **valor** (la demora verdadera ya corregida, el rumbo de
  superficie, la distancia navegada) y el **sentido** (desde el faro, la opuesta; la corriente, hacia donde va el agua;
  la banda de la tangente; trasladar o no la primera línea).
- **La app lo traza exacto** en la carta, con su rótulo («Dv 341° Isla de Tarifa», «5,0 millas de Cabo Espartel»), y
  acerca la vista al trazo. La carta no trae las herramientas de dibujo (solo «Ampliar» y el zoom): no se dibuja con el
  dedo.
- **Errores con nombre.** Cada opción equivocada es un error de la taxonomía: los valores salen del kit resuelto con cada
  error típico (la demora de aguja sin corregir, la Ct con el signo cambiado, olvidar el desvío, los minutos leídos como
  décimas…), las elecciones de sentido tienen su error fijo (demora sin la opuesta, al otro lado del faro, oposición al
  revés, corriente al revés, sin corriente, la otra banda, rumbo directo, sin trasladar) y la acción y el objeto, los
  tres errores nuevos del paso «trazado»: **faro o punto equivocado**, **trazo equivocado** y **fuera de orden** (elegir
  lo que va después). Si dos errores dan el mismo valor, se dicen los dos y no se apunta ninguno. Un error que ya se
  eligió en un trazo anterior no vuelve como valor de los siguientes.
- **Lo que habrías trazado** se dibuja en discontinua y rotulado «Tu trazo»: el kit vuelve a resolver la pregunta con ese
  único cambio. El alumno vuelve a elegir (o pide «Dímelo»).
- **Al terminar**, la pregunta se resuelve con sus **primeras** elecciones (encadenadas: una situación equivocada es la
  salida del rumbo siguiente) y se compara con la resolución: la situación, a cuántas millas; un rumbo o una velocidad,
  con su diferencia. Las cuentas que quedan después del último trazo (el Ra con la Ct, el abatimiento) se enseñan
  aparte.
- **Al cuaderno**, solo el primer fallo con nombre, con el origen «traza».
- **Distancias no simultáneas (H-67):** dos distancias, o una demora y una distancia, tomadas a horas distintas, en tres
  trazos: el primer arco (o la demora), el traslado y el segundo arco. En el traslado, primero qué se hace con la primera
  línea —trasladar el centro del arco (o la línea) lo navegado, trasladarlo hacia atrás (**traslado al revés**, error
  nuevo de la taxonomía con su variante del kit) o cortar sin trasladar (**sin trasladar**)— y luego el rumbo y la
  distancia navegados, con su error si lo hay (la Ct en el rumbo, los minutos leídos como décimas en la distancia). Si
  un traslado equivocado no llega a cortar, se dibuja igual y al final se dice que no sale ninguna situación.
- **Cubre** las 1124 preguntas de práctica con algo que trazar. **Fuera** solo la estima analítica, que no se traza.

### 2. Cuaderno de fallos con dosis cortas (R-56)
- Cada respuesta equivocada de un paso se convierte en un fallo con nombre: «sumas el adelanto», «trazas la demora al
  revés». No «fallaste mareas».
- Una dosis de uno o dos minutos solo sobre ese paso, con el pulgar y con reloj: la soltura también se entrena.
- Días después, un problema parecido con otros números y sin pistas. El fallo solo se da por resuelto si se acierta ahí.
- La lista de fallos (abiertos, vigilando, resueltos) y el tiempo por tipo de problema alimentan «¿Estás listo?» (hecho,
  H-70): un fallo abierto en un tema con límite o tardar más de lo que da el tribunal en los tipos que más caen es un riesgo
  con su frase y su acción, y no deja decir «Estás listo» hasta resolverlo; en vigilancia pesa la mitad; sin datos, se dice.

Se apoya en el diagnóstico por tipo de error de las preguntas reales (H-31) y necesita antes el catálogo de fallos (R-55).

### 3. Simulacro con estrategia (R-57) · hecha
_Hecha en noviembre de 2026 (H-61 y H-62, `docs/ROADMAP.md`): el primer minuto y el reparto del tiempo antes del reloj
(simulacro, convocatoria y ensayo en papel), el aviso discreto durante el examen, siete reglas de descarte probadas con
todas las preguntas reales del estudio y el ensayo general de teoría y carta seguidas. Lógica en
`src/course/plan-examen.js` y `src/course/descarte.js`._

Cose lo que ya existe (ensayo en papel H-35, velocidad en carta H-36, simulacro de tus errores H-37, tras el examen
H-42 y H-43) y añade:
- **el primer minuto:** hojear el cuadernillo y localizar tablas y anexos;
- **el reparto del tiempo:** qué primero, qué al final y qué no merece la pena;
- **estimar y descartar** las respuestas imposibles cuando no da tiempo;
- **un simulacro completo** de teoría y carta seguidas, al menos uno antes de cada convocatoria, porque el cansancio y el
  reloj también cuentan.

## Huecos que se cubren

- **El paso al papel (R-58, hecho):** el alumno resuelve en su hoja, mete el resultado de cada paso y la app le dice en cuál se
  desvió. Lo que se hace en papel también llega al cuaderno de fallos.
  - Se abre con «Lo hice en papel» en la pregunta de carta, desde el resultado del ensayo en papel y desde tu examen
    oficial; nunca durante un examen. No hace falta meter todos los pasos.
  - **Errores arrastrados:** la app vuelve a resolver el problema con los números del alumno en lugar de los suyos. Si
    un paso cuadra con lo que sale de sus datos anteriores, la cuenta está bien hecha y no se marca: solo cuenta el
    primer fallo, y solo ese va al cuaderno (origen «tu hoja en papel»).
  - **Con nombre:** si el valor es el que sale con un error típico (13:42 en vez de 09:42), se dice cuál; también si el
    error está en un paso que no escribió. Si dos errores dan lo mismo, se dicen los dos y no se apunta ninguno.
  - **Margen:** el del paso a paso (rumbos ±1°, horas ±3 min, alturas ±0,10 m, millas ±0,3); lo que se mide en la carta
    con transportador o compás, el doble. La parte gráfica se corrige por sus números (rumbo, distancia, situación),
    no por el trazado.
- **El catálogo de fallos típicos (R-55):** para cada paso, qué respuesta equivocada corresponde a qué fallo (13:42 en
  vez de 09:42 es «sumaste el adelanto»). Es trabajo de contenido, tipo a tipo, comprobado por test con los mismos motores
  que las resoluciones. Es el cimiento de la función 2.

## Lo que se descarta

| Propuesta | Motivo |
| --- | --- |
| Más herramientas de dibujo de la mesa para el móvil (R-59) | La pantalla pequeña no da para trazar; se traza en papel (y en el móvil, por intención: H-66) |
| Voz y ayudante hablado | No ayuda a aprobar la carta |
| Ideas vanguardistas sueltas | No resuelven ninguna de las carencias de arriba |
| «Caza el error» como modo propio | Como mucho, un tipo de tarjeta dentro de las dosis |
| «Reconocer» y «Plan» como pantallas separadas | Reconocer pasa a ser el primer paso de la función 1; el orden lo enseña el propio paso a paso |
