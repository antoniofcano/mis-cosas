// Exportaciones que nadie importa (aprox.): nombre exportado que no aparece en ningún otro fichero de src/.
// Distingue «solo lo usan los tests» de «no lo usa nadie».
import fs from 'node:fs';
import path from 'node:path';
const raiz = process.argv[2];
const leer = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'vendor' && e.name !== 'node_modules') leer(p, out); } else if (/\.(js|mjs)$/.test(e.name)) out.push(p); } return out; };
const src = leer(path.join(raiz, 'src')).map((p) => [p, fs.readFileSync(p, 'utf8')]);
const otros = [...leer(path.join(raiz, 'tests')), ...leer(path.join(raiz, 'tools')), ...leer(path.join(raiz, '../sync-worker/src'))].map((p) => fs.readFileSync(p, 'utf8')).join('\n');
let total = 0; const nadie = [], soloTests = [];
for (const [p, t] of src) {
  const nombres = [...t.matchAll(/^export (?:async )?(?:function\*?|const|let|class) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  for (const m of t.matchAll(/^export \{([^}]+)\}/gm)) for (const x of m[1].split(',')) { const n = x.trim().split(/\s+as\s+/).pop(); if (n) nombres.push(n); }
  for (const n of nombres) {
    total++;
    const re = new RegExp(`(?<![\\w$])${n.replace(/\$/g, '\\$')}(?![\\w$])`);
    const enOtroSrc = src.some(([q, u]) => q !== p && re.test(u));
    if (enOtroSrc) continue;
    const propio = (t.match(new RegExp(re.source, 'g')) || []).length > 1;
    if (re.test(otros)) soloTests.push([path.relative(raiz, p), n, propio]); else nadie.push([path.relative(raiz, p), n, propio]);
  }
}
console.log('exportaciones:', total);
console.log('no las importa ningún otro módulo de src/: ', nadie.length + soloTests.length);
console.log('  · de ellas, solo las usan tests/tools/worker:', soloTests.length, '(', soloTests.filter((x) => !x[2]).length, 'ni siquiera se usan dentro de su fichero: API solo para tests )');
console.log('  · no las usa nadie fuera de su fichero:', nadie.length, '(', nadie.filter((x) => !x[2]).length, 'tampoco dentro: código muerto probable )');
console.log('== muertas probables'); console.log(nadie.filter((x) => !x[2]).map(([f, n]) => `${f}: ${n}`).join('\n'));
const porDir = {}; for (const [f] of soloTests.filter((x) => !x[2])) { const d = f.split('/').slice(0, 2).join('/'); porDir[d] = (porDir[d] || 0) + 1; }
console.log('== API solo para tests, por directorio', porDir);
