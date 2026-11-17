// Resume el informe de cobertura de node --test (reporter spec): por directorio y ficheros sin cargar.
import fs from 'node:fs';
import path from 'node:path';
const [, , informe, raiz] = process.argv;
const L = fs.readFileSync(informe, 'utf8').split('\n');
const ini = L.findIndex((l) => l.includes('start of coverage report'));
const fin = L.findIndex((l) => l.includes('end of coverage report'));
const pila = [];
const fich = {};
for (const l of L.slice(ini + 1, fin)) {
  const m = /^ℹ (\s*)(\S.*?)\s+\|\s*([\d.]*)\s*\|\s*([\d.]*)\s*\|\s*([\d.]*)\s*\|/.exec(l);
  if (!m) continue;
  const prof = m[1].length;
  const nombre = m[2].trim();
  if (nombre === 'file' || nombre.startsWith('all files') || /^-+$/.test(nombre)) { if (nombre.startsWith('all')) console.log('TOTAL (solo ficheros cargados por algún test): líneas', m[3], 'ramas', m[4], 'funciones', m[5]); continue; }
  pila.length = prof; pila[prof] = nombre;
  if (m[3] !== '') fich[pila.filter(Boolean).join('/')] = { lin: +m[3], ram: +m[4], fun: +m[5] };
}
const todos = [];
const rec = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'vendor') rec(p); } else if (e.name.endsWith('.js')) todos.push(path.relative(raiz, p)); } };
rec(path.join(raiz, 'src'));
const nl = (f) => fs.readFileSync(path.join(raiz, f), 'utf8').split('\n').length;
const dir = {};
let cargLin = 0, totLin = 0, cubLin = 0;
const sin = [];
for (const f of todos) {
  const d = f.split('/').slice(0, f.startsWith('src/ui/') ? 2 : 2).join('/');
  const n = nl(f); const c = fich[f];
  dir[d] ??= { n: 0, carg: 0, lin: 0, cub: 0, linCarg: 0 };
  dir[d].n++; dir[d].lin += n; totLin += n;
  if (c) { dir[d].carg++; dir[d].cub += n * c.lin / 100; dir[d].linCarg += n; cargLin += n; cubLin += n * c.lin / 100; } else sin.push([n, f]);
}
console.log('ficheros src:', todos.length, ' cargados por tests:', todos.length - sin.length, ' nunca cargados:', sin.length);
console.log('líneas src:', totLin, ' en ficheros cargados:', cargLin, ' cubiertas (aprox):', Math.round(cubLin), ' => cobertura real de líneas ≈', (100 * cubLin / totLin).toFixed(1) + '%');
console.log('== por directorio: ficheros cargados/total · % líneas cubiertas sobre TODO el directorio · % sobre lo cargado');
for (const [d, v] of Object.entries(dir).sort((a, b) => b[1].lin - a[1].lin)) console.log(d.padEnd(22), `${v.carg}/${v.n}`.padStart(8), (100 * v.cub / v.lin).toFixed(0).padStart(4) + '%', (v.linCarg ? (100 * v.cub / v.linCarg).toFixed(0) : '-').padStart(4) + '%', String(v.lin).padStart(6), 'líneas');
sin.sort((a, b) => b[0] - a[0]);
console.log('== nunca cargados por ningún test (líneas, fichero): total líneas', sin.reduce((a, b) => a + b[0], 0));
console.log(sin.slice(0, 45).map(([n, f]) => `${n} ${f}`).join('\n'));
console.log('== cargados con menor cobertura de líneas');
console.log(Object.entries(fich).filter(([f]) => f.startsWith('src/')).sort((a, b) => a[1].lin - b[1].lin).slice(0, 20).map(([f, c]) => `${c.lin}% ${f}`).join('\n'));
