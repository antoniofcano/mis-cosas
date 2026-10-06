// Láminas interactivas de las clases de carta del PY que no tenían manipulable:
//   demoras no simultáneas (traslado de la primera línea de posición) · triángulo de estima de la loxodrómica.
// Geometría plana en millas (x al E, y al N), la misma que se traza en la carta.
import { svgOpen, flecha, texto, f1, pad3, num, parte } from './kit.js';

const rad = (d) => (d * Math.PI) / 180;
/** Vector de `m` millas al rumbo `r` (x al E, y al N). */
const vec = (r, m) => [Math.sin(rad(r)) * m, Math.cos(rad(r)) * m];
const mas = (a, b) => [a[0] + b[0], a[1] + b[1]];
const menos = (a, b) => [a[0] - b[0], a[1] - b[1]];

/** Corte de dos rectas (punto + dirección en grados). null si son paralelas. */
export function corte(p1, d1, p2, d2) {
  const u = vec(d1, 1);
  const v = vec(d2, 1);
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 1e-9) return null;
  const w = menos(p2, p1);
  const t = (w[0] * v[1] - w[1] * v[0]) / den;
  return [p1[0] + u[0] * t, p1[1] + u[1] * t];
}

// ---------------------------------------------------------------------------
// Demoras no simultáneas: la primera línea viaja contigo.

/**
 * El caso: a la 1.ª hora estás en S1 (origen) y marcas el faro A a Dv1; navegas `millas` al `rumbo` real y a la
 * 2.ª hora marcas el faro B a Dv2. Los faros se colocan para que todo cuadre con ese viaje real.
 */
export function casoDemoras({ d1, d2, rumboReal, millasReal }) {
  const S1 = [0, 0];
  const S2 = vec(rumboReal, millasReal);
  return { S1, S2, A: mas(S1, vec(d1, 8)), B: mas(S2, vec(d2, 6)) };
}

/**
 * Traslado con lo que tú dices haber navegado. `linea`: 'primera' (se traslada la 1.ª al rumbo y distancia → corte
 * = situación a la 2.ª hora) o 'segunda' (se traslada la 2.ª hacia atrás → corte = situación a la 1.ª hora).
 */
export function trasladoDemoras(caso, { d1, d2, rumbo, millas, linea }) {
  const v = vec(rumbo, millas);
  if (linea === 'segunda') {
    const B1 = menos(caso.B, v);
    const P = corte(caso.A, d1, B1, d2);
    return { linea, desplazada: { p: B1, d: d2 }, corte: P, hora: 'primera', s2: P && mas(P, v) };
  }
  const A2 = mas(caso.A, v);
  const P = corte(A2, d1, caso.B, d2);
  return { linea: 'primera', desplazada: { p: A2, d: d1 }, corte: P, hora: 'segunda', s1: P && menos(P, v) };
}

export const demorasTraslado = {
  aplica: (spec) => spec.modo === 'traslado',
  mandos: [
    { id: 'linea', tipo: 'opciones', etiqueta: 'Trasladas', opciones: [['primera', 'La primera'], ['segunda', 'La segunda']] },
    { id: 'rumbo', tipo: 'rango', etiqueta: 'Rumbo navegado', min: 0, max: 355, paso: 5, texto: (v) => `${pad3(v)}°`, extremos: ['000°', '355°'] },
    { id: 'millas', tipo: 'rango', etiqueta: 'Distancia navegada', min: 0, max: 12, paso: 0.5, texto: (v) => `${num(v)} millas`, extremos: ['0', '12 millas'] },
  ],
  estado: (spec) => ({ d1: Number(spec.d1 ?? 30), d2: Number(spec.d2 ?? 118), rumboReal: Number(spec.rumbo ?? 75), millasReal: Number(spec.millas ?? 7.5),
    rumbo: Number(spec.rumbo ?? 75), millas: Number(spec.millas ?? 7.5), linea: spec.linea === 'segunda' ? 'segunda' : 'primera' }),
  calcular(e) {
    const caso = casoDemoras(e);
    const t = trasladoDemoras(caso, e);
    const real = t.hora === 'segunda' ? caso.S2 : caso.S1;
    const error = t.corte ? Math.hypot(t.corte[0] - real[0], t.corte[1] - real[1]) : null;
    return { caso, ...t, error };
  },
  pie: () => 'Demoras a horas distintas: traza la primera, trasládala paralela el rumbo y la distancia navegados y córtala con la segunda. El corte es tu situación a la hora de la segunda.',
  dibujar(e, r, { pendiente = false } = {}) {
    const W = 320; const H = 320;
    const { caso } = r;
    // encaje: los puntos importantes dentro de la caja
    const pts = [caso.A, caso.B, caso.S1, caso.S2, r.desplazada.p, r.corte].filter(Boolean);
    const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const k = Math.min(230 / Math.max(1, Math.max(...xs) - Math.min(...xs)), 210 / Math.max(1, Math.max(...ys) - Math.min(...ys)), 22);
    const P = (p) => [W / 2 + (p[0] - cx) * k, 175 - (p[1] - cy) * k];
    const recta = (p, d, color, extra = '', id = null) => { const [x1, y1] = P(mas(p, vec(d, -30))); const [x2, y2] = P(mas(p, vec(d, 30))); return `<line${parte(id)} x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="2.5" ${extra}/>`; };
    const out = [svgOpen(W, H, 'Demoras no simultáneas: traslado de la línea de posición')];
    out.push(`<clipPath id="clip-ldp"><rect x="8" y="34" width="${W - 16}" height="${H - 42}" rx="8"/></clipPath><g clip-path="url(#clip-ldp)">`);
    out.push(recta(caso.A, e.d1, 'var(--l-v)', r.linea === 'primera' ? 'stroke-dasharray="6 5" opacity=".55"' : '', 'primera'));
    out.push(recta(caso.B, e.d2, 'var(--l-r)', r.linea === 'segunda' ? 'stroke-dasharray="6 5" opacity=".55"' : '', 'segunda'));
    out.push(recta(r.desplazada.p, r.desplazada.d, r.linea === 'primera' ? 'var(--l-v)' : 'var(--l-r)', '', 'trasladada'));
    // el traslado: desde el faro de la línea movida
    const origen = r.linea === 'primera' ? caso.A : caso.B;
    if (e.millas > 0) { const [x1, y1] = P(origen); const [x2, y2] = P(r.desplazada.p); out.push(flecha(x1, y1, x2, y2, 'var(--l-a)', 3, 'traslado')); }
    out.push('</g>');
    for (const [nombre, p] of [['faro A', caso.A], ['faro B', caso.B]]) { const [x, y] = P(p); out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="var(--l-faro)" stroke="var(--text)"/>`, texto(x, y - 10, nombre, { size: 12 })); }
    if (!pendiente && r.corte) {
      const [x, y] = P(r.corte);
      out.push(`<circle${parte('corte')} cx="${f1(x)}" cy="${f1(y)}" r="7" fill="none" stroke="var(--text)" stroke-width="2.5"/>`);
      out.push(texto(x > W / 2 ? x - 10 : x + 10, y + 20, r.hora === 'segunda' ? 'situación 2.ª hora' : 'situación 1.ª hora', { size: 12, anchor: x > W / 2 ? 'end' : 'start' }));
    }
    out.push(texto(W / 2, 22, `Demoras ${pad3(e.d1)}° (A) y ${pad3(e.d2)}° (B)`, { size: 14, weight: 700 }));
    out.push('</svg>');
    const svg = out.join('');
    const mueves = r.linea === 'primera' ? `Trasladas la primera demora ${num(e.millas)} millas al ${pad3(e.rumbo)}°` : `Trasladas la segunda demora ${num(e.millas)} millas hacia atrás (al ${pad3(e.rumbo + 180)}°)`;
    if (pendiente) return { svg, lectura: `${mueves}. Responde y verás dónde cae el corte.` };
    if (!r.corte) return { svg, lectura: `${mueves}: las dos líneas quedan paralelas y no se cortan.` };
    const bien = r.error != null && r.error < 0.05;
    const que = r.hora === 'segunda' ? 'tu situación a la hora de la segunda demora' : 'tu situación a la hora de la PRIMERA demora, no la de la segunda';
    return { svg, lectura: `${mueves}: el corte es ${que}.${bien ? '' : ` Con ese traslado el corte se aleja ${num(r.error)} millas del de verdad: el traslado tiene que ser el rumbo y la distancia que navegaste (${pad3(e.rumboReal)}°, ${num(e.millasReal)} millas).`}` };
  },
  prediccion: (e) => ({
    enunciado: `Entre las dos demoras has navegado ${num(e.millasReal)} millas al ${pad3(e.rumboReal)}°. Para situarte a la hora de la segunda, ¿qué haces?`,
    opciones: { a: `Trasladar la primera ${num(e.millasReal)} millas al ${pad3(e.rumboReal)}°`, b: `Trasladar la segunda ${num(e.millasReal)} millas al ${pad3(e.rumboReal + 180)}°`, c: 'Cortar las dos tal cual' },
    correcta: 'a',
    tras: 'Se traslada la primera, que viaja contigo. Si mueves la segunda hacia atrás, el corte sale bien pero es la situación de la primera hora. Prueba a cambiar la línea y el traslado.',
    estado: { linea: 'primera', rumbo: e.rumboReal, millas: e.millasReal },
  }),
  partes: {
    primera: 'Primera demora: trazada desde el faro A con la Dv + 180°.',
    segunda: 'Segunda demora: desde el faro B, tomada más tarde.',
    trasladada: 'La línea trasladada: paralela a sí misma, el rumbo y la distancia navegados entre las dos observaciones.',
    traslado: 'El traslado: el rumbo y la distancia de verdad (Rv sin viento, Rs con viento, rumbo efectivo con corriente).',
    corte: 'El corte: la situación a la hora de la línea que no has movido.',
  },
};

// ---------------------------------------------------------------------------
// Estima analítica: el triángulo Δl, A, D y la longitud con la latitud media.

/** Δl = D·cos R, A = D·sen R (millas = minutos), ΔL = A / cos lm (minutos de longitud). */
export function estimaLoxo({ rumbo, dist, lm }) {
  const dl = dist * Math.cos(rad(rumbo));
  const A = dist * Math.sin(rad(rumbo));
  const dL = A / Math.cos(rad(lm));
  return { dl, A, dL };
}

const NS = (x) => (x >= 0 ? 'N' : 'S');
const EW = (x) => (x >= 0 ? 'E' : 'W');

export const loxoTriangulo = {
  aplica: (spec) => spec.modo === 'triangulo',
  mandos: [
    { id: 'rumbo', tipo: 'rango', etiqueta: 'Rumbo', min: 0, max: 355, paso: 5, texto: (v) => `${pad3(v)}°`, extremos: ['000°', '355°'] },
    { id: 'dist', tipo: 'rango', etiqueta: 'Distancia', min: 10, max: 200, paso: 10, texto: (v) => `${v} millas`, extremos: ['10', '200 millas'] },
    { id: 'lm', tipo: 'rango', etiqueta: 'Latitud media', min: 0, max: 70, paso: 5, texto: (v) => `${v}°`, extremos: ['0°', '70°'] },
  ],
  estado: (spec) => ({ rumbo: Number(spec.rumbo ?? 60), dist: Number(spec.dist ?? 100), lm: Number(spec.lm ?? 20) }),
  calcular: (e) => estimaLoxo(e),
  pie: () => 'Δl = D · cos R y A = D · sen R. El apartamiento son millas; para pasarlo a minutos de longitud se divide por cos lm: cuanto más lejos del ecuador, más minutos de longitud por cada milla.',
  dibujar(e, r, { pendiente = false } = {}) {
    const W = 320; const H = 320;
    // el triángulo ocupa siempre lo mismo (escala según la distancia); la salida, en la esquina opuesta al rumbo
    const k = 105 / Math.max(e.dist, 1);
    const O = [160 - (r.A * k) / 2, 160 + (r.dl * k) / 2];
    const fin = [O[0] + r.A * k, O[1] - r.dl * k];
    const out = [svgOpen(W, H, `Triángulo de estima: ${e.dist} millas al ${pad3(e.rumbo)}°`)];
    out.push(`<line x1="${f1(O[0])}" y1="52" x2="${f1(O[0])}" y2="250" stroke="var(--l-g)" stroke-dasharray="3 4"/>`, texto(O[0] + 8, 62, 'N', { size: 12, anchor: 'start' }));
    // catetos
    out.push(`<line${parte('dl')} x1="${f1(O[0])}" y1="${f1(O[1])}" x2="${f1(O[0])}" y2="${f1(fin[1])}" stroke="var(--l-v)" stroke-width="3"/>`);
    out.push(`<line${parte('A')} x1="${f1(O[0])}" y1="${f1(fin[1])}" x2="${f1(fin[0])}" y2="${f1(fin[1])}" stroke="var(--l-r)" stroke-width="3"/>`);
    out.push(flecha(O[0], O[1], fin[0], fin[1], 'var(--text)', 3, 'D'));
    out.push(`<circle cx="${f1(O[0])}" cy="${f1(O[1])}" r="4" fill="var(--text)"/>`, texto(O[0] - 8, O[1] + 16, 'salida', { size: 11, anchor: 'end' }));
    out.push(texto(O[0] + (r.A >= 0 ? -6 : 6), (O[1] + fin[1]) / 2, `Δl ${num(Math.abs(r.dl))}′ ${NS(r.dl)}`, { size: 12, anchor: r.A >= 0 ? 'end' : 'start', color: 'var(--l-v)', p: 'dl' }));
    out.push(texto((O[0] + fin[0]) / 2, fin[1] + (r.dl >= 0 ? -8 : 18), `A ${num(Math.abs(r.A))} M ${EW(r.A)}`, { size: 12, color: 'var(--l-r)', p: 'A' }));
    // ΔL frente a A: misma «distancia» en millas, más minutos de longitud cuanto mayor es la latitud
    const y = 296;
    // las dos barras con la misma escala: se ve cuánto más larga es ΔL que A
    const kb = 150 / Math.max(Math.abs(r.A), Math.abs(r.dL), 1);
    const wA = Math.abs(r.A) * kb;
    const wL = Math.abs(r.dL) * kb;
    out.push(`<rect x="20" y="${y - 30}" width="${f1(wA)}" height="9" fill="var(--l-r)"/>`, texto(24 + wA, y - 22, `A: ${num(Math.abs(r.A))} millas`, { size: 11, anchor: 'start' }));
    if (!pendiente) out.push(`<rect${parte('dL')} x="20" y="${y - 14}" width="${f1(wL)}" height="9" fill="var(--l-a)"/>`, texto(24 + wL, y - 6, `ΔL: ${num(Math.abs(r.dL))}′ ${EW(r.dL)}`, { size: 11, anchor: 'start' }));
    out.push(texto(W / 2, 22, `${e.dist} millas al ${pad3(e.rumbo)}° · lm ${e.lm}°`, { size: 14, weight: 700 }));
    out.push('</svg>');
    const svg = out.join('');
    const tri = `Δl = ${e.dist} · cos ${pad3(e.rumbo)}° = ${num(r.dl)}′ (${NS(r.dl)}); A = ${e.dist} · sen ${pad3(e.rumbo)}° = ${num(r.A)} millas (${EW(r.A)}).`;
    if (pendiente) return { svg, lectura: `${tri} Responde y verás la diferencia de longitud.` };
    return { svg, lectura: `${tri} ΔL = A / cos ${e.lm}° = ${num(Math.abs(r.dL))}′ al ${EW(r.dL)}${Math.abs(r.A) > 0.05 ? `: ${num(Math.abs(r.dL) / Math.abs(r.A), 2)} minutos de longitud por cada milla de apartamiento` : ''}.` };
  },
  prediccion: () => ({
    enunciado: 'Mismo rumbo y misma distancia (mismo apartamiento), pero navegando más lejos del ecuador (latitud media mayor). La diferencia de longitud…',
    opciones: { a: 'Aumenta', b: 'Disminuye', c: 'No cambia' },
    correcta: 'a',
    tras: 'ΔL = A / cos lm: al subir la latitud, el coseno baja y cada milla de apartamiento son más minutos de longitud (los meridianos se juntan). Sube la latitud media y míralo.',
    estado: { rumbo: 90, dist: 60, lm: 20 },
  }),
  partes: {
    dl: 'Δl, diferencia de latitud: D · cos R, en minutos (= millas). Positiva al N, negativa al S.',
    A: 'A, apartamiento: D · sen R, en millas. Positivo al E, negativo al W.',
    D: 'D, la distancia navegada al rumbo R: la hipotenusa del triángulo de estima.',
    dL: 'ΔL, diferencia de longitud: A / cos lm, en minutos de longitud.',
  },
  botonesPartes: [['dl', 'Diferencia de latitud'], ['A', 'Apartamiento'], ['D', 'Distancia']],
};
