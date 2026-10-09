// Láminas de cálculo del PER rehechas en estilo C en la tanda de cierre (docs/ESTILO-LAMINAS.md): actualizar la
// declinación (per-10-5), rumbo circular y cuadrantal (per-10-6), demora y marcación (per-11-5) y calidad del corte
// (per-11-6). Mismos tipos, parámetros, `resaltar` y pies; las cifras salen de la cuenta, no de un dibujo fijo. Sin DOM.

import { T, TXT, lienzo, etiqueta, cotaArco, arcoD, flecha, barco, f1 } from './estilo-c.js';
import { W, serif, mono, linea, panelNotas, punto, deg3, partes, pol } from './kit-lecciones-c.js';

const norm = (a) => ((a % 360) + 360) % 360;

// ===========================================================================
// Actualizar la declinación (per-10-5). spec: { dm: minutos con signo (E +, W −), anio, variacion: minutos/año, actual }

/** «2° 30′ W» a partir de minutos con signo. */
export const gm = (min, conLetra = true) => {
  const a = Math.abs(Math.round(min));
  const g = Math.floor(a / 60);
  const mm = a % 60;
  const t = !g && mm ? `${mm}′` : mm ? `${g}° ${String(mm).padStart(2, '0')}′` : `${g}°`;
  if (!conLetra) return t;
  return min === 0 ? '0°' : `${t} ${min > 0 ? 'E' : 'W'}`;
};
const conSigno = (min) => (min === 0 ? '0°' : `${min > 0 ? '+' : '−'}${gm(min, false)}`);

/** La cuenta de la declinación: { n, cambio, dm2 } o null si la spec no vale. */
export function cuentaDeclinacion(spec = {}) {
  const dm = spec.dm ?? -150;
  const anio = spec.anio ?? 2016;
  const va = spec.variacion ?? 9;
  const actual = spec.actual ?? 2026;
  if (![dm, anio, va, actual].every(Number.isInteger) || actual < anio || Math.abs(dm) > 1800 || Math.abs(va) > 60) return null;
  const n = actual - anio;
  return { dm, anio, va, actual, n, cambio: n * va, dm2: dm + n * va };
}

export function declinacionC(spec = {}) {
  const c = cuentaDeclinacion(spec);
  if (!c) return null;
  const { dm, anio, va, actual, n, cambio, dm2 } = c;
  const H = 400;
  const alt = `Rosa de la carta con la declinación ${gm(dm)} en ${anio} y su variación anual ${va === 0 ? '0′' : gm(va)}; a la derecha, el norte verdadero y el norte magnético de ${anio} y de ${actual} (ángulos exagerados). Debajo, la cuenta: ${n} años por ${Math.abs(va)}′ son ${gm(cambio)}, y la declinación en ${actual} es ${gm(dm2)}.`;
  const { out, cierra } = lienzo(W, H, alt);
  // Rosa de la carta con su leyenda.
  const [rx, ry] = [84, 110];
  out.push(`<circle cx="${rx}" cy="${ry}" r="62" fill="none" stroke="${T.tinta}" stroke-width="1.2"/><circle cx="${rx}" cy="${ry}" r="52" fill="none" stroke="${T.tinta}" stroke-width=".6"/>`);
  for (let a = 0; a < 360; a += 10) { const [x1, y1] = pol(rx, ry, a, 52); const [x2, y2] = pol(rx, ry, a, a % 90 ? 57 : 62); out.push(linea(x1, y1, x2, y2, { w: 0.8 })); }
  out.push(mono(rx, ry - 12, gm(dm), { weight: 700, size: TXT.min + 0.5 }), mono(rx, ry + 6, String(anio), { weight: 700, size: TXT.min + 0.5 }), mono(rx, ry + 24, `(${gm(va)} anual)`, { size: TXT.min }));
  out.push(serif(rx, 196, 'rosa de la carta', { anchor: 'middle', size: TXT.min, italic: true }));
  // Nortes (ángulos exagerados).
  const [ox, oy, R] = [262, 196, 150];
  const maxG = Math.max(Math.abs(dm), Math.abs(dm2), 1) / 60;
  const k = Math.min(12, 30 / maxG);
  const a1 = (dm / 60) * k;
  const a2 = (dm2 / 60) * k;
  const tNv = pol(ox, oy, 0, R);
  out.push(flecha(ox, oy, ...tNv, { color: T.tinta, w: 1.6 }), serif(tNv[0], tNv[1] - 6 < 18 ? 18 : tNv[1] - 6, 'Nv', { anchor: 'middle', weight: 700 }));
  const t1 = pol(ox, oy, a1, R * 0.86);
  const t2 = pol(ox, oy, a2, R * 0.86);
  if (cambio !== 0) out.push(flecha(ox, oy, ...t1, { color: T.apagado, w: 1.2, discontinua: true }));
  out.push(flecha(ox, oy, ...t2, { color: T.magenta, w: 2.2 }));
  const lado = (a) => (a < 0 ? 'end' : 'start');
  const dx = (a) => (a < 0 ? -6 : 6);
  const [la, lb] = Math.abs(a1) >= Math.abs(a2) ? [t1, t2] : [t2, t1];
  const yA = la[1] + 16;
  const yB = Math.min(lb[1] + 4, yA - 20);
  const yOf = (t) => (t === la ? yA : yB);
  if (cambio !== 0) out.push(serif(t1[0] + dx(a1), yOf(t1), `Nm ${anio}`, { anchor: lado(a1), size: TXT.min, color: T.apagado }));
  out.push(serif(t2[0] + dx(a2), yOf(t2), `Nm ${actual}`, { anchor: lado(a2), weight: 700, color: T.magenta }));
  if (Math.abs(a2 - a1) > 3) out.push(`<path d="${arcoD(ox, oy, 70, Math.min(a1, a2), Math.max(a1, a2))}" fill="none" stroke="${T.naranja}" stroke-width="2"/>`);
  out.push(punto(ox, oy, { r: 2.5 }), serif(ox, oy + 18, 'ángulos exagerados', { anchor: 'middle', size: TXT.min, italic: true, color: T.apagado }));
  // La cuenta.
  out.push(panelNotas(222, H));
  const vaT = va === 0 ? '0′' : `${Math.abs(va)}′ ${va > 0 ? 'E' : 'W'}`;
  const pasos = [
    [`Años: ${actual} − ${anio} = ${n}`, false],
    [`${n} × ${vaT} = ${Math.abs(cambio)}′ = ${gm(cambio)} (${cambio >= 0 ? '+' : '−'})`, false],
    [`${conSigno(dm)} ${cambio < 0 ? '−' : '+'} ${gm(cambio, false)} = ${conSigno(dm2)} → ${gm(dm2)}`, true],
  ];
  pasos.forEach(([t, fin], i) => out.push(mono(18, 248 + i * 24, String(i + 1), { weight: 700, color: T.naranja }), mono(34, 248 + i * 24, t, { anchor: 'start', weight: fin ? 700 : 400, color: fin ? T.magenta : T.tinta })));
  const mismo = dm !== 0 && va !== 0 && Math.sign(dm) === Math.sign(va);
  out.push(serif(16, 330, 'E positiva (+), W negativa (−).', { size: TXT.min, weight: 700 }));
  const regla = va === 0 || dm === 0 ? ['La variación se suma a la dm con su signo.'] : mismo ? ['Variación del mismo signo que la dm: crece.'] : ['Variación de signo contrario a la dm:', 'se hace más pequeña.'];
  regla.forEach((t, i) => out.push(serif(16, 350 + i * 18, t, { size: TXT.min })));
  out.push(cierra());
  const caption = `La carta da ${gm(dm)} en ${anio} con variación anual ${va === 0 ? '0′' : gm(va)}. En ${actual}: ${n} años × ${Math.abs(va)}′ = ${gm(cambio)}, y ${conSigno(dm)} ${cambio < 0 ? '−' : '+'} ${gm(cambio, false)} = ${gm(dm2)}. Se suma siempre con su signo: E positivo, W negativo.`;
  return { svg: out.join(''), caption };
}

// ===========================================================================
// Rumbo circular y cuadrantal (per-10-6). spec: { rumbo?: 'N64W' (cuadrantal, 0–90) }

/** 'S45W' → { ns, x, ew, circ } o null. */
export function cuadrantalACircular(s) {
  const r = /^([NS])\s*(\d{1,2})\s*([EW])$/.exec(String(s ?? '').toUpperCase().replace(/°/g, ''));
  if (!r) return null;
  const x = Number(r[2]);
  if (x > 90) return null;
  const [ns, ew] = [r[1], r[3]];
  const circ = ns === 'N' ? (ew === 'E' ? x : 360 - x) : ew === 'E' ? 180 - x : 180 + x;
  return { ns, x, ew, circ: norm(circ) };
}

const CUADRANTES = {
  NE: { f: ['N x E =', 'x'], r: '000°–090°' },
  SE: { f: ['S x E =', '180° − x'], r: '090°–180°' },
  SW: { f: ['S x W =', '180° + x'], r: '180°–270°' },
  NW: { f: ['N x W =', '360° − x'], r: '270°–360°' },
};

export function rumboCuadrantalC(spec = {}) {
  const q = cuadrantalACircular(spec.rumbo ?? 'N64W');
  if (!q) return null;
  const key = q.ns + q.ew;
  const nom = `${q.ns}${q.x}${q.ew}`;
  const op = { NE: '', SE: `180° − ${q.x}° = `, SW: `180° + ${q.x}° = `, NW: `360° − ${q.x}° = ` }[key];
  const H = 400;
  const alt = `Rosa con los cuatro cuadrantes y su fórmula: N x E = x; S x E = 180° − x; S x W = 180° + x; N x W = 360° − x. Sombreado, el cuadrante del ejemplo ${nom}: desde el ${q.ns}, ${q.x}° hacia el ${q.ew}, que en circular es ${deg3(q.circ)}.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, R] = [179, 160, 84];
  const a0 = { NE: 0, SE: 90, SW: 180, NW: 270 }[key];
  out.push(`<path d="M${cx},${cy} L${pol(cx, cy, a0, R).map(f1).join(',')} ${arcoD(cx, cy, R, a0, a0 + 90).replace(/^M[^A]*/, '')} Z" fill="${T.agua}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${T.tinta}" stroke-width="1.3"/>`);
  for (let a = 0; a < 360; a += 10) { const [x1, y1] = pol(cx, cy, a, R); const [x2, y2] = pol(cx, cy, a, a % 90 ? R - 4 : R - 9); out.push(linea(x1, y1, x2, y2, { w: 0.9 })); }
  out.push(linea(cx, cy - R, cx, cy + R, { w: 0.6, color: T.apagado }), linea(cx - R, cy, cx + R, cy, { w: 0.6, color: T.apagado }));
  out.push(mono(cx, cy - R - 8, 'N 000°', { weight: 700 }), mono(cx, cy + R + 18, 'S 180°', { weight: 700 }));
  out.push(mono(cx + R + 6, cy - 4, 'E', { anchor: 'start', weight: 700 }), mono(cx + R + 6, cy + 12, '090°', { anchor: 'start' }), mono(cx - R - 6, cy - 4, 'W', { anchor: 'end', weight: 700 }), mono(cx - R - 6, cy + 12, '270°', { anchor: 'end' }));
  const esq = { NW: [14, 30, 'start'], NE: [W - 14, 30, 'end'], SW: [14, 252, 'start'], SE: [W - 14, 252, 'end'] };
  for (const [k, [x, y, a]] of Object.entries(esq)) {
    const on = k === key;
    out.push(mono(x, y, CUADRANTES[k].f[0], { anchor: a, weight: 700, color: on ? T.magenta : T.tinta }), mono(x, y + 16, CUADRANTES[k].f[1], { anchor: a, weight: on ? 700 : 400, color: on ? T.magenta : T.tinta }), mono(x, y + 32, CUADRANTES[k].r, { anchor: a, color: T.apagado }));
  }
  const ref = q.ns === 'N' ? 0 : 180;
  const hacia = (q.ns === 'N') === (q.ew === 'E') ? 1 : -1;
  const fin = ref + hacia * q.x;
  out.push(flecha(cx, cy, ...pol(cx, cy, q.circ, R - 2), { color: T.azul, w: 2.4 }));
  if (q.x > 0) out.push(cotaArco(cx, cy, 40, Math.min(ref, fin), Math.max(ref, fin), `${q.x}°`, { color: T.magenta, rEt: q.x < 30 ? 58 : 40 }));
  out.push(punto(cx, cy, { r: 2.5 }));
  out.push(panelNotas(290, H));
  out.push(serif(16, 314, `${nom}: desde el ${q.ns}, ${q.x}° hacia el ${q.ew}`, { weight: 700 }), mono(16, 340, `${op}${deg3(q.circ)}`, { anchor: 'start', weight: 700, color: T.azulTxt, size: TXT.nota }));
  out.push(mono(16, 366, 'S65E = 115°   S45W = 225°', { anchor: 'start', color: T.apagado }), mono(16, 384, 'N64W = 296°   N20E = 020°', { anchor: 'start', color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: `El cuadrantal se cuenta de 0° a 90° desde el N o el S hacia el E o el W. ${nom} está en el cuadrante ${CUADRANTES[key].r}: ${op}${deg3(q.circ)}.` };
}

// ===========================================================================
// Demora y marcación (per-11-5). spec: { rumbo: Rv 0–359, marcacion: −180..180 (estribor +, babor −), resaltar? }

export function demoraMarcacionC(spec = {}) {
  const rv = spec.rumbo ?? 70;
  const mc = spec.marcacion ?? -100;
  if (!Number.isFinite(rv) || !Number.isFinite(mc) || rv < 0 || rv >= 360 || Math.abs(mc) > 180 || mc === 0) return null;
  const m = partes(spec, ['demora', 'marcacion']);
  if (!m) return null;
  const dvBruto = rv + mc;
  const dv = norm(dvBruto);
  const lado = mc > 0 ? 'estribor' : 'babor';
  const H = 400;
  const alt = `Barco al rumbo verdadero ${deg3(rv)} con un faro ${Math.abs(mc)}° por ${lado}: la demora verdadera, contada desde el norte, es ${deg3(dv)}; la marcación, contada desde la proa, ${Math.abs(mc)}° por ${lado}.`;
  const { out, cierra } = lienzo(W, H, alt);
  const [cx, cy, R] = [179, 170, 100];
  const dist = (a, b) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${T.apagado}" stroke-width=".6" stroke-dasharray="2 4"/>`);
  out.push(flecha(cx, cy, cx, cy - R - 22, { color: T.tinta, w: 1.4 }), serif(cx, cy - R - 28, 'N', { anchor: 'middle', weight: 700 }));
  const proa = pol(cx, cy, rv, R - 4);
  out.push(linea(cx, cy, ...proa, { w: 1.1, extra: 'stroke-dasharray="5 3"' }));
  const F = pol(cx, cy, dv, R);
  out.push(linea(cx, cy, ...F, { color: T.tinta, w: 1.4 }), `<circle cx="${f1(F[0])}" cy="${f1(F[1])}" r="7" fill="${T.amarillo}" stroke="${T.tinta}"/>`);
  out.push(barco(cx, cy, rv, 54, { p: null }));
  const fuera = (ang, r, t, o = {}) => {
    const [x, y] = pol(cx, cy, ang, r);
    const sn = Math.sin((ang * Math.PI) / 180);
    const cs = Math.cos((ang * Math.PI) / 180);
    return serif(x, y + (cs < -0.4 ? 13 : cs > 0.4 ? -2 : 5), t, { ...o, anchor: sn > 0.3 ? 'start' : sn < -0.3 ? 'end' : 'middle' });
  };
  if (dist(rv, dv) > 12) out.push(fuera(rv, R + 2, 'proa', { size: TXT.min, italic: true }));
  out.push(fuera(dv, R + 12, 'faro', { size: TXT.min, weight: 700 }));
  const libre = (mid, evitar) => {
    const nota = (a) => Math.min(...evitar.map((e) => dist(a, e))) - Math.abs(a - mid) * 0.5;
    return [0, -15, 15, -30, 30, -45, 45, -60, 60].map((d) => mid + d).reduce((best, a) => (nota(a) > nota(best) ? a : best));
  };
  const lin = [0, rv, dv];
  const [rD, rM] = [46, 72];
  const aD = libre(dv / 2, lin);
  const [ma, mb] = mc > 0 ? [rv, rv + mc] : [rv + mc, rv];
  const aM = libre(rv + mc / 2, [...lin, aD]);
  out.push(`${m.g('demora')}<path d="${arcoD(cx, cy, rD, 0, Math.max(dv, 4))}" fill="none" stroke="${T.azul}" stroke-width="${m.w('demora', 1.8, 3)}"/>${etiqueta(...pol(cx, cy, aD, rD + 2), `Dv ${deg3(dv)}`, { color: T.azulTxt })}</g>`);
  out.push(`${m.g('marcacion')}<path d="${arcoD(cx, cy, rM, ma, mb)}" fill="none" stroke="${T.magenta}" stroke-width="${m.w('marcacion', 1.8, 3)}"/>${etiqueta(...pol(cx, cy, aM, rM + 4), `M ${Math.abs(mc)}° ${mc > 0 ? 'Er' : 'Br'}`, { color: T.magenta })}</g>`);
  out.push(panelNotas(300, H));
  out.push(`${m.g('demora')}${serif(16, 322, 'Demora:', { weight: 700, color: T.azulTxt })}${serif(82, 322, 'desde el norte, de 000° a 359°', { size: TXT.min })}</g>`);
  out.push(`${m.g('marcacion')}${serif(16, 342, 'Marcación:', { weight: 700, color: T.magenta })}${serif(100, 342, 'desde la proa, 0–180° Er o Br', { size: TXT.min })}</g>`);
  const cuenta = `Dv = Rv + M = ${deg3(rv)} ${mc > 0 ? '+' : '−'} ${Math.abs(mc)}° = ${dvBruto < 0 || dvBruto >= 360 ? `${String(dvBruto).replace('-', '−')}° → ` : ''}${deg3(dv)}`;
  out.push(mono(16, 370, cuenta, { anchor: 'start', weight: 700 }), serif(16, 388, 'Estribor, +; babor, −.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  const caption = `Navegando al Rv ${deg3(rv)} con el faro ${Math.abs(mc)}° por ${lado}: la demora se cuenta desde el norte y la marcación desde la proa. Dv = Rv + M (estribor +, babor −) = ${deg3(dv)}${dvBruto < 0 ? ', sumando 360° porque sale negativa' : dvBruto >= 360 ? ', restando 360° porque pasa de 360°' : ''}.`;
  return { svg: out.join(''), caption };
}

// ===========================================================================
// Calidad del corte (per-11-6). spec: { angulo?: ángulo agudo del caso malo (10–45, por defecto 20), resaltar?: 'buena'|'mala' }

/** Rombo donde se cortan dos bandas de anchura ±e alrededor de rectas por (cx, cy) con rumbos a y b. */
export function rombo(cx, cy, a, b, e) {
  const n = (t) => [Math.cos((t * Math.PI) / 180), Math.sin((t * Math.PI) / 180)];
  const [a1, a2] = n(a);
  const [b1, b2] = n(b);
  const det = a1 * b2 - a2 * b1;
  return [[e, e], [e, -e], [-e, -e], [-e, e]].map(([p, q]) => [cx + (p * b2 - q * a2) / det, cy + (a1 * q - b1 * p) / det]);
}

export function calidadCorteC(spec = {}) {
  const ang = spec.angulo ?? 20;
  if (!Number.isFinite(ang) || ang < 10 || ang > 45) return null;
  const m = partes(spec, ['buena', 'mala']);
  if (!m) return null;
  const H = 330;
  const e = 6;
  const L = e / Math.sin(((ang / 2) * Math.PI) / 180);
  const alt = `Dos cortes de dos líneas de posición con el mismo error al trazar (líneas a trazos a cada lado): a 90°, la zona donde puede estar el barco es un rombo pequeño; con un corte de ${ang}°, un rombo alargado unas ${Math.round(L / (e * Math.SQRT2))} veces más largo (1 / (√2 · sen ${ang / 2}°)).`;
  const { out, cierra } = lienzo(W, H, alt);
  const panel = (x0, rumbos, nom, color) => {
    const cx = x0 + 84;
    const cy = 120;
    out.push(`${m.g(nom)}<rect x="${x0 + 4}" y="16" width="160" height="200" fill="none" stroke="${m.on(nom) ? T.magenta : T.apagado}" stroke-width="${m.on(nom) ? 2.2 : 0.8}"/>`);
    out.push(`<polygon points="${rombo(cx, cy, rumbos[0], rumbos[1], e).map((p) => p.map(f1).join(',')).join(' ')}" fill="${color}" fill-opacity=".35" stroke="${color}"/>`);
    for (const r of rumbos) {
      const [x1, y1] = pol(cx, cy, r, 76);
      const [x2, y2] = pol(cx, cy, r + 180, 76);
      out.push(linea(x1, y1, x2, y2, { w: 1.4 }));
      for (const sg of [-1, 1]) { const [ox, oy] = pol(0, 0, r + 90, e * sg); out.push(linea(x1 + ox, y1 + oy, x2 + ox, y2 + oy, { w: 0.8, color: T.apagado, extra: 'stroke-dasharray="3 3"' })); }
      const [fx1, fy1] = r < 180 ? [x2, y2] : [x1, y1];
      out.push(`<circle cx="${f1(fx1)}" cy="${f1(fy1)}" r="5" fill="${T.amarillo}" stroke="${T.tinta}"/>`);
    }
    return [cx, cy];
  };
  const [bx, by] = panel(8, [135, 225], 'buena', T.verdeTxt);
  out.push(cotaArco(bx, by, 26, 135, 225, '90°', { color: T.verdeTxt, rEt: 46 }), '</g>');
  const [mx, my] = panel(182, [270 - ang / 2, 270 + ang / 2], 'mala', T.magenta);
  out.push(cotaArco(mx, my, 56, 270 - ang / 2, 270 + ang / 2, '', { color: T.magenta }), etiqueta(mx - 52, my + 30, `${ang}°`, { color: T.magenta }));
  out.push(linea(mx - L, my + 16, mx + L, my + 16, { color: T.magenta, w: 1.2 }), linea(mx - L, my + 11, mx - L, my + 21, { color: T.magenta, w: 1.2 }), linea(mx + L, my + 11, mx + L, my + 21, { color: T.magenta, w: 1.2 }), '</g>');
  out.push(`${m.g('buena')}${serif(92, 238, 'BUENA', { anchor: 'middle', weight: 700, color: T.verdeTxt })}${serif(92, 256, 'corte cerca de 90°', { anchor: 'middle', size: TXT.min })}</g>`);
  out.push(`${m.g('mala')}${serif(266, 238, 'MALA', { anchor: 'middle', weight: 700, color: T.magenta })}${serif(266, 256, `corte muy agudo (${ang}°)`, { anchor: 'middle', size: TXT.min })}</g>`);
  out.push(panelNotas(270, H), serif(16, 292, 'Sombreado: dónde puede estar el barco con el', { size: TXT.min }), serif(16, 310, 'mismo error pequeño (a trazos) al trazar.', { size: TXT.min }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'La situación es más fiable cuanto más se acerque a 90° el ángulo entre las dos líneas. Con líneas casi paralelas, un error pequeño al trazar mueve mucho el corte.' };
}
