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

// Movimientos del barco: ahora en estilo C, en src/illustrations/seguridad-c.js.

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

// Patrones de búsqueda: ahora en estilo C, en src/illustrations/seguridad-c.js.

export const CLASES_FUEGO = [['A', 'Sólidos (madera, tela, papel)', '#16a34a'], ['B', 'Líquidos (combustible, pintura)', '#dc2626'], ['C', 'Gases (butano, propano)', '#2563eb'], ['D', 'Metales', '#d97706'], ['F', 'Aceites de cocina', '#7c3aed']];

// Tetraedro y clases de fuego: ahora en estilo C, en src/illustrations/seguridad-c.js.

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
