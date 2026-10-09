// Cola del PY rehecha en estilo C en la tanda de cierre (docs/ESTILO-LAMINAS.md): el extintor (py-1-7) y los Avisos a
// los Navegantes y radioavisos (py-3-7). Mismos tipos, parámetros y `resaltar`; solo cambia el dibujo, y el extintor
// gana una vista con lo que pide el RD 339/2021 (art. 15) y la revisión del RIPCI. Sin DOM.
//   extintor:          { vista: 'co2'|'uso'|'norma'|'ambas', resaltar? }                                 (py-1-7)
//   avisos-navegantes: { vista: 'correccion'|'radioavisos', resaltar? }                                  (py-3-7)
// No se dibuja ninguna tabla de «qué agente para qué clase»: la norma vigente (UNE-EN 3-7) no está a mano para
// comprobarla (ver .trabajo-ux/ESTADO-py-laminas.md).

import { T, TXT, lienzo, rotulo, etiqueta, cartela, flecha, referencia, f1 } from './estilo-c.js';
import { W, serif, mono, cap, linea, filete, panelNotas, tacha, lista } from './kit-lecciones-c.js';

const marcasDe = (spec, validas) => {
  const hl = new Set(lista(spec.resaltar));
  if ([...hl].some((k) => !validas.includes(k))) return null;
  return { hl, on: (k) => hl.has(k), c: (k, b = T.tinta) => (hl.has(k) ? T.magenta : b), g: (k) => `<g data-parte="${k}"${hl.size && !hl.has(k) ? ' opacity=".45"' : ''}>` };
};

// ===========================================================================
// El extintor (py-1-7)

export const PARTES_CO2 = ['manometro', 'boquilla', 'precinto', 'etiqueta'];
export const PARTES_USO = ['viento', 'base', 'barrer', 'salida'];

/** Botella roja con etiqueta y válvula; (x, y) es el hombro. */
function botella(x, y, h, w, { manometro = false, m }) {
  const s = [`<rect x="${f1(x - w / 2)}" y="${f1(y)}" width="${w}" height="${h}" rx="${f1(w / 2.6)}" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1.2"/>`];
  s.push(`${m.g('etiqueta')}<rect x="${f1(x - w / 2 + 3)}" y="${f1(y + h * 0.35)}" width="${w - 6}" height="${f1(h * 0.32)}" rx="2" fill="${T.papel}" stroke="${m.c('etiqueta')}" stroke-width="${m.on('etiqueta') ? 2.2 : 0.8}"/>${[0, 1, 2].map((i) => linea(x - w / 2 + 6, y + h * 0.42 + i * 6, x + w / 2 - 6, y + h * 0.42 + i * 6, { color: T.apagado, w: 1.2 })).join('')}</g>`);
  s.push(`<rect x="${f1(x - 5)}" y="${f1(y - 12)}" width="10" height="13" fill="${T.apagado}" stroke="${T.tinta}"/>`, linea(x - 3, y - 12, x + 16, y - 20, { w: 2.6, extra: 'stroke-linecap="round"' }));
  if (manometro) s.push(`<circle cx="${f1(x - 10)}" cy="${f1(y - 8)}" r="6" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/>`, linea(x - 10, y - 8, x - 7, y - 11, { color: T.verdeTxt, w: 1.6 }));
  return s.join('');
}

function vistaCO2(out, y0, m) {
  out.push(cap(16, y0 + 18, 'CÓMO SE RECONOCE EL DE CO₂'));
  const x = 48;
  const yb = y0 + 54;
  out.push(botella(x, yb, 96, 32, { m }));
  out.push(`${m.g('precinto')}<circle cx="${x + 9}" cy="${yb - 5}" r="3.8" fill="none" stroke="${m.c('precinto', T.amarillo)}" stroke-width="${m.on('precinto') ? 2.6 : 1.8}"/></g>`);
  out.push(`<path d="M${x + 5},${yb - 6} C${x + 32},${yb - 6} ${x + 32},${yb + 32} ${x + 28},${yb + 46}" fill="none" stroke="${T.tinta}" stroke-width="2.4"/>`);
  out.push(`${m.g('boquilla')}<path d="M${x + 24},${yb + 46} L${x + 32},${yb + 46} L${x + 40},${yb + 78} L${x + 16},${yb + 78}Z" fill="${T.negro}" stroke="${m.c('boquilla')}" stroke-width="${m.on('boquilla') ? 2.6 : 1}"/></g>`);
  out.push(rotulo(x, yb + 112, 'CO₂', { size: TXT.nota, estilo: 'mono', weight: 700 }));
  const lx = 112;
  const filas = [['manometro', 'Sin manómetro:', 'se controla pesándolo', yb - 14, [x + 1, yb - 12]], ['precinto', 'Precinto y pasador', 'de seguridad', yb + 18, [x + 12, yb - 4]], ['etiqueta', 'Etiqueta con', 'las instrucciones', yb + 50, [x + 12, yb + 48]], ['boquilla', 'Boquilla en trompa:', 'no la agarres (se enfría)', yb + 82, [x + 38, yb + 70]]];
  for (const [k, a, b, y, [px, py]] of filas) out.push(`${m.g(k)}${referencia(px, py, lx - 4, y - 4, { color: m.c(k) })}${serif(lx, y, a, { weight: 700, color: m.c(k), size: TXT.min })}${serif(lx, y + 15, b, { size: TXT.min })}</g>`);
  out.push(`${m.g('manometro')}${botella(312, yb + 6, 72, 26, { manometro: true, m })}${rotulo(312, yb + 98, 'polvo:', { size: TXT.min, estilo: 'serif', weight: 700 })}${rotulo(312, yb + 113, 'con manómetro', { size: TXT.min, estilo: 'serif' })}</g>`);
}

function llama(x, y, s = 1) {
  return `<path d="M${f1(x)},${f1(y)} C${f1(x - 12 * s)},${f1(y - 8 * s)} ${f1(x - 6 * s)},${f1(y - 22 * s)} ${f1(x - 2 * s)},${f1(y - 30 * s)} C${f1(x + 2 * s)},${f1(y - 20 * s)} ${f1(x + 10 * s)},${f1(y - 16 * s)} ${f1(x + 6 * s)},${f1(y - 40 * s)} C${f1(x + 18 * s)},${f1(y - 24 * s)} ${f1(x + 16 * s)},${f1(y - 8 * s)} ${f1(x + 12 * s)},${f1(y)}Z" fill="${T.naranja}" stroke="${T.rojo}" stroke-width="1.4"/>`;
}

function vistaUso(out, y0, m) {
  out.push(cap(16, y0 + 18, 'CÓMO SE USA'));
  out.push(serif(16, y0 + 38, 'Antes: alarma, para el motor, corta combustible', { size: TXT.min }), serif(16, y0 + 54, 'y electricidad; quita el pasador y prueba.', { size: TXT.min }));
  const yd = y0 + 152;
  out.push(`<rect x="12" y="${yd}" width="${W - 24}" height="6" fill="${T.casco}" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(`${m.g('viento')}${[0, 16].map((dy) => flecha(16, y0 + 76 + dy, 58, y0 + 76 + dy, { color: T.azul, w: m.on('viento') ? 2.4 : 1.8 })).join('')}${serif(16, y0 + 118, 'viento', { weight: 700, color: T.azulTxt, size: TXT.min })}${serif(16, y0 + 133, 'a la espalda', { color: m.c('viento', T.azulTxt), weight: m.on('viento') ? 700 : 400, size: TXT.min })}</g>`);
  const px = 104;
  out.push(`<g stroke="${T.tinta}" stroke-width="2.4" stroke-linecap="round" fill="none"><circle cx="${px}" cy="${yd - 64}" r="7" fill="${T.papel}"/><line x1="${px}" y1="${yd - 57}" x2="${px}" y2="${yd - 26}"/><line x1="${px}" y1="${yd - 26}" x2="${px - 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 26}" x2="${px + 8}" y2="${yd}"/><line x1="${px}" y1="${yd - 50}" x2="${px + 16}" y2="${yd - 38}"/></g>`);
  out.push(`<rect x="${px + 12}" y="${yd - 42}" width="9" height="22" rx="3" fill="${T.rojo}" stroke="${T.tinta}"/>`);
  out.push(`${m.g('base')}<path d="M${px + 20},${yd - 40} L${px + 116},${yd - 8} L${px + 114},${yd - 2} Z" fill="${T.agua}"/>${flecha(px + 22, yd - 38, px + 114, yd - 6, { color: m.c('base', T.verdeTxt), w: 2 })}${serif(px + 22, yd - 74, 'apunta a la base', { weight: 700, color: m.c('base', T.verdeTxt), size: TXT.min })}${serif(px + 22, yd - 59, 'de las llamas', { color: m.c('base', T.verdeTxt), size: TXT.min })}</g>`);
  out.push(llama(232, yd - 1, 0.9), llama(256, yd - 1, 1.15), llama(284, yd - 1, 1));
  out.push(`${m.g('barrer')}${flecha(224, yd + 22, 306, yd + 22, { color: m.c('barrer'), w: 2 })}${rotulo(265, yd + 40, 'barre del borde cercano', { size: TXT.min, estilo: 'serif', weight: 700, color: m.c('barrer') })}${rotulo(265, yd + 55, 'hacia el fondo', { size: TXT.min, estilo: 'serif', weight: 700, color: m.c('barrer') })}</g>`);
  out.push(`${m.g('salida')}${flecha(90, yd + 22, 26, yd + 22, { color: m.c('salida', T.apagado), w: 1.8, discontinua: true })}${serif(20, yd + 40, 'salida libre detrás', { size: TXT.min, weight: m.on('salida') ? 700 : 400, color: m.c('salida') })}</g>`);
  out.push(rotulo(W / 2, yd + 78, 'De barlovento a sotavento. Se vacía en segundos.', { size: TXT.min, estilo: 'serif', italic: true }));
}

function vistaNorma() {
  const H = 430;
  const alt = 'Lo que pide el RD 339/2021 (artículo 15) a los barcos sin marcado CE: extintores portátiles de eficacia 34 B y al menos 2 kg de agente. Por eslora: menos de 10 m con espacio habitable cerrado, uno; de 10 a menos de 15 m, uno; de 15 a menos de 20, dos; de 20 a 24, tres. Por motor: hasta 25 kW, uno (no con fueraborda); de 25 a 220 kW, uno; más de 220 kW, una capacidad B = 0,3 · P. Uno, al alcance del puesto de gobierno. Con marcado CE, los del manual del fabricante. Debajo, la revisión: cada tres meses, cada año y la prueba de presión cada cinco años.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(cartela(W / 2, 30, 'CADA EXTINTOR', 'eficacia 34 B · 2 kg de agente o más', { ancho: 270, color: T.magenta }));
  const tabla = (y, titulo, filas) => {
    out.push(cap(16, y, titulo));
    filas.forEach(([a, b], i) => {
      const yy = y + 22 + i * 22;
      out.push(linea(14, yy - 15, W - 14, yy - 15, { w: 0.5 }), serif(18, yy, a, { size: TXT.min }), mono(W - 18, yy, b, { anchor: 'end', weight: 700 }));
    });
  };
  tabla(70, 'POR ESLORA', [['L &lt; 10 m, con espacio habitable cerrado', '1'], ['10 ≤ L &lt; 15 m', '1'], ['15 ≤ L &lt; 20 m', '2'], ['20 ≤ L ≤ 24 m', '3']]);
  tabla(182, 'POR MOTOR (cada cámara, si es intraborda)', [['P ≤ 25 kW', '1*'], ['25 &lt; P ≤ 220 kW', '1'], ['P &gt; 220 kW', 'B = 0,3 · P']]);
  out.push(serif(18, 264, '* No se exige con fueraborda. Con menos de 10 m, los', { size: TXT.min, italic: true, color: T.apagado }), serif(18, 279, 'del motor valen también para la eslora.', { size: TXT.min, italic: true, color: T.apagado }));
  out.push(serif(18, 302, 'Ejemplo: 250 kW → 75 B → tres de 34 B.', { size: TXT.min, weight: 700 }));
  out.push(panelNotas(314, H));
  out.push(serif(18, 334, 'Uno, a mano desde el puesto de gobierno. Con más de', { size: TXT.min }), serif(18, 350, '50 V o propulsión eléctrica, uno apto con tensión;', { size: TXT.min }), serif(18, 366, 'con motor de GLP, uno para fuegos de gases.', { size: TXT.min }));
  out.push(serif(18, 390, 'Con marcado CE: los que diga el manual.', { weight: 700 }));
  out.push(mono(18, 414, '3 meses · 1 año · 5 años', { anchor: 'start', weight: 700, color: T.magenta }), serif(196, 414, 'revisión y prueba', { size: TXT.min, italic: true }));
  out.push(cierra());
  return out.join('');
}

export function extintorC(spec = {}) {
  const vista = spec.vista ?? 'ambas';
  if (vista === 'norma') return lista(spec.resaltar).length ? null : { svg: vistaNorma(), caption: 'Sin marcado CE (y en los de uso comercial), el RD 339/2021 pide extintores de eficacia 34 B con al menos 2 kg de agente: por eslora (uno, uno, dos o tres) y por motor (uno hasta 220 kW; por encima, 0,3 B por kW). Uno, a mano desde el puesto de gobierno. Con marcado CE, los que diga el manual del fabricante.' };
  const validas = vista === 'co2' ? PARTES_CO2 : vista === 'uso' ? PARTES_USO : vista === 'ambas' ? [...PARTES_CO2, ...PARTES_USO] : null;
  if (!validas) return null;
  const m = marcasDe(spec, validas);
  if (!m) return null;
  if (vista === 'co2') {
    const { out, cierra } = lienzo(W, 186, 'Un extintor de CO₂, rojo, con sus rasgos rotulados: no lleva manómetro (su carga se controla pesándolo), lleva precinto y pasador, una etiqueta con las instrucciones y una boquilla ancha en forma de trompa que no se agarra porque se enfría mucho. Al lado, uno de polvo, que sí lleva manómetro.');
    vistaCO2(out, 0, m);
    out.push(cierra());
    return { svg: out.join(''), caption: 'El de CO₂ no lleva manómetro (su carga se controla pesándolo) y tiene una boquilla ancha en forma de trompa que no se agarra, porque se enfría muchísimo. El de polvo sí lleva manómetro. Todos llevan etiqueta con instrucciones y precinto.' };
  }
  if (vista === 'uso') {
    const { out, cierra } = lienzo(W, 254, 'Una persona usa un extintor con el viento a la espalda y una salida libre detrás: apunta el chorro a la base de las llamas y barre desde el borde más cercano hacia el fondo.');
    vistaUso(out, 0, m);
    out.push(cierra());
    return { svg: out.join(''), caption: 'Con el viento a la espalda y una salida libre detrás, apunta a la base de las llamas y barre desde el borde más cercano hacia el fondo, avanzando a medida que el fuego retrocede.' };
  }
  const { out, cierra } = lienzo(W, 446, 'Arriba, un extintor de CO₂: sin manómetro, con precinto, etiqueta y boquilla en trompa; al lado, uno de polvo con manómetro. Abajo, cómo se usa: viento a la espalda, salida libre detrás, a la base de las llamas y barriendo del borde cercano al fondo.');
  vistaCO2(out, 0, m);
  out.push(filete(186));
  vistaUso(out, 188, m);
  out.push(cierra());
  return { svg: out.join(''), caption: 'El de CO₂ se reconoce porque no lleva manómetro (se pesa) y tiene una boquilla ancha en trompa que no se agarra. Para usar cualquier extintor: viento a la espalda, salida libre detrás, a la base de las llamas y barriendo del borde cercano al fondo.' };
}

// ===========================================================================
// Avisos a los Navegantes y radioavisos (py-3-7). Fuente: Grupo Especial de Avisos a los Navegantes del IHM, avisos
// generales 2(G) «Radioavisos» y 3(G) «Mantenimiento de las cartas»; NAVTEX: Manual NAVTEX de la OMI (MSC.1/Circ.1403).

export const AVISOS_PARTES = ['permanentes', 'temporales', 'preliminares', 'generales', 'margen'];
export const RADIO_PARTES = ['navarea', 'navtex', 'vhf'];

const lapiz = (x, y) => `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="0" y="-3.5" width="24" height="7" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width=".9"/><rect x="24" y="-3.5" width="5" height="7" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".9"/><path d="M0,-3.5 L-8,0 L0,3.5Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width=".9"/></g>`;
const pluma = (x, y) => `<g transform="translate(${x} ${y}) rotate(-35)"><rect x="2" y="-3.8" width="27" height="7.6" rx="2" fill="${T.azul}" stroke="${T.tinta}" stroke-width=".9"/><path d="M2,-3.8 L-9,0 L2,3.8Z" fill="${T.tinta}"/></g>`;

function correccion(m) {
  const H = 372;
  const alt = 'Los cuatro tipos de Avisos a los Navegantes y cómo se llevan a la carta: los permanentes, cambios definitivos, con tinta indeleble; los temporales y los preliminares, a lápiz; los generales no corrigen ninguna carta. Debajo, una carta con un anexo gráfico pegado y, en su margen inferior, el registro de cada corrección con su año y su número.';
  const { out, pt, cierra } = lienzo(W, H, alt);
  const filas = [['permanentes', 'Permanentes', 'Con tinta indeleble', 'cambio definitivo', 'tinta'], ['temporales', 'Temporales', 'A lápiz', 'se borran al cancelarse', 'lapiz'], ['preliminares', 'Preliminares', 'A lápiz', 'anuncian un cambio que llegará', 'lapiz'], ['generales', 'Generales', 'No corrigen cartas', 'información general', 'no']];
  filas.forEach(([k, nombre, como, nota, ic], i) => {
    const y = 16 + i * 50;
    const s = [m.g(k), `<rect x="14" y="${y}" width="96" height="38" fill="${T.papel}" stroke="${m.c(k)}" stroke-width="${m.on(k) ? 2.2 : 1}"/>`, rotulo(62, y + 24, nombre, { size: TXT.min, estilo: 'serif', weight: 700, color: m.c(k) })];
    if (ic === 'tinta') s.push(pluma(124, y + 26), linea(146, y + 30, 160, y + 30, { w: 3 }));
    if (ic === 'lapiz') s.push(lapiz(124, y + 26), linea(146, y + 30, 160, y + 30, { color: T.apagado, w: 1.6, extra: 'stroke-dasharray="3 2"' }));
    if (ic === 'no') s.push(`<rect x="120" y="${y + 8}" width="28" height="22" fill="${T.agua}" stroke="${T.tinta}"/>`, tacha(134, y + 19, 11));
    s.push(serif(170, y + 16, como, { weight: 700, color: ic === 'no' ? T.magenta : T.tinta }), serif(170, y + 33, nota, { size: TXT.min, italic: true }), '</g>');
    out.push(s.join(''));
  });
  const yc = 230;
  const s = [m.g('margen'), `<rect x="14" y="${yc}" width="${W - 28}" height="66" fill="${T.agua2}" stroke="${T.tinta}"/>`];
  s.push(`<path d="M14,${yc} L130,${yc} C112,${yc + 16} 80,${yc + 18} 60,${yc + 34} C44,${yc + 46} 28,${yc + 44} 14,${yc + 52}Z" fill="${T.tierra}" stroke="${T.tinta}"/><path d="M14,${yc} L130,${yc} C112,${yc + 16} 80,${yc + 18} 60,${yc + 34} C44,${yc + 46} 28,${yc + 44} 14,${yc + 52}Z" fill="${pt}" opacity=".5"/>`);
  s.push(`<rect x="214" y="${yc + 10}" width="96" height="44" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2" stroke-dasharray="4 2"/>`, rotulo(262, yc + 30, 'anexo gráfico', { size: TXT.min, estilo: 'serif', weight: 700 }), rotulo(262, yc + 46, '(se pega)', { size: TXT.min, estilo: 'serif', italic: true }));
  s.push(`<rect x="14" y="${yc + 66}" width="${W - 28}" height="22" fill="${T.papel}" stroke="${m.c('margen')}" stroke-width="${m.on('margen') ? 2.2 : 1}"/>`, mono(22, yc + 82, '2024: 32/127(1); 44/203(2)', { anchor: 'start', weight: 600 }));
  s.push(serif(W - 16, yc + 108, 'margen inferior: año y número de cada', { anchor: 'end', size: TXT.min, weight: m.on('margen') ? 700 : 400, color: m.c('margen') }), serif(W - 16, yc + 124, 'aviso, con su orden de corrección', { anchor: 'end', size: TXT.min, weight: m.on('margen') ? 700 : 400, color: m.c('margen') }), '</g>');
  out.push(s.join(''));
  out.push(cierra());
  return out.join('');
}

function radioavisos(m) {
  const H = 380;
  const alt = 'Arriba, dos cajas: los Avisos a los Navegantes, el boletín semanal del Instituto Hidrográfico de la Marina que mantiene al día cartas y publicaciones, y los radioavisos, para lo urgente, anunciados con SÉCURITÉ. Debajo, sus tres tipos, de mayor a menor alcance: NAVAREA (21 zonas; España coordina la III, Mediterráneo y mar Negro), costeros por NAVTEX (518 kHz en inglés, 490 kHz en el idioma del país; en España los coordina Salvamento Marítimo) y locales, en los puertos.';
  const { out, cierra } = lienzo(W, H, alt);
  const caja = (x, w, tit, lineas, color) => {
    out.push(`<rect x="${x}" y="14" width="${w}" height="104" fill="${T.papel}" stroke="${color}" stroke-width="1.4"/>`, rotulo(x + w / 2, 34, tit, { size: TXT.min, estilo: 'cap', weight: 700, color, espacio: 0.6 }));
    lineas.forEach(([t, b], i) => out.push(serif(x + 8, 56 + i * 17, t, { size: TXT.min, weight: b ? 700 : 400 })));
  };
  caja(14, 172, 'AVISOS NAVEGANTES', [['Grupo semanal del IHM:', true], ['mantiene al día las', false], ['cartas y publicaciones', false], ['(es obligatorio).', false]], T.azulTxt);
  caja(192, 152, 'RADIOAVISOS', [['Lo urgente, por radio:', true], ['no espera al boletín.', false], ['Se anuncian con', false], ['SÉCURITÉ', true]], T.magenta);
  const filas = [['navarea', 'NAVAREA', ['21 zonas en el mundo; España', 'coordina la III (Mediterráneo', 'y mar Negro). El Atlántico: la II.'], 30], ['navtex', 'Costeros · NAVTEX', ['518 kHz en inglés; 490 kHz en', 'el idioma del país. En España,', 'los coordina Salvamento Marítimo.'], 20], ['vhf', 'Locales', ['Aguas interiores y de los puertos:', 'no son del sistema mundial.'], 10]];
  let y = 132;
  for (const [k, nom, lineas, r] of filas) {
    const h = 30 + lineas.length * 16;
    const o = [m.g(k), `<rect x="14" y="${y}" width="${W - 28}" height="${h}" fill="${m.on(k) ? T.agua2 : 'none'}" stroke="${m.c(k, T.apagado)}" stroke-width="${m.on(k) ? 2.2 : 0.8}"/>`];
    const [cx, cy] = [46, y + h / 2];
    for (const rr of [10, 20, 30]) if (rr <= h / 2) o.push(`<circle cx="${cx}" cy="${f1(cy)}" r="${rr}" fill="none" stroke="${rr === r ? T.magenta : T.apagado}" stroke-width="${rr === r ? 2 : 0.8}"/>`);
    o.push(`<circle cx="${cx}" cy="${f1(cy)}" r="2.5" fill="${T.tinta}"/>`, serif(86, y + 20, nom, { weight: 700, color: m.c(k) }));
    lineas.forEach((l, i) => o.push(serif(86, y + 38 + i * 16, l, { size: TXT.min })));
    o.push('</g>');
    out.push(o.join(''));
    y += h + 6;
  }
  out.push(cierra());
  return out.join('');
}

export function avisosNavegantesC(spec = {}) {
  const vista = spec.vista ?? 'correccion';
  if (vista === 'radioavisos') {
    const m = marcasDe(spec, RADIO_PARTES);
    if (!m) return null;
    const cap = {
      navarea: 'NAVAREA: el Servicio Mundial de Radioavisos Náuticos divide el mundo en 21 zonas; España, a través del Instituto Hidrográfico de la Marina, coordina la III (Mediterráneo y mar Negro). Los de la NAVAREA II (Atlántico) también se recogen en el Grupo semanal.',
      navtex: 'Radioavisos costeros por NAVTEX: 518 kHz en inglés y 490 kHz en el idioma del país. En España, el coordinador nacional es Salvamento Marítimo.',
      vhf: 'Radioavisos locales: aguas interiores y de los puertos, a menudo de la Autoridad Portuaria; no forman parte del sistema mundial.',
    };
    const sel = RADIO_PARTES.filter((p) => m.on(p));
    return { svg: radioavisos(m), caption: sel.length === 1 ? cap[sel[0]] : 'Los Avisos a los Navegantes son el boletín semanal del IHM que mantiene al día cartas y publicaciones. Lo urgente no espera: va por radioaviso, NAVAREA, costeros por NAVTEX y locales, anunciados con la palabra SÉCURITÉ.' };
  }
  if (vista !== 'correccion') return null;
  const m = marcasDe(spec, AVISOS_PARTES);
  if (!m) return null;
  const cap = {
    permanentes: 'Los avisos permanentes son cambios definitivos: se pasan a la carta con tinta indeleble.',
    temporales: 'Los temporales (una luz apagada, unas obras) se anotan a lápiz y se borran al cancelarse.',
    preliminares: 'Los preliminares anuncian un cambio que llegará: también se anotan a lápiz.',
    generales: 'Los avisos generales son información general: no corrigen cartas.',
    margen: 'Cada corrección se registra con su año y su número en el bloque de correcciones del margen inferior de la carta. Si el cambio es difícil de describir, el aviso trae un anexo gráfico que se pega encima.',
  };
  const sel = AVISOS_PARTES.filter((p) => m.on(p));
  return { svg: correccion(m), caption: sel.length === 1 ? cap[sel[0]] : 'Permanentes, con tinta indeleble; temporales y preliminares, a lápiz; los generales no corrigen cartas. Cada corrección se apunta con su año y su número en el margen inferior, y si una zona cambia mucho se pega el anexo gráfico del aviso.' };
}
