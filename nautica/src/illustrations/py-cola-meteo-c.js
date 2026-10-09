// Láminas de meteorología del PY (UT 2) de la cola, rehechas en estilo C (docs/ESTILO-LAMINAS.md). Mismos tipos y
// parámetros que las láminas de lección a las que sustituyen; solo cambia el dibujo. Sin DOM. Hemisferio norte.
//   humedad:        { tipo:'humedad', t?, td? }                                   (py-2-5)
//   psicrometro:    { tipo:'psicrometro', caso?: 'ejemplo'|'humedo'|'seco' }      (py-2-5)
//   nubes:          { tipo:'nubes', resaltar?: género, piso o lista }             (py-2-6)
//   nubes-pisos:    { tipo:'nubes-pisos', resaltar?: piso o lista }               (py-2-6)
//   ola:            { tipo:'ola', vista:'partes'|'mar-de-fondo', resaltar? }      (py-2-8)
//   modelos-viento: { tipo:'modelos-viento', modelo?: 'todos'|'geostrofico'|'gradiente'|'antitriptico' } (py-2-3)
// Solo colores T.*; lo que se mira, en magenta; cada fuerza o cada piso con su rótulo (nada solo por color).

import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, flecha, referencia, arcoD, pol, f1 } from './estilo-c.js';
import { tensionSaturacion } from '../nautical/meteo.js';

const W = 358;
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);
const num = (n, d = 0) => String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',');
const serif = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });
const mono = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'mono', ...o });
const linea = (x1, y1, x2, y2, { color = T.tinta, w = 1, extra = '' } = {}) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${w}"${extra ? ` ${extra}` : ''}/>`;
const filete = (y) => linea(14, y, W - 14, y, { w: 0.6 });

// ===========================================================================
// Humedad relativa y punto de rocío (py-2-5): mismo vapor; al enfriar, la HR sube hasta el 100 % en el punto de rocío.

export function humedadC(spec = {}) {
  const t = Number(spec.t ?? 20);
  const td = Number(spec.td ?? 12);
  if (!Number.isFinite(t) || !Number.isFinite(td) || td > t || t > 30 || td < 0) return null;
  const H = 336;
  const e = tensionSaturacion(td);
  const hr = Math.round((100 * e) / tensionSaturacion(t));
  const alt = `Gráfica de la cantidad de vapor que satura el aire según su temperatura, una curva que sube cada vez más deprisa. El aire a ${t} °C con el vapor de un punto de rocío de ${td} °C queda por debajo de la curva: humedad relativa del ${hr} %. Una flecha magenta lo enfría sin añadir vapor, en horizontal, hasta tocar la curva a ${td} °C: el punto de rocío, donde se satura y condensa.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [x0, y0, ancho, alto] = [54, 238, 282, 196];
  const xs = (T0) => x0 + (T0 / 30) * ancho;
  const ys = (v) => y0 - (v / 45) * alto;
  // ejes y su cuadrícula fina
  for (const T0 of [0, 10, 20, 30]) out.push(linea(xs(T0), y0, xs(T0), y0 - alto, { w: 0.5, color: T.apagado, extra: 'stroke-dasharray="2 4"' }), mono(xs(T0) + (T0 === 30 ? 4 : 0), y0 + 17, `${T0} °C`, { anchor: T0 === 30 ? 'end' : 'middle' }));
  for (const v of [10, 20, 30, 40]) out.push(linea(x0, ys(v), x0 + ancho, ys(v), { w: 0.5, color: T.apagado, extra: 'stroke-dasharray="2 4"' }), mono(x0 - 6, ys(v) + 4, String(v), { anchor: 'end' }));
  out.push(linea(x0, y0, x0 + ancho, y0, { w: 1.2 }), linea(x0, y0, x0, y0 - alto - 6, { w: 1.2 }));
  out.push(serif(x0 + ancho, y0 + 36, 'temperatura del aire', { anchor: 'end', italic: true, color: T.apagado }), serif(16, 24, 'vapor que cabe (hPa)', { italic: true, color: T.apagado }));
  // curva de saturación
  let d = '';
  for (let T0 = 0; T0 <= 30; T0 += 0.5) d += `${T0 ? 'L' : 'M'}${f1(xs(T0))},${f1(ys(tensionSaturacion(T0)))}`;
  out.push(`<path d="${d}" fill="none" stroke="${T.tinta}" stroke-width="2"/>`);
  out.push(cartela(176, 52, 'SATURADO', 'humedad relativa 100 %', { ancho: 160 }), referencia(236, 71, xs(25), ys(tensionSaturacion(25)) + 3));
  // el aire, lo que le cabría y el enfriamiento
  const A = [xs(t), ys(e)];
  const R = [xs(td), ys(e)];
  const sup = ys(tensionSaturacion(t));
  out.push(linea(A[0], A[1] - 5, A[0], sup + 3, { color: T.apagado, w: 1, extra: 'stroke-dasharray="4 3"' }), serif(A[0] + 8, (A[1] + sup) / 2 + 4, 'le cabría más', { italic: true, color: T.apagado, size: TXT.min }));
  if (A[0] - R[0] > 16) out.push(flecha(A[0] - 6, A[1], R[0] + 7, R[1], { color: T.magenta, w: 2 }));
  out.push(serif(R[0] + 10, A[1] + 22, 'enfriar sin añadir vapor', { anchor: 'start', weight: 700, color: T.magenta, size: TXT.min }));
  out.push(`<circle cx="${f1(A[0])}" cy="${f1(A[1])}" r="5" fill="${T.tinta}"/>`, etiqueta(Math.min(A[0] + 2, W - 72), A[1] + 46, `aire ${t} °C · HR ${hr} %`));
  out.push(`<circle cx="${f1(R[0])}" cy="${f1(R[1])}" r="6" fill="${T.papel}" stroke="${T.magenta}" stroke-width="2"/>`, linea(R[0], R[1] + 6, R[0], y0, { color: T.magenta, w: 1, extra: 'stroke-dasharray="4 3"' }));
  out.push(etiqueta(Math.max(R[0], 96), R[1] - 20, `punto de rocío ${td} °C`, { color: T.magenta }));
  out.push(filete(284), serif(18, 306, 'Misma cantidad de vapor: al enfriarse, sube la HR.'), serif(18, 324, 'Temperatura cerca del punto de rocío: niebla fácil.', { weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: `El aire a ${t} °C lleva el vapor que satura el aire a ${td} °C: su humedad relativa es del ${hr} %. Si se enfría sin añadir vapor, la HR sube hasta el 100 % al llegar a ${td} °C, su punto de rocío, y empieza a condensarse.` };
}

// ===========================================================================
// Psicrómetro (py-2-5). Cifras de la lección: seco 18 °C y húmedo 15 °C → algo más del 70 % de HR y punto de rocío de
// unos 13 °C (comprobado con la fórmula psicrométrica: e = es(Th) − 0,66 · (T − Th) hPa → HR ≈ 71–73 %, Td ≈ 12,6–13,1 °C).

const CASOS_PSI = { ejemplo: { seco: 18, humedo: 15 }, humedo: { seco: 18, humedo: 17.5 }, seco: { seco: 18, humedo: 11 } };

export function psicrometroC(spec = {}) {
  const caso = spec.caso ?? 'ejemplo';
  const c = CASOS_PSI[caso];
  if (!c) return null;
  const H = 340;
  const alt = `Psicrómetro: dos termómetros iguales a la sombra; el seco marca ${num(c.seco, 1)} °C y el húmedo, con el bulbo envuelto en una muselina mojada que se evapora, ${num(c.humedo, 1)} °C. A la derecha, la diferencia acotada y lo que se lee en las tablas psicrométricas${caso === 'ejemplo' ? ': algo más del 70 % de humedad relativa y un punto de rocío de unos 13 °C' : ''}.`;
  const { out, cierra } = lienzo(W, H, alt);
  const yT = (t) => 236 - t * 6; // 0 °C en 236, 30 °C en 56
  const termo = (x, t, humedo) => {
    const s = [`<rect x="${x - 7}" y="48" width="14" height="196" rx="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>`,
      `<rect x="${x - 2.5}" y="${f1(yT(t))}" width="5" height="${f1(250 - yT(t))}" fill="${T.rojo}"/>`,
      `<circle cx="${x}" cy="252" r="11" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1.2"/>`];
    if (humedo) {
      s.push(`<ellipse cx="${x}" cy="252" rx="15" ry="16" fill="${T.agua}" fill-opacity=".7" stroke="${T.azul}" stroke-width="1.4" stroke-dasharray="3 2"/>`);
      s.push(linea(x, 268, x, 290, { color: T.azul, w: 2.4 }), `<rect x="${x - 18}" y="282" width="36" height="22" rx="3" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1.2"/>`);
      for (const dx of [-24, 24]) s.push(`<path d="M${x + dx},240 q${dx > 0 ? 5 : -5},-6 0,-12 q${dx > 0 ? -5 : 5},-6 0,-12" fill="none" stroke="${T.azul}" stroke-width="1.3"/>`);
    }
    return s.join('');
  };
  const [xs, xh] = [86, 146];
  for (let t = 0; t <= 30; t += 5) {
    out.push(linea(xs - 14, yT(t), xs - 8, yT(t), { w: 1 }));
    if (t % 10 === 0) out.push(mono(xs - 17, yT(t) + 4, `${t}°`, { anchor: 'end' }));
  }
  out.push(termo(xs, c.seco, false), termo(xh, c.humedo, true));
  out.push(rotulo(xs, 38, 'seco', { size: TXT.nota, estilo: 'serif', weight: 700 }), rotulo(xh, 38, 'húmedo', { size: TXT.nota, estilo: 'serif', weight: 700, color: T.azulTxt }));
  out.push(serif(xh + 22, 290, 'muselina', { italic: true, size: TXT.min }), serif(xh + 22, 304, 'mojada', { italic: true, size: TXT.min }));
  // la diferencia entre los dos
  const [y1, y2] = [yT(c.seco), yT(c.humedo)];
  out.push(linea(xs + 7, y1, xh + 24, y1, { w: 0.8, extra: 'stroke-dasharray="3 3"' }), linea(xh + 7, y2, xh + 24, y2, { w: 0.8, extra: 'stroke-dasharray="3 3"' }));
  if (y2 - y1 > 8) out.push(cota(xh + 24, y1, xh + 24, y2, '', { tope: 4, color: T.magenta }));
  else out.push(`<circle cx="${xh + 24}" cy="${f1((y1 + y2) / 2)}" r="3" fill="${T.magenta}"/>`);
  const dif = c.seco - c.humedo;
  const ex = 186;
  out.push(etiqueta(ex + 54, (y1 + y2) / 2, `diferencia ${num(dif, 1)} °C`, { color: T.magenta }));
  if (caso === 'ejemplo') {
    out.push(rotulo(ex, 64, 'EJEMPLO', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.apagado }));
    out.push(serif(ex, 84, 'seco 18 °C'), serif(ex, 102, 'húmedo 15 °C'));
    out.push(serif(ex, 172, 'Con el seco y la diferencia,', { italic: true }), serif(ex, 190, 'a las tablas psicrométricas:', { italic: true }));
    out.push(serif(ex, 212, 'HR: algo más del 70 %', { weight: 700 }), serif(ex, 234, 'punto de rocío:', { weight: 700, color: T.magenta }), serif(ex, 252, 'unos 13 °C', { weight: 700, color: T.magenta }));
    // el punto de rocío en la escala
    out.push(`<path d="M${xs - 8},${yT(13)} l-8,-5 l0,10z" fill="${T.magenta}"/>`, mono(xs - 40, yT(13) + 4, 'Td', { anchor: 'end', color: T.magenta, weight: 700 }));
  } else if (caso === 'humedo') {
    out.push(serif(ex, 70, 'Marcan casi lo mismo', { weight: 700 }), serif(ex, 90, 'poca evaporación: aire', { italic: true }), serif(ex, 108, 'cerca de la saturación', { italic: true }), serif(ex, 150, 'HR alta', { weight: 700, color: T.magenta }));
  } else {
    out.push(serif(ex, 70, 'Mucha diferencia', { weight: 700 }), serif(ex, 90, 'mucha evaporación: el', { italic: true }), serif(ex, 108, 'húmedo se enfría mucho', { italic: true }), serif(ex, 220, 'aire seco: HR baja', { weight: 700, color: T.magenta }));
  }
  out.push(filete(314), serif(18, 332, 'A la sombra y con aire que corra junto al bulbo húmedo.', { italic: true, size: TXT.min }));
  out.push(cierra());
  const CAP = {
    ejemplo: 'El termómetro húmedo marca menos porque el agua de su muselina se evapora y le roba calor. Con el seco (18 °C) y la diferencia (3 °C) se entra en las tablas: algo más de un 70 % de HR y un punto de rocío de unos 13 °C.',
    humedo: 'Si el seco y el húmedo marcan casi lo mismo, apenas hay evaporación en la muselina: el aire está cerca de la saturación y la humedad relativa es alta.',
    seco: 'Cuanto más seco está el aire, más se evapora el agua de la muselina y más diferencia hay entre los dos termómetros: humedad relativa baja.',
  };
  return { svg: out.join(''), caption: CAP[caso] };
}

// ===========================================================================
// Nubes (py-2-6): los diez géneros en sus pisos, con las alturas que usa el examen.

export const GENEROS_C = {
  cirros: { nombre: 'cirros', ab: 'Ci', piso: 'altas' },
  cirrocumulos: { nombre: 'cirrocúmulos', ab: 'Cc', piso: 'altas' },
  cirrostratos: { nombre: 'cirrostratos', ab: 'Cs', piso: 'altas' },
  altocumulos: { nombre: 'altocúmulos', ab: 'Ac', piso: 'medias' },
  altostratos: { nombre: 'altostratos', ab: 'As', piso: 'medias' },
  estratos: { nombre: 'estratos', ab: 'St', piso: 'bajas' },
  estratocumulos: { nombre: 'estratocúmulos', ab: 'Sc', piso: 'bajas' },
  nimbostratos: { nombre: 'nimbostratos', ab: 'Ns', piso: 'bajas' },
  cumulos: { nombre: 'cúmulos', ab: 'Cu', piso: 'vertical' },
  cumulonimbos: { nombre: 'cumulonimbos', ab: 'Cb', piso: 'vertical' },
};
export const PISOS_NUBES = ['altas', 'medias', 'bajas', 'vertical'];

const bolas = (pts) => pts.map(([x, y, r]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}"/>`).join('');
/** Dibujo esquemático de cada género, centrado en (x, y). */
function glifo(k, x, y) {
  const g = (s) => `<g fill="${T.papel}" stroke="${T.tinta}" stroke-width="1">${s}</g>`;
  switch (k) {
    case 'cirros':
      return [[-24, 6, 12, -14, 32, -10], [-18, -4, 14, -14, 30, -14], [-12, 10, 16, -6, 30, 0]].map(([a, b, c1, d1, e1, f2]) => `<path d="M${x + a},${y + b} q${c1},${d1} ${e1},${f2} q4,-1 6,3" fill="none" stroke="${T.tinta}" stroke-width="1.3"/>`).join('');
    case 'cirrocumulos': {
      const p = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) p.push([x - 22 + c * 6 + (r % 2) * 3, y - 6 + r * 6, 2.2]);
      return g(bolas(p));
    }
    case 'cirrostratos':
      return `<ellipse cx="${x}" cy="${y}" rx="32" ry="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="3 2"/><circle cx="${x + 10}" cy="${y}" r="4" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/><circle cx="${x + 10}" cy="${y}" r="12" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="2 2"/>`;
    case 'altocumulos':
      return g(bolas([[x - 22, y - 3, 5], [x - 10, y - 4, 6], [x + 3, y - 3, 5], [x + 16, y - 4, 6], [x - 15, y + 8, 5], [x - 2, y + 7, 6], [x + 11, y + 8, 5], [x + 23, y + 6, 4]]));
    case 'altostratos':
      return `<circle cx="${x + 8}" cy="${y - 1}" r="5" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/><rect x="${x - 32}" y="${y - 8}" width="64" height="16" rx="8" fill="${T.papel}" fill-opacity=".75" stroke="${T.tinta}" stroke-width="1"/>`;
    case 'estratos':
      return `<rect x="${x - 32}" y="${y - 5}" width="64" height="10" rx="5" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1"/>`;
    case 'estratocumulos':
      return g(bolas([[x - 24, y, 7], [x - 10, y - 1, 9], [x + 6, y, 7], [x + 21, y - 1, 8]]));
    case 'nimbostratos':
      return `<rect x="${x - 32}" y="${y - 10}" width="64" height="14" rx="6" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1"/>${[-26, -16, -6, 4, 14, 24].map((dx) => linea(x + dx, y + 8, x + dx - 4, y + 18, { color: T.azul, w: 1.3 })).join('')}`;
    default:
      return '';
  }
}

export function nubesC(spec = {}) {
  const hl = new Set(lista(spec.resaltar));
  for (const k of hl) if (!GENEROS_C[k] && !PISOS_NUBES.includes(k)) return null;
  const fuerte = (k) => hl.has(k) || hl.has(GENEROS_C[k].piso);
  const on = (k) => !hl.size || fuerte(k);
  const op = (ok) => (ok ? '' : ' opacity=".4"');
  const H = 368;
  const alt = `Corte del cielo en tres pisos sobre el mar, con el dibujo de cada género: altas, por encima de unos 6000 m, cirros, cirrocúmulos y cirrostratos; medias, de 2000 a 6000 m, altocúmulos y altostratos; bajas, por debajo de 2000 m, estratos, estratocúmulos y nimbostratos con su lluvia. A la derecha, el desarrollo vertical: un cúmulo y un cumulonimbo que sube desde la base hasta el piso alto con su yunque.${hl.size ? ` Resaltado: ${[...hl].map((k) => GENEROS_C[k]?.nombre ?? k).join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const [top, bh, xc] = [14, 92, 270];
  out.push(`<rect x="5" y="${top + 3 * bh}" width="${W - 10}" height="12" fill="${T.agua}"/>`, linea(5, top + 3 * bh, W - 5, top + 3 * bh, { color: T.lineaAgua, w: 1.4 }));
  const pisos = [['altas', 'ALTAS', 'más de 6000 m'], ['medias', 'MEDIAS', '2000 a 6000 m'], ['bajas', 'BAJAS', 'menos de 2000 m']];
  pisos.forEach(([p, nom, sub], i) => {
    const y = top + i * bh;
    const pon = !hl.size || [...hl].some((k) => k === p || GENEROS_C[k]?.piso === p);
    if (i) out.push(linea(10, y, xc, y, { w: 0.8, extra: 'stroke-dasharray="6 4"' }));
    out.push(`<g${op(pon)}>${rotulo(14, y + 18, nom, { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: hl.has(p) ? T.magenta : T.tinta })}${mono(xc - 6, y + 18, sub, { anchor: 'end', color: hl.has(p) ? T.magenta : T.apagado })}</g>`);
  });
  const pos = [['cirros', 50, 0], ['cirrocumulos', 138, 0], ['cirrostratos', 224, 0], ['altocumulos', 84, 1], ['altostratos', 196, 1], ['estratos', 50, 2], ['estratocumulos', 138, 2], ['nimbostratos', 224, 2]];
  for (const [k, x, fila] of pos) {
    const y = top + fila * bh;
    const G = GENEROS_C[k];
    const col = fuerte(k) ? T.magenta : T.tinta;
    out.push(`<g${op(on(k))}>${glifo(k, x, y + 40)}${fuerte(k) ? `<rect x="${x - 42}" y="${y + 25}" width="84" height="64" fill="none" stroke="${T.magenta}" stroke-width="1.6"/>` : ''}` +
      rotulo(x, y + 70, G.nombre, { size: TXT.min, estilo: 'serif', weight: fuerte(k) ? 700 : 400, color: col }) + mono(x, y + 84, G.ab, { weight: 700, color: col }) + '</g>');
  }
  // desarrollo vertical: cúmulo de base baja y cumulonimbo de la base al piso alto, con yunque
  out.push(linea(xc, top, xc, top + 3 * bh, { w: 0.8 }));
  const vOn = !hl.size || hl.has('vertical') || hl.has('cumulos') || hl.has('cumulonimbos');
  out.push(`<g${op(vOn)}>${rotulo(312, top + 16, 'desarrollo', { size: TXT.min, estilo: 'serif', weight: 700, color: hl.has('vertical') ? T.magenta : T.tinta })}${rotulo(312, top + 30, 'vertical', { size: TXT.min, estilo: 'serif', weight: 700, color: hl.has('vertical') ? T.magenta : T.tinta })}</g>`);
  const yb = top + 3 * bh - 10;
  const cbx = 328;
  const cbCol = fuerte('cumulonimbos') ? T.magenta : T.tinta;
  out.push(`<g${op(on('cumulonimbos'))}><path d="M${cbx - 16},${yb} C${cbx - 22},${yb - 40} ${cbx - 8},${yb - 80} ${cbx - 14},${yb - 120} C${cbx - 18},${yb - 160} ${cbx - 8},${top + 100} ${cbx - 12},${top + 76} L${cbx - 30},${top + 70} L${cbx - 22},${top + 58} L${cbx + 18},${top + 56} L${cbx + 24},${top + 66} L${cbx + 10},${top + 76} C${cbx + 8},${top + 100} ${cbx + 18},${yb - 160} ${cbx + 14},${yb - 120} C${cbx + 10},${yb - 80} ${cbx + 22},${yb - 40} ${cbx + 16},${yb}Z" fill="${T.papel}" stroke="${cbCol}" stroke-width="${fuerte('cumulonimbos') ? 1.8 : 1.1}" stroke-linejoin="round"/>` +
    `<path d="M${cbx + 4},${yb + 2} l-5,7 l5,0 l-5,7" fill="none" stroke="${T.tinta}" stroke-width="1.4"/>` +
    rotulo(289, top + 112, 'Cb', { size: TXT.min, estilo: 'mono', weight: 700, color: cbCol }) + rotulo(289, top + 128, 'cumulo-', { size: TXT.min, estilo: 'serif', color: cbCol, weight: fuerte('cumulonimbos') ? 700 : 400 }) + rotulo(289, top + 142, 'nimbos', { size: TXT.min, estilo: 'serif', color: cbCol, weight: fuerte('cumulonimbos') ? 700 : 400 }) + rotulo(cbx - 3, top + 52, 'yunque', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }) + '</g>');
  const cux = 288;
  const cuCol = fuerte('cumulos') ? T.magenta : T.tinta;
  out.push(`<g${op(on('cumulos'))}><path d="M${cux - 14},${yb} C${cux - 18},${yb - 10} ${cux - 10},${yb - 16} ${cux - 5},${yb - 14} C${cux - 4},${yb - 24} ${cux + 8},${yb - 24} ${cux + 7},${yb - 13} C${cux + 14},${yb - 15} ${cux + 18},${yb - 6} ${cux + 14},${yb}Z" fill="${T.papel}" stroke="${cuCol}" stroke-width="${fuerte('cumulos') ? 1.8 : 1.1}"/>` +
    rotulo(cux, yb - 44, 'Cu', { size: TXT.min, estilo: 'mono', weight: 700, color: cuCol }) + rotulo(cux, yb - 30, 'cúmulos', { size: TXT.min, estilo: 'serif', color: cuCol, weight: fuerte('cumulos') ? 700 : 400 }) + '</g>');
  out.push(serif(14, H - 32, '«Cirro-», alta · «alto-», media · sin prefijo, baja.', { weight: 700, size: TXT.min }), serif(14, H - 14, 'Alturas del examen, aproximadas (latitudes medias).', { italic: true, size: TXT.min, color: T.apagado }));
  out.push(cierra());
  const sel = [...hl].filter((k) => GENEROS_C[k]);
  const desc = { altas: 'nube alta, por encima de unos 6000 m', medias: 'nube media, entre unos 2000 y 6000 m', bajas: 'nube baja, por debajo de unos 2000 m', vertical: 'nube de desarrollo vertical, de base baja y cima muy alta' };
  const caption = sel.length === 1
    ? `${GENEROS_C[sel[0]].nombre[0].toUpperCase()}${GENEROS_C[sel[0]].nombre.slice(1)} (${GENEROS_C[sel[0]].ab}): ${desc[GENEROS_C[sel[0]].piso]}.`
    : 'Diez géneros en cuatro grupos: altas (más de unos 6000 m) Ci, Cc y Cs; medias (2000–6000 m) Ac y As; bajas (menos de 2000 m) St, Sc y Ns; y de desarrollo vertical Cu y Cb. Son las cifras del examen; la OMM usa tres pisos y otros márgenes.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------
// Las nubes de cada piso, en tabla, con cómo se reconocen (py-2-6).

const PISOS_TABLA = [
  ['altas', 'ALTAS', 'más de unos 6000 m · «cirro-»', [['Ci', 'cirros', 'filamentos, «colas de gato»'], ['Cc', 'cirrocúmulos', 'granitos pequeños y redondos'], ['Cs', 'cirrostratos', 'velo transparente con halo']]],
  ['medias', 'MEDIAS', '2000 a 6000 m · «alto-»', [['Ac', 'altocúmulos', 'nubecillas globulares'], ['As', 'altostratos', 'velo gris, sol esmerilado']]],
  ['bajas', 'BAJAS', 'menos de 2000 m · sin prefijo', [['St', 'estratos', 'como niebla sin tocar el suelo'], ['Sc', 'estratocúmulos', 'gris con huecos más claros'], ['Ns', 'nimbostratos', 'lluvia o nieve continua']]],
  ['vertical', 'VERTICAL', 'base baja, cima alta', [['Cu', 'cúmulos', 'base plana, cima en coliflor'], ['Cb', 'cumulonimbos', 'yunque: tormenta, granizo']]],
];

export function nubesPisosC(spec = {}) {
  const hl = new Set(lista(spec.resaltar));
  if ([...hl].some((k) => !PISOS_NUBES.includes(k))) return null;
  const H = 384;
  const alt = `Tabla de las nubes por pisos, cada género con su abreviatura y cómo se reconoce: altas, por encima de unos 6000 m y con el prefijo cirro-; medias, de 2000 a 6000 m y con alto-; bajas, por debajo de 2000 m y sin prefijo; y de desarrollo vertical, cúmulos y cumulonimbos.${hl.size ? ` Resaltado: ${[...hl].join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  let y = 16;
  for (const [k, nom, sub, generos] of PISOS_TABLA) {
    const on = hl.has(k);
    const dim = hl.size && !on ? ' opacity=".4"' : '';
    const alto = 28 + generos.length * 20;
    out.push(`<g${dim}><rect x="12" y="${y}" width="${W - 24}" height="${alto}" fill="${T.papel}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 1.8 : 0.8}"/>`);
    out.push(`<rect x="12" y="${y}" width="${W - 24}" height="24" fill="${T.agua2}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 1.8 : 0.8}"/>`);
    out.push(rotulo(20, y + 17, nom, { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: on ? T.magenta : T.tinta }), serif(W - 20, y + 17, sub, { anchor: 'end', italic: true, size: TXT.min, weight: on ? 700 : 400, color: on ? T.magenta : T.tinta }));
    generos.forEach(([ab, n, d], i) => {
      const yy = y + 42 + i * 20;
      out.push(rotulo(22, yy, ab, { size: TXT.min, estilo: 'mono', weight: 700, anchor: 'start', color: on ? T.magenta : T.tinta }), serif(52, yy, n, { weight: 700, size: TXT.min }), serif(146, yy, d, { italic: true, size: TXT.min }));
    });
    out.push('</g>');
    y += alto + 8;
  }
  out.push(serif(W / 2, y + 14, '«Alto-» es media; Ns, baja; Cu y Cb, verticales.', { anchor: 'middle', weight: 700, size: TXT.min }));
  out.push(cierra());
  const CAP = {
    altas: 'Las altas, por encima de unos 6000 m y de cristales de hielo, empiezan por «cirro-»: cirros, cirrocúmulos y cirrostratos (el del halo).',
    medias: 'Las medias, entre unos 2000 y 6000 m, empiezan por «alto-» aunque suene a alta: altocúmulos y altostratos.',
    bajas: 'Las bajas, por debajo de unos 2000 m, no llevan prefijo: estratos, estratocúmulos y nimbostratos, los de lluvia o nieve continua.',
    vertical: 'Las de desarrollo vertical tienen la base baja y la cima muy alta: cúmulos, de base plana y cima en coliflor, y cumulonimbos, con yunque y tormenta.',
  };
  const sel = [...hl];
  return { svg: out.join(''), caption: sel.length === 1 ? CAP[sel[0]] : 'Altas (cirro-): Ci, Cc y Cs. Medias (alto-): Ac y As. Bajas (sin prefijo): St, Sc y Ns. De desarrollo vertical: Cu y Cb. Son las alturas aproximadas que usa el examen.' };
}

// ===========================================================================
// Olas (py-2-8): partes de una ola; mar de viento y mar de fondo.

export const PARTES_OLA_C = ['cresta', 'seno', 'longitud', 'altura', 'amplitud', 'periodo'];
const ondaPts = (xa, xb, y0, A, L, xc) => { const p = []; for (let x = xa; x <= xb + 0.01; x += 2) p.push([x, y0 - A * Math.cos((2 * Math.PI * (x - xc)) / L)]); return p; };
const trazo = (p) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join('');

function olaPartes(hl) {
  const H = 318;
  const alt = `Perfil de una ola sobre el nivel del mar en calma, a trazos: la cresta arriba y el seno abajo; una cota de cresta a cresta da la longitud de onda; otra, del seno a la cresta, la altura; otra, del nivel en calma a la cresta, la amplitud, la mitad de la altura. Una boya fija marca el punto por el que pasan las crestas para medir el periodo.${hl.size ? ` Resaltado: ${[...hl].join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const [y0, A, L, xc] = [150, 36, 168, 90];
  const pts = ondaPts(8, 272, y0, A, L, xc);
  out.push(`<path d="${trazo(pts)}L272,226L8,226Z" fill="${T.agua}"/>`, `<path d="${trazo(pts)}" fill="none" stroke="${T.tinta}" stroke-width="1.8"/>`);
  out.push(linea(8, y0, W - 8, y0, { color: T.apagado, extra: 'stroke-dasharray="6 4"' }), serif(W - 14, y0 - 6, 'mar en calma', { anchor: 'end', italic: true, size: TXT.min, color: T.apagado, extra: 'dy="-3"' }));
  const col = (k) => (hl.has(k) ? T.magenta : T.tinta);
  const dim = (k) => (hl.size && !hl.has(k) ? ' opacity=".4"' : '');
  const [yc, ys, c2, sx] = [y0 - A, y0 + A, xc + L, xc + L / 2];
  out.push(`<g data-parte="longitud"${dim('longitud')}>${linea(xc, yc - 4, xc, yc - 44, { w: 0.7 })}${linea(c2, yc - 4, c2, yc - 44, { w: 0.7 })}${cota(xc, yc - 36, c2, yc - 36, 'longitud de onda', { color: col('longitud') })}</g>`);
  out.push(`<g data-parte="cresta"${dim('cresta')}><circle cx="${xc}" cy="${yc}" r="4" fill="${col('cresta')}"/>${serif(xc - 10, yc + 4, 'cresta', { anchor: 'end', weight: 700, color: col('cresta') })}</g>`);
  out.push(`<g data-parte="seno"${dim('seno')}><circle cx="${sx}" cy="${ys}" r="4" fill="${col('seno')}"/>${serif(sx, ys + 22, 'seno (valle)', { anchor: 'middle', weight: 700, color: col('seno') })}</g>`);
  const xa = 300;
  out.push(`<g data-parte="altura"${dim('altura')}>${linea(c2 + 4, yc, xa + 6, yc, { w: 0.7, extra: 'stroke-dasharray="2 2"' })}${linea(sx + 6, ys, xa + 6, ys, { w: 0.7, extra: 'stroke-dasharray="2 2"' })}${cota(xa, yc, xa, ys, '', { color: col('altura'), tope: 5 })}${serif(xa + 10, y0 + 22, 'altura', { weight: 700, color: col('altura') })}</g>`);
  out.push(`<g data-parte="amplitud"${dim('amplitud')}>${cota(xc + 20, y0, xc + 20, yc, '', { color: col('amplitud'), tope: 4 })}${serif(xc + 14, y0 + 16, 'amplitud', { anchor: 'end',  weight: 700, color: col('amplitud'), size: TXT.min })}</g>`);
  const bx = 30;
  const by = y0 - A * Math.cos((2 * Math.PI * (bx - xc)) / L);
  out.push(`<g data-parte="periodo"${dim('periodo')}>${linea(bx, by - 20, bx, by, { w: 1.5 })}<path d="M${bx - 7},${f1(by + 2)} L${bx + 7},${f1(by + 2)} L${bx + 4},${f1(by - 7)} L${bx - 4},${f1(by - 7)}Z" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/><circle cx="${bx}" cy="${f1(by - 21)}" r="3" fill="${T.tinta}"/>${serif(bx - 8, by + 34, 'boya fija', { italic: true, size: TXT.min, color: col('periodo') })}</g>`);
  out.push(filete(240));
  out.push(serif(18, 262, 'Altura = del seno a la cresta = 2 × amplitud.', { weight: 700, color: hl.has('altura') || hl.has('amplitud') ? T.magenta : T.tinta }));
  out.push(`<g data-parte="periodo"${dim('periodo')}>${serif(18, 284, 'Periodo (s): tiempo entre dos crestas que pasan', { color: col('periodo') })}${serif(18, 302, 'por un punto fijo, como la boya.', { color: col('periodo') })}</g>`);
  out.push(cierra());
  return out.join('');
}

function olaMarDeFondo() {
  const H = 388;
  const alt = 'Dos cortes del mar. Arriba, la mar de viento: el viento sopla sobre ella en su misma dirección y levanta olas cortas, irregulares y de crestas agudas que rompen en borreguillos. Abajo, la mar de fondo: olas largas, redondeadas y regulares que llegan de un temporal lejano y avanzan en una dirección distinta de la del viento local.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(cartela(112, 32, 'MAR DE VIENTO', 'la levanta el viento que sopla ahí', { ancho: 200 }));
  out.push(flecha(232, 26, 334, 26, { color: T.tinta, w: 1.8 }), flecha(232, 42, 334, 42, { color: T.tinta, w: 1.8 }), serif(283, 64, 'viento', { anchor: 'middle', italic: true, size: TXT.min }));
  const y1 = 112;
  let d = `M10,${y1}`;
  const picos = [];
  for (let x = 10, i = 0; x < W - 20; x += 22, i++) {
    const h = [12, 20, 9, 17, 22, 11, 16, 8, 21, 13, 18, 10, 15, 19, 11][i % 15];
    d += ` Q${x + 13},${y1 - h * 0.55} ${x + 16},${y1 - h} L${x + 22},${y1}`;
    picos.push([x + 16, y1 - h]);
  }
  out.push(`<path d="${d} L${W - 10},${y1 + 18} L10,${y1 + 18}Z" fill="${T.agua}"/><path d="${d}" fill="none" stroke="${T.tinta}" stroke-width="1.5" stroke-linejoin="miter"/>`);
  for (const [x, y] of picos.filter((_, i) => i % 2 === 0)) out.push(`<path d="M${x - 1},${y + 1} l4,3 l-3,1 l4,3" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`);
  out.push(serif(18, 152, 'Crestas agudas que rompen (borreguillos),'), serif(18, 170, 'olas cortas e irregulares, con el viento.'));
  out.push(filete(186));
  out.push(cartela(112, 216, 'MAR DE FONDO', 'viene de un temporal lejano', { ancho: 200 }));
  // el viento local sopla por otro lado
  out.push(flecha(330, 258, 300, 222, { color: T.apagado, w: 1.6 }), serif(292, 248, 'viento local', { anchor: 'end', italic: true, size: TXT.min, color: T.apagado }));
  const y2 = 300;
  const p2 = ondaPts(10, W - 10, y2, 11, 150, 70);
  out.push(`<path d="${trazo(p2)}L${W - 10},${y2 + 22}L10,${y2 + 22}Z" fill="${T.agua}"/><path d="${trazo(p2)}" fill="none" stroke="${T.tinta}" stroke-width="1.8"/>`);
  out.push(flecha(24, 270, 120, 270, { color: T.magenta, w: 1.8 }), serif(24, 262, 'avance de las olas', { italic: true, size: TXT.min, color: T.magenta }));
  out.push(serif(18, 340, 'Olas largas, redondeadas y regulares; su dirección'), serif(18, 358, 'no tiene por qué ser la del viento local.'));
  out.push(serif(18, 378, 'La altura crece con el viento, su persistencia y el fetch.', { weight: 700, size: TXT.min }));
  out.push(cierra());
  return out.join('');
}

export function olaC(spec = {}) {
  const vista = spec.vista ?? 'partes';
  if (vista === 'partes') {
    const hl = new Set(lista(spec.resaltar));
    for (const k of hl) if (!PARTES_OLA_C.includes(k)) return null;
    const CAP = {
      cresta: 'La cresta es la parte más alta de la ola.',
      seno: 'El seno (o valle) es la parte más baja de la ola.',
      longitud: 'Longitud de onda: distancia horizontal entre dos crestas (o dos senos) consecutivos, en metros.',
      altura: 'Altura: distancia vertical del fondo del seno a lo alto de la cresta; vale el doble de la amplitud.',
      amplitud: 'Amplitud: del nivel del mar en calma a la cresta, la mitad de la altura.',
      periodo: 'Periodo: tiempo, en segundos, entre el paso de dos crestas consecutivas por un mismo punto fijo.',
    };
    return { svg: olaPartes(hl), caption: hl.size === 1 ? CAP[[...hl][0]] : 'Longitud de onda: distancia entre dos crestas. Periodo: tiempo entre dos crestas por un punto fijo. Altura: del seno a la cresta, el doble de la amplitud.' };
  }
  if (vista === 'mar-de-fondo') return { svg: olaMarDeFondo(), caption: 'La mar de viento tiene crestas agudas y rotas, es corta e irregular y va con el viento. La mar de fondo llega de un temporal lejano: olas largas, redondeadas y regulares, en una dirección que puede no ser la del viento local.' };
  return null;
}

// ===========================================================================
// Modelos de viento (py-2-3), hemisferio norte, con sus fuerzas a escala:
//   geostrófico: gradiente (G) = Coriolis (C), viento paralelo a isobaras rectas, altas a la derecha;
//   de gradiente: alrededor de una baja, G = C + centrífuga, paralelo a isobaras curvas;
//   con rozamiento (el que la lección llama antitríptico): G + C + R = 0 con el viento girado α hacia la baja;
//   resolviendo, C = G · cos α y R = G · sen α (α = 20°, sobre el mar).

const FILA = 118;
const FUERZA = { grad: ['gradiente', T.rojoTxt], cor: ['Coriolis', T.azulTxt], cen: ['centrífuga', T.verdeTxt], roz: ['rozamiento', T.apagado] };
const fuerzaF = (x, y, dx, dy, k, { anchor = 'start', lx = 6, ly = 4 } = {}) =>
  flecha(x, y, x + dx, y + dy, { color: FUERZA[k][1], w: 1.6 }) + rotulo(x + dx + lx, y + dy + ly, FUERZA[k][0], { size: TXT.min, estilo: 'serif', italic: true, anchor, color: FUERZA[k][1], weight: 700 });
const isobara = (y, v) => linea(12, y, 204, y, { w: 1.1, color: T.apagado }) + mono(204, y - 4, v, { anchor: 'end', color: T.apagado });
const centro = (x, y, t) => rotulo(x, y, t, { size: TXT.nombre, estilo: 'serif', weight: 700 });
const textoFila = (r, titulo, lineas) => rotulo(214, r + 22, titulo, { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'start' }) + lineas.map(([t, o = {}], i) => serif(214, r + 42 + i * 17, t, { size: TXT.min, ...o })).join('');

function filaGeostrofico(r) {
  const o = [isobara(r + 24, '1004'), isobara(r + 96, '1008'), centro(24, r + 16, 'B'), centro(24, r + 114, 'A')];
  const [px, py] = [108, r + 60];
  o.push(flecha(28, py, 196, py, { color: T.magenta, w: 2.4 }), serif(150, py + 18, 'viento', { weight: 700, color: T.magenta }));
  o.push(fuerzaF(px, py - 4, 0, -28, 'grad', { anchor: 'end', lx: -6, ly: 10 }), fuerzaF(px, py + 4, 0, 28, 'cor', { anchor: 'start', lx: 6, ly: -2 }), `<circle cx="${px}" cy="${py}" r="3" fill="${T.tinta}"/>`);
  o.push(textoFila(r, 'Geostrófico', [['gradiente = Coriolis'], ['paralelo a isobaras rectas'], ['altas a su derecha'], ['desde unos 1000 m', { italic: true, color: T.apagado }]]));
  return o.join('');
}

function filaGradiente(r) {
  const [cx, cy, R] = [108, r + 126, 70];
  const arco = (rr) => `<path d="${arcoD(cx, cy, rr, -62, 62)}" fill="none" stroke="${T.apagado}" stroke-width="1.1"/>`;
  const o = [arco(R), arco(R - 34), centro(cx, cy - 18, 'B')];
  // viento antihorario: arriba va hacia el W
  o.push(`<path d="${arcoD(cx, cy, R, -40, 40)}" fill="none" stroke="${T.magenta}" stroke-width="2.4"/>`);
  const [ex, ey] = pol(cx, cy, -42, R);
  o.push(flecha(...pol(cx, cy, -34, R), ex, ey, { color: T.magenta, w: 2.4 }), serif(ex - 6, ey - 4, 'viento', { anchor: 'end', weight: 700, color: T.magenta }));
  const [px, py] = [cx, cy - R];
  o.push(fuerzaF(px, py + 4, 0, 28, 'grad', { anchor: 'start', lx: 6, ly: -2 }), fuerzaF(px - 8, py - 4, 0, -24, 'cor', { anchor: 'end', lx: -2, ly: 4 }), fuerzaF(px + 8, py - 4, 0, -12, 'cen', { anchor: 'start', lx: 4, ly: 2 }), `<circle cx="${px}" cy="${py}" r="3" fill="${T.tinta}"/>`);
  o.push(textoFila(r, 'De gradiente', [['gradiente = Coriolis'], ['+ centrífuga'], ['paralelo a isobaras curvas'], ['teórico: sin rozamiento', { italic: true, color: T.apagado }]]));
  return o.join('');
}

function filaRozamiento(r) {
  const o = [isobara(r + 18, '1004'), isobara(r + 104, '1008'), centro(24, r + 12, 'B'), centro(24, r + 122, 'A')];
  const [px, py] = [112, r + 62];
  const alfa = 20;
  const u = [Math.cos((alfa * Math.PI) / 180), -Math.sin((alfa * Math.PI) / 180)];
  const G = 38;
  o.push(linea(px - 80, py, px + 80, py, { color: T.apagado, w: 0.8, extra: 'stroke-dasharray="3 3"' }));
  o.push(flecha(px - 80 * u[0], py - 80 * u[1], px + 84 * u[0], py + 84 * u[1], { color: T.magenta, w: 2.4 }), serif(px + 30, py + 26, 'viento', { weight: 700, color: T.magenta }));
  o.push(`<path d="${arcoD(px, py, 52, 90 - alfa, 90)}" fill="none" stroke="${T.magenta}" stroke-width="1"/>`, mono(px + 62, py - 6, `${alfa}°`, { anchor: 'start', color: T.magenta, weight: 700 }));
  // fuerzas a escala: C = G cos α a la derecha del viento, R = G sen α contra el viento
  const C = G * Math.cos((alfa * Math.PI) / 180);
  const Rz = G * Math.sin((alfa * Math.PI) / 180);
  o.push(fuerzaF(px, py - 4, 0, -G, 'grad', { anchor: 'end', lx: -6, ly: 10 }));
  o.push(fuerzaF(px + 3 * -u[1], py + 3 * u[0], C * -u[1], C * u[0], 'cor', { anchor: 'end', lx: -8, ly: 0 }));
  const [ox, oy] = [u[1] * 8, -u[0] * 8];
  o.push(fuerzaF(px - 2 * u[0] + ox, py - 2 * u[1] + oy, -Rz * u[0], -Rz * u[1], 'roz', { anchor: 'end', lx: -4, ly: -6 }));
  o.push(`<circle cx="${px}" cy="${py}" r="3" fill="${T.tinta}"/>`);
  o.push(textoFila(r, 'Con rozamiento', [['(antitríptico) corta las'], ['isobaras hacia las bajas'], ['mar: 10–20°'], ['tierra: 30° o más']]));
  return o.join('');
}

const FILAS = { geostrofico: filaGeostrofico, gradiente: filaGradiente, antitriptico: filaRozamiento };
const CAP_VIENTO = {
  geostrofico: 'Geostrófico: la fuerza del gradiente (hacia las bajas) y la de Coriolis (a la derecha del viento en el hemisferio norte) se equilibran y el viento sopla paralelo a isobaras rectas, con las altas a su derecha.',
  gradiente: 'De gradiente: con isobaras curvas entra la fuerza centrífuga; el gradiente equilibra a Coriolis más la centrífuga y el viento sopla paralelo a las isobaras curvas. Es teórico, sin rozamiento.',
  antitriptico: 'Con rozamiento el viento se frena, deja de ser paralelo y corta las isobaras hacia las bajas presiones: unos 10–20° sobre el mar y 30° o más sobre tierra.',
};
const ALT_FILA = {
  geostrofico: 'geostrófico: entre dos isobaras rectas, el viento paralelo a ellas con la baja a su izquierda; la fuerza del gradiente hacia la baja y la de Coriolis hacia la alta, iguales',
  gradiente: 'de gradiente: alrededor de una baja, el viento sigue las isobaras curvas en sentido antihorario; el gradiente hacia el centro equilibra a Coriolis y a la centrífuga, hacia fuera',
  antitriptico: 'con rozamiento: el viento corta las isobaras 20° hacia la baja; el gradiente, Coriolis a su derecha y el rozamiento contra él se equilibran',
};

export function modelosVientoC(spec = {}) {
  const modelo = spec.modelo ?? 'todos';
  const ids = modelo === 'todos' ? Object.keys(FILAS) : FILAS[modelo] ? [modelo] : null;
  if (!ids) return null;
  const H = 12 + ids.length * FILA + 30;
  const alt = `Modelos de viento en el hemisferio norte, con sus fuerzas dibujadas y rotuladas: ${ids.map((k) => ALT_FILA[k]).join('; ')}.`;
  const { out, cierra } = lienzo(W, H, alt);
  let r = 8;
  ids.forEach((k, i) => {
    if (i) out.push(filete(r));
    out.push(FILAS[k](r));
    r += FILA;
  });
  out.push(serif(W / 2, H - 14, 'Hemisferio norte. Flecha magenta: el viento.', { anchor: 'middle', italic: true, size: TXT.min, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: ids.length === 1 ? CAP_VIENTO[ids[0]] : 'Geostrófico: gradiente y Coriolis se equilibran y el viento va paralelo a isobaras rectas, con las altas a su derecha (HN). De gradiente: se suma la centrífuga y va paralelo a isobaras curvas. Con rozamiento (antitríptico): se frena y corta las isobaras hacia las bajas.' };
}

