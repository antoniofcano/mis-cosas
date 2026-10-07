# Cambios revisados · grupo navegacion

Rama `feat/conceptos-cambios-navegacion` (desde origin/feat/conceptos). `data/conceptos/navegacion.json` pasa a `version` 2.
`npm run conceptos -- validar --sin-cobertura`: sin errores. `npm test` pasa; `npm run precache` y `node --check sw.js` hechos.

## Aplicado (por propuesta)
- Alta · fusión abatimiento + deriva: superviviente `nav.viento-corriente.abatimiento` («Abatimiento (viento) y deriva
  (corriente)»), sinónimos unidos (incluidos los de maniobra.agentes.abatimiento), nota nueva, clases + `per-7-6`,
  temario + PER UT 7.2. `nav.viento-corriente.deriva` → `sustituidoPor` abatimiento, y su sinónimo «ángulo Rv–Ref»
  corregido a «ángulo entre Rs y Ref (Rv–Ref si no hay viento)».
- Alta · `mareas.sonda-instante`: curva cosenoidal (C = A·sen²(90°·I/D), tabla oficial) como método oficial; doceavos solo
  aproximación (error de hasta ~2 % de la amplitud: sen²15° = 0,067 frente a 1/12 = 0,083); sinónimos añadidos; quitada
  «fórmula del coseno».
- Media · `nav.esfera.diferencias`: temario (anexo II ap. 4, UT 4.8) y nota (latitud media, ΔL).
- Media · partición `nav.luces.identificacion` → `nav.luces.faros-balizas` y `nav.luces.alcance-sectores`; el viejo pasa a grupo.
- Media · fusión `nav.ct.dm-desvio` → `nav.ct.convertir` (etiqueta, sinónimos, clases y temario según la propuesta);
  dm-desvio con `sustituidoPor`.
- Media · `carta.situacion.no-simultaneas` tit [py], solo clase py-4-4; `per-11-8` y sinónimo «marcaciones más tarde» a
  `carta.situacion.dos-demoras`.
- Media · `carta.situacion.traves`: renombrado (etiqueta, nota, sinónimos), clases per-11-3 y per-11-4, temario.
- Media · `nav.carta.tipos`: escalas en la nota (coinciden con las opciones oficiales de dgmm-per-2019-06-40) y aviso de
  la exclusión del temario.
- Media · `nav.cartas-electronicas.ecdis-papel`: nota reformulada solo con lo contrastado (ver abajo).
- Baja: `mareas.sonda-pleamar-bajamar` (sinónimos), `mareas.meteorologia` (nota), `carta.situacion.enfilacion` (veril),
  `carta.situacion.distancias` (nota acotada), `nav.gnss.siglas` (MOB → seguridad), `nav.rumbos.cuadrantal-circular`
  (sinónimos), `nav.aguja.declinacion-actualizar` («incremento anual»; «rosa de la carta» ya estaba),
  `nav.esfera.longitud` (quitado «este»), `nav.esfera.meridiano-lugar` (quitados «meridiano cero», «meridiano superior»),
  `nav.medidas.coeficiente-corredera` (nota), `nav.medidas.milla` (discrepancia and-2022-c3-t39 documentada),
  `nav.publicaciones.avisos` y `nav.aguja.declinacion` (temario), `nav.lp.fiabilidad` (nota), fusión
  `nav.hora.oficial` → `nav.hora.legal-husos` (etiqueta «Hora legal y hora oficial (huso y adelanto)»).

## NO aplicado / matizado
- Nota de ECDIS/papel: no se afirma que el recreo esté obligado a llevar carta de papel. Contrastado: SOLAS V/19.2.1
  (ECDIS aceptado como cartas, con respaldo, p. ej. cartas de papel) y V/27 (cartas y publicaciones adecuadas y
  actualizadas) según resúmenes de administraciones de bandera y OMI/OHI, no el texto de la OMI; RD 339/2021, art. 12.2.c
  (BOE-A-2021-8268): «cartas actualizadas que cubran los mares por los que se navegue y los portulanos», sin precisar
  soporte ni mencionar el ECDIS. Lo del papel queda atribuido al tribunal DGMM (dgmm-py-2020-12-24), no a la norma.
  Conviene que el responsable confirme el texto vigente de SOLAS V.
- Estima de la propuesta de mareas: «hasta ~2 %» es cálculo propio (la propuesta decía «unos cm»).
- Ejemplos de la propuesta de la partición de luces (bal-per-2017-07-b-39, bal-per-2018-04-b-41) no estaban en el piloto;
  solo se re-etiquetó bal-per-2020-07-c-37 (alcance-sectores).
- Sin cambio recomendado en la valoración: el resto de conceptos «ok».

## Piloto (437 preguntas) · recall (principal / todas las etiquetas)
| | @1 | @3 | @5 | @8 | MRR |
|---|---|---|---|---|---|
| Antes | 72,5 / 59,2 | 88,8 / 79,7 | 95,0 / 86,0 | 97,3 / 89,8 | 0,818 |
| Después | 71,9 / 58,6 | 90,8 / 79,6 | 95,2 / 86,4 | 97,0 / 89,6 | 0,818 |

Re-etiquetadas 8 preguntas: and-py-2015-c3-n15, bal-per-2020-10-i-41, dgmm-per-2021-07-89 (dm-desvio → convertir),
bal-per-2020-07-c-37 (→ alcance-sectores), bal-per-2025-12-c-45 (→ dos-demoras), bal-py-2019-04-b-25 y
dgmm-per-2022-04-38 (deriva → abatimiento), bal-py-2022-03-b-23 (hora.oficial → legal-husos). Las etiquetas de los
bancos (`data/ejes/*/conceptos.json`) no existen aún para este grupo.

## Para otro grupo
- nomenclatura-maniobra: `maniobra.agentes.abatimiento` debe llevar `sustituidoPor: "nav.viento-corriente.abatimiento"`.
  Hasta juntar ramas, `per-7-6` ya está en las clases del superviviente (clase existente). Sus preguntas de PER 7.2
  se re-etiquetan al superviviente.
- seguridad-legislacion: recibe las preguntas de PER sobre la tecla MOB (`seguridad.hombre-al-agua.gnss-mob`).
- Al juntar ramas: `npm run precache` (sw-lista.js chocará).
