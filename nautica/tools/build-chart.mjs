#!/usr/bin/env node
// Construye data/chart-105.json a partir de tools/source/ (puntos y costa investigados).
// Fuentes: carta IHM L105 Enseñanza (georreferenciada), NGA Pub. 113 List of Lights,
// costa de OpenStreetMap (ODbL, © OpenStreetMap contributors). Ver tools/source/notes.md.
// Uso: node tools/build-chart.mjs

import { readFileSync, writeFileSync, statSync } from 'node:fs';

const src = (f) => JSON.parse(readFileSync(new URL(`./source/${f}`, import.meta.url)));
const OUT = new URL('../data/chart-105.json', import.meta.url);

// Puntos que no se usan como marca para tomar demoras en los ejercicios generados.
const NO_MARK = new Set(['gibraltar-aero', 'boukhalf-aero', 'boya-getares', 'gibraltar-muelle-sur', 'penon-gibraltar',
  'jebel-musa', 'monte-hacho', 'punta-europa-cabo', 'punta-tarifa', 'bajo-cabezos', 'torre-de-la-pena',
  'punta-san-garcia', 'punta-chullera', 'ceuta-roja', 'tarifa-espigon', 'el-xarf', 'barbate-espigon',
  'algeciras-espigon', 'ceuta-bocana', 'tanger-espigon', 'punta-camarinal', 'torre-guadalmesi', 'punta-leona', 'isla-perejil']);
const PORTS = {
  'barbate-espigon': ['Barbate', 'luz roja del espigón'],
  'algeciras-espigon': ['Algeciras', 'luz roja del espigón'],
  'ceuta-bocana': ['Ceuta', 'luz verde de la bocana'],
  'tanger-espigon': ['Tánger', 'farola del espigón'],
  'tarifa-espigon': ['Tarifa', 'luz verde del espigón'],
};
const SHORT = { 'punta-gracia': 'Pta. Gracia', 'punta-europa': 'Pta. Europa', 'isla-tarifa': 'Tarifa', 'barbate-faro': 'Barbate' };
const r5 = (x) => Math.round(x * 1e5) / 1e5;

const points = src('points.json').map((p) => {
  const q = { id: p.id, name: p.name, type: p.type, lat: r5(p.lat), lon: r5(p.lon) };
  if (p.light) { q.light = true; q.characteristic = p.light; }
  if (p.range_nm) q.range_nm = p.range_nm;
  if (NO_MARK.has(p.id)) q.mark = false;
  if (PORTS[p.id]) { q.port = true; [q.portName, q.portLight] = PORTS[p.id]; }
  if (SHORT[p.id]) q.short = SHORT[p.id];
  q.confidence = p.confidence ?? null;
  return q;
});

const line = (l) => l.map(([x, y]) => [r5(x), r5(y)]);
const es = line(src('coast_es.json'));
const ma = line(src('coast_ma.json'));
const islands = Object.values(src('coast_islands.json')).map(line);

const data = {
  id: 'L105',
  name: 'Estrecho de Gibraltar (carta L105 Enseñanza)',
  bounds: { south: 35 + 40 / 60, north: 36 + 20 / 60, west: -(6 + 20 / 60), east: -(5 + 10 / 60) },
  datum: 'ED50 (como la carta L105). WGS84 = ED50 − 0,08′ N − 0,07′ E',
  declination: { value: -(2 + 50 / 60), year: 2005, annualChange: 7 / 60, text: "2°50' W 2005 (7' E)" },
  source: 'Puntos: carta IHM L105 Enseñanza (escaneo georreferenciado) y NGA Pub. 113. Costa: © OpenStreetMap contributors (ODbL), simplificada.',
  points,
  // Polígonos de tierra: costa + cierre por fuera de la carta.
  land: [[...es, [-5.0, 36.5], [-6.4, 36.5]], [...ma, [-5.0, 35.5], [-6.4, 35.5]], ...islands],
  coastlines: [es, ma],
};
writeFileSync(OUT, JSON.stringify(data));
console.log(`${OUT.pathname}: ${points.length} puntos, ${statSync(OUT).size} bytes`);
