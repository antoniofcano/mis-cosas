// Repaso exprés de la víspera (#/<tit>/vispera, R-45): en una sola pantalla y sin preguntas, las trampas más repetidas de
// los temas con límite de fallos de la titulación (PER: Balizamiento, RIPA y Carta; PY: Teoría de navegación y Carta),
// para leerlas en unos 15 minutos. Funciones puras, sin DOM ni reloj: entra todo como datos.
//
// De dónde sale cada cosa (nada de contenido nuevo):
//   · las trampas: los pasos «ojo» de las clases del curso (data/curso/<tit>.json), que son las de las chuletas
//     (contenidoChuleta, src/ui/views/chuleta.js) y de las que se nombra la clase;
//   · para recordar: las reglas nemotécnicas de esas mismas clases (data/comun/mnemotecnias.json);
//   · los errores que más repiten los tribunales en la carta y las cuentas: data/comun/errores-frecuentes.json (cuenta,
//     por banco, las opciones erróneas que explica cada error típico: tools/errores-frecuentes.mjs), con los nombres de
//     la taxonomía (src/exams/taxonomia.js);
//   · los errores del propio alumno: src/store/errores.js (solo en su aparato).
//
// Prioridad de una trampa = la de su clase = la suma de la prioridad de las ideas que esa clase enseña
// (ideasPriorizadas, src/course/semana.js: peso del tema × flojedad × frecuencia en el banco del tribunal). Sin etiquetas
// de conceptos, la del tema. «Te cuesta» = la clase enseña alguna idea que el alumno lleva floja.
//
// Recorte: la lectura de estudio va a ~130 palabras por minuto; 15 minutos son ~1950 palabras. Primero entra la mejor
// trampa de cada tema con límite (ninguno se queda sin nada), luego las demás por prioridad mientras quepan, y al final
// las reglas para recordar de las clases elegidas si aún queda sitio.

import { ERRORES, PASOS } from '../exams/taxonomia.js';
import { cuenta } from '../texto.js';

export const MINUTOS_VISPERA = 15;
/** Lectura de estudio (más lenta que la corrida): palabras por minuto con que se mide el repaso. */
export const PALABRAS_POR_MINUTO = 130;
export const PALABRAS_MAX = MINUTOS_VISPERA * PALABRAS_POR_MINUTO;
/** Errores típicos que se enseñan (los propios primero) y, de ellos, los propios como mucho. */
export const MAX_ERRORES = 5;
export const MAX_PROPIOS = 3;
/** Un error del alumno cuenta como «suyo» con al menos estas veces. */
export const MIN_VECES_PROPIO = 2;

/** Palabras de un texto (sin las marcas de énfasis `**`): lo que se cuenta para el recorte. */
export const contarPalabras = (t) => String(t ?? '').replace(/[*_`]/g, ' ').split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;

/** Minutos de lectura de `palabras` (al menos 1). */
export const minutosLectura = (palabras) => Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));

/** Temas con límite de fallos de una titulación, en el orden del examen. */
export const temasConLimite = (estructura) => estructura.bloques.filter((b) => b.maxErrores != null);

/**
 * Las trampas de las clases de un tema: los pasos «ojo» con texto (la misma fuente que las chuletas), con su clase y las
 * reglas para recordar de la clase. Sin repetir textos.
 * @returns {{ leccion: string, leccionTitulo: string, orden: number, trampas: string[], reglas: { regla: string, significado: string }[] }[]}
 */
export function clasesConTrampas(curso, ut, reglas = new Map()) {
  const m = curso?.modulos?.find((x) => x.ut === ut);
  const vistos = new Set();
  return (m?.lecciones ?? []).map((l, orden) => ({
    leccion: l.id, leccionTitulo: l.titulo, orden,
    trampas: l.pasos.filter((p) => p.tipo === 'ojo' && p.texto && !vistos.has(p.texto) && vistos.add(p.texto)).map((p) => p.texto),
    reglas: l.pasos.filter((p) => p.tipo === 'regla' && reglas.has(p.id)).map((p) => ({ regla: reglas.get(p.id).regla, significado: reglas.get(p.id).significado })),
  })).filter((c) => c.trampas.length);
}

/**
 * Los errores a enseñar en el repaso: los del alumno (tres como mucho, con al menos `MIN_VECES_PROPIO` veces, los más
 * repetidos primero) y, hasta `max`, los que más repiten los tribunales de su banco. Cada error con su nombre y su
 * «es lo que sale si…» de la taxonomía; los ids que la taxonomía no conoce se descartan.
 * @param {{ id: string, n: number }[]} tribunal  errores del banco (data/comun/errores-frecuentes.json), de más a menos
 * @param {{ id: string, n: number }[]} propios  errores del alumno (resumen().errores)
 * @returns {{ id, nombre, paso, pasoNombre, si, tribunal: number, tuyo: number }[]}
 */
export function erroresDeLaVispera({ tribunal = [], propios = [], max = MAX_ERRORES, maxPropios = MAX_PROPIOS } = {}) {
  const conoce = (x) => x && ERRORES[x.id];
  const delTribunal = new Map(tribunal.filter(conoce).map((x) => [x.id, x.n]));
  const mios = propios.filter(conoce).filter((x) => x.n >= MIN_VECES_PROPIO).sort((a, b) => b.n - a.n).slice(0, Math.min(maxPropios, max));
  const ids = [...mios.map((x) => x.id)];
  for (const x of tribunal.filter(conoce)) if (ids.length < max && !ids.includes(x.id)) ids.push(x.id);
  const tuyo = new Map(propios.filter(conoce).map((x) => [x.id, x.n]));
  return ids.map((id) => ({ id, nombre: ERRORES[id].nombre, paso: ERRORES[id].paso, pasoNombre: PASOS[ERRORES[id].paso]?.nombre ?? '', si: ERRORES[id].si, tribunal: delTribunal.get(id) ?? 0, tuyo: tuyo.get(id) ?? 0 }));
}

const palabrasError = (e) => contarPalabras(e.nombre) + contarPalabras(`Es lo que sale si ${e.si}`);

/**
 * El repaso exprés: qué trampas se enseñan, en qué orden, y cuánto lee el alumno.
 * @param {object} p
 * @param {object} p.curso  data/curso/<tit>.json
 * @param {object} p.estructura  la del examen (src/theory/blocks.js)
 * @param {Map<string, { regla: string, significado: string }>} [p.reglas]  reglas nemotécnicas por id
 * @param {{ id, ut, prioridad, estado, clases?: string[] }[]} [p.ideas]  ideasPriorizadas con las clases de cada idea
 * @param {{ ut, prioridad }[]} [p.temas]  temasPriorizados (sin etiquetas de conceptos)
 * @param {{ id, n }[]} [p.erroresTribunal]  de data/comun/errores-frecuentes.json para su banco
 * @param {{ id, n }[]} [p.erroresAlumno]  resumen de src/store/errores.js
 * @param {number|null} [p.cartaUt]  tema de carta de la titulación: es donde van los errores típicos
 * @returns {{ temas: { ut, titulo, ico, maxErrores, n, trampas: object[], reglas: object[] }[], errores: object[],
 *   palabras: number, minutos: number, fuera: number, recortado: boolean, vacio: boolean, limite: number }}
 */
export function repasoExpres({ curso, estructura, reglas = new Map(), ideas = [], temas = [], erroresTribunal = [], erroresAlumno = [], cartaUt = null, palabrasMax = PALABRAS_MAX } = {}) {
  const limites = temasConLimite(estructura);
  const errores = cartaUt != null && limites.some((b) => b.ut === cartaUt) ? erroresDeLaVispera({ tribunal: erroresTribunal, propios: erroresAlumno }) : [];
  const palabrasErrores = errores.reduce((s, e) => s + palabrasError(e), 0);
  const porTema = new Map(temas.map((t) => [t.ut, t]));

  // Candidatas: cada trampa con la prioridad de su clase.
  const candidatas = [];
  for (const b of limites) {
    for (const c of clasesConTrampas(curso, b.ut, reglas)) {
      const enlazadas = ideas.filter((i) => (i.clases ?? []).includes(c.leccion));
      const deIdeas = enlazadas.reduce((s, i) => s + (i.prioridad ?? 0), 0);
      const prioridad = deIdeas > 0 ? deIdeas : 0.1 * (porTema.get(b.ut)?.prioridad ?? 0);
      const tuyo = enlazadas.some((i) => i.estado === 'floja');
      c.trampas.forEach((texto, k) => candidatas.push({ ut: b.ut, leccion: c.leccion, leccionTitulo: c.leccionTitulo, orden: c.orden, k, texto, palabras: contarPalabras(texto), prioridad, tuyo, reglas: c.reglas }));
    }
  }
  const mejor = (a, b) => b.prioridad - a.prioridad || a.orden - b.orden || a.k - b.k;
  candidatas.sort(mejor);

  const elegidas = new Set();
  let usadas = palabrasErrores;
  const titulos = new Set(); // clases ya nombradas: su título se cuenta una vez
  const cuesta = (x) => x.palabras + (titulos.has(x.leccion) ? 0 : contarPalabras(x.leccionTitulo));
  const mete = (x) => { elegidas.add(x); usadas += cuesta(x); titulos.add(x.leccion); };
  // A. La mejor de cada tema con límite (los temas, de más a menos prioridad): ninguno se queda sin nada.
  const mejoresDeTema = limites.map((b) => candidatas.find((x) => x.ut === b.ut)).filter(Boolean).sort(mejor);
  for (const x of mejoresDeTema) if (usadas + cuesta(x) <= palabrasMax) mete(x);
  // B. El resto por prioridad, saltando las que ya no caben (puede que quepa una más corta).
  for (const x of candidatas) if (!elegidas.has(x) && usadas + cuesta(x) <= palabrasMax) mete(x);

  // C. Para recordar: una regla por clase elegida (la de más prioridad primero) si aún queda sitio.
  const reglasElegidas = new Map(); // leccion → regla
  for (const x of candidatas) {
    if (!elegidas.has(x) || reglasElegidas.has(x.leccion) || !x.reglas.length) continue;
    const r = x.reglas[0];
    const p = contarPalabras(r.regla) + contarPalabras(r.significado);
    if (usadas + p <= palabrasMax) { reglasElegidas.set(x.leccion, { ...r, palabras: p }); usadas += p; }
  }

  const salida = limites.map((b) => {
    const xs = candidatas.filter((x) => x.ut === b.ut && elegidas.has(x));
    // Dentro del tema, las clases por prioridad y, dentro de la clase, en el orden del curso.
    const clases = [...new Set(xs.map((x) => x.leccion))];
    const trampas = clases.flatMap((l) => xs.filter((x) => x.leccion === l).sort((a, b2) => a.k - b2.k)
      .map((x) => ({ leccion: x.leccion, leccionTitulo: x.leccionTitulo, texto: x.texto, palabras: x.palabras, tuyo: x.tuyo, prioridad: x.prioridad })));
    const reglasTema = clases.filter((l) => reglasElegidas.has(l)).map((l) => ({ leccion: l, ...reglasElegidas.get(l) }));
    return { ut: b.ut, titulo: b.titulo, ico: b.ico, maxErrores: b.maxErrores, n: b.n, trampas, reglas: reglasTema };
  }).filter((t) => t.trampas.length);

  const fuera = candidatas.length - elegidas.size;
  return { temas: salida, errores, palabras: usadas, minutos: minutosLectura(usadas), fuera, recortado: fuera > 0, vacio: !salida.length, limite: palabrasMax };
}

/** Resumen en texto (para `nautica.state()`): el tema, cada trampa con su clase, y los errores. */
export function resumenVispera(r) {
  if (r.vacio) return 'REPASO EXPRÉS DE LA VÍSPERA: aún no hay trampas para esta titulación.';
  return [`REPASO EXPRÉS DE LA VÍSPERA: ${r.palabras} palabras, unos ${cuenta(r.minutos, 'minuto')} de lectura${r.recortado ? ` (recortado: ${r.fuera} trampas menos prioritarias fuera)` : ''}`,
    ...r.temas.map((t) => `# ${t.titulo} (máx. ${cuenta(t.maxErrores, 'fallo')} de ${cuenta(t.n, 'pregunta')}):\n${t.trampas.map((x) => `- [${x.leccionTitulo}]${x.tuyo ? ' (te cuesta)' : ''} ${x.texto.replace(/\*\*/g, '')}`).join('\n')}${t.reglas.map((x) => `\nPARA RECORDAR: ${x.regla} — ${x.significado}`).join('')}`),
    r.errores.length ? `# Errores que más se repiten en la carta:\n${r.errores.map((e) => `- ${e.nombre}${e.tuyo ? ` (tuyo: ${e.tuyo} veces)` : ''}: es lo que sale si ${e.si}`).join('\n')}` : ''].filter(Boolean).join('\n');
}
