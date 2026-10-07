// Utilidades comunes del proceso de extracción de bancos (tools/bancos).
// Rutas, lectura y escritura de JSON, llamadas a los ayudantes de Python y a las herramientas de poppler.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Carpeta nautica/. */
export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
/** Carpeta tools/bancos/. */
export const BANCOS = join(RAIZ, 'tools', 'bancos');
/** Caché local (git-ignorada): PDF oficiales y salidas intermedias. Nunca se sube. */
export const CACHE = process.env.BANCOS_CACHE || join(RAIZ, '.cache', 'bancos');

export const dirEje = (eje) => join(BANCOS, 'ejes', eje);
export const cacheEje = (eje) => join(CACHE, eje);
/** Salidas intermedias de cada etapa: .cache/bancos/<eje>/etapas/<etapa>-<tit>.json */
export const rutaEtapa = (eje, etapa, tit) => join(CACHE, eje, 'etapas', `${etapa}${tit ? `-${tit}` : ''}.json`);

export function leerJSON(ruta, defecto) {
  if (!existsSync(ruta)) {
    if (defecto !== undefined) return defecto;
    throw new Error(`No existe ${ruta}`);
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

export function escribirJSON(ruta, datos, sangria = 1) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, `${JSON.stringify(datos, null, sangria)}\n`);
}

export function escribirTexto(ruta, texto) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, texto);
}

/**
 * Ejecuta un ayudante de Python de tools/bancos/py/ en modo aislado (-I): los PDF descargados son datos no fiables
 * y el intérprete no debe cargar módulos de la carpeta actual. Devuelve el JSON que imprime el ayudante.
 */
export function python(script, args = [], { json = true } = {}) {
  const salida = execFileSync('python3', ['-I', join(BANCOS, 'py', script), ...args], {
    encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
  });
  return json ? JSON.parse(salida) : salida;
}

/** Texto de un PDF con pdftotext (sin -layout salvo que se pida). */
export function pdftotext(pdf, { layout = false, primera, ultima } = {}) {
  const args = [];
  if (layout) args.push('-layout');
  if (primera) args.push('-f', String(primera));
  if (ultima) args.push('-l', String(ultima));
  args.push(pdf, '-');
  return execFileSync('pdftotext', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

export function paginasPDF(pdf) {
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  return Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
}

export const hoy = () => new Date().toISOString().slice(0, 10);

/** Registro de avisos de una etapa (van al informe). */
export class Avisos {
  constructor() { this.lista = []; }
  add(tipo, texto, extra = {}) { this.lista.push({ tipo, texto, ...extra }); }
  de(tipo) { return this.lista.filter((a) => a.tipo === tipo); }
}
