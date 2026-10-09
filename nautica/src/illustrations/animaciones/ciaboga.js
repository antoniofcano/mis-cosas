// Ciaboga animada (spec { tipo: 'ciaboga' }): el yate de ejemplo, parado en una dársena estrecha, gira 180° casi en el
// sitio con su hélice dextrógira: avante con todo el timón a estribor y atrás con todo el timón a babor, alternando. La
// derrota sale del modelo de src/nautical/maniobra-puerto.js (Nomoto de primer orden con la presión lateral de las
// palas), no de un dibujo a ojo.

import { ciaboga } from '../../nautical/maniobra-puerto.js';
import { curvaEvolucion, enInstante, puntoCasco, YATE } from '../../nautical/maniobra.js';
import { T, TXT, lienzo, rotulo, cartela, flecha, tierra, f1, num, cascoPlanta } from '../estilo-c.js';
import { pista, el, aparece, trazoHasta, situa, ritmo, giroPala } from './pista.js';

const W = 358;
const H = 380;
const L = YATE.eslora;
const NOMBRE_TRAMO = { 1: 'Avante, todo a estribor', '-1': 'Atrás, todo a babor', 0: 'Máquina parada, timón a la vía' };

export function pistaCiaboga() {
  const c = ciaboga();
  const ms = c.muestras;
  const ev = curvaEvolucion();
  // escala: 10 px por metro; la dársena, de dos esloras de ancho
  const k = 10;
  const Lpx = L * k;
  const xs = ms.map((q) => q.x);
  const ys = ms.map((q) => q.y);
  const [cx0, cy0] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const O = [W / 2, 214];
  const P = (x, y) => [O[0] + (x - cx0) * k, O[1] - (y - cy0) * k];
  const anchoDarsena = 2 * L * k;
  const [xa, xb] = [W / 2 - anchoDarsena / 2, W / 2 + anchoDarsena / 2];
  // la reproducción: cada orden dura lo mismo en pantalla (los primeros segundos, algo más lentos)
  const tr = c.tramos;
  const puntos = [[0, 0]];
  tr.slice(1).forEach((x, i) => puntos.push([x.t, 1.4 + i * 1.9]));
  puntos.push([c.fin, puntos[puntos.length - 1][1] + 2]);
  const { real, rep, duracion } = ritmo(puntos);
  // estelas cada 0,5 s reales
  const muestras = [];
  for (let s = 0; s <= c.fin + 1e-9; s += 0.5) muestras.push(enInstante(ms, s));
  const tiempos = muestras.map((q) => q.t);
  const ptsProa = muestras.map((q) => P(...puntoCasco(q, 0.5)));
  const ptsPopa = muestras.map((q) => P(...puntoCasco(q, -0.5)));
  const fin = ms[ms.length - 1];
  const nAtras = tr.filter((x) => x.maquina < 0).length;
  // hitos: la primera orden de cada clase, una vez cada una, y el final
  const enT = (s) => enInstante(ms, s);
  const caida = (s) => Math.round(enT(s).rumbo);
  const hitos = [
    { t: 0, nombre: 'Parado, en poco sitio', texto: `Hay que dar la vuelta en una dársena de unas dos esloras de ancho: con la curva de evolución (${num(ev.diametroTactico / L)} esloras de diámetro táctico) no cabe.` },
    { t: rep(tr[0].t + 2), nombre: 'Avante, todo a estribor', texto: 'Poca máquina avante y todo el timón a estribor: la corriente de la hélice sobre la pala hace caer la proa a estribor antes de coger arrancada.' },
    { t: rep(tr[1].t), nombre: 'Atrás, todo a babor', texto: `Antes de avanzar demasiado, máquina atrás y timón a babor: la hélice dextrógira lleva la popa a babor y la proa sigue cayendo a estribor (${caida(tr[2].t)}° a los ${Math.round(tr[2].t)} s).` },
    { t: rep(tr[2].t), nombre: 'Otra vez avante, a estribor', texto: 'Y así, alternando, sin dejar que coja arrancada ni avante ni atrás: el barco gira casi en el sitio.' },
    { t: rep(tr[tr.length - 1].t), nombre: 'Al rumbo opuesto', texto: `Con ${nAtras} paladas atrás ha caído ${Math.round(fin.rumbo)}° en ${Math.round(c.fin)} s sin salirse de la dársena. Con hélice levógira se hace al revés: cayendo a babor.` },
  ];

  function cambios(t) {
    const s = real(t);
    const q = enT(s);
    const [bx, by] = P(q.x, q.y);
    const caidaAhora = Math.max(0, Math.min(180, q.rumbo));
    return {
      barco: { transform: situa(bx, by, q.rumbo) },
      pala: { transform: giroPala(q.timon, Lpx) },
      'estela-proa': { points: trazoHasta(ptsProa, tiempos, s, P(...puntoCasco(q, 0.5))) },
      'estela-popa': { points: trazoHasta(ptsPopa, tiempos, s, P(...puntoCasco(q, -0.5))) },
      orden: { texto: NOMBRE_TRAMO[q.maquina] },
      reloj: { texto: `${Math.round(s)} s · caída ${String(Math.round(caidaAhora)).padStart(3, '0')}°` },
      // la presión lateral de las palas, solo dando atrás
      'pw': { opacity: q.maquina < 0 ? '1' : '0' },
      'cartela-fin': { opacity: aparece(t, hitos[4].t) },
    };
  }

  const alt = `Animación vista desde arriba: el yate de ${L} m, parado en una dársena de dos esloras de ancho, da la vuelta con una hélice dextrógira. Avante con todo el timón a estribor, la proa cae a estribor; atrás con todo el timón a babor, la hélice lleva la popa a babor y la proa sigue cayendo a estribor. Alternando ${nAtras} veces, queda al rumbo opuesto sin salirse de la dársena.`;

  function svg(t) {
    const c0 = cambios(t);
    const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    // la dársena: muelles a los dos lados
    out.push(tierra(`M0,0 H${f1(xa)} V${H} H0 Z`, pt), tierra(`M${f1(xb)},0 H${W} V${H} H${f1(xb)} Z`, pt));
    out.push(rotulo(xa / 2, 30, 'MUELLE', { size: TXT.min, weight: 700, estilo: 'cap', espacio: 1 }), rotulo((xb + W) / 2, 30, 'MUELLE', { size: TXT.min, weight: 700, estilo: 'cap', espacio: 1 }));
    // cota del ancho de la dársena
    out.push(`<g><line x1="${f1(xa)}" y1="${H - 30}" x2="${f1(xb)}" y2="${H - 30}" stroke="${T.tinta}" stroke-width="1"/><line x1="${f1(xa)}" y1="${H - 36}" x2="${f1(xa)}" y2="${H - 24}" stroke="${T.tinta}" stroke-width="1.2"/><line x1="${f1(xb)}" y1="${H - 36}" x2="${f1(xb)}" y2="${H - 24}" stroke="${T.tinta}" stroke-width="1.2"/></g>`,
      rotulo(W / 2, H - 36, `dos esloras, ${2 * L} m`, { size: TXT.min, estilo: 'mono', weight: 600 }));
    // dónde estaba y hacia dónde quedará
    const [ix, iy] = P(ms[0].x, ms[0].y);
    out.push(`<g transform="${situa(ix, iy, 0)}"><path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="none" stroke="${T.apagado}" stroke-width="1" stroke-dasharray="4 3"/></g>`);
    // estelas de la proa y de la popa
    out.push(el('estela-popa', 'polyline', { fill: 'none', stroke: T.magenta, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, c0));
    out.push(el('estela-proa', 'polyline', { fill: 'none', stroke: T.tinta, 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }, c0));
    // el barco con su pala, y la flecha de la presión lateral (popa a babor) que se ve dando atrás
    out.push(el('barco', 'g', {}, c0, `<path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<line x1="0" y1="${f1(-Lpx / 2 + 5)}" x2="0" y2="${f1(Lpx / 2 - 3)}" stroke="${T.tinta}" stroke-width=".6"/>` +
      el('pala', 'line', { x1: 0, y1: f1(Lpx / 2), x2: 0, y2: f1(Lpx / 2 + Math.max(7, Lpx * 0.13)), stroke: T.tinta, 'stroke-width': 3, 'stroke-linecap': 'round' }, c0) +
      el('pw', 'g', {}, c0, flecha(-6, Lpx / 2 - 8, -40, Lpx / 2 - 8, { color: T.magenta, w: 2, p: 'helice' }))));
    // la orden de máquina y timón, y el reloj
    out.push(rotulo(W / 2, 58, 'ORDEN', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }),
      el('orden', 'text', { x: W / 2, y: 76, 'font-size': TXT.rotulo + 1, 'font-weight': 700, 'text-anchor': 'middle', fill: T.magenta, class: 'lc-serif' }, c0),
      el('reloj', 'text', { x: W / 2, y: 94, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'middle', fill: T.tinta, class: 'lc-mono' }, c0));
    out.push(el('cartela-fin', 'g', {}, c0, cartela(W / 2, H - 74, 'AL RUMBO OPUESTO', 'sin salir de la dársena', { color: T.magenta, ancho: 176 })));
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion, hitos, svg, cambios, real, datos: { c, anchoDarsena: 2 * L, k } });
}
