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

### 2. Cuaderno de fallos con dosis cortas (R-56)
- Cada respuesta equivocada de un paso se convierte en un fallo con nombre: «sumas el adelanto», «trazas la demora al
  revés». No «fallaste mareas».
- Una dosis de uno o dos minutos solo sobre ese paso, con el pulgar y con reloj: la soltura también se entrena.
- Días después, un problema parecido con otros números y sin pistas. El fallo solo se da por resuelto si se acierta ahí.
- La lista de fallos (abiertos, vigilando, resueltos) y el tiempo por tipo de problema alimentan «¿Estás listo?».

Se apoya en el diagnóstico por tipo de error de las preguntas reales (H-31) y necesita antes el catálogo de fallos (R-55).

### 3. Simulacro con estrategia (R-57)
Cose lo que ya existe (ensayo en papel H-35, velocidad en carta H-36, simulacro de tus errores H-37, tras el examen
H-42 y H-43) y añade:
- **el primer minuto:** hojear el cuadernillo y localizar tablas y anexos;
- **el reparto del tiempo:** qué primero, qué al final y qué no merece la pena;
- **estimar y descartar** las respuestas imposibles cuando no da tiempo;
- **un simulacro completo** de teoría y carta seguidas, al menos uno antes de cada convocatoria, porque el cansancio y el
  reloj también cuentan.

## Huecos que se cubren

- **El paso al papel (R-58):** el alumno resuelve en su hoja, mete el resultado de cada paso y la app le dice en cuál se
  desvió. Lo que se hace en papel también llega al cuaderno de fallos.
- **El catálogo de fallos típicos (R-55):** para cada paso, qué respuesta equivocada corresponde a qué fallo (13:42 en
  vez de 09:42 es «sumaste el adelanto»). Es trabajo de contenido, tipo a tipo, comprobado por test con los mismos motores
  que las resoluciones. Es el cimiento de la función 2.

## Lo que se descarta

| Propuesta | Motivo |
| --- | --- |
| Más herramientas de dibujo de la mesa para el móvil (R-59) | La pantalla pequeña no da para trazar; se traza en papel |
| Voz y ayudante hablado | No ayuda a aprobar la carta |
| Ideas vanguardistas sueltas | No resuelven ninguna de las carencias de arriba |
| «Caza el error» como modo propio | Como mucho, un tipo de tarjeta dentro de las dosis |
| «Reconocer» y «Plan» como pantallas separadas | Reconocer pasa a ser el primer paso de la función 1; el orden lo enseña el propio paso a paso |
