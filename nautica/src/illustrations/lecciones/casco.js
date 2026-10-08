// Láminas del casco y la maniobra básica (PER, UT 1 y UT 7):
// cubierta (per-1-2), estructura del casco (per-1-3 y vías de agua de per-8-5), timón (per-1-4) y cabos (per-7-1).
// Funciones puras spec → { svg, caption }. Fondo il-panel, trazos con currentColor y superficies con variables CSS.

import { C, open, title, lbl, arrow, hullPlan, fx } from '../kit.js';

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

const ESTRUCTURA = {
  quilla: 'Quilla: la pieza longitudinal que recorre el casco de proa a popa por su parte más baja; sobre ella se montan las cuadernas.',
  roda: 'Roda: continúa la quilla hacia proa y forma el «filo» de la proa.',
  codaste: 'Codaste: continúa la quilla hacia popa; en él se apoya el timón y por esa zona sale el eje de la hélice.',
  cuadernas: 'Cuadernas: las «costillas» transversales que salen de la quilla y dan forma al casco.',
  baos: 'Baos: vigas de banda a banda que sostienen la cubierta; tienen una ligera curva hacia arriba para que el agua corra a los costados.',
  trancanil: 'Trancanil: la zona de unión de la cubierta con el costado.',
  borda: 'Borda: la parte del costado que queda por encima de la cubierta, desde esta hasta la regala.',
  regala: 'Regala: la pieza que remata la borda por arriba; refuerzo longitudinal en la parte alta del casco.',
  mamparos: 'Mamparos: tabiques que dividen el interior; si son estancos, limitan una inundación. El primero de proa es el mamparo de colisión.',
  plan: 'Plan: el piso más bajo del interior.',
  sentina: 'Sentina: debajo del plan, la parte más baja del casco, donde se acumula el agua; se vacía con las bombas de achique.',
  'grifos-fondo': 'Grifos de fondo: válvulas por debajo de la flotación que dejan pasar agua de mar; ciérralos al dejar el barco.',
};

/** Perfil del casco (proa a la derecha) con sus piezas; en la vista de vías de agua se añaden el eje y el escape. */
function perfilCasco(m, vias) {
  const { st, hi } = m;
  const dy = (x) => 52 - (6 * (x - 20)) / 276;
  const o = [];
  o.push(`<rect x="0" y="70" width="320" height="58" style="fill:var(--l-mar)"/>`);
  o.push(`<path d="M20,52 L296,46 Q290,92 262,108 L70,108 L70,78 L24,72 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  // cuadernas y mamparos
  for (const x of [128, 148, 168, 188, 208, 228]) o.push(`<line x1="${x}" y1="${fx(dy(x) + 1)}" x2="${x}" y2="107" ${st('cuadernas', 1.2)} opacity="${hi('cuadernas') ? 1 : 0.45}"/>`);
  for (const x of [112, 248]) o.push(`<line x1="${x}" y1="${fx(dy(x) + 1)}" x2="${x}" y2="${x > 200 ? 101 : 107}" ${st('mamparos', 3)} opacity="${hi('mamparos') ? 1 : 0.7}"/>`);
  // sentina (con agua) bajo el plan
  o.push(`<rect x="72" y="98" width="186" height="9" style="fill:var(--l-v)" fill-opacity="${hi('sentina') ? 0.6 : 0.3}" ${hi('sentina') ? `stroke="${C.r}" stroke-width="1.6"` : ''}/>`);
  o.push(`<line x1="72" y1="98" x2="258" y2="98" ${st('plan', 1.6)}/>`);
  // motor, eje y hélice (la hélice, fuera del casco)
  o.push(`<rect x="84" y="84" width="24" height="14" rx="2" style="fill:var(--l-g)" stroke="currentColor" stroke-width="0.8"/>`);
  o.push(`<line x1="84" y1="94" x2="62" y2="94" stroke="currentColor" stroke-width="1.6"/><ellipse cx="62" cy="94" rx="2" ry="7" style="fill:var(--l-g)" stroke="currentColor" stroke-width="0.8"/>`);
  // timón colgado a popa: mecha que atraviesa el casco por la limera
  o.push(`<path d="M42,80 L54,80 L54,112 L34,110 Q28,96 32,82 Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/><line x1="42" y1="${fx(dy(42))}" x2="42" y2="82" stroke="currentColor" stroke-width="1.6"/>`);
  // grifo de fondo sobre su pasacascos
  o.push(`<g ${st('grifos-fondo', 1.2)}><path d="M146,99 L154,105 L154,99 L146,105 Z" fill="currentColor"/><line x1="150" y1="105" x2="150" y2="110"/><line x1="150" y1="99" x2="150" y2="90"/></g>`);
  // quilla, codaste y roda
  o.push(`<line x1="70" y1="108" x2="262" y2="108" ${st('quilla', 4)} stroke-linecap="round"/>`);
  o.push(`<line x1="70" y1="108" x2="70" y2="78" ${st('codaste', 4)} stroke-linecap="round"/>`);
  o.push(`<path d="M262,108 Q290,92 296,46" fill="none" ${st('roda', 4)} stroke-linecap="round"/>`);
  o.push(`<line x1="20" y1="70" x2="300" y2="70" stroke="${C.v}" stroke-width="0.8" stroke-dasharray="4 3" opacity=".7"/>`);
  if (vias) o.push(`<circle cx="22" cy="62" r="2.4" fill="currentColor"/>`);
  return { o, dy };
}

export function estructuraIllustration(spec = {}) {
  const vias = spec.vista === 'vias-agua';
  const m = marcas(vias ? null : spec.resaltar);
  const { pl, lead, st, hi } = m;
  const W = 320;
  const H = vias ? 250 : 300;
  const out = open(W, H, vias ? 'Puntos críticos de las vías de agua' : 'Estructura del casco', 'es');
  out.push(title(160, vias ? 'Por dónde entra el agua' : 'La estructura del casco'));
  const { o } = perfilCasco(m, vias);
  out.push(...o);
  if (vias) {
    // números sobre los puntos que atraviesan el casco
    const badge = (n, bx, by, px, py) => `<line x1="${bx}" y1="${by}" x2="${px}" y2="${py}" stroke="${C.r}" stroke-width="1.2"/><circle cx="${px}" cy="${py}" r="2.6" fill="${C.r}"/><circle cx="${bx}" cy="${by}" r="7.5" fill="${C.r}"/><text x="${bx}" y="${by + 3.6}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${n}</text>`;
    out.push(badge(1, 84, 122, 70, 94));
    out.push(badge(2, 40, 36, 42, 74));
    out.push(badge(3, 150, 122, 150, 108));
    out.push(badge(4, 12, 36, 21, 62));
    const filas = [
      ['1', 'Bocina: paso del eje de la hélice'],
      ['2', 'Limera: paso de la mecha del timón'],
      ['3', 'Grifos de fondo y pasacascos'],
      ['4', 'Escape del motor (puede agrietarse)'],
    ];
    filas.forEach(([n, t], i) => {
      const y = 152 + i * 20;
      out.push(`<circle cx="26" cy="${y - 4}" r="7" fill="${C.r}"/><text x="26" y="${y - 0.4}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${n}</text>`, lbl(40, y, t, null, 'start', 'font-size="11"'));
    });
    out.push(`<text x="21" y="${152 + 4 * 20}" font-size="12" font-weight="700" fill="${C.g}">×</text>`, lbl(40, 232, 'La hélice no: está fuera del casco', null, 'start', 'font-size="11"'));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'El agua entra casi siempre por donde algo atraviesa el casco: la bocina del eje, la limera del timón, los grifos de fondo y pasacascos, y el escape. Cierra los grifos de fondo que no uses.' };
  }
  out.push(lbl(14, 36, 'de costado', 'g'));
  out.push(pl(110, 38, 'mamparos', 'mamparos', 'middle'), lead(110, 41, 112, 53, 'mamparos'));
  out.push(pl(178, 38, 'cuadernas', 'cuadernas', 'middle'), lead(178, 41, 168, 62, 'cuadernas'));
  out.push(pl(262, 38, 'mamparo de colisión', 'mamparos', 'middle'), lead(258, 41, 248, 52, 'mamparos'));
  out.push(pl(286, 98, 'roda', 'roda'));
  out.push(pl(70, 124, 'codaste', 'codaste', 'middle'));
  out.push(pl(150, 124, 'grifo de fondo', 'grifos-fondo', 'middle'), lead(150, 115, 150, 109, 'grifos-fondo'));
  out.push(pl(222, 124, 'quilla', 'quilla', 'middle'), lead(222, 115, 222, 110, 'quilla'));

  // --- Sección transversal
  out.push(lbl(14, 150, 'sección', 'g'));
  const sx = 90;
  out.push(`<rect x="14" y="226" width="152" height="66" style="fill:var(--l-mar)"/>`);
  const casco = `M40,168 L40,190 C40,240 70,270 ${sx},276 C110,270 140,240 140,190 L140,168`;
  out.push(`<path d="${casco} Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<path d="M45,192 C45,238 72,264 ${sx},270 C108,264 135,238 135,192" fill="none" ${st('cuadernas', 2.4)} opacity="${hi('cuadernas') ? 1 : 0.6}"/>`);
  // sentina con agua, plan, bao y cubierta
  out.push(`<path d="M55,250 C66,262 80,268 ${sx},269 C100,268 114,262 125,250 Z" style="fill:var(--l-v)" fill-opacity="${hi('sentina') ? 0.6 : 0.3}" ${hi('sentina') ? `stroke="${C.r}" stroke-width="1.6"` : 'stroke="none"'}/>`);
  out.push(`<line x1="55" y1="250" x2="125" y2="250" ${st('plan', 1.8)}/>`);
  out.push(`<path d="M42,195 Q${sx},187 138,195" fill="none" ${st('baos', 3.5)}/>`);
  out.push(`<path d="M40,190 Q${sx},182 140,190" fill="none" stroke="currentColor" stroke-width="1.6"/>`);
  // borda, regala y trancanil (en las dos bandas)
  for (const x of [40, 140]) {
    out.push(`<line x1="${x}" y1="190" x2="${x}" y2="170" ${st('borda', 1.6)}/>`);
    out.push(`<rect x="${x - 4}" y="164" width="8" height="6" rx="1.5" fill="${hi('regala') ? C.r : 'currentColor'}"/>`);
    out.push(`<circle cx="${x}" cy="190" r="${hi('trancanil') ? 4 : 2.6}" fill="${hi('trancanil') ? C.r : 'currentColor'}"/>`);
  }
  out.push(`<rect x="84" y="274" width="12" height="12" rx="1.5" fill="${hi('quilla') ? C.r : 'currentColor'}"/>`);
  out.push(`<line x1="18" y1="226" x2="162" y2="226" stroke="${C.v}" stroke-width="0.8" stroke-dasharray="4 3" opacity=".7"/>`);
  const S = [
    ['regala', 'regala', 166, 145, 167],
    ['borda', 'borda', 182, 141, 180],
    ['trancanil', 'trancanil', 198, 143, 191],
    ['baos', 'bao', 214, 122, 193],
    ['cuadernas', 'cuaderna', 232, 133, 226],
    ['plan', 'plan', 250, 125, 250],
    ['sentina', 'sentina', 266, 112, 261],
    ['quilla', 'quilla', 284, 97, 281],
  ];
  for (const [k, t, y, px, py] of S) out.push(lead(178, y - 3.5, px, py, k), pl(182, y, t, k));
  out.push('</svg>');
  return { svg: out.join(''), caption: leyenda(ESTRUCTURA, m.hl, 'Quilla: longitudinal, abajo. Baos: transversales, sostienen la cubierta. Regala: longitudinal, arriba, remata la borda.') };
}

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

const CABO = {
  chicote: 'Chicote: cada uno de los dos extremos del cabo.',
  firme: 'Firme: la parte que trabaja, la que soporta la tensión.',
  seno: 'Seno: la parte intermedia, cuando forma una curva o un arco.',
  gaza: 'Gaza: un ojo fijo hecho en un extremo, con una costura o con un nudo; si va a rozar, se protege con un guardacabos.',
};

/** Cabo: contorno con currentColor y alma de color (rojo si está resaltado). */
const cuerda = (d, on = false, w = 4, col = 'var(--l-a)') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${on ? C.r : col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function caboPartes(spec) {
  const m = marcas(spec.resaltar);
  const { pl, hi } = m;
  const W = 320;
  const H = 210;
  const out = open(W, H, 'Partes de un cabo', 'cp');
  out.push(title(160, 'Partes de un cabo (desde arriba)'));
  out.push(`<rect x="0" y="32" width="66" height="170" fill="#a16207" opacity=".7"/>`, `<rect x="66" y="32" width="128" height="170" style="fill:var(--l-mar)"/>`, `<rect x="194" y="32" width="126" height="170" style="fill:var(--l-casco)"/>`);
  out.push(lbl(33, 196, 'muelle', null, 'middle', 'style="fill:#fff" font-weight="700"'), lbl(257, 196, 'a bordo', 'g', 'middle'));
  // noray con la gaza y su guardacabos
  out.push(`<circle cx="36" cy="100" r="9" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(cuerda('M84,100 L70,100 C56,82 22,80 22,100 C22,120 56,118 70,100', hi('gaza')));
  out.push(`<path d="M66,100 C54,88 28,88 28,100 C28,112 54,112 66,100" fill="none" stroke="#94a3b8" stroke-width="1.6"/>`);
  out.push(`<rect x="70" y="96" width="14" height="8" rx="2" fill="currentColor" opacity=".55"/>`);
  // firme tenso hasta la cornamusa
  out.push(cuerda('M84,100 L214,100', hi('firme')));
  out.push(arrow(150, 112, 110, 112, hi('firme') ? 'r' : 'g', 'cp', 1.6), arrow(150, 112, 190, 112, hi('firme') ? 'r' : 'g', 'cp', 1.6));
  // cornamusa a bordo
  out.push(`<rect x="208" y="94" width="34" height="8" rx="4" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/>`);
  out.push(cuerda('M214,100 L238,96 M214,96 L238,100', false, 3));
  // seno y chicote libre
  out.push(cuerda('M238,98 Q262,170 290,116', hi('seno')));
  out.push(cuerda('M290,116 L300,104', hi('chicote')), `<circle cx="300" cy="104" r="3.2" fill="${hi('chicote') ? C.r : 'currentColor'}"/>`);
  out.push(pl(36, 72, 'gaza', 'gaza', 'middle'), pl(36, 136, 'guardacabos', 'gaza', 'middle'));
  out.push(pl(130, 92, 'firme', 'firme', 'middle'), lbl(130, 128, 'soporta la tensión', 'g', 'middle'));
  out.push(pl(225, 86, 'cornamusa', null, 'middle'));
  out.push(pl(262, 154, 'seno', 'seno', 'middle'));
  out.push(pl(300, 92, 'chicote', 'chicote', 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: leyenda(CABO, m.hl, 'Chicote: cada extremo. Firme: la parte que trabaja. Seno: la parte intermedia, en curva. La gaza es un ojo fijo en un extremo, protegido aquí con un guardacabos.') };
}

function caboCornamusa() {
  const W = 320;
  const H = 210;
  const out = open(W, H, 'Hacer firme en una cornamusa', 'cn');
  out.push(title(160, 'Hacer firme en una cornamusa'));
  const cleat = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="8" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/><path d="M${cx - 34},${cy - 3} Q${cx - 34},${cy - 6} ${cx - 28},${cy - 6} L${cx + 28},${cy - 6} Q${cx + 34},${cy - 6} ${cx + 34},${cy - 3} L${cx + 34},${cy + 3} Q${cx + 34},${cy + 6} ${cx + 28},${cy + 6} L${cx - 28},${cy + 6} Q${cx - 34},${cy + 6} ${cx - 34},${cy + 3} Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>`;
  const pasos = [
    ['1', 'vuelta completa', 'a la base'],
    ['2', 'vueltas en ocho', 'por los cuernos'],
    ['3', 'la última,', 'mordida (cote)'],
  ];
  pasos.forEach(([n, t1, t2], i) => {
    const cx = 56 + i * 104;
    const cy = 104;
    const g = [];
    // entrada desde la carga (abajo a la izquierda) y vuelta a la base, que pasa bajo los cuernos
    g.push(cuerda(`M${cx - 48},${cy + 44} L${cx - 14},${cy + 12}`, false, 3.4));
    g.push(cuerda(`M${cx - 14},${cy + 12} C${cx + 30},${cy + 12} ${cx + 30},${cy - 12} ${cx},${cy - 12} C${cx - 30},${cy - 12} ${cx - 26},${cy + 12} ${cx - 6},${cy + 14}`, false, 3.4));
    g.push(cleat(cx, cy));
    if (i === 0) g.push(cuerda(`M${cx - 6},${cy + 14} L${cx + 26},${cy + 36}`, false, 3.4));
    if (i >= 1) {
      // ochos: cruzan por encima en diagonal y rodean los cuernos
      g.push(cuerda(`M${cx - 6},${cy + 14} L${cx + 24},${cy - 10} C${cx + 40},${cy - 22} ${cx + 44},${cy + 4} ${cx + 30},${cy + 10} L${cx - 26},${cy - 10} C${cx - 42},${cy - 16} ${cx - 42},${cy + 12} ${cx - 28},${cy + 10} L${cx + 22},${cy - 12}`, false, 3.4));
    }
    if (i === 1) g.push(cuerda(`M${cx + 22},${cy - 12} C${cx + 40},${cy - 24} ${cx + 46},${cy + 4} ${cx + 32},${cy + 14} L${cx + 40},${cy + 36}`, false, 3.4));
    if (i === 2) {
      // mordida: el seno se da la vuelta y el chicote queda bajo la última vuelta
      g.push(cuerda(`M${cx + 22},${cy - 12} C${cx + 30},${cy - 18} ${cx + 38},${cy - 12} ${cx + 30},${cy - 4} C${cx + 22},${cy + 4} ${cx + 14},${cy - 14} ${cx + 24},${cy - 22} L${cx + 40},${cy - 34}`, true, 3.4));
      g.push(lbl(cx + 44, cy - 38, 'mordida', 'r', 'end', 'font-weight="700"'));
    }
    g.push(`<circle cx="${cx - 34}" cy="52" r="8" fill="${C.v}"/><text x="${cx - 34}" y="55.6" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${n}</text>`);
    g.push(lbl(cx, 168, t1, null, 'middle', 'font-weight="700"'), lbl(cx, 182, t2, null, 'middle', 'font-weight="700"'));
    out.push(g.join(''));
  });
  out.push(lbl(36, 152, 'firme', 'g'));
  out.push(lbl(160, 202, 'Sin vueltas de más: se suelta en segundos.', 'g', 'middle'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Hacer firme en una cornamusa: una vuelta completa a la base, varias vueltas cruzadas en ocho por los cuernos y la última mordida, con un cote que la bloquea. Sin vueltas de más: así se suelta en segundos.' };
}

function caboPorSeno() {
  const W = 320;
  const H = 220;
  const out = open(W, H, 'Amarrar por seno', 'ps');
  out.push(title(160, 'Amarrar por seno (desde arriba)'));
  out.push(`<rect x="0" y="34" width="${W}" height="134" style="fill:var(--l-mar)"/>`, `<rect x="0" y="168" width="${W}" height="44" fill="#a16207" opacity=".7"/>`);
  out.push(`<path d="M30,64 L230,62 C280,64 300,80 306,92 C300,104 280,120 230,122 L30,120 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(lbl(290, 96, 'proa', 'g', 'end'));
  for (const x of [112, 208]) out.push(`<rect x="${x - 12}" y="108" width="24" height="7" rx="3.5" style="fill:var(--l-g)" stroke="currentColor"/>`);
  out.push(`<circle cx="160" cy="182" r="7" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(cuerda('M112,112 L154,176 A8,8 0 1 0 166,176 L208,112'));
  out.push(lbl(112, 100, 'firme', null, 'middle', 'font-weight="700"'), lbl(208, 100, 'chicote', null, 'middle', 'font-weight="700"'));
  out.push(lbl(160, 82, 'los dos extremos, a bordo', 'm', 'middle', 'font-weight="700"'));
  out.push(lbl(176, 194, 'noray o argolla', null, 'start', 'style="fill:#fff" font-weight="700"'));
  out.push(arrow(196, 148, 212, 124, 'v', 'ps', 2), lbl(218, 146, 'cobras de uno', 'var(--l-v)'));
  out.push(lbl(54, 146, 'sueltas el otro', 'var(--l-v)'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Por seno, el firme y el chicote quedan los dos a bordo. Para largar sueltas un extremo y cobras del otro, sin nadie en el muelle. Si algún extremo queda en tierra, ya no es por seno.' };
}

function caboEncapillar() {
  const W = 320;
  const H = 220;
  const out = open(W, H, 'Encapillar una gaza', 'ec');
  out.push(title(160, 'Encapillar sobre otra gaza'));
  out.push(`<rect x="0" y="176" width="${W}" height="36" fill="#a16207" opacity=".7"/>`);
  // noray de costado
  out.push(`<rect x="146" y="76" width="28" height="100" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/><rect x="138" y="68" width="44" height="10" rx="4" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>`);
  const vecino = 'var(--l-casco)';
  // gaza del vecino (abajo): parte de atrás, luego su cabo hacia la izquierda
  out.push(cuerda('M132,150 C134,143 186,143 188,150', false, 3.4, vecino));
  out.push(cuerda('M132,150 C100,152 50,156 12,158', false, 3.4, vecino));
  // tu cabo: entra desde la derecha por debajo de la gaza del vecino y sube por dentro de ella
  out.push(cuerda('M308,170 C250,170 200,170 182,160 C176,154 178,140 182,128'));
  // parte delantera de la gaza del vecino, por encima de tu cabo
  out.push(cuerda('M132,150 C134,158 186,158 188,150', false, 3.4, vecino));
  // tu gaza encapillada encima
  out.push(cuerda('M182,128 C186,118 136,114 134,120 C132,128 178,132 182,128'));
  out.push(arrow(194, 164, 194, 128, 'r', 'ec', 2.4));
  ['tu gaza:', 'por dentro de', 'la otra, de', 'abajo arriba'].forEach((t, i) => out.push(lbl(204, 104 + i * 14, t, 'r', 'start', 'font-weight="700"')));
  out.push(lbl(14, 140, 'gaza del vecino'));
  out.push(lbl(160, 60, 'noray', 'g', 'middle'));
  out.push(lbl(160, 200, 'Cada barco puede sacar su gaza sin tocar la otra', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Si en el noray ya hay otra gaza, pasa la tuya por dentro de ella, de abajo arriba, y después encapíllala. Así cada barco puede sacar su gaza sin tocar la del vecino; para eso, las gazas tienen que ser holgadas.' };
}

export function caboIllustration(spec = {}) {
  if (spec.vista === 'cornamusa') return caboCornamusa(spec);
  if (spec.vista === 'por-seno') return caboPorSeno(spec);
  if (spec.vista === 'encapillar') return caboEncapillar(spec);
  return caboPartes(spec);
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  cubierta: {
    fn: cubiertaIllustration,
    params: { resaltar: Object.keys(CUBIERTA) },
    ejemplo: { tipo: 'cubierta', resaltar: ['lumbrera', 'manguerote'] },
  },
  estructura: {
    fn: estructuraIllustration,
    params: { vista: ['partes', 'vias-agua'], resaltar: Object.keys(ESTRUCTURA) },
    ejemplo: { tipo: 'estructura', resaltar: ['quilla', 'roda', 'codaste'] },
  },
  timon: {
    fn: timonIllustration,
    params: { vista: ['partes', 'cana', 'tipos'], resaltar: [...Object.keys(TIMON), ...Object.keys(TIPOS)], cana: ['babor', 'estribor'] },
    ejemplo: { tipo: 'timon', vista: 'cana', cana: 'babor' },
  },
  cabo: {
    fn: caboIllustration,
    params: { vista: ['partes', 'cornamusa', 'por-seno', 'encapillar'], resaltar: Object.keys(CABO) },
    ejemplo: { tipo: 'cabo', vista: 'partes' },
  },
};
