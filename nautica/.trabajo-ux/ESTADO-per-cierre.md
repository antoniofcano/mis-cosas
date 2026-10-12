# Cierre del PER: estado

Rama `feat/per-cierre`. Tres frentes: las últimas láminas de clase con el dibujo antiguo, la coherencia de la sanidad
(las 16 divergencias de `ESTADO-per-laminas.md`) y una auditoría del PER de punta a punta. Tests nuevos en
`tests/per-cierre.test.js`; guía en `docs/ESTILO-LAMINAS.md` (fila «Cierre del PER», 15 filas del apéndice y la sección
«Sanidad: la Guía, el examen y la práctica actual»).

Fuente de la sanidad: Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013 (citada por capítulo y página; no
está en el repositorio).

## A. Láminas migradas a estilo C

`PENDIENTES` de `tests/laminas-cierre.test.js` queda vacía y el test sigue fallando si reaparece un dibujo antiguo en
una clase del PER. Todas conservan `tipo`, parámetros, variantes y `resaltar`; las que antes devolvían `null` con una
vista o parte desconocida lo siguen haciendo; ahora cada parte resaltable lleva su `data-parte` (antes no tenían).
Marcos en `src/illustrations/marcos-final.js`.

| Clase | Lámina (spec) | Fichero | Lo no comprobado, fuera |
| --- | --- | --- | --- |
| per-1-2 | `cubierta` (10 partes) | `per-final-c.js` | |
| per-1-4 | `timon` (`partes`, `cana` con `cana`, `tipos`) | `per-final-c.js` | los tipos de timón son de la clase, no del anexo II |
| per-2-1 | `muerto-boya` (7 partes) | `per-final-c.js` | |
| per-2-2 | `nudos` (los cuatro y cada `nudo`) | `per-final-c.js` | |
| per-2-3 | `tenedero` (`elegir`, `fondos`) | `per-final-c.js` | |
| per-2-4 | `fondeo-gira` (`maniobra`, `cadena`) | `per-final-c.js` | 3 y 5 veces la profundidad: regla práctica, la lámina lo dice |
| per-7-3 | `gobierno-rabeo` (`gobierno`, `rabeo`) | `per-final-c.js` | la curva es cualitativa |
| per-7-7 | `atraque` (`costado` con `helice`, `punta` con `viento`, `abarloado`, `boya`) | `per-final-c.js` | |
| per-3-2 | `revision-salida` (`resumen`, `motor`) | `per-final-b-c.js` | |
| per-3-4 | `reflector-tormenta` (`reflector`, `tormenta`) | `per-final-b-c.js` | ahora cita el artículo (RD 339/2021, art. 12) |
| per-8-4 | `varada-abordaje` (`varada`, `abordaje`) | `per-final-b-c.js` | el plazo de 24 h hábiles, comprobado en la Ley 14/2014, art. 186.2 |
| per-8-5 | `achique-sentina` | `per-final-b-c.js` | comprobado contra el RD 339/2021, art. 20 |
| per-9-1 | `barometro-tendencia` (`instrumentos`, `tendencia`) | `per-final-b-c.js` | quitado «más de 3 hPa en 3 h»: sin fuente oficial a mano |
| per-9-6 | `mar-crece` (`factores`, `viento-fondo`) | `per-final-b-c.js` | |
| per-9-7 | `prevision-salida` (`fuentes`, `decidir`) | `per-final-b-c.js` | quitados «hasta 20 millas» (aguas costeras) y los canales 10 y 74: no comprobados (ver C) |

Los dibujos antiguos se han borrado de `src/illustrations/lecciones/*.js` (quedan solo los registros `LAMINAS`). Para
reutilizar piezas se exportan `cascoPerfil`, `anclaG`, `cadena`, `cuerda`, `crestas` y `recuadro` de `per-cola-c.js`.
Ajustes de tests: `lecciones-per-segunda-b` (la bajada rápida ya no lleva umbral en hPa), `laminas-sanidad` (la nota
del torniquete dice ahora las dos pautas de aflojarlo; el dibujo sigue sin decirlo), `laminas-cierre` (`PENDIENTES`).

Capturas en el scratchpad `lpercierre-capturas/`: cada lámina a 360 px en claro y en oscuro (marco completo; `timon`
`tipos`, que ninguna clase usa, suelta), `atraque` de costado a 990 px, hoja de contacto en claro y en oscuro, y las
tarjetas de sanidad editadas de las clases per-8-1, 8-2 y 8-3.

## B. Sanidad: las 16 divergencias, resueltas

Criterio: lo que el examen da por bueno se enseña como respuesta de examen; si la práctica actual difiere, la clase lo
dice en una frase; si dos fuentes oficiales difieren, se dicen las dos y qué tribunal pregunta cuál. La explicación de
una pregunta solo cita el criterio de su tribunal (lo vigila `tests/per-cierre.test.js`). No se ha cambiado ninguna
pregunta, opción ni respuesta; ninguna explicación de una pregunta reservada ha necesitado cambio.

| # | Qué | Dónde | Por qué | Fuente |
| --- | --- | --- | --- | --- |
| 1 | Aflojar el torniquete: «La Guía del ISM recomendaba aflojarlo cada 15 minutos (y volver a apretar a los 30 segundos) y es lo que da por bueno el examen de la DGMM (pregunta dgmm-per-2021-04-75); la práctica actual es no aflojarlo salvo indicación médica». El «ojo» ya no dice «consejo antiguo: hoy no se hace»; la chuleta y la verificación, igual. Nota del marco de la lámina `hemorragia` `torniquete`, con las dos pautas. | per-8-1 (paso «El torniquete…», «ojo», chuleta, verificación); `marcos-sanidad.js` | la clase ocultaba la respuesta del examen de la DGMM | Guía, cap. 7, pág. 149; dgmm-per-2021-04-75 |
| 1 | Explicación: la respuesta es la de la Guía, que cita la pregunta; fuera del examen no se afloja. Quitado «sin aflojar, puede destruir el miembro» (contradecía la práctica actual). Trampa nueva para la d). | dgmm-per-2021-04-75 | | Guía, cap. 7, pág. 149 |
| 1 | Explicación: la a) es falsa por las cifras (Guía: 15 minutos y 30 segundos), no por aflojar; la d), por los datos del Radio-Médico (español; 91 310 34 75). | dgmm-per-2022-06-32 | decía que la pauta de aflojar no era correcta, contra la propia DGMM | Guía, cap. 7, pág. 149; cap. 4, pág. 77 |
| 1 | Concepto `emergencia.auxilios.hemorragias-tratamiento`: «la Guía del ISM manda aflojarlo cada 15 min, que es la respuesta del examen; hoy no se afloja salvo indicación médica» (versión 5 del grupo). | `data/conceptos/seguridad-legislacion.json` | decía «aflojar cada 15 min» sin más, contra la clase | Guía, cap. 7, pág. 149 |
| 1 | Frío por debajo del torniquete: «según la Guía, se mantiene fría la parte de debajo» (la DGMM la da por cierta en dgmm-per-2022-04-77). | per-8-1 | no estaba en la clase | Guía, cap. 7, pág. 149 |
| 2 | Dónde va: «entre la herida y el tronco: la Guía del ISM lo pone donde el miembro tiene un solo hueso (brazo o muslo); las guías actuales, a 5–7 cm por encima, nunca sobre una articulación». | per-8-1 | las dos pautas, dichas | Guía, cap. 7, pág. 146 |
| 3 | Presión sobre la arteria y torniquete como primera medida ante una amputación, en un párrafo nuevo del mismo paso. | per-8-1 | | Guía, cap. 7, págs. 146-147 |
| 4 | Presión 10 minutos como mínimo sin levantar las gasas (Guía); la DGMM da por buena «al menos 4 o 5 minutos, pudiendo aplicar después un vendaje compresivo»; la Guía no habla de vendaje compresivo. | per-8-1 («Cómo parar una hemorragia externa») | la clase decía «mantén un vendaje compresivo» sin más | Guía, cap. 1, pág. 26 y cap. 7, pág. 145; dgmm-per-2025-06-31 |
| 4 | Explicación: «al menos 4 o 5 minutos, como dice la opción» en lugar de «varios minutos». | dgmm-per-2025-06-31 | | criterio de la DGMM |
| 5 | Elevar: «si no hay fractura y no le duele mucho al subirlo» (la Guía lo pide salvo dolor importante; la nota del profe sobre el ERC se queda). | per-8-1 | | Guía, cap. 1, pág. 26 |
| 6 | Nariz: la Guía dice apretar los dos orificios cerca del hueso unos 10 minutos (así lo pregunta la DGMM); Baleares, «entre 5 y 10 minutos»; la Cruz Roja, la parte blanda 10–15. Chuleta y verificación, igual. | per-8-1 («Sangrado por la nariz», chuleta, verificación) | la clase solo daba la pauta de la Cruz Roja | Guía, cap. 7, pág. 144; dgmm-per-2024-04-31; bal-per-2020-12-f-30 |
| 6 | Explicación: «los dos orificios nasales, cerca del hueso de la nariz, unos 10 minutos (Guía Sanitaria a Bordo)» en lugar de «unos minutos». | dgmm-per-2024-04-31 | | Guía, cap. 7, pág. 144 |
| 7 | Cuánto enfriar una quemadura térmica: «La Guía del ISM dice “unos minutos” (y es lo que da por bueno el examen); las guías actuales piden al menos 10 y, mejor, 20». | per-8-2 | | Guía, cap. 2, pág. 40 |
| 8 | Tercer grado: lesión negruzca que no duele (Guía; también puede verse blanquecina o amarillenta); en lugar de «es grave siempre», «a bordo solo se trata si ocupa menos del 1 % y no hay lesión por inhalación». Pie de la lámina y chuleta, igual. | per-8-2 | «grave siempre» contradecía la respuesta de dgmm-per-2023-04-31 b) | Guía, cap. 7, págs. 150-152 |
| 8 | Explicación: la Guía trata a bordo el 2.º grado de menos del 10 % (1.º, 20 %; 3.º, 1 %). | dgmm-per-2022-04-77 | la explicación no daba la cifra | Guía, cap. 7, pág. 152 |
| 9 | Química en el ojo: «15 minutos como mínimo (la Guía dice de 15 a 20)…; si son los dos ojos, alternando cada 10 segundos». «Nunca agua oxigenada» se queda: es la respuesta de Andalucía (and-2024-c1-t30, la c falsa); la Guía no lo menciona. | per-8-2 | | Guía, cap. 2, pág. 41 |
| 10 | Golpe de calor: ducha o paños a unos 20 °C (Guía); la inmersión hasta el cuello, atribuida al ERC 2025; agua fresca a sorbos (la Guía, con sales del botiquín); bajar hasta unos 39 °C, medir cada 10 minutos y no seguir a 38,5 °C (Guía; lo pregunta la DGMM); nunca hasta 37 °C. «Ojo», chuleta y verificación, igual. | per-8-2 | la clase decía «parar al bajar de unos 39 °C, sin llegar a 37» y no daba los 38,5 | Guía, cap. 2, pág. 49; dgmm-per-2022-10-31 y dgmm-per-2022-06-75 |
| 10 | Explicación: se enfría hasta unos 39 °C sin bajar de 38,5 °C; hasta 35 °C sería una hipotermia. Quitado «poco a poco, con agua templada» (la Guía dice agua fría). | dgmm-per-2021-12-77 | | Guía, cap. 2, pág. 49 |
| 11 | Radio-Médico: «en español»; «por radio, a través de una costera, “consulta médica” (gratuita y con prioridad); la Guía no fija el canal: Baleares da por buena “por el canal 16 de VHF” y la DGMM, “por radiotelefonía (onda corta o media)”»; Salvamento Marítimo, atribuido a Baleares (la Guía no lo detalla). | per-8-3 | la clase daba el canal 16 y la coordinación con Salvamento como hechos de la Guía | Guía, cap. 4, pág. 77; bal-per-2018-04-e-31, bal-per-2017-12-b-32, dgmm-per-2021-02-75 |
| 11 | Explicación: atiende en español; por las costeras («este tribunal da por buena la llamada por el canal 16»); que sea en español no obliga a esperar a tierra. Quitado «se puede pedir en cualquier idioma». | bal-per-2018-04-e-31 | contradecía la Guía («se realiza en español») | Guía, cap. 4, pág. 77 |
| 11 | Explicación: «la asistencia se presta en español, pero eso no obliga a esperar a tierra» en lugar de «ni se limita a quien hable castellano». | dgmm-per-2021-02-75 | contradecía la Guía y la reservada dgmm-per-2025-11-31 | Guía, cap. 4, pág. 77 |
| 12 | Dónde se consigue la Guía: es gratuita (la Guía dice que se distribuye de forma gratuita); Andalucía da por buena descargarla de la web del ISM; la DGMM da por falso «sólo en sus direcciones provinciales». Quitado el nombre de la web. Explicación del «¿Lo pillas?», igual. | per-8-3 | | Guía, cap. 5, pág. 91; and-2022-c3-t30; dgmm-per-2023-04-31 |
| 12 | Explicación: «se distribuye gratis por otras vías» en lugar de «puede descargarse gratis». | dgmm-per-2023-04-31 | | Guía, cap. 5, pág. 91 |
| 13 | Botiquín en las zonas 5 a 7: «la norma no lo exige; llevar uno es buena práctica» (como la lámina). | per-8-3 | | RD 339/2021, art. 13.2 |
| 14 | Hipotermia: «ni café, como dice la Guía para la hipotermia (para las congelaciones, en cambio, admite café caliente muy azucarado)». | per-8-9 | | Guía, cap. 2, pág. 48 y cap. 7, pág. 194 |
| 14 | Explicación: «ni café», que era la mitad de la opción c) falsa. | bal-per-2019-04-e-10 | | Guía, cap. 2, pág. 48 |
| 15 | Saltar al agua: se queda la respuesta del examen y se añade la descripción de la Guía (codos pegados, una mano tapa nariz y boca, la otra sujeta esa muñeca o codo; no desde más de 5 m). | per-8-9 | | Guía, anexo 10, pág. 440 |
| 16 | Tipos de hemorragia: sin cambios; no están en la Guía y la clase coincide con las respuestas de los tres bancos. | — | | sin fuente escrita a mano (la Guía Médica Internacional de a Bordo de la OMS no se ha consultado) |

## C. Auditoría del PER

- **Láminas**: todas las de las clases del PER, en estilo C, con marco y en la galería (`tests/per-cierre.test.js`).
  Ninguna clase sin lámina. Las 15 de este cierre, con su fila (y su `tipo`) en el apéndice; las filas anteriores del
  apéndice van por nombre y no se pueden cruzar con el `tipo` de forma automática (anotado, no resuelto).
- **Galería**: `socorro` con `solo` (bengala, cohete, humo) y `sonido` con `texto` se juntan en la galería con la hoja
  o la señal general, que tiene otro título (la clave de la lámina ignora `resaltar`, `solo` y `texto`): la galería no
  tiene una ficha propia de cada pirotecnia aunque la lista `pirotecnia` de `catalogo-laminas.js` las pida. Anotado.
- **Unidades**: «mn» → «M» en la chuleta y la verificación de las zonas (per-3-5), en `data/comun/mnemotecnias.json`
  (A1 y A2) y en la clave de and-2018-c3-t11. «kn» se queda (es el símbolo); «Dm» en per-10 es demora magnética, no
  declinación. Babor y estribor: «Br» y «Er» como en `data/comun/abreviaturas.json`.
- **Discrepancias**: `tools/discrepancias.mjs` da las mismas 127 y el mismo `docs/DISCREPANCIAS.md`.
- **Conceptos**: ninguna etiqueta de los tres bancos apunta a un concepto inexistente (`tools/conceptos/validar.mjs`,
  sin errores). Conceptos del PER sin ninguna pregunta en un banco: 109 en Andalucía, 57 en la DGMM y 22 en Baleares
  (el catálogo sale del temario, no de los bancos; sin cambios).
- **Enlaces** ficha, clase, mapa y chuleta: los tests de mapas, chuletas y conceptos pasan.

## Incoherencias que quedan (para el autor)

- La clase per-9-7 y su chuleta dicen «aguas costeras hasta 20 millas» y los canales de trabajo «10 o 74»: no
  comprobados en una fuente oficial (la lámina ya no los dibuja). Las respuestas oficiales solo confirman el anuncio
  por el canal 16.
- El podcast (`data/podcast-per.json`, claves del episodio de primeros auxilios) dice «sin aflojarlo»; es audio
  grabado y no se ha tocado.
- dgmm-per-2021-12-32: la DGMM da por buena «grave si más del 33 %, leve si menos del 10 %», cifras que no están en la
  Guía (la Guía usa los límites de tratamiento a bordo). La explicación lo atribuye al tribunal; sin cambios.
- dgmm-per-2022-06-32 b) («elevar la extremidad quemada para disminuir la inflamación») no se ha comprobado en la Guía.
- Capturas de las explicaciones de los bancos: la ruta `#/q/<id>` no enseña la explicación sin el eje activo; no se
  han capturado.
