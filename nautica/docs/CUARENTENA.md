# Cuarentena de lo reservado

Cada eje reserva sus convocatorias más recientes para el **examen final** (docs/BANCOS.md, «reserva»): el alumno lo
hace una vez y con preguntas que no ha visto nunca. La cuarentena es la regla de que **ningún contenido de la app las
cite** —ni por su id ni leyendo su enunciado—, para que nadie las vea antes por una puerta lateral (una pausa del
podcast, un ejemplo de una clase, la explicación de otra pregunta…). La regla está resumida en docs/BANCOS.md
(«Cuarentena»); aquí van el inventario, lo hecho y el plan de la fase 2.

## Qué cuenta como cita

`tools/cuarentena.mjs` recorre todo lo servido (`index.html`, `llms.txt`, `src/`, `data/`) y las fuentes del audio del
podcast (`podcast/episodios.json` y los guiones `podcast/<tit>/*.md`, que no se sirven pero de ellos sale el audio), y
apunta cada sitio donde aparece una pregunta reservada de cualquier eje y titulación:

- **por id** (también los abreviados tras uno completo: «and-py-2022-c1-n11, 2024-c1-n11»);
- **por texto**: el enunciado casi literal (al menos el 60 % de sus tejas de cuatro palabras en un mismo texto). No se
  buscan los enunciados cortos (menos de 9 palabras), los que tienen una gemela pública (la misma pregunta publicada
  con otro id) ni los que casi enteros ya salen en preguntas públicas: citarlos no delata nada.

No son citas los datos de la propia pregunta: su fila del banco, su explicación y sus conceptos, su solución
programada y su figura.

Cada cita lleva su **alcance**:

| Alcance | Qué es | ¿Lo deja pasar el test? |
|---|---|---|
| visible | el alumno lo ve o lo oye (pausas y audio del podcast, explicaciones, clases, mapas, chuleta, código) | no |
| latente | va en un fichero servido pero la app no lo enseña (práctica y resueltos, que el motor filtra; la verificación de las clases; la lista de preguntas de la ficha del podcast) | no |
| fuente | fuente del audio, no servida (episodios.json, guiones) | no |
| metadato | cuelga de la propia reservada y solo se usa cuando ella sale (las reglas nemotécnicas que la ayudan; el `excepto` de los resueltos, que impide que caiga en otra clase) | sí |

`tests/cuarentena.test.js` falla con cualquier cita que no sea metadato y no esté en la deuda del audio
(`tools/cuarentena-deuda.json`, `deuda`) ni en los falsos positivos revisados a mano (`permitidas`, cada uno con su
motivo). La deuda no puede crecer (`MAX_DEUDA`), es solo audio del podcast de episodios grabados y cada entrada tiene
que seguir existiendo: al regrabar un episodio, sus entradas se quitan (`node tools/cuarentena.mjs --deuda`) y se baja
`MAX_DEUDA`. Cuando la reserva de un eje cambie (una convocatoria nueva entra en el examen final), el test señalará las
citas nuevas: `node tools/cuarentena.mjs --arreglar` arregla las baratas.

## En la app (sin tocar el audio)

- **Pausas del podcast**: la pregunta de una pausa que es reservada para el examen final del alumno no se enseña; se
  cambia por su equivalente del estudio del mismo eje (por concepto o por parecido, `equivalente()` de
  `src/bancos/index.js`, lo que ya hacía con las de otro eje). Si no la hay, la pausa queda sin pregunta con un aviso
  discreto («Esta pregunta es del examen final: aquí no se enseña»). Cuando el alumno ya ha hecho su examen final de
  ese eje y titulación, la pausa enseña la del guion.
- **Aviso en el episodio**: si el audio lee una pregunta reservada para el examen final del alumno (las del minijuego,
  `preguntas` de la ficha del episodio; `reservadaDe()` de `src/bancos/index.js`) y aún no lo ha hecho, la ficha del
  episodio avisa antes de escucharlo, sin bloquear: «Este episodio comenta una pregunta del examen final; mejor
  escúchalo después de hacerlo».

## Fase 1 (hecha): lo barato, en texto

Antes de la fase 1 había **1066 citas a 426 preguntas reservadas** (todas de Andalucía salvo una de DGMM): práctica 441,
clases 174, reglas 151, podcast 284 (líneas 76, fichas 79, episodios.json 79, guiones 50), resueltos 14, explicaciones 2.

- **Práctica** (`practica.json` de Andalucía PER y PY): fuera las 441 reservadas; en 36 casos entra en su lugar la
  equivalente del estudio de la misma clase y tema (gemela, mismo concepto o texto parecido). El alumno no nota nada: el
  motor ya las filtraba (`practicaDe`).
- **Resueltos**: fuera las 7 reservadas de las listas `ids` (el `excepto` se queda: es metadato).
- **Verificación de las clases** (`data/curso/*.json`, `verificacion[].fuente|dato`): 131 citas de plantillas; la
  reservada se cambia por su gemela pública si la hay o por `[pregunta reservada]`, sin tocar lo demás de la cita.
- **Guiones sin audio** (23 episodios del PER, temas 2–4 y 6–11): las 32 preguntas reservadas de sus minijuegos se
  cambiaron por otras del estudio del mismo tema (lectura de Elena, respuesta de Andrés y confirmación reescritas;
  las de carta, con las medidas de la solución programada de la nueva pregunta). `podcast/episodios.json`,
  `data/podcast-per.json` y `podcast/README.md` regenerados (`npm run podcast`, `node podcast/indice.mjs`).
- **Falsos positivos** revisados: dos explicaciones de DGMM y Baleares que definen el periodo de la ola (la definición,
  no la pregunta) y un minijuego del PY que lee una pregunta pública cuya opción repite el enunciado corto de una
  reservada.

Queda la **deuda del audio**: 197 citas en 31 episodios grabados (47 preguntas reservadas que el audio lee en su
minijuego), con su aviso en la app mientras tanto.

## Fase 2: regrabar el audio (pendiente; no se ha llamado a ElevenLabs)

Procedimiento, episodio a episodio (el plan de abajo dice qué fragmentos y qué sustituta proponer):

1. En el guion (`podcast/<tit>/<archivo>.md`), cambia la pregunta reservada del minijuego por la sustituta (o por otra
   del estudio del mismo tema que no esté ya en el episodio): la intervención en que Elena la lee con sus opciones, la
   respuesta de Andrés tras `[pausa larga]` y la confirmación de Elena («La be…»). Las de carta, con «te doy lo medido»
   sacado de la solución programada (`src/exams/solutions/`, pasos del kit). Mismas reglas de `podcast/guia.md` (cifras
   y letras en letra). En `podcast/episodios.json`, el id nuevo en `preguntas`, en el mismo orden.
2. Regraba: `ELEVENLABS_API_KEY=… PODCAST_CACHE=<caché> python3 podcast/audio.py podcast/<tit>/<archivo>.md
   podcast/audio/<id>.mp3 data/podcast/<id>.json`. `audio.py` guarda cada intervención en la caché por voz y texto y
   solo paga lo que no está: con la caché de la grabación original, solo se pagan los fragmentos cambiados (primera
   cifra de abajo); sin ella, el episodio entero (segunda cifra). Si la caché se perdió, se puede rehacer cortando el mp3
   actual por los tiempos de su línea de tiempo (los `t` de `data/podcast/<id>.json`) y guardando cada trozo con el
   nombre que le daría `audio.py` (`sha1(voz|modelo|ajustes|texto)[:16].mp3`); la primera intervención lleva debajo la
   sintonía y conviene regrabarla.
3. `npm run podcast` (pone las preguntas en las pausas de la línea de tiempo y regenera `data/podcast-<tit>.json`),
   `node podcast/indice.mjs`, `node tools/cuarentena.mjs --deuda` (quita de la deuda lo arreglado) y baja `MAX_DEUDA`
   en `tests/cuarentena.test.js` al nuevo número; `node tools/cuarentena.mjs --escribir` (este documento),
   `npm test`, `npm run precache`.

<!-- plan -->
Generado con `node tools/cuarentena.mjs --escribir`: 31 episodios con audio, 48 preguntas reservadas leídas en sus minijuegos.
Coste estimado: **33.551 caracteres** si solo se regraban los fragmentos (la caché de `podcast/audio.py` reutiliza el resto) y **348.756 caracteres** si se regraban los episodios enteros (sin caché).

| Episodio | Guion | Reservada | Tramos de la línea de tiempo | Caracteres | Sustituta propuesta |
|---|---|---|---|---|---|
| per-1-0 | `podcast/per/1-0-las-partes-del-barco.md` | `and-2026-c1-t03` | 51, 53, 54 | 578 | buscar a mano (sin equivalente automática) |
| per-1-2 | `podcast/per/1-2-timon-y-helice.md` | `and-2026-c2-t02` | 72, 74, 75 | 759 | `and-2022-c3-t02` |
| per-1-2 | `podcast/per/1-2-timon-y-helice.md` | `and-2025-c2-t03` | 78, 80, 81 | 395 | buscar a mano (sin equivalente automática) |
| per-1-3 | `podcast/per/1-3-fondeo-y-dimensiones.md` | `and-2026-c2-t04` | 68, 70, 71 | 517 | `and-2018-c1-t04` |
| per-5-0 | `podcast/per/5-0-balizamiento.md` | `and-2025-c3-t13` | 54, 56, 57 | 768 | buscar a mano (sin equivalente automática) |
| per-5-0 | `podcast/per/5-0-balizamiento.md` | `and-2025-c1-t14` | 60, 62, 63 | 507 | `and-2018-c3-t13` |
| per-5-1 | `podcast/per/5-1-iala-laterales-bifurcaciones.md` | `and-2025-c3-t15` | 68, 70, 71 | 504 | buscar a mano (sin equivalente automática) |
| per-5-2 | `podcast/per/5-2-las-cardinales.md` | `and-2025-c3-t14` | 60, 62, 63 | 519 | buscar a mano (sin equivalente automática) |
| per-6-0 | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | `and-2025-c1-t22` | 46, 48, 49 | 1151 | `and-2019-c3-t22` |
| per-6-0 | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | `and-2025-c1-t18` | 49, 51, 52 | 786 | buscar a mano (sin equivalente automática) |
| per-6-0 | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | `and-2025-c1-t27` | 52, 54, 55 | 437 | buscar a mano (sin equivalente automática) |
| py-1-2 | `podcast/py/1-2-mover-pesos-sin-volcar.md` | `and-py-2025-c1-g02` | 68, 70, 71 | 955 | buscar a mano (sin equivalente automática) |
| py-1-2 | `podcast/py/1-2-mover-pesos-sin-volcar.md` | `and-py-2025-c3-g05` | 71, 73, 74 | 740 | buscar a mano (sin equivalente automática) |
| py-1-2 | `podcast/py/1-2-mover-pesos-sin-volcar.md` | `and-py-2025-c1-g08` | 74, 76, 77 | 450 | buscar a mano (sin equivalente automática) |
| py-1-3 | `podcast/py/1-3-chalecos-aros-y-balsa.md` | `and-py-2025-c2-g03` | 62, 64, 65 | 757 | buscar a mano (sin equivalente automática) |
| py-1-3 | `podcast/py/1-3-chalecos-aros-y-balsa.md` | `and-py-2025-c3-g07` | 68, 70, 71 | 525 | buscar a mano (sin equivalente automática) |
| py-1-3 | `podcast/py/1-3-chalecos-aros-y-balsa.md` | `and-py-2026-c1-g04` | 62 | 0 (mismo fragmento que and-py-2025-c2-g03) | buscar a mano (sin equivalente automática) |
| py-1-4 | `podcast/py/1-4-hacerse-ver-y-apagar-fuegos.md` | `and-py-2025-c2-g08` | 71, 73, 74 | 651 | buscar a mano (sin equivalente automática) |
| py-1-4 | `podcast/py/1-4-hacerse-ver-y-apagar-fuegos.md` | `and-py-2025-c3-g01` | 74, 76, 77 | 381 | buscar a mano (sin equivalente automática) |
| py-1-5 | `podcast/py/1-5-abandonar-el-barco.md` | `and-py-2026-c1-g07` | 63, 65, 66 | 729 | `and-py-2018-c2-g06` |
| py-1-5 | `podcast/py/1-5-abandonar-el-barco.md` | `and-py-2025-c3-g09` | 66, 68, 69 | 462 | buscar a mano (sin equivalente automática) |
| py-1-6 | `podcast/py/1-6-pedir-ayuda.md` | `and-py-2025-c2-g01` | 55, 57, 58 | 477 | buscar a mano (sin equivalente automática) |
| py-1-6 | `podcast/py/1-6-pedir-ayuda.md` | `and-py-2026-c1-g03` | 58, 60, 61 | 405 | buscar a mano (sin equivalente automática) |
| py-2-0 | `podcast/py/2-0-el-tiempo-en-la-mar.md` | `and-py-2025-c3-g15` | 52, 54, 55 | 835 | `and-py-2016-c1-g15` |
| py-2-0 | `podcast/py/2-0-el-tiempo-en-la-mar.md` | `and-py-2025-c1-g13` | 55, 57, 58 | 523 | buscar a mano (sin equivalente automática) |
| py-2-1 | `podcast/py/2-1-isobaras-borrascas-anticiclones.md` | `and-py-2025-c2-g18` | 56, 58, 59 | 1020 | `and-py-2015-c1-g11` |
| py-2-1 | `podcast/py/2-1-isobaras-borrascas-anticiclones.md` | `and-py-2025-c1-g14` | 59, 61, 62 | 715 | `and-py-2024-c3-g15` |
| py-2-2 | `podcast/py/2-2-masas-de-aire-y-frentes.md` | `and-py-2025-c1-g11` | 60, 62, 63 | 630 | `and-py-2022-c2-g15` |
| py-2-3 | `podcast/py/2-3-modelos-de-viento.md` | `and-py-2026-c2-g17` | 64, 66, 67 | 736 | `and-py-2015-c1-g18` |
| py-2-3 | `podcast/py/2-3-modelos-de-viento.md` | `and-py-2025-c3-g13` | 70, 72, 73 | 627 | `and-py-2015-c3-g14` |
| py-2-4 | `podcast/py/2-4-vientos-regionales.md` | `and-py-2026-c1-g13` | 65, 67, 68 | 591 | buscar a mano (sin equivalente automática) |
| py-2-5 | `podcast/py/2-5-humedad-y-nubes.md` | `and-py-2026-c1-g14` | 62, 64, 65 | 333 | buscar a mano (sin equivalente automática) |
| py-2-6 | `podcast/py/2-6-nieblas.md` | `and-py-2025-c1-g17` | 70, 72, 73 | 705 | `and-py-2024-c2-g17` |
| py-2-8 | `podcast/py/2-8-corrientes-marinas.md` | `and-py-2026-c1-g15` | 60, 62, 63 | 747 | `and-py-2015-c2-g20` |
| py-3-1 | `podcast/py/3-1-la-esfera-terrestre.md` | `and-py-2025-c1-n01` | 78, 80, 81 | 495 | `and-py-2017-c2-n10` |
| py-3-2 | `podcast/py/3-2-la-correccion-total.md` | `and-py-2025-c1-n02` | 74, 76, 77 | 695 | buscar a mano (sin equivalente automática) |
| py-3-5 | `podcast/py/3-5-publicaciones-y-avisos.md` | `and-py-2026-c1-n04` | 52, 54, 55 | 711 | buscar a mano (sin equivalente automática) |
| py-3-5 | `podcast/py/3-5-publicaciones-y-avisos.md` | `and-py-2025-c1-n04` | 58, 60, 61 | 668 | buscar a mano (sin equivalente automática) |
| py-3-6 | `podcast/py/3-6-el-radar.md` | `and-py-2026-c1-n06` | 63, 65, 66 | 1110 | buscar a mano (sin equivalente automática) |
| py-3-6 | `podcast/py/3-6-el-radar.md` | `and-py-2025-c1-n05` | 69, 71, 72 | 613 | buscar a mano (sin equivalente automática) |
| py-3-7 | `podcast/py/3-7-el-gps.md` | `and-py-2025-c3-n07` | 54, 56, 57 | 730 | `and-py-2020-c3-n03` |
| py-3-7 | `podcast/py/3-7-el-gps.md` | `and-py-2026-c1-n08` | 60, 62, 63 | 675 | buscar a mano (sin equivalente automática) |
| py-3-8 | `podcast/py/3-8-cartas-electronicas-y-ais.md` | `and-py-2025-c3-n10` | 53, 55, 56 | 1010 | buscar a mano (sin equivalente automática) |
| py-4-1 | `podcast/py/4-1-correccion-total-en-la-carta.md` | `and-py-2025-c1-n11` | 54, 56, 57 | 817 | `and-py-2018-c2-n11` |
| py-4-2 | `podcast/py/4-2-el-viento-en-la-carta.md` | `and-py-2025-c1-n16` | 49, 51, 52 | 1109 | buscar a mano (sin equivalente automática) |
| py-4-3 | `podcast/py/4-3-situarse.md` | `and-py-2025-c2-n15` | 48, 50, 51 | 1951 | buscar a mano (sin equivalente automática) |
| py-4-4 | `podcast/py/4-4-estima-con-viento-y-corriente.md` | `and-py-2026-c1-n15` | 52, 54, 55 | 997 | `and-py-2018-c4-n11` |
| py-4-5 | `podcast/py/4-5-corriente-conocida-y-desconocida.md` | `and-py-2025-c3-n16` | 52, 54, 55 | 1055 | buscar a mano (sin equivalente automática) |
<!-- /plan -->

## Inventario actual

<!-- inventario -->
Generado con `node tools/cuarentena.mjs --escribir`: **359 citas a 146 preguntas reservadas**.

- Por alcance: metadato 158, visible 78, latente 47, fuente 76.
- Por tipo de contenido: regla 151, resueltos 7, explicacion 2, podcast-linea 76, podcast-ficha 47, podcast-fuente 47, podcast-guion 29.
- Por cómo se detectan: id 299, texto 60. Por banco: andalucia/per 98, andalucia/py 259, dgmm/py 2.
- En la deuda del audio: 197; falsos positivos revisados: 4; por arreglar: 0.
- Metadato (no se enseña; no se lista abajo): 158 (reglas nemotécnicas que ayudan a la propia reservada y `excepto` de los resueltos).

| Pregunta | Banco | Fichero | Dónde | Tipo | Alcance | Por | Estado |
|---|---|---|---|---|---|---|---|
| `dgmm-py-2025-11-14` | dgmm/py | `data/ejes/baleares/py/explicaciones.json` | bal-py-2019-12-a-18.explicacion | explicacion | visible | texto (0.6) | falso positivo revisado |
| `dgmm-py-2025-11-14` | dgmm/py | `data/ejes/dgmm/py/explicaciones.json` | dgmm-py-2021-07-14.explicacion | explicacion | visible | texto (0.6) | falso positivo revisado |
| `and-2026-c1-t03` | andalucia/per | `data/podcast-per.json` | temas.1.episodios.0.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2026-c2-t02` | andalucia/per | `data/podcast-per.json` | temas.1.episodios.2.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c2-t03` | andalucia/per | `data/podcast-per.json` | temas.1.episodios.2.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2026-c2-t04` | andalucia/per | `data/podcast-per.json` | temas.1.episodios.3.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c3-t13` | andalucia/per | `data/podcast-per.json` | temas.5.episodios.0.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c1-t14` | andalucia/per | `data/podcast-per.json` | temas.5.episodios.0.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c3-t15` | andalucia/per | `data/podcast-per.json` | temas.5.episodios.1.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c3-t14` | andalucia/per | `data/podcast-per.json` | temas.5.episodios.2.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c1-t22` | andalucia/per | `data/podcast-per.json` | temas.6.episodios.0.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c1-t18` | andalucia/per | `data/podcast-per.json` | temas.6.episodios.0.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2025-c1-t27` | andalucia/per | `data/podcast-per.json` | temas.6.episodios.0.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g02` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.2.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g05` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.2.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g08` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.2.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c2-g03` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.3.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g07` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.3.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c2-g08` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.4.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g01` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.4.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-g07` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.5.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g09` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.5.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c2-g01` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.6.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-g03` | andalucia/py | `data/podcast-py.json` | temas.1.episodios.6.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g15` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.0.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g13` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.0.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c2-g18` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.1.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g14` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.1.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g11` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.2.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c2-g17` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.3.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-g13` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.3.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-g13` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.4.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-g14` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.5.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-g17` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.6.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-g15` | andalucia/py | `data/podcast-py.json` | temas.2.episodios.8.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n01` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.1.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n02` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.2.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-n04` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.5.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n04` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.5.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-n06` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.6.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n05` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.6.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-n07` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.7.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-n08` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.7.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-n10` | andalucia/py | `data/podcast-py.json` | temas.3.episodios.8.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n11` | andalucia/py | `data/podcast-py.json` | temas.4.episodios.1.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c1-n16` | andalucia/py | `data/podcast-py.json` | temas.4.episodios.2.preguntas.1 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c2-n15` | andalucia/py | `data/podcast-py.json` | temas.4.episodios.3.preguntas.0 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2026-c1-n15` | andalucia/py | `data/podcast-py.json` | temas.4.episodios.4.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-py-2025-c3-n16` | andalucia/py | `data/podcast-py.json` | temas.4.episodios.5.preguntas.2 | podcast-ficha | latente | id | deuda: regenerar audio |
| `and-2026-c1-t03` | andalucia/per | `data/podcast/per-1-0.json` | tramos.52.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2026-c2-t02` | andalucia/per | `data/podcast/per-1-2.json` | tramos.73.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c2-t03` | andalucia/per | `data/podcast/per-1-2.json` | tramos.79.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2026-c2-t04` | andalucia/per | `data/podcast/per-1-3.json` | tramos.68.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2026-c2-t04` | andalucia/per | `data/podcast/per-1-3.json` | tramos.69.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c3-t13` | andalucia/per | `data/podcast/per-5-0.json` | tramos.54.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2025-c3-t13` | andalucia/per | `data/podcast/per-5-0.json` | tramos.55.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c1-t14` | andalucia/per | `data/podcast/per-5-0.json` | tramos.60.x | podcast-linea | visible | texto (0.76) | deuda: regenerar audio |
| `and-2025-c1-t14` | andalucia/per | `data/podcast/per-5-0.json` | tramos.61.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c3-t15` | andalucia/per | `data/podcast/per-5-1.json` | tramos.68.x | podcast-linea | visible | texto (0.78) | deuda: regenerar audio |
| `and-2025-c3-t15` | andalucia/per | `data/podcast/per-5-1.json` | tramos.69.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c3-t14` | andalucia/per | `data/podcast/per-5-2.json` | tramos.60.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2025-c3-t14` | andalucia/per | `data/podcast/per-5-2.json` | tramos.61.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c1-t22` | andalucia/per | `data/podcast/per-6-0.json` | tramos.46.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t22` | andalucia/per | `data/podcast/per-6-0.json` | tramos.47.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c1-t18` | andalucia/per | `data/podcast/per-6-0.json` | tramos.49.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t18` | andalucia/per | `data/podcast/per-6-0.json` | tramos.50.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2025-c1-t27` | andalucia/per | `data/podcast/per-6-0.json` | tramos.52.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t27` | andalucia/per | `data/podcast/per-6-0.json` | tramos.53.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-g02` | andalucia/py | `data/podcast/py-1-2.json` | tramos.68.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c1-g02` | andalucia/py | `data/podcast/py-1-2.json` | tramos.69.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g05` | andalucia/py | `data/podcast/py-1-2.json` | tramos.72.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-g08` | andalucia/py | `data/podcast/py-1-2.json` | tramos.75.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c2-g03` | andalucia/py | `data/podcast/py-1-3.json` | tramos.62.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g04` | andalucia/py | `data/podcast/py-1-3.json` | tramos.62.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g03` | andalucia/py | `data/podcast/py-1-3.json` | tramos.63.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g07` | andalucia/py | `data/podcast/py-1-3.json` | tramos.68.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g07` | andalucia/py | `data/podcast/py-1-3.json` | tramos.69.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c2-g08` | andalucia/py | `data/podcast/py-1-4.json` | tramos.71.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g08` | andalucia/py | `data/podcast/py-1-4.json` | tramos.72.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g01` | andalucia/py | `data/podcast/py-1-4.json` | tramos.74.x | podcast-linea | visible | texto (0.88) | deuda: regenerar audio |
| `and-py-2025-c3-g01` | andalucia/py | `data/podcast/py-1-4.json` | tramos.75.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g07` | andalucia/py | `data/podcast/py-1-5.json` | tramos.63.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g07` | andalucia/py | `data/podcast/py-1-5.json` | tramos.64.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g09` | andalucia/py | `data/podcast/py-1-5.json` | tramos.67.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c2-g01` | andalucia/py | `data/podcast/py-1-6.json` | tramos.55.x | podcast-linea | visible | texto (0.84) | deuda: regenerar audio |
| `and-py-2025-c2-g01` | andalucia/py | `data/podcast/py-1-6.json` | tramos.56.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g03` | andalucia/py | `data/podcast/py-1-6.json` | tramos.58.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g03` | andalucia/py | `data/podcast/py-1-6.json` | tramos.59.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g15` | andalucia/py | `data/podcast/py-2-0.json` | tramos.52.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g15` | andalucia/py | `data/podcast/py-2-0.json` | tramos.53.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-g13` | andalucia/py | `data/podcast/py-2-0.json` | tramos.55.x | podcast-linea | visible | texto (0.88) | deuda: regenerar audio |
| `and-py-2025-c1-g13` | andalucia/py | `data/podcast/py-2-0.json` | tramos.56.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c2-g18` | andalucia/py | `data/podcast/py-2-1.json` | tramos.56.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g18` | andalucia/py | `data/podcast/py-2-1.json` | tramos.57.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-g14` | andalucia/py | `data/podcast/py-2-1.json` | tramos.60.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-g11` | andalucia/py | `data/podcast/py-2-2.json` | tramos.61.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c2-g17` | andalucia/py | `data/podcast/py-2-3.json` | tramos.65.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-g13` | andalucia/py | `data/podcast/py-2-3.json` | tramos.70.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g13` | andalucia/py | `data/podcast/py-2-3.json` | tramos.71.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g13` | andalucia/py | `data/podcast/py-2-4.json` | tramos.65.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g13` | andalucia/py | `data/podcast/py-2-4.json` | tramos.66.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g14` | andalucia/py | `data/podcast/py-2-5.json` | tramos.63.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g20` | andalucia/py | `data/podcast/py-2-6.json` | tramos.70.x | podcast-linea | visible | texto (0.83) | falso positivo revisado |
| `and-py-2025-c1-g17` | andalucia/py | `data/podcast/py-2-6.json` | tramos.71.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-g15` | andalucia/py | `data/podcast/py-2-8.json` | tramos.60.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g15` | andalucia/py | `data/podcast/py-2-8.json` | tramos.61.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n01` | andalucia/py | `data/podcast/py-3-1.json` | tramos.79.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n02` | andalucia/py | `data/podcast/py-3-2.json` | tramos.74.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2025-c1-n02` | andalucia/py | `data/podcast/py-3-2.json` | tramos.75.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-n04` | andalucia/py | `data/podcast/py-3-5.json` | tramos.52.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-n04` | andalucia/py | `data/podcast/py-3-5.json` | tramos.53.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n04` | andalucia/py | `data/podcast/py-3-5.json` | tramos.59.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-n06` | andalucia/py | `data/podcast/py-3-6.json` | tramos.63.x | podcast-linea | visible | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-n06` | andalucia/py | `data/podcast/py-3-6.json` | tramos.64.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n05` | andalucia/py | `data/podcast/py-3-6.json` | tramos.70.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-n07` | andalucia/py | `data/podcast/py-3-7.json` | tramos.55.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-n08` | andalucia/py | `data/podcast/py-3-7.json` | tramos.60.x | podcast-linea | visible | texto (0.77) | deuda: regenerar audio |
| `and-py-2026-c1-n08` | andalucia/py | `data/podcast/py-3-7.json` | tramos.61.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-n10` | andalucia/py | `data/podcast/py-3-8.json` | tramos.53.x | podcast-linea | visible | texto (0.67) | deuda: regenerar audio |
| `and-py-2025-c3-n10` | andalucia/py | `data/podcast/py-3-8.json` | tramos.54.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n11` | andalucia/py | `data/podcast/py-4-1.json` | tramos.55.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c1-n16` | andalucia/py | `data/podcast/py-4-2.json` | tramos.50.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c2-n15` | andalucia/py | `data/podcast/py-4-3.json` | tramos.49.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2026-c1-n15` | andalucia/py | `data/podcast/py-4-4.json` | tramos.53.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-py-2025-c3-n16` | andalucia/py | `data/podcast/py-4-5.json` | tramos.53.p | podcast-linea | visible | id | deuda: regenerar audio |
| `and-2026-c1-t03` | andalucia/per | `podcast/episodios.json` | per.2.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2026-c2-t02` | andalucia/per | `podcast/episodios.json` | per.4.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c2-t03` | andalucia/per | `podcast/episodios.json` | per.4.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2026-c2-t04` | andalucia/per | `podcast/episodios.json` | per.5.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c3-t13` | andalucia/per | `podcast/episodios.json` | per.22.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c1-t14` | andalucia/per | `podcast/episodios.json` | per.22.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c3-t15` | andalucia/per | `podcast/episodios.json` | per.23.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c3-t14` | andalucia/per | `podcast/episodios.json` | per.24.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c1-t22` | andalucia/per | `podcast/episodios.json` | per.28.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c1-t18` | andalucia/per | `podcast/episodios.json` | per.28.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2025-c1-t27` | andalucia/per | `podcast/episodios.json` | per.28.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g02` | andalucia/py | `podcast/episodios.json` | py.4.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g05` | andalucia/py | `podcast/episodios.json` | py.4.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g08` | andalucia/py | `podcast/episodios.json` | py.4.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c2-g03` | andalucia/py | `podcast/episodios.json` | py.5.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g07` | andalucia/py | `podcast/episodios.json` | py.5.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c2-g08` | andalucia/py | `podcast/episodios.json` | py.6.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g01` | andalucia/py | `podcast/episodios.json` | py.6.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-g07` | andalucia/py | `podcast/episodios.json` | py.7.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g09` | andalucia/py | `podcast/episodios.json` | py.7.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c2-g01` | andalucia/py | `podcast/episodios.json` | py.8.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-g03` | andalucia/py | `podcast/episodios.json` | py.8.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g15` | andalucia/py | `podcast/episodios.json` | py.10.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g13` | andalucia/py | `podcast/episodios.json` | py.10.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c2-g18` | andalucia/py | `podcast/episodios.json` | py.11.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g14` | andalucia/py | `podcast/episodios.json` | py.11.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g11` | andalucia/py | `podcast/episodios.json` | py.12.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c2-g17` | andalucia/py | `podcast/episodios.json` | py.13.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-g13` | andalucia/py | `podcast/episodios.json` | py.13.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-g13` | andalucia/py | `podcast/episodios.json` | py.14.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-g14` | andalucia/py | `podcast/episodios.json` | py.15.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-g17` | andalucia/py | `podcast/episodios.json` | py.16.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-g15` | andalucia/py | `podcast/episodios.json` | py.18.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n01` | andalucia/py | `podcast/episodios.json` | py.21.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n02` | andalucia/py | `podcast/episodios.json` | py.22.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-n04` | andalucia/py | `podcast/episodios.json` | py.25.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n04` | andalucia/py | `podcast/episodios.json` | py.25.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-n06` | andalucia/py | `podcast/episodios.json` | py.26.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n05` | andalucia/py | `podcast/episodios.json` | py.26.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-n07` | andalucia/py | `podcast/episodios.json` | py.27.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-n08` | andalucia/py | `podcast/episodios.json` | py.27.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-n10` | andalucia/py | `podcast/episodios.json` | py.28.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n11` | andalucia/py | `podcast/episodios.json` | py.31.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c1-n16` | andalucia/py | `podcast/episodios.json` | py.32.preguntas.1 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c2-n15` | andalucia/py | `podcast/episodios.json` | py.33.preguntas.0 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2026-c1-n15` | andalucia/py | `podcast/episodios.json` | py.34.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-py-2025-c3-n16` | andalucia/py | `podcast/episodios.json` | py.35.preguntas.2 | podcast-fuente | fuente | id | deuda: regenerar audio |
| `and-2026-c2-t04` | andalucia/per | `podcast/per/1-3-fondeo-y-dimensiones.md` | párrafo 73 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-2025-c3-t13` | andalucia/per | `podcast/per/5-0-balizamiento.md` | párrafo 59 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t14` | andalucia/per | `podcast/per/5-0-balizamiento.md` | párrafo 65 | podcast-guion | fuente | texto (0.76) | deuda: regenerar audio |
| `and-2025-c3-t15` | andalucia/per | `podcast/per/5-1-iala-laterales-bifurcaciones.md` | párrafo 73 | podcast-guion | fuente | texto (0.78) | deuda: regenerar audio |
| `and-2025-c3-t14` | andalucia/per | `podcast/per/5-2-las-cardinales.md` | párrafo 65 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t22` | andalucia/per | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | párrafo 51 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t18` | andalucia/per | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | párrafo 54 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-2025-c1-t27` | andalucia/per | `podcast/per/6-0-el-ripa-de-un-vistazo.md` | párrafo 57 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c1-g02` | andalucia/py | `podcast/py/1-2-mover-pesos-sin-volcar.md` | párrafo 73 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g03` | andalucia/py | `podcast/py/1-3-chalecos-aros-y-balsa.md` | párrafo 67 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g04` | andalucia/py | `podcast/py/1-3-chalecos-aros-y-balsa.md` | párrafo 67 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g07` | andalucia/py | `podcast/py/1-3-chalecos-aros-y-balsa.md` | párrafo 73 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g08` | andalucia/py | `podcast/py/1-4-hacerse-ver-y-apagar-fuegos.md` | párrafo 76 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g01` | andalucia/py | `podcast/py/1-4-hacerse-ver-y-apagar-fuegos.md` | párrafo 79 | podcast-guion | fuente | texto (0.88) | deuda: regenerar audio |
| `and-py-2026-c1-g07` | andalucia/py | `podcast/py/1-5-abandonar-el-barco.md` | párrafo 68 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c2-g01` | andalucia/py | `podcast/py/1-6-pedir-ayuda.md` | párrafo 60 | podcast-guion | fuente | texto (0.84) | deuda: regenerar audio |
| `and-py-2026-c1-g03` | andalucia/py | `podcast/py/1-6-pedir-ayuda.md` | párrafo 63 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g15` | andalucia/py | `podcast/py/2-0-el-tiempo-en-la-mar.md` | párrafo 57 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c1-g13` | andalucia/py | `podcast/py/2-0-el-tiempo-en-la-mar.md` | párrafo 60 | podcast-guion | fuente | texto (0.88) | deuda: regenerar audio |
| `and-py-2025-c2-g18` | andalucia/py | `podcast/py/2-1-isobaras-borrascas-anticiclones.md` | párrafo 61 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c3-g13` | andalucia/py | `podcast/py/2-3-modelos-de-viento.md` | párrafo 75 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g13` | andalucia/py | `podcast/py/2-4-vientos-regionales.md` | párrafo 70 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-g20` | andalucia/py | `podcast/py/2-6-nieblas.md` | párrafo 75 | podcast-guion | fuente | texto (0.83) | falso positivo revisado |
| `and-py-2026-c1-g15` | andalucia/py | `podcast/py/2-8-corrientes-marinas.md` | párrafo 65 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2025-c1-n02` | andalucia/py | `podcast/py/3-2-la-correccion-total.md` | párrafo 79 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-n04` | andalucia/py | `podcast/py/3-5-publicaciones-y-avisos.md` | párrafo 57 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-n06` | andalucia/py | `podcast/py/3-6-el-radar.md` | párrafo 68 | podcast-guion | fuente | texto (1) | deuda: regenerar audio |
| `and-py-2026-c1-n08` | andalucia/py | `podcast/py/3-7-el-gps.md` | párrafo 65 | podcast-guion | fuente | texto (0.77) | deuda: regenerar audio |
| `and-py-2025-c3-n10` | andalucia/py | `podcast/py/3-8-cartas-electronicas-y-ais.md` | párrafo 58 | podcast-guion | fuente | texto (0.67) | deuda: regenerar audio |
<!-- /inventario -->
