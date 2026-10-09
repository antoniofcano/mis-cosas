// Mareas: un mando de hora. Curva de la marea y corte del fondo enlazados: sonda de la carta + altura de la marea
// = sonda del momento; menos el calado, agua bajo la quilla. Valores con la fórmula de la tabla oficial
// (C = A·sen²(90°·I/D)). Variantes curva, duodecimos y sonda; «fases» (vivas y muertas) sigue fija.
// También es una animación (src/ui/animacion.js): la creciente entera, de la bajamar a la pleamar, a dos segundos por
// hora; el tiempo de la animación es el mando de la hora (van a la par). El agua sube en el corte y en la curva, las
// franjas de los doceavos se llenan hora a hora y el barco flota cuando hay agua bajo la quilla.
import { correccionTabla, aguaBajoQuilla, twelfthsFraction } from '../../nautical/tides.js';
import { num } from './kit.js';
import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, tierra, anchoTexto, f1 } from '../estilo-c.js';
import { pista, el } from '../animaciones/pista.js';

const BM = { hora: 8 * 60, h: 0.6 };
const PM = { hora: 14 * 60, h: 3.4 };
/** La marea del ejemplo (la usa también el marco de la lámina). */
export const MAREA_EJEMPLO = { bm: BM, pm: PM };
const A = PM.h - BM.h;
const D = PM.hora - BM.hora;
const SONDA = 1.2; // sonda de la carta en el bajo
const CALADO = 1.8;
const DUR = 12; // segundos de animación: dos por hora
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
const PIES = {
  curva: 'Amplitud: diferencia entre pleamar y bajamar. Duración: tiempo entre una y otra (creciente o vaciante). En el anuario las horas vienen en UT: súmale el adelanto para la hora oficial.',
  duodecimos: 'Aproximación para una marea semidiurna de unas 6 horas: cada hora sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud. La mitad de la subida ocurre en las dos horas centrales.',
  sonda: 'Las sondas de la carta se miden desde el cero hidrográfico. El agua que tienes en un momento es esa sonda más la altura de la marea a esa hora; restando tu calado sabes cuánto queda bajo la quilla.',
};

/** Altura de la marea (m) a una hora (minutos), con la fórmula de la tabla. */
export const alturaEn = (hora) => BM.h + correccionTabla(A, hora - BM.hora, D);
/** Hora (minutos) del instante t de la animación, y al revés. */
export const horaDe = (t) => BM.hora + (Math.min(DUR, Math.max(0, t)) / DUR) * D;
export const tiempoDe = (hora) => ((Math.min(PM.hora, Math.max(BM.hora, hora)) - BM.hora) / D) * DUR;

// --- curva -------------------------------------------------------------------------------------------------------------
const CW = 358;
const CH = 236;
const X0 = 56;
const X1 = 334;
const cx = (m) => X0 + ((m - BM.hora) / D) * (X1 - X0);
const cy = (h) => 186 - (h / 4) * 150;

/** Lo que se mueve en la curva a una hora. */
function cambiosCurva(e, hora) {
  const h = alturaEn(hora);
  const x = cx(hora);
  const tx = Math.min(Math.max(x, X0 + 60), X1 - 60);
  const c = {
    'm-linea': { x1: f1(x), x2: f1(x) },
    'm-punto': { cx: f1(x), cy: f1(cy(h)) },
    'm-etq': { transform: `translate(${f1(tx)} 0)` },
    'm-etq-t': { texto: `${hhmm(hora)} · ${num(h, 2)} m` },
  };
  // el agua que ya ha subido, bajo la curva
  const pts = [`${f1(cx(BM.hora))},${cy(0)}`];
  for (let m = BM.hora; m < hora; m += 10) pts.push(`${f1(cx(m))},${f1(cy(alturaEn(m)))}`);
  pts.push(`${f1(x)},${f1(cy(h))}`, `${f1(x)},${cy(0)}`);
  c['m-agua'] = { points: pts.join(' ') };
  if (e.modo === 'duodecimos') {
    for (let i = 1; i <= 6; i++) {
      // cada franja se llena con la curva durante su hora (la regla, en escalones, y la curva, continua)
      const h0 = BM.h + A * twelfthsFraction(i - 1);
      const h1 = BM.h + A * twelfthsFraction(Math.min(i, Math.max(i - 1, (hora - BM.hora) / 60)));
      c[`d-${i}`] = { y: f1(cy(h1)), height: f1(Math.max(0, cy(h0) - cy(h1))) };
      c[`d-${i}-r`] = { y: f1(cy(h1)), height: f1(Math.max(0, cy(h0) - cy(h1))) };
      c[`d-${i}-t`] = { opacity: hora >= BM.hora + i * 60 - 1 ? 1 : 0 };
    }
  }
  return c;
}

function curva(e, r, hora) {
  const alt = e.modo === 'duodecimos'
    ? `Curva de la marea de la bajamar de las ${hhmm(BM.hora)} (${num(BM.h)} m) a la pleamar de las ${hhmm(PM.hora)} (${num(PM.h)} m), con una franja por hora: 1, 2, 3, 3, 2 y 1 doceavos de la amplitud. A las ${hhmm(e.hora)}, ${num(r.altura, 2)} m.`
    : `Curva de la marea de la bajamar de las ${hhmm(BM.hora)} (${num(BM.h)} m) a la pleamar de las ${hhmm(PM.hora)} (${num(PM.h)} m). A las ${hhmm(e.hora)}, ${num(r.altura, 2)} m.`;
  const c = cambiosCurva(e, hora);
  const { out: o, ray, cierra } = lienzo(CW, CH, alt);
  // cuadrícula: metros y horas
  for (let h = 1; h <= 4; h++) o.push(`<line x1="${X0}" y1="${cy(h)}" x2="${X1}" y2="${cy(h)}" stroke="${T.apagado}" stroke-width=".5" stroke-dasharray="2 3"/>`, rotulo(X0 - 6, cy(h) + 4, `${h} m`, { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.apagado }));
  for (let m = BM.hora; m <= PM.hora; m += 60) {
    o.push(`<line x1="${f1(cx(m))}" y1="${cy(4)}" x2="${f1(cx(m))}" y2="${cy(0)}" stroke="${T.apagado}" stroke-width=".5" stroke-dasharray="2 3"/>`);
    if ((m - BM.hora) % 120 === 0) o.push(rotulo(cx(m), 204, hhmm(m), { size: TXT.min, estilo: 'mono', color: T.apagado }));
  }
  // el agua que ya ha subido (solo en la animación: en la imagen fija, la curva sola)
  if (hora != null && e.anima) o.push(el('m-agua', 'polygon', { fill: T.agua, stroke: 'none' }, c));
  o.push(`<line data-parte="cero" x1="${X0}" y1="${cy(0)}" x2="${X1}" y2="${cy(0)}" stroke="${T.magenta}" stroke-width="1.2" stroke-dasharray="6 4"/>`, rotulo(X0 - 6, cy(0) + 4, '0 m', { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.magenta, p: 'cero' }));
  if (e.modo === 'duodecimos') {
    // en la imagen fija, las seis franjas llenas; en la animación, se llenan hora a hora
    const cf = e.anima ? c : cambiosCurva(e, PM.hora);
    for (let i = 1; i <= 6; i++) {
      const h1 = BM.h + A * twelfthsFraction(i);
      const xa = cx(BM.hora + (i - 1) * 60) + 3;
      const w = (X1 - X0) / 6 - 6;
      o.push(`<g data-parte="doceavos">${el(`d-${i}`, 'rect', { x: f1(xa), width: f1(w), fill: T.agua, stroke: T.tinta, 'stroke-width': '.8' }, cf)}${el(`d-${i}-r`, 'rect', { x: f1(xa), width: f1(w), fill: ray, opacity: '.4' }, cf)}` +
        el(`d-${i}-t`, 'g', {}, cf, rotulo(xa + w / 2, cy(h1) - 5, `${[1, 2, 3, 3, 2, 1][i - 1]}/12`, { size: TXT.min, estilo: 'mono', weight: 700 })) + '</g>');
    }
  }
  const pts = [];
  for (let m = BM.hora; m <= PM.hora; m += 10) pts.push(`${f1(cx(m))},${f1(cy(alturaEn(m)))}`);
  o.push(`<polyline data-parte="curva" points="${pts.join(' ')}" fill="none" stroke="${T.tinta}" stroke-width="2.2" stroke-linejoin="round"/>`);
  // amplitud acotada
  if (e.modo !== 'duodecimos') o.push(cota(X1 - 10, cy(PM.h), X1 - 10, cy(BM.h), `A ${num(A)} m`, { desplaza: [-44, 18], p: 'curva' }));
  o.push(etiqueta(cx(BM.hora) + 46, cy(BM.h) + 16, `BM ${num(BM.h)} m`), etiqueta(cx(PM.hora) - 46, cy(PM.h) - 14, `PM ${num(PM.h)} m`));
  // la hora elegida
  o.push(el('m-linea', 'line', { y1: cy(4) - 6, y2: cy(0), stroke: T.magenta, 'stroke-width': 1.6 }, c), el('m-punto', 'circle', { 'data-parte': 'altura', r: 6, fill: T.magenta, stroke: T.papel, 'stroke-width': 1.5 }, c));
  const txt = c['m-etq-t'].texto;
  const w = anchoTexto(txt, TXT.cota, 'mono') + 10;
  o.push(el('m-etq', 'g', { 'data-parte': 'altura' }, c, `<rect x="${f1(-w / 2)}" y="${f1(18 - (TXT.cota + 6) / 2)}" width="${f1(w)}" height="${TXT.cota + 6}" fill="${T.papel}" stroke="${T.magenta}" stroke-width=".8"/>` +
    el('m-etq-t', 'text', { x: 0, y: f1(18 + TXT.cota * 0.36), 'font-size': TXT.cota, 'font-weight': 600, 'text-anchor': 'middle', fill: T.magenta, class: 'lc-mono' }, c)));
  o.push(cierra());
  return o.join('');
}

// --- corte -------------------------------------------------------------------------------------------------------------
const KW = 358;
const KH = 216;
const K = 30; // px por metro
const CERO = 150;
const FONDO = CERO + SONDA * K;
const QX = 214;

/** Lo que se mueve en el corte a una hora. */
function cambiosCorte(hora) {
  const altura = alturaEn(hora);
  const { bajoQuilla } = aguaBajoQuilla({ sondaCarta: SONDA, altura, calado: CALADO });
  const nivel = CERO - altura * K;
  // el barco flota con su flotación en el nivel del agua; si no hay agua bajo la quilla, se queda apoyado en el fondo
  const flot = Math.min(nivel, FONDO - CALADO * K);
  const quilla = flot + CALADO * K;
  const flota = bajoQuilla > 0.02;
  const ver = (b) => (b ? 1 : 0);
  return {
    'c-agua': { y: f1(nivel), height: f1(FONDO - nivel) },
    'c-nivel': { y1: f1(nivel), y2: f1(nivel) },
    'c-barco': { transform: `translate(0 ${f1(flot)})` },
    'c-marea': { opacity: ver(altura > 0.05) },
    'c-marea-l': { y1: f1(nivel) },
    'c-marea-tope': { y1: f1(nivel), y2: f1(nivel) },
    'c-marea-e': { transform: `translate(116 ${f1((nivel + CERO) / 2)})` },
    'c-marea-t': { texto: `marea ${num(altura, 2)} m` },
    'c-quilla': { opacity: ver(flota) },
    'c-quilla-l': { y1: f1(quilla) },
    'c-quilla-tope': { y1: f1(quilla), y2: f1(quilla) },
    'c-quilla-e': { transform: `translate(${QX - 6} ${f1((quilla + FONDO) / 2)})` },
    'c-quilla-t': { texto: `${num(Math.max(0, bajoQuilla), 2)} m` },
    'c-fondo': { opacity: ver(!flota) },
  };
}

/** Cota vertical que se estira: línea, tope fijo, tope móvil y etiqueta centrada (un grupo que se traslada). */
function cotaMovil(k, x, yFijo, color, c, texto, { p }) {
  const w = anchoTexto(texto, TXT.cota, 'mono') + 10;
  const tope = (y) => `x1="${x - 6}" x2="${x + 6}" y1="${f1(y)}" y2="${f1(y)}"`;
  return el(k, 'g', { 'data-parte': p }, c, el(`${k}-l`, 'line', { x1: x, x2: x, y2: f1(yFijo), stroke: color, 'stroke-width': 1 }, c) +
    `<line ${tope(yFijo)} stroke="${color}" stroke-width="1.2"/>` + el(`${k}-tope`, 'line', { x1: x - 6, x2: x + 6, stroke: color, 'stroke-width': 1.2 }, c) +
    el(`${k}-e`, 'g', {}, c, `<rect x="${f1(-w / 2)}" y="${f1(-(TXT.cota + 6) / 2)}" width="${f1(w)}" height="${TXT.cota + 6}" fill="${T.papel}" stroke="${color}" stroke-width=".8"/>` +
      el(`${k}-t`, 'text', { x: 0, y: f1(TXT.cota * 0.36), 'font-size': TXT.cota, 'font-weight': 600, 'text-anchor': 'middle', fill: color, class: 'lc-mono' }, c)));
}

function corte(e, r, hora) {
  const c = cambiosCorte(hora);
  const alt = `Corte del bajo: sonda de la carta ${num(SONDA)} m, marea ${num(r.altura, 2)} m, calado ${num(CALADO)} m; ${r.bajoQuilla > 0.02 ? `quedan ${num(r.bajoQuilla, 2)} m bajo la quilla` : 'el barco toca fondo'}.`;
  const { out: o, pt, cierra } = lienzo(KW, KH, alt, { fondo: T.papel });
  o.push(el('c-agua', 'rect', { x: 0, width: KW, fill: T.agua }, c), el('c-nivel', 'line', { x1: 0, x2: KW, stroke: T.lineaAgua, 'stroke-width': 1.4 }, c));
  o.push(tierra(`M0,${f1(FONDO)} Q179,${f1(FONDO - 8)} ${KW},${f1(FONDO)} L${KW},${KH} L0,${KH}Z`, pt));
  o.push(`<line data-parte="cero" x1="0" y1="${CERO}" x2="${KW}" y2="${CERO}" stroke="${T.magenta}" stroke-width="1.2" stroke-dasharray="6 4"/>`, rotulo(KW - 12, CERO - 6, 'cero hidrográfico', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.magenta, p: 'cero' }));
  // barco con su calado (dibujado con la flotación en y = 0; el grupo lo sube y lo baja)
  o.push(el('c-barco', 'g', {}, c, `<path d="M${QX - 40},-14 L${QX + 40},-14 L${QX + 28},${CALADO * K} L${QX - 28},${CALADO * K}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    rotulo(QX, -22, `calado ${num(CALADO)} m`, { size: TXT.min, estilo: 'mono' })));
  // cotas
  o.push(cota(30, CERO, 30, FONDO, `sonda ${num(SONDA)} m`, { color: T.tinta, p: 'sonda', desplaza: [52, 0] }));
  o.push(cotaMovil('c-marea', 118, CERO, T.tinta, c, c['c-marea-t'].texto, { p: 'altura' }));
  o.push(cotaMovil('c-quilla', QX + 52, FONDO, T.verdeTxt, c, c['c-quilla-t'].texto, { p: 'quilla' }));
  o.push(el('c-fondo', 'g', {}, c, cartela(QX, FONDO + 14, 'TOCAS FONDO', null, { color: T.rojoTxt, p: 'quilla' })));
  o.push(cierra());
  return o.join('');
}

/** Lo que pasa en cada hora de la creciente, según lo que enseña la variante. */
function hitosMarea(modo) {
  const DOCE = [0, 1, 3, 6, 9, 11, 12];
  return DOCE.map((d, i) => {
    const hora = BM.hora + i * 60;
    const h = alturaEn(hora);
    const { bajoQuilla } = aguaBajoQuilla({ sondaCarta: SONDA, altura: h, calado: CALADO });
    const quilla = bajoQuilla > 0.02 ? `quedan ${num(bajoQuilla, 2)} m bajo la quilla` : 'tocas fondo';
    let nombre;
    let texto;
    if (i === 0) { nombre = `Bajamar, ${hhmm(hora)}`; texto = `Lo más bajo: ${num(h, 2)} m sobre el cero hidrográfico.`; }
    else if (i === 6) { nombre = `Pleamar, ${hhmm(hora)}`; texto = `Arriba del todo: ${num(h, 2)} m. Desde aquí empieza a bajar (vaciante).`; }
    else {
      const sube = h - alturaEn(hora - 60);
      nombre = `${hhmm(hora)}: ${[1, 2, 3, 3, 2, 1][i - 1]}/12 en esa hora`;
      texto = i === 3 ? `A mitad de la creciente ha subido la mitad (${d}/12): ${num(h, 2)} m. En las horas centrales sube más deprisa.` : `En esa hora ha subido ${num(sube, 2)} m; lleva ${d}/12 de la amplitud: ${num(h, 2)} m.`;
    }
    if (modo === 'sonda') texto = `${i === 0 || i === 6 ? texto.split(':')[0] : `Altura ${num(h, 2)} m`}: sonda ${num(SONDA)} + ${num(h, 2)} = ${num(SONDA + h, 2)} m; con ${num(CALADO)} m de calado, ${quilla}.`;
    return { t: i * 2, nombre, texto };
  });
}

export const marea = {
  mandos: [{ id: 'hora', tipo: 'rango', etiqueta: 'Hora', min: BM.hora, max: PM.hora, paso: 15, texto: (v) => hhmm(v), extremos: [`BM ${hhmm(BM.hora)}`, `PM ${hhmm(PM.hora)}`] }],
  estado: (spec) => ({ modo: spec.modo ?? 'curva', hora: Number(spec.hora ?? BM.hora + 2 * 60) }),
  calcular: (e) => {
    const altura = alturaEn(e.hora);
    return { altura, ...aguaBajoQuilla({ sondaCarta: SONDA, altura, calado: CALADO }), subida: (altura - BM.h) / A };
  },
  pie: (e) => PIES[e.modo] ?? PIES.curva,
  dibujar(e, r, { t = null } = {}) {
    const frac = Math.round(r.subida * 12);
    // en la animación se dibuja el instante t (con el agua que sube); si no, la hora del mando
    const hora = t == null ? e.hora : horaDe(t);
    const ea = { ...e, anima: t != null };
    return {
      vistas: [{ svg: curva(ea, r, hora), pie: 'La curva de la marea' }, { svg: corte(ea, r, hora), pie: 'El bajo, en corte' }],
      apiladas: true,
      lectura: `A las ${hhmm(e.hora)} la marea ha subido ${num(r.altura - BM.h, 2)} m desde la bajamar (unos ${frac}/12 de la amplitud): altura ${num(r.altura, 2)} m. Sonda = ${num(SONDA)} + ${num(r.altura, 2)} = ${num(r.sonda, 2)} m; con ${num(CALADO)} m de calado, ${r.bajoQuilla > 0.02 ? `te quedan ${num(r.bajoQuilla, 2)} m bajo la quilla` : 'tocas fondo'}.`,
      casillas: [['Altura de la marea', `${num(r.altura, 2)} m`], ['Sonda en ese momento', `${num(r.sonda, 2)} m`], ['Bajo la quilla', r.bajoQuilla > 0.02 ? `${num(r.bajoQuilla, 2)} m` : 'tocas fondo']],
    };
  },
  // La creciente entera como animación: el tiempo es la hora (2 s por hora).
  animacion: {
    mando: 'hora',
    pista(e) {
      const ea = { ...e, anima: true };
      return pista({
        duracion: DUR,
        momento: (t) => `a las ${hhmm(horaDe(t))}`,
        hitos: hitosMarea(e.modo),
        svg: (t) => curva(ea, marea.calcular({ hora: horaDe(t) }), horaDe(t)) + corte(ea, marea.calcular({ hora: horaDe(t) }), horaDe(t)),
        cambios: (t) => ({ ...cambiosCurva(ea, horaDe(t)), ...cambiosCorte(horaDe(t)) }),
        valor: horaDe,
        tiempo: tiempoDe,
      });
    },
  },
  prediccion: () => ({
    enunciado: 'A mitad de la creciente (3 horas después de la bajamar), ¿cuánto ha subido la marea?',
    opciones: { a: 'Un cuarto de la amplitud', b: 'La mitad de la amplitud', c: 'Tres cuartos de la amplitud' },
    correcta: 'b',
    tras: 'Con la fórmula de la tabla, sen²(45°) = 0,5: a mitad de la creciente ha subido justo la mitad (por los duodécimos, 1 + 2 + 3 = 6/12). Mueve la hora y mira qué pasa con el agua bajo la quilla.',
    estado: { hora: BM.hora },
  }),
  partes: {
    curva: 'La curva de la marea: sube despacio al principio, deprisa en las horas centrales y despacio al final.',
    cero: 'Cero hidrográfico: el nivel desde el que se miden las sondas de la carta y las alturas de la marea.',
    sonda: 'Sonda de la carta: la profundidad desde el cero hidrográfico.',
    altura: 'Altura de la marea: lo que hay por encima del cero hidrográfico en ese momento.',
    quilla: 'Agua bajo la quilla: sonda de la carta + altura de la marea − calado.',
  },
};
