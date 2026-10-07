# Cambios aplicados: seguridad-legislacion (versión 1 → 2)

Rama `feat/conceptos-cambios-seguridad-legislacion`, desde `origin/feat/conceptos`. Todas las citas se han
contrastado con el texto consolidado del BOE (API de datos abiertos, `legislacion-consolidada/id/<id>/texto`) o con
el BOE diario en el caso de las normas modificadoras. Las notas las he redactado yo y, donde la propuesta no cuadraba
del todo con la norma, he corregido la redacción (se indica abajo).

Normas consultadas: RD 210/2004 (BOE-A-2004-2752), RD 186/2023 (BOE-A-2023-7410), RD 339/2021 (BOE-A-2021-8268),
RD 587/2022 (BOE-A-2022-12013), RD 128/2022 (BOE-A-2022-2465), RD 550/2020 (BOE-A-2020-6745), RD 1188/2025
(BOE-A-2025-27010), RD 875/2014 (BOE-A-2014-10344), RD 701/2016 (BOE-A-2016-12273), Ley 14/2014 (BOE-A-2014-7877),
RD 2335/1980 (BOE-A-1980-23701), RD 876/2014 (BOE-A-2014-10345), RD 191/2026 (BOE-A-2026-5877), RD 1434/1999
(BOE-A-1999-18663), TRLPEMM (BOE-A-2011-16467), Orden FOM/1144/2003 (BOE-A-2003-9581), Ley 3/2001
(BOE-A-2001-6008), Ley 5/2023 (BOE-A-2023-7052). Capacidad mínima de las balsas: Código IDS, 4.1.2.1 (resolución
OMI MSC.48(66)) y alcance de la ISO 9650-1:2022 («carrying capacity of 4 persons to 16 persons»).

## Aplicado

| Propuesta | Concepto | Qué se ha hecho |
|---|---|---|
| alta · nota | `legis.puertos.trafico` | Nota con el art. 46.2 del RD 186/2023 (recreo < 20 m y artefactos no estorban el tránsito en aguas de servicio de puertos comerciales) y 46.1 (rige el RIPA). |
| media · sinónimos | `legis.puertos.trafico` | «eslora inferior a 20 metros» → «embarcaciones de recreo de menos de 20 metros»; «preferencia de los buques comerciales» → «no estorbar el tránsito en aguas de servicio». |
| alta · nota | `legis.notificacion-sucesos` | Art. 17 del RD 210/2004 (no el 19, que son medidas de la Administración) y art. 2.3 (recreo < 45 m: solo arts. 17–25). Quitada la cita genérica a la Ley 14/2014. Añadido qué sucesos y qué datos lleva el aviso (art. 17.1 y 17.2). |
| alta · nota | `legis.buceo.distancia` | RD 550/2020, art. 14.2 (50 m, salvo la de apoyo; según el RIPA) y art. 2.r (boya con bandera «Alfa»). Quitado «modificado por el RD 1188/2025»: comprobado que el art. 14 no lo modificó. |
| alta · nota | `legis.aguas-sucias.prohibicion` | Zona 7 (art. 3.1.g) y art. 23 del RD 339/2021; antes, Orden FOM/1144/2003, art. 24.1. **Corrección mía**: añadidas las excepciones del art. 23.3 (seguridad de las personas, avería). |
| alta · nota | `legis.desechos-puerto` | RD 128/2022: arts. 16.1 y 17.1, deroga el RD 1381/2002. Quitado «ya no hay notificación reducida anual». **Corrección mía**: el art. 17.5 permite salir sin entregar si hay capacidad de almacenamiento suficiente hasta el siguiente puerto; decir «entrega todos» a secas era inexacto. |
| alta · nota | `seguridad.equipo.balsa-dotacion` | Art. 6 en la redacción del RD 587/2022 (art. 8 de este, comprobado en el BOE diario): personas a bordo, ISO 9650 u otra norma homologada por la DGMM en zonas 1–3, revisión según el fabricante (24 meses máx. solo en uso comercial). Capacidades mínimas atribuidas a las normas técnicas, con su fuente: ISO 9650-1, 4; SOLAS (Código IDS 4.1.2.1), 6. |
| media · nota | `seguridad.equipo.chalecos-dotacion` | «luz obligatoria» → se puede prescindir de la luz en zonas 4–7 con navegación exclusivamente diurna (art. 7.1). |
| media · nota | `seguridad.equipo.homologacion` | Certificación según el RD 701/2016 por organismo notificado (art. 5), chalecos EPI (art. 7.5), balsas ISO homologadas por la DGMM (art. 6.2), obligaciones del art. 4, infracción grave del art. 24.2.b con la lista de equipos que cita. He quitado «equipo SOLAS o no SOLAS» de la nota (no lo distingue así el RD 339/2021); el sinónimo «SOLAS» sigue. |
| media · nota | `seguridad.equipo.otros` | Ya no se enumeran corredera, compás de puntas, transportador ni regla (sí los listaba la Orden FOM/1144/2003, art. 12); en zonas 1–4, «los útiles necesarios para su uso» con las cartas (art. 12.2.c); su falta es infracción grave (art. 24.2.a, 12.º). |
| media · nota | `legis.titulos.atribuciones` | Art. 10 del RD 875/2014 en la redacción del RD 1188/2025 (en vigor el 1-10-2026): motor ≤ 5 m y 15 CV sin reductor (uso privado), vela ≤ 6 m (uso deportivo), artefactos; ≤ 2 millas del puerto, marina o playa de salida; diurna; 18 años; motos náuticas excluidas. «Quien alquila necesita título»: lo dice el preámbulo del RD 1188/2025. |
| media · nota | `legis.pabellon.nacional` | RD 2335/1980, arts. 1, 2 y 4 (añadido «o fortaleza», que está en el art. 4). Discrepancia de Baleares (gallardete, bal-per-2020-12-c-11) escrita como tal en la nota. Se conserva el sinónimo «gallardete del club» para que el buscador encuentre esa pregunta. |
| media · nota | `legis.pabellon.autonomica` | RD 2335/1980, arts. 2 y 3: puertos nacionales y aguas interiores, a la vez que la nacional, nunca en asta de popa ni pico, ≤ 1/3 del área. |
| media · nota | `legis.aguas-sucias.retencion` | Nota reescrita con el art. 22: no aplica con marcado CE (22.1); uno de los tres equipos (22.3); conexión universal si el depósito es fijo y válvulas herméticas en los conductos de descarga al mar (22.4). |
| media · nota | `legis.reservas-marinas` | Ley 14/2014, arts. 20 y 21, citados con su texto («fuera de las zonas de servicio de los puertos», no «fuera de los puertos»). **Corrección mía**: la propuesta citaba la Ley 3/2001 para las reservas marinas, pero su art. 14 está derogado por la Ley 5/2023; cito la Ley 5/2023 de pesca sostenible e investigación pesquera, art. 22 (reservas marinas de interés pesquero; pueden limitar también la navegación). |
| baja · nota | `legis.contaminacion.responsabilidad` | TRLPEMM, art. 310.2.d. **Corrección mía**: la nota decía «naviero o propietario»; la ley dice naviero, propietario, asegurador y capitán, todos solidarios, y obligados a reparar el daño. |
| baja · nota | `legis.espacios.posidonia` | RD 191/2026, art. 5 (prohibición general, arena próxima si cadena o borneo afectan, solo sistemas de bajo impacto autorizados; excepciones de fuerza mayor o peligro). Ámbito Mediterráneo (art. 1.2) y vigencia 2-4-2026 comprobados. |
| baja · nota | `legis.embarcacion.certificado-navegabilidad` | RD 1434/1999 (vigente según el BOE), art. 3: cada 5 años como máximo para 6–24 m en lista 7.ª; < 6 m de lista 7.ª, exentas y «sin caducidad». |
| — | grupo | `version` 1 → 2. |

No hay particiones ni fusiones en este grupo: el piloto no necesita re-etiquetado (tampoco cita ninguno de los ids
que se parten o se fusionan en otros grupos).

## NO aplicado (para el responsable)

1. **`estabilidad.equilibrio` · tit `["py"]` → `["per","py"]`** (baja). La valoración lo marca como **duda**
   («si se prefiere no tocarlo, es una sola pregunta»). Comprobado que bal-per-2017-09-e-07 existe en el banco de
   Baleares PER. Aplicarlo es coherente con la decisión «la titulación se decide por lo que se pregunta»; falta el sí
   del responsable. Si se aplica, revisar `clases` (hoy solo `py-1-2`).
2. **`legis.zona-bano.balizada` · nota** (baja). La valoración lo marca como **duda**. He comprobado la norma: el
   RD 876/2014, art. 73.1, solo dice que en zona de baño balizada no se navega y que el lanzamiento y la varada se
   hacen por canales señalizados. **La nota actual afirma como norma estatal algo que no está** («si no hay canal,
   perpendicular a la playa a mínima velocidad»); la propuesta lo corrige y es exacta. Recomiendo aprobarla.
3. **`legis.aguas-sucias.descarga` · «(con la Orden FOM/1144/2003 eran 4 millas para las tratadas)»** (baja). **No
   cuadra**: 4 millas era la redacción original del art. 24.2.a de la Orden; la Orden FOM/1076/2006 la cambió a 3
   millas, que es lo que estuvo vigente hasta su derogación por el RD 339/2021. Si se quiere la nota histórica, la
   redacción exacta sería «(la Orden FOM/1144/2003 decía 4 millas en su redacción original; desde la Orden
   FOM/1076/2006, 3, como ahora)».

## Recall del piloto (`piloto-seguridad-legislacion.json`, 187 preguntas, 205 etiquetas)

| | recall@1 principal | recall@1 todas | recall@3 | recall@5 | MRR |
|---|---|---|---|---|---|
| Antes | 85,6 % | 82,0 % | 98,9 % / 98,5 % | 100 % / 100 % | 0,919 |
| Después | 85,0 % | 81,5 % | 98,9 % / 98,5 % | 100 % / 100 % | 0,916 |

Baja una pregunta en @1 (las notas largas con citas diluyen un poco el texto que pesa en el buscador); @3 y @5
no cambian.

## Para otros grupos

- **balizamiento-ripa**: al partir `ripa.luces.draga-buceo`, el hijo `ripa.luces.buceo` puede llevar
  `relacionados: ["legis.buceo.distancia", "legis.buceo.banderas"]`. No lo he puesto desde este lado porque el id
  no existe hasta juntar las ramas; cuando exista, conviene añadir `ripa.luces.buceo` a los `relacionados` de
  `legis.buceo.distancia`.
- **nomenclatura-maniobra**: sus relacionados con `seguridad.mal-tiempo.costa-sotavento` y
  `seguridad.hombre-al-agua.primeras-acciones` apuntan a ids que siguen existiendo aquí sin cambios.
- **navegacion**: la nota de `nav.gnss.siglas` remite a `seguridad.hombre-al-agua.gnss-mob`, que sigue existiendo.
- Ley 14/2014, art. 22.1 (pabellón izado en aguas interiores y surto en puerto) podría completar
  `legis.pabellon.nacional`; no estaba en la propuesta y no lo he añadido.
