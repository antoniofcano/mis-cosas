// Ilustraciones de seguridad y maniobra: estabilidad (G, B, M, GZ), movimientos del barco, amarras,
// patrones de búsqueda, hombre al agua, fuego (tetraedro y clases) y la jerarquía de la Regla 18.

const C = { v: '#2563eb', m: '#16a34a', a: '#d97706', r: '#dc2626', p: '#7c3aed', g: '#64748b' };
const defs = (id) => `<defs>${Object.entries(C).map(([k, c]) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${c}"/></marker>`).join('')}</defs>`;
const open = (W, H, label, id) => [`<svg viewBox="0 0 ${W} ${H}" class="il" role="img" aria-label="${label}">`, `<rect width="${W}" height="${H}" rx="10" class="il-panel"/>`, defs(id)];
const title = (x, t) => `<text x="${x}" y="22" class="il-title">${t}</text>`;
const lbl = (x, y, t, c = null, anchor = 'start', extra = '') => `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="il-lbl" text-anchor="${anchor}" ${c ? `style="fill:${C[c]}"` : ''} ${extra}>${t}</text>`;
const arrow = (x1, y1, x2, y2, c, id, w = 2.4) => `<line x1="${(+x1).toFixed(1)}" y1="${(+y1).toFixed(1)}" x2="${(+x2).toFixed(1)}" y2="${(+y2).toFixed(1)}" stroke="${C[c]}" stroke-width="${w}" marker-end="url(#${id}-${c})"/>`;

// Estabilidad transversal: ahora es interactiva, en src/illustrations/interactivas/estabilidad.js.

// ---------------------------------------------------------------------------
// Movimientos del barco. spec: { tipo:'movimiento', mov:'balance'|'cabezada'|'guinada' }

export function movimientoIllustration(spec) {
  const mov = spec.mov ?? 'balance';
  const W = 300;
  const H = 200;
  const out = open(W, H, 'Movimientos del barco', 'mv');
  const T = { balance: 'Balance (de banda a banda)', cabezada: 'Cabezada (proa arriba y abajo)', guinada: 'Guiñada (la proa a un lado y otro)' };
  out.push(title(150, T[mov]));
  if (mov === 'guinada') {
    out.push(`<g><path d="M150,50 Q170,70 168,120 L160,165 L140,165 L132,120 Q130,70 150,50Z" fill="${C.g}" opacity=".7"/><animateTransform attributeName="transform" type="rotate" values="-14 150 120;14 150 120;-14 150 120" dur="4s" repeatCount="indefinite"/></g>`);
    out.push(lbl(150, H - 10, 'vista desde arriba', null, 'middle'));
  } else if (mov === 'balance') {
    out.push(`<rect x="0" y="120" width="${W}" height="80" fill="#38bdf8" opacity=".3"/>`);
    out.push(`<g><path d="M90,100 L210,100 L200,140 L170,160 L130,160 L100,140Z" fill="${C.g}" opacity=".7"/><line x1="150" y1="100" x2="150" y2="40" stroke="${C.g}" stroke-width="3"/><animateTransform attributeName="transform" type="rotate" values="-16 150 120;16 150 120;-16 150 120" dur="4s" repeatCount="indefinite"/></g>`);
    out.push(lbl(150, H - 10, 'visto de proa', null, 'middle'));
  } else {
    out.push(`<rect x="0" y="125" width="${W}" height="75" fill="#38bdf8" opacity=".3"/>`);
    out.push(`<g><path d="M50,105 L250,105 L235,145 L70,145Z" fill="${C.g}" opacity=".7"/><line x1="150" y1="105" x2="150" y2="45" stroke="${C.g}" stroke-width="3"/><animateTransform attributeName="transform" type="rotate" values="-9 150 125;9 150 125;-9 150 125" dur="4s" repeatCount="indefinite"/></g>`);
    out.push(lbl(150, H - 10, 'visto de costado', null, 'middle'));
  }
  out.push('</svg>');
  const cap = { balance: 'El balance es el movimiento de escora alternativo a una y otra banda; lo provoca sobre todo la mar de través.', cabezada: 'La cabezada (o arfada) es el sube y baja alternativo de proa y popa; lo provoca la mar de proa o de popa.', guinada: 'La guiñada es el desvío de la proa a uno y otro lado del rumbo; es típica con mar de popa o de aleta.' };
  return { svg: out.join(''), caption: cap[mov] };
}

// ---------------------------------------------------------------------------
// Amarras de un barco atracado. spec: { tipo:'amarras', resaltar?: 'largo-proa'|'esprin-proa'|'traves'|'esprin-popa'|'largo-popa' }

export function amarrasIllustration(spec) {
  const hl = spec.resaltar;
  const W = 320;
  const H = 210;
  const out = open(W, H, 'Amarras', 'am');
  out.push(title(160, 'Amarras (vista desde arriba)'));
  out.push(`<rect x="0" y="150" width="${W}" height="60" fill="#a16207" opacity=".75"/>`, lbl(160, 192, 'MUELLE', null, 'middle', 'style="fill:#fff" font-weight="700"'));
  // barco con la proa a la derecha, costado de estribor al muelle
  out.push(`<path d="M70,80 L220,80 Q275,80 290,108 Q275,136 220,136 L70,136Z" fill="${C.g}" opacity=".65" stroke="${C.g}"/>`, lbl(270, 112, 'proa', null, 'end'));
  const bol = { a: 30, b: 120, c: 170, d: 210, e: 300 };
  const L = [
    ['largo-popa', 76, 132, bol.a, 'Largo de popa'],
    ['esprin-popa', 100, 136, bol.c, 'Esprín de popa'],
    ['traves', 180, 136, 180, 'Través'],
    ['esprin-proa', 250, 130, bol.b, 'Esprín de proa'],
    ['largo-proa', 282, 116, bol.e, 'Largo de proa'],
  ];
  for (const [k, x, y, qx, name] of L) {
    const on = !hl || hl === k;
    out.push(`<line x1="${x}" y1="${y}" x2="${qx}" y2="152" stroke="${on ? C.r : C.g}" stroke-width="${on ? 2.6 : 1.4}" opacity="${on ? 1 : 0.5}"/><circle cx="${qx}" cy="154" r="4" fill="currentColor"/>`);
    if (on) out.push(lbl(Math.min(Math.max((x + qx) / 2, 40), 280), hl ? 70 : 0, hl ? name : '', 'r', 'middle', 'font-weight="700"'));
  }
  if (!hl) L.forEach(([, , , , name], i) => out.push(lbl(14 + (i % 3) * 100, 44 + Math.floor(i / 3) * 14, name, 'r')));
  out.push('</svg>');
  // Qué movimiento impide cada amarra (una línea por amarra; si se resalta una, solo la suya).
  const IMPIDE = {
    'largo-proa': 'Largo de proa: llama hacia proa; impide que el barco retroceda y que la proa se separe del muelle.',
    'esprin-proa': 'Esprín de proa: llama hacia popa; impide que el barco avance.',
    traves: 'Través: perpendicular al muelle; impide que el barco se separe de él.',
    'esprin-popa': 'Esprín de popa: llama hacia proa; impide que el barco retroceda.',
    'largo-popa': 'Largo de popa: llama hacia popa; impide que el barco avance y que la popa se separe del muelle.',
  };
  const lineas = hl ? [IMPIDE[hl]] : Object.values(IMPIDE);
  return { svg: out.join(''), caption: lineas.join('\n') };
}

// ---------------------------------------------------------------------------
// Búsqueda de un náufrago. spec: { tipo:'busqueda', patron:'cuadrado'|'sectores' }

export function busquedaIllustration(spec) {
  const cuad = (spec.patron ?? 'cuadrado') === 'cuadrado';
  const W = 300;
  const H = 280;
  const cx = 150;
  const cy = 155;
  const out = open(W, H, 'Búsqueda', 'bq');
  out.push(title(cx, cuad ? 'Búsqueda en cuadrado expansivo' : 'Búsqueda por sectores'));
  let d;
  if (cuad) {
    const s = 16;
    const pts = [[cx, cy]];
    let [x, y] = [cx, cy];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (let i = 0; i < 12; i++) {
      const len = Math.floor(i / 2 + 1) * s;
      x += dirs[i % 4][0] * len;
      y += dirs[i % 4][1] * len;
      pts.push([x, y]);
    }
    d = `M${pts.map((p) => p.join(',')).join(' L')}`;
  } else {
    const R = 100;
    const P = (deg) => [cx + Math.sin((deg * Math.PI) / 180) * R, cy - Math.cos((deg * Math.PI) / 180) * R];
    // IAMSAR: todos los giros de 120° a estribor → sectores en el orden 0°, 240°, 120°
    const seq = [0, 240, 120].flatMap((a) => [P(a), P(a + 60)]);
    d = `M${cx},${cy} ${seq.map((p, i) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}${i % 2 ? ` L${cx},${cy}` : ''}`).join(' ')}`;
  }
  out.push(`<path d="${d}" fill="none" stroke="${C.v}" stroke-width="2" stroke-dasharray="900" stroke-dashoffset="900"><animate attributeName="stroke-dashoffset" from="900" to="0" dur="8s" repeatCount="indefinite"/></path>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="${C.r}"/>`, lbl(cx + 9, cy + 16, 'datum (última posición)', 'r'));
  out.push('</svg>');
  return {
    svg: out.join(''),
    caption: cuad
      ? 'Desde el punto más probable (datum) se navega en tramos que crecen cada dos giros de 90°: cubre bien un área pequeña cuando la posición se conoce con bastante exactitud.'
      : 'Se pasa varias veces por el datum en tramos radiales, girando 120° al final de cada uno, hasta barrer el círculo por sectores. Es útil cuando el objeto está cerca del datum y el área es pequeña.',
  };
}

// Hombre al agua: en estilo C, en src/illustrations/laminas-c.js.

// ---------------------------------------------------------------------------
// Fuego. spec: { tipo:'fuego', vista:'tetraedro'|'clases' }

/** Clases de fuego: letra, qué arde y color de la lámina. Lo usan la lámina y las tarjetas de memoria. */
export const CLASES_FUEGO = [['A', 'Sólidos (madera, tela, papel)', '#16a34a'], ['B', 'Líquidos (combustible, pintura)', '#dc2626'], ['C', 'Gases (butano, propano)', '#2563eb'], ['D', 'Metales', '#d97706'], ['F', 'Aceites de cocina', '#7c3aed']];

export function fuegoIllustration(spec) {
  const W = 320;
  const H = 240;
  const out = open(W, H, 'Fuego', 'fu');
  if ((spec.vista ?? 'tetraedro') === 'clases') {
    out.push(title(160, 'Clases de fuego'));
    const rows = CLASES_FUEGO;
    rows.forEach(([k, t, c], i) => {
      const y = 50 + i * 36;
      out.push(`<rect x="24" y="${y - 18}" width="30" height="26" rx="5" fill="${c}"/><text x="39" y="${y}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${k}</text>`, lbl(66, y - 2, t, null, 'start', 'font-size="12"'));
    });
    out.push('</svg>');
    return { svg: out.join(''), caption: 'Cada clase pide su agente. El agua a chorro sirve para sólidos (A), pero no para líquidos inflamables (los esparce) ni con tensión eléctrica; el polvo polivalente ABC es el extintor habitual a bordo. Algunos temarios antiguos hablan de clase E (eléctricos): hoy no es una clase, sino un riesgo a tener en cuenta al elegir el agente.' };
  }
  out.push(title(160, 'Tetraedro del fuego'));
  const P = { t: [160, 46], l: [70, 200], r: [250, 200], c: [175, 150] };
  const face = (a, b, c, col, op) => `<path d="M${P[a].join(',')} L${P[b].join(',')} L${P[c].join(',')}Z" fill="${col}" opacity="${op}" stroke="currentColor" stroke-width="1"/>`;
  out.push(face('t', 'l', 'c', '#f97316', 0.55), face('t', 'c', 'r', '#ef4444', 0.55), face('l', 'c', 'r', '#facc15', 0.5));
  out.push(lbl(100, 112, 'combustible', null, 'end', 'font-weight="700"'), lbl(214, 112, 'oxígeno', null, 'start', 'font-weight="700"'), lbl(160, 222, 'calor', null, 'middle', 'font-weight="700"'), lbl(178, 140, 'reacción en cadena', null, 'start'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Para que haya fuego hacen falta los cuatro: combustible, comburente (oxígeno), calor y la reacción en cadena. Se apaga quitando uno: enfriando, sofocando, eliminando el combustible o inhibiendo la reacción.' };
}

// ---------------------------------------------------------------------------
// Jerarquía de la Regla 18. spec: { tipo:'jerarquia' }

export function jerarquiaIllustration() {
  const W = 320;
  const H = 270;
  const out = open(W, H, 'Regla 18', 'jq');
  out.push(title(160, '¿Quién se aparta de quién? (Regla 18)'));
  const rows = [
    ['Sin gobierno · maniobra restringida', 'r'],
    ['Restringido por su calado (no estorbar)', 'p'],
    ['Pescando', 'a'],
    ['Vela', 'm'],
    ['Propulsión mecánica', 'v'],
  ];
  rows.forEach(([t, c], i) => {
    const y = 48 + i * 42;
    const w = 150 + i * 30;
    out.push(`<rect x="${160 - w / 2}" y="${y}" width="${w}" height="30" rx="6" fill="${C[c]}" opacity=".2" stroke="${C[c]}"/>`, lbl(160, y + 19, t, c, 'middle', 'font-weight="700"'));
  });
  out.push(arrow(300, 240, 300, 60, 'g', 'jq', 2), lbl(296, 254, 'se aparta de los de arriba', 'g', 'end'));
  out.push('</svg>');
  return { svg: out.join(''), caption: 'Cada uno se mantiene apartado de los que están por encima. Excepciones: el que alcanza siempre se aparta (Regla 13), y en canales angostos y dispositivos de separación mandan las Reglas 9 y 10.' };
}
