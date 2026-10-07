# Conceptos · grupo navegacion

Rama: `feat/conceptos-navegacion` (desde origin/main). Alcance: PER UT 10 (per-10-*), PER UT 11 (per-11-*),
PY UT 3 (py-3-*), PY UT 4 (py-4-*): 2958 preguntas distintas asignadas a estas clases en los seis bancos
(andalucia, dgmm, baleares × per, py).

Temario: RD 875/2014, anexo II «Realización y temario de las pruebas teóricas», ap. 3 (PER) UT 10–11 y
ap. 4 (PY) UT 3–4 (texto del BOE consolidado, BOE-A-2014-10344). Ojo: algunas clases de data/curso citan
«anexo III» para el programa del PER; en el texto consolidado el temario está en el anexo II (blocks.js ya dice
anexo II). Revisión humana.

## Hecho
- `data/conceptos/navegacion.json`: 86 conceptos + 22 grupos. Temario anclado en todos menos 1
  (`nav.esfera.diferencias`: Δl, ΔL y latitud media no aparecen expresamente en el programa → "pendiente").
- Prefijos: `nav.*` (teoría: esfera, medidas, carta como documento, publicaciones, luces, aguja, Ct, rumbos,
  líneas de posición, viento/corriente, hora, loxodrómica, radar, GNSS, cartas electrónicas, AIS), `mareas.*`
  (teoría y cálculo de mareas), `carta.*` (tipos de problema de carta). Los `carta.*` siguen los tipos de
  `src/exercises/types` y de `src/exams/solutions` (ejercicio: '…'):
  rumbo-distancia → carta.rumbo-distancia · estima-directa → carta.estima · rumbo-pasar-distancia →
  carta.pasar-distancia · situacion-dos-demoras → carta.situacion.dos-demoras · situacion-demora-distancia →
  carta.situacion.demora-distancia · distancia-faro → carta.situacion.enfilacion · situacion-dos-distancias →
  carta.situacion.distancias · demoras-no-simultaneas → carta.situacion.no-simultaneas · abatimiento →
  carta.viento · corriente-efectiva / corriente-rumbo-a-dar / corriente-desconocida → carta.corriente.* ·
  estima-analitica → carta.loxodromica.directa | .inversa (partido en dos, como el temario 4.8) ·
  ct-enfilacion → nav.ct.enfilacion · conversion-rumbos → nav.ct.convertir · marea-sonda →
  mareas.sonda-instante / mareas.hora-sonda / mareas.sonda-pleamar-bajamar. Nuevo sin tipo previo:
  carta.situacion.traves (py-4-6), carta.coordenadas (11.1).
- Las conversiones y cálculos de Ct (`nav.ct.*`) sirven igual a teoría y a carta (mismo saber).
- Piloto (conjunto oro) `.trabajo-conceptos/piloto-navegacion.json`: 437 preguntas (14,8 %), 1–2 conceptos
  cada una (129 con dos; el primero es lo que se pregunta, el segundo cómo se obtiene la situación o un paso
  clave), en tres rondas:
  1. muestra sistemática: 1 de cada 10 por clase y eje (310) → 310/310 encajan (100 %);
  2. control: 1 de cada 25 con desfase distinto (92), etiquetada con el catálogo ya cerrado → 91/91 (100 %) +
     1 fuera de alcance (bal-py-2019-12-a-27, NAVTEX: es de seguridad-legislacion);
  3. refuerzo: 36 elegidas a mano para que todos los conceptos tengan ejemplos (12 conceptos no salían en 1–2).
  Ajustes tras medir: «campo magnético» pasa a nav.aguja.declinacion (nota ampliada con magnetismo terrestre);
  la loxodrómica en Mercator del PER va a nav.carta.mercator (nav.loxodromica.* es solo PY); se añadieron
  clases a 6 conceptos (carta.rumbo-distancia, carta.estima, carta.pasar-distancia, carta.viento,
  nav.rumbos.tipos, nav.ct.convertir).
  Reparto: and/per 48 · dgmm/per 51 · bal/per 125 · and/py 98 · bal/py 88 · dgmm/py 27.
- `npm run precache` hecho (data/conceptos/navegacion.json es fichero servido); `npm test` pasa.

## Pendiente
- Etiquetar el resto de preguntas (lo hará el buscador de candidatos con el piloto como oro) en
  `data/ejes/<eje>/<tit>/conceptos.json` (no creado aún por este grupo).
- `data/conceptos/index.json` lo crea la rama del motor (feat/conceptos-motor) con todos los grupos; aquí no se
  toca para no chocar. sw-lista.js chocará al fusionar ramas: basta `npm run precache` tras la fusión.

## Cómo seguir
- Scripts de trabajo (fuera del repo, en el scratchpad de la sesión): catalogo.py genera el JSON del catálogo;
  muestra.py / holdout.py sacan las muestras; piloto_*.py tienen las etiquetas a mano; piloto.py valida y mide.
  Si se pierden, el JSON del catálogo y el del piloto son la fuente: se editan a mano.

## Relaciones con otros grupos (para revisión)
- meteorologia: viento real/aparente (PER 9; hay una pregunta suelta en per-10-9, dgmm-per-2023-06-38);
  presión atmosférica (mareas.meteorologia la usa solo por su efecto en la marea); corrientes marinas (PY 2.8)
  frente a nav.viento-corriente.deriva (efecto en el rumbo).
- balizamiento-ripa: ritmos y colores de luces (nav.luces.* es la lectura en la carta; el balizamiento IALA es
  suyo). Hay preguntas de balizamiento mal asignadas a per-10-2 y per-10-7 (dgmm-per-2022-04-84,
  dgmm-per-2019-06-39, dgmm-per-2022-10-37). RIPA: el AIS «ayuda a evitar abordajes» (nav.ais.*).
- seguridad-legislacion: NAVTEX, radioavisos/AVURNAVES y GMDSS (nav.publicaciones.avisos solo cubre la
  publicación «Avisos a los Navegantes» y su diferencia con los radioavisos); cartas obligatorias a bordo
  (nav.cartas-electronicas.ecdis-papel) roza el equipo obligatorio.
- nomenclatura-maniobra: obra viva/obra muerta (aquí solo como causa de abatimiento/deriva); línea de crujía;
  «socairear… rumbo para que el viento aparente sea cero» (PER 7).

## Dudas para revisión humana
- nav.esfera.diferencias: temario «pendiente» (lo preguntan Baleares PER y PY, no está en el programa).
- nav.rumbos.cuadrantal-circular: el programa excluye pasar de circular a cuadrantal, pero Baleares lo pregunta.
- carta.loxodromica dividido en directa/inversa (los ejercicios lo tienen en un solo tipo).
- mareas.sonda-pleamar-bajamar se usa también en el PY cuando el enunciado pide la sonda en una pleamar o
  bajamar (Baleares la pone en py-3-6).
- Preguntas mal colocadas en practica.json dentro de mi alcance (ejemplos): py-3-10 trae radar, GNSS, avisos y
  NAVTEX; py-3-8 trae abatimiento, hora y Ct; py-3-5 trae latitud y longitud; per-10-3 trae «un nudo es»;
  py-4-10 trae una situación por marcaciones no simultáneas (bal-py-2017-07-b-31).
