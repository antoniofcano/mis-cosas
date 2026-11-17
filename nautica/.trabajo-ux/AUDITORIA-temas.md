# Auditoría de temas

Generado con `node tools/auditoria-temas.mjs --escribir`. Preguntas sospechosas de estar en el tema equivocado, por
eje y titulación. El `ut` de cada pregunta es el bloque del examen oficial en que salió; las señales dicen que, por
su contenido, el alumno la espera en otro tema (qué mide cada una, en la cabecera de la herramienta). Nada de esto
cambia datos: son candidatas para revisar. Las reservadas para el examen final van sin enunciado. Las ya revisadas
(tools/bancos/temas-revisados.json) salen de las listas y van en la tabla de decisiones del final; las «dudosas»
siguen en su lista, con su motivo.

## Resumen

| Eje | Tit. | Preguntas | Candidatas | Revisadas | Pendientes | Fuertes | posicion | concepto | practica | vocabulario | Reservadas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| andalucia | per | 1544 | 11 | 8 | 3 | 1 | 0 | 2 | 0 | 2 | 2 |
| andalucia | py | 1369 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dgmm | per | 1950 | 67 | 61 | 6 | 0 | 0 | 3 | 0 | 3 | 6 |
| dgmm | py | 555 | 4 | 3 | 1 | 0 | 0 | 0 | 0 | 1 | 1 |
| baleares | per | 3573 | 191 | 159 | 32 | 13 | 2 | 26 | 1 | 17 | 22 |
| baleares | py | 1191 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Total: 282 candidatas de 10182 preguntas; 240 revisadas y 42 pendientes o dudosas (14 fuertes; las columnas de señales cuentan estas). Una pregunta puede tener varias señales.

## andalucia · per

### Fuertes (1)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| and-2017-c2-t09 | 3 · Seguridad | 8 · Emergencias en la mar | **concepto**: 25 de las otras 25 preguntas de su idea (emergencia.incendio.extincion) están en Emergencias en la mar; **vocabulario**: su texto se parece mucho más al de Emergencias en la mar (margen 33.2) | Cuando decimos que extinguimos un incendio por eliminación del combustible, estamos utilizando como mecanismo de extinción: | Mecanismos de extinción: por contenido es de Emergencias (UT 8.5). El tema de las preguntas de Andalucía es el del tribunal y está fijado en la huella del banco. Practica en per-3-6 (extintores), de su tema. |

### Candidatas (2)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| and-2025-c3-t19 | 6 · Reglamento (RIPA) | 4 · Legislación | **concepto**: su idea solo se enseña en clases de Legislación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| and-2026-c1-t38 | 10 · Teoría de navegación | 5 · Balizamiento | **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 17.2) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

## dgmm · per

### Candidatas (6)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| dgmm-per-2026-04-08 | 3 · Seguridad | 4 · Legislación | **concepto**: 21 de las otras 21 preguntas de su idea están en Legislación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-04-76 | 8 · Emergencias en la mar | 3 · Seguridad | **concepto**: su idea solo se enseña en clases de Seguridad | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-06-35 | 9 · Meteorología | 4 · Legislación | **vocabulario**: su texto se parece mucho más al de Legislación (margen 17.8) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2025-11-37 | 10 · Teoría de navegación | 7 · Maniobra y navegación | **vocabulario**: su texto se parece mucho más al de Maniobra y navegación (margen 25.9) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-04-85 | 10 · Teoría de navegación | 11 · Carta de navegación | **concepto**: 133 de las otras 133 preguntas de su idea están en Carta de navegación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-06-41 | 10 · Teoría de navegación | 7 · Maniobra y navegación | **vocabulario**: su texto se parece mucho más al de Maniobra y navegación (margen 12.7) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

## dgmm · py

### Candidatas (1)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| dgmm-py-2025-11-29 | 3 · Teoría de navegación | 1 · Seguridad en la mar | **vocabulario**: su texto se parece mucho más al de Seguridad en la mar (margen 18.8) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

## baleares · per

### Fuertes (13)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| bal-per-2021-03-b-07 | 3 · Seguridad | 8 · Emergencias en la mar | **concepto**: 13 de las otras 13 preguntas de su idea están en Emergencias en la mar; **vocabulario**: su texto se parece mucho más al de Emergencias en la mar (margen 20.3) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-ce-10 | 3 · Seguridad | 8 · Emergencias en la mar | **concepto**: 47 de las otras 48 preguntas de su idea están en Emergencias en la mar; **vocabulario**: su texto se parece mucho más al de Emergencias en la mar (margen 21.6) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-b-10 | 3 · Seguridad | 8 · Emergencias en la mar | **concepto**: 47 de las otras 48 preguntas de su idea están en Emergencias en la mar; **vocabulario**: su texto se parece mucho más al de Emergencias en la mar (margen 23.2) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-09-e-11 | 4 · Legislación | 5 · Balizamiento | **concepto**: 35 de las otras 38 preguntas de su idea (baliza.lateral.banda) están en Balizamiento; **practica**: sale en la práctica de per-5-2 (Balizamiento) · excepción revisada «contenido-de-la-clase» | Cuando estemos entrando en un puerto ubicado en la región A de balizamiento, procuraremos navegar siempre: | Navegar por estribor al entrar en puerto: es tanto del RIPA (regla 9) como de Balizamiento; el tribunal la puso en Legislación y ninguna clase de Legislación lo explica. Pasarla a Balizamiento metería un fallo más en un bloque con límite. Practica en per-5-2, que explica por qué banda entrar. |
| bal-per-2026-06-b-29 | 7 · Maniobra y navegación | 2 · Amarre y fondeo | **concepto**: 8 de las otras 8 preguntas de su idea están en Amarre y fondeo; **vocabulario**: su texto se parece mucho más al de Amarre y fondeo (margen 17.3) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-03-ci-38 | 10 · Teoría de navegación | 5 · Balizamiento | **posicion**: el tribunal la puso en bloques distintos (4× Balizamiento, 6× Teoría de navegación); **concepto**: 29 de las otras 29 preguntas de su idea están en Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 25.1) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-03-ge-38 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 24.8) | Qué forma tiene la marca de tope de la baliza de un "peligro nuevo": | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2018-12-b-41 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 24.7) | Dentro de las ayudas a la navegación encontramos a las marcas de peligros nuevos. De noche que luz nos la identificaría? | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2019-12-b-39 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 22.8) | Qué forma tiene la marca de tope de la baliza de un "peligro nuevo": | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2020-07-e-41 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 24.1) | Dentro de las ayudas a la navegación encontramos la marca de peligros nuevos (marca de emergencia o marca de naufragio). De noche, ¿Qué luz nos la identificaría | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2022-03-b-40 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 27.7) | Qué forma tiene la marca de tope de la baliza de un "peligro nuevo": | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2023-06-af-40 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 25.5) | ¿Qué forma tiene la marca de tope de la baliza de un "peligro nuevo"? | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2025-04-ae-37 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento; **vocabulario**: su texto se parece mucho más al de Balizamiento (margen 38.2) | UT10.11. Ayudas a la navegación. Marcas. Luces y señales marítimas: Faros y balizas. Indicar la respuesta correcta. ¿Qué marca puede ser señalizada por una bali | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |

### Candidatas (19)

| id | Tema actual | Propuesto | Señales | Enunciado | Dudosa: motivo |
|---|---|---|---|---|---|
| bal-per-2019-04-b-04 | 1 · Nomenclatura náutica | 2 · Amarre y fondeo | **vocabulario**: su texto se parece mucho más al de Amarre y fondeo (margen 14.9) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-c-02 | 1 · Nomenclatura náutica | 2 · Amarre y fondeo | **vocabulario**: su texto se parece mucho más al de Amarre y fondeo (margen 38.3) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2018-04-b-06 | 2 · Amarre y fondeo | 1 · Nomenclatura náutica | **concepto**: 24 de las otras 24 preguntas de su idea están en Nomenclatura náutica | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-a-05 | 2 · Amarre y fondeo | 7 · Maniobra y navegación | **concepto**: 7 de las otras 8 preguntas de su idea están en Maniobra y navegación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-df-05 | 2 · Amarre y fondeo | 7 · Maniobra y navegación | **concepto**: 12 de las otras 12 preguntas de su idea están en Maniobra y navegación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-07-a-05 | 2 · Amarre y fondeo | 1 · Nomenclatura náutica | **concepto**: su idea solo se enseña en clases de Nomenclatura náutica | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-09-a-08 | 3 · Seguridad | 1 · Nomenclatura náutica | **concepto**: 31 de las otras 33 preguntas de su idea están en Nomenclatura náutica | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-c-10 | 3 · Seguridad | 4 · Legislación | **vocabulario**: su texto se parece mucho más al de Legislación (margen 13.1) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-04-a-22 | 6 · Reglamento (RIPA) | 4 · Legislación | **vocabulario**: su texto se parece mucho más al de Legislación (margen 14.9) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-ce-18 | 6 · Reglamento (RIPA) | 4 · Legislación | **concepto**: su idea solo se enseña en clases de Legislación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-07-b-28 | 7 · Maniobra y navegación | 2 · Amarre y fondeo | **vocabulario**: su texto se parece mucho más al de Amarre y fondeo (margen 12.8) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-03-fa-31 | 8 · Emergencias en la mar | 3 · Seguridad | **concepto**: 6 de las otras 6 preguntas de su idea están en Seguridad | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-04-c-32 | 8 · Emergencias en la mar | 3 · Seguridad | **concepto**: 20 de las otras 20 preguntas de su idea están en Seguridad | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-d-30 | 8 · Emergencias en la mar | 1 · Nomenclatura náutica | **concepto**: 15 de las otras 15 preguntas de su idea están en Nomenclatura náutica | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-04-a-40 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento | Ayudas a la navegación. ¿Según la imagen adjuntada, qué nos puede estar indicando esta marca? | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2020-07-d-40 | 10 · Teoría de navegación | (el mismo) | **posicion**: el tribunal la puso en bloques distintos (1× Meteorología, 2× Teoría de navegación) | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2021-09-d-41 | 10 · Teoría de navegación | 5 · Balizamiento | **concepto**: su idea (baliza.nuevo-peligro) solo se enseña en clases de Balizamiento | Ayudas a la navegación. ¿Según la imagen adjuntada, qué nos puede estar indicando esta marca? | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2025-07-d-39 | 10 · Teoría de navegación | 11 · Carta de navegación | **concepto**: 6 de las otras 7 preguntas de su idea están en Carta de navegación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2025-12-d-38 | 10 · Teoría de navegación | 11 · Carta de navegación | **concepto**: 6 de las otras 7 preguntas de su idea están en Carta de navegación | _(reservada para el examen final: no se enseña)_ | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

## Decisiones de la revisión (R-29)

De `tools/bancos/temas-revisados.json` (lo aplica `node tools/bancos/temas-revisados.mjs --escribir`).

| Decisión | cambia de tema | cambia de clase | se queda | dudosa | Total |
|---|---|---|---|---|---|
| Preguntas | 69 | 35 | 200 | 42 | 346 |

### andalucia · per

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| and-2019-c2-t21 | cambia de clase | practica en per-6-1 | Su respuesta es una definición del RIPA (buque con capacidad de maniobra restringida, regla 3): practica solo en per-6-1, de su tema. per-4-3 se queda con 3 preguntas. |
| and-2025-c1-t10 | cambia de clase | practica en per-3-3 (además) | Capear un temporal es de Seguridad (programa UT 3.3) y estaba mal etiquetada (visibilidad reducida del RIPA) y sin práctica: nueva idea «capear» y practica en per-3-3. |
| and-2015-c2-t29 | se queda | — | Abatimiento y deriva también son de Maniobra (programa UT 7.2) y practica en per-7-6. |
| and-2016-c2-t26 | se queda | sigue en per-4-3 (excepción «clase-corta») | La clase per-4-3 (Buzos y bañistas) solo tiene 2 preguntas libres de su tema en el banco de Andalucía (las demás están reservadas). Esta pide reconocer la bandera «A» de buceo, que enseña per-4-3; su tema es el RIPA (buque con capacidad de maniobra restringida) y practica además en per-6-8. |
| and-2017-c2-t07 | se queda | — | Uso del extintor: material de seguridad (programa UT 3.7), practica en per-3-6. Señal de vocabulario: ruido. |
| and-2018-c2-t05 | se queda | — | Dejar el ancla a la pendura antes de fondear es la maniobra de fondeo (programa UT 2.3) y practica en per-2-4. |
| and-2019-c2-t03 | se queda | — | Levar es terminología del equipo de fondeo (programa UT 1.3 «a pique, levar») y practica en per-1-6. |
| and-2021-c1-t38 | se queda | — | Es de Teoría de navegación (corrección total, programa UT 10.7) y practica en per-10-7. Señal de vocabulario: ruido. |
| and-2023-c1-t01 | se queda | — | La línea de fondeo es de Nomenclatura en el programa (UT 1.3 «Línea de fondeo») y practica en per-1-6. |
| and-2024-c1-t40 | se queda | — | Información que dan las cartas: Teoría de navegación (programa UT 10.2). Señal de vocabulario: ruido. |
| and-2017-c2-t09 | dudosa | — | Mecanismos de extinción: por contenido es de Emergencias (UT 8.5). El tema de las preguntas de Andalucía es el del tribunal y está fijado en la huella del banco. Practica en per-3-6 (extintores), de su tema. |
| and-2025-c3-t19 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| and-2026-c1-t38 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

### andalucia · py

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| and-py-2015-c3-n08 | se queda | sigue en py-3-6 (excepción «contenido-de-la-clase») | La causa de las mareas (sicigias): el tribunal la puso en Teoría de navegación. Es la única de mareas de ese tema en todo el banco y py-3-6, que la explica, ha pasado al tema de carta: practica ahí. |
| and-py-2015-c3-n20 | se queda | — | Ejercicio de carta con una marcación radar: practica en py-4-2, de su tema. |
| and-py-2018-c2-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2020-c1-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2020-c3-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2021-c2-n13 | se queda | — | Actualizar la declinación con los datos de la carta es de carta (programa del PY, UT 4.1) y practica en py-4-1. |
| and-py-2021-c2-n20 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2022-c1-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2022-c2-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2022-c3-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2023-c1-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2023-c2-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2023-c3-n18 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2024-c1-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2024-c2-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| and-py-2024-c3-n19 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |

### dgmm · per

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| dgmm-per-2020-12-10 | cambia de tema | tema 3 → 1; practica en per-1-1 | Definición de barlovento: Nomenclatura (programa del PER, UT 1.7: terminología (barlovento, sotavento, orzar)), se enseña en per-1-1; el tribunal la puso en Seguridad, sin límite de fallos propio, y practicaba en per-3-3 (Mal tiempo). |
| dgmm-per-2022-04-12 | cambia de tema | tema 4 → 3; practica en per-3-5 | Zona de navegación según el equipo de seguridad: Seguridad (programa del PER, UT 3.7: material de seguridad y zonas de navegación (RD 339/2021)), se enseña en per-3-5; practicaba en per-4-4 (Aguas sucias). |
| dgmm-per-2023-06-38 | cambia de tema | tema 10 → 9; practica en per-9-4 | Viento aparente: Meteorología (programa del PER, UT 9.5) y se enseña en per-9-4; el tribunal la puso en Teoría de navegación, sin límite de fallos propio, y practicaba en per-10-9. |
| dgmm-per-2023-11-47 | cambia de tema | tema 1 → 3; practica en per-3-1 | Centro de gravedad y escora: Seguridad (programa del PER, UT 3.1, estabilidad) y se enseña en per-3-1; practicaba en per-1-7 (Flotación y dimensiones). |
| dgmm-per-2023-11-74 | cambia de tema | tema 7 → 9; practica en per-9-4 | Viento aparente nulo: Meteorología (programa del PER, UT 9.5) y se enseña en per-9-4; practicaba en per-7-5 (La ciaboga). |
| dgmm-per-2019-06-39 | cambia de clase | practica en per-10-4 | Color de la luz de una marca lateral: Balizamiento por contenido, pero el tribunal la pone en Teoría de navegación (UT 10.11, faros y balizas) y Balizamiento tiene límite de fallos. Practica solo en per-10-4 (Faros y luces), no en per-10-7 (Demoras). |
| dgmm-per-2021-02-38 | cambia de clase | practica en per-10-9 | El viento se nombra por de dónde viene: lo enseña per-10-9 (Viento y corriente), de su tema; practicaba en per-10-8 (Mareas). |
| dgmm-per-2021-12-01 | cambia de clase | practica en per-1-6 | Anclas con y sin cepo: equipo de fondeo (programa UT 1.3). Practicaba en per-1-4 (El timón). |
| dgmm-per-2021-12-31 | cambia de clase | practica en per-8-4 | Cita la regla 8 del RIPA, pero el tribunal la puso en Emergencias (abordaje) y el RIPA tiene límite de fallos: conserva su tema. Practicaba en per-8-7 (incendios); pasa a per-8-4 (Varada y abordaje). |
| dgmm-per-2022-04-84 | cambia de clase | practica en per-10-4 | Forma de las marcas laterales: Balizamiento por contenido, pero el tribunal la pone en Teoría de navegación (UT 10.11, balizas) y Balizamiento tiene límite de fallos. Practicaba en per-10-2 (Distancia y velocidad); pasa a per-10-4 (Faros y luces). |
| dgmm-per-2022-10-37 | cambia de clase | practica en per-10-4 | Marcas de peligro aislado: Balizamiento por contenido, pero el tribunal la pone en Teoría de navegación (UT 10.11) y Balizamiento tiene límite de fallos. Practicaba en per-10-7 (Demoras); pasa a per-10-4 (Faros y luces). |
| dgmm-per-2023-04-54 | cambia de clase | practica en per-3-8 | Hipotermia: el programa la pone en Seguridad (UT 3.8, hombre al agua) y la enseña per-3-8; practicaba en per-3-4 (Tormentas y niebla). |
| dgmm-per-2019-06-26 | se queda | — | Cita el anexo IV del RIPA (señales de peligro): es del RIPA y practica en per-6-10. |
| dgmm-per-2019-06-45 | se queda | — | Medir una distancia en la carta del Estrecho es ejercicio de carta (programa UT 11.2) y practica en su tema. |
| dgmm-per-2019-06-56 | se queda | — | Cita la regla 9 del RIPA, pero el tribunal la puso en Legislación (normas de puerto) y pasarla al RIPA cambiaría su límite de fallos. Practica en per-4-1 (dentro del puerto). |
| dgmm-per-2019-06-74 | se queda | — | Abatimiento y deriva también son de Maniobra (programa UT 7.2) y practica en per-7-6. |
| dgmm-per-2019-06-89 | se queda | — | Medir una distancia en la carta del Estrecho es ejercicio de carta (programa UT 11.2) y practica en su tema. |
| dgmm-per-2020-12-119 | se queda | — | Abatimiento y deriva también son de Maniobra (programa UT 7.2) y practica en per-7-6. |
| dgmm-per-2020-12-134 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2020-12-47 | se queda | — | Las defensas se enseñan también en per-1-2, de su tema. |
| dgmm-per-2020-12-63 | se queda | — | Regla 2 del RIPA (responsabilidad): es del RIPA. Señal de vocabulario: ruido. |
| dgmm-per-2020-12-92 | se queda | — | Grifos de fondo: Nomenclatura (programa UT 1.2), practica en per-1-3. Señal de vocabulario: ruido. |
| dgmm-per-2021-02-43 | se queda | — | Medir una distancia en la carta del Estrecho es ejercicio de carta (programa UT 11.2) y practica en su tema. |
| dgmm-per-2021-04-29 | se queda | — | Amarrar a una boya es maniobra de atraque y practica en per-7-7. |
| dgmm-per-2021-04-43 | se queda | — | Leer una sonda en la carta del Estrecho es ejercicio de carta. |
| dgmm-per-2021-04-80 | se queda | — | Previsión por VHF: Meteorología (programa UT 9.1). Señal de vocabulario: ruido. |
| dgmm-per-2021-04-88 | se queda | — | Medir una distancia en la carta del Estrecho es ejercicio de carta (programa UT 11.2) y practica en su tema. |
| dgmm-per-2021-07-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2021-07-47 | se queda | — | El grillete es del equipo de fondeo (programa UT 1.3) y practica en per-1-6. |
| dgmm-per-2021-07-69 | se queda | — | Regla 1 del RIPA (ámbito): es del RIPA. Señal de vocabulario: ruido. |
| dgmm-per-2021-07-90 | se queda | — | Distancia entre dos posiciones en la carta: ejercicio de carta. |
| dgmm-per-2021-10-04 | se queda | — | Grifos de fondo: Nomenclatura (programa UT 1.2), practica en per-1-3. Señal de vocabulario: ruido. |
| dgmm-per-2021-10-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2021-10-49 | se queda | — | Eficacia del timón: practica en per-1-4 (El timón), de su tema. |
| dgmm-per-2021-10-87 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2021-12-02 | se queda | — | Eficacia del timón: practica en per-1-4 (El timón), de su tema. |
| dgmm-per-2021-12-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2022-04-74 | se queda | — | Abatimiento y deriva también son de Maniobra (programa UT 7.2) y practica en per-7-6. |
| dgmm-per-2022-04-90 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2022-06-77 | se queda | — | Señales visuales de socorro: Emergencias (programa UT 8.6), practica en su tema. Señal de vocabulario: ruido. |
| dgmm-per-2022-06-85 | se queda | — | Característica de un faro: Teoría de navegación (UT 10.11), practica en per-10-4. |
| dgmm-per-2022-10-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2022-10-88 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2022-12-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2022-12-73 | se queda | — | Dar fondo forma parte de la maniobra; su idea se enseña también en per-7-7, donde practica. |
| dgmm-per-2022-12-87 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2023-04-01 | se queda | — | Tipos de ancla: equipo de fondeo (programa UT 1.3), practica en per-1-6. |
| dgmm-per-2023-04-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2023-04-76 | se queda | — | Abandono de la embarcación: Emergencias (programa UT 8.6), practica en per-8-8. |
| dgmm-per-2023-04-90 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2023-06-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2023-11-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2023-11-88 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2024-04-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2024-06-41 | se queda | — | Efecto del viento y la presión en la marea: Teoría de navegación (programa UT 10.12), practica en per-10-8. |
| dgmm-per-2024-06-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2024-06-90 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2024-11-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2024-11-90 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2025-04-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2025-04-85 | se queda | — | Abatimiento: Teoría de navegación (UT 10.13), practica en per-10-9. Señal de vocabulario: ruido. |
| dgmm-per-2025-04-87 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2025-06-41 | se queda | — | Efecto del viento y la presión en la marea: Teoría de navegación (programa UT 10.12), practica en per-10-8. |
| dgmm-per-2025-06-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| dgmm-per-2025-11-37 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-04-08 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-04-76 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-04-85 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-06-35 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| dgmm-per-2026-06-41 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

### dgmm · py

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| dgmm-py-2019-06-40 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2020-12-38 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2021-02-39 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2021-07-02 | cambia de clase | practica en py-3-10 | El AIS se enseña en py-3-10 (programa del PY, UT 3.9), pero el tribunal la puso en Seguridad (módulo genérico). Cambiar su tema la pasaría de módulo y de límite de fallos, y ninguna clase de Seguridad explica el AIS: conserva su tema y practica en py-3-10. Practicaba en py-1-9, que no habla del AIS. |
| dgmm-py-2021-12-39 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2022-06-33 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2022-12-31 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2023-04-37 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2023-11-40 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2024-04-34 | cambia de clase | practica en py-3-6 (además) | Mareas del Anuario del bloque de carta: practica también en py-3-6 (el Anuario y la curva de la marea), que ha pasado al tema de carta y en DGMM solo tenía tres preguntas de corrección total. |
| dgmm-py-2020-12-20 | se queda | — | Corriente del Estrecho: Meteorología del PY (UT 2.8). Señal de vocabulario: ruido. |
| dgmm-py-2021-02-35 | se queda | — | Corrección total con los datos de la carta: carta (programa del PY, UT 4.1), practica en py-4-1. |
| dgmm-py-2025-11-29 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

### baleares · per

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| bal-per-2017-09-d-28 | cambia de tema | tema 7 → 2; practica en per-2-4 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (longitud de la cadena)) y ahí se enseña (per-2-4); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2018-04-c-10 | cambia de tema | tema 3 → 8; practica en per-8-9 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación) y ahí se enseña (per-8-9); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2018-04-c-36 | cambia de tema | tema 9 → 10; practica en per-10-5 | Por contenido es de Teoría de navegación (programa del PER, UT 10.6: aguja náutica y desvío) y ahí se enseña (per-10-5); el tribunal la puso en el bloque de Meteorología, sin límite de fallos propio, y ninguna clase de Meteorología lo explica. |
| bal-per-2018-04-d-09 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores (actuación)) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. Practicaba en per-3-3 (Mal tiempo). |
| bal-per-2018-04-d-10 | cambia de tema | tema 3 → 4; practica en per-4-8 | Por contenido es de Legislación (programa del PER, UT 4.7: espacios protegidos, posidonia) y ahí se enseña (per-4-8); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2018-06-a-02 | cambia de tema | tema 1 → 2; practica en per-2-6 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (orinque)) y ahí se enseña (per-2-6); el tribunal la puso en el bloque de Nomenclatura náutica, sin límite de fallos propio, y ninguna clase de Nomenclatura náutica lo explica. Practicaba en per-1-6 (Equipo de fondeo). |
| bal-per-2018-06-h-08 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2018-06-i-08 | cambia de tema | tema 3 → 1; practica en per-1-3 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.2: estructura, grifos de fondo) y ahí se enseña (per-1-3); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2018-12-c-29 | cambia de tema | tema 7 → 3; practica en per-3-7 | Por contenido es de Seguridad (programa del PER, UT 3.8: hombre al agua) y ahí se enseña (per-3-7); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2019-04-c-09 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2019-06-c-05 | cambia de tema | tema 2 → 4; practica en per-4-8 | Por contenido es de Legislación (programa del PER, UT 4.7: espacios protegidos, posidonia) y ahí se enseña (per-4-8); el tribunal la puso en el bloque de Amarre y fondeo, sin límite de fallos propio, y ninguna clase de Amarre y fondeo lo explica. No fondear sobre posidonia es una prohibición legal, no una técnica de fondeo. |
| bal-per-2019-09-a-08 | cambia de tema | tema 3 → 8; practica en per-8-9 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación) y ahí se enseña (per-8-9); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2019-12-b-09 | cambia de tema | tema 3 → 1; practica en per-1-3 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.2: estructura, grifos de fondo) y ahí se enseña (per-1-3); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. Practicaba en per-3-3 (Mal tiempo). |
| bal-per-2020-07-ah-28 | cambia de tema | tema 7 → 3; practica en per-3-3 | Por contenido es de Seguridad (programa del PER, UT 3.3: medidas con mal tiempo) y ahí se enseña (per-3-3); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2020-07-c-10 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. El tribunal la ha repetido cinco veces en Seguridad: lo que manda es el programa. |
| bal-per-2020-07-espf-33 | cambia de tema | tema 9 → 10; practica en per-10-3 | Por contenido es de Teoría de navegación (programa del PER, UT 10.3: publicaciones náuticas) y ahí se enseña (per-10-3); el tribunal la puso en el bloque de Meteorología, sin límite de fallos propio, y ninguna clase de Meteorología lo explica. |
| bal-per-2020-10-b-29 | cambia de tema | tema 7 → 2; practica en per-2-5 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (garreo)) y ahí se enseña (per-2-5); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2020-12-f-09 | cambia de tema | tema 3 → 8; practica en per-8-5 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.4: vías de agua e inundación) y ahí se enseña (per-8-5); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2021-03-h-09 | cambia de tema | tema 3 → 4; practica en per-4-6 | Por contenido es de Legislación (programa del PER, UT 4.6: deber de auxilio (SOLAS V/33)) y ahí se enseña (per-4-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2021-09-d-07 | cambia de tema | tema 3 → 8; practica en per-8-1 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios) y ahí se enseña (per-8-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2021-09-d-28 | cambia de tema | tema 7 → 2; practica en per-2-5 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (tenedero y garreo)) y ahí se enseña (per-2-5); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2021-12-a-08 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores (actuación)) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2021-12-d-08 | cambia de tema | tema 3 → 1; practica en per-1-3 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.2: estructura, grifos de fondo) y ahí se enseña (per-1-3); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2022-03-a-07 | cambia de tema | tema 3 → 8; practica en per-8-8 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación) y ahí se enseña (per-8-8); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2022-03-b-07 | cambia de tema | tema 3 → 1; practica en per-1-2 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.1: casco, bañera e imbornales) y ahí se enseña (per-1-2); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2022-03-c-07 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2022-06-a-07 | cambia de tema | tema 3 → 1; practica en per-1-1 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.7: terminología (barlovento, sotavento, orzar)) y ahí se enseña (per-1-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2022-06-a-28 | cambia de tema | tema 7 → 1; practica en per-1-1 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.7: terminología (barlovento, sotavento, orzar)) y ahí se enseña (per-1-1); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2022-09-b-33 | cambia de tema | tema 9 → 10; practica en per-10-3 | Por contenido es de Teoría de navegación (programa del PER, UT 10.3: publicaciones náuticas) y ahí se enseña (per-10-3); el tribunal la puso en el bloque de Meteorología, sin límite de fallos propio, y ninguna clase de Meteorología lo explica. |
| bal-per-2023-03-e-28 | cambia de tema | tema 7 → 2; practica en per-2-5 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (círculo de borneo)) y ahí se enseña (per-2-5); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2023-06-af-12 | cambia de tema | tema 4 → 3; practica en per-3-5 | Por contenido es de Seguridad (programa del PER, UT 3.7: material de seguridad y zonas de navegación (RD 339/2021)) y ahí se enseña (per-3-5); el tribunal la puso en el bloque de Legislación, sin límite de fallos propio, y ninguna clase de Legislación lo explica. Practicaba en per-4-4 (Aguas sucias). |
| bal-per-2023-06-c-09 | cambia de tema | tema 3 → 8; practica en per-8-5 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.4: vías de agua e inundación) y ahí se enseña (per-8-5); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2023-06-d-08 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2023-09-c-28 | cambia de tema | tema 7 → 8; practica en per-8-9 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación (supervivencia en el agua)) y ahí se enseña (per-8-9); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2023-12-a-08 | cambia de tema | tema 3 → 8; practica en per-8-5 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.4: vías de agua e inundación (pallete de colisión)) y ahí se enseña (per-8-5); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2023-12-a-09 | cambia de tema | tema 3 → 8; practica en per-8-1 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios) y ahí se enseña (per-8-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-04-a-09 | cambia de tema | tema 3 → 8; practica en per-8-5 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.4: vías de agua e inundación) y ahí se enseña (per-8-5); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. Su idea estaba mal etiquetada (imbornales): pregunta qué es una vía de agua. |
| bal-per-2024-04-ce-08 | cambia de tema | tema 3 → 8; practica en per-8-3 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios (Centro Radio-Médico)) y ahí se enseña (per-8-3); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-04-df-09 | cambia de tema | tema 3 → 8; practica en per-8-5 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.4: vías de agua e inundación) y ahí se enseña (per-8-5); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2024-07-a-04 | cambia de tema | tema 1 → 2; practica en per-2-1 | El bichero es un elemento de amarre (programa del PER, UT 2.1) y se enseña en per-2-1; la misma pregunta, en otra convocatoria, ya es de Amarre. Sale de per-7-8, que recibe en su lugar 4 preguntas reales de desatraque del banco. |
| bal-per-2024-07-a-09 | cambia de tema | tema 3 → 8; practica en per-8-1 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios) y ahí se enseña (per-8-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-07-a-29 | cambia de tema | tema 7 → 8; practica en per-8-9 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación (supervivencia en el agua)) y ahí se enseña (per-8-9); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2024-07-be-07 | cambia de tema | tema 3 → 8; practica en per-8-1 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios) y ahí se enseña (per-8-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-07-be-28 | cambia de tema | tema 7 → 2; practica en per-2-5 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (círculo de borneo)) y ahí se enseña (per-2-5); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2024-07-df-29 | cambia de tema | tema 7 → 2; practica en per-2-2 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.2: nudos (ballestrinque)) y ahí se enseña (per-2-2); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2024-09-d-02 | cambia de tema | tema 1 → 2; practica en per-2-1 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.1: elementos de amarre (chicote, seno y firme)) y ahí se enseña (per-2-1); el tribunal la puso en el bloque de Nomenclatura náutica, sin límite de fallos propio, y ninguna clase de Nomenclatura náutica lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2024-09-e-07 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-09-f-10 | cambia de tema | tema 3 → 1; practica en per-1-2 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.1: casco, bañera e imbornales) y ahí se enseña (per-1-2); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-09-f-28 | cambia de tema | tema 7 → 3; practica en per-3-7 | Por contenido es de Seguridad (programa del PER, UT 3.8: hombre al agua (curva de Boutakow)) y ahí se enseña (per-3-7); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2024-12-b-10 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-12-b-12 | cambia de tema | tema 4 → 3; practica en per-3-5 | Por contenido es de Seguridad (programa del PER, UT 3.7: material de seguridad y zonas de navegación (RD 339/2021)) y ahí se enseña (per-3-5); el tribunal la puso en el bloque de Legislación, sin límite de fallos propio, y ninguna clase de Legislación lo explica. Practicaba en per-4-4 (Aguas sucias). |
| bal-per-2024-12-ce-09 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2024-12-df-29 | cambia de tema | tema 7 → 2; practica en per-2-6 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.3: fondeo (levar)) y ahí se enseña (per-2-6); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. Practicaba en per-7-1 (Cabos). |
| bal-per-2025-04-c-34 | cambia de tema | tema 9 → 1; practica en per-1-1 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.7: terminología (barlovento, sotavento, orzar)) y ahí se enseña (per-1-1); el tribunal la puso en el bloque de Meteorología, sin límite de fallos propio, y ninguna clase de Meteorología lo explica. Ninguna clase de Meteorología define barlovento. |
| bal-per-2025-07-b-28 | cambia de tema | tema 7 → 2; practica en per-2-2 | Por contenido es de Amarre y fondeo (programa del PER, UT 2.2: nudos (ballestrinque)) y ahí se enseña (per-2-2); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. |
| bal-per-2025-09-a-36 | cambia de tema | tema 9 → 10; practica en per-10-6 | Por contenido es de Teoría de navegación (programa del PER, UT 10.8: rumbos circulares y cuadrantales) y ahí se enseña (per-10-6); el tribunal la puso en el bloque de Meteorología, sin límite de fallos propio, y ninguna clase de Meteorología lo explica. Practicaba en per-9-2 (Borrascas). |
| bal-per-2025-09-c-09 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores (actuación)) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. Practicaba en per-3-3 (Mal tiempo). |
| bal-per-2025-09-c-10 | cambia de tema | tema 3 → 1; practica en per-1-2 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.1: casco, bañera e imbornales (desagües)) y ahí se enseña (per-1-2); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2025-09-d-07 | cambia de tema | tema 3 → 8; practica en per-8-4 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.3: abordaje) y ahí se enseña (per-8-4); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2025-12-c-28 | cambia de tema | tema 7 → 8; practica en per-8-8 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.6: abandono de la embarcación (la balsa salvavidas)) y ahí se enseña (per-8-8); el tribunal la puso en el bloque de Maniobra y navegación, sin límite de fallos propio, y ninguna clase de Maniobra y navegación lo explica. No estaba en la práctica de ninguna clase. |
| bal-per-2025-12-d-09 | cambia de tema | tema 3 → 1; practica en per-1-3 | Por contenido es de Nomenclatura náutica (programa del PER, UT 1.2: estructura, grifos de fondo) y ahí se enseña (per-1-3); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. Practicaba en per-3-3 (Mal tiempo). |
| bal-per-2025-12-d-10 | cambia de tema | tema 3 → 8; practica en per-8-7 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-7); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2026-03-a-10 | cambia de tema | tema 3 → 8; practica en per-8-6 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.5: incendios, clases de fuego y agentes extintores) y ahí se enseña (per-8-6); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2026-03-b-08 | cambia de tema | tema 3 → 8; practica en per-8-1 | Por contenido es de Emergencias en la mar (programa del PER, UT 8.1: accidentes personales y primeros auxilios) y ahí se enseña (per-8-1); el tribunal la puso en el bloque de Seguridad, sin límite de fallos propio, y ninguna clase de Seguridad lo explica. |
| bal-per-2017-07-fc-01 | cambia de clase | practica en per-1-7 | Qué computa en la eslora: dimensiones (programa UT 1.6), que enseña per-1-7; practicaba en per-1-6 (Equipo de fondeo). |
| bal-per-2017-09-a-28 | cambia de clase | practica en per-7-8 | Pregunta de desatraque: su idea se enseña en per-7-8 (Desatracar), no en per-7-2 (Las amarras). Pasa a per-7-8, que se quedaba corta. |
| bal-per-2018-04-e-07 | cambia de clase | practica en per-3-8 | Es de remolque, que el programa pone en Seguridad (UT 3) y se enseña en per-3-8 («el remolcado afirma el remolque a un punto resistente»): practica en su tema y no en Amarre. Su idea pasa a ser la del remolque. |
| bal-per-2018-09-d-27 | cambia de clase | practica en per-6-10 | Alerta de socorro por LSD como señal de peligro (anexo IV del RIPA): practica en per-6-10 (señales de peligro), no en per-6-3 (Canales). |
| bal-per-2018-12-d-30 | cambia de clase | practica en per-8-9 | Qué es la hipotermia: la enseña per-8-9 (Supervivencia en el agua: hipotermia), de su tema; practicaba en per-8-2 (quemaduras y calor). |
| bal-per-2018-12-f-28 | cambia de clase | practica en per-7-6 | Abatimiento y deriva también son de Maniobra (programa del PER, UT 7.2) y per-7-6 los enseña: practica en su tema, no en Teoría de navegación. |
| bal-per-2021-03-eg-29 | cambia de clase | practica en per-7-8 | Pregunta de desatraque: su idea se enseña en per-7-8 (Desatracar), no en per-7-2 (Las amarras). Pasa a per-7-8, que se quedaba corta. |
| bal-per-2021-12-f-29 | cambia de clase | practica en per-7-8 | Pregunta de desatraque: su idea se enseña en per-7-8 (Desatracar), no en per-7-2 (Las amarras). Pasa a per-7-8, que se quedaba corta. |
| bal-per-2022-12-a-21 | cambia de clase | practica en per-6-8 | Bandera «A» de buceo: la regla 27 del RIPA la pide a los buques de buceo y el tribunal la pone en el RIPA, que tiene límite de fallos: conserva su tema. No tenía práctica: pasa a per-6-8 (buques especiales), de su tema. |
| bal-per-2023-03-a-19 | cambia de clase | practica en per-6-8 | Bandera «A» de buceo: la regla 27 del RIPA la pide a los buques de buceo y el tribunal la pone en el RIPA, que tiene límite de fallos: conserva su tema. No tenía práctica: pasa a per-6-8 (buques especiales), de su tema. |
| bal-per-2023-06-bg-28 | cambia de clase | practica en per-7-8 | Pregunta de desatraque: su idea se enseña en per-7-8 (Desatracar), no en per-7-2 (Las amarras). Pasa a per-7-8, que se quedaba corta. |
| bal-per-2023-06-c-23 | cambia de clase | practica en per-6-10 | Banderas N y C: señal de peligro del anexo IV del RIPA; practica en per-6-10, no en per-6-8. |
| bal-per-2024-07-be-08 | cambia de clase | practica en per-3-8 | Es de remolque, que el programa pone en Seguridad (UT 3) y se enseña en per-3-8 («el remolcado afirma el remolque a un punto resistente»): practica en su tema y no en Amarre. Su idea pasa a ser la del remolque. |
| bal-per-2025-09-c-28 | cambia de clase | practica en per-7-4 | El retroceso de la hélice se enseña también en per-7-4 (La hélice y el timón), de su tema: practica ahí y no en Nomenclatura. |
| bal-per-2017-03-a-39 | se queda | — | Corrección total por enfilación: Teoría de navegación (aguja y corrección total), practica en per-10-5. |
| bal-per-2017-03-b-25 | se queda | — | Su tema ya se corrigió antes en el banco (ajustes.json): el tribunal la puso 4 de 5 veces en Teoría de navegación (faros, UT 10.11). Señal de vocabulario: ruido. |
| bal-per-2017-03-ci-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2017-03-ge-29 | se queda | — | Abarloarse es maniobra (programa UT 7.3) y practica en per-7-7. |
| bal-per-2017-07-b-10 | se queda | — | El ancla de capa es una medida con mal tiempo (programa UT 3.3), practica en per-3-3. |
| bal-per-2017-07-c-05 | se queda | — | El bichero es de Amarre (UT 2.1) y ya está en su tema; la señal de posición es por otra aparición. |
| bal-per-2017-09-a-38 | se queda | — | Información de la carta: Teoría de navegación (UT 10.2). Señal de vocabulario: ruido. |
| bal-per-2017-09-c-08 | se queda | — | Qué hacer fondeado con mal tiempo y costa a sotavento: medidas con mal tiempo (UT 3.3), practica en per-3-3. |
| bal-per-2017-09-d-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2017-09-e-28 | se queda | — | Amarrar por seno: Maniobra (programa UT 7.1, amarras), practica en per-7-1. Señal de vocabulario: ruido. |
| bal-per-2017-09-e-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2017-12-a-05 | se queda | — | Amarrar por seno: per-2-1 enseña las partes del cabo (seno), de su tema. |
| bal-per-2017-12-a-28 | se queda | — | Hélice dextrógira: per-7-4 (La hélice y el timón) la enseña, de su tema. |
| bal-per-2017-12-c-08 | se queda | — | Escora: practica en per-3-1 (Estabilidad), de su tema. |
| bal-per-2017-12-e-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2018-04-a-38 | se queda | — | La alidada sirve para tomar demoras: practica en per-10-7. |
| bal-per-2018-04-b-03 | se queda | — | Tipos de ancla: equipo de fondeo (UT 1.3), practica en per-1-6. |
| bal-per-2018-04-b-15 | se queda | — | Luz de un faro o de una marca: Balizamiento, con límite de fallos; practica en per-5-5. |
| bal-per-2018-04-b-41 | se queda | — | Sector de un faro: Teoría de navegación (UT 10.11), practica en per-10-4. |
| bal-per-2018-04-c-37 | se queda | — | Hacia qué banda meter el timón para cambiar de rumbo: rumbos, practica en per-10-6. |
| bal-per-2018-04-d-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2018-06-h-16 | se queda | — | Ritmos de luz: Balizamiento, practica en per-5-5. |
| bal-per-2018-06-i-22 | se queda | sigue en per-5-2 (excepción «contenido-de-la-clase») | Su contenido es de Balizamiento (programa del PER, UT 5.1), pero el tribunal la puso en el bloque del RIPA, que tiene límite de fallos propio: cambiar su tema cambiaría cómo se corrige ese examen (máximo 5 fallos en RIPA y 2 en Balizamiento). Conserva el tema del tribunal y practica en la clase que la explica. |
| bal-per-2018-09-d-42 | se queda | — | Demora a un faro desde una situación de la carta: ejercicio de carta. |
| bal-per-2018-09-e-03 | se queda | — | La línea de fondeo es de Nomenclatura en el programa (UT 1.3) y practica en per-1-6. |
| bal-per-2018-09-e-10 | se queda | — | Navegar en aguas someras con la carta: practica en per-3-4 (aguas someras), de su tema. |
| bal-per-2018-12-a-11 | se queda | — | Símbolo de la posidonia en la carta: el tribunal la pone en Legislación y practica en per-4-8 (posidonia). |
| bal-per-2018-12-c-08 | se queda | — | Adrizar: practica en per-3-1 (Estabilidad), de su tema. |
| bal-per-2018-12-c-15 | se queda | — | Luz blanca de dos destellos: Balizamiento, practica en per-5-5. |
| bal-per-2018-12-c-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2018-12-d-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2019-06-c-21 | se queda | — | Eslora y manga a efectos del RIPA: RIPA, con límite de fallos; practica en per-6-7. |
| bal-per-2019-06-e-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2019-09-d-02 | se queda | — | Asiento aproante: Nomenclatura (programa UT 1.6, asiento), practica en su tema. Señal de vocabulario: ruido. |
| bal-per-2019-12-c-08 | se queda | — | Reanimación del náufrago: el programa la pone en Seguridad (UT 3.8) y practica en per-3-8. |
| bal-per-2019-12-d-08 | se queda | — | Revisar la sentina: comprobaciones antes y durante la navegación, practica en per-3-2. |
| bal-per-2020-07-d-20 | se queda | — | Pesca en un dispositivo de separación de tráfico: RIPA (regla 10). Señal de vocabulario: ruido. |
| bal-per-2020-10-g-38 | se queda | — | Altavoces y compás: instalación de la aguja (UT 10.6), practica en per-10-5. |
| bal-per-2020-12-b-05 | se queda | — | Dar vueltas a un cabo en la bita: elementos de amarre (UT 2.1), practica en per-2-1. |
| bal-per-2020-12-c-22 | se queda | sigue en per-5-2 (excepción «contenido-de-la-clase») | Su contenido es de Balizamiento (programa del PER, UT 5.1), pero el tribunal la puso en el bloque del RIPA, que tiene límite de fallos propio: cambiar su tema cambiaría cómo se corrige ese examen (máximo 5 fallos en RIPA y 2 en Balizamiento). Conserva el tema del tribunal y practica en la clase que la explica. |
| bal-per-2020-12-d-04 | se queda | — | Tipos de ancla: equipo de fondeo (UT 1.3), practica en per-1-6. |
| bal-per-2020-12-e-29 | se queda | — | Dos hélices en el atraque: practica en per-7-4 (La hélice y el timón), de su tema. |
| bal-per-2020-12-f-20 | se queda | — | Cita el RIPA (anexo IV, señales de peligro): practica en per-6-10. |
| bal-per-2020-12-f-38 | se queda | — | Característica de un faro en la carta: Teoría de navegación (UT 10.11), practica en per-10-4. |
| bal-per-2021-03-eg-02 | se queda | — | Bombas de achique: estructura (UT 1.2), practica en per-1-3. Señal de vocabulario: ruido. |
| bal-per-2021-06-e-16 | se queda | — | Ritmos de luz: Balizamiento, practica en per-5-5. |
| bal-per-2021-06-espa-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2021-06-g-08 | se queda | — | Ventilar cámara de máquinas y baterías: comprobaciones antes de salir (UT 3.2), practica en per-3-2. |
| bal-per-2021-06-g-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2021-09-b-41 | se queda | — | Qué es la situación de estima: practica en su tema (Teoría de navegación). |
| bal-per-2021-09-d-22 | se queda | — | Regla 1 del RIPA (reglas especiales): RIPA. Señal de vocabulario: ruido. |
| bal-per-2021-09-f-01 | se queda | — | La caña del timón: practica en per-1-4 (El timón), de su tema. |
| bal-per-2021-12-a-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2021-12-b-03 | se queda | — | Paso de la hélice: practica en per-1-5 (La hélice), de su tema. |
| bal-per-2021-12-c-02 | se queda | — | La línea de fondeo: Nomenclatura (UT 1.3), practica en per-1-6. |
| bal-per-2021-12-c-09 | se queda | — | Uso del extintor: material de seguridad (UT 3.7), practica en per-3-6. |
| bal-per-2021-12-c-41 | se queda | — | Característica de una luz: Teoría de navegación (UT 10.11), practica en per-10-4. |
| bal-per-2021-12-d-07 | se queda | — | Tiempo de supervivencia: el programa lo pone también en Seguridad (UT 3.8) y practica en per-3-3. |
| bal-per-2022-03-a-28 | se queda | — | Abatimiento: también de Maniobra (UT 7.2), practica en per-7-6. |
| bal-per-2022-03-c-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2022-06-d-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2022-09-c-01 | se queda | — | Grifos de fondo: Nomenclatura (UT 1.2), practica en per-1-3. |
| bal-per-2022-09-c-31 | se queda | — | Bombas de achique en una inundación: practica en per-8-5 (Vías de agua), de su tema. |
| bal-per-2022-09-m-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2023-03-cg-10 | se queda | — | Qué hacer con niebla: Seguridad (UT 3.5, baja visibilidad), practica en per-3-4. |
| bal-per-2023-09-c-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2023-12-b-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2023-12-c-19 | se queda | sigue en per-5-5 (excepción «contenido-de-la-clase») | Su contenido es de Balizamiento (programa del PER, UT 5.1), pero el tribunal la puso en el bloque del RIPA, que tiene límite de fallos propio: cambiar su tema cambiaría cómo se corrige ese examen (máximo 5 fallos en RIPA y 2 en Balizamiento). Conserva el tema del tribunal y practica en la clase que la explica. |
| bal-per-2023-12-c-28 | se queda | — | Deriva y abatimiento en la maniobra: Maniobra (UT 7.2), practica en per-7-6. |
| bal-per-2023-12-c-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2023-12-e-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2024-04-a-06 | se queda | — | Elementos de amarre (el obenque no lo es): practica en per-2-1. |
| bal-per-2024-04-df-43 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2024-07-df-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2024-09-a-10 | se queda | — | Homologación del equipo de seguridad: practica en per-3-5, de su tema. |
| bal-per-2024-12-b-40 | se queda | — | Recalada: vocabulario de la navegación. Señal de vocabulario: ruido. |
| bal-per-2025-04-ae-41 | se queda | — | Símbolos de la carta (roca): Teoría de navegación (UT 10.2), practica en per-10-3. |
| bal-per-2025-04-bf-37 | se queda | — | Boyas de datos: el tribunal la pone en «UT10.11 Ayudas a la navegación», practica en per-10-3. |
| bal-per-2025-07-a-07 | se queda | — | El achique como equipo de seguridad: Seguridad (programa UT 3.7), practica en su tema. Señal de vocabulario: ruido. |
| bal-per-2025-07-a-44 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2025-07-b-42 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2025-09-b-10 | se queda | — | Masaje cardiaco: el programa lo pone en Seguridad (UT 3.8, hombre al agua) y practica en per-3-8. |
| bal-per-2025-09-b-45 | se queda | sigue en per-10-8 (excepción «contenido-de-la-clase») | Problema de mareas (sonda en pleamar o bajamar): el tribunal lo pone en el bloque de Carta (tema 11), pero se enseña en la clase de mareas del tema 10, que es donde tiene sentido practicarlo. |
| bal-per-2025-09-d-40 | se queda | — | Alcance de los faros: Teoría de navegación (UT 10.11), practica en per-10-4. |
| bal-per-2026-03-c-27 | se queda | — | Regla 1 del RIPA: RIPA. Señal de vocabulario: ruido. |
| bal-per-2026-03-d-07 | se queda | — | Derrame de combustible al repostar: comprobaciones antes de salir, practica en per-3-2. |
| bal-per-2017-03-ci-38 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-03-fa-31 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-03-ge-38 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2017-07-b-28 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2017-09-a-08 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2018-04-b-06 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2018-12-b-41 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2019-04-a-22 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-04-a-40 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2019-04-b-04 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-04-c-32 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2019-12-b-39 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2020-07-d-40 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2020-07-e-41 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2021-03-b-07 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2021-09-d-41 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2022-03-b-40 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2023-06-af-40 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2024-04-a-05 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-ce-10 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-ce-18 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-04-df-05 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-07-a-05 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2024-09-e-11 | dudosa | sigue en per-5-2 (excepción «contenido-de-la-clase») | Navegar por estribor al entrar en puerto: es tanto del RIPA (regla 9) como de Balizamiento; el tribunal la puso en Legislación y ninguna clase de Legislación lo explica. Pasarla a Balizamiento metería un fallo más en un bloque con límite. Practica en per-5-2, que explica por qué banda entrar. |
| bal-per-2025-04-ae-37 | dudosa | — | Marcas de peligro nuevo: el tribunal las pone en Teoría de navegación y lo dice en el enunciado («UT10.11. Ayudas a la navegación: faros y balizas»). Pasarlas a Balizamiento cambiaría su límite de fallos; ninguna clase de Teoría las enseña, así que salen en las tandas de su tema y no en la práctica de una clase. |
| bal-per-2025-07-d-39 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2025-12-d-38 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-06-b-29 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-b-10 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-c-02 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-c-10 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |
| bal-per-2026-09-d-30 | dudosa | — | Reservada para el examen final: no se cambia su tema ni entra en la práctica mientras lo sea. Revisar cuando salga de la reserva. |

### baleares · py

| id | Decisión | De → a | Motivo |
|---|---|---|---|
| bal-py-2017-03-a-26 | cambia de clase | practica en py-3-8 | Es de su tema (Teoría de navegación) y py-3-8 (El radar) enseña que el SART responde al radar de banda X: practica ahí y no en Seguridad. |
| bal-py-2017-12-b-23 | cambia de clase | practica en py-3-8 | Es de su tema (Teoría de navegación) y py-3-8 (El radar) enseña que el SART responde al radar de banda X: practica ahí y no en Seguridad. |
| bal-py-2017-03-cb-34 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2017-12-a-37 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2018-04-a-31 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2018-04-b-38 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2018-12-b-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2019-04-a-31 | se queda | — | Corrección total con la tablilla y la carta: carta (programa del PY, UT 4.1), practica en py-4-1. |
| bal-py-2019-04-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2019-04-b-38 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2019-06-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2020-07-a-33 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2020-12-a-36 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2020-12-b-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2021-03-ac-31 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2021-03-ac-33 | se queda | — | Corrección total con la tablilla y la carta: carta (programa del PY, UT 4.1), practica en py-4-1. |
| bal-py-2021-03-b-35 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2021-06-b-39 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2021-12-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2021-12-b-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2022-03-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2022-06-a-37 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2022-06-n-10 | se queda | sigue en py-3-10 (excepción «contenido-de-la-clase») | El AIS se enseña en py-3-10 (programa del PY, UT 3.9), pero el tribunal la puso en Seguridad (módulo genérico). Cambiar su tema la pasaría de módulo y de límite de fallos, y ninguna clase de Seguridad explica el AIS: conserva su tema y practica en py-3-10. |
| bal-py-2022-06-n-37 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2022-12-b-34 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2023-03-ac-39 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2023-06-ac-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2023-06-b-36 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2023-06-b-39 | se queda | — | Corrección total con la tablilla y la carta: carta (programa del PY, UT 4.1), practica en py-4-1. |
| bal-py-2023-12-b-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2024-04-bc-35 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2024-07-a-37 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2024-12-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2024-12-bc-32 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2025-04-bc-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2025-07-a-40 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2025-07-b-37 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |
| bal-py-2025-12-b-35 | se queda | — | Mareas del Anuario: el tribunal las pone en el bloque de carta y el programa del PY también (UT 4.9). La clase py-3-6 pasa al tema de carta, así que ya practica en su tema. |

<!-- notas -->
## Antes y después de recolocar la práctica (10 de noviembre de 2026)

La señal «practica» (pregunta en la práctica de una clase de otro tema) era un error nuestro de clasificación. Se han
recolocado con `node tools/bancos/practica-tema.mjs --excepciones --escribir` (el `ut` de ninguna cambia; detalle de cada
movimiento en `.trabajo-ux/PRACTICA-temas.md`).

| Eje | Tit. | Candidatas antes | después | Fuertes antes | después | «practica» antes | después (todas, excepciones revisadas) |
|---|---|---|---|---|---|---|---|
| andalucia | per | 17 | 13 | 3 | 3 | 6 | 2 |
| andalucia | py | 29 | 15 | 0 | 0 | 27 | 13 |
| dgmm | per | 72 | 46 | 5 | 5 | 26 | 0 |
| dgmm | py | 20 | 4 | 1 | 0 | 17 | 0 |
| baleares | per | 208 | 165 | 79 | 70 | 119 | 52 |
| baleares | py | 38 | 38 | 3 | 3 | 35 | 35 |
| **Total** | | **384** | **281** | **91** | **81** | **230** | **102** |

Qué se hizo con las 230:

| Eje | Tit. | Quitadas de la clase de otro tema (ya estaban en una del suyo) | A la clase de su tema, por idea | Fuera de las clases (solo en su tema) | Excepción «tema-dudoso» | Excepción «clase-corta» |
|---|---|---|---|---|---|---|
| andalucia | per | 4 | 0 | 0 | 0 | 2 |
| andalucia | py | 14 | 0 | 0 | 0 | 13 |
| dgmm | per | 2 | 24 | 0 | 0 | 0 |
| dgmm | py | 15 | 2 | 0 | 0 | 0 |
| baleares | per | 0 | 43 | 24 | 51 | 1 |
| baleares | py | 0 | 0 | 0 | 3 | 32 (además, a su clase de mareas py-4-9) |
| **Total** | | **35** | **69** | **24** | **54** | **48** |

Ninguna salió por los criterios «hermanas» ni «parecido». Las 102 que quedan con la señal son las excepciones de
`tools/bancos/practica-excepciones.json`; `tests/practica-tema.test.js` falla si aparece cualquier otra.


## Notas de la revisión (R-29, a mano)

**Criterio.** Manda el tema del programa (RD 875/2014, anexo II; el ancla de cada idea en el catálogo de conceptos). Si
una pregunta es de otro tema y ninguna clase del suyo la explica, cambia de tema en el dato (ajuste por id y banco), pero
solo entre temas **sin límite de fallos propio**: el tema también decide en qué bloque cuenta el fallo al corregir el
examen real (PER: máximo 5 en RIPA, 2 en Balizamiento y 2 en Carta; PY: cada materia tiene el suyo). Si el cambio tocaría
un bloque con límite, conserva el tema del tribunal y practica en la clase que la explica, con su excepción. Andalucía no
cambia de tema (huella del banco) y las reservadas para el examen final no se tocan.

**Las 102 de la práctica.** De las 54 «tema-dudoso»: 43 cambian de tema (y ya practican en su tema), 6 cambian a una
clase de su tema que las explica (remolque → per-3-8, deriva → per-7-6, retroceso → per-7-4, SART → py-3-8), 4 se quedan
con excepción (3 de balizamiento que el tribunal cuenta en el RIPA y el AIS del PY en Seguridad) y 1 sigue dudosa
(bal-per-2024-09-e-11). De las 48 «clase-corta»: las 45 mareas del PY dejan de serlo al pasar la clase del Anuario al
tema de carta; el bichero cambia de tema (per-7-8 recibe 4 de desatraque del banco); and-2019-c2-t21 practica solo en el
RIPA y and-2016-c2-t26 sigue en per-4-3 (en Andalucía no hay más preguntas libres de buzos y bañistas).

**El Anuario del PY (py-3-6) pasa al tema de carta.** El tribunal pregunta las mareas en el bloque de carta (Andalucía,
las 17–18 del cuadernillo de navegación; Baleares, 31–40; DGMM igual): en los tres bancos hay 142 preguntas de mareas en
Carta y 1 en Teoría. El programa del PY las pone en la UT 4.9, no en la 3. Y cuentan en el límite de Carta (3 fallos de
10), el más estricto: con la clase en Teoría, su avance contaba en un tema distinto del que suspende. Se mueve al módulo 4
del curso (`ut: 4`) sin cambiar su id; en la ruta va justo después de py-3-5, como antes (al principio del tramo de carta
siguiente). Las dos clases son del módulo de navegación, así que el foco por módulo no cambia; la ruta, los nodos del mapa
«Mareas y la hora» y los tests leen el tema de la clase y no su id. La única pregunta de mareas del tema de Teoría
(and-py-2015-c3-n08) sigue en py-3-6 con excepción; en DGMM, py-3-6 deja las 3 de corrección total que tenía por error y
practica con las 9 mareas libres del banco.

**Clases cortas que quedan** (menos de 3 preguntas de su tema, todas de antes de esta revisión salvo per-4-3): Andalucía
per-4-3 (2 + la excepción), per-7-5 (2) y per-11-1 (1); DGMM per-11-1 (2) y py-4-6 (1); Baleares py-3-4 (2). No hay en
sus bancos preguntas libres de su idea para completarlas.
