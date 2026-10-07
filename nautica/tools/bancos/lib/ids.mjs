// Identificadores de pregunta (contrato bancos-esquema):
// - Andalucía conserva los suyos: and-YYYY-cN-tNN (teoría PER, 1–41), and-YYYY-cN-qNN (carta PER, 42–45),
//   and-py-YYYY-cN-gNN | nNN (PY, módulo genérico | navegación). NN = número en el modelo A / en el módulo.
// - config.ids = "conv-nn" (el formato del contrato, docs/BANCOS.md): <conv>-<NN>, p. ej. dgmm-per-2025-11-07, con la
//   convocatoria de la primera aparición. Si la convocatoria tiene varios juegos de preguntas distintos (DGMM: T01≡T03
//   y T02≡T04), NN sigue la numeración del primer juego (1–45) y continúa en el segundo (46–90), el tercero (91–135)…,
//   por el orden de modelos de config.repetidas.ordenModelos: NN = (juego − 1) × preguntas del examen + número.
// - Por defecto: <conv>-<modelo>-<NN> (p. ej. baleares-per-2025-06-menorca-07).
// Un id publicado nunca cambia ni se reutiliza: si el banco ya existe en data/ejes/<eje>/<tit>/preguntas.json, cada
// pregunta conserva el id de la publicada con la que comparte alguna aparición (convocatoria + modelo + número) o, si
// no, el mismo texto (enunciado y opciones, sin importar el orden); aunque después se añadan convocatorias anteriores que
// cambien cuál es la «primera aparición». Las nuevas reciben ids que no choquen con ninguno publicado.
import { join } from 'node:path';
import { RAIZ, leerJSON } from './comun.mjs';
import { textoPregunta } from './texto.mjs';

const pad = (n) => String(n).padStart(2, '0');
export const refAparicion = (a) => `${a.conv}|${a.modelo ?? ''}|${a.numero}`;

/** Ids publicados: por aparición y por contenido. Devuelve un Map (por aparición) con `.porTexto` y `.todos`. */
export function idsExistentes(eje, tit) {
  const ruta = join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json');
  const banco = leerJSON(ruta, null);
  const mapa = new Map();
  mapa.porTexto = new Map();
  mapa.todos = new Set();
  for (const p of banco?.preguntas ?? []) {
    mapa.todos.add(p.id);
    mapa.porTexto.set(textoPregunta(p), p.id);
    for (const a of p.apareceEn ?? []) mapa.set(refAparicion(a), p.id);
  }
  return mapa;
}

/** Juego (1, 2, …) de cada modelo de cada convocatoria: modelos que son canónicos de alguna pregunta, en su orden. */
export function juegos(preguntas, config) {
  const orden = config.repetidas?.ordenModelos ?? [];
  const rango = (m) => { const k = orden.indexOf(m); return k < 0 ? 99 : k; };
  const porConv = new Map();
  for (const p of preguntas) {
    if (!porConv.has(p.conv)) porConv.set(p.conv, new Set());
    porConv.get(p.conv).add(p.modelo ?? '');
  }
  const out = new Map();
  for (const [conv, ms] of porConv) {
    [...ms].sort((a, b) => rango(a) - rango(b) || a.localeCompare(b)).forEach((m, i) => out.set(`${conv}|${m}`, i + 1));
  }
  return out;
}

export function idNuevo(p, config, tit, juego = 1) {
  if (config.ids === 'andalucia') {
    const clave = p.claveConv;
    if (tit === 'per') return `and-${clave}-${p.numero <= 41 ? 't' : 'q'}${pad(p.numero)}`;
    return `and-py-${clave}-${p.modulo === 'navegacion' ? 'n' : 'g'}${pad(p.numero)}`;
  }
  if (config.ids === 'conv-nn') return `${p.conv}-${pad((juego - 1) * config.titulaciones[tit].preguntas + p.numero)}`;
  const modelo = String(p.modelo ?? p.modulo ?? 'u').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `${p.conv}-${modelo}-${pad(p.numero)}`;
}

/** Asigna p.id a cada pregunta. Devuelve { conflictos, nuevos, perdidos } (perdidos: publicados que ya no salen). */
export function asignarIds(preguntas, config, tit, existentes = new Map()) {
  const usados = new Set();
  const conflictos = [];
  const reservados = existentes.todos ?? new Set();
  const js = juegos(preguntas, config);
  // Primero las que ya tenían id publicado (así ninguna nueva puede quitárselo).
  const previos = new Map();
  for (const p of preguntas) {
    const previo = p.apareceEn.map((a) => existentes.get(refAparicion(a))).find(Boolean) ?? existentes.porTexto?.get(textoPregunta(p));
    if (previo && !usados.has(previo)) { previos.set(p, previo); usados.add(previo); }
  }
  let nuevos = 0;
  for (const p of preguntas) {
    let id = previos.get(p);
    if (!id) {
      id = idNuevo(p, config, tit, js.get(`${p.conv}|${p.modelo ?? ''}`) ?? 1);
      if (usados.has(id) || reservados.has(id)) {
        conflictos.push(id);
        let k = 2;
        while (usados.has(`${id}-${k}`) || reservados.has(`${id}-${k}`)) k++;
        id = `${id}-${k}`;
      }
      usados.add(id);
      nuevos++;
    }
    p.id = id;
  }
  const perdidos = [...reservados].filter((id) => !usados.has(id));
  return { conflictos, nuevos, perdidos };
}
