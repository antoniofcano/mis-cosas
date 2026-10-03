# Patrón de Yate en voz alta

Guiones de podcast para preparar la teoría del Patrón de Yate (Andalucía). Están escritos para que una IA de síntesis de voz los convierta en audio. Hablan dos voces:

- **Elena**: patrona de yate y profesora. Es la divulgadora.
- **Andrés**: alumno jubilado con un velero de nueve metros. Pregunta, se equivoca en las trampas típicas y razona en voz alta.

Cada tema se cuenta en dos niveles:

- **Panorama**: un episodio que recorre el tema entero, para situarse antes de estudiarlo y para repasarlo la semana del examen.
- **Profundiza**: un episodio por epígrafe, o por grupo de epígrafes cortos, con los detalles y las trampas del examen.

Cada episodio dura entre diez y quince minutos, unas 1.600–2.300 palabras habladas. Todo el contenido sale de las clases de la app, para que audio, clases y preguntas digan lo mismo.

## Episodios

Estado: ✅ escrito · ⏳ pendiente

| Nº | Tipo | Título | Lecciones | Estado |
|---|---|---|---|---|
| 0 | Bienvenida | Cómo es el examen del PY y cómo usar estos podcasts | — | ⏳ |
| **Tema 1 · Seguridad en la mar** | | | | |
| 1.0 | Panorama | Seguridad en la mar: estabilidad, equipo y emergencias | py-1-1 … py-1-10 | ⏳ |
| 1.1 | Profundiza | Por qué flota un barco y por qué vuelca | py-1-1, py-1-2 | ✅ |
| 1.2 | Profundiza | Mover pesos sin volcar: traslados, consumos, superficies libres, duro y blando | py-1-3 | ⏳ |
| 1.3 | Profundiza | Chalecos, aros y la balsa salvavidas | py-1-4, py-1-5 | ⏳ |
| 1.4 | Profundiza | Hacerse ver y apagar fuegos: pirotecnia, señales y extintores | py-1-6, py-1-7 | ⏳ |
| 1.5 | Profundiza | Cuando todo falla: abandono, balsa, radiobaliza y helicóptero | py-1-8, py-1-9, py-1-10 | ⏳ |
| **Tema 2 · Meteorología** | | | | |
| 2.0 | Panorama | El tiempo que hace en la mar | py-2-1 … py-2-9 | ⏳ |
| 2.1 | Profundiza | Isobaras, borrascas y anticiclones | py-2-1 | ⏳ |
| 2.2 | Profundiza | Masas de aire y frentes | py-2-2 | ⏳ |
| 2.3 | Profundiza | Los modelos de viento: Euler, geostrófico, de gradiente… | py-2-3 | ⏳ |
| 2.4 | Profundiza | Vientos regionales del Mediterráneo y del Atlántico | py-2-4 | ⏳ |
| 2.5 | Profundiza | Humedad, nubes y nieblas | py-2-5, py-2-6, py-2-7 | ⏳ |
| 2.6 | Profundiza | Olas y corrientes marinas | py-2-8, py-2-9 | ⏳ |
| **Tema 3 · Teoría de navegación (eliminatorio)** | | | | |
| 3.0 | Panorama | La teoría de navegación de un vistazo | py-3-1 … py-3-10 | ⏳ |
| 3.1 | Profundiza | La esfera terrestre y la corrección total | py-3-1, py-3-2 | ⏳ |
| 3.2 | Profundiza | Viento y corriente: abatimiento, deriva y rumbo efectivo | py-3-3 | ⏳ |
| 3.3 | Profundiza | Loxodrómica y estima analítica | py-3-4 | ⏳ |
| 3.4 | Profundiza | La hora en la mar: TU, civil, legal, oficial y la del reloj de bitácora | py-3-5 | ⏳ |
| 3.5 | Profundiza | Mareas: el Anuario y la curva | py-3-6 | ⏳ |
| 3.6 | Profundiza | Publicaciones náuticas y avisos | py-3-7 | ⏳ |
| 3.7 | Profundiza | El radar | py-3-8 | ⏳ |
| 3.8 | Profundiza | GPS, cartas electrónicas y AIS | py-3-9, py-3-10 | ⏳ |
| **Tema 4 · Carta de navegación (eliminatorio)** | | | | |
| 4.0 | Panorama | El examen de carta, paso a paso | py-4-1 … py-4-10 | ⏳ |
| 4.1 | Profundiza | La corrección total en la carta: enfilaciones, oposiciones y la Polar | py-4-1 | ⏳ |
| 4.2 | Profundiza | El viento en la carta y pasar a distancia de un faro | py-4-2, py-4-3 | ⏳ |
| 4.3 | Profundiza | Situarse: líneas de posición y faro por el través | py-4-4, py-4-6 | ⏳ |
| 4.4 | Profundiza | Estima con viento y corriente | py-4-5 | ⏳ |
| 4.5 | Profundiza | Corriente conocida y desconocida | py-4-7, py-4-8 | ⏳ |
| 4.6 | Profundiza | Mareas con números: sonda y hora | py-4-9 | ⏳ |
| 4.7 | Profundiza | Estima analítica: la derrota loxodrómica | py-4-10 | ⏳ |

Los episodios de carta no pueden dibujar: cuentan el razonamiento y el orden de los pasos, que es donde se falla. El trazado se practica en la app.

## Formato de los guiones (para la síntesis de voz)

- Cabecera YAML con la serie, el episodio, el tipo, el tema, el título, las lecciones, la duración estimada y la descripción de cada voz.
- Cada intervención va en un bloque `**NOMBRE:** texto`.
- Las acotaciones van entre corchetes y no se leen: `[pausa]` es un segundo, `[pausa larga]` son tres y sirven para pensar en el minijuego, `[ríe]` es una risa.
- Las cifras van en letra («doscientos diez grados», «uno coma cero dos cinco»).
- Las letras de los puntos y las siglas van como se pronuncian («ge», «ge-eme», «te-u»), para que la voz no las deletree mal.
- Dentro del diálogo no hay tablas, listas ni fórmulas con símbolos.

## Estructura de cada episodio

1. **Gancho.** Una situación real en el barco de Andrés.
2. **Explicación.** En diálogo, con los «ojo, que esto cae» en el momento en que aparecen.
3. **Minijuego.** Dos o tres preguntas de exámenes reales, leídas con sus opciones y con una pausa para pensar.
4. **Resumen para llevarse.** De treinta a cuarenta segundos, y la despedida («buena mar»).
