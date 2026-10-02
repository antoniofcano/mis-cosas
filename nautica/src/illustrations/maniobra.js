// Maniobra con una hélice: efecto combinado de hélice y timón, curva de evolución, ciaboga y desatraque con esprín.
// Los barcos se ven en planta. Convenciones: «timón a Er» = la pala (su borde de salida) hacia estribor;
// hélice dextrógira = gira en sentido horario vista desde popa dando avante.

import { open, title, lbl, arrow, C, hullPlan, fx, pol, rad } from './kit.js';

const BANDA = { er: 'estribor', br: 'babor' };
const otra = (b) => (b === 'er' ? 'br' : 'er');
const fo = (x, y, w, h, html) => `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="il-fo">${html}</div></foreignObject>`;

// ---------------------------------------------------------------------------
// Hélice y timón: ahora es interactiva, en src/illustrations/interactivas/helice-timon.js.

// ---------------------------------------------------------------------------
// Curva de evolución. spec: { tipo:'evolucion' }

function evolucionPath() {
  // integración simple: rumbo que cae cada vez más deprisa hasta una velocidad de giro constante
  // y un pequeño desplazamiento inicial hacia la banda contraria (la popa abre). Proporciones típicas:
  // avance ≈ 0,9 del diámetro táctico, traslado ≈ la mitad, diámetro final algo menor que el táctico.
  const pts = [];
  let [x, y, psi] = [72, 320, 0];
  const r = 1 / 71;
  for (let s = 0; s < 40; s++) { y -= 1; pts.push([x, y, 0]); }
  for (let s = 0; psi < rad(300); s++) {
    psi += r * (1 - Math.exp(-s / 104));
    const k = 0.35 * Math.exp(-s / 23);
    x += Math.sin(psi) - k * Math.cos(psi);
    y += -Math.cos(psi) - k * Math.sin(psi);
    pts.push([x, y, psi]);
  }
  return { pts, r };
}

export function evolucionIllustration() {
  const W = 320;
  const H = 340;
  const out = open(W, H, 'Curva de evolución', 'ev');
  out.push(title(W / 2, 'Curva de evolución (todo a estribor)'));
  const { pts, r } = evolucionPath();
  const d = `M${pts.map((p) => `${fx(p[0])},${fx(p[1])}`).join(' L')}`;
  const x0 = 72;
  const start = pts[39];
  const p90 = pts.find((p) => p[2] >= Math.PI / 2);
  const p180 = pts.find((p) => p[2] >= Math.PI);
  out.push(`<line x1="${x0}" y1="330" x2="${x0}" y2="40" stroke="${C.g}" stroke-dasharray="5 4"/>`, lbl(x0 - 4, 48, 'rumbo inicial', 'g', 'end', 'font-size="9"'));
  out.push(`<path d="${d}" fill="none" stroke="${C.v}" stroke-width="2.2"/>`);
  // diámetro final (círculo de giro estabilizado)
  const last = pts[pts.length - 1];
  const R = 1 / r;
  const ccx = last[0] + Math.cos(last[2]) * R;
  const ccy = last[1] + Math.sin(last[2]) * R;
  out.push(`<circle cx="${fx(ccx)}" cy="${fx(ccy)}" r="${fx(R)}" fill="none" stroke="${C.p}" stroke-dasharray="2 4" opacity=".7"/>`);
  out.push(`<line x1="${fx(ccx + 20)}" y1="${fx(ccy - R)}" x2="${fx(ccx + 20)}" y2="${fx(ccy + R)}" stroke="${C.p}" stroke-width="1.2" marker-start="url(#ev-p)" marker-end="url(#ev-p)"/>`, lbl(ccx + 24, ccy + R * 0.55, 'diámetro', 'p', 'start', 'font-size="9"'), lbl(ccx + 24, ccy + R * 0.55 + 10, 'final', 'p', 'start', 'font-size="9"'));
  out.push(`<circle cx="${fx(start[0])}" cy="${fx(start[1])}" r="4" fill="${C.r}"/>`, lbl(start[0] + 8, start[1] + 4, 'timón a la banda', 'r', 'start', 'font-size="9"'));
  // avance: en la dirección del rumbo inicial hasta caer 90°
  out.push(`<line x1="${x0 - 22}" y1="${fx(start[1])}" x2="${x0 - 22}" y2="${fx(p90[1])}" stroke="${C.a}" stroke-width="1.6" marker-start="url(#ev-a)" marker-end="url(#ev-a)"/>`);
  out.push(`<line x1="${x0 - 28}" y1="${fx(p90[1])}" x2="${fx(p90[0])}" y2="${fx(p90[1])}" stroke="${C.a}" stroke-dasharray="2 3" opacity=".6"/>`);
  out.push(lbl(x0 - 26, (start[1] + p90[1]) / 2, 'avance', 'a', 'end', 'font-weight="700"'), lbl(x0 - 26, (start[1] + p90[1]) / 2 + 11, '(a 90°)', 'a', 'end', 'font-size="8.5"'));
  // traslado: perpendicular al rumbo inicial, a los 90°
  out.push(`<line x1="${x0}" y1="${fx(p90[1] - 12)}" x2="${fx(p90[0])}" y2="${fx(p90[1] - 12)}" stroke="${C.m}" stroke-width="1.6" marker-start="url(#ev-m)" marker-end="url(#ev-m)"/>`);
  out.push(lbl((x0 + p90[0]) / 2, p90[1] - 17, 'traslado (a 90°)', 'm', 'middle', 'font-weight="700"'));
  // diámetro táctico: perpendicular al rumbo inicial, a los 180°
  out.push(`<line x1="${x0}" y1="${fx(p180[1])}" x2="${fx(p180[0])}" y2="${fx(p180[1])}" stroke="${C.r}" stroke-width="1.6" marker-start="url(#ev-r)" marker-end="url(#ev-r)"/>`);
  out.push(lbl((x0 + p180[0]) / 2 + 6, p180[1] + 14, 'diámetro táctico', 'r', 'middle', 'font-weight="700"'), lbl((x0 + p180[0]) / 2 + 6, p180[1] + 25, '(a 180°)', 'r', 'middle', 'font-size="8.5"'));
  for (const [p, t] of [[p90, '90°'], [p180, '180°']]) out.push(`<circle cx="${fx(p[0])}" cy="${fx(p[1])}" r="3" fill="${C.v}"/>`, lbl(p[0] + 6, p[1] - 4, t, 'v', 'start', 'font-size="9"'));
  out.push(`<g><path d="M10,0 L-7,6 L-7,-6Z" fill="${C.v}" stroke="#fff"/><animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path="${d}"/></g>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Trayectoria del centro de gravedad con el timón a una banda. Avance: lo que se adelanta en la dirección del rumbo inicial hasta caer 90°. Traslado: lo que se separa de ese rumbo al caer 90°. Diámetro táctico: la separación al caer 180°. Al principio la popa abre hacia la banda contraria y el barco se desplaza un poco hacia ella.' };
}

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
