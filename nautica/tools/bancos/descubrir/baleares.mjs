// Descubrimiento de documentos de las Illes Balears: lee la página castellana de cada convocatoria
// (caib.es/sites/transportmaritim/es/<slug>/) y recoge sus enlaces «archivopub.do?…&id=N». El texto del enlace no
// basta para clasificarlos («Ibiza», «modelo B», «2º Turno»…): se descarga cada PDF a la caché y se lee su cabecera
// («Examen: Prova teòrica PER RD 875/2014 / Convocatòria / Model d’examen»), que dice titulación, modelo e idioma.
// Roles: cuestionario (PER o PY en castellano) · traduccion (el mismo examen en catalán) · especifico (PER específico,
// preguntas 28–45 de un PER completo) · anexo (tablas de mareas escaneadas, sin texto). Los de CY, PNB y moto náutica
// no entran en el manifiesto.
// Las páginas se guardan en .cache/bancos/baleares/paginas/ y se reutilizan (el servidor da «502 Proxy Error» si se
// le piden muchas cosas seguidas).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cacheEje, escribirTexto } from '../lib/comun.mjs';
import { descargar, descargarPagina, esPDF } from '../lib/descarga.mjs';
import { leerPDF } from '../adaptadores/respuesta-en-linea.mjs';

const BASE = 'https://www.caib.es/sites/transportmaritim/es/';
const espera = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const ENTIDADES = { nbsp: ' ', amp: '&', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ordm: 'º', ordf: 'ª', middot: '·', laquo: '«', raquo: '»' };
const VOCAL = { acute: '\u0301', grave: '\u0300', uml: '\u0308', tilde: '\u0303', cedil: '\u0327' };
/** Texto de un fragmento HTML: sin etiquetas y con las entidades (&aacute;, &ordm;, &#237;…) resueltas. */
export const sinEtiquetas = (s) => s.replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, e) => ENTIDADES[e] ?? (/^([a-z])(acute|grave|uml|tilde|cedil)$/i.test(e) ? `${e[0]}${VOCAL[e.slice(1)]}`.normalize('NFC') : m))
  .replace(/\s+/g, ' ').trim();

/** Enlaces a archivopub de una página: [{ pdf, texto, contexto }] (contexto = último encabezado o negrita). Exportada para los tests. */
export function enlacesArchivo(html) {
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0] ?? html;
  const out = [];
  let contexto = '';
  for (const m of main.matchAll(/<(h[2-6]|strong|b)[^>]*>([\s\S]*?)<\/\1>|<a [^>]*href="([^"]*archivopub[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (m[1]) { const c = sinEtiquetas(m[2]); if (c) contexto = c; continue; }
    const id = /id=(\d+)/.exec(m[3].replace(/&amp;/g, '&'))?.[1];
    if (id && !out.some((x) => x.pdf === id)) out.push({ pdf: id, texto: sinEtiquetas(m[4]), contexto });
  }
  return out;
}

export const urlPDF = (id) => `${BASE}archivopub.do?ctrl=MCRST165ZI${id}&id=${id}`;

function pagina(eje, url, leerPagina) {
  const slug = url.replace(BASE, '').replace(/\/$/, '');
  const local = join(cacheEje(eje), 'paginas', `${slug}.html`);
  if (existsSync(local)) return readFileSync(local, 'utf8');
  const html = leerPagina(url);
  escribirTexto(local, html);
  espera(1500);
  return html;
}

export async function descubrir(config, { avisos, todas = false, leerPagina = descargarPagina } = {}) {
  const eje = config.eje;
  const docs = [];
  for (const c of config.convocatorias) {
    if (!c.activa && !todas) continue;
    const enlaces = enlacesArchivo(pagina(eje, c.pagina, leerPagina));
    for (const e of enlaces) {
      if (/capit|moto|\bpnb\b|\bpnv\b|navegaci[oó]n b[aá]sica|acord|llistat|list|qualifica|calificac|resoluci/i.test(`${e.texto}`) && !/\bper\b|recreo|yate|\biot\b|\bpor\b/i.test(e.texto)) continue;
      const archivo = `${e.pdf}.pdf`;
      const local = join(cacheEje(eje), 'pdf', archivo);
      if (!existsSync(local)) {
        const r = descargar(urlPDF(e.pdf), local);
        espera(config.descarga?.pausa ?? 2000);
        if (!r.ok) { avisos?.add('manifiesto', `${c.clave}: no se pudo descargar el PDF ${e.pdf} (${e.texto}): ${r.motivo}`); continue; }
      }
      if (!esPDF(local)) continue;
      const exs = leerPDF(local);
      const base = { claveConv: c.clave, url: urlPDF(e.pdf), pagina: c.pagina, fecha: c.fecha, archivo, pdf: e.pdf, texto: e.texto, contexto: e.contexto, tamanoPublicado: null, bytes: null, sha256: null };
      if (!exs.length) {
        if (/marea/i.test(`${e.texto} ${e.contexto}`)) docs.push({ ...base, id: `${c.clave}_anexo_${e.pdf}`, conv: `${config.prefijo}-${c.clave}`, tit: null, modelo: null, rol: 'anexo', idioma: null });
        continue;
      }
      const ex = exs[0];
      const tit = ex.tipo === 'per-especifico' ? 'per' : ex.tipo;
      if (!['per', 'py'].includes(tit)) continue;
      const rol = ex.tipo === 'per-especifico' || (tit === 'per' && ex.preguntas.length < 40) ? 'especifico' : ex.idioma === 'es' ? 'cuestionario' : 'traduccion';
      docs.push({ ...base, id: `${c.clave}_${tit}_${(ex.modelo ?? "x").replace(/\//g, "")}_${e.pdf}`, conv: `${config.prefijo}-${tit}-${c.clave}`, tit, modelo: ex.modelo, rol, idioma: ex.idioma, isla: isla(`${ex.cabecera.examen} ${e.texto} ${e.contexto}`) });
    }
    for (const tit of ['per', 'py']) {
      if (!docs.some((d) => d.claveConv === c.clave && d.tit === tit && d.rol === 'cuestionario') && (tit === 'per' || !/-09$/.test(c.clave))) avisos?.add('manifiesto', `${c.clave}: la página no enlaza ningún cuestionario ${tit.toUpperCase()} en castellano`);
    }
  }
  return docs;
}

function isla(t) {
  const s = t.toLowerCase();
  const islas = [];
  if (/mallorca|palma/.test(s)) islas.push('Mallorca');
  if (/menorca|ma[óo]\b|mah[óo]n/.test(s)) islas.push('Menorca');
  if (/eivissa|ibiza|e[ïi]vissa/.test(s)) islas.push('Eivissa');
  return islas.length ? islas.join(' y ') : null;
}
