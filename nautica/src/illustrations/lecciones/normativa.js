// Láminas de normativa y preparación de la salida: revisión antes de zarpar y previsión (dibujo antiguo); puerto comercial,
// seguro obligatorio, contaminación (responsables y aviso), deber de auxilio y previsión meteorológica.
// Cada función es pura: spec → { svg, caption }. Estilo del kit: fondo il-panel, textos en currentColor
// y superficies con las variables --l-* del tema.

import { open, title, arrow, hullPlan, fx } from '../kit.js';
import { puertoComercialC, seguroRcC, contaminacionC, deberAuxilioC, PARTES_PUERTO, RESPONSABLES } from '../per-cola-normativa-b-c.js';

const RED = 'var(--l-r)';
const OK = 'var(--l-m)';
const CARD = 'var(--l-fondo)';

/** Texto de lámina con un único atributo style (color, tamaño y grosor). */
function tx(x, y, t, { c = null, anchor = 'start', bold = false, size = null } = {}) {
  const st = [c ? `fill:${c}` : '', size ? `font-size:${size}px` : '', bold ? 'font-weight:700' : ''].filter(Boolean).join(';');
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${anchor}"${st ? ` style="${st}"` : ''}>${t}</text>`;
}
/** Varias líneas de texto seguidas. */
const lineas = (x, y, ls, opt = {}, paso = 13) => ls.map((l, i) => tx(x, y + i * paso, l, opt)).join('');
const line = (x1, y1, x2, y2, c = 'currentColor', w = 1.4, extra = '') => `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" stroke="${c}" stroke-width="${w}" ${extra}/>`;
/** Tarjeta: rectángulo redondeado con fondo de tarjeta; resaltada, con borde rojo grueso. */
const card = (x, y, w, h, on = false, stroke = null) => `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="7" style="fill:${CARD}" stroke="${on ? RED : stroke ?? 'currentColor'}" stroke-width="${on ? 2.8 : 1.2}"${on || stroke ? '' : ' stroke-opacity=".55"'}/>`;
const hlSet = (r) => new Set(r == null ? [] : Array.isArray(r) ? r : [r]);
const tache = (x, y, s = 6, w = 2.4) => `<path d="M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}" stroke="${RED}" stroke-width="${w}" stroke-linecap="round"/>`;
const check = (x, y, s = 6) => `<path d="M${x - s},${y} L${x - s / 3},${y + s * 0.7} L${x + s},${y - s * 0.8}" fill="none" style="stroke:${OK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Superficie de mar con una línea de ola, de x0 a x1 y de y hasta y2. */
function mar(x0, y, x1, y2) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < x1; x += 20) d += ` q5,-3 10,0 q5,3 10,0`;
  return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${y2 - y}" style="fill:var(--l-mar)"/><path d="${d}" fill="none" style="stroke:var(--l-v)" stroke-width="1.2"/>`;
}
/** Casco en planta girado `rot` grados (0 = proa arriba) en (x, y). */
const barco = (x, y, rot, L, B, extra = '') => `<g transform="translate(${fx(x)},${fx(y)}) rotate(${rot})">${hullPlan(L, B, extra)}</g>`;
/** Ancla esquemática centrada en (x, y). */

// ---------------------------------------------------------------------------
// Revisión antes de salir. spec: { tipo:'revision-salida', vista:'resumen'|'motor', resaltar? }
//  resumen: resaltar 'tiempo'|'barco'|'personas'|'tierra'
//  motor:   resaltar 'aceite'|'refrigeracion'|'correa'|'decantador'|'combustible'|'fugas'|'baterias'

function revisionResumen(hl) {
  const W = 320;
  const H = 262;
  const out = open(W, H, 'Antes de soltar amarras: tiempo, barco y personas', 'rsr');
  out.push(title(160, 'Antes de soltar amarras, revisa…'));
  const cols = [
    ['tiempo', 'El tiempo', ['previsión para', 'toda la travesía', 'y su evolución,', 'no solo el cielo', 'de ahora']],
    ['barco', 'El barco', ['motor, gobierno,', 'combustible y', 'equipo de', 'seguridad']],
    ['personas', 'Las personas', ['quién va a bordo', 'y si saben qué', 'hacer en una', 'emergencia']],
  ];
  cols.forEach(([k, t, ls], i) => {
    const x = 8 + i * 104;
    const on = hl.has(k);
    out.push(card(x, 34, 96, 150, on));
    const cx = x + 48;
    if (k === 'tiempo') {
      // sol y nube
      out.push(`<circle cx="${cx - 8}" cy="56" r="9" style="fill:var(--l-faro)"/>`);
      out.push(`<path d="M${cx - 12},72 a8,8 0 0 1 6,-12 a10,10 0 0 1 18,2 a7,7 0 0 1 4,10 Z" style="fill:var(--l-cielo)" stroke="currentColor" stroke-width="1.2"/>`);
    } else if (k === 'barco') {
      out.push(`<path d="M${cx - 22},62 L${cx + 22},62 L${cx + 16},74 L${cx - 18},74 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/><rect x="${cx - 8}" y="52" width="14" height="10" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
    } else {
      for (const dx of [-14, 0, 14]) out.push(`<circle cx="${cx + dx}" cy="52" r="5" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/><path d="M${cx + dx - 7},74 Q${cx + dx - 7},60 ${cx + dx},60 Q${cx + dx + 7},60 ${cx + dx + 7},74 Z" style="fill:var(--l-a)" stroke="currentColor" stroke-width="1.2"/>`);
    }
    out.push(tx(cx, 96, t, { anchor: 'middle', bold: true, size: 12, c: on ? RED : null }));
    out.push(lineas(cx, 114, ls, { anchor: 'middle', size: 10.5 }));
  });
  const on = hl.has('tierra');
  out.push(card(8, 194, 304, 60, on));
  // casita en tierra
  out.push(`<path d="M22,226 L36,212 L50,226 Z" style="fill:var(--l-roja)" stroke="currentColor" stroke-width="1"/><rect x="25" y="226" width="22" height="18" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(tx(60, 212, 'Dilo en tierra, a alguien de confianza:', { bold: true, c: on ? RED : null, size: 11 }));
  out.push(tx(60, 228, 'adónde vas, por dónde y cuándo vuelves.', { size: 10.5 }));
  out.push(tx(60, 243, 'Si no llegas, alguien dará la alarma.', { size: 10.5 }));
  out.push('</svg>');
  const CAP = {
    tiempo: 'El tiempo: la predicción para toda la travesía y cómo va a evolucionar, no solo el cielo que ves ahora.',
    barco: 'El barco: motor, gobierno, combustible y equipo de seguridad.',
    personas: 'Las personas: quién va a bordo y si saben qué hacer en una emergencia.',
    tierra: 'Deja dicho en tierra adónde vas, por dónde y cuándo piensas volver: si no llegas, alguien dará la alarma.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'Antes de salir, el patrón comprueba el tiempo, el barco y las personas, y deja dicho en tierra adónde va, por dónde y cuándo piensa volver.';
  return { svg: out.join(''), caption };
}

function revisionMotor(hl) {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Revisión del motor antes de salir', 'rsm');
  out.push(title(160, 'El motor y el combustible'));
  const col = (k) => (hl.has(k) ? RED : 'currentColor');
  const sw = (k, b = 1.4) => (hl.has(k) ? b + 1.4 : b);
  // casco (sentina) y mar
  out.push(mar(8, 134, W - 8, 154));
  out.push(`<path d="M8,124 L276,124 L276,58 L284,58 L284,134 Q150,150 8,134 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<rect x="8" y="118" width="268" height="6" style="fill:var(--l-g)" opacity=".5"/>`);
  // tanque de combustible
  out.push(`<rect x="14" y="62" width="44" height="54" rx="4" style="fill:${CARD}" stroke="${col('combustible')}" stroke-width="${sw('combustible')}"/>`);
  out.push(`<rect x="15" y="82" width="42" height="33" rx="3" style="fill:var(--l-a)" opacity=".75"/>`);
  out.push(tx(36, 76, 'gasoil', { anchor: 'middle', size: 9 }));
  // tubería al decantador y al motor
  out.push(line(58, 70, 80, 70, 'var(--l-a)', 2), line(80, 70, 80, 74, 'var(--l-a)', 2), line(94, 80, 112, 80, 'var(--l-a)', 2));
  out.push(`<rect x="74" y="74" width="20" height="30" rx="5" style="fill:${CARD}" stroke="${col('decantador')}" stroke-width="${sw('decantador')}"/><rect x="76" y="80" width="16" height="22" rx="4" style="fill:var(--l-a)" opacity=".5"/>`);
  // motor
  out.push(`<rect x="112" y="58" width="82" height="56" rx="6" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.6"/>`);
  out.push(tx(166, 104, 'MOTOR', { anchor: 'middle', bold: true, size: 10 }));
  // correa y poleas (alternador arriba, cigüeñal abajo)
  out.push(`<circle cx="128" cy="72" r="6" style="fill:${CARD}" stroke="currentColor" stroke-width="1.2"/><circle cx="128" cy="98" r="9" style="fill:${CARD}" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(line(122, 72, 119, 98, col('correa'), sw('correa', 1.6)), line(134, 72, 137, 98, col('correa'), sw('correa', 1.6)));
  // varilla del aceite
  out.push(line(182, 58, 182, 42, col('aceite'), sw('aceite', 1.8)), `<circle cx="182" cy="38" r="4" fill="none" stroke="${col('aceite')}" stroke-width="${sw('aceite', 1.6)}"/>`);
  // refrigeración: grifo de fondo, filtro de agua salada y escape
  out.push(`<path d="M208,128 L208,122 M202,132 L214,124 M202,124 L214,132" stroke="${col('refrigeracion')}" stroke-width="${sw('refrigeracion', 1.6)}" fill="none"/>`);
  out.push(line(208, 122, 208, 104, 'var(--l-v)', 2));
  out.push(`<rect x="200" y="82" width="16" height="22" rx="3" style="fill:${CARD}" stroke="${col('refrigeracion')}" stroke-width="${sw('refrigeracion')}"/>`);
  out.push(line(208, 82, 208, 76, 'var(--l-v)', 2), line(208, 76, 194, 76, 'var(--l-v)', 2));
  out.push(line(194, 64, 264, 64, 'currentColor', 2.4), line(264, 64, 264, 100, 'currentColor', 2.4), line(264, 100, 284, 100, 'currentColor', 2.4));
  for (const [dx, dy] of [[6, 6], [10, 14], [7, 22], [12, 28]]) out.push(`<circle cx="${284 + dx}" cy="${100 + dy}" r="2.2" style="fill:var(--l-v)"/>`);
  // batería
  out.push(`<rect x="226" y="88" width="30" height="20" rx="2" style="fill:${CARD}" stroke="${col('baterias')}" stroke-width="${sw('baterias')}"/><rect x="230" y="84" width="5" height="4" fill="currentColor"/><rect x="247" y="84" width="5" height="4" fill="currentColor"/>`);
  // gota bajo el motor (fugas)
  out.push(`<path d="M150,114 q-4,6 0,8 q4,-2 0,-8 Z" style="fill:var(--l-a)" stroke="${col('fugas')}" stroke-width="${sw('fugas', 1)}"/>`);
  // marcas numeradas
  const items = [
    ['aceite', 194, 40, 'Aceite: nivel correcto y sin fugas.'],
    ['refrigeracion', 226, 128, 'Refrigeración: grifo de fondo abierto, filtro de', 'agua salada limpio y, al arrancar, comprueba', 'que sale agua por el escape.'],
    ['correa', 146, 72, 'Correa del alternador: tensa y en buen estado.'],
    ['decantador', 84, 54, 'Filtro decantador: sin agua.'],
    ['combustible', 36, 50, 'Combustible: para toda la travesía, con reserva.'],
    ['fugas', 168, 130, 'Fugas de aceite o combustible: ninguna.'],
    ['baterias', 241, 76, 'Baterías: cargadas.'],
  ];
  let y = 172;
  items.forEach(([k, mx, my, ...txt], i) => {
    const on = hl.has(k);
    const n = String(i + 1);
    out.push(`<circle cx="${mx}" cy="${my}" r="7.5" class="il-panel" stroke="${on ? RED : 'currentColor'}" stroke-width="${on ? 2.4 : 1.2}"/>`, tx(mx, my + 3.5, n, { anchor: 'middle', bold: true, size: 10, c: on ? RED : null }));
    out.push(tx(14, y, n, { bold: true, size: 10.5, c: on ? RED : null }));
    txt.forEach((t, j) => out.push(tx(26, y + j * 13, t, { size: 10.5, bold: on, c: on ? RED : null })));
    y += 13 * txt.length + 2;
  });
  out.push('</svg>');
  const CAP = {
    aceite: 'Aceite del motor: nivel correcto y sin fugas.',
    refrigeracion: 'Refrigeración: grifo de fondo abierto, filtro de agua salada limpio y, al arrancar, comprobar que sale agua por el escape.',
    correa: 'La correa del alternador debe estar tensa y en buen estado: mueve el alternador y, en muchos motores, la bomba de agua.',
    decantador: 'El filtro decantador separa el agua del combustible: antes de salir, que no tenga agua.',
    combustible: 'Combustible suficiente para toda la travesía, con un buen margen de reserva.',
    fugas: 'Mira que no haya fugas de aceite o combustible en la sentina ni en el motor.',
    baterias: 'Baterías cargadas.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'Antes de salir se revisa el motor: aceite, refrigeración (sale agua por el escape), correa del alternador, filtro decantador sin agua, fugas y baterías, y se lleva combustible para toda la travesía con reserva.';
  return { svg: out.join(''), caption };
}

export function revisionSalidaIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  return spec.vista === 'motor' ? revisionMotor(hl) : revisionResumen(hl);
}

// Puerto comercial, seguro obligatorio, contaminación y deber de auxilio: en estilo C, per-cola-normativa-b-c.js.

// ---------------------------------------------------------------------------
// Previsión meteorológica. spec: { tipo:'prevision-salida', vista:'fuentes'|'decidir', resaltar? (fuentes: 'aemet'|'vhf'|'navtex'|'apps') }

function previsionFuentes(hl) {
  const W = 320;
  const H = 290;
  const out = open(W, H, 'Dónde conseguir la previsión oficial', 'pvf');
  out.push(title(160, 'La previsión oficial: de dónde sale'));
  const ae = hl.has('aemet');
  out.push(card(60, 32, 200, 40, ae, ae ? null : 'var(--l-v)'));
  out.push(tx(160, 49, 'AEMET', { anchor: 'middle', bold: true, size: 12, c: ae ? RED : null }), tx(160, 64, 'elabora predicciones y avisos', { anchor: 'middle', size: 10.5 }));
  const cols = [
    ['aemet', 'Web y app', ['aguas costeras', '(hasta 20 millas)', 'y alta mar', 'avisos de', 'fenómenos', 'adversos']],
    ['vhf', 'Salvamento', ['Marítimo (VHF):', 'anuncio en el', 'canal 16; se lee', 'en el canal de', 'trabajo de cada', 'centro (10, 74…)']],
    ['navtex', 'NAVTEX', ['muestra solo', 'los avisos:', '518 kHz: inglés', '490 kHz: idioma', 'nacional']],
  ];
  cols.forEach(([k, t, ls], i) => {
    const x = 8 + i * 104;
    const cx = x + 48;
    const on = hl.has(k) && k !== 'aemet';
    out.push(arrow(160 + (i - 1) * 40, 72, cx, 90, 'g', 'pvf', 1.8));
    out.push(card(x, 92, 96, 112, on));
    out.push(tx(cx, 109, t, { anchor: 'middle', bold: true, size: 11, c: on ? RED : null }));
    out.push(lineas(cx, 126, ls, { anchor: 'middle', size: 10 }, 13));
  });
  for (let i = 0; i < 3; i++) out.push(arrow(56 + i * 104, 204, 160 + (i - 1) * 20, 222, 'g', 'pvf', 1.6));
  out.push(barco(160, 232, 90, 40, 14, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'), tx(190, 236, 'tú: antes de salir', { size: 10.5, bold: true }), tx(190, 249, 'y navegando', { size: 10.5 }));
  const ap = hl.has('apps');
  out.push(tx(14, 270, 'Apps de modelos: útiles, pero contrástalas', { size: 10.5, bold: ap, c: ap ? RED : null }));
  out.push(tx(14, 283, 'siempre con la predicción y los avisos oficiales.', { size: 10.5, bold: ap, c: ap ? RED : null }));
  out.push('</svg>');
  const CAP = {
    aemet: 'AEMET es la fuente oficial: elabora las predicciones para aguas costeras (hasta 20 millas) y alta mar, y los avisos de fenómenos adversos.',
    vhf: 'Los centros de Salvamento Marítimo emiten por VHF los boletines y avisos costeros: se anuncian por el canal 16 y se leen en el canal de trabajo de cada centro.',
    navtex: 'El NAVTEX recibe solo los avisos meteorológicos y de seguridad: 518 kHz en inglés y 490 kHz en el idioma nacional.',
    apps: 'Las aplicaciones de modelos meteorológicos son útiles, pero hay que contrastarlas siempre con la predicción y los avisos oficiales.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'AEMET elabora la predicción y los avisos oficiales para navegar; te llegan por su web y su aplicación, por VHF desde Salvamento Marítimo y por NAVTEX.';
  return { svg: out.join(''), caption };
}

function previsionDecidir() {
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Antes de zarpar: decidir con la previsión', 'pvd');
  out.push(title(160, 'Decidir antes de zarpar'));
  out.push(card(8, 32, 148, 104), card(164, 32, 148, 104));
  out.push(tx(82, 48, 'El parte', { anchor: 'middle', bold: true, size: 11 }), tx(238, 48, 'Lo que ves', { anchor: 'middle', bold: true, size: 11 }));
  out.push(lineas(16, 64, ['viento: Beaufort;', '¿rola, refresca o cae?', 'mar: Douglas', 'mar de fondo aparte', 'visibilidad, nieblas', 'avisos en vigor'], { size: 10 }, 12.5));
  out.push(lineas(172, 64, ['barómetro:', '¿baja deprisa?', 'el cielo', 'el viento real', 'en el puerto'], { size: 10 }, 12.5));
  out.push(arrow(82, 136, 130, 152, 'g', 'pvd', 1.8), arrow(238, 136, 190, 152, 'g', 'pvd', 1.8));
  out.push(card(30, 154, 260, 44, false, 'var(--l-v)'));
  out.push(tx(160, 171, '¿Lo llevan con comodidad tu barco y', { anchor: 'middle', size: 10.5, bold: true }), tx(160, 186, 'tu tripulación? ¿Empeora a la vuelta?', { anchor: 'middle', size: 10.5, bold: true }));
  out.push(arrow(90, 198, 82, 212, 'g', 'pvd', 1.8), arrow(230, 198, 238, 212, 'g', 'pvd', 1.8));
  out.push(card(8, 214, 148, 52, false, OK), card(164, 214, 148, 52, false, RED));
  out.push(check(22, 227, 5), tx(32, 231, 'Sí: sal con plan B', { bold: true, size: 10.5, c: OK }));
  out.push(lineas(16, 245, ['puerto de refugio, rumbo', 'alternativo y hora límite'], { size: 10 }, 13));
  out.push(tache(178, 227, 4.5, 2), tx(188, 231, 'No: no salgas', { bold: true, size: 10.5, c: RED }));
  out.push(lineas(172, 245, ['quédate en puerto', 'o cambia el plan'], { size: 10 }, 13));
  out.push(tx(14, 280, 'Navegando: si el barómetro cae deprisa o el viento', { size: 10.5, bold: true }), tx(14, 293, 'refresca más de lo previsto, vuelve antes.', { size: 10.5, bold: true }));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con el parte oficial y lo que ves (barómetro, cielo y viento en puerto) decides: si tu barco y tu tripulación lo llevan con comodidad, sales con un plan B; si no, te quedas o cambias el plan.' };
}

export function previsionSalidaIllustration(spec) {
  return spec.vista === 'decidir' ? previsionDecidir() : previsionFuentes(hlSet(spec.resaltar));
}

// ---------------------------------------------------------------------------

export const LAMINAS = {
  'revision-salida': {
    fn: revisionSalidaIllustration,
    params: { vista: ['resumen', 'motor'], resaltar: ['tiempo', 'barco', 'personas', 'tierra', 'aceite', 'refrigeracion', 'correa', 'decantador', 'combustible', 'fugas', 'baterias'] },
    ejemplo: { tipo: 'revision-salida', vista: 'resumen' },
  },
  'puerto-comercial': { fn: puertoComercialC, params: { resaltar: PARTES_PUERTO }, ejemplo: { tipo: 'puerto-comercial' } },
  'seguro-rc': { fn: seguroRcC, params: {}, ejemplo: { tipo: 'seguro-rc' } },
  contaminacion: { fn: contaminacionC, params: { vista: ['responsables', 'aviso'], resaltar: RESPONSABLES }, ejemplo: { tipo: 'contaminacion', vista: 'responsables' } },
  'deber-auxilio': { fn: deberAuxilioC, params: { resaltar: ['acudir', 'no-acudir'] }, ejemplo: { tipo: 'deber-auxilio' } },
  'prevision-salida': { fn: previsionSalidaIllustration, params: { vista: ['fuentes', 'decidir'], resaltar: ['aemet', 'vhf', 'navtex', 'apps'] }, ejemplo: { tipo: 'prevision-salida', vista: 'fuentes' } },
};
