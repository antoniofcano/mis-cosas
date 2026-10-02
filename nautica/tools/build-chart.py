#!/usr/bin/env python3
"""Construye data/chart-105.json a partir de tools/source/ (puntos y costa investigados).

Fuentes: carta IHM L105 Enseñanza (georreferenciada), NGA Pub. 113 List of Lights,
costa de OpenStreetMap (ODbL, © OpenStreetMap contributors). Ver tools/source/notes.md.
"""
import json, pathlib

SRC = pathlib.Path(__file__).parent / 'source'
OUT = pathlib.Path(__file__).parent.parent / 'data' / 'chart-105.json'

# Puntos que no se usan como marca para tomar demoras en los ejercicios generados.
NO_MARK = {'gibraltar-aero', 'boukhalf-aero', 'boya-getares', 'gibraltar-muelle-sur', 'penon-gibraltar',
           'jebel-musa', 'monte-hacho', 'punta-europa-cabo', 'punta-tarifa', 'bajo-cabezos', 'torre-de-la-pena',
           'punta-san-garcia', 'punta-chullera', 'ceuta-roja', 'tarifa-espigon', 'el-xarf', 'barbate-espigon',
           'algeciras-espigon', 'ceuta-bocana', 'tanger-espigon', 'punta-camarinal', 'torre-guadalmesi', 'punta-leona', 'isla-perejil'}
PORTS = {
    'barbate-espigon': ('Barbate', 'luz roja del espigón'),
    'algeciras-espigon': ('Algeciras', 'luz roja del espigón'),
    'ceuta-bocana': ('Ceuta', 'luz verde de la bocana'),
    'tanger-espigon': ('Tánger', 'farola del espigón'),
    'tarifa-espigon': ('Tarifa', 'luz verde del espigón'),
}
SHORT = {'punta-gracia': 'Pta. Gracia', 'punta-europa': 'Pta. Europa', 'isla-tarifa': 'Tarifa', 'barbate-faro': 'Barbate'}

points = []
for p in json.load(open(SRC / 'points.json')):
    q = {k: p[k] for k in ('id', 'name', 'type', 'lat', 'lon')}
    q['lat'] = round(q['lat'], 5); q['lon'] = round(q['lon'], 5)
    if p.get('light'): q['light'] = True; q['characteristic'] = p['light']
    if p.get('range_nm'): q['range_nm'] = p['range_nm']
    if p['id'] in NO_MARK: q['mark'] = False
    if p['id'] in PORTS: q['port'] = True; q['portName'], q['portLight'] = PORTS[p['id']]
    if p['id'] in SHORT: q['short'] = SHORT[p['id']]
    q['confidence'] = p.get('confidence')
    points.append(q)

es = json.load(open(SRC / 'coast_es.json'))
ma = json.load(open(SRC / 'coast_ma.json'))
islands = json.load(open(SRC / 'coast_islands.json'))
r = lambda line: [[round(x, 5), round(y, 5)] for x, y in line]
# Polígonos de tierra: costa + cierre por fuera de la carta.
land_es = r(es) + [[-5.0, 36.5], [-6.4, 36.5]]
land_ma = r(ma) + [[-5.0, 35.5], [-6.4, 35.5]]

data = {
    'id': 'L105',
    'name': 'Estrecho de Gibraltar (carta L105 Enseñanza)',
    'bounds': {'south': 35 + 40/60, 'north': 36 + 20/60, 'west': -(6 + 20/60), 'east': -(5 + 10/60)},
    'datum': 'ED50 (como la carta L105). WGS84 = ED50 − 0,08′ N − 0,07′ E',
    'declination': {'value': -(2 + 50/60), 'year': 2005, 'annualChange': 7/60, 'text': "2°50' W 2005 (7' E)"},
    'source': 'Puntos: carta IHM L105 Enseñanza (escaneo georreferenciado) y NGA Pub. 113. Costa: © OpenStreetMap contributors (ODbL), simplificada.',
    'points': points,
    'land': [land_es, land_ma] + [r(v) for v in islands.values()],
    'coastlines': [r(es), r(ma)],
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print(f'{OUT}: {len(points)} puntos, {OUT.stat().st_size} bytes')
