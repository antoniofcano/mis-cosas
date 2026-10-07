// Etapa 8 · escribir
// Entrada: normativa-<tit>.json y validar-<tit>.json. Salida (según config.salida):
//   "data"  → data/ejes/<eje>/<tit>/preguntas.json y data/ejes/<eje>/eje.json (ficha de config.ficha, estado «borrador»).
//             Solo si la validación no tiene errores.
//   "cache" → .cache/bancos/<eje>/salida/<tit>/preguntas.json (Andalucía: nunca se sobrescribe el banco vivo; Murcia:
//             la licencia no permite publicarlo).
// Formato del contrato (bancos-esquema): todas las claves siempre presentes, una pregunta por línea.
// Ajustes a mano (opcional): tools/bancos/ejes/<eje>/ajustes.json → { "<tit>": { "<id>": { campo: valor } } }, revisados
// pregunta a pregunta y con su motivo en el propio valor (norma revisada contra el BOE, concepto, requiere…). Se aplican
// sobre la pregunta ya en el formato del contrato; solo campos del contrato.
import { join } from 'node:path';
import { RAIZ, cacheEje, dirEje, escribirJSON, escribirTexto, hoy, leerJSON, rutaEtapa } from '../lib/comun.mjs';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const fechaLarga = (f) => (f ? `${Number(f.slice(8, 10))} de ${MESES[Number(f.slice(5, 7)) - 1]} de ${f.slice(0, 4)}` : null);

/** Tabla de pleamares y bajamares de un bloque de contexto (pdftotext la saca por columnas). */
export function tablaMareas(contexto) {
  if (!contexto || !/pleamar|bajamar/i.test(contexto)) return null;
  const lineas = contexto.split('\n').map((l) => l.trim());
  const filas = [];
  for (const l of lineas) {
    const m = /^(\d{1,2})\s+(\d{1,2}:\d{2})\s+(\d+[,.]\d+)$/.exec(l);
    if (m) filas.push({ dia: Number(m[1]), hora: m[2], altura_m: Number(m[3].replace(',', '.')) });
  }
  if (filas.length) return filas;
  const dias = lineas.filter((l) => /^\d{1,2}$/.test(l)).map(Number);
  const horas = lineas.filter((l) => /^\d{1,2}:\d{2}$/.test(l));
  const alturas = lineas.filter((l) => /^-?\d+[,.]\d{1,2}$/.test(l)).map((x) => Number(x.replace(',', '.')));
  if (horas.length && horas.length === alturas.length && dias.length >= horas.length) {
    return horas.map((h, i) => ({ dia: dias[dias.length - horas.length + i], hora: h, altura_m: alturas[i] }));
  }
  return null;
}

/** Etiqueta de la convocatoria. */
export function etiquetaConv(p, config) {
  const c = config.convocatorias.find((x) => x.clave === p.claveConv);
  if (c?.titulo) return c.titulo;
  if (config.ids === 'andalucia') {
    const [anio, n] = p.claveConv.split('-c');
    return `${n}ª convocatoria ${anio}${p.fecha ? ` (${fechaLarga(p.fecha)})` : ''}`;
  }
  const [anio, mes] = p.claveConv.split('-');
  return `${MESES[Number(mes) - 1].replace(/^./, (x) => x.toUpperCase())} de ${anio}${p.fecha ? ` (${fechaLarga(p.fecha)})` : ''}`;
}

export function aContrato(p, { config, eje, tit }) {
  const pyAndalucia = config.ids === 'andalucia' && tit === 'py';
  const notas = [...(p.notasCorreccion ?? [])];
  return {
    id: p.id, eje, tit, conv: p.conv, convocatoria: etiquetaConv(p, config), fecha: p.fecha ?? null,
    numero: p.numero, orden: p.orden, modulo: p.modulo ?? null, ut: p.ut, ut_titulo: p.ut_titulo, bloque: p.bloque ?? null,
    enunciado: p.enunciado, opciones: p.opciones,
    correcta: p.correcta, aceptadas: p.aceptadas, anulada: p.anulada,
    requiere: p.requiere ?? [], figuras: p.figuras ?? [], contexto: p.contexto ?? null, tabla_mareas: p.tabla_mareas ?? tablaMareas(p.contexto),
    apareceEn: p.apareceEn.map((a) => (pyAndalucia ? { conv: a.conv, modelo: null, numero: a.orden } : { conv: a.conv, modelo: a.modelo ?? null, numero: a.numero })),
    fuentes: { examen: p.fuentes?.examen ?? null, plantilla: p.fuentes?.plantilla ?? null, pagina: p.fuentes?.pagina ?? null, correccion: p.fuentes?.correccion ?? null },
    norma: p.norma ?? { estado: 'vigente' },
    concepto: p.concepto ?? null,
    notas: notas.join(' '),
  };
}

/** JSON con una pregunta por línea. */
export function textoBanco(meta, preguntas) {
  return `{"meta": ${JSON.stringify(meta)},\n"preguntas": [\n${preguntas.map((q) => JSON.stringify(q)).join(',\n')}\n]}\n`;
}

export async function escribir(ctx) {
  const { config, eje } = ctx;
  const out = {};
  const enData = config.salida === 'data';
  for (const tit of ctx.tits) {
    const d = leerJSON(rutaEtapa(eje, 'normativa', tit));
    const v = leerJSON(rutaEtapa(eje, 'validar', tit), { errores: ['falta la etapa validar'] });
    if (enData && v.errores.length) throw new Error(`${eje}/${tit}: ${v.errores.length} errores de validación; no se escribe en data/ejes (ver tools/bancos/informes/${eje}.md)`);
    const ajustes = leerJSON(join(dirEje(eje), 'ajustes.json'), {})[tit] ?? {};
    const preguntas = d.preguntas.map((p) => aContrato(p, { config, eje, tit })).map((q) => {
      const a = ajustes[q.id];
      if (!a) return q;
      const fuera = Object.keys(a).filter((k) => !(k in q));
      if (fuera.length) throw new Error(`${eje}/${tit} ${q.id}: ajuste de campos que no son del contrato (${fuera.join(', ')})`);
      return { ...q, ...a };
    });
    const sinPregunta = Object.keys(ajustes).filter((id) => !preguntas.some((q) => q.id === id));
    if (sinPregunta.length) ctx.avisos.add('escribir', `${tit}: ${sinPregunta.length} ajustes de ids que ya no existen (${sinPregunta.slice(0, 5).join(', ')})`);
    const meta = {
      eje, tit, titulo: `${tit.toUpperCase()} · ${config.nombre}`, generado: hoy(), fuente: config.indice ?? null,
      descripcion: config.descripcion?.[tit] ?? `Preguntas de los exámenes oficiales de ${tit === 'per' ? 'Patrón de Embarcaciones de Recreo' : 'Patrón de Yate'} de ${config.organismo}, extraídas con tools/bancos (npm run bancos -- ${eje}).`,
    };
    const ruta = enData ? join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json') : join(cacheEje(eje), 'salida', tit, 'preguntas.json');
    escribirTexto(ruta, textoBanco(meta, preguntas));
    out[tit] = { preguntas: preguntas.length, ruta: ruta.replace(`${RAIZ}/`, '') };
  }
  if (enData && config.ficha) {
    const ficha = { ...config.ficha, estado: config.ficha.estado ?? 'borrador' };
    escribirJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'), ficha);
  }
  return out;
}
