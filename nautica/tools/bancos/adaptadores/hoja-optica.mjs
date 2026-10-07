// Adaptador «hoja-optica» (Andalucía 2015–2026): cuestionario en PDF de texto + plantilla de soluciones que es la hoja de
// respuestas de lectura óptica rellenada por el tribunal y escaneada (JPEG de 150–300 ppp dentro del PDF).
// Las preguntas salen de pdftotext; la respuesta, de leer las burbujas rellenas (py/hoja_optica.py, numpy sin OpenCV).
// Si hay modelos A y B, cada uno tiene su hoja: la etapa «repetidas» empareja las preguntas y comprueba que la opción
// marcada en las dos hojas tenga el mismo texto.
import { rutaPDF } from '../etapas/manifiesto.mjs';
import { analizarCuestionario } from '../lib/cuestionario.mjs';
import { pdftotext, python } from '../lib/comun.mjs';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const REGLAS_ANDALUCIA = {
  numero: /^(\d{1,2})\s*[.):\-](?!\d)\s*(.*)$/,
  // «a) …» casi siempre; «A. …» en algún cuadernillo de 2021.
  opcion: (l) => /^([a-dA-D])\s*\)\s*(.*)$/.exec(l) ?? /^([A-D])\.\s+(.*)$/.exec(l),
  seccion: (l) => {
    const m = /^UNIDAD\s+TE[ÓO]RICA\s*(\d+)\s*[.:\-–]?\s*(.*)$/i.exec(l);
    return m ? `${Number(m[1])}|${m[2].trim()}` : null;
  },
  // Bloques de datos compartidos (PY navegación): «MAREAS», «LOXODRÓMICA», tablas de pleamares…
  contexto: (l) => /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ .]{3,40}$/.test(l) && !/^UNIDAD/.test(l) || /Pleamares y bajamares/i.test(l),
  // Las instrucciones de la portada también van numeradas: las preguntas empiezan tras este encabezado.
  inicio: /^(UNIDAD\s+TE[ÓO]RICA|EXAMEN PARA LA OBTENCI)/i,
  maxNumero: 45,
};

/** Fecha «2ª Convocatoria: 11 de junio de 2022» de la portada. */
export function fechaPortada(lineas) {
  for (const l of lineas) {
    const m = /(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(?:de\s+)?(\d{4})/i.exec(l);
    if (m && /convocatoria|fecha/i.test(l)) {
      const mes = MESES.indexOf(m[2].toLowerCase()) + 1;
      if (mes) return `${m[3]}-${String(mes).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
    }
  }
  return null;
}

export function leerCuestionario(pdf) {
  const { examenes } = analizarCuestionario(pdftotext(pdf), REGLAS_ANDALUCIA);
  const ex = examenes[0];
  return { preguntas: ex.preguntas, fecha: fechaPortada(ex.lineasPrevias) };
}

/** Lee las hojas en un solo proceso de Python. pares: [{ pdf, n }] → { [pdf]: resultado } */
export function leerHojas(pares) {
  if (!pares.length) return {};
  const res = python('hoja_optica.py', pares.map((p) => `${p.pdf}:${p.n}`));
  return Object.fromEntries(res.map((r) => [r.archivo, r]));
}

export function extraer(ctx, tit) {
  const { eje, config, avisos } = ctx;
  const docs = ctx.documentos.filter((d) => d.tit === tit && d.estadoLocal !== 'falta');
  const porConv = new Map();
  for (const d of docs) {
    if (!porConv.has(d.claveConv)) porConv.set(d.claveConv, []);
    porConv.get(d.claveConv).push(d);
  }
  const paginaCorreccion = (clave) => ctx.documentos.filter((d) => d.claveConv === clave && d.rol === 'correccion').map((d) => d.url);
  // Pares cuestionario–plantilla por modelo (PER: A/B; PY: generico/navegacion, y sus -A/-B en 2018-1).
  const trabajos = [];
  for (const [clave, ds] of porConv) {
    const modelos = [...new Set(ds.map((d) => d.modelo))];
    for (const m of modelos) {
      const c = ds.find((d) => d.modelo === m && d.rol === 'cuestionario');
      const p = ds.find((d) => d.modelo === m && d.rol === 'plantilla');
      if (!c || !p) { avisos.add('extraer', `${clave} ${tit} ${m}: falta ${c ? 'la plantilla' : 'el cuestionario'}`); continue; }
      trabajos.push({ clave, modelo: m, c, p });
    }
  }
  const nDe = (t) => (tit === 'per' ? 45 : 20);
  const hojas = leerHojas(trabajos.map((t) => ({ pdf: rutaPDF(eje, t.p), n: nDe(t) })));
  const apariciones = [];
  for (const t of trabajos) {
    const cfgConv = config.convocatorias.find((c) => c.clave === t.clave);
    const cu = leerCuestionario(rutaPDF(eje, t.c));
    const hoja = hojas[rutaPDF(eje, t.p)];
    if (hoja?.error) avisos.add('extraer', `${t.clave} ${tit} ${t.modelo}: hoja óptica ilegible (${hoja.error})`);
    const n = nDe(t);
    if (cu.preguntas.length !== n) avisos.add('extraer', `${t.clave} ${tit} ${t.modelo}: ${cu.preguntas.length} preguntas en el cuestionario (se esperaban ${n})`);
    if (cu.fecha && cfgConv?.fecha && cu.fecha !== cfgConv.fecha) avisos.add('extraer', `${t.clave}: la portada dice ${cu.fecha} y config.json ${cfgConv.fecha}`);
    const [modulo, variante] = tit === 'py' ? t.modelo.split('-') : [null, t.modelo];
    for (const q of cu.preguntas) {
      const r = hoja?.respuestas?.[q.numero - 1];
      const [ut, utTitulo] = q.seccion ? q.seccion.split('|') : [null, null];
      apariciones.push({
        eje, tit, claveConv: t.clave, conv: t.c.conv, modelo: variante ?? null, modulo,
        numero: q.numero, orden: tit === 'py' ? (modulo === 'navegacion' ? 20 : 0) + q.numero : q.numero,
        seccion: q.seccion, utPdf: ut ? Number(ut) : null, utTituloPdf: utTitulo || null,
        enunciado: q.enunciado, opciones: q.opciones, contexto: q.contexto ?? null,
        respuesta: r ? { letras: r.marca ? [...r.marca] : [], estado: r.estado, origen: 'omr', puntos: r.puntos } : { letras: [], estado: 'sin-hoja', origen: 'omr' },
        fecha: cu.fecha ?? cfgConv?.fecha ?? null,
        fuentes: { examen: t.c.url, plantilla: t.p.url, pagina: t.c.pagina, correccion: paginaCorreccion(t.clave)[0] ?? null },
        paginaPDF: q.pagina,
      });
    }
  }
  return { apariciones, resumen: { examenes: trabajos.length, apariciones: apariciones.length } };
}
