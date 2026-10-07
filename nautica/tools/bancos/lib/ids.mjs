// Identificadores de pregunta (contrato bancos-esquema):
// - Andalucía conserva los suyos: and-YYYY-cN-tNN (teoría PER, 1–41), and-YYYY-cN-qNN (carta PER, 42–45),
//   and-py-YYYY-cN-gNN | nNN (PY, módulo genérico | navegación). NN = número en el modelo A / en el módulo.
// - Ejes nuevos: <prefijo>-<tit>-<AAAA-MM>-<modelo>-<NN>, con la convocatoria, el modelo y el número de la primera
//   aparición (p. ej. dgmm-per-2025-11-t01-07). El modelo va siempre, porque una convocatoria tiene varios juegos.
// Un id publicado nunca cambia: si el banco ya existe en data/ejes/<eje>/<tit>/preguntas.json, cada pregunta conserva el
// id de la pregunta publicada con la que comparte alguna aparición (convocatoria + modelo + número), aunque después se
// añadan convocatorias anteriores que cambien cuál es la «primera aparición».
import { join } from 'node:path';
import { RAIZ, leerJSON } from './comun.mjs';

const pad = (n) => String(n).padStart(2, '0');
export const refAparicion = (a) => `${a.conv}|${a.modelo ?? ''}|${a.numero}`;

export function idsExistentes(eje, tit) {
  const ruta = join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json');
  const banco = leerJSON(ruta, null);
  const mapa = new Map();
  for (const p of banco?.preguntas ?? []) for (const a of p.apareceEn ?? []) mapa.set(refAparicion(a), p.id);
  return mapa;
}

export function idNuevo(p, config, tit) {
  if (config.ids === 'andalucia') {
    const clave = p.claveConv;
    if (tit === 'per') return `and-${clave}-${p.numero <= 41 ? 't' : 'q'}${pad(p.numero)}`;
    return `and-py-${clave}-${p.modulo === 'navegacion' ? 'n' : 'g'}${pad(p.numero)}`;
  }
  const modelo = String(p.modelo ?? p.modulo ?? 'u').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `${p.conv}-${modelo}-${pad(p.numero)}`;
}

export function asignarIds(preguntas, config, tit, existentes = new Map()) {
  const usados = new Set();
  const conflictos = [];
  for (const p of preguntas) {
    const previo = p.apareceEn.map((a) => existentes.get(refAparicion(a))).find(Boolean);
    let id = previo ?? idNuevo(p, config, tit);
    if (usados.has(id)) { conflictos.push(id); id = `${id}-${usados.size}`; }
    usados.add(id);
    p.id = id;
  }
  return conflictos;
}
