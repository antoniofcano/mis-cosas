// Etapa 2 · extraer
// Entrada: manifiesto (documentos ya en la caché) y config.json (adaptador por titulación o por convocatoria).
// Salida: .cache/bancos/<eje>/etapas/extraer-<tit>.json → { apariciones: [...] }: cada pregunta tal como aparece en un
// examen concreto (convocatoria, modelo, número), con su respuesta oficial tal como la da la fuente (letras, estado).
// Adaptadores (uno por formato, en adaptadores/): plantilla-aparte, respuesta-en-linea, subrayado, hoja-optica, ocr.
import { rutaEtapa, escribirJSON } from '../lib/comun.mjs';
import { documentosActivos, manifiesto } from './manifiesto.mjs';

export async function asegurarDocumentos(ctx) {
  if (ctx.documentos) return;
  const opciones = ctx.opciones;
  ctx.opciones = { ...opciones, descubrir: false, sinRed: true };
  try { await manifiesto(ctx); } finally { ctx.opciones = opciones; }
}

export async function extraer(ctx) {
  await asegurarDocumentos(ctx);
  const out = {};
  for (const tit of ctx.tits) {
    const cfg = ctx.config.adaptador;
    const nombres = new Set([typeof cfg === 'string' ? cfg : cfg[tit]]);
    for (const c of ctx.config.convocatorias) if (c.adaptador) nombres.add(c.adaptador);
    const apariciones = [];
    const resumen = {};
    for (const nombre of nombres) {
      if (!nombre) continue;
      const mod = await import(`../adaptadores/${nombre}.mjs`);
      // Si una convocatoria declara su propio adaptador, solo ese la procesa.
      const propias = new Set(ctx.config.convocatorias.filter((c) => c.adaptador === nombre).map((c) => c.clave));
      const porDefecto = nombre === (typeof cfg === 'string' ? cfg : cfg[tit]);
      const docs = ctx.documentos.filter((d) => {
        const c = ctx.config.convocatorias.find((x) => x.clave === d.claveConv);
        return c?.adaptador ? propias.has(d.claveConv) : porDefecto;
      });
      const r = await mod.extraer({ ...ctx, documentos: docs }, tit);
      apariciones.push(...r.apariciones);
      resumen[nombre] = r.resumen;
    }
    escribirJSON(rutaEtapa(ctx.eje, 'extraer', tit), { eje: ctx.eje, tit, apariciones });
    out[tit] = resumen;
  }
  return out;
}

export { documentosActivos };
