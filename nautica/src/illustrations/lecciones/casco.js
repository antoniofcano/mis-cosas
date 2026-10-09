// Láminas del casco y la maniobra básica (PER, UT 1 y UT 7):
// cubierta (per-1-2), estructura del casco (per-1-3 y vías de agua de per-8-5), timón (per-1-4) y cabos (per-7-1).
// Funciones puras spec → { svg, caption }. Fondo il-panel, trazos con currentColor y superficies con variables CSS.

import { C, open, title, lbl, arrow, hullPlan, fx } from '../kit.js';
import { estructuraC, caboC, ESTRUCTURA, CABO } from '../per-cola-c.js';

// ---------------------------------------------------------------------------
// Utilidades de resaltado: lo resaltado va en rojo, en negrita y con trazo más grueso; lo demás se atenúa.

const conjunto = (r) => new Set([].concat(r ?? []).filter(Boolean));
function marcas(resaltar) {
  const hl = conjunto(resaltar);
  const hay = hl.size > 0;
  const hi = (k) => hay && [].concat(k).some((x) => hl.has(x));
  /** Etiqueta de una parte. */
  const pl = (x, y, t, k, anchor = 'start') => hi(k)
    ? lbl(x, y, t, 'r', anchor, 'font-weight="700" font-size="11"')
    : lbl(x, y, t, null, anchor, hay ? 'opacity=".75"' : '');
  /** Línea guía de la etiqueta a la pieza. */
  const lead = (x1, y1, x2, y2, k) => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${hi(k) ? C.r : 'currentColor'}" stroke-width="${hi(k) ? 1.4 : 0.8}" opacity="${hi(k) ? 1 : 0.55}"/>`;
  /** Trazo de una pieza: rojo y grueso si está resaltada. */
  const st = (k, w = 1.4, col = 'currentColor') => (hi(k) ? `stroke="${C.r}" stroke-width="${w + 1.8}"` : `stroke="${col}" stroke-width="${w}"`);
  return { hl, hay, hi, pl, lead, st };
}
const leyenda = (defs, hl, porDefecto) => (hl.size ? [...hl].map((k) => defs[k]).filter(Boolean).join('\n') : porDefecto) || porDefecto;

// ---------------------------------------------------------------------------
// Cubierta. spec: { tipo:'cubierta', resaltar?: parte | [partes] }

const CUBIERTA = {
  banera: 'Bañera: la zona abierta y más baja de la cubierta, normalmente a popa, desde donde se gobierna y se maneja la maniobra.',
  escotilla: 'Escotilla: abertura en la cubierta, con tapa estanca, para pasar a los compartimentos de abajo.',
  lumbrera: 'Lumbrera: abertura en cubierta con tapa acristalada; da luz siempre y, abierta, también ventilación.',
  portillo: 'Portillos: aberturas con cristal en el costado o la superestructura, normalmente redondas. Los fijos solo dan luz; los practicables, luz y aire.',
  tragaluz: 'Tragaluces: ventanas cuya función es dar luz.',
  manguerote: 'Manguerote: conducto con boca orientable que mete aire fresco o saca el viciado. Ventila, pero no da luz.',
  imbornal: 'Imbornales: orificios en el costado, a la altura del trancanil, por los que sale al mar el agua que cae en cubierta.',
  pasamanos: 'Pasamanos: barandas o piezas junto a escalas, superestructuras o en la cubierta para agarrarse con la mano.',
  candelero: 'Candeleros: postes verticales, normalmente metálicos, fijados cerca de la borda.',
  guardamancebos: 'Guardamancebos: cables o cabos que, sujetos por los candeleros, rodean la cubierta para evitar caídas al agua.',
};

export function cubiertaIllustration(spec = {}) {
  const m = marcas(spec.resaltar);
  const { hi, pl, lead, st } = m;
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Cubierta de un barco de recreo', 'cb');
  out.push(title(160, 'En cubierta'));
  const casco = 'style="fill:var(--l-casco)"';
  const cielo = 'style="fill:var(--l-cielo)"';

  // --- Perfil (proa a la derecha)
  const dy = (x) => 86 - (6 * (x - 24)) / 272; // altura de la cubierta en el perfil
  out.push(`<rect x="0" y="112" width="${W}" height="36" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M24,86 L296,80 Q288,104 262,116 L46,116 Q30,114 26,104 Z" ${casco} stroke="currentColor" stroke-width="1.4"/>`);
  // bañera: el pozo bajo a popa
  out.push(`<path d="M34,${fx(dy(34))} L34,100 L112,100 L112,${fx(dy(112))}" fill="none" ${st('banera', 1)} stroke-dasharray="3 2"/>`);
  // superestructura (camarote) con tragaluz y pasamanos en el techo
  out.push(`<path d="M118,${fx(dy(118))} L124,72 L206,72 L228,${fx(dy(228))} Z" ${casco} stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<rect x="156" y="75" width="28" height="5" rx="2" ${cielo} ${st('tragaluz', 1)}/>`);
  out.push(`<path d="M138,67 L196,67 M138,67 L138,72 M157,67 L157,72 M177,67 L177,72 M196,67 L196,72" fill="none" ${st('pasamanos', 2)}/>`);
  // portillos redondos en el costado de proa
  for (const x of [250, 266]) out.push(`<circle cx="${x}" cy="${fx(dy(x) + 10)}" r="3.6" ${cielo} ${st('portillo', 1.2)}/>`);
  // manguerote en la cubierta de proa
  out.push(`<g ${st('manguerote', 1.2)}><rect x="244" y="${fx(dy(246) - 12)}" width="5" height="12" ${casco}/><path d="M243,${fx(dy(246) - 12)} C243,${fx(dy(246) - 22)} 252,${fx(dy(246) - 24)} 258,${fx(dy(246) - 20)} L256,${fx(dy(246) - 13)} C252,${fx(dy(246) - 16)} 249,${fx(dy(246) - 15)} 249,${fx(dy(246) - 12)} Z" ${casco}/></g>`);
  // imbornal con el agua saliendo al mar
  out.push(`<ellipse cx="124" cy="${fx(dy(124) + 3)}" rx="3.2" ry="1.7" fill="${hi('imbornal') ? C.r : 'currentColor'}"/>`);
  out.push(`<path d="M125,${fx(dy(124) + 5)} q4,6 4,18" fill="none" stroke="${C.v}" stroke-width="${hi('imbornal') ? 2.4 : 1.6}" marker-end="url(#cb-v)"/>`);
  // candeleros y guardamancebos
  const postes = [34, 70, 110, 150, 190, 230, 266];
  out.push(`<path d="M${postes.map((x) => `${x},${fx(dy(x) - 26)}`).join(' L')}" fill="none" ${st('guardamancebos', 1.4, C.g)}/>`);
  for (const x of postes) out.push(`<line x1="${x}" y1="${fx(dy(x))}" x2="${x}" y2="${fx(dy(x) - 26)}" ${st('candelero', 1.6)}/>`);
  // etiquetas del perfil
  out.push(pl(14, 44, 'candeleros', 'candelero'), lead(42, 47, 68, dy(70) - 20, 'candelero'));
  out.push(pl(150, 44, 'pasamanos', 'pasamanos', 'middle'), lead(150, 47, 156, 66, 'pasamanos'));
  out.push(pl(306, 44, 'manguerote', 'manguerote', 'end'), lead(280, 47, 256, dy(246) - 22, 'manguerote'));
  out.push(pl(110, 136, 'imbornal', 'imbornal', 'middle'));
  out.push(pl(170, 136, 'tragaluz', 'tragaluz', 'middle'), lead(170, 126, 170, 81, 'tragaluz'));
  out.push(pl(258, 136, 'portillos', 'portillo', 'middle'), lead(258, 126, 258, 97, 'portillo'));

  // --- Planta (proa a la derecha)
  out.push(lbl(14, 176, 'desde arriba', 'g'));
  out.push(`<path d="M30,196 L190,192 C260,194 290,214 298,230 C290,246 260,266 190,268 L30,264 Z" ${casco} stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<rect x="38" y="208" width="74" height="44" rx="6" style="fill:var(--l-g)" fill-opacity=".35" ${st('banera', 1.2)}/>`);
  out.push(`<rect x="118" y="205" width="108" height="50" rx="8" ${casco} stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<path d="M132,210 L212,210 M132,250 L212,250" fill="none" ${st('pasamanos', 2)}/>`);
  out.push(`<g ${st('lumbrera', 1.2)}><rect x="180" y="220" width="26" height="20" rx="2" ${cielo}/><path d="M193,220 L193,240 M180,230 L206,230" fill="none" stroke-width="0.8"/></g>`);
  out.push(`<rect x="240" y="221" width="18" height="18" rx="2" ${casco} ${st('escotilla', 1.8)}/>`);
  out.push(`<g ${st('manguerote', 1.2)}><circle cx="252" cy="208" r="3.5" ${casco}/><path d="M252,204.5 a3.5,3.5 0 0 1 3.5,3.5" fill="none"/></g>`);
  const borde = [[40, 199.5], [70, 198.6], [110, 197.6], [150, 196.6], [190, 196], [230, 199], [262, 207], [284, 222]];
  const lado = (s) => borde.map(([x, y]) => [x, s ? y : 460 - y]);
  const gm = [...lado(true), ...lado(false).reverse()];
  out.push(`<path d="M${gm.map((p) => p.join(',')).join(' L')}" fill="none" ${st('guardamancebos', 1.4, C.g)}/>`);
  for (const [x, y] of [...lado(true), ...lado(false)]) out.push(`<circle cx="${x}" cy="${y}" r="${hi('candelero') ? 2.6 : 1.8}" fill="${hi('candelero') ? C.r : 'currentColor'}"/>`);
  out.push(pl(75, 233, 'bañera', 'banera', 'middle'));
  out.push(pl(236, 180, 'guardamancebos', 'guardamancebos', 'middle'), lead(222, 183, 214, 197, 'guardamancebos'));
  out.push(pl(193, 287, 'lumbrera', 'lumbrera', 'middle'), lead(193, 278, 193, 240, 'lumbrera'));
  out.push(pl(262, 287, 'escotilla', 'escotilla', 'middle'), lead(256, 278, 250, 239, 'escotilla'));
  out.push('</svg>');
  return { svg: out.join(''), caption: leyenda(CUBIERTA, m.hl, 'Lumbreras: luz y aire. Manguerotes: solo aire. Imbornales: el agua de cubierta sale al mar. Los candeleros sostienen los guardamancebos.') };
}

// ---------------------------------------------------------------------------
// Estructura del casco. spec: { tipo:'estructura', vista?: 'partes'|'vias-agua', resaltar?: parte | [partes] }

/** Perfil del casco (proa a la derecha) con sus piezas; en la vista de vías de agua se añaden el eje y el escape. */

// ---------------------------------------------------------------------------
// Timón. spec: { tipo:'timon', vista?: 'partes'|'cana'|'tipos', resaltar?, cana?: 'babor'|'estribor' }

const TIMON = {
  pala: 'Pala o azafrán: la superficie que, al girar, desvía el agua y hace caer la proa.',
  mecha: 'Mecha: el eje de la pala, alrededor del cual gira.',
  limera: 'Limera: el orificio del casco por el que entra la mecha; lleva un cierre estanco para que no entre agua.',
  cana: 'Caña: la palanca unida a la cabeza de la mecha.',
  rueda: 'Rueda: el volante de gobierno; mueve la mecha mediante guardines o con un sistema hidráulico.',
  guardines: 'Guardines: los cables o cadenas que llevan el giro de la rueda a la mecha.',
};
const TIPOS = {
  ordinario: 'Ordinario: toda la pala queda a popa de la mecha.',
  compensado: 'Compensado: una parte de la pala queda a proa de la mecha; el agua ayuda a girarla y cuesta mucho menos esfuerzo.',
  semicompensado: 'Semicompensado: solo la parte baja de la pala está compensada.',
  suspendido: 'Suspendido: la pala cuelga solo de la mecha, sin apoyo por abajo; muy habitual en los veleros modernos.',
};

function timonPartes(spec) {
  const m = marcas(spec.resaltar);
  const { pl, lead, st, hi } = m;
  const W = 320;
  const H = 230;
  const out = open(W, H, 'Partes del timón', 'tp');
  out.push(title(160, 'Partes del timón'));
  // popa vista de costado (popa a la izquierda)
  out.push(`<rect x="0" y="96" width="200" height="124" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M196,60 L30,60 L34,88 L70,108 L196,114 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<line x1="196" y1="60" x2="196" y2="114" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`);
  out.push(lbl(186, 74, 'proa →', 'g', 'end'));
  // pala, mecha y limera
  out.push(`<path d="M84,118 L84,186 L46,180 Q38,150 48,120 Z" style="fill:var(--l-g)" ${st('pala', 1.2)}/>`);
  out.push(`<line x1="84" y1="44" x2="84" y2="186" ${st('mecha', 3)} stroke-linecap="round"/>`);
  out.push(`<rect x="78" y="104" width="12" height="9" rx="1.5" fill="${hi('limera') ? C.r : 'currentColor'}" opacity="${hi('limera') ? 1 : 0.7}"/>`);
  // caña
  out.push(`<line x1="84" y1="46" x2="164" y2="36" ${hi('cana') ? `stroke="${C.r}" stroke-width="7"` : 'style="stroke:var(--l-a)" stroke-width="5"'} stroke-linecap="round"/>`);
  out.push(pl(170, 40, 'caña', 'cana'));
  out.push(pl(98, 150, 'mecha (eje)', 'mecha'), lead(96, 147, 86, 140, 'mecha'));
  out.push(pl(110, 94, 'limera', 'limera'), lead(110, 96, 91, 106, 'limera'));
  out.push(pl(62, 206, 'pala o azafrán', 'pala', 'middle'));
  // recuadro: gobierno con rueda
  out.push(`<rect x="206" y="34" width="106" height="186" rx="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>`);
  out.push(lbl(259, 50, 'o con rueda', null, 'middle', 'font-weight="700"'));
  const wc = hi('rueda') ? C.r : 'currentColor';
  out.push(`<rect x="233" y="104" width="6" height="58" style="fill:var(--l-g)"/>`);
  out.push(`<g stroke="${wc}" stroke-width="${hi('rueda') ? 3.4 : 2.4}" fill="none"><circle cx="236" cy="84" r="20"/>${[0, 60, 120].map((a) => `<line x1="${fx(236 + 26 * Math.cos((a * Math.PI) / 180))}" y1="${fx(84 + 26 * Math.sin((a * Math.PI) / 180))}" x2="${fx(236 - 26 * Math.cos((a * Math.PI) / 180))}" y2="${fx(84 - 26 * Math.sin((a * Math.PI) / 180))}" stroke-width="1.6"/>`).join('')}</g><circle cx="236" cy="84" r="3.5" fill="${wc}"/>`);
  out.push(pl(262, 72, 'rueda', 'rueda'));
  // guardines hasta el sector de la mecha
  out.push(`<line x1="292" y1="150" x2="292" y2="212" ${st('mecha', 3)}/>`);
  out.push(`<path d="M292,166 L274,166 A18,18 0 0 1 292,148 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
  out.push(`<path d="M236,88 L236,168 L274,168" fill="none" stroke="${hi('guardines') ? C.r : C.v}" stroke-width="${hi('guardines') ? 2.6 : 1.6}"/><circle cx="236" cy="168" r="3" fill="none" stroke="currentColor"/>`);
  out.push(pl(212, 190, 'guardines', 'guardines'));
  out.push(pl(286, 210, 'mecha', 'mecha', 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: leyenda(TIMON, m.hl, 'Pala que desvía el agua, mecha que es su eje, limera por donde la mecha atraviesa el casco, y caña o rueda para moverla (de la rueda a la mecha van los guardines).') };
}

function timonCana(spec) {
  const cana = spec.cana === 'estribor' ? 'estribor' : 'babor';
  const cae = cana === 'babor' ? 'estribor' : 'babor';
  const s = cae === 'estribor' ? 1 : -1; // hacia dónde cae la proa (+1 = derecha = estribor)
  const W = 320;
  const H = 292;
  const out = open(W, H, 'Caña y rueda', 'tc');
  out.push(title(160, 'Avante: caña y rueda'));
  const panel = (cx, conCana) => {
    const cy = 136;
    const g = [];
    g.push(lbl(cx, 40, conCana ? 'Con caña' : 'Con rueda', null, 'middle', 'font-weight="700" font-size="11"'));
    g.push(`<g transform="translate(${cx} ${cy})">${hullPlan(130, 54, 'style="fill:var(--l-casco);stroke:currentColor"')}</g>`);
    g.push(lbl(cx - 31, cy - 18, 'babor', 'g', 'end'), lbl(cx + 31, cy - 18, 'estribor', 'g'));
    const px = cx;
    const py = cy + 60;
    const a = (20 * Math.PI) / 180;
    // pala hacia la banda a la que cae la proa (vista desde arriba, sale a popa)
    const [bx, by] = [px + s * 24 * Math.sin(a), py + 24 * Math.cos(a)];
    g.push(`<line x1="${px}" y1="${py}" x2="${fx(bx)}" y2="${fx(by)}" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`);
    g.push(lbl(bx + s * 7, by + 2, 'pala', null, s > 0 ? 'start' : 'end'));
    if (conCana) {
      const [tx, ty] = [px - s * 44 * Math.sin(a), py - 44 * Math.cos(a)];
      g.push(`<line x1="${px}" y1="${py}" x2="${fx(tx)}" y2="${fx(ty)}" style="stroke:var(--l-a)" stroke-width="5" stroke-linecap="round"/>`);
      g.push(arrow(tx - s * 4, ty, tx - s * 24, ty, 'r', 'tc', 2.4));
      g.push(lbl(tx - s * 28, ty + 4, 'caña', 'r', s > 0 ? 'end' : 'start', 'font-weight="700"'));
    } else {
      const [wx, wy] = [cx, cy + 30];
      g.push(`<circle cx="${wx}" cy="${wy}" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="${wx - 10}" y1="${wy}" x2="${wx + 10}" y2="${wy}" stroke="currentColor"/><line x1="${wx}" y1="${wy - 10}" x2="${wx}" y2="${wy + 10}" stroke="currentColor"/>`);
      // giro de la rueda (horario = a estribor), visto por quien gobierna
      g.push(`<path d="M${wx - s * 9},${wy - 16} A18,18 0 0 ${s > 0 ? 1 : 0} ${wx + s * 16},${wy - 6}" fill="none" stroke="${C.r}" stroke-width="2.4" marker-end="url(#tc-r)"/>`);
    }
    // la proa cae
    g.push(`<path d="M${cx},${cy - 70} Q${cx + s * 4},${cy - 84} ${cx + s * 30},${cy - 80}" fill="none" stroke="${C.m}" stroke-width="2.6" marker-end="url(#tc-m)"/>`);
    g.push(lbl(cx, 236, conCana ? `caña a ${cana}` : `rueda a ${cae}`, 'r', 'middle', 'font-weight="700" font-size="11"'));
    g.push(lbl(cx, 250, `pala a ${cae}`, null, 'middle', 'font-size="11"'));
    g.push(lbl(cx, 264, `proa a ${cae}`, 'm', 'middle', 'font-weight="700" font-size="11"'));
    return g.join('');
  };
  out.push(panel(80, true), panel(240, false));
  out.push(`<line x1="160" y1="36" x2="160" y2="266" stroke="currentColor" stroke-opacity=".2"/>`);
  out.push(lbl(160, 284, 'Caña: la proa cae al lado contrario. Rueda: al mismo.', null, 'middle', 'font-size="11"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: `Con el barco avanzando: caña a ${cana} → la pala va a ${cae} → la proa cae a ${cae}. La rueda funciona como el volante de un coche: rueda a ${cae} → proa a ${cae}.` };
}

function timonTipos(spec) {
  const hl = conjunto(spec.resaltar);
  const W = 320;
  const H = 306;
  const out = open(W, H, 'Tipos de timón', 'tt');
  out.push(title(160, 'Tipos de timón (de costado)'));
  out.push(lbl(14, 40, '← popa', 'g'), lbl(306, 40, 'proa →', 'g', 'end'));
  out.push(`<rect x="110" y="32" width="10" height="9" style="fill:var(--l-a)" fill-opacity=".55" stroke="currentColor" stroke-width=".6"/>`, lbl(124, 40, 'parte compensada'));
  const cells = [
    ['ordinario', 'Ordinario', 'toda la pala a popa'],
    ['compensado', 'Compensado', 'parte a proa de la mecha'],
    ['semicompensado', 'Semicompensado', 'compensado solo abajo'],
    ['suspendido', 'Suspendido', 'sin apoyo por abajo'],
  ];
  cells.forEach(([k, name, sub], i) => {
    const cx = 80 + (i % 2) * 160;
    const y0 = 54 + Math.floor(i / 2) * 120;
    const y1 = y0 + 16;
    const y2 = y0 + 76;
    const mx = cx + 6; // mecha
    const on = hl.size === 0 || hl.has(k);
    const g = [`<g opacity="${on ? 1 : 0.45}">`];
    g.push(`<rect x="${cx - 44}" y="${y0}" width="88" height="10" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
    const blade = (x1, x2) => `<path d="M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1 + 4},${y2} Q${x1 - 2},${(y1 + y2) / 2} ${x1},${y1} Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/>`;
    const comp = (x1, x2, ya, yb) => `<rect x="${x1}" y="${ya}" width="${x2 - x1}" height="${yb - ya}" style="fill:var(--l-a)" fill-opacity=".55" stroke="currentColor" stroke-width="1"/>`;
    const apoyo = (x) => `<path d="M${x},${y0 + 10} L${x + 8},${y0 + 10} L${x + 8},${y2 + 6} L${mx - 3},${y2 + 6} L${mx - 3},${y2 + 1} L${x},${y2 + 1} Z" fill="currentColor" opacity=".55"/>`;
    if (k === 'ordinario') g.push(blade(cx - 28, mx), apoyo(mx + 3));
    if (k === 'compensado') g.push(blade(cx - 22, mx), comp(mx, mx + 14, y1, y2), apoyo(mx + 18));
    if (k === 'semicompensado') g.push(blade(cx - 24, mx), comp(mx, mx + 14, y1 + 30, y2), `<path d="M${mx + 1},${y0 + 10} L${mx + 18},${y0 + 10} L${mx + 14},${y1 + 28} L${mx + 1},${y1 + 28} Z" fill="currentColor" opacity=".55"/>`);
    if (k === 'suspendido') g.push(blade(cx - 20, mx), comp(mx, mx + 12, y1, y2));
    g.push(`<line x1="${mx}" y1="${y0 - 6}" x2="${mx}" y2="${y2 - 2}" stroke="${on && hl.size ? C.r : 'currentColor'}" stroke-width="2.4"/>`);
    g.push('</g>');
    out.push(g.join(''));
    const strong = hl.has(k);
    out.push(lbl(cx, y0 + 98, name, strong ? 'r' : null, 'middle', `font-weight="700" font-size="11"`));
    out.push(lbl(cx, y0 + 111, sub, null, 'middle'));
  });
  out.push(`<line x1="160" y1="52" x2="160" y2="286" stroke="currentColor" stroke-opacity=".15"/>`);
  out.push(lbl(160, 298, 'Raya vertical: la mecha. En gris oscuro: apoyos del casco.', 'g', 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: leyenda(TIPOS, hl, 'Según dónde quede la pala respecto a la mecha: ordinario (toda a popa), compensado (parte a proa; cuesta menos girarla), semicompensado (solo la parte baja) y suspendido (cuelga solo de la mecha).') };
}

export function timonIllustration(spec = {}) {
  if (spec.vista === 'cana') return timonCana(spec);
  if (spec.vista === 'tipos') return timonTipos(spec);
  return timonPartes(spec);
}

// ---------------------------------------------------------------------------
// Cabos. spec: { tipo:'cabo', vista?: 'partes'|'cornamusa'|'por-seno'|'encapillar', resaltar? }

// ---------------------------------------------------------------------------

export const LAMINAS = {
  cubierta: {
    fn: cubiertaIllustration,
    params: { resaltar: Object.keys(CUBIERTA) },
    ejemplo: { tipo: 'cubierta', resaltar: ['lumbrera', 'manguerote'] },
  },
  estructura: {
    fn: estructuraC,
    params: { vista: ['partes', 'vias-agua'], resaltar: ESTRUCTURA },
    ejemplo: { tipo: 'estructura', resaltar: ['quilla', 'roda', 'codaste'] },
  },
  timon: {
    fn: timonIllustration,
    params: { vista: ['partes', 'cana', 'tipos'], resaltar: [...Object.keys(TIMON), ...Object.keys(TIPOS)], cana: ['babor', 'estribor'] },
    ejemplo: { tipo: 'timon', vista: 'cana', cana: 'babor' },
  },
  cabo: {
    fn: caboC,
    params: { vista: ['partes', 'cornamusa', 'por-seno', 'encapillar'], resaltar: CABO },
    ejemplo: { tipo: 'cabo', vista: 'partes' },
  },
};
