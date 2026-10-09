// Ilustraciones: situaciones de encuentro del RIPA (Reglas 12–15) animadas, y señales acústicas (Reglas 32–35)
// dibujadas y con sonido.
// spec cruce:  { tipo:'cruce', situacion:'cruce'|'vuelta-encontrada'|'alcance'|'vela-amuras'|'vela-barlovento' }
// spec sonido: { tipo:'sonido', senal:'.'|'..'|'-'|'--'|'-.'|'-..'|'.....'|'campana'|'campana-gong'|'varado'|... , texto? }
//   (. corta ≈1 s, - larga 4–6 s; campana y gong de la Regla 35 g/h)
// spec riesgo: { tipo:'riesgo', caso:'comparar'|'constante'|'variable' }   (Regla 7: demora constante)

import { C } from './kit.js';
import { T, TXT, lienzo, rotulo, ondaCurva, barquito, flecha as flechaC } from './estilo-c.js';

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
    a: { from: [40, 150], to: [160, 330], turn: [150, 215, 175, 245, 160, 330], label: 'Barlovento: se aparta (pasa por su popa)', color: '#e11d48' },
    b: { from: [60, 330], to: [330, 200], label: 'Sotavento: sigue', color: '#2563eb' },
  },
};

function boatPath(v) {
  if (v.turn) {
    const [x1, y1, cx, cy, x2, y2] = v.turn;
    return `M${v.from[0]},${v.from[1]} L${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  }
  return `M${v.from[0]},${v.from[1]} L${v.to[0]},${v.to[1]}`;
}

// Estilo C (docs/ESTILO-LAMINAS.md): agua de carta, derrotas a trazos (la del que cede, en magenta) y una cartela por
// barco que dice qué hace; el viento, con su flecha y su rótulo.
function movingBoat(v, dur, cede) {
  const path = boatPath(v);
  const d = dur / (v.speed ?? 1);
  return `<path d="${path}" fill="none" stroke="${cede ? T.magenta : T.tinta}" stroke-width="1.4" stroke-dasharray="6 4"/>` +
    `<g>${barquito(1.25, cede ? T.magenta : T.tinta)}<animateMotion dur="${d}s" repeatCount="indefinite" rotate="auto" path="${path}" keyPoints="0;1" keyTimes="0;1"/></g>`;
}

export function crossingIllustration(spec) {
  const s = SITUACIONES[spec.situacion];
  if (!s) return null;
  const W = 360;
  const H = 400;
  const alt = `${s.titulo}: ${s.nota}`;
  const { out, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(ondaCurva(0, W, 342, { amp: 5 }));
  if (s.viento) out.push(flechaC(316, 34, 316, 92, { color: T.tinta, w: 2.4, p: 'viento' }), rotulo(306, 40, 'viento', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }));
  const cedeA = s.a.color === '#e11d48';
  const cedeB = s.b.color === '#e11d48';
  out.push(movingBoat({ ...s.a }, 7, cedeA), movingBoat({ ...s.b }, 7, cedeB));
  const fila = (y, v, cede) => `<g><rect x="14" y="${y - 13}" width="18" height="18" fill="${cede ? T.magenta : T.papel}" stroke="${cede ? T.magenta : T.tinta}" stroke-width="1.2"/>` +
    rotulo(40, y + 1, v.label, { size: TXT.nota, estilo: 'serif', weight: cede ? 700 : 400, color: cede ? T.magenta : T.tinta, anchor: 'start' }) + '</g>';
  out.push(`<rect x="8" y="350" width="${W - 16}" height="44" fill="${T.papel}"/>`, fila(368, s.a, cedeA), fila(388, s.b, cedeB));
  out.push(cierra());
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
  '.-.': 'Corta, larga, corta: un buque fondeado puede emitirla, además de la campana, para señalar su posición y la posibilidad de abordaje a un buque que se aproxima.',
  '....': 'Cuatro cortas: señal de identificación que puede emitir la embarcación del práctico en servicio, además de su señal de niebla.',
  campana: 'Fondeado en visibilidad reducida: repique rápido de campana de unos 5 s a proa, a intervalos de no más de 1 min. Los buques de menos de 20 m no están obligados a la campana, pero entonces deben hacer otra señal eficaz a intervalos de no más de 2 min.',
  'campana-gong': 'Fondeado de 100 m o más: repique de campana a proa (unos 5 s) e inmediatamente después gong a popa (unos 5 s), a intervalos de no más de 1 min.',
  varado: 'Varado: tres golpes de campana claros y separados, el repique rápido (unos 5 s) y otros tres golpes; con 100 m o más, además el gong. Puede añadir una señal de pito apropiada.',
};

/** Señales que no son de pito: b golpe de campana · B repique de campana (~5 s) · G gong (~5 s). */
const SECUENCIA = { campana: 'B', 'campana-gong': 'BG', varado: 'bbbBbbb' };

// El cronograma de una señal acústica (lámina `sonido`) está en estilo C, en src/illustrations/senales-c.js.

/** Un golpe de campana o de gong: parciales inarmónicos con caída exponencial. */
function strike(ctx, t, base, parts, decay, vol) {
  for (const [k, a] of parts) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = base * k;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * a, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay * (k < 1.5 ? 1 : 0.6));
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + decay + 0.05);
  }
}
const BELL = (ctx, t) => strike(ctx, t, 880, [[1, 1], [2.0, 0.5], [2.76, 0.35], [5.4, 0.15]], 1.2, 0.12);
const GONG = (ctx, t) => strike(ctx, t, 96, [[1, 1], [1.52, 0.6], [2.31, 0.4], [3.1, 0.25]], 2.6, 0.22);

/** Reproduce una señal con WebAudio (corta ≈ 1 s; larga 4 s, dentro de los 4–6 s de la Regla 32; campana y gong). */
export function playSignal(pattern) {
  const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  let t = ctx.currentTime + 0.05;
  for (const c of SECUENCIA[pattern] ?? pattern) {
    if (c === 'b') { BELL(ctx, t); t += 0.9; continue; } // golpes claros y separados
    if (c === 'B') { for (let i = 0; i < 28; i++) BELL(ctx, t + i * 0.18); t += 5.6; continue; } // repique rápido ~5 s
    if (c === 'G') { for (let i = 0; i < 13; i++) GONG(ctx, t + i * 0.38); t += 6.5; continue; } // gong rápido ~5 s
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
  setTimeout(() => ctx.close(), (t - ctx.currentTime + 3) * 1000);
}

// ---------------------------------------------------------------------------
// Riesgo de abordaje por demora constante (Regla 7 d). spec: { tipo:'riesgo', caso:'comparar'|'constante'|'variable' }
