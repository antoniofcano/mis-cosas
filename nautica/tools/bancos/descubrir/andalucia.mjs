// Descubrimiento de documentos de Andalucía: lee la página de cada convocatoria del portal de la Junta y clasifica
// los enlaces PDF por su nombre. Convenciones de nombre (2015–2026): C = cuestionario; P o SOL = plantilla (hoja de
// respuestas escaneada); «_Corregida», «definitiva», «REVISADO» = plantilla revisada. Se descartan PNB, CY y PER reducido
// (el PER reducido repite las preguntas 28–45 del PER). El resto de PDF de la página (notas informativas, acuerdos de
// anulación) se guardan con rol «correccion».
import { descargarPagina } from '../lib/descarga.mjs';

const BASE = 'https://www.juntadeandalucia.es';

/** Clasifica un nombre de fichero. Devuelve null si no es un documento PER/PY. Exportada para los tests. */
export function clasificarNombre(nombre) {
  const n = nombre.toLowerCase().replace(/\.pdf$/, '');
  const m = /^(\d{4})[-_](\d)(?:t-?|-|_)?(c|p|sol)[-_](.*)$/.exec(n);
  if (!m) {
    if (/nota|anula|tribunal|acuerdo|errat/.test(n)) return { rol: 'correccion', tit: null, modelo: null };
    return null;
  }
  const rol = m[3] === 'c' ? 'cuestionario' : 'plantilla';
  const resto = m[4];
  if (/reducido|pnb|(^|[-_])cy[-_]/.test(resto)) return null;
  let tit = null;
  let modelo = null;
  if (/^per[-_]/.test(resto)) {
    tit = 'per';
    const mm = /(?:examen|modelo)[-_]?([ab])(?![a-z])/.exec(resto);
    modelo = mm ? mm[1].toUpperCase() : null;
  } else if (/^py[-_]/.test(resto)) {
    tit = 'py';
    const mod = /generico/.test(resto) ? 'generico' : /navegacion/.test(resto) ? 'navegacion' : null;
    const ab = /(?:generico|navegacion)-([ab])(?![a-z])/.exec(resto);
    modelo = mod && ab ? `${mod}-${ab[1].toUpperCase()}` : mod;
  } else return null;
  const revisada = /corregid|definitiva|revisad/.test(resto);
  return { rol, tit, modelo, revisada };
}

export function enlacesPDF(html) {
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0] ?? html;
  return [...main.matchAll(/href="([^"]+\.pdf)"/gi)]
    .map((m) => m[1].replace(/^http:\/\//, 'https://'))
    .map((u) => (u.startsWith('/') ? BASE + u : u))
    .filter((u) => !/Certificado_de_Conformidad/i.test(u));
}

export async function descubrir(config, { avisos, todas = false, leerPagina = descargarPagina } = {}) {
  const docs = [];
  for (const c of config.convocatorias) {
    if ((!c.activa && !todas) || !c.pagina) continue; // sin página: convocatoria derivada (PY 2018-c1b)
    const html = leerPagina(c.pagina);
    const vistos = new Set();
    for (const url of enlacesPDF(html)) {
      if (vistos.has(url)) continue;
      vistos.add(url);
      const nombre = decodeURIComponent(url.split('/').pop());
      const k = clasificarNombre(nombre);
      if (!k) continue;
      const [anio, num] = c.clave.split('-');
      const conv = k.tit === 'py' ? `and-py-${c.clave}` : `and-${c.clave}`;
      const id = [c.clave, k.tit ?? 'comun', k.modelo ?? '', k.rol, k.rol === 'correccion' ? nombre.replace(/\.pdf$/i, '') : ''].filter(Boolean).join('_');
      docs.push({
        id, conv: k.tit ? conv : `and-${c.clave}`, tit: k.tit, modelo: k.modelo, rol: k.rol, revisada: k.revisada ?? false,
        claveConv: c.clave, url, pagina: c.pagina, fecha: c.fecha, anio: Number(anio), convocatoria: num,
        archivo: `${id}.pdf`, tamanoPublicado: null, bytes: null, sha256: null,
      });
    }
    const roles = docs.filter((d) => d.pagina === c.pagina);
    for (const tit of c.titulaciones ?? ['per', 'py']) {
      if (!roles.some((d) => d.tit === tit && d.rol === 'cuestionario')) avisos?.add('manifiesto', `${c.clave}: la página no enlaza cuestionario ${tit.toUpperCase()}`);
      if (!roles.some((d) => d.tit === tit && d.rol === 'plantilla')) avisos?.add('manifiesto', `${c.clave}: la página no enlaza plantilla ${tit.toUpperCase()}`);
    }
  }
  return docs;
}
