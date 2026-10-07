// Proceso de extracción de bancos de examen por eje (administración examinadora).
//   npm run bancos -- <eje> [--tit per|py] [--solo etapa[,etapa]] [--desde etapa] [--descubrir] [--todas] [--sin-red]
// Etapas, en orden (cada una lee la salida de la anterior en .cache/bancos/<eje>/etapas/):
//   manifiesto → extraer → repetidas → correcciones → clasificar → normativa → validar → escribir
// Documentación: docs/EXTRACCION.md
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Avisos, dirEje, leerJSON } from './lib/comun.mjs';

export const ETAPAS = ['manifiesto', 'extraer', 'repetidas', 'correcciones', 'clasificar', 'normativa', 'validar', 'escribir'];

export function leerOpciones(argv) {
  const o = { eje: null, tit: null, solo: null, desde: null, descubrir: false, todas: false, sinRed: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tit') o.tit = argv[++i];
    else if (a === '--solo') o.solo = argv[++i].split(',');
    else if (a === '--desde') o.desde = argv[++i];
    else if (a === '--descubrir') o.descubrir = true;
    else if (a === '--todas') o.todas = true;
    else if (a === '--sin-red') o.sinRed = true;
    else if (!a.startsWith('--') && !o.eje) o.eje = a;
    else throw new Error(`Opción desconocida: ${a}`);
  }
  if (!o.eje) throw new Error('Falta el eje: npm run bancos -- <eje> [--tit per|py] [--solo etapa]');
  if (o.tit && !['per', 'py'].includes(o.tit)) throw new Error('--tit debe ser per o py');
  for (const e of [...(o.solo ?? []), ...(o.desde ? [o.desde] : [])]) if (!ETAPAS.includes(e)) throw new Error(`Etapa desconocida: ${e} (${ETAPAS.join(', ')})`);
  return o;
}

export async function ejecutar(opciones) {
  const config = leerJSON(join(dirEje(opciones.eje), 'config.json'));
  const etapas = opciones.solo ?? (opciones.desde ? ETAPAS.slice(ETAPAS.indexOf(opciones.desde)) : ETAPAS);
  const tits = opciones.tit ? [opciones.tit] : Object.keys(config.titulaciones);
  const ctx = { eje: opciones.eje, config, opciones, avisos: new Avisos(), tits };
  for (const etapa of etapas) {
    const mod = await import(`./etapas/${etapa}.mjs`);
    const t0 = Date.now();
    const r = await mod[etapa](ctx);
    console.log(`· ${etapa} (${((Date.now() - t0) / 1000).toFixed(1)} s): ${JSON.stringify(r)}`);
  }
  for (const a of ctx.avisos.lista.slice(0, 40)) console.log(`  aviso [${a.tipo}] ${a.texto}`);
  if (ctx.avisos.lista.length > 40) console.log(`  … y ${ctx.avisos.lista.length - 40} avisos más (ver el informe)`);
  return ctx;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await ejecutar(leerOpciones(process.argv.slice(2)));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
