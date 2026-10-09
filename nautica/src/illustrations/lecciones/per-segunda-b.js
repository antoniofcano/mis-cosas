// Segundas láminas para cinco lecciones del PER:
// cuándo es obligatorio izar el pabellón nacional (per-4-7), velocidad de gobierno, arrancada y rabeo (per-7-3),
// hélices gemelas y ciaboga con dos hélices (per-7-5), el achique en una vía de agua (per-8-5) y barómetros de
// mercurio y aneroide con la tendencia barométrica (per-9-1).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` (una parte o lista) para destacar la que trata cada paso;
// una parte desconocida devuelve null.

import { C, open, title, fx, pol, hullPlan } from '../kit.js';
import { dibujoAnimado } from '../animaciones/index.js';
import { pabellonObligatorioC, PABELLON } from '../per-cola-normativa-c.js';

/** Colores de texto y trazo que se adaptan al tema (las variables de styles/app.css). */
const VAR = { v: 'var(--l-v)', m: 'var(--l-m)', a: 'var(--l-a)', r: 'var(--l-r)', p: 'var(--l-p)', g: 'var(--muted)' };
const col = (c) => VAR[c] ?? c;

/** Partes resaltadas: on(p) dice si se dibuja fuerte; dim(p) atenúa lo que no está resaltado. null si hay una parte inválida. */
function marcas(spec, validas) {
  const r = spec.resaltar;
  const s = r == null || r === '' ? null : new Set([].concat(r));
  if (s && [...s].some((p) => !validas.includes(p))) return null;
  return {
    activo: !!s,
    lista: s ? [...s] : [],
    on: (p) => !!s && s.has(p),
    dim: (p) => (s && !s.has(p) ? ' opacity=".35"' : ''),
  };
}

/** «**negrita**» → tspan en negrita. */
const negritas = (txt) => String(txt).replace(/\*\*(.+?)\*\*/g, '<tspan font-weight="700">$1</tspan>');

/** Texto con halo del color del fondo (se lee aunque cruce una línea) y sin salirse del panel. */
function t(x, y, txt, { c = null, a = 'start', b = false, s = null, extra = '' } = {}) {
  const limpio = String(txt).replace(/\*\*/g, '').replace(/<[^>]*>/g, '');
  const w = limpio.length * (s ?? 10) * (b ? 0.58 : 0.53);
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const fill = c ? col(c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${b ? ' font-weight="700"' : ''}${s ? ` font-size="${s}"` : ''} style="fill:${fill};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round" ${extra}>${negritas(txt)}</text>`;
}
const seg = (x1, y1, x2, y2, c, w = 2, extra = '') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${col(c)}" stroke-width="${w}" ${extra}/>`;
/** Flecha con el marcador del kit (color de C) y trazo del color del tema. */
const flecha = (x1, y1, x2, y2, c, id, w = 2.2, extra = '') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${col(c)}" stroke-width="${w}" marker-end="url(#${id}-${c})" ${extra}/>`;
const curva = (d, c, id, w = 2.2, extra = '') => `<path d="${d}" fill="none" stroke="${col(c)}" stroke-width="${w}" marker-end="url(#${id}-${c})" ${extra}/>`;
const badge = (x, y, n, c = 'r', on = false) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="7.5" fill="${on ? C[c] : 'var(--bg)'}" stroke="${C[c]}" stroke-width="${on ? 2.4 : 1.6}"/><text x="${fx(x)}" y="${fx(y + 3.6)}" text-anchor="middle" font-size="10.5" font-weight="700" style="fill:${on ? '#fff' : col(c)}">${n}</text>`;

// 1. Cuándo es obligatorio izar el pabellón nacional (per-4-7, RD 2335/1980): en estilo C, per-cola-normativa-c.js.

// ---------------------------------------------------------------------------
// 2. Velocidad de gobierno, arrancada y rabeo de la popa (per-7-3).
// spec: { tipo:'gobierno-rabeo', vista?: 'gobierno'|'rabeo', resaltar?: 'gobierno'|'arrancada' }

function gobierno(m) {
  const ID = 'gr';
  const W = 320;
  const H = 262;
  const out = open(W, H, 'Velocidad de gobierno y arrancada', ID);
  out.push(title(160, 'Velocidad de gobierno y arrancada'));
  const [x0, y0, x1, yTop] = [40, 196, 304, 52];
  const v0 = 108; // altura de la velocidad avante
  const vg = 40; // altura de la velocidad de gobierno
  const xp = 92; // se para la máquina
  const yv = (x) => (x <= xp ? y0 - v0 : y0 - v0 * Math.exp(-(x - xp) / 46));
  const xg = xp + 46 * Math.log(v0 / vg); // cruce con la velocidad de gobierno
  const onG = m.on('gobierno');
  const onA = m.on('arrancada');
  // zona sin gobierno
  out.push(`<rect x="${x0}" y="${y0 - vg}" width="${x1 - x0}" height="${vg}" style="fill:var(--l-r)" fill-opacity="${onG ? 0.22 : 0.12}"/>`);
  out.push(t(x0 + 6, y0 - 22, 'no obedece', { c: 'r', b: true }), t(x0 + 6, y0 - 9, 'al timón', { c: 'r', b: true }));
  // ejes
  out.push(flecha(x0, y0, x0, yTop - 6, 'g', ID, 1.4), flecha(x0, y0, x1 + 6, y0, 'g', ID, 1.4));
  out.push(t(x0 + 6, yTop, 'velocidad respecto al agua', { c: 'g' }));
  out.push(t(x0 + 4, y0 + 14, 'tiempo →', { c: 'g' }));
  // velocidad de gobierno
  out.push(seg(x0, y0 - vg, x1, y0 - vg, 'r', onG ? 2.6 : 1.6, 'stroke-dasharray="6 4"'));
  out.push(t(x1, y0 - vg - 7, 'velocidad de gobierno', { a: 'end', b: true, c: 'r' }));
  // la curva: avante con máquina y después la arrancada, que se va perdiendo
  const pts = [];
  for (let x = x0; x <= 264; x += 2) pts.push(`${fx(x)},${fx(yv(x))}`);
  out.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${col('v')}" stroke-width="${onA ? 3.4 : 2.6}" stroke-linejoin="round"/>`);
  out.push(seg(264, yv(264), x1, y0 - 0.5, 'v', onA ? 3.4 : 2.6));
  out.push(t(x0 + 6, y0 - v0 - 21, '**máquina**', { c: 'v' }), t(x0 + 6, y0 - v0 - 8, '**avante**', { c: 'v' }));
  // se para la máquina
  out.push(seg(xp, y0, xp, y0 - v0 - 14, 'g', 1, 'stroke-dasharray="3 3"'));
  out.push(t(xp + 4, y0 - v0 - 6, 'paras la máquina', { c: 'g' }));
  // arrancada
  out.push(t(xp + 42, y0 - v0 + 13, '**arrancada**: la velocidad', { c: onA ? 'v' : null }));
  out.push(t(xp + 42, y0 - v0 + 26, 'que conserva por inercia', { c: onA ? 'v' : null }));
  out.push(flecha(xp + 70, y0 - v0 + 31, xp + 34, yv(xp + 30) - 4, 'v', ID, 1.2));
  // punto en que deja de gobernar
  out.push(`<circle cx="${fx(xg)}" cy="${y0 - vg}" r="4" fill="${C.r}" stroke="#fff"/>`);
  // parado
  out.push(t(x1, y0 + 14, 'parado y sin arrancada', { a: 'end', b: true }));
  out.push(t(160, y0 + 36, 'Por debajo de la velocidad de gobierno el barco no', { a: 'middle' }));
  out.push(t(160, y0 + 49, 'responde y queda a merced del viento y la corriente.', { a: 'middle' }));
  out.push('</svg>');
  const caption = onG
    ? 'La velocidad de gobierno es la mínima con la que el barco todavía obedece al timón; depende de cada barco y del viento. Por debajo, no responde.'
    : onA
      ? 'La arrancada es la velocidad que el barco conserva por inercia, avante o atrás, cuando la máquina deja de empujar. «Parado y sin arrancada»: no se mueve respecto al agua.'
      : 'Al parar la máquina el barco sigue moviéndose por inercia: es la arrancada. Mientras vaya por encima de la velocidad de gobierno obedece al timón; por debajo, queda a merced del viento y la corriente.';
  return { svg: out.join(''), caption };
}

function rabeo() {
  const ID = 'rb';
  const W = 320;
  const H = 270;
  const out = open(W, H, 'El rabeo de la popa', ID);
  out.push(title(160, 'El rabeo de la popa'));
  // pantalán por babor
  out.push(`<rect x="40" y="34" width="280" height="230" style="fill:var(--l-mar)"/>`);
  out.push(`<rect x="12" y="34" width="28" height="230" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
  for (let y = 48; y < 264; y += 16) out.push(seg(12, y, 40, y, 'g', 0.6));
  out.push(`<text x="26" y="150" class="il-lbl" text-anchor="middle" transform="rotate(-90 26 150)" font-weight="700">pantalán</text>`);
  // barco: eslora 130, punto de giro a 1/3 de la eslora desde proa
  const L = 130;
  const B = 40;
  const [px, py] = [84, 132];
  const dc = L / 2 - L / 3; // del punto de giro al centro
  const ang = 20;
  const pala = (a) => `<line x1="0" y1="${L / 2}" x2="${fx(Math.sin((a * Math.PI) / 180) * 14)}" y2="${fx(L / 2 + Math.cos((a * Math.PI) / 180) * 14)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
  out.push(`<g transform="translate(${px} ${py + dc})" opacity=".45">${hullPlan(L, B, 'style="fill:none;stroke:currentColor;stroke-dasharray:4 3"')}</g>`);
  out.push(`<g transform="translate(${px} ${py}) rotate(${ang}) translate(0 ${fx(dc)})">${hullPlan(L, B, 'style="fill:var(--l-casco);stroke:currentColor"')}${pala(35)}</g>`);
  // proa a estribor, popa a babor
  const proa0 = [px, py - L / 3];
  const proa1 = pol(px, py, ang, L / 3);
  const popa0 = [px, py + (2 * L) / 3];
  const popa1 = pol(px, py, 180 + ang, (2 * L) / 3);
  out.push(curva(`M${fx(proa0[0] + 2)},${fx(proa0[1] - 10)} Q${fx((proa0[0] + proa1[0]) / 2 + 2)},${fx(proa0[1] - 16)} ${fx(proa1[0] + 8)},${fx(proa1[1] - 8)}`, 'v', ID, 2.4));
  out.push(curva(`M${fx(popa0[0] - 2)},${fx(popa0[1] + 12)} Q${fx((popa0[0] + popa1[0]) / 2 - 4)},${fx(popa0[1] + 18)} ${fx(popa1[0] - 6)},${fx(popa1[1] + 12)}`, 'r', ID, 3));
  // golpe contra el pantalán
  const choque = [41, popa1[1] - 6];
  out.push(`<path d="M${choque[0]},${fx(choque[1] - 9)} l4,6 l7,-3 l-3,7 l6,4 l-7,1 l1,7 l-5,-5 l-5,5 l1,-7 Z" fill="${C.r}" stroke="#fff" stroke-width=".8"/>`);
  // punto de giro
  out.push(`<circle cx="${px}" cy="${py}" r="5" fill="${C.a}" stroke="#fff" stroke-width="1.4"/>`);
  out.push(seg(px + 7, py, 162, py, 'a', 1));
  out.push(t(166, py - 4, '**punto de giro**', { c: 'a' }), t(166, py + 9, '≈ 1/3 de la eslora desde proa', { c: 'a' }));
  // textos
  out.push(t(166, 52, '**Timón a estribor**'));
  out.push(t(166, 66, 'la proa cae a estribor…', { c: 'v' }));
  out.push(t(166, 196, '**…y la popa barre hacia**', { c: 'r' }));
  out.push(t(166, 209, '**babor: el rabeo**', { c: 'r' }));
  out.push(t(166, 234, 'Deja espacio libre por la'));
  out.push(t(166, 247, 'banda contraria al giro.'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Avante, el barco gira alrededor de un punto de giro a un tercio de la eslora desde la proa: al meter el timón a estribor la proa cae a estribor y la popa barre hacia babor. Pegado a un pantalán por babor, la popa se te va contra él.' };
}

function gobiernoRabeo(spec = {}) {
  const vista = spec.vista ?? 'gobierno';
  if (!['gobierno', 'rabeo'].includes(vista)) return null;
  const m = marcas(spec, ['gobierno', 'arrancada']);
  if (!m) return null;
  return vista === 'rabeo' ? rabeo() : gobierno(m);
}

// ---------------------------------------------------------------------------
// 3. Dos hélices: giro al exterior y al interior, y la ciaboga (per-7-5).
// spec: { tipo:'ciaboga-dos-helices', banda?: 'er'|'br', resaltar?: 'exterior'|'interior'|'ciaboga' }
// Animada y en estilo C: src/illustrations/animaciones/ciaboga-dos.js.

// ---------------------------------------------------------------------------
// 4. Agua en la sentina: el achique (per-8-5, RD 339/2021).
// spec: { tipo:'achique-sentina', resaltar?: 'manual'|'electrica'|'baldes'|'refrigeracion'|'motor'|'zonas-1-3'|'zonas-4-6'|'zona-7' }

const ACHIQUE = [
  ['manual', 'Bomba **manual**'],
  ['electrica', 'Bomba **eléctrica automática**: arranca sola'],
  ['baldes', '**Baldes** (de al menos 5 litros)'],
  ['motor', 'Motor **en marcha**: carga las baterías'],
  ['refrigeracion', 'Emergencia: la **toma de refrigeración**'],
];
const ZONAS = [
  ['zonas-1-3', 'Zonas 1–3', 'bomba de motor + manual + 2 baldes'],
  ['zonas-4-6', 'Zonas 4–6', 'bomba manual o eléctrica + 1 balde'],
  ['zona-7', 'Zona 7', 'bomba manual o eléctrica (o achicador)'],
];

function achique(spec = {}) {
  const ID = 'aq';
  const m = marcas(spec, [...ACHIQUE.map((a) => a[0]), ...ZONAS.map((z) => z[0])]);
  if (!m) return null;
  const W = 320;
  const H = 310;
  const out = open(W, H, 'Agua en la sentina: el achique', ID);
  out.push(title(160, 'Agua en la sentina: el achique'));
  const n = (k) => ACHIQUE.findIndex((a) => a[0] === k) + 1;
  const w = (k, a = 1.4) => (m.on(k) ? a + 1.2 : a);
  // casco de costado (proa a la derecha), flotación y mar
  out.push(`<rect x="0" y="84" width="320" height="64" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M14,40 L306,36 Q300,104 262,132 L66,132 L62,96 L16,88 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<line x1="6" y1="84" x2="312" y2="84" stroke="${C.v}" stroke-width=".8" stroke-dasharray="4 3" opacity=".7"/>`);
  // sentina con agua bajo el plan
  out.push(`<path d="M67,117 L282,117 Q274,126 262,131 L67,131 Z" style="fill:var(--l-v)" fill-opacity=".45"/>`);
  out.push(seg(65, 116, 283, 116, 'currentColor', 1.4));
  // motor con eje y hélice
  out.push(`<g${m.dim('motor')}><rect x="94" y="92" width="34" height="23" rx="3" style="fill:var(--l-g)" stroke="${m.on('motor') ? C.r : 'currentColor'}" stroke-width="${w('motor', 1)}"/>`);
  out.push(seg(94, 108, 54, 108, 'currentColor', 1.6), `<ellipse cx="54" cy="108" rx="2" ry="8" style="fill:var(--l-g)" stroke="currentColor" stroke-width=".8"/>`);
  out.push(`<path d="M106,89 q2,-5 0,-9 M114,89 q2,-5 0,-9" fill="none" stroke="currentColor" stroke-width="1" opacity=".7"/></g>`);
  // toma de refrigeración: grifo de fondo cerrado y el manguito suelto dentro de la sentina
  out.push(`<g${m.dim('refrigeracion')}>`);
  out.push(`<path d="M128,104 Q148,104 148,126" fill="none" stroke="${C.p}" stroke-width="${w('refrigeracion', 2.2)}"/>`);
  out.push(seg(166, 126, 166, 135, 'currentColor', 2), `<path d="M161,119 L171,127 M171,119 L161,127" stroke="${C.r}" stroke-width="2.2"/>`);
  out.push(t(166, 145, 'grifo cerrado', { c: 'r', a: 'middle', b: true }));
  out.push('</g>');
  // bomba manual en la bañera, con su aspiración en la sentina y su salida por encima de la flotación
  out.push(`<g${m.dim('manual')}><rect x="36" y="52" width="12" height="16" rx="2" style="fill:var(--bg)" stroke="${m.on('manual') ? C.r : 'currentColor'}" stroke-width="${w('manual', 1.2)}"/>`);
  out.push(seg(42, 52, 56, 44, 'currentColor', 2), `<path d="M42,68 L42,104 Q42,124 72,124" fill="none" stroke="currentColor" stroke-width="${w('manual', 1.4)}"/>`);
  out.push(`<path d="M36,60 L22,60" stroke="currentColor" stroke-width="1.4"/><circle cx="22" cy="60" r="2.4" fill="currentColor"/></g>`);
  // bomba eléctrica automática con flotador
  out.push(`<g${m.dim('electrica')}><rect x="200" y="120" width="14" height="8" rx="1.5" style="fill:var(--l-g)" stroke="${m.on('electrica') ? C.r : 'currentColor'}" stroke-width="${w('electrica', 1)}"/>`);
  out.push(`<circle cx="222" cy="119" r="3.4" fill="${C.a}" stroke="currentColor" stroke-width=".8"/><line x1="214" y1="124" x2="220" y2="120" stroke="currentColor" stroke-width=".8"/>`);
  out.push(`<path d="M207,120 L207,60" fill="none" stroke="currentColor" stroke-width="${w('electrica', 1.4)}"/><circle cx="207" cy="60" r="2.4" fill="currentColor"/></g>`);
  // balde
  out.push(`<g${m.dim('baldes')}><path d="M244,96 L262,96 L259,115 L247,115 Z" style="fill:var(--bg)" stroke="${m.on('baldes') ? C.r : 'currentColor'}" stroke-width="${w('baldes', 1.2)}"/><path d="M245,96 Q253,85 261,96" fill="none" stroke="currentColor" stroke-width="1"/></g>`);
  // números
  out.push(badge(64, 62, n('manual'), 'r', m.on('manual')), badge(190, 74, n('electrica'), 'r', m.on('electrica')));
  out.push(badge(276, 74, n('baldes'), 'r', m.on('baldes')), badge(178, 104, n('refrigeracion'), 'r', m.on('refrigeracion')));
  out.push(badge(138, 84, n('motor'), 'r', m.on('motor')));
  // leyenda
  ACHIQUE.forEach(([k, txt], i) => {
    const y = 166 + i * 15;
    out.push(`<g${m.dim(k)}>${badge(18, y - 4, i + 1, 'r', m.on(k))}${t(32, y, txt)}</g>`);
  });
  out.push(`<g${m.dim('refrigeracion')}>${t(32, 166 + 5 * 15 - 2, '(grifo de fondo cerrado y manguito a la sentina)', { c: 'g' })}</g>`);
  // mínimo obligatorio por zonas
  const yz = 256;
  out.push(seg(10, yz - 13, 310, yz - 13, 'g', 0.6, 'opacity=".6"'));
  out.push(t(14, yz, '**Mínimo obligatorio** (RD 339/2021)'));
  ZONAS.forEach(([k, z, txt], i) => {
    const y = yz + 15 + i * 15;
    const on = m.on(k);
    out.push(`<g${m.dim(k)}>`);
    if (on) out.push(`<rect x="8" y="${y - 11}" width="304" height="15" rx="4" fill="none" stroke="${C.r}" stroke-width="1.8"/>`);
    out.push(t(14, y, z, { b: true, c: on ? 'r' : null }), t(76, y, txt));
    out.push('</g>');
  });
  out.push('</svg>');
  const CAP = {
    manual: 'La bomba manual: la maneja un tripulante mientras los demás achican con baldes.',
    electrica: 'Las bombas eléctricas automáticas arrancan solas cuando sube el nivel de la sentina; comprueba de vez en cuando que funcionan.',
    baldes: 'Los baldes, de al menos 5 litros: dos en las zonas 1 a 3 y uno en las zonas 4 a 6.',
    refrigeracion: 'Truco de emergencia: se cierra el grifo de fondo de la refrigeración, se suelta el manguito y se mete en la sentina; el motor achica.',
    motor: 'El motor, siempre en marcha: carga las baterías de las bombas eléctricas y te permite llegar a puerto.',
    'zonas-1-3': 'Zonas 1, 2 y 3: una bomba accionada por el motor (u otra fuente de energía), una bomba manual y dos baldes de al menos 5 litros.',
    'zonas-4-6': 'Zonas 4, 5 y 6: una bomba manual o eléctrica y un balde de al menos 5 litros.',
    'zona-7': 'Zona 7: una bomba manual o eléctrica, o un achicador si es una embarcación pequeña con cámaras de flotabilidad.',
  };
  const caption = m.lista.length === 1
    ? CAP[m.lista[0]]
    : 'Con agua en la sentina, todos los medios de achique en marcha y el motor encendido. El mínimo obligatorio depende de la zona: en las 1 a 3, bomba de motor, bomba manual y dos baldes; en las 4 a 6, una bomba y un balde; en la 7, una bomba.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------
// 5. Barómetros y tendencia barométrica (per-9-1).
// spec: { tipo:'barometro-tendencia', vista?: 'instrumentos'|'tendencia', resaltar?: 'mercurio'|'aneroide' (instrumentos) |
//         'subida'|'bajada-lenta'|'bajada-rapida'|'estable' (tendencia) }

const TENDENCIAS = [
  ['subida', 'Subida lenta y continuada', 'tiempo que mejora o se mantiene bueno', 'm', [0, 0.35, 0.7, 1]],
  ['bajada-lenta', 'Bajada lenta', 'empeoramiento general', 'a', [0.9, 0.72, 0.52, 0.34]],
  ['bajada-rapida', 'Bajada rápida (más de 3 hPa en 3 h)', 'llega una borrasca o un frente: viento fuerte', 'r', [1, 0.92, 0.42, 0]],
  ['estable', 'Estable', 'seguirá como está, sea bueno o malo', 'v', [0.5, 0.52, 0.49, 0.5]],
];

/** Esfera de aneroide en (cx, cy) de radio r; escala de 960 a 1060 hPa en 270°. ref: lectura anterior (aguja de referencia). */
function esfera(cx, cy, r, lect, ref = null) {
  const ang = (p) => -135 + ((p - 960) / 100) * 270;
  const o = [`<circle cx="${cx}" cy="${cy}" r="${r}" style="fill:var(--bg)" stroke="currentColor" stroke-width="2"/>`, `<circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="currentColor" stroke-width=".6" opacity=".5"/>`];
  for (let p = 960; p <= 1060; p += 5) {
    const a = ang(p);
    const [x1, y1] = pol(cx, cy, a, r - 4);
    const [x2, y2] = pol(cx, cy, a, r - (p % 20 === 0 ? 11 : 7));
    o.push(seg(x1, y1, x2, y2, 'currentColor', p % 20 === 0 ? 1.4 : 0.7));
  }
  if (r >= 44) for (const p of [980, 1040]) {
    const [x, y] = pol(cx, cy, ang(p), r - 25);
    o.push(`<text x="${fx(x)}" y="${fx(y + 3.5)}" class="il-lbl" text-anchor="middle">${p}</text>`);
  }
  if (ref != null) {
    const [x, y] = pol(cx, cy, ang(ref), r - 6);
    o.push(`<line x1="${cx}" y1="${cy}" x2="${fx(x)}" y2="${fx(y)}" stroke="${C.a}" stroke-width="2.4" stroke-dasharray="4 2"/>`);
  }
  const [x, y] = pol(cx, cy, ang(lect), r - 8);
  o.push(`<line x1="${cx}" y1="${cy}" x2="${fx(x)}" y2="${fx(y)}" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, `<circle cx="${cx}" cy="${cy}" r="3.4" fill="currentColor"/>`);
  return o.join('');
}

function instrumentos(m) {
  const ID = 'bi';
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Barómetro de mercurio y aneroide', ID);
  out.push(title(160, 'Barómetro de mercurio y aneroide'));
  out.push(seg(160, 34, 160, 268, 'g', 0.6, 'opacity=".5"'));
  // --- de mercurio
  out.push(`<g${m.dim('mercurio')}>`);
  if (m.on('mercurio')) out.push(`<rect x="5" y="31" width="151" height="240" rx="7" fill="none" stroke="${C.r}" stroke-width="2"/>`);
  out.push(t(80, 47, 'De mercurio', { a: 'middle', b: true, s: 11 }));
  const tx = 66; // eje del tubo
  out.push(`<rect x="34" y="200" width="64" height="26" rx="2" style="fill:var(--bg)" stroke="currentColor" stroke-width="1.2"/>`, `<rect x="35" y="208" width="62" height="17" fill="#94a3b8"/>`);
  out.push(`<path d="M${tx - 5},216 L${tx - 5},186 L${tx - 2},180 L${tx - 2},174 L${tx - 5},168 L${tx - 5},64 A5,5 0 0 1 ${tx + 5},64 L${tx + 5},168 L${tx + 2},174 L${tx + 2},180 L${tx + 5},186 L${tx + 5},216" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<path d="M${tx - 4},96 L${tx + 4},96 L${tx + 4},168 L${tx + 1.4},174 L${tx + 1.4},180 L${tx + 4},186 L${tx + 4},208 L${tx - 4},208 L${tx - 4},186 L${tx - 1.4},180 L${tx - 1.4},174 L${tx - 4},168 Z" fill="#94a3b8"/>`);
  out.push(t(tx + 10, 80, 'vacío', { c: 'g' }));
  // 760 mm entre la superficie de la cubeta y lo alto de la columna
  out.push(`<line x1="${tx - 16}" y1="96" x2="${tx - 16}" y2="208" stroke="${C.p}" stroke-width="1.4" marker-start="url(#${ID}-p)" marker-end="url(#${ID}-p)"/>`);
  out.push(seg(tx - 20, 96, tx - 6, 96, 'p', 0.8), seg(tx - 20, 208, tx - 6, 208, 'p', 0.8));
  out.push(t(tx - 20, 150, '**760**', { a: 'end', c: 'p' }), t(tx - 20, 163, '**mm**', { a: 'end', c: 'p' }));
  out.push(t(tx + 10, 172, 'estrechamiento'), t(tx + 10, 185, 'capilar (marino)'));
  // presión del aire sobre la cubeta
  out.push(flecha(46, 182, 46, 204, 'v', ID, 1.8), flecha(88, 192, 88, 206, 'v', ID, 1.8));
  out.push(t(66, 240, 'presión del aire', { a: 'middle', c: 'v' }));
  out.push(t(80, 258, '**el más exacto**, pero frágil', { a: 'middle', c: m.on('mercurio') ? 'r' : null }));
  out.push('</g>');
  // --- aneroide
  out.push(`<g${m.dim('aneroide')}>`);
  if (m.on('aneroide')) out.push(`<rect x="164" y="31" width="151" height="240" rx="7" fill="none" stroke="${C.r}" stroke-width="2"/>`);
  out.push(t(240, 47, 'Aneroide («sin líquido»)', { a: 'middle', b: true, s: 11 }));
  out.push(esfera(240, 106, 46, 1010));
  out.push(t(240, 166, 'aguja: **lectura directa**', { a: 'middle' }));
  // mecanismo: muelle sobre la cápsula con vacío
  const [mx, my] = [196, 214];
  out.push(`<path d="M${mx - 22},${my} q5.5,-6 11,0 t11,0 t11,0 t11,0 v12 q-5.5,6 -11,0 t-11,0 t-11,0 t-11,0 Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/>`);
  out.push(`<path d="M${mx},${my - 3} l-6,-3 l12,-4 l-12,-4 l12,-4 l-12,-4 l6,-3" fill="none" stroke="${C.a}" stroke-width="1.8"/>`);
  out.push(t(mx + 30, my - 18, '**muelle**: fuerzas', { c: 'a' }), t(mx + 30, my - 5, '**elásticas**', { c: 'a' }));
  out.push(t(mx + 30, my + 11, 'cápsula metálica'), t(mx + 30, my + 24, 'estanca **con vacío**'));
  out.push(t(240, 258, 'robusto; **menos exacto**', { a: 'middle', c: m.on('aneroide') ? 'r' : null }));
  out.push('</g>');
  out.push(t(160, 290, '1 atm = 1013,25 hPa = 760 mmHg', { a: 'middle', b: true }));
  out.push('</svg>');
  const CAP = {
    mercurio: 'Barómetro de mercurio: la presión sostiene una columna de 760 mm en condiciones normales. Es el más exacto, pero frágil; el modelo marino lleva un estrechamiento capilar que amortigua los balances.',
    aneroide: 'Aneroide: una cápsula metálica estanca con vacío que se deforma con la presión, equilibrada por un muelle con fuerzas elásticas. Lectura directa y robusto, pero menos exacto que el de mercurio.',
  };
  const caption = m.lista.length === 1
    ? CAP[m.lista[0]]
    : 'El de mercurio es el más exacto, pero frágil; el marino lleva un estrechamiento capilar. El aneroide no lleva líquido: una cápsula con vacío y un muelle (fuerzas elásticas) mueven una aguja de lectura directa.';
  return { svg: out.join(''), caption };
}

function tendencia(m) {
  const ID = 'bt';
  const W = 320;
  const H = 298;
  const out = open(W, H, 'La tendencia del barómetro', ID);
  out.push(title(160, 'Lo que importa: la tendencia'));
  out.push(t(160, 40, 'Una lectura suelta dice poco: mira cómo cambia.', { a: 'middle', c: 'g' }));
  // aneroide con la aguja de referencia sobre la lectura anterior
  out.push(esfera(62, 96, 44, 1004, 1012));
  out.push(t(118, 66, '**aguja de referencia**', { c: 'a' }), t(118, 79, '(rayada): la dejas sobre', { c: 'a' }), t(118, 92, 'la lectura anterior', { c: 'a' }));
  out.push(t(118, 112, '**aguja**: la lectura de ahora'));
  out.push(t(118, 130, 'Anota la presión al salir y'), t(118, 143, 'cada pocas horas.'));
  out.push(seg(10, 154, 310, 154, 'g', 0.6, 'opacity=".6"'));
  TENDENCIAS.forEach(([k, nombre, sentido, c, ys], i) => {
    const y = 162 + i * 33;
    const on = m.on(k);
    out.push(`<g${m.dim(k)}>`);
    if (on) out.push(`<rect x="6" y="${y - 3}" width="308" height="31" rx="6" fill="none" stroke="${C.r}" stroke-width="2"/>`);
    out.push(`<rect x="14" y="${y}" width="52" height="25" rx="3" style="fill:var(--bg)" stroke="currentColor" stroke-width=".8" opacity=".9"/>`);
    const pts = ys.map((v, j) => `${fx(18 + j * 15)},${fx(y + 21 - v * 17)}`).join(' ');
    out.push(`<polyline points="${pts}" fill="none" stroke="${col(c)}" stroke-width="${on ? 3.2 : 2.2}" stroke-linejoin="round" stroke-linecap="round"/>`);
    out.push(t(76, y + 10, `**${nombre}**`, { c }), t(76, y + 23, sentido));
    out.push('</g>');
  });
  out.push('</svg>');
  const CAP = {
    subida: 'Subida lenta y continuada del barómetro: el tiempo mejora o se mantiene bueno.',
    'bajada-lenta': 'Bajada lenta: empeoramiento general del tiempo.',
    'bajada-rapida': 'Bajada rápida (más de 3 hPa en 3 horas): se acerca una borrasca o un frente, con viento fuerte.',
    estable: 'Barómetro estable: el tiempo seguirá como está, sea bueno o malo.',
  };
  const caption = m.lista.length === 1
    ? CAP[m.lista[0]]
    : 'La aguja de referencia del aneroide se deja sobre la lectura anterior para ver la tendencia. Subida lenta: mejora; bajada lenta: empeora; bajada rápida: borrasca o frente con viento fuerte; estable: sigue igual.';
  return { svg: out.join(''), caption };
}

function barometros(spec = {}) {
  const vista = spec.vista ?? 'instrumentos';
  if (!['instrumentos', 'tendencia'].includes(vista)) return null;
  const m = marcas(spec, vista === 'tendencia' ? TENDENCIAS.map((x) => x[0]) : ['mercurio', 'aneroide']);
  if (!m) return null;
  return vista === 'tendencia' ? tendencia(m) : instrumentos(m);
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  'pabellon-obligatorio': {
    fn: pabellonObligatorioC,
    params: { resaltar: [...Object.keys(PABELLON), 'otras'] },
    ejemplo: { tipo: 'pabellon-obligatorio' },
  },
  'gobierno-rabeo': {
    fn: gobiernoRabeo,
    params: { vista: ['gobierno', 'rabeo'], resaltar: ['gobierno', 'arrancada'] },
    ejemplo: { tipo: 'gobierno-rabeo', vista: 'gobierno' },
  },
  'ciaboga-dos-helices': {
    fn: dibujoAnimado, // animada, en estilo C: src/illustrations/animaciones/ciaboga-dos.js
    params: { banda: ['er', 'br'], resaltar: ['exterior', 'interior', 'ciaboga'] },
    ejemplo: { tipo: 'ciaboga-dos-helices', banda: 'er' },
  },
  'achique-sentina': {
    fn: achique,
    params: { resaltar: [...ACHIQUE.map((a) => a[0]), ...ZONAS.map((z) => z[0])] },
    ejemplo: { tipo: 'achique-sentina' },
  },
  'barometro-tendencia': {
    fn: barometros,
    params: { vista: ['instrumentos', 'tendencia'], resaltar: ['mercurio', 'aneroide', ...TENDENCIAS.map((x) => x[0])] },
    ejemplo: { tipo: 'barometro-tendencia', vista: 'instrumentos' },
  },
};
