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
import { clave, textoPregunta } from '../lib/texto.mjs';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const fechaLarga = (f) => (f ? `${Number(f.slice(8, 10))} de ${MESES[Number(f.slice(5, 7)) - 1]} de ${f.slice(0, 4)}` : null);

/** Tabla de pleamares y bajamares de un bloque de contexto (pdftotext la saca por columnas). */
export function tablaMareas(contexto) {
  if (!contexto || !/pleamar|bajamar|marea/i.test(contexto)) return null;
  const lineas = contexto.split('\n').map((l) => l.trim());
  const filas = [];
  for (const l of lineas) {
    const m = /^(\d{1,2})\s+(\d{1,2}:\d{2})\s+(\d+[,.]\d+)$/.exec(l);
    if (m) filas.push({ dia: Number(m[1]), hora: m[2], altura_m: Number(m[3].replace(',', '.')) });
  }
  if (filas.length) return filas;
  // «Día 19 19 19 · Hora Alt. 05:40 3,24 …» (PY 2016–2018): hora y altura en la misma línea, días en una columna aparte
  // (o el del encabezado «… para el 7 de junio de 2016»).
  const diaCabecera = Number(/para el (\d{1,2}) de/i.exec(contexto)?.[1] ?? NaN);
  const cola = [];
  let ultimo = Number.isFinite(diaCabecera) ? diaCabecera : null;
  for (const l of lineas) {
    if (/^\d{1,2}$/.test(l)) { cola.push(Number(l)); continue; }
    const m = /^(\d{1,2}:\d{2})\s+(-?\d+[,.]\d+)$/.exec(l);
    if (!m) continue;
    if (cola.length) ultimo = cola.shift();
    if (ultimo == null) return null;
    filas.push({ dia: ultimo, hora: m[1], altura_m: Number(m[2].replace(',', '.')) });
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
  // «Convocatoria de junio de 2025 (28 de junio)».
  const [anio, mes] = p.claveConv.split('-');
  const dia = p.fecha ? fechaLarga(p.fecha).replace(/ de \d{4}$/, '') : null;
  return `Convocatoria de ${MESES[Number(mes) - 1]} de ${anio}${dia ? ` (${dia})` : ''}`;
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

const respuestaTexto = (q) => (q.anulada ? 'ANULADA' : q.aceptadas.map((l) => clave(q.opciones[l] ?? '')).sort().join(' + '));
/** Clave de «pregunta idéntica»: mismo enunciado, mismas opciones (sin importar el orden) y misma respuesta por su texto. */
export const claveIdentica = (q) => `${textoPregunta(q)} ## ${respuestaTexto(q)}`;

/**
 * Banco vivo que no se reescribe (config.publicadas = "conservar", Andalucía): las preguntas publicadas quedan tal cual
 * (texto, norma, concepto: lo que se cambie se cambia en el banco con sus herramientas) y se añaden las nuevas detrás.
 * Una nueva idéntica (claveIdentica) a una publicada o a otra nueva anterior no se añade: sus apariciones pasan al
 * apareceEn de aquella. Nunca se une a una pregunta que solo sale en convocatorias reservadas para el examen final
 * (`reservadas`): sacaría esa pregunta de la reserva (en modo «examen», la que sale en una convocatoria pública ya no
 * es reservada). → { preguntas, nuevas, unidas: [{ id, en }], noUnidas: [{ id, igual, motivo }] }
 */
export function anadirConservando(publicadas, extraidas, { reservadas = [] } = {}) {
  const res = new Set(reservadas);
  const deIds = new Set(publicadas.map((q) => q.id));
  const salida = publicadas.map((q) => ({ ...q, apareceEn: [...q.apareceEn] }));
  const indice = new Map();
  const soloReservada = (q) => [q.conv, ...q.apareceEn.map((a) => a.conv)].every((c) => res.has(c));
  const noUnidas = [];
  for (const q of salida) {
    const k = claveIdentica(q);
    if (indice.has(k)) continue;
    if (soloReservada(q)) { indice.set(k, { reservada: q }); continue; }
    indice.set(k, q);
  }
  const orden = (a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '') || a.conv.localeCompare(b.conv) || a.orden - b.orden;
  const unidas = [];
  let nuevas = 0;
  const refA = (a) => `${a.conv}|${a.modelo ?? ''}|${a.numero}`;
  for (const q of extraidas.filter((x) => !deIds.has(x.id)).sort(orden)) {
    const k = claveIdentica(q);
    const otra = indice.get(k);
    if (otra && !otra.reservada) {
      const ya = new Set(otra.apareceEn.map(refA));
      for (const a of q.apareceEn) if (!ya.has(refA(a))) otra.apareceEn.push(a);
      unidas.push({ id: q.id, en: otra.id });
      continue;
    }
    if (otra?.reservada) noUnidas.push({ id: q.id, igual: otra.reservada.id, motivo: 'idéntica a una pregunta reservada para el examen final: unirlas la sacaría de la reserva' });
    salida.push(q);
    nuevas++;
    if (!otra) indice.set(k, q);
  }
  return { preguntas: salida, nuevas, unidas, noUnidas };
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
    let preguntas = d.preguntas.map((p) => aContrato(p, { config, eje, tit })).map((q) => {
      // `revision` (el porqué de la revisión normativa, con su fuente) es documentación del ajuste, no un campo del banco.
      const { revision, ...a } = ajustes[q.id] ?? {};
      if (!Object.keys(a).length) return q;
      const fuera = Object.keys(a).filter((k) => !(k in q));
      if (fuera.length) throw new Error(`${eje}/${tit} ${q.id}: ajuste de campos que no son del contrato (${fuera.join(', ')})`);
      return { ...q, ...a };
    });
    const sinPregunta = Object.keys(ajustes).filter((id) => !preguntas.some((q) => q.id === id));
    if (sinPregunta.length) ctx.avisos.add('escribir', `${tit}: ${sinPregunta.length} ajustes de ids que ya no existen (${sinPregunta.slice(0, 5).join(', ')})`);
    const ruta0 = join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json');
    const extraidas = preguntas;
    if (enData && config.publicadas === 'conservar') {
      const publicadas = leerJSON(ruta0, { preguntas: [] }).preguntas;
      const reservadas = leerJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'), {}).reserva?.[tit] ?? [];
      const r = anadirConservando(publicadas, preguntas, { reservadas });
      preguntas = r.preguntas;
      out[`${tit}-union`] = { nuevas: r.nuevas, unidas: r.unidas.length, noUnidas: r.noUnidas.length };
      escribirJSON(rutaEtapa(eje, 'escribir-union', tit), { unidas: r.unidas, noUnidas: r.noUnidas });
    } else if (enData) {
      // Solo se añade: las preguntas ya publicadas que esta extracción no produce se conservan tal cual (sus ids van en el
      // progreso de los alumnos), y el «concepto» asignado después de extraer no se pierde.
      const publicadas = leerJSON(ruta0, { preguntas: [] }).preguntas;
      const nuevas = new Map(preguntas.map((q) => [q.id, q]));
      for (const v of publicadas) {
        const q = nuevas.get(v.id);
        if (q && q.concepto == null && v.concepto != null) q.concepto = v.concepto;
      }
      const perdidas = publicadas.filter((v) => !nuevas.has(v.id));
      if (perdidas.length) preguntas = [...preguntas, ...perdidas];
      out.conservadas = (out.conservadas ?? 0) + perdidas.length;
    }
    const meta = {
      eje, tit, titulo: `${tit.toUpperCase()} · ${config.nombre}`, generado: hoy(), fuente: config.indice ?? null,
      descripcion: config.descripcion?.[tit] ?? `Preguntas de los exámenes oficiales de ${tit === 'per' ? 'Patrón de Embarcaciones de Recreo' : 'Patrón de Yate'} de ${config.organismo}, extraídas con tools/bancos (npm run bancos -- ${eje}).`,
    };
    const ruta = enData ? join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json') : join(cacheEje(eje), 'salida', tit, 'preguntas.json');
    escribirTexto(ruta, textoBanco(meta, preguntas));
    // La salida tal como sale de los PDF, sin unir con el banco vivo: la usa la prueba de oro (Andalucía).
    if (enData && config.publicadas === 'conservar') escribirTexto(join(cacheEje(eje), 'salida', tit, 'preguntas.json'), textoBanco(meta, extraidas));
    out[tit] = { preguntas: preguntas.length, ruta: ruta.replace(`${RAIZ}/`, '') };
  }
  if (enData && config.ficha) {
    const ficha = { ...config.ficha, estado: config.ficha.estado ?? 'borrador' };
    escribirJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'), ficha);
  }
  return out;
}
