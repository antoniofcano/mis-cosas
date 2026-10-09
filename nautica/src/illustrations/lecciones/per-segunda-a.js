// Segundas láminas del PER: amarrado a una boya con las partes del cabo (per-2-1), el reflector radar y la
// tormenta eléctrica (per-3-4), lo que exige cada zona en chalecos, aros y balsas (per-3-5), el tanque de
// retención y su vaciado (per-4-4) y las basuras a un lado y otro del estrecho (per-4-5). Estas tres últimas, en
// estilo C desde la tanda de cierre (per-cola-normativa-c.js).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` donde la lámina tiene partes.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx } from '../kit.js';
import { dotacionZonasC, tanqueRetencionC, marpolBasurasC, EQUIPOS, PARTES_TQ } from '../per-cola-normativa-c.js';

// Acentos que se adaptan al tema (texto, trazos y puntas de flecha).
const K = { v: 'var(--l-v)', r: 'var(--l-r)', a: 'var(--l-a)', m: 'var(--l-m)', g: 'var(--l-g)', t: 'currentColor' };
const marks = (id) => `<defs>${Object.entries(K).map(([k, c]) => `<marker id="${id}-k${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:${c}"/></marker>`).join('')}</defs>`;
const start = (W, H, label, id) => [...open(W, H, label, id), marks(id)];
const close = (out) => { out.push('</svg>'); return out.join(''); };
const lista = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);
const NARANJA = '#f97316';
const ARENA = '#a16207';

/** Partes resaltadas; null si alguna no existe. */
function marcas(spec, validas) {
  const s = new Set(lista(spec.resaltar));
  if ([...s].some((p) => !validas.includes(p))) return null;
  return { activo: s.size > 0, on: (p) => s.has(p), lista: [...s] };
}

const flecha = (x1, y1, x2, y2, k, id, w = 2.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k]}" stroke-width="${w}" marker-end="url(#${id}-k${k})" ${extra}/>`;
const linea = (x1, y1, x2, y2, k = 't', w = 1.2, extra = '') =>
  `<line x1="${fx(x1)}" y1="${fx(y1)}" x2="${fx(x2)}" y2="${fx(y2)}" style="stroke:${K[k] ?? k}" stroke-width="${w}" ${extra}/>`;

/** Texto con halo del color del fondo. o = { c, a, s, b, halo, extra } */
const tx = (x, y, t, o = {}) => {
  const w = String(t).replace(/<[^>]*>|&[a-z]+;/g, 'x').length * (o.s ?? 10) * (o.b ? 0.58 : 0.52);
  const a = o.a ?? 'start';
  const [i0, i1] = a === 'start' ? [0, w] : a === 'end' ? [-w, 0] : [-w / 2, w / 2];
  if (x + i0 < 6) x = 6 - i0;
  else if (x + i1 > 314) x = 314 - i1;
  const c = o.c ? (K[o.c] ?? o.c) : 'currentColor';
  return `<text x="${fx(x)}" y="${fx(y)}" class="il-lbl" text-anchor="${a}"${o.s ? ` font-size="${o.s}"` : ''}${o.b ? ' font-weight="700"' : ''}${o.halo === false ? ` style="fill:${c}"` : ` style="fill:${c};paint-order:stroke;stroke:var(--bg);stroke-width:3px;stroke-linejoin:round"`} ${o.extra ?? ''}>${t}</text>`;
};

/** Cabo: contorno con currentColor y alma de color (rojo y más grueso si está resaltado). */
const cuerda = (d, on = false, w = 3.6) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${on ? w + 3 : w + 2}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${on ? K.r : '#d6a35c'}" stroke-width="${on ? w + 1 : w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Fondo de mar con las esquinas de abajo redondeadas como el panel. */
const marAbajo = (W, y, H, fill = 'var(--l-mar)') => `<path d="M0,${y} H${W} V${H - 10} Q${W},${H} ${W - 10},${H} H10 Q0,${H} 0,${H - 10} Z" style="fill:${fill}"/>`;

// ===========================================================================
// 1. Amarrado a una boya: muerto, cadena, boya y las partes del cabo (per-2-1).
// spec: { tipo:'muerto-boya', resaltar?: 'muerto'|'cadena'|'boya'|'gaza'|'firme'|'seno'|'chicote' o lista }

const PARTES_MB = {
  muerto: 'El muerto es un gran peso de hormigón o de hierro que descansa en el fondo: es el amarre permanente.',
  cadena: 'Del muerto sube una cadena hasta la boya.',
  boya: 'La boya es el flotador sujeto al fondo al que te amarras tú (a ella o a su cabo).',
  gaza: 'La gaza es el lazo u ojo cerrado en el extremo del cabo, hecho con un nudo o con una costura.',
  firme: 'El firme es la parte principal del cabo, la que trabaja o queda sujeta.',
  seno: 'El seno es la curva o arco que forma el cabo cuando lo doblas.',
  chicote: 'El chicote es cada uno de los extremos libres del cabo.',
};

export function muertoBoyaIllustration(spec = {}) {
  const m = marcas(spec, Object.keys(PARTES_MB));
  if (!m) return null;
  const id = 'pmb';
  const W = 320;
  const H = 286;
  const on = m.on;
  const et = (x, y, t, p, a = 'middle') => tx(x, y, t, { a, b: !m.activo || on(p), c: on(p) ? 'r' : null, s: on(p) ? 11 : 10.5 });
  const out = start(W, H, 'Amarrado a una boya', id);
  out.push(title(160, 'Amarrado a una boya'));
  // mar y fondo
  out.push(`<rect x="0" y="132" width="${W}" height="126" style="fill:var(--l-mar)"/>`);
  out.push(marAbajo(W, 258, H, ARENA), `<rect x="0" y="258" width="${W}" height="${H - 258}" fill="none"/>`);
  out.push(tx(14, 276, 'fondo', { c: '#fff', b: true, halo: false }));
  // barco (de costado, proa a la derecha)
  out.push(`<path d="M18,110 L178,104 L160,140 L36,142 L22,132 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<rect x="34" y="94" width="48" height="15" rx="3" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
  // cornamusa en la proa
  out.push(`<rect x="142" y="100" width="20" height="4" rx="2" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1"/>`);
  // cadena del muerto a la boya
  const cad = 'M252,138 Q266,192 256,240';
  out.push(`<path d="${cad}" fill="none" stroke="currentColor" stroke-width="${on('cadena') ? 6 : 4.4}" stroke-dasharray="6 2.4"/>`);
  out.push(`<path d="${cad}" fill="none" style="stroke:${on('cadena') ? K.r : 'var(--l-g)'}" stroke-width="${on('cadena') ? 3.4 : 2.4}" stroke-dasharray="6 2.4"/>`);
  // muerto
  out.push(`<rect x="232" y="240" width="48" height="18" rx="2" style="fill:${on('muerto') ? K.r : 'var(--l-g)'}" stroke="currentColor" stroke-width="${on('muerto') ? 2.6 : 1.4}"/>`);
  // boya con su argolla
  out.push(`<circle cx="252" cy="107" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/>`);
  out.push(`<circle cx="252" cy="125" r="14" fill="${NARANJA}" stroke="currentColor" stroke-width="${on('boya') ? 3 : 1.4}"/>`);
  out.push(`<rect x="244" y="120" width="16" height="4" fill="#fff" opacity=".8"/>`);
  // cabo: tira el firme desde la gaza (en la argolla) hasta la cornamusa; el sobrante forma un seno y acaba en el chicote
  out.push(cuerda('M157,102 Q200,112 238,106', on('firme')));
  out.push(cuerda('M238,106 C244,96 262,98 262,107 C262,116 244,116 238,106', on('gaza'), 3));
  out.push(cuerda('M146,102 C130,102 128,126 116,126 C104,126 102,108 96,106', on('seno')));
  out.push(cuerda('M98,106.6 L90,105', on('chicote')), `<circle cx="90" cy="105" r="3.2" style="fill:${on('chicote') ? K.r : 'currentColor'}"/>`);
  // etiquetas
  out.push(et(84, 88, 'chicote', 'chicote'));
  out.push(tx(152, 92, 'cornamusa', { a: 'middle' }));
  out.push(et(204, 98, 'firme', 'firme'));
  out.push(et(268, 98, 'gaza', 'gaza', 'start'));
  out.push(et(270, 140, 'boya', 'boya', 'start'));
  out.push(linea(116, 130, 116, 150, 'g', 1, 'stroke-dasharray="2 2"'), et(116, 162, 'seno', 'seno'));
  out.push(et(268, 196, 'cadena', 'cadena', 'start'));
  out.push(et(222, 238, 'muerto', 'muerto', 'end'), tx(222, 252, 'bloque de hormigón o hierro', { a: 'end' }));
  out.push(tx(14, 186, 'Sin muelle, te amarras a la boya;'), tx(14, 200, 'el muerto la sujeta al fondo.'));
  const base = 'Amarrado a una boya: el muerto descansa en el fondo, de él sube una cadena hasta la boya y a la boya te amarras tú. En el cabo, la gaza es el ojo del extremo, el firme la parte que trabaja, el seno la curva que forma al doblarlo y el chicote el extremo libre.';
  return { svg: close(out), caption: m.activo ? m.lista.map((p) => PARTES_MB[p]).join(' ') : base };
}

// ===========================================================================
// 2. Reflector radar y tormenta eléctrica (per-3-4).
// spec: { tipo:'reflector-tormenta', vista?: 'reflector'|'tormenta' }

function reflectorRadar() {
  const id = 'prr';
  const W = 320;
  const H = 262;
  const out = start(W, H, 'El reflector radar', id);
  out.push(title(160, 'Reflector radar: para que te vean'));
  out.push(`<rect x="0" y="160" width="${W}" height="30" style="fill:var(--l-mar)"/>`);
  // velero de fibra con el reflector en lo alto del palo
  out.push(`<path d="M24,156 L118,156 L106,170 L36,170 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(linea(70, 156, 70, 60, 't', 2));
  out.push(`<path d="M72,64 L108,150 L72,150 Z" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1" opacity=".9"/>`);
  out.push(`<g transform="translate(70,82)"><path d="M0,-11 L10,0 L0,11 L-10,0 Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.6"/><path d="M0,-11 V11 M-10,0 H10" stroke="currentColor" stroke-width="1"/></g>`);
  out.push(tx(70, 44, 'reflector radar', { a: 'middle', b: true, s: 11 }), tx(70, 57, 'lo más alto posible', { a: 'middle', c: 'g' }));
  // mercante con su radar
  out.push(`<path d="M206,150 L314,150 L310,172 L214,172 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.3"/>`);
  out.push(`<rect x="270" y="122" width="34" height="28" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(linea(287, 122, 287, 104, 't', 1.6), `<rect x="276" y="100" width="22" height="4" rx="1" fill="currentColor"/>`);
  out.push(tx(259, 186, 'mercante con radar', { a: 'middle' }));
  // ondas que van y vuelven
  for (const r of [10, 18, 26]) out.push(`<path d="M${287 - r},${102 - r * 0.55} A${r},${r} 0 0 0 ${287 - r},${102 + r * 0.55}" fill="none" style="stroke:var(--l-v)" stroke-width="1.4" opacity=".8"/>`);
  out.push(flecha(254, 96, 86, 80, 'v', id, 2.2));
  out.push(flecha(86, 90, 252, 112, 'm', id, 2.6));
  out.push(tx(172, 80, 'las ondas de su radar', { a: 'middle', c: 'v', b: true }));
  out.push(tx(172, 120, 'rebotan y vuelven: te ve', { a: 'middle', c: 'm', b: true }));
  out.push(tx(48, 186, 'fibra o madera', { a: 'middle' }));
  // notas
  const notas = [
    ['Pasivo: no emite nada ni gasta energía.', false],
    ['No mejora tu radar ni se orienta a mano.', false],
    ['Obligatorio en casco no metálico, en todas', true],
    ['las zonas (RD 339/2021). Con niebla, clave.', true],
  ];
  notas.forEach(([t, b], i) => out.push(tx(12, 210 + i * 14, t, { b })));
  return { svg: close(out), caption: 'El reflector radar es pasivo: devuelve las ondas de los radares de otros barcos para que te vean en sus pantallas; no mejora tu radar. Se iza lo más alto posible y el RD 339/2021 lo exige en los barcos de casco no metálico, en todas las zonas.' };
}

function tormenta() {
  const id = 'ptt';
  const W = 320;
  const H = 280;
  const out = start(W, H, 'Tormenta eléctrica a bordo', id);
  out.push(title(160, 'Tormenta eléctrica a bordo'));
  // nube y rayo
  out.push(`<path d="M18,58 C10,58 10,44 22,44 C22,32 42,30 48,40 C54,32 72,34 72,46 C82,46 82,58 72,58 Z" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<path d="M52,58 L66,62 L60,66 L96,72 L74,72 L82,76 L117,77" fill="none" stroke="#facc15" stroke-width="3" stroke-linejoin="round"/><path d="M52,58 L66,62 L60,66 L96,72 L74,72 L82,76 L117,77" fill="none" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/>`);
  // mar
  out.push(`<rect x="0" y="170" width="${W}" height="44" style="fill:var(--l-mar)"/>`);
  // velero: casco, cámara cortada, quilla, palo y obenques
  out.push(`<path d="M30,160 L206,160 L190,184 L50,184 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<path d="M106,184 L134,184 L128,206 L112,206 Z" style="fill:var(--l-g)" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(linea(120, 160, 120, 76, 't', 2.4), linea(120, 80, 52, 160, 't', 1), linea(120, 80, 192, 160, 't', 1));
  // camino de la descarga: palo → quilla → agua
  out.push(`<path d="M126,82 L126,198" fill="none" style="stroke:var(--l-a)" stroke-width="2" stroke-dasharray="4 3"/>`);
  out.push(flecha(132, 198, 150, 210, 'a', id, 2));
  out.push(tx(158, 206, 'palo unido a la quilla:', { c: 'a', b: true }), tx(158, 219, 'la descarga va al agua', { c: 'a', b: true }));
  // la persona, dentro de la cámara, lejos del palo
  out.push(`<rect x="148" y="146" width="40" height="14" rx="2" style="fill:var(--bg)" stroke="currentColor" stroke-width="1"/>`);
  out.push(`<g style="stroke:var(--l-m)" stroke-width="2" stroke-linecap="round"><circle cx="170" cy="148" r="3.2" style="fill:var(--l-m)"/><path d="M170,151 V158 M166,154 H174"/></g>`);
  out.push(tx(196, 140, 'tú: dentro, lejos', { c: 'm', b: true }), tx(196, 153, 'del palo y obenques', { c: 'm', b: true }));
  // la aguja después de la tormenta
  const cx = 270;
  const cy = 64;
  out.push(`<circle cx="${cx}" cy="${cy}" r="20" style="fill:var(--bg)" stroke="currentColor" stroke-width="1.6"/>`);
  out.push(`<path d="M${cx},${cy - 16} V${cy + 16}" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2" opacity=".6"/>`);
  out.push(`<g transform="rotate(24 ${cx} ${cy})"><path d="M${cx},${cy - 16} L${cx + 4},${cy} L${cx - 4},${cy} Z" style="fill:var(--l-r)"/><path d="M${cx},${cy + 16} L${cx + 4},${cy} L${cx - 4},${cy} Z" style="fill:var(--l-g)"/></g>`);
  out.push(tx(cx - 26, 46, 'la aguja', { a: 'end', b: true }));
  out.push(tx(cx, 98, 'desvío anómalo', { a: 'middle', c: 'r', b: true }), tx(cx, 111, 'temporal', { a: 'middle' }), tx(cx, 123, 'o permanente', { a: 'middle' }));
  // notas
  const notas = [
    ['No toques el palo, los obenques ni piezas metálicas.', false],
    ['Apaga y desconecta la electrónica no imprescindible.', false],
    ['Después: comprueba la aguja (con una enfilación);', true],
    ['si ha cambiado, nueva tablilla. La declinación, no.', true],
  ];
  notas.forEach(([t, b], i) => out.push(tx(12, 234 + i * 13, t, { b })));
  return { svg: close(out), caption: 'Con tormenta eléctrica, dentro y lejos del palo, los obenques y los metales, sin tocarlos, y con la electrónica no imprescindible apagada. El rayo puede producir un desvío anómalo de la aguja, temporal o permanente: compruébala después. La declinación magnética no cambia.' };
}

export function reflectorTormentaIllustration(spec = {}) {
  const v = spec.vista ?? 'reflector';
  if (v === 'reflector') return reflectorRadar();
  if (v === 'tormenta') return tormenta();
  return null;
}

// ===========================================================================

export const LAMINAS = {
  'muerto-boya': {
    fn: muertoBoyaIllustration,
    params: { resaltar: Object.keys(PARTES_MB) },
    ejemplo: { tipo: 'muerto-boya' },
  },
  'reflector-tormenta': {
    fn: reflectorTormentaIllustration,
    params: { vista: ['reflector', 'tormenta'] },
    ejemplo: { tipo: 'reflector-tormenta', vista: 'reflector' },
  },
  'dotacion-zonas': {
    fn: dotacionZonasC,
    params: { resaltar: EQUIPOS, zona: [1, 2, 3, 4, 5, 6, 7] },
    ejemplo: { tipo: 'dotacion-zonas' },
  },
  'tanque-retencion': {
    fn: tanqueRetencionC,
    params: { vista: ['puerto', 'mar'], resaltar: `una parte o lista, solo en la vista puerto: ${PARTES_TQ.join(', ')}` },
    ejemplo: { tipo: 'tanque-retencion', vista: 'puerto' },
  },
  'marpol-basuras': {
    fn: marpolBasurasC,
    params: { zona: ['atlantico', 'mediterraneo'] },
    ejemplo: { tipo: 'marpol-basuras' },
  },
};
