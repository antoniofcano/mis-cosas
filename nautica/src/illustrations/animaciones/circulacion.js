// Circulación del viento en una borrasca y en un anticiclón (spec { tipo: 'meteo', sistema: 'borrasca' | 'anticiclon' }),
// animada: el aire de superficie se mueve en espiral, girando alrededor del centro (antihorario en la borrasca,
// horario en el anticiclón, hemisferio norte) y cruzando las isobaras con el ángulo de rozamiento de
// src/nautical/meteo.js (CRUCE_ISOBARAS, 25°): hacia dentro en la borrasca (converge y asciende) y hacia fuera en el
// anticiclón (desciende y diverge). Cada partícula sigue una espiral logarítmica, que es la curva que corta todos los
// círculos con el mismo ángulo, deformada como las isobaras del dibujo (elipses).

import { CRUCE_ISOBARAS } from '../../nautical/meteo.js';
import { T, TXT, lienzo, rotulo, cartela, etiqueta, rosaNorte, cotaArco, f1 } from '../estilo-c.js';
import { pista, el, aparece } from './pista.js';

const W = 358;
const H = 334;
const CX = 179;
const CY = 172;
const SX = 1.32; // las isobaras son elipses: 1,32 veces más anchas que altas, giradas −8°
const GIRO = (-8 * Math.PI) / 180;
const R_IN = 30;
const R_OUT = 116;
const V = 24; // px/s a lo largo de la trayectoria (en el círculo sin deformar)
const N = 16;
const ALFA = (CRUCE_ISOBARAS * Math.PI) / 180;
const VIDA = (R_OUT - R_IN) / (V * Math.sin(ALFA));

/** Del círculo (u, w) al dibujo: escala en x y giro, como las isobaras. */
function aDibujo(u, w) {
  const x = u * SX;
  return [CX + x * Math.cos(GIRO) - w * Math.sin(GIRO), CY + x * Math.sin(GIRO) + w * Math.cos(GIRO)];
}

/**
 * Posición de la partícula i en el instante t (s). B: entra de R_OUT a R_IN girando en sentido antihorario visto desde
 * arriba; A: sale de R_IN a R_OUT en sentido horario. Devuelve { p: [x, y], vida: 0…1 }.
 */
export function particula(B, i, t) {
  const fase = ((i * 7) % N) / N;
  const tau = (((t / VIDA + fase) % 1) + 1) % 1 * VIDA;
  const th0 = (i * 2 * Math.PI) / N;
  const cot = 1 / Math.tan(ALFA);
  let r;
  let th;
  if (B) {
    r = R_OUT - V * Math.sin(ALFA) * tau;
    th = th0 - cot * Math.log(R_OUT / r); // en el SVG (y hacia abajo), ángulo decreciente = antihorario a la vista
  } else {
    r = R_IN + V * Math.sin(ALFA) * tau;
    th = th0 + cot * Math.log(r / R_IN);
  }
  return { p: aDibujo(r * Math.cos(th), r * Math.sin(th)), vida: tau / VIDA };
}

export function pistaCirculacion(B) {
  const dur = Math.round(VIDA * 2 * 10) / 10;
  const hitos = B
    ? [
      { t: 0, nombre: 'Gira al revés que el reloj', texto: 'En el hemisferio norte, el aire gira alrededor de la borrasca en sentido antihorario.' },
      { t: dur * 0.3, nombre: 'Cruza las isobaras hacia dentro', texto: `El rozamiento con la mar lo frena y lo desvía unos ${CRUCE_ISOBARAS}° hacia la baja presión: no sopla paralelo a las isobaras.` },
      { t: dur * 0.62, nombre: 'Converge y asciende', texto: 'En el centro el aire que llega de todas partes sube, se enfría y condensa: nubes, lluvia y mal tiempo.' },
    ]
    : [
      { t: 0, nombre: 'Gira como el reloj', texto: 'En el hemisferio norte, el aire gira alrededor del anticiclón en sentido horario.' },
      { t: dur * 0.3, nombre: 'Cruza las isobaras hacia fuera', texto: `El rozamiento con la mar lo desvía unos ${CRUCE_ISOBARAS}° hacia fuera, hacia las presiones más bajas: diverge.` },
      { t: dur * 0.62, nombre: 'Desciende y diverge', texto: 'En el centro el aire baja desde lo alto y se calienta: cielo despejado y viento flojo, con calmas en el centro.' },
    ];

  function cambios(t) {
    const c = {};
    for (let i = 0; i < N; i++) {
      const { p, vida } = particula(B, i, t);
      // cola: 0,8 s hacia atrás, sin cruzar el salto de la vuelta a empezar
      const cola = [];
      for (let k = 4; k >= 1; k--) {
        const dt = (k * 0.8) / 4;
        if (vida * VIDA - dt < 0) continue;
        cola.push(particula(B, i, t - dt).p);
      }
      cola.push(p);
      const q = cola.length > 1 ? cola[cola.length - 2] : particula(B, i, t + 0.1).p;
      const [dx, dy] = cola.length > 1 ? [p[0] - q[0], p[1] - q[1]] : [q[0] - p[0], q[1] - p[1]];
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const op = Math.min(1, vida / 0.08, (1 - vida) / 0.12);
      c[`p${i}`] = { transform: `translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})`, opacity: f1(Math.max(0, op)) };
      c[`c${i}`] = { points: cola.map((x) => `${f1(x[0])},${f1(x[1])}`).join(' '), opacity: f1(Math.max(0, op)) };
    }
    c.cruce = { opacity: aparece(t, hitos[1].t) };
    c.centro = { opacity: aparece(t, hitos[2].t) };
    return c;
  }

  const alt = B
    ? `Animación de una borrasca en el hemisferio norte: isobaras cerradas de 996, 1000 y 1004 hPa alrededor de una B; las partículas de aire giran en sentido antihorario y cruzan las isobaras unos ${CRUCE_ISOBARAS}° hacia el centro, donde el aire asciende.`
    : `Animación de un anticiclón en el hemisferio norte: isobaras cerradas de 1032, 1028 y 1024 hPa alrededor de una A; las partículas de aire salen del centro, donde el aire desciende, giran en sentido horario y cruzan las isobaras unos ${CRUCE_ISOBARAS}° hacia fuera.`;

  function svg(t) {
    const c0 = cambios(t);
    const { out, cierra } = lienzo(W, H, alt);
    [38, 72, 104].forEach((r, i) => {
      const rx = r * SX;
      out.push(`<ellipse cx="${CX}" cy="${CY}" rx="${f1(rx)}" ry="${r}" fill="none" stroke="${T.tinta}" stroke-width="1.2" transform="rotate(-8 ${CX} ${CY})"/>`);
    });
    // el aire: cola fina y punta de flecha
    const parts = [];
    for (let i = 0; i < N; i++) {
      parts.push(el(`c${i}`, 'polyline', { fill: 'none', stroke: T.magenta, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, c0));
      parts.push(el(`p${i}`, 'g', {}, c0, `<polygon points="5,0 -4,-4.5 -4,4.5" fill="${T.magenta}"/>`));
    }
    out.push(`<g data-parte="viento">${parts.join('')}</g>`);
    // presiones (encima del aire, para que se lean)
    [38, 72, 104].forEach((r, i) => {
      const rx = r * SX;
      out.push(etiqueta(CX + rx * 0.99, CY - rx * 0.14, String(B ? 996 + i * 4 : 1032 - i * 4)));
    });
    // el ángulo con que el viento cruza una isobara (en el punto más bajo de la de 72)
    const [px, py] = aDibujo(0, 72);
    // la isobara va hacia el este (borrasca) o el oeste (anticiclón) en ese punto, girada −8° como la elipse; el viento
    // se separa de ella 25° hacia dentro (borrasca, hacia el norte) o hacia fuera (anticiclón, hacia el sur)
    const tang = B ? 82 : 262;
    out.push(el('cruce', 'g', {}, c0, `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(px + Math.sin((tang * Math.PI) / 180) * 40)}" y2="${f1(py - Math.cos((tang * Math.PI) / 180) * 40)}" stroke="${T.tinta}" stroke-width=".8" stroke-dasharray="3 3"/>` +
      `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(px + Math.sin(((tang - CRUCE_ISOBARAS) * Math.PI) / 180) * 40)}" y2="${f1(py - Math.cos(((tang - CRUCE_ISOBARAS) * Math.PI) / 180) * 40)}" stroke="${T.magenta}" stroke-width="1.4"/>` +
      cotaArco(px, py, 28, tang - CRUCE_ISOBARAS, tang, `${CRUCE_ISOBARAS}°`, { color: T.tinta, rEt: 50 })));
    out.push(rotulo(CX, CY + 12, B ? 'B' : 'A', { size: 40, weight: 700, estilo: 'serif', color: B ? T.rojoTxt : T.azulTxt }));
    out.push(rotulo(CX, CY + 30, B ? 'BAJA' : 'ALTA', { size: TXT.min, weight: 700, estilo: 'cap', color: B ? T.rojoTxt : T.azulTxt }));
    out.push(el('centro', 'g', {}, c0, rotulo(CX, CY - 32, B ? 'el aire sube' : 'el aire baja', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: B ? T.rojoTxt : T.azulTxt })));
    out.push(cartela(84, 28, 'HEMISFERIO NORTE', null, { ancho: 140 }), rosaNorte(W - 34, 34));
    out.push(cartela(CX, H - 32, B ? 'GIRO ANTIHORARIO' : 'GIRO HORARIO', B ? 'el viento converge hacia el centro' : 'el viento diverge hacia fuera', { ancho: 236 }));
    out.push(cierra());
    return out.join('');
  }

  return pista({ duracion: dur, hitos, svg, cambios });
}
