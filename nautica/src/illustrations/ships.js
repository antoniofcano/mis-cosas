// Ilustraciones: luces y marcas del RIPA (Reglas 21–30). Un buque visto de noche desde proa, una banda o popa,
// o de día con sus marcas.
// spec: { tipo:'buque', clase, vista:'proa'|'babor'|'estribor'|'popa'|'todas', dia?: bool, arrancada?: bool }

const COL = { W: '#fffbe6', R: '#ef4444', G: '#22c55e', Y: '#facc15' };

// Luces de cada clase. at: 'proa'|'popa'|'centro'; h: altura (0..1); tipo: tope | costados | alcance | todo | remolque
// Las de costado, tope y alcance solo con arrancada (si arrancada:false se omiten en sin gobierno / restringido / pesquero).
export const SHIPS = {
  motor: { nombre: 'Buque de propulsión mecánica en navegación (< 50 m)', luces: [['tope', 'proa', 0.75]], dia: [] },
  'motor-50': { nombre: 'Buque de propulsión mecánica en navegación (≥ 50 m)', luces: [['tope', 'proa', 0.6], ['tope', 'popa', 0.9]], dia: [] },
  'motor-menor-7': { nombre: 'Buque de propulsión mecánica < 7 m y ≤ 7 nudos', luces: [['todo-W', 'centro', 0.6]], sinCostados: true, dia: [] },
  vela: { nombre: 'Buque de vela en navegación', luces: [], dia: [] },
  'vela-tope': { nombre: 'Buque de vela con luces opcionales (roja sobre verde en el tope)', luces: [['todo-R', 'centro', 0.95], ['todo-G', 'centro', 0.85]], dia: [] },
  'vela-motor': { nombre: 'Buque de vela navegando también a motor', luces: [['tope', 'proa', 0.75]], dia: ['cono-abajo'] },
  remolque: { nombre: 'Buque remolcando (remolque ≤ 200 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75], ['remolque', 'popa', 0.5]], dia: [] },
  'remolque-200': { nombre: 'Buque remolcando (remolque > 200 m)', luces: [['tope', 'proa', 0.5], ['tope', 'proa', 0.62], ['tope', 'proa', 0.75], ['remolque', 'popa', 0.5]], dia: ['bicono'] },
  'pesquero-arrastre': { nombre: 'Buque pesquero de arrastre', luces: [['todo-G', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'pesquero-no-arrastre': { nombre: 'Buque dedicado a la pesca (no de arrastre)', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'sin-gobierno': { nombre: 'Buque sin gobierno', luces: [['todo-R', 'centro', 0.85], ['todo-R', 'centro', 0.72]], opcionalCostados: true, sinTope: true, dia: ['bola', 'bola'] },
  restringido: { nombre: 'Buque con capacidad de maniobra restringida', luces: [['todo-R', 'centro', 0.9], ['todo-W', 'centro', 0.78], ['todo-R', 'centro', 0.66], ['tope', 'proa', 0.55]], opcionalCostados: true, dia: ['bola', 'bicono', 'bola'] },
  calado: { nombre: 'Buque restringido por su calado', luces: [['tope', 'proa', 0.6], ['todo-R', 'centro', 0.95], ['todo-R', 'centro', 0.83], ['todo-R', 'centro', 0.71]], dia: ['cilindro'] },
  fondeado: { nombre: 'Buque fondeado (< 50 m)', luces: [['todo-W', 'proa', 0.75]], sinCostados: true, dia: ['bola'] },
  'fondeado-50': { nombre: 'Buque fondeado (≥ 50 m)', luces: [['todo-W', 'proa', 0.75], ['todo-W', 'popa', 0.5]], sinCostados: true, dia: ['bola'] },
  varado: { nombre: 'Buque varado', luces: [['todo-W', 'proa', 0.6], ['todo-R', 'centro', 0.95], ['todo-R', 'centro', 0.83]], sinCostados: true, dia: ['bola', 'bola', 'bola'] },
  practico: { nombre: 'Buque en servicio de practicaje', luces: [['todo-W', 'centro', 0.9], ['todo-R', 'centro', 0.78]], dia: [] },
  remo: { nombre: 'Embarcación de remo', luces: [['linterna', 'centro', 0.4]], sinCostados: true, dia: [] },
};

const VIEWS = ['proa', 'babor', 'estribor', 'popa'];
const VIEW_TXT = { proa: 'Visto de proa', babor: 'Visto por su babor', estribor: 'Visto por su estribor', popa: 'Visto de popa' };

/** Lista de luces visibles desde una vista. */
function visibleLights(s, vista, arrancada = true) {
  const L = [];
  for (const [t, at, h] of s.luces) {
    if (t === 'tope' && vista === 'popa') continue;
    if (t === 'tope' && !arrancada && (s.opcionalCostados || s.sinTope)) continue;
    if (t === 'remolque' && vista !== 'popa') continue;
    L.push({ t, at, h, color: t.startsWith('todo-') ? COL[t.slice(5)] : t === 'remolque' ? COL.Y : COL.W });
  }
  const costados = !s.sinCostados && (arrancada || !s.opcionalCostados);
  if (costados) {
    if (vista === 'proa') { L.push({ t: 'costado', at: 'izq', h: 0.4, color: COL.G }, { t: 'costado', at: 'der', h: 0.4, color: COL.R }); }
    if (vista === 'babor') L.push({ t: 'costado', at: 'centro', h: 0.4, color: COL.R });
    if (vista === 'estribor') L.push({ t: 'costado', at: 'centro', h: 0.4, color: COL.G });
    if (vista === 'popa') L.push({ t: 'alcance', at: 'centro', h: 0.3, color: COL.W });
  }
  return L;
}

/** Silueta + luces en un recuadro (x, y, w, h). */
function shipView(s, vista, x, y, w, h, opts) {
  const out = [];
  const lateral = vista === 'babor' || vista === 'estribor';
  const base = y + h * 0.8;
  if (lateral) {
    const dir = vista === 'babor' ? -1 : 1; // proa hacia la izquierda si lo vemos por babor
    const x0 = x + w * 0.12;
    const x1 = x + w * 0.88;
    const bow = dir < 0 ? x0 : x1;
    const stern = dir < 0 ? x1 : x0;
    out.push(`<path d="M${stern},${base - 16} L${bow},${base - 16} L${bow - dir * 14},${base} L${stern},${base}Z" class="il-hull"/>`);
    out.push(`<line x1="${(x0 + x1) / 2}" y1="${base - 14}" x2="${(x0 + x1) / 2}" y2="${y + h * 0.06}" class="il-mast"/>`);
    for (const l of visibleLights(s, vista, opts.arrancada)) {
      const lx = l.at === 'proa' ? bow - dir * w * 0.12 : l.at === 'popa' ? stern + dir * w * 0.1 : (x0 + x1) / 2;
      out.push(light(l.t === 'costado' ? bow - dir * w * 0.2 : lx, y + h * (1 - l.h) * 0.8, l.color));
    }
  } else {
    const cx = x + w / 2;
    out.push(`<path d="M${cx - w * 0.22},${base - 16} L${cx + w * 0.22},${base - 16} L${cx + w * 0.16},${base} L${cx - w * 0.16},${base}Z" class="il-hull"/>`);
    out.push(`<line x1="${cx}" y1="${base - 16}" x2="${cx}" y2="${y + h * 0.06}" class="il-mast"/>`);
    for (const l of visibleLights(s, vista, opts.arrancada)) {
      const lx = l.at === 'izq' ? cx - w * 0.22 : l.at === 'der' ? cx + w * 0.22 : l.at === 'popa' && vista === 'proa' ? cx + 3 : cx;
      out.push(light(lx, y + h * (1 - l.h) * 0.8, l.color));
    }
  }
  out.push(`<text x="${x + w / 2}" y="${y + h - 4}" class="il-lbl on-dark" font-size="12" text-anchor="middle">${VIEW_TXT[vista]}</text>`);
  return out.join('');
}

function light(x, y, color) {
  return `<circle cx="${x}" cy="${y}" r="10" fill="${color}" opacity=".28"/><circle cx="${x}" cy="${y}" r="4.6" fill="${color}"/>`;
}

function dayMarks(s, x, y, w, h) {
  const out = [];
  const cx = x + w / 2;
  const base = y + h * 0.8;
  out.push(`<path d="M${cx - w * 0.3},${base - 14} L${cx + w * 0.3},${base - 14} L${cx + w * 0.24},${base} L${cx - w * 0.3},${base}Z" class="il-hull day"/>`);
  out.push(`<line x1="${cx}" y1="${base - 14}" x2="${cx}" y2="${y + 6}" stroke="#374151" stroke-width="2"/>`);
  let yy = y + 18;
  const k = 9;
  for (const m of s.dia) {
    if (m === 'bola') out.push(`<circle cx="${cx}" cy="${yy}" r="${k}" fill="#111"/>`);
    if (m === 'cono-abajo') out.push(`<path d="M${cx - k},${yy - k} L${cx + k},${yy - k} L${cx},${yy + k}Z" fill="#111"/>`);
    if (m === 'bicono') out.push(`<path d="M${cx},${yy - k * 1.3} L${cx + k},${yy} L${cx},${yy + k * 1.3} L${cx - k},${yy}Z" fill="#111"/>`);
    if (m === 'diabolo') out.push(`<path d="M${cx - k},${yy - k * 1.3} L${cx + k},${yy - k * 1.3} L${cx - k},${yy + k * 1.3} L${cx + k},${yy + k * 1.3}Z" fill="#111"/>`);
    if (m === 'cilindro') out.push(`<rect x="${cx - k * 0.7}" y="${yy - k * 1.2}" width="${k * 1.4}" height="${k * 2.4}" fill="#111"/>`);
    yy += k * 2.9;
  }
  if (!s.dia.length) out.push(`<text x="${cx}" y="${y + h - 26}" class="il-lbl" text-anchor="middle">sin marca de día específica</text>`);
  out.push(`<text x="${cx}" y="${y + h - 10}" class="il-lbl" font-size="12" text-anchor="middle">De día</text>`);
  return out.join('');
}

export function shipIllustration(spec) {
  const s = SHIPS[spec.clase];
  if (!s) return null;
  const opts = { arrancada: spec.arrancada !== false };
  const vistas = !spec.vista || spec.vista === 'todas' ? VIEWS : [spec.vista];
  const cell = 170;
  const cols = Math.min(vistas.length + (spec.dia ? 1 : 0), 3);
  const n = vistas.length + (spec.dia ? 1 : 0);
  const rows = Math.ceil(n / cols);
  const W = Math.max(cols * cell + 20, 360);
  const H = rows * cell + 40;
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${s.nombre}">`, `<rect width="${W}" height="${H}" rx="10" class="il-night"/>`];
  const title = `${s.nombre}${opts.arrancada ? '' : ' (sin arrancada)'}`;
  out.push(`<text x="${W / 2}" y="24" class="il-title night" font-size="14">${title}</text>`);
  vistas.forEach((v, i) => out.push(shipView(s, v, 10 + (i % cols) * cell, 34 + Math.floor(i / cols) * cell, cell, cell, opts)));
  if (spec.dia) {
    const i = vistas.length;
    out.push(`<rect x="${10 + (i % cols) * cell + 4}" y="${34 + Math.floor(i / cols) * cell + 4}" width="${cell - 8}" height="${cell - 8}" rx="8" class="il-daybox"/>`);
    out.push(dayMarks(s, 10 + (i % cols) * cell, 34 + Math.floor(i / cols) * cell, cell, cell));
  }
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Recuerda: visto de proa, la verde queda a tu izquierda y la roja a tu derecha (son las de su estribor y su babor).' };
}
