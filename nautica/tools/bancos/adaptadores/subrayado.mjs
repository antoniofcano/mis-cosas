// Adaptador «subrayado» (Murcia, CARM 2015–2026): cuestionario «con respuestas» en PDF de texto (Word/PDF24) en el que
// la opción correcta va subrayada. El subrayado es una línea vectorial que pdftotext no ve: las preguntas salen de
// pdftotext (lib/cuestionario.mjs) y la respuesta, de py/subrayado.py (PyMuPDF), emparejadas por número de pregunta.
// Cada examen (convocatoria + tipo) es un solo PDF, sin plantilla aparte ni correcciones publicadas.
// Lecturas que no son «una opción subrayada» → respuesta dudosa (al informe):
//   ninguna → sin respuesta (error de validación hasta que se resuelva a mano en ejes/murcia/correcciones.json);
//   dos o tres → se aceptan, marcadas como dudosas; las cuatro → anulada (PY de noviembre de 2015, P31).
// Licencia: uso personal no comercial; la salida va solo a la caché (config.salida = "cache").
import { execFileSync } from 'node:child_process';
import { rutaPDF } from '../etapas/manifiesto.mjs';
import { analizarCuestionario } from '../lib/cuestionario.mjs';
import { python } from '../lib/comun.mjs';
import { clave } from '../lib/texto.mjs';
import { reponerGuiones } from './hoja-optica.mjs';

export const REGLAS_MURCIA = {
  // «1. …», «1.- …», «17.-  …» y «3.-» solo en su línea (el enunciado sigue debajo).
  numero: /^(\d{1,2})\s*(?:\.\s*-?|-)(?![\d/])\s*(.*)$/,
  opcion: /^([a-dA-D])\s*\)\s*(.*)$/,
  seccion: (l) => {
    const m = /^Unidad\s+te[óo]rica\s*(\d+)\s*:?\s*(.*)$/i.exec(l);
    return m ? `${Number(m[1])}|${m[2].replace(/\s*\(preguntas.*$/i, '').trim()}` : null;
  },
  // Pies y cabeceras: «1/10», «P.Y. - Tipo 1», «P.E.R. - Tipo 1», «MÓDULO GENÉRICO», «EXAMEN TIPO 1», la portada final
  // «PY - TIPO 1» y el rótulo «ESPACIO PARA OPERACIONES» de las preguntas de carta.
  ruido: (l) => /^\d+\s*\/\s*\d+$/.test(l)
    || /^P\.?\s?[EY]\.?\s?(R\.?)?\s*-\s*Tipo\s*\d/i.test(l)
    || /^(PY|PER|P\.E\.R\.|P\.Y\.)\s*-\s*TIPO\s*\d$/i.test(l)
    || /^(M[ÓO]DULO\s+(GEN[ÉE]RICO|DE\s+NAVEGACI[ÓO]N)|EXAMEN\s+TIPO\s*\d|ESPACIO PARA OPERACIONES)\s*$/i.test(l),
  inicio: /^Unidad\s+te[óo]rica\s*1\b/i,
  maxNumero: 45,
};

const pdftotextCon = (pdf, ...args) => execFileSync('pdftotext', [...args, pdf, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

export function leerCuestionario(pdf) {
  const texto = reponerGuiones(pdftotextCon(pdf), pdftotextCon(pdf, '-raw'));
  return analizarCuestionario(texto, REGLAS_MURCIA).examenes[0].preguntas;
}

/** Subrayados de varios PDF en un solo proceso de Python → { [pdf]: { preguntas } | { error } } */
export function leerSubrayados(pdfs) {
  if (!pdfs.length) return {};
  return Object.fromEntries(python('subrayado.py', pdfs).map((r) => [r.archivo, r]));
}

/** Lectura del subrayado de una pregunta → respuesta de la aparición (formato de la etapa correcciones). */
export function respuestaSubrayado(s) {
  if (!s) return { letras: [], estado: 'sin-lectura', origen: 'subrayado' };
  const n = s.subrayadas.length;
  const estado = n === 1 ? 'ok' : n === 0 ? 'sin-subrayado' : n === 4 ? 'multiple' : 'dudosa';
  return { letras: [...s.subrayadas], estado, origen: 'subrayado', cobertura: s.cobertura };
}

/** ¿El texto de la pregunta de pdftotext y el de PyMuPDF empiezan igual? (comprueba el emparejamiento por número) */
export function mismoInicio(enunciado, inicio) {
  const a = clave(enunciado).slice(0, 18);
  const b = clave(inicio).slice(0, 18);
  return !a || !b || a.startsWith(b.slice(0, 12)) || b.startsWith(a.slice(0, 12));
}

export function extraer(ctx, tit) {
  const { eje, avisos } = ctx;
  const docs = ctx.documentos.filter((d) => d.tit === tit && d.rol === 'cuestionario' && d.estadoLocal === 'ok');
  const faltan = ctx.documentos.filter((d) => d.tit === tit && d.estadoLocal !== 'ok').length;
  const subrayados = leerSubrayados(docs.map((d) => rutaPDF(eje, d)));
  const apariciones = [];
  const n = tit === 'per' ? 45 : 40;
  const lecturas = { ok: 0, 'sin-subrayado': 0, dudosa: 0, multiple: 0, 'sin-lectura': 0 };
  for (const d of docs) {
    const pdf = rutaPDF(eje, d);
    const preguntas = leerCuestionario(pdf);
    const s = subrayados[pdf];
    if (s?.error) avisos.add('extraer', `${d.archivo}: no se pudo leer el subrayado (${s.error})`);
    const porNumero = new Map((s?.preguntas ?? []).map((x) => [x.n, x]));
    if (preguntas.length !== n) avisos.add('extraer', `${d.archivo}: ${preguntas.length} preguntas en el texto (se esperaban ${n})`);
    if (s?.preguntas && s.preguntas.length !== preguntas.length) avisos.add('extraer', `${d.archivo}: ${s.preguntas.length} preguntas con PyMuPDF y ${preguntas.length} con pdftotext`);
    for (const q of preguntas) {
      const sq = porNumero.get(q.numero);
      if (sq && !mismoInicio(q.enunciado, sq.inicio)) avisos.add('extraer', `${d.archivo} P${q.numero}: el texto no casa con la lectura del subrayado («${q.enunciado.slice(0, 40)}» / «${sq.inicio.slice(0, 40)}»)`);
      // Opciones cortas en columna (PY 6/2026 P18: «a) b) c) d)» y después los cuatro textos): pdftotext las desordena;
      // se toman las de PyMuPDF, que lee cada fila con su letra.
      if (sq && Object.values(q.opciones).some((t) => !t) && Object.keys(sq.textos ?? {}).length === 4 && Object.values(sq.textos).every(Boolean)) {
        q.opciones = { ...sq.textos };
      }
      const respuesta = respuestaSubrayado(sq);
      lecturas[respuesta.estado] = (lecturas[respuesta.estado] ?? 0) + 1;
      const [ut, utTitulo] = q.seccion ? q.seccion.split('|') : [null, null];
      apariciones.push({
        eje, tit, claveConv: d.claveConv, conv: d.conv, modelo: d.modelo, modulo: null,
        numero: q.numero, orden: q.numero, seccion: q.seccion, utPdf: ut ? Number(ut) : null, utTituloPdf: utTitulo || null,
        enunciado: q.enunciado, opciones: q.opciones, contexto: q.contexto ?? null,
        respuesta, fecha: d.fecha ?? null,
        fuentes: { examen: d.url, plantilla: null, pagina: d.pagina, correccion: null },
        paginaPDF: q.pagina,
      });
    }
  }
  return { apariciones, resumen: { examenes: docs.length, faltan, apariciones: apariciones.length, lecturas } };
}
