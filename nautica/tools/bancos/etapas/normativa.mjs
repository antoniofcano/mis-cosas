// Etapa 6 · normativa
// Entrada: clasificar-<tit>.json y data/normativa.json (cambios normativos fechados, con sus detectores).
// Salida: normativa-<tit>.json. Cada pregunta lleva norma = { estado: "vigente" } o
// { estado: "revisar", normas: ["RD 339/2021", …] } si alguna de sus apariciones (se usa la MÁS ANTIGUA: que el tribunal
// la repita después del cambio no garantiza que la revisara) es anterior a la entrada en vigor de un cambio cuyo texto
// encaja con algún detector. Los detectores son anchos a propósito: es
// preferible revisar de más (el informe lista todas) que dejar pasar una respuesta obsoleta.
// Las preguntas sin fecha conocida se marcan «revisar» con todas las normas cuyos detectores encajan.
// Al final se aplican los ajustes a mano del eje (tools/bancos/ejes/<eje>/ajustes.json, por id): la resolución de la
// revisión normativa (norma: { estado: vigente | actualizada | retirada, normas, nota }) y, si hace falta, requiere / ut /
// concepto. Así una nueva extracción no deshace la revisión.
import { join } from 'node:path';
import { RAIZ, dirEje, escribirJSON, leerJSON, rutaEtapa } from '../lib/comun.mjs';
import { canonico } from '../lib/texto.mjs';

export function cargarNormas(ruta = join(RAIZ, 'data', 'normativa.json')) {
  return leerJSON(ruta).normas.map((n) => ({ ...n, re: n.detectores.map((d) => new RegExp(d, 'i')) }));
}

/** Normas que obligan a revisar la pregunta. */
export function normasAfectadas(p, normas) {
  const fechas = [p.fecha, ...(p.apareceEn ?? []).map((a) => a.fecha)].filter(Boolean).sort();
  const primera = fechas[0] ?? null;
  const texto = canonico(`${p.contexto ?? ''} ${p.enunciado} ${Object.values(p.opciones ?? {}).join(' ')}`);
  return normas.filter((n) => (!primera || primera < n.vigor) && n.re.some((r) => r.test(texto))).map((n) => n.id);
}

const CAMPOS_AJUSTE = ['norma', 'requiere', 'ut', 'ut_titulo', 'bloque', 'concepto', 'notas'];

/** Aplica los ajustes a mano (id → campos). Devuelve los ids de ajustes que no encuentran su pregunta. */
export function aplicarAjustes(preguntas, ajustes = {}) {
  const porId = new Map(preguntas.map((p) => [p.id, p]));
  const sinPregunta = [];
  for (const [id, a] of Object.entries(ajustes)) {
    const p = porId.get(id);
    if (!p) { sinPregunta.push(id); continue; }
    for (const k of CAMPOS_AJUSTE) if (k in a) p[k] = k === 'norma' ? { ...a.norma, normas: a.norma.normas ?? p.norma?.normas } : a[k];
  }
  return sinPregunta;
}

export async function normativa(ctx) {
  const normas = cargarNormas();
  const ajustes = leerJSON(join(dirEje(ctx.eje), 'ajustes.json'), {});
  const out = {};
  for (const tit of ctx.tits) {
    const d = leerJSON(rutaEtapa(ctx.eje, 'clasificar', tit));
    const porNorma = {};
    for (const p of d.preguntas) {
      const afect = normasAfectadas(p, normas);
      p.norma = afect.length ? { estado: 'revisar', normas: afect } : { estado: 'vigente' };
      for (const n of afect) porNorma[n] = (porNorma[n] ?? 0) + 1;
    }
    for (const id of aplicarAjustes(d.preguntas, ajustes[tit])) ctx.avisos.add('normativa', `ajuste sin pregunta: ${tit} ${id}`);
    escribirJSON(rutaEtapa(ctx.eje, 'normativa', tit), d);
    const estados = {};
    for (const p of d.preguntas) estados[p.norma.estado] = (estados[p.norma.estado] ?? 0) + 1;
    out[tit] = { ...estados, porNorma };
  }
  return out;
}
