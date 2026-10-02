// Ilustraciones: situaciones de encuentro del RIPA (Reglas 12–15) animadas, y señales acústicas (Reglas 32–35)
// dibujadas y con sonido.
// spec cruce:  { tipo:'cruce', situacion:'cruce'|'vuelta-encontrada'|'alcance'|'vela-amuras'|'vela-barlovento' }
// spec sonido: { tipo:'sonido', senal:'.'|'..'|'-'|'--'|'-.'|'-..'|'.....'|... , texto? }   (. corta ≈1 s, - larga 4–6 s)

const SITUACIONES = {
  cruce: {
    titulo: 'Cruce (Regla 15)',
    nota: 'Si ves al otro por tu estribor, te toca maniobrar: cae a estribor y pasa por su popa. El que lo tiene por babor mantiene rumbo y velocidad.',
    a: { from: [40, 200], to: [300, 200], turn: [160, 200, 175, 235, 300, 250], label: 'Cede (lo ve por estribor)', color: '#e11d48' },
    b: { from: [200, 330], to: [200, 30], label: 'Sigue a rumbo', color: '#2563eb' },
  },
  'vuelta-encontrada': {
    titulo: 'Vuelta encontrada (Regla 14)',
    nota: 'Proa con proa: los dos caen a estribor y se pasan babor con babor.',
    a: { from: [170, 330], to: [170, 30], turn: [170, 210, 220, 160, 220, 30], label: 'Cae a estribor', color: '#e11d48' },
    b: { from: [190, 30], to: [190, 330], turn: [190, 150, 140, 200, 140, 330], label: 'Cae a estribor', color: '#e11d48' },
  },
  alcance: {
    titulo: 'Alcance (Regla 13)',
    nota: 'El que alcanza (viene desde más de 22,5° a popa del través del otro) se mantiene apartado, por cualquier banda, hasta dejarlo claro.',
    a: { from: [180, 340], to: [180, 20], turn: [180, 260, 240, 200, 240, 20], label: 'Alcanza: se aparta', color: '#e11d48', speed: 1.6 },
    b: { from: [180, 240], to: [180, 60], label: 'Alcanzado: sigue', color: '#2563eb', speed: 0.7 },
  },
  'vela-amuras': {
    titulo: 'Veleros con amuras distintas (Regla 12)',
    nota: 'El que recibe el viento por babor (amurado a babor) se aparta del que lo recibe por estribor.',
    viento: true,
    a: { from: [60, 300], to: [300, 60], turn: [150, 210, 180, 230, 300, 120], label: 'Amura babor: cede', color: '#e11d48' },
    b: { from: [300, 300], to: [60, 60], label: 'Amura estribor: sigue', color: '#2563eb' },
  },
  'vela-barlovento': {
    titulo: 'Veleros con la misma amura (Regla 12)',
    nota: 'Con la misma amura, el de barlovento se aparta del de sotavento.',
    viento: true,
    a: { from: [70, 250], to: [310, 110], turn: [170, 190, 220, 120, 310, 60], label: 'Barlovento: cede', color: '#e11d48' },
    b: { from: [130, 340], to: [290, 60], label: 'Sotavento: sigue', color: '#2563eb' },
  },
};

function boatPath(v) {
  if (v.turn) {
    const [x1, y1, cx, cy, x2, y2] = v.turn;
    return `M${v.from[0]},${v.from[1]} L${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  }
  return `M${v.from[0]},${v.from[1]} L${v.to[0]},${v.to[1]}`;
}

function movingBoat(v, dur) {
  const path = boatPath(v);
  const d = dur / (v.speed ?? 1);
  return `<path d="${path}" fill="none" stroke="${v.color}" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>` +
    `<g><path d="M0,-12 L6,6 L0,3 L-6,6Z" fill="${v.color}" stroke="#fff" stroke-width="1"/>` +
    `<animateMotion dur="${d}s" repeatCount="indefinite" rotate="auto" path="${path}" keyPoints="0;1" keyTimes="0;1"/></g>`;
}

export function crossingIllustration(spec) {
  const s = SITUACIONES[spec.situacion];
  if (!s) return null;
  const W = 360;
  const H = 360;
  const out = [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${s.titulo}">`, `<rect width="${W}" height="${H}" rx="10" class="il-sea"/>`];
  out.push(`<text x="${W / 2}" y="22" class="il-title on-dark">${s.titulo}</text>`);
  if (s.viento) out.push(`<g class="il-wind"><path d="M330,40 L330,90" stroke="#fff" stroke-width="3" marker-end="url(#il-arr)"/><text x="322" y="36" font-size="11" fill="#fff" text-anchor="end">viento</text></g>`);
  out.push('<defs><marker id="il-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="#fff"/></marker></defs>');
  // los barcos se dibujan "de proa hacia arriba" (rotate=auto los orienta según la trayectoria: path apunta hacia +x)
  out.push(movingBoat({ ...s.a }, 7).replace('M0,-12 L6,6 L0,3 L-6,6Z', 'M12,0 L-6,6 L-3,0 L-6,-6Z'));
  out.push(movingBoat({ ...s.b }, 7).replace('M0,-12 L6,6 L0,3 L-6,6Z', 'M12,0 L-6,6 L-3,0 L-6,-6Z'));
  out.push(`<text x="12" y="${H - 28}" class="il-lbl strong" style="fill:${s.a.color === '#e11d48' ? '#fda4af' : '#93c5fd'}">● ${s.a.label}</text>`);
  out.push(`<text x="12" y="${H - 12}" class="il-lbl strong" style="fill:${s.b.color === '#e11d48' ? '#fda4af' : '#93c5fd'}">● ${s.b.label}</text>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: s.nota };
}

// ---------------------------------------------------------------------------
// Señales acústicas

export const SENALES = {
  '.': 'Una pitada corta: caigo a estribor.',
  '..': 'Dos pitadas cortas: caigo a babor.',
  '...': 'Tres pitadas cortas: estoy dando atrás.',
  '.....': 'Cinco o más cortas y rápidas: no entiendo sus intenciones / duda.',
  '-': 'Una larga: buque que se aproxima a un recodo; también, cada 2 min, buque de motor con arrancada en visibilidad reducida.',
  '--': 'Dos largas cada 2 min: buque de motor en visibilidad reducida, en navegación pero parado (sin arrancada).',
  '-..': 'Una larga y dos cortas cada 2 min en visibilidad reducida: sin gobierno, maniobra restringida, restringido por su calado, de vela, pescando, remolcando o empujando (también el pesquero y el de maniobra restringida cuando están fondeados).',
  '--.': 'Dos largas y una corta: en un canal angosto, pretendo alcanzarle por su estribor.',
  '--..': 'Dos largas y dos cortas: pretendo alcanzarle por su babor.',
  '-.-.': 'Larga, corta, larga, corta: conformidad del buque alcanzado.',
  '-...': 'Una larga y tres cortas: el buque remolcado (el último del tren de remolque, si va tripulado) en visibilidad reducida, inmediatamente después de la señal del remolcador.',
};

export function soundIllustration(spec) {
  const pattern = spec.senal ?? '.';
  const W = 340;
  const H = 120;
  let x = 20;
  const bars = [];
  for (const c of pattern) {
    const w = c === '-' ? 70 : 18;
    bars.push(`<rect x="${x}" y="52" width="${w}" height="22" rx="4" fill="${c === '-' ? '#f59e0b' : '#38bdf8'}"/>`);
    x += w + 10;
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="Señal acústica">` +
    `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>` +
    `<text x="20" y="32" class="il-title left">🔊 ${spec.texto ?? 'Señal acústica'}</text>${bars.join('')}` +
    `<text x="20" y="100" class="il-lbl">corta ≈ 1 s · larga 4–6 s</text></svg>`;
  return { svg, caption: SENALES[pattern] ?? '', sound: pattern };
}

/** Reproduce una señal con WebAudio (corta ≈ 1 s; larga 4 s, dentro de los 4–6 s de la Regla 32). */
export function playSignal(pattern) {
  const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  let t = ctx.currentTime + 0.05;
  for (const c of pattern) {
    const d = c === '-' ? 4 : 1;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 180;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.05);
    g.gain.setValueAtTime(0.18, t + d - 0.08);
    g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d + 0.02);
    t += d + 0.9;
  }
  setTimeout(() => ctx.close(), (t - ctx.currentTime + 0.5) * 1000);
}
