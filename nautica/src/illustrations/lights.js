// Ilustraciones: características de las luces (ritmos) → secuencias de encendido/apagado y animación SVG.
// "Fl(2) 5s", "Q(6)+LFl 15s", "VQ(3) 5s", "Iso 4s", "Oc 6s", "LFl 10s", "Mo(A) 6s", "Fl(2+1) R 10s", "Al.Bu/Y 2s", "F".

const COLORS = { W: '#fffbe6', R: '#ef4444', G: '#22c55e', Y: '#facc15', Bu: '#3b82f6' };

/**
 * @returns {{ period:number, steps:{on:boolean, d:number, color?:string}[], colors:string[], text:string }}
 */
export function parseRhythm(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  const colorTok = t.match(/\b(Bu\/Y|R|G|W|Y|Bu)\b(?![^(]*\))/);
  const colors = colorTok ? colorTok[1].split('/').map((c) => COLORS[c] ?? COLORS.W) : [COLORS.W];
  const periodM = t.match(/(\d+(?:[.,]\d+)?)\s*s\b/);
  let period = periodM ? Number(periodM[1].replace(',', '.')) : 0;
  const steps = [];
  const on = (d) => steps.push({ on: true, d });
  const off = (d) => steps.push({ on: false, d });
  const flashes = (n, dOn, dOff) => { for (let i = 0; i < n; i++) { on(dOn); if (i < n - 1) off(dOff); } };
  const used = () => steps.reduce((s, x) => s + x.d, 0);

  if (/^F\b(?!l)/.test(t)) return { period: 1, steps: [{ on: true, d: 1 }], colors, text: t };
  if (/^Al/.test(t)) {
    const p = period || 2;
    // alternativa: cada color encendido y una pausa apagada entre colores (Bu 1 s · 0,5 s · Y 1 s · 0,5 s en 3 s)
    const dOn = p / (colors.length * 1.5);
    return { period: p, steps: colors.flatMap((c) => [{ on: true, d: dOn, color: c }, { on: false, d: dOn / 2 }]), colors, text: t };
  }
  let m;
  if ((m = t.match(/^(V?Q)\((\d+)\)\s*\+\s*LFl/))) { const v = m[1] === 'VQ'; flashes(Number(m[2]), v ? 0.2 : 0.3, v ? 0.3 : 0.7); off(0.7); on(2); }
  else if ((m = t.match(/^(V?Q)\((\d+)\)/))) { const v = m[1] === 'VQ'; flashes(Number(m[2]), v ? 0.2 : 0.3, v ? 0.3 : 0.7); }
  else if ((m = t.match(/^(V?Q)\b/))) { const v = m[1] === 'VQ'; period = v ? 0.5 : 1; on(v ? 0.2 : 0.3); }
  else if ((m = t.match(/^Fl\((\d+)\+(\d+)\)/))) { flashes(Number(m[1]), 0.5, 1); off(2); flashes(Number(m[2]), 0.5, 1); }
  else if ((m = t.match(/^Fl\((\d+)\)/))) flashes(Number(m[1]), 0.5, 1);
  else if (/^LFl/.test(t)) on(2);
  else if (/^Fl\b/.test(t)) on(0.5);
  else if (/^Iso/.test(t)) { const p = period || 4; on(p / 2); }
  else if ((m = t.match(/^Oc\((\d+)\)/))) {
    const n = Number(m[1]);
    const p = period || 8;
    on(p - (2 * n - 1) * 0.7);
    for (let i = 0; i < n; i++) { off(0.7); if (i < n - 1) on(0.7); }
  }
  else if (/^Oc/.test(t)) { const p = period || 6; on(p - 1.5); off(1.5); }
  else if ((m = t.match(/^Mo\(([A-Z])\)/))) {
    const MORSE = { A: '.-', U: '..-', D: '-..', N: '-.', B: '-...', O: '---', K: '-.-', R: '.-.' };
    const code = MORSE[m[1]] ?? '.-';
    [...code].forEach((c, i) => { on(c === '.' ? 0.5 : 1.5); if (i < code.length - 1) off(0.5); });
  } else on(0.5);

  if (!period) period = Math.max(used() + 1, 2);
  const rest = period - used();
  if (rest > 0.01) off(rest);
  return { period, steps, colors, text: t };
}

/**
 * Atributos SMIL para animar el brillo/color de una luz según su ritmo.
 * Devuelve el elemento <animate> listo para insertar dentro del círculo de la luz.
 */
export function rhythmAnimation(rh) {
  let t = 0;
  const times = [];
  const ops = [];
  const cols = [];
  for (const s of rh.steps) {
    times.push(t / rh.period);
    ops.push(s.on ? 1 : 0.06);
    cols.push(s.color ?? rh.colors[0]);
    t += s.d;
  }
  const kt = times.map((x) => x.toFixed(4)).join(';');
  const anim = `<animate attributeName="opacity" values="${ops.join(';')}" keyTimes="${kt}" dur="${rh.period}s" calcMode="discrete" repeatCount="indefinite"/>`;
  const colorAnim = new Set(cols).size > 1
    ? `<animate attributeName="fill" values="${cols.join(';')}" keyTimes="${kt}" dur="${rh.period}s" calcMode="discrete" repeatCount="indefinite"/>`
    : '';
  return anim + colorAnim;
}

/** Luz que parpadea con su ritmo, con halo. */
export function blinkingLight(cx, cy, r, rhythmText) {
  const rh = parseRhythm(rhythmText);
  const anim = rhythmAnimation(rh);
  return `<g class="il-light"><circle cx="${cx}" cy="${cy}" r="${r * 2.4}" fill="${rh.colors[0]}" opacity=".25">${anim}</circle>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${rh.colors[0]}" stroke="#0005" stroke-width=".6">${anim}</circle></g>`;
}

/** Cronograma del ritmo (barra con los destellos y un cursor animado). */
export function rhythmTimeline(x, y, w, h, rhythmText) {
  const rh = parseRhythm(rhythmText);
  let t = 0;
  const out = [`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#0f172a"/>`];
  for (const s of rh.steps) {
    if (s.on) out.push(`<rect x="${x + (t / rh.period) * w}" y="${y + 2}" width="${Math.max(1.5, (s.d / rh.period) * w)}" height="${h - 4}" fill="${s.color ?? rh.colors[0]}"/>`);
    t += s.d;
  }
  out.push(`<line x1="${x}" y1="${y - 3}" x2="${x}" y2="${y + h + 3}" stroke="#e11d48" stroke-width="1.5"><animate attributeName="x1" from="${x}" to="${x + w}" dur="${rh.period}s" repeatCount="indefinite"/><animate attributeName="x2" from="${x}" to="${x + w}" dur="${rh.period}s" repeatCount="indefinite"/></line>`);
  out.push(`<text x="${x}" y="${y + h + 12}" font-size="9" fill="#334155">0 s</text><text x="${x + w}" y="${y + h + 12}" font-size="9" text-anchor="end" fill="#334155">${rh.period} s</text>`);
  return out.join('');
}

// ---------------------------------------------------------------------------
// Estilo C (docs/ESTILO-LAMINAS.md): la misma luz y el mismo cronograma, con los colores de styles/laminas.css.

const LUZ_C = { [COLORS.W]: 'var(--lc-luz-blanca)', [COLORS.R]: 'var(--lc-luz-roja)', [COLORS.G]: 'var(--lc-luz-verde)', [COLORS.Y]: 'var(--lc-luz-amarilla)', [COLORS.Bu]: 'var(--lc-luz-azul)' };
/** Nombre del color de una luz, para decirlo también con palabras. */
export const NOMBRE_LUZ = { [COLORS.W]: 'blanca', [COLORS.R]: 'roja', [COLORS.G]: 'verde', [COLORS.Y]: 'amarilla', [COLORS.Bu]: 'azul' };
export const luzToken = (hex) => LUZ_C[hex] ?? LUZ_C[COLORS.W];

/** <animate> de opacidad: encendida cuando el paso está encendido (y es de ese color, si se da). */
function animOpacidad(rh, color = null) {
  let t = 0;
  const times = [];
  const ops = [];
  for (const s of rh.steps) {
    times.push((t / rh.period).toFixed(4));
    ops.push(s.on && (!color || (s.color ?? rh.colors[0]) === color) ? 1 : 0.08);
    t += s.d;
  }
  return `<animate attributeName="opacity" values="${ops.join(';')}" keyTimes="${times.join(';')}" dur="${rh.period}s" calcMode="discrete" repeatCount="indefinite"/>`;
}

/** Luz que destella con su ritmo (estilo C): un círculo por color, con borde de tinta para que se vea sobre el papel. */
export function luzC(cx, cy, r, ritmo) {
  const rh = parseRhythm(ritmo);
  const cols = [...new Set(rh.steps.filter((s) => s.on).map((s) => s.color ?? rh.colors[0]))];
  return `<g class="il-light">${cols.map((c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${luzToken(c)}" stroke="var(--lc-tinta)" stroke-width=".8">${animOpacidad(rh, cols.length > 1 ? c : null)}</circle>`).join('')}</g>`;
}

/** Cronograma del ritmo (estilo C): franja de noche con los destellos, cursor que la recorre y los segundos debajo. */
export function cronoC(x, y, w, h, ritmo) {
  const rh = parseRhythm(ritmo);
  let t = 0;
  const out = [`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--lc-noche)" stroke="var(--lc-tinta)" stroke-width="1"/>`];
  for (const s of rh.steps) {
    if (s.on) out.push(`<rect x="${(x + (t / rh.period) * w).toFixed(1)}" y="${y + 3}" width="${Math.max(2, (s.d / rh.period) * w).toFixed(1)}" height="${h - 6}" fill="${luzToken(s.color ?? rh.colors[0])}"/>`);
    t += s.d;
  }
  out.push(`<line x1="${x}" y1="${y - 3}" x2="${x}" y2="${y + h + 3}" stroke="var(--lc-magenta)" stroke-width="1.6"><animate attributeName="x1" from="${x}" to="${x + w}" dur="${rh.period}s" repeatCount="indefinite"/><animate attributeName="x2" from="${x}" to="${x + w}" dur="${rh.period}s" repeatCount="indefinite"/></line>`);
  const seg = String(rh.period).replace('.', ',');
  out.push(`<text x="${x}" y="${y + h + 15}" font-size="11.5" fill="var(--lc-apagado)" class="lc-mono">0 s</text><text x="${x + w}" y="${y + h + 15}" font-size="11.5" text-anchor="end" fill="var(--lc-apagado)" class="lc-mono">${seg} s</text>`);
  return out.join('');
}
