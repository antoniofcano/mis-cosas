// Informe normativo del banco vivo de Andalucía (fase F2, solo informe; la fase F1 resuelve cada pregunta).
//   node tools/bancos/ejes/andalucia/normativa.mjs   → tools/bancos/informes/andalucia-normativa.md
// Aplica la lógica de la etapa «normativa» (etapas/normativa.mjs: cargarNormas + normasAfectadas, con data/normativa.json)
// a data/ejes/andalucia/<tit>/preguntas.json SIN escribir en el banco: el campo norma de cada pregunta no se toca.
// Antes comprueba que las fechas, el BOE, la URL y los detectores de los cambios pedidos coinciden con
// research_notes/…/normativa.md (COMPROBAR, abajo). Los detectores son anchos a propósito: se marca de más.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANCOS, RAIZ, escribirTexto, hoy } from '../../lib/comun.mjs';
import { cargarNormas, normasAfectadas } from '../../etapas/normativa.mjs';
import { canonico } from '../../lib/texto.mjs';

/**
 * Lo que dice normativa.md de cada cambio pedido (fecha de entrada en vigor, BOE, URL y algún detector imprescindible).
 * Si data/normativa.json se aparta de esto, el informe lo señala y el test falla.
 */
export const COMPROBAR = [
  { id: 'RD 339/2021', vigor: '2021-07-01', boe: 'BOE-A-2021-8268', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-8268', detectores: ['bengala', 'chaleco', 'extintor', 'orden fom/1144'], nombre: /deroga la Orden FOM\/1144\/2003/, nota: 'deroga la Orden FOM/1144/2003 con efectos desde el 1-7-2021 (normativa.md, § 2)' },
  { id: 'RD 587/2022', vigor: '2022-07-21', boe: 'BOE-A-2022-12013', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12013', detectores: ['navtex'], nota: 'NAVTEX en zona 1 solo para la lista 6.ª; balsas homologadas por la DGMM (§ 2 y § 4)' },
  { id: 'RD 1188/2025 (gobierno sin título)', vigor: '2026-10-01', boe: 'BOE-A-2025-27010', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010', detectores: ['sin titul', '11[,.]26', '15 ?cv', 'alquiler'], nota: 'art. 10 del RD 875/2014 «con efectos desde el 1 de octubre de 2026» (DF 2.ª.2; § 1 y § 3)' },
  { id: 'RD 191/2026', vigor: '2026-04-02', boe: 'BOE-A-2026-5877', url: 'https://www.boe.es/eli/es/rd/2026/03/11/191', detectores: ['posidonia', 'pradera', 'cymodocea'], nota: 'prohibición general de fondear sobre praderas en el Mediterráneo (§ 5)' },
  { id: 'IALA MBS 2022', vigor: '2026-01-09', boe: 'BOE-A-2026-510', url: 'https://www.boe.es/boe/dias/2026/01/09/pdfs/BOE-A-2026-510.pdf', detectores: ['boya', 'baliza', 'cardinal', 'lateral'], resumen: /2010/, nota: 'IALA-MBS 2010 (Puertos del Estado, 8-6-2010; aún citada por Murcia, Melilla y el norte) frente a la MBS 2022 que cita la DGMM en el BOE-A-2026-510; sin cambio verificado entre ediciones (§ 4, Gaps): se revisa todo el balizamiento anterior' },
];

/**
 * Lectura rápida a mano de las marcas de cada cambio pedido (2026-10-07): orienta a la fase F1, no resuelve nada.
 * Si cambian las marcas, el informe avisa de que la nota puede haberse quedado atrás.
 */
export const LECTURA = {
  'RD 339/2021': { marcas: 34, texto: 'Las marcas son todas de 2020-c1, 2020-c3 y 2021-c1 (antes del 1-7-2021). Las más cercanas al cambio: and-2021-c1-t09 (flotabilidad en zona 4: 150 N, sin cambio en el RD), and-py-2021-c1-g04 (chalecos de niños: uno por niño, sin cambio), and-2020-c1-t11 (aguas sucias de tanque a régimen moderado y ≥ 4 nudos: el RD 339/2021 lo mantiene), and-2020-c3-t10 (aros con luz), and-2021-c1-t07 y and-py-2020-c3-g04 (fumígena de 3 minutos) y and-py-2020-c1-g04 (bengala de mano de 60 s). Ninguna de las marcadas pide el número de bengalas, cohetes o fumígenas por zona, los chalecos de zona 1, el tipo de extintor ni el material náutico, que es lo que cambió. El resto son marcas anchas (corredera como instrumento, «regla de» visibilidad reducida, achique en vías de agua, supervivencia en la balsa).' },
  'RD 587/2022': { marcas: 28, texto: 'Todas son del PY (genérico y navegación) de 2020-c1 a 2022-c2. Ninguna pregunta trata del NAVTEX en zona 1, que es lo que cambió para la radio; las que tocan equipos son and-py-2021-c1-g05 (EPIRB), and-py-2021-c2-g07 y -g09 (EPIRB y SART), and-py-2021-c2-g10 (VHF con LSD) y las de la balsa (and-py-2022-c1-g04 envoltura, and-py-2022-c2-g08 toldo), donde el cambio de 2022 solo afecta a la homologación de las balsas (ISO 9650 u otra norma equivalente homologada por la DGMM). El resto son técnicas de supervivencia en la balsa y canales de VHF.' },
  'RD 1188/2025 (gobierno sin título)': { marcas: 2, texto: 'El banco vivo no tiene ninguna pregunta sobre la navegación sin título (art. 10 del RD 875/2014): las dos marcas son por «6 metros de eslora» en la cadena de fondeo (and-2023-c1-t01) y por «artefactos flotantes» en los puertos comerciales (and-2026-c2-t11). No hay respuestas oficiales que el cambio del 1-10-2026 deje obsoletas; si la fase F1 añade una pregunta o una explicación sobre el gobierno sin título, debe usar la redacción nueva (uso privado, 15 CV sin reductor, 2 millas de la salida, alquiler con título).' },
  'RD 191/2026': { marcas: 20, texto: 'Las que tratan de la posidonia son and-2022-c2-t11, and-2024-c3-t11 y and-2026-c1-t11: sus respuestas oficiales (prohibición general de fondear sobre la pradera, también con la cadena o el borneo, salvo fuerza mayor; los campos de boyas no permiten fondear sobre ella) coinciden con el art. 5 del RD 191/2026, aunque son anteriores a él; conviene citar la norma en la explicación. También: and-2025-c2-q45 (fondeo prohibido en la carta), and-2024-c1-t40 (fondeadero prohibido en las cartas), las ZEPIM (and-2021-c1-t12, and-2021-c2-t11, and-2023-c1-t11) y la elección del tenedero (and-2020-c1-t06, and-2022-c2-t05, and-2025-c3-t06, con «algas» entre las opciones, and-2022-c3-t06, and-2024-c2-t06, and-2025-c1-t05), donde la explicación debería añadir que en el Mediterráneo no se fondea sobre praderas. El resto son marcas anchas («fondeadero», «fondo marino»).' },
  'IALA MBS 2022': { marcas: 120, texto: 'Todo el balizamiento del PER anterior a 2026 (80 de la UT 5) y las preguntas de carta y del PY con boyas, faros o marcas. No se ha verificado con fuente primaria qué cambió entre la IALA-MBS 2010 y la 2022 (normativa.md, § 4, Gaps): la fase F1 debe cotejar las de la UT 5 con el texto de la MBS 2022 antes de dar por buenas las respuestas; las de las otras unidades casi siempre nombran un faro o una boya de pasada.' },
};

/** Comprueba data/normativa.json frente a COMPROBAR → [{ id, ok, fallos: [] }]. */
export function comprobarNormas(normas) {
  return COMPROBAR.map((c) => {
    const n = normas.find((x) => x.id === c.id);
    if (!n) return { ...c, ok: false, fallos: ['no está en data/normativa.json'] };
    const fallos = [];
    if (n.vigor !== c.vigor) fallos.push(`vigor ${n.vigor} (normativa.md: ${c.vigor})`);
    if (n.boe !== c.boe) fallos.push(`BOE ${n.boe} (normativa.md: ${c.boe})`);
    if (n.url !== c.url) fallos.push(`URL ${n.url} (normativa.md: ${c.url})`);
    for (const d of c.detectores) if (!n.detectores.includes(d)) fallos.push(`falta el detector «${d}»`);
    if (c.nombre && !c.nombre.test(n.nombre)) fallos.push(`el nombre no dice ${c.nombre}`);
    if (c.resumen && !c.resumen.test(n.resumen)) fallos.push(`el resumen no cita ${c.resumen}`);
    return { ...c, ok: !fallos.length, fallos, detectoresTotal: n.detectores.length };
  });
}

const textoPregunta = (p) => canonico(`${p.contexto ?? ''} ${p.enunciado} ${Object.values(p.opciones ?? {}).join(' ')}`);

/** Motivo de cada marca: fecha más antigua frente a la entrada en vigor, detectores que encajan y un fragmento. */
export function motivo(p, n) {
  const texto = textoPregunta(p);
  const encajan = n.re.filter((r) => r.test(texto));
  const m = encajan.length ? encajan[0].exec(texto) : null;
  let fragmento = '';
  if (m) {
    const a = Math.max(0, m.index - 35);
    const b = Math.min(texto.length, m.index + m[0].length + 35);
    fragmento = `${a > 0 ? '…' : ''}${texto.slice(a, m.index)}**${m[0]}**${texto.slice(m.index + m[0].length, b)}${b < texto.length ? '…' : ''}`;
  }
  const fechas = [p.fecha, ...(p.apareceEn ?? []).map((x) => x.fecha)].filter(Boolean).sort();
  return { fecha: fechas[0] ?? null, detectores: encajan.map((r) => r.source), fragmento };
}

/** Marcas del banco vivo por norma (sin tocar el banco). */
export function marcar(bancos, normas) {
  const porNorma = Object.fromEntries(normas.map((n) => [n.id, []]));
  const porPregunta = new Map();
  for (const [tit, ps] of Object.entries(bancos)) {
    for (const p of ps) {
      const ids = normasAfectadas(p, normas);
      if (ids.length) porPregunta.set(p.id, ids);
      for (const id of ids) {
        const n = normas.find((x) => x.id === id);
        porNorma[id].push({ id: p.id, tit, ut: p.ut, anulada: p.anulada, ...motivo(p, n) });
      }
    }
  }
  return { porNorma, porPregunta };
}

const celda = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function informe({ normas, comprobacion, marcas, totales, resolucion = null }) {
  const L = ['# Andalucía · normativa del banco vivo (solo informe)', ''];
  L.push(`Generado por \`node tools/bancos/ejes/andalucia/normativa.mjs\` el ${hoy()}. Aplica la etapa \`normativa\` (\`tools/bancos/etapas/normativa.mjs\`, con \`data/normativa.json\`) al banco vivo \`data/ejes/andalucia/<tit>/preguntas.json\` (${totales.per} preguntas de PER y ${totales.py} de PY, 2020–2026) **en modo informe** (este guion no escribe en el banco). La fase F1 resolvió cada pregunta marcada contra el texto legal: la resolución, con su motivo y su fuente, está en \`tools/bancos/ejes/andalucia/ajustes.json\` y la aplica al banco \`revision-normativa.mjs --escribir\` (resumen en «Resolución»).`, '');
  L.push('Una pregunta se marca con una norma si su aparición más antigua es anterior a la entrada en vigor y su texto (contexto, enunciado y opciones, sin tildes ni mayúsculas) encaja con algún detector de la norma. Los detectores son anchos a propósito: **se marca de más**, y muchas marcas resultarán ser preguntas que siguen valiendo (el motivo de cada una permite descartarlas deprisa).', '');

  L.push('## Comprobación de data/normativa.json', '');
  L.push('Fechas de entrada en vigor, BOE, URL y detectores imprescindibles de los cambios pedidos, frente a `research_notes/…/normativa.md`:', '');
  L.push('| Norma | Vigor | BOE | URL | Detectores | Resultado | Nota |', '|---|---|---|---|---|---|---|');
  for (const c of comprobacion) L.push(`| ${c.id} | ${c.vigor} | ${c.boe} | ${c.url} | ${c.detectoresTotal ?? '—'} (incluye ${c.detectores.map((d) => `«${d}»`).join(', ')}) | ${c.ok ? 'coincide' : `**no coincide**: ${c.fallos.join('; ')}`} | ${c.nota} |`);
  L.push('');

  L.push('## Resumen', '');
  L.push('| Norma | En vigor desde | PER | PY | Total |', '|---|---|---|---|---|');
  const pedidas = new Set(COMPROBAR.map((c) => c.id));
  const orden = [...COMPROBAR.map((c) => c.id), ...normas.map((n) => n.id).filter((id) => !pedidas.has(id))];
  for (const id of orden) {
    const n = normas.find((x) => x.id === id);
    const l = marcas.porNorma[id] ?? [];
    const per = l.filter((x) => x.tit === 'per').length;
    const py = l.filter((x) => x.tit === 'py').length;
    L.push(`| ${pedidas.has(id) ? `**${id}**` : id} | ${n?.vigor ?? '—'} | ${per} | ${py} | ${per + py} |`);
  }
  const varias = [...marcas.porPregunta.values()].filter((l) => l.length > 1).length;
  L.push('');
  L.push(`Preguntas distintas marcadas: **${marcas.porPregunta.size}** (${[...marcas.porPregunta.keys()].filter((id) => !id.startsWith('and-py-')).length} de PER y ${[...marcas.porPregunta.keys()].filter((id) => id.startsWith('and-py-')).length} de PY); ${varias} con más de una norma. En negrita, los cambios pedidos para esta revisión; el resto son las demás normas de \`data/normativa.json\` cuya fecha cae dentro del banco.`, '');

  if (resolucion) {
    const todas = ['per', 'py'].flatMap((t) => Object.entries(resolucion[t] ?? {}));
    const n = (e) => todas.filter(([, a]) => a.norma.estado === e).length;
    L.push('## Resolución (fase F1)', '');
    L.push(`${todas.length} preguntas resueltas: **${n('vigente')} vigentes**, **${n('actualizada')} actualizadas** (la respuesta oficial vale; la explicación dice qué cambió y cuándo) y **${n('retirada')} retiradas**. Cada una lleva en \`ajustes.json\` el motivo por norma y su fuente (BOE consolidado o IALA R1001 ed. 2.0).`, '');
    for (const [id, a] of todas.filter(([, x]) => x.norma.estado !== 'vigente')) L.push(`- **${id}** (${a.norma.estado}): ${a.norma.nota ?? ''}`);
    L.push('');
  }

  for (const id of orden) {
    const n = normas.find((x) => x.id === id);
    const l = marcas.porNorma[id] ?? [];
    L.push(`## ${id}`, '');
    L.push(`${n.nombre}. En vigor desde el ${n.vigor} ([${n.boe}](${n.url})). ${n.resumen}`, '');
    if (!l.length) {
      L.push(`_Ninguna pregunta marcada._ ${n.vigor <= '2020-07-25' ? 'Entró en vigor antes de la primera convocatoria del banco vivo (25-7-2020).' : 'Ningún texto anterior a su entrada en vigor encaja con sus detectores.'}`, '');
      continue;
    }
    L.push(`${l.length} preguntas (${l.filter((x) => x.tit === 'per').length} de PER, ${l.filter((x) => x.tit === 'py').length} de PY). Motivo común: la pregunta es anterior al ${n.vigor}; abajo, los detectores que encajan y el fragmento (texto canónico) del primero.`, '');
    const lect = LECTURA[id];
    if (lect) L.push(`**Lectura rápida** (a mano; no resuelve, orienta a la fase F1)${lect.marcas !== l.length ? ` — escrita con ${lect.marcas} marcas y ahora hay ${l.length}: revisarla` : ''}: ${lect.texto}`, '');
    L.push('| id | Fecha | UT | Detectores | Fragmento |', '|---|---|---|---|---|');
    for (const x of l) L.push(`| ${x.id}${x.anulada ? ' (anulada)' : ''} | ${x.fecha ?? 'sin fecha'} | ${x.ut ?? '—'} | ${celda(x.detectores.map((d) => `\`${d}\``).join(', '))} | ${celda(x.fragmento)} |`);
    L.push('');
  }
  return `${L.join('\n')}\n`;
}

/**
 * Fecha de cada aparición: la de su convocatoria (la de las preguntas que la tienen como `conv`). Una pregunta publicada
 * que también salió antes en otra convocatoria (apareceEn, Andalucía 2015–2019) se marca por la más antigua. Las
 * convocatorias sin fecha (2015) cuentan desde el 1 de enero de su año: solo para comparar con la entrada en vigor.
 */
export function conFechasDeAparicion(preguntas) {
  const fechaConv = new Map();
  for (const q of preguntas) if (!fechaConv.has(q.conv) || (q.fecha && !fechaConv.get(q.conv))) fechaConv.set(q.conv, q.fecha ?? null);
  const fecha = (conv) => fechaConv.get(conv) ?? (/-(\d{4})-c/.exec(conv) ? `${/-(\d{4})-c/.exec(conv)[1]}-01-01` : null);
  return preguntas.map((q) => (q.apareceEn.some((a) => a.conv !== q.conv) ? { ...q, apareceEn: q.apareceEn.map((a) => ({ ...a, fecha: fecha(a.conv) })) } : q));
}

export function ejecutar() {
  const normas = cargarNormas();
  const bancos = Object.fromEntries(['per', 'py'].map((t) => [t, conFechasDeAparicion(JSON.parse(readFileSync(join(RAIZ, 'data', 'ejes', 'andalucia', t, 'preguntas.json'), 'utf8')).preguntas)]));
  const comprobacion = comprobarNormas(normas);
  const marcas = marcar(bancos, normas);
  let resolucion = null;
  try { resolucion = JSON.parse(readFileSync(join(RAIZ, 'tools', 'bancos', 'ejes', 'andalucia', 'ajustes.json'), 'utf8')); } catch { /* aún sin resolver */ }
  return { normas, comprobacion, marcas, totales: { per: bancos.per.length, py: bancos.py.length }, resolucion };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = ejecutar();
  escribirTexto(join(BANCOS, 'informes', 'andalucia-normativa.md'), informe(r));
  for (const c of r.comprobacion) console.log(c.ok ? 'ok  ' : 'MAL ', c.id, c.fallos.join('; '));
  for (const [id, l] of Object.entries(r.marcas.porNorma)) if (l.length) console.log(id, l.length);
  console.log('preguntas marcadas', r.marcas.porPregunta.size);
}
