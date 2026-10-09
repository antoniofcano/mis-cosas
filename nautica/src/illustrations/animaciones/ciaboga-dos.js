// Ciaboga con dos hélices, animada (spec { tipo: 'ciaboga-dos-helices', banda: 'er'|'br', resaltar? }): arriba, los
// dos montajes de las hélices gemelas vistos desde popa (fijos); abajo, el barco que gira casi sobre sí mismo con un
// motor avante y el otro atrás. La proa cae hacia la banda del motor que va atrás (el par de las dos hélices) y, con
// giro al exterior, la presión lateral de las dos palas empuja la popa al otro lado: ayuda.
// Modelo cualitativo (docs/ESTILO-LAMINAS.md, «Hipótesis físicas»): sin arrancada, el barco gira alrededor de su
// centro con una respuesta de primer orden (T = 2 s) hasta 6°/s; para al llegar al rumbo opuesto. Los grados por
// segundo son ilustrativos: dependen del barco y de la máquina.

import { T, TXT, lienzo, rotulo, cartela, flecha, f1, pol, cascoPlanta, arcoD } from '../estilo-c.js';
import { pista, el, aparece, situa } from './pista.js';

const W = 358;
const H = 452;
export const PARTES_CIABOGA2 = ['exterior', 'interior', 'ciaboga'];
const OMEGA = 6; // °/s, ilustrativo
const TAU = 2; // s

/** Caída (grados, positiva hacia la banda del giro) a los s segundos: primer orden hasta OMEGA, parada en 180°. */
export function caidaDos(s) {
  const sinTope = OMEGA * (s - TAU * (1 - Math.exp(-s / TAU)));
  return Math.min(180, Math.max(0, sinTope));
}
/** Segundos hasta el rumbo opuesto. */
export function finDos() {
  let s = 0;
  while (caidaDos(s) < 180) s += 0.05;
  return s;
}

/** Hélice vista desde popa: tres palas y una flecha curva con su sentido de giro (horario = dextrógira). */
function heliceDesdePopa(x, y, horaria, color) {
  const o = [];
  for (const a of [0, 120, 240]) o.push(`<ellipse cx="${x}" cy="${y - 7}" rx="3.6" ry="7" transform="rotate(${a + 20} ${x} ${y})" fill="${T.apagado}" stroke="${T.tinta}" stroke-width=".7"/>`);
  o.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${T.tinta}"/>`);
  const r = 18;
  const [a, b] = horaria ? [-55, 55] : [55, -55];
  const q = pol(x, y, b, r);
  const q2 = pol(x, y, b + (horaria ? -14 : 14), r);
  o.push(`<path d="${horaria ? arcoD(x, y, r, a, b) : arcoD(x, y, r, b, a)}" fill="none" stroke="${color}" stroke-width="1.8"/>`, flecha(q2[0], q2[1], q[0], q[1], { color, w: 1.8, punta: 7 }));
  return o.join('');
}

export function pistaCiabogaDos(spec = {}) {
  const banda = spec.banda === 'br' ? 'br' : 'er';
  const s = banda === 'er' ? 1 : -1;
  const hl = new Set((Array.isArray(spec.resaltar) ? spec.resaltar : spec.resaltar ? [spec.resaltar] : []).filter((k) => PARTES_CIABOGA2.includes(k)));
  const B = banda === 'er' ? 'estribor' : 'babor';
  const O = banda === 'er' ? 'babor' : 'estribor';
  const fin = finDos();
  // reproducción: 1 s de reproducción = 1,5 s de maniobra, con un segundo de espera al principio
  const espera = 1;
  const real = (t) => Math.max(0, (t - espera) * 1.5);
  const duracion = espera + fin / 1.5 + 0.8;
  const tDe = (grados) => { let x = 0; while (caidaDos(x) < grados) x += 0.05; return espera + x / 1.5; };
  const hitos = [
    { t: 0, nombre: 'Parado', texto: `Sin arrancada, en poco sitio: hay que quedar al rumbo opuesto cayendo a ${B}.` },
    { t: espera, nombre: `${O === 'babor' ? 'Br' : 'Er'} avante, ${B === 'estribor' ? 'Er' : 'Br'} atrás`, texto: `Motor de ${O} avante y motor de ${B} atrás, a la vez y con la misma potencia: los dos empujes forman un par que hace girar el barco sin avanzar.` },
    { t: tDe(45), nombre: `La proa cae a ${B}`, texto: `La proa cae hacia la banda del motor que va atrás. Con giro al exterior, las dos hélices empujan además la popa a ${O}: ayudan al giro. El timón a ${B} también ayuda.` },
    { t: tDe(90), nombre: 'A los 90°', texto: 'El barco gira casi sobre sí mismo: no hace falta la curva de evolución.' },
    { t: tDe(179.5), nombre: 'Al rumbo opuesto', texto: `Al quedar al rumbo opuesto se paran las dos máquinas. Para caer a ${O}, al revés: ${O} atrás y ${B} avante.` },
  ];
  const Lpx = 100;
  const O0 = [W / 2, 344];

  function cambios(t) {
    const x = real(t);
    const c = caidaDos(x);
    const marcha = t >= espera && c < 180;
    return {
      barco: { transform: situa(O0[0], O0[1], s * c) },
      empujes: { opacity: marcha ? '1' : '0' },
      orden: { texto: marcha ? `${O === 'babor' ? 'Babor' : 'Estribor'} avante · ${B === 'estribor' ? 'Estribor' : 'Babor'} atrás` : c >= 180 ? 'Máquinas paradas' : 'Parado' },
      reloj: { texto: `${Math.round(x)} s · caída ${String(Math.round(c)).padStart(3, '0')}° a ${B}` },
      'cartela-fin': { opacity: aparece(t, hitos[4].t) },
    };
  }

  const alt = `Arriba, las hélices gemelas vistas desde popa: giro al exterior (levógira a babor y dextrógira a estribor, el montaje habitual) y giro al interior. Abajo, animación vista desde arriba: con el motor de ${O} avante y el de ${B} atrás, el barco gira casi sobre sí mismo y la proa cae a ${B}, la banda del motor que va atrás, hasta quedar al rumbo opuesto.`;

  function svg(t) {
    const c0 = cambios(t);
    const { out, cierra } = lienzo(W, H, alt);
    // --- montajes, vistos desde popa (Br a la izquierda, Er a la derecha)
    const panel = (cx, k, nombre, sub, ext) => {
      const on = hl.has(k);
      const o = [`<g data-parte="${k}"${hl.size && !on ? ' opacity=".45"' : ''}>`];
      o.push(`<rect x="${cx - 82}" y="14" width="164" height="150" fill="${T.papel}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 2.2 : 0.8}"/>`);
      o.push(rotulo(cx, 36, nombre, { size: TXT.min, estilo: 'cap', weight: 700, color: on ? T.magenta : T.tinta }), rotulo(cx, 54, sub, { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
      o.push(`<path d="M${cx - 54},66 L${cx + 54},66 L${cx + 44},90 L${cx - 44},90 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`);
      o.push(rotulo(cx - 60, 82, 'Br', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'end' }), rotulo(cx + 60, 82, 'Er', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start' }));
      for (const sg of [-1, 1]) o.push(`<line x1="${cx + sg * 26}" y1="90" x2="${cx + sg * 26}" y2="104" stroke="${T.tinta}" stroke-width="1.6"/>`);
      // exterior: levógira (antihoraria vista desde popa) a babor y dextrógira (horaria) a estribor
      o.push(heliceDesdePopa(cx - 26, 112, !ext, T.azul), heliceDesdePopa(cx + 26, 112, ext, T.azul));
      o.push(rotulo(cx - 26, 152, ext ? 'levógira' : 'dextrógira', { size: TXT.min, estilo: 'serif' }), rotulo(cx + 26, 152, ext ? 'dextrógira' : 'levógira', { size: TXT.min, estilo: 'serif' }));
      o.push('</g>');
      return o.join('');
    };
    out.push(panel(92, 'exterior', 'GIRO AL EXTERIOR', 'la habitual', true), panel(266, 'interior', 'GIRO AL INTERIOR', 'supraconvergentes', false));
    out.push(rotulo(W / 2, 184, 'Vistas desde popa', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
    // --- la ciaboga, vista desde arriba
    const on = hl.has('ciaboga');
    out.push(`<g data-parte="ciaboga"${hl.size && !on ? ' opacity=".45"' : ''}>`);
    out.push(`<rect x="12" y="196" width="${W - 24}" height="${H - 208}" fill="${T.agua2}" stroke="${on ? T.magenta : T.tinta}" stroke-width="${on ? 2.2 : 0.8}"/>`);
    out.push(rotulo(W / 2, 216, 'ORDEN', { size: TXT.min, weight: 700, estilo: 'cap', color: T.apagado }),
      el('orden', 'text', { x: W / 2, y: 234, 'font-size': TXT.rotulo + 0.5, 'font-weight': 700, 'text-anchor': 'middle', fill: T.magenta, class: 'lc-serif' }, c0),
      el('reloj', 'text', { x: W / 2, y: 252, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'middle', fill: T.tinta, class: 'lc-mono' }, c0));
    // rumbo inicial, a trazos
    out.push(`<g transform="${situa(O0[0], O0[1], 0)}"><path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="none" stroke="${T.apagado}" stroke-width="1" stroke-dasharray="4 3"/></g>`);
    out.push(`<path d="${arcoD(O0[0], O0[1], Lpx / 2 + 16, s > 0 ? 0 : 290, s > 0 ? 70 : 360)}" fill="none" stroke="${T.verdeTxt}" stroke-width="1.6"/>`);
    const pf = pol(O0[0], O0[1], s * 70, Lpx / 2 + 16);
    const pf0 = pol(O0[0], O0[1], s * 58, Lpx / 2 + 16);
    out.push(flecha(pf0[0], pf0[1], pf[0], pf[1], { color: T.verdeTxt, w: 1.6, punta: 8 }), rotulo(pf[0] + s * 8, pf[1] + 4, `cae a ${B}`, { size: TXT.min, estilo: 'serif', italic: true, weight: 700, color: T.verdeTxt, anchor: s > 0 ? 'start' : 'end' }));
    // el barco, con sus dos hélices, los empujes (avante y atrás) y la presión lateral que ayuda
    const xh = Lpx * 0.13;
    const yh = Lpx / 2 - 4;
    const xAv = -s * xh; // el motor que va avante (el de la otra banda)
    const xAt = s * xh; // el que va atrás (el de la banda del giro)
    const emp = flecha(xAv, yh + 26, xAv, yh - 6, { color: T.azul, w: 2.2 }) + flecha(xAt, yh - 6, xAt, yh + 26, { color: T.magenta, w: 2.2 }) +
      flecha(0, yh + 12, -s * 30, yh + 12, { color: T.apagado, w: 1.4, punta: 7 });
    out.push(el('barco', 'g', {}, c0, `<path d="${cascoPlanta(Lpx, Lpx * 0.34)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<line x1="0" y1="${f1(-Lpx / 2 + 5)}" x2="0" y2="${f1(Lpx / 2 - 3)}" stroke="${T.tinta}" stroke-width=".6"/>` +
      [xAv, xAt].map((x) => `<circle cx="${f1(x)}" cy="${f1(yh)}" r="3.2" fill="${T.tinta}"/>`).join('') +
      el('empujes', 'g', {}, c0, emp)));
    out.push(rotulo(26, H - 52, `${O} avante`, { size: TXT.min, estilo: 'serif', weight: 700, anchor: 'start', color: T.azulTxt }), rotulo(26, H - 34, `${B} atrás`, { size: TXT.min, estilo: 'serif', weight: 700, anchor: 'start', color: T.magenta }));
    out.push(rotulo(26, H - 16, 'gris: presión lateral', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
    out.push(el('cartela-fin', 'g', {}, c0, cartela(W - 92, H - 34, 'AL RUMBO OPUESTO', 'casi sin moverse', { color: T.magenta, ancho: 150 })));
    out.push('</g>');
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion, hitos, svg, cambios, real, datos: { fin, banda } });
}
