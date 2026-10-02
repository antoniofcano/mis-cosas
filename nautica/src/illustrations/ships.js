// Ilustraciones: luces y marcas del RIPA (Reglas 21–30). Un buque visto de noche desde proa, una banda o popa,
// o de día con sus marcas.
// spec: { tipo:'buque', clase, vista:'proa'|'babor'|'estribor'|'popa'|'todas', dia?: bool, arrancada?: bool,
//         obstruccion?: 'babor'|'estribor' (draga), aparejo?: 'babor'|'estribor' (pesquero con aparejo > 150 m) }

const COL = { W: '#fffbe6', R: '#ef4444', G: '#22c55e', Y: '#facc15' };

// Luces de cada clase: [tipo, at, h, opciones?]. at: 'proa'|'popa'|'centro'; h: altura (0..1);
// tipo: tope | todo-W/R/G | remolque | linterna | tricolor. opciones.lado: 'obs' | 'libre' | 'aparejo' | 'ambos' (luz
// desplazada a una banda: verga, banda obstruida…); opciones.siempre: se muestra aunque no tenga arrancada.
// Las de costado, tope y alcance solo con arrancada (si arrancada:false se omiten en sin gobierno / restringido / pesquero).
// vistas: las vistas que tienen sentido (las luces a una banda solo se distinguen de proa o de popa).
// dia: marcas en el palo, de arriba abajo; diaLados: marcas a una banda { obs|libre|aparejo|ambos: [...] } y desde qué
// marca (índice en dia) cuelgan.
export const SHIPS = {
  motor: { nombre: 'Buque de propulsión mecánica en navegación (< 50 m)', luces: [['tope', 'proa', 0.75]], dia: [] },
  'motor-50': { nombre: 'Buque de propulsión mecánica en navegación (≥ 50 m)', luces: [['tope', 'proa', 0.6], ['tope', 'popa', 0.9]], dia: [] },
  'motor-menor-12': { nombre: 'Buque de propulsión mecánica < 12 m', luces: [['todo-W', 'centro', 0.7]], sinAlcance: true, dia: [] },
  'motor-menor-7': { nombre: 'Propulsión mecánica < 7 m y ≤ 7 nudos (costados si es posible)', luces: [['todo-W', 'centro', 0.6]], sinAlcance: true, dia: [] },
  vela: { nombre: 'Buque de vela en navegación', luces: [], dia: [] },
  'vela-tope': { nombre: 'Buque de vela con luces opcionales (roja sobre verde en el tope)', luces: [['todo-R', 'centro', 0.95], ['todo-G', 'centro', 0.85]], dia: [] },
  'vela-tricolor': {
    nombre: 'Velero < 20 m con farol combinado en el tope', luces: [['tricolor', 'centro', 0.95]], sinCostados: true, dia: [],
    nota: 'Regla 25 b): el velero de menos de 20 m puede llevar costados y alcance en un solo farol combinado (tricolor) en el tope del palo. No puede llevarlo junto con las opcionales roja sobre verde, y si navega a motor no vale: debe encender las luces de buque de motor.',
  },
  'vela-motor': { nombre: 'Buque de vela navegando también a motor', luces: [['tope', 'proa', 0.75]], dia: ['cono-abajo'] },
  remolque: { nombre: 'Buque remolcando (remolque ≤ 200 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75], ['remolque', 'popa', 0.5]], dia: [] },
  'remolque-200': { nombre: 'Buque remolcando (remolque > 200 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.74], ['tope', 'proa', 0.86], ['remolque', 'popa', 0.5]], dia: ['bicono'] },
  remolcado: {
    nombre: 'Buque remolcado (remolque ≤ 200 m)', luces: [], dia: [],
    nota: 'Regla 24 e): el buque remolcado lleva luces de costado y de alcance, como un velero (sin luces de tope). Si el remolque mide más de 200 m, de día exhibe además una marca bicónica.',
  },
  'remolcado-200': {
    nombre: 'Buque remolcado (remolque > 200 m)', luces: [], dia: ['bicono'],
    nota: 'Regla 24 e): costados y alcance; con un remolque de más de 200 m (desde la popa del remolcador hasta el extremo de popa del remolque), una marca bicónica en el lugar más visible, igual que el remolcador.',
  },
  empujando: {
    nombre: 'Buque empujando a proa (sin unidad rígida, < 50 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75]], dia: [],
    nota: 'Regla 24 c): el que empuja a proa sin formar unidad compuesta lleva dos luces de tope en vertical, costados y alcance, pero no la luz amarilla de remolque (con 50 m o más, además la de tope a popa). El grupo se ilumina como un solo buque: el empujado lleva sus costados en el extremo de proa.',
  },
  empujado: {
    nombre: 'Buque empujado a proa (sin unidad rígida)', luces: [], sinAlcance: true, dia: [],
    nota: 'Regla 24 f i): el buque empujado a proa, sin formar unidad compuesta, solo lleva luces de costado en su extremo de proa; la luz de alcance la lleva el que empuja, detrás de él.',
  },
  'empuje-rigido': {
    nombre: 'Empujador y empujado en unidad rígida (≥ 50 m)', luces: [['tope', 'proa', 0.6], ['tope', 'popa', 0.9]], dia: [],
    nota: 'Regla 24 b): si empujador y empujado están unidos rígidamente formando una unidad compuesta, son un buque de propulsión mecánica y llevan sus luces (Regla 23): aquí, de 50 m o más, dos de tope. En niebla, pitada larga como un buque de motor.',
  },
  'remolque-costado': {
    nombre: 'Buque remolcando por el costado (< 50 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75]], dia: [],
    nota: 'Regla 24 c): el que remolca por el costado lleva dos luces de tope en vertical, costados y alcance, sin luz de remolque (con 50 m o más, además la de tope a popa). El remolcado por el costado lleva luz de alcance y costados en su extremo de proa: el grupo se ilumina como un solo buque.',
  },
  'pesquero-arrastre': { nombre: 'Buque pesquero de arrastre', luces: [['todo-G', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'pesquero-arrastre-50': {
    nombre: 'Buque pesquero de arrastre (≥ 50 m)', luces: [['tope', 'popa', 0.97, { siempre: true }], ['todo-G', 'centro', 0.82], ['todo-W', 'centro', 0.7]], opcionalCostados: true, dia: ['diabolo'],
    nota: 'Regla 26 b ii): el arrastrero de 50 m o más lleva además una luz de tope a popa y más alta que la verde todo horizonte (los menores pueden llevarla). Costados y alcance solo con arrancada.',
  },
  'pesquero-no-arrastre': { nombre: 'Buque dedicado a la pesca (no de arrastre)', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'pesquero-aparejo': {
    nombre: 'Pesquero (no arrastre) con aparejo > 150 m', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.72], ['todo-W', 'centro', 0.55, { lado: 'aparejo' }]], opcionalCostados: true,
    vistas: ['proa', 'popa'], dia: ['diabolo'], diaLados: { desde: 0, aparejo: ['cono-arriba'] },
    nota: 'Regla 26 c ii): si el aparejo largado se extiende más de 150 m en horizontal, una luz blanca todo horizonte (de día, un cono con el vértice hacia arriba) en la dirección del aparejo, más baja que la blanca del pesquero.',
  },
  'sin-gobierno': { nombre: 'Buque sin gobierno', luces: [['todo-R', 'centro', 0.85], ['todo-R', 'centro', 0.72]], opcionalCostados: true, sinTope: true, dia: ['bola', 'bola'] },
  restringido: { nombre: 'Buque con capacidad de maniobra restringida', luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-W', 'centro', 0.67], ['todo-R', 'centro', 0.55]], opcionalCostados: true, dia: ['bola', 'bicono', 'bola'] },
  draga: {
    nombre: 'Draga u obras submarinas con obstrucción',
    luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-W', 'centro', 0.67], ['todo-R', 'centro', 0.55],
      ['todo-R', 'centro', 0.52, { lado: 'obs' }], ['todo-R', 'centro', 0.41, { lado: 'obs' }], ['todo-G', 'centro', 0.52, { lado: 'libre' }], ['todo-G', 'centro', 0.41, { lado: 'libre' }]],
    opcionalCostados: true, vistas: ['proa', 'popa'], dia: ['bola', 'bicono', 'bola'], diaLados: { desde: 2, obs: ['bola', 'bola'], libre: ['bicono', 'bicono'] },
    nota: 'Regla 27 d): además de roja-blanca-roja (bola-bicónica-bola), dos rojas (dos bolas) en la banda de la obstrucción y dos verdes (dos bicónicas) en la banda por la que se puede pasar. Fondeada, muestra estas luces en lugar de las de fondeo.',
  },
  buceo: {
    nombre: 'Embarcación pequeña en operaciones de buceo', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.73], ['todo-R', 'centro', 0.61]], sinCostados: true, dia: ['bandera-A'],
    nota: 'Regla 27 e): si por su tamaño no puede llevar las luces y marcas de la draga, roja-blanca-roja todo horizonte y, de día, una reproducción rígida de la bandera «A» de al menos 1 m de altura, visible en todo el horizonte.',
  },
  dragaminas: {
    nombre: 'Buque dedicado a limpieza de minas', luces: [['tope', 'proa', 0.6], ['todo-G', 'centro', 0.95], ['todo-G', 'centro', 0.76, { lado: 'ambos' }]],
    dia: ['bola'], diaLados: { desde: 0, ambos: ['bola'] },
    nota: 'Regla 27 f): además de sus luces de buque de motor (o de fondeo), tres verdes todo horizonte (de día, tres bolas): una en el tope del palo de proa y una en cada penol de su verga. Es peligroso acercarse a menos de 1000 m.',
  },
  calado: { nombre: 'Buque restringido por su calado', luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-R', 'centro', 0.67], ['todo-R', 'centro', 0.55]], dia: ['cilindro'] },
  fondeado: { nombre: 'Buque fondeado (< 50 m)', luces: [['todo-W', 'proa', 0.75]], sinCostados: true, dia: ['bola'] },
  'fondeado-50': { nombre: 'Buque fondeado (≥ 50 m)', luces: [['todo-W', 'proa', 0.75], ['todo-W', 'popa', 0.5]], sinCostados: true, dia: ['bola'] },
  varado: { nombre: 'Buque varado', luces: [['todo-W', 'proa', 0.6], ['todo-R', 'centro', 0.95], ['todo-R', 'centro', 0.83]], sinCostados: true, dia: ['bola', 'bola', 'bola'] },
  practico: { nombre: 'Buque en servicio de practicaje', luces: [['todo-W', 'centro', 0.9], ['todo-R', 'centro', 0.78]], dia: [] },
  'practico-fondeado': {
    nombre: 'Práctico en servicio, fondeado', luces: [['todo-W', 'centro', 0.9], ['todo-R', 'centro', 0.78], ['todo-W', 'proa', 0.6]], sinCostados: true, dia: ['bola'],
    nota: 'Regla 29 a iii): fondeado, el práctico en servicio mantiene blanca sobre roja y añade las luces (o la bola) de buque fondeado; no lleva costados ni alcance.',
  },
  remo: { nombre: 'Embarcación de remo (linterna blanca lista para mostrar)', luces: [['linterna', 'centro', 0.4]], sinCostados: true, dia: [] },
};

const VIEWS = ['proa', 'babor', 'estribor', 'popa'];
const VIEW_TXT = { proa: 'Visto de proa', babor: 'Visto por su babor', estribor: 'Visto por su estribor', popa: 'Visto de popa' };

/** Banda real ('br' | 'er' | 'ambos') de una luz o marca desplazada, según la obstrucción o el aparejo elegidos. */
function bandaDe(lado, opts) {
  if (lado === 'ambos') return 'ambos';
  const obs = opts.obstruccion === 'babor' ? 'br' : 'er';
  if (lado === 'obs') return obs;
  if (lado === 'libre') return obs === 'br' ? 'er' : 'br';
  if (lado === 'aparejo') return opts.aparejo === 'babor' ? 'br' : 'er';
  return null;
}
/** Signo en pantalla de una banda: visto de proa, su estribor queda a nuestra izquierda; de popa, a la derecha. */
const signo = (banda, vista) => (banda === 'br' ? 1 : -1) * (vista === 'popa' ? -1 : 1);

/** Lista de luces visibles desde una vista. */
function visibleLights(s, vista, arrancada = true, opts = {}) {
  const L = [];
  for (const [t, at, h, o = {}] of s.luces) {
    if (t === 'tope' && vista === 'popa') continue;
    if (t === 'tope' && !arrancada && !o.siempre && (s.opcionalCostados || s.sinTope)) continue;
    if (t === 'remolque' && vista !== 'popa') continue;
    if (t === 'tricolor') {
      // farol combinado: verde a estribor, roja a babor (las dos a la vez justo de proa) y blanca hacia popa
      if (vista === 'proa') L.push({ t, at, h, color: COL.G, dx: -5 }, { t, at, h, color: COL.R, dx: 5 });
      else L.push({ t, at, h, color: vista === 'babor' ? COL.R : vista === 'estribor' ? COL.G : COL.W });
      continue;
    }
    const color = t.startsWith('todo-') ? COL[t.slice(5)] : t === 'remolque' ? COL.Y : COL.W;
    const banda = bandaDe(o.lado, opts);
    const lateral = vista === 'babor' || vista === 'estribor';
    if (banda && !lateral) {
      for (const b of banda === 'ambos' ? ['br', 'er'] : [banda]) L.push({ t, at, h, color, side: signo(b, vista) });
    } else L.push({ t, at, h, color });
  }
  const costados = !s.sinCostados && (arrancada || !s.opcionalCostados);
  const hc = s.luces.some((l) => l[3]?.lado) ? 0.26 : 0.4; // más bajas si hay luces a una banda, para no confundirlas
  if (costados) {
    if (vista === 'proa') { L.push({ t: 'costado', at: 'izq', h: hc, color: COL.G }, { t: 'costado', at: 'der', h: hc, color: COL.R }); }
    if (vista === 'babor') L.push({ t: 'costado', at: 'centro', h: hc, color: COL.R });
    if (vista === 'estribor') L.push({ t: 'costado', at: 'centro', h: hc, color: COL.G });
    if (vista === 'popa' && !s.sinAlcance) L.push({ t: 'alcance', at: 'centro', h: 0.3, color: COL.W });
  }
  return L;
}

/** Silueta + luces en un recuadro (x, y, w, h). */
function shipView(s, vista, x, y, w, h, opts) {
  const out = [];
  const lateral = vista === 'babor' || vista === 'estribor';
  const base = y + h * 0.8;
  const yOf = (l) => y + h * (1 - l.h) * 0.8;
  const L = visibleLights(s, vista, opts.arrancada, opts);
  if (lateral) {
    const dir = vista === 'babor' ? -1 : 1; // proa hacia la izquierda si lo vemos por babor
    const x0 = x + w * 0.12;
    const x1 = x + w * 0.88;
    const bow = dir < 0 ? x0 : x1;
    const stern = dir < 0 ? x1 : x0;
    out.push(`<path d="M${stern},${base - 16} L${bow},${base - 16} L${bow - dir * 14},${base} L${stern},${base}Z" class="il-hull"/>`);
    out.push(`<line x1="${(x0 + x1) / 2}" y1="${base - 14}" x2="${(x0 + x1) / 2}" y2="${y + h * 0.06}" class="il-mast"/>`);
    for (const l of L) {
      const lx = l.at === 'proa' ? bow - dir * w * 0.12 : l.at === 'popa' ? stern + dir * w * 0.1 : (x0 + x1) / 2;
      out.push(light(l.t === 'costado' ? bow - dir * w * 0.2 : lx, yOf(l), l.color));
    }
  } else {
    const cx = x + w / 2;
    out.push(`<path d="M${cx - w * 0.22},${base - 16} L${cx + w * 0.22},${base - 16} L${cx + w * 0.16},${base} L${cx - w * 0.16},${base}Z" class="il-hull"/>`);
    out.push(`<line x1="${cx}" y1="${base - 16}" x2="${cx}" y2="${y + h * 0.06}" class="il-mast"/>`);
    // verga para las luces a una banda (draga, dragaminas, aparejo de pesca)
    const sides = L.filter((l) => l.side);
    if (sides.length) {
      const top = Math.min(...sides.map(yOf));
      out.push(`<line x1="${cx - w * 0.36}" y1="${top - 7}" x2="${cx + w * 0.36}" y2="${top - 7}" class="il-mast"/>`);
      for (const sg of [...new Set(sides.map((l) => l.side))]) out.push(`<line x1="${cx + sg * w * 0.33}" y1="${top - 7}" x2="${cx + sg * w * 0.33}" y2="${Math.max(...sides.filter((l) => l.side === sg).map(yOf))}" class="il-mast" stroke-width="1"/>`);
    }
    for (const l of L) {
      const lx = l.side ? cx + l.side * w * 0.33 : l.at === 'izq' ? cx - w * 0.22 : l.at === 'der' ? cx + w * 0.22 : l.at === 'popa' && vista === 'proa' ? cx + 3 : cx;
      out.push(light(lx + (l.dx ?? 0), yOf(l), l.color, l.dx ? 3.4 : 4.6));
    }
    if (sides.length) {
      // rótulos de las bandas del buque (de proa: su estribor a nuestra izquierda)
      const izq = vista === 'popa' ? 'Br' : 'Er';
      const der = vista === 'popa' ? 'Er' : 'Br';
      out.push(`<text x="${x + 6}" y="${base}" class="il-lbl on-dark" font-size="9">${izq}</text><text x="${x + w - 6}" y="${base}" class="il-lbl on-dark" font-size="9" text-anchor="end">${der}</text>`);
    }
  }
  out.push(`<text x="${x + w / 2}" y="${y + h - 4}" class="il-lbl on-dark" font-size="12" text-anchor="middle">${VIEW_TXT[vista]}</text>`);
  return out.join('');
}

function light(x, y, color, r = 4.6) {
  return `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${color}" opacity=".28"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
}

function mark(m, cx, yy, k) {
  if (m === 'bola') return `<circle cx="${cx}" cy="${yy}" r="${k}" fill="#111"/>`;
  if (m === 'cono-abajo') return `<path d="M${cx - k},${yy - k} L${cx + k},${yy - k} L${cx},${yy + k}Z" fill="#111"/>`;
  if (m === 'cono-arriba') return `<path d="M${cx - k},${yy + k} L${cx + k},${yy + k} L${cx},${yy - k}Z" fill="#111"/>`;
  if (m === 'bicono') return `<path d="M${cx},${yy - k * 1.3} L${cx + k},${yy} L${cx},${yy + k * 1.3} L${cx - k},${yy}Z" fill="#111"/>`;
  if (m === 'diabolo') return `<path d="M${cx - k},${yy - k * 1.3} L${cx + k},${yy - k * 1.3} L${cx - k},${yy + k * 1.3} L${cx + k},${yy + k * 1.3}Z" fill="#111"/>`;
  if (m === 'cilindro') return `<rect x="${cx - k * 0.7}" y="${yy - k * 1.2}" width="${k * 1.4}" height="${k * 2.4}" fill="#111"/>`;
  // reproducción rígida de la bandera «A»: blanca al lado del asta y azul con cola de golondrina
  if (m === 'bandera-A') return `<rect x="${cx + 1}" y="${yy - k * 1.3}" width="${k * 1.6}" height="${k * 2.6}" fill="#fff" stroke="#64748b" stroke-width=".6"/><path d="M${cx + 1 + k * 1.6},${yy - k * 1.3} L${cx + 1 + k * 3.4},${yy - k * 1.3} L${cx + 1 + k * 2.5},${yy} L${cx + 1 + k * 3.4},${yy + k * 1.3} L${cx + 1 + k * 1.6},${yy + k * 1.3}Z" fill="#1d4ed8"/>`;
  return '';
}

function dayMarks(s, x, y, w, h, opts) {
  const out = [];
  const cx = x + w / 2;
  const base = y + h * 0.8;
  out.push(`<path d="M${cx - w * 0.3},${base - 14} L${cx + w * 0.3},${base - 14} L${cx + w * 0.24},${base} L${cx - w * 0.3},${base}Z" class="il-hull day"/>`);
  out.push(`<line x1="${cx}" y1="${base - 14}" x2="${cx}" y2="${y + 6}" stroke="#374151" stroke-width="2"/>`);
  let yy = y + 18;
  const k = 9;
  const ys = [];
  for (const m of s.dia) {
    ys.push(yy);
    out.push(mark(m, cx, yy, k));
    yy += k * 2.9;
  }
  const dl = s.diaLados;
  if (dl) {
    // marcas a una banda, visto de proa (su estribor a nuestra izquierda); cuelgan de una verga a la altura de la marca «desde»
    const y0 = ys[dl.desde] + (dl.desde === s.dia.length - 1 && s.diaLados.obs ? k * 2.9 : k * 2.9 * 0.9);
    out.push(`<line x1="${cx - w * 0.36}" y1="${y0 - k * 1.6}" x2="${cx + w * 0.36}" y2="${y0 - k * 1.6}" stroke="#374151" stroke-width="2"/>`);
    for (const [lado, marcas] of Object.entries(dl)) {
      if (lado === 'desde') continue;
      const banda = bandaDe(lado, opts);
      for (const b of banda === 'ambos' ? ['br', 'er'] : [banda]) {
        const sx = cx + signo(b, 'proa') * w * 0.33;
        marcas.forEach((m, i) => out.push(mark(m, sx, y0 + i * k * 2.9, k * 0.85)));
      }
    }
    out.push(`<text x="${x + 10}" y="${base + 2}" class="il-lbl" font-size="9" style="fill:#334155">Er</text><text x="${x + w - 10}" y="${base + 2}" class="il-lbl" font-size="9" text-anchor="end" style="fill:#334155">Br</text>`);
  }
  if (!s.dia.length) out.push(`<text x="${cx}" y="${y + h - 26}" class="il-lbl" text-anchor="middle" style="fill:#334155">sin marca de día específica</text>`);
  out.push(`<text x="${cx}" y="${y + h - 10}" class="il-lbl" font-size="12" text-anchor="middle" style="fill:#0f172a">${dl ? 'De día (visto de proa)' : 'De día'}</text>`);
  return out.join('');
}

export function shipIllustration(spec) {
  const s = SHIPS[spec.clase];
  if (!s) return null;
  const opts = { arrancada: spec.arrancada !== false, obstruccion: spec.obstruccion, aparejo: spec.aparejo };
  const posibles = s.vistas ?? VIEWS;
  const vistas = !spec.vista || spec.vista === 'todas' || !posibles.includes(spec.vista) ? posibles : [spec.vista];
  const cell = 170;
  const cols = Math.min(vistas.length + (spec.dia ? 1 : 0), 3);
  const n = vistas.length + (spec.dia ? 1 : 0);
  const rows = Math.ceil(n / cols);
  const W = Math.max(cols * cell + 20, 360);
  const H = rows * cell + 40;
  const x0 = (W - cols * cell) / 2;
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${s.nombre}">`, `<rect width="${W}" height="${H}" rx="10" class="il-night"/>`];
  let extra = '';
  if (s.luces.some((l) => l[3]?.lado === 'obs')) extra = ` · obstrucción por ${opts.obstruccion === 'babor' ? 'babor' : 'estribor'}`;
  if (s.luces.some((l) => l[3]?.lado === 'aparejo')) extra = ` · aparejo por ${opts.aparejo === 'babor' ? 'babor' : 'estribor'}`;
  const title = `${s.nombre}${opts.arrancada ? '' : ' (sin arrancada)'}`;
  out.push(`<text x="${W / 2}" y="${extra ? 18 : 24}" class="il-title night" font-size="14">${title}</text>`);
  if (extra) out.push(`<text x="${W / 2}" y="32" class="il-lbl on-dark" font-size="11" text-anchor="middle">${extra.slice(3)}</text>`);
  vistas.forEach((v, i) => out.push(shipView(s, v, x0 + (i % cols) * cell, 34 + Math.floor(i / cols) * cell, cell, cell, opts)));
  if (spec.dia) {
    const i = vistas.length;
    out.push(`<rect x="${x0 + (i % cols) * cell + 4}" y="${34 + Math.floor(i / cols) * cell + 4}" width="${cell - 8}" height="${cell - 8}" rx="8" class="il-daybox"/>`);
    out.push(dayMarks(s, x0 + (i % cols) * cell, 34 + Math.floor(i / cols) * cell, cell, cell, opts));
  }
  out.push('</svg>');
  return { svg: out.join(''), caption: s.nota ?? 'Recuerda: visto de proa, la verde queda a tu izquierda y la roja a tu derecha (son las de su estribor y su babor).' };
}
