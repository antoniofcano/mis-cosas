// Ilustraciones de navegación: nortes y corrección total, enfilación, triángulos de corriente, abatimiento,
// viento aparente, loxodrómica, mareas, sectores de las luces, canal balizado y dispositivo de separación del tráfico.
// Los colores son de saturación media para leerse en los temas claro y oscuro (el fondo es il-panel).

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

// ---------------------------------------------------------------------------
// Nortes: verdadero, magnético y de aguja. spec: { tipo:'nortes', dm: -4, desvio: +2 }

export function nortesIllustration(spec) {
  const dm = Number(spec.dm ?? -4);
  const dv = Number(spec.desvio ?? 2);
  const ct = dm + dv;
  const k = 4; // exagera los ángulos para que se vean
  const W = 320;
  const H = 270;
  const cx = 160;
  const cy = 220;
  const out = open(W, H, 'Norte verdadero, magnético y de aguja', 'nt');
  out.push(title(cx, 'Nv, Nm y Na: declinación, desvío y Ct'));
  const L = 165;
  const nv = pol(cx, cy, 0, L);
  const nm = pol(cx, cy, dm * k, L - 10);
  const na = pol(cx, cy, ct * k, L - 20);
  out.push(arrow(cx, cy, nv[0], nv[1], 'v', 'nt', 2.6), lbl(nv[0], nv[1] - 6, 'Nv', 'v', 'middle', 'font-weight="700"'));
  out.push(arrow(cx, cy, nm[0], nm[1], 'm', 'nt', 2.2), lbl(nm[0], nm[1] - 6, 'Nm', 'm', 'middle', 'font-weight="700"'));
  out.push(arrow(cx, cy, na[0], na[1], 'a', 'nt', 2.2), lbl(na[0], na[1] - 6, 'Na', 'a', 'middle', 'font-weight="700"'));
  out.push(arc(cx, cy, 120, Math.min(0, dm * k), Math.max(0, dm * k), 'm'), lbl(cx + (dm < 0 ? -12 : 12), cy - 124, `dm ${fmt(dm)}`, 'm', dm < 0 ? 'end' : 'start'));
  out.push(arc(cx, cy, 95, Math.min(dm * k, ct * k), Math.max(dm * k, ct * k), 'a'), lbl(cx + (ct * k < dm * k ? -40 : 40), cy - 92, `Δ ${fmt(dv)}`, 'a', 'middle'));
  out.push(arc(cx, cy, 60, Math.min(0, ct * k), Math.max(0, ct * k), 'r'), lbl(cx + (ct < 0 ? -10 : 10), cy - 64, `Ct ${fmt(ct)}`, 'r', ct < 0 ? 'end' : 'start', 'font-weight="700"'));
  out.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`);
  out.push(lbl(14, H - 12, 'Este (E) suma · Oeste (W) resta · ángulos exagerados'));
  out.push('</svg>');
  return { svg: out.join(''), caption: `Ct = dm + Δ = ${fmt(dm)} ${dv < 0 ? '−' : '+'} ${Math.abs(dv)}° = ${fmt(ct)}. Rv = Ra + Ct y Dv = Da + Ct: de aguja a verdadero se suma la Ct con su signo.` };
}

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
  out.push(arrow(b[0], b[1], n[0], n[1], 'v', 'en'), lbl(n[0], n[1] - 5, 'Nv', 'v', 'middle'));
  const na = pol(b[0], b[1], -ct * 3, 60);
  out.push(arrow(b[0], b[1], na[0], na[1], 'a', 'en', 1.8), lbl(na[0] - 4, na[1] - 5, 'Na', 'a', 'end'));
  out.push(arc(b[0], b[1], 40, 0, dvv, 'v'), lbl(b[0] + 26, b[1] - 46, `Dv ${dvv}° (carta)`, 'v'));
  out.push(lbl(150, 200, `Da ${da}° (aguja)`, 'a'), lbl(150, 216, `Ct = ${dvv}° − ${da}° = ${fmt(ct)}`, 'r', 'start', 'font-weight="700"'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Cuando dos marcas se ven una detrás de otra estás sobre su enfilación: la demora verdadera la mides en la carta y la de aguja con la aguja. La diferencia es la corrección total.' };
}

// ---------------------------------------------------------------------------
// Triángulo de velocidades con corriente. spec: { tipo:'corriente', caso:'efectivo'|'rumbo-a-dar' }

export function corrienteIllustration(spec) {
  const W = 320;
  const H = 260;
  const out = open(W, H, 'Triángulo de corriente', 'co');
  const dar = spec.caso === 'rumbo-a-dar';
  out.push(title(160, dar ? 'Rumbo a dar con corriente' : 'Rumbo y velocidad efectivos'));
  const o = dar ? [50, 200] : [60, 220];
  const s = dar ? 18 : 22; // px por nudo
  const vb = [40, 6]; // rumbo, nudos
  const vc = [120, 2.5];
  const p1 = pol(o[0], o[1], vb[0], vb[1] * s);
  const p2 = pol(p1[0], p1[1], vc[0], vc[1] * s);
  if (dar) {
    // el efectivo es la línea hacia el destino; el rumbo a dar sale del extremo de la corriente
    const c1 = pol(o[0], o[1], vc[0], vc[1] * s);
    out.push(`<line x1="${o[0]}" y1="${o[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="${C.g}" stroke-dasharray="5 4"/>`, lbl(p2[0] + 6, p2[1], 'destino'));
    out.push(arrow(o[0], o[1], c1[0], c1[1], 'p', 'co'), lbl(c1[0] + 6, c1[1] + 4, '1 · corriente', 'p'));
    out.push(arrow(c1[0], c1[1], p2[0], p2[1], 'v', 'co'), lbl((c1[0] + p2[0]) / 2 + 8, (c1[1] + p2[1]) / 2 + 10, '2 · Rv a dar (radio Vb)', 'v'));
    out.push(arrow(o[0], o[1], p2[0], p2[1], 'r', 'co', 2.8), lbl((o[0] + p2[0]) / 2 - 10, (o[1] + p2[1]) / 2 - 6, '3 · Ref y Vef', 'r', 'end'));
  } else {
    out.push(arrow(o[0], o[1], p1[0], p1[1], 'v', 'co'), lbl((o[0] + p1[0]) / 2 - 8, (o[1] + p1[1]) / 2, 'Rv y Vb', 'v', 'end'));
    out.push(arrow(p1[0], p1[1], p2[0], p2[1], 'p', 'co'), lbl((p1[0] + p2[0]) / 2 + 4, (p1[1] + p2[1]) / 2 - 8, 'Rc e Ihc', 'p'));
    out.push(arrow(o[0], o[1], p2[0], p2[1], 'r', 'co', 2.8), lbl((o[0] + p2[0]) / 2 + 8, (o[1] + p2[1]) / 2 + 16, 'Ref y Vef', 'r'));
    out.push(`<circle r="5" fill="${C.r}"><animateMotion dur="5s" repeatCount="indefinite" path="M${o[0]},${o[1]} L${p2[0].toFixed(1)},${p2[1].toFixed(1)}"/></circle>`);
  }
  out.push(lbl(14, H - 10, 'Escala: 1 hora de navegación'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: dar
      ? 'Primero la corriente desde la salida; con centro en su extremo y radio la velocidad del barco cortas la línea al destino: esa dirección es el Rv a dar. La salida-corte es el efectivo.'
      : 'El barco avanza con su rumbo y velocidad y la corriente lo arrastra: la suma de los dos vectores es el rumbo y la velocidad efectivos (sobre el fondo).',
  };
}

// ---------------------------------------------------------------------------
// Abatimiento por el viento. spec: { tipo:'abatimiento', banda:'babor'|'estribor' }

export function abatimientoIllustration(spec) {
  const W = 320;
  const H = 250;
  const babor = (spec.banda ?? 'babor') === 'babor';
  const out = open(W, H, 'Abatimiento', 'ab');
  out.push(title(160, `Viento por ${babor ? 'babor' : 'estribor'}: abatimiento ${babor ? '+' : '−'}`));
  const o = [160, 220];
  const rv = 0;
  const ab = babor ? 14 : -14;
  const p = pol(o[0], o[1], rv, 170);
  const q = pol(o[0], o[1], rv + ab, 170);
  out.push(arrow(o[0], o[1], p[0], p[1], 'v', 'ab'), lbl(p[0] - 6, p[1] + 4, 'Rv (proa)', 'v', 'end'));
  out.push(arrow(o[0], o[1], q[0], q[1], 'r', 'ab', 2.8), lbl(q[0] + 6, q[1] + 4, 'Rs (superficie)', 'r', babor ? 'start' : 'end'));
  out.push(arc(o[0], o[1], 100, Math.min(rv, ab), Math.max(rv, ab), 'a'), lbl(o[0] + ab * 3, o[1] - 108, `Ab ${babor ? '+' : '−'}`, 'a', 'middle'));
  // barco sobre el Rv, desplazándose de lado hacia sotavento
  out.push(`<g><path d="M0,-18 L7,4 L5,14 L-5,14 L-7,4Z" fill="${C.g}"/><animateMotion dur="6s" repeatCount="indefinite" path="M${o[0]},${o[1] - 20} L${q[0].toFixed(1)},${(q[1] + 30).toFixed(1)}"/></g>`);
  for (let i = 0; i < 3; i++) {
    const y = 80 + i * 40;
    out.push(babor ? arrow(20, y, 60, y, 'g', 'ab', 2) : arrow(300, y, 260, y, 'g', 'ab', 2));
  }
  out.push(lbl(babor ? 20 : 300, 68, 'viento', 'g', babor ? 'start' : 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: `El viento empuja el barco a sotavento: el rumbo de superficie se separa del de proa. Rs = Rv + Ab, con el abatimiento positivo si el viento entra por babor y negativo si entra por estribor.` };
}

// ---------------------------------------------------------------------------
// Viento real, de avance y aparente. spec: { tipo:'viento-aparente' }

export function vientoAparenteIllustration() {
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
  out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${a[0]}" y2="${b[1]}" stroke="${C.v}" stroke-width="2"/>`, lbl(a[0] - 6, (a[1] + b[1]) / 2, 'Δl = D · cos R', 'v', 'end'));
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
  const modo = spec.modo ?? 'curva';
  const W = 320;
  const H = 250;
  const out = open(W, H, 'Mareas', 'mr');
  if (modo === 'sonda') {
    out.push(title(160, 'Sonda real = sonda de la carta + marea'));
    const cero = 175;
    const fondo = 225;
    const nivel = 95;
    out.push(`<rect x="10" y="${nivel}" width="300" height="${fondo - nivel}" fill="#38bdf8" opacity=".35"/>`);
    out.push(`<path d="M10,${fondo} Q160,${fondo - 12} 310,${fondo} L310,${H} L10,${H}Z" fill="#a16207" opacity=".8"/>`);
    out.push(`<line x1="10" y1="${cero}" x2="310" y2="${cero}" stroke="${C.p}" stroke-dasharray="6 4"/>`, lbl(14, cero - 4, 'cero hidrográfico (bajamar más baja)', 'p'));
    out.push(`<line x1="10" y1="${nivel}" x2="310" y2="${nivel}" stroke="${C.v}" stroke-width="2"><animate attributeName="y1" values="${nivel};${nivel + 30};${nivel}" dur="6s" repeatCount="indefinite"/><animate attributeName="y2" values="${nivel};${nivel + 30};${nivel}" dur="6s" repeatCount="indefinite"/></line>`, lbl(14, nivel - 4, 'nivel del mar ahora', 'v'));
    const x1 = 70;
    out.push(arrow(x1, cero, x1, fondo - 6, 'r', 'mr', 2), lbl(x1 + 6, (cero + fondo) / 2 + 4, 'sonda de la carta', 'r'));
    out.push(arrow(x1 + 120, cero, x1 + 120, nivel + 4, 'm', 'mr', 2), lbl(x1 + 126, (cero + nivel) / 2, 'altura de marea', 'm'));
    // barco y calado
    out.push(`<path d="M220,${nivel} L300,${nivel} L292,${nivel + 34} L228,${nivel + 34}Z" fill="${C.g}"/>`, lbl(258, nivel + 50, 'calado', null, 'middle'));
    out.push(lbl(14, H - 4, 'bajo la quilla = sonda carta + marea − calado', null, 'start', 'style="fill:#fff" font-weight="700"'));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Las sondas de la carta se miden desde el cero hidrográfico. El agua que tienes en un momento es esa sonda más la altura de la marea a esa hora; restando tu calado sabes cuánto queda bajo la quilla.' };
  }
  if (modo === 'duodecimos') {
    out.push(title(160, 'Regla de los duodécimos: 1-2-3-3-2-1'));
    const parts = [1, 2, 3, 3, 2, 1];
    let acc = 0;
    parts.forEach((p, i) => {
      const x = 30 + i * 46;
      const h = p * 11;
      out.push(`<rect x="${x}" y="${200 - (acc + p) * 11}" width="36" height="${h}" fill="${C.v}" opacity="${0.45 + p * 0.15}"/>`);
      out.push(lbl(x + 18, 216, `${i + 1}.ª h`, null, 'middle'), lbl(x + 18, 196 - (acc + p) * 11, `${p}/12`, 'v', 'middle'));
      acc += p;
    });
    out.push(`<line x1="24" y1="200" x2="300" y2="200" stroke="currentColor"/>`);
    out.push(lbl(14, H - 12, 'De bajamar a pleamar (≈ 6 h); igual al vaciar'));
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Aproximación para una marea semidiurna de unas 6 horas: cada hora sube 1, 2, 3, 3, 2 y 1 doceavos de la amplitud. La mitad de la subida ocurre en las dos horas centrales.' };
  }
  out.push(title(160, 'Pleamar, bajamar, amplitud y duración'));
  const x0 = 24;
  const x1 = 300;
  const mid = 125;
  const A = 70;
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    pts.push(`${(x0 + t * (x1 - x0)).toFixed(1)},${(mid + A * Math.cos(t * 2 * Math.PI)).toFixed(1)}`);
  }
  out.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${C.v}" stroke-width="2.4"/>`);
  const bmx = x0;
  const pmx = (x0 + x1) / 2;
  out.push(lbl(bmx + 4, mid + A + 16, 'BM'), lbl(pmx, mid - A - 8, 'PM', null, 'middle'), lbl(x1 - 4, mid + A + 16, 'BM', null, 'end'));
  out.push(`<line x1="${pmx + 40}" y1="${mid - A}" x2="${pmx + 40}" y2="${mid + A}" stroke="${C.r}" stroke-width="1.6"/>`, lbl(pmx + 46, mid, 'amplitud = PM − BM', 'r'));
  out.push(`<line x1="${bmx}" y1="${mid + A + 26}" x2="${pmx}" y2="${mid + A + 26}" stroke="${C.m}" stroke-width="1.6"/>`, lbl((bmx + pmx) / 2, mid + A + 40, 'duración de la creciente', 'm', 'middle'));
  out.push(`<circle r="5" fill="${C.r}"><animateMotion dur="8s" repeatCount="indefinite" path="M${pts.join(' L')}"/></circle>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Amplitud: diferencia entre pleamar y bajamar. Duración: tiempo entre una y otra (creciente o vaciante). En el anuario las horas vienen en UT: súmale el adelanto para la hora oficial.' };
}

// ---------------------------------------------------------------------------
// Sectores de visibilidad de las luces (Regla 21). spec: { tipo:'sectores-luces', luz?:'tope'|'costados'|'alcance'|'todas' }

export function sectoresIllustration(spec) {
  const luz = spec.luz ?? 'todas';
  const W = 320;
  const H = 300;
  const cx = 160;
  const cy = 160;
  const out = open(W, H, 'Sectores de las luces', 'sl');
  out.push(title(cx, 'Sectores de las luces (Regla 21)'));
  const R = 115;
  const sector = (a, b, color, r = R, op = 0.28) => {
    const [x1, y1] = pol(cx, cy, a, r);
    const [x2, y2] = pol(cx, cy, b, r);
    const large = (b - a + 360) % 360 > 180 ? 1 : 0;
    return `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)}Z" fill="${color}" opacity="${op}" stroke="${color}"/>`;
  };
  if (luz === 'todas' || luz === 'tope') out.push(sector(-112.5, 112.5, '#e5e7eb', R, 0.35));
  if (luz === 'todas' || luz === 'costados') out.push(sector(0, 112.5, '#16a34a', R - 20, 0.45), sector(-112.5, 0, '#dc2626', R - 20, 0.45));
  if (luz === 'todas' || luz === 'alcance') out.push(sector(112.5, 247.5, '#fde68a', R - 10, 0.5));
  out.push(`<path d="M${cx},${cy - 26} L${cx + 10},${cy - 6} L${cx + 9},${cy + 22} L${cx - 9},${cy + 22} L${cx - 10},${cy - 6}Z" fill="${C.g}"/>`);
  const t1 = pol(cx, cy, 112.5, R + 12);
  const t2 = pol(cx, cy, -112.5, R + 12);
  out.push(lbl(t1[0], t1[1] + 4, '22,5° a popa del través', null, 'end'), lbl(t2[0], t2[1] + 4, '', null, 'start'));
  out.push(lbl(cx, 46, 'tope 225°', null, 'middle'), lbl(cx + 52, cy - 30, 'verde 112,5°', 'm'), lbl(cx - 52, cy - 30, 'roja 112,5°', 'r', 'end'), lbl(cx, cy + 82, 'alcance 135°', null, 'middle'));
  // un observador que da la vuelta al barco
  out.push(`<circle r="6" fill="#facc15" stroke="#92400e"><animateMotion dur="12s" repeatCount="indefinite" path="M${cx},${cy - R - 20} A${R + 20},${R + 20} 0 1 1 ${cx - 0.1},${cy - R - 20}"/></circle>`);
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Tope: blanca, 225° hacia proa. Costados: verde a estribor y roja a babor, 112,5° cada una, desde la proa hasta 22,5° a popa del través. Alcance: blanca, 135° hacia popa. Desde el sector de alcance ya no ves los costados: estás alcanzando.' };
}

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
