// Mide el arranque en local (sin service worker) y pasa axe-core por algunas pantallas. No toca producción.
import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.argv[2];
const axeSrc = fs.readFileSync(new URL('./node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const browser = await chromium.launch();
const mediana = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

async function medir({ cpu = 1, red = null, movil = true, ruta = '#/' , onboard = true }) {
  const ctx = await browser.newContext(movil ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {});
  await ctx.route(/workers\.dev/, (r) => r.abort());
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  if (red) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...red }); }
  let n = 0, bytes = 0, js = 0, json = 0, bytesJson = 0;
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text().slice(0, 200)); });
  page.on('response', async (r) => { n++; const u = r.url(); if (u.endsWith('.js')) js++; try { const b = (await r.body()).length; bytes += b; if (u.endsWith('.json')) { json++; bytesJson += b; } } catch { /* */ } });
  const t0 = Date.now();
  await page.goto(BASE + ruta, { waitUntil: 'commit' });
  await page.waitForFunction(() => { const a = document.querySelector('#app'); return a && !/^\s*Cargando…?\s*$/.test(a.textContent) && a.children.length > 0; }, null, { timeout: 120000 });
  const listo = Date.now() - t0;
  await page.waitForLoadState('networkidle').catch(() => {});
  const nav = await page.evaluate(() => { const e = performance.getEntriesByType('navigation')[0]; const p = performance.getEntriesByType('paint').find((x) => x.name === 'first-contentful-paint'); return { dcl: Math.round(e.domContentLoadedEventEnd), load: Math.round(e.loadEventEnd), fcp: p ? Math.round(p.startTime) : null, hash: location.hash, ls: Object.keys(localStorage).map((k) => [k, localStorage.getItem(k).length]) }; });
  const r = { listo, ...nav, peticiones: n, js, json, kbTotal: Math.round(bytes / 1024), kbJson: Math.round(bytesJson / 1024), errores };
  await ctx.close();
  return r;
}

const out = {};
// 1) arranque en frío, 5 repeticiones, móvil sin limitar
const frio = []; for (let i = 0; i < 5; i++) frio.push(await medir({}));
out.frio = { medianaListoMs: mediana(frio.map((x) => x.listo)), medianaDcl: mediana(frio.map((x) => x.dcl)), fcp: mediana(frio.map((x) => x.fcp)), muestra: frio[0] };
// 2) CPU ×4 (móvil modesto)
const cpu4 = []; for (let i = 0; i < 3; i++) cpu4.push(await medir({ cpu: 4 }));
out.cpu4 = { medianaListoMs: mediana(cpu4.map((x) => x.listo)), fcp: mediana(cpu4.map((x) => x.fcp)) };
// 3) CPU ×4 + red «4G lenta» (1,6 Mbps bajada, 150 ms de latencia). Ojo: servidor local HTTP/1.1, 6 conexiones.
const red = { downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8, latency: 150 };
const lenta = await medir({ cpu: 4, red });
out.cpu4_4g = { listoMs: lenta.listo, fcp: lenta.fcp, peticiones: lenta.peticiones, kb: lenta.kbTotal };

// 4) accesibilidad con axe-core en varias pantallas (con la presentación ya hecha no se puede sin tocar el almacén: se entra tal cual)
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route(/workers\.dev/, (r) => r.abort());
const page = await ctx.newPage();
out.axe = {};
for (const ruta of ['#/bienvenida', '#/per', '#/per/temario', '#/per/examenes', '#/per/mas', '#/ajustes', '#/progreso', '#/per/carta', '#/mesa', '#/calculadora']) {
  await page.goto(BASE + ruta); await page.waitForTimeout(1200);
  await page.evaluate(axeSrc);
  const res = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }); return r.violations.map((v) => ({ id: v.id, impacto: v.impact, nodos: v.nodes.length, ej: v.nodes[0]?.target?.join(' ').slice(0, 80) })); });
  out.axe[ruta] = { hashFinal: await page.evaluate(() => location.hash), violaciones: res };
}
await ctx.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));
