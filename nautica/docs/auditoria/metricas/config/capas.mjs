import fs from 'node:fs';
const g = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const capa = (f) => (f.includes('/') ? f.split('/')[0] : '(raiz)');
const m = {};
const ej = {};
let aristas = 0;
const fanIn = {}, fanOut = {};
for (const [f, deps] of Object.entries(g)) {
  fanOut[f] = deps.length;
  for (const d of deps) {
    aristas++;
    fanIn[d] = (fanIn[d] || 0) + 1;
    const a = capa(f), b = capa(d);
    if (a === b) continue;
    m[a] ??= {}; m[a][b] = (m[a][b] || 0) + 1;
    ej[a + '>' + b] ??= f + ' -> ' + d;
  }
}
console.log('modulos', Object.keys(g).length, 'aristas', aristas);
console.log('== capa -> capa (n imports)');
for (const a of Object.keys(m).sort()) console.log(a.padEnd(14), Object.entries(m[a]).sort((x, y) => y[1] - x[1]).map(([b, n]) => `${b}:${n}`).join(' '));
// ciclos entre capas
console.log('== pares de capas con dependencia mutua');
const vistos = new Set();
for (const a of Object.keys(m)) for (const b of Object.keys(m[a])) if (m[b]?.[a] && !vistos.has(b + a)) { vistos.add(a + b); console.log(`${a} <-> ${b}  (${m[a][b]} / ${m[b][a]})  ej: ${ej[a + '>' + b]}  |  ${ej[b + '>' + a]}`); }
console.log('== violaciones: no-ui que importa ui');
for (const [f, deps] of Object.entries(g)) if (capa(f) !== 'ui') for (const d of deps) if (capa(d) === 'ui') console.log(f, '->', d);
console.log('== no-ui que importa store');
for (const [f, deps] of Object.entries(g)) if (capa(f) !== 'ui' && capa(f) !== 'store') for (const d of deps) if (capa(d) === 'store') console.log(f, '->', d);
console.log('== top fan-in'); console.log(Object.entries(fanIn).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([f, n]) => `${n} ${f}`).join('\n'));
console.log('== top fan-out'); console.log(Object.entries(fanOut).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([f, n]) => `${n} ${f}`).join('\n'));
console.log('== sin importadores (posible código muerto o entrada)');
console.log(Object.keys(g).filter((f) => !fanIn[f]).join('\n'));
