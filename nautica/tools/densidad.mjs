// Tope de densidad de las pantallas principales, medido en un navegador (fuera de `npm test`).
//   node tools/densidad.mjs                       → sirve nautica/ solo y mide; sale con 1 si alguna pantalla se pasa
//   node tools/densidad.mjs --url http://127.0.0.1:8801   → usa un servidor que ya tienes (python3 -m http.server)
//   node tools/densidad.mjs --capturas <carpeta>  → además guarda una captura por pantalla, perfil y tema (claro y oscuro)
//   node tools/densidad.mjs --json <fichero>      → guarda las medidas en bruto
//   node tools/densidad.mjs --solo hoy,ajustes    → solo esas pantallas
// Necesita Playwright (npm i -D playwright, o NODE_PATH con él). iPhone 13, `workers.dev` cortado: nunca sincroniza.
// Mide dentro de `main` y solo lo visible (un <details> cerrado no cuenta): palabras, controles (botones + enlaces +
// summary, sin glosas), alto en pantallas de 664 px y dónde acaba la acción principal (0 = se ve sin mover la página).
// El presupuesto sale de la auditoría de densidad (docs/ARCHITECTURE.md, «El tope de densidad»). Las pantallas con
// `pendiente` (de otras partes del plan) se miden y se enseñan, pero no hacen fallar.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opcion = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const FILTRO = opcion('--solo')?.split(',') ?? null;
const CAPTURAS = opcion('--capturas');
const JSON_SALIDA = opcion('--json');

async function cargarPlaywright() {
  for (const spec of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { return await import(spec); } catch { /* siguiente */ }
  }
  console.error('Falta Playwright: npm i -D playwright (o NODE_PATH).');
  process.exit(2);
}

// Servidor estático mínimo, por si no se pasa --url.
function servir() {
  const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.txt': 'text/plain' };
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const f = path.join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': tipos[path.extname(f)] ?? 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}

/** Presupuesto por tipo de pantalla (auditoría de densidad, apartado 5). `scroll`: scrolls máximos hasta la acción. */
export const PRESUPUESTO = {
  bienvenida: { palabras: 40, controles: 3, alto: 1, scroll: 0 },
  portadaNuevo: { palabras: 90, controles: 8, alto: 2.5, scroll: 0 },
  portadaAvanzado: { palabras: 160, controles: 14, alto: 2.5, scroll: 0 },
  referencia: { palabras: 250, controles: 16, alto: 3, scroll: 0 },
  // Estrategia y Mi tema con datos tuyos: «Tu estrategia» trae 3 consejos personales (unas 100 palabras), que no se pliegan.
  referenciaConDatos: { palabras: 280, controles: 16, alto: 3.5, scroll: 0 },
  tema: { palabras: 230, controles: 20, alto: 3.5, scroll: 0 },
  hub: { palabras: 180, controles: 14, alto: 3, scroll: 1 },
  menu: { palabras: 180, controles: 16, alto: 4 },
};

/** Pantallas: [id, ruta, tipo de presupuesto, { solo: perfiles, pendiente: motivo, prim: selector de la acción }]. */
const pantallas = (tit) => [
  ['hoy', `#/${tit}`, null, { tipos: { nuevo: 'portadaNuevo', avanzado: 'portadaAvanzado' } }],
  ['estrategia', `#/${tit}/estrategia`, null, { prim: 'a.btn.grande', tipos: { nuevo: 'referencia', avanzado: 'referenciaConDatos' } }],
  ['podcast', `#/${tit}/podcast`, 'referencia', {}],
  ['ajustes', '#/ajustes', 'referencia', {}],
  ['tema', `#/${tit}/temario/1`, 'tema', { prim: 'a.btn.grande, a.btn:not(.secondary)' }],
  ['mas', `#/${tit}/mas`, 'menu', {}],
];

async function sembrar(page, base, { perfil, tit, onboarded }) {
  await page.goto(base + '/llms.txt');
  await page.evaluate(async ({ perfil, tit, onboarded }) => {
    localStorage.clear(); sessionStorage.clear();
    const { createProgressStore } = await import('/src/store/progress.js');
    const p = createProgressStore();
    if (onboarded) p.setSetting('onboarded', true);
    if (perfil !== 'avanzado') return;
    const DIA = 864e5, ahora = Date.now();
    const pre = tit === 'per' ? 'per-1-' : 'py-1-';
    for (const n of [1, 2, 3, 4]) p.saveLeccion(pre + n, { visto: true, caja: 1, ultimo: ahora - (6 - n) * DIA, proximo: ahora + DIA, ultimoAcierto: true, paso: 0 });
    const r = await fetch(`/data/ejes/andalucia/${tit}/preguntas.json`).then((x) => x.json());
    r.preguntas.filter((q) => String(q.ut) === '1' && !q.anulada).slice(0, 10).forEach((q, i) => {
      const ok = i % 3 !== 2;
      p.recordExam(q.id, { choice: ok ? q.correcta : ['a', 'b', 'c', 'd'].find((l) => l !== q.correcta), ok });
    });
    for (let d = 0; d < 4; d++) p.logActividad(25, ahora - d * DIA);
    p.recordTest(tit === 'per'
      ? { tit, eje: 'andalucia', tipo: 'simulacro', titulo: 'Simulacro', aciertos: 32, total: 45, minutos: 80, apto: false, porTema: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((ut) => ({ ut, aciertos: 3, total: 4 })) }
      : { tit, eje: 'andalucia', tipo: 'simulacro', titulo: 'Simulacro', aciertos: 40, total: 60, minutos: 110, apto: false, porTema: [1, 2, 3, 4].map((ut) => ({ ut, aciertos: 10, total: 15 })) });
    if (tit === 'py') p.setSetting('modulos_py', 'navegacion');
    const c = await import('/src/ui/cuaderno.js');
    c.fijarProgresoCuaderno(p);
    c.anotarFallo({ error: 'signo-ct', tipo: 'carta', origen: 'pregunta' });
    c.anotarFallo({ error: 'adelanto-signo', tipo: 'marea-sonda', origen: 'paso' });
  }, { perfil, tit, onboarded });
}

async function esperar(page) {
  await page.waitForFunction(() => !document.querySelector('main')?.textContent.includes('Cargando…'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(900);
}

function medir(page, primSel) {
  return page.evaluate((primSel) => {
    const main = document.querySelector('main');
    const vis = (el) => el && el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) && el.getClientRects().length > 0;
    const pal = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    const cands = primSel ? [primSel] : ['a.btn.grande:not(.secondary)', 'button.grande:not(.secondary):not(.linklike)', '.boton-sesion', 'a.btn:not(.secondary)'];
    let prim = null;
    for (const s of cands) { prim = [...main.querySelectorAll(s)].find(vis); if (prim) break; }
    const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    let total = 0;
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!vis(el) || el.closest('script,style,svg')) continue;
      total += pal(n.textContent);
    }
    const ctrls = [...main.querySelectorAll('button, a[href], summary, [role=button]')].filter(vis).filter((e) => !e.matches('button.glosa, button.vocab-term'));
    const ih = innerHeight;
    const tab = document.querySelector('#tabbar');
    const tabH = tab && vis(tab) ? tab.getBoundingClientRect().height : 0;
    let scrolls = null, primTxt = null;
    if (prim) {
      const r = prim.getBoundingClientRect(); const fondo = r.bottom + scrollY; const util = ih - tabH;
      scrolls = fondo <= util ? 0 : Math.ceil((fondo - util) / (util * 0.85));
      primTxt = prim.textContent.trim().replace(/\s+/g, ' ').slice(0, 50);
    }
    return { palabras: total, controles: ctrls.length, alto: +(document.documentElement.scrollHeight / ih).toFixed(2), scrolls, accion: primTxt };
  }, primSel);
}

const { chromium, devices } = await cargarPlaywright();
let servidor = null; let BASE = opcion('--url');
if (!BASE) { servidor = await servir(); BASE = servidor.url; }
BASE = BASE.replace(/\/$/, '');
const navegador = await chromium.launch();
const resultados = []; const fallos = []; const avisos = [];

const PERFILES = [
  { id: 'bienvenida', perfil: 'nuevo', tit: 'per', onboarded: false },
  { id: 'nuevo-per', perfil: 'nuevo', tit: 'per', onboarded: true },
  { id: 'nuevo-py', perfil: 'nuevo', tit: 'py', onboarded: true },
  { id: 'avanzado-per', perfil: 'avanzado', tit: 'per', onboarded: true },
  { id: 'avanzado-py', perfil: 'avanzado', tit: 'py', onboarded: true },
];

for (const esquema of CAPTURAS ? ['light', 'dark'] : ['light']) {
  for (const P of PERFILES) {
    const ctx = await navegador.newContext({ ...devices['iPhone 13'], colorScheme: esquema });
    await ctx.route(/workers\.dev/, (r) => r.abort());
    const page = await ctx.newPage();
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await sembrar(page, BASE, P);
    const lista = P.id === 'bienvenida' ? [['bienvenida', '#/', 'bienvenida', {}]] : pantallas(P.tit);
    for (const [id, ruta, tipoFijo, op] of lista) {
      if (FILTRO && !FILTRO.includes(id)) continue;
      const tipo = tipoFijo ?? op.tipos?.[P.perfil];
      await page.goto(BASE + '/index.html' + ruta); await esperar(page);
      await page.evaluate(() => scrollTo(0, 0));
      const m = await medir(page, op.prim);
      if (CAPTURAS) {
        fs.mkdirSync(CAPTURAS, { recursive: true });
        await page.evaluate(() => { const t = document.querySelector('#tabbar'); if (t) t.style.position = 'static'; });
        await page.screenshot({ path: path.join(CAPTURAS, `${P.id}-${id}-${esquema === 'dark' ? 'oscuro' : 'claro'}.png`), fullPage: true });
      }
      if (esquema === 'dark') continue;
      const tope = PRESUPUESTO[tipo];
      const pasa = [];
      if (tope) {
        if (m.palabras > tope.palabras) pasa.push(`palabras ${m.palabras} > ${tope.palabras}`);
        if (m.controles > tope.controles) pasa.push(`controles ${m.controles} > ${tope.controles}`);
        if (m.alto > tope.alto) pasa.push(`alto ${m.alto} > ${tope.alto} pantallas`);
        if (tope.scroll != null && m.scrolls != null && m.scrolls > tope.scroll) pasa.push(`acción a ${m.scrolls} scrolls > ${tope.scroll}`);
      }
      const fila = { perfil: P.id, pantalla: id, tipo, ...m, pasa };
      resultados.push(fila);
      console.log(`${P.id.padEnd(13)} ${id.padEnd(11)} pal ${String(m.palabras).padStart(4)}  ctrl ${String(m.controles).padStart(3)}  alto ${String(m.alto).padStart(5)}  scr ${m.scrolls ?? '—'}  ${tope ? (pasa.length ? 'SE PASA: ' + pasa.join('; ') : 'ok') : 'sin tope'}  ${m.accion ?? ''}`);
      if (pasa.length) (op.pendiente ? avisos : fallos).push(`${P.id}/${id}: ${pasa.join('; ')}`);
    }
    if (errores.length) { console.log('ERRORES de la página en', P.id, errores.slice(0, 3)); fallos.push(`${P.id}: errores de la página`); }
    await ctx.close();
  }
}
await navegador.close();
servidor?.s.close();
if (JSON_SALIDA) fs.writeFileSync(JSON_SALIDA, JSON.stringify(resultados, null, 1));
if (avisos.length) console.log('\nPendientes (otras partes del plan):\n  ' + avisos.join('\n  '));
if (fallos.length) { console.error('\nSe pasan del tope:\n  ' + fallos.join('\n  ')); process.exit(1); }
console.log('\nTodas las pantallas dentro del tope.');
