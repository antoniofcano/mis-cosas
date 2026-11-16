# Revisión de los guiones del PER antes de sintetizarlos

Revisión de los 55 guiones de `podcast/per/` (16 de noviembre de 2026, R-09 de `docs/ROADMAP.md`) para generar su
audio con ElevenLabs sin errores. No se ha generado audio ni se ha llamado a ElevenLabs.

## Resumen

- **16 guiones corregidos** y 39 sin cambios. De los 11 que ya tienen audio, **7 hay que regenerarlos** (per-0, per-1-0,
  per-1-2, per-1-3, per-5-0, per-5-1 y per-5-2) y 4 no (per-1-1, per-5-3, per-5-4 y per-6-0).
- **Contenido al día con el curso:** el ejemplo de la tangente (2,6 millas, 15°, 019°), el torniquete, la presión de diez
  minutos, el golpe de calor, la quemadura de tercer grado, el canal del Radio-Médico, la predicción de aguas costeras
  sin la cifra de 20 millas, el redondeo de la declinación y el real decreto de la posidonia.
- **Cuarentena:** las 7 preguntas reservadas que leían los minijuegos (todas en episodios con audio) se han cambiado por
  otras de práctica del mismo concepto. Ningún episodio del PER lleva ya el aviso de la app («Este episodio comenta
  una pregunta del examen final»), con ningún eje.
- **Para la voz:** sin cifras, sin markdown y con las acotaciones solo entre corchetes. Ninguna intervención pasa de
  1.138 caracteres, muy por debajo de los 2.500 a partir de los que ElevenLabs corta.
- **A sintetizar: 513.938 caracteres** si se conserva la caché de `audio.py`, o **582.633** sin ella. El desglose está
  más abajo.

> **Ojo antes de publicar.** Hasta que se regenere su audio, los mp3 de per-1-0, per-1-2, per-1-3, per-5-0, per-5-1 y
> per-5-2 siguen leyendo la pregunta reservada antigua. Como su ficha ya no la cita, la app **no avisa** al alumno, y la
> pausa enseña la pregunta nueva o ninguna. Conviene regenerar esos episodios antes del próximo `npm run precache`.
> `tests/podcast.test.js` (`PENDIENTES_DE_REGENERAR`) lista los 7 episodios con el audio desfasado. Al regenerar cada
> uno, hay que quitarlo de la lista: el test falla si un episodio de la lista ya sigue al guion.

## Cómo se ha revisado

1. **Contenido.** Para cada guion, se ha comparado el texto de sus clases (`data/curso/per.json`) en el commit en que se
   escribió con el de hoy. Así salen todos los cambios del curso posteriores al guion; después, cada cambio se ha
   buscado en el guion, en su Panorama y en la ficha (`podcast/episodios.json`). Además:
   - se han cotejado entero, con su clase, los 11 episodios que ya tienen audio;
   - se han buscado las cifras y frases sensibles: torniquete, 37 °C, canal 16, 20 millas, redondeo, «este año», el
     rango de convocatorias;
   - se ha comprobado que la respuesta que da Andrés en cada minijuego es la correcta del banco;
   - se han repasado las preguntas de `docs/DISCREPANCIAS.md` que salen en los minijuegos. Son tres, y los guiones dan
     la respuesta oficial como la da la clase: `and-2021-c2-t12` (los 200 m de la playa balizada, en 4.1, con el matiz
     de la línea de boyas), `and-2022-c1-t08` (Boutakow, en 3.4) y `and-2022-c2-t05` (fango duro, en 2.2).
2. **Cuarentena.** Se ha comprobado el estado de cada pregunta del minijuego con la reserva efectiva de Andalucía (las 5
   convocatorias más recientes, `data/ejes/andalucia/eje.json`, modo «examen»). También se han pasado
   `node tools/cuarentena.mjs` y una búsqueda más laxa de citas «…» parecidas a reservadas. Las que quedan son frases
   cortas o preguntas públicas casi iguales, que no delatan nada.
3. **Voz.** Cada guion se ha leído como lo lee `podcast/audio.py` (`piezas`), con estas comprobaciones:
   - cifras, símbolos, siglas en mayúsculas, letras sueltas y markdown dentro de las intervenciones;
   - acotaciones que no sean `[pausa]`, `[pausa larga]` o `[ríe]`;
   - longitud de cada intervención y palabras habladas, contadas como dice `guia.md`.

## Preguntas reservadas sustituidas

| Episodio | Reservada (convocatoria) | Sustituta (práctica) | Concepto y clase |
|---|---|---|---|
| per-1-0 | `and-2026-c1-t03`, «El eje alrededor del cual gira la pala del timón…» | `and-2015-c3-t03`, «¿Qué es la limera?» | mecha y limera, per-1-4 |
| per-1-2 | `and-2026-c2-t02`, «… NO es una parte del timón» | `and-2020-c3-t03`, «El orificio por el que la mecha del timón atraviesa el casco…» | limera y bocina, per-1-4 |
| per-1-2 | `and-2025-c2-t03`, gemelas al exterior: la de estribor | `and-2022-c1-t03`, «En hélices gemelas de giro al exterior…» | gemelas, per-1-5 |
| per-1-3 | `and-2026-c2-t04`, definición de francobordo | `and-2018-c1-t04` (la misma pregunta, publicada antes) | francobordo, per-1-7 |
| per-5-0 | `and-2025-c3-t13`, colores de las laterales al entrar | `and-2024-c2-t16`, «¿qué indican las marcas laterales rojas?» | laterales, per-5-2 |
| per-5-1 | `and-2025-c3-t15`, bifurcación con luz verde 2+1 | `and-2020-c1-t16`, luz verde 2+1 entrando: por qué banda dejarla | bifurcación, per-5-2 |
| per-5-2 | `and-2025-c3-t14`, luz de la cardinal Este | `and-2023-c3-t17`, ritmo de la cardinal Este | cardinales, per-5-3 |

En cada caso han cambiado tres cosas: la lectura de Elena con las opciones, la respuesta razonada de Andrés y, si la
letra cambiaba, la confirmación de Elena. `podcast/episodios.json` lleva los ids nuevos, en el mismo orden.

Hay preguntas que figuraban en el plan antiguo de `docs/CUARENTENA.md` y que ya no están reservadas: salieron de la
reserva al entrar la 3.ª convocatoria de 2026. Son `and-2025-c1-t14` (per-5-0) y `and-2025-c1-t22`, `-t18` y `-t27`
(per-6-0). Se quedan como están.

## Por episodio

«Car.» son los caracteres que `audio.py` envía a ElevenLabs: el texto de las intervenciones, sin acotaciones. Para los
episodios con audio, es lo que cuesta regenerar las intervenciones cambiadas, con la caché de `audio.py`. Entre
paréntesis, lo que cuesta el episodio entero.

| Episodio | Estado | Qué se cambió y por qué (fuente) | Audio | ¿Regenerar? (car.) |
|---|---|---|---|---|
| per-0 Bienvenida | corregido | Decía que los minijuegos son de las convocatorias de 2020 a 2026. Ahora dice que son de convocatorias ya publicadas y que las más recientes se guardan para el examen final. Fuente: reserva de `data/ejes/andalucia/eje.json` y `docs/CUARENTENA.md`; los minijuegos usan preguntas de 2015 a 2024. También en la ficha. | sí | **sí**, 1 intervención: 291 (10.283) |
| per-1-0 Las partes del barco | corregido | Minijuego: reservada `and-2026-c1-t03` → `and-2015-c3-t03` (cuarentena). | sí | **sí**, 3 intervenciones: 737 (9.699) |
| per-1-1 Casco, cubierta y estructura | sin cambios | — | sí | no |
| per-1-2 El timón y la hélice | corregido | Minijuego: reservadas `and-2026-c2-t02` → `and-2020-c3-t03` y `and-2025-c2-t03` → `and-2022-c1-t03` (cuarentena). | sí | **sí**, 4 intervenciones: 965 (11.312) |
| per-1-3 Fondeo y dimensiones | corregido | Minijuego: reservada `and-2026-c2-t04` → `and-2018-c1-t04` (cuarentena). En el cierre ponía «el próximo episodio saltamos al tema cinco»; ahora es el tema dos, porque la serie sigue el temario (`episodios.json`). | sí | **sí**, 3 intervenciones: 583 (11.816) |
| per-2-0 Amarrar y fondear | sin cambios | — | no | 10.200 |
| per-2-1 Cabos, amarres y nudos | sin cambios | — | no | 10.868 |
| per-2-2 Fondear bien | sin cambios | — | no | 12.264 |
| per-3-0 Seguridad en la mar | sin cambios | — | no | 10.524 |
| per-3-1 Estabilidad y antes de salir | sin cambios | — | no | 12.405 |
| per-3-2 Mal tiempo, tormentas y niebla | sin cambios | — | no | 12.278 |
| per-3-3 El equipo de seguridad | sin cambios | — | no | 12.175 |
| per-3-4 Hombre al agua, rescate y remolque | sin cambios | — | no | 12.332 |
| per-4-0 Las normas que hay que conocer | sin cambios | — | no | 10.367 |
| per-4-1 En regla, puerto, playas y buzos | sin cambios | — | no | 12.640 |
| per-4-2 Contaminación | sin cambios | — | no | 12.597 |
| per-4-3 Banderas y espacios protegidos | corregido | Ponía «desde este año, un real decreto…», que caduca. Ahora dice «un real decreto de dos mil veintiséis» (RD 191/2026, clase per-4-8). | no | 11.700 |
| per-5-0 Balizamiento | corregido | Minijuego: reservada `and-2025-c3-t13` → `and-2024-c2-t16` (cuarentena). | sí | **sí**, 2 intervenciones: 653 (9.883) |
| per-5-1 IALA, laterales y bifurcaciones | corregido | Minijuego: reservada `and-2025-c3-t15` → `and-2020-c1-t16` (cuarentena). | sí | **sí**, 2 intervenciones: 694 (10.794) |
| per-5-2 Las cardinales | corregido | Minijuego: reservada `and-2025-c3-t14` → `and-2023-c3-t17` (cuarentena). | sí | **sí**, 2 intervenciones: 624 (9.455) |
| per-5-3 Otras marcas | sin cambios | — | sí | no |
| per-5-4 Leer la luz | sin cambios | — | sí | no |
| per-6-0 El RIPA de un vistazo | sin cambios | Sus tres preguntas ya no están reservadas. Escribe «MAYDAY» en mayúsculas, y los demás guiones, «mayday». No se toca para no regenerar: si al escucharlo suena deletreado, se cambia esa intervención (384 car.). | sí | no |
| per-6-1 Definiciones, vigilancia y riesgo | sin cambios | — | no | 12.359 |
| per-6-2 Canales angostos y DST | sin cambios | — | no | 11.625 |
| per-6-3 Alcance, vuelta encontrada y cruce | sin cambios | — | no | 11.544 |
| per-6-4 Veleros y jerarquía | sin cambios | — | no | 11.214 |
| per-6-5 Visibilidad reducida | sin cambios | — | no | 11.007 |
| per-6-6 Luces de motor, vela y remolque | sin cambios | — | no | 12.141 |
| per-6-7 Luces de pesca, especiales y fondeados | sin cambios | — | no | 11.119 |
| per-6-8 Señales acústicas, luminosas y de peligro | sin cambios | — | no | 11.421 |
| per-7-0 Maniobrar el barco | sin cambios | — | no | 9.988 |
| per-7-1 Cabos y amarras | sin cambios | — | no | 11.546 |
| per-7-2 Gobierno, hélice, timón y ciaboga | sin cambios | — | no | 11.846 |
| per-7-3 Atracar y desatracar | sin cambios | — | no | 11.577 |
| per-8-0 Emergencias a bordo | corregido | Golpe de calor: decía que se para de enfriar «al bajar de unos 39 °C». Ahora: se enfría hasta unos 39 °C y se deja de enfriar a 38,5 °C, nunca hasta 37 (clase per-8-2, Guía Sanitaria a Bordo del ISM). También en la ficha. | no | 10.892 |
| per-8-1 Primeros auxilios y Radio-Médico | corregido | Con la clase per-8-1, basada en la Guía Sanitaria a Bordo del ISM: la presión se mantiene diez minutos como mínimo sin levantar las gasas (antes, «vendaje compresivo»); el miembro se eleva si no le duele mucho al subirlo; el torniquete va entre la herida y el tronco (brazo o muslo según la Guía; 5–7 cm según las guías actuales) y con la hora anotada. Decía «no se afloja: lo retira el personal sanitario»; ahora dice que la Guía decía aflojarlo cada cuarto de hora, que así lo da por bueno el examen de la Marina Mercante y que hoy no se afloja salvo indicación médica. Con la clase per-8-2: la quemadura de tercer grado es negruzca y no duele, y a bordo solo se trata si ocupa menos del 1 % del cuerpo; en el golpe de calor, agua fresca con sales, se baja hasta unos 39 °C midiendo cada diez minutos y se para a 38,5 °C. Con la clase per-8-3: el Radio-Médico, por radio a través de una costera, sin fijar el canal 16 (la Guía no lo fija), y en las zonas 5 a 7 la norma no exige botiquín. Para no pasar de unas 2.300 palabras se han quitado tres réplicas de relleno. También en la ficha. | no | 12.715 |
| per-8-2 Varada, abordaje y vías de agua | sin cambios | — | no | 12.335 |
| per-8-3 El fuego a bordo | sin cambios | — | no | 11.950 |
| per-8-4 Abandono e hipotermia | corregido | Al rescatado con hipotermia, ni alcohol ni café (clase per-8-9, Guía Sanitaria a Bordo). | no | 11.654 |
| per-9-0 El tiempo para salir a navegar | sin cambios | — | no | 9.640 |
| per-9-1 Presión, borrascas y anticiclones | sin cambios | — | no | 12.486 |
| per-9-2 Viento real, aparente y brisas | sin cambios | — | no | 11.172 |
| per-9-3 Beaufort, Douglas y la decisión de salir | corregido | Quitada «aguas costeras, la franja hasta las veinte millas», cifra que se retiró del curso por no estar verificada; ahora dice «la franja próxima a la costa». Quitados también los canales de ejemplo «el diez o el setenta y cuatro», que la clase ya no da (clase per-9-7). También en la ficha. | no | 11.323 |
| per-10-0 La teoría de navegación | sin cambios | — | no | 10.399 |
| per-10-1 La Tierra, coordenadas y milla | sin cambios | — | no | 12.256 |
| per-10-2 Carta, faros y publicaciones | sin cambios | — | no | 12.298 |
| per-10-3 Los tres nortes y los rumbos | sin cambios | — | no | 12.398 |
| per-10-4 Demora, marcación y líneas de posición | sin cambios | — | no | 10.219 |
| per-10-5 Mareas, viento y corriente | sin cambios | — | no | 11.077 |
| per-11-0 El examen de carta paso a paso | corregido | La declinación se redondea al grado si lo pide el enunciado (clase per-11-2). También en la ficha. | no | 10.884 |
| per-11-1 Corrección total y rumbo directo | corregido | Decía «Redondea siempre al grado». Ahora: haz lo que diga el enunciado; si no pide redondear, sigue con el valor exacto y redondea solo el resultado (clase per-11-2). También en el resumen y en la ficha. | no | 12.791 |
| per-11-2 Estima y líneas de posición | sin cambios | — | no | 12.499 |
| per-11-3 Situarse con dos demoras y enfilaciones | corregido | Voz: la letra «B» sola se escribe «be», como pide la guía (dos sitios). | no | 11.667 |
| per-11-4 Pasar a una distancia de un faro | corregido | Ejemplo de la tangente: 2,5 millas, unos 14,5° y «unos 019°» → 2,6 millas, 15° y 019°. Es el ejemplo exacto de la clase per-11-9: sen α = 2,6/10, α ≈ 15°, Rv = 004° + 15° = 019°. La ficha ya lo tenía bien. | no | 10.999 |

## Total a sintetizar

| | Episodios | Caracteres |
|---|---|---|
| Sin audio (guion entero) | 44 | 509.391 |
| Con audio: solo las intervenciones cambiadas (con la caché de `audio.py`) | 7 | 4.547 |
| **Total con la caché** | | **513.938** |
| Con audio: los 7 enteros (sin la caché) | 7 | 73.242 |
| **Total sin la caché** | | **582.633** |

- **La caché.** `audio.py` guarda cada intervención en la caché (`PODCAST_CACHE`, por defecto la carpeta temporal del
  sistema) con el nombre `sha1(voz|modelo|ajustes|texto)[:16].mp3`. Si se perdió la de la grabación original, se puede
  rehacer cortando el mp3 actual por los tiempos de su línea de tiempo (`data/podcast/<id>.json`), como explica
  `docs/CUARENTENA.md` (fase 2). La primera intervención lleva debajo la sintonía: si se rehace así, mejor regrabarla.
  En los 7 episodios no ha cambiado la primera intervención.
- **Después de regenerar** cada episodio:
  1. quitarlo de `PENDIENTES_DE_REGENERAR` en `tests/podcast.test.js`;
  2. ejecutar `npm run podcast`, `node podcast/indice.mjs` y `node tools/cuarentena.mjs --deuda`;
  3. bajar `MAX_DEUDA` en `tests/cuarentena.test.js` y ejecutar `node tools/cuarentena.mjs --escribir`;
  4. ejecutar `npm test` y `npm run precache`.

## Para la voz

- **Cifras y símbolos:** ninguna cifra ni símbolo dentro de las intervenciones; todo va en letra.
- **Markdown y acotaciones:** nada de markdown dentro del diálogo, y las acotaciones son solo `[pausa]`, `[pausa larga]`
  y `[ríe]`.
- **Siglas:** solo quedan «PER», «RIPA» o «Ripa», «IALA», «ISO» y «MAYDAY» (per-6-0), que se leen como palabra; las notas
  de cada guion lo dicen. Las que se deletrean ya van escritas como se pronuncian: «uve-hache-efe», «ge-pe-ese»,
  «hache-erre-be», «a-i-ese».
- **Longitud de las intervenciones:** la más larga tiene 1.138 caracteres (per-1-0) y ninguna se acerca a los 2.500.
- **Extensión:** todos los episodios tienen entre 1.786 y 2.317 palabras habladas, contadas como dice `guia.md`.
  Cuatro pasan un poco de 2.300 y quedan dentro de las «unas 2.300» de la guía: per-8-1 (2.307), per-11-1 (2.310),
  per-11-2 (2.316) y per-4-1 (2.317).
