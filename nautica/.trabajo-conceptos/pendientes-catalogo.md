# Pendientes del catálogo · contraste con fuente oficial

Rama `feat/catalogo-pendientes` (desde origin/main). Versiones: `balizamiento-ripa` 7 -> 8, `navegacion` 5 -> 6,
`meteorologia` 5 -> 6. `npm run conceptos -- validar` sin errores; `npm run precache` (regenera `sw.js` y
`sw-lista.js`), `node --check sw.js` y `npm test` (1887 pasan, 4 omitidas, 0 fallos).

## Fuentes usadas

- **RIPA**: texto consolidado del BOE del Convenio COLREG 1972, **BOE-A-1977-15605**, leído por la API de datos
  abiertos (`/datosabiertos/api/legislacion-consolidada/id/BOE-A-1977-15605/texto`). Trae cada regla con todas sus
  versiones; se ha usado la última de cada una: Reglas 23, 31, 33 y 35 según la Res. A.910(22) (BOE-A-2003-2716, en
  vigor 29-11-2003); Regla 26 según la Res. A.736(18) (BOE-A-1994-22801, en vigor 4-11-1995); el resto según la
  Res. A.464(XII) (BOE-A-1983-17575) o el texto original. Esto cierra la reserva de la ronda anterior («no pude
  abrir el RIPA en el BOE»).
- **Cesto (Regla 26)**: además, el BOE núm. 249 de 18-10-1994, pp. 32452-32462 (enmiendas aprobadas por el MSC 61,
  Res. A.736(18)): «1. Regla 26 b) i): Suprímanse las palabras "los buques de eslora inferior a 20 metros podrán
  exhibir un cesto en lugar de esta marca;". 2. Regla 26 c) i): [ídem]». En vigor el 4-11-1995.
- **SOLAS V**: BOE-A-2002-24637 (BOE núm. 302 de 18-12-2002, Res. MSC.99(73), capítulo V nuevo, en vigor 1-7-2002;
  PDF A44294-44381, texto por OCR) y BOE-A-2011-10532 (BOE núm. 144 de 17-06-2011, Res. MSC.282(86), en vigor
  1-1-2011), que da la redacción vigente de V/19.2.1.4.
- **RD 339/2021**: texto consolidado BOE-A-2021-8268, art. 12.1 (tabla y nota *) y 12.2.c).
- **Estrecho**: NGA (EE. UU.), *Sailing Directions (Planning Guide) Pub. 140, North Atlantic Ocean and Adjacent
  Seas*, 18.ª ed. 2025, capítulo «Mediterranean Sea», apartados de corrientes y «Strait of Gibraltar» (p. 446); y
  *Sailing Directions (Enroute) Pub. 131, Western Mediterranean*, 19.ª ed. 2025, Sector 1, 1.1 «Tides—Currents».
  Descargadas de msi.nga.mil (no se suben).

## 1. Regla 25 e) (ripa.marcas.vela-motor) · RESUELTO

Texto vigente (BOE-A-1977-15605, versión de 1983, la 25 e) no ha cambiado desde 1972): «Un buque que navegue a vela,
cuando sea también propulsado mecánicamente, deberá exhibir a proa, en el lugar más visible, una marca cónica con el
vértice hacia abajo.» **No hay exención para menos de 12 m** (la Regla 25 no contiene ninguna por eslora en esta
letra). Nota corregida: lo dice expresamente. Las preguntas que den por buena una exención de < 12 m contradicen el
RIPA (no se tocan aquí).

## 2. Regla 26 y el cesto (ripa.marcas.pesca) · RESUELTO

La alternativa del cesto para pesqueros de menos de 20 m existía en el texto de 1972 y **se suprimió** por la
Res. A.736(18) (BOE 18-10-1994), en vigor desde el 4-11-1995. El texto consolidado vigente de 26 b) i) y c) i) ya no
la contiene. Nota corregida: dos conos sea cual sea la eslora; la «cesta» no es una marca del RIPA. Para
bal-per-2025-12-b-22 («Una cesta, si su eslora es inferior a 25 metros»): el distractor a) es falso por partida doble
(la alternativa ya no existe y, cuando existía, era para < 20 m); la correcta oficial d) es coherente.

## 3. Cifras y letras de las Reglas 20 a 37 · REVISADO

Contrastadas una a una contra el texto vigente del BOE las notas de: ripa.luces.cuando, def.tope, def.costado,
def.alcance, def.remolque, def.todo-horizonte, motor, motor-pequeno (23 d) tras la A.910(22)), aerodeslizador-wig
(23 b), c) y 31), remolcador, remolcado (24 g)), vela, vela-pequena-remo, pesca-arrastre, pesca-otra, sin-gobierno,
maniobra-restringida, draga, buceo, calado, practico, varado, senales.pitadas, senales.equipo (33 a) según A.910(22):
pito >= 12 m, campana >= 20 m, gong >= 100 m), senales.maniobra, senales.luminosas (5 millas, ~1 s, >= 10 s),
senales.duda, niebla.motor, larga-dos-cortas, remolcado, practico (35 k)), fondeado-varado, llamar-atencion,
canal.adelantar (34 c)), canal.recodo (34 e)). Coinciden: 225°/22,5°, 112,5°, 135°/67,5°, 120 centelleos/min, 200 m,
25 m, 100 m, 150 m, 50 m, 12 m, 7 m/7 nudos, 1 m de la bandera «A», etc.

Corregidas (además de 1 y 2):
- `ripa.niebla.pequenas`: decía «no obligados a las señales de campana/gong»; la 35 i) habla solo de «las señales de
  campana prescritas en los párrafos g) y h)». Nota ajustada.
- `ripa.luces.fondeado`: la exención de < 7 m (30 e)) es fuera y lejos de «canal angosto, paso, fondeadero o zona de
  navegación frecuente», no solo «canales y fondeaderos». Nota ajustada.
- `ripa.luces.dragaminas`: se añade que van además de las luces de motor o de fondeado, la posición (tope del palo de
  proa y penoles de su verga) y que el texto español del BOE dice «acercarse a menos de 1.000 metros **por la popa**».

Regla 22 (excluida del programa; ningún concepto da sus cifras, solo se cita como excluida). Para referencia, el BOE
dice: >= 50 m: tope 6, costado 3, alcance 3, remolque 3, todo horizonte 3 millas; 12 a < 50 m: tope 5 (3 si < 20 m),
resto 2; < 12 m: tope 2, costado 1, resto 2; objetos remolcados poco visibles: blanca todo horizonte 3 millas.

Observaciones del texto del BOE (no se cambia nada por ellas):
- 27 f): el BOE traduce «a menos de 1.000 metros por la popa del buque»; si algún banco pregunta «por la proa» o «a
  su alrededor», conviene mirar el original inglés (lengua auténtica) antes de dar una respuesta por mala.
- 35 h): el BOE remite al gong «prescrita en el párrafo f)», errata heredada de la renumeración de 1983 (es el g)).
- 32: el BOE rotula «e)» la definición de pitada larga (es la c)). Errata de transcripción.

## 4. SOLAS V/19, V/27 y RD 339/2021 (nav.cartas-electronicas.ecdis-papel) · RESUELTO

- V/19.2.1.4 vigente (MSC.282(86), BOE-A-2011-10532): «cartas y publicaciones náuticas para planificar y presentar
  visualmente la derrota del buque para el viaje previsto y trazar la derrota y verificar la situación durante el
  viaje. También se aceptará un sistema de información y visualización de cartas electrónicas (SIVCE) para cumplir
  esta obligación de llevar cartas náuticas. Los buques a los que se aplica el párrafo 2.10 cumplirán las
  prescripciones sobre los SIVCE…». (La redacción de 2000 decía «Se podrá aceptar».)
- V/19.2.1.5 (MSC.99(73), BOE-A-2002-24637): «medios auxiliares para cumplir las prescripciones funcionales del
  apartado .4 si esa función se lleva a cabo parcial o totalmente por medios electrónicos». El texto **no** dice
  «cartas de papel»: el respaldo es cualquier medio auxiliar que cumpla la función.
- V/27 (MSC.99(73)): «Las cartas y publicaciones náuticas, tales como derroteros, cuadernos de faros, avisos a los
  navegantes, tablas de mareas y otras publicaciones náuticas que se precisen para el viaje previsto serán las
  apropiadas y estarán actualizadas.»
- V/1.4: la Administración determina en qué medida no se aplican las reglas 15 a 28 a los buques de < 150 GT, a los
  de < 500 GT sin viajes internacionales y a los pesqueros.
- RD 339/2021, art. 12.2.c): «Se llevarán las cartas actualizadas que cubran los mares por los que se navegue y los
  portulanos de los puertos que se utilicen, así como los útiles necesarios para su uso.» Tabla del 12.1: cartas en
  zonas 1 a 4; nota *: también en 5, 6 y 7 si tiene espacio habitable cerrado de gobierno y categoría de diseño A o B.
  No precisa soporte ni menciona el SIVCE.

Nota reescrita con esas citas; se mantiene que la preferencia por el papel es del tribunal DGMM (dgmm-py-2020-12-24),
no de la norma.

## 5. Corriente del Estrecho (meteo.corrientes.estrecho) · RESUELTO CON FUENTE OFICIAL EXTRANJERA

**No se ha podido consultar el Derrotero del IHM** (n.º 3, tomo I, «Costas norte y sur del Estrecho…»; no está
publicado en abierto). Se ha usado el derrotero oficial de EE. UU. (NGA), que es una publicación náutica oficial de un
servicio hidrográfico. Lo que dice:

- Pub. 140, «Strait of Gibraltar»: «The net inward surface flow averages about 1 knot.» «To the E of the sill the
  surface current is higher (3.5 knots) than to the W of the sill (2 knots)». «In the middle of the strait the
  maximum current speeds at springs are higher than 3 knots.» La corriente total (media + marea) se invierte en
  superficie durante el ciclo semidiurno en la zona del umbral; en la entrada E, cerca de Gibraltar, no se invierte.
  Con levante de verano de hasta 35 nudos durante una semana, «the surface flow [increases] up to 5 knots in the
  downwind direction».
- Pub. 140, circulación general: la corriente superficial «slows from about 2 knots in the Strait of Gibraltar to
  about 1 knot in the Alboran Sea».
- Pub. 131, Sector 1, 1.1: corrientes de marea de 1 nudo al S de Trafalgar, 1,7 al S de Camarinal, hasta 2 nudos en
  cada sentido entre Tarifa y Punta Europa y hasta 3 nudos en cada sentido cerca de las costas.

Conclusión: el orden de magnitud oficial es **1 a 3,5 nudos** de corriente media según la zona, con picos de más de
3 nudos en mareas vivas y hasta 5 con levante duro. Las cifras de Baleares («hasta 6 nudos», «de 4 a 7 nudos») quedan
por encima de lo que dice el derrotero; «4 a 7» no tiene respaldo en estas fuentes. Nota corregida con esas cifras y la
cita.

### Propuesta para la clase py-2-9 (NO editada)

`data/curso/py.json`, línea ~3443, dice: «… es más intensa a la altura de Tarifa, donde puede rondar los 2 nudos, y se
refuerza o debilita con los vientos de poniente o levante. Encima se suman unas corrientes de marea fuertes.»
Propuesta: «… es más intensa en la parte oriental (de Tarifa a Gibraltar): de media, unos 2 nudos al W del umbral de
Camarinal y unos 3,5 al E; con las corrientes de marea encima (hasta 2 nudos en el centro y 3 junto a las costas)
pasa de 3 nudos en mareas vivas y, en la zona del umbral, llega a invertirse en superficie; un levante fuerte y
duradero puede llevarla hasta unos 5 nudos. (NGA Pub. 140 y Pub. 131, 2025)».

## No resuelto

- Derrotero del IHM: no consultado (sin acceso en abierto). Si el responsable lo tiene, conviene contrastar las cifras
  del punto 5 y, si difieren, preferir el IHM.
- Preguntas que dependan de la exención de < 12 m en 25 e) o del cesto: no se han buscado ni tocado (fuera del
  alcance: solo catálogo).
