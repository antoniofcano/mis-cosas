// Láminas de sanidad a bordo: hemorragias (tipos y cómo pararlas), quemaduras (grados y cómo enfriarlas),
// contacto con el Centro Radio-Médico Español y botiquín según zona. Cada función es pura: spec → { svg, caption }.
// Todo lo que dicen sale de las lecciones per-8-1, per-8-2 y per-8-3. Figuras esquemáticas, sin sangre realista.

import { open, title, arrow, fx } from '../kit.js';

const RED = 'var(--l-r)';
const OSCURA = '#8a1c1c';
const PIEL = 'var(--l-calido)';
const AGUA = 'var(--l-v)';

/** Texto de lámina con un único atributo style (color, tamaño y grosor). */
function tx(x, y, t, { c = null, anchor = 'start', bold = false, size = null } = {}) {
  const st = [c ? `fill:${c}` : '', size ? `font-size:${size}px` : '', bold ? 'font-weight:700' : ''].filter(Boolean).join(';');
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${anchor}"${st ? ` style="${st}"` : ''}>${t}</text>`;
}
/** Varias líneas de texto seguidas. */
const lineas = (x, y, ls, opts = {}, paso = 13) => ls.map((l, i) => tx(x, y + i * paso, l, opts)).join('');
const lead = (x1, y1, x2, y2, c = 'currentColor') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${c}" stroke-width=".8" opacity=".75"/>`;
const hlSet = (r) => new Set(r == null ? [] : Array.isArray(r) ? r : [r]);
/** Recuadro de fondo para un bloque; más grueso y en rojo si está resaltado. */
const caja = (x, y, w, h, on = false, fill = 'none') => `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="7" style="fill:${fill}" stroke="${on ? RED : 'currentColor'}" stroke-width="${on ? 2.6 : 1}" ${on ? '' : 'stroke-opacity=".45"'}/>`;
/** Número de paso dentro de un círculo. */
const num = (x, y, n, on) => `<circle cx="${fx(x)}" cy="${fx(y)}" r="9" style="fill:${on ? RED : 'var(--l-g)'}"/>` + `<text x="${fx(x)}" y="${fx(y + 3.5)}" class="il-lbl" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:11px">${n}</text>`;
/** Gota esquemática con la punta hacia arriba. */
const gota = (x, y, s, c) => `<path d="M${fx(x)},${fx(y - 1.6 * s)} C${fx(x + 1.1 * s)},${fx(y - 0.3 * s)} ${fx(x + s)},${fx(y + s)} ${fx(x)},${fx(y + s)} C${fx(x - s)},${fx(y + s)} ${fx(x - 1.1 * s)},${fx(y - 0.3 * s)} ${fx(x)},${fx(y - 1.6 * s)}Z" style="fill:${c}" stroke="currentColor" stroke-width=".7"/>`;
const corazon = (x, y, s = 1) => `<path d="M${fx(x)},${fx(y + 7 * s)} C${fx(x - 9 * s)},${fx(y)} ${fx(x - 7 * s)},${fx(y - 7 * s)} ${fx(x)},${fx(y - 3 * s)} C${fx(x + 7 * s)},${fx(y - 7 * s)} ${fx(x + 9 * s)},${fx(y)} ${fx(x)},${fx(y + 7 * s)}Z" style="fill:${RED}"/>`;
/** Reloj con el sector de minutos sombreado (m1 mínimo; m2 opcional, «mejor»). */
function reloj(x, y, r, m1, m2 = null) {
  const sector = (m, op) => {
    const a = (m / 60) * 2 * Math.PI;
    const ex = x + Math.sin(a) * r;
    const ey = y - Math.cos(a) * r;
    return `<path d="M${fx(x)},${fx(y)} L${fx(x)},${fx(y - r)} A${r},${r} 0 ${m > 30 ? 1 : 0} 1 ${fx(ex)},${fx(ey)}Z" style="fill:${AGUA}" opacity="${op}"/>`;
  };
  let s = `<circle cx="${fx(x)}" cy="${fx(y)}" r="${r}" style="fill:var(--bg)" stroke="currentColor" stroke-width="1.4"/>`;
  if (m2) s += sector(m2, 0.3);
  s += sector(m1, 0.75);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    s += `<line x1="${fx(x + Math.sin(a) * (r - 3))}" y1="${fx(y - Math.cos(a) * (r - 3))}" x2="${fx(x + Math.sin(a) * r)}" y2="${fx(y - Math.cos(a) * r)}" stroke="currentColor" stroke-width="1"/>`;
  }
  return s;
}
/** Grifo esquemático con chorro de agua hacia abajo, boca en (x, y). */
const grifo = (x, y, h = 26) => `<path d="M${fx(x - 22)},${fx(y - 14)} L${fx(x + 4)},${fx(y - 14)} Q${fx(x + 8)},${fx(y - 14)} ${fx(x + 8)},${fx(y - 8)} L${fx(x + 8)},${fx(y)} L${fx(x - 2)},${fx(y)} L${fx(x - 2)},${fx(y - 6)} L${fx(x - 22)},${fx(y - 6)}Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>` +
  `<rect x="${fx(x - 1)}" y="${fx(y + 2)}" width="8" height="${h}" rx="3" style="fill:${AGUA}" opacity=".7"/>`;

// ---------------------------------------------------------------------------
// Hemorragias. spec: { tipo:'hemorragia', vista:'tipos'|'parar', resaltar? }
//   tipos: resaltar 'arterial'|'venosa'|'capilar'; parar: resaltar 'presion'|'elevar'|'vendaje'|'torniquete'.

function hemorragiaTipos(hl) {
  const W = 320;
  const H = 262;
  const out = open(W, H, 'Tipos de hemorragia', 'ht');
  out.push(title(160, 'Arterial, venosa o capilar'));
  const cols = [
    { k: 'arterial', x: 56, nombre: 'ARTERIAL', t: ['rojo vivo', 'a borbotones,', 'al ritmo del pulso'], extra: 'la más peligrosa' },
    { k: 'venosa', x: 160, nombre: 'VENOSA', t: ['rojo oscuro', 'continua,', 'con poca presión'] },
    { k: 'capilar', x: 264, nombre: 'CAPILAR', t: ['rezuma en sábana', '(un rasguño)', 'para sola pronto'] },
  ];
  const yv = 78;
  for (const { k, x, nombre, t, extra } of cols) {
    const on = hl.has(k);
    out.push(caja(x - 50, 34, 100, 186, on));
    // piel (franja) con el vaso o los capilares debajo
    out.push(`<rect x="${x - 44}" y="${yv - 18}" width="88" height="10" rx="2" style="fill:${PIEL}" stroke="currentColor" stroke-width=".8"/>`);
    if (k === 'capilar') {
      for (let i = 0; i < 7; i++) out.push(`<path d="M${x - 36 + i * 12},${yv - 4} q3,6 6,0 q3,-6 6,0" fill="none" stroke="${RED}" stroke-width="1" opacity=".8"/>`);
      for (let i = 0; i < 9; i++) out.push(`<circle cx="${x - 32 + i * 8}" cy="${yv - 21}" r="1.8" style="fill:${RED}"/>`);
      out.push(`<path d="M${x - 34},${yv - 20} L${x + 34},${yv - 20}" stroke="${RED}" stroke-width="3" opacity=".35" stroke-linecap="round"/>`);
    } else {
      const c = k === 'arterial' ? RED : OSCURA;
      out.push(`<rect x="${x - 44}" y="${yv}" width="88" height="12" rx="6" style="fill:${c}" stroke="currentColor" stroke-width="1"/>`);
      out.push(`<rect x="${x - 3}" y="${yv - 18}" width="6" height="18" style="fill:${c}"/>`);
      if (k === 'arterial') {
        // chorros a golpes: gotas separadas que salen hacia arriba (se encienden a pulsos)
        [[x, 50, 4.5], [x + 10, 40, 3.6], [x - 9, 42, 3.2]].forEach(([gx, gy, s], i) => {
          out.push(`<g>${gota(gx, gy, s, c)}<animate attributeName="opacity" values="1;.25;1" dur="1s" begin="${i * 0.15}s" repeatCount="indefinite"/></g>`);
        });
      } else {
        // flujo continuo que se derrama a un lado
        out.push(`<path d="M${x},${yv - 18} Q${x + 2},${yv - 26} ${x + 14},${yv - 24} Q${x + 24},${yv - 22} ${x + 26},${yv - 14}" fill="none" style="stroke:${c}" stroke-width="5" stroke-linecap="round"/>`);
      }
    }
    out.push(tx(x, 112, nombre, { anchor: 'middle', bold: true, c: on ? RED : null, size: 11.5 }));
    out.push(lineas(x, 132, t, { anchor: 'middle', bold: on }, 14));
    if (extra) out.push(tx(x, 186, extra, { anchor: 'middle', bold: true, c: RED }));
  }
  out.push(tx(160, 238, 'Vena: oscura y continua.', { anchor: 'middle', bold: true, size: 11 }));
  out.push(tx(160, 253, 'Arteria: viva y a borbotones.', { anchor: 'middle', bold: true, size: 11 }));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'La arterial sale rojo vivo y a borbotones, al ritmo del pulso, y es la más peligrosa; la venosa, rojo oscuro, continua y con poca presión; la capilar rezuma y para sola en poco tiempo.',
  };
}

function hemorragiaParar(hl) {
  const W = 320;
  const H = 318;
  const out = open(W, H, 'Cómo parar una hemorragia externa', 'hp');
  out.push(title(160, 'Hemorragia externa: qué hacer'));
  // Figura: herido de cintura para arriba con el antebrazo elevado y una mano que aprieta la gasa.
  const yc = 128; // altura del corazón
  out.push(`<line x1="14" y1="${yc}" x2="150" y2="${yc}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>`);
  out.push(lineas(98, yc + 13, ['nivel del', 'corazón'], { size: 9.5 }, 11));
  out.push(`<path d="M38,186 L38,128 Q38,112 56,110 L76,110 Q92,112 92,128 L92,186Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(`<circle cx="65" cy="92" r="13" style="fill:${PIEL}" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(corazon(56, yc - 2, 0.9));
  // brazo herido: hombro → codo → mano, por encima del corazón
  const arm = (pts, w) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" style="stroke:${PIEL}" stroke-width="${w - 2.6}" stroke-linecap="round" stroke-linejoin="round"/>`;
  out.push(arm([[86, 116], [108, 96], [118, 56]], 11));
  out.push(arm([[44, 118], [36, 150], [44, 176]], 11));
  // gasa sobre la herida del antebrazo y mano que aprieta
  const onP = hl.has('presion');
  out.push(`<rect x="106" y="68" width="16" height="18" rx="2" transform="rotate(14 114 77)" style="fill:#fff" stroke="${onP ? RED : 'currentColor'}" stroke-width="${onP ? 2.2 : 1.2}"/>`);
  out.push(`<ellipse cx="134" cy="80" rx="12" ry="8" style="fill:${PIEL}" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(arrow(152, 82, 126, 79, 'r', 'hp', 2.2));
  const onE = hl.has('elevar');
  out.push(arrow(126, 120, 126, 60, onE ? 'r' : 'g', 'hp', onE ? 2.6 : 1.6));
  // Pasos a la derecha
  const pasos = [
    ['presion', 1, 46, ['Presión directa', 'y firme con gasas', 'o un paño limpio;', 'si se empapa, más', 'encima sin quitar']],
    ['elevar', 2, 130, ['Eleva el miembro', 'sobre el corazón;', 'nunca lo bajes']],
    ['vendaje', 3, 186, ['Vendaje compresivo', 'cuando ceda']],
  ];
  for (const [k, n, y, ls] of pasos) {
    const on = hl.has(k);
    out.push(num(172, y, n, on));
    out.push(tx(186, y + 4, ls[0], { bold: true, c: on ? RED : null, size: 11 }));
    out.push(lineas(186, y + 18, ls.slice(1), {}, 13));
  }
  // Torniquete
  const onT = hl.has('torniquete');
  out.push(caja(10, 218, 300, 92, onT));
  out.push(tx(20, 236, 'Torniquete: no es lo primero', { bold: true, c: onT ? RED : null, size: 11 }));
  out.push(lineas(20, 252, [
    'Solo si la hemorragia de un miembro amenaza la vida',
    'y la presión directa no la controla; entonces, ya.',
    '5–7 cm por encima de la herida (no en una articulación),',
    'material ancho; anota la hora y no lo aflojes.',
  ], {}, 14));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'Primero, presión directa y firme sobre la herida; en un brazo o una pierna, elévalo por encima del corazón y nunca lo bajes; cuando ceda, vendaje compresivo. El torniquete solo si la presión no controla una hemorragia que amenaza la vida.',
  };
}

export function hemorragiaIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  return (spec.vista ?? 'tipos') === 'parar' ? hemorragiaParar(hl) : hemorragiaTipos(hl);
}

// ---------------------------------------------------------------------------
// Quemaduras. spec: { tipo:'quemadura', vista:'grados'|'enfriar', resaltar? }
//   grados: resaltar 'primero'|'segundo'|'tercero'; enfriar: resaltar 'termica'|'quimica'.

function quemaduraGrados(hl) {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Grados de las quemaduras', 'qg');
  out.push(title(160, 'Quemaduras según su profundidad'));
  const cols = [
    { k: 'primero', x: 56, nombre: '1.er grado', capas: 1, t: ['solo la capa', 'superficial', 'piel roja, duele', 'sin ampollas'], extra: '(la solar típica)' },
    { k: 'segundo', x: 160, nombre: '2.º grado', capas: 2, t: ['más profunda', 'ampollas', 'mucho dolor', 'riesgo: infección'] },
    { k: 'tercero', x: 264, nombre: '3.er grado', capas: 3, t: ['todas las capas', 'blanquecina,', 'amarillenta', 'o negruzca', 'puede no doler'], extra: 'grave siempre' },
  ];
  const y0 = 72;
  const alt = [10, 16, 20];
  for (const { k, x, nombre, capas, t, extra } of cols) {
    const on = hl.has(k);
    out.push(caja(x - 50, 34, 100, 204, on));
    // tres capas de piel en corte
    let yy = y0;
    alt.forEach((h, i) => {
      out.push(`<rect x="${x - 40}" y="${yy}" width="80" height="${h}" style="fill:${PIEL}" opacity="${1 - i * 0.22}" stroke="currentColor" stroke-width=".6"/>`);
      yy += h;
    });
    // zona dañada: hasta la profundidad del grado
    const prof = alt.slice(0, capas).reduce((a, b) => a + b, 0);
    const dañoFill = capas === 3 ? 'var(--l-tope)' : RED;
    out.push(`<rect x="${x - 22}" y="${y0}" width="44" height="${prof}" style="fill:${dañoFill}" opacity="${capas === 3 ? 0.75 : 0.45}"/>`);
    out.push(`<rect x="${x - 22}" y="${y0}" width="44" height="${prof}" fill="none" stroke="${RED}" stroke-width="${on ? 2 : 1.2}" stroke-dasharray="3 2"/>`);
    if (capas === 2) out.push(`<path d="M${x - 14},${y0} Q${x},${y0 - 16} ${x + 14},${y0}Z" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1.1"/>`);
    // marca de profundidad
    out.push(`<line x1="${x + 44}" y1="${y0}" x2="${x + 44}" y2="${y0 + prof}" stroke="${RED}" stroke-width="2.4"/>`);
    out.push(tx(x, 134, nombre, { anchor: 'middle', bold: true, c: on ? RED : null, size: 12 }));
    out.push(lineas(x, 152, t, { anchor: 'middle', bold: on, size: 9.8 }, 14));
    if (extra) out.push(tx(x, 222, extra, { anchor: 'middle', bold: k === 'tercero', c: k === 'tercero' ? RED : null, size: 9.8 }));
  }
  if (cols.some((c) => c.k === 'segundo')) out.push(tx(160, 54, 'ampolla', { anchor: 'middle', size: 9 }));
  out.push(lineas(14, 258, [
    'También cuenta la extensión y la zona: cara, manos,',
    'genitales o articulaciones, siempre a consulta.',
  ], { size: 10.5 }, 14));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'Primer grado: piel roja y dolorosa, sin ampollas. Segundo grado: ampollas y mucho dolor, con riesgo de infección. Tercer grado: destruye todas las capas, la piel queda blanquecina, amarillenta o negruzca y puede no doler; es grave siempre.',
  };
}

function quemaduraEnfriar(hl) {
  const W = 320;
  const H = 282;
  const out = open(W, H, 'Cómo lavar o enfriar una quemadura', 'qe');
  out.push(title(160, 'Agua: cuánto tiempo y cómo'));
  const cols = [
    { k: 'termica', x: 82, nombre: 'TÉRMICA', m1: 10, m2: 20, cifra: ['10 min mínimo,', 'mejor 20'], t: ['agua fresca, mejor', 'corriente', 'ni helada ni hielo', 'si es extensa: solo', 'la zona, y abrígalo', 'no revientes ampollas'] },
    { k: 'quimica', x: 238, nombre: 'QUÍMICA', m1: 15, cifra: ['15 min mínimo', '(también en el ojo)'], t: ['agua abundante,', 'quita la ropa manchada', '(con guantes)', 'no la tapes primero', 'ni la «neutralices»', 'nunca agua oxigenada', 'en el ojo'] },
  ];
  for (const { k, x, nombre, m1, m2, cifra, t } of cols) {
    const on = hl.has(k);
    out.push(caja(x - 74, 34, 148, 240, on));
    out.push(tx(x, 52, nombre, { anchor: 'middle', bold: true, c: on ? RED : null, size: 12 }));
    out.push(grifo(x - 26, 76, 24));
    out.push(reloj(x + 30, 82, 20, m1, m2));
    out.push(lineas(x, 122, cifra, { anchor: 'middle', bold: true, size: 11 }, 14));
    // las líneas de lo que no se hace van en rojo y negrita
    t.forEach((l, i) => {
      const neg = /^(ni |no |nunca|en el ojo)/.test(l);
      out.push(tx(x - 66, 160 + i * 16, l, { c: neg ? RED : null, bold: neg, size: 10 }));
    });
  }
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'La térmica se enfría con agua fresca, sin hielo, al menos 10 minutos y mejor 20; la química se lava con agua abundante un mínimo de 15 minutos, también en el ojo, sin taparla antes ni usar agua oxigenada.',
  };
}

export function quemaduraIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  return (spec.vista ?? 'grados') === 'enfriar' ? quemaduraEnfriar(hl) : quemaduraGrados(hl);
}

// ---------------------------------------------------------------------------
// Radio-Médico. spec: { tipo:'radio-medico', resaltar?: 'radio'|'telefono' }

export function radioMedicoIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  const W = 320;
  const H = 286;
  const out = open(W, H, 'Cómo contactar con el Radio-Médico', 'rm');
  out.push(title(160, 'Consulta Radio-Médico: dos vías'));
  const onR = hl.has('radio');
  const onT = hl.has('telefono');
  // barco con antena VHF
  out.push(`<rect x="0" y="92" width="96" height="16" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M14,84 L80,84 L72,100 L22,100Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(`<rect x="36" y="70" width="22" height="14" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.1"/>`);
  out.push(`<line x1="54" y1="70" x2="54" y2="48" stroke="currentColor" stroke-width="1.6"/>`);
  out.push(`<path d="M60,50 q5,4 0,8 M65,46 q8,8 0,16" fill="none" stroke="${onR ? RED : 'currentColor'}" stroke-width="1.4"/>`);
  // estación costera (torre)
  out.push(`<path d="M196,104 L206,46 L216,104Z M199,88 L213,88 M202,70 L210,70" fill="none" stroke="currentColor" stroke-width="1.6"/>`);
  out.push(`<circle cx="206" cy="44" r="3" style="fill:currentColor"/>`);
  out.push(tx(206, 118, 'estación costera', { anchor: 'middle', bold: true }));
  // flecha barco → costera
  out.push(arrow(84, 66, 186, 66, onR ? 'r' : 'v', 'rm', onR ? 3 : 2.2));
  out.push(tx(134, 58, 'POR RADIO', { anchor: 'middle', bold: true, c: onR ? RED : null, size: 11 }));
  out.push(tx(134, 82, 'VHF, canal 16', { anchor: 'middle' }));
  out.push(tx(134, 95, '«consulta médica»', { anchor: 'middle', bold: true }));
  // CRME
  const cx = 222;
  const cy = 150;
  out.push(`<rect x="${cx}" y="${cy}" width="90" height="58" rx="8" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1.5"/>`);
  out.push(`<path d="M${cx + 12},${cy + 14} h6 v-6 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6Z" style="fill:${RED}"/>`);
  out.push(tx(cx + 40, cy + 22, 'CRME', { bold: true, size: 13 }));
  out.push(tx(cx + 45, cy + 40, 'médicos del ISM', { anchor: 'middle', size: 9.5 }));
  out.push(tx(cx + 45, cy + 52, '(Madrid)', { anchor: 'middle', size: 9.5 }));
  // costera → CRME
  out.push(arrow(214, 124, 248, 146, onR ? 'r' : 'v', 'rm', onR ? 3 : 2.2));
  out.push(tx(240, 130, 'te pasa', { size: 9.5 }));
  // teléfono
  out.push(`<rect x="34" y="150" width="24" height="42" rx="4" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<rect x="38" y="156" width="16" height="24" rx="1" style="fill:var(--bg)" stroke="currentColor" stroke-width=".6"/>`);
  out.push(`<circle cx="46" cy="186" r="2" style="fill:currentColor"/>`);
  out.push(arrow(66, 179, 214, 179, onT ? 'r' : 'v', 'rm', onT ? 3 : 2.2));
  out.push(tx(140, 152, 'POR TELÉFONO, directo', { anchor: 'middle', bold: true, c: onT ? RED : null, size: 11 }));
  out.push(tx(140, 170, '91 310 34 75', { anchor: 'middle', bold: true, size: 12.5 }));
  // Salvamento Marítimo
  out.push(`<line x1="267" y1="208" x2="267" y2="222" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/>`);
  out.push(tx(310, 234, 'coordinado con Salvamento', { anchor: 'end', size: 9.5 }));
  out.push(tx(310, 246, 'Marítimo si hay que evacuar', { anchor: 'end', size: 9.5 }));
  out.push(tx(14, 214, 'Las dos vías valen.', { bold: true }));
  out.push(tx(14, 268, '24 horas, todos los días del año, gratis.', { bold: true, size: 11 }));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'Al Centro Radio-Médico Español se llega por radio, pidiendo a una estación costera una «consulta médica», o por teléfono, directamente al 91 310 34 75. Atiende gratis, las 24 horas, todos los días del año.',
  };
}

// ---------------------------------------------------------------------------
// Botiquín según la zona de navegación. spec: { tipo:'botiquin', resaltar?: 'zonas-1-4'|'zonas-5-7'|'guia' }

export function botiquinIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Botiquín de una embarcación de recreo', 'bq');
  out.push(title(160, 'Botiquín (RD 339/2021)'));
  out.push(tx(160, 40, 'sin tripulación profesional, según la zona', { anchor: 'middle', size: 10 }));
  const x0 = 14;
  const w = 41.7;
  const yb = 50;
  for (let z = 1; z <= 7; z++) {
    const obl = z <= 4;
    const x = x0 + (z - 1) * w;
    out.push(`<rect x="${fx(x)}" y="${yb}" width="${fx(w - 3)}" height="30" rx="4" style="fill:${obl ? 'var(--l-verde)' : 'var(--l-casco)'}" fill-opacity="${obl ? 0.35 : 1}" stroke="currentColor" stroke-width="${obl ? 2 : 1}"/>`);
    out.push(`<text x="${fx(x + (w - 3) / 2)}" y="${yb + 20}" class="il-lbl" text-anchor="middle" style="font-weight:700;font-size:13px">${z}</text>`);
  }
  out.push(tx(x0, yb + 44, 'ilimitada', { size: 9.5 }));
  out.push(tx(x0 + 4 * w - 3, yb + 44, 'hasta 12 millas', { anchor: 'end', size: 9.5 }));
  // llaves
  const on14 = hl.has('zonas-1-4');
  const on57 = hl.has('zonas-5-7');
  const brace = (xa, xb, y, on) => `<path d="M${fx(xa)},${y} v6 H${fx(xb)} v-6 M${fx((xa + xb) / 2)},${y + 6} v6" fill="none" stroke="${on ? RED : 'currentColor'}" stroke-width="${on ? 2.2 : 1.2}"/>`;
  out.push(brace(x0, x0 + 4 * w - 3, yb + 52, on14), brace(x0 + 4 * w, x0 + 7 * w - 3, yb + 52, on57));
  out.push(tx(x0 + 2 * w - 1.5, 130, 'OBLIGATORIO', { anchor: 'middle', bold: true, c: on14 ? RED : null, size: 11 }));
  out.push(lineas(x0 + 2 * w - 1.5, 144, ['tipo «Balsas de', 'Salvamento»'], { anchor: 'middle', bold: true }, 13));
  out.push(tx(x0 + 2 * w - 1.5, 170, '(RD 258/1999)', { anchor: 'middle', size: 9.5 }));
  out.push(tx(x0 + 5.5 * w - 1.5, 130, 'no obligatorio', { anchor: 'middle', bold: true, c: on57 ? RED : null, size: 11 }));
  out.push(lineas(x0 + 5.5 * w - 1.5, 144, ['muy', 'recomendable'], { anchor: 'middle' }, 13));
  // Guía Sanitaria a Bordo
  const onG = hl.has('guia');
  out.push(caja(10, 184, 300, 68, onG));
  // botiquín + libro
  out.push(`<rect x="22" y="200" width="34" height="26" rx="4" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1.3"/><path d="M35,206 h8 v5 h5 v6 h-5 v5 h-8 v-5 h-5 v-6 h5Z" style="fill:${RED}"/>`);
  out.push(tx(64, 218, '+', { bold: true, size: 14 }));
  out.push(`<path d="M76,202 L96,206 L116,202 L116,230 L96,234 L76,230Z M96,206 L96,234" style="fill:var(--l-cielo)" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(tx(124, 202, 'Guía Sanitaria a Bordo', { bold: true, c: onG ? RED : null, size: 10.5 }));
  out.push(lineas(124, 217, ['si llevas botiquín, también', 'la Guía: del ISM, descarga', 'gratis en su web'], { size: 9.8 }, 12.5));
  out.push(lineas(14, 268, ['Con tripulación profesional: RD 258/1999.', 'Revisa caducidades cada temporada.'], { size: 10 }, 13));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: 'Sin tripulación profesional, en zonas 1 a 4 el botiquín es obligatorio y del tipo «Balsas de Salvamento»; en zonas 5, 6 y 7 no lo es, pero es muy recomendable. Quien lleve botiquín debe llevar también la Guía Sanitaria a Bordo.',
  };
}

export const LAMINAS = {
  hemorragia: {
    fn: hemorragiaIllustration,
    params: { vista: ['tipos', 'parar'], resaltar: 'tipos: arterial | venosa | capilar; parar: presion | elevar | vendaje | torniquete (una o lista)' },
    ejemplo: { tipo: 'hemorragia', vista: 'tipos' },
  },
  quemadura: {
    fn: quemaduraIllustration,
    params: { vista: ['grados', 'enfriar'], resaltar: 'grados: primero | segundo | tercero; enfriar: termica | quimica (una o lista)' },
    ejemplo: { tipo: 'quemadura', vista: 'grados' },
  },
  'radio-medico': {
    fn: radioMedicoIllustration,
    params: { resaltar: ['radio', 'telefono'] },
    ejemplo: { tipo: 'radio-medico' },
  },
  botiquin: {
    fn: botiquinIllustration,
    params: { resaltar: ['zonas-1-4', 'zonas-5-7', 'guia'] },
    ejemplo: { tipo: 'botiquin' },
  },
};
