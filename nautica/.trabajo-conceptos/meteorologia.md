# Conceptos · grupo meteorologia

Rama: feat/conceptos-meteorologia (desde origin/main). Alcance: PER UT 9 (per-9-*) y PY UT 2 (py-2-*). Prefijo de id: `meteo`.

## Hecho
- Temario: RD 875/2014, anexo II (texto consolidado BOE-A-2014-10344): PER apartado 3, UT 9 (9.1–9.7); PY apartado 4, UT 2 (2.1–2.8).
- Leídas las 16 clases y las 1280 preguntas del alcance (`ut` 9 del PER y `ut` 2 del PY en andalucia, dgmm y baleares;
  PER 577, PY 703; 55 + 79 no están en practica.json, sobre todo convocatorias recientes de DGMM/Baleares).
- `data/conceptos/meteorologia.json`: 107 nodos = 16 grupos + 91 conceptos (raíz `meteo`; grupos presion, temperatura,
  sistemas, viento, brisas, mar, prevision, frentes, modelos, regionales, humedad, nubes, nieblas, olas, corrientes).
- Piloto (conjunto oro): `.trabajo-conceptos/piloto-meteorologia.json`, 142 preguntas (11,1 % del alcance; muestra
  sistemática 1 de cada 9 por clase: and/per 16, dgmm/per 18, bal/per 30, and/py 35, dgmm/py 15, bal/py 28).
  Cobertura del piloto: 142/142 con concepto del catálogo (100 %).
- Buscador ingenuo de candidatos por sinónimos (script de trabajo, no publicado; ver «Cómo seguir»): 1277/1280 preguntas
  del alcance tienen al menos un candidato (las 3 restantes no son de meteorología, ver «Dudas»); en el piloto el
  concepto principal sale entre los 3 primeros candidatos en 129/142 (90,8 %). Ronda 2 añadió términos núcleo de
  enunciados reales a `sinonimos` y quitó «el viento» (demasiado genérico).

## Pendiente (siguiente fase, no de esta tarea)
- Etiquetar todo el alcance en `data/ejes/<eje>/<tit>/conceptos.json` (1–2 conceptos por pregunta).
- Revisión humana de las dudas.

## Dudas para revisión humana
- Preguntas con `ut` 9 que no son de meteorología: bal-per-2018-04-c-36 (desvío de la aguja → navegación),
  bal-per-2020-07-espf-33 y bal-per-2022-09-b-33 (derroteros → navegación/publicaciones), bal-per-2025-04-c-34
  (barlovento → nomenclatura). No se etiquetan con `meteo.*`.
- Respuestas oficiales dudosas: dgmm-per-2023-04-78, dgmm-per-2023-06-34 y dgmm-per-2022-06-78 (DGMM da por buena
  «más temperatura, más presión»; en meteorología el aire cálido suele dar presiones más bajas); bal-py-2026-06-b-18
  (llama geostrófico al viento por aceleración centrípeta en sistemas cerrados: eso es ciclostrófico/gradiente);
  bal-py-2017-03-a-13 (ciclostrófico = gradiente + Coriolis + centrífuga: eso es el viento de gradiente);
  dgmm-py-2024-11-16 (mar de fondo generada por «viento, marea y corrientes»); bal-py-2017-12-a-13 (céfiros como
  viento del Atlántico oriental).
- `temario: "pendiente"` en conceptos que no aparecen literalmente en el anexo: tendencia barométrica, dirección del
  viento, Buys-Ballot, dorsales/vaguadas, masas de aire, viento de gradiente, definición de niebla, altura significativa,
  mar de viento y mar de fondo.
- `tit` por lo que de verdad se pregunta: Buys-Ballot y mar de viento/fondo se enseñan en el PER (per-9-2, per-9-6)
  pero solo los pregunta el PY → tit ["py"]. Masas de aire y altura significativa → ["per","py"] porque Baleares PER
  las pregunta aunque no estén en el temario del PER.
- `meteo.viento.intensidad` (per) y `meteo.mar.factores` se solapan en la «intensidad» del 9.7: decidir si fusionar.

## Relaciones con otros grupos
- navegacion: corrientes de marea (`meteo.corrientes.marea`) ↔ mareas y cálculo de corrientes del PY (UT 4);
  corriente del Estrecho (`meteo.corrientes.estrecho`) ↔ problemas de carta con corriente; `meteo.viento.direccion`
  ↔ rosa/rumbos; desvío de la aguja y derroteros mal clasificados en UT 9 de Baleares.
- seguridad-legislacion: `meteo.prevision.radio` ↔ radiocomunicaciones/SMSSM/NAVTEX/LSD y Salvamento Marítimo
  (canal 16); visibilidad reducida (`meteo.nieblas.*`) ↔ conducta con visibilidad reducida (RIPA, balizamiento-ripa).
- nomenclatura-maniobra: `meteo.viento.veleta-catavientos` (catavientos en obenques/velas), barlovento/sotavento,
  `meteo.viento.real-aparente` ↔ maniobra a vela (ceñir, popa).
- balizamiento-ripa: señales acústicas en niebla ↔ `meteo.nieblas.definicion`.

## Cómo seguir
- El catálogo se genera con un script de trabajo (gen.py en el scratchpad de la sesión): si se pierde, editar el JSON
  a mano; los ids publicados no se cambian.
- Buscador: normalizar enunciado + opciones (minúsculas, sin tildes), buscar `etiqueta` y `sinonimos` como frases;
  puntuar por nº de palabras coincidentes. Conviene dar más peso a enunciado + opción correcta que a las demás opciones
  (las opciones de los modelos de viento citan todos los modelos y confunden al buscador).
