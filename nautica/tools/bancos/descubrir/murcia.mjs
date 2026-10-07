// Descubrimiento de documentos de Murcia (CARM). carm.es protege sus páginas con un CAPTCHA (Radware) y su aviso legal
// solo autoriza el uso personal no comercial: NO se descarga nada. El manifiesto sale del inventario verificado a mano
// (ejes/murcia/manifiesto_murcia.csv, copiado de research_notes/…/murcia_herramientas/manifest_murcia.csv: solo
// metadatos — URL, nombre del fichero y tamaño publicado —, ninguna pregunta). El usuario descarga los PDF con su
// navegador y los deja en .cache/bancos/murcia/pdf/ con el nombre de la columna archivo_local; la etapa manifiesto (y
// ejes/murcia/verificar.mjs) comprueba cada uno (cabecera %PDF, tamaño publicado, CAPTCHA guardado como .pdf).
// Entran los de prioridad A (PER y PY, Tipo 1 y, en junio de 2026, Tipo 2).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dirEje } from '../lib/comun.mjs';

/** CSV sencillo con comillas dobles (los tamaños llevan coma decimal: "236,37 KB"). Exportada para los tests. */
export function leerCSV(texto) {
  const filas = [];
  for (const linea of texto.split(/\r?\n/)) {
    if (!linea.trim()) continue;
    const campos = [];
    let actual = '';
    let comillas = false;
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      if (comillas) {
        if (c === '"' && linea[i + 1] === '"') { actual += '"'; i++; } else if (c === '"') comillas = false; else actual += c;
      } else if (c === '"') comillas = true;
      else if (c === ',') { campos.push(actual); actual = ''; } else actual += c;
    }
    campos.push(actual);
    filas.push(campos);
  }
  const [cab, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

const TIT = { PER: 'per', PY: 'py' };

/** Fila del inventario → documento del manifiesto (o null si no es PER/PY de prioridad A). Exportada para los tests. */
export function documento(r, config) {
  const tit = TIT[r.titulacion];
  if (r.prioridad !== 'A' || !tit) return null;
  const clave = `${r.anio}-${r.mes}`;
  const dia = /_d(\d{2})\.pdf$/.exec(r.archivo_local)?.[1] ?? null;
  const modelo = dia ? `${r.tipo}-d${dia}` : r.tipo;
  const c = config.convocatorias.find((x) => x.clave === clave);
  const fechas = c?.fechas ?? {};
  return {
    id: r.archivo_local.replace(/\.pdf$/i, ''),
    conv: `mur-${tit}-${clave}`, tit, modelo, rol: 'cuestionario', conRespuestas: true,
    claveConv: clave, url: r.pdf_url, pagina: r.pagina_url,
    fecha: fechas[`${tit}-d${dia}`] ?? fechas[tit] ?? null,
    anio: Number(r.anio), convocatoria: r.conv,
    archivo: r.archivo_local, nombreServidor: r.nombre_servidor, tamanoPublicado: r.tam_publicado || null,
    bytes: null, sha256: null,
  };
}

export async function descubrir(config, { avisos } = {}) {
  const filas = leerCSV(readFileSync(join(dirEje('murcia'), 'manifiesto_murcia.csv'), 'utf8'));
  const docs = filas.map((r) => documento(r, config)).filter(Boolean);
  const claves = new Set(config.convocatorias.map((c) => c.clave));
  for (const d of docs) if (!claves.has(d.claveConv)) avisos?.add('manifiesto', `${d.archivo}: convocatoria ${d.claveConv} sin entrada en config.json`);
  return docs;
}
