// Maniobra con una hélice: ciaboga (la hélice y el timón, la curva de evolución y el desatraque están en sus láminas propias).
// Los barcos se ven en planta. Convenciones: «timón a Er» = la pala (su borde de salida) hacia estribor;
// hélice dextrógira = gira en sentido horario vista desde popa dando avante.

import { open, title, lbl, arrow, C, hullPlan, fx, pol, rad } from './kit.js';

const BANDA = { er: 'estribor', br: 'babor' };
const otra = (b) => (b === 'er' ? 'br' : 'er');
const fo = (x, y, w, h, html) => `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="il-fo">${html}</div></foreignObject>`;

// ---------------------------------------------------------------------------
// Hélice y timón: ahora es interactiva, en src/illustrations/interactivas/helice-timon.js.

// ---------------------------------------------------------------------------
// Curva de evolución: ahora es animada, en src/illustrations/animaciones/evolucion.js.

// ---------------------------------------------------------------------------
// Ciaboga con una hélice dextrógira (girando a estribor). spec: { tipo:'ciaboga' }

export function ciabogaIllustration() {
  const W = 340;
  const H = 290;
  const out = open(W, H, 'Ciaboga', 'cb');
  out.push(title(W / 2, 'Ciaboga con una hélice dextrógira'));
  const P = [[96, 236, 0], [132, 126, 70], [104, 146, 125], [124, 208, 180]];
  const L = 92;
  const ghost = ([x, y, a], n, c) => `<g transform="translate(${x} ${y}) rotate(${a})" opacity=".35">${hullPlan(L, 28, `style="fill:none;stroke:${c};stroke-dasharray:3 3"`)}</g>` +
    `<circle cx="${fx(pol(x, y, a, L / 2 + 10)[0])}" cy="${fx(pol(x, y, a, L / 2 + 10)[1])}" r="8" fill="${c}"/><text x="${fx(pol(x, y, a, L / 2 + 10)[0])}" y="${fx(pol(x, y, a, L / 2 + 10)[1] + 3.5)}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${n}</text>`;
  P.forEach((p, i) => out.push(ghost(p, i === 0 ? 'S' : i, i === 0 ? C.g : [C.v, C.r, C.v][i - 1])));
  const kt = '0;.27;.54;.81;1';
  const tr = [...P, P[3]].map((p) => `${p[0]},${p[1]}`).join(';');
  const ro = [...P, P[3]].map((p) => p[2]).join(';');
  out.push(`<g><animateTransform attributeName="transform" type="translate" values="${tr}" keyTimes="${kt}" dur="9s" repeatCount="indefinite"/>` +
    `<g><animateTransform attributeName="transform" type="rotate" values="${ro}" keyTimes="${kt}" dur="9s" repeatCount="indefinite"/>${hullPlan(L, 28)}</g></g>`);
  out.push(fo(200, 40, 136, 246,
    `<p style="margin:0 0 6px;color:${C.v}"><b>1</b> Avante, todo el timón a estribor: la proa cae a Er.</p>` +
    `<p style="margin:0 0 6px;color:${C.r}"><b>2</b> Atrás, todo el timón a babor: la hélice dextrógira lleva la popa a Br y la proa sigue cayendo a Er, casi sin avanzar.</p>` +
    `<p style="margin:0 0 6px;color:${C.v}"><b>3</b> Avante, timón a estribor, y así hasta completar el giro.</p>` +
    `<p style="margin:0;color:${C.g}">Se repite lo necesario, con máquina a poca velocidad.</p>`));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Para girar en poco espacio con una hélice dextrógira, la ciaboga se hace cayendo a estribor: al dar atrás la hélice lleva la popa a babor y ayuda al giro. Con hélice levógira, al revés: se cae a babor.' };
}

// Desatraque con esprín: ahora es interactiva, en src/illustrations/interactivas/desatraque.js.
