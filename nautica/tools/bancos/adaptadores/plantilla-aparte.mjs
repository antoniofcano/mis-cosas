// Adaptador «plantilla-aparte» (DGMM 2019–2026): un PDF de texto con los enunciados de todas las titulaciones de la
// convocatoria (cada examen empieza por «EXAMEN DE …» y «Código de Test NN») y otro PDF de texto con la plantilla de
// respuestas («Respuestas al EXAMEN DE … / Código de Test NN» y una línea «N letra» por pregunta).
// - Titulaciones: PER (45), PY (40). Se ignoran CY y moto.
// - «PER con PNB liberado» (28–45) y PNB (1–27): solo se usan para reconstruir un Test de PER que no viene completo
//   (DGMM octubre 2021, octubre 2022 y junio 2023: el PNB y el liberado de un mismo código forman el otro juego).
// - Plantilla: «A», «AyB», «A y B correctas», «ANULADA», «se anula pregunta», «Todas las respuestas…» → letras/estado.
// - El código de Test que el PDF trae como imagen (DGMM febrero 2021) se da en config.convocatorias[].codigos[tit].
import { rutaPDF } from '../etapas/manifiesto.mjs';
import { analizarCuestionario } from '../lib/cuestionario.mjs';
import { pdftotext } from '../lib/comun.mjs';
import { canonico } from '../lib/texto.mjs';

/** Encabezados de materia (PER: las 11 unidades; PY: sus 4 materias). Se comparan en forma canónica sin punto final. */
export const SECCIONES = [
  'Nomenclatura náutica', 'Elementos de amarre y fondeo', 'Seguridad', 'Legislación', 'Balizamiento', 'Reglamento (RIPA)',
  'Maniobra y navegación', 'Emergencias en la mar', 'Meteorología', 'Teoría de la navegación', 'Carta de navegación',
  'Seguridad en la mar', 'Teoría de navegación', 'Navegación carta', 'Cálculo de navegación', 'Inglés',
];
const SEC = new Set(SECCIONES.map((s) => canonico(s)));
const sinPunto = (l) => canonico(l).replace(/\.$/, '').trim();

/** Membrete del Ministerio y pies de página (cambian de un año a otro). */
const RUIDO = [
  /^MINISTERIO$/, /^SECRETAR[ÍI]A/, /^DE TRANSPORTES?\b/, /^Y (AGENDA|MOVILIDAD)/, /^DIRECCI[ÓO]N GENERAL/, /^MARINA MERCANTE$/,
  /^DE LA MARINA MERCANTE$/, /^SUBDIRECCI[ÓO]N GENERAL/, /^[ÁA]REA (FUNCIONAL|DE FORMACI)/, /^DE INFRAESTRUCTURAS/, /^TRANSPORTE( Y VIVIENDA)?$/,
  /^DE FOMENTO$/, /^FOMENTO$/, /^DE$/, /^MAR[ÍI]TIMA$/, /^DE TRANSPORTE,? MOVILIDAD/, /^E$/, /^\d{1,3}$/, /^\.$/,
  /^\(?Con\.?$/i, /^\.?\s*PNB Liberado\)?$/i, /^\(?(CON )?PNB LIBERADO\)?$/i, /^\(?Con\.? PNB/i, /^C[óo]digo de Test/i, /^EXAMEN DE/,
];
export const esRuido = (l) => RUIDO.some((r) => r.test(l));

/** Tipo de examen por su cabecera: per | per-lib | pnb | py | cy | otro. */
export function tipoExamen(cabecera) {
  const t = canonico(cabecera);
  if (/capitan de yate/.test(t)) return 'cy';
  if (/patron de yate/.test(t)) return 'py';
  if (/navegacion basica/.test(t) && !/embarcaciones de recreo/.test(t)) return 'pnb';
  if (/embarcaciones de recreo/.test(t)) return /liberado|complementario|previamente aprobado/.test(t) ? 'per-lib' : 'per';
  return 'otro';
}
export const codigoTest = (cabecera) => {
  const m = /c[oó]digo\s+(?:de\s+)?test\s*0*(\d+)/i.exec(cabecera);
  return m && Number(m[1]) ? `T${String(Number(m[1])).padStart(2, '0')}` : null;
};

/** Parte el texto en bloques que empiezan por una línea que contiene `marca`; la cabecera son esa línea y las 5 siguientes. */
/** Primera materia de cada examen: si aparece sin cabecera delante, empieza un examen cuya cabecera es una imagen. */
const PRIMERA = { 'nomenclatura nautica': 'per', 'seguridad en la mar': 'py' };

/**
 * Parte el texto en exámenes. Empieza uno en cada línea que encaja con `marca` («EXAMEN DE …»; la cabecera son esa
 * línea y las 5 siguientes) y, con `sinCabecera`, también donde aparece la primera materia de un examen lejos de toda
 * cabecera (DGMM febrero 2021: cabeceras en imagen). Esos llevan `tipo` por su materia y `codigo` null.
 */
export function bloques(texto, marca = /^(Respuestas al )?EXAMEN DE\b/, { sinCabecera = false } = {}) {
  const lineas = texto.split('\n');
  const out = [];
  let cur = null;
  let ultimaCabecera = -100;
  lineas.forEach((l, i) => {
    const t = l.trim();
    if (marca.test(t)) {
      cur = { inicio: i, lineas: [] };
      out.push(cur);
      ultimaCabecera = i;
    } else if (sinCabecera && PRIMERA[sinPunto(t)] && i - ultimaCabecera > 8) {
      cur = { inicio: i, lineas: [], sinCabecera: PRIMERA[sinPunto(t)] };
      out.push(cur);
    }
    if (cur) cur.lineas.push(l);
  });
  for (const b of out) {
    if (b.sinCabecera) {
      Object.assign(b, { cabecera: `(sin cabecera: ${b.lineas[0].trim()})`, tipo: b.sinCabecera, codigo: null, texto: b.lineas.join('\n') });
      continue;
    }
    const cab = b.lineas.slice(0, 6).map((x) => x.trim()).filter(Boolean).join(' ');
    // La cabecera llega hasta la primera pregunta.
    const corte = cab.search(/\s(1|28)\s[¿A-ZÁÉÍÓÚ`]/);
    b.cabecera = corte > 0 ? cab.slice(0, corte) : cab;
    b.tipo = tipoExamen(b.cabecera);
    b.codigo = codigoTest(cab);
    b.texto = b.lineas.join('\n');
  }
  return out;
}

export const REGLAS_DGMM = {
  // El enunciado empieza por mayúscula, signo o comilla: «12 nudos…» al principio de una línea es una continuación.
  // «12 11 ¿Cuál…»: algún cuadernillo repite el número de otro modelo detrás del suyo.
  numero: /^(\d{1,2})\s+(?:\d{1,2}\s+(?=[¿¡A-ZÁÉÍÓÚÑ]))?([¿¡"“«'`(A-ZÁÉÍÓÚÑ].*)$/,
  opcion: /^([a-d])\)\s*(.*)$/,
  seccion: (l) => (SEC.has(sinPunto(l)) ? sinPunto(l) : null),
  ruido: esRuido,
  inicio: { test: (l) => SEC.has(sinPunto(l)) },
  permiteInicio: (n) => n === 28,
  maxNumero: 45,
  saltos: true,
  reinicio: true,
};

export function leerEnunciados(pdf) {
  const texto = pdftotext(pdf);
  // Un bloque puede traer detrás páginas de otro cuadernillo sin su portada (la numeración vuelve atrás): esas salen
  // como otro examen sin código; si empieza en la 28 es un «PER con PNB liberado».
  return bloques(texto, undefined, { sinCabecera: true }).flatMap((b) => {
    const { examenes } = analizarCuestionario(b.texto.replace(/\f/g, '\n'), REGLAS_DGMM);
    return examenes.filter((e) => e.preguntas.length).map((e, i) => (i === 0
      ? { tipo: b.tipo, codigo: b.codigo, cabecera: b.cabecera, preguntas: e.preguntas }
      : { tipo: e.cabecera.reinicio === 28 ? 'per-lib' : b.tipo, codigo: null, cabecera: `(sin cabecera, desde la ${e.cabecera.reinicio})`, preguntas: e.preguntas }));
  });
}

/** Respuesta de una línea de plantilla → { letras, estado } */
export function leerRespuesta(texto) {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (/anula|todas las respuestas|v[áa]lidas todas/i.test(t)) return { letras: [], estado: 'anulada', texto: t };
  const limpio = t.replace(/correctas?|v[áa]lidas?|respuestas?|pregunta/gi, ' ');
  const letras = [...new Set((limpio.match(/[A-D]/g) ?? []).map((l) => l.toLowerCase()))].sort();
  const resto = limpio.replace(/[A-D]|\by\b|y|[,.\s]/g, '');
  return { letras, estado: !letras.length ? 'vacia' : resto ? 'dudosa' : 'ok', texto: t };
}

/**
 * Plantilla de respuestas (pdftotext -layout). Por bloque: { tipo, codigo, respuestas: { n: { letras, estado, texto } } }.
 * Las líneas sin número que siguen a una respuesta («A (Todas las respuestas se dan por válidas)») la completan.
 */
export function leerPlantilla(pdf) {
  const texto = pdftotext(pdf, { layout: true });
  return bloques(texto.replace(/\f/g, '\n'), /(^|\s)(Respuestas al )?EXAMEN DE\b/).map((b) => {
    const resp = {};
    let pendiente = null;
    let ultimo = null;
    const RESP = /^([A-D](?:[\s,y]*[A-D])*\b.*|[Ss]e anula.*|ANULADA.*|Anulada.*)$/;
    for (const bruta of b.lineas.slice(1)) {
      const l = bruta.trim();
      if (!l || /^C[óo]digo de Test/i.test(l) || /^\(?(con|modulo|complementario|pnb|recreo)\b/i.test(l)) continue;
      // «N respuesta» en la misma línea (también «8ByD», sin espacio).
      const m = /^(\d{1,2})\s*([A-D].*|[Ss]e anula.*|ANULADA.*|Anulada.*)$/.exec(l);
      if (m && RESP.test(m[2])) { if (!(m[1] in resp)) { resp[m[1]] = m[2]; ultimo = m[1]; } pendiente = null; continue; }
      // A veces la maquetación deja el número solo en una línea y la respuesta en la siguiente.
      if (/^\d{1,2}$/.test(l)) { pendiente = l; continue; }
      if (pendiente && RESP.test(l)) {
        // La nota «(Todas las respuestas…)» que acompaña a una letra suelta es de otra celda: solo cuenta la letra.
        if (!(pendiente in resp)) { resp[pendiente] = /^[A-D]\s+\(/.test(l) ? l[0] : l; ultimo = pendiente; }
        pendiente = null;
        continue;
      }
      // «ANULADA (…)» suelto: es un sello del tribunal sobre la respuesta anterior (DGMM julio 2021: «43 D» y debajo
      // «ANULADA»). La letra suelta con la nota «(Todas…)» tras un «45 ANULADA» es la letra original tachada: se ignora.
      if (ultimo && /^anulada/i.test(l)) resp[ultimo] = `${resp[ultimo]} ${l}`;
    }
    const respuestas = Object.fromEntries(Object.entries(resp).map(([n, t]) => [n, leerRespuesta(t)]));
    return { tipo: b.tipo, codigo: b.codigo, cabecera: b.cabecera, respuestas };
  });
}

const TIPO = { per: 'per', py: 'py' };

export function extraer(ctx, tit) {
  const { eje, config, avisos } = ctx;
  const out = [];
  const porConv = new Map();
  for (const d of ctx.documentos) {
    if (d.estadoLocal && d.estadoLocal !== 'ok') continue;
    if (!porConv.has(d.claveConv)) porConv.set(d.claveConv, []);
    porConv.get(d.claveConv).push(d);
  }
  let examenes = 0;
  for (const [clave, ds] of porConv) {
    const cfg = config.convocatorias.find((c) => c.clave === clave) ?? {};
    const en = ds.find((d) => d.rol === 'cuestionario');
    const pl = ds.find((d) => d.rol === 'plantilla');
    if (!en || !pl) { avisos.add('extraer', `${clave}: falta ${en ? 'la plantilla' : 'el cuestionario'}`); continue; }
    const enun = leerEnunciados(rutaPDF(eje, en));
    const plant = leerPlantilla(rutaPDF(eje, pl));
    // Exámenes sin código legible: config.convocatorias[].codigos = { per: ["T01", "T05"], py: ["T02"] }, por orden de
    // aparición en el PDF ("-": copia repetida que se descarta). config.convocatorias[].tipos = { "T06": "pnb" } corrige
    // el tipo de un examen mal rotulado.
    for (const lista of [enun, plant]) {
      const usados = {};
      for (const b of lista) {
        if (lista === enun && cfg.tipos?.[b.codigo]) b.tipo = cfg.tipos[b.codigo];
        if (b.codigo || !cfg.codigos?.[b.tipo]) continue;
        const k = usados[b.tipo] = (usados[b.tipo] ?? -1) + 1;
        b.codigo = [cfg.codigos[b.tipo]].flat()[k] ?? null;
      }
    }
    const codigoDe = (b) => b.codigo;
    const conv = `${config.prefijo}-${tit}-${clave}`;
    const correccion = ds.filter((d) => d.rol === 'correccion').map((d) => d.url)[0] ?? null;
    // Exámenes de esta titulación: los completos y, para PER, los reconstruidos con PNB + liberado.
    for (const b of enun) if (b.codigo === '-') b.tipo = 'descartado';
    const completos = enun.filter((b) => b.tipo === TIPO[tit]);
    const trabajos = completos.map((b) => ({ codigo: codigoDe(b), partes: [{ b, plantilla: plant.find((p) => p.tipo === b.tipo && (p.codigo ?? codigoDe(p)) === codigoDe(b)) }] }));
    if (tit === 'per') {
      const tiene = new Set(trabajos.map((t) => t.codigo));
      for (const lib of enun.filter((b) => b.tipo === 'per-lib')) {
        const cod = codigoDe(lib);
        if (tiene.has(cod)) continue;
        const pnb = enun.find((b) => b.tipo === 'pnb' && codigoDe(b) === cod);
        if (!pnb) { avisos.add('extraer', `${clave} PER ${cod}: hay liberado pero no PNB para reconstruirlo`); continue; }
        trabajos.push({ codigo: cod, reconstruido: true, partes: [
          { b: pnb, plantilla: plant.find((p) => p.tipo === 'pnb' && (p.codigo ?? codigoDe(p)) === cod) },
          { b: lib, plantilla: plant.find((p) => p.tipo === 'per-lib' && (p.codigo ?? codigoDe(p)) === cod) },
        ] });
        tiene.add(cod);
      }
    }
    for (const t of trabajos) {
      if (!t.codigo) { avisos.add('extraer', `${clave} ${tit}: examen sin código de Test (config.convocatorias[].codigos)`); continue; }
      const preguntas = [];
      for (const { b, plantilla } of t.partes) {
        if (!plantilla) avisos.add('extraer', `${clave} ${tit} ${t.codigo}: sin plantilla para «${b.cabecera.slice(0, 80)}»`);
        for (const q of b.preguntas) preguntas.push({ q, r: plantilla?.respuestas?.[q.numero] });
      }
      const n = config.titulaciones[tit].preguntas;
      const nums = preguntas.map((x) => x.q.numero);
      if (preguntas.length !== n || nums.some((x, i) => x !== i + 1)) avisos.add('extraer', `${clave} ${tit} ${t.codigo}${t.reconstruido ? ' (reconstruido)' : ''}: ${preguntas.length} preguntas (se esperaban ${n})`);
      examenes++;
      for (const { q, r } of preguntas) {
        out.push({
          eje, tit, claveConv: clave, conv, modelo: t.codigo, modulo: null,
          numero: q.numero, orden: q.numero, seccion: q.seccion ?? null,
          enunciado: q.enunciado, opciones: q.opciones, contexto: q.contexto ?? null,
          respuesta: r ? { letras: r.letras, estado: r.estado, origen: 'plantilla', texto: r.texto } : { letras: [], estado: 'sin-plantilla', origen: 'plantilla' },
          fecha: cfg.fecha ?? null,
          fuentes: { examen: en.url, plantilla: pl.url, pagina: en.pagina ?? null, correccion },
          paginaPDF: q.pagina, reconstruido: !!t.reconstruido,
        });
      }
    }
  }
  return { apariciones: out, resumen: { examenes, apariciones: out.length } };
}
