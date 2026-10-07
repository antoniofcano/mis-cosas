# La ruta del curso

Hasta ahora el curso se daba tema a tema: todas las clases de un tema y después el siguiente. En el PY hay solo cuatro
temas de nueve o diez clases cada uno, y eso eran semanas seguidas con estabilidad o con meteorología. La ruta
**intercala temas en tramos cortos** (dos o tres clases de un tema y se pasa a otro) y **respeta las dependencias**
entre clases: nunca se llega a una clase antes que a las que la sostienen.

## Dependencias: `requiere`

Cada clase de `data/curso/<tit>.json` declara `requiere`: las clases **del mismo curso** en las que se apoya. Es
distinto de:

- `refresco` (solo PY): las clases del PER que da por sabidas («¿Te falta base del PER?»).
- `usadoEn` del apéndice de matemáticas: las cuentas que da por sabidas («Repasa: …»).

Criterio: solo prerrequisitos reales y directos (lo que la clase usa sin volver a explicarlo), sin repetir los que ya
vienen por transitividad. Una clase que vuelve a contar lo básico (p. ej. «Viento, corriente y olas» repite qué es el
abatimiento) no lo requiere. Los tests (`tests/ruta.test.js`) exigen que todos los ids existan y sean del mismo curso,
que no haya ciclos y que cada requisito vaya antes en la ruta por defecto.

Resumen del grafo:

| Curso | Clases | Con requisitos | Dependencias | Entre temas |
|---|---|---|---|---|
| PER | 86 | 49 | 62 | 10 (fondeo ← equipo de fondeo; maniobra ← timón y hélice; vías de agua ← estructura del casco; abandono ← equipo de seguridad; carta ← teoría de navegación) |
| PY | 39 | 22 | 25 | 4 (carta ← teoría de navegación: corrección total, viento y corriente, mareas, loxodrómica) |

Las cadenas largas son las de navegación: en el PY, `3-1 → 3-5 → 3-6 → 4-9` (esfera → hora → mareas → mareas en la
carta) y `3-2 → 4-1 → 4-2 → 4-5 → 4-6/4-7/4-8` (corrección total → viento → estima con viento y corriente → través y
corrientes); en el PER, `10-5 → 10-6 → 11-2 → 11-3 → 11-4 → 11-8`. En RIPA, todo cuelga de las definiciones (6-1) y las
luces de los pesqueros (6-8) de las primeras luces (6-7).

## La ruta por defecto: `data/curso/ruta-<tit>.json`

```json
{ "tit": "py", "generada": { "ritmo": 2, "ventana": 4, "pesos": { "3": 1.5, "4": 1.5 } }, "retoques": [],
  "tramos": [ { "ut": 3, "lecciones": ["py-3-1", "py-3-2"] }, { "ut": 4, "lecciones": ["py-4-1"] }, … ] }
```

Un tramo es una tanda de clases seguidas de un mismo tema. La app la adjunta al curso al cargarlo (`curso.ruta`) y la
siguen **Hoy** (`planHoy`), el **plan con fecha** y el **calendario** (`unidades`), y `hoyToca`. Las tandas de
preguntas de un tema van justo después de su última clase en la ruta. Temario sigue agrupado por temas, marca la
siguiente clase de la ruta y enseña de qué clases depende cada una.

### Cómo se genera y se retoca

```bash
node tools/ruta.mjs py --ritmo 2 --ventana 4 --pesos 3:1.5,4:1.5   # propone (no escribe)
node tools/ruta.mjs py --ritmo 2 --ventana 4 --pesos 3:1.5,4:1.5 --escribir
# …retoques a mano en el JSON (anotados en «retoques»)…
node tools/ruta.mjs py --comprobar                                  # todas, sin repetir, respeta «requiere»
```

El generador (`generarRuta` en `src/course/ruta.js`) abre los temas en el orden de estudio de la titulación
(`ordenEstudio`), `ventana` a la vez; en cada turno elige el tema abierto que menos turnos lleva (ponderado por
`pesos`), nunca el mismo del turno anterior si hay otro que pueda seguir, y toma sus siguientes clases hasta `ritmo`
mientras tengan ya dado lo que requieren (si quedaría una clase suelta, se suma al tramo). `--escribir` pisa los
retoques: después de regenerar hay que volver a hacerlos.

### PY: navegación primero, los cuatro temas alternándose

`ritmo 2`, `ventana 4`, pesos 1,5 para Teoría de navegación y Carta. Sin retoques.

1. Teoría (esfera, corrección total) → Carta (corrección total en la carta) → Seguridad (flotabilidad, metacentro) →
   Meteorología (isobaras, frentes) → Teoría (viento y corriente, loxodrómica) → Carta (viento, tangente con viento) → …
2. Los dos temas del módulo de navegación son los que tienen límite de fallos (5 en Teoría, 3 en Carta) y los que más
   práctica piden: arrancan los primeros y salen con algo más de frecuencia (peso 1,5), así que terminan antes (tramo
   16 de 19) y dejan tiempo para sus tandas y la carta. Seguridad y Meteorología no se dejan para el final: entran
   desde el tercer tramo.
3. Los tramos son de dos clases (tres cuando quedaría una suelta) y nunca se repite tema dos tramos seguidos.

### PER: cerca del orden de siempre, con intercalado ligero

`ritmo 3`, `ventana 2`. Se mantiene el orden de estudio (Nomenclatura, Balizamiento, RIPA, Teoría, Carta, y después
Amarre, Seguridad, Legislación, Maniobra, Emergencias y Meteorología), pero con dos temas abiertos a la vez:
Nomenclatura ↔ Balizamiento, Balizamiento ↔ RIPA, RIPA ↔ Teoría, Teoría ↔ Carta, Carta ↔ Amarre… Los temas con límite
de fallos (Balizamiento, RIPA, Carta) empiezan en el mismo sitio o antes que tema a tema; RIPA (10 preguntas, 5
fallos) arranca en la clase 13 (como tema a tema) y Balizamiento en la 4 (tema a tema, en la 8).

Retoque a mano: Meteorología quedaba con sus siete clases seguidas al final; se parte en dos tramos (9-1 a 9-3 antes
del último tramo de Emergencias y 9-4 a 9-7 al final).

## Avisos al alumno

- En la intro de cada clase, «Se apoya en: …» con enlaces (✓ si ya está vista), como la base del PER y el apéndice.
- Al abrir desde Temario (o desde un enlace) una clase sin empezar que se apoya en otras sin ver, un aviso antes de la
  primera tarjeta: «Esta clase se apoya en: …», con «Ver antes: …» y «Empezar igualmente». Al ir a una de ellas,
  «← Volver a tu clase» devuelve a la que se quería empezar.

## Progreso de quien ya estudiaba

Nada se migra: la ruta solo cambia **qué viene después**. Lo hecho sigue hecho (los registros son por clase); una
clase a medias se propone la primera; después, la primera clase sin terminar de la ruta. Los ids de las unidades del
plan con fecha no cambian (`clase:<id>`, `tanda:<ut>:<k>`), así que un plan guardado sigue valiendo. «¿Estás listo?» y
el examen final no dependen de la ruta.

## Configuración del profesor

Un profesor puede preparar **su** ruta, sus reglas para recordar y sus chuletas y pasárselas a sus alumnos en un
fichero. Solo cambia lo que ve quien lo importa; los datos por defecto de la app no cambian nunca.

- **Modo profesor** (`#/profe`, Ajustes → «Soy profesor: preparar una configuración», `src/ui/views/profe.js`):
  1. autor, nombre y titulación;
  2. la ruta: se reordena arrastrando o con ↑ ↓ (botones de 48 px, accesibles con teclado y lector de pantalla); un
     movimiento que pondría una clase antes de una que requiere se bloquea y se dice por qué;
  3. las reglas para recordar: añadir, editar, ocultar (y volver a la original);
  4. la chuleta de cada clase (una línea por punto);
  5. vista previa: qué cambia, la ruta por tramos, las reglas y chuletas tocadas;
  6. «Exportar configuración (.json)» (descarga) o «Copiar el texto».
  Lo preparado se guarda como borrador en el aparato del profesor (`settings.borradorProfe`).
- **Alumno** (Ajustes → «Usar la configuración de mi profesor», `src/ui/config-profe.js`): elegir el fichero o pegar el
  texto; se valida, se enseña qué cambia (y los avisos) y se confirma. Queda en `settings.configProfe` (entra en las
  copias de seguridad) y se quita cuando se quiera («Quitarla y volver a la ruta por defecto»). Mientras está puesta,
  Hoy y Temario dicen, discretamente, «🧑‍🏫 Ruta de: <autor>»; la chuleta cambiada sale como «Chuleta de tu profesor».
- **Un solo sitio** aplica la configuración (`src/course/config-profe.js`: `aplicarConfigCurso`, `aplicarConfigReglas`),
  llamado desde `src/bancos/index.js` al cargar el curso y las reglas (`fijarConfigProfe` le dice de dónde leerla).
  Simulacros, exámenes reales y examen final no cambian: las preguntas, el tiempo y la corrección son los de siempre.

Formato (versión 1):

```json
{ "version": 1, "autor": "Marta Ruiz", "nombre": "Grupo de tarde", "fecha": "2026-10-07", "tit": "py",
  "ruta": ["py-3-1", "py-3-2", "py-4-1", …],
  "reglas": { "añadir": [{ "regla": "…", "significado": "…" }], "cambiar": { "r01": { "regla": "…" } }, "quitar": ["r02"] },
  "chuletas": { "py-4-9": "Primero, pasa a UT.\nLuego, la tabla." } }
```

Validación estricta (`validarConfig`): solo esos campos, con su tipo y tamaño (fichero ≤ 300 KB; textos recortados);
ids con forma de id; sin claves raras (`__proto__` incluido). No se ejecuta nada: el texto se limpia (sin caracteres
de control, de anchura cero ni de dirección) y se pinta siempre como texto. Lo que no se entiende es un error y el
fichero no se usa; las clases o reglas que la app no conoce son avisos y esa parte se ignora. Una ruta que no respeta
`requiere` (también contando las clases que no nombra, que van al final) se avisa y se sigue la ruta por defecto. La
configuración guardada se vuelve a validar al leerla (puede venir de una copia editada a mano).
