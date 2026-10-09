// Láminas interactivas de las clases de carta del PY que no tenían manipulable:
//   demoras no simultáneas (traslado de la primera línea de posición) · triángulo de estima de la loxodrómica.
// Geometría plana en millas (x al E, y al N), la misma que se traza en la carta.
import { pad3, num } from './kit.js';
import { T, TXT, lienzo, rotulo, cartela, flecha, rosaNorte, junto, colocaEtiquetas, arcoD, f1, parte } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): como en la carta, la primera demora con trazo continuo y la segunda a trazos; la
// línea trasladada, más gruesa; el traslado (rumbo y distancia navegados) en magenta y acotado.

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
    const W = 358; const H = 330;
    const { caso } = r;
    // encaje: los puntos importantes dentro de la caja
    const pts = [caso.A, caso.B, caso.S1, caso.S2, r.desplazada.p, r.corte].filter(Boolean);
    const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const k = Math.min(250 / Math.max(1, Math.max(...xs) - Math.min(...xs)), 180 / Math.max(1, Math.max(...ys) - Math.min(...ys)), 24);
    const P = (p) => [W / 2 + (p[0] - cx) * k, 156 - (p[1] - cy) * k];
    const alt = `Demoras no simultáneas: la primera demora (${pad3(e.d1)}°, del faro A) y la segunda (${pad3(e.d2)}°, del faro B). Se traslada la ${r.linea} ${num(e.millas)} millas al ${pad3(r.linea === 'primera' ? e.rumbo : e.rumbo + 180)}°${pendiente || !r.corte ? '' : `; el corte da la situación a la hora de la ${r.hora}`}.`;
    const { out, id, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    const segs = [];
    const recta = (p, d, { dash = '', w = 1.5, color = T.tinta, idp = null } = {}) => {
      const a = P(mas(p, vec(d, -40))); const b = P(mas(p, vec(d, 40)));
      segs.push([a, b]);
      return `<line${parte(idp)} x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
    };
    out.push(`<clipPath id="${id}-ldp"><rect x="7" y="7" width="${W - 14}" height="${H - 14}"/></clipPath><g clip-path="url(#${id}-ldp)">`);
    // la línea que se mueve queda en su sitio, apagada; la trasladada, más gruesa
    const movida = r.linea === 'primera';
    out.push(recta(caso.A, e.d1, movida ? { color: T.apagado, w: 1, dash: '3 4', idp: 'primera' } : { idp: 'primera' }));
    out.push(recta(caso.B, e.d2, !movida ? { color: T.apagado, w: 1, dash: '3 4', idp: 'segunda' } : { dash: '8 4', idp: 'segunda' }));
    out.push(recta(r.desplazada.p, r.desplazada.d, { w: 2.2, dash: movida ? '' : '8 4', idp: 'trasladada' }));
    // el traslado: desde el faro de la línea movida
    const origen = movida ? caso.A : caso.B;
    const [x1, y1] = P(origen); const [x2, y2] = P(r.desplazada.p);
    if (e.millas > 0) { out.push(flecha(x1, y1, x2, y2, { color: T.magenta, w: 1.8, p: 'traslado' })); segs.push([[x1, y1], [x2, y2]]); }
    out.push('</g>');
    const cajas = [{ x0: W - 52, y0: 8, x1: W - 8, y1: 58 }, { x0: W / 2 - 120, y0: H - 46, x1: W / 2 + 120, y1: H - 4 }];
    for (const [nombre, p, idp] of [['faro A', caso.A, 'primera'], ['faro B', caso.B, 'segunda']]) {
      const [x, y] = P(p);
      out.push(`<g${parte(idp)}><circle cx="${f1(x)}" cy="${f1(y)}" r="6.5" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${T.tinta}"/></g>`);
      cajas.push({ x0: x - 9, y0: y - 9, x1: x + 9, y1: y + 9 });
      out.push(colocaEtiquetas([{ t: nombre, cands: [[x, y - 16], [x, y + 20], [x + 34, y], [x - 34, y]], rotulo: true, p: idp }], { W, H, segs, cajas }));
    }
    out.push(rosaNorte(W - 30, 36));
    const pet = [];
    if (!pendiente && r.corte) {
      const [x, y] = P(r.corte);
      out.push(`<g${parte('corte')}><circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="none" stroke="${T.magenta}" stroke-width="1.8"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.4" fill="${T.magenta}"/></g>`);
      cajas.push({ x0: x - 10, y0: y - 10, x1: x + 10, y1: y + 10 });
      const t = r.hora === 'segunda' ? 'situación 2.ª hora' : 'situación 1.ª hora';
      const cs = []; for (const rr of [26, 40]) for (const g of [90, 270, 180, 0, 135, 225, 45, 315]) { const q = [x + Math.sin((g * Math.PI) / 180) * (rr + 40), y - Math.cos((g * Math.PI) / 180) * rr]; cs.push(q); }
      pet.push({ t, cands: cs, color: T.magenta, p: 'corte' });
    }
    const tTras = `${pad3(movida ? e.rumbo : e.rumbo + 180)}° · ${num(e.millas)} M`;
    if (e.millas > 0) pet.push({ t: tTras, cands: junto([x1, y1], [x2, y2], tTras, { centro: [W / 2, 170] }), color: T.magenta, p: 'traslado' });
    const t1 = `1.ª Dv ${pad3(e.d1)}°`;
    const t2 = `2.ª Dv ${pad3(e.d2)}°`;
    pet.push({ t: t1, cands: junto(P(caso.A), P(mas(caso.A, vec(e.d1 + 180, 6))), t1, { centro: [W / 2, 170], ks: [0.5, 0.75, 0.3, 0.9] }), p: 'primera' });
    pet.push({ t: t2, cands: junto(P(caso.B), P(mas(caso.B, vec(e.d2 + 180, 6))), t2, { centro: [W / 2, 170], ks: [0.5, 0.75, 0.3, 0.9] }), p: 'segunda' });
    out.push(colocaEtiquetas(pet, { W, H: H - 40, segs, cajas }));
    out.push(cartela(W / 2, H - 24, movida ? 'SE TRASLADA LA PRIMERA' : 'SE TRASLADA LA SEGUNDA', movida ? 'el corte: situación a la 2.ª hora' : 'el corte: situación a la 1.ª hora', { ancho: 236, size: TXT.min, p: 'trasladada' }));
    out.push(cierra());
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
    const W = 358; const H = 340;
    // el triángulo ocupa siempre lo mismo (escala según la distancia); la salida, en la esquina opuesta al rumbo
    const k = 120 / Math.max(e.dist, 1);
    const O = [179 - (r.A * k) / 2, 138 + (r.dl * k) / 2];
    const fin = [O[0] + r.A * k, O[1] - r.dl * k];
    const esq = [O[0], fin[1]];
    const alt = `Triángulo de estima: ${e.dist} millas al ${pad3(e.rumbo)}° desde la salida. Diferencia de latitud ${num(Math.abs(r.dl))}′ al ${NS(r.dl)}, apartamiento ${num(Math.abs(r.A))} millas al ${EW(r.A)}${pendiente ? '' : ` y, con latitud media ${e.lm}°, diferencia de longitud ${num(Math.abs(r.dL))}′ al ${EW(r.dL)}`}.`;
    const { out, cierra } = lienzo(W, H, alt);
    out.push(`<line x1="${f1(O[0])}" y1="34" x2="${f1(O[0])}" y2="236" stroke="${T.apagado}" stroke-width=".7" stroke-dasharray="4 3"/>`, rotulo(O[0], 28, 'N', { size: TXT.min, weight: 700, estilo: 'serif', color: T.apagado }));
    const segs = [[O, esq], [esq, fin], [O, fin], [[O[0], 34], [O[0], 236]]];
    // catetos: Δl (norte-sur) y A (este-oeste), con el ángulo recto
    out.push(`<line${parte('dl')} x1="${f1(O[0])}" y1="${f1(O[1])}" x2="${f1(esq[0])}" y2="${f1(esq[1])}" stroke="${T.tinta}" stroke-width="1.8"/>`);
    out.push(`<line${parte('A')} x1="${f1(esq[0])}" y1="${f1(esq[1])}" x2="${f1(fin[0])}" y2="${f1(fin[1])}" stroke="${T.tinta}" stroke-width="1.8" stroke-dasharray="7 3"/>`);
    if (Math.abs(r.A) * k > 14 && Math.abs(r.dl) * k > 14) {
      const sx = Math.sign(r.A); const sy = Math.sign(r.dl);
      out.push(`<path d="M${f1(esq[0] + sx * 9)},${f1(esq[1])} v${f1(sy * 9)} h${f1(-sx * 9)}" fill="none" stroke="${T.tinta}" stroke-width=".8"/>`);
    }
    out.push(flecha(O[0], O[1], fin[0], fin[1], { color: T.magenta, w: 2, p: 'D' }));
    if (e.rumbo % 360) out.push(`<path${parte('D')} d="${arcoD(O[0], O[1], 30, 0, e.rumbo)}" fill="none" stroke="${T.magenta}" stroke-width="1.2"/>`);
    out.push(`<circle cx="${f1(O[0])}" cy="${f1(O[1])}" r="3.5" fill="${T.tinta}"/>`);
    const cajas = [{ x0: O[0] - 8, y0: O[1] - 8, x1: O[0] + 8, y1: O[1] + 8 }];
    const centro = [(O[0] + fin[0] + esq[0]) / 3, (O[1] + fin[1] + esq[1]) / 3];
    const tdl = `Δl ${num(Math.abs(r.dl))}′ ${NS(r.dl)}`;
    const tA = `A ${num(Math.abs(r.A))} M ${EW(r.A)}`;
    const tD = `D ${e.dist} M · R ${pad3(e.rumbo)}°`;
    const pet = [{ t: tD, cands: junto(O, fin, tD, { centro, ks: [0.55, 0.4, 0.7] }), color: T.magenta, p: 'D' }];
    if (Math.abs(r.dl) > 0.05) pet.push({ t: tdl, cands: junto(O, esq, tdl, { centro }), p: 'dl' });
    if (Math.abs(r.A) > 0.05) pet.push({ t: tA, cands: junto(esq, fin, tA, { centro }), p: 'A' });
    pet.push({ t: 'salida', cands: [[O[0], O[1] + 18], [O[0] - 34, O[1]], [O[0] + 34, O[1]], [O[0], O[1] - 18]], rotulo: true });
    out.push(colocaEtiquetas(pet, { W, H: 250, segs, cajas }));
    // ΔL frente a A, con la misma escala: más minutos de longitud cuanto mayor es la latitud
    out.push(`<line x1="16" y1="248" x2="${W - 16}" y2="248" stroke="${T.tinta}" stroke-width=".6"/>`);
    const kb = 190 / Math.max(Math.abs(r.A), Math.abs(r.dL), 1);
    const wA = Math.abs(r.A) * kb;
    const wL = Math.abs(r.dL) * kb;
    out.push(rotulo(18, 270, 'A', { size: TXT.rotulo, weight: 700, estilo: 'mono', anchor: 'start', p: 'A' }), `<rect${parte('A')} x="44" y="260" width="${f1(Math.max(wA, 1))}" height="12" fill="${T.tinta}"/>`,
      rotulo(50 + wA, 270, `${num(Math.abs(r.A))} millas`, { size: TXT.min, estilo: 'mono', anchor: 'start', p: 'A' }));
    out.push(rotulo(18, 294, 'ΔL', { size: TXT.rotulo, weight: 700, estilo: 'mono', anchor: 'start', color: T.magenta, p: 'dL' }));
    if (!pendiente) out.push(`<rect${parte('dL')} x="44" y="284" width="${f1(Math.max(wL, 1))}" height="12" fill="${T.magenta}"/>`, rotulo(50 + wL, 294, `${num(Math.abs(r.dL))}′ ${EW(r.dL)}`, { size: TXT.min, estilo: 'mono', anchor: 'start', color: T.magenta, p: 'dL' }));
    else out.push(rotulo(50, 294, '?', { size: TXT.rotulo, weight: 700, estilo: 'mono', anchor: 'start', color: T.magenta }));
    out.push(rotulo(W / 2, 324, `ΔL = A / cos lm · lm ${e.lm}°`, { size: TXT.min, estilo: 'mono', color: T.apagado }));
    out.push(cierra());
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
