// Etapa 1 · manifiesto
// Entrada: config.json del eje (+ las páginas oficiales si se pide --descubrir).
// Salida: tools/bancos/ejes/<eje>/manifiesto.json (se sube) y los PDF en .cache/bancos/<eje>/pdf/ (nunca se suben).
// Cada documento: url, conv, titulación, modelo, rol (cuestionario | plantilla | correccion | anexo), tamaño publicado si
// se conoce, sha256 y bytes una vez descargado, fecha.
// En los ejes de descarga manual (Murcia, CAPTCHA) la etapa NO descarga: solo verifica los ficheros que el usuario deja en
// la caché contra el manifiesto (cabecera %PDF y tamaño publicado).
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cacheEje, dirEje, escribirJSON, hoy, leerJSON } from '../lib/comun.mjs';
import { descargar, esPDF, sha256, UA_NAVEGADOR } from '../lib/descarga.mjs';

export const rutaManifiesto = (eje) => join(dirEje(eje), 'manifiesto.json');
export const rutaPDF = (eje, doc) => join(cacheEje(eje), 'pdf', doc.archivo);

/** Documentos del manifiesto que entran en esta ejecución (convocatorias activas y titulación pedida). */
export function documentosActivos(manifiesto, config, { tit, todas = false } = {}) {
  const activas = new Set(config.convocatorias.filter((c) => c.activa || todas).map((c) => c.clave));
  return manifiesto.documentos.filter((d) => activas.has(d.claveConv ?? claveDe(d)) && (!tit || !d.tit || d.tit === tit));
}
const claveDe = (d) => d.conv.replace(/^[a-z]+-(py-|per-)?/, '');

/** Tamaño publicado («366,19 KB», «0,67 MB») → bytes aproximados y tolerancia. */
export function tamanoPublicado(texto) {
  if (!texto) return null;
  const m = /([\d.,]+)\s*(KB|MB)/i.exec(texto);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, '').replace(',', '.'));
  const mb = m[2].toUpperCase() === 'MB';
  return { bytes: Math.round(n * (mb ? 1024 * 1024 : 1024)), tolerancia: mb ? 6 * 1024 : 1024 };
}

export async function manifiesto(ctx) {
  const { eje, config, opciones, avisos } = ctx;
  const ruta = rutaManifiesto(eje);
  let man = leerJSON(ruta, null);
  if (!man || opciones.descubrir) {
    const { descubrir } = await import(`../descubrir/${eje}.mjs`);
    const nuevos = await descubrir(config, { avisos, todas: opciones.todas });
    const previos = new Map((man?.documentos ?? []).map((d) => [d.id, d]));
    for (const d of nuevos) {
      const p = previos.get(d.id);
      if (p && p.url === d.url) Object.assign(d, { bytes: p.bytes, sha256: p.sha256, descargado: p.descargado });
    }
    // Conserva los documentos ya conocidos de convocatorias que no se han vuelto a leer en esta ejecución.
    const ids = new Set(nuevos.map((d) => d.id));
    const resto = (man?.documentos ?? []).filter((d) => !ids.has(d.id) && !nuevos.some((n) => n.pagina === d.pagina));
    man = { eje, generado: hoy(), fuente: config.indice ?? null, documentos: [...nuevos, ...resto] };
  }
  const docs = documentosActivos(man, config, opciones);
  const manual = config.descarga?.manual;
  const ua = config.descarga?.userAgent ? UA_NAVEGADOR : 'curl/8';
  let nuevos = 0;
  for (const d of docs) {
    const local = rutaPDF(eje, d);
    if (!existsSync(local)) {
      if (manual) { d.estadoLocal = 'falta'; continue; }
      if (opciones.sinRed) { avisos.add('manifiesto', `falta en la caché: ${d.archivo}`); continue; }
      const rangos = (config.descarga?.rangos ?? []).some((s) => d.url.includes(s));
      const r = descargar(d.url, local, { ua, rangos });
      if (!r.ok) { avisos.add('manifiesto', `no se pudo descargar ${d.url}: ${r.motivo}`); d.estadoLocal = 'error'; continue; }
      nuevos++;
      d.descargado = hoy();
    }
    if (!esPDF(local)) { d.estadoLocal = 'no-pdf'; avisos.add('manifiesto', `${d.archivo}: no es un PDF (¿página de CAPTCHA guardada?)`); continue; }
    const bytes = statSync(local).size;
    const hash = sha256(local);
    const pub = tamanoPublicado(d.tamanoPublicado);
    if (pub && Math.abs(bytes - pub.bytes) > pub.tolerancia) {
      d.estadoLocal = 'tamano';
      avisos.add('manifiesto', `${d.archivo}: ${bytes} B frente a ${d.tamanoPublicado} publicados`);
      continue;
    }
    if (d.sha256 && d.sha256 !== hash) avisos.add('manifiesto', `${d.archivo}: el sha256 ha cambiado desde la última descarga (¿el organismo lo ha sustituido?)`);
    Object.assign(d, { bytes, sha256: hash, estadoLocal: 'ok' });
  }
  // El estado local es de esta máquina: no se guarda en el manifiesto.
  const guardar = { ...man, documentos: man.documentos.map(({ estadoLocal, ...d }) => d) };
  escribirJSON(ruta, guardar);
  const resumen = {
    documentos: docs.length, nuevos,
    ok: docs.filter((d) => d.estadoLocal === 'ok').length,
    faltan: docs.filter((d) => d.estadoLocal === 'falta').map((d) => d.archivo),
    problemas: docs.filter((d) => ['error', 'no-pdf', 'tamano'].includes(d.estadoLocal)).map((d) => `${d.archivo} (${d.estadoLocal})`),
  };
  ctx.manifiesto = man;
  ctx.documentos = docs;
  return resumen;
}
