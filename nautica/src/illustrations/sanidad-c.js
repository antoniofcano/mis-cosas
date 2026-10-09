// Láminas de sanidad a bordo del PER (per-8-1, 8-2, 8-3 y 8-9) en estilo C (docs/ESTILO-LAMINAS.md). Mismos tipos,
// parámetros y `resaltar` que las láminas a las que sustituyen (un `resaltar` que no es de la vista no cambia nada).
// Fuente: Guía Sanitaria a Bordo, Instituto Social de la Marina, 2013 (capítulos que cita cada lámina) y, para el
// botiquín de recreo, el Real Decreto 339/2021 (arts. 13.2 y 24). Lo que la Guía no dice no se dibuja; lo que choca
// con el curso o con la práctica actual está anotado en .trabajo-ux/ESTADO-per-laminas.md (p. ej., el torniquete no
// lleva la pauta de aflojarlo). Figuras esquemáticas, sin sangre realista. Solo colores T.*. Sin DOM.
//   hemorragia: { vista: 'tipos'|'parar'|'torniquete', resaltar? }                                     (per-8-1)
//   quemadura:  { vista: 'grados'|'enfriar'|'gravedad', resaltar? }                                    (per-8-2)
//   golpe-calor: { resaltar? }                                                                          (per-8-2)
//   radio-medico: { resaltar?: 'radio'|'telefono' }                                                     (per-8-3)
//   botiquin:   { resaltar?: 'zonas-1-4'|'zonas-5-7'|'guia' }                                          (per-8-3)
//   hipotermia: { postura: 'atender' } (las demás posturas, en per-cola-c.js)                           (per-8-9)

import { T, TXT, lienzo, rotulo, etiqueta, flecha, referencia, paso, f1 } from './estilo-c.js';
import { W, serif, mono, linea, panelNotas, tacha, bien, pts, lista } from './kit-lecciones-c.js';

/** Resaltado permisivo: solo cuentan las partes de la vista. */
function marca(spec, validas) {
  const hl = new Set(lista(spec.resaltar).filter((k) => validas.includes(k)));
  const on = (k) => hl.has(k);
  return {
    hl, on,
    c: (k, b = T.tinta) => (on(k) ? T.magenta : b),
    g: (k) => `<g data-parte="${k}"${hl.size && !on(k) ? ' opacity=".45"' : ''}>`,
    texto: (cap, def) => (hl.size ? [...hl].map((k) => cap[k]).filter(Boolean).join(' ') || def : def),
  };
}
const centrado = (x, y, t, o = {}) => serif(x, y, t, { anchor: 'middle', size: TXT.min, ...o });
const lineas = (x, y, ls, o = {}, p = 16) => ls.map((l, i) => serif(x, y + i * p, l, { size: TXT.min, ...o })).join('');
const versal = (x, y, t, o = {}) => rotulo(x, y, t, { size: TXT.min, estilo: 'cap', weight: 700, ...o });
const recuadro = (x, y, w, h, { on = false, borde = T.tinta, fondo = T.papel } = {}) =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fondo}" stroke="${on ? T.magenta : borde}" stroke-width="${on ? 2.2 : 0.9}"/>`;
/** Brazo, pierna o tronco: trazo grueso con contorno de tinta. */
const miembro = (p, w = 12, relleno = T.casco) =>
  `<polyline points="${pts(p)}" fill="none" stroke="${T.tinta}" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<polyline points="${pts(p)}" fill="none" stroke="${relleno}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cabeza = (x, y, r = 12) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`;
/** Gota con la punta hacia arriba. */
const gota = (x, y, s, color = T.rojo) => `<path d="M${f1(x)},${f1(y - 1.6 * s)} C${f1(x + 1.1 * s)},${f1(y - 0.3 * s)} ${f1(x + s)},${f1(y + s)} ${f1(x)},${f1(y + s)} C${f1(x - s)},${f1(y + s)} ${f1(x - 1.1 * s)},${f1(y - 0.3 * s)} ${f1(x)},${f1(y - 1.6 * s)}Z" fill="${color}" stroke="${T.tinta}" stroke-width=".7"/>`;
/** Sangre oscura (venosa): el rojo de la lámina con un velo oscuro encima; en los dos temas, más oscura que la arterial. */
const oscura = (forma) => `${forma.replace(/fill="[^"]*"/, `fill="${T.rojo}"`)}${forma.replace(/fill="[^"]*"/, `fill="${T.negro}" fill-opacity=".4"`)}`;
/** Grifo con su chorro; (x, y) es la boca. */
const grifo = (x, y, h = 26) => `<path d="M${x - 24},${y - 14} H${x + 4} Q${x + 10},${y - 14} ${x + 10},${y - 8} V${y} H${x} V${y - 6} H${x - 24}Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>` +
  `<rect x="${x + 1}" y="${y + 2}" width="8" height="${h}" rx="3" fill="${T.agua}" stroke="${T.lineaAgua}" stroke-width="1"/>`;
/** Esfera de minutos con el sector de m1 (y, más claro, hasta m2). */
function minutos(cx, cy, r, m1, m2 = null) {
  const sector = (m, op) => {
    const a = (m / 60) * 2 * Math.PI;
    return `<path d="M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${m > 30 ? 1 : 0} 1 ${f1(cx + Math.sin(a) * r)},${f1(cy - Math.cos(a) * r)}Z" fill="${T.azul}" fill-opacity="${op}"/>`;
  };
  const o = [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/>`];
  if (m2) o.push(sector(m2, 0.3));
  o.push(sector(m1, 0.75));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    o.push(linea(cx + Math.sin(a) * (r - 3), cy - Math.cos(a) * (r - 3), cx + Math.sin(a) * r, cy - Math.cos(a) * r, { w: 1 }));
  }
  return o.join('');
}
/** Línea con aspa magenta delante: lo que no se hace. */
const no = (x, y, t, o = {}) => tacha(x + 5, y - 4, 4.5) + serif(x + 16, y, t, { size: TXT.min, color: T.magenta, weight: 700, ...o });
/** Pasos numerados con dos o más líneas: [[parte, [líneas]]]; devuelve el SVG y la y siguiente. */
function pasos(m, x, y, lista_, { gap = 12, sep = 16 } = {}) {
  const out = [];
  lista_.forEach(([k, ls], i) => {
    out.push(`${m.g(k)}${paso(x + 9, y - 4, i + 1, { color: m.c(k) })}${lineas(x + 26, y, ls, { color: m.c(k), weight: m.on(k) ? 700 : 400 }, sep)}</g>`);
    y += ls.length * sep + gap;
  });
  return { svg: out.join(''), y };
}

// ===========================================================================
// Hemorragias (per-8-1). Guía, cap. 1 «V. Detener las hemorragias» y cap. 7 «Hemorragias».

export const PARTES_HEMO_TIPOS = ['arterial', 'venosa', 'capilar'];
export const PARTES_HEMO_PARAR = ['presion', 'elevar', 'vendaje', 'torniquete'];
export const PARTES_TORNIQUETE = ['ultimo-recurso', 'hueso', 'hora', 'radio'];

function hemorragiaTipos(spec) {
  const m = marca(spec, PARTES_HEMO_TIPOS);
  const H = 336;
  const alt = 'Tres cortes de la piel. Arterial: sangre rojo vivo que sale a borbotones, al ritmo del pulso; es la más peligrosa. Venosa: sangre rojo oscuro que sale de forma continua y con poca presión. Capilar: la sangre rezuma en sábana, como en un rasguño, y para sola pronto.';
  const { out, cierra } = lienzo(W, H, alt);
  const cols = [
    ['arterial', 66, 'ARTERIAL', ['rojo vivo', 'a borbotones,', 'al ritmo', 'del pulso']],
    ['venosa', 179, 'VENOSA', ['rojo oscuro', 'continua,', 'con poca', 'presión']],
    ['capilar', 292, 'CAPILAR', ['rezuma', 'en sábana', '(un rasguño);', 'para sola']],
  ];
  const yp = 98;
  for (const [k, x, nombre, t] of cols) {
    const o = [m.g(k), recuadro(x - 54, 14, 108, 236, { on: m.on(k) }), versal(x, 36, nombre, { color: m.c(k) })];
    o.push(`<rect x="${x - 44}" y="${yp}" width="88" height="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width=".9"/>`);
    if (k === 'capilar') {
      for (let i = 0; i < 7; i++) o.push(`<path d="M${x - 36 + i * 11},${yp + 18} q3,6 5.5,0 q3,-6 5.5,0" fill="none" stroke="${T.rojo}" stroke-width="1.2"/>`);
      for (let i = 0; i < 10; i++) o.push(`<circle cx="${x - 36 + i * 8}" cy="${yp - 3}" r="2" fill="${T.rojo}"/>`);
      o.push(`<rect x="${x - 38}" y="${yp - 6}" width="76" height="4" rx="2" fill="${T.rojo}" fill-opacity=".45"/>`);
    } else {
      const vaso = `<rect x="${x - 44}" y="${yp + 16}" width="88" height="12" rx="6" fill="x" stroke="${T.tinta}" stroke-width="1"/>`;
      const herida = `<rect x="${x - 3}" y="${yp}" width="6" height="16" fill="x"/>`;
      o.push(k === 'venosa' ? oscura(vaso) + oscura(herida) : vaso.replace('fill="x"', `fill="${T.rojo}"`) + herida.replace('fill="x"', `fill="${T.rojo}"`));
      if (k === 'arterial') {
        for (const [gx, gy, s] of [[x, 82, 4.6], [x + 13, 66, 3.8], [x - 12, 70, 3.4], [x + 3, 52, 3]]) o.push(gota(gx, gy, s));
        o.push(`<path d="M${x - 30},${yp - 30} l6,0 3,-8 4,14 3,-6 6,0" fill="none" stroke="${T.tinta}" stroke-width="1.2"/>`);
      } else {
        const chorro = `<path d="M${x},${yp} Q${x + 2},${yp - 10} ${x + 16},${yp - 8} Q${x + 28},${yp - 6} ${x + 30},${yp + 6}" fill="none" stroke="x" stroke-width="5" stroke-linecap="round"/>`;
        o.push(chorro.replace('stroke="x"', `stroke="${T.rojo}"`), chorro.replace('stroke="x"', `stroke="${T.negro}" stroke-opacity=".4"`));
      }
    }
    o.push(lineas(x, 152, t, { anchor: 'middle', weight: m.on(k) ? 700 : 400 }));
    if (k === 'arterial') o.push(centrado(x, 228, 'la más peligrosa', { weight: 700, color: T.magenta }));
    o.push('</g>');
    out.push(o.join(''));
  }
  out.push(panelNotas(260, H), serif(16, 282, 'Arteria: rojo vivo y a borbotones.', { weight: 700 }), serif(16, 300, 'Vena: rojo oscuro y continua.', { weight: 700 }));
  out.push(serif(16, 320, 'Hemorragia: la sangre sale por la rotura de un vaso.', { size: TXT.min, italic: true }));
  out.push(cierra());
  const CAP = {
    arterial: 'La arterial sale rojo vivo y a borbotones, al ritmo del pulso: es la más peligrosa.',
    venosa: 'La venosa sale rojo oscuro, de forma continua y con poca presión.',
    capilar: 'La capilar rezuma en sábana, como en un rasguño, y para sola en poco tiempo.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'La arterial sale rojo vivo y a borbotones, al ritmo del pulso, y es la más peligrosa; la venosa, rojo oscuro, continua y con poca presión; la capilar rezuma y para sola en poco tiempo.') };
}

function hemorragiaParar(spec) {
  const m = marca(spec, PARTES_HEMO_PARAR);
  const H = 432;
  const alt = 'Un herido sentado con el brazo levantado por encima del nivel del corazón mientras se aprieta la herida del antebrazo con una gasa. Pasos: presión directa con gasas o un paño limpio, 10 minutos como mínimo; elevar el brazo o la pierna por encima del corazón si no duele mucho; si se empapa, más gasas encima sin quitar las primeras. Nunca bajar el miembro ni dejarlo de pie. El torniquete, solo como último recurso.';
  const { out, cierra } = lienzo(W, H, alt);
  // figura: tronco, cabeza, corazón y el brazo herido en alto
  const yc = 146;
  out.push(linea(14, yc, 168, yc, { w: 1, color: T.apagado, extra: 'stroke-dasharray="5 4"' }), lineas(106, yc + 18, ['nivel del', 'corazón'], { italic: true, color: T.apagado }, 15));
  out.push(`<path d="M40,240 L40,140 Q40,122 58,120 L80,120 Q98,122 98,140 L98,240Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, cabeza(69, 100, 15));
  out.push(`<path d="M58,${yc + 9} C49,${yc + 1} 51,${yc - 7} 58,${yc - 3} C65,${yc - 7} 67,${yc + 1} 58,${yc + 9}Z" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".7"/>`);
  out.push(miembro([[46, 128], [34, 172], [40, 214]], 11));
  out.push(`${m.g('elevar')}${miembro([[92, 126], [122, 108], [128, 54]], 12)}${flecha(150, 132, 150, 66, { color: m.c('elevar', T.azul), w: m.on('elevar') ? 2.4 : 1.6 })}</g>`);
  out.push(`${m.g('presion')}<rect x="117" y="72" width="18" height="20" fill="${T.blanco}" stroke="${m.c('presion')}" stroke-width="${m.on('presion') ? 2.2 : 1.2}" transform="rotate(8 126 82)"/>` +
    `<ellipse cx="114" cy="84" rx="9" ry="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>${flecha(92, 86, 108, 84, { color: m.c('presion', T.tinta), w: 1.4 })}</g>`);
  out.push(no(14, 266, 'nunca bajarlo'), no(14, 288, 'que no esté de pie'));
  // pasos a la derecha
  const r = pasos(m, 178, 40, [
    ['presion', ['Presión directa', 'con gasas o un', 'paño limpio,', '10 min como', 'mínimo']],
    ['elevar', ['Eleva brazo o', 'pierna sobre el', 'corazón (si no', 'duele mucho)']],
    ['vendaje', ['Si se empapa,', 'más gasas encima,', 'sin quitar ni', 'soltar']],
  ], { gap: 10, sep: 15 });
  out.push(r.svg);
  out.push(`${m.g('torniquete')}${recuadro(12, 304, W - 24, 64, { on: m.on('torniquete') })}${versal(22, 324, 'TORNIQUETE: EL ÚLTIMO RECURSO', { anchor: 'start', color: m.c('torniquete') })}` +
    `${lineas(22, 344, ['Solo si la presión no basta y la hemorragia de', 'un brazo o una pierna sigue siendo grave.'], {})}</g>`);
  out.push(panelNotas(378, H), serif(16, 400, 'No levantes las gasas para mirar.', { size: TXT.min, weight: 700 }), serif(16, 418, 'Después, consejo médico por radio.', { size: TXT.min }));
  out.push(cierra());
  const CAP = {
    presion: 'Lo primero, presión directa y firme sobre la herida con gasas o un paño limpio, 10 minutos como mínimo y sin levantarlas.',
    elevar: 'En un brazo o una pierna, elévalo por encima del corazón mientras aprietas, salvo que le duela mucho; nunca lo bajes.',
    vendaje: 'Si la gasa se empapa, pon más encima sin quitar las primeras ni dejar de apretar.',
    torniquete: 'El torniquete es el último recurso: solo si la presión no controla una hemorragia grave de un miembro.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Primero, presión directa y firme sobre la herida, 10 minutos como mínimo; en un brazo o una pierna, elévalo por encima del corazón y nunca lo bajes; si se empapa, más gasas encima. El torniquete, solo si la presión no controla una hemorragia que amenaza la vida.') };
}

function hemorragiaTorniquete(spec) {
  const m = marca(spec, PARTES_TORNIQUETE);
  const H = 436;
  const alt = 'Un brazo extendido desde el tronco con una herida que sangra en el antebrazo. El torniquete está en el brazo, entre la herida y el tronco, donde solo hay un hueso (el antebrazo tiene dos), y lleva anotada la hora en que se puso. Es el último recurso: solo si la presión directa no controla una hemorragia que amenaza la vida; después, consejo médico por radio.';
  const { out, cierra } = lienzo(W, H, alt);
  // tronco y brazo con sus huesos
  out.push(`<path d="M5,48 L52,48 Q64,50 64,64 L64,178 L5,178Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, centrado(34, 194, 'tronco', { italic: true }));
  out.push(miembro([[58, 96], [180, 100], [300, 108]], 26));
  out.push(`<ellipse cx="318" cy="109" rx="16" ry="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`);
  out.push(`${m.g('hueso')}${linea(74, 97, 172, 100, { color: T.apagado, w: 4, extra: 'stroke-linecap="round"' })}` +
    `${linea(190, 95, 292, 102, { color: T.apagado, w: 3, extra: 'stroke-linecap="round"' })}${linea(190, 106, 292, 112, { color: T.apagado, w: 3, extra: 'stroke-linecap="round"' })}` +
    `${centrado(100, 142, 'un hueso', { weight: 700, color: m.c('hueso') })}${centrado(248, 142, 'dos huesos', { color: T.apagado })}</g>`);
  // herida
  out.push(`<ellipse cx="256" cy="104" rx="9" ry="6" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".8"/>`, gota(262, 124, 3), referencia(256, 96, 256, 58), centrado(256, 52, 'herida', { weight: 700 }));
  // torniquete: banda con su palo
  const xt = 130;
  out.push(`${m.g('hueso')}<rect x="${xt - 7}" y="80" width="14" height="38" fill="${T.papel}" stroke="${m.on('hueso') ? T.magenta : T.tinta}" stroke-width="${m.on('hueso') ? 2.4 : 1.6}"/>` +
    `${linea(xt - 18, 76, xt + 18, 72, { w: 4, color: T.apagado, extra: 'stroke-linecap="round"' })}${referencia(xt, 70, xt, 46)}${centrado(xt, 40, 'torniquete', { weight: 700, color: T.magenta })}</g>`);
  out.push(`${m.g('hora')}${referencia(xt + 6, 118, 172, 168)}${etiqueta(182, 176, '14:35', { color: m.c('hora') })}${serif(210, 180, 'la hora, anotada', { size: TXT.min, italic: true })}</g>`);
  out.push(cotaEntre(64, 250, 204));
  const r = pasos(m, 12, 256, [
    ['ultimo-recurso', ['Solo si la presión directa no controla una', 'hemorragia que amenaza la vida.']],
    ['hueso', ['En el brazo o el muslo (un solo hueso),', 'entre la herida y el tronco.']],
    ['hora', ['Anota la hora en que lo pones.']],
    ['radio', ['Pide consejo médico por radio cuanto antes.']],
  ]);
  out.push(r.svg);
  out.push(cierra());
  const CAP = {
    'ultimo-recurso': 'El torniquete es el último recurso: solo cuando la presión directa no controla una hemorragia que amenaza la vida.',
    hueso: 'Se pone en el brazo o en el muslo, donde solo hay un hueso, entre la herida y el tronco.',
    hora: 'Se anota la hora en que se coloca.',
    radio: 'Y se pide consejo médico por radio cuanto antes.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'El torniquete es el último recurso: solo si la presión directa no controla una hemorragia que amenaza la vida. Va en el brazo o el muslo, entre la herida y el tronco; se anota la hora y se pide consejo médico por radio.') };
}
/** Cota «entre la herida y el tronco» bajo el brazo. */
const cotaEntre = (x1, x2, y) => `<g>${linea(x1, y, x2, y, { w: 1, color: T.magenta })}${linea(x1, y - 5, x1, y + 5, { w: 1.2, color: T.magenta })}${linea(x2, y - 5, x2, y + 5, { w: 1.2, color: T.magenta })}${rotulo((x1 + x2) / 2, y + 22, 'entre la herida y el tronco', { size: TXT.min, estilo: 'serif', italic: true, color: T.magenta })}</g>`;

export function hemorragiaC(spec = {}) {
  const v = spec.vista ?? 'tipos';
  if (v === 'parar') return hemorragiaParar(spec);
  if (v === 'torniquete') return hemorragiaTorniquete(spec);
  return hemorragiaTipos(spec);
}

// ===========================================================================
// Quemaduras (per-8-2). Guía, cap. 2 «Quemaduras (calor, químicas, eléctricas)» y cap. 7 «Quemaduras».

export const PARTES_GRADOS = ['primero', 'segundo', 'tercero'];
export const PARTES_ENFRIAR = ['termica', 'quimica'];
export const PARTES_GRAVEDAD = ['extension', 'a-bordo', 'evacuar'];

function quemaduraGrados(spec) {
  const m = marca(spec, PARTES_GRADOS);
  const H = 350;
  const alt = 'Tres cortes de la piel con sus capas. Primer grado: solo la capa superficial, piel enrojecida y dolorosa, sin secuelas. Segundo grado: llega a la capa profunda, con ampollas de líquido claro y dolor intenso; suele dejar cicatriz. Tercer grado: destruye todas las capas, lesión negruzca que no duele.';
  const { out, cierra } = lienzo(W, H, alt);
  const cols = [
    ['primero', 66, '1.er grado', 1, ['capa superficial', 'piel roja', 'y dolor', 'sin secuelas']],
    ['segundo', 179, '2.º grado', 2, ['capa profunda', 'ampollas de', 'líquido claro', 'dolor intenso', 'suele dejar', 'cicatriz']],
    ['tercero', 292, '3.er grado', 3, ['todas las capas', 'negruzca', 'no duele']],
  ];
  const y0 = 66;
  const alt_ = [12, 18, 22];
  const capas = [T.casco, T.tierra, T.papel];
  for (const [k, x, nombre, n, t] of cols) {
    const o = [m.g(k), recuadro(x - 54, 14, 108, 234, { on: m.on(k) }), centrado(x, 38, nombre, { size: TXT.nombre, weight: 700, color: m.c(k) })];
    let yy = y0;
    alt_.forEach((h, i) => { o.push(`<rect x="${x - 40}" y="${yy}" width="80" height="${h}" fill="${capas[i]}" stroke="${T.tinta}" stroke-width=".7"/>`); yy += h; });
    const prof = alt_.slice(0, n).reduce((a, b) => a + b, 0);
    o.push(n === 3 ? `<rect x="${x - 20}" y="${y0}" width="40" height="${prof}" fill="${T.negro}" fill-opacity=".8"/>` : `<rect x="${x - 20}" y="${y0}" width="40" height="${prof}" fill="${T.rojo}" fill-opacity=".6"/>`);
    o.push(`<rect x="${x - 20}" y="${y0}" width="40" height="${prof}" fill="none" stroke="${m.c(k)}" stroke-width="${m.on(k) ? 2 : 1.1}" stroke-dasharray="3 2"/>`);
    if (n === 2) o.push(`<path d="M${x - 14},${y0} Q${x},${y0 - 18} ${x + 14},${y0}Z" fill="${T.blanco}" stroke="${T.tinta}" stroke-width="1.1"/>`);
    o.push(linea(x + 46, y0, x + 46, y0 + prof, { color: m.c(k, T.rojoTxt), w: 2.4 }));
    o.push(lineas(x, 136, t, { anchor: 'middle', weight: m.on(k) ? 700 : 400 }));
    o.push('</g>');
    out.push(o.join(''));
  }
  out.push(panelNotas(258, H), serif(16, 280, 'En una misma quemadura suelen convivir', { weight: 700 }), serif(16, 298, 'varios grados.', { weight: 700 }));
  out.push(serif(16, 320, 'La gravedad depende también de la extensión,', { size: TXT.min, italic: true }), serif(16, 336, 'la zona, la edad y la salud del herido.', { size: TXT.min, italic: true }));
  out.push(cierra());
  const CAP = {
    primero: 'Primer grado: solo la capa superficial; piel enrojecida y dolor, sin secuelas.',
    segundo: 'Segundo grado: llega a la capa profunda; ampollas de líquido claro y dolor intenso; suele dejar cicatriz.',
    tercero: 'Tercer grado: destruye todas las capas de la piel; lesión negruzca que no duele.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Primer grado: piel enrojecida y dolorosa, sin ampollas. Segundo grado: ampollas de líquido claro y dolor intenso. Tercer grado: destruye todas las capas, la lesión es negruzca y no duele.') };
}

function quemaduraEnfriar(spec) {
  const m = marca(spec, PARTES_ENFRIAR);
  const H = 360;
  const alt = 'Dos columnas. Quemadura térmica: agua fría enseguida, quitar anillos y relojes, cortar la ropa sin tirar si está pegada, no enfriar todo el cuerpo si es extensa, no romper las ampollas ni poner nada encima. Quemadura química: agua abundante, 15 a 20 minutos como mínimo, quitar la ropa manchada sin que el producto toque piel sana y protegerse; en el ojo, 15 a 20 minutos lavando de dentro hacia fuera.';
  const { out, cierra } = lienzo(W, H, alt);
  // térmica
  out.push(m.g('termica'), recuadro(12, 14, 164, 278, { on: m.on('termica') }), versal(94, 34, 'TÉRMICA', { color: m.c('termica') }), grifo(70, 62));
  out.push(serif(22, 116, 'Agua fría, ya', { weight: 700, color: m.c('termica') }));
  out.push(lineas(22, 140, ['Quita anillos y relojes', 'Corta la ropa; si está', 'pegada, no tires']));
  out.push(no(18, 206, 'si es extensa, no'), serif(34, 222, 'enfríes todo el cuerpo', { size: TXT.min, color: T.magenta, weight: 700 }), no(18, 248, 'no rompas ampollas'), no(18, 272, 'nada encima'));
  out.push('</g>');
  // química
  out.push(m.g('quimica'), recuadro(182, 14, 164, 278, { on: m.on('quimica') }), versal(264, 34, 'QUÍMICA', { color: m.c('quimica') }), grifo(222, 62), minutos(300, 72, 22, 15, 20));
  out.push(serif(192, 116, 'Agua abundante', { weight: 700, color: m.c('quimica') }), mono(192, 136, '15–20 min mínimo', { anchor: 'start', weight: 700, color: m.c('quimica') }));
  out.push(lineas(192, 160, ['Quita la ropa manchada', 'sin que toque piel sana', 'y protégete tú']));
  out.push(serif(192, 218, 'En el ojo:', { size: TXT.min, weight: 700 }), lineas(192, 236, ['15–20 min, lavando', 'de dentro hacia fuera']));
  out.push('</g>');
  out.push(panelNotas(300, H), serif(16, 322, 'Primero el agua: no tapes ni untes nada antes.', { size: TXT.min, weight: 700 }), serif(16, 340, 'Después, consejo médico por radio.', { size: TXT.min }));
  out.push(cierra());
  const CAP = {
    termica: 'La térmica se enfría enseguida con agua fría, sin enfriar todo el cuerpo si es extensa; se quitan anillos y relojes, no se rompen las ampollas y no se pone nada encima.',
    quimica: 'La química se lava con agua abundante durante 15 a 20 minutos como mínimo, quitando la ropa manchada; en el ojo, igual de tiempo, de dentro hacia fuera.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'La térmica, con agua fría enseguida y sin enfriar todo el cuerpo; la química, con agua abundante de 15 a 20 minutos como mínimo, también en el ojo. Nada encima antes de lavar.') };
}

function quemaduraGravedad(spec) {
  const m = marca(spec, PARTES_GRAVEDAD);
  const H = 436;
  const alt = 'Cuánto abarca una quemadura con la regla de los nueves: cabeza y cuello 9 %, cada brazo 9 %, tronco 18 % por delante y 18 % por detrás, cada pierna 18 % y genitales 1 %; la palma de la mano del herido es el 1 %. Sin lesión por inhalación, se pueden tratar a bordo las de primer grado de menos del 20 %, las de segundo de menos del 10 % y las de tercero de menos del 1 %; las demás, y las de cara, cuello, manos, pies, genitales, pliegues u orificios, se evacúan.';
  const { out, cierra } = lienzo(W, H, alt);
  // cuerpo de frente con los porcentajes
  out.push(m.g('extension'));
  out.push(miembro([[80, 156], [76, 236]], 17), miembro([[100, 156], [104, 236]], 17));
  out.push(miembro([[66, 72], [46, 142]], 12), miembro([[114, 72], [134, 142]], 12));
  out.push(`<path d="M64,66 Q90,58 116,66 L114,158 L66,158Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/>`, cabeza(90, 42, 14));
  out.push(etiqueta(126, 34, '9 %'), etiqueta(30, 112, '9 %'), etiqueta(150, 112, '9 %'), etiqueta(90, 108, '18 %'), etiqueta(46, 210, '18 %'), etiqueta(134, 210, '18 %'), etiqueta(90, 172, '1 %'));
  out.push(serif(186, 36, 'Regla de los nueves', { weight: 700, size: TXT.nota, color: m.c('extension') }));
  out.push(lineas(186, 58, ['cabeza y cuello: 9 %', 'cada brazo: 9 %', 'tronco: 18 % delante', 'y 18 % detrás', 'cada pierna: 18 %', 'genitales: 1 %']));
  // palma de la mano
  out.push(`<path d="M196,186 Q194,168 202,166 L202,152 Q202,146 207,146 Q212,146 212,152 L212,164 L214,148 Q214,142 219,142 Q224,142 224,148 L223,164 L226,152 Q226,146 231,147 Q236,148 235,154 L232,174 L238,166 Q242,160 247,164 Q250,168 246,174 L234,194 Q228,206 214,206 Q198,206 196,186Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(serif(256, 176, 'su palma:', { size: TXT.min, weight: 700 }), mono(256, 194, '1 %', { anchor: 'start', weight: 700, size: TXT.rotulo }));
  out.push('</g>');
  // a bordo o evacuar
  out.push(`${m.g('a-bordo')}${recuadro(12, 250, W - 24, 104, { on: m.on('a-bordo') })}${versal(22, 270, 'SE PUEDE TRATAR A BORDO', { anchor: 'start', color: m.c('a-bordo') })}`);
  [['1.er grado', '&lt; 20 %'], ['2.º grado', '&lt; 10 %'], ['3.er grado', '&lt; 1 %']].forEach(([g, c], i) => out.push(serif(22, 292 + i * 18, g, { size: TXT.min }), mono(176, 292 + i * 18, c, { anchor: 'start', weight: 700 })));
  out.push(serif(22, 344, 'si no hay lesión por inhalación', { size: TXT.min, italic: true }), '</g>');
  out.push(`${m.g('evacuar')}${recuadro(12, 362, W - 24, 62, { on: m.on('evacuar') })}${versal(22, 382, 'EVACUAR', { anchor: 'start', color: m.c('evacuar', T.magenta) })}` +
    `${lineas(22, 400, ['Las demás, y las de cara, cuello, manos, pies,', 'genitales, pliegues u orificios.'])}</g>`);
  out.push(cierra());
  const CAP = {
    extension: 'La extensión se calcula con la regla de los nueves (cabeza 9 %, cada brazo 9 %, tronco 18 % delante y 18 % detrás, cada pierna 18 %, genitales 1 %) o con la palma del herido, que es el 1 %.',
    'a-bordo': 'Sin lesión por inhalación, se pueden tratar a bordo las de primer grado de menos del 20 %, las de segundo de menos del 10 % y las de tercero de menos del 1 %.',
    evacuar: 'Las demás se evacúan, y también las de cara, cuello, manos, pies, genitales, pliegues u orificios.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'La palma del herido es el 1 % de su piel. A bordo se tratan las de primer grado de menos del 20 %, las de segundo de menos del 10 % y las de tercero de menos del 1 %; las demás y las de cara, manos, pies, genitales o pliegues, se evacúan.') };
}

export function quemaduraC(spec = {}) {
  const v = spec.vista ?? 'grados';
  if (v === 'enfriar') return quemaduraEnfriar(spec);
  if (v === 'gravedad') return quemaduraGravedad(spec);
  return quemaduraGrados(spec);
}

// ===========================================================================
// Golpe de calor (per-8-2). Guía, cap. 2 «Accidentes por calor: golpe de calor» y cap. 7 «Lesiones por calor».

export const PARTES_CALOR = ['fresco', 'enfriar', 'beber', 'temperatura'];

export function golpeCalorC(spec = {}) {
  const m = marca(spec, PARTES_CALOR);
  const H = 460;
  const alt = 'Golpe de calor: más de 40 °C, piel roja, caliente y seca, confusión, pulso rápido y sed. Un herido tumbado a la sombra al que se moja con agua fría, y un termómetro: se baja la temperatura hasta 39 °C y se deja de enfriar al llegar a 38,5 °C. Pasos: lugar fresco, seco y ventilado y quitarle la ropa; ducha o paños de agua fría, unos 20 °C; si está consciente, suero oral en agua fresca; medir cada 10 minutos. Ni alcohol ni estimulantes.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(versal(16, 32, 'SE SOSPECHA SI', { anchor: 'start', color: T.apagado }));
  out.push(lineas(16, 52, ['mucho rato con calor', 'y humedad; piel roja,', 'caliente y seca;', 'confuso; pulso rápido', 'y sed']));
  // termómetro
  const xt = 322;
  const yT = (t) => 50 + (41 - t) * 36;
  out.push(`<rect x="${xt - 6}" y="36" width="12" height="${f1(yT(37) - 30)}" rx="6" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.2"/><circle cx="${xt}" cy="${f1(yT(37) + 14)}" r="11" fill="${T.rojo}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(`<rect x="${xt - 3}" y="${f1(yT(40.5))}" width="6" height="${f1(yT(37) + 6 - yT(40.5))}" fill="${T.rojo}"/>`);
  for (const t of [37, 38, 39, 40, 41]) out.push(linea(xt + 6, yT(t), xt + 13, yT(t), { w: 1 }), mono(xt + 15, yT(t) + 4, String(t), { anchor: 'start', size: TXT.min }));
  out.push(serif(xt - 24, yT(40) + 4, 'más de 40 °C', { anchor: 'end', weight: 700, color: T.rojoTxt }));
  out.push(`${m.g('temperatura')}${flecha(xt - 16, yT(40.4), xt - 16, yT(39) - 2, { color: m.c('temperatura', T.azul), w: 1.6 })}` +
    `${linea(xt - 8, yT(39), xt + 6, yT(39), { w: 2, color: m.c('temperatura', T.azul) })}${serif(xt - 22, yT(39) + 4, 'baja hasta 39 °C', { anchor: 'end', weight: 700, color: m.c('temperatura') })}` +
    `${linea(xt - 8, yT(38.5), xt + 6, yT(38.5), { w: 2, color: T.magenta })}${serif(xt - 12, yT(38.5) + 14, 'a 38,5 °C, para', { anchor: 'end', weight: 700, color: T.magenta })}</g>`);
  // herido a la sombra, mojado con agua fría
  out.push('<g transform="translate(0 -18)">', `${m.g('fresco')}<path d="M14,190 L196,182" stroke="${T.tinta}" stroke-width="1.6"/><path d="M14,190 L196,182 L196,192 L14,200Z" fill="${T.apagado}" fill-opacity=".35"/>` +
    `${linea(20, 200, 20, 252, { w: 1.4 })}${linea(190, 192, 190, 252, { w: 1.4 })}${serif(30, 216, 'a la sombra', { size: TXT.min, italic: true, color: m.c('fresco') })}</g>`);
  out.push(linea(10, 254, 200, 254, { w: 1.6 }), miembro([[60, 240], [168, 242]], 16), cabeza(46, 238, 11));
  out.push(`${m.g('enfriar')}`);
  for (let i = 0; i < 5; i++) out.push(linea(104 + i * 14, 206 + (i % 2) * 4, 102 + i * 14, 222 + (i % 2) * 4, { color: T.azul, w: 1.6, extra: 'stroke-linecap="round"' }));
  out.push(`<rect x="90" y="230" width="22" height="7" fill="${T.agua}" stroke="${T.lineaAgua}"/><rect x="40" y="225" width="14" height="5" fill="${T.agua}" stroke="${T.lineaAgua}"/></g>`, '</g>');
  const r = pasos(m, 12, 266, [
    ['fresco', ['A un sitio fresco, seco y ventilado;', 'quítale la ropa.']],
    ['enfriar', ['Enfríalo ya: ducha o paños de agua fría', '(unos 20 °C).']],
    ['beber', ['Consciente: suero oral en agua fresca.']],
    ['temperatura', ['Hasta 39 °C; mídela cada 10 min y, si', 'sube otra vez, vuelve a enfriar.']],
  ], { gap: 8 });
  out.push(r.svg, no(14, r.y + 6, 'Ni alcohol ni estimulantes.'), serif(16, r.y + 30, 'Y consejo médico por radio.', { weight: 700 }));
  out.push(cierra());
  const CAP = {
    fresco: 'Llévalo a un lugar fresco, seco y bien ventilado y quítale la ropa.',
    enfriar: 'Enfríalo enseguida con una ducha o paños de agua fría, a unos 20 °C.',
    beber: 'Si está consciente, dale suero oral disuelto en agua fresca.',
    temperatura: 'Baja la temperatura hasta 39 °C y contrólala cada 10 minutos; no sigas enfriando al llegar a 38,5 °C.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Golpe de calor: a un lugar fresco y ventilado, sin ropa, y enfriarlo ya con agua fría (unos 20 °C) hasta 39 °C, controlando cada 10 minutos; se deja de enfriar a 38,5 °C. Ni alcohol ni estimulantes.') };
}

// ===========================================================================
// Centro Radio-Médico Español (per-8-3). Guía, cap. 4 «Asistencia médica a distancia».

export const PARTES_RADIO = ['radio', 'telefono'];

export function radioMedicoC(spec = {}) {
  const m = marca(spec, PARTES_RADIO);
  const H = 404;
  const alt = 'Dos vías hasta el Centro Radio-Médico Español, del Instituto Social de la Marina, en Madrid. Por radio, pidiendo a una estación costera una «consulta médica», gratuita y con prioridad. Por teléfono, al 91 310 34 75, también por satélite o telefonía móvil. Atiende las 24 horas todos los días, gratis y en español; las consultas no urgentes, mejor de 9:00 a 15:00, hora de Madrid.';
  const { out, cierra } = lienzo(W, H, alt);
  // centro radio-médico
  out.push(recuadro(234, 60, 112, 176, { borde: T.tinta }), `<rect x="237" y="63" width="106" height="170" fill="none" stroke="${T.tinta}" stroke-width=".5"/>`);
  out.push(versal(290, 84, 'CRME'), lineas(290, 108, ['Centro', 'Radio-Médico', 'Español'], { anchor: 'middle', weight: 700 }), lineas(290, 168, ['del ISM,', 'en Madrid'], { anchor: 'middle', italic: true }));
  // por radio: barco, costera
  out.push(m.g('radio'), versal(16, 30, 'POR RADIO', { anchor: 'start', color: m.c('radio') }), serif(16, 48, '«consulta médica» a una estación costera', { size: TXT.min, weight: 700, color: m.c('radio') }));
  out.push(`<rect x="5" y="112" width="120" height="18" fill="${T.agua}"/>`, linea(5, 112, 125, 112, { color: T.lineaAgua, w: 1.2 }));
  out.push(`<path d="M20,102 L92,102 L84,118 L28,118Z" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="42" y="88" width="24" height="14" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.1"/>`, linea(60, 88, 60, 66, { w: 1.6 }));
  for (const r of [6, 11]) out.push(`<path d="M${60 + r * 0.7},${66 - r * 0.7} A${r},${r} 0 0 1 ${60 + r * 0.7},${66 + r * 0.7}" fill="none" stroke="${m.c('radio', T.azul)}" stroke-width="1.6"/>`);
  out.push(`<path d="M170,128 L178,74 L186,128Z M173,110 L183,110 M175,94 L181,94" fill="none" stroke="${T.tinta}" stroke-width="1.6"/><circle cx="178" cy="71" r="3" fill="${T.tinta}"/>`, centrado(178, 146, 'costera', { italic: true }));
  out.push(flecha(80, 72, 166, 78, { color: m.c('radio', T.azul), w: m.on('radio') ? 2.4 : 1.6 }), flecha(190, 82, 232, 98, { color: m.c('radio', T.azul), w: m.on('radio') ? 2.4 : 1.6 }));
  out.push(serif(16, 166, 'gratis y con prioridad', { size: TXT.min, italic: true }), '</g>');
  // por teléfono
  out.push(m.g('telefono'), `<rect x="18" y="186" width="22" height="40" rx="4" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.3"/><rect x="22" y="192" width="14" height="22" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".6"/>`);
  out.push(versal(52, 192, 'POR TELÉFONO', { anchor: 'start', color: m.c('telefono') }), mono(52, 214, '91 310 34 75', { anchor: 'start', weight: 700, size: TXT.nombre, color: m.c('telefono') }));
  out.push(flecha(52, 226, 232, 226, { color: m.c('telefono', T.azul), w: m.on('telefono') ? 2.4 : 1.6 }), serif(16, 248, 'también por satélite o por móvil', { size: TXT.min, italic: true }), '</g>');
  out.push(panelNotas(262, H), bien(24, 282, 6), serif(38, 287, '24 horas, todos los días, gratis', { weight: 700 }), bien(24, 306, 6), serif(38, 311, 'en español', { weight: 700 }));
  out.push(serif(16, 336, 'No urgentes: de 9:00 a 15:00 (hora de Madrid).', { size: TXT.min }), serif(16, 354, 'Antes de llamar, apunta los datos del barco', { size: TXT.min }), serif(16, 370, 'y del paciente. Habla despacio y claro.', { size: TXT.min }));
  out.push(cierra());
  const CAP = {
    radio: 'Por radio, a través de una estación costera, indicando que es para «consulta médica»: es gratuita y tiene prioridad.',
    telefono: 'Por teléfono, directamente al Centro Radio-Médico Español: 91 310 34 75, también por satélite o telefonía móvil.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Al Centro Radio-Médico Español se llega por radio, pidiendo a una estación costera una «consulta médica», o por teléfono, al 91 310 34 75. Atiende gratis, en español, las 24 horas de todos los días.') };
}

// ===========================================================================
// Botiquín de una embarcación de recreo (per-8-3). Real Decreto 339/2021, arts. 13.2 y 24; Guía, cap. 5.

export const PARTES_BOTIQUIN = ['zonas-1-4', 'zonas-5-7', 'guia'];

export function botiquinC(spec = {}) {
  const m = marca(spec, PARTES_BOTIQUIN);
  const H = 440;
  const alt = 'Las siete zonas de navegación. Sin tripulación profesional, en las zonas 1 a 4 el botiquín es obligatorio, con el contenido del tipo «Balsas de Salvamento» del anexo II del RD 258/1999; en las zonas 5 a 7 no es obligatorio. Si se lleva botiquín, también la Guía Sanitaria a Bordo. Con tripulación profesional rige el RD 258/1999: botiquín A, B o C según lo lejos que navegue.';
  const { out, cierra } = lienzo(W, H, alt);
  out.push(serif(16, 30, 'Recreo sin tripulación profesional, por zona:', { size: TXT.min, weight: 700 }));
  const x0 = 14;
  const w = 330 / 7;
  for (let z = 1; z <= 7; z++) {
    const x = x0 + (z - 1) * w;
    const obl = z <= 4;
    out.push(`<rect x="${f1(x)}" y="42" width="${f1(w - 4)}" height="28" fill="${T.papel}" stroke="${T.tinta}" stroke-width="${obl ? 2 : 0.9}"/>`, mono(x + (w - 4) / 2, 61, String(z), { weight: 700, size: TXT.rotulo }));
  }
  const llave = (xa, xb, y, k) => `<path d="M${f1(xa)},${y} v6 H${f1(xb)} v-6 M${f1((xa + xb) / 2)},${y + 6} v7" fill="none" stroke="${m.c(k)}" stroke-width="${m.on(k) ? 2.2 : 1.2}"/>`;
  const c14 = x0 + 2 * w - 2;
  const c57 = x0 + 5.5 * w - 2;
  out.push(`${m.g('zonas-1-4')}${llave(x0, x0 + 4 * w - 4, 76, 'zonas-1-4')}${versal(c14, 108, 'OBLIGATORIO', { color: m.c('zonas-1-4') })}` +
    `${lineas(c14, 128, ['contenido idéntico al', 'tipo «Balsas de', 'Salvamento»'], { anchor: 'middle', weight: 700 })}${centrado(c14, 180, '(anexo II, RD 258/1999)', { italic: true })}</g>`);
  out.push(`${m.g('zonas-5-7')}${llave(x0 + 4 * w, x0 + 7 * w - 4, 76, 'zonas-5-7')}${versal(c57, 108, 'NO OBLIGATORIO', { color: m.c('zonas-5-7') })}${lineas(c57, 128, ['la norma no', 'lo exige'], { anchor: 'middle' })}</g>`);
  // la Guía Sanitaria
  out.push(`${m.g('guia')}${recuadro(12, 196, W - 24, 70, { on: m.on('guia') })}` +
    `<rect x="24" y="212" width="34" height="26" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M37,217 h8 v5 h5 v6 h-5 v5 h-8 v-5 h-5 v-6 h5Z" fill="${T.rojo}" stroke="${T.tinta}" stroke-width=".6"/>` +
    `${serif(66, 230, '+', { weight: 700, size: TXT.nombre })}<path d="M80,212 L98,216 L116,212 L116,242 L98,246 L80,242Z M98,216 L98,246" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/>` +
    `${lineas(126, 220, ['Si llevas botiquín, lleva', 'la Guía Sanitaria a Bordo', '(la edita el ISM, gratuita)'], { color: m.c('guia') })}</g>`);
  // con tripulación profesional
  out.push(recuadro(12, 278, W - 24, 102), versal(22, 298, 'CON TRIPULACIÓN PROFESIONAL', { anchor: 'start', color: T.apagado }), serif(22, 316, 'RD 258/1999, según la distancia a la costa:', { size: TXT.min }));
  [['A', 'más de 150 millas'], ['B', 'de 60 a 150 millas'], ['C', 'hasta 60 millas']].forEach(([t, d], i) => out.push(mono(30, 336 + i * 18, t, { weight: 700 }), serif(46, 336 + i * 18, d, { size: TXT.min })));
  out.push(panelNotas(390, H), serif(16, 410, 'Caducado, cuando es obligatorio: infracción', { size: TXT.min, weight: 700 }), serif(16, 428, 'grave (RD 339/2021, art. 24).', { size: TXT.min, weight: 700 }));
  out.push(cierra());
  const CAP = {
    'zonas-1-4': 'Sin tripulación profesional, en las zonas 1 a 4 el botiquín es obligatorio y su contenido, idéntico al del tipo «Balsas de Salvamento» del RD 258/1999.',
    'zonas-5-7': 'En las zonas 5, 6 y 7 la norma no exige botiquín.',
    guia: 'Toda embarcación de recreo que lleve botiquín debe llevar también la Guía Sanitaria a Bordo.',
  };
  return { svg: out.join(''), caption: m.texto(CAP, 'Sin tripulación profesional, en zonas 1 a 4 el botiquín es obligatorio, con el contenido del tipo «Balsas de Salvamento»; en zonas 5, 6 y 7 no lo es. Quien lleve botiquín debe llevar también la Guía Sanitaria a Bordo.') };
}

// ===========================================================================
// Hipotermia: atender al rescatado (per-8-9). Guía, cap. 2 «Accidentes por frío: hipotermia» y cap. 7 «Asistencia a
// náufragos y rescatados».

export function hipotermiaAtenderC() {
  const H = 420;
  const alt = 'Un rescatado con hipotermia tumbado en horizontal, a resguardo del viento, envuelto en una manta que le cubre también la cabeza, con ropa seca, y una taza de bebida caliente y azucarada. Si no basta, dos personas abrazadas a él y envueltas también en mantas. Ni frotarle ni sacudirle; ni alcohol, ni café, ni tabaco; consejo médico por radio.';
  const { out, ray, cierra } = lienzo(W, H, alt);
  // viento cortado
  out.push(flecha(18, 40, 70, 40, { color: T.azul, w: 1.6 }), tacha(44, 40, 7), serif(18, 66, 'sin corrientes', { size: TXT.min, italic: true }));
  // litera y herido tumbado con manta
  out.push(`<rect x="40" y="150" width="240" height="12" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  out.push(`<path d="M50,132 Q50,104 74,104 Q94,106 92,130 L90,150 L54,150Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.2"/>`, cabeza(68, 132, 10));
  out.push(`<path d="M84,118 Q160,104 266,118 Q274,134 266,150 L84,150Z" fill="${T.naranja}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M84,118 Q160,104 266,118 Q274,134 266,150 L84,150Z" fill="${ray}" opacity=".35"/>`);
  out.push(referencia(66, 112, 110, 70), serif(114, 66, 'manta, también', { size: TXT.min, weight: 700 }), serif(114, 82, 'por la cabeza', { size: TXT.min, weight: 700 }));
  out.push(referencia(200, 116, 214, 96), serif(218, 96, 'ropa seca', { size: TXT.min, weight: 700 }));
  out.push(cota(40, 176, 280, 176), centrado(160, 196, 'en horizontal', { italic: true }));
  // taza caliente
  out.push(`<path d="M300,124 L326,124 L322,152 L304,152Z" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.3"/><path d="M326,130 q10,2 0,14" fill="none" stroke="${T.tinta}" stroke-width="1.3"/>`);
  for (const dx of [306, 314, 322]) out.push(`<path d="M${dx},118 q-4,-6 0,-12 q4,-6 0,-12" fill="none" stroke="${T.apagado}" stroke-width="1.2"/>`);
  out.push(centrado(316, 172, 'caliente', { weight: 700 }), centrado(316, 188, 'y dulce', { weight: 700 }));
  const L = [
    ['A un sitio cálido y sin corrientes de aire.'],
    ['Fuera la ropa mojada: ropa seca y manta,', 'cubriendo también la cabeza.'],
    ['Si está consciente: líquidos calientes', 'y azucarados.'],
    ['Si no basta: dos personas abrazadas a él,', 'envueltas también en mantas.'],
  ];
  let y = 228;
  L.forEach((ls, i) => { out.push(paso(21, y - 4, i + 1, { color: T.tinta }), lineas(38, y, ls)); y += ls.length * 16 + 8; });
  out.push(no(14, y + 4, 'Ni frotarle ni sacudirle.'), no(14, y + 26, 'Ni alcohol, ni café, ni tabaco.'), serif(16, y + 52, 'Y consejo médico por radio.', { weight: 700 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Al rescatado con hipotermia: a un sitio cálido y sin corrientes, en horizontal; ropa mojada fuera, ropa seca y manta, también por la cabeza; si está consciente, bebidas calientes y azucaradas. Nunca frotarle ni sacudirle, ni darle alcohol o café.' };
}
const cota = (x1, y1, x2, y2) => `${linea(x1, y1, x2, y2, { w: 0.9, color: T.apagado })}${linea(x1, y1 - 5, x1, y1 + 5, { w: 1, color: T.apagado })}${linea(x2, y2 - 5, x2, y2 + 5, { w: 1, color: T.apagado })}`;
