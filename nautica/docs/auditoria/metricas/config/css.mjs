// Clases definidas en el CSS que no aparecen como texto en src/ ni en index.html (aproximación: las clases compuestas
// con plantillas `x-${y}` pueden dar falsos positivos).
import fs from 'node:fs';
import path from 'node:path';
const raiz = process.argv[2];
const leer = (d, ext, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) leer(p, ext, out); else if (e.name.endsWith(ext)) out.push(fs.readFileSync(p, 'utf8')); } return out; };
const codigo = leer(path.join(raiz, 'src'), '.js').join('\n') + fs.readFileSync(path.join(raiz, 'index.html'), 'utf8') + leer(path.join(raiz, 'data'), '.json').join('\n');
for (const f of ['app.css', 'laminas.css']) {
  const css = fs.readFileSync(path.join(raiz, 'styles', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const clases = new Set([...css.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map((m) => m[1]).filter((c) => !/^\d/.test(c)));
  const sin = [...clases].filter((c) => !codigo.includes(c));
  // prefijos dinámicos: si existe en el código `prefijo-${`
  const sinDin = sin.filter((c) => { const partes = c.split('-'); for (let i = partes.length - 1; i > 0; i--) { const pre = partes.slice(0, i).join('-') + '-'; if (codigo.includes(pre + '${') || codigo.includes(pre + "' +") ) return false; } return true; });
  const selectores = (css.match(/[^{}]+\{/g) || []).length;
  const ids = new Set([...css.matchAll(/#([a-zA-Z][\w-]*)\b(?=[^;{}]*\{)/g)].map((m) => m[1]));
  console.log(f, '· bloques de reglas:', selectores, '· clases distintas:', clases.size, '· sin rastro en el código:', sin.length, '· tras quitar prefijos dinámicos:', sinDin.length, '· ids:', ids.size);
  console.log('   ej.:', sinDin.slice(0, 25).join(' '));
  const vars = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  console.log('   variables CSS definidas:', vars.size);
}
