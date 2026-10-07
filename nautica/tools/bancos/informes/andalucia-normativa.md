# Andalucía · normativa del banco vivo (solo informe)

Generado por `node tools/bancos/ejes/andalucia/normativa.mjs` el 2026-10-07. Aplica la etapa `normativa` (`tools/bancos/etapas/normativa.mjs`, con `data/normativa.json`) al banco vivo `data/ejes/andalucia/<tit>/preguntas.json` (1499 preguntas de PER y 1329 de PY, 2020–2026) **en modo informe** (este guion no escribe en el banco). La fase F1 resolvió cada pregunta marcada contra el texto legal: la resolución, con su motivo y su fuente, está en `tools/bancos/ejes/andalucia/ajustes.json` y la aplica al banco `revision-normativa.mjs --escribir` (resumen en «Resolución»).

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
| **RD 339/2021** | 2021-07-01 | 82 | 96 | 178 |
| **RD 587/2022** | 2022-07-21 | 6 | 75 | 81 |
| **RD 1188/2025 (gobierno sin título)** | 2026-10-01 | 2 | 1 | 3 |
| **RD 191/2026** | 2026-04-02 | 26 | 2 | 28 |
| **IALA MBS 2022** | 2026-01-09 | 190 | 26 | 216 |
| RD 875/2014 | 2015-01-11 | 0 | 0 | 0 |
| RIPA enmiendas 2013 | 2016-01-01 | 0 | 0 | 0 |
| RD 238/2019 | 2019-07-01 | 8 | 0 | 8 |
| RD 550/2020 | 2020-07-01 | 2 | 0 | 2 |
| RD 186/2023 | 2023-04-11 | 31 | 11 | 42 |
| RD 1188/2025 (buceo y ROM) | 2025-12-31 | 5 | 0 | 5 |
| RD 128/2022 | 2022-02-17 | 2 | 0 | 2 |

Preguntas distintas marcadas: **474** (320 de PER y 154 de PY); 82 con más de una norma. En negrita, los cambios pedidos para esta revisión; el resto son las demás normas de `data/normativa.json` cuya fecha cae dentro del banco.

## Resolución (fase F1)

474 preguntas resueltas: **456 vigentes**, **14 actualizadas** (la respuesta oficial vale; la explicación dice qué cambió y cuándo) y **4 retiradas**. Cada una lleva en `ajustes.json` el motivo por norma y su fuente (BOE consolidado o IALA R1001 ed. 2.0).

- **and-2015-c1-t09** (actualizada): Actualización: desde el 1 de julio de 2021 los extintores los regula el art. 15 del Real Decreto 339/2021 (antes, la Orden FOM/1144/2003): las embarcaciones con marcado CE llevan los que indique el manual del fabricante y, si no, los de las tablas por eslora y por potencia, ahora de eficacia 34B (antes 21B); con una instalación fija en el motor sigue haciendo falta un extintor portátil junto al compartimento. Una pequeña fueraborda de hasta 25 kW sin cabina no necesita ninguno. La respuesta oficial sigue siendo la única aceptable de las cuatro.
- **and-2015-c3-t11** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2016-c1-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2016-c3-t12** (actualizada): Actualización: desde el 2 de abril de 2026 lo regula para todo el Mediterráneo español el Real Decreto 191/2026 (art. 5): se prohíbe con carácter general fondear sobre praderas de posidonia y de cymodocea, y también en la arena próxima si la cadena o el borneo las alcanzan; solo se puede en sistemas de bajo impacto autorizados (boyas) y, como excepción, por fuerza mayor o peligro para la vida humana o la navegación. La respuesta oficial sigue valiendo.
- **and-2017-c1-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2017-c2-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2017-c3-t11** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2017-c3-t12** (retirada): Retirada: desde que el Real Decreto 186/2023 derogó la Orden de 1964 de zonas para bañistas (11 de abril de 2023), rige solo el art. 73.2 del Reglamento General de Costas: en un tramo de costa sin balizar la zona de baño ocupa 200 m en las playas y 50 m en el resto, y dentro se puede navegar a 3 nudos como máximo. La afirmación d) es cierta; la falsa es la b).
- **and-2018-c1-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2018-c2-t12** (retirada): Retirada: la notificación reducida de desechos de las embarcaciones de recreo (anexo V del Real Decreto 1381/2002) desapareció el 17 de febrero de 2022, cuando el Real Decreto 128/2022 derogó aquel decreto; hoy la notificación previa solo se exige a buques de 300 GT o más, y nunca a embarcaciones de recreo de menos de 45 m (art. 16.1). Ninguna de las periodicidades es correcta.
- **and-2018-c3-t11** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2018-c4-t11** (retirada): Retirada: la notificación reducida de residuos del anexo V del Real Decreto 1381/2002 desapareció el 17 de febrero de 2022, cuando el Real Decreto 128/2022 derogó aquel decreto; hoy ninguna embarcación de recreo de menos de 45 m está obligada a notificar sus desechos antes de llegar a puerto (art. 16.1), aunque todas los entregan en la instalación receptora del puerto.
- **and-2019-c1-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2019-c2-t12** (actualizada): Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.
- **and-2022-c2-t11** (actualizada): Actualización: desde el 2 de abril de 2026 lo regula para todo el Mediterráneo español el Real Decreto 191/2026 (art. 5): se prohíbe con carácter general fondear sobre praderas de posidonia y de cymodocea, y también en la arena próxima si la cadena o el borneo las alcanzan; solo se puede en sistemas de bajo impacto autorizados (boyas) y, como excepción, por fuerza mayor o peligro para la vida humana o la navegación. La respuesta oficial sigue valiendo.
- **and-2024-c3-t11** (actualizada): Actualización: desde el 2 de abril de 2026 lo regula para todo el Mediterráneo español el Real Decreto 191/2026 (art. 5): se prohíbe con carácter general fondear sobre praderas de posidonia y de cymodocea, y también en la arena próxima si la cadena o el borneo las alcanzan; solo se puede en sistemas de bajo impacto autorizados (boyas) y, como excepción, por fuerza mayor o peligro para la vida humana o la navegación. La respuesta oficial sigue valiendo.
- **and-2026-c1-t11** (actualizada): Actualización: desde el 2 de abril de 2026 lo regula para todo el Mediterráneo español el Real Decreto 191/2026 (art. 5): se prohíbe con carácter general fondear sobre praderas de posidonia y de cymodocea, y también en la arena próxima si la cadena o el borneo las alcanzan; solo se puede en sistemas de bajo impacto autorizados (boyas) y, como excepción, por fuerza mayor o peligro para la vida humana o la navegación. La respuesta oficial sigue valiendo.
- **and-py-2019-c1-g07** (retirada): Retirada: la revisión anual de las balsas era la de la Orden FOM/1144/2003 (art. 6.2). Desde el 1 de julio de 2021, el art. 6.3 del Real Decreto 339/2021 (redacción del Real Decreto 587/2022, en vigor el 21-7-2022) manda revisarlas según las instrucciones del fabricante en una estación de servicio autorizada, y solo en las de uso comercial fija un máximo de 24 meses: ya no hay una revisión anual obligatoria.

## RD 339/2021

Real Decreto 339/2021, de 18 de mayo, por el que se regula el equipo de seguridad, salvamento, contra incendios, navegación y prevención de vertidos por aguas sucias de las embarcaciones de recreo (deroga la Orden FOM/1144/2003). En vigor desde el 2021-07-01 ([BOE-A-2021-8268](https://www.boe.es/buscar/act.php?id=BOE-A-2021-8268)). Equipo por zona de navegación: cambian bengalas, cohetes y fumígenas (zona 4: de 6+6+1 a 3+3+0; zona 2: 1 fumígena); chaleco por persona con luz y +1 en zona 1 (antes 110 %); extintores 34B (antes 21B); desaparecen como obligatorios la corredera, el compás de puntas, el transportador y la regla; campana solo si L ≥ 20 m; aguas sucias referidas a la línea de base.

178 preguntas (82 de PER, 96 de PY). Motivo común: la pregunta es anterior al 2021-07-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1) — escrita con 34 marcas y ahora hay 178: revisarla: Las marcas son todas de 2020-c1, 2020-c3 y 2021-c1 (antes del 1-7-2021). Las más cercanas al cambio: and-2021-c1-t09 (flotabilidad en zona 4: 150 N, sin cambio en el RD), and-py-2021-c1-g04 (chalecos de niños: uno por niño, sin cambio), and-2020-c1-t11 (aguas sucias de tanque a régimen moderado y ≥ 4 nudos: el RD 339/2021 lo mantiene), and-2020-c3-t10 (aros con luz), and-2021-c1-t07 y and-py-2020-c3-g04 (fumígena de 3 minutos) y and-py-2020-c1-g04 (bengala de mano de 60 s). Ninguna de las marcadas pide el número de bengalas, cohetes o fumígenas por zona, los chalecos de zona 1, el tipo de extintor ni el material náutico, que es lo que cambió. El resto son marcas anchas (corredera como instrumento, «regla de» visibilidad reducida, achique en vías de agua, supervivencia en la balsa).

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
| and-2021-c1-t07 | 2015-01-01 | 3 | `fumigen` | la senal **fumigen**a flotante emitira humo al menos du… |
| and-2021-c1-t08 | 2015-01-01 | 3 | `aro salvavidas` | …cayo el hombre/mujer y lanzarle un **aro salvavidas**. meter el timon a la banda opuesta… |
| and-2021-c1-t09 | 2021-05-22 | 3 | `chaleco`, `zona [1-7]\b`, `flotabilidad` | con respecto a los **chaleco**s salvavidas que debemos de llevar … |
| and-2015-c1-t09 | sin fecha | 3 | `extintor`, `balde` | …reo: deben llevar obligatoriamente **extintor**es portatiles, cuyo numero depender… |
| and-2015-c1-t30 | sin fecha | 8 | `botiquin` | … calmar el dolor un analgesico del **botiquin**, dependiendo de la gravedad se ped… |
| and-2015-c2-t08 | sin fecha | 3 | `cohete` | …altura minima que debe ascender el **cohete** con luz roja y paracaidas es: 100 … |
| and-2015-c2-t12 | sin fecha | 4 | `vertido` | …ancia en el mediterraneo. prohibir **vertido**s que menoscaben la integridad de l… |
| and-2015-c2-t38 | sin fecha | 10 | `corredera` | coeficiente de la **corredera**: es la relacion entre la velocidad… |
| and-2015-c3-t10 (anulada) | sin fecha | 3 | `chaleco` | los **chaleco**s salvavidas deben colocarse en 3 m… |
| and-2015-c3-t11 | sin fecha | 4 | `aguas sucias`, `desmenuz` | …ndo se autoriza la descarga de las **aguas sucias** a mas de tres millas de la costa s… |
| and-2015-c3-t25 | sin fecha | 6 | `linterna` | … unicamente una luz de alcance una **linterna** para su uso inmediato. las respues… |
| and-2016-c1-t08 | 2016-04-09 | 3 | `chaleco` | …mover tener colocado un arnes y un **chaleco** salvavidas revisar y tener cerrada… |
| and-2016-c1-t12 | 2016-04-09 | 4 | `aguas sucias`, `descarga(r)? (al\|en el) mar` | la descarga al mar de **aguas sucias** desde una embarcacion que no dispo… |
| and-2016-c1-t30 | 2016-04-09 | 8 | `extintor` | … aceite en combustion, ¿que agente **extintor** no es recomendable utilizar? polvo… |
| and-2016-c2-t09 | 2016-06-18 | 3 | `chaleco` | … pecho debe haber, como minimo, un **chaleco** salvavidas por cada tripulante, in… |
| and-2016-c2-t12 | 2016-06-18 | 4 | `basura`, `plastico`, `desmenuz` | …ados en una bolsa de plastico para **basura**s, fuera de una zona especial se ha… |
| and-2016-c2-t31 | 2016-06-18 | 8 | `bengala`, `cohete`, `pirotecni`, `balsa` | …todo si es de noche, y despues una **bengala** de mano lanzar primero una bengala… |
| and-2016-c3-t09 | 2016-11-19 | 3 | `aro salvavidas` | … mob es suficiente con lanzarle un **aro salvavidas** lanzarle un aro salvavidas, con lu… |
| and-2016-c3-t10 | 2016-11-19 | 3 | `achique` | … la estanqueidad y los sistemas de **achique** el estado de las baterias todas la… |
| and-2016-c3-t11 | 2016-11-19 | 4 | `basura`, `plastico`, `desmenuz` | la descarga de **basura**s al mar fuera de zonas especiales … |
| and-2016-c3-t24 | 2016-11-19 | 6 | `regla de` | …ope. en este caso: en virtud de la **regla de** visibilidad reducida, debemos evit… |
| and-2016-c3-t30 | 2016-11-19 | 8 | `extintor` | los agentes **extintor**es como el agua y la espuma no son … |
| and-2016-c3-t32 | 2016-11-19 | 8 | `achique` | …mar seran: achicar con la bomba de **achique** y, si no se consigue el taponamien… |
| and-2016-c3-t38 | 2016-11-19 | 10 | `corredera` | si conocemos el coeficiente de **corredera** podemos calcular: la velocidad ver… |
| and-2017-c1-t07 | 2017-04-01 | 3 | `flotabilidad` | …denomina: estabilidad longitudinal **flotabilidad** estatica longitudinal estabilidad … |
| and-2017-c1-t10 | 2017-04-01 | 3 | `bengala` | las **bengala**s de mano se usaran: cuando tengamo… |
| and-2017-c1-t12 | 2017-04-01 | 4 | `aguas sucias`, `basura`, `plastico`, `desmenuz` | …5 metros del resto del litoral las **aguas sucias** de un barco desmenuzadas y desinfe… |
| and-2017-c1-t31 | 2017-04-01 | 8 | `extintor` | … fuego: explica que tipo de agente **extintor** tenemos que emplear en cada lado d… |
| and-2017-c1-t38 | 2017-04-01 | 10 | `corredera` | …lcular por el anuario de mareas la **corredera** la aguja nautica |
| and-2017-c2-t07 | 2017-06-17 | 3 | `extintor` | al utilizar un **extintor** de polvo seco se debe: agitarlo an… |
| and-2017-c2-t08 | 2017-06-17 | 3 | `pirotecni`, `balsa` | ¿cuando debemos usar las senales **pirotecni**cas?: antes de abandonar la embarca… |
| and-2017-c2-t12 | 2017-06-17 | 4 | `aguas sucias` | la descarga de **aguas sucias** al mar desde una embarcacion de re… |
| and-2017-c2-t32 | 2017-06-17 | 8 | `chaleco`, `achique` | …mbarcacion, debiendo colocarnos el **chaleco** y prendas de abrigo achicar con la… |
| and-2017-c2-t40 | 2017-06-17 | 10 | `corredera` | si se multiplica la distancia de **corredera** por el coeficiente de corredera ob… |
| and-2017-c3-t08 | 2017-11-11 | 3 | `cohete` | …tura minima que debera alcanzar un **cohete** con paracaidas sera de: 100 metros… |
| and-2017-c3-t11 | 2017-11-11 | 4 | `aguas sucias`, `desmenuz` | las **aguas sucias** de un barco desmenuzadas y desinfe… |
| and-2017-c3-t30 | 2017-11-11 | 8 | `achique` | …a de inmediato todas las bombas de **achique** intentar taponar la via de agua de… |
| and-2017-c3-t32 | 2017-11-11 | 8 | `plastico` | … aceites, pintura, algunas ceras y **plastico**s, se clasifican como: clase a clas… |
| and-2017-c3-t41 | 2017-11-11 | 10 | `corredera` | … igual a la distancia que marca la **corredera** el coeficiente de corredera sera: … |
| and-2018-c1-t08 | 2018-03-10 | 3 | `aros salvavidas` | …mendaciones de uso y estiba de los **aros salvavidas** a bordo: deben colocarse tanto a p… |
| and-2018-c1-t10 | 2018-03-10 | 3 | `chaleco` | …aremos por la popa e iremos con el **chaleco**, calzado antideslizante y guantes … |
| and-2018-c1-t12 | 2018-03-10 | 4 | `aguas sucias` | la descarga de **aguas sucias** al mar desde una embarcacion que n… |
| and-2018-c1-t32 | 2018-03-10 | 8 | `pirotecni`, `balsa` | … lleve consigo la radiobaliza y la **pirotecni**a. mantenga agrupada a toda la trip… |
| and-2018-c2-t04 | 2018-05-26 | 1 | `bocina` | …a helice se llama: capacete nucleo **bocina** eje |
| and-2018-c2-t08 | 2018-05-26 | 3 | `chaleco` | … un cabo de canamo, provisto de un **chaleco** que sujetaremos en la espalda el a… |
| and-2018-c2-t30 | 2018-05-26 | 8 | `extintor` | al utilizar un **extintor** de polvo seco se debe: agitarlo an… |
| and-2018-c2-t32 | 2018-05-26 | 8 | `chaleco`, `achique` | …mbarcacion, debiendo colocarnos el **chaleco** y prendas de abrigo las respuestas… |
| and-2018-c3-t02 | 2018-09-29 | 1 | `linea de fondeo` | …estamos fondeados y la cadena o la **linea de fondeo** esta perpendicular a la linea de f… |
| and-2018-c3-t08 | 2018-09-29 | 3 | `bengala`, `cohete` | …les visuales de socorro tales como **bengala**s o cohetes ¿que recomendaciones de… |
| and-2018-c3-t09 | 2018-09-29 | 3 | `aro salvavidas` | …ques comprobar la existencia de un **aro salvavidas** por cada tripulante todas las resp… |
| and-2018-c3-t11 | 2018-09-29 | 4 | `aguas sucias` | …ndo se autoriza la descarga de las **aguas sucias** procedentes de los aseos?: en las … |
| and-2018-c3-t32 | 2018-09-29 | 8 | `extintor` | …arrollo explica que tipo de agente **extintor** tenemos que emplear en cada lado d… |
| and-2018-c4-t19 | 2018-12-01 | 6 | `campana` | …les acusticas eficaces pito pito y **campana** pito, campana y gong |
| and-2018-c4-t31 | 2018-12-01 | 8 | `chaleco` | …anecer inmovil si no disponemos de **chaleco** salvavidas en aguas templadas, ado… |
| and-2018-c4-t41 | 2018-12-01 | 10 | `plastico` | …muy cerca de la misma una bolsa de **plastico**, vacia, cerca de ella una caja de … |
| and-2019-c1-t01 | 2019-04-06 | 1 | `achique` | …ue entre a bordo?: con la bomba de **achique** con los grifos de fondo con las lu… |
| and-2019-c1-t09 | 2019-04-06 | 3 | `bengala`, `cohete` | …es visuales de socorro, tales como **bengala**s o cohetes: las lanzaremos o encen… |
| and-2019-c1-t12 | 2019-04-06 | 4 | `aguas sucias`, `vertido` | …las aguas portuarias el vertido de **aguas sucias**: se permite previo tratamiento no … |
| and-2019-c1-t22 | 2019-04-06 | 6 | `zona de navegacion` | …ados a la pesca podran utilizar la **zona de navegacion** costera adyacente todas las respue… |
| and-2019-c1-t41 | 2019-04-06 | 10 | `corredera` | si el coeficiente de **corredera** es 0,9: la velocidad real es menor… |
| and-2019-c2-t07 | 2019-06-15 | 3 | `flotabilidad` | …abilidad transversal navegabilidad **flotabilidad** adrizamiento |
| and-2019-c2-t08 | 2019-06-15 | 3 | `chaleco`, `aro salvavidas` | …agua en su auxilio, aunque sea sin **chaleco** y sin cabo de sujecion ninguna de … |
| and-2019-c2-t10 | 2019-06-15 | 3 | `cohete` | el disparo de un **cohete** con luz roja y paracaidas debe rea… |
| and-2019-c2-t12 | 2019-06-15 | 4 | `aguas sucias` | …dad del buque para poder descargar **aguas sucias** sin tratamiento a mas de 12 millas… |
| and-2019-c2-t32 | 2019-06-15 | 8 | `extintor` | al utilizar un **extintor** de polvo seco se debe: agitarlo an… |
| and-2019-c3-t03 | 2019-11-23 | 1 | `bocina` | la **bocina** es: el nucleo de la helice la piez… |
| and-2019-c3-t18 | 2019-11-23 | 6 | `zona de navegacion` | …to las vias de circulacion como la **zona de navegacion** costera adyacente no podran utiliz… |
| and-2019-c3-t20 | 2019-11-23 | 6 | `linterna` | …a mano, para su uso inmediato, una **linterna** o un farol con luz blanca |
| and-2019-c3-t31 | 2019-11-23 | 8 | `chaleco` | …n aguas frias, si no disponemos de **chaleco** salvavidas, nadaremos en circulo p… |
| and-2019-c3-t38 | 2019-11-23 | 10 | `corredera` | …dad real del barco por medio de la **corredera** debemos: dividir lo que marca la c… |
| and-py-2020-c1-g04 | 2020-07-25 | 1 | `bengala` | la **bengala** de mano tendra un periodo de combu… |
| and-py-2020-c1-g05 | 2020-07-25 | 1 | `balsa` | …zafada (zafa hidrostatica) para la **balsa** salvavidas, esta zafa: soltara aut… |
| and-py-2020-c1-g06 | 2020-07-25 | 1 | `balsa` | …spuesta incorrecta: a bordo de una **balsa** salvavidas, para evitar la deshidr… |
| and-py-2020-c1-g07 | 2020-07-25 | 1 | `chaleco` | … personas a bordo deben ponerse el **chaleco** salvavidas y estar atentos a las i… |
| and-py-2020-c1-g10 | 2020-07-25 | 1 | `balsa` | …acion, si durante el inflado de la **balsa** salvavidas esta quedara con la qui… |
| and-py-2020-c3-g04 | 2020-12-19 | 1 | `fumigen` | las senales **fumigen**as: emiten humo naranja durante al … |
| and-py-2020-c3-g05 | 2020-12-19 | 1 | `balsa` | …ujetar los aparatos de emergencia (**balsa**s, balizas, etc.) al buque de una f… |
| and-py-2020-c3-g06 | 2020-12-19 | 1 | `chaleco`, `flotabilidad` | los **chaleco**s salvavidas: estan disenados para … |
| and-py-2020-c3-g07 | 2020-12-19 | 1 | `chaleco`, `balsa` | …os y sin saltar sobre la balsa sin **chaleco** salvavidas desde el agua, ayudados… |
| and-py-2020-c3-g08 | 2017-11-11 | 1 | `reflector de radar` | …se denomina: heliografo heliometro **reflector de radar** resar |
| and-py-2020-c3-g09 | 2020-12-19 | 1 | `pirotecni` | …arrancar el motor lanzar una senal **pirotecni**ca para senalar nuestra posicion la… |
| and-py-2020-c3-g10 | 2020-12-19 | 1 | `balsa` | …ndo nos encontramos a bordo de una **balsa** salvavidas es recomendable: beber … |
| and-py-2021-c1-g02 | 2021-05-22 | 1 | `balsa` | la zafa hidrostatica de la **balsa** salvavidas se activa automaticamen… |
| and-py-2021-c1-g04 | 2021-05-22 | 1 | `chaleco` | cuantos **chaleco**s salvavidas para ninos debemos lle… |
| and-py-2021-c1-g05 | 2021-05-22 | 1 | `balsa` | …n parte del equipo que contiene la **balsa** salvavidas. |
| and-py-2021-c1-g07 | 2021-05-22 | 1 | `pirotecni` | …on mas imprescindible. el material **pirotecni**co. el ordenador portatil. las male… |
| and-py-2021-c1-g08 | 2021-05-22 | 1 | `chaleco`, `balsa` | … ancla de capa. haremos flotar los **chaleco**s salvavidas amarrados entre si y a… |
| and-py-2021-c1-g09 | 2021-05-22 | 1 | `bengala` | …os tomar a la hora de utilizar las **bengala**s? mostrarlas por la banda de babor… |
| and-py-2021-c1-g10 | 2021-05-22 | 1 | `balsa` | …las de supervivencia a bordo de la **balsa** salvavidas es: no consumir ni agua… |
| and-py-2022-c3-g08 | 2017-06-17 | 1 | `balsa` | …ujetar los aparatos de emergencia (**balsa**s, balizas, etc.) al buque de una f… |
| and-py-2015-c1-g03 | sin fecha | 1 | `bengala`, `aros salvavidas` | … el diametro exterior del aro. dos **bengala**s de mano. una guirnalda salvavidas… |
| and-py-2015-c1-g04 | sin fecha | 1 | `chaleco` | los **chaleco**s salvavidas deben de dar la vuelta… |
| and-py-2015-c1-g06 | sin fecha | 1 | `bengala`, `cohete` | los cohetes lanza **bengala**s con paracaidas deben: alcanzar un… |
| and-py-2015-c2-g03 | sin fecha | 1 | `chaleco` | los **chaleco**s salvavidas deben de dar la vuelta… |
| and-py-2015-c2-g06 | sin fecha | 1 | `aros salvavidas` | los **aros salvavidas** estaran estibados de modo que sea … |
| and-py-2015-c2-g07 | sin fecha | 1 | `bengala`, `cohete` | …altura minima de 30 m, lanzando la **bengala** con paracaidas cuando alcance el p… |
| and-py-2015-c3-g03 | sin fecha | 1 | `fumigen` | las senales **fumigen**as flotantes emitiran humo de color… |
| and-py-2015-c3-g06 | sin fecha | 1 | `bengala`, `cohete` | los cohetes lanza **bengala**s con paracaidas arderan con un col… |
| and-py-2015-c3-g07 | sin fecha | 1 | `chaleco` | …personas a bordo deben quitarse el **chaleco** salvavidas. despejar la cubierta d… |
| and-py-2015-c3-g09 | sin fecha | 1 | `balsa` | si embarcamos en una **balsa** salvavidas, el patron debera tomar… |
| and-py-2016-c1-g08 | 2016-04-09 | 1 | `bengala` | el disparo de una **bengala** de mano debe realizarse: desde cua… |
| and-py-2016-c1-g10 | 2016-04-09 | 1 | `extintor` | al utilizar un **extintor** de polvo seco se debe: presurizarl… |
| and-py-2016-c1-n03 | 2016-04-09 | 3 | `corredera` | …ss corresponden a: la velocidad de **corredera** la velocidad que hay que mantener … |
| and-py-2016-c2-g06 | 2016-06-18 | 1 | `fumigen` | la senal **fumigen**a flotante: es una senal tanto de u… |
| and-py-2016-c2-g07 | 2016-06-18 | 1 | `balsa` | …e se ha tenido que hacer uso de la **balsa**. al embarcar se ha comprobado tant… |
| and-py-2016-c2-g08 | 2016-06-18 | 1 | `balsa` | …r que la longitud de la boza de la **balsa**: quien realmente infla la balsa es… |
| and-py-2016-c2-g10 | 2016-06-18 | 1 | `balsa` | una vez que estemos en la **balsa** salvavidas, el respondedor de rada… |
| and-py-2016-c3-g04 | 2016-11-19 | 1 | `balsa` | … la tripulacion se encuentra en la **balsa** salvavidas, si esta continua amarr… |
| and-py-2016-c3-g06 | 2016-11-19 | 1 | `chaleco`, `inflable` | los **chaleco**s salvavidas inflables por gas se p… |
| and-py-2016-c3-g07 | 2016-11-19 | 1 | `balsa` | para estibar y trincar una **balsa** a bordo es conveniente: dar 2 o 3 … |
| and-py-2016-c3-g08 | 2016-11-19 | 1 | `extintor` | los **extintor**es especialmente adecuados y recome… |
| and-py-2016-c3-g09 | 2016-11-19 | 1 | `extintor` | el uso de los **extintor**es de agua estan totalmente prohibi… |
| and-py-2016-c3-g10 | 2016-11-19 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2017-c1-g06 | 2017-04-01 | 1 | `chaleco`, `flotabilidad` | todos los **chaleco**s salvavidas estan disenados para q… |
| and-py-2017-c1-g09 | 2017-04-01 | 1 | `chaleco`, `balsa` | …e el agua en la balsa colocarse el **chaleco** salvavidas y/o traje de superviven… |
| and-py-2017-c1-g10 | 2017-04-01 | 1 | `balsa` | …rre a ninguna parte no abandone la **balsa** salvavidas aunque lo indique el he… |
| and-py-2017-c2-g04 | 2017-06-17 | 1 | `fumigen` | … uso, ¿como utilizaremos una senal **fumigen**a?: quitaremos el tapon y tiraremos… |
| and-py-2017-c2-g06 | 2017-06-17 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2017-c2-g08 | 2017-06-17 | 1 | `bengala`, `cohete`, `fumigen`, `pirotecni` | todas las senales fumigenas, **bengala**s y cohetes con paracaidas deberan … |
| and-py-2017-c2-g09 | 2017-06-17 | 1 | `balsa` | …odo el tiempo de permanencia en la **balsa**, pues la bateria dura el tiempo su… |
| and-py-2017-c2-g10 | 2017-06-17 | 1 | `chaleco`, `flotabilidad` | …n es correcta, en relacion con los **chaleco**s salvavidas: estan disenados para … |
| and-py-2017-c2-n02 | 2017-06-17 | 3 | `corredera` | …ectiva del barco a la velocidad de **corredera** del buque |
| and-py-2017-c3-g02 | 2017-11-11 | 1 | `bengala` | la **bengala** de mano estara encendida durante u… |
| and-py-2017-c3-g07 | 2017-11-11 | 1 | `fumigen` | una senal **fumigen**a flotante que no sea la utilizada … |
| and-py-2017-c3-g09 | 2017-11-11 | 1 | `bengala`, `pirotecni` | …alargado por fuera de cubierta, la **bengala** practicamente vertical y alejada d… |
| and-py-2018-c1-g04 | 2018-03-14 | 1 | `cohete`, `pirotecni` | …a senal pirotecnica formada por un **cohete** con luz roja y paracaidas debe ser… |
| and-py-2018-c1-g06 | 2018-03-14 | 1 | `achique`, `balde` | …dios, no podran emplearse para: el **achique** de agua salada el achique de agua … |
| and-py-2018-c1-g08 | 2018-03-14 | 1 | `bengala`, `cohete`, `fumigen` | …ncaremos el motor encenderemos una **bengala** para senalizar nuestra posicion la… |
| and-py-2018-c1-g10 | 2018-03-14 | 1 | `balsa` | …e se actua para liberar aire de la **balsa** salvavidas |
| and-py-2018-c1-n03 | 2018-03-14 | 3 | `corredera` | …ad de la corriente la velocidad de **corredera** la velocidad efectiva |
| and-py-2018-c1b-g05 | 2018-03-14 | 1 | `fumigen` | la senal **fumigen**a flotante: emitira humo de color m… |
| and-py-2018-c1b-g06 | 2018-03-14 | 1 | `extintor` | al utilizar un **extintor** de polvo seco se debe: agitarlo an… |
| and-py-2018-c1b-g07 | 2018-03-14 | 1 | `balsa` | …ar el motor si se encuentra en una **balsa** salvavidas, use el vhf portatil pa… |
| and-py-2018-c1b-g08 | 2018-03-14 | 1 | `bengala` | …rmaciones no es correcta sobre una **bengala** de mano?: ira en un estuche hidror… |
| and-py-2018-c1b-g09 | 2018-03-14 | 1 | `balsa` | …radiobaliza y llevela consigo a la **balsa** salvavidas active automaticamente … |
| and-py-2018-c2-g04 | 2018-06-12 | 1 | `cohete`, `fumigen` | …elicoptero se aproxime?: lanzar un **cohete** provisto de paracaidas para senala… |
| and-py-2018-c2-g05 | 2018-06-12 | 1 | `balsa` | …odo el tiempo de permanencia en la **balsa**, pues la bateria debe durar el tie… |
| and-py-2018-c2-g06 | 2018-06-12 | 1 | `balsa` | a bordo de una **balsa** salvavidas, para evitar la deshidr… |
| and-py-2018-c2-g07 | 2018-06-12 | 1 | `pirotecni`, `chaleco`, `balsa` | … la balsa hacer uso de las senales **pirotecni**cas revisar el material existente |
| and-py-2018-c2-g08 | 2018-06-12 | 1 | `bengala`, `cohete`, `fumigen` | todas las senales fumigenas, **bengala**s y cohetes con paracaidas deberan … |
| and-py-2018-c2-g09 | 2018-06-12 | 1 | `aro salvavidas` | todo **aro salvavidas** solas: estara provisto de una guir… |
| and-py-2018-c2-g10 | 2018-06-12 | 1 | `chaleco`, `flotabilidad` | los **chaleco**s salvavidas para adultos tendran f… |
| and-py-2018-c4-g04 | 2018-11-23 | 1 | `aros salvavidas` | los **aros salvavidas** reglamentarios deberan ir provisto… |
| and-py-2018-c4-g05 | 2018-11-23 | 1 | `chaleco` | … menos de 3 metros, provisto de un **chaleco** que sujetaremos en la espalda es d… |
| and-py-2018-c4-g06 | 2018-11-23 | 1 | `bengala` | las **bengala**s de mano dispondran de: medios de … |
| and-py-2018-c4-g08 | 2018-11-23 | 1 | `balsa` | si tenemos que permanecer en una **balsa** salvavidas, debemos organizarnos d… |
| and-py-2018-c4-g09 | 2018-11-23 | 1 | `balsa` | …nto de vista o referencia sera: la **balsa** salvavidas el helicoptero el naufr… |
| and-py-2019-c1-g03 | 2019-04-06 | 1 | `bengala`, `cohete` | …parar verticalmente un cohete lanza**bengala**s con paracaidas, este alcanzara un… |
| and-py-2019-c1-g04 | 2019-04-06 | 1 | `chaleco` | los **chaleco**s salvavidas no se quemaran ni segu… |
| and-py-2019-c1-g05 | 2019-04-06 | 1 | `balsa` | …tica en los medios de zafado de la **balsa** salvavidas, esta unidad soltara au… |
| and-py-2019-c1-g06 | 2019-04-06 | 1 | `balsa`, `inflable` | …mantener la estabilidad, todas las **balsa**s salvavidas inflables homologadas … |
| and-py-2019-c1-g07 | 2019-04-06 | 1 | `balsa` | las **balsa**s salvavidas se revisaran: cada sei… |
| and-py-2019-c1-g08 | 2019-04-06 | 1 | `balsa` | …var la radiobaliza y llevarla a la **balsa** salvavidas, manteniendola alejada … |
| and-py-2019-c1-g09 | 2019-04-06 | 1 | `chaleco`, `balsa` | …e nos vea mejor nos quitaremos los **chaleco**s salvavidas para no entorpecer las… |
| and-py-2019-c2-g04 | 2019-06-15 | 1 | `aros salvavidas`, `flotabilidad` | en relacion a los **aros salvavidas** solas: para flotar necesitaran de … |
| and-py-2019-c2-g05 | 2019-06-15 | 1 | `bengala` | las **bengala**s de mano seran visibles: solo dura… |
| and-py-2019-c2-g06 | 2019-06-15 | 1 | `bengala`, `cohete` | …ado verticalmente, el cohete lanza **bengala**s con paracaidas alcanzara una altu… |
| and-py-2019-c2-g07 | 2019-06-15 | 1 | `bengala`, `cohete`, `fumigen`, `pirotecni` | todas las senales fumigenas, **bengala**s y cohetes con paracaidas deberan … |
| and-py-2019-c2-g08 | 2019-06-15 | 1 | `balsa` | al abandonar la embarcacion la **balsa** salvavidas se ha volteado, quedand… |
| and-py-2019-c2-g09 | 2019-06-15 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2019-c2-n08 | 2019-06-15 | 3 | `corredera` | …d verdadera del buque velocidad de **corredera** velocidad efectiva del buque veloc… |
| and-py-2019-c3-g04 | 2019-11-23 | 1 | `bengala`, `cohete` | la **bengala** con paracaidas lanzada desde un co… |
| and-py-2019-c3-g07 | 2019-11-23 | 1 | `balsa` | con el objetivo de que la **balsa** salvavidas quede orientada con res… |
| and-py-2019-c3-g08 | 2019-11-23 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2019-c3-g09 | 2019-11-23 | 1 | `balsa` | la **balsa** salvavidas tendra una estabilidad … |
| and-py-2019-c3-g10 | 2019-11-23 | 1 | `fumigen`, `balsa` | …en un reloj lanzar al agua un bote **fumigen**o todas las respuestas anteriores s… |

## RD 587/2022

Real Decreto 587/2022, de 19 de julio (radiocomunicaciones de recreo, balsas salvavidas, instructores británicos). En vigor desde el 2022-07-21 ([BOE-A-2022-12013](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12013)). Radio en zona 1: el NAVTEX solo es obligatorio para las embarcaciones de la lista 6.ª; balsas ISO 9650 u otra normativa equivalente homologadas por la DGMM.

81 preguntas (6 de PER, 75 de PY). Motivo común: la pregunta es anterior al 2022-07-21; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1) — escrita con 28 marcas y ahora hay 81: revisarla: Todas son del PY (genérico y navegación) de 2020-c1 a 2022-c2. Ninguna pregunta trata del NAVTEX en zona 1, que es lo que cambió para la radio; las que tocan equipos son and-py-2021-c1-g05 (EPIRB), and-py-2021-c2-g07 y -g09 (EPIRB y SART), and-py-2021-c2-g10 (VHF con LSD) y las de la balsa (and-py-2022-c1-g04 envoltura, and-py-2022-c2-g08 toldo), donde el cambio de 2022 solo afecta a la homologación de las balsas (ISO 9650 u otra norma equivalente homologada por la DGMM). El resto son técnicas de supervivencia en la balsa y canales de VHF.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2015-c2-t09 | sin fecha | 3 | `vhf` | …erencias de las comunicaciones por **vhf**. |
| and-2016-c2-t23 | 2016-06-18 | 6 | `vhf` | …mejor es coordinar la maniobra por **vhf** emitir cinco o mas pitadas cortas … |
| and-2016-c2-t31 | 2016-06-18 | 8 | `balsa` | si nos encontramos en una **balsa** salvavidas y tenemos la posibilida… |
| and-2017-c2-t08 | 2017-06-17 | 3 | `balsa` | …ndonar la embarcacion y subir a la **balsa** tan pronto como nos encontremos en… |
| and-2018-c1-t10 | 2018-03-10 | 3 | `vhf` | …tendremos a la escucha en el canal **vhf** que salvamento maritimo nos haya i… |
| and-2018-c1-t32 | 2018-03-10 | 8 | `balsa`, `radiobaliza` | … embarcacion sin disponibilidad de **balsa** salvavidas, ¿cual es la mejor form… |
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
| and-py-2022-c3-g08 | 2017-06-17 | 1 | `balsa`, `zafa hidrostatica` | …ujetar los aparatos de emergencia (**balsa**s, balizas, etc.) al buque de una f… |
| and-py-2015-c1-g08 | 2015-01-01 | 1 | `epirb` | los **epirb** podran activarse o desactivarse… m… |
| and-py-2015-c1-g10 | sin fecha | 1 | `\bsart\b` | el resar o **sart** podra activarse o desactivarse: a … |
| and-py-2015-c2-g04 | sin fecha | 1 | `respondedor` | un **respondedor** o transpondedor de radar es/son un… |
| and-py-2015-c3-g01 | sin fecha | 1 | `zafa hidrostatica` | la **zafa hidrostatica** se accionara automaticamente cuand… |
| and-py-2015-c3-g05 | sin fecha | 1 | `vhf` | …arte alta de barco son: antenas de **vhf**. reflectores de radar. antenas de … |
| and-py-2015-c3-g07 | sin fecha | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …sus tripulantes por el canal 16 de **vhf** y atender a su informacion e instr… |
| and-py-2015-c3-g09 | sin fecha | 1 | `balsa` | si embarcamos en una **balsa** salvavidas, el patron debera tomar… |
| and-py-2015-c3-g10 | sin fecha | 1 | `\bsart\b` | ¿que es un **sart**? un dispositivo que oculta nuestro… |
| and-py-2016-c1-g05 | 2016-04-09 | 1 | `zafa hidrostatica` | la **zafa hidrostatica** debe dispararse manualmente: verda… |
| and-py-2016-c1-g09 | 2016-04-09 | 1 | `respondedor` | el **respondedor** de radar se activa: cuando recibe … |
| and-py-2016-c2-g07 | 2016-06-18 | 1 | `balsa` | …e se ha tenido que hacer uso de la **balsa**. al embarcar se ha comprobado tant… |
| and-py-2016-c2-g08 | 2016-06-18 | 1 | `balsa`, `zafa hidrostatica` | …r que la longitud de la boza de la **balsa**: quien realmente infla la balsa es… |
| and-py-2016-c2-g10 | 2016-06-18 | 1 | `balsa`, `respondedor` | una vez que estemos en la **balsa** salvavidas, el respondedor de rada… |
| and-py-2016-c3-g04 | 2016-11-19 | 1 | `balsa` | … la tripulacion se encuentra en la **balsa** salvavidas, si esta continua amarr… |
| and-py-2016-c3-g07 | 2016-11-19 | 1 | `balsa` | para estibar y trincar una **balsa** a bordo es conveniente: dar 2 o 3 … |
| and-py-2016-c3-g10 | 2016-11-19 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2017-c1-g09 | 2017-04-01 | 1 | `balsa` | …empre embarcar desde el agua en la **balsa** colocarse el chaleco salvavidas y/… |
| and-py-2017-c1-g10 | 2017-04-01 | 1 | `balsa` | …rre a ninguna parte no abandone la **balsa** salvavidas aunque lo indique el he… |
| and-py-2017-c2-g06 | 2017-06-17 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2017-c2-g09 | 2017-06-17 | 1 | `balsa`, `respondedor` | …odo el tiempo de permanencia en la **balsa**, pues la bateria dura el tiempo su… |
| and-py-2017-c3-g04 | 2017-11-11 | 1 | `radiobaliza`, `epirb`, `406 ?mhz` | una **radiobaliza** epirb: transmite una senal en la f… |
| and-py-2017-c3-g08 | 2017-11-11 | 1 | `epirb`, `vhf`, `\bsart\b` | …al radar de un buque, se denomina: **epirb** o rls vhf o resar sart o resar nin… |
| and-py-2018-c1-g05 | 2018-03-14 | 1 | `radiobaliza`, `respondedor` | … espejo de senales reflector radar **radiobaliza** respondedor de senales |
| and-py-2018-c1-g07 | 2018-03-14 | 1 | `vhf`, `canal(es)? (16\|70\|6\|06\|9\|13)\b` | …ar la embarcacion, utilizaremos el **vhf** de la siguiente manera: selecciona… |
| and-py-2018-c1-g10 | 2018-03-14 | 1 | `balsa`, `zafa hidrostatica` | …e se actua para liberar aire de la **balsa** salvavidas |
| and-py-2018-c1b-g07 | 2018-03-14 | 1 | `balsa`, `vhf` | …ar el motor si se encuentra en una **balsa** salvavidas, use el vhf portatil pa… |
| and-py-2018-c1b-g09 | 2018-03-14 | 1 | `balsa`, `radiobaliza` | …radiobaliza y llevela consigo a la **balsa** salvavidas active automaticamente … |
| and-py-2018-c2-g05 | 2018-06-12 | 1 | `balsa`, `radiobaliza`, `respondedor` | …odo el tiempo de permanencia en la **balsa**, pues la bateria debe durar el tie… |
| and-py-2018-c2-g06 | 2018-06-12 | 1 | `balsa` | a bordo de una **balsa** salvavidas, para evitar la deshidr… |
| and-py-2018-c2-g07 | 2018-06-12 | 1 | `balsa` | …n que nos encontremos todos en una **balsa** salvavidas, una vez abandonada la … |
| and-py-2018-c4-g07 | 2018-11-23 | 1 | `respondedor`, `\bsart\b` | en relacion al **respondedor** radar (sart), ¿cual de las siguien… |
| and-py-2018-c4-g08 | 2018-11-23 | 1 | `balsa` | si tenemos que permanecer en una **balsa** salvavidas, debemos organizarnos d… |
| and-py-2018-c4-g09 | 2018-11-23 | 1 | `balsa` | …nto de vista o referencia sera: la **balsa** salvavidas el helicoptero el naufr… |
| and-py-2019-c1-g05 | 2019-04-06 | 1 | `balsa` | …tica en los medios de zafado de la **balsa** salvavidas, esta unidad soltara au… |
| and-py-2019-c1-g06 | 2019-04-06 | 1 | `balsa` | …mantener la estabilidad, todas las **balsa**s salvavidas inflables homologadas … |
| and-py-2019-c1-g07 | 2019-04-06 | 1 | `balsa` | las **balsa**s salvavidas se revisaran: cada sei… |
| and-py-2019-c1-g08 | 2019-04-06 | 1 | `balsa`, `radiobaliza` | …var la radiobaliza y llevarla a la **balsa** salvavidas, manteniendola alejada … |
| and-py-2019-c1-g09 | 2019-04-06 | 1 | `balsa` | si nos encontramos en una **balsa** salvavidas y vamos a ser rescatado… |
| and-py-2019-c1-g10 | 2019-04-06 | 1 | `radiobaliza`, `epirb`, `respondedor`, `\bmmsi\b` | …(mmsi) y permite su localizacion?: **radiobaliza** epirb reflector radar equipo radio… |
| and-py-2019-c2-g08 | 2019-06-15 | 1 | `balsa` | al abandonar la embarcacion la **balsa** salvavidas se ha volteado, quedand… |
| and-py-2019-c2-g09 | 2019-06-15 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2019-c3-g06 | 2019-11-23 | 1 | `respondedor` | en relacion a la utilizacion del **respondedor** radar: se activa automaticamente a… |
| and-py-2019-c3-g07 | 2019-11-23 | 1 | `balsa` | con el objetivo de que la **balsa** salvavidas quede orientada con res… |
| and-py-2019-c3-g08 | 2019-11-23 | 1 | `balsa` | … es correcta, al permanecer en una **balsa** salvavidas a la espera de ser resc… |
| and-py-2019-c3-g09 | 2019-11-23 | 1 | `balsa` | la **balsa** salvavidas tendra una estabilidad … |
| and-py-2019-c3-g10 | 2019-11-23 | 1 | `balsa`, `vhf` | …atado por un helicoptero desde una **balsa** salvavidas. activar el resar (si s… |

## RD 1188/2025 (gobierno sin título)

Real Decreto 1188/2025, de 26 de diciembre: nueva redacción del art. 10 del RD 875/2014 (navegación sin título). En vigor desde el 2026-10-01 ([BOE-A-2025-27010](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010)). Sin título solo para uso privado de embarcaciones a motor de hasta 5 m y 15 CV sin dispositivo reductor (antes 11,26 kW), vela deportiva hasta 6 m y artefactos de playa; a 2 millas del puerto, marina o playa de salida; el alquiler exige título.

3 preguntas (2 de PER, 1 de PY). Motivo común: la pregunta es anterior al 2026-10-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1) — escrita con 2 marcas y ahora hay 3: revisarla: El banco vivo no tiene ninguna pregunta sobre la navegación sin título (art. 10 del RD 875/2014): las dos marcas son por «6 metros de eslora» en la cadena de fondeo (and-2023-c1-t01) y por «artefactos flotantes» en los puertos comerciales (and-2026-c2-t11). No hay respuestas oficiales que el cambio del 1-10-2026 deje obsoletas; si la fase F1 añade una pregunta o una explicación sobre el gobierno sin título, debe usar la redacción nueva (uso privado, 15 CV sin reductor, 2 millas de la salida, alquiler con título).

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2023-c1-t01 | 2023-03-25 | 1 | `(^\|[^0-9,.])6 metros de eslora` | en las embarcaciones de mas de** 6 metros de eslora**, la longitud del tramo de cadena d… |
| and-2026-c2-t11 | 2026-06-13 | 4 | `artefactos? (flotante\|de playa)` | …a total inferior a 20 metros y los **artefactos flotante**s de recreo no estorbaran el transi… |
| and-py-2016-c2-n14 | 2016-06-18 | 4 | `\b(2\|dos) millas.{0,30}(puerto\|marina\|abrigo\|playa)` | …e de rc = w e intensidad horaria = **2 millas, damos rumbo a 8 nudos al puerto** de barbate (punto de llegada: faro… |

## RD 191/2026

Real Decreto 191/2026, de 11 de marzo, de conservación de las praderas de fanerógamas marinas en el Mediterráneo. En vigor desde el 2026-04-02 ([BOE-A-2026-5877](https://www.boe.es/eli/es/rd/2026/03/11/191)). Prohibición general de fondear sobre Posidonia oceanica y Cymodocea nodosa (y en arenas próximas si la cadena o el borneo las afectan) en todo el Mediterráneo español, salvo con sistemas de bajo impacto autorizados.

28 preguntas (26 de PER, 2 de PY). Motivo común: la pregunta es anterior al 2026-04-02; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1) — escrita con 20 marcas y ahora hay 28: revisarla: Las que tratan de la posidonia son and-2022-c2-t11, and-2024-c3-t11 y and-2026-c1-t11: sus respuestas oficiales (prohibición general de fondear sobre la pradera, también con la cadena o el borneo, salvo fuerza mayor; los campos de boyas no permiten fondear sobre ella) coinciden con el art. 5 del RD 191/2026, aunque son anteriores a él; conviene citar la norma en la explicación. También: and-2025-c2-q45 (fondeo prohibido en la carta), and-2024-c1-t40 (fondeadero prohibido en las cartas), las ZEPIM (and-2021-c1-t12, and-2021-c2-t11, and-2023-c1-t11) y la elección del tenedero (and-2020-c1-t06, and-2022-c2-t05, and-2025-c3-t06, con «algas» entre las opciones, and-2022-c3-t06, and-2024-c2-t06, and-2025-c1-t05), donde la explicación debería añadir que en el Mediterráneo no se fondea sobre praderas. El resto son marcas anchas («fondeadero», «fondo marino»).

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
| and-2015-c2-t12 | sin fecha | 4 | `zona(s)? especialmente protegida` | medidas para la proteccion de las **zonas especialmente protegida**s de importancia en el mediterraneo… |
| and-2015-c3-t06 | sin fecha | 2 | `\balgas?\b`, `tenedero` | … tenedero: arena. cascajo. piedra. **algas**. |
| and-2016-c3-t12 | 2016-11-19 | 4 | `posidonia`, `pradera` | … una embarcacion en una pradera de **posidonia**: no supone ningun riesgo para la p… |
| and-2017-c3-t12 | 2017-11-11 | 4 | `prohibid.{0,30}fonde` | … zonas balizadas para el bano esta **prohibida la navegacion y el fonde**o en los tramos de playa que no est… |
| and-2018-c2-t05 | 2018-05-26 | 2 | `(fondear\|fondeo).{0,30}(lugar\|sitio\|fondo)` | si queremos **fondear con un ancla, antes de dar fondo** debemos por regla general: destrin… |
| and-2018-c2-t06 | 2018-05-26 | 2 | `(lugar\|sitio\|fondo).{0,30}(fondear\|fondeo)` | … ella: una boya o baliza cerca del **lugar del fondeo**, no en el ancla un orinque un garr… |
| and-2018-c3-t05 | 2018-09-29 | 2 | `tenedero` | indicar cual de los siguientes **tenedero**s es el mas adecuado para fondear: … |
| and-2019-c2-t41 | 2019-06-15 | 10 | `fondeadero` | … puertos y otras radas, ensenadas, **fondeadero**s, etc., se denominan: cartuchos po… |
| and-py-2021-c1-g17 | 2021-05-22 | 2 | `fondos? marinos?` | …da entre la cresta de una ola y el **fondo marino**. es la distancia horizontal medida… |
| and-py-2021-c2-n06 | 2021-11-20 | 3 | `fondos? marinos?` | …mbo efectivo referenciado sobre el **fondo marino**. el rumbo verdadero que deberemos … |

## IALA MBS 2022

Sistema de Balizamiento Marítimo de la IALA (Recomendación R1001), edición que cita el tribunal de la DGMM. En vigor desde el 2026-01-09 ([BOE-A-2026-510](https://www.boe.es/boe/dias/2026/01/09/pdfs/BOE-A-2026-510.pdf)). La convocatoria de la DGMM de 2026 remite al balizamiento IALA-MBS 2022; otras administraciones (Murcia, Melilla, comunidades del norte) siguen citando la edición de 2010 (resolución de Puertos del Estado de 8-6-2010). La fecha es la del BOE que lo cita, no la de la edición de la IALA: cotejada la R1001 ed. 2.0 de la IALA con la MBS 2010 (fase F1), no cambian colores, formas, marcas de tope ni ritmos de las marcas que se preguntan: la ed. 2.0 añade el MAtoN (marca especial móvil con ritmo propio), las boyas de amarre como especiales y el AIS como complemento, y corrige la errata del folleto de 2010 en los ritmos de las cardinales Norte y Este. El detector sigue marcando el balizamiento anterior para revisarlo.

216 preguntas (190 de PER, 26 de PY). Motivo común: la pregunta es anterior al 2026-01-09; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

**Lectura rápida** (a mano; no resuelve, orienta a la fase F1) — escrita con 120 marcas y ahora hay 216: revisarla: Todo el balizamiento del PER anterior a 2026 (80 de la UT 5) y las preguntas de carta y del PY con boyas, faros o marcas. No se ha verificado con fuente primaria qué cambió entre la IALA-MBS 2010 y la 2022 (normativa.md, § 4, Gaps): la fase F1 debe cotejar las de la UT 5 con el texto de la MBS 2022 antes de dar por buenas las respuestas; las de las otras unidades casi siempre nombran un faro o una boya de pasada.

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
| and-2021-c1-t13 | 2015-01-01 | 5 | `lateral` | …con una franja roja, indica: marca **lateral** de estribor. marca lateral de babo… |
| and-2021-c1-t14 | 2015-01-01 | 5 | `peligro aislado` | en una marca de **peligro aislado** el ritmo y el color de su luz es: … |
| and-2021-c1-t15 | 2015-01-01 | 5 | `aguas navegables`, `marca de tope` | la marca de tope de **aguas navegables**, consiste en: dos esferas negras. … |
| and-2021-c1-t16 | 2015-01-01 | 5 | `marca de tope` | una **marca de tope** consistente en dos conos negros su… |
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
| and-2015-c1-t12 | sin fecha | 4 | `baliza` | limites a la navegacion en playas **baliza**das. la navegacion esta prohibida e… |
| and-2015-c1-t17 | sin fecha | 5 | `lateral` | las marcas **lateral**es de babor. ¿que forma y color tie… |
| and-2015-c2-t03 | sin fecha | 1 | `lateral` | … parte trasera del buque. la parte **lateral** del buque. la parte de fondo del b… |
| and-2015-c2-t06 | sin fecha | 2 | `boya` | …a. un cabo que sirve para unir una **boya** con el ancla, y senalar donde esta… |
| and-2015-c2-t13 | sin fecha | 5 | `lateral` | …con una franja roja, indica: marca **lateral** de estribor. marca lateral de babo… |
| and-2015-c2-t15 | sin fecha | 5 | `marca de tope` | …i divisamos una marca que tiene de **marca de tope** dos conos superpuestos, opuestos p… |
| and-2015-c2-t16 | sin fecha | 5 | `marca especial`, `marca de tope` | …marca de tope (si la tiene) de una **marca especial**, consiste: un cono. una bola. un a… |
| and-2015-c2-t17 | sin fecha | 5 | `peligro aislado` | el color de una marca de **peligro aislado** es: verde con franjas horizontales… |
| and-2015-c2-t34 | sin fecha | 9 | `lateral` | … y con una componente hacia fuera. **lateral**mente hacia el interior del conjunt… |
| and-2015-c3-t13 | sin fecha | 5 | `aguas navegables`, `marca de tope` | la marca de tope de **aguas navegables** consiste en dos esferas negras. un… |
| and-2015-c3-t14 | sin fecha | 5 | `lateral` | …a forma y color que tiene un marca **lateral** de babor cilindrica roja. conica r… |
| and-2015-c3-t15 | sin fecha | 5 | `lateral` | …on, canal principal a babor. marca **lateral** babor. marca de bifurcacion, canal… |
| and-2015-c3-t16 | sin fecha | 5 | `lateral` | …on, canal principal a babor. marca **lateral** de estribor. marca lateral de babo… |
| and-2015-c3-t17 | sin fecha | 5 | `marca de tope` | una marca de castillete que su **marca de tope** son dos conos negros superpuestos … |
| and-2015-c3-t19 | sin fecha | 6 | `centellea` | …ado, luz de alcance y luz amarilla **centellea**nte todo horizonte. luces de tope, … |
| and-2015-c3-t29 | sin fecha | 7 | `lateral` | … el efecto evolutivo de la presion **lateral** de las palas en una embarcacion pa… |
| and-2016-c1-t11 | 2016-04-09 | 4 | `baliza` | en una playa que no este **baliza**da: la zona de bano se extiende has… |
| and-2016-c1-t13 | 2016-04-09 | 5 | `peligro aislado`, `aguas navegables` | …mente, corresponde a una marca: de **peligro aislado** especial de bifurcacion de aguas n… |
| and-2016-c1-t14 | 2016-04-09 | 5 | `baliza`, `lateral` | entrando en puerto por un canal **baliza**do, por nuestra banda de estribor d… |
| and-2016-c1-t15 | 2016-04-09 | 5 | `cardinal`, `marca de tope` | la marca de tope de una marca **cardinal** sur consiste en: dos conos negros … |
| and-2016-c1-t16 | 2016-04-09 | 5 | `cardinal` | una marca **cardinal** sur indica: que las aguas mas prof… |
| and-2016-c1-t17 | 2016-04-09 | 5 | `peligro aislado`, `aguas navegables` | …s blancas y rojas es una marca: de **peligro aislado** especial de bifurcacion de aguas n… |
| and-2016-c2-t06 | 2016-06-18 | 2 | `boya` | …amarran a la cruz del ancla y a un **boya**rin se denomina: cabo de leva vuelt… |
| and-2016-c2-t13 | 2016-06-18 | 5 | `cardinal`, `peligro aislado`, `aguas navegables`, `centellea` | …de a una marca: de peligro aislado **cardinal** norte de bifurcacion de aguas nave… |
| and-2016-c2-t15 | 2016-06-18 | 5 | `aguas navegables`, `marca de tope` | la marca de tope de una marca de **aguas navegables**, si la tiene, es: dos conos negros… |
| and-2016-c2-t16 | 2016-06-18 | 5 | `peligro aislado` | …o de la luz blanca de una marca de **peligro aislado** puede ser: grupo de dos destellos … |
| and-2016-c3-t05 | 2016-11-19 | 2 | `baliza` | …o decorativo en las anclas de cepo **baliza**r el ancla balizar el freno del mol… |
| and-2016-c3-t13 | 2016-11-19 | 5 | `cardinal`, `centellea` | …te continua: se trata de una marca **cardinal** norte; debemos dejarla por la band… |
| and-2016-c3-t14 | 2016-11-19 | 5 | `lateral`, `peligro aislado`, `aguas navegables` | …marca de peligro aislado una marca **lateral** de babor una marca lateral de bifu… |
| and-2016-c3-t15 | 2016-11-19 | 5 | `peligro aislado`, `marca de tope` | la marca de tope de una marca de **peligro aislado** es: dos conos negros superpuestos,… |
| and-2016-c3-t16 | 2016-11-19 | 5 | `cardinal`, `lateral`, `peligro aislado`, `aguas navegables`, `centellea` | …marca de peligro aislado una marca **cardinal** oeste una marca lateral de bifurca… |
| and-2016-c3-t17 | 2016-11-19 | 5 | `peligro aislado`, `aguas navegables` | … horizontal verde es una marca: de **peligro aislado** de bifurcacion, canal principal a … |
| and-2017-c1-t12 | 2017-04-01 | 4 | `baliza` | …n los tramos de playa que no esten **baliza**dos no se puede navegar dentro de u… |
| and-2017-c1-t13 | 2017-04-01 | 5 | `lateral` | …al de un puerto espanol las marcas **lateral**es de color rojo debemos dejarlas p… |
| and-2017-c1-t14 | 2017-04-01 | 5 | `peligro aislado`, `marca de tope` | una marca de **peligro aislado**: es negra con una o mas bandas anc… |
| and-2017-c1-t15 | 2017-04-01 | 5 | `lateral` | … estribor de la marca es una marca **lateral** que debemos dejar por babor es una… |
| and-2017-c1-t16 | 2017-04-01 | 5 | `marca de tope` | … horizontal ancha, amarilla, y una **marca de tope** de dos triangulos unidos por su ba… |
| and-2017-c1-t17 | 2017-04-01 | 5 | `baliza`, `balizamiento`, `lateral` | …stamos navegando en la region b de **baliza**miento |
| and-2017-c1-t28 | 2017-04-01 | 7 | `lateral` | el efecto de la presion **lateral** de las palas en una helice de giro… |
| and-2017-c2-t14 | 2017-06-17 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …eberemos interpretar que es: marca **cardinal** este marca de peligro aislado marc… |
| and-2017-c2-t15 | 2017-06-17 | 5 | `lateral` | …de dia vemos por la proa una marca **lateral** en forma de castillete roja con un… |
| and-2017-c2-t17 | 2017-06-17 | 5 | `lateral` | …do a un puerto espanol, las marcas **lateral**es verdes de la canal principal de … |
| and-2017-c2-t39 | 2017-06-17 | 10 | `baliza`, `balizamiento` | …ucho en una carta es: una senal de **baliza**miento la zona de tierra un trozo d… |
| and-2017-c3-t12 | 2017-11-11 | 4 | `baliza` | …firmaciones es falsa: en las zonas **baliza**das para el bano esta prohibida la … |
| and-2017-c3-t13 | 2017-11-11 | 5 | `cardinal`, `lateral`, `peligro aislado` | …acia abajo, identifican una: marca **cardinal** sur marca cardinal norte marca lat… |
| and-2017-c3-t14 | 2017-11-11 | 5 | `lateral` | …r el color. se trata de: una marca **lateral** de estribor una marca lateral de b… |
| and-2017-c3-t15 | 2017-11-11 | 5 | `cardinal` | una marca **cardinal** este indica: que las aguas mas pro… |
| and-2017-c3-t16 | 2017-11-11 | 5 | `boya`, `lateral` | una **boya** emite de noche un grupo de 2 + 1 d… |
| and-2017-c3-t17 | 2017-11-11 | 5 | `cardinal`, `lateral`, `peligro aislado` | …egro en la inferior, es una marca: **cardinal** sur cardinal norte lateral de bifu… |
| and-2018-c1-t13 | 2018-03-10 | 5 | `cardinal`, `lateral`, `peligro aislado` | …a inferior amarilla, es una: marca **cardinal** sur marca cardinal norte marca lat… |
| and-2018-c1-t14 | 2018-03-10 | 5 | `lateral` | … en la parte central es: una marca **lateral** de estribor una marca lateral de b… |
| and-2018-c1-t15 | 2018-03-10 | 5 | `cardinal`, `marca de tope` | una marca **cardinal** este: indica que las aguas mas pro… |
| and-2018-c1-t16 | 2018-03-10 | 5 | `boya`, `lateral` | una **boya** emite de noche un grupo de 2 deste… |
| and-2018-c1-t17 | 2018-03-10 | 5 | `boya`, `cardinal`, `peligro aislado`, `marca de tope` | una **boya** cuya marca de tope es un aspa amar… |
| and-2018-c1-t28 | 2018-03-10 | 7 | `lateral` | el efecto de la presion **lateral** de las palas en una helice de giro… |
| and-2018-c1-t32 | 2018-03-10 | 8 | `baliza` | …de espaldas. lleve consigo la radio**baliza**. mantenga agrupada a toda la tripu… |
| and-2018-c2-t06 | 2018-05-26 | 2 | `boya`, `baliza` | …a perdamos, se coloca en ella: una **boya** o baliza cerca del lugar del fonde… |
| and-2018-c2-t13 | 2018-05-26 | 5 | `lateral`, `peligro aislado`, `aguas navegables`, `marca especial`, `marca de tope` | …a: marca de aguas navegables marca **lateral** de bifurcacion marca especial marc… |
| and-2018-c2-t14 | 2018-05-26 | 5 | `boya`, `lateral` | una **boya** que de noche emite un grupo de 2+1… |
| and-2018-c2-t16 | 2018-05-26 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …ales rojas y blancas es una marca: **cardinal** este cardinal oeste de peligro ais… |
| and-2018-c3-t13 | 2018-09-29 | 5 | `cardinal`, `aguas navegables`, `\biala\b`, `\baism\b` | … de una marca: de aguas navegables **cardinal** norte especial esa luz no correspo… |
| and-2018-c3-t14 | 2018-09-29 | 5 | `cardinal` | el ritmo de la luz de una marca **cardinal** sur es: grupo de 3 centelleos grup… |
| and-2018-c3-t15 | 2018-09-29 | 5 | `cardinal` | una marca **cardinal** este indica que: las aguas mas pro… |
| and-2018-c3-t16 | 2018-09-29 | 5 | `marca de tope` | ¿cual es la **marca de tope** de una marca de color rojo con una… |
| and-2018-c3-t17 | 2018-09-29 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …uperpuestas identifican una: marca **cardinal** sur marca cardinal norte marca de … |
| and-2018-c4-t13 | 2018-12-01 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …na: marca de peligro aislado marca **cardinal** sur marca de aguas navegables ning… |
| and-2018-c4-t14 | 2018-12-01 | 5 | `cardinal` | una marca **cardinal** puede ser utilizada: para indicar … |
| and-2018-c4-t15 | 2018-12-01 | 5 | `aguas navegables`, `marca de tope` | …tope (si la tiene) de una marca de **aguas navegables** es: ninguna. la marca de aguas nav… |
| and-2018-c4-t16 | 2018-12-01 | 5 | `baliza`, `marca de tope` | entrando en puerto por un canal **baliza**do vemos un castillete rojo con una… |
| and-2018-c4-t17 | 2018-12-01 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …terrumpida. se trata de una marca: **cardinal** norte de peligro aislado de aguas … |
| and-2019-c1-t13 | 2019-04-06 | 5 | `baliza`, `balizamiento`, `cardinal`, `peligro aislado`, `aguas navegables`, `\biala\b`, `\baism\b` | las unicas marcas del sistema de **baliza**miento maritimo iala-aism que utili… |
| and-2019-c1-t14 | 2019-04-06 | 5 | `peligro aislado`, `aguas navegables`, `marca de tope` | las marcas de **peligro aislado**: se colocan sobre, o proximas, a u… |
| and-2019-c1-t15 | 2019-04-06 | 5 | `lateral`, `marca de tope` | …es la marca de tope de: las marcas **lateral**es de estribor y las marcas de cana… |
| and-2019-c1-t16 | 2019-04-06 | 5 | `lateral` | …des cada 10 segundos es: una marca **lateral** de estribor una marca lateral de b… |
| and-2019-c1-t17 | 2019-04-06 | 5 | `cardinal`, `centellea` | … corresponde a la luz de una marca **cardinal** oeste?: centelleante rapido de gru… |
| and-2019-c1-t22 | 2019-04-06 | 6 | `lateral` | …circulacion por uno de los limites **lateral**es se realizara siguiendo un rumbo … |
| and-2019-c2-t11 | 2019-06-15 | 4 | `baliza` | en las zonas de playas **baliza**das ¿donde esta prohibida la navega… |
| and-2019-c2-t13 | 2019-06-15 | 5 | `centellea` | …nosa consistente en una luz blanca **centellea**nte continua. en este caso: caeremo… |
| and-2019-c2-t14 | 2019-06-15 | 5 | `marca de tope` | ¿como es la **marca de tope** de una marca que de noche emite un… |
| and-2019-c2-t15 | 2019-06-15 | 5 | `boya`, `baliza` | …r un canal balizado llegamos a una **boya** que emite un grupo de 2 + 1 destel… |
| and-2019-c2-t16 | 2019-06-15 | 5 | `boya`, `cardinal`, `lateral`, `peligro aislado`, `aguas navegables` | una **boya** negra con una o varias anchas band… |
| and-2019-c2-t17 | 2019-06-15 | 5 | `cardinal`, `peligro aislado` | …superior e inferior, es una marca: **cardinal** este cardinal oeste de peligro ais… |
| and-2019-c3-t11 | 2019-11-23 | 4 | `baliza` | …ciones a la navegacion?: playas no **baliza**das proximidades de acantilados res… |
| and-2019-c3-t13 | 2019-11-23 | 5 | `marca de tope` | …l roja en el centro y un cono como **marca de tope** es una marca que indica: que entra… |
| and-2019-c3-t14 | 2019-11-23 | 5 | `aguas navegables`, `marca de tope` | la marca de tope de **aguas navegables**, si tiene, es: una esfera roja un … |
| and-2019-c3-t15 | 2019-11-23 | 5 | `boya`, `cardinal`, `aguas navegables`, `centellea` | una **boya** emite una luz centelleante blanca … |
| and-2019-c3-t16 | 2019-11-23 | 5 | `cardinal`, `peligro aislado`, `aguas navegables` | …acia abajo, identifican una: marca **cardinal** sur marca cardinal norte marca de … |
| and-2019-c3-t17 | 2019-11-23 | 5 | `baliza`, `balizamiento`, `marcas? especiales` | … de separacion de trafico donde el **baliza**miento convencional del canal puede… |
| and-2019-c3-t24 | 2019-11-23 | 6 | `baliza`, `balizamiento` | …e estribor depende de la region de **baliza**miento por la que se navegue |
| and-py-2020-c1-g09 | 2020-07-25 | 1 | `baliza` | en caso de que nuestra radio**baliza** de localizacion de siniestros (epi… |
| and-py-2020-c3-g05 | 2020-12-19 | 1 | `baliza` | …os aparatos de emergencia (balsas, **baliza**s, etc.) al buque de una forma segu… |
| and-py-2021-c1-g05 | 2021-05-22 | 1 | `baliza` | las radio**baliza**s epirb… se pueden activar manualme… |
| and-py-2022-c2-g06 | 2022-06-11 | 1 | `baliza` | …le la afirmacion correcta: la radio**baliza** es el aparato utilizado en caso de… |
| and-py-2022-c2-g08 | 2022-06-11 | 1 | `baliza` | …isto de medios para montar la radio**baliza** a una altura de 1,5 metros como mi… |
| and-py-2022-c2-g10 | 2022-06-11 | 1 | `baliza` | …ua llevaremos con nosotros la radio**baliza** |
| and-py-2022-c3-g04 | 2022-11-05 | 1 | `baliza` | …or radar: al contrario que la radio**baliza**, emiten una senal radar de 12 ghz … |
| and-py-2022-c3-g08 | 2017-06-17 | 1 | `baliza` | …os aparatos de emergencia (balsas, **baliza**s, etc.) al buque de una forma segu… |
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
| and-py-2017-c3-g04 | 2017-11-11 | 1 | `baliza` | una radio**baliza** epirb: transmite una senal en la f… |
| and-py-2018-c1-g05 | 2018-03-14 | 1 | `baliza` | …jo de senales reflector radar radio**baliza** respondedor de senales |
| and-py-2018-c1b-g09 | 2018-03-14 | 1 | `baliza` | …ecuada: active manualmente la radio**baliza** y llevela consigo a la balsa salva… |
| and-py-2018-c2-g05 | 2018-06-12 | 1 | `baliza` | …dedor radar: funciona como la radio**baliza**, debiendo activarse antes de aband… |
| and-py-2018-c2-n09 | 2018-06-12 | 3 | `baliza` | … importantes como barcos, costas y **baliza**s salen reflejados en la pantalla n… |
| and-py-2019-c1-g08 | 2019-04-06 | 1 | `baliza` | …ion mas adecuada?: activar la radio**baliza** y llevarla a la balsa salvavidas, … |
| and-py-2019-c1-g10 | 2019-04-06 | 1 | `baliza` | …) y permite su localizacion?: radio**baliza** epirb reflector radar equipo radio… |

## RD 875/2014

Real Decreto 875/2014, de 10 de octubre, por el que se regulan las titulaciones náuticas para el gobierno de las embarcaciones de recreo. En vigor desde el 2015-01-11 ([BOE-A-2014-10344](https://www.boe.es/eli/es/rd/2014/10/10/875/con)). Nuevo marco de títulos (sustituye a la Orden FOM/3200/2007): PNB, PER, PY, CY y licencia de navegación; nueva estructura del examen.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RIPA enmiendas 2013

Enmiendas de 2013 al Reglamento internacional para prevenir los abordajes (Resolución A.1085(28)): parte F. En vigor desde el 2016-01-01 ([BOE-A-2017-377](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2017-377)). Se añade la parte F (verificación del cumplimiento, Código III). Ninguna regla de maniobra, luz ni sonido cambia.

_Ninguna pregunta marcada._ Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).

## RD 238/2019

Real Decreto 238/2019, de 5 de abril, que modifica el RD 875/2014 y el RD 259/2002 (motos náuticas). En vigor desde el 2019-07-01 ([BOE-A-2019-6481](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2019-6481)). Intercambia los errores máximos del examen de PY (teoría 5, carta 3); añade «incluidas las islas intermedias» a la atribución Península–Baleares; quita las motos «clase C» de la licencia de navegación; crea las habilitaciones anejas y los títulos de moto A/B/C.

8 preguntas (8 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2019-07-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2015-c3-t31 | sin fecha | 8 | `clase c\b` | …enecen a la clase: clase a clase b **clase c** clase f |
| and-2015-c3-t32 | sin fecha | 8 | `clase c\b` | …tenecen a la clase clase a clase b **clase c** clase f |
| and-2016-c2-t32 | 2016-06-18 | 8 | `clase c\b` | …es inflamables es: clase a clase b **clase c** clase d |
| and-2017-c1-t30 | 2017-04-01 | 8 | `clase c\b` | …uegos de la clase: clase b clase f **clase c** clase e |
| and-2017-c3-t32 | 2017-11-11 | 8 | `clase c\b` | …e clasifican como: clase a clase b **clase c** clase f |
| and-2018-c2-t11 | 2018-05-26 | 4 | `atribucion` | …on de embarcaciones de recreo ¿que **atribucion**es son complementarias?: navegar ha… |
| and-2018-c3-t30 | 2018-09-29 | 8 | `clase c\b` | …r liquidos inflamables es: clase f **clase c** clase b clase d |
| and-2018-c4-t12 | 2018-12-01 | 4 | `peninsula.{0,40}baleares`, `atribucion` | …asta 15 metros de eslora, entre la **peninsula iberica y las islas baleares** navegar, con una embarcacion de re… |

## RD 550/2020

Real Decreto 550/2020, de 2 de junio, por el que se determinan las condiciones de seguridad de las actividades de buceo. En vigor desde el 2020-07-01 ([BOE-A-2020-6745](https://www.boe.es/buscar/act.php?id=BOE-A-2020-6745)). Boya de señalización con bandera «Alfa»; distancia mínima de 50 m a la zona de buceo; deroga la Orden de 14-10-1997 de normas de seguridad subacuáticas.

2 preguntas (2 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2020-07-01; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2016-c2-t26 | 2016-06-18 | 6 | `buce` | …arcacion dedicada a operaciones de **buce**o. tiene la consideracion de "buque… |
| and-2018-c2-t26 | 2018-05-26 | 6 | `bandera "a"` | … fondeado es: un cilindro negro la **bandera "a"** del codigo internacional de senale… |

## RD 186/2023

Real Decreto 186/2023, de 21 de marzo, Reglamento de Ordenación de la Navegación Marítima (deroga la Orden de 2-7-1964 de zonas para bañistas). En vigor desde el 2023-04-11 ([BOE-A-2023-7410](https://www.boe.es/buscar/act.php?id=BOE-A-2023-7410)). Deroga la Orden de 1964 de zonas para bañistas (la regla de 200 m de playa y 50 m de costa a 3 nudos sigue en el art. 73 del Reglamento General de Costas) y regula el despacho de las embarcaciones de recreo.

42 preguntas (31 de PER, 11 de PY). Motivo común: la pregunta es anterior al 2023-04-11; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

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
| and-2015-c1-t12 | sin fecha | 4 | `playa`, `200 (m\|metros)`, `50 (m\|metros)` | limites a la navegacion en **playa**s balizadas. la navegacion esta pro… |
| and-2015-c2-t08 | sin fecha | 3 | `200 (m\|metros)`, `50 (m\|metros)` | … roja y paracaidas es: 100 metros. **200 m**etros. 300 metros. 250 metros. |
| and-2015-c2-t22 | sin fecha | 6 | `50 (m\|metros)` | …alcance y si su eslora es mayor de **50 m**etros una luz de tope. dos luces to… |
| and-2015-c2-t23 | sin fecha | 6 | `50 (m\|metros)` | …tiene su aparejo largado a mas de 1**50 m**etros. un buque de pesca al arrastr… |
| and-2015-c3-t24 | sin fecha | 6 | `50 (m\|metros)` | … la de proa. los buques menores de **50 m**etros de eslora, podran siempre fon… |
| and-2015-c3-q44 | sin fecha | 11 | `3 nudos` | … = 17-43. calcular la vhb. vhb = 5,**3 nudos**. vhb = 5,4 nudos. vhb = 7,1 nudos.… |
| and-2016-c1-t11 | 2016-04-09 | 4 | `banist`, `zona(s)? de bano`, `playa`, `200 (m\|metros)`, `50 (m\|metros)` | … sin restricciones, evitando a los **banist**as se puede navegar sin restriccion… |
| and-2016-c1-t14 | 2016-04-09 | 5 | `canal(es)? balizad` | entrando en puerto por un **canal balizad**o, por nuestra banda de estribor de… |
| and-2016-c3-t11 | 2016-11-19 | 4 | `50 (m\|metros)` | …es y vidrios sin triturar a mas de **50 m**illas, restos de plasticos y cabull… |
| and-2017-c1-t12 | 2017-04-01 | 4 | `playa`, `200 (m\|metros)` | …nes es verdadera: en los tramos de **playa** que no esten balizados no se puede… |
| and-2017-c1-t24 | 2017-04-01 | 6 | `50 (m\|metros)` | …opa en buques de eslora inferior a **50 m**etros podran estar combinadas en un… |
| and-2017-c2-t11 | 2017-06-17 | 4 | `zona(s)? de bano`, `playa`, `200 (m\|metros)`, `50 (m\|metros)` | en las proximidades de playas o **zonas de bano** no se podra navegar a menos de: 20… |
| and-2017-c2-t19 | 2017-06-17 | 6 | `50 (m\|metros)` | un buque de eslora inferior a **50 m**etros, sin arrancada y dedicado a l… |
| and-2017-c3-t08 | 2017-11-11 | 3 | `200 (m\|metros)`, `50 (m\|metros)` | …e: 100 metros 50 metros 300 metros **200 m**etros |
| and-2017-c3-t11 | 2017-11-11 | 4 | `3 nudos` | …de 2 millas de la costa y a mas de **3 nudos** de velocidad a mas de 3 millas de … |
| and-2017-c3-t12 | 2017-11-11 | 4 | `playa`, `200 (m\|metros)`, `50 (m\|metros)`, `3 nudos` | …acion y el fondeo en los tramos de **playa** que no esten balizados no se puede… |
| and-2018-c2-t26 | 2018-05-26 | 6 | `50 (m\|metros)` | …salvo que la eslora sea inferior a **50 m**, en cuyo caso solo exhibira una bo… |
| and-2018-c4-t16 | 2018-12-01 | 5 | `canal(es)? balizad` | entrando en puerto por un **canal balizad**o vemos un castillete rojo con una … |
| and-2019-c2-t11 | 2019-06-15 | 4 | `playa`, `50 (m\|metros)` | en las zonas de **playa**s balizadas ¿donde esta prohibida l… |
| and-2019-c2-t12 | 2019-06-15 | 4 | `3 nudos` | …a descarga de aguas sucias 2 nudos **3 nudos** 4 nudos |
| and-2019-c2-t15 | 2019-06-15 | 5 | `canal(es)? balizad` | entrando de noche en puerto por un **canal balizad**o llegamos a una boya que emite un … |
| and-2019-c3-t11 | 2019-11-23 | 4 | `playa` | …cen limitaciones a la navegacion?: **playa**s no balizadas proximidades de acan… |
| and-py-2021-c1-n15 | 2021-05-22 | 4 | `3 nudos` | …nta una corriente de rc =e e ihc = **3 nudos** asi como un viento del w que produ… |
| and-py-2015-c1-g06 | sin fecha | 1 | `200 (m\|metros)`, `50 (m\|metros)` | …ria. alcanzar una altura minima de **200 m**, lanzando la bengala con paracaida… |
| and-py-2015-c1-n15 | sin fecha | 4 | `3 nudos` | …,0'w se tiene corriente rc= e ihc= **3 nudos**, ra= 070º vhb= 6 nudos. desvio= 5 … |
| and-py-2015-c1-n16 | sin fecha | 4 | `3 nudos` | …, se tiene corriente rc= 058º ihc= **3 nudos**. calcular el rv rv= 110º rv= 087º … |
| and-py-2015-c3-n11 | sin fecha | 4 | `3 nudos` | …e tiene corriente rc = 210º e ihc =**3 nudos**. a hrb = 14-25 se toma da del fº d… |
| and-py-2015-c3-n16 | sin fecha | 4 | `3 nudos` | …dos, hay corriente rc = 095º ihc = **3 nudos**. calcular la distancia a pta. euro… |
| and-py-2015-c3-n19 | sin fecha | 4 | `3 nudos` | …os, hay corriente, rc = 090º ihc = **3 nudos**. calcular el ref. ref = 255º. ref … |
| and-py-2018-c1-n16 | 2018-03-14 | 4 | `3 nudos` | … tanger a hrb = 14:30. 143º vb = 6,**3 nudos** 155º vb = 5,5 nudos 137º vb = 6,3 … |
| and-py-2018-c2-n16 | 2018-06-12 | 4 | `3 nudos` | …geciras a hrb = 10:30. 339º vb = 8,**3 nudos** 323º vb = 8,8 nudos 349º vb = 8,3 … |
| and-py-2019-c1-g03 | 2019-04-06 | 1 | `200 (m\|metros)` | …a una altura minima de: 100 metros **200 m**etros 300 metros 400 metros |
| and-py-2019-c1-n18 | 2019-04-06 | 4 | `50 (m\|metros)` | …ado en la carta con una sonda de 1,**50 m**etros. adelanto vigente: +2 horas 2… |

## RD 1188/2025 (buceo y ROM)

Real Decreto 1188/2025, de 26 de diciembre: cambios en el RD 550/2020 de buceo, en el Reglamento de Ordenación de la Navegación Marítima y en el fondeo del Mar Menor. En vigor desde el 2025-12-31 ([BOE-A-2025-27010](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010)). Buceo (ratio 1:1 en bautismos, descompresión, profundidad en puertos), fondeo en el Mar Menor y artículos 43 y 45 del ROM.

5 preguntas (5 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2025-12-31; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2023-c3-t11 | 2023-10-21 | 4 | `buce` | …a franja diagonal blanca?: que hay **buce**adores sumergidos que se transporta… |
| and-2023-c3-t18 | 2023-10-21 | 6 | `buce` | …peligro y necesita ayuda que tiene **buce**adores en el agua y debemos darle s… |
| and-2024-c1-t20 | 2024-04-06 | 6 | `buce` | …nja. ¿que quiere indicar?: que hay **buce**adores en las inmediaciones que est… |
| and-2024-c1-t22 | 2024-04-06 | 6 | `buce` | …ia un peligro, como por ejemplo un **buce**ador sumergido no entiende las acci… |
| and-2016-c2-t26 | 2016-06-18 | 6 | `buce` | …arcacion dedicada a operaciones de **buce**o. tiene la consideracion de "buque… |

## RD 128/2022

Real Decreto 128/2022, de 15 de febrero, sobre instalaciones portuarias receptoras de desechos de buques. En vigor desde el 2022-02-17 ([BOE-A-2022-2465](https://www.boe.es/eli/es/rd/2022/02/15/128/con)). Deroga el RD 1381/2002 y la Orden FOM/1392/2004. Desaparece la notificación reducida de desechos (anexo V del RD 1381/2002) de las embarcaciones de recreo: la notificación previa (art. 16) no se aplica a las embarcaciones y buques de recreo de eslora inferior a 45 m, y todo buque entrega sus desechos en una instalación portuaria receptora antes de dejar el puerto (art. 17).

2 preguntas (2 de PER, 0 de PY). Motivo común: la pregunta es anterior al 2022-02-17; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.

| id | Fecha | UT | Detectores | Fragmento |
|---|---|---|---|---|
| and-2018-c2-t12 | 2018-05-26 | 4 | `notificacion reducida` | …n puerto espanol deben realizar la **notificacion reducida** de desechos prevista en el anexo v… |
| and-2018-c4-t11 | 2018-12-01 | 4 | `1381\/2002`, `notificacion reducida` | …sta en el anexo v del real decreto **1381/2002**, de 2 de diciembre?: toda embarcac… |

