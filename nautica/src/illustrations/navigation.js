// Ilustraciones de navegación: nortes y corrección total, enfilación, triángulos de corriente, abatimiento,
// viento aparente (también según el rumbo), loxodrómica, mareas (y vivas/muertas), situación por dos demoras, sectores de las luces, canal balizado y dispositivo de separación del tráfico.
// Los colores son de saturación media para leerse en los temas claro y oscuro (el fondo es il-panel).

import { deg3 } from './kit.js';

const C = { v: '#2563eb', m: '#16a34a', a: '#d97706', r: '#dc2626', p: '#7c3aed', g: '#64748b' };

const defs = (id) => `<defs>${Object.entries(C).map(([k, c]) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;
const open = (W, H, label, id) => [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${label}">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, defs(id)];
const title = (x, t) => `<text x="${x}" y="22" class="il-title">${t}</text>`;
const rad = (d) => (d * Math.PI) / 180;
/** Punto a una distancia r desde (x, y) en un rumbo náutico (0 = arriba, sentido horario). */
const pol = (x, y, deg, r) => [x + Math.sin(rad(deg)) * r, y - Math.cos(rad(deg)) * r];
const arrow = (x1, y1, x2, y2, c, id, w = 2.4, extra = '') => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${C[c]}" stroke-width="${w}" marker-end="url(#${id}-${c})" ${extra}/>`;
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="il-lbl" text-anchor="${anchor}" ${c ? `style="fill:${C[c]}"` : ''} ${extra}>${t}</text>`;
/** Arco de ángulo entre dos rumbos (de a hasta b, sentido horario si b > a). */
function arc(x, y, r, a, b, c) {
  const [x1, y1] = pol(x, y, a, r);
  const [x2, y2] = pol(x, y, b, r);
  const large = Math.abs(b - a) > 180 ? 1 : 0;
  const sweep = b > a ? 1 : 0;
  return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${C[c]}" stroke-width="1.6"/>`;
}
const fmt = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}°`;

// Nortes (verdadero, magnético y de aguja): ahora es interactiva, en src/illustrations/interactivas/nortes.js.

// ---------------------------------------------------------------------------
// Enfilación: dos marcas alineadas dan una demora verdadera exacta. spec: { tipo:'enfilacion', dv: 40, da: 44 }

export function enfilacionIllustration(spec) {
  const dvv = Number(spec.dv ?? 40);
  const da = Number(spec.da ?? 44);
  const ct = dvv - da;
  const W = 320;
  const H = 240;
  const out = open(W, H, 'Enfilación', 'en');
  out.push(title(160, 'Enfilación: Ct = Dv − Da'));
  const b = [70, 200];
  const f1 = pol(b[0], b[1], dvv, 150);
  const f2 = pol(b[0], b[1], dvv, 200);
  out.push(`<line x1="${b[0]}" y1="${b[1]}" x2="${f2[0]}" y2="${f2[1]}" stroke="${C.v}" stroke-width="1.5" stroke-dasharray="6 4"/>`);
  for (const [x, y, t] of [[...f1, 'A'], [...f2, 'B']]) out.push(`<circle cx="${x}" cy="${y}" r="7" fill="#facc15" stroke="#92400e"><animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite"/></circle>`, lbl(x + 10, y + 4, `faro ${t}`));
  out.push(`<path d="M${b[0]},${b[1] - 10} l6,16 l-12,0z" fill="${C.g}"/>`);
  const n = pol(b[0], b[1], 0, 70);
  out.push(arrow(b[0], b[1], n[0], n[1], 'v', 'en'), lbl(n[0] + (ct < 0 ? 6 : -6), n[1] - 5, 'Nv', 'v', ct < 0 ? 'start' : 'end'));
  // Ct = Dv − Da: con Ct negativa el norte de aguja queda al W (izquierda) del verdadero (ángulo exagerado ×3)
  const na = pol(b[0], b[1], ct * 3, 60);
  out.push(arrow(b[0], b[1], na[0], na[1], 'a', 'en', 1.8), lbl(na[0] + (ct < 0 ? -4 : 4), na[1] - 5, 'Na', 'a', ct < 0 ? 'end' : 'start'));
  out.push(arc(b[0], b[1], 30, Math.min(ct * 3, dvv), Math.max(ct * 3, dvv), 'a'));
  out.push(arc(b[0], b[1], 40, 0, dvv, 'v'), lbl(b[0] + 26, b[1] - 46, `Dv ${dvv}° (carta)`, 'v'));
  out.push(lbl(150, 200, `Da ${da}° (aguja)`, 'a'), lbl(150, 216, `Ct = ${dvv}° − ${da}° = ${fmt(ct)}`, 'r', 'start', 'font-weight="700"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Cuando dos marcas se ven una detrás de otra estás sobre su enfilación: la demora verdadera la mides en la carta y la de aguja con la aguja. La diferencia es la corrección total.' };
}

// Corriente y abatimiento: ahora son interactivas, en src/illustrations/interactivas/ (cadena.js, corriente.js, abatimiento.js).

// ---------------------------------------------------------------------------
// Viento real, de avance y aparente. spec: { tipo:'viento-aparente' }

const RUMBOS_VIENTO = { cenida: ['Ceñida', 45], traves: ['Través', 90], aleta: ['Aleta', 135], popa: ['Popa', 180] };

/** Viento aparente según el ángulo del viento real con la proa (real 12 kn, barco 6 kn). */
function vientoAparenteRumbo(rumbo) {
  const [nombre, ang] = RUMBOS_VIENTO[rumbo];
  const vr = 12;
  const vb = 6;
  const s = 7.5;
  // vectores en pantalla (proa hacia arriba): el real viene de «ang» grados por estribor y va hacia ang + 180
  const real = [-Math.sin(rad(ang)) * vr, Math.cos(rad(ang)) * vr];
  const avance = [0, vb];
  const ap = [real[0] + avance[0], real[1] + avance[1]];
  const vap = Math.hypot(...ap);
  const angAp = Math.round((Math.atan2(-ap[0], ap[1]) * 180) / Math.PI);
  const W = 320;
  const H = 256;
  const out = open(W, H, 'Viento aparente', 'vr');
  out.push(title(160, `${nombre}: viento real a ${ang}° de la proa`));
  const boat = [96, 172];
  out.push(`<g transform="translate(${boat[0]} ${boat[1]})"><path d="M0,-34 C12,-20 12,0 11,26 L-11,26 C-12,0 -12,-20 0,-34Z" class="il-hull-plan"/></g>`, lbl(boat[0], boat[1] - 40, 'proa', null, 'middle', 'font-size="9"'));
  // el triángulo termina junto al barco, por su estribor (por donde le llega el viento)
  if (ang === 180) {
    // en popa los tres vectores van en la misma línea: se dibujan uno junto a otro
    const x = boat[0] + 26;
    const yb = boat[1] + 60;
    out.push(arrow(x, yb, x, yb - vr * s, 'v', 'vr', 2.4), arrow(x + 12, yb - vr * s, x + 12, yb - vr * s + vb * s, 'm', 'vr', 2.4));
    out.push(`<line x1="${x + 24}" y1="${yb}" x2="${x + 24}" y2="${yb - vap * s}" stroke="${C.r}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#vr-r)"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" repeatCount="indefinite"/></line>`);
  } else {
    const P = [boat[0] + 22, boat[1] - 6];
    const o = [P[0] - ap[0] * s, P[1] - ap[1] * s];
    const m = [o[0] + real[0] * s, o[1] + real[1] * s];
    out.push(arrow(o[0], o[1], m[0], m[1], 'v', 'vr', 2.4), arrow(m[0], m[1], P[0], P[1], 'm', 'vr', 2.4));
    out.push(`<line x1="${o[0].toFixed(1)}" y1="${o[1].toFixed(1)}" x2="${P[0].toFixed(1)}" y2="${P[1].toFixed(1)}" stroke="${C.r}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#vr-r)"><animate attributeName="stroke-dashoffset" from="22" to="0" dur="1s" repeatCount="indefinite"/></line>`);
  }
  out.push(lbl(220, 52, `real: ${vr} kn`, 'v', 'start', 'font-weight="700"'), lbl(220, 66, ang === 180 ? 'de popa' : `de ${ang}° por Er`, 'v'));
  out.push(lbl(220, 88, `de avance: ${vb} kn`, 'm', 'start', 'font-weight="700"'), lbl(220, 102, 'de proa', 'm'));
  out.push(lbl(220, 124, `aparente: ${vap.toFixed(1).replace('.', ',')} kn`, 'r', 'start', 'font-weight="700"'), lbl(220, 138, angAp === 180 ? 'de popa' : `de ${angAp}° por Er`, 'r'));
  const comp = vap > vr ? 'más fuerte que el real y más a proa' : vap < vr ? `más flojo que el real${angAp < ang ? ' y más a proa' : ''}` : 'igual que el real';
  out.push(lbl(14, H - 12, `Aparente ${comp}`, null, 'start', 'font-weight="700"'));
  out.push('</svg>');
  const cap = {
    cenida: 'Ciñendo, el viento de avance se suma casi de frente: el aparente es más fuerte que el real y entra más cerrado (más a proa). Por eso a bordo parece que sopla más de lo que sopla.',
    traves: 'Con el real de través, el aparente sigue siendo algo más fuerte que el real y entra por delante del través.',
    aleta: 'Con el real por la aleta, el aparente es más flojo que el real y entra más a proa: navegando con el viento a favor se nota menos viento.',
    popa: 'Con el real en popa, el aparente es la diferencia entre el real y tu velocidad: viene de popa y es más flojo. A tu misma velocidad, el aparente sería nulo.',
  };
  return { svg: out.join(''), caption: cap[rumbo] };
}

export function vientoAparenteIllustration(spec = {}) {
  if (spec.rumbo) return RUMBOS_VIENTO[spec.rumbo] ? vientoAparenteRumbo(spec.rumbo) : null;
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Viento aparente', 'va');
  out.push(title(160, 'Real + de avance = aparente'));
  const o = [200, 70];
  const s = 9;
  // viento real del través de estribor (sopla hacia el oeste), barco a rumbo norte
  const real = [-14 * s, 0];
  const avance = [0, 8 * s];
  out.push(`<path d="M120,230 L128,200 L136,230Z" fill="${C.g}"/>`, lbl(140, 225, 'barco a rumbo N'));
  out.push(arrow(o[0], o[1], o[0] + real[0], o[1] + real[1], 'v', 'va'), lbl(o[0] + real[0] / 2, o[1] - 8, 'real (14 kn)', 'v', 'middle'));
  out.push(arrow(o[0] + real[0], o[1], o[0] + real[0] + avance[0], o[1] + avance[1], 'm', 'va'), lbl(o[0] + real[0] - 6, o[1] + avance[1] / 2, 'de avance (8 kn)', 'm', 'end'));
  out.push(arrow(o[0], o[1], o[0] + real[0] + avance[0], o[1] + avance[1], 'r', 'va', 2.8), lbl(o[0] - 20, o[1] + 52, 'aparente', 'r', 'start', 'font-weight="700"'));
  out.push(lbl(14, H - 12, 'El de avance es igual y contrario a la velocidad del barco'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'A bordo notas el viento aparente: la suma del real y del que produce tu propio avance. Al navegar, el aparente entra más por la proa que el real y, ciñendo, es más fuerte.' };
}

// ---------------------------------------------------------------------------
// Loxodrómica: triángulo Δl, apartamiento y rumbo. spec: { tipo:'loxodromica' }

export function loxodromicaIllustration() {
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Loxodrómica', 'lx');
  out.push(title(160, 'Estima: Δl, apartamiento y rumbo'));
  const a = [70, 220];
  const b = [250, 70];
  out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${a[0]}" y2="${b[1]}" stroke="${C.v}" stroke-width="2"/>`, lbl(a[0] + 6, (a[1] + b[1]) / 2 - 20, 'Δl = D · cos R', 'v', 'start'));
  out.push(`<line x1="${a[0]}" y1="${b[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.m}" stroke-width="2"/>`, lbl((a[0] + b[0]) / 2, b[1] - 8, 'A = D · sen R', 'm', 'middle'));
  out.push(arrow(a[0], a[1], b[0], b[1], 'r', 'lx', 2.8), lbl((a[0] + b[0]) / 2 + 10, (a[1] + b[1]) / 2 + 18, 'D (millas)', 'r'));
  out.push(arc(a[0], a[1], 40, 0, Math.atan2(b[0] - a[0], a[1] - b[1]) * (180 / Math.PI), 'a'), lbl(a[0] + 16, a[1] - 46, 'R', 'a', 'start', 'font-weight="700"'));
  out.push(`<circle cx="${a[0]}" cy="${a[1]}" r="4" fill="currentColor"/><circle cx="${b[0]}" cy="${b[1]}" r="4" fill="currentColor"/>`);
  out.push(lbl(a[0] + 8, a[1] + 14, 'salida'), lbl(b[0] - 4, b[1] - 10, 'llegada', null, 'end'));
  out.push(lbl(180, 200, 'ΔL = A / cos lm', 'p', 'start', 'font-weight="700"'), lbl(180, 216, 'lm = latitud media', 'p'));
  out.push(lbl(14, H - 12, 'tg R = A / Δl · D = Δl / cos R'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'La distancia y el rumbo forman un triángulo rectángulo con la diferencia de latitud (Δl) y el apartamiento (A, en millas). El apartamiento se pasa a diferencia de longitud dividiendo por el coseno de la latitud media.' };
}

// ---------------------------------------------------------------------------
// Mareas. spec: { tipo:'marea', modo:'curva'|'duodecimos'|'sonda' }

export function mareaIllustration(spec) {
  // curva, duodécimos y sonda: ahora son interactivas (src/illustrations/interactivas/marea.js)
  return spec.modo === 'fases' ? mareasVivasMuertas() : null;
}

// Sectores de las luces: ahora es interactiva, en src/illustrations/interactivas/sectores-luces.js.

// ---------------------------------------------------------------------------
// Canal balizado visto desde arriba. spec: { tipo:'canal', sentido:'entrando'|'saliendo' }

export function canalIllustration(spec) {
  const entrando = (spec.sentido ?? 'entrando') === 'entrando';
  const W = 320;
  const H = 280;
  const out = open(W, H, 'Canal balizado', 'cn');
  out.push(title(160, `Canal balizado · ${entrando ? 'entrando' : 'saliendo'}`));
  out.push(`<rect x="0" y="34" width="320" height="40" fill="#a16207" opacity=".75"/>`, lbl(160, 58, 'PUERTO', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  out.push(`<rect x="90" y="74" width="140" height="206" fill="#38bdf8" opacity=".3"/>`);
  for (let i = 0; i < 3; i++) {
    const y = 250 - i * 66;
    const n = i * 2 + 1;
    out.push(`<rect x="76" y="${y - 14}" width="12" height="16" fill="#dc2626"/>`, lbl(70, y, String(n + 1), 'r', 'end'));
    out.push(`<path d="M238,${y + 2} L244,${y - 14} L250,${y + 2}Z" fill="#16a34a"/>`, lbl(256, y, String(n), 'm'));
  }
  const path = entrando ? 'M160,280 L160,80' : 'M160,80 L160,280';
  out.push(`<line x1="160" y1="270" x2="160" y2="84" stroke="${C.g}" stroke-dasharray="6 5"/>`);
  out.push(`<g><path d="M14,0 L-6,7 L-6,-7Z" fill="${C.v}" stroke="#fff"/><animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="${path}"/></g>`);
  out.push(lbl(14, H - 8, entrando ? 'Rojas a babor, verdes a estribor' : 'Saliendo: rojas a estribor, verdes a babor', null, 'start', 'font-weight="700"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'El sentido convencional del balizamiento es entrando a puerto (de la mar hacia tierra). Entrando, las rojas (cilíndricas, numeración par) quedan a babor y las verdes (cónicas, impar) a estribor; saliendo, al revés.' };
}

// ---------------------------------------------------------------------------
// Dispositivo de separación del tráfico (Regla 10). spec: { tipo:'dst' }

export function dstIllustration() {
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Dispositivo de separación del tráfico', 'ds');
  out.push(title(160, 'Separación del tráfico (Regla 10)'));
  out.push(`<rect x="0" y="220" width="320" height="40" fill="#a16207" opacity=".75"/>`, lbl(160, 244, 'COSTA', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  out.push(`<rect x="0" y="60" width="320" height="50" fill="${C.v}" opacity=".12"/><rect x="0" y="110" width="320" height="16" fill="#a855f7" opacity=".35"/><rect x="0" y="126" width="320" height="50" fill="${C.v}" opacity=".12"/>`);
  out.push(lbl(8, 76, 'vía de circulación'), lbl(8, 122, 'zona de separación', 'p'), lbl(8, 142, 'vía de circulación'), lbl(8, 198, 'zona de navegación costera'));
  for (let x = 60; x < 300; x += 80) out.push(arrow(x + 40, 88, x, 88, 'v', 'ds', 2), arrow(x, 152, x + 40, 152, 'v', 'ds', 2));
  out.push(arrow(250, 210, 250, 50, 'r', 'ds', 2.6), lbl(256, 56, 'cruzar a 90°', 'r'));
  out.push(`<g><path d="M0,-12 L6,6 L-6,6Z" fill="${C.r}"/><animateMotion dur="7s" repeatCount="indefinite" path="M250,210 L250,50"/></g>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Se navega por la vía en el sentido de la circulación. Si hay que cruzarlo, lo más perpendicular posible a la corriente de tráfico; para entrar o salir, por los extremos o con el menor ángulo. Los buques de menos de 20 m, los de vela y los pesqueros pueden usar la zona de navegación costera.' };
}

// ---------------------------------------------------------------------------
// Mareas vivas y muertas: Sol, Tierra y Luna. spec: { tipo:'marea', modo:'fases' }

function mareasVivasMuertas() {
  const W = 320;
  const H = 320;
  const out = open(W, H, 'Mareas vivas y muertas', 'mf');
  out.push(title(160, 'Mareas vivas y muertas'));
  const E = [196, 134];
  const R = 74;
  const dur = 16;
  out.push(`<circle cx="-30" cy="${E[1]}" r="62" fill="#facc15" opacity=".9"/>`, lbl(12, E[1] + 4, 'Sol', null, 'start', 'font-weight="700"'));
  for (let i = 0; i < 4; i++) out.push(`<line x1="40" y1="${E[1] - 30 + i * 20}" x2="70" y2="${E[1] - 30 + i * 20}" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 3"/>`);
  out.push(`<circle cx="${E[0]}" cy="${E[1]}" r="${R}" fill="none" stroke="${C.g}" stroke-dasharray="3 4"/>`);
  // fases en la órbita (la Luna gira en sentido antihorario visto desde el norte)
  const ph = [['nueva', -R, 0, 'end'], ['cuarto creciente', 0, R, 'middle'], ['llena', R, 0, 'start'], ['cuarto menguante', 0, -R, 'middle']];
  for (const [t, dx, dy, a] of ph) out.push(lbl(E[0] + dx * 1.18 + (a === 'end' ? 4 : a === 'start' ? -4 : 0), E[1] + dy * 1.18 + (dy > 0 ? 10 : dy < 0 ? -2 : 4), t, 'g', a, 'font-size="9"'));
  out.push(`<g><animateTransform attributeName="transform" type="rotate" from="0 ${E[0]} ${E[1]}" to="-360 ${E[0]} ${E[1]}" dur="${dur}s" repeatCount="indefinite"/>` +
    `<ellipse cx="${E[0]}" cy="${E[1]}" rx="34" ry="19" fill="#38bdf8" opacity=".55"><animate attributeName="rx" values="34;24;34;24;34" dur="${dur}s" repeatCount="indefinite"/></ellipse>` +
    `<circle cx="${E[0] - R}" cy="${E[1]}" r="9" fill="#cbd5e1" stroke="#64748b"/></g>`);
  out.push(`<circle cx="${E[0]}" cy="${E[1]}" r="15" fill="#2563eb"/><text x="${E[0]}" y="${E[1] + 3.5}" font-size="8" text-anchor="middle" fill="#fff">Tierra</text>`);
  const vis = (on) => `<animate attributeName="opacity" values="${on ? '1;0;1;0;1' : '0;1;0;1;0'}" keyTimes="0;.125;.375;.625;.875" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
  out.push(`<text x="160" y="${H - 62}" class="il-lbl strong" text-anchor="middle" style="fill:${C.r}" font-size="12">Alineados (sicigias): MAREAS VIVAS${vis(true)}</text>`);
  out.push(`<text x="160" y="${H - 62}" class="il-lbl strong" text-anchor="middle" style="fill:${C.v}" font-size="12" opacity="0">En ángulo recto (cuadraturas): MAREAS MUERTAS${vis(false)}</text>`);
  // curvas de marea comparadas
  const curve = (x0, A, c) => { const p = []; for (let i = 0; i <= 40; i++) p.push(`${(x0 + i * 3).toFixed(1)},${(H - 32 + A * Math.cos((i / 40) * 4 * Math.PI)).toFixed(1)}`); return `<polyline points="${p.join(' ')}" fill="none" stroke="${c}" stroke-width="2"/>`; };
  out.push(curve(20, 14, C.r), lbl(80, H - 4, 'vivas: más amplitud', 'r', 'middle', 'font-size="9"'));
  out.push(curve(180, 6, C.v), lbl(240, H - 4, 'muertas: menos amplitud', 'v', 'middle', 'font-size="9"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Con luna nueva y luna llena (sicigias) el Sol, la Tierra y la Luna están alineados y sus atracciones se suman: mareas vivas, de mayor amplitud. En los cuartos creciente y menguante (cuadraturas) se contrarrestan: mareas muertas, de menor amplitud. Ocurren cada unos 15 días.' };
}

// ---------------------------------------------------------------------------
// Situación por dos demoras simultáneas. spec: { tipo:'demoras', d1?: Dv al faro A, d2?: Dv al faro B }

export function demorasIllustration(spec) {
  const d1 = Number(spec.d1 ?? 330);
  const d2 = Number(spec.d2 ?? 34);
  const A = [70, 86];
  const B = [252, 74];
  // desde cada faro, la demora opuesta; el barco está en el corte
  const u = pol(0, 0, d1 + 180, 1);
  const v = pol(0, 0, d2 + 180, 1);
  const den = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(den) < 0.2) return null; // líneas casi paralelas: mala situación
  const t = ((B[0] - A[0]) * v[1] - (B[1] - A[1]) * v[0]) / den;
  const P = [A[0] + u[0] * t, A[1] + u[1] * t];
  if (!(t > 20 && P[0] > 20 && P[0] < 300 && P[1] > 110 && P[1] < 260)) return null;
  const W = 320;
  const H = 300;
  const out = open(W, H, 'Situación por dos demoras', 'dm');
  out.push(title(160, 'Situación por dos demoras simultáneas'));
  out.push(`<path d="M0,32 L320,32 L320,70 Q280,92 252,82 Q200,64 160,92 Q110,108 70,94 Q30,84 0,100Z" fill="#a16207" opacity=".55"/>`);
  for (const [p, n] of [[A, 'A'], [B, 'B']]) out.push(`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#facc15" stroke="#92400e"><animate attributeName="opacity" values="1;.35;1" dur="2s" repeatCount="indefinite"/></circle>`, lbl(p[0], p[1] - 10, `faro ${n}`, null, 'middle', 'font-weight="700"'));
  const ext = (p, dir, len) => [p[0] + dir[0] * len, p[1] + dir[1] * len];
  const la = ext(A, u, t + 22);
  const lb = ext(B, v, Math.hypot(P[0] - B[0], P[1] - B[1]) + 22);
  const line = (p, q, c, begin) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${C[c]}" stroke-width="2" stroke-dasharray="400" stroke-dashoffset="400"><animate attributeName="stroke-dashoffset" values="400;400;0;0" keyTimes="0;${begin};${begin + 0.3};1" dur="8s" repeatCount="indefinite"/></line>`;
  out.push(line(A, la, 'v', 0), line(B, lb, 'p', 0.3));
  const ma = ext(A, u, t * 0.45);
  const mb = ext(B, v, Math.hypot(P[0] - B[0], P[1] - B[1]) * 0.45);
  out.push(lbl(ma[0] + (u[0] < 0 ? 8 : -8), ma[1], `Dv ${deg3(d1)}`, 'v', u[0] < 0 ? 'start' : 'end', 'font-weight="700"'));
  out.push(lbl(mb[0] + (v[0] < 0 ? 8 : -8), mb[1], `Dv ${deg3(d2)}`, 'p', v[0] < 0 ? 'start' : 'end', 'font-weight="700"'));
  out.push(`<g opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.62;.66;1" dur="8s" repeatCount="indefinite"/><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="7" fill="none" stroke="${C.r}" stroke-width="2"/><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="2.5" fill="${C.r}"/>${lbl(P[0] + 11, P[1] + 4, 'situación', 'r', 'start', 'font-weight="700"')}</g>`);
  const n = [298, 214];
  out.push(arrow(n[0], n[1] + 16, n[0], n[1] - 18, 'g', 'dm', 1.6), lbl(n[0], n[1] - 22, 'Nv', 'g', 'middle', 'font-size="9"'));
  out.push(lbl(14, H - 24, 'Dv = Da + Ct de cada faro, tomadas a la vez', null, 'start', 'font-size="9.5"'));
  out.push(lbl(14, H - 10, 'Se trazan desde el faro con la demora opuesta (Dv ± 180°)', null, 'start', 'font-size="9.5"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Se toman a la vez las demoras de dos puntos de la costa, se pasan a verdaderas y se trazan en la carta desde cada punto (la línea de demora pasa por el faro). El barco está en el corte. Es más fiable cuanto más se acerque a 90° el ángulo entre las dos líneas.' };
}
