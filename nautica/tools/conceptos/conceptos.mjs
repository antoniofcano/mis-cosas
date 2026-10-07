// Herramientas del catálogo de conceptos (docs/CONCEPTOS.md).
//   npm run conceptos -- validar     [--eje e] [--tit t] [--json] [--sin-cobertura]
//   npm run conceptos -- candidatos  [--eje e] [--tit t] [--k 8] [--lote 40] [--salida dir] [--todas] [--medir oro.json]
//   npm run conceptos -- fusionar    <lote.json|carpeta>… [--forzar] [--simular]
import { fileURLToPath } from 'node:url';

const ORDENES = { validar: './validar.mjs', candidatos: './candidatos.mjs', fusionar: './fusionar.mjs' };

export async function main(argv = process.argv.slice(2)) {
  const [orden, ...resto] = argv;
  if (!ORDENES[orden]) {
    console.error(`Uso: npm run conceptos -- <${Object.keys(ORDENES).join('|')}> [opciones]  (docs/CONCEPTOS.md)`);
    return 2;
  }
  const mod = await import(ORDENES[orden]);
  return mod.main(resto);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
