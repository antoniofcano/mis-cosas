// Efecto de la hélice animado (spec { tipo: 'helice', sentido, marcha }): a la izquierda, la hélice vista desde popa
// girando; a la derecha, el yate parado que da avante o atrás con el timón a la vía y cuya popa cae por la presión
// lateral de las palas. A qué banda cae lo dice src/nautical/helice.js (la regla del examen); cuánto y cómo gira, el
// modelo de src/nautical/maniobra.js (andarHelice), que lo hace girar alrededor de su punto de giro.

import { caidaPopa } from '../../nautical/helice.js';
import { andarHelice, enInstante, puntoCasco, YATE } from '../../nautical/maniobra.js';
import { T, TXT, lienzo, rotulo, cartela, flecha, arcoD, pol, cascoPlanta, f1 } from '../estilo-c.js';
import { pista, el, aparece, trazoHasta, situa } from './pista.js';

const W = 358;
const H = 300;
const DUR = 12;
const GIRO_VISUAL = 1.1; // vueltas por segundo de la hélice en el dibujo (no es su régimen real)

export function pistaHelice(spec) {
  const dex = spec.sentido !== 'levogira';
  const atras = spec.marcha === 'atras';
  const marcha = atras ? 'atras' : 'avante';
  const { popa } = caidaPopa({ marcha, sentido: dex ? 'dextrogira' : 'levogira', timon: 'via' });
  const proa = popa === 'babor' ? 'estribor' : 'babor';
  // vista desde popa: dextrógira avante gira a la derecha (horario); dando atrás, al revés
  const horario = dex !== atras;
  const ms = andarHelice({ marcha, popa, duracion: DUR });
  const L = YATE.eslora;
  const k = 8; // px por metro
  const Lpx = L * k;
  // el barco empieza donde le deja sitio para moverse: arriba si va atrás, abajo si va avante
  const [bx0, by0] = [258, atras ? 112 : 206];
  const P = (x, y) => [bx0 + x * k, by0 - y * k];
  const pasoT = 0.2;
  const idx = [];
  for (let s = 0; s <= DUR + 1e-9; s += pasoT) idx.push(enInstante(ms, s));
  const tiempos = idx.map((q) => q.t);
  const ptsPopa = idx.map((q) => P(...puntoCasco(q, -0.5)));
  const ptsProa = idx.map((q) => P(...puntoCasco(q, 0.5)));
  const fin = ms[ms.length - 1];
  const caidaFin = Math.abs(fin.rumbo);
  const recorrido = Math.hypot(fin.x, fin.y);
  const hitos = atras
    ? [
      { t: 0, nombre: 'Máquina atrás', texto: `Barco parado y timón a la vía. Dando atrás, la hélice ${dex ? 'dextrógira' : 'levógira'} gira a la ${horario ? 'derecha' : 'izquierda'} vista desde popa.` },
      { t: 1.5, nombre: `La popa cae a ${popa}`, texto: `La presión lateral de las palas empuja la popa a ${popa}, y con fuerza: sin arrancada atrás, el timón casi no gobierna.` },
      { t: 7, nombre: `La proa cae a ${proa}`, texto: `En ${DUR} s la proa ha caído unos ${Math.round(caidaFin)}° a ${proa} y el barco solo ha retrocedido ${Math.round(recorrido)} m.` },
    ]
    : [
      { t: 0, nombre: 'Máquina avante', texto: `Barco parado y timón a la vía. Avante, la hélice ${dex ? 'dextrógira' : 'levógira'} gira a la ${horario ? 'derecha' : 'izquierda'} vista desde popa.` },
      { t: 1.5, nombre: `La popa cae a ${popa}`, texto: `La presión lateral de las palas empuja la popa a ${popa}, poco: la proa cae algo a ${proa}.` },
      { t: 7, nombre: 'Con arrancada, apenas se nota', texto: `Al coger arrancada, el timón y la quilla lo aguantan: en ${DUR} s solo ha caído unos ${Math.round(caidaFin)}°. Avante, el efecto es pequeño.` },
    ];

  function cambios(t) {
    const q = enInstante(ms, t);
    const [cx, cy] = P(q.x, q.y);
    const giro = (horario ? 1 : -1) * 360 * GIRO_VISUAL * t;
    return {
      barco: { transform: situa(cx, cy, q.rumbo) },
      palas: { transform: `rotate(${f1(giro % 360)})` },
      'estela-popa': { points: trazoHasta(ptsPopa, tiempos, t, P(...puntoCasco(q, -0.5))) },
      'estela-proa': { points: trazoHasta(ptsProa, tiempos, t, P(...puntoCasco(q, 0.5))) },
      chorro: { 'stroke-dashoffset': f1(-(t * 28) % 36) },
      caida: { texto: `proa ${Math.round(Math.abs(q.rumbo))}° a ${proa}` },
      flecha: { opacity: aparece(t, hitos[1].t) },
      cartela: { opacity: aparece(t, hitos[2].t) },
    };
  }

  const alt = `Animación: a la izquierda, la hélice ${dex ? 'dextrógira' : 'levógira'} vista desde popa girando ${horario ? 'a la derecha' : 'a la izquierda'}; a la derecha, el barco parado da ${atras ? 'atrás' : 'avante'} con el timón a la vía y su popa cae a ${popa} (estela magenta), ${atras ? 'mucho' : 'poco'}: la proa cae a ${proa}.`;

  function svg(t) {
    const c0 = cambios(t);
    const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    // --- la hélice, vista desde popa
    const [hx, hy] = [80, 130];
    out.push(rotulo(hx, 30, 'VISTA DESDE POPA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
    out.push(`<circle cx="${hx}" cy="${hy}" r="52" fill="${T.agua}" stroke="${T.tinta}" stroke-width="1"/>`);
    const pala = (g) => `<path d="M0,0 C-10,-17 -8,-38 0,-44 C10,-38 12,-17 0,0Z" transform="rotate(${g})" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.3" stroke-linejoin="round"/>`;
    out.push(`<g data-parte="helice" transform="translate(${hx} ${hy})">${el('palas', 'g', {}, c0, `${pala(0)}${pala(120)}${pala(240)}<circle r="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/>`)}</g>`);
    // sentido de giro: flecha curva (no depende de la animación)
    const [a0, a1] = horario ? [300, 60] : [60, 300];
    const d = horario ? arcoD(hx, hy, 64, a0, a1) : arcoD(hx, hy, 64, a1, a0);
    const [ex, ey] = pol(hx, hy, a1, 64);
    const tg = a1 + (horario ? 90 : -90);
    const [px, py] = pol(ex, ey, tg, 9);
    const [qx, qy] = pol(ex, ey, tg + 150, 7);
    const [rx, ry] = pol(ex, ey, tg - 150, 7);
    out.push(`<path d="${d}" fill="none" stroke="${T.magenta}" stroke-width="1.6"/><polygon points="${f1(px)},${f1(py)} ${f1(qx)},${f1(qy)} ${f1(rx)},${f1(ry)}" fill="${T.magenta}"/>`);
    out.push(rotulo(hx, 218, horario ? 'gira a la derecha' : 'gira a la izquierda', { size: TXT.nota, estilo: 'serif', italic: true }),
      rotulo(hx, 234, `${dex ? 'dextrógira' : 'levógira'}, ${atras ? 'atrás' : 'avante'}`, { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
    out.push(`<line x1="160" y1="20" x2="160" y2="${H - 20}" stroke="${T.tinta}" stroke-width=".6" stroke-dasharray="3 4"/>`);
    // --- el barco en planta: su sitio de salida, las estelas de proa y popa y el barco que se mueve
    out.push(rotulo(bx0, 30, 'EN PLANTA', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }));
    out.push(`<g transform="translate(${bx0} ${by0})"><path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="none" stroke="${T.apagado}" stroke-width="1" stroke-dasharray="4 3"/></g>`);
    out.push(el('estela-proa', 'polyline', { fill: 'none', stroke: T.tinta, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, c0));
    out.push(el('estela-popa', 'polyline', { fill: 'none', stroke: T.magenta, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }, c0));
    // el barco, con el chorro de la hélice (hacia popa avante, hacia proa dando atrás)
    const yP = Lpx / 2;
    const sx = popa === 'babor' ? -1 : 1;
    const chorro = atras ? `M-6,${f1(yP - 4)} L-6,${f1(yP - 34)} M6,${f1(yP - 4)} L6,${f1(yP - 34)}` : `M-5,${f1(yP + 6)} L-5,${f1(yP + 40)} M5,${f1(yP + 6)} L5,${f1(yP + 40)}`;
    out.push(el('barco', 'g', { 'data-parte': 'barco' }, c0, el('chorro', 'path', { d: chorro, fill: 'none', stroke: T.lineaAgua, 'stroke-width': 2.4, 'stroke-dasharray': '8 10', 'stroke-linecap': 'round' }, c0) +
      `<path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<line x1="0" y1="${f1(-Lpx / 2 + 5)}" x2="0" y2="${f1(Lpx / 2 - 3)}" stroke="${T.tinta}" stroke-width=".6"/>` +
      `<rect x="-9" y="${f1(yP - 7)}" width="18" height="5" rx="2" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1"/>` +
      `<line x1="0" y1="${f1(yP)}" x2="0" y2="${f1(yP + 10)}" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/>` +
      // hacia dónde cae la popa: la flecha va pegada a la popa y se mueve con el barco
      el('flecha', 'g', {}, c0, flecha(sx * 12, yP - 10, sx * 50, yP - 10, { color: T.magenta, w: 2.4, p: 'popa' }))));
    out.push(el('caida', 'text', { x: W - 14, y: H - 16, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'end', fill: T.tinta, class: 'lc-mono' }, c0));
    out.push(el('cartela', 'g', {}, c0, cartela(80, 270, 'LA POPA CAE', `a ${popa}${atras ? ', con fuerza' : ', poco'}`, { color: T.magenta, ancho: 136 })));
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion: DUR, hitos, svg, cambios, datos: { popa, proa, caidaFin, recorrido } });
}
