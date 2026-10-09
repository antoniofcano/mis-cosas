// Dibujo común de abatimiento y corriente: la cadena rumbo verdadero → rumbo de superficie → rumbo efectivo,
// en planta (norte arriba) y siempre con los mismos colores: proa azul, superficie naranja, corriente violeta,
// efectivo rojo.
import { encaja, vec, suma, pad3, num } from './kit.js';
import { T, TXT, lienzo, rotulo, cotaArco, flecha, rosaNorte, barco, arcoD, junto, colocaEtiquetas, cascoPlanta, f1, pol, parte } from '../estilo-c.js';
import { el, tramo } from '../animaciones/pista.js';

// Estilo C (docs/ESTILO-LAMINAS.md), como se traza en la carta: el rumbo de superficie con una punta, el efectivo con
// dos (en magenta: es la línea que se dibuja en la carta) y la corriente con tres; la proa (Rv), a trazos con el barco.
// El abatimiento va acotado con su arco entre el Rv y el Rs.
const W = 358;
const H = 320;

/** Vector con `n` puntas (1, 2 o 3) junto a su extremo. */
function vector(a, b, color, w, n, p) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const L = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / L, dy / L];
  const out = [flecha(a[0], a[1], b[0], b[1], { color, w })];
  for (let i = 1; i < n; i++) {
    const [cx, cy] = [b[0] - ux * (10 + 7 * i), b[1] - uy * (10 + 7 * i)];
    out.push(`<polyline points="${f1(cx - uy * 5 - ux * 6)},${f1(cy + ux * 5 - uy * 6)} ${f1(cx)},${f1(cy)} ${f1(cx + uy * 5 - ux * 6)},${f1(cy - ux * 5 - uy * 6)}" fill="none" stroke="${color}" stroke-width="1.4"/>`);
  }
  return `<g${parte(p)}>${out.join('')}</g>`;
}

/** Puntos de la cadena en nudos (una hora de navegación) y su encaje en el dibujo. */
export function geometria(c) {
  const O = [0, 0];
  let S; // extremo del vector superficie
  let E; // extremo del efectivo
  let Cc = null; // extremo de la corriente cuando se dibuja primero (inversa)
  if (c.inversa) {
    Cc = vec(c.rc, c.ic);
    E = vec(c.ref, c.vef);
    S = E;
  } else {
    S = vec(c.rs, c.vb);
    E = suma(S, vec(c.rc, c.ic));
  }
  const destino = c.inversa ? vec(c.ref, c.vef * 1.25) : null;
  const proa = vec(c.rv, c.vb * 0.6);
  const pts = [O, S, E, proa, ...(Cc ? [Cc] : []), ...(destino ? [destino] : [])];
  // lo que el agua lleva al barco en una hora (la corriente) y lo que avanza él sobre el agua (el resto)
  const agua = vec(c.rc, c.ic);
  return { O, S, E, Cc, destino, proa, pts, agua, P: encaja(pts, 60, 60, W - 120, H - 126) };
}

// ---------------------------------------------------------------------------
// Animación (src/ui/animacion.js): una hora de navegación. El barco avanza a velocidad constante con la proa a su Rv;
// el «fantasma» es donde estaría solo con su avance sobre el agua (sin corriente) y la línea azul, lo que el agua lo
// ha arrastrado: en cada instante el barco está en t·(superficie + corriente), así que el triángulo crece sin
// deformarse. Al final aparece la construcción de la carta (la imagen fija).
export const DUR_CADENA = 10;
const T_SALE = 0.8;
const T_HORA = 7.8;
export const T_CARTA = 8.4;
/** Fracción de la hora navegada en el instante t. */
export const horaNavegada = (t) => Math.min(1, Math.max(0, (t - T_SALE) / (T_HORA - T_SALE)));
export const HITOS_CADENA = { sale: T_SALE, media: (T_SALE + T_HORA) / 2, hora: T_HORA, carta: T_CARTA };

export function cambiosCadena(c, t) {
  const { P, E, agua, O } = geometria(c);
  const o = P(O);
  const k = horaNavegada(t);
  const e = P(E);
  const g = P([E[0] - agua[0], E[1] - agua[1]]);
  const b = [o[0] + (e[0] - o[0]) * k, o[1] + (e[1] - o[1]) * k];
  const f = [o[0] + (g[0] - o[0]) * k, o[1] + (g[1] - o[1]) * k];
  const [px, py] = pol(b[0], b[1], c.rv, 34);
  const carta = tramo(t, T_CARTA, T_CARTA + 0.6);
  const min = Math.round(k * 60);
  return {
    fin: { opacity: f1(carta) },
    mov: { opacity: f1(1 - carta) },
    'a-ef': { x2: f1(b[0]), y2: f1(b[1]) },
    'a-sup': { x2: f1(f[0]), y2: f1(f[1]) },
    'a-corr': { x1: f1(f[0]), y1: f1(f[1]), x2: f1(b[0]), y2: f1(b[1]) },
    'a-fantasma': { transform: `translate(${f1(f[0])} ${f1(f[1])}) rotate(${f1(c.rv)})` },
    'a-barco': { transform: `translate(${f1(b[0])} ${f1(b[1])}) rotate(${f1(c.rv)})` },
    'a-proa': { x1: f1(b[0]), y1: f1(b[1]), x2: f1(px), y2: f1(py) },
    'a-hora': { texto: min >= 60 ? '1 h navegada' : `${min} min navegados` },
  };
}

/** Lo que se mueve en la animación: estela sobre el fondo, avance sobre el agua, arrastre, fantasma y barco. */
function capaMovil(c, cc) {
  const hull = (L, extra) => `<path d="${cascoPlanta(L, L * 0.34)}" ${extra}/>`;
  const conC = !!c.ic;
  const { P, O } = geometria(c);
  const [ox, oy] = P(O).map(f1);
  return el('mov', 'g', {}, cc,
    (conC ? el('a-sup', 'line', { x1: ox, y1: oy, stroke: T.tinta, 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, cc) : '') +
    el('a-ef', 'line', { x1: ox, y1: oy, stroke: T.magenta, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, cc) +
    (conC ? el('a-corr', 'line', { stroke: T.azulTxt, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, cc) : '') +
    (conC ? el('a-fantasma', 'g', {}, cc, hull(30, `fill="none" stroke="${T.apagado}" stroke-width="1.2" stroke-dasharray="3 3"`)) : '') +
    el('a-proa', 'line', { stroke: T.tinta, 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }, cc) +
    el('a-barco', 'g', {}, cc, hull(30, `fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"`)) +
    el('a-hora', 'text', { x: W - 14, y: H - 14, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'end', fill: T.tinta, class: 'lc-mono' }, cc));
}

/**
 * @param {object} c  { rv, rs, ref, vef, vb, rc, ic, ab, inversa }
 * @param {{ ocultar?: string[], viento?: 'babor'|'estribor'|null, t?: number }} o  partes que no se enseñan todavía;
 *   t: instante de la animación (sin él, la imagen fija: la construcción de la carta)
 */
export function dibujaCadena(c, { ocultar = [], viento = null, t = null } = {}) {
  const ve = (p) => !ocultar.includes(p);
  const { O, S, E, Cc, destino, proa, pts, P } = geometria(c);
  const o = P(O);
  const px = pts.map(P);
  const centro = [px.reduce((a, q) => a + q[0], 0) / px.length, px.reduce((a, q) => a + q[1], 0) / px.length];
  const corr = c.ic ? `corriente hacia el ${pad3(c.rc)}° a ${num(c.ic)} nudos` : 'sin corriente';
  const alt = c.inversa
    ? `Rumbo a dar con corriente, como se traza en la carta: desde la salida, la corriente (${corr}); con centro en su extremo y radio la velocidad del barco se corta la línea al destino; esa dirección es el rumbo de superficie${ve('rs') ? ` (${pad3(c.rs)}°)` : ''}.`
    : `Cadena de rumbos en la carta: proa al ${pad3(c.rv)}°${c.ab ? `, el viento por ${c.ab > 0 ? 'babor' : 'estribor'} abate ${Math.abs(c.ab)}°` : ''}${ve('rs') ? ` y el rumbo de superficie es ${pad3(c.rs)}°` : ''}; ${corr}${ve('ref') && c.ic ? `: rumbo efectivo ${pad3(c.ref)}° a ${num(c.vef)} nudos` : ''}.`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // la rosa del norte, en la esquina más despejada del dibujo
  const esquinas = [[W - 30, 36], [30, 36], [W - 30, H - 46]];
  const [rx, ry] = esquinas.map((q) => [q, Math.min(...px.map((p) => Math.hypot(p[0] - q[0], p[1] - q[1])))]).sort((a, b) => b[1] - a[1])[0][0];
  out.push(rosaNorte(rx, ry));
  out.push(rotulo(14, H - 14, 'escala: una hora de navegación', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
  // a partir de aquí, lo que se construye (en la animación aparece al final) y lo que está siempre (destino y viento)
  const iRes = out.length;
  const fijo = [];
  // lo que las etiquetas no deben tapar: la rosa, la escala y las líneas
  const cajas = [{ x0: rx - 22, y0: ry - 28, x1: rx + 22, y1: ry + 22 }, { x0: 8, y0: H - 30, x1: 200, y1: H - 8 }];
  const segs = [];
  const pet = [];
  const s = P(S);
  const e = P(E);
  if (destino) {
    const d = P(destino);
    segs.push([o, d]);
    fijo.push(`<g${parte('ref')}><line x1="${f1(o[0])}" y1="${f1(o[1])}" x2="${f1(d[0])}" y2="${f1(d[1])}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="6 4"/>` +
      `<circle cx="${f1(d[0])}" cy="${f1(d[1])}" r="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/><circle cx="${f1(d[0])}" cy="${f1(d[1])}" r="2" fill="${T.tinta}"/>` +
      rotulo(d[0], d[1] - 13, 'destino', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700 }) + '</g>');
    cajas.push({ x0: d[0] - 30, y0: d[1] - 26, x1: d[0] + 30, y1: d[1] + 8 });
  }
  if (c.inversa) {
    const cc = P(Cc);
    segs.push([o, cc]);
    out.push(vector(o, cc, T.azulTxt, 1.6, 3, 'corriente'));
    pet.push({ t: `1 · Rc ${pad3(c.rc)}° ${num(c.ic)} kn`, cands: junto(o, cc, `1 · Rc ${pad3(c.rc)}° ${num(c.ic)} kn`, { centro }), color: T.azulTxt, p: 'corriente' });
    if (ve('rs')) {
      // el compás: arco de radio la velocidad del barco, con centro en el extremo de la corriente, que corta la línea al destino
      const R = Math.hypot(s[0] - cc[0], s[1] - cc[1]);
      const ang = (Math.atan2(s[0] - cc[0], -(s[1] - cc[1])) * 180) / Math.PI;
      out.push(`<path${parte('rs')} d="${arcoD(cc[0], cc[1], R, ang - 14, ang + 14)}" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="3 3"/>`);
      segs.push([cc, s]);
      out.push(vector(cc, s, T.tinta, 1.6, 1, 'rs'));
      pet.push({ t: `2 · Rs ${pad3(c.rs)}°`, cands: junto(cc, s, `2 · Rs ${pad3(c.rs)}°`, { centro }), p: 'rs' });
    }
    if (ve('ref')) {
      segs.push([o, e]);
      out.push(vector(o, e, T.magenta, 2.2, 2, 'ref'));
      pet.unshift({ t: `Ref ${pad3(c.ref)}° ${num(c.vef)} kn`, cands: junto(o, e, `Ref ${pad3(c.ref)}° ${num(c.vef)} kn`, { centro, ks: [0.6, 0.45, 0.75, 0.3] }), color: T.magenta, p: 'ref' });
    }
  } else {
    if (ve('rs')) {
      segs.push([o, s]);
      // sin corriente, el rumbo de superficie es también el efectivo
      const sinC = !c.ic && ve('ref');
      out.push(sinC ? `<g${parte('ref')}>${vector(o, s, T.tinta, 1.6, 1, 'rs')}</g>` : vector(o, s, T.tinta, 1.6, 1, 'rs'));
      const t = sinC ? `Rs = Ref ${pad3(c.rs)}°` : `Rs ${pad3(c.rs)}°`;
      pet.push({ t, cands: junto(o, s, t, { centro, ks: c.ic ? [0.5, 0.35, 0.65, 0.8] : [0.7, 0.55, 0.85, 0.4] }), p: 'rs' });
    }
    if (c.ic && ve('ref')) {
      segs.push([s, e], [o, e]);
      out.push(vector(s, e, T.azulTxt, 1.6, 3, 'corriente'), vector(o, e, T.magenta, 2.2, 2, 'ref'));
      pet.unshift({ t: `Ref ${pad3(c.ref)}° ${num(c.vef)} kn`, cands: junto(o, e, `Ref ${pad3(c.ref)}° ${num(c.vef)} kn`, { centro, ks: [0.6, 0.45, 0.75, 0.3] }), color: T.magenta, p: 'ref' });
      pet.push({ t: `Rc ${pad3(c.rc)}° ${num(c.ic)} kn`, cands: junto(s, e, `Rc ${pad3(c.rc)}° ${num(c.ic)} kn`, { centro }), color: T.azulTxt, p: 'corriente' });
    }
  }
  // la proa: el barco apunta a su rumbo verdadero
  if (ve('rv')) {
    const p = P(proa);
    // con abatimiento la proa no apunta por donde va el barco: se dibuja su dirección (sin él coincidiría con el Rs)
    if (c.ab || ocultar.includes('rs')) {
      segs.push([o, p]);
      out.push(`<line${parte('rv')} x1="${f1(o[0])}" y1="${f1(o[1])}" x2="${f1(p[0])}" y2="${f1(p[1])}" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="2 4"/>`);
      pet.push({ t: `Rv ${pad3(c.rv)}°`, cands: junto(o, p, `Rv ${pad3(c.rv)}°`, { centro, ks: [0.9, 0.75, 1.05, 0.6, 0.45] }), p: 'rv' });
    }
    out.push(barco(o[0], o[1], c.rv, 30, { p: 'rv' }));
    cajas.push({ x0: o[0] - 16, y0: o[1] - 16, x1: o[0] + 16, y1: o[1] + 16 });
    // el abatimiento, acotado entre la proa y el rumbo de superficie
    if (c.ab && ve('rs')) {
      const [a, b] = c.ab > 0 ? [c.rv, c.rs] : [c.rs, c.rv];
      const r0 = 62;
      out.push(cotaArco(o[0], o[1], r0, a, b, '', { color: T.tinta, p: 'rs' }));
      const [mx, my] = pol(o[0], o[1], c.rv + c.ab / 2, r0);
      const t = `Ab ${c.ab > 0 ? '+' : '−'}${Math.abs(c.ab)}°`;
      // la etiqueta del abatimiento, por fuera del ángulo, unida al arco con una línea de referencia
      const cands = [];
      for (const dist of [44, 60, 78]) for (const lado of [c.ab > 0 ? -90 : 90, c.ab > 0 ? 90 : -90]) cands.push(pol(mx, my, c.rv + c.ab / 2 + lado, dist));
      pet.splice(1, 0, { t, cands, p: 'rs', ref: [mx, my] });
    }
  } else {
    out.push(`<circle cx="${f1(o[0])}" cy="${f1(o[1])}" r="4" fill="${T.tinta}"/>`);
  }
  if (viento) {
    // tres flechas de viento por la banda de barlovento, hacia sotavento, a lo largo de la proa
    const hacia = c.rv + (viento === 'babor' ? 90 : -90);
    const m = P(vec(c.rv, c.vb * 0.45));
    const base = pol(m[0], m[1], hacia + 180, 92);
    const fl = [];
    for (let i = -1; i <= 1; i++) {
      const [bx, by] = pol(base[0], base[1], c.rv, i * 44);
      const [ex, ey] = pol(bx, by, hacia, 28);
      fl.push(flecha(bx, by, ex, ey, { color: T.apagado, w: 1.4 }));
      segs.push([[bx, by], [ex, ey]]);
    }
    fijo.push(`<g${parte('viento')}>${fl.join('')}</g>`);
    // su rótulo, en cursiva junto a las flechas (se coloca como una etiqueta más)
    const t = `viento por ${viento}`;
    const cands = [pol(base[0], base[1], hacia + 180, 16), pol(base[0], base[1], hacia, 44), pol(base[0], base[1], c.rv, 70), pol(base[0], base[1], c.rv + 180, 70)];
    pet.push({ t, cands, rotulo: true, p: 'viento' });
  }
  // las etiquetas, sin pisarse
  const etq = colocaEtiquetas(pet, { W, H, segs, cajas });
  const res = out.splice(iRes);
  if (t == null) out.push(...fijo, ...res, etq);
  else {
    const cc = cambiosCadena(c, t);
    out.push(...fijo, el('fin', 'g', {}, cc, res.join('') + etq), capaMovil(c, cc));
  }
  out.push(cierra());
  return out.join('');
}

/** Las tres casillas de la cadena, en su orden. '?' en lo que aún no se enseña. */
export function casillasCadena(c, ocultar = []) {
  const q = (p, v) => (ocultar.includes(p) ? '?' : v);
  const dar = c.inversa ? ' a dar' : '';
  return [
    [`1 · Verdadero${dar}`, q('rv', `${pad3(c.rv)}°`)],
    [`2 · Superficie${dar}`, q('rs', `${pad3(c.rs)}°${c.ab ? ` (Ab ${c.ab > 0 ? '+' : '−'}${Math.abs(c.ab)}°)` : ' (sin viento)'}`)],
    ['3 · Efectivo', q('ref', c.ic ? `${pad3(c.ref)}° · ${num(c.vef)} kn` : `${pad3(c.ref)}° (sin corriente)`)],
  ];
}
