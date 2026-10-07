// Adaptador «respuesta-en-linea» (Illes Balears 2017–2026): cuestionario en PDF de texto con la respuesta oficial
// impresa tras cada pregunta («Resposta correcta: X», o «Respostes correctes: B i C» cuando se aceptan varias).
// Un PDF por modelo (isla y turno); cada uno empieza con la cabecera
//   Examen: Prova teòrica PER RD 875/2014 | Prova teòrica patró de iot RD 875/2014
//   Convocatòria: JUNY 2026
//   Model d’examen: A            («C e I», «A y C»: el mismo examen para Menorca y Eivissa)
//   SECCIÓ: Mòdul PNB | Mòdul PER | Mòdul genèric | Mòdul de navegació
// y sigue con «N. enunciado», «A: …» – «D: …», «Resposta correcta: X». Las notas del tribunal leídas en el aula
// («(*) NOTA: …») se guardan como notaTribunal de la pregunta (las erratas que anuncian se aplican en correcciones.json).
// Se descartan aquí (con aviso): los PDF en catalán (versión paralela de un examen castellano), los «PER específico»
// (las preguntas 28–45 de un PER completo de la misma sesión) y los PDF repetidos (mismo examen y modelo).
import { rutaPDF } from '../etapas/manifiesto.mjs';
import { join } from 'node:path';
import { dirEje, leerJSON, paginasPDF, pdftotext } from '../lib/comun.mjs';
import { clave as claveTexto, limpiar } from '../lib/texto.mjs';

const MESES = { gener: 1, febrer: 2, marc: 3, març: 3, abril: 4, maig: 5, juny: 6, juliol: 7, agost: 8, setembre: 9, octubre: 10, novembre: 11, desembre: 12 };

const RE_CABECERA = /^(Examen|Convocat[òo]ria|Model d.ex[aà]mens?|Modelo de examen|SECCI[ÓO]|Secci[óo]n?)\s*:\s*(.*)$/i;
const RE_NUMERO = /^(\(\*\)\s*)?(\d{1,2})\s*[.)-]\s*(.*)$/;
const RE_OPCION = /^([A-D])\s*[:)]\s*(.*)$/;
const RE_RESPUESTA = /Resposta\s+correcta\s*:\s*([A-D])?\b\s*(.*)$/;
const RE_RESPUESTAS = /Respostes\s+correctes\s*:\s*(.*)$/;
const RE_NOTA = /^\(\*\)\s*Nota\b/i;

/** Tipo de examen por la línea «Examen:». */
export function tipoExamen(examen) {
  const e = examen.toLowerCase();
  if (/capit/.test(e)) return 'cy';
  if (/patr[óo] de iot|patr[óo]n de yate/.test(e)) return 'py';
  if (/moto/.test(e)) return 'moto';
  if (/espec[ií]f/.test(e) && !/complet/.test(e)) return 'per-especifico';
  if (/\bpnb\b/.test(e)) return 'pnb';
  if (/\bper\b|\bpee\b/.test(e)) return 'per';
  return null;
}

/** «C e I», «A y C», «A i C», «B» → «C/I», «A/C», «B». */
export function normalizarModelo(m) {
  // En mayúsculas tal como vienen: «i», «y», «e» son conjunciones («B (Eivissa) i E (Menorca)»).
  const letras = String(m ?? '').replace(/\([^)]*\)/g, ' ').match(/\b[A-Z]\b/g) ?? [];
  return letras.length ? [...new Set(letras)].join('/') : null;
}

/** «JUNY 2026», «Març-Abril 2017», «Abril 2020 (Juliol 2020)» → ['2026-06'] (todas las claves que nombra). */
export function clavesConvocatoria(texto) {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const anio = /(20\d\d)/.exec(t)?.[1];
  const out = [];
  for (const m of t.matchAll(/[a-z]+/g)) {
    const mes = MESES[m[0]] ?? MESES[m[0].replace('c', 'ç')];
    if (mes && anio) out.push(`${anio}-${String(mes).padStart(2, '0')}`);
  }
  return out;
}

/** Idioma de un examen por sus palabras más frecuentes. */
export function idioma(preguntas) {
  const t = preguntas.map((q) => `${q.enunciado} ${Object.values(q.opciones).join(' ')}`).join(' ').toLowerCase();
  const ca = (t.match(/\b(vaixell|embarcació|amb|quina|quin|aquesta|aquest|els|mitjançant|d'una|l'embarcació|és|qualsevol|navegació)\b/g) ?? []).length;
  const es = (t.match(/\b(buque|embarcación|con|cuál|qué|esta|este|los|mediante|de una|la embarcación|es|cualquier|navegación)\b/g) ?? []).length;
  return ca > es ? 'ca' : 'es';
}

/** Letras de «Respostes correctes: A, B i C». */
const letrasDe = (s) => [...new Set((s.match(/\b[A-D]\b/g) ?? []).map((l) => l.toLowerCase()))].sort();

/**
 * Analiza el texto de un PDF (pdftotext) → [{ cabecera: { examen, convocatoria, modelo }, preguntas, avisos }].
 * Pregunta: { numero, seccion, enunciado, opciones: {a..d}, letras, notaTribunal, marcada, pagina }.
 */
export function analizarTexto(texto, { paginas = 0 } = {}) {
  let t = texto;
  // Pie «n - N» (página / total), a veces pegado al final de una línea.
  if (paginas) t = t.replace(new RegExp(`(?<![\\w,.'’])\\d{1,2} ?- ?${paginas}(?![\\w,.])`, 'g'), ' ');
  const examenes = [];
  let ex = null;
  let q = null;
  let campo = null;
  let seccion = null;
  let pagina = 1;
  const nuevo = () => { ex = { cabecera: { examen: '', convocatoria: '', modelo: '' }, preguntas: [], avisos: [] }; examenes.push(ex); q = null; campo = null; seccion = null; };
  const cerrar = () => {
    if (!q) return;
    q.enunciado = limpiar(q.enunciado);
    for (const k of Object.keys(q.opciones)) q.opciones[k] = limpiar(q.opciones[k]);
    if (q.notaTribunal) q.notaTribunal = limpiar(q.notaTribunal);
    separarOpcionesPegadas(q);
    q = null;
    campo = null;
  };
  const respuesta = (linea) => {
    const mm = RE_RESPUESTAS.exec(linea);
    if (mm) return { letras: letrasDe(mm[1]), resto: '' };
    const m = RE_RESPUESTA.exec(linea);
    if (m) return { letras: m[1] ? [m[1].toLowerCase()] : [], resto: m[2] ?? '' };
    return null;
  };
  for (const pag of t.split('\f')) {
    for (const bruta of pag.split('\n')) {
      let l = bruta.replace(/[  ]/g, ' ').trim();
      if (!l || /^\d+\s*-\s*\d+$/.test(l) || /^P[àa]gina \d+/i.test(l)) continue;
      const h = RE_CABECERA.exec(l);
      if (h) {
        const k = h[1].toLowerCase();
        if (k.startsWith('examen')) { cerrar(); nuevo(); ex.cabecera.examen = h[2].trim(); continue; }
        if (!ex) nuevo();
        if (k.startsWith('convocat')) ex.cabecera.convocatoria = h[2].trim();
        else if (k.startsWith('model')) ex.cabecera.modelo = h[2].trim();
        else { cerrar(); seccion = h[2].trim(); }
        continue;
      }
      if (!ex) continue;
      // Respuesta, sola o pegada al final de la última opción («…bajamarResposta correcta: C»).
      // Solo la marca catalana con mayúscula: «señalar la respuesta correcta:» aparece dentro de algún enunciado.
      const pos = l.search(/Resposta\s+correcta\s*:|Respostes\s+correctes\s*:/);
      if (pos >= 0 && q && !q.letras) {
        const antes = l.slice(0, pos).trim();
        if (antes) { if (campo === 'enunciado') q.enunciado += ` ${antes}`; else if (campo) q.opciones[campo] += ` ${antes}`; }
        const r = respuesta(l.slice(pos)) ?? { letras: [], resto: l.slice(pos) };
        q.letras = r.letras;
        if (r.resto) q.notaTribunal = r.resto;
        campo = 'nota';
        continue;
      }
      if (RE_NOTA.test(l)) {
        if (q) { q.notaTribunal = `${q.notaTribunal ?? ''} ${l}`.trim(); campo = q.letras ? 'nota' : 'notaPrevia'; }
        continue;
      }
      const esperado = (ex.preguntas.at(-1)?.numero ?? 0) + 1;
      const mn = RE_NUMERO.exec(l);
      const primera = !ex.preguntas.length;
      if (mn && (!q || q.letras) && mn[3] && (primera || (Number(mn[2]) >= esperado && Number(mn[2]) <= esperado + 1))) {
        cerrar();
        const n = Number(mn[2]);
        if (n !== esperado && !(primera && n === 28)) ex.avisos.push(`falta la pregunta ${esperado}`);
        q = { numero: n, seccion, enunciado: mn[3], opciones: {}, letras: null, notaTribunal: null, marcada: Boolean(mn[1]), pagina };
        ex.preguntas.push(q);
        campo = 'enunciado';
        continue;
      }
      const mo = RE_OPCION.exec(l);
      if (mo && q && !q.letras) {
        const toca = 'ABCD'[Object.keys(q.opciones).length];
        if (mo[1] === toca) { q.opciones[mo[1].toLowerCase()] = mo[2]; campo = mo[1].toLowerCase(); continue; }
      }
      if (!q) continue;
      if (campo === 'enunciado') q.enunciado += ` ${l}`;
      else if (campo === 'nota' || campo === 'notaPrevia') {
        // Tras una nota previa a las opciones, la siguiente línea que no es opción sigue siendo nota.
        q.notaTribunal = `${q.notaTribunal ?? ''} ${l}`.trim();
      } else if (campo) q.opciones[campo] += ` ${l}`;
    }
    pagina++;
  }
  cerrar();
  return examenes.filter((e) => e.preguntas.length);
}

/** «A: … bitas.B: …»: una opción pegada a la anterior en la misma línea. */
function separarOpcionesPegadas(q) {
  const letras = 'abcd';
  let n = Object.keys(q.opciones).length;
  while (n > 0 && n < 4) {
    const ult = letras[n - 1];
    const sig = letras[n].toUpperCase();
    const m = new RegExp(`(?<=[.\\sa-záéíóú])${sig}:\\s`).exec(q.opciones[ult]);
    if (!m) break;
    q.opciones[letras[n]] = q.opciones[ult].slice(m.index + m[0].length).trim();
    q.opciones[ult] = q.opciones[ult].slice(0, m.index).trim();
    n++;
  }
}

/** Cabecera y tipo de un PDF (para el descubrimiento): [{ tipo, modelo, convocatorias, idioma, n }]. */
export function leerPDF(pdf) {
  const examenes = analizarTexto(pdftotext(pdf), { paginas: paginasPDF(pdf) });
  return examenes.map((e) => ({
    ...e,
    tipo: tipoExamen(e.cabecera.examen),
    modelo: normalizarModelo(e.cabecera.modelo),
    convocatorias: clavesConvocatoria(e.cabecera.convocatoria),
    idioma: idioma(e.preguntas),
  }));
}

const firma = (preguntas) => preguntas.map((q) => claveTexto(q.enunciado)).join('|');

/**
 * Exámenes de los PDF de una titulación → apariciones. Los PER de 45 preguntas entran siempre (también los que la
 * cabecera llama «PNB y PER específico»: son un PER completo). Los «PER específico» de 18 preguntas (28–45, para
 * quien ya tiene el PNB) son en Baleares juegos propios, no un trozo de un PER completo: entran como un examen más,
 * con modelo «ESP-<letra>» (sus 18 preguntas cuentan como hueco documentado en config.huecos); si todas sus preguntas
 * están en algún PER completo de la convocatoria, se descarta como repetido.
 */
export function extraer(ctx, tit) {
  const { eje, config, avisos } = ctx;
  const n = config.titulaciones[tit].preguntas;
  const docs = ctx.documentos.filter((d) => d.tit === tit && d.estadoLocal !== 'falta' && ['cuestionario', 'traduccion', 'especifico'].includes(d.rol));
  const examenes = [];
  const resumen = { pdf: 0, examenes: 0, especificos: 0, descartados: [] };
  // Figuras sacadas de los PDF (tools/bancos/ejes/<eje>/figuras.mjs): { "<pdf>|<nº>": ["img/…"] }.
  const figuras = leerJSON(join(dirEje(eje), 'figuras.json'), {});
  for (const d of docs.sort((a, b) => a.claveConv.localeCompare(b.claveConv) || String(a.modelo).localeCompare(String(b.modelo)) || a.id.localeCompare(b.id))) {
    resumen.pdf++;
    for (const ex of leerPDF(rutaPDF(eje, d))) {
      const ref = `${d.claveConv} ${tit} ${ex.modelo ?? '?'} (PDF ${d.pdf})`;
      const especifico = tit === 'per' && ex.preguntas.length < 40;
      const tipo = ex.tipo === 'per-especifico' ? 'per' : ex.tipo;
      if (tipo !== tit) { avisos.add('extraer', `${ref}: la cabecera dice «${ex.cabecera.examen}» (tipo ${ex.tipo}); se descarta`); resumen.descartados.push(`${d.pdf}: tipo ${ex.tipo}`); continue; }
      if (ex.idioma !== 'es') { resumen.descartados.push(`${d.pdf}: catalán`); continue; }
      examenes.push({ d, ex, ref, especifico });
    }
  }
  // Primero los completos: las preguntas de los específicos se comparan con ellos.
  examenes.sort((a, b) => Number(a.especifico) - Number(b.especifico));
  const vistos = new Map(); // conv|modelo → firma
  const completas = new Map(); // conv → Set de claves de enunciado
  const apariciones = [];
  for (const { d, ex, ref, especifico } of examenes) {
    const cfgConv = config.convocatorias.find((c) => c.clave === d.claveConv);
    if (especifico) {
      const ks = completas.get(d.claveConv) ?? new Set();
      const dentro = ex.preguntas.filter((q) => ks.has(claveTexto(q.enunciado))).length;
      if (dentro === ex.preguntas.length) { resumen.descartados.push(`${d.pdf}: PER específico ya incluido en un PER completo`); continue; }
      avisos.add('extraer', `${ref}: PER específico de ${ex.preguntas.length} preguntas (${ex.preguntas[0]?.numero}–${ex.preguntas.at(-1)?.numero}), ${dentro} también en un PER completo de la convocatoria; entra como examen propio`);
      resumen.especificos++;
    }
    if (ex.convocatorias.length && !ex.convocatorias.includes(d.claveConv)) avisos.add('extraer', `${ref}: la cabecera dice «${ex.cabecera.convocatoria}»`);
    for (const a of ex.avisos) avisos.add('extraer', `${ref}: ${a}`);
    if (!especifico && ex.preguntas.length !== n) avisos.add('extraer', `${ref}: ${ex.preguntas.length} preguntas (se esperaban ${n})`);
    const base = ex.modelo ?? d.modelo ?? `pdf${d.pdf}`;
    const modelo = especifico ? `ESP-${base}` : base;
    const k = `${d.claveConv}|${modelo}`;
    const f = firma(ex.preguntas);
    if (vistos.has(k) && vistos.get(k) === f) { avisos.add('extraer', `${ref}: el mismo examen que otro PDF de la página (mismo modelo); se descarta`); resumen.descartados.push(`${d.pdf}: repetido`); continue; }
    if (vistos.has(k)) avisos.add('extraer', `${ref}: dos exámenes distintos con el mismo modelo en la convocatoria; este se registra como modelo ${modelo}-${d.pdf}`);
    const modeloFinal = vistos.has(k) ? `${modelo}-${d.pdf}` : modelo;
    vistos.set(k, f);
    resumen.examenes++;
    if (!completas.has(d.claveConv)) completas.set(d.claveConv, new Set());
    for (const q of ex.preguntas) {
      if (!especifico) completas.get(d.claveConv).add(claveTexto(q.enunciado));
      const faltan = 'abcd'.split('').filter((l) => !q.opciones[l]);
      if (faltan.length) avisos.add('extraer', `${ref} nº ${q.numero}: faltan las opciones ${faltan.join(', ')}`);
      if (!q.letras?.length) avisos.add('extraer', `${ref} nº ${q.numero}: sin respuesta`);
      apariciones.push({
        eje, tit, claveConv: d.claveConv, conv: `${config.prefijo}-${tit}-${d.claveConv}`, modelo: modeloFinal, modulo: null,
        numero: q.numero, orden: q.numero,
        seccion: q.seccion, utPdf: null, utTituloPdf: null,
        enunciado: q.enunciado, opciones: q.opciones, contexto: null,
        respuesta: { letras: q.letras ?? [], estado: q.letras?.length ? 'ok' : 'sin-respuesta', origen: 'en-linea' },
        notaTribunal: q.notaTribunal ?? null,
        fecha: cfgConv?.fecha ?? null,
        fuentes: { examen: d.url, plantilla: null, pagina: d.pagina, correccion: null },
        figuras: figuras[`${d.pdf}|${q.numero}`] ?? [],
        paginaPDF: q.pagina, pdf: d.pdf, isla: d.isla ?? null,
      });
    }
  }
  return { apariciones, resumen };
}
