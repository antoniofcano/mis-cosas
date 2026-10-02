# Estrecho de Gibraltar exam chart: dataset notes

## Which chart
The current PER/PY exam chart is the **IHM "L105 Enseñanza", Estrecho de Gibraltar**, subtitled "De Cabo Roche a Punta de la Chullera y de Cabo Espartel a Cabo Negro". Its imprint reads "© 2007 Instituto Hidrográfico de la Marina", and it was read from a free A3 scan: https://icarcamo.com/carta-del-estrecho-gratis-a3-en-pdf-para-ejercicios-de-nautica/.
- I found no edition numbered "102". Shops and schools sell it as "IHM L105" (it was formerly a reproduction of IHM chart 105).
- Scale 1:200 000 (at 36°00'), Mercator projection, soundings in metres.
- **Datum: Datum Europeo (Potsdam) = ED50.** The chart note says to shift WGS‑84 positions **0,08' N and 0,07' E** to plot them on this chart.
- **Limits (neat line): 36°20'N – 35°40'N, 006°20'W – 005°10'W.** These were read from the corner graticule labels.

## Magnetic declination printed on the chart
The compass rose reads **"2°50' W 2005 (7'E)"**. That means dm = 2°50'W in 2005, decreasing 7' per year towards the east.
- Formula: dm(year) = 2°50'W − 7'·(year − 2005). Examples: 2008 → 2°29'W, 2020 → 1°05'W, 2025 → 0°30'W, 2026 → 0°23'W.
- Older chart editions printed different values. Per https://personales.gestion.unican.es/martinji/Archivos/VariacionLocal.pdf, the 1970 DGMM reprint said 7°25,5'W (1970), decreasing 7' per year. The Oct‑1994 edition said 4°25'W (1994), decreasing 8' per year.

### Do exams give dm directly?
Mostly, yes. Recent official statements (Ministerio de Transportes PDFs) usually give one of these:
- **Ct (corrección total)** directly, e.g. "Ct = 2º(-)" or "corrección total de 4º(-)".
- **dm and desvío** with arbitrary didactic values, e.g. "La declinación magnética es 3°(W) y el desvío 3°(E)", "dm en la zona para ese día es de 2°(E)", "dm en toda la zona es de 5°(E)", or "dm 4ºNW y desvío 3ºW". (Nov 2024: https://cdn.transportes.gob.es/portal-web-transportes/maritimo/examenes_y_formacion/enunciados_examenes_recreo_noviembre_2024.pdf)
- Occasionally **"la declinación magnética es la de la carta para el año 2008"**, so the app should support computing dm from the rose (Dec 2020 test 04: https://cdn.transportes.gob.es/portal-web-transportes/maritimo/examenes-teoricos/examenes_recreo_diciembre_2020_v1.pdf).
- Some questions ask you to *find* Ct from an enfilación or oposición (e.g. Pta. Europa–Pta. Carnero, Pta. Alcázar–Pta. Paloma).

## Landmarks cited in official statements (2020–2024 samples)
Isla/Faro de Tarifa, Cabo Espartel, Punta Cires, Punta Europa, Punta Carnero, **Punta Carbonera**, Cabo Trafalgar, Puerto de Barbate, Punta Malabata, **Punta de Gracia**, **Punta Almina**, **Cabo Negro**, Punta Alcázar, Punta Paloma, Cabo Roche, **faro del dique del puerto de Tánger**, **El Xarf** (white sector of the Oc light), **luz roja del puerto de Ceuta**, **luz roja del puerto de Algeciras**, **boya cardinal Este de la Ensenada de Getares**, **espigón exterior del puerto de Tarifa**, and the isobaths of 50 m and 100 m.

## How positions were obtained (points.json)
- `lat`/`lon`/`latStr`/`lonStr` are in **chart datum (ED50, as drawn on L105)**. `lat_wgs84`/`lon_wgs84` are given where known.
- **Lights.** I started from the official **NGA Pub. 113 List of Lights** (MSI API, WGS84, to 0.01"), shifted it to chart datum, and checked it against a georeferenced 300‑dpi scan of L105. The scan was calibrated on all 10' graticule lines with piecewise interpolation, and its residual error is about 0,03–0,05'.
  - Most lights land on the chart's star symbol within 0,05'. Where the symbol was visibly offset I used the chart position: Cires +0,12'N; Malabata +0,16'N/−0,1'W; Almina +0,09'N; Alcázar −0,13'W; Cabo Negro ~+0,1'N, uncertain.
- **`light`** is the legend printed on L105, which is what an exam would use. **`light_list`** is the current NGA characteristic. They differ in places:
  - Cires: chart Fl(3)10s, NGA Fl(3)12s.
  - Cabo Negro: chart Oc.4s20M, NGA Fl(2+1)12s.
  - Europa: chart Iso.W & Oc.R 10s 19/15M, NGA Iso.W 10s 18M.
- **Non‑light features.** Punta Camarinal, Torre de Guadalmesí, Bajo de Los Cabezos, Algeciras red light, Getares cardinal buoy and the Gibraltar Fl 2s light were measured on the chart scan. The capes, islands and peaks come from OpenStreetMap nodes (WGS84, shifted).
- **Punta Gracia vs Camarinal.** The light is "Punta de Gracia" (Oc(2)W 5s 13M, 74–75 m, AIS) and stands near Torre de Gracia. On L105 the label "Punta Camarinal" sits about 1' SSE of the light, on the headland tip. Exam texts say "faro de Punta de Gracia", so use `punta-gracia` for bearings.
- **Punta Alcázar light** is the Ksar es Srhir mole head, Fl(4)W 12s 16 m 8M (NGA D2496). L105 shows it as Fl(4)12s8M.
- **Isla del Perejil.** The centroid is 35°54,9'N 005°25,1'W. One exam gives 35°54,8'N 005°25,1'W, which is still on the island.
- **Port lights.** Algeciras on L105 shows a single red dike light Fl(2)R 6s 8M. The current Algeciras lights differ: the port was rebuilt and NGA no longer lists Fl(2)R 6s. Use the chart value for exams.

## Validation against official exam answers (quick)
- Oposición Almina–Cabo Negro, 4,8 M from Cabo Negro → 35°46,0'N 005°16,5'W. The official option is c) 35°46,0'N 005°16,6'W.
- Oposición Alcázar–Paloma with Da Paloma 329°. True bearing is 329,5°, so Ct ≈ 0°, which matches the option given.
- Oposición Europa–Carnero with Da Carnero 250°. True bearing is 243,5°, so Ct ≈ −6,5°; the closest option is "5º−".

## Caveats
- Chart measurements come from a scanned A3 reduction of about 70%. One pixel is about 0,016'. Symbol reading adds roughly ±0,05'.
- The `confidence` field means: high = NGA plus visual chart agreement; medium = single source or approximate symbol reading; low = approximate (Getares buoy).
- **Not found / not included:** "Punta Santa Catalina" (Ceuta) is not labelled on L105 and has no OSM node, so I left it out. If needed, the N tip of the Almina peninsula is about 35°54,5'N 005°17,2'W (chart datum, low confidence, from the OSM coastline). I found no Libro de Faros (IHM) PDF; its download failed with 503/connection resets, so NGA was used.
- Coastline: see coast_meta.json. It is OSM (ODbL, attribution "© OpenStreetMap contributors") and shows today's ports, not the 2007 ones.

## Verificación de la costa con el escaneo de la L105 (2026-10)
La app usa la versión detallada de la costa OSM (coast_*_detail.json, Douglas-Peucker 0,002°, ±0,12′).
Proyectados sobre un escaneo de la L105 con la calibración de `data/carta-l105-calibracion.json`, sus
vértices caen sobre la tinta de la costa: distancia mediana 0,02′, percentil 90 0,07′, máximo 0,21′
(España 163 vértices, Marruecos 137). No se ha digitalizado la costa de la carta del IHM para no
redistribuir un derivado de una obra con derechos en un repositorio público; las diferencias son las
obras portuarias posteriores a 2007 (Algeciras, Tánger).
