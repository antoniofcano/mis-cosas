// Hombre al agua animado (spec { tipo: 'hombre-al-agua', maniobra: 'boutakow' | 'anderson' | 'scharnow' }): el yate de
// ejemplo hace la maniobra del IAMSAR con su estela, el timón y el náufrago. La derrota sale del modelo de
// src/nautical/maniobra.js con los ángulos de la regla (60°, 250°, 240° y 20° antes del rumbo opuesto): la de Boutakow
// y la de Scharnow vuelven solas sobre la derrota inicial al rumbo opuesto; nada está dibujado a ojo.

import { hombreAlAgua, enInstante, REGLA_HAA, YATE } from '../../nautical/maniobra.js';
import { T, TXT, lienzo, rotulo, cotaArco, referencia, ondas, paso, f1 } from '../estilo-c.js';
import { pista, el, aparece, trazoHasta, situa, ritmo, barcoAnimado, giroPala } from './pista.js';

const W = 358;
const L = YATE.eslora;
const NOMBRE = { boutakow: 'Boutakow', anderson: 'Anderson', scharnow: 'Scharnow' };
const tres = (g) => String(((Math.round(g) % 360) + 360) % 360).padStart(3, '0');
const m = (v) => `${Math.round(v)} m`;

/** Rótulo del timón a partir de su ángulo (−1…1). */
export const timonTexto = (d) => (d >= 0.8 ? 'todo a estribor' : d <= -0.8 ? 'todo a babor' : Math.abs(d) < 0.15 ? 'a la vía' : 'gobernando');

function guion(man, h) {
  const M = h.momentos;
  const dur = Math.round(M.recogida);
  if (man === 'anderson') {
    return {
      ritmo: ritmo([[0, 0], [8, 3], [M.via, 8.5], [M.recogida, 12.5], [M.recogida + 1, 13.5]]),
      hitos: [
        [0, '¡Hombre al agua por estribor!', 'Grita, lanza el aro y no lo pierdas de vista. Todo el timón a estribor, la banda del náufrago: la popa y la hélice se apartan de él.'],
        [M.via, `A unos ${REGLA_HAA.anderson}°: a la vía`, `Tras una sola vuelta de unos ${REGLA_HAA.anderson}°, timón a la vía y moderar la máquina: el barco termina de caer y el náufrago queda por la proa.`],
        [M.aproxima, 'Aproximación', 'Con poca arrancada y poco timón, se gobierna hacia él para dejarlo por el costado.'],
        [M.recogida, 'Recogida', `Llega despacio, con la persona por el costado, en ${dur} s. Es la más rápida, pero pide verlo caer y un barco que gire bien.`],
      ],
      pasos: [[0, 1], [M.via, 2]],
    };
  }
  if (man === 'scharnow') {
    return {
      ritmo: ritmo([[0, 0], [M.cambio, 6.5], [M.via, 9.5], [M.opuesto, 10.5], [M.recogida, 15.5], [M.recogida + 1, 16.5]]),
      hitos: [
        [0, 'Alarma: cayó hace un rato', 'La persona cayó hace un rato y está en la estela, lejos por la popa. Todo el timón a una banda.'],
        [M.cambio, `A ${REGLA_HAA.scharnow}°: todo a la otra banda`, `Caídos ${REGLA_HAA.scharnow}° del rumbo inicial, todo el timón a la banda contraria.`],
        [M.via, `${REGLA_HAA.antes}° antes del opuesto: a la vía`, `Cuando faltan unos ${REGLA_HAA.antes}° para el rumbo opuesto, timón a la vía: termina de caer y se gobierna al opuesto.`],
        [M.opuesto, 'Rumbo opuesto, sobre la derrota', 'Ya va al rumbo opuesto y sobre su derrota, más atrás que con la de Boutakow: recorre menos camino hasta donde cayó.'],
        [M.recogida, 'Recogida', `Siguiendo la derrota llega a la persona, en ${dur} s. No sirve si acaba de caer: la deja por la popa.`],
      ],
      pasos: [[0, 1], [M.cambio, 2], [M.via, 3]],
    };
  }
  return {
    ritmo: ritmo([[0, 0], [M.cambio, 3.5], [M.via, 10], [M.opuesto, 11], [M.recogida, 16], [M.recogida + 1, 17]]),
    hitos: [
      [0, '¡Hombre al agua por estribor!', 'Grita, lanza el aro y señálalo. Todo el timón a la banda por la que ha caído: la popa y la hélice se apartan de él.'],
      [M.cambio, `A ${REGLA_HAA.boutakow}°: todo a la otra banda`, `Separado ${REGLA_HAA.boutakow}° del rumbo inicial, todo el timón a babor.`],
      [M.via, `${REGLA_HAA.antes}° antes del opuesto: a la vía`, `Cuando faltan unos ${REGLA_HAA.antes}° para el rumbo opuesto, timón a la vía: termina de caer y se gobierna al opuesto.`],
      [M.opuesto, 'Rumbo opuesto, sobre tu estela', 'Ya va al rumbo opuesto y por su propia estela: solo tiene que seguirla, aunque no vea a la persona.'],
      [M.recogida, 'Recogida', `Con poca máquina llega a la persona, que queda por el costado, en ${dur} s. Es la más segura de noche o si no la has visto caer.`],
    ],
    pasos: [[0, 1], [M.cambio, 2], [M.via, 3]],
  };
}

/** Centro de la circunferencia que pasa por tres puntos. */
function centro([ax, ay], [bx, by], [cx, cy]) {
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  return [(a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d, (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d];
}

export function pistaHombreAlAgua(maniobra = 'boutakow') {
  const h = hombreAlAgua(maniobra);
  const man = h.maniobra;
  const ms = h.muestras;
  const g = guion(man, h);
  const { real, rep, duracion } = g.ritmo;
  // encaje: metros → píxeles; manda el ancho salvo que la derrota sea muy larga (Scharnow)
  const todos = [...ms.map((q) => [q.x, q.y]), h.mob, ...h.previa];
  const xs = todos.map((q) => q[0]);
  const ys = todos.map((q) => q[1]);
  const mg = 0.7 * L;
  const [x0, x1, y0, y1] = [Math.min(...xs, -0.8 * L) - mg, Math.max(...xs) + mg, Math.min(...ys) - mg, Math.max(...ys) + mg];
  const caja = { izq: 20, der: W - 20, arr: 76, abaMax: 434 };
  const k = Math.min((caja.der - caja.izq) / (x1 - x0), (caja.abaMax - caja.arr) / (y1 - y0));
  const H = Math.round(caja.arr + (y1 - y0) * k + 34);
  const ox = caja.izq + ((caja.der - caja.izq) - (x1 - x0) * k) / 2 - x0 * k;
  const oy = caja.arr + y1 * k;
  const P = (x, y) => [ox + x * k, oy - y * k];
  const Lpx = L * k;
  const pasoT = 0.25;
  const idx = [];
  for (let s = 0; s <= ms[ms.length - 1].t + 1e-9; s += pasoT) idx.push(enInstante(ms, s));
  const tiempos = idx.map((q) => q.t);
  const pts = idx.map((q) => P(q.x, q.y));
  const [mx, my] = P(...h.mob);
  const hitos = g.hitos.map(([s, nombre, texto]) => ({ t: rep(s), nombre, texto }));
  const tPasos = g.pasos.map(([s]) => rep(s));
  const M = h.momentos;

  function cambios(t) {
    const s = real(t);
    const q = enInstante(ms, s);
    const [bx, by] = P(q.x, q.y);
    const c = {
      barco: { transform: situa(bx, by, q.rumbo) },
      pala: { transform: giroPala(q.timon, Lpx) },
      estela: { points: trazoHasta(pts, tiempos, s, [bx, by]) },
      derrota: { points: trazoHasta(pts, tiempos, s, [bx, by]) },
      reloj: { texto: `${Math.round(s)} s · rumbo ${tres(q.rumbo)}°` },
      timon: { texto: `timón ${timonTexto(q.timon)}`, fill: q.timon >= 0.8 ? T.verdeTxt : q.timon <= -0.8 ? T.rojoTxt : T.tinta },
      cota: { opacity: aparece(t, hitos[1].t) },
      fin: { opacity: aparece(t, hitos[hitos.length - 1].t) },
    };
    g.pasos.forEach((_, i) => { c[`paso${i}`] = { opacity: aparece(t, tPasos[i], 0.3) }; });
    return c;
  }

  const alt = {
    boutakow: `Curva de Boutakow vista desde arriba: la persona cae por estribor; el yate mete todo el timón a estribor, a ${REGLA_HAA.boutakow}° del rumbo inicial todo a babor, a ${REGLA_HAA.antes}° del rumbo opuesto a la vía, y vuelve al rumbo opuesto sobre su propia estela hasta recoger a la persona.`,
    anderson: `Maniobra de Anderson vista desde arriba: la persona cae por estribor; el yate mete todo el timón a estribor, da una sola vuelta de unos ${REGLA_HAA.anderson}°, pone el timón a la vía y llega despacio hasta la persona, que le queda por la proa.`,
    scharnow: `Curva de Scharnow vista desde arriba: la persona cayó hace un rato y está lejos por la popa; el yate mete todo el timón a una banda, a ${REGLA_HAA.scharnow}° todo a la otra y vuelve al rumbo opuesto sobre su derrota, más atrás que con la de Boutakow, hasta llegar a ella.`,
  }[man];

  function svg(t) {
    const c0 = cambios(t);
    const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    out.push(ondas(14, W - 14, H - 22, { sep: 8 }));
    // derrota inicial (la línea a la que vuelven Boutakow y Scharnow)
    const [ax] = P(0, 0);
    out.push(`<line x1="${f1(ax)}" y1="${f1(H - 30)}" x2="${f1(ax)}" y2="${caja.arr - 10}" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="7 5"/>`,
      rotulo(ax - 6, caja.arr - 14, 'derrota inicial', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end', color: T.apagado }));
    // derrota antes de la alarma
    const [pa, pb] = [P(...h.previa[0]), P(...h.previa[1])];
    out.push(`<line x1="${f1(pa[0])}" y1="${f1(pa[1])}" x2="${f1(pb[0])}" y2="${f1(pb[1])}" stroke="${T.lineaAgua}" stroke-width="${f1(Lpx * 0.3)}" stroke-linecap="round" opacity=".55"/>`);
    // estela (banda de agua batida, de la manga del barco) y derrota
    out.push(el('estela', 'polyline', { fill: 'none', stroke: T.lineaAgua, 'stroke-width': f1(Lpx * 0.3), 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: '.55' }, c0));
    out.push(el('derrota', 'polyline', { fill: 'none', stroke: T.tinta, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, c0));
    // la cota del ángulo de la regla: 60° entre el rumbo inicial y la proa al cambiar el timón (Boutakow); los ángulos
    // grandes (250°, 240°), como arco alrededor del centro del círculo de giro
    if (man === 'boutakow') {
      const q = enInstante(ms, M.cambio);
      const [cx, cy] = P(q.x, q.y);
      out.push(el('cota', 'g', {}, c0, referencia(cx, cy, cx, cy - 38) + cotaArco(cx, cy, 26, 0, REGLA_HAA.boutakow, `${REGLA_HAA.boutakow}°`, { color: T.magenta, rEt: 42 })));
    } else {
      const ang = REGLA_HAA[man];
      const [a, b, d] = [90, 160, 230].map((r) => { const q = ms.find((x) => x.rumbo >= r); return P(q.x, q.y); });
      const [cx, cy] = centro(a, b, d);
      const r0 = Math.hypot(a[0] - cx, a[1] - cy) * 0.42;
      out.push(el('cota', 'g', {}, c0, `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="2" fill="${T.magenta}"/>` + cotaArco(cx, cy, r0, 270, 270 + ang, `${man === 'anderson' ? '≈ ' : ''}${ang}°`, { color: T.magenta, rEt: 0 })));
    }
    // números de paso donde cambia el timón
    g.pasos.forEach(([s, n], i) => {
      const q = enInstante(ms, s);
      const [px, py] = P(q.x, q.y);
      const lado = q.rumbo + (man === 'anderson' || i !== 1 ? -90 : 90);
      const dx = Math.sin((lado * Math.PI) / 180) * 18;
      const dy = -Math.cos((lado * Math.PI) / 180) * 18;
      out.push(el(`paso${i}`, 'g', {}, c0, paso(px + dx, py + dy, n)));
    });
    // el náufrago
    out.push(`<g data-parte="naufrago"><circle cx="${f1(mx)}" cy="${f1(my)}" r="9" fill="none" stroke="${T.magenta}" stroke-width="1.4"/><circle cx="${f1(mx)}" cy="${f1(my)}" r="4.5" fill="${T.magenta}"/>` +
      rotulo(mx + 12, my + 22, 'náufrago', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, anchor: 'start', color: T.magenta }) + '</g>');
    out.push(barcoAnimado('barco', Lpx, c0));
    // recogida: cuánto ha tardado
    out.push(el('fin', 'g', {}, c0, rotulo(mx + 12, my + 38, `recogida en ${Math.round(M.recogida)} s`, { size: TXT.min, estilo: 'mono', weight: 600, anchor: 'start', color: T.magenta })));
    // reloj y timón
    out.push(rotulo(16, 26, NOMBRE[man].toUpperCase(), { size: TXT.rotulo, weight: 700, estilo: 'cap', anchor: 'start' }),
      el('timon', 'text', { x: 16, y: 44, 'font-size': TXT.rotulo, 'font-weight': 700, 'text-anchor': 'start', class: 'lc-serif' }, c0),
      el('reloj', 'text', { x: W - 16, y: 26, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'end', fill: T.tinta, class: 'lc-mono' }, c0));
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion, hitos, svg, cambios, real, datos: { ...h, k, Lpx } });
}
