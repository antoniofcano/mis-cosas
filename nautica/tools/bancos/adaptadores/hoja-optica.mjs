// Adaptador «hoja-optica» (Andalucía 2015–2026): cuestionario en PDF de texto + plantilla de soluciones que es la hoja de
// respuestas de lectura óptica rellenada por el tribunal y escaneada (JPEG de 150–300 ppp dentro del PDF).
// Las preguntas salen de pdftotext; la respuesta, de leer las burbujas rellenas (py/hoja_optica.py, numpy sin OpenCV).
// Si hay modelos A y B, cada uno tiene su hoja: la etapa «repetidas» empareja las preguntas y comprueba que la opción
// marcada en las dos hojas tenga el mismo texto.
import { rutaPDF } from '../etapas/manifiesto.mjs';
import { analizarCuestionario } from '../lib/cuestionario.mjs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { dirEje, leerJSON, python } from '../lib/comun.mjs';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Encabezados de bloque de datos compartidos (PY navegación) y cabeceras de las tablas de mareas y corrientes. Lista
// cerrada: una sigla en mayúsculas sola en su línea («SOLAS», «MSSI») es la continuación de una opción, no un bloque.
const CONTEXTO = /^(MAREAS\.?|LOXODR[OÓ]MICA|HORAS?( UTC)?|D[IÍ]A|ALTURA DE (LA )?MAREAS?|C ?RECIENTE|VACIANTE|DESDE|HASTA|I ?NTERVALO|TABLA PARA CALCULAR .*)$/;

export const REGLAS_ANDALUCIA = {
  // «7. …», «42)…», «9.- …» (2021-2ª y PY 2021: el guion no es parte del enunciado).
  numero: /^(\d{1,2})\s*(?:[.):]\s*-(?=\s)|[.):\-])(?!\d)\s*(.*)$/,
  // «a) …» casi siempre; «A. …» en algún cuadernillo de 2021.
  opcion: (l) => /^([a-dA-D])\s*\)\s*(.*)$/.exec(l) ?? /^([A-D])\.\s+(.*)$/.exec(l),
  seccion: (l) => {
    const m = /^UNIDAD\s+TE[ÓO]RICA\s*(\d+)\s*[.:\-–]?\s*(.*)$/i.exec(l);
    return m ? `${Number(m[1])}|${m[2].trim()}` : null;
  },
  contexto: (l) => CONTEXTO.test(l) || /Pleamares y bajamares/i.test(l),
  // Restos de una página que es una imagen (tabla de mareas de 3/2022): caracteres de control o un paréntesis suelto.
  // Cabecera de cada página de los cuadernillos de 2015 (centro que los maquetó): códigos de certificación «ER-…/2011»,
  // «CÓDIGO nnnnnnnn» y las líneas del nombre, que pdftotext -raw saca con las letras separadas («C e n t r o …»).
  ruido: (l) => /^[\p{Cc}\s]+$/u.test(l) || /^[()]$/.test(l)
    || /^E[RS]-\d{4}\/\d{4}$/.test(l) || /^C ?[ÓO] ?D ?I ?G ?O\s*(\d ?){6,}/.test(l) || /^(\S ){4,}\S$/.test(l)
    || /^(Centro Integrado de Formaci[óo]n|Profesional|Mar[ií]timo-\S+)$/.test(l),
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

const pdftotextCon = (pdf, ...args) => execFileSync('pdftotext', [...args, pdf, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * pdftotext (modo normal) «deshace» los guiones de final de línea y se come el guion: «estribor-⏎babor» → «estriborbabor»,
 * «(babor -⏎estribor)» → «(babor estribor)», «b) Ct = 8º -⏎c) Ct = 6º +» → «b) Ct = 8º c) Ct = 6º +». El modo -raw sí los
 * conserva, pero desordena las tablas de mareas. Se toma el texto normal y se reponen los guiones que -raw tiene al final
 * de una línea: pegado a la palabra (compuesto partido) → «estribor-babor»; suelto («8º -») o delante de una opción o de
 * una pregunta → guion y salto de línea.
 * Exportada para los tests.
 */
export function reponerGuiones(normal, crudo) {
  const lineas = crudo.split(/\n/);
  let texto = normal;
  for (let i = 0; i + 1 < lineas.length; i++) {
    const l = lineas[i].replace(/\s+$/, '');
    if (!l.endsWith('-') || l.endsWith('--')) continue;
    const antes = l.slice(0, -1);
    const suelto = /\s$/.test(antes);
    // Tras el guion viene una opción o una pregunta («punto -P-⏎a) 10:30»): se repone también el salto de línea.
    const salto = suelto || /^\s*([a-dA-D]\)|\d{1,2}\s*[.)])/.test(lineas[i + 1]);
    const cola = antes.trimEnd().slice(-14);
    const cabeza = lineas[i + 1].trim().slice(0, 14);
    if (!cola || !cabeza) continue;
    const comido = suelto ? `${cola} ${cabeza}` : `${cola}${cabeza}`;
    const k = texto.indexOf(comido);
    if (k < 0 || texto.indexOf(comido, k + 1) >= 0) continue;
    texto = texto.slice(0, k) + `${cola}${suelto ? ' -' : '-'}${salto ? '\n' : ''}${cabeza}` + texto.slice(k + comido.length);
  }
  return texto;
}

/** Quita, página a página, las líneas que son rótulos de una figura (py/etiquetas_figura.py). Exportada para los tests. */
export function quitarRotulos(texto, rotulos = []) {
  if (!rotulos.length) return texto;
  const paginas = texto.split('\f');
  for (const [n, r] of rotulos) {
    const lineas = paginas[n - 1]?.split('\n');
    if (!lineas) continue;
    const k = lineas.findIndex((l) => l.trim() === r);
    if (k >= 0) { lineas.splice(k, 1); paginas[n - 1] = lineas.join('\n'); }
  }
  return paginas.join('\f');
}

/** Rótulos de figura de varios PDF en un solo proceso de Python → { [pdf]: [[página, texto]] } */
export function leerRotulos(pdfs) {
  if (!pdfs.length) return {};
  return python('etiquetas_figura.py', pdfs);
}

/**
 * Texto del cuestionario en uno de tres modos de pdftotext:
 *   normal → con los guiones repuestos desde -raw (2020–2026);
 *   raw    → orden del contenido: sirve cuando el normal separa las letras «a) b) c) d)» de sus textos (2015);
 *   layout → disposición física, con el mismo fin.
 */
export function textoCuestionario(pdf, rotulos, modo = 'normal') {
  const r = Array.isArray(rotulos) ? rotulos : [];
  if (modo === 'raw') return quitarRotulos(unirCompuestos(pdftotextCon(pdf, '-raw')), r);
  if (modo === 'layout') return quitarRotulos(pdftotextCon(pdf, '-layout'), r);
  return quitarRotulos(reponerGuiones(pdftotextCon(pdf), pdftotextCon(pdf, '-raw')), r);
}

/**
 * Guion de final de línea en el texto de pdftotext -raw: «estribor-⏎babor» → «estribor-babor» (palabra compuesta: las dos
 * partes son palabras que salen sueltas en el cuadernillo), pero «obsta-⏎culiza» → «obstaculiza» y «cor-⏎ta» → «corta»
 * (palabra partida por sílabas al maquetar: 3ª de 2015). Exportada para los tests.
 */
export function unirCompuestos(texto) {
  const sueltas = new Set(texto.replace(/[a-záéíóúñü]+-\n[a-záéíóúñü]+/gi, ' ').toLowerCase().match(/[a-záéíóúñü]+/g) ?? []);
  return texto.replace(/([a-záéíóúñü]+)-\n([a-záéíóúñü]+)/gi, (m, a, b) => {
    if (!/^[a-záéíóúñü]/.test(b) || !/[a-záéíóúñü]$/.test(a)) return m;
    return sueltas.has(a.toLowerCase()) && sueltas.has(b.toLowerCase()) ? `${a}-${b}` : `${a}${b}`;
  });
}

/**
 * Datos del anuario dentro del enunciado (PY navegación 2/2016: «18. Puerto de Cádiz. Información del Anuario de Mareas
 * para el 7 de junio de 2016: Hora Alt 03:48 3,34 … Calcular …»): la tabla pasa al contexto de la pregunta, y la
 * siguiente que remite a ella («Información del Anuario de Mareas en el enunciado del ejercicio anterior») lleva el mismo
 * contexto. Exportada para los tests.
 */
export function separarAnuario(q, i, todas) {
  const m = /^(.*?Información del Anuario de Mareas para el [^:]{4,40}:)\s*(Hora\s+Alt\.?((?:\s+\d{1,2}:\d{2}\s+-?\d+,\d{1,2})+))\s+/i.exec(q.enunciado);
  if (m) {
    const filas = m[3].trim().split(/\s+(?=\d{1,2}:\d{2})/).join('\n');
    q.contexto = [q.contexto, `MAREAS\n${m[1].trim()}\nHora Alt.\n${filas}`].filter(Boolean).join('\n');
    q.enunciado = q.enunciado.slice(m[0].length).trim();
    q.anuario = q.contexto;
    return q;
  }
  const ant = todas?.[i - 1];
  if (/Anuario de Mareas en el enunciado del ejercicio anterior/i.test(q.enunciado) && ant?.anuario) q.contexto = [q.contexto, ant.anuario].filter(Boolean).join('\n');
  return q;
}

/** Calidad de una lectura: preguntas en secuencia 1..n con sus cuatro opciones no vacías. */
export function calidad(preguntas, n) {
  const completas = preguntas.filter((q, i) => q.numero === i + 1 && 'abcd'.split('').every((l) => q.opciones[l])).length;
  return completas - Math.abs(preguntas.length - n);
}

/**
 * Tabla de mareas metida en el enunciado (PY navegación 2/2021: «… Sc= 3.28m HORAS 1:48 7:48 14:03 20:19» antes de las
 * opciones): se saca al contexto de la pregunta. Exportada para los tests.
 */
export function separarTabla(q) {
  const m = /\s((?:HORAS?|HORA UTC)(?:\s+\d{1,2}:\d{2})+)\s*$/.exec(q.enunciado);
  if (!m) return q;
  q.contexto = [m[1].replace(/\s+(?=\d)/g, '\n'), q.contexto].filter(Boolean).join('\n');
  q.enunciado = q.enunciado.slice(0, m.index).trim();
  return q;
}

/**
 * Preguntas de un cuestionario. Se lee en modo normal y, si no salen las n preguntas completas, se prueban -raw y
 * -layout y se queda la mejor lectura (modo en el resultado, para el informe).
 */
export function leerCuestionario(pdf, rotulos, n = null) {
  let mejor = null;
  for (const modo of ['normal', 'raw', 'layout']) {
    const { examenes } = analizarCuestionario(textoCuestionario(pdf, rotulos, modo), REGLAS_ANDALUCIA);
    const ex = examenes[0];
    const r = { preguntas: ex.preguntas.map(separarTabla).map(separarAnuario), fecha: fechaPortada(ex.lineasPrevias), modo };
    r.calidad = n ? calidad(r.preguntas, n) : 0;
    if (!mejor || r.calidad > mejor.calidad) mejor = r;
    if (!n || r.calidad === n) break;
  }
  return mejor;
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
  const rotulos = leerRotulos(trabajos.map((t) => rutaPDF(eje, t.c)));
  const apariciones = [];
  const modos = {};
  // Figuras recortadas de los cuestionarios (ejes/<eje>/figuras.json: «<conv>|<modelo o módulo>|<número>» → [rutas]).
  const figuras = leerJSON(join(dirEje(eje), 'figuras.json'), {});
  for (const t of trabajos) {
    const cfgConv = config.convocatorias.find((c) => c.clave === t.clave);
    const cu = leerCuestionario(rutaPDF(eje, t.c), rotulos[rutaPDF(eje, t.c)], nDe(t));
    if (cu.modo !== 'normal') modos[`${t.clave} ${tit} ${t.modelo}`] = cu.modo;
    const hoja = hojas[rutaPDF(eje, t.p)];
    if (hoja?.error) avisos.add('extraer', `${t.clave} ${tit} ${t.modelo}: hoja óptica ilegible (${hoja.error})`);
    const n = nDe(t);
    if (cu.preguntas.length !== n) avisos.add('extraer', `${t.clave} ${tit} ${t.modelo}: ${cu.preguntas.length} preguntas en el cuestionario (se esperaban ${n})`);
    const fechaConfig = cfgConv?.fechas?.[tit] ?? cfgConv?.fecha;
    if (cu.fecha && fechaConfig && cu.fecha !== fechaConfig) avisos.add('extraer', `${t.clave}: la portada dice ${cu.fecha} y config.json ${fechaConfig}`);
    const [modulo, variante] = tit === 'py' ? t.modelo.split('-') : [null, t.modelo];
    // PY de la 1ª de 2018: dos exámenes distintos (modelos A y B de cada módulo, con preguntas distintas). El B es otra
    // convocatoria a efectos del banco: clave «2018-c1b», ids and-py-2018-c1b-gNN|nNN (config.json lo titula).
    const claveConv = tit === 'py' && variante && variante !== 'A' ? `${t.clave}${variante.toLowerCase()}` : t.clave;
    const conv = claveConv === t.clave ? t.c.conv : `and-py-${claveConv}`;
    for (const q of cu.preguntas) {
      const r = hoja?.respuestas?.[q.numero - 1];
      const [ut, utTitulo] = q.seccion ? q.seccion.split('|') : [null, null];
      apariciones.push({
        eje, tit, claveConv, conv, modelo: variante ?? null, modulo,
        numero: q.numero, orden: tit === 'py' ? (modulo === 'navegacion' ? 20 : 0) + q.numero : q.numero,
        seccion: q.seccion, utPdf: ut ? Number(ut) : null, utTituloPdf: utTitulo || null,
        enunciado: q.enunciado, opciones: q.opciones, contexto: q.contexto ?? null,
        figuras: figuras[`${conv}|${variante ?? modulo}|${q.numero}`] ?? [],
        // umbral: tinta neta mínima de una burbuja marcada en esa hoja (para medir la confianza de la lectura en los informes).
        respuesta: r ? { letras: r.marca ? [...r.marca] : [], estado: r.estado, origen: 'omr', puntos: r.puntos, umbral: hoja.umbral?.marca ?? null } : { letras: [], estado: 'sin-hoja', origen: 'omr' },
        fecha: cu.fecha ?? fechaConfig ?? null,
        fuentes: { examen: t.c.url, plantilla: t.p.url, pagina: t.c.pagina, correccion: paginaCorreccion(t.clave)[0] ?? null },
        paginaPDF: q.pagina,
      });
    }
  }
  return { apariciones, resumen: { examenes: trabajos.length, apariciones: apariciones.length, ...(Object.keys(modos).length ? { modos } : {}) } };
}
