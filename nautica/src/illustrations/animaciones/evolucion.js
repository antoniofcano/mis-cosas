// Curva de evolución animada (spec { tipo: 'evolucion' }): el yate de ejemplo mete todo el timón a estribor y la lámina
// enseña, cada cosa en su momento, que la popa abre hacia fuera, el avance y el traslado a los 90°, el diámetro
// táctico a los 180° y el diámetro final del círculo ya estabilizado. La trayectoria sale del modelo de
// src/nautical/maniobra.js (Nomoto con deriva y desplazamiento lateral inicial), no de un dibujo a ojo.

import { curvaEvolucion, enInstante, puntoCasco, YATE } from '../../nautical/maniobra.js';
import { T, TXT, lienzo, rotulo, etiqueta, cota, referencia, flecha, f1, num } from '../estilo-c.js';
import { pista, el, aparece, tramo, trazoHasta, situa, ritmo, barcoAnimado, giroPala } from './pista.js';

const W = 358;
const L = YATE.eslora;
const m = (v) => `${Math.round(v)} m`;
export const esloras = (v) => `${num(v / L)} esloras`;

/** Ritmo: los primeros segundos (el timón, la popa que abre), a cámara lenta; la vuelta, cuatro veces más deprisa. */
const tiempos = (c) => ritmo([[0, 0], [c.t0, 1.5], [c.t0 + 7, 5.5], [c.t360 + 3, 5.5 + (c.t360 + 3 - c.t0 - 7) / 4]]);

export function pistaEvolucion() {
  const c = curvaEvolucion();
  const { real, rep, duracion } = tiempos(c);
  const ms = c.muestras;
  // encaje: metros → píxeles (x a estribor, y hacia delante → arriba)
  const xs = ms.map((p) => p.x);
  const ys = ms.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 0.55 * L, Math.max(...xs) + 0.55 * L, Math.min(...ys) - 0.55 * L, Math.max(...ys) + 0.55 * L];
  // el ancho manda; el alto del lienzo se ajusta a la trayectoria
  const caja = { izq: 92, der: W - 14, arr: 72 };
  const k = (caja.der - caja.izq) / (x1 - x0);
  const H = Math.round(caja.arr + (y1 - y0) * k + 40);
  const ox = caja.izq - x0 * k;
  const oy = caja.arr + y1 * k;
  const P = (x, y) => [ox + x * k, oy - y * k];
  const Lpx = L * k;
  // estelas muestreadas cada 0,25 s reales
  const paso = 0.25;
  const idx = [];
  for (let s = 0; s <= ms[ms.length - 1].t; s += paso) idx.push(enInstante(ms, s));
  const tCG = idx.map((q) => q.t);
  const ptsCG = idx.map((q) => P(q.x, q.y));
  const ptsPopa = idx.map((q) => P(...puntoCasco(q, -0.5)));
  // la estela de la popa enseña que abre: se dibuja desde que se mete el timón hasta caer 90°
  const [iA, iB] = [Math.round(c.t0 / paso), Math.round(c.t90 / paso)];
  const m0 = c.m0;
  const [X0, Y0] = P(m0.x, m0.y);
  const [X90, Y90] = P(c.p90.x, c.p90.y);
  const [X180, Y180] = P(c.p180.x, c.p180.y);
  // círculo final: el de régimen (centro a mitad de sus extremos)
  const R = (c.diametroFinal / 2) * k;
  const cc = P(...c.centroFinal);
  // hitos (en segundos de reproducción)
  const hitos = [
    { t: 0, nombre: 'Rumbo inicial', texto: 'Avante a 6 nudos, con el timón a la vía. La línea a trazos es el rumbo inicial.' },
    { t: rep(c.t0), nombre: 'Todo el timón a estribor', texto: 'La pala desvía el agua y empuja la popa hacia babor: el barco aún no ha empezado a caer.' },
    { t: rep(c.t0 + 4), nombre: 'La popa abre', texto: `Antes de caer, el barco se desplaza un poco hacia babor y la popa barre hacia fuera (línea magenta): ojo con lo que tengas por esa banda.` },
    { t: rep(c.t90), nombre: '90°: avance y traslado', texto: `Avance: lo que ha adelantado en la dirección inicial, ${m(c.avance)} (${esloras(c.avance)}). Traslado: lo que se ha apartado de ella, ${m(c.traslado)}.` },
    { t: rep(c.t180), nombre: '180°: diámetro táctico', texto: `Al quedar al rumbo opuesto se ha separado ${m(c.diametroTactico)} (${esloras(c.diametroTactico)}) de la derrota inicial: es el diámetro táctico.` },
    { t: rep(c.t360), nombre: '360°: diámetro final', texto: `Ya estabilizado gira en un círculo algo menor, de ${m(c.diametroFinal)}: el diámetro final. Ha tardado ${Math.round(c.t360 - c.t0)} s en dar la vuelta.` },
  ];
  const [, h1, h2, h3, h4, h5] = hitos.map((x) => x.t);

  function cambios(t) {
    const s = real(t);
    const q = enInstante(ms, s);
    const [bx, by] = P(q.x, q.y);
    const popa = P(...puntoCasco(q, -0.5));
    const caida = Math.max(0, q.rumbo);
    return {
      barco: { transform: situa(bx, by, q.rumbo) },
      pala: { transform: giroPala(q.timon, Lpx) },
      estela: { points: trazoHasta(ptsCG, tCG, s, [bx, by]) },
      'estela-popa': { points: trazoHasta(ptsPopa.slice(iA, iB + 1), tCG.slice(iA, iB + 1), s, s <= c.t90 ? popa : null), opacity: s >= c.t0 ? 1 : 0 },
      reloj: { texto: `${Math.round(s)} s` },
      caida: { texto: `caída ${String(Math.min(360, Math.round(caida))).padStart(3, '0')}°` },
      'abre': { opacity: f1(tramo(t, h2 - 0.2, h2 + 0.4) * (1 - 0.6 * tramo(t, h3, h3 + 0.6))) },
      'c-90': { opacity: aparece(t, h3) },
      'c-180': { opacity: aparece(t, h4) },
      'c-final': { opacity: aparece(t, h5) },
    };
  }

  function svg(t) {
    const c0 = cambios(t);
    const alt = `Curva de evolución vista desde arriba: el yate, a 6 nudos, mete todo el timón a estribor; la popa abre hacia babor y el barco se desplaza un poco hacia esa banda antes de caer; a los 90° de caída ha avanzado ${m(c.avance)} y se ha trasladado ${m(c.traslado)}; a los 180° está a ${m(c.diametroTactico)} de la derrota inicial (diámetro táctico) y después gira en un círculo de ${m(c.diametroFinal)} (diámetro final).`;
    const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    // rumbo inicial
    out.push(`<line x1="${f1(X0)}" y1="${H - 30}" x2="${f1(X0)}" y2="34" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="7 5"/>`,
      rotulo(X0 + 6, 30, 'rumbo inicial', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
    // escala
    out.push(`<g><line x1="16" y1="${H - 18}" x2="${f1(16 + Lpx)}" y2="${H - 18}" stroke="${T.tinta}" stroke-width="1.4"/><line x1="16" y1="${H - 22}" x2="16" y2="${H - 14}" stroke="${T.tinta}"/><line x1="${f1(16 + Lpx)}" y1="${H - 22}" x2="${f1(16 + Lpx)}" y2="${H - 14}" stroke="${T.tinta}"/>` +
      rotulo(22 + Lpx, H - 14, `una eslora, ${L} m`, { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }) + '</g>');
    // 90°: avance y traslado
    out.push(el('c-90', 'g', {}, c0, cota(X0 - 26, Y0, X0 - 26, Y90, '', { color: T.tinta }) +
      referencia(X0 - 32, Y90, X90, Y90) +
      rotulo(X0 - 32, (Y0 + Y90) / 2 - 4, 'avance', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }) +
      rotulo(X0 - 32, (Y0 + Y90) / 2 + 12, m(c.avance), { size: TXT.min, estilo: 'mono', weight: 600, anchor: 'end' }) +
      referencia(X90, Y90, X90, Y90 - 22) + cota(X0, Y90 - 16, X90, Y90 - 16, '', { color: T.tinta }) +
      rotulo((X0 + X90) / 2, Y90 - 26, `traslado ${m(c.traslado)}`, { size: TXT.min, estilo: 'mono', weight: 600 }) +
      `<circle cx="${f1(X90)}" cy="${f1(Y90)}" r="3.5" fill="${T.tinta}"/>` + etiqueta(X90 - 4, Y90 + 20, '090°')));
    // 180°: diámetro táctico
    out.push(el('c-180', 'g', {}, c0, referencia(X180, Y180, X180, Y180 + 12) + cota(X0, Y180 + 12, X180, Y180 + 12, '', { color: T.magenta }) +
      rotulo((X0 + X180) / 2, Y180 + 2, `diámetro táctico ${m(c.diametroTactico)}`, { size: TXT.min, estilo: 'mono', weight: 700, color: T.magenta }) +
      `<circle cx="${f1(X180)}" cy="${f1(Y180)}" r="3.5" fill="${T.magenta}"/>` + etiqueta(X180 + 24, Y180 - 8, '180°', { color: T.magenta })));
    // círculo final
    out.push(el('c-final', 'g', {}, c0, `<circle cx="${f1(cc[0])}" cy="${f1(cc[1])}" r="${f1(R)}" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="2 4"/>` +
      cota(cc[0], cc[1] - R, cc[0], cc[1] + R, '', { color: T.tinta }) +
      rotulo(cc[0] + 6, cc[1] + R * 0.5, 'diámetro final', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }) +
      rotulo(cc[0] + 6, cc[1] + R * 0.5 + 15, m(c.diametroFinal), { size: TXT.min, estilo: 'mono', weight: 600, anchor: 'start' })));
    // estelas: la del centro del barco y la de la popa
    out.push(el('estela-popa', 'polyline', { fill: 'none', stroke: T.magenta, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, c0));
    out.push(el('estela', 'polyline', { fill: 'none', stroke: T.tinta, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, c0));
    // «la popa abre»
    const qa = enInstante(c.muestras, c.t0 + 4);
    const [pa, pb] = P(...puntoCasco(qa, -0.5));
    out.push(el('abre', 'g', {}, c0, flecha(pa - 6, pb + 4, pa - 40, pb + 10, { color: T.magenta, w: 1.6 }) +
      rotulo(pa - 44, pb + 30, 'la popa abre', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: T.magenta, anchor: 'end' })));
    // el barco, con su pala del timón
    out.push(barcoAnimado('barco', Lpx, c0));
    // reloj de la maniobra
    out.push(rotulo(W - 16, 28, 'TIEMPO Y CAÍDA', { size: TXT.min, weight: 700, estilo: 'cap', anchor: 'end', color: T.apagado }),
      el('reloj', 'text', { x: W - 16, y: 46, 'font-size': TXT.rotulo, 'font-weight': 600, 'text-anchor': 'end', fill: T.tinta, class: 'lc-mono' }, c0),
      el('caida', 'text', { x: W - 16, y: 62, 'font-size': TXT.rotulo, 'font-weight': 600, 'text-anchor': 'end', fill: T.magenta, class: 'lc-mono' }, c0));
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion, hitos, svg, cambios, real, datos: c });
}
