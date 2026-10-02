// Maniobra con una hélice: efecto combinado de hélice y timón, curva de evolución, ciaboga y desatraque con esprín.
// Los barcos se ven en planta. Convenciones: «timón a Er» = la pala (su borde de salida) hacia estribor;
// hélice dextrógira = gira en sentido horario vista desde popa dando avante.

import { open, title, lbl, arrow, C, hullPlan, fx, pol, rad } from './kit.js';

const BANDA = { er: 'estribor', br: 'babor' };
const otra = (b) => (b === 'er' ? 'br' : 'er');
const fo = (x, y, w, h, html) => `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="il-fo">${html}</div></foreignObject>`;

// ---------------------------------------------------------------------------
// Hélice y timón. spec: { tipo:'helice-timon', marcha:'avante'|'atras', timon:'er'|'br', sentido:'dextrogira'|'levogira' }

export function heliceTimonIllustration(spec) {
  const atras = spec.marcha === 'atras';
  const timon = spec.timon === 'br' ? 'br' : 'er';
  const dex = spec.sentido !== 'levogira';
  // efecto del timón (con arrancada): avante la popa va a la banda contraria al timón; atrás, a la misma banda
  const popaTimon = atras ? timon : otra(timon);
  // presión lateral de las palas: dextrógira avante → popa a Er; atrás → popa a Br (levógira, al revés)
  const popaHelice = (dex !== atras) ? 'er' : 'br';
  const suma = popaTimon === popaHelice;
  const proa = otra(popaTimon);
  const W = 340;
  const H = 280;
  const out = open(W, H, 'Hélice y timón', 'ht');
  out.push(title(W / 2, `${atras ? 'Atrás' : 'Avante'} · timón a ${BANDA[timon]} · hélice ${dex ? 'dextrógira' : 'levógira'}`));
  const cx = 108;
  const cy = 150;
  const L = 160;
  const sgn = (b) => (b === 'er' ? 1 : -1);
  // casco girando alrededor de su punto de giro (avante, a ~1/3 de la eslora desde proa; atrás, a ~1/3 desde popa)
  const piv = atras ? L / 6 : -L / 6;
  const ang = sgn(proa) * (suma ? 24 : 10);
  const rud = sgn(timon) * 32;
  const [rx, ry] = [Math.sin(rad(rud)) * 18, Math.cos(rad(rud)) * 18];
  const wash = atras ? arrow(0, L / 2 + 6, 0, L / 2 - 26, 'v', 'ht', 2.6, 'opacity=".8"') : arrow(0, L / 2 + 4, 0, L / 2 + 34, 'v', 'ht', 2.6, 'opacity=".8"');
  out.push(`<g transform="translate(${cx} ${cy})"><g>` +
    `<animateTransform attributeName="transform" type="translate" values="0,0;0,${atras ? 14 : -14};0,${atras ? 14 : -14}" keyTimes="0;.75;1" dur="5s" repeatCount="indefinite"/>` +
    `<g><animateTransform attributeName="transform" type="rotate" values="0 0 ${piv};${ang} 0 ${piv};${ang} 0 ${piv}" keyTimes="0;.75;1" dur="5s" repeatCount="indefinite"/>` +
    hullPlan(L, 50) + `<line x1="0" y1="${L / 2}" x2="${fx(rx)}" y2="${fx(L / 2 + ry)}" stroke="${C.r}" stroke-width="4" stroke-linecap="round"/>` +
    `<rect x="-9" y="${L / 2 - 8}" width="18" height="4" rx="2" fill="${C.g}"/>` + wash +
    `<circle cx="0" cy="${piv}" r="3" fill="${C.p}"/></g></g></g>`);
  out.push(lbl(cx, cy - L / 2 - 8, 'proa', null, 'middle'), lbl(cx - 44, cy - 50, 'Br', null, 'middle', 'font-weight="700"'), lbl(cx + 44, cy - 50, 'Er', null, 'middle', 'font-weight="700"'));
  out.push(lbl(cx + 8, cy + piv + 4, 'punto de giro', 'p', 'start', 'font-size="8.5"'));
  // flechas de efecto en la popa
  const sy = cy + L / 2 - 14;
  out.push(arrow(cx + sgn(popaTimon) * 30, sy, cx + sgn(popaTimon) * 62, sy, 'r', 'ht', 2.6));
  out.push(arrow(cx + sgn(popaHelice) * 30, sy + 22, cx + sgn(popaHelice) * (suma ? 62 : 50), sy + 22, 'a', 'ht', 1.8));
  out.push(lbl(cx + sgn(popaTimon) * 64, sy - 6, 'timón', 'r', popaTimon === 'er' ? 'start' : 'end', 'font-size="9"'));
  out.push(lbl(cx + sgn(popaHelice) * 64, sy + 30, 'hélice', 'a', popaHelice === 'er' ? 'start' : 'end', 'font-size="9"'));
  const res = suma
    ? `La proa cae a <b>${BANDA[proa]}</b> con rapidez: timón y hélice suman.`
    : atras
      ? `La proa cae a <b>${BANDA[proa]}</b> solo si lleva arrancada atrás suficiente; con poca arrancada domina la hélice y la popa se va a ${BANDA[popaHelice]}.`
      : `La proa cae a <b>${BANDA[proa]}</b>, algo más despacio: la hélice resta un poco.`;
  out.push(fo(212, 40, 124, 230,
    `<p style="margin:0 0 6px;color:${C.r}"><b>Timón</b> a ${BANDA[timon]} ${atras ? 'con arrancada atrás' : 'avante'}: popa a ${BANDA[popaTimon]}.</p>` +
    `<p style="margin:0 0 6px;color:${C.a}"><b>Hélice</b> ${dex ? 'dextrógira' : 'levógira'} ${atras ? 'atrás' : 'avante'}: popa a ${BANDA[popaHelice]} (presión lateral de las palas).</p>` +
    `<p style="margin:0">${res}</p>`));
  out.push('</svg>');
  const cap = atras
    ? `Dando atrás el timón actúa al revés que avante (la popa va hacia el lado del timón) y necesita arrancada; la hélice ${dex ? 'dextrógira' : 'levógira'} lleva la popa a ${BANDA[popaHelice]} con mucha fuerza.`
    : `Avante, el chorro de la hélice incide en el timón y lo hace eficaz incluso con poca arrancada: la popa va a la banda contraria al timón. La hélice ${dex ? 'dextrógira' : 'levógira'} tiende a llevar la popa a ${BANDA[popaHelice]}, un efecto pequeño avante.`;
  return { svg: out.join(''), caption: cap };
}

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

// ---------------------------------------------------------------------------
// Desatraque abriendo la popa o la proa con un esprín. spec: { tipo:'desatraque', abrir:'popa'|'proa' }

export function desatraqueIllustration(spec) {
  const popa = (spec.abrir ?? 'popa') !== 'proa';
  const W = 340;
  const H = 300;
  const out = open(W, H, 'Desatraque con esprín', 'dt');
  out.push(title(W / 2, popa ? 'Desatracar abriendo la popa' : 'Desatracar abriendo la proa'));
  const qy = 226;
  out.push(`<rect x="0" y="${qy}" width="${W}" height="${H - qy}" fill="#a16207" opacity=".75"/>`, lbl(W / 2, H - 12, 'MUELLE', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  // barco atracado por babor: proa a la izquierda, babor (abajo) al muelle
  const L = 190;
  const B = 40;
  const cx = 170;
  const cy = qy - B / 2 - 3;
  const bowX = cx - L / 2;
  const sternX = cx + L / 2;
  const piv = popa ? [bowX + 18, qy - 3] : [sternX - 10, qy - 3]; // la defensa: en la amura o en la aleta
  const ang = popa ? -28 : 26;
  const shipPt = popa ? [bowX + 26, qy - 4] : [sternX - 18, qy - 4]; // donde se hace firme el esprín a bordo
  const bol = popa ? [bowX + 96, qy + 6] : [sternX - 84, qy + 6];
  const rot = ([x, y], a) => { const c = Math.cos(rad(a)); const s = Math.sin(rad(a)); const dx = x - piv[0]; const dy = y - piv[1]; return [piv[0] + dx * c - dy * s, piv[1] + dx * s + dy * c]; };
  const steps = [0, 0.25, 0.5, 0.75, 1, 1];
  const kt = '0;.15;.3;.45;.6;1';
  const sp = steps.map((k) => rot(shipPt, ang * k));
  out.push(`<g><animateTransform attributeName="transform" type="rotate" values="${steps.map((k) => `${fx(ang * k)} ${piv[0]} ${piv[1]}`).join(';')}" keyTimes="${kt}" dur="7s" repeatCount="indefinite"/>` +
    `<g transform="translate(${cx} ${cy}) rotate(-90)">${hullPlan(L, B)}` +
    // timón: con la proa a la izquierda, babor queda abajo (hacia el muelle)
    (popa ? `<line x1="0" y1="${L / 2}" x2="${fx(-Math.sin(rad(30)) * 16)}" y2="${fx(L / 2 + Math.cos(rad(30)) * 16)}" stroke="${C.r}" stroke-width="4" stroke-linecap="round"/>` : `<line x1="0" y1="${L / 2}" x2="0" y2="${L / 2 + 16}" stroke="${C.r}" stroke-width="4" stroke-linecap="round"/>`) +
    (popa ? arrow(0, L / 2 - 30, 0, L / 2 - 70, 'v', 'dt', 2.6) : arrow(0, L / 2 - 70, 0, L / 2 - 30, 'v', 'dt', 2.6)) +
    `</g></g>`);
  out.push(`<line x1="${fx(sp[0][0])}" y1="${fx(sp[0][1])}" x2="${bol[0]}" y2="${bol[1]}" stroke="${C.a}" stroke-width="2.4">` +
    `<animate attributeName="x1" values="${sp.map((p) => fx(p[0])).join(';')}" keyTimes="${kt}" dur="7s" repeatCount="indefinite"/>` +
    `<animate attributeName="y1" values="${sp.map((p) => fx(p[1])).join(';')}" keyTimes="${kt}" dur="7s" repeatCount="indefinite"/></line>`);
  out.push(`<circle cx="${bol[0]}" cy="${bol[1]}" r="4.5" fill="#334155"/>`, `<circle cx="${piv[0]}" cy="${piv[1]}" r="5" fill="#f97316" stroke="#7c2d12"/>`);
  out.push(lbl(bowX - 4, cy + 4, 'proa', null, 'end'), lbl(bol[0], qy + 36, popa ? 'esprín de proa' : 'esprín de popa', null, 'middle', 'font-weight="700" style="fill:#fff"'));
  out.push(lbl(piv[0] + (popa ? -8 : 8), qy + 20, popa ? 'defensa en la amura' : 'defensa en la aleta', null, popa ? 'start' : 'end', 'font-size="9" style="fill:#fff"'));
  out.push(fo(12, 32, 316, 96, popa
    ? `<p style="margin:0 0 4px">1. Se larga todo menos el <b style="color:${C.a}">esprín de proa</b>.</p><p style="margin:0 0 4px">2. Avante poca, con el <b style="color:${C.r}">timón al muelle</b> (a babor): la proa se apoya en la defensa y <b>la popa se abre</b>.</p><p style="margin:0">3. Con 30–40° abierta, se larga el esprín y se sale <b>atrás</b>.</p>`
    : `<p style="margin:0 0 4px">1. Se larga todo menos el <b style="color:${C.a}">esprín de popa</b>.</p><p style="margin:0 0 4px">2. Atrás poca: la popa se apoya en la defensa y <b>la proa se abre</b>. Atracado por babor, la dextrógira dando atrás ayuda.</p><p style="margin:0">3. Con la proa abierta, se larga el esprín y se sale <b>avante</b>.</p>`));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: popa
      ? 'Abrir la popa: el esprín de proa impide que el barco avance y hace de pivote en la amura; el timón al muelle con máquina avante empuja la popa hacia fuera. Se sale dando atrás, lejos del muelle.'
      : 'Abrir la proa: el esprín de popa impide que el barco retroceda y hace de pivote en la aleta; con máquina atrás la proa se separa. Dando atrás el timón apenas gobierna; la hélice dextrógira lleva la popa a babor, que aquí es el muelle.',
  };
}
