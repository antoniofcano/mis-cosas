// Mareas: un mando de hora. Curva de la marea y corte del fondo enlazados: sonda de la carta + altura de la marea
// = sonda del momento; menos el calado, agua bajo la quilla. Valores con la fórmula de la tabla oficial
// (C = A·sen²(90°·I/D)). Variantes curva, duodecimos y sonda; «fases» (vivas y muertas) sigue fija.
import { correccionTabla, aguaBajoQuilla, twelfthsFraction } from '../../nautical/tides.js';
import { num } from './kit.js';
import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, tierra, f1 } from '../estilo-c.js';

const BM = { hora: 8 * 60, h: 0.6 };
const PM = { hora: 14 * 60, h: 3.4 };
/** La marea del ejemplo (la usa también el marco de la lámina). */
export const MAREA_EJEMPLO = { bm: BM, pm: PM };
const A = PM.h - BM.h;
const D = PM.hora - BM.hora;
const SONDA = 1.2; // sonda de la carta en el bajo
const CALADO = 1.8;
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const PIES = {
  curva: 'Amplitud: diferencia entre pleamar y bajamar. Duración: tiempo entre una y otra (creciente o vaciante). En el anuario las horas vienen en UT: súmale el adelanto para la hora oficial.',
  duodecimos: 'Aproximación para una marea semidiurna de unas 6 horas: cada hora sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud. La mitad de la subida ocurre en las dos horas centrales.',
  sonda: 'Las sondas de la carta se miden desde el cero hidrográfico. El agua que tienes en un momento es esa sonda más la altura de la marea a esa hora; restando tu calado sabes cuánto queda bajo la quilla.',
};

// Estilo C (docs/ESTILO-LAMINAS.md): papel cuadriculado como el de una tabla, horas y alturas en monoespaciada,
// la hora elegida en magenta y las cotas de la sonda, la marea y el agua bajo la quilla.
function curva(e, r) {
  const W = 358;
  const H = 236;
  const X0 = 56;
  const X1 = 334;
  const x = (m) => X0 + ((m - BM.hora) / D) * (X1 - X0);
  const y = (h) => 186 - (h / 4) * 150;
  const alt = e.modo === 'duodecimos'
    ? `Curva de la marea de la bajamar de las ${hhmm(BM.hora)} (${num(BM.h)} m) a la pleamar de las ${hhmm(PM.hora)} (${num(PM.h)} m), con una franja por hora: 1, 2, 3, 3, 2 y 1 doceavos de la amplitud. A las ${hhmm(e.hora)}, ${num(r.altura, 2)} m.`
    : `Curva de la marea de la bajamar de las ${hhmm(BM.hora)} (${num(BM.h)} m) a la pleamar de las ${hhmm(PM.hora)} (${num(PM.h)} m). A las ${hhmm(e.hora)}, ${num(r.altura, 2)} m.`;
  const { out: o, ray, cierra } = lienzo(W, H, alt);
  // cuadrícula: metros y horas
  for (let h = 1; h <= 4; h++) o.push(`<line x1="${X0}" y1="${y(h)}" x2="${X1}" y2="${y(h)}" stroke="${T.apagado}" stroke-width=".5" stroke-dasharray="2 3"/>`, rotulo(X0 - 6, y(h) + 4, `${h} m`, { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.apagado }));
  for (let m = BM.hora; m <= PM.hora; m += 60) {
    o.push(`<line x1="${f1(x(m))}" y1="${y(4)}" x2="${f1(x(m))}" y2="${y(0)}" stroke="${T.apagado}" stroke-width=".5" stroke-dasharray="2 3"/>`);
    if ((m - BM.hora) % 120 === 0) o.push(rotulo(x(m), 204, hhmm(m), { size: TXT.min, estilo: 'mono', color: T.apagado }));
  }
  o.push(`<line data-parte="cero" x1="${X0}" y1="${y(0)}" x2="${X1}" y2="${y(0)}" stroke="${T.magenta}" stroke-width="1.2" stroke-dasharray="6 4"/>`, rotulo(X0 - 6, y(0) + 4, '0 m', { size: TXT.min, estilo: 'mono', anchor: 'end', color: T.magenta, p: 'cero' }));
  if (e.modo === 'duodecimos') {
    for (let i = 1; i <= 6; i++) {
      const h0 = BM.h + A * twelfthsFraction(i - 1);
      const h1 = BM.h + A * twelfthsFraction(i);
      const xa = x(BM.hora + (i - 1) * 60) + 3;
      const w = (X1 - X0) / 6 - 6;
      o.push(`<g data-parte="doceavos"><rect x="${f1(xa)}" y="${f1(y(h1))}" width="${f1(w)}" height="${f1(y(h0) - y(h1))}" fill="${T.agua}" stroke="${T.tinta}" stroke-width=".8"/><rect x="${f1(xa)}" y="${f1(y(h1))}" width="${f1(w)}" height="${f1(y(h0) - y(h1))}" fill="${ray}" opacity=".4"/>` +
        rotulo(xa + w / 2, y(h1) - 5, `${[1, 2, 3, 3, 2, 1][i - 1]}/12`, { size: TXT.min, estilo: 'mono', weight: 700 }) + '</g>');
    }
  }
  const pts = [];
  for (let m = BM.hora; m <= PM.hora; m += 10) pts.push(`${f1(x(m))},${f1(y(BM.h + correccionTabla(A, m - BM.hora, D)))}`);
  o.push(`<polyline data-parte="curva" points="${pts.join(' ')}" fill="none" stroke="${T.tinta}" stroke-width="2.2" stroke-linejoin="round"/>`);
  // amplitud acotada
  if (e.modo !== 'duodecimos') o.push(cota(X1 - 10, y(PM.h), X1 - 10, y(BM.h), `A ${num(A)} m`, { desplaza: [-44, 18], p: 'curva' }));
  o.push(etiqueta(x(BM.hora) + 46, y(BM.h) + 16, `BM ${num(BM.h)} m`), etiqueta(x(PM.hora) - 46, y(PM.h) - 14, `PM ${num(PM.h)} m`));
  // la hora elegida
  o.push(`<line x1="${f1(x(e.hora))}" y1="${y(4) - 6}" x2="${f1(x(e.hora))}" y2="${y(0)}" stroke="${T.magenta}" stroke-width="1.6"/>`, `<circle data-parte="altura" cx="${f1(x(e.hora))}" cy="${f1(y(r.altura))}" r="6" fill="${T.magenta}" stroke="${T.papel}" stroke-width="1.5"/>`);
  const tx = Math.min(Math.max(x(e.hora), X0 + 60), X1 - 60);
  o.push(etiqueta(tx, 18, `${hhmm(e.hora)} · ${num(r.altura, 2)} m`, { color: T.magenta, p: 'altura' }));
  o.push(cierra());
  return o.join('');
}

function corte(e, r) {
  const W = 358;
  const H = 216;
  const k = 30; // px por metro
  const cero = 150;
  const fondoY = cero + SONDA * k;
  const nivel = cero - r.altura * k;
  const alt = `Corte del bajo: sonda de la carta ${num(SONDA)} m, marea ${num(r.altura, 2)} m, calado ${num(CALADO)} m; ${r.bajoQuilla > 0.02 ? `quedan ${num(r.bajoQuilla, 2)} m bajo la quilla` : 'el barco toca fondo'}.`;
  const { out: o, pt, cierra } = lienzo(W, H, alt, { fondo: T.papel });
  o.push(`<rect x="0" y="${f1(nivel)}" width="${W}" height="${f1(fondoY - nivel)}" fill="${T.agua}"/>`, `<line x1="0" y1="${f1(nivel)}" x2="${W}" y2="${f1(nivel)}" stroke="${T.lineaAgua}" stroke-width="1.4"/>`);
  o.push(tierra(`M0,${f1(fondoY)} Q179,${f1(fondoY - 8)} ${W},${f1(fondoY)} L${W},${H} L0,${H}Z`, pt));
  o.push(`<line data-parte="cero" x1="0" y1="${cero}" x2="${W}" y2="${cero}" stroke="${T.magenta}" stroke-width="1.2" stroke-dasharray="6 4"/>`, rotulo(W - 12, cero - 6, 'cero hidrográfico', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.magenta, p: 'cero' }));
  // barco con su calado
  const qx = 214;
  const quilla = nivel + CALADO * k;
  o.push(`<path d="M${qx - 40},${f1(nivel - 14)} L${qx + 40},${f1(nivel - 14)} L${qx + 28},${f1(quilla)} L${qx - 28},${f1(quilla)}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`);
  o.push(rotulo(qx, nivel - 22, `calado ${num(CALADO)} m`, { size: TXT.min, estilo: 'mono' }));
  // cotas
  o.push(cota(30, cero, 30, fondoY, `sonda ${num(SONDA)} m`, { color: T.tinta, p: 'sonda', desplaza: [52, 0] }));
  if (r.altura > 0.05) o.push(cota(118, nivel, 118, cero, `marea ${num(r.altura, 2)} m`, { color: T.tinta, p: 'altura', desplaza: [-2, 0] }));
  if (r.bajoQuilla > 0.02) o.push(cota(qx + 52, quilla, qx + 52, fondoY, `${num(r.bajoQuilla, 2)} m`, { color: T.verdeTxt, p: 'quilla', desplaza: [-58, 0] }));
  else o.push(cartela(qx, fondoY + 14, 'TOCAS FONDO', null, { color: T.rojoTxt, p: 'quilla' }));
  o.push(cierra());
  return o.join('');
}

export const marea = {
  mandos: [{ id: 'hora', tipo: 'rango', etiqueta: 'Hora', min: BM.hora, max: PM.hora, paso: 15, texto: (v) => hhmm(v), extremos: [`BM ${hhmm(BM.hora)}`, `PM ${hhmm(PM.hora)}`] }],
  estado: (spec) => ({ modo: spec.modo ?? 'curva', hora: Number(spec.hora ?? BM.hora + 2 * 60) }),
  calcular: (e) => {
    const altura = BM.h + correccionTabla(A, e.hora - BM.hora, D);
    return { altura, ...aguaBajoQuilla({ sondaCarta: SONDA, altura, calado: CALADO }), subida: (altura - BM.h) / A };
  },
  pie: (e) => PIES[e.modo] ?? PIES.curva,
  dibujar(e, r) {
    const frac = Math.round(r.subida * 12);
    return {
      vistas: [{ svg: curva(e, r), pie: 'La curva de la marea' }, { svg: corte(e, r), pie: 'El bajo, en corte' }],
      apiladas: true,
      lectura: `A las ${hhmm(e.hora)} la marea ha subido ${num(r.altura - BM.h, 2)} m desde la bajamar (unos ${frac}/12 de la amplitud): altura ${num(r.altura, 2)} m. Sonda = ${num(SONDA)} + ${num(r.altura, 2)} = ${num(r.sonda, 2)} m; con ${num(CALADO)} m de calado, ${r.bajoQuilla > 0.02 ? `te quedan ${num(r.bajoQuilla, 2)} m bajo la quilla` : 'tocas fondo'}.`,
      casillas: [['Altura de la marea', `${num(r.altura, 2)} m`], ['Sonda en ese momento', `${num(r.sonda, 2)} m`], ['Bajo la quilla', r.bajoQuilla > 0.02 ? `${num(r.bajoQuilla, 2)} m` : 'tocas fondo']],
    };
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
