// Segundas láminas del PER: amarrado a una boya con las partes del cabo (per-2-1), el reflector radar y la
// tormenta eléctrica (per-3-4), lo que exige cada zona en chalecos, aros y balsas (per-3-5), el tanque de
// retención y su vaciado (per-4-4) y las basuras a un lado y otro del estrecho (per-4-5).
// Funciones puras spec → { svg, caption }. Admiten `resaltar` donde la lámina tiene partes.
// Los colores van con variables CSS de styles/app.css para leerse en claro y oscuro.

import { open, title, fx } from '../kit.js';

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
// 3. Chalecos, aros y balsas: lo que exige cada zona (per-3-5).
// spec: { tipo:'dotacion-zonas', resaltar?: 'chaleco'|'aro'|'balsa' o lista, zona?: 1–7 }

const EQUIPOS = ['chaleco', 'aro', 'balsa'];
const GRUPOS = [
  { zonas: [1], nombre: 'Zona 1', sub: 'ilimitada', celdas: [['275 N', 'con luz', '+1 de más'], ['2 aros', 'uno con luz', 'y rabiza'], ['Sí', 'para todos', 'a bordo']] },
  { zonas: [2, 3], nombre: 'Zonas 2 y 3', sub: '60 y 25 millas', celdas: [['150 N', 'con luz'], ['1 aro', 'con luz', 'y rabiza'], ['Sí', 'para todos', 'a bordo']] },
  { zonas: [4], nombre: 'Zona 4', sub: '12 millas', celdas: [['150 N', 'con luz;', 'de día, sin luz'], ['1 aro', 'con luz', 'y rabiza'], ['No']] },
  { zonas: [5, 6, 7], nombre: 'Zonas 5 a 7', sub: 'costeras y protegidas', celdas: [['100 N', 'con luz;', 'de día, sin luz'], ['No'], ['No']] },
];

const iconoEquipo = (k, x, y) => {
  if (k === 'chaleco') return `<path d="M${x - 9},${y - 11} L${x - 3},${y - 11} L${x},${y - 5} L${x + 3},${y - 11} L${x + 9},${y - 11} L${x + 11},${y + 11} L${x - 11},${y + 11} Z" fill="${NARANJA}" stroke="currentColor" stroke-width="1.2"/><line x1="${x - 10}" y1="${y + 3}" x2="${x + 10}" y2="${y + 3}" stroke="#fff" stroke-width="1.6"/>`;
  if (k === 'aro') return `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="currentColor" stroke-width="7.6"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${NARANJA}" stroke-width="5.4"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#fff" stroke-width="5.4" stroke-dasharray="5 9.1"/>`;
  return `<path d="M${x - 16},${y + 6} Q${x - 16},${y + 12} ${x - 10},${y + 12} L${x + 10},${y + 12} Q${x + 16},${y + 12} ${x + 16},${y + 6} L${x + 16},${y + 3} L${x - 16},${y + 3} Z" fill="${NARANJA}" stroke="currentColor" stroke-width="1.2"/><path d="M${x - 13},${y + 3} Q${x},${y - 18} ${x + 13},${y + 3} Z" fill="${NARANJA}" fill-opacity=".75" stroke="currentColor" stroke-width="1.2"/>`;
};

export function dotacionZonasIllustration(spec = {}) {
  const m = marcas(spec, EQUIPOS);
  if (!m) return null;
  const zona = spec.zona == null ? null : Number(spec.zona);
  if (zona != null && !(Number.isInteger(zona) && zona >= 1 && zona <= 7)) return null;
  const id = 'pdz';
  const W = 320;
  const xs = [8, 90, 180, 250, 312]; // columnas: zona | chaleco | aro | balsa
  const yh = 74; // fin de la cabecera
  const fila = 48;
  const H = yh + GRUPOS.length * fila + 58;
  const out = start(W, H, 'Chalecos, aros y balsas por zonas', id);
  out.push(title(160, 'Chalecos, aros y balsas por zona'));
  const nombres = { chaleco: 'Chalecos', aro: 'Aros', balsa: 'Balsa' };
  EQUIPOS.forEach((k, i) => {
    const cx = (xs[i + 1] + xs[i + 2]) / 2;
    out.push(iconoEquipo(k, cx, 44));
    out.push(tx(cx, yh - 6, nombres[k], { a: 'middle', b: true, s: m.on(k) ? 12 : 11, c: m.on(k) ? 'r' : null }));
  });
  out.push(tx(xs[0] + 2, yh - 6, 'zona', { c: 'g', b: true }));
  GRUPOS.forEach((g, r) => {
    const y = yh + r * fila;
    const zOn = zona != null && g.zonas.includes(zona);
    out.push(linea(xs[0], y, xs[4], y, 'g', 1));
    out.push(tx(xs[0] + 2, y + 18, g.nombre, { b: true, s: zOn ? 11.5 : 10.5, c: zOn ? 'r' : null }), tx(xs[0] + 2, y + 32, g.sub, { c: 'g', s: 9.5 }));
    g.celdas.forEach((lineas, i) => {
      const x0 = xs[i + 1];
      const x1 = xs[i + 2];
      const cx = (x0 + x1) / 2;
      const no = lineas[0] === 'No';
      if (!no) out.push(`<rect x="${x0 + 2}" y="${y + 3}" width="${x1 - x0 - 4}" height="${fila - 6}" rx="5" style="fill:var(--l-m)" fill-opacity=".14"/>`);
      const n = lineas.length;
      const y0 = y + fila / 2 - ((n - 1) * 12) / 2 + 4;
      lineas.forEach((t, j) => out.push(tx(cx, y0 + j * 12, j === 0 && no ? '✗ No' : t, { a: 'middle', b: j === 0, s: j === 0 ? 11.5 : 10, c: no ? 'g' : j === 0 ? 'm' : null, halo: false })));
    });
    if (zOn) out.push(`<rect x="${xs[0] - 2}" y="${y + 1}" width="${xs[4] - xs[0] + 4}" height="${fila - 2}" rx="6" fill="none" style="stroke:var(--l-r)" stroke-width="2.4"/>`);
  });
  const yb = yh + GRUPOS.length * fila;
  out.push(linea(xs[0], yb, xs[4], yb, 'g', 1));
  EQUIPOS.forEach((k, i) => {
    if (m.on(k)) out.push(`<rect x="${xs[i + 1]}" y="28" width="${xs[i + 2] - xs[i + 1]}" height="${yb - 26}" rx="6" fill="none" style="stroke:var(--l-r)" stroke-width="2.4"/>`);
  });
  const notas = ['Chalecos: uno por persona (también niños y bebés).', 'Aro: hacia las aletas o en popa, con suelta rápida.', 'Balsa: con zafa hidrostática, que la suelta sola.'];
  notas.forEach((t, i) => out.push(tx(xs[0], yb + 18 + i * 14, t, { s: 9.6, b: m.on(EQUIPOS[i]) })));
  const caps = {
    chaleco: 'Chalecos: uno por persona con su luz (en zonas 4 a 7, si solo navegas de día, sin luz vale); 275 N en zona 1, con uno adicional, 150 N en zonas 2 a 4 y 100 N en zonas 5 a 7.',
    aro: 'Aros: en zonas 1 a 4, uno con luz y rabiza; en zona 1, además, otro sin luz ni rabiza. En zonas 5 a 7 no es obligatorio.',
    balsa: 'Balsa: obligatoria en zonas 1, 2 y 3, con capacidad para todas las personas a bordo.',
  };
  const caption = m.activo ? m.lista.map((k) => caps[k]).join(' ') : 'Cuanto menor es el número de zona, más equipo: chalecos de 275 N en zona 1, de 150 N en 2 a 4 y de 100 N en 5 a 7; aro con luz y rabiza en zonas 1 a 4 (dos en zona 1), y balsa para todos en zonas 1 a 3.';
  return { svg: close(out), caption };
}

// ===========================================================================
// 4. Aguas sucias: el tanque de retención, el vaciado en puerto y en la mar (per-4-4).
// spec: { tipo:'tanque-retencion', vista?: 'puerto'|'mar', resaltar?: (puerto) 'inodoro'|'tanque'|'conexion'|'valvula'|'bomba' o lista }

const PARTES_TQ = {
  inodoro: 'Si llevas inodoro, necesitas tanque de retención, instalación de tratamiento o sistema para desmenuzar y desinfectar.',
  tanque: 'El tanque de retención guarda las aguas sucias; su capacidad depende de la duración de la navegación y de las personas a bordo.',
  conexion: 'El tanque fijo lleva conexión universal a tierra para vaciarlo en puerto.',
  valvula: 'Los pasacascos de descarga al mar llevan válvulas que se pueden cerrar y precintar.',
  bomba: 'En puerto, el tanque se vacía en la instalación del puerto.',
};

function tanquePuerto(spec) {
  const m = marcas(spec, Object.keys(PARTES_TQ));
  if (!m) return null;
  const on = m.on;
  const id = 'ptq';
  const W = 320;
  const H = 268;
  const out = start(W, H, 'Tanque de retención y vaciado en puerto', id);
  out.push(title(160, 'Tanque de retención: se vacía en puerto'));
  const et = (x, y, t, p, a = 'middle', c = null) => tx(x, y, t, { a, b: !m.activo || on(p), c: on(p) ? 'r' : c, s: on(p) ? 11 : 10.5 });
  // muelle y agua
  out.push(`<rect x="0" y="132" width="236" height="76" style="fill:var(--l-mar)"/>`);
  out.push(`<rect x="236" y="104" width="84" height="104" style="fill:var(--l-g)" opacity=".55"/>`, linea(236, 104, 320, 104, 't', 1.4), linea(236, 104, 236, 208, 't', 1.4));
  out.push(tx(278, 200, 'muelle', { a: 'middle', b: true }));
  // casco cortado
  out.push(`<path d="M14,100 L228,100 L214,170 L34,170 L16,128 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  out.push(`<path d="M30,112 L214,112 L204,160 L42,160 L30,130 Z" style="fill:var(--bg)" stroke="currentColor" stroke-width=".8" opacity=".85"/>`);
  // inodoro
  const io = on('inodoro');
  out.push(`<path d="M50,128 H74 Q74,146 64,148 L64,158 H56 L56,148 Q50,146 50,128 Z" style="fill:var(--l-nube)" stroke="${io ? K.r : 'currentColor'}" stroke-width="${io ? 2.6 : 1.2}"/><rect x="46" y="114" width="8" height="14" style="fill:var(--l-nube)" stroke="currentColor" stroke-width="1"/>`);
  // tubería inodoro → tanque
  out.push(`<path d="M62,158 V154 H104" fill="none" stroke="currentColor" stroke-width="3"/>`);
  // tanque
  const tq = on('tanque');
  out.push(`<rect x="104" y="126" width="58" height="32" rx="4" style="fill:var(--l-a)" fill-opacity=".35" stroke="${tq ? K.r : 'currentColor'}" stroke-width="${tq ? 2.8 : 1.4}"/>`);
  out.push(tx(133, 146, 'tanque', { a: 'middle', b: true, c: tq ? 'r' : null, halo: false }));
  // pasacascos con válvula cerrada y precintada
  const va = on('valvula');
  out.push(`<path d="M120,158 V174" stroke="currentColor" stroke-width="3"/>`);
  out.push(`<path d="M113,162 L127,170 L127,162 L113,170 Z" style="fill:${va ? K.r : 'var(--l-g)'}" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(linea(98, 174, 120, 174, 'g', 1, 'stroke-dasharray="2 2"'));
  out.push(et(94, 186, 'válvula al mar: cerrada', 'valvula', 'end'), et(94, 199, 'y precintada', 'valvula', 'end'));
  // conexión universal en cubierta y manguera a la bomba
  const co = on('conexion');
  out.push(`<path d="M150,126 V100" stroke="currentColor" stroke-width="3"/>`);
  out.push(`<rect x="143" y="94" width="14" height="7" rx="2" style="fill:${co ? K.r : 'var(--l-g)'}" stroke="currentColor" stroke-width="1.2"/>`);
  out.push(`<path d="M150,94 C150,64 230,62 262,82" fill="none" stroke="currentColor" stroke-width="4.6"/><path d="M150,94 C150,64 230,62 262,82" fill="none" style="stroke:var(--l-m)" stroke-width="2.6"/>`);
  out.push(flecha(196, 62, 230, 62, 'm', id, 2));
  out.push(et(142, 52, 'conexión universal', 'conexion', 'middle'), et(142, 65, 'a tierra', 'conexion', 'middle'));
  // bomba del puerto
  const bo = on('bomba');
  out.push(`<rect x="258" y="78" width="40" height="26" rx="4" style="fill:var(--l-m)" fill-opacity=".3" stroke="${bo ? K.r : 'currentColor'}" stroke-width="${bo ? 2.6 : 1.4}"/>`);
  out.push(et(278, 120, 'bomba', 'bomba'), et(278, 133, 'del puerto', 'bomba'));
  out.push(et(78, 122, 'inodoro', 'inodoro', 'start'));
  // notas
  out.push(tx(10, 226, 'En puertos, dársenas y aguas protegidas (zona 7):', { b: true }));
  out.push(tx(10, 240, 'nada al mar; el tanque se vacía en el puerto.', { b: true }));
  out.push(tx(10, 256, 'Con marcado CE, el barco ya cumple por construcción.'));
  const base = 'Si llevas inodoro, las aguas sucias van a un tanque de retención (o a un sistema homologado de tratamiento, o de desmenuzar y desinfectar). El tanque fijo tiene conexión universal a tierra para vaciarlo en la instalación del puerto, y la válvula de descarga al mar se puede cerrar y precintar.';
  return { svg: close(out), caption: m.activo ? m.lista.map((p) => PARTES_TQ[p]).join(' ') : base };
}

function tanqueMar(spec) {
  if (lista(spec.resaltar).length) return null;
  const id = 'ptm';
  const W = 320;
  const H = 262;
  const out = start(W, H, 'Vaciar el tanque en la mar', id);
  out.push(title(160, 'Vaciar el tanque en la mar'));
  // barco en ruta con su estela y la descarga poco a poco
  out.push(`<rect x="0" y="70" width="${W}" height="54" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M20,92 Q70,86 120,90 M30,104 Q80,106 120,100" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>`);
  out.push(`<path d="M120,84 L200,84 Q226,90 230,96 Q226,102 200,108 L120,108 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1.4"/>`);
  for (const [x, y] of [[112, 100], [98, 103], [84, 104], [70, 104]]) out.push(`<circle cx="${x}" cy="${y}" r="1.8" style="fill:var(--l-a)"/>`);
  out.push(flecha(236, 96, 300, 96, 'v', id, 2.6));
  out.push(tx(310, 62, 'en ruta, a 4 nudos o más', { a: 'end', c: 'v', b: true }));
  out.push(tx(10, 62, 'poco a poco', { c: 'a', b: true }));
  out.push(tx(10, 144, '✗ Nunca de golpe, parado ni fondeado.', { c: 'r', b: true }));
  // dónde: desde la línea de base
  const x0 = 12;
  const x3 = 134;
  const x12 = 240;
  const xe = 308;
  const ye = 174;
  for (const [x, t] of [[x0, 'línea de base'], [x3, '3 mn'], [x12, '12 mn']]) {
    out.push(linea(x, ye - 8, x, ye + 76, 't', 1, 'stroke-dasharray="2 2" opacity=".7"'));
    out.push(tx(x, ye - 12, t, { a: x === x0 ? 'start' : 'middle', b: true }));
  }
  const barra = (y, desde, t1, t2) => {
    out.push(`<rect x="${x0}" y="${y}" width="${desde - x0}" height="14" style="fill:var(--l-r)" fill-opacity=".16"/>`);
    out.push(`<rect x="${desde}" y="${y}" width="${xe - desde}" height="14" style="fill:var(--l-m)" fill-opacity=".3"/>`);
    out.push(tx((x0 + desde) / 2, y + 11, '✗ no', { a: 'middle', c: 'r', b: true, halo: false }));
    out.push(tx((desde + xe) / 2, y + 11, '✓ sí', { a: 'middle', c: 'm', b: true, halo: false }));
    out.push(tx(10, y - 4, t1, { b: true }), tx(310, y - 4, t2, { a: 'end', c: 'm', b: true }));
  };
  barra(ye + 18, x3, 'Desmenuzadas y desinfectadas', '> 3 mn');
  barra(ye + 60, x12, 'Sin desmenuzar ni desinfectar', '> 12 mn');
  return { svg: close(out), caption: 'El tanque se vacía a régimen moderado, en ruta y a 4 nudos como mínimo, nunca parado ni fondeado. Desde la línea de base: desmenuzadas y desinfectadas, a más de 3 millas; sin desmenuzar ni desinfectar, a más de 12.' };
}

export function tanqueRetencionIllustration(spec = {}) {
  const v = spec.vista ?? 'puerto';
  if (v === 'puerto') return tanquePuerto(spec);
  if (v === 'mar') return tanqueMar(spec);
  return null;
}

// ===========================================================================
// 5. Basuras (MARPOL anexo V) a un lado y otro del estrecho (per-4-5).
// spec: { tipo:'marpol-basuras', zona?: 'atlantico'|'mediterraneo' }

const FILAS_BAS = [
  [['Plásticos y', 'aceite de cocina'], ['✗ nunca'], ['✗ nunca']],
  [['Papel, vidrio, latas,', 'envases, trapos…'], ['✗ no', 'al puerto'], ['✗ no', 'al puerto']],
  [['Comida triturada', '(criba de 25 mm)'], ['✓ sí', 'a más de 3 mn'], ['✓ sí', 'a más de 12 mn']],
  [['Comida', 'sin triturar'], ['✓ sí', 'a más de 12 mn'], ['✗ no', 'al puerto']],
];

export function marpolBasurasIllustration(spec = {}) {
  const z = spec.zona ?? null;
  if (z != null && !['atlantico', 'mediterraneo'].includes(z)) return null;
  const id = 'pmv';
  const W = 320;
  const xs = [8, 128, 218, 312];
  const yt = 124; // comienzo de la tabla
  const fila = 34;
  const H = yt + 22 + FILAS_BAS.length * fila + 40;
  const out = start(W, H, 'Basuras: Atlántico y Mediterráneo', id);
  out.push(title(160, 'Basuras: mira dónde estás'));
  // mapa esquemático del estrecho
  out.push(`<rect x="8" y="32" width="304" height="62" rx="6" style="fill:var(--l-mar)"/>`);
  out.push(`<path d="M8,38 Q8,32 14,32 H306 Q312,32 312,38 V50 Q260,54 214,52 Q180,50 162,60 Q150,62 140,58 Q110,50 80,54 Q40,58 8,54 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
  out.push(`<path d="M8,94 V88 Q60,84 120,86 Q140,74 160,72 Q190,80 250,84 Q290,86 312,84 V88 Q312,94 306,94 Z" style="fill:var(--l-casco)" stroke="currentColor" stroke-width="1"/>`);
  out.push(linea(148, 30, 148, 98, 'r', 1.6, 'stroke-dasharray="4 3"'));
  out.push(tx(148, 108, "meridiano 5° 36' W", { a: 'middle', c: 'r', b: true }));
  for (const [x, y, t] of [[26, 50, 'Huelva'], [64, 52, 'Cádiz'], [106, 52, 'Trafalgar'], [196, 51, 'Málaga'], [262, 50, 'Almería']]) {
    out.push(`<circle cx="${x}" cy="${y}" r="2.2" fill="currentColor"/>`);
    out.push(tx(x, 44, t, { a: 'middle', s: 9.5, halo: false }));
  }
  const zOn = (k) => z === k;
  out.push(tx(78, 74, 'Atlántico', { a: 'middle', b: true, s: zOn('atlantico') ? 11.5 : 10.5, c: zOn('atlantico') ? 'r' : null }));
  out.push(tx(232, 70, 'Mediterráneo', { a: 'middle', b: true, s: zOn('mediterraneo') ? 11.5 : 10.5, c: zOn('mediterraneo') ? 'r' : null }), tx(232, 81, 'zona especial', { a: 'middle', s: 9.5 }));
  // tabla
  out.push(tx((xs[1] + xs[2]) / 2, yt + 12, 'Atlántico', { a: 'middle', b: true, c: zOn('atlantico') ? 'r' : null }));
  out.push(tx((xs[2] + xs[3]) / 2, yt + 12, 'Mediterráneo', { a: 'middle', b: true, c: zOn('mediterraneo') ? 'r' : null }));
  FILAS_BAS.forEach(([nombre, ...celdas], r) => {
    const y = yt + 20 + r * fila;
    out.push(linea(xs[0], y, xs[3], y, 'g', 1));
    nombre.forEach((t, j) => out.push(tx(xs[0], y + 15 + j * 12, t, { b: j === 0, halo: false })));
    celdas.forEach((ls, i) => {
      const x0 = xs[i + 1];
      const x1 = xs[i + 2];
      const ok = ls[0].startsWith('✓');
      out.push(`<rect x="${x0 + 2}" y="${y + 3}" width="${x1 - x0 - 4}" height="${fila - 6}" rx="4" style="fill:${ok ? 'var(--l-m)' : 'var(--l-r)'}" fill-opacity="${ok ? 0.26 : 0.13}"/>`);
      const y0 = ls.length === 1 ? y + 21 : y + 15;
      ls.forEach((t, j) => out.push(tx((x0 + x1) / 2, y0 + j * 12.5, t, { a: 'middle', b: j === 0, c: j === 0 ? (ok ? 'm' : 'r') : null, halo: false, s: j === 0 ? 10.5 : 10 })));
    });
  });
  const yb = yt + 20 + FILAS_BAS.length * fila;
  out.push(linea(xs[0], yb, xs[3], yb, 'g', 1));
  const ci = { atlantico: 1, mediterraneo: 2 }[z];
  if (ci) out.push(`<rect x="${xs[ci]}" y="${yt}" width="${xs[ci + 1] - xs[ci]}" height="${yb - yt + 2}" rx="6" fill="none" style="stroke:var(--l-r)" stroke-width="2.4"/>`);
  out.push(tx(xs[0], yb + 16, 'La comida, siempre en ruta y sin bolsas ni envoltorios.', { s: 9.8 }));
  out.push(tx(xs[0], yb + 30, 'Mezclada con otra basura, se aplica la regla más dura.', { s: 9.8 }));
  const caps = {
    atlantico: 'En el Atlántico (frente a Huelva, Cádiz o Trafalgar), fuera de zona especial: comida triturada a más de 3 millas y sin triturar a más de 12, siempre en ruta.',
    mediterraneo: 'El Mediterráneo, al este del meridiano 5° 36\' W (Málaga, Almería, Baleares), es zona especial: la comida solo triturada, a más de 12 millas y en ruta; sin triturar, al puerto.',
  };
  const caption = z ? caps[z] : 'Plásticos y aceite de cocina, nunca; papel, vidrio, latas y envases, al puerto. La comida, al oeste del meridiano 5° 36\' W (Atlántico), triturada a más de 3 millas y sin triturar a más de 12; en el Mediterráneo, zona especial, solo triturada y a más de 12 millas.';
  return { svg: close(out), caption };
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
    fn: dotacionZonasIllustration,
    params: { resaltar: EQUIPOS, zona: [1, 2, 3, 4, 5, 6, 7] },
    ejemplo: { tipo: 'dotacion-zonas' },
  },
  'tanque-retencion': {
    fn: tanqueRetencionIllustration,
    params: { vista: ['puerto', 'mar'], resaltar: `una parte o lista, solo en la vista puerto: ${Object.keys(PARTES_TQ).join(', ')}` },
    ejemplo: { tipo: 'tanque-retencion', vista: 'puerto' },
  },
  'marpol-basuras': {
    fn: marpolBasurasIllustration,
    params: { zona: ['atlantico', 'mediterraneo'] },
    ejemplo: { tipo: 'marpol-basuras' },
  },
};
