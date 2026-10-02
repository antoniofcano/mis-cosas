// Láminas de fondeo, nudos, atraque y remolque (lecciones per-1-6, per-2-2, per-2-5, per-2-6, per-3-8 y per-7-7).
// Mismo estilo que seamanship.js y navigation.js: fondo il-panel, trazos con currentColor y superficies con las
// variables --l-* (y --land para el fondo y el muelle), para que se lean igual en los temas claro y oscuro.

import { C, open, title, lbl as kitLbl, arrow, hullPlan, fx as f } from '../kit.js';

// Los textos de color usan las variables del tema (más contraste en oscuro); el gris pasa a currentColor.
const TXT = { r: 'var(--l-r)', v: 'var(--l-v)', p: 'var(--l-p)', m: 'var(--l-m)', a: 'var(--l-a)', g: null };
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => kitLbl(x, y, t, c in TXT ? TXT[c] : c, anchor, extra);

// ---------------------------------------------------------------------------
// Utilidades comunes

const sel = (r) => new Set(Array.isArray(r) ? r : r ? [r] : []);
/** Rótulo de una parte: si está resaltada, en rojo y negrita. */
const pt = (hl, k, x, y, t, anchor = 'start') => (hl.has(k) ? lbl(x, y, t, 'r', anchor, 'font-weight="700"') : lbl(x, y, t, null, anchor));
const bold = (x, y, t, c = null, anchor = 'start') => lbl(x, y, t, c, anchor, 'font-weight="700"');
const lead = (x1, y1, x2, y2) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="currentColor" stroke-width=".8" opacity=".55"/>`;
const clipDef = (id, W, H) => `<clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="10"/></clipPath>`;
const sea = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:var(--l-mar)"/>`;
const tierra = (d) => `<path d="${d}" style="fill:var(--land);stroke:var(--land-stroke)"/>`;
const surf = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" style="stroke:var(--l-v)" stroke-width="1.4"/>`;
const casco = 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"';

/** Casco de perfil con la flotación en y; bow: 'left' (proa a la izquierda, se extiende a +x) o 'right'. */
function hullSide(xb, y, L, bow = 'left', extra = '') {
  const s = bow === 'left' ? '' : ' scale(-1 1)';
  return `<g transform="translate(${f(xb)} ${f(y)})${s}" ${extra}><path d="M0,-13 L${f(L)},-11 L${f(L - 3)},4 Q${f(L * 0.45)},9 ${f(L * 0.14)},3 Z" ${casco}/>` +
    `<rect x="${f(L * 0.42)}" y="-20" width="${f(L * 0.3)}" height="8" rx="2" ${casco}/></g>`;
}

/** Casco en planta centrado en (cx, cy) y girado rot grados (0 = proa arriba). */
const hp = (cx, cy, rot, L, B, extra = '') => `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">${hullPlan(L, B, `style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.3" ${extra}`)}</g>`;
/** Punto (lx, ly) del sistema local de un casco en planta, en coordenadas del dibujo. */
const hpP = (cx, cy, rot, lx, ly) => {
  const a = (rot * Math.PI) / 180;
  return [cx + lx * Math.cos(a) - ly * Math.sin(a), cy + lx * Math.sin(a) + ly * Math.cos(a)];
};

/** Ancla pequeña: (x, y) es el arganeo; sin girar, la caña baja y la cruz queda abajo. */
function anchorG(x, y, s = 1, rot = 0, col = 'currentColor') {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})" fill="none" stroke="${col}" stroke-width="${f(2.2 / Math.sqrt(s))}" stroke-linecap="round">` +
    `<circle cx="0" cy="-2.5" r="2.5"/><path d="M0,0 L0,21 M-10,11 Q-9,21 0,21 Q9,21 10,11"/>` +
    `<path d="M-10,8 L-13,15 L-7,14Z M10,8 L13,15 L7,14Z" fill="${col}"/></g>`;
}
/** Dónde queda la cruz de anchorG (para afirmar el orinque). */
const cruzDe = (x, y, s, rot) => {
  const a = (rot * Math.PI) / 180;
  return [x - 21 * s * Math.sin(a), y + 21 * s * Math.cos(a)];
};
const cadena = (d, on = false) => `<path d="${d}" fill="none" stroke="${on ? C.r : 'currentColor'}" stroke-width="${on ? 4 : 3.2}" stroke-dasharray="3.5 1.8"/>`;
const cabo = (d, col, w = 2, extra = '') => `<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;

// ---------------------------------------------------------------------------
// Fondeo. spec: { tipo:'fondeo', vista:'ancla'|'linea'|'borneo'|'garreo'|'orinque'|'voces', resaltar? }

const PARTES_ANCLA = ['arganeo', 'cana', 'cruz', 'brazos', 'unas', 'cepo', 'arado', 'danforth', 'rezon', 'almirantazgo'];
const PARTES_LINEA = ['barboten', 'cabiron', 'embrague', 'freno', 'cadena', 'estacha', 'grillete'];
const VOCES = ['pendura', 'fondo', 'filar', 'virar', 'pique', 'zarpa', 'clara'];

function fondeoAncla(hl) {
  const W = 320;
  const H = 296;
  const out = open(W, H, 'Partes del ancla y tipos', 'fa');
  out.push(title(160, 'Partes del ancla (sin cepo) y tipos'));
  const red = (k) => (hl.has(k) ? C.r : 'currentColor');
  const bar = (d, k, w = 6) => `<path d="${d}" fill="none" stroke="${red(k)}" stroke-width="${w + 2.4}" stroke-linecap="round"/><path d="${d}" fill="none" style="stroke:var(--l-casco)" stroke-width="${w}" stroke-linecap="round"/>`;
  // ancla grande
  out.push(bar('M106,118 Q118,156 160,152 Q202,156 214,118', 'brazos'));
  out.push(bar('M160,58 L160,150', 'cana'));
  out.push(`<circle cx="160" cy="46" r="9" fill="none" stroke="${red('arganeo')}" stroke-width="${hl.has('arganeo') ? 4 : 3}"/>`);
  out.push(`<path d="M104,104 L92,132 L116,126Z M216,104 L228,132 L204,126Z" style="fill:var(--l-casco)" stroke="${red('unas')}" stroke-width="${hl.has('unas') ? 2.6 : 1.4}"/>`);
  out.push(`<circle cx="160" cy="151" r="5" fill="${red('cruz')}"/>`);
  out.push(lead(170, 46, 186, 46), pt(hl, 'arganeo', 189, 50, 'arganeo (va la cadena)'));
  out.push(lead(166, 100, 186, 100), pt(hl, 'cana', 189, 104, 'caña'));
  out.push(lead(160, 157, 160, 166), pt(hl, 'cruz', 160, 177, 'cruz', 'middle'));
  out.push(lead(205, 146, 222, 156), pt(hl, 'brazos', 225, 160, 'brazo'));
  out.push(lead(115, 146, 98, 156), pt(hl, 'brazos', 95, 160, 'brazo', 'end'));
  out.push(lead(97, 114, 84, 106), pt(hl, 'unas', 81, 104, 'uña', 'end'));
  out.push(lead(223, 114, 236, 106), pt(hl, 'unas', 239, 104, 'uña'));
  // tipos
  out.push(`<line x1="12" y1="190" x2="308" y2="190" stroke="currentColor" opacity=".25"/>`);
  const ico = {
    arado: '<path d="M0,-26 L0,10"/><circle cx="0" cy="-29" r="3"/><path d="M0,30 C-6,22 -22,14 -22,0 C-12,6 -4,8 0,6 C4,8 12,6 22,0 C22,14 6,22 0,30Z" fill="var(--l-casco)"/>',
    danforth: '<path d="M0,-26 L0,22"/><circle cx="0" cy="-29" r="3"/><path d="M-24,22 L24,22"/><path d="M-3,20 L-19,-10 L-9,-14 L-2,10Z M3,20 L19,-10 L9,-14 L2,10Z" fill="var(--l-casco)"/>',
    rezon: '<path d="M0,-26 L0,18"/><circle cx="0" cy="-29" r="3"/><path d="M0,18 Q-20,20 -21,0 M0,18 Q20,20 21,0 M0,18 Q-9,24 -9,6 M0,18 Q9,24 9,6"/>',
    almirantazgo: '<path d="M0,-26 L0,18"/><circle cx="0" cy="-29" r="3"/><path d="M0,18 Q-20,20 -22,-2 M0,18 Q20,20 22,-2"/><path d="M-22,-6 L-26,4 L-18,2Z M22,-6 L26,4 L18,2Z" fill="var(--l-casco)"/>',
  };
  const tipos = [['arado', 'De arado', 'una reja'], ['danforth', 'Danforth', 'dos palas'], ['rezon', 'Rezón', '4 o 5 brazos'], ['almirantazgo', 'Almirantazgo', 'con cepo']];
  tipos.forEach(([k, n, nota], i) => {
    const x = 42 + i * 78;
    const on = hl.has(k);
    if (on) out.push(`<rect x="${x - 38}" y="196" width="76" height="96" rx="6" fill="none" stroke="${C.r}" stroke-width="2"/>`);
    out.push(`<g transform="translate(${x} 232)" fill="none" stroke="${on ? C.r : 'currentColor'}" stroke-width="${on ? 2.6 : 2}" stroke-linejoin="round">${ico[k]}</g>`);
    if (k === 'almirantazgo') out.push(`<line x1="${x - 18}" y1="${232 - 21}" x2="${x + 18}" y2="${232 - 21}" stroke="${hl.has('cepo') ? C.r : 'currentColor'}" stroke-width="${hl.has('cepo') ? 4.5 : 3.5}" stroke-linecap="round"/>`);
    out.push(on ? bold(x, 274, n, 'r', 'middle') : bold(x, 274, n, null, 'middle'));
    out.push(k === 'almirantazgo' ? pt(hl, 'cepo', x, 287, nota, 'middle') : lbl(x, 287, nota, null, 'middle'));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Ancla sin cepo: arganeo (donde se une la cadena con un grillete), caña, cruz, brazos y uñas. La de almirantazgo añade el cepo, una barra junto al arganeo. En foto: una reja es de arado; dos palas anchas, Danforth.' };
}

function fondeoLinea(hl) {
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Molinete y línea de fondeo', 'fl');
  out.push(clipDef('fl', W, H), title(160, 'Molinete y línea de fondeo'));
  const red = (k, base = 'currentColor') => (hl.has(k) ? C.r : base);
  const sw = (k, w) => (hl.has(k) ? w + 1.2 : w);
  // --- molinete (de frente)
  out.push(`<rect x="8" y="32" width="172" height="110" rx="6" fill="none" stroke="currentColor" opacity=".3"/>`);
  out.push(`<rect x="26" y="106" width="144" height="6" ${casco}/>`);
  out.push(`<line x1="30" y1="82" x2="166" y2="82" stroke="currentColor" stroke-width="3"/>`);
  out.push(`<rect x="88" y="68" width="36" height="38" rx="4" ${casco}/>`, lbl(106, 90, 'motor', null, 'middle', 'font-size="9"'));
  // barbotén con muescas
  out.push(`<rect x="46" y="64" width="26" height="40" rx="3" style="fill:var(--l-casco)" stroke="${red('barboten')}" stroke-width="${sw('barboten', 1.3)}"/>`);
  for (let y = 68; y < 102; y += 6) out.push(`<rect x="55" y="${y}" width="8" height="3" fill="${red('barboten')}"/>`);
  // cadena que baja del barbotén
  out.push(`<line x1="59" y1="104" x2="59" y2="140" stroke="currentColor" stroke-width="3" stroke-dasharray="3.5 1.8"/>`);
  // freno: palanca sobre el barbotén
  out.push(`<path d="M50,64 Q59,58 68,64 L82,50" fill="none" stroke="${red('freno')}" stroke-width="${sw('freno', 2.4)}"/><circle cx="83" cy="49" r="3.5" fill="${red('freno')}"/>`);
  // embrague: corona en el eje junto al barbotén
  out.push(`<rect x="33" y="74" width="9" height="16" rx="2" style="fill:var(--l-casco)" stroke="${red('embrague')}" stroke-width="${sw('embrague', 1.3)}"/>`);
  // cabirón liso
  out.push(`<path d="M138,64 L166,64 L159,82 L166,100 L138,100 L145,82Z" style="fill:var(--l-casco)" stroke="${red('cabiron')}" stroke-width="${sw('cabiron', 1.3)}"/>`);
  out.push(pt(hl, 'freno', 89, 52, 'freno'));
  out.push(pt(hl, 'cabiron', 152, 47, 'cabirón', 'middle'), lbl(152, 58, '(liso)', null, 'middle'));
  out.push(lead(37, 74, 30, 56), pt(hl, 'embrague', 14, 50, 'embrague'));
  out.push(lead(72, 100, 80, 116), pt(hl, 'barboten', 70, 126, 'barbotén'), lbl(70, 137, '(con muescas)'));
  // --- la norma
  out.push(bold(190, 46, 'La norma pide'), lbl(190, 59, '(RD 339/2021, art. 11)', null, 'start', 'font-size="9"'));
  out.push(lbl(190, 76, 'línea ≥ 5 × eslora'), lbl(190, 90, 'cadena ≥ 1 × eslora'), lbl(190, 104, 'empalmes con grillete'), lbl(190, 118, 'eslora ≤ 6 m: vale'), lbl(190, 130, 'toda de estacha'));
  // --- perfil
  const yw = 160;
  out.push(`<g clip-path="url(#fl-clip)">${sea(0, yw, W, H - yw)}${tierra(`M0,270 Q80,262 160,268 T320,266 L320,${H} L0,${H}Z`)}</g>`, surf(0, W, yw));
  out.push(hullSide(228, yw, 84, 'left'));
  out.push(`<rect x="238" y="${yw - 19}" width="9" height="6" fill="currentColor"/>`);
  out.push(cabo(`M230,${yw - 10} Q200,200 152,236`, hl.has('estacha') ? C.r : 'var(--l-a)', hl.has('estacha') ? 3.4 : 2.4));
  out.push(cadena('M152,236 Q112,268 64,266', hl.has('cadena')));
  out.push(anchorG(62, 266, 0.9, 90));
  for (const [x, y] of [[152, 236], [63, 266]]) out.push(`<circle cx="${x}" cy="${y}" r="3.6" class="il-panel" stroke="${red('grillete')}" stroke-width="${sw('grillete', 1.6)}"/>`);
  out.push(pt(hl, 'estacha', 198, 222, 'estacha (cabo)'));
  out.push(pt(hl, 'cadena', 96, 244, 'cadena', 'end'), lbl(96, 256, 'catenaria', null, 'end', 'font-style="italic"'));
  out.push(pt(hl, 'grillete', 160, 244, 'grillete'));
  out.push(lbl(40, 288, 'ancla', null, 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'El barbotén (con muescas) mueve la cadena; el cabirón, liso, es para cabos. La línea de fondeo debe medir al menos 5 esloras, con un tramo de cadena de al menos 1 eslora y grilletes en los empalmes; la cadena forma la catenaria, que amortigua los tirones.' };
}

function fondeoBorneo() {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Círculo de borneo', 'fb');
  out.push(clipDef('fb', W, H), `<g clip-path="url(#fb-clip)">${sea(0, 30, W, H - 30)}</g>`);
  out.push(title(160, 'Círculo de borneo (visto desde arriba)'));
  const [ax, ay, R] = [118, 168, 100];
  out.push(`<circle cx="${ax}" cy="${ay}" r="${R}" fill="none" stroke="${C.v}" stroke-width="2.2" stroke-dasharray="7 4"/>`);
  // posición tras rolar el viento (fantasma)
  out.push(`<g opacity=".45">${cadena(`M${ax},${ay} L${ax - 58},${ay}`)}${hp(ax - 80, ay, 90, 42, 14)}</g>`);
  out.push(`<path d="M${ax - 10},${ay + R + 8} A${R + 8},${R + 8} 0 0 1 ${ax - R - 8},${ay + 10}" fill="none" stroke="${C.g}" stroke-width="1.8" marker-end="url(#fb-g)"/>`);
  out.push(lbl(ax - 74, ay + 92, 'borneo', 'g', 'end', 'font-weight="700"'));
  // posición actual
  out.push(cadena(`M${ax},${ay} L${ax},${ay + 58}`), hp(ax, ay + 79, 0, 42, 14));
  out.push(anchorG(ax, ay - 2, 0.8, 0, C.r), bold(ax - 8, ay - 12, 'ancla', 'r', 'end'));
  // cotas del radio
  const xd = ax + 16;
  out.push(`<path d="M${xd},${ay} L${xd + 5},${ay} M${xd},${ay + 58} L${xd + 5},${ay + 58} M${xd},${ay + R} L${xd + 5},${ay + R}" stroke="currentColor"/>`);
  out.push(`<line x1="${xd + 2.5}" y1="${ay}" x2="${xd + 2.5}" y2="${ay + R}" stroke="currentColor"/>`);
  out.push(lbl(xd + 9, ay + 26, 'cadena'), lbl(xd + 9, ay + 38, 'filada'), lbl(xd + 9, ay + 84, 'eslora'));
  // viento
  out.push(arrow(276, 36, 276, 70, 'g', 'fb', 2.6), lbl(270, 50, 'viento', 'g', 'end'));
  out.push(arrow(312, 100, 284, 100, 'g', 'fb', 2, 'stroke-dasharray="4 3"'), lbl(298, 114, 'luego', 'g', 'middle'));
  // texto
  const tx = 232;
  out.push(bold(tx, 140, 'radio ≈'), bold(tx, 154, 'cadena filada'), bold(tx, 168, '+ eslora'));
  out.push(lbl(tx, 194, 'Dentro, nada:'), lbl(tx, 207, 'bajos, costa,'), lbl(tx, 220, 'boyas, barcos'));
  out.push(bold(tx, 246, 'Menos borneo:'), lbl(tx, 259, 'menos cadena'), lbl(tx, 272, 'o una 2ª ancla'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Al rolar el viento o la corriente, el barco gira alrededor del ancla. Prevé un radio ≈ cadena filada + eslora (por exceso) sin bajos, costa, boyas ni barcos dentro. Se reduce filando menos cadena o fondeando una segunda ancla; dar máquina no lo cambia.' };
}

function fondeoGarreo() {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Garreo', 'fg');
  out.push(clipDef('fg', W, H), title(160, 'Garrear: el ancla se arrastra'));
  const panel = (y0, bien) => {
    const yw = y0 + 34;
    const yb = y0 + 112;
    const o = [];
    o.push(`<g clip-path="url(#fg-clip)">${sea(0, yw, W, yb - yw + 6)}${tierra(`M0,${yb} L${W},${yb} L${W},${yb + 14} L0,${yb + 14}Z`)}</g>`, surf(0, W, yw));
    o.push(bien ? bold(14, y0 + 14, 'Bien: cadena suficiente', 'm') : bold(14, y0 + 14, 'Garrea: poca cadena', 'r'));
    o.push(arrow(250, y0 + 10, 290, y0 + 10, 'g', 'fg', 2.2), lbl(246, y0 + 14, 'viento', 'g', 'end'));
    if (bien) {
      o.push(hullSide(232, yw, 70, 'left'));
      o.push(cadena(`M233,${yw - 9} Q190,${yb} 120,${yb - 2} L56,${yb - 2}`));
      o.push(anchorG(54, yb - 2, 0.8, 90));
      o.push(lbl(80, yb - 34, 'tiro horizontal:', null, 'start'), lbl(80, yb - 21, 'el ancla clava', null, 'start'));
    } else {
      o.push(hullSide(150, yw, 70, 'left'));
      o.push(cadena(`M151,${yw - 9} Q132,${yw + 30} 104,${yb - 14}`));
      o.push(anchorG(104, yb - 14, 0.8, 52));
      o.push(arrow(132, yw + 14, 146, yw - 4, 'r', 'fg', 2.2));
      o.push(`<path d="M30,${yb - 1} L84,${yb - 1}" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4" opacity=".6"/>`);
      o.push(arrow(70, yb - 22, 98, yb - 22, 'r', 'fg', 2.4));
      o.push(bold(14, yw + 22, 'tira hacia arriba', 'r'), bold(14, yw + 36, 'y la desclava', 'r'));
      o.push(lbl(226, yb - 26, 'el barco deriva', null, 'start'), arrow(232, yb - 40, 262, yb - 40, 'r', 'fg', 2));
    }
    return o.join('');
  };
  out.push(panel(30, true), panel(160, false));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con cadena suficiente el tiro llega horizontal y el ancla trabaja tumbada y clavada. Con poca cadena el tiro va hacia arriba, desclava el ancla y el barco garrea: deriva arrastrándola. Otras causas: mal tenedero, mala maniobra, más viento del previsto o ancla sucia.' };
}

function fondeoOrinque(hl) {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Orinque y boyarín', 'fo');
  out.push(clipDef('fo', W, H), title(160, 'Orinque y boyarín'));
  out.push(lbl(160, 42, 'largo del orinque > profundidad en pleamar', null, 'middle', 'font-weight="700"'));
  const yw = 74;
  const yb = 246;
  out.push(`<g clip-path="url(#fo-clip)">${sea(0, yw, W, H - yw)}${tierra(`M0,${yb} L70,${yb} Q78,${yb - 16} 92,${yb - 12} Q100,${yb - 20} 110,${yb} L${W},${yb} L${W},${H} L0,${H}Z`)}</g>`, surf(0, W, yw));
  out.push(lbl(W - 8, yw - 4, 'pleamar', 'v', 'end'));
  out.push(hullSide(232, yw, 78, 'left'));
  out.push(cadena(`M233,${yw - 9} Q196,${yb - 10} 150,${yb - 2} L102,${yb - 2}`));
  // ancla enrocada bajo una piedra, con la caña hacia la cadena
  out.push(anchorG(100, yb - 2, 0.95, 75));
  const [cx, cy] = cruzDe(100, yb - 2, 0.95, 75);
  out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="3" fill="${hl.has('cruz') ? C.r : 'currentColor'}"/>`);
  // orinque y boyarín
  const on = hl.has('orinque');
  out.push(cabo(`M${f(cx)},${f(cy)} C${f(cx - 26)},${f(cy - 60)} 40,150 58,${yw + 4}`, on ? C.r : 'var(--l-a)', on ? 3 : 2.2));
  out.push(`<ellipse cx="58" cy="${yw - 1}" rx="9" ry="7" fill="#f97316" stroke="${hl.has('boyarin') ? C.r : 'currentColor'}" stroke-width="${hl.has('boyarin') ? 2.6 : 1.4}"/>`);
  out.push(pt(hl, 'boyarin', 72, yw - 8, 'boyarín'));
  out.push(pt(hl, 'orinque', 60, 112, 'orinque'));
  out.push(pt(hl, 'cruz', cx - 8, cy + 20, 'cruz del ancla', 'middle'));
  out.push(lbl(222, 176, 'cadena'));
  out.push(lbl(160, yb + 24, 'fondo de piedra', null, 'start'));
  // cota de profundidad
  out.push(`<line x1="20" y1="${yw + 4}" x2="20" y2="${yb - 4}" stroke="currentColor" stroke-width="1.2" marker-end="url(#fo-g)" marker-start="url(#fo-g)"/>`);
  out.push(`<text x="32" y="${(yw + yb) / 2}" class="il-lbl" text-anchor="middle" transform="rotate(-90 32 ${(yw + yb) / 2})">profundidad</text>`);
  // si se enroca
  out.push(arrow(80, 160, 80, 136, 'm', 'fo', 2.4), bold(88, 142, 'si se enroca, tiras', 'm'), bold(88, 155, 'y sale por la cruz', 'm'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'El orinque es un cabo afirmado a la cruz del ancla con un boyarín (o cualquier flotador visible) en la otra punta. Señala dónde está el ancla y, si se enroca, tirando de él sale «al revés», por la cruz. Debe ser algo más largo que la profundidad en pleamar.' };
}

function fondeoVoces(hl) {
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Voces del fondeo', 'fv');
  out.push(title(160, 'Voces de la maniobra'));
  // Viñeta: x0, y0 esquina, w ancho. Barco con la proa a la izquierda dentro de la viñeta.
  const vin = (k, x0, y0, w, nombre, nota) => {
    const on = hl.has(k);
    const h = 84;
    const yw = y0 + 26;
    const yb = y0 + h - 8;
    const id = `fv-${k}`;
    const o = [`<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="5"/></clipPath>`];
    o.push(`<g clip-path="url(#${id})">${sea(x0, yw, w, h)}${tierra(`M${x0},${yb} L${x0 + w},${yb} L${x0 + w},${y0 + h} L${x0},${y0 + h}Z`)}</g>`);
    o.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="5" fill="none" stroke="${on ? C.r : 'currentColor'}" stroke-width="${on ? 2.4 : 1}" opacity="${on ? 1 : 0.35}"/>`);
    const bx = { pendura: 0.3, fondo: 0.3, filar: 0.55, virar: 0.5, pique: 0.3, zarpa: 0.3, clara: 0.3 }[k];
    const xb = x0 + w * bx;
    o.push(`<g clip-path="url(#${id})">${hullSide(xb, yw, w * 0.75, 'left')}</g>`);
    const top = [xb + 1, yw - 9];
    const ax = top[0];
    if (k === 'pendura') o.push(cadena(`M${ax},${top[1]} L${ax},${yw - 6}`), anchorG(ax, yw - 4, 0.55));
    if (k === 'clara') o.push(cadena(`M${ax},${top[1]} L${ax},${yw}`), anchorG(ax, yw + 1, 0.55));
    if (k === 'fondo') o.push(cadena(`M${ax},${top[1]} L${ax},${yb - 13}`), anchorG(ax, yb - 13, 0.55), arrow(ax + 9, yw + 6, ax + 9, yw + 26, 'v', 'fv', 1.8));
    if (k === 'pique') o.push(cadena(`M${ax},${top[1]} L${ax},${yb - 13}`), anchorG(ax, yb - 13, 0.55));
    if (k === 'zarpa') o.push(cadena(`M${ax},${top[1]} L${ax},${yb - 22}`), anchorG(ax, yb - 22, 0.55), arrow(ax + 9, yb - 4, ax + 9, yb - 22, 'v', 'fv', 1.8));
    if (k === 'filar' || k === 'virar') {
      const axx = x0 + 18;
      o.push(cadena(`M${ax},${top[1]} Q${ax - 10},${yb - 2} ${axx + 14},${yb - 2}`), anchorG(axx + 12, yb - 2, 0.5, 90));
      o.push(k === 'filar' ? arrow(xb + 8, yw - 24, xb + 26, yw - 24, 'v', 'fv', 1.8) : arrow(xb + 26, yw - 24, xb + 8, yw - 24, 'v', 'fv', 1.8));
    }
    const cx = x0 + w / 2;
    o.push(on ? bold(cx, y0 + h + 13, nombre, 'r', 'middle') : bold(cx, y0 + h + 13, nombre, null, 'middle'));
    o.push(lbl(cx, y0 + h + 25, nota, null, 'middle'));
    return o.join('');
  };
  out.push(bold(12, 42, 'Al fondear'));
  [['pendura', 'a la pendura', 'sin tocar fondo'], ['fondo', 'dar fondo', 'toca el fondo'], ['filar', 'filar', 'largar cadena']].forEach(([k, n, t], i) => out.push(vin(k, 10 + i * 102, 48, 96, n, t)));
  out.push(bold(12, 176, 'Al levar'));
  [['virar', 'virar', 'recoger'], ['pique', 'a pique', 'vertical'], ['zarpa', 'zarpa', 'se despega'], ['clara', 'clara', 'asoma limpia']].forEach(([k, n, t], i) => out.push(vin(k, 10 + i * 76.7, 182, 70, n, t)));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Al fondear: a la pendura (cuelga sin tocar fondo), dar fondo y filar. Al levar: virar (dando avante muy suave hacia el ancla), a pique (cadena vertical con el ancla aún en el fondo), zarpa (se despega) y clara; después, levada y estibada.' };
}

export function fondeoIllustration(spec = {}) {
  const hl = sel(spec.resaltar);
  const v = spec.vista ?? 'ancla';
  if (v === 'linea') return fondeoLinea(hl);
  if (v === 'borneo') return fondeoBorneo(hl);
  if (v === 'garreo') return fondeoGarreo(hl);
  if (v === 'orinque') return fondeoOrinque(hl);
  if (v === 'voces') return fondeoVoces(hl);
  return fondeoAncla(hl);
}

// ---------------------------------------------------------------------------
// Nudos. spec: { tipo:'nudos', nudo?: 'llano'|'rezon'|'ballestrinque'|'as-de-guia' }
// Cada cabo es una curva suave por puntos [x, y, z]; z dice qué va por encima en los cruces (más alto = delante).
// La curva se trocea en tramos cortos que se pintan ordenados por z, así los cruces salen sin costuras.

const A = 'var(--l-a)';
const V = 'var(--l-v)';

/** Muestrea una Catmull-Rom por los puntos (z se interpola lineal). */
function muestrear(P) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] ?? P[i];
    const [p1, p2] = [P[i], P[i + 1]];
    const p3 = P[i + 2] ?? P[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 1.5));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), (p1[2] ?? 0) + ((p2[2] ?? 0) - (p1[2] ?? 0)) * t]);
    }
  }
  const u = P[P.length - 1];
  out.push([u[0], u[1], u[2] ?? 0]);
  return out;
}

/** cabos: [{ p: puntos, col, w, cerrado? }] → SVG con los cruces bien resueltos.
 * Cada cabo se parte en tramos de nivel constante (z redondeado); los niveles altos se pintan después. */
function trenzar(cabos) {
  const tramos = [];
  const finales = [];
  cabos.forEach((c, ci) => {
    const w = c.w ?? 7;
    const s = muestrear(c.cerrado ? [...c.p, c.p[0]] : c.p);
    let ini = 0;
    for (let i = 1; i <= s.length; i++) {
      if (i === s.length || Math.round(s[i][2]) !== Math.round(s[ini][2])) {
        const seg = s.slice(ini, Math.min(i + 1, s.length));
        const cierra = c.cerrado && ini === 0 && i === s.length;
        tramos.push({ z: Math.round(s[ini][2]), ci, i: ini, d: `M${seg.map((q) => `${f(q[0])},${f(q[1])}`).join(' L')}${cierra ? 'Z' : ''}`, col: c.col, w, sinFin: c.sinFin });
        ini = i;
      }
    }
    if (!c.cerrado && !c.sinFin) for (const q of [s[0], s[s.length - 1]]) finales.push({ q, col: c.col, w });
  });
  tramos.sort((a, b) => a.z - b.z || a.ci - b.ci || a.i - b.i);
  const o = tramos.map((t) => `<path d="${t.d}" fill="none" stroke="currentColor" stroke-width="${f(t.w + 2.6)}" stroke-linejoin="round"/><path d="${t.d}" fill="none" style="stroke:${t.col}" stroke-width="${t.w}" stroke-linejoin="round" stroke-linecap="${t.sinFin ? 'butt' : 'square'}"/>`);
  for (const { q, col, w } of finales) o.push(`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(w / 2 + 1.3)}" fill="currentColor"/><circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(w / 2)}" style="fill:${col}"/>`);
  return o.join('');
}
const aro = (cx, cy, r, zs = {}) => Array.from({ length: 36 }, (_, i) => { const a = (i * 10 * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a), zs[i * 10] ?? 0]; });

// Dibujos en una caja local de 140 × 110.
const NUDOS = {
  llano: {
    nombre: 'Nudo llano',
    uso: 'unir dos cabos',
    dibujo: () => trenzar([
      { col: A, p: [[2, 36], [40, 36], [80, 36], [98, 42], [102, 52], [98, 62], [80, 68], [46, 68, 1], [30, 68], [2, 68]] },
      { col: V, p: [[138, 44], [100, 44, 1], [62, 44], [44, 50], [40, 60], [44, 70], [62, 76], [100, 76], [138, 76]] },
    ]),
    etiquetas: [[6, 28, 'cabo 1', 'start'], [134, 94, 'cabo 2', 'end']],
    texto: 'Une dos cabos por sus chicotes, de la misma mena y material. Con tensión aguanta y sin ella se deshace fácil. También se llama nudo de rizo.',
  },
  rezon: {
    nombre: 'Vuelta de rezón',
    uso: 'a una argolla',
    dibujo: () => trenzar([
      { col: 'var(--l-casco)', w: 6, cerrado: true, p: aro(70, 30, 21) },
      { col: A, w: 6, p: [[52, 110], [54, 90], [56, 74, -1], [56, 62], [57, 52, -2], [58, 40, -2], [62, 33], [66, 40], [67, 52, 2], [67, 62], [71, 60], [73, 52, -2], [74, 40, -2], [78, 33], [82, 40], [82, 52, 2], [80, 64], [72, 70], [56, 72, 1], [42, 76], [42, 86], [56, 90, -1], [70, 88], [84, 96], [96, 104]] },
    ]),
    etiquetas: [[96, 14, 'argolla', 'start'], [92, 50, 'dos vueltas', 'start'], [100, 98, 'remate', 'start']],
    texto: 'Se dan vueltas a la argolla y se remata con el chicote para que no se suelte. Muy segura y no se afloja con los tirones: para una defensa colgada mucho tiempo.',
  },
  ballestrinque: {
    nombre: 'Ballestrinque',
    uso: 'a un palo, rápido',
    dibujo: () => trenzar([
      { col: 'var(--l-casco)', w: 22, sinFin: true, p: [[70, 0], [70, 110]] },
      { col: A, p: [[2, 60], [36, 58], [58, 56, 1], [70, 55, 1], [80, 53, 1], [86, 49], [80, 43, -1], [70, 41, -1], [60, 39, -1], [55, 36], [60, 33, 1], [64, 40, 2], [70, 54, 2], [76, 68, 2], [80, 76, 1], [85, 81], [80, 86, -1], [70, 86, -1], [60, 85, -1], [55, 79], [60, 72, 1], [70, 70, 1], [82, 68, 1], [100, 66], [138, 64]] },
    ]),
    etiquetas: [[6, 50, 'firme', 'start'], [134, 56, 'chicote', 'end'], [86, 104, 'palo o candelero', 'start']],
    texto: 'Dos vueltas cruzadas alrededor de un palo, candelero o barandilla. Se hace muy rápido, pero con tirones laterales o intermitentes puede correrse: para una defensa por poco tiempo.',
  },
  'as-de-guia': {
    nombre: 'As de guía',
    uso: 'gaza fija',
    dibujo: () => trenzar([
      { col: A, w: 5.5, p: [[70, 0], [70, 12], [70, 30, -1], [78, 40], [84, 52], [76, 64], [62, 64], [55, 52], [60, 39], [70, 30, 1], [82, 22], [96, 26], [104, 42], [108, 66], [102, 92], [78, 108], [50, 104], [34, 86], [36, 70], [48, 64], [57, 61, -1], [62, 50], [64, 36, 1], [60, 24], [70, 14, -2], [82, 13], [86, 20], [80, 30, 2], [76, 40, 2], [74, 52], [72, 64, -1], [73, 82]] },
    ]),
    etiquetas: [[76, 6, 'firme', 'start'], [98, 116, 'gaza fija', 'start'], [80, 88, 'chicote', 'start']],
    texto: 'Forma una gaza fija que ni corre ni se aprieta y luego se deshace con facilidad: para encapillar una amarra en un noray, afirmar escotas o rodear a una persona por el pecho.',
  },
};

export function nudosIllustration(spec = {}) {
  const k = spec.nudo;
  if (NUDOS[k]) {
    const n = NUDOS[k];
    const W = 320;
    const H = 260;
    const out = open(W, H, n.nombre, 'nu');
    out.push(title(160, `${n.nombre}: ${n.uso}`));
    const s = 1.7;
    const ox = 160 - 70 * s;
    const oy = 38;
    out.push(`<g transform="translate(${f(ox)} ${oy}) scale(${s})">${n.dibujo()}</g>`);
    for (const [x, y, t, a] of n.etiquetas) out.push(lbl(ox + x * s, oy + y * s, t, null, a, 'font-weight="700"'));
    out.push('</svg>');
    return { svg: out.join(''), caption: n.texto };
  }
  const W = 320;
  const H = 296;
  const out = open(W, H, 'Los cuatro nudos del PER', 'nu');
  out.push(title(160, 'Los cuatro nudos y su uso'));
  Object.values(NUDOS).forEach((n, i) => {
    const cx = i % 2 ? 240 : 80;
    const y0 = 34 + Math.floor(i / 2) * 132;
    const s = 0.82;
    out.push(`<g transform="translate(${f(cx - 70 * s)} ${y0}) scale(${s})">${n.dibujo()}</g>`);
    out.push(bold(cx, y0 + 104, n.nombre, null, 'middle'), lbl(cx, y0 + 117, n.uso, null, 'middle'));
  });
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Unir dos cabos iguales: llano. A una argolla: vuelta de rezón. A un palo o candelero, rápido: ballestrinque. Una gaza fija: as de guía.' };
}

// ---------------------------------------------------------------------------
// Atraque. spec: { tipo:'atraque', modo:'costado'|'punta'|'abarloado'|'boya', helice?: 'dextrogira'|'levogira', viento?: 'costado' }

const muelle = (W, y, H) => `${tierra(`M0,${y} L${W},${y} L${W},${H} L0,${H}Z`)}`;
const noray = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="3.6" fill="currentColor"/>`;
const amarra = (p, q, on = true) => `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" stroke="${on ? C.r : C.g}" stroke-width="${on ? 2.6 : 1.4}"/>`;
const defensa = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${w}" height="${h}" rx="2" style="fill:var(--l-a)" stroke="currentColor" stroke-width=".8"/>`;

function atraqueCostado(spec) {
  const lev = spec.helice === 'levogira';
  const W = 320;
  const H = 280;
  const yq = 226;
  const out = open(W, H, 'Atraque de costado', 'ac');
  out.push(clipDef('ac', W, H), `<g clip-path="url(#ac-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, `De costado con hélice ${lev ? 'levógira' : 'dextrógira'}`));
  out.push(bold(160, 266, 'MUELLE', null, 'middle'));
  // Se dibuja para dextrógira (babor al muelle, proa a la izquierda) y se refleja para levógira.
  const mx = (x) => (lev ? W - x : x);
  const ma = (a) => (a === 'start' ? (lev ? 'end' : 'start') : a === 'end' ? (lev ? 'start' : 'end') : a);
  const rot = (r) => (lev ? -r : r);
  const L = 104;
  const B = 32;
  const [fx0, fy0] = [176, yq - 6 - B / 2];
  // aproximación (fantasma) a 20–30°
  out.push(`<g opacity=".45" stroke-dasharray="4 3">${hp(mx(214), 120, rot(-115), L, B)}</g>`);
  out.push(`<path d="M${mx(170)},152 Q${mx(146)},176 ${mx(136)},${fy0 - 20}" fill="none" stroke="${C.v}" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#ac-v)"/>`);
  out.push(lbl(mx(150), 86, 'entra a 20–30°, despacio', 'v', ma('end')));
  // posición final, paralelo al muelle
  out.push(hp(mx(fx0), fy0, rot(-90), L, B));
  for (const x of [140, 172, 204]) out.push(defensa(mx(x) - 6, yq - 6, 12, 6));
  // la popa se arrima al dar atrás
  out.push(arrow(mx(fx0 + 40), fy0 - 40, mx(fx0 + 40), fy0 - 22, 'r', 'ac', 2.6));
  out.push(bold(mx(fx0 + 50), fy0 - 46, 'atrás: la popa', 'r', ma('start')), bold(mx(fx0 + 50), fy0 - 33, `va a ${lev ? 'estribor' : 'babor'}`, 'r', ma('start')));
  // primer cabo: largo de proa
  const bow = [mx(fx0 - L / 2 + 2), fy0];
  out.push(amarra(bow, [mx(78), yq + 6]), noray(mx(78), yq + 6));
  out.push(bold(mx(56), yq + 24, '1.º largo de proa', 'r', ma('start')));
  // corriente de proa
  out.push(arrow(mx(20), 160, mx(66), 160, 'p', 'ac', 2.4), lbl(mx(20), 152, 'corriente', 'p', ma('start')));
  out.push(lbl(mx(14), 48, `${lev ? 'Levógira' : 'Dextrógira'}: atraca por ${lev ? 'estribor' : 'babor'}`, null, ma('start'), 'font-weight="700"'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: `Con hélice ${lev ? 'levógira' : 'dextrógira'}, al dar atrás para parar la popa va a ${lev ? 'estribor' : 'babor'}: atracando por esa banda se arrima sola y quedas paralelo. Con corriente de proa o viento de tierra, el primer cabo a tierra es el largo de proa.`,
  };
}

function atraquePunta(spec) {
  const costado = spec.viento === 'costado';
  const W = 320;
  const H = 280;
  const yq = 232;
  const out = open(W, H, 'Atraque de punta', 'ap');
  out.push(clipDef('ap', W, H), `<g clip-path="url(#ap-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, costado ? 'De punta con viento de costado' : 'De punta: popa al muelle'));
  out.push(bold(262, 266, 'MUELLE', null, 'middle'));
  const L = 100;
  const B = 32;
  const cy = yq - 4 - L / 2;
  // vecinos
  for (const x of [96, 224]) out.push(`<g opacity=".4">${hp(x, cy, 0, L, B)}</g>`);
  out.push(hp(160, cy, 0, L, B));
  for (const x of [134, 180]) out.push(defensa(x, cy + 6, 6, 14));
  // muerto con su guía
  out.push(`<rect x="152" y="40" width="16" height="12" rx="2" fill="currentColor" opacity=".7"/>`, bold(174, 50, 'muerto', null, 'start'));
  const bow = [160, cy - L / 2];
  out.push(`<line x1="160" y1="52" x2="${bow[0]}" y2="${bow[1] + 2}" stroke="${C.r}" stroke-width="2.6"/>`);
  out.push(`<path d="M168,52 Q262,70 290,${yq}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7"/>`, lbl(296, 150, 'guía', null, 'end'));
  // largos de popa
  const pb = [149, yq - 6];
  const pe = [171, yq - 6];
  const nb = [118, yq + 8];
  const ne = [202, yq + 8];
  if (costado) {
    out.push(amarra(pb, nb), amarra(pe, nb), noray(...nb), noray(...ne));
    out.push(arrow(14, 110, 60, 110, 'g', 'ap', 2.6), lbl(14, 102, 'viento', 'g'));
    out.push(bold(112, yq + 24, 'los dos largos al noray', 'r', 'middle'), bold(112, yq + 36, 'de barlovento', 'r', 'middle'));
    out.push(lbl(186, 88, 'tesa el muerto', 'r'), lbl(186, 100, 'cuanto antes', 'r'));
  } else {
    out.push(amarra(pb, nb), amarra(pe, ne), noray(...nb), noray(...ne));
    out.push(bold(68, yq + 24, 'dos largos', 'r', 'middle'), bold(68, yq + 36, 'de popa', 'r', 'middle'));
    out.push(lbl(186, 88, 'proa: muerto,', 'r'), lbl(186, 100, 'codera o ancla', 'r'));
    out.push(lbl(14, 96, 'defensas'), lbl(14, 108, 'a las dos'), lbl(14, 120, 'bandas'));
  }
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: costado
      ? 'Con viento de costado los largos tienen que trabajar contra el viento: encapilla los dos en el noray de barlovento. Coge y tesa el muerto cuanto antes (si hay dos, primero el de barlovento).'
      : 'Al muelle das dos largos (de popa si atracas de popa) y el otro extremo se sujeta con el muerto, cuya guía cobras desde el muelle, con una codera o con tu ancla. Defensas por las dos bandas.',
  };
}

function atraqueAbarloado() {
  const W = 320;
  const H = 280;
  const yq = 232;
  const out = open(W, H, 'Abarloarse', 'ab');
  out.push(clipDef('ab', W, H), `<g clip-path="url(#ab-clip)">${sea(0, 30, W, yq - 30)}${muelle(W, yq, H)}</g>`);
  out.push(title(160, 'Abarloado a otro barco'));
  out.push(bold(160, 266, 'MUELLE', null, 'middle'));
  const B = 32;
  const yo = yq - 6 - B / 2;
  const ym = yo - B - 20;
  // el otro, amarrado al muelle
  out.push(amarra([98, yo + 4], [86, yq + 6], false), amarra([222, yo + 4], [236, yq + 6], false), noray(86, yq + 6), noray(236, yq + 6));
  out.push(hp(160, yo, -90, 130, B), lbl(176, yo + 4, 'el otro', null, 'middle'));
  // defensas entre los dos
  for (const x of [118, 200]) out.push(defensa(x - 6, ym + B / 2 + 4, 12, 10));
  out.push(hp(160, ym, -90, 112, B), bold(146, ym + 4, 'tu barco', null, 'middle'));
  // palos desfasados
  out.push(`<circle cx="128" cy="${yo}" r="5" fill="currentColor"/><circle cx="192" cy="${ym}" r="5" fill="currentColor"/>`);
  out.push(lbl(222, ym - 28, 'palos no a la', null, 'start'), lbl(222, ym - 16, 'misma altura', null, 'start'));
  // cabos al otro barco: largos y esprines
  const top = ym + B / 2 - 2;
  const bot = yo - B / 2 + 2;
  out.push(amarra([110, top - 4], [102, bot + 4]), amarra([212, top - 4], [222, bot + 4]), amarra([140, top], [176, bot]), amarra([180, top], [144, bot]));
  out.push(lbl(14, 54, 'avisa al otro barco', null, 'start', 'font-weight="700"'), lbl(14, 68, 'y pon defensas de sobra'));
  out.push(lbl(14, 90, 'si hay marea, deja seno', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Abarloarse es amarrarse al costado de otro barco. Avisa a su tripulación, pon defensas de sobra y, entre veleros, que los palos no queden a la misma altura. Si el otro está fondeado o en una boya, acércate por su popa; si arde, por barlovento.' };
}

function atraqueBoya() {
  const W = 320;
  const H = 280;
  const out = open(W, H, 'Amarrar a una boya', 'ay');
  out.push(clipDef('ay', W, H), `<g clip-path="url(#ay-clip)">${sea(0, 30, W, H - 30)}</g>`);
  out.push(title(160, 'Amarrar a una boya'));
  out.push(arrow(160, 34, 160, 66, 'g', 'ay', 2.6), lbl(168, 48, 'viento o corriente', 'g'));
  const [bx, by] = [174, 92];
  const [cx, cy] = [156, 162];
  const L = 104;
  // estela de llegada
  out.push(`<path d="M${cx},${H - 4} L${cx},${cy + L / 2 + 4}" stroke="${C.v}" stroke-width="1.8" stroke-dasharray="5 4"/>`);
  out.push(hp(cx, cy, 0, L, 32));
  // cabo por seno: de la cornamusa de proa a la argolla de la boya y de vuelta
  out.push(`<path d="M${cx - 3},${cy - L / 2 + 10} Q${bx - 10},${by + 14} ${bx},${by + 2} Q${bx - 2},${by + 18} ${cx + 3},${cy - L / 2 + 12}" fill="none" stroke="${C.r}" stroke-width="2.4"/>`);
  out.push(`<circle cx="${bx}" cy="${by}" r="9" fill="#f97316" stroke="currentColor" stroke-width="1.4"/>`);
  // bichero desde la amura
  out.push(`<line x1="${cx + 14}" y1="${cy - L / 2 + 26}" x2="${bx + 6}" y2="${by + 8}" stroke="currentColor" stroke-width="2.4"/>`);
  out.push(bold(bx + 14, by - 4, 'boya', null, 'start'), lbl(bx + 14, by + 26, 'bichero desde', null, 'start'), lbl(bx + 14, by + 38, 'la amura', null, 'start'));
  out.push(bold(bx + 14, by + 64, 'cabo por seno:', 'r', 'start'), lbl(bx + 14, by + 76, 'te sueltas', 'r', 'start'), lbl(bx + 14, by + 88, 'desde a bordo', 'r', 'start'));
  out.push(lbl(cx - 26, cy + 10, 'llega proa', null, 'end', 'font-weight="700"'), lbl(cx - 26, cy + 22, 'al viento y', null, 'end'), lbl(cx - 26, cy + 34, 'muy despacio', null, 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Llega proa al viento o a la corriente (a lo que más empuje) y muy despacio. Con la boya por la amura, cógela con el bichero y pasa tu cabo por seno, para soltarte desde a bordo. Nunca fondees junto a una boya de amarre.' };
}

export function atraqueIllustration(spec = {}) {
  const m = spec.modo ?? 'costado';
  if (m === 'punta') return atraquePunta(spec);
  if (m === 'abarloado') return atraqueAbarloado(spec);
  if (m === 'boya') return atraqueBoya(spec);
  return atraqueCostado(spec);
}

// ---------------------------------------------------------------------------
// Remolque y náufrago. spec: { tipo:'remolque', vista?: 'largo'|'abarloado'|'naufrago' }

function remolqueLargo() {
  const W = 320;
  const H = 250;
  const out = open(W, H, 'Remolque', 'rl');
  out.push(clipDef('rl', W, H), title(160, 'Remolque largo: a la vez en la cresta'));
  const lam = 91;
  const x1 = 70;
  const ys = (x) => 132 - 11 * Math.cos((2 * Math.PI * (x - x1)) / lam);
  let d = `M0,${f(ys(0))}`;
  for (let x = 4; x <= W; x += 4) d += ` L${x},${f(ys(x))}`;
  out.push(`<g clip-path="url(#rl-clip)"><path d="${d} L${W},${H} L0,${H}Z" style="fill:var(--l-mar)"/></g>`, `<path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.4"/>`);
  const x2 = x1 + 2 * lam;
  out.push(hullSide(x1 - 30, ys(x1), 60, 'left'), hullSide(x2 - 30, ys(x2), 60, 'left'));
  // remolque con su seno y un peso a la mitad
  const p1 = [x1 + 30, ys(x1) - 10];
  const p2 = [x2 - 29, ys(x2) - 11];
  const mid = [(p1[0] + p2[0]) / 2, 168];
  out.push(cabo(`M${f(p1[0])},${f(p1[1])} Q${f(mid[0])},${f(2 * mid[1] - (p1[1] + p2[1]) / 2)} ${f(p2[0])},${f(p2[1])}`, 'var(--l-a)', 2.6));
  out.push(`<rect x="${f(mid[0] - 6)}" y="${f(mid[1] - 5)}" width="12" height="10" rx="2" fill="currentColor"/>`);
  out.push(lbl(mid[0], mid[1] + 22, 'peso a mitad del cabo', null, 'middle'));
  out.push(`<circle cx="${f(p2[0])}" cy="${f(p2[1])}" r="3.4" fill="${C.r}"/>`);
  out.push(bold(x1, 58, 'remolcador', null, 'middle'), lbl(x1, 72, 'mínima velocidad,', null, 'middle'), lbl(x1, 84, 'sin tirones', null, 'middle'));
  out.push(bold(x2 - 6, 58, 'remolcado', null, 'middle'), lbl(x2 - 6, 72, 'motor desembragado,', null, 'middle'), lbl(x2 - 6, 84, 'sigue la estela', null, 'middle'));
  out.push(lbl(x2 - 34, 98, 'firme a un punto', 'r', 'end'), lbl(x2 - 34, 110, 'resistente', 'r', 'end'));
  out.push(arrow(x1 - 32, 96, x1 - 52, 96, 'v', 'rl', 2.4));
  out.push(lbl(160, 206, 'con mar, remolque largo: los dos barcos', null, 'middle', 'font-weight="700"'), lbl(160, 220, 'a la vez en la cresta o en el seno de la ola', null, 'middle', 'font-weight="700"'));
  out.push(lbl(160, 240, 'acordad un canal de trabajo por VHF · cuchillo a mano', null, 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con mar, el remolque debe ser largo, de modo que los dos barcos estén a la vez en la cresta o en el seno; un peso a mitad del cabo amortigua los tirones. El remolcado lo afirma a un punto resistente, desembraga y sigue la estela; arranca a mínima velocidad y sin tirones.' };
}

function remolqueAbarloado() {
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Remolque abarloado', 'ra');
  out.push(clipDef('ra', W, H), `<g clip-path="url(#ra-clip)">${sea(0, 30, W, H - 30)}</g>`);
  out.push(title(160, 'Remolque abarloado (entrar en puerto)'));
  const L = 120;
  const B = 34;
  const [xa, ya] = [130, 152];
  const [xr, yr] = [xa + B + 16, 134];
  for (const y of [112, 186]) out.push(defensa((xa + xr) / 2 - 4, y, 8, 14));
  out.push(hp(xa, ya, 0, L, B), hp(xr, yr, 0, L, B));
  const l = xa + B / 2 - 2;
  const r = xr - B / 2 + 2;
  out.push(amarra([r, yr - L / 2 + 26], [l, ya - L / 2 + 22]), amarra([r, yr + 4], [l, ya - 26]), amarra([r, yr + L / 2 - 12], [l, ya + L / 2 - 14]));
  out.push(bold(xr + B / 2 + 8, yr - 10, 'remolcador', null, 'start'));
  out.push(bold(xa - B / 2 - 8, ya + 16, 'averiado,', null, 'end'), lbl(xa - B / 2 - 8, ya + 30, 'un poco más', null, 'end'), lbl(xa - B / 2 - 8, ya + 42, 'a popa', null, 'end'));
  out.push(arrow(292, 214, 292, 150, 'v', 'ra', 2.4), lbl(292, 230, 'avante', 'v', 'middle'));
  out.push(lbl(14, 250, 'aguas abrigadas y espacios reducidos', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'En aguas abrigadas y espacios reducidos, como al entrar en puerto, se puede remolcar abarloado: los dos barcos amarrados costado con costado, con el averiado un poco más a popa.' };
}

function remolqueNaufrago() {
  const W = 320;
  const H = 270;
  const out = open(W, H, 'Subir al náufrago', 'rn');
  out.push(clipDef('rn', W, H), `<g clip-path="url(#rn-clip)">${sea(0, 30, W, H - 30)}</g>`);
  out.push(title(160, 'Subir al náufrago por sotavento'));
  out.push(arrow(40, 40, 40, 82, 'g', 'rn', 2.6), lbl(50, 56, 'viento', 'g'));
  const [cx, cy] = [170, 116];
  const L = 150;
  const B = 44;
  // socaire a sotavento del casco
  out.push(`<path d="M${cx - 40},${cy + 22} L${cx + 60},${cy + 22} L${cx + 50},${cy + 92} L${cx - 30},${cy + 92}Z" fill="${C.v}" opacity=".12"/>`);
  out.push(lbl(cx + 56, cy + 86, 'socaire', 'v', 'end', 'font-style="italic"'));
  out.push(hp(cx, cy, 90, L, B));
  out.push(lbl(cx + 52, cy - 30, 'barlovento', null, 'middle'), bold(cx + 66, cy + 40, 'sotavento', null, 'start'));
  // hélice en punto muerto
  out.push(`<circle cx="${cx - L / 2 - 2}" cy="${cy}" r="6" fill="none" stroke="${C.r}" stroke-width="2.4"/>`);
  out.push(bold(14, cy - 26, 'máquina en', 'r'), bold(14, cy - 14, 'punto muerto', 'r'));
  // náufrago, aro con rabiza
  const [nx, ny] = [cx - 10, cy + 56];
  out.push(`<circle cx="${nx}" cy="${ny}" r="6" fill="#f97316" stroke="currentColor"/>`);
  out.push(`<circle cx="${nx + 16}" cy="${ny - 2}" r="8" fill="none" stroke="#f97316" stroke-width="4"/>`);
  out.push(cabo(`M${nx + 22},${ny - 8} Q${nx + 34},${ny - 26} ${nx + 26},${cy + B / 2 - 2}`, 'var(--l-a)', 1.8));
  out.push(lbl(nx - 12, ny + 4, 'náufrago', null, 'end', 'font-weight="700"'), lbl(nx + 30, ny + 10, 'aro con rabiza', null, 'start'));
  // escala en la plataforma de popa
  out.push(`<path d="M${cx - L / 2 + 6},${cy + 14} L${cx - L / 2 + 6},${cy + 34} M${cx - L / 2 + 14},${cy + 14} L${cx - L / 2 + 14},${cy + 34} M${cx - L / 2 + 6},${cy + 21} L${cx - L / 2 + 14},${cy + 21} M${cx - L / 2 + 6},${cy + 28} L${cx - L / 2 + 14},${cy + 28}" stroke="currentColor" stroke-width="1.6"/>`);
  out.push(lbl(14, cy + 50, 'súbelo por la escala'), lbl(14, cy + 62, 'o la plataforma'));
  out.push(lbl(14, 236, 'llega despacio · agotado: un tripulante con chaleco', null, 'start'), lbl(14, 250, 'y amarrado le ayuda · agua fría: súbelo en horizontal', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Llega despacio y pon punto muerto antes de tenerlo cerca: la hélice es el mayor peligro. Que quede junto a tu costado de sotavento, donde el casco le hace socaire; pásale un aro con rabiza y súbelo por la escala o la plataforma de baño.' };
}

export function remolqueIllustration(spec = {}) {
  const v = spec.vista ?? 'largo';
  if (v === 'abarloado') return remolqueAbarloado(spec);
  if (v === 'naufrago') return remolqueNaufrago(spec);
  return remolqueLargo(spec);
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  fondeo: {
    fn: fondeoIllustration,
    params: { vista: ['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'], resaltar: `una parte o lista; ancla: ${PARTES_ANCLA.join(', ')}; linea: ${PARTES_LINEA.join(', ')}; orinque: orinque, boyarin, cruz; voces: ${VOCES.join(', ')}` },
    ejemplo: { tipo: 'fondeo', vista: 'ancla' },
  },
  nudos: {
    fn: nudosIllustration,
    params: { nudo: Object.keys(NUDOS) },
    ejemplo: { tipo: 'nudos' },
  },
  atraque: {
    fn: atraqueIllustration,
    params: { modo: ['costado', 'punta', 'abarloado', 'boya'], helice: ['dextrogira', 'levogira'], viento: ['costado'] },
    ejemplo: { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  },
  remolque: {
    fn: remolqueIllustration,
    params: { vista: ['largo', 'abarloado', 'naufrago'] },
    ejemplo: { tipo: 'remolque', vista: 'largo' },
  },
};

/** Todas las variantes que conviene comprobar (las usa el test y la página de revisión). */
export const VARIANTES = [
  ...['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'].map((vista) => ({ tipo: 'fondeo', vista })),
  { tipo: 'fondeo', vista: 'ancla', resaltar: ['unas', 'danforth', 'cepo'] },
  { tipo: 'fondeo', vista: 'linea', resaltar: 'barboten' },
  { tipo: 'fondeo', vista: 'orinque', resaltar: 'cruz' },
  { tipo: 'fondeo', vista: 'voces', resaltar: 'pique' },
  { tipo: 'nudos' },
  ...Object.keys(NUDOS).map((nudo) => ({ tipo: 'nudos', nudo })),
  { tipo: 'atraque', modo: 'costado', helice: 'dextrogira' },
  { tipo: 'atraque', modo: 'costado', helice: 'levogira' },
  { tipo: 'atraque', modo: 'punta' },
  { tipo: 'atraque', modo: 'punta', viento: 'costado' },
  { tipo: 'atraque', modo: 'abarloado' },
  { tipo: 'atraque', modo: 'boya' },
  ...['largo', 'abarloado', 'naufrago'].map((vista) => ({ tipo: 'remolque', vista })),
];
