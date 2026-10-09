// Láminas fijas de carta del PY rehechas en estilo C (docs/ESTILO-LAMINAS.md): enfilación, situación por dos demoras
// simultáneas y estima loxodrómica. Mismas specs que antes; solo cambia el dibujo. Sin DOM.
//   enfilacion:  { tipo:'enfilacion', dv?: 40, da?: 44 }       Ct = Dv − Da
//   demoras:     { tipo:'demoras', d1?: 330, d2?: 34 }          (con modo:'traslado' es interactiva: interactivas/py-carta.js)
//   loxodromica: { tipo:'loxodromica' }                         (con modo:'triangulo' es interactiva)
// Convenio del examen: E (+), W (−); las demoras se trazan desde el punto de la costa con la demora opuesta (Dv ± 180°).

import { T, TXT, lienzo, rotulo, etiqueta, cartela, cotaArco, flecha, rosaNorte, tierra, ondas, paso, junto, colocaEtiquetas, arcoD, pol, f1 } from './estilo-c.js';

const pad3 = (d) => String(Math.round(((d % 360) + 360) % 360)).padStart(3, '0');
const conSigno = (d) => `${d > 0 ? '+' : d < 0 ? '−' : ''}${String(Math.abs(d)).replace('.', ',')}°`;

/** Faro de carta: círculo amarillo con punto, que destella (la animación que ya tenía la lámina). */
export const faro = (x, y, { p = null, destella = true, dur = 2 } = {}) =>
  `<g${p ? ` data-parte="${p}"` : ''}><circle${destella ? ' class="lc-destello"' : ''} cx="${f1(x)}" cy="${f1(y)}" r="6.5" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2">` +
  (destella ? `<animate attributeName="opacity" values="1;.35;1" dur="${dur}s" repeatCount="indefinite"/>` : '') + `</circle><circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${T.tinta}"/></g>`;

/** Situación observada: círculo con punto (como en la carta). */
export const situacion = (x, y, { color = T.magenta, p = null } = {}) =>
  `<g${p ? ` data-parte="${p}"` : ''}><circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="none" stroke="${color}" stroke-width="1.8"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.4" fill="${color}"/></g>`;

/** Situación de estima: triángulo con punto (como en la carta). */
export const estima = (x, y, { color = T.tinta, p = null } = {}) =>
  `<g${p ? ` data-parte="${p}"` : ''}><path d="M${f1(x)},${f1(y - 9)} L${f1(x + 8)},${f1(y + 5)} L${f1(x - 8)},${f1(y + 5)}Z" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.2" fill="${color}"/></g>`;

/** Posiciones candidatas alrededor de un punto: a varias distancias y en doce direcciones (para etiquetas con `ref`). */
export function alrededor([x, y], distancias = [26, 40, 56], primero = null) {
  const dirs = Array.from({ length: 12 }, (_, i) => i * 30);
  if (primero != null) dirs.sort((a, b) => Math.abs(((a - primero + 540) % 360) - 180) - Math.abs(((b - primero + 540) % 360) - 180)).reverse();
  return distancias.flatMap((d) => dirs.map((g) => pol(x, y, g, d)));
}

/** De las esquinas candidatas, la más alejada de los puntos del dibujo (para la rosa del norte). */
export function esquinaLibre(pts, esquinas) {
  return esquinas.map((q) => [q, Math.min(...pts.map((p) => Math.hypot(p[0] - q[0], p[1] - q[1])))]).sort((a, b) => b[1] - a[1])[0][0];
}

/** Fila de una cuenta, con su número de paso: texto en serifa (las cifras se leen igual) y, si es la clave, en magenta. */
export const filaPaso = (x, y, n, texto, { clave = false, p = null, extra = '' } = {}) =>
  `<g${p ? ` data-parte="${p}"` : ''}${extra}>${paso(x, y - 4, n, { color: clave ? T.magenta : T.tinta })}${rotulo(x + 16, y, texto, { size: TXT.min + 0.5, estilo: 'serif', anchor: 'start', weight: clave ? 700 : 400, color: clave ? T.magenta : T.tinta })}</g>`;

/** Flechas de viento (dos, paralelas) que soplan desde `de` hacia sotavento, centradas en (x, y), con su rótulo. */
export function vientoC(x, y, de, texto, { p = null, extra = '' } = {}) {
  const hacia = de + 180;
  const [nx, ny] = pol(0, 0, hacia + 90, 6);
  const fl = [-1, 1].map((s) => { const [ax, ay] = pol(x + nx * s, y + ny * s, de, 15); const [bx, by] = pol(x + nx * s, y + ny * s, hacia, 15); return flecha(ax, ay, bx, by, { color: T.apagado, w: 1.4 }); });
  return `<g${p ? ` data-parte="${p}"` : ''}${extra}>${fl.join('')}${rotulo(x, y + 30, texto, { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado })}</g>`;
}

/** Mancha de costa (un cabo o un islote) centrada en (x, y), con su punteado. */
function islote(x, y, r, pt, giro = 0) {
  const k = [1, 0.82, 1.08, 0.9, 1.12, 0.86, 1, 0.94];
  const p = k.map((f, i) => pol(x, y, giro + i * 45, r * f));
  const d = p.map((q, i) => { const n = p[(i + 1) % p.length]; const m = [(q[0] + n[0]) / 2, (q[1] + n[1]) / 2]; return `${i ? '' : `M${f1(m[0])},${f1(m[1])}`}Q${f1(n[0])},${f1(n[1])} ${f1((n[0] + p[(i + 2) % p.length][0]) / 2)},${f1((n[1] + p[(i + 2) % p.length][1]) / 2)}`; }).join('') + 'Z';
  return tierra(d, pt);
}

// ---------------------------------------------------------------------------
// Enfilación: dos marcas una detrás de otra dan una demora verdadera exacta. Ct = Dv − Da.

export function enfilacionIllustration(spec) {
  const dv = Number(spec.dv ?? 40);
  const da = Number(spec.da ?? 44);
  if (!Number.isFinite(dv) || !Number.isFinite(da)) return null;
  const ct = Math.round((((dv - da) % 360) + 540) % 360 - 180);
  const W = 358;
  const H = 300;
  const alt = `Enfilación: el barco ve dos faros uno detrás de otro, en la demora verdadera ${pad3(dv)}° que da la carta; con la aguja los marca a ${pad3(da)}°. La corrección total es la diferencia: Ct = Dv − Da = ${conSigno(ct)}.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  // --- la escena (izquierda): la costa con los dos faros enfilados y el barco sobre la enfilación
  const B = [118, 142];
  const A1 = pol(B[0], B[1], dv, 62);
  const A2 = pol(B[0], B[1], dv, 92);
  const tc = pol(B[0], B[1], dv, 86);
  out.push(islote(tc[0], tc[1], 30, pt, dv));
  const [l0x, l0y] = pol(B[0], B[1], dv + 180, 44);
  const [l1x, l1y] = pol(B[0], B[1], dv, 100);
  out.push(`<line data-parte="enfilacion" x1="${f1(l0x)}" y1="${f1(l0y)}" x2="${f1(l1x)}" y2="${f1(l1y)}" stroke="${T.magenta}" stroke-width="1.6" stroke-dasharray="8 4"/>`);
  out.push(faro(A1[0], A1[1], { p: 'faros' }), faro(A2[0], A2[1], { p: 'faros', dur: 2.6 }));
  // el norte verdadero en la situación y el ángulo de la demora, acotado desde el norte en el sentido del reloj
  // si la enfilación queda cerca del norte, la flecha del Nv se acorta y su nombre se aparta de los faros
  const cerca = Math.cos((dv * Math.PI) / 180) > 0.8;
  const ln = cerca ? 40 : 58;
  const lado = Math.sin((dv * Math.PI) / 180) < 0 ? 1 : -1;
  out.push(flecha(B[0], B[1], B[0], B[1] - ln, { color: T.tinta, w: 1.4, p: 'nv' }),
    cerca ? rotulo(B[0] + lado * 8, B[1] - ln + 8, 'Nv', { size: TXT.rotulo, weight: 700, estilo: 'serif', p: 'nv', anchor: lado > 0 ? 'start' : 'end' })
      : rotulo(B[0], B[1] - ln - 6, 'Nv', { size: TXT.rotulo, weight: 700, estilo: 'serif', p: 'nv' }));
  out.push(cotaArco(B[0], B[1], 30, 0, dv, '', { color: T.tinta, p: 'dv' }));
  out.push(situacion(B[0], B[1], { color: T.tinta, p: 'barco' }));
  const segs = [[[l0x, l0y], [l1x, l1y]], [B, [B[0], B[1] - ln]]];
  const [mx, my] = pol(B[0], B[1], dv / 2, 30);
  const cands = [];
  for (const r of [56, 70, 84]) for (const d of [dv / 2, dv / 2 + 25, dv / 2 - 25, dv + 90, dv - 90]) cands.push(pol(B[0], B[1], d, r));
  out.push(colocaEtiquetas([{ t: `Dv ${pad3(dv)}°`, cands, ref: [mx, my], p: 'dv' }], { W: 236, H, segs, cajas: [{ x0: tc[0] - 34, y0: tc[1] - 34, x1: tc[0] + 34, y1: tc[1] + 34 }] }));
  // --- a la derecha: los dos nortes (Ct exagerada ×3) y las dos demoras
  out.push(`<line x1="240" y1="18" x2="240" y2="244" stroke="${T.tinta}" stroke-width=".6"/>`);
  const N = [298, 92];
  out.push(`<circle cx="${N[0]}" cy="${N[1]}" r="44" fill="${T.papel}" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(flecha(N[0], N[1], N[0], N[1] - 40, { color: T.tinta, w: 1.6, p: 'nv' }), rotulo(N[0], N[1] - 50, 'Nv', { size: TXT.rotulo, weight: 700, estilo: 'serif' }));
  if (ct) {
    const [ax, ay] = pol(N[0], N[1], ct * 3, 36);
    out.push(`<g data-parte="ct"><line x1="${N[0]}" y1="${N[1]}" x2="${f1(ax)}" y2="${f1(ay)}" stroke="${T.azulTxt}" stroke-width="1.5" stroke-dasharray="9 3 2 3"/>` +
      `<path d="${arcoD(N[0], N[1], 24, Math.min(0, ct * 3), Math.max(0, ct * 3))}" fill="none" stroke="${T.magenta}" stroke-width="1.8"/></g>`);
    const [tx, ty] = pol(N[0], N[1], ct * 3, 30);
    out.push(rotulo(tx + (ct < 0 ? -10 : 10), ty + 4, 'Na', { size: TXT.rotulo, weight: 700, estilo: 'serif', color: T.azulTxt, anchor: ct < 0 ? 'end' : 'start' }));
  }
  out.push(rotulo(N[0], N[1] + 30, ct ? `Ct ${conSigno(ct)}` : 'Ct 0°', { size: TXT.rotulo, weight: 700, estilo: 'mono', color: T.magenta, p: 'ct' }));
  out.push(rotulo(N[0], 156, 'ángulo ×3', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(etiqueta(N[0], 182, `Dv ${pad3(dv)}°`, { p: 'dv' }), rotulo(N[0], 202, 'en la carta', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  out.push(etiqueta(N[0], 224, `Da ${pad3(da)}°`, { color: T.azulTxt, p: 'da' }), rotulo(N[0], 244, 'con la aguja', { size: TXT.min, estilo: 'serif', italic: true, color: T.apagado }));
  // --- abajo: la cuenta
  out.push(etiqueta(W / 2, 274, `Ct = Dv − Da = ${pad3(dv)}° − ${pad3(da)}° = ${conSigno(ct)}`, { color: T.magenta, p: 'ct' }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Cuando dos marcas se ven una detrás de otra estás sobre su enfilación: la demora verdadera la mides en la carta y la de aguja con la aguja. La diferencia es la corrección total.' };
}

// ---------------------------------------------------------------------------
// Situación por dos demoras simultáneas. spec: { tipo:'demoras', d1?: Dv al faro A, d2?: Dv al faro B }

export function demorasIllustration(spec) {
  const d1 = Number(spec.d1 ?? 330);
  const d2 = Number(spec.d2 ?? 34);
  const W = 358;
  const H = 316;
  const A = [80, 82];
  const B = [282, 70];
  // desde cada faro, la demora opuesta; el barco está en el corte
  const u = pol(0, 0, d1 + 180, 1);
  const v = pol(0, 0, d2 + 180, 1);
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 0.2) return null; // líneas casi paralelas: mala situación
  const t = ((B[0] - A[0]) * v[1] - (B[1] - A[1]) * v[0]) / den;
  const P = [A[0] + u[0] * t, A[1] + u[1] * t];
  if (!(t > 20 && P[0] > 30 && P[0] < W - 30 && P[1] > 120 && P[1] < 262)) return null;
  const tb = Math.hypot(P[0] - B[0], P[1] - B[1]);
  const alt = `Situación por dos demoras simultáneas: desde el faro A se traza la demora ${pad3(d1)}° (hacia el ${pad3(d1 + 180)}°) y desde el faro B la ${pad3(d2)}° (hacia el ${pad3(d2 + 180)}°); el barco está en el corte de las dos líneas.`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra('M0,0 H358 V62 C330,70 306,88 282,80 C246,68 214,58 180,82 C150,104 116,104 80,94 C50,86 24,92 0,104 Z', pt));
  out.push(ondas(14, W - 14, 280, { sep: 9 }));
  const ext = (p, dir, len) => [p[0] + dir[0] * len, p[1] + dir[1] * len];
  const la = ext(A, u, t + 26);
  const lb = ext(B, v, tb + 26);
  out.push(`<line data-parte="demora-a" x1="${A[0]}" y1="${A[1]}" x2="${f1(la[0])}" y2="${f1(la[1])}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push(`<line data-parte="demora-b" x1="${B[0]}" y1="${B[1]}" x2="${f1(lb[0])}" y2="${f1(lb[1])}" stroke="${T.tinta}" stroke-width="1.6" stroke-dasharray="8 4"/>`);
  out.push(faro(A[0], A[1], { p: 'demora-a' }), faro(B[0], B[1], { p: 'demora-b', dur: 2.6 }));
  out.push(rotulo(A[0], A[1] - 12, 'faro A', { size: TXT.nota, weight: 700, estilo: 'serif' }), rotulo(B[0], B[1] - 12, 'faro B', { size: TXT.nota, weight: 700, estilo: 'serif' }));
  // el ángulo entre las dos líneas en el corte (cuanto más cerca de 90°, mejor)
  out.push(situacion(P[0], P[1], { p: 'situacion' }));
  out.push(rosaNorte(W - 30, H - 74));
  const segs = [[A, la], [B, lb]];
  const cajas = [{ x0: W - 52, y0: H - 102, x1: W - 8, y1: H - 52 }, { x0: P[0] - 10, y0: P[1] - 10, x1: P[0] + 10, y1: P[1] + 10 }, { x0: W / 2 - 110, y0: H - 50, x1: W / 2 + 110, y1: H - 6 }];
  const pet = [
    { t: `Dv ${pad3(d1)}°`, cands: junto(A, P, `Dv ${pad3(d1)}°`, { centro: [W / 2, 200], ks: [0.45, 0.3, 0.6] }), p: 'demora-a' },
    { t: `Dv ${pad3(d2)}°`, cands: junto(B, P, `Dv ${pad3(d2)}°`, { centro: [W / 2, 200], ks: [0.45, 0.3, 0.6] }), p: 'demora-b' },
  ];
  const cs = [];
  for (const r of [54, 68]) for (const d of [90, 270, 0, 135, 225, 45, 315, 180]) cs.push(pol(P[0], P[1], d, r));
  pet.push({ t: 'situación', cands: cs, rotulo: true, color: T.magenta, p: 'situacion' });
  out.push(colocaEtiquetas(pet, { W, H, segs, cajas }));
  out.push(cartela(W / 2, H - 28, 'DESDE CADA FARO', 'la demora opuesta: Dv ± 180°', { ancho: 214 }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'Se toman a la vez las demoras de dos puntos de la costa, se pasan a verdaderas y se trazan en la carta desde cada punto (la línea de demora pasa por el faro). El barco está en el corte. Es más fiable cuanto más se acerque a 90° el ángulo entre las dos líneas.' };
}

// ---------------------------------------------------------------------------
// Loxodrómica: el triángulo de estima (Δl, apartamiento, distancia y rumbo). spec: { tipo:'loxodromica' }

export function loxodromicaIllustration() {
  const W = 358;
  const H = 300;
  const alt = 'Triángulo de estima: de la salida a la llegada, la distancia D al rumbo R es la hipotenusa; el cateto norte-sur es la diferencia de latitud, Δl = D · cos R, y el este-oeste el apartamiento, A = D · sen R, en millas. La diferencia de longitud es ΔL = A / cos lm.';
  const { out, cierra } = lienzo(W, H, alt);
  const a = [64, 228];
  const b = [232, 72];
  const R = (Math.atan2(b[0] - a[0], a[1] - b[1]) * 180) / Math.PI;
  // meridiano de la salida y paralelo de la llegada
  out.push(`<line x1="${a[0]}" y1="${a[1] + 14}" x2="${a[0]}" y2="40" stroke="${T.apagado}" stroke-width=".7" stroke-dasharray="4 3"/>`, rotulo(a[0], 34, 'N', { size: TXT.min, weight: 700, estilo: 'serif', color: T.apagado }));
  out.push(`<line data-parte="dl" x1="${a[0]}" y1="${a[1]}" x2="${a[0]}" y2="${b[1]}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push(`<line data-parte="A" x1="${a[0]}" y1="${b[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${T.tinta}" stroke-width="1.6"/>`);
  out.push(`<path d="M${a[0]},${b[1] + 10} h10 v-10" fill="none" stroke="${T.tinta}" stroke-width=".8"/>`);
  out.push(flecha(a[0], a[1], b[0], b[1], { color: T.magenta, w: 2, p: 'D' }));
  out.push(cotaArco(a[0], a[1], 46, 0, R, 'R', { color: T.magenta, rEt: 60, p: 'R' }));
  out.push(`<circle cx="${a[0]}" cy="${a[1]}" r="3.5" fill="${T.tinta}"/>`, `<circle cx="${b[0]}" cy="${b[1]}" r="3.5" fill="${T.tinta}"/>`);
  out.push(rotulo(a[0] + 8, a[1] + 18, 'salida', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }), rotulo(b[0] + 8, b[1] + 4, 'llegada', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start' }));
  // cotas de los catetos, con sus fórmulas
  out.push(etiqueta(a[0] - 2, (a[1] + b[1]) / 2 - 18, 'Δl', { p: 'dl' }), rotulo(a[0] + 10, (a[1] + b[1]) / 2 + 4, 'D · cos R', { size: TXT.nota, estilo: 'mono', anchor: 'start', p: 'dl' }));
  out.push(etiqueta((a[0] + b[0]) / 2, b[1] - 16, 'A = D · sen R', { p: 'A' }));
  out.push(etiqueta((a[0] + b[0]) / 2 + 30, (a[1] + b[1]) / 2 + 22, 'D', { color: T.magenta, p: 'D' }));
  // la longitud: el apartamiento en millas se pasa a minutos de longitud
  out.push(cartela(268, 186, 'ΔL = A / cos lm', 'lm: latitud media', { ancho: 148, color: T.magenta, p: 'dL' }));
  out.push(rotulo(W / 2, H - 38, 'tg R = A / Δl', { size: TXT.nota, estilo: 'mono' }), rotulo(W / 2, H - 18, 'D = Δl / cos R', { size: TXT.nota, estilo: 'mono' }));
  out.push(cierra());
  return { svg: out.join(''), caption: 'La distancia y el rumbo forman un triángulo rectángulo con la diferencia de latitud (Δl) y el apartamiento (A, en millas). El apartamiento se pasa a diferencia de longitud dividiendo por el coseno de la latitud media.' };
}
