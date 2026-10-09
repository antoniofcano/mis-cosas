// Láminas fijas del PER rehechas en estilo C (docs/ESTILO-LAMINAS.md): ritmos de las luces, regiones de balizamiento A y
// B, amarras, riesgo de abordaje (Regla 7), jerarquía entre buques (Regla 18) y dispositivo de separación del tráfico
// (Regla 10). Mismas specs, parámetros y data-parte que sus láminas antiguas; solo cambia el dibujo. Los hechos están
// comprobados contra su fuente en el apéndice de la guía. Solo colores T.* (--lc-*). Sin DOM.
//   ritmo:     { tipo:'ritmo', ritmo, texto? }
//   regiones:  { tipo:'regiones' }
//   amarras:   { tipo:'amarras', resaltar?: 'largo-proa'|'esprin-proa'|'traves'|'esprin-popa'|'largo-popa' }
//   riesgo:    { tipo:'riesgo', caso:'comparar'|'constante'|'variable' }
//   jerarquia: { tipo:'jerarquia' }
//   dst:       { tipo:'dst' }

import { T, TXT, f1, lienzo, rotulo, cartela, etiqueta, cota, referencia, flecha, ondas, tierra, paso, cascoPlanta, barquito, cotaArco, anchoTexto, pol, num } from './estilo-c.js';
import { parseRhythm, luzC, cronoC, NOMBRE_LUZ } from './lights.js';

const seg = (n) => `${num(n, 1)} s`;

// ---------------------------------------------------------------------------
// Ritmos de las luces (Recomendación IALA E-110; RD 875/2014, anexo II, PER UT 5 y UT 10)

/** Familia de un ritmo: nombre en palabras y lo que hay que fijarse. */
export function familiaRitmo(ritmo) {
  const t = String(ritmo).replace(/\s+/g, ' ').trim();
  const n = (x) => ({ 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 9: 'nueve' }[x] ?? String(x));
  let m;
  if (/^Al/.test(t)) return { k: 'Al', nombre: 'luz alternativa: cambia de color' };
  if ((m = t.match(/^(V?Q)\((\d+)\)\s*\+\s*LFl/))) return { k: 'QLFl', nombre: `${n(m[2])} centelleos${m[1] === 'VQ' ? ' muy rápidos' : ''} y uno largo` };
  if ((m = t.match(/^(V?Q)\((\d+)\)/))) return { k: m[1], nombre: `grupo de ${n(m[2])} centelleos${m[1] === 'VQ' ? ' muy rápidos' : ''}` };
  if (/^VQ/.test(t)) return { k: 'VQ', nombre: 'centelleo muy rápido continuo' };
  if (/^Q/.test(t)) return { k: 'Q', nombre: 'centelleo continuo' };
  if ((m = t.match(/^Fl\((\d+)\+(\d+)\)/))) return { k: 'Fl+', nombre: `grupos de ${n(m[1])} destellos y ${m[2] === '1' ? 'uno' : n(m[2])}` };
  if ((m = t.match(/^Fl\((\d+)\)/))) return { k: 'Fl', nombre: `grupo de ${n(m[1])} destellos` };
  if (/^LFl/.test(t)) return { k: 'LFl', nombre: 'destello largo' };
  if (/^Fl/.test(t)) return { k: 'Fl', nombre: 'destellos aislados' };
  if (/^Iso/.test(t)) return { k: 'Iso', nombre: 'isofase: tanta luz como oscuridad' };
  if ((m = t.match(/^Oc\((\d+)\)/))) return { k: 'Oc', nombre: `grupo de ${n(m[1])} ocultaciones` };
  if (/^Oc/.test(t)) return { k: 'Oc', nombre: 'ocultaciones: más luz que oscuridad' };
  if ((m = t.match(/^Mo\(([A-Z])\)/))) return { k: 'Mo', nombre: `Morse «${m[1]}»` };
  if (/^F\b/.test(t)) return { k: 'F', nombre: 'luz fija, sin apagarse' };
  return { k: '?', nombre: 'ritmo' };
}

/** Cifras de un ritmo: periodo, luz y oscuridad totales, número de apariciones y colores. */
export function cifrasRitmo(ritmo) {
  const r = parseRhythm(ritmo);
  const on = r.steps.filter((s) => s.on);
  const luz = on.reduce((a, s) => a + s.d, 0);
  const colores = [...new Set(on.map((s) => NOMBRE_LUZ[s.color ?? r.colors[0]]))];
  return { r, periodo: r.period, luz, oscuridad: r.period - luz, destellos: on.length, colores };
}

export function ritmoIllustration(spec) {
  const ritmo = spec.ritmo ?? 'Fl 5s';
  const { r, periodo, luz, oscuridad, destellos, colores } = cifrasRitmo(ritmo);
  const fam = familiaRitmo(ritmo);
  const W = 358;
  const H = 268;
  const fija = fam.k === 'F';
  const alt = `Luz ${colores.join(' y ')} con el ritmo ${ritmo}: ${fam.nombre}. ${fija ? 'No se apaga nunca.' : `Cronograma de un periodo de ${seg(periodo)}: ${destellos} ${destellos === 1 ? 'aparición' : 'apariciones'} de luz, ${seg(luz)} de luz y ${seg(oscuridad)} de oscuridad en total.`}`;
  const { out, cierra } = lienzo(W, H, alt);
  // la noche, con la torre del faro y su luz que destella con el ritmo
  out.push(`<rect x="12" y="12" width="${W - 24}" height="112" fill="${T.noche}" stroke="${T.tinta}" stroke-width=".8"/>`,
    `<rect x="12.5" y="104" width="${W - 25}" height="19.5" fill="${T.nocheMar}"/>`);
  out.push(`<path d="M52,104 L56,62 L72,62 L76,104Z" fill="${T.nocheMar}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".6"/>`,
    `<rect x="55" y="48" width="18" height="14" fill="${T.nocheMar}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".6"/>`,
    `<path d="M53,48 L64,38 L75,48Z" fill="${T.nocheMar}" stroke="${T.nocheTxt}" stroke-width=".8" stroke-opacity=".6"/>`);
  out.push(`<g data-parte="luz">${luzC(64, 55, 8, ritmo)}</g>`);
  out.push(rotulo(104, 40, 'RITMO', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'start', color: T.nocheTxt }),
    rotulo(104, 72, ritmo, { size: 22, weight: 700, estilo: 'mono', anchor: 'start', color: T.nocheTxt, p: 'ritmo' }),
    rotulo(104, 94, `luz ${colores.join(' y ')}`, { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.nocheTxt }));
  // el nombre del ritmo
  out.push(rotulo(W / 2, 144, fam.nombre, { size: TXT.nota + 1, estilo: 'serif', italic: true, weight: 700, color: T.magenta }));
  // cronograma de un periodo, con un trazo por segundo
  const x0 = 24;
  const w = W - 48;
  const y0 = 186;
  out.push(`<g data-parte="cronograma">${cronoC(x0, y0, w, 22, ritmo)}</g>`);
  if (periodo <= 30) {
    const marcas = [];
    for (let s = 1; s < periodo; s++) marcas.push(`M${f1(x0 + (s / periodo) * w)},${y0 + 22}v5`);
    if (marcas.length) out.push(`<path d="${marcas.join('')}" stroke="${T.tinta}" stroke-width=".8"/>`);
  }
  // cotas: el periodo debajo y la primera aparición de luz encima
  out.push(cota(x0, 246, x0 + w, 246, fija ? 'luz continua' : `periodo ${seg(periodo)}`, { p: 'periodo' }));
  if (!fija) {
    let t = 0;
    const i = r.steps.findIndex((s) => s.on);
    for (let k = 0; k < i; k++) t += r.steps[k].d;
    const a = x0 + (t / periodo) * w;
    const b = x0 + ((t + r.steps[i].d) / periodo) * w;
    const tx = `luz ${seg(r.steps[i].d)}`;
    const ew = anchoTexto(tx, TXT.cota, 'mono') + 10;
    const cx = Math.min(Math.max((a + b) / 2, x0 + ew / 2), x0 + w - ew / 2);
    out.push(`<g data-parte="destello">${referencia(a, y0 - 2, a, y0 - 12)}${referencia(b, y0 - 2, b, y0 - 12)}<line x1="${f1(a)}" y1="${y0 - 9}" x2="${f1(b)}" y2="${y0 - 9}" stroke="${T.magenta}" stroke-width="1.4"/>` +
      `${etiqueta(cx, y0 - 22, tx, { color: T.magenta })}</g>`);
  }
  out.push(cierra());
  return { svg: out.join(''), caption: spec.texto ?? `Periodo de ${seg(periodo)}: el tiempo que tarda en repetirse la secuencia completa.` };
}

// ---------------------------------------------------------------------------
// Regiones A y B (IALA-AISM): solo cambia el color de las laterales; las formas, no.

/** Lateral pequeña como el símbolo de la carta: lata (babor) o cono (estribor), del color de su región. */
function lateralRegion(x, y, forma, color) {
  const st = `stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"`;
  const fill = color === 'roja' ? T.rojo : T.verde;
  const fig = forma === 'lata'
    ? `<rect x="${f1(x - 7)}" y="${f1(y - 17)}" width="14" height="15" fill="${fill}" ${st}/>`
    : `<polygon points="${f1(x - 8.5)},${f1(y - 2)} ${f1(x + 8.5)},${f1(y - 2)} ${f1(x)},${f1(y - 19)}" fill="${fill}" ${st}/>`;
  return fig + `<path d="M${f1(x - 10)},${f1(y - 2)} L${f1(x + 10)},${f1(y - 2)} L${f1(x + 7)},${f1(y + 3)} L${f1(x - 7)},${f1(y + 3)}Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`;
}

export function regionesIllustration() {
  const W = 358;
  const H = 318;
  const alt = 'Dos canales vistos desde arriba, entrando desde la mar hacia el puerto. Región A: a babor, marcas rojas con forma de lata; a estribor, verdes con forma de cono. Región B: las mismas formas con los colores al revés, verdes a babor y rojas a estribor.';
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
  const panel = (x0, reg) => {
    const pw = 167;
    const babor = reg === 'A' ? 'roja' : 'verde';
    const estribor = reg === 'A' ? 'verde' : 'roja';
    const o = [];
    o.push(tierra(`M${x0},40 H${x0 + 38} V236 H${x0} Z`, pt), tierra(`M${x0 + pw - 38},40 H${x0 + pw} V236 H${x0 + pw - 38} Z`, pt));
    o.push(cartela(x0 + pw / 2, 26, `REGIÓN ${reg}`, null, { color: T.magenta, ancho: 110, p: `region-${reg.toLowerCase()}` }));
    for (const y of [104, 184]) o.push(lateralRegion(x0 + 54, y, 'lata', babor), lateralRegion(x0 + pw - 54, y, 'cono', estribor));
    o.push(`<line x1="${x0 + pw / 2}" y1="66" x2="${x0 + pw / 2}" y2="226" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="6 5"/>`,
      flecha(x0 + pw / 2, 222, x0 + pw / 2, 136, { color: T.magenta, w: 1.6 }),
      `<g transform="translate(${x0 + pw / 2} 226) rotate(-90)">${barquito(1.1)}</g>`);
    // qué color queda a cada banda
    o.push(rotulo(x0 + 34, 258, 'babor', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }),
      rotulo(x0 + 34, 274, babor.toUpperCase(), { size: TXT.rotulo, weight: 700, estilo: 'cap', color: babor === 'roja' ? T.rojoTxt : T.verdeTxt }),
      rotulo(x0 + pw - 34, 258, 'estribor', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }),
      rotulo(x0 + pw - 34, 274, estribor.toUpperCase(), { size: TXT.rotulo, weight: 700, estilo: 'cap', color: estribor === 'roja' ? T.rojoTxt : T.verdeTxt }));
    return `<g data-parte="region-${reg.toLowerCase()}">${o.join('')}</g>`;
  };
  out.push(`<rect x="0" y="236" width="${W}" height="${H - 236}" fill="${T.papel}"/>`, `<line x1="0" y1="236" x2="${W}" y2="236" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(panel(8, 'A'), panel(183, 'B'));
  out.push(rotulo(W / 2, 300, 'entrando desde la mar: la forma no cambia', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Entrando a puerto, en la región A (Europa, España incluida) las laterales de babor son rojas y las de estribor verdes; en la región B, al revés. Las formas (cilíndrica a babor, cónica a estribor) y las demás marcas (cardinales, peligro aislado, aguas navegables, especiales) son iguales en las dos regiones.' };
}

// ---------------------------------------------------------------------------
// Amarras de un barco atracado por estribor, visto desde arriba (proa a la derecha)

export const IMPIDE_AMARRA = {
  'largo-proa': 'Largo de proa: llama hacia proa; impide que el barco retroceda y que la proa se separe del muelle.',
  'esprin-proa': 'Esprín de proa: llama hacia popa; impide que el barco avance.',
  traves: 'Través: perpendicular al muelle; impide que el barco se separe de él.',
  'esprin-popa': 'Esprín de popa: llama hacia proa; impide que el barco retroceda.',
  'largo-popa': 'Largo de popa: llama hacia popa; impide que el barco avance y que la popa se separe del muelle.',
};
const AMARRAS = [
  // [parte, n, nombre, punto en el barco, noray]
  ['largo-proa', 1, 'largo de proa', [306, 124], 342, 0.4],
  ['esprin-proa', 2, 'esprín de proa', [272, 140], 150, 0.72],
  ['traves', 3, 'través', [196, 146], 196, 0.45],
  ['esprin-popa', 4, 'esprín de popa', [84, 144], 226, 0.72],
  ['largo-popa', 5, 'largo de popa', [52, 136], 18, 0.4],
];

export function amarrasIllustration(spec) {
  const hl = AMARRAS.some((a) => a[0] === spec.resaltar) ? spec.resaltar : null;
  const W = 358;
  const H = 262;
  const YM = 210; // borde del muelle
  const alt = `Barco atracado por estribor, visto desde arriba con la proa a la derecha, y sus cinco amarras hasta los norays del muelle (los puntos negros): 1 largo de proa, hacia proa; 2 esprín de proa, hacia popa; 3 través, perpendicular; 4 esprín de popa, hacia proa; 5 largo de popa, hacia popa. Los esprines se cruzan.${hl ? ` Resaltado: ${AMARRAS.find((a) => a[0] === hl)[2]}.` : ''}`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua });
  // leyenda de las cinco amarras
  out.push(`<rect x="8" y="8" width="${W - 16}" height="48" fill="${T.papel}"/>`, `<line x1="8" y1="56" x2="${W - 8}" y2="56" stroke="${T.tinta}" stroke-width=".8"/>`);
  AMARRAS.forEach(([k, n, nombre], i) => {
    const x = 16 + (i % 3) * 114;
    const y = 26 + Math.floor(i / 3) * 21;
    const on = !hl || hl === k;
    out.push(`<g data-parte="${k}">${paso(x + 4, y - 4, n, { color: on ? T.magenta : T.apagado })}${rotulo(x + 18, y + 0.5, nombre, { size: TXT.min + 0.5, anchor: 'start', estilo: 'serif', italic: !hl || hl !== k, weight: hl === k ? 700 : 400, color: on ? T.tinta : T.apagado })}</g>`);
  });
  // muelle con su cantil y los norays
  out.push(tierra(`M0,${YM} H${W} V${H} H0 Z`, pt), rotulo(W / 2, H - 14, 'MUELLE', { size: TXT.rotulo, weight: 700, estilo: 'cap', espacio: 3 }));
  // barco (proa a la derecha: su estribor da al muelle)
  out.push(`<g data-parte="barco" transform="translate(179 116) rotate(90)"><path d="${cascoPlanta(270, 62)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<line x1="0" y1="-128" x2="0" y2="132" stroke="${T.tinta}" stroke-width=".6"/></g>`,
  rotulo(300, 120, 'proa', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }), rotulo(66, 120, 'popa', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
  // las amarras: primero las apagadas, encima la resaltada
  const orden = [...AMARRAS].sort((a, b) => (a[0] === hl) - (b[0] === hl));
  for (const [k, n, , [bx, by], nx, fr] of orden) {
    const on = !hl || hl === k;
    const col = hl === k ? T.magenta : on ? T.tinta : T.apagado;
    const ny = YM + 9;
    // el número, en su cabo (a distinta altura en cada uno: los del centro se cruzan)
    const [mx, my] = [nx + (bx - nx) * fr, ny + (by - ny) * fr];
    out.push(`<g data-parte="${k}"><line x1="${bx}" y1="${by}" x2="${nx}" y2="${ny}" stroke="${col}" stroke-width="${hl === k ? 2.6 : on ? 1.8 : 1.2}" stroke-linecap="round"/>` +
      `<circle cx="${bx}" cy="${by}" r="2.6" fill="${T.tinta}"/><circle cx="${nx}" cy="${ny}" r="5" fill="${T.negro}" stroke="${T.tinta}" stroke-width="1"/>` +
      `${paso(mx, my, n, { color: hl === k ? T.magenta : on ? T.tinta : T.apagado })}</g>`);
  }
  out.push(cierra());
  return { svg: out.join(''), caption: (hl ? [IMPIDE_AMARRA[hl]] : Object.values(IMPIDE_AMARRA)).join('\n') };
}

// ---------------------------------------------------------------------------
// Riesgo de abordaje (Regla 7 d): demoras sucesivas

/**
 * Situaciones sucesivas de los dos buques (en unidades de la lámina) y las demoras desde el tuyo.
 * constante: los dos llegan al mismo punto a la vez (rumbo de colisión); variable: el otro va más despacio y pasas por
 * su proa: la demora abre hacia popa.
 */
export function casoRiesgo(constante) {
  const C = [0, 6]; // punto de colisión: tú vas al 000° a 1 por intervalo y llegas en 6
  const rumboOtro = 245; // hacia donde va el otro
  const [sx, sy] = [Math.sin((rumboOtro * Math.PI) / 180), Math.cos((rumboOtro * Math.PI) / 180)];
  const d0 = 6.3; // distancia que le falta al otro hasta el punto de colisión
  const vel = constante ? d0 / 6 : (d0 / 6) * 0.45; // con rumbo de colisión llega a la vez que tú; si no, más tarde
  const ini = [C[0] - sx * d0, C[1] - sy * d0];
  const pos = [0, 1, 2, 3].map((t) => {
    const tu = [0, t];
    const otro = [ini[0] + sx * vel * t, ini[1] + sy * vel * t];
    const dem = ((Math.atan2(otro[0] - tu[0], otro[1] - tu[1]) * 180) / Math.PI + 360) % 360;
    return { tu, otro, dem: Math.round(dem), dist: Math.hypot(otro[0] - tu[0], otro[1] - tu[1]) };
  });
  return { pos, rumboOtro };
}

const pad3 = (d) => String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0');

function panelRiesgo(x0, y0, pw, constante) {
  const { pos, rumboOtro } = casoRiesgo(constante);
  const k = 20; // px por unidad
  const P = ([x, y]) => [x0 + pw / 2 - 48 + x * k, y0 + 250 - y * k];
  const col = constante ? T.magenta : T.tinta;
  const o = [];
  o.push(rotulo(x0 + pw / 2, y0 + 20, constante ? 'DEMORA CONSTANTE' : 'DEMORA QUE CAMBIA', { size: TXT.min, weight: 700, estilo: 'cap', color: constante ? T.magenta : T.tinta, espacio: 0.8 }));
  // líneas de demora sucesivas
  pos.forEach((q, i) => {
    const [a, b] = [P(q.tu), P(q.otro)];
    o.push(`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${i === 3 ? 1.4 : 1}" stroke-dasharray="5 4" opacity="${f1(0.45 + 0.18 * i)}"/>`);
  });
  // situaciones 1 a 4 de cada uno (la última, el barco)
  pos.forEach((q, i) => {
    for (const [p, rumbo, who] of [[P(q.tu), 0, 'tu'], [P(q.otro), rumboOtro, 'otro']]) {
      if (i < 3) o.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="3" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>`);
      else o.push(`<g data-parte="${who === 'tu' ? 'tu' : 'otro'}" transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(rumbo - 90)})">${barquito(1.05, who === 'tu' ? T.magenta : T.tinta)}</g>`);
      o.push(rotulo(p[0] + (who === 'tu' ? -10 : 0), p[1] + (who === 'tu' ? 4 : -9), String(i + 1), { size: TXT.min, estilo: 'mono', weight: 700, anchor: who === 'tu' ? 'end' : 'middle', color: T.apagado }));
    }
  });
  const [tx, ty] = P(pos[3].tu);
  o.push(rotulo(tx + 14, ty + 18, 'tú', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: T.magenta, anchor: 'start' }));
  // las demoras, en cifras
  const dems = pos.map((q) => `${pad3(q.dem)}°`);
  if (pw > 300) o.push(rotulo(x0 + pw / 2, y0 + 286, `demoras: ${dems.join(' · ')}`, { size: TXT.min, estilo: 'mono', weight: 600, p: 'demoras' }));
  else o.push(rotulo(x0 + pw / 2, y0 + 270, 'demoras', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }), rotulo(x0 + pw / 2, y0 + 286, dems.join('·'), { size: TXT.min, estilo: 'mono', weight: 600, p: 'demoras' }));
  o.push(rotulo(x0 + pw / 2, y0 + 304, constante ? 'y la distancia baja: riesgo' : 'cambia: en principio, sin riesgo', { size: TXT.min, estilo: 'serif', italic: true, color: constante ? T.magenta : T.apagado }));
  return o.join('');
}

export function riesgoIllustration(spec) {
  const caso = spec.caso ?? 'comparar';
  if (!['comparar', 'constante', 'variable'].includes(caso)) return null;
  const dos = caso === 'comparar';
  const W = 358;
  const H = 330;
  const alt = {
    comparar: 'Dos situaciones vistas desde arriba, con cuatro demoras sucesivas tomadas desde tu barco al otro. A la izquierda, la demora no cambia y la distancia baja: las líneas de demora son paralelas y hay riesgo de abordaje. A la derecha, la demora cambia: en principio no hay riesgo.',
    constante: 'Tu barco y otro que se acerca, vistos desde arriba, con cuatro demoras sucesivas: la demora no cambia y la distancia baja, las líneas son paralelas: hay riesgo de abordaje.',
    variable: 'Tu barco y otro que se acerca, vistos desde arriba, con cuatro demoras sucesivas: la demora cambia de forma apreciable; en principio no hay riesgo, aunque puede haberlo con un buque grande, un remolque o muy cerca.',
  }[caso];
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  if (dos) {
    out.push(panelRiesgo(4, 6, 175, true), panelRiesgo(179, 6, 175, false));
    out.push(`<line x1="179" y1="14" x2="179" y2="${H - 14}" stroke="${T.tinta}" stroke-width=".6" stroke-dasharray="3 4"/>`);
  } else out.push(panelRiesgo(0, 6, W, caso === 'constante'));
  out.push(cierra());
  const cap = {
    comparar: 'Toma demoras sucesivas al otro buque. Si la demora no varía de forma apreciable y la distancia disminuye, existe riesgo de abordaje: las líneas de marcación se mantienen paralelas. Aunque la demora cambie, puede haber riesgo con un buque grande, un remolque o a muy corta distancia; ante la duda, el riesgo existe (Regla 7).',
    constante: 'Demora constante y distancia que disminuye: hay riesgo de abordaje (Regla 7 d i). Las líneas de marcación sucesivas son paralelas.',
    variable: 'Si la demora cambia de forma apreciable, en principio no hay riesgo; pero puede existir con un buque grande, un remolque o a muy corta distancia (Regla 7 d ii).',
  };
  return { svg: out.join(''), caption: cap[caso] };
}

// ---------------------------------------------------------------------------
// Jerarquía entre buques (Regla 18): cada uno se aparta de los de arriba

/** Marca de día pequeña (negra, perfilada en tinta). */
function marquita(m, cx, cy, k = 5) {
  const st = `fill="${T.negro}" stroke="${T.tinta}" stroke-width="1" stroke-linejoin="round"`;
  const p = (pts) => `<polygon points="${pts.map(([a, b]) => `${f1(cx + a * k)},${f1(cy + b * k)}`).join(' ')}" ${st}/>`;
  if (m === 'bola') return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${k}" ${st}/>`;
  if (m === 'bicono') return p([[0, -1.3], [1, 0], [0, 1.3], [-1, 0]]);
  if (m === 'diabolo') return p([[-1, -1.3], [1, -1.3], [0, 0]]) + p([[0, 0], [1, 1.3], [-1, 1.3]]);
  if (m === 'cilindro') return `<rect x="${f1(cx - k * 0.75)}" y="${f1(cy - k * 1.2)}" width="${f1(k * 1.5)}" height="${f1(k * 2.4)}" ${st}/>`;
  return '';
}
/** Columna de marcas de día, de arriba abajo. */
const columna = (ms, cx, cy, k = 5) => ms.map((m, i) => marquita(m, cx, cy + (i - (ms.length - 1) / 2) * k * 2.8, k)).join('');

const RANGOS = [
  // [parte, nombre, sub, marcas]
  [['sin-gobierno', 'Sin gobierno', 'dos bolas', ['bola', 'bola']], ['restringido', 'Maniobra|restringida', null, ['bola', 'bicono', 'bola']]],
  [['calado', 'Restringido por su calado', 'no estorbarle · un cilindro', ['cilindro']]],
  [['pesca', 'Dedicado a la pesca', 'dos conos unidos por el vértice', ['diabolo']]],
  [['vela', 'De vela', 'navegando solo a vela', []]],
  [['motor', 'De propulsión mecánica', 'navegando a motor', []]],
];

export function jerarquiaIllustration() {
  const W = 358;
  const H = 360;
  const alt = 'La jerarquía de la Regla 18 en cinco escalones, de arriba abajo: sin gobierno y maniobra restringida; restringido por su calado (al que no se estorba); dedicado a la pesca; de vela; de propulsión mecánica. Una flecha dice que cada uno se aparta de los que están por encima. Cada escalón lleva su marca de día.';
  const { out, cierra } = lienzo(W, H, alt);
  const x0 = 14;
  const x1 = 294;
  const hF = 52;
  RANGOS.forEach((fila, i) => {
    const y = 16 + i * (hF + 12);
    const n = fila.length;
    const ancho = (x1 - x0 - (n - 1) * 8) / n;
    fila.forEach(([p, nombre, sub, marcas], j) => {
      const x = x0 + j * (ancho + 8);
      const conM = marcas.length > 0;
      const tx = x + (conM ? 34 : 12);
      out.push(`<g data-parte="${p}"><rect x="${f1(x)}" y="${y}" width="${f1(ancho)}" height="${hF}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>` +
        `<rect x="${f1(x + 2.5)}" y="${y + 2.5}" width="${f1(ancho - 5)}" height="${hF - 5}" fill="none" stroke="${T.tinta}" stroke-width=".5"/>` +
        (conM ? columna(marcas, x + 18, y + hF / 2, marcas.length > 2 ? 4.4 : 5) : '') +
        (sub ? rotulo(tx, y + 22, nombre, { size: TXT.rotulo, weight: 700, estilo: 'serif', anchor: 'start' }) + rotulo(tx, y + 39, sub, { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado })
          : nombre.split('|').map((t, l) => rotulo(tx, y + 22 + l * 16, t, { size: TXT.rotulo, weight: 700, estilo: 'serif', anchor: 'start' })).join('')) + '</g>');
    });
  });
  // la flecha: se aparta de los de arriba
  const yb = 16 + 4 * (hF + 12) + hF;
  out.push(flecha(326, yb - 6, 326, 22, { color: T.magenta, w: 1.8 }));
  out.push(`<text x="0" y="0" font-size="${TXT.min}" font-weight="700" fill="${T.magenta}" class="lc-sans" letter-spacing="1.2" text-anchor="middle" transform="translate(342 ${f1((yb + 16) / 2)}) rotate(-90)">SE APARTA DE LOS DE ARRIBA</text>`);
  out.push(cierra());
  return { svg: out.join(''), caption: 'Cada uno se mantiene apartado de los que están por encima. Excepciones: el que alcanza siempre se aparta (Regla 13), y en canales angostos y dispositivos de separación mandan las Reglas 9 y 10.' };
}

// ---------------------------------------------------------------------------
// Dispositivo de separación del tráfico (Regla 10)

export function dstIllustration() {
  const W = 358;
  const H = 330;
  const alt = 'Dispositivo de separación del tráfico visto desde arriba: dos vías de circulación con sentidos contrarios, separadas por una zona de separación, y entre la vía y la costa la zona de navegación costera. 1: un barco cruza con la proa perpendicular a la corriente del tráfico. 2: otro entra por el extremo del dispositivo. 3: un velero navega por la zona de navegación costera.';
  const { out, pt, ray, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [yV1, yS, yS2, yV2, yC] = [70, 128, 146, 204, 262]; // límites: vía de arriba, separación, vía de abajo, zona costera
  const xI = 54; // extremo de entrada del dispositivo
  // costa
  out.push(tierra(`M0,${yC + 26} C80,${yC + 18} 200,${yC + 30} ${W},${yC + 22} V${H} H0 Z`, pt));
  // vías: el dispositivo empieza en xI
  out.push(`<g data-parte="via"><rect x="${xI}" y="${yV1}" width="${W - xI}" height="${yS - yV1}" fill="${T.agua}"/><rect x="${xI}" y="${yS2}" width="${W - xI}" height="${yV2 - yS2}" fill="${T.agua}"/></g>`);
  out.push(`<g data-parte="separacion"><rect x="${xI}" y="${yS}" width="${W - xI}" height="${yS2 - yS}" fill="${T.papel}"/><rect x="${xI}" y="${yS}" width="${W - xI}" height="${yS2 - yS}" fill="${ray}" opacity=".5"/>` +
    `<line x1="${xI}" y1="${yS}" x2="${W}" y2="${yS}" stroke="${T.magenta}" stroke-width="1.4"/><line x1="${xI}" y1="${yS2}" x2="${W}" y2="${yS2}" stroke="${T.magenta}" stroke-width="1.4"/></g>`);
  out.push(`<path d="M${xI},${yV1} H${W} M${xI},${yV2} H${W} M${xI},${yV1} V${yV2}" fill="none" stroke="${T.magenta}" stroke-width="1" stroke-dasharray="8 4"/>`);
  // sentido de la circulación en cada vía
  for (const x of [120, 240]) {
    out.push(flecha(x + 44, (yV1 + yS) / 2, x - 10, (yV1 + yS) / 2, { color: T.magenta, w: 2.2, p: 'via' }), flecha(x - 10, (yS2 + yV2) / 2, x + 44, (yS2 + yV2) / 2, { color: T.magenta, w: 2.2, p: 'via' }));
  }
  // rótulos de las zonas
  out.push(rotulo(xI + 8, yV1 + 16, 'vía de circulación', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'start' }),
    rotulo(xI + 8, yV2 - 8, 'vía de circulación', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'start' }),
    etiqueta(200, (yS + yS2) / 2, 'ZONA DE SEPARACIÓN', { color: T.magenta, p: 'separacion' }),
    rotulo(112, yV2 + 56, 'zona de navegación costera', { size: TXT.min + 0.5, estilo: 'serif', italic: true, anchor: 'start', p: 'costera' }));
  // 1: cruza con la proa a 90° de la corriente del tráfico
  const xc = 300;
  out.push(`<g data-parte="cruzar"><line x1="${xc}" y1="${yV2 + 22}" x2="${xc}" y2="${yV1 - 18}" stroke="${T.tinta}" stroke-width="1.4" stroke-dasharray="6 4"/>` +
    `<g transform="translate(${xc} ${yV1 - 12}) rotate(-90)">${barquito(1.2)}</g>` +
    `<path d="M${xc},${yV2 - 14} H${xc + 14} V${yV2}" fill="none" stroke="${T.tinta}" stroke-width="1"/>${paso(xc - 18, yV1 - 26, 1)}</g>`);
  out.push(rotulo(xc + 18, yV2 + 14, '90°', { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'start' }));
  // 2: entra por el extremo, en el sentido del tráfico
  out.push(`<g data-parte="entrar">${flecha(12, yV2 + 8, xI + 26, (yS2 + yV2) / 2 + 4, { color: T.tinta, w: 1.4, discontinua: true })}` +
    `<g transform="translate(${xI + 34} ${(yS2 + yV2) / 2 + 4}) rotate(-12)">${barquito(1.05)}</g>${paso(22, yV2 + 26, 2)}</g>`);
  // 3: velero por la zona de navegación costera
  out.push(`<g data-parte="costera"><g transform="translate(90 ${yV2 + 50})">${barquito(1, T.tinta)}<line x1="0" y1="0" x2="-6" y2="-11" stroke="${T.tinta}" stroke-width="1.2"/></g>${paso(66, yV2 + 52, 3)}</g>`);
  out.push(cierra());
  return { svg: out.join(''), caption: 'Se navega por la vía en el sentido de la circulación. Si hay que cruzarlo, con la proa lo más perpendicular posible a la corriente del tráfico; para entrar o salir, por los extremos o con el menor ángulo. Los buques de menos de 20 m, los de vela y los pesqueros pueden usar la zona de navegación costera.' };
}
