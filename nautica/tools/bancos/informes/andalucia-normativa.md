# Andalucía · normativa del banco vivo (solo informe)

Generado por `node tools/bancos/ejes/andalucia/normativa.mjs` el 2026-10-07. Aplica la etapa `normativa` (`tools/bancos/etapas/normativa.mjs`, con `data/normativa.json`) al banco vivo `data/ejes/andalucia/<tit>/preguntas.json` (810 preguntas de PER y 720 de PY, 2020–2026) **en modo informe**: el banco no cambia y el campo `norma` de cada pregunta sigue en «vigente». La fase F1 resuelve cada pregunta marcada (confirmar, corregir la respuesta, añadir una nota o retirarla).

Una pregunta se marca con una norma si su aparición más antigua es anterior a la entrada en vigor y su texto (contexto, enunciado y opciones, sin tildes ni mayúsculas) encaja con algún detector de la norma. Los detectores son anchos a propósito: **se marca de más**, y muchas marcas resultarán ser preguntas que siguen valiendo (el motivo de cada una permite descartarlas deprisa).

## Comprobación de data/normativa.json

Fechas de entrada en vigor, BOE, URL y detectores imprescindibles de los cambios pedidos, frente a `research_notes/…/normativa.md`:

| Norma | Vigor | BOE | URL | Detectores | Resultado | Nota |
|---|---|---|---|---|---|---|
| RD 339/2021 | 2021-07-01 | BOE-A-2021-8268 | https://www.boe.es/buscar/act.php?id=BOE-A-2021-8268 | 48 (incluye «bengala», «chaleco», «extintor», «orden fom/1144») | coincide | deroga la Orden FOM/1144/2003 con efectos desde el 1-7-2021 (normativa.md, § 2) |
| RD 587/2022 | 2022-07-21 | BOE-A-2022-12013 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12013 | 17 (incluye «navtex») | coincide | NAVTEX en zona 1 solo para la lista 6.ª; balsas homologadas por la DGMM (§ 2 y § 4) |
| RD 1188/2025 (gobierno sin título) | 2026-10-01 | BOE-A-2025-27010 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010 | 20 (incluye «sin titul», «11[,.]26», «15 ?cv», «alquiler») | coincide | art. 10 del RD 875/2014 «con efectos desde el 1 de octubre de 2026» (DF 2.ª.2; § 1 y § 3) |
| RD 191/2026 | 2026-04-02 | BOE-A-2026-5877 | https://www.boe.es/eli/es/rd/2026/03/11/191 | 20 (incluye «posidonia», «pradera», «cymodocea») | coincide | prohibición general de fondear sobre praderas en el Mediterráneo (§ 5) |
| IALA MBS 2022 | 2026-01-09 | BOE-A-2026-510 | https://www.boe.es/boe/dias/2026/01/09/pdfs/BOE-A-2026-510.pdf | 20 (incluye «boya», «baliza», «cardinal», «lateral») | coincide | IALA-MBS 2010 (Puertos del Estado, 8-6-2010; aún citada por Murcia, Melilla y el norte) frente a la MBS 2022 que cita la DGMM en el BOE-A-2026-510; sin cambio verificado entre ediciones (§ 4, Gaps): se revisa todo el balizamiento anterior |

## Resumen

| Norma | En vigor desde | PER | PY | Total |
|---|---|---|---|---|
| **RD 339/2021** | 2021-07-01 | 15 | 19 | 34 |
| **RD 587/2022** | 2022-07-21 | 0 | 28 | 28 |
| **RD 1188/2025 (gobierno sin título)** | 2026-10-01 | 2 | 0 | 2 |
| **RD 191/2026** | 2026-04-02 | 18 | 2 | 20 |
| **IALA MBS 2022** | 2026-01-09 | 101 | 19 | 120 |
| RD 875/2014 | 2015-01-11 | 0 | 0 | 0 |
| RIPA enmiendas 2013 | 2016-01-01 | 0 | 0 | 0 |
| RD 238/2019 | 2019-07-01 | 0 | 0 | 0 |
| RD 550/2020 | 2020-07-01 | 0 | 0 | 0 |
| RD 186/2023 | 2023-04-11 | 9 | 1 | 10 |
| RD 1188/2025 (buceo y ROM) | 2025-12-31 | 4 | 0 | 4 |

Preguntas distintas marcadas: **195** (142 de PER y 53 de PY); 21 con más de una norma. En negrita, los cambios pedidos para esta revisión; el resto son las demás normas de `data/normativa.json` cuya fecha cae dentro del banco.

## RD 339/2021

Real Decreto 339/2021, de 18 de mayo, por el que se regula el equipo de seguridad, salvamento, contra incendios, navegación y prevención de vertidos por aguas sucias de las embarcaciones de recreo (deroga la Orden FOM/1144/2003). En vigor desde el 2021-07-01 ([BOE-A-2021-8268](https://www.boe.es/buscar/act.php?id=BOE-A-2021-8268)). Equipo por zona de navegación: cambian bengalas, cohetes y fumígenas (zona 4: de 6+6+1 a 3+3+0; zona 2: 1 fumígena); chaleco por persona con luz y +1 en zona 1 (antes 110 %); extintores 34B (antes 21B); desaparecen como obligatorios la corredera, el compás de puntas, el transportador y la regla; campana solo si L ≥ 20 m; aguas sucias referidas a la línea de base.

34 preguntas (15 de PER, 19 de PY). Motivo común: la pregunta es anterior al 2021-07-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1): Las marcas son todas de 2020-c1, 2020-c3 y 2021-c1 (antes del 1-7-2021). Las más cercanas al cambio: and-2021-c1-t09 (flotabilidad en zona 4: 150 N, sin cambio en el RD), and-py-2021-c1-g04 (chalecos de niños: uno por niño, sin cambio), and-2020-c1-t11 (aguas sucias de tanque a régimen moderado y ≥ 4 nudos: el RD 339/2021 lo mantiene), and-2020-c3-t10 (aros con luz), and-2021-c1-t07 y and-py-2020-c3-g04 (fumígena de 3 minutos) y and-py-2020-c1-g04 (bengala de mano de 60 s). Ninguna pregunta del banco vivo pide el número de bengalas, cohetes o fumígenas por zona, los chalecos de zona 1, el tipo de extintor ni el material náutico, que es lo que cambió. El resto son marcas anchas (corredera como instrumento, «regla de» visibilidad reducida, achique en vías de agua, supervivencia en la balsa).

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2020-c1-t11 | 2020-07-25 | 4 | `aguas sucias` | la descarga de **aguas sucias** que hayan estado almacenadas en lo… |
| and-2020-c1-t12 | 2020-07-25 | 4 | `desmenuz` | …editerraneo, la descarga de comida **desmenuz**ada puede realizarse: siempre a mas… |
| and-2020-c1-t26 | 2020-07-25 | 6 | `regla de` | …ora. en este caso: en virtud de la **regla de** visibilidad reducida, debemos evit… |
| and-2020-c1-t31 | 2020-07-25 | 8 | `achique` | … tomar medidas de apuntalamiento y **achique** oportunas acordar la separacion co… |
| and-2020-c1-t38 | 2020-07-25 | 10 | `corredera` | … barco?: sumando el coeficiente de **corredera** a la velocidad de corredera multip… |
| and-2020-c3-t03 | 2020-12-19 | 1 | `bocina` | …ma: prensa estopa guardines limera **bocina** |
| and-2020-c3-t04 | 2020-12-19 | 1 | `achique` | …son: aspiraciones de las bombas de **achique** los grifos de fondo valvulas de se… |
| and-2020-c3-t10 | 2020-12-19 | 3 | `aros salvavidas` | …mendaciones de uso y estiba de los **aros salvavidas** a bordo: deben colocarse tanto a p… |
| and-2020-c3-t12 | 2020-12-19 | 4 | `plastico` | la evacuacion de **plastico**s se debe hacer: con velocidad supe… |
| and-2020-c3-t27 | 2020-12-19 | 6 | `zona de navegacion` | …pulsion mecanica puede utilizar la **zona de navegacion** costera adyacente? cuando su eslor… |
| and-2020-c3-t32 | 2020-12-19 | 8 | `achique`, `balde` | …forzar el trabajo de las bombas de **achique**, soltaremos la toma de agua de mar… |
| and-2020-c3-t40 | 2020-12-19 | 10 | `corredera` | …r el barco es: el transpondedor la **corredera** el transductor la sonda |
| and-2021-c1-t07 | 2021-05-22 | 3 | `fumigen` | la senal **fumigen**a flotante emitira humo al menos du… |
| and-2021-c1-t08 | 2021-05-22 | 3 | `aro salvavidas` | …cayo el hombre/mujer y lanzarle un **aro salvavidas**. meter el timon a la banda opuesta… |
| and-2021-c1-t09 | 2021-05-22 | 3 | `chaleco`, `zona [1-7]\b`, `flotabilidad` | con respecto a los **chaleco**s salvavidas que debemos de llevar … |
| and-py-2020-c1-g04 | 2020-07-25 | 1 | `bengala` | la **bengala** de mano tendra un periodo de combu… |
| and-py-2020-c1-g05 | 2020-07-25 | 1 | `balsa` | …zafada (zafa hidrostatica) para la **balsa** salvavidas, esta zafa: soltara aut… |
| and-py-2020-c1-g06 | 2020-07-25 | 1 | `balsa` | …spuesta incorrecta: a bordo de una **balsa** salvavidas, para evitar la deshidr… |
| and-py-2020-c1-g07 | 2020-07-25 | 1 | `chaleco` | … personas a bordo deben ponerse el **chaleco** salvavidas y estar atentos a las i… |
| and-py-2020-c1-g10 | 2020-07-25 | 1 | `balsa` | …acion, si durante el inflado de la **balsa** salvavidas esta quedara con la qui… |
| and-py-2020-c3-g04 | 2020-12-19 | 1 | `fumigen` | las senales **fumigen**as: emiten humo naranja durante al … |
| and-py-2020-c3-g05 | 2020-12-19 | 1 | `balsa` | …ujetar los aparatos de emergencia (**balsa**s, balizas, etc.) al buque de una f… |
| and-py-2020-c3-g06 | 2020-12-19 | 1 | `chaleco`, `flotabilidad` | los **chaleco**s salvavidas: estan disenados para … |
| and-py-2020-c3-g07 | 2020-12-19 | 1 | `chaleco`, `balsa` | …os y sin saltar sobre la balsa sin **chaleco** salvavidas desde el agua, ayudados… |
| and-py-2020-c3-g08 | 2020-12-19 | 1 | `reflector de radar` | …se denomina: heliografo heliometro **reflector de radar** resar |
| and-py-2020-c3-g09 | 2020-12-19 | 1 | `pirotecni` | …arrancar el motor lanzar una senal **pirotecni**ca para senalar nuestra posicion la… |
| and-py-2020-c3-g10 | 2020-12-19 | 1 | `balsa` | …ndo nos encontramos a bordo de una **balsa** salvavidas es recomendable: beber … |
| and-py-2021-c1-g02 | 2021-05-22 | 1 | `balsa` | la zafa hidrostatica de la **balsa** salvavidas se activa automaticamen… |
| and-py-2021-c1-g04 | 2021-05-22 | 1 | `chaleco` | cuantos **chaleco**s salvavidas para ninos debemos lle… |
| and-py-2021-c1-g05 | 2021-05-22 | 1 | `balsa` | …n parte del equipo que contiene la **balsa** salvavidas. |
| and-py-2021-c1-g07 | 2021-05-22 | 1 | `pirotecni` | …on mas imprescindible. el material **pirotecni**co. el ordenador portatil. las male… |
| and-py-2021-c1-g08 | 2021-05-22 | 1 | `chaleco`, `balsa` | … ancla de capa. haremos flotar los **chaleco**s salvavidas amarrados entre si y a… |
| and-py-2021-c1-g09 | 2021-05-22 | 1 | `bengala` | …os tomar a la hora de utilizar las **bengala**s? mostrarlas por la banda de babor… |
| and-py-2021-c1-g10 | 2021-05-22 | 1 | `balsa` | …las de supervivencia a bordo de la **balsa** salvavidas es: no consumir ni agua… |

## RD 587/2022

Real Decreto 587/2022, de 19 de julio (radiocomunicaciones de recreo, balsas salvavidas, instructores británicos). En vigor desde el 2022-07-21 ([BOE-A-2022-12013](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12013)). Radio en zona 1: el NAVTEX solo es obligatorio para las embarcaciones de la lista 6.ª; balsas ISO 9650 u otra normativa equivalente homologadas por la DGMM.

28 preguntas (0 de PER, 28 de PY). Motivo común: la pregunta es anterior al 2022-07-21; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1): Todas son del PY (genérico y navegación) de 2020-c1 a 2022-c2. Ninguna pregunta trata del NAVTEX en zona 1, que es lo que cambió para la radio; las que tocan equipos son and-py-2021-c1-g05 (EPIRB), and-py-2021-c2-g07 y -g09 (EPIRB y SART), and-py-2021-c2-g10 (VHF con LSD) y las de la balsa (and-py-2022-c1-g04 envoltura, and-py-2022-c2-g08 toldo), donde el cambio de 2022 solo afecta a la homologación de las balsas (ISO 9650 u otra norma equivalente homologada por la DGMM). El resto son técnicas de supervivencia en la balsa y canales de VHF.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-py-2020-c1-g05 | 2020-07-25 | 1 | `balsa`, `zafa hidrostatica` | …zafada (zafa hidrostatica) para la **balsa** salvavidas, esta zafa: soltara aut… |
| and-py-2020-c1-g06 | 2020-07-25 | 1 | `balsa` | …spuesta incorrecta: a bordo de una **balsa** salvavidas, para evitar la deshidr… |
| and-py-2020-c1-g08 | 2020-07-25 | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …zar los equipos de comunicaciones (**vhf** portatil en caso de abandono de la… |
| and-py-2020-c1-g09 | 2020-07-25 | 1 | `radiobaliza`, `epirb` | en caso de que nuestra **radiobaliza** de localizacion de siniestros (epi… |
| and-py-2020-c1-g10 | 2020-07-25 | 1 | `balsa` | …acion, si durante el inflado de la **balsa** salvavidas esta quedara con la qui… |
| and-py-2020-c3-g05 | 2020-12-19 | 1 | `balsa`, `zafa hidrostatica` | …ujetar los aparatos de emergencia (**balsa**s, balizas, etc.) al buque de una f… |
| and-py-2020-c3-g07 | 2020-12-19 | 1 | `balsa` | …ea posible, debemos embarcar en la **balsa**: sin mojarnos y sin saltar sobre l… |
| and-py-2020-c3-g10 | 2020-12-19 | 1 | `balsa` | …ndo nos encontramos a bordo de una **balsa** salvavidas es recomendable: beber … |
| and-py-2021-c1-g02 | 2021-05-22 | 1 | `balsa`, `zafa hidrostatica` | la zafa hidrostatica de la **balsa** salvavidas se activa automaticamen… |
| and-py-2021-c1-g05 | 2021-05-22 | 1 | `balsa`, `radiobaliza`, `epirb` | …n parte del equipo que contiene la **balsa** salvavidas. |
| and-py-2021-c1-g06 | 2021-05-22 | 1 | `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …los tripulantes de un helicoptero? **canal 9**. canal 70. canal 16. canal 06. |
| and-py-2021-c1-g08 | 2021-05-22 | 1 | `balsa` | ¿que elemento de la **balsa** hinchable salvavidas debemos utili… |
| and-py-2021-c1-g10 | 2021-05-22 | 1 | `balsa` | …las de supervivencia a bordo de la **balsa** salvavidas es: no consumir ni agua… |
| and-py-2021-c2-g07 | 2021-11-20 | 1 | `epirb` | ¿que autonomia tiene una **epirb**? 12 horas 24 horas 48 horas 36 hor… |
| and-py-2021-c2-g08 | 2021-11-20 | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …aso de emergencia con el equipo de **vhf** portatil? canal 16 canal 70 canal … |
| and-py-2021-c2-g09 | 2021-11-20 | 1 | `epirb`, `\bsart\b` | …rias pueden intercambiarse con las **epirb** |
| and-py-2021-c2-g10 | 2021-11-20 | 1 | `\blsd\b`, `equipos? de radio`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …equipos de radio fijos con sistema **lsd**? dispondran de un boton rojo con l… |
| and-py-2021-c2-n01 | 2021-11-20 | 3 | `vhf` | …vil maritimo opera el sistema ais: **vhf** hf mf uhf |
| and-py-2021-c2-n09 | 2021-11-20 | 3 | `\bmmsi\b` | … ais? nombre de la embarcacion eta **mmsi** todas las anteriores son correctas |
| and-py-2022-c1-g04 | 2022-03-26 | 1 | `balsa` | las **balsa**s salvavidas inflables iran en una … |
| and-py-2022-c1-g08 | 2022-03-26 | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …us tripulantes: por el canal 12 de **vhf**, destinado a este fin en caso de r… |
| and-py-2022-c1-g09 | 2022-03-26 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2022-c1-g10 | 2022-03-26 | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …ar la embarcacion, utilizaremos el **vhf** de la siguiente manera: selecciona… |
| and-py-2022-c2-g06 | 2022-06-11 | 1 | `balsa`, `radiobaliza`, `respondedor`, `\bsart\b` | …dolo en el momento de entrar en la **balsa** |
| and-py-2022-c2-g07 | 2022-06-11 | 1 | `balsa`, `vhf` | …as manos si nos encontramos en una **balsa** salvavidas, usaremos el vhf portat… |
| and-py-2022-c2-g08 | 2022-06-11 | 1 | `balsa`, `radiobaliza` | la **balsa** salvavidas estara provista de un t… |
| and-py-2022-c2-g09 | 2022-06-11 | 1 | `balsa`, `zafa hidrostatica` | …afa hidrostatica utilizada para la **balsa** salvavidas: soltara manualmente la… |
| and-py-2022-c2-g10 | 2022-06-11 | 1 | `balsa`, `radiobaliza` | …onar la embarcacion utilizando una **balsa** salvavidas: amarraremos a bordo la… |

## RD 1188/2025 (gobierno sin título)

Real Decreto 1188/2025, de 26 de diciembre: nueva redacción del art. 10 del RD 875/2014 (navegación sin título). En vigor desde el 2026-10-01 ([BOE-A-2025-27010](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010)). Sin título solo para uso privado de embarcaciones a motor de hasta 5 m y 15 CV sin dispositivo reductor (antes 11,26 kW), vela deportiva hasta 6 m y artefactos de playa; a 2 millas del puerto, marina o playa de salida; el alquiler exige título.

2 preguntas (2 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2026-10-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1): El banco vivo no tiene ninguna pregunta sobre la navegación sin título (art. 10 del RD 875/2014): las dos marcas son por «6 metros de eslora» en la cadena de fondeo (and-2023-c1-t01) y por «artefactos flotantes» en los puertos comerciales (and-2026-c2-t11). No hay respuestas oficiales que el cambio del 1-10-2026 deje obsoletas; si la fase F1 añade una pregunta o una explicación sobre el gobierno sin título, debe usar la redacción nueva (uso privado, 15 CV sin reductor, 2 millas de la salida, alquiler con título).

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2023-c1-t01 | 2023-03-25 | 1 | `(^\|[^0-9,.])6 metros de eslora` | en las embarcaciones de mas de** 6 metros de eslora**, la longitud del tramo de cadena d… |
| and-2026-c2-t11 | 2026-06-13 | 4 | `artefactos? (flotante\|de playa)` | …a total inferior a 20 metros y los **artefactos flotante**s de recreo no estorbaran el transi… |

## RD 191/2026

Real Decreto 191/2026, de 11 de marzo, de conservación de las praderas de fanerógamas marinas en el Mediterráneo. En vigor desde el 2026-04-02 ([BOE-A-2026-5877](https://www.boe.es/eli/es/rd/2026/03/11/191)). Prohibición general de fondear sobre Posidonia oceanica y Cymodocea nodosa (y en arenas próximas si la cadena o el borneo las afectan) en todo el Mediterráneo español, salvo con sistemas de bajo impacto autorizados.

20 preguntas (18 de PER, 2 de PY). Motivo común: la pregunta es anterior al 2026-04-02; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1): Las que tratan de la posidonia son and-2022-c2-t11, and-2024-c3-t11 y and-2026-c1-t11: sus respuestas oficiales (prohibición general de fondear sobre la pradera, también con la cadena o el borneo, salvo fuerza mayor; los campos de boyas no permiten fondear sobre ella) coinciden con el art. 5 del RD 191/2026, aunque son anteriores a él; conviene citar la norma en la explicación. También: and-2025-c2-q45 (fondeo prohibido en la carta), and-2024-c1-t40 (fondeadero prohibido en las cartas), las ZEPIM (and-2021-c1-t12, and-2021-c2-t11, and-2023-c1-t11) y la elección del tenedero (and-2020-c1-t06, and-2022-c2-t05, and-2025-c3-t06, con «algas» entre las opciones, and-2022-c3-t06, and-2024-c2-t06, and-2025-c1-t05), donde la explicación debería añadir que en el Mediterráneo no se fondea sobre praderas. El resto son marcas anchas («fondeadero», «fondo marino»).

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2020-c1-t06 | 2020-07-25 | 2 | `tenedero` | de los **tenedero**s siguientes, ¿cual seria el menos … |
| and-2021-c1-t12 | 2021-05-22 | 4 | `\bzepim\b` | ¿en andalucia se considera zona **zepim** el paraje natural acantilados maro… |
| and-2021-c2-t11 | 2021-11-20 | 4 | `zona(s)? especialmente protegida`, `\bzepim\b` | … importancia para el mediterraneo. **zona especialmente protegida** de importancia para el medio marin… |
| and-2022-c2-t05 | 2022-06-11 | 2 | `tenedero` | indique cual de los siguientes **tenedero**s es el mas adecuado para fondear: … |
| and-2022-c2-t11 | 2022-06-11 | 4 | `posidonia`, `pradera`, `prohibid.{0,30}fonde` | …a la proteccion de las praderas de **posidonia** oceanica, ¿que respuesta es correc… |
| and-2022-c3-t06 | 2022-11-05 | 2 | `(lugar\|sitio\|fondo).{0,30}(fondear\|fondeo)` | respecto al **lugar de fondeo**, ¿cual de las siguientes afirmacio… |
| and-2022-c3-t29 | 2022-11-05 | 7 | `(fondear\|fondeo).{0,30}(lugar\|sitio\|fondo)` | …stribor en una ciaboga lo mejor es **fondear, en primer lugar** |
| and-2023-c1-t11 | 2023-03-25 | 4 | `zona(s)? especialmente protegida`, `\bzepim\b`, `fondos? marinos?` | ¿cual de las siguientes es una **zona especialmente protegida** de importancia para el mediterrane… |
| and-2023-c2-t22 | 2023-06-17 | 6 | `fondeadero` | …i cerca de un canal angosto, paso, **fondeadero** o zona de navegacion frecuente si,… |
| and-2023-c3-t02 | 2023-10-21 | 1 | `fondeadero` | …a pendura cuando: se desprende del **fondeadero** afloro clara a la superficie el an… |
| and-2024-c1-t40 | 2024-04-06 | 10 | `fondeadero` | las zonas de **fondeadero** prohibido ¿es una informacion que … |
| and-2024-c2-t06 | 2024-07-13 | 2 | `(lugar\|sitio\|fondo).{0,30}(fondear\|fondeo)` | …ue se debe considerar al elegir un **lugar de fondeo** adecuado?: solo la profundidad del… |
| and-2024-c3-t11 | 2024-11-16 | 4 | `posidonia`, `pradera`, `espacio(s)? (natural\|protegid)`, `prohibid.{0,30}fonde`, `zona(s)? especialmente protegida`, `\bzepim\b` | …mbarcaciones sobre las praderas de **posidonia** oceanica las respuestas b) y c) so… |
| and-2025-c1-t05 | 2025-03-22 | 2 | `(lugar\|sitio\|fondo).{0,30}(fondear\|fondeo)` | respecto al **lugar de fondeo**, ¿cual de las siguientes opciones … |
| and-2025-c3-t06 | 2025-11-15 | 2 | `\balgas?\b` | …s para realizar un fondeo seguro?: **algas** fango duro piedra arcilla |
| and-2025-c3-t39 | 2025-11-15 | 10 | `fondeadero` | … costa, ensenadas, puertos, radas, **fondeadero**s, etc., se llaman: cartuchos de re… |
| and-2026-c1-t11 | 2026-03-21 | 4 | `posidonia`, `pradera`, `campos? de boyas` | …manera directa sobre la pradera de **posidonia** oceanica la bandera de la comunida… |
| and-2025-c2-q45 | 2025-07-05 | 11 | `prohibido fondear`, `prohibid.{0,30}fonde` | …de las siguientes situaciones esta **prohibido fondear**: 36º 01,4' n, 005º 30,8' w 35º 57,… |
| and-py-2021-c1-g17 | 2021-05-22 | 2 | `fondos? marinos?` | …da entre la cresta de una ola y el **fondo marino**. es la distancia horizontal medida… |
| and-py-2021-c2-n06 | 2021-11-20 | 3 | `fondos? marinos?` | …mbo efectivo referenciado sobre el **fondo marino**. el rumbo verdadero que deberemos … |

## IALA MBS 2022

Sistema de Balizamiento Marítimo de la IALA (Recomendación R1001), edición que cita el tribunal de la DGMM. En vigor desde el 2026-01-09 ([BOE-A-2026-510](https://www.boe.es/boe/dias/2026/01/09/pdfs/BOE-A-2026-510.pdf)). La convocatoria de la DGMM de 2026 remite al balizamiento IALA-MBS 2022; otras administraciones (Murcia, Melilla, comunidades del norte) siguen citando la edición de 2010 (resolución de Puertos del Estado de 8-6-2010). La fecha es la del BOE que lo cita, no la de la edición de la IALA: no se ha verificado con fuente primaria qué cambió entre ediciones, así que se revisan todas las preguntas de balizamiento anteriores.

120 preguntas (101 de PER, 19 de PY). Motivo común: la pregunta es anterior al 2026-01-09; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1): Todo el balizamiento del PER anterior a 2026 (80 de la UT 5) y las preguntas de carta y del PY con boyas, faros o marcas. No se ha verificado con fuente primaria qué cambió entre la IALA-MBS 2010 y la 2022 (normativa.md, § 4, Gaps): la fase F1 debe cotejar las de la UT 5 con el texto de la MBS 2022 antes de dar por buenas las respuestas; las de las otras unidades casi siempre nombran un faro o una boya de pasada.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2020-c1-t13 | 2020-07-25 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …na: marca de peligro aislado marca **cardinal** sur marca de aguas navegables ning… |
| and-2020-c1-t14 | 2020-07-25 | 5 | `aguas navegables` | una marca de **aguas navegables** puede ser utilizada: para indicar … |
| and-2020-c1-t15 | 2020-07-25 | 5 | `lateral`, `marca de tope` | …de tope (si la tiene) de una marca **lateral** de babor es: ninguna. la marcas la… |
| and-2020-c1-t16 | 2020-07-25 | 5 | `baliza` | entrando en puerto por un canal **baliza**do vemos una marca que emite una lu… |
| and-2020-c1-t17 | 2020-07-25 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …terrumpida. se trata de una marca: **cardinal** norte de peligro aislado de aguas … |
| and-2020-c3-t05 | 2020-12-19 | 2 | `boya` | …a evitar roces y golpes se llaman: **boya**s bolardos defensas guiacabos |
| and-2020-c3-t11 | 2020-12-19 | 4 | `baliza` | al aproximarse a una playa no **baliza**da, la velocidad maxima a la que se… |
| and-2020-c3-t13 | 2020-12-19 | 5 | `peligro aislado` | el ritmo de la luz de una marca de **peligro aislado** es: grupo de dos destellos un dest… |
| and-2020-c3-t14 | 2020-12-19 | 5 | `cardinal`, `lateral`, `aguas navegables` | …os canales se utilizan las marcas: **cardinal**es especiales laterales de aguas na… |
| and-2020-c3-t15 | 2020-12-19 | 5 | `lateral`, `peligro aislado`, `marca de tope` | … es la marca de tope de una marca: **lateral** de babor lateral de bifurcacion, c… |
| and-2020-c3-t16 | 2020-12-19 | 5 | `baliza`, `marca de tope` | saliendo de puerto por un canal **baliza**do: tendremos por estribor las marc… |
| and-2020-c3-t17 | 2020-12-19 | 5 | `cardinal` | las marcas **cardinal**es: son marcas colocadas o fondeada… |
| and-2020-c3-t41 | 2020-12-19 | 10 | `baliza`, `balizamiento` | …tica, un cartucho es: una senal de **baliza**miento la zona de tierra y costa de… |
| and-2021-c1-t13 | 2021-05-22 | 5 | `lateral` | …con una franja roja, indica: marca **lateral** de estribor. marca lateral de babo… |
| and-2021-c1-t14 | 2021-05-22 | 5 | `peligro aislado` | en una marca de **peligro aislado** el ritmo y el color de su luz es: … |
| and-2021-c1-t15 | 2021-05-22 | 5 | `aguas navegables`, `marca de tope` | la marca de tope de **aguas navegables**, consiste en: dos esferas negras. … |
| and-2021-c1-t16 | 2021-05-22 | 5 | `marca de tope` | una **marca de tope** consistente en dos conos negros su… |
| and-2021-c1-t17 | 2021-05-22 | 5 | `aguas navegables` | …stas tiene que ver con la marca de **aguas navegables**. indicas por el lugar mas adecuado… |
| and-2021-c2-t05 (anulada) | 2021-11-20 | 2 | `boya` | … posicion del ancla. suele ser una **boya**, pero puede utilizarse cualquier e… |
| and-2021-c2-t12 | 2021-11-20 | 4 | `baliza` | ante una playa **baliza**da, a que distancia de la orilla es… |
| and-2021-c2-t13 | 2021-11-20 | 5 | `boya`, `cardinal`, `lateral`, `aguas navegables`, `marca especial` | si de noche divisamos una **boya** de la cual no distinguimos la form… |
| and-2021-c2-t14 (anulada) | 2021-11-20 | 5 | `lateral` | …1 destellos: se trata de una marca **lateral** de babor. se trata de una marca la… |
| and-2021-c2-t15 | 2021-11-20 | 5 | `lateral`, `marca de tope` | la marca de tope de las marcas **lateral**es de babor en espana son: una cruz… |
| and-2021-c2-t16 | 2021-11-20 | 5 | `aguas navegables` | una marca de **aguas navegables** puede ser utilizada: para indicar … |
| and-2021-c2-t17 (anulada) | 2021-11-20 | 5 | `peligro aislado`, `aguas navegables` | …mediaciones se trata de una luz de **peligro aislado** y debemos darle resguardo deberemo… |
| and-2021-c2-t29 | 2021-11-20 | 7 | `lateral` | …dera a caer a estribor. la presion **lateral** de las palas compensara el resto d… |
| and-2022-c1-t13 | 2022-03-26 | 5 | `aguas navegables`, `marca de tope` | …tope, si la tiene, de una marca de **aguas navegables** es: una esfera roja dos esferas ro… |
| and-2022-c1-t14 | 2022-03-26 | 5 | `boya`, `marca de tope` | una **boya** que tiene como marca de tope dos e… |
| and-2022-c1-t15 | 2022-03-26 | 5 | `boya`, `aguas navegables` | entrando en puerto, avistamos una **boya** de color rojo con una banda ancha … |
| and-2022-c1-t16 | 2022-03-26 | 5 | `boya`, `cardinal`, `peligro aislado`, `aguas navegables` | una **boya** emite una luz blanca con un period… |
| and-2022-c1-t17 | 2022-03-26 | 5 | `lateral`, `peligro aislado` | … una luz roja son: solo las marcas **lateral**es de babor solo las marcas lateral… |
| and-2022-c1-t19 | 2022-03-26 | 6 | `lateral` | …circulacion por uno de sus limites **lateral**es, deberan hacerlo con el menor an… |
| and-2022-c1-t28 | 2022-03-26 | 7 | `lateral` | el efecto de la presion **lateral** de las palas en una embarcacion co… |
| and-2022-c2-t13 | 2022-06-11 | 5 | `lateral`, `peligro aislado`, `aguas navegables` | …guas navegables de peligro aislado **lateral** de babor y estribor lateral de bif… |
| and-2022-c2-t14 | 2022-06-11 | 5 | `boya`, `cardinal`, `lateral`, `peligro aislado` | avistamos una **boya** en forma de castillete, que en la … |
| and-2022-c2-t15 | 2022-06-11 | 5 | `cardinal`, `peligro aislado`, `aguas navegables`, `centellea` | …guas navegables de peligro aislado **cardinal** norte cardinal sur |
| and-2022-c2-t16 | 2022-06-11 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …guas navegables de peligro aislado **cardinal** norte cardinal sur |
| and-2022-c2-t17 | 2022-06-11 | 5 | `lateral`, `marca de tope` | …l es la marca de tope de una marca **lateral** de bifurcacion, canal principal a … |
| and-2022-c2-t29 | 2022-06-11 | 7 | `lateral` | …iente de expulsion y de la presion **lateral** de las palas sobre la embarcacion … |
| and-2022-c3-t11 | 2022-11-05 | 4 | `baliza` | …, en un tramo de costa que no este **baliza**do: se prohibe navegar sin limitaci… |
| and-2022-c3-t13 | 2022-11-05 | 5 | `cardinal`, `marca de tope` | …or y la marca de tope de una marca **cardinal** oeste son: color negro con una anc… |
| and-2022-c3-t14 | 2022-11-05 | 5 | `lateral`, `marca de tope` | …o como marca de tope es: una marca **lateral** de babor, exclusivamente una marca… |
| and-2022-c3-t15 | 2022-11-05 | 5 | `lateral`, `peligro aislado`, `aguas navegables`, `marca especial` | …ncas, es una: marca especial marca **lateral** de bifurcacion marca de aguas nave… |
| and-2022-c3-t16 | 2022-11-05 | 5 | `baliza`, `balizamiento`, `cardinal`, `peligro aislado`, `aguas navegables`, `\biala\b` | …e peligro aislado en el sistema de **baliza**miento maritimo iala, no existe nin… |
| and-2022-c3-t17 | 2022-11-05 | 5 | `cardinal` | una marca **cardinal** sur indica: que las aguas mas prof… |
| and-2023-c1-t12 | 2023-03-25 | 4 | `baliza` | … salen dentro de las zonas de bano **baliza**das se permite entrar o salir de la… |
| and-2023-c1-t13 | 2023-03-25 | 5 | `lateral` | cuando las marcas **lateral**es que senalan las margenes de un c… |
| and-2023-c1-t14 | 2023-03-25 | 5 | `cardinal`, `peligro aislado`, `aguas navegables`, `marca de tope` | …perpuestas. se trata de una marca: **cardinal** de aguas navegables de aproximacio… |
| and-2023-c1-t15 | 2023-03-25 | 5 | `marca de tope` | …tra publicacion nautica, si tienen **marca de tope** sera: un aspa amarilla en forma de… |
| and-2023-c1-t16 | 2023-03-25 | 5 | `baliza`, `balizamiento`, `cardinal`, `peligro aislado`, `aguas navegables`, `\biala\b` | …e peligro aislado en el sistema de **baliza**miento maritimo iala, no existe nin… |
| and-2023-c1-t17 | 2023-03-25 | 5 | `marca de tope` | …ncha banda horizontal amarilla. su **marca de tope** sera: dos conos negros superpuesto… |
| and-2023-c1-t28 | 2023-03-25 | 7 | `lateral` | …ina atras, el efecto de la presion **lateral** de las palas sobre la embarcacion … |
| and-2023-c2-t12 | 2023-06-17 | 4 | `baliza` | …o de las zonas de bano debidamente **baliza**das: esta prohibida la navegacion d… |
| and-2023-c2-t13 | 2023-06-17 | 5 | `baliza` | en un canal **baliza**do, las marcas de color verde debem… |
| and-2023-c2-t14 | 2023-06-17 | 5 | `aguas navegables`, `marca de tope` | …s, que esta enteramente rodeado de **aguas navegables** senala un peligro que no figura en… |
| and-2023-c2-t17 | 2023-06-17 | 5 | `cardinal`, `centellea` | el ritmo de la luz de una marca **cardinal** norte es: centelleante continua ce… |
| and-2023-c2-t31 | 2023-06-17 | 8 | `baliza` | …sajes de socorro y activar la radio**baliza** manualmente (si se tiene) trincar … |
| and-2023-c3-t05 | 2023-10-21 | 2 | `boya` | …ran los buques?: muerto bita noray **boya** |
| and-2023-c3-t12 | 2023-10-21 | 4 | `baliza` | dentro de una zona de bano **baliza**da, una moto nautica de uso particu… |
| and-2023-c3-t13 | 2023-10-21 | 5 | `cardinal`, `lateral`, `peligro aislado`, `aguas navegables` | … destellos. se trata de: una marca **cardinal** norte una marca de aguas navegable… |
| and-2023-c3-t14 | 2023-10-21 | 5 | `marca de tope` | una marca tiene como **marca de tope** dos esferas negras superpuestas. s… |
| and-2023-c3-t15 | 2023-10-21 | 5 | `baliza`, `lateral`, `marca de tope` | entrando en puerto por un canal **baliza**do, avistamos por proa una marca de… |
| and-2023-c3-t16 | 2023-10-21 | 5 | `cardinal`, `lateral`, `peligro aislado`, `marca de tope` | …eguridad que se trata de una marca **cardinal** norte con seguridad que se trata d… |
| and-2023-c3-t17 | 2023-10-21 | 5 | `cardinal`, `centellea` | …s de luces corresponde a una marca **cardinal** este? centelleante de grupos de 3 … |
| and-2024-c1-t12 | 2024-04-06 | 4 | `baliza` | …utico-deportivas en las playas sin **baliza**r se pueden realizar actividades na… |
| and-2024-c1-t13 | 2024-04-06 | 5 | `baliza`, `lateral` | en un canal **baliza**do, las marcas laterales de color r… |
| and-2024-c1-t14 | 2024-04-06 | 5 | `aguas navegables` | ¿cual es el color de una marca de **aguas navegables**?: franjas amarillas y negras verti… |
| and-2024-c1-t15 | 2024-04-06 | 5 | `aguas navegables`, `marca de tope` | la marca de tope de una marca de **aguas navegables**, si la tiene, es: una esfera roja … |
| and-2024-c1-t16 | 2024-04-06 | 5 | `marca de tope` | una marca cuya **marca de tope** consiste en dos conos negros super… |
| and-2024-c1-t17 | 2024-04-06 | 5 | `cardinal`, `centellea` | …eos cada 10 segundos. ¿a que marca **cardinal** corresponde? este norte sur oeste |
| and-2024-c1-t32 | 2024-04-06 | 8 | `baliza` | …jes de socorro activaremos la radio**baliza** y nos la llevaremos con nosotros t… |
| and-2024-c2-t13 | 2024-07-13 | 5 | `peligro aislado`, `marca de tope` | …racteristica define a una marca de **peligro aislado**?: es una marca roja y verde es una… |
| and-2024-c2-t14 | 2024-07-13 | 5 | `aguas seguras`, `marcas? especiales`, `\biala\b` | …bles o tuberias submarinas senalan **aguas seguras** para la navegacion indican el lado… |
| and-2024-c2-t15 | 2024-07-13 | 5 | `boya`, `lateral` | una **boya** que emite de noche un grupo de 2 +… |
| and-2024-c2-t16 | 2024-07-13 | 5 | `baliza`, `balizamiento`, `lateral`, `peligro aislado`, `\biala\b` | en el sistema de **baliza**miento iala, ¿que indican las marca… |
| and-2024-c2-t17 | 2024-07-13 | 5 | `cardinal`, `marca de tope` | …rca de tope identifica a una marca **cardinal** norte?: dos conos negros superpues… |
| and-2024-c3-t12 | 2024-11-16 | 4 | `baliza` | …o de las zonas de bano debidamente **baliza**das, solo esta permitida la navegac… |
| and-2024-c3-t13 | 2024-11-16 | 5 | `lateral` | …emos dejar por estribor las marcas **lateral**es de color: verde amarillo rojo no… |
| and-2024-c3-t14 | 2024-11-16 | 5 | `lateral`, `peligro aislado` | …s es una marca: de peligro aislado **lateral** modificada. indica una bifurcacion… |
| and-2024-c3-t15 | 2024-11-16 | 5 | `marca de tope` | una **marca de tope** consistente en dos conos negros su… |
| and-2024-c3-t16 | 2024-11-16 | 5 | `cardinal`, `centellea` | …rgo cada 10 segundos. ¿a que marca **cardinal** corresponde? este norte sur oeste |
| and-2024-c3-t17 | 2024-11-16 | 5 | `peligro aislado`, `marca de tope` | la marca de tope de una senal de **peligro aislado** es: una esfera roja dos esferas ne… |
| and-2024-c3-t19 | 2024-11-16 | 6 | `lateral` | … que se incorporen por los limites **lateral**es los buques de eslora inferior a … |
| and-2025-c1-t11 | 2025-03-22 | 4 | `baliza` | …, en un tramo de costa que no este **baliza**do, se permite navegar a una veloci… |
| and-2025-c1-t13 | 2025-03-22 | 5 | `lateral` | … aguas son navegables es una marca **lateral** de estribor y debemos dejarla por … |
| and-2025-c1-t14 | 2025-03-22 | 5 | `cardinal`, `aguas navegables` | …10 segundos es una marca: especial **cardinal** norte cardinal sur de aguas navega… |
| and-2025-c1-t15 | 2025-03-22 | 5 | `cardinal` | el color de una marca **cardinal** este es: mitad superior negra e in… |
| and-2025-c1-t16 | 2025-03-22 | 5 | `boya`, `lateral`, `peligro aislado`, `aguas navegables` | una **boya** negra con una o varias anchas band… |
| and-2025-c1-t17 | 2025-03-22 | 5 | `lateral`, `marca de tope` | …de tope, si la tiene, de una marca **lateral** de bifurcacion canal principal a e… |
| and-2025-c2-t13 | 2025-07-05 | 5 | `lateral` | las marcas **lateral**es de babor son de color: verde roj… |
| and-2025-c2-t14 | 2025-07-05 | 5 | `cardinal`, `aguas seguras` | las marcas **cardinal**es tienen por objeto indicar al nav… |
| and-2025-c2-t15 | 2025-07-05 | 5 | `peligro aislado`, `centellea`, `isofase` | de noche, las marcas de **peligro aislado** emiten luz blanca con un ritmo de:… |
| and-2025-c2-t16 | 2025-07-05 | 5 | `centellea`, `isofase` | …furcacion emiten luz con ritmo de: **centellea**nte rapido continuo grupos de (2+1)… |
| and-2025-c2-t17 | 2025-07-05 | 5 | `marcas? especiales` | las **marcas especiales** son de color: rojo verde amarillo … |
| and-2025-c2-t32 | 2025-07-05 | 8 | `baliza` | …nsaje de socorro y activar la radio**baliza** manualmente (si se tiene disponibl… |
| and-2025-c3-t13 | 2025-11-15 | 5 | `lateral` | …uerto ¿que color tienen las marcas **lateral**es de babor y estribor, respectivam… |
| and-2025-c3-t14 | 2025-11-15 | 5 | `cardinal` | …cteristicas de luz tiene una marca **cardinal** este?: luz blanca con grupos de 9 … |
| and-2025-c3-t15 | 2025-11-15 | 5 | `lateral` | …acion de canal, si vemos una marca **lateral** modificada con luz verde en grupos… |
| and-2025-c3-t16 | 2025-11-15 | 5 | `peligro aislado`, `isofase` | …ue ritmo de luz tiene una marca de **peligro aislado**?: luz blanca isofase luz blanca co… |
| and-2025-c3-t17 | 2025-11-15 | 5 | `lateral`, `marca de tope` | …de tope, si la tiene, de una marca **lateral** de bifurcacion canal principal a b… |
| and-2025-c3-t38 | 2025-11-15 | 10 | `baliza`, `balizamiento` | …contiene informacion detallada del **baliza**miento luminoso, balizamiento ciego… |
| and-py-2020-c1-g09 | 2020-07-25 | 1 | `baliza` | en caso de que nuestra radio**baliza** de localizacion de siniestros (epi… |
| and-py-2020-c3-g05 | 2020-12-19 | 1 | `baliza` | …os aparatos de emergencia (balsas, **baliza**s, etc.) al buque de una forma segu… |
| and-py-2021-c1-g05 | 2021-05-22 | 1 | `baliza` | las radio**baliza**s epirb… se pueden activar manualme… |
| and-py-2022-c2-g06 | 2022-06-11 | 1 | `baliza` | …le la afirmacion correcta: la radio**baliza** es el aparato utilizado en caso de… |
| and-py-2022-c2-g08 | 2022-06-11 | 1 | `baliza` | …isto de medios para montar la radio**baliza** a una altura de 1,5 metros como mi… |
| and-py-2022-c2-g10 | 2022-06-11 | 1 | `baliza` | …ua llevaremos con nosotros la radio**baliza** |
| and-py-2022-c3-g04 | 2022-11-05 | 1 | `baliza` | …or radar: al contrario que la radio**baliza**, emiten una senal radar de 12 ghz … |
| and-py-2022-c3-g08 | 2022-11-05 | 1 | `baliza` | …os aparatos de emergencia (balsas, **baliza**s, etc.) al buque de una forma segu… |
| and-py-2022-c3-g09 | 2022-11-05 | 1 | `baliza` | …uientes afirmaciones sobre la radio**baliza** epirb es incorrecta? una vez activ… |
| and-py-2023-c1-g07 | 2023-03-25 | 1 | `baliza` | las radio**baliza**s a bordo de una embarcacion, ¿debe… |
| and-py-2023-c1-n09 | 2023-03-25 | 3 | `boya` | …ntifica solo buques, no identifica **boya**s ni marcas de ayuda a la navegacio… |
| and-py-2023-c2-n08 | 2023-06-17 | 3 | `lateral` | …mbarcacion sufre un desplazamiento **lateral**, de forma que su direccion de avan… |
| and-py-2023-c3-g04 | 2023-10-21 | 1 | `baliza` | …afirmacion correcta sobre las radio**baliza**s epirb: se podran activar manual y… |
| and-py-2024-c1-g09 | 2024-04-06 | 1 | `baliza` | …specto a la utilizacion de la radio**baliza** de localizacion de siniestros: se … |
| and-py-2025-c1-g04 | 2025-03-22 | 1 | `naufragio` | …que permanecera cerca del punto de **naufragio** debemos llevarlo con nosotros, act… |
| and-py-2025-c1-g10 | 2025-03-22 | 1 | `baliza` | …io en un chaleco salvavidas?: radio**baliza** personal bandas o tiras reflectant… |
| and-py-2025-c2-g01 | 2025-07-05 | 1 | `baliza` | …iniestro maritimo?: gps radar radio**baliza** vhf |
| and-py-2025-c2-g07 | 2025-07-05 | 1 | `baliza` | … por la intemperie junto a la radio**baliza**, pues se complementan |
| and-py-2025-c2-g09 | 2025-07-05 | 1 | `baliza` | …amada de socorro y activar la radio**baliza** ir solo con traje de bano para evi… |

## RD 875/2014

Real Decreto 875/2014, de 10 de octubre, por el que se regulan las titulaciones náuticas para el gobierno de las embarcaciones de recreo. En vigor desde el 2015-01-11 ([BOE-A-2014-10344](https://www.boe.es/eli/es/rd/2014/10/10/875/con)). Nuevo marco de títulos (sustituye a la Orden FOM/3200/2007): PNB, PER, PY, CY y licencia de navegación; nueva estructura del examen.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RIPA enmiendas 2013

Enmiendas de 2013 al Reglamento internacional para prevenir los abordajes (Resolución A.1085(28)): parte F. En vigor desde el 2016-01-01 ([BOE-A-2017-377](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2017-377)). Se añade la parte F (verificación del cumplimiento, Código III). Ninguna regla de maniobra, luz ni sonido cambia.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RD 238/2019

Real Decreto 238/2019, de 5 de abril, que modifica el RD 875/2014 y el RD 259/2002 (motos náuticas). En vigor desde el 2019-07-01 ([BOE-A-2019-6481](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2019-6481)). Intercambia los errores máximos del examen de PY (teoría 5, carta 3); añade «incluidas las islas intermedias» a la atribución Península–Baleares; quita las motos «clase C» de la licencia de navegación; crea las habilitaciones anejas y los títulos de moto A/B/C.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RD 550/2020

Real Decreto 550/2020, de 2 de junio, por el que se determinan las condiciones de seguridad de las actividades de buceo. En vigor desde el 2020-07-01 ([BOE-A-2020-6745](https://www.boe.es/buscar/act.php?id=BOE-A-2020-6745)). Boya de señalización con bandera «Alfa»; distancia mínima de 50 m a la zona de buceo; deroga la Orden de 14-10-1997 de normas de seguridad subacuáticas.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RD 186/2023

Real Decreto 186/2023, de 21 de marzo, Reglamento de Ordenación de la Navegación Marítima (deroga la Orden de 2-7-1964 de zonas para bañistas). En vigor desde el 2023-04-11 ([BOE-A-2023-7410](https://www.boe.es/buscar/act.php?id=BOE-A-2023-7410)). Deroga la Orden de 1964 de zonas para bañistas (la regla de 200 m de playa y 50 m de costa a 3 nudos sigue en el art. 73 del Reglamento General de Costas) y regula el despacho de las embarcaciones de recreo.

10 preguntas (9 de PER, 1 de PY). Motivo común: la pregunta es anterior al 2023-04-11; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2020-c1-t16 | 2020-07-25 | 5 | `canal(es)? balizad` | entrando en puerto por un **canal balizad**o vemos una marca que emite una luz… |
| and-2020-c3-t11 | 2020-12-19 | 4 | `playa`, `3 nudos` | al aproximarse a una **playa** no balizada, la velocidad maxima a… |
| and-2020-c3-t12 | 2020-12-19 | 4 | `tres nudos` | …be hacer: con velocidad superior a **tres nudos** siempre en alta mar, a mas de 12 m… |
| and-2020-c3-t16 | 2020-12-19 | 5 | `canal(es)? balizad` | saliendo de puerto por un **canal balizad**o: tendremos por estribor las marca… |
| and-2021-c2-t12 | 2021-11-20 | 4 | `playa`, `200 (m\|metros)`, `50 (m\|metros)` | ante una **playa** balizada, a que distancia de la or… |
| and-2022-c3-t11 | 2022-11-05 | 4 | `zona(s)? de bano`, `playa`, `tres nudos` | dentro de la **zona de bano**, en un tramo de costa que no este … |
| and-2023-c1-t12 | 2023-03-25 | 4 | `banist`, `zona(s)? de bano`, `playa`, `tres nudos` | …xtremando las precauciones con los **banist**as cuando una embarcacion tiene iza… |
| and-2023-c1-t20 | 2023-03-25 | 6 | `tres nudos` | …cluso de dia no pueden superar los **tres nudos** de velocidad se mantendran lo mas … |
| and-2022-c1-q44 | 2022-03-26 | 11 | `3 nudos` | …al puerto de ceuta con velocidad 8,**3 nudos**, en ausencia de viento y corriente… |
| and-py-2021-c1-n15 | 2021-05-22 | 4 | `3 nudos` | …nta una corriente de rc =e e ihc = **3 nudos** asi como un viento del w que produ… |

## RD 1188/2025 (buceo y ROM)

Real Decreto 1188/2025, de 26 de diciembre: cambios en el RD 550/2020 de buceo, en el Reglamento de Ordenación de la Navegación Marítima y en el fondeo del Mar Menor. En vigor desde el 2025-12-31 ([BOE-A-2025-27010](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010)). Buceo (ratio 1:1 en bautismos, descompresión, profundidad en puertos), fondeo en el Mar Menor y artículos 43 y 45 del ROM.

4 preguntas (4 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2025-12-31; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2023-c3-t11 | 2023-10-21 | 4 | `buce` | …a franja diagonal blanca?: que hay **buce**adores sumergidos que se transporta… |
| and-2023-c3-t18 | 2023-10-21 | 6 | `buce` | …peligro y necesita ayuda que tiene **buce**adores en el agua y debemos darle s… |
| and-2024-c1-t20 | 2024-04-06 | 6 | `buce` | …nja. ¿que quiere indicar?: que hay **buce**adores en las inmediaciones que est… |
| and-2024-c1-t22 | 2024-04-06 | 6 | `buce` | …ia un peligro, como por ejemplo un **buce**ador sumergido no entiende las acci… |

