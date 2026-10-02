// Mareas: un mando de hora. Curva de la marea y corte del fondo enlazados: sonda de la carta + altura de la marea
// = sonda del momento; menos el calado, agua bajo la quilla. Valores con la fórmula de la tabla oficial
// (C = A·sen²(90°·I/D)). Variantes curva, duodecimos y sonda; «fases» (vivas y muertas) sigue fija.
import { correccionTabla, aguaBajoQuilla, twelfthsFraction } from '../../nautical/tides.js';
import { svgOpen, texto, num, f1 } from './kit.js';

const BM = { hora: 8 * 60, h: 0.6 };
const PM = { hora: 14 * 60, h: 3.4 };
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

function curva(e, r) {
  const W = 320;
  const H = 190;
  const x = (m) => 30 + ((m - BM.hora) / D) * 270;
  const y = (h) => 160 - (h / 4) * 140;
  const o = [svgOpen(W, H, 'Curva de la marea entre la bajamar y la pleamar')];
  o.push(`<line x1="30" y1="${y(0)}" x2="300" y2="${y(0)}" stroke="var(--l-p)" stroke-dasharray="6 4" data-parte="cero"/>`);
  if (e.modo === 'duodecimos') {
    for (let i = 1; i <= 6; i++) {
      const h0 = BM.h + A * twelfthsFraction(i - 1);
      const h1 = BM.h + A * twelfthsFraction(i);
      o.push(`<rect x="${f1(x(BM.hora + (i - 1) * 60) + 3)}" y="${f1(y(h1))}" width="${f1(270 / 6 - 6)}" height="${f1(y(h0) - y(h1))}" fill="var(--l-v)" opacity=".25"/>`, texto(x(BM.hora + (i - 0.5) * 60), y(h1) - 4, `${[1, 2, 3, 3, 2, 1][i - 1]}/12`, { size: 12, color: 'var(--l-v)' }));
    }
  }
  const pts = [];
  for (let m = BM.hora; m <= PM.hora; m += 10) pts.push(`${f1(x(m))},${f1(y(BM.h + correccionTabla(A, m - BM.hora, D)))}`);
  o.push(`<polyline data-parte="curva" points="${pts.join(' ')}" fill="none" stroke="var(--l-v)" stroke-width="3"/>`);
  o.push(`<line x1="${f1(x(e.hora))}" y1="16" x2="${f1(x(e.hora))}" y2="${y(0)}" stroke="var(--l-r)" stroke-width="2"/>`, `<circle data-parte="altura" cx="${f1(x(e.hora))}" cy="${f1(y(r.altura))}" r="6" fill="var(--l-r)"/>`);
  o.push(texto(x(BM.hora), H - 8, `BM ${hhmm(BM.hora)} · ${num(BM.h)} m`, { anchor: 'start', size: 12 }), texto(x(PM.hora), H - 8, `PM ${hhmm(PM.hora)} · ${num(PM.h)} m`, { anchor: 'end', size: 12 }));
  o.push(texto(x(e.hora) + (e.hora > 12 * 60 ? -8 : 8), 30, `${hhmm(e.hora)} · ${num(r.altura, 2)} m`, { anchor: e.hora > 12 * 60 ? 'end' : 'start', size: 15, weight: 700, color: 'var(--l-r)', p: 'altura' }));
  o.push('</svg>');
  return o.join('');
}

function corte(e, r) {
  const W = 320;
  const H = 200;
  const k = 30; // px por metro
  const cero = 150;
  const fondoY = cero + SONDA * k;
  const nivel = cero - r.altura * k;
  const o = [svgOpen(W, H, 'Corte: sonda de la carta, marea y calado')];
  o.push(`<rect x="0" y="${f1(nivel)}" width="${W}" height="${f1(fondoY - nivel)}" fill="var(--l-mar)"/>`);
  o.push(`<path d="M0,${f1(fondoY)} Q160,${f1(fondoY - 8)} 320,${f1(fondoY)} L320,${H} L0,${H}Z" fill="var(--land)"/>`);
  o.push(`<line data-parte="cero" x1="0" y1="${cero}" x2="${W}" y2="${cero}" stroke="var(--l-p)" stroke-dasharray="6 4"/>`, texto(6, cero - 5, 'cero hidrográfico', { anchor: 'start', size: 13, color: 'var(--l-p)', p: 'cero' }));
  // barco con su calado
  const qx = 210;
  const quilla = nivel + CALADO * k;
  o.push(`<path d="M${qx - 40},${f1(nivel - 14)} L${qx + 40},${f1(nivel - 14)} L${qx + 28},${f1(quilla)} L${qx - 28},${f1(quilla)}Z" fill="var(--l-casco)" stroke="var(--text)"/>`);
  // cotas
  const cota = (xx, y0, y1, t, color, p) => `<line data-parte="${p}" x1="${xx}" y1="${f1(y0)}" x2="${xx}" y2="${f1(y1)}" stroke="${color}" stroke-width="3"/>` + texto(xx + 6, (y0 + y1) / 2 + 5, t, { anchor: 'start', size: 13, color, p });
  o.push(cota(40, cero, fondoY, `sonda carta ${num(SONDA)} m`, 'var(--l-a)', 'sonda'));
  if (r.altura > 0.05) o.push(cota(110, nivel, cero, `marea ${num(r.altura, 2)} m`, 'var(--l-v)', 'altura'));
  if (r.bajoQuilla > 0.02) o.push(cota(qx + 48, quilla, fondoY, `${num(r.bajoQuilla, 2)} m`, 'var(--l-m)', 'quilla'));
  else o.push(texto(qx, fondoY + 22, '¡tocas fondo!', { size: 15, weight: 700, color: 'var(--l-r)', p: 'quilla' }));
  o.push(texto(qx, nivel - 20, `calado ${num(CALADO)} m`, { size: 13 }));
  o.push('</svg>');
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
