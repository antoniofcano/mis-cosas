// Láminas de seguridad (UT 1) y de la hora (UT 3) del PY de la cola, rehechas en estilo C (docs/ESTILO-LAMINAS.md).
// Mismos tipos y parámetros que las láminas de lección a las que sustituyen; solo cambia el dibujo. Sin DOM.
//   helicoptero:        { tipo:'helicoptero', vista:'rumbo'|'cable'|'senales' }                          (py-1-10)
//   arnes:              { tipo:'arnes', vista:'chaleco'|'arnes', resaltar? }                              (py-1-4)
//   superficies-libres: { tipo:'superficies-libres', resaltar?: 'lleno'|'medias'|'vacio'|'mamparo' o lista } (py-1-3)
//   husos:              { tipo:'husos', vista:'husos'|'calculo'|'oficial', ejemplo?:'e'|'w', lon?, tu? }   (py-3-5)
// Solo colores T.*; lo que se mira, en magenta y siempre con su rótulo.

import { T, TXT, lienzo, rotulo, etiqueta, cartela, cota, cotaArco, flecha, ondas, referencia, paso, barco, pol, f1 } from './estilo-c.js';
import { husoDe, horaLegal, horaCivilLugar } from '../nautical/hora.js';

const W = 358;
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);
const serif = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', ...o });
const mono = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'mono', ...o });
const linea = (x1, y1, x2, y2, { color = T.tinta, w = 1, extra = '' } = {}) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${w}"${extra ? ` ${extra}` : ''}/>`;
const filete = (y) => linea(14, y, W - 14, y, { w: 0.6 });
const panelNotas = (y, H) => `<rect x="5" y="${y}" width="${W - 10}" height="${H - y - 5}" fill="${T.papel}"/>${linea(5, y, W - 5, y, { w: 0.8 })}`;
const mar = (y, H) => `<rect x="5" y="${y}" width="${W - 10}" height="${H - y - 5}" fill="${T.agua}"/>${linea(5, y, W - 5, y, { color: T.lineaAgua, w: 1.4 })}`;
const tacha = (x, y, s = 7) => `<path d="M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}" stroke="${T.magenta}" stroke-width="2.4" stroke-linecap="round"/>`;

// ===========================================================================
// Rescate con helicóptero (py-1-10)

/** Helicóptero en planta, morro hacia arriba, en (0, 0): rotor a trazos, fuselaje, cola y la grúa a su derecha. */
const heliPlanta = (grua = true) =>
  `<circle r="34" fill="none" stroke="${T.tinta}" stroke-width="1" stroke-dasharray="5 3"/>` +
  `<ellipse rx="10" ry="18" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="-2.5" y="16" width="5" height="30" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1"/>` +
  linea(-8, 44, 8, 44, { w: 2 }) + `<path d="M-6,-12 Q0,-20 6,-12" fill="none" stroke="${T.tinta}" stroke-width="1"/>` +
  (grua ? `<rect x="10" y="-7" width="8" height="8" fill="${T.magenta}" stroke="${T.tinta}" stroke-width="1"/>` : '');

function heliRumbo() {
  const H = 400;
  const alt = 'Vista desde arriba: el barco a rumbo, con el viento entrando unos 30 grados por la amura de babor, acotado desde la proa. El helicóptero se acerca por la popa del barco, aproado al viento, con la grúa en su costado derecho. Debajo, cómo preparar el barco: velas arriadas, motor en marcha, rumbo y velocidad constantes, canal 16, chalecos y cubierta despejada.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [bx, by, L] = [250, 180, 112];
  const proa = [bx, by - L / 2];
  out.push(barco(bx, by, 0, L, { p: null }), serif(bx + 26, by + 22, 'tu barco', { italic: true, size: TXT.min }));
  out.push(linea(bx, proa[1], bx, proa[1] - 74, { w: 1, extra: 'stroke-dasharray="5 4"' }), serif(bx + 6, proa[1] - 20, 'proa', { italic: true, size: TXT.min }));
  const [vx, vy] = pol(proa[0], proa[1], 330, 90);
  const [wx, wy] = pol(proa[0], proa[1], 330, 12);
  out.push(flecha(vx, vy, wx, wy, { color: T.magenta, w: 2.2 }), serif(vx - 6, vy + 18, 'viento', { anchor: 'end', weight: 700, color: T.magenta }));
  out.push(cotaArco(proa[0], proa[1], 48, 330, 0, '30°', { color: T.magenta, rEt: 70 }));
  out.push(cartela(96, 30, 'AMURA DE BABOR', 'viento a unos 30° de la proa', { ancho: 172 }));
  // el helicóptero, aproado al viento, a popa y por babor del barco
  const [hx, hy] = [100, 270];
  out.push(`<g transform="translate(${hx} ${hy}) rotate(-30)">${heliPlanta(true)}</g>`);
  out.push(flecha(hx + 30, hy - 26, bx - 22, by + L / 2 + 2, { color: T.tinta, w: 1.4, discontinua: true }));
  out.push(serif(16, 196, 'se acerca', { weight: 700 }), serif(16, 212, 'por tu popa', { weight: 700 }));
  out.push(referencia(hx + 16, hy - 8, 146, 288, { color: T.magenta }), serif(150, 296, 'su grúa, a su derecha', { weight: 700, color: T.magenta }));
  out.push(panelNotas(320, H));
  out.push(serif(18, 342, 'Velas arriadas y motor en marcha.'), serif(18, 362, 'Mantén rumbo y velocidad constantes.', { weight: 700 }), serif(18, 382, 'Canal 16, chalecos puestos y cubierta despejada.'));
  out.push(cierra());
  return { svg: out.join(''), caption: 'En un velero, velas arriadas y motor en marcha. Normalmente te pedirán llevar el viento unos 30° por la amura de babor, porque el helicóptero se acerca por tu popa con la grúa a su derecha. Mantén rumbo y velocidad.' };
}

function heliCable() {
  const H = 372;
  const alt = 'Vista de costado: el helicóptero en vuelo estacionario baja el cable con su gancho hasta tocar el agua junto al barco antes de que nadie lo coja, para descargar la electricidad estática; una línea a trazos tachada en magenta del cable a una cornamusa recuerda que nunca se hace firme al barco. Debajo, la línea guía y los brazos abajo en el arnés de izado.';
  const { out, cierra } = lienzo(W, H, alt);
  const yA = 236;
  out.push(mar(yA, 280), ondas(14, W - 14, yA + 22, { sep: 8 }));
  // helicóptero de costado
  out.push(`<g transform="translate(230 66)"><ellipse rx="38" ry="14" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="34" y="-5" width="62" height="7" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1"/>${linea(-56, -22, 56, -22, { w: 2 })}${linea(0, -22, 0, -14, { w: 2 })}<path d="M-34,-4 Q-36,8 -24,10" fill="none" stroke="${T.tinta}" stroke-width="1"/>${linea(-24, 14, 24, 14, { w: 1.4 })}</g>`);
  // barco de costado
  out.push(`<path d="M24,${yA - 16} L148,${yA - 16} L138,${yA + 6} L32,${yA + 6}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, linea(86, yA - 16, 86, yA - 104, { w: 2 }));
  // el cable, hasta el agua
  const xc = 196;
  out.push(linea(xc, 80, xc, yA + 2, { w: 1.6 }), `<path d="M${xc},${yA + 2} q-6,0 -6,6 q0,6 6,6" fill="none" stroke="${T.tinta}" stroke-width="2"/>`);
  out.push(`<path d="M${xc + 6},${yA - 18} l7,4 l-5,3 l7,5" fill="none" stroke="${T.magenta}" stroke-width="1.6"/>`);
  out.push(referencia(xc + 10, yA - 6, 236, 150, { color: T.magenta }), serif(240, 124, 'que toque el agua', { weight: 700, color: T.magenta }), serif(240, 140, 'antes de cogerlo:', { weight: 700, color: T.magenta }), serif(240, 158, 'descarga la', { color: T.magenta }), serif(240, 174, 'electricidad estática', { color: T.magenta }));
  // nunca firme al barco
  out.push(`<path d="M60,${yA - 18} Q110,${yA - 70} ${xc - 2},${yA - 80}" fill="none" stroke="${T.tinta}" stroke-width="1.3" stroke-dasharray="4 3"/>`, `<rect x="54" y="${yA - 21}" width="13" height="5" rx="2" fill="${T.tinta}"/>`);
  out.push(tacha(116, yA - 62), serif(16, 112, 'nunca lo hagas', { weight: 700, color: T.magenta }), serif(16, 128, 'firme al barco', { weight: 700, color: T.magenta }));
  out.push(panelNotas(286, H));
  out.push(serif(18, 308, 'Si antes baja una línea guía, cóbrala cuando te lo'), serif(18, 326, 'indiquen, sin amarrarla a nada.'), serif(18, 352, 'En el arnés de izado, brazos abajo: no los levantes.', { weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Deja que el cable toque el agua o el casco antes de cogerlo con las manos, porque acumula electricidad estática, y nunca lo hagas firme al barco: un bandazo podría arrastrar al helicóptero.' };
}

function heliSenales() {
  const H = 384;
  const alt = 'Esfera de reloj centrada en el helicóptero visto desde arriba, con su morro hacia las 12; tu barco está a su derecha, a las 3, y la cartela dice «Estamos a sus 3». Debajo, cómo hacerse ver: humo de día, espejo, bengala de mano con cuidado y VHF portátil, y nunca un cohete con paracaídas cerca de él.';
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  const [cx, cy, R] = [144, 150, 86];
  out.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${T.tinta}" stroke-width="1"/>`);
  for (let h = 1; h <= 12; h++) {
    const [x1, y1] = pol(cx, cy, h * 30, R);
    const [x2, y2] = pol(cx, cy, h * 30, R - (h % 3 ? 6 : 10));
    out.push(linea(x1, y1, x2, y2, { w: h % 3 ? 1 : 1.6 }));
    if (h % 3 === 0) { const [lx, ly] = pol(cx, cy, h * 30, R - 22); out.push(rotulo(lx, ly + 5, String(h), { size: TXT.nombre, estilo: 'serif', weight: 700 })); }
  }
  out.push(`<g transform="translate(${cx} ${cy + 6})">${heliPlanta(false)}</g>`, serif(cx, cy - 46, 'su morro', { anchor: 'middle', italic: true, size: TXT.min }));
  const bx = cx + R + 44;
  out.push(barco(bx, cy, 20, 50, { p: null }), linea(cx + R - 10, cy, bx - 14, cy, { color: T.magenta, w: 1.4, extra: 'stroke-dasharray="4 3"' }));
  out.push(etiqueta(bx - 6, cy + 46, '«Estamos a sus 3»', { color: T.magenta }));
  out.push(panelNotas(258, H));
  out.push(serif(18, 280, 'Las horas, vistas desde el helicóptero:', { weight: 700 }), serif(18, 298, 'su morro son las 12, no tu proa.'));
  out.push(serif(18, 322, 'Hazte ver: humo de día, espejo, VHF portátil;'), serif(18, 340, 'la bengala de mano, con cuidado.'));
  out.push(serif(18, 366, 'Nunca un cohete con paracaídas cerca de él.', { weight: 700, color: T.magenta }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Para guiarlo por radio se usan las horas del reloj desde el punto de vista del helicóptero: su proa son las 12, y «estamos a sus 3» es a su derecha. Con el helicóptero cerca, nunca un cohete con paracaídas.' };
}

export function helicopteroC(spec = {}) {
  const vista = spec.vista ?? 'rumbo';
  if (vista === 'rumbo') return heliRumbo();
  if (vista === 'cable') return heliCable();
  if (vista === 'senales') return heliSenales();
  return null;
}

// ===========================================================================
// Chaleco y arnés (py-1-4)

export const PARTES_CHALECO = ['luz', 'silbato', 'reflectante', 'flotabilidad'];
export const PARTES_ARNES = ['linea-vida', 'amarre', 'pecho'];

function vistaArnes(hl) {
  const on = (k) => hl.has(k);
  const col = (k, base = T.tinta) => (on(k) ? T.magenta : base);
  const H = 384;
  const alt = `Velero de costado con la línea de vida tensa por cubierta de popa a proa. Un tripulante de pie a proa lleva el arnés con el enganche en el pecho y una línea de amarre de cinta, de 2 m como máximo, enganchada con su mosquetón a la línea de vida.${hl.size ? ` Resaltado: ${[...hl].join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const yC = 196;
  out.push(mar(yC + 24, 250));
  out.push(`<path d="M14,${yC} L72,${yC} L72,${yC + 12} L110,${yC + 12} L110,${yC} L344,${yC} L326,${yC + 36} L28,${yC + 36}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3" stroke-linejoin="round"/>`);
  out.push(`<rect x="148" y="${yC - 16}" width="66" height="16" rx="4" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`, linea(248, yC, 248, 26, { w: 2.2 }));
  out.push(rotulo(91, yC + 30, 'bañera', { size: TXT.min, estilo: 'serif', italic: true }));
  const yL = yC - 5;
  out.push(`<g data-parte="linea-vida">${linea(24, yL, 334, yL, { color: col('linea-vida'), w: on('linea-vida') ? 3 : 2 })}<circle cx="24" cy="${yL}" r="3" fill="${T.tinta}"/><circle cx="334" cy="${yL}" r="3" fill="${T.tinta}"/>` +
    serif(16, yL - 10, 'línea de vida, tensa', { weight: 700, color: col('linea-vida'), size: TXT.min }) + '</g>');
  // tripulante, de pie a proa
  const x = 292;
  const t = `stroke="${T.tinta}" stroke-linecap="round" fill="none"`;
  out.push(`<path d="M${x - 4},${yC - 2} L${x - 2},${yC - 42} M${x + 5},${yC - 2} L${x + 3},${yC - 42}" ${t} stroke-width="5"/>`);
  out.push(`<line x1="${x}" y1="${yC - 74}" x2="${x}" y2="${yC - 46}" stroke="${T.naranja}" stroke-width="18" stroke-linecap="round"/>`, `<line x1="${x}" y1="${yC - 74}" x2="${x}" y2="${yC - 46}" stroke="${T.tinta}" stroke-width="1" />`);
  out.push(`<circle cx="${x + 1}" cy="${yC - 92}" r="10" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.4"/>`, `<path d="M${x + 5},${yC - 68} L${x + 20},${yC - 56} L${x + 24},${yC - 68}" ${t} stroke-width="4.5"/>`);
  out.push(`<g data-parte="pecho">${linea(x - 11, yC - 66, x + 11, yC - 66, { color: col('pecho'), w: 3 })}<circle cx="${x - 9}" cy="${yC - 66}" r="3.5" fill="${col('pecho')}"/>` +
    referencia(x - 13, yC - 68, 236, 72, { color: col('pecho') }) + serif(234, 66, 'enganche en el pecho', { anchor: 'end', weight: 700, color: col('pecho') }) + '</g>');
  out.push(`<g data-parte="amarre"><path d="M${x - 9},${yC - 66} Q${x - 36},${yC - 32} ${x - 30},${yL - 4}" fill="none" stroke="${col('amarre', T.apagado)}" stroke-width="${on('amarre') ? 4.5 : 3.5}"/><path d="M${x - 35},${yL - 8} a5,6 0 1 0 9,0" fill="none" stroke="${T.tinta}" stroke-width="1.8"/>` +
    referencia(x - 32, yC - 34, 212, 118, { color: col('amarre') }) + serif(208, 104, 'línea de amarre de cinta,', { anchor: 'end', weight: 700, color: col('amarre') }) + serif(208, 120, '2 m como máximo, con', { anchor: 'end', color: col('amarre') }) + serif(208, 136, 'mosquetones de seguridad', { anchor: 'end', color: col('amarre') }) + '</g>');
  out.push(cota(x - 34, yC + 52, x - 4, yC + 52, '', { tope: 4 }), mono(x - 19, yC + 72, '≤ 2 m', { weight: 700 }));
  out.push(panelNotas(286, H));
  out.push(serif(18, 308, 'Engánchate antes de salir de la bañera.', { weight: 700 }), serif(18, 328, 'El arnés es para no caer al agua, no para ir'), serif(18, 346, 'remolcado. Guárdalo seco, a la sombra y lejos'), serif(18, 364, 'del combustible y de los productos de limpieza.'));
  out.push(cierra());
  const CAP = {
    'linea-vida': 'La línea de vida se tiende tensa por cubierta, de proa a popa, y te enganchas a ella antes de salir de la bañera.',
    amarre: 'La línea de amarre va del arnés al barco: mejor de cinta que de cabo, con mosquetones de seguridad y 2 m como máximo (ISO 12401).',
    pecho: 'El arnés se engancha por el pecho: si caes, te arrastran boca arriba.',
  };
  return { svg: out.join(''), caption: [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'El arnés sirve para no caer al agua. Se engancha por el pecho con una línea de amarre de cinta de 2 m como máximo a la línea de vida, tensa de proa a popa, antes de salir de la bañera.' };
}

function vistaChaleco(hl) {
  const on = (k) => hl.has(k);
  const col = (k) => (on(k) ? T.magenta : T.tinta);
  const H = 392;
  const alt = `Chaleco salvavidas visto de frente, con cada elemento rotulado: la luz en el hombro, el silbato colgado del pecho, las bandas retrorreflectantes y los dos flotadores, que dan la vuelta a quien cae inconsciente y lo dejan boca arriba. Debajo, la flotabilidad mínima por zona de navegación: 275 N en la zona 1, 150 N en las 2, 3 y 4 y 100 N en las 5, 6 y 7, y uno por persona, más uno en la zona 1.${hl.size ? ` Resaltado: ${[...hl].join(', ')}.` : ''}`;
  const { out, cierra } = lienzo(W, H, alt);
  const cx = 92;
  const flot = on('flotabilidad');
  const panel = (s) => `<path d="M${cx + s * 6},52 Q${cx + s * 26},46 ${cx + s * 32},64 L${cx + s * 46},88 L${cx + s * 50},180 Q${cx + s * 30},192 ${cx + s * 6},186 L${cx + s * 6},94 Q${cx + s * 4},72 ${cx + s * 6},52Z" fill="${T.naranja}" stroke="${flot ? T.magenta : T.tinta}" stroke-width="${flot ? 2.4 : 1.3}"/>`;
  out.push(`<g data-parte="flotabilidad"><path d="M${cx - 30},64 Q${cx},36 ${cx + 30},64 Q${cx},50 ${cx - 30},64Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>${panel(-1)}${panel(1)}</g>`);
  out.push(linea(cx - 48, 154, cx + 48, 154, { w: 3 }), `<rect x="${cx - 7}" y="148" width="14" height="12" rx="2" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  const refl = on('reflectante');
  out.push(`<g data-parte="reflectante">${[-1, 1].map((s) => `<rect x="${s < 0 ? cx - 44 : cx + 12}" y="114" width="32" height="10" fill="${T.blanco}" stroke="${refl ? T.magenta : T.tinta}" stroke-width="${refl ? 2.2 : 1}"/>`).join('')}</g>`);
  const [lx, ly] = [cx + 34, 72];
  out.push(`<g data-parte="luz"><circle cx="${lx}" cy="${ly}" r="6" fill="${T.luzBlanca}" stroke="${col('luz')}" stroke-width="${on('luz') ? 2.4 : 1.3}"/>${[20, 60, 100].map((a) => { const [x1, y1] = pol(lx, ly, a, 9); const [x2, y2] = pol(lx, ly, a, 14); return linea(x1, y1, x2, y2, { w: 1.2 }); }).join('')}</g>`);
  out.push(`<g data-parte="silbato"><path d="M${cx + 20},98 Q${cx + 30},112 ${cx + 26},130" fill="none" stroke="${T.tinta}" stroke-width="1"/><rect x="${cx + 20}" y="130" width="14" height="7" rx="3" fill="${on('silbato') ? T.magenta : T.apagado}" stroke="${T.tinta}" stroke-width="1"/></g>`);
  const xr = 196;
  out.push(referencia(lx + 8, ly - 4, xr - 4, 54, { color: col('luz') }), serif(xr, 52, 'luz (blanca)', { weight: 700, color: col('luz') }));
  out.push(referencia(cx + 35, 134, xr - 4, 94, { color: col('silbato') }), serif(xr, 96, 'silbato', { weight: 700, color: col('silbato') }));
  out.push(referencia(cx + 44, 120, xr - 4, 134, { color: col('reflectante') }), serif(xr, 132, 'bandas', { weight: 700, color: col('reflectante') }), serif(xr, 148, 'retrorreflectantes', { weight: 700, color: col('reflectante') }));
  out.push(referencia(cx + 48, 172, xr - 4, 178, { color: col('flotabilidad') }), serif(xr, 176, 'flotabilidad: le da', { weight: 700, color: col('flotabilidad') }), serif(xr, 192, 'la vuelta al que cae', { color: col('flotabilidad') }), serif(xr, 208, 'inconsciente', { color: col('flotabilidad') }));
  out.push(panelNotas(226, H));
  out.push(rotulo(18, 248, 'FLOTABILIDAD MÍNIMA', { size: TXT.min, estilo: 'cap', weight: 700, anchor: 'start', color: T.apagado }));
  [['275 N', 'zona 1'], ['150 N', 'zonas 2, 3 y 4'], ['100 N', 'zonas 5, 6 y 7']].forEach(([n, z], i) => {
    const xx = 18 + i * 112;
    out.push(etiqueta(xx + 30, 272, n, { color: i === 0 ? T.magenta : T.tinta }), serif(xx, 298, z, { size: TXT.min }));
  });
  out.push(filete(312));
  out.push(serif(18, 332, 'Uno por persona y uno más en la zona 1;'), serif(18, 350, 'los de los niños, a su peso y talla.'), serif(18, 372, 'Sin luz, solo de día y en las zonas 4 a 7.', { italic: true, size: TXT.min }));
  out.push(cierra());
  const CAP = {
    luz: 'Cada chaleco lleva su luz, y es blanca: la que más se ve de noche y no se confunde con la pirotecnia roja. En zonas 4 a 7, si solo navegas de día, puedes prescindir de ella.',
    silbato: 'El chaleco homologado lleva silbato.',
    reflectante: 'Lleva bandas retrorreflectantes, que devuelven la luz de un foco hacia quien te busca.',
    flotabilidad: 'Debe dar la vuelta a una persona inconsciente y dejarla boca arriba con la boca fuera del agua; lo hace mejor cuanto mayor es su flotabilidad.',
  };
  return { svg: out.join(''), caption: [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'Un chaleco homologado lleva luz blanca, silbato y bandas retrorreflectantes y da la vuelta a una persona inconsciente para dejarla boca arriba. Flotabilidad mínima: 275 N en la zona 1, 150 N en las 2 a 4 y 100 N en las 5 a 7.' };
}

export function arnesC(spec = {}) {
  const vista = spec.vista ?? 'chaleco';
  const propias = vista === 'arnes' ? PARTES_ARNES : PARTES_CHALECO;
  if (!['chaleco', 'arnes'].includes(vista)) return null;
  // las partes de la otra vista no resaltan nada (se dibuja igual)
  const hl = new Set(lista(spec.resaltar).filter((k) => propias.includes(k)));
  return vista === 'arnes' ? vistaArnes(hl) : vistaChaleco(hl);
}

// ===========================================================================
// Superficies libres (py-1-3). Corrección por superficie libre: G sube a G virtual (Gv) una distancia proporcional al
// momento de inercia de la superficie, i = l · b³ / 12: depende del cubo de la manga del tanque. Un mamparo longitudinal
// en medio deja dos superficies de manga b/2: 2 · (b/2)³ = b³ / 4, la cuarta parte.

export const PARTES_SL = ['lleno', 'medias', 'vacio', 'mamparo'];
const rot = (cx, cy, deg, [x, y]) => { const r = (deg * Math.PI) / 180; return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]; };
const ptsD = (pts) => `M${pts.map((q) => q.map(f1).join(',')).join(' L')}Z`;

export function superficiesLibresC(spec = {}) {
  const hl = new Set(lista(spec.resaltar));
  if ([...hl].some((k) => !PARTES_SL.includes(k))) return null;
  const H = 386;
  const alt = `Sección del barco escorado con un tanque a medias: el líquido corre a la banda baja y el centro de gravedad G sube por la crujía hasta G virtual, más cerca del metacentro M, así que se pierde altura metacéntrica. Debajo, cuatro tanques escorados: lleno y vacío no restan; a medias, sí; con un mamparo longitudinal, la pérdida baja a la cuarta parte.${hl.size ? ` Resaltado: ${[...hl].join(', ')}.` : ''}`;
  const { out, id, cierra } = lienzo(W, H, alt);
  const esc = 14;
  const [cx, cy] = [100, 124];
  const P = (x, y) => rot(cx, cy, esc, [x, y]);
  out.push(`<rect x="5" y="${cy}" width="190" height="${196 - cy}" fill="${T.agua}"/>`, linea(5, cy, 195, cy, { color: T.lineaAgua, w: 1.4 }));
  const casco = [[-74, -50], [74, -50], [74, 4], [40, 44], [-40, 44], [-74, 4]].map((q) => P(...q));
  out.push(`<path d="${ptsD(casco)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>`);
  const tq = [[-54, 10], [54, 10], [54, 36], [-54, 36]].map((q) => P(...q));
  const [, yl] = P(0, 23);
  out.push(`<clipPath id="${id}-tq"><path d="${ptsD(tq)}"/></clipPath>`, `<rect x="${cx - 80}" y="${f1(yl)}" width="160" height="60" fill="${T.azul}" fill-opacity=".45" clip-path="url(#${id}-tq)"/>`, `<path d="${ptsD(tq)}" fill="none" stroke="${T.tinta}" stroke-width="1.3"/>`);
  out.push(flecha(cx - 28, yl + 3, cx + 26, yl + 3, { color: T.azulTxt, w: 1.6 }));
  const [a0, a1] = [P(0, -70), P(0, 44)];
  out.push(linea(a0[0], a0[1], a1[0], a1[1], { w: 0.8, extra: 'stroke-dasharray="5 3"' }));
  const [Mp, Gp, Gv] = [P(0, -62), P(0, -8), P(0, -34)];
  out.push(`<circle cx="${f1(Mp[0])}" cy="${f1(Mp[1])}" r="3.5" fill="${T.tinta}"/>`, rotulo(Mp[0] + 9, Mp[1] + 5, 'M', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'start' }));
  out.push(flecha(Gp[0], Gp[1] - 5, Gv[0] + 0.5, Gv[1] + 7, { color: T.magenta, w: 1.8 }));
  out.push(`<circle cx="${f1(Gp[0])}" cy="${f1(Gp[1])}" r="4" fill="${T.tinta}"/>`, rotulo(Gp[0] - 9, Gp[1] + 5, 'G', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'end' }));
  out.push(`<circle cx="${f1(Gv[0])}" cy="${f1(Gv[1])}" r="4" fill="${T.papel}" stroke="${T.magenta}" stroke-width="2"/>`, rotulo(Gv[0] - 9, Gv[1] + 5, 'Gv', { size: TXT.nota, estilo: 'serif', weight: 700, anchor: 'end', color: T.magenta }));
  out.push(serif(14, 212, 'escora exagerada', { italic: true, size: TXT.min, color: T.apagado }));
  const ex = 204;
  out.push(paso(ex + 8, 36, 1), serif(ex + 22, 40, 'El líquido corre', { weight: 700 }), serif(ex + 22, 56, 'a la banda baja.'));
  out.push(paso(ex + 8, 86, 2, { color: T.magenta }), serif(ex + 22, 90, 'Es como subir G:', { weight: 700, color: T.magenta }), serif(ex + 22, 106, 'G pasa a Gv.'));
  out.push(paso(ex + 8, 136, 3), serif(ex + 22, 140, 'Menos GM y menos', { weight: 700 }), serif(ex + 22, 156, 'brazo adrizante.'));
  out.push(filete(228));
  const casos = [['lleno', 'lleno', 1, 'no resta'], ['medias', 'a medias', 0.5, 'resta GM'], ['vacio', 'vacío', 0, 'no resta'], ['mamparo', 'mamparo', 0.5, 'resta ¼']];
  casos.forEach(([k, nom, nivel, nota], i) => {
    const [xc, yc] = [50 + i * 86, 274];
    const Q = (x, y) => rot(xc, yc, esc, [x, y]);
    const pts = [[-28, -15], [28, -15], [28, 15], [-28, 15]].map((q) => Q(...q));
    const dim = hl.size && !hl.has(k) ? ' opacity=".4"' : '';
    const c = hl.has(k) ? T.magenta : T.tinta;
    const o = [`<g data-parte="${k}"${dim}><clipPath id="${id}-c${i}"><path d="${ptsD(pts)}"/></clipPath>`];
    if (nivel === 1) o.push(`<path d="${ptsD(pts)}" fill="${T.azul}" fill-opacity=".45"/>`);
    else if (nivel > 0) {
      if (k === 'mamparo') {
        for (const dx of [-14, 14]) {
          const [, yy] = Q(dx, 0);
          const half = [[dx - 14, -15], [dx + 14, -15], [dx + 14, 15], [dx - 14, 15]].map((q) => Q(...q));
          o.push(`<clipPath id="${id}-c${i}${dx > 0 ? 'b' : 'a'}"><path d="${ptsD(half)}"/></clipPath><rect x="${xc - 44}" y="${f1(yy)}" width="88" height="40" fill="${T.azul}" fill-opacity=".45" clip-path="url(#${id}-c${i}${dx > 0 ? 'b' : 'a'})"/>`);
        }
        const [m0, m1] = [Q(0, -15), Q(0, 15)];
        o.push(linea(m0[0], m0[1], m1[0], m1[1], { w: 2 }));
      } else {
        const [, yy] = Q(0, 0);
        o.push(`<rect x="${xc - 44}" y="${f1(yy)}" width="88" height="40" fill="${T.azul}" fill-opacity=".45" clip-path="url(#${id}-c${i})"/>`, flecha(xc - 14, yy + 4, xc + 13, yy + 4, { color: T.azulTxt, w: 1.4 }));
      }
    }
    o.push(`<path d="${ptsD(pts)}" fill="none" stroke="${c}" stroke-width="${hl.has(k) ? 2.2 : 1.3}"/>`);
    o.push(rotulo(xc, 316, nom, { size: TXT.min + 0.5, estilo: 'serif', weight: 700, color: c }), rotulo(xc, 334, nota, { size: TXT.min, estilo: 'serif', italic: true, color: k === 'medias' ? T.magenta : c, weight: k === 'medias' ? 700 : 400 }), '</g>');
    out.push(o.join(''));
  });
  out.push(filete(346), serif(18, 368, 'Cuenta la manga del tanque al cubo, no el líquido.', { weight: 700 }));
  out.push(cierra());
  const CAP = {
    lleno: 'Un tanque lleno del todo no tiene superficie libre: el líquido no puede moverse y no resta estabilidad.',
    medias: 'Un tanque a medias tiene superficie libre: al escorar, el líquido corre a la banda baja y es como subir G. Se pierde GM y brazo adrizante.',
    vacio: 'Un tanque vacío no tiene superficie libre: no hay líquido que se mueva.',
    mamparo: 'Un mamparo longitudinal divide la superficie libre en dos más estrechas: la pérdida depende de lo ancho que sea el tanque, así que se reduce mucho.',
  };
  const sel = [...hl];
  return { svg: out.join(''), caption: sel.length === 1 ? CAP[sel[0]] : 'En un tanque a medias el líquido corre hacia la banda baja al escorar: es como subir G (G virtual) y se pierde GM. Lleno del todo o vacío no pasa; la pérdida depende de lo ancho del tanque, y un mamparo longitudinal la reduce mucho.' };
}

// ===========================================================================
// Husos horarios (py-3-5): las cuentas son las de src/nautical/hora.js (las comprueba tests/lecciones-tierra.test.js).

const EJEMPLOS_HUSO = { e: { lon: 69 + 25 / 60, tu: '10:30', txt: '069° 25′ E' }, w: { lon: -75, tu: '08:00', txt: '075° W' } };
const coma = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const hm = (min) => { const m = ((min % 1440) + 1440) % 1440; const h = Math.floor(m / 60); const r = m - h * 60; const ent = Math.abs(r - Math.round(r)) < 0.05; return `${String(h).padStart(2, '0')}:${ent ? String(Math.round(r)).padStart(2, '0') : coma(r).padStart(4, '0')}`; };
const aMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
const lonTxt = (L) => { const a = Math.abs(L); const g = Math.floor(a + 1e-9); const m = Math.round((a - g) * 60); return `${String(g).padStart(3, '0')}°${m ? ` ${m}′` : ''} ${L >= 0 ? 'E' : 'W'}`; };

/** Franja de husos de −6 a +6 con su hora legal para un TU dado; con marca, el meridiano del lugar y su huso. */
function franja(out, y, tuMin, marca = null) {
  const [x0, w] = [23, 24];
  for (let i = 0; i < 13; i++) {
    const h = i - 6;
    const x = x0 + i * w;
    const sel = marca && marca.huso === h;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="64" fill="${i % 2 ? T.papel : T.agua2}" stroke="${sel ? T.magenta : T.tinta}" stroke-width="${sel ? 2 : h === 0 ? 1.2 : 0.6}"/>`);
    out.push(mono(x + w / 2, y + 37, h === 0 ? '0' : `${Math.abs(h)}${h > 0 ? 'E' : 'W'}`, { weight: 700, color: sel ? T.magenta : T.tinta }));
    out.push(mono(x + w / 2, y + 84, `${hm(tuMin + h * 60).slice(0, 2)}h`, { weight: sel || h === 0 ? 700 : 400, color: sel ? T.magenta : T.tinta }));
  }
  const xg = x0 + 6 * w + w / 2;
  out.push(linea(xg, y - 4, xg, y + 22, { w: 1.6 }), linea(xg, y + 44, xg, y + 68, { w: 1.6 }));
  if (marca) {
    const xm = xg + (marca.lon / 15) * w;
    out.push(linea(xm, y - 10, xm, y + 22, { color: T.magenta, w: 2 }), linea(xm, y + 44, xm, y + 66, { color: T.magenta, w: 2 }), `<circle cx="${f1(xm)}" cy="${y - 10}" r="4" fill="${T.magenta}"/>`);
  }
  return { x0, w, xg };
}

function vistaHusos(spec) {
  const H = 300;
  const tu = spec.tu ?? '12:00';
  const alt = `Franja de trece husos horarios, del 6 W al 6 E, con el de Greenwich en el centro; debajo de cada uno, su hora legal cuando son las ${tu} de tiempo universal: una hora más por cada huso hacia el E y una menos hacia el W.`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(18, 30, 'huso 0: de 7° 30′ W a 7° 30′ E', { weight: 700 }));
  const y = 62;
  const { xg } = franja(out, y, aMin(tu));
  out.push(serif(xg + 6, y - 6, 'Greenwich', { italic: true, size: TXT.min }));
  out.push(serif(18, y + 106, `hora legal cuando son las ${tu} TU`, { italic: true, size: TXT.min, color: T.apagado }));
  out.push(flecha(xg + 14, y + 128, W - 24, y + 128, { color: T.magenta, w: 1.8 }), serif(W - 22, y + 150, 'hacia el E: + 1 h por huso', { anchor: 'end', weight: 700, color: T.magenta }));
  out.push(flecha(xg - 14, y + 128, 24, y + 128, { color: T.tinta, w: 1.8 }), serif(22, y + 170, 'hacia el W: − 1 h por huso', { weight: 700 }));
  out.push(filete(250), rotulo(W / 2, 278, 'Hz = TU ± huso (E suma, W resta)', { size: TXT.nota, estilo: 'serif', weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'La Tierra gira 360° en 24 h: 15° = 1 h. Cada huso abarca 15° y está centrado en un meridiano múltiplo de 15°; su hora legal es la civil de ese meridiano central, la misma en todo el huso. Hacia el E se adelanta y hacia el W se atrasa.' };
}

function vistaCalculo(spec) {
  const ej = EJEMPLOS_HUSO[spec.ejemplo ?? 'e'] ?? EJEMPLOS_HUSO.e;
  const lon = spec.lon != null ? Number(spec.lon) : ej.lon;
  if (!Number.isFinite(lon) || Math.abs(lon) > 97.5) return null;
  const tu = spec.tu ?? (spec.lon != null ? '12:00' : ej.tu);
  const tuMin = aMin(tu);
  const txt = spec.lon != null ? lonTxt(lon) : ej.txt;
  const q = Math.abs(lon) / 15;
  const huso = husoDe(lon);
  const lonMin = horaCivilLugar(0, lon);
  const sg = lon >= 0 ? '+' : '−';
  const hus = huso === 0 ? 'huso 0' : `huso ${Math.abs(huso)} ${huso > 0 ? 'E' : 'W'}`;
  const hz = horaLegal(tuMin, lon);
  const hcl = tuMin + lonMin;
  const lt = Math.abs(lonMin);
  const ltTxt = `${Math.floor(lt / 60)} h${lt % 60 > 0.05 ? ` ${coma(lt % 60)} min` : ''}`.replace(',0 min', ' min');
  const central = Math.abs(lon - huso * 15) < 1e-6;
  const H = 346;
  const alt = `Franja de husos con el meridiano de ${txt} marcado en magenta dentro de su huso, el ${hus}. Debajo, la cuenta en tres pasos: el huso (${coma(q, 2)}), la hora legal Hz = ${tu} ${sg} ${Math.abs(huso)} h = ${hm(hz)} y la hora civil del lugar HcL = ${hm(hcl)}, con la longitud en tiempo.`;
  const { out, cierra } = lienzo(W, H, alt);
  out.push(rotulo(W / 2, 30, `TU ${tu} en ${txt}`, { size: TXT.nombre, estilo: 'serif', weight: 700 }));
  franja(out, 56, tuMin, { lon, huso });
  out.push(filete(158));
  out.push(paso(26, 180, 1), serif(42, 184, `${coma(Math.abs(lon), 2)} / 15 = ${coma(q, 2)} → ${hus}`, { weight: 700 }));
  out.push(paso(26, 214, 2, { color: T.magenta }), serif(42, 218, 'Hora legal (la del huso):', { weight: 700, color: T.magenta }), serif(42, 238, `Hz = ${tu} ${sg} ${Math.abs(huso)} h = ${hm(hz)}`, { weight: 700, color: T.magenta, size: TXT.nota }));
  out.push(paso(26, 266, 3), serif(42, 270, 'Hora civil del lugar (su longitud en tiempo):', { weight: 700 }), serif(42, 290, `HcL = ${tu} ${sg} ${ltTxt} = ${hm(hcl)}`, { weight: 700, size: TXT.nota }));
  out.push(filete(306), serif(18, 328, central ? 'Meridiano central: Hz y HcL coinciden.' : 'Fuera del meridiano central: Hz ≠ HcL. 1° = 4 min.', { italic: true }));
  out.push(cierra());
  const cap = central
    ? `En ${txt}, ${Math.abs(lon)} / 15 = ${Math.round(q)}: ${hus}. Al ${lon >= 0 ? 'E la hora va adelantada' : 'W la hora va atrasada'}, así que con TU ${tu} la hora legal es ${hm(hz)}, igual a la civil del lugar porque ${txt} es el meridiano central del huso.`
    : `En ${txt}, ${coma(Math.abs(lon), 2)} / 15 = ${coma(q, 2)}: ${hus}. La hora legal es la del meridiano central del huso (${hm(hz)}); la civil del lugar usa la longitud exacta (${hm(hcl)}). Hacia el E se suma, hacia el W se resta.`;
  return { svg: out.join(''), caption: cap };
}

function vistaOficial() {
  const H = 340;
  const alt = 'Tabla de la hora oficial en España: la Península, Baleares, Ceuta y Melilla, casi todas en el huso 0, van a TU + 1 en invierno y TU + 2 en verano; Canarias, en el huso 1 W, a TU en invierno y TU + 1 en verano. Debajo, las fechas del horario de verano y la diferencia entre hora legal, oficial y la del reloj de bitácora.';
  const { out, cierra } = lienzo(W, H, alt);
  const cols = [['huso', 150], ['invierno', 226], ['verano', 296]];
  const y0 = 30;
  for (const [t, x] of cols) out.push(rotulo(x, y0, t.toUpperCase(), { size: TXT.min, estilo: 'cap', weight: 700, color: T.apagado }));
  const filas = [['Península, Baleares,', 'Ceuta y Melilla', 'huso 0*', 'TU + 1', 'TU + 2'], ['Canarias', '', 'huso 1 W', 'TU', 'TU + 1']];
  filas.forEach(([a, b, h, inv, ver], i) => {
    const y = y0 + 16 + i * 52;
    out.push(`<rect x="12" y="${y}" width="${W - 24}" height="44" fill="${i % 2 ? T.papel : T.agua2}" stroke="${T.tinta}" stroke-width=".8"/>`);
    out.push(serif(20, b ? y + 19 : y + 27, a, { weight: 700, size: TXT.min }), b ? serif(20, y + 35, b, { weight: 700, size: TXT.min }) : '');
    out.push(mono(150, y + 27, h), etiqueta(226, y + 23, inv), etiqueta(296, y + 23, ver, { color: T.magenta }));
  });
  out.push(serif(18, 166, '* el extremo W de Galicia ya cae en el huso 1 W.', { italic: true, size: TXT.min, color: T.apagado }));
  out.push(filete(178));
  out.push(serif(18, 198, 'Verano: del último domingo de marzo al último'), serif(18, 216, 'domingo de octubre; el cambio, a la 01:00 TU.'));
  out.push(filete(230));
  out.push(serif(18, 252, 'Legal (Hz): la del huso, TU ± huso.', { weight: 700 }), serif(18, 274, 'Oficial (Ho): la fija el Gobierno.', { weight: 700, color: T.magenta }), serif(18, 296, 'Reloj de bitácora (HRB): la fija el patrón;'), serif(18, 314, 'puede coincidir con la legal o la oficial.'));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Casi toda la península está en el huso 0 y Canarias en el 1 W, pero la hora oficial la fija el Gobierno: por eso la española no coincide con la legal ni siquiera en invierno.' };
}

export function husosC(spec = {}) {
  const vista = spec.vista ?? 'husos';
  if (vista === 'husos') return vistaHusos(spec);
  if (vista === 'calculo') return vistaCalculo(spec);
  if (vista === 'oficial') return vistaOficial();
  return null;
}
