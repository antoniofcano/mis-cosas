// Láminas de lección del PER que aún tenían el dibujo antiguo, rehechas en estilo C (cierre del PER,
// docs/ESTILO-LAMINAS.md): casco, amarre, fondeo y maniobra. Mismos tipos, parámetros y `resaltar` que las láminas a las
// que sustituyen (las que antes devolvían null con una parte desconocida lo siguen haciendo); ahora cada parte que se
// puede resaltar lleva su data-parte. Vocabulario y maniobra sin cifras de norma: se dibuja lo del temario (RD 875/2014,
// anexo II) y de la clase, con su fuente en el apéndice de la guía. Solo colores T.*. Sin DOM.
//   cubierta:      { resaltar? }                                                                   (per-1-2)
//   timon:         { vista?: 'partes'|'cana'|'tipos', cana?: 'babor'|'estribor', resaltar? }       (per-1-4)
//   muerto-boya:   { resaltar? } (null con una parte desconocida)                                   (per-2-1)
//   nudos:         { nudo?: 'llano'|'rezon'|'ballestrinque'|'as-de-guia' }                           (per-2-2)
//   tenedero:      { vista?: 'elegir'|'fondos', resaltar? }                                         (per-2-3)
//   fondeo-gira:   { vista?: 'maniobra'|'cadena', resaltar? }                                       (per-2-4)
//   gobierno-rabeo:{ vista?: 'gobierno'|'rabeo', resaltar? } (null con una vista o parte desconocida) (per-7-3)
//   atraque:       { modo?: 'costado'|'punta'|'abarloado'|'boya', helice?, viento? }               (per-7-7)

import { T, TXT, lienzo, rotulo, flecha, referencia, paso, cascoPlanta, pol, f1 } from './estilo-c.js';
import { W, serif, cap, linea, panelNotas, tacha, bien, lista } from './kit-lecciones-c.js';
import { anclaG, cadena, cuerda, recuadro } from './per-cola-c.js';

// ---------------------------------------------------------------------------
// Piezas comunes

/** Partes resaltadas. Con `estricta`, una parte que no es de la lista devuelve null (como la lámina antigua). */
export function marcaC(spec, validas, { estricta = false } = {}) {
  const pedidas = lista(spec.resaltar);
  if (estricta && pedidas.some((k) => !validas.includes(k))) return null;
  const hl = new Set(pedidas.filter((k) => validas.includes(k)));
  const on = (k) => hl.has(k);
  return {
    hl, on, activo: hl.size > 0,
    c: (k, base = T.tinta) => (on(k) ? T.magenta : base),
    w: (k, base = 1.4, fuerte = 2.6) => (on(k) ? fuerte : base),
    g: (k) => `<g data-parte="${k}"${hl.size && !on(k) ? ' opacity=".5"' : ''}>`,
    texto: (cap_, def) => (hl.size ? [...hl].map((k) => cap_[k]).filter(Boolean).join(' ') || def : def),
  };
}
/** Escala un dibujo hecho en otra cuadrícula: abre el grupo y da la posición de un punto en la lámina. */
export const escala = (S, dx = 0, dy = 0) => ({ abre: `<g transform="translate(${f1(dx)} ${f1(dy)}) scale(${S})">`, P: (x, y) => [x * S + dx, y * S + dy] });
/** Rótulo de una parte (serifa, magenta y negrita si está resaltada), con su data-parte. */
export const rotuloParte = (m, k, [x, y], t, o = {}) =>
  `<g data-parte="${k}">${serif(x, y, t, { size: TXT.min, weight: m.on(k) ? 700 : 400, color: m.c(k), ...o })}</g>`;
/** Línea de referencia de un rótulo a su pieza. */
export const guia = (m, k, a, b) => `<g data-parte="${k}">${referencia(a[0], a[1], b[0], b[1], { color: m.c(k) })}</g>`;
export const centrado = (x, y, t, o = {}) => serif(x, y, t, { anchor: 'middle', size: TXT.min, ...o });
/** Casco en planta (proa arriba) centrado en (x, y), girado rot grados. */
export const planta = (x, y, rot, L, B, { relleno = T.casco, discontinuo = false } = {}) =>
  `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})"><path d="${cascoPlanta(L, B)}" fill="${relleno}" stroke="${T.tinta}" stroke-width="1.3" stroke-linejoin="round"${discontinuo ? ' stroke-dasharray="4 3"' : ''}/></g>`;
/** Casco de perfil con cabina; (xb, y) es la proa en la flotación y el casco se extiende hacia +x (o −x con haciaIzquierda). */
export function perfil(xb, y, L, { haciaIzquierda = false } = {}) {
  const s = haciaIzquierda ? ' scale(-1 1)' : '';
  return `<g transform="translate(${f1(xb)} ${f1(y)})${s}"><path d="M0,-${f1(L * 0.2)} L${f1(L)},-${f1(L * 0.17)} L${f1(L - 3)},${f1(L * 0.07)} Q${f1(L * 0.45)},${f1(L * 0.15)} ${f1(L * 0.14)},${f1(L * 0.05)} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<rect x="${f1(L * 0.42)}" y="-${f1(L * 0.31)}" width="${f1(L * 0.3)}" height="${f1(L * 0.12)}" rx="2" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/></g>`;
}
/** Paso numerado resaltable. */
export const numero = (m, k, x, y, n) => `<g data-parte="${k}">${paso(x, y, n, { color: m.on(k) ? T.magenta : T.tinta })}</g>`;
const agua = (x, y, w, h, fondo = T.agua) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fondo}"/>`;
const lineaAgua = (x1, x2, y) => linea(x1, y, x2, y, { color: T.lineaAgua, w: 1.4 });
/** Sustituye el marcador del punteado de tierra por el patrón de su lienzo. */
export function conPunteado(svg) {
  const id = svg.match(/<pattern id="([^"]+)-pt"/)?.[1];
  return svg.replaceAll('__PT__', `url(#${id}-pt)`);
}
const tierraP = (d) => `<path d="${d}" fill="${T.tierra}" stroke="${T.tinta}" stroke-width="1"/><path d="${d}" fill="__PT__" opacity=".5"/>`;

// ===========================================================================
// Cubierta (per-1-2). RD 875/2014, anexo II, PER UT 1.1: bañera e imbornales, escotillas, lumbreras y manguerotes,
// portillos y tragaluces, pasamanos, candeleros y guardamancebos.

export const PARTES_CUBIERTA = ['banera', 'escotilla', 'lumbrera', 'portillo', 'tragaluz', 'manguerote', 'imbornal', 'pasamanos', 'candelero', 'guardamancebos'];
const CAP_CUBIERTA = {
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

export function cubiertaC(spec = {}) {
  const m = marcaC(spec, PARTES_CUBIERTA);
  const S = W / 320;
  const { abre, P } = escala(S, 0, 14 - 30 * S);
  const H = 322;
  const alt = 'Un barco de recreo de costado y desde arriba. De costado: candeleros con los guardamancebos, el pasamanos en el techo de la cabina, un tragaluz, dos portillos redondos, un manguerote en la proa y un imbornal por el que sale al mar el agua de cubierta. Desde arriba: la bañera a popa, la lumbrera acristalada en el techo de la cabina, la escotilla de proa y los guardamancebos alrededor.';
  const { out, cierra } = lienzo(W, H, alt);
  const st = (k, w) => `stroke="${m.c(k)}" stroke-width="${m.on(k) ? w + 1.2 : w}"`;
  const dy = (x) => 86 - (6 * (x - 24)) / 272;
  const o = [abre, agua(0, 112, 320, 36), lineaAgua(0, 320, 112)];
  o.push(`<path d="M24,86 L296,80 Q288,104 262,116 L46,116 Q30,114 26,104 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  o.push(`${m.g('banera')}<path d="M34,${f1(dy(34))} L34,100 L112,100 L112,${f1(dy(112))}" fill="none" ${st('banera', 1)} stroke-dasharray="3 2"/></g>`);
  o.push(`<path d="M118,${f1(dy(118))} L124,72 L206,72 L228,${f1(dy(228))} Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(`${m.g('tragaluz')}<rect x="156" y="75" width="28" height="5" rx="2" fill="${T.agua2}" ${st('tragaluz', 1)}/></g>`);
  o.push(`${m.g('pasamanos')}<path d="M138,67 L196,67 M138,67 L138,72 M157,67 L157,72 M177,67 L177,72 M196,67 L196,72" fill="none" ${st('pasamanos', 1.8)}/></g>`);
  o.push(`${m.g('portillo')}${[250, 266].map((x) => `<circle cx="${x}" cy="${f1(dy(x) + 10)}" r="3.6" fill="${T.agua2}" ${st('portillo', 1.1)}/>`).join('')}</g>`);
  const ym = dy(246) - 12;
  o.push(`${m.g('manguerote')}<g ${st('manguerote', 1.1)}><rect x="244" y="${f1(ym)}" width="5" height="12" fill="${T.casco}"/><path d="M243,${f1(ym)} C243,${f1(ym - 10)} 252,${f1(ym - 12)} 258,${f1(ym - 8)} L256,${f1(ym - 1)} C252,${f1(ym - 4)} 249,${f1(ym - 3)} 249,${f1(ym)} Z" fill="${T.casco}"/></g></g>`);
  o.push(`${m.g('imbornal')}<ellipse cx="124" cy="${f1(dy(124) + 3)}" rx="3.2" ry="1.7" fill="${m.c('imbornal')}"/>${flecha(125, dy(124) + 5, 128, dy(124) + 24, { color: m.c('imbornal', T.azul), w: 1.3, punta: 5 })}</g>`);
  const postes = [34, 70, 110, 150, 190, 230, 266];
  o.push(`${m.g('guardamancebos')}<path d="M${postes.map((x) => `${x},${f1(dy(x) - 26)}`).join(' L')}" fill="none" ${st('guardamancebos', 1.2)}/></g>`);
  o.push(`${m.g('candelero')}${postes.map((x) => `<line x1="${x}" y1="${f1(dy(x))}" x2="${x}" y2="${f1(dy(x) - 26)}" ${st('candelero', 1.5)}/>`).join('')}</g>`);
  // planta (proa a la derecha)
  o.push(`<path d="M30,196 L190,192 C260,194 290,214 298,230 C290,246 260,266 190,268 L30,264 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  o.push(`${m.g('banera')}<rect x="38" y="208" width="74" height="44" rx="6" fill="${T.agua2}" ${st('banera', 1.1)}/></g>`);
  o.push(`<rect x="118" y="205" width="108" height="50" rx="8" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(`${m.g('pasamanos')}<path d="M132,210 L212,210 M132,250 L212,250" fill="none" ${st('pasamanos', 1.8)}/></g>`);
  o.push(`${m.g('lumbrera')}<g ${st('lumbrera', 1.1)}><rect x="180" y="220" width="26" height="20" rx="2" fill="${T.agua2}"/><path d="M193,220 L193,240 M180,230 L206,230" fill="none" stroke-width=".8"/></g></g>`);
  o.push(`${m.g('escotilla')}<rect x="240" y="221" width="18" height="18" rx="2" fill="${T.casco}" ${st('escotilla', 1.6)}/></g>`);
  o.push(`${m.g('manguerote')}<g ${st('manguerote', 1.1)}><circle cx="252" cy="208" r="3.5" fill="${T.casco}"/><path d="M252,204.5 a3.5,3.5 0 0 1 3.5,3.5" fill="none"/></g></g>`);
  const borde = [[40, 199.5], [70, 198.6], [110, 197.6], [150, 196.6], [190, 196], [230, 199], [262, 207], [284, 222]];
  const lado = (s) => borde.map(([x, y]) => [x, s ? y : 460 - y]);
  const gm = [...lado(true), ...lado(false).reverse()];
  o.push(`${m.g('guardamancebos')}<path d="M${gm.map((p) => p.join(',')).join(' L')}" fill="none" ${st('guardamancebos', 1.2)}/></g>`);
  o.push(`${m.g('candelero')}${[...lado(true), ...lado(false)].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${m.on('candelero') ? 2.6 : 1.8}" fill="${m.c('candelero')}"/>`).join('')}</g>`);
  o.push('</g>');
  out.push(o.join(''));
  const R = (k, x, y, t, anchor = 'start') => rotuloParte(m, k, P(x, y), t, { anchor });
  const G = (k, a, b) => guia(m, k, P(...a), P(...b));
  out.push(R('candelero', 12, 44, 'candeleros'), G('candelero', [44, 47], [68, dy(70) - 20]));
  out.push(R('pasamanos', 150, 44, 'pasamanos', 'middle'), G('pasamanos', [150, 47], [156, 66]));
  out.push(R('manguerote', 314, 44, 'manguerote', 'end'), G('manguerote', [280, 47], [256, dy(246) - 22]));
  out.push(R('imbornal', 104, 140, 'imbornal', 'middle'), R('tragaluz', 172, 140, 'tragaluz', 'middle'), G('tragaluz', [170, 130], [170, 81]));
  out.push(R('portillo', 258, 140, 'portillos', 'middle'), G('portillo', [258, 130], [258, 97]));
  out.push(rotulo(...P(12, 178), 'DESDE ARRIBA', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.apagado }));
  out.push(R('banera', 75, 234, 'bañera', 'middle'), R('guardamancebos', 236, 182, 'guardamancebos', 'middle'), G('guardamancebos', [222, 185], [214, 197]));
  out.push(R('lumbrera', 186, 286, 'lumbrera', 'middle'), G('lumbrera', [190, 276], [193, 240]), R('escotilla', 266, 286, 'escotilla', 'middle'), G('escotilla', [258, 276], [250, 239]));
  out.push(cierra());
  return { svg: out.join(''), caption: m.texto(CAP_CUBIERTA, 'Lumbreras: luz y aire. Manguerotes: solo aire. Imbornales: el agua de cubierta sale al mar. Los candeleros sostienen los guardamancebos.') };
}

// ===========================================================================
// Timón (per-1-4). RD 875/2014, anexo II, PER UT 1.4: caña o rueda, mecha, limera, guardines y pala. Los tipos de
// timón (ordinario, compensado, semicompensado, suspendido) son de la clase, no del anexo II.

export const PARTES_TIMON = ['pala', 'mecha', 'limera', 'cana', 'rueda', 'guardines'];
export const TIPOS_TIMON = ['ordinario', 'compensado', 'semicompensado', 'suspendido'];
const CAP_TIMON = {
  pala: 'Pala o azafrán: la superficie que, al girar, desvía el agua y hace caer la proa.',
  mecha: 'Mecha: el eje de la pala, alrededor del cual gira.',
  limera: 'Limera: el orificio del casco por el que entra la mecha; lleva un cierre estanco para que no entre agua.',
  cana: 'Caña: la palanca unida a la cabeza de la mecha.',
  rueda: 'Rueda: el volante de gobierno; mueve la mecha mediante guardines o con un sistema hidráulico.',
  guardines: 'Guardines: los cables o cadenas que llevan el giro de la rueda a la mecha.',
};
const CAP_TIPOS = {
  ordinario: 'Ordinario: toda la pala queda a popa de la mecha.',
  compensado: 'Compensado: una parte de la pala queda a proa de la mecha; el agua ayuda a girarla y cuesta mucho menos esfuerzo.',
  semicompensado: 'Semicompensado: solo la parte baja de la pala está compensada.',
  suspendido: 'Suspendido: la pala cuelga solo de la mecha, sin apoyo por abajo; muy habitual en los veleros modernos.',
};

function timonPartes(spec) {
  const m = marcaC(spec, PARTES_TIMON);
  const S = W / 320;
  const { abre, P } = escala(S, 0, 10 - 28 * S);
  const H = 246;
  const alt = 'La popa de un barco de costado con el timón: la pala o azafrán bajo el agua, la mecha que es su eje, la limera por donde la mecha atraviesa el casco y la caña unida a la cabeza de la mecha. Al lado, el gobierno con rueda: la rueda mueve la mecha con los guardines.';
  const { out, cierra } = lienzo(W, H, alt);
  const st = (k, w) => `stroke="${m.c(k)}" stroke-width="${m.on(k) ? w + 1.2 : w}"`;
  const o = [abre, agua(0, 96, 200, 124), lineaAgua(0, 200, 96)];
  o.push(`<path d="M196,60 L30,60 L34,88 L70,108 L196,114 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  o.push(`${m.g('pala')}<path d="M84,118 L84,186 L46,180 Q38,150 48,120 Z" fill="${T.apagado}" fill-opacity=".55" ${st('pala', 1.1)}/></g>`);
  o.push(`${m.g('mecha')}<line x1="84" y1="44" x2="84" y2="186" ${st('mecha', 2.6)} stroke-linecap="round"/></g>`);
  o.push(`${m.g('limera')}<rect x="78" y="104" width="12" height="9" rx="1.5" fill="${m.c('limera')}" opacity=".85"/></g>`);
  o.push(`${m.g('cana')}<line x1="84" y1="46" x2="164" y2="36" stroke="${m.c('cana', T.apagado)}" stroke-width="${m.on('cana') ? 6.5 : 5}" stroke-linecap="round"/></g>`);
  o.push(`<rect x="206" y="34" width="106" height="186" fill="none" stroke="${T.tinta}" stroke-width=".7"/>`);
  o.push(`${m.g('rueda')}<g stroke="${m.c('rueda')}" stroke-width="${m.on('rueda') ? 3.2 : 2.2}" fill="none"><circle cx="236" cy="84" r="20"/>${[0, 60, 120].map((a) => { const [x1, y1] = pol(236, 84, a, 26); const [x2, y2] = pol(236, 84, a + 180, 26); return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke-width="1.4"/>`; }).join('')}</g><circle cx="236" cy="84" r="3.5" fill="${m.c('rueda')}"/></g>`);
  o.push(`<rect x="233" y="104" width="6" height="58" fill="${T.apagado}"/>`);
  o.push(`${m.g('mecha')}<line x1="292" y1="150" x2="292" y2="212" ${st('mecha', 2.6)}/></g>`, `<path d="M292,166 L274,166 A18,18 0 0 1 292,148 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1"/>`);
  o.push(`${m.g('guardines')}<path d="M236,88 L236,168 L274,168" fill="none" stroke="${m.c('guardines', T.azul)}" stroke-width="${m.on('guardines') ? 2.6 : 1.6}"/><circle cx="236" cy="168" r="3" fill="none" stroke="${T.tinta}"/></g>`);
  o.push('</g>');
  out.push(o.join(''));
  const R = (k, xy, t, anchor = 'start') => rotuloParte(m, k, P(...xy), t, { anchor });
  out.push(R('cana', [168, 44], 'caña'), R('mecha', [98, 154], 'mecha (eje)'), guia(m, 'mecha', P(96, 150), P(86, 142)));
  out.push(R('limera', [104, 92], 'limera'), guia(m, 'limera', P(106, 94), P(91, 106)), R('pala', [62, 210], 'pala o azafrán', 'middle'));
  out.push(centrado(...P(259, 52), 'o con rueda', { weight: 700 }), R('rueda', [262, 76], 'rueda'), R('guardines', [210, 194], 'guardines'), R('mecha', [286, 214], 'mecha', 'end'));
  out.push(serif(...P(190, 76), 'hacia proa', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: m.texto(CAP_TIMON, 'Pala que desvía el agua, mecha que es su eje, limera por donde la mecha atraviesa el casco, y caña o rueda para moverla (de la rueda a la mecha van los guardines).') };
}

function timonCana(spec) {
  const cana = spec.cana === 'estribor' ? 'estribor' : 'babor';
  const cae = cana === 'babor' ? 'estribor' : 'babor';
  const s = cae === 'estribor' ? 1 : -1;
  const m = marcaC(spec, PARTES_TIMON);
  const H = 340;
  const alt = `Dos barcos vistos desde arriba navegando avante. Con caña: la caña a ${cana} lleva la pala a ${cae} y la proa cae a ${cae}, al lado contrario de la caña. Con rueda: se gira la rueda a ${cae} y la proa cae a ${cae}, como el volante de un coche.`;
  const { out, cierra } = lienzo(W, H, alt);
  const panel = (cx, conCana) => {
    const cy = 136;
    const g = [centrado(cx, 30, conCana ? 'Con caña' : 'Con rueda', { weight: 700, size: TXT.rotulo })];
    g.push(planta(cx, cy, 0, 130, 46));
    g.push(serif(cx - 30, cy - 16, 'Br', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }), serif(cx + 30, cy - 16, 'Er', { size: TXT.min, italic: true, color: T.apagado }));
    const [px, py] = [cx, cy + 60];
    const [bx, by] = pol(px, py, 180 - s * 22, 24);
    g.push(`${m.g('pala')}<line x1="${px}" y1="${py}" x2="${f1(bx)}" y2="${f1(by)}" stroke="${m.c('pala')}" stroke-width="5" stroke-linecap="round"/>${serif(bx + s * 6, by + 12, 'pala', { anchor: s > 0 ? 'start' : 'end', size: TXT.min, color: m.c('pala') })}</g>`);
    if (conCana) {
      const [tx, ty] = pol(px, py, -s * 22, 44);
      g.push(`${m.g('cana')}<line x1="${px}" y1="${py}" x2="${f1(tx)}" y2="${f1(ty)}" stroke="${m.c('cana', T.apagado)}" stroke-width="5" stroke-linecap="round"/>${flecha(tx - s * 4, ty, tx - s * 26, ty, { color: T.magenta, w: 2 })}</g>`);
    } else {
      const [wx, wy] = [cx, cy + 28];
      g.push(`${m.g('rueda')}<circle cx="${wx}" cy="${wy}" r="10" fill="${T.papel}" stroke="${m.c('rueda')}" stroke-width="2"/><line x1="${wx - 10}" y1="${wy}" x2="${wx + 10}" y2="${wy}" stroke="${T.tinta}"/><line x1="${wx}" y1="${wy - 10}" x2="${wx}" y2="${wy + 10}" stroke="${T.tinta}"/>` +
        `<path d="M${wx - s * 12},${wy - 14} A17,17 0 0 ${s > 0 ? 1 : 0} ${wx + s * 14},${wy - 10}" fill="none" stroke="${T.magenta}" stroke-width="2"/>${flecha(wx + s * 12, wy - 12, wx + s * 17, wy - 5, { color: T.magenta, w: 2, punta: 7 })}</g>`);
    }
    g.push(`<path d="M${cx},${cy - 72} Q${cx + s * 4},${cy - 86} ${cx + s * 26},${cy - 84}" fill="none" stroke="${T.magenta}" stroke-width="2"/>`, flecha(cx + s * 20, cy - 84, cx + s * 34, cy - 82, { color: T.magenta, w: 2, punta: 8 }));
    g.push(centrado(cx, 252, conCana ? `caña a ${cana}` : `rueda a ${cae}`, { weight: 700, color: T.magenta }), centrado(cx, 270, `pala a ${cae}`), centrado(cx, 288, `proa a ${cae}`, { weight: 700 }));
    return g.join('');
  };
  out.push(panel(92, true), panel(266, false), linea(179, 22, 179, 294, { w: 0.6 }));
  out.push(panelNotas(302, H), centrado(179, 324, 'Caña: la proa cae al lado contrario. Rueda: al mismo.', { italic: true }));
  out.push(cierra());
  return { svg: out.join(''), caption: `Con el barco avanzando: caña a ${cana} → la pala va a ${cae} → la proa cae a ${cae}. La rueda funciona como el volante de un coche: rueda a ${cae} → proa a ${cae}.` };
}

function timonTipos(spec) {
  const m = marcaC(spec, TIPOS_TIMON);
  const H = 330;
  const alt = 'Cuatro timones de costado, con la proa a la derecha y la mecha marcada: ordinario, con toda la pala a popa de la mecha; compensado, con una parte de la pala a proa de la mecha; semicompensado, compensado solo en la parte baja; y suspendido, que cuelga solo de la mecha sin apoyo del casco por abajo.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(14, 22, 'popa', { size: TXT.min, italic: true, color: T.apagado }), serif(344, 22, 'proa', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }));
  out.push(`<rect x="118" y="12" width="12" height="11" fill="${T.azul}" fill-opacity=".45" stroke="${T.tinta}" stroke-width=".6"/>`, serif(136, 22, 'parte compensada', { size: TXT.min }));
  const cells = [['ordinario', 'Ordinario', 'toda la pala a popa'], ['compensado', 'Compensado', 'parte a proa de la mecha'], ['semicompensado', 'Semicompensado', 'compensado solo abajo'], ['suspendido', 'Suspendido', 'sin apoyo por abajo']];
  cells.forEach(([k, nombre, sub], i) => {
    const cx = 92 + (i % 2) * 174;
    const y0 = 40 + Math.floor(i / 2) * 140;
    const [y1, y2, mx] = [y0 + 18, y0 + 84, cx + 6];
    const g = [m.g(k), recuadro(cx - 80, y0 - 6, 160, 132, { on: m.on(k) })];
    g.push(`<rect x="${cx - 48}" y="${y0}" width="96" height="11" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1"/>`);
    const pala = (x1, x2) => `<path d="M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1 + 4},${y2} Q${x1 - 2},${(y1 + y2) / 2} ${x1},${y1} Z" fill="${T.apagado}" fill-opacity=".5" stroke="${T.tinta}" stroke-width="1"/>`;
    const comp = (x1, x2, ya, yb) => `<rect x="${x1}" y="${ya}" width="${x2 - x1}" height="${yb - ya}" fill="${T.azul}" fill-opacity=".45" stroke="${T.tinta}" stroke-width="1"/>`;
    const apoyo = (x) => `<path d="M${x},${y0 + 11} L${x + 8},${y0 + 11} L${x + 8},${y2 + 6} L${mx - 3},${y2 + 6} L${mx - 3},${y2 + 1} L${x},${y2 + 1} Z" fill="${T.tinta}" opacity=".55"/>`;
    if (k === 'ordinario') g.push(pala(cx - 30, mx), apoyo(mx + 3));
    if (k === 'compensado') g.push(pala(cx - 24, mx), comp(mx, mx + 15, y1, y2), apoyo(mx + 19));
    if (k === 'semicompensado') g.push(pala(cx - 26, mx), comp(mx, mx + 15, y1 + 32, y2), `<path d="M${mx + 1},${y0 + 11} L${mx + 19},${y0 + 11} L${mx + 15},${y1 + 30} L${mx + 1},${y1 + 30} Z" fill="${T.tinta}" opacity=".55"/>`);
    if (k === 'suspendido') g.push(pala(cx - 22, mx), comp(mx, mx + 13, y1, y2));
    g.push(`<line x1="${mx}" y1="${y0 - 4}" x2="${mx}" y2="${y2 - 2}" stroke="${m.c(k)}" stroke-width="2.4"/>`);
    g.push(centrado(cx, y0 + 104, nombre, { weight: 700, color: m.c(k) }), centrado(cx, y0 + 120, sub), '</g>');
    out.push(g.join(''));
  });
  out.push(centrado(179, 322, 'Trazo vertical: la mecha. Gris oscuro: apoyos del casco.', { italic: true, color: T.apagado }));
  out.push(cierra());
  return { svg: out.join(''), caption: m.texto(CAP_TIPOS, 'Según dónde quede la pala respecto a la mecha: ordinario (toda a popa), compensado (parte a proa; cuesta menos girarla), semicompensado (solo la parte baja) y suspendido (cuelga solo de la mecha).') };
}

export function timonC(spec = {}) {
  if (spec.vista === 'cana') return timonCana(spec);
  if (spec.vista === 'tipos') return timonTipos(spec);
  return timonPartes(spec);
}

// ===========================================================================
// Amarrado a una boya (per-2-1). RD 875/2014, anexo II, PER UT 2.1: muertos, boyas, chicote, seno, firme y gaza.

export const PARTES_MB = ['muerto', 'cadena', 'boya', 'gaza', 'firme', 'seno', 'chicote'];
const CAP_MB = {
  muerto: 'El muerto es un gran peso de hormigón o de hierro que descansa en el fondo: es el amarre permanente.',
  cadena: 'Del muerto sube una cadena hasta la boya.',
  boya: 'La boya es el flotador sujeto al fondo al que te amarras tú (a ella o a su cabo).',
  gaza: 'La gaza es el lazo u ojo cerrado en el extremo del cabo, hecho con un nudo o con una costura.',
  firme: 'El firme es la parte principal del cabo, la que trabaja o queda sujeta.',
  seno: 'El seno es la curva o arco que forma el cabo cuando lo doblas.',
  chicote: 'El chicote es cada uno de los extremos libres del cabo.',
};

export function muertoBoyaC(spec = {}) {
  const m = marcaC(spec, PARTES_MB, { estricta: true });
  if (!m) return null;
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 30 * S);
  const H = 296;
  const alt = 'Un barco amarrado a una boya, de costado. En el fondo descansa el muerto, un bloque de hormigón o de hierro; de él sube una cadena hasta la boya. Del barco sale un cabo: su firme va tenso desde la cornamusa de proa hasta la gaza, encapillada en la argolla de la boya; el sobrante forma un seno y acaba en el chicote.';
  const { out, cierra } = lienzo(W, H, alt);
  const o = [abre, agua(0, 132, 320, 126), lineaAgua(0, 320, 132), tierraP('M0,258 Q160,252 320,258 L320,300 L0,300 Z')];
  o.push(`<path d="M18,110 L178,104 L160,140 L36,142 L22,132 Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, `<rect x="34" y="94" width="48" height="15" rx="3" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
  o.push(`<rect x="142" y="100" width="20" height="4" rx="2" fill="${T.apagado}" stroke="${T.tinta}" stroke-width="1"/>`);
  o.push(`${m.g('cadena')}${cadena('M252,138 Q266,192 256,240', { color: m.c('cadena'), w: m.on('cadena') ? 4.2 : 3 })}</g>`);
  o.push(`${m.g('muerto')}<rect x="232" y="240" width="48" height="18" rx="2" fill="${m.on('muerto') ? T.magenta : T.apagado}" stroke="${T.tinta}" stroke-width="1.3"/></g>`);
  o.push(`${m.g('boya')}<circle cx="252" cy="107" r="4.2" fill="none" stroke="${T.tinta}" stroke-width="1.8"/><circle cx="252" cy="125" r="14" fill="${T.naranja}" stroke="${m.c('boya')}" stroke-width="${m.on('boya') ? 2.8 : 1.3}"/><rect x="244" y="120" width="16" height="4" fill="${T.papel}" opacity=".85"/></g>`);
  o.push(`${m.g('firme')}${cuerda('M157,102 Q200,112 238,106', { on: m.on('firme'), w: 3.2 })}</g>`);
  o.push(`${m.g('gaza')}${cuerda('M238,106 C244,96 262,98 262,107 C262,116 244,116 238,106', { on: m.on('gaza'), w: 2.8 })}</g>`);
  o.push(`${m.g('seno')}${cuerda('M146,102 C130,102 128,126 116,126 C104,126 102,108 96,106', { on: m.on('seno'), w: 3.2 })}</g>`);
  o.push(`${m.g('chicote')}${cuerda('M98,106.6 L90,105', { on: m.on('chicote'), w: 3.2 })}<circle cx="90" cy="105" r="3.2" fill="${m.c('chicote')}"/></g>`);
  o.push('</g>');
  out.push(o.join(''));
  const R = (k, xy, t, anchor = 'middle') => rotuloParte(m, k, P(...xy), t, { anchor });
  out.push(R('chicote', [84, 88], 'chicote'), centrado(...P(152, 92), 'cornamusa', { italic: true, color: T.apagado }), R('firme', [200, 98], 'firme'), R('gaza', [268, 96], 'gaza', 'start'));
  out.push(R('boya', [272, 140], 'boya', 'start'), guia(m, 'seno', P(116, 130), P(116, 150)), R('seno', [116, 162], 'seno'), R('cadena', [270, 196], 'cadena', 'start'));
  out.push(R('muerto', [226, 238], 'muerto', 'end'), serif(...P(226, 252), 'hormigón o hierro', { anchor: 'end', size: TXT.min, italic: true }), serif(...P(12, 275), 'fondo', { size: TXT.min, italic: true }));
  out.push(serif(...P(12, 190), 'Sin muelle, te amarras a la boya;', { size: TXT.min }), serif(...P(12, 205), 'el muerto la sujeta al fondo.', { size: TXT.min }));
  out.push(cierra());
  return { svg: conPunteado(out.join('')), caption: m.activo ? [...m.hl].map((p) => CAP_MB[p]).join(' ') : 'Amarrado a una boya: el muerto descansa en el fondo, de él sube una cadena hasta la boya y a la boya te amarras tú. En el cabo, la gaza es el ojo del extremo, el firme la parte que trabaja, el seno la curva que forma al doblarlo y el chicote el extremo libre.' };
}

// ===========================================================================
// Nudos (per-2-2). RD 875/2014, anexo II, PER UT 2.2: para qué se emplean el llano, la vuelta de rezón, el
// ballestrinque y el as de guía. Cada cabo es una curva por puntos [x, y, z]; z dice qué va por encima en los cruces.

function muestrear(Pt) {
  const out = [];
  for (let i = 0; i < Pt.length - 1; i++) {
    const p0 = Pt[i - 1] ?? Pt[i];
    const [p1, p2] = [Pt[i], Pt[i + 1]];
    const p3 = Pt[i + 2] ?? Pt[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 1.5));
    for (let s = 0; s < n; s++) {
      const t = s / n;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), (p1[2] ?? 0) + ((p2[2] ?? 0) - (p1[2] ?? 0)) * t]);
    }
  }
  const u = Pt[Pt.length - 1];
  out.push([u[0], u[1], u[2] ?? 0]);
  return out;
}
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
        tramos.push({ z: Math.round(s[ini][2]), ci, i: ini, d: `M${seg.map((q) => `${f1(q[0])},${f1(q[1])}`).join(' L')}${cierra ? 'Z' : ''}`, col: c.col, w, sinFin: c.sinFin });
        ini = i;
      }
    }
    if (!c.cerrado && !c.sinFin) for (const q of [s[0], s[s.length - 1]]) finales.push({ q, col: c.col, w });
  });
  tramos.sort((a, b) => a.z - b.z || a.ci - b.ci || a.i - b.i);
  const o = tramos.map((t) => `<path d="${t.d}" fill="none" stroke="${T.tinta}" stroke-width="${f1(t.w + 2.6)}" stroke-linejoin="round"/><path d="${t.d}" fill="none" stroke="${t.col}" stroke-width="${t.w}" stroke-linejoin="round" stroke-linecap="${t.sinFin ? 'butt' : 'square'}"/>`);
  for (const { q, col, w } of finales) o.push(`<circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(w / 2 + 1.3)}" fill="${T.tinta}"/><circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(w / 2)}" fill="${col}"/>`);
  return o.join('');
}
const aro = (cx, cy, r, zs = {}) => Array.from({ length: 36 }, (_, i) => { const a = (i * 10 * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a), zs[i * 10] ?? 0]; });
const C1 = T.amarillo;
const C2 = T.azul;
/** Dibujos en una caja local de 140 × 110. */
const NUDOS = {
  llano: {
    nombre: 'Nudo llano', uso: 'unir dos cabos',
    dibujo: () => trenzar([
      { col: C1, p: [[2, 36], [40, 36], [80, 36], [98, 42], [102, 52], [98, 62], [80, 68], [46, 68, 1], [30, 68], [2, 68]] },
      { col: C2, p: [[138, 44], [100, 44, 1], [62, 44], [44, 50], [40, 60], [44, 70], [62, 76], [100, 76], [138, 76]] },
    ]),
    etiquetas: [[6, 28, 'cabo 1', 'start'], [134, 94, 'cabo 2', 'end']],
    texto: 'Une dos cabos por sus chicotes, de la misma mena y material. Con tensión aguanta y sin ella se deshace fácil. También se llama nudo de rizo.',
  },
  rezon: {
    nombre: 'Vuelta de rezón', uso: 'a una argolla',
    dibujo: () => trenzar([
      { col: T.casco, w: 6, cerrado: true, p: aro(70, 30, 21) },
      { col: C1, w: 6, p: [[52, 110], [54, 90], [56, 74, -1], [56, 62], [57, 52, -2], [58, 40, -2], [62, 33], [66, 40], [67, 52, 2], [67, 62], [71, 60], [73, 52, -2], [74, 40, -2], [78, 33], [82, 40], [82, 52, 2], [80, 64], [72, 70], [56, 72, 1], [42, 76], [42, 86], [56, 90, -1], [70, 88], [84, 96], [96, 104]] },
    ]),
    etiquetas: [[96, 14, 'argolla', 'start'], [92, 50, 'dos vueltas', 'start'], [100, 98, 'remate', 'start']],
    texto: 'Se dan vueltas a la argolla y se remata con el chicote para que no se suelte. Muy segura y no se afloja con los tirones: para una defensa colgada mucho tiempo.',
  },
  ballestrinque: {
    nombre: 'Ballestrinque', uso: 'a un palo, rápido',
    dibujo: () => trenzar([
      { col: T.casco, w: 22, sinFin: true, p: [[70, 0], [70, 110]] },
      { col: C1, p: [[2, 60], [36, 58], [58, 56, 1], [70, 55, 1], [80, 53, 1], [86, 49], [80, 43, -1], [70, 41, -1], [60, 39, -1], [55, 36], [60, 33, 1], [64, 40, 2], [70, 54, 2], [76, 68, 2], [80, 76, 1], [85, 81], [80, 86, -1], [70, 86, -1], [60, 85, -1], [55, 79], [60, 72, 1], [70, 70, 1], [82, 68, 1], [100, 66], [138, 64]] },
    ]),
    etiquetas: [[6, 50, 'firme', 'start'], [134, 56, 'chicote', 'end'], [84, 104, 'palo o candelero', 'start']],
    texto: 'Dos vueltas cruzadas alrededor de un palo, candelero o barandilla. Se hace muy rápido, pero con tirones laterales o intermitentes puede correrse: para una defensa por poco tiempo.',
  },
  'as-de-guia': {
    nombre: 'As de guía', uso: 'gaza fija',
    dibujo: () => trenzar([
      { col: C1, w: 5.5, p: [[70, 0], [70, 12], [70, 30, -1], [78, 40], [84, 52], [76, 64], [62, 64], [55, 52], [60, 39], [70, 30, 1], [82, 22], [96, 26], [104, 42], [108, 66], [102, 92], [78, 108], [50, 104], [34, 86], [36, 70], [48, 64], [57, 61, -1], [62, 50], [64, 36, 1], [60, 24], [70, 14, -2], [82, 13], [86, 20], [80, 30, 2], [76, 40, 2], [74, 52], [72, 64, -1], [73, 82]] },
    ]),
    etiquetas: [[76, 6, 'firme', 'start'], [100, 116, 'gaza fija', 'start'], [80, 88, 'chicote', 'start']],
    texto: 'Forma una gaza fija que ni corre ni se aprieta y luego se deshace con facilidad: para encapillar una amarra en un noray, afirmar escotas o rodear a una persona por el pecho.',
  },
};
export const NUDOS_PER = Object.keys(NUDOS);

export function nudosC(spec = {}) {
  const n = NUDOS[spec.nudo];
  if (n) {
    const H = 262;
    const alt = `${n.nombre}, dibujado con sus cruces: ${n.texto}`;
    const { out, cierra } = lienzo(W, H, alt);
    const s = 1.85;
    const [ox, oy] = [179 - 70 * s, 14];
    out.push(`<g data-parte="${spec.nudo}" transform="translate(${f1(ox)} ${oy}) scale(${s})">${n.dibujo()}</g>`);
    for (const [x, y, t, a] of n.etiquetas) out.push(serif(ox + x * s, oy + y * s, t, { anchor: a, size: TXT.min, weight: 700 }));
    out.push(panelNotas(232, H), centrado(179, 252, `${n.nombre}: ${n.uso}.`, { italic: true }));
    out.push(cierra());
    return { svg: out.join(''), caption: n.texto };
  }
  const H = 306;
  const alt = 'Los cuatro nudos del PER con su uso: nudo llano, para unir dos cabos; vuelta de rezón, para amarrar a una argolla; ballestrinque, para amarrar rápido a un palo o candelero; y as de guía, para hacer una gaza fija.';
  const { out, cierra } = lienzo(W, H, alt);
  Object.entries(NUDOS).forEach(([k, nd], i) => {
    const cx = i % 2 ? 266 : 92;
    const y0 = 14 + Math.floor(i / 2) * 146;
    const s = 0.92;
    out.push(`<g data-parte="${k}"><g transform="translate(${f1(cx - 70 * s)} ${y0}) scale(${s})">${nd.dibujo()}</g>${centrado(cx, y0 + 116, nd.nombre, { weight: 700, size: TXT.rotulo })}${centrado(cx, y0 + 132, nd.uso)}</g>`);
  });
  out.push(linea(179, 14, 179, 292, { w: 0.6 }), linea(14, 154, 344, 154, { w: 0.6 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Unir dos cabos iguales: llano. A una argolla: vuelta de rezón. A un palo o candelero, rápido: ballestrinque. Una gaza fija: as de guía.' };
}

// ===========================================================================
// Tenedero (per-2-3). RD 875/2014, anexo II, PER UT 2.3: elección del lugar de fondeo y del tenedero.

export const FACTORES_TENEDERO = ['abrigo', 'profundidad', 'fondo', 'corriente', 'espacio', 'informacion'];
export const FONDOS_TENEDERO = ['arena', 'fango-duro', 'arcilla', 'cascajo', 'fango-blando', 'algas', 'piedra'];

function tenederoElegir(spec) {
  const m = marcaC(spec, FACTORES_TENEDERO);
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 30 * S);
  const H = 318;
  const alt = 'Una cala vista desde arriba con un barco fondeado y los seis factores numerados: 1, abrigo del viento, que aquí sopla de tierra; 2, profundidad, con las sondas; 3, el tipo de fondo, arena; 4, la corriente; 5, espacio para bornear, el círculo alrededor del ancla; 6, la información de la carta y el derrotero, como un cable submarino.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const o = [`<clipPath id="${id}-cala"><rect x="10" y="32" width="300" height="158"/></clipPath>`, abre, `<g clip-path="url(#${id}-cala)">`, agua(10, 32, 300, 158)];
  o.push(tierraP('M0,0 L330,0 L330,200 L276,200 Q254,160 266,118 Q248,74 196,64 Q160,56 126,66 Q78,80 62,118 Q74,160 50,200 L0,200 Z'));
  o.push(`${m.g('informacion')}<path d="M300,112 Q286,150 298,196" fill="none" stroke="${m.c('informacion')}" stroke-width="${m.on('informacion') ? 2.2 : 1.3}" stroke-dasharray="7 3 2 3"/></g>`, '</g>');
  o.push(`<rect x="10" y="32" width="300" height="158" fill="none" stroke="${T.tinta}" stroke-width=".8"/>`);
  o.push(`${m.g('abrigo')}${flecha(92, 38, 97, 74, { color: m.c('abrigo', T.apagado), w: 1.8 })}${flecha(228, 38, 223, 72, { color: m.c('abrigo', T.apagado), w: 1.8 })}</g>`);
  const [ax, ay, Rb] = [160, 110, 42];
  o.push(`${m.g('espacio')}<circle cx="${ax}" cy="${ay}" r="${Rb}" fill="none" stroke="${m.c('espacio', T.azul)}" stroke-width="${m.on('espacio') ? 2.4 : 1.5}" stroke-dasharray="6 4"/></g>`);
  o.push(cadena(`M${ax},${ay + 2} L${ax},${ay + 18}`, { w: 2 }), anclaG(ax, ay - 4, 0.55), planta(ax, ay + 30, 0, 24, 9));
  o.push(`${m.g('corriente')}${flecha(70, 182, 120, 172, { color: m.c('corriente', T.azul), w: m.on('corriente') ? 2.4 : 1.8 })}</g>`);
  o.push('</g>');
  out.push(o.join(''));
  const sonda = (x, y, t) => `<g data-parte="profundidad">${serif(...P(x, y), t, { anchor: 'middle', size: TXT.min, italic: true, color: m.c('profundidad') })}</g>`;
  out.push(sonda(106, 98, '3'), sonda(214, 98, '4'), sonda(118, 150, '5'), sonda(206, 154, '6'));
  out.push(rotuloParte(m, 'abrigo', P(160, 46), 'viento de tierra', { anchor: 'middle' }), rotuloParte(m, 'fondo', P(160, 178), 'arena', { anchor: 'middle', weight: 700 }), rotuloParte(m, 'informacion', P(280, 178), 'cable', { anchor: 'end' }));
  const nums = [['abrigo', 160, 62], ['profundidad', 232, 102], ['fondo', 128, 174], ['corriente', 58, 178], ['espacio', 208, 128], ['informacion', 286, 150]];
  nums.forEach(([k, x, y], i) => out.push(numero(m, k, ...P(x, y), i + 1)));
  const FT = [['Abrigo', 'viento y mar; ¿y si rola?'], ['Profundidad', 'tu calado, en bajamar'], ['Tipo de fondo', 'el tenedero'], ['Corrientes', 'las de la zona'], ['Espacio', 'entrar, salir y bornear'], ['Carta y derrotero', 'prohibido, cables, canales']];
  FACTORES_TENEDERO.forEach((k, i) => {
    const x = i % 2 ? 186 : 14;
    const y = 232 + Math.floor(i / 2) * 30;
    out.push(`<g data-parte="${k}">${paso(x + 9, y - 4, i + 1, { color: m.on(k) ? T.magenta : T.tinta })}${serif(x + 24, y - 2, FT[i][0], { weight: 700, color: m.c(k) })}${serif(x + 24, y + 13, FT[i][1], { size: TXT.min })}</g>`);
  });
  out.push(cierra());
  return { svg: conPunteado(out.join('')), caption: 'Nunca se decide por un solo factor: abrigo del viento y de la mar (también si rola), agua suficiente para tu calado incluso en bajamar, buen tenedero, corrientes, espacio para entrar, salir y bornear, y lo que digan la carta y el derrotero.' };
}

/** Corte del fondo (92 × 40, (cx, y0) arriba en el centro) con el ancla como trabaja en él. */
function corteFondo(id, k, cx, y0) {
  const x0 = cx - 46;
  const yf = y0 + 18;
  const o = [`<clipPath id="${id}-${k}"><rect x="${x0}" y="${y0}" width="92" height="40"/></clipPath>`, `<g clip-path="url(#${id}-${k})">`, agua(x0, y0, 92, 40)];
  const lecho = (op = 1) => `<rect x="${x0}" y="${yf}" width="92" height="22" fill="${T.tierra}" opacity="${op}"/>`;
  const filo = linea(x0, yf, x0 + 92, yf, { w: 1.2 });
  const chain = (ex, ey) => cadena(`M${f1(x0 - 2)},${f1(y0 + 4)} Q${f1(ex - 14)},${f1(ey - 2)} ${f1(ex)},${f1(ey)}`, { w: 1.8 });
  const puntos = (n, r, d0) => Array.from({ length: n }, (_, i) => `<circle cx="${f1(x0 + 6 + ((i * 37) % 86))}" cy="${f1(yf + d0 + ((i * 7) % 15))}" r="${r}" fill="${T.tinta}" opacity=".5"/>`).join('');
  if (k === 'arena' || k === 'fango-duro') {
    o.push(lecho(), k === 'arena' ? puntos(14, 0.9, 4) : `<path d="M${x0},${yf + 8} h92 M${x0},${yf + 15} h92" stroke="${T.tinta}" opacity=".3"/>`);
    o.push(chain(cx - 4, yf - 2), anclaG(cx - 4, yf - 2, 0.75, -62), lecho(0.6), filo);
  } else if (k === 'arcilla') {
    o.push(lecho(), `<path d="M${x0},${yf + 7} h92 M${x0},${yf + 13} h92" stroke="${T.tinta}" opacity=".3"/>`, filo, chain(cx - 12, yf - 4), anclaG(cx - 12, yf - 4, 0.75, -66));
    o.push(`<ellipse cx="${cx + 1}" cy="${yf - 3}" rx="6" ry="3.5" fill="${T.tierra}" stroke="${T.tinta}"/>`, flecha(cx + 12, yf - 8, cx + 36, yf - 8, { color: T.apagado, w: 1.4, punta: 6 }));
  } else if (k === 'cascajo') {
    o.push(lecho(), filo, Array.from({ length: 12 }, (_, i) => `<circle cx="${x0 + 4 + i * 8}" cy="${f1(yf - 1.5 + (i % 3))}" r="${2.2 + (i % 2)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width=".7"/>`).join(''));
    o.push(chain(cx - 6, yf - 9), anclaG(cx - 6, yf - 9, 0.75, -80));
  } else if (k === 'fango-blando') {
    o.push(lecho(0.55), chain(cx - 4, yf + 4), anclaG(cx - 4, yf + 4, 0.75, -20), lecho(0.5));
    o.push(`<path d="M${x0},${yf} q11,-2 23,0 t23,0 t23,0 t23,0" fill="none" stroke="${T.tinta}" stroke-width="1.2"/>`, flecha(cx + 24, yf + 1, cx + 24, yf + 19, { color: T.apagado, w: 1.4, punta: 6 }));
  } else if (k === 'algas') {
    o.push(lecho(), filo);
    for (let i = 0; i < 10; i++) o.push(`<path d="M${f1(x0 + 5 + i * 9.4)},${yf} q-3,-3 0,-6 t0,-6" fill="none" stroke="${T.verde}" stroke-width="1.6"/>`);
    o.push(chain(cx - 6, yf - 14), anclaG(cx - 6, yf - 14, 0.75, -80));
  } else if (k === 'piedra') {
    o.push(lecho(), `<path d="M${x0},${yf + 1} q8,-12 18,-3 q6,-10 16,-2 q10,-12 20,-1 q6,-9 16,-1 q8,-10 22,1 L${x0 + 92},${yf + 22} L${x0},${yf + 22}Z" fill="${T.casco}" stroke="${T.tinta}"/>`);
    o.push(chain(cx - 10, yf - 10), anclaG(cx - 10, yf - 10, 0.75, -50));
  }
  o.push('</g>', `<rect x="${x0}" y="${y0}" width="92" height="40" fill="none" stroke="${T.tinta}" stroke-width=".8"/>`);
  return o.join('');
}

function tenederoFondos(spec) {
  const m = marcaC(spec, FONDOS_TENEDERO);
  const H = 316;
  const alt = 'Siete fondos en corte, con el ancla trabajando en cada uno, en tres filas. Buenos: arena compacta y fango duro, donde el ancla se entierra y agarra. Regulares: arcilla, dura, en la que resbala y se pega a las uñas, y cascajo, en el que se clava mal. Malos: fango blando, donde se hunde sin resistencia; algas, que no la dejan llegar al fondo; y piedra, donde no se clava y puede enrocarse.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const filas = [
    ['Buenos', 'el ancla se entierra y agarra', 'bien', [['arena', 'arena compacta', 'se entierra'], ['fango-duro', 'fango duro', 'se entierra']]],
    ['Regulares', 'agarra peor', null, [['arcilla', 'arcilla', 'resbala, se pega'], ['cascajo', 'cascajo', 'se clava mal']]],
    ['Malos', 'no agarra', 'mal', [['fango-blando', 'fango blando', 'se hunde'], ['algas', 'algas', 'no llega al fondo'], ['piedra', 'piedra', 'puede enrocarse']]],
  ];
  filas.forEach(([cab, nota, icono, celdas], i) => {
    const y = 26 + i * 98;
    if (icono === 'bien') out.push(bien(22, y - 4, 6));
    else if (icono === 'mal') out.push(tacha(22, y - 4, 5));
    else out.push(linea(15, y - 4, 29, y - 4, { w: 2.4, color: T.apagado }));
    out.push(serif(36, y, cab, { weight: 700, size: TXT.rotulo }), serif(36 + cab.length * 7.6, y, `· ${nota}`, { size: TXT.min, italic: true }));
    const xs = celdas.length === 2 ? [110, 248] : [64, 179, 294];
    celdas.forEach(([k, nombre, que], j) => {
      const cx = xs[j];
      out.push(`<g data-parte="${k}">${corteFondo(id, k, cx, y + 10)}${m.on(k) ? recuadro(cx - 54, y + 6, 108, 86, { on: true }) : ''}${centrado(cx, y + 68, nombre, { weight: 700, color: m.c(k) })}${centrado(cx, y + 84, que)}</g>`);
    });
  });
  out.push(cierra());
  return { svg: out.join(''), caption: 'Buenos: arena compacta y fango duro. Regulares: arcilla (dura, resbala y se pega a las uñas) y cascajo. Malos: fango blando, algas y piedra. Ojo al adjetivo: fango duro es de los mejores y fango blando de los peores.' };
}

export function tenederoC(spec = {}) {
  return spec.vista === 'fondos' ? tenederoFondos(spec) : tenederoElegir(spec);
}

// ===========================================================================
// Fondeo a la gira (per-2-4). RD 875/2014, anexo II, PER UT 1.3 (molinete: barbotén, embrague y freno; a la pendura,
// filar) y 2.3 (fondeo a la gira con un ancla: maniobra, longitud del fondeo).

export const PASOS_FONDEO = ['pendura', 'freno', 'proa', 'fondo', 'filar', 'agarra'];

function fondeoManiobra(spec) {
  const m = marcaC(spec, PASOS_FONDEO);
  const H = 342;
  const alt = 'Seis viñetas de la maniobra de fondeo a la gira: 1, el ancla a la pendura, colgando lista; 2, en el molinete, freno puesto y embrague fuera; 3, llegar despacio proa al viento; 4, con el barco parado, «¡fondo!», y el freno dosifica la cadena; 5, el barco cae atrás y se fila cadena para que se tienda; 6, se hace firme y, dando atrás suave, se comprueba que agarra.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const pasos = [['pendura', 'Ancla a la pendura', 'carta y parte vistos'], ['freno', 'Freno puesto', 'y desembragado'], ['proa', 'Proa al viento', 'despacio, con la sonda'], ['fondo', '«¡Fondo!»', 'el freno dosifica'], ['filar', 'Cae atrás: filar', 'la cadena se tiende'], ['agarra', 'Firme y comprobar', 'atrás suave: ¿agarra?']];
  const S = 1.1;
  pasos.forEach(([k, t, nota], i) => {
    const x0 = i % 2 ? 182 : 12;
    const y0 = 12 + Math.floor(i / 2) * 110;
    const g = [m.g(k), recuadro(x0, y0, 164, 104, { on: m.on(k) })];
    const L = (x, y) => [x0 + x * S, y0 + y * S];
    const esc = [`<clipPath id="${id}-fm${i}"><rect x="1" y="1" width="146" height="56"/></clipPath>`, `<g transform="translate(${x0} ${y0}) scale(${S})"><g clip-path="url(#${id}-fm${i})">`];
    const [ys, yb] = [30, 54];
    const textos = [];
    if (k !== 'freno' && k !== 'proa') esc.push(agua(0, ys, 148, yb - ys), `<rect x="0" y="${yb}" width="148" height="10" fill="${T.tierra}"/>`, lineaAgua(0, 148, ys));
    if (k === 'pendura') { esc.push(perfil(50, ys, 64), cadena(`M52,${ys - 9} L46,${ys - 1}`, { w: 1.8 }), anclaG(46, ys - 1, 0.55)); }
    else if (k === 'freno') {
      const [mx, my] = [74, 30];
      esc.push(linea(mx - 52, my, mx + 40, my, { w: 3 }), `<rect x="${mx - 12}" y="${my - 16}" width="24" height="32" rx="3" fill="${T.casco}" stroke="${T.tinta}"/>`);
      for (let yy = my - 12; yy < my + 14; yy += 6) esc.push(`<rect x="${mx - 4}" y="${yy}" width="8" height="3" fill="${T.tinta}"/>`);
      esc.push(`<path d="M${mx - 9},${my - 16} Q${mx},${my - 22} ${mx + 9},${my - 16}" fill="none" stroke="${T.magenta}" stroke-width="3"/>`, `<rect x="${mx - 30}" y="${my - 8}" width="9" height="16" rx="2" fill="${T.casco}" stroke="${T.tinta}" stroke-dasharray="2 2"/>`, `<rect x="${mx + 22}" y="${my - 12}" width="24" height="24" rx="3" fill="${T.casco}" stroke="${T.tinta}"/>`);
      textos.push(serif(...L(mx + 14, 12), 'freno', { size: TXT.min, weight: 700, color: T.magenta }), serif(...L(4, 58), 'embrague fuera', { size: TXT.min, italic: true }));
    } else if (k === 'proa') {
      esc.push(agua(0, 0, 148, 60), planta(92, 34, 0, 34, 12), flecha(92, 2, 92, 13, { color: T.apagado, w: 1.6, punta: 6 }), flecha(112, 2, 112, 13, { color: T.apagado, w: 1.6, punta: 6 }));
      textos.push(serif(...L(72, 18), 'viento', { anchor: 'end', size: TXT.min, italic: true }), serif(...L(72, 44), 'muy poca', { anchor: 'end', size: TXT.min }), serif(...L(72, 56), 'arrancada', { anchor: 'end', size: TXT.min }));
    } else if (k === 'fondo') { esc.push(perfil(50, ys, 64), cadena(`M52,${ys - 9} L44,${yb - 18}`, { w: 1.8 }), anclaG(44, yb - 18, 0.55), flecha(30, ys + 2, 30, ys + 17, { color: T.apagado, w: 1.4, punta: 5 })); }
    else if (k === 'filar') { esc.push(perfil(74, ys, 60), cadena(`M76,${ys - 8} Q50,${yb - 2} 30,${yb - 1} L18,${yb - 1}`, { w: 1.8 }), anclaG(18, yb - 2, 0.5, 90), flecha(108, ys - 14, 140, ys - 14, { color: T.apagado, w: 1.4, punta: 6 })); }
    else if (k === 'agarra') { esc.push(perfil(78, ys, 60), cadena(`M80,${ys - 8} Q56,${yb - 6} 30,${yb - 1} L18,${yb - 1}`, { w: 2.4 }), anclaG(18, yb - 2, 0.5, 90), flecha(134, ys + 6, 146, ys + 6, { color: T.apagado, w: 1.4, punta: 5 })); }
    esc.push('</g></g>');
    g.push(...esc, ...textos);
    g.push(paso(x0 + 14, y0 + 78, i + 1, { color: m.on(k) ? T.magenta : T.tinta }), serif(x0 + 28, y0 + 80, t, { weight: 700, color: m.c(k), size: TXT.min }), serif(x0 + 28, y0 + 96, nota, { size: TXT.min, italic: true }), '</g>');
    out.push(g.join(''));
  });
  out.push(cierra());
  return { svg: out.join(''), caption: 'Ancla a la pendura; en el molinete, freno puesto y desembragado; llegas despacio proa al viento o a la corriente; con el barco parado, «¡fondo!» y dosificas con el freno; filas mientras el barco cae atrás para que la cadena se tienda; haces firme y compruebas que agarra.' };
}

function fondeoCadena() {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 8 - 30 * S);
  const H = 322;
  const alt = 'Arriba, un barco fondeado de costado con la cadena tendida por el fondo y la profundidad d marcada. En medio, dos barras: con buen tiempo, unas 3 veces la profundidad; con mal tiempo, 5 veces o más; con cabo en lugar de cadena, más. Abajo, el barco da atrás suave: la cadena se tensa y el barco se queda quieto, señal de que el ancla agarra.';
  const { out, id, cierra } = lienzo(W, H, alt);
  const [ys, yb] = [56, 94];
  const o = [`<clipPath id="${id}-alto"><rect x="8" y="30" width="304" height="82"/></clipPath>`, abre, `<g clip-path="url(#${id}-alto)">`, agua(8, ys, 304, yb - ys), tierraP(`M0,${yb} L320,${yb} L320,${yb + 18} L0,${yb + 18}Z`), '</g>', lineaAgua(8, 312, ys)];
  o.push(perfil(214, ys, 76), cadena(`M216,${ys - 11} Q186,${yb - 4} 140,${yb - 1.5} L76,${yb - 1.5}`), anclaG(74, yb - 2, 0.75, 90));
  o.push(`<path d="M26,${ys} h8 M26,${yb} h8 M30,${ys} V${yb}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  const [ys2, yb2] = [230, 258];
  o.push(`<clipPath id="${id}-bajo"><rect x="8" y="204" width="304" height="62"/></clipPath>`, `<g clip-path="url(#${id}-bajo)">`, agua(8, ys2, 304, yb2 - ys2), tierraP(`M0,${yb2} L320,${yb2} L320,280 L0,280Z`), '</g>', lineaAgua(8, 312, ys2));
  o.push(perfil(196, ys2, 72), `<path d="M198,${ys2 - 10} Q160,${yb2 - 8} 100,${yb2 - 1.5} L76,${yb2 - 1.5}" fill="none" stroke="${T.tinta}" stroke-width="2.8"/>`, anclaG(74, yb2 - 2, 0.75, 90), flecha(272, ys2 - 6, 304, ys2 - 6, { color: T.magenta, w: 1.8 }));
  o.push('</g>');
  out.push(o.join(''));
  out.push(serif(...P(38, 82), 'd', { weight: 700, size: TXT.rotulo }), centrado(...P(150, 108), 'cadena tendida en el fondo', { italic: true }));
  const u = 24;
  const x0 = 124;
  const barra = (y, n, col) => Array.from({ length: n }, (_, i) => `<rect x="${x0 + i * u}" y="${y - 10}" width="${u - 3}" height="11" fill="${col}" stroke="${T.tinta}" stroke-width=".8"/>`).join('');
  out.push(serif(14, 140, 'Buen tiempo', { weight: 700 }), barra(140, 3, T.agua2), mono(x0 + 3 * u + 8, 140, '3 × d'));
  out.push(serif(14, 162, 'Mal tiempo', { weight: 700 }), barra(162, 5, T.amarillo), mono(x0 + 5 * u + 8, 162, '5 × d o más'));
  out.push(serif(14, 182, 'd: la sonda, contando la marea. Con cabo, más.', { size: TXT.min, italic: true }));
  out.push(serif(...P(12, 200), '¿Agarra? Atrás suave', { weight: 700 }), serif(...P(14, 246), 'cadena tensa', { size: TXT.min, weight: 700 }));
  out.push(centrado(179, 310, 'Tensa y barco quieto: agarra. Toma referencias.', { italic: true }));
  out.push(cierra());
  return { svg: conPunteado(out.join('')), caption: 'Regla práctica, no norma: unas 3 veces la profundidad con buen tiempo y 5 o más con mal tiempo, para que la cadena quede tendida y el tiro llegue horizontal. Para comprobar que agarra, atrás suave: si la cadena se tensa y el barco se queda quieto, ha agarrado; toma referencias en tierra o pon la alarma de fondeo.' };
}
const mono = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'mono', weight: 600, anchor: 'start', ...o });

export function fondeoGiraC(spec = {}) {
  return spec.vista === 'cadena' ? fondeoCadena() : fondeoManiobra(spec);
}

// ===========================================================================
// Velocidad de gobierno, arrancada y rabeo (per-7-3). RD 875/2014, anexo II, PER UT 7.2.

function gobiernoC(m) {
  const S = W / 320;
  const { abre, P } = escala(S, 0, 10 - 34 * S);
  const H = 262;
  const alt = 'Gráfica de la velocidad respecto al agua frente al tiempo. Con la máquina avante la velocidad es constante; al parar la máquina el barco sigue por inercia, la arrancada, y la velocidad va cayendo. Una línea discontinua marca la velocidad de gobierno: por debajo, en la franja rayada, el barco no obedece al timón; al final queda parado y sin arrancada.';
  const { out, ray, cierra } = lienzo(W, H, alt);
  const [x0, y0, x1, yTop] = [40, 196, 304, 52];
  const [v0, vg, xp] = [108, 40, 92];
  const yv = (x) => (x <= xp ? y0 - v0 : y0 - v0 * Math.exp(-(x - xp) / 46));
  const xg = xp + 46 * Math.log(v0 / vg);
  const o = [abre];
  o.push(`${m.g('gobierno')}<rect x="${x0}" y="${y0 - vg}" width="${x1 - x0}" height="${vg}" fill="${ray}" opacity="${m.on('gobierno') ? 0.6 : 0.35}"/>${linea(x0, y0 - vg, x1, y0 - vg, { color: m.c('gobierno'), w: m.on('gobierno') ? 2.4 : 1.4, extra: 'stroke-dasharray="6 4"' })}</g>`);
  o.push(flecha(x0, y0, x0, yTop - 8, { color: T.apagado, w: 1.2, punta: 7 }), flecha(x0, y0, x1 + 8, y0, { color: T.apagado, w: 1.2, punta: 7 }));
  const ptsC = [];
  for (let x = x0; x <= 264; x += 2) ptsC.push(`${f1(x)},${f1(yv(x))}`);
  o.push(`${m.g('arrancada')}<polyline points="${ptsC.join(' ')} ${x1},${y0 - 0.5}" fill="none" stroke="${m.c('arrancada', T.azul)}" stroke-width="${m.on('arrancada') ? 3 : 2.2}" stroke-linejoin="round"/></g>`);
  o.push(linea(xp, y0, xp, y0 - v0 - 14, { color: T.apagado, w: 1, extra: 'stroke-dasharray="3 3"' }), `<circle cx="${f1(xg)}" cy="${y0 - vg}" r="4" fill="${T.magenta}" stroke="${T.papel}"/>`, '</g>');
  out.push(o.join(''));
  out.push(serif(...P(x0 + 6, yTop - 2), 'velocidad respecto al agua', { size: TXT.min, italic: true, color: T.apagado }), serif(...P(x1, y0 + 16), 'tiempo', { anchor: 'end', size: TXT.min, italic: true, color: T.apagado }));
  out.push(rotuloParte(m, 'gobierno', P(x0 + 6, y0 - 22), 'no obedece', { weight: 700 }), rotuloParte(m, 'gobierno', P(x0 + 6, y0 - 9), 'al timón', { weight: 700 }), rotuloParte(m, 'gobierno', P(x1, y0 - vg - 6), 'velocidad de gobierno', { anchor: 'end', weight: 700 }));
  out.push(serif(...P(x0 + 6, y0 - v0 - 8), 'máquina avante', { size: TXT.min, weight: 700 }), serif(...P(xp + 4, y0 - v0 - 22), 'paras la máquina', { size: TXT.min, italic: true }));
  out.push(rotuloParte(m, 'arrancada', P(xp + 44, y0 - v0 + 16), 'arrancada: sigue', { weight: 700 }), rotuloParte(m, 'arrancada', P(xp + 44, y0 - v0 + 30), 'por inercia'));
  out.push(serif(...P(x1, y0 + 30), 'parado y sin arrancada', { anchor: 'end', size: TXT.min, weight: 700 }));
  out.push(cierra());
  const caption = m.on('gobierno') ? 'La velocidad de gobierno es la mínima con la que el barco todavía obedece al timón; depende de cada barco y del viento. Por debajo, no responde.'
    : m.on('arrancada') ? 'La arrancada es la velocidad que el barco conserva por inercia, avante o atrás, cuando la máquina deja de empujar. «Parado y sin arrancada»: no se mueve respecto al agua.'
      : 'Al parar la máquina el barco sigue moviéndose por inercia: es la arrancada. Mientras vaya por encima de la velocidad de gobierno obedece al timón; por debajo, queda a merced del viento y la corriente.';
  return { svg: out.join(''), caption };
}

function rabeoC() {
  const H = 290;
  const alt = 'Un barco visto desde arriba junto a un pantalán por su babor. Al meter el timón a estribor, avante, gira alrededor de su punto de giro, a un tercio de la eslora desde la proa: la proa cae a estribor y la popa barre hacia babor, contra el pantalán. Ese barrido de la popa es el rabeo.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  out.push(agua(46, 5, W - 51, H - 10), `<g><rect x="5" y="5" width="41" height="${H - 10}" fill="${T.tierra}" stroke="${T.tinta}"/><rect x="5" y="5" width="41" height="${H - 10}" fill="${pt}" opacity=".5"/></g>`);
  out.push(rotulo(26, 150, 'PANTALÁN', { size: TXT.min, estilo: 'cap', weight: 700, extra: 'transform="rotate(-90 26 150)"' }));
  const [L, B, px, py, ang] = [140, 44, 100, 118, 20];
  const dc = L / 2 - L / 3;
  out.push(`<g transform="translate(${px} ${f1(py + dc)})">${planta(0, 0, 0, L, B, { relleno: 'none', discontinuo: true })}</g>`);
  out.push(`<g transform="translate(${px} ${py}) rotate(${ang}) translate(0 ${f1(dc)})">${planta(0, 0, 0, L, B)}<line x1="0" y1="${L / 2}" x2="${f1(Math.sin((35 * Math.PI) / 180) * 15)}" y2="${f1(L / 2 + Math.cos((35 * Math.PI) / 180) * 15)}" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/></g>`);
  const proa0 = [px, py - L / 3];
  const proa1 = pol(px, py, ang, L / 3);
  const popa1 = pol(px, py, 180 + ang, (2 * L) / 3);
  out.push(`<path d="M${f1(proa0[0] + 3)},${f1(proa0[1] - 12)} Q${f1((proa0[0] + proa1[0]) / 2 + 4)},${f1(proa0[1] - 18)} ${f1(proa1[0] + 4)},${f1(proa1[1] - 12)}" fill="none" stroke="${T.azul}" stroke-width="2"/>`, flecha(proa1[0] - 2, proa1[1] - 14, proa1[0] + 10, proa1[1] - 9, { color: T.azul, w: 2, punta: 8 }));
  out.push(`<path d="M${px - 2},${f1(py + (2 * L) / 3 + 14)} Q${f1((px + popa1[0]) / 2 - 6)},${f1(py + (2 * L) / 3 + 20)} ${f1(popa1[0] - 2)},${f1(popa1[1] + 14)}" fill="none" stroke="${T.magenta}" stroke-width="2.4"/>`, flecha(popa1[0] + 6, popa1[1] + 17, popa1[0] - 8, popa1[1] + 12, { color: T.magenta, w: 2.4, punta: 9 }));
  out.push(tacha(52, popa1[1] - 4, 6));
  out.push(`<circle cx="${px}" cy="${py}" r="5" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/>`, referencia(px + 7, py, 186, py));
  out.push(serif(190, py - 4, 'punto de giro', { weight: 700 }), serif(190, py + 12, '1/3 de la eslora desde proa', { size: TXT.min, italic: true }));
  out.push(serif(190, 34, 'Timón a estribor:', { weight: 700 }), serif(190, 50, 'la proa cae a estribor…', { size: TXT.min, color: T.azulTxt }));
  out.push(serif(190, 214, '…y la popa barre', { weight: 700, color: T.magenta }), serif(190, 230, 'hacia babor: el rabeo', { weight: 700, color: T.magenta }));
  out.push(serif(190, 256, 'Deja espacio por la banda', { size: TXT.min }), serif(190, 272, 'contraria al giro.', { size: TXT.min }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Avante, el barco gira alrededor de un punto de giro a un tercio de la eslora desde la proa: al meter el timón a estribor la proa cae a estribor y la popa barre hacia babor. Pegado a un pantalán por babor, la popa se te va contra él.' };
}

export function gobiernoRabeoC(spec = {}) {
  const vista = spec.vista ?? 'gobierno';
  if (!['gobierno', 'rabeo'].includes(vista)) return null;
  const m = marcaC(spec, ['gobierno', 'arrancada'], { estricta: true });
  if (!m) return null;
  return vista === 'rabeo' ? rabeoC() : gobiernoC(m);
}

// ===========================================================================
// Atraque (per-7-7). RD 875/2014, anexo II, PER UT 7.3: atraque en punta y de costado, abarloarse, amarrar a una boya.
// La banda de la popa al dar atrás, la de src/nautical/helice.js (dextrógira: atrás, la popa a babor).

const muelleC = (y, H) => `<g><rect x="5" y="${y}" width="${W - 10}" height="${H - y - 5}" fill="${T.tierra}" stroke="${T.tinta}"/><rect x="5" y="${y}" width="${W - 10}" height="${H - y - 5}" fill="__PT__" opacity=".5"/></g>`;
const noray = (x, y) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="${T.tinta}"/>`;
const amarra = (p, q, on = true) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(q[0])}" y2="${f1(q[1])}" stroke="${on ? T.magenta : T.apagado}" stroke-width="${on ? 2.4 : 1.4}"/>`;
const defensa = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="2" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".8"/>`;

function atraqueCostado(spec) {
  const lev = spec.helice === 'levogira';
  const [bm, nombre] = lev ? ['estribor', 'levógira'] : ['babor', 'dextrógira'];
  const H = 300;
  const yq = 236;
  const alt = `Atraque de costado con hélice ${nombre}, visto desde arriba: el barco llega despacio con un ángulo de 20 a 30 grados con el muelle; al dar atrás para parar, la popa va a ${bm} y se arrima sola, y queda paralelo al muelle por su ${bm}, sobre las defensas. El primer cabo a tierra, con corriente de proa, es el largo de proa.`;
  const { out, cierra } = lienzo(W, H, alt);
  const mx = (x) => (lev ? W - x : x);
  const ma = (a) => (a === 'start' ? (lev ? 'end' : 'start') : a === 'end' ? (lev ? 'start' : 'end') : a);
  const rot = (r) => (lev ? -r : r);
  out.push(agua(5, 5, W - 10, yq - 5), muelleC(yq, H), rotulo(179, 280, 'MUELLE', { size: TXT.min, estilo: 'cap', weight: 700 }));
  const [L, B] = [112, 36];
  const [fx0, fy0] = [192, yq - 6 - B / 2];
  out.push(planta(mx(236), 116, rot(-115), L, B, { relleno: 'none', discontinuo: true }));
  out.push(`<path d="M${mx(190)},150 Q${mx(162)},176 ${mx(152)},${fy0 - 22}" fill="none" stroke="${T.azul}" stroke-width="1.6" stroke-dasharray="5 4"/>`, flecha(mx(156), fy0 - 34, mx(152), fy0 - 20, { color: T.azul, w: 1.6, punta: 7 }));
  out.push(serif(mx(150), 70, 'entra a 20–30°, despacio', { anchor: ma('end'), size: TXT.min, color: T.azulTxt }));
  out.push(planta(mx(fx0), fy0, rot(-90), L, B));
  for (const x of [154, 190, 226]) out.push(defensa(mx(x) - 6, yq - 6, 12, 6));
  out.push(flecha(mx(fx0 + 44), fy0 - 44, mx(fx0 + 44), fy0 - 24, { color: T.magenta, w: 2.2 }));
  out.push(serif(mx(fx0 + 54), fy0 - 50, 'atrás: la popa', { anchor: ma('start'), weight: 700, color: T.magenta }), serif(mx(fx0 + 54), fy0 - 35, `va a ${bm}`, { anchor: ma('start'), weight: 700, color: T.magenta }));
  const bow = [mx(fx0 - L / 2 + 2), fy0];
  out.push(amarra(bow, [mx(80), yq + 8]), noray(mx(80), yq + 8), serif(mx(60), yq + 28, '1.º largo de proa', { anchor: ma('start'), weight: 700, color: T.magenta }));
  out.push(flecha(mx(20), 168, mx(70), 168, { color: T.azul, w: 2 }), serif(mx(18), 160, 'corriente', { anchor: ma('start'), size: TXT.min, color: T.azulTxt }));
  out.push(serif(mx(16), 28, `${lev ? 'Levógira' : 'Dextrógira'}: atraca por ${bm}`, { anchor: ma('start'), weight: 700 }));
  out.push(cierra());
  return { svg: conPunteado(out.join('')), caption: `Con hélice ${nombre}, al dar atrás para parar la popa va a ${bm}: atracando por esa banda se arrima sola y quedas paralelo. Con corriente de proa o viento de tierra, el primer cabo a tierra es el largo de proa.` };
}

function atraquePunta(spec) {
  const costado = spec.viento === 'costado';
  const H = 300;
  const yq = 240;
  const alt = costado
    ? 'Atraque de punta, popa al muelle, con viento de costado, visto desde arriba: los dos largos de popa van al noray de barlovento para trabajar contra el viento, y el muerto de proa se tesa cuanto antes.'
    : 'Atraque de punta, popa al muelle, entre otros dos barcos, visto desde arriba: dos largos de popa a los norays y la proa sujeta con el muerto, cuya guía se cobra desde el muelle, o con una codera o el ancla; defensas por las dos bandas.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(agua(5, 5, W - 10, yq - 5), muelleC(yq, H), rotulo(276, 282, 'MUELLE', { size: TXT.min, estilo: 'cap', weight: 700 }));
  const [L, B] = [104, 34];
  const cy = yq - 4 - L / 2;
  for (const x of [104, 254]) out.push(`<g opacity=".45">${planta(x, cy, 0, L, B)}</g>`);
  out.push(planta(179, cy, 0, L, B));
  for (const x of [154, 198]) out.push(defensa(x, cy + 6, 6, 14));
  out.push(`<rect x="171" y="24" width="16" height="12" rx="2" fill="${T.apagado}" stroke="${T.tinta}"/>`, serif(193, 34, 'muerto', { weight: 700 }));
  out.push(amarra([179, 36], [179, cy - L / 2 + 2]));
  out.push(`<path d="M187,36 Q300,60 324,${yq}" fill="none" stroke="${T.tinta}" stroke-width="1.1" stroke-dasharray="4 3"/>`, serif(342, 150, 'guía', { anchor: 'end', size: TXT.min, italic: true }));
  const [pb, pe, nb, ne] = [[168, yq - 6], [190, yq - 6], [134, yq + 10], [224, yq + 10]];
  if (costado) {
    out.push(amarra(pb, nb), amarra(pe, nb), noray(...nb), noray(...ne));
    out.push(flecha(14, 112, 64, 112, { color: T.apagado, w: 2 }), serif(14, 102, 'viento', { size: TXT.min, italic: true }));
    out.push(serif(14, yq + 30, 'los dos largos al noray', { weight: 700, color: T.magenta }), serif(14, yq + 46, 'de barlovento', { weight: 700, color: T.magenta }));
    out.push(serif(206, 84, 'tesa el muerto', { weight: 700, color: T.magenta }), serif(206, 100, 'cuanto antes', { weight: 700, color: T.magenta }));
  } else {
    out.push(amarra(pb, nb), amarra(pe, ne), noray(...nb), noray(...ne));
    out.push(serif(14, yq + 30, 'dos largos', { weight: 700, color: T.magenta }), serif(14, yq + 46, 'de popa', { weight: 700, color: T.magenta }));
    out.push(serif(206, 84, 'proa: muerto,', { weight: 700, color: T.magenta }), serif(206, 100, 'codera o ancla', { weight: 700, color: T.magenta }));
    out.push(serif(14, 64, 'defensas a', { size: TXT.min }), serif(14, 80, 'las dos bandas', { size: TXT.min }));
  }
  out.push(cierra());
  return {
    svg: conPunteado(out.join('')),
    caption: costado
      ? 'Con viento de costado los largos tienen que trabajar contra el viento: encapilla los dos en el noray de barlovento. Coge y tesa el muerto cuanto antes (si hay dos, primero el de barlovento).'
      : 'Al muelle das dos largos (de popa si atracas de popa) y el otro extremo se sujeta con el muerto, cuya guía cobras desde el muelle, con una codera o con tu ancla. Defensas por las dos bandas.',
  };
}

function atraqueAbarloado() {
  const H = 300;
  const yq = 240;
  const alt = 'Abarloado a otro barco, visto desde arriba: el otro barco está amarrado al muelle y tu barco, al costado del otro, con defensas entre los dos, largos y esprines dados al otro barco y los palos desfasados, para que no se enganchen al balancear.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(agua(5, 5, W - 10, yq - 5), muelleC(yq, H), rotulo(179, 282, 'MUELLE', { size: TXT.min, estilo: 'cap', weight: 700 }));
  const B = 34;
  const yo = yq - 6 - B / 2;
  const ym = yo - B - 12;
  out.push(amarra([110, yo + 4], [96, yq + 8], false), amarra([248, yo + 4], [264, yq + 8], false), noray(96, yq + 8), noray(264, yq + 8));
  out.push(planta(179, yo, -90, 146, B), centrado(196, yo + 5, 'el otro'));
  for (const x of [132, 224]) out.push(defensa(x - 6, ym + B / 2 - 1, 12, 14));
  out.push(planta(179, ym, -90, 124, B), centrado(162, ym + 5, 'tu barco', { weight: 700 }));
  out.push(`<circle cx="142" cy="${yo}" r="5" fill="${T.tinta}"/><circle cx="214" cy="${ym}" r="5" fill="${T.tinta}"/>`);
  out.push(serif(246, ym - 30, 'palos no a la', { size: TXT.min }), serif(246, ym - 15, 'misma altura', { size: TXT.min }));
  const top = ym + B / 2 - 2;
  const bot = yo - B / 2 + 2;
  out.push(amarra([122, top - 4], [112, bot + 4]), amarra([236, top - 4], [248, bot + 4]), amarra([156, top], [196, bot]), amarra([200, top], [160, bot]));
  out.push(serif(14, 34, 'avisa al otro barco', { weight: 700 }), serif(14, 50, 'y pon defensas de sobra', { size: TXT.min }), serif(14, 72, 'si hay marea, deja seno', { size: TXT.min, italic: true }));
  out.push(cierra());
  return { svg: conPunteado(out.join('')), caption: 'Abarloarse es amarrarse al costado de otro barco. Avisa a su tripulación, pon defensas de sobra y, entre veleros, que los palos no queden a la misma altura. Si el otro está fondeado o en una boya, acércate por su popa; si arde, por barlovento.' };
}

function atraqueBoya() {
  const H = 300;
  const alt = 'Amarrar a una boya, visto desde arriba: el barco llega proa al viento o a la corriente y muy despacio; con la boya por la amura, la coge con el bichero y le pasa su cabo por seno, de la cornamusa de proa a la argolla y de vuelta, para poder soltarse desde a bordo.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua });
  out.push(flecha(179, 12, 179, 46, { color: T.apagado, w: 2 }), serif(188, 30, 'viento o corriente', { size: TXT.min, italic: true }));
  const [bx, by, cx, cy, L] = [194, 84, 172, 170, 112];
  out.push(linea(cx, H - 6, cx, cy + L / 2 + 4, { color: T.azul, w: 1.6, extra: 'stroke-dasharray="5 4"' }), planta(cx, cy, 0, L, 38));
  out.push(cuerda(`M${cx - 3},${cy - L / 2 + 12} Q${bx - 12},${by + 16} ${bx},${by + 2} Q${bx - 2},${by + 20} ${cx + 3},${cy - L / 2 + 14}`, { on: true, w: 2.4 }));
  out.push(`<circle cx="${bx}" cy="${by}" r="10" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  out.push(linea(cx + 14, cy - L / 2 + 28, bx + 6, by + 8, { w: 2.4 }));
  out.push(serif(bx + 16, by - 4, 'boya', { weight: 700 }), serif(bx + 16, by + 28, 'bichero desde', { size: TXT.min }), serif(bx + 16, by + 43, 'la amura', { size: TXT.min }));
  out.push(serif(bx + 16, by + 72, 'cabo por seno:', { weight: 700, color: T.magenta }), serif(bx + 16, by + 87, 'te sueltas', { size: TXT.min, color: T.magenta }), serif(bx + 16, by + 102, 'desde a bordo', { size: TXT.min, color: T.magenta }));
  out.push(serif(cx - 30, cy + 10, 'llega proa', { anchor: 'end', weight: 700 }), serif(cx - 30, cy + 26, 'al viento y', { anchor: 'end', size: TXT.min }), serif(cx - 30, cy + 41, 'muy despacio', { anchor: 'end', size: TXT.min }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Llega proa al viento o a la corriente (a lo que más empuje) y muy despacio. Con la boya por la amura, cógela con el bichero y pasa tu cabo por seno, para soltarte desde a bordo. Nunca fondees junto a una boya de amarre.' };
}

export function atraqueC(spec = {}) {
  const md = spec.modo ?? 'costado';
  if (md === 'punta') return atraquePunta(spec);
  if (md === 'abarloado') return atraqueAbarloado(spec);
  if (md === 'boya') return atraqueBoya(spec);
  return atraqueCostado(spec);
}
