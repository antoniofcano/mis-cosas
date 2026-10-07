// Valida la salida de un lote de explicaciones de Baleares.
//   node nautica/.trabajo-expl/validar.mjs 03        (lee entrada/lote-03.jsonl y salida/lote-03.json)
// Comprueba: una entrada por pregunta y nada más; campos permitidos; longitudes; que las letras citadas existen;
// «defendible» distinta de la oficial; ilustraciones dibujables; sin palabras prohibidas; base de Andalucía citada
// solo si era candidata y con la misma respuesta.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const n = String(process.argv[2] ?? '').padStart(2, '0');
const entrada = readFileSync(join(AQUI, 'entrada', `lote-${n}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const rutaSalida = join(AQUI, 'salida', `lote-${n}.json`);
if (!existsSync(rutaSalida)) { console.log(`Falta ${rutaSalida}`); process.exit(1); }
const salida = JSON.parse(readFileSync(rutaSalida, 'utf8'));
const { validSpec } = await import(join(AQUI, '..', 'src', 'illustrations', 'index.js'));
const CAMPOS = new Set(['explicacion', 'clave', 'trampa', 'ilustraciones', 'discrepancia', 'defendible', 'base', 'concepto']);
const PROHIBIDO = /academia|escuela|sirocodiez|siroco ?10|andaluc|junta de|chatgpt|como modelo de lenguaje/i;
const errores = [];
const avisos = [];
const ids = new Set(entrada.map((q) => q.id));
for (const id of Object.keys(salida)) if (!ids.has(id)) errores.push(`${id}: no es de este lote`);
for (const q of entrada) {
  const e = salida[q.id];
  const E = (t) => errores.push(`${q.id}: ${t}`);
  if (!e) { E('falta'); continue; }
  for (const k of Object.keys(e)) if (!CAMPOS.has(k)) E(`campo no permitido «${k}»`);
  if (typeof e.explicacion !== 'string' || e.explicacion.length < 80) E('explicación ausente o demasiado corta (< 80)');
  if (e.explicacion?.length > 900) avisos.push(`${q.id}: explicación larga (${e.explicacion.length})`);
  if (typeof e.clave !== 'string' || e.clave.length < 8) E('clave ausente o muy corta');
  if (e.clave?.length > 160) avisos.push(`${q.id}: clave larga (${e.clave.length})`);
  if (e.trampa != null && (typeof e.trampa !== 'string' || e.trampa.length < 8)) E('trampa vacía');
  if (e.discrepancia != null && (typeof e.discrepancia !== 'string' || e.discrepancia.length < 30)) E('discrepancia vacía o corta');
  if (e.defendible != null) {
    if (!/^[a-d]$/.test(e.defendible) || !(e.defendible in q.opciones)) E(`defendible «${e.defendible}» no es una opción`);
    if (q.aceptadas.includes(e.defendible)) E('defendible es una respuesta oficial');
    if (!e.discrepancia) E('defendible sin discrepancia');
  }
  if (q.norma && ['actualizada', 'retirada'].includes(q.norma.estado) && !e.discrepancia && !/hoy|desde|derog|actual|ya no|antes/i.test(e.explicacion)) E(`norma ${q.norma.estado}: la explicación tiene que contar el cambio`);
  for (const s of e.ilustraciones ?? []) if (!validSpec(s)) E(`ilustración no dibujable ${JSON.stringify(s)}`);
  const texto = [e.explicacion, e.clave, e.trampa, e.discrepancia].filter(Boolean).join(' ');
  if (PROHIBIDO.test(texto)) E('palabra prohibida (academias, escuelas, el banco de otra comunidad…)');
  // Letras citadas como opción: «la c)», «(b)», «opción d»: tienen que existir.
  for (const m of texto.matchAll(/(?:\bla |\bopci[oó]n |\()([a-d])\)/g)) if (!(m[1] in q.opciones)) E(`cita la opción ${m[1]}) que no existe`);
  if (e.base) {
    const c = (q.andalucia ?? []).find((a) => a.id === e.base);
    if (!c) E(`base ${e.base} no es una candidata`);
    else if (c.opciones[c.correcta]?.trim() && !q.aceptadas.length) E('base con pregunta anulada');
  }
  if (e.concepto != null && (typeof e.concepto !== 'string' || !/^(bal|and)-/.test(e.concepto))) E(`concepto «${e.concepto}» (id de pregunta bal-… o and-…)`);
}
console.log(`lote ${n}: ${entrada.length} preguntas, ${Object.keys(salida).length} explicaciones, ${errores.length} errores, ${avisos.length} avisos`);
for (const x of errores.slice(0, 60)) console.log(`  ERROR ${x}`);
for (const x of avisos.slice(0, 20)) console.log(`  aviso ${x}`);
process.exit(errores.length ? 1 : 0);
