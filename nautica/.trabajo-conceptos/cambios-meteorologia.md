# Cambios aplicados · grupo meteorologia

Rama: feat/conceptos-cambios-meteorologia (desde origin/feat/conceptos). `data/conceptos/meteorologia.json` pasa a `version` 2 (111 nodos).
Validación `npm run conceptos -- validar --sin-cobertura`: sin errores. `npm test`: 1853 pasan, 0 fallan. Comprobado en el BOE (RD 875/2014, texto consolidado BOE-A-2014-10344, anexo II) que la escala de Beaufort está en 9.5 Viento y que 9.7 Mar dice «Intensidad, persistencia y fecht»; PY 2.x no cita masas de aire.

## Aplicado (por propuesta)
- Fusión meteo.viento.intensidad + meteo.mar.factores (alta): sobrevive meteo.mar.factores con etiqueta, nota y 4 sinónimos nuevos; clases [per-9-6, py-2-8] (sin per-9-3), tit [per, py]. meteo.viento.intensidad lleva `sustituidoPor` y nota «Retirado», sin relacionados.
- Fusión meteo.frentes.masas-aire en meteo.frentes.definicion (media): etiqueta, nota y sinónimos de la superviviente; masas-aire con `sustituidoPor`.
- tit solo ["per"] en meteo.presion.valor-normal y meteo.sistemas.trayectoria (media); en trayectoria se quita «velocidad de traslación» de la nota.
- clases [] en meteo.olas.altura-significativa (media).
- Padre de meteo.mar.beaufort pasa a meteo.viento (baja).
- Renombrado de meteo.regionales.identificacion (etiqueta y nota; se quita el sinónimo «no es un viento del Mediterráneo») (baja).
- Nota de meteo.regionales.rosa con la regla de etiquetado (media).
- Partición de meteo.corrientes.atlantico en meteo.corrientes.cantabrico y meteo.corrientes.portugal-canarias (media); el viejo pasa a grupo y es el padre de los dos nuevos (según CONCEPTOS.md; la propuesta decía padre meteo.corrientes).
- Partición de meteo.corrientes.mediterraneo en meteo.corrientes.mediterraneo-occidental y meteo.corrientes.mediterraneo-central (media); mismo criterio de padre. meteo.corrientes.estrecho enlaza con los tres nuevos.
- meteo.corrientes.estrecho: nota con la discrepancia de intensidad (baja).
- meteo.olas.partes (se quita amplitud de nota y sinónimos), olas.altura y olas.periodo: notas (baja).
- Sinónimos: presion.gradiente, presion.gradiente-calculo (+ nota 60 M, comprobada: 4/120x60 = 2, 4/40 = 0,1), presion.tendencia, sistemas.buys-ballot, modelos.geostrofico, modelos.euler (baja).
- Notas (baja): nieblas.definicion (+ sinónimos), nubes.altura, sistemas.dorsal-vaguada, regionales.calidos-sur, viento.racha, prevision.fuentes (discrepancias documentadas con las preguntas citadas, comprobadas una a una en los bancos).

## NO aplicado y por qué (lista para el responsable)
1. meteo.temperatura.definicion (reescribir nota, media): la valoración la marca «duda» y dice que la contradicción entre DGMM y Baleares «conviene decidir». Pendiente de decisión sobre cómo documentar la discrepancia T-p.
2. Fusión meteo.prevision.importancia en meteo.presion.tendencia (baja): propuesta «opcional» y valoración en «duda»; no está entre las fusiones aprobadas.
3. Parte de la propuesta de meteo.olas.partes: no se ha escrito «las tres primeras son independientes y de medida directa». Periodo y longitud no son independientes (en aguas profundas L = g·T²/2π) y contradice la nota de olas.periodo. Hay que revisar qué opción del banco lo dice.
4. Última propuesta («sin cambio de catálogo», discrepancias de respuesta oficial en circulacion/geostrofico): no hay cambio que aplicar; las discrepancias nuevas ya están en las notas de los conceptos respectivos, y las antiguas siguen en `.trabajo-conceptos/meteorologia.md`.
5. Cifra «rara vez pasa de 1 nudo» (propuesta de meteo.corrientes.cantabrico): no la he podido contrastar con una fuente; se ha dejado «Débil, irregular…». El «hasta 6 nudos / 4 a 7 nudos» del Estrecho se documenta solo como discrepancia con la clase (2 nudos), sin corregir la clase.

## Piloto
Re-etiquetadas 6 preguntas (las otras citas de los ids retirados no existían en el piloto): dgmm-py-2021-02-20, and-py-2024-c3-g20 y dgmm-py-2025-04-19 a portugal-canarias; dgmm-py-2024-04-17 y and-py-2026-c2-g20 a cantabrico; bal-py-2021-03-ac-16 a mediterraneo-central. Las preguntas de factores (bal-per-2017-03-ge-36, bal-per-2018-09-a-36) siguen igual.

Recall (142 preguntas, 157 etiquetas):
| | recall@1 principal | recall@5 principal | todas @1 | todas @5 | MRR |
|---|---|---|---|---|---|
| antes | 81,7 % | 99,3 % | 75,8 % | 99,4 % | 0,897 |
| después | 81,7 % | 100,0 % | 74,5 % | 99,4 % | 0,896 |

## Para otro grupo / otras rutas
- No hay etiquetas en `data/ejes/*/*/conceptos.json` todavía: nadie cita los ids retirados ni los grupos nuevos fuera del piloto. Al etiquetar, usar los hijos nuevos y no los grupos meteo.corrientes.atlantico / meteo.corrientes.mediterraneo.
- Preguntas que las propuestas mandan a otro concepto: dgmm-per-2021-02-79 y bal-per-2018-04-a-34 (intensidad = función del gradiente) a meteo.presion.gradiente; bal-per-2018-12-c-33 (masas de aire) a presion.gradiente o sistemas.circulacion; dgmm-per-2023-11-81, bal-per-2019-06-a-34 y and-2024-c1-t34 a meteo.mar.factores.
- Curso (fuera del catálogo): py-2-8 no enseña la altura significativa (añadir un párrafo y entonces restituir clases [py-2-8]); py-2-9 dice «en torno a 2 nudos» para el Estrecho frente a los bancos de Baleares.
- Avisos del validador que quedan (no son errores): valor-normal y trayectoria conservan clases py-2-1 aunque tit sea solo per (así lo pide la propuesta); altura-significativa sin clases; masas-aire retirada tiene tit más ancho que su padre.
