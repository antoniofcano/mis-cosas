// Láminas de normativa y preparación de la salida: revisión antes de zarpar, puerto comercial,
// seguro obligatorio, contaminación (responsables y aviso), deber de auxilio y previsión meteorológica.
// Cada función es pura: spec → { svg, caption }. Estilo del kit: fondo il-panel, textos en currentColor
// y superficies con las variables --l-* del tema.

import { C, open, title, arrow, hullPlan, fx } from '../kit.js';

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
const ancla = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="0" cy="-10" r="3"/><line x1="0" y1="-7" x2="0" y2="10"/><line x1="-6" y1="-3" x2="6" y2="-3"/><path d="M-10,3 Q-9,11 0,11 Q9,11 10,3"/></g>`;

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

// ---------------------------------------------------------------------------
// Puerto comercial. spec: { tipo:'puerto-comercial', resaltar?: 'recreo'|'salida'|'fondeo' }

export function puertoComercialIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  const W = 320;
  const H = 296;
  const out = open(W, H, 'Navegar en un puerto comercial', 'pc');
  out.push(title(160, 'En un puerto comercial'));
  // mar exterior, dársena y muelle
  out.push(mar(8, 32, 312, 240));
  out.push(`<rect x="8" y="92" width="190" height="10" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/><rect x="246" y="92" width="66" height="10" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/>`);
  out.push(`<rect x="8" y="226" width="304" height="16" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
  out.push(tx(160, 238, 'MUELLE', { anchor: 'middle', bold: true, size: 9.5 }));
  out.push(tx(14, 88, 'dique', { size: 9.5 }), tx(222, 116, 'bocana', { anchor: 'middle', size: 9.5 }));
  // canal de acceso
  out.push(`<path d="M200,102 L200,150 M244,102 L244,150" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity=".6"/>`);
  // salida: el que sale tiene preferencia
  const sOn = hl.has('salida');
  out.push(barco(222, 74, 0, 24, 10, `style="fill:var(--l-casco);stroke:${sOn ? RED : 'currentColor'};stroke-width:${sOn ? 2.4 : 1.2}"`));
  out.push(arrow(222, 60, 222, 42, 'm', 'pc', 2.2));
  out.push(barco(286, 52, 225, 24, 10, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'));
  out.push(tx(194, 48, 'sale:', { anchor: 'end', bold: true, c: sOn ? RED : null }), tx(194, 61, 'pasa primero', { anchor: 'end', bold: sOn, c: sOn ? RED : null }));
  out.push(tx(306, 78, 'entra:', { anchor: 'end', bold: true, c: sOn ? RED : null }), tx(306, 89, 'espera', { anchor: 'end', bold: sOn, c: sOn ? RED : null }));
  // fondeo prohibido en el canal
  const fOn = hl.has('fondeo');
  out.push(ancla(222, 136, 0.9), tache(222, 136, 10, fOn ? 3.2 : 2.4));
  out.push(tx(254, 128, 'no fondear', { bold: true, c: fOn ? RED : null }), tx(254, 141, 'en canales', { bold: fOn, c: fOn ? RED : null }), tx(254, 154, 'y bocanas', { bold: fOn, c: fOn ? RED : null }));
  // mercante maniobrando con remolcador (avanza hacia la izquierda)
  out.push(barco(170, 196, 270, 110, 24, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.4"'));
  out.push(tx(176, 200, 'mercante', { anchor: 'middle', bold: true, size: 10 }));
  out.push(barco(238, 196, 270, 22, 10, 'style="fill:var(--l-a);stroke:currentColor;stroke-width:1.2"'));
  out.push(tx(254, 200, 'remolcador', { size: 10 }));
  // velero de recreo que estaba en su camino y se aparta
  const rOn = hl.has('recreo');
  out.push(`<path d="M100,200 Q58,202 52,170" fill="none" style="stroke:var(--l-v)" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#pc-v)"/>`);
  out.push(barco(50, 150, 350, 26, 10, `style="fill:${CARD};stroke:${rOn ? RED : 'currentColor'};stroke-width:${rOn ? 2.6 : 1.2}"`));
  out.push(tx(14, 120, 'recreo de menos de 20 m:', { bold: true, c: rOn ? RED : null }));
  out.push(lineas(72, 142, ['se aparta y no', 'estorba, vaya a', 'vela o a motor'], { bold: rOn, c: rOn ? RED : null }));
  // normas
  out.push(lineas(14, 260, ['Velocidad reducida y sin levantar ola. Ningún vertido.', 'Obedece a la autoridad portuaria y a Capitanía.'], { size: 10.5 }, 14));
  out.push('</svg>');
  const CAP = {
    recreo: 'En las aguas de un puerto comercial, la embarcación de recreo de menos de 20 m no estorba el tránsito de los buques: se aparta, vaya a vela o a motor.',
    salida: 'Regla general en puerto: el que sale tiene preferencia sobre el que entra, salvo que la autoridad portuaria indique otra cosa.',
    fondeo: 'Prohibido fondear en canales de acceso, bocanas y zonas de maniobra, también a las embarcaciones de recreo, salvo emergencia.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'En un puerto comercial la embarcación de recreo se aparta y no estorba a los buques, el que sale pasa antes que el que entra y no se fondea en canales ni bocanas.';
  return { svg: out.join(''), caption };
}

// ---------------------------------------------------------------------------
// Seguro obligatorio de responsabilidad civil. spec: { tipo:'seguro-rc' }

export function seguroRcIllustration() {
  const W = 320;
  const H = 286;
  const out = open(W, H, 'Seguro obligatorio de responsabilidad civil', 'src');
  out.push(title(160, 'Seguro obligatorio de RC'));
  out.push(tx(160, 42, 'Obligatorio: a motor (también motos náuticas)', { anchor: 'middle', size: 10.5 }));
  out.push(tx(160, 56, 'y sin motor de más de 6 m de eslora.', { anchor: 'middle', size: 10.5 }));
  // dos columnas
  out.push(card(8, 66, 148, 140, false, OK), card(164, 66, 148, 140, false, RED));
  out.push(check(24, 84), tx(36, 88, 'SÍ cubre: terceros', { bold: true, size: 11, c: OK }));
  out.push(tache(180, 84, 5), tx(192, 88, 'NO cubre', { bold: true, size: 11, c: RED }));
  // dibujos: dos barcos que chocan / tu barco
  out.push(barco(56, 112, 90, 34, 12, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'), barco(104, 112, 270, 34, 12, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'));
  out.push(`<path d="M80,104 l3,5 5,-2 -2,5 5,3 -5,2 2,5 -5,-2 -3,5 -3,-5 -5,2 2,-5 -5,-3 5,-2 -2,-5 5,2 Z" style="fill:var(--l-faro)" stroke="currentColor" stroke-width=".8"/>`);
  out.push(barco(238, 112, 90, 40, 14, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'), tx(238, 116, 'tuyo', { anchor: 'middle', size: 9.5, bold: true }));
  out.push(lineas(18, 144, ['muerte o lesiones', 'daños materiales', 'daños a otros buques', 'por colisión o', 'sin contacto'], { size: 10.5 }, 13));
  out.push(lineas(174, 144, ['los daños de tu barco', 'los del propietario', 'o del tomador', 'los del patrón'], { size: 10.5 }, 13));
  // límites
  out.push(tx(14, 226, 'Límites:', { bold: true, size: 10.5 }));
  out.push(lineas(14, 240, ['daños personales: 120.202,42 € por víctima', '(240.404,84 € por siniestro); daños materiales:', '96.161,94 € por siniestro. Regatas: seguro especial.'], { size: 10.5 }, 13));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'El seguro obligatorio cubre la responsabilidad civil frente a terceros (personas, bienes y otros buques), no los daños de tu propio barco ni los del propietario, el tomador o el patrón.' };
}

// ---------------------------------------------------------------------------
// Contaminación. spec: { tipo:'contaminacion', vista:'responsables'|'aviso', resaltar? (responsables: 'naviero'|'propietario'|'asegurador'|'patron') }

function mancha(x, y, s = 1) {
  return `<path transform="translate(${x},${y}) scale(${s})" d="M-34,4 C-40,-8 -20,-16 -4,-12 C10,-20 34,-12 36,0 C42,12 20,18 4,14 C-10,20 -32,16 -34,4 Z" style="fill:var(--l-a)" fill-opacity=".55" stroke="currentColor" stroke-width=".8" stroke-opacity=".6"/>`;
}

function contaminacionResponsables(hl) {
  const W = 320;
  const H = 252;
  const out = open(W, H, 'Contaminación: responsables solidarios', 'ctr');
  out.push(title(160, 'Contaminar desde un barco'));
  out.push(mar(112, 96, 208, 142));
  out.push(mancha(160, 126, 0.9), barco(160, 110, 90, 34, 12, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'));
  out.push(tx(160, 74, 'infracción por', { anchor: 'middle', bold: true }), tx(160, 87, 'contaminación', { anchor: 'middle', bold: true }));
  const P = [
    ['naviero', 'naviero', 8, 30],
    ['propietario', 'propietario', 192, 30],
    ['asegurador', 'asegurador de RC', 8, 150],
    ['patron', 'patrón (capitán)', 192, 150],
  ];
  for (const [k, t, x, y] of P) {
    const on = hl.has(k);
    out.push(card(x, y, 120, 28, on), tx(x + 60, y + 18, t, { anchor: 'middle', bold: true, c: on ? RED : null, size: 10.5 }));
  }
  // uniones
  out.push(line(68, 58, 124, 104, 'currentColor', 1.2), line(252, 58, 196, 104, 'currentColor', 1.2), line(68, 150, 124, 124, 'currentColor', 1.2), line(252, 150, 196, 124, 'currentColor', 1.2));
  out.push(lineas(14, 202, ['Responden solidariamente: se puede exigir la', 'responsabilidad entera a cualquiera de los cuatro.'], { size: 10.5, bold: true }, 13.5));
  out.push(tache(20, 236, 4.5, 2), tx(30, 240, 'Falso: «solo» el patrón, el propietario o el asegurador.', { size: 10.5, c: RED }));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'De las infracciones por contaminación desde un barco responden solidariamente el naviero, el propietario, el asegurador de la responsabilidad civil y el patrón: la Administración puede exigir la responsabilidad entera a cualquiera de ellos.' };
}

function contaminacionAviso() {
  const W = 320;
  const H = 266;
  const out = open(W, H, 'Si ves contaminación, avisa', 'cta');
  out.push(title(160, 'Si ves contaminación: avisa ya'));
  out.push(mar(8, 70, 312, 134));
  out.push(mancha(222, 102, 1.2));
  out.push(barco(286, 92, 270, 44, 14, 'style="fill:var(--l-g);stroke:currentColor;stroke-width:1.2"'), tx(290, 120, 'buque', { anchor: 'middle', size: 9.5 }));
  out.push(barco(56, 104, 90, 36, 12, 'style="fill:var(--l-casco);stroke:currentColor;stroke-width:1.2"'), tx(56, 126, 'tú', { anchor: 'middle', bold: true }));
  // ondas de radio
  for (const r of [8, 14]) out.push(`<path d="M${56 - r * 0.7},${88 - r * 0.7} A${r},${r} 0 0 1 ${56 + r * 0.7},${88 - r * 0.7}" fill="none" style="stroke:var(--l-v)" stroke-width="1.6"/>`);
  out.push(line(56, 98, 56, 88, 'currentColor', 1.4));
  out.push(tx(14, 44, 'Avisa a Salvamento Marítimo:', { bold: true, size: 11 }), tx(14, 60, 'VHF canal 16 · 900 202 202 · 112', { size: 11, bold: true, c: RED }));
  out.push(tx(222, 106, 'mancha', { anchor: 'middle', size: 10, bold: true }));
  out.push(tx(14, 154, 'Da sin demora:', { bold: true, size: 11 }));
  const datos = [['tu posición y la hora', 1], ['aspecto y extensión de la mancha', 2], ['nombre o descripción del buque', 3]];
  datos.forEach(([t], i) => {
    const y = 174 + i * 20;
    out.push(`<circle cx="22" cy="${y - 4}" r="7" class="il-panel" stroke="currentColor" stroke-width="1.2"/>`, tx(22, y, String(i + 1), { anchor: 'middle', bold: true }));
    out.push(tx(36, y, t, { size: 10.5 }));
  });
  out.push(tx(36, 227, '(si lo sabes)', { size: 10 }));
  out.push(tx(14, 254, 'Informar a la autoridad marítima es obligatorio.', { size: 10.5, bold: true }));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Si ves una mancha o un vertido, avisa sin demora a Salvamento Marítimo (VHF canal 16, 900 202 202 o 112) con tu posición y la hora, el aspecto y la extensión de la mancha y, si lo sabes, el buque que la ha causado.' };
}

export function contaminacionIllustration(spec) {
  return spec.vista === 'aviso' ? contaminacionAviso() : contaminacionResponsables(hlSet(spec.resaltar));
}

// ---------------------------------------------------------------------------
// Deber de auxilio. spec: { tipo:'deber-auxilio', resaltar?: 'acudir'|'no-acudir' }

export function deberAuxilioIllustration(spec) {
  const hl = hlSet(spec.resaltar);
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Deber de auxilio (SOLAS V/33.1)', 'da');
  out.push(title(160, 'Deber de auxilio (SOLAS V/33.1)'));
  out.push(card(30, 34, 260, 40));
  out.push(tx(160, 50, 'Sabes, por cualquier medio, que hay', { anchor: 'middle', size: 10.5 }), tx(160, 65, 'personas en peligro en el mar', { anchor: 'middle', size: 10.5, bold: true }));
  out.push(arrow(160, 74, 160, 84, 'g', 'da', 2));
  out.push(`<path d="M160,86 L300,114 L160,142 L20,114 Z" style="fill:${CARD}" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(tx(160, 112, '¿Puedes ayudar sin grave', { anchor: 'middle', size: 10.5, bold: true }), tx(160, 126, 'peligro y hace falta?', { anchor: 'middle', size: 10.5, bold: true }));
  out.push(arrow(80, 132, 80, 156, 'g', 'da', 2), arrow(240, 132, 240, 156, 'g', 'da', 2));
  out.push(tx(72, 150, 'sí', { anchor: 'end', bold: true }), tx(248, 150, 'no', { bold: true }));
  const a = hl.has('acudir');
  const n = hl.has('no-acudir');
  out.push(card(8, 158, 148, 80, a, a ? null : OK), card(164, 158, 148, 80, n));
  out.push(lineas(16, 175, ['Acude a toda velocidad,', 'informa a las víctimas', 'o a salvamento y', 'anótalo en el diario', 'de navegación'], { size: 10.5, c: a ? RED : null, bold: a }, 13));
  out.push(lineas(172, 175, ['No basta con seguir', 'tu rumbo: anota el', 'motivo en el diario', 'e informa al servicio', 'de salvamento'], { size: 10.5, c: n ? RED : null, bold: n }, 13));
  out.push(tx(14, 256, 'Sea cual sea su nacionalidad o condición,', { size: 10.5, bold: true }));
  out.push(tx(14, 270, 'aunque no te lo pida ningún centro de salvamento.', { size: 10.5, bold: true }));
  out.push(tache(19, 285, 4, 2), tx(28, 289, 'Falso: «solo si es de mi bandera» o «si me lo piden».', { size: 10, c: RED }));
  out.push('</svg>');
  const CAP = {
    acudir: 'Si puedes ayudar, acudes a toda velocidad, informas a las víctimas o al servicio de salvamento y lo dejas anotado en el diario de navegación.',
    'no-acudir': 'Si no puedes acudir, o no es razonable porque otro barco mejor preparado ya está allí, anotas el motivo en el diario de navegación e informas al servicio de salvamento.',
  };
  const caption = [...hl].map((k) => CAP[k]).filter(Boolean).join('\n') || 'Quien sabe que hay personas en peligro en el mar debe acudir a toda velocidad si puede hacerlo sin grave peligro, sea cual sea su nacionalidad; si no acude, anota el motivo en el diario e informa a salvamento.';
  return { svg: out.join(''), caption };
}

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
  'puerto-comercial': { fn: puertoComercialIllustration, params: { resaltar: ['recreo', 'salida', 'fondeo'] }, ejemplo: { tipo: 'puerto-comercial' } },
  'seguro-rc': { fn: seguroRcIllustration, params: {}, ejemplo: { tipo: 'seguro-rc' } },
  contaminacion: { fn: contaminacionIllustration, params: { vista: ['responsables', 'aviso'], resaltar: ['naviero', 'propietario', 'asegurador', 'patron'] }, ejemplo: { tipo: 'contaminacion', vista: 'responsables' } },
  'deber-auxilio': { fn: deberAuxilioIllustration, params: { resaltar: ['acudir', 'no-acudir'] }, ejemplo: { tipo: 'deber-auxilio' } },
  'prevision-salida': { fn: previsionSalidaIllustration, params: { vista: ['fuentes', 'decidir'], resaltar: ['aemet', 'vhf', 'navtex', 'apps'] }, ejemplo: { tipo: 'prevision-salida', vista: 'fuentes' } },
};
