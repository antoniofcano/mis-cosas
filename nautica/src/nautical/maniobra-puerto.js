// Maniobras de puerto del yate de ejemplo (YATE de src/nautical/maniobra.js, una hélice dextrógira): la ciaboga y el
// desatraque con un esprín. Funciones puras: dan las animaciones de las láminas (src/illustrations/animaciones/ciaboga.js
// y src/illustrations/interactivas/desatraque.js), sus imágenes fijas y los tests.
//
// Hipótesis (docs/ESTILO-LAMINAS.md, apéndice; valores cualitativos de un yate de 12 m, no de un barco concreto):
//  · Rumbo: modelo de Nomoto de primer orden, T·ṙ + r = r_obj, con el mismo T = 3,5 s que la curva de evolución.
//  · Avante con poca máquina coge 0,9 m/s y el timón trabaja con la corriente de la hélice (1,6 m/s más la arrancada):
//    r_obj = δ·U/R con R = 1,5 esloras. La presión lateral de las palas (dextrógira) lleva avante la popa a estribor a
//    1,2°/s (menos con arrancada), como en andarHelice().
//  · Atrás coge 0,7 m/s; el timón gobierna poco (la mitad, y al revés: con arrancada atrás, timón a babor lleva la popa a
//    babor) y la presión lateral lleva la popa a babor a 4,5°/s: dando atrás la proa sigue cayendo a estribor.
//  · La velocidad responde con un retardo de 5 s; el timón va de banda a banda en unos 3 s (0,6 de recorrido por segundo).
//  · Desatraque: el barco gira alrededor de la defensa (el esprín no le deja avanzar o retroceder) con la misma respuesta
//    de primer orden; el giro se frena al tensarse el esprín y quedar la popa (o la proa) abierta unos 25° (o 20°). Al
//    largar el esprín sale atrás (o avante) a 0,8 m/s con el timón a la vía.

import { YATE } from './maniobra.js';

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const lim = (v, a = -1, b = 1) => Math.min(b, Math.max(a, v));

const memo = new Map();
const memoiza = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

/** Parámetros de la ciaboga (los de la cabecera). */
export const CIABOGA = { avante: 0.9, atras: -0.7, chorro: 1.6, Tu: 5, tramoAvante: 7, tramoAtras: 8, pwAvante: 1.2, pwAtras: 4.5, timonAtras: 0.5 };

/**
 * Ciaboga a estribor con una hélice dextrógira, desde parado: avante con todo el timón a estribor, atrás con todo el
 * timón a babor, y así hasta quedar al rumbo opuesto; luego máquina parada y timón a la vía.
 * @returns {{ muestras: { t, x, y, rumbo, r, u, timon, maquina, tramo }[], tramos: { t, maquina, timon }[], fin: number }}
 *   x hacia estribor del rumbo inicial e y hacia delante, en metros; rumbo en grados (0 = el inicial); maquina: +1 avante,
 *   −1 atrás, 0 parada; tramos: cuándo empieza cada orden de máquina y timón.
 */
export function ciaboga() {
  return memoiza('ciaboga', () => {
    const B = YATE;
    const K = CIABOGA;
    const R = B.radio * B.eslora;
    const dt = 0.02;
    let [x, y, psi, r, u, d] = [0, 0, 0, 0, 0, 0];
    const muestras = [];
    const tramos = [];
    let tramo = -1;
    let orden = null;
    let tParada = null;
    for (let t = 0; t <= 90; t += dt) {
      // órdenes: tramos alternos hasta pasar del rumbo opuesto (contando la inercia del giro), luego parada
      if (tParada == null && deg(psi) + deg(r) * B.T >= 180) tParada = t;
      let nuevo;
      if (tParada != null) nuevo = { maquina: 0, timon: 0 };
      else {
        const ciclo = K.tramoAvante + K.tramoAtras;
        const enCiclo = t % ciclo;
        nuevo = enCiclo < K.tramoAvante ? { maquina: 1, timon: 1 } : { maquina: -1, timon: -1 };
      }
      if (!orden || nuevo.maquina !== orden.maquina) { orden = nuevo; tramo += 1; tramos.push({ t, ...orden }); }
      if (tParada != null && t - tParada > 6) break;
      muestras.push({ t, x, y, rumbo: deg(psi), r: deg(r), u, timon: d, maquina: orden.maquina, tramo });
      d += lim(orden.timon - d, -B.tasaTimon * dt, B.tasaTimon * dt);
      const uObj = orden.maquina > 0 ? K.avante : orden.maquina < 0 ? K.atras : 0;
      u += (uObj - u) * (dt / K.Tu);
      // timón: con la corriente de la hélice avante; con arrancada atrás, menos y al revés
      const timon = orden.maquina > 0 ? (d * (Math.max(u, 0) + K.chorro)) / R : u < 0 ? (d * u * K.timonAtras) / R : (d * Math.max(u, 0)) / R;
      // presión lateral de las palas (dextrógira): avante la popa a estribor (la proa a babor, r −); atrás, a babor (r +)
      const pw = orden.maquina > 0 ? -rad(K.pwAvante) * (1 - 0.6 * Math.min(1, Math.max(u, 0) / 1.5)) : orden.maquina < 0 ? rad(K.pwAtras) : 0;
      r += (timon + pw - r) * (dt / B.T);
      x += u * Math.sin(psi) * dt;
      y += u * Math.cos(psi) * dt;
      psi += r * dt;
    }
    return { muestras, tramos, fin: muestras[muestras.length - 1].t };
  });
}

/** Ángulo al que queda abierto el barco y dónde está la defensa, según el resultado del desatraque. */
export const DESATRAQUE = { abrePopa: 25, abreProa: 20, rmax: 6, salida: 0.8, Tu: 3, tSuelta: 1.2 };

/**
 * Movimiento del desatraque de un barco atracado por babor con la proa al W (rumbo 270°), con el muelle al S.
 * @param {{ resultado: 'abre-popa'|'abre-proa'|'se-queda'|'se-separa', esprin: 'proa'|'popa', maquina: 'avante'|'atras', viento: string }} p
 * @returns {{ muestras: { t, x, y, rumbo, abierto, suelto }[], pivote: [number, number]|null, tAbierta: number|null, tSale: number|null, fin: number }}
 *   x al E e y al N, en metros, del centro del barco (0, 0 atracado); abierto: grados que se ha abierto; suelto: el esprín
 *   ya largado
 */
export function desatraqueMovimiento({ resultado, esprin, maquina, viento }) {
  return memoiza(`des|${resultado}|${esprin}|${maquina}|${viento}`, () => {
    const L = YATE.eslora;
    const Bm = YATE.manga;
    const K = DESATRAQUE;
    const T = YATE.T;
    const dt = 0.02;
    const abre = resultado === 'abre-popa' ? 1 : resultado === 'abre-proa' ? -1 : 0;
    // la defensa: en la amura de babor (esprín de proa) o en la aleta (esprín de popa), contra el muelle
    const pivote = esprin === 'proa' ? [-L / 2 + 1.2, -Bm / 2] : [L / 2 - 1.2, -Bm / 2];
    const max = resultado === 'abre-popa' ? K.abrePopa : resultado === 'abre-proa' ? K.abreProa : maquina === 'atras' && esprin === 'popa' ? 6 : 0;
    let th = 0; // grados abiertos (giro alrededor de la defensa)
    let r = 0;
    let [cx, cy] = [0, 0];
    let u = 0;
    let rumbo = 270;
    let tAbierta = null;
    let tSale = null;
    const muestras = [];
    for (let t = 0; t <= 16; t += dt) {
      const suelto = tSale != null;
      muestras.push({ t, x: cx, y: cy, rumbo, abierto: th, suelto });
      if (t < K.tSuelta) continue; // se da máquina
      if (!suelto && abre) {
        // gira alrededor de la defensa: respuesta de primer orden que se frena al tensarse el esprín
        r += (K.rmax * Math.max(0, 1 - th / max) - r) * (dt / T);
        th += r * dt;
        if (tAbierta == null && th >= 0.95 * max) tAbierta = t;
        if (tAbierta != null && t - tAbierta > 1.2) tSale = t;
        const a = rad(abre * th); // giro matemático (antihorario visto desde arriba)
        const [px, py] = pivote;
        [cx, cy] = [px + (0 - px) * Math.cos(a) - (0 - py) * Math.sin(a), py + (0 - px) * Math.sin(a) + (0 - py) * Math.cos(a)];
        rumbo = 270 - abre * th;
      } else if (suelto) {
        // largado el esprín: sale atrás (abrió la popa) o avante (abrió la proa), timón a la vía; el giro se apaga
        const uObj = abre > 0 ? -K.salida : K.salida;
        u += (uObj - u) * (dt / K.Tu);
        r += (0 - r) * (dt / T);
        rumbo -= abre * r * dt;
        cx += u * Math.sin(rad(rumbo)) * dt;
        cy += u * Math.cos(rad(rumbo)) * dt;
      } else if (resultado === 'se-queda') {
        if (max) {
          // el esprín de popa trabaja, pero el viento de la mar devuelve la proa: abre unos grados y vuelve
          const objetivo = t < 5 ? max : 0;
          th += (objetivo - th) * (dt / 1.6);
          const a = rad(-th);
          const [px, py] = pivote;
          [cx, cy] = [px + (0 - px) * Math.cos(a) - (0 - py) * Math.sin(a), py + (0 - px) * Math.sin(a) + (0 - py) * Math.cos(a)];
          rumbo = 270 + th;
        } else {
          // el esprín en banda: se desliza a lo largo del muelle hasta que el cabo se tensa (≈ 1 m)
          const sentido = maquina === 'avante' ? -1 : 1; // avante hacia el W
          u += ((Math.abs(cx) < 1 ? 0.5 : 0) - u) * (dt / 1);
          cx += sentido * u * dt;
        }
      } else if (resultado === 'se-separa') {
        // el viento de tierra lo separa de costado
        u += ((cy < 2.5 ? 0.35 : 0) - u) * (dt / 3);
        cy += u * dt;
      }
      if (tSale != null && t - tSale > 6) break;
    }
    return { muestras, pivote: abre || max ? pivote : null, tAbierta, tSale, fin: muestras[muestras.length - 1].t };
  });
}
