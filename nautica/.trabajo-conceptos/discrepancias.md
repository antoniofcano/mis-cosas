# Discrepancias con la respuesta oficial: documentación en las explicaciones

Rama `feat/discrepancias-oficiales`. Solo se han tocado `explicaciones.json` (campos `discrepancia` y `defendible`, y el texto de `explicacion`/`clave` cuando repetía el error). Ninguna `correcta` ni `norma.estado` de `preguntas.json` ha cambiado.

## Documentadas

| id | Qué dice la oficial | Qué dice la norma o la matemática | Defendible |
|---|---|---|---|
| dgmm-per-2022-06-78 | «Disminuye cuando aumenta la presión» es la incorrecta | Ley de los gases (a volumen constante, T y p suben juntas), pero en meteorología sinóptica el aire frío da presión alta en superficie y el cálido, baja (bajas térmicas). Las otras tres son ciertas, así que la c) sigue siendo la única descartable | ninguna |
| dgmm-per-2023-04-78 (ya existía; reescrita) | «T sube, p baja» es la incorrecta (b) | Meteorología: aire cálido, presión baja. Física: la temperatura no mide el calor o energía térmica (depende de la masa) | a |
| dgmm-per-2023-06-34 (ya existía; ampliada) | «T sube, p sube» es la correcta (d) | Igual que la anterior: criterio de gas a volumen constante frente a bajas térmicas | c |
| dgmm-py-2024-11-16 | Mar de fondo por «viento, marea y corrientes» | La genera solo el viento (temporal lejano); marea y corrientes la modifican, no la generan | ninguna |
| bal-py-2017-12-a-13 | «Alisios» y «céfiros» características del Atlántico oriental | Los alisios sí; céfiro es el nombre clásico, genérico, del viento suave del oeste, no un viento regional | ninguna (se dejó sin `defendible` porque los vientos del oeste sí dominan en esas latitudes) |
| and-py-2017-c3-g15 | Siroco «del S» | Siroco (xaloc) = SE; el S puro es el ostro o mediodía | ninguna |
| bal-py-2020-07-a-13 | Dorsal «en forma de U» (a) | Isobaras de dorsal: U o V invertida (∩) en mapa con norte arriba; la U es la forma de la vaguada | b |
| bal-py-2017-03-a-18 | Corriente general del Estrecho, E «de 4 a 7 nudos» | Corriente superficial general de 1 a 2 nudos (más junto a Tarifa); sobre 4 solo con marea y viento; puntas de unos 6 con mareas vivas | ninguna (la b, 0 a 2 nudos, sería la corriente sin marea, pero «puede alcanzar» admite la lectura oficial) |
| bal-py-2018-04-a-13 | Del oeste, hasta 6 nudos | La dirección es correcta; 6 nudos es una punta excepcional, no la corriente general | ninguna |
| and-2022-c3-t39 (ya existía; ampliada) | Milla = arco de ecuador de 1′ = 1852 m | Milla = 1′ de meridiano, 1852 m exactos (Conferencia Hidrográfica Internacional, 1929; valor medio a 45°). 1′ de ecuador = 21 600 partes de 40 075,017 km = 1855,3 m. Con a, b y c falsas, la d) es correcta | d |
| and-2017-c1-t01 | Asiento = «calado de proa − calado de popa» | Convenio: asiento = calado de popa − calado de proa (positivo apopado). Como diferencia sin signo la d) es la única posible | ninguna |
| bal-per-2020-12-i-01 | Idem (misma pregunta) | Idem | ninguna |
| bal-per-2023-12-c-03 | Idem (misma pregunta) | Idem | ninguna |
| bal-per-2017-03-a-01 | «Orza» para la pieza unida a la quilla que aumenta calado y da estabilidad | La orza reduce el abatimiento; el lastre estabilizador es el bulbo de la quilla. En el uso corriente se llama también orza a la aleta fija | ninguna (uso ambiguo) |
| bal-per-2017-09-c-04 | Idem (misma pregunta) | Idem | ninguna |
| bal-per-2020-12-c-11 | Pabellón nacional: ninguna otra bandera salvo el gallardete del club | RD 2335/1980, art. 2.2: «Ninguna otra bandera ni enseña podrá permanecer izada si no lo está el Pabellón nacional», sin excepción para el gallardete. Arts. 3 y 4 descartan las demás opciones | ninguna |
| bal-per-2024-12-a-12 | Sin canal balizado: mínima velocidad y lo más perpendicular posible | RGC (RD 876/2014) art. 73.2: 200 m en playas, máximo 3 nudos y precauciones; no menciona la perpendicularidad | ninguna |
| dgmm-per-2026-04-11 (añadida) | Entrar perpendicular a la costa a un máximo de 3 nudos | Mismo art. 73.2. La explicación anterior atribuía la perpendicularidad al artículo; se ha corregido | ninguna |
| dgmm-per-2021-04-75 (añadida) | Aflojar el torniquete cada cuarto de hora (Guía Médica del ISM) | Guías actuales de primeros auxilios (p. ej. Consejo Europeo de Resucitación): no aflojarlo una vez colocado. Criterio médico, no legal | d |

## Ya documentadas antes y verificadas sin cambios

| id | Comprobación |
|---|---|
| bal-py-2026-06-b-18 | Correcta: lo que describe la d) es el viento ciclostrófico o de gradiente; el geostrófico es la b) (`defendible: b`) |
| bal-py-2017-03-a-13 | Correcta: gradiente + Coriolis + centrífuga es el viento de gradiente; el ciclostrófico no incluye Coriolis |
| bal-per-2018-06-a-06 | Correcta: 7 × 27,5 m = 192,5 m (grillete de 15 brazas); la oficial supone 25 m y es la opción más cercana |
| and-py-2015-c3-n01 | Correcta: la HRB la decide el patrón; en and-py-2022-c2-n03 el propio tribunal dio por buena «ninguna de las anteriores» |

## No documentadas

| id | Motivo |
|---|---|
| and-2017-c2-t34 | No se sostiene como error. La descripción («varía de forma breve e intensa, aumentando su fuerza, durante intervalos cortos») es la de las rachas, y «racheado» es el adjetivo de un viento con rachas. Otras convocatorias lo definen como «varía continuamente a más y a menos», pero son matices del mismo concepto y las otras opciones (rolando, refrescando, cayendo) son claramente falsas |
| dgmm-per-2020-12-171 | No hay error en la pregunta: la incorrecta es la c) (no existe un servicio «Safety High Frequency»; SHF es una banda de radar). Que el club náutico cuente como fuente válida es coherente con dgmm-per-2021-10-35, donde la inválida es la web de la DGMM. El choque, si lo hay, es con otras preguntas (Capitanía, Distrito Marítimo), no con esta |
| dgmm-per-2021-12-82 | Ya resuelta por el tribunal: la plantilla oficial de diciembre de 2021 da «A y C» para T02-37 y T06-40 (`aceptadas: [a, c]`). Las dos son incorrectas (a toma el rumbo de aguja; c invierte el signo del abatimiento por estribor) y están aceptadas, así que no hay discrepancia |
| dgmm-py-2020-12-24 | La explicación ya matiza (ECDIS bajo SOLAS sí sustituye al papel; en recreo, no); no hay contradicción con la norma |
| and-2026-c2-t11 | La b) reproduce el art. 46.2 del RD 186/2023; no hay discrepancia |
| bal-per-2024-07-be-39 | Ya tenía `discrepancia` (milla y ecuador); no se ha tocado |

## Pendientes para el responsable

- La clase `py-2-9` dice «en torno a 2 nudos» para el Estrecho; las preguntas de Baleares citan 4 a 7 y 6 nudos. Las explicaciones ya dicen que son máximos con marea; la clase podría citar ambas cifras (no se ha tocado: solo explicaciones).
- `dgmm-per-2021-04-75` y la corrección del texto de `dgmm-per-2026-04-11` salen de la revisión, no del encargo. El criterio de `dgmm-per-2021-04-75` es médico (no de legislación ni matemáticas); conviene que lo valide quien lleve primeros auxilios.
- La fuente `correccion` de `dgmm-per-2021-12-82` apunta a la rectificación de Patrón de Yate (preguntas 39 y 36), no a la de PER; la plantilla de PER es la que da «A y C».
