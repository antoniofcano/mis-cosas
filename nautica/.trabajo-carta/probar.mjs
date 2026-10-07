// Prueba las soluciones de carta de un fichero contra la respuesta oficial de Baleares, con las mismas reglas que
// tests/exams.test.js:
//   - la opción elegida (la más próxima a lo calculado) tiene que ser la oficial;
//   - PY: la oficial gana con claridad (≤ 2 tolerancias por valor y la segunda a más del doble);
//   - PY: `sinCarta: true` si y solo si la solución no dibuja nada en la carta.
// Uso: node nautica/.trabajo-carta/probar.mjs src/exams/solutions/baleares-per-03.js   (desde la raíz del repo o nautica/)
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const NAUTICA = join(dirname(fileURLToPath(import.meta.url)), '..');
const { createKit } = await import(join(NAUTICA, 'src/exams/kit.js'));
const { chooseOption } = await import(join(NAUTICA, 'src/exams/options.js'));
const { createChart } = await import(join(NAUTICA, 'src/chart/chart.js'));
const chart = createChart(JSON.parse(readFileSync(join(NAUTICA, 'data/chart-105.json'), 'utf8')));
const preguntas = new Map(['per', 'py'].flatMap((t) => JSON.parse(readFileSync(join(NAUTICA, `data/ejes/baleares/${t}/preguntas.json`), 'utf8')).preguntas).map((q) => [q.id, q]));

const arg = process.argv[2];
const ruta = [resolve(arg), join(NAUTICA, arg), join(NAUTICA, '..', arg)].find((r) => { try { readFileSync(r); return true; } catch { return false; } });
const sol = (await import(pathToFileURL(ruta).href)).default;
let fallos = 0;
for (const [id, s] of Object.entries(sol)) {
  const q = preguntas.get(id);
  if (!q) { console.log(`✗ ${id}: no existe en el banco`); fallos++; continue; }
  try {
    const k = createKit(chart);
    const values = s.solve(k, q);
    const r = chooseOption(q.opciones, values);
    const sc = Object.entries(r.scores).map(([a, b]) => `${a}:${Number.isFinite(b) ? b.toFixed(2) : '∞'}`).join(' ');
    const calc = values.map((v) => `${v.kind}=${+v.value.toFixed(3)}`).join(' ');
    const problemas = [];
    if (r.choice !== q.correcta) problemas.push(`elige ${r.choice}, oficial ${q.correcta}`);
    if (q.tit === 'py') {
      const o = Object.values(r.scores).sort((a, b) => a - b);
      if (o[0] / values.length > 2) problemas.push(`lejos de la opción (${o[0].toFixed(2)})`);
      if (o[1] < 2 * o[0]) problemas.push(`dos opciones casi empatadas (${o[0].toFixed(2)} / ${o[1].toFixed(2)})`);
      if (!k.items.length !== !!s.sinCarta) problemas.push(k.items.length ? 'dibuja en la carta pero lleva sinCarta' : 'no dibuja nada: márcala sinCarta: true');
    }
    if (!s.ejercicio) problemas.push('falta «ejercicio»');
    if (problemas.length) fallos++;
    console.log(`${problemas.length ? '✗' : '✓'} ${id} ${calc} | ${sc}${problemas.length ? ` | ${problemas.join('; ')}` : ''}`);
  } catch (e) {
    fallos++;
    console.log(`✗ ${id}: error ${e.message}`);
  }
}
console.log(`${Object.keys(sol).length} soluciones, ${fallos} con problemas`);
process.exit(fallos ? 1 : 0);
