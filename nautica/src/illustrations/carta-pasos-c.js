// Dibujos de los ejercicios de carta resueltos paso a paso (src/course/carta-pasos.js), en estilo C
// (docs/ESTILO-LAMINAS.md): un extracto de la carta del Estrecho —la costa y los faros de la app, sin la carta
// escaneada— con lo trazado hasta el paso: lo anterior en tinta y lo nuevo de este paso en magenta y más grueso (y
// nombrado en el texto alternativo: nada solo por color). Los pasos de cálculo de la aguja se dibujan con los tres
// nortes. Sin DOM: devuelve el SVG como texto.
//
// La carta es una Mercator: en el plano de la app (src/math/mercator.js) los rumbos se dibujan con su ángulo real y la
// misma escala en los dos ejes, así que lo que se ve es lo que se mediría con el transportador.

import { T, TXT, lienzo, rotulo, etiqueta, flecha, rosaNorte, cotaArco, junto, colocaEtiquetas, cajaEtiqueta, anchoTexto, referencia, arcoD, pol, f1, segmentoEnCaja } from './estilo-c.js';
import { faro, situacion, estima, esquinaLibre } from './carta-c.js';
import { toPlane, unitsPerMile, rhumbDestination } from '../math/mercator.js';

const W = 358;
const pad3 = (d) => String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0');

// ---------------------------------------------------------------------------
// Geometría de los elementos (en coordenadas geográficas)

/** Extremo de un elemento con rumbo y millas, o su `hasta`. */
const extremo = (e) => e.hasta ?? rhumbDestination(e.desde, e.rumbo, e.millas);

/** Puntos de un elemento (para el encuadre). */
function puntosDe(e) {
  switch (e.tipo) {
    case 'faro': case 'punto': return [e.at];
    case 'linea': case 'vector': return [e.desde, extremo(e)];
    case 'seg': return [e.de, e.a];
    case 'arco': {
      const out = [];
      for (let k = -0.5; k <= 0.5001; k += 0.125) out.push(rhumbDestination(e.centro, e.hacia + k * e.abertura, e.radio));
      return out;
    }
    case 'componentes': return [e.de, e.a];
    case 'angulo': return [e.en];
    case 'nota': return e.en;
    default: return [];
  }
}

/** Proyección del extracto: todos los elementos de todos los pasos caben (la escala no cambia de un paso a otro). */
function encuadre(elementos) {
  const ps = elementos.flatMap(puntosDe).map(toPlane);
  let x0 = Math.min(...ps.map((p) => p.x));
  let x1 = Math.max(...ps.map((p) => p.x));
  let y0 = Math.min(...ps.map((p) => p.y));
  let y1 = Math.max(...ps.map((p) => p.y));
  const mx = Math.max(1.2, (x1 - x0) * 0.16);
  const my = Math.max(1.2, (y1 - y0) * 0.16);
  x0 -= mx; x1 += mx; y0 -= my; y1 += my;
  const m = 10;
  const Hmin = 236;
  const Hmax = 340;
  const s = Math.min((W - 2 * m) / (x1 - x0), (Hmax - 2 * m) / (y1 - y0));
  const H = Math.round(Math.min(Hmax, Math.max(Hmin, (y1 - y0) * s + 2 * m)));
  const ox = (W - (x1 - x0) * s) / 2;
  const oy = (H - (y1 - y0) * s) / 2;
  const xy = (g) => { const p = toPlane(g); return [ox + (p.x - x0) * s, oy + (y1 - p.y) * s]; };
  return { H, s, xy, x0, x1, y0, y1 };
}

/** Cabezas de flecha apiladas (1 barco o rumbo, 2 efectivo, 3 corriente), como en el trazado en la carta. */
function vectorSvg(a, b, puntas, { color, w, discontinua = false }) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const L = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / L, dy / L];
  const s = 7 + w * 1.5;
  const o = [`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0] - ux * s * 0.6)}" y2="${f1(b[1] - uy * s * 0.6)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${discontinua ? ' stroke-dasharray="7 4"' : ''}/>`];
  for (let i = 0; i < puntas; i++) {
    const [tx, ty] = [b[0] - ux * i * (s * 0.75), b[1] - uy * i * (s * 0.75)];
    const [hx, hy] = [tx - ux * s, ty - uy * s];
    o.push(`<polygon points="${f1(tx)},${f1(ty)} ${f1(hx - uy * s * 0.45)},${f1(hy + ux * s * 0.45)} ${f1(hx + uy * s * 0.45)},${f1(hy - ux * s * 0.45)}" fill="${color}"/>`);
  }
  return o.join('');
}

const PUNTAS = { 1: 'una punta', 2: 'dos puntas', 3: 'tres puntas' };
const FORMA = { situacion: 'situación observada (círculo con punto)', estima: 'situación de estima (triángulo)', salida: 'punto de salida', destino: 'punto de llegada' };

/** Qué es un elemento, en palabras (para el texto alternativo). */
export function describe(e) {
  switch (e.tipo) {
    case 'faro': return `faro de ${e.nombre}`;
    case 'punto': return `${FORMA[e.forma] ?? 'punto'}${e.rotulo ? ` «${e.rotulo}»` : ''}`;
    case 'linea': return `línea de posición${e.rotulo ? ` «${e.rotulo}»` : ''}${e.discontinua ? ' a trazos' : ''}`;
    case 'vector': return `vector${e.rotulo ? ` «${e.rotulo}»` : ''} con ${PUNTAS[e.puntas] ?? 'una punta'}${e.discontinua ? ', a trazos' : ''}`;
    case 'arco': return `arco de compás de ${e.rotulo ?? `${e.radio} millas`}`;
    case 'seg': return `línea${e.rotulo ? ` «${e.rotulo}»` : ''}`;
    case 'angulo': return `ángulo${e.rotulo ? ` «${e.rotulo}»` : ''}`;
    case 'viento': return `flechas del ${e.rotulo ?? 'viento'}`;
    case 'componentes': return `triángulo con la diferencia de latitud y el apartamiento (${(e.rotulos ?? []).join(', ')})`;
    case 'nota': return `rótulo «${e.texto}»`;
    default: return e.tipo;
  }
}

// ---------------------------------------------------------------------------
// El extracto de carta de un paso

/**
 * @param {object} chart  createChart(datos de la carta)
 * @param {{ elementos: object[] }} carta
 * @param {number} k  paso (1…n): se dibuja lo de paso ≤ k; lo de paso k, resaltado
 * @param {string} alt  texto alternativo
 */
export function cartaPaso(chart, carta, k, alt) {
  const els = carta.elementos;
  const E = encuadre(els);
  const { H, xy } = E;
  const { out, pt, id, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const clip = `${id}-clip`;
  out.splice(2, 0, `<defs><clipPath id="${clip}"><rect x="5" y="5" width="${W - 10}" height="${H - 10}"/></clipPath></defs>`);
  // tierra (la costa vectorial de la app)
  const tierraD = (chart.land ?? []).map((poly) => poly.map(([lon, lat], i) => { const [x, y] = xy({ lat, lon }); return `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`; }).join('') + 'Z').join('');
  out.push(`<g clip-path="url(#${clip})"><path d="${tierraD}" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="${tierraD}" fill="${pt}" stroke="none" opacity=".5"/>`);
  // cuadrícula: unos pocos paralelos y meridianos enteros, con su valor en el borde (en el lado que no pisa ninguna
  // línea de ningún paso: así el rótulo no salta de sitio al avanzar)
  const cajas = [];
  const grat = graticula(E);
  out.push(grat.lineas, '</g>');
  const segsTodos = els.flatMap((e) => segmentosDe(e, xy, E));
  const puntosTodos = els.filter((e) => e.tipo === 'faro' || e.tipo === 'punto').map((e) => xy(e.at));
  for (const r of grat.rotulos) {
    const c = r.opciones.map(([x, y]) => cajaEtiqueta(r.t, x, y, TXT.min)).find((q) => !segsTodos.some(([a, b]) => segmentoEnCaja(a, b, q)) &&
      !puntosTodos.some(([x, y]) => x > q.x0 - 12 && x < q.x1 + 12 && y > q.y0 - 12 && y < q.y1 + 12));
    if (!c) continue;
    out.push(etiqueta((c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, r.t, { size: TXT.min, color: T.apagado, borde: T.lineaAgua }));
    cajas.push(c);
  }

  const visibles = els.filter((e) => e.paso <= k);
  const nuevo = (e) => e.paso === k && k > 0;
  const segs = [];
  const peticiones = [];
  const peticionesViejas = [];
  const nombres = [];
  const pide = (e, q) => (nuevo(e) ? peticiones : peticionesViejas).push(q);
  const dibujo = [];
  const marcas = [];
  // la rosa del norte en la esquina más libre
  const todos = els.flatMap(puntosDe).map(xy);
  const esquinas = [[W - 30, 34], [30, 34], [W - 30, H - 52], [30, H - 52]];
  const libreDeRotulos = (q) => !cajas.some((c) => c.x0 < q[0] + 18 && q[0] - 18 < c.x1 && c.y0 < q[1] + 18 && q[1] - 34 < c.y1);
  const rosa = esquinaLibre(todos, esquinas.filter(libreDeRotulos).length ? esquinas.filter(libreDeRotulos) : esquinas);
  cajas.push({ x0: rosa[0] - 18, y0: rosa[1] - 34, x1: rosa[0] + 18, y1: rosa[1] + 18 });
  // escala gráfica: en la esquina inferior libre que no es la de la rosa
  const solapa = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const sitiosEscala = [[W - 70, H - 26], [70, H - 26], [W - 70, H - 50], [70, H - 50], [W / 2, H - 26], [W - 70, 30], [70, 30]]
    .filter((q) => !cajas.some((c) => solapa(c, escalaGrafica(E, q).caja)));
  const escala = escalaGrafica(E, sitiosEscala.length ? esquinaLibre(todos, sitiosEscala) : [W - 70, H - 26]);
  cajas.push(escala.caja);

  for (const e of visibles) {
    const c = nuevo(e) ? T.magenta : T.tinta;
    const w = nuevo(e) ? 2.4 : 1.4;
    switch (e.tipo) {
      case 'faro': {
        const p = xy(e.at);
        marcas.push(faro(p[0], p[1], { destella: false }));
        cajas.push({ x0: p[0] - 9, y0: p[1] - 9, x1: p[0] + 9, y1: p[1] + 9 });
        nombres.push({ t: e.nombre, cands: candidatos(p, [20, 30, 42]), rotulo: true, size: TXT.rotulo });
        break;
      }
      case 'punto': {
        const p = xy(e.at);
        if (e.forma === 'situacion') marcas.push(situacion(p[0], p[1], { color: c }));
        else if (e.forma === 'estima') marcas.push(estima(p[0], p[1], { color: c }));
        else if (e.forma === 'destino') marcas.push(`<rect x="${f1(p[0] - 5.5)}" y="${f1(p[1] - 5.5)}" width="11" height="11" fill="${T.papel}" stroke="${c}" stroke-width="1.8"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2" fill="${c}"/>`);
        else marcas.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" fill="${c}" stroke="${T.papel}" stroke-width="1.2"/>`);
        cajas.push({ x0: p[0] - 10, y0: p[1] - 11, x1: p[0] + 10, y1: p[1] + 10 });
        if (e.rotulo) pide(e, { t: e.rotulo, cands: candidatos(p, [22, 34, 48]), rotulo: true, color: c, size: TXT.rotulo });
        break;
      }
      case 'linea': case 'seg': {
        const a = xy(e.tipo === 'linea' ? e.desde : e.de);
        const b = xy(e.tipo === 'linea' ? extremo(e) : e.a);
        dibujo.push(`<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${e.tipo === 'seg' && !nuevo(e) ? 1.1 : w}"${e.discontinua ? ' stroke-dasharray="8 4"' : ''} stroke-linecap="round"/>`);
        segs.push([a, b]);
        if (e.rotulo) pide(e, { t: e.rotulo, cands: junto(a, b, e.rotulo, { ks: [0.5, 0.35, 0.65, 0.22, 0.8] }), color: c });
        break;
      }
      case 'vector': {
        const a = xy(e.desde);
        const b = xy(extremo(e));
        dibujo.push(vectorSvg(a, b, e.puntas ?? 1, { color: c, w, discontinua: e.discontinua }));
        segs.push([a, b]);
        if (e.rotulo) pide(e, { t: e.rotulo, cands: junto(a, b, e.rotulo, { ks: [0.5, 0.35, 0.65, 0.22, 0.8] }), color: c });
        break;
      }
      case 'arco': {
        const cc = xy(e.centro);
        const r = e.radio * unitsPerMile(e.centro.lat) * E.s;
        dibujo.push(`<path d="${arcoD(cc[0], cc[1], r, e.hacia - e.abertura / 2, e.hacia + e.abertura / 2)}" fill="none" stroke="${c}" stroke-width="${w}"/>`);
        // el radio, a trazos finos, del centro al arco
        const m = pol(cc[0], cc[1], e.hacia + e.abertura * 0.42, r);
        dibujo.push(referencia(cc[0], cc[1], m[0], m[1], { color: c }));
        segs.push([cc, m]);
        const cands = [0.42, 0.3, -0.3, 0.15, -0.15, 0].flatMap((f) => [pol(cc[0], cc[1], e.hacia + e.abertura * f, r + 16), pol(cc[0], cc[1], e.hacia + e.abertura * f, r - 16)]);
        if (e.rotulo) pide(e, { t: e.rotulo, cands, color: c });
        break;
      }
      case 'angulo': {
        const p = xy(e.en);
        const span = ((e.a - e.de) % 360 + 360) % 360;
        const [de, a] = span <= 180 ? [e.de, e.a] : [e.a, e.de];
        const sp = span <= 180 ? span : 360 - span;
        const r = 34;
        dibujo.push(cotaArco(p[0], p[1], r, de, a, '', { color: c }));
        const cands = [r + 18, r + 30, r + 44].flatMap((rr) => [0.5, 0.2, 0.8, -0.3, 1.3].map((f) => pol(p[0], p[1], de + sp * f, rr)));
        if (e.rotulo) pide(e, { t: e.rotulo, cands, color: c });
        break;
      }
      case 'viento': {
        const q = esquinaLibre(todos.concat([rosa]), [[60, 70], [W - 60, 70], [60, H - 80], [W - 60, H - 80], [W / 2, 60]]);
        const hacia = e.de + 180;
        for (const s of [-1, 1]) {
          const [nx, ny] = pol(0, 0, hacia + 90, 9 * s);
          const [ax, ay] = pol(q[0] + nx, q[1] + ny, e.de, 18);
          const [bx, by] = pol(q[0] + nx, q[1] + ny, hacia, 18);
          marcas.push(flecha(ax, ay, bx, by, { color: c, w: nuevo(e) ? 2 : 1.4 }));
        }
        cajas.push({ x0: q[0] - 24, y0: q[1] - 24, x1: q[0] + 24, y1: q[1] + 24 });
        if (e.rotulo) pide(e, { t: e.rotulo, cands: [[q[0], q[1] + 36], [q[0], q[1] - 36], [q[0] + 60, q[1]], [q[0] - 60, q[1]]], rotulo: true, color: c, size: TXT.rotulo });
        break;
      }
      case 'componentes': {
        const a = xy(e.de);
        const b = xy(e.a);
        const kq = [a[0], b[1]];
        dibujo.push(`<g stroke="${c}" stroke-width="${nuevo(e) ? 2 : 1.2}" fill="none" stroke-dasharray="6 4"><line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(kq[0])}" y2="${f1(kq[1])}"/><line x1="${f1(kq[0])}" y1="${f1(kq[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/></g>`);
        const sx = Math.sign(b[0] - a[0]) || 1;
        const sy = Math.sign(a[1] - b[1]) || 1;
        dibujo.push(`<path d="M${f1(kq[0] + 9 * sx)},${f1(kq[1])} v${f1(9 * sy)} h${f1(-9 * sx)}" fill="none" stroke="${c}" stroke-width=".9"/>`);
        segs.push([a, kq], [kq, b]);
        const [r1, r2] = e.rotulos ?? [];
        if (r1) pide(e, { t: r1, cands: junto(a, kq, r1, { centro: b }), color: c });
        if (r2) pide(e, { t: r2, cands: junto(kq, b, r2, { centro: a }), color: c });
        break;
      }
      case 'nota': {
        const a = xy(e.en[0]);
        const b = xy(e.en[1]);
        pide(e, { t: e.texto, cands: junto(a, b, e.texto, { ks: [0.5, 0.3, 0.7] }), color: c });
        break;
      }
      default: break;
    }
  }
  out.push(dibujo.join(''), marcas.join(''));
  out.push(rosaNorte(rosa[0], rosa[1]), escala.svg);
  // primero las etiquetas de lo nuevo (se quedan con el mejor sitio) y después las demás
  out.push(colocaEtiquetas([...peticiones, ...nombres, ...peticionesViejas], { W, H, segs, cajas }));
  out.push(cierra());
  return out.join('');
}

/** Candidatos alrededor de un punto (a la derecha y a la izquierda primero: los nombres se leen mejor). */
function candidatos([x, y], radios) {
  return radios.flatMap((r) => [90, 270, 45, 135, 225, 315, 0, 180].map((g) => pol(x, y, g, r)));
}

/** Paralelos y meridianos enteros del extracto (cada 2′, 5′ o 10′), con su rótulo en el borde. */
function graticula(E) {
  const { x0, x1, y0, y1, xy } = E;
  const latDe = (y) => (2 * Math.atan(Math.exp((y / 60) * Math.PI / 180)) - Math.PI / 2) * 180 / Math.PI;
  const lat0 = latDe(y0);
  const lat1 = latDe(y1);
  const paso = (span) => [1, 2, 5, 10, 15, 20, 30].find((p) => span / p <= 3.2) ?? 30;
  const pl = paso((lat1 - lat0) * 60);
  const pm = paso(x1 - x0);
  const lineas = [];
  const rotulos = [];
  const H = E.H;
  for (let m = Math.ceil((lat0 * 60) / pl) * pl; m <= lat1 * 60; m += pl) {
    const [, y] = xy({ lat: m / 60, lon: x0 / 60 });
    if (y < 24 || y > H - 24) continue;
    lineas.push(`<line x1="5" y1="${f1(y)}" x2="${W - 5}" y2="${f1(y)}" stroke="${T.lineaAgua}" stroke-width=".8" stroke-dasharray="2 3"/>`);
    const t = gm(m, 'N');
    const w2 = anchoTexto(t, TXT.min, 'mono') / 2 + 5;
    rotulos.push({ t, opciones: [[12 + w2, y], [W - 12 - w2, y]] });
  }
  for (let m = Math.ceil(x0 / pm) * pm; m <= x1; m += pm) {
    const [x] = xy({ lat: lat0, lon: m / 60 });
    if (x < 40 || x > W - 40) continue;
    lineas.push(`<line x1="${f1(x)}" y1="5" x2="${f1(x)}" y2="${H - 5}" stroke="${T.lineaAgua}" stroke-width=".8" stroke-dasharray="2 3"/>`);
    rotulos.push({ t: gm(-m, 'W'), opciones: [[x, H - 14 - TXT.min / 2], [x, 14 + TXT.min / 2]] });
  }
  return { lineas: lineas.join(''), rotulos };
}

/** Segmentos en pantalla de un elemento (los de todos los pasos deciden dónde van los rótulos fijos). */
function segmentosDe(e, xy, E) {
  switch (e.tipo) {
    case 'linea': case 'vector': return [[xy(e.desde), xy(extremo(e))]];
    case 'seg': return [[xy(e.de), xy(e.a)]];
    case 'componentes': { const a = xy(e.de); const b = xy(e.a); return [[a, [a[0], b[1]]], [[a[0], b[1]], b]]; }
    case 'arco': {
      const c = xy(e.centro);
      const r = e.radio * unitsPerMile(e.centro.lat) * E.s;
      const ps = [];
      for (let f = -0.5; f <= 0.5001; f += 0.1) ps.push(pol(c[0], c[1], e.hacia + f * e.abertura, r));
      return ps.slice(1).map((p, i) => [ps[i], p]);
    }
    default: return [];
  }
}

/** «36°05′N» a partir de minutos de arco. */
function gm(minutos, letra) {
  const m = Math.round(Math.abs(minutos));
  return `${Math.floor(m / 60)}°${String(m % 60).padStart(2, '0')}′${letra}`;
}

/** Escala gráfica de 1, 2 o 5 millas (en la escala de latitudes de la zona). */
function escalaGrafica(E, [cx, cy]) {
  const latC = (2 * Math.atan(Math.exp((((E.y0 + E.y1) / 2) / 60) * Math.PI / 180)) - Math.PI / 2) * 180 / Math.PI;
  const pxMilla = unitsPerMile(latC) * E.s;
  const millas = [1, 2, 5].find((m) => m * pxMilla >= 40) ?? 5;
  const L = millas * pxMilla;
  const x0 = cx - L / 2;
  const y = cy;
  const svg = `<g><line x1="${f1(x0)}" y1="${f1(y)}" x2="${f1(x0 + L)}" y2="${f1(y)}" stroke="${T.tinta}" stroke-width="2.4"/>` +
    `<line x1="${f1(x0)}" y1="${f1(y - 5)}" x2="${f1(x0)}" y2="${f1(y + 5)}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="${f1(x0 + L)}" y1="${f1(y - 5)}" x2="${f1(x0 + L)}" y2="${f1(y + 5)}" stroke="${T.tinta}" stroke-width="1.2"/>` +
    rotulo(cx, y - 8, `${millas} ${millas === 1 ? 'milla' : 'millas'}`, { size: TXT.min, estilo: 'serif', italic: true }) + '</g>';
  return { svg, caja: { x0: x0 - 4, y0: y - 22, x1: x0 + L + 4, y1: y + 7 } };
}

// ---------------------------------------------------------------------------
// Los tres nortes (pasos de aguja): Nv, Nm (la dm) y Na (la Ct), con los ángulos exagerados

/**
 * @param {{ dm:number, desvio:number, dmBase?:number, mostrar:string[], resalta:string, ra?:number, rv?:number }} f
 */
export function nortesPaso(f, alt) {
  const H = 250;
  const { out, cierra } = lienzo(W, H, alt);
  const ct = f.dm + f.desvio;
  const mostrar = new Set(f.mostrar ?? []);
  const vals = [f.dm, f.desvio, ct, ...(mostrar.has('dmBase') ? [f.dmBase] : [])].filter((x) => Number.isFinite(x)).map(Math.abs);
  const k = Math.max(1, Math.min(10, Math.floor(30 / Math.max(...vals, 0.1))));
  const O = [136, 214];
  const L = 168;
  const col = (q) => (f.resalta === q ? T.magenta : T.tinta);
  const ancho = (q) => (f.resalta === q ? 2.4 : 1.4);
  const dir = (x) => x * k;
  const linea = (deg, { color, w, dash = '' }) => { const [x, y] = pol(O[0], O[1], deg, L); return `<line x1="${O[0]}" y1="${O[1]}" x2="${f1(x)}" y2="${f1(y)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`; };
  const nombre = (deg, t, color, dx = 0) => { const [x, y] = pol(O[0], O[1], deg, L + 12); return rotulo(x + dx, y + 4, t, { size: TXT.rotulo, weight: 700, estilo: 'serif', color }); };
  // Nv siempre
  out.push(flecha(O[0], O[1], O[0], O[1] - L - 4, { color: T.tinta, w: 1.6 }), rotulo(O[0], O[1] - L - 12, 'Nv', { size: TXT.rotulo, weight: 700, estilo: 'serif' }));
  const sep = (a, b) => Math.abs(a - b) < 8;
  // arco de un ángulo con su nombre junto al extremo (el nombre no depende del color)
  const arco = (a, b, r, t, q) => {
    const e = b;
    const sg = e < 0 ? -1 : 1;
    const [x, y] = pol(O[0], O[1], e + sg * 7, r);
    return `<path d="${arcoD(O[0], O[1], r, Math.min(a, b), Math.max(a, b))}" fill="none" stroke="${col(q)}" stroke-width="${ancho(q)}"/>` +
      rotulo(x + sg * 3, y + 4, t, { size: TXT.min, weight: 700, estilo: 'mono', color: col(q), anchor: sg < 0 ? 'end' : 'start' });
  };
  const panel = [];
  if (mostrar.has('dmBase')) {
    out.push(linea(dir(f.dmBase), { color: T.apagado, w: 1.2, dash: '3 4' }), nombre(dir(f.dmBase), 'Nm 2005', T.apagado, -22));
    panel.push({ t: `2005: ${grados(f.dmBase)}`, color: T.apagado });
  }
  if (mostrar.has('variacion') || mostrar.has('dm')) {
    if (mostrar.has('variacion')) out.push(arco(dir(f.dmBase), dir(f.dm), L - 40, '', 'variacion'));
    out.push(linea(dir(f.dm), { color: col('dm'), w: ancho('dm'), dash: '9 4' }), nombre(dir(f.dm), mostrar.has('dmBase') ? 'Nm hoy' : 'Nm', col('dm'), mostrar.has('dmBase') ? 18 : (f.dm < 0 ? -10 : 10)));
    if (mostrar.has('variacion')) panel.push({ t: `variación ${grados(f.dm - f.dmBase)}`, color: col('variacion') });
    if (mostrar.has('dm') && !mostrar.has('dmBase')) out.push(arco(0, dir(f.dm), 64, 'dm', 'dm'));
    if (mostrar.has('dm')) panel.push({ t: `dm ${grados(f.dm)}`, color: col('dm') });
  }
  if (mostrar.has('desvio') || mostrar.has('ct')) {
    out.push(linea(dir(ct), { color: col('ct') === T.magenta || col('desvio') === T.magenta ? T.magenta : T.azulTxt, w: Math.max(ancho('ct'), ancho('desvio')), dash: '10 3 2 3' }));
    out.push(nombre(dir(ct), 'Na', col('ct') === T.magenta || col('desvio') === T.magenta ? T.magenta : T.azulTxt, sep(dir(ct), mostrar.has('dm') ? dir(f.dm) : 0) ? (ct < f.dm ? -16 : 16) : 0));
  }
  if (mostrar.has('desvio')) {
    out.push(arco(dir(f.dm), dir(ct), 96, 'Δ', 'desvio'));
    panel.push({ t: `Δ ${grados(f.desvio)}`, color: col('desvio') });
  }
  if (mostrar.has('ct')) {
    out.push(arco(0, dir(ct), 128, 'Ct', 'ct'));
    panel.push({ t: `Ct ${grados(ct)}`, color: col('ct') });
  }
  if (mostrar.has('rumbo') && Number.isFinite(f.rv)) {
    // el rumbo se cuenta desde el Na (Ra) y desde el Nv (Rv): con los nortes exagerados, la flecha va a Na + Ra para que
    // las dos cuentas se vean bien en el dibujo
    const vis = dir(ct) + (((f.ra % 360) + 360) % 360);
    const [x, y] = pol(O[0], O[1], vis, 120);
    out.push(flecha(O[0], O[1], x, y, { color: col('rumbo'), w: ancho('rumbo') + 0.4 }));
    // los arcos, solo si el rumbo cae en la mitad derecha (un arco de más de media vuelta tapa el dibujo)
    if (vis - dir(ct) <= 180 && vis <= 180) out.push(arco(dir(ct), vis, 30, 'Ra', 'rumbo').replace(/stroke="var\(--lc-magenta\)"/, `stroke="${T.azulTxt}"`), arco(0, vis, 46, 'Rv', 'rumbo'));
    panel.push({ t: `Ra ${pad3(f.ra)}°`, color: T.azulTxt }, { t: `Rv ${rumbo1(f.rv)}`, color: col('rumbo') });
  }
  out.push(`<circle cx="${O[0]}" cy="${O[1]}" r="3" fill="${T.tinta}"/>`);
  // panel de cifras a la derecha
  const px = 286;
  panel.forEach((q, i) => out.push(etiqueta(px, 40 + i * 30, q.t, { color: q.color, size: TXT.cota })));
  out.push(rotulo(px, H - 16, `ángulos ×${k}`, { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(cierra());
  return out.join('');
}

/** «2° W», «1° 20′ E», «0°» (los nortes): grados y minutos con su letra. */
function grados(x) {
  const t = Math.round(Math.abs(x) * 60);
  if (!t) return '0°';
  const g = Math.floor(t / 60);
  const m = t % 60;
  return `${g}°${m ? ` ${String(m).padStart(2, '0')}′` : ''} ${x < 0 ? 'W' : 'E'}`;
}

const rumbo1 = (x) => { const v = Math.round(x * 10) / 10; return Number.isInteger(v) ? `${pad3(v)}°` : `${pad3(Math.floor(v))},${Math.round((v % 1) * 10)}°`; };

// ---------------------------------------------------------------------------

/** Texto alternativo de un paso: qué se ve y qué es lo nuevo. */
export function altPaso(tipo, i) {
  const p = tipo.pasos[i - 1];
  const n = tipo.pasos.length;
  const cab = `${tipo.titulo}. Paso ${i} de ${n}: ${p.titulo}.`;
  if (p.figura && p.figura.tipo === 'nortes') {
    const f = p.figura;
    const partes = { dm: `declinación ${grados(f.dm)}`, desvio: `desvío ${grados(f.desvio)}`, ct: `corrección total ${grados(f.dm + f.desvio)}`, dmBase: `declinación de 2005 ${grados(f.dmBase ?? 0)}`, variacion: `variación ${grados(f.dm - (f.dmBase ?? 0))}`, rumbo: `rumbo verdadero ${rumbo1(f.rv ?? 0)}` };
    return `${cab} Los tres nortes con los ángulos exagerados: el verdadero arriba, el magnético y el de aguja. Se ve ${(f.mostrar ?? []).map((q) => partes[q]).filter(Boolean).join(', ')}; resaltado en magenta: ${partes[f.resalta] ?? f.resalta}.`;
  }
  const els = tipo.carta.elementos.filter((e) => e.paso <= i);
  const viejos = els.filter((e) => e.paso < i).map(describe);
  const nuevos = els.filter((e) => e.paso === i).map(describe);
  return `${cab} Extracto de la carta del Estrecho${viejos.length ? ` con ${viejos.join(', ')}` : ''}.${nuevos.length ? ` Nuevo en este paso, en magenta y más grueso: ${nuevos.join(', ')}.` : ''}`;
}

/** El SVG del paso i (1…n) de un tipo. */
export function figuraPaso(chart, tipo, i) {
  const p = tipo.pasos[i - 1];
  const alt = altPaso(tipo, i);
  if (p.figura && p.figura.tipo === 'nortes') return nortesPaso(p.figura, alt);
  if (!tipo.carta) return null;
  return cartaPaso(chart, tipo.carta, i, alt);
}
